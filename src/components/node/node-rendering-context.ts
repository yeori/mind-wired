import { dom, uuid } from "../../service";
import { EVENT } from "../../service/event-bus";
import CanvasUI from "../canvas-ui";
import { type NodeUI } from "./node-ui";
import { INodeRenderer, UserDefinedRenderer } from ".";
import { RenderingDelegate } from ".";
import { ModelSpec } from "./node-type";

const renderings = new Map<string, Map<string, INodeRenderer>>();

export class NodeRenderingContext {
  editingNode?: NodeUI;
  canvas: CanvasUI;
  uid: string;
  constructor(canvasUI: CanvasUI) {
    this.canvas = canvasUI;
    this.uid = `node-rctx-${uuid()}`;
    renderings.set(this.uid, new Map());
    this.editingNode = null;
  }
  get event() {
    return dom.event;
  }
  get valid() {
    return dom.valid;
  }
  parse(htmlTemplate: string, fitToCenter: boolean = false) {
    const $el = dom.parseTemplate(htmlTemplate);
    if (fitToCenter) {
      dom.css($el, {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
    }
    return $el;
  }
  register(renderer: INodeRenderer) {
    renderings.get(this.uid).set(renderer.name, renderer);
  }
  registerCustomRender<T>(renderer: UserDefinedRenderer<T>) {
    const customRenderer = new RenderingDelegate(renderer.name, this, renderer);
    this.register(customRenderer);
  }
  getRendererByModel(model: ModelSpec) {
    let name: string = undefined;
    if (model.text) {
      name = "text";
    } else if (model.thumbnail) {
      name = "thumbnail";
    } else if (model["icon-badge"]) {
      name = "icon-badge";
    } else if (model.provider) {
    }
    return renderings.get(this.uid).get(name);
  }
  getRenderer(redererName: string) {
    const renderer = renderings.get(this.uid).get(redererName || "text");
    if (!renderer) {
      throw new Error(`[No Renderer] no such renderer, (type:${redererName})`);
    }
    return renderer;
  }
  select(nodeUI: NodeUI, cssSelector: string) {
    return nodeUI.$bodyEl.querySelector(cssSelector) as HTMLElement;
  }
  installEditor(nodeUI: NodeUI, $editorEl: HTMLElement) {
    this.editingNode = nodeUI;
    return this.canvas.showNodeEditor(nodeUI, $editorEl);
  }
  css(el, styles) {
    dom.css(el, styles);
  }
  query<T extends HTMLElement>(el: HTMLElement, cssSelector: string): T {
    return dom.findOne(el, cssSelector) as T;
  }
  endEditing() {
    this.canvas.hideNodeEditor(this.editingNode);
    this.canvas.config.emit(EVENT.NODE.EDITING, {
      editing: false,
      nodeUI: this.editingNode,
    });
    this.editingNode = null;
  }
}
