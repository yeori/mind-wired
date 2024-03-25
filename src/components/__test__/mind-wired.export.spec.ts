import { describe, test, expect, beforeEach } from "vitest";
import type Configuration from "../config";
import { casting, mockConfig } from "@/__test__/test-util";
import { MindWired } from "../mind-wired";
import type { NodeSpec } from "../node/node-type";

describe("a", () => {
  let config: Configuration;
  let mwd: MindWired;
  beforeEach(() => {
    config = mockConfig.create();
    mwd = new MindWired(config);
    mwd.nodes(casting.withModel({ text: "root" }, 20, 30));
  });

  test("1. plain export", async () => {
    const json = await mwd.export();
    console.log(json);

    const spec: NodeSpec = JSON.parse(json);
    mwd = new MindWired(config);
    mwd.nodes(spec);
    expect(mwd.rootUI.x).toBe(0);
    expect(mwd.rootUI.y).toBe(0);
    expect(config.ui.offset.x).toBe(20);
    expect(config.ui.offset.y).toBe(30);
  });
});
