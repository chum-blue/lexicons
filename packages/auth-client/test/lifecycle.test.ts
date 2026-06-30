import { describe, it, expect, beforeEach } from 'vitest'
import { mintCapability } from '../src/mint.js'
import { attenuate } from '../src/attenuate.js'
import { revoke } from '../src/revoke.js'
import { listCapabilities } from '../src/list.js'
import { isAttenuation } from '../src/attenuation-rules.js'
import type { RecordStore, CapabilityRecord, RevocationRecord, CapabilityView, ListParams, ListResult } from '../src/types.js'

// ── In-memory RecordStore ────────────────────────────────────────────────────

class InMemoryStore implements RecordStore {
  private capabilities: Array<{ uri: string; cid: string; record: CapabilityRecord }> = []
  private revocations = new Set<string>() // CIDs that have been revoked
  private counter = 0

  private nextCid(): string {
    return `bafyCID${++this.counter}`
  }

  async putCapability(record: CapabilityRecord): Promise<{ uri: string; cid: string }> {
    const cid = this.nextCid()
    const uri = `at://${record.iss}/blue.chum.auth.capability/${cid}`
    this.capabilities.push({ uri, cid, record })
    return { uri, cid }
  }

  async putRevocation(record: RevocationRecord): Promise<{ uri: string; cid: string }> {
    const cid = this.nextCid()
    // Extract the capability CID from the record (cast since we stored as string)
    const capCid = record.capability as unknown as string
    this.revocations.add(capCid)
    return { uri: `at://revocation/${cid}`, cid }
  }

  async getCapability(cid: string): Promise<CapabilityRecord | undefined> {
    return this.capabilities.find((c) => c.cid === cid)?.record
  }

  async query(params: ListParams): Promise<ListResult> {
    const { did, role = 'audience' } = params
    const filtered = this.capabilities.filter(({ record }) =>
      role === 'issuer' ? record.iss === did : record.aud === did,
    )
    const capabilities: CapabilityView[] = filtered.map(({ uri, cid }) => ({
      uri,
      cid,
      revoked: this.revocations.has(cid),
      value: this.capabilities.find((c) => c.cid === cid)!.record,
    }))
    return { capabilities }
  }
}

// ── Fake signer ──────────────────────────────────────────────────────────────

const fakeSigner = async (_bytes: Uint8Array): Promise<Uint8Array> => {
  // Returns a fake signature; not cryptographically real
  return new Uint8Array([0xde, 0xad, 0xbe, 0xef])
}

// ── Tests ────────────────────────────────────────────────────────────────────

const ALICE = 'did:plc:alice'
const BOB = 'did:plc:bob'
const CAROL = 'did:plc:carol'
const EXPIRY = '2030-01-01T00:00:00Z'
const EXPIRY_SHORT = '2029-01-01T00:00:00Z'

