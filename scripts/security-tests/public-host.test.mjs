import test from 'node:test'
import assert from 'node:assert/strict'
import { isKnownPublicHost } from '../../lib/checkout/public-host.ts'

test('M3: canonical host and its www twin are accepted, case-insensitively', () => {
  assert.equal(isKnownPublicHost('alifleet.com', 'alifleet.com'), true)
  assert.equal(isKnownPublicHost('www.alifleet.com', 'alifleet.com'), true)
  assert.equal(isKnownPublicHost('ALIFLEET.COM', 'alifleet.com'), true)
  assert.equal(isKnownPublicHost('alifleet.com', 'www.alifleet.com'), true)
  assert.equal(isKnownPublicHost('www.alifleet.com', 'www.alifleet.com'), true)
})

test('M3: foreign and look-alike hosts are rejected', () => {
  for (const host of [
    'evil.com',
    'alifleet.com.evil.com',
    'alifleet.co',
    'xalifleet.com',
    '',
    ' ',
    'alifleet.com:8443',
    'localhost:3000',
  ]) {
    assert.equal(isKnownPublicHost(host, 'alifleet.com'), false, host)
  }
})

test('M3: an empty canonical host never matches', () => {
  assert.equal(isKnownPublicHost('alifleet.com', ''), false)
})
