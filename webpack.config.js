const path = require('path');

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    main: "./src/export.ts",
  },
  output: {
    path: path.resolve(__dirname, './lib'),
    filename: "manikin-bundle.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
    ]
  }
};
