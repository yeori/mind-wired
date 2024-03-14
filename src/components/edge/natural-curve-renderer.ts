/**
 * natural curve
 */
import type { CanvasUI } from "../canvas-ui";
import type { NodeUI } from "../node/node-ui";
import { AbstractEdgeRenderer } from "./edge-renderer-type";

export type NaturalCurveEdgeOption = {
  deg: number;
  ratio: number;
};
export class NaturalCourveEdgeRenderer extends AbstractEdgeRenderer<NaturalCurveEdgeOption> {
  get name() {
    return "curve";
  }
  get defaultOption() {
    return { deg: 20, ratio: 0.4 } as NaturalCurveEdgeOption;
  }
  render(canvas: CanvasUI, srcNode: NodeUI, dstNode: NodeUI) {
    const { scale } = canvas;
    const [s, e] = [srcNode, dstNode].map((node) =>
      canvas.getScaledOffset(node)
    );
    const style = dstNode.$style;
    const option = this.getRenderingOption(dstNode);
    canvas.drawCurve(
      s,
      e,
      {
        degree: option.deg || 20,
        ratio: option.ratio || 0.4,
        props: {
          lineWidth: style.width * scale,
          strokeStyle: style.color,
        },
      },
      style.getEdgeRenderer()
    );
  }
}
