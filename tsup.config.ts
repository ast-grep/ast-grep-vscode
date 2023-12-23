import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/extension.ts', 'src/webview/index.tsx'],
  outDir: 'out',
  sourcemap: 'inline',
  clean: false,
  bundle: true,
  dts: false,
  external: ['vscode'],
  env: {
    NODE_ENV: 'production'
  }
})
