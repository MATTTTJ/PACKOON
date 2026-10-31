#!/usr/bin/env node
'use strict';
/* 분량 측정 (QA 16항목과 따로 돈다): 네 지역을 같은 기준, 같은 표로 잰다.
   사용법: node prototypes/web/tools/qa/measure.js            → qa-out/measure-<시각>/measure.md·measure.json
   - 필수: 연속 플레이 봇(playthrough.js, 확장판)이 실제로 지나간 대사·걸음·손 동작을 센다.
           봇의 시계는 이동 중 6배라 봇 시간은 쓰지 않는다. 센 양에 사람 기준값을 곱한다.
   - 사연: 사연 장면(arcScene을 부르거나 이름에 arc가 든 함수)의 대사를 코드에서 센다. 걸음은 같은 인물 앞이라 0으로 둔다.
   - 전부: 사연에 더해 떠돌이(strangers.js)·필드 혼잣말·선택 교환(t_craft) 대사, 도장·경치·떠돌이·흔한 교환·남은 채집 자리,
           그리고 봇이 지나지 않은 자리까지의 왕복 걸음을 더한다.
   사람 기준값은 아래 HUMAN에 모아 두었다. 바꾸면 표 전체가 같은 기준으로 바뀐다. */
const fs=require('node:fs'),path=require('node:path');
const {launchBrowser,startServer}=require('./browser');
const {installHooks,collectHookFindings}=require('./hooks');
const {runPlaythrough}=require('./playthrough');
const {parseDialogue,parseCsv}=require('./static');

const root=path.resolve(__dirname,'../../../..');
const REGIONS=['galchamgol','dolneomeo','jangteo','yeongsan'];
const NAME={galchamgol:'단풍골',dolneomeo:'돌너머',jangteo:'큰 장터',yeongsan:'영산'};

/* 사람 기준값 (초). 근거는 design/proposals/playtime-budget.md §측정 기준. */
const HUMAN={
  readCharsPerSecond:8,      // 읽기: 글자 8자/초 (사용자 지시 기준)
  boxSeconds:0.4,            // 대사 상자 하나를 넘기는 손
  gatherSpot:8,              // 채집 한 자리 (고리 타이밍 2~3번, 초행)
  pickup:1.5,                // 바닥 물건 하나 줍기
  craft:6,                   // 가보 가공 한 번 (손 한 번, D-54)
  trade:15,                  // 교환 화면 한 번 (고르고 얹고 제안)
  haggle:5,                  // 흥정 한 번
  vista:8,                   // 경치 하나
  stamp:3,                   // 도장 하나
  wanderer:20,               // 떠돌이 하나 (손일 한 번 + 반응 보기)
  arcScene:10,               // 사연 장면 하나의 손(가서 말 걸기·물건 보여 주기)
  minigame:{yut:60,rhythm:20,sneak:40,yActivity:30,dad:45,galTravel:15,dolDepthTravel:15,default:25},
  battleCycle:5,             // 전투 한 차례: 예고 0.7 + 공격 2.5 + 빈틈 1.2 + 대기 0.6
  battleMiss:1.3,            // 초행이 되치기를 놓치는 몫
  musoeRounds:6,musoeRound:6,musoeFinale:5
};

