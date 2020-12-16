const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/data-transform.js',
  plugins: [
    new CleanWebpackPlugin()
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'data-transform.js',
    library: 'data-transform',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
};