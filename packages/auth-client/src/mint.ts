import { randomBytes } from 'node:crypto'
import type { CapabilityRecord } from './types.js'
import type { RecordStore, Signer } from './types.js'

export interface MintOptions {
  aud: string
  scope: CapabilityRecord['scope']
  expiresAt: string
  notBefore?: string
  /** Parent capability CID string when minting an attenuation. */
  prev?: string
}

export interface MintContext {
  iss: string
  store: RecordStore
  signer: Signer
}

/**
 * Build, sign (detached), and store a capability record.
 * Returns { uri, cid } from the store.
 */
export async function mintCapability(
  opts: MintOptions,
  ctx: MintContext,
): Promise<{ uri: string; cid: string }> {
  const { aud, scope, expiresAt, notBefore, prev } = opts
  const { iss, store, signer } = ctx

  const nonce = randomBytes(16).toString('hex')
  const createdAt = new Date().toISOString()

  // Build the record (no signature field — detached signing per §2.4)
  const record: CapabilityRecord = {
    $type: 'blue.chum.auth.capability',
    iss,
    aud,
    scope,
    expiresAt,
    nonce,
    createdAt,
    ...(notBefore !== undefined ? { notBefore } : {}),
    // prev is typed as CID in the generated type; we store the string and cast.
    // The store is responsible for any CID encoding.
    ...(prev !== undefined ? { prev: prev as unknown as import('multiformats/cid').CID } : {}),
  }

  // Detached signature: sign canonical bytes; the sig is for the store/transport.
  // The record itself carries no sig field (same convention as blue.chum.pointer.record).
  const bytes = new TextEncoder().encode(JSON.stringify(record))
  await signer(bytes)

  return store.putCapability(record)
}
