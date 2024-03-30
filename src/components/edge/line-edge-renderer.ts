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
    const auxPathes: Point[] = [];
    const srcStyle = srcNode.$style;
    const srcLineWidth = srcStyle.width * scale;
    const dstStyle = dstNode.$style;
    const dstLineWidth = dstStyle.width * scale;
    const lineGap = Math.abs(srcLineWidth - dstLineWidth);
    const offsetY = dstLineWidth / 2;

    if (valign === "center") {
      pathes.push(s.center, e.center);
    } else if (valign === "bottom") {
      const isLR = s.cx <= e.cx;
      const shiftX = isLR ? 2 : -2;
      const sLabel = isLR ? "right" : "left";
      const eLabel: ["left" | "right", "left" | "right"] = isLR
        ? ["left", "right"]
        : ["right", "left"];
      const s0 = pointAt(s, "bottom", sLabel, offsetY);
      const s1 = s0.clone();
      s1.x += shiftX;
      const d1 = pointAt(e, "bottom", eLabel[0], offsetY);
      const d0 = d1.clone();
      d0.x -= shiftX;
      pathes.push(s0, s1, d0, d1);
      pathes.push(pointAt(e, "bottom", eLabel[1], offsetY));
      if (lineGap > 0) {
        const p0 = s0.clone();
        p0.y += lineGap;
        const p1 = s1.clone();
        p1.y += lineGap;
        auxPathes.push(p0, p1, d0, d1);
      }
    }
    canvas.drawPath(
      pathes,
      {
        lineWidth: dstLineWidth,
        strokeStyle: dstStyle.color,
        lineJoin: "round",
      },
      (ctx) => {
        if (dstStyle.dash) {
          ctx.setLineDash(dstStyle.dash);
        }
      }
    );
    if (auxPathes.length > 0) {
      canvas.drawPath(
        auxPathes,
        {
          lineWidth: dstLineWidth,
          strokeStyle: dstStyle.color,
          lineJoin: "round",
        },
        (ctx) => {
          if (dstStyle.dash) {
            ctx.setLineDash(dstStyle.dash);
          }
        }
      );
    }
    if (srcNode.isRoot() && valign === "bottom") {
      const offset = srcLineWidth / 2;
      canvas.drawPath(
        [
          pointAt(s, "bottom", "left", offset),
          pointAt(s, "bottom", "right", offset),
        ],
        {
          lineWidth: srcLineWidth,
          strokeStyle: srcStyle.color,
          lineJoin: "round",
        },
        (ctx) => {
          if (srcStyle.dash) {
            ctx.setLineDash(srcStyle.dash);
          }
        }
      );
    }
  }
}
