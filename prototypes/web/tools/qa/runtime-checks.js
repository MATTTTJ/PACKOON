'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { installHooks, collectHookFindings } = require('./hooks');

const regions = ['galchamgol', 'dolneomeo', 'jangteo', 'yeongsan'];
const result = (name, findings, evidence, summary) => ({ name, status: findings.length ? 'fail' : 'pass', summary, findings, evidence });
const failure = (rule, message, extra = {}) => ({ rule, severity: '높음', message, ...extra });
const write = (outDir, name, data) => {
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, name);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return file;
};
async function visible(browser, selector) {
  return browser.eval(`!!document.querySelector(${JSON.stringify(selector)})?.getClientRects().length`);
}
async function tap(browser, selector) {
  if (browser.touch) return browser.touch(selector);
  const p = await browser.eval(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await browser.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, radiusX: 2, radiusY: 2, force: 1, id: 1 }] });
  await browser.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
async function holdTouch(browser, selector, predicate, timeout = 15000) {
  const p = await browser.eval(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await browser.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, radiusX: 2, radiusY: 2, force: 1, id: 1 }] });
  try { await browser.until(predicate, { timeout, label: `터치 이동 ${selector}` }); }
  finally { await browser.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
}
async function fresh(browser, rules, mobile = false) {
  await browser.navigate(browser.url);
  await browser.eval('localStorage.clear()');
  await browser.reload();
  await installHooks(browser, rules);
  await browser.until("!!document.querySelector('#tsNew')?.getClientRects().length", { timeout: 15000, label: '첫 화면' });
  const click = mobile ? tap : (b, s) => b.click(s);
  await click(browser, '#tsNew');
  await click(browser, '#btnStart');
  await browser.until('G.started && !G.ended', { timeout: 10000, label: '새 게임' });
  await readStartLetter(browser, mobile);
}
// 결정 D-704: 출발 쪽지는 화면 가운데에 펼쳐지고 아이의 독백 대화로 읽는다. 끝까지 넘기고 쪽지가 접혀 사라질 때까지 기다린다
async function readStartLetter(browser, mobile = false, label = '') {
  await browser.until("G.f.momNoteSeen && !document.querySelector('#dlg').hidden && !!document.querySelector('.mom-letter')", { timeout: 10000, label: label + '출발 쪽지 독백' });
  const press = async () => { if (mobile) await tap(browser, '#dlg'); else await browser.key('e'); await browser.wait(120); };
  await browser.advanceDialogue({ press });
  await browser.until("!document.querySelector('.mom-letter')", { timeout: 5000, label: label + '출발 쪽지 접힘' });
}

async function runEdges({ outDir, evidence = [] }) {
  const records = evidence.flatMap(item => item.edges || item.hooks?.edges || []);
  const findings = [];
  for (const row of records.filter(row => row.state === 'fail')) findings.push(failure('edge-movement', `${row.region}/${row.from} → ${row.to}: 방향키를 누르고 건넜지만 도착 뒤 이동하지 않았다.`, { scene: row, severity: '보통' }));
  for (const region of regions) {
    if (!records.some(row => row.region === region && row.state === 'pass')) findings.push(failure('edge-coverage', `${region}: 가장자리 전환 뒤 방향키를 유지한 이동 사례를 확인하지 못했다.`, { severity: '미확인' }));
  }
  const file = write(outDir, 'edges.json', { records, classic: 'classic은 구역 가장자리 전환을 쓰지 않으므로 해당 없음', findings });
  for (const f of findings) Object.assign(f, { evidence: file, expected: '확장판 네 지역에서 방향키를 누른 채 가장자리를 넘어 도착 뒤에도 같은 방향으로 걷는다.',
    steps: ['확장판 새 게임으로 해당 지역까지 연속 플레이한다.', '지역 구역의 가장자리까지 방향키를 누르고 도착 뒤 12프레임 이상 유지한다.'], reproductions: '이번 실행 1회', environment: { viewport: '1280×720', input: 'CDP 실제 방향키', start: '새 게임 연속 플레이' } });
  return result('edges', findings, [file], `${records.filter(row => row.state === 'pass').length}회 도착 뒤 이동 확인, 확장판 네 지역을 대조했다.`);
}

