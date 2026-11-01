'use strict';
/* 돌너머 전투: 돌 골렘 (깨어난 성황당 돌무더기). 원본 표: design/data/bosses.csv · boss_parts.csv
   결정 D-168: 겨울 산의 돌 골렘. 눈을 뒤집어쓴 설인과 돌무더기가 섞인 모습이다(사용자 피드백 33, 2026-11-01).
   부위 셋은 저마다 다른 돌로 되어 있다: 다리는 넓적한 구들돌, 팔은 흰 차돌, 몸은 눈 껍데기 속의 옥돌.
   - 다리: 투박한 돌 발바닥으로 손 자리를 쿵 찧는다. 찧은 자리에서 눈 부스러기가 튀고 충격파가 둥글게 퍼진다.
   - 팔: 차돌 팔로 상자를 가로질러 느리게 휩쓴다(위나 아래 한쪽만 빈다). 쓸려 간 눈이 위에서 눈사태로 쏟아진다.
   - 몸(핵심): 눈덩이 폭탄을 손 자리로 던진다. 막을 수 없고 피해야 한다.
   - 공격 둘마다 한 번 몸이 빈다(golem_rest_every). 몸 표식을 치면 확률로 옥돌.
   결정 D-169: 박힌 발·휘두르는 팔 옆·빈 몸을 치면 그 부위의 돌이 확률로 떨어진다. 빗나갈수록 확률이 오른다(tuning.csv golem_stone_*). */
(()=>{
const T=()=>TABLES.TUNING;
const SNOW='#f3f5f4',SNOW_SH='#c9d2d8',SLAB='#5b5048',SLAB_LT='#7d7066',QUARTZ='#d2cdc3',QUARTZ_SH='#a39d92',JADE='#5f9a7a',JADE_LT='#a6d8ba',BODY='#6c6e70';
const ST={tell:44,drop:7,gap:74,sole:24,ringMax:96,ringSpeed:3.4,ringBand:8,lift:14};          // 발 찧기
const AR={tell:50,sweep:86,edge:0.62};                                                          // 팔 휩쓸기
const AV={tell:26,speed:2.6,band:13,gap:66};                                                     // 눈사태
const SB={gap:46,tell:30,fly:32,radius:24,splat:30};                                             // 눈덩이 폭탄
const toScreen=(x,y)=>({x:LW/2+(x-LW/2)*0.84,y:EY+(y-EY)*0.84});
const toBoss=(x,y)=>({x:LW/2+(x-LW/2)/0.84,y:EY+(y-EY)/0.84});
const legBroken=()=>part('leg').broken;
function bodyY(){return EY+2+(legBroken()?22:0)+Math.sin(B.time*0.04)*2;}

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
/* 눈덩이 적: 둥근 눈뭉치에 숯 같은 눈과 성난 눈썹 */
function drawSnowball(c,x,y,r,rot,alpha=1){
  blob(c,x,y,r,r,SNOW,alpha);blob(c,x+r*0.3,y+r*0.35,r*0.7,r*0.55,SNOW_SH,0.6*alpha);
  c.save();c.strokeStyle=INK;c.globalAlpha=0.85*alpha;c.lineWidth=1.6;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();c.restore();
  for(let i=0;i<3;i++){const a=rot+i*2.1;blob(c,x+Math.cos(a)*r*0.72,y+Math.sin(a)*r*0.72,1.6,1.6,SNOW_SH,0.9*alpha);}
  blob(c,x-r*0.32,y-r*0.05,r*0.14,r*0.17,INK,alpha);blob(c,x+r*0.32,y-r*0.05,r*0.14,r*0.17,INK,alpha);
  brush(c,[[x-r*0.55,y-r*0.42],[x-r*0.15,y-r*0.22]],1.8,INK,alpha);brush(c,[[x+r*0.15,y-r*0.22],[x+r*0.55,y-r*0.42]],1.8,INK,alpha);
  brush(c,[[x-r*0.25,y+r*0.38],[x,y+r*0.3],[x+r*0.25,y+r*0.38]],1.4,INK,0.8*alpha);
}
/* 눈 부스러기 튀기 */
function snowBurst(x,y,n,up){for(let i=0;i<n;i++){const a=up?-Math.PI/2+(Math.random()-0.5)*2.2:Math.random()*Math.PI*2,s=1.2+Math.random()*2.8;
  B.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:2+Math.random()*3.5,t:30,col:Math.random()<0.75?SNOW:SNOW_SH});}}

