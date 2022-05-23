const template = {
  text: '<span class="mwd-node-text"></span>',
  editor: `<div class="mwd-text-editbox">
    <textarea value=""></textarea>
    <button data-cmd="save">SAVE</button>
  </div>`,
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
    const $titleEl = this.ctx.select(nodeUI, ".mwd-node-text");
    const lines = nodeUI.title
      .split("\n")
      .map((text) => `<p>${text}</p>`)
      .join("");
    $titleEl.innerHTML = lines;
  }
  editor(nodeUI) {
    const $editorEl = this.ctx.parse(template.editor, true);

    const textArea = this.ctx.query($editorEl, "textarea");
    textArea.value = nodeUI.title;
    this.ctx.css(textArea, { width: 120, height: 40 });
    this.ctx.event.click($editorEl, (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (e.target.dataset.cmd === "save") {
        nodeUI.updateModel((model) => {
          model.text = textArea.value.trim();
          return true;
        });
        this.ctx.endEditing();
      }
    });
    this.ctx.installEditor(nodeUI, $editorEl).then(() => {
      textArea.focus();
    });
    return $editorEl;
  }
  get name() {
    return "text";
  }
}
export default PlainTextRenderer;
