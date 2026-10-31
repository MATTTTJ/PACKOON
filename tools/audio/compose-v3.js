// 결정 D-106·D-107: 지역 곡의 선율을 기억에 남는 4마디 훅으로, 보스 곡 다섯을 150~172의 4박 몰이로 다시 쓴다.
// 모든 선율은 '이름의 노래' 동기(도·레·미·솔 오름과 레로 열린 끝)에서 나온다. 다른 게임 곡의 선율·리프·화성은 쓰지 않는다.
// 이 도구는 design/data/music/music.json의 해당 곡을 고쳐 쓴다. 한 번 돌린 뒤의 원본은 music.json이다.
//   node tools/audio/compose-v3.js   (그 뒤 node tools/audio/render.js --web-data)
'use strict';
const fs = require('fs'), path = require('path');
const FILE = path.resolve(__dirname, '../../design/data/music/music.json');
const raw = fs.readFileSync(FILE, 'utf8'), bom = raw.charCodeAt(0) === 0xFEFF;
const data = JSON.parse(bom ? raw.slice(1) : raw);

const NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const MODES = { pyeong: [0, 2, 4, 7, 9], gyemyeon: [0, 3, 5, 7, 10] };
// 도수(0=으뜸음, 5=한 옥타브 위 으뜸음) → 음 이름. base는 0도수의 옥타브.
function pitch(mode, base, deg) {
  const scale = MODES[mode], o = Math.floor(deg / 5), s = ((deg % 5) + 5) % 5;
  const midi = (base + 1 + o) * 12 + scale[s];
  return NAMES[midi % 12] + (Math.floor(midi / 12) - 1);
}
const r3 = x => Math.round(x * 1000) / 1000;
// [도수|'R', 길이(박), 세기] 목록 → 음표 문자열. 도수에 shift를 더하고 길이에 scale을 곱한다.
function notes(list, mode, base, opt = {}) {
  const { shift = 0, scale = 1, vel = 0.8, x = false } = opt;
  return list.map(([d, len, v]) => {
    const l = r3(len * scale);
    if (d === 'R') return 'R:' + l;
    const name = x ? 'X' : pitch(mode, base, d + shift);
    return `${name}:${l}:${(v ?? vel).toFixed(2)}`;
  });
}
const sum = list => list.reduce((n, n2) => n + n2[1], 0);
function check(list, beats, label) { if (Math.abs(sum(list) - beats) > 1e-6) throw new Error(label + ': 마디 길이 ' + sum(list) + ' ≠ ' + beats); return list; }

// 결정 D-107: 보스 곡 4/4 몰이 (design/data/decisions.csv)
/* ---------- 보스 곡: 4/4, 도입 4 + 반복 44마디 ---------- */
// 반복 구간: A 8 · B 8 · 쉼 4 · 몰아 올림 4 · A′ 8 · C 8 · 이음 4
const SECTIONS = [['A · 훅', 8], ['B · 주고받기', 8], ['쉼 · 숨 고르기', 4], ['몰아 올림', 4], ['A′ · 한 옥타브 위 훅', 8], ['C · 절정, 열린 끝음', 8], ['이음 · 처음으로', 4]];
const ROOTS = { A: [0, 0, 4, 3, 0, 0, 4, 1], B: [2, 2, 3, 3, 2, 2, 1, 1], S: [0, 0, 0, 0], U: [3, 3, 4, 4], A2: [0, 0, 4, 3, 0, 0, 4, 1], C: [0, 0, 3, 1, 0, 0, 3, 1], T: [0, 4, 3, 1], I: [0, 0, 0, 0] };
const ORDER = [['I', 4], ['A', 8], ['B', 8], ['S', 4], ['U', 4], ['A2', 8], ['C', 8], ['T', 4]];
// 동기 머리(0·1·2·3)를 16분음표로 쪼갠 훅. 둘째·넷째 마디는 레(1도수)로 열려 끝난다.
const HOOK = [
  [[0, .5], [1, .25], [2, .25], [3, .75], [2, .25], [3, .5], [4, .5], [3, .5], [2, .5]],
  [[5, .75], [4, .25], [3, .5], [2, .5], [1, 1.5], ['R', .5]],
  [[0, .5], [1, .25], [2, .25], [3, .75], [2, .25], [3, .5], [5, .5], [4, .5], [3, .5]],
  [[2, .75], [3, .25], [1, .5], [0, .5], [1, 2]]
];
const B_LEAD = [[[2, .5], [3, .5], [4, 1], ['R', 2]], [[5, .75], [4, .25], [3, 1], ['R', 2]], [[4, .5], [5, .5], [6, 1], ['R', 2]], [[3, .75], [2, .25], [1, 2], ['R', 1]]];
const B_ANSWER = [[['R', 2], [4, .25], [3, .25], [2, .25], [3, .25], [4, .5], [5, .5]], [['R', 2], [3, .25], [2, .25], [1, .25], [2, .25], [3, 1]], [['R', 2], [6, .25], [5, .25], [4, .25], [3, .25], [4, 1]], [['R', 3], [0, .25], [1, .25], [2, .25], [3, .25]]];
const BUILD = [[0, 1, 2, 3, 2, 3, 4, 3].map(d => [d, .5]), [1, 2, 3, 4, 3, 4, 5, 4].map(d => [d, .5]),
  [2, 3, 4, 5, 3, 4, 5, 6, 4, 5, 6, 7, 5, 6, 7, 8].map(d => [d, .25]), [['R', 2], [5, .5], [6, .5], [7, 1]]];
