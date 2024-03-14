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
  const srcWidth = srcNode.$style.width;
  const dstWidth = dstNode.$style.width;
  const width = Math.min(srcWidth, dstWidth);
  const offset = Math.abs(srcWidth - dstWidth);
  s.offset.x -= offset / 2;
  const props = { lineWidth: width * scale, strokeStyle: dstNode.$style.color };
  const rendererFn = dstNode.$style.getEdgeRenderer();
  canvas.drawBeizeCurve(
    s.offset,
    e.offset,
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
    s.offset.y += offset;
    canvas.drawBeizeCurve(
      s.offset,
      e.offset,
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
    const [s, e] = [srcNode, dstNode].map((node) => node.dimension());
    const padding = { hor: 0, ver: 5 };

    let min: NodeRect, max: NodeRect;
    if (s.cy <= e.cy) {
      min = s;
      max = e;
    } else {
      min = e;
      max = s;
    }

    min.offset.y = min.bottom + padding.ver;
    max.offset.y = max.top - padding.ver;

    const dy = max.cy - min.cy;
    renderCurve(canvas, srcNode, s, dstNode, e, s === min ? dy : -dy);
  }
}
