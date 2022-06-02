import { dom } from "../../service";
import { EVENT } from "../../service/event-bus";
/**
 * handles viewport dragging
 */

const nodeDndHandler = (canvasUI) => ({
  beforeDrag: (e) => {
    const { target } = e.originalEvent;
    const nodeEl = dom.closest(target, ".mwd-node");
    const nodeId = nodeEl.dataset.uid;
    canvasUI.dndContext.capture("nodeId", nodeId);
    const mrd = canvasUI.config.mindWired();
    const node = mrd.findNode((node) => node.uid === nodeId);
    canvasUI.config.emit(EVENT.NODE.SELECTED, {
      node,
      append: e.originalEvent.shiftKey,
    });
    canvasUI.config.emit(EVENT.DRAG.NODE, {
      nodeId,
      state: "READY",
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
    canvasUI.config.emit(EVENT.DRAG.NODE, {
      nodeId,
      state: "DRAG",
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
    canvasUI.config.emit(EVENT.DRAG.NODE, {
      nodeId,
      state: "DONE",
      target: e.originalEvent.shiftKey ? "children" : "all",
      x: dx / scale,
      y: dy / scale,
    });
  },
});

export default nodeDndHandler;
