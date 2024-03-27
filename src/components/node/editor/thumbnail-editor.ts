import { INodeEditor } from "..";
import type { NodeEditingContext } from "../node-editing-context";
import { ThumbnailFillMode, type ModelSpec } from "../node-type";

const template = {
  editor: `
  <div class="mwd-node-editor thumnail-editor">
    <div class="inline-mwd-form">
      <input type="text" data-form-size>
    </div>
    <div class="mode">
      <label><input type="radio" name="mode" data-mode="cover">Cover</label>
      <label><input type="radio" name="mode" data-mode="contain">Contain</label>
    </div>
    <div class="path-form">
        <textarea></textarea>
    </div>
    <div class=""><button data-close>CLOSE</button></div>
  </div>`,
};
export class ThumbnailEditor implements INodeEditor {
  constructor(readonly ctx: NodeEditingContext) {}
  get name() {
    return "thumbnail";
  }
  showEditor(model: ModelSpec, parentEl: HTMLElement): HTMLElement {
    if (!model.thumbnail) {
      throw new Error("EDITOR_ERROR:not a thumbnail node");
    }
    const { dom } = this.ctx.config;
    const { mode, path } = model.thumbnail;

    const $editorEl = this.ctx.parse(template.editor);
    const $inputEl = this.ctx.query<HTMLInputElement>($editorEl, "input");

    $inputEl.value = `${model.thumbnail.size}`;
    dom.event.input(
      $inputEl,
      (e) => {
        const value = (e.target as HTMLInputElement).value.trim();
        dom.valid.number(value).then((num) => {
          this.ctx.updateModel((model) => {
            model.thumbnail.size = num;
            return false;
          });
        });
      },
      { debouce: 500 }
    );
    const $mode = this.ctx.query<HTMLInputElement>(
      $editorEl,
      `[data-mode="${mode}"]`
    );
    $mode.checked = true;

    dom.event.change($editorEl, (e) => {
      const { mode } = (e.target as HTMLElement).dataset;
      if (mode) {
        this.ctx.updateModel((model: ModelSpec) => {
          model.thumbnail.mode = mode as ThumbnailFillMode;
          return false;
        });
      }
    });
    const $textArea = this.ctx.query<HTMLTextAreaElement>(
      $editorEl,
      "textarea"
    );
    $textArea.value = path;
    dom.event.input(
      $textArea,
      (e) => {
        const url = (e.target as HTMLTextAreaElement).value.trim();
        dom.valid.path(url).then((url) => {
          this.ctx.updateModel((model: ModelSpec) => {
            model.thumbnail.path = url;
            return false;
          });
        });
      },
      { debouce: 500 }
    );
    const $close = this.ctx.query<HTMLButtonElement>($editorEl, "[data-close]");
    dom.event.click($close, () => {
      this.ctx.close();
    });
    parentEl.appendChild($editorEl);
    return $editorEl;
  }
}
