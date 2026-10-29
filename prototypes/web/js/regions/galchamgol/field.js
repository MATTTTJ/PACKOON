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
Rg.drawPickup=(a,x,bob)=>{R(x-2,a.y-7+bob,5,2,'#6b4423');R(x-2,a.y-5+bob,5,4,'#c9894a');R(x,a.y-8+bob,1,1,'#4a2e1a');};

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
      clue('h1','아빠의 수첩','수첩 속 아빠의 해머루 그림 옆에 나중에 덧쓴 글씨: "여기도 아니다."');
      diary('meoru','해머루를 붓으로 그리려고 아빠의 수첩을 펼쳤다. 아빠의 해머루 그림 옆에, 처음 볼 땐 몰랐던 덧쓴 글씨가 있었다. "여기도 아니다."');
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
})();
