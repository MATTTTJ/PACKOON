'use strict';
/* 돌너머 전투: 돌 골렘 (깨어난 성황당 돌무더기). 원본 표: design/data/bosses.csv · boss_parts.csv
   결정 D-182: 겨울 산의 돌 골렘. 눈을 뒤집어쓴 설인과 돌무더기가 섞인 모습이다(사용자 피드백 33·60, 2026-11-01).
   부위 셋은 저마다 다른 돌로 되어 있다: 다리는 넓적한 구들돌, 팔은 흰 차돌, 몸은 눈 껍데기 속의 옥돌.
   - 다리: 골렘은 제자리에서 발을 높이 들었다가 꾹 찧는다. 다리는 전투 칸에 들어오지 않는다. 칸에는 그림자 뒤 돌 발바닥이
     내리박히고 충격파(여진)가 둥글게 퍼진다. 마지막 발바닥은 눈에 박혀 남는다.
   - 팔: 옆으로 젖혔다가 몸 앞을 가로로 휩쓴다(위나 아래 한 띠만 빈다). 다 휩쓴 팔은 칸 끝에 걸쳐 멈추고,
     쓸려 간 눈이 위에서 눈사태로 쏟아진다.
   - 눈폭탄: 한 팔씩 번갈아 머리 위로 들었다가 내던진다. 얼굴 없는 큰 눈덩이가 떨어지면 폭탄처럼 파스스 흩어진다.
   결정 D-183: 한 바퀴는 다리·팔(살아 있는 것만, 첫 바퀴는 다리부터) 뒤 마지막에 눈폭탄을 golem_barrage_count 개 던진다.
     눈폭탄을 하나도 안 맞고 버티면 골렘이 숨을 몰아쉬고, 칸 한가운데에 몸의 핵이 golem_core_frames 동안 드러난다.
     맞았거나 핵을 치지 못하면 가슴이 닫히고 한 바퀴를 다시 돈다. 공격 뒤 표식은 이 파일의 openMark 가 정한다.
   결정 D-184: 남은 발바닥(golem_foot_rest)·멈춘 팔(golem_arm_rest)·드러난 핵을 치면 그 부위 내구도가 깎이고
     그 부위의 돌이 확률로 떨어진다. 빗나갈수록 확률이 오른다(tuning.csv golem_stone_*, 피드백 43으로 조금 낮춤).
     눈 껍데기가 남은 핵은 옥돌만 떨어질 수 있고 몸은 버틴다. */
(()=>{
const T=()=>TABLES.TUNING;
const SNOW='#f3f5f4',SNOW_SH='#c9d2d8',SLAB='#5b5048',SLAB_LT='#7d7066',QUARTZ='#d2cdc3',QUARTZ_SH='#a39d92',JADE='#5f9a7a',JADE_LT='#a6d8ba',BODY='#6c6e70';
const ST={tell:46,drop:9,gap:62,sole:26,ringMax:96,ringSpeed:3.4,ringBand:8,stay:18,crumble:16,lift:40};   // 발 찧기
const AR={tell:52,sweep:72,edge:0.62,stop:40,back:16};                                            // 팔 휩쓸기
const AV={tell:26,speed:2.6,band:13,gap:66};                                                      // 눈사태
const SB={gap:17,wind:14,follow:10,fly:36,radius:30,hit:27,splat:34,spread:56};                   // 눈폭탄
const toScreen=(x,y)=>({x:LW/2+(x-LW/2)*0.84,y:EY+(y-EY)*0.84});
const lerp2=(p,q,k)=>[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k];
const legBroken=()=>part('leg').broken;
function bodyY(){return EY+2+(legBroken()?22:0)+Math.sin(B.time*0.04)*2+(B.quake>9?3:0);}   // 발을 찧으면 몸이 살짝 내려앉는다

/* ---------- 그림 조각 ---------- */
/* ---------- 그림 조각 ---------- */
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
/* 눈 부스러기 튀기 */
function snowBurst(x,y,n,up){for(let i=0;i<n;i++){const a=up?-Math.PI/2+(Math.random()-0.5)*2.2:Math.random()*Math.PI*2,s=1.2+Math.random()*2.8;
  B.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:2+Math.random()*3.5,t:30,col:Math.random()<0.75?SNOW:SNOW_SH});}}
/* 눈폭탄이 터질 때: 고운 눈가루가 파스스 넓게 흩어지고 굵은 덩이가 몇 개 튄다. 떨어진 자리엔 눈가루가 잠깐 남는다 */
function snowPowder(x,y){
  for(let i=0;i<30;i++){const a=Math.random()*Math.PI*2,s=2.6+Math.random()*3.6;
    B.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*0.7,r:1+Math.random()*2,t:20+Math.random()*14,col:Math.random()<0.45?SNOW:Math.random()<0.6?SNOW_SH:'#9fb0bb'});}
  for(let i=0;i<7;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*1.8;B.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*0.7-0.6,r:3.5+Math.random()*2.5,t:30,col:SNOW});}
  (B.snowSpots||(B.snowSpots=[])).push({x,y,t:150,seed:Math.random()*6});if(B.snowSpots.length>10)B.snowSpots.shift();
}

