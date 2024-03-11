export class Point {
  x: number;
  y: number;
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
  clone() {
    return new Point(this.x, this.y);
  }
  sum(other: Point) {
    return new Point(this.x + other.x, this.y + other.y);
  }
}
export type RotationParam = { scale: number };
export class Geometry {
  /**
   * move dst to dst'
   * ```
   *
   *   |
   *   |             + dst'
   *   |
   *   |                + dst
   *   |  by deg
   *   +-------------------------->
   *  base
   *```
   * @param {Point} base
   * @param {Point} dst
   * @param {number} degree - [0~360]
   */
  rotate = (
    base: Point,
    dst: Point,
    degree: number,
    param: RotationParam = { scale: 1 }
  ) => {
    const dx = (dst.x - base.x) * param.scale;
    const dy = (dst.y - base.y) * param.scale;
    const rad = (degree * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return {
      x: dx * cos - dy * sin + base.x,
      y: dx * sin + dy * cos + base.y,
    };
  };
}

export const geom = new Geometry();
