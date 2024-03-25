import type { LayoutParam, NodeLayoutContext, PositionParam } from "..";
import { type NodeUI } from "../../node/node-ui";
import { INodeLayoutManager } from "../node-layout-manager";
// import xLayout from "./axis-x-layout";
// import yLayout from "./axis-y-layout";

export class XYAxisNodeLayout implements INodeLayoutManager {
  constructor(readonly layoutContext: NodeLayoutContext) {}
  get name() {
    return "XY-AXIS";
  }
  doLayout(nodeUI: NodeUI, context: LayoutParam) {
    const { dir } = context;
    if (!dir) {
      return;
    }
    const xLayout = this.layoutContext.getLayoutManager({ type: "X-AXIS" });
    xLayout.doLayout(nodeUI, context);
    const yLayout = this.layoutContext.getLayoutManager({ type: "Y-AXIS" });
    yLayout.doLayout(nodeUI, context);
  }
  setPosition = (nodeUI: NodeUI, context: PositionParam) => {
    const xLayout = this.layoutContext.getLayoutManager({ type: "X-AXIS" });
    xLayout.setPosition(nodeUI, context);
  };
}
