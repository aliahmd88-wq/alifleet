/**
 * HTML sanitiser for content that arrives from WordPress.
 *
 * Blog posts and policy pages are rendered with `dangerouslySetInnerHTML`.
 * WordPress itself is trusted, but an editor account, a plugin, or a stolen
 * admin session can put arbitrary markup into a post body, and from there it
 * would run as first-party script on alifleet.com — next to the login
 * cookies, the cart and the checkout (H2). Everything from WordPress that is
 * rendered as raw HTML passes through here first.
 *
 * The allow-list matches what the block editor normally produces: headings,
 * paragraphs, lists, tables, images, links, blockquotes, code, and video
 * embeds from YouTube / Vimeo. Scripts, event handlers, `javascript:` URLs,
 * forms, and inline styles beyond basic sizing and alignment are removed.
 *
 * No `server-only` guard on purpose: the module is pure so `node --test` can
 * exercise it directly (scripts/security-tests/sanitize.test.mjs).
 */
import sanitizeHtml from 'sanitize-html'

const ALLOWED_IFRAME_HOSTS = [
  'www.youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
]

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'iframe'],
  allowedAttributes: {
    '*': ['class', 'id', 'dir', 'lang', 'title', 'style'],
    a: ['href', 'name', 'target', 'rel', 'title', 'download'],
    img: ['src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading', 'decoding'],
    iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'loading', 'frameborder'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan', 'scope'],
    ol: ['start', 'reversed', 'type'],
    time: ['datetime'],
    blockquote: ['cite'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(?:left|right|center|justify|start|end)$/],
      width: [/^\d{1,4}(?:px|%)$/],
      'max-width': [/^\d{1,4}(?:px|%)$/],
      height: [/^\d{1,4}(?:px|%)$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'], iframe: ['https'] },
  allowedIframeHostnames: ALLOWED_IFRAME_HOSTS,
  allowProtocolRelative: false,
  // An iframe whose src was rejected is just an empty frame: drop it.
  exclusiveFilter: (frame) => frame.tag === 'iframe' && !frame.attribs.src,
  disallowedTagsMode: 'discard',
  transformTags: {
    a: (tagName, attribs) => {
      // A new-tab link without noopener hands the opener window to the target.
      if (attribs.target === '_blank') attribs.rel = 'noopener noreferrer'
      return { tagName, attribs }
    },
  },
}

/** Returns HTML safe to inject into the page; empty input yields ''. */
export function sanitizeWpHtml(html: string | null | undefined): string {
  if (!html) return ''
  return sanitizeHtml(html, OPTIONS)
}

const MAX_DEPTH = 6

/**
 * Walks a GraphQL payload and sanitises every string field named `content`.
 * Applied at the policy fetch boundary so each query shape need not be
 * special-cased; other fields are returned untouched.
 */
export function sanitizeContentFields<T>(value: T, depth = 0): T {
  if (depth > MAX_DEPTH || value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeContentFields(item, depth + 1)) as T
  }
  const out: Record<string, unknown> = {}
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    out[key] =
      key === 'content' && typeof entry === 'string'
        ? sanitizeWpHtml(entry)
        : sanitizeContentFields(entry, depth + 1)
  }
  return out as T
}
