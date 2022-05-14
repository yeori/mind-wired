/**
 * move dst to dst'
 *
 *   |
 *   |             + dst'
 *   |
 *   |                + dst
 *   |  by deg
 *   +-------------------------->
 *  base
 *
 * @param {Point} base
 * @param {Point} dst
 * @param {number} degree - [0~360]
 */
const rotate = (base, dst, degree, { scale = 1 }) => {
  const dx = (dst.x - base.x) * scale;
  const dy = (dst.y - base.y) * scale;
  const rad = (degree * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return {
    x: dx * cos - dy * sin + base.x,
    y: dx * sin + dy * cos + base.y,
  };
};

export default {
  rotate,
};
