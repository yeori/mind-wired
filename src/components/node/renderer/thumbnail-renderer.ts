import { type ModelSpec } from "../node-type";
import { type NodeRenderingContext } from "../node-rendering-context";
import { type INodeRenderer } from "..";

const template = {
  viewer: `<div class="mwd-thumbnail-node"></div>`,
};
/**
 * ```
 * [configuration]
 * node: {
 *   model: {
 *     type: 'thumnail',
 *     thunmail: {
 *       path: 'https://image.url.value',
 *       size: 40,
 *     }
 *   }
 * }
 * ```
 */
export class ThumbnailRenderer implements INodeRenderer {
  ctx: NodeRenderingContext;
  constructor(renderingContext: NodeRenderingContext) {
    this.ctx = renderingContext;
  }
  get name() {
    return "thumbnail";
  }
  install(model: ModelSpec, bodyEl: HTMLElement) {
    // const bodyEl = this.ctx.getNodeBody(nodeUI);
    const $thumnailEl = this.ctx.parse(template.viewer);
    bodyEl.append($thumnailEl);
  }
  render(model: ModelSpec, bodyEl: HTMLElement) {
    const $el = this.ctx.query(bodyEl, ".mwd-thumbnail-node");
    // const $img = this.ctx.query<HTMLImageElement>($el, "img");
    const { size, mode } = model.thumbnail;
    const { width, height } = this.ctx.normalizeImageSize(size);

    this.ctx.css($el, {
      "background-image": `url("${model.thumbnail.path}")`,
      "background-size": mode || "cover",
      width,
      height,
    });
    $el.classList.add("cover");
  }
}
