import { dom, uuid } from "../../service";
import { EVENT } from "../../service/event-bus";

const renderings = new Map();

class NodeRenderingContext {
  constructor(canvasUI) {
    this.canvas = canvasUI;
    this.uid = `node-rctx-${uuid()}`;
    renderings.set(this.uid, new Map());
  }
  get event() {
    return dom.event;
  }
  parse(htmlTemplate, fitToCenter) {
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
  register(renderer) {
    renderings.get(this.uid).set(renderer.name, renderer);
  }
  getNodeBody(nodeUI) {
    return this.canvas.getNodeBody(nodeUI);
  }
  getRenderer(type) {
    const renderer = renderings.get(this.uid).get(type || "text");
    if (!renderer) {
      throw new Error(`[No Renderer] no such renderer, (type:${type})`);
    }
    return renderer;
  }
  select(nodeUI, cssSelector) {
    return nodeUI.$bodyEl.querySelector(cssSelector);
  }
  installEditor(nodeUI, $editorEl) {
    return this.canvas.showNodeEditor(nodeUI, $editorEl);
  }
  css(el, styles) {
    dom.css(el, styles);
  }
  query(el, cssSelector) {
    return dom.findOne(el, cssSelector);
  }
  endEditing() {
    this.canvas.config.emit(EVENT.VIEWPORT.CLICKED);
  }
}
export default NodeRenderingContext;
