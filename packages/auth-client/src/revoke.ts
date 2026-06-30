import type { RevocationRecord, RecordStore, Signer } from './types.js'

export interface RevokeContext {
  store: RecordStore
  signer: Signer
}

/**
 * Mint and publish a revocation record for `capabilityCid`.
 * Returns { uri, cid } of the new revocation record.
 */
export async function revoke(
  capabilityCid: string,
  ctx: RevokeContext,
  reason?: string,
): Promise<{ uri: string; cid: string }> {
  const createdAt = new Date().toISOString()

  const record: RevocationRecord = {
    $type: 'blue.chum.auth.revocation',
    // capability is typed as CID; store the string reference and cast.
    capability: capabilityCid as unknown as import('multiformats/cid').CID,
    createdAt,
    ...(reason !== undefined ? { reason } : {}),
  }

  // Placeholder signing input: JSON.stringify(record). NOT canonical DAG-CBOR — chumd verifies over
  // canonical DAG-CBOR (object.UnsignedBytes), so these signatures are not yet server-verifiable.
  // Canonical encoding lands in SP-4c (the OAuth mint flow).
  const bytes = new TextEncoder().encode(JSON.stringify(record))
  await ctx.signer(bytes)

  return ctx.store.putRevocation(record)
}
