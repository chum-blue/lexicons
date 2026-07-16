/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { HeadersMap, XRPCError } from '@atproto/xrpc'
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
const id = 'blue.chum.object.history'

export type QueryParams = {
  bucket: string
  key: string
}
export type InputSchema = undefined

export interface OutputSchema {
  records: HistoryEntry[]
}

export interface CallOptions {
  signal?: AbortSignal
  headers?: HeadersMap
}

export interface Response {
  success: boolean
  headers: HeadersMap
  data: OutputSchema
}

export function toKnownErr(e: any) {
  return e
}

/** One record in the chain, as proof material. unsignedBytes is the record's canonical DAG-CBOR preimage — the exact bytes recordCid addresses and sig commits to — and is the ONLY trust input: a verifier hashes it to check recordCid, verifies sig over it, and DECODES it for every other field (cid, prev, did, timestamp, tier, writerDid, ...). Those fields are deliberately not sent alongside the bytes, because a field sent twice is a field that can disagree with itself. */
export interface HistoryEntry {
  $type?: 'blue.chum.object.history#historyEntry'
  /** CIDv1/dag-cbor/sha-256 of unsignedBytes. The verifier recomputes this rather than trusting it. */
  recordCid: string
  /** Detached signature over unsignedBytes by the record's did. Base64 (RFC 4648 standard alphabet, padded). */
  sig: string
  /** The record's canonical DAG-CBOR bytes. Base64 (RFC 4648 standard alphabet, padded). Decode with blue.chum.pointer.record. */
  unsignedBytes: string
}

const hashHistoryEntry = 'historyEntry'

export function isHistoryEntry<V>(v: V) {
  return is$typed(v, id, hashHistoryEntry)
}

export function validateHistoryEntry<V>(v: V) {
  return validate<HistoryEntry & V>(v, id, hashHistoryEntry)
}
