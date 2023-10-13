import { sync } from 'glob'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/extension.ts',
    'src/webview/index.tsx',
    ...(process.env.NODE_TEST ? sync('./src/test/**') : [])
  ],
  outDir: 'out',
  sourcemap: 'inline',
  clean: false,
  bundle: true,
  dts: false,
  external: ['vscode', 'vscode-languageclient'],
  env: {
    NODE_ENV: 'production'
  }
})
