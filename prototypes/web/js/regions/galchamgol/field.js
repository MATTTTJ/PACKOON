'use strict';
/* 단풍골 필드: 늦가을 하늘과 언덕, 초가집과 물레방아, 당산나무, 길을 막는 칡덩굴, 덩굴 몹, 엉킨 칡, 낙엽 */
(()=>{
const Rg=REGIONS.galchamgol;
const TREE_X=2214;
const KUDZU_AT=1955;   // 이보다 오른쪽으로 가면 엉킨 칡과 전투

/* ---------- 배경 ---------- */
function hills(par,col,base,amp,freq){ctx.fillStyle=col;for(let x=0;x<W;x+=2){const wx=x+cam*par;const h=base-Math.sin(wx*freq)*amp-Math.sin(wx*freq*2.3+1)*amp*0.4;ctx.fillRect(x,Math.round(h),2,H-Math.round(h));}}
function drawSky(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#f7dcab');g.addColorStop(.55,'#eeaa6c');g.addColorStop(1,'#d27a4a');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const sx=Math.round(318-cam*0.03);R(sx,34,18,18,'#fff0c8');R(sx-2,38,22,10,'#fff0c8');R(sx+4,30,10,26,'#fff0c8');
  for(let i=0;i<3;i++){const cx=Math.round(((i*160+40)-cam*0.06)%560+560)%560-80;R(cx,24+i*14,34,4,'#fbe7c4');R(cx+6,20+i*14,20,4,'#fbe7c4');}
  hills(0.15,'#c98a76',128,22,0.010);
  hills(0.3,'#a8654f',146,18,0.016);
  for(let i=-1;i<10;i++){
    const wx=Math.floor((cam*0.55)/60)*60+i*60;const x=Math.round(wx-cam*0.55);const r=hash(wx);
    const h=30+r*16;const col=['#c9652c','#d98a2f','#b7462a'][Math.floor(r*3)];
    R(x+12,GROUND-18-h*0.4,4,h*0.6,'#5b3a26');
    R(x,GROUND-26-h,28,h*0.7,col);R(x+4,GROUND-32-h,20,8,col);
  }
}
function drawGround(){
  R(0,GROUND,W,H-GROUND,'#5b3a22');R(0,GROUND,W,3,'#8b5a2b');
  const s=Math.floor(cam);
  for(let x=0;x<W;x+=3){const wx=x+s-(s%3);const r=hash(wx);
    if(r<0.35)R(x-(s%3),GROUND-1,2,1,r<0.12?'#c9452a':r<0.24?'#e0943a':'#f0c050');
    if(r>0.92)R(x-(s%3),GROUND+6+Math.floor(r*10),2,1,'#4a2e1a');}
}
function drawHouse(wx){const x=wx-cam;if(x<-70||x>W+10)return;
  R(x,GROUND-24,46,24,'#c9a27a');R(x,GROUND-24,2,24,'#6b4423');R(x+44,GROUND-24,2,24,'#6b4423');R(x+18,GROUND-16,10,16,'#4a2e1f');R(x+6,GROUND-17,8,6,'#e9dcc0');R(x+6,GROUND-14,8,1,'#6b4423');
  R(x-6,GROUND-32,58,9,'#c49a52');R(x-2,GROUND-38,50,6,'#d4ae63');R(x+6,GROUND-42,34,4,'#e0c07a');R(x-6,GROUND-24,58,1,'#8a6a32');
  for(let i=0;i<6;i++)R(x-2+i*10,GROUND-36,1,12,'#a8823e');
}
function drawWheel(wx){const x=wx-cam;if(x<-40||x>W+40)return;const cy=GROUND-24;
  R(x+14,GROUND-56,40,5,'#6b4423');R(x+18,GROUND-51,3,51,'#4a2e1f');
  ctx.strokeStyle='#6b4423';ctx.lineWidth=3;ctx.beginPath();ctx.arc(Math.round(x),cy,22,0,Math.PI*2);ctx.stroke();
  ctx.lineWidth=2;for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.round(x),cy);ctx.lineTo(Math.round(x+Math.cos(a)*22),Math.round(cy+Math.sin(a)*22));ctx.stroke();
    R(x+Math.cos(a)*24-2,cy+Math.sin(a)*24-2,4,4,'#7a5232');}
  R(x-3,cy-3,6,6,'#3b2617');
}
Rg.drawBack=()=>{drawSky();drawHouse(26);drawHouse(130);drawWheel(620);drawGround();};

