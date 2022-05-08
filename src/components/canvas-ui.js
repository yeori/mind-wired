import { dom } from "../service";
const template = {
  viewport: `<div data-mind-wired-viewport>
    <canvas></canvas>
    <div class="mwd-nodes"></div>
  </div>`,
  node: `<div class="mwd-node">
    <div class="mwd-body"><span class="mwd-node-text"></span></div>
  </div>`,
  vroot: `<div class="mwd-node vroot">
    <div class="mwd-body"></div>
  </div>`,
};
const installCanvasElem = (canvasUI) => {
  const { el, ui } = canvasUI.config;
  const width = ui.width || 600;
  const height = ui.height || 600;
  let viewport = dom.findOne(el, "[data-mind-wired-viewport]");
  if (!viewport) {
    viewport = dom.parseTemplate(template.viewport, {});
    el.append(viewport);
  }
  dom.css(viewport, { width, height });
  /*
  dom.css(viewport.querySelector("[mind-wired-nodes]"), {
    width: 3,
    height: 3,
    "background-color": "red",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  });
  */
  const canvas = viewport.querySelector("canvas");
  dom.attr(canvas, "width", width);
  dom.attr(canvas, "height", height);

  return viewport;
};
const registerElement = (canvasUI, nodeUI) => {
  const { x, y } = nodeUI;
  nodeUI.$el = dom.parseTemplate(
    nodeUI.isRoot() ? template.vroot : template.node
  );
  const placeHolder = canvasUI.elemOf(".mwd-nodes");
  placeHolder.append(nodeUI.$el);
};
class CanvasUI {
  constructor(config) {
    this.config = config;
    this.$viewport = installCanvasElem(this);
    this.$ctx = this.$canvas.getContext("2d");
  }
  get $canvas() {
    return this.$viewport.querySelector("canvas");
  }
  getContext() {
    return this.$ctx;
  }
  getHolderOffset() {
    const el = this.$viewport.querySelector(".mwd-nodes");
    return { x: el.offsetLeft, y: el.offsetTop };
  }
  elemOf(cssSelector) {
    return this.$viewport.querySelector(cssSelector);
  }

  drawPath(points, options) {
    const ctx = this.getContext();
    Object.keys(options || {}).forEach((key) => {
      const val = options[key];
      ctx[key] = val;
    });
    let s = points[0];
    points = points.slice(1);

    const offset = this.getHolderOffset();
    ctx.beginPath();
    ctx.moveTo(offset.x + s.x, offset.y + s.y);
    points.forEach((e) => {
      ctx.lineTo(offset.x + e.x, offset.y + e.y);
    });
    ctx.closePath();
    ctx.stroke();
  }

  repaint(nodeUI, offset) {
    if (!nodeUI.$el) {
      registerElement(this, nodeUI);
    }
    nodeUI.repaint(offset);
  }
}
export default CanvasUI;
