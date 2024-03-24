import { describe, test, expect } from "vitest";
import { Heading, Point } from "../geom";

describe("heading", () => {
  test("quadrant 4", () => {
    /**
     * ```
     *  (0, 0)
     *    +----------->
     *    |   θ
     *    |
     *    |
     *    |         * (5, 5)
     *    v
     * ```
     */
    let h = new Heading(new Point(5, 5));
    expect(h.cwy).toBe(135);
    expect(h.ccwx).toBe(315);

    h = new Heading(new Point(5, 4));
    expect(h.cwy < 135).toBeTruthy();
    expect(h.ccwx > 315).toBeTruthy();
    expect(h.quadrant).toBe(4);
  });
  test("quadrant 3", () => {
    /**
     * <------+(0,0)
     *        |
     *   +    |
     * (-5,5) v
     */

    let h = new Heading(new Point(-5, 5));
    expect(h.cwy).toBe(180 + 45);
    expect(h.ccwx).toBe(180 + 45);

    h = new Heading(new Point(-5, 4));
    expect(h.cwy > 180 + 45).toBe(true);
    expect(h.ccwx < 180 + 45).toBe(true);
    // expect(h.quadrant).toBe(2);
  });
  test("quadrant 2", () => {
    /**
     *          ^
     *  (-5,-5) |
     *   +      |
     *          |
     * <--------+(0.0)
     */
    let h = new Heading(new Point(-5, -5));
    expect(h.cwy).toBe(270 + 45);
    expect(h.ccwx).toBe(90 + 45);

    h = new Heading(new Point(-5, -4));
    expect(h.cwy < 270 + 45).toBe(true);
    expect(h.ccwx > 90 + 45).toBe(true);
  });
  test("quadrant 1", () => {
    const h = new Heading(new Point(5, -5));
    expect(h.cwy).toBe(45);
    expect(h.ccwx).toBe(45);
    // expect(h.quadrant).toBe(4);
  });
  test("qad 1 and 2", () => {
    const h1 = new Heading(new Point(0, 5));
    expect(h1.cwy).toBe(180);
    expect(h1.ccwx).toBe(270);
    // expect(h1.quadrant).toBe(2);
  });
  test("qad 2 and 3", () => {
    const h1 = new Heading(new Point(-5, 0));
    expect(h1.cwy).toBe(270);
    expect(h1.ccwx).toBe(180);
    // expect(h1.quadrant).toBe(3);
  });
  test("qad 3 and 4", () => {
    const h1 = new Heading(new Point(0, -5));
    expect(h1.cwy).toBe(0);
    expect(h1.ccwx).toBe(90);
    // expect(h1.quadrant).toBe(4);
  });
  test("qad 4 and 1", () => {
    const h1 = new Heading(new Point(5, 0));
    expect(h1.cwy).toBe(90);
    expect(h1.ccwx).toBe(0);
    // expect(h1.quadrant).toBe(1);
  });
});
