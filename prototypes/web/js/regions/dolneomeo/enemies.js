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
     달래면 골렘이 핵에서 꺼내 내려놓는다. 어느 쪽이든 보따리에 들어온다.
   결정 D-370: 부서진 부위는 흐리게 남지 않는다. 다리를 부수면 구들돌 기둥이 무너져 골렘이 돌무더기 위에 주저앉고 발을 찧지 못한다.
     팔을 부수면 어깨 아래가 떨어져 나가 차돌 조각이 발치에 흩어지고, 휩쓸기도 눈 퍼 던지기도 못 한다.
   결정 D-376: 팔이 없으면 눈폭탄 대신 몸을 흔들어 어깨와 등에 쌓인 눈을 털어 낸다. 눈덩이는 칸 위에서 곧장 떨어지고
     수가 golem_barrage_count_armless 로 적다. 다 버티면 핵이 드러나는 차례는 같다.
   결정 D-450: 차돌 팔은 크기·모양이 다른 투박한 돌멩이들이 긴 세월 뭉쳐 붙은 것이다(사용자 피드백 2026-11-04: 폴리곤 같다).
     돌마다 꼭짓점 수·울퉁불퉁함·빛깔이 다르고 위 왼쪽은 밝고 아래 오른쪽은 그늘진다. 돌 사이 틈은 다져진 눈이 메운다.
     위의 골렘 그림과 칸 안의 팔이 같은 그림(rockArm)이다.
   결정 D-451: 팔은 채찍처럼 크게 휘두른다(사용자 피드백: 너무 직선적). 칸 위 한쪽 모서리 밖 어깨를 축으로 팔이 큰 부채꼴을 쓸며
     내려와 눈밭에 쿵 처박힌다. 천천히 뒤로 감았다가(둔탁한 예고) 빠르게 휘두르고, 끝은 늦게 따라와 휜다.
     넓지만 피할 곳이 있다: 'reach' 는 주먹이 닿지 않는 먼 구석과 다 쓸지 않은 벽 쪽이, 'stop' 은 어깨 밑 벽 쪽 부채꼴이 빈다.
     예고 동안 쓸릴 부채꼴을 붉게 칠하고 빈 곳 경계를 점선으로 긋는다. 처박힌 팔을 치면 팔이 깎인다.
   결정 D-452: 팔이 처박힌 뒤의 여진은 눈 파도·산사태다. 밀려오는 눈 더미의 앞머리가 말려 부서지고, 앞에 눈보라가 튀고,
     속에서 눈덩이와 돌이 구른다. 틈 한 줄은 빈다(판정은 전과 같다).
   결정 D-453: 서리 옥이 열린 뒤(껍데기가 깨진 뒤) 몸 차례는 눈폭탄과 '서리 옥 빛'을 번갈아 쓴다(발악 패턴). 핵에서 알 수 없는
     빛줄기가 칸으로 쏟아져 함께 쓸고, 뒤 절반은 가위처럼 엇갈린다. 빛에 닿으면 맞는다. 한 번도 안 맞고 버티면 빛이 사그라들고
     핵이 칸 한가운데 드러난다(눈폭탄을 버틴 때와 같다). 핵이 반 넘게 깎이면 빛줄기가 셋이 된다. 수치는 tuning.csv golem_light_*.
   결정 D-454: 눈폭탄은 크기와 날아오는 빠르기가 조금씩 다르다(큰 것은 조금 느리다, golem_snowball_*_jitter). 떨어지는 모양에
     '흩뿌리기'(손 자리 하나에 나머지는 칸 여기저기)와 '쌍 던지기'(두 팔로 손 양옆을 함께, 세 번째 쌍은 손 자리로)를 더했다. */