/* ---------- 지금 진행 중인 공격 (그림이 쓰는 상태) ---------- */
const stompOf=foot=>B.bullets.find(b=>b.k==='golemStomp'&&b.foot===foot&&b.t>b.delay);
const armBullet=()=>B.bullets.find(b=>b.k==='golemArm');
function stompPhase(b){const a=b.delay,tl=a+ST.tell,hit=tl+ST.drop,rest=hit+T().golem_foot_rest;
  return {wait:b.t<=a,tell:b.t>a&&b.t<=tl,falling:b.t>tl&&b.t<=hit,down:b.t>hit&&b.t<=rest,lifting:b.t>rest,hit,rest,k:clamp((b.t-a)/ST.tell,0,1),end:rest+ST.lift};}
function armPhase(b){const sw=b.t-AR.tell,k=clamp(sw/AR.sweep,0,1),e=k<0.5?2*k*k:1-2*(1-k)*(1-k);
  const from=b.side<0?BOX.x-40:BOX.x+BOX.w+40,to=b.side<0?BOX.x+BOX.w+40:BOX.x-40;
  return {tell:b.t<=AR.tell,sweep:b.t>AR.tell&&b.t<=AR.tell+AR.sweep,k,from,hand:from+(to-from)*e};}
function armBand(b){return b.cov==='top'?[BOX.y,BOX.y+BOX.h*AR.edge]:[BOX.y+BOX.h*(1-AR.edge),BOX.y+BOX.h];}
function armEdgeY(b){return b.cov==='top'?BOX.y+BOX.h*AR.edge:BOX.y+BOX.h*(1-AR.edge);}