/* 당산나무: 엉킨 칡이 풀리기 전에는 덩굴이 감고 있고 꼭대기에 해머루가 있다 */
Rg.drawScenery=()=>{const x=TREE_X-cam;if(x<-120||x>W+120)return;
  R(x-20,GROUND-118,40,118,'#4a3121');R(x-26,GROUND-10,52,10,'#4a3121');R(x-12,GROUND-118,4,110,'#5d3e2a');R(x+8,GROUND-100,3,90,'#3b2618');
  const blobs=[[-70,-176,60,30,'#c9452a'],[-30,-196,70,34,'#e0812f'],[20,-176,64,30,'#d9652a'],[-56,-150,50,20,'#b7462a'],[10,-150,58,22,'#e8a33a'],[-20,-170,48,26,'#f0b73a']];
  for(const b of blobs)R(x+b[0],GROUND+b[1],b[2],b[3],b[4]);
  R(x-21,GROUND-64,42,3,'#d9c48d');for(let i=0;i<5;i++)R(x-16+i*8,GROUND-61,2,7,'#f4efe4');
  if(!G.boss.dead){for(let i=0;i<6;i++){R(x-22,GROUND-110+i*18,44,3,'#3f6b2a');R(x-20+((i*13)%30),GROUND-106+i*18,4,8,'#4f8a35');}}
  if(!G.boss.dead){const mx=x+4,my=GROUND-162,gl=Math.floor(G.anim/20)%2;
    R(mx-1,my-2,8,4,'#5f8a3a');R(mx-3,my+2,4,4,'#6b3f8f');R(mx+1,my+2,4,4,'#7d4aa6');R(mx-1,my+6,4,4,'#5a2f7a');if(gl)R(mx,my+3,1,1,'#ffd76a');}
  if(G.drop){const d=G.drop,dx=d.x-cam;R(dx-3,d.y-6,4,4,'#6b3f8f');R(dx+1,d.y-6,4,4,'#7d4aa6');R(dx-1,d.y-2,4,3,'#5a2f7a');R(dx,d.y-9,3,2,'#5f8a3a');
    if(Math.floor(G.anim/8)%2)R(dx-5,d.y-12,1,1,'#fff3b0');}
};

/* 도토리 */
Rg.drawPickup=(a,x,bob)=>{
  if(Rg.arcCache(a)){R(x-5,a.y-3,11,3,'#7a4b2a');R(x-7,a.y-12,3,1,'#fff3b0');R(x+5,a.y-12,3,1,'#fff3b0');}
  R(x-2,a.y-7+bob,5,2,'#6b4423');R(x-2,a.y-5+bob,5,4,'#c9894a');R(x,a.y-8+bob,1,1,'#4a2e1a');};

/* ---------- 칡덩굴 장애물, 덩굴 몹, 엉킨 칡 ---------- */
function drawBarrier(){const Bq=G.barrier;if(Bq.cut)return;const x=Bq.x-cam+(Bq.shake?(Bq.shake%2?1:-1):0);if(x<-30||x>W+30)return;
  const h=60*(Bq.hp/3)+10;
  for(let i=0;i<5;i++){R(x-8+i*4,GROUND-h+((i*7)%10),3,h-((i*7)%10),i%2?'#3f6b2a':'#4f8a35');}
  for(let y=GROUND-h;y<GROUND;y+=8){R(x-10,y,20,2,'#2c4f1f');R(x-7,y+4,4,3,'#7fb069');}
}
function drawMobs(){for(const m of G.mobs){if(m.dead)continue;const x=m.x-cam;if(x<-20||x>W+20)continue;const bob=Math.floor(G.anim/10)%2;
  const c=m.flash?'#e8f5d0':'#3f6b2a';
  R(x-8,GROUND-11+bob,16,11-bob,c);R(x-6,GROUND-14+bob,12,3,c);R(x-9,GROUND-6,2,6,'#2c4f1f');R(x+7,GROUND-7,2,7,'#2c4f1f');
  R(x-4,GROUND-14+bob,1,4,'#2c4f1f');R(x+2,GROUND-15+bob,1,5,'#2c4f1f');
  const e=G.px<m.x?-1:0;R(x-4,GROUND-9+bob,3,3,'#f5e663');R(x+1,GROUND-9+bob,3,3,'#f5e663');R(x-3+e,GROUND-8+bob,1,1,'#1a1a1a');R(x+2+e,GROUND-8+bob,1,1,'#1a1a1a');}}
