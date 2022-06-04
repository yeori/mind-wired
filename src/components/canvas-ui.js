import { dom } from "../service";
import { DndContext } from "../service/dnd";
import viewportDndHandler from "./dnd/viewport-dnd";
import nodeDndHandler from "./dnd/node-dnd";
import changeParentDndHandler from "./dnd/change-parent-node";
import { EVENT } from "../service/event-bus";
import iconSetPara from "../assets/icon-chng-parent.svg";
import iconfolding from "../assets/icon-folded.svg";
import geom from "../service/geom";

const pixelRatio = window.devicePixelRatio;
const template = {
  viewport: `<div data-mind-wired-viewport>
    <canvas></canvas>
    <div class="mwd-selection-area"><div class="ctrl-icon" data-cmd="set-para" style="display:none; background-image: url(${iconSetPara});"></div></div>
    <div class="mwd-nodes"></div>
  </div>`,
  node: `<div class="mwd-node">
    <div class="mwd-body" tabIndex="0"></div>
    <div class="mwd-subs"></div>
    <div class="mwd-node-ctrl"></div>
  </div>`,
  foldingControl: `<div class="ctrl-icon" data-cmd="unfolding" style="background-image: url(${iconfolding});"></div>`,
};

class NodeRect {
  constructor(node, scale) {
    const offset = node.offset();
    offset.x *= scale;
    offset.y *= scale;
    const rect = dom.domRect(node.$bodyEl);
    const { width, height } = rect;
    this.top = offset.y - height / 2;
    this.right = offset.x + width / 2;
    this.bottom = offset.y + height / 2;
    this.left = offset.x - width / 2;
    this.width = width;
    this.height = height;
    this.cx = offset.x;
    this.cy = offset.y;
    this.icon = null;
  }
  merge(other) {
    this.top = Math.min(this.top, other.top);
    this.right = Math.max(this.right, other.right);
    this.bottom = Math.max(this.bottom, other.bottom);
    this.left = Math.min(this.left, other.left);
    this.width = this.right - this.left;
    this.height = this.bottom - this.top;
    this.cx = this.width / 2;
    this.cy = this.height / 2;
    return this;
  }
  draw(canvas) {
    const { selection } = canvas.config.ui;
    const offset = canvas.getHolderOffset();

    const el = dom.findOne(canvas.$viewport, ".mwd-selection-area");
    dom.css(el, {
      left: offset.x + this.left - selection.padding,
      top: offset.y + this.top - selection.padding,
      width: this.width + 2 * selection.padding,
      height: this.height + 2 * selection.padding,
    });
    const ctrl = dom.findOne(el, "div");
    dom.css(ctrl, {
      display: "",
      width: 24 / Math.max(canvas.scale, 1),
      height: 24 / Math.max(canvas.scale, 1),
    });
  }
  clear(canvas) {
    const el = dom.findOne(canvas.$viewport, ".mwd-selection-area");
    dom.css(el, { top: -1, left: -1, width: 0, height: 0 });
    const ctrl = dom.findOne(el, "div");
    dom.css(ctrl, { display: "none" });
  }
}
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

  return viewport;
};
const captureContext2D = (canvasUI) => {
  const { config, $viewport, $canvas } = canvasUI;
  const { offsetWidth, offsetHeight } = $viewport;
  dom.css($canvas, { width: offsetWidth, height: offsetHeight });
  dom.attr($canvas, "width", pixelRatio * offsetWidth, true);
  dom.attr($canvas, "height", pixelRatio * offsetHeight, true);
  const ctx = $canvas.getContext("2d", { alpha: false });

  canvasUI.$ctx = ctx;
  canvasUI.$ctx.scale(pixelRatio, pixelRatio);
  if (canvasUI.selectionArea) {
    canvasUI.selectionArea.draw(canvasUI);
  }
  config.emit(EVENT.VIEWPORT.RESIZED);
};
const registerSchema = (schema, $el, config) => {
  const className = config.ui.clazz.schema(schema);
  dom.clazz.add($el, className);
};
const registerElement = (canvasUI, nodeUI) => {
  if (nodeUI.$el) {
    throw new Error(`[MINDWIRED][ERROR] already installed. (${nodeUI.uid})`);
  }
  const $el = (nodeUI.$el = dom.parseTemplate(template.node));
  const renderingContext = canvasUI.config.getNodeRenderer();
  const { model } = nodeUI;

  const $bodyEl = canvasUI.getNodeBody(nodeUI);
  const nodeRenderer = renderingContext.getRenderer(model.type);
  nodeRenderer.install(nodeUI, $bodyEl);
  if (model.schema) {
    registerSchema(model.schema, $bodyEl, canvasUI.config);
  }
  const placeHolder = canvasUI.elemOf(".mwd-nodes");
  if (nodeUI.isRoot()) {
    placeHolder.append($el);
  } else {
    const $subs = dom.findOne(nodeUI.parent.$el, ".mwd-subs");
    $subs.append($el);
  }
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
      if (dom.closest(el, "[data-editor-element]")) {
        return false;
      }
      if (dom.is(el, `[data-cmd="set-para"]`)) {
        canvasUI.dndContext.capture(
          "handler",
          changeParentDndHandler(canvasUI)
        );
        return true;
      } else if (dom.closest(el, "[data-cmd]")) {
        return false;
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
const updateFolding = (node, display) => {
  dom.css(node.$el, { display });
  if (node.isFolded()) {
    return;
  }
  node.subs.forEach((child) => {
    updateFolding(child, display);
  });
};
const installFocusHandler = (canvasUI) => {
  /*
  dom.event.focus(
    canvasUI.$viewport,
    (e) => {
      if (dom.is(e.target, "[data-editor-element]", true)) {
        // prevents focus to propaga to root elem
        // it breaks editing process
      } else if (dom.is(e.target, ".mwd-node")) {
        const uid = e.target.parentNode.dataset.uid;
        const mwd = canvasUI.config.mindWired();
        const node = mwd.findNode((node) => node.uid === uid);
        canvasUI.config.emit(EVENT.NODE.SELECTED, { node });
      }
    },
    true
  );
  */
};
const applyDrawingOption = (ctx, options, fn) => {
  Object.keys(options || {}).forEach((key) => {
    const val = options[key];
    ctx[key] = val;
  });
  if (fn && typeof fn === "function") {
    fn(ctx);
  }
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
    this.selectionArea = null;
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
  drawPath(points, options, fn) {
    const ctx = this.getContext();
    ctx.save();
    applyDrawingOption(ctx, options, fn);
    let s = points[0];
    points = points.slice(1);
    const offset = this.getHolderOffset();
    ctx.beginPath();
    ctx.moveTo(offset.x + s.x, offset.y + s.y);
    points.forEach((e) => {
      ctx.lineTo(offset.x + e.x, offset.y + e.y);
    });
    ctx.stroke();
    ctx.restore();
  }
  drawCurve(s, e, option, fn) {
    const ctx = this.getContext();
    ctx.save();
    applyDrawingOption(ctx, option.props, fn);
    const lenSE = Math.sqrt(
      (s.x - e.x) * (s.x - e.x) + (s.y - e.y) * (s.y - e.y)
    );
    const degree = option.degree;
    const length = lenSE * option.ratio;
    const scale = length / lenSE;
    const cp1 = geom.rotate(s, e, degree, { scale });
    const cp2 = geom.rotate(e, s, degree, { scale });
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
    ctx.restore();
  }
  drawBeizeCurve(s, e, option, fn) {
    const ctx = this.getContext();
    ctx.save();
    applyDrawingOption(ctx, option.props, fn);
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
    ctx.restore();
  }
  drawVLines(xPoints, option) {
    const H = this.$viewport.offsetHeight;
    const ctx = this.getContext();
    ctx.save();
    if (typeof option === "function") {
      option(ctx);
    }
    ctx.beginPath();
    const offset = this.getHolderOffset();
    xPoints.forEach((x) => {
      ctx.moveTo(offset.x + x, 0);
      ctx.lineTo(offset.x + x, H);
    });
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
  drawHLines(yPoints, option) {
    const W = this.$viewport.offsetWidth;
    const ctx = this.getContext();
    ctx.save();
    if (typeof option === "function") {
      option(ctx);
    }
    ctx.beginPath();
    const offset = this.getHolderOffset();
    yPoints.forEach((y) => {
      ctx.moveTo(0, offset.y + y);
      ctx.lineTo(W, offset.y + y);
    });
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
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
    if (this.selectionArea) {
      this.selectionArea.draw(this);
    }
  }
  moveNode(nodeUI) {
    // moveNode
    const { parent } = nodeUI;
    const $subs = dom.findOne(parent.$el, ".mwd-subs");
    $subs.append(nodeUI.$el);
  }
  drawSelection(nodes) {
    if (!nodes || nodes.length === 0) {
      return;
    }
    this.hideSelection();
    const rects = nodes.map((n) => new NodeRect(n, this.scale));
    this.selectionArea = rects.reduce((acc, rect) => acc.merge(rect), rects[0]);
    this.selectionArea.draw(this);
  }
  hideSelection() {
    if (this.selectionArea) {
      this.selectionArea.clear(this);
      this.selectionArea = null;
    }
  }
  drawNode(nodeUI) {
    if (!nodeUI.$el) {
      registerElement(this, nodeUI);
    }
    const { uid } = nodeUI;
    const nodeEl = dom.findOne(this.$holder, `[data-uid="${uid}"]`);
    const renderingContext = this.config.getNodeRenderer();

    const { model } = nodeUI;
    const type = model.type || "text";
    const nodeRenderer = renderingContext.getRenderer(type);
    nodeRenderer.render(nodeUI.model, this.getNodeBody(nodeUI), nodeUI);
  }
  showNodeEditor(nodeUI, $editorEl) {
    const { uid } = nodeUI;
    const nodeEl = this.$holder.querySelector(`[data-uid=${uid}]`);
    nodeEl.append($editorEl);
    // mark editor element for focus management
    // see installFocusHandler();
    $editorEl.dataset.editorElement = "";
    return new Promise((ok) => {
      setTimeout(ok);
    });
  }
  hideNodeEditor(nodeUI) {
    const { uid } = nodeUI;
    const nodeEl = this.$holder.querySelector(`[data-uid=${uid}]`);
    const editBox = dom.findOne(nodeEl, "[data-editor-element]");
    if (editBox) {
      editBox.remove();
    }
    dom.findOne(nodeEl, ".mwd-body").focus();
  }
  regsiterNode(nodeUI) {
    registerElement(this, nodeUI);
    // nodeUI.repaint();
  }
  unregisterNode(nodeUI) {
    unregisterElement(this, nodeUI);
    this.hideSelection();
  }
  updateFoldingNodes(nodeUI) {
    const display = nodeUI.isFolded() ? "none" : "";
    nodeUI.subs.forEach((childNode) => {
      updateFolding(childNode, display);
    });
    const nodeEl = dom.findOne(this.$holder, `[data-uid="${nodeUI.uid}"]`);
    if (nodeUI.isFolded()) {
      const rect = dom.domRect(nodeUI.$bodyEl);
      const foldingEl = dom.parseTemplate(template.foldingControl, {});
      dom.css(foldingEl, {
        width: 20,
        height: 20,
        transform: `translate(${rect.width / 2}px, -50%)`,
        zIndex: 0,
      });
      nodeEl.append(foldingEl);
      dom.event.click(foldingEl, (e) => {
        e.stopPropagation();
        nodeUI.setFolding(false);
      });
    } else {
      dom.findOne(nodeEl, ':scope > [data-cmd="unfolding"]').remove();
    }
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
