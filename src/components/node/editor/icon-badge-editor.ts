import { INodeEditor } from "..";
import type { NodeEditingContext } from "../node-editing-context";
import type { ModelSpec } from "../node-type";

const template = {
  editor: `<div class="mwd-node-editor thumbnail-editor">
    <div><input type="text" data-icon></div>
    <div><textarea data-text></textarea></div>
    <div><button data-close>CLOSE</button></div>
</div>`,
};
export class IconBadgeEditor implements INodeEditor {
  constructor(readonly ctx: NodeEditingContext) {}
  get name() {
    return "icon-badge";
  }
  showEditor(model: ModelSpec, parentEl: HTMLElement): HTMLElement {
    const { dom } = this.ctx.config;

    const iconBadge = model["icon-badge"];
    const $editor = this.ctx.parse(template.editor);
    {
      const $icon = dom.findOne<HTMLInputElement>($editor, "[data-icon]");
      $icon.value = iconBadge.icon;
      dom.event.input(
        $icon,
        (e) => {
          const path = (e.target as HTMLTextAreaElement).value.trim();
          this.ctx.updateModel(() => {
            iconBadge.icon = path;
            return false;
          });
        },
        { debouce: 500 }
      );
    }

    {
      const $textarea = dom.findOne(
        $editor,
        "[data-text]"
      ) as HTMLTextAreaElement;
      $textarea.value = iconBadge.text;
      dom.event.input(
        $textarea,
        (e) => {
          const text = (e.target as HTMLTextAreaElement).value.trim();
          this.ctx.updateModel(() => {
            iconBadge.text = text;
            return false;
          });
        },
        { debouce: 500 }
      );
    }
    {
      const $close = dom.findOne($editor, "[data-close]");
      dom.event.click($close, () => {
        this.ctx.close();
      });
    }
    parentEl.appendChild($editor);
    return $editor;
  }
}
