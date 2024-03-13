import { type Point } from "../service/geom";
import { Direction } from "./direction";
import { type NodeUI } from "./node/node-ui";

const capturePos = (posMap: Map<NodeUI, Point>, nodeUI: NodeUI) => {
  posMap.set(nodeUI, nodeUI.getPos());
  nodeUI.subs.forEach((childUI) => capturePos(posMap, childUI));
};

export class Capture {
  readonly pos: Point;
  readonly dir: Direction;
  constructor(readonly node: NodeUI) {
    this.dir = new Direction(node);
    this.pos = node.getPos();
  }
}
export class DragContext {
  readonly capture = new Map<NodeUI, Capture>();
  readonly posMap = new Map<NodeUI, Point>();
  constructor() {}
  prepareDnd(nodes: NodeUI[]) {
    this.clear();
    nodes
      .filter((node) => !node.isRoot())
      .forEach((node) => {
        this.capture.set(node, new Capture(node));
        capturePos(this.posMap, node);
      });
  }
  eachCapture(callback: (capture: Capture) => void) {
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
