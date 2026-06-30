import { isAttenuation } from './attenuation-rules.js'
import { mintCapability } from './mint.js'
import type { MintContext } from './mint.js'
import type { CapabilityRecord } from './types.js'

export interface AttenuateOptions {
  aud: string
  scope: CapabilityRecord['scope']
  expiresAt: string
  notBefore?: string
}

/**
 * Mint a child capability attenuating `parentCid`.
 *
 * Enforces §4 invariants client-side BEFORE minting:
 *   - child.scope ⊆ parent.scope
 *   - child.expiresAt ≤ parent.expiresAt
 *   - child.iss === parent.aud (chain continuity; child.iss is ctx.iss)
 *
 * Throws if any invariant is violated (defense in depth; server re-checks in SP-4b).
 */
export async function attenuate(
  parentCid: string,
  narrowing: AttenuateOptions,
  ctx: MintContext,
): Promise<{ uri: string; cid: string }> {
  const parent = await ctx.store.getCapability(parentCid)
  if (parent === undefined) {
    throw new Error(`Parent capability not found: ${parentCid}`)
  }

  // Build a candidate child record for the attenuation check
  const childCandidate: Pick<CapabilityRecord, 'iss' | 'scope' | 'expiresAt'> = {
    iss: ctx.iss,
    scope: narrowing.scope,
    expiresAt: narrowing.expiresAt,
  }

  if (!isAttenuation(parent, childCandidate)) {
    throw new Error(
      'Attenuation check failed: child capability would widen authority, ' +
        'outlive parent, or break chain continuity (child.iss !== parent.aud)',
    )
  }

  return mintCapability(
    {
      aud: narrowing.aud,
      scope: narrowing.scope,
      expiresAt: narrowing.expiresAt,
      notBefore: narrowing.notBefore,
      prev: parentCid,
    },
    ctx,
  )
}
