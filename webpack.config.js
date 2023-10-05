const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // Import the plugin

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, // Replace 'style-loader' with MiniCssExtractPlugin.loader
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new MiniCssExtractPlugin({ // Add MiniCssExtractPlugin configuration
      filename: 'styles.css',
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 8080,
    hot: true,
  },
};
