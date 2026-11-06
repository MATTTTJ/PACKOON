'use strict';
/* 결정 D-724: 가공법(재료 조합) 전수 점검 (사용자 피드백 2026-11-05 "재료 조합법 만든 것들 정상 작동하는지 다시 검토").
   heirlooms.csv 의 가공법마다
   - 재료가 게임 어딘가에서 얻어지는지 (지역 코드의 줍기·캐기·받기, 교환·좌판 표, 보스 보상, 다른 가공법의 결과)
   - 결과물이 쓰이는 곳이 있는지 (다른 가공법의 재료, 교환·좌판·선물·달래기 표, 지역 코드의 이야기 조건)
   - 따로 배워야 하는 가공법(know)과 귀띔(hintLine)의 키를 실제로 배우는 곳이 있는지
   - 같은 가보 안에서 한 조합의 재료가 다른 조합의 정수배라 엉뚱한 결과로 맞춰지지 않는지 (D-441 배수 맞추기)
   를 본다. 브라우저 없이 표와 코드만 읽는다. data 검사에 붙는다. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function readCsv(root, name) {
  const text = fs.readFileSync(path.join(root, 'design/data', name), 'utf8').replace(/^﻿/, '');
  const rows = [];let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; continue; }
    if (c === '"') q = true; else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const head = rows.shift();
  return rows.filter(r => r.some(Boolean)).map(r => Object.fromEntries(head.map((h, i) => [h, r[i] || ''])));
}
function jsFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...jsFiles(p)); else if (e.name.endsWith('.js') && e.name !== 'tables.js') out.push(p);
  }
  return out;
}

function checkCraft(root) {
  const findings = [], warn = [];
  const sandbox = {};vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, 'prototypes/web/js/data/tables.js'), 'utf8') + ';this.TABLES=TABLES;', sandbox);
  const {ITEMS, RECIPES} = sandbox.TABLES;
  const byName = new Map(Object.entries(ITEMS).map(([id, it]) => [it.n, id]));
  const ids = new Set(Object.keys(ITEMS));
  const files = jsFiles(path.join(root, 'prototypes/web/js'));
  const src = files.map(f => ({file: path.relative(root, f).split(path.sep).join('/'), text: fs.readFileSync(f, 'utf8')}));
  const all = src.map(s => s.text).join('\n');
  const recipes = Object.entries(RECIPES).flatMap(([tool, list]) => list.map(r => ({tool, ...r})));

  // 이름 목록("도토리 가루 1 + 소금 1")에서 아이템 id 를 뽑는다. 이름이 아닌 칸(정보·호감 등)은 건너뛴다
  const namesIn = s => [...[...byName.keys()].filter(n => s.includes(n)).map(n => byName.get(n)), ...(s.match(/[a-z][a-z_]+/g) || []).filter(w => ids.has(w))];
  const sources = new Set(), uses = new Set();
  for (const r of readCsv(root, 'trades.csv')) { namesIn(r['주는것']).forEach(id => sources.add(id)); namesIn(r['원하는것']).forEach(id => uses.add(id)); }
  for (const r of readCsv(root, 'stock.csv')) namesIn(r['물건']).forEach(id => sources.add(id));
  for (const r of readCsv(root, 'bosses.csv')) { namesIn(r['달래기보상']).forEach(id => sources.add(id)); namesIn(r['진정수치']).forEach(id => uses.add(id)); }
  for (const r of readCsv(root, 'boss_parts.csv')) namesIn(r['부수면'] + ' ' + r['부순뒤변화']).forEach(id => sources.add(id));
  for (const r of readCsv(root, 'tastes.csv')) if (ids.has(r['무엇'])) uses.add(r['무엇']);
  for (const r of recipes) { sources.add(r.out); Object.keys(r.need).forEach(id => uses.add(id)); }
  // 선택 가공품은 그 물건의 지역에서 까치 편에 집으로 보낼 수 있다 (craft.js isHomeCraft). 가보가 그 지역보다 뒤에 깨어나면 그 자리에서는 보낼 수 없다
  const order = Object.fromEntries(readCsv(root, 'regions.csv').map((r, i) => [r.id, i]));
  const toolRegion = Object.fromEntries(readCsv(root, 'heirlooms.csv').map(r => [r.id, r['깨어나는지역']]));
  const homeOk = r => r.optional && !(order[ITEMS[r.out]?.region] < order[toolRegion[r.tool]]);
  for (const r of recipes) if (homeOk(r)) uses.add(r.out);
  for (const [id, it] of Object.entries(ITEMS)) if (it.eat > 0) uses.add(id);   // 먹을거리는 먹어서 체력을 채운다 (bag.js)
  // 보스 부위를 쳐서 떨어지는 돌·재료 표 (예: 돌 골렘 STONE_OF={leg:'gudeuldol',…})
  for (const s of src.filter(s => /enemies\.js$/.test(s.file))) for (const m of s.text.matchAll(/\b[a-z]+\s*:\s*['"]([a-z_]+)['"]/g)) if (ids.has(m[1])) sources.add(m[1]);

  // 코드에서 얻는 자리와 쓰는 자리. id 를 감싼 따옴표 앞뒤 모양으로 가른다
  const q = id => `['"]${id}['"]`;
  for (const id of ids) {
    const giveRe = new RegExp(`(item|rare|out|got|get|give|reward|drop)\\s*:\\s*${q(id)}|(addItem|receiveItem|gotLine|spawnDrops|gotText|grant\\w*)\\(\\s*${q(id)}|\\[\\s*${q(id)}\\s*,\\s*\\d+\\s*\\]|${id}\\s*:\\s*\\d+`);
    const useRe = new RegExp(`(has|takeItem|removeItem|useItem|need\\w*|count|inv)\\s*[\\(\\[]\\s*${q(id)}|G\\.inv\\.${id}\\b|(want|wants|need|give|fear|swapPool|likes|calm|gift)\\s*:\\s*[^\\n]{0,80}${q(id)}`);
    if (giveRe.test(all)) sources.add(id);
    if (useRe.test(all)) uses.add(id);
  }

  for (const r of recipes) {
    const label = `${r.tool}: ${Object.entries(r.need).map(([id, n]) => (ITEMS[id]?.n || id) + ' ' + n).join(' + ')} → ${ITEMS[r.out]?.n || r.out} ${r.n}`;
    for (const id of Object.keys(r.need)) if (!sources.has(id))
      findings.push({rule: 'craft-source', severity: '높음', file: 'design/data/heirlooms.csv', message: `재료 ${ITEMS[id]?.n || id}(${id})를 얻는 곳을 찾지 못했다: ${label}`});
    if (!uses.has(r.out) && !ITEMS[r.out]?.progress && r.optional && !homeOk(r))
      findings.push({rule: 'craft-deadend', severity: '높음', file: 'design/data/heirlooms.csv', message: `결과물 ${ITEMS[r.out]?.n || r.out}(${r.out})는 ${toolRegion[r.tool]}에서야 만들 수 있어 앞 마을(${ITEMS[r.out]?.region})의 집 보내기를 못 하고, 다른 쓰임(재료·교환·선물·이야기)도 없다: ${label}`});
    else if (!uses.has(r.out) && !ITEMS[r.out]?.progress)
      warn.push({rule: 'craft-deadend', severity: '검토', file: 'design/data/heirlooms.csv', message: `결과물 ${ITEMS[r.out]?.n || r.out}(${r.out})를 쓰는 곳(재료·교환·선물·이야기)이 없다: ${label}`});
    if (r.know && !new RegExp(`learn\\(\\s*['"]${r.know}['"]`).test(all))
      findings.push({rule: 'craft-know', severity: '높음', file: 'prototypes/web/js/data/common.js', message: `따로 배우는 가공법의 키 ${r.know}를 배우는 곳이 없다: ${label}`});
  }
  // 같은 가보 안 배수 겹침: A 재료 묶음이 B 재료 묶음의 정수배면, A 를 넣었을 때 B 가 먼저 맞을 수 있다 (matchRecipe 는 표 순서대로 본다)
  for (const [tool, list] of Object.entries(RECIPES)) for (let i = 0; i < list.length; i++) for (let j = 0; j < list.length; j++) {
    if (i === j) continue;
    const a = list[i].need, b = list[j].need, ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
    if (ka.join() !== kb.join()) continue;
    const t = a[ka[0]] / b[kb[0]];
    if (Number.isInteger(t) && t > 1 && ka.every(k => a[k] === b[k] * t))
      findings.push({rule: 'craft-multiple', severity: '높음', file: 'design/data/heirlooms.csv', message: `${tool}: ${ITEMS[list[i].out]?.n} 재료가 ${ITEMS[list[j].out]?.n} 재료의 ${t}배라 배수 맞추기에 먹힌다`});
  }
  // 귀띔(hintLine)으로 알려 주는 숨은 가공법이 실제 가공법인지
  const hinted = new Set();
  for (const m of all.matchAll(/hintLine\(\s*['"]([a-z_]+)['"]/g)) {
    hinted.add(m[1]);
    if (!recipes.some(r => r.out === m[1])) findings.push({rule: 'craft-hint', severity: '높음', file: 'prototypes/web/js', message: `귀띔하는 가공품 ${m[1]}의 가공법이 없다`});
  }
  /* 결정 D-906: 선물 답례로 배우는 가공법 (gift_recipes.csv → TABLES.GIFT_RECIPES).
     그 인물이 그 지역에 있는지(npcs.csv 지역 또는 전체), 배우는 키를 가공대가 알아보는지(bag.js recipeKnown 의 gift:), 그리고
     귀띔도 선물도 없이 직접 찾아야만 하는 숨은 가공법이 몇인지 본다 (그건 막힘이 아니라 검토용이다). */
  const npcRegion = Object.fromEntries(readCsv(root, 'npcs.csv').map(r => [r.id, r['지역']]));
  const gifts = sandbox.TABLES.GIFT_RECIPES || [];
  for (const g of gifts) {
    if (npcRegion[g.npc] !== g.region && npcRegion[g.npc] !== '전체')
      findings.push({rule: 'craft-gift', severity: '높음', file: 'design/data/gift_recipes.csv', message: `${g.id}: ${g.npc}는 ${g.region}에 없는 인물이다 (npcs.csv 지역 ${npcRegion[g.npc]})`});
  }
  if (gifts.length && !/knows\(\s*['"]gift:['"]\s*\+/.test(src.find(s => s.file.endsWith('engine/bag.js'))?.text || ''))
    findings.push({rule: 'craft-gift', severity: '높음', file: 'prototypes/web/js/engine/bag.js', message: '선물 답례로 배운 가공법(gift:)을 가공대가 알아보지 못한다'});
  for (const r of recipes) if (r.hidden && !hinted.has(r.out) && !gifts.some(g => g.out === r.out))
    warn.push({rule: 'craft-teach', severity: '검토', file: 'design/data/gift_recipes.csv', message: `숨은 가공법 ${ITEMS[r.out]?.n || r.out}는 일러 주는 인물(귀띔·선물 답례)이 없어 직접 찾아야만 한다`});
  return {recipes: recipes.length, findings, warnings: warn};
}

module.exports = {checkCraft};
if (require.main === module) {
  const r = checkCraft(path.resolve(__dirname, '../../../..'));
  console.log('가공법 ' + r.recipes + '개');
  for (const f of [...r.findings, ...r.warnings]) console.log(`[${f.severity}] ${f.message}`);
  process.exit(r.findings.length ? 1 : 0);
}
