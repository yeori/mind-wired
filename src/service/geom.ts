/**
 * degrees per 1 radian := 57.29577...
 */
const DEGREE_PER_RADIAN = 180 / Math.PI;

export type RotationParam = { scale: number };
/**
 * class Point(x, y) means screen-based coord, not mathmatical coord
 *
 */
export class Point {
  x: number;
  y: number;
  static readonly ZERO = new Point(0, 0);
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
export class Heading {
  /**
   * [-180, +180] degrees from positive X axis
   */
  private _degree: number;
  constructor(readonly target: Point, readonly base: Point = Point.ZERO) {
    const dx = this.target.x - base.x;
    const dy = this.target.y - base.y;
    this._degree = Math.atan2(dy === 0 ? 0 : -dy, dx) * DEGREE_PER_RADIAN;
  }
  /**
   * counter clock wise from X-AXIS(east), which is quadrant(1 > 2 > 3 > 4)
   * @returns [0, 360) degree
   */
  get ccwx() {
    const deg = this._degree;
    return deg < 0 ? 360 + deg : deg;
  }
  /**
   * clock wise from Y-AXIS(north), which is quadrant(1 > 4 > 3 > 2)
   * @returns [0, 360) degree
   */
  get cwy() {
    let deg = 90 - this._degree;
    return deg < 0 ? 360 + deg : deg;
  }
  /**
   * get quadrant number in math
   * ```
   *   2 | 1
   *  ---+---> X
   *   3 | 4
   * ```
   * @returns 1 when [0, 90), 2 when [90, 180), 3 when [180, 270), 4 when [270, 360)
   */
  get quadrant() {
    const deg = this.ccwx;
    if (deg < 90) {
      return 1;
    } else if (deg < 180) {
      return 2;
    } else if (deg < 270) {
      return 3;
    } else if (deg < 360) {
      return 4;
    } else {
      throw new Error(`unexpected ccwx: ${deg}`);
    }
  }
}
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
  heading(p: Point, base?: Point) {
    return new Heading(p, base);
  }
}

export const geom = new Geometry();
