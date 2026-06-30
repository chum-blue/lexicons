import { describe, it, expect } from 'vitest'
import { isAttenuation } from '../src/attenuation-rules.js'
import type { CapabilityRecord } from '../src/types.js'

// Convenience factory for test capability records
function cap(
  iss: string,
  aud: string,
  scope: CapabilityRecord['scope'],
  expiresAt: string,
): Pick<CapabilityRecord, 'iss' | 'aud' | 'scope' | 'expiresAt'> {
  return { iss, aud, scope, expiresAt }
}

const ALICE = 'did:plc:alice'
const BOB = 'did:plc:bob'
const CAROL = 'did:plc:carol'

const EXPIRY_FAR = '2030-01-01T00:00:00Z'
const EXPIRY_NEAR = '2028-01-01T00:00:00Z'

// The root parent: alice→bob, bucket "photos", prefix "vacation/", can: [read,write]
const parent = cap(ALICE, BOB, [
  { bucket: 'photos', keyPrefix: 'vacation/', can: ['read', 'write'] },
], EXPIRY_FAR)

describe('isAttenuation — §4 invariants', () => {
  it('valid: identical scope, same expiry, correct chain', () => {
    const child = cap(BOB, CAROL, [
      { bucket: 'photos', keyPrefix: 'vacation/', can: ['read', 'write'] },
    ], EXPIRY_FAR)
    expect(isAttenuation(parent, child)).toBe(true)
  })

  it('valid: narrowed can (read only), same prefix', () => {
    const child = cap(BOB, CAROL, [
      { bucket: 'photos', keyPrefix: 'vacation/', can: ['read'] },
    ], EXPIRY_FAR)
    expect(isAttenuation(parent, child)).toBe(true)
  })

  it('valid: narrowed keyPrefix (deeper path)', () => {
    const child = cap(BOB, CAROL, [
      { bucket: 'photos', keyPrefix: 'vacation/2024/', can: ['read'] },
    ], EXPIRY_FAR)
    expect(isAttenuation(parent, child)).toBe(true)
  })

  it('valid: shorter expiry', () => {
    const child = cap(BOB, CAROL, [
      { bucket: 'photos', keyPrefix: 'vacation/', can: ['read'] },
    ], EXPIRY_NEAR)
    expect(isAttenuation(parent, child)).toBe(true)
  })

  it('valid: multiple child scope entries, all covered', () => {
    const wideParent = cap(ALICE, BOB, [
      { bucket: 'photos', keyPrefix: 'vacation/', can: ['read', 'write'] },
      { bucket: 'docs', can: ['read'] },
    ], EXPIRY_FAR)
    const child = cap(BOB, CAROL, [
      { bucket: 'photos', keyPrefix: 'vacation/2024/', can: ['read'] },
      { bucket: 'docs', can: ['read'] },
    ], EXPIRY_NEAR)
    expect(isAttenuation(wideParent, child)).toBe(true)
  })

  // ── FAILING CASES ──────────────────────────────────────────────────────────

  it('false: widened bucket (new bucket not in parent)', () => {
    const child = cap(BOB, CAROL, [
      { bucket: 'secrets', can: ['read'] },
    ], EXPIRY_FAR)
    expect(isAttenuation(parent, child)).toBe(false)
  })

  it('false: added ability (delete not in parent can)', () => {
    const child = cap(BOB, CAROL, [
      { bucket: 'photos', keyPrefix: 'vacation/', can: ['read', 'write', 'delete'] },
    ], EXPIRY_FAR)
    expect(isAttenuation(parent, child)).toBe(false)
  })

  it('false: longer expiry than parent', () => {
    const child = cap(BOB, CAROL, [
      { bucket: 'photos', keyPrefix: 'vacation/', can: ['read'] },
    ], '2035-01-01T00:00:00Z')
    expect(isAttenuation(parent, child)).toBe(false)
  })

  it('false: broken chain continuity (child.iss !== parent.aud)', () => {
    // Child claims to be issued by CAROL, but parent.aud is BOB
    const child = cap(CAROL, 'did:plc:dave', [
      { bucket: 'photos', keyPrefix: 'vacation/', can: ['read'] },
    ], EXPIRY_FAR)
    expect(isAttenuation(parent, child)).toBe(false)
  })

  it('false: widened keyPrefix (shallower than parent — not a startsWith match)', () => {
    // Parent restricts to 'vacation/', child tries to access root '' (whole bucket)
    const child = cap(BOB, CAROL, [
      { bucket: 'photos', keyPrefix: '', can: ['read'] },
    ], EXPIRY_FAR)
    expect(isAttenuation(parent, child)).toBe(false)
  })

  it('false: keyPrefix orthogonal (different subtree)', () => {
    // Parent has 'vacation/', child tries 'work/' — not a startsWith match
    const child = cap(BOB, CAROL, [
      { bucket: 'photos', keyPrefix: 'work/', can: ['read'] },
    ], EXPIRY_FAR)
    expect(isAttenuation(parent, child)).toBe(false)
  })

  it('false: one child entry covered, one not', () => {
    const child = cap(BOB, CAROL, [
      { bucket: 'photos', keyPrefix: 'vacation/', can: ['read'] }, // OK
      { bucket: 'secrets', can: ['read'] },                        // NOT in parent
    ], EXPIRY_FAR)
    expect(isAttenuation(parent, child)).toBe(false)
  })
})
