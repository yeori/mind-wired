import { describe, test, expect } from "vitest";
import type { SchemaSpec } from "../node-type";
import { mockConfig, text } from "@/__test__/test-util";
import { SchemaContext } from "../schema-context";

const parseStyleBody = (styleText: string) => {
  const body = text.sliceBetween(styleText.trim(), {
    s: "{",
    e: "}",
  });
  return body
    .split(";")
    .filter((tk) => tk.trim().length > 0)
    .map((styleDef) => styleDef.split(":").map((tk) => tk.trim()));
};
describe("SchemaContext", () => {
  const config = mockConfig.create();
  const ctx = new SchemaContext(config);
  const schema: SchemaSpec = {
    name: "sample",
    style: {
      color: "red",
      fontSize: "12px",
    },
  };
  test("republishing schema", () => {
    ctx.addSchema(schema);
    let style = document.head.querySelector("#mwd-schema-sample");
    expect(style).toBeDefined();

    let styles = parseStyleBody(style.textContent.trim());

    expect(styles.length === 2).toBe(true);
    expect(styles[0]).toEqual(["color", "red"]);
    expect(styles[1]).toEqual(["font-size", "12px"]);

    // republishing
    schema.style.color = "blue";
    schema.style.padding = "4px";
    ctx.addSchema(schema, true);

    style = document.head.querySelector("#mwd-schema-sample");
    styles = parseStyleBody(style.textContent.trim());
    expect(styles.length === 3).toBe(true);
    expect(styles[0]).toEqual(["color", "blue"]);
    expect(styles[1]).toEqual(["font-size", "12px"]);
    expect(styles[2]).toEqual(["padding", "4px"]);

    // disposing
    ctx.removeSchema(schema);
    style = document.head.querySelector("#mwd-schema-sample");
    expect(style).toBeNull();
  });
});
