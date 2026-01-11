import * as assert from 'node:assert'
import { splitByHighLightToken } from '../extension/search'
import type { SgSearch } from '../types'

suite('splitByHighLightToken', () => {
  test('basic single-line match', () => {
    const input: SgSearch = {
      text: "console.log('Hello')",
      range: {
        byteOffset: { start: 0, end: 20 },
        start: { line: 0, column: 4 },
        end: { line: 0, column: 24 },
      },
      file: 'test.ts',
      lines: "    console.log('Hello')",
      language: 'TypeScript',
    }

    const result = splitByHighLightToken(input)

    assert.equal(result.file, 'test.ts')
    assert.equal(result.language, 'TypeScript')
    assert.equal(result.displayLine, "console.log('Hello')")
    assert.equal(result.startIdx, 0)
    assert.equal(result.endIdx, 20)
    assert.equal(result.lineSpan, 0)
  })

  test('multiline match truncates to first line', () => {
    const input: SgSearch = {
      text: 'class Foo {\n  bar() {}\n}',
      range: {
        byteOffset: { start: 0, end: 25 },
        start: { line: 0, column: 0 },
        end: { line: 2, column: 1 },
      },
      file: 'test.ts',
      lines: 'class Foo {\n  bar() {}\n}',
      language: 'TypeScript',
    }

    const result = splitByHighLightToken(input)

    assert.equal(result.displayLine, 'class Foo {')
    assert.equal(result.endIdx, 11)
    assert.equal(result.lineSpan, 2)
  })

  test('strips leading whitespace and adjusts indices', () => {
    const input: SgSearch = {
      text: 'foo()',
      range: {
        byteOffset: { start: 8, end: 13 },
        start: { line: 0, column: 8 },
        end: { line: 0, column: 13 },
      },
      file: 'test.ts',
      lines: '        foo()',
      language: 'TypeScript',
    }

    const result = splitByHighLightToken(input)

    assert.equal(result.displayLine, 'foo()')
    assert.equal(result.startIdx, 0)
    assert.equal(result.endIdx, 5)
  })

  test('truncates long lines with match far from start (PRE_CTX)', () => {
    const prefix = 'x'.repeat(50)
    const match = 'TARGET'
    const suffix = 'y'.repeat(200)
    const fullLine = prefix + match + suffix

    const input: SgSearch = {
      text: match,
      range: {
        byteOffset: { start: 50, end: 56 },
        start: { line: 0, column: 50 },
        end: { line: 0, column: 56 },
      },
      file: 'test.ts',
      lines: fullLine,
      language: 'TypeScript',
    }

    const result = splitByHighLightToken(input)

    assert.ok(result.displayLine.startsWith('...'), 'Should start with ellipsis')
    assert.equal(result.startIdx, 33)
  })

  test('truncates long lines at end (POST_CTX)', () => {
    const match = 'TARGET'
    const suffix = 'z'.repeat(200)
    const fullLine = match + suffix

    const input: SgSearch = {
      text: match,
      range: {
        byteOffset: { start: 0, end: 6 },
        start: { line: 0, column: 0 },
        end: { line: 0, column: 6 },
      },
      file: 'test.ts',
      lines: fullLine,
      language: 'TypeScript',
    }

    const result = splitByHighLightToken(input)

    assert.ok(result.displayLine.endsWith('...'), 'Should end with ellipsis')
    assert.equal(result.displayLine.length, 6 + 100 + 3)
  })

  test('preserves replacement field when present', () => {
    const input: SgSearch = {
      text: "console.log('test')",
      range: {
        byteOffset: { start: 0, end: 19 },
        start: { line: 0, column: 0 },
        end: { line: 0, column: 19 },
      },
      file: 'test.ts',
      lines: "console.log('test')",
      language: 'TypeScript',
      replacement: "logger.info('test')",
    }

    const result = splitByHighLightToken(input)

    assert.equal(result.replacement, "logger.info('test')")
  })

  test('omits replacement field when not present', () => {
    const input: SgSearch = {
      text: 'foo()',
      range: {
        byteOffset: { start: 0, end: 5 },
        start: { line: 0, column: 0 },
        end: { line: 0, column: 5 },
      },
      file: 'test.ts',
      lines: 'foo()',
      language: 'TypeScript',
    }

    const result = splitByHighLightToken(input)

    assert.equal(result.replacement, undefined)
  })

  test('handles match with CRLF line endings', () => {
    const input: SgSearch = {
      text: 'class Foo {\r\n}',
      range: {
        byteOffset: { start: 0, end: 14 },
        start: { line: 0, column: 0 },
        end: { line: 1, column: 1 },
      },
      file: 'test.ts',
      lines: 'class Foo {\r\n}',
      language: 'TypeScript',
    }

    const result = splitByHighLightToken(input)

    assert.equal(result.displayLine, 'class Foo {')
  })

  test('preserves range information', () => {
    const input: SgSearch = {
      text: 'test',
      range: {
        byteOffset: { start: 10, end: 14 },
        start: { line: 5, column: 2 },
        end: { line: 5, column: 6 },
      },
      file: 'example.ts',
      lines: '  test',
      language: 'TypeScript',
    }

    const result = splitByHighLightToken(input)

    assert.deepEqual(result.range, input.range)
  })
})
