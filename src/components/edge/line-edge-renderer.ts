// import { dom } from "../../service";
import { IEdgeRenderer } from ".";
import type CanvasUI from "../canvas-ui";
import { type NodeUI } from "../node/node-ui";

export class LineEdgeRenderer implements IEdgeRenderer {
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
      const offset = node.offset(); /** FIXME NodeRect타입 */ // pure logical value
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
