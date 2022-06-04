/**
 * natural curve
 */
/**
 * @param {CanvasUI} canvas
 * @param {NodeUI} srcNode
 * @param {NodeUI} dstNode
 */
const renderByCurve = (canvas, srcNode, dstNode) => {
  const { scale } = canvas;
  const [s, e] = [srcNode, dstNode].map((node) => node.offset(scale));
  const style = dstNode.$style;
  canvas.drawCurve(
    s,
    e,
    {
      degree: style.option.deg || 20,
      ratio: style.option.ratio || 0.4,
      props: {
        lineWidth: style.width * scale,
        strokeStyle: style.color,
      },
    },
    style.getEdgeRenderer()
  );
};

export default renderByCurve;
