const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

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
  plugins: [
    new MiniCssExtractPlugin({
      filename: "mind-wired.css",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.svg/,
        type: "asset/resource",
      },
      {
        test: /\.s[ac]ss$/i,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
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
