import { describe, test, expect } from "vitest";
import { Heading, Point } from "../geom";

describe("heading", () => {
  test("quadrant 1", () => {
    let h = new Heading(new Point(5, 5));
    expect(h.cwy).toBe(45);
    expect(h.ccwx).toBe(45);

    h = new Heading(new Point(5, 4));
    expect(h.cwy > 45).toBeTruthy();
    expect(h.ccwx < 45).toBeTruthy();
    expect(h.quadrant).toBe(1);
  });
  test("quadrant 2", () => {
    const p = new Point(-5, 5);
    const h = new Heading(p);
    expect(h.cwy).toBe(315);
    expect(h.ccwx).toBe(90 + 45);
    expect(h.quadrant).toBe(2);
  });
  test("quadrant 3", () => {
    const p = new Point(-5, -5);
    const h = new Heading(p);
    expect(h.cwy).toBe(180 + 45);
    expect(h.ccwx).toBe(180 + 45);
    expect(h.quadrant).toBe(3);
  });
  test("quadrant 4", () => {
    const h = new Heading(new Point(5, -5));
    expect(h.cwy).toBe(90 + 45);
    expect(h.ccwx).toBe(270 + 45);
    expect(h.quadrant).toBe(4);
  });
  test("qad 1 and 2", () => {
    const h1 = new Heading(new Point(0, 5));
    expect(h1.cwy).toBe(0);
    expect(h1.ccwx).toBe(90);
    expect(h1.quadrant).toBe(2);
  });
  test("qad 2 and 3", () => {
    const h1 = new Heading(new Point(-5, 0));
    expect(h1.cwy).toBe(270);
    expect(h1.ccwx).toBe(180);
    expect(h1.quadrant).toBe(3);
  });
  test("qad 3 and 4", () => {
    const h1 = new Heading(new Point(0, -5));
    expect(h1.cwy).toBe(180);
    expect(h1.ccwx).toBe(270);
    expect(h1.quadrant).toBe(4);
  });
  test("qad 4 and 1", () => {
    const h1 = new Heading(new Point(5, 0));
    expect(h1.cwy).toBe(90);
    expect(h1.ccwx).toBe(0);
    expect(h1.quadrant).toBe(1);
  });
});
