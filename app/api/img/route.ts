import { type NextRequest, NextResponse } from 'next/server'

/**
 * /api/img?url=<encoded-absolute-url>
 *
 * Proxies images from the WordPress server so the browser never hits an
 * http:// origin from an https:// page (mixed-content block).
 *
 * Only the WordPress media library is reachable: the configured host, the
 * /wp-content/uploads/ path, an image extension, and an image content type on
 * the way back. It used to forward any path on that host with the server's
 * own network position and stream back whatever came out (M1).
 */
const UPLOADS_PREFIX = '/wp-content/uploads/'
const IMAGE_EXTENSION = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|bmp)$/i
const MAX_IMAGE_BYTES = 25 * 1024 * 1024

function allowedWordPressHost(): string {
  try {
    return new URL(process.env.WORDPRESS_GRAPHQL_ENDPOINT ?? '').hostname
  } catch {
    return ''
  }
}

function isAllowedTarget(target: URL, allowedHost: string): boolean {
  if (!allowedHost || target.hostname !== allowedHost) return false
  if (target.protocol !== 'https:' && target.protocol !== 'http:') return false
  if (target.username || target.password) return false
  const path = target.pathname
  if (!path.startsWith(UPLOADS_PREFIX)) return false
  if (path.includes('..') || path.includes('\\')) return false
  return IMAGE_EXTENSION.test(path)
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url')
  if (!raw) return new NextResponse('Missing url param', { status: 400 })

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return new NextResponse('Invalid url', { status: 400 })
  }

  const allowedHost = allowedWordPressHost()
  if (!isAllowedTarget(target, allowedHost)) {
    return new NextResponse('Forbidden target', { status: 400 })
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: { 'User-Agent': 'AliFleet-NextJS-Image-Proxy/1.0' },
      next: { revalidate: 86400 }, // cache 24 h on the CDN edge
    })

    if (!upstream.ok) {
      return new NextResponse(`Upstream ${upstream.status}`, { status: 502 })
    }

    // fetch follows redirects; make sure we did not end up somewhere else.
    if (new URL(upstream.url).hostname !== allowedHost) {
      return new NextResponse('Upstream redirected off-host', { status: 502 })
    }

    const contentType = upstream.headers.get('content-type') ?? ''
    if (!contentType.toLowerCase().startsWith('image/')) {
      return new NextResponse('Upstream is not an image', { status: 502 })
    }

    const declared = Number(upstream.headers.get('content-length') ?? Number.NaN)
    if (Number.isFinite(declared) && declared > MAX_IMAGE_BYTES) {
      return new NextResponse('Image too large', { status: 502 })
    }

    const buffer = await upstream.arrayBuffer()
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      return new NextResponse('Image too large', { status: 502 })
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
        // The sandboxing CSP for this route lives in next.config.mjs headers();
        // config headers override anything set here.
      },
    })
  } catch (err) {
    console.error('[img-proxy] fetch error', err)
    return new NextResponse('Proxy error', { status: 502 })
  }
}