/* ---------- 지금 진행 중인 공격 (그림이 쓰는 상태) ---------- */
const ringEnd=hit=>hit+Math.ceil((ST.ringMax-ST.sole)/ST.ringSpeed);
function stompPhase(b){const a=b.delay,tl=a+ST.tell,hit=tl+ST.drop,ring=ringEnd(hit);
  return {wait:b.t<=a,tell:b.t>a&&b.t<=tl,falling:b.t>tl&&b.t<=hit,hit,ring,k:clamp((b.t-a)/ST.tell,0,1),end:b.last?ring:ring+ST.stay+ST.crumble};}
const stompOf=foot=>B.bullets.find(b=>b.k==='golemStomp'&&b.foot===foot&&b.t>b.delay&&b.t<=stompPhase(b).hit+14);
const armBullet=()=>B.bullets.find(b=>b.k==='golemArm');
const armFrom=side=>side<0?BOX.x-40:BOX.x+BOX.w+40;
const armTo=side=>side<0?BOX.x+BOX.w-AR.stop:BOX.x+AR.stop;   // 다 휩쓴 주먹은 칸 끝에 걸쳐 멈춘다
function armPhase(b){const k=clamp((b.t-AR.tell)/AR.sweep,0,1),e=k<0.5?2*k*k:1-2*(1-k)*(1-k),from=armFrom(b.side),to=armTo(b.side);
  return {tell:b.t<=AR.tell,sweep:b.t>AR.tell,k,e,from,hand:from+(to-from)*e};}
function armBand(cov){return cov==='top'?[BOX.y,BOX.y+BOX.h*AR.edge]:[BOX.y+BOX.h*(1-AR.edge),BOX.y+BOX.h];}
function armEdgeY(cov){return cov==='top'?BOX.y+BOX.h*AR.edge:BOX.y+BOX.h*(1-AR.edge);}
const throwOf=s=>B.bullets.find(b=>b.k==='golemSnowball'&&b.side===s&&b.t>b.delay&&b.t<=b.delay+SB.wind+SB.follow);

