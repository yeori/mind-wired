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
      name: DEPLOYED_FILENAME,
      type: "umd",
    },
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
  },
};
