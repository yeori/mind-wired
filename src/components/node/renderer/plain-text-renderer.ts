import { ModelSpec } from "../node-type";
import { NodeRenderingContext } from "../node-rendering-context";
import { INodeRenderer } from "..";

const template = {
  text: '<span class="mwd-node-text"></span>',
  editor: `<div class="mwd-node-editor plain-text-editbox">
    <textarea value=""></textarea>
    <button data-cmd="save">SAVE</button>
  </div>`,
};
export class PlainTextRenderer implements INodeRenderer {
  ctx: NodeRenderingContext;
  constructor(renderingContext: NodeRenderingContext) {
    this.ctx = renderingContext;
  }
  install(model: ModelSpec, bodyEl: HTMLElement) {
    // const bodyEl = this.ctx.getNodeBody(nodeUI);
    const $titleEl = this.ctx.parse(template.text);
    bodyEl.append($titleEl);
  }
  render(model: ModelSpec, bodyEl: HTMLElement) {
    const $titleEl = this.ctx.query(bodyEl, ".mwd-node-text");
    // const { model } = nodeUI;
    const lines = model.text
      .split("\n")
      .map((text) => `<p>${text}</p>`)
      .join("");
    $titleEl.innerHTML = lines;
  }
  get name() {
    return "text";
  }
}
