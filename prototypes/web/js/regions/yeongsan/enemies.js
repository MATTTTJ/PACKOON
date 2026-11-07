'use strict';
/* 북쪽 영산 전투: 어둑차사. 원본 표: design/data/bosses.csv · boss_parts.csv (보스 id 는 옛 강철이의 gangcheol 그대로)
   결정 D-1080 (사용자 지시 2026-11-07, design/proposals/name-story-v3.md §3): 마지막 보스는 이무기 강철이가 아니라 어둑차사다.
     저승사자의 갓과 도포를 쓴 어둠(어둑시니)이고, 소매 끝은 까마귀 깃으로 풀렸고, 한 손에 붉은 적패지(명부)를 늘어뜨린다. 정체는 밝히지 않는다.
   결정 D-1086: 패턴은 메인 넷과 발악 하나. 부위 넷은 적패지·소매·도포 자락·갓(핵심).
     - 갓의 차례 = 삼혼 부르기 (이름 먹기, engine/battle-names.js). 처음은 gangcheol_namecall_first 번째 공격, 그 뒤 gangcheol_namecall_every 차례마다.
       붉은 오랏줄에 묶이면 다음 차례가 곧바로 삼혼 부르기다.
     - 적패지 = 붉은 오랏줄 (결정 D-1144) · 소매 = 까마귀 전령 (결정 D-1141) · 도포 자락 = 어둑 그림자 (결정 D-1146)
     - 발악 = 명부 펼치기 (결정 D-1142). 남은 몫이 name_final_hp_ratio 밑이면 한 번. 끝에 아빠 목소리의 마지막 부름이 오고, 참으면 낙관이 드러난다.
   결정 D-370·D-1145: 부서진 부위는 그 공격을 더 고르지 않고, 부서진 모습으로 그린다. 갓은 다른 부위 하나를 부숴야 어둠에서 드러난다.
   붉은색은 적패지와 오랏줄에만 쓴다 (§3.1). */
