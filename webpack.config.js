const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    creatorApp: "./src/creatorApp.jsx",
    GitCreatorApp: "./src/GitCreatorApp.jsx",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      chunks: ["creatorApp"],
    }),
    new HtmlWebpackPlugin({
      template: "./public/GitCreator.html",
      filename: "GitCreator.html",
      chunks: ["GitCreatorApp"],
    }),
  ],
  devServer: {
    static: path.join(__dirname, "dist"),
    port: 3000,
  },
};