/* 엉킨 칡은 필드에서 눈을 감고 있다가, 다가가면 전투(enemies.js 의 kudzu)로 넘어간다 */
function drawBoss(){const b=G.boss;if(b.dead)return;const x=b.x-cam;if(x<-80||x>W+80)return;
  const c='#3d6a2b',dk='#2c4f1f',lt='#5f9a3c';
  const breathe=Math.floor(G.anim/16)%2;
  R(x-30,GROUND-40-breathe,50,40+breathe,c);R(x-36,GROUND-28,10,28,c);R(x+16,GROUND-34,10,34,c);R(x-24,GROUND-48-breathe,32,10,c);
  for(let i=0;i<5;i++){R(x-28+i*10,GROUND-38+((i*9)%14),2,22,dk);R(x-30+((i*17)%44),GROUND-26+i*4,14,2,dk);}
  R(x-20,GROUND-46,6,2,lt);R(x+2,GROUND-44,8,2,lt);
  const e=G.px<b.x?-1:1;
  R(x-20,GROUND-34,6,6,'#f5e663');R(x-4,GROUND-34,6,6,'#f5e663');R(x-18+e,GROUND-32,2,2,'#1a1a1a');R(x-2+e,GROUND-32,2,2,'#1a1a1a');
  R(x-20,GROUND-33,16,3,c);
}
Rg.drawActors=()=>{drawBarrier();drawMobs();drawBoss();};

/* 낙엽, 그리고 칡이 풀린 뒤 길 끝에 서는 북쪽 이정표 */
const leaves=Array.from({length:26},(_,i)=>({x:Math.random()*W,y:Math.random()*H,s:0.3+Math.random()*0.5,p:Math.random()*6,c:['#e0812f','#c9452a','#f0b73a'][i%3]}));
Rg.ambient=()=>{for(const l of leaves){l.y+=l.s;l.p+=0.03;l.x+=Math.sin(l.p)*0.4-0.15;if(l.y>H){l.y=-4;l.x=Math.random()*W;}if(l.x<-4)l.x=W+2;}};
Rg.drawFront=()=>{
  for(const l of leaves)R(l.x,l.y,2,Math.sin(l.p)>0?2:1,l.c);
  if(G.boss.dead){const x=2348-cam;if(x<W+20){R(x,GROUND-26,2,26,'#6b4423');R(x-8,GROUND-26,18,8,'#c9a27a');R(x+6,GROUND-24,2,4,'#6b4423');}}
};

