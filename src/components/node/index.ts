import { PlainTextRenderer } from "./renderer/plain-text-renderer";
import { IconBadgeRenderer } from "./renderer/icon-badge-renderer";
import { ThumbnailRenderer } from "./renderer/thumbnail-renderer";
import { NodeRenderingContext } from "./node-rendering-context";
import { LinkRenderer } from "./renderer/link-renderer";
import type { CanvasUI } from "../canvas-ui";
export * from "./node-ui";
import {
  IconBadgeSpec,
  ThumbnailSpec,
  type ModelSpec,
  NodeModelType,
} from "./node-type";
import { type NodeUI } from "./node-ui";

export interface INodeRenderer {
  name: string;
  install(model: ModelSpec, parentEl: HTMLElement): void;
  render(model: ModelSpec, parentEl: HTMLElement): void;
  /**
   * show editor for the given node
   * @param node node to edit
   */
  editor?(node: NodeUI): void;
}

export type UserDefinedRenderer<T> = {
  name: string;
  text?(item: T): string;
  thumbnail?(item: T): ThumbnailSpec;
  iconBadge?(item: T): IconBadgeSpec;
};

export class RenderingDelegate<T> implements INodeRenderer {
  // private _model: ModelSpec;
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
    // const model = this._parseModel(providerModel);
    renderer.install(model, parentEl);
  }
  render(model: ModelSpec, parentEl: HTMLElement): void {
    const renderer = this._pickRenderer();
    renderer.render(model, parentEl);
  }
  editor?(node: NodeUI): void {
    throw new Error("Method not implemented.");
  }
}

const createRenderingContext = (canvasUI: CanvasUI) =>
  new NodeRenderingContext(canvasUI);

export const installNodeRenderer = (canvasUI: CanvasUI) => {
  const ctx: NodeRenderingContext = createRenderingContext(canvasUI);
  const plainTextRenderer = new PlainTextRenderer(ctx);
  ctx.register(plainTextRenderer);
  const iconBadgeRenderer = new IconBadgeRenderer(ctx);
  ctx.register(iconBadgeRenderer);
  const thumnailRenderer = new ThumbnailRenderer(ctx);
  ctx.register(thumnailRenderer);
  const linkRenderer = new LinkRenderer(ctx);
  ctx.register(linkRenderer);
  return ctx;
};
