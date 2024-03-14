import { EVENT } from "../../service/event-bus";
import { LineEdgeRenderer } from "./line-edge-renderer";
import { NaturalCourveEdgeRenderer } from "./natural-curve-renderer";
import { MustacheLREdgeRenderer } from "./mustache-lr-renderer";
import { MustacheTBEdgeRenderer } from "./mustache-tb-renderer";
import { type NodeUI } from "../node/node-ui";
import type Configuration from "../config";
import { type CanvasUI } from "../canvas-ui";
import { EdgeRendererName, IEdgeRenderer } from "./edge-renderer-type";

export {
  LineEdgeRenderer,
  NaturalCourveEdgeRenderer,
  MustacheLREdgeRenderer,
  MustacheTBEdgeRenderer,
};

const installDefaultEdgeRenderers = (
  map: Map<EdgeRendererName, IEdgeRenderer>
) => {
  const line = new LineEdgeRenderer();
  map.set(line.name, line);
  const curve = new NaturalCourveEdgeRenderer();
  map.set(curve.name, curve);
  const mlr = new MustacheLREdgeRenderer();
  map.set(mlr.name, mlr);
  const mtb = new MustacheTBEdgeRenderer();
  map.set(mtb.name, mtb);
};
const createEdges = (srcNode: NodeUI, edges: Edge[]) => {
  srcNode.children((child: NodeUI) => {
    const e = new Edge(srcNode, child);
    edges.push(e);
    createEdges(child, edges);
  });
};
const filterIndex = (edges: Edge[], callback: Function) => {
  const pos = [] as number[];
  edges.forEach((e, index) => {
    if (callback(e)) {
      pos.push(index);
    }
  });
  return pos;
};
const updateHiddenState = (edgeUI: EdgeUI, edge: Edge, folded: boolean) => {
  const childEdges = edgeUI.filterEdges(
    (e: Edge) => e.src === edge.dst && !e.src.isFolded()
  );
  childEdges.forEach((edge: Edge) => {
    edge.hidden = folded;
    updateHiddenState(edgeUI, edge, folded);
  });
};
class Edge {
  srcNode: NodeUI;
  dstNode: NodeUI;
  hidden: boolean;
  constructor(srcNode: NodeUI, dstNode: NodeUI) {
    this.srcNode = srcNode;
    this.dstNode = dstNode;
    this.hidden = false;
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
export class EdgeUI {
  config: Configuration;
  canvas: CanvasUI;
  private edges: Edge[];
  renderers = new Map<EdgeRendererName, IEdgeRenderer>();
  constructor(config: Configuration, canvas: CanvasUI) {
    this.config = config;
    this.canvas = canvas;
    this.edges = [] as Edge[];
    // createEdges(rootNode, this.edges);
    installDefaultEdgeRenderers(this.renderers);
    this.config
      .listen(EVENT.NODE.CREATED, ({ nodes }: { nodes: NodeUI[] }) => {
        nodes.forEach((nodeUI) => {
          const e = new Edge(nodeUI.parent!, nodeUI);
          this.edges.push(e);
        });
        this.repaint();
      })
      .listen(EVENT.VIEWPORT.RESIZED, () => {
        this.repaint();
      })
      .listen(EVENT.NODE.DELETED, (node: NodeUI) => {
        const pos = filterIndex(this.edges, (e: Edge) => e.matched(node));
        if (pos.length === 0) {
          // MEMO invalid state: the deleted node does not exist.
        } else {
          pos.reverse().forEach((index) => this.edges.splice(index, 1));
          // this.edges.splice(pos, 1);
          this.repaint();
        }
      })
      .listen(
        EVENT.NODE.MOVED,
        ({ node, prevParent }: { node: NodeUI; prevParent: NodeUI }) => {
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
        }
      )
      .listen(EVENT.NODE.FOLDED, ({ node }: { node: NodeUI }) => {
        const edges = this.edges.filter((edge) => edge.src === node);
        const folded = node.isFolded();
        edges.forEach((edge) => {
          edge.hidden = folded;
          updateHiddenState(this, edge, folded);
        });

        this.repaint();
      });
  }
  setRootNode(rootNode: NodeUI) {
    this.edges = [];
    createEdges(rootNode, this.edges);
  }
  addEdgeRenderer(render: IEdgeRenderer) {
    const { name } = render;
    this.renderers.set(name, render);
  }
  filterEdges(predicate: (e: Edge) => boolean) {
    return this.edges.filter(predicate);
  }
  repaint(clearCanvas = true) {
    if (clearCanvas) {
      this.canvas.clear();
    }
    this.edges.forEach((e) => {
      const { src, dst } = e;
      const style = dst.$style;
      if (!e.hidden) {
        const renderer = this.renderers.get(style.name.toLowerCase());
        renderer.render(this.canvas, src, dst);
      }
    });
  }
}
