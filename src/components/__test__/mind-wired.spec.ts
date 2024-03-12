import { describe, test, expect, beforeEach } from "vitest";
import Configuration from "../config";
import { MindWired } from "../mind-wired";
import { UserDefinedRenderer } from "../node";
import mockApi, { Country } from "../../../test/mock-api";

let mwd: MindWired;
beforeEach(() => {
  const config = Configuration.parse({ el: "#app", ui: { width: "400px" } });
  mwd = new MindWired(config);
});
describe("init", () => {
  test("init", () => {
    expect(mwd).toBeDefined();
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

    mwd.nodes({
      model: {
        type: "text",
        text: "World\nNations",
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
              // render: "country-renderer",
            },
          },
          view: {
            x: 120,
            y: -50,
          },
        },
      ],
    });
  });
});
