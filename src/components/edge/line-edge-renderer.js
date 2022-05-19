import EdgeStyle from "./edge-style";
/**
 * @param {CanvasUI} canvas
 * @param {NodeUI} srcNode
 * @param {NodeUI} dstNode
 */
const renderByLine = (canvas, srcNode, dstNode) => {
  const { scale } = canvas;
  const [s, e] = [srcNode, dstNode].map((node) => node.offset(scale));
  const style = srcNode.$style;
  canvas.drawPath([s, e], {
    lineWidth: style.width * scale,
    strokeStyle: style.color,
  });
};

export default renderByLine;
