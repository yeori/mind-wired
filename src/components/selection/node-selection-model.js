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
    this.config.listen(EVENT.SELECTION.NODE, ({ node }) => {
      const selected = this.nodeMap.has(node.uid);
      if (!selected) {
        clearSelection(this.nodeMap);
        this.nodeMap.set(node.uid, node);
        node.setSelected(!selected); // toggling
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
      if ("Space" === code && !nodeUI.isEditingState()) {
        e.stopPropagation();
        this.config.emit(EVENT.EDIT.NODE, { editing: true, nodeUI });
      } else if ("Escape" === code) {
        this.config.emit(EVENT.EDIT.NODE, { editing: false, nodeUI });
      }
    });
  }
  isEmpty() {
    return this.nodeMap.size === 0;
  }
}
export default NodeSelectionModel;
