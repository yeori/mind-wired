import { Point } from "../../service/geom";
import type { CanvasUI } from "../canvas-ui";
import { type NodeRect } from "../node/node-type";
import { type NodeUI } from "../node/node-ui";
import { AbstractEdgeRenderer } from "./edge-renderer-type";

const renderCurve = (
  canvas: CanvasUI,
  srcNode: NodeUI,
  s: NodeRect,
  dstNode: NodeUI,
  e: NodeRect,
  dy: number
) => {
  const { scale } = canvas;
  const srcWidth = srcNode.$style.width * scale;
  const dstWidth = dstNode.$style.width * scale;
  const width = Math.min(srcWidth, dstWidth);
  const offset = Math.abs(srcWidth - dstWidth);
  s.center.x -= offset / 2;
  const props = { lineWidth: width, strokeStyle: dstNode.$style.color };
  const rendererFn = (ctx: CanvasRenderingContext2D) => {
    if (srcNode.$style.dash) {
      ctx.setLineDash(srcNode.$style.dash);
    }
  };
  canvas.drawBeizeCurve(
    s.center,
    e.center,
    {
      cpoints: [
        { x: s.cx, y: s.cy + dy / 2 } as Point,
        { x: e.cx, y: e.cy - dy / 2 } as Point,
      ],
      props,
    },
    rendererFn
  );
  if (offset > 0) {
    s.center.y += offset;
    canvas.drawBeizeCurve(
      s.center,
      e.center,
      {
        cpoints: [
          { x: s.cx, y: s.cy + dy / 2 } as Point,
          { x: e.cx, y: e.cy - dy / 2 } as Point,
        ],
        props,
      },
      rendererFn
    );
  }
};
export class MustacheTBEdgeRenderer extends AbstractEdgeRenderer<void> {
  get name() {
    return "mustache_tb";
  }
  render(canvas: CanvasUI, srcNode: NodeUI, dstNode: NodeUI) {
    const [s, e] = [srcNode, dstNode].map((node) =>
      canvas.getNodeDimension(node)
    );
    const padding = { hor: 0, ver: 5 };

    let min: NodeRect, max: NodeRect;
    if (s.cy <= e.cy) {
      min = s;
      max = e;
    } else {
      min = e;
      max = s;
    }

    min.center.y = min.bottom + padding.ver;
    max.center.y = max.top - padding.ver;

    const dy = max.cy - min.cy;
    renderCurve(canvas, srcNode, s, dstNode, e, s === min ? dy : -dy);
  }
}
