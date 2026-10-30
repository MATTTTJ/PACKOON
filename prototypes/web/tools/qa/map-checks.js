'use strict';

// 상태를 명시해 만든 격리 회귀 검사다. 두 모드 연속 플레이의 관찰 기록과 구분한다.
const fs=require('node:fs');
const path=require('node:path');
const {measureScene}=require('./runtime-checks');
const regions=['galchamgol','dolneomeo','jangteo','yeongsan'];
const j=JSON.stringify;
async function until(b,expression,limit=8000){
  const end=Date.now()+limit;
  while(Date.now()<end){if(await b.eval(expression))return;await b.wait(25);}
  throw Error('지도 검사 대기 초과: '+expression);
}
async function ready(b,classic=false){
  await b.navigate(b.url+(classic?'?classic=1':''));
  await b.eval("(()=>{localStorage.clear();TitleScreen.close();G=newGame();G.started=true;G.f.momNoteSeen=true;resetScreens();closePanels();})()");
}
const button=(region,zone)=>`#map [data-region="${region}"][data-zone="${zone}"]`;
async function runMap({browser:b,outDir}){
  const findings=[],records=[],images=[];
  const check=(ok,rule,message,actual)=>{if(!ok)findings.push({rule,severity:'높음',message,actual});};
  async function picture(name){const file=path.join(outDir,name+'.png');await b.screenshot(file);images.push(file);return file;}
  async function travel(region,zone,{capture=false,touch=false}={}){
    if(await b.eval("$('map').hidden")){if(touch)await b.touch(await b.eval("$('btnMap').getClientRects().length?'#btnMap':'#padMap'"));else await b.key('m');}
    await until(b,"!$('map').hidden");
    if(touch)await b.touch(button(region,zone));else await b.click(button(region,zone));
    const reduced=await b.eval('Vfx.reducedMotion');
    if(touch)await b.touch('#mapTravel');else await b.click('#mapTravel');
    if(reduced)check(await b.eval('!mapTravel'),'map-reduced-immediate','동작 줄이기에서 이동 입력 직후에도 비행 연출이 진행 중이다.');
    if(capture){
      await until(b,'!!mapTravel&&mapTravel.elapsed/mapTravel.duration>=0.23');
      records.push({stage:'flight-first',state:await b.eval('({elapsed:mapTravel.elapsed,duration:mapTravel.duration,to:mapTravel.to})')});await picture('map-flight-lift');
      const pausedAt=await b.eval("(()=>{dispatchEvent(new Event('blur'));return mapTravel.elapsed;})()");await b.wait(120);
      const resumedAt=await b.eval("(()=>{const elapsed=mapTravel.elapsed;dispatchEvent(new Event('focus'));return elapsed;})()");
      check(pausedAt===resumedAt,'map-flight-pause','창을 떠난 동안 까치 비행 시간이 흘렀다.',{pausedAt,resumedAt});
      await until(b,'!!mapTravel&&mapTravel.elapsed/mapTravel.duration>=0.59');
      records.push({stage:'flight-second',state:await b.eval('({elapsed:mapTravel.elapsed,duration:mapTravel.duration,to:mapTravel.to})')});await picture('map-flight-ridge');
    }
    await until(b,`!mapTravel&&G.region===${j(region)}&&G.zone===${j(zone)}`);
    check(await b.eval("$('map').hidden&&!zoneMotion&&zoneFade===0"),'map-travel-finish','까치 이동 뒤 지도나 전환 상태가 남았다.');
  }
  try{
    await ready(b);b.scene='map / locked';
    const soundBefore=await b.eval('Sound.enabled');await b.key('m');
    const locked=await b.eval("({open:!$('map').hidden,text:$('toast').textContent,sound:Sound.enabled})");
    check(!locked.open&&locked.text==='아직 길을 함께 다닐 동무가 없다'&&locked.sound===soundBefore,'map-locked','동무를 만나기 전 M 안내 또는 소리 상태가 다르다.',locked);
    records.push({stage:'locked',...locked});
    await b.key('v');check((await b.eval('Sound.enabled'))!==soundBefore,'map-sound-v','V 키로 소리를 켜고 끄지 못했다.');await b.key('v');
    await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await b.eval('G.px=820;G.cam=650;G.py=fieldGround();G.onGround=true');await b.key('e');await until(b,"!$('dlg').hidden");
    for(let i=0;i<8&&!await b.eval("$('dlgChoices').children.length>0");i++)await b.key('e');
    await b.click('#dlgChoices button:first-child');await until(b,"!$('galHands').hidden");
    for(let hit=1;hit<=3;hit++){
      await b.click('#galHandsHit');
      await until(b,hit===3?"$('galHands').hidden":`+$('galHands').dataset.hits===${hit}`);await b.wait(600);
    }
    const unlockLines=[];
    for(let i=0;i<12&&await b.eval("!$('dlg').hidden");i++){
      unlockLines.push(await b.eval("({who:$('dlgWho').textContent,text:$('dlgText').textContent,unlocked:!!G.f.mapUnlocked})"));await b.key('e');
    }
    const supplied=[
      ['늙은 까치','참, 아가. 길이 멀어 발이 아프거든 하늘을 보고 불러라.\n우리 집 젊은 것들이 보자기째 날라 줄 게다.'],
      ['너구리','보자기째요?'],
      ['늙은 까치','네 귀를 하나씩 물면 너 하나쯤은 거뜬하지.\n…가 본 길로만 다닌단다. 모르는 길은 저 애들도 몰라.']
    ];
    check(supplied.every(([who,text])=>unlockLines.some(row=>row.who===who&&row.text===text&&!row.unlocked)),'map-unlock-dialogue','늙은 까치 보자기 완료 뒤 지정 대사가 빠지거나 끝나기 전에 지도가 열렸다.',unlockLines);
    const unlocked=await b.eval("({unlocked:!!G.f.mapUnlocked,done:!!G.f.wanderersDone?.['galchamgol:old_magpie'],toast:$('toast').textContent})");
    check(unlocked.unlocked&&unlocked.done&&unlocked.toast==='지도(M)를 펴면 가 본 곳으로 까치 떼를 부를 수 있다','map-unlock-complete','늙은 까치 보자기·대사를 실제 완료한 뒤 지도 해금 또는 지정 알림이 없다.',unlocked);
    records.push({stage:'magpie-unlock',lines:unlockLines,...unlocked});
    await b.send('Emulation.setEmulatedMedia',{features:[]});await b.eval('G.px=70;G.cam=0');
    // 격리 조건: 출발 구역과 이웃 구역만 실제 changeZone을 거쳐 방문한 상태로 만든다.
    const pair=await b.eval('({region:G.region,from:G.zone,to:Object.keys(REG.zones).find(id=>id!==G.zone)})');
    await b.eval(`changeZone(${j(pair.to)})`);await until(b,'!zoneMotion&&zoneFade===0');
    await b.eval(`changeZone(${j(pair.from)})`);await until(b,'!zoneMotion&&zoneFade===0');
    await b.key('m');await until(b,"!$('map').hidden");
    const entries=await b.eval(`Array.from($('map').querySelectorAll('[data-region][data-zone]')).map(e=>({region:e.dataset.region,zone:e.dataset.zone,disabled:e.disabled,text:e.textContent,current:e.getAttribute('aria-current'),visited:!!G.visitedZones?.[e.dataset.region]?.[e.dataset.zone]}))`);
    check(entries.length>4&&entries.every(e=>e.disabled===!e.visited),'map-visited-only','가 본 구역과 누를 수 있는 지도 구역이 일치하지 않는다.',entries);
    check(entries.filter(e=>!e.visited).every(e=>e.text.includes('？')),'map-unknown-name','가 보지 않은 구역의 이름이 ？로 가려지지 않았다.',entries);
    check(entries.filter(e=>e.current==='location').length===1&&entries.some(e=>e.current==='location'&&e.region===pair.region&&e.zone===pair.from),'map-current','지도에서 지금 구역 표시가 정확히 하나가 아니다.',entries);
    check(!entries.some(e=>e.region!=='galchamgol'&&!e.disabled),'map-next-locked','아직 들어가지 않은 다음 지역으로 지도를 통해 갈 수 있다.',entries);
    await picture('map-desktop');
    await b.key('ArrowRight');
    const focus=await b.eval('({region:document.activeElement?.dataset.region,zone:document.activeElement?.dataset.zone,disabled:document.activeElement?.disabled})');
    check(!!focus.zone&&!focus.disabled,'map-keyboard-focus','지도 방향키가 방문 구역으로 초점을 옮기지 못했다.',focus);
    await b.key('Escape');check(await b.eval("$('map').hidden"),'map-escape','Esc로 지도를 닫지 못했다.');
    await b.key('m');await b.key('m');check(await b.eval("$('map').hidden"),'map-toggle','M을 다시 눌러 지도를 닫지 못했다.');
    await b.key('ArrowRight','keyDown');await b.key('m');
    const heldX=await b.eval('G.px');await b.wait(100);await b.key('Escape');await b.wait(100);
    check(Math.abs((await b.eval('G.px'))-heldX)<1,'map-input-leak','지도를 열고 닫는 동안 누르고 있던 이동 입력이 필드로 샜다.');
    await b.key('ArrowRight','keyUp');
    const busy=await b.eval(`(()=>{
      const rows=[];const one=(kind,apply,restore)=>{apply();const before=$('toast').textContent;openMap();rows.push({kind,open:!$('map').hidden,message:$('toast').textContent});restore();};
      const battle=B;one('battle',()=>{B={};},()=>{B=battle;});
      const vista=vistaMode;one('vista',()=>{vistaMode={};},()=>{vistaMode=vista;});
      const motion=zoneMotion;one('motion',()=>{zoneMotion={};},()=>{zoneMotion=motion;});
      const fade=zoneFade;one('fade',()=>{zoneFade=1;},()=>{zoneFade=fade;});
      const mg=MINIGAMES[0];if(mg){const hidden=$(mg.id).hidden;one('minigame',()=>{$(mg.id).hidden=false;},()=>{$(mg.id).hidden=hidden;});}
      return rows;
    })()`);
    check(busy.length===5&&busy.every(r=>!r.open&&r.message.length>0),'map-busy-modes','전투·경치·전환·미니게임 중 지도 차단 또는 안내가 빠졌다.',busy);
    records.push({stage:'blocking',busy});
    b.scene='map / same-region flight';
    await travel(pair.region,pair.to,{capture:true});
    const arrival=await b.eval('({x:G.px,y:G.py,width:fieldWidth(),ground:fieldGround(),keys:{...keys}})');
    check(arrival.x>=16&&arrival.x<=arrival.width-16&&arrival.y===arrival.ground,'map-arrival','까치가 도착 구역의 유효 바닥에 내려놓지 않았다.',arrival);
    check(Math.min(arrival.x,arrival.width-arrival.x)<=200,'map-arrival-edge','까치가 구역 가장자리 근처에 내려놓지 않았다.',arrival);
    records.push({stage:'same-region',pair,arrival});
    await b.eval("talk([['너구리','…']])");await b.key('m');
    check(await b.eval("$('map').hidden&&!$('dlg').hidden&&$('toast').textContent.length>0"),'map-busy','대화 중 지도가 열리거나 안내 없이 입력을 버렸다.');
    await b.key('e');await until(b,"$('dlg').hidden");
    await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await b.wait(50);await travel(pair.region,pair.from);
    check(await b.eval('!mapTravel'),'map-reduced-motion','동작 줄이기에서 까치 이동 상태가 남는다.');
    await b.key('m');await b.key('ArrowRight');await b.key('Enter');
    await until(b,`!mapTravel&&G.zone===${j(pair.to)}`);
    check(await b.eval("$('map').hidden"),'map-keyboard-travel','방향키와 Enter로 고른 구역으로 이동하지 못했다.');
    await travel(pair.region,pair.from);
    await b.send('Emulation.setEmulatedMedia',{features:[]});

    b.scene='map / completed-region forward exit';
    await ready(b);
    await b.eval(`(()=>{G.f.mapUnlocked=true;G.visitedZones.galchamgol[${j(pair.to)}]=true;G.boss.dead=true;G.ended=true;rememberRegion(G);showEnd();})()`);
    await b.click('#btnMapEnd');await travel('galchamgol',pair.to);await b.key('m');await until(b,"!$('map').hidden");
    const forward=await b.eval("({next:!!$('mapNext')?.getClientRects().length,completed:regionCompleted('galchamgol'),ended:G.ended,unknown:[...$('map').querySelectorAll('[data-region=\"dolneomeo\"]')].every(e=>e.disabled)})");
    check(forward.next&&forward.completed&&!forward.ended&&forward.unknown,'map-completed-forward-exit','지역을 끝내고 같은 지역의 다른 구역으로 날아간 뒤 기존 다음 지역 출구를 잃거나 미방문 지역으로 날아갈 수 있다.',forward);
    await b.click('#mapNext');await until(b,"G.region==='dolneomeo'&&!G.started");
    await b.click('#btnStart');await until(b,"G.region==='dolneomeo'&&G.started");
    records.push({stage:'completed-forward-exit',...forward,arrived:await b.eval('({region:G.region,started:G.started})')});

    // 보스·채집·바닥 물건·지역 완료를 각기 다른 지역에 명시해 심은 뒤 실제 지도 입력으로 왕복한다.
    b.scene='map / region persistence';
    const seeded=await b.eval(`(()=>{
      const zones={};
      for(const id of ${j(regions)}){
        const r=REGIONS[id];if(G.region!==id)enterRegion(G,r);
        G.started=false;REG=r;prepareZones(G,r);G.zone=firstZone(r);zones[id]=G.zone;markZoneVisited(G,r);
        G.boss.dead=true;if(G.barrier)G.barrier.cut=true;
        if(G.digs[0])G.digs[0].done=true;if(G.pickups[0])G.pickups[0].got=true;
        G.zoneStates[G.zone].qaMapMarker=id;
        spawnDrops('root',2,{x:240,y:fieldGround()});for(const row of floorDrops()){row.flight=0;row.bounce=0;}
        G.ended=true;rememberRegion(G);
      }
      Object.assign(G.f,{mapUnlocked:true,momNoteSeen:true,momNoteRestored:true,momNoteFade:0,dodamDone:true,musoeDone:true,nalDone:true,toadMet:true,kkuDone:true,ppuriPassed:true,stackDone:true,yakMade:true,bueongDone:true,steamDone:true,yeotDone:true,hongsiMade:true,fruitGot:true,nameGiven:true,yakDone:true,spring:true,yStampPrompted:{}});
      G.started=true;resetScreens();G.ended=true;showEnd();rememberRegion(G);
      const stable={inv:structuredClone(G.inv),awake:structuredClone(G.awake),f:structuredClone(G.f),learned:structuredClone(G.learned),diary:structuredClone(G.diary)};
      return {zones,stable,floor:structuredClone(G.floorItems),local:Object.fromEntries(Object.entries(G.regionStates).map(([id,s])=>[id,structuredClone(s)]))};
    })()`);
    // 엔딩 이름 입력은 실제 입력으로 끝낸다. 이름을 정하기 전에 지도로 장면을 건너뛰면 안 된다.
    await b.click('#btnMapEnd');
    check(await b.eval("$('map').hidden&&document.activeElement===$('newName')"),'map-ending-name-gate','엔딩 이름을 정하기 전에 지도 이동이 열렸다.');
    await b.send('Input.insertText',{text:'봄이'});await b.key('Enter');await until(b,"G.f.newName==='봄이'");await b.wait(1100);
    seeded.stable=await b.eval('({inv:structuredClone(G.inv),awake:structuredClone(G.awake),f:structuredClone(G.f),learned:structuredClone(G.learned),diary:structuredClone(G.diary)})');
    await b.click('#btnMapEnd');await until(b,"!$('map').hidden");await picture('map-four-regions');
    const comparisons=[];
    for(const region of [...regions,regions[0]]){
      await travel(region,seeded.zones[region]);
      const got=await b.eval(`({region:G.region,zone:G.zone,boss:G.boss,barrier:G.barrier,dig:G.digs[0],pickup:G.pickups[0],zoneState:G.zoneStates[G.zone],completed:regionCompleted(G.region),ended:G.ended,endVisible:!$('endScreen').hidden,floor:structuredClone(G.floorItems),stable:{inv:structuredClone(G.inv),awake:structuredClone(G.awake),f:structuredClone(G.f),learned:structuredClone(G.learned),diary:structuredClone(G.diary)}})`);
      check(got.boss.dead&&got.completed&&!got.ended&&!got.endVisible&&got.zoneState.qaMapMarker===region,'map-region-restore',region+': 보스·지역 완료·구역 상태가 복원되지 않거나 종료 장면이 다시 열렸다.',got);
      check(!got.dig||got.dig.done,'map-dig-restore',region+': 끝낸 채집이 다시 열렸다.',got.dig);
      check(!got.pickup||got.pickup.got,'map-pickup-restore',region+': 주운 물건이 되살아났다.',got.pickup);
      check(j(got.floor)===j(seeded.floor),'map-floor-restore',region+': 지역 왕복 뒤 바닥 물건의 위치·개수·상태가 달라졌다.',{expected:seeded.floor,actual:got.floor});
      check(j(got.stable)===j(seeded.stable),'map-shared-state',region+': 지도 왕복이 보따리·가보·공유 진행·기록을 바꿨다.',{expected:seeded.stable,actual:got.stable});
      comparisons.push(got);
    }
    await b.click('#btnSaveHud');const stored=await b.eval("JSON.parse(localStorage.getItem('packoon-save-v1'))");
    check(!!stored&&Object.keys(stored.G.regionStates).length===4,'map-save-regions','저장에 네 지역 상태가 모두 남지 않았다.',stored?.G?.regionStates);
    await b.reload();await until(b,"!!$('tsContinue')?.getClientRects().length",15000);await b.click('#tsContinue');await until(b,'G.started');
    const restored=await b.eval('({floor:structuredClone(G.floorItems),states:structuredClone(G.regionStates),visited:structuredClone(G.visitedZones)})');
    check(j(restored.floor)===j(stored.G.floorItems)&&j(restored.states)===j(stored.G.regionStates)&&j(restored.visited)===j(stored.G.visitedZones),'map-reload-regions','저장·새로고침 뒤 지역별 상태나 방문 기록이 달라졌다.',{stored:stored.G,restored});
    await travel('yeongsan',seeded.zones.yeongsan);
    check(await b.eval("G.f.spring&&G.f.yakDone&&G.boss.dead&&!G.ended&&$('endScreen').hidden"),'map-after-ending','엔딩 뒤 영산 재방문에서 봄·완료가 사라지거나 엔딩이 다시 열렸다.');
    records.push({stage:'persistence',seeded,comparisons,restored});

    b.scene='map / mobile';
    await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
    await b.reload();await until(b,"!!$('tsContinue')?.getClientRects().length",15000);await b.touch('#tsContinue');await until(b,'G.started');
    await b.touch('#padMap');await until(b,"!$('map').hidden");
    const mobile=await b.eval(`(${measureScene.toString()})(['#map'])`);
    check(mobile.coarse&&mobile.viewport[0]===390&&mobile.viewport[1]===844,'map-mobile-emulation','지도 휴대폰 검사 화면 조건이 다르다.',mobile);
    check(mobile.buttons.length>4&&mobile.buttons.filter(e=>!e.disabled).every(e=>e.width>=44&&e.height>=44),'map-touch-target','휴대폰 지도에서 누를 수 있는 표적이 44×44px보다 작다.',mobile.buttons);
    check(!mobile.overflow.length,'map-mobile-overflow','휴대폰 지도 글이 상자 밖으로 넘친다.',mobile.overflow);
    await picture('map-mobile');
    const visibleTarget=button('dolneomeo',seeded.zones.dolneomeo);
    await b.touch(visibleTarget);await b.touch('#mapTravel');await until(b,'!mapTravel&&G.region==="dolneomeo"');
    records.push({stage:'mobile',measurements:mobile,region:await b.eval('G.region')});

    b.scene='map / old-saves';
    await b.send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
    await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});
    await b.click('#btnSaveHud');
    const expanded=await b.eval("JSON.parse(localStorage.getItem('packoon-save-v1')).G");
    const retained=g=>({visited:g.visitedZones,floor:Object.fromEntries(Object.entries(g.floorItems).map(([id,zones])=>[id,Object.fromEntries(Object.entries(zones).filter(([,rows])=>rows.length))])),states:Object.fromEntries(Object.entries(g.regionStates).map(([id,s])=>{
      const pickups=Object.fromEntries(s.fields.pickups.map((a,i)=>[a.id||String(i),a.got]));
      if(id==='dolneomeo')for(const [key,row]of Object.entries(g.f.dolExtraPointState||{}))if(!(key in pickups))pickups[key]=row.got;
      return [id,{completed:s.completed,boss:s.fields.boss.dead,digs:s.fields.digs.map((a,i)=>[a.id||String(i),a.done]).sort(),pickups:Object.entries(pickups).sort(),zoneStates:s.fields.zoneStates}];
    }))});
    await b.navigate(b.url+'?classic=1');await until(b,"!!$('tsContinue')?.getClientRects().length",15000);await b.click('#tsContinue');await until(b,'G.started');await b.wait(100);await b.click('#btnSaveHud');
    const classic=await b.eval('structuredClone(G)');
    check(j(retained(classic))===j(retained(expanded)),'map-mode-save-classic','확장판 저장을 classic으로 불러와 저장하면서 방문·바닥 물건·보스·구역 진행이 달라졌다.',{expected:retained(expanded),actual:retained(classic)});
    await b.navigate(b.url);await until(b,"!!$('tsContinue')?.getClientRects().length",15000);await b.click('#tsContinue');await until(b,'G.started');await b.wait(100);await b.click('#btnSaveHud');
    const again=await b.eval('structuredClone(G)');
    check(j(retained(again))===j(retained(expanded)),'map-mode-save-expanded','classic을 거쳐 확장판으로 돌아왔을 때 방문·바닥 물건·보스·구역 진행이 달라졌다.',{expected:retained(expanded),actual:retained(again)});
    records.push({stage:'mode-roundtrip',before:retained(expanded),classic:retained(classic),expanded:retained(again),note:'각 모드 필드의 크기·발판이 달라 활성 구역·기존 줍기 지점 좌표는 비교하지 않는다. 보스 생존·채집 done·줍기 got은 id별로 비교하고 classic 돌너머가 보관하는 dolExtraPointState의 got도 포함한다. 흩어진 바닥 물건 좌표는 그대로 비교한다.'});
    const oldSaves=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','old-saves.json'),'utf8')).saves;
    const old=await b.eval(`(${j(oldSaves)}).map(raw=>{localStorage.setItem('packoon-save-v1',raw);const want=JSON.parse(raw).G,ok=loadSave();return {ok,region:G.region,want:want.region,states:Object.keys(G.regionStates||{}),visited:structuredClone(G.visitedZones),inv:JSON.stringify(G.inv)===JSON.stringify(want.inv)};})`);
    check(old.length===4&&old.every(s=>s.ok&&s.region===s.want&&s.inv&&j(s.states)===j([s.region])&&Object.keys(s.visited).every(id=>id===s.region)),'map-old-save','지역 보관이 없는 옛 저장에서 현재 지역 외 상태를 만들거나 진행·소지품 복원에 실패했다.',old);
    records.push({stage:'old-saves',old});
    await ready(b);await b.eval("G=newGame('dolneomeo');delete G.f.mapUnlocked;resetScreens()");await b.click('#btnStart');
    const fallback=await b.eval("({unlocked:!!G.f.mapUnlocked,toast:$('toast').textContent,done:!!G.f.wanderersDone?.['galchamgol:old_magpie']})");
    check(fallback.unlocked&&!fallback.done&&fallback.toast==='돌담 위에 까치 떼가 앉아 있다. 지도(M)를 펴면 가 본 곳으로 데려다줄 것 같다','map-fallback','늙은 까치를 만나지 않고 돌너머로 들어간 시작에서 지정 지도 안내가 나오지 않았다.',fallback);
    records.push({stage:'dolneomeo-fallback',...fallback});
    await ready(b,true);await b.key('m');
    check(await b.eval("$('map').hidden&&!$('btnMap').getClientRects().length"),'map-classic','classic에서 지도 또는 지도 HUD 버튼이 열렸다.');
  }catch(error){
    findings.push({rule:'map-execution',severity:'높음',message:error.stack||error.message,scene:b.scene});
    await picture('map-failure').catch(()=>{});
  }finally{
    await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}).catch(()=>{});
  }
  const file=path.join(outDir,'map-scenarios.json');fs.writeFileSync(file,j({method:'격리 상태 주입 후 실제 CDP 키·마우스·터치 입력. 연속 플레이 증거와 별개.',records,images,findings}));
  for(const f of findings)Object.assign(f,{evidence:[file,...images],reproductions:'격리 시나리오 이번 실행 1회',environment:{viewport:'1280×720 / 390×844, DPR 1',input:'CDP 실제 키·마우스·터치',start:'새 격리 프로필 + 명시한 상태 주입'}});
  return {name:'map',status:findings.length?'fail':'pass',summary:`지도 잠금·방문·이동·네 지역 왕복·저장·옛 저장·휴대폰 검사, 문제 ${findings.length}건. 그림 ${images.length}장.`,findings,evidence:[file,...images]};
}
module.exports={runMap};
