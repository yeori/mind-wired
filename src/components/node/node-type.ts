export type NodeModelType = "text" | "icon-badge" | "thumbnail";
/**
 * ```
 * number - same width and height
 * [number, number] - [width, height]
 * ```
 */
export type ImageSizeSpec = number | [number, number];
/**
 *  ```
 *  icon-badge
 *  +------+--------------+
 *  | IMG  |    T E X T   |
 *  +------+--------------+
 *
 *  [configuration]
 *  node: {
 *    model: {
 *      'icon-badge': {
 *        icon: 'https://image.url.value',
 *        text: 'text value'
 *      }
 *    },
 *    view: { ... }
 *  }
 * ```
 *
 */
export type IconBadgeSpec = {
  /**
   * uril to icon image
   */
  icon: string;
  /**
   * text
   */
  text: string;
  size?: ImageSizeSpec;
};
export type ThumbnailSpec = { path: string; size: ImageSizeSpec };
export type LinkSpec = { url: string; body: ModelSpec };
export type ProviderSpec = { key: any };
export type ModelSpec = {
  type?: NodeModelType;
  schema?: string;
  text?: string;
  thumbnail?: ThumbnailSpec;
  "icon-badge"?: IconBadgeSpec;
  link?: LinkSpec;
  provider?: ProviderSpec;
};
import { Point, WebColorString } from "../../setting";

export type EdgeSpec = {
  name?: string;
  color?: WebColorString;
  width?: number | ((node: NodeSpec, level: number) => number);
  dash?: number[];
  /**
   * if true, all descendant nodes use this edge(default: true)
   */
  inherit?: boolean;
  option?: any;
};
export type NodeLayoutType = "X-AXIS" | "Y-AXIS" | "XY-AXIS" | "DEFAULT";
export type NodeLayout = {
  type: NodeLayoutType;
};
export type ViewSpec = {
  x: number;
  y: number;
  layout?: NodeLayout;
  edge?: EdgeSpec;
  folding?: boolean;
};

export type NodeSpec = {
  root?: boolean;
  model: ModelSpec;
  view: ViewSpec;
  subs?: NodeSpec[];
};

export class NodeRect {
  constructor(readonly center: Point, private _rect: DOMRect) {}
  get width() {
    return this._rect.width;
  }
  get height() {
    return this._rect.height;
  }
  get left() {
    return this.center.x - this._rect.width / 2;
  }
  get right() {
    return this.center.x + this._rect.width / 2;
  }
  get top() {
    return this.center.y - this._rect.height / 2;
  }
  get bottom() {
    return this.center.y + this._rect.height / 2;
  }
  get cx() {
    return this.center.x;
  }
  get cy() {
    return this.center.y;
  }
  get x() {
    return this.left;
  }
  get y() {
    return this.top;
  }
  get r() {
    return this.right;
  }
  get b() {
    return this.bottom;
  }
  merge(other: NodeRect) {
    if (this === other) {
      return this;
    }
    this.center.x = other.center.x;
    this.center.y = other.center.y;

    const minX = Math.min(this._rect.x, other._rect.x);
    const minY = Math.min(this._rect.y, other._rect.y);
    const maxX = Math.max(this._rect.right, other._rect.right);
    const maxY = Math.max(this._rect.bottom, other._rect.bottom);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    this.center.x = cx;
    this.center.y = cy;
    this._rect = new DOMRect(minX, minY, maxX - minX, maxY - minY);
    return this;
  }
}
