import { isAllowedCmsRequest } from '@/lib/checkout/cms-allowlist'
import { proxyWooRequest } from '@/lib/checkout/proxy'

type Context = { params: Promise<{ path?: string[] }> }

/**
 * Same-origin bridge for the assets and AJAX endpoint the proxied WooCommerce
 * checkout needs. The allow-list lives in lib/checkout/cms-allowlist so it
 * can be unit-tested; anything outside it is a plain 404 here and never
 * reaches WordPress. PUT/PATCH/DELETE are no longer exported, so Next.js
 * answers them with 405.
 */
async function handler(request: Request, context: Context) {
  const { path = [] } = await context.params
  if (!isAllowedCmsRequest(path, request.method)) {
    return new Response('Not found', {
      status: 404,
      headers: { 'cache-control': 'no-store', 'content-type': 'text/plain; charset=utf-8' },
    })
  }
  return proxyWooRequest(request, path)
}

export const GET = handler
export const POST = handler
export const HEAD = handler
