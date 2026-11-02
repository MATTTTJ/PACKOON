'use strict';
/* 돌너머 전투: 돌 골렘 (깨어난 성황당 돌무더기). 원본 표: design/data/bosses.csv · boss_parts.csv
   결정 D-182: 겨울 산의 돌 골렘. 눈을 뒤집어쓴 설인과 돌무더기가 섞인 모습이다(사용자 피드백 33·60, 2026-11-01).
   부위 셋은 저마다 다른 돌로 되어 있다: 다리는 넓적한 구들돌, 팔은 흰 차돌, 몸은 눈 껍데기 속의 서리 옥(핵).
   - 다리: 골렘은 제자리에서 발을 높이 들었다가 꾹 찧는다. 다리는 전투 칸에 들어오지 않는다. 칸에는 그림자 뒤 돌 발바닥이
     내리박힌다. 마지막 발바닥은 눈에 박혀 남는다.
   - 팔: 옆으로 젖혔다가 몸 앞을 가로로 휩쓸거나(위나 아래 한 띠만 빈다), 머리 위로 들었다가 칸 한쪽을 위에서 내리쓴다.
     다 쓴 팔은 칸 끝에 걸쳐 멈추고, 쓸려 간 눈이 쏟아진다(가로로 쓸면 위에서, 내리쓰면 옆에서).
   - 눈폭탄: 한 팔씩 번갈아 머리 위로 들었다가 내던진다. 얼굴 없는 큰 눈덩이가 떨어지면 폭탄처럼 파스스 흩어진다.
   결정 D-183: 한 바퀴는 다리·팔(살아 있는 것만, 첫 바퀴는 다리부터) 뒤 마지막에 눈폭탄을 golem_barrage_count 개 던진다.
     눈폭탄을 하나도 안 맞고 버티면 골렘이 숨을 몰아쉬고, 칸 한가운데에 몸의 핵이 golem_core_frames 동안 드러난다.
     맞았거나 핵을 치지 못하면 가슴이 닫히고 한 바퀴를 다시 돈다. 공격 뒤 표식은 이 파일의 openMark 가 정한다.
   결정 D-184: 남은 발바닥(golem_foot_rest)·멈춘 팔(golem_arm_rest)·드러난 핵을 치면 그 부위 내구도가 깎이고
     그 부위의 돌이 확률로 떨어진다. 빗나갈수록 확률이 오른다(tuning.csv golem_stone_*, 피드백 43으로 조금 낮춤).
     눈 껍데기가 남은 핵은 옥돌만 떨어질 수 있고 몸은 버틴다.
   결정 D-250: 얼굴과 차림(사용자 피드백 2026-11-02). 성황제를 받는 돌무더기라 근엄하다. 깎은 돌 머리에 두꺼운 눈썹돌이
     그늘을 드리우고, 그 속 가는 눈에 핵과 같은 서리빛이 돈다. 입은 굳게 다문 한 줄이다(이를 드러내지 않는다).
     어깨에는 금줄(왼새끼에 흰 한지 오리와 솔가지)을 둘렀고, 오른 어깨에 오색 천을 매었다. 이끼와 풍화한 금.
   결정 D-251: 가슴 핵은 깎은 돌 틀에 박힌 맑은 서리빛 보석이다. 속빛이 숨 쉬듯 일렁이고 얼음꽃 무늬가 천천히 돌며,
     품은 서리다래의 그림자가 비친다. 칸 한가운데에 드러나는 핵도 같은 보석이다.
   결정 D-252: 진정은 선물로만 한다(사용자 피드백). 기울어진 소원 돌 바로 놓기(calmAction)를 뺐다. 사연 있는 돌은
     꼭대기에 얹는 짧은 연출(placeGift) 뒤 달래진다.
   결정 D-253: 친 자리가 보이게. 친 표식 자리에서 그 부위 돌 조각이 튀고 짧은 빛 고리가 뜨며, 위의 골렘 그림에서도
     그 부위가 하얗게 번쩍이고 돌 부스러기가 떨어진다. 깎인 만큼 그 부위에 금이 남는다.
   결정 D-254: 발 찧기의 눈. 무거운 돌이 깊은 눈에 내려앉을 때처럼: 발 둘레 눈이 왕관처럼 솟았다 무너지고,
     눈 물결이 밀려 나가며 느려지다 멈춰 둔덕을 남기고, 눈덩이가 포물선으로 날아 떨어지고(떨어질 자리에 그림자),
     고운 가루가 피어올라 바람에 흘러간다. 발바닥·눈 물결·떨어지는 눈덩이에 맞는다.
   결정 D-255: 공격 방향을 섞는다. 팔은 가로 휩쓸기와 위에서 내리쓰기를 번갈아 쓰고, 발 찧기는 손 자리 노리기·
     칸을 가로지르는 걸음·양옆 조이기 가운데 고르며, 눈폭탄은 손 자리 노리기·가로 훑기·세로 훑기를 돌려 쓴다.
   결정 D-256: 눈폭탄 한 대는 통상 공격 피해의 golem_snowball_damage(1/3)만 깎는다.
   결정 D-257: 서리다래는 골렘의 핵 안에서 나온다(사용자 결정 2026-11-02). 이기면 핵이 갈라지며 굴러 나오고,
     달래면 골렘이 핵에서 꺼내 내려놓는다. 어느 쪽이든 보따리에 들어온다. */
