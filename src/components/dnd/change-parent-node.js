import { dom } from "../../service";

const changeParentDndHandler = (canvasUI) => ({
  beforeDrag: (e) => {
    const { target } = e.originalEvent;
    const nodeEl = dom.closest(target, ".mwd-node");
    const iconEl = target;
    const mrd = canvasUI.config.mindWired();
    const node = mrd.findNode((node) => node.uid === nodeEl.dataset.uid);
    const rect = dom.domRect(node.$bodyEl);
    canvasUI.dndContext.capture("node", node);
    canvasUI.dndContext.capture("iconEl", iconEl);
    canvasUI.dndContext.capture("iconY", rect.height / 2 + 15);
  },
  dragging: (e) => {
    const { dx, dy } = e;
    const iconEl = canvasUI.dndContext.getData("iconEl");
    const iconY = canvasUI.dndContext.getData("iconY");
    const { scale } = canvasUI.config;
    dom.css(iconEl, {
      transform: `translate(${dx / scale}px, ${(iconY + dy) / scale}px)`,
    });
  },
  afterDrag: () => {
    const iconEl = canvasUI.dndContext.getData("iconEl");
    const iconY = canvasUI.dndContext.getData("iconY");
    const { scale } = canvasUI.config;
    const rect = dom.domRect(iconEl);
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    dom.css(iconEl, {
      transform: `translate(0px, ${iconY}px)`,
    });
    const newParentNode = canvasUI.findNodeAt(cx, cy);
    if (newParentNode) {
      const activeNode = canvasUI.dndContext.getData("node");
      if (newParentNode.isDescendantOf(activeNode)) {
        // dropping parent on child
      } else {
        const mwd = canvasUI.config.mindWired();
        mwd.moveNodes(newParentNode, [activeNode]);
      }
    }
  },
});
export default changeParentDndHandler;