async function runSave({ browser, outDir, rules }) {
  const findings = [], steps = [], evidence = [];
  let reloadCompleted = false, corruptCompleted = false;
  const step = text => steps.push(text);
  try {
    await fresh(browser, rules);
    step('1. 빈 격리 저장에서 새 게임을 시작하고 엄마 쪽지를 닫는다.');
    const acorn=await browser.eval("fieldItems('pickups').find(a=>a.item==='acorn'&&!a.got&&a.y===fieldGround())");
    if(!acorn)throw Error('저장 시험용 바닥 도토리가 없다.');
    await browser.key('ArrowRight', 'keyDown');
    try { await browser.until('G.px >= '+acorn.x, { timeout: 10000, label: '저장 전 도토리로 이동' }); }
    finally { await browser.key('ArrowRight', 'keyUp'); }
    await browser.wait(100);await browser.key('x');await browser.wait(650);
    await browser.click('#btnSaveHud');
    const stored = await browser.eval("JSON.parse(localStorage.getItem('packoon-save-v1'))");
    if (!stored?.G?.started || !(stored.G.inv.acorn >= 1)) throw new Error('중간 수동 저장에 줍기 결과가 없다.');
    step('2. 도토리 앞으로 걸어가 Z 키로 줍고 화면의 저장 버튼을 누른다.');
    await browser.reload();
    await installHooks(browser, rules);
    await browser.until("!!document.querySelector('#tsContinue')?.getClientRects().length", { timeout: 15000, label: '이어서 하기 버튼' });
    await browser.click('#tsContinue');
    await browser.until('G.started', { timeout: 10000, label: '이어서 하기' });
    const restored = await browser.eval('JSON.parse(JSON.stringify(G))');
    // README의 쪽지 규칙: 칸이 없으면 첫 지역은 0단계로 읽는다. 복원기가 정상적으로 채우는 칸이다.
    const stable = g => ({ region: g.region, zone: g.zone, inv: g.inv, tool: g.tool, awake: g.awake, clues: g.clues,
      diary: g.diary, learned: g.learned, rel: g.rel, nicknames: g.nicknames, ledger: g.ledger,
      f: { ...g.f, momNoteFade: g.f.momNoteFade ?? Math.max(0, regions.indexOf(g.region)) } });
    if (JSON.stringify(stable(stored.G)) !== JSON.stringify(stable(restored))) findings.push(failure('save-reload', '중간 저장과 이어서 하기의 보따리·가보·호감·기록·진행값이 다르다.', { expected: stable(stored.G), actual: stable(restored) }));
    if (Math.abs(restored.px - stored.G.px) > 1 || restored.py !== stored.G.py) findings.push(failure('save-position', '이어서 하기의 필드 위치가 저장 위치와 다르다.', { expected: [stored.G.px, stored.G.py], actual: [restored.px, restored.py] }));
    step('3. 같은 출처·프로필에서 새로고침 후 이어서 하기를 눌러 위치와 소지품·기록을 대조한다.');
    reloadCompleted = true;
    const image = path.join(outDir, 'save-restored.png'); await browser.screenshot(image); evidence.push(image);
    await browser.eval("localStorage.setItem('packoon-save-v1','{broken json')");
    await browser.reload();
    await installHooks(browser, rules);
    await browser.until("!!document.querySelector('#tsNew')?.getClientRects().length", { timeout: 15000, label: '손상 저장 시작' });
    if (await visible(browser, '#tsContinue')) findings.push(failure('save-corrupt-continue', '깨진 JSON인데 이어서 하기 버튼이 보인다.'));
    await browser.click('#tsNew'); await browser.click('#btnStart');
    await browser.until('G.started && G.region === "galchamgol"', { timeout: 10000, label: '손상 저장 뒤 새 게임' });
    if (!(await browser.eval('readSave() === null'))) findings.push(failure('save-corrupt-read', '손상 JSON을 유효한 저장으로 읽었다.'));
    corruptCompleted = true;
    // 옛 코드로 만든 저장 표본이 그대로 읽혀야 한다 (fixtures/old-saves.json).
    const oldSaves = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'old-saves.json'), 'utf8')).saves;
    const oldResults = await browser.eval(`(${JSON.stringify(oldSaves)}).map(s=>{localStorage.setItem('packoon-save-v1',s);const want=JSON.parse(s).G;const loaded=loadSave();const errors=[];if(!loaded||G.region!==want.region)errors.push('지역');if(JSON.stringify(G.inv)!==JSON.stringify(want.inv.dad_tag?want.inv:{...want.inv,dad_tag:1}))errors.push('소지품');for(const [key,value]of Object.entries(want.f))if(JSON.stringify(G.f[key])!==JSON.stringify(value))errors.push('진행 '+key);if(!G.floorItems||typeof G.floorItems!=='object')errors.push('새 바닥칸');return {region:want.region,errors};})`);
    oldResults.forEach((r, i) => { if (r.errors.length) findings.push(failure('save-old-format', `옛 저장 표본 ${i + 1}(${r.region}): ${r.errors.join(', ')} 복원 오류.`)); });
    await browser.eval("localStorage.removeItem('packoon-save-v1')");
    step('4. localStorage 저장값을 깨진 JSON으로 바꾸고 새로고침한 뒤 새 게임을 시작한다.');
    evidence.push(write(outDir, 'save-state.json', { start: '빈 격리 프로필의 새 게임', origin: browser.url, steps, stored, restored, oldResults, corruptNewGame: {region:'galchamgol',started:corruptCompleted} }));
  } catch (error) {
    findings.push(failure('save-execution', error.message, { steps }));
    const image = path.join(outDir, 'save-failure.png'); await browser.screenshot(image).catch(() => {}); evidence.push(image);
  }
  for (const f of findings) Object.assign(f, { evidence, steps: (f.steps || steps).map(s => s.replace(/^\d+\.\s*/, '')), reproductions: '이번 실행 1회',
    environment: { url: browser.url, viewport: '1280×720', input: 'CDP 실제 키·마우스', start: '빈 격리 저장에서 새 게임' } });
  return result('save', findings, evidence, `중간 저장 왕복 ${reloadCompleted ? '완료' : '미완료'}, 손상 JSON 뒤 새 게임 ${corruptCompleted ? '완료' : '미완료'}, 문제 ${findings.length}건. 옛 저장 표본 확인 포함.`);
}