describe('auth-client lifecycle', () => {
  let store: InMemoryStore

  beforeEach(() => {
    store = new InMemoryStore()
  })

  it('mintCapability: stores record and returns uri+cid', async () => {
    const ctx = { iss: ALICE, store, signer: fakeSigner }
    const result = await mintCapability(
      {
        aud: BOB,
        scope: [{ bucket: 'photos', keyPrefix: 'vacation/', can: ['read', 'write'] }],
        expiresAt: EXPIRY,
      },
      ctx,
    )
    expect(result.uri).toContain(ALICE)
    expect(result.cid).toBeTruthy()

    const stored = await store.getCapability(result.cid)
    expect(stored).toBeDefined()
    expect(stored!.iss).toBe(ALICE)
    expect(stored!.aud).toBe(BOB)
  })

  it('attenuate: checks isAttenuation before minting child', async () => {
    const aliceCtx = { iss: ALICE, store, signer: fakeSigner }
    const { cid: parentCid } = await mintCapability(
      {
        aud: BOB,
        scope: [{ bucket: 'photos', keyPrefix: 'vacation/', can: ['read', 'write'] }],
        expiresAt: EXPIRY,
      },
      aliceCtx,
    )

    // Bob attenuates down to carol with narrowed scope
    const bobCtx = { iss: BOB, store, signer: fakeSigner }
    const { cid: childCid } = await attenuate(
      parentCid,
      {
        aud: CAROL,
        scope: [{ bucket: 'photos', keyPrefix: 'vacation/2024/', can: ['read'] }],
        expiresAt: EXPIRY_SHORT,
      },
      bobCtx,
    )
    expect(childCid).toBeTruthy()

    const childRecord = await store.getCapability(childCid)
    expect(childRecord!.iss).toBe(BOB)
    expect(childRecord!.aud).toBe(CAROL)
    expect(childRecord!.prev).toBe(parentCid as unknown as any)
  })

  it('attenuate: throws when child would widen authority', async () => {
    const aliceCtx = { iss: ALICE, store, signer: fakeSigner }
    const { cid: parentCid } = await mintCapability(
      {
        aud: BOB,
        scope: [{ bucket: 'photos', keyPrefix: 'vacation/', can: ['read'] }],
        expiresAt: EXPIRY,
      },
      aliceCtx,
    )

    const bobCtx = { iss: BOB, store, signer: fakeSigner }
    await expect(
      attenuate(
        parentCid,
        {
          aud: CAROL,
          scope: [{ bucket: 'photos', keyPrefix: 'vacation/', can: ['read', 'write'] }], // 'write' not in parent
          expiresAt: EXPIRY,
        },
        bobCtx,
      ),
    ).rejects.toThrow('Attenuation check failed')
  })

  it('revoke: marks capability as revoked in listCapabilities', async () => {
    const ctx = { iss: ALICE, store, signer: fakeSigner }
    const { cid } = await mintCapability(
      {
        aud: BOB,
        scope: [{ bucket: 'photos', can: ['read'] }],
        expiresAt: EXPIRY,
      },
      ctx,
    )

    // Before revocation
    const before = await listCapabilities({ did: BOB, role: 'audience' }, store)
    expect(before.capabilities).toHaveLength(1)
    expect(before.capabilities[0].revoked).toBeFalsy()

    // Revoke
    await revoke(cid, { store, signer: fakeSigner }, 'test revocation')

    // After revocation
    const after = await listCapabilities({ did: BOB, role: 'audience' }, store)
    expect(after.capabilities).toHaveLength(1)
    expect(after.capabilities[0].revoked).toBe(true)
  })

  it('listCapabilities: filters by role=issuer', async () => {
    const aliceCtx = { iss: ALICE, store, signer: fakeSigner }
    await mintCapability(
      { aud: BOB, scope: [{ bucket: 'b', can: ['read'] }], expiresAt: EXPIRY },
      aliceCtx,
    )
    await mintCapability(
      { aud: CAROL, scope: [{ bucket: 'b', can: ['read'] }], expiresAt: EXPIRY },
      aliceCtx,
    )

    const issuerList = await listCapabilities({ did: ALICE, role: 'issuer' }, store)
    expect(issuerList.capabilities).toHaveLength(2)

    const carolList = await listCapabilities({ did: CAROL, role: 'audience' }, store)
    expect(carolList.capabilities).toHaveLength(1)
  })

  it('isAttenuation used inside attenuate (integration)', async () => {
    const aliceCtx = { iss: ALICE, store, signer: fakeSigner }
    const { cid: parentCid } = await mintCapability(
      {
        aud: BOB,
        scope: [{ bucket: 'docs', can: ['read', 'write'] }],
        expiresAt: EXPIRY,
      },
      aliceCtx,
    )
    const parent = await store.getCapability(parentCid)
    expect(parent).toBeDefined()

    // Manual check
    expect(
      isAttenuation(parent!, {
        iss: BOB,
        scope: [{ bucket: 'docs', can: ['read'] }],
        expiresAt: EXPIRY,
      }),
    ).toBe(true)
  })
})
