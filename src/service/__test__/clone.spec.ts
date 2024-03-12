import { describe, test, expect } from "vitest";
import { clone, uuid } from "..";

describe("service:uuid", () => {
  test("default 16 length", () => {
    const key = uuid();
    expect(key.length).toBe(16);
  });
});

describe("clone.deepCopy", () => {
  test("undefined and null", () => {
    expect(clone.deepCopy(undefined)).toBeUndefined();
    expect(clone.deepCopy(null)).toBeNull();
  });
  test("primitive", () => {
    expect(clone.deepCopy(2)).toBe(2);
    expect(clone.deepCopy("hello")).toBe("hello");
    expect(clone.deepCopy(true)).toBe(true);
    expect(clone.deepCopy(false)).toBe(false);
  });
  test("array", () => {
    expect(clone.deepCopy([2, 3, 5, 7])).toEqual([2, 3, 5, 7]);
    expect(clone.deepCopy(["one", "Two"])).toEqual(["one", "Two"]);
  });

  test("literal object", () => {
    const src = { name: "Name", languages: ["Java", "Typescript"] };
    const out = clone.deepCopy(src);
    expect(src === out).toBe(false);
    expect(src.languages === out.languages).toBe(false);
    expect(out).toEqual(src);
  });
  test("array in array", () => {
    expect(
      clone.deepCopy([
        [2, 3],
        ["five", "seven"],
      ])
    ).toEqual([
      [2, 3],
      ["five", "seven"],
    ]);
  });
});

describe("clone.mergeLeaf", () => {
  test("fill empty properties", () => {
    const src = { color: "#000", padding: { left: 7, right: 7 } };
    const dst = { color: "#aaa", padding: { left: 0, top: 16 } };
    clone.mergeLeaf(src, dst);
    expect(dst.color).toBe("#000");
    expect(dst.padding).toEqual({ left: 7, right: 7, top: 16 });
  });
});