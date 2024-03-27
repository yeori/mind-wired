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
export type ThumbnailFillMode = "contain" | "cover";
export type ThumbnailSpec = {
  path: string;
  size: ImageSizeSpec;
  mode: ThumbnailFillMode;
};
export type LinkSpec = { url: string; body: ModelSpec };
export type ProviderSpec = { key: any };
export type SchemaSpec = {
  /**
   * name of schema(must be unique in a map)
   */
  name: string;
  css?: Partial<CSSStyleDeclaration>;
};
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
/**
 * edge width by node's level
 *
 * * root - edge width of root node(level 0)
 * * delta - used to determine edge width by level (root + level * delta)
 * * min - minimal edge width
 *
 * Example
 *
 * ```js
 *   width: { root: 6, detal: -2, min: 1 }
 * ```
 * * root node(level-0): 6px
 * * node at level-1 : 4px;
 * * node at level-2 : 2px;
 * * node at level-3 : 1px;
 * * node at level-4 : 1px;
 */
export type LevelBasedEdgeWidth = {
  root: number;
  delta: number;
  min: number;
};
export type EdgeSpec = {
  name?: string;
  color?: WebColorString;
  width?:
    | number
    | LevelBasedEdgeWidth
    | ((node: NodeSpec, level: number) => number);
  dash?: number[];
  /**
   * if true, all descendant nodes use this edge(default: true)
   */
  inherit?: boolean;
  option?: any;
};
export type NodeLayoutType =
  | "X-AXIS"
  | "Y-AXIS"
  | "XY-AXIS"
  | "DEFAULT"
  | string;
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
    const minX = Math.min(this.left, other.left);
    const minY = Math.min(this.top, other.top);
    const maxX = Math.max(this.right, other.right);
    const maxY = Math.max(this.bottom, other.bottom);
    this.center.x = (maxX + minX) / 2;
    this.center.y = (maxY + minY) / 2;
    const width = maxX - minX;
    const height = maxY - minY;
    this._rect = new DOMRect(minX, minY, width, height);
    return this;
  }
}