/* Scrollable panels are intentional. Only clipped/escaping text, not their scroll range, is a failure. */
function measureScene(selectors) {
  const roots = selectors.map(s => document.querySelector(s)).filter(Boolean);
  const isVisible = e => {
    if (!e.getClientRects().length) return false;
    const c = getComputedStyle(e), r = e.getBoundingClientRect();
    return c.visibility !== 'hidden' && c.display !== 'none' && r.width > 0 && r.height > 0;
  };
  const identify = e => e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().replace(/\s+/g, '.') : '') + (e.dataset.k ? '[data-k="' + e.dataset.k + '"]' : '');
  // 선택지가 없는 대화는 #dlg 전체가 터치로 다음 줄을 여는 표적이다.
  const buttons = [...new Set(roots.flatMap(root => [...(root.id === 'dlg' ? [root] : []), ...root.querySelectorAll('button,[role="button"],input:not([type="hidden"])')]))].filter(isVisible).map(e => {
    const r = e.getBoundingClientRect(); return { selector: identify(e), text: (e.textContent || e.getAttribute('aria-label') || '').trim(), disabled: !!e.disabled, width: +r.width.toFixed(2), height: +r.height.toFixed(2), x: +r.x.toFixed(2), y: +r.y.toFixed(2) };
  });
  const overflow = [];
  for (const root of roots) for (const e of [root, ...root.querySelectorAll('*')]) {
    if (!isVisible(e) || ['CANVAS', 'SVG', 'PATH', 'INPUT'].includes(e.tagName) || !e.textContent.trim()) continue;
    const css = getComputedStyle(e);
    // inline 요소는 clientWidth가 0일 수 있다. 글이 든 부모 상자에서 넘침을 판정한다.
    if (css.display === 'inline' || (!e.clientWidth && !e.clientHeight)) continue;
    const x = e.scrollWidth > e.clientWidth + 2 && !['auto', 'scroll'].includes(css.overflowX);
    const y = e.scrollHeight > e.clientHeight + 2 && !['auto', 'scroll'].includes(css.overflowY);
    if (x || y) overflow.push({ selector: identify(e), text: e.textContent.trim().slice(0, 120), client: [e.clientWidth, e.clientHeight], scroll: [e.scrollWidth, e.scrollHeight], axes: [x ? 'x' : '', y ? 'y' : ''].filter(Boolean) });
  }
  return { viewport: [innerWidth, innerHeight], coarse: matchMedia('(pointer:coarse)').matches, roots: roots.filter(isVisible).length, buttons, overflow };
}

