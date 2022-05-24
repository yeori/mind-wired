/**
 * dummy dnd handlers
 */
const beforeDrag = () => {};
const dragging = beforeDrag;
const afterDrag = beforeDrag;

const convToMouseEvent = (te) => {
  let touch = te.touches[0];
  if (te.type === "touchend") {
    touch = te.changedTouches[0];
  }
  te.clientX = touch.clientX;
  te.clientY = touch.clientY;
  te.layerX = 0;
  te.layerY = 0;
  te.offsetX = 0;
  te.offsetY = 0;
  te.pageX = touch.pageX;
  te.pageY = touch.pageY;
  te.screenX = touch.screenX;
  te.screenY = touch.screenY;
};
const clearTouchTimer = (ctx) => {
  clearTimeout(ctx.touchTimer);
  ctx.touchTimer = null;
};
const mousedown = (ctx, e) => {
  const { handler } = ctx;
  if (!handler.accept(e.target)) {
    return;
  }
  ctx.dragging = {
    originalEvent: e,
    sx: e.pageX,
    sy: e.pageY,
    dx: 0,
    dy: 0,
    ghost: null,
    once: null,
  };
  handler.beforeDrag(ctx.dragging);
};

const mousemove = (ctx, e) => {
  if (ctx.dragging) {
    e.preventDefault();
    if (ctx.dragging.once) {
      ctx.dragging.once();
      ctx.dragging.once = null;
    }
    ctx.originalEvent = e;
    ctx.originalEvent = e;
    ctx.dragging.dx = e.pageX - ctx.dragging.sx;
    ctx.dragging.dy = e.pageY - ctx.dragging.sy;
    ctx.handler.dragging(ctx.dragging);
  }
};
const mouseup = (ctx, e) => {
  ctx.originalEvent = e;
  document.querySelector("body").style.cursor = "";
  try {
    // ghost.clear();
    if (ctx.dragging) {
      // console.log('[M-UP]', e.target)
      ctx.handler.afterDrag(ctx.dragging);
    }
  } catch (e) {
    console.log("[DND error]", e);
  } finally {
    ctx.data.clear();
    ctx.dragging = null;
  }
};
const touchstart = (ctx, e) => {
  ctx.touchTimer = setTimeout(() => {
    convToMouseEvent(e);
    mousedown(ctx, e);
  }, 10);
};
const touchmove = (ctx, e) => {
  clearTouchTimer(ctx);
  convToMouseEvent(e);
  mousemove(ctx, e);
};
const touchend = (ctx, e) => {
  clearTouchTimer(ctx);
  convToMouseEvent(e);
  mouseup(ctx, e);
};

const install = (ctx) => {
  const { handler } = ctx;
  handler.beforeDrag = handler.beforeDrag || beforeDrag;
  handler.dragging = handler.dragging || dragging;
  handler.afterDrag = handler.afterDrag || afterDrag;

  window.addEventListener("mousedown", (e) => mousedown(ctx, e), false);
  window.addEventListener("mousemove", (e) => mousemove(ctx, e), {
    passive: false,
  });
  window.addEventListener("mouseup", (e) => mouseup(ctx, e), false);
  window.addEventListener("touchstart", (e) => touchstart(ctx, e), false);
  window.addEventListener("touchmove", (e) => touchmove(ctx, e), {
    passive: false,
  });
  window.addEventListener("toucend", (e) => touchend(ctx, e), false);
};
class DndContext {
  constructor(handler) {
    this.touchTimer = null;
    this.dragging = null;
    this.handler = handler;
    this.data = new Map();
    install(this);
  }
  capture(name, value) {
    this.data.set(name, value);
  }
  getData(name) {
    return this.data.get(name);
  }
}

export { DndContext };
