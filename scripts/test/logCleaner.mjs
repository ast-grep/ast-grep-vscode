/**
 * This file allows us to override stderr and stdout to remove unwanted logs from the console.
 * In particular, third party libraries that we use print logs that are not useful for us.
 */

/* These will be treated as Regular Expressions and any time one matches output in stdout or stderr
that message will be ignored instead of printed */
const excludeThese = [
  /* These are logged because our vscode extension development host has auto updates disabled */
  `update#setState disabled`,
  `update#ctor - updates are disabled by the environment`,
  /* CoreText bug from Electron https://github.com/electron/fiddle/issues/586 */
  `CoreText note: Client requested name ".NewYork-Regular", it will get Times-Roman rather than the intended font.`,
  `CoreText note: Set a breakpoint on CTFontLogSystemFontNameRequest to debug.`,
  /* Certificate parsing bug from Electron / Chromium */
  /ERROR:trust_store_mac\.cc\(\d+\)\] Error parsing certificate:\r?\nERROR: Failed parsing extensions/
]

let patterns = excludeThese.map(p => new RegExp(p))
let originalStdoutWrite
let originalStderrWrite

export function overrideStdoutAndStderr() {
  restoreStdoutAndStderr()
  originalStdoutWrite = process.stdout.write.bind(process.stdout)
  originalStderrWrite = process.stderr.write.bind(process.stderr)

  process.stdout.write = (chunk, encoding, callback) => {
    if (patterns.some(p => p.test(chunk))) {
      return false
    }

    return originalStdoutWrite(chunk, encoding, callback)
  }

  process.stderr.write = (chunk, encoding, callback) => {
    if (patterns.some(p => p.test(chunk))) {
      return false
    }

    return originalStderrWrite(chunk, encoding, callback)
  }
}

export function restoreStdoutAndStderr() {
  if (originalStdoutWrite) {
    process.stdout.write = originalStdoutWrite
  }
  if (originalStderrWrite) {
    process.stderr.write = originalStderrWrite
  }
  originalStderrWrite = null
  originalStdoutWrite = null
}
