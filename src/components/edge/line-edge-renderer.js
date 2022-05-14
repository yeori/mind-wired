import EdgeStyle from "./edge-style";
/**
 * @param {CanvasUI} canvas
 * @param {NodeUI} srcNode
 * @param {NodeUI} dstNode
 */
const renderByLine = (canvas, srcNode, dstNode) => {
  const ctx = canvas.getContext();
  const { scale } = canvas;
  const [s, e] = [srcNode, dstNode].map((node) => node.offset(scale));
  const style = srcNode.$cachedStyle || new EdgeStyle(srcNode);
  srcNode.$cachedStyle = style;
  canvas.drawPath([s, e], {
    lineWidth: style.width * scale,
    strokeStyle: style.color,
  });
};

export default renderByLine;