/* ---------- 골렘 그림 (상대 자리, 0.84배로 그려진다) ---------- */
function drawGolem(c){
  const cx=LW/2,cy=EY,leg=part('leg'),arm=part('arm'),core=part('head');
  const sink=leg.broken?22:0,by=bodyY(),rest=!!(B.mark&&B.mark.rest);
  blob(c,cx,cy+130,150,12,INK,0.1);
  // 다리: 구들돌 기둥과 넓적한 돌 발. 찧을 발은 예고 동안 들리고, 찧는 동안은 상자 안으로 뻗는다.
  {const a=leg.broken?0.35:1,o=shk(leg),flash=partCol(leg)===RED;
    [-1,1].forEach(s=>{const hipX=cx+s*44+o,hipY=by+50,st=stompOf(s);
      if(st){const p=stompPhase(st);
        if(p.tell){const lift=22*p.k;legColumn(c,hipX,hipY,hipX+s*6,cy+118-lift,30,a);drawSole(c,hipX+s*6,cy+124-lift,0.8,a);return;}
        if(!p.wait&&st.x!=null){const top=toBoss(colTopX(st),BOX.y);legColumn(c,hipX,hipY,top.x,top.y+8,30,a);return;}}
      legColumn(c,hipX,hipY,hipX+s*4,cy+118,30,a);drawSole(c,hipX+s*4,cy+125,0.8,a);
      if(flash)brush(c,[[hipX-16,hipY],[hipX-18,cy+118]],2,RED,0.8);});}
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
  // 팔: 길게 늘어진 설인 팔, 차돌 마디와 큰 주먹. 휩쓸 팔은 예고 동안 옆으로 쳐들고, 휩쓰는 동안 상자 쪽으로 뻗는다.
  {const a=arm.broken?0.32:1,o=shk(arm),drop=arm.broken?40:0,ab=armBullet();
    [-1,1].forEach(s=>{const shX=cx+s*72+o,shY=by-20;let el,hd;
      if(ab&&ab.side===s){const p=armPhase(ab);
        if(p.tell){const k=clamp(ab.t/AR.tell,0,1);el=[cx+s*(112+14*k),by-30-30*k];hd=[cx+s*(140+20*k),by-56-40*k];}
        else{const tgt=toBoss(s<0?BOX.x-6:BOX.x+BOX.w+6,armEdgeY(ab));el=[cx+s*118,by+40];hd=[tgt.x,Math.min(tgt.y,cy+176)];}}
      else{el=[cx+s*98,by+34+drop*0.6];hd=[cx+s*106,by+96+drop];}
      brush(c,[[shX,shY],el,hd],20,QUARTZ_SH,0.9*a);
      quartz(c,(shX+el[0])/2,(shY+el[1])/2,15,13,a,s+2);quartz(c,el[0],el[1],14,12,a,s+4);quartz(c,(el[0]+hd[0])/2,(el[1]+hd[1])/2,13,11,a,s+5);
      fur(c,shX+s*6,shY-6,3,26,24,a);
      for(let i=0;i<3;i++)quartz(c,hd[0]+s*(i-1)*9,hd[1]+(i===1?4:0),9,10,a,i+7);   // 주먹 마디
      quartz(c,hd[0]-s*4,hd[1]-8,14,11,a,s+9);
      if(partCol(arm)===RED)brush(c,[[shX,shY],el,hd],3,RED,0.7);});}
}
/* 찧는 다리 기둥이 상자 위쪽 가장자리를 지나는 x (엉덩이에서 발 쪽으로 기운다) */
function colTopX(b){const hip=toScreen(LW/2+b.foot*44,0).x;return hip+(b.x-hip)*0.4;}

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
/* 상자 안 바닥: 쌓인 눈과 찧은 자국 */
function drawSnowFloor(c){
  for(let i=0;i<9;i++){const x=BOX.x+hash(i*5.1)*BOX.w,y=BOX.y+hash(i*2.3)*BOX.h;blob(c,x,y,10+hash(i)*14,3,SNOW_SH,0.22);}
  for(const cr of B.craters||[]){const a=Math.min(1,cr.t/60)*0.5;
    blob(c,cr.x,cr.y+4,30,11,INK,0.08*a*2);
    for(let i=0;i<6;i++){const ang=i*Math.PI/3+cr.seed;brush(c,[[cr.x+Math.cos(ang)*14,cr.y+4+Math.sin(ang)*6],[cr.x+Math.cos(ang+0.2)*32,cr.y+4+Math.sin(ang+0.2)*13]],1.2,INK,a);}}
}

/* ---------- 돌 얻기 (결정 D-169) ---------- */
const STONE_OF={leg:'gudeuldol',arm:'chadol',head:'okdol'};
function stoneRoll(id,hitText){
  const s=B.stones||(B.stones={}),r=s[id]||(s[id]={miss:0,got:0}),t=T(),item=STONE_OF[id];
  part(id).shake=10;bSplash(B.px,B.py-6,id==='head'?JADE:id==='arm'?'#bdb8ad':SLAB);Sound.playSfx('battle_hit');
  if(r.got>=t.golem_stone_cap){B.msg=hitText+' 이제 떨어질 만한 '+ITEMS[item].n+'은 없다.';return;}
  if(Math.random()<Math.min(1,t.golem_stone_chance+t.golem_stone_step*r.miss)){r.got++;r.miss=0;B.loot.push(item);B.msg=hitText+' '+ITEMS[item].n+' 한 조각이 떨어졌다!';}
  else{r.miss++;B.msg=hitText+' 돌 조각만 튄다. 더 치면 떨어질 것 같다.';}
}
const nearFoot=b=>Math.hypot(B.px-b.x,B.py-b.y)<ST.sole+14;
function downFoot(){return B.bullets.find(b=>b.k==='golemStomp'&&b.x!=null&&stompPhase(b).down&&nearFoot(b));}
/* 팔 옆: 비어 있는 띠에서 팔 가장자리에 붙어 있고, 팔이 이미 내 옆을 지나고 있을 때 */
function besideArm(b){const p=armPhase(b);if(!p.sweep)return false;const [y0,y1]=armBand(b),edge=armEdgeY(b);
  const inGap=B.py<y0||B.py>y1,along=b.side<0?B.px<=p.hand+10:B.px>=p.hand-10;
  return inGap&&along&&Math.abs(B.py-edge)<30;}
