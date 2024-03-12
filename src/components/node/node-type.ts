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
export type ProviderSpec = { key: any };
export type ModelSpec = {
  type?: NodeModelType;
  schema?: string;
  text?: string;
  thumbnail?: ThumbnailSpec;
  "icon-badge"?: IconBadgeSpec;
  provider?: ProviderSpec;
};
import { Point, WebColorString } from "../../setting";

export type EdgeSpec = {
  name: string;
  color: WebColorString;
  width: number | ((node: NodeSpec, level?: number) => number);
  dash?: number[];
  /**
   * if true, all descendant nodes use this edge(default: true)
   */
  inherit?: boolean;
  option: any;
};
export type NodeAlignmentType = "X-AXIS" | "Y-AXIS" | "XY-AXIS";
export type NodeLayout = {
  type: NodeAlignmentType;
};
export type ViewSpec = {
  x: number;
  y: number;
  layout?: NodeLayout;
  edge?: EdgeSpec;
};

export type NodeSpec = {
  root?: boolean;
  model: ModelSpec;
  view: ViewSpec;
  subs?: NodeSpec[];
};

export class NodeRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  // icon?: null;
  constructor(readonly offset: Point, rect: DOMRect) {
    // offset.x *= scale;
    // offset.y *= scale;
    const { width, height } = rect;
    const w = width * 1;
    const h = height * 1;
    this.top = offset.y - h / 2;
    this.right = offset.x + w / 2;
    this.bottom = offset.y + h / 2;
    this.left = offset.x - w / 2;
    this.width = width;
    this.height = height;
    this.cx = offset.x;
    this.cy = offset.y;
    // this.icon = null;
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
    this.top = Math.min(this.top, other.top);
    this.right = Math.max(this.right, other.right);
    this.bottom = Math.max(this.bottom, other.bottom);
    this.left = Math.min(this.left, other.left);
    this.width = this.right - this.left;
    this.height = this.bottom - this.top;
    this.cx = this.width / 2;
    this.cy = this.height / 2;
    return this;
  }
}