(()=>{
const T=()=>TABLES.TUNING;
const still=()=>Vfx.reducedMotion;
const PALE='#ebe5d8',PALE_DK='#b9b0a0',SCROLL='#a3261c',SCROLL_DK='#5e120c',STRAW='#c9a868',SNOW='#f6f4ef',FIRE='#7ab8e8';
function ch(){return B.ch||(B.ch={turn:0,force:false,despDone:false,dark:0,darkGoal:0,fireSaid:false,growSaid:false,crowsRetry:!!(B.names&&B.names.retry),
  voices:[],seal:false,flap:0,lift:0});}
function poly(c,pts,fill,alpha=1,stroke=null,lw=1.6){c.save();c.globalAlpha=alpha;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
  c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.lineJoin='round';c.stroke();}c.restore();}
/* 까마귀 깃 하나: (x,y)에서 a 방향으로 len */
function quill(c,x,y,len,wid,a,col=INK,alpha=1){
  const ca=Math.cos(a),sa=Math.sin(a),nx=-sa,ny=ca;
  poly(c,[[x,y],[x+ca*len*0.35+nx*wid,y+sa*len*0.35+ny*wid],[x+ca*len,y+sa*len],[x+ca*len*0.4-nx*wid*0.7,y+sa*len*0.4-ny*wid*0.7]],col,alpha);
}

/* ---------- 그림 ---------- */
/* 달래면 짚신을 신고 갓을 숙인 뒤 북쪽 길(오른쪽 위)로 걸어 사라진다. 0 → 1 */
function chasaLeave(){return B.st==='end'&&B.result==='calm'?1-Math.max(0,B.t)/80:0;}
function chasaWon(){return B.st==='end'&&B.result==='win';}
/* 그림 좌표(0.84배 축소 전)를 화면 좌표로 */
function toScreen(x,y){return {x:LW/2+(x-LW/2)*0.84,y:EY+(y-EY)*0.84};}
/* 적패지가 늘어진 자리 (이름패가 날아드는 곳, 토해 낸 이름이 나오는 곳) */
function scrollAt(){const cx=LW/2,cy=EY,k=chasaLeave(),torn=B.parts&&part('body').broken;return toScreen((torn?cx-44:cx-86)+k*k*200,cy+40-k*k*120);}
/* 몸 둘레 어둠: 어둑 그림자가 판을 덮을수록 크게 (마주 보면 커진다) */
function drawAura(c,cx,cy,grow,fade){
  const r=1+grow*0.7;
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2+(still()?0:B.time*0.006),d=(40+hash(i*3.1)*30)*r;
    blob(c,cx+Math.cos(a)*d*0.8,cy+30+Math.sin(a)*d*0.9,(46+hash(i)*20)*r,(40+hash(i*2)*20)*r,INK,(0.07+0.05*grow)*fade);}
  for(let i=0;i<12;i++){const a=hash(i*5.3)*Math.PI*2+(still()?0:B.time*0.01*(i%2?1:-1)),d=(70+hash(i*1.7)*40)*r;
    blob(c,cx+Math.cos(a)*d,cy+40+Math.sin(a)*d*0.7,5+hash(i)*7,4+hash(i*3)*5,INK,0.18*fade);}   // 번지는 먹 방울
}
function drawChasa(c){
  const k=chasaLeave(),won=chasaWon();
  if(won){drawFallen(c);return;}
  if(!k){drawChasaBody(c,1);return;}
  // 북쪽 길로 사라진다: 오른쪽 위로 멀어지며 작아지고 옅어진다
  const cx=LW/2,cy=EY;c.save();c.translate(cx+k*k*200,cy-k*k*120);c.scale(1-k*0.6,1-k*0.6);c.translate(-cx,-cy);drawChasaBody(c,1-k*0.85);c.restore();
  // 두고 간 적패지가 풀려 바닥에 늘어진다
  drawScrollLying(c,cx-60,cy+128,Math.min(1,k*2));
}
function drawChasaBody(c,fade){
  const cx=LW/2,cy=EY,S=ch(),scroll=part('mouth'),sleeve=part('body'),robe=part('tail'),gat=part('core');
  const tell=B.st==='tell'&&B.cur,sway=still()?0:Math.sin(B.time*0.03)*3,hidden=coreHidden(),calm=B.st==='end'&&B.result==='calm';
  const desp=tell&&B.cur.id==='ledger'||B.st==='atk'&&B.cur&&B.cur.id==='ledger';
  const grow=Math.max(S.dark,desp?0.8:0,hidden?0.25:0);
  drawAura(c,cx,cy,grow,fade);
  // 도포 자락 (몸): 어깨에서 바닥까지 넓게 퍼진다. 결정 D-1145: 부서지면 찢겨 짧아진다
  {const o=shk(robe),col=partCol(robe),spread=tell&&B.cur===robe?14:0,hemY=robe.broken?cy+74:cy+124;
    const L=[[cx-30+o,cy-38],[cx-46+o-spread*0.4,cy+20],[cx-66+o-spread,hemY-4],[cx-74+o-spread,hemY]],R=[[cx+30+o,cy-38],[cx+46+o+spread*0.4,cy+20],[cx+66+o+spread,hemY-4],[cx+74+o+spread,hemY]];
    const hem=[];for(let i=0;i<=10;i++){const u=i/10,x=cx-74-spread+u*(148+spread*2)+o,j=robe.broken?(hash(i*2.3)*16-4):Math.sin(i*1.7+(still()?0:B.time*0.05))*3;hem.push([x,hemY+j]);}
    poly(c,[...L,...hem.slice(1,-1),...R.slice().reverse()],col===INK?'#191512':col,0.93*fade);
    for(let i=0;i<5;i++){const x=cx-34+i*17+o;brush(c,[[x,cy-20],[x+(i-2)*4,cy+40],[x+(i-2)*9,hemY-6]],1.4,'#4a423b',0.55*fade);}   // 옷 주름
    // 자락 끝은 까마귀 깃처럼 풀려 있다
    for(let i=0;i<9;i++){const u=(i+0.5)/9,x=cx-70-spread+u*(140+spread*2)+o;quill(c,x,hemY-2,robe.broken?10:16,3,Math.PI/2+(hash(i)-0.5)*0.8,INK,0.85*fade);}
    if(robe.broken)for(let i=0;i<4;i++)blob(c,cx-50+i*32,hemY+4+hash(i)*6,6,3,'#efe3c8',0.5*fade);   // 찢긴 틈의 종이빛
    if(tell&&B.cur===robe&&!still())for(let i=0;i<6;i++)blob(c,cx-60+i*24,hemY+8+((B.time+i*7)%20),5,4,INK,0.5);}   // 자락에서 먹이 스민다
  // 소매 (까마귀 깃): 어깨에서 양옆으로 넓게 늘어진다. 결정 D-1145: 부서지면 깃이 다 뜯겨 넝마처럼 어깨에서 늘어진다
  const open=tell&&B.cur===sleeve&&!sleeve.broken?1:0;
  {const o=shk(sleeve),col=partCol(sleeve),flap=S.flap>0&&!still()?Math.sin(S.flap*0.6)*6:0;
    for(const s of [-1,1]){
      const sx=cx+s*28+o,sy=cy-34,ex=cx+s*(92+open*26)+o,ey=cy+(30-open*30)+flap*s;
      if(sleeve.broken){for(let i=0;i<4;i++){const x=sx+s*(4+i*8),y=sy+2,l=24+hash(i*3+s)*16,sw=still()?0:Math.sin(B.time*0.04+i)*2;
          poly(c,[[x-3,y],[x+3,y],[x+2+s*2+sw,y+l],[x-1+sw,y+l-5],[x-2,y+l*0.6]],INK,0.82*fade);}
        for(let i=0;i<4;i++)quill(c,cx+s*(60+i*18),cy+126,10,2.5,(s>0?0.2:Math.PI-0.2)+hash(i)*0.4,INK,0.6*fade);}   // 바닥에 흩어진 깃
      else{poly(c,[[sx,sy],[sx+s*14,sy-4],[ex+s*8,ey-12],[ex+s*10,ey+10],[ex-s*16,ey+14],[sx-s*2,sy+30]],col===INK?'#1d1915':col,0.92*fade);
        for(let i=0;i<7;i++){const u=i/6;quill(c,ex-s*16+u*s*26,ey+8+u*4,14+hash(i+s)*6,3.4,Math.PI/2+s*(0.2+u*0.6),INK,0.9*fade);}}   // 깃으로 풀린 소매 끝
    }}
  // 길고 흰 손 둘: 왼손은 적패지를 쥐고, 오른손은 손가락을 늘어뜨린다. 소매가 뜯기면 손이 몸 가까이 내려온다
  const handAt=s=>sleeve.broken?{x:cx+s*42+shk(sleeve),y:cy+34}:{x:cx+s*(86+open*26)+shk(sleeve),y:cy+(32-open*30)};
  for(const s of [-1,1]){const h=handAt(s),hx=h.x,hy=h.y;
    poly(c,[[hx-5,hy-4],[hx+5,hy-4],[hx+4,hy+8],[hx-4,hy+8]],PALE,0.95*fade,PALE_DK,1);
    for(let f=0;f<4;f++){const fx=hx-4.5+f*3,len=s>0?14+f%2*3:9;brush(c,[[fx,hy+6],[fx+s*0.6,hy+6+len*0.6],[fx+s*1.4,hy+6+len]],1.6,PALE,0.95*fade);}}
  // 적패지: 왼손에서 바닥까지 늘어진 붉은 무명 한 폭. 먹은 이름이 붉은 붓 자국으로 비친다. 결정 D-1145: 부서지면 찢겨 반은 바닥에 떨어진다
  {const o=shk(scroll),lift=(tell&&B.cur===scroll?-22:0)+(B.st==='ntell'||B.st==='ncall'?-30:0),h=handAt(-1),hx=h.x+o-2,hy=h.y+6+lift;
    const wv=still()?0:Math.sin(B.time*0.05)*6,len=(scroll.broken?48:92)-lift*0.3,col=scroll.broken?'#b0574d':SCROLL,al=(scroll.broken?0.6:0.92)*fade;
    const pts=[];for(let i=0;i<=12;i++){const u=i/12;pts.push([hx+Math.sin(u*4.2+wv*0.06)*(4+u*6)-u*8,hy+u*len]);}
    const L=[],R=[];pts.forEach((q,i)=>{const a=pts[Math.max(0,i-1)],z=pts[Math.min(pts.length-1,i+1)],dx=z[0]-a[0],dy=z[1]-a[1],d=Math.hypot(dx,dy)||1,
      w=(12+Math.sin(i*0.9+wv*0.1)*3)/2,nx=-dy/d*w,ny=dx/d*w;L.push([q[0]+nx,q[1]+ny]);R.push([q[0]-nx,q[1]-ny]);});
    const end=pts[pts.length-1];
    poly(c,[...L,[end[0]+3,end[1]+4],[end[0]-1,end[1]+1],[end[0]-4,end[1]+5],...R.reverse()],col,al);   // 끝은 올이 풀렸다
    c.save();c.globalAlpha=al*0.55;c.strokeStyle='#d8705e';c.lineWidth=1;c.beginPath();L.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore();   // 천의 접힌 가장자리
    for(let i=1;i<11;i++){if(i%2)continue;const q=pts[i];brush(c,[[q[0]-3,q[1]],[q[0]+2,q[1]+0.6]],1.1,SCROLL_DK,0.8*fade);brush(c,[[q[0]-2,q[1]+4],[q[0]+3,q[1]+4.4]],1,SCROLL_DK,0.6*fade);}   // 읽히지 않는 붓 자국
    const eaten=B.names?B.names.eaten.length:0;
    for(let i=0;i<Math.min(eaten,5);i++){const q=pts[2+i*2],pulse=0.4+0.2*Math.sin(B.time*0.08+i);blob(c,q[0],q[1]+2,3.4,2.4,'#e0503a',pulse*fade);}
    if(scroll.broken)drawScrollLying(c,cx-118,cy+128,0.7*fade);}
  // 갓끈과 구슬
  if(!gat.broken)for(const s of [-1,1]){brush(c,[[cx+s*18,cy-62],[cx+s*12,cy-40],[cx+s*6,cy-18]],1.2,INK,0.8*fade);
    for(let i=0;i<5;i++){const u=i/4;blob(c,cx+s*(18-u*12),cy-60+u*42,1.6,1.6,'#2c2620',0.9*fade);}}
  // 갓 아래: 얼굴이 없다. 어둠뿐이고, 그 안에 까마귀 부리 같은 그림자가 이따금 비친다
  {const o=shk(gat),hy=cy-50+(calm?4:0);
    for(let i=0;i<5;i++)blob(c,cx+o+(i-2)*3,hy+2+i*2,22-i*2,25-i,'#0c0907',0.32*fade);   // 갓 아래로 번지는 어둠 (테두리가 없다)
    blob(c,cx+o,hy+3,17,19,'#0c0907',0.9*fade);
    brush(c,[[cx-19+o,cy-37],[cx-6+o,cy-20],[cx+o,cy-16],[cx+6+o,cy-20],[cx+19+o,cy-37]],2.6,PALE,0.7*fade);   // 도포의 흰 동정
    const flick=still()?0.5:0.5+0.5*Math.sin(B.time*0.07)*Math.sin(B.time*0.031);
    if(flick>0.35&&!calm)poly(c,[[cx-3+o,hy-4],[cx-24+o,hy+10],[cx-6+o,hy+4]],'#3a332d',0.85*flick*fade);
    // 갓: 넓은 챙과 높은 대우. 결정 D-1145: 갓은 다른 부위 하나를 부숴야 어둠 밖으로 드러난다
    const tilt=calm?0.18:0,col=partCol(gat),gc=col===INK?'#14100d':col,alpha=(hidden?0.35:1)*fade;
    c.save();c.translate(cx+o,cy-66+(calm?4:0));c.rotate(tilt);
    c.globalAlpha=alpha;c.fillStyle=gc;c.beginPath();c.ellipse(0,0,64,9,0,0,Math.PI*2);c.fill();
    c.strokeStyle='#3d3630';c.lineWidth=1;c.beginPath();c.ellipse(0,0,64,9,0,0,Math.PI*2);c.stroke();
    for(let i=0;i<10;i++){const a=i/10*Math.PI;c.beginPath();c.moveTo(Math.cos(a)*20,Math.sin(a)*3);c.lineTo(Math.cos(a)*62,Math.sin(a)*8.6);c.stroke();}   // 챙의 대오리 결
    c.beginPath();c.moveTo(-19,-1);c.lineTo(-17,-28);c.quadraticCurveTo(0,-33,17,-28);c.lineTo(19,-1);c.closePath();c.fillStyle=gc;c.fill();c.stroke();   // 대우
    c.restore();
    if(hidden)for(let i=0;i<6;i++)blob(c,cx-50+i*20,cy-70+hash(i)*14,22,14,INK,0.35*fade);}   // 갓이 어둠 속에 가라앉아 있다
  // 짚신: 달래면 자락 아래로 짚신 두 짝이 보인다
  if(calm&&gotShoes()){for(const s of [-1,1]){blob(c,cx+s*14,cy+128,9,3.6,STRAW,0.95*fade);brush(c,[[cx+s*14-7,cy+127],[cx+s*14+7,cy+127]],1,'#8a6a38',0.9*fade);}}
}
/* 두고 간(또는 찢겨 떨어진) 적패지 한 자락이 바닥에 늘어진다 */
function drawScrollLying(c,x,y,a){if(a<=0)return;brush(c,[[x,y],[x+30,y+4],[x+60,y-2],[x+90,y+3]],9,'#b0574d',0.7*a);
  for(let i=0;i<5;i++)brush(c,[[x+10+i*16,y],[x+16+i*16,y+1]],1.2,SCROLL_DK,0.6*a);}