(()=>{
const T=()=>TABLES.TUNING;
const SNOW='#f3f5f4',SNOW_SH='#c9d2d8',SLAB='#5b5048',SLAB_LT='#7d7066',QUARTZ='#d2cdc3',QUARTZ_SH='#a39d92',BODY='#6c6e70';
const GEM='#8fcfcb',GEM_DK='#2c6670',GEM_LT='#e4fbf6',SETTING='#8b8478',SETTING_DK='#5c564c',HEAD='#5d5f63',HEAD_LT='#7c7e82',MOSS='#5f7a48';
const ROPE='#b39556',ROPE_DK='#7a6232',PAPER='#f8f4e6',PINE='#3f6a3c';
const CLOTH=['#b8432f','#2f5f9e','#d9a83a','#f2efe6','#3f7d52'];   // 오색 천: 빨강·파랑·노랑·흰색·초록
const ST={tell:46,drop:9,gap:62,sole:26,wave:34,ringMax:96,ringBand:8,stay:18,crumble:16,lift:40,clumpFly:30,clumpHit:13};   // 발 찧기
const AR={back:16};                                                                                 // 처박힌 팔이 거둬지는 시간
const WH={lag:0.34,w:30,windup:0.3};                                                                // 결정 D-451: 채찍 휘두르기
const AV={tell:26,speed:2.6,band:13,gap:66,sideSpeed:3.4,sideGap:56};                            // 쓸려 간 눈
const SB={gap:17,wind:14,follow:10,fly:36,radius:30,hit:27,splat:34,spread:56};                   // 눈폭탄
const toScreen=(x,y)=>({x:LW/2+(x-LW/2)*0.84,y:EY+(y-EY)*0.84});
const lerp2=(p,q,k)=>[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k];
const legBroken=()=>part('leg').broken;
const still=()=>Vfx.reducedMotion;
/* 결정 D-747: 다리를 잃은 골렘 (사용자 피드백 2026-11-05 돌너머 6: 다리가 깨지면 공중에 떠 있는 것 같다).
   구들돌 기둥이 무너지면 몸통이 그대로 내려앉아 눈밭에 쿵 엎어진다(LEG_FALL 프레임, 살짝 튀었다가 가라앉는다). 그 뒤로 몸은 땅에 붙어 있고,
   두 팔이 번갈아 앞으로 뻗어 눈밭을 짚고 몸을 끈다(기는 모습). 팔 공격·눈 던지기는 그대로 쓰고 발 찧기만 못 한다(D-370). */
const LEG_FALL=34,LEG_DROP=40;
function legFall(){return legBroken()?clamp((B.gFall||0)/LEG_FALL,0,1):0;}
function legDrop(){if(!legBroken())return 0;const k=legFall();
  return LEG_DROP*(k<0.8?Math.pow(k/0.8,2)*1.08:1.08-0.08*(k-0.8)/0.2);}   // 떨어지다 눈에 박히며 살짝 더 꺼졌다가 자리 잡는다
function crawlPhase(){return still()?0:B.time*0.045;}
function bodyY(){const fallen=legBroken()&&legFall()>=1;
  const bob=fallen?-Math.abs(Math.sin(crawlPhase()))*2.5:Math.sin(B.time*0.04)*2;   // 엎어진 뒤에는 숨 대신 몸을 끌 때마다 들썩인다
  return EY+2+legDrop()+bob+(B.quake>9?3:0);}   // 발을 찧으면 몸이 살짝 내려앉는다

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
/* 결정 D-450: 투박한 돌멩이 하나. 꼭짓점 수·울퉁불퉁함·빛깔이 seed 마다 다르다 */
const ROCK_COL=['#b7b0a3','#a39b8e','#c4beb2','#968d80','#ada595','#8b8377','#bdb6aa','#9d9487'];
function rockStone(c,x,y,rx,ry,rot,seed,alpha=1,snowTop=0){
  const n=6+Math.floor(hash(seed*1.37)*4),pts=[];
  for(let i=0;i<n;i++){const a=rot+i*Math.PI*2/n+(hash(seed+i*1.7)-0.5)*0.55,k=0.76+hash(seed*2.3+i)*0.34;pts.push([Math.cos(a)*rx*k,Math.sin(a)*ry*k]);}
  const path=(dx,dy,sc)=>{c.beginPath();const P=i=>{const p=pts[(i+n)%n];return [x+p[0]*sc+dx,y+p[1]*sc+dy];};
    const m=P(0),q=P(1);c.moveTo((m[0]+q[0])/2,(m[1]+q[1])/2);
    for(let i=1;i<=n;i++){const a=P(i),z=P(i+1);c.quadraticCurveTo(a[0],a[1],(a[0]+z[0])/2,(a[1]+z[1])/2);}c.closePath();};
  c.save();c.globalAlpha=alpha;
  path(1.3,1.9,1);c.fillStyle='#5a5249';c.fill();   // 아래 오른쪽 그늘
  path(0,0,1);c.fillStyle=ROCK_COL[Math.floor(hash(seed*5.1)*ROCK_COL.length)];c.fill();
  c.globalAlpha=alpha*0.5;path(-rx*0.2,-ry*0.24,0.56);c.fillStyle='#ece8de';c.fill();   // 위 왼쪽 밝은 면
  c.globalAlpha=alpha*0.78;path(0,0,1);c.strokeStyle=INK;c.lineWidth=1.05;c.stroke();
  if(hash(seed*7.7)<0.4){const a=rot+hash(seed*3)*3;c.globalAlpha=alpha*0.55;c.strokeStyle='#4f483f';c.lineWidth=0.9;c.beginPath();
    c.moveTo(x+Math.cos(a)*rx*0.55,y+Math.sin(a)*ry*0.55);c.lineTo(x+Math.cos(a+2.5)*rx*0.12,y+Math.sin(a+2.5)*ry*0.12);c.stroke();}   // 풍화한 금
  c.restore();
  if(snowTop>0)blob(c,x-rx*0.08,y-ry*0.7,rx*0.6*snowTop,ry*0.26*snowTop+1,SNOW,0.95*alpha);   // 돌 위에 얹힌 눈
}
/* 어깨에서 주먹까지 꺾은선(pts)을 따라 돌을 빽빽이 붙인다. 밑에 다진 눈을 먼저 깔아 돌 사이 틈이 눈으로 메워진다.
   w 는 팔 굵기, fist 는 주먹 크기(0 이면 주먹 없이 끊긴 팔) */
function rockArm(c,pts,w,alpha=1,seed=0,fist=1.3){
  const seg=[];let L=0;for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(d);L+=d;}
  if(L<1)return;
  const at=u=>{let d=u*L;for(let i=0;i<seg.length;i++){if(d<=seg[i]||i===seg.length-1){const k=seg[i]?Math.min(1,d/seg[i]):0,a=pts[i],b=pts[i+1];
    return {x:a[0]+(b[0]-a[0])*k,y:a[1]+(b[1]-a[1])*k,ang:Math.atan2(b[1]-a[1],b[0]-a[0])};}d-=seg[i];}};
  c.save();c.globalAlpha=alpha;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));
  c.strokeStyle=INK;c.globalAlpha=alpha*0.5;c.lineWidth=w*0.96;c.stroke();
  c.globalAlpha=alpha;c.strokeStyle=SNOW_SH;c.lineWidth=w*0.9;c.stroke();c.strokeStyle=SNOW;c.lineWidth=w*0.72;c.stroke();c.restore();
  const n=Math.max(3,Math.round(L/(w*0.34))),end=fist>0?0.9:1;
  for(let i=0;i<n;i++){const p=at((i+0.5)/n*end),nx=-Math.sin(p.ang),ny=Math.cos(p.ang);
    for(let j=0;j<2;j++){const sd=seed*31+i*7+j*3+1,off=(j?0.21:-0.2)*w+(hash(sd)-0.5)*w*0.16,r=w*(0.25+hash(sd*1.3)*0.17);
      rockStone(c,p.x+nx*off,p.y+ny*off,r*(1.05+hash(sd*2)*0.32),r*(0.78+hash(sd*2.9)*0.26),p.ang+hash(sd*4)*1.4,sd,alpha,hash(sd*6)<0.28&&j===0?0.85:0);}}
  if(fist<=0)return;
  const h=pts[pts.length-1],p=at(1),R=w*0.5*fist;
  for(let j=0;j<5;j++){const sd=seed*53+j*11+2,a=p.ang+(j-2)*0.95,d=j===2?R*0.15:R*0.6;
    rockStone(c,h[0]+Math.cos(a)*d,h[1]+Math.sin(a)*d,R*(0.52+hash(sd)*0.22),R*(0.46+hash(sd*1.4)*0.2),hash(sd*2)*3,sd,alpha,j===1?0.9:0);}
}
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
/* 결정 D-451: 채찍 휘두르기. 어깨(축)는 칸 위 한쪽 모서리 밖. 그 쪽을 왼쪽에 둔 자리에서 각도는 오른쪽(0)에서 아래(π/2)로 커진다.
   reach: 팔이 짧아 먼 구석이 빈다(벽 쪽도 다 쓸지 않는다) · stop: 팔이 칸 끝까지 닿지만 벽 쪽 부채꼴 앞에서 멈춘다 */
function whipPivot(side){return {x:side<0?BOX.x-34:BOX.x+BOX.w+34,y:BOX.y-56};}
function whipSpec(v){return v==='reach'?{reach:262,a0:-0.3,a1:1.15}:{reach:470,a0:-0.3,a1:0.86};}
const whipTell=()=>T().golem_whip_tell,whipSweep=()=>T().golem_whip_sweep;
function whipAngle(b,t,u){   // t 프레임, u 는 어깨(0)에서 주먹(1)까지
  const sp=whipSpec(b.v),tl=whipTell();
  if(t<=tl){const w=clamp(t/tl,0,1);return sp.a0-WH.windup*Math.sin(w*Math.PI/2)-0.12*u*w;}   // 천천히 뒤로 감아올린다
  const k=clamp((t-tl)/whipSweep(),0,1),e=k*k*(3-2*k),vel=6*k*(1-k)/1.5;
  return sp.a0-WH.windup+(sp.a1-sp.a0+WH.windup)*e-WH.lag*vel*Math.pow(u,1.5);   // 끝이 늦게 따라와 휜다
}
function whipPoint(b,ang,r){const p=whipPivot(b.side),dx=Math.cos(ang)*r,dy=Math.sin(ang)*r;return [b.side<0?p.x+dx:p.x-dx,p.y+dy];}
function whipLocal(side,x,y){const p=whipPivot(side),dx=side<0?x-p.x:p.x-x,dy=y-p.y;return {r:Math.hypot(dx,dy),a:Math.atan2(dy,dx)};}
function whipArmPts(b,t,reachK=1,n=9){const sp=whipSpec(b.v),out=[];for(let i=0;i<=n;i++){const u=i/n;out.push(whipPoint(b,whipAngle(b,t,u),u*sp.reach*reachK));}return out;}
function whipMarkPos(ra){const sp=whipSpec(ra.v),[x,y]=whipPoint(ra,sp.a1,sp.reach*(ra.v==='reach'?0.62:0.5));
  return [clamp(x,BOX.x+26,BOX.x+BOX.w-26),clamp(y,BOX.y+22,BOX.y+BOX.h-18)];}
