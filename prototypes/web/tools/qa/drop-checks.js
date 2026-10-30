'use strict';

// Isolated regression scenarios deliberately seed state. They are not continuous-play evidence.
const fs=require('node:fs');
const path=require('node:path');
const regions=['galchamgol','dolneomeo','jangteo','yeongsan'];
const modes=['expanded','classic'];
const j=JSON.stringify;
const fail=(rule,message,actual)=>({rule,severity:'높음',message,actual,
  reproductions:'격리 상태 주입 시나리오 1회',steps:['새 격리 프로필에서 해당 모드·지역의 상태를 만든다.','기록된 spawnDrops 호출과 실제 줍기 키·저장·이어 하기 입력을 재현한다.']});
async function ready(b,mode,region){
  await b.navigate(b.url+(mode==='classic'?'?classic=1':''));
  await b.eval(`(()=>{localStorage.clear();TitleScreen.close();G=newGame(${j(region)});G.started=true;G.f.momNoteSeen=true;resetScreens();$('dlg').hidden=true;closePanels();G.px=200;G.py=fieldGround();G.cam=40;G.vx=G.vy=0;G.onGround=true;})()`);
  await b.wait(60);
}
async function until(b,expression,limit=4000){
  const end=Date.now()+limit;while(Date.now()<end){if(await b.eval(expression))return;await b.wait(30);}throw Error('바닥 아이템 대기 초과: '+expression);
}
function canonical(g){
  const floorItems=Object.fromEntries(Object.entries(g.floorItems||{}).map(([region,zones])=>[region,Object.fromEntries(Object.entries(zones).filter(([,items])=>items.length))]));
  return {region:g.region,zone:g.zone,floorItems,pickups:g.pickups,inv:g.inv};
}
async function runDropCheck({browser:b,outDir,name}){
  const findings=[],records=[],images=[],captures=[];
  try {
    for(const mode of modes)for(const region of (name==='drops-departure'?regions.slice(0,3):regions)){
      b.scene=name+' / '+mode+' / '+region;await ready(b,mode,region);
      if(name==='drops-floor'){
        const item={galchamgol:'root',dolneomeo:'eoksae',jangteo:'solbang',yeongsan:'darae_vine'}[region];
        const before=await b.eval(`(()=>{G.px=1160;G.py=fieldGround();G.cam=992;const source={x:1200,y:fieldGround()};spawnDrops(${j(item)},4,source);return {source,zone:G.zone,records:structuredClone(floorDrops())};})()`);
        if(mode==='expanded'){
          if(!await b.eval('floorDrops().some(a=>a.flight>0)'))throw Error(region+': 날아가는 아이템이 없어 뿌리기 그림을 확인하지 못했다.');
          await b.wait(100);const file=path.join(outDir,region+'-spawn.png');await b.screenshot(file);images.push(file);captures.push({region,stage:'spawn',file,state:await b.eval('({records:structuredClone(floorDrops()),pose:pickupPose&&{tick:pickupPose.tick}})')});
        }
        await until(b,"floorDrops().every(a=>!a.flight&&!a.bounce)");
        if(mode==='expanded'){
          const file=path.join(outDir,region+'-floor.png');await b.screenshot(file);images.push(file);captures.push({region,stage:'floor',file,state:await b.eval('({records:structuredClone(floorDrops()),pose:pickupPose&&{tick:pickupPose.tick}})')});
          await b.eval('G.px=floorDrops().find(a=>!a.got).x;G.py=fieldGround();G.onGround=true');await b.key('x');await b.wait(70);
          if(!await b.eval('!!pickupPose'))throw Error(region+': 줍기 자세가 열리지 않아 그림을 확인하지 못했다.');
          const pickup=path.join(outDir,region+'-pickup.png');await b.screenshot(pickup);images.push(pickup);captures.push({region,stage:'pickup',file,state:await b.eval('({records:structuredClone(floorDrops()),pose:pickupPose&&{tick:pickupPose.tick}})')});await b.wait(700);
        }
        // Test every declared zone, platform and both ends, independently of visual animation.
        const checked=await b.eval(`(()=>{const out=[];const start=G.zone;const zones=usesZones(REG)?Object.keys(REG.zones):[null];for(const zone of zones){if(zone!==G.zone){G.zone=zone;G.py=fieldGround();}const sources=[{x:20,y:fieldGround()},{x:fieldWidth()-20,y:fieldGround()},...fieldPlatforms().slice(0,4).map(p=>({x:p.x+p.w/2,y:p.y}))];for(const source of sources)spawnDrops('root',4,source);const rows=floorDrops().filter(a=>!a.got);const max=fieldDef().maxX?fieldCall('maxX'):fieldWidth()-16;const invalid=rows.filter(a=>!Number.isFinite(a.x)||!Number.isFinite(a.y)||a.x<16||a.x>max+0.001||!(Math.abs(a.y-fieldGround())<0.001||fieldPlatforms().some(p=>Math.abs(a.y-p.y)<0.001&&a.x>=p.x&&a.x<=p.x+p.w))||!validDropSurface(a));const overlaps=[];for(let i=0;i<rows.length;i++)for(let k=i+1;k<rows.length;k++)if(Math.hypot(rows[i].x-rows[k].x,rows[i].y-rows[k].y)<TABLES.TUNING.drop_min_spacing-0.001)overlaps.push([rows[i].id,rows[k].id]);out.push({zone,count:rows.length,max,invalid,overlaps,rows:structuredClone(rows)});}G.zone=start;return out;})()`);
        for(const z of checked)if(z.invalid.length||z.overlaps.length)findings.push(fail(name,`${mode}/${region}/${z.zone}: 유효 바닥 또는 최소 간격 위반`,z));
        if(before.records.length!==4)findings.push(fail(name,`${mode}/${region}: 보상 4개가 별도 아이템으로 생성되지 않았다.`,before));
        records.push({mode,region,before,checked});
      }else if(name==='drops-persistence'){
        await b.eval("spawnDrops('root',4,{x:250,y:fieldGround()})");await until(b,'floorDrops().every(a=>!a.flight&&!a.bounce)');
        const before=canonical(await b.eval('structuredClone(G)'));
        if(mode==='expanded'){
          const changed=await b.eval(`(()=>{const from=G.zone,to=Object.keys(REG.zones).find(id=>id!==from);return {first:changeZone(to),from,to};})()`);
          await until(b,'!zoneMotion&&zoneFade===0');
          changed.second=await b.eval('changeZone('+j(changed.from)+')');
          await until(b,'!zoneMotion&&zoneFade===0');
          if(!changed.first||!changed.second)throw Error('구역 왕복 시나리오가 실행되지 않았다: '+j(changed));
        }
        const afterRevisit=canonical(await b.eval('structuredClone(G)'));
        if(j(before.floorItems)!==j(afterRevisit.floorItems)||j(before.pickups)!==j(afterRevisit.pickups))findings.push(fail(name,`${mode}/${region}: 구역 왕복 뒤 위치·개수 변경`,{before,afterRevisit}));
        await b.click('#btnSaveHud');const stored=await b.eval("JSON.parse(localStorage.getItem('packoon-save-v1'))");
        if(!stored)throw Error('수동 저장이 작성되지 않았다');
        await b.reload();await until(b,"!!$('tsContinue')?.getClientRects().length",10000);await b.click('#tsContinue');
        const restored=canonical(await b.eval('structuredClone(G)'));
        if(j(canonical(stored.G))!==j(restored))findings.push(fail(name,`${mode}/${region}: 저장·이어 하기 뒤 바닥 아이템 변경`,{stored:canonical(stored.G),restored}));
        const oldSave=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','old-saves.json'),'utf8')).saves.find(raw=>JSON.parse(raw).G.region===region);
        const old=await b.eval(`(()=>{const raw=${j(oldSave)},want=JSON.parse(raw).G;localStorage.setItem('packoon-save-v1',raw);const loaded=loadSave();const errors=[];if(!loaded||G.region!==want.region)errors.push('지역');if(JSON.stringify(G.inv)!==JSON.stringify(want.inv))errors.push('소지품');for(const [key,value]of Object.entries(want.f))if(!(CLASSIC&&key==='arcs')&&JSON.stringify(G.f[key])!==JSON.stringify(value))errors.push('진행 '+key);if(!G.floorItems||typeof G.floorItems!=='object')errors.push('새 바닥칸');return {loaded,region:G.region,errors};})()`);
        if(old.errors.length)findings.push(fail(name,`${mode}/${region}: 옛 저장 표본 복원 오류`,old));
        records.push({mode,region,before,afterRevisit,stored:canonical(stored.G),restored,old});
      }else if(name==='drops-departure'){
        const before=await b.eval(`(()=>{G.bagSlots=0;spawnDrops('root',3,{x:250,y:fieldGround()});if(usesZones(REG)){const here=G.zone;G.zone=Object.keys(REG.zones).find(id=>id!==here);spawnDrops('root',2,{x:120,y:fieldGround()});G.zone=here;}const old={region:G.region,inv:{...G.inv},floor:structuredClone(G.floorItems[G.region]),pickups:structuredClone(G.pickups),next:REG.next,nextInv:REGIONS[REG.next].newState().inv||{}};endGame();return old;})()`);
        await b.click('#btnNext');
        const after=await b.eval(`({region:G.region,inv:{...G.inv},old:structuredClone(G.floorItems[${j(region)}]||{}),pickups:structuredClone(G.floorPickups[${j(region)}]||[]),message:$('toast').textContent})`);
        for(const item of new Set([...Object.keys(before.inv),...Object.keys(before.nextInv),...Object.keys(after.inv)]))if((after.inv[item]||0)!==(before.inv[item]||0)+(before.nextInv[item]||0))findings.push(fail(name,`${mode}/${region}: 다음 지역으로 떠날 때 ${item}이 자동 지급되거나 소지품이 바뀌었다.`,{before,after}));
        if(after.region!==before.next||j(before.floor)!==j(after.old)||j(before.pickups)!==j(after.pickups))findings.push(fail(name,`${mode}/${region}: 지난 지역 바닥 물건의 위치·개수·줍기 상태가 바뀌었다.`,{before,after}));
        records.push({mode,region,before,after});
      }else if(name==='drops-full'){
        await b.eval(`(()=>{G.inv={rice:2};G.bagSlots=1;G.pickups=[];spawnDrops('root',2,{x:G.px,y:fieldGround()});})()`);
        await until(b,'floorDrops().every(a=>!a.flight&&!a.bounce)');
        await b.eval('G.px=floorDrops()[0].x;G.py=floorDrops()[0].y;G.onGround=true');
        const before=await b.eval('({floor:structuredClone(floorDrops()),inv:{...G.inv}})');
        await b.key('x');await b.wait(650);
        const blocked=await b.eval("({floor:structuredClone(floorDrops()),inv:{...G.inv},message:$('toast').textContent})");
        if(j(before.floor)!==j(blocked.floor)||j(before.inv)!==j(blocked.inv))findings.push(fail(name,`${mode}/${region}: 보따리가 가득 찼는데 바닥 물건이나 소지품이 바뀌었다.`,{before,blocked}));
        if(!/가득/.test(blocked.message))findings.push(fail(name,`${mode}/${region}: 보따리 가득 안내가 없다.`,blocked));
        await b.eval('G.bagSlots=2');await b.key('x');await b.key('x');await b.key('x');await b.wait(700);
        const freed=await b.eval('({floor:structuredClone(floorDrops()),inv:{...G.inv}})');
        if(!(freed.inv.root>0))findings.push(fail(name,`${mode}/${region}: 칸을 비운 뒤에도 줍지 못했다.`,freed));
        if(freed.inv.root>2)findings.push(fail(name,`${mode}/${region}: 연속 줍기 입력으로 보상이 중복됐다.`,freed));
        const boundaries=await b.eval(`(()=>{G.pickups=[];floorDrops().length=0;G.px=230;G.py=fieldGround();const out=[];for(const axis of ['x','y'])for(const delta of [-0.01,0,0.01]){const a={id:'qa-boundary',item:'acorn',got:false,x:G.px+(axis==='x'?TABLES.TUNING.pickup_range+delta:0),y:G.py+(axis==='y'?TABLES.TUNING.pickup_range_y+delta:0)};G.pickups=[a];out.push({axis,delta,near:nearFloorItems().includes(a),expected:delta<=0});}G.pickups=[];spawnDrops('root',1,{x:G.px,y:G.py});const start=structuredClone(floorDrops());$('bag').hidden=false;for(let i=0;i<40;i++)step();const paused=structuredClone(floorDrops());$('bag').hidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});for(let i=0;i<40;i++)step();const hidden=structuredClone(floorDrops());delete document.hidden;return {out,start,paused,hidden};})()`);
        if(boundaries.out.some(a=>a.near!==a.expected)||j(boundaries.start)!==j(boundaries.paused)||j(boundaries.start)!==j(boundaries.hidden))findings.push(fail(name,`${mode}/${region}: 줍기 범위 경계 또는 정지 중 시간 누적 오류`,boundaries));
        records.push({mode,region,before,blocked,freed,boundaries});
      }
    }
  }catch(error){findings.push(fail(name,error.message,{scene:b.scene}));const file=path.join(outDir,'failure.png');await b.screenshot(file).catch(()=>{});images.push(file);}
  const file=path.join(outDir,'scenarios.json');fs.writeFileSync(file,j({method:'격리 상태 주입. 연속 플레이 증거와 별개.',chrome:b.version.product,records,images,captures,findings}));
  for(const f of findings)f.evidence=[file,...images];
  const descriptions={'drops-floor':'흩뿌리기 최소 간격·유효 바닥, 네 지역 3장면씩 그림','drops-persistence':'구역 왕복·저장·새로고침 위치·개수','drops-departure':'지역 출발 시 전 구역 잔여 물건 보존·자동 회수 없음','drops-full':'보따리 가득 시 잔류·칸을 비운 뒤 줍기'};
  return {name,status:findings.length?'fail':'pass',summary:descriptions[name]+` (${records.length}개 모드·지역, 문제 ${findings.length}건)`,findings,evidence:[file,...images]};
}
module.exports={runDropCheck};
