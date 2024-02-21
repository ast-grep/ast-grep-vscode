import { runTests } from '@vscode/test-electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../')

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './integration-test.cjs')

    const fixtureDirectoryPath = path.resolve(__dirname, '../../fixture')
    const initialFilePath = path.resolve(fixtureDirectoryPath, 'test.ts')

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        '--disable-extensions',
        fixtureDirectoryPath,
        initialFilePath,
      ],
    })
  } catch (err) {
    console.error('Failed to run tests', err)
    process.exit(1)
  }
}

main()
