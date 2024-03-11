import { IEdgeRenderer } from ".";
import { dom } from "../../service";
import { Point } from "../../service/geom";
import type CanvasUI from "../canvas-ui";
import { type NodeUI } from "../node/node-ui";

const renderCurve = (
  canvas: CanvasUI,
  srcNode: NodeUI,
  s: Point,
  dstNode: NodeUI,
  e: Point,
  dy: number
) => {
  const { scale } = canvas;
  const srcWidth = srcNode.$style.width;
  const dstWidth = dstNode.$style.width;
  const width = Math.min(srcWidth, dstWidth);
  const offset = Math.abs(srcWidth - dstWidth);
  s.x -= offset / 2;
  const props = { lineWidth: width * scale, strokeStyle: dstNode.$style.color };
  const rendererFn = dstNode.$style.getEdgeRenderer();
  canvas.drawBeizeCurve(
    s,
    e,
    {
      cpoints: [
        { x: s.x, y: s.y + dy / 2 } as Point,
        { x: e.x, y: e.y - dy / 2 } as Point,
      ],
      props,
    },
    rendererFn
  );
  if (offset > 0) {
    s.y += offset;
    canvas.drawBeizeCurve(
      s,
      e,
      {
        cpoints: [
          { x: s.x, y: s.y + dy / 2 } as Point,
          { x: e.x, y: e.y - dy / 2 } as Point,
        ],
        props,
      },
      rendererFn
    );
  }
};
export class MustacheTBEdgeRenderer implements IEdgeRenderer {
  get name() {
    return "mustache_tb";
  }
  // fix canvas 타입 필요
  render(canvas: CanvasUI, srcNode: NodeUI, dstNode: NodeUI) {
    // const { scale }: { scale: number } = canvas;
    const [s, e] = [srcNode, dstNode].map((node) => {
      // const offset = node.offset(scale);
      // fix node의 offset에 dimension정보를 담고 있음.
      const offset = node.offset() as any;
      const rect = dom.domRect(node.$bodyEl);
      const { width, height } = rect;
      offset.left = offset.x - width / 2;
      offset.right = offset.x + width / 2;
      offset.top = offset.y - height / 2;
      offset.bottom = offset.y + height / 2;
      offset.width = width;
      offset.height = height;
      return offset;
    });
    const padding = { hor: 0, ver: 5 };

    let min, max;
    if (s.y <= e.y) {
      min = s;
      max = e;
    } else {
      min = e;
      max = s;
    }

    min.y = min.bottom + padding.ver;
    max.y = max.top - padding.ver;

    // const dx = max.x - min.x;
    const dy = max.y - min.y;
    // const w = widthOf(srcNode);
    renderCurve(canvas, srcNode, s, dstNode, e, s === min ? dy : -dy);
  }
}
