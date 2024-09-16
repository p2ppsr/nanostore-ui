/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    open: true,
    port: 8092, // you can change the port
    client: {
      overlay: true // Show application errors
    },
    historyApiFallback: {
      index: 'index.html'
    },
    static: './public'
  },
  devtool: 'inline-source-map'
})
