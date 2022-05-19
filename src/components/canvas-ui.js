import { dom } from "../service";
import { DndContext } from "../service/dnd";
import viewportDndHandler from "./dnd/viewport-dnd";
import nodeDndHandler from "./dnd/node-dnd";
import changeParentDndHandler from "./dnd/change-parent-node";
import { EVENT } from "../service/event-bus";
import iconSetPara from "../assets/icon-chng-parent.svg";
import geom from "../service/geom";

const template = {
  viewport: `<div data-mind-wired-viewport>
    <canvas></canvas>
    <div class="mwd-nodes"></div>
  </div>`,
  node: `<div class="mwd-node">
    <div class="mwd-body" tabIndex="0"></div>
    <div class="mwd-node-ctrl"></div>
  </div>`,
  nodeEdit: `<div class="mwd-node-editbox"><textarea value=""></textarea></div>`,
  nodeControl: `<div data-cmd="set-para" style="background-image: url(${iconSetPara});"></div>`,
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
  dom.attr(viewport, "tabIndex", "0");
  dom.css(viewport, { width, height });

  const canvas = viewport.querySelector("canvas");
  dom.attr(canvas, "width", width);
  dom.attr(canvas, "height", height);

  return viewport;
};
const captureContext2D = (canvasUI) => {
  const { config, $viewport, $canvas } = canvasUI;
  const { offsetWidth, offsetHeight } = $viewport;
  dom.attr($canvas, "width", offsetWidth, true);
  dom.attr($canvas, "height", offsetHeight, true);
  canvasUI.$ctx = $canvas.getContext("2d");
  config.emit(EVENT.VIEWPORT.RESIZED);
};
const registerElement = (canvasUI, nodeUI) => {
  if (nodeUI.$el) {
    throw new Error(`[MINDWIRED][ERROR] already installed. (${nodeUI.uid})`);
  }
  const $el = (nodeUI.$el = dom.parseTemplate(template.node));
  const renderingContext = canvasUI.config.getNodeRenderer();
  const { model } = nodeUI;
  const nodeRenderer = renderingContext.getRenderer(model.type);
  nodeRenderer.install(nodeUI);

  const placeHolder = canvasUI.elemOf(".mwd-nodes");
  placeHolder.append($el);
  // apply uuid for node instance
  $el.dataset.uid = nodeUI.uid;
  return nodeUI.$el;
};
const unregisterElement = (canvasUI, nodeUI) => {
  if (!nodeUI.$el) {
    throw new Error(`[MINDWIRED][ERROR] not registered node. (${nodeUI.uid})`);
  }
  nodeUI.$el.remove();
  delete nodeUI.$el;
};
const installDnd = (canvasUI) => {
  return new DndContext({
    accept: (el) => {
      const mwd = canvasUI.config.mindWired();
      if (dom.is(el, `[data-cmd="set-para"]`)) {
        canvasUI.dndContext.capture(
          "handler",
          changeParentDndHandler(canvasUI)
        );
        return true;
      } else if (dom.is(el, "canvas")) {
        canvasUI.dndContext.capture("handler", viewportDndHandler(canvasUI));
        return true;
      } else if (dom.is(el, ".mwd-node")) {
        const nodeId = el.dataset.uid;
        canvasUI.dndContext.capture("handler", nodeDndHandler(canvasUI));
        canvasUI.dndContext.capture("nodeId", nodeId);
        canvasUI.dndContext.capture("editing", mwd.isEditing());
        return true;
      } else {
        return false;
      }
    },
    beforeDrag: (e) => {
      const handler = canvasUI.dndContext.getData("handler");
      handler.beforeDrag(e);
    },
    dragging: (e) => {
      const editing = canvasUI.dndContext.getData("editing");
      if (!editing) {
        const handler = canvasUI.dndContext.getData("handler");
        handler.dragging(e);
      }
    },
    afterDrag: (e) => {
      const editing = canvasUI.dndContext.getData("editing");
      if (!editing) {
        const handler = canvasUI.dndContext.getData("handler");
        handler.afterDrag(e);
      }
    },
  });
};
const installFocusHandler = (canvasUI) => {
  dom.event.focus(
    canvasUI.$viewport,
    (e) => {
      if (dom.is(e.target, "textarea", false)) {
      } else if (dom.is(e.target, ".mwd-node")) {
        const uid = e.target.parentNode.dataset.uid;
        const mwd = canvasUI.config.mindWired();
        const node = mwd.findNode((node) => node.uid === uid);
        canvasUI.config.emit(EVENT.SELECTION.NODE, { node });
      }
    },
    true
  );
};
class CanvasUI {
  constructor(config) {
    this.config = config;
    this.$viewport = installCanvasElem(this);
    captureContext2D(this);
    installFocusHandler(this);
    this.dndContext = installDnd(this);
    let timer = null;
    const resizer = () => {
      clearTimeout(timer);
      timer = setTimeout(captureContext2D, 150, this);
    };
    this.resizeObserver = new ResizeObserver(resizer);
    this.resizeObserver.observe(this.$viewport);
  }
  get $canvas() {
    return this.$viewport.querySelector("canvas");
  }
  get $holder() {
    return this.$viewport.querySelector(".mwd-nodes");
  }
  get scale() {
    return this.config.scale;
  }
  getContext() {
    return this.$ctx;
  }
  getHolderOffset() {
    const el = this.$holder;
    // const baseOffset = this.config.getOffset();
    return { x: el.offsetLeft, y: el.offsetTop };
  }
  getDimension() {
    const el = this.$canvas;
    return { width: el.offsetWidth, height: el.offsetHeight };
  }
  elemOf(cssSelector) {
    return this.$viewport.querySelector(cssSelector);
  }
  shiftBy(dx, dy) {
    const offset = this.config.getOffset();
    offset.x += dx;
    offset.y += dy;
    this.config.setOffset(offset);
    this.repaintNodeHolder();
  }
  findNodeAt(x, y) {
    const nodeBodies = this.$holder.querySelectorAll(".mwd-body");
    let found = null;
    for (let i = 0; i < nodeBodies.length; i++) {
      const rect = dom.domRect(nodeBodies[i]);
      if (
        rect.left <= x &&
        rect.right >= x &&
        rect.top <= y &&
        rect.bottom >= y
      ) {
        found = nodeBodies[i];
        break;
      }
    }
    if (!found) {
      return null;
    }
    const mwd = this.config.mindWired();
    const nodeEl = dom.closest(found, ".mwd-node");
    const node = mwd.findNode((node) => node.uid === nodeEl.dataset.uid);
    return node;
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
    ctx.stroke();
  }
  drawCurve(s, e, option) {
    const lenSE = Math.sqrt(
      (s.x - e.x) * (s.x - e.x) + (s.y - e.y) * (s.y - e.y)
    );
    const degree = option.degree;
    const length = lenSE * option.ratio;
    const scale = length / lenSE;
    const cp1 = geom.rotate(s, e, degree, { scale });
    const cp2 = geom.rotate(e, s, degree, { scale });
    const offset = this.getHolderOffset();
    const ctx = this.getContext();
    Object.keys(option.props || {}).forEach((key) => {
      const val = option.props[key];
      ctx[key] = val;
    });
    // ctx.setLineDash([3]);
    // ctx.shadowColor = "#0000004d";
    // ctx.shadowOffsetX = 1;
    // ctx.shadowOffsetY = 2;
    // const curve = option.path2D;
    ctx.beginPath();
    ctx.moveTo(offset.x + s.x, offset.y + s.y);
    ctx.bezierCurveTo(
      offset.x + cp1.x,
      offset.y + cp1.y,
      offset.x + cp2.x,
      offset.y + cp2.y,
      offset.x + e.x,
      offset.y + e.y
    );
    ctx.stroke();
  }
  drawBeizeCurve(s, e, option) {
    const ctx = this.getContext();
    Object.keys(option.props || {}).forEach((key) => {
      const val = option.props[key];
      ctx[key] = val;
    });
    const [cp1, cp2] = option.cpoints;
    const offset = this.getHolderOffset();
    ctx.beginPath();
    ctx.moveTo(offset.x + s.x, offset.y + s.y);
    ctx.bezierCurveTo(
      offset.x + cp1.x,
      offset.y + cp1.y,
      offset.x + cp2.x,
      offset.y + cp2.y,
      offset.x + e.x,
      offset.y + e.y
    );
    ctx.stroke();
  }
  clear() {
    const dim = this.getDimension();
    const ctx = this.getContext();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, dim.width, dim.height);

