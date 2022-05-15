import { dom, uuid } from "../../service";

const renderings = new Map();

class NodeRenderingContext {
  constructor(canvasUI) {
    this.canvas = canvasUI;
    this.uid = `node-rctx-${uuid()}`;
    renderings.set(this.uid, new Map());
  }
  parse(htmlTemplate) {
    return dom.parseTemplate(htmlTemplate);
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
}
export default NodeRenderingContext;
