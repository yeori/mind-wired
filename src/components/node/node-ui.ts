import {
  ViewSpec,
  type NodeSpec,
  ModelSpec,
  NodeRect,
  NodeLayout,
} from "./node-type";
import { EVENT } from "../../service/event-bus";
import { type Heading, Point, geom } from "../../service/geom";
import type { Configuration } from "../config";
import { EdgeStyle } from "../edge/edge-style";

const parseSubs = (nodeUi: NodeUI) => {
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
    this.uid = this.sharedConfig.ui.uuid();
    this.zIndex = 0;
    this.subs = parseSubs(this);
    this.parent = parentNode;
    this.$style = new EdgeStyle(this);
    // this.folding = false;
    this.$dim = undefined;
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
  /**
   * offset(distance) from the direct parent node
   */
  get relativeOffset() {
    return new Point(this.x, this.y);
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
  dimension(relative: boolean = false): NodeRect {
    const el = this.$bodyEl;
    const offset = relative ? this.relativeOffset : this.offset();
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
      this.sharedConfig.emit(EVENT.NODE.UPDATED, {
        nodes: [this],
        type: "update",
      });
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
  /**
   * iterates on child nodes
   * @param callback
   */
  children(callback: (child: NodeUI, parent: NodeUI) => void) {
    this.subs.forEach((child) => callback(child, this));
  }
  find(predicate: (node: NodeUI) => boolean): NodeUI {
    // fix predicate 반환 타입 확인 필요함. boolean인지 실제 객체인지.
    if (predicate(this)) {
      return this;
    }
    let found = undefined;
    for (let i = 0; i < this.subs.length; i++) {
      if ((found = this.subs[i].find(predicate))) {
        return found;
      }
    }
    return undefined;
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
      return undefined;
    }
    return this.subs[this.subs.length - 1];
  }
  /**
   * change folding state
   * @param folding if true, children of this node are hidden, else visible
   * @returns true if folding state is changed, false if not changed
   */
  setFolding(folding: boolean) {
    if (this.folding === folding) {
      return false;
    }
    // this.folding = folding;
    if (folding) {
      this.spec.view.folding = true;
    } else {
      delete this.spec.view.folding;
    }
    this.repaint();
    return true;
  }
  /**
   *
   * @returns true if this node is folded, which means child nodes are invisible
   */
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
