module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    parser: "@babel/eslint-parser",
    sourceType: "module",
    ecmaVersion: 2020,
    allowImportExportEverywhere: true,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
  },
};
