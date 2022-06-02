import { EVENT } from "../../service/event-bus";

export default class NodeEditing {
  constructor(config) {
    this.config = config;
    this.node = null;
    this.config.listen(EVENT.VIEWPORT.CLICKED, () => {
      this.close();
    });
    this.config.listen(EVENT.NODE.SELECTED, ({ node }) => {
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
    const renderingContext = this.config.getNodeRenderer();
    const nodeRenderer = renderingContext.getRenderer(nodeUI.model.type);
    nodeRenderer.editor(nodeUI);
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
