import type { Main as CapabilityRecord, CapabilityScope } from '../../../gen/ts/types/blue/chum/auth/capability.js'
import type { Main as RevocationRecord } from '../../../gen/ts/types/blue/chum/auth/revocation.js'
import type { CapabilityView } from '../../../gen/ts/types/blue/chum/auth/listCapabilities.js'

export type { CapabilityRecord, RevocationRecord, CapabilityView, CapabilityScope }

/** Signs canonical bytes; returns signature bytes (detached — not stored in the lexicon record). */
export type Signer = (bytes: Uint8Array) => Promise<Uint8Array>

export interface ListParams {
  did: string
  role?: 'issuer' | 'audience'
  limit?: number
  cursor?: string
}

export interface ListResult {
  capabilities: CapabilityView[]
  cursor?: string
}

/**
 * Injected record backend. This package produces/reads records; it does not
 * choose where they live (PDS / repo selection is SP-4c).
 */
export interface RecordStore {
  putCapability(record: CapabilityRecord): Promise<{ uri: string; cid: string }>
  putRevocation(record: RevocationRecord): Promise<{ uri: string; cid: string }>
  /** Retrieve a capability record by its CID string. Returns undefined if not found. */
  getCapability(cid: string): Promise<CapabilityRecord | undefined>
  /** List capabilities where `did` is issuer or audience (per role). */
  query(params: ListParams): Promise<ListResult>
}
