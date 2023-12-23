const { resolve } = require('path')
const { HotModuleReplacementPlugin } = require('webpack')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const devServerClientOptions = {
  hot: true,
  // !: 指定构造 WebSocket 的协议是 ws
  protocol: 'ws',
  hostname: 'localhost',
  port: 3000,
  path: 'ws'
}
const devServerClientQuery = Object.entries(devServerClientOptions)
  .map(([k, v]) => `${k}=${v}`)
  .join('&')

const webpackHotDevServer = resolve(__dirname, './webpack-hot-dev-server.js')
const devEntries = [
  webpackHotDevServer,
  `webpack-dev-server/client/index.js?${devServerClientQuery}`
]

/**@type {import('webpack').Configuration}*/
module.exports = {
  mode: 'development',
  entry: [...devEntries, resolve(__dirname, '../../src/webview/index.tsx')],
  output: {
    publicPath: 'http://localhost:3000/',
    path: resolve(__dirname, '../../out/webview/index.js'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs|cjs|ts|tsx|mts|cts)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'swc-loader',
        options: {
          jsc: {
            parser: {
              tsx: true,
              syntax: 'typescript',
              decorators: true
            },
            preserveAllComments: true,
            transform: {
              react: {
                development: true,
                refresh: true,
                runtime: 'automatic'
              }
            }
          },
          isModule: 'unknown',
          minify: false,
          sourceMaps: true,
          exclude: [],
          inlineSourcesContent: true
        }
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024
          }
        },
        generator: {
          filename: 'images/[hash]-[name][ext][query]'
        }
      }
    ]
  },
  devtool: 'eval-source-map',
  plugins: [new HotModuleReplacementPlugin(), new ReactRefreshWebpackPlugin()]
}