/* ---------- 골렘 그림 (상대 자리, 0.84배로 그려진다) ---------- */
function drawGolem(c){
  const cx=LW/2,cy=EY,leg=part('leg'),arm=part('arm'),core=part('head');
  const by=bodyY(),rest=!!(B.mark&&B.mark.rest),GY=cy+124;
  blob(c,cx,cy+130,150,12,INK,0.1);
  // 다리: 구들돌 기둥과 넓적한 돌 발. 찧을 발은 예고 동안 높이 들리고, 떨어지며 제자리를 꾹 찧는다. 칸으로 뻗지 않는다.
  {const a=leg.broken?0.35:1,o=shk(leg),flash=partCol(leg)===RED;
    [-1,1].forEach(s=>{const hipX=cx+s*44+o,hipY=by+50,st=stompOf(s);let lift=0;
      if(st){const p=stompPhase(st);
        if(p.tell)lift=ST.lift*(1-Math.pow(1-p.k,2));
        else if(p.falling)lift=ST.lift*(1-(st.t-st.delay-ST.tell)/ST.drop);
        else{const d=st.t-p.hit,al=1-d/14,fx=hipX+s*4;   // 찧은 발 밑에서 눈이 튀고 땅에 금이 간다
          for(let i=0;i<5;i++){const ang=Math.PI+i*Math.PI/4;blob(c,fx+Math.cos(ang)*(30+d*2),GY+6+Math.sin(ang)*6-d*0.6,4,3,SNOW,0.9*al);}
          brush(c,[[fx-34,GY+12],[fx-12,GY+9],[fx+6,GY+13],[fx+30,GY+10]],1.4,INK,0.6*al);}}
      const fx=hipX+s*(4+lift*0.3);
      legColumn(c,hipX,hipY,fx,GY-6-lift,30,a);drawSole(c,fx,GY+1-lift,0.8,a);
      if(flash)brush(c,[[hipX-16,hipY],[hipX-18,GY-6-lift]],2,RED,0.8);});}
  // 몸: 웅크린 돌무더기에 눈 털을 뒤집어썼다
  {const o=shk(core),a=core.broken?0.35:1,x=cx+o;
    blob(c,x,by+22,92,64,BODY,a);
    for(const [dx,dy,rx,ry,col] of [[-40,10,34,26,'#5f6163'],[34,20,30,24,'#76787a'],[-8,44,40,22,'#5a5c5e'],[44,-14,22,18,'#64666a']])blob(c,x+dx,by+dy,rx,ry,col,a);
    c.save();c.strokeStyle=INK;c.globalAlpha=0.8*a;c.lineWidth=2.4;c.beginPath();c.ellipse(x,by+22,92,64,0,Math.PI*1.05,Math.PI*1.95);c.stroke();c.restore();
    fur(c,x-6,by-34,11,170,26,a);fur(c,x-70,by+6,4,30,40,a);fur(c,x+70,by+6,4,30,40,a);fur(c,x,by+66,8,120,14,a*0.8);
    blob(c,x,by-40,74,20,SNOW,0.95*a);blob(c,x-58,by-26,26,13,SNOW,0.9*a);blob(c,x+58,by-26,26,13,SNOW,0.9*a);   // 어깨에 쌓인 눈
    // 가슴: 눈 껍데기 속 옥돌. 다리나 팔을 하나 꺾으면 껍데기가 깨지고, 몸이 빌 때는 껍데기가 벌어져 빛난다.
    const open=!coreHidden(),glow=rest?0.55+0.45*Math.sin(B.time*0.25):0;
    if(open||rest){blob(c,x,by+18,24+(rest?3:0),19,JADE,a);blob(c,x-6,by+12,10,7,JADE_LT,0.8*a);
      if(rest)blob(c,x,by+18,34,28,JADE_LT,0.25*glow);
      c.save();c.strokeStyle=INK;c.globalAlpha=0.8*a;c.lineWidth=1.8;c.beginPath();c.ellipse(x,by+18,24,19,0,0,Math.PI*2);c.stroke();c.restore();}
    if(!open){const sp=rest?5:0;   // 눈 껍데기: 납작한 눈 덩이 하나. 몸이 빌 때는 금이 벌어진다
      c.save();c.globalAlpha=0.97*a;c.fillStyle=SNOW;c.beginPath();c.moveTo(x-30,by+20);c.quadraticCurveTo(x-24,by+2,x-6,by+6);c.quadraticCurveTo(x+8,by-2,x+26,by+8);c.quadraticCurveTo(x+34,by+22,x+22,by+34);c.quadraticCurveTo(x,by+42,x-20,by+34);c.closePath();c.fill();
      c.strokeStyle=INK;c.globalAlpha=0.5*a;c.lineWidth=1.4;c.stroke();c.restore();
      blob(c,x+8,by+28,14,5,SNOW_SH,0.7*a);
      brush(c,[[x-22-sp,by+14],[x-8,by+20+sp*0.3],[x+4,by+15],[x+18+sp,by+24]],1.6,INK,0.6*a);
      if(rest)brush(c,[[x-8,by+20],[x-4,by+28],[x-10,by+34]],1.3,INK,0.5*a);}
    if(partCol(core)===RED)c.save(),c.strokeStyle=RED,c.lineWidth=2.5,c.beginPath(),c.ellipse(x,by+22,96,68,0,0,Math.PI*2),c.stroke(),c.restore();}
  // 머리: 어깨 사이에 파묻힌 작은 머리, 눈 눈썹과 돌 이빨
  {const o=shk(core),hx=cx+o,hy=by-46;
    blob(c,hx,hy,30,24,'#66686b',core.broken?0.3:1);
    c.save();c.strokeStyle=INK;c.globalAlpha=0.8;c.lineWidth=2;c.beginPath();c.ellipse(hx,hy,30,24,0,0,Math.PI*2);c.stroke();c.restore();
    brush(c,[[hx-32,hy-12],[hx-8,hy-22],[hx+14,hy-21],[hx+32,hy-11]],9,SNOW,0.95);fur(c,hx,hy-18,6,52,9,0.9);
    if(core.broken||(B.st==='end'&&B.result==='calm')){brush(c,[[hx-17,hy-2],[hx-6,hy+1]],3,'#efe3c8');brush(c,[[hx+6,hy+1],[hx+17,hy-2]],3,'#efe3c8');}
    else{const [ex,ey]=lookAt(hx,hy);blob(c,hx-12,hy-2,7,6,'#e7f1f4');blob(c,hx+12,hy-2,7,6,'#e7f1f4');blob(c,hx-12+ex*0.8,hy-2+ey*0.8,3.2,3.6,INK);blob(c,hx+12+ex*0.8,hy-2+ey*0.8,3.2,3.6,INK);}
    blob(c,hx,hy+13,13,4,'#2c2723');for(let i=0;i<4;i++)blob(c,hx-9+i*6,hy+11,2.2,2.6,'#e9e5dc');
    if(coreHidden()&&!rest){c.save();c.strokeStyle=INK;c.globalAlpha=.35;c.lineWidth=2;for(let i=0;i<2;i++){c.beginPath();c.arc(cx,by+18,32+i*7,Math.PI*0.15,Math.PI*0.85);c.stroke();}c.restore();}}
  // 팔: 길게 늘어진 설인 팔, 차돌 마디와 큰 주먹. 휩쓸 팔은 옆으로 젖혔다가 몸 앞을 가로로 쓸고 반대쪽 땅에 걸쳐 멈춘다.
  // 던질 팔은 눈덩이를 쥐고 머리 위로 들었다가 앞으로 내던진다.
  {const a=arm.broken?0.32:1,o=shk(arm),drop=arm.broken?40:0,ab=armBullet(),ra=B.restArm;
    const idleEl=s=>[cx+s*98,by+34+drop*0.6],idleHd=s=>[cx+s*106,by+96+drop];
    [-1,1].forEach(s=>{const shX=cx+s*72+o,shY=by-20;let el=idleEl(s),hd=idleHd(s),ball=null;
      const sweepPose=k=>{const hx=cx+s*(196-366*k);return [[(shX+hx)/2+s*12,by+44],[hx,by+80+6*k]];};
      if(ab&&ab.side===s){const p=armPhase(ab);
        if(p.tell){const e=1-Math.pow(1-clamp(ab.t/AR.tell,0,1),2);el=lerp2(idleEl(s),[cx+s*132,by-8],e);hd=lerp2(idleHd(s),[cx+s*196,by+8],e);}
        else [el,hd]=sweepPose(p.e);}
      else if(ra&&ra.side===s){const u=clamp((ra.back||0)/AR.back,0,1),[e1,h1]=sweepPose(1);el=lerp2(e1,idleEl(s),u);hd=lerp2(h1,idleHd(s),u);}
      else{const th=throwOf(s);
        if(th){const d=th.t-th.delay,up=[[cx+s*96,by-48],[cx+s*80,by-96]],fw=[[cx+s*70,by+12],[cx+s*34,by+66]];
          if(d<=SB.wind){const e=1-Math.pow(1-d/SB.wind,2);el=lerp2(idleEl(s),up[0],e);hd=lerp2(idleHd(s),up[1],e);ball=th;}
          else{const e=(d-SB.wind)/SB.follow;el=lerp2(up[0],fw[0],e);hd=lerp2(up[1],fw[1],e);}}}
      brush(c,[[shX,shY],el,hd],20,QUARTZ_SH,0.9*a);
      quartz(c,(shX+el[0])/2,(shY+el[1])/2,15,13,a,s+2);quartz(c,el[0],el[1],14,12,a,s+4);quartz(c,(el[0]+hd[0])/2,(el[1]+hd[1])/2,13,11,a,s+5);
      fur(c,shX+s*6,shY-6,3,26,24,a);
      for(let i=0;i<3;i++)quartz(c,hd[0]+s*(i-1)*9,hd[1]+(i===1?4:0),9,10,a,i+7);   // 주먹 마디
      quartz(c,hd[0]-s*4,hd[1]-8,14,11,a,s+9);
      if(ball)drawSnowball(c,hd[0],hd[1]-18,16,ball.t*0.05);   // 쥐고 든 눈덩이
      if(partCol(arm)===RED)brush(c,[[shX,shY],el,hd],3,RED,0.7);});}
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
/* 결정 D-62: 모든 전투 배경은 상대 뒤쪽 화면 전체로 그린다 (design/data/decisions.csv).
   돌 골렘은 눈 쌓인 돌산 절벽 길. 양쪽 절벽 턱마다 눈, 길가의 눈 덮인 돌탑과 장승, 굵은 눈발. */
function drawStoneCliff(c){
  const t=B.time,still=Vfx.reducedMotion,gy=BOX.y-52,STONE='rgba(96,98,100,';
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
  // 서리다래 덩굴: 오른쪽 절벽 위에서 늘어진 줄기와 서리 낀 열매
  for(let k=0;k<4;k++){
    const x=LW*0.76+k*LW*0.045,len=gy*(0.35+hash(k*2.2)*0.25),sw=still?0:Math.sin(t*0.025+k)*4;
    const pts=[];for(let s=0;s<=6;s++)pts.push([x+Math.sin(s*0.9+k)*8+sw*s/6,s*len/6]);
    brush(c,pts,2,'#4f6b3a',0.45);
    for(let s=2;s<=6;s+=2){blob(c,pts[s][0]+4,pts[s][1]+2,4,4,'#9fb8b0',0.7);blob(c,pts[s][0]+3,pts[s][1]+1,1.5,1.5,'#f4f6f2',0.8);}
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
  const n=still?0:34;
  for(let i=0;i<n;i++){const sp=0.35+hash(i)*0.5,y=((t*sp+i*41)%(LH+20))-10,x=(hash(i*2.9)*LW+Math.sin(t*0.02+i)*12+t*0.2*(1+hash(i)))%LW;
    c.save();c.globalAlpha=0.55;c.fillStyle='#f4f6f2';const r=1.5+hash(i*1.3)*2;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.restore();}
}
/* 상자 안 바닥: 쌓인 눈, 찧은 자국, 눈폭탄 자리의 눈가루, 남은 발바닥·멈춘 팔·드러난 핵 */
function drawSnowFloor(c){
  for(let i=0;i<9;i++){const x=BOX.x+hash(i*5.1)*BOX.w,y=BOX.y+hash(i*2.3)*BOX.h;blob(c,x,y,10+hash(i)*14,3,SNOW_SH,0.22);}
  for(const cr of B.craters||[]){const a=Math.min(1,cr.t/60)*0.5;
    blob(c,cr.x,cr.y+4,30,11,INK,0.08*a*2);
    for(let i=0;i<6;i++){const ang=i*Math.PI/3+cr.seed;brush(c,[[cr.x+Math.cos(ang)*14,cr.y+4+Math.sin(ang)*6],[cr.x+Math.cos(ang+0.2)*32,cr.y+4+Math.sin(ang+0.2)*13]],1.2,INK,a);}}
  for(const sp of B.snowSpots||[]){const a=Math.min(1,sp.t/50);
    blob(c,sp.x,sp.y+3,16,7,SNOW,0.85*a);
    for(let i=0;i<6;i++){const ang=sp.seed+i*1.05,d=10+hash(i+sp.seed)*16;blob(c,sp.x+Math.cos(ang)*d,sp.y+3+Math.sin(ang)*d*0.5,5+hash(i*2+sp.seed)*5,2.6,SNOW,0.75*a);}}
  const rs=B.restSole;
  if(rs){const g=rs.gone||0,al=1-g/ST.crumble;drawSole(c,rs.x,rs.y+g*0.5,1,al);
    if(rs.crack)brush(c,[[rs.x-12,rs.y-6],[rs.x-3,rs.y+2],[rs.x+7,rs.y-4],[rs.x+15,rs.y+6]],1.8,INK,0.85*al);
    if(g)for(let i=0;i<4;i++)blob(c,rs.x-18+i*12,rs.y+10+g*0.8,4,3,SLAB,al);}
  const ra=B.restArm;
  if(ra){const u=clamp((ra.back||0)/AR.back,0,1);drawArmIn(c,ra.side,ra.cov,ra.hand+(armFrom(ra.side)-ra.hand)*u,1,0);}
  const m=B.mark;if(m&&m.golem&&m.part.core)drawCoreSpot(c,m);
}
/* 드러난 몸의 핵: 칸 한가운데의 옥돌. 눈 껍데기가 남아 있으면 금 사이로 푸른빛만 샌다 */
function drawCoreSpot(c,m){
  const x=m.x,y=m.y,g=0.5+0.5*Math.sin(B.time*0.2),ring=(rx,ry,col,al,w)=>{c.save();c.strokeStyle=col;c.globalAlpha=al;c.lineWidth=w;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.stroke();c.restore();};
  blob(c,x,y+6,40,14,INK,0.08);blob(c,x,y,36+g*5,31+g*4,JADE_LT,0.22+0.18*g);
  if(coreHidden()){blob(c,x,y,27,23,SNOW,0.97);blob(c,x+6,y+8,16,7,SNOW_SH,0.7);
    brush(c,[[x-19,y-4],[x-7,y+2],[x+4,y-3],[x+17,y+5]],2,JADE,0.85);brush(c,[[x-5,y+2],[x-2,y+13]],1.5,JADE,0.75);ring(27,23,INK,0.6,1.5);return;}
  blob(c,x,y,23,19,JADE,1);blob(c,x-7,y-6,9,6,JADE_LT,0.9);blob(c,x+8,y+7,7,4,'#3f7158',0.6);ring(23,19,INK,0.85,1.8);
  for(let i=0;i<6;i++){const a=i*Math.PI/3+B.time*0.02;brush(c,[[x+Math.cos(a)*27,y+Math.sin(a)*23],[x+Math.cos(a)*(32+g*4),y+Math.sin(a)*(27+g*4)]],1.4,JADE_LT,0.8);}
}

/* ---------- 돌 얻기 (결정 D-184) ---------- */
const STONE_OF={leg:'gudeuldol',arm:'chadol',head:'okdol'};
function stoneRoll(id,hitText){
  const s=B.stones||(B.stones={}),r=s[id]||(s[id]={miss:0,got:0}),t=T(),item=STONE_OF[id];
  part(id).shake=10;bSplash(B.px,B.py-6,id==='head'?JADE:id==='arm'?'#bdb8ad':SLAB);Sound.playSfx('battle_hit');
  if(r.got>=t.golem_stone_cap){B.msg=hitText;return false;}
  // 결정 D-224: 곡괭이가 아닌 도구로 치면 확률이 battle_tool_bad_mult 배
  if(Math.random()<toolChance(part(id),Math.min(1,t.golem_stone_chance+t.golem_stone_step*r.miss))){r.got++;r.miss=0;B.loot.push(item);B.msg=hitText+' '+ITEMS[item].n+' 한 조각이 떨어졌다!';return true;}
  r.miss++;B.msg=hitText+(toolFit(part(id))==='bad'?' 도구가 잘 안 먹는다.':' 돌가루만 튄다.');return false;
}
const HIT_TEXT={leg:'박힌 발바닥을 쳤다!',arm:'멈춘 차돌 팔을 쳤다!',head:'옥돌 핵을 쳤다!'};
const CLOSE_TEXT={leg:'발바닥이 부서져 눈 속에 묻혔다.',arm:'골렘이 팔을 거둬들였다.',head:'골렘이 가슴을 다시 여몄다.'};
/* 공격 뒤 표식 (결정 D-183·D-184): 남은 발바닥, 칸 끝에 멈춘 팔, 칸 한가운데의 핵에만 뜬다. 엔진의 openMark 대신 부른다 */
function golemOpenMark(p){
  const t=T();
  if(p.id==='leg'){const s=B.restSole;B.mark=null;if(!s)return true;s.marked=true;
    B.mark={x:s.x,y:s.y,t:t.golem_foot_rest,max:t.golem_foot_rest,part:p,golem:true};B.msg='구들돌 발바닥이 눈에 박혀 있다.';return true;}
  if(p.id==='arm'){const a=B.restArm;B.mark=null;if(!a)return true;a.marked=true;const [y0,y1]=armBand(a.cov);
    B.mark={x:a.hand,y:(y0+y1)/2,t:t.golem_arm_rest,max:t.golem_arm_rest,part:p,golem:true};B.msg='휩쓴 차돌 팔이 바닥에 걸쳐 멈췄다.';return true;}
  // 몸: 눈폭탄을 하나도 안 맞고 버텼을 때만 핵이 드러난다
  if(B.hitThis){B.mark=null;B.msg='눈을 털어 내는 사이 골렘이 숨을 고르고 가슴을 여몄다.';return true;}
  B.mark={x:BOX.x+BOX.w/2,y:BOX.y+BOX.h/2,t:t.golem_core_frames,max:t.golem_core_frames,part:p,golem:true,rest:true};
  B.msg=coreHidden()?'골렘이 숨을 몰아쉰다. 눈 껍데기 덮인 핵이 들썩인다!':'골렘이 숨을 몰아쉰다. 옥돌 핵이 드러났다!';return true;
}
function strikeGolem(){
  const m=B.mark;if(!m||!m.golem)return false;
  if(B.calmStone){const s=coverPoint(B.calmStone);if(Math.hypot(s.x-B.px,s.y-B.py)<26)return false;}   // 소원 돌 바로 놓기는 엔진이 맡는다
  if(Math.hypot(m.x-B.px,m.y-B.py)>=battleHandProfile().radius)return false;
  const p=m.part;B.mark=null;B.golemHit=true;
  if(p.id==='leg'&&B.restSole)B.restSole.crack=true;
  if(p.core&&coreHidden()){stoneRoll('head',HIT_TEXT.head);B.msg+=' 눈 껍데기가 두꺼워 몸은 버틴다.';renderBHud();return true;}
  p.hp=Math.max(0,p.hp-toolDamage(p));   // 결정 D-224: 돌은 곡괭이가 잘 먹는다
  const got=stoneRoll(p.id,HIT_TEXT[p.id]);
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
}

/* ---------- 공격 ---------- */
const stompCount=()=>((B&&B.stompRound)||0)>=2?3:2;   // 세 번째 발 찧기부터 세 번 찧는다
defineAttacks({
  golemStomp:{get dur(){return (stompCount()-1)*ST.gap+ringEnd(ST.tell+ST.drop)+4;},tick(t){if(t)return;
    const n=stompCount(),start=Math.random()<0.5?-1:1;B.stompRound=(B.stompRound||0)+1;B.restSole=null;
    for(let i=0;i<n;i++)B.bullets.push({k:'golemStomp',t:0,delay:i*ST.gap,foot:i%2?-start:start,x:null,y:null,last:i===n-1});}},
  golemArm:{dur:AR.tell+AR.sweep+4,tick(t){if(t)return;B.restArm=null;
    const side=Math.random()<0.5?-1:1,cov=Math.random()<0.5?'top':'bottom';B.bullets.push({k:'golemArm',t:0,side,cov});}},
  golemSnow:{get dur(){return (T().golem_barrage_count-1)*SB.gap+SB.wind+SB.fly+SB.splat+4;},tick(t){if(t)return;
    const n=T().golem_barrage_count,s0=Math.random()<0.5?-1:1;
    for(let i=0;i<n;i++)B.bullets.push({k:'golemSnowball',t:0,delay:i*SB.gap,i,side:i%2?-s0:s0,tx:null,ty:null});}},
});
defineBullets({
  golemStomp:{
    step(b){b.t++;const p=stompPhase(b);
      if(b.x==null&&b.t>b.delay){b.x=clamp(B.px,BOX.x+30,BOX.x+BOX.w-30);b.y=clamp(B.py,BOX.y+20,BOX.y+BOX.h-16);}
      if(b.t===p.hit){Sound.playSfx('battle_hit');snowBurst(b.x,b.y,16,true);B.quake=14;
        (B.craters||(B.craters=[])).push({x:b.x,y:b.y,t:240,seed:Math.random()*3});if(B.craters.length>4)B.craters.shift();
        if(Math.hypot(B.px-b.x,B.py-b.y)<ST.sole)bHitMe();}
      if(b.t>p.hit&&b.t<=p.ring){const r=ST.sole+(b.t-p.hit)*ST.ringSpeed,d=Math.hypot(B.px-b.x,B.py-b.y);if(Math.abs(d-r)<ST.ringBand)bHitMe();}
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
      else{const r=R+(b.t-p.hit)*ST.ringSpeed;   // 여진: 찧은 자리에서 둥글게 퍼지는 금과 눈가루
        if(r<ST.ringMax){const a=1-r/ST.ringMax;
          c.save();c.strokeStyle=INK;c.globalAlpha=0.75*a;c.lineWidth=3;c.beginPath();c.ellipse(b.x,b.y+4,r,r*0.62,0,0,Math.PI*2);c.stroke();
          c.globalAlpha=0.5*a;c.lineWidth=1;c.beginPath();c.ellipse(b.x,b.y+4,r-6,(r-6)*0.62,0,0,Math.PI*2);c.stroke();c.restore();
          for(let i=0;i<10;i++){const ang=i*0.628+b.delay;blob(c,b.x+Math.cos(ang)*r,b.y+4+Math.sin(ang)*r*0.62,2.6,1.8,SNOW,0.9*a);}}
        const g=b.t-(p.ring+ST.stay);if(!b.last&&g>0){al=1-g/ST.crumble;sy+=g*0.5;for(let i=0;i<4;i++)blob(c,b.x-18+i*12,b.y+10+g*0.8,4,3,SLAB,al);}}
      drawSole(c,b.x,sy,1,al);
      const a=b.t-p.hit;
      if(a>0&&a<16){c.save();c.fillStyle=INK;c.globalAlpha=1-a/16;c.font='bold 17px "Gowun Batang", serif';c.textAlign='center';c.fillText('쿵',b.x+40,b.y-18);c.restore();}
    }},
  golemArm:{
    step(b){b.t++;const p=armPhase(b);
      if(p.sweep){const [y0,y1]=armBand(b.cov),under=b.side<0?B.px<=p.hand+16:B.px>=p.hand-16;   // 팔이 지나간(덮은) 자리
        if(B.py>=y0-4&&B.py<=y1+4&&under)bHitMe();
        if(Math.random()<0.5)snowBurst(p.hand,clamp(B.py<y0||B.py>y1?armEdgeY(b.cov):(y0+y1)/2,BOX.y,BOX.y+BOX.h),1,true);}
      if(b.t===AR.tell+AR.sweep){b.dead=1;B.restArm={side:b.side,cov:b.cov,hand:armTo(b.side),back:0};
        const gx=B.px>BOX.x+BOX.w/2?BOX.x+AV.gap/2+12+Math.random()*(BOX.w/2-AV.gap-24):BOX.x+BOX.w/2+AV.gap/2+12+Math.random()*(BOX.w/2-AV.gap-24);
        B.bullets.push({k:'golemAvalanche',t:0,gx});if(B.st!=='end')B.msg='쓸려 간 눈이 위에서 쏟아진다!';}},
    draw(c,b){const p=armPhase(b),[y0,y1]=armBand(b.cov),edge=armEdgeY(b.cov);
      if(p.tell){const k=b.t/AR.tell,flash=k>0.75&&Math.floor(b.t/4)%2;
        c.save();c.fillStyle='rgba(180,67,42,'+(0.05+0.12*k).toFixed(3)+')';c.fillRect(BOX.x,y0,BOX.w,y1-y0);
        c.strokeStyle=RED;c.globalAlpha=flash?0.95:0.5;c.lineWidth=1.6;c.setLineDash([7,5]);c.beginPath();c.moveTo(BOX.x,edge);c.lineTo(BOX.x+BOX.w,edge);c.stroke();c.restore();
        for(let i=0;i<6;i++){const x=BOX.x+i*BOX.w/5;brush(c,[[x,y0+6],[x+18,y1-6]],1,RED,0.25*k);}
        // 칸 가장자리 밖에서 젖혀 둔 주먹이 가로로 뒤로 물러난다
        const ex=(b.side<0?BOX.x+6:BOX.x+BOX.w-6)+b.side*10*k;quartz(c,ex,(y0+y1)/2,14,(y1-y0)*0.26,0.5+0.5*k,3);return;}
      drawArmIn(c,b.side,b.cov,p.hand,1,p.k);
    }},
  golemAvalanche:{
    step(b){b.t++;if(b.t<=AV.tell)return;const y=BOX.y-8+(b.t-AV.tell)*AV.speed;
      if(Math.abs(B.py-y)<AV.band&&Math.abs(B.px-b.gx)>AV.gap/2)bHitMe();
      if(y>BOX.y+BOX.h+20)b.dead=1;},
    draw(c,b){const still=Vfx.reducedMotion;
      if(b.t<=AV.tell){const k=b.t/AV.tell;
        for(let x=BOX.x;x<BOX.x+BOX.w;x+=16){if(Math.abs(x+8-b.gx)<AV.gap/2)continue;blob(c,x+8+(still?0:Math.sin(b.t*0.9+x)*1.5),BOX.y+4,10,6+4*k,SNOW,0.9);}
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
      if(b.tx==null&&b.t>=rel){const aim=b.i%3!==1;   // 셋에 둘은 손 자리, 하나는 비켜 갈 만한 옆자리를 노린다
        const ox=aim?0:(Math.random()<0.5?-1:1)*SB.spread,oy=aim?0:(Math.random()-0.5)*SB.spread;
        b.tx=clamp(B.px+ox,BOX.x+20,BOX.x+BOX.w-20);b.ty=clamp(B.py+oy,BOX.y+18,BOX.y+BOX.h-14);
        const h=toScreen(LW/2+b.side*80,bodyY()-114);b.sx=h.x;b.sy=h.y;}
      if(b.t===land){Sound.playSfx('battle_hit');snowPowder(b.tx,b.ty);if(Math.hypot(B.px-b.tx,B.py-b.ty)<SB.hit)bHitMe();}
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
/* 상자 밖까지 날아가는 눈덩이는 잘리지 않게 상자 위에 그린다 (결정 D-182). 손에서 놓인 뒤부터 그린다 */
function drawSnowFlights(c){
  for(const b of B.bullets){if(b.k!=='golemSnowball'||b.tx==null)continue;
    const rel=b.delay+SB.wind,land=rel+SB.fly;if(b.t>=land)continue;
    const k=(b.t-rel)/SB.fly,x=b.sx+(b.tx-b.sx)*k,y=b.sy+(b.ty-b.sy)*k-80*4*k*(1-k);
    drawSnowball(c,x,y,13+9*k,b.t*0.15);
  }
}
function tickGolem(){
  if(B.quake>0)B.quake--;
  for(const cr of B.craters||[])cr.t--;if(B.craters)B.craters=B.craters.filter(cr=>cr.t>0);
  for(const sp of B.snowSpots||[])sp.t--;if(B.snowSpots)B.snowSpots=B.snowSpots.filter(sp=>sp.t>0);
  // 남은 발바닥과 멈춘 팔은 표식이 사라지면(쳤거나 시간이 다 되면) 부서지거나 거둬진다
  const held=id=>B.mark&&B.mark.golem&&B.mark.part.id===id,between=['idle','tell'].includes(B.st);
  const rs=B.restSole;if(rs&&!held('leg')&&(rs.marked||between)&&++rs.gone>=ST.crumble)B.restSole=null;
  const ra=B.restArm;if(ra&&!held('arm')&&(ra.marked||between)&&++ra.back>=AR.back)B.restArm=null;
  if(B.gMark&&B.mark!==B.gMark){if(!B.golemHit&&!B.mark&&B.st!=='end')B.msg=CLOSE_TEXT[B.gMark.part.id];B.gMark=null;}
  if(B.mark&&B.mark.golem&&B.gMark!==B.mark){B.gMark=B.mark;B.golemHit=false;}
}
function drawGolemScene(c){
  // 발이 찧을 때 땅이 울린다(약한 지진)
  if(B.quake>0&&!Vfx.reducedMotion){c.save();c.translate(Math.sin(B.quake*2.7)*B.quake*0.25,Math.cos(B.quake*3.1)*B.quake*0.15);drawGolem(c);c.restore();}
  else drawGolem(c);
}
defineEnemies({
  golem:{name:'돌 골렘',calmLabel:'진정',
    intro:'눈을 뒤집어쓴 성황당 돌무더기가 일어선다!',   // 결정 D-103: 부위는 고르지 않는다(확정 흐름)
    firstPart:'leg',   // 결정 D-227: 안내 글 없이 시작한다
    calmAction:{amount:TABLES.CALM.golem.story_stone/4},placeGift:'story_stone',
    headPose(){return toScreen(LW/2,bodyY()-46);},
    openMark:golemOpenMark,
    parts:tableParts('golem',{leg:{atk:'golemStomp',mark:'발',tell:'골렘이 구들돌 발을 높이 쳐든다.'},
      arm:{atk:'golemArm',mark:'팔',tell:'골렘이 차돌 팔을 옆으로 크게 젖힌다.'},
      head:{atk:'golemSnow',mark:'핵',tell:'골렘이 두 팔로 눈을 퍼 올린다.'}}),
    likes:TABLES.CALM.golem,likeText:'돌무더기가 잠시 숨을 고른다.',
    likeTexts:{story_stone:'아빠가 못 올린 소원 돌을 건넸다. 돌 골렘이 가만히 내려다본다.'},
    coreHidden:'가슴이 두꺼운 눈 껍데기에 덮여 있다.',
    coreShown:'눈 껍데기가 깨지고 옥돌 가슴이 드러났다!',
    calmWin:'돌 골렘이 스르르 내려앉는다. 눈 덮인 성황당 돌무더기로 돌아왔다.',
    win:'가슴의 눈돌이 빠지자 돌 골렘이 와르르 무너진다.',
    lose:'돌 골렘에게 밀려 눈 비탈을 데굴데굴 굴러 내려왔다.',
    pickAttack:pickGolem,strike:strikeGolem,tickHazards:tickGolem,drawFloor:drawSnowFloor,drawOver:drawSnowFlights,
    backdrop:drawStoneCliff,draw:drawGolemScene},
});
})();
