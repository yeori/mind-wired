import { type ModelSpec } from "../../../entity/node-model";
import { type NodeUI } from "../node-ui";
import { type NodeRenderingContext } from "../node-rendering-context";
import { type INodeRenderer } from "..";

const template = {
  viewer: `<div class="mwd-thumbnail-node"><img draggable="false"></div>`,
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
    const $div = this.ctx.query<HTMLImageElement>(
      bodyEl,
      ".mwd-thumbnail-node img"
    );
    this.ctx.css($div, { width: model.thumbnail.size, height: "auto" });
    $div.src = model.thumbnail.path;
  }
  editor(nodeUI: NodeUI) {
    const { model } = nodeUI;
    if (model.type !== "thumbnail") {
      throw new Error("EDITOR_ERROR:not a thumbnail node");
    }
    const { path, size } = model.thumbnail;

    const $editorEl = this.ctx.parse(template.editor, true);
    const $inputEl = this.ctx.query<HTMLInputElement>($editorEl, "input");
    const $imgEl = this.ctx.query<HTMLImageElement>($editorEl, ".preview .img");
    $inputEl.value = `${size}`;
    this.ctx.event.keyup(
      $inputEl,
      (e) => {
        const value = (e.target as HTMLInputElement).value.trim();
        this.ctx.valid.number(value).then((num) => {
          nodeUI.updateModel((model) => {
            model.thumbnail.size = num;
            this.ctx.css($imgEl, { width: num });
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
    this.ctx.event.keydown(
      $textArea,
      (e) => {
        const url = (e.target as HTMLTextAreaElement).value.trim();
        this.ctx.valid.path(url).then((url) => {
          nodeUI.updateModel((model: ModelSpec) => {
            model.thumbnail.path = url;
            $imgEl.src = url;
            return true;
          });
        });
      },
      "enter"
    );
    this.ctx.css($imgEl, {
      width: size,
      height: "auto",
    });
    $imgEl.src = path;
    let visible = false;
    this.ctx.event.click($imgEl, (e) => {
      visible = !visible;
      const display = visible ? "flex" : "none";
      const pathForm = this.ctx.query($editorEl, ".path-form");
      this.ctx.css(pathForm, { display });
      if (visible) {
        $textArea.value = model.thumbnail.path;
      }
    });
    // renderThumnail($imgEl, this.ctx, model.thumbnail);
    this.ctx.installEditor(nodeUI, $editorEl).then(() => {
      console.log("done");
    });
  }
}