/* ---------- 진행 ---------- */
Rg.maxX=()=>G.barrier.cut?2330:G.barrier.x-9;
Rg.step=()=>{
  for(const m of G.mobs){if(m.dead)continue;if(m.flash>0)m.flash--;m.x+=m.dir*0.45;if(m.x<m.min||m.x>m.max)m.dir*=-1;if(hitPlayer(m.x-8,m.x+8,GROUND-12,GROUND))hurt(m.x);}
  if(G.barrier.shake>0)G.barrier.shake--;
  if(!G.boss.dead&&G.barrier.cut&&G.px>KUDZU_AT)Rg.startKudzu();
  if(G.drop){const d=G.drop;d.vy=Math.min(4,d.vy+0.15);d.y=Math.min(GROUND-3,d.y+d.vy);
    if(Math.abs(d.x-G.px)<12&&G.py>d.y-6){G.drop=null;addItem('meoru',1);
      clue('h1','아빠의 수첩','젊은 아빠가 수첩의 해머루 그림 옆에 적은 글씨: "여기도 아니다."');
      diary('meoru','해머루를 붓으로 그리려고 아빠의 수첩을 펼쳤다. 젊은 아빠가 그림 옆에 적어 둔 글씨를 다시 읽었다. "여기도 아니다." 아빠도 이 열매를 보고 더 북쪽으로 갔구나.');
      ledger('toad','두꺼비 할멈','해머루 1','엄마의 병을 늦추는 약');
      setTimeout(()=>toast('수첩의 아빠 그림 옆에 글씨가 있다… 두꺼비 할멈에게 가져가자'),1600);refreshGoal();}}
};
/* 휘두르기: 칡덩굴은 낫으로만 끊긴다 */
Rg.onHit=(x1,x2,dmg,f)=>{
  const Bq=G.barrier;
  if(!Bq.cut&&Bq.x>x1-10&&Bq.x<x2+10){
    if(heldTool()!=='sickle')toast('곡괭이로는 칡덩굴이 안 끊긴다. 날 선 연장이 필요하다.');
    else{Bq.hp-=dmg;Bq.shake=10;if(Bq.hp<=0){Bq.cut=true;diary('barrier','칡덩굴을 끊고 당산나무로 가는 길을 열었다.');toast('칡덩굴을 끊었다! 길이 열렸다');refreshGoal();}}
  }
  for(const m of G.mobs){if(!m.dead&&m.x>x1-8&&m.x<x2+8){if(heldTool()!=='sickle'){toast('너무 질기다!');continue;}m.hp-=dmg;m.x+=f*10;m.flash=8;if(m.hp<=0){m.dead=true;toast('칡덩굴을 걷어냈다');}}}
};
/* 체력이 다 떨어지면 */
Rg.faint=()=>{
  if(G.px>1930){G.px=1905;
    diary('hint','엉킨 칡에게 밀려났다. 덩굴 채찍은 뛰어서 피하고, 땅에 그림자가 비치면 자리를 옮길 것.');
    toast('엉킨 칡에게 밀려났다… 일기에 공략을 적어 두었다');
  }else{G.px=Math.max(60,G.barrier.x-30);toast('칡덩굴에 밀려 물러났다');}
};
Rg.bossDie=()=>{
  const b=G.boss;b.dead=true;
  G.drop={x:TREE_X+4,y:GROUND-158,vy:0};
  diary('boss','엉킨 칡이 풀렸다. 당산나무가 크게 숨을 쉬는 것 같았다.');
  toast('엉킨 칡이 풀렸다! 해머루가 떨어진다');refreshGoal();
};

/* PA-43: 나뭇가지와 잘린 덩굴, 물길을 따라 풍경 안쪽으로 들어간다.
   위치와 그림 외의 조작·시간 수치는 공통 표를 읽는다. */
