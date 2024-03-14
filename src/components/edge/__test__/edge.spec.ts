import { describe, test, expect } from "vitest";
import { LineEdgeRenderer } from "../line-edge-renderer";

describe("init", () => {
  test("init", () => {
    /**
     * circular reference error.
     */
    const line = new LineEdgeRenderer();
    expect(line).toBeDefined();
  });
});
