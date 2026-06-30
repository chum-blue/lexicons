import type { RecordStore, ListParams, ListResult } from './types.js'

/**
 * Typed wrapper over the blue.chum.auth.listCapabilities query.
 * Delegates to the injected store's query method.
 */
export async function listCapabilities(
  params: ListParams,
  store: RecordStore,
): Promise<ListResult> {
  return store.query(params)
}
