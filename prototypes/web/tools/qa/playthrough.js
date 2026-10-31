'use strict';

// 이 드라이버는 상태를 읽고 CDP 키/마우스 입력만 보낸다. 진행·좌표·소지품은 쓰지 않는다.
const fs = require('node:fs');
const path = require('node:path');

async function runPlaythrough({browser: b, mode, outDir, rules, report = () => {}}) {
  const started = Date.now(), trace = [], findings = [], milestones = [];
  let scene = '새 게임', goalSince = Date.now(), lastGoal = '', edgeRegions = new Set();
  const maxRun = 9 * 60 * 1000;
  const json = value => JSON.stringify(value);
  const read = async expression => b.eval(expression);
  const wait = async ms => b.wait(ms);
  const log = (action, detail) => trace.push({seconds:+((Date.now()-started)/1000).toFixed(2), scene, action, detail});
  const snapshot = async () => read(`({region:G.region,zone:G.zone,x:G.px,y:G.py,ground:G.onGround,goal:REG.goal(),started:G.started,ended:G.ended,inv:{...G.inv},flags:{...G.f},awake:[...G.awake],dlg:!$('dlg').hidden,choices:[...$('dlgChoices').children].map(e=>e.textContent),text:$('dlgText').textContent,mg:openMinigame()?.id,battle:B?{kind:B.kind,st:B.st,paused:B.paused,result:B.result,calm:B.calm}:null,ink:inkOn,motion:!!zoneMotion,fade:zoneFade})`);
  async function check() {
    if(Date.now()-started>maxRun)throw new Error('연속 플레이 제한 540초를 넘었다');
    const s=await snapshot();
    if(s.goal!==lastGoal){lastGoal=s.goal;goalSince=Date.now();log('목표',s.goal);report(mode+' · '+s.region+' · '+s.goal);}
    const limit=(rules?.runtime?.stallSeconds||240)*1000;
    if(Date.now()-goalSince>limit)throw new Error(`같은 목표에서 ${Math.round((Date.now()-goalSince)/1000)}초 대기: ${s.goal}`);
    return s;
  }
  async function key(k,type='press'){log('키',{key:k,type});await b.key(k,type);}
  async function click(selector){log('클릭',selector);await b.click(selector);}
  async function textButton(selector, pattern) {
    const p=pattern instanceof RegExp?{source:pattern.source,flags:pattern.flags}:{source:String(pattern),flags:''};
    const index=await read(`([...document.querySelectorAll(${json(selector)})].findIndex(e=>!e.disabled&&new RegExp(${json(p.source)},${json(p.flags)}).test(e.textContent)))`);
    if(index<0)throw new Error(`버튼을 찾지 못함: ${selector} / ${p.source}`);
    await click(`${selector}:nth-of-type(${index+1})`);
  }
  const defaults=[/북쪽으로 떠난다/,/아빠와 집으로 돌아간다/,/제 이름을 드릴게요/,/말이… 안 나와/,/내가… 아기였을 때/,/나 주려고/,/건넨다|보따리를 펼친다|달여 드린다|고사상에 올린다|약즙을 맡긴다/,/돌 쌓기를 배운다/,/낫과 시험|낫 이야기/,/하던 이야기 계속/,/해머루 이야기/,/같이 찾아볼게/,/산길로 간다|길을 나선다/,/그만두기|다음에 이야기|다음에 올게|더 둘러|생각해|조금 이따/];
  async function settle(prefer) {
    for(let i=0;i<200;i++) {
      const s=await check();
      if(await read("!$('notebook').hidden")){await click('#noteClose');await wait(40);continue;}
      if(await read("!$('bag').hidden&&bagKind==='중요'")){await click('#bagClose');await wait(40);continue;}
      if(await read("!$('trade').hidden")){await trade(prefer);continue;}
      if(s.dlg) {
        if(s.choices.length) {
          let n=-1;
          for(const p of prefer?[prefer,...defaults]:defaults){n=s.choices.findIndex(t=>p.test(t));if(n>=0)break;}
          if(n<0)n=0;
          log('대화 선택',s.choices[n]);await click(`#dlgChoices button:nth-child(${n+1})`);
        }else await key('e');
        await wait(30);continue;
      }
      if(s.mg){await minigame(s.mg);continue;}
      if(s.battle)return s;
      if(s.ink||s.motion||s.fade){await wait(100);continue;}
      return s;
    }
    throw new Error('대화/미니게임이 200회 입력 뒤에도 닫히지 않는다');
  }
  // 결정 D-39: 교환 화면. 진행에 필요한 부탁(선택 교환 t_craft_ 제외) 중 지금 보따리로 맞출 수 있는 첫 조합을
  // 실제 클릭으로 고르고 얹어 제안한다. prefer가 흥정 방식(허세·사정·칭찬)과 맞으면 먼저 흥정한다.
  async function trade(prefer) {
    const ways=await read("[...document.querySelectorAll('.trade-haggle button[data-way]')].filter(b=>!b.disabled).map(b=>b.dataset.way)");
    const way=prefer&&ways.find(w=>prefer.test(w));
    if(way){log('흥정',way);await click('.trade-haggle button[data-way="'+way+'"]');await wait(40);}
    const plan=await read("(()=>{const S=Trade.state;if(!S)return null;for(const g of S.goods){if(g.kind!=='story'||g.id.startsWith('t_craft_')||g.locked?.())continue;const i=g.asks.findIndex(a=>Object.entries(a).every(([id,n])=>has(id,n)));if(i>=0)return {good:g.id,ask:g.asks[i]};}return null;})()");
    if(!plan){log('교환 화면','맞출 부탁 없음');await click('#tradeClose');await wait(40);return;}
    log('교환',plan);await click('.trade-good[data-good="'+plan.good+'"]');
    for(const [id,n] of Object.entries(plan.ask))for(let i=0;i<n;i++)await click('.slot[data-item="'+id+'"]');
    await click('#tradePropose');await wait(60);
    if(await read("!$('trade').hidden"))throw new Error('교환 화면에서 제안이 받아들여지지 않았다: '+await read("document.querySelector('.trade-log')?.textContent"));
  }
  async function minigame(id) {
    log('미니게임',id);const end=Date.now()+45000;
    const missRhythm=id==='rhythm'&&!await read('G.f.yeotDone');
    if(missRhythm){log('장단 의도된 실패','준비 입력 한 번 뒤 모든 박자를 놓친다');await key('j');}
    while(Date.now()<end) {
      const s=await check();if(s.mg!==id){if(missRhythm){const hits=await read("document.querySelectorAll('#rhythmPips .on').length");log('장단 실패 결과',{hits,expectedHits:0,rice:s.inv.ssal||0});if(hits!==0)throw new Error('장단 전부 실패 시험에서 입력이 맞았다: '+hits);}return;}
      if(id==='forge') {
        if(await read("!$('fstrike').disabled"))await click('#fstrike');await wait(90);
      }else if(id==='stack') {
        if(await read("!$('sstrike').disabled"))await key('j');await wait(85);
      }else if(id==='steam') {
        const fire=await read("window.__qaCanvas?.fire??0");
        if(fire<60||await read("$('steamBtn').textContent.includes('다시')"))await key('j');await wait(90);
      }else if(id==='rhythm') {
        if(!missRhythm)await key('j');await wait(75);
      }else if(id==='yActivity') {
        await click('#yActSlow');await wait(80);
      }else if(id==='dolDepthTravel') {
        await wait(100);
      }else if(id==='galTravel') {
        const trip=await read('REG.expTravel?.()');
        if(trip?.kind==='tree')throw new Error('필수 경로 밖 나무 속 등반이 열렸다');
        await wait(150);
      }else throw new Error('처리 방법이 없는 미니게임: '+id);
    }
    throw new Error(`미니게임 ${id}에서 45초 진행하지 못했다`);
  }
  async function moveX(x,{edge=false,attack=false,sneak=false,slow=false}={}) {
    const begin=await settle();let held=null,previous=begin.x,still=Date.now(),rate=6;const end=Date.now()+45000;
    await read('window.__qaClockRate=6');
    try {
      while(Date.now()<end) {
        const s=await check();if(s.battle||s.ended)return;
        if(s.zone!==begin.zone) {
          if(edge){await wait(1100);edgeRegions.add(s.region);log('가장자리 입력 유지',{from:begin.zone,to:s.zone,key:held});}
          return;
        }
        if(s.dlg||s.mg||s.ink||s.motion||s.fade){if(held){await key(held,'up');held=null;}await settle();continue;}
        const d=x-s.x;if(Math.abs(d)<=5)return;
        const desiredRate=Math.abs(d)<50||sneak||slow?1:6;
        if(desiredRate!==rate){rate=desiredRate;await read('window.__qaClockRate='+rate);}
        const alert=sneak&&await read("G.salg&&(G.salg.phase==='alert'||G.salg.phase==='warn')&&Math.abs(G.salg.x-G.px)<150");
        const want=alert?null:d>0?'ArrowRight':'ArrowLeft';
        if(held!==want){if(held)await key(held,'up');held=want;if(held)await key(held,'down');}
        if(attack)await key('j');
        await wait(Math.min(40,Math.max(5,Math.abs(d))));
        if(Math.abs(s.x-previous)>1){previous=s.x;still=Date.now();}
        else if(Date.now()-still>6000&&!alert)throw new Error(`걷기 6초 정지: ${s.region}/${s.zone} x=${s.x}, 목적 x=${x}`);
      }
      throw new Error('이동 45초 초과: x='+x);
    }finally{if(held)await key(held,'up');await read('window.__qaClockRate=1');}
  }
  async function jumpTo(x,y) {
    const s=await check();
    if(y>=185){await moveX(x);if(s.y<185){await moveX(x+55);await wait(500);await moveX(x);}return;}
    const platforms=await read('fieldPlatforms().map(p=>({...p}))');
    const floor={x:16,y:192,w:10000};
    const ps=[floor,...platforms];
    if(Math.abs(s.y-y)<4&&platforms.some(p=>Math.abs(p.y-y)<4&&s.x>=p.x&&s.x<=p.x+p.w&&x>=p.x&&x<=p.x+p.w)){await moveX(x);return;}
    let target=ps.findIndex(p=>Math.abs(p.y-y)<=3&&x>=p.x-8&&x<=p.x+p.w+8);
    if(target<0)target=ps.findIndex(p=>p.y-y>=0&&p.y-y<=40&&x>=p.x-5&&x<=p.x+p.w+5);
    if(target<0){await moveX(x);await key('w');await wait(220);return;}
    const q=[[0]],seen=new Set([0]);let route=null;
    while(q.length){const r=q.shift(),a=ps[r.at(-1)];if(r.at(-1)===target){route=r;break;}
      for(let j=1;j<ps.length;j++){const z=ps[j],gap=Math.max(0,z.x-(a.x+a.w),a.x-(z.x+z.w));if(!seen.has(j)&&a.y-z.y<=44&&gap<=36){seen.add(j);q.push([...r,j]);}}
    }
    if(!route){
      const door=await read(`(zoneObjects('doors')||[]).filter(p=>p.to===G.zone&&Math.abs((p.toY??192)-${y})<5&&(!p.need||p.need())).map(p=>({x:p.x,y:p.y??192}))[0]`);
      if(door){await moveX(door.x);await key('e');await settle();await moveX(x);return;}
      throw new Error(`발판 경로 없음: x=${x},y=${y}`);
    }
    // 매번 바닥에서 출발하면 이전 발판에 갇힌 상태를 그대로 물려받지 않는다.
    if((await check()).y<185){await moveX(Math.max(20,ps[route[1]].x-65));await wait(700);}
    for(let i=1;i<route.length;i++) {
      const from=ps[route[i-1]],to=ps[route[i]],tx=i===route.length-1?Math.max(to.x+8,Math.min(x,to.x+to.w-8)):to.x+to.w/2;
      const launch=Math.max(from.x+5,Math.min(tx,from.x+from.w-5));
      await moveX(launch);await wait(50);await key('w');
      await moveX(tx);await wait(450);
      const a=await check();if(a.y>to.y+4){await key('w');await wait(500);}
    }
    await moveX(x);if(Math.abs((await check()).y-y)>15){await key('w');await wait(200);}
  }
  async function zone(to) {
    if(mode==='classic')return;
    for(let tries=0;tries<15;tries++) {
      const s=await settle();if(s.zone===to)return;
      const graph=await read(`Object.fromEntries(Object.entries(REG.zones).map(([id,z])=>[id,[...Object.entries(z.exits||{}).filter(([,p])=>typeof p==='string'||!p.need||p.need()).map(([side,p])=>({to:typeof p==='string'?p:p.to,side,x:side==='left'?0:z.w+10,y:192,kind:'edge'})),...(z.doors||[]).filter(p=>p.to!==id&&(!p.need||p.need())).map(p=>({to:p.to,x:p.x,y:p.y??192,kind:'door'}))]]))`);
      const q=[[s.zone,[]]],seen=new Set([s.zone]);let route;
      while(q.length){const [at,r]=q.shift();if(at===to){route=r;break;}for(const e of graph[at]||[])if(!seen.has(e.to)){seen.add(e.to);q.push([e.to,[...r,e]]);}}
      if(!route?.length)throw new Error(`열린 구역 경로 없음: ${s.zone} → ${to}`);
      let e=route[0];
      // 같은 목적지에 문이 있으면 가까운 쪽을 쓰되, 지역 첫 출구는 가장자리 입력 유지도 검사한다.
      const alternatives=(graph[s.zone]||[]).filter(p=>p.to===e.to);
      if(edgeRegions.has(s.region))e=alternatives.sort((a,z)=>Math.abs(a.x-s.x)-Math.abs(z.x-s.x))[0];
      if(e.kind==='edge')await moveX(e.x,{edge:true});
      else {await jumpTo(e.x,e.y);await key('e');await settle();await wait(350);}
    }
    throw new Error('구역 이동 15회 초과: '+to);
  }
  async function npc(id,prefer) {
    const n=await read(`(()=>{let n=REG.npcs.find(n=>n.id===${json(id)});if(!n&&REG.zones)for(const [zone,z] of Object.entries(REG.zones)){const p=(z.npcs||[]).find(p=>typeof p==='object'&&p.id===${json(id)});if(p){n={...p,zone};break;}}return n&&{id:n.id,x:n.x,y:n.y??192,zone:n.zone};})()`);
    if(!n)throw new Error('NPC 없음: '+id);
    if(n.zone)await zone(n.zone);
    if(id==='salgeumi'){
      for(let i=0;i<4;i++){
        const live=await read(`fieldNpcs().find(n=>n.id===${json(id)})?.x`);
        await moveX(live,{sneak:true});
        if(await read(`Math.abs(G.px-fieldNpcs().find(n=>n.id===${json(id)}).x)<24`))break;
      }
    }else await jumpTo(n.x,n.y);
    await key('e');await settle(prefer);
  }
  async function gather(item,minimum=1) {
    while(await read(`(G.inv[${json(item)}]||0)<${minimum}`)) {
      const loose=await read(`(()=>{for(const [zone,items] of Object.entries(G.floorItems?.[G.region]||{})){const a=items.find(a=>a.item===${json(item)}&&!a.got);if(a)return {x:a.x,y:a.y,zone:zone==='classic'?null:zone};}return null;})()`);
      if(loose){if(loose.zone)await zone(loose.zone);await jumpTo(loose.x,loose.y);await wait(900);await key('x');await wait(650);continue;}
      const d=await read(`G.digs.find(d=>d.item===${json(item)}&&!d.done)&&(({x,zone})=>({x,zone}))(G.digs.find(d=>d.item===${json(item)}&&!d.done))`);
      if(!d)throw new Error('남은 채집점 없음: '+item);
      if(d.zone)await zone(d.zone);
      await moveX(d.x-22);await key('ArrowRight','down');await wait(22);await key('ArrowRight','up');await key('j');await wait(350);await settle();
    }
  }
  async function pickup(item,minimum=1) {
    while(await read(`(G.inv[${json(item)}]||0)<${minimum}`)) {
      const p=await read(`(()=>{const reachable=new Set([G.zone]),q=[G.zone];while(q.length&&REG.zones){const z=REG.zones[q.shift()];for(const p of [...Object.values(z.exits||{}),...(z.doors||[])]){const to=typeof p==='string'?p:p.to;if((typeof p==='string'||!p.need||p.need())&&!reachable.has(to)){reachable.add(to);q.push(to);}}}const p=G.pickups.filter(p=>p.item===${json(item)}&&!p.got&&(!p.zone||reachable.has(p.zone))).sort((a,z)=>(z.y-a.y)||((a.zone===G.zone?0:1)-(z.zone===G.zone?0:1)))[0];return p&&{x:p.x,y:p.y,zone:p.zone,id:p.id};})()`);
      if(!p)throw new Error('남은 줍기 없음: '+item);
      if(p.zone)await zone(p.zone);await jumpTo(p.x,p.y);await wait(100);await key('x');await wait(650);
      const got=await read(`G.pickups.find(p=>p.x===${p.x}&&p.item===${json(item)})?.got`);
      if(!got){await key('w');await wait(250);await moveX(p.x+6);await wait(450);await key('x');await wait(650);}
      if(!await read(`G.pickups.find(p=>p.x===${p.x}&&p.item===${json(item)})?.got`))throw new Error(`줍기 실패: ${item} x=${p.x},y=${p.y}`);
    }
  }
  async function craft(tool,out,count=1) {
    for(let i=0;i<count;i++) {
      await settle();await key('i');await wait(50);
      const toolIndex=await read(`Object.keys(HEIR).indexOf(${json(tool)})`);
      await click(`#bagBody .tooltab:nth-child(${toolIndex+1})`);
      const idx=await read(`knownRecipes(${json(tool)}).findIndex(r=>r.out===${json(out)})`);
      if(idx<0)throw new Error('배우지 않은 가공법: '+out);
      // 가공 손 연출 동안(brewing)은 버튼이 잠긴다. 느린 환경에서는 앞 가공 연출이 아직 끝나지 않았을 수 있어 풀릴 때까지 기다린다.
      const unlocked=async()=>{for(let t=0;t<100&&await read('brewing');t++)await wait(100);};
      await unlocked();
      await click(`#bagBody .recipe:nth-child(${idx+1})`);
      for(let t=0;t<50&&await read("!$('craftBtn')||$('craftBtn').disabled");t++)await wait(100);
      await click('#craftBtn');
      await wait(80);await unlocked();await click('#bagClose');await wait(100);await settle();
    }
  }
  // 전투 결과를 돌려준다. 졌다면 뒤 단계의 엉뚱한 오류(예: 해머루 없음)로 번지지 않게 mustWin이 밝힌다.
  async function battle(gifts,{sway=false}={}) {
    scene=scene.replace(/ · 전투$/,'')+' · 전투';let end=Date.now()+60000;   // 결정 D-64: 선물은 빈틈에만. 선물 버튼을 누르면 다음 빈틈에 창이 열린다
    let result=null,startHp=null,steer=null;
    const release=async()=>{if(steer){for(const k of steer)if(k)await key(k,'up');steer=null;}};
    while(Date.now()<end) {
      const s=await check();
      if(!s.battle){if(s.ink){await wait(100);continue;}await release();await settle();log('전투 결과',{result,startHp});return {result,startHp};}
      if(startHp===null)startHp=await read('G.hp');
      if(await read("!$('bResult').hidden")){await release();result=await read('B&&B.result');await click('#bResOk');await wait(80);continue;}
      if(!s.battle.paused){
        if(await read('('+json(gifts)+').some(id=>(G.inv[id]||0)>0)')){
          if(sway){
            const h=await read('({x:B.px,l:BOX.x+BOX.w*0.2,r:BOX.x+BOX.w*0.8})');
            if(!steer||h.x<h.l||h.x>h.r){const k=h.x>(h.l+h.r)/2?'ArrowLeft':'ArrowRight';if(!steer||steer[0]!==k){await release();await key(k,'down');steer=[k,null];}}
          }else await release();
          await click('#bGift');await wait(120);continue;
        }
        // 선물이 없으면 친다: 빈틈 표식으로 손을 옮겨 J. 표식이 없으면 손을 멈추고 기다린다.
        const m=await read("B&&B.mark&&B.st==='open'?{dx:B.mark.x-B.px,dy:B.mark.y-B.py,r:battleHandProfile().radius}:null");
        const want=m?[m.dx<-6?'ArrowLeft':m.dx>6?'ArrowRight':null,m.dy<-6?'ArrowUp':m.dy>6?'ArrowDown':null]:[null,null];
        const prev=steer||[null,null];
        for(let i=0;i<2;i++)if(prev[i]!==want[i]){if(prev[i])await key(prev[i],'up');if(want[i])await key(want[i],'down');}
        steer=want[0]||want[1]?want:null;
        if(m&&Math.hypot(m.dx,m.dy)<m.r-4)await key('j');
        await wait(40);continue;
      }
      await release();
      const gift=await read(`(${json(gifts)}).find(id=>(G.inv[id]||0)>0)`);
      if(!gift)throw new Error('달래기 선물 부족: '+gifts.join(','));
      const name=await read(`ITEMS[${json(gift)}].n`);
      await textButton('#bGiftGrid button',new RegExp(name));await wait(150);
    }
    throw new Error('전투 선물/결과 처리가 60초 안에 끝나지 않았다');
  }
  // 꼭 이기거나 달래야 하는 전투. 지면 게임 규칙대로 체력이 찬 채 한 번 더 다가가 다시 싸운다(최대 세 번).
  // 선물을 다 썼으면 표식을 쳐서 싸운다(잘 이기지 못한다). 세 번 다 지면 결과와 시작 체력을 밝히고 멈춘다.
  async function mustWin(gifts,approach,label) {
    for(let i=0;i<3;i++) {
      if(i){
        const giftsLeft=await read('('+json(gifts)+').some(id=>(G.inv[id]||0)>0)');
        log('전투에서 짐, 다시 도전',{label,try:i+1,how:giftsLeft?'선물':'치기'});await approach();
      }
      const {result,startHp}=await battle(gifts);
      if(result==='win'||result==='calm')return result;
      if(i===2)throw new Error(label+': 세 번 싸워도 이기거나 달래지 못했다 (마지막 결과 '+result+', 시작 체력 '+startHp+')');
    }
  }
  async function stage(label,action) {scene=label;b.scene=label;log('시작',label);await action();const s=await check();milestones.push({scene,region:s.region,zone:s.zone,goal:s.goal,inv:s.inv,flags:s.flags,awake:s.awake});}
  async function next() {
    await settle();const s=await check();if(!s.ended)throw new Error('지역 종료가 열리지 않았다');
    const carry=await read('({inv:{...G.inv},awake:[...G.awake],clues:G.clues.map(c=>c.id),diary:G.diary.map(d=>d.id),learned:[...G.learned],rel:JSON.parse(JSON.stringify(G.rel)),arcs:G.f.arcs})');
    await b.screenshot(path.join(outDir,mode+'-'+s.region+'.png'));await click('#btnNext');
    const loss=await read(`(()=>{const c=${json(carry)},lost=[];for(const [id,n]of Object.entries(c.inv))if((G.inv[id]||0)<n)lost.push('보따리 '+id);for(const id of c.awake)if(!G.awake.includes(id))lost.push('가보 '+id);for(const id of c.clues)if(!G.clues.some(c=>c.id===id))lost.push('단서 '+id);for(const id of c.diary)if(!G.diary.some(d=>d.id===id))lost.push('일기 '+id);for(const key of c.learned)if(!G.learned.includes(key))lost.push('기록 '+key);for(const [id,r]of Object.entries(c.rel))if(G.rel[id]?.v!==r.v)lost.push('호감 '+id);if(G.f.arcs!==c.arcs)lost.push('사연 설정');return lost;})()`);
    if(loss.length)throw new Error('지역 이월 손실: '+loss.join(', '));
    log('지역 이월 보존',{from:s.region,to:await read('G.region'),checked:['보따리','가보','호감','단서','일기','학습 기록','사연 설정']});
    await click('#btnStart');await settle();
  }
  try {
    // 시계만 가속한다. 게임 상태와 판정 함수를 쓰거나 교체하지 않는다. 미니게임은 원래 속도다.
    await read(`(()=>{if(window.__qaClockInstalled)return;window.__qaClockInstalled=true;window.__qaClockRate=1;let last=null,virtual=null;const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=callback=>raf(now=>{if(last===null){last=now;virtual=now;}else{virtual+=(now-last)*window.__qaClockRate;last=now;}callback(virtual);});})()`);
    await read(`(()=>{if(window.__qaCanvas)return;window.__qaCanvas={};const p=CanvasRenderingContext2D.prototype,old=p.fillRect;p.fillRect=function(x,y,w,h){if(this.canvas.id==='steamCv'&&w===8&&['#ff7b2e','#ffb347','#e8551f'].includes(this.fillStyle))window.__qaCanvas.fire=h/.3;return old.apply(this,arguments);};})()`);
    if(await read("!$('titleScene').hidden"))await click('#tsNew');
    await click('#btnStart');await settle();
    if(await read('G.f.arcs')!==(mode==='expanded'))throw new Error('사연 켬/끔 시작값이 모드와 다르다');
    await stage('단풍골 · 가루와 채집',async()=>{await gather('root',1);await pickup('acorn',6);await gather('ssari',1);if(await read('(G.inv.ssari||0)<2'))await gather('kkoe',1);await craft('jeolgu','powder',2);await npc('dodam');});
    await stage('단풍골 · 숯과 낫',async()=>{await npc('nal',/허세/);if(!await read('G.f.nalDone&&(G.inv.coal||0)>=2'))throw new Error('허세 흥정 뒤 숯 두 개(덤)를 받지 못했다');await npc('musoe');await battle(['rice'],{sway:true});await npc('musoe');if(!await read('G.f.musoeDone'))throw new Error('낫을 받지 못했다');});
    await stage('단풍골 · 당산나무와 약',async()=>{
      if(mode==='expanded')await zone('forest');await moveX((await read('G.barrier.x'))-28);
      for(let i=0;i<5&&!await read('G.barrier.cut');i++){await key('j');await wait(400);}
      if(mode==='expanded')await zone('hill');
      const toKudzu=async()=>{await moveX(2020,{attack:true,slow:true});};
      await toKudzu();await mustWin(['ssari','kkoe'],toKudzu,'엉킨 칡');
      await gather('meoru',1);
      // 처음 만남이 먼저다(해머루를 들고 와도). 두 번째에 보따리를 펼쳐 해머루를 건넨다.
      for(let i=0;i<3&&!await read("G.diary.some(d=>d.id==='end')");i++)await npc('toad');
    });
    await next();
    await stage('돌너머 · 억새와 메밀',async()=>{await gather('eoksae',3);await pickup('memil',6);for(let i=0;i<15&&!await read('G.f.kkuDone');i++){await npc('kkubeogi');await wait(180);}if(!await read('G.f.kkuDone'))throw new Error('꾸벅이가 깨어 있을 때 교환하지 못했다');});
    await stage('돌너머 · 맷돌과 길',async()=>{await npc('nal');await npc('dolsoe');await craft('maetdol','memil_powder',2);await npc('ppuri');if(!await read('G.f.ppuriPassed'))await npc('ppuri');});
    await stage('돌너머 · 골렘과 약즙',async()=>{
      if(mode==='expanded')await zone('shrine');const toGolem=async()=>{await moveX(mode==='expanded'?2330:1920);};await toGolem();await mustWin(['story_stone'],toGolem,'돌 골렘');
      await pickup('seoridarae');await craft('maetdol','darae_yak');
      if(mode==='expanded') {await zone('village');const n=await read("zoneObjects('wanderers').find(n=>n.name==='늙은 까치')&&(({x,y})=>({x,y:y??192}))(zoneObjects('wanderers').find(n=>n.name==='늙은 까치'))");if(!n)throw new Error('약즙 배달 까치가 마을에 없다');await jumpTo(n.x,n.y);await key('e');await settle();}
    });
    await next();
    await stage('큰 장터 · 장단과 쌀',async()=>{await pickup('solbang',5);await npc('yeotbang');if(!await read('G.f.yeotDone&&(G.inv.ssal||0)===8'))throw new Error('장단 뒤 쌀 8개를 받지 못했다');await craft('maetdol','ssal_powder',7);});
    await stage('큰 장터 · 시루와 고사떡',async()=>{
      for(let i=0;i<3&&!await read('G.f.steamDone');i++)await npc('morak');
      if(!await read('G.f.steamDone'))throw new Error('모락에게 시루를 깨우지 못했다');
      await npc('nal');await craft('siru','patsirutteok');await craft('siru','memiltteok');
      for(let i=0;i<3&&!await read('G.f.night');i++)await npc('maru');
      if(!await read('G.f.night'))throw new Error('숙소에서 쉬어도 밤이 되지 않았다');
      for(let i=0;i<3&&!await read('G.f.guard');i++)await npc('bueong');
      if(!await read('G.f.guard'))throw new Error('부엉 영감의 창고 지키기 허락을 받지 못했다');
    });
    await stage('큰 장터 · 도깨비와 약떡',async()=>{if(mode==='expanded')await zone('warehouse');const toStore=async()=>{await moveX(await read('REG.STORE_X'));};await toStore();await mustWin(['memiltteok','dad_yeot'],toStore,'헌물 도깨비');if(!await read("has('dokkaebibul')"))throw new Error('도깨비 달래기 뒤 불씨가 없다');await craft('siru','hongsi_tteok');if(mode==='expanded'&&!await read('G.ended')){await zone('inn');await moveX(1530);await settle();}});
    await next();
    await stage('영산 · 설피',async()=>{await pickup('jip');await gather('darae_vine',2);for(let i=0;i<3&&!await read('G.f.seolpi');i++)await npc('nal');if(!await read('G.f.seolpi'))throw new Error('설피를 받지 못했다');});
    await stage('영산 · 살금이와 아빠',async()=>{await pickup('magamok',3);for(let i=0;i<3&&!await read('G.f.salgDone');i++)await npc('salgeumi');if(!await read('G.f.salgDone'))throw new Error('살금이에게 지름길을 듣지 못했다');for(let i=0;i<3&&!await read('G.f.dadDone');i++)await npc('dad');if(!await read('G.f.dadDone'))throw new Error('아빠 몸짓 읽기를 마치지 못했다');if(mode==='expanded')for(let i=0;i<3;i++)await npc('y_ice_station_'+i);});
    await stage('영산 · 봄과 열매',async()=>{await npc('sangun');const toSteel=async()=>{await moveX(2050);};await toSteel();await mustWin(['dokkaebibul'],toSteel,'강철이');await pickup('legend_fruit');await npc('sangun');});
    const final=await settle();if(!final.ended||final.region!=='yeongsan'||!final.flags.yakDone)throw new Error('마지막 귀향과 엔딩에 도착하지 못했다');
    // 결정 D-73: 엔딩은 한 줄씩 넘긴다. 이름 칸이 나올 때까지 '다음'을 누르고, 이름을 부른 뒤에도 끝까지 넘긴다.
    for(let i=0;i<12&&!await read("!!$('newName')");i++){await click('#endExtra .end-next');await wait(80);}
    if(!await read("$('endButtons').hidden"))throw new Error('엔딩 대사가 끝나기 전에 아래 버튼이 보인다');
    await click('#newName');await b.send('Input.insertText',{text:'새봄'});await textButton('#endExtra button',/부르기/);await wait(1100);
    for(let i=0;i<8&&await read("$('endButtons').hidden");i++){if(await read("!!document.querySelector('#endExtra .end-next')"))await click('#endExtra .end-next');await wait(120);}
    if(await read("$('endButtons').hidden"))throw new Error('엔딩을 끝까지 넘겨도 아래 버튼이 나오지 않는다');
    if(await read('G.f.newName')!=='새봄')throw new Error('엔딩 이름 입력이 저장되지 않았다');
    await b.screenshot(path.join(outDir,mode+'-ending.png'));
  } catch(error) {
    let state;try{state=await snapshot();}catch(_){}
    const shot=path.join(outDir,mode+'-failure.png');try{await b.screenshot(shot);}catch(_){}
    findings.push({rule:'playthrough',severity:'치명',scene,region:state?.region,zone:state?.zone,goal:state?.goal,stuckSeconds:Math.round((Date.now()-goalSince)/1000),message:error.message,expected:'새 게임부터 네 지역과 이름 입력 엔딩까지 실제 입력으로 진행',actual:state,screenshot:path.basename(shot),steps:trace.slice(-30)});
  }
  const evidence={mode,durationSeconds:+((Date.now()-started)/1000).toFixed(2),milestones,edgeRegions:[...edgeRegions],inputMethod:'CDP 키보드·마우스, 상태 읽기 전용, 새 게임 시작',clock:'이동 중 requestAnimationFrame 시계 6배, 대화·미니게임 1배. 실제 조작감/초행 시간 검증 아님.',traceFile:mode+'-trace.json'};
  fs.writeFileSync(path.join(outDir,mode+'-trace.json'),JSON.stringify({evidence,trace,findings},null,2)+'\n','utf8');
  return {name:'playthrough-'+mode,status:findings.length?'fail':'pass',summary:findings.length?`${mode} 연속 플레이 실패: ${scene}`:`${mode} 새 게임 → 네 지역 → 엔딩·새 이름 통과`,findings,evidence};
}
module.exports={runPlaythrough};
