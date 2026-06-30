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
import type * as BlueChumAuthCapability from './capability.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'blue.chum.auth.listCapabilities'

export type QueryParams = {
  did: string
  role?: 'issuer' | 'audience' | (string & {})
  limit?: number
  cursor?: string
}
export type InputSchema = undefined

export interface OutputSchema {
  cursor?: string
  capabilities: CapabilityView[]
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

export interface CapabilityView {
  $type?: 'blue.chum.auth.listCapabilities#capabilityView'
  uri: string
  cid: string
  revoked?: boolean
  value: BlueChumAuthCapability.Main
}

const hashCapabilityView = 'capabilityView'

export function isCapabilityView<V>(v: V) {
  return is$typed(v, id, hashCapabilityView)
}

export function validateCapabilityView<V>(v: V) {
  return validate<CapabilityView & V>(v, id, hashCapabilityView)
}
