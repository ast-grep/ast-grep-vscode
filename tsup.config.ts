import { defineConfig } from 'tsup'

const isDev = process.env.NODE_ENV !== 'production'

export default defineConfig({
  entry: ['src/extension.ts', 'src/view.ts', 'src/webview/index.tsx'],
  outDir: 'out',
  sourcemap: isDev ? 'inline' : false,
  clean: !isDev,
  bundle: true,
  dts: false,
  external: ['vscode'],
  env: {
    NODE_ENV: process.env.NODE_ENV ?? 'production'
  }
})
