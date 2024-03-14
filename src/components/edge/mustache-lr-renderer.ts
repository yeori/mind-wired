import { Point } from "../../service/geom";
import type { CanvasUI } from "../canvas-ui";
import { type NodeRect } from "../node/node-type";
import { type NodeUI } from "../node/node-ui";
import { AbstractEdgeRenderer } from "./edge-renderer-type";

export type MustachLREdgeOption = {
  valign: "bottom" | "center" | "top";
};
const valignOf = (option: MustachLREdgeOption) => {
  const valign = option && option.valign;
  return valign || "center";
};
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
  s: NodeRect,
  dstNode: NodeUI,
  e: NodeRect,
  dx: number
) => {
  // const { scale } = canvas;
  const srcWidth = srcNode.$style.width;
  const dstWidth = dstNode.$style.width;
  const width = Math.min(srcWidth, dstWidth);
  const offset = Math.abs(srcWidth - dstWidth);
  s.offset.y -= offset / 2;
  const props = { lineWidth: width, strokeStyle: dstNode.$style.color };
  const rendererFn = dstNode.$style.getEdgeRenderer();
  canvas.drawBeizeCurve(
    s.offset,
    e.offset,
    {
      cpoints: [
        { x: s.cx + dx / 2, y: s.cy } as Point,
        { x: e.cx - dx / 2, y: e.cy } as Point,
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
          { x: s.cx + dx / 2, y: s.cy } as Point,
          { x: e.cx - dx / 2, y: e.cy } as Point,
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
    const [s, e] = [srcNode, dstNode].map((node) => node.dimension());
    const padding = { hor: 0, ver: 0 };
    const option = this.getRenderingOption(srcNode);
    if (valignOf(option) === "bottom") {
      padding.ver = 5;
    }

    let min: NodeRect, max: NodeRect;
    if (s.cx <= e.cx) {
      min = s;
      max = e;
    } else {
      min = e;
      max = s;
    }

    min.offset.x = min.right + padding.hor;
    max.offset.x = max.left - padding.hor;
    if (padding.ver > 0) {
      min.offset.y = min.bottom + padding.ver;
      max.offset.y = max.bottom + padding.ver;
    }
    const dx = max.cx - min.cx;
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
