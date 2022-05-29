import { EVENT } from "../service/event-bus";
import CanvasUI from "./canvas-ui";
import EdgeUI from "./edge-ui";
import NodeUI from "./node-ui";
import layoutManager from "./layout";
import Direction from "./direction";
import selection from "./selection";
import { NodeEditing } from "./editing";
import nodeRenderer from "./node";
import AlignmentUI from "./alignment/alignment-ui";
import { dom } from "../service";

const exportTree = (config, nodeUI) => {
  const v = nodeUI.config.view;
  const view = {
    x: v.x,
    y: v.y,
  };
  if (nodeUI.isRoot()) {
    view.x = config.ui.offset.x;
    view.y = config.ui.offset.y;
  }
  if (v.layout) {
    view.layout = v.layout;
  }
  if (v.edge) {
    view.edge = v.edge;
  }
  const subs = [];
  nodeUI.subs.forEach((childUI) => {
    subs.push(exportTree(config, childUI));
  });
  return {
    model: nodeUI.model,
    view,
    subs,
  };
};
const repaintTree = (mwd, node, propagate = true) => {
  node.repaint();
  if (propagate) {
    node.subs.forEach((childNode) => {
      repaintTree(mwd, childNode);
    });
  }
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
  nodes
    .filter((node) => !node.isRoot())
    .map((node) => {
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
    this.alignmentUI = new AlignmentUI(config);

    this.config.listen(EVENT.DRAG.VIEWPORT, (baseOffset) => {
      this.config.setOffset(baseOffset);
      // this.repaint();
      this.canvas.repaintNodeHolder();
      this.edgeUI.repaint();
    });
    this.draggingNodes = null;
    this.config.listen(EVENT.DRAG.NODE, (e) => {
      if (e.state === "READY") {
        const nodes = this.nodeSelectionModel.getNodes();
        /*
         * shift@click on nodes redirects dragging to their children
         */
        const dragTargets =
          e.target === "all" ? nodes : nodes.flatMap((node) => node.subs);
        this.draggingNodes = capatureDragData(dragTargets);
        this.alignmentUI.turnOn(this.rootUI, dragTargets);
        this.canvas.drawSelection(nodes);
      } else if (e.state === "DRAG") {
        const acceleration = e.target === "all" ? 1 : 2.5;
        this.draggingNodes.forEach((dragging) => {
          const { node, dir, pos } = dragging;
          dir.capture();
          node.setPos(
            acceleration * e.x + pos.x,
            acceleration * e.y + pos.y,
            false
          );
        });
        this.alignmentUI.doAlign();
        this.draggingNodes.forEach((dragging) => {
          const { node, dir } = dragging;
          layoutManager.layout(node, { dir, layoutManager });
        });
        this.canvas.drawSelection(this.nodeSelectionModel.getNodes());
        this.edgeUI.repaint(!this.config.snapEnabled, false);
      } else if (e.state === "DONE") {
        this.alignmentUI.turnOff();
        this.edgeUI.repaint(true);
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
    this.config.ui.offset.x = this.rootUI.config.view.x;
    this.config.ui.offset.y = this.rootUI.config.view.y;
    this.rootUI.config.view.x = 0;
    this.rootUI.config.view.y = 0;
    this.repaint();
    return this;
  }
  findNode(predicate) {
    return this.rootUI.find(predicate);
  }
  addNode(parentNode, nodeData, option) {
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
    const nodeUI = new NodeUI(data, this.config, parentNode);
    this.canvas.regsiterNode(nodeUI);
    parentNode.addChild(nodeUI);
    if (nodeData.siblingNode) {
      const rect = dom.domRect(nodeData.siblingNode.$bodyEl);
      layoutManager.setPosition(nodeUI, {
        baseNode: nodeData.siblingNode,
        rect,
      });
    }
    nodeUI.repaint();
    // this.canvas.repaint(nodeUI);

    this.config.emit(EVENT.NODE.CREATED, [nodeUI]);
    if (option?.editing || option?.select) {
      this.config.emit(EVENT.SELECTION.NODE, { node: nodeUI });
    }
    if (option?.editing) {
      this.nodeEditor.edit(nodeUI);
    }
  }
  moveNodes(parentNode, nodes) {
    const childNodes = nodes.filter((node) => node.parent !== parentNode);
    childNodes.forEach((child) => {
      updateLevelClass(child, "remove", this.config);
      const prevParent = parentNode.addChild(child);
      updateLevelClass(child, "add", this.config);

      this.config.emit(EVENT.NODE.MOVED, { node: child, prevParent });
    });
    parentNode.setFolding(false);
    repaintTree(this, parentNode);
    this.canvas.drawSelection(nodes);
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
  setLayout(layoutSpec, nodeUI) {
    const targetNode = nodeUI || this.rootUI;
    targetNode.config.view.layout = layoutSpec;
    this.repaint();
  }
  setEdge(edgeSpec, nodeUI) {
    const targetNode = nodeUI || this.rootUI;
    targetNode.config.view.edge = edgeSpec;
    this.repaint(nodeUI);
  }
  repaint(nodeUI) {
    nodeUI = nodeUI || this.rootUI;
    this.canvas.repaintNodeHolder();
    layoutManager.layout(nodeUI, { dir: null });
    repaintTree(this, nodeUI);
    this.edgeUI.repaint();
  }
  listen(event, callback) {
    this.config.ebus.listen(event, callback);
    return this;
  }
  export(type) {
    const node = exportTree(this.config, this.rootUI);
    return Promise.resolve(JSON.stringify(node));
  }
}

export { MindWired };
