/**
 * natural curve
 */
import EdgeStyle from "./edge-style";
/**
 * @param {CanvasUI} canvas
 * @param {NodeUI} srcNode
 * @param {NodeUI} dstNode
 */
const renderByCurve = (canvas, srcNode, dstNode) => {
  const { scale } = canvas;
  const [s, e] = [srcNode, dstNode].map((node) => node.offset(scale));
  const style = srcNode.$cachedStyle || new EdgeStyle(srcNode);
  srcNode.$cachedStyle = style;
  canvas.drawCurve(s, e, {
    degree: style.option.deg || 20,
    ratio: style.option.ratio || 0.4,
    props: {
      lineWidth: style.width * scale,
      strokeStyle: style.color,
    },
  });
};

export default renderByCurve;
