const template = {
  text: '<span class="mwd-node-text"></span>',
};
class PlainTextRenderer {
  constructor(renderingContext) {
    this.ctx = renderingContext;
  }
  install(nodeUI) {
    const bodyEl = this.ctx.getNodeBody(nodeUI);
    const $titleEl = this.ctx.parse(template.text);
    bodyEl.append($titleEl);
  }
  render(nodeUI) {
    // const bodyEl = canvasUI.getNodeBody(nodeUI);
    const $titleEl = this.ctx.select(nodeUI, ".mwd-node-text");
    const lines = nodeUI.title
      .split("\n")
      .map((text) => `<p>${text}</p>`)
      .join("");
    $titleEl.innerHTML = lines;
  }
  get name() {
    return "text";
  }
}
export default PlainTextRenderer;
