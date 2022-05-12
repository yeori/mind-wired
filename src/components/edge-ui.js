import { EVENT } from "../service/event-bus";
import line_edge from "./edge/line-edge-renderer";
const rendering = {
  LINE: line_edge,
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
class Edge {
  constructor(srcNode, dstNode) {
    this.srcNode = srcNode;
    this.dstNode = dstNode;
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
      .listen(EVENT.NEW.NODE, (nodeUI) => {
        const e = new Edge(nodeUI.parent, nodeUI);
        this.edges.push(e);
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
      });
  }
  repaint() {
    this.canvas.clear();
    this.edges.forEach((e) => {
      const { src, dst } = e;
      rendering["LINE"](this.canvas, src, dst);
    });
  }
}

export default EdgeUI;
