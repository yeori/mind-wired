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
const renderCurve = (canvas, srcNode, s, dstNode, e, dy) => {
  const { scale } = canvas;
  const srcWidth = widthOf(srcNode);
  const dstWidth = widthOf(dstNode);
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
        { x: s.x, y: s.y + dy / 2 },
        { x: e.x, y: e.y - dy / 2 },
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
          { x: s.x, y: s.y + dy / 2 },
          { x: e.x, y: e.y - dy / 2 },
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
    const offset = node.offset(scale);
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
};

export default renderByMustache;
