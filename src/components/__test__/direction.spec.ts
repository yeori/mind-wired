import { describe, test, expect } from "vitest";
import { NodeUI } from "../node/node-ui";
import { Direction, DirectionFlow } from "../direction";

const expectTrueFlow = (dir: Direction, truthy: DirectionFlow) => {
  const falses = new Set<DirectionFlow>(["LR", "RL", "TB", "BT"]);
  falses.delete(truthy);
  for (let falsy of falses) {
    expect(dir.updated(falsy)).toBeFalsy();
  }
  if (truthy) {
    expect(dir.updated(truthy)).toBeTruthy();
  }
};
describe("by X axis", () => {
  test("LR RL movement", () => {
    // from quadrant 3
    const node = new NodeUI(
      { model: { text: "not used" }, view: { x: -1, y: -1 } },
      undefined
    );
    const dir = new Direction(node);

    node.setPos(1, -1, false); // (quad 3 -> quad 2)
    expectTrueFlow(dir, "LR");

    node.setPos(-2, -2, false); // (quad 3 -> quad 3)
    expectTrueFlow(dir, undefined);

    node.setPos(-1, 1, false); // (quad 3 -> quad 4)
    expectTrueFlow(dir, undefined);

    node.setPos(1, 1, false); // (quad 3 -> quad 1)
    expectTrueFlow(dir, "LR");

    // [1, 1], quandrant 1
    dir.capture();

    node.setPos(2, 2, false); // (quad 1 -> quad 1)
    expectTrueFlow(dir, undefined);

    node.setPos(1, -1, false); // (quad 1 -> quad 2)
    expectTrueFlow(dir, undefined);

    node.setPos(-1, -1, false); // to quandrant 3
    expectTrueFlow(dir, "RL");

    node.setPos(-1, 1, false); // (quad 1 -> quad 4)
    expectTrueFlow(dir, "RL");

    // [-1, 1] quad 4
    dir.capture();
    node.setPos(2, 2, false); // (quad 4 -> quad 1)
    expectTrueFlow(dir, "LR");

    node.setPos(1, -1, false); // (quad 4 -> quad 2)
    expectTrueFlow(dir, "LR");

    node.setPos(-1, -1, false); // (quad 4 -> quad 3)
    expectTrueFlow(dir, undefined);

    node.setPos(-2, 2, false); // (quad 4 -> quad 4)
    expectTrueFlow(dir, undefined);
  });
});
