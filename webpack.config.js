module.exports = {
  entry: './index.js',
  output: {
    filename: './bundle/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js/,
        loader: 'babel'
      },
      {
        test: /\.json/,
        loader: 'json'
      }
    ]
  }
}
