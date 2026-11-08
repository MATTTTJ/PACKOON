'use strict';
/* 북쪽 영산 필드: 남색 밤하늘의 늦겨울 → 강철이를 넘기면 첫봄.
   깊은 눈길(설피가 있어야 지난다), 마가목 비탈, 살금이, 얼어붙은 비탈(살금이의 지름길), 호숫가, 언 호수와 신목 */
(()=>{
const Rg=REGIONS.yeongsan;
const MG=TABLES.MINIGAMES;
const SNOW_X=790;      // 깊은 눈길
const SLOPE_X=1600;    // 얼어붙은 비탈
const LAKE_X=1960;     // 호수
const TREE_X=2236;     // 호수 가운데 섬의 신목
const BOSS_AT=2030;    // 이보다 오른쪽으로 가면 강철이
const spring=()=>G.f.spring;
// 결정 D-87: 호숫가 강철이에게 다가갈수록 긴장이 오른다. 봄이 오면(강철이가 떠나면) 0.
Rg.moodTension=()=>{
  if(!G.started||G.boss.dead||spring()||(!CLASSIC&&G.zone!=='island'))return 0;
  return clamp(1-(Math.abs((CLASSIC?BOSS_AT:trimX(BOSS_AT,Rg.trimCuts?.island))-G.px)-60)/800,0,1);
};

/* ---------- 배경 ---------- */
function ridge(par,col,base,amp,freq){ctx.fillStyle=col;for(let x=0;x<W;x+=2){const wx=x+RC()*par;const h=base-Math.abs(Math.sin(wx*freq))*amp-Math.sin(wx*freq*2.2+1)*amp*0.3;ctx.fillRect(x,Math.round(h),2,H-Math.round(h));}}
function drawSky(){
  const g=ctx.createLinearGradient(0,0,0,H);
  if(spring()){g.addColorStop(0,'#f6d8e2');g.addColorStop(.6,'#f0c0cc');g.addColorStop(1,'#e8a8b8');}
  else{g.addColorStop(0,'#1a2244');g.addColorStop(.6,'#2c3866');g.addColorStop(1,'#46508a');}
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  if(!spring())for(let i=0;i<46;i++){const x=Math.round((hash(i*5.7)*W*1.3-RC()*0.02)%W+W)%W,y=Math.round(hash(i*2.9)*100);R(x,y,1,1,i%6?'#d8e0f8':'#fff6d8');}
  else{const sx=Math.round(300-RC()*0.03);R(sx,28,16,16,'#fff8f0');R(sx-2,32,20,8,'#fff8f0');}
  ridge(0.1,spring()?'#d8a0b4':'#3a4472',112,40,0.005);
  ridge(0.22,spring()?'#c88aa0':'#4a5484',134,26,0.010);
  ridge(0.22,'rgba(255,255,255,.5)',112,40,0.005);   // 눈 쌓인 봉우리 빛
  for(let i=0;i<6;i++)R(i*87-(RC()*.07)%87,141+i%3*3,65,2,spring()?'#ddd1d1':'#7e8ba4');
}
function drawGround(){
  R(0,GROUND,W,H-GROUND,spring()?'#8a7a6a':'#c8d0e0');R(0,GROUND,W,3,spring()?'#9ab870':'#f4f7fa');
  const s=Math.floor(cam);
  for(let x=0;x<W;x+=3){const wx=x+s-(s%3);const r=hash(wx+5);
    if(spring()&&r<0.2)R(x-(s%3),GROUND-1,2,1,r<0.07?'#e880a0':'#7fa860');
    if(!spring()&&r>0.9)R(x-(s%3),GROUND+5+Math.floor(r*12),2,1,'#a8b4cc');}
}
/* 깊은 눈더미: 설피 없이는 못 넘는다 */
function drawDrift(){const x=SNOW_X-cam;if(x>W+20||x<-200)return;if(spring())return;
  for(let i=0;i<9;i++){const h=G.f.seolpi?10:22+((i*7)%10);R(x+i*18,GROUND-h,22,h,'#eef2f8');R(x+i*18,GROUND-h,22,2,'#ffffff');}
  if(G.f.seolpi)for(let i=0;i<8;i++)R(x+6+i*20,GROUND-11,6,2,'#c8d0e0');}   // 설피 자국
/* 마가목 */
function drawRowan(wx){const x=wx-RC();   // 물건 자리(이미 옮긴 좌표)에 그린다 (D-128)
 if(x<-40||x>W+40)return;
  R(x-2,GROUND-60,5,60,'#5a4030');R(x-16,GROUND-56,16,2,'#5a4030');R(x+2,GROUND-64,16,2,'#5a4030');
  R(x-18,GROUND-58,18,1,spring()?'#9ab870':'#f4f7fa');R(x+2,GROUND-66,18,1,spring()?'#9ab870':'#f4f7fa');}
/* 얼어붙은 비탈 */
function drawSlope(){const x=SLOPE_X-cam;if(x<-80||x>W+40)return;
  if(spring()){R(x-10,GROUND-6,60,6,'#7a8a6a');return;}
  R(x-6,GROUND-60,50,60,'#a8c4dc');R(x-6,GROUND-60,50,3,'#e8f2fa');for(let i=0;i<5;i++)R(x+i*10,GROUND-56+i*8,18,2,'#d8e8f4');
  if(G.f.shortcut){for(let i=0;i<5;i++)R(x+2+i*9,GROUND-10-i*10,5,2,'#6b5038');}   // 살금이가 알려 준 발 디딜 자리
}
/* 호수와 섬, 신목 */
function drawLake(){const x=LAKE_X-cam;if(x>W+10)return;
  R(x,GROUND-2,W+40,H-GROUND+2,spring()?'#7ab0d0':'#d8e8f4');R(x,GROUND-2,W+40,2,spring()?'#a8d4ea':'#ffffff');
  if(!spring())for(let i=0;i<8;i++)R(x+20+i*60,GROUND+6+(i%3)*6,30,1,'#b8cce0');
  else for(let i=0;i<10;i++){const k=(G.anim*0.3+i*40)%480;R(x+k,GROUND+8+(i%3)*5,10,1,'#d8f0fa');}
  const tx=TREE_X-cam;R(tx-46,GROUND-4,92,6,spring()?'#8a7a5a':'#e8eef4');   // 섬
  R(tx-8,GROUND-120,16,118,'#4a3424');R(tx-30,GROUND-110,24,4,'#4a3424');R(tx+6,GROUND-118,30,4,'#4a3424');R(tx-24,GROUND-140,6,32,'#4a3424');R(tx+16,GROUND-146,6,30,'#4a3424');
  R(tx-4,GROUND-100,2,51,'#8d7560');R(tx+3,GROUND-79,2,48,'#302d2b');
  R(tx-11,GROUND-41,22,3,'#c5ac79');for(let i=0;i<3;i++){R(tx-8+i*7,GROUND-38,2,5,'#f4efe4');R(tx-9+i*7,GROUND-34,4,2,'#f4efe4');}   // 금줄
  if(spring()){
    const leaves=[[-67,-170,50,20],[-25,-190,58,27],[23,-175,60,20],[-43,-143,35,15],[19,-147,45,17]];
    for(const b of leaves){R(tx+b[0],GROUND+b[1],b[2],b[3],'#799a60');R(tx+b[0]+5,GROUND+b[1]+3,b[2]-10,5,'#c3d69a');}
    for(const dx of [-42,46])for(let i=0;i<5;i++){
      R(tx+dx+i*4,GROUND-10-i%2*4,1,10+i%2*4,'#7a6657');
      R(tx+dx+i*4-2,GROUND-13-i%2*4,5,4,'#d990ad');R(tx+dx+i*4,GROUND-14-i%2*4,2,6,'#edb5c6');
    }
  }
  else{R(tx-30,GROUND-112,24,1,'#ffffff');R(tx+6,GROUND-120,30,1,'#ffffff');}
}
/* 결정 D-1182: 필드의 보스 자리는 이무기 똬리 대신 어둑차사(name-story-v3 §3.1).
   갓 쓴 키 큰 그림자가 섬 기슭에 서 있다. 갓 아래는 비어 있고, 도포 자락은 먹물처럼 바닥에 번진다.
   붉은색은 손에 늘어뜨린 적패지에만 쓴다. 이름(drawCoil)은 다른 파일이 부르니 그대로 둔다. */
function drawCoil(){if(G.boss.dead)return;const x=G.boss.x-RC();   // 보스 자리는 이미 옮긴 좌표 (D-128)
  if(x<-120||x>W+120)return;const b=Math.floor(G.anim/24)%2,sw=Math.round(Math.sin(G.anim/40)*2);
  const INK='#0d0b10',INK2='#1b1820',INK3='#2a2630';
  // 바닥에 번진 어둠 (어둑시니: 숨 쉬듯 부풀었다 준다)
  R(x-40-b*2,GROUND-3,80+b*4,3,INK2);R(x-28-b,GROUND-5,56+b*2,2,INK2);R(x-52-b*3,GROUND-1,104+b*6,1,INK3);
  // 도포: 아래로 넓게 퍼지고 자락 끝이 까마귀 깃으로 풀린다
  for(let i=0;i<14;i++){const yy=GROUND-6-i*5,w=34-i*1.2;R(Math.round(x-w/2),yy,Math.round(w),5,i%3?INK:INK2);}
  for(const [dx,h] of [[-19,7],[-14,9],[-8,6],[-2,8],[4,7],[10,9],[15,6]])R(x+dx,GROUND-6,2,h>7?3:2,INK3),R(x+dx+1,GROUND-4+((dx+b)%2),1,3,INK);
  // 소매: 양옆으로 늘어진 깃 끝, 길고 흰 손
  R(x-22,GROUND-58+sw,7,24,INK);R(x+15,GROUND-58-sw,7,24,INK);
  for(let k=0;k<4;k++){R(x-24+k,GROUND-34+sw+k*2,2,3,INK2);R(x+20+k,GROUND-34-sw+k*2,2,3,INK2);}
  R(x-21,GROUND-33+sw,2,7,'#d8d4cc');R(x-19,GROUND-31+sw,1,6,'#d8d4cc');R(x+18,GROUND-33-sw,2,6,'#d8d4cc');
  // 적패지: 오른손에서 바닥까지 늘어진 붉은 천, 읽히지 않는 붓 자국
  R(x+18,GROUND-27-sw,4,25+sw,'#8e2018');R(x+18,GROUND-27-sw,1,25+sw,'#b8392a');
  for(let k=0;k<4;k++)R(x+19,GROUND-24-sw+k*6,2,1,'#3a0a06');
  R(x+16+sw,GROUND-3,9,2,'#8e2018');
  // 갓: 넓은 챙과 높은 대우, 갓끈. 그 아래는 얼굴 없이 어둠뿐, 이따금 부리 같은 그림자
  R(x-9,GROUND-84,18,4,INK);R(x-24,GROUND-77,48,3,INK);R(x-26,GROUND-76,52,1,INK3);R(x-7,GROUND-80,14,3,INK2);
  R(x-9,GROUND-74,18,10,INK);R(x-5,GROUND-73,1,10,INK3);R(x+4,GROUND-73,1,10,INK3);   // 갓끈
  if(b)R(x-1,GROUND-68,4,2,INK3),R(x+2,GROUND-67,2,1,INK3);
}
Rg.drawBack=()=>{drawSky();drawGround();};
Rg.drawScenery=()=>{[1000,1140,1280,1360].forEach(drawRowan);drawDrift();drawSlope();drawLake();drawCoil();};
Rg.drawPickup=(a,x,bob)=>{
  // 결정 D-393: 마가목 열매는 갈라진 꽃자루 끝에 작고 둥근 주황빛 열매가 우산처럼 다닥다닥 달린 송이
  if(a.item==='magamok'){
    R(x,a.y-11,1,3,'#5a4030');R(x-2,a.y-9,5,1,'#5a4030');R(x-3,a.y-8,1,1,'#5a4030');R(x+3,a.y-8,1,1,'#5a4030');
    for(const [dx,dy,c] of [[-4,-7,'#d8402a'],[-2,-7,'#f06a3a'],[0,-7,'#d8402a'],[2,-7,'#f06a3a'],[4,-7,'#d8402a'],[-3,-6,'#f06a3a'],[-1,-6,'#c02a22'],[1,-6,'#f06a3a'],[3,-6,'#c02a22'],[-2,-5,'#d8402a'],[0,-5,'#f06a3a'],[2,-5,'#d8402a']])R(x+dx,a.y+dy+bob,1,1,c);
    R(x-3,a.y-8+bob,2,1,'#f4f7fa');R(x+1,a.y-8+bob,3,1,'#f4f7fa');}
  // 결정 D-265: 눈 위의 솔방울, 청설모가 떨군 잣송이(잣나무는 높은 산에 자란다)
  else if(a.item==='solbang')drawPineCone(x,a.y+bob,true);   // 결정 D-393
  // 결정 D-393: 잣송이는 달걀꼴이고 두꺼운 비늘 끝이 젖혀지며 틈에 송진이 맺힌다.
  // 결정 D-1065 (사용자 피드백 2026-11-06 31: 잣이 너무 크다): 솔방울(7×7)·마가목 송이와 비슷한 크기(7×9)로 줄였다. 줍는 물건은 주인공 머리보다 작다
  else if(a.item==='jat'){
    for(const [dy,h] of [[-9,1],[-8,2],[-7,3],[-6,3],[-5,3],[-4,3],[-3,2],[-2,1]])R(x-h,a.y+dy+bob,h*2+1,1,'#6b4a2a');
    for(const [dx,dy] of [[-1,-7],[1,-7],[-2,-5],[0,-5],[2,-5],[-1,-3],[1,-3]])R(x+dx,a.y+dy+bob,1,1,'#a8844e');
    for(const [dx,dy] of [[0,-6],[-1,-4],[1,-4]])R(x+dx,a.y+dy+bob,1,1,'#3e2a18');
    R(x+1,a.y-6+bob,1,1,'#e8d8a0');R(x-1,a.y-10+bob,3,1,'#f4f7fa');}
  // 결정 D-1065: 짚단도 다른 줍는 물건과 비슷한 크기로 (8×7, 가운데를 새끼로 묶었다)
  // 결정 D-1221 (사용자 지시 2026-11-07 4스테이지 18): 눕힌 네모 대신 위로 길게 세운 짚단(7×13). 허리를 새끼로 묶고, 위는 이삭 끝이 벌어졌다
  else if(a.item==='jip'){
    R(x-3,a.y-13,1,3,'#d9b860');R(x-1,a.y-14,1,4,'#e6c870');R(x+1,a.y-14,1,4,'#d9b860');R(x+3,a.y-13,1,3,'#e6c870');   // 벌어진 이삭 끝
    R(x-2,a.y-10,5,10,'#d9b860');R(x-1,a.y-10,1,10,'#e6c870');R(x+2,a.y-10,1,10,'#b8983e');   // 줄기 다발
    R(x-3,a.y-6,7,2,'#8a6a2e');   // 허리 새끼
    R(x-3,a.y-1,7,1,'#b8983e');R(x-2,a.y-14,1,1,'#f4f7fa');R(x+2,a.y-14,1,1,'#f4f7fa');}   // 밑동, 끝에 앉은 눈
  else if(a.item==='legend_fruit'){const gl=Math.floor(G.anim/8)%2;R(x-4,a.y-9+bob,8,8,'#f0a0b8');R(x-2,a.y-8+bob,3,3,'#fde0ea');R(x-1,a.y-12,2,3,'#6b4423');if(gl){R(x-7,a.y-12,1,1,'#fff6d8');R(x+6,a.y-6,1,1,'#fff6d8');}}
};
Rg.drawDig=(d,x)=>{if(d.item!=='darae_vine')return false;
  if(d.done){R(x-8,GROUND-3,16,3,'#8a8a7a');return true;}
  // 결정 D-393: 다래 덩굴 덤불. 낮은 눈 둔덕 위로 굵은 덩굴이 고리처럼 얽혀 오르고, 덩굴 위에 눈이 얹혔다(잎은 겨울이라 몇 장 마른 것만)
  x=Math.round(x);
  for(let j=0;j<4;j++){const half=10-j*2;R(x-half,GROUND-j-1,half*2+1,1,j===3?'#ffffff':'#e4ecf2');}
  // 고리 셋: [가운데 dx, dy, 가로 반지름, 세로 반지름, 시작각, 끝각, 색]
  for(const [cx,cy,rx,ry,a0,a1,c] of [[-3,-6,6,7,Math.PI*.9,Math.PI*2.3,'#6b5238'],[3,-8,5,8,Math.PI*.6,Math.PI*2.1,'#4a3a28'],[0,-4,9,4,Math.PI,Math.PI*2,'#5c4630']])
    for(let t=a0;t<=a1;t+=0.12)R(x+Math.round(cx+Math.cos(t)*rx),GROUND+Math.round(cy+Math.sin(t)*ry),2,1,c);
  for(const [dx,dy] of [[-5,-13],[2,-16],[6,-12],[-8,-8],[8,-6]])R(x+dx,GROUND+dy,3,1,'#f4f7fa');
  R(x+4,GROUND-11,2,2,'#8a7a4a');R(x-7,GROUND-5,2,1,'#8a7a4a');R(x-1,GROUND-12,1,2,'#8a7a4a');
  if(Math.floor((G.anim+d.x)/14)%3===0)R(x+3,GROUND-20,1,1,'#fff3b0');return true;};

/* 눈 / 봄 버들씨 */
const fall=Array.from({length:34},(_,i)=>({x:Math.random()*W,y:Math.random()*H,s:0.25+Math.random()*0.4,p:Math.random()*6}));
Rg.ambient=()=>{Rg.clearClimax?.();for(const l of fall){l.y+=l.s;l.p+=0.025;l.x+=Math.sin(l.p)*0.35-(spring()?0.2:0.05);if(l.y>H){l.y=-3;l.x=Math.random()*W;}if(l.x<-3)l.x=W+2;}};
Rg.drawFront=()=>{for(const [i,l] of fall.entries())if(!spring()||i%4===0)R(l.x,l.y,spring()?1:2,Math.sin(l.p)>0?2:1,spring()?'#f4efdb':'#ffffff');
  if(!spring()){ctx.fillStyle='rgba(20,28,70,.12)';ctx.fillRect(0,0,W,H);}};

/* ---------- 진행 ---------- */
/* 예고는 항상 36프레임, 귀가 선 뒤에도 12프레임은 멈출 여유가 있다.
   가까워져도 풀 뜯는 시간만 조금 달라진다. 옛 저장에는 이 상태를 덧붙인다. */
Rg.salgAlert=()=>!!G.salg&&G.salg.phase==='alert';
function stepSalg(){
  const s=G.salg;if(G.f.salgDone)return;
  if(!s.phase){s.phase='graze';s.timer=MG.salg_graze;s.risk=0;s.tick=0;}
  s.tick++;
  const d=Math.abs(s.x-G.px),moving=Math.abs(G.vx)>MG.salg_moving;
  if(s.startle>0){s.startle--;if(!s.startle){s.phase='graze';s.timer=MG.salg_return_graze;s.risk=0;}return;}
  // 결정 D-1124 (사용자 지시 2026-11-07 4스테이지 8): 놀라 물러난 뒤 제자리로 걸어 돌아오던 것을 뺐다.
  //   가만히 서 있으면 살금이가 이쪽으로 밀려오는 것처럼 보였다. 물러난 자리에서 다시 풀을 뜯고, 아이가 조심히 다가가야 한다.
  if(d>=MG.salg_active_distance)return;
  if(!s.greeted){s.greeted=true;Rg.salgSay('start');}
  if(!s.arrived&&d<MG.salg_arrival_distance){s.arrived=true;Rg.salgSay('good');}
  if(s.phase==='graze'&&s.timer%MG.salg_grass_interval===0)Sound.yeongsan('grass');
  if(s.phase==='warn'&&moving)s.lastMove=s.tick;
  if(s.phase==='alert'){
    s.age++;
    if(moving&&d<MG.salg_risk_distance){s.lastMove=s.tick;if(s.age>MG.salg_grace)s.risk++;}
    else if(!moving){
      if(!s.relief&&s.lastMove&&s.tick-s.lastMove<=MG.salg_relief_frames){s.relief=true;Rg.salgSay('relief');Sound.yeongsan('relief');}
      s.risk=Math.max(0,s.risk-MG.salg_recovery);
    }
    if(s.risk>=MG.salg_risk_limit){s.startle=MG.salg_startle_frames;s.x=Math.min(s.home+MG.salg_max_retreat,s.x+MG.salg_retreat);s.risk=0;s.arrived=false;
      learn('salgeumi:alert');Rg.salgSay('scare');Sound.yeongsan('scare');return;}
  }
  if(--s.timer>0)return;
  if(s.phase==='graze'){s.phase='warn';s.timer=MG.salg_warning_frames;Rg.salgSay('cue');Sound.yeongsan('cue');}
  else if(s.phase==='warn'){s.phase='alert';s.timer=MG.salg_alert_frames;s.age=0;s.risk=0;s.relief=false;}
  else {s.phase='graze';s.timer=d<MG.salg_near_distance?MG.salg_near_graze+Math.floor(Math.random()*MG.salg_near_random):MG.salg_graze;s.risk=0;}
}
Rg.maxX=()=>!G.f.seolpi?SNOW_X-6:!G.f.shortcut?SLOPE_X-12:!G.f.sangunMet?BOSS_AT-30:2330;
Rg.step=()=>{
  Rg.arcsEnabled();
  stepSalg();
  Rg.craneTick?.();   // 결정 D-1085: 두루미 곁 세 번째 부름 버티기 (story.js)
  if(!G.boss.dead&&G.f.sangunMet&&G.px>BOSS_AT&&encounterReady())Rg.startGangcheol();   // 결정 D-719
  if(has('doerim_yak')&&!G.f.yakDone){G.f.yakDone=true;Rg.offerReturnPrep();}
};
Rg.onHit=()=>{};
Rg.faint=()=>{G.px=Math.max(60,G.px-90);think('눈보라에 밀려났다…');};
Rg.onPickup=a=>{if(a.item==='legend_fruit'&&!G.f.fruitGot){G.f.fruitGot=true;Rg.fruitFound();}
  // 결정 D-1186: 옛 구성의 아빠 곁 짚신
  if(a.item==='jipsin'&&CLASSIC&&!G.f.yJipsin){G.f.yJipsin=true;think('아빠 곁에 새 짚신 한 켤레. 넋이 빠져도\n손은 길 떠날 신을 삼았구나.');}};
/* 이기든 달래든 호수의 얼음이 풀리고 봄이 온다. 신목에 전설의 열매가 열린다 */
Rg.bringSpring=()=>{
  G.boss.dead=true;G.f.spring=true;
  G.pickups.push({x:TREE_X,y:150,item:'legend_fruit',got:false});
  diary('y_spring','붉은 천이 풀리고 신목이 제 이름을 되찾자 호수의 얼음이 풀렸다. 느티나무에 새잎이 돋고 산자락에 진달래가 폈다. 신목 가지에 무언가 열렸다.');
  think('봄이 왔다! 신목에 열매가 열렸어!');refreshGoal();
};
Rg.SLOPE_X=SLOPE_X;Rg.TREE_X=TREE_X;

/* ---------- PA-43: 침묵을 지나 봄으로. 구역 API만 쓰는 지역 확장 ---------- */
if(!CLASSIC){
  Rg.startZone='shelter';
  // 결정 D-109: 빈 걷기 구간 줄이기 (engine/core.js trimRegion). [시작, 지울 길이] — 설계 좌표.
  // 산막: 능선 문(1860) 뒤 빈 발판. 눈길: 들어선 자리와 까마귀 사이, 능선 문 뒤. 신목 섬: 얼음길 1760px → 560px.
  Rg.trimCutsV1={shelter:[[1960,480]],snow:[[300,400],[2230,330]],island:[[300,1200]]};   // 첫 판(D-109) — 옛 저장을 옮길 때 쓴다
  // 결정 D-116: 비탈 앞 빈 눈밭(500~830)과 빈 능선 발판 무리(1720~2030), 섬 선착장과 신목 사이(1560~1820)를 지운다.
  Rg.trimCutsV2={shelter:[[1960,480]],snow:[[300,400],[2230,330]],slope:[[500,330],[1720,310]],island:[[300,1200],[1560,260]]};   // 둘째 판(D-116) — 옛 저장을 옮길 때 쓴다
  // 결정 D-128: 걷기만 하는 길을 콘텐츠 사이 230px 안팎으로. 산막 짚과 곰 자장가 사이, 비탈 호숫가 문 뒤 출구 앞, 호숫가 떠날 자리 뒤 출구 앞.
  Rg.trimCutsV3=Rg.trimCutsV4=Rg.trimCutsV5=Rg.trimCutsV6=Rg.trimCutsV7={shelter:[[450,80],[1960,480]],snow:[[300,400],[2230,330]],slope:[[500,330],[1720,310],[2430,50]],shore:[[2430,50]],island:[[300,1200],[1560,260]]};   // 셋째 판(D-128) — 옛 저장을 옮길 때 쓴다
  // 결정 D-1229 (사용자 지시 2026-11-07 4스테이지 26): 얼어붙은 비탈에 들어서서 낚시하는 수달(1250)까지 가는 길을 반으로 (850px → 450px).
  //   비탈 앞 눈밭 자르기(500~830)를 들어선 자리 바로 뒤(100~830)까지 넓힌다. 그 사이의 마가목 밑 살펴보기는 뺐고(D-1224) 마가목 하나는 1000으로 옮겼다.
  Rg.trimCuts={...Rg.trimCutsV7,slope:[[100,730],[1720,310],[2430,50]]};
  const isl=x=>trimX(x,Rg.trimCuts.island);
  const slp=x=>trimX(x,Rg.trimCuts.slope);
  // 강철이는 섬에, 살금이(자리·돌아갈 자리)는 비탈에 있다 (D-116)
  Rg.trimStateHook=s=>{if(s.boss)s.boss.x=isl(s.boss.x);if(s.salg){s.salg.x=slp(s.salg.x);s.salg.home=slp(s.salg.home);}};
  Rg.trimMigrateHook=(g,_,conv)=>{
    if(g.boss)g.boss.x=conv?conv('island',g.boss.x):isl(g.boss.x);
    if(g.salg&&conv){g.salg.x=conv('slope',g.salg.x);g.salg.home=conv('slope',g.salg.home);}
    // 결정 D-1229: 잘린 눈밭에 있던 마가목은 잘린 자리 끝에 모이지 않고 새 자리(설계 1000)로 간다
    const rowan=(g.pickups||[]).find(p=>p.id==='slope_rowan_0'&&!p.got);if(rowan)rowan.x=slp(1000);
  };
  const a=()=>Rg.expArt;
  const snowGate=()=>!!G.f.seolpi;
  // 결정 D-1250: 디딤돌 길은 살금이가 알려 줬거나(shortcut), 예전 판에서 이미 호숫가에 내려가 본 저장이면 열려 있다(옛 저장이 막히지 않게)
  const ledgeOpen=Rg.ledgeOpen=()=>!!G?.f?.shortcut||!!G?.visitedZones?.yeongsan?.shore;
  const snowReason='눈이 허리까지 찬다. 길손 움막의 날쌘에게 설피를 엮어 달라고 하자.';   // 결정 D-1223: 산막 → 길손 움막
  // 결정 D-1226 (사용자 지시 2026-11-07 4스테이지 28): 살금이를 돕기 전에는 호숫가로 가는 길을 못 찾는다. 수리부엉이·수달로 넘던 길도 뺐다.
  //   살금이가 비탈 끝 바위턱의 눈 밑 디딤돌을 알려 줘야(G.f.shortcut) 열린다.
  // 결정 D-1250: 막힘 말은 비탈 끝 낭떠러지 앞에서 한다. 디딤돌 문이 열린 뒤에는 그 문으로 이끈다
  const cliffBefore='얼음 낭떠러지다. 호숫가로 내려갈 길을 못 찾겠다.\n이 산 짐승들은 어디로 다닐까?';
  const cliffAfter='낭떠러지다. 살금이가 눈을 털어 둔 디딤돌로 내려가자.';
  // 결정 D-1225 (사용자 지시 2026-11-07 4스테이지 21): 문·경치 자리에 꽂던 팻말(뜻 없는 표지판)은 뺐다. 돌턱·밧줄 같은 자리 그림이 길을 보인다
  // 결정 D-1125: 호숫가에서 비탈로 오르는 바위턱 오솔길. 디딤돌 셋과 위 바위에 매어 늘어뜨린 밧줄
  const climbRope=(x,y)=>{
    x=Math.round(x);
    for(let i=0;i<3;i++){R(x-14+i*9,y-6-i*9,14,6+i*9,'#4a5560');R(x-14+i*9,y-7-i*9,14,2,'#e6edf1');}
    R(x+8,y-38,16,12,'#38424c');R(x+8,y-39,16,2,'#f4f7fa');
    R(x+12,y-36,2,2,'#7a6450');for(let k=0;k<30;k++)R(x+12-Math.round(Math.sin(k/9)*2),y-34+k,1,1,'#b89a68');
  };
  const stepCommon=()=>{
    Rg.arcsEnabled();
    if(has('doerim_yak')&&!G.f.yakDone){G.f.yakDone=true;Rg.offerReturnPrep();}
  };
  // 전환 전 화면은 한 장만 보관한다. 구역 코드가 바뀌거나 새 게임이면 버린다.
  const image=document.createElement('canvas');image.width=W;image.height=H;
  const imageCtx=image.getContext('2d');
  let lastZone=null,lastOwner=null,zoom=0,zoomOut=false;
  const order=['shelter','snow','slope','shore','island'];
  function back(id){
    if(lastOwner!==G){lastOwner=G;lastZone=id;zoom=0;}
    if(lastZone!==id){
      imageCtx.drawImage(cv,0,0);zoom=Vfx.reducedMotion?0:TABLES.TUNING.zone_transition_frames;
      zoomOut=order.indexOf(id)<order.indexOf(lastZone);lastZone=id;
    }
    a().back(id);
  }
  /* 결정 D-1061 (사용자 피드백 2026-11-06 27: 더 어둡고 눈이 많이 내리게): 엔진 눈 입자는 드문드문이라, 영산 겨울에는
     먼 눈발(작고 느림)과 가까운 눈발(크고 빠름) 두 켜를 더 뿌린다. 바람이 세졌다 잦아들어 비스듬함이 바뀐다.
     자리는 시간으로 정해 입자를 따로 모으지 않는다. 그 아래에 밤빛을 한 겹 덮어 어둡게 한다. 동작 줄이기면 멈춘 눈 몇 점만 남긴다. */
  function blizzard(){
    ctx.fillStyle='rgba(6,10,26,.2)';ctx.fillRect(0,0,W,H);
    // 결정 D-1120: 눈발이 방향을 자꾸 뒤집어 어지럽던 것을 고쳤다 (사용자 지시 2026-11-07 4스테이지 1).
    //   전에는 자리를 '시간 × 지금 바람 세기'로 셌다. 오래 머물수록 바람이 조금만 바뀌어도 눈송이가 크게 앞뒤로 튀었다.
    //   이제 바람 세기를 시간으로 쌓은 값(drift)으로 옮긴다. 눈은 늘 왼쪽으로 비스듬히 흐르고, 세기만 천천히 조금 바뀐다(0.45~0.95).
    const t=Vfx.reducedMotion?0:G.anim,n=Vfx.reducedMotion?40:160;
    const drift=.7*t-(.18/.0025)*Math.cos(t*.0025)-(.07/.0071)*Math.cos(t*.0071);
    for(let i=0;i<n;i++){
      const near=i%4===0,sp=near?1.25:.5+hash(i*.37)*.3,vx=-(near?.95:.45),span=W+20;
      const x=(((hash(i*1.91)*W*1.5+drift*vx*sp-cam*(near?.25:.08))%span)+span)%span-10;
      const y=(((hash(i*3.77)*H+t*sp)%(H+10))+(H+10))%(H+10)-5,wob=Math.round(Math.sin(t*.02+i));
      if(near)R(Math.round(x+wob),Math.round(y),2,2,'rgba(238,243,248,.9)');
      else R(Math.round(x+wob),Math.round(y),1,1,i%3?'rgba(200,212,226,.7)':'rgba(236,241,247,.85)');
    }
  }
  function front(){
    // 결정 D-429: 이름 잃은 마을은 영산의 다른 길보다 빛이 더 바랬다. 이름이 돌아오면(봄) 색도 돌아온다.
    if(G.zone==='shore'&&!Rg.namesBack()){
      ctx.save();ctx.globalCompositeOperation='saturation';ctx.globalAlpha=.45;ctx.fillStyle='#808080';ctx.fillRect(0,0,W,H);ctx.restore();
    }
    if(!G.f.spring)blizzard();
    Rg.craneHoldDraw?.();   // 결정 D-1085: 셋째 부름의 붉은 붓 획 (story.js)
    if(G.f.spring)a().willowSeeds();
    if(Vfx.reducedMotion){zoom=0;return;}
    if(!zoom)return;
    const t=1-zoom/TABLES.TUNING.zone_transition_frames;
    const scale=1+(zoomOut?-.16:.16)*t;
    ctx.save();ctx.globalAlpha=(1-t)*.65;ctx.translate(W/2,H/2);ctx.scale(scale,scale);
    ctx.drawImage(image,-W/2,-H/2);ctx.restore();zoom--;
  }
  function platforms(id){
    // 땅 → 중간 발판 → 높은 턱. 놓쳐도 같은 눈밭에 내려선다.
    // 결정 D-48: 첫 무리는 stepRidge()로 오르락내리락. 능선(108) 문·경치 발판은 그대로다.
    const p=[...stepRidge(930,81,4,{low:150,high:108,rise:36}),
      {x:1480,y:150,w:94},{x:1570,y:108,w:110},{x:1680,y:108,w:160},
      {x:1980,y:150,w:90},{x:2070,y:108,w:112}];
    if(id==='snow')p.push({x:1840,y:108,w:210});
    if(id==='shore')p.push({x:1910,y:150,w:100},{x:2000,y:108,w:110});
    if(id==='island')p.push({x:2180,y:150,w:112});
    if(id==='slope')p.push({x:835,y:150,w:130},{x:1200,y:150,w:130});
    return p;
  }
  const content=(id,kind)=>{
    const list=Rg.expContent?.[kind]?.[id]||[];
    return id==='shore'&&kind==='wanderers'&&Rg.replyCourierHere?.()?list.filter(n=>n.id!=='y_magpie_farewell'):list;
  };
  function zone(id,npcs,exits,doors=[]){return {
    w:2600,startX:70,ground:GROUND,npcs,platforms:platforms(id),exits,doors,
    drawBack:()=>back(id),drawScenery:()=>{
      a().scenery(id);
      if(id==='shore')a().village();   // 결정 D-429: 호숫가 마을 (장승·초가·우물·빨랫줄)
      fieldItems('pickups').filter(p=>p.item==='magamok').forEach(p=>drawRowan(p.x));
      if(id==='island')drawCoil();
      if(id==='shore'){
        const x=2360-cam;
        R(x,GROUND,240,H-GROUND,G.f.spring?'#739cae':'#c4dce8');
        if(!G.f.spring)for(let i=0;i<6;i++){
          R(x+i*42,GROUND+3,28,1,'#edf5f6');R(x+14+i*42,GROUND+8,2,10,'#91b1c7');
        }
        else for(let i=0;i<8;i++)R(x+i*32,GROUND+7+i%3*5,16,1,'#c6e1e7');
      }
    },
    drawPickup:Rg.drawPickup,drawDig:Rg.drawDig,onPickup:Rg.onPickup,
    onHit:Rg.onHit,faint:Rg.faint,
    weather:Rg.weather,surface:()=>G.f.spring?'':'snow',weatherFront:front,ambient:()=>{Rg.clearRouteScenes();Rg.placeRouteSupplies();},
    step:stepCommon,
    get examines(){return content(id,'examines');},
    get wanderers(){return content(id,'wanderers');},
    get stamps(){return content(id,'stamps');},
  };}
  // 결정 D-429: 산막·눈길에서 호숫가로 곧장 옮겨 주던 능선 문 둘(과 호숫가 쪽 짝 문)은 뺐다 (사용자 지시 2026-11-03: 순간이동 기믹 빼기).
  // 호숫가는 산막 → 눈길 → 비탈 → 호숫가로 걸어서 닿고, 같은 길로 돌아 나온다. 길 막힘 순서(설피·지름길·강철이)는 그대로다.
  Rg.zones={
    // 깊은 눈길은 몸의 문제라 산양이 지난다 (PA-47). 얼어붙은 비탈은 길을 아는 살금이만 열어 준다 (D-1226).
    // 결정 D-1300 (사용자 지시 2026-11-08 39): 영산 어귀 가운데(1500)의 '눈 굴 입구' 문과 굴 그림은 뺐다. 깊은 눈길로는 오른쪽 끝 길 하나로만 간다
    shelter:zone('shelter',['nal'],{right:{to:'snow',need:snowGate,reason:snowReason,drawBlocked:(x,y)=>a().blockedSnow(x,y),formPass:'goat',formLabel:'산양으로 눈 덮인 바위턱 디뎌 건너기'}}),
    snow:zone('snow',['ongdal'],{left:'shelter',right:'slope'}),
    // 결정 D-1250 (사용자 지시 2026-11-08 32: 살금이 일 전에는 다음 맵으로 가는 길이 없다. 지름길이 열린 뒤에도 지름길로만 간다):
    //   비탈 오른쪽 끝은 얼음 낭떠러지라 걸어서는 끝내 못 나간다(가장자리 출구는 늘 닫힘. 지도 줄기를 잇는 자리로만 남긴다).
    //   호숫가로 내려가는 디딤돌 문은 살금이가 알려 준 뒤에야 생긴다(ledgeOpen). 그 전에는 문도 그림도 없다.
    slope:zone('slope',['salgeumi'],{left:'snow',right:{to:'shore',need:()=>false,get reason(){return ledgeOpen()?cliffAfter:cliffBefore;}}},[   // 낭떠러지 그림은 art.js 비탈 풍경
      {x:2500,to:'shore',toX:170,label:'눈 털린 디딤돌 밟고 호숫가로 내려가기',need:ledgeOpen},
    ]),
    // 결정 D-1250: 호숫가에서 비탈로 오르는 길도 같은 디딤돌 바위턱(밧줄 문) 하나뿐이다. 왼쪽 끝은 바위 벽이다.
    shore:zone('shore',['dad'],{left:{to:'slope',need:()=>false,reason:'바위 벽이다. 내려온 디딤돌 바위턱으로 올라가자.'}},[
      {x:2320,to:'island',toX:160,get label(){return G.f.spring?'작은 배로 신목 섬에':'언 호수를 걸어 신목 섬에';},
        need:()=>!!G.f.dadDone,reason:'아빠가 기다리고 있다. 먼저 호숫가에서 말을 걸어 보자.'},
      // 결정 D-1125 (사용자 지시 2026-11-07 4스테이지 9): 호숫가에서 비탈로 되돌아갈 단추가 없었다(왼쪽 끝으로 걸어 나가야만 했다).
      //   내려온 자리 왼쪽(마을 장승 앞)에 바위턱 오솔길과 매어 둔 밧줄을 두고, 문으로 언제든 비탈(내려온 바위턱 앞)로 오른다.
      {x:55,to:'slope',toX:2500,label:'디딤돌 밟고 바위턱 올라 비탈로',draw:(x,y)=>climbRope(x,y)},
    ]),
    island:zone('island',['durumi'],{},[   // 결정 D-1081: 산군 대신 두루미
      {x:160,to:'shore',toX:2320,get label(){return G.f.spring?'배를 타고 호숫가로':'얼음길로 호숫가에 돌아가기';}},
    ]),
  };
  {const list=Rg.zones.slope.doors;Object.defineProperty(Rg.zones.slope,'doors',{configurable:true,enumerable:true,get(){return ledgeOpen()?list:[];}});}   // 결정 D-1250
  /* 결정 D-1062 (사용자 피드백 2026-11-06 27: 더 험한 지형): 빈 눈밭에 바람이 쌓은 눈 둔덕(엔진 비탈 D-845)을 둔다.
     좌표는 길을 줄인 뒤의 자리이고, 인물·물건·문·살펴보기가 없는 구간에만 둔다. 기울기는 미끄러지는 비탈(field_slope_slip_grade)보다 완만하다.
     산막: 어귀 가운데 높은 능선 밑. 눈길: 옹달 할미 샘과 대추나무 사이(능선 발판 밑). */
  const mound=pts=>pts.slice(1).map((p,i)=>({x1:pts[i][0],y1:pts[i][1],x2:p[0],y2:p[1]}));
  Rg.zones.shelter.slopes=mound([[1600,GROUND],[1650,180],[1710,176],[1760,182],[1810,GROUND]]);
  Rg.zones.snow.slopes=mound([[1110,GROUND],[1170,178],[1230,172],[1300,180],[1370,168],[1450,GROUND]]);
  Rg.zones.snow.step=()=>{
    stepCommon();
    if(G.f.seolpi)G.f.ySnowTrail=Math.max(G.f.ySnowTrail||180,Math.round(G.px));
  };
  // 결정 D-1250: 낭떠러지 바위턱 끝(설계 2530)에서 더 못 간다. 밀면 한 번 속말을 한다
  Rg.zones.slope.maxX=()=>2530;
  let cliffPush=false;
  Rg.zones.slope.step=()=>{stepCommon();stepSalg();
    const at=G.px>=Rg.zones.slope.maxX()-1&&isRight();
    if(at&&!cliffPush&&$('dlg').hidden)think(Rg.zones.slope.exits.right.reason);
    cliffPush=at;};
  // PA-47 선택 자리: 다람쥐의 잊은 몫(결정 D-1021: 다른 다람쥐가 묻은 것이고 도토리만이 아니다. 산막 둘레 잣나무 밑엔 잣)
  // 결정 D-1073: 고라니만 듣던 눈 속 짚단 대신 수달만 잠수하는 얼음 구멍 둘(비탈). 얼음 밑에 가라앉은 것을 건진다
  Rg.zones.slope.digs=[{id:'y_dive_fish',x:1100,item:'bingeo',n:2,form:'otter',cache:true,done:false,line:'얼음 구멍에 쏙 들어갔다 나왔다. 빙어 두 마리를 물고 나왔다!'},
    {id:'y_dive_jip',x:1640,item:'jip',n:1,form:'otter',cache:true,done:false,line:'얼음 밑에 짚단이 걸려 있었다. 가을에 누가 떨어뜨렸나 보다.'}];
  Rg.zones.shelter.digs=[{id:'y_cache_shelter',x:655,item:'jat',n:2,form:'squirrel',cache:true,done:false}];
  Rg.zones.snow.digs=[{id:'y_cache_snow',x:1260,item:'solbang',n:2,form:'squirrel',cache:true,done:false}];
  /* 결정 D-265: 길섶 채집물을 더한다 (사용자 피드백 2026-11-02). 눈 덮인 마가목 열매(줍는 자리마다 마가목이 선다), 덤불의 다래 덩굴,
     소나무 밑 솔방울, 높은 바위턱의 잣송이. 살금이 둘레(비탈 900~1350)는 비워 둔다. 좌표는 길을 줄인 뒤의 자리. */
  /* 결정 D-391 (사용자 피드백 2026-11-03: 너무 많고 다양하지 않다): 구역마다 둘셋. 산막 둘레는 덤불 덩굴과 장작 곁 솔방울,
     눈길은 마가목·잣송이·솔방울, 비탈은 덤불과 마가목, 호숫가는 덤불과 바위턱 잣송이. 마가목은 비탈의 마가목 나무(구역에 이미 있는 다섯)에서 주로 딴다. */
  addZoneGather(Rg,'y_g_',[
    ['shelter','d',1110,'darae_vine'],['shelter','p',1560,'solbang'],
    ['snow','p',420,'magamok'],['snow','p',960,'solbang'],['snow','p',1430,'jat',{y:108}],   // 결정 D-1103: 도장(1380)과 간격
    // 결정 D-1230 (사용자 지시 2026-11-07 4스테이지 24): 언 물길(480, D-1224로 뺐다) 뒤로 오르는 눈 언덕 꼭대기 턱(625~707, 높이 110)에 잣송이 하나
    ['snow','p',666,'jat',{y:110}],
    ['slope','d',1160,'darae_vine'],['slope','p',1400,'magamok'],   // 결정 D-1229: 비탈을 400 더 줄여 같은 설계 자리(2200·2490)를 줄인 좌표로 옮겼다
    // 결정 D-429: 호숫가 덤불은 마을 집 앞(1440)에서 끝 바위 쪽 마른 둑(2040)으로 옮겼다
    ['shore','d',2040,'darae_vine'],['shore','p',1610,'jat',{y:108}],
  ]);
  // 결정 D-665: 수리부엉이만 느끼는 숨은 물건 (사용자 피드백 2026-11-05). 수리부엉이로 곁을 지나면 드러난다. 좌표는 길을 줄인 뒤의 자리
  addZoneGather(Rg,'y_owl_',[['snow','p',1540,'jujube',{hidden:'owl'}],['shore','p',990,'jat',{hidden:'owl'}]]);
  // 결정 D-429: 이름 잃은 마을의 겨울엔 바람 소리만 남는다 (따로 소리 자산을 두지 않고 경치 보기의 바람 소리를 쓴다).
  // 마을을 벗어나거나 봄이 오면 끈다. 경치 보기는 제 소리를 쓰므로 그동안은 건드리지 않는다.
  let villageWind=false;
  setInterval(()=>{
    if(typeof Sound==='undefined')return;
    const want=typeof G!=='undefined'&&!!G&&G.started&&!G.ended&&G.region==='yeongsan'&&G.zone==='shore'&&!Rg.namesBack()&&!vistaMode&&!(typeof B!=='undefined'&&B);
    if(want&&Sound.ambient!=='wind'){Sound.ambience('wind');villageWind=true;}
    else if(!want&&villageWind){villageWind=false;if(!vistaMode&&Sound.ambient==='wind')Sound.ambience(null);}
  },400);
  // 겨울에는 오른쪽 얼음길로 걸어 나간다. 봄에는 같은 길이 물에 잠겨 배로만 건넌다.
  Rg.zones.shore.exits.right={to:'island',toX:160,
    need:()=>!G.f.spring&&!!G.f.dadDone,
    reason:'아빠를 먼저 만나자.'};
  Rg.zones.shore.maxX=()=>G.f.spring?2340:2584;
  Rg.zones.island.exits.left={to:'shore',toX:2584,need:()=>!G.f.spring,
    reason:'얼음길이 물에 잠겼다. 오른쪽 선착장에서 배를 타자.'};
  // 결정 D-1126 (사용자 지시 2026-11-07 4스테이지 13): 아빠를 만날 때는 무엇으로 변해 있었든 본모습(너구리)으로 돌아온다.
  //   아빠 곁(y_dad_revert_range 안)에 들어서면 저절로 풀린다. 말을 걸 때 '낯선 손님' 대접도 생기지 않는다.
  const dadRevert=()=>{
    if(!G.form||paused())return;
    const d=fieldNpcs().find(n=>n.id==='dad');
    if(d&&Math.abs(d.x-G.px)<TABLES.TUNING.y_dad_revert_range)setForm('',{force:true});
  };
  Rg.zones.shore.step=()=>{stepCommon();dadRevert();};
  Rg.zones.island.step=()=>{
    stepCommon();dadRevert();
    Rg.craneTick?.();   // 결정 D-1085: 두루미 곁 세 번째 부름 버티기 (story.js)
    if(!G.boss.dead&&G.f.sangunMet&&G.px>isl(BOSS_AT)&&encounterReady())Rg.startGangcheol();
  };
  Rg.zones.island.maxX=()=>G.f.sangunMet?2584:BOSS_AT-30;   // trimRegion이 이 값도 섬 좌표로 옮긴다
  // 겨울에는 얼음길, 봄에는 배로 같은 선착장을 잇는다.
  // 호수는 이동 문 너머에 두므로 해빙 뒤 물 위를 걷지 않는다.
  const oldSpring=Rg.bringSpring;
  Rg.bringSpring=()=>{
    // 겨울에 먼저 바라봤어도 해빙 뒤의 혼잣말은 한 번 새로 들려준다.
    if(G.f.vistasSeen)delete G.f.vistasSeen['yeongsan:spring_tree'];
    oldSpring();
    const fruit=G.pickups[G.pickups.length-1];fruit.id='island_legend_fruit';fruit.zone='island';fruit.x=isl(fruit.x);
    diary('y_boat','얼음이 녹자 걸어서 건너온 얼음길이 물에 잠겼다. 호숫가로 돌아가려면 이제 배가 있어야 한다.');
  };
  Rg.zones.snow.vistas=[{id:'snow_ridge',x:1600,y:108,from:0,to:640,sound:'wind',
    thought:'와, 저기서 여기까지 왔네.\n엄마도 저 불빛 너머에 있겠지.',diary:'눈길 능선에서 지나온 고을의 불빛을 보았다. 산 안쪽으로 이어지는 바위턱도 보인다.',
    get layers(){return a().ridgeLayers;}}];
  Rg.zones.island.vistas=[{id:'spring_tree',x:2430,from:0,to:640,sound:'water',
    get thought(){return G.f.spring?'새잎이다. 물도 흐르네.\n엄마랑 같이 보고 싶다.':'나뭇가지 끝이 통통하네.\n저 안에 잎이 있나?';},
    diary:'금줄 두른 늙은 느티나무 곁에서 호수를 보았다. 겨울눈 안에 새잎이 숨어 있었다.',
    get layers(){return G.f.spring?a().springLayers:a().winterLayers||a().ridgeLayers;}}];
}
})();
