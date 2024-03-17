import { INodeEditor } from "..";
import type { NodeEditingContext } from "../node-editing-context";
import type { ModelSpec } from "../node-type";

const template = {
  editor: `<div class="mwd-node-editor link-editor">
    <div><input type="text" data-url></div>
    <div><input type="text" data-body></div>
    <div><button data-submit>UPDAE</button></div>
</div>`,
};

export class LinkEditor implements INodeEditor {
  constructor(readonly ctx: NodeEditingContext) {}
  get name() {
    return "link";
  }
  showEditor(model: ModelSpec, parentEl: HTMLElement): HTMLElement {
    const { dom } = this.ctx.config;
    const $editor = this.ctx.parse(template.editor);
    const $url = dom.findOne($editor, "[data-url]") as HTMLInputElement;
    const $body = dom.findOne($editor, "[data-body]") as HTMLInputElement;
    {
      const { url, body } = model.link;
      $url.value = url;
      $body.value = body.text || url;
    }
    parentEl.appendChild($editor);
    dom.event.click($editor, (e) => {
      const target = e.target as HTMLElement;
      if (dom.is(target, "[data-submit]")) {
        this.ctx.updateModel((model) => {
          const { link } = model;
          link.url = $url.value;
          link.body.text = $body.value;
          return true;
        });
      }
    });
    return $editor;
  }
}
