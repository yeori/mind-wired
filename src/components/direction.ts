/**
 * direction relative to parent node
 */
// fix format을 enum으로 바꿔야 함. LR, RL, TB, BT
const resolve = (format: string): any => {
  if ("LR" === format) {
    return { dir: "horizontal", pos: [-1, 1] };
  } else if ("RL" === format) {
    return { dir: "horizontal", pos: [1, -1] };
  } else if ("TB" === format) {
    return { dir: "vertical", pos: [-1, 1] };
  } else if ("BT" === format) {
    return { dir: "vertical", pos: [1, -1] };
  }
};
class Direction {
  node: any;
  prev: Direction | any;
  // fixme NodeUI 타입
  constructor(nodeUI: any) {
    this.node = nodeUI;
    this.prev = null;
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
  // fix format을 enum으로 바꿔야 함. LR, RL, TB, BT
  updated(format: string) {
    // fix dir 타입 필요함,
    const { dir, pos }: { dir: string; pos: number[] } = resolve(format);
    const cur = this[dir as keyof Direction];
    return this.prev[dir] === pos[0] && cur === pos[1];
  }
  capture() {
    const { x, y } = this.node;
    this.prev = {
      horizontal: x <= 0 ? -1 : 1,
      vertical: y <= 0 ? -1 : 1,
    };
  }
}

export default Direction;
