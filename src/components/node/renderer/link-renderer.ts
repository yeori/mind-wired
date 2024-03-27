import { type NodeRenderingContext } from "../node-rendering-context";
import { NodeState, type INodeRenderer } from "..";
import type { PlainTextRenderer } from "./plain-text-renderer";
import type { ModelSpec } from "../node-type";

const template = {
  link: `
  <div class="mwd-link-node">
    <a data-url data-mwd-link></a>
    <span data-mwd-link-opener><a target="_" data-mwd-link></a></span>
  </div>`,
};

export class LinkRenderer implements INodeRenderer {
  constructor(readonly ctx: NodeRenderingContext) {}
  get name() {
    return "link";
  }
  install(model: ModelSpec, parentEl: HTMLElement) {
    const linkEl = this.ctx.parse(template.link) as HTMLAnchorElement;
    const { body } = model["link"];
    const renderer = this.ctx.getRenderer(body.type || "text");

    const anchorEl = this.ctx.query(linkEl, "a");
    renderer.install(model, anchorEl);
    parentEl.append(linkEl);
  }
  render(model: ModelSpec, parentEl: HTMLElement, state: NodeState) {
    // const { model } = nodeUI;
    const { url, body } = model["link"];
    const $a = this.ctx.query<HTMLAnchorElement>(parentEl, "a");
    $a.dataset.url = url;
    {
      const $opener = this.ctx.query<HTMLSpanElement>(
        parentEl,
        "[data-mwd-link-opener]"
      );
      if (state.selected) {
        $opener.classList.add("visible");
      } else {
        $opener.classList.remove("visible");
      }
      const $anchor = this.ctx.query<HTMLAnchorElement>($opener, "a");
      $anchor.href = url;
      $anchor.textContent = url;
    }
    const renderer = this.ctx.getRenderer(
      body.type || "text"
    ) as PlainTextRenderer;
    renderer.render(body, $a);
  }
}
