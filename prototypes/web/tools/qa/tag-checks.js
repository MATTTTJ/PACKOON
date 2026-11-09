'use strict';
/* 결정 D-1428: 인물 머리 위 이름표 검사. 대화를 나눈 인물이 '?'로 남지 않는지 본다.
   1) 네 지역의 모든 구역에서, 필드에 선 인물마다 그 인물이 말하는 대화 줄을 띄운 뒤 이름표가 이름인지
   2) 단풍골 언덕 어귀에서 두꺼비 할멈이 먼저 불러 세운 첫 대화 뒤 이름표가 '두꺼비 할멈'인지 (말 걸기 없이 열리는 대화)
   3) 단풍골에서 늙은 까치를 만난 뒤 다른 지역의 늙은 까치(지역마다 id 가 다르다)가 이름으로 보이는지 */
const fs = require('node:fs');
const path = require('node:path');

async function runTags({ browser, outDir }) {
  const findings = [], checked = [];
  const fail = (rule, message) => findings.push({ rule, severity: '높음', message });
  const base = browser.url.replace(/\?.*$/, '');
  const boot = async id => {
    await browser.navigate(base);
    await browser.until("typeof TitleScreen!=='undefined'&&typeof startGame==='function'&&typeof npcTagText==='function'", { timeout: 15000, label: '첫 화면 ' + id });
    await browser.eval(`(()=>{localStorage.clear();TitleScreen.close();G=newGame('${id}');resetScreens();startGame();G.f.momNoteSeen=true;closePanels();dlgDismiss();return 1;})()`);
  };
  for (const id of ['galchamgol', 'dolneomeo', 'jangteo', 'yeongsan']) {
    try {
      await boot(id);
      const r = await browser.eval(`(()=>{const out=[];
        for(const z of Object.keys(REG.zones||{null:1})){
          if(REG.zones){G.zone=z;resetScreens();}
          let list=[];try{list=[...fieldNpcs(),...zoneObjects('wanderers')];}catch(_){}
          for(const n of list){
            if(!n||!n.name||n.prompt||n.tag===false||!n.draw||n.known)continue;
            const who=n.speakers?.[0]||n.name;
            talk([[who,'…']]);dlgDismiss();
            out.push({zone:z,id:n.id,name:n.name,tag:npcTagText(n)});
          }
        }
        return out;})()`);
      checked.push({ region: id, npcs: r.length });
      for (const n of r) if (n.tag === '?') fail('tag-speaker', `${id} · ${n.zone}: ${n.name}(${n.id})가 말한 뒤에도 이름표가 '?'다`);
    } catch (error) { fail('tag-execution', `${id}: ${error.message}`); }
  }
  try {   // 2) 두꺼비 할멈이 먼저 부르는 첫 만남
    await boot('galchamgol');
    await browser.eval(`(()=>{G.zone='hill';resetScreens();G.px=REG.npcs.find(n=>n.id==='toad').x-40;G.py=surfaceY(G.px);G.onGround=true;G.vx=0;return 1;})()`);
    await browser.until("!$('dlg').hidden", { timeout: 6000, label: '두꺼비 할멈이 부름' });
    const t = await browser.eval(`(()=>{const n=REG.npcs.find(n=>n.id==='toad');dlgDismiss();return {met:G.f.toadMet,tag:npcTagText(n)};})()`);
    checked.push({ toad: t });
    if (t.tag !== '두꺼비 할멈') fail('tag-toad', `언덕 어귀에서 두꺼비 할멈이 먼저 말을 건 뒤에도 이름표가 '${t.tag}'다`);
  } catch (error) { fail('tag-execution', `두꺼비 할멈: ${error.message}`); }
  try {   // 3) 지역마다 다른 id 의 늙은 까치
    for (const id of ['dolneomeo', 'jangteo', 'yeongsan']) {
      await boot(id);
      const t = await browser.eval(`(()=>{G.learned.push('met:old_magpie');const out=[];
        for(const r of [REG])for(const z of Object.keys(r.zones||{})){G.zone=z;resetScreens();
          for(const n of zoneObjects('wanderers'))if(n.name==='늙은 까치')out.push({zone:z,id:n.id,tag:npcTagText(n)});
          for(const n of fieldNpcs())if(n.name==='늙은 까치')out.push({zone:z,id:n.id,tag:npcTagText(n)});}
        return out;})()`);
      checked.push({ region: id, magpie: t });
      for (const m of t) if (m.tag !== '늙은 까치') fail('tag-recurring', `${id} · ${m.zone}: 단풍골에서 만난 늙은 까치(${m.id})가 '${m.tag}'로 보인다`);
    }
  } catch (error) { fail('tag-execution', `늙은 까치: ${error.message}`); }
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, 'tags.json');
  fs.writeFileSync(file, JSON.stringify({ checked, findings }, null, 2) + '\n', 'utf8');
  return { name: 'tags', status: findings.length ? 'fail' : 'pass', findings, evidence: [file],
    summary: '네 지역 인물이 말한 뒤 이름표가 이름으로 바뀌는지, 먼저 말을 거는 두꺼비 할멈과 지역을 넘는 늙은 까치를 보았다' };
}

module.exports = { runTags };
