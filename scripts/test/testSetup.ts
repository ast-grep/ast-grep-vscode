import { activate } from '../../tests/utils'
/**
 * This initialization runs once, before the rest of the tests.
 * It is used to open the test fixture folder and activate the extension.
 * We could add some asserts here to make sure the environment looks as expected.
 */

suite('Initializing', () => {
  test('Initialize', async () => {
    await activate()
  }).slow(3000) // This test is slow because it waits for the server to start. And it specifically waits for 2 seconds.
})
