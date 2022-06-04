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
const renderThumnail = (el, ctx, model) => {
  const { path, size } = model;
  ctx.css(el, {
    width: size,
    height: size,
    backgroundImage: `url(${path})`,
  });
};
class ThumbnailRenderer {
  constructor(renderingContext) {
    this.ctx = renderingContext;
  }
  get name() {
    return "thumbnail";
  }
  install(nodeUI, bodyEl) {
    // const bodyEl = this.ctx.getNodeBody(nodeUI);
    const $thumnailEl = this.ctx.parse(template.viewer);
    bodyEl.append($thumnailEl);
  }
  render(model, bodyEl) {
    const $div = this.ctx.query(bodyEl, ".mwd-thumbnail-node img");
    this.ctx.css($div, { width: model.thumbnail.size, height: "auto" });
    $div.src = model.thumbnail.path;
  }
  editor(nodeUI) {
    const { model } = nodeUI;
    if (model.type !== "thumbnail") {
      throw new Error("EDITOR_ERROR:not a thumbnail node");
    }
    const { path, size } = model.thumbnail;

    const $editorEl = this.ctx.parse(template.editor, true);
    const $inputEl = this.ctx.query($editorEl, "input");
    $inputEl.value = size;
    this.ctx.event.keyup(
      $inputEl,
      (e) => {
        const value = e.target.value.trim();
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
    const $textArea = this.ctx.query($editorEl, "textarea");
    this.ctx.event.keydown(
      $textArea,
      (e) => {
        const url = e.target.value.trim();
        this.ctx.valid.path(url).then((url) => {
          nodeUI.updateModel((model) => {
            model.thumbnail.path = url;
            $imgEl.src = url;
            return true;
          });
        });
      },
      "enter"
    );
    const $imgEl = this.ctx.query($editorEl, ".preview .img");
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
export default ThumbnailRenderer;
