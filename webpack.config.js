const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: '[name].min.js'
  },
  devtool: 'source-map'
};
