'use strict';

/* This file is injected only by QA. It observes game functions; it never grants items or progress. */
function hookSource(rules) {
  return `(${installInPage.toString()})(${JSON.stringify(rules)})`;
}

function installInPage(rules) {
  if (window.__qaRuntime) return;
  const data = window.__qaRuntime = { lines: [], speakers: [], portraits: [], edges: [], edgePending: 0 };
  // 검사할 엔진의 keys와 별도로 실제 입력 이벤트를 관찰해야 키 초기화 회귀를 잡을 수 있다.
  const physicalKeys = new Set();
  addEventListener('keydown', e => physicalKeys.add(e.key.toLowerCase()), true);
  addEventListener('keyup', e => physicalKeys.delete(e.key.toLowerCase()), true);
  addEventListener('blur', e => { if (e.target === window) physicalKeys.clear(); }, true);
  const physicalHeld = direction => direction === 1
    ? physicalKeys.has('arrowright') || physicalKeys.has('d')
    : physicalKeys.has('arrowleft') || physicalKeys.has('a');
  const blockingScene = () => [
    open('dlg') && '대화', open('bag') && '보따리', open('notebook') && '수첩',
    !!openMinigame() && '미니게임', !!B && '전투', inkOn && '먹 전환', !!vistaMode && '경치', G.ended && '지역 종료'
  ].filter(Boolean);
  let currentTalk = { stack: '', number: 0 };
  const origin = stack => {
    const match = String(stack).match(/(?:https?:\/\/[^\s)]+)?(\/prototypes\/web\/[^\s):]+):(\d+):(\d+)/);
    return match ? { file: match[1].slice(1).split('?')[0], line: Number(match[2]) } : {};
  };
  const allowed = (list, speaker, stack) => (list || []).some(row => {
    if (row.name && row.name !== speaker) return false;
    if (row.pattern && !new RegExp(row.pattern).test(speaker)) return false;
    if (row.stackPattern && !new RegExp(row.stackPattern).test(stack)) return false;
    if (row.region && row.region !== G.region) return false;
    if (row.zone && row.zone !== G.zone) return false;
    if (row.panel && document.getElementById(row.panel)?.hidden !== false) return false;
    if (row.condition) {
      try { if (!eval(row.condition)) return false; } catch (_) { return false; }
    }
    return !!row.reason;
  });
  function observe(line) {
    if (!line || typeof line[0] !== 'string') return;
    const speaker = line[0], text = String(line[1]);
    const visible = [...fieldNpcs(), ...zoneObjects('wanderers')].filter(n => typeof n.draw === 'function').flatMap(n => [n.name, ...(n.speakers || [])]).filter(Boolean);
    const row = { region: G.region, zone: G.zone, x: G.px, y: G.py, speaker, text, visible,
      talk: currentTalk.number, stack: currentTalk.stack, ...origin(currentTalk.stack) };
    data.lines.push(row);
    // 결정 D-162: 너구리·지문이 아닌 화자는 초상(인물 그림)이 있어야 한다. 없으면 주인공 얼굴이 나온다.
    if (speaker !== '너구리' && !/^[（(]/.test(speaker) && typeof portraitNpc === 'function' && !portraitNpc(speaker))
      data.portraits.push({ ...row, rule: 'speaker-portrait', severity: '보통',
        message: `${G.region}/${G.zone || 'classic'}: '${speaker}' 화자의 초상 그림이 없어 주인공 얼굴이 나온다. 대사: ${text}` });
    const s = rules.speakers || {};
    if (visible.includes(speaker) || allowed(s.global, speaker, row.stack) || allowed(s.recordPatterns, speaker, row.stack) ||
        allowed(s.stageDirectionPatterns, speaker, row.stack) || allowed(s.drawActors, speaker, row.stack) || allowed(s.minigame, speaker, row.stack)) return;
    data.speakers.push({ ...row, rule: 'speaker-location', severity: '낮음',
      message: `${G.region}/${G.zone || 'classic'}: '${speaker}' 화자가 현재 구역 인물 목록에 없다. 대사: ${text}` });
  }
  /* 결정 D-1413: 걸어 다니는 동안 채집 자리와 말 걸기·살피기 자리가 한꺼번에 닿는 곳을 모은다 (엔진은 가까운 하나만 안내하지만, 자리는 떼어 둔다).
     처음 상태만 보는 map 검사(spacing-checks.js)와 달리 이야기가 진행되며 옮겨 오거나 새로 나타난 인물도 잡는다. 캐고 난 자리는 보지 않는다. */
  data.clashes = [];
  const clashSeen = new Set();
  (function sampleClash() {
    try {
      if (G && G.started && !G.ended && !paused() && typeof nearDig === 'function') {
        const n = nearInteraction(), d = nearDig();
        if (n && d && !d.cache) {
          const other = n.id || n.label || interactionKind(n), key = G.region + '/' + G.zone + '/' + (d.id || d.item) + '/' + other;
          if (!clashSeen.has(key)) { clashSeen.add(key); data.clashes.push({ rule: 'gather-prompt-clash', severity: '보통', region: G.region, zone: G.zone, dig: d.id || d.item, digX: Math.round(d.x), other, kind: interactionKind(n), otherX: Math.round(n.x), heroX: Math.round(G.px),
            message: G.region + '/' + (G.zone || 'classic') + ': 채집 자리 ' + (d.id || d.item) + '(x ' + Math.round(d.x) + ')에 섰을 때 ' + interactionKind(n) + ' ' + other + '(x ' + Math.round(n.x) + ')도 닿는다. 둘 중 하나를 옮긴다.' }); }
        }
      }
    } catch (_) {}
    requestAnimationFrame(sampleClash);
  })();
  const originalTalk = talk;
  talk = function (...args) {
    currentTalk = { stack: new Error('QA talk origin').stack, number: currentTalk.number + 1 };
    return originalTalk.apply(this, args);
  };
  const originalShowLine = showLine;
  showLine = function (...args) {
    const line = dlgQ[0];
    const result = originalShowLine.apply(this, args);
    if (line) observe(line);
    return result;
  };
  const originalChangeZone = changeZone;
  changeZone = function (to, arrival = {}) {
    const from = G.zone, region = G.region, direction = arrival.edgeDirection;
    const held = [1, -1].includes(direction) && physicalHeld(direction);
    const engineHeld = direction === 1 ? !!isRight() : direction === -1 ? !!isLeft() : false;
    const result = originalChangeZone.apply(this, arguments);
    if (!result || ![1, -1].includes(direction)) return result;
    const row = { region, from, to, direction, heldAtCrossing: held, engineHeldAtCrossing: engineHeld, arrivalX: G.px, samples: [], state: 'pending' };
    data.edges.push(row); data.edgePending++;
    let frames = 0, settled = 0, startX = G.px;
    function sample() {
      frames++;
      if (G.region !== region || G.zone !== to || frames > 180) {
        row.state = 'unverified'; row.reason = '도착 구역이 바뀌거나 전환이 180프레임 안에 끝나지 않았다.'; data.edgePending--; return;
      }
      if (zoneMotion || zoneFade) { requestAnimationFrame(sample); return; }
      const stillHeld = direction === 1 ? !!isRight() : !!isLeft();
      if (!settled) startX = G.px;
      row.samples.push({ x: G.px, vx: G.vx, held: stillHeld, physicalHeld: physicalHeld(direction), blockedBy: blockingScene() });
      settled++;
      if (settled < 12) { requestAnimationFrame(sample); return; }
      row.endX = G.px; row.delta = (G.px - startX) * direction;
      const interruption = [...new Set(row.samples.flatMap(s => s.blockedBy))];
      row.state = interruption.length ? 'unverified' : held && row.samples.every(s => s.physicalHeld)
        ? (row.delta > 1 && row.samples.every(s => s.held) ? 'pass' : 'fail') : 'unverified';
      if (row.state === 'unverified') row.reason = interruption.length
        ? '도착 뒤 필드가 멈춘 장면: ' + interruption.join(', ')
        : '실제 keyup·blur 등으로 도착 뒤 12프레임 동안 방향키를 유지하지 않았다.';
      data.edgePending--;
    }
    requestAnimationFrame(sample);
    return result;
  };
}

