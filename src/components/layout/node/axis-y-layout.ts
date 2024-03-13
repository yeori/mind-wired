import type { LayoutParam, NodeLayoutContext, PositionParam } from "..";
import { type NodeUI } from "../../node/node-ui";
import { INodeLayoutManager } from "../node-layout-manager";

export class YAxisNodeLayout implements INodeLayoutManager {
  constructor(readonly layoutContext: NodeLayoutContext) {}
  /**
   * reflective layout manager relative to parent
   *
   */
  _reverseYPos(node: NodeUI, context: LayoutParam) {
    const { x, y } = node;
    node.setPos(x, -y);
    const manager = this.layoutContext.getLayoutManager(node.layout);
    manager.doLayout(node, context);
  }
  doLayout = (nodeUI: NodeUI, context: LayoutParam) => {
    const { dir } = context;
    if (!dir) {
      return;
    }
    if (dir.updated("TB") || dir.updated("BT")) {
      nodeUI.children((childUI: NodeUI) => {
        this._reverseYPos(childUI, context);
      });
    }
  };
  setPosition = (nodeUI: NodeUI, context: PositionParam) => {
    const { baseNode, rect } = context;
    const x = baseNode.x + rect.width + 10;
    const y = baseNode.y;
    nodeUI.setPos(x, y);
  };
}