const CLIMAX = [[[5, 1.5], [6, .5], [7, 1], [8, 1]], [[7, 1.5], [6, .5], [5, 2]], [[5, 1], [4, .5], [3, .5], [4, 1], [5, 1]], [[3, 1.5], [2, .5], [1, 2]]];
const CLIMAX_END = [[3, 1], [2, 1], [1, 2]];
const TAG = [[[0, .5], [1, .25], [2, .25], [3, 1], ['R', 2]], [[3, .5], [4, .25], [5, .25], [6, 1], ['R', 2]],
  [[5, .25], [4, .25], [3, .25], [2, .25], [3, .25], [2, .25], [1, .25], [0, .25], ['R', 2]], [['R', 2], [1, 1.5], ['R', .5]]];   // 반복 끝 직전 반 박은 비워 활 소리가 이음새를 넘지 않게
const INTRO_LEAD = [[['R', 4]], [['R', 4]], [[0, .5], [1, .25], [2, .25], [3, 1], ['R', 2]], [['R', 2], [3, .5], [4, .5], [5, 1]]];

function leadMeasure(sec, i) {
  if (sec === 'I') return INTRO_LEAD[i];
  if (sec === 'A' || sec === 'A2') return HOOK[i % 4];
  if (sec === 'B') return B_LEAD[i % 4];
  if (sec === 'S') return [[[1, 4, .5]], [['R', 4]], [[3, 2, .5], [2, 2, .45]], [['R', 4]]][i];
  if (sec === 'U') return BUILD[i];
  if (sec === 'C') return i === 7 ? CLIMAX_END : CLIMAX[i % 4];
  return TAG[i];
}
function answerMeasure(sec, i, root) {
  if (sec === 'B') return B_ANSWER[i % 4];
  if (sec === 'A2') return HOOK[i % 4].map(([d, l]) => d === 'R' ? ['R', l] : [d - 2, l, .55]);   // 아래 도수로 겹치는 화음
  if (sec === 'A') return i % 4 === 3 ? [['R', 2], [3, .25], [2, .25], [1, .25], [0, .25], [1, 1]] : [['R', 4]];
  if (sec === 'C') return [[root + 2, 2, .5], [root + 3, 2, .45]];
  return [['R', 4]];
}
const OST = [0, 0, 5, 0, 0, 0, 3, 0, 0, 0, 5, 0, 3, 2, 1, 0];
function lowStringMeasure(sec, i, root) {
  if (sec === 'S' || (sec === 'I' && i < 2)) return [[root, 4, .55]];
  if (sec === 'I' && i === 2) return [0, 0, 5, 0, 0, 0, 3, 0].map((o, k) => [root + o, .5, k % 2 ? .45 : .62]);
  return OST.map((o, k) => [root + o, .25, k % 4 === 0 ? .8 : k % 2 ? .42 : .58]);
}
function bassMeasure(sec, i, root) {
  if (sec === 'T' && i === 3) return [[root, .5, .6], [root + 5, .5, .5], [root, .5, .6], [root + 3, .5, .5], [root, 1, .55], ['R', 1]];
  if (sec === 'S' || sec === 'I') return [['R', 4]];
  if (sec === 'U') return [[root, 1, .6], [root + 5, 1, .5], [root, 1, .6], [root + 3, 1, .5]];
  return [0, 5, 0, 3, 0, 5, 2, 3].map((o, k) => [root + o, .5, k % 2 ? .48 : .66]);
}
const ARP = [0, 2, 3, 5, 3, 2, 0, 2, 0, 2, 3, 5, 7, 5, 3, 2];
function arpMeasure(sec, i, root) {
  if (['A2', 'C'].includes(sec) || (sec === 'U' && i >= 2)) return ARP.map((o, k) => [root + o, .25, k % 4 === 0 ? .62 : .4]);
  if (sec === 'A') return ARP.map((o, k) => [root + o, .25, k % 4 === 0 ? .42 : .26]);
  return [['R', 4]];
}
// 타악: 'X' 소리
const phraseEnd = (sec, i, len) => (i + 1) % 4 === 0 || i === len - 1;
function kick(sec, i) {
  if (sec === 'I') return [[['R', 4]], [['R', 4]], [[0, 1, .6], [0, 1, .6], [0, 1, .7], [0, 1, .75]], Array.from({ length: 16 }, (_, k) => [0, .25, .3 + k * .04])][i];
  if (sec === 'S') return [[0, .5, .8], [0, 3.5, .5]];
  if (sec === 'U') return [[[0, 1, .65], [0, 1, .6], [0, 1, .65], [0, 1, .6]], Array.from({ length: 8 }, () => [0, .5, .65]), Array.from({ length: 8 }, (_, k) => [0, .5, .65 + k * .03]), Array.from({ length: 16 }, (_, k) => [0, .25, .5 + k * .028])][i];
  return [[0, .75, .9], [0, .75, .6], [0, .5, .7], [0, 1, .85], [0, .5, .7], [0, .5, .6]];
}
function snare(sec, i, len) {
  if (sec === 'I' || sec === 'S') return [['R', 4]];
  if (sec === 'U') return i < 2 ? [['R', 1], [0, 1, .6], ['R', 1], [0, 1, .6]] : Array.from({ length: 16 }, (_, k) => [0, .25, .35 + k * .035]);
  if (phraseEnd(sec, i, len)) return [['R', 1], [0, 1, .75], ['R', 1], [0, .25, .5], [0, .25, .58], [0, .25, .66], [0, .25, .74]];
  return [['R', 1], [0, 1, .78], ['R', 1], [0, 1, .78]];
}
function offbeat8(sec) { return ['I', 'S'].includes(sec) ? [['R', 4]] : Array.from({ length: 4 }, () => [['R', .5], [0, .5, .5]]).flat(); }
function lowHand(sec) { return ['I', 'S'].includes(sec) ? [['R', 4]] : [[0, 2.5, .6], [0, 1.5, .5]]; }
function fill16(sec, i, len) {
  if (sec === 'U' && i >= 2) return Array.from({ length: 16 }, (_, k) => [0, .25, .3 + k * .03]);
  return phraseEnd(sec, i, len) && !['I', 'S'].includes(sec) ? [['R', 3], [0, .25, .45], [0, .25, .5], [0, .25, .55], [0, .25, .6]] : [['R', 4]];
}
function hat8(sec) { return ['A2', 'C', 'U'].includes(sec) ? Array.from({ length: 8 }, (_, k) => [0, .5, k % 2 ? .35 : .55]) : [['R', 4]]; }
function off16(sec) { return ['A', 'A2', 'C'].includes(sec) ? Array.from({ length: 4 }, () => [['R', .5], [0, .25, .45], ['R', .25]]).flat() : [['R', 4]]; }
function crash(sec, i) { return i === 0 && !['I', 'T'].includes(sec) ? [[0, 4, .7]] : (sec === 'I' && i === 3 ? [['R', 3], [0, 1, .6]] : [['R', 4]]); }
function accent(sec) { return ['I', 'S'].includes(sec) ? [['R', 4]] : [[0, 2, .7], [0, 2, .6]]; }
function anvil(sec) { return ['I', 'S'].includes(sec) ? [['R', 4]] : [[0, 1, .75], ['R', .5], [0, .5, .5], [0, 1, .7], ['R', 1]]; }
function pad(sec, i) { return sec === 'T' && i === 3 ? [[0, 2, .3], ['R', 2]] : [[0, 4, sec === 'S' ? .45 : .3]]; }   // 반복 끝 직전엔 바람이 잦아들어 이음새가 튀지 않게

