import { uuid } from "../../service";
import { type CanvasUI } from "../canvas-ui";
import { type NodeUI } from "./node-ui";
import { INodeRenderer, UserDefinedRenderer } from ".";
import { RenderingDelegate } from "./renderer/renderer-delegate";
import { ImageSizeSpec, ModelSpec } from "./node-type";
import { type DataSourceFactory } from "../datasource";
import { PlainTextRenderer } from "./renderer/plain-text-renderer";
import { IconBadgeRenderer } from "./renderer/icon-badge-renderer";
import { ThumbnailRenderer } from "./renderer/thumbnail-renderer";
import { LinkRenderer } from "./renderer/link-renderer";

const renderings = new Map<string, Map<string, INodeRenderer>>();

export const installDefaultRenderers = (ctx: NodeRenderingContext) => {
  ctx.register(new PlainTextRenderer(ctx));
  ctx.register(new IconBadgeRenderer(ctx));
  ctx.register(new ThumbnailRenderer(ctx));
  ctx.register(new LinkRenderer(ctx));
  return ctx;
};
export class NodeRenderingContext {
  editingNode?: NodeUI;
  canvas: CanvasUI;
  uid: string;
  constructor(
    canvasUI: CanvasUI,
    readonly datasourceFactory: DataSourceFactory
  ) {
    this.canvas = canvasUI;
    this.uid = `node-rctx-${uuid()}`;
    renderings.set(this.uid, new Map());
    this.editingNode = null;
  }
  get event() {
    return this.canvas.dom.event;
  }
  get valid() {
    return this.canvas.dom.valid;
  }
  parse(htmlTemplate: string, fitToCenter: boolean = false) {
    const { dom } = this.canvas;
    const $el = dom.parseTemplate(htmlTemplate);
    if (fitToCenter) {
      dom.css($el, {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
    }
    return $el;
  }
  register(renderer: INodeRenderer) {
    renderings.get(this.uid).set(renderer.name, renderer);
  }
  registerCustomRender<T>(renderer: UserDefinedRenderer<T>) {
    const customRenderer = new RenderingDelegate(renderer.name, this, renderer);
    this.register(customRenderer);
  }
  getRendererByModel(model: ModelSpec) {
    let name: string = undefined;

    if (model.text) {
      name = "text";
    } else if (model.thumbnail) {
      name = "thumbnail";
    } else if (model["icon-badge"]) {
      name = "icon-badge";
    } else if (model.link) {
      name = "link";
    } else if (model.provider) {
      const ds = this.datasourceFactory.findDataSourceByKey(model.provider.key);
      if (ds) {
        name = this.datasourceFactory.getRendererName(ds.id);
      }
    }
    const renderer = renderings.get(this.uid).get(name);
    if (!renderer) {
      throw new Error(
        `no match node renderer found for ModelSpec: ${JSON.stringify(model)}`
      );
    }
    return renderer;
  }
  getRenderer(redererName: string) {
    const renderer = renderings.get(this.uid).get(redererName || "text");
    if (!renderer) {
      throw new Error(`[No Renderer] no such renderer, (type:${redererName})`);
    }
    return renderer;
  }
  select(nodeUI: NodeUI, cssSelector: string) {
    return nodeUI.$bodyEl.querySelector(cssSelector) as HTMLElement;
  }
  css(el, styles) {
    this.canvas.dom.css(el, styles);
  }
  query<T extends HTMLElement>(el: HTMLElement, cssSelector: string): T {
    return this.canvas.dom.findOne(el, cssSelector) as T;
  }
  normalizeImageSize(size: ImageSizeSpec): { width: string; height: string } {
    let width: string;
    let height: string;
    if (Array.isArray(size)) {
      const [w, h] = size;
      width = `${w}px`;
      height = h === undefined ? "auto" : `${h}px`;
    } else if (typeof size === "number") {
      width = height = `${size}px`;
    } else {
      width = height = "auto";
    }
    return { width, height };
  }
}
