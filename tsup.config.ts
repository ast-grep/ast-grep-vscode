import { sync } from 'glob'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/extension.ts',
    'src/webview/index.tsx',
    ...(process.env.NODE_TEST ? sync('./src/test/**') : [])
  ],
  outDir: 'out',
  sourcemap: true,
  clean: true,
  bundle: true,
  external: ['vscode', 'vscode-languageclient'],
  env: {
    NODE_ENV: 'production'
  }
})
