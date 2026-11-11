'use strict';
/* 결정 D-890·D-892: 할 일(퀘스트) 순서 검사.
   1) 화면의 할 일 칸에는 목표만, 수첩 '해야 할 일'에는 목표 밑에 길잡이가 나오는지.
   2) 다음 단계의 일을 퀘스트가 열리기 전에 미리 해 둔 판(물건을 먼저 구함, 김 올리기를 중간에 그만둠 등)에서
      할 일이 이미 한 일을 다시 시키지 않고 바로 다음 단계를 알리는지. 진행값을 직접 세워 본다(대화는 돌리지 않는다). */
const fs = require('node:fs');
const path = require('node:path');

const scenes = [
  // 단풍골
  { region: 'galchamgol', label: '새 게임', goal: /당산나무 가는 길/, guide: /길을 아는 이/ },
  { region: 'galchamgol', label: '도담을 만나기 전에 도토리 가루부터 빻아 둠', f: { dodamTalk: true }, inv: { powder: 1 }, guide: /도담에게 건네/ },
  { region: 'galchamgol', label: '삼촌이 다람쥐를 보고 오라며 잎을 미뤄 둠', f: { dodamTalk: true, dodamDone: true, musoeMet: true, musoeTested: true, leafHeld: true }, guide: /다람쥐/, notGuide: /잎/ },
  { region: 'galchamgol', label: '날쌘을 만나기 전에 숯을 먼저 구함', f: { dodamTalk: true, dodamDone: true, musoeMet: true, musoeTested: true, leafGiven: true, musoeAfterLeaf: true }, inv: { coal: 1 }, guide: /삼촌께 갖다드리/ },
  // 돌너머
  { region: 'dolneomeo', label: '뿔영감을 만나기 전에 메밀가루를 갈아 둠', f: { kkuTalk: true, kkuAwake: true, kkuDone: true, ppuriMet: true }, inv: { memil_powder: 1 }, awake: ['maetdol'], goal: /돌산 길/, guide: /뿔영감님께 건네/ },
  { region: 'dolneomeo', label: '할배를 뵙기 전에 결명자를 먼저 구함', f: { kkuTalk: true, kkuAwake: true, kkuDone: true, ppuriMet: true }, inv: { gyeolmyeongja: 1 }, guide: /결명자 차/ },
  { region: 'dolneomeo', label: '맷돌이 깨기 전에 메밀 셋을 주워 둠', f: { kkuTalk: true, kkuAwake: true, kkuDone: true, ppuriMet: true, nalDDone: true, dolsoeTea: true, stackDone: true }, inv: { memil: 3 }, awake: ['maetdol'], guide: /맷돌에 갈아/ },
  // 큰 장터
  { region: 'jangteo', label: '떡집에 가기 전에 쌀가루 셋을 갈아 둠', f: { bueongNight: true }, inv: { ssal_powder: 3 }, goal: /떡 찌는 법/, guide: /떡집/ },
  { region: 'jangteo', label: '떡집을 만난 뒤 쌀가루 셋이 이미 있음', f: { bueongNight: true, morakMet: true, yeotMet: true, yeotDone: true }, inv: { ssal_powder: 3 }, guide: /모였다/ },
  { region: 'jangteo', label: '쌀가루를 건넨 뒤 김 올리기를 그만둠 (예전엔 맷돌에 쌀 갈기가 다시 떴다)', f: { bueongNight: true, morakMet: true, morakPowder: true, yeotMet: true, yeotDone: true }, inv: { ssal: 5 }, goal: /떡 찌는 법/, guide: /김 올리/, notGuide: /맷돌/ },
  { region: 'jangteo', label: '시루가 깬 뒤 쌀이 다 떨어짐 (예전엔 쌀 갈기만 떴다)', f: { bueongNight: true, morakMet: true, morakPowder: true, steamDone: true, yeotMet: true, yeotDone: true }, inv: { pat: 1 }, awake: ['siru'], goal: /떡 재료/, guide: /엿방울/, notGuide: /맷돌에 갈아/ },
  { region: 'jangteo', label: '시루가 깨기 전에 팥과 쌀가루를 미리 구해 둠', f: { bueongNight: true, morakMet: true, morakPowder: true, steamDone: true, yeotMet: true, yeotDone: true }, inv: { pat: 1, ssal_powder: 2 }, awake: ['siru'], goal: /팥시루떡/, guide: /시루에 넣어/ },
  { region: 'jangteo', label: '낮에 팥시루떡을 다 쪄 둠', f: { bueongNight: true, morakMet: true, morakPowder: true, steamDone: true, night: false }, inv: { patsirutteok: 1 }, awake: ['siru'], goal: /고사떡/, guide: /밤/ },
  // 결정 D-1440: 도깨비 뒤엔 홍시 약떡이 아니라 행수의 셈과 상단 행렬이다
  { region: 'jangteo', label: '도깨비를 잡은 그믐밤', f: { bueongNight: true, bueongDone: true, morakMet: true, morakPowder: true, steamDone: true, yeotMet: true, yeotDone: true, night: true, jxSangdanCleared: true }, awake: ['siru'], boss: true, goal: /상단 셈/, guide: /아침/ },
  { region: 'jangteo', label: '설날 아침 행수의 셈을 받은 뒤', f: { bueongNight: true, bueongDone: true, morakMet: true, morakPowder: true, steamDone: true, yeotMet: true, yeotDone: true, night: false, jxSangdanCleared: true, jxSangdanPaid: true }, awake: ['siru'], boss: true, goal: /북쪽 영산/, guide: /행수/ },
  // 영산
  { region: 'yeongsan', label: '날쌘을 만나기 전에 설피 재료를 모아 둠', f: { nalYTalk: true }, inv: { darae_vine: 2, jip: 1 }, goal: /설피/, guide: /모였다/ },
  { region: 'yeongsan', label: '살금이를 만나기 전에 마가목 셋을 따 둠', f: { nalYTalk: true, seolpi: true, salgMet: true }, inv: { magamok: 3 }, guide: /살금이에게 건네/ },
];

