/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../../lexicons.js'
import {
  type $Typed,
  is$typed as _is$typed,
  type OmitKey,
} from '../../../../util.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'blue.chum.pointer.record'

export interface Main {
  $type: 'blue.chum.pointer.record'
  bucket: string
  key: string
  cid: CID
  prev?: CID
  /** The DID that SEQUENCED this write — the operator. See writerDid for the DID that AUTHORISED it. */
  did: string
  contentType: string
  size: number
  visibility: 'public' | 'private'
  tombstone: boolean
  createdAt: string
  /** True when cid addresses a multipart manifest rather than raw bytes. Omitted when false. */
  assembled?: boolean
  /** CID of the capability that authorised writerDid. Omitted on a legacy record. */
  capCid?: string
  /** CID of the write intent's canonical bytes. Omitted on a legacy record. */
  intentCid?: string
  /** ADR-0008 trust tier, stating WHOSE key signed this record. Tiers count DOWN: 1 (self-custody: did:key/did:web, no operator ever holds the key) is strongest, 2 (registered: did:plc with a user-held rotation key), 3 (legacy: operator-signed). OMITTED on a legacy record — absence MUST be read as Tier 3, not as 0: writing 3 into the bytes would change every pre-SP-4e record's RecordCID. A verifier that compares tiers numerically must map absent -> 3 BEFORE comparing. */
  tier?: number
  /** The DID that AUTHORISED this write. Omitted on a legacy record, where did (the operator) is the only signer — which is what tier then reports. */
  writerDid?: string
  /** Detached signature by writerDid over the write intent's canonical bytes. Omitted on a legacy record. */
  writerSig?: Uint8Array
  [k: string]: unknown
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain, true)
}

export {
  type Main as Record,
  isMain as isRecord,
  validateMain as validateRecord,
}
