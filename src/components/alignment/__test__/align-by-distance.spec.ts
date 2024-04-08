import { mockConfig } from "@/__test__/test-util";
import { MindWired } from "@/components/mind-wired";
import { NodeSpec } from "@/components/node/node-type";
import { SnapToEntitySetting } from "@/setting";
import { describe, test, expect, beforeEach } from "vitest";

describe("alignment by distance", () => {
  let node: NodeSpec = {
    model: {
      text: "ROOT",
    },
    view: {
      x: 0,
      y: 0,
    },
    subs: [
      { model: { text: "L1" }, view: { x: 100, y: -100 } },
      { model: { text: "L2" }, view: { x: -100, y: -100 } },
      { model: { text: "L3" }, view: { x: -100, y: 100 } },
      { model: { text: "L4" }, view: { x: 100, y: 100 } },
    ],
  };
  let mwd: MindWired;

  beforeEach(() => {
    const config = mockConfig.create();
    mwd = new MindWired(config);
    mwd.nodes(node);
  });

  test("1. ready", () => {
    (mwd.config.ui.snap as SnapToEntitySetting).target = [{ distance: 1 }];
    expect(mwd).toBeDefined();
    const { rootUI } = mwd;
    const L1 = mwd.findNode((node) => node.model.text === "L1");
    mwd.getAligmentContext().turnOn(rootUI, [L1]);
  });
});
