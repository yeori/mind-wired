import { EVENT } from "../../service/event-bus";

export default class NodeEditing {
  constructor(config) {
    this.config = config;
    this.node = null;
    this.config.listen(EVENT.CLICK.VIEWPORT, () => {
      this.close();
    });
    this.config.listen(EVENT.SELECTION.NODE, ({ node }) => {
      if (this.node !== node) {
        this.close(this.node);
      }
    });
  }
  isEditing() {
    return !!this.node;
  }
  edit(nodeUI) {
    if (this.node) {
      this.close();
      this.node = null;
    }
    const canvasUI = this.config.getCanvas();
    canvasUI.showNodeEditor(nodeUI, (e) => {
      this.node.setTitle(e.target.value.trim());
      this.close();
    });
    this.node = nodeUI;
    this.node.setEditingState(true);
  }
  close() {
    if (this.node) {
      this.node.setEditingState(false);
      const canvasUI = this.config.getCanvas();
      canvasUI.hideNodeEditor(this.node);
    }
    this.node = null;
  }
}
