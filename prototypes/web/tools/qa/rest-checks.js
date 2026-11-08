'use strict';
/* 결정 D-1301: 보스 앞 쉼터 검사. 네 지역 × (확장판, 옛 구성)마다
   1) 쉼터 앞에 서면 불이 켜지고 체력이 다 차며 쉼터 칸이 저장되는지
   2) 쉼터 뒤에 생긴 일(표시·물건·잃은 이름)이 있는 채로 보스에게 지면, 결과 창을 닫은 뒤 쉼터 불 앞에 그때 상태로 돌아오는지
      (쓰러진 횟수는 남고, 영산은 이름이 돌아오고 아빠 끌어내기 장면이 이어지는지)
   3) 물러나면 예전처럼 그 자리에 남고 진행도 그대로인지 */
const fs = require('node:fs');
const path = require('node:path');

const regions = {
  galchamgol: { zone: 'hill', start: 'startKudzu', kind: 'kudzu', flags: 'G.f.galKudzuSeen=true;G.barrier.cut=true;' },
  dolneomeo: { zone: 'shrine', start: 'startGolem', kind: 'golem', flags: 'G.f.ppuriPassed=true;G.f.dolGolemSeen=true;' },
  jangteo: { zone: 'warehouse', start: 'startDokkaebi', kind: 'dokkaebi', flags: 'G.f.guard=true;G.f.night=true;' },
  yeongsan: { zone: 'island', start: 'startGangcheol', kind: 'gangcheol',
    flags: "G.f.sangunMet=true;G.f.seolpi=true;G.f.shortcut=true;G.nicknames=[{id:'dol_stone_hand',text:'돌손',by:'돌쇠 할배',region:'dolneomeo',lost:false}];" },
};

async function runRest({ browser, outDir }) {
  const findings = [], checked = [];
  const fail = (rule, message) => findings.push({ rule, severity: '높음', message });
  const base = browser.url.replace(/\?.*$/, '');
  for (const mode of ['expanded', 'classic']) {
    for (const [id, s] of Object.entries(regions)) {
      const where = `${mode} · ${id}`;
      try {
        await browser.navigate(base + (mode === 'classic' ? '?classic=1' : ''));
        await browser.until("typeof TitleScreen!=='undefined'&&typeof startGame==='function'&&typeof restStep==='function'", { timeout: 15000, label: '첫 화면 ' + where });
        await browser.eval(`(()=>{localStorage.clear();TitleScreen.close();G=newGame('${id}');resetScreens();startGame();G.f.momNoteSeen=true;closePanels();dlgDismiss();
          ${s.flags}
          if(usesZones(REG)&&G.zone!=='${s.zone}'){G.zone='${s.zone}';resetScreens();}
          G.px=REG.rest.x-4;G.py=surfaceY(G.px);G.onGround=true;G.hp=1;return 1;})()`);
        await browser.until(`(dlgDismiss(),!!(G.f.restLit&&G.f.restLit['${id}']))`, { timeout: 6000, label: '쉼터 켜짐 ' + where });
        const lit = await browser.eval(`({hp:G.hp,max:G.maxhp,snap:!!localStorage.getItem(restKey())})`);
        if (lit.hp !== lit.max) fail('rest-heal', `${where}: 쉼터를 켰는데 체력이 다 차지 않았다 (${lit.hp}/${lit.max})`);
        if (!lit.snap) fail('rest-save', `${where}: 쉼터 칸이 저장되지 않았다`);
        const jat0 = await browser.eval(`(()=>{dlgDismiss();G.f.__restProbe=1;G.hp=2;if(G.nicknames[0]){G.nicknames[0].lost=true;G.f.gangcheolSwallowed=[G.nicknames[0].id];}G.inv.jat=(G.inv.jat||0)+7;return G.inv.jat;})()`);
        const lose = async result => {
          await browser.eval(`(REG.${s.start}(),1)`);
          await browser.until(`!!B&&B.kind==='${s.kind}'&&B.st!=='intro'`, { timeout: 9000, label: '전투 ' + where });
          await browser.eval(`(bEnd('${result}'),1)`);
          await browser.until("!$('bResult').hidden", { timeout: 8000, label: '결과 창 ' + where });
          await browser.eval("($('bResOk').click(),1)");
          await browser.until('!B&&!inkOn', { timeout: 6000, label: '전투 뒤 ' + where });
        };
        await lose('lose');
        const a = await browser.eval(`({px:Math.round(G.px),restX:Math.round(REG.rest.x),zone:G.zone,probe:G.f.__restProbe,hp:G.hp,max:G.maxhp,faints:G.f.faints,jat:G.inv.jat||0,
          lost:(G.nicknames||[]).filter(n=>n.lost).length,swallowed:(G.f.gangcheolSwallowed||[]).length,dadPulled:!!G.f.nameDadPulled,back:TABLES.TUNING.rest_return_back})`);
        if (Math.abs(a.px - (a.restX - a.back)) > 1) fail('rest-return', `${where}: 지고 나서 쉼터 불 앞(${a.restX - a.back})이 아니라 ${a.px}에 섰다`);
        if (a.probe !== undefined) fail('rest-snapshot', `${where}: 쉼터 뒤에 생긴 진행이 지고 나서도 남았다`);
        if (a.jat !== jat0 - 7) fail('rest-snapshot', `${where}: 쉼터 뒤에 받은 물건이 남았다 (잣 ${a.jat})`);
        if (a.hp !== a.max) fail('rest-heal', `${where}: 쉼터로 돌아왔는데 체력이 다 차지 않았다`);
        if (a.faints !== 1) fail('rest-faints', `${where}: 쓰러진 횟수가 ${a.faints} (1이어야 한다)`);
        if (id === 'yeongsan' && (a.lost || a.swallowed)) fail('rest-names', `${where}: 쉼터로 돌아왔는데 쉼터 뒤에 잃은 이름이 돌아오지 않았다`);
        if (id === 'yeongsan' && !a.dadPulled) fail('rest-dad', `${where}: 처음 진 뒤 아빠 끌어내기 장면이 이어지지 않았다`);
        await browser.eval('(dlgDismiss(),thinkHold=0,G.f.__restProbe2=1,1)');
        await lose('flee');
        const f = await browser.eval('({probe:G.f.__restProbe2,faints:G.f.faints})');
        if (f.probe !== 1) fail('rest-flee', `${where}: 물러났는데 진행이 쉼터 때로 되돌아갔다`);
        checked.push({ where, lit, after: a, fled: f });
      } catch (error) {
        fail('rest-execution', `${where}: ${error.message}`);
        await browser.screenshot(path.join(outDir, `rest-${mode}-${id}-failure.png`)).catch(() => {});
      }
    }
  }
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, 'rest.json');
  fs.writeFileSync(file, JSON.stringify({ checked, findings }, null, 2) + '\n', 'utf8');
  return { name: 'rest', status: findings.length ? 'fail' : 'pass', findings, evidence: [file],
    summary: `네 지역 보스 앞 쉼터를 두 구성에서 ${checked.length}번 켜고, 지면 쉼터로 돌아오고 물러나면 그 자리에 남는지 보았다` };
}

module.exports = { runRest };
