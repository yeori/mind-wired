const path = require("path");

const mode = process.env.NODE_ENV;
const DEPLOYED_FILENAME = "mind-wired";
console.log("[MODE] ", mode);
console.log("[DIR ] ", __dirname);
module.exports = {
  mode,
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, "/dist"),
    filename: `${DEPLOYED_FILENAME}.js`,
    library: {
      name: "mindwired",
      type: "umd",
    },
  },
  module: {
    rules: [
      {
        test: /\.svg/,
        type: "asset/resource",
      },
    ],
  },
  devtool: "source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    https: false,
    port: 8080,
    host: "0.0.0.0",
    allowedHosts: "all",
    hot: true,
  },
};
