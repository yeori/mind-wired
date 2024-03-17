import { type NodeRenderingContext } from "../node-rendering-context";
import { type INodeRenderer } from "..";
import type { PlainTextRenderer } from "./plain-text-renderer";
import type { ModelSpec } from "../node-type";

const template = {
  anchor: `<a data-url target="_" data-mwd-link></a>`,
};

export class LinkRenderer implements INodeRenderer {
  constructor(readonly ctx: NodeRenderingContext) {}
  get name() {
    return "link";
  }
  install(model: ModelSpec, parentEl: HTMLElement) {
    const anchorEl = this.ctx.parse(template.anchor) as HTMLAnchorElement;
    const { body } = model["link"];
    const renderer = this.ctx.getRenderer(body.type || "text");
    renderer.install(model, anchorEl);
    parentEl.append(anchorEl);
  }
  render(model: ModelSpec, parentEl: HTMLElement) {
    // const { model } = nodeUI;
    const { url, body } = model["link"];
    const $a = this.ctx.query<HTMLAnchorElement>(parentEl, "a");
    $a.dataset.url = url;
    const renderer = this.ctx.getRenderer(
      body.type || "text"
    ) as PlainTextRenderer;
    renderer.render(body, $a);
  }
}
