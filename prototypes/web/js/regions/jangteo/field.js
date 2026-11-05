'use strict';
/* 큰 장터 필드: 설 대목 장터(낮/밤), 붉은 등불, 떡집, 보부상 숙소, 창고, 뒷산 소나무 숲, 눈.
   숙소 마루에서 쉬면 낮과 밤이 바뀐다 (부엉 영감은 밤에만 깨어 있다) */
(()=>{
const Rg=REGIONS.jangteo;
const INN_X0=1010,INN_X1=1270;     // 보부상 숙소
const STORE_X=1500;                // 숙소 창고 (그믐 밤에 눈도깨비가 나타난다)
const FOREST_X=1640;               // 뒷산 소나무 숲
const night=()=>G.f.night;
// 결정 D-87: 그믐밤 창고 지키기를 맡은 뒤, 창고에 다가갈수록 긴장이 오른다. 도깨비를 달래거나 이기면 0.
Rg.moodTension=()=>{
  if(!G.started||G.boss.dead||!G.f.guard||!night()||(!CLASSIC&&G.zone!=='warehouse'))return 0;
  return clamp(1-(Math.abs(Rg.STORE_X-G.px)-40)/700,0,1);
};

/* ---------- 배경 ---------- */
function ridge(par,col,base,amp,freq){ctx.fillStyle=col;for(let x=0;x<W;x+=2){const wx=x+RC()*par;const h=base-Math.sin(wx*freq)*amp-Math.sin(wx*freq*2.7+1)*amp*0.35;ctx.fillRect(x,Math.round(h),2,H-Math.round(h));}}
function drawSky(){
  const g=ctx.createLinearGradient(0,0,0,H);
  if(night()){g.addColorStop(0,'#141a2e');g.addColorStop(.6,'#262c48');g.addColorStop(1,'#3a3a54');}
  else{g.addColorStop(0,'#dfe4ea');g.addColorStop(.6,'#c4ccd6');g.addColorStop(1,'#aeb6c2');}
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  if(night()){for(let i=0;i<40;i++){const x=Math.round((hash(i*9.1)*W*1.4-RC()*0.02)%W+W)%W,y=Math.round(hash(i*3.3)*90);R(x,y,1,1,i%5?'#c8d0e8':'#fff6d8');}
    R(Math.round(70-RC()*0.02),24,2,10,'#e8e0c0');}   // 그믐 전 가는 달
  else{const sx=Math.round(320-RC()*0.03);R(sx,30,14,14,'#f8f6ee');R(sx-2,33,18,8,'#f8f6ee');}
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
  Rg.drawSnowPresence();
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
Rg.drawPickup=(a,x,bob)=>{
  // 결정 D-318: 짐짝에서 샌 콩과 마구간에서 흘린 짚도 줍는다. 솔방울이 아닌 것은 그 모양으로.
  // 결정 D-393: 콩은 마른 꼬투리 하나가 벌어져 둥근 콩알이 굴러 나왔다(콩알마다 검은 배꼽)
  if(a.item==='kong'){R(x-6,a.y-2,5,2,'#b89a5a');R(x-6,a.y-2,5,1,'#cdb070');R(x-5,a.y-1,3,1,'#8a7040');
    for(const [dx,dy] of [[0,-3],[2,-2],[-1,-2]]){R(x+dx,a.y+dy+bob,2,2,'#e2cf8a');R(x+dx,a.y+dy+bob,1,1,'#f4e6b0');R(x+dx+1,a.y+dy+1+bob,1,1,'#6a5a3a');}return;}
  if(a.item==='jip'){R(x-5,a.y-3+bob,10,2,'#d9b860');R(x-4,a.y-5+bob,8,2,'#c9a850');R(x-1,a.y-6+bob,2,6,'#a8883a');return;}
  drawPineCone(x,a.y+bob,true);};   // 결정 D-393

/* 눈 */
const snow=Array.from({length:36},()=>({x:Math.random()*W,y:Math.random()*H,s:0.25+Math.random()*0.45,p:Math.random()*6}));
Rg.ambient=()=>{for(const l of snow){l.y+=l.s;l.p+=0.02;l.x+=Math.sin(l.p)*0.3-0.08;if(l.y>H){l.y=-3;l.x=Math.random()*W;}if(l.x<-3)l.x=W+2;}};
Rg.drawFront=()=>{for(const l of snow)R(l.x,l.y,Math.sin(l.p)>0.3?2:1,Math.sin(l.p)>0.3?2:1,'#ffffff');
  if(night()){ctx.fillStyle='rgba(10,14,40,.18)';ctx.fillRect(0,0,W,H);}};

/* ---------- 진행 ---------- */
Rg.maxX=()=>2330;
Rg.step=()=>{
  // 같은 출처에서 확장 저장을 옛 구성으로 비교해도 구역 태그 때문에 채집물이 사라지지 않는다.
  if(CLASSIC&&G.pickups.some(a=>a.zone)){
    G.pickups=Rg.newState().pickups;G.px=60;G.py=GROUND;G.vy=0;G.cam=0;
  }
  Rg.snowEncounter();   // 결정 D-684: 창고를 지키면 기척이 먼저 다가온다
  if(has('hongsi_tteok')&&!G.f.hongsiMade)Rg.sendMedicine();
};
Rg.onHit=()=>{};
Rg.faint=()=>{G.px=Math.max(60,G.px-80);toast('눈길에 미끄러져 물러났다');};
/* 도깨비를 이기거나 달래면 훔쳐 간 설 제수가 돌아온다. 눈홍시는 보따리로 */
Rg.bossDie=calm=>{
  G.boss.dead=true;addItem('nunhongsi',1);
  if(Rg.arcs())G.f.jangteoArcsScissorsFound=true;
  diary('j_boss','창고를 털던 범인은 닳은 싸리비가 그믐 눈밤에 둔갑한 눈도깨비였다. 몸을 감추고 들어와 물건을 가져갔고, 발자국은 밤새 내린 눈이 덮었다. 종종이가 들은 사락사락은 긴 옷자락이 눈에 끌리는 소리였다. 훔쳐 간 설 제수가 돌아왔다.'+(calm?' 도깨비는 눈홍시를 하나 더 내밀었다.':' 창고를 지킨 몫으로 눈홍시 하나를 받았다.')+(Rg.arcs()?' 돌아온 물건 사이에 날이 반질한 엿가위도 있었다.'+(G.f.jangteoArcsYeot2?' 작년 그믐에 빼앗겼다던 그 가위일까.':''):'')   /* 결정 D-142: 가위를 본 일은 늘 남긴다 */);   // 결정 D-136: 창고 조사를 안 해도 엿가위를 본 근거
  toast('눈홍시를 얻었다! 시루로 홍시 약떡을 찌자');refreshGoal();
};
Rg.STORE_X=STORE_X;

/* ---------- 결정 D-684: 눈도깨비와 만나기 (사용자 지시 2026-11-05 큰 장터 23) ----------
   창고 문 앞에 서면 잠깐 뒤 오른쪽에서 무언가 천천히 다가온다. 몸을 감춘 눈도깨비라 모습은 없고,
   눈 위에 찍혀 남는 큰 발자국과 옷자락 끌린 자국, 보이지 않는 몸에 휘감기는 눈발, 찬 입김만 보인다(결정 D-766).
   수리부엉이로 변신하면 밤눈에 정체가 드러나고(서리 빛이 번지며 모습이 나타난다), 잠깐 뒤 전투가 열린다.
   결정 D-687: 창고 지키기(G.f.guard)는 부엉 영감의 신표와 함께 켜지고, 수리부엉이 변신도 그 직후(formCheck)에 열린다.
   그래서 수리부엉이 없이 이 자리에 오는 길은 없다. 혹시 없으면(옛 저장) 여기서 연다. 아이는 혼잣말로 '밤눈'을 떠올린다.
   멀리 걸어가면 기척은 물러났다가 다시 오면 처음부터 다가온다. */
let snowEnc=null;
const ENC={delay:34,speed:0.8,start:300,stop:84,reveal:72,stride:16};   // 결정 D-766: 덩치가 커서 조금 떨어져 서고 보폭이 크다
Rg.snowEncounter=()=>{
  if(!G.f.guard||!night()||G.boss.dead||B||inkOn){if(G.boss.dead)snowEnc=null;return;}
  if(!snowEnc){
    if(Math.abs(G.px-Rg.STORE_X)<24&&$('dlg').hidden){
      if(!hasForm('owl'))unlockForm('owl');
      snowEnc={t:0,x:Rg.STORE_X+ENC.start,said:0,reveal:0,steps:[]};G.vx=0;
    }
    return;
  }
  const e=snowEnc;
  if(Math.abs(G.px-Rg.STORE_X)>240){snowEnc=null;return;}
  e.t++;
  if(!e.reveal&&e.t>ENC.delay){const nx=Math.max(Rg.STORE_X+ENC.stop,e.x-ENC.speed);
    if(Math.floor(nx/ENC.stride)!==Math.floor(e.x/ENC.stride))e.steps.push({x:Math.round(nx),t:0,foot:e.steps.length%2});e.x=nx;}
  for(const s of e.steps)s.t++;if(e.steps.length>40)e.steps.shift();   // 결정 D-766: 발자국은 지워지지 않고 남는다
  if(e.said===0&&e.t>ENC.delay+20){e.said=1;
    talk([['너구리','(…사박, 사락. 사박, 사락. 창고 앞 눈이 밟힌다.\n아무도 없는데 큰 발자국만 다가와.)']]);return;}
  if(e.said===1&&e.x<=Rg.STORE_X+ENC.stop&&G.form!=='owl'){e.said=2;
    talk([['너구리','(코앞에서 찬 숨이 느껴져. 뭐가 서 있어.\n밤눈이 밝다면… 보일 텐데.)']]);return;}
  if(!e.reveal&&owlSenses()&&e.t>ENC.delay+10){e.reveal=1;Sound.playSfx?.('battle_warn');}
  if(e.reveal){
    if(e.reveal===1&&!G.f.jxSnowSeen){G.f.jxSnowSeen=true;diary('jx_snow_seen','창고 앞에 큰 발자국만 다가왔다. 수리부엉이 눈으로 보니, 서리 뿔을 이고 어깨옷을 빳빳이 세운 커다란 눈도깨비가 서 있었다. 긴 옷자락이 눈 위에 끌렸다.');}
    if(e.reveal===8)talk([['너구리','(보인다! 서리 뿔에 빳빳한 어깨옷…\n눈도깨비야! 긴 옷자락이 눈에 끌리고 있었어.)']]);
    if(++e.reveal>ENC.reveal){snowEnc=null;Rg.startDokkaebi();}
  }
};
/* 결정 D-766: 도트 눈도깨비. 아이보다 훨씬 큰 덩치로 어깨를 웅크리고 선다 (사용자 지시 2026-11-05 "설화에 나올 만한 모습, 덩치,
   옛 전설의 큰 산짐승 같은 위압감, 그래도 도깨비에 가깝게"). 전투 그림(enemies.js 결정 D-760)과 같은 차림:
   빳빳한 어깨옷과 얼음 비늘 어깨받이, 깃 여민 겉옷과 띠, 눈에 끌리는 통 넓은 바지, 서리 머리와 수염, 가늘게 빛나는 눈, 엄니, 얼음 뿔 하나 */
function nundokSprite(x,a){
  ctx.save();ctx.globalAlpha=a;const g=GROUND,breath=Math.floor(G.anim/50)%2;
  const INKC='#1d1814',ROBE='#1a2230',ROBE_LT='#2a3850',HAK='#222a38',SKIN='#aebcc4',SKIN_DK='#6f8592',SNOW='#f8f6f0',ICE='#d6ebf2',FDK='#4d6c80',GLOW='#a6d6f4',OBI='#5e4a2e',TUSK='#efe8d6';
  {const gl=ctx.createRadialGradient(x,g-60,6,x,g-60,80);gl.addColorStop(0,'rgba(150,200,235,.22)');gl.addColorStop(1,'rgba(150,200,235,0)');ctx.fillStyle=gl;ctx.fillRect(x-80,g-140,160,140);}   // 찬 기운
  // 통 넓은 바지: 아래로 퍼지고 단이 눈에 끌린다
  for(let i=0;i<40;i++){const hw=22+Math.floor(i*0.5);R(x-hw,g-44+i,hw*2,1,HAK);}
  R(x-1,g-16,3,12,'#141a24');for(const dx of [-14,13,-28,27])R(x+dx,g-40+(Math.abs(dx)>20?14:0),1,Math.abs(dx)>20?22:34,ROBE_LT);
  for(let i=0;i<8;i++)R(x-44+i*11,g-5,9,2,SNOW);   // 단에 묻은 눈
  R(x-34,g-4,14,4,SKIN_DK);R(x+20,g-4,14,4,SKIN_DK);for(let k=0;k<3;k++){R(x-35-k*0,g-2+k*0,1,2,INKC);R(x-34+k*4,g-1,2,1,INKC);R(x+30+k*0,g-2,1,2,INKC);R(x+21+k*4,g-1,2,1,INKC);}   // 큰 맨발과 발톱
  // 띠와 겉옷, 흰 깃
  R(x-24,g-51,48,7,OBI);R(x-24,g-48,48,1,'#8a6e44');R(x+8,g-50,6,12,OBI);
  R(x-26,g-82,52,31,ROBE);
  for(let i=0;i<24;i++){R(x-12+i,g-82+i,3,1,SNOW);if(i<16)R(x+12-Math.floor(i*0.75),g-82+i,3,1,SNOW);}
  // 빳빳한 어깨옷: 바깥 끝이 솟는다
  R(x-52,g-90,104,9,INKC);R(x-52,g-91,104,2,SNOW);R(x-48,g-85,96,2,'#2b4a6a');
  R(x-58,g-94,8,9,INKC);R(x+50,g-94,8,9,INKC);R(x-58,g-95,8,1,SNOW);R(x+50,g-95,8,1,SNOW);R(x-58,g-94,1,9,SNOW);R(x+57,g-94,1,9,SNOW);
  for(let i=0;i<5;i++)R(x-50+i*21,g-93,9,2,SNOW);   // 어깨에 앉은 눈
  // 얼음 비늘 어깨받이
  for(const s of [-1,1]){const bx=s<0?x-54:x+38;R(bx,g-81,16,15,ICE);R(bx,g-76,16,1,FDK);R(bx,g-71,16,1,FDK);R(bx+5,g-81,1,15,INKC);R(bx+11,g-81,1,15,INKC);}
  // 굵은 팔과 큰 주먹
  for(const s of [-1,1]){const ax=s<0?x-50:x+40;R(ax,g-66,10,26,SKIN_DK);R(ax+(s<0?2:0),g-60,1,8,INKC);
    const fx=s<0?x-54:x+38;R(fx,g-42,16,14,SKIN);R(fx,g-37,16,1,SKIN_DK);R(fx,g-33,16,1,SKIN_DK);for(let k=0;k<3;k++)R(fx+2+k*5,g-28,2,3,INKC);}
  // 서리 머리: 날 선 가닥이 위로 뻗친다
  R(x-24,g-118,48,8,SNOW);R(x-28,g-124,5,10,SNOW);R(x-19,g-128,5,10,SNOW);R(x+14,g-128,5,10,SNOW);R(x+23,g-124,5,10,SNOW);R(x-9,g-122,4,6,SNOW);
  R(x-26,g-112,9,26,SNOW);R(x+17,g-112,9,26,SNOW);R(x-24,g-104,1,16,'#9dbccb');R(x+23,g-104,1,16,'#9dbccb');
  // 각진 얼굴 (어깨 사이로 낮게)
  R(x-15,g-112,30,16,SKIN);R(x-17,g-100,34,12,SKIN);R(x-15,g-88,30,2,SKIN_DK);
  R(x-12,g-110,24,1,SKIN_DK);R(x-10,g-108,20,1,SKIN_DK);   // 이마 주름
  // 찌푸린 눈두덩과 가늘게 빛나는 눈
  R(x-14,g-106,5,2,INKC);R(x-10,g-105,5,2,INKC);R(x-6,g-104,4,2,INKC);R(x+9,g-106,5,2,INKC);R(x+5,g-105,5,2,INKC);R(x+2,g-104,4,2,INKC);
  R(x-15,g-108,7,2,SNOW);R(x+8,g-108,7,2,SNOW);
  R(x-13,g-102,10,3,'#2a3138');R(x+3,g-102,10,3,'#2a3138');
  {const gl=ctx.createRadialGradient(x,g-101,1,x,g-101,16);gl.addColorStop(0,'rgba(166,214,244,.5)');gl.addColorStop(1,'rgba(166,214,244,0)');ctx.fillStyle=gl;ctx.fillRect(x-16,g-117,32,32);}
  R(x-12,g-101,8,1,GLOW);R(x+4,g-101,8,1,GLOW);R(x-9,g-101,2,1,'#eaf7ff');R(x+7,g-101,2,1,'#eaf7ff');
  // 넓은 코, 다문 입, 솟은 엄니
  R(x-3,g-99,6,4,SKIN_DK);R(x-4,g-96,2,1,INKC);R(x+2,g-96,2,1,INKC);
  R(x-10,g-92,20,2,INKC);R(x-11,g-91,2,1,INKC);R(x+9,g-91,2,1,INKC);
  R(x-10,g-96,2,4,TUSK);R(x+8,g-96,2,4,TUSK);
  // 가슴까지 내려온 흰 수염과 고드름
  R(x-14,g-89,28,6,SNOW);R(x-11,g-83,22,6,SNOW);R(x-7,g-77,14,5,SNOW);R(x-3,g-72,6,4,SNOW);
  R(x-8,g-71,2,4,ICE);R(x+5,g-71,2,3,ICE);R(x,g-68,2,4,ICE);
  // 얼음 뿔: 이마에서 솟아 뒤로 휜다, 곁가지 송곳
  for(let i=0;i<26;i++){const w=Math.max(1,Math.round(7-i*0.26)),ox=Math.round(Math.pow(i/26,2)*13);
    R(x-4+ox,g-114-i,w,1,ICE);R(x-4+ox,g-114-i,1,1,FDK);if(i%3===0&&w>2)R(x-2+ox,g-114-i,1,1,'#ffffff');}
  R(x+6,g-127,4,2,ICE);R(x+9,g-129,2,2,ICE);R(x+9,g-136,3,1,ICE);
  R(x-8,g-116,12,3,SNOW);
  if(breath){const k=(G.anim%50)/50;ctx.globalAlpha=a*0.45*(1-k);R(x+12+k*12,g-92-k*8,5+k*6,3,'#f4f6f8');}   // 찬 입김
  ctx.restore();
}
/* 결정 D-766: 몸을 감춘 동안. 큰 발자국이 찍혀 남고(옷자락이 끌린 자국이 곁에 남는다), 보이지 않는 큰 몸에 눈발이
   세차게 휘감기고 미끄러져 떨어진다. 옆으로는 눈바람이 날린다. 수리부엉이 눈이면 서리 빛 속에 모습이 드러난다 */
Rg.drawSnowPresence=()=>{
  const e=snowEnc;if(!e)return;const x=e.x-cam;
  for(const s of e.steps){const sx=s.x-cam,o=s.foot?0:3;ctx.save();ctx.globalAlpha=0.85;
    R(sx-8,GROUND+o,16,4,'#eef3f8');R(sx-6,GROUND+1+o,12,2,'#262d3a');R(sx-7,GROUND+o,2,1,'#262d3a');R(sx-3,GROUND+o-1,2,1,'#262d3a');R(sx+1,GROUND+o-1,2,1,'#262d3a');R(sx+5,GROUND+o,2,1,'#262d3a');   // 큰 맨발 자국과 밀려난 눈
    ctx.globalAlpha=0.7;R(sx-14,GROUND+6,22,1,'#dfe7ef');R(sx-12,GROUND+7,18,1,'#9aa8b8');   // 옷자락이 끌린 자국
    if(s.t<10){ctx.globalAlpha=0.8*(1-s.t/10);R(sx-8-s.t,GROUND-3-s.t,3,3,'#f4f6f8');R(sx+6+s.t,GROUND-2-s.t,3,3,'#f4f6f8');}
    ctx.restore();}
  if(!e.reveal){
    const t=G.anim;
    ctx.save();
    {const fl=0.1+0.05*Math.sin(t*0.08);ctx.globalAlpha=fl;ctx.fillStyle='#e6eef6';   // 큰 몸 꼴로 어리는 눈 안개 (어깨가 넓고 머리가 낮다)
      ctx.beginPath();ctx.ellipse(x,GROUND-50,32,50,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x,GROUND-88,52,9,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x,GROUND-104,16,14,0,0,Math.PI*2);ctx.fill();}
    for(let i=0;i<80;i++){const q=t*0.09*(i%2?1:-0.8)+i*0.55,rx=26+(i%5)*7,ry=44+(i%3)*10,sz=i%4?2:3;   // 보이지 않는 몸을 휘감는 눈발
      ctx.globalAlpha=0.65+0.35*hash(i);R(x+Math.cos(q)*rx,GROUND-60+Math.sin(q*1.15)*ry,sz,sz,i%2?'#ffffff':'#d6e2ee');}
    for(let i=0;i<24;i++){const k=((t*0.025+hash(i*3.7))%1),px=x-52+hash(i*5.1)*104,top=GROUND-92+Math.abs(px-x)*0.1;   // 어깨에서 미끄러져 떨어지는 눈
      ctx.globalAlpha=0.9*(1-k);R(px,top+k*86,3,3,'#ffffff');}
    for(let i=0;i<30;i++){const k=((t*0.035+hash(i*9.1))%1),sx=x+110-k*240,sy=GROUND-130+hash(i*2.9)*126;   // 옆으로 날리는 눈바람
      ctx.globalAlpha=0.75*Math.sin(k*Math.PI);R(sx,sy,10+Math.floor(hash(i)*10),i%3?1:2,'#f4f6f8');}
    for(let i=0;i<8;i++){const q=t*0.15+i*0.8;ctx.globalAlpha=0.7;R(x-30+i*8+Math.cos(q)*3,GROUND-4-Math.abs(Math.sin(q))*7,4,3,'#f4f6f8');}   // 발치에서 이는 눈
    if(Math.floor(t/40)%2===0){const k=(t%40)/40;ctx.globalAlpha=0.6*(1-k);R(x-10-k*10,GROUND-96-k*8,6+k*8,4,'#f4f6f8');}   // 찬 입김
    ctx.restore();
    return;}
  const k=Math.min(1,e.reveal/24);
  {const gl=ctx.createRadialGradient(x,GROUND-60,4,x,GROUND-60,90);gl.addColorStop(0,'rgba(166,214,244,'+(0.6*(1-k*0.6)).toFixed(3)+')');gl.addColorStop(1,'rgba(166,214,244,0)');
    ctx.save();ctx.fillStyle=gl;ctx.fillRect(Math.round(x-92),GROUND-150,184,150);ctx.restore();}   // 서리 빛이 번지며 드러난다
  nundokSprite(Math.round(x),k);
};

/* PA-43 [개발자 결정]. 옛 장터는 위에 그대로 두고, 확장에서는 구역 안 좌표만 쓴다.
   필수: 입구 → 거리 → 숙소(밤) → 거리/솔숲 → 시루/고사떡 → 숙소 → 창고.
   결정 D-316: 구역 사이는 실제로 이어진 길로만 오간다 (사용자 피드백 2026-11-02 "순간이동 기믹 빼라").
   예전의 지붕길 문(입구 지붕↔거리 지붕↔솔숲 능선), 밤 골목 지름길(거리 한가운데↔숙소 한가운데), 창고의 '귀환 문'은 뺐다.
   결정 D-317: 건물은 들어간 곳으로 나온다. 떡집은 앞이 트인 땅 위 가게라 문 없이 걸어 들어가고, 숙소 마당도 걸어서 드나든다.
   숙소와 창고 마당은 숙소 오른쪽 끝 창고 쪽문(가장자리) 하나로만 잇는다. */
if(!CLASSIC){
  Rg.startZone='entrance';Rg.STORE_X=2320;
  // 결정 D-109: 빈 걷기 구간 줄이기 (engine/core.js trimRegion). [시작, 지울 길이] — 설계 좌표.
  // 장터 입구: 지붕길 문(1310) 뒤 빈 길 1290px → 410px (물건 없는 발판 무리를 지운다). 숙소 창고: 빈 마당과 빈 발판 무리 두 곳을 지운다.
  Rg.trimCutsV1={entrance:[[1400,880]],warehouse:[[800,900],[1800,380]]};   // 첫 판(D-109) — 옛 저장을 옮길 때 쓴다
  // 결정 D-116: 숙소 창고문(2130) 뒤 오른쪽 출구까지 빈 마당과 빈 처마 계단(2190~2490)을 지운다.
  Rg.trimCutsV2={entrance:[[1400,880]],inn:[[2190,300]],warehouse:[[800,900],[1800,380]]};   // 둘째 판(D-116) — 옛 저장을 옮길 때 쓴다
  // 결정 D-128: 걷기만 하는 길을 콘텐츠 사이 230px 안팎으로. 장터 입구 솔방울·깃발·연 날리는 아이(얼레) 사이 두 곳과 눈 장승 뒤 출구 앞, 숙소 들어선 자리와 신발 사이.
  Rg.trimCuts={entrance:[[465,135],[830,60],[1400,880],[2390,90]],inn:[[180,50],[2190,300]],warehouse:[[800,900],[1800,380]]};
  Rg.trimHook=tX=>{Rg.STORE_X=tX(Rg.STORE_X,Rg.trimCuts.warehouse);};
  Rg.trimMigrateHook=g=>{if(g.boss)g.boss.x=Rg.STORE_X;};
  const originalState=Rg.newState;
  Rg.newState=()=>{const s=originalState();s.pickups=[];s.boss.x=Rg.STORE_X;return s;};
  const peg=(x,y)=>{R(x-1,y-17,2,17,'#6b4934');R(x-9,y-19,18,7,'#ead4a6');R(x-6,y-17,11,1,'#784b36');};
  const glint=(x,y)=>pawStamp(x,y,'#a85344');
  // 결정 D-319: 뒷산 돌계단 들머리의 작은 말뚝 (계단 그림은 art.js 거리·솔숲 배경)
  const stairPost=(x,y)=>{R(x-1,y-15,3,15,'#6b4934');R(x-6,y-18,13,5,'#ead4a6');R(x-4,y-16,9,1,'#784b36');R(x+3,y-17,3,3,'#784b36');};
  const shutter=(x,y)=>{R(x-17,y-35,34,35,'#705346');for(let i=0;i<5;i++)R(x-15+i*6,y-33,2,30,'#987459');R(x-18,y-22,36,3,'#b64e41');};
  const gate=(x,y)=>{R(x-20,y-48,4,48,'#604635');R(x+16,y-48,4,48,'#604635');R(x-24,y-49,48,6,'#31434d');R(x-22,y-51,44,2,'#e6eaf0');if(!night()||!has('sinpyo')){R(x-16,y-23,32,3,'#ac4c43');R(x-12,y-27,24,1,'#dba56c');}};
  const needWarehouse=()=>night()&&has('sinpyo');
  const warehouseReason='신표를 받은 뒤, 숙소 마루에서 밤을 기다리자.';
  // 결정 D-48: 좌판·처마 계단의 아래 두 칸은 자리마다 높이·너비가 조금씩 다르다(고정 시드). 맨 위 처마는 그대로다.
  // keep: 솔방울이 놓인 칸(0 아래, 1 가운데)은 그대로 둔다. 한 칸 차이는 34px 안이라 점프로 오른다.
  const stairs=(x,top=96,keep=[])=>{
    let s=(x*2654435761)>>>0;const rnd=()=>(s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296;
    const low=keep.includes(0)?160:156+Math.round(rnd()*8),lx=keep.includes(0)?x:x-6+Math.round(rnd()*12),lw=keep.includes(0)?80:70+Math.round(rnd()*22);
    const mid=keep.includes(1)?128:clamp(Math.round(low-24-rnd()*12),Math.max(top,low-34),Math.min(top+34,low-14));
    const mx=keep.includes(1)?x+90:x+80+Math.round(rnd()*18),mw=keep.includes(1)?90:80+Math.round(rnd()*20);
    return [{x:lx,y:low,w:lw},{x:mx,y:mid,w:mw},{x:x+180,y:top,w:120}];
  };
  const cones=(zone,coords)=>coords.map(([x,y],i)=>({id:'j_'+zone+'_fuel_'+i,x,y:y??GROUND,item:'solbang',got:false}));
  let viewedZone=null,depthDirection=0,lastFade=0;
  const common=id=>({ground:GROUND,startX:70,
    // 결정 D-128: 확대 변환은 장면 전체에 한 번 건다(나눠 그리기 밖). 그리기는 drawBack에서.
    sceneBegin(){
      // 전경과 원경 사이의 문도 기존 구역 API로 이동한다. 지역 그리기에서만 짧게 확대한다.
      if(viewedZone!==id){
        depthDirection=(viewedZone==='street'&&id==='pine')||(viewedZone==='inn'&&id==='warehouse')?1:
          (viewedZone==='pine'&&id==='street')||(viewedZone==='warehouse'&&id==='inn')?-1:0;
        viewedZone=id;
      }else if(zoneFade>lastFade)depthDirection=0;
      lastFade=zoneFade;
      const depth=zoneFade>0&&depthDirection&&!Vfx.reducedMotion;
      ctx.save();if(depth){const z=1+depthDirection*zoneFade/(H/2);ctx.translate(W/2,H/2);ctx.scale(z,z);ctx.translate(-W/2,-H/2);}
    },
    drawBack(){Rg.expArt.drawBack(id);},
    sceneEnd(){ctx.restore();},
    drawScenery(){Rg.expArt.drawScenery(id);},
    // 흔들 소나무: 솔숲 앞줄의 작은 소나무. 칠수록 가지가 흔들린다.
    drawDig(d,x){
      if(d.item!=='solbang')return false;
      const y=d.y??GROUND,sway=d.done||Vfx.reducedMotion?0:Math.round(Math.sin(G.anim*0.3+d.x)*(d.prog?1.5:.5));x=Math.round(x);
      R(x-2,y-34,4,34,'#6b4423');R(x-2,y-34,1,34,'#8a5a2b');
      for(const [dy,w] of [[-44,12],[-38,18],[-31,22]]){R(x-w/2+sway,y+dy,w,5,'#2f5a3a');R(x-w/2+1+sway,y+dy,w-2,1,'#4f7a4f');}
      if(!d.done)for(const [dx,dy] of [[-6,-28],[4,-34],[7,-26]])R(x+dx+sway,y+dy,2,3,'#8a5a2b');
      return true;
    },
    drawPickup:Rg.drawPickup,onHit:Rg.onHit,ambient:Rg.ambient,
    weather:()=>{if(Rg.springRevisit())Vfx.setWeather('');else Rg.weather();},
    weatherFront(){Rg.expArt.drawFront?.(id);},
    faint(){G.px=Math.max(60,G.px-80);G.py=GROUND;G.vy=0;toast('눈을 털고 다시 걸었다.');},
    step(){
      const legacy=G.pickups.filter(a=>a.item==='solbang'&&!a.zone);
      if(legacy.length){
        const pine=G.pickups.filter(a=>a.zone==='pine');
        legacy.forEach((a,i)=>{if(a.got&&pine[i])pine[i].got=true;});
        G.pickups=G.pickups.filter(a=>a.zone||a.item!=='solbang');
      }
      // 결정 D-131: 까치 곁에 오면 한 번씩 먼저 말을 건다. 밤엔 쉬어 가자 하고, 설날 아침엔 맡길지 묻는다. 바로 보내지 않는다.
      if(id==='inn'&&Math.abs(G.px-tx(1530))<45&&!open('dlg')){
        const key=night()?'jxMagpieNight':'jxMagpieMorning',l=!G.f[key]&&Rg.magpieTteok?.();
        if(l){G.f[key]=true;talk(l,refreshGoal);}
        // 결정 D-290: 등을 다 단 뒤 까치 곁에 오면 길손이 맡긴 곶감을 건넨다(한 번)
        else if(G.f.jxLanternDone&&!G.f.jxLanternPaid&&!open('dlg'))Rg.lanternThanks?.();
      }
      if(id==='warehouse')Rg.snowEncounter();   // 결정 D-684
      if(isAwake('siru')&&!G.f.jxHubChanged&&id==='street'){
        G.f.jxHubChanged=true;diary('jx_hub','모락이 쌀가루로 떡을 다시 찌자 떡집 앞에 길게 섰던 줄이 짧아졌다. 모락의 김이 골목 끝까지 번졌다.');
        toast('떡집 앞 줄이 짧아졌다.');
      }
    },
  });
  const E=Rg.expEncounters;
  /* 결정 D-564: 늙은 까치의 등 달기는 까치가 앉은 숙소 구역 안에서 끝낸다 (사용자 지시 2026-11-04 "딱 그 지역에서 완료할 수 있게").
     예전엔 거리 골목과 솔숲 입구에도 하나씩 있어 등 꾸러미를 들고 구역을 둘 건너야 했다. 길손이 찾는 건 숙소라 숙소 마당 어귀·마루 앞·처마 끝·창고 쪽문 가는 길에 단다.
     id는 옛 저장과 맞추려고 그대로 둔다(alley·pine은 이제 숙소 마당 어귀와 처마 끝 걸이다). */
  Rg.lanternPoints=[
    {id:'alley',zone:'inn',x:800,y:GROUND},
    {id:'porch',zone:'inn',x:1380,y:GROUND},
    {id:'pine',zone:'inn',x:1690,y:GROUND},
    {id:'gate',zone:'inn',x:2000,y:GROUND},
  ];
  // getter를 다시 읽어도 같은 대상을 찾도록 활동 오브젝트는 한 번만 만든다.
  const lanterns=Rg.lanternPoints.map(p=>({
    ...p,id:'j_lantern_'+p.id,
    get name(){return G.f.jxLanterns?.[p.id]?'불 켠 등':'빈 등걸이';},
    get prompt(){return G.f.jxLanterns?.[p.id]?'등불 아래 살펴보기':'등걸이에 등 달기';},
    draw:(x,y)=>Rg.expArt.drawWorkLantern(x,y,!!G.f.jxLanterns?.[p.id]),
    talk:()=>Rg.lanternAction(p.id),
  }));
  const nightLanterns=zone=>night()?lanterns.filter(p=>p.zone===zone):[];
  // 결정 D-325·D-562: 노인들 곁의 판돈 바구니. 말을 걸면 바둑 내기에 편을 든다 (story.js Rg.playBaduk). 화살통은 투호와 함께 뺐다.
  const yutBoard={id:'j_yut_board',name:'판돈 바구니',get prompt(){return Rg.badukBetting?.()===false?'바둑 구경하기':'바둑 내기에 편 들기';},x:1960,y:GROUND,
    draw(x,y){
      R(x-7,y-7,14,7,'#a07a4a');R(x-8,y-8,16,2,'#c39b62');for(let i=0;i<4;i++)R(x-6+i*4,y-5,2,4,'#8a6538');   // 짚 바구니
      R(x-5,y-11,4,4,'#7a5232');R(x,y-12,4,5,'#8a5a32');R(x+3,y-10,3,3,'#7a5232');R(x-4,y-10,2,1,'#b98a52');R(x+1,y-11,2,1,'#b98a52');   // 솔방울
    },
    talk:()=>Rg.playBaduk(),
  };
  const lanternBundle={id:'j_lantern_bundle',name:'등불 꾸러미',prompt:'까치와 등불 꾸러미 풀기',x:1610,y:GROUND,
    draw(x,y){
      R(x-9,y-10,18,10,'#91704f');R(x-7,y-13,14,4,'#c3a26f');
      R(x-1,y-12,2,12,'#dfc88e');R(x-4,y-14,8,2,'#69523b');
      Rg.expArt.lantern(x+6,y-18,1,false);
    },
    talk:()=>Rg.lanternTalk(),
  };
  Rg.zones={
    entrance:{...common('entrance'),name:TABLES.ZONES.jangteo.entrance,w:2600,npcs:[],
      platforms:[...stairs(1040),...stairs(1980)],
      // 결정 D-82: 솔방울은 뒷산 솔숲에서 모은다. 결정 D-563: 어귀의 첫 솔방울은 청설모 할아범(360) 발치와 겹쳐 있어 길 안쪽(460)으로 옮겼다 (사용자 피드백 2026-11-04)
      pickups:cones('entrance',[[460,192]]),
      exits:{right:{to:'street',toX:60}},
      doors:[],   // 결정 D-316: 지붕길 문(→거리 지붕)은 뺐다
      wanderers:E.wanderers.entrance,examines:E.examines.entrance,
      stamps:[{id:'flag',x:720,note:'stamp:jangteo:flag',draw:glint,base:'none',face:18}],   // D-116: 깃대에 바로 찍는다(받침 겹침 없음)
    },
    street:{...common('street'),name:TABLES.ZONES.jangteo.street,w:2800,npcs:['morak','yeotbang','nal'],
      // 결정 D-315·D-316: 공중에 뜬 긴 지붕(610·2550)과 떡집 높은 마루(1250, y110)는 뺐다. 처마 계단 둘만 남는다.
      platforms:[...stairs(430),...stairs(2370)],
      pickups:cones('street',[[850,192]]),
      exits:{left:{to:'entrance',toX:2530},right:{to:'inn',toX:60}},
      // 결정 D-316·D-319: 문은 뒷산 돌계단 하나. 솔숲에서 내려오면 같은 돌계단 아래로 나온다.
      doors:[{x:2180,to:'pine',toX:70,label:'뒷산 돌계단 오르기',ascend:true,draw:stairPost}],
      get wanderers(){return [...E.wanderers.street,yutBoard,...nightLanterns('street')];},examines:E.examines.street,
    },
    inn:{...common('inn'),name:TABLES.ZONES.jangteo.inn,w:2600,npcs:['bueong','maru'],
      platforms:[...stairs(1160),{x:1340,y:96,w:100},...stairs(1590,128),{x:1770,y:128,w:200},...stairs(2220)],
      pickups:cones('inn',[[445,192]]),
      digs:[{id:'j_cache_inn',x:560,item:'solbang',n:2,form:'squirrel',cache:true,done:false}],
      exits:{left:{to:'street',toX:2720},right:{to:'warehouse',toX:60,need:needWarehouse,reason:warehouseReason,drawBlocked:gate}},
      doors:[],   // 결정 D-316·D-317: 숙소 문·마당 문(같은 구역 안 건너뛰기), 밤 골목 지름길, 창고문(창고 마당 엉뚱한 자리로)은 뺐다. 창고는 오른쪽 끝 쪽문으로
      get wanderers(){return [...E.wanderers.inn,lanternBundle,...nightLanterns('inn')];},examines:E.examines.inn,
      stamps:[{id:'pillar',x:1280,y:128,note:'stamp:jangteo:pillar',draw:glint,base:'none',face:10}],   // D-116: 숙소 기둥에 바로 찍는다
      vistas:[{id:'icicles',x:1850,y:128,from:0,to:420,sound:'wind',draw:peg,
        thought:'고드름 속 지붕이다.\n저 푸른 문도 가 보고 싶어.',
        diary:'숙소 마루에서 고드름 너머 장터 지붕을 보았다. 처마 사이로 창고의 푸른 문이 보인다.',layers:Rg.expArt.innVista}],
    },
    pine:{...common('pine'),name:TABLES.ZONES.jangteo.pine,w:2800,npcs:[],
      // 840 헛간 지붕은 720 처마에서 수리부엉이가 날개를 펴야 닿는다 (PA-47 선택 자리)
      platforms:[...stairs(420),...stairs(1100,96,[1]),...stairs(2180,96,[0]),{x:2390,y:96,w:340},{x:842,y:124,w:56}],
      // 결정 D-82: 솔숲의 소나무 흔들기 세 곳 (채집 고리 D-41)
      digs:[{id:'j_cache_pine',x:1700,item:'kong',n:2,form:'squirrel',cache:true,done:false},
        {id:'j_pine_shake_1',x:960,item:'solbang',done:false},{id:'j_pine_shake_2',x:1620,item:'solbang',done:false},{id:'j_pine_shake_3',x:2080,item:'solbang',done:false}],
      // 결정 D-207: 솔방울이 같은 간격으로 늘어서지 않게 떨어진 자리를 들쭉날쭉하게 (사용자 피드백 58). 높은 칸의 것은 그 칸 안에서만 옮긴다.
      // 결정 D-391: 열넷은 너무 많았다. 소나무 밑과 바위턱에 여덟만 (엿방울 몫 다섯과 갈래 셋에 넉넉하고, 모자라면 쉬는 사이 다시 떨어진다 D-79)
      pickups:[...cones('pine',[[232,192],[612,96],[700,192],[1040,192],[1270,128],[1500,192],[2250,160],[2600,96]]),
        {id:'j_owl_roof_cone_1',x:853,y:124,item:'solbang',got:false},{id:'j_owl_roof_cone_2',x:884,y:124,item:'solbang',got:false}],
      // 결정 D-44: 뒷산에서 장터로는 등을 보이며 기어 내려간다 (engine/field.js startCrawl)
      // 결정 D-319: 올라온 돌계단으로 내려가 거리의 그 돌계단 아래(2180)로 나온다. 지붕길 문(→거리 지붕)은 뺐다(D-316).
      doors:[{x:70,to:'street',toX:2180,label:'돌계단 따라 장터로 내려가기',descend:true,draw:stairPost}],
      exits:{left:{to:'street',toX:2180}},
      get wanderers(){return night()?[...E.wanderers.pine,...nightLanterns('pine')]:[];},examines:E.examines.pine,
      stamps:[{id:'rock',x:2410,y:96,note:'stamp:jangteo:rock',draw:glint}],
      vistas:[{id:'lantern_river',x:2570,y:96,from:0,to:420,sound:'wind',draw:peg,
        get thought(){return night()?'등불이 쭉 이어졌네.\n엄마 방에도 달아 드릴까.':'깃발 아래서 김이 올라오네.\n아까 그 떡집이다.';},
        diary:'뒷산 솔숲 꼭대기에서 장터를 내려다봤다. 굴뚝과 깃발이 길을 가리키고, 밤이면 등불이 강물처럼 이어진다.',layers:Rg.expArt.pineVista}],
    },
    warehouse:{...common('warehouse'),name:TABLES.ZONES.jangteo.warehouse,w:2600,npcs:[],
      platforms:[...stairs(460),...stairs(1230),...stairs(1840),...stairs(2340)],
      pickups:cones('warehouse',[[676,192],[752,192]]),   // D-207 · D-391: 땔감 더미에서 흘린 둘
      exits:{left:{to:'inn',toX:2490}},
      doors:[],   // 결정 D-316·D-317: 숙소로는 들어온 쪽문(왼쪽 가장자리)으로만 돌아간다
      examines:E.examines.warehouse,
      get wanderers(){return E.wanderers.warehouse||[];},   // 결정 D-568: 도깨비를 잡은 그믐 밤엔 상단 행수와 종종이가 창고 마당에 있다 (story.js)
      drawActors(){
        const x=Rg.STORE_X-cam;R(x-38,GROUND-58,76,58,'#493d3b');R(x-44,GROUND-62,88,5,'#243b48');R(x-44,GROUND-64,88,2,'#dbe8ed');
        R(x-15,GROUND-41,30,41,'#222f3a');R(x-2,GROUND-41,3,41,'#678393');
        if(!G.boss.dead){R(x-24,GROUND-27,4,5,'#72b4c7');R(x+22,GROUND-18,3,5,'#a8d4d6');}
        else{R(x-21,GROUND-11,13,10,'#9b724c');R(x+9,GROUND-13,12,12,'#d1ab67');}
        Rg.drawSnowPresence();
      },
    },
  };
  /* 결정 D-265: 장터 골목에도 주울 것을 조금 둔다 (사용자 피드백 2026-11-02 "빈 곳이 너무 많다").
     장터에는 풀숲이 없으니 땔감 지게와 아궁이 장작단에서 흘린 솔방울(불쏘시개)만, 처마 위에는 바람에 얹힌 것만 둔다.
     솔숲은 이미 촘촘해 그대로 둔다. 좌표는 길을 줄인 뒤의 자리. */
  /* 결정 D-391 (사용자 피드백 2026-11-03: 너무 많고 다양하지 않다): 골목 바닥의 솔방울은 거두고, 처마 위에 바람이 얹은 것만 셋 남긴다
     (뛰어올라야 닿는 자리). 솔방울은 뒷산 솔숲에서 줍는다(숙소에서 쉬면 다시 떨어진다). */
  addZoneGather(Rg,'j_g_',[
    ['entrance','p',1080,'solbang',{y:96}],['street','p',2600,'solbang',{y:96}],['inn','p',1905,'solbang',{y:128}],
  ]);
  /* 결정 D-318: 쓸모없이 걷기만 하던 자리에 장터다운 주울 것을 조금 더 (사용자 피드백 2026-11-02 "콘텐츠와 수집품으로 채워라").
     마구간 여물통 곁에 흘린 짚, 창고 마당 짐짝 틈으로 샌 콩. 장꾼이 팔 물건은 줍지 않는다. 좌표는 길을 줄인 뒤의 자리.
     결정 D-391: 짚 하나, 콩 둘로 줄인다. */
  addZoneGather(Rg,'j_g2_',[
    ['inn','p',2042,'jip'],
    ['warehouse','p',470,'kong'],['warehouse','p',1150,'kong'],
  ]);
  /* 결정 D-665: 수리부엉이만 느끼는 숨은 물건 (사용자 피드백 2026-11-05). 수리부엉이로 곁을 지나면 "무언가 느껴진다"며 드러난다.
     장꾼이 흘리고 잊은 녹두, 장꾼 아이가 떨군 약과, 숙소 처마 밑에 숨겨 둔 꿀, 솔숲 솔가리 밑 송이. 좌표는 길을 줄인 뒤의 자리 */
  addZoneGather(Rg,'j_owl_',[
    ['entrance','p',700,'mung',{hidden:'owl'}],['street','p',1040,'yakgwa',{hidden:'owl'}],
    ['inn','p',1350,'honey',{hidden:'owl'}],['pine','p',1390,'songi',{hidden:'owl'}],
  ]);
  // 길손의 조사에는 배경과 구별되는 작고 일정한 표지를 쓴다. 숨은 도장은 표지를 붙이지 않는다.
  for(const z of Object.values(Rg.zones))for(const p of z.examines)p.draw=p.draw||((x,y)=>{R(x-2,y-6,5,4,'#caa970');R(x,y-10,1,2,'#f6ead0');});
}
})();
