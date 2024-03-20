import { DndEvent } from "../../service/dnd";
import { EVENT } from "../../service/event-bus";
import { Point } from "../../service/geom";
import type { CanvasUI } from "../canvas-ui";
/**
 * handles viewport dragging
 */

export const viewportDndHandler = (canvasUI: CanvasUI) => ({
  beforeDrag: (e: DndEvent) => {
    canvasUI.dndContext.capture("offset", canvasUI.config.getOffset());
  },
  dragging: (e: DndEvent) => {
    const { dx, dy } = e;
    if (dx === 0 && dy === 0) {
      return;
    }
    canvasUI.dndContext.capture("dragged", true);
    const offset = canvasUI.dndContext.getData("offset");
    canvasUI.config.emit(EVENT.DRAG.VIEWPORT, {
      state: "drag",
      offset: new Point(offset.x + dx, offset.y + dy),
    });
  },
  afterDrag: (e: DndEvent) => {
    // console.log("[DND AFTER]", e);
    const { dx, dy } = e;
    if (dx !== 0 || dy !== 0) {
      const offset = canvasUI.dndContext.getData("offset");
      canvasUI.config.emit(EVENT.DRAG.VIEWPORT, {
        state: "done",
        offset: new Point(offset.x + dx, offset.y + dy),
      });
    }

    const dragged = canvasUI.dndContext.getData("dragged");
    if (!dragged) {
      canvasUI.config.emit(EVENT.VIEWPORT.CLICKED);
    }
  },
});
