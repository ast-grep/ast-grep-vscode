import * as path from 'path'
import Mocha from 'mocha'
import glob from 'glob'

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  })
  mocha.timeout(100000)

  const testsRoot = __dirname

  return new Promise(async (resolve, reject) => {
    try {
      let files = await glob('**.test.js', { cwd: testsRoot })
      // Add files to the test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)))

      // Run the mocha test
      mocha.run(failures => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`))
        } else {
          resolve()
        }
      })
    } catch (err) {
      console.error(err)
      reject(err)
    }
  })
}
