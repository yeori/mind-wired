import { type ModelSpec } from "../node-type";
import { NodeRenderingContext } from "../node-rendering-context";
import { type INodeRenderer } from "..";

const template = {
  viewer: `<div class="icon-badge-node">
    <img>
    <span class="mwd-node-text"></span>
  </div>`,
  editor: `<div class=""></div>`,
};
/**
 *  ```
 *  icon-badge renderer
 *  +------+--------------+
 *  | IMG  |    T E X T   |
 *  +------+--------------+
 *
 *  [configuration]
 *  node: {
 *    model: {
 *      type: 'icon-badge',
 *      'icon-badge': {
 *        icon: 'https://image.url.value',
 *        text: 'text value'
 *      }
 *    },
 *    view: { ... }
 *  }
 * ```
 *
 */
export class IconBadgeRenderer implements INodeRenderer {
  ctx: NodeRenderingContext;
  constructor(renderingContext: NodeRenderingContext) {
    this.ctx = renderingContext;
  }
  get name() {
    return "icon-badge";
  }
  install(model: ModelSpec, parentEl: HTMLElement) {
    const $iconBadgeEl = this.ctx.parse(template.viewer);
    parentEl.append($iconBadgeEl);
  }
  render(model: ModelSpec, parentEl: HTMLElement) {
    // const { model } = nodeUI;
    const { icon, text } = model["icon-badge"];
    const $img = this.ctx.query<HTMLImageElement>(parentEl, "img");
    $img.src = icon;
    const $span = this.ctx.query(parentEl, ".mwd-node-text");
    $span.innerText = text;
  }
}
