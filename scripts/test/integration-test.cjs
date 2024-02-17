const path = require('node:path')
const Mocha = require('mocha')
const glob = require('glob').glob

async function run() {
  await import('tsx')
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 100000,
    slow: 1000
  })

  /**
   * Add each test file in src/test/**.test.ts to the test suite
   * Tests are run in series and should be designed to not have side effects
   * But side effects are possible and therefore test order could matter
   * So you could play with sort order on the tests to investigate
   */
  const testsRoot = path.join(__dirname, '../../src/test')
  let files = await glob('**.test.ts', { cwd: testsRoot })
  // Add files to the test suite
  files.sort((a, b) => {
    return a.localeCompare(b)
  })
  files.forEach(f => {
    mocha.addFile(path.resolve(testsRoot, f))
  })

  return new Promise((resolve, reject) => {
    // Run the mocha test
    mocha.run(failures => {
      if (failures > 0) {
        reject(new Error(`${failures} tests failed.`))
      } else {
        resolve()
      }
    })
  })
}

module.exports.run = run