/* 결정 D-380·D-382: 휴대폰 단추 배치를 잰다. 단추 상자, 방향 판과 오른손 묶음, 필드면 주인공 자리, 전투면 싸움 상자와 보스 자리(화면 좌표). */
function measureLayout() {
  const vis = e => { if (!e || !e.getClientRects().length) return false; const c = getComputedStyle(e); if (c.visibility === 'hidden' || c.display === 'none') return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const rect = e => { const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
  const name = e => e.id ? '#' + e.id : e.dataset.k ? '[data-k="' + e.dataset.k + '"]' : e.dataset.form !== undefined ? '[data-form="' + e.dataset.form + '"]' : e.tagName.toLowerCase() + '.' + String(e.className).trim().replace(/\s+/g, '.');
  const buttons = [...document.querySelectorAll('#pad button,.hud-btns button,#battle button')].filter(vis).map(e => ({ id: name(e), text: (e.textContent || '').trim().slice(0, 16), disabled: !!e.disabled, r: rect(e) }));
  const out = { viewport: [innerWidth, innerHeight], buttons, dpad: vis($('dpad')) ? rect($('dpad')) : null, acts: vis(document.querySelector('.acts-core')) ? rect(document.querySelector('.acts-core')) : null };
  if (B) {
    const c = $('bcv').getBoundingClientRect(), sx = c.width / LW, sy = c.height / LH;
    out.box = { x: c.x + BOX.x * sx, y: c.y + BOX.y * sy, w: BOX.w * sx, h: BOX.h * sy };
    // 보스 자리: 가운데 40% 폭, 보스 눈높이(EY) 조금 위부터 싸움 상자 위까지
    out.boss = { x: c.x + LW * 0.3 * sx, y: c.y + (EY - LH * 0.12) * sy, w: LW * 0.4 * sx, h: (BOX.y - EY + LH * 0.12) * sy };
  } else {
    const c = $('cv').getBoundingClientRect(), sx = c.width / W, sy = c.height / H;
    out.hero = { x: c.x + (G.px - cam - 8) * sx, y: c.y + (G.py - 24) * sy, w: 16 * sx, h: 24 * sy };
  }
  return out;
}
const LAYOUT_SIZES = [[360, 780], [390, 844], [412, 915], [844, 390], [740, 360]];
const LAYOUT_BOSSES = ['kudzu', 'golem', 'dokkaebi', 'gangcheol'];
const overlap = (a, b, slack = 1) => a.x + slack < b.x + b.w && b.x + slack < a.x + a.w && a.y + slack < b.y + b.h && b.y + slack < a.y + a.h;
function judgeLayout(scene, m, findings) {
  const [vw, vh] = m.viewport, at = { scene, viewport: vw + '×' + vh };
  for (const b of m.buttons) {
    if (!b.disabled && (b.r.w < 44 || b.r.h < 44)) findings.push(failure('mobile-layout', `${scene}: ${b.id} '${b.text}' 단추가 ${b.r.w}×${b.r.h}px로 44px보다 작다.`, { ...at, button: b }));
    if (b.r.x < -1 || b.r.y < -1 || b.r.x + b.r.w > vw + 1 || b.r.y + b.r.h > vh + 1) findings.push(failure('mobile-layout', `${scene}: ${b.id} '${b.text}' 단추가 화면 밖으로 나갔다.`, { ...at, button: b }));
  }
  for (let i = 0; i < m.buttons.length; i++) for (let j = i + 1; j < m.buttons.length; j++) {
    const a = m.buttons[i], b = m.buttons[j];
    if (overlap(a.r, b.r)) findings.push(failure('mobile-layout', `${scene}: ${a.id} '${a.text}'와 ${b.id} '${b.text}' 단추가 겹친다.`, { ...at, a, b }));
  }
  // 두 손 사이: 방향 판 오른쪽 끝과 오른손 묶음 왼쪽 끝 사이가 엄지 하나(48px)보다 넓어야 한다
  if (m.dpad && m.acts && m.acts.x - (m.dpad.x + m.dpad.w) < 48) findings.push(failure('mobile-layout', `${scene}: 방향 판과 오른손 단추 사이가 ${(m.acts.x - m.dpad.x - m.dpad.w).toFixed(1)}px로 엄지 하나(48px)보다 좁다.`, { ...at, dpad: m.dpad, acts: m.acts }));
  const pad = m.buttons.filter(b => /^\[data-k|^#pad/.test(b.id));
  if (m.hero) for (const b of pad) if (overlap(b.r, m.hero)) findings.push(failure('mobile-layout', `${scene}: ${b.id} '${b.text}' 단추가 화면 가운데의 주인공을 덮는다.`, { ...at, button: b, hero: m.hero }));
  if (m.box) for (const b of m.buttons) {
    if (overlap(b.r, m.box)) findings.push(failure('mobile-layout', `${scene}: ${b.id} '${b.text}' 단추가 싸움 상자를 덮는다.`, { ...at, button: b, box: m.box }));
    else if (overlap(b.r, m.boss)) findings.push(failure('mobile-layout', `${scene}: ${b.id} '${b.text}' 단추가 보스 자리를 덮는다.`, { ...at, button: b, boss: m.boss }));
  }
}
async function runMobileLayout(browser, outDir, findings, evidence, steps) {
  const records = [];
  for (const [w, h] of LAYOUT_SIZES) {
    await browser.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: true });
    await browser.navigate(browser.url); await browser.eval('localStorage.clear()'); await browser.reload();
    await browser.until("!!document.querySelector('#tsNew')?.getClientRects().length", { timeout: 15000, label: w + '×' + h + ' 첫 화면' });
    await tap(browser, '#tsNew'); await tap(browser, '#btnStart');
    await readStartLetter(browser, true, w + '×' + h + ' ');
    // 주인공을 길 가운데쯤에 세우고 카메라가 따라오게 둔다 (주인공이 화면 가운데 근처에 있을 때 단추가 덮지 않아야 한다)
    await browser.eval('G.px=Math.min(fieldWidth()-260,640);G.cam=clamp(G.px-W*.42,0,Math.max(0,fieldWidth()-W))');
    await browser.wait(400);
    const field = await browser.eval(`(${measureLayout.toString()})()`);
    judgeLayout(`필드 ${w}×${h}`, field, findings); records.push({ scene: 'field', w, h, ...field });
    const fieldImage = path.join(outDir, `mobile-layout-field-${w}x${h}.png`); await browser.screenshot(fieldImage); evidence.push(fieldImage);
    const bosses = (w === 390 || w === 412) ? ['golem'] : LAYOUT_BOSSES;
    for (const kind of bosses) {
      // 도구 둘, 변신 넷(가장 많을 때)으로 전투를 연다
      await browser.eval(`G.tool='sickle';G.f.battleTools=['pickaxe'];G.forms=['squirrel','goat','owl','deer'];refreshFormUi();startBattle('${kind}',()=>{})`);
      await browser.until("B&&B.st!=='intro'", { timeout: 9000, label: kind + ' 전투 시작' }).catch(() => {});
      await browser.wait(300);
      const battle = await browser.eval(`(${measureLayout.toString()})()`);
      judgeLayout(`전투 ${kind} ${w}×${h}`, battle, findings); records.push({ scene: 'battle-' + kind, w, h, ...battle });
      const image = path.join(outDir, `mobile-layout-${kind}-${w}x${h}.png`); await browser.screenshot(image); evidence.push(image);
      if (w === 390 && kind === 'golem') {
        // 결정 D-383: 도구 단추로 낫↔곡괭이. 결정 D-384: 패드 '선물'이 선물 창을 열거나 다음 빈틈으로 미룬다
        const before = await browser.eval('B.tool'); await tap(browser, '#padTool');
        if (await browser.eval('B.tool') === before) findings.push(failure('mobile-layout', '전투 도구 단추를 눌러도 든 도구가 바뀌지 않는다.', { before }));
        await tap(browser, '#padJump');
        if (!await browser.eval("!!(B.giftQueued||!$('bGiftMenu').hidden)")) findings.push(failure('mobile-layout', "전투 패드의 '선물'을 눌러도 선물 창이 열리지도, 다음 빈틈으로 미뤄지지도 않는다."));
        if (!await browser.eval("$('bGiftMenu').hidden")) await tap(browser, '#bGiftClose');
      }
      await browser.eval("bEnd('flee')");
      await browser.until("!$('bResult').hidden", { timeout: 9000, label: kind + ' 전투 끝 창' });
      await browser.eval("$('bResOk').click()"); await browser.until('!B', { timeout: 5000, label: kind + ' 전투 닫기' });
    }
    if (w === 390) {
      // 결정 D-381: 구르기 단추를 누르는 동안 구른다. 결정 D-380: 방향 판은 떼지 않고 ◀에서 ▶로 밀면 방향이 바뀐다
      await browser.eval('G.px=Math.min(fieldWidth()-260,640)');await browser.wait(200);
      await holdTouch(browser, '#padRoll', 'rolling', 3000).catch(e => findings.push(failure('mobile-layout', '구르기 단추를 눌러도 구르지 않는다: ' + e.message)));
      await browser.wait(200);
      const l = await browser.eval("(()=>{const r=document.querySelector('#dpad [data-k=\"left\"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
      const r = await browser.eval("(()=>{const r=document.querySelector('#dpad [data-k=\"right\"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
      await browser.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...l, radiusX: 2, radiusY: 2, force: 1, id: 1 }] });
      const leftOn = await browser.eval('touch.left&&!touch.right');
      await browser.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...r, radiusX: 2, radiusY: 2, force: 1, id: 1 }] });
      const rightOn = await browser.eval('touch.right&&!touch.left');
      await browser.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      const off = await browser.eval('!touch.left&&!touch.right');
      if (!leftOn || !rightOn || !off) findings.push(failure('mobile-layout', '방향 판을 ◀에서 ▶로 밀어도 방향이 바뀌지 않거나, 떼어도 멈추지 않는다.', { leftOn, rightOn, off }));
    }
  }
  steps.push('4. 360×780·390×844·412×915·844×390·740×360 에서 필드와 보스 전투의 단추 겹침, 두 손 사이, 주인공·싸움 상자·보스 자리 가림을 잰다. 구르기 단추·방향 판 밀기·전투 도구·선물 단추를 눌러 본다.');
  evidence.push(write(outDir, 'mobile-layout.json', records));
  return records.length;
}

