const template = {
  text: '<span class="mwd-node-text"></span>',
  editor: `<div class="mwd-node-editor plain-text-editbox">
    <textarea value=""></textarea>
    <button data-cmd="save">SAVE</button>
  </div>`,
};
class PlainTextRenderer {
  constructor(renderingContext) {
    this.ctx = renderingContext;
  }
  install(nodeUI, bodyEl) {
    // const bodyEl = this.ctx.getNodeBody(nodeUI);
    const $titleEl = this.ctx.parse(template.text);
    bodyEl.append($titleEl);
  }
  render(model, bodyEl) {
    const $titleEl = this.ctx.query(bodyEl, ".mwd-node-text");
    // const { model } = nodeUI;
    const lines = model.text
      .split("\n")
      .map((text) => `<p>${text}</p>`)
      .join("");
    $titleEl.innerHTML = lines;
  }
  editor(nodeUI) {
    const $editorEl = this.ctx.parse(template.editor, true);

    const textArea = this.ctx.query($editorEl, "textarea");

    const { model } = nodeUI;
    textArea.value = model.text;
    this.ctx.css(textArea, { width: 120, height: 40 });
    this.ctx.event.click($editorEl, (e) => {
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
