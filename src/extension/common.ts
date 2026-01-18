import spawn, { type Subprocess } from 'nano-spawn'
import { Unport } from 'unport'
import { workspace } from 'vscode'
import type { ParentPort } from '../types'

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
  // `ast-grep.exe` should check first,
  // otherwise, it will be resolved to `ast-grep` in shell mode
  for (const cmd of ['ast-grep.exe', 'ast-grep.cmd', 'ast-grep']) {
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
  const uris = workspace.workspaceFolders?.map(i => i.uri?.fsPath) ?? []
  try {
    await spawn(
      command,
      ['-h'],
      {
        // for windows
        cwd: uris[0],
      },
    )
  } catch (_e) {
    return false
  }
  return true
}

export const parentPort: ParentPort = new Unport()

export async function streamedPromise<T>(
  proc: Subprocess,
  handler: (r: T[]) => void,
): Promise<number> {
  // don't concatenate a single string/buffer
  // only maintain the last trailing line
  let trailingLine = ''

  // Get the underlying Node.js child process
  const childProcess = await proc.nodeChildProcess

  // stream parsing JSON
  childProcess.stdout?.on('data', (data: string) => {
    // collect results in this batch
    const result: T[] = []
    const lines = (trailingLine + data).split(/\r?\n/)
    trailingLine = ''
    for (let i = 0; i < lines.length; i++) {
      try {
        result.push(JSON.parse(lines[i]))
      } catch (_e) {
        // only store the last non-json line
        if (i === lines.length - 1) {
          trailingLine = lines[i]
        }
      }
    }
    handler(result)
  })

  return new Promise((resolve, reject) =>
    childProcess.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
      // exit without signal, search ends correctly
      // code === 1 means no result found for ast-grep
      if (!signal && (code === 0 || code === 1)) {
        resolve(code)
      } else {
        reject([code, signal])
      }
    })
  )
}
