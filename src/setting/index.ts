import { Point } from "../service/geom";

export { Point };
/**
 * "120px", "100%", etc
 */
export type CssSizeForm = string;

export type CssClassName = string;
/**
 * '#aabbcc' format
 */
export type WebColorString = string;

export type ZeroOrPositiveNumber = number;

/**
 * '#some .class'
 */
export type CssSelectorForm = string;

export type EntityClassNaming = {
  node: CssClassName;
  edge: CssClassName;
  schema?: (schemaName: string) => CssClassName;
  level?: (level: number, node?: any) => CssClassName;
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
   * initial scale factor
   *
   * @default 1
   */
  scale?: number;
  clazz?: EntityClassNaming;
  offset?: Point;
  snap?: SnapToEntitySetting | false;
  selection?: SelectionSetting;
};

export type InitParam = {
  el: HTMLElement | CssSelectorForm;
  ui: UISetting;
};
