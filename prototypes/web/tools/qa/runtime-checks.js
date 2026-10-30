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
async function until(browser, expression, timeout = 10000, label = expression) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await browser.eval(expression)) return;
    await browser.wait(50);
  }
  throw new Error(`${label}: ${timeout / 1000}초 안에 도달하지 못했다.`);
}
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
  try { await until(browser, predicate, timeout, `터치 이동 ${selector}`); }
  finally { await browser.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
}
async function fresh(browser, rules, mobile = false) {
  await browser.navigate(browser.url);
  await browser.eval('localStorage.clear()');
  await browser.reload();
  await installHooks(browser, rules);
  await until(browser, "!!document.querySelector('#tsNew')?.getClientRects().length", 15000, '첫 화면');
  const click = mobile ? tap : (b, s) => b.click(s);
  await click(browser, '#tsNew');
  await click(browser, '#btnStart');
  await until(browser, 'G.started && !G.ended', 10000, '새 게임');
  await until(browser, "!document.querySelector('#bag').hidden", 10000, '출발 쪽지');
  await click(browser, '#bagClose');
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
    try { await until(browser, 'G.px >= '+acorn.x, 10000, '저장 전 도토리로 이동'); }
    finally { await browser.key('ArrowRight', 'keyUp'); }
    await browser.wait(100);await browser.key('x');await browser.wait(650);
    await browser.click('#btnSaveHud');
    const stored = await browser.eval("JSON.parse(localStorage.getItem('packoon-save-v1'))");
    if (!stored?.G?.started || !(stored.G.inv.acorn >= 1)) throw new Error('중간 수동 저장에 줍기 결과가 없다.');
    step('2. 도토리 앞으로 걸어가 Z 키로 줍고 화면의 저장 버튼을 누른다.');
    await browser.reload();
    await installHooks(browser, rules);
    await until(browser, "!!document.querySelector('#tsContinue')?.getClientRects().length", 15000, '이어서 하기 버튼');
    await browser.click('#tsContinue');
    await until(browser, 'G.started', 10000, '이어서 하기');
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
    await until(browser, "!!document.querySelector('#tsNew')?.getClientRects().length", 15000, '손상 저장 시작');
    if (await visible(browser, '#tsContinue')) findings.push(failure('save-corrupt-continue', '깨진 JSON인데 이어서 하기 버튼이 보인다.'));
    await browser.click('#tsNew'); await browser.click('#btnStart');
    await until(browser, 'G.started && G.region === "galchamgol"', 10000, '손상 저장 뒤 새 게임');
    if (!(await browser.eval('readSave() === null'))) findings.push(failure('save-corrupt-read', '손상 JSON을 유효한 저장으로 읽었다.'));
    corruptCompleted = true;
    // 옛 코드로 만든 저장 표본이 그대로 읽혀야 한다 (fixtures/old-saves.json).
    const oldSaves = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'old-saves.json'), 'utf8')).saves;
    const oldResults = await browser.eval(`(${JSON.stringify(oldSaves)}).map(s=>{localStorage.setItem('packoon-save-v1',s);const want=JSON.parse(s).G;const loaded=loadSave();const errors=[];if(!loaded||G.region!==want.region)errors.push('지역');if(JSON.stringify(G.inv)!==JSON.stringify(want.inv))errors.push('소지품');for(const [key,value]of Object.entries(want.f))if(JSON.stringify(G.f[key])!==JSON.stringify(value))errors.push('진행 '+key);if(!G.floorItems||typeof G.floorItems!=='object')errors.push('새 바닥칸');return {region:want.region,errors};})`);
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

