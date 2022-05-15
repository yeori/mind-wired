const template = {
  viewer: `<div class="thumnail-node"></div>`,
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
class ThumbnailRenderer {
  constructor(renderingContext) {
    this.ctx = renderingContext;
  }
  get name() {
    return "thumbnail";
  }
  install(nodeUI) {
    const bodyEl = this.ctx.getNodeBody(nodeUI);
    const $thumnailEl = this.ctx.parse(template.viewer);
    bodyEl.append($thumnailEl);
  }
  render(nodeUI) {
    const { model } = nodeUI;
    const { path, size } = model["thumbnail"];
    const $div = this.ctx.select(nodeUI, ".thumnail-node");
    // $div.src = icon;
    this.ctx.css($div, {
      width: size,
      height: size,
      backgroundImage: `url(${path})`,
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    });
  }
}
export default ThumbnailRenderer;
