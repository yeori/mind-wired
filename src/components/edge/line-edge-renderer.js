import { dom } from "../../service";
/**
 * @param {CanvasUI} canvas
 * @param {NodeUI} srcNode
 * @param {NodeUI} dstNode
 */
const renderByLine = (canvas, srcNode, dstNode) => {
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
  const style = dstNode.$style;
  canvas.drawPath(
    [s, e],
    {
      lineWidth: style.width * scale,
      strokeStyle: style.color,
    },
    style.getEdgeRenderer()
  );
};

export default renderByLine;
