import { describe, it, expect } from 'vitest'
import { loadAttenuationCases } from './loader.mjs'

describe('attenuation fixture corpus', () => {
  it('loads ≥10 cases with valid + invalid', () => {
    const cases = loadAttenuationCases()
    expect(cases.length).toBeGreaterThanOrEqual(10)

    const valid = cases.filter(c => c.category === 'valid')
    const invalid = cases.filter(c => c.category === 'invalid')
    expect(valid.length).toBeGreaterThan(0)
    expect(invalid.length).toBeGreaterThan(0)
  })

  it('every case has well-formed parent and child', () => {
    const cases = loadAttenuationCases()
    for (const c of cases) {
      for (const cap of [c.parent, c.child]) {
        expect(cap.iss, `${c.category}/${c.filename} iss`).toBeTruthy()
        expect(cap.aud, `${c.category}/${c.filename} aud`).toBeTruthy()
        expect(cap.scope, `${c.category}/${c.filename} scope`).toBeInstanceOf(Array)
        expect(cap.scope.length, `${c.category}/${c.filename} scope length`).toBeGreaterThan(0)
        expect(cap.expiresAt, `${c.category}/${c.filename} expiresAt`).toBeTruthy()
        expect(cap.nonce, `${c.category}/${c.filename} nonce`).toBeTruthy()
        expect(cap.createdAt, `${c.category}/${c.filename} createdAt`).toBeTruthy()
      }
    }
  })
})
