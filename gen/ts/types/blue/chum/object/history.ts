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

/** One mutation record in the history chain. */
export interface HistoryEntry {
  $type?: 'blue.chum.object.history#historyEntry'
  cid: string
  prev?: string
  recordCid: string
  did: string
  timestamp: string
}

const hashHistoryEntry = 'historyEntry'

export function isHistoryEntry<V>(v: V) {
  return is$typed(v, id, hashHistoryEntry)
}

export function validateHistoryEntry<V>(v: V) {
  return validate<HistoryEntry & V>(v, id, hashHistoryEntry)
}
