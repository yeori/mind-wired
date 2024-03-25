/**
 * edge style calculator
 *
 * supported style
 * - name:string
 * - option:object(edge dependant)
 * - color:string(name of color, #aaccss, etc)
 * - width:number(line width)
 */

import type { LevelBasedEdgeWidth, EdgeSpec } from "../node/node-type";
import { type NodeUI } from "../node/node-ui";

// fix edge style 필요
const DEFAULT_EDGE_STYLE: EdgeSpec = {
  name: "line",
  option: {},
  color: "#000000",
  width: 1,
  inherit: true,
};
const traceStyle = <K extends keyof EdgeSpec>(node: NodeUI, prop: K) => {
  let nodeRef = node;
  let style = nodeRef.getStyle("edge");
  while (
    (!style[prop] || (nodeRef !== node && style.inherit === false)) &&
    !nodeRef.isRoot()
  ) {
    nodeRef = nodeRef.parent;
    style = nodeRef.getStyle("edge");
  }
  return style[prop] || DEFAULT_EDGE_STYLE[prop];
};
export default class EdgeStyle {
  nodeUI: NodeUI;
  constructor(nodeUI: NodeUI) {
    this.nodeUI = nodeUI;
  }
  get name() {
    return traceStyle(this.nodeUI, "name");
  }
  get option() {
    return traceStyle(this.nodeUI, "option");
  }
  get color() {
    return traceStyle(this.nodeUI, "color");
  }
  get width() {
    const width = traceStyle(this.nodeUI, "width");
    if (typeof width === "function") {
      return width(this.nodeUI.spec, this.nodeUI.level());
    } else if (typeof width === "number") {
      return width;
    } else {
      const lvlWidth = width as LevelBasedEdgeWidth;
      return Math.max(
        lvlWidth.root + lvlWidth.delta * this.nodeUI.level(),
        lvlWidth.min
      );
    }
  }
  get dash() {
    return traceStyle(this.nodeUI, "dash");
  }
  getEdgeRenderer() {
    // FIXME - 없어져도 될 듯...
    return undefined;
  }
}
