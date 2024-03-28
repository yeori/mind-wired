import type { CanvasUI } from "@/components/canvas-ui";
import { ISnapLineResolver } from "./snap-target-resolver";
import type { NodeUI } from "@/components/node";

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

/**
 * It captures snap lines from all nodes(except the starting nodes and their descendants)
 */
export class DefaultTargetResolver implements ISnapLineResolver {
  constructor(
    private startingNode: NodeUI,
    private nodes: NodeUI[],
    private readonly canvas: CanvasUI
  ) {}
  resolveLines(hLines: Set<number>, vLines: Set<number>): void {
    captureSnapLines(
      this.nodes,
      this.startingNode,
      hLines,
      vLines,
      this.canvas
    );
  }
}