// 잴 장면 목록. 손일 미니게임은 PA-46에서 빠져 휴대폰 장면에서도 뺐다. 하나라도 못 재면 실패로 본다.
const MOBILE_SCENES = ['title', 'prologue', 'bag', 'dialog'];
async function runMobile({ browser, outDir, rules }) {
  const findings = [], scenes = [], evidence = [], steps = [];
  async function measure(name, selectors) {
    const data = await browser.eval(`(${measureScene.toString()})(${JSON.stringify(selectors)})`);
    scenes.push({ name, ...data });
    if (!data.roots || !data.buttons.length) findings.push(failure('mobile-coverage', `${name}: 표시된 검사 상자나 버튼이 없어 이 장면을 측정하지 못했다.`, {scene:name,actual:data}));
    const image = path.join(outDir, `mobile-${name}.png`);
    const sceneSteps = ['390×844 터치 에뮬레이션과 빈 격리 저장에서 첫 화면을 연다.',
      ...(['prologue', 'bag', 'dialog'].includes(name) ? ['새로 시작을 누른다.'] : []),
      ...(['bag', 'dialog'].includes(name) ? ['단풍골로 떠나기를 누르고 엄마 쪽지를 닫는다.'] : []),
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
    await until(browser, "!!document.querySelector('#tsNew')?.getClientRects().length", 15000, '휴대폰 첫 화면');
    steps.push('1. 390×844, 터치 에뮬레이션, 빈 저장에서 첫 화면을 연다.');
    await measure('title', ['#titleScene']);
    await tap(browser, '#tsNew'); await measure('prologue', ['#titleScreen']);
    await tap(browser, '#btnStart');
    await until(browser, "!document.querySelector('#bag').hidden", 10000, '휴대폰 출발 쪽지');
    await tap(browser, '#bagClose');
    const acorn=await browser.eval("fieldItems('pickups').find(a=>a.item==='acorn'&&!a.got&&a.y===fieldGround())");
    if(!acorn)throw Error('휴대폰 줍기 시험용 도토리가 없다.');
    await holdTouch(browser, '#pad [data-k="right"]', 'G.px >= '+acorn.x);
    await tap(browser, '#pad [data-k="atk"]');
    await until(browser, '(G.inv.acorn||0)>=1', 5000, '휴대폰 휘두르기 버튼으로 도토리 줍기');
    steps.push('휘두르기 터치 버튼으로 바닥 도토리를 직접 줍는다.');
    await tap(browser, '#pad [data-k="bag"]');
    await until(browser, "!document.querySelector('#bag').hidden", 5000, '휴대폰 보따리');
    await measure('bag', ['#bag']); await tap(browser, '#bagClose');
    steps.push('2. 터치로 새 게임을 시작하고 출발 쪽지를 닫은 뒤 보따리를 연다.');
    await holdTouch(browser, '#pad [data-k="right"]', 'G.px >= 803');
    await tap(browser, '#padTalk');
    await until(browser, "!document.querySelector('#dlg').hidden", 5000, '까치 대화');
    await measure('dialog', ['#dlg']);
    for (let i = 0; i < 8; i++) {
      if (await browser.eval("!!document.querySelector('#dlgChoices button')")) break;
      await tap(browser, '#dlg');
    }
    await tap(browser, '#dlgChoices button:first-child');
    // 손일은 미니게임 없이 바로 마치고 대화가 이어진다 (PA-46).
    await until(browser, "!document.querySelector('#dlg').hidden", 5000, '보자기 손일 뒤 까치 대화');
    steps.push('3. 오른쪽 터치 버튼을 누른 채 늙은 까치에게 걸어가 말걸기를 누르고, 대화 뒤 보자기 손일을 고른다 (바로 마침).');
    const hooks = await collectHookFindings(browser);
    for (const f of hooks.speakers) findings.push(f);
  } catch (error) {
    findings.push(failure('mobile-execution', error.message, { steps }));
    const image = path.join(outDir, 'mobile-failure.png'); await browser.screenshot(image).catch(() => {}); evidence.push(image);
  } finally {
    await browser.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }).catch(() => {});
  }
  const missing = MOBILE_SCENES.filter(n => !scenes.some(s => s.name === n));
  if (missing.length) findings.push(failure('mobile-coverage', '휴대폰 장면을 다 재지 못했다: ' + missing.join(', '), { expected: MOBILE_SCENES, actual: scenes.map(s => s.name) }));
  evidence.push(write(outDir, 'mobile-measurements.json', { input: 'CDP 실제 touchStart/touchEnd, 진행값·위치 주입 없음', steps, scenes, findings }));
  for (const f of findings) if (!f.environment) Object.assign(f, { evidence, steps: (f.steps || steps).map(s => s.replace(/^\d+\.\s*/, '')), reproductions: '이번 실행 1회',
    environment: { url: browser.url, viewport: '390×844, DPR 1', input: 'CDP 실제 터치', start: '빈 격리 저장, 확장판 새 게임' } });
  return result('mobile', findings, evidence, `390×844 터치 화면 ${scenes.length}/${MOBILE_SCENES.length}장면 측정, 작은 버튼 ${findings.filter(f => f.rule === 'touch-target').length}건, 글 넘침 ${findings.filter(f => f.rule === 'mobile-overflow').length}건. 실기기 조작감은 미확인이다.`);
}

module.exports = { runEdges, runSave, runMobile, measureScene };
