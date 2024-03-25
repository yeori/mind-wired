import { DefaultNodeLayout } from "./node/default-layout";
import { XAxisNodeLayout } from "./node/axis-x-layout";
import { YAxisNodeLayout } from "./node/axis-y-layout";
import { XYAxisNodeLayout } from "./node/axis-xy-layout";
import { type NodeUI } from "../node/node-ui";
import { type NodeLayoutType, type NodeLayout } from "../node/node-type";
import { INodeLayoutManager } from "./node-layout-manager";
import { type Direction } from "../direction";
import Configuration from "../config";

export type { INodeLayoutManager };
export type LayoutParam = { dir: Direction };
export type PositionParam = { baseNode: NodeUI; offset: number };
export class NodeLayoutContext {
  private _layoutMap = new Map<NodeLayoutType, INodeLayoutManager>();
  constructor(readonly config: Configuration) {}
  get canvas() {
    return this.config.getCanvas();
  }
  registerLayoutManager(layout: INodeLayoutManager) {
    this._layoutMap.set(layout.name, layout);
  }
  getLayoutManager(layout: NodeLayout): INodeLayoutManager {
    const layoutName = layout ? layout.type : "DEFAULT";
    return this._layoutMap.get(layoutName);
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
  listLayoutManagers(): INodeLayoutManager[] {
    return [...this._layoutMap.values()];
  }
}

export const installDefaultLayoutManagers = (ctx: NodeLayoutContext) => {
  ctx.registerLayoutManager(new DefaultNodeLayout(ctx));
  ctx.registerLayoutManager(new XAxisNodeLayout(ctx));
  ctx.registerLayoutManager(new YAxisNodeLayout(ctx));
  ctx.registerLayoutManager(new XYAxisNodeLayout(ctx));
};
