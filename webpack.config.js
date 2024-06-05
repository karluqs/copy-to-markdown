const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const config = {
  entry: './src/copy-to-markdown.js',
  output: {
    path: path.resolve(__dirname, 'extension'),
    filename: 'content.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
	plugins: [
    new webpack.ProvidePlugin(
      {
        process: 'process/browser',
      }
   ),
	],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: { ascii_only: true },
        },
      }),
    ],
  },
};

module.exports = config;