(()=>{
const T=()=>TABLES.TUNING;
const SNOW='#f3f5f4',SNOW_SH='#c9d2d8',SLAB='#5b5048',SLAB_LT='#7d7066',QUARTZ='#d2cdc3',QUARTZ_SH='#a39d92',BODY='#6c6e70';
const GEM='#8fcfcb',GEM_DK='#2c6670',GEM_LT='#e4fbf6',SETTING='#8b8478',SETTING_DK='#5c564c',HEAD='#5d5f63',HEAD_LT='#7c7e82',MOSS='#5f7a48';
const ROPE='#b39556',ROPE_DK='#7a6232',PAPER='#f8f4e6',PINE='#3f6a3c';
const CLOTH=['#b8432f','#2f5f9e','#d9a83a','#f2efe6','#3f7d52'];   // 오색 천: 빨강·파랑·노랑·흰색·초록
const ST={tell:46,drop:9,gap:62,sole:26,wave:34,ringMax:96,ringBand:8,stay:18,crumble:16,lift:40,clumpFly:30,clumpHit:13};   // 발 찧기
const AR={tell:52,sweep:72,edge:0.62,stop:40,back:16,vSweep:46,vEdge:0.56,vStop:34};             // 팔 휩쓸기·내리쓰기
const AV={tell:26,speed:2.6,band:13,gap:66,sideSpeed:3.4,sideGap:56};                            // 쓸려 간 눈
const SB={gap:17,wind:14,follow:10,fly:36,radius:30,hit:27,splat:34,spread:56};                   // 눈폭탄
const toScreen=(x,y)=>({x:LW/2+(x-LW/2)*0.84,y:EY+(y-EY)*0.84});
const lerp2=(p,q,k)=>[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k];
const legBroken=()=>part('leg').broken;
const still=()=>Vfx.reducedMotion;
function bodyY(){return EY+2+(legBroken()?22:0)+Math.sin(B.time*0.04)*2+(B.quake>9?3:0);}   // 발을 찧으면 몸이 살짝 내려앉는다

/* ---------- 그림 조각 ---------- */
function poly(c,pts,fill,alpha=1,stroke,lw=1.6){
  c.save();c.globalAlpha=alpha;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();
  if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}c.restore();
}
function star(c,x,y,r,alpha){c.save();c.strokeStyle='#ffffff';c.globalAlpha=alpha;c.lineWidth=1.2;c.beginPath();c.moveTo(x-r,y);c.lineTo(x+r,y);c.moveTo(x,y-r);c.lineTo(x,y+r);c.stroke();c.restore();}
/* 눈 털: 설인처럼 아래로 늘어진 짧은 붓질 */
function fur(c,x,y,n,w,len,alpha=1){
  for(let i=0;i<n;i++){const fx=x-w/2+(i+0.5)*w/n,l=len*(0.7+hash(i*3.1+x)*0.6);
    brush(c,[[fx,y],[fx+(hash(i+y)-0.5)*4,y+l*0.6],[fx+(hash(i*1.7)-0.5)*5,y+l]],3.2,SNOW,0.9*alpha);
    brush(c,[[fx+1.5,y+l*0.4],[fx+2,y+l]],1,SNOW_SH,0.7*alpha);}
}
/* 넓적한 구들돌 한 장 */
function slab(c,x,y,rx,ry,alpha=1,snow=true){
  blob(c,x,y,rx,ry,SLAB,alpha);blob(c,x-rx*0.15,y-ry*0.35,rx*0.8,ry*0.45,SLAB_LT,0.6*alpha);
  c.save();c.strokeStyle=INK;c.globalAlpha=0.7*alpha;c.lineWidth=1.6;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.stroke();c.restore();
  if(snow){blob(c,x-rx*0.3,y-ry*0.75,rx*0.35,ry*0.32,SNOW,0.9*alpha);blob(c,x+rx*0.35,y-ry*0.7,rx*0.25,ry*0.28,SNOW,0.85*alpha);}
}
/* 흰 차돌 덩이: 결을 따라 흰 맥이 난다 */
function quartz(c,x,y,rx,ry,alpha=1,seed=0){
  blob(c,x,y,rx,ry,QUARTZ,alpha);blob(c,x+rx*0.25,y+ry*0.3,rx*0.6,ry*0.45,QUARTZ_SH,0.55*alpha);
  brush(c,[[x-rx*0.7,y-ry*0.1+(seed%3)],[x-rx*0.1,y+ry*0.25],[x+rx*0.6,y-ry*0.2]],1.4,'#fbfaf6',0.9*alpha);
  c.save();c.strokeStyle=INK;c.globalAlpha=0.75*alpha;c.lineWidth=1.6;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.stroke();c.restore();
}
/* 깎인 만큼 남는 금 (결정 D-253). n 줄, seed 로 모양을 고정한다 */
function cracks(c,x,y,w,h,n,seed,alpha=1){
  for(let i=0;i<n;i++){const sx=x+(hash(seed+i*2.3)-0.5)*w,sy=y+(hash(seed+i*4.1)-0.5)*h,a=hash(seed+i*1.7)*Math.PI*2,l=6+hash(seed+i)*8;
    brush(c,[[sx,sy],[sx+Math.cos(a)*l*0.5+2,sy+Math.sin(a)*l*0.5],[sx+Math.cos(a)*l,sy+Math.sin(a)*l]],1.4,INK,0.75*alpha);}
}
/* 돌 발바닥: 넓적한 구들돌 바닥에 투박한 발가락 돌 넷, 위에 눈 */
function drawSole(c,x,y,s,alpha=1){
  blob(c,x,y+3*s,32*s,12*s,'#433a33',alpha);
  slab(c,x,y,30*s,12*s,alpha,false);
  for(let i=0;i<4;i++){const tx=x-21*s+i*14*s;blob(c,tx,y+9*s,7*s,5*s,SLAB,alpha);
    c.save();c.strokeStyle=INK;c.globalAlpha=0.8*alpha;c.lineWidth=1.3;c.beginPath();c.ellipse(tx,y+9*s,7*s,5*s,0,0,Math.PI*2);c.stroke();c.restore();}
  brush(c,[[x-14*s,y-3*s],[x-3*s,y+2*s],[x+6*s,y-4*s]],1.3,INK,0.55*alpha);   // 금
  blob(c,x-8*s,y-9*s,10*s,4*s,SNOW,0.95*alpha);blob(c,x+10*s,y-8*s,7*s,3.5*s,SNOW,0.9*alpha);
}
/* 다리 기둥: 구들돌을 포갠 굵은 기둥 */
function legColumn(c,x0,y0,x1,y1,w,alpha=1){
  brush(c,[[x0,y0],[(x0+x1)/2,(y0+y1)/2],[x1,y1]],w,SLAB,alpha);
  const n=Math.max(2,Math.round(Math.hypot(x1-x0,y1-y0)/18));
  for(let i=0;i<n;i++){const k=(i+0.5)/n;slab(c,x0+(x1-x0)*k,y0+(y1-y0)*k,w*0.62,w*0.24,alpha,i%2===0);}
}
/* 눈덩이: 얼굴 없는 거친 눈뭉치. 가장자리가 울퉁불퉁하다 */
function drawSnowball(c,x,y,r,rot,alpha=1){
  blob(c,x,y,r,r*0.94,SNOW,alpha);blob(c,x+r*0.28,y+r*0.32,r*0.68,r*0.52,SNOW_SH,0.6*alpha);
  blob(c,x-r*0.3,y-r*0.34,r*0.36,r*0.24,'#ffffff',0.8*alpha);
  c.save();c.strokeStyle=INK;c.globalAlpha=0.8*alpha;c.lineWidth=1.6;c.beginPath();
  for(let i=0;i<=10;i++){const a=rot+i*Math.PI/5,rr=r*(0.92+hash(i%10*1.7+3)*0.14),px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*0.94;i?c.lineTo(px,py):c.moveTo(px,py);}
  c.closePath();c.stroke();c.restore();
  for(let i=0;i<4;i++){const a=rot+i*1.6;blob(c,x+Math.cos(a)*r*0.55,y+Math.sin(a)*r*0.5,1.8,1.6,SNOW_SH,0.9*alpha);}
}
/* 서리다래 한 송이: 둥근 열매 넷에 서리 점, 갈색 꼭지와 잎 하나. one 이면 한 색 그림자 */
const DARAE_BERRIES=[[-5,-1],[4,-3],[-1,5],[7,4]];
function drawDaraeShape(c,x,y,s,col){c.save();c.fillStyle=col;for(const [dx,dy] of DARAE_BERRIES){c.beginPath();c.ellipse(x+dx*s,y+dy*s,4.6*s,5.4*s,0,0,Math.PI*2);c.fill();}
  c.lineWidth=1.4*s;c.strokeStyle=col;c.beginPath();c.moveTo(x,y-5*s);c.lineTo(x+1*s,y-11*s);c.stroke();c.restore();}
function drawDarae(c,x,y,s,alpha=1){
  blob(c,x+1,y+2,16*s,14*s,GEM_LT,0.35*alpha);   // 서리빛
  brush(c,[[x,y-5*s],[x+1*s,y-11*s],[x+4*s,y-13*s]],1.6*s,'#5a4a2a',alpha);
  c.save();c.globalAlpha=alpha;c.fillStyle='#6f9a52';c.beginPath();c.ellipse(x+7*s,y-12*s,5*s,2.4*s,-0.5,0,Math.PI*2);c.fill();c.restore();   // 잎
  for(const [dx,dy] of DARAE_BERRIES){const bx=x+dx*s,by=y+dy*s;
    blob(c,bx,by,4.6*s,5.4*s,'#7fa860',alpha);blob(c,bx+1*s,by+1.5*s,3.2*s,3.4*s,'#5f8a44',0.7*alpha);blob(c,bx-1.4*s,by-2*s,1.6*s,1.4*s,'#c9e7b0',0.9*alpha);
    c.save();c.strokeStyle=INK;c.globalAlpha=0.7*alpha;c.lineWidth=1;c.beginPath();c.ellipse(bx,by,4.6*s,5.4*s,0,0,Math.PI*2);c.stroke();c.restore();
    for(let i=0;i<3;i++)blob(c,bx+(hash(dx+i)-0.5)*6*s,by+(hash(dy+i*2)-0.5)*7*s,0.8*s,0.8*s,'#ffffff',0.95*alpha);}   // 서리
}
/* 결정 D-251: 가슴 핵. 깎은 돌 틀(구름무늬 여덟 홈)에 박힌 맑은 서리빛 보석 */
function oct(x,y,rx,ry,rot=Math.PI/8){const p=[];for(let i=0;i<8;i++){const a=rot+i*Math.PI/4;p.push([x+Math.cos(a)*rx,y+Math.sin(a)*ry]);}return p;}
function drawGem(c,x,y,r,glow,alpha=1,opts={}){
  const t=B?B.time:0,ry=r*0.86;
  if(!opts.noSetting){   // 돌 틀
    poly(c,oct(x,y,r+9,ry+8),SETTING,alpha,INK,1.8);
    poly(c,oct(x,y,r+3,ry+2.5),SETTING_DK,0.8*alpha);
    for(let i=0;i<8;i++){const a=i*Math.PI/4,px=x+Math.cos(a)*(r+6),py=y+Math.sin(a)*(ry+5.2);
      c.save();c.strokeStyle='#c8c0b0';c.globalAlpha=0.75*alpha;c.lineWidth=1.1;c.beginPath();c.arc(px,py,2.4,a+Math.PI*0.25,a+Math.PI*1.5);c.stroke();c.restore();}
    brush(c,[[x-r*0.6,y-ry-6],[x+r*0.3,y-ry-7]],1.6,'#b4ac9c',0.8*alpha);   // 틀 윗날의 밝은 면
  }
  if(glow>0)blob(c,x,y,r*1.9,ry*1.8,GEM_LT,0.16*glow*alpha);   // 바깥 빛
  const g=c.createRadialGradient(x-r*0.25,y-ry*0.3,r*0.1,x,y,r);g.addColorStop(0,GEM_LT);g.addColorStop(0.5,GEM);g.addColorStop(1,GEM_DK);
  c.save();c.globalAlpha=alpha;c.fillStyle=g;c.beginPath();c.ellipse(x,y,r,ry,0,0,Math.PI*2);c.fill();c.restore();
  if(!opts.empty){c.save();c.globalAlpha=(0.3+0.15*glow)*alpha;drawDaraeShape(c,x+1,y+2,r/22,'#1d4b54');c.restore();}   // 품은 서리다래 그림자
  const rot=still()?0:t*0.006;   // 얼음꽃: 여섯 가지가 천천히 돈다
  for(let i=0;i<6;i++){const a=rot+i*Math.PI/3,l=r*0.8,ex=x+Math.cos(a)*l,ey=y+Math.sin(a)*l*0.86;
    brush(c,[[x+Math.cos(a)*r*0.2,y+Math.sin(a)*r*0.17],[ex,ey]],1,'#ffffff',0.5*alpha);
    for(const k of [0.48,0.7]){const bx=x+Math.cos(a)*l*k,by=y+Math.sin(a)*l*k*0.86;
      for(const s of [-1,1]){const b2=a+s*0.75;brush(c,[[bx,by],[bx+Math.cos(b2)*r*0.17,by+Math.sin(b2)*r*0.15]],0.8,'#ffffff',0.42*alpha);}}}
  const tb=oct(x,y,r*0.5,ry*0.5,0);   // 면: 맨 위 평면과 빗면
  c.save();c.globalAlpha=0.32*alpha;c.strokeStyle='#ffffff';c.lineWidth=0.9;c.beginPath();tb.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.stroke();
  for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(tb[i][0],tb[i][1]);c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*ry);c.stroke();}c.restore();
  blob(c,x,y,r*0.42,ry*0.4,GEM_LT,(0.2+0.45*glow)*alpha);   // 숨 쉬는 속빛
  blob(c,x-r*0.42,y-ry*0.45,r*0.24,ry*0.13,'#ffffff',0.85*alpha);   // 반사
  c.save();c.strokeStyle=INK;c.globalAlpha=0.85*alpha;c.lineWidth=1.6;c.beginPath();c.ellipse(x,y,r,ry,0,0,Math.PI*2);c.stroke();c.restore();
  if(!still()){const tw=(Math.sin(t*0.09)+1)/2;star(c,x+r*0.55,y-ry*0.55,2.5+3*tw,(0.35+0.55*tw)*alpha);}
}
/* 금줄과 오색 천 (결정 D-250) */
function ropeAt(x,by,k){return [x-74+148*k,by-24+Math.sin(k*Math.PI)*22];}
function drawRope(c,x,by,a){
  const pts=[];for(let i=0;i<=16;i++)pts.push(ropeAt(x,by,i/16));
  brush(c,pts,6,ROPE_DK,a);brush(c,pts,4.4,ROPE,a);
  for(let i=0;i<30;i++){const k=(i+0.5)/30,[px,py]=ropeAt(x,by,k);brush(c,[[px-2,py-2],[px+1.5,py+2]],1.2,ROPE_DK,0.8*a);}   // 왼새끼 꼬임
  const sway=still()?0:B.time*0.05;
  for(const k of [0.14,0.3,0.46,0.62,0.78,0.92]){const [px,py]=ropeAt(x,by,k),sw=Math.sin(sway+k*9)*1.6,L=13+hash(k*7)*5;   // 흰 한지 오리
    poly(c,[[px-2.6,py+1],[px+2.6,py+1],[px+2.6+sw,py+L],[px-2.6+sw,py+L]],PAPER,0.95*a,INK,0.8);}
  for(const k of [0.22,0.54,0.86]){const [px,py]=ropeAt(x,by,k);   // 솔가지
    for(let j=-2;j<=2;j++)brush(c,[[px,py],[px+j*2.4,py-6-Math.abs(j)]],1.2,PINE,0.9*a);}
}
function drawCloth(c,x,y,a){
  blob(c,x,y,5,4,ROPE,a);c.save();c.strokeStyle=INK;c.globalAlpha=0.6*a;c.lineWidth=1;c.beginPath();c.ellipse(x,y,5,4,0,0,Math.PI*2);c.stroke();c.restore();
  const t=still()?0:B.time;
  CLOTH.forEach((col,i)=>{const pts=[];for(let s=0;s<=7;s++){const k=s/7;pts.push([x+2+k*(2+i*8)+Math.sin(t*0.08+i+k*4)*5*k,y+2+k*(30+i*5)+Math.cos(t*0.07+i*1.3+k*3)*1.5*k]);}
    brush(c,pts,4.6,col,0.95*a);brush(c,pts.map(([px,py])=>[px+2.2,py]),0.8,INK,0.3*a);});
}

/* ---------- 효과 (결정 D-253) ---------- */
const HIT_COL={leg:SLAB,arm:QUARTZ,head:GEM};
/* 위 골렘 그림에서 그 부위가 있는 자리 (0.84배 전의 좌표) */
function figPos(id){
  const cx=LW/2,by=bodyY();
  if(id==='leg'){const s=B.restSole&&B.restSole.x<BOX.x+BOX.w/2?-1:1;return [cx+s*46,EY+90];}
  if(id==='arm'){const s=B.restArm?B.restArm.side:1;return [cx+s*110,by+70];}
  return [cx,by+18];
}
function golemImpact(id,x,y){
  const col=HIT_COL[id]||SLAB;
  const sh=B.gShards||(B.gShards=[]);
  for(let i=0;i<12;i++){const a=-Math.PI/2+(Math.random()-0.5)*2.6,s=2+Math.random()*3.4;
    sh.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:2+Math.random()*3.5,rot:Math.random()*6,vr:(Math.random()-0.5)*0.4,t:34,col:i%3?col:INK});}
  for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*2;sh.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-0.5,r:4+Math.random()*4,t:22,dust:true,col:id==='head'?GEM_LT:'#d9d4ca'});}
  B.gImpact={x,y,t:16};B.gHurt={id,t:16};B.quake=Math.max(B.quake||0,7);
  const [fx,fy]=figPos(id),ch=B.gChips||(B.gChips=[]);
  for(let i=0;i<8;i++)ch.push({x:fx+(Math.random()-0.5)*24,y:fy+(Math.random()-0.5)*16,vx:(Math.random()-0.5)*2.4,vy:-1-Math.random()*1.5,r:2+Math.random()*3,t:40,col:i%2?col:SNOW});
}
/* 눈 부스러기 튀기 */
function snowBurst(x,y,n,up){for(let i=0;i<n;i++){const a=up?-Math.PI/2+(Math.random()-0.5)*2.2:Math.random()*Math.PI*2,s=1.2+Math.random()*2.8;
  B.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:2+Math.random()*3.5,t:30,col:Math.random()<0.75?SNOW:SNOW_SH});}}
/* 눈폭탄이 터질 때: 고운 눈가루가 파스스 넓게 흩어지고 굵은 덩이가 몇 개 튄다. 떨어진 자리엔 눈가루가 잠깐 남는다 */
function snowPowder(x,y,small){
  const n=small?12:30;
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=(small?1.4:2.6)+Math.random()*(small?2:3.6);
    B.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*0.7,r:1+Math.random()*2,t:20+Math.random()*14,col:Math.random()<0.45?SNOW:Math.random()<0.6?SNOW_SH:'#9fb0bb'});}
  if(!small)for(let i=0;i<7;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*1.8;B.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*0.7-0.6,r:3.5+Math.random()*2.5,t:30,col:SNOW});}
  (B.snowSpots||(B.snowSpots=[])).push({x,y,t:small?90:150,seed:Math.random()*6,s:small?0.55:1});if(B.snowSpots.length>14)B.snowSpots.shift();
}
/* 발 찧기 뒤 피어오르는 고운 눈가루. 바람 따라 한쪽으로 흘러간다 (결정 D-254) */
function plume(x,y){(B.gPlumes||(B.gPlumes=[])).push({x,y,t:0,max:70,drift:(Math.random()<0.5?-1:1)*(0.5+Math.random()*0.4),seed:Math.random()*9});}

