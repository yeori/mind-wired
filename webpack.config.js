const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const mode = process.env.NODE_ENV;
console.log("[MODE] ", mode);
module.exports = {
  mode,
  entry: {
    "mind-wired": ["./src/index.js"],
  },
  output: {
    path: path.join(__dirname, "/dist"),
    filename: `[name].js`,
    library: {
      name: "mindwired",
      type: "umd",
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: () => "[name].css",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.svg/,
        type: "asset/resource",
      },
      {
        test: /\.scss$/i,
        exclude: [/node_modules/],
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