function strikeGolem(){
  const f=downFoot();
  if(f){f.shake=10;stoneRoll('leg','박힌 발을 쳤다!');return true;}
  const a=armBullet();
  if(a&&besideArm(a)){if(a.sideHits>=3){B.msg='팔이 너무 빨리 지나간다. 다음 휩쓸기를 노리자.';return true;}a.sideHits=(a.sideHits||0)+1;stoneRoll('arm','휘두르는 팔 옆을 쳤다!');return true;}
  const m=B.mark;
  if(m&&m.rest&&Math.hypot(m.x-B.px,m.y-B.py)<battleHandProfile().radius){
    const core=m.part;B.mark=null;
    if(coreHidden()){stoneRoll('head','빈 가슴을 쳤다!');B.msg+=' 눈 껍데기가 두꺼워 몸은 버틴다.';renderBHud();return true;}
    const pickaxe=battlePickaxe(core),t=T(),dmg=(G.sharp?t.battle_sharp_damage:t.battle_base_damage)+(pickaxe?t.battle_pickaxe_bonus:0);
    B.autoToolT=pickaxe?12:0;core.hp=Math.max(0,core.hp-dmg);stoneRoll('head','빈 가슴을 쳤다!');
    if(core.hp<=0)breakPart(core);
    renderBHud();return true;
  }
  return false;
}
function golemHandTool(){
  if(downFoot()||(armBullet()&&besideArm(armBullet())))return Array.isArray(G.f.battleTools)&&G.f.battleTools.includes('pickaxe')?'pickaxe':null;
  return null;
}

/* ---------- 공격 고르기: 공격 둘마다 몸이 빈다 ---------- */
function pickGolem(){
  const core=B.parts.find(p=>p.core);
  if(!core.broken&&(B.sinceRest||0)>=T().golem_rest_every){
    B.sinceRest=0;B.cur=core;B.st='open';B.opens=(B.opens||0)+1;B.hitThis=false;
    const life=T().golem_rest_frames,p=golemMark(core);
    B.mark={x:p.x,y:p.y,t:life,max:life,part:core,rest:true};
    B.msg=coreHidden()?'골렘이 숨을 몰아쉰다. 눈 껍데기가 들썩인다! 가슴을 쳐 보자.':'골렘이 숨을 몰아쉰다. 옥돌 가슴이 비었다!';return;
  }
  B.sinceRest=(B.sinceRest||0)+1;
  const L=bLiving();let o=L.filter(p=>p!==B.last);if(!o.length)o=L;
  const first=!B.last&&B.E.firstPart?L.find(q=>q.id===B.E.firstPart):null;
  const p=first||o[Math.floor(Math.random()*o.length)];B.cur=p;B.last=p;B.st='tell';B.t=first?72:42;B.msg=p.tell;B.hitThis=false;
}
function golemMark(p){
  if(p.core)return {x:BOX.x+BOX.w/2,y:BOX.y+28+(legBroken()?16:0)};
  if(p.id==='leg'&&B.lastStomp)return {x:clamp(B.lastStomp.x,BOX.x+30,BOX.x+BOX.w-30),y:clamp(B.lastStomp.y-18,BOX.y+26,BOX.y+BOX.h-26)};
  return null;
}

