import type {
  IconBadgeSpec,
  ThumbnailSpec,
  ModelSpec,
  LinkSpec,
} from "./node-type";
import { type NodeUI } from "./node-ui";

export { NodeEditingContext } from "./node-editing-context";
export { NodeRenderingContext } from "./node-rendering-context";
export * from "./node-type";
export * from "./node-ui";
export {
  SchemaContext,
  type SchemaOperationParam,
  type EventRef,
} from "./schema-context";
export * from "./renderer";
export * from "./editor";
export type NodeState = {
  selected: boolean;
  editing: boolean;
};
export interface INodeRenderer {
  name: string;
  install(model: ModelSpec, parentEl: HTMLElement): void;
  render(model: ModelSpec, parentEl: HTMLElement, state: NodeState): void;
  /**
   * show editor for the given node
   * @param node node to edit
   */
  editor?(node: NodeUI): void;
}

export type UserDefinedRenderer<T> = {
  name: string;
  text?(item: T): string;
  thumbnail?(item: T): ThumbnailSpec;
  iconBadge?(item: T): IconBadgeSpec;
  link?(item: T): LinkSpec;
};
export interface INodeEditor {
  /**
   * the type of model(text, thumbnail, or name of datasource)
   */
  name: string;
  showEditor(model: ModelSpec, parentEl: HTMLElement): HTMLElement;
}
export type UserDefinedEditor<T> = {
  name: string;
  text?(item: T): string;
  thumbnail?(item: T): ThumbnailSpec;
  iconBadge?(item: T): IconBadgeSpec;
};
