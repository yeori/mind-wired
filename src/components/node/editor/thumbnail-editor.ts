import { INodeEditor } from "..";
import type { NodeEditingContext } from "../node-editing-context";
import { type ModelSpec } from "../node-type";

const template = {
  editor: `
  <div class="mwd-node-editor thumnail-editor">
    <div class="inline-mwd-form">
      <input type="text" data-form-size>
    </div>
    <div class="preview">
      <img class="img"></img>
    </div>
    <div class="path-form">
        <textarea></textarea>
      </div>
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
    const { path, size } = model.thumbnail;
    const { width } = this.ctx.normalizeImageSize(size);

    const $editorEl = this.ctx.parse(template.editor);
    const $inputEl = this.ctx.query<HTMLInputElement>($editorEl, "input");
    const $imgEl = this.ctx.query<HTMLImageElement>($editorEl, ".preview .img");
    $inputEl.value = `width`;
    dom.event.keyup(
      $inputEl,
      (e) => {
        const value = (e.target as HTMLInputElement).value.trim();
        dom.valid.number(value).then((num) => {
          this.ctx.updateModel((model) => {
            model.thumbnail.size = num;
            dom.css($imgEl, { width: num });
            return true;
          });
        });
      },
      "enter"
    );
    const $textArea = this.ctx.query<HTMLTextAreaElement>(
      $editorEl,
      "textarea"
    );
    dom.event.keydown(
      $textArea,
      (e) => {
        const url = (e.target as HTMLTextAreaElement).value.trim();
        dom.valid.path(url).then((url) => {
          this.ctx.updateModel((model: ModelSpec) => {
            model.thumbnail.path = url;
            $imgEl.src = url;
            return true;
          });
        });
      },
      "enter"
    );
    dom.css($imgEl, {
      width,
      height: "auto",
    });
    $imgEl.src = path;
    let visible = false;
    dom.event.click($imgEl, (e) => {
      visible = !visible;
      const display = visible ? "flex" : "none";
      const pathForm = this.ctx.query($editorEl, ".path-form");
      dom.css(pathForm, { display });
      if (visible) {
        $textArea.value = model.thumbnail.path;
      }
    });
    parentEl.appendChild($editorEl);
    return $editorEl;
  }
}