/* 이겼다: 갓이 떨어지고 아래가 텅 비었다. 도포가 바닥에 내려앉는다 */
function drawFallen(c){
  const cx=LW/2,cy=EY,e=Math.min(1,(80-Math.max(0,B.t))/40);
  poly(c,[[cx-80,cy+128],[cx-40,cy+118-10*(1-e)],[cx+10,cy+114],[cx+60,cy+120],[cx+86,cy+128]],'#191512',0.85);
  for(let i=0;i<8;i++)quill(c,cx-70+i*20,cy+126,12,3,Math.PI*(0.4+hash(i)*0.2),INK,0.7);
  drawScrollLying(c,cx-130,cy+130,1);
  c.save();c.translate(cx+50,cy+120);c.rotate(0.35);c.fillStyle='#14100d';c.beginPath();c.ellipse(0,0,56,8,0,0,Math.PI*2);c.fill();
  c.beginPath();c.moveTo(-17,-1);c.lineTo(-15,-24);c.quadraticCurveTo(0,-28,15,-24);c.lineTo(17,-1);c.closePath();c.fill();c.restore();
}
/* 결정 D-1149: 전투 배경은 (D-62 대로) 상대 뒤쪽 화면 전체. 겨울밤의 언 호수: 눈구름 뒤 흐린 달빛, 눈 덮인 능선, 금줄 두른 맨가지 신목, 눈 얹힌 갈대, 내리는 눈 */
function drawNightLake(c){
  const t=B.time,gy=BOX.y-52;
  let g=c.createLinearGradient(0,0,0,gy);g.addColorStop(0,'rgba(38,44,56,.42)');g.addColorStop(1,'rgba(120,128,140,.1)');
  c.save();c.fillStyle=g;c.fillRect(0,0,LW,gy);c.restore();
  blob(c,LW*0.8,40,46,30,'#f4f2ec',0.16);blob(c,LW*0.8,40,22,16,'#f4f2ec',0.14);   // 눈구름 뒤에 번진 달빛
  for(let i=0;i<5;i++)blob(c,LW*(0.62+i*0.08),34+hash(i)*20,60,14,'#4a4f5a',0.18);   // 달을 덮은 눈구름
  for(const [k,a,base,amp] of [[0,.16,gy*0.55,60],[1,.24,gy*0.78,40]]){
    const pts=[];for(let x=-20;x<=LW+20;x+=24)pts.push([x,base-Math.abs(Math.sin(x*0.006+k*1.9))*amp-hash(x*0.07+k)*14]);
    c.save();c.globalAlpha=a;c.fillStyle=INK;c.beginPath();c.moveTo(-20,gy);for(const p of pts)c.lineTo(p[0],p[1]);c.lineTo(LW+20,gy);c.closePath();c.fill();c.restore();
    for(let i=1;i<pts.length-1;i++)if(pts[i][1]<pts[i-1][1]+4)brush(c,[[pts[i][0]-12,pts[i][1]+7],[pts[i][0],pts[i][1]+1],[pts[i][0]+12,pts[i][1]+7]],3,'#f4f2ec',0.55);   // 능선에 쌓인 눈
  }
  const ly=gy-18,lh=34;   // 언 호수
  c.save();c.fillStyle='rgba(186,200,212,.42)';c.beginPath();c.ellipse(LW/2,ly,LW*0.48,lh,0,0,Math.PI*2);c.fill();c.restore();
  c.save();c.strokeStyle=INK;c.globalAlpha=0.3;c.lineWidth=1.6;c.beginPath();c.ellipse(LW/2,ly,LW*0.48,lh,0,0,Math.PI*2);c.stroke();c.restore();
  for(let i=0;i<7;i++){const x=LW*0.12+hash(i*4.3)*LW*0.76,y=ly-lh*0.5+hash(i*2.9)*lh;brush(c,[[x,y],[x+12,y+4],[x+22,y-2]],1,INK,0.22);}
  c.save();c.fillStyle='rgba(244,242,236,.5)';c.fillRect(0,gy,LW,LH-gy);c.restore();   // 눈 덮인 호숫가
  brush(c,[[0,gy+2],[LW*0.5,gy-2],[LW,gy+2]],4,INK,0.4);
  const sx=LW*0.96;   // 신목: 오른쪽 끝, 잎 없이 비틀린 굵은 가지와 금줄 (왼쪽 부위 글을 가리지 않게)
  brush(c,[[sx-18,gy],[sx-12,gy*0.6],[sx-4,gy*0.3]],16,INK,0.4);brush(c,[[sx+14,gy],[sx+8,gy*0.6],[sx-2,gy*0.3]],10,INK,0.36);
  for(const [a,b,w] of [[[sx-6,gy*0.35],[sx-80,gy*0.1],6],[[sx-2,gy*0.3],[sx+30,gy*0.05],6],[[sx-40,gy*0.2],[sx-70,-6],3],[[sx-60,gy*0.15],[sx-110,gy*0.2],3],[[sx+16,gy*0.1],[sx+24,-8],2]])
    brush(c,[a,[(a[0]+b[0])/2+8,(a[1]+b[1])/2-6],b],w,INK,0.34);
  const ry=gy*0.86;brush(c,[[sx-24,ry],[sx,ry+8],[sx+20,ry]],3,'#6b5540',0.65);
  for(let i=0;i<4;i++){const x=sx-16+i*11,y=ry+3+Math.sin(i/3*Math.PI)*5;c.save();c.fillStyle='rgba(250,246,236,.8)';c.fillRect(x-3,y,6,11);c.restore();brush(c,[[x-3,y],[x+3,y],[x+3,y+11],[x-3,y+11],[x-3,y]],1,INK,0.3);}
  for(let i=0;i<9;i++){const x=LW*0.2+i*LW*0.011,h=40+hash(i*3.3)*36,sw=still()?0:Math.sin(t*0.02+i*0.7)*3;   // 눈 얹힌 갈대
    brush(c,[[x,gy+4],[x+sw*0.5,gy-h*0.5],[x+sw,gy-h]],1.6,INK,0.5);blob(c,x+sw,gy-h-3,3,4,SNOW,0.8);}
  const n=still()?40:70;   // 비스듬히 내리는 눈
  for(let i=0;i<n;i++){const x=(hash(i*2.1)*LW+(still()?0:t*(0.5+hash(i)*0.5)))%(LW+40)-20,y=(hash(i*6.1)*LH+(still()?0:t*(0.9+hash(i*1.3)*0.8)))%LH;
    blob(c,x,y,1.4+hash(i*4)*1.4,1.4+hash(i*4)*1.2,SNOW,0.75);}
}

