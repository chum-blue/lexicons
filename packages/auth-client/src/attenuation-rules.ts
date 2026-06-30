import type { CapabilityRecord, CapabilityScope } from './types.js'

// Re-export the scope type for external use
export type { CapabilityScope }

/**
 * Returns true iff the `child` scope entry is covered by the `parent` entry:
 *   - same bucket
 *   - child.keyPrefix startsWith parent.keyPrefix (child is at least as specific)
 *   - child.can ⊆ parent.can
 */
function scopeEntryContains(
  parent: { bucket: string; keyPrefix?: string; can: string[] },
  child: { bucket: string; keyPrefix?: string; can: string[] },
): boolean {
  if (parent.bucket !== child.bucket) return false

  // keyPrefix: empty/absent means "whole bucket". A child must be at least as
  // narrow as the parent — its prefix must start with the parent's prefix.
  const parentPrefix = parent.keyPrefix ?? ''
  const childPrefix = child.keyPrefix ?? ''
  if (!childPrefix.startsWith(parentPrefix)) return false

  // can subset: every ability the child grants must be in the parent's can list
  const parentCan = new Set(parent.can)
  for (const ability of child.can) {
    if (!parentCan.has(ability)) return false
  }

  return true
}

/**
 * Checks all §4 attenuation invariants (client-side defense-in-depth guard;
 * the server re-checks in SP-4b):
 *
 * 1. Monotonic attenuation: every child scope entry ⊆ some parent scope entry
 *    (same bucket, child.keyPrefix startsWith parent.keyPrefix, child.can ⊆ parent.can)
 * 2. Monotonic expiry: child.expiresAt ≤ parent.expiresAt
 * 3. Chain continuity: child.iss === parent.aud
 *
 * Returns true iff all invariants hold.
 */
export function isAttenuation(
  parent: Pick<CapabilityRecord, 'aud' | 'scope' | 'expiresAt'>,
  child: Pick<CapabilityRecord, 'iss' | 'scope' | 'expiresAt'>,
): boolean {
  // Invariant 3: chain continuity — child may only re-delegate what was delegated to it
  if (child.iss !== parent.aud) return false

  // Invariant 2: monotonic expiry — child cannot outlive parent
  // Fail closed: an unparseable date must be rejected, not silently treated as a pass.
  // NaN > x is false in JS, so without this guard a malformed date would bypass the check.
  if (Number.isNaN(Date.parse(child.expiresAt)) || Number.isNaN(Date.parse(parent.expiresAt))) return false
  if (new Date(child.expiresAt) > new Date(parent.expiresAt)) return false

  // Invariant 1: monotonic attenuation — every child scope entry must be covered
  // by at least one parent scope entry
  for (const childEntry of child.scope) {
    const covered = parent.scope.some((parentEntry) =>
      scopeEntryContains(parentEntry, childEntry),
    )
    if (!covered) return false
  }

  return true
}
