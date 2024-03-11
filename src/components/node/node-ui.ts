import { ViewSpec, type NodeSpec, ModelSpec } from "../../entity/node-model";
import { dom } from "../../service";
import { EVENT } from "../../service/event-bus";
import { Point } from "../../service/geom";
import type CanvasUI from "../canvas-ui";
import Configuration from "../config";
import EdgeStyle from "../edge/edge-style";

const parseSubs = (nodeUi: NodeUI) => {
  // fix view.subs[{model, view, subs}]
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

export class NodeRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  icon?: null;
  constructor(node: NodeUI, scale: number) {
    const offset = node.offset();
    offset.x *= scale;
    offset.y *= scale;
    const rect = dom.domRect(node.$bodyEl);
    const { width, height } = rect;
    this.top = offset.y - height / 2;
    this.right = offset.x + width / 2;
    this.bottom = offset.y + height / 2;
    this.left = offset.x - width / 2;
    this.width = width;
    this.height = height;
    this.cx = offset.x;
    this.cy = offset.y;
    this.icon = null;
  }
  get x() {
    return this.left;
  }
  get y() {
    return this.top;
  }
  get r() {
    return this.right;
  }
  get b() {
    return this.bottom;
  }
  merge(other: NodeRect) {
    this.top = Math.min(this.top, other.top);
    this.right = Math.max(this.right, other.right);
    this.bottom = Math.max(this.bottom, other.bottom);
    this.left = Math.min(this.left, other.left);
    this.width = this.right - this.left;
    this.height = this.bottom - this.top;
    this.cx = this.width / 2;
    this.cy = this.height / 2;
    return this;
  }
  static wrap(node: NodeUI, dto: NodeRect): NodeRect {
    const rect = new NodeRect(node, node.sharedConfig.getCanvas().scale);
    Object.keys(dto).forEach((key) => {
      rect[key] = dto[key];
    });
    return rect;
  }
  // FIXME - CavasUI.drawSelection 으로 옮겨야 함
  draw(canvas: CanvasUI) {
    const { selection } = canvas.config.ui;
    const offset = canvas.getHolderOffset();

    const el = dom.findOne(canvas.$viewport, ".mwd-selection-area");
    dom.css(el, {
      left: offset.x + this.left - selection.padding,
      top: offset.y + this.top - selection.padding,
      width: this.width + 2 * selection.padding,
      height: this.height + 2 * selection.padding,
    });
    const ctrl = dom.findOne(el, "div");
    dom.css(ctrl, {
      display: "",
      width: 24 / Math.max(canvas.scale, 1),
      height: 24 / Math.max(canvas.scale, 1),
    });
  }
  // FIXME - CavasUI.clearSelection 으로 옮겨야 함
  clear(canvas: CanvasUI) {
    const el = dom.findOne(canvas.$viewport, ".mwd-selection-area");
    dom.css(el, { top: -1, left: -1, width: 0, height: 0 });
    const ctrl = dom.findOne(el, "div");
    dom.css(ctrl, { display: "none" });
  }
}

