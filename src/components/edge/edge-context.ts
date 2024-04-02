import { EVENT } from "../../service/event-bus";
import { type NodeUI } from "../node/node-ui";
import type Configuration from "../config";
import type { CanvasUI } from "../canvas-ui";
import type { EdgeRendererName, IEdgeRenderer } from "./edge-renderer-type";
import type { NodeMoveArg, ViewportEventArg } from "../../mindwired-event";
import { LineEdgeRenderer } from "./line-edge-renderer";
import { NaturalCourveEdgeRenderer } from "./natural-curve-renderer";
import { MustacheLREdgeRenderer } from "./mustache-lr-renderer";
import { MustacheTBEdgeRenderer } from "./mustache-tb-renderer";

const filterIndex = (edges: Edge[], callback: Function) => {
  const pos: number[] = [];
  edges.forEach((e, index) => {
    if (callback(e)) {
      pos.push(index);
    }
  });
  return pos;
};

export const installDefaultEdgeRenderers = (ctx: EdgeContext) => {
  ctx.registerEdgeRenderer(new LineEdgeRenderer());
  ctx.registerEdgeRenderer(new NaturalCourveEdgeRenderer());
  ctx.registerEdgeRenderer(new MustacheLREdgeRenderer());
  ctx.registerEdgeRenderer(new MustacheTBEdgeRenderer());
};
const createEdges = (srcNode: NodeUI, edges: Edge[]) => {
  srcNode.children((child: NodeUI) => {
    const e = new Edge(srcNode, child);
    edges.push(e);
    createEdges(child, edges);
  });
};

class Edge {
  srcNode: NodeUI;
  dstNode: NodeUI;
  visible: boolean;
  constructor(srcNode: NodeUI, dstNode: NodeUI) {
    this.srcNode = srcNode;
    this.dstNode = dstNode;
    this.visible = true;
  }
  get src() {
    return this.srcNode;
  }
  get dst() {
    return this.dstNode;
  }
  matched(node: NodeUI) {
    return this.srcNode === node || this.dstNode === node;
  }
  matchedDst(node: NodeUI) {
    return this.dstNode === node;
  }
}
const updateVisibleState = (
  edgeUI: EdgeContext,
  edge: Edge,
  visible: boolean
) => {
  edge.visible = visible;
  const childEdges = edgeUI.filterEdges(
    (e: Edge) => e.src === edge.dst && !e.src.isFolded()
  );
  childEdges.forEach((edge: Edge) => {
    updateVisibleState(edgeUI, edge, visible);
  });
};
export class EdgeContext {
  config: Configuration;
  canvas: CanvasUI;
  private edges: Edge[];
  private renderers = new Map<EdgeRendererName, IEdgeRenderer>();
  constructor(config: Configuration, canvas: CanvasUI) {
    this.config = config;
    this.canvas = canvas;
    this.edges = [] as Edge[];
    this.config
      .listen(EVENT.VIEWPORT.RESIZED, (_: ViewportEventArg) => {
        this.repaint();
      })
      .listen(EVENT.NODE.MOVED, ({ node, prevParent }: NodeMoveArg) => {
        const pos = filterIndex(
          this.edges,
          (e: Edge) => e.src === prevParent && e.dst === node
        );
        if (pos.length > 0) {
          pos.reverse().forEach((index) => this.edges.splice(index, 1));
        }
        const e = new Edge(node.parent!, node);
        this.edges.push(e);
        this.repaint();
      });
  }
  listRenderers(): IEdgeRenderer[] {
    return [...this.renderers.values()];
  }
  addEdge(src: NodeUI, dst: NodeUI) {
    const e = new Edge(src, dst);
    this.edges.push(e);
    this.repaint();
  }
  /**
   * deletes edges matching the nodes
   * @param nodes
   */
  deleteEdges(nodes: NodeUI[]) {
    let deleted = 0;
    nodes.forEach((node) => {
      const pos = filterIndex(this.edges, (e: Edge) => e.matched(nodes[0]));
      if (pos.length > 0) {
        pos.reverse().forEach((index) => this.edges.splice(index, 1));
      }
      deleted += pos.length;
    });
    if (deleted > 0) {
      this.repaint();
    }
  }
  setRootNode(rootNode: NodeUI) {
    this.edges = [];
    createEdges(rootNode, this.edges);
  }
  registerEdgeRenderer(render: IEdgeRenderer) {
    const { name } = render;
    if (this.renderers.has(name)) {
      throw new Error(`duplicated edge name: [${name}]`);
    }
    this.renderers.set(name, render);
  }
  filterEdges(predicate: (e: Edge) => boolean) {
    return this.edges.filter(predicate);
  }
  setEdgeVisible(
    node: NodeUI,
    visible: boolean,
    repaintImmediately: boolean = true
  ) {
    const edges = this.filterEdges((edge) => edge.src === node);
    edges.forEach((edge) => {
      updateVisibleState(this, edge, visible);
    });
    if (repaintImmediately) {
      this.repaint();
    }
  }
  repaint(clearCanvas = true) {
    if (clearCanvas) {
      this.canvas.clear();
    }
    this.edges.forEach((e) => {
      const { src, dst } = e;
      const style = dst.$style;
      if (e.visible) {
        const renderer = this.renderers.get(style.name.toLowerCase());
        renderer.render(this.canvas, src, dst);
      }
    });
  }
  dispose() {
    const { edges } = this;
    edges.splice(0, edges.length);
    this.repaint();
  }
}
