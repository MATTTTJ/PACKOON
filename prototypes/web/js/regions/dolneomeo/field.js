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
    clue('h2','아빠의 수첩',Rg.arcs()?'아빠의 젊은 시절 수첩에는 서리다래 그림이 없다. 지난가을 글자를 읽고 그날 밤 떠났다는 이야기는 돌쇠 할배에게 들었다.':'아빠의 수첩에는 서리다래가 없다. 아빠는 여기서 열매를 찾지 않고 곧장 떠났다.');
    diary('d_darae',Rg.arcs()?'서리다래를 내 기록에 그렸다. 아빠의 젊은 시절 수첩에는 이 열매가 없다. 지난가을 급히 떠난 일과는 나눠 적어 두자.':'서리다래를 붓으로 그렸다. 해머루 때는 아빠의 그림이 먼저 있었는데, 수첩 어디에도 서리다래는 없다. 아빠는 이곳에서 열매를 찾지 않았다. 무언가를 알고 길을 바꾼 걸까.');
    setTimeout(()=>toast('보따리 속 맷돌로 서리다래를 갈아 약즙을 만들자'),1600);refreshGoal();}
};
Rg.addSeogiSpot=()=>{if(!G.digs.some(d=>d.item==='seogi'))G.digs.push({x:2120,item:'seogi',done:false});};
})();
