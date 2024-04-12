import { describe, test, expect, beforeEach, vi } from "vitest";
import type { Configuration } from "../config";
import { casting, mockConfig } from "@/__test__/test-util";
import { MindWired } from "../mind-wired";
import { EVENT } from "@/mindwired-event";

describe("schema", () => {
  let config: Configuration;
  let mwd: MindWired;
  beforeEach(() => {
    config = mockConfig.create();
    mwd = new MindWired(config);
    mwd.registerSchema({
      name: "beverage",
      style: { backgroundColor: "#ff9988" },
    });
    const spec = casting.withModel({ text: "root" });
    spec.subs = [
      { model: { text: "Coke", schema: "beverage" }, view: { x: -100, y: 0 } },
      { model: { text: "Sprite" }, view: { x: 100, y: 0 } },
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

  test("binding schema", () => {
    const sprite = mwd.findNode((node) => node.model.text === "Sprite");
    const beverage = mwd
      .getSchemaContext()
      .getSchemas()
      .find((schema) => (schema.name = "beverage"));
    mwd.bindSchema(beverage, [sprite]);
    expect(sprite.model.schema).toBe("beverage");

    mwd.bindSchema(beverage, [sprite]);
    expect(sprite.model.schema).toBe("beverage");
  });
  test("unbind schema", () => {
    const coke = mwd.findNode((node) => node.model.text === "Coke");
    mwd.unbindSchema("beverage", [coke]);
    expect(coke.model.schema).toBeUndefined();
    // no schema bound
    const sprite = mwd.findNode((node) => node.model.text === "Sprite");
    expect(sprite.model.schema).toBeUndefined();
    mwd.unbindSchema("beverage", [sprite]);
    expect(sprite.model.schema).toBeUndefined();
  });
  test("remove schema", () => {
    const ctx = mwd.getSchemaContext();
    expect(ctx.getSchemas().length).toBe(1);
    ctx.removeSchema("beverage");
    expect(ctx.getSchemas().length).toBe(0);
  });
  test("schema bound event", () => {
    const sprite = mwd.findNode((node) => node.model.text === "Sprite");
    const { mock } = vi.spyOn(config, "emit");
    mwd.listenStrict(EVENT.NODE.UPDATED, () => {});

    vi.useFakeTimers();
    mwd.bindSchema("beverage", [sprite]);

    vi.advanceTimersToNextTimer();
    expect(mock.results.length).toBe(1);
  });
});