/* ---------- 공격 ---------- */
/* 결정 D-1144: 붉은 오랏줄. 판 한쪽 끝에서 붉은 줄이 가로로 출렁이며 뻗어 판을 가로지르고, 잠시 머물렀다 거둬진다.
   두세 줄이 높이를 바꿔 이어 온다. 예고 때 줄 자리가 붉은 점선과 차례 숫자로 보인다. 닿으면 손이 묶여 느려지고 다음 차례가 곧바로 삼혼 부르기다. */
function ropePlan(){
  const vs=[0.2,0.5,0.8].sort(()=>Math.random()-0.5),side=altDir('chasaRope')?1:-1,n=T().chasa_rope_count;
  return {kind:'rope',ropes:vs.slice(0,n).map((v,i)=>({v,side:i%2?-side:side,delay:i*T().chasa_rope_gap}))};
}
function ropeY(b,x){return BOX.y+b.v*BOX.h+(still()?0:Math.sin(x*0.05+b.t*0.22)*T().chasa_rope_amp);}
function ropeExtent(b){const t=T(),L=t.chasa_rope_lash,H=t.chasa_rope_hold,R=t.chasa_rope_back;
  return b.t<=L?b.t/L:b.t<=L+H?1:Math.max(0,1-(b.t-L-H)/R);}
/* 결정 D-1141: 까마귀 전령. 소매에서 까마귀가 줄지어 판을 대각선으로 가로지른다. 줄마다 두 칸이 비어 위아래로 피한다.
   먹힌 이름이 있으면 줄마다 빈칸 옆 한 마리가 붉은 쪽지를 문다. 손으로 스치면 쪽지가 찢겨 이름 하나가 돌아온다(맞지 않는다). */
