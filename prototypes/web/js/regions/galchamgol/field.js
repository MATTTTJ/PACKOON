'use strict';
/* 단풍골 필드: 늦가을 하늘과 언덕, 초가집과 물레방아, 당산나무, 길을 막는 칡덩굴, 덩굴 몹, 엉킨 칡, 낙엽 */
(()=>{
const Rg=REGIONS.galchamgol;
/* 결정 D-45: 확장판 언덕은 도착(180)에서 엉킨 칡까지 걷는 길을 줄였다 (design/data/decisions.csv).
   가운데 빈 둔덕 구간을 빼고 당산나무·엉킨 칡·내려가는 문을 HILL_SHIFT만큼 앞당긴다. 옛 구성(classic)은 그대로다. */
// 결정 D-116: 칡까지 남은 빈 길(810~1255)을 300px 더 줄였다. 700 → 1000.
const HILL_SHIFT=CLASSIC?0:1000;
Rg.hillShift=HILL_SHIFT;   // story.js의 칡 앞 자리·물러나는 자리와 언덕 조사 자리도 같이 옮긴다
const TREE_X=2214-HILL_SHIFT;
/* 결정 D-547: 엉킨 칡이 화면에 들자마자 전투로 넘어가던 것을 고친다 (사용자 피드백 2026-11-04 단풍골 7·11).
   확장판 언덕은 SIGHT_X 에서 칡을 처음 보고 한마디 한 뒤, 칡 곁 KUDZU_AT 까지 더 다가가야 전투가 열린다.
   그 사이 화면은 칡 쪽으로 조금 앞서 보여 준다(camLead). 옛 구성(classic)은 그대로다. */
const KUDZU_AT=CLASSIC?1955:1080;   // 이보다 오른쪽으로 가면 엉킨 칡과 전투
const SIGHT_X=CLASSIC?Infinity:960;
Rg.kudzuAt=KUDZU_AT;
const BOSS_X=2180-HILL_SHIFT;
// 결정 D-37: 엉킨 칡에 다가갈수록 긴장이 오른다 (음악의 북 층과 템포). 칡이 풀리면 0.
Rg.moodTension=()=>{
  if(!G.started||G.boss.dead||(!CLASSIC&&G.zone!=='hill'))return 0;
  return clamp(1-(Math.abs(KUDZU_AT-G.px)-60)/800,0,1);
};

/* ---------- 배경 ---------- */
function hills(par,col,base,amp,freq){ctx.fillStyle=col;for(let x=0;x<W;x+=2){const wx=x+RC()*par;const h=base-Math.sin(wx*freq)*amp-Math.sin(wx*freq*2.3+1)*amp*0.4;ctx.fillRect(x,Math.round(h),2,H-Math.round(h));}}
function drawSky(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#f7dcab');g.addColorStop(.55,'#eeaa6c');g.addColorStop(1,'#d27a4a');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const sx=Math.round(318-RC()*0.03);R(sx,34,18,18,'#fff0c8');R(sx-2,38,22,10,'#fff0c8');R(sx+4,30,10,26,'#fff0c8');
  for(let i=0;i<3;i++){const cx=Math.round(((i*160+40)-RC()*0.06)%560+560)%560-80;R(cx,24+i*14,34,4,'#fbe7c4');R(cx+6,20+i*14,20,4,'#fbe7c4');}
  hills(0.15,'#c98a76',128,22,0.010);
  hills(0.3,'#a8654f',146,18,0.016);
  for(let i=-1;i<10;i++){
    const wx=Math.floor((RC()*0.55)/60)*60+i*60;const x=Math.round(wx-RC()*0.55);const r=hash(wx);
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

/* 당산나무: 엉킨 칡이 풀리기 전에는 칡이 줄기를 감고 있고, 해머루는 그 칡이 꽃 속에 품어 맺은 열매다(D-544·D-623).
   결정 D-545: 크고 신성하게 (사용자 피드백 2026-11-04 단풍골 12). 몇백 년 묵은 느티나무. 밑동이 퍼져 땅을 움켜쥐고 굵은 가지가 양옆으로 뻗으며,
   누렇고 붉은 잎 그늘이 화면 위까지 덮는다. 줄기에 한지 조각을 끼운 왼새끼 금줄, 밑동에 정화수 올린 제단 돌과 서낭 돌무더기. */
Rg.drawScenery=()=>{const x=TREE_X-cam;if(x<-190||x>W+190)return;
  const TB='#4a3121',TL='#5d3e2a',TD='#33210f';
  // 양옆으로 뻗은 굵은 가지
  for(const [dx,dy,len,s] of [[-24,-150,90,-1],[24,-142,96,1],[-20,-118,60,-1],[22,-110,64,1]])
    for(let i=0;i<len;i+=3){const y=GROUND+dy-Math.round(i*0.45)+Math.round((i/len)*(i/len)*20);R(x+dx+s*i,y,4,Math.max(2,6-Math.floor(i/24)),TB);}
  // 잎 그늘: 짙은 아랫자락 위에 누렇고 붉은 잎 무리
  const can=[[-150,-160,80,24,'#7a3a22'],[60,-168,92,26,'#7a3a22'],[-70,-196,150,30,'#8a4326'],
    [-160,-176,70,22,'#c9452a'],[-110,-200,80,28,'#e0812f'],[-40,-214,90,30,'#d9652a'],[40,-206,86,30,'#e8a33a'],[100,-186,74,26,'#c9452a'],[120,-168,60,20,'#b7462a'],
    [-130,-190,40,14,'#f0b73a'],[-20,-226,60,16,'#f0b73a'],[70,-222,50,16,'#e0812f'],[-80,-168,60,18,'#d9652a'],[20,-180,70,20,'#b7462a']];
  for(const b of can)R(x+b[0],GROUND+b[1],b[2],b[3],b[4]);
  for(let i=0;i<40;i++){const hx=Math.floor(hash(i*3.7)*300)-150,hy=-230+Math.floor(hash(i*1.9)*80);R(x+hx,GROUND+hy,3,2,['#f0b73a','#c9452a','#e8a33a','#7a3a22'][i%4]);}
  // 굵은 줄기: 밑동이 퍼진다. 깊게 팬 껍질 골과 옹이
  R(x-28,GROUND-160,56,160,TB);
  for(let k=0;k<5;k++)R(x-30-k*4,GROUND-10+k*2,60+k*8,2,TB);   // 퍼진 밑동
  R(x-46,GROUND-3,10,3,TB);R(x+36,GROUND-3,12,3,TB);R(x-40,GROUND-5,6,2,TL);R(x+30,GROUND-6,8,2,TL);   // 땅을 움켜쥔 뿌리
  for(const [dx,top,bot] of [[-20,150,6],[-9,160,12],[3,140,8],[15,156,10],[23,130,4]])R(x+dx,GROUND-top,2,top-bot,TD);
  R(x-16,GROUND-150,3,120,TL);R(x+8,GROUND-120,3,90,TL);
  R(x+10,GROUND-48,9,11,TD);R(x+12,GROUND-46,5,7,'#2a1a0c');   // 옹이
  for(let i=0;i<6;i++)R(x-26+((i*11)%50),GROUND-12-((i*7)%16),5,2,'#6d7350');   // 밑동 이끼
  // 금줄: 왼새끼에 끼운 흰 한지 조각과 솔가지
  for(let i=0;i<60;i+=2){const yy=GROUND-70+Math.round(Math.sin(i/58*Math.PI)*4);R(x-30+i,yy,2,3,i%4?'#b89a6a':'#8a7050');}
  for(let i=0;i<6;i++){const sx=x-24+i*10,sy=GROUND-67+Math.round(Math.sin((i*10+6)/58*Math.PI)*4);
    if(i%3===1){R(sx,sy,1,5,'#3f5a33');R(sx+2,sy+1,1,5,'#3f5a33');}else{R(sx,sy,3,9,'#f4efe4');R(sx,sy+8,3,1,'#e6dfcf');}}
  // 밑동 앞: 정화수를 올린 제단 돌과 서낭 돌무더기
  R(x+42,GROUND-7,30,7,'#8d8678');R(x+40,GROUND-8,34,2,'#a8a194');R(x+52,GROUND-11,8,3,'#efe8d8');
  R(x-74,GROUND-6,16,6,'#8d8678');R(x-72,GROUND-11,12,5,'#9a9384');R(x-70,GROUND-15,8,4,'#8d8678');R(x-68,GROUND-18,4,3,'#a8a194');
  // 칡이 풀린 뒤에도 남은 시든 덩굴 몇 가닥
  if(G.boss.dead){for(let i=0;i<4;i++)R(x-26+i*14,GROUND-100+i*20,10,2,'#6b5a3a');}
  if(G.drop){const d=G.drop,dx=d.x-cam;R(dx-3,d.y-6,4,4,'#6b3f8f');R(dx+1,d.y-6,4,4,'#7d4aa6');R(dx-1,d.y-2,4,3,'#5a2f7a');R(dx,d.y-9,3,2,'#5f8a3a');
    if(Math.floor(G.anim/8)%2)R(dx-5,d.y-12,1,1,'#fff3b0');}
};

/* 도토리 · 밤 · 칡 줄기
   결정 D-393: 채집물은 실물 꼴을 따른다 (사용자 피드백 2026-11-03: 도토리가 밤처럼 보였다).
   도토리는 비늘 무늬 깍정이 모자가 몸보다 넓고, 몸은 갸름하다 끝이 뾰족하다. 밤은 끝이 뾰족하고 밑이 넓적하며 밑동(배꼽)이 희다.
   밤송이는 가시가 사방으로 뻗고 벌어진 틈이 희다. 칡 줄기는 갈색으로 굵게 감긴 줄기에 잎 세 장(세겹잎)이 달린다. */
/* 결정 D-502: 도토리·알밤·칡 줄기를 한 치수 작게 다시 그렸다 (사용자 피드백 2026-11-04: 조금 작게, 윤곽은 또렷하게).
   알밤 곁의 벌어진 초록 밤송이는 뺐다 (초록 동그라미처럼 보였다). 윤곽은 엔진 drawOutlined 가 어두운 선과 옅은 테로 두른다. */
function drawAcornAt(x,y){
  R(x,y-8,1,1,'#4a2e1a');                                                    // 꼭지
  R(x-2,y-7,5,1,'#5f4123');R(x-2,y-6,5,1,'#7a5a32');                          // 깍정이(비늘 모자)가 몸보다 넓다
  R(x-1,y-7,1,1,'#9a7a48');R(x+1,y-7,1,1,'#9a7a48');R(x,y-6,1,1,'#8a6a3c');
  R(x-1,y-5,3,3,'#b8743a');R(x-1,y-2,3,1,'#a8652e');R(x,y-1,1,1,'#7a4a22');   // 갸름한 몸과 뾰족한 끝
  R(x-1,y-5,1,2,'#dca468');R(x+1,y-4,1,2,'#8a5228');                          // 빛받이와 그늘
}
/* 알밤: 끝이 뾰족하고 밑이 넓적하며 밑동(배꼽)이 희다 */
function drawChestnutAt(x,y){
  R(x,y-6,1,1,'#5c2f16');                                                    // 뾰족한 끝
  R(x-1,y-5,3,1,'#7a4321');R(x-2,y-4,5,2,'#7a4321');                          // 몸
  R(x-1,y-5,1,1,'#a8653a');R(x-1,y-4,1,1,'#a8653a');R(x+2,y-4,1,2,'#5c2f16');  // 윤기와 그늘
  R(x-2,y-2,5,1,'#d9c08a');R(x-1,y-1,3,1,'#c9ad80');                          // 넓적하고 흰 밑동
}
Rg.drawPickup=(a,x,bob)=>{
  if(Rg.arcCache(a)){R(x-5,a.y-3,11,3,'#7a4b2a');R(x-7,a.y-12,3,1,'#fff3b0');R(x+5,a.y-12,3,1,'#fff3b0');}
  if(a.item==='bam'){drawChestnutAt(x,a.y+bob);return;}
  if(a.item==='vine'){
    for(const [dx,dy] of [[-5,-1],[-4,-2],[-3,-2],[-2,-3],[-1,-3],[0,-2],[1,-1],[2,-1],[3,-2],[4,-2],[5,-3]])R(x+dx,a.y+dy,1,1,'#6b5a2a');
    R(x-3,a.y-1,2,1,'#5a4a22');R(x+2,a.y-3,1,1,'#3f6b2a');                     // 감긴 줄기와 잎자루
    R(x+1,a.y-7+bob,3,2,'#4f8a35');R(x,a.y-5+bob,2,2,'#5d9a40');R(x+3,a.y-5+bob,2,2,'#3f7a2a');R(x+2,a.y-7+bob,1,1,'#7fb069');   // 세겹잎
    return;}
  drawAcornAt(x,a.y+bob);};
/* 결정 D-393: 단풍골 캐는 자리. 흙더미 위로 무엇이 묻혀 있는지 조금 보인다(칡뿌리는 굵은 뿌리 등, 싸리버섯은 가는 갈래, 꾀꼬리버섯은 노란 깔때기 갓) */
Rg.drawDig=(d,x)=>{
  if(!['root','ssari','kkoe'].includes(d.item))return false;
  const y=d.y??GROUND;x=Math.round(x);
  if(d.done){R(x-6,y-1,12,2,'#3e2615');R(x-4,y-2,8,1,'#5a3a22');return true;}
  R(x-7,y-4,14,4,'#7a4b2a');R(x-5,y-6,10,2,'#8b5a2b');R(x-4,y-5,2,1,'#a06a38');R(x+3,y-3,2,1,'#5e3a1e');
  if(d.item==='root'){
    for(const [dx,dy] of [[-4,-7],[-3,-8],[-2,-9],[-1,-9],[0,-9],[1,-8],[2,-7]])R(x+dx,y+dy,2,2,'#c9a06a');   // 흙 위로 솟은 굵은 칡뿌리 등
    R(x-3,y-7,1,1,'#9a7040');R(x+1,y-6,1,1,'#9a7040');R(x-1,y-10,2,1,'#e0c08a');
    R(x+4,y-11,1,4,'#3f6b2a');R(x+3,y-13,3,2,'#4f8a35');}                       // 뿌리에서 난 칡 순
  else if(d.item==='ssari'){
    R(x-2,y-8,5,2,'#ecdcc6');
    for(const [dx,h] of [[-3,4],[-1,6],[1,5],[3,4],[0,3]]){R(x+dx,y-8-h,1,h,'#efd9c2');R(x+dx,y-9-h,1,1,'#d99a7a');}   // 가늘게 갈라진 싸리 가지와 분홍빛 끝
  }else{
    R(x-5,y-11,6,1,'#f6c040');R(x-5,y-11,1,1,'#d89a20');R(x,y-11,1,1,'#d89a20');            // 큰 깔때기 갓: 물결진 테두리
    R(x-4,y-10,4,1,'#e8a828');R(x-3,y-10,1,1,'#c88018');R(x-3,y-9,2,3,'#e0a024');R(x-3,y-9,1,1,'#c88018');   // 주름이 내려간 갓 밑과 대
    R(x+1,y-9,4,1,'#f2b632');R(x+1,y-9,1,1,'#d8901e');R(x+2,y-8,2,2,'#e09a22');R(x+2,y-8,1,1,'#c88018');   // 작은 갓
    R(x-4,y-11,2,1,'#ffd870');
  }
  if(Math.floor((G.anim+d.x)/14)%3===0)R(x+5,y-12,1,1,'#fff3b0');
  return true;
};

/* ---------- 칡덩굴 장애물, 덩굴 몹, 엉킨 칡 ---------- */
// 결정 D-51: 숲의 장벽은 나무 입구(아치)를 덮은 덩굴 그물이다. 낫질마다 아래로 걷힌다.
function drawBarrier(){const Bq=G.barrier;if(Bq.cut)return;const x=Bq.x-cam+(Bq.shake?(Bq.shake%2?1:-1):0);if(x<-40||x>W+40)return;
  // 결정 D-156: 확장판 숲에서는 나무 몸통의 칡에서 늘어진 덩굴(art.js vineCurtain)이 입구를 덮는다. 낫질마다 위에서부터 걷힌다.
  if(Rg.expArt?.vineCurtain){Rg.expArt.vineCurtain(x,GROUND,Bq.hp/3);return;}
  const h=Math.round(40*(Bq.hp/3)+6),top=GROUND-h;
  for(let i=-12;i<=10;i+=4){const t=Math.max(top,GROUND-44+Math.abs(i)/2);R(x+i,t,3,GROUND-t,i%8?'#4f8a35':'#3f6b2a');}
  for(let y=top+2;y<GROUND;y+=8){R(x-14,y,28,2,'#2c4f1f');R(x-9+((y>>3)%3)*6,y+3,4,3,'#7fb069');}
}
function drawMobs(){for(const m of G.mobs){if(m.dead)continue;const x=m.x-cam;if(x<-20||x>W+20)continue;const bob=Math.floor(G.anim/10)%2;
  const c=m.flash?'#e8f5d0':'#3f6b2a';
  R(x-8,GROUND-11+bob,16,11-bob,c);R(x-6,GROUND-14+bob,12,3,c);R(x-9,GROUND-6,2,6,'#2c4f1f');R(x+7,GROUND-7,2,7,'#2c4f1f');
  R(x-4,GROUND-14+bob,1,4,'#2c4f1f');R(x+2,GROUND-15+bob,1,5,'#2c4f1f');
  const e=G.px<m.x?-1:0;R(x-4,GROUND-9+bob,3,3,'#f5e663');R(x+1,GROUND-9+bob,3,3,'#f5e663');R(x-3+e,GROUND-8+bob,1,1,'#1a1a1a');R(x+2+e,GROUND-8+bob,1,1,'#1a1a1a');}}
/* 엉킨 칡은 당산나무 밑동을 감고 고개를 든 채 있다가, 다가가면 전투(enemies.js 의 kudzu)로 넘어간다.
   결정 D-540·D-542: 전투 그림과 같은 칡빛 독사. 몸이 줄기를 두 바퀴 반 칭칭 감고, 무늬가 천천히 위로 흘러 몸을 조이며 기어오르는 것처럼 보인다.
   줄기 뒤로 도는 마디는 양옆으로만 비친다. 쳐든 세모꼴 머리가 너구리 쪽을 보고, 가까워지면 입을 벌려 송곳니를 보인다.
   칡꽃은 앞쪽 몸 마디에 피고, 그 속에 감싸 쥔 해머루가 반짝인다. */
function drawBoss(){const b=G.boss;if(b.dead)return;const x=b.x-cam;if(x<-120||x>W+120)return;
  const BODY='#5d5a33',DK='#2b2919',BELLY='#a39769',HAIR='#8f8a5a',tx=TREE_X-cam,near=clamp(1-(b.x-G.px)/260,0,1);
  const flow=Math.floor(G.anim*(0.06+near*0.08)),squeeze=Math.round(Math.sin(G.anim*0.05)*near);
  const N=280,pts=[];for(let i=0;i<=N;i++){const s=i/N,a=s*Math.PI*5+0.5;pts.push({x:tx+Math.sin(a)*(31-squeeze),y:GROUND-10-s*128,f:Math.cos(a),i});}
  // 먹 테두리를 먼저 다 깔고 몸빛을 덮어 마디 없이 이어진 몸으로 보이게 한다. 무늬는 몸을 따라 흐른다
  const blot=p=>Math.floor((p.i+flow*4)/9)%3===0;
  const back=pts.filter(p=>p.f<=0&&Math.abs(p.x-tx)>24),front=pts.filter(p=>p.f>0);
  for(const p of back)R(p.x-4,p.y-4,8,8,'#1d1814');for(const p of back)R(p.x-3,p.y-3,6,6,blot(p)?DK:'#47452a');   // 줄기 뒤로 도는 마디(양옆만 보인다)
  for(const p of front)R(p.x-4,p.y-4,8,8,'#1d1814');
  for(const p of front){R(p.x-3,p.y-3,6,6,blot(p)?DK:BODY);R(p.x-3,p.y+2,6,1,BELLY);if(p.i%9===0)R(p.x-4,p.y-5,1,1,HAIR);}
  for(const i of [32,144,248]){const p=pts[i];if(p.f>0){R(p.x-6,p.y-8,4,3,'#4f8a35');R(p.x-3,p.y-10,3,3,'#5f9a3c');R(p.x,p.y-8,4,3,'#3f6b2a');}}   // 몸에서 돋은 칡잎
  // 앞 마디에 핀 칡꽃과 그 속의 해머루
  {const p=pts.reduce((m,q)=>q.f>0&&q.i>112&&q.i<176&&Math.abs(q.x-tx)<Math.abs(m.x-tx)?q:m,pts[136]),fx=p.x,fy=p.y-4;
    for(let i=0;i<6;i++){const w=i<4?6:7-i;R(fx-3-Math.floor(w/2)+(i%2),fy-4-i*3,w,3,['#7d4aa6','#6b3f8f','#8e5cb8'][i%3]);}
    R(fx-2,fy-2,4,4,'#2d1d3d');R(fx-1,fy-2,1,1,Math.floor(G.anim/12)%3?'#d8cde6':'#fff3b0');}
  // 꼭대기 마디에서 뻗어 나와 쳐든 목
  const top=pts[N],hx=x-30+Math.round(Math.sin(G.anim*0.04)*2),hy=GROUND-74+Math.round(Math.sin(G.anim*0.06)*2);
  const neck=[];for(let j=0;j<=60;j++){const u=j/60;neck.push({x:top.x+(hx+10-top.x)*u,y:top.y+(hy-top.y)*u-Math.sin(u*Math.PI)*16,i:j*3});}
  for(const p of neck)R(p.x-4,p.y-4,8,8,'#1d1814');for(const p of neck)R(p.x-3,p.y-3,6,6,blot(p)?DK:BODY);
  // 세모꼴 독사 머리: 주둥이가 너구리 쪽(왼쪽)을 향한다. 뒤가 넓고 눈두덩이 눈을 내리누른다
  const rows=[[3,14],[-1,16],[-5,17],[-8,17],[-10,17],[-12,17],[-11,16],[-9,15],[-6,14],[-2,13],[2,12]];
  rows.forEach(([a,e],k)=>R(hx+a-1,hy-6+k,e-a+2,1,'#1d1814'));R(hx+2,hy-7,13,1,'#1d1814');R(hx+1,hy+5,12,1,'#1d1814');
  rows.forEach(([a,e],k)=>R(hx+a,hy-6+k,e-a,1,k<4?'#4a4829':k>8?BELLY:BODY));
  R(hx+1,hy-4,6,4,DK);R(hx+3,hy-1,11,2,DK);   // 정수리 큰 비늘과 눈 뒤 짙은 띠
  R(hx-7,hy-5,8,1,'#1d1814');R(hx-6,hy-6,6,1,'#1d1814');   // 내리누른 눈두덩
  R(hx-4,hy-4,3,3,'#c4a548');R(hx-3,hy-4,1,3,'#1d1814');   // 세로 동공
  R(hx+6,hy-5,1,1,'#cbbf98');R(hx+7,hy-4,1,1,'#cbbf98');R(hx+8,hy-3,1,1,'#cbbf98');R(hx+9,hy-2,1,1,'#cbbf98');   // 오래된 흉터
  R(hx-11,hy-1,1,1,'#1d1814');R(hx-7,hy+1,1,1,'#1d1814');   // 콧구멍과 열 구멍
  const hiss=near>0.35&&Math.floor(G.anim/24)%3===0;
  if(hiss){R(hx-11,hy+1,10,3,'#3a1f1c');R(hx-10,hy+1,1,4,'#efe3c8');R(hx-5,hy+1,1,4,'#efe3c8');}   // 벌린 입과 송곳니
  else{R(hx-10,hy+2,14,1,'#2b2919');if(Math.floor(G.anim/30)%3===0){R(hx-17,hy,5,1,'#5f9a3c');R(hx-19,hy-1,2,1,'#5f9a3c');R(hx-19,hy+1,2,1,'#5f9a3c');}}   // 입선과 덩굴손 혀
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
  if(!G.boss.dead)G.boss.x=BOSS_X;   // 옛 저장의 칡 자리도 지금 언덕에 맞춘다
  for(const m of G.mobs){if(m.dead)continue;if(m.flash>0)m.flash--;m.x+=m.dir*0.45;if(m.x<m.min||m.x>m.max)m.dir*=-1;if(hitPlayer(m.x-8,m.x+8,GROUND-12,GROUND))hurt(m.x);}
  if(G.barrier.shake>0)G.barrier.shake--;
  // 칡덩굴을 끊었거나 언덕에 와 있으면(옛 저장 포함) 엉킨 칡은 같은 자리에서 깨어난다 (PA-47, D-190)
  // 결정 D-547: 확장판 언덕에서는 칡을 먼저 보고 한마디 한 뒤, 칡 곁까지 더 다가가야 전투가 열린다
  if(!G.boss.dead&&!G.f.galKudzuSeen&&!CLASSIC&&G.zone==='hill'&&G.px>SIGHT_X&&encounterReady()){G.f.galKudzuSeen=true;G.vx=0;
    talk([['너구리','(저게 엉킨 칡이구나…\n큰 뱀이 당산나무를 칭칭 감은 것 같아.)'],['너구리','(꽃 속에 보랏빛 알이 비쳐. 해머루야!\n무서워도… 가까이 가 보자.)']]);}
  else if(!G.boss.dead&&(G.barrier.cut||G.zone==='hill')&&(CLASSIC||G.f.galKudzuSeen)&&G.px>KUDZU_AT&&encounterReady())Rg.startKudzu();   // 결정 D-719: 땅에 디딘 뒤에
  // 옛 저장에 남은 해머루도 같은 바닥 아이템으로 한 번만 옮긴다.
  if(G.drop){const d=G.drop;G.drop=null;spawnDrops('meoru',1,{x:d.x,y:d.y});}
};
Rg.onFloorPickup=a=>{
  if(a.item==='meoru'){
      // 결정 D-61·D-129: 아빠 쪽은 글만 있다. 해머루 글 끝에 나중에 덧쓴 한 줄이 있다.
      clue('h1','아빠의 수첩','수첩의 해머루 글 끝, 나중에 덧쓴 빛바랜 아빠 글씨: "여기도 아니다."');
      diary('meoru','해머루를 그려 넣으려고 아빠의 수첩을 펼쳤다. 아빠가 적어 둔 해머루 글 끝에, 나중에 덧쓴 글씨가 그제야 눈에 들어왔다. "여기도 아니다." 먹빛이 많이 바랬다. 아빠는 아주 옛날에 벌써 여기 와 봤구나. 그때도 더 북쪽으로 갔구나.');   // 결정 D-134: 오래된 글씨임을 알아본다
      ledger('toad','두꺼비 할멈','해머루 1','엄마 기운을 붙드는 약');
      // 결정 D-834: 할멈은 칡이 풀리면 어귀에서 아이 곁으로 걸어온다 (story.js toadHillStep). 결정 D-522(주울 때 할멈이 먼저 부름)는 이것으로 바뀌었다.
      setTimeout(()=>{if(!open('dlg'))think(CLASSIC?'아빠 해머루 글 끝에 덧쓴 글씨가 있다… 두꺼비 할머니께 가져가자.':'아빠 해머루 글 끝에 덧쓴 글씨가 있다… 할머니께 가져가자.');},1600);refreshGoal();}
};
/* 휘두르기: 칡덩굴은 낫으로만 끊긴다 */
Rg.onHit=(x1,x2,dmg,f)=>{
  const Bq=G.barrier;
  if(!Bq.cut&&Bq.x>x1-10&&Bq.x<x2+10){
    if(heldTool()!=='sickle')think('곡괭이로는 안 끊겨. 날 선 연장이 있어야겠다.');
    else{Bq.hp-=dmg;Bq.shake=10;if(Bq.hp<=0){Bq.cut=true;diary('barrier','칡덩굴을 끊고 당산나무로 가는 길을 열었다.');think('끊었다! 길이 열렸어.');refreshGoal();}}
  }
  for(const m of G.mobs){if(!m.dead&&m.x>x1-8&&m.x<x2+8){if(heldTool()!=='sickle'){think('너무 질기다!');continue;}m.hp-=dmg;m.x+=f*10;m.flash=8;if(m.hp<=0){m.dead=true;think('칡덩굴을 걷어냈다.');}}}
};
/* 체력이 다 떨어지면 */
Rg.faint=()=>{
  if(G.px>1930){G.px=1905;
    diary('hint','엉킨 칡에게 밀려났다. 덩굴 채찍은 뛰어서 피하고, 땅에 그림자가 비치면 자리를 옮길 것.');
    talk([['너구리','(밀려났다… 덩굴 채찍은 뛰어서 피하고,\n땅에 그림자가 비치면 자리를 옮기자.)']]);
  }else{G.px=Math.max(60,G.barrier.x-30);think('칡덩굴에 밀려났다…');}
};
Rg.bossDie=()=>{
  const b=G.boss;b.dead=true;
  spawnDrops('meoru',1,{x:TREE_X-2,y:GROUND-70});   // 결정 D-544: 칡이 꽃 속에 품고 있던 해머루가 풀려 떨어진다
  diary('boss','엉킨 칡이 풀렸다. 당산나무가 크게 숨을 쉬는 것 같았다.');
  think('엉킨 칡이 풀렸다! 해머루가 떨어진다!');refreshGoal();
};

/* PA-43: 나뭇가지와 잘린 덩굴, 물길을 따라 풍경 안쪽으로 들어간다.
   위치와 그림 외의 조작·시간 수치는 공통 표를 읽는다. */
if(!CLASSIC){
  Rg.startZone='village';
  // 결정 D-109: 빈 걷기 구간 줄이기 (engine/core.js trimRegion). [시작, 지울 길이] — 설계 좌표.
  // 마을: 칡에 막힌 나무 입구(1710) 뒤 오른쪽 출구까지 890px → 300px (빈 발판 무리를 지운다).
  // 대장간: 모루 자국(1070)과 날쌘(1560) 사이 빈 둑길 490px → 160px.
  Rg.trimCutsV1={village:[[1800,590]],forge:[[1110,330]]};   // 첫 판(D-109) — 옛 저장을 옮길 때 쓴다
  // 결정 D-116: 마을 도토리(1260)와 칡 입구(1710) 사이 450 → 200, 대장간 장작(2050)과 오른쪽 출구 사이 550 → 200.
  Rg.trimCutsV2={village:[[1310,250],[1800,590]],forge:[[1110,330],[2150,350]]};   // 둘째 판(D-116) — 옛 저장을 옮길 때 쓴다
  // 결정 D-128: 걷기만 하는 길을 콘텐츠 사이 230px 안팎으로. 마을 당산나무 문 뒤 출구 앞, 대장간 날쌘과 숯 자리 사이, 숲 첫 발판 무리와 도토리 사이·나무 속 문 뒤 출구 앞. 꺼병이 걸음(galExpChickX)은 설계 좌표로 두고 그릴 자리만 옮긴다.
  Rg.trimCutsV3={village:[[1310,250],[1800,590],[2410,70]],forge:[[1110,330],[1670,30],[2150,350]],forest:[[918,82],[2530,150]]};   // 셋째 판(D-128) — 옛 저장을 옮길 때 쓴다
  // 결정 D-155: 숲의 도담(700)에서 꺼병이(1540)까지 걷는 길을 반으로 (758px → 380px). 들르는 자리(참나무 가지 ~808, 도토리 1120,
  // 금줄 1180, 캐기 1370, 발판 무리 1530)는 그대로 두고 그 사이 빈 길만 지운다. 나무(1040)·그루터기(920)는 첫 구간과 함께 빠지고,
  // 나무(1420)는 걸리지 않게 둘째·셋째 구간을 그 양옆에 둔다.
  Rg.trimCutsV4=Rg.trimCutsV5={village:[[1310,250],[1800,590],[2410,70]],forge:[[1110,330],[1670,30],[2150,350]],forest:[[830,280],[1230,130],[1472,50],[2530,150]]};   // 넷째·다섯째 판 — 옛 저장을 옮길 때 쓴다
  // 결정 D-520: 마을 개울(여울) 지나 대장간 길로 넘어가는 빈 길을 반으로 (사용자 피드백 2026-11-04). 울타리(1560) 뒤 1580~1780을 지운다.
  Rg.trimCuts={village:[[1310,250],[1580,200],[1800,590],[2410,70]],forge:[[1110,330],[1670,30],[2150,350]],forest:[[830,280],[1230,130],[1472,50],[2530,150]]};
  const A=Rg.expArt;
  const oldState=Rg.newState,oldStep=Rg.step,oldHit=Rg.onHit;
  // 결정 D-1103: 채집물 사이·말 걸기 자리와 최소 간격 (tuning gather_min_gap·gather_interact_gap). 감나무 일(300)·여울(1290)·숲 첫 도토리 무리·금줄 매듭 도장(1790) 곁에서 비켜 둔다
  const acorns=[['village',230,GROUND],['village',530,160],['village',1150,GROUND],
    ['forge',330,GROUND],['forge',2050,122],['forest',330,GROUND],['forest',1120,GROUND],['forest',2300,112]];
  // 결정 D-521: 늪가 약방 구역을 뺐다. 늪에 있던 꾀꼬리버섯 흙더미는 숲 안쪽 높은 발판 아래로 옮긴다.
  const digs=[['village',600],['forest',1370],['forge',1700],['forest',2300]];
  const placeRoot=()=>{
    const d=G.digs.find(d=>d.id==='gal_dig_2'||(d.zone==='forest'&&d.x===1020&&d.item==='root'));
    if(d)Object.assign(d,{id:'gal_dig_2',zone:'forge',x:trimX(1700,Rg.trimCuts.forge)});   // 게임 도중 옮기므로 줄인 좌표로 (D-128)
  };
  Rg.newState=()=>{
    const s=oldState();
    s.pickups.forEach((a,i)=>Object.assign(a,{id:'gal_acorn_'+i,zone:acorns[i][0],x:acorns[i][1],y:acorns[i][2]}));
    s.digs.forEach((d,i)=>Object.assign(d,{id:'gal_dig_'+i,zone:digs[i][0],x:digs[i][1]}));
    s.barrier.x=2420;s.mobs=[];s.boss.x=BOSS_X;s.f.galHillV2=true;s.f.galHillV3=true;return s;
  };
  // 결정 D-45·D-116: 줄이기 전 언덕 좌표 → 지금 좌표. 빈 둔덕 구간(900~1750)은 한 점(750)으로 모인다.
  const hillMoved=x=>x<400?x:x<900?x-150:x<1750?750:x-HILL_SHIFT;
  // 첫 줄이기(700) 좌표 → 지금 좌표. 810~1110의 빈 길은 810으로 모이고 그 뒤는 300 당긴다.
  const hillV2Moved=x=>x<810?x:x<1110?810:x-300;
  const migrateHill=()=>{
    if(G.f.galHillV3)return;
    const move=G.f.galHillV2?hillV2Moved:hillMoved;G.f.galHillV2=G.f.galHillV3=true;if(G.boss)G.boss.x=BOSS_X;   // 엉킨 칡도 새 자리로
    for(const a of floorDrops(G.region,'hill')){const p=dropSurfaceAt(move(a.x),Math.min(a.y,GROUND),undefined,'hill');if(p){a.x=p.x;a.y=p.y;}}
    if(G.zone==='hill'){const p=dropSurfaceAt(move(G.px),Math.min(G.py,GROUND),undefined,'hill');if(p){G.px=p.x;G.py=p.y;G.vy=0;G.onGround=true;G.cam=clamp(G.px-W*.42,0,Math.max(0,Rg.zones.hill.w-W));}}
  };
  const commonStep=()=>{
    Rg.expStep?.();
  };
  const basic=(id,w,platforms)=>({w,startX:70,ground:GROUND,platforms,npcs:[],
    drawBack:()=>A.back(id),drawScenery:()=>A.scenery(id),
    drawFront:()=>A.front(id),weather:()=>Vfx.setWeather(Rg.springRevisit()?'':'maple'),ambient:()=>{migrateHill();placeRoot();},   // 위치 자르기보다 먼저 옛 언덕 좌표를 옮긴다
    
    drawPickup:Rg.drawPickup,drawDig:Rg.drawDig,onPickup:a=>Rg.onPickup?.(a),step:commonStep});
  const sign=A.marker;
  const path=(x,to,toX,label,extra={})=>({x,to,toX,label,draw:sign,...extra});
  const cutPath=()=>G.barrier.cut;
  const KILN_X=396;   // 숯가마 아궁이 가운데 (숲 설계 좌표. 첫 자르기 구간보다 앞이라 줄여도 같다)
  let forestTreeDoor=null;   // 숲의 칡에 막힌 나무 입구. trimRegion이 x를 줄인 좌표로 옮긴다
  const syncBarrier=()=>{if(forestTreeDoor&&Number.isFinite(forestTreeDoor.x))G.barrier.x=forestTreeDoor.x;};
  // 칡 덩굴로 막힌 길: 아이가 아는 만큼만 말한다 (도담에게 대장간 이야기를 들었는지, 낫을 받았는지).
  // 결정 D-51·D-411: 무엇이 무엇을 막았는지 먼저 말한다 (칡이 금줄 길을 덮었다).
  // 아빠 낫은 무쇠 삼촌을 만나 들은 뒤(단서 m1)에야 안다. 그 전에는 도담에게 들은 대로 '날 선 연장'까지만 안다.
  const knowsSickle=()=>G.clues.some(c=>c.id==='m1');
  const vineSay=()=>G.tool==='sickle'?'칡이 금줄을 타고 길까지 늘어졌네.\n낫으로 걷어 내자.'
    :knowsSickle()?'칡이 금줄 길을 덮었어. 곡괭이로는 안 끊겨.\n삼촌한테 아빠 낫을 받아야겠어.'
    :G.f.dodamDone?'칡이 금줄 길을 덮었어. 곡괭이로는 안 끊겨.\n대장간 무쇠 삼촌한테 날 선 연장이 있댔지.':'칡덩굴이 금줄 길을 막았네.\n날 선 연장이 있어야겠어.';
  Rg.zones={
    // 결정 D-48: 발판은 stepRidge()로 오르락내리락 (engine/core.js)
    village:{...basic('village',2600,[...stepRidge(490,11,4),...stepRidge(1370,12,3),...stepRidge(1890,13,5)]),
      // 결정 D-410: 구역 사이는 이어진 길로만 오간다 (사용자 피드백 2026-11-03: 순간이동 기믹 빼기). 함지박 타기·물 건너 당산나무 문을 뺐다.
      exits:{right:{to:'forge',toX:70}},
      // 다람쥐의 잊은 몫 (PA-47, 다람쥐 모습에만 보인다)
      // 결정 D-988: 다람쥐 몫이 도토리만이 아니다 (사용자 피드백 2026-11-06 큰 장터 5). 집 둘레 밤나무 밑이라 다른 다람쥐가 밤을 묻어 뒀다.
      digs:[{id:'gal_cache_village',x:740,   /* 결정 D-1413: 개울 바라보기·늙은 까치와 떨어지게 (880에서 옮김) */item:'bam',n:2,form:'squirrel',cache:true,done:false}],
      vistas:[{id:'stream',x:930,from:0,to:140,draw:A.streamDoor,sound:'water',
        thought:'낙엽이 앞서 가네.\n당산나무까지 가는 걸까?',
        diary:'물레방아 개울에서 낙엽이 흐르는 걸 봤다. 물 건너로 당산나무가 보였다.',layers:A.vistaStream}],
    },
    forge:{...basic('forge',2600,[...stepRidge(320,21,4),...stepRidge(1940,22,5)]),
      npcs:['musoe','nal'],exits:{left:{to:'village',toX:2500},right:{to:'forest',toX:70}},   // 결정 D-410: 개울 둑길·약재 둑길 문을 뺐다
      stamps:[{id:'anvil',x:1070,note:'stamp:galchamgol:anvil',label:'모루 밑 눌린 자국 살피기'}],
    },
    // 숲 첫 무리는 744 높은 가지(다람쥐만 오르는 자리)에 닿지 않게 낮게 오르내린다.
    forest:{...basic('forest',2800,[{x:410,y:160,w:90},{x:486,y:138,w:70},{x:566,y:152,w:66},
      {x:1530,y:164,w:70},{x:1606,y:138,w:62},{x:1710,y:152,w:85},{x:2070,y:158,w:90},{x:2160,y:124,w:75},{x:2230,y:112,w:90},{x:2334,y:136,w:66},
      {x:744,y:96,w:64}]),
      npcs:['dodam'],exits:{left:{to:'forge',toX:2480}},   // 결정 D-521: 늪가 약방으로 가던 오른쪽 길은 뺐다
      // 결정 D-207: 도토리가 같은 간격으로 늘어서지 않게 (사용자 피드백 58). 가지 위 둘은 가지(744~808) 안에서만 옮긴다.
      pickups:[{id:'gal_extra_acorn_1',x:380,y:GROUND,item:'acorn',got:false},   // 결정 D-1103: 검댕(430) 양옆으로 비켜 둔다
        {id:'gal_extra_acorn_2',x:480,y:GROUND,item:'acorn',got:false},
        {id:'gal_extra_acorn_3',x:1750,y:152,item:'acorn',got:false},
        {id:'gal_branch_acorn_1',x:752,y:96,item:'acorn',got:false},{id:'gal_branch_acorn_2',x:800,y:96,item:'acorn',got:false}],   // 결정 D-1103: 가지 양 끝으로
      // 결정 D-411: 당산나무 언덕으로는 금줄 친 길로 걸어 오른다 (나무 속을 오르는 길은 뺐다). 덩굴은 금줄에 걸려 늘어진다(drawBarrier).
      doors:[forestTreeDoor=path(2420,'hill',180,'금줄 따라 당산나무 언덕으로',{need:cutPath,
          reason:'칡덩굴이 금줄 길을 덮었다. 무쇠 삼촌의 낫으로 걷어야 한다.',blockedLabel:'칡덩굴에 막힌 금줄 길',blockedSay:vineSay,draw:A.ropeGate,drawBlocked:A.ropeGate})],   // 결정 D-190
      // 다람쥐만 오르는 높은 참나무 가지와 잊은 몫 (PA-47 선택 자리)
      climbs:[{x:752,top:96,draw:(x,bottom,top)=>A.highOak(x,bottom,top)}],   // 결정 D-981
      digs:[{id:'gal_cache_forest',x:1900,item:'acorn',n:2,form:'squirrel',cache:true,done:false}],
      stamps:[{id:'knot',x:2250,y:112,note:'stamp:galchamgol:knot',label:'높은 가지 옹이 살피기'}],
      // 결정 D-154: 숯가마는 검댕(story.js, x 430)의 왼쪽에 서 있는 배경이다. 사연이 켜진 판에서 검댕과 함께 나온다.
      drawScenery:()=>{A.scenery('forest');if(Rg.arcsEnabled?.())A.kiln(KILN_X-RC(),GROUND);},
      // 결정 D-156: 덩굴 그물(G.barrier)은 늘 나무 입구 문과 같은 자리다. 길을 줄여 문이 당겨져도 그물이 따라온다(옛 저장 포함).
      drawActors:()=>{syncBarrier();drawBarrier();},onHit:(...a)=>{syncBarrier();return oldHit(...a);},
      step:()=>{commonStep();syncBarrier();if(G.barrier.shake>0)G.barrier.shake--;},
    },
    // 결정 D-521: 늪가 약방 구역은 뺐다 (사용자 피드백 2026-11-04). 할멈은 엉킨 칡이 풀린 뒤 언덕으로 찾아온다 (story.js).
    // 결정 D-45: 2600 → 1900. 뿌리 길·첫 발판은 150, 당산나무 쪽은 HILL_SHIFT(700)만큼 앞당겼다.
    hill:{...basic('hill',2600-HILL_SHIFT,[{x:550,y:160,w:100},...stepRidge(660,51,4),
      {x:2290-HILL_SHIFT,y:160,w:100},{x:2380-HILL_SHIFT,y:126,w:100},{x:2490-HILL_SHIFT,y:150,w:64}]),
      // 결정 D-410·D-411: 들어온 금줄 길로 나간다. 나무 속 오르기와 약방·개울로 바로 내려가던 길은 뺐다. 북쪽 길은 이 언덕 끝에서 시작한다.
      exits:{left:{to:'forest',toX:2360}},
      doors:[path(180,'forest',2420,'금줄 따라 숲으로 내려가기',{draw:A.ropeGate})],
      pickups:[{id:'gal_extra_acorn_4',x:630,y:160,item:'acorn',got:false},
        {id:'gal_cut_vine',x:350,y:GROUND,item:'vine',got:false}],   // 결정 D-1103: 두꺼비 할멈(300)과 간격
      stamps:[{id:'roots',x:2140-HILL_SHIFT,note:'stamp:galchamgol:roots',label:'당산나무 뿌리의 손바닥 자국 살피기'}],
      vistas:[{id:'home',x:2380-HILL_SHIFT,y:126,from:0,to:160,draw:A.marker,sound:'wind',
        thought:'우리 집 지붕이다.\n엄마, 나 여기까지 왔어.',
        diary:'당산나무 언덕에서 집을 돌아봤다. 골짜기의 단풍 사이로 우리 집 초가지붕이 보였다.',layers:A.vistaHill}],
      drawScenery:()=>{A.scenery('hill');Rg.drawScenery();},
      drawActors:drawBoss,onHit:oldHit,
      camLead:()=>G.boss.dead?0:60*clamp((G.px-800)/160,0,1),   // 결정 D-547: 칡에 다가가는 동안 화면이 칡 쪽을 조금 앞서 보여 준다
      step:()=>{commonStep();oldStep();},
      faint:()=>{G.px=1900-HILL_SHIFT;G.py=GROUND;G.vy=0;G.onGround=true;think('쉼터까지 물러났다. 버섯 향으로 달래 볼까.');},
    },
  };
  /* 결정 D-265: 길섶 채집물(사용자 피드백 2026-11-02). 단풍 든 참나무·밤나무 아래 도토리와 밤, 무른 흙의 칡뿌리, 늪가 버섯. 좌표는 길을 줄인 뒤의 자리.
     결정 D-391: 길섶 채집물을 줄이고 자리에 맞춘다 (사용자 피드백 2026-11-03: 너무 많고 다양하지 않다).
     도토리는 숲 줄기 자리(구역에 이미 있는 도토리)로 충분해 길섶에는 몇 개만, 밤은 집 둘레 밤나무 아래에만, 늪에는 도토리 대신 젖은 흙의 칡뿌리와 버섯만 둔다.
     옛 저장은 이미 받아 둔 채집물 목록을 그대로 쓴다(새 게임부터 이 배치). */
  addZoneGather(Rg,'gal_g_',[
    ['village','p',168,'bam'],['village','p',1365,'acorn'],   // 결정 D-1425: 여울이 1195~1290 을 걸어 오르므로 길섶 도토리는 넓적돌 너머로
    ['forge','p',700,'bam'],['forge','p',1785,'acorn',{y:112}],
    ['forest','d',1360,'root'],['forest','p',1500,'bam'],['forest','p',1895,'acorn',{y:136}],
    // 결정 D-521: 늪에 있던 칡뿌리·싸리버섯은 숲 첫 발판 무리 뒤와 숲 안쪽으로
    ['forest','d',640,'root'],['forest','d',1680,'ssari'],
    ['hill','p',410,'acorn'],
  ]);
  // 결정 D-665: 수리부엉이만 느끼는 숨은 물건 (사용자 피드백 2026-11-05). 수리부엉이로 곁을 지나면 드러난다. 좌표는 길을 줄인 뒤의 자리
  addZoneGather(Rg,'gal_owl_',[['forest','p',1020,'kkoe',{hidden:'owl'}],['hill','p',1000,'songi',{hidden:'owl'}]]);

}
})();
