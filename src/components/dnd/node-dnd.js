import { dom } from "../../service";
import { EVENT } from "../../service/event-bus";
/**
 * handles viewport dragging
 */

const viewportDndHandler = (canvasUI) => ({
  beforeDrag: (e) => {
    const { target } = e.originalEvent;
    const nodeEl = dom.closest(target, ".mwd-node");
    const nodeId = nodeEl.dataset.uid;
    canvasUI.dndContext.capture("nodeId", nodeId);
    const mrd = canvasUI.config.mindWired();
    const node = mrd.findNode((node) => node.uid === nodeId);
    canvasUI.config.emit(EVENT.SELECTION.NODE, {
      node,
      append: e.originalEvent.shiftKey,
    });
    canvasUI.config.emit(EVENT.DRAG.NODE, {
      nodeId,
      before: true,
      dragging: false,
      after: false,
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
      before: false,
      dragging: true,
      after: false,
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
      before: false,
      dragging: false,
      after: true,
      x: dx / scale,
      y: dy / scale,
    });
    // const { shiftKey } = e.originalEvent;
    // const mrd = canvasUI.config.mindWired();
    // const node = mrd.findNode((node) => node.uid === nodeId);
    // canvasUI.config.emit(EVENT.SELECTION.NODE, { node, append: shiftKey });
  },
});

export default viewportDndHandler;
