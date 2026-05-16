const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    creatorApp: "./src/creatorApp.jsx",
    GitCreatorApp: "./src/GitCreatorApp.jsx",
    InitRepoApp: "./src/InitRepoApp.jsx",
    ListRemoteApp: "./src/ListRemoteApp.jsx",
    GitConfigApp: "./src/GitConfigApp.jsx",
    AddSubmoduleApp: "./src/AddSubmoduleApp.jsx",
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
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
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
    new HtmlWebpackPlugin({
      template: "./public/InitRepo.html",
      filename: "InitRepo.html",
      chunks: ["InitRepoApp"],
    }),
    new HtmlWebpackPlugin({
      template: "./public/ListRemote.html",
      filename: "ListRemote.html",
      chunks: ["ListRemoteApp"],
    }),
    new HtmlWebpackPlugin({
      template: "./public/GitConfig.html",
      filename: "GitConfig.html",
      chunks: ["GitConfigApp"],
    }),
    new HtmlWebpackPlugin({
      template: "./public/AddSubModule.html",
      filename: "AddSubModule.html",
      chunks: ["AddSubmoduleApp"],
    }),
  ],
  devServer: {
    static: path.join(__dirname, "dist"),
    port: 3000,
  },
};