/* ---------- 지금 진행 중인 공격 (그림이 쓰는 상태) ---------- */
const ringEnd=hit=>hit+ST.wave;
const waveR=k=>ST.sole+(ST.ringMax-ST.sole)*(1-Math.pow(1-clamp(k,0,1),2));   // 눈 물결은 밀려 나가며 느려진다
function stompPhase(b){const a=b.delay,tl=a+ST.tell,hit=tl+ST.drop,ring=ringEnd(hit);
  return {wait:b.t<=a,tell:b.t>a&&b.t<=tl,falling:b.t>tl&&b.t<=hit,hit,ring,k:clamp((b.t-a)/ST.tell,0,1),end:b.last?ring:ring+ST.stay+ST.crumble};}
const stompOf=foot=>B.bullets.find(b=>b.k==='golemStomp'&&b.foot===foot&&b.t>b.delay&&b.t<=stompPhase(b).hit+14);
const armBullet=()=>B.bullets.find(b=>b.k==='golemArm');
const armFrom=(side,orient='h')=>orient==='v'?BOX.y-40:side<0?BOX.x-40:BOX.x+BOX.w+40;
const armTo=(side,orient='h')=>orient==='v'?BOX.y+BOX.h-AR.vStop:side<0?BOX.x+BOX.w-AR.stop:BOX.x+AR.stop;   // 다 쓴 주먹은 칸 끝에 걸쳐 멈춘다
function armPhase(b){const v=b.orient==='v',sw=v?AR.vSweep:AR.sweep,k=clamp((b.t-AR.tell)/sw,0,1),e=v?k*k:(k<0.5?2*k*k:1-2*(1-k)*(1-k)),from=armFrom(b.side,b.orient),to=armTo(b.side,b.orient);
  return {tell:b.t<=AR.tell,sweep:b.t>AR.tell,k,e,from,hand:from+(to-from)*e,sw};}
function armBand(cov){return cov==='top'?[BOX.y,BOX.y+BOX.h*AR.edge]:[BOX.y+BOX.h*(1-AR.edge),BOX.y+BOX.h];}
function armEdgeY(cov){return cov==='top'?BOX.y+BOX.h*AR.edge:BOX.y+BOX.h*(1-AR.edge);}
function armBandV(side){return side<0?[BOX.x,BOX.x+BOX.w*AR.vEdge]:[BOX.x+BOX.w*(1-AR.vEdge),BOX.x+BOX.w];}
const throwOf=s=>B.bullets.find(b=>b.k==='golemSnowball'&&b.side===s&&b.t>b.delay&&b.t<=b.delay+SB.wind+SB.follow);

