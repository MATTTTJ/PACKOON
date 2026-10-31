// finish-v5.sh가 남긴 표(id, 반복 시작초, 반복 끝초, 판=파일,…)를 게임이 읽는 js/data/new-music.js로 바꾼다 (결정 D-121).
// 이미 있는 표와 합쳐, 일부 곡만 다시 만들 때도 나머지를 지킨다.
// 사용: node tools/audio/ace/new-table.js <표.tsv> <new-music.js>
'use strict';
const fs = require('fs');
const [tsv, out] = process.argv.slice(2);
let cur = {};
try { const s = fs.readFileSync(out, 'utf8'); cur = JSON.parse(s.slice(s.indexOf('=') + 1).trim().replace(/;$/, '')); } catch (_) {}
for (const line of fs.readFileSync(tsv, 'utf8').trim().split('\n')) {
  const [id, a, b, parts] = line.replace(/\r$/, '').split('\t');
  cur[id] = { loop: +b > 0 ? [+a, +b] : null, parts: parts.split(',').map(p => { const i = p.indexOf('='); return { name: p.slice(0, i), url: p.slice(i + 1) }; }) };
}
fs.writeFileSync(out, "'use strict';\n// 자동으로 만든 파일이다: tools/audio/ace/finish-v5.sh (결정 D-121). 새 곡의 판 파일과 반복 구간(초).\n" +
  'window.PACKOON_NEW_LOOPS=' + JSON.stringify(cur, null, 1) + ';\n');
console.log('표: ' + out + ' (' + Object.keys(cur).length + '곡)');
