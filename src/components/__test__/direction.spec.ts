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
     * +---+------> [X]
     * | 2 | 1      Q1: (+X, -Y)
     * |---+---     Q2: (-X, -Y)
     * | 3 | 4      Q3: (-X, +Y)
     * |---+---     Q4: (+X, +Y)
     * |
     * v
     * [Y]
     */
    const node = new NodeUI(
      { model: { text: "not used" }, view: { x: -1, y: -1 } },
      undefined
    );
    const dir = new Direction(node);

    // from [-1, -1] Q2
    dir.capture();
    node.setPos(1, -1, false); // (Q2 -> quad 1)
    expectTrueFlow(dir, ["LR"]);

    node.setPos(-2, -2, false); // (Q2 -> Q2)
    expectTrueFlow(dir, undefined);

    node.setPos(-1, 1, false); // (Q2 -> quad 3)
    expectTrueFlow(dir, ["TB"]);

    node.setPos(1, 1, false); // (Q2 -> quad 4)
    expectTrueFlow(dir, ["LR", "TB"]);

    // [1, 1], quandrant 4
    dir.capture();

    node.setPos(2, 2, false); // (Q4 -> Q4)
    expectTrueFlow(dir, undefined);

    node.setPos(1, -1, false); // (Q4 -> Q1)
    expectTrueFlow(dir, ["BT"]);

    node.setPos(-1, -1, false); //(Q4 -> Q2)
    expectTrueFlow(dir, ["RL", "BT"]);

    node.setPos(-1, 1, false); // (Q4 -> Q3)
    expectTrueFlow(dir, ["RL"]);

    // [-1, 1] Q3
    dir.capture();
    node.setPos(2, 2, false); // (Q3 -> Q4)
    expectTrueFlow(dir, ["LR"]);

    node.setPos(-1, -1, false); // (Q3 -> Q2)
    expectTrueFlow(dir, ["BT"]);

    node.setPos(-2, 2, false); // (Q3 -> Q3)
    expectTrueFlow(dir, undefined);

    node.setPos(1, -1, false); // (Q3 -> Q1)
    expectTrueFlow(dir, ["LR", "BT"]);
  });
});
