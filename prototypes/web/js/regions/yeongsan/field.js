'use strict';
/* 북쪽 영산 필드: 남색 밤하늘의 늦겨울 → 강철이를 넘기면 연분홍 첫봄.
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

/* ---------- 배경 ---------- */
function ridge(par,col,base,amp,freq){ctx.fillStyle=col;for(let x=0;x<W;x+=2){const wx=x+cam*par;const h=base-Math.abs(Math.sin(wx*freq))*amp-Math.sin(wx*freq*2.2+1)*amp*0.3;ctx.fillRect(x,Math.round(h),2,H-Math.round(h));}}
function drawSky(){
  const g=ctx.createLinearGradient(0,0,0,H);
  if(spring()){g.addColorStop(0,'#f6d8e2');g.addColorStop(.6,'#f0c0cc');g.addColorStop(1,'#e8a8b8');}
  else{g.addColorStop(0,'#1a2244');g.addColorStop(.6,'#2c3866');g.addColorStop(1,'#46508a');}
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  if(!spring())for(let i=0;i<46;i++){const x=Math.round((hash(i*5.7)*W*1.3-cam*0.02)%W+W)%W,y=Math.round(hash(i*2.9)*100);R(x,y,1,1,i%6?'#d8e0f8':'#fff6d8');}
  else{const sx=Math.round(300-cam*0.03);R(sx,28,16,16,'#fff8f0');R(sx-2,32,20,8,'#fff8f0');}
  ridge(0.1,spring()?'#d8a0b4':'#3a4472',112,40,0.005);
  ridge(0.22,spring()?'#c88aa0':'#4a5484',134,26,0.010);
  ridge(0.22,'rgba(255,255,255,.5)',112,40,0.005);   // 눈 쌓인 봉우리 빛
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
function drawRowan(wx){const x=wx-cam;if(x<-40||x>W+40)return;
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
  R(tx-26,GROUND-10,52,4,'#d9c48d');for(let i=0;i<5;i++)R(tx-20+i*10,GROUND-8,2,6,'#f4efe4');   // 금줄
  if(spring()){const blos=[[-60,-170,52,26],[-20,-188,60,30],[20,-168,58,26],[-46,-140,40,18],[14,-142,48,18]];for(const b of blos){R(tx+b[0],GROUND+b[1],b[2],b[3],'#f4a8c0');R(tx+b[0]+6,GROUND+b[1]+4,b[2]-12,4,'#fcd0de');}}
  else{R(tx-30,GROUND-112,24,1,'#ffffff');R(tx+6,GROUND-120,30,1,'#ffffff');}
}
/* 강철이: 신목이 있는 섬을 휘감고 겨울을 놓지 않는다 (필드에서는 잠든 듯 똬리) */
function drawCoil(){if(G.boss.dead)return;const x=G.boss.x-cam;if(x<-120||x>W+120)return;const b=Math.floor(G.anim/20)%2;
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;R(x+Math.cos(a)*70+40,GROUND-18-Math.sin(a)*10-b,22,10,'#7a8ca8');R(x+Math.cos(a)*70+42,GROUND-18-Math.sin(a)*10-b,18,2,'#b8c8dc');}
  R(x-38,GROUND-34-b,22,14,'#6a7c98');R(x-34,GROUND-30-b,4,3,'#e8f2fa');R(x-26,GROUND-30-b,4,3,'#e8f2fa');R(x-40,GROUND-26-b,8,1,'#e8f2fa');R(x-44,GROUND-24-b,6,1,'#e8f2fa');
}
Rg.drawBack=()=>{drawSky();drawGround();};
Rg.drawScenery=()=>{[1000,1140,1280,1360].forEach(drawRowan);drawDrift();drawSlope();drawLake();drawCoil();};
Rg.drawPickup=(a,x,bob)=>{
  if(a.item==='magamok'){R(x-1,a.y-9,1,3,'#5a4030');R(x-3,a.y-6+bob,3,3,'#d0302a');R(x+1,a.y-6+bob,3,3,'#e0402a');R(x-1,a.y-3+bob,3,3,'#c02a22');R(x-3,a.y-7,7,1,'#f4f7fa');}
  else if(a.item==='jip'){R(x-5,a.y-8,10,8,'#d9b860');R(x-5,a.y-8,10,1,'#f4f7fa');R(x-1,a.y-8,2,8,'#a8883a');}
  else if(a.item==='legend_fruit'){const gl=Math.floor(G.anim/8)%2;R(x-4,a.y-9+bob,8,8,'#f0a0b8');R(x-2,a.y-8+bob,3,3,'#fde0ea');R(x-1,a.y-12,2,3,'#6b4423');if(gl){R(x-7,a.y-12,1,1,'#fff6d8');R(x+6,a.y-6,1,1,'#fff6d8');}}
};
Rg.drawDig=(d,x)=>{if(d.item!=='darae_vine')return false;
  if(d.done){R(x-8,GROUND-3,16,3,'#8a8a7a');return true;}
  R(x-10,GROUND-12,20,12,'#eef2f8');R(x-8,GROUND-16,16,6,'#6b5a3a');R(x-6,GROUND-18,4,2,'#7fa860');R(x+2,GROUND-15,5,2,'#7a6a42');R(x-10,GROUND-12,20,2,'#ffffff');
  if(Math.floor((G.anim+d.x)/14)%3===0)R(x+3,GROUND-20,1,1,'#fff3b0');return true;};

/* 눈 / 봄 꽃잎 */
const fall=Array.from({length:34},(_,i)=>({x:Math.random()*W,y:Math.random()*H,s:0.25+Math.random()*0.4,p:Math.random()*6}));
Rg.ambient=()=>{if(Rg.stepDadPose)Rg.stepDadPose();for(const l of fall){l.y+=l.s;l.p+=0.025;l.x+=Math.sin(l.p)*0.35-(spring()?0.2:0.05);if(l.y>H){l.y=-3;l.x=Math.random()*W;}if(l.x<-3)l.x=W+2;}};
Rg.drawFront=()=>{for(const l of fall)R(l.x,l.y,2,Math.sin(l.p)>0?2:1,spring()?(l.p%2<1?'#f4a8c0':'#fcd0de'):'#ffffff');
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
  if(s.x>s.home)s.x=Math.max(s.home,s.x-MG.salg_return_speed);
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
  if(!G.boss.dead&&G.f.sangunMet&&G.px>BOSS_AT)Rg.startGangcheol();
  if(has('doerim_yak')&&!G.f.yakDone)Rg.goHome();
};
Rg.onHit=()=>{};
Rg.faint=()=>{G.px=Math.max(60,G.px-90);toast('눈보라에 밀려 물러났다');};
Rg.onPickup=a=>{if(a.item==='legend_fruit'&&!G.f.fruitGot){G.f.fruitGot=true;Rg.fruitFound();}};
/* 이기든 달래든 호수의 얼음이 풀리고 봄이 온다. 신목에 전설의 열매가 열린다 */
Rg.bringSpring=()=>{
  G.boss.dead=true;G.f.spring=true;
  G.pickups.push({x:TREE_X,y:150,item:'legend_fruit',got:false});
  diary('y_spring','강철이가 떠나자 호수의 얼음이 풀렸다. 산에 봄이 왔다. 신목 가지에 무언가 열렸다.');
  toast('봄이 왔다! 신목에 열매가 열렸다');refreshGoal();
};
Rg.SLOPE_X=SLOPE_X;Rg.TREE_X=TREE_X;
})();
