import type { NodeDragEventArg } from "../../mindwired-event";
import { EVENT } from "../../service/event-bus";
import type { CanvasUI } from "../canvas-ui";

const nodeDndHandler = (canvasUI: CanvasUI) => ({
  beforeDrag: (e) => {
    const { target } = e.originalEvent;
    const nodeEl = canvasUI.dom.closest(target, ".mwd-node") as HTMLElement;
    const nodeId = nodeEl.dataset.uid;
    canvasUI.dndContext.capture("nodeId", nodeId);
    const mrd = canvasUI.config.mindWired();
    const node = mrd.findNode((node) => node.uid === nodeId);
    canvasUI.config.emit(EVENT.NODE.SELECTED, {
      nodes: [node],
      append: e.originalEvent.shiftKey,
      type: "select",
    });
    canvasUI.config.emit<NodeDragEventArg>(EVENT.DRAG.NODE, {
      nodeId,
      state: "ready",
      target: e.originalEvent.shiftKey ? "children" : "all",
      x: 0,
      y: 0,
    });
  },
  dragging: (e) => {
    const { dx, dy } = e;
    const nodeId = canvasUI.dndContext.getData("nodeId");
    const { scale } = canvasUI.config;
    // const scale = 1;
    canvasUI.config.emit<NodeDragEventArg>(EVENT.DRAG.NODE, {
      nodeId,
      state: "drag",
      target: e.originalEvent.shiftKey ? "children" : "all",
      x: dx / scale,
      y: dy / scale,
    });
  },
  afterDrag: (e) => {
    // console.log("[DND AFTER]", e);
    const { dx, dy } = e;
    // canvasUI.shiftBy(dx, dy);
    const nodeId = canvasUI.dndContext.getData("nodeId");
    const { scale } = canvasUI.config;
    // const scale = 1;
    canvasUI.config.emit<NodeDragEventArg>(EVENT.DRAG.NODE, {
      nodeId,
      state: "done",
      target: e.originalEvent.shiftKey ? "children" : "all",
      x: dx / scale,
      y: dy / scale,
    });
  },
});

export default nodeDndHandler;
