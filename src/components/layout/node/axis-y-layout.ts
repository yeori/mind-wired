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
    const { baseNode } = context;
    const heading = baseNode
      ? baseNode.getHeading()
      : nodeUI.parent.getHeading();
    const topSide = heading.ccwx <= 180;
    let x = 0;
    let y = 0;
    const nodeRect = nodeUI.dimension(true);
    let halfHeight = nodeRect.height / 2;
    if (baseNode) {
      const rect = baseNode.dimension(true);
      x = rect.cx + (rect.width + nodeRect.width + context.offset) / 2;
      if (topSide) {
        y = rect.bottom - halfHeight;
      } else {
        y = rect.top + halfHeight;
      }
    } else {
      const rect = nodeUI.parent.dimension(true);
      const offset = context.offset + halfHeight;
      x = 0;
      if (topSide) {
        y = -rect.height / 2 - offset;
      } else {
        y = rect.height / 2 + offset;
      }
    }
    nodeUI.setPos(x, y);
  };
}
