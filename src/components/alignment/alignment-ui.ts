import { SnapToEntitySetting, UISetting } from "../../setting";
import type { CanvasUI } from "../canvas-ui";
import type Configuration from "../config";
import { NodeRect } from "../node/node-type";
import type { NodeUI } from "../node/node-ui";

const captureSnapLines = (
  nodes: NodeUI[],
  node: NodeUI,
  hSnaps: Set<number>,
  vSnaps: Set<number>,
  canvas: CanvasUI
) => {
  if (nodes.includes(node)) {
    return;
  }
  const dim = canvas.getNodeDimension(node);
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
    captureSnapLines(nodes, child, hSnaps, vSnaps, canvas);
  });
};
const abs = (a: number) => Math.abs(a);
const adj = <K extends keyof NodeRect>(
  points: number[],
  dim: NodeRect,
  dir: K
) => {
  return points.reduce((adj, p) => {
    const a = (dim[dir] as number) - adj;
    const b = (dim[dir] as number) - p;
    return abs(a) <= abs(b) ? adj : p;
  }, points[0]);
};
const minGapIndex = (gaps: number[]) =>
  gaps.reduce(
    (minIdx, gap, idx) => (abs(gap) < abs(gaps[minIdx]) ? idx : minIdx),
    0
  );
const lineStyling = (
  ctx: CanvasRenderingContext2D,
  ui: UISetting,
  dir: "horizontal" | "vertical"
) => {
  const snap = ui.snap as SnapToEntitySetting;
  ctx.strokeStyle = snap.color[dir];
  ctx.lineWidth = snap.width || 0.4;
  if (snap.dash) {
    ctx.setLineDash(snap.dash);
  }
};
export default class AligmentUI {
  activeNodes: NodeUI[];
  snaps: { hLines: Set<number>; vLines: Set<number> };
  constructor(readonly config: Configuration) {}
  turnOn(rootNode: NodeUI, nodes: NodeUI[]) {
    if (!nodes || nodes.length === 0 || !this.config.snapEnabled) {
      return;
    }
    const canvas = this.config.getCanvas();
    const vLines = new Set<number>(); // [x in (x,0), (x,H)]
    const hLines = new Set<number>(); // [y in (0,y), (W,y)]
    this.activeNodes = [...nodes];
    captureSnapLines(nodes, rootNode, hLines, vLines, canvas);
    this.snaps = { hLines, vLines };
  }
  turnOff() {
    this.snaps = null;
    this.activeNodes = undefined;
  }
  doAlign() {
    if (!this.snaps) {
      return;
    }
    const { snapSetting } = this.config;
    const node = this.activeNodes[0];
    const limit = snapSetting.limit;
    const snap = snapSetting.limit;
    const canvas = this.config.getCanvas();
    canvas.clear();

    const dim = canvas.getNodeDimension(node);
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
          lineStyling(ctx, this.config.ui, "vertical")
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
          lineStyling(ctx, this.config.ui, "horizontal")
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