/* ---------- 골렘 그림 (상대 자리, 0.84배로 그려진다) ---------- */
function endScene(){const e=B.gEnd;if(!e||B.st!=='end')return null;return {kind:e.kind,k:clamp(1-B.t/e.max,0,1)};}
function drawGolem(c,noFruit){
  const cx=LW/2,cy=EY,leg=part('leg'),arm=part('arm'),core=part('head'),end=endScene();
  const by=bodyY(),rest=!!(B.mark&&B.mark.rest),GY=cy+124,hurt=B.gHurt&&B.gHurt.t>0?B.gHurt:null;
  const flashOf=id=>hurt&&hurt.id===id?hurt.t/16:0;
  blob(c,cx,cy+130,150,12,INK,0.1);
  // 다리: 구들돌 기둥과 넓적한 돌 발. 찧을 발은 예고 동안 높이 들리고, 떨어지며 제자리를 꾹 찧는다. 칸으로 뻗지 않는다.
  {const a=leg.broken?0.35:1,o=shk(leg),flash=partCol(leg)===RED,dmg=leg.max-leg.hp,hf=flashOf('leg');
    [-1,1].forEach(s=>{const hipX=cx+s*44+o,hipY=by+50,st=stompOf(s);let lift=0;
      if(st){const p=stompPhase(st);
        if(p.tell)lift=ST.lift*(1-Math.pow(1-p.k,2));
        else if(p.falling)lift=ST.lift*(1-(st.t-st.delay-ST.tell)/ST.drop);
        else{const d=st.t-p.hit,al=1-d/14,fx=hipX+s*4;   // 찧은 발 밑에서 눈이 튀고 땅에 금이 간다
          for(let i=0;i<5;i++){const ang=Math.PI+i*Math.PI/4;blob(c,fx+Math.cos(ang)*(30+d*2),GY+6+Math.sin(ang)*6-d*0.6,4,3,SNOW,0.9*al);}
          brush(c,[[fx-34,GY+12],[fx-12,GY+9],[fx+6,GY+13],[fx+30,GY+10]],1.4,INK,0.6*al);}}
      const fx=hipX+s*(4+lift*0.3);
      legColumn(c,hipX,hipY,fx,GY-6-lift,30,a);drawSole(c,fx,GY+1-lift,0.8,a);
      if(dmg>0)cracks(c,(hipX+fx)/2,(hipY+GY-6-lift)/2,22,40,dmg*2,s*11+3,a);
      if(hf)blob(c,(hipX+fx)/2,(hipY+GY)/2,22,44,'#ffffff',0.55*hf);
      if(flash)brush(c,[[hipX-16,hipY],[hipX-18,GY-6-lift]],2,RED,0.8);});}
  // 몸: 웅크린 돌무더기에 눈 털을 뒤집어썼다
  {const o=shk(core),a=core.broken&&!end?0.35:1,x=cx+o;
    blob(c,x,by+22,92,64,BODY,a);
    for(const [dx,dy,rx,ry,col] of [[-40,10,34,26,'#5f6163'],[34,20,30,24,'#76787a'],[-8,44,40,22,'#5a5c5e'],[44,-14,22,18,'#64666a']])blob(c,x+dx,by+dy,rx,ry,col,a);
    c.save();c.strokeStyle=INK;c.globalAlpha=0.8*a;c.lineWidth=2.4;c.beginPath();c.ellipse(x,by+22,92,64,0,Math.PI*1.05,Math.PI*1.95);c.stroke();c.restore();
    blob(c,x-60,by+40,9,5,MOSS,0.7*a);blob(c,x+52,by+50,7,4,MOSS,0.6*a);   // 풍화한 돌의 이끼
    fur(c,x-6,by-34,11,170,26,a);fur(c,x-70,by+6,4,30,40,a);fur(c,x+70,by+6,4,30,40,a);fur(c,x,by+66,8,120,14,a*0.8);
    blob(c,x,by-40,74,20,SNOW,0.95*a);blob(c,x-58,by-26,26,13,SNOW,0.9*a);blob(c,x+58,by-26,26,13,SNOW,0.9*a);   // 어깨에 쌓인 눈
    drawRope(c,x,by,a);drawCloth(c,x+64,by-30,a);   // 결정 D-250: 금줄과 오색 천
    // 가슴: 눈 껍데기 속 서리 옥. 다리나 팔을 하나 꺾으면 껍데기가 깨지고, 몸이 빌 때는 껍데기가 벌어져 빛난다.
    const open=!coreHidden()||(end&&end.kind==='calm'&&end.k>0.15),glow=rest?0.6+0.4*Math.sin(B.time*0.25):0.35+0.15*Math.sin(B.time*0.05),gy=by+18;
    if(end)drawEndCore(c,x,gy,end,a);
    else if(open||rest){drawGem(c,x,gy,19+(rest?2:0),glow,a);
      const dmg=core.max-core.hp;if(dmg>0)cracks(c,x,gy,40,30,dmg*2,7,a);}
    if(!open&&!end){const sp=rest?5:0;   // 눈 껍데기: 납작한 눈 덩이 하나. 몸이 빌 때는 금이 벌어지고 속빛이 샌다
      c.save();c.globalAlpha=0.97*a;c.fillStyle=SNOW;c.beginPath();c.moveTo(x-30,by+20);c.quadraticCurveTo(x-24,by+2,x-6,by+6);c.quadraticCurveTo(x+8,by-2,x+26,by+8);c.quadraticCurveTo(x+34,by+22,x+22,by+34);c.quadraticCurveTo(x,by+42,x-20,by+34);c.closePath();c.fill();
      c.strokeStyle=INK;c.globalAlpha=0.5*a;c.lineWidth=1.4;c.stroke();c.restore();
      blob(c,x+8,by+28,14,5,SNOW_SH,0.7*a);
      brush(c,[[x-22-sp,by+14],[x-8,by+20+sp*0.3],[x+4,by+15],[x+18+sp,by+24]],2.4,GEM_LT,(0.5+0.4*glow)*a);   // 금 사이로 새는 서리빛
      brush(c,[[x-22-sp,by+14],[x-8,by+20+sp*0.3],[x+4,by+15],[x+18+sp,by+24]],1.2,GEM_DK,0.7*a);
      if(rest)brush(c,[[x-8,by+20],[x-4,by+28],[x-10,by+34]],1.3,GEM_DK,0.6*a);}
    const hf=flashOf('head');if(hf)blob(c,x,gy,34,30,'#ffffff',0.5*hf);
    if(partCol(core)===RED)c.save(),c.strokeStyle=RED,c.lineWidth=2.5,c.beginPath(),c.ellipse(x,by+22,96,68,0,0,Math.PI*2),c.stroke(),c.restore();}
  // 머리: 결정 D-250. 오래 비바람에 깎인 모난 돌 머리. V 자로 처진 눈썹돌이 깊은 그늘을 드리우고, 그 속 가는 눈에 서리빛이 돈다.
  // 입은 곧게 다문 한 줄(웃지도 찡그리지도 않는다). 턱 밑으로 고드름 수염이 늘어진다.
  {const o=shk(core),bow=end&&end.kind==='calm'?Math.min(1,end.k*1.6)*7:0,hx=cx+o,hy=by-48+bow,a=core.broken&&!end?0.35:1;
    const dim=core.broken||(end&&(end.kind==='win'||end.k>0.55)),P=pts=>pts.map(([dx,dy])=>[hx+dx,hy+dy]);
    fur(c,hx,hy+22,9,44,22,a);   // 고드름 수염
    poly(c,P([[-30,-17],[-21,-26],[-2,-29],[20,-26],[31,-15],[35,3],[29,19],[15,27],[-13,27],[-28,20],[-35,3]]),HEAD,a,INK,2.2);
    poly(c,P([[-28,-15],[-20,-23],[-2,-26],[8,-22],[-6,-14],[-30,-4]]),HEAD_LT,0.4*a);   // 위 왼쪽 밝은 면
    poly(c,P([[14,8],[29,10],[24,20],[13,24]]),'#4c4e52',0.6*a);   // 오른 볼 그늘
    blob(c,hx+21,hy+17,6,3,MOSS,0.8*a);blob(c,hx-26,hy+10,4,2.5,MOSS,0.7*a);blob(c,hx-8,hy-26,7,2.4,MOSS,0.7*a);
    brush(c,[[hx+16,hy-25],[hx+20,hy-17],[hx+17,hy-10]],1.2,INK,0.55*a);brush(c,[[hx-19,hy+14],[hx-14,hy+22]],1.1,INK,0.5*a);
    brush(c,[[hx-30,hy-21],[hx-8,hy-31],[hx+14,hy-30],[hx+30,hy-20]],9,SNOW,0.95);fur(c,hx+2,hy-24,6,48,6,0.9);
    poly(c,P([[-37,-10],[-14,-6],[0,-2],[14,-6],[37,-10],[34,-1],[14,3],[0,6],[-14,3],[-34,-1]]),'#5b5d62',a,INK,1.6);   // 눈썹돌
    brush(c,[[hx-34,hy-9],[hx-14,hy-5],[hx,hy-1.5],[hx+14,hy-5],[hx+34,hy-9]],1.3,'#8d8f93',0.8*a);blob(c,hx-20,hy-9,7,1.8,SNOW,0.9);blob(c,hx+22,hy-10,6,1.6,SNOW,0.85);
    blob(c,hx,hy+7.5,24,3.2,'#2a2a2e',0.38*a);   // 눈썹돌 밑 그늘
    if(!dim){const [ex]=lookAt(toScreen(hx,hy).x,toScreen(hx,hy).y);
      for(const s of [-1,1]){const exx=hx+s*12+ex*0.4;blob(c,exx,hy+7,7,2.6,GEM_LT,0.2);   // 안쪽 끝이 처진 가는 눈
        poly(c,[[exx-5.5,hy+6.2+(s>0?1.2:0)],[exx+5.5,hy+6.2+(s<0?1.2:0)],[exx+4,hy+8.2],[exx-4,hy+8.2]],GEM_LT,0.95);}}
    else for(const s of [-1,1])brush(c,[[hx+s*7,hy+7],[hx+s*17,hy+7]],1.8,INK,0.8);
    brush(c,[[hx,hy+4],[hx-1,hy+13],[hx-5,hy+15]],1.8,INK,0.5*a);brush(c,[[hx+1.5,hy+5],[hx+1,hy+12]],1.2,HEAD_LT,0.7*a);brush(c,[[hx-1,hy+15],[hx+5,hy+15]],1.4,INK,0.45*a);   // 넓적한 코
    brush(c,[[hx-11,hy+20],[hx+11,hy+20]],2.2,INK,0.85*a);   // 곧게 다문 입
    if(coreHidden()&&!rest&&!end){c.save();c.strokeStyle=INK;c.globalAlpha=.35;c.lineWidth=2;for(let i=0;i<2;i++){c.beginPath();c.arc(cx,by+18,32+i*7,Math.PI*0.15,Math.PI*0.85);c.stroke();}c.restore();}}
  // 팔: 길게 늘어진 설인 팔, 차돌 마디와 큰 주먹. 가로로 쓸 팔은 옆으로 젖혔다가 몸 앞을 쓸고, 내리쓸 팔은 머리 위로 들었다가 앞으로 내리친다.
  // 던질 팔은 눈덩이를 쥐고 머리 위로 들었다가 앞으로 내던진다.
  {const a=arm.broken?0.32:1,o=shk(arm),drop=arm.broken?40:0,ab=armBullet(),ra=B.restArm,dmg=arm.max-arm.hp,hf=flashOf('arm');
    const idleEl=s=>[cx+s*98,by+34+drop*0.6],idleHd=s=>[cx+s*106,by+96+drop];
    [-1,1].forEach(s=>{const shX=cx+s*72+o,shY=by-20;let el=idleEl(s),hd=idleHd(s),ball=null;
      const sweepPose=k=>{const hx=cx+s*(196-366*k);return [[(shX+hx)/2+s*12,by+44],[hx,by+80+6*k]];};
      const upEl=[cx+s*96,by-70],upHd=[cx+s*84,by-128],downEl=[cx+s*96,by+40],downHd=[cx+s*72,by+124];
      const chopPose=k=>[lerp2(upEl,downEl,k),lerp2(upHd,downHd,k)];
      if(ab&&ab.side===s){const p=armPhase(ab);
        if(p.tell){const e=1-Math.pow(1-clamp(ab.t/AR.tell,0,1),2);
          if(ab.orient==='v'){el=lerp2(idleEl(s),upEl,e);hd=lerp2(idleHd(s),upHd,e);}
          else{el=lerp2(idleEl(s),[cx+s*132,by-8],e);hd=lerp2(idleHd(s),[cx+s*196,by+8],e);}}
        else [el,hd]=ab.orient==='v'?chopPose(p.e):sweepPose(p.e);}
      else if(ra&&ra.side===s){const u=clamp((ra.back||0)/AR.back,0,1),[e1,h1]=ra.orient==='v'?chopPose(1):sweepPose(1);el=lerp2(e1,idleEl(s),u);hd=lerp2(h1,idleHd(s),u);}
      else{const th=throwOf(s);
        if(th){const d=th.t-th.delay,up=[[cx+s*96,by-48],[cx+s*80,by-96]],fw=[[cx+s*70,by+12],[cx+s*34,by+66]];
          if(d<=SB.wind){const e=1-Math.pow(1-d/SB.wind,2);el=lerp2(idleEl(s),up[0],e);hd=lerp2(idleHd(s),up[1],e);ball=th;}
          else{const e=(d-SB.wind)/SB.follow;el=lerp2(up[0],fw[0],e);hd=lerp2(up[1],fw[1],e);}}}
      brush(c,[[shX,shY],el,hd],20,QUARTZ_SH,0.9*a);
      quartz(c,(shX+el[0])/2,(shY+el[1])/2,15,13,a,s+2);quartz(c,el[0],el[1],14,12,a,s+4);quartz(c,(el[0]+hd[0])/2,(el[1]+hd[1])/2,13,11,a,s+5);
      if(dmg>0)cracks(c,el[0],el[1],26,22,dmg*2,s*5+21,a);
      fur(c,shX+s*6,shY-6,3,26,24,a);
      for(let i=0;i<3;i++)quartz(c,hd[0]+s*(i-1)*9,hd[1]+(i===1?4:0),9,10,a,i+7);   // 주먹 마디
      quartz(c,hd[0]-s*4,hd[1]-8,14,11,a,s+9);
      if(hf&&ra&&ra.side===s)blob(c,(el[0]+hd[0])/2,(el[1]+hd[1])/2,24,30,'#ffffff',0.55*hf);
      if(ball)drawSnowball(c,hd[0],hd[1]-18,16,ball.t*0.05);   // 쥐고 든 눈덩이
      if(partCol(arm)===RED)brush(c,[[shX,shY],el,hd],3,RED,0.7);});}
  for(const ch of B.gChips||[])blob(c,ch.x,ch.y,ch.r,ch.r*0.8,ch.col,Math.min(1,ch.t/14));   // 친 부위에서 떨어지는 돌 부스러기
  if(end&&!noFruit)drawEndFruit(c,cx,by+18,GY,end);
}
/* 결정 D-257: 끝 장면의 핵. 이기면 금이 번지다 두 쪽으로 갈라지고, 달래면 눈 껍데기가 떨어지고 핵이 환해진다 */
function drawEndCore(c,x,y,end,a){
  const k=end.k;
  if(end.kind==='win'){
    const crack=clamp(k/0.35,0,1),gap=clamp((k-0.35)/0.2,0,1)*11;
    if(gap<=0){drawGem(c,x,y,19,0.6+0.4*crack,a,{});
      for(let i=0;i<7;i++){const ang=i*0.9+0.3,l=(8+hash(i)*12)*crack;brush(c,[[x,y],[x+Math.cos(ang)*l*0.5+2,y+Math.sin(ang)*l*0.45],[x+Math.cos(ang)*l,y+Math.sin(ang)*l*0.86]],1.5,INK,0.85);}}
    else for(const s of [-1,1]){c.save();c.translate(s*gap,s*gap*0.3);c.beginPath();c.rect(s<0?x-60:x,y-60,60,120);c.clip();   // 반쪽씩 벌어진다
      drawGem(c,x,y,19,0.4,a,{empty:true});c.restore();
      brush(c,[[x+s*gap,y-17],[x+s*gap+s*2,y-6],[x+s*gap,y+3],[x+s*gap+s*3,y+16]],1.6,INK,0.8);}
  }else{
    const open=clamp(k/0.3,0,1);drawGem(c,x,y,19+open*2,0.5+0.5*open,a,{empty:k>0.45});
    if(k<0.3){const f=1-open;blob(c,x,y+6+open*30,30*f+4,20*f+3,SNOW,0.95*f);}   // 눈 껍데기가 흘러내린다
    if(open>0.5&&!still())for(let i=0;i<8;i++){const ang=i*Math.PI/4+B.time*0.01,l=30+10*Math.sin(B.time*0.1+i);brush(c,[[x+Math.cos(ang)*24,y+Math.sin(ang)*20],[x+Math.cos(ang)*l,y+Math.sin(ang)*l*0.86]],1.2,GEM_LT,0.6);}
  }
}
/* 핵에서 나온 서리다래가 앞 눈밭으로 내려온다 */
function drawEndFruit(c,cx,y0,GY,end){
  const k=end.k,win=end.kind==='win';
  const from=win?0.4:0.45;if(k<from)return;
  const u=clamp((k-from)/(1-from),0,1);
  let x,y,s;
  const GL=GY-4;   // 발 앞 눈밭 (글귀 줄과 겹치지 않게)
  if(win){x=cx+u*34;const land=Math.min(1,u/0.7);y=y0+(GL-y0)*land*land-(u<0.7?22*Math.sin(land*Math.PI):6*Math.abs(Math.sin((u-0.7)/0.3*Math.PI)));s=1.3;}
  else{const out=Math.min(1,u/0.35);x=cx;y=u<0.35?y0-out*14:y0-14+(GL-(y0-14))*((u-0.35)/0.65);s=1+0.5*out;}
  if(!still())for(let i=0;i<5;i++){const a=B.time*0.05+i*1.3;star(c,x+Math.cos(a)*18,y+Math.sin(a)*14,1.8,0.6);}
  drawDarae(c,x,y,s,1);
}
/* 상자 안의 차돌 팔: from(칸 밖 팔 뿌리)에서 hand(주먹)까지 띠를 채운다. push 면 주먹 앞에 밀린 눈 */
function drawArmIn(c,side,cov,hand,alpha,push){
  const [y0,y1]=armBand(cov),mid=(y0+y1)/2,th=(y1-y0)*0.78,from=armFrom(side);
  c.save();c.globalAlpha=alpha;c.fillStyle='#bdb7ab';c.fillRect(Math.min(from,hand),mid-th/2,Math.abs(hand-from),th);c.restore();
  for(let x=from-side*10,n=0;(side<0?x<hand-20:x>hand+20)&&n<30;x-=side*26,n++){quartz(c,x,mid-th*0.22,15,th*0.24,alpha,Math.round(x));quartz(c,x+side*12,mid+th*0.2,14,th*0.22,alpha,Math.round(x)+1);}
  c.save();c.strokeStyle=INK;c.globalAlpha=0.9*alpha;c.lineWidth=2.6;c.beginPath();c.moveTo(from,mid-th/2);c.lineTo(hand,mid-th/2);c.moveTo(from,mid+th/2);c.lineTo(hand,mid+th/2);c.stroke();c.restore();
  fur(c,(from+hand)/2,mid-th/2-2,6,Math.abs(hand-from)*0.6,8,0.9*alpha);
  for(let i=0;i<3;i++)quartz(c,hand+side*8,mid-th*0.34+i*th*0.34,17,th*0.21,alpha,i+5);   // 주먹 마디
  if(push){const w=12+18*push;blob(c,hand-side*24,mid+th*0.15,w,th*0.4,SNOW,0.95);   // 주먹 앞(가는 쪽)에 밀린 눈
    c.save();c.strokeStyle=INK;c.globalAlpha=0.5;c.lineWidth=1.2;c.beginPath();c.ellipse(hand-side*24,mid+th*0.15,w,th*0.4,0,Math.PI,Math.PI*2);c.stroke();c.restore();}
}
/* 결정 D-255: 위에서 내리쓰는 차돌 팔. 칸 위(from)에서 hand(주먹)까지 세로 띠를 채운다 */
function drawArmInV(c,side,hand,alpha,push){
  const [x0,x1]=armBandV(side),mid=(x0+x1)/2,th=(x1-x0)*0.62,from=armFrom(side,'v');
  c.save();c.globalAlpha=alpha;c.fillStyle='#bdb7ab';c.fillRect(mid-th/2,from,th,Math.max(0,hand-from));c.restore();
  for(let y=from+8,n=0;y<hand-18&&n<20;y+=24,n++){quartz(c,mid-th*0.2,y,th*0.24,13,alpha,Math.round(y));quartz(c,mid+th*0.22,y+11,th*0.22,12,alpha,Math.round(y)+1);}
  c.save();c.strokeStyle=INK;c.globalAlpha=0.9*alpha;c.lineWidth=2.6;c.beginPath();c.moveTo(mid-th/2,from);c.lineTo(mid-th/2,hand);c.moveTo(mid+th/2,from);c.lineTo(mid+th/2,hand);c.stroke();c.restore();
  for(let i=0;i<3;i++)quartz(c,mid-th*0.32+i*th*0.32,hand+8,th*0.19,15,alpha,i+5);   // 주먹 마디
  if(push){const w=th*0.55+10*push;blob(c,mid,hand+22,w,8+6*push,SNOW,0.95);   // 주먹 밑에 짓눌려 퍼지는 눈
    c.save();c.strokeStyle=INK;c.globalAlpha=0.5;c.lineWidth=1.2;c.beginPath();c.ellipse(mid,hand+22,w,8+6*push,0,0,Math.PI);c.stroke();c.restore();}
}
function drawRestArm(c,ra){
  const u=clamp((ra.back||0)/AR.back,0,1),from=armFrom(ra.side,ra.orient);
  if(ra.orient==='v')drawArmInV(c,ra.side,ra.hand+(from-ra.hand)*u,1,0);else drawArmIn(c,ra.side,ra.cov,ra.hand+(from-ra.hand)*u,1,0);
}
/* 결정 D-62: 모든 전투 배경은 상대 뒤쪽 화면 전체로 그린다 (design/data/decisions.csv).
   돌 골렘은 눈 쌓인 돌산 절벽 길. 양쪽 절벽 턱마다 눈, 길가의 눈 덮인 돌탑과 장승, 굵은 눈발.
   결정 D-257: 서리다래는 골렘 핵 안에 있으니 절벽 다래 덩굴에는 열매를 그리지 않는다(잎 진 줄기만). */
