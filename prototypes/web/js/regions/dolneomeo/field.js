'use strict';
/* 돌너머 필드: 첫서리 하늘, 돌산, 돌담, 장승, 억새 들판, 거둔 메밀밭, 겨우살이 나무, 성황당 돌무더기(돌 골렘), 절벽, 서리 */
(()=>{
const Rg=REGIONS.dolneomeo;
const GATE_X=1590;     // 뿔이가 지키는 돌산 길목 (장승과 금줄)
const GOLEM_AT=1860;   // 이보다 오른쪽으로 가면 돌 골렘과 전투
const CLIFF_X=2150;    // 절벽이 시작되는 곳
const DARAE={x:2236,y:150};

/* ---------- 배경 ---------- */
function ridge(par,col,base,amp,freq){ctx.fillStyle=col;for(let x=0;x<W;x+=2){const wx=x+cam*par;const h=base-Math.abs(Math.sin(wx*freq))*amp-Math.sin(wx*freq*3.1+2)*amp*0.25;ctx.fillRect(x,Math.round(h),2,H-Math.round(h));}}
function drawSky(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#cfdbe0');g.addColorStop(.6,'#a9bcc6');g.addColorStop(1,'#8a9ca6');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const sx=Math.round(300-cam*0.03);R(sx,30,14,14,'#f4f2e8');R(sx-2,33,18,8,'#f4f2e8');
  for(let i=0;i<3;i++){const cx=Math.round(((i*170+60)-cam*0.05)%580+580)%580-90;R(cx,22+i*12,40,4,'#e6edf0');R(cx+8,18+i*12,22,4,'#e6edf0');}
  ridge(0.12,'#8d9ca6',118,34,0.006);
  ridge(0.22,'#77878f',138,26,0.011);
  /* 먼 소나무 */
  for(let i=-1;i<10;i++){
    const wx=Math.floor((cam*0.5)/56)*56+i*56;const x=Math.round(wx-cam*0.5);const r=hash(wx+7);
    if(r<0.35)continue;const h=26+r*18;
    R(x+11,GROUND-14-h*0.2,3,h*0.4,'#4a3a2e');
    R(x+4,GROUND-24-h*0.6,17,h*0.35,'#3e5a4a');R(x+7,GROUND-30-h*0.7,11,h*0.3,'#46664f');R(x+10,GROUND-34-h*0.75,5,6,'#507458');
    R(x+6,GROUND-30-h*0.7,13,1,'#e8eef0');
  }
}
function drawGround(){
  R(0,GROUND,W,H-GROUND,'#5e584e');R(0,GROUND,W,3,'#7a7468');
  const s=Math.floor(cam);
  for(let x=0;x<W;x+=3){const wx=x+s-(s%3);const r=hash(wx+3);
    if(r<0.4)R(x-(s%3),GROUND-1,2,1,r<0.25?'#f2f6f8':'#d8e2e6');
    if(r>0.9)R(x-(s%3),GROUND+5+Math.floor(r*12),3,2,'#4a453d');}
}
/* 돌담 */
function drawWall(x0,x1){const a=Math.max(x0-cam,-10),b=Math.min(x1-cam,W+10);if(b<a)return;
  for(let x=a;x<b;x+=12){const wx=Math.floor(x+cam);const r=hash(wx);R(x,GROUND-14,11,7,r<0.5?'#8a8680':'#9a9690');R(x+5,GROUND-21,10,7,r<0.5?'#9a9690':'#8a8680');R(x,GROUND-15,11,1,'#eef2f4');R(x+5,GROUND-22,10,1,'#eef2f4');}}
/* 장승: 둥근 눈에 웃는 입, 이마에 글씨 자리 */
function jangseung(wx,tall){const x=wx-cam;if(x<-20||x>W+20)return;const h=tall?44:38;
  R(x-4,GROUND-h,9,h,'#8a6a4a');R(x-5,GROUND-h-4,11,6,'#5a4030');R(x-3,GROUND-h+8,2,2,'#2b1d14');R(x+2,GROUND-h+8,2,2,'#2b1d14');
  R(x-2,GROUND-h+14,5,1,'#2b1d14');R(x-3,GROUND-h+13,1,1,'#2b1d14');R(x+3,GROUND-h+13,1,1,'#2b1d14');
  R(x-1,GROUND-h+20,3,12,'#6b4e36');R(x-4,GROUND-h-1,9,1,'#b4432a');}
function drawGate(){
  jangseung(GATE_X-14,true);jangseung(GATE_X+14,false);
  if(!G.f.ppuriPassed){const x=GATE_X-cam;if(x>-30&&x<W+30){R(x-12,GROUND-30,24,1,'#e8dcc0');for(let i=0;i<4;i++)R(x-9+i*6,GROUND-29,2,4,i%2?'#f4ecd8':'#b4432a');}}
}
/* 겨우살이가 걸린 나무 (높은 가지는 통나무를 밟고 뛰어야 닿는다) */
function drawTree(wx){const x=wx-cam;if(x<-40||x>W+40)return;
  R(x-4,GROUND-96,8,96,'#4a3a2e');R(x-24,GROUND-84,22,3,'#4a3a2e');R(x+2,GROUND-90,24,3,'#4a3a2e');R(x-14,GROUND-100,4,10,'#4a3a2e');
  R(x-26,GROUND-86,24,1,'#eef2f4');R(x+2,GROUND-92,24,1,'#eef2f4');}
/* 거둔 메밀밭: 짧은 그루터기 */
function drawField(x0,x1){const a=Math.max(x0-cam,-10),b=Math.min(x1-cam,W+10);for(let x=a;x<b;x+=5){const wx=Math.floor(x+cam);if(hash(wx)<0.3)continue;R(x,GROUND-3,1,3,'#9a7a52');R(x+2,GROUND-2,1,2,'#8a6a42');}}
/* 절벽과 바위턱 */
function drawCliff(){const x=CLIFF_X-cam;if(x>W+10)return;
  R(x,GROUND-150,W+20,150,'#6a6660');R(x+6,GROUND-150,4,150,'#5a5650');R(x,GROUND-152,W+20,2,'#eef2f4');
  for(let i=0;i<8;i++){const y=GROUND-140+i*17;R(x+14+((i*23)%60),y,26,2,'#5a5650');R(x+50+((i*31)%70),y+8,18,2,'#7a766e');}
  /* 다래 덩굴 */
  const dx=DARAE.x-cam;R(dx-1,GROUND-150-16,2,20,'#5a4a2a');R(dx-6,GROUND-158,12,2,'#5a4a2a');
}
Rg.drawBack=()=>{drawSky();drawWall(150,620);drawWall(1060,1220);drawCliff();drawGround();};
Rg.drawScenery=()=>{jangseung(96,true);jangseung(122,false);drawTree(670);drawTree(1412);drawField(880,1010);drawField(1225,1350);drawGate();
  if(Rg.arcs()){
    // 지름 바위는 길을 새로 열거나 골렘을 건너뛰지 않는 표지다.
    const x=1668-cam;R(x-14,GROUND-5,28,5,'#8a8680');R(x-11,GROUND-7,22,2,'#aeaaa4');
    if(G.f.dolneomeo_arc_ppuri3){R(x+13,GROUND-3,4,1,'#f4f2e8');R(x+20,GROUND-3,4,1,'#f4f2e8');R(x+27,GROUND-3,4,1,'#f4f2e8');}
  }
  const sx=2338-cam;if(G.f.yakMade&&sx<W+20){R(sx,GROUND-26,2,26,'#6b4423');R(sx-8,GROUND-26,18,8,'#c9a27a');R(sx+6,GROUND-24,2,4,'#6b4423');}};

/* 줍는 것 */
Rg.drawPickup=(a,x,bob)=>{
  if(a.item==='memil'){R(x-1,a.y-6,1,6,'#9a7a52');R(x-2,a.y-8+bob,3,2,'#2b2522');R(x,a.y-9+bob,2,2,'#3a3330');R(x+1,a.y-7,2,1,'#7a9a5a');}
  else if(a.item==='gyeousari'){R(x-5,a.y-5+bob,10,5,'#6f9a4a');R(x-3,a.y-7+bob,6,2,'#5a8a3a');R(x-2,a.y-4+bob,2,2,'#f3e28a');R(x+2,a.y-3+bob,2,2,'#f3e28a');}
  else if(a.item==='seoridarae'){R(x-4,a.y-8+bob,4,4,'#8ab86a');R(x,a.y-8+bob,4,4,'#7fa860');R(x-2,a.y-4+bob,4,4,'#6f9850');R(x-3,a.y-7+bob,1,1,'#f4fbff');R(x+1,a.y-7+bob,1,1,'#f4fbff');R(x-1,a.y-11,2,3,'#5a4a2a');}
  else if(!CLASSIC&&a.item==='seogi'){R(x-8,a.y-10,16,10,'#8a9791');R(x-6,a.y-11,12,2,'#e0e8dc');R(x-5,a.y-8,10,6,'#414d47');R(x-2,a.y-9,4,7,'#58655b');R(x+4,a.y-12+bob,1,1,'#fff1bf');}
};
/* 억새 무더기와 바위의 석이버섯 */
Rg.drawDig=(d,x)=>{
  if(d.item==='eoksae'){
    if(d.done){R(x-7,GROUND-2,14,2,'#a8916a');return true;}
    for(let i=0;i<6;i++){const h=16+((i*7)%9);const sway=Math.sin((G.anim+d.x+i*20)*0.04)>0.6?1:0;R(x-7+i*3+sway,GROUND-h,1,h,i%2?'#e8dcc0':'#d8cba8');R(x-8+i*3+sway,GROUND-h-2,3,3,'#f6f0de');}
    if(Math.floor((G.anim+d.x)/14)%3===0)R(x+2,GROUND-22,1,1,'#fff3b0');
    return true;}
  if(d.item==='seogi'){
    if(d.done){R(x-6,GROUND-1,12,1,'#5a5650');return true;}
    R(x-9,GROUND-10,18,10,'#7a766e');R(x-7,GROUND-12,14,2,'#8a8680');R(x-4,GROUND-8,6,4,'#3a3430');R(x+2,GROUND-7,4,3,'#4a4440');
    if(Math.floor((G.anim+d.x)/14)%3===0)R(x,GROUND-15,1,1,'#fff3b0');
    return true;}
  return false;
};

/* 성황당 돌무더기: 골렘이 잠들어 있을 때. 쓰러뜨리거나 달래면 작은 돌무더기로 돌아간다 */
function drawCairn(){const b=G.boss;const x=b.x-cam;if(x<-60||x>W+60)return;
  if(b.dead){R(x-14,GROUND-8,28,8,'#8a8680');R(x-10,GROUND-14,20,6,'#9a9690');R(x-6,GROUND-19,12,5,'#8a8680');
    if(G.f.golemCalm){R(x-3,GROUND-24,7,5,'#9a9690');R(x-1,GROUND-22,1,1,'#b4432a');}return;}
  const breathe=Math.floor(G.anim/18)%2;
  R(x-30,GROUND-14,60,14,'#7a766e');R(x-24,GROUND-28-breathe,48,14,'#8a8680');R(x-18,GROUND-40-breathe,36,12,'#7a766e');R(x-10,GROUND-50-breathe,20,10,'#9a9690');
  for(let i=0;i<6;i++)R(x-28+i*10,GROUND-15-((i*5)%14),8,1,'#eef2f4');
  R(x-8,GROUND-46-breathe,16,1,'#5a8a3a');
  R(x-7,GROUND-35-breathe,5,2,'#3a3430');R(x+2,GROUND-35-breathe,5,2,'#3a3430');
}
function drawKkuCue(){
  const n=Rg.npcs.find(n=>n.id==='kkubeogi');if(!n)return;
  const x=n.x-cam;if(x<-30||x>W+30)return;
  const stir=Rg.kkuStirNow(),awake=Rg.kkuAwakeNow();
  const f=G.px<n.x?-1:1;
  if(stir>0){
    // 원래 그림 위에 작은 코 움직임과 따뜻한 숨결만 겹친다.
    const twitch=Math.floor(stir*8)%2;
    M(x,GROUND,f,8,-4-twitch,2,1,'#2b1d14');
    M(x,GROUND,f,12,-8-Math.floor(stir*3),2,1,'#d9b892');
    M(x,GROUND,f,-8,-18,3,1,'#d9b892');
    if(stir>.5)M(x,GROUND,f,-3,-20,3,1,'#d9b892');
  }
  if(Math.abs(G.px-n.x)>64||(!stir&&!awake))return;
  ctx.save();ctx.font='10px sans-serif';ctx.textAlign='center';
  const text=awake?'…어? 불렀어?':stir>.5?'…으음…':'코가 씰룩…';
  const width=ctx.measureText(text).width+10;
  ctx.fillStyle=awake?'#f5e7bb':'#e9e0cf';ctx.fillRect(x-width/2,GROUND-43,width,14);
  ctx.fillStyle='#5a4030';ctx.fillText(text,x,GROUND-33);ctx.restore();
}
Rg.drawActors=()=>{drawCairn();drawKkuCue();};

/* 서리 내림 */
const frost=Array.from({length:30},()=>({x:Math.random()*W,y:Math.random()*H,s:0.15+Math.random()*0.3,p:Math.random()*6}));
Rg.ambient=()=>{for(const l of frost){l.y+=l.s;l.p+=0.02;l.x+=Math.sin(l.p)*0.25;if(l.y>H){l.y=-3;l.x=Math.random()*W;}if(l.x<-3)l.x=W+2;if(l.x>W+3)l.x=-2;}};
Rg.drawFront=()=>{for(const l of frost)R(l.x,l.y,1,1,Math.sin(l.p)>0?'#ffffff':'#dfe8ec');};

/* ---------- 진행 ---------- */
Rg.maxX=()=>G.f.ppuriPassed?2330:GATE_X-14;
Rg.step=()=>{
  if(Rg.arcs())G.f.arcs=true;
  if(!G.boss.dead&&G.f.ppuriPassed&&G.px>GOLEM_AT)Rg.startGolem();
  /* 서리다래 약즙을 만들면 까치 편에 보내고 지역이 끝난다 */
  if(has('darae_yak')&&!G.f.yakMade)Rg.sendMedicine();
};
Rg.onHit=()=>{};
Rg.faint=()=>{G.px=Math.max(60,Math.min(G.px,GOLEM_AT)-80);toast('찬바람에 휘청여 물러났다');};
/* 골렘이 쓰러지거나 잠들면 절벽 길이 열리고 바위턱에 서리다래가 보인다 */
Rg.bossDie=()=>{
  G.boss.dead=true;
  G.pickups.push({x:DARAE.x,y:DARAE.y,item:'seoridarae',got:false});
  diary('d_boss','성황당 돌무더기가 다시 조용해졌다. 절벽 바위턱에 서리 맞은 다래가 보인다.');
  toast('절벽 길이 열렸다! 바위턱의 서리다래를 따자');refreshGoal();
};
Rg.onPickup=a=>{
  if(a.item==='seoridarae'&&!G.f.daraePicked){G.f.daraePicked=true;
    clue('h2','아빠의 수첩',!CLASSIC||Rg.arcs()?'아빠의 젊은 시절 수첩에는 서리다래 그림이 없다. 지난가을 글자를 읽고 그날 밤 떠났다는 이야기는 돌쇠 할배에게 들었다.':'아빠의 수첩에는 서리다래가 없다. 아빠는 여기서 열매를 찾지 않고 곧장 떠났다.');
    diary('d_darae',!CLASSIC||Rg.arcs()?'서리다래를 내 기록에 그렸다. 아빠의 젊은 시절 수첩에는 이 열매가 없다. 지난가을 급히 떠난 일과는 나눠 적어 두자.':'서리다래를 붓으로 그렸다. 해머루 때는 아빠의 그림이 먼저 있었는데, 수첩 어디에도 서리다래는 없다. 아빠는 이곳에서 열매를 찾지 않았다. 무언가를 알고 길을 바꾼 걸까.');
    setTimeout(()=>toast('보따리 속 맷돌로 서리다래를 갈아 약즙을 만들자'),1600);refreshGoal();}
};
Rg.addSeogiSpot=()=>{if(!G.digs.some(d=>d.item==='seogi'))G.digs.push({x:1770,item:'seogi',done:false});};

/* 확장판의 변신 자리 (PA-47). 늘 구역을 단 채 저장되고 classic 변환이 건드리지 않는다. */
const formSpotIds=['dol_goat_seogi','dol_cache_field','dol_cache_village'];
// 같은 출처에서 표시 모드만 바꿔 이어 할 때도 남은 필수 재료를 숨기지 않는다.
if(CLASSIC){
  const originalAmbient=Rg.ambient;
  Rg.ambient=()=>{
    // 옛 classic 저장에 이미 열린 자리도 골렘보다 앞쪽으로 옮긴다.
    if(G?.region===Rg.id)for(const d of G.digs)if(d.item==='seogi')d.x=1770;
    // 변신 자리(PA-47)는 구역을 단 채 classic 저장에도 남는다. classic 은 구역 있는 자리를 그리지도 줍지도 않는다.
    // 순번 id(dol_old_*)로 바뀌지 않게 확장판 저장 판정과 구역 지우기에서 뺀다.
    const formSpot=p=>formSpotIds.includes(p.id);
    if(G?.region===Rg.id&&[...G.pickups,...G.digs].some(p=>p.zone&&!formSpot(p))){
      const originalPickups=[[900,192],[945,192],[990,192],[1240,192],[1290,192],[1335,192],[670,118],[1412,118]];
      const extraIds=['dol_memil_extra1','dol_memil_extra2','dol_memil_extra3','dol_mistletoe_extra','dol_memory_seogi'];
      G.f.dolExtraPointState=G.f.dolExtraPointState||{};
      G.pickups=G.pickups.filter(p=>{if(!extraIds.includes(p.id))return true;G.f.dolExtraPointState[p.id]={got:p.got};return false;});
      for(const p of G.pickups){
        if(formSpot(p))continue;
        const index=Number(p.id?.match(/^dol_old_pickup_(\d+)$/)?.[1]);
        if(Number.isInteger(index)&&originalPickups[index]){[p.x,p.y]=originalPickups[index];}
        if(p.item==='seoridarae'){p.x=2236;p.y=150;}
        delete p.zone;
      }
      for(const d of G.digs){if(formSpot(d))continue;const index=Number(d.id?.match(/^dol_old_dig_(\d+)$/)?.[1]);if(Number.isInteger(index))d.x=[470,560,760,1030][index]??d.x;if(d.item==='seogi')d.x=1770;delete d.zone;}
      G.boss.x=1990;G.zone=null;G.px=G.boss.dead?2150:G.f.ppuriPassed?1790:60;G.py=GROUND;G.vy=0;G.cam=clamp(G.px-168,0,2000);delete G.f.dolMemory;
    }
    originalAmbient();
  };
}

/* PA-43 · 돌에 새긴 소원.
   확인할 경험: 먼저 본 장승 안쪽 풍경에 들어가고, 돌의 옛길을 건너 돌아온다.
   필수 교환·보스 조건은 그대로 두며, 옛 구성은 위 정의와 CLASSIC 분기로 보존한다. */
if(!CLASSIC){
  const A=Rg.expansionArt;
  const originalNewState=Rg.newState,originalStart=Rg.onStart;
  const pickupMap=[
    ['field',640,192],['field',690,192],['field',740,192],
    ['field',1790,192],['field',1840,192],['field',1890,192],
    ['village',1920,112],['field',2040,112],
  ];
  const digMap=[['field',1330],['field',1420],['field',1600],['field',2310]];
  function placeOld(g){
    // 기존 저장의 got/done은 유지하고 위치만 현재 배치에 맞춘다.
    let pi=0,di=0;
    for(const p of g.pickups){
      if(p.zone)continue;
      if(p.item==='seoridarae'){Object.assign(p,{id:'dol_darae',zone:'cliff',x:2780,y:112});continue;}
      const at=pickupMap[pi++];if(at)Object.assign(p,{id:'dol_old_pickup_'+(pi-1),zone:at[0],x:at[1],y:at[2]});
    }
    for(const d of g.digs){
      const i=Number(d.id?.match(/^dol_old_dig_([0-3])$/)?.[1]);
      if(Number.isInteger(i))Object.assign(d,{zone:digMap[i][0],x:digMap[i][1]});
      if(d.zone)continue;
      if(d.item==='seogi'){Object.assign(d,{id:'dol_seogi',zone:'cliff',x:1920});continue;}
      const at=digMap[di++];if(at)Object.assign(d,{id:'dol_old_dig_'+(di-1),zone:at[0],x:at[1]});
    }
    if(g.f?.dolExtraPointState)for(const p of g.pickups){const prior=g.f.dolExtraPointState[p.id];if(prior){p.got=prior.got;delete g.f.dolExtraPointState[p.id];}}
    g.boss.x=2400;
  }
  Rg.newState=()=>{const s=originalNewState();placeOld(s);return s;};
  Rg.onStart=()=>{originalStart();placeOld(G);toast('장승 안쪽은 아직 닫혔다. 오른쪽 돌담길이 마을로 이어진다.');};

  const platform=(x,y,w)=>({x,y,w});
  const bases={
    gate:[platform(320,164,86),platform(374,136,76),platform(1320,164,94),platform(1390,136,88),platform(1608,174,60),platform(1680,156,80),platform(2020,112,90),platform(2160,154,90)],
    village:[platform(520,164,94),platform(588,136,80),platform(1120,156,82),platform(1790,164,80),platform(1850,138,84),platform(1910,112,92),platform(2340,164,86),platform(2410,136,90)],
    // 2190 턱은 디딤 없이 바닥에서 80px 위다. 산양 뛰기로만 오른다 (PA-47 선택 자리).
    field:[platform(260,164,100),platform(330,136,85),platform(1180,164,92),platform(1240,136,88),platform(1900,164,86),platform(1960,138,90),platform(2020,112,88),platform(2190,112,76)],
    cliff:[platform(320,164,92),platform(390,136,85),platform(790,164,110),platform(860,136,90),platform(1640,164,96),platform(1710,136,92),platform(2220,166,90),platform(2280,138,90),platform(2350,112,130),platform(2500,138,96),platform(2560,112,294)],
    shrine:[platform(280,164,84),platform(340,136,96),platform(1520,112,110),platform(1630,140,80),platform(1950,164,90),platform(2010,136,98),platform(2590,164,80),platform(2650,136,90)],
  };
  const memories={
    gate:{x:1800,end:2020,y:112,bridge:[platform(1796,166,58),platform(1844,140,70),platform(1910,140,116)],
      say:['돌에 손을 대니, 끊긴 다리가 겹쳐 보인다.\n돌탑이 지금보다 낮았을 때의 길이다.','발밑의 흰 돌부터 밟아 보자.\n떨어져도 아래 돌담길로 돌아오면 된다.']},
    shrine:{x:1120,end:1550,y:112,bridge:[platform(1120,166,62),platform(1172,140,80),platform(1240,140,140),platform(1370,140,150)],
      say:['낮은 돌탑 너머로 옛 다리가 이어진다.\n아빠도 젊었을 때 이 길을 걸었을까.','끝의 높은 바위에 석이버섯이 보인다.\n돌다리를 건너 흰 돌턱으로 가 보자.']},
  };
  Rg.bridgeMemorySeen=()=>!!(G.f.dolBridgeMemorySeen||G.f.dol_memory_gate);
  const bridgeReady=()=>G.f.dolBridgeStage>=3;
  const bridgeOpen=()=>bridgeReady()&&!!G.f.ppuriPassed;
  Rg.bridgeSurveyReady=job=>job?!!G.f.dolBridgeSurvey?.[job]:['bank','arch','rail'].every(k=>G.f.dolBridgeSurvey?.[k]);
  const surveyVisible=()=>G.f.dolMemory?.zone==='gate'||!!G.f.dol_memory_gate||bridgeReady();
  const surveyNotes={
    bank:'밑돌 사이가 비었네.\n물이 지나갈 자리야. 여긴 막지 말자.',
    arch:'넓은 돌이 양쪽에 걸렸어.\n발 놓는 면을 위로 맞추면 되겠다.',
    rail:'끝에는 흰 돌이 있네.\n서리 내려도 발 디딜 곳이 보이겠다.',
  };
  function surveyBridge(job){
    if(!surveyVisible()){talk([['너구리','소원 돌에 손대면 옛 다리가 보여.\n흰 발판을 밟고 올라가 보자.']]);return;}
    talk([['너구리',surveyNotes[job]]],()=>{
      (G.f.dolBridgeSurvey||(G.f.dolBridgeSurvey={}))[job]=true;
      toast('옛 다리의 '+({bank:'받침',arch:'다리판',rail:'끝돌'}[job])+'을 살폈다.');
    });
  }
  function applyMemory(){
    const m=G.f.dolMemory,z=Rg.zones[G.zone],spec=memories[G.zone];
    if(!z)return;
    const active=m?.zone===G.zone&&!!spec;
    if(spec)z.platforms=active||(G.zone==='gate'&&bridgeReady())?[...bases[G.zone],...spec.bridge]:bases[G.zone];
    if(G.zone==='cliff')z.platforms=G.boss.dead?bases.cliff:bases.cliff.filter(p=>p.x<2200);
    if(m&&!active)delete G.f.dolMemory;
    if(active&&!vistaMode&&Sound.ambient!=='dol-memory')Sound.ambience('dol-memory');
    if(!active&&Sound.ambient==='dol-memory')Sound.ambience(null);
  }
  function memoryTalk(zone){
    const spec=memories[zone];
    talk(spec.say.map(s=>['너구리',s]),()=>{
      if(zone==='gate')G.f.dolBridgeMemorySeen=true;
      G.f.dolMemory={zone};applyMemory();
      diary('dol_memory_teach','소원 돌에 손을 대니 옛 돌다리가 보였다. 흰 윗면을 밟으면 건널 수 있겠다. 아래에는 지금의 돌담길이 있어 다시 올라갈 수 있다.');
      toast('흰 돌다리를 따라 건너자. 시간은 넉넉하다.');
    });
  }
  function memoryStep(){
    applyMemory();const spec=memories[G.zone];if(!spec||G.f.dolMemory?.zone!==G.zone)return;
    if(G.px>=spec.end&&G.py<=spec.y+1){
      G.f['dol_memory_'+G.zone]=true;delete G.f.dolMemory;applyMemory();
      diary('dol_memory_'+G.zone,G.zone==='gate'?'옛 다리 끝의 서리 낀 바위에 닿자 지금의 길로 돌아왔다. 바위 아래로 새 돌담길이 보인다.':'소원 돌탑이 낮았던 때의 다리를 건넜다. 지금은 높은 바위만 남았다. 돌 틈에 쉬어 간 이들의 둥근 자국이 있다.');
      toast('옛 다리가 걷히고, 지금의 바위에 발이 닿았다.');
    }else if(G.px<spec.x-40||G.px>spec.end+150){delete G.f.dolMemory;applyMemory();}
  }
  const marker=(x,y)=>{R(x-1,y-24,2,24,'#675443');R(x-11,y-25,23,7,'#e5ddc8');R(x+6,y-23,3,3,'#516b71');};
  const memoryMark=(x,y)=>{R(x-8,y-11,16,11,'#7f8987');R(x-5,y-15,10,4,'#b1b9b3');R(x-4,y-16,8,1,'#eef1df');R(x-1,y-10,3,5,'#b78159');};
  const blocked=(x,y)=>A.drawBlocked(x,y);
  const permit=()=>!!G.f.ppuriPassed;
  const calm=()=>!!G.boss.dead;
  const gateReason='뿔이에게 메밀가루를 건네 장승제를 올려야 한다.';
  let depthFx=null;
  const travel=el('div');travel.id='dolDepthTravel';travel.hidden=true;travel.style.cssText='pointer-events:none';$('shell').appendChild(travel);
  defineMinigame({id:travel.id,hit:()=>{},step:()=>{
    if(!depthFx){travel.hidden=true;return;}
    depthFx.tick++;
    if(depthFx.tick>=TABLES.TUNING.zone_transition_frames){
      const p=depthFx.door;travel.hidden=true;depthFx=null;
      changeZone(p.to,{x:p.toX,y:p.toY});
    }
  }});
  function enterDepth(p){
    if(!pathOpen(p)){toast(p.reason);return;}
    const image=document.createElement('canvas');image.width=W;image.height=H;image.getContext('2d').drawImage(cv,0,0);
    depthFx={door:p,tick:0,image,pivot:Math.round(p.x-G.cam)};suppressHeldInputs();travel.hidden=false;
  }
  function specialInteract(e){
    if(REG!==Rg||!usesZones(Rg)||paused())return;
    const p=nearInteraction();if(!p||(!p.memory&&!p.depth&&!p.bridgeWork&&!p.memorySurvey))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(e.type==='keydown')suppressedKeys.add(e.key.toLowerCase());
    if(p.memorySurvey)surveyBridge(p.memorySurvey);else if(p.bridgeWork)Rg.bridgeTalk?.(p.bridgeJob);else if(p.memory)memoryTalk(G.zone);else enterDepth(p);
  }
  addEventListener('keydown',e=>{
    if(e.repeat||!['e','enter','arrowup'].includes(e.key.toLowerCase()))return;
    if(e.target instanceof HTMLElement&&(e.target.matches('input,textarea,select')||e.target.isContentEditable))return;
    specialInteract(e);
  },true);
  $('padTalk').addEventListener('pointerdown',specialInteract,true);
  $('prompt').addEventListener('click',specialInteract,true);

  function drawStonePlatforms(id){
    for(const p of Rg.zones[id].platforms){const x=Math.round(p.x-cam);if(x>W||x+p.w<0)continue;
      const remembered=G.f.dolMemory?.zone===id&&memories[id]?.bridge.includes(p);
      if(remembered){R(x,p.y,p.w,6,'#8d9690');A.drawMemoryBridge(x,p.y,p.w);continue;}
      if(id==='gate'&&bridgeReady()&&memories.gate.bridge.includes(p)){A.drawRestoredBridge(x,p.y,p.w);continue;}
      R(x,p.y,p.w,6,'#737e7d');R(x,p.y,p.w,2,'#e2e9e4');R(x+2,p.y+6,p.w-4,3,'#535f60');
      for(let k=13;k<p.w;k+=23)R(x+k,p.y+2,1,5,'#4b595b');
    }
  }
  function front(id){
    A.drawFront(id);
    if(G.f.dolMemory?.zone===id){
      ctx.save();ctx.globalAlpha=.66;ctx.filter='grayscale(1)';ctx.drawImage(cv,0,0);ctx.filter='none';ctx.globalAlpha=.18;R(0,0,W,H,'#d6cdb7');ctx.restore();
      // 기억은 현재 지형 위에 겹친다. 돌아올 바닥과 발판의 흰 면은 가리지 않는다.
      for(let i=0;i<7;i++)R((i*71+Math.round(cam*.12))%W,38+i*17,38,1,'rgba(235,229,207,.38)');
    }
    if(depthFx){
      const t=depthFx.tick/TABLES.TUNING.zone_transition_frames;
      ctx.save();ctx.imageSmoothingEnabled=false;
      if(!Vfx.reducedMotion){const s=depthFx.door.reverse?1-.13*t:1+.18*t;ctx.translate(depthFx.pivot,H*.72);ctx.scale(s,s);ctx.drawImage(depthFx.image,-depthFx.pivot,-H*.72);ctx.setTransform(1,0,0,1,0,0);
        const spread=Math.round(t*48);A.drawDepthGate(depthFx.pivot,GROUND,spread);}
      ctx.globalAlpha=t;R(0,0,W,H,'#344247');ctx.restore();
    }
  }
  function commonStep(id){
    memoryStep();if(Rg.arcs())G.f.arcs=true;
    if(!G.f.dolSeenZones)G.f.dolSeenZones={};G.f.dolSeenZones[id]=true;
    if(id==='shrine'&&!G.boss.dead&&G.f.ppuriPassed&&G.px>2310)Rg.startGolem();
  }
  function zone(id,w,npcs){return {w,startX:80,ground:GROUND,platforms:bases[id],npcs,
    weather:()=>Vfx.setWeather(Rg.springRevisit()?'':'frost'),ambient:()=>{if(!open('dlg'))ppuriScene=null;placeOld(G);Rg.ambient();applyMemory();},
    drawBack:()=>A.drawBack(id),drawScenery:()=>{A.drawScenery(id);if(id==='gate')A.drawBridgeWork(1870-cam,GROUND);drawStonePlatforms(id);},
    drawActors:()=>{if(id==='shrine')drawCairn();if(id==='field')drawKkuCue();},
    weatherFront:()=>front(id),drawPickup:Rg.drawPickup,drawDig:Rg.drawDig,onPickup:a=>Rg.onPickup(a),
    step:()=>commonStep(id),onHit:()=>{},faint:()=>{G.px=id==='shrine'?2240:80;G.py=GROUND;G.vy=0;delete G.f.dolMemory;applyMemory();toast('돌담 안쪽에서 숨을 골랐다. 보따리는 그대로다.');},
  };}
  Rg.startZone='gate';
  Rg.zones={gate:zone('gate',2400,['ppuri']),village:zone('village',2800,['dolsoe','nal']),field:zone('field',2600,['kkubeogi']),cliff:zone('cliff',3000,[]),shrine:zone('shrine',2800,[])};
  // 대화가 이어지는 동안은 화자의 자리를 지키고, 끝나면 진행값으로 위치를 정한다.
  let ppuriScene=null;
  const ppuriVillage=()=>ppuriScene?.owner===G&&open('dlg')?
    ppuriScene.zone==='village':!!G?.f.ppuriMet&&!G.f.ppuriPassed;
  // 복원 중에는 같은 돌쇠가 현장에 온다. 두 구역에 동시에 놓지 않는다.
  Object.defineProperty(Rg.zones.gate,'npcs',{get:()=>{
    const n=Rg.npcs?.find(n=>n.id==='dolsoe');
    const list=ppuriVillage()?[]:['ppuri'];
    return G?.f.dolBridgeCrewHere&&n?[...list,{...n,x:1908,zone:'gate',props:null}]:list;
  }});
  Object.defineProperty(Rg.zones.village,'npcs',{get:()=>[
    ...(G?.f.dolBridgeCrewHere?['nal']:['dolsoe','nal']),...(ppuriVillage()?['ppuri']:[])]});
  Rg.zones.gate.exits={right:{to:'village',toX:80}};
  Rg.zones.village.exits={left:{to:'gate',toX:2320},right:{to:'field',toX:80}};
  Rg.zones.field.exits={left:{to:'village',toX:2720}};
  Rg.zones.cliff.exits={right:{to:'shrine',toX:80}};
  Rg.zones.shrine.exits={left:{to:'cliff',toX:2920}};
  Rg.zones.gate.doors=[
    {id:'dol_depth_gate',depth:true,x:1650,to:'cliff',toX:100,label:'장승 사이, 먼 돌산으로 · ↑ / E',need:permit,reason:gateReason,draw:(x,y)=>A.drawDepthGate(x,y),drawBlocked:blocked},
    {id:'dol_memory_gate',memory:true,x:1800,to:'gate',toX:1800,label:'소원 돌에 손대기 · 옛 다리',draw:memoryMark},
    {id:'dol_bridge_work',bridgeWork:true,x:1870,to:'gate',toX:1870,get label(){return bridgeReady()?'함께 놓은 돌다리 살펴보기 · E':'옛 돌다리 다시 놓기 · E';},draw:(x,y)=>A.drawBridgeWorkMarker(x,y)},
    {id:'dol_bridge_bank',bridgeWork:true,bridgeJob:'bank',x:1760,to:'gate',toX:1760,label:'다리 받침돌 놓기 · E',draw:(x,y)=>A.drawBridgeWorkMarker(x,y)},
    {id:'dol_bridge_arch',bridgeWork:true,bridgeJob:'arch',x:1960,to:'gate',toX:1960,label:'다리 가운데 돌 맞추기 · E',draw:(x,y)=>A.drawBridgeWorkMarker(x,y)},
    {id:'dol_bridge_rail',bridgeWork:true,bridgeJob:'rail',x:2210,to:'gate',toX:2210,label:'다리 난간돌 세우기 · E',draw:(x,y)=>A.drawBridgeWorkMarker(x,y)},
    ...[{job:'bank',x:1820,y:166,name:'옛 다리 밑돌'},{job:'arch',x:1885,y:140,name:'옛 다리판'},{job:'rail',x:2045,y:112,name:'옛 다리 끝돌'}].map(p=>({
      id:'dol_bridge_survey_'+p.job,memorySurvey:p.job,x:p.x,y:p.y,to:'gate',toX:p.x,toY:p.y,
      get label(){return p.name+(Rg.bridgeSurveyReady(p.job)?' 다시 보기 · E':' 살피기 · E');},
      draw:(x,y)=>{if(surveyVisible())A.drawBridgeSurvey(x,y,Rg.bridgeSurveyReady(p.job));},
    })),
    // 무너진 옛 다리는 몸의 문제라 다람쥐가 남은 들보로 건넌다. 뿔이의 허락(장승제)은 약속이라 변신으로도 남는다 (PA-47).
    {id:'dol_bridge_shortcut',depth:true,x:2040,y:112,to:'cliff',toX:1770,toY:192,label:'놓은 돌다리로 절벽길에 · E',need:bridgeOpen,reason:'다리를 다 놓고 뿔이의 길 허락을 받으면 절벽길로 이어진다.',draw:marker,
      formPass:'squirrel',formNeed:permit,formLabel:'다람쥐로 남은 들보 타고 건너기'},
  ];
  Rg.zones.village.doors=[{id:'dol_depth_shrine',depth:true,x:2440,to:'shrine',toX:100,label:'돌계단 안쪽, 성황당으로 · ↑ / E',need:permit,reason:gateReason,draw:marker,drawBlocked:blocked}];
  Rg.zones.cliff.doors=[
    {id:'dol_depth_back',depth:true,reverse:true,x:100,to:'gate',toX:1650,label:'장승 고갯길로 돌아가기 · E',draw:marker},
    {id:'dol_bridge_return',depth:true,reverse:true,x:1770,to:'gate',toX:2040,toY:112,label:'함께 놓은 돌다리로 돌아가기 · E',need:bridgeOpen,reason:'고갯길에서 옛 다리를 다시 놓으면 이 길로 돌아갈 수 있다.',draw:marker,
      formPass:'squirrel',formNeed:permit,formLabel:'다람쥐로 남은 들보 타고 돌아가기'},
    {id:'dol_darae_path',depth:true,x:2160,to:'cliff',toX:2240,label:'골렘이 비켜 준 다래길',need:calm,reason:'성황당 돌무더기가 절벽 위 길을 흔든다. 성황당에서 먼저 잠재우자.',draw:marker,drawBlocked:blocked},
  ];
  // 다래길은 발판만으로 우회하지 못하게 한다. 아래길에서 성황당 출구까지는 항상 안전하다.
  const cliffBases=bases.cliff;
  Rg.zones.cliff.step=()=>{Rg.zones.cliff.platforms=G.boss.dead?cliffBases:cliffBases.filter(p=>p.x<2200);commonStep('cliff');};
  Rg.zones.shrine.doors=[
    {id:'dol_depth_village',depth:true,reverse:true,x:100,to:'village',toX:2440,label:'돌담 마을로 돌아가기 · E',draw:marker},
    {id:'dol_memory_shrine',memory:true,x:1120,to:'shrine',toX:1120,label:'낮은 소원 돌에 손대기 · 옛 다리',draw:memoryMark},
    {id:'dol_after_golem',depth:true,x:2630,to:'cliff',toX:2630,toY:112,label:'아까 본 절벽 끝으로 · E',need:calm,reason:'돌무더기가 가라앉으면 절벽 끝으로 이어진다.',draw:marker,drawBlocked:blocked},
  ];
  // 필수 물건은 선택 발견에 기대지 않는다. 기존 여섯 알·두 가지에 정확히 +3/+1.
  Rg.zones.field.pickups=[{id:'dol_memil_extra1',x:790,y:192,item:'memil',got:false},{id:'dol_memil_extra2',x:1940,y:192,item:'memil',got:false},{id:'dol_memil_extra3',x:1990,y:192,item:'memil',got:false}];
  Rg.zones.gate.pickups=[{id:'dol_mistletoe_extra',x:2060,y:112,item:'gyeousari',got:false}];
  // 무너진 다리의 남은 들보. 다람쥐가 타고 다리 끝돌(y=112)에 오른다 (PA-47)
  Rg.zones.gate.climbs=[{x:2028,top:112,draw:(x,y,top)=>{R(x-2,top,4,y-top,'#6d665c');R(x-2,top,1,y-top,'#a7a093');for(let k=top+9;k<y-4;k+=14)R(x-3,k,6,2,'#4f4a43');}}];
  // 산양 턱의 석이버섯, 다람쥐의 잊은 몫 (PA-47 선택 자리)
  Rg.zones.field.pickups.push({id:'dol_goat_seogi',x:2228,y:112,item:'seogi',got:false});
  Rg.zones.field.digs=[{id:'dol_cache_field',x:880,item:'memil',n:2,form:'squirrel',cache:true,done:false}];
  Rg.zones.village.digs=[{id:'dol_cache_village',x:1420,item:'acorn',n:2,form:'squirrel',cache:true,done:false}];
  Rg.zones.shrine.pickups=[{id:'dol_memory_seogi',x:1580,y:112,item:'seogi',got:false}];
  Rg.zones.cliff.vistas=[{id:'dawn_clouds',x:2680,y:112,from:80,to:430,sound:'wind',thought:'해 떴다!\n엄마도 보고 있을까.',diary:'돌산 절벽 끝에서 구름바다 위로 해가 솟는 것을 봤다. 처음 고갯길에서 봤던 먼 돌산에 서 있다.',draw:marker,layers:A.cliffLayers}];
  Rg.zones.shrine.vistas=[{id:'wishing_stones',x:1850,from:40,to:390,sound:'wind',thought:'작은 돌도 받치고 있네.\n엄마 돌도 놓을래.',diary:'성황당 돌탑 아래에서 바람을 들었다. 작은 돌들이 서로를 받치고 있었다.',draw:marker,layers:A.shrineLayers}];

  // story.js가 NPC와 콜백을 모두 등록한 뒤 한 번 호출한다.
  Rg.installExpansion=()=>{
    const loc={kkubeogi:['field',1510],dolsoe:['village',1080],nal:['village',1640],ppuri:['gate',610]};
    for(const n of Rg.npcs){const at=loc[n.id];n.zone=at[0];n.x=at[1];}
    const ppuri=Rg.npcs.find(n=>n.id==='ppuri'),ppuriTalk=ppuri.talk;
    Object.defineProperties(ppuri,{
      x:{configurable:true,get:()=>ppuriVillage()?2380:610},
      zone:{configurable:true,get:()=>ppuriVillage()?'village':'gate'},
    });
    ppuri.talk=()=>{
      ppuriScene={owner:G,zone:G.zone};
      if(G.zone==='village'&&G.f.ppuriMet&&!G.f.ppuriPassed)
        talk([['뿔이','장승제 전에 성황당 길을 살펴 두는 중이다.\n메밀가루를 가져오면 여기서 바로 부치마.']],ppuriTalk);
      else ppuriTalk();
    };
    const oldBossDie=Rg.bossDie;
    Rg.bossDie=()=>{oldBossDie();placeOld(G);};
    Rg.addSeogiSpot=()=>{if(!G.digs.some(d=>d.id==='dol_seogi'))G.digs.push({id:'dol_seogi',zone:'cliff',x:1920,item:'seogi',done:false});};
    Rg.startGolem=()=>{
      G.px=2275;
      inkTransition('전투',(G.boss.x-G.cam)/W*100,()=>startBattle('golem',res=>{
        if(res==='win'||res==='calm'){
          if(res==='calm'){G.f.golemCalm=true;diary('d_calm','아빠가 올리다 만 소원 돌을 성황당 꼭대기에 대신 올려 주었다. 돌 골렘이 조용히 내려앉았다.');}
          Rg.bossDie();
        }else{G.px=2240;G.f.faints+=res==='lose'?1:0;diary('d_hint','돌 골렘의 다리나 팔을 먼저 무너뜨리거나, 마음을 달랠 물건을 건네 보자.');toast('성황당 앞에서 숨을 골랐다. 준비되면 다시 다가가자.');}
      }));
    };
    Rg.sendMedicine=()=>{
      if(regionCompleted(Rg.id))return;
      G.f.yakMade=true;
      diary('d_end','깨어난 맷돌로 서리다래를 갈았다. 마을 돌담의 늙은 까치에게 내가 만든 약즙을 맡겼다.');
      talk([['너구리','까치야, 엄마 약이야.\n남쪽 단풍골 너머 우리 집으로 부탁해.'],['늙은 까치','남쪽 집으로. 단단히 묶었구나.\n다녀오마.']],()=>Rg.finishHomeDelivery());
    };
    const oldGoal=Rg.goal;
    Rg.goal=()=>{
      if(!G.started||G.ended)return oldGoal();
      if(has('darae_yak'))return '마을 돌담의 늙은 까치에게 약즙 맡기기 · 성황당 입구로 돌아가면 마을';
      if(!G.f.ppuriMet)return '장승 고갯길 · 뿔이에게 돌산 길 묻기';
      if(!G.f.kkuTalk)return '돌담 마을을 지나 오른쪽 메밀밭의 꾸벅이 찾아가기';
      if(!G.f.ppuriPassed&&has('memil_powder'))return '돌담 마을 돌계단 앞 · 뿔이에게 메밀가루 건네기';
      if(G.f.ppuriPassed&&!G.boss.dead)return '장승 사이 또는 마을 돌계단 안쪽 → 성황당 끝의 돌 골렘';
      if(G.boss.dead&&!G.f.daraePicked)return '성황당 끝 샛길 → 절벽 위의 서리다래 · 흰 돌턱을 밟자';
      return oldGoal();
    };
  };
}
})();