export class NodeUI {
  config: NodeSpec;
  sharedConfig: Configuration;
  $el: HTMLElement | undefined;
  selected: boolean;
  editing: boolean;
  uid: string;
  zIndex: number;
  subs: NodeUI[];
  parent?: NodeUI;
  $style: EdgeStyle;
  folding: boolean;
  $cachedStyle: EdgeStyle | null;
  // fix $dim타입 뭔지 모르겠다.
  $dim: any;
  constructor(
    config: NodeSpec,
    sharedConfig: Configuration,
    parentNode?: NodeUI
  ) {
    this.config = config;
    this.sharedConfig = sharedConfig;
    this.$el = undefined;
    this.selected = false;
    this.editing = false;
    this.uid = `uuid-${uid++}`;
    this.zIndex = 0;
    this.subs = parseSubs(this);
    this.parent = parentNode;
    this.$style = new EdgeStyle(this);
    this.folding = false;
    this.$dim = null;
    this.$cachedStyle = null;
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
  // fix view.layout 타입 필요 {model:{..}, views: {layout: {type: ...}}}
  get layout(): any {
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
  dimension(): NodeRect {
    const scale = this.sharedConfig.scale;
    const el = this.$bodyEl;
    const offset = this.offset();
    offset.x *= scale;
    offset.y *= scale;
    const w = (el.offsetWidth * scale) / 2;
    const h = (el.offsetHeight * scale) / 2;
    return (this.$dim = NodeRect.wrap(this, {
      left: offset.x - w,
      top: offset.y - h,
      width: 2 * w,
      height: 2 * h,
      cx: offset.x,
      cy: offset.y,
      right: offset.x + w,
      bottom: offset.y + h,
    } as NodeRect));
  }
  level(): number {
    return this.isRoot() ? 0 : this.parent!.level() + 1;
  }
  getStyle<K extends keyof ViewSpec>(type: K) {
    // type: 'edge', 'node'
    return Object.assign({}, this.config.view[type]) as ViewSpec[K];
  }
  isSelected(): boolean {
    return this.selected;
  }
  setSelected(selected: boolean) {
    this.selected = selected;
    this.zIndex = ++zIndex;
    if (this.active) {
      this.repaint();
    }
  }
  isDescendantOf(dstNode: NodeUI) {
    let ref: NodeUI | undefined = this;
    while (ref) {
      if (ref === dstNode) {
        return true;
      } else {
        ref = ref.parent;
      }
    }
    return false;
  }
  updateModel(callback: (model: ModelSpec) => boolean | undefined) {
    const { model } = this.config;
    if (callback(model)) {
      this.$dim = null;
      // this.repaint();
      this.sharedConfig.emit(EVENT.NODE.UPDATED, [this]);
    }
  }
  offset(): Point {
    let ref: NodeUI = this;
    const p = new Point(0, 0);
    while (ref) {
      const dir = 1; // ref.isRoot() ? -1 : 1;
      p.x += dir * ref.x;
      p.y += dir * ref.y;
      ref = ref.parent;
    }
    return p;
  }
  setOffset({ x, y }: Point) {
    if (this.isRoot()) {
      return;
    }
    const poff = this.parent!.offset();
    this.setPos(x - poff.x, y - poff.y);
  }
  /**
   * relative pos from the direct parent
   * @returns (x, y) from the direct parent
   */
  getPos(): Point {
    return new Point(this.x, this.y); // { x: this.x, y: this.y };
  }
  setPos(x: number, y: number, update = true) {
    this.config.view.x = x;
    this.config.view.y = y;
    if (update) {
      this.repaint();
    }
  }
  isEditingState() {
    return this.editing;
  }
  setEditingState(editing: boolean) {
    this.editing = editing;
    this.repaint();
  }
  isRoot() {
    return this.config.root;
  }
  isLeaf() {
    return this.subs.length === 0;
  }
  children(callback: Function) {
    this.subs.forEach((child) => callback(child, this));
  }
  find(predicate: (node: NodeUI) => NodeUI): NodeUI {
    // fix predicate 반환 타입 확인 필요함. boolean인지 실제 객체인지.
    let found: NodeUI | undefined = predicate(this);
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
  addChild(childUI: NodeUI) {
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
  removeChild(childUI: NodeUI) {
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
    deletedNodes.forEach((node) => (node.parent = undefined)); // clear ref to parent(this)
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
  setFolding(folding: boolean) {
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
    const body = $el!.querySelector<HTMLElement>(".mwd-body");

    const pos = this.getPos();
    dom.css($el!, { top: pos.y, left: pos.x, zIndex: this.zIndex });

    const methodName = this.isSelected() ? "add" : "remove";
    const className = this.sharedConfig.activeClassName("node");
    dom.clazz[methodName](body!, className);

    const levelClassName: string = this.sharedConfig.nodeLevelClassName(this);
    dom.clazz.add(body!, levelClassName);
  }
  static build(elem: NodeSpec, config: Configuration) {
    elem.root = true;
    return new NodeUI(elem, config);
  }
}

// NodeUI.build = (elem, config) => {
//   elem.root = true;
//   return new NodeUI(elem, config);
// };
