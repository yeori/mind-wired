import { EVENT } from "../../service/event-bus";
/**
 * handles viewport dragging
 */

const viewportDndHandler = (canvasUI) => ({
  beforeDrag: (e) => {
    // console.log("[DND BEFORE]", e);
    canvasUI.dndContext.capture("offset", canvasUI.config.getOffset());
  },
  dragging: (e) => {
    // console.log("[DND dragging]", e);
    const { dx, dy } = e;
    // canvasUI.shiftBy(dx, dy);
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
  },
});

export default viewportDndHandler;
