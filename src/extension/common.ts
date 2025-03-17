import type { ParentPort } from '../types'
import { Unport } from 'unport'
import { workspace } from 'vscode'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { execFile } from 'node:child_process'

let defaultBinary: string

export async function detectDefaultBinaryAtStart() {
  if (defaultBinary) {
    return
  }
  if (process.platform !== 'win32') {
    defaultBinary = 'ast-grep'
    return
  }
  // on windows, binary command is confusing like sh*t
  // different installation method and different shell will
  // resolve totally different binary
  // See:
  // https://zenn.dev/hd_nvim/articles/e49ef2c812ae8d#comment-0b861171ac40cb
  // https://github.com/ast-grep/ast-grep-vscode/issues/235
  // https://github.com/nodejs/node/issues/29532#issue-492569087
  for (const cmd of ['ast-grep', 'ast-grep.exe', 'ast-grep.cmd']) {
    if (await testBinaryExist(cmd)) {
      defaultBinary = cmd
      return
    }
  }
  // every possible command tried, fallback to ast-grep
  defaultBinary = 'ast-grep'
}

export function resolveBinary() {
  const config = workspace
    .getConfiguration('astGrep')
    .get('serverPath', '')
    .trim()
  if (!config) {
    return defaultBinary
  }
  return config
}

export async function testBinaryExist(command: string) {
  // windows user may input space in command
  const normalizedCommand =
    /\s/.test(command) && !command.endsWith('.exe') ? `"${command}"` : command
  const uris = workspace.workspaceFolders?.map(i => i.uri?.fsPath) ?? []
  return new Promise(r => {
    execFile(
      normalizedCommand,
      ['-h'],
      {
        // for windows
        shell: process.platform === 'win32' && !command.endsWith('.exe'),
        cwd: uris[0],
      },
      err => {
        r(!err)
      },
    )
  })
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
