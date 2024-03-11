import {
  CssClassName,
  CssSelectorForm,
  CssSizeForm,
  WebColorString,
  ZeroOrPositiveNumber,
} from "../entity/common-type";
import { Point } from "../service/geom";

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
export type UISetting = {
  width?: CssSizeForm | number;
  height?: CssSizeForm | number;
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
