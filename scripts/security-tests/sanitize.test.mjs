// Run with: pnpm test:security   (Node 24 strips the TS types at import time)
import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeWpHtml, sanitizeContentFields } from '../../lib/wp/sanitize.ts'

test('H2: <script> and its body are removed', () => {
  assert.equal(sanitizeWpHtml('<p>Hi</p><script>document.cookie</script>'), '<p>Hi</p>')
})

test('H2: inline event handlers are removed, the image stays', () => {
  const out = sanitizeWpHtml('<img src="https://a-f.site/wp-content/uploads/x.png" onerror="alert(1)">')
  assert.ok(!out.includes('onerror'))
  assert.ok(out.includes('src="https://a-f.site/wp-content/uploads/x.png"'))
})

test('H2: javascript: and data: links are dropped', () => {
  assert.ok(!sanitizeWpHtml('<a href="javascript:alert(1)">x</a>').includes('javascript:'))
  assert.ok(!sanitizeWpHtml('<a href="data:text/html,x">x</a>').includes('data:'))
})

test('H2: forms, objects and unknown tags are discarded', () => {
  const out = sanitizeWpHtml(
    '<form action="https://evil.example"><input name="pw"></form><object data="x"></object><p>ok</p>'
  )
  assert.equal(out, '<p>ok</p>')
})

test('normal editor markup passes through untouched', () => {
  const html =
    '<h2>כותרת</h2><p dir="rtl">טקסט <strong>מודגש</strong> <a href="https://alifleet.com/products">קישור</a></p><ul><li>a</li><li>b</li></ul><table><tbody><tr><td colspan="2">x</td></tr></tbody></table>'
  assert.equal(sanitizeWpHtml(html), html)
})

test('iframes are allowed only from video hosts over https', () => {
  assert.ok(sanitizeWpHtml('<iframe src="https://www.youtube.com/embed/abc"></iframe>').includes('youtube.com'))
  assert.equal(sanitizeWpHtml('<iframe src="https://evil.example/x"></iframe>'), '')
  assert.equal(sanitizeWpHtml('<iframe src="http://www.youtube.com/embed/abc"></iframe>'), '')
})

test('target=_blank links get rel=noopener', () => {
  assert.ok(
    sanitizeWpHtml('<a href="https://x.y" target="_blank">x</a>').includes('rel="noopener noreferrer"')
  )
})

test('style attribute is limited to alignment and sizing', () => {
  const out = sanitizeWpHtml('<p style="text-align:center;background:url(javascript:1);position:fixed">x</p>')
  assert.ok(out.includes('text-align:center'))
  assert.ok(!out.includes('position'))
  assert.ok(!out.includes('url('))
})

test('sanitizeContentFields touches only string fields named content', () => {
  const data = {
    ar: { title: '<b>t</b>', content: '<p>ok</p><script>1</script>' },
    list: [{ content: '<img src="https://a-f.site/a.png" onerror="1">' }],
    n: 3,
    nothing: null,
  }
  const out = sanitizeContentFields(data)
  assert.equal(out.ar.title, '<b>t</b>')
  assert.equal(out.ar.content, '<p>ok</p>')
  assert.ok(!out.list[0].content.includes('onerror'))
  assert.equal(out.n, 3)
  assert.equal(out.nothing, null)
})

test('empty input yields an empty string', () => {
  assert.equal(sanitizeWpHtml(null), '')
  assert.equal(sanitizeWpHtml(undefined), '')
  assert.equal(sanitizeWpHtml(''), '')
})
