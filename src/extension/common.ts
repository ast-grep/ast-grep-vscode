import type { ParentPort } from '../types'
import { Unport } from 'unport'
import { workspace } from 'vscode'
import { type ChildProcessWithoutNullStreams } from 'node:child_process'

export function resolveBinary() {
  return workspace.getConfiguration('astGrep').get('serverPath', 'ast-grep')
}

export const parentPort: ParentPort = new Unport()

export function streamedPromise<T>(
  proc: ChildProcessWithoutNullStreams,
  handler: (r: T[]) => void,
): Promise<number> {
  // don't concatenate a single string/buffer
  // only maintain the last trailing line
  let trailingLine = ''
  // stream parsing JSON
  proc.stdout.on('data', (data: string) => {
    // collect results in this batch
    const result: T[] = []
    const lines = (trailingLine + data).split(/\r?\n/)
    trailingLine = ''
    for (let i = 0; i < lines.length; i++) {
      try {
        result.push(JSON.parse(lines[i]))
      } catch (e) {
        // only store the last non-json line
        if (i === lines.length - 1) {
          trailingLine = lines[i]
        }
      }
    }
    handler(result)
  })
  return new Promise((resolve, reject) =>
    proc.on('exit', (code, signal) => {
      // exit without signal, search ends correctly
      // TODO: is it correct now?
      if (!signal && code === 0) {
        resolve(code)
      } else {
        reject([code, signal])
      }
    }),
  )
}
