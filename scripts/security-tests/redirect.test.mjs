import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeRedirect } from '../../lib/auth/redirect.ts'

const CR = String.fromCharCode(13)
const LF = String.fromCharCode(10)

const SAFE = ['/account', '/account/orders?x=1#y', '/products/abc-123', '/cart']
const UNSAFE = [
  '//evil.com',
  '/\\evil.com',
  '/\\\\evil.com',
  'https://evil.com/account',
  'http://evil.com',
  'javascript:alert(1)',
  `/evil${CR}${LF}Set-Cookie: x=1`,
  `/evil${LF}X: y`,
  '/ evil',
  '',
  'account',
  '  ',
  null,
  undefined,
]

for (const target of SAFE) {
  test(`M2: keeps same-origin path ${JSON.stringify(target)}`, () => {
    assert.equal(sanitizeRedirect(target), target)
  })
}

for (const target of UNSAFE) {
  test(`M2: rejects ${JSON.stringify(target)}`, () => {
    assert.equal(sanitizeRedirect(target), '/account')
  })
}

test('M2: custom fallback is honoured', () => {
  assert.equal(sanitizeRedirect('//evil.com', '/cart'), '/cart')
})