// 잴 장면 목록. 손일 미니게임은 PA-46에서 빠져 휴대폰 장면에서도 뺐다. 하나라도 못 재면 실패로 본다.
const MOBILE_SCENES = ['title', 'prologue', 'bag', 'dialog'];
async function runMobile({ browser, outDir, rules }) {
  const findings = [], scenes = [], evidence = [], steps = [];
  let layoutScenes = 0;
  async function measure(name, selectors) {
    const data = await browser.eval(`(${measureScene.toString()})(${JSON.stringify(selectors)})`);
    scenes.push({ name, ...data });
    if (!data.roots || !data.buttons.length) findings.push(failure('mobile-coverage', `${name}: 표시된 검사 상자나 버튼이 없어 이 장면을 측정하지 못했다.`, {scene:name,actual:data}));
    const image = path.join(outDir, `mobile-${name}.png`);
    const sceneSteps = ['390×844 터치 에뮬레이션과 빈 격리 저장에서 첫 화면을 연다.',
      ...(['prologue', 'bag', 'dialog'].includes(name) ? ['새로 시작을 누른다.'] : []),
      ...(['bag', 'dialog'].includes(name) ? ['길을 나서기를 누르고 엄마 쪽지 독백을 넘긴다.'] : []),
      ...(name === 'bag' ? ['보따리 버튼을 누른다.'] : []),
      ...(name === 'dialog' ? ['오른쪽 터치 버튼을 유지해 마을 x803까지 걷고 말걸기를 누른다.'] : [])];
    const context = { evidence: image, steps: sceneSteps, reproductions: '이번 실행 1회', environment: { url: browser.url, viewport: '390×844, DPR 1', input: 'CDP 실제 터치', start: '빈 격리 저장, 확장판 새 게임' } };
    if (!data.coarse || data.viewport[0] !== 390 || data.viewport[1] !== 844) findings.push(failure('mobile-emulation', `${name}: 390×844 터치 화면 조건이 맞지 않는다.`, { actual: data }));
    // 비활성 빈칸은 측정 기록에 남기되 아직 누를 수 있는 터치 표적으로 세지 않는다.
    for (const b of data.buttons) if (!b.disabled && (b.width < 44 || b.height < 44)) findings.push(failure('touch-target', `${name}: ${b.selector} '${b.text}' 터치 버튼이 ${b.width}×${b.height}px로 44×44px보다 작다.`, { ...context, severity: '보통', scene: name, element: b, expected: '너비와 높이 모두 44px 이상', actual: { width: b.width, height: b.height } }));
    for (const e of data.overflow) findings.push(failure('mobile-overflow', `${name}: ${e.selector} 글이 요소 상자 밖으로 넘친다.`, { ...context, severity: '보통', scene: name, element: e, expected: '글이 요소 상자 안에 표시되거나 스크롤로 읽을 수 있다.', actual: e }));
    await browser.screenshot(image); evidence.push(image);
  }
  try {
    await browser.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await browser.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await browser.navigate(browser.url); await browser.eval('localStorage.clear()'); await browser.reload(); await installHooks(browser, rules);
    await browser.until("!!document.querySelector('#tsNew')?.getClientRects().length", { timeout: 15000, label: '휴대폰 첫 화면' });
    steps.push('1. 390×844, 터치 에뮬레이션, 빈 저장에서 첫 화면을 연다.');
    await measure('title', ['#titleScene']);
    await tap(browser, '#tsNew'); await measure('prologue', ['#titleScreen']);
    await tap(browser, '#btnStart');
    await readStartLetter(browser, true, '휴대폰 ');
    const acorn=await browser.eval("fieldItems('pickups').find(a=>a.item==='acorn'&&!a.got&&a.y===fieldGround())");
    if(!acorn)throw Error('휴대폰 줍기 시험용 도토리가 없다.');
    await holdTouch(browser, '#pad [data-k="right"]', 'G.px >= '+acorn.x);
    await tap(browser, '#pad [data-k="atk"]');
    await browser.until('(G.inv.acorn||0)>=1', { timeout: 5000, label: '휴대폰 휘두르기 버튼으로 도토리 줍기' });
    steps.push('휘두르기 터치 버튼으로 바닥 도토리를 직접 줍는다.');
    await tap(browser, '#pad [data-k="bag"]');
    await browser.until("!document.querySelector('#bag').hidden", { timeout: 5000, label: '휴대폰 보따리' });
    await measure('bag', ['#bag']); await tap(browser, '#bagClose');
    steps.push('2. 터치로 새 게임을 시작하고 출발 쪽지 독백을 넘긴 뒤 보따리를 연다.');
    await holdTouch(browser, '#pad [data-k="right"]', 'G.px >= 803');
    await tap(browser, '#padTalk');
    await browser.until("!document.querySelector('#dlg').hidden", { timeout: 5000, label: '까치 대화' });
    await measure('dialog', ['#dlg']);
    await browser.advanceDialogue({ stop: 'choices', press: () => tap(browser, '#dlg') });
    await tap(browser, '#dlgChoices button:first-child');
    // 손일은 미니게임 없이 바로 마치고 대화가 이어진다 (PA-46).
    await browser.until("!document.querySelector('#dlg').hidden", { timeout: 5000, label: '보자기 손일 뒤 까치 대화' });
    steps.push('3. 오른쪽 터치 버튼을 누른 채 늙은 까치에게 걸어가 말걸기를 누르고, 대화 뒤 보자기 손일을 고른다 (바로 마침).');
    const hooks = await collectHookFindings(browser);
    for (const f of hooks.speakers) findings.push(f);
    layoutScenes = await runMobileLayout(browser, outDir, findings, evidence, steps);
  } catch (error) {
    findings.push(failure('mobile-execution', error.message, { steps }));
    const image = path.join(outDir, 'mobile-failure.png'); await browser.screenshot(image).catch(() => {}); evidence.push(image);
  } finally {
    await browser.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }).catch(() => {});
  }
  const missing = MOBILE_SCENES.filter(n => !scenes.some(s => s.name === n));
  if (layoutScenes === 0) missing.push('layout');
  if (missing.length) findings.push(failure('mobile-coverage', '휴대폰 장면을 다 재지 못했다: ' + missing.join(', '), { expected: MOBILE_SCENES, actual: scenes.map(s => s.name) }));
  evidence.push(write(outDir, 'mobile-measurements.json', { input: 'CDP 실제 touchStart/touchEnd, 진행값·위치 주입 없음', steps, scenes, findings }));
  for (const f of findings) if (!f.environment) Object.assign(f, { evidence, steps: (f.steps || steps).map(s => s.replace(/^\d+\.\s*/, '')), reproductions: '이번 실행 1회',
    environment: { url: browser.url, viewport: '390×844, DPR 1', input: 'CDP 실제 터치', start: '빈 격리 저장, 확장판 새 게임' } });
  return result('mobile', findings, evidence, `390×844 터치 화면 ${scenes.length}/${MOBILE_SCENES.length}장면 측정, 배치 ${layoutScenes}장면(화면 크기 5), 배치 문제 ${findings.filter(f => f.rule === 'mobile-layout').length}건, 작은 버튼 ${findings.filter(f => f.rule === 'touch-target').length}건, 글 넘침 ${findings.filter(f => f.rule === 'mobile-overflow').length}건. 실기기 조작감은 미확인이다.`);
}

