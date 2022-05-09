/**
 * direction relative to parent node
 */

const resolve = (format) => {
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
  constructor(nodeUI) {
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
  updated(format) {
    const { dir, pos } = resolve(format);
    const cur = this[dir];
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
