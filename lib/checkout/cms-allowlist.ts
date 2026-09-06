/**
 * What `/cms/*` may forward to WordPress.
 *
 * The route exists so WooCommerce's checkout markup can load its own assets
 * and AJAX endpoint from this origin (see rewriteCmsUrl in ./proxy). It used
 * to forward any path with any method, which made alifleet.com a public front
 * door to wp-login.php, xmlrpc.php and every REST route — with the visitor's
 * cookies attached (C2). Only what the checkout page actually references is
 * forwarded now.
 */
const ASSET_ROOT = /^(?:wp-content\/(?:uploads|plugins|themes|mu-plugins)|wp-includes)\//
const ASSET_EXTENSION =
  /\.(?:css|js|mjs|map|json|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot|mp4|webm)$/i
const SERVER_SIDE = /\.(?:php\d?|phtml|phar|cgi|pl|py|sh|htaccess)(?:[./?#]|$)/i
const WOO_AJAX = 'wp-admin/admin-ajax.php'

export function isAllowedCmsRequest(segments: readonly string[], method: string): boolean {
  const path = segments.join('/')
  if (!path) return false
  // Traversal, backslashes and NUL never appear in a legitimate asset URL.
  if (/[\\\x00]|(?:^|\/)\.\.(?:\/|$)/.test(path)) return false

  const verb = method.toUpperCase()
  if (path === WOO_AJAX) return verb === 'GET' || verb === 'POST' || verb === 'HEAD'
  if (verb !== 'GET' && verb !== 'HEAD') return false

  return ASSET_ROOT.test(path) && ASSET_EXTENSION.test(path) && !SERVER_SIDE.test(path)
}
