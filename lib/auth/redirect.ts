/**
 * Post-login redirect targets arrive from a hidden form field, i.e. from the
 * browser, i.e. from whoever crafted the link the customer clicked. Only a
 * path on this origin is ever honoured; anything that a browser could read as
 * another origin falls back to the account page (M2).
 *
 * Rejected on purpose: `//evil.com` (protocol-relative), `/\evil.com`
 * (browsers normalise the backslash to a slash), `https://…`, `javascript:`,
 * and anything carrying whitespace or control characters that could split a
 * header.
 */
const FALLBACK = '/account'

const SAME_ORIGIN_PATH = /^\/(?![\/\\])[^\s\x00-\x1f]*$/

export function sanitizeRedirect(target: string | null | undefined, fallback = FALLBACK): string {
  if (typeof target !== 'string') return fallback
  const value = target.trim()
  if (!SAME_ORIGIN_PATH.test(value)) return fallback

  // Re-parse against a throwaway base: if the URL parser lands on a different
  // origin the input was not a plain path after all.
  try {
    const parsed = new URL(value, 'https://alifleet.invalid')
    if (parsed.origin !== 'https://alifleet.invalid') return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
