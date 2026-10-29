'use strict';
/* 큰 장터 필드: 설 대목 장터(낮/밤), 붉은 등불, 떡집, 보부상 숙소, 창고, 뒷산 소나무 숲, 눈.
   숙소 마루에서 쉬면 낮과 밤이 바뀐다 (부엉 영감은 밤에만 깨어 있다) */
(()=>{
const Rg=REGIONS.jangteo;
const INN_X0=1010,INN_X1=1270;     // 보부상 숙소
const STORE_X=1500;                // 숙소 창고 (그믐 밤에 헌물 도깨비가 나타난다)
const FOREST_X=1640;               // 뒷산 소나무 숲
const night=()=>G.f.night;

/* ---------- 배경 ---------- */
function ridge(par,col,base,amp,freq){ctx.fillStyle=col;for(let x=0;x<W;x+=2){const wx=x+cam*par;const h=base-Math.sin(wx*freq)*amp-Math.sin(wx*freq*2.7+1)*amp*0.35;ctx.fillRect(x,Math.round(h),2,H-Math.round(h));}}
function drawSky(){
  const g=ctx.createLinearGradient(0,0,0,H);
  if(night()){g.addColorStop(0,'#141a2e');g.addColorStop(.6,'#262c48');g.addColorStop(1,'#3a3a54');}
  else{g.addColorStop(0,'#dfe4ea');g.addColorStop(.6,'#c4ccd6');g.addColorStop(1,'#aeb6c2');}
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  if(night()){for(let i=0;i<40;i++){const x=Math.round((hash(i*9.1)*W*1.4-cam*0.02)%W+W)%W,y=Math.round(hash(i*3.3)*90);R(x,y,1,1,i%5?'#c8d0e8':'#fff6d8');}
    R(Math.round(70-cam*0.02),24,2,10,'#e8e0c0');}   // 그믐 전 가는 달
  else{const sx=Math.round(320-cam*0.03);R(sx,30,14,14,'#f8f6ee');R(sx-2,33,18,8,'#f8f6ee');}
  ridge(0.12,night()?'#1e2238':'#9aa4b2',120,28,0.007);
  ridge(0.25,night()?'#262a42':'#868f9c',140,20,0.012);
}
function drawGround(){
  R(0,GROUND,W,H-GROUND,night()?'#3a3a48':'#7a7468');R(0,GROUND,W,3,night()?'#d8dcea':'#f2f4f6');
  const s=Math.floor(cam);
  for(let x=0;x<W;x+=3){const wx=x+s-(s%3);const r=hash(wx+11);
    if(r<0.3)R(x-(s%3),GROUND+2+Math.floor(r*8),2,1,night()?'#c8cce0':'#e8ecf0');
    if(r>0.93)R(x-(s%3),GROUND+7+Math.floor(r*10),3,1,night()?'#2a2a36':'#5a544a');}
}
/* 장터 가게 줄: 처마, 붉은 등불, 낮에는 흰 천막 */
function drawStall(wx,i){const x=wx-cam;if(x<-60||x>W+60)return;
  const roof=['#7a4a2a','#6b4423','#8a5a3a'][i%3];
  R(x,GROUND-30,52,30,night()?'#4a3a30':'#a8825a');R(x,GROUND-30,52,2,'#5a3a22');R(x+4,GROUND-24,44,12,night()?'#2a2018':'#e8dcc0');
  R(x-6,GROUND-40,64,10,roof);R(x-6,GROUND-41,64,2,'#f4f6f8');
  for(let k=0;k<3;k++){const lx=x+6+k*20,ly=GROUND-38;R(lx+3,ly,1,4,'#3a2a1e');R(lx,ly+4,7,8,night()?'#ff9a3a':'#c9452a');R(lx+1,ly+5,5,1,night()?'#ffe0a0':'#e06a4a');
    if(night()){ctx.fillStyle='rgba(255,170,70,.14)';ctx.fillRect(Math.round(lx-5),ly,17,18);}}
  const goods=[['#e0602a','#e8783a'],['#efe8dc','#8a2a22'],['#d9a441','#e6b54a'],['#6f9a4a','#5a8a3a']][i%4];
  for(let k=0;k<4;k++)R(x+8+k*10,GROUND-16,7,4,goods[k%2]);
}
/* 보부상 숙소: 기와 지붕, 마당, 처마 등불 */
function drawInn(){const x=INN_X0-cam,w=INN_X1-INN_X0;if(x>W+20||x+w<-20)return;
  R(x,GROUND-44,w,44,night()?'#4a3e34':'#b8946a');R(x+6,GROUND-40,w-12,6,night()?'#3a3028':'#a07a52');
  for(let k=0;k<5;k++)R(x+20+k*48,GROUND-34,18,22,night()?'#e8b860':'#efe6cf');
  for(let k=0;k<5;k++)R(x+20+k*48,GROUND-24,18,1,'#6b4423');
  R(x-12,GROUND-58,w+24,14,'#3a3a44');R(x-16,GROUND-60,w+32,3,'#2a2a34');R(x-12,GROUND-61,w+24,2,'#f4f6f8');
  for(let k=0;k<w+24;k+=8)R(x-12+k,GROUND-46,6,2,'#4a4a56');
  R(x+w/2-26,GROUND-74,52,14,'#5a361e');R(x+w/2-22,GROUND-71,44,8,'#efe6cf');
  R(x+w/2-16,GROUND-69,4,4,'#2b1d14');R(x+w/2-8,GROUND-69,4,4,'#2b1d14');R(x+w/2,GROUND-69,4,4,'#2b1d14');R(x+w/2+8,GROUND-69,4,4,'#2b1d14');   // 현판
}
/* 창고 */
function drawStore(){const x=STORE_X-cam;if(x<-60||x>W+60)return;
  R(x-40,GROUND-40,80,40,night()?'#3a3028':'#8a6a4a');R(x-46,GROUND-50,92,10,'#4a3a30');R(x-46,GROUND-51,92,2,'#f4f6f8');
  R(x-12,GROUND-30,24,30,night()?'#1a1410':'#4a2e1f');R(x-1,GROUND-30,2,30,'#2a1a10');R(x-4,GROUND-18,8,3,'#9aa0a6');
  if(G.f.guard&&!G.boss.dead&&night()){const fl=Math.floor(G.anim/8)%2;R(x-30+fl,GROUND-26,4,4,'#4a90d0');R(x+24-fl,GROUND-34,3,3,'#7ab8e8');}   // 창고 안에서 푸른 불빛
}
/* 뒷산 소나무 숲 */
function drawForest(){for(let wx=FOREST_X;wx<2400;wx+=64){const x=wx-cam;if(x<-40||x>W+40)continue;const r=hash(wx);const h=60+r*30;
  R(x+12,GROUND-h*0.5,6,h*0.5,'#4a3424');R(x,GROUND-h,30,h*0.45,night()?'#1e3a2e':'#3e5a4a');R(x+4,GROUND-h-12,22,14,night()?'#24463a':'#46664f');R(x+10,GROUND-h-20,10,10,night()?'#2a5040':'#507458');
  R(x+2,GROUND-h-1,26,2,'#f4f6f8');R(x+6,GROUND-h-13,18,2,'#f4f6f8');}}
function drawLogsSnow(){for(const p of REG.platforms){const x=p.x-cam;if(x>W||x+p.w<0)continue;R(x,p.y-1,p.w,2,'#f4f6f8');}}
Rg.drawBack=()=>{drawSky();drawGround();};
Rg.drawScenery=()=>{
  [140,470,560,760,850].forEach((wx,i)=>drawStall(wx,i));
  drawInn();drawStore();drawForest();drawLogsSnow();
  const sx=2338-cam;if(G.f.hongsiMade&&sx<W+20){R(sx,GROUND-26,2,26,'#6b4423');R(sx-8,GROUND-26,18,8,'#c9a27a');R(sx+6,GROUND-24,2,4,'#6b4423');}
};
Rg.drawPickup=(a,x,bob)=>{R(x-2,a.y-7+bob,5,2,'#8a5a2b');R(x-3,a.y-5+bob,7,2,'#6b4423');R(x-2,a.y-3+bob,5,2,'#8a5a2b');R(x-1,a.y-1,3,1,'#5a3a20');};

/* 눈 */
const snow=Array.from({length:36},()=>({x:Math.random()*W,y:Math.random()*H,s:0.25+Math.random()*0.45,p:Math.random()*6}));
Rg.ambient=()=>{for(const l of snow){l.y+=l.s;l.p+=0.02;l.x+=Math.sin(l.p)*0.3-0.08;if(l.y>H){l.y=-3;l.x=Math.random()*W;}if(l.x<-3)l.x=W+2;}};
Rg.drawFront=()=>{for(const l of snow)R(l.x,l.y,Math.sin(l.p)>0.3?2:1,Math.sin(l.p)>0.3?2:1,'#ffffff');
  if(night()){ctx.fillStyle='rgba(10,14,40,.18)';ctx.fillRect(0,0,W,H);}};

/* ---------- 진행 ---------- */
Rg.maxX=()=>2330;
Rg.step=()=>{
  if(G.f.guard&&night()&&!G.boss.dead&&Math.abs(G.px-STORE_X)<24)Rg.startDokkaebi();
  if(has('hongsi_tteok')&&!G.f.hongsiMade)Rg.sendMedicine();
};
Rg.onHit=()=>{};
Rg.faint=()=>{G.px=Math.max(60,G.px-80);toast('눈길에 미끄러져 물러났다');};
/* 도깨비를 이기거나 달래면 훔쳐 간 설 제수가 돌아온다. 눈홍시는 보따리로 */
Rg.bossDie=calm=>{
  G.boss.dead=true;addItem('nunhongsi',1);
  diary('j_boss','창고를 털던 범인은 낡은 빗자루·키·멍석에 깃든 헌물 도깨비였다. 훔쳐 간 설 제수가 돌아왔다.'+(calm?' 도깨비는 눈홍시를 하나 더 내밀었다.':''));
  toast('눈홍시를 되찾았다! 시루로 홍시 약떡을 찌자');refreshGoal();
};
Rg.STORE_X=STORE_X;
})();
