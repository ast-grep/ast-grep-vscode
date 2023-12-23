import { defineConfig } from 'tsup'

const isDev = process.env.NODE_ENV !== 'production'

export default defineConfig({
  entry: ['src/extension.ts', ...(isDev ? [] : ['src/webview/index.tsx'])],
  outDir: 'out',
  sourcemap: 'inline',
  clean: false,
  bundle: true,
  dts: false,
  external: ['vscode'],
  env: {
    NODE_ENV: process.env.NODE_ENV ?? 'production'
  }
})
