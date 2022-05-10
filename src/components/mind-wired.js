import { EVENT } from "../service/event-bus";
import CanvasUI from "./canvas-ui";
import EdgeUI from "./edge-ui";
import NodeUI from "./node-ui";
import layoutManager from "./layout";
import Direction from "./direction";
import selection from "./selection";

const repaintTree = (mwd, node) => {
  mwd.canvas.repaint(node);
  node.subs.forEach((childNode) => {
    repaintTree(mwd, childNode);
  });
};
class MindWired {
  /**
   *
   * @param {Configuration} configuration (config.js)
   */
  constructor(config) {
    this.config = config;
    this.canvas = new CanvasUI(config);
    this.nodeSelectionModel = selection.createSelectionModel("node", config);
    // install reverse dependency
    config.mindWired = () => this;
    this.config.listen(EVENT.DRAG.VIEWPORT, (baseOffset) => {
      this.config.setOffset(baseOffset);
      // this.repaint();
      this.canvas.repaintNodeHolder();
      this.edgeUI.repaint();
    });
    this.draggingNode = null;
    this.config.listen(EVENT.DRAG.NODE, (e) => {
      if (e.before) {
        const node = this.rootUI.find((node) => node.uid === e.nodeId);
        this.draggingNode = {
          target: node,
          dir: new Direction(node),
          pos: { x: node.x, y: node.y },
        };
      } else {
        const { target, dir, pos } = this.draggingNode;
        dir.capture();
        target.setPos(e.x + pos.x, e.y + pos.y);
        layoutManager.layout(target, { dir, layoutManager });
        repaintTree(this, target);
        this.edgeUI.repaint();
        if (e.after) {
          target.dir = null;
        }
      }
    });
  }
  nodes(elems) {
    this.rootUI = NodeUI.virtualRoot(elems, this.config);
    this.edgeUI = new EdgeUI(this.config, this.rootUI, this.canvas);
    this.repaint();
  }
  findNode(predicate) {
    return this.rootUI.find(predicate);
  }
  repaint() {
    this.canvas.repaintNodeHolder();
    layoutManager.layout(this.rootUI, { dir: null });
    repaintTree(this, this.rootUI);
    this.edgeUI.repaint();
  }
}

export { MindWired };
