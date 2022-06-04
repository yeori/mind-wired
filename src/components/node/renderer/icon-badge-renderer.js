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
class IconBadgeRenderer {
  constructor(renderingContext) {
    this.ctx = renderingContext;
  }
  get name() {
    return "icon-badge";
  }
  install(nodeUI, bodyEl) {
    // const bodyEl = this.ctx.getNodeBody(nodeUI);
    const $iconBadgeEl = this.ctx.parse(template.viewer);
    bodyEl.append($iconBadgeEl);
  }
  render(model, bodyEl) {
    // const { model } = nodeUI;
    const { icon, text } = model["icon-badge"];
    const $img = this.ctx.query(bodyEl, "img");
    $img.src = icon;
    const $span = this.ctx.query(bodyEl, ".mwd-node-text");
    $span.innerText = text;
  }
  startEditing(nodeUI) {
    console.log(nodeUI);
  }
}
export default IconBadgeRenderer;
