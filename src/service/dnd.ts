/**
 * dummy dnd handlers
 */
const beforeDrag = () => {};
const dragging = beforeDrag;
const afterDrag = beforeDrag;

interface MutableEvent extends TouchEvent, MouseEvent {
  clientX: number;
  clientY: number;
  layerX: number;
  layerY: number;
  offsetX: number;
  offsetY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
}

export type DndEvent = {
  originalEvent: MutableEvent;
  sx: number;
  sy: number;
  dx: number;
  dy: number;
  ghost: HTMLElement | undefined;
  once: Function | undefined;
};

export type DndHelper = {
  accept: (el: EventTarget | null) => boolean;
  beforeDrag: (e: DndEvent) => void;
  dragging: (e: DndEvent) => void;
  afterDrag: (e: DndEvent) => void;
};
const convToMouseEvent = (te: MutableEvent) => {
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
const clearTouchTimer = (ctx: DndContext) => {
  clearTimeout(ctx.touchTimer);
  ctx.touchTimer = undefined;
};
const mousedown = (ctx: DndContext, e: MouseEvent) => {
  const { handler } = ctx;
  if (!handler.accept(e.target)) {
    return;
  }
  ctx.dragging = {
    originalEvent: e as MutableEvent,
    sx: e.pageX,
    sy: e.pageY,
    dx: 0,
    dy: 0,
    ghost: undefined,
    once: undefined,
  };
  handler.beforeDrag(ctx.dragging);
};

const mousemove = (ctx: DndContext, e: MutableEvent) => {
  if (ctx.dragging) {
    e.preventDefault();
    if (ctx.dragging.once) {
      ctx.dragging.once();
      ctx.dragging.once = undefined;
    }
    ctx.originalEvent = e;
    ctx.dragging.dx = e.pageX - ctx.dragging.sx;
    ctx.dragging.dy = e.pageY - ctx.dragging.sy;
    ctx.handler.dragging(ctx.dragging);
  }
};
const mouseup = (ctx: DndContext, e: MouseEvent) => {
  ctx.originalEvent = e;
  const body = document.querySelector("body");
  if (body) {
    body.style.cursor = "";
  }
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
    ctx.dragging = undefined;
  }
};
const touchstart = (ctx: DndContext, e: TouchEvent) => {
  ctx.touchTimer = window.setTimeout(() => {
    convToMouseEvent(e as MutableEvent);
    mousedown(ctx, e as MutableEvent);
  }, 10);
};
const touchmove = (ctx: DndContext, e: TouchEvent) => {
  clearTouchTimer(ctx);
  convToMouseEvent(e as MutableEvent);
  mousemove(ctx, e as MutableEvent);
};
const touchend = (ctx: DndContext, e: TouchEvent) => {
  clearTouchTimer(ctx);
  convToMouseEvent(e as MutableEvent);
  mouseup(ctx, e as MutableEvent);
};

const install = (ctx: DndContext) => {
  const { handler } = ctx;
  handler.beforeDrag = handler.beforeDrag || beforeDrag;
  handler.dragging = handler.dragging || dragging;
  handler.afterDrag = handler.afterDrag || afterDrag;

  window.addEventListener("mousedown", (e) => mousedown(ctx, e), false);
  window.addEventListener(
    "mousemove",
    (e) => mousemove(ctx, e as MutableEvent),
    {
      passive: false,
    }
  );
  window.addEventListener("mouseup", (e) => mouseup(ctx, e), false);
  window.addEventListener("touchstart", (e) => touchstart(ctx, e), false);
  window.addEventListener("touchmove", (e) => touchmove(ctx, e), {
    passive: false,
  });
  window.addEventListener(
    "toucend",
    (e) => touchend(ctx, e as MutableEvent),
    false
  );
};
class DndContext {
  touchTimer: number | undefined;
  dragging: DndEvent | undefined;
  handler: DndHelper;
  data: Map<string, any>;
  originalEvent: Event | undefined | null;
  constructor(handler: DndHelper) {
    this.touchTimer = undefined;
    this.handler = handler;
    this.data = new Map();
    install(this);
  }
  capture(name: string, value: any): void {
    this.data.set(name, value);
  }
  getData(name: string): any {
    return this.data.get(name);
  }
}

export { DndContext };