/* 결정 D-702: 대화 중 ESC. 예전엔 대화가 중간에 끊긴 채 미리 세운 진행값만 남아 인물이 다음 단계로 건너뛰었다.
   1) 단풍골 날쌘 첫 만남(진행값을 먼저 세우고 말하는 대화)에서 줄마다 ESC 를 눌러도 같은 줄이 남고, 중간 줄에는 '보따리 펼치기'가 없는지 본다.
   2) 네 지역 모든 구역의 인물·길손·조사에 말을 걸고 앞 몇 줄마다 ESC 를 눌러 대화·진행값·보따리가 그대로인지 본다. */
async function runTalkEsc({ browser, outDir, rules }) {
  const findings = [], steps = [];
  const state = "({dlg:!$('dlg').hidden,t:$('dlgText').textContent,ch:$('dlgChoices').children.length,f:JSON.stringify(G.f),inv:JSON.stringify(G.inv),panel:!$('bag').hidden||!$('trade').hidden||!$('notebook').hidden,quick:!!document.querySelector('.trade-quick:not([hidden])'),left:dlgQ.length})";
  const settle = async () => {
    for (let i = 0; i < 40 && await browser.eval('inkOn||zoneFade>0||!!zoneMotion'); i++) await browser.wait(60);
    await browser.eval("if(B){B=null;$('battle').hidden=true;document.body.classList.remove('in-battle');}if(!$('dlg').hidden)dlgDismiss();closePanels();");
  };
  let lines = 0, things = 0;
  try {
    await fresh(browser, rules);steps.push('새 게임, 출발 쪽지 독백을 넘김');
    await browser.eval("changeZone('forge',{x:100})");await browser.until("G.zone==='forge'&&!zoneFade&&!zoneMotion", { label: '대장간 길' });
    await browser.eval("(()=>{const p=fieldNpcs().find(p=>p.id==='nal');G.px=p.x;interactWith(p,'npc');})()");steps.push('날쌘에게 처음 말을 건다');
    for (let i = 0; i < 12; i++) {
      const a = await browser.eval(state);if (!a.dlg) break;
      if (a.left && a.quick) findings.push(failure('talk-esc-quick', '날쌘 첫 만남 중간 줄에 보따리 펼치기 단추가 떠 있다: ' + a.t));
      await browser.key('Escape');await browser.wait(80);
      const c = await browser.eval(state);
      if (!c.dlg || c.t !== a.t) { findings.push(failure('talk-esc', `날쌘 첫 만남 ${i + 1}번째 줄에서 ESC 로 대화가 바뀌거나 닫혔다: ${a.t}`));break; }
      if (a.ch) break;
      await browser.key('e');await browser.wait(80);
    }
    const menu = await browser.eval(state);
    if (!menu.dlg || !menu.ch) findings.push(failure('talk-esc', '날쌘 첫 만남을 끝까지 들은 뒤 고르기 대화로 이어지지 않았다: ' + menu.t));
    for (const region of regions) {
      await browser.navigate(browser.url.replace(/\?.*$/, '') + '?region=' + region);
      await browser.eval("TitleScreen.close();startGame();G.f.momNoteSeen=true;closePanels();");
      const zones = await browser.eval('REG.zones?Object.keys(REG.zones):[null]');
      for (const zone of zones) {
        await settle();
        if (zone) { await browser.eval(`changeZone(${JSON.stringify(zone)},{x:100})`);await browser.until(`G.zone===${JSON.stringify(zone)}&&!zoneFade&&!zoneMotion`, { label: region + '/' + zone }); }
        const list = await browser.eval("[...fieldNpcs().map(p=>['npc',p.id]),...zoneObjects('wanderers').map(p=>['wanderers',p.id]),...zoneObjects('examines').map(p=>['examines',p.id])]");
        for (const [kind, id] of list) {
          await settle();things++;
          const opened = await browser.eval(`(()=>{const all={npc:fieldNpcs(),wanderers:zoneObjects('wanderers'),examines:zoneObjects('examines')};const p=all[${JSON.stringify(kind)}].find(p=>p.id===${JSON.stringify(id)});if(!p)return false;G.px=p.x;interactWith(p,${JSON.stringify(kind)});return !$('dlg').hidden;})()`);
          if (!opened) continue;
          for (let i = 0; i < 6; i++) {
            const a = await browser.eval(state);if (!a.dlg) break;lines++;
            await browser.key('Escape');await browser.wait(60);
            const c = await browser.eval(state);
            if (!c.dlg || c.t !== a.t || c.f !== a.f || c.inv !== a.inv || c.panel) {
              findings.push(failure('talk-esc', `${region}/${zone || '-'} ${kind} ${id}: ${i + 1}번째 줄에서 ESC 뒤 대화·진행값·보따리가 바뀌었다: ${a.t.slice(0, 40)}`, { scene: { region, zone, kind, id } }));break;
            }
            if (a.ch) break;   // 고르기는 사람이 고른다. ESC 로 지나가지 않는 것만 본다
            await browser.key('e');await browser.wait(60);
            if (await browser.eval("!!B||inkOn||!$('trade').hidden||!$('bag').hidden||!!openMinigame()")) break;
          }
        }
      }
    }
  } catch (error) {
    findings.push(failure('talk-esc-execution', error.message, { steps }));
    const image = path.join(outDir, 'talk-esc-failure.png'); await browser.screenshot(image).catch(() => {});
  }
  const file = write(outDir, 'talk-esc.json', { steps, things, lines, findings });
  return result('talk-esc', findings, [file], `날쌘 첫 만남 줄마다 ESC, 네 지역 말 걸 거리 ${things}곳의 대사 ${lines}줄에서 ESC 를 눌러 보았다`);
}

module.exports = { runEdges, runSave, runMobile, runTalkEsc, measureScene, judgeLayout };
