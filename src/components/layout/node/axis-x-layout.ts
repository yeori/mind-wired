import type { PositionParam, LayoutParam, NodeLayoutContext } from "..";
import { type NodeUI } from "../../node/node-ui";
import { type INodeLayoutManager } from "../node-layout-manager";

/**
 *
 */
export class XAxisNodeLayout implements INodeLayoutManager {
  constructor(readonly layoutContext: NodeLayoutContext) {}
  get name() {
    return "X-AXIS";
  }
  /**
   * reflective layout manager relative to parent
   *
   */
  private _reverseXPos(node: NodeUI, context: LayoutParam) {
    const { x, y } = node;
    node.setPos(-x, y);
    const manager = this.layoutContext.getLayoutManager(node.layout);
    manager.doLayout(node, context);
  }
  doLayout = (nodeUI: NodeUI, context: LayoutParam) => {
    const { dir } = context;
    if (!dir) {
      return;
    }
    if (dir.updated("LR") || dir.updated("RL")) {
      nodeUI.children((childUI: NodeUI) => {
        this._reverseXPos(childUI, context);
      });
    }
  };
  setPosition = (nodeUI: NodeUI, context: PositionParam) => {
    const { baseNode } = context;
    const heading = baseNode
      ? baseNode.getHeading()
      : nodeUI.parent.getHeading();
    const rightSide = heading.cwy <= 180;
    let x = 0;
    let y = 0;
    let halfWidth = nodeUI.dimension(true).width / 2;
    if (baseNode) {
      const rect = baseNode.dimension(true);
      if (rightSide) {
        x = rect.left + halfWidth;
      } else {
        x = rect.right - halfWidth;
      }
      y = rect.bottom + 20;
    } else {
      const rect = nodeUI.parent.dimension(true);
      const offset = context.offset + halfWidth;
      if (rightSide) {
        x = rect.width / 2 + offset;
      } else {
        x = -rect.width / 2 - offset;
      }
    }

    // const { baseNode, rect } = context;

    nodeUI.setPos(x, y);
  };
}
