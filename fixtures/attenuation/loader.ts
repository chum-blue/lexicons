import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export interface ScopeEntry {
  bucket: string
  keyPrefix?: string
  can: string[]
}

export interface CapabilityRecord {
  iss: string
  aud: string
  scope: ScopeEntry[]
  expiresAt: string
  nonce: string
  createdAt: string
}

export interface AttenuationCase {
  parent: CapabilityRecord
  child: CapabilityRecord
  note: string
  category: 'valid' | 'invalid'
  filename: string
}

export function loadAttenuationCases(): AttenuationCase[] {
  const cases: AttenuationCase[] = []
  for (const cat of ['valid', 'invalid'] as const) {
    const dir = join(__dirname, cat)
    const entries = readdirSync(dir)
    for (const name of entries) {
      if (extname(name) !== '.json') continue
      const raw = readFileSync(join(dir, name), 'utf-8')
      const parsed = JSON.parse(raw) as { parent: CapabilityRecord; child: CapabilityRecord; note: string }
      cases.push({ ...parsed, category: cat, filename: name })
    }
  }
  return cases
}
