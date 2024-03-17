import { INodeEditor } from "..";
import type { NodeEditingContext } from "../node-editing-context";
import type { ModelSpec } from "../node-type";

const template = {
  editor: `<div class="mwd-node-editor thumbnail-editor">
    <div><input type="text" data-icon></div>
    <div><textarea data-text></textarea></div>
    <div><button data-submit>UPDAE</button></div>
</div>`,
};
export class IconBadgeEditor implements INodeEditor {
  constructor(readonly ctx: NodeEditingContext) {}
  get name() {
    return "icon-badge";
  }
  showEditor(model: ModelSpec, parentEl: HTMLElement): HTMLElement {
    const { dom } = this.ctx.config;
    const $editor = this.ctx.parse(template.editor);
    const $icon = dom.findOne($editor, "[data-icon]") as HTMLInputElement;
    const $textarea = dom.findOne(
      $editor,
      "[data-text]"
    ) as HTMLTextAreaElement;
    {
      const { icon, text } = model["icon-badge"];
      $icon.value = icon;
      $textarea.value = text;
    }
    parentEl.appendChild($editor);

    dom.event.click($editor, (e) => {
      const target = e.target as HTMLElement;
      if (dom.is(target, "[data-submit]")) {
        this.ctx.updateModel((model) => {
          const iconBadge = model["icon-badge"];
          iconBadge.icon = $icon.value;
          iconBadge.text = $textarea.value;
          return true;
        });
      }
    });

    return $editor;
  }
}
