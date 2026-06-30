import { Lexicons } from '@atproto/lexicon'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { test, expect } from 'vitest'

function allLexiconPaths(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? allLexiconPaths(join(dir, e.name))
    : e.name.endsWith('.json') ? [join(dir, e.name)] : [])
}

test('every blue.chum.* lexicon validates against the meta-schema', () => {
  const lex = new Lexicons()
  const paths = allLexiconPaths('lexicons/blue/chum')
  expect(paths.length).toBeGreaterThanOrEqual(7)
  for (const p of paths) {
    expect(() => lex.add(JSON.parse(readFileSync(p, 'utf8'))), p).not.toThrow()
  }
})

test('auth lexicons are present and resolvable', () => {
  const lex = new Lexicons()
  for (const p of allLexiconPaths('lexicons/blue/chum')) lex.add(JSON.parse(readFileSync(p, 'utf8')))
  for (const nsid of ['blue.chum.auth.capability','blue.chum.auth.revocation','blue.chum.auth.listCapabilities'])
    expect(lex.getDef(nsid), nsid).toBeDefined()
  expect(allLexiconPaths('lexicons/blue/chum').length).toBe(10)
})
