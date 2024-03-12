import { type NodeRenderingContext } from "../node-rendering-context";
import { type INodeRenderer } from "..";
import { PlainTextRenderer } from "./plain-text-renderer";
import { ModelSpec } from "../node-type";

const template = {
  anchor: `<a href="#" target="_"></a>`,
};

export class LinkRenderer implements INodeRenderer {
  ctx: NodeRenderingContext;
  constructor(renderingContext: NodeRenderingContext) {
    this.ctx = renderingContext;
  }
  get name() {
    return "link";
  }
  install(model: ModelSpec, parentEl: HTMLElement) {
    const anchorEl = this.ctx.parse(template.anchor);
    const { body } = model["link"];
    const renderer = this.ctx.getRenderer(body.type || "text");
    renderer.install(model, anchorEl);
    parentEl.append(anchorEl);
  }
  render(model: any, parentEl: HTMLElement) {
    // const { model } = nodeUI;
    const { url, body } = model["link"];
    const $a = this.ctx.query<HTMLAnchorElement>(parentEl, "a");
    $a.href = url;
    const renderer = this.ctx.getRenderer(
      body.type || "text"
    ) as PlainTextRenderer;
    renderer.render(body, $a);
  }
}
