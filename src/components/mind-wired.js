import CanvasUI from "./canvas-ui";
import EdgeUI from "./edge-ui";
import NodeUI from "./node-ui";

const repaintTree = (mwd, node) => {
  mwd.canvas.repaint(node);
  node.subs.forEach((childNode) => {
    repaintTree(mwd, childNode);
  });
};
class MindWired {
  constructor(config) {
    this.config = config;
    this.canvas = new CanvasUI(config);
  }
  nodes(elems) {
    this.rootUI = NodeUI.virtualRoot(elems, this.config);
    this.edgeUI = new EdgeUI(this.config, this.rootUI, this.canvas);
    this.repaint();
  }
  repaint() {
    // repaintTree(this, this.rootUI, {
    //   x: -this.rootUI.x,
    //   y: -this.rootUI.y,
    // });
    repaintTree(this, this.rootUI);
    this.edgeUI.repaint();
    // this.canvas.repaint(this.elems);
  }
}

export { MindWired };
