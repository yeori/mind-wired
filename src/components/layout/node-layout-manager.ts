import type { PositionParam, LayoutParam } from ".";
import { type NodeUI } from "../node/node-ui";

export interface INodeLayoutManager {
  name: string;
  doLayout(nodeUI: NodeUI, context: LayoutParam): void;
  setPosition(nodeUI: NodeUI, context: PositionParam): void;
}
