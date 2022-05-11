/**
 *
 */
import { dom } from "../../service";
import { EVENT } from "../../service/event-bus";
const clearSelection = (nodeMap) => {
  for (let [_, nodeUI] of nodeMap) {
    nodeUI.setSelected(false);
  }
  nodeMap.clear();
};
class NodeSelectionModel {
  /**
   *
   * @param {Configuration} config (see config.js)
   */
  constructor(config) {
    this.config = config;
    this.nodeMap = new Map(); // [uid:strng, NodeUI]
    this.config.listen(EVENT.SELECTION.NODE, ({ node, append }) => {
      const selected = this.nodeMap.has(node.uid);
      if (append) {
        this.nodeMap.set(node.uid, node);
        node.setSelected(true);
      } else if (!selected) {
        clearSelection(this.nodeMap);
        this.nodeMap.set(node.uid, node);
        node.setSelected(true); // toggling
      } else {
      }
    });
    this.config.listen(EVENT.CLICK.VIEWPORT, () => {
      clearSelection(this.nodeMap);
    });

    dom.event.keyup(document, (e) => {
      if (this.isEmpty()) {
        return;
      }
      const { code } = e;
      const [nodeUI] = [...this.nodeMap.values()];
      const editing = nodeUI.isEditingState();
      if ("Space" === code && !editing) {
        e.stopPropagation();
        this.config.emit(EVENT.EDIT.NODE, { editing: true, nodeUI });
      } else if ("Escape" === code) {
        this.config.emit(EVENT.EDIT.NODE, { editing: false, nodeUI });
      }
    });
    dom.event.keydown(document, (e) => {
      if (this.isEmpty()) {
        return;
      }
      e.stopPropagation();
      e.stopImmediatePropagation();
      const { code } = e;
      const [nodeUI] = [...this.nodeMap.values()];
      const editing = nodeUI.isEditingState();
      if ("Enter" === code && !editing) {
        const mwd = this.config.mindWired();
        mwd.addNode(nodeUI.parent, {
          model: { text: "TITLE" },
          siblingNode: nodeUI,
        });
      }
    });
  }
  isEmpty() {
    return this.nodeMap.size === 0;
  }
  getNodes() {
    return [...this.nodeMap.values()];
  }
}
export default NodeSelectionModel;
