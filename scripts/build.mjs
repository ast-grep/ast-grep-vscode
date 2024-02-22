import * as esbuild from 'esbuild'
import stylexPlugin from '@stylexjs/esbuild-plugin'

const isWatch = process.argv.includes('--watch')

const extension = {
  entryPoints: ['src/extension/index.ts'],
  bundle: true,
  external: ['vscode'],
  platform: 'node',
  outfile: 'out/extension.js',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
}

const webview = {
  entryPoints: ['src/webview/index.tsx'],
  bundle: true,
  outfile: 'out/webview/index.js',
  plugins: [
    stylexPlugin({
      useCSSLayers: true,
      generatedCSSFileName: 'out/webview/index.css',
      stylexImports: ['@stylexjs/stylex'],
    }),
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
}

console.log('Build start')
if (isWatch) {
  await Promise.all([
    esbuild.context(extension).then(c => c.watch()),
    esbuild.context(webview).then(c => c.watch()),
  ])
} else {
  await Promise.all([esbuild.build(extension), esbuild.build(webview)])
}
console.log('Build success')
