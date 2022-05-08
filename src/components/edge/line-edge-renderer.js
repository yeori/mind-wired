/**
 * @param {CanvasUI} canvas
 * @param {NodeUI} srcNode
 * @param {NodeUI} dstNode
 */
const renderByLine = (canvas, srcNode, dstNode) => {
  const ctx = canvas.getContext();
  const { scale } = canvas;
  const [s, e] = [srcNode, dstNode].map((node) => node.offset(scale));
  canvas.drawPath([s, e], { lineWidth: 0.5 * scale, strokeStyle: "red" });
  // ctx.lineWidth = 2;
  // ctx.beginPath();
  // ctx.moveTo(s.x, s.y);
  // ctx.lineTo(e.x, e.y);
  // ctx.closePath();
  // ctx.stroke();
};

export default renderByLine;
