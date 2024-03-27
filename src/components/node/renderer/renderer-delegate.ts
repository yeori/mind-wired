import {
  INodeRenderer,
  NodeState,
  type NodeUI,
  type UserDefinedRenderer,
} from "..";
import type { NodeRenderingContext } from "../node-rendering-context";
import type { ModelSpec, NodeModelType } from "../node-type";

export class RenderingDelegate<T> implements INodeRenderer {
  constructor(
    readonly name: string,
    readonly renderingContext: NodeRenderingContext,
    readonly delegate: UserDefinedRenderer<T>
  ) {}
  private _pickRenderer(): INodeRenderer {
    const ctx = this.renderingContext;
    const { text, iconBadge, thumbnail } = this.delegate;
    let name: NodeModelType = "text";
    if (text) {
      name = "text";
    } else if (iconBadge) {
      name = "icon-badge";
    } else if (thumbnail) {
      name = "thumbnail";
    }
    return ctx.getRenderer(name);
  }
  install(model: ModelSpec, parentEl: HTMLElement): void {
    const renderer = this._pickRenderer();
    renderer.install(model, parentEl);
  }
  render(model: ModelSpec, parentEl: HTMLElement, state: NodeState): void {
    const renderer = this._pickRenderer();
    renderer.render(model, parentEl, state);
  }
  editor?(node: NodeUI): void {
    throw new Error("Method not implemented.");
  }
}
