import { describe, test, expect } from "vitest";
import { NodeUI } from "../node/node-ui";
import { Direction, DirectionFlow } from "../direction";

const expectTrueFlow = (dir: Direction, truthy: DirectionFlow[]) => {
  truthy = truthy || [];
  const falses = new Set<DirectionFlow>(["LR", "RL", "TB", "BT"]);
  truthy.forEach((v) => {
    falses.delete(v);
  });

  for (let falsy of falses) {
    expect(dir.updated(falsy)).toBeFalsy();
  }
  truthy.forEach((v) => {
    expect(dir.updated(v)).toBeTruthy();
  });
};
describe("by X axis", () => {
  test("LR RL movement", () => {
    /**
     * ---+---
     *  2 | 1
     * ---+---
     *  3 | 4
     * ---+---
     */
    const node = new NodeUI(
      { model: { text: "not used" }, view: { x: -1, y: -1 } },
      undefined
    );
    const dir = new Direction(node);

    // from [-1, -1] quad 3
    dir.capture();
    node.setPos(1, -1, false); // (quad 3 -> quad 4)
    expectTrueFlow(dir, ["LR"]);

    node.setPos(-2, -2, false); // (quad 3 -> quad 3)
    expectTrueFlow(dir, undefined);

    node.setPos(-1, 1, false); // (quad 3 -> quad 2)
    expectTrueFlow(dir, ["BT"]);

    node.setPos(1, 1, false); // (quad 3 -> quad 1)
    expectTrueFlow(dir, ["LR", "BT"]);

    // [1, 1], quandrant 1
    dir.capture();

    node.setPos(2, 2, false); // (quad 1 -> quad 1)
    expectTrueFlow(dir, undefined);

    node.setPos(1, -1, false); // (quad 1 -> quad 4)
    expectTrueFlow(dir, ["TB"]);

    node.setPos(-1, -1, false); //(quad 1 -> quat 3)
    expectTrueFlow(dir, ["RL", "TB"]);

    node.setPos(-1, 1, false); // (quad 1 -> quad 2)
    expectTrueFlow(dir, ["RL"]);

    // [-1, 1] quad 2
    dir.capture();
    node.setPos(2, 2, false); // (quad 2 -> quad 1)
    expectTrueFlow(dir, ["LR"]);

    node.setPos(-1, -1, false); // (quad 2 -> quad 3)
    expectTrueFlow(dir, ["TB"]);

    node.setPos(-2, 2, false); // (quad 2 -> quad 2)
    expectTrueFlow(dir, undefined);

    node.setPos(1, -1, false); // (quad 2 -> quad 4)
    expectTrueFlow(dir, ["LR", "TB"]);
  });
});
