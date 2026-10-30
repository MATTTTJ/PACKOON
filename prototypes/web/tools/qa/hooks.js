'use strict';

/* This file is injected only by QA. It observes game functions; it never grants items or progress. */
function hookSource(rules) {
  return `(${installInPage.toString()})(${JSON.stringify(rules)})`;
}

function installInPage(rules) {
  if (window.__qaRuntime) return;
  const data = window.__qaRuntime = { lines: [], speakers: [], edges: [], edgePending: 0 };
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
    const visible = [...fieldNpcs(), ...zoneObjects('wanderers')].filter(n => typeof n.draw === 'function').map(n => n.name).filter(Boolean);
    const row = { region: G.region, zone: G.zone, x: G.px, y: G.py, speaker, text, visible,
      talk: currentTalk.number, stack: currentTalk.stack, ...origin(currentTalk.stack) };
    data.lines.push(row);
    const s = rules.speakers || {};
    if (visible.includes(speaker) || allowed(s.global, speaker, row.stack) || allowed(s.recordPatterns, speaker, row.stack) ||
        allowed(s.stageDirectionPatterns, speaker, row.stack) || allowed(s.drawActors, speaker, row.stack) || allowed(s.minigame, speaker, row.stack)) return;
    data.speakers.push({ ...row, rule: 'speaker-location', severity: '낮음',
      message: `${G.region}/${G.zone || 'classic'}: '${speaker}' 화자가 현재 구역 인물 목록에 없다. 대사: ${text}` });
  }
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
  return browser.eval('window.__qaRuntime || {lines:[],speakers:[],edges:[],edgePending:0}');
}

module.exports = { hookSource, installHooks, collectHookFindings };
