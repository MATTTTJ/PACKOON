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
  const snapshot = async () => read(`({region:G.region,zone:G.zone,x:G.px,y:G.py,ground:G.onGround,goal:REG.goal(),started:G.started,ended:G.ended,inv:{...G.inv},flags:{...G.f},awake:[...G.awake],dlg:!$('dlg').hidden,note:!$('notebook').hidden,who:$('dlgWho').textContent,choices:[...$('dlgChoices').children].map(e=>e.textContent),text:$('dlgText').textContent,mg:openMinigame()?.id,battle:B?{kind:B.kind,st:B.st,paused:B.paused,result:B.result,calm:B.calm}:null,ink:inkOn,motion:!!zoneMotion,fade:zoneFade,still:!!REG.holdStill?.()})`);
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
  const defaults=[/북쪽으로 떠난다/,/아빠와 집으로 돌아간다/,/제 이름을 드릴게요/,/말이… 안 나와/,/내가… 아기였을 때/,/나 주려고/,/건넨다|보따리를 펼친다|달여 드린다|고사상에 올린다|약즙을 맡긴다/,/돌 쌓기를 배운다|맷돌 돌리는 법을 배운다|맷돌에 손을 얹는다/,/낫과 시험|낫 이야기/,/하던 이야기 계속/,/해머루 이야기/,/같이 찾아볼게/,/산길로 간다|길을 나선다/,/그만두기|다음에 이야기|다음에 올게|더 둘러|생각해|조금 이따/];
  async function settle(prefer) {
    let s;
    for(let i=0;i<200;i++) {
      s=await check();
      if(await read("!$('notebook').hidden")){await click('#noteClose');await wait(40);continue;}
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
      // 결정 D-1163: 이야기가 손을 떼고 버티라는 동안(REG.holdStill, 영산 두루미 사건)은 아무것도 누르지 않고 기다린다
      if(s.ink||s.motion||s.fade||s.still){await wait(100);continue;}
      return s;
    }
    throw new Error('대화/미니게임이 200회 입력 뒤에도 닫히지 않는다'+(s.dlg?'. 마지막 줄: '+s.who+': '+s.text:s.mg?'. 미니게임: '+s.mg:''));
  }
  // 결정 D-39: 교환 화면. 진행에 필요한 부탁(선택 교환 t_craft_ 제외) 중 지금 보따리로 맞출 수 있는 첫 조합을
  // 실제 클릭으로 고르고 얹어 제안한다. prefer가 흥정 방식(허세·사정·칭찬)과 맞으면 먼저 흥정한다.
  async function trade(prefer) {
    const ways=await read("[...document.querySelectorAll('.trade-haggle button[data-way]')].filter(b=>!b.disabled).map(b=>b.dataset.way)");
    const way=prefer&&ways.find(w=>prefer.test(w));
    if(way){log('흥정',way);await click('.trade-haggle button[data-way="'+way+'"]');await wait(40);}
    const plan=await read("(()=>{const S=Trade.state;if(!S)return null;for(const g of S.goods){if(g.kind!=='story'||g.id.startsWith('t_craft_')||g.locked?.()||g.done?.())continue;const i=g.asks.findIndex(a=>Object.entries(a).every(([id,n])=>has(id,n)));if(i>=0)return {good:g.id,ask:g.asks[i]};}return null;})()");
    if(!plan){log('교환 화면','맞출 부탁 없음');await click('#tradeClose');await wait(40);return;}
    log('교환',plan);await click('.trade-good[data-good="'+plan.good+'"]');
    for(const [id,n] of Object.entries(plan.ask))for(let i=0;i<n;i++)await click('.slot[data-item="'+id+'"]');
    await click('#tradePropose');await wait(60);
    if(await read("!$('trade').hidden"))throw new Error('교환 화면에서 제안이 받아들여지지 않았다: '+await read("document.querySelector('.trade-log')?.textContent"));
  }
  async function minigame(id) {
    log('미니게임',id);const end=Date.now()+45000;
    while(Date.now()<end) {
      const s=await check();if(s.mg!==id)return;
      // 손일 미니게임(쇠 벼리기·돌 쌓기·김 올리기·함께 하는 일)은 PR #81(D-88)에서 지웠다. 엿가위 장단은 D-565에서 뺐다. 남은 것은 이동 연출뿐이다.
      if(id==='dolWishStack') {
        // 결정 D-229: 돌 셋을 얹는 장면은 저절로 흐른다. 아무것도 누르지 않고 끝날 때까지 기다린다.
        await wait(100);
      }else if(id==='dolDepthTravel') {
        await wait(100);
      }else if(id==='cine') {
        // 결정 D-1260: 회상 장면(engine/cine.js)은 자막마다 E 로 넘긴다. 건너뛰지 않고 컷을 모두 지나간다.
        const at=await read('Cine.state');log('회상 장면',at);
        await key('e');await wait(520);
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
        // 쪽지·수첩 창이 걷는 도중에 열려도 닫고 다시 걷는다 (새 게임 첫 프레임의 엄마 쪽지가 늦게 열리는 경우)
        if(s.dlg||s.note||s.mg||s.ink||s.motion||s.fade||s.still){if(held){await key(held,'up');held=null;}await settle();continue;}
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
      const unlocked=()=>b.until('!brewing',{label:'가공 연출 끝'});
      await unlocked();
      await click(`#bagBody .recipe:nth-child(${idx+1})`);
      await b.until("!!$('craftBtn')&&!$('craftBtn').disabled",{label:'가공 버튼 풀림'});
      await click('#craftBtn');
      // 결정 D-113: 가공은 손 동작 한 번으로 끝난다. 플레이어처럼 첫 동작 단추(맷돌은 왼쪽으로 돌리기)를 누른다.
      // 예전엔 이 단추를 누르지 않아 가공마다 10초를 기다린 뒤 보따리를 닫아 끝냈다.
      await b.until("!!document.querySelector('#craftHands [data-craft]')",{label:'가공 손 동작 단추'});
      await click('#craftHands [data-craft]');
      await unlocked();await click('#bagClose');await wait(100);await settle();
    }
  }
  // 결정 D-441: 가공법 단추 없이 플레이어처럼 재료를 하나씩 '○○에 넣기'로 넣고 가공한다.
  // 위 craft()는 가공법 단추로 꼭 한 몫만 채워서, 쌀 셋을 넣으면 맷돌이 안 돌던 버그를 못 잡았다.
  async function craftByHand(tool,item,put,out,expect) {
    await settle();await key('i');await wait(50);
    await b.until('!brewing',{label:'가공 연출 끝'});
    const toolIndex=await read(`Object.keys(HEIR).indexOf(${json(tool)})`);
    await click(`#bagBody .tooltab:nth-child(${toolIndex+1})`);
    const before=await read(`G.inv[${json(out)}]||0`);
    for(let i=0;i<put;i++){
      const slot=await read(`[...document.querySelectorAll('#bagBody .bag-grid .slot')].findIndex(s=>(s.getAttribute('aria-label')||'').startsWith(ITEMS[${json(item)}].n+' '))`);
      if(slot<0)throw new Error('보따리에 없음: '+item);
      await click(`#bagBody .bag-grid .slot:nth-child(${slot+1})`);
      const put=await read(`[...document.querySelectorAll('#bagBody .detail .row button')].findIndex(x=>x.textContent.endsWith('에 넣기'))`);
      if(put<0)throw new Error('넣기 단추 없음: '+item);
      await click(`#bagBody .detail .row button:nth-child(${put+1})`);
    }
    await b.until("!!$('craftBtn')&&!$('craftBtn').disabled",{label:'가공 버튼 풀림'});
    await click('#craftBtn');
    const started=await read('brewing');
    if(!started)throw new Error(`${tool}에 ${item} ${put}개를 넣고 가공했는데 안 됐다: `+await read("$('benchMsg')?.textContent||pouchMsg"));
    await b.until("!!document.querySelector('#craftHands [data-craft]')",{label:'가공 손 동작 단추'});
    await click('#craftHands [data-craft]');
    await b.until('!brewing',{label:'가공 연출 끝'});await click('#bagClose');await wait(100);await settle();
    const got=await read(`(G.inv[${json(out)}]||0)-${before}`);
    if(got!==expect)throw new Error(`${item} ${put}개로 ${out}이 ${expect}개 나와야 하는데 ${got}개`);
  }
  // 전투 결과를 돌려준다. 졌다면 뒤 단계의 엉뚱한 오류(예: 해머루 없음)로 번지지 않게 mustWin이 밝힌다.
  // 손 조종은 battleLoop(아래, 모듈 밖에서도 같은 코드로 시험한다)가 한다.
  async function battle(gifts,opts={}) {
    scene=scene.replace(/ · 전투$/,'')+' · 전투';
    const r=await battleLoop({read,wait,key,click,textButton,tick:check},gifts,opts);
    await settle();log('전투 결과',r);return r;
  }
  // 꼭 이기거나 달래야 하는 전투. 지면 게임 규칙대로 체력이 찬 채 한 번 더 다가가 다시 싸운다(최대 세 번).
  // 선물을 다 썼으면 표식을 쳐서 싸운다(잘 이기지 못한다). 세 번 다 지면 결과와 시작 체력을 밝히고 멈춘다.
  async function mustWin(gifts,approach,label,opts={}) {
    for(let i=0;i<3;i++) {
      if(i){
        const giftsLeft=await read('('+json(gifts)+').some(id=>(G.inv[id]||0)>0)');
        log('전투에서 짐, 다시 도전',{label,try:i+1,how:giftsLeft?'선물':'치기'});await approach();
      }
      const {result,startHp}=await battle(gifts,opts);
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
    if(await read("!$('titleScene').hidden"))await click('#tsNew');
    await click('#btnStart');
    // 엄마 쪽지는 새 게임 첫 필드 프레임에 펼쳐지고 독백 대화가 붙는다(notebook.js showMomNote, 결정 D-704). settle이 대화를 넘긴다.
    await b.until('G.started&&G.f.momNoteSeen',{label:'새 게임 엄마 쪽지'});
    await settle();
    if(await b.eval("!$('bag').hidden||!$('notebook').hidden"))throw new Error('시작 쪽지 창을 닫지 못했다');
    if(await read('G.f.arcs')!==(mode==='expanded'))throw new Error('사연 켬/끔 시작값이 모드와 다르다');
    await stage('단풍골 · 가루와 채집',async()=>{await gather('root',1);await pickup('acorn',6);await gather('ssari',1);if(await read('(G.inv.ssari||0)<2'))await gather('kkoe',1);await craft('jeolgu','powder',2);await npc('dodam');});
    await stage('단풍골 · 숯과 낫',async()=>{await npc('nal',/허세/);if(!await read('G.f.nalDone&&(G.inv.coal||0)>=2'))throw new Error('허세 흥정 뒤 숯 두 개(덤)를 받지 못했다');await npc('musoe');await battle(['rice'],{sway:true});await npc('musoe');if(!await read('G.f.musoeDone'))throw new Error('낫을 받지 못했다');});
    await stage('단풍골 · 당산나무와 약',async()=>{
      if(mode==='expanded')await zone('forest');await moveX((await read('G.barrier.x'))-28);
      for(let i=0;i<5&&!await read('G.barrier.cut');i++){await key('j');await wait(400);}
      if(mode==='expanded')await zone('hill');
      const toKudzu=async()=>{await moveX(2020,{attack:true,slow:true});};
      await toKudzu();await mustWin(['ssari','kkoe'],toKudzu,'엉킨 칡',{dodge:true});
      await gather('meoru',1);
      // 처음 만남이 먼저다(해머루를 들고 와도). 두 번째에 보따리를 펼쳐 해머루를 건넨다.
      for(let i=0;i<3&&!await read("G.diary.some(d=>d.id==='end')");i++)await npc('toad');
    });
    await next();
    await stage('돌너머 · 억새와 메밀',async()=>{await gather('eoksae',3);await pickup('memil',6);for(let i=0;i<15&&!await read('G.f.kkuDone');i++){await npc('kkubeogi');await wait(180);}if(!await read('G.f.kkuDone'))throw new Error('꾸벅이가 깨어 있을 때 교환하지 못했다');});
    await stage('돌너머 · 맷돌과 길',async()=>{await npc('nal');await npc('dolsoe');await craft('maetdol','memil_powder',2);await npc('ppuri');if(!await read('G.f.ppuriPassed'))await npc('ppuri');});
    await stage('돌너머 · 골렘과 약즙',async()=>{
      // 결정 D-229: 고갯길 소원 돌탑에 돌 셋을 얹는 장면이 끝까지 흐르고 소원을 빈다 (사연 판에만 있는 길섶 돌탑)
      if(mode==='expanded'){await zone('gate');await moveX(await read("zoneObjects('doors').find(d=>d.wishTower).x"));await key('e');await settle(/돌을 골라/);if(!await read('G.f.dolWishTower'))throw new Error('소원 돌탑에 돌 셋을 얹지 못했다');}
      if(mode==='expanded')await zone('shrine');const toGolem=async()=>{await moveX(mode==='expanded'?2330:1920);};await toGolem();await mustWin(['story_stone'],toGolem,'돌 골렘');
      await pickup('seoridarae');await craft('maetdol','darae_yak');
      if(mode==='expanded') {await zone('village');const n=await read("zoneObjects('wanderers').find(n=>n.name==='늙은 까치')&&(({x,y})=>({x,y:y??192}))(zoneObjects('wanderers').find(n=>n.name==='늙은 까치'))");if(!n)throw new Error('약즙 배달 까치가 마을에 없다');await jumpTo(n.x,n.y);await key('e');await settle();}
    });
    await next();
    await stage('큰 장터 · 솔방울과 쌀',async()=>{await pickup('solbang',5);await npc('yeotbang');if(!await read('G.f.yeotDone&&(G.inv.ssal||0)===8'))throw new Error('솔방울 다섯을 주고 쌀 8개를 받지 못했다');await craftByHand('maetdol','ssal',3,'ssal_powder',3);await craftByHand('maetdol','ssal',3,'ssal_powder',3);await craft('maetdol','ssal_powder');});
    await stage('큰 장터 · 시루와 고사떡',async()=>{
      for(let i=0;i<3&&!await read('G.f.steamDone');i++)await npc('morak');
      if(!await read('G.f.steamDone'))throw new Error('모락에게 시루를 깨우지 못했다');
      await npc('nal');await craft('siru','patsirutteok');await craft('siru','memiltteok');
      for(let i=0;i<3&&!await read('G.f.night');i++)await npc('maru');
      if(!await read('G.f.night'))throw new Error('숙소에서 쉬어도 밤이 되지 않았다');
      for(let i=0;i<3&&!await read('G.f.guard');i++)await npc('bueong');
      if(!await read('G.f.guard'))throw new Error('부엉 영감의 창고 지키기 허락을 받지 못했다');
    });
    await stage('큰 장터 · 도깨비와 약떡',async()=>{if(mode==='expanded')await zone('warehouse');const toStore=async()=>{await moveX(await read('REG.STORE_X'));
        // 결정 D-684: 창고 앞엔 기척만 다가온다. 플레이어처럼 수리부엉이(3)로 변신해 모습을 밝혀야 전투가 열린다
        for(let i=0;i<80&&!await read('!!B');i++){const s=await settle();if(s.battle)break;if(await read("!B&&G.form!=='owl'&&formChangeAllowed()"))await key('3');await wait(120);}
        if(!await read('!!B'))throw new Error('수리부엉이로 변신해도 눈도깨비 전투가 열리지 않았다');};
      await toStore();await mustWin(['memiltteok','dad_yeot'],toStore,'눈도깨비');if(!await read("has('dokkaebibul')"))throw new Error('도깨비 달래기 뒤 불씨가 없다');await craft('siru','hongsi_tteok');
      // 결정 D-131: 그믐밤엔 늙은 까치가 밤길을 못 난다. 마루에서 자고 설날 아침에 맡긴다(그 아침에 사연 마지막 막이 열린다).
      if(mode==='expanded'&&!await read('G.ended')){
        await zone('inn');const magpie="REG.zones.inn.wanderers.find(w=>w.id==='j_magpie').x";
        await jumpTo(await read(magpie),192);await settle();
        if(!await read('G.f.jxMagpieNight')){await key('e');await settle();}
        if(await read('G.ended'))throw new Error('그믐밤에 약떡을 보내 설날 아침을 건너뛰었다');
        if(!await read('G.f.jxMagpieNight'))throw new Error('밤에 까치가 쉬어 가자는 말을 하지 않았다');
        for(let i=0;i<3&&await read('G.f.night');i++)await npc('maru');
        if(await read('G.f.night')||!await read('G.f.jxSeollal'))throw new Error('마루에서 자도 설날 아침이 오지 않았다');
        await jumpTo(await read(magpie),192);await settle(/맡긴다/);
        if(!await read('G.ended')){await key('e');await settle(/맡긴다/);}
      }});
    await next();
    await stage('영산 · 설피',async()=>{await pickup('jip');await gather('darae_vine',2);for(let i=0;i<3&&!await read('G.f.seolpi');i++)await npc('nal');if(!await read('G.f.seolpi'))throw new Error('설피를 받지 못했다');});
    await stage('영산 · 살금이와 아빠',async()=>{await pickup('magamok',3);for(let i=0;i<3&&!await read('G.f.salgDone');i++)await npc('salgeumi');if(!await read('G.f.salgDone'))throw new Error('살금이에게 지름길을 듣지 못했다');for(let i=0;i<3&&!await read('G.f.dadDone');i++)await npc('dad');if(!await read('G.f.dadDone'))throw new Error('넋 빠진 아빠를 만나지 못했다');});
    // 결정 D-1184: 확장판은 길손 움막의 둘째 짚단을 빈 지게 할아버지 곁에 놓아 짚신(어둑차사 진정 선물)을 받는다.
    if(mode!=='expanded')await stage('영산 · 짚신',async()=>{await pickup('jipsin');});   // 결정 D-1186: 옛 구성은 아빠 곁 짚신
    if(mode==='expanded')await stage('영산 · 짚신',async()=>{await pickup('jip');await zone('shore');
      const w=await read("(()=>{const w=zoneObjects('wanderers').find(w=>w.id==='y_lost_jige');return w&&{x:w.x,y:w.y??192};})()");
      if(!w)throw new Error('빈 지게 할아버지가 호숫가에 없다');await jumpTo(w.x,w.y);await key('e');await settle(/짚 한 단/);
      if(!await read('(G.inv.jipsin||0)>0'))throw new Error('짚신을 받지 못했다');});
    // 결정 D-1366 (name-story-v4 §4): 열매 줍기와 이름 셈을 뺐다. 이기면 아빠를 불러 데려오고, 두루미 곁에서 명패를 다시 건다
    await stage('영산 · 봄과 명패',async()=>{await npc('durumi');const toSteel=async()=>{await moveX(2050);};await toSteel();await mustWin(['jipsin','rice'],toSteel,'어둑차사',{dodge:true});await npc('durumi');if(!await read('G.f.yakDone'))await npc('durumi');});
    const final=await settle();if(!final.ended||final.region!=='yeongsan'||!final.flags.yakDone)throw new Error('마지막 귀향과 엔딩에 도착하지 못했다');
    // 결정 D-73: 엔딩은 한 줄씩 넘긴다. 이름 칸이 나올 때까지 '다음'을 누르고, 이름을 부른 뒤에도 끝까지 넘긴다.
    log('엔딩 넘김',{toName:await b.endingToName()});
    if(!await read("$('endButtons').hidden"))throw new Error('엔딩 대사가 끝나기 전에 아래 버튼이 보인다');
    await click('#newName');await b.send('Input.insertText',{text:'새봄'});await textButton('#endExtra button',/부르기/);await wait(1100);
    log('엔딩 넘김',{toButtons:await b.finishEnding()});
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
/* PA-201: 전투 손 조종. 상태를 읽고 키·클릭만 보낸다 (게임 상태·판정은 건드리지 않는다).
   선물이 있으면 선물 버튼을 눌러 두고 다음 빈틈을 기다린다. 선물이 없으면 빈틈 표식으로 도구 날(bAim, 결정 D-240)을 옮겨 친다.
   sway: 기다리는 동안 칸 가운데를 좌우로 오간다 (무쇠 꿀밤처럼 손 자리를 노리는 공격).
   dodge: 기다리는 동안 칸 안의 공격 예고를 읽고 피한다. 예전에는 선물을 기다리는 내내 손을 세워 두어 엉킨 칡의 채찍·뿌리·꽃가루를
     다 맞고 가끔 졌다(자동 검사 연속 플레이가 칡에게 지던 문제). 띠 공격(ox·dx·L)은 띠 밖 옆쪽으로, 자리 공격(x·y)은 그 자리에서 멀어진다. */
const DODGE_KEYS=`(()=>{if(!B)return [null,null];const h={x:B.px,y:B.py},half=0.21*BOX.h+12,R=44;let vx=0,vy=0,n=0;
  for(const b of B.bullets){if(b.dead||b.k==='chasaSeam')continue;   // 도포 솔기는 피할 것이 아니라 칠 곳이다
    if(b.ox!=null&&b.dx!=null&&b.L!=null){if(b.t>(b.delay||0)+60)continue;
      const rx=h.x-b.ox,ry=h.y-b.oy,s=rx*b.dx+ry*b.dy,d=-rx*b.dy+ry*b.dx;
      if(s>-half&&s<b.L+half&&Math.abs(d)<half){const sg=d>=0?1:-1,w=1+(half-Math.abs(d))/half;vx+=-b.dy*sg*w;vy+=b.dx*sg*w;n++;}}
    else if(b.x!=null&&b.y!=null){const rx=h.x-b.x,ry=h.y-b.y,dd=Math.hypot(rx,ry);
      if(dd<R){const u=dd<1?{x:h.x<BOX.x+BOX.w/2?1:-1,y:0}:{x:rx/dd,y:ry/dd},w=1+(R-dd)/R;vx+=u.x*w;vy+=u.y*w;n++;}}}
  const m=24;if(h.x<BOX.x+m)vx+=1.5;if(h.x>BOX.x+BOX.w-m)vx-=1.5;if(h.y<BOX.y+m)vy+=1.5;if(h.y>BOX.y+BOX.h-m)vy-=1.5;
  if(!n){const cx=BOX.x+BOX.w/2,cy=BOX.y+BOX.h/2;if(Math.abs(h.x-cx)>BOX.w*0.2)vx+=Math.sign(cx-h.x)*0.6;if(Math.abs(h.y-cy)>BOX.h*0.2)vy+=Math.sign(cy-h.y)*0.6;}
  return [vx<-0.3?'ArrowLeft':vx>0.3?'ArrowRight':null,vy<-0.3?'ArrowUp':vy>0.3?'ArrowDown':null];})()`;
async function battleLoop(io,gifts,{sway=false,dodge=false}={}) {
  const {read,wait,key,click,textButton}=io,json=JSON.stringify;
  const end=Date.now()+60000;   // 결정 D-64: 선물은 빈틈에만. 선물 버튼을 누르면 다음 빈틈에 창이 열린다
  let result=null,startHp=null,steer=null;
  const release=async()=>{if(steer){for(const k of steer)if(k)await key(k,'up');steer=null;}};
  const hold=async want=>{const prev=steer||[null,null];
    for(let i=0;i<2;i++)if(prev[i]!==want[i]){if(prev[i])await key(prev[i],'up');if(want[i])await key(want[i],'down');}
    steer=want[0]||want[1]?want:null;};
  while(Date.now()<end) {
    if(io.tick)await io.tick();
    const s=await read('({battle:!!B,ink:inkOn,paused:!!(B&&B.paused)})');
    if(!s.battle){if(s.ink){await wait(100);continue;}await release();return {result,startHp};}
    if(startHp===null)startHp=await read('G.hp');
    if(await read("!$('bResult').hidden")){await release();result=await read('B&&B.result');await click('#bResOk');await wait(80);continue;}
    if(!s.paused){
      // 결정 D-876: 칠 자리는 모든 보스에서 판 안쪽 영역(bMarkZone)에 든다. 아래쪽 끝이나 모서리에 뜨면 도구 끝이 못 닿는다
      const out=await read("B&&B.mark&&!bInMarkZone(B.mark)?{kind:B.kind,part:B.mark.part.id,x:Math.round(B.mark.x-BOX.x),y:Math.round(B.mark.y-BOX.y)}:null");
      if(out){await release();throw new Error(`칠 자리가 판 안쪽 영역 밖에 떴다: ${out.kind} ${out.part} (판 안 ${out.x},${out.y})`);}
      // 결정 D-1185: 어둑차사의 세 번째 부름(삼혼 부르기) 동안은 손을 떼고 멈춘다. 플레이어가 배우는 그대로다(두루미 사건)
      if(await read("!!(B&&B.st==='ncall'&&B.names&&B.names.call&&B.names.call.k>=3)")){await release();await wait(40);continue;}
      // 결정 D-1272: 붉은 오랏줄에 묶이면 손 곁 칠 곳으로 도구 날을 옮겨 빠르게 쳐서 끊는다(묶인 손은 조금만 움직인다)
      const bind=await read("B&&B.ch&&B.ch.bind?{dx:B.ch.bind.sx-bAim().x,dy:B.ch.bind.sy-bAim().y}:null");
      if(bind){const near=(d,lo,hi)=>d<-3?lo:d>3?hi:null;await hold([near(bind.dx,'ArrowLeft','ArrowRight'),near(bind.dy,'ArrowUp','ArrowDown')]);
        await key('j');await wait(60);continue;}
      // 결정 D-1323: 도포 속에 갇혀 솔기에 빛이 갈라지면 그 칠 곳으로 도구 날을 옮겨 쳐서 찢고 나온다
      const seam=await read("(()=>{const s=B&&B.bullets.find(q=>q.k==='chasaSeam'&&q.ph==='lit'&&q.lit>0.6);return s?{dx:s.x-bAim().x,dy:s.y-bAim().y}:null;})()");
      if(seam){   // 빈틈 표식과 같이: 멀면 누르고 있고, 10px 안에서는 톡톡 눌러 맞춘 뒤 친다
        const far=(d,lo,hi)=>d<-10?lo:d>10?hi:null,near=(d,lo,hi)=>d<-3?lo:d>3?hi:null;await hold([far(seam.dx,'ArrowLeft','ArrowRight'),far(seam.dy,'ArrowUp','ArrowDown')]);
        if(!steer){for(const k of [near(seam.dx,'ArrowLeft','ArrowRight'),near(seam.dy,'ArrowUp','ArrowDown')].filter(Boolean)){await key(k,'down');await wait(12);await key(k,'up');}
          if(Math.hypot(seam.dx,seam.dy)<9)await key('j');}
        await wait(40);continue;}
      if(await read('('+json(gifts)+').some(id=>(G.inv[id]||0)>0)')){
        if(dodge)await hold(await read(DODGE_KEYS));
        else if(sway){
          const h=await read('({x:B.px,l:BOX.x+BOX.w*0.2,r:BOX.x+BOX.w*0.8})');
          if(!steer||h.x<h.l||h.x>h.r){const k=h.x>(h.l+h.r)/2?'ArrowLeft':'ArrowRight';if(!steer||steer[0]!==k){await release();await key(k,'down');steer=[k,null];}}
        }else await release();
        await click('#bGift');await wait(dodge?40:120);continue;
      }
      // 선물이 없으면 친다: 빈틈 표식으로 도구 날 자리(bAim, 결정 D-240)를 옮겨 J. 표식이 없으면 손을 멈추고 기다린다(dodge 면 피한다).
      const m=await read("B&&B.mark&&B.st==='open'?{dx:B.mark.x-bAim().x,dy:B.mark.y-bAim().y,r:battleHandProfile().radius}:null");
      // 결정 D-501: 도구 범위가 좁아져(너구리 손 9px) 멀면 누르고 있고, 10px 안에서는 짧게 톡톡 눌러 3px 안까지 맞춘다
      const far=(d,lo,hi)=>d<-10?lo:d>10?hi:null,near=(d,lo,hi)=>d<-3?lo:d>3?hi:null;
      const want=m?[far(m.dx,'ArrowLeft','ArrowRight'),far(m.dy,'ArrowUp','ArrowDown')]:dodge?await read(DODGE_KEYS):[null,null];
      await hold(want);
      if(m&&!steer){const taps=[near(m.dx,'ArrowLeft','ArrowRight'),near(m.dy,'ArrowUp','ArrowDown')].filter(Boolean);
        for(const k of taps){await key(k,'down');await wait(12);await key(k,'up');}}
      if(m&&!steer&&await read("B&&B.mark&&Math.hypot(B.mark.x-bAim().x,B.mark.y-bAim().y)<battleHandProfile().radius-1"))await key('j');
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
module.exports={runPlaythrough,battleLoop};
