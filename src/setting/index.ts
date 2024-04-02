import { NodeSpec } from "../components/node/node-type";
import { Point } from "../service/geom";

export { Point };
/**
 * "120px", "100%", etc
 */
export type CssSizeForm = string;
/**
 * string value as class of HTMLElement. You don't have to add leading dot(.)
 *
 * @example "city", "asian food"
 */
export type CssClassName = string;
/**
 * `#rrbbgg` or `#rrggbbaa` format
 * @example '#aabbcc', '#0000004d'
 */
export type WebColorString = string;

export type ZeroOrPositiveNumber = number;

/**
 * '#some .class'
 */
export type CssSelectorForm = string;

export type EntityClassNaming = {
  /**
   * class name for active nodes
   *
   * @default 'active-node'
   */
  node: CssClassName;
  /**
   * classname for edge
   * @deprecated
   */
  edge: CssClassName;
  /**
   * returns schema name itself
   * @param schemaName
   * @returns
   */
  schema?: (schemaName: string) => CssClassName;
  /**
   * level classname for node.
   * @default `level-${levenumber}`
   * @param level level number of the node.(root: 0, child of root: 1, ...)
   * @param spec NodeSpec
   * @returns
   */
  level?: string | ((level: number, node?: NodeSpec) => CssClassName);
  /**
   * classname for folded node.(Children of a folded node are hidden.)
   *
   * @default 'folded'
   */
  folded?: string;
};
export type StyleDefinition = {
  schema: {
    styleId: string;
    selector: string;
  };
};

export type SnapTargetSetting = {
  /**
   * determines nodes to be used to draw aligment lines.
   *
   * @description 좀 더 생각해보자...
   * @example `[1,1]` means all direct children(`path[1]`) of the adjacent parent(`path[0]`), which are siblings.
   * @example `[1, 0]` is the adjacent parent node
   * @example `[1, -1]` is the all descendant nodes of the adjacent parent(`path[0]`)
   */
  // path?: [number, number];
  /**
   *
   */
  distance?: number;
};
export type SnapToEntitySetting = {
  enabled?: boolean;
  limit?: ZeroOrPositiveNumber;
  width?: ZeroOrPositiveNumber;
  dash?: number[] | false;
  color?:
    | WebColorString
    | {
        horizontal: WebColorString;
        vertical: WebColorString;
      };
  target?: SnapTargetSetting[];
};
export type SelectionSetting = {
  padding?: ZeroOrPositiveNumber;
  "background-color"?: WebColorString;
  "border-radius"?: CssSizeForm;
};
/**
 * viewport setting(width, height etc)
 *
 * * width - width of mindmap viewport. ex) "600px", "100%"
 * * height - height of mindmap viewport. ex) "600px", "100%"
 * * scale - initial scale factor
 */
export type UISetting = {
  /**
   * unique map id
   *
   */
  mapId?: string | undefined;
  /**
   * It assigns unique identifier for nodes without uuid
   * @returns unique identifier for all nodes
   */
  uuid?: () => string;
  /**
   * width of mindmap viewport. ex) "600px", "100%"
   *
   * @default "600px"
   */
  width?: CssSizeForm | number;
  /**
   * height of mindmap viewport. ex) "600px", "100%"
   * @default "600px"
   */
  height?: CssSizeForm | number;
  /**
   * initial scale factor. (1: 100%, 0.5: 50%, etc)
   *
   * @default 1
   */
  scale?: number;
  clazz?: EntityClassNaming;
  styleDef?: StyleDefinition;
  /**
   * relative offst from center of viewport
   * @internal
   */
  offset?: Point;
  snap?: SnapToEntitySetting | false;
  selection?: SelectionSetting;
  /**
   * If true, use embedded icons for control(for testing).
   * @default true
   */
  useDefaultIcon?: boolean;
};

export type InitParam = {
  el: HTMLElement | CssSelectorForm;
  ui: UISetting;
};
