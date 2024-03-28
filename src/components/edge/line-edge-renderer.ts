import { Point } from "@/setting";
import type { CanvasUI } from "../canvas-ui";
import { NodeRect } from "../node/node-type";
import { type NodeUI } from "../node/node-ui";
import { AbstractEdgeRenderer } from "./edge-renderer-type";

const valignOf = (option: any) => {
  const valign = option && option.valign;
  return valign || "center";
};
const pointAt = <K extends keyof NodeRect>(
  rect: NodeRect,
  lblY: K,
  lblX: K,
  offsetY: number
) => {
  const x = rect[lblX] as number;
  const y = rect[lblY] as number;
  return new Point(x, y + offsetY);
};
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
    const [s, e] = [srcNode, dstNode].map((node) =>
      canvas.getNodeDimension(node)
    );

    const option = this.getRenderingOption(srcNode);
    const valign = valignOf(option);
    const pathes: Point[] = [];
    const style = dstNode.$style;
    const lineWidth = style.width * scale;
    if (valign === "center") {
      pathes.push(s.center, e.center);
    } else if (valign === "bottom") {
      const offsetY = lineWidth / 2;
      const isLR = s.cx <= e.cx;
      if (srcNode.isRoot() && srcNode.firstChild() === dstNode) {
        // const p = bottomLine(s);
        const dir = isLR ? "left" : "right";
        pathes.push(pointAt(s, "bottom", dir, offsetY));
      }
      if (isLR) {
        // src ... dst
        const p = pointAt(s, "bottom", "right", offsetY);
        const p0 = p.clone();
        p0.x = p.x - 1;
        pathes.push(p0);
        pathes.push(p);
        pathes.push(pointAt(e, "bottom", "left", offsetY));
        pathes.push(pointAt(e, "bottom", "right", offsetY));
      } else {
        // dst ... src
        const p = pointAt(s, "bottom", "left", offsetY);
        const p0 = p.clone();
        p0.x = p.x + 1;
        pathes.push(p0);
        pathes.push(p);
        pathes.push(pointAt(e, "bottom", "right", offsetY));
        pathes.push(pointAt(e, "bottom", "left", offsetY));
      }
    }
    canvas.drawPath(
      pathes,
      {
        lineWidth,
        strokeStyle: style.color,
        lineJoin: "round",
      },
      (ctx) => {
        if (style.dash) {
          ctx.setLineDash(style.dash);
        }
      }
    );
  }
}
