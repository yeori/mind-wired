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
}
class EdgeUI {
  constructor(config, rootNode, canvas) {
    this.config = config;
    this.canvas = canvas;
    this.edges = [];
    createEdges(rootNode, this.edges);
  }
  repaint() {
    this.edges.forEach((e) => {
      const { src, dst } = e;
      console.log(
        `${src.uid}(${src.level()})`,
        src.offset(),
        `${dst.uid}(${dst.level()})`,
        dst.offset()
      );
      rendering["LINE"](this.canvas, src, dst);
    });
  }
}

export default EdgeUI;
