import { DndContext, DndHelper } from "../service/dnd";
import { viewportDndHandler } from "./dnd/viewport-dnd";
import nodeDndHandler from "./dnd/node-dnd";
import changeParentDndHandler from "./dnd/change-parent-node";
import { EVENT } from "../service/event-bus";
import iconSetPara from "../assets/icon-chng-parent.svg";
import iconfolding from "@/assets/icon-folded.svg";
import { geom, type Point } from "../service/geom";
import Configuration from "./config";
import { NodeUI } from "./node/node-ui";
import { MindWired } from "./mind-wired";
import type { NodeRect, SchemaSpec } from "./node/node-type";
import { INodeEditor } from "./node";
import type { DomUtil } from "../service/dom";

// const pixelRatio = window.devicePixelRatio;
const template = {
  viewport: `<div data-mind-wired-viewport>
    <canvas></canvas>
    <div class="mwd-selection-area"><div class="ctrl-icon" data-cmd="set-para" style="display:none;"><img src="${iconSetPara}"></div></div>
    <div class="mwd-nodes"></div>
  </div>`,
  node: `<div class="mwd-node">
    <div class="mwd-body" tabIndex="0"></div>
    <div class="mwd-subs"></div>
    <div class="mwd-node-ctrl"></div>
  </div>`,
  foldingControl: `<div class="ctrl-icon" data-cmd="unfolding"><img src="${iconfolding}"></div>`,
};