function crowPlan(){
  const t=T(),n=t.chasa_crow_slots,dir=altDir('chasaCrows')?1:-1,slope=(altDir('chasaCrowsV')?1:-1)*t.chasa_crow_slope,waves=[];
  let gap=Math.floor(Math.random()*(n-1));
  for(let w=0;w<t.chasa_crow_waves;w++){if(w)gap=clamp(gap+(Math.random()<0.5?-2:2)+(gap<=1?2:gap>=n-3?-2:0),0,n-2);waves.push(gap);}
  return {kind:'crows',dir,slope,waves};
}
/* 결정 D-1146: 어둑 그림자. 위(보스 쪽)에서 먹물 어둠이 번져 내려온다. 손이 판 위쪽 절반에 머물수록 빨리 부풀고,
   판 아래 끝(chasa_shadow_far 밑)에 물러나면 줄어든다. 사이 어딘가에서는 천천히 번진다. 어둠 끝에서 이따금 손가락이 내리꽂힌다.
   도깨비불씨를 지녔으면 어둠이 더디 번지고 빨리 줄어든다. */
function shadowFront(b,x){return BOX.y+ch().dark*BOX.h+(still()?0:Math.sin(x*0.05+b.t*0.05)*5);}
/* 결정 D-1142: 명부 펼치기(발악). 판이 어둠으로 덮이고 손 둘레만 밝다. 사방에서 붉은 붓 획이 그어 온다. 먹은 목소리들이 한꺼번에 부른다 */
const LEDGER={id:'ledger',name:'적패지',atk:'chasaLedger',hp:1,max:1,
  tell:'적패지가 사방으로 풀린다. 먹은 목소리들이 한꺼번에 깨어난다.'};
