import { describe, test, expect, beforeEach } from "vitest";
import type Configuration from "../config";
import { casting, mockConfig } from "@/__test__/test-util";
import { MindWired } from "../mind-wired";

describe("schema", () => {
  let config: Configuration;
  let mwd: MindWired;
  beforeEach(() => {
    config = mockConfig.create();
    mwd = new MindWired(config);
    mwd.registerSchema({
      name: "beverage",
      css: { backgroundColor: "#ff9988" },
    });
    const spec = casting.withModel({ text: "root" });
    spec.subs = [
      { model: { text: "Coke", schema: "beverage" }, view: { x: -100, y: 0 } },
    ];
    mwd.nodes(spec);
  });

  test("schema as class", async () => {
    const styleEl = document.querySelector("[data-mwd--beverage]");
    // const style = cokeEl.computedStyleMap();
    expect(styleEl).toBeDefined();
    const cokeEl = document.querySelector<HTMLElement>(
      "[data-mind-wired-viewport] .beverage"
    );
    expect(cokeEl).toBeDefined();
    expect(cokeEl.classList.contains("beverage")).toBe(true);
  });
  test("exporting with node, schema, scale", async () => {
    const res = await mwd.exportWith();
    expect(res.node).toBeDefined();
    expect(res.ui).toBeDefined();
    expect(res.schema).toBeDefined();
  });
  test("exporting with node", async () => {
    const res = await mwd.exportWith({ types: ["node"] });
    expect(res.node).toBeDefined();
    expect(res.ui).toBeUndefined();
    expect(res.schema).toBeUndefined();
  });
});