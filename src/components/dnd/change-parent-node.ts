import { dom } from "../../service";
import type { CanvasUI } from "../canvas-ui";

const changeParentDndHandler = (canvasUI: CanvasUI) => ({
  beforeDrag: () => {},
  dragging: (e) => {
    const { dx, dy } = e;
    const iconEl = canvasUI.dndContext.getData("iconEl");
    dom.css(iconEl, {
      transform: `translate(calc(-50% + ${dx}px), ${dy}px)`,
    });
  },
  afterDrag: () => {
    const iconEl = canvasUI.dndContext.getData("iconEl");
    const rect = dom.domRect(iconEl);
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    dom.css(iconEl, {
      transform: `translate(-50%, 0)`,
    });
    const newParentNode = canvasUI.findNodeAt(cx, cy);
    if (newParentNode) {
      const mrd = canvasUI.config.mindWired();
      const nodes = mrd.getSelectedNodes();
      if (
        nodes.filter((child) => newParentNode.isDescendantOf(child)).length > 0
      ) {
        // dropping parent on child
      } else {
        const mwd = canvasUI.config.mindWired();
        mwd.moveNodes(newParentNode, nodes, true);
      }
    }
  },
});
export default changeParentDndHandler;