    // drawGrid(ctx, dim);
  }

  repaintNodeHolder() {
    const baseOffset = this.config.getOffset();
    const { scale } = this.config;
    dom.css(this.$holder, {
      top: `calc(50% + ${baseOffset.y}px)`,
      left: `calc(50% + ${baseOffset.x}px)`,
      transform: `scale(${scale})`,
    });
  }
  drawNode(nodeUI) {
    const { uid } = nodeUI;
    const nodeEl = dom.findOne(this.$holder, `[data-uid="${uid}"]`);
    const renderingContext = this.config.getNodeRenderer();

    const { model } = nodeUI;
    const type = model.type || "text";
    const nodeRenderer = renderingContext.getRenderer(type);
    nodeRenderer.render(nodeUI);

    const ctrlEl = dom.findOne(nodeEl, ".mwd-node-ctrl");
    ctrlEl.innerHTML = "";
    if (!nodeUI.isRoot() && nodeUI.isSelected()) {
      const rect = dom.domRect(nodeUI.$bodyEl);
      dom.css(ctrlEl, { top: rect.height / 2 });
      const ctrl = dom.parseTemplate(template.nodeControl, {});
      dom.css(ctrl, {
        width: 24,
        height: 24,
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "1px 1px 4px #0000007d",
      });
      ctrlEl.append(ctrl);
    }
  }
  showNodeEditor(nodeUI, inputCallback) {
    const { uid } = nodeUI;
    const nodeEl = this.$holder.querySelector(`[data-uid=${uid}]`);
    const editBox = dom.parseTemplate(template.nodeEdit, {});
    nodeEl.append(editBox);

    const textArea = dom.findOne(editBox, "textarea");
    textArea.value = nodeUI.title;

    const nodeBody = dom.findOne(nodeEl, ".mwd-body");
    const rect = dom.domRect(nodeBody);
    dom.css(textArea, {
      width: rect.width * 1.5,
      height: rect.height * 1.5,
      minWidth: rect.width,
      minHeight: rect.height,
    });
    setTimeout(() => {
      textArea.select();
      textArea.focus();
    }, 0);
    dom.event.keyup(
      textArea,
      (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
      },
      "shift@enter"
    );
    dom.event.keydown(textArea, inputCallback, "enter esc");
    return editBox;
  }
  hideNodeEditor(nodeUI) {
    const { uid } = nodeUI;
    const nodeEl = this.$holder.querySelector(`[data-uid=${uid}]`);
    const editBox = dom.findOne(nodeEl, ".mwd-node-editbox");
    if (editBox) {
      editBox.remove();
    }
    dom.findOne(nodeEl, ".mwd-body").focus();
  }
  repaint(nodeUI) {
    if (!nodeUI.$el) {
      registerElement(this, nodeUI);
    }
    nodeUI.repaint();
  }
  regsiterNode(nodeUI) {
    registerElement(this, nodeUI);
    nodeUI.repaint();
  }
  unregisterNode(nodeUI) {
    unregisterElement(this, nodeUI);
  }
  getNodeBody(nodeUI) {
    let nodeEl = nodeUI.$el;
    // let bodyEl = this.$holder.querySelector(`[data-uid=${nodeUI.uid}] .mwd-body`);
    if (!nodeEl) {
      nodeEl = registerElement(this, nodeUI);
    }
    return nodeEl.querySelector(`.mwd-body`);
  }
}
export default CanvasUI;
