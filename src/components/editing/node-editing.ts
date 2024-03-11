import { EVENT } from "../../service/event-bus";
import type Configuration from "../config";
import { type NodeUI } from "../node/node-ui";
// FIXME - 편집창 관리를 NodeEditing에서 해야함.
// 현재는 PlainTextRenderer.editor 에서 편집창을 관리함.
export default class NodeEditing {
  config: Configuration;
  node: NodeUI | undefined;
  constructor(config: Configuration) {
    this.config = config;
    this.node = undefined;
    this.config.listen(EVENT.VIEWPORT.CLICKED, () => {
      this.close();
    });
    this.config.listen(EVENT.NODE.SELECTED, ({ node }) => {
      if (this.node !== node) {
        this.close();
      }
    });
  }
  isEditing() {
    return !!this.node;
  }
  edit(nodeUI: NodeUI) {
    if (this.node) {
      this.close();
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
    this.node = undefined;
  }
}
