'use strict';
/* 결정 D-1102: 덤 없는 상위 조합 금지 (사용자 피드백 2026-11-07 "칡 덩굴 하나로 바꿀 수 있는 걸 칡 덩굴 하나 + 다른 물품으로 바꾸는 게 같이 조건으로 되어 있다.
   추가로 재료를 얹어서 바꿀 때는 그만한 이득이 있어야 하고 그걸 플레이어에게 보여 줘야 한다").
   지역 코드의 교환 정의(REG.trade 의 {id, …, asks:[대체…], extra:[덤…]})를 읽어,
   - 한 교환 안에서 어떤 대체가 다른 대체의 재료를 모두 같은 수 이상 담고 더 얹었으면(상위 조합), 그 대체 번호의 extra 가 있어야 한다.
   - 같은 상대의 다른 교환이 같은 물건을 같은 수만큼 주면서 원하는 것이 한쪽의 상위 조합이면 걸린다 (더 얹을 까닭이 없다).
   - 손님 교환(strangers.js trades)도 같은 상대 안에서 같은 물건을 주는 줄끼리 같은 기준으로 본다.
   브라우저 없이 코드 글자만 읽는다. 교환 정의는 한 줄에 하나씩 적는 지금 꼴(asks 와 extra 가 같은 줄)을 전제로 한다. data 검사에 붙는다. */
const fs = require('node:fs');
const path = require('node:path');

// [ ... ] 또는 { ... } 를 짝 맞춰 잘라 낸다 (따옴표 안은 건너뛴다)
function bracket(src, start) {
  const open = src[start], close = open === '[' ? ']' : '}';let depth = 0, q = null;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === open) depth++; else if (c === close && --depth === 0) return src.slice(start, i + 1);
  }
  return null;
}
// {a:1,b:N} 꼴 → {a:1,b:값}. 숫자가 아닌 값은 파일의 const 이름=숫자 로 풀고, 못 풀면 1로 본다
function parseBundle(text, consts) {
  const out = {};
  for (const m of text.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*([A-Za-z_$][\w$]*|\d+)/g)) out[m[1]] = /^\d+$/.test(m[2]) ? +m[2] : (consts[m[2]] ?? 1);
  return out;
}
function parseList(text, consts) {
  if (!text) return [];
  const inner = text.slice(1, -1), out = [];let i = 0;
  while (i < inner.length) {
    const c = inner[i];
    if (c === '{') { const b = bracket(inner, i);out.push(parseBundle(b, consts));i += b.length; }
    else if (inner.startsWith('null', i)) { out.push(null);i += 4; }
    else i++;
  }
  return out;
}
// a 가 b 의 상위 조합인가 (b 의 재료를 모두 같은 수 이상 담고, 더 담았다)
const covers = (a, b) => Object.entries(b).every(([id, n]) => (a[id] || 0) >= n);
const superset = (a, b) => covers(a, b) && !covers(b, a);
const text = o => Object.entries(o).map(([id, n]) => id + ' ' + n).join(' + ');

function goodsIn(file) {
  const src = fs.readFileSync(file, 'utf8'), consts = {}, arrays = {};
  for (const m of src.matchAll(/(?:const|let)\s+([A-Z_][A-Z0-9_]*)\s*=\s*(\d+)/g)) consts[m[1]] = +m[2];
  for (const m of src.matchAll(/(?:const|let)\s+([A-Z_][A-Z0-9_]*)\s*=\s*\[/g)) arrays[m[1]] = bracket(src, m.index + m[0].length - 1);
  const goods = [];
  // 상대 이름: "  npc:()=>" 로 시작하는 REG.trade 칸. 교환 정의는 그 뒤 다음 칸 전까지
  const owners = [...src.matchAll(/^\s{2}([a-z_]+)\s*:\s*\(\)\s*=>/gm)].map(m => ({npc: m[1], at: m.index}));
  for (const m of src.matchAll(/\{id:'([^']+)'[^\n]*?asks:(\[|[A-Z_][A-Z0-9_]*)/g)) {
    const id = m[1], at = m.index;
    const askText = m[2] === '[' ? bracket(src, m.index + m[0].length - 1) : arrays[m[2]];
    if (!askText) continue;
    const rest = src.slice(m.index + m[0].length - (m[2] === '[' ? 1 : m[2].length), src.indexOf('\n', m.index + m[0].length) + 1 || undefined);
    const ex = rest.match(/extra:\[/);
    const extraText = ex ? bracket(rest, ex.index + 6) : null;
    const item = (src.slice(at, at + 200).match(/item:'([^']+)'/) || [])[1];
    const n = (src.slice(at, at + 200).match(/[{,]n:(\d+)/) || [])[1];
    const owner = owners.filter(o => o.at < at).pop()?.npc || '?';
    goods.push({id, npc: owner, item, n: n ? +n : 1, asks: parseList(askText, consts), extra: parseList(extraText, consts),
      line: src.slice(0, at).split('\n').length});
  }
  // 손님 교환: trades:[{give:{…},get:{…}}, …]
  const guests = [];
  for (const m of src.matchAll(/trades:\[/g)) {
    const list = bracket(src, m.index + 7), line = src.slice(0, m.index).split('\n').length;
    for (const t of list.matchAll(/\{give:(\{[^}]*\}),get:(\{[^}]*\})\}/g)) guests.push({give: parseBundle(t[1], consts), get: parseBundle(t[2], consts), line});
  }
  return {goods, guests};
}

function checkAsks(root) {
  const findings = [], dir = path.join(root, 'prototypes/web/js/regions');let count = 0;
  for (const region of fs.readdirSync(dir)) {
    for (const name of ['story.js', 'strangers.js']) {
      const file = path.join(dir, region, name);if (!fs.existsSync(file)) continue;
      const rel = path.relative(root, file).split(path.sep).join('/'), {goods, guests} = goodsIn(file);
      count += goods.length + guests.length;
      for (const g of goods) {
        g.asks.forEach((a, k) => {
          if (g.asks.some((b, i) => i !== k && superset(a, b)) && !g.extra[k])
            findings.push({rule: 'trade-superset', file: rel, line: g.line,
              message: g.id + ': 대체 ' + (k + 1) + '(' + text(a) + ')이 다른 대체에 재료를 더 얹은 꼴인데 덤(extra[' + k + '])이 없다. 지우거나 그만한 덤을 적는다.'});
        });
      }
      for (const g of goods) for (const h of goods) {
        if (g === h || g.npc !== h.npc || !g.item || g.item !== h.item || g.n !== h.n) continue;
        for (const a of g.asks) for (const b of h.asks) if (superset(a, b))
          findings.push({rule: 'trade-superset', file: rel, line: g.line,
            message: g.id + '(' + text(a) + ')이 같은 상대의 ' + h.id + '(' + text(b) + ')와 같은 것을 같은 수만큼 주면서 재료만 더 얹었다.'});
      }
      for (const t of guests) for (const u of guests) {
        if (t === u || t.line !== u.line || text(t.get) !== text(u.get)) continue;
        if (superset(t.give, u.give)) findings.push({rule: 'trade-superset', file: rel, line: t.line,
          message: '손님 교환 ' + text(t.give) + ' → ' + text(t.get) + '이 같은 손님의 ' + text(u.give) + ' → ' + text(u.get) + '에 재료만 더 얹었다.'});
      }
    }
  }
  return {goods: count, findings};
}
module.exports = {checkAsks, goodsIn, superset};
