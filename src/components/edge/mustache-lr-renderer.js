import { dom } from "../../service";

const widthOf = (node) => {
  const { width } = node.$style;
  return typeof width === "function" ? width(node) : width;
};
const valignOf = (node) => {
  const { option } = node.$style;
  const valign = option && option.valign;
  return valign || "center";
};
const renderUnderline = (canvas, node, rect, padding) => {
  const width = widthOf(node);
  // const { scale } = canvas;
  canvas.drawPath(
    [
      { x: rect.left - padding.hor, y: rect.bottom + padding.ver },
      { x: rect.right + padding.hor, y: rect.bottom + padding.ver },
    ],
    { lineWidth: width, strokeStyle: node.$style.color },
    node.$style.getEdgeRenderer()
  );
};
const renderCurve = (canvas, srcNode, s, dstNode, e, dx) => {
  // const { scale } = canvas;
  const srcWidth = widthOf(srcNode);
  const dstWidth = widthOf(dstNode);
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
        { x: s.x + dx / 2, y: s.y },
        { x: e.x - dx / 2, y: e.y },
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
          { x: s.x + dx / 2, y: s.y },
          { x: e.x - dx / 2, y: e.y },
        ],
        props,
      },
      rendererFn
    );
  }
};
const renderByMustache = (canvas, srcNode, dstNode) => {
  const { scale } = canvas;
  const [s, e] = [srcNode, dstNode].map((node) => {
    const offset = node.offset(); // pure logical value
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
  const dy = max.y - min.y;
  const w = widthOf(srcNode);
  if (padding.ver > 0 && srcNode.isRoot() && srcNode.firstChild() === dstNode) {
    renderUnderline(canvas, srcNode, s, padding);
  }
  renderCurve(canvas, srcNode, s, dstNode, e, s === min ? dx : -dx);
  if (padding.ver > 0) {
    renderUnderline(canvas, dstNode, e, padding);
  }
  // renderUnderline(canvas, dstNode, e, padding);
  // if (dstNode.isLeaf() && padding.ver > 0) {
  // }
};

export default renderByMustache;
