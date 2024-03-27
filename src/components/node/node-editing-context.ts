import { INodeEditor, type UserDefinedEditor } from ".";
import { NodeEventArg, ViewportEventArg } from "../../mindwired-event";
import { EVENT } from "../../service/event-bus";
import type { CanvasUI } from "../canvas-ui";
import type { DataSourceFactory } from "../datasource";
import { NodeEditingDelegate } from "./editor/editor-delegate";
import { IconBadgeEditor } from "./editor/icon-badge-editor";
import { LinkEditor } from "./editor/link-editor";
import { PlainTextEditor } from "./editor/plain-text-editor";
import { ThumbnailEditor } from "./editor/thumbnail-editor";
import { ImageSizeSpec, ModelSpec } from "./node-type";
import type { NodeUI } from "./node-ui";

export const installDefaultEditors = (ctx: NodeEditingContext) => {
  ctx.registerEditor(new PlainTextEditor(ctx));
  ctx.registerEditor(new IconBadgeEditor(ctx));
  ctx.registerEditor(new ThumbnailEditor(ctx));
  ctx.registerEditor(new LinkEditor(ctx));
};
export class NodeEditingContext {
  dispose() {
    this.node = undefined;
  }
  /**
   * current editing node
   */
  node: NodeUI | undefined;
  private _editorMap = new Map<string, INodeEditor>();
  constructor(
    readonly canvas: CanvasUI,
    readonly datasourceFactory: DataSourceFactory
  ) {
    this.node = undefined;
    this.config.listen(EVENT.VIEWPORT.CLICKED, (_: ViewportEventArg) => {
      this.close();
    });
    this.config.listen(EVENT.NODE.SELECTED, ({ nodes }: NodeEventArg) => {
      if (this.node !== nodes[0]) {
        this.close();
      }
    });
  }
  get config() {
    return this.canvas.config;
  }
  isEditing() {
    return !!this.node;
  }
  registerEditor(editor: INodeEditor) {
    this._editorMap.set(editor.name, editor);
  }
  registerCustomEditor<T>(delegate: UserDefinedEditor<T>) {
    const customEditor = new NodeEditingDelegate(this, delegate);
    this.registerEditor(customEditor);
  }
  getEditor(editorName: string) {
    return this._editorMap.get(editorName);
  }
  edit(nodeUI: NodeUI) {
    if (this.node) {
      this.close();
    }
    let name: string = undefined;
    const { model } = nodeUI;
    if (model.text) {
      name = "text";
    } else if (model["icon-badge"]) {
      name = "icon-badge";
    } else if (model.thumbnail) {
      name = "thumbnail";
    } else if (model.link) {
      name = "link";
    } else if (model.provider) {
      const ds = this.datasourceFactory.findDataSourceByKey(model.provider.key);
      if (ds) {
        name = this.datasourceFactory.getEditorName(ds.id);
      }
    }
    const editor = this._editorMap.get(name);
    if (editor) {
      this.node = nodeUI;
      this.node.setEditingState(true);
      this.canvas.showNodeEditor(this.node, editor);
    }

    // this.datasourceFactory.findDataSourceByData()
  }
  parse(htmlTemplate: string) {
    // FIXME rendering context와 코드 중복
    return this.config.dom.parseTemplate(htmlTemplate);
  }
  query<T extends HTMLElement>(el: HTMLElement, cssSelector: string): T {
    return this.config.dom.findOne(el, cssSelector) as T;
  }
  queryAll<T extends HTMLElement>(el: HTMLElement, cssSelector: string): T[] {
    return this.config.dom.findAll<T>(el, [cssSelector]);
  }
  updateModel(callback: (model: ModelSpec) => boolean) {
    let closing = false;
    this.node.updateModel((model) => {
      closing = callback(model);
      return true;
    });
    if (closing) {
      this.close();
    }
  }
  close() {
    if (this.node) {
      this.node.setEditingState(false);
      this.canvas.hideNodeEditor(this.node);
    }
    this.node = undefined;
  }
  normalizeImageSize(size: ImageSizeSpec): { width: string; height: string } {
    let width: string;
    let height: string;
    if (Array.isArray(size)) {
      const [w, h] = size;
      width = `${w}px`;
      height = h === undefined ? "auto" : `${h}px`;
    } else if (typeof size === "number") {
      width = height = `${size}px`;
    } else {
      width = height = "auto";
    }
    return { width, height };
  }
}
