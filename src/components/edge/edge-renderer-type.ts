import { type CanvasUI } from "../canvas-ui";
import { type NodeUI } from "../node";

export type EdgeRendererName = string;

export type EdgeRederingOptionType<T> = {
  optionType: T;
};
/**
 * Top level edge renderer interface. All implementation provide unique name and rendering opration on canvas.
 * @template T - type of custom edge option
 */
export interface IEdgeRenderer<T = any> {
  /**
   * unique renderer name
   */
  name: EdgeRendererName;
  /**
   * FIXME NodeUI보다는 EdgeSpec(node.$style) 이 적절해보임.
   * @param node
   */
  getRenderingOption(node: NodeUI): T;
  render: (canvas: CanvasUI, srcNode: NodeUI, dstNode: NodeUI) => void;
}

export abstract class AbstractEdgeRenderer<T> implements IEdgeRenderer<T> {
  abstract name: string;
  /**
   * provides default option to be used for pollyfill
   */
  get defaultOption(): T {
    return undefined;
  }
  abstract render(canvas: CanvasUI, srcNode: NodeUI, dstNode: NodeUI): void;
  getRenderingOption(node: NodeUI): T {
    const option: T = node.$style.option;
    const { defaultOption } = this;
    if (defaultOption !== undefined) {
      for (let prop in defaultOption) {
        if (option[prop] === undefined && defaultOption[prop] !== undefined) {
          option[prop] = defaultOption[prop];
        }
      }
    }
    return option;
  }
}
