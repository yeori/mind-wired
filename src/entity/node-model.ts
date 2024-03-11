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
import { WebColorString } from "./common-type";

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
