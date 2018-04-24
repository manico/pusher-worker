const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/worker.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'worker.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env']
          }
        }
      }
    ]
  }
};
