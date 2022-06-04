/**
 * edge style calculator
 *
 * supported style
 * - name:string
 * - option:object(edge dependant)
 * - color:string(name of color, #aaccss, etc)
 * - width:number(line width)
 */
const DEFAULT_EDGE_STYLE = {
  name: "line",
  option: {},
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
  get option() {
    return findProp(this.nodeUI, "option");
  }
  get color() {
    return findProp(this.nodeUI, "color");
  }
  get width() {
    return findProp(this.nodeUI, "width");
  }
  getEdgeRenderer() {
    const name = this.nodeUI.getStyle("edge").renderer;
    if (!name) {
      return null;
    }
    const config = this.nodeUI.sharedConfig;
    const { renderers } = config.ui;
    if (!renderers) {
      throw new Error(
        `You should define renderer at "ui.renderers:{${name}: (ctx) => {}, }" for edge renderer [${name}]`
      );
    }
    if (!renderers[name]) {
      throw new Error(`edge renderer [${name}] does not exist in ui.renders`);
    }
    return renderers[name];
  }
}

export default EdgeStyle;
