import { describe, test, expect } from "vitest";
import { Point, geom } from "../geom";

describe("geom.ts", () => {
  test("class Point", () => {
    let p = new Point();
    expect(p.x).toBe(0);
    expect(p.y).toBe(0);

    p = new Point(2, 5);
    expect(p.x).toBe(2);
    expect(p.y).toBe(5);

    const copied = p.clone();
    expect(copied.x).toBe(2);
    expect(copied.y).toBe(5);

    const sum = p.sum(copied);
    expect(sum.x).toBe(4);
    expect(sum.y).toBe(10);
  });

  test("rotating 90deg", () => {
    const base = new Point(1, 1);
    const dst = new Point(6, 1);
    const rotated = geom.rotate(base, dst, 90);
    expect(rotated.x).toBeCloseTo(1);
    expect(rotated.y).toBeCloseTo(6);
  });
  test("rotating 90deg with scale", () => {
    const base = new Point(1, 1);
    const dst = new Point(6, 1);
    let rotated = geom.rotate(base, dst, 90, { scale: 2 });
    expect(rotated.x).toBeCloseTo(1);
    expect(rotated.y).toBeCloseTo(11);

    rotated = geom.rotate(base, dst, -90, { scale: 0.5 });
    expect(rotated.x).toBeCloseTo(1);
    expect(rotated.y).toBeCloseTo(-1.5);
  });
});
