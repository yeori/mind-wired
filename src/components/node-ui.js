import { dom } from "../service";

const parseSubs = (nodeUi) => {
  const { subs } = nodeUi.config;
  if (!subs || subs.length === 0) {
    return [];
  }
  return subs.map((elem) => {
    const node = new NodeUI(elem);
    node.parent = nodeUi;
    return node;
  });
};
let uid = 100;
class NodeUI {
  constructor(config) {
    this.config = config;
    this.$el = null;
    this.uid = `uuid-${uid++}`;
    this.subs = parseSubs(this);
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
  level() {
    return this.isRoot() ? 0 : this.parent.level() + 1;
  }
  offset() {
    const offset = this.isRoot()
      ? { x: -this.x, y: -this.y }
      : this.parent.offset();
    return { x: this.x + offset.x, y: this.y + offset.y };
  }
  isRoot() {
    return this.config.root;
  }
  children(callback) {
    this.subs.forEach((child) => callback(child, this));
  }
  repaint() {
    const { $el } = this;
    if (this.isRoot()) {
    } else {
      $el.querySelector(".mwd-body .mwd-node-text").innerHTML = this.title;
      const offset = this.offset();
      dom.css($el, { top: offset.y, left: offset.x });
    }
  }
}

NodeUI.virtualRoot = (elems, config) => {
  const vroot = new NodeUI({
    root: true,
    view: { x: config.width / 2, y: config.height / 2 },
    subs: [...elems],
  });
  return vroot;
};
export default NodeUI;
