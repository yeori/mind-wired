import { Point } from "../service/geom";
import Direction from "./direction";
import { type NodeUI } from "./node/node-ui";

const capturePos = (posMap: Map<NodeUI, Point>, nodeUI: NodeUI) => {
  posMap.set(nodeUI, nodeUI.getPos());
  nodeUI.subs.forEach((childUI) => capturePos(posMap, childUI));
};

class Capture {
  node: NodeUI;
  pos: Point;
  dir: Direction;
  constructor(nodeUI: NodeUI, posMap: Map<NodeUI, Point>) {
    this.node = nodeUI;
    this.pos = nodeUI.getPos();
    this.dir = new Direction(nodeUI);
    capturePos(posMap, nodeUI);
  }
}
export default class DragContext {
  capture: Map<NodeUI, Capture>;
  posMap: Map<NodeUI, Point>;
  constructor() {
    this.capture = new Map(); //<NodeUI, Capture>
    this.posMap = new Map<NodeUI, Point>();
  }
  prepareDnd(nodes: NodeUI[]) {
    this.clear();
    nodes
      .filter((node) => !node.isRoot())
      .forEach((node) => {
        this.capture.set(node, new Capture(node, this.posMap));
      });
  }
  eachCapture(callback: Function) {
    for (let capture of this.capture.values()) {
      callback(capture);
    }
  }
  getUpdatedNodes() {
    let updated = [] as NodeUI[];
    this.posMap.forEach((pos, nodeUI) => {
      if (pos.x !== nodeUI.x || pos.y !== nodeUI.y) {
        updated.push(nodeUI);
      }
    });
    return updated;
  }
  clear() {
    this.capture.clear();
    this.posMap.clear();
  }
}
