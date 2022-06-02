import { EVENT } from "../service/event-bus";
import EdgeStyle from "./edge/edge-style";
import line_edge from "./edge/line-edge-renderer";
import curve_edge from "./edge/natural-curve-renderer";
import mustache_edge_lr from "./edge/mustache-lr-renderer";
import mustache_edge_tb from "./edge/mustache-tb-renderer";

const rendering = {
  LINE: line_edge,
  NATURAL_CURVE: curve_edge,
  MUSTACHE_LR: mustache_edge_lr,
  MUSTACHE_TB: mustache_edge_tb,
};
const createEdges = (srcNode, edges) => {
  srcNode.children((child) => {
    const e = new Edge(srcNode, child);
    edges.push(e);
    createEdges(child, edges);
  });
};
const filterIndex = (edges, callback) => {
  const pos = [];
  edges.forEach((e, index) => {
    if (callback(e)) {
      pos.push(index);
    }
  });
  return pos;
};
const updateHiddenState = (edgeUI, edge, folded) => {
  const childEdges = edgeUI.filterEdges(
    (e) => e.src === edge.dst && !e.src.isFolded()
  );
  childEdges.forEach((edge) => {
    edge.hidden = folded;
    updateHiddenState(edgeUI, edge, folded);
  });
};
class Edge {
  constructor(srcNode, dstNode) {
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
  matched(node) {
    return this.srcNode === node || this.dstNode === node;
  }
  matchedDst(node) {
    return this.dstNode === node;
  }
}
class EdgeUI {
  constructor(config, rootNode, canvas) {
    this.config = config;
    this.canvas = canvas;
    this.edges = [];
    createEdges(rootNode, this.edges);
    this.config
      .listen(EVENT.NODE.CREATED, ({ nodes }) => {
        nodes.forEach((nodeUI) => {
          const e = new Edge(nodeUI.parent, nodeUI);
          this.edges.push(e);
        });
        this.repaint();
      })
      .listen(EVENT.VIEWPORT.RESIZED, () => {
        this.repaint();
      })
      .listen(EVENT.NODE.DELETED, (node) => {
        const pos = filterIndex(this.edges, (e) => e.matched(node));
        if (pos.length === 0) {
          // MEMO invalid state: the deleted node does not exist.
        } else {
          pos.reverse().forEach((index) => this.edges.splice(index, 1));
          // this.edges.splice(pos, 1);
          this.repaint();
        }
      })
      .listen(EVENT.NODE.MOVED, ({ node, prevParent }) => {
        const pos = filterIndex(
          this.edges,
          (e) => e.src === prevParent && e.dst === node
        );
        if (pos.length > 0) {
          pos.reverse().forEach((index) => this.edges.splice(index, 1));
        }
        const e = new Edge(node.parent, node);
        this.edges.push(e);
        this.repaint();
      })
      .listen(EVENT.NODE.FOLDED, ({ node }) => {
        const edges = this.edges.filter((edge) => edge.src === node);
        const folded = node.isFolded();
        edges.forEach((edge) => {
          edge.hidden = folded;
          updateHiddenState(this, edge, folded);
        });

        this.repaint();
      });
  }
  filterEdges(predicate) {
    return this.edges.filter(predicate);
  }
  repaint(clearCanvas = true) {
    if (clearCanvas) {
      this.canvas.clear();
    }
    this.edges.forEach((e) => {
      const { src, dst } = e;
      const style = dst.$cachedStyle || new EdgeStyle(dst);
      dst.$cachedStyle = style;
      if (!e.hidden) {
        rendering[style.name.toUpperCase()](this.canvas, src, dst);
      }
    });
  }
}

export default EdgeUI;
