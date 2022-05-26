const captureSnapLines = (targetNode, node, hSnaps, vSnaps, scale) => {
  if (node === targetNode) {
    return;
  }
  const dim = node.dimension();
  hSnaps.add(dim.y);
  hSnaps.add(dim.b);
  vSnaps.add(dim.x);
  vSnaps.add(dim.r);
  if (node.isFolded()) {
    return;
  }
  node.subs.forEach((child) => {
    captureSnapLines(targetNode, child, hSnaps, vSnaps);
  });
};
const abs = (a) => Math.abs(a);
const adj = (points, dim, dir) => {
  return points.reduce((adj, p) => {
    const a = dim[dir] - adj;
    const b = dim[dir] - p;
    return abs(a) <= abs(b) ? adj : p;
  }, points[0]);
};
export default class AligmentUI {
  /**
   *
   * @param {Configuration} config (see config.js)
   */
  constructor(config) {
    this.config = config;
  }
  turnOn(rootNode, targetNode) {
    if (!targetNode) {
      return;
    }
    const vLines = new Set(); // [x in (x,0), (x,H)]
    const hLines = new Set(); // [y in (0,y), (W,y)]
    captureSnapLines(targetNode, rootNode, hLines, vLines, this.config.scale);
    // this.node = node;
    this.snaps = { hLines, vLines };
    this.node = targetNode;
  }
  turnOff() {
    this.callback = null;
    this.snaps = null;
    this.node = null;
  }
  repaint() {
    if (!this.node) {
      return;
    }
    const canvas = this.config.getCanvas();
    const { scale } = canvas;
    canvas.clear();

    const dim = this.node.dimension();
    const vLines = [...this.snaps.vLines.values()].filter(
      (x) => Math.abs(dim.x - x) <= 10 || Math.abs(dim.r - x) <= 10
    );
    const hLines = [...this.snaps.hLines.values()].filter(
      (y) => Math.abs(dim.y - y) <= 10 || Math.abs(dim.b - y) <= 10
    );

    // relative pos from the direct parent
    const pos = this.node.offset();
    if (vLines.length > 0) {
      const adjL = adj(vLines, dim, "x");
      const adjR = adj(vLines, dim, "r");

      const [gLeft, gRight] = [dim.x - adjL, dim.r - adjR];
      const gap = abs(gLeft) <= abs(gRight) ? gLeft : gRight;
      if (abs(gap) <= 5) {
        // this.node.setPos(pos.x + gap, pos.y);
        pos.x -= gap / scale;
      }
      canvas.drawVLines(vLines, {});
    }

    if (hLines.length > 0) {
      const adjT = adj(hLines, dim, "y");
      const adjB = adj(hLines, dim, "b");

      const [gTop, gBottom] = [dim.y - adjT, dim.b - adjB];
      const gap = abs(gTop) <= abs(gBottom) ? gTop : gBottom;
      if (abs(gap) <= 5) {
        // this.node.setPos(pos.x + gap, pos.y);
        pos.y -= gap / scale;
      }
      canvas.drawHLines(hLines, {});
    }
    // this.node.setPos(pos.x, pos.y);
    this.node.setOffset(pos);
  }
}