function strokeLine(){
  const X=BOX.x,Y=BOX.y,W=BOX.w,H=BOX.h,kind=Math.floor(Math.random()*3),near=Math.random()<0.6,o=near?(Math.random()-0.5)*40:(Math.random()-0.5)*W*0.6;
  if(kind===0){const y=clamp((near?B.py:Y+H/2)+o*0.5,Y+10,Y+H-10);return Math.random()<0.5?[[X-10,y],[X+W+10,y]]:[[X+W+10,y],[X-10,y]];}
  if(kind===1){const x=clamp((near?B.px:X+W/2)+o,X+10,X+W-10);return Math.random()<0.5?[[x,Y-10],[x,Y+H+10]]:[[x,Y+H+10],[x,Y-10]];}
  const cx=near?B.px+o*0.5:X+W/2+o,cy=near?B.py:Y+H/2,s=Math.random()<0.5?1:-1;return [[cx-H*0.9,cy-s*H*0.6],[cx+H*0.9,cy+s*H*0.6]];
}
function segD(x,y,a,b,k=1){const ex=a[0]+(b[0]-a[0])*k,ey=a[1]+(b[1]-a[1])*k,dx=ex-a[0],dy=ey-a[1],q=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(x-a[0]-q*dx,y-a[1]-q*dy);}
defineAttacks({
  chasaRope:{get dur(){const t=T();return t.chasa_rope_gap*(t.chasa_rope_count-1)+t.chasa_rope_lash+t.chasa_rope_hold+t.chasa_rope_back+2;},
    tick(t){for(const r of B.attackPlan.ropes)if(t===r.delay){B.bullets.push({k:'chasaRope',v:r.v,side:r.side,t:0});Sound.playSfx('chasa_write');}}},
  chasaCrows:{get dur(){const t=T();return t.chasa_crow_wave_gap*(t.chasa_crow_waves-1)+Math.ceil((BOX.w+60)/t.chasa_crow_speed)+4;},
    tick(t){const P=B.attackPlan,T_=T();if(t%T_.chasa_crow_wave_gap)return;const w=t/T_.chasa_crow_wave_gap;if(w>=P.waves.length)return;
      const gap=P.waves[w],n=T_.chasa_crow_slots,S=ch(),eaten=B.names?B.names.eaten.length:0,slips=eaten?(S.crowsRetry?T_.name_return_retry_bonus:1):0;
      const cand=[gap-1,gap+2].filter(i=>i>=0&&i<n).sort(()=>Math.random()-0.5),slipAt=cand.slice(0,slips);
      for(let i=0;i<n;i++){if(i===gap||i===gap+1)continue;
        // 판 가운데를 지날 때 제 칸 높이에 오도록, 들어올 때는 기울기만큼 비켜 둔다
        const v=(i+0.5)/n,lead=14+i*6,vy=P.slope*T_.chasa_crow_speed*0.4,x=P.dir>0?BOX.x+BOX.w+lead:BOX.x-lead,y=BOX.y+v*BOX.h-vy*(BOX.w/2+lead)/T_.chasa_crow_speed;
        B.bullets.push({k:'chasaCrow',x,y,vx:-P.dir*T_.chasa_crow_speed,vy,t:0,slip:slipAt.includes(i),seed:Math.random()*6});}
      if(w===P.waves.length-1)S.crowsRetry=false;
      S.flap=30;Sound.playSfx('crow_caw');}},
  chasaShadow:{get dur(){return T().chasa_shadow_frames;},
    tick(t){if(t===0){const S=ch();S.dark=Math.max(S.dark,T().chasa_shadow_start);B.bullets.push({k:'chasaShadow',t:0,life:T().chasa_shadow_frames,fingers:[]});}}},
  chasaLedger:{get dur(){return T().chasa_ledger_frames;},
    tick(t){const T_=T();
      if(t===0)B.bullets.push({k:'chasaDark',t:0,life:T_.chasa_ledger_frames});
      if(t>=20&&t<T_.chasa_ledger_frames-50&&(t-20)%T_.chasa_ledger_stroke_every===0)B.bullets.push({k:'chasaStroke',line:strokeLine(),t:0});
      if(t%40===10)ledgerVoice();}},
});
/* 먹은 목소리들: 아이를 부르던 이들의 말투가 겹친다 (이름 칸은 비우지 않고 그 별명 그대로. 본이름은 쓰지 않는다) */
function ledgerVoice(){
  const S=ch(),list=G.nicknames||[];if(!list.length)return;
  const n=list[Math.floor(Math.random()*list.length)],side=S.voices.length%2?1:-1;
  S.voices.push({text:'"'+nameVoice(n,'call')+'"',by:n.by,t:0,max:90,x:LW/2+side*(150+Math.random()*60),y:EY-40+Math.random()*90});
  if(S.voices.length>4)S.voices.shift();
}
defineBullets({
  chasaRope:{
    step(b){b.t++;const t=T(),end=t.chasa_rope_lash+t.chasa_rope_hold+t.chasa_rope_back;if(b.t>end){b.dead=1;return;}
      const e=ropeExtent(b),tip=b.side>0?BOX.x+e*BOX.w:BOX.x+BOX.w-e*BOX.w;
      const inside=b.side>0?B.px<=tip:B.px>=tip;
      if(e>0.05&&inside&&Math.abs(B.py-ropeY(b,B.px))<t.chasa_rope_hit&&bHitMe()){
        B.slowT=t.chasa_rope_slow_frames;B.slowK=t.chasa_rope_slow;ch().force=true;B.msg='붉은 오랏줄에 손이 감겼다!';}},
    draw(c,b){const e=ropeExtent(b),x0=b.side>0?BOX.x-4:BOX.x+BOX.w+4,x1=b.side>0?BOX.x+e*BOX.w:BOX.x+BOX.w-e*BOX.w;
      c.save();c.strokeStyle=SCROLL;c.lineWidth=5;c.lineCap='round';c.globalAlpha=0.92;c.beginPath();
      for(let i=0;i<=24;i++){const x=x0+(x1-x0)*i/24;i?c.lineTo(x,ropeY(b,x)):c.moveTo(x,ropeY(b,x));}c.stroke();
      c.strokeStyle='#e8b0a0';c.lineWidth=1;c.globalAlpha=0.6;c.beginPath();   // 꼰 줄의 결
      for(let i=0;i<24;i++){const x=x0+(x1-x0)*i/24;c.moveTo(x-2,ropeY(b,x)-2);c.lineTo(x+2,ropeY(b,x)+2);}c.stroke();c.restore();
      blob(c,x1,ropeY(b,x1),4,4,SCROLL_DK,0.9);}},   // 줄 끝 매듭
  chasaCrow:{
    step(b){b.t++;b.x+=b.vx;b.y+=b.vy;
      if(b.x<BOX.x-40||b.x>BOX.x+BOX.w+60){b.dead=1;return;}
      const inBox=b.x>BOX.x&&b.x<BOX.x+BOX.w;
      if(!inBox||b.gone)return;
      if(Math.hypot(B.px-b.x,B.py-b.y)<T().chasa_crow_hit){
        if(b.slip){b.slip=false;b.gone=true;bSplash(b.x,b.y,SCROLL);nameReturn(T().name_return_on_body_hit,b.x,b.y);B.msg='까마귀가 문 붉은 쪽지가 찢겼다!';Sound.playSfx('battle_soothe');}
        else bHitMe();}},
    draw(c,b){const f=still()?0:Math.sin(b.t*0.5+b.seed)*4,s=b.vx<0?-1:1,a=b.gone?0.35:1;
      poly(c,[[b.x-s*9,b.y],[b.x,b.y-3],[b.x+s*8,b.y-1],[b.x+s*12,b.y+1],[b.x+s*7,b.y+2],[b.x,b.y+3]],INK,a);   // 몸과 부리
      poly(c,[[b.x-s*2,b.y-2],[b.x+s*4,b.y-11-f],[b.x+s*6,b.y-2]],INK,a);poly(c,[[b.x-s*4,b.y-1],[b.x-s*1,b.y-9+f*0.5],[b.x+s*2,b.y-1]],'#2c2620',a);   // 날개
      blob(c,b.x+s*5,b.y-1.5,0.9,0.9,'#cfc6b4',a);
      if(b.slip){c.save();c.translate(b.x+s*13,b.y+3);c.rotate(0.3*s);c.fillStyle=SCROLL;c.fillRect(-3,0,6,10);brush(c,[[-1.5,3],[1.5,3]],0.8,SCROLL_DK,0.9);c.restore();}}},
  chasaShadow:{
    step(b){b.t++;const t=T(),S=ch();if(b.t>b.life){b.dead=1;return;}
      const fire=has('dokkaebibul'),v=(B.py-BOX.y)/BOX.h;
      if(v<0.5)S.dark+=t.chasa_shadow_grow*(fire?t.chasa_fire_grow_mul:1);
      else if(v>t.chasa_shadow_far)S.dark-=t.chasa_shadow_shrink*(fire?t.chasa_fire_shrink_mul:1);
      else S.dark+=t.chasa_shadow_creep*(fire?t.chasa_fire_grow_mul:1);
      S.dark=clamp(S.dark,0.06,t.chasa_shadow_max);
      if(v<0.5&&S.dark>0.3&&!S.growSaid){S.growSaid=true;bLater('가까이 머물수록 어둠이 부푼다.',4);}
      if(fire&&!S.fireSaid&&v>t.chasa_shadow_far){S.fireSaid=true;bLater('품 안의 도깨비불씨가 어둠을 밀어낸다.',4);}
      if(B.py<shadowFront(b,B.px)+2)bHitMe();
      // 어둠 손가락: 손 가까운 자리에 예고(가는 먹 줄)가 내려온 뒤 내리꽂힌다
      if(b.t>=30&&b.t<b.life-40&&(b.t-30)%t.chasa_finger_every===0)b.fingers.push({x:clamp(B.px+(Math.random()-0.5)*24,BOX.x+10,BOX.x+BOX.w-10),t:0});
      for(const f of b.fingers){f.t++;const s=f.t-t.chasa_finger_tell;
        if(s>0&&s<=18&&Math.abs(B.px-f.x)<t.chasa_finger_hit&&B.py>shadowFront(b,f.x)-2)bHitMe();}
      b.fingers=b.fingers.filter(f=>f.t<t.chasa_finger_tell+28);},
    draw(c,b){const t=T(),fade=Math.min(1,(b.life-b.t)/30,b.t/12);
      c.save();c.globalAlpha=0.9*fade;c.fillStyle='#120e0b';c.beginPath();c.moveTo(BOX.x,BOX.y);
      for(let x=BOX.x;x<=BOX.x+BOX.w;x+=8)c.lineTo(x,shadowFront(b,x));c.lineTo(BOX.x+BOX.w,BOX.y);c.closePath();c.fill();c.restore();
      for(let x=BOX.x+6;x<BOX.x+BOX.w;x+=14)blob(c,x,shadowFront(b,x)+2,6,4,INK,0.6*fade);   // 번지는 끝
      for(const f of b.fingers){const s=f.t-t.chasa_finger_tell,top=shadowFront(b,f.x);
        if(s<=0){c.save();c.setLineDash([4,4]);c.strokeStyle=INK;c.globalAlpha=0.35+0.35*(Math.floor(f.t/4)%2);c.lineWidth=2;c.beginPath();c.moveTo(f.x,top);c.lineTo(f.x,BOX.y+BOX.h-4);c.stroke();c.restore();
          blob(c,f.x,top+4,8,6,INK,0.8);continue;}
        const k=s<=6?s/6:s<=18?1:Math.max(0,1-(s-18)/10),bot=top+(BOX.y+BOX.h-4-top)*k;
        poly(c,[[f.x-8,top],[f.x-3,bot-6],[f.x,bot],[f.x+3,bot-6],[f.x+8,top]],'#120e0b',0.95*fade);}
      if(has('dokkaebibul')&&!still()){const y=B.py+10;for(let i=0;i<3;i++)blob(c,B.px+(i-1)*5,y-((B.time+i*9)%14),2.4,3.2,FIRE,0.6);}}},   // 품 안의 도깨비불씨
  chasaDark:{
    step(b){b.t++;if(b.t>b.life)b.dead=1;},
    draw(c,b){const fade=Math.min(1,b.t/30,(b.life-b.t)/30),R=T().chasa_ledger_light;
      c.save();c.globalAlpha=0.86*fade;c.fillStyle='#120e0b';c.beginPath();c.rect(BOX.x,BOX.y,BOX.w,BOX.h);c.arc(B.px,B.py,R,0,Math.PI*2,true);c.fill('evenodd');c.restore();
      const g=c.createRadialGradient(B.px,B.py,R*0.55,B.px,B.py,R);g.addColorStop(0,'rgba(18,14,11,0)');g.addColorStop(1,'rgba(18,14,11,'+(0.7*fade).toFixed(3)+')');
      c.save();c.fillStyle=g;c.beginPath();c.arc(B.px,B.py,R,0,Math.PI*2);c.fill();c.restore();
      for(let i=0;i<10;i++){const u=(hash(i*3.3)+b.t*0.002)%1,y=BOX.y+hash(i*7.1)*BOX.h;brush(c,[[BOX.x+u*BOX.w,y],[BOX.x+u*BOX.w+10,y+2]],1.4,SCROLL_DK,0.5*fade);}}},   // 풀린 명부의 붓 자국
  chasaStroke:{
    step(b){b.t++;const T_=T(),s=b.t-T_.chasa_ledger_stroke_tell;
      if(s===1)Sound.playSfx('chasa_write');
      if(s>0&&s<=14&&segD(B.px,B.py,b.line[0],b.line[1],Math.min(1,s/8))<8)bHitMe();
      if(s>24)b.dead=1;},
    draw(c,b){const s=b.t-T().chasa_ledger_stroke_tell,[a,z]=b.line;
      if(s<=0){c.save();c.setLineDash([6,5]);c.strokeStyle=RED;c.globalAlpha=0.45+0.35*(Math.floor(b.t/4)%2);c.lineWidth=2.2;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(z[0],z[1]);c.stroke();c.restore();return;}
      const k=Math.min(1,s/8),fade=s>14?Math.max(0,1-(s-14)/10):1,ex=a[0]+(z[0]-a[0])*k,ey=a[1]+(z[1]-a[1])*k;
      brush(c,[a,[(a[0]+ex)/2+3,(a[1]+ey)/2-2],[ex,ey]],9,SCROLL,0.9*fade);brush(c,[a,[ex,ey]],2,'#e8b0a0',0.5*fade);}},
});

