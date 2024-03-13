import { DefaultNodeLayout } from "./node/default-layout";
import { XAxisNodeLayout } from "./node/axis-x-layout";
import { YAxisNodeLayout } from "./node/axis-y-layout";
import { XYAxisNodeLayout } from "./node/axis-xy-layout";
import { type NodeUI } from "../node/node-ui";
import { type NodeLayoutType, type NodeLayout } from "../node/node-type";
import { INodeLayoutManager } from "./node-layout-manager";
import { type Direction } from "../direction";

const layoutMap = new Map<NodeLayoutType, INodeLayoutManager>();

export type LayoutParam = { dir: Direction };
export type PositionParam = { baseNode: NodeUI; rect: DOMRect };
export class NodeLayoutContext {
  constructor() {
    layoutMap.set("DEFAULT", new DefaultNodeLayout(this));
    layoutMap.set("X-AXIS", new XAxisNodeLayout(this));
    layoutMap.set("Y-AXIS", new YAxisNodeLayout(this));
    layoutMap.set("XY-AXIS", new XYAxisNodeLayout(this));
  }
  getLayoutManager(layout: NodeLayout): INodeLayoutManager {
    const layoutName = layout ? layout.type : "DEFAULT";
    return layoutMap.get(layoutName);
  }
  setPosition(nodeUI: NodeUI, context: PositionParam) {
    const { layout } = nodeUI;
    const manager = this.getLayoutManager(layout);
    manager.setPosition(nodeUI, context);
  }
  layout(nodeUI: NodeUI, context: LayoutParam) {
    const { layout } = nodeUI;
    const manager = this.getLayoutManager(layout);
    manager.doLayout(nodeUI, context);
  }
}
