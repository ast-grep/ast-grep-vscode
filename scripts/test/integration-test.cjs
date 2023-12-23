const path = require('node:path')
const Mocha = require('mocha')
const glob = require('glob')

async function run() {
  await import('tsx')
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  })
  mocha.timeout(100000)

  const testsRoot = path.join(__dirname, '../../src/test')

  try {
    let files = await glob('**.test.ts', { cwd: testsRoot })
    // Add files to the test suite
    files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)))

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
  } catch (err) {
    console.error(err)
  }
}

module.exports.run = run
