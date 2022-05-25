import { EVENT } from "../service/event-bus";
import CanvasUI from "./canvas-ui";
import EdgeUI from "./edge-ui";
import NodeUI from "./node-ui";
import layoutManager from "./layout";
import Direction from "./direction";
import selection from "./selection";
import { NodeEditing } from "./editing";
import nodeRenderer from "./node";
import { dom } from "../service";

const repaintTree = (mwd, node) => {
  node.repaint();
  node.subs.forEach((childNode) => {
    repaintTree(mwd, childNode);
  });
};
const updateLevelClass = (nodeUI, method, config) => {
  const className = config.nodeLevelClassName(nodeUI);
  dom.clazz[method](nodeUI.$bodyEl, className);
  nodeUI.subs.forEach((childUI) => updateLevelClass(childUI, method, config));
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

    this.canvas = new CanvasUI(config);
    config.getCanvas = () => this.canvas;

    this.nodeRenderingContext = nodeRenderer.install(this.canvas);
    config.getNodeRenderer = () => this.nodeRenderingContext;

    this.nodeSelectionModel = selection.createSelectionModel("node", config);
    this.nodeEditor = new NodeEditing(config);

    this.config.listen(EVENT.DRAG.VIEWPORT, (baseOffset) => {
      this.config.setOffset(baseOffset);
      // this.repaint();
      this.canvas.repaintNodeHolder();
      this.edgeUI.repaint();
    });
    this.draggingNodes = null;
    this.config.listen(EVENT.DRAG.NODE, (e) => {
      if (e.before) {
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
    this.config.listen(EVENT.NODE.EDITING, ({ editing, nodeUI }) => {
      // console.log("[edit]", nodeUI);
      if (editing) {
        this.nodeEditor.edit(nodeUI);
      } else {
        this.nodeEditor.close();
      }
    });
    this.config.listen(EVENT.NODE.FOLDED, ({ node }) => {
      this.canvas.updateFoldingNodes(node);
    });
  }
  isEditing() {
    return this.nodeEditor.isEditing();
  }
  nodes(elems) {
    this.rootUI = NodeUI.build(elems, this.config);
    this.edgeUI = new EdgeUI(this.config, this.rootUI, this.canvas);
    this.repaint();
    return this;
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
        y: 0,
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
    this.config.emit(EVENT.NODE.CREATED, [nodeUI]);
    this.config.emit(EVENT.SELECTION.NODE, { node: nodeUI });
    this.nodeEditor.edit(nodeUI);
  }
  moveNodes(parentNode, childNodes) {
    childNodes.forEach((child) => {
      updateLevelClass(child, "remove", this.config);
      const prevParent = parentNode.addChild(child);
      updateLevelClass(child, "add", this.config);

      this.config.emit(EVENT.NODE.MOVED, { node: child, prevParent });
    });
    parentNode.setFolding(false);
    repaintTree(this, parentNode);
  }
  deleteNodes(nodes) {
    nodes.forEach((node) => {
      const { parent, childNodes } = node;
      // 1. move grand-children to parent
      childNodes.forEach((child) => {
        // keep position
        child.setPos(child.x + node.x, child.y + node.y);
      });
      this.moveNodes(parent, childNodes);
      // 2. delete node(which has no children)
      const deletedChild = node.parent.removeChild(node);
      if (deletedChild) {
        this.canvas.unregisterNode(deletedChild);
        this.config.emit(EVENT.NODE.DELETED, deletedChild);
      }
    });
  }
  getSelectedNodes() {
    return this.nodeSelectionModel.getNodes();
  }
  repaint() {
    this.canvas.repaintNodeHolder();
    layoutManager.layout(this.rootUI, { dir: null });
    repaintTree(this, this.rootUI);
    this.edgeUI.repaint();
  }
  listen(event, callback) {
    this.config.ebus.listen(event, callback);
    return this;
  }
}

export { MindWired };