function drawStoneCliff(c){
  const t=B.time,stil=still(),gy=BOX.y-52,STONE='rgba(96,98,100,';
  let g=c.createLinearGradient(0,0,0,gy);g.addColorStop(0,'rgba(120,138,156,.22)');g.addColorStop(1,'rgba(150,164,178,.06)');
  c.save();c.fillStyle=g;c.fillRect(0,0,LW,gy);c.restore();
  // 먼 눈 덮인 봉우리
  c.save();c.globalAlpha=0.09;c.fillStyle=INK;c.beginPath();c.moveTo(LW*0.2,gy);
  for(const [x,y] of [[0.3,0.35],[0.38,0.55],[0.47,0.25],[0.56,0.5],[0.64,0.3],[0.74,1]])c.lineTo(LW*x,y===1?gy:gy*y);
  c.closePath();c.fill();c.restore();
  for(const [x,y] of [[0.47,0.25],[0.64,0.3],[0.3,0.35]])blob(c,LW*x,gy*y+6,16,5,SNOW,0.55);
  // 양쪽 절벽: 들쭉날쭉한 바위 벽, 턱마다 쌓인 눈
  const cliff=(side)=>{
    const x0=side<0?0:LW,edge=side<0?LW*0.27:LW*0.73,pts=[[x0,0]];
    for(let i=0;i<=8;i++){const y=i*gy/8;pts.push([edge+side*(-1)*(hash(i*2.1+side)*28-14)+side*Math.sin(i*1.3)*10,y]);}
    pts.push([x0,gy]);
    c.save();c.fillStyle=STONE+'.16)';c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(const p of pts)c.lineTo(p[0],p[1]);c.closePath();c.fill();c.restore();
    brush(c,pts.slice(1,-1),4,INK,0.42);
    for(let i=1;i<pts.length-1;i+=2)blob(c,pts[i][0]+side*10,pts[i][1]+2,14,4,SNOW,0.75);
    for(let i=0;i<7;i++){const y=20+hash(i*3.7+side)*(gy-40),x=side<0?hash(i*1.9)*edge*0.85:LW-hash(i*1.9)*(LW-edge)*0.85;
      brush(c,[[x,y],[x+side*(-8),y+10],[x+side*(-4),y+22]],1.4,INK,0.25);}
  };
  cliff(-1);cliff(1);
  // 잎 진 다래 덩굴: 오른쪽 절벽 위에서 늘어진 줄기
  for(let k=0;k<4;k++){
    const x=LW*0.76+k*LW*0.045,len=gy*(0.35+hash(k*2.2)*0.25),sw=stil?0:Math.sin(t*0.025+k)*4;
    const pts=[];for(let s=0;s<=6;s++)pts.push([x+Math.sin(s*0.9+k)*8+sw*s/6,s*len/6]);
    brush(c,pts,2,'#4f6b3a',0.45);
    for(let s=2;s<=6;s+=2)blob(c,pts[s][0]+3,pts[s][1]+1,2.4,1.2,SNOW,0.7);   // 덩굴 마디에 앉은 눈
  }
  // 눈 쌓인 길바닥
  c.save();c.fillStyle='rgba(236,240,242,.55)';c.fillRect(0,gy,LW,LH-gy);c.restore();
  brush(c,[[0,gy+2],[LW*0.4,gy-3],[LW,gy+3]],4,INK,0.45);
  for(let i=0;i<10;i++)blob(c,hash(i*7.3)*LW,gy+10+hash(i*3.1)*(LH-gy-20),5+hash(i)*8,3,STONE+'1)',0.1);
  // 눈 덮인 돌탑: 왼쪽 길가에 크고 작은 둘
  const tower=(x,n,s)=>{let y=gy+2;for(let i=0;i<n;i++){const rw=(16-i*2.2)*s,rh=(6-i*0.4)*s;y-=rh*1.6;
    blob(c,x+(hash(x*0.1+i)-0.5)*3,y,rw,rh,STONE+'1)',0.32);c.save();c.strokeStyle=INK;c.globalAlpha=0.45;c.lineWidth=1.4;c.beginPath();c.ellipse(x+(hash(x*0.1+i)-0.5)*3,y,rw,rh,0,0,Math.PI*2);c.stroke();c.restore();}
    blob(c,x,y-4*s,9*s,4*s,SNOW,0.85);};
  tower(LW*0.12,6,1.1);tower(LW*0.2,4,0.8);
  // 장승 한 쌍: 오른쪽 길가, 머리에 눈
  const jang=(x,h,w)=>{const top=gy-h;
    c.save();c.fillStyle='rgba(120,92,64,.28)';c.fillRect(x-w/2,top,w,h);c.restore();
    brush(c,[[x-w/2,gy],[x-w/2,top+6],[x,top-4],[x+w/2,top+6],[x+w/2,gy]],3,INK,0.6);
    blob(c,x,top-2,w*0.55,4,SNOW,0.9);
    brush(c,[[x-w*0.35,top+12],[x-w*0.1,top+9]],2.4,INK,0.6);brush(c,[[x+w*0.1,top+9],[x+w*0.35,top+12]],2.4,INK,0.6);
    blob(c,x-w*0.2,top+16,2.4,2.4,INK,0.6);blob(c,x+w*0.2,top+16,2.4,2.4,INK,0.6);
    brush(c,[[x-w*0.25,top+28],[x,top+32],[x+w*0.25,top+28]],2,INK,0.55);
    for(let i=0;i<4;i++)brush(c,[[x,top+40+i*10],[x+2,top+46+i*10]],2,INK,0.35);};
  jang(LW*0.83,96,22);jang(LW*0.9,84,20);
  // 굵은 눈발
  const n=stil?0:34;
  for(let i=0;i<n;i++){const sp=0.35+hash(i)*0.5,y=((t*sp+i*41)%(LH+20))-10,x=(hash(i*2.9)*LW+Math.sin(t*0.02+i)*12+t*0.2*(1+hash(i)))%LW;
    c.save();c.globalAlpha=0.55;c.fillStyle='#f4f6f2';const r=1.5+hash(i*1.3)*2;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.restore();}
}
/* 결정 D-254: 찧은 자리. 발이 눌러 다진 우묵한 자리, 둘레에 솟은 눈 둔덕, 바깥으로 긁힌 자국, 눈 물결이 멈춘 자리의 낮은 둔덕 */
function drawCrater(c,cr){
  const a=Math.min(1,cr.t/60);
  blob(c,cr.x,cr.y+4,ST.sole+2,(ST.sole+2)*0.45,SNOW_SH,0.75*a);blob(c,cr.x+3,cr.y+6,ST.sole*0.7,ST.sole*0.3,'#aab6bf',0.5*a);
  for(let i=0;i<12;i++){const ang=i*Math.PI/6+cr.seed,rx=ST.sole+7,ry=rx*0.5;   // 가장자리 둔덕
    const lx=cr.x+Math.cos(ang)*rx,ly=cr.y+4+Math.sin(ang)*ry-2,lw=6+hash(i+cr.seed)*3;
    blob(c,lx+1,ly+1.5,lw+1,3.6,SNOW_SH,0.9*a);blob(c,lx,ly,lw,3.2,SNOW,a);}
  c.save();c.strokeStyle=INK;c.globalAlpha=0.35*a;c.lineWidth=1.2;c.beginPath();c.ellipse(cr.x,cr.y+4,ST.sole+9,(ST.sole+9)*0.5,0,Math.PI*0.05,Math.PI*0.95);c.stroke();c.restore();
  for(let i=0;i<8;i++){const ang=i*Math.PI/4+cr.seed*1.3,r0=ST.sole+12,r1=r0+10+hash(i*3+cr.seed)*14;
    brush(c,[[cr.x+Math.cos(ang)*r0,cr.y+4+Math.sin(ang)*r0*0.5],[cr.x+Math.cos(ang)*r1,cr.y+4+Math.sin(ang)*r1*0.5]],1,INK,0.25*a);}
  for(let i=0;i<18;i++){const ang=i*Math.PI/9+cr.seed*0.7,R=ST.ringMax*(0.96+hash(i+cr.seed*2)*0.08);   // 눈 물결이 멈춘 낮은 둔덕
    const wx=cr.x+Math.cos(ang)*R,wy=cr.y+4+Math.sin(ang)*R*0.62;blob(c,wx+1,wy+1,6,2.2,SNOW_SH,0.6*a);blob(c,wx,wy,5,2,SNOW,0.8*a);}
}
/* 상자 안 바닥: 쌓인 눈, 찧은 자국, 눈폭탄 자리의 눈가루, 남은 발바닥·멈춘 팔·드러난 핵 */
function drawSnowFloor(c){
  for(let i=0;i<9;i++){const x=BOX.x+hash(i*5.1)*BOX.w,y=BOX.y+hash(i*2.3)*BOX.h;blob(c,x,y,10+hash(i)*14,3,SNOW_SH,0.22);}
  for(const cr of B.craters||[])drawCrater(c,cr);
  for(const sp of B.snowSpots||[]){const a=Math.min(1,sp.t/50),s=sp.s||1;
    blob(c,sp.x,sp.y+3,16*s,7*s,SNOW,0.85*a);
    for(let i=0;i<6;i++){const ang=sp.seed+i*1.05,d=(10+hash(i+sp.seed)*16)*s;blob(c,sp.x+Math.cos(ang)*d,sp.y+3+Math.sin(ang)*d*0.5,(5+hash(i*2+sp.seed)*5)*s,2.6*s,SNOW,0.75*a);}}
  const rs=B.restSole;
  if(rs){const g=rs.gone||0,al=1-g/ST.crumble;drawSole(c,rs.x,rs.y+g*0.5,1,al);
    if(rs.crack)brush(c,[[rs.x-12,rs.y-6],[rs.x-3,rs.y+2],[rs.x+7,rs.y-4],[rs.x+15,rs.y+6]],1.8,INK,0.85*al);
    if(g)for(let i=0;i<4;i++)blob(c,rs.x-18+i*12,rs.y+10+g*0.8,4,3,SLAB,al);}
  if(B.restArm)drawRestArm(c,B.restArm);
  const m=B.mark;if(m&&m.golem&&m.part.core)drawCoreSpot(c,m);
}
/* 드러난 몸의 핵: 칸 한가운데의 서리 옥 (결정 D-251). 눈 껍데기가 남아 있으면 금 사이로 서리빛만 샌다 */
function drawCoreSpot(c,m){
  const x=m.x,y=m.y,g=0.5+0.5*Math.sin(B.time*0.2);
  blob(c,x,y+8,44,15,INK,0.08);
  if(coreHidden()){blob(c,x,y,40+g*5,34+g*4,GEM_LT,0.2+0.15*g);blob(c,x,y,29,25,SNOW,0.97);blob(c,x+6,y+8,17,8,SNOW_SH,0.7);
    brush(c,[[x-20,y-4],[x-7,y+2],[x+4,y-3],[x+18,y+5]],3,GEM_LT,0.6+0.3*g);brush(c,[[x-20,y-4],[x-7,y+2],[x+4,y-3],[x+18,y+5]],1.3,GEM_DK,0.9);
    brush(c,[[x-5,y+2],[x-2,y+13]],1.3,GEM_DK,0.8);
    c.save();c.strokeStyle=INK;c.globalAlpha=0.6;c.lineWidth=1.5;c.beginPath();c.ellipse(x,y,29,25,0,0,Math.PI*2);c.stroke();c.restore();return;}
  drawGem(c,x,y,22,0.6+0.4*g,1);
}
/* 친 자리의 돌 조각·빛 고리 (결정 D-253). 상자 위에 그린다 */
function drawImpacts(c){
  for(const s of B.gShards||[]){const al=Math.min(1,s.t/12);
    if(s.dust){blob(c,s.x,s.y,s.r*(1.4-s.t/22*0.4),s.r*0.8,s.col,0.5*al);continue;}
    c.save();c.translate(s.x,s.y);c.rotate(s.rot);c.globalAlpha=al;c.fillStyle=s.col;c.beginPath();c.moveTo(-s.r,-s.r*0.5);c.lineTo(s.r*0.6,-s.r*0.8);c.lineTo(s.r,s.r*0.4);c.lineTo(-s.r*0.3,s.r*0.7);c.closePath();c.fill();
    c.strokeStyle=INK;c.globalAlpha=0.6*al;c.lineWidth=0.8;c.stroke();c.restore();}
  const im=B.gImpact;
  if(im&&im.t>0){const k=1-im.t/16,r=10+k*30;
    c.save();c.strokeStyle='#fffaf0';c.globalAlpha=0.9*(1-k);c.lineWidth=4*(1-k)+1;c.beginPath();c.ellipse(im.x,im.y,r,r*0.7,0,0,Math.PI*2);c.stroke();
    c.strokeStyle=INK;c.globalAlpha=0.5*(1-k);c.lineWidth=1.2;for(let i=0;i<8;i++){const a=i*Math.PI/4+0.2;c.beginPath();c.moveTo(im.x+Math.cos(a)*r*0.5,im.y+Math.sin(a)*r*0.35);c.lineTo(im.x+Math.cos(a)*(r+8),im.y+Math.sin(a)*(r+8)*0.7);c.stroke();}c.restore();}
  for(const p of B.gPlumes||[]){const k=p.t/p.max,al=(k<0.15?k/0.15:1-(k-0.15)/0.85)*0.55;   // 피어오르는 눈가루
    for(let i=0;i<7;i++){const ang=p.seed+i*0.9,d=10+k*34+hash(i+p.seed)*8,rise=k*26*(0.6+hash(i*2+p.seed)*0.6);
      blob(c,p.x+Math.cos(ang)*d+p.drift*p.t*0.8,p.y-rise+Math.sin(ang)*d*0.35,10+k*16,7+k*10,i%2?SNOW:'#e6ecef',al);}}
}

