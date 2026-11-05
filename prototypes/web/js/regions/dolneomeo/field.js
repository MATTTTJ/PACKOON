'use strict';
/* 돌너머 필드: 첫서리 하늘, 돌산, 돌담, 장승, 억새 들판, 거둔 메밀밭, 겨우살이 나무, 성황당 돌무더기(돌 골렘), 절벽, 서리 */
(()=>{
const Rg=REGIONS.dolneomeo;
const GATE_X=1590;     // 뿔영감이 지키는 돌산 길목 (장승과 금줄)
const GOLEM_AT=1860;   // 이보다 오른쪽으로 가면 돌 골렘과 전투
const GOLEM_SIGHT=2190;   // 확장판 성황당에서 골렘을 처음 보고 한마디 하는 자리(설계 좌표, 결정 D-645)
// 결정 D-87: 뿔영감이 돌산 길을 열어 준 뒤, 성황당 끝 돌 골렘 쪽으로 다가갈수록 긴장이 오른다. 골렘이 잠들면 0.
// 결정 D-116: 확장판 구역의 설계 좌표를 줄인 좌표로 (Rg.trimCuts, engine/core.js trimX). 옛 구성은 그대로다.
const Z=(zone,x)=>CLASSIC?x:trimX(x,Rg.trimCuts?.[zone]);
Rg.moodTension=()=>{
  if(!G.started||G.boss.dead||!G.f.ppuriPassed||(!CLASSIC&&G.zone!=='shrine'))return 0;
  const at=CLASSIC?GOLEM_AT:Z('shrine',2310);   // 확장판 성황당 구역의 전투 시작 자리
  return clamp(1-(Math.abs(at-G.px)-60)/800,0,1);
};
const CLIFF_X=2150;    // 절벽이 시작되는 곳
const DARAE={x:2236,y:150};

/* ---------- 배경 ---------- */
function ridge(par,col,base,amp,freq){ctx.fillStyle=col;for(let x=0;x<W;x+=2){const wx=x+RC()*par;const h=base-Math.abs(Math.sin(wx*freq))*amp-Math.sin(wx*freq*3.1+2)*amp*0.25;ctx.fillRect(x,Math.round(h),2,H-Math.round(h));}}
function drawSky(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#cfdbe0');g.addColorStop(.6,'#a9bcc6');g.addColorStop(1,'#8a9ca6');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const sx=Math.round(300-RC()*0.03);R(sx,30,14,14,'#f4f2e8');R(sx-2,33,18,8,'#f4f2e8');
  for(let i=0;i<3;i++){const cx=Math.round(((i*170+60)-RC()*0.05)%580+580)%580-90;R(cx,22+i*12,40,4,'#e6edf0');R(cx+8,18+i*12,22,4,'#e6edf0');}
  ridge(0.12,'#8d9ca6',118,34,0.006);
  ridge(0.22,'#77878f',138,26,0.011);
  /* 먼 소나무 */
  for(let i=-1;i<10;i++){
    const wx=Math.floor((RC()*0.5)/56)*56+i*56;const x=Math.round(wx-RC()*0.5);const r=hash(wx+7);
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
/* 결정 D-263: 장승 둘은 다르게 깎는다. tall은 천하대장군(사모·부릅뜬 눈·드러낸 이·붉은 얼굴), 아니면 지하여장군(검은 머리·순한 눈·연지) */
function jangseung(wx,tall){const x=wx-cam;if(x<-20||x>W+20)return;const K='#2b1d14',Wt='#efe6cf';
  if(tall){const h=46,t=GROUND-h;
    R(x-4,t,9,h,'#7a5f44');R(x-4,t,9,18,'#9a5a40');R(x-2,t+22,1,20,'#674d37');R(x+2,t+26,1,16,'#674d37');
    R(x-3,t-6,7,5,'#2b2925');R(x-5,t-2,11,2,'#2b2925');R(x-7,t-5,2,2,'#2b2925');R(x+5,t-5,2,2,'#2b2925');
    R(x-4,t+3,3,1,K);R(x+2,t+3,3,1,K);R(x-3,t+5,3,3,Wt);R(x+1,t+5,3,3,Wt);R(x-2,t+6,1,1,K);R(x+2,t+6,1,1,K);
    R(x-1,t+8,2,3,'#6e3e2c');R(x-3,t+12,7,3,K);R(x-2,t+12,5,1,Wt);R(x-2,t+13,1,2,Wt);R(x+2,t+13,1,2,Wt);
    for(let i=0;i<4;i++){const yy=t+22+i*5;R(x-1,yy,3,1,K);R(x,yy-1,1,3,K);}
  }else{const h=38,t=GROUND-h;
    R(x-4,t,8,h,'#977f60');R(x-3,t-2,6,2,'#977f60');R(x-3,t-3,6,4,'#2f2924');R(x,t-2,1,3,'#977f60');R(x+1,t+18,1,14,'#84705a');
    R(x-3,t+4,2,1,K);R(x+1,t+4,2,1,K);R(x-3,t+6,1,1,'#6e5f4a');R(x+2,t+6,1,1,'#6e5f4a');
    R(x-4,t+8,2,2,'#b4513a');R(x+2,t+8,2,2,'#b4513a');R(x-1,t+11,2,1,'#7a3326');
    for(let i=0;i<3;i++){const yy=t+17+i*5;R(x-2,yy,3,1,K);R(x-1,yy+1,1,2,K);}
  }}
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

/* 결정 D-208: 채집 전 겨우살이는 덩어리(슬라임처럼 보였다)가 아니라 가지에 붙어 자란 풀 덤불이다(사용자 피드백 47).
   가지 토막에서 누런 초록 줄기가 두 갈래씩 갈라지고, 끝마다 가는 잎이 짝지어 난다. 갈래 사이에 반투명한 흰 열매. 떠오르지 않고 바람에 잎끝만 흔들린다. */
/* 결정 D-480: 겨우살이가 너무 컸다(사용자 피드백 2026-11-04). 덤불 지름을 약 20px에서 13px로 줄이고, 가지 토막도 짧게. 모양(갈래·잎 짝·흰 열매)은 그대로 */
function drawMistletoe(x,y,a){
  const S='#7f8a36',L='#a3b04c',LD='#738232',BR='#eeedd2';
  const sw=Vfx.reducedMotion?0:Math.sin((G.anim+a.x)/38)*0.5;
  R(x-7,y-2,14,2,'#5a4a3a');R(x-7,y-2,14,1,'#7a6450');R(x+5,y-4,2,2,'#5a4a3a');   // 붙어 자란 가지 토막
  const cx=x,cy=y-6;R(cx,cy+1,1,3,S);   // 밑동: 가지 껍질을 뚫고 나온 짧은 줄기
  // 속은 겹친 잔가지로 어둡게 차 있다(테두리 빛이 사이로 새지 않게)
  for(let j=-3;j<=2;j++){const half=Math.round(3.6*Math.sqrt(1-(j/3.4)**2));R(cx-half,cy+j,half*2+1,1,j<-1?'#6f7d30':'#5d6a28');}
  // 줄기가 둥글게 사방으로 뻗는다. 끝마다 가는 잎 한 쌍.
  for(const deg of [-180,-150,-118,-90,-62,-30,0,155,25]){
    const t=deg*Math.PI/180,len=deg>0&&deg<180?3:5,ex=Math.cos(t),ey=Math.sin(t);
    for(let i=1;i<=len;i++)R(Math.round(cx+ex*i+(i>2?sw:0)),Math.round(cy+ey*i),1,1,S);
    const tx=Math.round(cx+ex*len+sw),ty=Math.round(cy+ey*len);
    for(const k of [-1,1]){const lx=-ey*k+ex*.7,ly=ex*k+ey*.7;R(Math.round(tx+lx),Math.round(ty+ly),1,1,k<0?L:LD);}
  }
  // 갈래 사이 반투명한 흰 열매
  for(const [dx,dy] of [[-1,-2],[2,-1],[0,-4],[-3,0]])R(cx+dx,cy+dy,1,1,BR);
}
/* 결정 D-393·D-486: 석이버섯은 바위 면에 붙은 납작한 잎 모양으로 그렸었다. D-641 로 땅에서 돋은 버섯 무더기로 바꿨다 */
/* 결정 D-641: 필드의 석이는 땅에서 돋은 버섯 한 무더기로 그린다(사용자 피드백 2026-11-05 "그냥 버섯이 땅에서 자란 것처럼").
   이끼 낀 흙 위에 키가 다른 버섯 셋. 갓은 석이 빛깔(검은 갈색)이고 밑에 잿빛 주름, 대는 희다. (x,y)는 바닥 가운데 */
function seogiMushroom(cx,base,h,r){
  const STEM='#e2dccd',STEM_D='#aea694',TOP='#3b342e',TOP2='#4d453d',RIM='#2c2622',GILL='#7a7c72',HI='#76695c';
  R(cx,base-h,2,h,STEM);R(cx+1,base-h+1,1,h-1,STEM_D);R(cx-1,base-1,4,1,STEM_D);
  for(let j=0;j<3;j++){const half=[r-2,r-1,r][j];R(cx+1-half,base-h-3+j,half*2,1,j===0?TOP2:j===2?RIM:TOP);}
  R(cx+2-r,base-h,r*2-2,1,GILL);R(cx+2-r,base-h-3,1,1,HI);R(cx,base-h-3,1,1,HI);
}
function drawSeogiClump(x,y,done=false){
  R(x-9,y-1,18,1,'#55603f');R(x-7,y-2,14,1,'#6f7d5a');R(x-5,y-3,3,1,'#86946a');R(x+5,y-3,2,1,'#86946a');   // 이끼 낀 흙
  if(done){R(x-3,y-4,2,2,'#e2dccd');R(x+3,y-3,2,1,'#e2dccd');R(x-7,y-3,2,1,'#e2dccd');return;}   // 딴 자리: 잘린 대 밑동
  seogiMushroom(x-7,y-2,4,3);seogiMushroom(x+4,y-2,6,4);seogiMushroom(x-2,y-2,9,5);
  R(x+8,y-4,1,2,'#6f7d5a');R(x-10,y-3,1,2,'#6f7d5a');   // 풀 몇 가닥
}
/* 줍는 것 */
Rg.drawPickup=(a,x,bob)=>{
  // 결정 D-393: 메밀 이삭 한 줌. 붉은 줄기 셋을 짚으로 묶었고, 끝마다 세모난 검은 낟알이 송이로 달렸다
  if(a.item==='memil'){
    R(x-2,a.y-6,1,6,'#a8483a');R(x,a.y-7,1,7,'#b8584a');R(x+2,a.y-6,1,6,'#a8483a');R(x-1,a.y-3,3,1,'#d9b860');
    R(x-3,a.y-8+bob,2,2,'#3a3028');R(x-1,a.y-9+bob,2,2,'#2b2522');R(x+1,a.y-8+bob,2,2,'#3a3028');
    R(x-3,a.y-8+bob,1,1,'#6a5a48');R(x,a.y-9+bob,1,1,'#6a5a48');R(x+2,a.y-8+bob,1,1,'#6a5a48');R(x+3,a.y-5,2,1,'#7a9a5a');}
  else if(a.item==='gyeousari')drawMistletoe(x,a.y,a);
  else if(a.item==='seoridarae'){R(x-4,a.y-8+bob,4,4,'#8ab86a');R(x,a.y-8+bob,4,4,'#7fa860');R(x-2,a.y-4+bob,4,4,'#6f9850');R(x-3,a.y-7+bob,1,1,'#f4fbff');R(x+1,a.y-7+bob,1,1,'#f4fbff');R(x-1,a.y-11,2,3,'#5a4a2a');}
  else if(a.item==='solbang')drawPineCone(x,a.y+bob,true);   // 결정 D-265·D-393
  else if(!CLASSIC&&a.item==='seogi'){drawSeogiClump(x,a.y);R(x+5,a.y-16+bob,1,1,'#fff1bf');}   // 결정 D-641
};
/* 결정 D-266: 그늘에 녹지 않은 첫눈이 도톰하게 솟은 둔덕(파헤치는 채집 자리). (x,y)는 바닥 가운데. 옛 구성에도 쓰므로 field.js 에 둔다.
   d.prog 만큼 파이면 위가 깎이고, 다 파면 걷어 낸 눈이 양옆에 쌓이고 가운데 검은 흙이 드러난다.
   꼭대기의 불룩한 혹이 밑에 무언가 있다는 표시다. 눈 계단(D-165)은 걷어 냈다. */
function drawSnowMound(x,y,d){
  const half0=13,need=TABLES.MINIGAMES.gather_snow_mound_hits,cut=d.done?1:Math.min(1,(d.prog||0)/need);
  if(d.done){
    for(const s of [-1,1])for(let j=0;j<4;j++){const half=4-j;R(x+s*11-half,y-j-1,half*2+1,1,j===3?'#ffffff':'#dfe8ea');}
    R(x-7,y-2,14,2,'#4a3a2c');R(x-6,y-3,12,1,'#5c4a38');R(x-3,y-2,2,1,'#6f5a44');R(x+3,y-3,1,1,'#3a2d22');
    R(x-9,y-1,18,1,'#c5d2d7');return;}
  const h=Math.round(12-cut*6);
  for(let j=0;j<h;j++){const half=Math.round(half0*Math.sqrt(1-(j/h)**2));R(x-half,y-j-1,half*2+1,1,j>=h-2?'#ffffff':j%3?'#e4ecee':'#d3dfe3');}
  R(x-half0,y-1,half0*2+1,1,'#b9c8cc');R(x+half0-5,y-4,3,1,'#c6d3d6');R(x-half0+3,y-3,2,1,'#c6d3d6');
  if(!cut){R(x-2,y-h-2,5,2,'#f4f8f9');R(x-1,y-h-3,3,1,'#ffffff');R(x+2,y-h-1,1,1,'#c6d3d6');}
  else{R(x-4,y-h,8,2,'#8f8576');R(x-3,y-h+1,6,1,'#5c4a38');for(const [dx,dy] of [[-8,-h-2],[7,-h-1],[-5,-h-4]])R(x+dx,y+dy,2,2,'#ffffff');}
}
/* 억새 무더기와 땅에서 돋은 석이버섯 (D-641) */
Rg.drawDig=(d,x)=>{
  // 결정 D-266: 눈 둔덕 파기 자리. 나오는 물건(d.item)과 상관없이 둔덕으로 그린다
  if(d.gather==='snow_mound'){drawSnowMound(Math.round(x),d.y??GROUND,d);return true;}
  if(d.item==='eoksae'){
    if(d.done){R(x-7,GROUND-2,14,2,'#a8916a');return true;}
    // 결정 D-50: 억새는 windSway로 휜다 (engine/core.js)
    for(let i=0;i<6;i++){const h=16+((i*7)%9),tip=swayStem(R,x-7+i*3,GROUND,h,d.x+i*5,i%2?'#e8dcc0':'#d8cba8',2.6);R(x-8+i*3+tip,GROUND-h-2,3,3,'#f6f0de');}
    if(Math.floor((G.anim+d.x)/14)%3===0)R(x+2,GROUND-22,1,1,'#fff3b0');
    return true;}
  if(d.item==='seogi'){
    drawSeogiClump(x,GROUND,d.done);if(d.done)return true;   // 결정 D-641: 땅에서 돋은 버섯 무더기
    if(Math.floor((G.anim+d.x)/14)%3===0)R(x+1,GROUND-17,1,1,'#fff3b0');
    return true;}
  return false;
};

/* 성황당 돌무더기: 골렘이 잠들어 있을 때. 쓰러뜨리거나 달래면 작은 돌무더기로 돌아간다.
   결정 D-182: 눈을 뒤집어쓴 설인 같은 돌 골렘이 웅크려 잔다. 구들돌 발, 흰 차돌 팔, 어깨와 머리에 쌓인 눈, 아래로 늘어진 눈 털 */
function drawCairn(){const b=G.boss;const x=b.x-cam;if(x<-60||x>W+60)return;
  if(b.dead){R(x-14,GROUND-8,28,8,'#8a8680');R(x-10,GROUND-14,20,6,'#9a9690');R(x-6,GROUND-19,12,5,'#8a8680');
    R(x-12,GROUND-9,10,2,'#f3f5f4');R(x-6,GROUND-20,10,2,'#f3f5f4');
    if(G.f.golemCalm){R(x-3,GROUND-24,7,5,'#9a9690');R(x-1,GROUND-22,1,1,'#b4432a');}return;}
  const br=Math.floor(G.anim/18)%2,SN='#f3f5f4',SH='#c9d2d8';
  // 구들돌 발 둘
  R(x-30,GROUND-6,18,6,'#5b5048');R(x-29,GROUND-7,16,1,'#7d7066');R(x+12,GROUND-6,18,6,'#5b5048');R(x+13,GROUND-7,16,1,'#7d7066');
  for(let i=0;i<3;i++){R(x-30+i*6,GROUND-2,4,2,'#3e352f');R(x+13+i*6,GROUND-2,4,2,'#3e352f');}
  // 웅크린 몸: 돌무더기에 눈 털을 뒤집어썼다
  R(x-26,GROUND-34-br,52,28,'#6c6e70');R(x-22,GROUND-40-br,44,8,'#76787a');R(x-16,GROUND-30-br,12,8,'#5f6163');R(x+6,GROUND-26-br,14,10,'#5a5c5e');
  for(let i=0;i<9;i++){const fx=x-24+i*6,l=5+((i*7)%4);R(fx,GROUND-40-br,3,l,SN);R(fx+2,GROUND-40-br+l-2,1,2,SH);}
  R(x-28,GROUND-44-br,56,5,SN);R(x-24,GROUND-46-br,48,2,SN);
  // 흰 차돌 팔: 앞으로 늘어뜨려 주먹을 땅에 짚었다
  for(const s of [-1,1]){const ax=x+s*24-(s<0?6:0);R(ax,GROUND-34-br,7,22,'#d2cdc3');R(ax+(s<0?0:4),GROUND-26-br,3,10,'#a39d92');R(ax+1,GROUND-30-br,5,1,'#fbfaf6');
    R(ax-2,GROUND-12,11,9,'#d2cdc3');R(ax-2,GROUND-12,11,1,'#e6e2da');R(ax+(s<0?7:-2),GROUND-9,2,6,'#a39d92');}
  // 결정 D-250: 성황제를 받는 돌무더기. 어깨에 금줄(새끼줄에 흰 한지 오리)을 두르고 오른 어깨에 오색 천을 매었다
  // 금줄은 눈 털 아래 가슴께로 처지게 두른다(입처럼 읽히지 않게 머리와 떨어뜨린다)
  for(let i=0;i<25;i++){const dx=-24+i*2,sag=Math.round(Math.sin(i/24*Math.PI)*3);R(x+dx,GROUND-34-br+sag,2,2,i%3?'#b39556':'#7a6232');}
  for(const k of [-16,-6,6,15])R(x+k,GROUND-32-br+Math.round(Math.sin((k+24)/48*Math.PI)*3),2,4,'#f8f4e6');
  for(const [i,col] of ['#b8432f','#2f5f9e','#d9a83a','#f2efe6','#3f7d52'].entries())R(x+21+i,GROUND-42-br+(i%2),1,8+i%3,col);
  // 결정 D-250: 어깨 사이에 파묻힌 깎은 돌 머리. 처진 눈썹돌이 눈을 덮고 입은 곧게 다물었다 (무표정·무뚝뚝). 웃는 얼굴로 읽히지 않게
  const hy=GROUND-56-br;
  R(x-11,hy,22,15,'#5d5f63');R(x-12,hy+3,1,9,'#5d5f63');R(x+11,hy+3,1,9,'#5d5f63');R(x-11,hy+14,22,1,'#46484c');
  R(x-12,hy-2,24,3,SN);R(x-8,hy-4,16,2,SN);
  R(x-12,hy+4,24,2,'#4a4c50');R(x-12,hy+3,24,1,'#8a8c90');R(x-2,hy+6,4,1,'#4a4c50');   // 가운데로 처진 눈썹돌
  R(x-9,hy+6,6,2,'#3a3c40');R(x+3,hy+6,6,2,'#3a3c40');                                 // 눈썹돌 밑 그늘
  R(x-8,hy+7,4,1,'#16120f');R(x+4,hy+7,4,1,'#16120f');                                 // 그늘 속 가는 눈(잠들어 감았다)
  if(G.f.dolGolemSeen){const on=Math.floor(G.anim/10)%3!==0;R(x-8,hy+7,4,1,'#9fe3dc');R(x+4,hy+7,4,1,'#9fe3dc');   // 결정 D-645: 아이를 본 뒤로 눈을 뜨고
    R(x-4,GROUND-31-br,8,4,on?'#8fcfcb':'#6aa9a6');R(x-2,GROUND-32-br,4,1,'#e4fbf6');}   // 가슴께 서리빛이 비친다
  R(x-1,hy+7,2,4,'#4c4e52');R(x-2,hy+10,4,1,'#3e4044');                                // 넓적한 코
  R(x-5,hy+12,10,1,'#211c18');                                                          // 곧게 다문 입
  R(x+6,hy+1,1,3,'#3d3f43');R(x+7,hy+4,1,2,'#3d3f43');R(x-10,hy+10,3,2,'#5f7a48');     // 금과 볼의 이끼
  // 결정 D-251: 가슴의 눈 껍데기 틈으로 서리 옥 핵이 비친다
  R(x-3,GROUND-30-br,6,6,SN);R(x-1,GROUND-29-br,3,3,'#8fcfcb');R(x-1,GROUND-29-br,1,1,'#e4fbf6');
  if(br){R(x+12,GROUND-60,2,2,SN);R(x+16,GROUND-64,1,1,SN);}   // 잠든 숨결
}
function drawKkuCue(){
  const n=Rg.npcs.find(n=>n.id==='kkubeogi');if(!n)return;
  const x=n.x-cam;if(x<-30||x>W+30)return;
  const stir=Rg.kkuStirNow();
  const f=G.px<n.x?-1:1;
  if(stir>0){
    // 원래 그림 위에 작은 코 움직임과 따뜻한 숨결만 겹친다.
    const twitch=Math.floor(stir*8)%2;
    M(x,GROUND,f,8,-4-twitch,2,1,'#2b1d14');
    M(x,GROUND,f,12,-8-Math.floor(stir*3),2,1,'#d9b892');
    M(x,GROUND,f,-8,-18,3,1,'#d9b892');
    if(stir>.5)M(x,GROUND,f,-3,-20,3,1,'#d9b892');
  }
  // 결정 D-195: 다가가면 머리 위에 뜨던 말풍선(하암…·…으음…·쿨…)은 지운다 (사용자 피드백 50). 고개를 든 모습과 코 움직임만으로 알린다.
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
Rg.faint=()=>{G.px=Math.max(60,Math.min(G.px,GOLEM_AT)-80);think('찬바람에 휘청여 물러났다…');};
/* 결정 D-257: 서리다래는 골렘의 핵 안에서 나온다(사용자 결정 2026-11-02). 이기면 갈라진 핵에서 굴러 나오고,
   달래면 골렘이 꺼내 내려놓는다. 전투 끝에 보따리에 들어오고, 받아 든 장면이 곧바로 이어진다. 그 뒤 성황당 뒤 절벽 길이 열린다.
   옛 저장(예전처럼 절벽 바위턱에 서리다래가 놓인 채 끝난 저장)은 그 자리에서 그대로 딴다(onPickup). */
Rg.bossDie=()=>{
  G.boss.dead=true;
  diary('d_boss',G.f.golemCalm?'성황당 돌무더기가 가슴의 핵에서 서리다래를 꺼내 내려놓고 다시 조용해졌다.':'성황당 돌무더기의 핵이 갈라지며 서리다래가 굴러 나왔다. 돌무더기는 무너졌다.');
  think('성황당 뒤 절벽 길이 열렸다!');refreshGoal();
  if(has('seoridarae'))daraeGot(G.f.golemCalm?'calm':'win');
};
Rg.onPickup=a=>{if(a.item==='seoridarae')daraeGot('ledge');};
function daraeGot(how){
  if(G.f.daraePicked)return;G.f.daraePicked=true;
  // 결정 D-130: 젊은 아빠의 수첩(적혀 있지 않다)과 지난가을의 아빠(열매를 받지 못하고 떠났다)를 나눠 적는다.
  clue('h2','아빠의 수첩',!CLASSIC||Rg.arcs()?'아빠가 젊을 때 적은 수첩의 돌너머 쪽에는 서리다래가 적혀 있지 않다. 지난가을의 아빠는 서리다래를 기다리다, 글자를 읽은 그날 밤 떠났다(돌쇠 할배).':'아빠의 수첩에는 서리다래가 적혀 있지 않다. 아빠는 여기서 열매를 얻지 않고 곧장 떠났다.');
  diary('d_darae',!CLASSIC||Rg.arcs()?'서리다래를 수첩에 그렸다. 아빠가 젊을 때 적은 쪽에는 이 열매가 적혀 있지 않다. 지난가을의 아빠도 열매를 얻지 못하고 떠났다.':'서리다래를 붓으로 그렸다. 해머루 때는 아빠의 그림이 먼저 있었는데, 수첩 어디에도 서리다래는 적혀 있지 않다. 아빠는 이곳에서 열매를 얻지 않았다. 무언가를 알고 길을 바꾼 걸까.');
  // 결정 D-257: 받아 든 열매. 달랬으면 골렘이 내려놓은 것, 이겼으면 무너진 돌 사이에서 주운 것
  const first=how==='calm'?['너구리','(돌무더기가 내려놓은 서리다래다.\n서리가 하얗게 앉아 손끝이 시리다.)']
    :how==='win'?['너구리','(무너진 돌 틈에서 서리다래를 주웠다.\n서리가 하얗게 앉아 손끝이 시리다.)']:null;
  // 결정 D-130: 약을 직접 갈기로 아이가 정한다. 열매째로는 까치 발에 묶어 보낼 수 없다.
  talk([...(first?[first]:[]),['너구리','(열매째 까치 발에 묶으면\n가는 길에 다 짓무르겠다.)'],['너구리','(맷돌이 깨어났으니…\n이번엔 내가 갈아서 약즙으로 보내자.)']]);refreshGoal();
}
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
    // 결정 D-265·D-266: 확장판에만 있는 길섶 채집물(dol_g_*)도 구역을 단 채 둔다. classic 은 그리지도 줍지도 않는다.
    const formSpot=p=>formSpotIds.includes(p.id)||/^dol_(g|owl)_/.test(p.id||'');
    // 결정 D-665: 수리부엉이 숨은 물건(dol_owl_)도 채집 자리처럼 옛 순번 매기기에서 뺀다 (옛 구성을 거쳐 돌아올 때 주운 물건 순번이 밀리지 않게)
    if(G?.region===Rg.id&&[...G.pickups,...G.digs].some(p=>p.zone&&!formSpot(p))){
      const originalPickups=[[886,192],[941,192],[1003,192],[1229,192],[1262,192],[1341,192],[670,118],[1412,118]];   // 결정 D-265: region.js 의 옛 자리와 같게
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
  // 결정 D-207: 채집물은 같은 간격으로 늘어서지 않게 사이를 들쭉날쭉하게 둔다(사용자 피드백 58). 메밀댁(760)·꾸벅이 둥지 문턱(1590)과 겹치지 않게.
  const pickupMap=[
    ['field',602,192],['field',661,192],['field',702,192],
    ['field',1768,192],['field',1821,192],['field',1866,192],
    ['village',1920,112],['field',2040,112],
  ];
  const digMap=[['field',1316],['field',1437],['field',1668],['field',2310]];
  function placeOld(g){
    // 기존 저장의 got/done은 유지하고 위치만 현재 배치에 맞춘다.
    // 옛 구성에만 있는 눈 둔덕(dol_cl_*, 결정 D-266)은 확장판에 자리가 없어 뺀다.
    if(g.digs?.some(d=>/^dol_cl_/.test(d.id||'')))g.digs=g.digs.filter(d=>!/^dol_cl_/.test(d.id||''));
    let pi=0,di=0;
    for(const p of g.pickups){
      if(p.zone)continue;
      if(p.item==='seoridarae'){Object.assign(p,{id:'dol_darae',zone:'cliff',x:trimX(2780,Rg.trimCuts?.cliff),y:112});continue;}   // 줄인 절벽길 좌표 (D-109)
      const at=pickupMap[pi++];if(at)Object.assign(p,{id:'dol_old_pickup_'+(pi-1),zone:at[0],x:at[1],y:at[2]});
    }
    for(const d of g.digs){
      const i=Number(d.id?.match(/^dol_old_dig_([0-3])$/)?.[1]);
      if(Number.isInteger(i))Object.assign(d,{zone:digMap[i][0],x:digMap[i][1]});
      if(d.zone)continue;
      if(d.item==='seogi'){Object.assign(d,{id:'dol_seogi',zone:'cliff',x:2920});continue;}   // 설계 좌표(뒤에 trimState가 옮긴다). 결정 D-128
      const at=digMap[di++];if(at)Object.assign(d,{id:'dol_old_dig_'+(di-1),zone:at[0],x:at[1]});
    }
    if(g.f?.dolExtraPointState)for(const p of g.pickups){const prior=g.f.dolExtraPointState[p.id];if(prior){p.got=prior.got;delete g.f.dolExtraPointState[p.id];}}
    g.boss.x=Z('shrine',2400);
  }
  Rg.newState=()=>{const s=originalNewState();placeOld(s);return s;};
  Rg.onStart=()=>{originalStart();placeOld(G);think('장승 안쪽은 닫혔네. 오른쪽 돌담길로 가 보자.');};

  const platform=(x,y,w)=>({x,y,w});
  const bases={
    // 결정 D-48: 두 칸 계단만 stepRidge()로 오르락내리락. 다리·물건·변신 자리 발판은 그대로다.
    gate:[...stepRidge(320,61,3,{low:164}),...stepRidge(1300,62,4,{low:164}),platform(1608,174,60),platform(1680,156,80),platform(2020,112,90),platform(2160,154,90)],
    village:[...stepRidge(520,63,4,{low:164}),platform(1120,156,82),platform(1790,164,80),platform(1850,138,84),platform(1910,112,92),...stepRidge(2300,64,3,{low:164})],
    // 2190 턱은 디딤 없이 바닥에서 80px 위다. 산양 뛰기로만 오른다 (PA-47 선택 자리).
    field:[...stepRidge(260,65,3,{low:164}),...stepRidge(1180,66,4,{low:164}),platform(1900,164,86),platform(1960,138,90),platform(2020,112,88),platform(2190,112,76)],
    cliff:[...stepRidge(320,67,3,{low:164}),...stepRidge(790,68,4,{low:164}),...stepRidge(1600,69,3,{low:164}),platform(2220,166,90),platform(2280,138,90),platform(2350,112,130),platform(2500,138,96),platform(2560,112,294)],
    // 결정 D-266: 높은 바위(석이버섯)로는 굴러 내려와 박힌 바윗돌 둘을 딛고 오른다(26·26·28px, 점프 약 45px). 눈 계단(D-165)은 걷어 냈다.
    shrine:[...stepRidge(280,70,3,{low:164}),{...platform(1428,166,40),boulder:true},{...platform(1476,140,36),boulder:true},platform(1520,112,110),platform(1630,140,80),...stepRidge(1950,71,4,{low:164}),...stepRidge(2560,72,3,{low:164})],
  };
  /* 결정 D-266: 눈 둔덕을 밟아 다져 계단을 만들던 일(D-165)은 현실성이 없어 뺐다(사용자 피드백 2026-11-02).
     성황당 솔숲 그늘의 눈 둔덕은 이제 파헤치는 채집 자리다(아래 addZoneGather 의 snow_mound). 옛 저장의 dolSnowSteps 표시는 쓰지 않는다. */
  // 구역에 들어설 때마다 자른 좌표의 bases로 발판을 다시 깐다 (D-109·D-110).
  function applySteps(){
    const z=Rg.zones[G.zone];
    if(!z)return;
    if(G.zone==='shrine'||G.zone==='gate')z.platforms=bases[G.zone];
    if(G.zone==='cliff')z.platforms=G.boss.dead?bases.cliff:bases.cliff.filter(p=>p.x<trimX(2200,Rg.trimCuts?.cliff));
  }
  const marker=(x,y)=>{R(x-1,y-24,2,24,'#675443');R(x-11,y-25,23,7,'#e5ddc8');R(x+6,y-23,3,3,'#516b71');};
  const blocked=(x,y)=>A.drawBlocked(x,y);
  const permit=()=>!!G.f.ppuriPassed;
  const calm=()=>!!G.boss.dead;
  const gateReason='뿔영감에게 메밀가루를 건네 장승제를 올려야 한다.';
  let depthFx=null;
  const travel=el('div');travel.id='dolDepthTravel';travel.hidden=true;travel.style.cssText='pointer-events:none';$('shell').appendChild(travel);
  const snapshot=()=>{const image=document.createElement('canvas');image.width=W;image.height=H;image.getContext('2d').drawImage(cv,0,0);return image;};
  defineMinigame({id:travel.id,hit:()=>{},step:()=>{
    if(!depthFx){travel.hidden=true;return;}
    // 결정 D-166: 장승 문은 먼저 장승 둘이 양옆으로 기울며 비켜 선다. 비켜 선 모습을 찍은 뒤 그 사이로 들어간다.
    if(!depthFx.image){if(++depthFx.open>=TABLES.TUNING.depth_gate_open_frames)depthFx.image=snapshot();return;}
    depthFx.tick++;
    if(depthFx.tick>=TABLES.TUNING.zone_transition_frames){
      const p=depthFx.door;travel.hidden=true;depthFx=null;
      changeZone(p.to,{x:p.toX,y:p.toY});
    }
  }});
  /* 장승 문이 비켜 선 정도 (0~1). 장승 그림(고갯길 경치·돌계단 문)이 읽는다 */
  Rg.depthOpen=id=>!depthFx||depthFx.door.id!==id?0:depthFx.image?1:clamp(depthFx.open/TABLES.TUNING.depth_gate_open_frames,0,1);
  function enterDepth(p){
    if(!pathOpen(p)){think(p.reason);return;}
    const gate=!!p.gate&&!Vfx.reducedMotion;
    depthFx={door:p,tick:0,open:0,image:gate?null:snapshot(),pivot:Math.round(p.x-G.cam)};suppressHeldInputs();travel.hidden=false;
  }
  function specialInteract(e){
    if(REG!==Rg||!usesZones(Rg)||paused())return;
    const p=nearInteraction();if(!p||(!p.wishTower&&!p.depth))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(e.type==='keydown')suppressedKeys.add(e.key.toLowerCase());
    if(p.wishTower)Rg.wishTower?.();else enterDepth(p);
  }
  addEventListener('keydown',e=>{
    if(e.repeat||!['e','enter','arrowup'].includes(e.key.toLowerCase()))return;
    if(e.target instanceof HTMLElement&&(e.target.matches('input,textarea,select')||e.target.isContentEditable))return;
    specialInteract(e);
  },true);
  $('padTalk').addEventListener('pointerdown',specialInteract,true);
  $('prompt').addEventListener('click',specialInteract,true);

  function drawStonePlatforms(id){
    for(const p of Rg.zones[id].platforms){const x=Math.round(p.x-RC());if(x>W||x+p.w<0)continue;   // 이미 옮긴 좌표 (D-128)
      if(p.boulder){A.drawBoulder(x,p.y,p.w);continue;}   // 결정 D-266: 디딤 바윗돌
      R(x,p.y,p.w,6,'#737e7d');R(x,p.y,p.w,2,'#e2e9e4');R(x+2,p.y+6,p.w-4,3,'#535f60');
      for(let k=13;k<p.w;k+=23)R(x+k,p.y+2,1,5,'#4b595b');
    }
  }
  function front(id){
    A.drawFront(id);
    if(depthFx?.image){
      const t=depthFx.tick/TABLES.TUNING.zone_transition_frames;
      ctx.save();ctx.imageSmoothingEnabled=false;
      if(!Vfx.reducedMotion){const s=depthFx.door.reverse?1-.13*t:1+.18*t;ctx.translate(depthFx.pivot,H*.72);ctx.scale(s,s);ctx.drawImage(depthFx.image,-depthFx.pivot,-H*.72);ctx.setTransform(1,0,0,1,0,0);
        const spread=Math.round(t*48);A.drawDepthGate(depthFx.pivot,GROUND,spread,depthFx.door.gate?1:0);}
      ctx.globalAlpha=t;R(0,0,W,H,'#344247');ctx.restore();
    }
  }
  function commonStep(id){
    applySteps();if(Rg.arcs())G.f.arcs=true;
    // 방문 구역은 엔진의 G.visitedZones가 기록한다. 매 프레임 진행값을 쓰지 않는다(지도 왕복 검사가 흔들렸다).
    // 결정 D-645: 골렘을 처음 보면 아이가 한마디 하고(GOLEM_SIGHT), 두 걸음쯤 더 다가가야(2310) 전투가 열린다 (단풍골 D-547 과 같은 방식)
    if(id==='shrine'&&!G.boss.dead&&G.f.ppuriPassed){
      if(!G.f.dolGolemSeen&&G.px>Z('shrine',GOLEM_SIGHT)&&$('dlg').hidden){G.f.dolGolemSeen=true;G.vx=0;
        talk([['너구리','(저게 뒤척인다던 성황당 돌무더기구나.\n돌 틈으로 하얀 김이 새어 나와.)'],
          ['너구리','(가슴께가 파랗게 비쳐. 서리다래가 저기 있어.\n…무서워도 엄마 약이야. 가 보자.)']]);}
      else if(G.f.dolGolemSeen&&G.px>Z('shrine',2310)&&$('dlg').hidden)Rg.startGolem();
    }
  }
  function zone(id,w,npcs){return {w,startX:80,ground:GROUND,platforms:bases[id],npcs,
    camLead:()=>id==='shrine'&&!G.boss.dead&&G.f.ppuriPassed?70*clamp((G.px-Z('shrine',2120))/160,0,1):0,   // 결정 D-645: 골렘에 다가가는 동안 화면이 골렘 쪽을 앞서 보여 준다
    // 옛 저장의 옛 다리 기억(D-116) 표시는 지운다 (결정 D-165)
    weather:()=>Vfx.setWeather(Rg.springRevisit()?'':'frost'),surface:()=>Rg.springRevisit()?'':'frost',ambient:()=>{if(!open('dlg'))ppuriScene=null;placeOld(G);if(G.f.dolMemory)delete G.f.dolMemory;Rg.ambient();applySteps();},
    drawBack:()=>A.drawBack(id),drawScenery:()=>{A.drawScenery(id);drawStonePlatforms(id);},
    drawActors:()=>{if(id==='shrine')drawCairn();if(id==='field')drawKkuCue();},
    weatherFront:()=>front(id),drawPickup:Rg.drawPickup,drawDig:Rg.drawDig,onPickup:a=>Rg.onPickup(a),
    step:()=>commonStep(id),onHit:()=>{},faint:()=>{G.px=id==='shrine'?Z('shrine',2240):80;G.py=GROUND;G.vy=0;applySteps();think('돌담 안쪽에서 숨을 골랐다. 보따리는 그대로다.');},
  };}
  Rg.startZone='gate';
  // 결정 D-109: 빈 걷기 구간 줄이기 (engine/core.js trimRegion). [시작, 지울 길이] — 설계 좌표.
  // 돌담 마을: 들어선 자리와 첫 발판 사이. 절벽길: 아무것도 없는 발판 두 무리를 지운다(개구리까지 1340px → 340px).
  Rg.trimCutsV1={village:[[110,280]],cliff:[[160,1000]]};   // 첫 판(D-109) — 옛 저장을 옮길 때 쓴다
  // 결정 D-116: 고갯길은 빈 돌계단 무리(1300~1450), 성황당은 들어선 자리와 첫 돌탑 사이(430~790)를 지운다.
  Rg.trimCutsV2={gate:[[1300,150]],village:[[110,280]],cliff:[[160,1000]],shrine:[[430,360]]};   // 둘째 판(D-116) — 옛 저장을 옮길 때 쓴다
  // 결정 D-128: 걷기만 하는 길을 콘텐츠 사이 230px 안팎으로. 고갯길 뿌리·산토끼·종 사이 두 곳, 밭 오른쪽 출구 앞, 절벽길 은이끼와 개구리 사이·언 물줄기와 다래길 사이. 성황당 골렘 자리는 자르지 않는다.
  Rg.trimCutsV3={gate:[[720,100],[1050,70],[1300,150]],village:[[110,280]],field:[[2420,60]],cliff:[[160,1000],[1270,50],[1960,80]],shrine:[[430,360]]};   // 셋째 판(D-128). 넷째 판도 돌너머는 같다. 옛 저장을 옮길 때 쓴다
  Rg.trimCutsV4=Rg.trimCutsV3;
  // 결정 D-206: 남생이 할미가 있는 성황당 구역을 더 줄인다(사용자 피드백 54). 들어선 자리와 소원 천 사이, 바라보기 앞, 골렘 자리 뒤 절벽 끝 문 앞.
  // 골렘 자리·석이 바위·작은 돌탑은 그대로다.
  Rg.trimCutsV5=Rg.trimCutsV6={...Rg.trimCutsV3,shrine:[[150,110],[430,360],[1730,80],[2440,110]]};   // 다섯째·여섯째 판(D-206). 옛 저장을 옮길 때 쓴다
  // 결정 D-640: 돌쇠 할배(1080)에서 날쌘(1640)까지 560px 을 2/3(373px)로. 다람쥐 도토리 자리(1420)와 날쌘 집(1640) 사이 빈 돌담길을 지운다.
  Rg.trimCuts={...Rg.trimCutsV6,village:[[110,280],[1440,187]]};
  // 구역에 들어설 때 applyMemory가 bases로 발판을 다시 깐다. 그래서 bases도 같은 좌표로 자르고 정리해 둔다 (D-109·D-110).
  Rg.trimHook=tX=>{
    for(const id of Object.keys(bases)){
      const c=Rg.trimCuts[id];
      const list=c?bases[id].filter(p=>!trimInside(p.x+p.w/2,c)).map(p=>({...p,x:tX(p.x,c)})):bases[id];
      bases[id]=tidyPlatforms(list,platformAnchors(Rg,id,Rg.zones[id]));
    }
  };
  Rg.zones={gate:zone('gate',2400,['ppuri']),village:zone('village',2800,['dolsoe','nal']),field:zone('field',2600,['kkubeogi']),cliff:zone('cliff',3000,[]),shrine:zone('shrine',2800,[])};
  // 대화가 이어지는 동안은 화자의 자리를 지키고, 끝나면 진행값으로 위치를 정한다.
  let ppuriScene=null;
  const ppuriVillage=()=>ppuriScene?.owner===G&&open('dlg')?
    ppuriScene.zone==='village':!!G?.f.ppuriMet&&!G.f.ppuriPassed;
  Object.defineProperty(Rg.zones.gate,'npcs',{get:()=>ppuriVillage()?[]:['ppuri']});
  Object.defineProperty(Rg.zones.village,'npcs',{get:()=>['dolsoe','nal',...(ppuriVillage()?['ppuri']:[])]});
  Rg.zones.gate.exits={right:{to:'village',toX:80}};
  Rg.zones.village.exits={left:{to:'gate',toX:2320},right:{to:'field',toX:80}};
  Rg.zones.field.exits={left:{to:'village',toX:2720}};
  Rg.zones.cliff.exits={right:{to:'shrine',toX:80}};
  Rg.zones.shrine.exits={left:{to:'cliff',toX:2920}};
  Rg.zones.gate.doors=[
    // 장승 둘은 고갯길 경치(art.js scenery)가 그린다. 들어설 때 비켜 선다 (결정 D-166)
    {id:'dol_depth_gate',depth:true,gate:true,x:1650,to:'cliff',toX:100,label:'장승 사이, 먼 돌산으로 · ↑ / E',need:permit,reason:gateReason,draw:()=>{},drawBlocked:()=>{}},   // 결정 D-264: 장승 사이 금줄은 고갯길 경치(art.js)가 그린다. 틀을 따로 세우지 않는다
    // 결정 D-164: 첫 아빠 도장(장승) 바로 다음, 길섶에 반쯤 쌓인 소원 돌탑. 옛 돌다리 다시 놓기(받침·다리판·가장자리)를 대신한다(사용자 피드백 24).
    {id:'dol_wish_tower',wishTower:true,x:1800,to:'gate',toX:1800,get label(){return G.f.dolWishTower?'소원 돌탑 바라보기 · E':'반쯤 쌓인 돌탑 살펴보기 · E';},
      draw:(x,y)=>A.drawWishTower(x,y,G.f.dolWishTower?3:0,!!G.f.dolHareTower)},
  ];
  // 결정 D-166: 돌계단 안쪽 성황당 입구에도 장승 둘이 늘 서 있다(예전에는 금줄이 걷히면 장승까지 사라졌다). 들어설 때 양옆으로 비켜 선다.
  Rg.zones.village.doors=[{id:'dol_depth_shrine',depth:true,gate:true,x:2440,to:'shrine',toX:100,label:'돌계단 안쪽, 성황당으로 · ↑ / E',need:permit,reason:gateReason,
    draw:(x,y)=>A.drawDepthGate(x,y,0,Rg.depthOpen('dol_depth_shrine')),drawBlocked:(x,y)=>A.drawGateRope(x,y)}];
  Rg.zones.cliff.doors=[
    {id:'dol_depth_back',depth:true,reverse:true,x:100,to:'gate',toX:1650,label:'장승 고갯길로 돌아가기 · E',draw:marker},
    {id:'dol_darae_path',depth:true,x:2160,to:'cliff',toX:2240,label:'골렘이 비켜 준 다래길',need:calm,reason:'성황당 돌무더기가 절벽 위 길을 흔든다. 성황당에서 먼저 잠재우자.',draw:marker,drawBlocked:blocked},
  ];
  // 다래길은 발판만으로 우회하지 못하게 한다. 아래길에서 성황당 출구까지는 항상 안전하다.
  const cliffBases=bases.cliff;
  Rg.zones.cliff.step=()=>{Rg.zones.cliff.platforms=G.boss.dead?cliffBases:cliffBases.filter(p=>p.x<2200);commonStep('cliff');};
  Rg.zones.shrine.doors=[
    {id:'dol_depth_village',depth:true,reverse:true,x:100,to:'village',toX:2440,label:'돌담 마을로 돌아가기 · E',draw:marker},
    // 결정 D-427: 성황당 끝에서 절벽길 높은 턱으로 바로 옮기던 문(dol_after_golem)은 뺐다. 돌아오는 문이 없는 한쪽 순간이동이었다(사용자 지시 2026-11-03: 순간이동 기믹 빼기).
    //   서리다래는 골렘에게서 받는다. 절벽 끝 턱은 왼쪽 출구로 절벽길에 나가 다래길 발판을 올라 걸어서 간다.
  ];
  // 필수 물건은 선택 발견에 기대지 않는다. 기존 여섯 알·두 가지에 정확히 +3/+1.
  Rg.zones.field.pickups=[{id:'dol_memil_extra1',x:818,y:192,item:'memil',got:false},{id:'dol_memil_extra2',x:1943,y:192,item:'memil',got:false},{id:'dol_memil_extra3',x:2003,y:192,item:'memil',got:false}];   // D-207
  Rg.zones.gate.pickups=[{id:'dol_mistletoe_extra',x:2060,y:112,item:'gyeousari',got:false}];
  // 서리 낀 돌기둥. 다람쥐가 타고 높은 바위턱(y=112)에 오른다 (PA-47)
  Rg.zones.gate.climbs=[{x:2028,top:112,draw:(x,y,top)=>{R(x-2,top,4,y-top,'#6d665c');R(x-2,top,1,y-top,'#a7a093');for(let k=top+9;k<y-4;k+=14)R(x-3,k,6,2,'#4f4a43');}}];
  // 산양 턱의 석이버섯, 다람쥐의 잊은 몫 (PA-47 선택 자리)
  Rg.zones.field.pickups.push({id:'dol_goat_seogi',x:2228,y:112,item:'seogi',got:false});
  Rg.zones.field.digs=[{id:'dol_cache_field',x:880,item:'memil',n:2,form:'squirrel',cache:true,done:false}];
  Rg.zones.village.digs=[{id:'dol_cache_village',x:1420,item:'acorn',n:2,form:'squirrel',cache:true,done:false}];
  Rg.zones.shrine.pickups=[{id:'dol_memory_seogi',x:1580,y:112,item:'seogi',got:false}];
  /* 결정 D-265: 길섶 채집물을 더한다 (사용자 피드백 2026-11-02). 고갯길·절벽길 억새, 높은 바위턱의 겨우살이, 마을 길에 흘린 메밀 이삭.
     결정 D-266: 그늘에 녹지 않은 첫눈 둔덕을 파면 눈에 덮였던 것이 나온다. 무엇이 왜 거기 있었는지는 자리마다 found 로 알린다.
     솔방울은 소나무 곁 둔덕에서만, 메밀은 밭머리·돌담 밑에서만, 억새는 바람이 쓸어 모으는 바위 밑에서만 나온다. 좌표는 길을 줄인 뒤의 자리. */
  const mound=found=>({gather:'snow_mound',found});
  const PINE='소나무 그늘이라 첫눈이 녹지 않았다. 눈 밑에 가을에 떨어진 솔방울이 묻혀 있었다.';
  /* 결정 D-391 (사용자 피드백 2026-11-03: 너무 많고 다양하지 않다): 자리마다 그 땅에서 날 것만 하나둘. 고갯길은 억새·겨우살이·솔숲 둔덕,
     돌담 마을은 메밀 단, 밭은 밭머리 둔덕, 절벽은 바람 맞은 억새와 바위의 석이, 성황당 솔숲은 솔방울·겨우살이 둔덕. 억새는 밭(구역에 이미 있는 넷)에서 주로 벤다. */
  addZoneGather(Rg,'dol_g_',[
    ['gate','d',150,'eoksae'],['gate','p',1184,'gyeousari',{y:112}],['gate','d',1585,'solbang',mound(PINE)],
    ['village','d',1230,'memil',mound('돌담 밑에 쌓아 두고 잊은 메밀 단이 눈에 덮여 있었다. 이삭이 아직 붙어 있다.')],['village','p',2300,'memil'],
    ['field','d',455,'memil',mound('밭머리에 남겨 둔 메밀 이삭 단이 첫눈에 덮여 있었다.')],
    ['cliff','d',600,'eoksae',mound('바람에 꺾인 억새가 바위 밑에 쓸려 와 쌓였고, 그 위로 눈이 덮였다.')],['cliff','p',1290,'seogi',{y:112}],['cliff','d',1700,'eoksae'],
    ['shrine','d',690,'solbang',mound(PINE)],
    ['shrine','d',820,'gyeousari',mound('바람에 꺾여 떨어진 겨우살이 가지가 눈 속에 묻혀 있었다.')],
  ]);
  // 결정 D-665: 수리부엉이만 느끼는 숨은 물건 (사용자 피드백 2026-11-05). 수리부엉이로 곁을 지나면 드러난다. 좌표는 길을 줄인 뒤의 자리
  addZoneGather(Rg,'dol_owl_',[['cliff','p',920,'seokcheong',{hidden:'owl'}],['village','p',1460,'chadol',{hidden:'owl'}]]);
  Rg.zones.cliff.vistas=[{id:'dawn_clouds',x:2680,y:112,from:80,to:430,sound:'wind',thought:'해 떴다!\n엄마도 보고 있을까.',diary:'돌산 절벽 끝에서 구름바다 위로 해가 솟는 것을 봤다. 처음 고갯길에서 봤던 먼 돌산에 서 있다.',draw:marker,layers:A.cliffLayers}];
  // 결정 D-83: 밭 둔덕에서 먼 성황당 돌무더기가 꿈틀하는 것이 보인다. 목적지(성황당)와 골렘을 미리 보여 준다.
  // 결정 D-167: 꾸벅이 둥지(1510)와 붙어 있던 바라보기 자리를 메밀 그루터기 쪽 둔덕으로 옮긴다(사용자 피드백 27).
  Rg.zones.field.vistas=[{id:'shrine_stir',x:1000,from:0,to:180,sound:'wind',thought:'저 먼 돌무더기가… 움직였어?\n바람 탓인가.',
    diary:'메밀밭 둔덕에서 먼 산 쪽 돌무더기가 꿈틀하는 것을 봤다. 돌이 저절로 움직일 리 없는데.',draw:marker,layers:A.stirLayers}];
  Rg.zones.shrine.vistas=[{id:'wishing_stones',x:1850,from:40,to:390,sound:'wind',thought:'작은 돌도 받치고 있네.\n엄마 돌도 놓을래.',diary:'성황당 돌탑 아래에서 바람을 들었다. 작은 돌들이 서로를 받치고 있었다.',draw:marker,layers:A.shrineLayers}];

  // story.js가 NPC와 콜백을 모두 등록한 뒤 한 번 호출한다.
  Rg.installExpansion=()=>{
    const loc={kkubeogi:['field',1510],dolsoe:['village',1080],nal:['village',1640],ppuri:['gate',610]};
    for(const n of Rg.npcs){const at=loc[n.id];n.zone=at[0];n.x=at[1];}
    const ppuri=Rg.npcs.find(n=>n.id==='ppuri'),ppuriTalk=ppuri.talk;
    Object.defineProperties(ppuri,{
      x:{configurable:true,get:()=>ppuriVillage()?Z('village',2380):Z('gate',610)},
      zone:{configurable:true,get:()=>ppuriVillage()?'village':'gate'},
    });
    ppuri.talk=()=>{
      ppuriScene={owner:G,zone:G.zone};
      if(G.zone==='village'&&G.f.ppuriMet&&!G.f.ppuriPassed)
        talk([[ppuri.name,'장승제 전에 성황당 길을 살펴 두는 중이다.\n메밀가루를 가져오면 여기서 바로 장승제를 올린다.']],ppuriTalk);
      else ppuriTalk();
    };
    const oldBossDie=Rg.bossDie;
    Rg.bossDie=()=>{oldBossDie();placeOld(G);};
    Rg.addSeogiSpot=()=>{if(!G.digs.some(d=>d.id==='dol_seogi'))G.digs.push({id:'dol_seogi',zone:'cliff',x:Z('cliff',2920),item:'seogi',done:false});   /* 결정 D-128: 둘째 판의 1920 자리(설계 2920)를 지금 자르기로 */};
    Rg.startGolem=()=>{
      G.px=Z('shrine',2275);
      inkTransition('돌 골렘',(G.boss.x-G.cam)/W*100,()=>startBattle('golem',res=>{
        if(res==='win'||res==='calm'){
          if(res==='calm'){G.f.golemCalm=true;diary('d_calm','성황당 돌무더기를 부수지 않고 달랬다. 돌 골렘이 조용히 내려앉았다.');}
          Rg.bossDie();
        }else{G.px=Z('shrine',2240);G.f.faints+=res==='lose'?1:0;diary('d_hint','돌 골렘의 다리나 팔을 먼저 무너뜨리거나, 마음을 달랠 물건을 건네 보자.');
          talk([['너구리','(가슴 핵이 눈 껍데기에 덮여 있었어.\n다리나 팔부터 무너뜨리거나, 달랠 물건을 건네 보자.)']],()=>think('숨 좀 고르자. 준비되면 다시 가 보자.'));}
      }));
    };
    Rg.sendMedicine=()=>{
      if(regionCompleted(Rg.id))return;
      G.f.yakMade=true;
      diary('d_end','깨어난 맷돌로 서리다래를 갈았다. 마을 돌담의 늙은 까치에게 내가 만든 약즙을 맡겼다.');
      talk([['너구리','(약즙 통을 까치 발에 단단히 묶었다.)'],['너구리','엄마한테… 제가 만들었다고 전해 주세요.'],['늙은 까치','오냐. 그 말까지 단단히 묶어 가마.'],...Rg.nextMedicineWord],()=>Rg.finishHomeDelivery());
    };
    const oldGoal=Rg.goal;
    Rg.goal=()=>{
      if(!G.started||G.ended)return oldGoal();
      // 결정 D-67: 앞선 진행부터 본다. 결정 D-149: 짧은 명사형으로 핵심만, 장소는 붙이지 않는다.
      // 결정 D-218: '까치 할머니'라는 말은 쓰지 않는다. 약 나르는 까치는 늘 '늙은 까치'다.
      if(has('darae_yak'))return '늙은 까치에게 약즙 맡기기';
      if(G.boss.dead&&!G.f.daraePicked)return '서리다래 따기';
      // 결정 D-130: 아이가 아는 이름과 본 것으로만 부른다.
      if(G.f.ppuriPassed&&!G.boss.dead)return '움직이는 돌무더기와 맞서기';
      // 결정 D-447: 할 일 줄에는 아이가 아직 만나거나 들은 적 없는 이름을 쓰지 않는다 (사용자 피드백 2026-11-04).
      //   도착 때 일기("서리다래가 어디 열리는지 마을에 물어보자")대로 묻고, 뿔영감이 "고슴도치 녀석"이라 한 뒤로는 고슴도치, 만난 뒤에야 꾸벅이.
      if(!G.f.ppuriMet&&!G.f.kkuTalk)return '마을에 서리다래 물어보기';
      if(!G.f.kkuTalk)return '고슴도치에게 서리다래 묻기';
      if(!G.f.ppuriPassed&&has('memil_powder'))return '뿔영감에게 메밀가루 건네기';
      return oldGoal();
    };
  };
}
})();