/* 공격 고르기: 발악 → 삼혼 부르기 → 남은 부위 가운데 바로 앞과 다른 것 */
function pickChasa(){
  const S=ch(),t=T(),core=part('core'),first=!B.last;S.turn++;
  const living=B.parts.filter(p=>!p.core&&!p.broken);
  if(!S.despDone&&gangLeft()<=t.name_final_hp_ratio){
    S.despDone=true;B.cur=LEDGER;B.last=LEDGER;B.st='tell';B.t=t.chasa_ledger_tell;B.msg=LEDGER.tell;B.hitThis=false;B.attackPlan=null;Sound.playSfx('chasa_call');return;}
  const f=t.gangcheol_namecall_first,e=t.gangcheol_namecall_every;
  if(S.force||S.turn===f||(S.turn>f&&(S.turn-f)%e===0)||!living.length){S.force=false;nameCallBegin(core);return;}
  const o=living.filter(q=>q!==B.last),pool=o.length?o:living,p=pool[Math.floor(Math.random()*pool.length)];
  B.cur=p;B.last=p;B.st='tell';B.t=first?72:p.id==='mouth'?60:50;B.msg=p.tell;B.hitThis=false;
  B.attackPlan=p.id==='mouth'?ropePlan():p.id==='body'?crowPlan():{kind:'shadow'};
}
/* 빈틈 자리. 발악 뒤에는 마지막 부름, 그 뒤엔 낙관(갓 칠 자리, 오래 남고 더 깎는다). 갓이 어둠 속이면 다른 부위에 빈틈을 연다 */
function chasaOpen(p){
  const S=ch(),N=B.names,core=part('core');
  if(p===LEDGER){B.mark=null;nameCallBegin(core,true);return true;}
  if(p===core&&N&&N.finalDone&&N.bigOpen&&!S.seal){S.seal=true;const z=bMarkZone();
    B.mark={x:(z.x1+z.x2)/2,y:(z.y1+z.y2)/2,t:T().chasa_seal_life,max:T().chasa_seal_life,part:core,seal:true};B.msg='낙관이 드러났다. 갓에 빈틈.';return true;}
  if(p.core&&coreHidden()){const alt=part('mouth').broken?B.parts.find(q=>!q.core&&!q.broken):part('mouth');
    if(!alt){B.mark=null;return true;}
    const aim=bAim(),z=bMarkZone();let x,y,n=0;do{x=z.x1+Math.random()*(z.x2-z.x1);y=z.y1+Math.random()*(z.y2-z.y1);n++;}while(Math.hypot(x-aim.x,y-aim.y)<70&&n<12);
    B.mark={x,y,t:150,max:150,part:alt};B.msg=alt.name+'에 빈틈.';return true;}
  return false;
}
/* 낙관을 쳤으면 더 깎는다 */
function chasaHit(p,m){
  if(!m.seal||p.broken)return;
  p.hp=Math.max(0,p.hp-T().chasa_seal_bonus);B.msg='낙관을 쳤다! 갓이 크게 흔들린다.';renderBHud();
  if(p.hp<=0)breakPart(p);
}
/* 이 전투에서 짚신을 건넸나 (마지막 선물이면 tickChasa 가 아직 못 봤다) */
function gotShoes(){return !!(B&&((B.ch&&B.ch.shoes)||B.lastGift==='jipsin'));}
function tickChasa(){const S=ch();if(S.flap>0)S.flap--;if(B.lastGift==='jipsin')S.shoes=true;
  for(const v of S.voices)v.t++;S.voices=S.voices.filter(v=>v.t<v.max);
  // 어둑 그림자가 끝나면 어둠이 천천히 걷힌다(몸 둘레 어둠 크기에도 쓴다)
  if(!B.bullets.some(b=>b.k==='chasaShadow')&&S.dark>0)S.dark=Math.max(0,S.dark-0.004);}
