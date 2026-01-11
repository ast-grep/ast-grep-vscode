import type { Subprocess } from 'nano-spawn'
import * as assert from 'node:assert'
import { detectDefaultBinaryAtStart, streamedPromise } from '../extension/common'
import { buildCommand } from '../extension/search'
import type { PatternQuery, SgSearch, YAMLConfig } from '../types'
import { getDocPath, testAndRetry } from './utils'

function collectResults(proc: Subprocess): Promise<SgSearch[]> {
  const results: SgSearch[] = []
  return streamedPromise<SgSearch>(proc, batch => {
    results.push(...batch)
  })
    .then(() => results)
    .catch(() => results)
}

suite('Search - Pattern Mode', () => {
  suiteSetup(async () => {
    await detectDefaultBinaryAtStart()
  })

  testAndRetry('finds simple pattern matches', async () => {
    const query: PatternQuery = {
      // Add spaces to test windows arg handling
      pattern: 'console.log( $$$ )',
      rewrite: '',
      strictness: 'smart',
      selector: '',
      lang: 'typescript',
      includeFile: getDocPath('test.ts'),
    }

    const proc = buildCommand(query)
    assert.ok(proc, 'buildCommand should return a process')

    const results = await collectResults(proc)

    assert.equal(results.length, 1)
    assert.equal(results[0].file, getDocPath('test.ts'))
    assert.ok(results[0].text.includes('console.log'))
    assert.equal(results[0].range.start.line, 2)
  })

  testAndRetry('finds complex structural pattern matches', async () => {
    const query: PatternQuery = {
      pattern: 'class $NAME { $$$BODY }',
      rewrite: '',
      strictness: 'smart',
      selector: '',
      lang: 'typescript',
      includeFile: getDocPath('test.ts'),
    }

    const proc = buildCommand(query)
    assert.ok(proc, 'buildCommand should return a process')

    const results = await collectResults(proc)

    assert.equal(results.length, 2)
    const matchedTexts = results.map(r => r.text)
    assert.ok(matchedTexts.some(t => t.includes('AstGrepTest')))
    assert.ok(matchedTexts.some(t => t.includes('AnotherCase')))
  })

  testAndRetry('returns empty results for non-matching pattern', async () => {
    const query: PatternQuery = {
      pattern: 'nonExistentFunction($$$)',
      rewrite: '',
      strictness: 'smart',
      selector: '',
      lang: 'typescript',
      includeFile: getDocPath('test.ts'),
    }

    const proc = buildCommand(query)
    assert.ok(proc, 'buildCommand should return a process')

    const results = await collectResults(proc)

    assert.equal(results.length, 0)
  })

  testAndRetry('pattern search with rewrite generates replacement', async () => {
    const query: PatternQuery = {
      pattern: 'console.log($ARG)',
      rewrite: 'logger.info($ARG)',
      strictness: 'smart',
      selector: '',
      lang: 'typescript',
      includeFile: getDocPath('test.ts'),
    }

    const proc = buildCommand(query)
    assert.ok(proc, 'buildCommand should return a process')

    const results = await collectResults(proc)

    assert.equal(results.length, 1)
    assert.ok(results[0].replacement, 'Should have replacement field')
    assert.ok(results[0].replacement?.includes('logger.info'))
  })

  test('returns undefined for empty pattern', () => {
    const query: PatternQuery = {
      pattern: '',
      rewrite: '',
      strictness: 'smart',
      selector: '',
      lang: 'typescript',
      includeFile: getDocPath('test.ts'),
    }

    const proc = buildCommand(query)

    assert.equal(proc, undefined)
  })
})

suite('Search - YAML Mode', () => {
  if (process.platform === 'win32') {
    // Skip due to windows do not handle newline in command line arg
    return
  }
  suiteSetup(async () => {
    await detectDefaultBinaryAtStart()
  })

  testAndRetry('finds matches using inline YAML rule', async () => {
    const yamlRule = `id: test-inline
language: TypeScript
rule:
  pattern: console.log($$$)`

    const config: YAMLConfig = {
      yaml: yamlRule,
      includeFile: getDocPath('test.ts'),
    }

    const proc = buildCommand(config)
    assert.ok(proc, 'buildCommand should return a process')

    const results = await collectResults(proc)

    assert.equal(results.length, 1)
    assert.ok(results[0].text.includes('console.log'))
  })

  testAndRetry('YAML search with complex rule', async () => {
    const yamlRule = `id: find-classes
language: TypeScript
rule:
  pattern: class $NAME { $$$BODY }`

    const config: YAMLConfig = {
      yaml: yamlRule,
      includeFile: getDocPath('test.ts'),
    }

    const proc = buildCommand(config)
    assert.ok(proc, 'buildCommand should return a process')

    const results = await collectResults(proc)

    assert.equal(results.length, 2)
  })

  testAndRetry('YAML search returns empty for non-matching rule', async () => {
    const yamlRule = `id: no-match
language: TypeScript
rule:
  pattern: thisDoesNotExist($$$)`

    const config: YAMLConfig = {
      yaml: yamlRule,
      includeFile: getDocPath('test.ts'),
    }

    const proc = buildCommand(config)
    assert.ok(proc, 'buildCommand should return a process')

    const results = await collectResults(proc)

    assert.equal(results.length, 0)
  })

  test('returns undefined for empty YAML', () => {
    const config: YAMLConfig = {
      yaml: '',
      includeFile: getDocPath('test.ts'),
    }

    const proc = buildCommand(config)

    assert.equal(proc, undefined)
  })
})

suite('Search - Error Cases', () => {
  suiteSetup(async () => {
    await detectDefaultBinaryAtStart()
  })

  testAndRetry('handles invalid pattern syntax gracefully', async () => {
    const query: PatternQuery = {
      pattern: 'class { invalid syntax',
      rewrite: '',
      strictness: 'smart',
      selector: '',
      lang: 'typescript',
      includeFile: getDocPath('test.ts'),
    }

    const proc = buildCommand(query)
    assert.ok(proc, 'buildCommand should return a process')

    const results = await collectResults(proc)
    assert.equal(results.length, 0)
  })

  testAndRetry('handles non-existent file path', async () => {
    const query: PatternQuery = {
      pattern: 'console.log($$$)',
      rewrite: '',
      strictness: 'smart',
      selector: '',
      lang: 'typescript',
      includeFile: '/non/existent/path/file.ts',
    }

    const proc = buildCommand(query)
    assert.ok(proc, 'buildCommand should return a process')

    const results = await collectResults(proc)
    assert.equal(results.length, 0)
  })
})
