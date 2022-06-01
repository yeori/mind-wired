const captureSnapLines = (nodes, node, hSnaps, vSnaps) => {
  if (nodes.includes(node)) {
    return;
  }
  const dim = node.dimension();
  // top, center, bottom
  hSnaps.add(dim.y);
  hSnaps.add(dim.cy);
  hSnaps.add(dim.b);
  // left, center, right
  vSnaps.add(dim.x);
  vSnaps.add(dim.cx);
  vSnaps.add(dim.r);
  if (node.isFolded()) {
    return;
  }
  node.subs.forEach((child) => {
    captureSnapLines(nodes, child, hSnaps, vSnaps);
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
const minGapIndex = (gaps) =>
  gaps.reduce(
    (minIdx, gap, idx) => (abs(gap) < abs(gaps[minIdx]) ? idx : minIdx),
    0
  );
const lineStyling = (ctx, ui, dir) => {
  ctx.strokeStyle = ui.snap.color[dir];
  ctx.lineWidth = ui.snap.width || 0.4;
  if (ui.snap.dash) {
    ctx.setLineDash(ui.snap.dash);
  }
};
export default class AligmentUI {
  /**
   *
   * @param {Configuration} config (see config.js)
   */
  constructor(config) {
    this.config = config;
  }
  turnOn(rootNode, nodes) {
    if (!nodes || nodes.length === 0 || !this.config.snapEnabled) {
      return;
    }
    const vLines = new Set(); // [x in (x,0), (x,H)]
    const hLines = new Set(); // [y in (0,y), (W,y)]
    this.activeNodes = [...nodes];
    captureSnapLines(nodes, rootNode, hLines, vLines, this.config.scale);
    this.snaps = { hLines, vLines };
  }
  turnOff() {
    this.callback = null;
    this.snaps = null;
    this.node = null;
  }
  doAlign() {
    if (!this.snaps || this.snaps.length === 0) {
      return;
    }
    const { ui } = this.config;
    const node = this.activeNodes[0];
    const limit = ui.snap.limit;
    const snap = ui.snap.limit;
    const canvas = this.config.getCanvas();
    canvas.clear();

    const dim = node.dimension();
    const vLines = [...this.snaps.vLines.values()].filter(
      (x) =>
        Math.abs(dim.x - x) <= limit ||
        Math.abs(dim.r - x) <= limit ||
        abs(dim.cx - x) <= limit
    );
    const hLines = [...this.snaps.hLines.values()].filter(
      (y) =>
        Math.abs(dim.y - y) <= limit ||
        Math.abs(dim.b - y) <= limit ||
        Math.abs(dim.cy - y) <= limit
    );

    const delta = { x: 0, y: 0 };
    if (vLines.length > 0) {
      const adjL = adj(vLines, dim, "x");
      const adjC = adj(vLines, dim, "cx");
      const adjR = adj(vLines, dim, "r");
      const gaps = [adjC - dim.cx, adjL - dim.x, adjR - dim.r];
      const idx = minGapIndex(gaps);
      if (abs(gaps[idx]) <= snap) {
        delta.x = gaps[idx];
      }
      if (this.config.snapEnabled) {
        canvas.drawVLines([adjL, adjC, adjR], (ctx) =>
          lineStyling(ctx, ui, "vertical")
        );
      }
    }

    if (hLines.length > 0) {
      const adjT = adj(hLines, dim, "y");
      const adjC = adj(hLines, dim, "cy");
      const adjB = adj(hLines, dim, "b");

      const gaps = [adjC - dim.cy, adjT - dim.y, adjB - dim.b];
      const idx = minGapIndex(gaps);
      if (abs(gaps[idx]) <= snap) {
        delta.y = gaps[idx];
      }
      if (this.config.snapEnabled) {
        canvas.drawHLines([adjT, adjC, adjB], (ctx) =>
          lineStyling(ctx, ui, "horizontal")
        );
      }
    }

    this.activeNodes.forEach((each) => {
      const off = each.offset();
      off.x += delta.x;
      off.y += delta.y;
      each.setOffset(off);
    });
    // node.setOffset(pos);
  }
}
