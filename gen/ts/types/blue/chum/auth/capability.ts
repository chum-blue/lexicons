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
const id = 'blue.chum.auth.capability'

export interface Main {
  $type: 'blue.chum.auth.capability'
  /** Issuer/owner DID; signs this record. */
  iss: string
  /** Delegate DID this capability is granted to. */
  aud: string
  /** One or more attenuations. Authority is the union of the entries. */
  scope: CapabilityScope[]
  /** Parent capability CID; null/absent at the chain root. */
  prev?: CID
  notBefore?: string
  expiresAt: string
  /** Distinguishes otherwise-identical grants so each has a distinct CID. */
  nonce: string
  createdAt: string
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

/** A UCAN-style with/can attenuation: the abilities (can) granted over a resource (bucket, optionally narrowed by keyPrefix). */
export interface CapabilityScope {
  $type?: 'blue.chum.auth.capability#capabilityScope'
  bucket: string
  /** Absent/empty = whole bucket; otherwise restricts to keys under this prefix. */
  keyPrefix?: string
  can: ('read' | 'write' | 'delete' | (string & {}))[]
}

const hashCapabilityScope = 'capabilityScope'

export function isCapabilityScope<V>(v: V) {
  return is$typed(v, id, hashCapabilityScope)
}

export function validateCapabilityScope<V>(v: V) {
  return validate<CapabilityScope & V>(v, id, hashCapabilityScope)
}