if(!CLASSIC){
  Rg.startZone='village';
  const A=Rg.expArt;
  const oldState=Rg.newState,oldStep=Rg.step,oldHit=Rg.onHit;
  const acorns=[['village',280,GROUND],['village',530,160],['village',1260,GROUND],
    ['forge',330,GROUND],['forge',2050,122],['forest',350,GROUND],['forest',1120,GROUND],['forest',2250,112]];
  const digs=[['village',600],['forest',1370],['forest',1020],['marsh',900]];
  Rg.newState=()=>{
    const s=oldState();
    s.pickups.forEach((a,i)=>Object.assign(a,{id:'gal_acorn_'+i,zone:acorns[i][0],x:acorns[i][1],y:acorns[i][2]}));
    s.digs.forEach((d,i)=>Object.assign(d,{id:'gal_dig_'+i,zone:digs[i][0],x:digs[i][1]}));
    s.barrier.x=2420;s.mobs=[];return s;
  };
  const commonStep=()=>{
    Rg.expStep?.();
    // Reuse the mortar's wooden beat near the repaired mill; do not replace the zone music.
    if(G.zone==='village'&&G.f.galWheelDone&&Math.abs(G.px-1050)<W*.6&&G.anim%120===0)
      Sound.playSfx('mortar',{gain:.25});
  };
  const basic=(id,w,platforms)=>({w,startX:70,ground:GROUND,platforms,npcs:[],
    drawBack:()=>A.back(id),drawScenery:()=>A.scenery(id),
    drawFront:()=>A.front(id),weather:()=>Vfx.setWeather('maple'),
    drawPickup:Rg.drawPickup,onPickup:a=>Rg.onPickup?.(a),step:commonStep});
  const sign=A.marker,blocked=A.blocked;
  const path=(x,to,toX,label,extra={})=>({x,to,toX,label,draw:sign,...extra});
  const hasSickle=()=>G.tool==='sickle';
  const cutPath=()=>G.barrier.cut;
  Rg.zones={
    village:{...basic('village',2600,[{x:490,y:160,w:80},{x:565,y:126,w:80},
      {x:1370,y:160,w:85},{x:1450,y:126,w:70},{x:1890,y:158,w:95},{x:1980,y:124,w:80}]),
      exits:{right:{to:'forge',toX:70}},
      doors:[path(2300,'forge',180,'대장간 길로'),
        path(1150,'forge',380,'함지박에 올라 개울 따라가기',{travel:'stream',draw:A.streamDoor}),
        path(1710,'hill',180,'물 건너 당산나무 쪽으로',{travel:'depth',need:cutPath,
          reason:'저 나무로 난 숲길은 칡덩굴에 막혔다. 무쇠의 낫으로 걷어야 한다.',draw:A.treeDoor,drawBlocked:blocked})],
      vistas:[{id:'stream',x:930,from:0,to:140,draw:A.streamDoor,sound:'water',
        thought:'낙엽이 앞서 가네.\n저 큰 나무까지 가는 걸까?',
        diary:'물레방아 개울에서 낙엽이 흐르는 걸 봤다. 물 건너로 당산나무가 보였다.',layers:A.vistaStream}],
    },
    forge:{...basic('forge',2600,[{x:320,y:160,w:85},{x:400,y:126,w:80},
      {x:1940,y:156,w:90},{x:2030,y:122,w:85},{x:2260,y:160,w:95}]),
      npcs:['musoe','nal'],exits:{left:{to:'village',toX:2500},right:{to:'forest',toX:70}},
      doors:[path(180,'village',2300,'집 쪽 다리로'),path(380,'village',1150,'개울 둑길로 돌아가기'),
        path(2380,'forest',180,'참나무 숲으로')],
      stamps:[{id:'anvil',x:1070,note:'stamp:galchamgol:anvil',label:'모루 밑 눌린 자국 살피기'}],
    },
    forest:{...basic('forest',2800,[{x:410,y:160,w:100},{x:500,y:126,w:80},
      {x:1540,y:158,w:100},{x:1710,y:152,w:85},{x:2070,y:158,w:90},{x:2160,y:124,w:75},{x:2230,y:112,w:90}]),
      npcs:['dodam'],exits:{left:{to:'forge',toX:2480},right:{to:'marsh',toX:70}},
      pickups:[{id:'gal_extra_acorn_1',x:410,y:GROUND,item:'acorn',got:false},
        {id:'gal_extra_acorn_2',x:460,y:GROUND,item:'acorn',got:false},
        {id:'gal_extra_acorn_3',x:1750,y:152,item:'acorn',got:false}],
      doors:[path(180,'forge',2380,'대장간 거점으로'),path(2630,'marsh',180,'늪가 약방으로'),
        path(2420,'hill',180,'덩굴 너머 나무 속으로',{travel:'depth',need:cutPath,
          reason:'칡덩굴이 나무 구멍을 덮었다. 무쇠에게 낫을 받아 J로 걷자.',draw:A.treeDoor,drawBlocked:blocked})],
      stamps:[{id:'knot',x:2250,y:112,note:'stamp:galchamgol:knot',label:'높은 가지 옹이 살피기'}],
      drawActors:()=>{drawBarrier();},onHit:oldHit,
      step:()=>{commonStep();if(G.barrier.shake>0)G.barrier.shake--;},
    },
    marsh:{...basic('marsh',2400,[{x:420,y:160,w:95},{x:510,y:126,w:85},
      {x:980,y:158,w:100},{x:1070,y:124,w:75},{x:1850,y:160,w:85},{x:1935,y:126,w:75}]),
      npcs:['toad'],exits:{left:{to:'forest',toX:2700}},
      doors:[path(180,'forest',2630,'참나무 숲으로'),path(2040,'forge',1860,'약재 나르는 둑길로 대장간에',{need:hasSickle,
        reason:'둑길을 뒤덮은 마른 덩굴은 낫으로 걷을 수 있겠다.',drawBlocked:blocked})],
      // 선반 뒤 작은 채집 무리. 전부 선택 재료이며, 필수 교환 몫은 앞 구역에 있다.
      pickups:[],
    },
    hill:{...basic('hill',2600,[{x:700,y:160,w:100},{x:790,y:126,w:90},
      {x:1120,y:158,w:110},{x:1220,y:124,w:90},{x:1470,y:158,w:95},{x:1560,y:124,w:85},
      {x:2290,y:160,w:100},{x:2380,y:126,w:100}]),
      exits:{left:{to:'forest',toX:2360}},
      doors:[path(180,'hill',700,'당산나무 속으로 오르기',{travel:'tree',draw:A.treeDoor}),
        path(700,'forest',2360,'뿌리 바깥 숲길로 돌아가기'),
        path(2450,'village',1710,'보이던 개울 둑으로 내려가기',{travel:'depthBack',need:()=>G.boss.dead,
          reason:'엉킨 칡이 내리막까지 움켜쥐고 있다. 나무를 풀어 주고 내려가자.',drawBlocked:blocked})],
      pickups:[{id:'gal_extra_acorn_4',x:780,y:160,item:'acorn',got:false},
        {id:'gal_cut_vine',x:340,y:GROUND,item:'vine',got:false}],
      stamps:[{id:'roots',x:2140,note:'stamp:galchamgol:roots',label:'당산나무 뿌리의 발자국 살피기'}],
      vistas:[{id:'home',x:2380,y:126,from:0,to:160,draw:A.marker,sound:'wind',
        thought:'우리 집 지붕이다.\n엄마, 나 여기까지 왔어.',
        diary:'당산나무 언덕에서 집을 돌아봤다. 골짜기의 단풍 사이로 우리 집 초가지붕이 보였다.',layers:A.vistaHill}],
      drawScenery:()=>{A.scenery('hill');Rg.drawScenery();},
      drawActors:drawBoss,onHit:oldHit,
      step:()=>{commonStep();oldStep();},
      faint:()=>{G.px=1900;G.py=GROUND;G.vy=0;G.onGround=true;toast('나무 앞 쉼터로 물러났다. 버섯 향으로 달랠 수도 있다.');},
    },
  };
  // 도장은 발견 전에도 풍경 속 흔적이 보인다. 엔진의 발견 후 표시와 별도로 그린다.
  for(const z of Object.values(Rg.zones)){
    const scenery=z.drawScenery;
    z.drawScenery=()=>{scenery?.();for(const s of z.stamps||[])A.stamp(s.x-cam,s.y??GROUND);};
  }
  installTravel();

  /* 공통 엔진을 덮어쓰지 않는 지역 연출. 구역 문에서 출발하고 같은 문 API로 도착한다.
     이동 중 저장은 일반 미니게임과 똑같이 막힌다. 중단하면 출발한 안전한 바닥으로 돌아온다. */
  function installTravel(){
    const panel=el('div');panel.id='galTravel';panel.hidden=true;
    panel.style.cssText='position:absolute;inset:0;z-index:5;background:#231c1a;display:flex;flex-direction:column;justify-content:center;color:#fff0d0';
    panel.setAttribute('role','region');panel.setAttribute('aria-label','단풍골 풍경 속 이동');
    const canvas=el('canvas');canvas.width=W;canvas.height=H;
    canvas.style.cssText='display:block;width:100%;min-height:0;flex:1;object-fit:contain;image-rendering:pixelated';
    const help=el('div');help.style.cssText='flex:none;padding:3px 6px;text-align:center;font-size:clamp(11px,1.2vw,14px);white-space:pre-line';
    const actions=el('div');actions.style.cssText='flex:none;display:flex;gap:6px;justify-content:center;padding:3px;flex-wrap:wrap';
    const pause=el('button','btn','멈춤/계속 · E'),look=el('button','btn','뒤돌아보기 · ←'),leave=el('button','btn','돌아가기 · Esc');
    for(const b of [pause,look,leave]){b.type='button';b.style.cssText='font-size:12px;padding:4px 7px;line-height:1.3;min-height:28px';}
    actions.append(pause,look,leave);panel.append(canvas,help,actions);$('stage').appendChild(panel);
    const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;let trip=null;
    function begin(p){
      if(!G||G.region!==Rg.id||paused())return;
      const start=()=>{
        if(G.region!==Rg.id)return;
        trip={owner:G,p,tick:0,hold:false,back:false,x:112,y:GROUND,vy:0,ground:true,view:0};
        panel.hidden=false;suppressHeldInputs();
        if(p.travel==='stream')Sound.ambience('water');
        pause.hidden=p.travel==='tree';look.hidden=p.travel!=='stream';
        leave.textContent=p.travel==='tree'?'밑동으로 · Esc':'출발한 둑으로 · Esc';
        help.textContent=p.travel==='tree'?'← → 이동 · 점프 버튼 / Space로 오르기\n밝은 구멍이 출구다. 떨어져도 바닥은 안전하다.':
          p.travel==='stream'?'E · 멈춤/계속   ← · 뒤돌아보기\n물레방아를 지나 다음 둑으로 간다.':'아까 바라본 나무를 향해 풍경 안쪽으로 들어간다.';
        drawTrip();
      };
      const key='galTravelTaught_'+(p.travel==='depthBack'?'depth':p.travel);
      if(!G.f[key])talk([['너구리',p.travel==='stream'?'함지박이 둑에 매여 있어.\n물레방아 아래까진 얕네.':p.travel==='tree'?'나무 속이 비었네.\n낮은 가지부터 디뎌 보자.':'개울에서 보던 당산나무다.\n덩굴을 걷으니 안쪽 길이 보여.'],
        ['너구리',p.travel==='stream'?'물살이 세면 잠깐 멈춰도 되겠지.\n뒤돌아보면 우리 마을이 보일 거야.':p.travel==='tree'?'나이테가 계단 같아.\n떨어져도 밑이 푹신하네.':'이 길로 가면 나무 밑동에 닿겠어.']],()=>{G.f[key]=true;begin(p);});
      else start();
    }
    function stop(arrive){
      const t=trip;if(!t)return;trip=null;panel.hidden=true;releaseInputs();Sound.ambience(null);
      if(t.owner!==G||G.region!==Rg.id)return;
      if(arrive){
        changeZone(t.p.to,{x:t.p.toX,y:t.p.toY});
        if(t.p.travel==='tree'){G.f.galTreeClimbed=true;diary('galTreeClimbed','빈 나무 속 나이테를 딛고 올랐다. 겨울 도토리와 바랜 소원 천 너머로 언덕이 나왔다.');}
      }
    }
    pause.onclick=()=>{if(trip)trip.hold=!trip.hold;};
    look.onclick=()=>{if(trip)trip.back=!trip.back;};leave.onclick=()=>stop(false);
    const ledges=[{x:72,y:192,w:220},{x:150,y:158,w:80},{x:210,y:124,w:82},
      {x:150,y:90,w:80},{x:88,y:56,w:82},{x:150,y:22,w:80},{x:210,y:-12,w:82},
      {x:148,y:-46,w:84},{x:90,y:-80,w:84},{x:150,y:-114,w:84},{x:210,y:-148,w:90}];
    function drawTrip(){
      if(!trip)return;const t=trip,saved=ctx,oldCam=cam;ctx=c;cam=0;
      try{
        if(t.p.travel==='tree'){
          R(0,0,W,H,'#2e211c');const off=t.view;
          ctx.save();ctx.translate(0,-Math.round(off));
          R(52,-200,296,430,'#70472e');R(70,-200,260,430,'#392921');
          for(let y=-192;y<220;y+=16){R(60,y,6,11,'#b18350');R(335,y,5,11,'#4e3426');}
          // 속살의 휘어진 결, 도토리 저장 틈, 옛 매듭이 위쪽 빛으로 이어진다.
          for(let i=0;i<9;i++)for(let y=-200;y<225;y+=3){
            const x=78+i*30+Math.round(Math.sin((y+i*7)/43)*8);
            R(x,y,1,3,i%2?'#4c3428':'#51382a');
          }
          for(const y of [164,42,-90]){
            R(76,y-15,14,24,'#281f1b');R(78,y-12,9,17,'#5a3c29');
            R(79,y+3,6,3,'#c49854');R(80,y+2,4,1,'#79522f');
          }
          for(const [i,l] of ledges.entries()){
            R(l.x,l.y,l.w,6,'#bc925b');R(l.x,l.y+1,l.w,1,'#dfbc7b');
            R(l.x+5,l.y+6,l.w-10,3,'#4a3123');
            if(i===3||i===7){R(l.x+26,l.y-5,5,4,'#b77f42');R(l.x+24,l.y-7,8,2,'#634222');}
            if(i===5){R(290,l.y-45,2,43,'#c59b5c');R(292,l.y-43,12,26,'#d1bea0');R(296,l.y-41,2,19,'#ac7552');}
          }
          R(220,-194,66,45,'#f2c77f');R(226,-188,54,39,'#f8dea1');
          drawRaccoonAt(t.x,t.y,t.x<200?1:-1,0,0,heldTool());ctx.restore();
        }else{
          const a=clamp(t.tick/TABLES.TUNING.vista_pan_frames,0,1);
          if(t.p.travel==='stream'){
            for(const layer of A.vistaStream){cam=Vfx.reducedMotion?0:Math.round((t.back?1-a:a)*140*(layer.speed??1));layer.draw(cam,Vfx.reducedMotion?0:a);}
            R(164,182,70,7,'#6e4227');R(160,175,78,8,'#b8854c');R(166,175,66,2,'#e7b66e');
            drawRaccoonAt(198,175,t.back?-1:1,0,0,heldTool());
            A.magpie(Math.round(65-(Vfx.reducedMotion?0:a)*130),176);A.chick(Math.round(350-(Vfx.reducedMotion?0:a)*120),178);
            if(Vfx.reducedMotion){ctx.globalAlpha=a;R(0,0,W,H,'#36251e');ctx.globalAlpha=1;}
          }else{
            A.back(t.p.travel==='depthBack'?'hill':G.zone);
            ctx.save();
            if(!Vfx.reducedMotion){const z=t.p.travel==='depthBack'?2-a:1+a;ctx.translate(W/2,H/2);ctx.scale(z,z);ctx.translate(-W/2,-H/2);}
            A.treeDoor(200,192);ctx.restore();
            ctx.globalAlpha=a;R(0,0,W,H,'#36251e');ctx.globalAlpha=1;
          }
        }
      }finally{ctx=saved;cam=oldCam;}
    }
    defineMinigame({id:'galTravel',hit:()=>{if(trip?.p.travel==='tree'&&trip.ground){trip.vy=TABLES.TUNING.field_jump_velocity;trip.ground=false;}},step:()=>{
      if(!trip)return;const t=trip;
      if(t.owner!==G||G.region!==Rg.id){stop(false);return;}
      if(document.hidden)return;
      if(t.p.travel==='tree'){
        const before=t.y;t.x=clamp(t.x+((isRight()?1:0)-(isLeft()?1:0))*TABLES.TUNING.field_move_speed,78,322);
        t.vy=Math.min(TABLES.TUNING.field_fall_speed,t.vy+TABLES.TUNING.field_gravity);t.y+=t.vy;t.ground=false;
        if(t.vy>=0)for(const l of ledges)if(t.x>l.x-3&&t.x<l.x+l.w+3&&before<=l.y&&t.y>=l.y){t.y=l.y;t.vy=0;t.ground=true;break;}
        if(t.y>GROUND){t.y=GROUND;t.vy=0;t.ground=true;}
        t.view=Math.min(0,t.y-140);if(t.y<=-148&&t.x>220){stop(true);return;}
      }else if(!t.hold){
        t.tick+=t.p.travel==='stream'&&!Vfx.reducedMotion?1:TABLES.TUNING.vista_pan_frames/TABLES.TUNING.zone_transition_frames;
        if(t.tick>=TABLES.TUNING.vista_pan_frames){stop(true);return;}
      }
      drawTrip();
    }});
    function intercept(e){
      if(e.target instanceof HTMLElement&&e.target.matches('input,textarea,select'))return;
      const k=e.key?.toLowerCase();
      if(trip){
        if(e.repeat&&['e','arrowleft','escape'].includes(k)){e.preventDefault();e.stopImmediatePropagation();return;}
        if(k==='escape')stop(false);
        else if(k==='e'&&trip.p.travel==='stream')trip.hold=!trip.hold;
        else if(k==='arrowleft'&&trip.p.travel==='stream')trip.back=!trip.back;
        else return;
        e.preventDefault();e.stopImmediatePropagation();return;
      }
      if(k&&!['e','enter','arrowup'].includes(k))return;
      if(CLASSIC||!G||G.region!==Rg.id||paused()||e.repeat)return;
      const p=nearInteraction();if(!p?.travel||!pathOpen(p))return;
      e.preventDefault();e.stopImmediatePropagation();begin(p);
    }
    addEventListener('keydown',intercept,true);
    $('padTalk').addEventListener('pointerdown',intercept,true);
    $('prompt').addEventListener('click',intercept,true);
    document.querySelector('#pad [data-k="up"]').addEventListener('pointerdown',intercept,true);
    Rg.expTravel=()=>trip?{kind:trip.p.travel,tick:trip.tick,x:trip.x,y:trip.y,hold:trip.hold}:null;
  }
}
})();
