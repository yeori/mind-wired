import type { PositionParam, LayoutParam, NodeLayoutContext } from "..";
import { type NodeUI } from "../../node/node-ui";
import { type INodeLayoutManager } from "../node-layout-manager";

/**
 *
 */
export class XAxisNodeLayout implements INodeLayoutManager {
  constructor(readonly layoutContext: NodeLayoutContext) {}
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
    const { baseNode, rect } = context;
    const x = baseNode.x;
    const y = baseNode.y + rect.height + 10;
    nodeUI.setPos(x, y);
  };
}
