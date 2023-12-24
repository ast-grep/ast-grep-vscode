const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const devConfig = require('./webpack.config')

function start() {
  const compiler = webpack(devConfig)
  const devServerOptions = {
    hot: false,
    client: false,
    liveReload: false,
    host: 'localhost',
    port: 3000,
    open: false,
    devMiddleware: {
      stats: 'minimal'
    },
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
  const server = new WebpackDevServer(devServerOptions, compiler)
  server.start()
}

start()
