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
    canvasUI.config.emit(EVENT.DRAG.NODE, {
      nodeId,
      before: false,
      dragging: true,
      after: false,
      x: dx,
      y: dy,
    });
  },
  afterDrag: (e) => {
    // console.log("[DND AFTER]", e);
    const { dx, dy } = e;
    // canvasUI.shiftBy(dx, dy);
    const nodeId = canvasUI.dndContext.getData("nodeId");
    canvasUI.config.emit(EVENT.DRAG.NODE, {
      nodeId,
      before: false,
      dragging: false,
      after: true,
      x: dx,
      y: dy,
    });
  },
});

export default viewportDndHandler;