/* ---------- 돌 얻기 (결정 D-184) ---------- */
const STONE_OF={leg:'gudeuldol',arm:'chadol',head:'okdol'};
function stoneRoll(id,hitText,x,y){
  const s=B.stones||(B.stones={}),r=s[id]||(s[id]={miss:0,got:0}),t=T(),item=STONE_OF[id];
  part(id).shake=10;golemImpact(id,x,y);Sound.playSfx('battle_hit');   // 결정 D-253
  if(r.got>=t.golem_stone_cap){B.msg=hitText;return false;}
  // 결정 D-224: 곡괭이가 아닌 도구로 치면 확률이 battle_tool_bad_mult 배
  if(Math.random()<toolChance(part(id),Math.min(1,t.golem_stone_chance+t.golem_stone_step*r.miss))){r.got++;r.miss=0;B.loot.push(item);B.msg=hitText+' '+ITEMS[item].n+' 한 조각이 떨어졌다!';return true;}
  r.miss++;B.msg=hitText+(toolFit(part(id))==='bad'?' 도구가 잘 안 먹는다.':' 돌가루만 튄다.');return false;
}
const HIT_TEXT={leg:'박힌 발바닥을 쳤다!',arm:'멈춘 차돌 팔을 쳤다!',head:'서리 옥 핵을 쳤다!'};
const CLOSE_TEXT={leg:'발바닥이 부서져 눈 속에 묻혔다.',arm:'골렘이 팔을 거둬들였다.',head:'골렘이 가슴을 다시 여몄다.'};
/* 공격 뒤 표식 (결정 D-183·D-184): 남은 발바닥, 칸 끝에 멈춘 팔, 칸 한가운데의 핵에만 뜬다. 엔진의 openMark 대신 부른다 */
function golemOpenMark(p){
  const t=T();
  if(p.id==='leg'){const s=B.restSole;B.mark=null;if(!s)return true;s.marked=true;
    B.mark={x:s.x,y:s.y,t:t.golem_foot_rest,max:t.golem_foot_rest,part:p,golem:true};B.msg='구들돌 발바닥이 눈에 박혀 있다.';return true;}
  if(p.id==='arm'){const a=B.restArm;B.mark=null;if(!a)return true;a.marked=true;
    let x,y;if(a.orient==='v'){const [x0,x1]=armBandV(a.side);x=(x0+x1)/2;y=a.hand;}else{const [y0,y1]=armBand(a.cov);x=a.hand;y=(y0+y1)/2;}
    B.mark={x,y,t:t.golem_arm_rest,max:t.golem_arm_rest,part:p,golem:true};B.msg=a.orient==='v'?'내리친 차돌 팔이 칸 밑에 박혀 멈췄다.':'휩쓴 차돌 팔이 바닥에 걸쳐 멈췄다.';return true;}
  // 몸: 눈폭탄을 하나도 안 맞고 버텼을 때만 핵이 드러난다
  if(B.hitThis){B.mark=null;B.msg='눈을 털어 내는 사이 골렘이 숨을 고르고 가슴을 여몄다.';return true;}
  B.mark={x:BOX.x+BOX.w/2,y:BOX.y+BOX.h/2,t:t.golem_core_frames,max:t.golem_core_frames,part:p,golem:true,rest:true};
  B.msg=coreHidden()?'골렘이 숨을 몰아쉰다. 눈 껍데기 덮인 핵이 들썩인다!':'골렘이 숨을 몰아쉰다. 서리 옥 핵이 드러났다!';return true;
}
function strikeGolem(){
  const m=B.mark;if(!m||!m.golem)return false;
  if(Math.hypot(m.x-B.px,m.y-B.py)>=battleHandProfile().radius)return false;
  const p=m.part;B.mark=null;B.golemHit=true;
  if(p.id==='leg'&&B.restSole)B.restSole.crack=true;
  if(p.core&&coreHidden()){stoneRoll('head',HIT_TEXT.head,m.x,m.y);B.msg+=' 눈 껍데기가 두꺼워 몸은 버틴다.';renderBHud();return true;}
  p.hp=Math.max(0,p.hp-toolDamage(p));   // 결정 D-224: 돌은 곡괭이가 잘 먹는다
  const got=stoneRoll(p.id,HIT_TEXT[p.id],m.x,m.y);
  if(p.hp<=0){breakPart(p);if(got&&B.st!=='end')B.msg+=' '+ITEMS[STONE_OF[p.id]].n+'도 챙겼다.';}
  renderBHud();return true;
}

/* ---------- 공격 고르기 (결정 D-183): 다리·팔 다음 마지막에 눈폭탄 ---------- */
function pickGolem(){
  if(!B.cycle||!B.cycle.length){
    const limbs=['leg','arm'].filter(id=>!part(id).broken);
    if(B.cycleN&&Math.random()<0.5)limbs.reverse();   // 첫 바퀴는 다리부터
    B.cycleN=(B.cycleN||0)+1;B.cycle=[...limbs,'head'];
  }
  let id=B.cycle.shift();while(id!=='head'&&part(id).broken)id=B.cycle.shift();
  const p=part(id),first=!B.last;
  B.cur=p;B.last=p;B.st='tell';B.t=first?72:42;B.msg=p.tell;B.hitThis=false;
  // 결정 D-255: 같은 모양을 연달아 쓰지 않는다
  if(id==='arm'){B.armOrient=B.armOrient?(B.armOrient==='h'?'v':'h'):(Math.random()<0.5?'h':'v');B.msg=B.armOrient==='v'?'골렘이 차돌 팔을 머리 위로 치켜든다.':p.tell;}
  if(id==='leg'){const o=['aim','march','pincer'].filter(k=>k!==B.stompPat);B.stompPat=B.stompRound?o[Math.floor(Math.random()*o.length)]:'aim';}
  if(id==='head'){const o=['aim','rowSweep','colSweep'].filter(k=>k!==B.snowPat);B.snowPat=o[Math.floor(Math.random()*o.length)];}
}

