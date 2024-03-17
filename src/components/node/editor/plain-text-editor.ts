import { INodeEditor } from "..";
import { dom } from "../../../service";
import { type NodeEditingContext } from "../node-editing-context";
import { type ModelSpec } from "../node-type";

const template = {
  editor: `<div class="mwd-node-editor plain-text-editbox">
  <textarea value=""></textarea>
  <button data-cmd="save" data-submit>SAVE</button>
</div>`,
};
export class PlainTextEditor implements INodeEditor {
  get name() {
    return "text";
  }
  constructor(readonly ctx: NodeEditingContext) {}
  showEditor(model: ModelSpec, parentEl: HTMLElement): HTMLElement {
    const $editorEl = this.ctx.parse(template.editor);
    const textArea = this.ctx.query(
      $editorEl,
      "textarea"
    ) as HTMLTextAreaElement;

    textArea.value = model.text;
    dom.css(textArea, { width: 120, height: 40 });
    dom.event.click($editorEl, (e) => {
      if ((e.target as HTMLElement).dataset.cmd === "save") {
        this.ctx.updateModel((model: ModelSpec) => {
          model.text = textArea.value.trim();
          return true;
        });
      }
    });
    parentEl.append($editorEl);
    return $editorEl;
  }
}
