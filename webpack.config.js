const webpack = require("webpack");
const path = require("path");
// 生成Html插件
const HtmlWebpackPlugin = require("html-webpack-plugin");

// webpack 配置
var config = {
  mode: "development", // production development
  // 项目的入口文件，webpack会从这个文件开始读取整个项目的依赖模块
  // entry: ["./src/index.js"],
  // 设置实时更新
  entry: [
    "webpack/hot/dev-server",
    "webpack-dev-server/client?http://localhost:3000",
    "./src/App.js",
  ], // 入口文件
  // 打包输出文件
  output: {
    path: path.resolve(__dirname, "dist"), //自定义打包后的文件路径
    filename: "bundle.js", //自定义打包后的文件名称
  },
  module: {
    rules: [
      {
        test: /\.css|less$/, // 匹配css/less文件
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "less-loader" },
        ],
      },
      {
        test: /\.js|jsx$/, // 匹配js文件
        exclude: /node_modules/, // 排除node_modules文件
        use: [{ loader: "babel-loader" }], // babel编译:es6语法
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Hello React",
      template: "./src/index.html", //源文件
    }),
  ],
  // 自动补全后缀名
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
};

module.exports = config;
