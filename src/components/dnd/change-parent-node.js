import { dom } from "../../service";

const changeParentDndHandler = (canvasUI) => ({
  beforeDrag: (e) => {
    const { target } = e.originalEvent;
    const nodeEl = dom.closest(target, ".mwd-node");
    const iconEl = target;
    const mrd = canvasUI.config.mindWired();
    const node = mrd.findNode((node) => node.uid === nodeEl.dataset.uid);
    canvasUI.dndContext.capture("node", node);
    canvasUI.dndContext.capture("iconEl", iconEl);
  },
  dragging: (e) => {
    const { dx, dy } = e;
    const iconEl = canvasUI.dndContext.getData("iconEl");
    const { scale } = canvasUI.config;
    dom.css(iconEl, {
      transform: `translate(${dx / scale}px, ${dy / scale}px)`,
    });
  },
  afterDrag: () => {
    const iconEl = canvasUI.dndContext.getData("iconEl");
    const { scale } = canvasUI.config;
    const rect = dom.domRect(iconEl);
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    dom.css(iconEl, {
      transform: `translate(0px, 0px)`,
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
    // console.log(newParentNode);
  },
});
export default changeParentDndHandler;
