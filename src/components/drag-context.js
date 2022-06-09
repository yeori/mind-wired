import Direction from "./direction";

const capturePos = (posMap, nodeUI) => {
  posMap.set(nodeUI, nodeUI.getPos());
  nodeUI.subs.forEach((childUI) => capturePos(posMap, childUI));
};

class Capture {
  constructor(nodeUI, posMap) {
    this.node = nodeUI;
    this.pos = nodeUI.getPos();
    this.dir = new Direction(nodeUI);
    capturePos(posMap, nodeUI);
  }
}
export default class DragContext {
  constructor() {
    this.capture = new Map(); //<NodeUI, Capture>
    this.posMap = new Map();
  }
  prepareDnd(nodes) {
    this.clear();
    nodes
      .filter((node) => !node.isRoot())
      .forEach((node) => {
        this.capture.set(node, new Capture(node, this.posMap));
      });
  }
  eachCapture(callback) {
    for (let capture of this.capture.values()) {
      callback(capture);
    }
  }
  getUpdatedNodes() {
    let updated = [];
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
