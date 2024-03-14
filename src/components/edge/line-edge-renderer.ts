// import { dom } from "../../service";
import type { CanvasUI } from "../canvas-ui";
import { type NodeUI } from "../node/node-ui";
import { AbstractEdgeRenderer } from "./edge-renderer-type";

export class LineEdgeRenderer extends AbstractEdgeRenderer<void> {
  get name() {
    return "line";
  }
  /**
   * drawing line between srcNode and dstNode
   * @param canvas
   * @param srcNode
   * @param dstNode
   */
  render(canvas: CanvasUI, srcNode: NodeUI, dstNode: NodeUI) {
    const { scale } = canvas;
    const [s, e] = [srcNode, dstNode].map((node) => {
      // fix node의 offset에 dimension정보를 담고 있음.
      const offset = node.offset();
      offset.x *= scale;
      offset.y *= scale;
      return offset;
    });
    const style = dstNode.$style;
    canvas.drawPath(
      [s, e],
      {
        lineWidth: dstNode.$style.width * scale,
        strokeStyle: style.color,
      },
      (ctx) => {
        if (style.dash) {
          ctx.setLineDash(style.dash);
        }
      }
    );
  }
}