async function installHooks(browser, rules) {
  await browser.eval(hookSource(rules));
}

async function collectHookFindings(browser) {
  return browser.eval('window.__qaRuntime || {lines:[],speakers:[],portraits:[],edges:[],edgePending:0}');
}

/* 결정 D-162: 코드에 적힌 모든 대사 줄(['화자','대사'…])의 화자 이름. 실행하지 않은 갈래의 화자도 초상을 확인하려고 모은다.
   대사 배열 안에서만 찾는다(앞 글자가 [ 또는 ], 또는 withPic( ). rules.speakers.portraitIgnore 는 대사가 아닌 같은 모양의 배열. */
function speakerNames(root, rules) {
  const fs = require('fs'), path = require('path');
  const base = path.join(root, 'prototypes/web/js'), files = [];
  (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (f !== 'data') walk(p); } else if (p.endsWith('.js')) files.push(p); } })(base);
  const ignore = new Set((rules.speakers?.portraitIgnore || []).map(r => r.name));
  const names = new Map(), re = /(?:\[|\],|withPic\()\s*\[\s*'([^'\\\n]{1,14})'\s*,\s*['`]/g;
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8'); let m;
    while ((m = re.exec(src))) {
      const name = m[1];
      if (/^[a-z_0-9 .:#-]+$/i.test(name) || name === '너구리' || /^[（(]/.test(name) || ignore.has(name) || names.has(name)) continue;
      names.set(name, path.relative(root, file).replace(/\\/g, '/') + ':' + src.slice(0, m.index).split('\n').length);
    }
  }
  return names;
}

/* 모은 화자 이름마다 초상이 있는지 브라우저에서 본다 (지금 상태에서 찾지 못하면 실패) */
async function portraitFindings(browser, root, rules) {
  const names = speakerNames(root, rules);
  const missing = await browser.eval('(' + JSON.stringify([...names.keys()]) + ').filter(n => !portraitNpc(n))');
  return { checked: names.size, findings: missing.map(name => {
    const [file, line] = names.get(name).split(':');
    return { rule: 'speaker-portrait', severity: '보통', speaker: name, file, line: Number(line),
      message: `'${name}' 화자의 초상 그림이 없다(대화에서 주인공 얼굴이 나온다). 처음 나오는 곳: ${names.get(name)}` };
  }) };
}

module.exports = { hookSource, installHooks, collectHookFindings, speakerNames, portraitFindings };
