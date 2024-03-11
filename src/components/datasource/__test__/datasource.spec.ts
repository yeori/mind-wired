import { describe, test, expect } from "vitest";
import { DataSourceFactory } from "..";
import { Country } from "./imports";

describe("datasource init", () => {
  const fac = new DataSourceFactory();
  test("create datasource", () => {
    const countries = ["Canada", "France", "Korea"].map(
      (name) => new Country(name)
    );

    const ds = fac.createDataSource<Country, string>(
      "country",
      (item: Country) => item.name
    );

    ds.setData(countries);

    const countryDs = fac.getDataSource<Country>("country");
    expect(ds === countryDs).toBeTruthy();
  });
});
