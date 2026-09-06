/**
 * Whether `host` is one this deployment actually answers for.
 *
 * The forwarded host header is attacker controlled whenever the proxy does
 * not overwrite it, and the checkout proxy echoes it into the WooCommerce
 * form action and the session handoff (M3). Only the canonical host and its
 * `www.` twin may be reflected; everything else falls back to the canonical
 * site URL. The caller passes the canonical host so this module stays free
 * of imports and can be unit-tested directly.
 */
export function isKnownPublicHost(host: string, canonicalHost: string): boolean {
  const candidate = host.trim().toLowerCase()
  const expected = canonicalHost.trim().toLowerCase()
  if (!candidate || !expected) return false
  return (
    candidate === expected ||
    candidate === `www.${expected}` ||
    `www.${candidate}` === expected
  )
}
