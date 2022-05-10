import { EVENT } from "../../service/event-bus";
/**
 * handles viewport dragging
 */

const viewportDndHandler = (canvasUI) => ({
  beforeDrag: (e) => {
    canvasUI.dndContext.capture("offset", canvasUI.config.getOffset());
  },
  dragging: (e) => {
    const { dx, dy } = e;
    canvasUI.dndContext.capture("dragged", true);
    const offset = canvasUI.dndContext.getData("offset");
    canvasUI.config.emit(EVENT.DRAG.VIEWPORT, {
      x: offset.x + dx,
      y: offset.y + dy,
    });
  },
  afterDrag: (e) => {
    // console.log("[DND AFTER]", e);
    const { dx, dy } = e;
    // canvasUI.shiftBy(dx, dy);
    const offset = canvasUI.dndContext.getData("offset");
    canvasUI.config.emit(EVENT.DRAG.VIEWPORT, {
      x: offset.x + dx,
      y: offset.y + dy,
    });
    const dragged = canvasUI.dndContext.getData("dragged");
    if (!dragged) {
      // clicked, no drag
      canvasUI.config.emit(EVENT.CLICK.VIEWPORT);
    }
  },
});

export default viewportDndHandler;
