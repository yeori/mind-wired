import { dom } from "../service";
import { EVENT } from "../service/event-bus";
import EdgeStyle from "./edge/edge-style";

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
  constructor(config, sharedConfig, parentNode) {
    this.config = config;
    this.sharedConfig = sharedConfig;
    this.$el = null;
    this.selected = false;
    this.editing = false;
    this.uid = `uuid-${uid++}`;
    this.zIndex = 0;
    this.subs = parseSubs(this);
    this.parent = parentNode;
    this.$style = new EdgeStyle(this);
    this.folding = false;
    this.$dim = null;
  }
  get model() {
    return { ...this.config.model };
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
  get layout() {
    let { layout } = this.config.view;
    if (layout) {
      return { ...layout };
    } else return this.parent && this.parent.layout;
  }
  get active() {
    return !!this.$el;
  }
  get childNodes() {
    return [...this.subs];
  }
  dimension() {
    const scale = this.sharedConfig.scale;
    const el = this.$bodyEl;
    const offset = this.offset();
    offset.x *= scale;
    offset.y *= scale;
    const w = (el.offsetWidth * scale) / 2;
    const h = (el.offsetHeight * scale) / 2;
    return (this.$dim = {
      x: offset.x - w,
      y: offset.y - h,
      width: 2 * w,
      height: 2 * h,
      cx: offset.x,
      cy: offset.y,
      r: offset.x + w,
      b: offset.y + h,
    });
  }
  level() {
    return this.isRoot() ? 0 : this.parent.level() + 1;
  }
  getStyle(type) {
    // type: 'edge', 'node'
    return Object.assign({}, this.config.view[type]);
  }
  isSelected() {
    return this.selected;
  }
  setSelected(selected) {
    this.selected = selected;
    this.zIndex = ++zIndex;
    if (this.active) {
      this.repaint();
    }
  }
  isDescendantOf(dstNode) {
    let ref = this;
    while (ref) {
      if (ref === dstNode) {
        return true;
      } else {
        ref = ref.parent;
      }
    }
    return false;
  }
  updateModel(callback) {
    const { model } = this.config;
    if (callback(model)) {
      this.$dim = null;
      // this.repaint();
      this.sharedConfig.emit(EVENT.NODE.UPDATED, [this]);
    }
  }
  offset() {
    let ref = this;
    const p = { x: 0, y: 0 };
    while (ref) {
      const dir = 1; // ref.isRoot() ? -1 : 1;
      p.x += dir * ref.x;
      p.y += dir * ref.y;
      ref = ref.parent;
    }
    return p;
  }
  setOffset({ x, y }) {
    if (this.isRoot()) {
      return;
    }
    const poff = this.parent.offset();
    this.setPos(x - poff.x, y - poff.y);
  }
  /**
   * relative pos from the direct parent
   * @returns (x, y) from the direct parent
   */
  getPos() {
    return { x: this.x, y: this.y };
  }
  setPos(x, y, update = true) {
    this.config.view.x = x;
    this.config.view.y = y;
    if (update) {
      this.repaint();
    }
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
  isLeaf() {
    return this.subs.length === 0;
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
  /**
   *
   * @param {NodeUI} childUI
   * @returns prev parentUI
   */
  addChild(childUI) {
    const prevParent = childUI.parent;
    if (prevParent && prevParent !== this) {
      prevParent.removeChild(childUI);
    }
    childUI.parent = this;
    this.subs.push(childUI);
    const canvasUI = this.sharedConfig.getCanvas();
    canvasUI.moveNode(childUI);
    return prevParent;
  }
  removeChild(childUI) {
    if (childUI.parent !== this) {
      // not a child node
      return null;
    }
    const pos = this.subs.findIndex((node) => node.uid === childUI.uid);
    if (pos === -1) {
      // not a child node
      return null;
    }
    const deletedNodes = this.subs.splice(pos, 1);
    deletedNodes.forEach((node) => (node.parent = null)); // clear ref to parent(this)
    return deletedNodes[0];
  }
  firstChild() {
    return this.subs[0];
  }
  lastChild() {
    if (this.subs.length === 0) {
      return null;
    }
    return this.subs[this.subs.length - 1];
  }
  setFolding(folding) {
    if (this.folding === folding) {
      return;
    }
    this.folding = folding;
    this.repaint();
    this.sharedConfig.emit(EVENT.NODE.FOLDED, {
      node: this,
      folded: this.folding,
    });
  }
  isFolded() {
    return this.folding;
  }
  repaint() {
    const canvasUI = this.sharedConfig.getCanvas();
    canvasUI.drawNode(this);
    const { $el } = this;
    const body = $el.querySelector(".mwd-body");

    const pos = this.getPos();
    dom.css($el, { top: pos.y, left: pos.x, zIndex: this.zIndex });

    const methodName = this.isSelected() ? "add" : "remove";
    const className = this.sharedConfig.activeClassName("node");
    dom.clazz[methodName](body, className);

    const levelClassName = this.sharedConfig.nodeLevelClassName(this);
    dom.clazz.add(body, levelClassName);
  }
}

NodeUI.build = (elem, config) => {
  elem.root = true;
  return new NodeUI(elem, config);
};
export default NodeUI;
