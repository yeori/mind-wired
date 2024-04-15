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
import clone from "@/service/clone";

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
/**
 * A class representing a node in the tree structure.
 */
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
  /**
   * ModelSpec of the node
   */
  get model() {
    return clone.deepCopy(this.spec.model);
  }
  /**
   * ViewSpec of the node
   */
  get view() {
    const view = clone.deepCopy(this.spec.view);
    delete view.x;
    delete view.y;
    return view;
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
  /**
   * returns available NodeLayout.
   */
  get layout(): NodeLayout {
    let { layout } = this.spec.view;
    if (layout) {
      return { ...layout };
    } else return this.parent && this.parent.layout;
  }
  /**
   * Indicates whether the node is currently active(selected) or not
   * @returns {boolean} true if the node is active(selected), otherwise false.
   */
  get active() {
    return !!this.$el;
  }
  /**
   * Return child nodes.
   * @returns {NodeUI[]} child nodes
   */
  get childNodes(): NodeUI[] {
    return [...this.subs];
  }
  /**
   * Returns whether the node is folded or not.
   * @returns {boolean} `true` if the node is folded, otherwise `false`.
   */
  get folding(): boolean {
    return this.spec.view.folding || false;
  }
  /**
   * Returns whether the node is ready to use or not.
   * @returns {boolean} `true` if the node is ready to use, `false` otherwise.
   */
  isReady(): boolean {
    return !!this.$el;
  }

  /**
   * Calculate node's position and size.
   * @param {boolean} [relative=false] calculate relative position to parent node.
   * @returns {NodeRect} position and size of the node.
   */
  dimension(relative: boolean = false): NodeRect {
    const el = this.$bodyEl;
    const offset = relative ? this.relativeOffset : this.offset();
    return (this.$dim = new NodeRect(
      offset,
      this.sharedConfig.dom.domRect(el)
    ));
  }
  /**
   * Calculate node's level in the tree structure.
   * (Root node's level is 0.)
   * @returns {number} node's level.
   */
  level(): number {
    return this.isRoot() ? 0 : this.parent!.level() + 1;
  }
  getStyle<K extends keyof ViewSpec>(type: K) {
    // type: 'edge', 'node'
    return Object.assign({}, this.spec.view[type]) as ViewSpec[K];
  }
  /**
   * check if the node is selected or not.
   * @returns {boolean} `true` if selected, `false` otherwise.
   */
  isSelected(): boolean {
    // returns `true` if the node is selected, `false` otherwise.
    return this.selected;
  }
  /**
   * Set the selected state of the node.
   * If the node is selected, the z-index is updated and the node is repainted
   * @param {boolean} selected - `true` if selected, `false` otherwise.
   */
  setSelected(selected: boolean) {
    this.selected = selected;
    this.zIndex = ++zIndex;
    // repaint the node if it's active and selected state changed.
    if (this.active && this.selected !== selected) {
      this.repaint();
    }
  }
  /**
   * Check if this node is a descendant of `dstNode`.
   * @param {NodeUI} dstNode - The destination node to check
   * @returns {boolean} `true` if this node is a descendant of `dstNode`, `false` otherwise.
   */
  isDescendantOf(dstNode: NodeUI): boolean {
    // check if this node is a descendant of `dstNode`
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
  /**
   * Update the node model with the callback function.
   * @param {Function} callback - The callback function to update the node model.
   */
  updateModel(callback: (model: ModelSpec) => boolean | undefined) {
    const { model } = this.spec;
    if (callback(model)) {
      this.$dim = null;
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
  /**
   * Sets the position of the node
   *
   * @param {number} x - The x-coordinate of the position
   * @param {number} y - The y-coordinate of the position
   * @param {boolean} update - Flag indicating whether to repaint viewport
   */
  setPos(x: number, y: number, update: boolean = true) {
    this.spec.view.x = x;
    this.spec.view.y = y;
    if (update) {
      this.repaint();
    }
  }
  isEditingState() {
    return this.editing;
  }
  /**
   * Set the editing state of the node.
   *
   * @param {boolean} editing - The new editing state to set
   */
  setEditingState(editing: boolean) {
    this.editing = editing;
    this.repaint();
  }
  /**
   * Check if the node is a root node.
   *
   * @return {boolean} Indicates if the node is a root node.
   */
  isRoot(): boolean {
    return this.spec.root;
  }
  /**
   * Check if the node is a leaf node.
   *
   * @return {boolean} Indicates if the node is a leaf node.
   */
  isLeaf(): boolean {
    return this.subs.length === 0;
  }

  /**
   * Iterates over the children nodes and invokes a callback function for each child.
   *
   * @param {(child: NodeUI, parent: NodeUI) => void} callback - callback function to accept child node.
   */
  children(callback: (child: NodeUI, parent: NodeUI) => void) {
    this.subs.forEach((child) => callback(child, this));
  }
  /**
   * Searches this node and its descendants for the first node that satisfies the provided testing function.
   *
   * @param {(node: NodeUI) => boolean} predicate - takes a node as an argument and
   * returns a boolean indicating whether the node is the one being searched for.
   * @return {NodeUI} The first node in the tree that passes the test, or `undefined` if no node passes the test.
   */
  find(predicate: (node: NodeUI) => boolean): NodeUI {
    // predicate 반환 타입이 boolean인지 NodeUI인지 확인필요함.
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
   * Adds a child node to this node.
   * If the child node is already a child of another node, it is removed from that node before adding it.
   *
   * @param childUI Child node to be added to this node.
   * @return The previous parent of the child node, or `null` if it didn't have a parent before.
   */
  addChild(childUI: NodeUI): NodeUI | null {
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
  /**
   * Removes a child node from this node.
   *
   * @param childUI Child node to be removed from this node.
   * @return The node that was removed, or `null` if the given node is not a child of this node.
   */
  removeChild(childUI: NodeUI): NodeUI | null {
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
  /**
   * Get the first child node of this node.
   * @return The first child node, or `undefined` if this node has no children.
   */
  firstChild(): NodeUI | undefined {
    return this.subs[0];
  }
  /**
   * Get the last child node of this node.
   * @return The last child node, or `undefined` if this node has no children.
   */
  lastChild(): NodeUI | undefined {
    // returns the last child node of this node, or undefined if no children
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
   * check if the node is folded(children hidden) or not
   * @return true if the node is folded, false if not folded
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
