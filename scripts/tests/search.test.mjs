import test from 'node:test'
import assert from 'node:assert/strict'
import { buildHaystack, matchesQuery } from '../../lib/search/match.ts'

const mirror = buildHaystack(['מראת דלת דאף', 'مرآة باب داف', 'DAF Door Mirror', 'Daf', 'HTP-CF036'])
const headlight = buildHaystack(['פנס קדמי LED וולוו ימין', 'ضوء أمامي LED فولفو يمين', 'Volvo LED Headlight – Right', 'Volvo', 'HTP-VH15001R'])

for (const q of ['מראת דלת דאף', 'מראה דאף', 'מראת דאף', 'דאף מראה', 'mirror daf', 'daf mirror', 'مراية داف', 'مرآة داف', 'cf036', 'HTP-CF036', 'htp-cf036', 'מרא', 'ראי דאף']) {
  test(`mirror found by ${JSON.stringify(q)}`, () => assert.equal(matchesQuery(mirror, q), true))
}
for (const q of ['פנס דאף', 'מראה וולוו', 'volvo mirror', 'מראה צד']) {
  test(`mirror NOT found by ${JSON.stringify(q)}`, () => assert.equal(matchesQuery(mirror, q), false))
}
for (const q of ['פנס וולוו', 'פנסים וולוו', 'פנס ימין', 'volvo light', 'volvo headlight right', 'فنار فولفو', 'ضوء فولفو يمين', 'مصباح فولفو', 'led וולוו', 'ליד וולוו', 'vh15001r', 'ימין וולוו פנס', 'פָּנָס']) {
  test(`headlight found by ${JSON.stringify(q)}`, () => assert.equal(matchesQuery(headlight, q), true))
}
for (const q of ['פנס שמאל', 'פנס דאף', 'scania light']) {
  test(`headlight NOT found by ${JSON.stringify(q)}`, () => assert.equal(matchesQuery(headlight, q), false))
}
test('empty query matches everything', () => assert.equal(matchesQuery(mirror, '   '), true))
