import test from 'node:test'
import assert from 'node:assert/strict'
import { isAllowedCmsRequest } from '../../lib/checkout/cms-allowlist.ts'

const ALLOWED = [
  [['wp-includes', 'js', 'jquery', 'jquery.min.js'], 'GET'],
  [['wp-content', 'plugins', 'woocommerce', 'assets', 'js', 'frontend', 'checkout.min.js'], 'GET'],
  [['wp-content', 'themes', 'astra', 'style.css'], 'HEAD'],
  [['wp-content', 'uploads', '2026', '06', 'photo.jpg'], 'GET'],
  [['wp-content', 'plugins', 'x', 'fonts', 'a.woff2'], 'GET'],
  [['wp-admin', 'admin-ajax.php'], 'POST'],
  [['wp-admin', 'admin-ajax.php'], 'GET'],
]

const DENIED = [
  [['wp-login.php'], 'GET'],
  [['wp-login.php'], 'POST'],
  [['xmlrpc.php'], 'POST'],
  [['wp-json', 'wp', 'v2', 'users'], 'GET'],
  [['wp-json', 'wc', 'v3', 'orders'], 'GET'],
  [['graphql'], 'POST'],
  [[], 'GET'],
  [['wp-content', 'uploads', 'shell.php'], 'GET'],
  [['wp-content', 'uploads', 'shell.php', 'x.png'], 'GET'],
  [['wp-content', 'uploads', 'x.php.png'], 'GET'],
  [['wp-content', 'uploads', 'x.phtml'], 'GET'],
  [['wp-content', '..', 'wp-config.php'], 'GET'],
  [['wp-content', 'uploads', '..', '..', 'wp-config.php'], 'GET'],
  [['wp-content', 'plugins', 'x', 'a.js\\..'], 'GET'],
  [['wp-includes', 'js', 'a.js'], 'POST'],
  [['wp-includes', 'js', 'a.js'], 'PUT'],
  [['wp-admin', 'admin-ajax.php'], 'DELETE'],
  [['wp-admin', 'admin-ajax.php'], 'PUT'],
  [['wp-admin', 'admin.php'], 'GET'],
  [['wp-admin', 'admin-post.php'], 'POST'],
  [['wp-content', 'debug.log'], 'GET'],
  [['.htaccess'], 'GET'],
  [['wp-content', 'uploads', 'x.jpg .php'], 'GET'],
]

for (const [segments, method] of ALLOWED) {
  test(`C2: allows ${method} /cms/${segments.join('/')}`, () => {
    assert.equal(isAllowedCmsRequest(segments, method), true)
  })
}

for (const [segments, method] of DENIED) {
  test(`C2: denies ${method} /cms/${segments.join('/')}`, () => {
    assert.equal(isAllowedCmsRequest(segments, method), false)
  })
}