const installViewport = (canvasUI: CanvasUI) => {
  const { el, ui, dom } = canvasUI.config;
  const width = ui.width || 600;
  const height = ui.height || 600;
  let viewport = dom.findOne(el, "[data-mind-wired-viewport]");
  if (!viewport) {
    viewport = dom.parseTemplate(template.viewport, {});
    if (!ui.useDefaultIcon) {
      viewport.querySelector("img")?.remove();
    }
    if (ui.mapId) {
      viewport.dataset.mindWiredViewport = ui.mapId;
    }
    el.append(viewport);
  }
  {
    // canvas
    let canvas = dom.findOne<HTMLCanvasElement>(viewport, ":scope > canvas");
    if (!canvas) {
      viewport.appendChild(dom.tag.canvas());
    }
  }
  {
    const selectionArea = dom.findOne<HTMLDivElement>(
      viewport,
      ":scope > .mwd-selection-area"
    );
    if (!selectionArea) {
      viewport.appendChild(dom.tag.div(".mwd-selection-area"));
    }
  }
  {
    const nodesEl = dom.findOne<HTMLDivElement>(
      viewport,
      ":scope > .mwd-nodes"
    );
    if (!nodesEl) {
      viewport.appendChild(dom.tag.div(".mwd-nodes"));
    }
  }
  dom.attr(viewport, "tabIndex", "0");
  dom.css(viewport, { width, height });

  return viewport;
};
const captureContext2D = (canvasUI: CanvasUI) => {
  const { devicePixelRatio: pixelRatio } = window;
  const { config, $viewport, $canvas } = canvasUI;
  const { offsetWidth, offsetHeight } = $viewport;
  canvasUI.dom.css($canvas, { width: offsetWidth, height: offsetHeight });
  canvasUI.dom.attr($canvas, "width", String(pixelRatio * offsetWidth), true);
  canvasUI.dom.attr($canvas, "height", String(pixelRatio * offsetHeight), true);
  const ctx = $canvas.getContext("2d", { alpha: false });

  canvasUI.$ctx = ctx;
  canvasUI.$ctx.scale(pixelRatio, pixelRatio);
  canvasUI.drawNodeSelection();
  config.emit(EVENT.VIEWPORT.RESIZED);
};
const registerSchema = (
  schema: string,
  $el: HTMLElement,
  config: Configuration
) => {
  const className = config.ui.clazz.schema(schema);
  config.dom.clazz.add($el, className);
};
const registerElement = (canvasUI: CanvasUI, nodeUI: NodeUI) => {
  if (nodeUI.$el) {
    throw new Error(`[MINDWIRED] already installed. (${nodeUI.uid})`);
  }
  const $el = (nodeUI.$el = canvasUI.dom.parseTemplate(template.node));
  const mwd = canvasUI.config.mindWired();
  const nodeRenderer = mwd.getNodeRender(nodeUI.model);
  const model = mwd.translateModel(nodeUI.model);
  const $bodyEl = canvasUI.getNodeBody(nodeUI);
  nodeRenderer.install(nodeUI.model, $bodyEl);
  if (model.schema) {
    registerSchema(model.schema, $el, canvasUI.config);
    registerSchema(model.schema, $bodyEl, canvasUI.config);
  }
  const placeHolder = canvasUI.elemOf(".mwd-nodes");
  if (nodeUI.isRoot()) {
    placeHolder.append($el);
  } else {
    const $subs = canvasUI.dom.findOne(nodeUI.parent.$el, ".mwd-subs");
    $subs.append($el);
  }
  // apply uuid for node instance
  $el.dataset.uid = nodeUI.uid;
  return nodeUI.$el;
};
const unregisterElement = (
  canvasUI: CanvasUI,
  nodeUI: NodeUI,
  propagateAll: boolean = false
) => {
  if (!nodeUI.$el) {
    throw new Error(`[MINDWIRED][ERROR] not registered node. (${nodeUI.uid})`);
  }
  nodeUI.$el.remove();
  delete nodeUI.$el;
  if (propagateAll) {
    const { subs } = nodeUI;
    if (subs) {
      subs.forEach((child) => unregisterElement(canvasUI, child));
    }
  }
};
const installDnd = (canvasUI: CanvasUI) => {
  const { dom } = canvasUI;
  return new DndContext({
    accept: (el: HTMLElement) => {
      const mwd: MindWired = canvasUI.config.mindWired!();
      if (dom.closest(el, "[data-editor-element]")) {
        return false;
      }
      if (dom.is(el, `[data-cmd="set-para"]`)) {
        const btn = dom.closest(el, `[data-cmd="set-para"]`);
        canvasUI.dndContext.capture("iconEl", btn);
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
        const nodeEl = dom.closest(el, ".mwd-node");
        const nodeId = nodeEl.dataset.uid;
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
  } as DndHelper);
};
const updateFolding = (node: NodeUI, display: string, dom: DomUtil) => {
  if (!node.isReady()) {
    return;
  }
  dom.css(node.$el!, { display });
  if (node.isFolded()) {
    return;
  }
  node.subs.forEach((child) => {
    updateFolding(child, display, dom);
  });
};
const installFoldingIcon = (
  nodeEl: HTMLElement,
  rect: DOMRect,
  config: Configuration,
  callback: (foldingEl: HTMLElement) => void
) => {
  let foldingEl = nodeEl.querySelector<HTMLElement>(`[data-cmd="unfolding"]`);
  if (!foldingEl) {
    const { dom } = config;
    foldingEl = dom.parseTemplate(template.foldingControl, {});
    dom.css(foldingEl, {
      transform: `translate(${rect.width / 2 + 4}px, -50%)`,
      zIndex: 0,
    });
    if (!config.ui.useDefaultIcon) {
      foldingEl.querySelector("img")?.remove();
    }
    nodeEl.append(foldingEl);
    callback(foldingEl);
  }
};
const installFocusHandler = (canvasUI: CanvasUI) => {
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
const applyDrawingOption = <K extends keyof CanvasRenderingContext2D>(
  ctx: CanvasRenderingContext2D,
  options: Partial<CanvasRenderingContext2D>,
  fn?: (ctx: CanvasRenderingContext2D) => void
) => {
  if (options) {
    Object.keys(options).forEach((key) => {
      const val = options[key];
      if (val) {
        ctx[key] = val;
      }
    });
  }
  if (fn) {
    fn(ctx);
  }
};
export class CanvasUI {
  config: Configuration;
  $viewport: HTMLElement;
  dndContext: DndContext;
  resizeObserver: ResizeObserver;
  selectionArea: NodeRect | undefined;
  $ctx: CanvasRenderingContext2D;
  constructor(config: Configuration) {
    this.config = config;
    this.$viewport = installViewport(this);
    captureContext2D(this);
    installFocusHandler(this);
    this.dndContext = installDnd(this);
    let timer: number | undefined;
    const resizer = () => {
      clearTimeout(timer);
      timer = window.setTimeout(captureContext2D, 150, this);
    };
    this.resizeObserver = new ResizeObserver(resizer);
    this.resizeObserver.observe(this.$viewport);
    // this.selectionArea;
  }
  get dom() {
    return this.config.dom;
  }
  get $canvas() {
    return this.$viewport.querySelector<HTMLElement>(
      "canvas"
    ) as HTMLCanvasElement;
  }
  get $holder() {
    return this.$viewport.querySelector<HTMLElement>(".mwd-nodes")!;
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
    return { x: el!.offsetLeft, y: el!.offsetTop };
  }
  /**
   * multiply scale to numeric properties
   * @param obj object to mutiply scale
   * @returns
   */
  setScale<T>(obj: T): T {
    const { scale } = this;
    if (typeof obj === "number") {
      return (obj * scale) as T;
    } else if (Array.isArray(obj)) {
      const cloned = [...obj];
      cloned.forEach((elem, index) => {
        cloned[index] = this.setScale(elem);
      });
      return cloned as T;
    } else if (typeof obj === "object") {
      const cloned = { ...obj };
      for (let prop in cloned) {
        cloned[prop] = this.setScale<any>(obj[prop]);
      }
      return cloned;
    }
    return obj;
  }
  /**
   * multiply scale to numeric properties
   * @param point point to multiply scale
   * @returns
   */
  getScaledPos(point: Point) {
    point.x *= this.scale;
    point.y *= this.scale;
    return point;
  }
  /**
   * multiply scale to offset(x,y) of the node
   * @param node
   * @returns
   */
  getScaledOffset(node: NodeUI): any {
    return this.getScaledPos(node.offset());
  }
  getDimension() {
    const el = this.$canvas;
    return { width: el!.offsetWidth, height: el!.offsetHeight };
  }
  getNodeDimension(node: NodeUI, relative = false) {
    const dim = node.dimension(relative);
    const { scale } = this.config;
    dim.center.x *= scale;
    dim.center.y *= scale;
    return dim;
  }
  elemOf(cssSelector: string) {
    return this.$viewport.querySelector(cssSelector);
  }
  shiftBy(dx: number, dy: number) {
    const offset = this.config.getOffset();
    offset.x += dx;
    offset.y += dy;
    this.config.setOffset(offset);
    this.repaintNodeHolder();
  }
  renderWith(callback: (ctx: CanvasRenderingContext2D) => void) {
    const ctx = this.getContext();
    const offset = this.getHolderOffset();
    try {
      ctx.translate(offset.x, offset.y);
      ctx.save();
      callback(ctx);
    } finally {
      ctx.restore();
      ctx.translate(-offset.x, -offset.y);
    }
  }
  findNodeAt(x: number, y: number) {
    const nodeBodies = this.$holder.querySelectorAll<HTMLElement>(".mwd-body");
    let found = null;
    const { dom } = this;
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
    const nodeEl = dom.closest(found, ".mwd-node") as HTMLElement;
    const node = mwd.findNode((node) => node.uid === nodeEl.dataset.uid);
    return node;
  }
  drawPath(
    points: Point[],
    options: Partial<CanvasRenderingContext2D>,
    fn: (ctx: CanvasRenderingContext2D) => void
  ) {
    this.renderWith((ctx) => {
      applyDrawingOption(ctx, options, fn);
      ctx.beginPath();
      let s = points[0];
      // points = points.slice(1);
      ctx.moveTo(s.x, s.y);
      points.forEach((e) => {
        ctx.lineTo(e.x, e.y);
      });
      ctx.stroke();
    });
  }
  drawCurve<K extends keyof CanvasRenderingContext2D>(
    s: Point,
    e: Point,
    option: {
      degree: number;
      ratio: number;
      props: Record<K, CanvasRenderingContext2D[K]>;
    },
    fn: (ctx: CanvasRenderingContext2D) => void
  ) {
    // const ctx = this.getContext();
    this.renderWith((ctx) => {
      applyDrawingOption(ctx, option.props, fn);
      const lenSE = Math.sqrt(
        (s.x - e.x) * (s.x - e.x) + (s.y - e.y) * (s.y - e.y)
      );
      const degree = option.degree;
      const length = lenSE * option.ratio;
      const scale = (length / lenSE) * this.scale;
      const cp1 = geom.rotate(s, e, degree, { scale });
      const cp2 = geom.rotate(e, s, degree, { scale });
      // const offset = this.getHolderOffset();

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, e.x, e.y);
      ctx.stroke();
    });
    // ctx.save();

    // ctx.restore();
  }
  drawBeizeCurve<K extends keyof CanvasRenderingContext2D>(
    s: Point,
    e: Point,
    option: { cpoints: Point[]; props: Record<K, CanvasRenderingContext2D[K]> },
    fn: (ctx: CanvasRenderingContext2D) => void
  ) {
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
  drawVLines(
    xPoints: number[],
    option: (ctx: CanvasRenderingContext2D) => void
  ) {
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
  drawHLines(
    yPoints: number[],
    option: (ctx: CanvasRenderingContext2D) => void
  ) {
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
    this.dom.css(this.$holder, {
      top: `calc(50% + ${baseOffset.y}px)`,
      left: `calc(50% + ${baseOffset.x}px)`,
      transform: `scale(${scale})`,
    });
    this.drawNodeSelection();
  }
  moveNode(nodeUI: NodeUI) {
    // moveNode
    const { parent } = nodeUI;
    const $subs = this.dom.findOne(parent!.$el!, ".mwd-subs");
    $subs!.append(nodeUI.$el!);
  }
  drawNodeSelection() {
    const area = this.selectionArea;
    if (!area) {
      return;
    }
    const { selection } = this.config.ui;
    const { dom } = this;
    const offset = this.getHolderOffset();
    const el = dom.findOne(this.$viewport, ".mwd-selection-area");
    dom.css(el, {
      left: offset.x + area.left - selection.padding,
      top: offset.y + area.top - selection.padding,
      width: area.width + 2 * selection.padding,
      height: area.height + 2 * selection.padding,
    });
    const ctrl = dom.findOne(el, "div");
    dom.css(ctrl, {
      display: "",
      width: 24 / Math.max(this.scale, 1),
      height: 24 / Math.max(this.scale, 1),
    });
  }
  updateSelection(nodes: NodeUI[]) {
    if (!nodes || nodes.length === 0) {
      return;
    }
    this.clearNodeSelection();
    const rects = nodes.map((n: NodeUI) => this.getNodeDimension(n));
    this.selectionArea = rects.reduce(
      (acc: NodeRect, rect: NodeRect) => acc.merge(rect),
      rects[0]
    );
    this.drawNodeSelection();
  }
  clearNodeSelection() {
    if (this.selectionArea) {
      const { dom } = this;
      const el = dom.findOne(this.$viewport, ".mwd-selection-area");
      dom.css(el, { top: -1, left: -1, width: 0, height: 0 });
      const ctrl = dom.findOne(el, "div");
      dom.css(ctrl, { display: "none" });
      this.selectionArea = undefined;
    }
  }
  drawNode(nodeUI: NodeUI) {
    if (!nodeUI.$el) {
      registerElement(this, nodeUI);
    }
    const { $el, zIndex } = nodeUI;
    const $body = $el!.querySelector<HTMLElement>(".mwd-body");
    // 1. folding state
    const foldedClassName = this.config.foldedNodeClassName();
    const { dom } = this;
    if (nodeUI.isFolded()) {
      dom.clazz.add($el, foldedClassName);
    } else {
      dom.clazz.remove($el, foldedClassName);
    }
    // 2. positioning
    const pos = nodeUI.getPos();
    dom.css($el!, { top: pos.y, left: pos.x, zIndex: zIndex });
    // 3. selection state
    const methodName = nodeUI.isSelected() ? "add" : "remove";
    const className = this.config.activeClassName("node");
    dom.clazz[methodName]($body, className);
    // 4. level
    const levelClassName: string = this.config.nodeLevelClassName(nodeUI);
    dom.clazz.add($body, levelClassName);
    $body.dataset.level = `${nodeUI.level()}`;

    const mwd = this.config.mindWired();
    const nodeRenderer = mwd.getNodeRender(nodeUI.model);
    const model = mwd.translateModel(nodeUI.model);
    nodeRenderer.render(model, $body);
  }
  showNodeEditor(nodeUI: NodeUI, nodeEditor: INodeEditor) {
    const { uid } = nodeUI;
    const mwd = this.config.mindWired();
    const model = mwd.translateModel(nodeUI.model);
    const nodeEl = this.$holder.querySelector<HTMLElement>(`[data-uid=${uid}]`);
    const $editorEl = nodeEditor.showEditor(model, nodeEl);
    // mark editor element for focus management
    // see installFocusHandler();
    $editorEl.dataset.editorElement = "";

    return new Promise((ok) => {
      setTimeout(ok);
    });
  }
  hideNodeEditor(nodeUI: NodeUI) {
    const { uid } = nodeUI;
    const { dom } = this;
    const nodeEl = this.$holder.querySelector<HTMLElement>(`[data-uid=${uid}]`);
    const editBox = dom.findOne(nodeEl!, "[data-editor-element]");
    if (editBox) {
      editBox.remove();
    }
    dom.findOne(nodeEl!, ".mwd-body")!.focus();
  }
  regsiterNode(nodeUI: NodeUI) {
    registerElement(this, nodeUI);
  }
  unregisterNode(nodeUI: NodeUI) {
    unregisterElement(this, nodeUI);
    this.clearNodeSelection();
  }
  unregisterNodeTree(node: NodeUI) {
    unregisterElement(this, node, true);
  }
  updateFoldingNodes(nodeUI: NodeUI) {
    const display = nodeUI.isFolded() ? "none" : "";
    const { dom } = this;
    nodeUI.subs.forEach((childNode) => {
      updateFolding(childNode, display, dom);
    });
    const nodeEl = dom.findOne(this.$holder, `[data-uid="${nodeUI.uid}"]`)!;
    if (nodeUI.isFolded()) {
      const rect = dom.domRect(nodeUI.$bodyEl);
      installFoldingIcon(nodeEl, rect, this.config, (foldingEl) => {
        dom.event.click(foldingEl, (e) => {
          e.stopPropagation();
          nodeUI.setFolding(false);
        });
      });
    } else {
      dom.findOne(nodeEl, ':scope > [data-cmd="unfolding"]')!.remove();
    }
  }
  getNodeBody(nodeUI: NodeUI) {
    let nodeEl = nodeUI.$el!;
    if (!nodeEl) {
      nodeEl = registerElement(this, nodeUI);
    }
    return nodeEl.querySelector<HTMLElement>(`.mwd-body`);
  }
  drawSchemaStyles(schemaSpecs: SchemaSpec[]) {
    const { mapId } = this.config.ui;
    const styleId = `#mwd-schema-@mapId-@schema`.replace("@mapId", mapId || "");
    const styleDef =
      `[data-mind-wired-viewport@mapId] .mwd-node.@schema > .mwd-body { @body }`.replace(
        "@mapId",
        mapId ? `="${mapId}"` : ""
      );
    schemaSpecs.forEach((schema) => {
      const { name, css } = schema;
      const styleEl = this.dom.tag.style(styleId.replace("@schema", name));
      if (css) {
        const body = Object.keys(css).reduce((cssText, prop) => {
          const dashedprop = prop.replace(
            /[A-Z]/g,
            (match) => `-${match.toLowerCase()}`
          );
          return cssText + `${dashedprop}: ${css[prop]};`;
        }, "");
        styleEl.innerHTML = styleDef
          .replace("@body", body)
          .replace("@schema", name);
        document.head.appendChild(styleEl);
      }
    });
  }
}
