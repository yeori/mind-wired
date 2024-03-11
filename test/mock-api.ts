export class Country {
  code: string;
  name: string;
}

export default {
  loadCountries: () =>
    new Promise<Country[]>((resolve) => {
      resolve([
        { code: "BRA", name: "Brazil" },
        { code: "EGY", name: "Egypt" },
        { code: "KOR", name: "South Korea" },
        { code: "ESP", name: "Spain" },
      ] as Country[]);
    }),
};
