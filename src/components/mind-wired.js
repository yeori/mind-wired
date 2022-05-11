import { EVENT } from "../service/event-bus";
import CanvasUI from "./canvas-ui";
import EdgeUI from "./edge-ui";
import NodeUI from "./node-ui";
import layoutManager from "./layout";
import Direction from "./direction";
import selection from "./selection";
import { NodeEditing } from "./editing";
import { dom } from "../service";

const repaintTree = (mwd, node) => {
  mwd.canvas.repaint(node);
  node.subs.forEach((childNode) => {
    repaintTree(mwd, childNode);
  });
};
/**
 * captures current pos(x,y) and direction for each nodes
 * @param {[NodeUI]} nodes
 */
const capatureDragData = (nodes) =>
  nodes.map((node) => {
    return {
      node,
      pos: { x: node.x, y: node.y },
      dir: new Direction(node),
    };
  });

class MindWired {
  /**
   *
   * @param {Configuration} configuration (config.js)
   */
  constructor(config) {
    this.config = config;
    config.mindWired = () => this;
    config.getCanvas = () => this.canvas;

    this.canvas = new CanvasUI(config);
    this.nodeSelectionModel = selection.createSelectionModel("node", config);
    this.nodeEditor = new NodeEditing(config);
    // install reverse dependency

    this.config.listen(EVENT.DRAG.VIEWPORT, (baseOffset) => {
      this.config.setOffset(baseOffset);
      // this.repaint();
      this.canvas.repaintNodeHolder();
      this.edgeUI.repaint();
    });
    this.draggingNodes = null;
    this.config.listen(EVENT.DRAG.NODE, (e) => {
      if (e.before) {
        const node = this.rootUI.find((node) => node.uid === e.nodeId);
        const nodes = this.nodeSelectionModel.getNodes();
        this.draggingNodes = capatureDragData(nodes);
      } else {
        this.draggingNodes.forEach((dragging) => {
          const { node, dir, pos } = dragging;
          dir.capture();
          node.setPos(e.x + pos.x, e.y + pos.y);
          layoutManager.layout(node, { dir, layoutManager });
          repaintTree(this, node);
        });
        this.edgeUI.repaint();
      }
    });
    this.config.listen(EVENT.EDIT.NODE, ({ editing, nodeUI }) => {
      // console.log("[edit]", nodeUI);
      if (editing) {
        this.nodeEditor.edit(nodeUI);
      } else {
        this.nodeEditor.close();
      }
    });
  }
  isEditing() {
    return this.nodeEditor.isEditing();
  }
  nodes(elems) {
    this.rootUI = NodeUI.virtualRoot(elems, this.config);
    this.edgeUI = new EdgeUI(this.config, this.rootUI, this.canvas);
    this.repaint();
  }
  findNode(predicate) {
    return this.rootUI.find(predicate);
  }
  addNode(parentNode, nodeData) {
    const data = {
      model: nodeData.model,
      view: nodeData.view,
    };
    if (!data.view) {
      data.view = {
        x: 100,
        y: -100,
      };
    }
    const nodeUI = new NodeUI(data, this.config);
    parentNode.addChild(nodeUI);
    // this.canvas.repaint(nodeUI);
    this.canvas.regsiterNode(nodeUI);

    if (nodeData.siblingNode) {
      const rect = dom.domRect(nodeData.siblingNode.$bodyEl);
      layoutManager.setPosition(nodeUI, {
        baseNode: nodeData.siblingNode,
        rect,
      });
    }
    this.config.emit(EVENT.NEW.NODE, nodeUI);
    this.config.emit(EVENT.SELECTION.NODE, { node: nodeUI });
    this.nodeEditor.edit(nodeUI);
  }
  repaint() {
    this.canvas.repaintNodeHolder();
    layoutManager.layout(this.rootUI, { dir: null });
    repaintTree(this, this.rootUI);
    this.edgeUI.repaint();
  }
}

export { MindWired };
