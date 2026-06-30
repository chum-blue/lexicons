/**
 * Smoke test: assert that generated TS bindings for blue.chum.auth.capability
 * compile and have the expected shape. Run AFTER `pnpm gen:ts`.
 */
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Main as CapabilityRecord, CapabilityScope } from '../gen/ts/types/blue/chum/auth/capability.js'
import * as BlueChumObjectHistory from '../gen/ts/types/blue/chum/object/history.js'

describe('ts-gen smoke', () => {
  it('Capability record type has required fields (shape check)', () => {
    const scope: CapabilityScope = {
      bucket: 'my-bucket',
      can: ['read', 'write'],
    }
    const capability: CapabilityRecord = {
      $type: 'blue.chum.auth.capability',
      iss: 'did:plc:issuer',
      aud: 'did:plc:audience',
      scope: [scope],
      expiresAt: '2030-01-01T00:00:00Z',
      nonce: 'abc123',
      createdAt: '2026-01-01T00:00:00Z',
    }
    expect(capability.iss).toBe('did:plc:issuer')
    expect(capability.aud).toBe('did:plc:audience')
    expect(capability.scope).toHaveLength(1)
    expect(capability.scope[0].bucket).toBe('my-bucket')
    expect(capability.nonce).toBe('abc123')
    // prev is optional — omitting it is fine
    expect(capability.prev).toBeUndefined()
  })

  it('HistoryEntry type has expected fields', () => {
    const entry: BlueChumObjectHistory.HistoryEntry = {
      cid: 'bafyreiabc',
      recordCid: 'bafyreidef',
      did: 'did:plc:testuser',
      timestamp: '2026-01-01T00:00:00Z',
    }
    expect(entry.cid).toBeTruthy()
    expect(entry.did).toBeTruthy()
    expect(entry.prev).toBeUndefined()
  })

  it('gen/ts emits all 10 lexicon type files', () => {
    const base = join(__dirname, '../gen/ts/types/blue/chum')
    const expected = [
      'auth/capability.ts',
      'auth/listCapabilities.ts',
      'auth/revocation.ts',
      'object/head.ts',
      'object/history.ts',
      'object/list.ts',
      'pointer/record.ts',
      'upload/abort.ts',
      'upload/complete.ts',
      'upload/create.ts',
    ]
    for (const rel of expected) {
      const full = join(base, rel)
      expect(existsSync(full), `missing: ${rel}`).toBe(true)
    }
  })
})
