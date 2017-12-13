const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'node',
  entry: path.resolve(__dirname, './app.js'),
  output: {
    filename: 'server.bundle.js',
    path: path.resolve(__dirname, '../../build')
  },
  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' })
  ]
};