const ROLE = {
  lead: (s, i) => leadMeasure(s, i), answer: (s, i, r) => answerMeasure(s, i, r), bass: (s, i, r) => bassMeasure(s, i, r),
  low_string: (s, i, r) => lowStringMeasure(s, i, r), arp: (s, i, r) => arpMeasure(s, i, r),
  kick: (s, i) => kick(s, i), snare: (s, i, r, len) => snare(s, i, len), offbeat8: s => offbeat8(s), lowHand: s => lowHand(s),
  fill16: (s, i, r, len) => fill16(s, i, len), hat8: s => hat8(s), off16: s => off16(s), crash: (s, i) => crash(s, i),
  accent: s => accent(s), anvil: s => anvil(s), pad: (s, i) => pad(s, i)
};
// 성부 id → 역할, 음 높이 기준 옥타브
const BOSS = {
  boss_kudzu: { tempo: 158, mode: 'gyemyeon', name: '풀리지 않은 매듭', roles: { melody: ['lead', 4], answer: ['answer', 4], bass: ['bass', 2], janggu_low: ['lowHand'], janggu_high: ['offbeat8'], vine_stroke: ['fill16'], arp: ['arp', 3], low_string: ['low_string', 2], moduk_low: ['kick'], moduk_mid: ['snare'] },
    note: '덩굴이 매듭을 조이듯 16분음표 훅이 감겼다 풀린다. 아쟁 16분 오스티나토 위에 피리 훅, 해금이 빈자리를 받아친다.' },
  boss_golem: { tempo: 150, mode: 'pyeong', name: '깨어난 돌무더기', roles: { melody: ['lead', 4], answer: ['answer', 4], bass: ['bass', 2], rock: ['accent'], buk: ['kick'], jing: ['crash'], arp: ['arp', 3], low_string: ['low_string', 2], moduk_low: ['lowHand'], moduk_mid: ['snare'] },
    note: '돌이 구르듯 묵직한 4박 몰이. 돌 두드림이 첫 박과 셋째 박을 찍고 북이 몰아친다.' },
  boss_dokkaebi: { tempo: 172, mode: 'pyeong', name: '헌물 도깨비 놀음', roles: { melody: ['lead', 4], answer: ['answer', 4], bass: ['bass', 2], janggu_low: ['lowHand'], janggu_high: ['offbeat8'], roll: ['fill16'], small_gong: ['hat8'], scissors: ['off16'], arp: ['arp', 3], low_string: ['low_string', 2], moduk_low: ['kick'], moduk_mid: ['snare'] },
    note: '가장 빠른 곡. 꽹과리 8분 박과 엿가위 엇박이 장난치듯 튄다.' },
  boss_steel: { tempo: 165, mode: 'gyemyeon', name: '겨울을 붙든 이무기', roles: { melody: ['lead', 4], answer: ['answer', 4], bass: ['bass', 2], buk: ['kick'], cold_gong: ['crash'], winter_air: ['pad'], arp: ['arp', 3], low_string: ['low_string', 2], moduk_low: ['lowHand'], moduk_mid: ['snare'] },
    note: '마지막 보스. 해금 훅과 피리 응답이 맞서고, 쉼 구간에서 찬바람만 남았다가 몰아 올린다.' },
  trial_iron: { tempo: 150, mode: 'pyeong', name: '대장간의 시험', roles: { melody: ['lead', 4], bass: ['bass', 2], hammer: ['anvil'], buk: ['kick'], bellows: ['pad'], arp: ['arp', 3], low_string: ['low_string', 2], moduk_low: ['lowHand'], moduk_mid: ['snare'] },
    note: '삼촌의 훈육. 망치가 모루를 치는 박에 맞춰 해금 훅이 피했다 받아친다.' }
};
function rebuildBoss(track, spec) {
  const measures = ORDER.reduce((n, [, len]) => n + len, 0);
  track.tempo = spec.tempo; track.meter = [4, 4]; track.measures = measures; track.jangdan = '동살풀이·휘모리 (4박 몰이)';
  track.loop = { start: 4, end: measures }; track.intro = { start: 0, end: 4 }; track.playback = 'intro_loop';
  let at = 4; track.sections = [{ name: '도입 · 한 번만', from: 0, to: 4 }, ...SECTIONS.map(([name, len]) => { const s = { name, from: at, to: at + len }; at += len; return s; })];
  track.notes = spec.note + ' [D-107: 4/4, 도입 4 + 반복 44마디. 이름의 노래 머리(0·1·2·3)를 16분음표로 쪼갠 훅이며 다른 곡의 선율·리프는 쓰지 않는다]';
  for (const voice of track.voices) {
    const role = spec.roles[voice.id];
    if (!role) throw new Error(track.id + ': 역할 없는 성부 ' + voice.id);
    const [kind, base = 4] = role, x = !['lead', 'answer', 'bass', 'low_string', 'arp'].includes(kind);
    const patterns = {}, sequence = [], seen = new Map();
    for (const [sec, len] of ORDER) for (let i = 0; i < len; i++) {
      const root = ROOTS[sec][i % ROOTS[sec].length];
      const list = check(ROLE[kind](sec, i, root, len), 4, track.id + '/' + voice.id + '/' + sec + i);
      const tokens = notes(list, spec.mode, base, { x });
      const key = tokens.join(' ');
      if (!seen.has(key)) { const id = 'p' + seen.size; seen.set(key, id); patterns[id] = tokens; }
      sequence.push(seen.get(key));
    }
    voice.patterns = patterns; voice.sequence = sequence;
  }
}

