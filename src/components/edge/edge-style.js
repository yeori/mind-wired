/**
 * edge style calculator
 *
 * supported style
 * - name:string
 * - color:string(name of color, #aaccss, etc)
 * - width:number(line width)
 */
const DEFAULT_EDGE_STYLE = {
  name: "line",
  color: "#000000",
  width: 1,
};
const findProp = (node, prop) => {
  let nodeRef = node;
  let style = nodeRef.getStyle("edge");
  while (!style[prop] && !nodeRef.isRoot()) {
    nodeRef = nodeRef.parent;
    style = nodeRef.getStyle("edge");
  }
  return style[prop] || DEFAULT_EDGE_STYLE[prop];
};
class EdgeStyle {
  constructor(nodeUI) {
    this.nodeUI = nodeUI;
  }
  get name() {
    return findProp(this.nodeUI, "name");
  }
  get color() {
    return findProp(this.nodeUI, "color");
  }
  get width() {
    return findProp(this.nodeUI, "width");
  }
}

export default EdgeStyle;