const throwOf=s=>B.bullets.find(b=>b.k==='golemSnowball'&&b.side===s&&b.t>b.delay&&b.t<=b.delay+SB.wind+SB.follow);

/* ---------- 골렘 그림 (상대 자리, 0.84배로 그려진다) ---------- */
function endScene(){const e=B.gEnd;if(!e||B.st!=='end')return null;return {kind:e.kind,k:clamp(1-B.t/e.max,0,1)};}
function drawGolem(c,noFruit){
  const cx=LW/2,cy=EY,leg=part('leg'),arm=part('arm'),core=part('head'),end=endScene();
  const by=bodyY(),rest=!!(B.mark&&B.mark.rest),GY=cy+124,hurt=B.gHurt&&B.gHurt.t>0?B.gHurt:null;
  const flashOf=id=>hurt&&hurt.id===id?hurt.t/16:0;
  const shrug=arm.broken&&B.cur&&B.cur.id==='head'&&B.st==='atk'&&!end&&!Vfx.reducedMotion;   // 결정 D-376: 몸을 흔들어 눈을 턴다
  const crawl=leg.broken&&legFall()>=1&&!arm.broken&&!end;   // 결정 D-747: 엎어진 뒤 팔로 몸을 끈다
  c.save();if(shrug)c.translate(Math.sin(B.time*0.9)*3.5,Math.abs(Math.sin(B.time*0.45))*-2);
  else if(crawl)c.translate(Math.sin(crawlPhase())*3,0);
  blob(c,cx,cy+130,150,12,INK,0.1);
  // 다리: 구들돌 기둥과 넓적한 돌 발. 찧을 발은 예고 동안 높이 들리고, 떨어지며 제자리를 꾹 찧는다. 칸으로 뻗지 않는다.
  if(leg.broken){   // 결정 D-370·D-747: 무너진 구들돌 다리. 몸통이 눈밭까지 내려앉고 부러진 기둥 토막과 넓적한 돌이 양옆으로 흩어졌다
    const k=legFall();
    [-1,1].forEach(s=>{const hipX=cx+s*44,hipY=by+50;
      if(k<1){const tilt=k*k;legColumn(c,hipX,hipY,hipX+s*(6+tilt*40),Math.min(GY-4,hipY+22+(1-k)*30),30,1);}   // 무너지는 동안 기둥이 옆으로 꺾인다
      else legColumn(c,hipX+s*58,GY-8,hipX+s*86,GY-2,22,1);   // 바깥으로 쓰러진 기둥 토막
      poly(c,[[hipX-14+s*4,hipY+20],[hipX-6,hipY+28],[hipX+4,hipY+19],[hipX+14+s*4,hipY+27]],'#efe3c8',0.9);   // 부러진 단면
      slab(c,hipX+s*30,GY-2,26,9,1,false);slab(c,hipX-s*6,GY+6,20,8,1,s>0);slab(c,hipX+s*58,GY+8,14,6,1,false);
      for(let i=0;i<4;i++)blob(c,hipX+s*(14+i*11),GY+12+hash(i+s)*3,3,2,SLAB_LT,0.8);});}
  else{const a=1,o=shk(leg),flash=partCol(leg)===RED,dmg=leg.max-leg.hp,hf=flashOf('leg');
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
    const lit=B.bullets.some(q=>q.k==='golemLight'),open=!coreHidden()||(end&&end.kind==='calm'&&end.k>0.15),glow=lit?1:rest?0.6+0.4*Math.sin(B.time*0.25):0.35+0.15*Math.sin(B.time*0.05),gy=by+18;
    if(end)drawEndCore(c,x,gy,end,a);
    else if(open||rest){if(lit)blob(c,x,gy,40+6*Math.sin(B.time*0.3),34+5*Math.sin(B.time*0.3),GEM_LT,0.45);   // 결정 D-453: 빛을 쏟는 핵
      drawGem(c,x,gy,19+(rest?2:0)+(lit?3:0),glow,a);
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
  if(arm.broken){   // 결정 D-370: 팔은 어깨 아래가 떨어져 나갔다. 깨진 단면과 발치에 흩어진 차돌
    [-1,1].forEach(s=>{const shX=cx+s*72,shY=by-20;
      rockArm(c,[[shX,shY],[cx+s*86,by+2]],27,1,s>0?2:1,0);   // 결정 D-450: 돌멩이가 뭉친 팔이 어깨 아래에서 끊겼다
      poly(c,[[cx+s*76,by+8],[cx+s*86,by+14],[cx+s*98,by+6],[cx+s*92,by-2]],'#efe3c8',0.95,INK,1.2);   // 깨진 단면
      fur(c,shX+s*6,shY-6,3,26,24,1);
      rockStone(c,cx+s*112,GY+2,13,10,0.4,s*17+5,1,0.6);rockStone(c,cx+s*138,GY+9,10,8,1.2,s*17+7,1,0);rockStone(c,cx+s*96,GY+12,8,6,2,s*17+9,1,0.5);rockStone(c,cx+s*124,GY+14,7,5,0.8,s*17+11,1,0);
      for(let i=0;i<3;i++)blob(c,cx+s*(104+i*14),GY+16+hash(i*1.3+s)*3,2.4,1.8,QUARTZ_SH,0.8);});}
  else{const a=1,o=shk(arm),drop=0,ab=armBullet(),ra=B.restArm,dmg=arm.max-arm.hp,hf=flashOf('arm');
    // 결정 D-747: 엎어진 뒤의 팔은 땅을 짚는다. 한 팔이 들려 앞으로 뻗는 동안 다른 팔은 눈밭을 짚고 몸을 끈다
    const lift=s=>crawl?Math.max(0,Math.sin(crawlPhase()+(s>0?Math.PI:0))):0;
    const idleEl=s=>crawl?[cx+s*(100+lift(s)*6),by+10-lift(s)*14]:[cx+s*98,by+34+drop*0.6],
      idleHd=s=>crawl?[cx+s*(116+lift(s)*16),GY-4-lift(s)*24]:[cx+s*106,by+96+drop];
    [-1,1].forEach(s=>{const shX=cx+s*72+o,shY=by-20;let el=idleEl(s),hd=idleHd(s),ball=null;
      // 결정 D-451: 휘두를 팔은 뒤로 높이 감아올렸다가 몸 앞을 가로질러 눈밭에 내리꽂는다
      const upEl=[cx+s*112,by-58],upHd=[cx+s*136,by-122],endEl=[cx+s*66,by+58],endHd=[cx-s*14,by+128];
      const slam=k=>[lerp2(upEl,endEl,k),lerp2(upHd,endHd,k)];
      if(ab&&ab.side===s){const tl=whipTell();
        if(ab.t<=tl){const e=1-Math.pow(1-clamp(ab.t/tl,0,1),2);el=lerp2(idleEl(s),upEl,e);hd=lerp2(idleHd(s),upHd,e);}
        else{const k=clamp((ab.t-tl)/whipSweep(),0,1);[el,hd]=slam(k*k*(3-2*k));}}
      else if(ra&&ra.side===s){const u=clamp((ra.back||0)/AR.back,0,1),[e1,h1]=slam(1);el=lerp2(e1,idleEl(s),u);hd=lerp2(h1,idleHd(s),u);}
      else{const th=throwOf(s);
        if(th){const d=th.t-th.delay,up=[[cx+s*96,by-48],[cx+s*80,by-96]],fw=[[cx+s*70,by+12],[cx+s*34,by+66]];
          if(d<=SB.wind){const e=1-Math.pow(1-d/SB.wind,2);el=lerp2(idleEl(s),up[0],e);hd=lerp2(idleHd(s),up[1],e);ball=th;}
          else{const e=(d-SB.wind)/SB.follow;el=lerp2(up[0],fw[0],e);hd=lerp2(up[1],fw[1],e);}}}
      if(crawl&&!(ab&&ab.side===s)&&!(ra&&ra.side===s)&&!throwOf(s)&&lift(s)<0.15){   // 짚은 손 앞에 밀린 눈 둔덕과 끌린 자국
        blob(c,hd[0]+s*14,GY+2,14,4,SNOW,0.95);brush(c,[[hd[0]-s*8,GY+6],[hd[0]-s*30,GY+8]],2,SNOW_SH,0.8);}
      rockArm(c,[[shX,shY],el,hd],27,a,s>0?2:1,1.35);   // 결정 D-450: 돌멩이가 뭉친 팔
      if(dmg>0)cracks(c,el[0],el[1],26,22,dmg*2,s*5+21,a);
      fur(c,shX+s*6,shY-6,3,26,24,a);
      if(hf&&ra&&ra.side===s)blob(c,(el[0]+hd[0])/2,(el[1]+hd[1])/2,24,30,'#ffffff',0.55*hf);
      if(ball)drawSnowball(c,hd[0],hd[1]-18,16,ball.t*0.05);   // 쥐고 든 눈덩이
      if(partCol(arm)===RED)brush(c,[[shX,shY],el,hd],3,RED,0.7);});}
  for(const ch of B.gChips||[])blob(c,ch.x,ch.y,ch.r,ch.r*0.8,ch.col,Math.min(1,ch.t/14));   // 친 부위에서 떨어지는 돌 부스러기
  c.restore();
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
/* 결정 D-451: 눈밭에 처박힌 팔. 거둘 때는 어깨 쪽으로 끌려 들어간다 */
function drawRestArm(c,ra){
  const u=clamp((ra.back||0)/AR.back,0,1),sp=whipSpec(ra.v),tEnd=whipTell()+whipSweep();
  const pts=whipArmPts(ra,tEnd,1-u*0.9);
  rockArm(c,pts,WH.w,1,ra.side>0?2:1,1.4);
  if(!u)for(let i=0;i<4;i++){const [x,y]=whipPoint(ra,sp.a1,sp.reach*(0.35+i*0.17));blob(c,x+(i%2?8:-8),y+10,12,4,SNOW,0.8);}   // 처박힌 팔 둘레로 밀린 눈
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
  drawLightVeil(c);   // 결정 D-642: 빛 공격 예고 동안 배경이 밝아진다
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
  r.miss++;B.msg=hitText+(toolFit(part(id))==='bad'?' 효과가 적은 것 같다.':' 돌가루만 튄다.')   // 결정 D-373;return false;
}
const HIT_TEXT={leg:'박힌 발바닥을 쳤다!',arm:'멈춘 차돌 팔을 쳤다!',head:'서리 옥 핵을 쳤다!'};
const CLOSE_TEXT={leg:'발바닥이 부서져 눈 속에 묻혔다.',arm:'골렘이 팔을 거둬들였다.',head:'골렘이 가슴을 다시 여몄다.'};
/* 공격 뒤 표식 (결정 D-183·D-184): 남은 발바닥, 칸 끝에 멈춘 팔, 칸 한가운데의 핵에만 뜬다. 엔진의 openMark 대신 부른다 */
function golemOpenMark(p){
  const t=T();
  if(p.id==='leg'){const s=B.restSole;B.mark=null;if(!s)return true;s.marked=true;
    B.mark={x:s.x,y:s.y,t:t.golem_foot_rest,max:t.golem_foot_rest,part:p,golem:true};B.msg='구들돌 발바닥이 눈에 박혀 있다.';return true;}
  if(p.id==='arm'){const a=B.restArm;B.mark=null;if(!a)return true;a.marked=true;
    const [x,y]=whipMarkPos(a);
    B.mark={x,y,t:t.golem_arm_rest,max:t.golem_arm_rest,part:p,golem:true};B.msg='휘두른 차돌 팔이 눈밭에 처박혀 멈췄다.';return true;}
  // 몸: 눈폭탄을 하나도 안 맞고 버텼을 때만 핵이 드러난다
  if(B.hitThis){B.mark=null;B.msg=B.lightTurn?'빛에 휩쓸린 사이 골렘이 가슴을 여몄다.':'눈을 털어 내는 사이 골렘이 숨을 고르고 가슴을 여몄다.';return true;}
  B.mark={x:BOX.x+BOX.w/2,y:BOX.y+BOX.h/2,t:t.golem_core_frames,max:t.golem_core_frames,part:p,golem:true,rest:true};
  B.msg=B.lightTurn?'빛이 사그라들었다. 서리 옥이 잠깐 흐려졌다!':coreHidden()?'골렘이 숨을 몰아쉰다. 눈 껍데기 덮인 핵이 들썩인다!':'골렘이 숨을 몰아쉰다. 서리 옥 핵이 드러났다!';return true;
}
function strikeGolem(){
  const m=B.mark;if(!m||!m.golem)return false;
  const aim=bAim();if(!bAimOn(m,aim))return false;   // 결정 D-240·D-501: 판정은 도구 날 범위와 칠 자리가 겹치는지
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
  if(id==='arm'){B.armVar=B.armVar?(B.armVar==='reach'?'stop':'reach'):(Math.random()<0.5?'reach':'stop');B.msg=p.tell;}   // 결정 D-451: 두 휘두르기를 번갈아
  if(id==='leg'){const o=['aim','march','pincer'].filter(k=>k!==B.stompPat);B.stompPat=B.stompRound?o[Math.floor(Math.random()*o.length)]:'aim';}
  if(id==='head'){
    // 결정 D-453: 서리 옥이 열린 뒤에는 몸 차례마다 눈폭탄과 서리 옥 빛을 번갈아 쓴다(처음 열린 차례가 빛)
    B.lightTurn=!coreHidden()&&((B.gLightN=(B.gLightN||0)+1)%2===1);
    if(B.lightTurn)B.msg='서리 옥이 웅웅 울린다. 알 수 없는 빛이 새어 나온다.';
    else{const o=['aim','rowSweep','colSweep','scatter','pair'].filter(k=>k!==B.snowPat);B.snowPat=o[Math.floor(Math.random()*o.length)];   // 결정 D-454
      if(part('arm').broken)B.msg='골렘이 몸을 흔들어 어깨에 쌓인 눈을 털어 낸다.';}}   // 결정 D-376
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
const ARM_DUR=v=>whipTell()+whipSweep()+AV.tell+(v==='reach'?Math.ceil((BOX.w+40)/AV.sideSpeed):Math.ceil((BOX.h+28)/AV.speed))+6;
const LIGHT_FADE=24,LIGHT_DUR=()=>T().golem_light_tell+T().golem_light_frames+LIGHT_FADE+2;
/* 결정 D-376: 팔이 부서지면 눈을 퍼 던지지 못하고 몸을 털어 떨군다. 수가 적다 */
const snowCount=()=>part('arm').broken?T().golem_barrage_count_armless:T().golem_barrage_count;
defineAttacks({
  golemStomp:{get dur(){return SNOW_STOMP_DUR(stompCount());},tick(t){if(t)return;
    const n=stompCount(),start=Math.random()<0.5?-1:1,pat=B.stompPat||'aim',dir=B.px>BOX.x+BOX.w/2?-1:1;B.stompRound=(B.stompRound||0)+1;B.restSole=null;
    for(let i=0;i<n;i++)B.bullets.push({k:'golemStomp',t:0,delay:i*ST.gap,foot:i%2?-start:start,x:null,y:null,last:i===n-1,pat,i,n,dir});}},
  golemArm:{get dur(){return ARM_DUR(B.armVar||'reach');},tick(t){if(t)return;B.restArm=null;
    B.bullets.push({k:'golemArm',t:0,side:Math.random()<0.5?-1:1,v:B.armVar||'reach'});}},
  golemSnow:{get dur(){return B.lightTurn?LIGHT_DUR():(snowCount()-1)*SB.gap+7+SB.wind+Math.ceil(SB.fly*1.45)+SB.splat+4;},tick(t){if(t)return;
    if(B.lightTurn){const core=part('head');B.bullets.push({k:'golemLight',t:0,n:core.hp<=core.max/2?T().golem_light_beams_low:T().golem_light_beams});return;}   // 결정 D-453
    const n=snowCount(),s0=Math.random()<0.5?-1:1,pat=B.snowPat||'aim',drop=part('arm').broken,tt=T();
    for(let i=0;i<n;i++){
      // 결정 D-454: 크기와 날아오는 빠르기가 조금씩 다르다. 큰 것은 조금 느리다
      const sz=0.8+Math.random()*tt.golem_snowball_size_jitter,fly=Math.round(SB.fly*(0.82+Math.random()*tt.golem_snowball_fly_jitter)*(0.92+0.3*(sz-0.8)));
      const delay=pat==='pair'&&!drop?Math.floor(i/2)*Math.round(SB.gap*1.7)+(i%2)*3:i*SB.gap+Math.floor(Math.random()*7);
      B.bullets.push({k:'golemSnowball',t:0,delay,i,n,pat,dir:s0,side:pat==='pair'&&!drop?(i%2?-1:1):(i%2?-s0:s0),tx:null,ty:null,drop,sz,fly});}}},
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
  if(b.pat==='scatter'){if(b.i%4===0)return [B.px,B.py];return [BOX.x+30+Math.random()*(BOX.w-60),BOX.y+24+Math.random()*(BOX.h-44)];}   // 결정 D-454
  if(b.pat==='pair'){const k=Math.floor(b.i/2),side=b.i%2?1:-1,o=k%3===2?12:44;return [B.px+side*o,B.py+(Math.random()-0.5)*20];}
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
    step(b){b.t++;const tl=whipTell(),sw=whipSweep(),sp=whipSpec(b.v);
      if(b.t>tl&&b.t<=tl+sw){const {r,a}=whipLocal(b.side,B.px,B.py);   // 팔이 이번 프레임에 쓸고 지나간 부채꼴 안이면 맞는다
        if(r<=sp.reach+WH.w*0.5){const u=clamp(r/sp.reach,0,1),a0=whipAngle(b,b.t-1,u),a1=whipAngle(b,b.t,u),tol=WH.w*0.5/Math.max(r,20);
          if(a>=Math.min(a0,a1)-tol&&a<=Math.max(a0,a1)+tol)bHitMe();}
        if(Math.random()<0.6){const [x,y]=whipPoint(b,whipAngle(b,b.t,1),sp.reach*(0.5+Math.random()*0.5));
          if(x>BOX.x&&x<BOX.x+BOX.w&&y>BOX.y&&y<BOX.y+BOX.h)snowBurst(x,y,1,true);}}
      if(b.t===tl+sw){b.dead=1;B.restArm={side:b.side,v:b.v,back:0};B.quake=Math.max(B.quake||0,12);Sound.playSfx('battle_hit');
        for(let i=0;i<6;i++){const [x,y]=whipPoint(b,sp.a1,sp.reach*(0.3+i*0.12));if(x>BOX.x&&x<BOX.x+BOX.w&&y>BOX.y&&y<BOX.y+BOX.h)snowBurst(x,y,4,true);}
        // 결정 D-452: 처박힌 팔이 흔든 눈이 파도처럼 밀려온다. 먼 구석이 빈 휘두르기는 옆에서, 벽 쪽이 빈 휘두르기는 위에서. 한 줄만 빈다
        if(b.v==='reach'){
          const gy=B.py>BOX.y+BOX.h/2?BOX.y+AV.sideGap/2+10+Math.random()*(BOX.h/2-AV.sideGap-14):BOX.y+BOX.h/2+AV.sideGap/2+4+Math.random()*(BOX.h/2-AV.sideGap-14);
          B.bullets.push({k:'golemAvalanche',t:0,dir:'side',s:b.side,gy});if(B.st!=='end')B.msg='처박힌 팔에 눈 더미가 무너져 옆에서 밀려온다!';}
        else{const gx=B.px>BOX.x+BOX.w/2?BOX.x+AV.gap/2+12+Math.random()*(BOX.w/2-AV.gap-24):BOX.x+BOX.w/2+AV.gap/2+12+Math.random()*(BOX.w/2-AV.gap-24);
          B.bullets.push({k:'golemAvalanche',t:0,dir:'down',gx});if(B.st!=='end')B.msg='흔들린 비탈에서 눈사태가 쏟아진다!';}}},
    draw(c,b){const tl=whipTell(),sp=whipSpec(b.v),P=whipPivot(b.side);
      if(b.t<=tl){const k=b.t/tl,flash=k>0.75&&Math.floor(b.t/4)%2,A0=sp.a0-WH.windup-0.04,A1=sp.a1+0.06,R=sp.reach+WH.w*0.5;
        // 쓸릴 부채꼴은 붉게, 빈 곳 경계는 점선
        c.save();c.beginPath();c.moveTo(P.x,P.y);for(let i=0;i<=28;i++){const [x,y]=whipPoint(b,A0+(A1-A0)*i/28,R);c.lineTo(x,y);}c.closePath();
        c.fillStyle='rgba(180,67,42,'+(0.06+0.14*k).toFixed(3)+')';c.fill();
        c.strokeStyle=RED;c.globalAlpha=flash?0.95:0.55;c.lineWidth=1.8;c.setLineDash([7,5]);c.beginPath();
        if(b.v==='reach')for(let i=0;i<=28;i++){const [x,y]=whipPoint(b,A0+(A1-A0)*i/28,R);i?c.lineTo(x,y):c.moveTo(x,y);}
        const [x0,y0]=whipPoint(b,A1,0),[x1,y1]=whipPoint(b,A1,R);c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();c.restore();
        rockArm(c,whipArmPts(b,b.t),WH.w,0.5+0.35*k,b.side>0?2:1,1.4);return;}   // 뒤로 감아올린 팔
      // 휘두르는 중: 쓸고 간 자리에 눈 자국, 끝을 따라 바람 줄
      const a0=whipAngle(b,tl,1),a1=whipAngle(b,b.t,1);
      c.save();c.globalAlpha=0.3;c.fillStyle=SNOW;c.beginPath();c.moveTo(P.x,P.y);for(let i=0;i<=16;i++){const [x,y]=whipPoint(b,a0+(a1-a0)*i/16,sp.reach);c.lineTo(x,y);}c.closePath();c.fill();c.restore();
      for(let j=1;j<=3;j++){const t2=b.t-j*2;if(t2<=tl)break;brush(c,whipArmPts(b,t2,1,9).slice(4),2.2,INK,0.22/j);}
      rockArm(c,whipArmPts(b,b.t),WH.w,1,b.side>0?2:1,1.4);
    }},
  golemAvalanche:{
    step(b){b.t++;if(b.t<=AV.tell)return;
      if(b.dir==='side'){const x=b.s<0?BOX.x-8+(b.t-AV.tell)*AV.sideSpeed:BOX.x+BOX.w+8-(b.t-AV.tell)*AV.sideSpeed;
        if(Math.abs(B.px-x)<AV.band&&Math.abs(B.py-b.gy)>AV.sideGap/2)bHitMe();
        if(x<BOX.x-20||x>BOX.x+BOX.w+20)b.dead=1;return;}
      const y=BOX.y-8+(b.t-AV.tell)*AV.speed;
      if(Math.abs(B.py-y)<AV.band&&Math.abs(B.px-b.gx)>AV.gap/2)bHitMe();
      if(y>BOX.y+BOX.h+20)b.dead=1;},
    draw(c,b){const stil=still(),side=b.dir==='side',len=side?BOX.h:BOX.w,t=b.t;
      const fwd=side?(b.s<0?1:-1):1,origin=side?(b.s<0?BOX.x:BOX.x+BOX.w):BOX.y;
      const gc=side?b.gy-BOX.y:b.gx-BOX.x,gh=(side?AV.sideGap:AV.gap)/2,inGap=a=>Math.abs(a-gc)<gh;
      const F=t<=AV.tell?origin:side?(b.s<0?BOX.x-8+(t-AV.tell)*AV.sideSpeed:BOX.x+BOX.w+8-(t-AV.tell)*AV.sideSpeed):BOX.y-8+(t-AV.tell)*AV.speed;
      const P=(a,d)=>side?[F-fwd*d,BOX.y+a]:[BOX.x+a,F-d];   // 줄 위 a, 앞머리에서 뒤로 d
      const Bl=(a,d,ra,rd,col,al)=>{const [x,y]=P(a,d);side?blob(c,x,y,rd,ra,col,al):blob(c,x,y,ra,rd,col,al);};
      if(t<=AV.tell){const k=t/AV.tell;   // 우르릉: 칸 가장자리로 눈과 잔돌이 흘러내리기 시작한다
        for(let a=6;a<len;a+=14){if(inGap(a))continue;const j=hash(a*0.31);Bl(a,-(3+6*k+j*4),7+3*k,5+5*k,SNOW,0.92);if(j<0.25){const [x,y]=P(a,-(6+10*k));rockStone(c,x,y,3,2.5,j*9,Math.round(a),0.9);}}
        if(!stil)for(let i=0;i<6;i++){const a=hash(i*3.7+Math.floor(t/3))*len;if(!inGap(a))Bl(a,-(12+((t*2+i*9)%18)),2,2,SNOW_SH,0.8);}
        c.save();c.strokeStyle=RED;c.globalAlpha=0.55;c.setLineDash([4,5]);c.lineWidth=1.4;c.beginPath();
        for(const e of [gc-gh,gc+gh]){const [x0,y0]=side?[BOX.x,BOX.y+e]:[BOX.x+e,BOX.y],[x1,y1]=side?[BOX.x+BOX.w,BOX.y+e]:[BOX.x+e,BOX.y+BOX.h];c.moveTo(x0,y0);c.lineTo(x1,y1);}
        c.stroke();c.restore();return;}
      const depth=Math.abs(F-origin)+8;
      // 지나간 자리: 밀려간 눈이 얇게 깔린다
      c.save();c.fillStyle='rgba(243,245,244,.42)';
      for(const [a0,a1] of [[0,gc-gh],[gc+gh,len]])if(a1>a0){const [x0,y0]=P(a0,0),[x1,y1]=P(a1,depth);c.fillRect(Math.min(x0,x1),Math.min(y0,y1),Math.abs(x1-x0),Math.abs(y1-y0));}
      c.restore();
      // 무너지며 구르는 눈 더미 (앞머리 뒤 40px 남짓)
      for(let a=4;a<len;a+=11){if(inGap(a))continue;const j=hash(a*0.37);
        for(let r=0;r<3;r++){const d=14+r*13+j*6;if(d>depth)break;Bl(a+(r%2?5:0),d,9+j*3,6+r,r?SNOW_SH:'#e9eeee',0.85-r*0.2);}}
      // 앞머리: 솟았다 앞으로 말려 부서지는 눈 물마루
      const crest=a=>12+6*Math.sin(a*0.09+t*0.32)+5*hash(a*0.13);
      for(let a=3;a<len;a+=9){if(inGap(a))continue;const h=crest(a);
        Bl(a,-2,8,h*0.42+2,SNOW_SH,0.95);Bl(a,h*0.3,9,h*0.62,SNOW,1);Bl(a+2,-5,6,3.5,'#ffffff',0.95);}
      c.save();c.strokeStyle=INK;c.globalAlpha=0.6;c.lineWidth=1.5;c.beginPath();let on=false;
      for(let a=0;a<=len;a+=6){if(inGap(a)){on=false;continue;}const [x,y]=P(a,-7-2*Math.sin(a*0.21+t*0.4));on?c.lineTo(x,y):c.moveTo(x,y);on=true;}
      c.stroke();c.restore();
      // 틈 양쪽 벽: 빈 줄이 또렷하게
      for(const e of [gc-gh,gc+gh])for(let d=-4;d<Math.min(depth,60);d+=10)Bl(e+(e<gc?-4:4),d,4,6,SNOW,0.95);
      // 속에서 구르는 눈덩이와 돌
      for(let i=0;i<6;i++){const a=(i*61+t*1.3)%len;if(inGap(a))continue;const d=8+(i*7)%24,[x,y]=P(a,d);
        if(i%3===0)rockStone(c,x,y,5,4,t*0.2+i,i*13+5,0.95,0.5);else drawSnowball(c,x,y,4.5+(i%2)*2,t*0.25+i,0.95);}
      // 앞에 튀는 눈보라와 위로 피는 가루
      if(!stil)for(let i=0;i<16;i++){const a=hash(i*2.9)*len;if(inGap(a))continue;Bl(a,-(9+((t*3+i*17)%20)),1.8,1.8,i%4?'#ffffff':SNOW_SH,0.85);}
      for(let a=20;a<len;a+=42){if(!inGap(a))Bl(a,24,22,12,'#ffffff',0.3);}
    }},
  golemSnowball:{
    step(b){b.t++;const rel=b.delay+SB.wind,fly=b.fly||SB.fly,land=rel+fly,sz=b.sz||1;
      if(b.tx==null&&b.t>=rel){const [x,y]=snowTarget(b);
        b.tx=clamp(x,BOX.x+20,BOX.x+BOX.w-20);b.ty=clamp(y,BOX.y+18,BOX.y+BOX.h-14);
        if(b.drop){b.sx=b.tx+(hash(b.i*1.9)-0.5)*30;b.sy=BOX.y-150;}   // 결정 D-376: 몸에서 털린 눈이 칸 위에서 곧장 떨어진다
        else{const h=toScreen(LW/2+b.side*80,bodyY()-114);b.sx=h.x;b.sy=h.y;}}
      // 결정 D-256: 눈폭탄 한 대는 통상 피해의 golem_snowball_damage 만큼
      if(b.t===land){Sound.playSfx('battle_hit');snowPowder(b.tx,b.ty,sz<0.95);if(Math.hypot(B.px-b.tx,B.py-b.ty)<SB.hit*sz)bHitMe(T().golem_snowball_damage);}
      if(b.t>land+SB.splat)b.dead=1;},
    draw(c,b){if(b.tx==null)return;const rel=b.delay+SB.wind,fly=b.fly||SB.fly,land=rel+fly,R=SB.radius*(b.sz||1);
      if(b.t<land){const k=(b.t-rel)/fly;
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
/* 결정 D-453: 서리 옥 빛. 빛줄기는 핵(위 골렘 가슴)에서 칸으로 쏟아진다. 각도는 곧장 아래가 0, 오른쪽이 +.
   한 바퀴(golem_light_frames) 동안 앞 절반은 함께 쓸고, 뒤 절반은 가위처럼 엇갈린다 */
function lightApex(){return toScreen(LW/2,bodyY()+18);}
function lightBeams(b){const n=b.n,S=n>2?0.36:0.42,A=n>2?0.34:0.44,W=T().golem_light_width*(n>2?0.85:1),on=b.t-T().golem_light_tell,P=T().golem_light_frames;
  const w=on<=0?0:on>=P?0:Math.sin(Math.PI*2*on/P);
  return Array.from({length:n},(_,i)=>({a:(i-(n-1)/2)*S+A*w*(on>P/2&&i%2?-1:1),W}));}
function lightAlpha(b){const tl=T().golem_light_tell,P=T().golem_light_frames,on=b.t-tl;
  return on<=0?0:on<12?on/12:on<=P?1:Math.max(0,1-(on-P)/LIGHT_FADE);}
/* 결정 D-643: 빛을 색종이 띠가 아니라 서리 옥에서 쏟아지는 신비로운 빛으로 (사용자 피드백 2026-11-05).
   겹겹이 번지는 빛(보랏빛 바깥 → 푸른 서리빛 → 흰 심지), 빛줄기를 타고 내려가는 물결, 그 속을 떠도는 얼음 알갱이.
   칸은 푸르스름하게 가라앉아 빛만 떠오른다. 판정(bm.W)은 그대로다 */
function beamWedge(c,A,a,w,L){const l=[Math.sin(a-w),Math.cos(a-w)],r=[Math.sin(a+w),Math.cos(a+w)];
  c.beginPath();c.moveTo(A.x,A.y);c.lineTo(A.x+l[0]*L,A.y+l[1]*L);c.lineTo(A.x+r[0]*L,A.y+r[1]*L);c.closePath();}
function drawBeams(c,b,below){
  const A=lightApex(),al=lightAlpha(b),tl=T().golem_light_tell,k=clamp(b.t/tl,0,1),L=560,tm=b.t,stl=still();
  for(const [bi,bm] of lightBeams(b).entries()){const [m0,m1]=[Math.sin(bm.a),Math.cos(bm.a)];
    if(al<=0){   // 결정 D-642: 예고. 빛줄기 자리에 서리빛이 점점 차오르고 물결이 칸 쪽으로 흘러내린다. 끝 무렵 가장자리가 깜박인다
      c.save();const g=c.createLinearGradient(A.x,A.y,A.x+m0*L*0.8,A.y+m1*L*0.8);
      g.addColorStop(0,'rgba(228,251,246,'+(0.25+0.5*k).toFixed(3)+')');g.addColorStop(1,'rgba(160,226,220,'+(0.06+0.3*k).toFixed(3)+')');
      c.globalAlpha=below?1:0.7;c.fillStyle=g;beamWedge(c,A,bm.a,bm.W*(0.55+0.45*k),L);c.fill();
      if(!stl)for(let i=0;i<3;i++){const d=((tm*3.2+i*70)%220)+40,hw=Math.tan(bm.W)*d;   // 흘러내리는 물결
        c.globalAlpha=(0.25+0.5*k)*(1-(d-40)/220);c.strokeStyle='#ffffff';c.lineWidth=1.6;c.beginPath();
        c.moveTo(A.x+m0*d-m1*hw*0.8,A.y+m1*d+m0*hw*0.8);c.lineTo(A.x+m0*d+m1*hw*0.8,A.y+m1*d-m0*hw*0.8);c.stroke();}
      const blink=k>0.6&&Math.floor(tm/4)%2;c.globalAlpha=blink?0.95:0.5+0.3*k;c.strokeStyle=GEM_DK;c.lineWidth=blink?2:1.3;c.setLineDash([6,4]);
      const [l0,l1]=[Math.sin(bm.a-bm.W),Math.cos(bm.a-bm.W)],[r0,r1]=[Math.sin(bm.a+bm.W),Math.cos(bm.a+bm.W)];
      c.beginPath();c.moveTo(A.x,A.y);c.lineTo(A.x+l0*L,A.y+l1*L);c.moveTo(A.x,A.y);c.lineTo(A.x+r0*L,A.y+r1*L);c.stroke();c.restore();continue;}
    const hue=stl?0:Math.sin(tm*0.05+bi*1.7);   // 빛깔이 보랏빛과 푸른빛 사이를 천천히 오간다
    c.save();c.globalAlpha=al*(below?1:0.75);
    c.filter='blur(9px)';c.fillStyle='rgba('+Math.round(196+24*hue)+','+Math.round(184-10*hue)+',255,.3)';beamWedge(c,A,bm.a,bm.W*2.1,L);c.fill();   // 보랏빛 바깥 번짐(흐리게 번진다)
    c.filter='blur(4px)';c.fillStyle='rgba(150,236,226,.4)';beamWedge(c,A,bm.a,bm.W*1.3,L);c.fill();c.filter='none';                              // 푸른 서리빛
    const g=c.createRadialGradient(A.x,A.y,0,A.x,A.y,L*0.8);g.addColorStop(0,'rgba(255,255,255,.98)');g.addColorStop(0.5,'rgba(214,250,244,.75)');g.addColorStop(1,'rgba(176,236,230,.45)');
    c.fillStyle=g;beamWedge(c,A,bm.a,bm.W*0.85,L);c.fill();
    c.fillStyle='rgba(255,255,255,.85)';beamWedge(c,A,bm.a,bm.W*0.22,L);c.fill();                                             // 흰 심지
    if(!stl)for(let i=0;i<4;i++){const d=((tm*4.5+i*80)%320)+30,hw=Math.tan(bm.W*0.9)*d;   // 빛을 타고 내려가는 물결
      c.globalAlpha=al*0.55*(1-(d-30)/320);c.strokeStyle='#ffffff';c.lineWidth=2.2;c.beginPath();
      c.moveTo(A.x+m0*d-m1*hw,A.y+m1*d+m0*hw);c.quadraticCurveTo(A.x+m0*(d+8),A.y+m1*(d+8),A.x+m0*d+m1*hw,A.y+m1*d-m0*hw);c.stroke();}
    c.restore();
    if(!stl)for(let i=0;i<9;i++){const d=60+((tm*1.4+i*37)%300),j=(hash(i*3.3+bi)-0.5)*bm.W*1.7,tw=0.5+0.5*Math.sin(tm*0.3+i*2.1);   // 얼음 알갱이
      star(c,A.x+Math.sin(bm.a+j)*d+Math.sin(tm*0.04+i)*3,A.y+Math.cos(bm.a+j)*d,1.4+tw*1.4,al*(0.35+0.55*tw)*(below?1:0.7));}
  }
  if(al>0&&!below){c.save();c.translate(A.x,A.y);c.rotate(stl?0:tm*0.02);c.globalAlpha=0.8*al;c.strokeStyle='#ffffff';c.lineWidth=1.4;   // 핵 앞의 얼음꽃
    for(let i=0;i<6;i++){c.rotate(Math.PI/3);c.beginPath();c.moveTo(0,0);c.lineTo(0,-14);c.moveTo(0,-8);c.lineTo(-4,-12);c.moveTo(0,-8);c.lineTo(4,-12);c.stroke();}c.restore();}
}
/* 결정 D-642: 빛 공격 예고를 또렷하게 (사용자 피드백 2026-11-05: 전조가 애매하다).
   예고 동안 뒤 배경 전체가 서리빛으로 밝아지고, 빛 고리가 핵으로 모여들며, 핵에서 가는 빛살이 사방으로 돈다.
   빛이 쏟아지는 동안 배경은 푸르스름하게 가라앉는다. 배경 그림(drawStoneCliff) 끝에서 부른다 */
function drawLightVeil(c){
  const b=B.bullets.find(x=>x.k==='golemLight');if(!b)return;
  const tl=T().golem_light_tell,k=clamp(b.t/tl,0,1),al=lightAlpha(b),A=lightApex(),stl=still();
  c.save();
  if(al<=0){const e=k*k*(3-2*k);
    c.globalAlpha=0.55*e;c.fillStyle='#f7fffb';c.fillRect(0,0,LW,LH);   // 배경이 밝아진다
    const g=c.createRadialGradient(A.x,A.y,4,A.x,A.y,LW*0.75);g.addColorStop(0,'rgba(228,251,246,.95)');g.addColorStop(1,'rgba(228,251,246,0)');
    c.globalAlpha=0.75*e;c.fillStyle=g;c.fillRect(0,0,LW,LH);
    for(let i=0;i<3;i++){const f=stl?0.5:((b.t*0.018+i/3)%1),r=20+(1-f)*LW*0.45;   // 핵으로 모여드는 빛 고리
      c.globalAlpha=e*0.6*f;c.strokeStyle='#ffffff';c.lineWidth=2+3*f;c.beginPath();c.ellipse(A.x,A.y,r,r*0.62,0,0,Math.PI*2);c.stroke();}
    c.globalAlpha=0.35*e;c.strokeStyle='#ffffff';c.lineWidth=1.2;   // 사방으로 도는 가는 빛살
    for(let i=0;i<12;i++){const a=i*Math.PI/6+(stl?0:b.t*0.012);c.beginPath();c.moveTo(A.x+Math.cos(a)*24,A.y+Math.sin(a)*18);c.lineTo(A.x+Math.cos(a)*LW*0.6,A.y+Math.sin(a)*LW*0.42);c.stroke();}
  }else{c.globalAlpha=0.22*al;c.fillStyle='#24344a';c.fillRect(0,0,LW,LH);}   // 빛이 쏟아지는 동안 배경이 가라앉는다
  c.restore();
}
defineBullets({
  golemLight:{
    step(b){b.t++;const tl=T().golem_light_tell,P=T().golem_light_frames,on=b.t-tl;
      if(b.t===1)Sound.playSfx('wind_bell');if(b.t===tl+1)Sound.playSfx('battle_warn');   // 결정 D-642: 예고가 시작될 때 풍경 소리
      if(on>8&&on<=P){const A=lightApex(),ang=Math.atan2(B.px-A.x,B.py-A.y);if(lightBeams(b).some(bm=>Math.abs(ang-bm.a)<bm.W-0.012))bHitMe();}
      if(on>=P+LIGHT_FADE)b.dead=1;},
    draw(c,b){const al=lightAlpha(b);if(al>0){c.save();c.fillStyle='rgba(30,44,66,'+(0.3*al).toFixed(3)+')';c.fillRect(BOX.x,BOX.y,BOX.w,BOX.h);c.restore();}   // 칸이 푸르스름하게 가라앉고 빛줄기만 밝다 (D-643)
      drawBeams(c,b,true);}},
});
/* 상자 밖까지 날아가는 눈덩이는 잘리지 않게 상자 위에 그린다 (결정 D-182). 손에서 놓인 뒤부터 그린다. 친 자리 효과도 여기서 (D-253) */
function drawSnowFlights(c){
  for(const b of B.bullets)if(b.k==='golemLight'){c.save();c.beginPath();c.rect(0,0,LW,BOX.y-56);c.clip();drawBeams(c,b,false);c.restore();}   // 결정 D-453: 글귀 줄은 가리지 않는다
  for(const b of B.bullets){if(b.k!=='golemSnowball'||b.tx==null)continue;
    const fly=b.fly||SB.fly,rel=b.delay+SB.wind,land=rel+fly;if(b.t>=land)continue;
    const k=(b.t-rel)/fly,e=b.drop?k*k:k,x=b.sx+(b.tx-b.sx)*e,y=b.sy+(b.ty-b.sy)*e-(b.drop?0:80*4*k*(1-k));
    drawSnowball(c,x,y,(b.drop?11+6*k:13+9*k)*(b.sz||1),b.t*0.15);
  }
  drawImpacts(c);
}
function tickGolem(){
  if(B.quake>0)B.quake--;
  if(legBroken()&&(B.gFall||0)<LEG_FALL){B.gFall=(B.gFall||0)+1;   // 결정 D-747: 무너져 엎어지는 순간 눈밭이 크게 울린다
    if(B.gFall===Math.round(LEG_FALL*0.8)){const g=toScreen(LW/2,EY+124);Sound.playSfx('battle_hit');B.quake=16;
      for(const s of [-1,1]){const p=toScreen(LW/2+s*70,EY+124);snowBurst(p.x,p.y,12,true);plume(p.x,p.y);}snowBurst(g.x,g.y,8,true);}}
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
    settle:true,   // 결정 D-243: 눈사태·튄 눈덩이가 다 사라진 뒤에 빈틈을 연다
    headPose(){return toScreen(LW/2,bodyY()-46);},
    openMark:golemOpenMark,
    // 결정 D-370: weak 는 부서진 뒤 한 줄
    parts:tableParts('golem',{leg:{atk:'golemStomp',mark:'발',tell:'골렘이 구들돌 발을 높이 쳐든다.',weak:'다리가 무너져 골렘이 눈밭에 엎어졌다. 이제 팔로 몸을 끈다.'},
      arm:{atk:'golemArm',mark:'팔',tell:'골렘이 차돌 팔을 뒤로 높이 감아올린다.',weak:'골렘이 약해졌다. 팔이 없어 휩쓸지도, 눈을 던지지도 못한다.'},
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
