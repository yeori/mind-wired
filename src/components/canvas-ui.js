import { dom } from "../service";
import { DndContext } from "../service/dnd";
import viewportDndHandler from "./dnd/viewport-dnd";
import nodeDndHandler from "./dnd/node-dnd";
const template = {
  viewport: `<div data-mind-wired-viewport>
    <canvas></canvas>
    <div class="mwd-nodes"></div>
  </div>`,
  node: `<div class="mwd-node">
    <div class="mwd-body"><span class="mwd-node-text"></span></div>
  </div>`,
  vroot: `<div class="mwd-node vroot">
    <div class="mwd-body"><span class="mwd-node-text"></span></div>
  </div>`,
  nodeEdit: `<div class="mwd-node-editbox"><textarea value=""></textarea></div>`,
};

const drawGrid = (ctx, rect) => {
  ctx.rect(rect.width / 2 - 50, rect.height / 2 - 50, 100, 100);
  ctx.stroke();
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

  const scale = ui.scale || 1.0;

  const canvas = viewport.querySelector("canvas");
  dom.attr(canvas, "width", width);
  dom.attr(canvas, "height", height);

  return viewport;
};
const registerElement = (canvasUI, nodeUI) => {
  if (nodeUI.$el) {
    throw new Error(`[MINDWIRED][ERROR] already installed. (${nodeUI.uid})`);
  }
  const { x, y } = nodeUI;
  const $el = dom.parseTemplate(
    nodeUI.isRoot() ? template.vroot : template.node
  );
  $el.dataset.uid = nodeUI.uid;
  nodeUI.$el = $el;
  const placeHolder = canvasUI.elemOf(".mwd-nodes");
  placeHolder.append(nodeUI.$el);
};
const installDnd = (canvasUI) => {
  return new DndContext({
    accept: (el) => {
      const mwd = canvasUI.config.mindWired();
      if (dom.is(el, "canvas")) {
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
class CanvasUI {
  constructor(config) {
    this.config = config;
    this.$viewport = installCanvasElem(this);
    this.$ctx = this.$canvas.getContext("2d");
    this.dndContext = installDnd(this);
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
    const titleEl = dom.findOne(
      this.$holder,
      `[data-uid="${uid}"] .mwd-node-text`
    );
    //const body = dom.findOne($el, ".mwd-body");
    const lines = nodeUI.title
      .split("\n")
      .map((text) => `<p>${text}</p>`)
      .join("");
    titleEl.innerHTML = lines;
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
  getNodeBody(nodeUI) {
    return this.$holder.querySelector(`[data-uid=${nodeUI.uid}] .mwd-body`);
  }
}
export default CanvasUI;
