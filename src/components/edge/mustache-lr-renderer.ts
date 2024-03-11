import { IEdgeRenderer } from ".";
import { dom } from "../../service";
import { Point } from "../../service/geom";
import type CanvasUI from "../canvas-ui";
import { type NodeUI } from "../node/node-ui";

const valignOf = (node: NodeUI) => {
  const { option } = node.$style;
  const valign = option && option.valign;
  return valign || "center";
};
// fix node의 offset에 dimension정보를 담고 있음. rect도 동일
// fix padding{ hor: 0, ver: 0 } 타입 필요
const renderUnderline = (
  canvas: CanvasUI,
  node: NodeUI,
  rect: any,
  padding: any
) => {
  const width = node.$style.width;
  canvas.drawPath(
    [
      { x: rect.left - padding.hor, y: rect.bottom + padding.ver } as Point,
      { x: rect.right + padding.hor, y: rect.bottom + padding.ver } as Point,
    ],
    { lineWidth: width, strokeStyle: node.$style.color },
    node.$style.getEdgeRenderer()
  );
};
const renderCurve = (
  canvas: CanvasUI,
  srcNode: NodeUI,
  s: Point,
  dstNode: NodeUI,
  e: Point,
  dx: number
) => {
  // const { scale } = canvas;
  const srcWidth = srcNode.$style.width;
  const dstWidth = dstNode.$style.width;
  const width = Math.min(srcWidth, dstWidth);
  const offset = Math.abs(srcWidth - dstWidth);
  s.y -= offset / 2;
  const props = { lineWidth: width, strokeStyle: dstNode.$style.color };
  const rendererFn = dstNode.$style.getEdgeRenderer();
  canvas.drawBeizeCurve(
    s,
    e,
    {
      cpoints: [
        { x: s.x + dx / 2, y: s.y } as Point,
        { x: e.x - dx / 2, y: e.y } as Point,
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
          { x: s.x + dx / 2, y: s.y } as Point,
          { x: e.x - dx / 2, y: e.y } as Point,
        ],
        props,
      },
      rendererFn
    );
  }
};
export class MustacheLREdgeRenderer implements IEdgeRenderer {
  get name() {
    return "mustache_lr";
  }
  render(canvas: CanvasUI, srcNode: NodeUI, dstNode: NodeUI) {
    const { scale } = canvas;
    const [s, e] = [srcNode, dstNode].map((node) => {
      // fix node의 offset에 dimension정보를 담고 있음.
      const offset = node.offset() as any; // pure logical value
      offset.x *= scale;
      offset.y *= scale;
      const rect = dom.domRect(node.$bodyEl);
      const { width, height } = rect; // with scale applied
      offset.left = offset.x - width / 2;
      offset.right = offset.x + width / 2;
      offset.top = offset.y - height / 2;
      offset.bottom = offset.y + height / 2;
      offset.width = width;
      offset.height = height;
      return offset;
    });
    const padding = { hor: 0, ver: 0 };

    if (valignOf(srcNode) === "bottom") {
      padding.ver = 5;
    }

    let min, max;
    if (s.x <= e.x) {
      min = s;
      max = e;
    } else {
      min = e;
      max = s;
    }

    min.x = min.right + padding.hor;
    max.x = max.left - padding.hor;
    if (padding.ver > 0) {
      min.y = min.bottom + padding.ver;
      max.y = max.bottom + padding.ver;
    }
    const dx = max.x - min.x;
    // const dy = max.y - min.y;
    // const w = widthOf(srcNode);
    if (
      padding.ver > 0 &&
      srcNode.isRoot() &&
      srcNode.firstChild() === dstNode
    ) {
      renderUnderline(canvas, srcNode, s, padding);
    }
    renderCurve(canvas, srcNode, s, dstNode, e, s === min ? dx : -dx);
    if (padding.ver > 0) {
      renderUnderline(canvas, dstNode, e, padding);
    }
    // renderUnderline(canvas, dstNode, e, padding);
    // if (dstNode.isLeaf() && padding.ver > 0) {
    // }
  }
}
