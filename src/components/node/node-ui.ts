import {
  ViewSpec,
  type NodeSpec,
  ModelSpec,
  NodeRect,
  NodeLayout,
} from "./node-type";
import { EVENT } from "../../service/event-bus";
import { type Heading, Point, geom } from "../../service/geom";
import Configuration from "../config";
import EdgeStyle from "../edge/edge-style";

const parseSubs = (nodeUi: NodeUI) => {
  // fix view.subs[{model, view, subs}]
  const { subs } = nodeUi.spec;
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

export class NodeUI {
  spec: NodeSpec;
  sharedConfig: Configuration;
  $el: HTMLElement | undefined;
  selected: boolean;
  editing: boolean;
  uid: string;
  zIndex: number;
  subs: NodeUI[];
  parent?: NodeUI;
  $style: EdgeStyle;
  // folding: boolean;
  $cachedStyle: EdgeStyle | null;
  $dim: NodeRect;
  constructor(
    spec: NodeSpec,
    sharedConfig: Configuration,
    parentNode?: NodeUI
  ) {
    this.spec = spec;
    this.sharedConfig = sharedConfig;
    this.$el = undefined;
    this.selected = false;
    this.editing = false;
    this.uid = `uuid-${uid++}`;
    this.zIndex = 0;
    this.subs = parseSubs(this);
    this.parent = parentNode;
    this.$style = new EdgeStyle(this);
    // this.folding = false;
    this.$dim = null;
    this.$cachedStyle = null;
  }
  get model() {
    return { ...this.spec.model };
  }
  get $bodyEl() {
    const canvas = this.sharedConfig.getCanvas();
    return canvas.getNodeBody(this);
  }
  get x() {
    return this.spec.view.x;
  }
  get y() {
    return this.spec.view.y;
  }
  get layout(): NodeLayout {
    let { layout } = this.spec.view;
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
  get folding() {
    return this.spec.view.folding || false;
  }
  isReady() {
    return !!this.$el;
  }
  dimension(): NodeRect {
    // FIXME - scale 적용은 canvas에서 해야 함
    const scale = this.sharedConfig.scale;
    const el = this.$bodyEl;
    const offset = this.offset();
    offset.x *= scale;
    offset.y *= scale;
    return (this.$dim = new NodeRect(
      offset,
      this.sharedConfig.dom.domRect(el)
    ));
  }
  level(): number {
    return this.isRoot() ? 0 : this.parent!.level() + 1;
  }
  getStyle<K extends keyof ViewSpec>(type: K) {
    // type: 'edge', 'node'
    return Object.assign({}, this.spec.view[type]) as ViewSpec[K];
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
    const { model } = this.spec;
    if (callback(model)) {
      this.$dim = null;
      // this.repaint();
      this.sharedConfig.emit(EVENT.NODE.UPDATED, [this]);
    }
  }
  getHeading(): Heading {
    return geom.heading(new Point(this.x, this.y));
  }
  /**
   * absolute offset
   * @returns offset from root to this node
   */
  offset(): Point {
    let ref: NodeUI = this;
    const p = new Point(0, 0);
    while (ref) {
      p.x += ref.x;
      p.y += ref.y;
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
    this.spec.view.x = x;
    this.spec.view.y = y;
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
    return this.spec.root;
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
    // this.folding = folding;
    if (folding) {
      this.spec.view.folding = true;
    } else {
      delete this.spec.view.folding;
    }
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
  }
  static build(spec: NodeSpec, config: Configuration) {
    spec.root = true;
    return new NodeUI(spec, config);
  }
}