/* ---------- 공격 ---------- */
const stompCount=()=>((B&&B.stompRound)||0)>=2?3:2;   // 세 번째 발 찧기부터 세 번 찧는다
defineAttacks({
  golemStomp:{get dur(){return (stompCount()-1)*ST.gap+ST.tell+ST.drop+T().golem_foot_rest+ST.lift+6;},tick(t){if(t)return;
    const n=stompCount(),start=Math.random()<0.5?-1:1;B.stompRound=(B.stompRound||0)+1;
    for(let i=0;i<n;i++)B.bullets.push({k:'golemStomp',t:0,delay:i*ST.gap,foot:i%2?-start:start,x:null,y:null,shake:0});}},
  golemArm:{dur:AR.tell+AR.sweep+4,tick(t){if(t)return;
    const side=Math.random()<0.5?-1:1,cov=Math.random()<0.5?'top':'bottom';B.bullets.push({k:'golemArm',t:0,side,cov,sideHits:0});}},
  golemSnow:{dur:2*SB.gap+SB.tell+SB.fly+12,tick(t){if(t)return;
    for(let i=0;i<3;i++)B.bullets.push({k:'golemSnowball',t:0,delay:i*SB.gap,i,tx:null,ty:null});}},
});
defineBullets({
  golemStomp:{
    step(b){b.t++;if(b.shake>0)b.shake--;const p=stompPhase(b);
      if(b.x==null&&b.t>b.delay){b.x=clamp(B.px,BOX.x+26,BOX.x+BOX.w-26);b.y=clamp(B.py,BOX.y+22,BOX.y+BOX.h-14);}
      if(b.t===p.hit){Sound.playSfx('battle_hit');snowBurst(b.x,b.y,16,true);B.quake=14;B.lastStomp={x:b.x,y:b.y};
        (B.craters||(B.craters=[])).push({x:b.x,y:b.y,t:240,seed:Math.random()*3});if(B.craters.length>4)B.craters.shift();
        if(Math.hypot(B.px-b.x,B.py-b.y)<ST.sole)bHitMe();
        if(!B.footHinted&&B.st!=='end'){B.footHinted=true;setTimeout(()=>{if(B&&B.st==='atk')B.msg='발이 눈에 박혔다! 들리기 전에 발을 치면 구들돌이 떨어질지도.';},500);}}
      if(b.t>p.hit){const r=ST.sole+(b.t-p.hit)*ST.ringSpeed,d=Math.hypot(B.px-b.x,B.py-b.y);
        if(r<ST.ringMax&&Math.abs(d-r)<ST.ringBand)bHitMe();}
      if(b.t>p.end)b.dead=1;},
    draw(c,b){const p=stompPhase(b);if(p.wait||b.x==null)return;
      const R=ST.sole,top=colTopX(b);
      if(p.tell){const k=p.k;
        blob(c,b.x,b.y+4,R*(0.5+0.6*k),R*0.45*(0.5+0.6*k),INK,0.1+0.3*k);
        c.save();c.strokeStyle=RED;c.globalAlpha=0.25+0.2*k;c.lineWidth=1.4;c.setLineDash([5,6]);c.beginPath();c.ellipse(b.x,b.y+4,ST.ringMax,ST.ringMax*0.62,0,0,Math.PI*2);c.stroke();c.restore();
        if(k>0.72&&Math.floor(b.t/4)%2){c.save();c.strokeStyle=RED;c.lineWidth=2;c.globalAlpha=0.85;c.beginPath();c.ellipse(b.x,b.y+4,R+6,(R+6)*0.45,0,0,Math.PI*2);c.stroke();c.restore();}
        return;}
      const sx=b.shake?Math.sin(b.shake*1.9)*3:0;
      let sy=b.y;
      if(p.falling){const k=(b.t-b.delay-ST.tell)/ST.drop;sy=BOX.y-30+(b.y+30-BOX.y)*k;}
      if(p.lifting){const k=clamp((b.t-p.rest)/ST.lift,0,1);sy=b.y-(b.y-BOX.y+40)*k*k;}
      // 충격파: 찧은 자리에서 둥글게 퍼지는 금과 눈가루
      if(!p.falling){const r=R+(b.t-p.hit)*ST.ringSpeed;
        if(r<ST.ringMax){const a=1-r/ST.ringMax;
          c.save();c.strokeStyle=INK;c.globalAlpha=0.75*a;c.lineWidth=3;c.beginPath();c.ellipse(b.x,b.y+4,r,r*0.62,0,0,Math.PI*2);c.stroke();
          c.globalAlpha=0.5*a;c.lineWidth=1;c.beginPath();c.ellipse(b.x,b.y+4,r-6,(r-6)*0.62,0,0,Math.PI*2);c.stroke();c.restore();
          for(let i=0;i<10;i++){const ang=i*0.628+b.delay;blob(c,b.x+Math.cos(ang)*r,b.y+4+Math.sin(ang)*r*0.62,2.6,1.8,SNOW,0.9*a);}}}
      legColumn(c,top,BOX.y-6,b.x+sx,sy-8,30,1);drawSole(c,b.x+sx,sy,1,1);
      const a=b.t-p.hit;
      if(a>0&&a<16){c.save();c.fillStyle=INK;c.globalAlpha=1-a/16;c.font='bold 17px "Gowun Batang", serif';c.textAlign='center';c.fillText('쿵',b.x+40,b.y-18);c.restore();}
      if(p.down){const near=nearFoot(b),lx=clamp(b.x,BOX.x+60,BOX.x+BOX.w-60),ly=b.y+(b.y>BOX.y+BOX.h-40?-34:28);
        c.save();c.font='12px "Gowun Dodum", sans-serif';c.textAlign='center';c.fillStyle=near?RED:INK;c.fillText((TOUCH?'치기':HITKEY)+' · 발 치기',lx,ly);c.restore();}
    }},
  golemArm:{
    step(b){b.t++;const p=armPhase(b);
      if(p.sweep){const [y0,y1]=armBand(b),front=b.side<0?B.px<=p.hand+16:B.px>=p.hand-16;
        if(B.py>=y0-4&&B.py<=y1+4&&front)bHitMe();
        if(Math.random()<0.5)snowBurst(p.hand,clamp(B.py<y0||B.py>y1?armEdgeY(b):(y0+y1)/2,BOX.y,BOX.y+BOX.h),1,true);}
      if(b.t===AR.tell+AR.sweep){b.dead=1;
        const gx=B.px>BOX.x+BOX.w/2?BOX.x+AV.gap/2+12+Math.random()*(BOX.w/2-AV.gap-24):BOX.x+BOX.w/2+AV.gap/2+12+Math.random()*(BOX.w/2-AV.gap-24);
        B.bullets.push({k:'golemAvalanche',t:0,gx});if(B.st!=='end')B.msg='쓸려 간 눈이 위에서 쏟아진다! 틈으로!';}},
    draw(c,b){const p=armPhase(b),[y0,y1]=armBand(b),edge=armEdgeY(b);
      if(p.tell){const k=b.t/AR.tell,flash=k>0.75&&Math.floor(b.t/4)%2;
        c.save();c.fillStyle='rgba(180,67,42,'+(0.05+0.12*k).toFixed(3)+')';c.fillRect(BOX.x,y0,BOX.w,y1-y0);
        c.strokeStyle=RED;c.globalAlpha=flash?0.95:0.5;c.lineWidth=1.6;c.setLineDash([7,5]);c.beginPath();c.moveTo(BOX.x,edge);c.lineTo(BOX.x+BOX.w,edge);c.stroke();c.restore();
        for(let i=0;i<6;i++){const x=BOX.x+i*BOX.w/5;brush(c,[[x,y0+6],[x+18,y1-6]],1,RED,0.25*k);}
        const ex=b.side<0?BOX.x+8:BOX.x+BOX.w-8;quartz(c,ex,(y0+y1)/2-10*k,12,(y1-y0)*0.28,0.5+0.5*k,3);return;}
      if(!p.sweep)return;
      const mid=(y0+y1)/2,th=(y1-y0)*0.78;
      const x0=Math.min(p.from,p.hand),x1=Math.max(p.from,p.hand);
      c.save();c.fillStyle='#bdb7ab';c.fillRect(x0,mid-th/2,x1-x0,th);c.restore();
      for(let x=p.from-b.side*10,n=0;(b.side<0?x<p.hand-20:x>p.hand+20)&&n<30;x-=b.side*26,n++){quartz(c,x,mid-th*0.22,15,th*0.24,1,Math.round(x));quartz(c,x+b.side*12,mid+th*0.2,14,th*0.22,1,Math.round(x)+1);}
      c.save();c.strokeStyle=INK;c.globalAlpha=0.9;c.lineWidth=2.6;c.beginPath();c.moveTo(p.from,mid-th/2);c.lineTo(p.hand,mid-th/2);c.moveTo(p.from,mid+th/2);c.lineTo(p.hand,mid+th/2);c.stroke();c.restore();
      fur(c,(p.from+p.hand)/2,mid-th/2-2,6,Math.abs(p.hand-p.from)*0.6,8,0.9);
      for(let i=0;i<3;i++)quartz(c,p.hand+b.side*8,mid-th*0.34+i*th*0.34,17,th*0.21,1,i+5);   // 주먹 마디
      // 주먹 앞에 밀려 쌓이는 눈
      const k=p.k;blob(c,p.hand-b.side*18,mid+th*0.15,12+18*k,th*0.4,SNOW,0.95);   // 주먹 앞(가는 쪽)에 밀린 눈
      c.save();c.strokeStyle=INK;c.globalAlpha=0.5;c.lineWidth=1.2;c.beginPath();c.ellipse(p.hand-b.side*18,mid+th*0.15,12+18*k,th*0.4,0,Math.PI,Math.PI*2);c.stroke();c.restore();
      const near=besideArm(b);
      if(near||Math.abs(B.py-edge)<40){c.save();c.font='12px "Gowun Dodum", sans-serif';c.textAlign='center';c.fillStyle=near?RED:INK;
        c.fillText((TOUCH?'치기':HITKEY)+' · 팔 옆 치기',clamp(B.px,BOX.x+60,BOX.x+BOX.w-60),b.cov==='top'?edge+30:edge-22);c.restore();}
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
    step(b){b.t++;const a=b.delay;
      if(b.tx==null&&b.t>a){b.tx=clamp(B.px,BOX.x+18,BOX.x+BOX.w-18);b.ty=clamp(B.py,BOX.y+18,BOX.y+BOX.h-12);const h=B.E.headPose();b.sx=h.x;b.sy=h.y+24;}
      const land=a+SB.tell+SB.fly;
      if(b.t===land){Sound.playSfx('battle_hit');snowBurst(b.tx,b.ty,20,false);if(Math.hypot(B.px-b.tx,B.py-b.ty)<SB.radius)bHitMe();}
      if(b.t>land+SB.splat)b.dead=1;},
    draw(c,b){if(b.tx==null)return;const a=b.delay,fl=b.t-a-SB.tell,land=a+SB.tell+SB.fly;
      if(b.t<=land){const k=b.t<=a+SB.tell?(b.t-a)/SB.tell:1,kk=fl>0?fl/SB.fly:0;
        blob(c,b.tx,b.ty+3,SB.radius*(0.4+0.6*kk),SB.radius*0.45*(0.4+0.6*kk),INK,0.1+0.25*kk);
        c.save();c.strokeStyle=RED;c.globalAlpha=0.35+0.4*k;c.lineWidth=1.6;c.setLineDash([4,4]);c.beginPath();c.arc(b.tx,b.ty,SB.radius,0,Math.PI*2);c.stroke();c.restore();
        if(kk>0.75&&Math.floor(b.t/3)%2){c.save();c.strokeStyle=RED;c.lineWidth=2.2;c.beginPath();c.arc(b.tx,b.ty,SB.radius,0,Math.PI*2);c.stroke();c.restore();}
        return;}
      const s=b.t-land,al=1-s/SB.splat;
      blob(c,b.tx,b.ty+2,SB.radius+s*0.4,(SB.radius+s*0.4)*0.55,SNOW,0.85*al);
      for(let i=0;i<7;i++){const ang=i*0.9;blob(c,b.tx+Math.cos(ang)*(SB.radius+4),b.ty+Math.sin(ang)*(SB.radius*0.6),4,3,SNOW,0.9*al);}
      c.save();c.strokeStyle=INK;c.globalAlpha=0.4*al;c.lineWidth=1.2;c.beginPath();c.ellipse(b.tx,b.ty+2,SB.radius+s*0.4,(SB.radius+s*0.4)*0.55,0,0,Math.PI*2);c.stroke();c.restore();
    }},
});
/* 상자 밖까지 날아가는 눈덩이는 잘리지 않게 상자 위에 그린다 (결정 D-168) */
function drawSnowFlights(c){
  for(const b of B.bullets){if(b.k!=='golemSnowball'||b.tx==null)continue;
    const a=b.delay,land=a+SB.tell+SB.fly;if(b.t>=land)continue;
    if(b.t<=a+SB.tell){const k=(b.t-a)/SB.tell;drawSnowball(c,b.sx,b.sy-16*k,6+3*k,b.t*0.1,0.5+0.5*k);continue;}
    const k=(b.t-a-SB.tell)/SB.fly,x=b.sx+(b.tx-b.sx)*k,y=b.sy+(b.ty-b.sy)*k-70*4*k*(1-k);
    drawSnowball(c,x,y,9+5*k,b.t*0.3);
  }
}
function tickGolem(){
  if(B.quake>0)B.quake--;
  for(const cr of B.craters||[])cr.t--;if(B.craters)B.craters=B.craters.filter(cr=>cr.t>0);
}
function drawGolemScene(c){
  // 발이 찧을 때 땅이 울린다(약한 지진)
  if(B.quake>0&&!Vfx.reducedMotion){c.save();c.translate(Math.sin(B.quake*2.7)*B.quake*0.25,Math.cos(B.quake*3.1)*B.quake*0.15);drawGolem(c);c.restore();}
  else drawGolem(c);
}
defineEnemies({
  golem:{name:'돌 골렘',calmLabel:'진정',
    intro:'눈을 뒤집어쓴 성황당 돌무더기가 일어선다! 공격을 피하고, 몸이 비는 틈을 노리자.',   // 결정 D-103: 부위는 고르지 않는다(확정 흐름)
    howto:true,firstPart:'leg',
    goalText:'발 찧기 충격파·팔 휩쓸기·눈사태·눈덩이를 피하자. 박힌 발이나 휩쓰는 팔 옆을 치면 돌이 떨어진다. 몸이 비면 가슴을!',
    calmAction:{amount:TABLES.CALM.golem.story_stone/4},placeGift:'story_stone',
    headPose(){return toScreen(LW/2,bodyY()-46);},
    markPosition:golemMark,
    parts:tableParts('golem',{leg:{atk:'golemStomp',mark:'발',tell:'구들돌 발이 쳐들린다! 그림자 밖으로, 퍼지는 충격파도 피하자.'},
      arm:{atk:'golemArm',mark:'팔',tell:'차돌 팔이 크게 쳐들린다. 비어 있는 띠로 비키자!'},
      head:{atk:'golemSnow',mark:'몸',tell:'골렘이 눈을 뭉친다. 눈덩이는 막을 수 없다. 떨어질 자리에서 비키자!'}}),
    likes:TABLES.CALM.golem,likeText:'돌무더기가 잠시 숨을 고른다.',
    likeTexts:{story_stone:'아빠가 못 올린 소원 돌을 건넸다. 돌 골렘이 가만히 내려다본다.'},
    coreHidden:'가슴이 두꺼운 눈 껍데기에 덮여 있다. 다리나 팔을 먼저 무너뜨리자.',
    coreShown:'눈 껍데기가 깨지고 옥돌 가슴이 드러났다! 이제 몸을 노릴 수 있다.',
    calmWin:'돌 골렘이 스르르 내려앉는다. 눈 덮인 성황당 돌무더기로 돌아왔다.',
    win:'가슴의 눈돌이 빠지자 돌 골렘이 와르르 무너진다.',
    lose:'돌 골렘에게 밀려 눈 비탈을 데굴데굴 굴러 내려왔다.',
    pickAttack:pickGolem,strike:strikeGolem,handTool:golemHandTool,tickHazards:tickGolem,drawFloor:drawSnowFloor,drawOver:drawSnowFlights,
    backdrop:drawStoneCliff,draw:drawGolemScene},
});
})();
