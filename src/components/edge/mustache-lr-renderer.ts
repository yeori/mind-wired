import { Point } from "../../service/geom";
import type { CanvasUI } from "../canvas-ui";
import { type NodeRect } from "../node/node-type";
import { type NodeUI } from "../node/node-ui";
import { AbstractEdgeRenderer } from "./edge-renderer-type";
import type EdgeStyle from "./edge-style";

export type MustachLREdgeOption = {
  valign: "bottom" | "center" | "top";
};
const valignOf = (option: MustachLREdgeOption) => {
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
const renderUnderline = (
  canvas: CanvasUI,
  style: EdgeStyle,
  rect: NodeRect,
  lineWidth: number
) => {
  const offset = lineWidth / 2;
  canvas.drawPath(
    [
      { x: rect.left, y: rect.bottom + offset } as Point,
      { x: rect.right, y: rect.bottom + offset } as Point,
    ],
    { lineWidth, strokeStyle: style.color },
    (ctx) => {
      if (style.dash) {
        ctx.setLineDash(style.dash);
      }
    }
  );
};
const rnederCurve = (
  canvas: CanvasUI,
  src: Point,
  srcStyle: EdgeStyle,
  dst: Point,
  dstStyle: EdgeStyle
) => {
  const { scale } = canvas;
  const srcLineWidth = srcStyle.width * scale;
  const dstLineWidth = dstStyle.width * scale;
  const lineWidth = Math.min(srcLineWidth, dstLineWidth);
  const distance = dst.x - src.x;
  const lineOffset = Math.abs(srcLineWidth - dstLineWidth);
  src.y -= lineOffset / 2;
  const props = { lineWidth: lineWidth, strokeStyle: dstStyle.color };
  const rendererFn = (ctx: CanvasRenderingContext2D) => {
    if (dstStyle.dash) {
      ctx.setLineDash(dstStyle.dash);
    }
  };
  canvas.drawBeizeCurve(
    src,
    dst,
    {
      cpoints: [
        { x: src.x + distance / 2, y: src.y } as Point,
        { x: dst.x - distance / 2, y: dst.y } as Point,
      ],
      props,
    },
    rendererFn
  );
  if (lineOffset > 0) {
    src.y += lineOffset;
    if (lineOffset / 2 >= dstLineWidth) {
      props.lineWidth = srcLineWidth;
    }
    canvas.drawBeizeCurve(
      src,
      dst,
      {
        cpoints: [
          { x: src.x + distance / 2, y: src.y } as Point,
          { x: dst.x - distance / 2, y: dst.y } as Point,
        ],
        props,
      },
      rendererFn
    );
  }
};
export class MustacheLREdgeRenderer extends AbstractEdgeRenderer<MustachLREdgeOption> {
  get name() {
    return "mustache_lr";
  }
  render(canvas: CanvasUI, srcNode: NodeUI, dstNode: NodeUI) {
    const [s, e] = [srcNode, dstNode].map((node) =>
      canvas.getNodeDimension(node)
    );
    const padding = {
      src: srcNode.$style.width * canvas.scale,
      dst: dstNode.$style.width * canvas.scale,
    };
    const option = this.getRenderingOption(srcNode);
    const isBottom = valignOf(option) === "bottom";

    if (isBottom && srcNode.firstChild() === dstNode) {
      renderUnderline(canvas, srcNode.$style, s, padding.src);
    }

    let sp: Point, ep: Point;
    const isLR = s.cx <= e.cx; // [srcNode ... dstNode]
    const labelY = isBottom ? "bottom" : "cy";
    if (isLR) {
      // srcNode ... dstNode
      sp = pointAt(s, labelY, "right", padding.src / 2);
      ep = pointAt(e, labelY, "left", padding.dst / 2);
    } else {
      // dstNode ... srcNode
      sp = pointAt(s, labelY, "left", padding.src / 2);
      ep = pointAt(e, labelY, "right", padding.dst / 2);
    }
    rnederCurve(canvas, sp, srcNode.$style, ep, dstNode.$style);
    if (dstNode.isLeaf() && isBottom) {
      renderUnderline(canvas, dstNode.$style, e, padding.dst);
    }
  }
}
