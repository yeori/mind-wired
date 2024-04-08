import { describe, test, expect, beforeEach, vi } from "vitest";
import { Configuration } from "../config";
import { MindWired } from "../mind-wired";
import { UserDefinedRenderer } from "../node";
import mockApi, { Country } from "../../../test/mock-api";
import { DomUtil } from "../../service/dom";
import { EVENT } from "../../mindwired-event";

let mwd: MindWired;
beforeEach(() => {
  const config = Configuration.parse(
    {
      el: "#app",
      ui: { width: "400px" },
    },
    new DomUtil()
  );
  mwd = new MindWired(config);
});
describe("init", () => {
  test("init", () => {
    expect(mwd).toBeDefined();
    const { styleDef } = mwd.config.ui;
    expect(styleDef).toBeDefined();
    expect(styleDef.schema).toBeDefined();
    expect(styleDef.schema.styleId).toBeDefined();
    expect(styleDef.schema.selector).toBeDefined();
  });
});

describe("Adding datasource", () => {
  test("registering datasource", async () => {
    const countries = await mockApi.loadCountries();

    const countryRenderer: UserDefinedRenderer<Country> = {
      name: "country-renderer",
      text: (c: Country) => `[${c.code}]${c.name}`,
    };
    const ds = mwd.createDataSource<Country, string>("country", (c) => c.code, {
      renderer: countryRenderer,
    });
    ds.setData(countries);

    const listenFor = vi.spyOn(mwd, "listenStrict");

    mwd.listenStrict(EVENT.NODE.CREATED, () => {});

    mwd.nodes({
      model: {
        type: "text",
        text: "ROOT",
      },
      view: {
        layout: { type: "X-AXIS" },
        x: 0,
        y: 0,
      },
      subs: [
        {
          model: {
            provider: {
              key: "BRA",
            },
          },
          view: {
            x: 120,
            y: -50,
          },
        },
      ],
    });

    const node = mwd.addNode(mwd.rootUI, {
      model: { text: "sub00" },
      view: { x: -50, y: 50 },
    });
    expect(node.parent.uid).toBe(mwd.rootUI.uid);
    expect(listenFor).toHaveBeenCalledOnce();
  });
});

describe("edge of node", () => {
  test("changing edge renderer", () => {
    mwd.nodes({
      model: {
        type: "text",
        text: "ROOT",
      },
      view: {
        layout: { type: "X-AXIS" },
        edge: { color: "red", name: "mustache_lr", width: 2 },
        x: 0,
        y: 0,
      },
    });
    const root = mwd.rootUI;
    const { edge } = root.spec.view;
    expect(edge.name).toBe("mustache_lr");
    expect(edge.color).toBe("red");
    expect(edge.width).toBe(2);

    mwd.setEdge({ name: "line" }, root);

    expect(edge.name).toBe("line");
    expect(edge.color).toBe("red");
    expect(edge.width).toBe(2);

    mwd.setEdge({ width: 4 }, root);

    expect(edge.name).toBe("line");
    expect(edge.color).toBe("red");
    expect(edge.width).toBe(4);

    mwd.setEdge({ color: "blue" }, root);
    expect(edge.name).toBe("line");
    expect(edge.color).toBe("blue");
    expect(edge.width).toBe(4);
  });
});
