const template = {
  anchor: `<a href="#" target="_"></a>`,
};

export default class LinkRenderer {
  constructor(renderingContext) {
    this.ctx = renderingContext;
  }
  get name() {
    return "link";
  }
  install(nodeUI, bodyEl) {
    const anchorEl = this.ctx.parse(template.anchor);
    const { model } = nodeUI;
    const { body } = model["link"];
    const renderer = this.ctx.getRenderer(body.type || "text");
    renderer.install(nodeUI, anchorEl);
    bodyEl.append(anchorEl);
  }
  render(model, bodyEl) {
    // const { model } = nodeUI;
    const { url, body } = model["link"];
    const $a = this.ctx.query(bodyEl, "a");
    $a.href = url;
    const renderer = this.ctx.getRenderer(body.type || "text");
    renderer.render(body, $a);
  }
}
