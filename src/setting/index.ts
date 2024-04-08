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
/**
 * It specifies various class names to set on the nodes of the mind map.
 */
export type EntityClassNaming = {
  /**
   * class name for active nodes
   *
   * @default 'active-node'
   */
  node?: CssClassName;
  /**
   * classname for edge
   * @deprecated
   */
  edge?: CssClassName;
  /**
   * returns schema name itself
   * @param schemaName
   * @default (schemaName: string) => schemaName
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
   * specifies the scope of nodes to reference when rendering alignment lines using this option.
   *
   * ```
   * ======
   *  RT
   *   +- L10
   *   |   +- L20
   *   |       +- L30
   *   +- L11
   *   |   +- L21
   *   |       +- L31
   *   |       +- L32
   *   +- L12
   * ======
   * ```
   * If distance = 2,
   * * L10: [RT, L11, L12]
   * * L20: [L10, RT]
   * * L21: [L11, RT]
   * * L12: [RT, L10, L11]
   *
   * @default undefined - all nodes are used to draw alignment lines
   */
  distance?: number;
};
export type SnapToEntitySetting = {
  enabled?: boolean;
  limit?: ZeroOrPositiveNumber;
  /**
   * @default 0.4
   */
  width?: ZeroOrPositiveNumber;
  /**
   * use this option to draw dashed alignment line
   * @default [6, 2]
   */
  dash?: number[] | false;
  /**
   * color of snap lines(horizontal, vertical)
   */
  color?:
    | WebColorString
    | {
        horizontal: WebColorString;
        vertical: WebColorString;
      };
  /**
   * use this option to filter nodes for alignment lines
   */
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
   * When rendering multiple mind maps within one page,
   * you can specify an identification string for each mind map.
   *
   */
  mapId?: string | undefined;
  /**
   * It assigns unique identifier for nodes without uuid
   * @returns unique identifier
   */
  uuid?: () => string;
  /**
   * width of mindmap viewport.(number like 500 is regarded as "500px") ex) "600px", "100%"
   *
   * @default "600px"
   */
  width?: CssSizeForm | number;
  /**
   * height of mindmap viewport.(number like 500 is regarded as "500px") ex) "600px", "100%"
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
