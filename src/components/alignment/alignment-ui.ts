import { SnapToEntitySetting, UISetting } from "../../setting";
import type Configuration from "../config";
import type { NodeUI } from "../node/node-ui";
import { CompositeSnapResolver } from "./snap/composite-snap-resolver";
import { DefaultTargetResolver } from "./snap/default-snap-resolver";
import { DistanceBasedSnapResolver } from "./snap/distance-snap-resolver";
import { ISnapLineResolver } from "./snap/snap-target-resolver";

const abs = (a: number) => Math.abs(a);
const captureNearest = (
  lines: number[],
  value: number,
  min: { idx: number; gap: number },
  limit: number
) => {
  for (let k = 0; k < lines.length; k++) {
    const b = lines[k] - value;
    const vb = abs(b);
    if (vb > limit) {
      continue;
    }
    if (vb < abs(min.gap)) {
      min.idx = k;
      min.gap = b;
    }
  }
};
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
  private _resolveSnapTarget(rootNode: NodeUI): ISnapLineResolver {
    const { snap } = this.config.ui;
    if (snap === false) {
      return undefined;
    }
    const setting = snap as SnapToEntitySetting;
    if (setting.enabled === false) {
      return undefined;
    }
    const { target } = setting;
    const canvas = this.config.getCanvas();
    if (target === undefined || target.length === 0) {
      return new DefaultTargetResolver(rootNode, [...this.activeNodes], canvas);
    }
    const resolvers = target
      .map((rule) => {
        if (rule.distance) {
          return new DistanceBasedSnapResolver(
            this.activeNodes,
            canvas,
            rule.distance
          );
        } else {
          return undefined;
        }
      })
      .filter((resolver) => resolver !== undefined);
    return new CompositeSnapResolver(resolvers);
  }
  turnOn(rootNode: NodeUI, nodes: NodeUI[]) {
    if (!nodes || nodes.length === 0 || !this.config.snapEnabled) {
      return;
    }
    this.activeNodes = [...nodes];
    const snapTargetResolver = this._resolveSnapTarget(rootNode);
    if (snapTargetResolver === undefined) {
      return;
    }
    const vLines = new Set<number>(); // [x in (x,0), (x,H)]
    const hLines = new Set<number>(); // [y in (0,y), (W,y)]

    snapTargetResolver.resolveLines(hLines, vLines);
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
    const limit = snapSetting.limit;
    const canvas = this.config.getCanvas();
    canvas.clear();

    const dim = canvas.getAbsoluteDimensions(this.activeNodes);
    const vLines = [...this.snaps.vLines.values()].filter(
      (x) =>
        Math.abs(dim.x - x) <= limit ||
        Math.abs(dim.r - x) <= limit ||
        Math.abs(dim.cx - x) <= limit
    );
    const hLines = [...this.snaps.hLines.values()].filter(
      (y) =>
        Math.abs(dim.y - y) <= limit ||
        Math.abs(dim.b - y) <= limit ||
        Math.abs(dim.cy - y) <= limit
    );

    const delta = { x: 0, y: 0 };
    if (vLines.length > 0) {
      const min = { idx: 0, gap: vLines[0] - dim.cx };
      captureNearest(vLines, dim.cx, min, limit);
      captureNearest(vLines, dim.x, min, limit);
      captureNearest(vLines, dim.r, min, limit);
      delta.x = min.gap;
      canvas.drawVLines([vLines[min.idx]], (ctx) =>
        lineStyling(ctx, this.config.ui, "vertical")
      );
    }

    if (hLines.length > 0) {
      const min = { idx: 0, gap: hLines[0] - dim.cy };
      captureNearest(hLines, dim.cy, min, limit);
      captureNearest(hLines, dim.y, min, limit);
      captureNearest(hLines, dim.b, min, limit);
      delta.y = min.gap;

      canvas.drawHLines([hLines[min.idx]], (ctx) =>
        lineStyling(ctx, this.config.ui, "horizontal")
      );
    }

    this.activeNodes.forEach((each) => {
      const off = each.offset();
      off.x += delta.x;
      off.y += delta.y;
      each.setOffset(off);
    });
  }
}
