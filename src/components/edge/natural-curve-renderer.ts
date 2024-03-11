/**
 * natural curve
 */
import { IEdgeRenderer } from ".";
import type CanvasUI from "../canvas-ui";
import { NodeUI } from "../node/node-ui";

export class NaturalCourveEdgeRenderer implements IEdgeRenderer {
  name: "curve";
  render(canvas: CanvasUI, srcNode: NodeUI, dstNode: NodeUI) {
    const { scale }: { scale: number } = canvas;
    const [s, e] = [srcNode, dstNode].map((node) => node.offset());
    const style = dstNode.$style;
    canvas.drawCurve(
      s,
      e,
      {
        degree: style.option.deg || 20,
        ratio: style.option.ratio || 0.4,
        props: {
          lineWidth: style.width * scale,
          strokeStyle: style.color,
        },
      },
      style.getEdgeRenderer()
    );
  }
}