/* ---------- 공격 ---------- */
const stompCount=()=>((B&&B.stompRound)||0)>=2?3:2;   // 세 번째 발 찧기부터 세 번 찧는다
const clampIn=(x,y)=>[clamp(x,BOX.x+30,BOX.x+BOX.w-30),clamp(y,BOX.y+20,BOX.y+BOX.h-16)];
/* 결정 D-255: 발 찧을 자리. aim 은 찧을 때마다 손 자리, march 는 한쪽 끝에서 반대쪽 끝으로 걸어오고, pincer 는 손 양옆을 찧은 뒤 가운데 */
function stompTarget(b){
  const pat=b.pat||'aim',n=b.n,i=b.i;
  if(pat==='march'){const k=n>1?i/(n-1):0.5,x=b.dir<0?BOX.x+BOX.w-40-(BOX.w-80)*k:BOX.x+40+(BOX.w-80)*k;return clampIn(x,i%2?BOX.y+BOX.h*0.66:BOX.y+BOX.h*0.36);}
  if(pat==='pincer'&&i<n-1){const s=i%2?1:-1;return clampIn(B.px+s*78,B.py+(i?-18:18));}
  return clampIn(B.px,B.py);
}
const SNOW_STOMP_DUR=n=>(n-1)*ST.gap+ST.tell+ST.drop+Math.max(ST.wave,ST.clumpFly+14)+6;
const ARM_DUR=orient=>AR.tell+(orient==='v'?AR.vSweep:AR.sweep)+AV.tell+(orient==='v'?Math.ceil((BOX.w+40)/AV.sideSpeed):Math.ceil((BOX.h+28)/AV.speed))+6;
defineAttacks({
  golemStomp:{get dur(){return SNOW_STOMP_DUR(stompCount());},tick(t){if(t)return;
    const n=stompCount(),start=Math.random()<0.5?-1:1,pat=B.stompPat||'aim',dir=B.px>BOX.x+BOX.w/2?-1:1;B.stompRound=(B.stompRound||0)+1;B.restSole=null;
    for(let i=0;i<n;i++)B.bullets.push({k:'golemStomp',t:0,delay:i*ST.gap,foot:i%2?-start:start,x:null,y:null,last:i===n-1,pat,i,n,dir});}},
  golemArm:{get dur(){return ARM_DUR(B.armOrient||'h');},tick(t){if(t)return;B.restArm=null;
    const orient=B.armOrient||'h';
    if(orient==='v'){const side=B.px<BOX.x+BOX.w/2?-1:1;B.bullets.push({k:'golemArm',t:0,side,orient});}   // 손이 있는 쪽 절반을 내리친다
    else{const side=Math.random()<0.5?-1:1,cov=Math.random()<0.5?'top':'bottom';B.bullets.push({k:'golemArm',t:0,side,cov,orient});}}},
  golemSnow:{get dur(){return (T().golem_barrage_count-1)*SB.gap+SB.wind+SB.fly+SB.splat+4;},tick(t){if(t)return;
    const n=T().golem_barrage_count,s0=Math.random()<0.5?-1:1,pat=B.snowPat||'aim';
    for(let i=0;i<n;i++)B.bullets.push({k:'golemSnowball',t:0,delay:i*SB.gap,i,n,pat,dir:s0,side:i%2?-s0:s0,tx:null,ty:null});}},
});
/* 눈폭탄 떨어질 자리 (결정 D-255). rowSweep 은 손이 있던 줄을 한쪽 끝에서 훑고, 반쯤 던지면 그때 손 줄을 반대로 훑는다. colSweep 은 세로로 */
function snowTarget(b){
  const half=Math.ceil(b.n/2),second=b.i>=half,j=second?b.i-half:b.i,m=second?b.n-half:half,k=m>1?j/(m-1):0.5,dir=second?-b.dir:b.dir;
  if(b.pat==='rowSweep'||b.pat==='colSweep'){
    if(j===0)B.snowLine=b.pat==='rowSweep'?B.py:B.px;
    const line=B.snowLine??(b.pat==='rowSweep'?B.py:B.px);
    if(b.pat==='rowSweep'){const x=dir>0?BOX.x+24+(BOX.w-48)*k:BOX.x+BOX.w-24-(BOX.w-48)*k;return [x,line+(hash(b.i)-0.5)*8];}
    const y=dir>0?BOX.y+18+(BOX.h-32)*k:BOX.y+BOX.h-14-(BOX.h-32)*k;return [line+(hash(b.i)-0.5)*8,y];
  }
  const aim=b.i%3!==1;   // 셋에 둘은 손 자리, 하나는 비켜 갈 만한 옆자리를 노린다
  const ox=aim?0:(Math.random()<0.5?-1:1)*SB.spread,oy=aim?0:(Math.random()-0.5)*SB.spread;
  return [B.px+ox,B.py+oy];
}
defineBullets({
  golemStomp:{
    step(b){b.t++;const p=stompPhase(b);
      if(b.x==null&&b.t>b.delay){[b.x,b.y]=stompTarget(b);}
      if(b.t===p.hit){Sound.playSfx('battle_hit');snowBurst(b.x,b.y,10,true);B.quake=14;plume(b.x,b.y);
        (B.craters||(B.craters=[])).push({x:b.x,y:b.y,t:240,seed:Math.random()*3});if(B.craters.length>4)B.craters.shift();
        // 결정 D-254: 눈덩이가 포물선으로 날아가 떨어진다. 하나는 손 가까이로
        const n=T().golem_stomp_clumps,a0=Math.random()*Math.PI*2;
        for(let i=0;i<n;i++){let tx,ty;
          if(i===0&&Math.hypot(B.px-b.x,B.py-b.y)<150){tx=B.px+(Math.random()-0.5)*24;ty=B.py+(Math.random()-0.5)*16;}
          else{const a=a0+i*Math.PI*2/n+(Math.random()-0.5)*0.5,d=58+Math.random()*58;tx=b.x+Math.cos(a)*d;ty=b.y+Math.sin(a)*d*0.62;}
          tx=clamp(tx,BOX.x+10,BOX.x+BOX.w-10);ty=clamp(ty,BOX.y+10,BOX.y+BOX.h-8);
          B.bullets.push({k:'golemClump',t:0,x0:b.x,y0:b.y-6,tx,ty,fly:ST.clumpFly+Math.floor(Math.random()*12),r:5+Math.random()*3});}
        if(Math.hypot(B.px-b.x,B.py-b.y)<ST.sole)bHitMe();}
      if(b.t>p.hit&&b.t<=p.ring){const k=(b.t-p.hit)/ST.wave,r=waveR(k),d=Math.hypot(B.px-b.x,(B.py-b.y)/0.62);if(k<0.85&&Math.abs(d-r)<ST.ringBand)bHitMe();}
      if(b.t>=p.end){b.dead=1;if(b.last)B.restSole={x:b.x,y:b.y,gone:0};}},   // 마지막 발바닥은 눈에 박혀 남는다
    draw(c,b){const p=stompPhase(b);if(p.wait||b.x==null)return;
      const R=ST.sole;
      if(p.tell){const k=p.k;
        blob(c,b.x,b.y+4,R*(0.5+0.6*k),R*0.45*(0.5+0.6*k),INK,0.1+0.3*k);
        c.save();c.strokeStyle=RED;c.globalAlpha=0.25+0.2*k;c.lineWidth=1.4;c.setLineDash([5,6]);c.beginPath();c.ellipse(b.x,b.y+4,ST.ringMax,ST.ringMax*0.62,0,0,Math.PI*2);c.stroke();c.restore();
        if(k>0.72&&Math.floor(b.t/4)%2){c.save();c.strokeStyle=RED;c.lineWidth=2;c.globalAlpha=0.85;c.beginPath();c.ellipse(b.x,b.y+4,R+6,(R+6)*0.45,0,0,Math.PI*2);c.stroke();c.restore();}
        return;}
      let sy=b.y,al=1;
      if(p.falling){const k=(b.t-b.delay-ST.tell)/ST.drop;sy=BOX.y-24+(b.y+24-BOX.y)*k*k;
        for(let i=-1;i<=1;i++)brush(c,[[b.x+i*14,sy-38],[b.x+i*14,sy-16]],1.2,INK,0.35);}   // 내리꽂히는 줄
      let crownFront=null;
      if(!p.falling){const d=b.t-p.hit,k=d/ST.wave;
        // 눈 물결: 밀려 나가는 눈 두둑. 나갈수록 낮아지고 느려진다. 밝은 바닥에서도 보이게 그늘과 먹 선을 붙인다
        if(k<1){const r=waveR(k),h=(1-k)*10+2,a=k<0.85?1:(1-k)/0.15;
          for(let i=0;i<28;i++){const ang=i*Math.PI*2/28+b.delay,wx=b.x+Math.cos(ang)*r,wy=b.y+4+Math.sin(ang)*r*0.62;
            blob(c,wx+1,wy+1.5,8+h*0.4,3+h*0.35,SNOW_SH,0.9*a);blob(c,wx,wy-h*0.5,7+h*0.4,3+h*0.5,SNOW,a);}
          c.save();c.strokeStyle=INK;c.globalAlpha=0.6*a;c.lineWidth=1.6;c.beginPath();c.ellipse(b.x,b.y+4,r+7,(r+7)*0.62,0,Math.PI*0.03,Math.PI*0.97);c.stroke();
          c.globalAlpha=0.3*a;c.beginPath();c.ellipse(b.x,b.y+4-h*0.6,r-4,(r-4)*0.62,0,Math.PI*1.08,Math.PI*1.92);c.stroke();c.restore();}
        // 왕관: 발 둘레 눈이 솟았다가 무너진다. 뒤쪽 반은 발 뒤에, 앞쪽 반은 발 앞에 그린다
        if(d<24){const up=d<7?d/7:1-(d-7)/17;
          // 솟은 눈은 뾰족하지 않고 덩어리져 부푼다: 아래 큰 덩이 위에 작은 덩이, 오른쪽 아래에 그늘
          const lip=(from,to)=>{for(let i=from;i<to;i++){const ang=i*Math.PI/9+0.17,rx=R+9+up*5,cx2=b.x+Math.cos(ang)*rx,cy2=b.y+4+Math.sin(ang)*rx*0.5,hh=(7+hash(i+b.delay)*10)*up,w=5+hash(i*3+b.delay)*3;
            blob(c,cx2+1.5,cy2-hh*0.4+1.5,w+1,hh*0.5+3,SNOW_SH,0.9);blob(c,cx2,cy2-hh*0.4,w,hh*0.5+2.5,SNOW,1);
            blob(c,cx2+(hash(i)-0.5)*3,cy2-hh*0.95,w*0.6,hh*0.25+1.5,SNOW,1);
            c.save();c.strokeStyle=INK;c.globalAlpha=0.35*up;c.lineWidth=1;c.beginPath();c.ellipse(cx2,cy2-hh*0.4,w,hh*0.5+2.5,0,Math.PI*1.1,Math.PI*1.9);c.stroke();c.restore();}};
          lip(9,18);crownFront=()=>lip(0,9);}
        const g=b.t-(p.ring+ST.stay);if(!b.last&&g>0){al=1-g/ST.crumble;sy+=g*0.5;for(let i=0;i<4;i++)blob(c,b.x-18+i*12,b.y+10+g*0.8,4,3,SLAB,al);}}
      drawSole(c,b.x,sy,1,al);
      if(crownFront)crownFront();
      const a=b.t-p.hit;
      if(a>0&&a<16){c.save();c.fillStyle=INK;c.globalAlpha=1-a/16;c.font='bold 17px "Gowun Batang", serif';c.textAlign='center';c.fillText('쿵',b.x+40,b.y-18);c.restore();}
    }},
  /* 결정 D-254: 발 찧기에 튄 눈덩이. 떨어질 자리에 그림자가 먼저 진하게 생긴다 */
  golemClump:{
    step(b){b.t++;if(b.t===b.fly){snowPowder(b.tx,b.ty,true);if(Math.hypot(B.px-b.tx,B.py-b.ty)<ST.clumpHit+b.r*0.5)bHitMe();}if(b.t>=b.fly)b.dead=1;},
    draw(c,b){const k=b.t/b.fly,x=b.x0+(b.tx-b.x0)*k,y=b.y0+(b.ty-b.y0)*k-70*4*k*(1-k);
      blob(c,b.tx,b.ty+2,(b.r+4)*(0.4+0.6*k),(b.r+4)*0.45*(0.4+0.6*k),INK,0.08+0.22*k);
      if(k>0.6){c.save();c.strokeStyle=RED;c.globalAlpha=0.5*k;c.lineWidth=1.2;c.beginPath();c.ellipse(b.tx,b.ty+2,ST.clumpHit+3,(ST.clumpHit+3)*0.5,0,0,Math.PI*2);c.stroke();c.restore();}
      drawSnowball(c,x,y,b.r,b.t*0.2,0.95);}},
  golemArm:{
    step(b){b.t++;const p=armPhase(b),v=b.orient==='v';
      if(p.sweep){
        if(v){const [x0,x1]=armBandV(b.side);if(B.px>=x0-4&&B.px<=x1+4&&B.py<=p.hand+16)bHitMe();
          if(Math.random()<0.5)snowBurst(clamp(B.px,x0,x1),Math.min(p.hand+10,BOX.y+BOX.h),1,true);}
        else{const [y0,y1]=armBand(b.cov),under=b.side<0?B.px<=p.hand+16:B.px>=p.hand-16;   // 팔이 지나간(덮은) 자리
          if(B.py>=y0-4&&B.py<=y1+4&&under)bHitMe();
          if(Math.random()<0.5)snowBurst(p.hand,clamp(B.py<y0||B.py>y1?armEdgeY(b.cov):(y0+y1)/2,BOX.y,BOX.y+BOX.h),1,true);}}
      if(b.t===AR.tell+p.sw){b.dead=1;B.restArm={side:b.side,cov:b.cov,orient:b.orient,hand:armTo(b.side,b.orient),back:0};B.quake=Math.max(B.quake||0,v?10:4);
        if(v){   // 내리친 팔이 밀어낸 눈이 옆에서 밀려온다. 한 줄만 빈다
          const gy=B.py>BOX.y+BOX.h/2?BOX.y+AV.sideGap/2+10+Math.random()*(BOX.h/2-AV.sideGap-14):BOX.y+BOX.h/2+AV.sideGap/2+4+Math.random()*(BOX.h/2-AV.sideGap-14);
          B.bullets.push({k:'golemAvalanche',t:0,dir:'side',s:b.side,gy});if(B.st!=='end')B.msg='짓눌린 눈이 옆에서 밀려온다!';}
        else{const gx=B.px>BOX.x+BOX.w/2?BOX.x+AV.gap/2+12+Math.random()*(BOX.w/2-AV.gap-24):BOX.x+BOX.w/2+AV.gap/2+12+Math.random()*(BOX.w/2-AV.gap-24);
          B.bullets.push({k:'golemAvalanche',t:0,dir:'down',gx});if(B.st!=='end')B.msg='쓸려 간 눈이 위에서 쏟아진다!';}}},
    draw(c,b){const p=armPhase(b);
      if(b.orient==='v'){const [x0,x1]=armBandV(b.side),edge=b.side<0?x1:x0;
        if(p.tell){const k=b.t/AR.tell,flash=k>0.75&&Math.floor(b.t/4)%2;
          c.save();c.fillStyle='rgba(180,67,42,'+(0.05+0.12*k).toFixed(3)+')';c.fillRect(x0,BOX.y,x1-x0,BOX.h);
          c.strokeStyle=RED;c.globalAlpha=flash?0.95:0.5;c.lineWidth=1.6;c.setLineDash([7,5]);c.beginPath();c.moveTo(edge,BOX.y);c.lineTo(edge,BOX.y+BOX.h);c.stroke();c.restore();
          for(let i=0;i<5;i++){const y=BOX.y+i*BOX.h/4;brush(c,[[x0+6,y],[x1-6,y+14]],1,RED,0.25*k);}
          quartz(c,(x0+x1)/2,BOX.y+6-10*k,(x1-x0)*0.2,12,0.5+0.5*k,3);return;}   // 칸 위에서 주먹이 치켜 올라간다
        drawArmInV(c,b.side,p.hand,1,p.k);return;}
      const [y0,y1]=armBand(b.cov),edge=armEdgeY(b.cov);
      if(p.tell){const k=b.t/AR.tell,flash=k>0.75&&Math.floor(b.t/4)%2;
        c.save();c.fillStyle='rgba(180,67,42,'+(0.05+0.12*k).toFixed(3)+')';c.fillRect(BOX.x,y0,BOX.w,y1-y0);
        c.strokeStyle=RED;c.globalAlpha=flash?0.95:0.5;c.lineWidth=1.6;c.setLineDash([7,5]);c.beginPath();c.moveTo(BOX.x,edge);c.lineTo(BOX.x+BOX.w,edge);c.stroke();c.restore();
        for(let i=0;i<6;i++){const x=BOX.x+i*BOX.w/5;brush(c,[[x,y0+6],[x+18,y1-6]],1,RED,0.25*k);}
        // 칸 가장자리 밖에서 젖혀 둔 주먹이 가로로 뒤로 물러난다
        const ex=(b.side<0?BOX.x+6:BOX.x+BOX.w-6)+b.side*10*k;quartz(c,ex,(y0+y1)/2,14,(y1-y0)*0.26,0.5+0.5*k,3);return;}
      drawArmIn(c,b.side,b.cov,p.hand,1,p.k);
    }},
  golemAvalanche:{
    step(b){b.t++;if(b.t<=AV.tell)return;
      if(b.dir==='side'){const x=b.s<0?BOX.x-8+(b.t-AV.tell)*AV.sideSpeed:BOX.x+BOX.w+8-(b.t-AV.tell)*AV.sideSpeed;
        if(Math.abs(B.px-x)<AV.band&&Math.abs(B.py-b.gy)>AV.sideGap/2)bHitMe();
        if(x<BOX.x-20||x>BOX.x+BOX.w+20)b.dead=1;return;}
      const y=BOX.y-8+(b.t-AV.tell)*AV.speed;
      if(Math.abs(B.py-y)<AV.band&&Math.abs(B.px-b.gx)>AV.gap/2)bHitMe();
      if(y>BOX.y+BOX.h+20)b.dead=1;},
    draw(c,b){const stil=still();
      if(b.dir==='side'){const sx=b.s<0?BOX.x:BOX.x+BOX.w,inGap=y=>Math.abs(y-b.gy)<AV.sideGap/2;
        if(b.t<=AV.tell){const k=b.t/AV.tell;
          for(let y=BOX.y;y<BOX.y+BOX.h;y+=16){if(inGap(y+8))continue;blob(c,sx-b.s*4+(stil?0:Math.sin(b.t*0.9+y)*1.5),y+8,6+4*k,10,SNOW,0.9);}
          c.save();c.strokeStyle=RED;c.globalAlpha=0.5;c.setLineDash([4,5]);c.lineWidth=1.4;c.beginPath();c.moveTo(BOX.x,b.gy-AV.sideGap/2);c.lineTo(BOX.x+BOX.w,b.gy-AV.sideGap/2);c.moveTo(BOX.x,b.gy+AV.sideGap/2);c.lineTo(BOX.x+BOX.w,b.gy+AV.sideGap/2);c.stroke();c.restore();
          return;}
        const x=b.s<0?BOX.x-8+(b.t-AV.tell)*AV.sideSpeed:BOX.x+BOX.w+8-(b.t-AV.tell)*AV.sideSpeed;
        c.save();c.fillStyle='rgba(243,245,244,.35)';
        for(const [y0,y1] of [[BOX.y,b.gy-AV.sideGap/2],[b.gy+AV.sideGap/2,BOX.y+BOX.h]])if(y1>y0)c.fillRect(Math.min(sx,x),y0,Math.abs(x-sx),y1-y0);
        c.restore();
        for(let y=BOX.y;y<BOX.y+BOX.h;y+=12){if(inGap(y+6))continue;const j=hash(y*0.37),xx=x+(j-0.5)*6;blob(c,xx,y+6,7+j*3,9+j*4,SNOW,0.97);
          c.save();c.strokeStyle=INK;c.globalAlpha=0.55;c.lineWidth=1.2;c.beginPath();c.ellipse(xx,y+6,7+j*3,9+j*4,0,b.s<0?-Math.PI*0.5:Math.PI*0.5,b.s<0?Math.PI*0.5:Math.PI*1.5);c.stroke();c.restore();}
        return;}
      if(b.t<=AV.tell){const k=b.t/AV.tell;
        for(let x=BOX.x;x<BOX.x+BOX.w;x+=16){if(Math.abs(x+8-b.gx)<AV.gap/2)continue;blob(c,x+8+(stil?0:Math.sin(b.t*0.9+x)*1.5),BOX.y+4,10,6+4*k,SNOW,0.9);}
        c.save();c.strokeStyle=RED;c.globalAlpha=0.5;c.setLineDash([4,5]);c.lineWidth=1.4;c.beginPath();c.moveTo(b.gx-AV.gap/2,BOX.y);c.lineTo(b.gx-AV.gap/2,BOX.y+BOX.h);c.moveTo(b.gx+AV.gap/2,BOX.y);c.lineTo(b.gx+AV.gap/2,BOX.y+BOX.h);c.stroke();c.restore();
        return;}
      const y=BOX.y-8+(b.t-AV.tell)*AV.speed;
      c.save();c.fillStyle='rgba(243,245,244,.35)';
      for(const [x0,x1] of [[BOX.x,b.gx-AV.gap/2],[b.gx+AV.gap/2,BOX.x+BOX.w]])if(x1>x0)c.fillRect(x0,BOX.y,x1-x0,Math.max(0,y-BOX.y));
      c.restore();
      for(let x=BOX.x;x<BOX.x+BOX.w;x+=13){if(Math.abs(x+6-b.gx)<AV.gap/2)continue;
        const j=hash(x*0.37),yy=y+(j-0.5)*6;blob(c,x+6,yy,9+j*4,7+j*3,SNOW,0.97);
        c.save();c.strokeStyle=INK;c.globalAlpha=0.55;c.lineWidth=1.2;c.beginPath();c.ellipse(x+6,yy,9+j*4,7+j*3,0,Math.PI*0.9,Math.PI*2.1);c.stroke();c.restore();}
      for(let i=0;i<4;i++){const x=BOX.x+((i*83+b.t*1.7)%BOX.w);if(Math.abs(x-b.gx)<AV.gap/2)continue;drawSnowball(c,x,y+10,5,b.t*0.2+i,0.8);}
    }},
  golemSnowball:{
    step(b){b.t++;const rel=b.delay+SB.wind,land=rel+SB.fly;
      if(b.tx==null&&b.t>=rel){const [x,y]=snowTarget(b);
        b.tx=clamp(x,BOX.x+20,BOX.x+BOX.w-20);b.ty=clamp(y,BOX.y+18,BOX.y+BOX.h-14);
        const h=toScreen(LW/2+b.side*80,bodyY()-114);b.sx=h.x;b.sy=h.y;}
      // 결정 D-256: 눈폭탄 한 대는 통상 피해의 golem_snowball_damage 만큼
      if(b.t===land){Sound.playSfx('battle_hit');snowPowder(b.tx,b.ty);if(Math.hypot(B.px-b.tx,B.py-b.ty)<SB.hit)bHitMe(T().golem_snowball_damage);}
      if(b.t>land+SB.splat)b.dead=1;},
    draw(c,b){if(b.tx==null)return;const rel=b.delay+SB.wind,land=rel+SB.fly,R=SB.radius;
      if(b.t<land){const k=(b.t-rel)/SB.fly;
        blob(c,b.tx,b.ty+3,R*(0.35+0.65*k),R*0.45*(0.35+0.65*k),INK,0.08+0.25*k);
        c.save();c.strokeStyle=RED;c.globalAlpha=0.3+0.4*k;c.lineWidth=1.6;c.setLineDash([4,4]);c.beginPath();c.arc(b.tx,b.ty,R,0,Math.PI*2);c.stroke();c.restore();
        if(k>0.75&&Math.floor(b.t/3)%2){c.save();c.strokeStyle=RED;c.lineWidth=2.2;c.beginPath();c.arc(b.tx,b.ty,R,0,Math.PI*2);c.stroke();c.restore();}
        return;}
      // 파스스: 눈가루 구름이 넓게 번지며 옅어지고, 잔 눈알갱이가 둘레로 흩어진다
      const s=b.t-land,al=1-s/SB.splat,rr=R*(1+0.9*s/SB.splat);
      blob(c,b.tx,b.ty+3,rr*1.02,rr*0.58,SNOW_SH,0.55*al);blob(c,b.tx,b.ty+1,rr*0.86,rr*0.47,SNOW,0.85*al);blob(c,b.tx,b.ty,rr*0.5,rr*0.3,'#ffffff',0.7*al);
      c.save();c.strokeStyle=INK;c.globalAlpha=0.4*al;c.lineWidth=1.2;c.setLineDash([2,4]);c.beginPath();c.ellipse(b.tx,b.ty+2,rr*1.02,rr*0.58,0,0,Math.PI*2);c.stroke();c.restore();
      for(let i=0;i<12;i++){const ang=i*0.52+b.i,d=rr*(0.7+hash(i+b.i)*0.6);blob(c,b.tx+Math.cos(ang)*d,b.ty+Math.sin(ang)*d*0.55,1.6+hash(i*3+b.i)*1.6,1.4,i%3?SNOW_SH:INK,(i%3?0.9:0.45)*al);}
    }},
});
/* 상자 밖까지 날아가는 눈덩이는 잘리지 않게 상자 위에 그린다 (결정 D-182). 손에서 놓인 뒤부터 그린다. 친 자리 효과도 여기서 (D-253) */
function drawSnowFlights(c){
  for(const b of B.bullets){if(b.k!=='golemSnowball'||b.tx==null)continue;
    const rel=b.delay+SB.wind,land=rel+SB.fly;if(b.t>=land)continue;
    const k=(b.t-rel)/SB.fly,x=b.sx+(b.tx-b.sx)*k,y=b.sy+(b.ty-b.sy)*k-80*4*k*(1-k);
    drawSnowball(c,x,y,13+9*k,b.t*0.15);
  }
  drawImpacts(c);
}
function tickGolem(){
  if(B.quake>0)B.quake--;
  for(const cr of B.craters||[])cr.t--;if(B.craters)B.craters=B.craters.filter(cr=>cr.t>0);
  for(const sp of B.snowSpots||[])sp.t--;if(B.snowSpots)B.snowSpots=B.snowSpots.filter(sp=>sp.t>0);
  for(const s of B.gShards||[]){s.x+=s.vx;s.y+=s.vy;s.vy+=s.dust?-0.02:0.22;s.vx*=0.96;s.rot+=s.vr||0;s.t--;}if(B.gShards)B.gShards=B.gShards.filter(s=>s.t>0);
  for(const s of B.gChips||[]){s.x+=s.vx;s.y+=s.vy;s.vy+=0.18;s.t--;}if(B.gChips)B.gChips=B.gChips.filter(s=>s.t>0);
  for(const p of B.gPlumes||[])p.t++;if(B.gPlumes)B.gPlumes=B.gPlumes.filter(p=>p.t<p.max);
  if(B.gImpact&&B.gImpact.t>0)B.gImpact.t--;if(B.gHurt&&B.gHurt.t>0)B.gHurt.t--;
  // 남은 발바닥과 멈춘 팔은 표식이 사라지면(쳤거나 시간이 다 되면) 부서지거나 거둬진다
  const held=id=>B.mark&&B.mark.golem&&B.mark.part.id===id,between=['idle','tell'].includes(B.st);
  const rs=B.restSole;if(rs&&!held('leg')&&(rs.marked||between)&&++rs.gone>=ST.crumble)B.restSole=null;
  const ra=B.restArm;if(ra&&!held('arm')&&(ra.marked||between)&&++ra.back>=AR.back)B.restArm=null;
  if(B.gMark&&B.mark!==B.gMark){if(!B.golemHit&&!B.mark&&B.st!=='end')B.msg=CLOSE_TEXT[B.gMark.part.id];B.gMark=null;}
  if(B.mark&&B.mark.golem&&B.gMark!==B.mark){B.gMark=B.mark;B.golemHit=false;}
}
function drawGolemScene(c){
  // 이겼을 때: 핵이 갈라진 뒤 돌무더기가 와르르 주저앉는다 (결정 D-257)
  const end=endScene(),sink=end&&end.kind==='win'?Math.pow(clamp((end.k-0.6)/0.4,0,1),2)*34:0;
  if(sink){c.save();c.translate(Math.sin(B.time*1.3)*2,sink);drawGolem(c,true);c.restore();
    for(let i=0;i<6;i++){const k=clamp((end.k-0.6)/0.4,0,1),x=LW/2-70+i*28,y=EY+60+k*70*(0.6+hash(i)*0.6);blob(c,x,y,5+hash(i*2)*4,4,i%2?'#6c6e70':SNOW,1-k*0.3);}
    drawEndFruit(c,LW/2,bodyY()+18,EY+124,end);return;}
  // 발이 찧을 때 땅이 울린다(약한 지진)
  if(B.quake>0&&!still()){c.save();c.translate(Math.sin(B.quake*2.7)*B.quake*0.25,Math.cos(B.quake*3.1)*B.quake*0.15);drawGolem(c);c.restore();}
  else drawGolem(c);
}
/* 결정 D-257: 이기든 달래든 핵에서 서리다래가 나와 보따리에 들어온다. 끝 장면은 조금 길게 보여 준다 */
const END_FRAMES=150;
function giveDarae(kind){B.gEnd={kind,max:END_FRAMES};B.t=END_FRAMES;B.gShards=[];B.gPlumes=[];if(!has('seoridarae')&&!G.f.daraePicked)B.loot.push('seoridarae');}
defineEnemies({
  golem:{name:'돌 골렘',calmLabel:'진정',
    intro:'금줄 두른 성황당 돌무더기가 눈을 털며 일어선다.',   // 결정 D-103: 부위는 고르지 않는다(확정 흐름)
    firstPart:'leg',   // 결정 D-227: 안내 글 없이 시작한다
    placeGift:'story_stone',   // 결정 D-252: 진정은 선물로만. 사연 있는 돌은 꼭대기에 얹는다
    headPose(){return toScreen(LW/2,bodyY()-46);},
    openMark:golemOpenMark,
    parts:tableParts('golem',{leg:{atk:'golemStomp',mark:'발',tell:'골렘이 구들돌 발을 높이 쳐든다.'},
      arm:{atk:'golemArm',mark:'팔',tell:'골렘이 차돌 팔을 옆으로 크게 젖힌다.'},
      head:{atk:'golemSnow',mark:'핵',tell:'골렘이 두 팔로 눈을 퍼 올린다.'}}),
    likes:TABLES.CALM.golem,likeText:'돌무더기가 잠시 숨을 고른다.',
    likeTexts:{story_stone:'아빠가 못 올린 소원 돌을 건넸다. 돌 골렘이 가만히 내려다본다.'},
    coreHidden:'가슴이 두꺼운 눈 껍데기에 덮여 있다.',
    coreShown:'눈 껍데기가 깨지고 서리 옥 핵이 드러났다!',
    calmWin:'돌 골렘이 가슴의 핵에서 서리다래를 꺼내 내려놓고, 성황당 돌무더기로 내려앉았다.',
    win:'핵이 갈라지며 서리다래가 굴러 나왔다. 돌 골렘이 와르르 무너진다.',
    lose:'돌 골렘에게 밀려 눈 비탈을 데굴데굴 굴러 내려왔다.',
    onWin(){giveDarae('win');},onCalm(){giveDarae('calm');},
    pickAttack:pickGolem,strike:strikeGolem,tickHazards:tickGolem,drawFloor:drawSnowFloor,drawOver:drawSnowFlights,
    backdrop:drawStoneCliff,draw:drawGolemScene},
});
})();