/* ---------- 코드에서 사연·선택 대사 세기 ---------- */
// 문자열·주석을 건너뛰며 최상위 function 이름과 몸통 범위를 찾는다.
function functionRanges(src){
  const out=[];const re=/function\s+([A-Za-z_$][\w$]*)\s*\(/g;let m;
  while((m=re.exec(src))){
    let i=src.indexOf('{',m.index);if(i<0)continue;let depth=0,j=i;
    for(;j<src.length;j++){
      const c=src[j];
      if(c==="'"||c==='"'||c==='`'){const q=c;j++;while(j<src.length&&src[j]!==q){if(src[j]==='\\')j++;j++;}continue;}
      if(c==='/'&&src[j+1]==='/'){j=src.indexOf('\n',j);if(j<0)break;continue;}
      if(c==='/'&&src[j+1]==='*'){j=src.indexOf('*/',j+2)+1;continue;}
      if(c==='{')depth++;else if(c==='}'){depth--;if(!depth)break;}
    }
    const body=src.slice(i,j+1);
    out.push({name:m[1],start:src.slice(0,m.index).split('\n').length,end:src.slice(0,j).split('\n').length,body});
  }
  return out;
}
function staticExtras(){
  const res={};
  for(const r of REGIONS){
    const dir=path.join(root,'prototypes/web/js/regions',r);res[r]={arc:{boxes:0,chars:0,scenes:0},optional:{boxes:0,chars:0}};
    for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.js'))){
      const src=fs.readFileSync(path.join(dir,f),'utf8'),rows=parseDialogue(src).rows.filter(x=>x.text);
      const fns=functionRanges(src);
      const arcFns=fns.filter(fn=>/arc/i.test(fn.name)||fn.body.includes('arcScene('));
      const craftFns=fns.filter(fn=>/t_craft_|craftTrade|CraftTrade|craft_oil|craftJujube|jxCraftMarket/.test(fn.body)&&!/arc/i.test(fn.name));
      const inFn=(row,list)=>list.some(fn=>row.line>=fn.start&&row.line<=fn.end);
      res[r].arc.scenes+=(src.match(/arcScene\(/g)||[]).length-(src.match(/function arcScene\(/g)||[]).length;
      for(const row of rows){
        const len=row.text.replace(/\s+/g,'').length;
        if(inFn(row,arcFns)){res[r].arc.boxes++;res[r].arc.chars+=len;}
        else if(f==='strangers.js'||inFn(row,craftFns)){res[r].optional.boxes++;res[r].optional.chars+=len;}
      }
    }
  }
  return res;
}

/* ---------- 페이지 안 계측: 걸음·손 동작을 센다 (상태를 쓰지 않는다) ---------- */
function installMeter(){
  if(window.__measure)return;
  const M=window.__measure={regions:{}};
  const R=()=>{const r=G&&G.region;if(!r)return null;return M.regions[r]||(M.regions[r]={walk:0,cover:{},battles:[],minigames:[],gathers:0,pickups:0,crafts:0,trades:0,haggles:0,vistas:0});};
  let last=null,mg=null,battle=null;
  setInterval(()=>{
    if(!G||!G.started)return;const r=R();if(!r)return;
    const key=G.region+'|'+(G.zone||'classic');
    if(last&&last.key===key&&!vistaMode){const d=Math.abs(G.px-last.x);if(d<60)r.walk+=d;}
    last={key,x:G.px};
    const b=Math.floor(G.px/50);(r.cover[G.zone||'classic']||(r.cover[G.zone||'classic']={}))[b]=1;
    const m=openMinigame?.();const id=m&&m.id;if(id&&id!==mg)r.minigames.push(id);mg=id||null;
    if(B&&!battle){battle=B.kind;r.battles.push(B.kind);}if(!B)battle=null;
  },16);
  const wrap=(name,fn)=>{const o=window[name];if(typeof o!=='function')return;window[name]=function(...a){try{fn(...a);}catch(_){}return o.apply(this,a);};};
  wrap('gatherHit',d=>{if(d&&!d.done&&!d.counted){d.counted=true;R().gathers++;}});
  wrap('finishFloorPickup',()=>R().pickups++);
  wrap('startCraftHands',()=>R().crafts++);
  wrap('startVista',()=>R().vistas++);
  // Trade는 const라 window에 없다. 이름으로 찾는다.
  if(typeof Trade==='object'){const o=Trade.open;Trade.open=function(...a){R().trades++;return o.apply(this,a);};}
  document.addEventListener('click',e=>{if(e.target?.closest?.('.trade-haggle button[data-way]'))R().haggles++;},true);
}
// 지역마다 선택 자리 목록: 새 게임으로 그 지역을 열어 읽기만 한다.
function regionPoints(){
  const zones=REG.zones||{classic:{}};const pts=[];
  for(const [z,def] of Object.entries(zones)){
    for(const k of ['vistas','stamps','digs','wanderers','pickups'])for(const p of (def[k]||[]))if(typeof p==='object'&&Number.isFinite(p.x))pts.push({zone:z,kind:k,x:p.x,form:p.form||null});
    for(const n of (def.npcs||[]))if(typeof n==='object'&&Number.isFinite(n.x))pts.push({zone:z,kind:'npc',x:n.x});
  }
  return {points:pts,widths:Object.fromEntries(Object.entries(zones).map(([z,d])=>[z,d.w||2400])),
    stock:(TABLES.STOCK||[]).filter(s=>s.region===G.region).length,
    crafts:Object.keys(G.ledger||{}).length,digs:(G.digs||[]).length,
    haggleNpcs:Object.keys(TABLES.HAGGLE||{}).filter(n=>REG.trade?.[n]||(TABLES.STOCK||[]).some(s=>s.region===G.region&&s.npc===n)).length};
}

/* ---------- 계산 ---------- */
const min=s=>+(s/60).toFixed(1);
function battleSeconds(kind,parts){
  if(kind==='musoe')return HUMAN.musoeRounds*HUMAN.musoeRound+HUMAN.musoeFinale;
  const hp=parts.filter(p=>p.boss===kind).reduce((n,p)=>n+p.hp,0)||12;
  return hp*HUMAN.battleCycle*HUMAN.battleMiss;
}

(async()=>{
  const outDir=path.join(root,'qa-out','measure-'+new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(outDir,{recursive:true});
  const rules=JSON.parse(fs.readFileSync(path.join(__dirname,'rules.json'),'utf8'));
  const partsCsv=parseCsv(fs.readFileSync(path.join(root,'design/data/boss_parts.csv'),'utf8').replace(/^﻿/,''));
  const head=partsCsv.shift().cells;const bi=head.findIndex(h=>/보스/.test(h)),hi=head.findIndex(h=>/내구/.test(h));
  const parts=partsCsv.map(r=>({boss:r.cells[bi],hp:+r.cells[hi]||0}));
  const server=await startServer(root);let browser;
  try{
    browser=await launchBrowser({outDir,url:server.url});
    await browser.navigate(server.url);
    await installHooks(browser,rules);
    await browser.eval(`(${installMeter.toString()})()`);
    const play=await runPlaythrough({browser,mode:'expanded',outDir,rules,report:m=>console.log('[measure] '+m)});
    if(play.status!=='pass')throw new Error('연속 플레이가 끝까지 가지 못했다: '+play.summary);
    const hook=await collectHookFindings(browser);
    const meter=await browser.eval('window.__measure');
    const points={};
    for(const r of REGIONS){
      await browser.navigate(server.url+'?region='+r);
      points[r]=await browser.eval(`(async()=>{G=newGame(${JSON.stringify(r)});resetScreens();startGame();await new Promise(x=>setTimeout(x,600));return (${regionPoints.toString()})();})()`);
    }
    const extras=staticExtras();
    const rows=[];
    for(const r of REGIONS){
      const lines=hook.lines.filter(l=>l.region===r),m=meter.regions[r]||{},P=points[r],X=extras[r];
      const chars=lines.reduce((n,l)=>n+String(l.text).replace(/\s+/g,'').length,0);
      const read=chars/HUMAN.readCharsPerSecond+lines.length*HUMAN.boxSeconds;
      const walk=(m.walk||0)/(1.7*60);
      const mgSec=(m.minigames||[]).reduce((n,id)=>n+(HUMAN.minigame[id]??HUMAN.minigame.default),0);
      const btSec=(m.battles||[]).reduce((n,k)=>n+battleSeconds(k,parts),0);
      const hand=mgSec+btSec+(m.gathers||0)*HUMAN.gatherSpot+(m.pickups||0)*HUMAN.pickup+(m.crafts||0)*HUMAN.craft+(m.trades||0)*HUMAN.trade+(m.haggles||0)*HUMAN.haggle+(m.vistas||0)*HUMAN.vista;
      // 사연: 읽기와 장면 손
      const arcRead=X.arc.chars/HUMAN.readCharsPerSecond+X.arc.boxes*HUMAN.boxSeconds,arcHand=X.arc.scenes*HUMAN.arcScene;
      // 전부: 선택 대사, 선택 자리 손, 봇이 안 간 자리까지 왕복
      const optRead=X.optional.chars/HUMAN.readCharsPerSecond+X.optional.boxes*HUMAN.boxSeconds;
      const kinds=k=>P.points.filter(p=>p.kind===k).length;
      const optHand=kinds('stamps')*HUMAN.stamp+Math.max(0,kinds('vistas')-(m.vistas||0))*HUMAN.vista+kinds('wanderers')*HUMAN.wanderer+
        P.stock*HUMAN.trade+P.haggleNpcs*HUMAN.haggle+Math.max(0,P.digs-(m.gathers||0))*HUMAN.gatherSpot+
        Math.max(0,kinds('pickups')-(m.pickups||0))*HUMAN.pickup+2*HUMAN.trade;   // 선택 교환(t_craft) 몫 두 번
      // 구역마다: 봇이 간 범위 밖으로 가장 먼 선택 자리까지 한 번 왕복(왼쪽·오른쪽 따로). 가운데 빈틈은 지나가며 들른다고 본다.
      // 봇이 들르지 않은 구역은 구역마다 한 번, 끝까지 갔다 오는 걸음(구역 폭)으로 친다.
      let detour=0;const over={},unseen=new Set();
      for(const p of P.points){
        if(p.kind==='npc')continue;
        const cover=Object.keys((m.cover||{})[p.zone]||{}).map(Number);
        if(!cover.length){unseen.add(p.zone);continue;}
        const lo=Math.min(...cover)*50,hi=Math.max(...cover)*50+50,o=over[p.zone]||(over[p.zone]={l:0,r:0});
        o.l=Math.max(o.l,lo-p.x);o.r=Math.max(o.r,p.x-hi);
      }
      for(const o of Object.values(over))detour+=2*(Math.max(0,o.l)+Math.max(0,o.r));
      for(const z of unseen)detour+=P.widths[z]||2400;
      const optWalk=detour/(1.7*60);
      const req={read,walk,hand},arc={read:read+arcRead,walk,hand:hand+arcHand},all={read:read+arcRead+optRead,walk:walk+optWalk,hand:hand+arcHand+optHand};
      const sum=o=>o.read+o.walk+o.hand;
      rows.push({region:r,name:NAME[r],unseenZones:[...unseen],detourPx:Math.round(detour),boxes:lines.length,chars,walkPx:Math.round(m.walk||0),counts:m,arc:X.arc,optional:X.optional,points:{stamps:kinds('stamps'),vistas:kinds('vistas'),wanderers:kinds('wanderers'),digs:P.digs,stock:P.stock},
        minutes:{required:{read:min(req.read),walk:min(req.walk),hand:min(req.hand),total:min(sum(req))},
          arcs:{read:min(arc.read),walk:min(arc.walk),hand:min(arc.hand),total:min(sum(arc))},
          all:{read:min(all.read),walk:min(all.walk),hand:min(all.hand),total:min(sum(all))}}});
    }
    const commit=require('node:child_process').execFileSync('git',['rev-parse','--short','HEAD'],{cwd:root,encoding:'utf8'}).trim();
    const md=['# 분량 측정 (자동)','',`커밋 ${commit} · 확장판 연속 플레이 봇 + 코드 집계 · 사람 기준값은 measure.js의 HUMAN`,'',
      '| 지역 | 경로 | 읽기 | 걷기 | 손 | 합계 |','|---|---|---|---|---|---|'];
    for(const row of rows)for(const [k,label] of [['required','필수'],['arcs','필수+사연'],['all','전부']]){const t=row.minutes[k];md.push(`| ${row.name} | ${label} | ${t.read} | ${t.walk} | ${t.hand} | **${t.total}** |`);}
    const tot=k=>+rows.reduce((n,r)=>n+r.minutes[k].total,0).toFixed(1);
    md.push('',`네 지역 합계: 필수 ${tot('required')}분 · 필수+사연 ${tot('arcs')}분 · 전부 ${tot('all')}분`,'',
      '| 지역 | 필수 대사 상자 | 필수 글자 | 필수 걸음(px) | 전투 | 미니게임 | 채집 | 줍기 | 가공 | 교환 화면 | 흥정 | 사연 장면 | 사연 상자 | 선택 대사 상자 | 도장 | 경치 | 떠돌이 | 흔한 교환 |','|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
    for(const r of rows){const c=r.counts;md.push(`| ${r.name} | ${r.boxes} | ${r.chars} | ${r.walkPx} | ${(c.battles||[]).join('·')||'-'} | ${(c.minigames||[]).join('·')||'-'} | ${c.gathers||0} | ${c.pickups||0} | ${c.crafts||0} | ${c.trades||0} | ${c.haggles||0} | ${r.arc.scenes} | ${r.arc.boxes} | ${r.optional.boxes} | ${r.points.stamps} | ${r.points.vistas} | ${r.points.wanderers} | ${r.points.stock} |`);}
    md.push('','전부 경로의 덧붙인 걸음: '+rows.map(r=>`${r.name} ${r.detourPx}px${r.unseenZones.length?' (봇이 안 간 구역 '+r.unseenZones.join('·')+')':''}`).join(' · '));
    fs.writeFileSync(path.join(outDir,'measure.md'),md.join('\n')+'\n');
    fs.writeFileSync(path.join(outDir,'measure.json'),JSON.stringify({commit,human:HUMAN,rows},null,2));
    console.log(md.join('\n'));console.log('결과: '+path.relative(root,outDir));
  }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