// 결정 D-106: 지역 곡 선율을 4마디 훅으로 (design/data/decisions.csv)
/* ---------- 지역 곡: 선율·응답만 새 훅으로 (장단·북·저음은 그대로) ---------- */
// 12박 기준(중모리 3·3·3·3). 12/8은 길이를 반으로 쓴다.
const R12 = {
  h1: [[0, 1.5], [1, .5], [2, 1], [3, 2], [2, 1], [1, 1], [2, .5], [3, .5], [4, 1], [3, 2], ['R', 1]],
  h2: [[5, 1.5], [4, .5], [3, 1], [4, 1], [3, 1], [2, 1], [3, 1.5], [2, .5], [1, 1], [1, 2], ['R', 1]],
  h3: [[0, 1.5], [1, .5], [2, 1], [3, 2], [2, 1], [1, 1], [2, .5], [3, .5], [4, 1], [3, 1], [4, 1], [5, 1]],
  h4: [[6, 1.5], [5, .5], [4, 1], [3, 1], [4, 1], [3, 1], [2, 1.5], [1, .5], [2, 1], [1, 3]],
  b1: [[2, 3], [1, 1.5], [0, 1.5], [1, 3], [2, 3]],
  b2: [[3, 2], [4, 1], [3, 1.5], [2, 1.5], [1, 3], ['R', 3]],
  b3: [[2, 1.5], [3, 1.5], [4, 3], [5, 2], [4, 1], [3, 3]],
  b4: [[4, 1.5], [3, 1.5], [2, 3], [1, 3], ['R', 3]]
};
// 9/8(세마치 3·3·3) 4.5박
const R9 = {
  h1: [[0, 1], [1, .5], [2, 1], [3, .5], [4, 1.5]], h2: [[3, 1], [2, .5], [1, 1.5], [2, 1], ['R', .5]],
  h3: [[5, 1.5], [4, .5], [3, .5], [2, .5], [3, 1.5]], h4: [[2, 1], [1, .5], [0, .5], [1, 1], [1, 1.5]],
  b1: [[2, 1.5], [3, 1.5], [2, 1], [1, .5]], b2: [[0, 1.5], [1, .5], [2, .5], [3, .5], [2, 1.5]],
  b3: [[4, 1.5], [5, 1], [4, .5], [3, 1.5]], b4: [[2, 1], [3, .5], [1, 1.5], ['R', 1.5]]
};
const REGION = {
  danpunggol: { set: R12, scale: 1, form: ['h1', 'h2', 'h3', 'h4', 'b1', 'b2', 'b3', 'b4', 'h1', 'h2', 'h3', 'h4'], roots: [0, 0, 4, 1, 2, 3, 2, 1, 0, 0, 4, 1] },
  dolneomeo: { set: R9, scale: 1, form: ['h1', 'h2', 'h3', 'h4', 'h1', 'h2', 'h3', 'h4', 'b1', 'b2', 'b3', 'b4', 'b1', 'b2', 'b3', 'b4', 'h1', 'h2', 'h3', 'h4', 'h1', 'h2', 'h3', 'h4'], roots: [0, 0, 4, 1] },
  market_day: { set: R12, scale: .5, form: ['h1', 'h2', 'h3', 'h4', 'h1', 'h2', 'h3', 'h4', 'b1', 'b2', 'b3', 'b4', 'b1', 'b2', 'b3', 'b4', 'h1', 'h2', 'h3', 'h4', 'h1', 'h2', 'h3', 'h4'], roots: [0, 0, 4, 1] },
  market_night: { set: R12, scale: .5, form: ['b1', 'b2', 'b3', 'b4', 'h1', 'h2', 'h3', 'h4', 'b1', 'b2', 'b3', 'b4'], roots: [2, 3, 2, 1, 0, 0, 4, 1, 2, 3, 2, 1], vel: .62 }
};
function midiOf(token) { const m = /^([A-G])(#|b)?(-?\d)/.exec(token); if (!m) return null; return (Number(m[3]) + 1) * 12 + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); }
function baseOctave(voice) {
  const all = Object.values(voice.patterns).flat().map(midiOf).filter(n => n !== null).sort((a, b) => a - b);
  const median = all[Math.floor(all.length / 2)] ?? 60;
  return Math.round((median - 4) / 12) - 1;   // 동기의 가운데(미)가 원래 선율의 가운데에 오게
}
function rebuildRegion(track, spec) {
  const beats = track.meter[0] * 4 / track.meter[1], introLen = track.loop.start;
  for (const id of ['melody', 'answer']) {
    const voice = track.voices.find(v => v.id === id); if (!voice) continue;
    const base = baseOctave(voice) - (id === 'answer' ? 1 : 0);
    const keep = {}; for (let m = 0; m < introLen; m++) keep[voice.sequence[m]] = voice.patterns[voice.sequence[m]];
    const patterns = { ...keep }, sequence = voice.sequence.slice(0, introLen);
    spec.form.forEach((name, k) => {
      let list;
      if (id === 'melody') list = spec.set[name].map(([d, l]) => [d, l * spec.scale, spec.vel ?? .78]);
      else {
        // 응답: 반 마디씩 긴 음. 훅 끝(넷째 마디)에는 선율의 꼬리를 한 번 받아 준다.
        const root = spec.roots[k % spec.roots.length], half = beats / 2;
        list = k % 4 === 3 && name.startsWith('h') ? [['R', half], [root + 2, half / 2, .5], [root + 1, half / 2, .45]] : [[root + 2, half, .42], [root + 3, half, .38]];
      }
      check(list, beats, track.id + '/' + id + '/' + name);
      const pid = (id === 'melody' ? '' : 'a_') + name + (id === 'answer' ? '_' + k : '');
      patterns[pid] = notes(list, 'pyeong', base); sequence.push(pid);
    });
    voice.patterns = patterns; voice.sequence = sequence;
  }
  track.notes = (track.notes || '').replace(/ \[D-106[^\]]*\]$/, '') + ' [D-106: 선율을 4마디 훅(동기 머리 0·1·2·3과 레로 열린 끝)과 노래하는 응답 4마디로 다시 썼다]';
}

for (const t of data.tracks) {
  if (BOSS[t.id]) rebuildBoss(t, BOSS[t.id]);
  if (REGION[t.id]) rebuildRegion(t, REGION[t.id]);
}
fs.writeFileSync(FILE, (bom ? '﻿' : '') + JSON.stringify(data, null, 2) + '\n');
console.log('다시 썼다:', [...Object.keys(BOSS), ...Object.keys(REGION)].join(', '));
