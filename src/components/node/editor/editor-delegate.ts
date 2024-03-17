import { INodeEditor, UserDefinedEditor } from "..";
import { NodeEditingContext } from "../node-editing-context";
import type { ModelSpec } from "../node-type";

export class NodeEditingDelegate<T> implements INodeEditor {
  constructor(
    readonly ctx: NodeEditingContext,
    readonly delegate: UserDefinedEditor<T>
  ) {}
  get name() {
    return this.delegate.name;
  }
  private _pickRenderer(): INodeEditor {
    const { ctx } = this;
    const { text, iconBadge, thumbnail } = this.delegate;
    let name: string = "text";
    if (text) {
      name = "text";
    } else if (iconBadge) {
      name = "icon-badge";
    } else if (thumbnail) {
      name = "thumbnail";
    }
    return ctx.getEditor(name);
  }

  showEditor(model: ModelSpec, parentEl: HTMLElement): HTMLElement {
    const editor = this._pickRenderer();
    return editor.showEditor(model, parentEl);
  }
}