async function runQuestOrder({ browser, outDir }) {
  const findings = [], checked = [];
  const fail = (rule, message, extra = {}) => findings.push({ rule, severity: '높음', message, ...extra });
  try {
    for (const s of scenes) {
      await browser.navigate(browser.url.replace(/\?.*$/, '') + '?region=' + s.region);
      await browser.until("typeof TitleScreen!=='undefined'&&typeof startGame==='function'", { timeout: 15000, label: '첫 화면 ' + s.region });
      const r = await browser.eval(`(()=>{TitleScreen.close();startGame();G.f.momNoteSeen=true;closePanels();if(!$('dlg').hidden)dlgDismiss();
        Object.assign(G.f,${JSON.stringify(s.f || {})});Object.assign(G.inv,${JSON.stringify(s.inv || {})});
        for(const a of ${JSON.stringify(s.awake || [])})if(!G.awake.includes(a))G.awake.push(a);
        ${s.boss ? 'G.boss.dead=true;' : ''}lastGoal='';refreshGoal();
        const raw=REG.goal(),p=mainGoalParts(),box=document.createElement('div');renderTodo(box);
        return {raw,goal:p.goal,guide:p.guide,hud:$('goal').textContent,todo:box.textContent};})()`);
      checked.push({ ...s, goal: String(s.goal || ''), guide: String(s.guide || ''), notGuide: String(s.notGuide || ''), result: r });
      const where = `${s.region} · ${s.label}`;
      if (!r.raw.includes('|')) fail('quest-guide', `${where}: 할 일에 길잡이가 없다 (목표만 한 줄): ${r.raw}`);
      if (s.goal && !s.goal.test(r.goal)) fail('quest-goal', `${where}: 목표가 ${s.goal} 이어야 하는데 "${r.goal}"`);
      if (s.guide && !s.guide.test(r.guide)) fail('quest-order', `${where}: 길잡이가 ${s.guide} 를 말해야 하는데 "${r.guide}"`);
      if (s.notGuide && s.notGuide.test(r.guide)) fail('quest-order', `${where}: 이미 한 일(${s.notGuide})을 다시 시킨다: "${r.guide}"`);
      if (r.guide && r.hud.includes(r.guide)) fail('quest-hud', `${where}: 화면 할 일 칸에 길잡이까지 나온다. 목표만 보여야 한다`);
      if (!r.hud.includes(r.goal)) fail('quest-hud', `${where}: 화면 할 일 칸에 목표 "${r.goal}" 가 없다: ${r.hud}`);
      if (r.guide && !r.todo.includes(r.guide)) fail('quest-todo', `${where}: 수첩 해야 할 일에 길잡이가 없다`);
    }
  } catch (error) {
    fail('quest-execution', error.message);
    await browser.screenshot(path.join(outDir, 'quest-order-failure.png')).catch(() => {});
  }
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, 'quest-order.json');
  fs.writeFileSync(file, JSON.stringify({ checked, findings }, null, 2) + '\n', 'utf8');
  return { name: 'quest-order', status: findings.length ? 'fail' : 'pass', findings, evidence: [file],
    summary: `네 지역 ${checked.length}가지 판에서 할 일 목표·길잡이와, 미리 해 둔 일을 다시 시키지 않는지 보았다` };
}

module.exports = { runQuestOrder, scenes };