/* 판 바닥: 예고. 오랏줄 자리(붉은 점선과 차례), 까마귀가 들어올 자리(첫 줄의 빈칸), 어둠이 번질 위쪽 */
function drawChasaFloor(c){
  const tell=B.st==='tell'&&B.cur,P=B.attackPlan;if(!P)return;
  const X=BOX.x,Y=BOX.y,W=BOX.w,H=BOX.h,blink=0.45+0.35*(Math.floor(B.time/5)%2);
  if(P.kind==='rope'){
    const t=B.st==='atk'?B.atkT:-1;
    P.ropes.forEach((r,i)=>{if(!tell&&!(t>=0&&t<r.delay&&r.delay-t<30))return;const y=Y+r.v*H;
      c.save();c.setLineDash([8,6]);c.strokeStyle=RED;c.globalAlpha=tell?blink:0.4;c.lineWidth=2.6;c.beginPath();c.moveTo(X,y);c.lineTo(X+W,y);c.stroke();c.restore();
      const ex=r.side>0?X+12:X+W-12;c.save();c.font='bold 13px "Gowun Batang", serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle=RED;c.globalAlpha=tell?0.95:0.6;c.fillText(String(i+1),ex,y-11);c.restore();});
  }else if(P.kind==='crows'&&tell){
    const n=T().chasa_crow_slots,gap=P.waves[0],ex=P.dir>0?X+W-10:X+10;
    for(let i=0;i<n;i++){const y=Y+(i+0.5)/n*H;if(i===gap||i===gap+1){blob(c,ex,y,6,4,'#fffaf0',0.8);continue;}
      poly(c,[[ex-5,y],[ex,y-4],[ex+5,y],[ex,y+3]],INK,blink);}
    const a=P.dir>0?-1:1;brush(c,[[X+W/2-a*30,Y+H/2-P.slope*20],[X+W/2+a*30,Y+H/2+P.slope*20]],2.5,RED,0.7);   // 날아갈 쪽
    brush(c,[[X+W/2+a*30,Y+H/2+P.slope*20],[X+W/2+a*22,Y+H/2+P.slope*20-6]],2.5,RED,0.7);brush(c,[[X+W/2+a*30,Y+H/2+P.slope*20],[X+W/2+a*22,Y+H/2+P.slope*20+6]],2.5,RED,0.7);
  }else if(P.kind==='shadow'&&tell){
    const d=Math.max(ch().dark,T().chasa_shadow_start)*H;c.save();c.globalAlpha=0.25+0.2*blink;c.fillStyle=INK;c.fillRect(X,Y,W,d);c.restore();
    brush(c,[[X,Y+H*0.5],[X+W,Y+H*0.5]],1.2,INK,0.3);   // 위쪽 절반
    for(let x=X+10;x<X+W;x+=22)brush(c,[[x,Y+d],[x,Y+d+8]],2,RED,0.6);   // 내려올 쪽 붉은 표
  }
}
/* 먹은 목소리들 (발악 동안) */
function drawChasaOver(c){
  const S=ch();
  for(const v of S.voices){const a=Math.min(1,v.t/12,(v.max-v.t)/20),pic=namePortrait(v.by);
    if(pic){c.save();c.globalAlpha=a*0.3;c.imageSmoothingEnabled=false;c.drawImage(pic,v.x-70,v.y-18,40,32);c.restore();}
    c.save();c.globalAlpha=a*0.8;c.font='14px "Gowun Batang", "Batang", serif';c.textAlign='left';c.textBaseline='middle';
    c.lineJoin='round';c.lineWidth=4;c.strokeStyle='rgba(255,250,240,.85)';c.strokeText(v.text,v.x-26,v.y);c.fillStyle='#5a3a34';c.fillText(v.text,v.x-26,v.y);c.restore();}
}

defineEnemies({
  gangcheol:{name:'어둑차사',calmLabel:'진정',
    // 결정 D-1140: 이름을 먹는 차사. 갓의 차례가 삼혼 부르기, 적패지에 이름이 적힌다 (engine/battle-names.js)
    names:{part:'core',body:'body',scroll:'mouth',mouth:scrollAt,cutAt:()=>({x:BOX.x+BOX.w*0.24,y:BOX.y+BOX.h*0.32})},
    // 결정 D-227: 전투 글귀는 일어난 일만 짧게. 피하라·치라는 안내는 쓰지 않는다
    intro:'언 호수 위에 갓 쓴 그림자가 서 있다. 붉은 천이 바람도 없이 나부낀다.',
    settle:true,markLife:150,
    pickAttack:pickChasa,openMark:chasaOpen,onMarkHit:chasaHit,tickHazards:tickChasa,drawFloor:drawChasaFloor,drawOver:drawChasaOver,
    // 결정 D-370·D-1145: weak 는 부서진 뒤 한 줄
    parts:tableParts('gangcheol',{
      mouth:{atk:'chasaRope',tell:'붉은 적패지가 오랏줄처럼 풀려 나온다.',weak:'적패지가 찢겼다. 오랏줄이 사라지고, 붓 자국이 흐려진다.'},
      body:{atk:'chasaCrows',tell:'소매가 날개처럼 펼쳐진다. 깃 속에서 까마귀 울음이 난다.',weak:'소매가 뜯겼다. 까마귀들이 흩어져 더는 날아들지 않는다.'},
      tail:{atk:'chasaShadow',tell:'도포 자락에서 먹물 같은 어둠이 번진다.',weak:'도포 자락이 찢겼다. 어둠이 더는 번지지 않는다.'},
      core:{tell:'갓 아래 어둠이 숨을 들이켠다.'}}),
    // 결정 D-1147: 달래기는 짚신·주먹밥(초상집 사잣밥)으로만 한다. 반응 글은 tastes.csv
    likes:TABLES.CALM.gangcheol,likeText:'갓 아래 어둠이 잠시 잠잠해진다.',
    coreHidden:'갓이 어둠 속에 가라앉아 있다.',
    coreShown:'어둠이 걷히며 갓이 드러났다.',
    // 짚신을 받았으면 신고 떠나고, 주먹밥만 받았으면 그 앞에 갓을 숙이고 떠난다
    get calmWin(){return gotShoes()?'어둑차사가 짚신을 신고 갓을 숙인다. 적패지를 내려놓고 북쪽 길로 걸어 사라진다. 풀린 붉은 천에서 이름들이 흩어진다.'
      :'어둑차사가 주먹밥 앞에 갓을 숙인다. 적패지를 내려놓고 북쪽 길로 걸어 사라진다. 풀린 붉은 천에서 이름들이 흩어진다.';},calmGift:'frost_whisker',
    win:'갓이 떨어진다. 그 아래는 텅 비어 있다. 도포가 바닥에 내려앉고, 풀린 적패지에서 이름들이 흩어진다.',
    lose:'어둠에 휩쓸려 호숫가로 밀려났다.',
    backdrop:drawNightLake,draw:drawChasa},
});
})();
