import { dom } from "../service";

const parseSubs = (nodeUi) => {
  const { subs } = nodeUi.config;
  if (!subs || subs.length === 0) {
    return [];
  }
  return subs.map((elem) => {
    const node = new NodeUI(elem, nodeUi.sharedConfig);
    node.parent = nodeUi;
    return node;
  });
};
let uid = 100;
let zIndex = 1;
class NodeUI {
  constructor(config, sharedConfig) {
    this.config = config;
    this.sharedConfig = sharedConfig;
    this.$el = null;
    this.selected = false;
    this.editing = false;
    this.uid = `uuid-${uid++}`;
    this.zIndex = 0;
    this.subs = parseSubs(this);
    this.parent = null;
  }
  get $bodyEl() {
    const canvas = this.sharedConfig.getCanvas();
    return canvas.getNodeBody(this);
  }
  get x() {
    return this.config.view.x;
  }
  get y() {
    return this.config.view.y;
  }
  get title() {
    return this.config.model.text;
  }
  get layout() {
    let { layout } = this.config.view;
    if (layout) {
      return { ...layout };
    } else return this.parent.layout;
  }
  level() {
    return this.isRoot() ? 0 : this.parent.level() + 1;
  }
  isSelected() {
    return this.selected;
  }
  setSelected(selected) {
    this.selected = selected;
    this.zIndex = ++zIndex;
    this.repaint();
  }
  setTitle(title) {
    const { model } = this.config;
    model.text = title;
    this.repaint();
  }
  offset(scale) {
    scale = scale || 1.0;
    const offset = this.isRoot()
      ? { x: -this.x, y: -this.y }
      : this.parent.offset();
    return { x: (this.x + offset.x) * scale, y: (this.y + offset.y) * scale };
  }
  setPos(x, y) {
    this.config.view.x = x;
    this.config.view.y = y;
  }
  isEditingState() {
    return this.editing;
  }
  setEditingState(editing) {
    this.editing = editing;
    this.repaint();
  }
  isRoot() {
    return this.config.root;
  }
  children(callback) {
    this.subs.forEach((child) => callback(child, this));
  }
  find(predicate) {
    let found = predicate(this);
    if (found) {
      return this;
    }
    for (let i = 0; i < this.subs.length; i++) {
      found = this.subs[i].find(predicate);
      if (found) {
        break;
      }
    }
    return found;
  }
  addChild(childUI) {
    childUI.parent = this;
    this.subs.push(childUI);
  }
  lastChild() {
    if (this.subs.length === 0) {
      return null;
    }
    return this.subs[this.subs.length - 1];
  }
  repaint() {
    const { $el } = this;
    const body = $el.querySelector(".mwd-body");
    const canvasUI = this.sharedConfig.getCanvas();
    canvasUI.drawNode(this);
    if (this.isRoot()) {
      // body.querySelector(".mwd-node-text").innerHTML = this.title;
      const offset = this.offset();
      dom.css($el, { top: offset.y, left: offset.x, zIndex: this.zIndex });
    } else {
      // body.querySelector(".mwd-node-text").innerHTML = this.title;
      const offset = this.offset();
      dom.css($el, { top: offset.y, left: offset.x, zIndex: this.zIndex });
    }
    const methodName = this.isSelected() ? "add" : "remove";
    const className = this.sharedConfig.activeClassName("node");
    dom.clazz[methodName](body, className);
  }
}

NodeUI.virtualRoot = (elem, config) => {
  elem.root = true;
  const vroot = new NodeUI(elem, config);
  return vroot;
};
export default NodeUI;
