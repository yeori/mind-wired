/**
 *
 */
import { dom } from "../../service";
import { EVENT } from "../../service/event-bus";
const clearSelection = (nodeMap) => {
  for (let nodeUI of nodeMap.values()) {
    nodeUI.setSelected(false);
  }
  nodeMap.clear();
};
const skipStateForInsert = (nodes) => {
  if (nodes.length !== 1) {
    return true;
  }
  if (nodes[0].isEditingState()) {
    return true;
  }
  return false;
};
const skipStateForDelete = (nodes) => {
  if (nodes.length === 0) {
    return true;
  }
  // root node cannot be deleted
  const rootNode = nodes.find((node) => node.root);
  return !!rootNode;
};
const appendNode = (selectionModel, parent, sibling) => {
  const mwd = selectionModel.config.mindWired();
  mwd.addNode(parent, {
    model: { text: "TITLE" },
    siblingNode: sibling,
  });
};
const deleteNodes = (selectionModel, nodesToDel) => {
  const mwd = selectionModel.config.mindWired();
  mwd.deleteNodes(nodesToDel);
};
const notifySelection = (selectionModel) => {
  const { config } = selectionModel;
  const nodes = selectionModel.getNodes();
  setTimeout(() => config.emit(EVENT.NODE.SELECTED.CLIENT, { nodes }));
};
class NodeSelectionModel {
  /**
   *
   * @param {Configuration} config (see config.js)
   */
  constructor(config) {
    this.config = config;
    this.nodeMap = new Map(); // [uid:strng, NodeUI]

    const canvasUI = this.config.getCanvas();
    this.config.listen(EVENT.NODE.SELECTED, ({ node, append }) => {
      const selected = this.nodeMap.has(node.uid);
      if (append) {
        this.nodeMap.set(node.uid, node);
        node.setSelected(true);
        notifySelection(this);
      } else if (!selected) {
        clearSelection(this.nodeMap);
        this.nodeMap.set(node.uid, node);
        node.setSelected(true); // toggling
        notifySelection(this);
      } else {
      }
    });
    this.config.listen(EVENT.VIEWPORT.CLICKED, () => {
      clearSelection(this.nodeMap);
      canvasUI.hideSelection();
      notifySelection(this);
    });

    dom.event.keyup(canvasUI.$viewport, (e) => {
      if (this.isEmpty()) {
        return;
      }
      const { code } = e;
      const [nodeUI] = [...this.nodeMap.values()];
      const editing = nodeUI.isEditingState();
      if ("Space" === code && !editing) {
        e.stopPropagation();
        canvasUI.hideSelection();
        this.config.emit(EVENT.NODE.EDITING, { editing: true, nodeUI });
      } else if ("Escape" === code) {
        this.config.emit(EVENT.NODE.EDITING, { editing: false, nodeUI });
      }
    });
    dom.event.keydown(
      canvasUI.$viewport,
      (e) => {
        const nodes = this.getNodes();
        if (skipStateForInsert(nodes)) {
          return;
        }
        e.stopPropagation();
        e.stopImmediatePropagation();
        appendNode(this, nodes[0].parent, nodes[0]);
      },
      "enter"
    );
    dom.event.keydown(
      canvasUI.$viewport,
      (e) => {
        const nodes = this.getNodes();
        if (skipStateForInsert(nodes)) {
          return;
        }
        e.stopPropagation();
        e.stopImmediatePropagation();
        appendNode(this, nodes[0], nodes[0].lastChild());
      },
      "shift@enter"
    );

    dom.event.keydown(
      canvasUI.$viewport,
      (e) => {
        const nodes = this.getNodes();
        if (skipStateForDelete(nodes)) {
          return;
        }
        e.stopPropagation();
        e.stopImmediatePropagation();
        deleteNodes(this, nodes);
        clearSelection(this.nodeMap);
        notifySelection(this);
      },
      "delete"
    );
  }
  isEmpty() {
    return this.nodeMap.size === 0;
  }
  getNodes() {
    return [...this.nodeMap.values()];
  }
}
export default NodeSelectionModel;
