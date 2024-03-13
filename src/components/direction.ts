import { type Heading } from "../service/geom";
import { type NodeUI } from "./node/node-ui";
/**
 * direction flow relative to parent node
 * * LR: moved from left to right
 * * RL: moved from right to left
 * * TB: moved from top to bottom
 * * BT: moved from bottom to top
 */
export type DirectionFlow = "LR" | "RL" | "TB" | "BT";
export class Direction {
  node: NodeUI;
  private prev: Heading;
  // fixme NodeUI 타입
  constructor(nodeUI: NodeUI) {
    this.node = nodeUI;
    this.prev = undefined;
    this.capture();
  }
  get horizontal() {
    const { x } = this.node;
    return x <= 0 ? -1 : 1;
  }
  get vertical() {
    const { y } = this.node;
    return y <= 0 ? -1 : 1;
  }
  updated(format: DirectionFlow) {
    const cur = this.node.getHeading();
    if (format === "LR") {
      return this.prev.cwy > 180 && cur.cwy <= 180;
    } else if (format === "RL") {
      return this.prev.cwy <= 180 && cur.cwy > 180;
    } else if (format === "TB") {
      return this.prev.ccwx <= 180 && cur.ccwx > 180;
    } else if (format === "BT") {
      return this.prev.ccwx > 180 && cur.ccwx <= 180;
    } else {
      throw new Error(
        `[${format}] is not allowed. use 'LR' | 'RL' | 'TB' | 'BT'`
      );
    }
  }
  capture() {
    this.prev = this.node.getHeading();
  }
}
