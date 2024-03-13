/**
 * Default layout manager
 * It does nothing, keeping all nodes in their position.
 */

import { type NodeLayoutContext } from "..";
import { type NodeUI } from "../../node/node-ui";
import { INodeLayoutManager } from "../node-layout-manager";

export class DefaultNodeLayout implements INodeLayoutManager {
  constructor(readonly layoutContext: NodeLayoutContext) {}
  doLayout(nodeUI: NodeUI) {}
  setPosition() {}
}
