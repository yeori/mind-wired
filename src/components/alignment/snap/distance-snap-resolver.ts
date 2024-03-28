import type { NodeUI } from "@/components/node";
import { ISnapLineResolver } from "./snap-target-resolver";
import type { CanvasUI } from "@/components/canvas-ui";

const walkUpward = (
  node: NodeUI,
  distance: number,
  hLines: Set<number>,
  vLines: Set<number>,
  canvas: CanvasUI,
  visited: NodeUI[]
) => {
  if (node === undefined) {
    // called from root node
    return;
  }
  if (visited.includes(node)) {
    return;
  }
  if (distance === 0) {
    return;
  }
  const dim = canvas.getNodeDimension(node);
  // top, center, bottom
  hLines.add(dim.y);
  hLines.add(dim.cy);
  hLines.add(dim.b);
  // left, center, right
  vLines.add(dim.x);
  vLines.add(dim.cx);
  vLines.add(dim.r);
  walkUpward(node.parent, distance - 1, hLines, vLines, canvas, visited);
  if (node.isFolded()) {
    return;
  }
  node.subs.forEach((child) => {
    walkDownward(child, distance - 1, hLines, vLines, canvas, visited);
  });
};
const walkDownward = (
  node: NodeUI,
  distance: number,
  hLines: Set<number>,
  vLines: Set<number>,
  canvas: CanvasUI,
  visited: NodeUI[]
) => {
  if (visited.includes(node)) {
    return;
  }
  if (distance === 0) {
    return;
  }
  const dim = canvas.getNodeDimension(node);
  // top, center, bottom
  hLines.add(dim.y);
  hLines.add(dim.cy);
  hLines.add(dim.b);
  // left, center, right
  vLines.add(dim.x);
  vLines.add(dim.cx);
  vLines.add(dim.r);
  if (node.isFolded()) {
    return;
  }
  node.subs.forEach((child) => {
    walkDownward(child, distance - 1, hLines, vLines, canvas, visited);
  });
};
/**
 * Distance based snap line resolver
 *
 * ```
 * [configuration]
 *   ui: {
 *     snap: {
 *       enabled: true,
 *       target: [{ distance: 2 }],
 *     }
 *   }
 * ```
 * Setting `{distance: 2}` searchs snap lines from nodes within the distance 2(except the starting nodes and their descendants).
 */
export class DistanceBasedSnapResolver implements ISnapLineResolver {
  constructor(
    readonly staringNodes: NodeUI[],
    readonly canvas: CanvasUI,
    readonly distance: number
  ) {}
  resolveLines(hLines: Set<number>, vLines: Set<number>): void {
    const visited: NodeUI[] = [...this.staringNodes];
    this.staringNodes.forEach((node) => {
      walkUpward(
        node.parent,
        this.distance,
        hLines,
        vLines,
        this.canvas,
        visited
      );
    });
  }
}
