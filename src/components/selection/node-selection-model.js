/**
 *
 */
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
  }
}
export default NodeSelectionModel;
