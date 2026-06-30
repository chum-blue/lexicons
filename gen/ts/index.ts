/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  XrpcClient,
  type FetchHandler,
  type FetchHandlerOptions,
} from '@atproto/xrpc'
import { schemas } from './lexicons.js'
import { CID } from 'multiformats/cid'
import { type OmitKey, type Un$Typed } from './util.js'
import * as BlueChumAuthCapability from './types/blue/chum/auth/capability.js'
import * as BlueChumAuthListCapabilities from './types/blue/chum/auth/listCapabilities.js'
import * as BlueChumAuthRevocation from './types/blue/chum/auth/revocation.js'
import * as BlueChumObjectHead from './types/blue/chum/object/head.js'
import * as BlueChumObjectHistory from './types/blue/chum/object/history.js'
import * as BlueChumObjectList from './types/blue/chum/object/list.js'
import * as BlueChumPointerRecord from './types/blue/chum/pointer/record.js'
import * as BlueChumUploadAbort from './types/blue/chum/upload/abort.js'
import * as BlueChumUploadComplete from './types/blue/chum/upload/complete.js'
import * as BlueChumUploadCreate from './types/blue/chum/upload/create.js'

export * as BlueChumAuthCapability from './types/blue/chum/auth/capability.js'
export * as BlueChumAuthListCapabilities from './types/blue/chum/auth/listCapabilities.js'
export * as BlueChumAuthRevocation from './types/blue/chum/auth/revocation.js'
export * as BlueChumObjectHead from './types/blue/chum/object/head.js'
export * as BlueChumObjectHistory from './types/blue/chum/object/history.js'
export * as BlueChumObjectList from './types/blue/chum/object/list.js'
export * as BlueChumPointerRecord from './types/blue/chum/pointer/record.js'
export * as BlueChumUploadAbort from './types/blue/chum/upload/abort.js'
export * as BlueChumUploadComplete from './types/blue/chum/upload/complete.js'
export * as BlueChumUploadCreate from './types/blue/chum/upload/create.js'

export class AtpBaseClient extends XrpcClient {
  blue: BlueNS

  constructor(options: FetchHandler | FetchHandlerOptions) {
    super(options, schemas)
    this.blue = new BlueNS(this)
  }

  /** @deprecated use `this` instead */
  get xrpc(): XrpcClient {
    return this
  }
}

export class BlueNS {
  _client: XrpcClient
  chum: BlueChumNS

  constructor(client: XrpcClient) {
    this._client = client
    this.chum = new BlueChumNS(client)
  }
}

export class BlueChumNS {
  _client: XrpcClient
  auth: BlueChumAuthNS
  object: BlueChumObjectNS
  pointer: BlueChumPointerNS
  upload: BlueChumUploadNS

  constructor(client: XrpcClient) {
    this._client = client
    this.auth = new BlueChumAuthNS(client)
    this.object = new BlueChumObjectNS(client)
    this.pointer = new BlueChumPointerNS(client)
    this.upload = new BlueChumUploadNS(client)
  }
}

export class BlueChumAuthNS {
  _client: XrpcClient
  capability: BlueChumAuthCapabilityRecord
  revocation: BlueChumAuthRevocationRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.capability = new BlueChumAuthCapabilityRecord(client)
    this.revocation = new BlueChumAuthRevocationRecord(client)
  }

  listCapabilities(
    params?: BlueChumAuthListCapabilities.QueryParams,
    opts?: BlueChumAuthListCapabilities.CallOptions,
  ): Promise<BlueChumAuthListCapabilities.Response> {
    return this._client.call(
      'blue.chum.auth.listCapabilities',
      params,
      undefined,
      opts,
    )
  }
}

export class BlueChumAuthCapabilityRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: BlueChumAuthCapability.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'blue.chum.auth.capability',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: BlueChumAuthCapability.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'blue.chum.auth.capability',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<BlueChumAuthCapability.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'blue.chum.auth.capability'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<BlueChumAuthCapability.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'blue.chum.auth.capability'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'blue.chum.auth.capability', ...params },
      { headers },
    )
  }
}

export class BlueChumAuthRevocationRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: BlueChumAuthRevocation.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'blue.chum.auth.revocation',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: BlueChumAuthRevocation.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'blue.chum.auth.revocation',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<BlueChumAuthRevocation.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'blue.chum.auth.revocation'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<BlueChumAuthRevocation.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'blue.chum.auth.revocation'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'blue.chum.auth.revocation', ...params },
      { headers },
    )
  }
}

export class BlueChumObjectNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  head(
    params?: BlueChumObjectHead.QueryParams,
    opts?: BlueChumObjectHead.CallOptions,
  ): Promise<BlueChumObjectHead.Response> {
    return this._client.call('blue.chum.object.head', params, undefined, opts)
  }

  history(
    params?: BlueChumObjectHistory.QueryParams,
    opts?: BlueChumObjectHistory.CallOptions,
  ): Promise<BlueChumObjectHistory.Response> {
    return this._client.call(
      'blue.chum.object.history',
      params,
      undefined,
      opts,
    )
  }

  list(
    params?: BlueChumObjectList.QueryParams,
    opts?: BlueChumObjectList.CallOptions,
  ): Promise<BlueChumObjectList.Response> {
    return this._client.call('blue.chum.object.list', params, undefined, opts)
  }
}

export class BlueChumPointerNS {
  _client: XrpcClient
  record: BlueChumPointerRecordRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.record = new BlueChumPointerRecordRecord(client)
  }
}

export class BlueChumPointerRecordRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: BlueChumPointerRecord.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'blue.chum.pointer.record',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: BlueChumPointerRecord.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'blue.chum.pointer.record',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<BlueChumPointerRecord.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'blue.chum.pointer.record'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<BlueChumPointerRecord.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'blue.chum.pointer.record'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'blue.chum.pointer.record', ...params },
      { headers },
    )
  }
}

export class BlueChumUploadNS {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  abort(
    data?: BlueChumUploadAbort.InputSchema,
    opts?: BlueChumUploadAbort.CallOptions,
  ): Promise<BlueChumUploadAbort.Response> {
    return this._client.call('blue.chum.upload.abort', opts?.qp, data, opts)
  }

  complete(
    data?: BlueChumUploadComplete.InputSchema,
    opts?: BlueChumUploadComplete.CallOptions,
  ): Promise<BlueChumUploadComplete.Response> {
    return this._client.call('blue.chum.upload.complete', opts?.qp, data, opts)
  }

  create(
    data?: BlueChumUploadCreate.InputSchema,
    opts?: BlueChumUploadCreate.CallOptions,
  ): Promise<BlueChumUploadCreate.Response> {
    return this._client.call('blue.chum.upload.create', opts?.qp, data, opts)
  }
}
