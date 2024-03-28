import { casting, mockConfig } from "@/__test__/test-util";
import { CanvasUI } from "@/components/canvas-ui";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { LineEdgeRenderer } from "../line-edge-renderer";
import { EdgeSpec, NodeRect } from "@/components/node/node-type";
import { Point } from "@/setting";
const NOT_USED = 0;
describe("line edge renderer", () => {
  const config = mockConfig.create();
  const line = new LineEdgeRenderer();
  const canvas = new CanvasUI(config);

  const dst = casting.mockNode({ text: "RIGHT" }, config, {
    x: 100,
    y: -100,
  });

  const pathes: Array<Point[]> = [];
  vi.spyOn(canvas, "drawPath").mockImplementation((points, option, fn) => {
    pathes.push(points);
  });
  vi.spyOn(canvas, "getNodeDimension").mockImplementation((node, relative) => {
    return new NodeRect(
      new Point(node.x, node.y),
      new DOMRect(NOT_USED, NOT_USED, 60, 20)
    );
  });

  beforeEach(() => {
    pathes.splice(0, pathes.length);
  });

  test("valign: center", () => {
    const edge: EdgeSpec = { name: "line", option: { valign: "center" } };
    const src = casting.mockNode({ text: "ROOT" }, config, {
      x: 0,
      y: 0,
      edge,
    });

    line.render(canvas, src, dst);
    expect(pathes.length).toBe(1);
    expect(pathes[0][0]).toEqual(new Point(0, 0));
    expect(pathes[0][1]).toEqual(new Point(100, -100));
  });
  test("valign: bottom", () => {
    const edge: EdgeSpec = { name: "line", option: { valign: "bottom" } };
    const src = casting.mockNode({ text: "ROOT" }, config, {
      x: 0,
      y: 0,
      edge,
    });
    vi.spyOn(src, "firstChild").mockImplementation(() => dst);

    line.render(canvas, src, dst);
    expect(pathes.length).toBe(3);
    // expect(pathes[0][0]).toEqual(new Point(0, 0));
    // expect(pathes[0][1]).toEqual(new Point(100, -100));
  });
});
