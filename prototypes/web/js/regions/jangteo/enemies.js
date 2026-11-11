'use strict';
/* 큰 장터 전투: 눈도깨비. 원본 표: design/data/bosses.csv · boss_parts.csv
   결정 D-680: 헌물 도깨비를 눈도깨비로 바꿨다 (사용자 지시 2026-11-05 큰 장터 16·24).
     닳아 버린 싸리비가 섣달그믐 눈밤에 도깨비가 된 것이다(설화: 붙잡아 둔 도깨비가 아침에 보니 몽당 빗자루였다).
     일본 오니 표식(범 가죽 잠방이, 가시 박힌 쇠몽둥이, 두 뿔)은 쓰지 않는다.
   결정 D-760: 모습을 근엄하고 무섭게 다시 그렸다 (사용자 지시 2026-11-05 세 번째 묶음 "우스꽝스럽다, 근엄해야 한다,
     옷은 약간 옛날 일본 무사풍, 빗자루는 없애라, 뿔은 설산에서 온 것처럼").
     - 손에 싸리비를 쥐지 않는다. 싸리비였던 흔적은 진 뒤 눈 더미에 남는 몽당 싸리비와 멧돼지 갈기(싸리 살)뿐이다.
     - 옷: 어깨가 빳빳하게 뻗은 어깨옷(까치 깃처럼 검고 가장자리가 흰)에 얼음 비늘 어깨받이, 깃을 여민 겉옷, 띠, 통 넓은 바지.
       바짓단이 길어 눈 위에 끌린다. 종종이가 들은 '사락사락'은 그 옷자락 끌리는 소리다(예전: 싸리비로 발자국을 쓰는 소리).
     - 얼굴: 각진 턱, 찌푸린 눈두덩 아래 가늘게 빛나는 서리빛 눈, 굳게 다문 입과 아래에서 솟은 엄니. 둥근 눈망울과 눈 속 흰 점은 쓰지 않는다.
     - 뿔: 이마에서 솟아 뒤로 휜 얼음 뿔 하나. 면이 깎인 얼음 결, 곁가지 얼음 송곳, 뿌리에 눈 더께. 정수리에 서리 결정이 돋는다.
   결정 D-681: 둔갑은 독수리·곰·멧돼지.
     - 독수리(결정 D-761): 날개를 내리칠 때마다 판 바닥에서 소용돌이가 일어 위로 커지며 떠돈다(ndWind).
       결정 D-878: 좌우로 판을 오간다. 결정 D-942: 키는 판 높이의 0.4이고, 바닥 칸과 공중 칸에 번갈아 일어 위아래로 비켜 피한다.
     - 곰(결정 D-764): 앞발로 긁는다. 발톱 세 줄이 먼저 붉게 그어지고 굵고 빠르게 긁는다. 땅에 세 줄 자국이 남는다(ndClaw).
     - 멧돼지(결정 D-763): 몸은 판 위에서 사라지고, 판 안에는 발자국만 어지러운 길을 따라 찍히며 달려든다(ndRush).
   결정 D-1450: 약점은 다시 심장이다 (사용자 지시 2026-11-11 큰 장터 6·7: 눈홍시는 게임에서 뺀다. D-940의 눈홍시를 바꾼다).
     둔갑 패턴이 끝나면 눈도깨비가 **그 둔갑 모습 그대로** 지쳐 헐떡이고,
     가슴과 판의 얼음 속에서 심장이 드러난다. 심장은 찬 얼음 껍질 속에 푸른 도깨비불이 타는 모습이고(이기면 남는 도깨비불씨),
     둔갑마다 둘레가 다르다: 독수리는 검은 깃 사이, 곰은 털가죽과 흰 반달 속, 멧돼지는 곤두선 싸리 갈기 밑, 발악 뒤 본모습은 얼음덩이 속.
     심장을 치면 그 둔갑의 내구도가 깎이고 둔갑이 풀려 본모습으로 돌아온다. 연장이 있으면 nundok_spill_chance 확률로 소매 속 재료가 쏟아진다.
     결정 D-1460: 맞았어도 지친다(예전엔 nundok_gloat_hits 번 맞으면 기세가 올라 지치지 않았다. 사용자 지시 2026-11-11 공통). 심장은 날아가거나 떨어지지 않는다(골렘의 핵이 칸 한가운데 드러나는 것과 같은 방식).
   결정 D-1456: 수리부엉이가 아닌 모습으로 싸움에 들어오면 눈도깨비가 밖에서처럼 눈보라에 싸여 흐리게 보이고, 공격(예고 포함)도 흐리다(bulletAlpha).
     싸우다 한 번이라도 수리부엉이가 되면 정체가 드러나 끝까지 또렷하다. 발악의 빙산은 D-880 규칙 그대로다(수리부엉이 모습일 때만 또렷).
   결정 D-683: 둔갑 둘이 풀리면(체력이 적으면) 발악한다. 몸을 감추고, 보이지 않는 빙산이 발밑에서 솟는다.
     수리부엉이 모습이면 숨은 도깨비와 솟을 자리의 금이 보이고, 아니면 솟는 순간의 눈보라만 보인다(ndBerg).
   결정 D-765: 눈도깨비를 친 뒤 부위 이름과 깎인 수('독수리 −0.5')를 띄우지 않는다 (사용자 지시 2026-11-05). quietHits.
   결정 D-685: 전투 색(D-102 먹 + 단청 붉은색)에 눈도깨비만 서리 푸른 담채와 푸른 도깨비불을 더한다. 붉은색은 피할 예고에만 쓴다. */
(()=>{
const T=()=>TABLES.TUNING;
const SNOW='#f8f6f0',ICE='#d6ebf2',FROST='#9dbccb',FROST_DK='#4d6c80',BLUE='#3f86c8',BLUE_LT='#a6d6f4',GLOW='#eaf7ff',
  SHEEN='#2b4a6a',SKIN='#aebcc4',SKIN_DK='#6f8592',FUR='#2f2722',BRISTLE='#b9874a',BEAK='#cfc39c',
  ROBE='#1a2230',ROBE_LT='#2a3850',HAKAMA='#222a38',OBI='#5e4a2e',TUSK='#efe8d6',
  HEART_DK='#1d4f86',AMBER='rgba(240,170,80,A)';
const still=()=>Vfx.reducedMotion;
const FORMS={eagle:'독수리',bear:'곰',boar:'멧돼지'};
/* 결정 D-1456: veiled 는 수리부엉이가 아닌 모습으로 싸움에 들어왔을 때 켜지고, 싸우다 수리부엉이가 되면 꺼진 뒤 다시 켜지지 않는다 */
function nd(){
  if(B.nd)return B.nd;
  B.nd={shown:'',swap:0,scars:[],prints:[],waves:[],flap:0,reveal:0,hidSaid:false,tired:false,reverted:false,heartSaid:false,bergWarned:false,veiled:battleForm()!=='owl'};
  if(B.nd.veiled)G.f.ndVeiledFought=true;   // 진 뒤 귀띔이 밤눈을 떠올린다 (jangteo/story.js)
  return B.nd;
}
const veilBody=()=>T().nundok_veil_body,veilAtk=()=>T().nundok_veil_attack;

/* ---------- 그리기 도구 ---------- */
function shape(c,pts,fill,alpha=1,stroke=null,lw=2){
  c.save();c.globalAlpha=alpha;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length];c.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2);}
  c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.lineJoin='round';c.stroke();}c.restore();
}
function sharp(c,pts,fill,alpha=1,stroke=null,lw=1.6){
  c.save();c.globalAlpha=alpha;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))c.lineTo(p[0],p[1]);c.closePath();
  if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.lineJoin='round';c.stroke();}c.restore();
}
function mirror(pts,cx){return pts.map(([x,y])=>[2*cx-x,y]);}
/* 깃 하나: (x,y)에서 ang 쪽으로 len. tip 이 있으면 끝이 그 색 (까치 깃) */
function feather(c,x,y,len,wid,ang,col=INK,tip=null,alpha=1){
  c.save();c.translate(x,y);c.rotate(ang);c.globalAlpha=alpha;
  c.fillStyle=col;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(len*0.45,-wid,len,0);c.quadraticCurveTo(len*0.45,wid,0,0);c.fill();
  if(tip){c.fillStyle=tip;c.beginPath();c.moveTo(len*0.62,-wid*0.62);c.quadraticCurveTo(len*0.85,-wid*0.5,len,0);c.quadraticCurveTo(len*0.85,wid*0.5,len*0.62,wid*0.62);c.fill();}
  c.strokeStyle='rgba(239,227,200,.35)';c.lineWidth=0.8;c.beginPath();c.moveTo(2,0);c.lineTo(len*0.9,0);c.stroke();
  c.restore();
}
function glow(c,x,y,r,col,alpha){
  const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,col.replace('A',String(alpha)));g.addColorStop(1,col.replace('A','0'));
  c.save();c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.restore();
}
const COLD='rgba(166,214,244,A)';
/* 결정 D-1450: 눈도깨비의 심장. 찬 얼음 껍질 속에서 푸른 도깨비불이 뛴다(이기면 꺼진 불씨가 도깨비불씨로 남는다).
   form 마다 둘레가 다르다. eagle: 검은 깃이 부채처럼 감싸고 눈발이 돈다 / bear: 거친 털가죽과 흰 반달, 속에 호박빛이 비친다 /
   boar: 곤두선 싸리 갈기가 가시처럼 뻗는다 / core(발악 뒤 본모습): 면이 깎인 얼음덩이에 싸였다.
   s 는 크기 배율, crack 은 얼음 금(0~1, 둔갑 기운이 깎인 만큼 번진다). */
function heartPath(c,x,y,k,fill,alpha,stroke,lw){
  shape(c,[[x,y+16*k],[x-13*k,y+4*k],[x-16*k,y-6*k],[x-10*k,y-14*k],[x-2*k,y-11*k],[x,y-7*k],[x+2*k,y-11*k],[x+10*k,y-14*k],[x+16*k,y-6*k],[x+13*k,y+4*k]],fill,alpha,stroke,lw);
}
function noeHeart(c,x,y,s=1,form='core',crack=0){
  const t=still()?0:B.time,beat=still()?1:1+0.09*Math.max(0,Math.sin(t*0.3)),k=s*beat,spin=t*0.03;
  // 둘레 (심장 뒤)
  if(form==='eagle'){
    glow(c,x,y,44*k,COLD,0.5);
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2+0.3;feather(c,x+Math.cos(a)*8*k,y+Math.sin(a)*8*k,30*k,6*k,a,i%3===0?SHEEN:INK,SNOW,0.95);}
    for(let i=0;i<8;i++){const a=spin*2+i/8*Math.PI*2,r=(30+hash(i)*8)*k;blob(c,x+Math.cos(a)*r,y+Math.sin(a)*r*0.6,1.8*k+1,1.4*k+1,SNOW,0.9);}   // 깃 둘레를 도는 눈발
  }else if(form==='bear'){
    glow(c,x,y,46*k,AMBER,0.35);glow(c,x,y,30*k,COLD,0.35);
    for(let i=0;i<28;i++){const a=i/28*Math.PI*2,r0=(15+hash(i*2.3)*3)*k,r1=(25+hash(i*1.7)*7)*k;brush(c,[[x+Math.cos(a)*r0,y+Math.sin(a)*r0],[x+Math.cos(a+0.12)*r1,y+Math.sin(a+0.12)*r1]],2.6*k+0.6,i%2?FUR:'#54463b',0.95);}
    brush(c,[[x-17*k,y+20*k],[x-6*k,y+25*k],[x+6*k,y+25*k],[x+17*k,y+20*k]],4*k+1,SNOW,0.95);   // 흰 반달
  }else if(form==='boar'){
    glow(c,x,y,44*k,COLD,0.4);
    for(let i=0;i<18;i++){const a=-Math.PI+i/17*Math.PI*2,r0=14*k,r1=(28+hash(i*3.1)*10)*k,w=2.6*k;
      sharp(c,[[x+Math.cos(a-0.12)*r0,y+Math.sin(a-0.12)*r0],[x+Math.cos(a)*r1,y+Math.sin(a)*r1],[x+Math.cos(a+0.12)*r0,y+Math.sin(a+0.12)*r0]],BRISTLE,0.95,'#6b4e33',0.8);
      if(i%3===0)blob(c,x+Math.cos(a)*r1,y+Math.sin(a)*r1,w,w*0.8,SNOW,0.9);}   // 갈기 끝에 앉은 눈
  }else glow(c,x,y,40*k,COLD,0.55);
  // 심장: 얼음 껍질과 그 속에서 뛰는 푸른 불
  heartPath(c,x,y,k*1.08,ICE,0.6,FROST_DK,2);
  heartPath(c,x,y+k,k*0.8,form==='bear'?'#4f86b8':BLUE,0.92,HEART_DK,1.2);
  const fl=still()?0:Math.sin(t*0.42)*2*k;
  sharp(c,[[x-6*k,y+8*k],[x-4*k,y-2*k],[x-1*k+fl*0.4,y-11*k],[x+2*k,y-3*k],[x+5*k+fl,y-9*k],[x+6*k,y+2*k],[x+3*k,y+9*k]],GLOW,0.9);   // 도깨비불
  if(form==='bear')blob(c,x,y+3*k,4*k,4*k,'#f2b04a',0.55);
  sharp(c,[[x-12*k,y-7*k],[x-8*k,y-12*k],[x-4*k,y-10*k],[x-9*k,y-3*k]],'#ffffff',0.6);   // 얼음 윤
  if(form==='core'){   // 본모습: 면이 깎인 얼음덩이 속
    const P=[[x-27*k,y+4*k],[x-21*k,y-18*k],[x-6*k,y-28*k],[x+13*k,y-25*k],[x+27*k,y-9*k],[x+24*k,y+13*k],[x+6*k,y+23*k],[x-15*k,y+19*k]];
    sharp(c,P,ICE,0.38,FROST_DK,2);sharp(c,[[x-21*k,y-16*k],[x-6*k,y-26*k],[x+2*k,y-21*k],[x-12*k,y-9*k]],'#ffffff',0.4);}
  // 금: 깎인 만큼 가운데에서 바깥으로 번진다
  const n=Math.round(crack*7);
  for(let i=0;i<n;i++){const a=i/7*Math.PI*2+hash(i*2.7)*0.6,L=(10+hash(i*4.1)*12)*k*(0.5+crack*0.5),m=a+(hash(i*6.3)-0.5)*0.8;
    const Q=[[x+Math.cos(a)*4*k,y+Math.sin(a)*4*k],[x+Math.cos(m)*L*0.6,y+Math.sin(m)*L*0.5],[x+Math.cos(a)*L,y+Math.sin(a)*L*0.8]];
    brush(c,Q,1.4,FROST_DK,0.9);brush(c,Q.map(([qx,qy])=>[qx+1,qy-1]),0.7,'#ffffff',0.8);}
}
/* 결정 D-1450: 지친 몸에서 앞섶(또는 깃·털·갈기)이 벌어진 자리. 그 둔갑의 심장이 드러난다 */
function chestHeart(c,x,y,s,form){
  sharp(c,[[x,y-24*s],[x+18*s,y+2*s],[x+8*s,y+28*s],[x-8*s,y+28*s],[x-18*s,y+2*s]],'#101a24',0.9);
  noeHeart(c,x,y+2*s,0.9*s,form,0);
}
/* 결정 D-1450: 둔갑한 채 지쳐 헐떡이는 입김 (hx,hy 는 입 자리) */
function pant(c,hx,hy){
  for(let i=0;i<2;i++){const k=still()?0.5:((B.time*0.03+i*0.5)%1);blob(c,hx+(i?16:-16)+(i?1:-1)*k*28,hy+k*6,6+k*13,4+k*7,'#ffffff',0.6*(1-k));}
}
/* 결정 D-941: 숨은 눈도깨비 둘레로 눈폭풍이 휘몰아친다 (사용자 지시 2026-11-06 "눈도깨비를 중심으로 감싸고 돌아야 한다. 사선 방향으로").
   눈발은 (cx,cy)를 가운데 두고 비스듬히 기운 타원을 따라 돌며 안쪽으로 빨려 든다. 가까울수록 빠르다.
   긴 눈줄기는 도는 방향으로 그어진다. 예전(D-877)엔 판 전체에 위에서 아래로 비스듬히 내리쳤다. */
const STORM={tilt:-0.5,squash:0.5,spin:0.9,inflow:0.35,rMin:26,bias:1.7,bands:4};
function stormSwirl(c,cx,cy,rMax,n,streaks,alpha=1){
  const t=still()?0:B.time,ct=Math.cos(STORM.tilt),st=Math.sin(STORM.tilt);
  const at=(r,a)=>{const ex=Math.cos(a)*r,ey=Math.sin(a)*r*STORM.squash;return [cx+ex*ct-ey*st,cy+ex*st+ey*ct];};
  const span=rMax-STORM.rMin,ang=(r,seed)=>seed+t*STORM.spin*0.06*Math.sqrt(rMax/r);
  // 휘감는 바람 띠: 몸 둘레의 기운 타원 위를 도는 옅은 긴 호. 흐름이 보이게 한다
  c.save();c.lineCap='round';
  for(let k=0;k<STORM.bands;k++){const r=rMax*(0.22+k*0.17),a0=ang(r,k*1.7),len=1.1+hash(k*3.3)*0.6;
    for(const [w,al] of [[9,0.12],[2.2,0.4]]){c.globalAlpha=al*alpha;c.strokeStyle=SNOW;c.lineWidth=w;c.beginPath();
      for(let j=0;j<=16;j++){const [x,y]=at(r,a0-len*j/16);if(j)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}}
  c.restore();
  // 눈발: 가운데로 몰리게(bias) 놓고, 돌면서 안쪽으로 빨려 든다
  for(let i=0;i<n;i++){
    const u=Math.pow(hash(i*2.3),STORM.bias),r=STORM.rMin+((u*span-t*STORM.inflow*(0.6+hash(i))%span)+span)%span,a=ang(r,hash(i*7.1)*Math.PI*2);
    const [x,y]=at(r,a),sz=1.3+hash(i*4.7)*2.3,fade=Math.min(1,(r-STORM.rMin)/30);
    blob(c,x,y,sz,sz*0.8,SNOW,0.85*alpha*fade);}
  // 눈줄기: 도는 방향으로 길게 그어진 호
  for(let i=0;i<streaks;i++){
    const r=STORM.rMin+20+Math.pow(hash(i*5.1),1.3)*(span-20),a=ang(r,hash(i*8.3)*Math.PI*2),len=0.3+hash(i*3)*0.3;
    const pts=[0,0.25,0.5,0.75,1].map(q=>at(r*(1+q*0.05),a-len*q));
    brush(c,pts,1.6,SNOW,0.65*alpha);}
}

/* 결정 D-760: 설산에서 온 얼음 뿔. 이마(x,y)에서 솟아 lean 쪽으로 휜다. r 은 얼굴 반지름 */
function iceHorn(c,x,y,r,lean=1){
  const P0=[x,y],P1=[x+lean*r*0.12,y-r*0.9],P2=[x+lean*r*0.75,y-r*1.55],N=10,L=[],Rr=[];
  const at=k=>[(1-k)*(1-k)*P0[0]+2*(1-k)*k*P1[0]+k*k*P2[0],(1-k)*(1-k)*P0[1]+2*(1-k)*k*P1[1]+k*k*P2[1]];
  for(let i=0;i<=N;i++){const k=i/N,[px,py]=at(k),[qx,qy]=at(Math.min(1,k+0.01)),[ox,oy]=at(Math.max(0,k-0.01));
    let dx=qx-ox,dy=qy-oy;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;const w=r*0.28*Math.pow(1-k,0.85)+0.6;
    L.push([px-dy*w,py+dx*w]);Rr.push([px+dy*w,py-dx*w]);}
  glow(c,P2[0]*0.5+P0[0]*0.5,P0[1]-r*0.8,r*1.1,COLD,0.28);
  // 곁가지 얼음 송곳 둘 (바깥쪽)
  for(const [k,len] of [[0.32,0.42],[0.58,0.3]]){const [px,py]=at(k),side=Rr[Math.round(k*N)];
    const tx=side[0]+lean*r*len*0.9,ty=side[1]-r*len*0.5;sharp(c,[[side[0],side[1]-r*0.06],[tx,ty],[side[0]-lean*r*0.04,side[1]+r*0.08]],ICE,0.95,FROST_DK,1.2);
    brush(c,[[side[0],side[1]],[tx*0.6+side[0]*0.4,ty*0.6+side[1]*0.4]],1,'#ffffff',0.7);}
  const body=L.concat(Rr.slice().reverse());
  sharp(c,body,ICE,0.96,FROST_DK,2);
  // 면이 깎인 얼음 결: 가운데 밝은 면과 비스듬한 금
  sharp(c,L.slice(1,N).concat(L.slice(1,N).map((p,i)=>{const q=Rr[i+1];return [(p[0]*0.45+q[0]*0.55),(p[1]*0.45+q[1]*0.55)];}).reverse()),'#ffffff',0.38);
  for(let i=1;i<N-1;i+=2){const p=L[i],q=Rr[i+1];brush(c,[p,q],1,FROST_DK,0.55);}
  brush(c,[at(0.15),at(0.9)],1.3,'#ffffff',0.85);
  // 뿌리의 눈 더께
  shape(c,[[x-r*0.36,y+r*0.06],[x-r*0.2,y-r*0.2],[x+r*0.1,y-r*0.24],[x+r*0.38,y-r*0.06],[x+r*0.2,y+r*0.1]],SNOW,0.97,FROST,1.2);
}
/* 정수리에 돋은 서리 결정 */
function frostCrown(c,x,y,r){
  for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*0.34,bx=x+Math.cos(a)*r*0.86,by=y+Math.sin(a)*r*0.86,len=r*(0.26+hash(i*3.1)*0.18);
    if(i===2)continue;
    sharp(c,[[bx-3,by+2],[bx+Math.cos(a)*len,by+Math.sin(a)*len],[bx+3,by+2]],ICE,0.95,FROST_DK,1);}
}
/* 결정 D-760: 근엄한 도깨비 얼굴. opt.beak 독수리 부리, opt.bear 곰 주둥이, opt.roar 벌린 입 */
function sternFace(c,x,y,r,opt={}){
  const t=B.time,[ex,ey]=lookAt(x,y),skin=opt.skin||SKIN,dk=opt.dark||SKIN_DK;
  // 광대가 넓고 턱이 각진 얼굴
  shape(c,[[x-r*0.92,y-r*0.42],[x-r*0.6,y-r*0.98],[x+r*0.6,y-r*0.98],[x+r*0.92,y-r*0.42],[x+r*0.98,y+r*0.22],[x+r*0.72,y+r*0.8],[x,y+r*0.98],[x-r*0.72,y+r*0.8],[x-r*0.98,y+r*0.22]],skin,1,INK,2.6);
  for(const s of [-1,1])sharp(c,[[x+s*r*0.9,y+r*0.02],[x+s*r*0.46,y+r*0.3],[x+s*r*0.76,y+r*0.56]],dk,0.5);   // 광대 밑 그늘 (둥근 볼 홍조처럼 보이지 않게 날 선 그늘)
  for(let i=0;i<3;i++)brush(c,[[x-r*0.34+i*3,y-r*(0.6+i*0.1)],[x,y-r*(0.66+i*0.1)],[x+r*0.34-i*3,y-r*(0.6+i*0.1)]],1.4,dk,0.75);   // 이마 주름
  brush(c,[[x-r*0.06,y-r*0.42],[x-r*0.03,y-r*0.2]],1.6,dk,0.8);brush(c,[[x+r*0.06,y-r*0.42],[x+r*0.03,y-r*0.2]],1.6,dk,0.8);   // 미간 주름
  // 찌푸린 눈두덩 (안쪽이 낮은 V)
  for(const s of [-1,1]){const P=[[x+s*r*0.9,y-r*0.46],[x+s*r*0.08,y-r*0.2],[x+s*r*0.1,y-r*0.08],[x+s*r*0.84,y-r*0.3]];sharp(c,P,dk,1,INK,1.4);}
  // 눈구멍 그늘과 가늘게 빛나는 서리빛 눈
  for(const s of [-1,1]){
    sharp(c,[[x+s*r*0.74,y-r*0.26],[x+s*r*0.14,y-r*0.1],[x+s*r*0.22,y+r*0.02],[x+s*r*0.64,y-r*0.06]],INK,0.82);
    const cx=x+s*r*0.42,cy=y-r*0.1;glow(c,cx,cy,r*0.34,COLD,0.55);
    sharp(c,[[x+s*r*0.64,y-r*0.17],[x+s*r*0.2,y-r*0.08],[x+s*r*0.26,y-r*0.02],[x+s*r*0.58,y-r*0.08]],BLUE_LT,1);
    sharp(c,[[x+s*r*0.52,y-r*0.13],[x+s*r*0.28,y-r*0.07],[x+s*r*0.32,y-r*0.04],[x+s*r*0.5,y-r*0.08]],GLOW,1);
    const px=cx+ex*r*0.03-s*r*0.02;brush(c,[[px,cy-r*0.08],[px,cy+r*0.03]],2.2,INK,0.95);}
  // 서리 앉은 굵은 눈썹: 바깥 위로 뻗친다
  for(const s of [-1,1])for(let i=0;i<5;i++){const bx=x+s*r*(0.14+i*0.16),by=y-r*(0.28+i*0.05);
    brush(c,[[bx,by],[bx+s*r*0.2,by-r*(0.1+i*0.04)]],2.6,i%2?FROST:SNOW,0.95);}
  if(opt.beak){   // 독수리 부리: 굽은 부리가 코 자리에서 내리꽂힌다
    sharp(c,[[x-r*0.24,y+r*0.02],[x+r*0.24,y+r*0.02],[x+r*0.2,y+r*0.4],[x+r*0.02,y+r*0.78],[x-r*0.06,y+r*0.56],[x-r*0.2,y+r*0.32]],BEAK,1,INK,2);
    brush(c,[[x-r*0.16,y+r*0.26],[x+r*0.1,y+r*0.34]],1.4,INK,0.7);brush(c,[[x+r*0.04,y+r*0.1],[x+r*0.12,y+r*0.5]],1,'#ffffff',0.5);
    return;}
  if(opt.bear){   // 곰 주둥이: 튀어나온 주둥이와 젖혀 드러낸 송곳니
    shape(c,[[x-r*0.42,y+r*0.12],[x+r*0.42,y+r*0.12],[x+r*0.48,y+r*0.58],[x,y+r*0.82],[x-r*0.48,y+r*0.58]],'#3d322b',1,INK,2);
    blob(c,x,y+r*0.2,r*0.2,r*0.13,INK);brush(c,[[x,y+r*0.3],[x,y+r*0.46]],1.6,INK,0.8);
    const open=opt.roar?r*0.3:r*0.12;
    shape(c,[[x-r*0.38,y+r*0.5],[x,y+r*0.46],[x+r*0.38,y+r*0.5],[x+r*0.26,y+r*0.56+open],[x-r*0.26,y+r*0.56+open]],'#2a1414',1,INK,1.6);
    for(const s of [-1,1]){sharp(c,[[x+s*r*0.3,y+r*0.5],[x+s*r*0.2,y+r*0.5],[x+s*r*0.26,y+r*0.5+open*0.9+3]],TUSK,1,INK,1);
      sharp(c,[[x+s*r*0.28,y+r*0.58+open],[x+s*r*0.18,y+r*0.58+open],[x+s*r*0.24,y+r*0.4+open*0.4]],TUSK,1,INK,1);}
    return;}
  // 넓은 코: 콧방울이 벌름하다
  shape(c,[[x-r*0.06,y-r*0.06],[x+r*0.06,y-r*0.06],[x+r*0.16,y+r*0.22],[x+r*0.24,y+r*0.32],[x,y+r*0.38],[x-r*0.24,y+r*0.32],[x-r*0.16,y+r*0.22]],dk,1,INK,1.6);
  for(const s of [-1,1])blob(c,x+s*r*0.12,y+r*0.3,r*0.06,r*0.04,INK,0.9);
  // 입: 굳게 다문 아래로 처진 입, 또는 으르렁 벌린 입
  if(opt.roar){shape(c,[[x-r*0.5,y+r*0.54],[x,y+r*0.46],[x+r*0.5,y+r*0.54],[x+r*0.32,y+r*0.78],[x-r*0.32,y+r*0.78]],'#2a1414',1,INK,2);
    for(let i=-2;i<=2;i++)sharp(c,[[x+i*r*0.15-r*0.05,y+r*0.5],[x+i*r*0.15+r*0.05,y+r*0.5],[x+i*r*0.15,y+r*0.57]],TUSK);}
  else brush(c,[[x-r*0.52,y+r*0.6],[x-r*0.2,y+r*0.52],[x+r*0.2,y+r*0.52],[x+r*0.52,y+r*0.6]],2.8,INK,0.95);
  // 아래턱에서 솟은 엄니 둘
  for(const s of [-1,1])sharp(c,[[x+s*r*0.34,y+r*0.66],[x+s*r*0.48,y+r*0.64],[x+s*r*0.46,y+r*0.22]],TUSK,1,INK,1.6);
  if(!still()&&Math.floor(t/60)%3===0){const k=(t%60)/60;blob(c,x+r*0.7+k*16,y+r*0.62-k*12,4+k*8,3+k*5,'#ffffff',0.45*(1-k));}   // 찬 입김
}
/* 바람에 뻗친 서리 머리: 둥근 덩이가 아니라 날 선 가닥 */
function frostMane(c,x,y,r){
  const wob=i=>still()?0:Math.sin(B.time*0.05+i)*2,pts=[];
  for(let i=0;i<=18;i++){const a=-Math.PI*1.08+i*Math.PI*1.16/18,k=i%2?1.08:1.5+hash(i)*0.35;pts.push([x+Math.cos(a)*r*k+wob(i)*(i%2?0:1),y+Math.sin(a)*r*k*0.92]);}
  pts.push([x+r*1.5,y+r*0.7],[x+r*1.22,y+r*1.3],[x+r*0.6,y+r*0.9],[x-r*0.6,y+r*0.9],[x-r*1.22,y+r*1.3],[x-r*1.5,y+r*0.7]);
  sharp(c,pts,SNOW,0.97,FROST_DK,1.6);
  for(const s of [-1,1])for(let i=0;i<5;i++){const sx=x+s*r*(0.95+i*0.1);brush(c,[[sx,y-r*0.2+i*5],[sx+s*6+wob(i),y+r*0.5+i*4],[sx+s*10,y+r*1.2]],1.6,FROST,0.85);}
  for(let i=0;i<6;i++){const a=-Math.PI*0.95+i*Math.PI*0.9/5;brush(c,[[x+Math.cos(a)*r*0.9,y+Math.sin(a)*r*0.9],[x+Math.cos(a)*r*1.4,y+Math.sin(a)*r*1.3]],1.4,FROST_DK,0.6);}
}
/* 가슴까지 내려온 날 선 흰 수염과 고드름 */
function frostBeard(c,x,y,r){
  const pts=[[x-r*0.78,y+r*0.4]];
  for(let i=0;i<=8;i++){const bx=x-r*0.7+i*r*1.4/8,d=1-Math.abs(i-4)/4;pts.push([bx,y+r*(i%2?1.1+d*0.4:1.35+d*0.75+hash(i)*0.15)]);}
  pts.push([x+r*0.78,y+r*0.4],[x+r*0.5,y+r*0.82],[x,y+r*0.98],[x-r*0.5,y+r*0.82]);
  sharp(c,pts,SNOW,0.97,FROST_DK,1.4);
  for(let i=-3;i<=3;i++){const bx=x+i*r*0.2;brush(c,[[bx,y+r*0.9],[bx+i*1.5,y+r*(1.5-Math.abs(i)*0.1)]],1.3,FROST,0.85);
    if(i%2===0)sharp(c,[[bx-3,y+r*(1.6-Math.abs(i)*0.12)],[bx+3,y+r*(1.6-Math.abs(i)*0.12)],[bx,y+r*(1.6-Math.abs(i)*0.12)+13]],ICE,0.95,FROST_DK,1);}
}
/* ---------- 모습 ---------- */
/* 결정 D-760: 본모습. 빳빳한 어깨옷과 얼음 비늘 어깨받이, 여민 겉옷과 띠, 눈에 끌리는 통 넓은 바지 */
function drawBase(c,cx,cy,opt={}){
  // 결정 D-940·D-1450: 지치면(opt.tired) 고개가 떨어지고 어깨가 크게 들썩이며 찬 입김을 몰아쉰다
  const pant=opt.tired&&!still()?Math.sin(B.time*0.14):0,b=still()?0:opt.tired?pant*4:Math.sin(B.time*0.035)*2,hy=cy-44+b+(opt.tired?10:0),r=34,shake=opt.roar&&!still()?Math.sin(B.time*1.3)*1.5:0;
  glow(c,cx,cy+20,170,'rgba(150,200,235,A)',0.2);   // 몸에서 도는 찬 기운
  frostMane(c,cx,hy,r);
  // 통 넓은 바지: 주름이 깊고 단이 눈에 끌린다
  const H=[[cx-60,cy+50],[cx+60,cy+50],[cx+82,cy+90],[cx+112,cy+124],[cx+22,cy+124],[cx,cy+104],[cx-22,cy+124],[cx-112,cy+124],[cx-82,cy+90]];
  sharp(c,H,HAKAMA,1,INK,2.2);
  for(const s of [-1,1])for(let i=0;i<4;i++){const x0=cx+s*(14+i*14),x1=cx+s*(30+i*22);brush(c,[[x0,cy+56],[x1,cy+122]],1.4,ROBE_LT,0.8);}
  brush(c,[[cx,cy+70],[cx,cy+104]],2,INK,0.7);
  for(let i=0;i<9;i++){const x=cx-116+i*29;blob(c,x,cy+125,14,4,SNOW,0.85);}   // 끌리는 단에 묻은 눈
  // 큰 맨발과 검은 발톱
  for(const s of [-1,1]){const fx=cx+s*66;blob(c,fx,cy+122,20,7,SKIN_DK,1);for(let k=0;k<3;k++)sharp(c,[[fx+s*(8+k*5)-2,cy+118],[fx+s*(8+k*5)+2,cy+118],[fx+s*(12+k*5),cy+127]],INK);}
  // 겉옷: 깃을 왼쪽 위로 여민다
  sharp(c,[[cx-62,cy-6],[cx+62,cy-6],[cx+60,cy+56],[cx-60,cy+56]],ROBE,1,INK,2);
  if(opt.open)chestHeart(c,cx,cy+22,1.1,'core');   // 결정 D-1450: 발악 뒤 본모습의 얼음 속 심장
  else{sharp(c,[[cx-6,cy-8],[cx+30,cy-8],[cx-2,cy+34],[cx-14,cy+20]],'#141a24',1);}
  brush(c,[[cx+30,cy-10],[cx-6,cy+46]],9,SNOW,0.97);brush(c,[[cx-30,cy-10],[cx+4,cy+30]],9,SNOW,0.97);   // 흰 깃
  if(opt.open){brush(c,[[cx+30,cy-10],[cx+20,cy+46]],9,SNOW,0.97);brush(c,[[cx-30,cy-10],[cx-20,cy+46]],9,SNOW,0.97);}
  // 띠와 매듭
  sharp(c,[[cx-62,cy+46],[cx+62,cy+46],[cx+62,cy+60],[cx-62,cy+60]],OBI,1,INK,1.6);
  brush(c,[[cx-62,cy+53],[cx+62,cy+53]],1.4,'#8a6e44',0.8);
  sharp(c,[[cx+22,cy+48],[cx+36,cy+52],[cx+30,cy+74],[cx+24,cy+72]],OBI,1,INK,1.2);
  // 빳빳한 어깨옷: 검은 바탕에 까치 깃처럼 흰 가장자리, 남빛 윤
  for(const s of [-1,1]){
    const P=[[cx+s*18,cy-18],[cx+s*136,cy-30+shake],[cx+s*128,cy-2+shake],[cx+s*48,cy+14]];
    sharp(c,P,INK,1,INK,2);
    brush(c,[[cx+s*30,cy-17],[cx+s*134,cy-28+shake]],3,SNOW,0.95);
    brush(c,[[cx+s*40,cy-6],[cx+s*124,cy-12+shake]],5,SHEEN,0.7);
    brush(c,[[cx+s*134,cy-28+shake],[cx+s*127,cy-4+shake]],3,SNOW,0.95);
    for(let i=0;i<5;i++)blob(c,cx+s*(46+i*20),cy-21-i*1.5+shake,10,3,SNOW,0.8);}   // 어깨에 앉은 눈
  for(const s of [-1,1]){sharp(c,[[cx+s*50,cy+12],[cx+s*122,cy-2],[cx+s*128,cy+60],[cx+s*84,cy+64],[cx+s*60,cy+40]],ROBE,1,INK,1.8);
    for(let i=0;i<3;i++)brush(c,[[cx+s*(70+i*16),cy+6+i*2],[cx+s*(80+i*14),cy+58]],1.2,ROBE_LT,0.8);}
  // 얼음 비늘 어깨받이: 얼음 판을 검은 끈으로 엮었다
  for(const s of [-1,1])for(let row=0;row<3;row++)for(let col=0;col<4;col++){
    const x0=cx+s*(78+col*13+row*3),y0=cy+8+row*14;
    sharp(c,[[x0,y0],[x0+s*12,y0+1],[x0+s*12,y0+13],[x0,y0+12]],row%2?FROST:ICE,0.95,FROST_DK,1);
    brush(c,[[x0+s*6,y0+2],[x0+s*6,y0+11]],1,INK,0.75);}
  // 굵은 팔과 큰 주먹 (예고 때는 주먹을 쥐고 떤다). 어깨옷 아래 넓은 소매에서 팔뚝이 나온다
  for(const s of [-1,1]){const fx=cx+s*106+(s>0?shake:-shake),fy=cy+84;
    brush(c,[[cx+s*102,cy+52],[cx+s*104,cy+66],[fx,fy-6]],26,SKIN_DK,1);
    for(let i=0;i<4;i++)brush(c,[[cx+s*(96+i*4),cy+58+i*4],[cx+s*(102+i*4),cy+63+i*4]],1.4,INK,0.5);
    sharp(c,[[fx-s*15,fy-12],[fx+s*14,fy-14],[fx+s*19,fy-2],[fx+s*16,fy+12],[fx-s*4,fy+15],[fx-s*18,fy+6]],SKIN,1,INK,2.2);
    sharp(c,[[fx-s*15,fy-12],[fx+s*14,fy-14],[fx+s*12,fy-6],[fx-s*13,fy-4]],SKIN_DK,0.8);   // 마디 그늘
    for(let k=0;k<3;k++)brush(c,[[fx-s*8+s*k*8,fy-12],[fx-s*9+s*k*8,fy+2]],1.4,INK,0.7);
    for(let k=0;k<3;k++){const kx=fx-s*8+s*k*8;sharp(c,[[kx-3,fy+10],[kx+3,fy+10],[kx+s*2,fy+21]],INK);}}
  frostBeard(c,cx,hy,r);
  sternFace(c,cx,hy,r,{roar:opt.roar});
  frostCrown(c,cx,hy,r);
  iceHorn(c,cx-r*0.08,hy-r*0.88,r,1);
  if(opt.tired)for(let i=0;i<2;i++){const k=still()?0.5:((B.time*0.03+i*0.5)%1);   // 헐떡이는 입김
    blob(c,cx+(i?18:-18)+(i?1:-1)*k*30,hy+r*0.7+k*6,6+k*14,4+k*8,'#ffffff',0.6*(1-k));}
}
/* 독수리: 날개를 내리칠 때마다 바람이 판으로 내리꽂힌다 (결정 D-761) */
function drawEagle(c,cx,cy,opt={}){
  const n=nd(),beat=n.flap>0?n.flap/26:0,down=beat?Math.sin((1-beat)*Math.PI):0;
  const idle=still()?0:Math.sin(B.time*0.06)*0.12,hy=cy-32;
  glow(c,cx,cy+20,170,'rgba(150,200,235,A)',0.18);
  for(const s of [-1,1]){
    // 날개: 쳐들었다가(beat 시작) 아래로 내리친다
    const sx=cx+s*34,sy=cy+4,lift=0.55-down*1.05+idle-(opt.tired?0.75:0),ang=s<0?Math.PI+lift:-lift;
    for(let i=0;i<10;i++){const a=ang+s*(0.3-i*0.1)*-1,len=132+i*9-(i>6?(i-6)*18:0);
      feather(c,sx,sy+i*3,len,11,a+s*(-0.05*i),i%3===0?SHEEN:INK,i>5?SNOW:null);}
    for(let i=0;i<6;i++)feather(c,sx,sy+4,74-i*6,12,ang+s*0.1*i,i%2?'#2a2420':INK,i===2?SNOW:null);   // 덮깃
    if(down>0.3){for(let i=0;i<4;i++){const wx=sx+Math.cos(ang)*(90+i*14),wy=sy+Math.sin(ang)*(90+i*14);   // 내리친 바람 줄기
      brush(c,[[wx,wy+10],[wx-s*6,wy+40+i*6],[wx-s*20,wy+70+i*8]],1.6,FROST,0.6*down);}}
  }
  // 몸통: 깃 덮인 가슴, 까치처럼 흰 배
  {const P=[[cx,cy-10]];for(const sd of [1,-1]){const side=[];for(let i=0;i<=7;i++){const y=cy+4+i*14,w=46-i*i*0.42;side.push([cx+sd*w,y],[cx+sd*(w-9),y+7]);}
      if(sd>0)P.push(...side);else P.push(...side.reverse());if(sd>0)P.push([cx+10,cy+112],[cx,cy+120],[cx-10,cy+112]);}
    sharp(c,P,'#221d1a',1,INK,2);}
  if(!opt.open){sharp(c,[[cx-18,cy+26],[cx,cy+18],[cx+18,cy+26],[cx+14,cy+92],[cx,cy+100],[cx-14,cy+92]],SNOW,0.95);
    for(let i=0;i<5;i++)for(const sd of [-1,1])sharp(c,[[cx+sd*3,cy+34+i*13],[cx+sd*13,cy+28+i*13],[cx+sd*13,cy+32+i*13],[cx+sd*3,cy+38+i*13]],INK,0.7);}
  else chestHeart(c,cx,cy+50,1,'eagle');   // 결정 D-1450: 깃 사이로 드러난 심장
  for(let i=-2;i<=2;i++)feather(c,cx+i*8,cy+100,50,7,Math.PI/2+i*0.14,INK,SNOW);
  // 굵은 발과 갈고리 발톱
  for(const s of [-1,1]){const fx=cx+s*22,fy=cy+114;brush(c,[[fx,fy-16],[fx,fy]],7,BEAK);
    for(let k=-1;k<=1;k++)brush(c,[[fx,fy],[fx+k*8+s*2,fy+9],[fx+k*11+s*3,fy+5]],3,INK);}
  // 서리 볏: 뒤로 뻗친 날 선 깃
  for(let i=0;i<14;i++){const a=Math.PI*(0.1+i/13*0.8),r0=30;sharp(c,[[cx+Math.cos(a-0.12)*r0,hy+Math.sin(a-0.12)*r0*0.8+10],[cx+Math.cos(a)*(r0+20),hy+Math.sin(a)*(r0+16)+14],[cx+Math.cos(a+0.12)*r0,hy+Math.sin(a+0.12)*r0*0.8+10]],i%3===0?SHEEN:INK,1);}   // 목둘레 깃
  for(const sd of [-1,1])for(let i=0;i<4;i++)feather(c,cx+sd*20,hy-18,40+i*8,5,(sd<0?Math.PI+0.5:-0.5)-sd*i*0.16,i%2?FROST:INK,i===3?SNOW:null);   // 뒤로 뻗친 볏
  sternFace(c,cx,hy,32,{beak:true,skin:'#b8c2c6'});
  frostCrown(c,cx,hy,32);
  iceHorn(c,cx-3,hy-29,32,1);
  if(opt.tired)pant(c,cx+6,hy+30);
}
/* 곰: 더 크고 무겁다. 앞발을 쳐들었다가 판을 가르듯 내리긋는다 (결정 D-764) */
function drawBear(c,cx,cy,opt={}){
  // 결정 D-1451: 한 손 긁기 세 번 뒤 마지막은 두 앞발을 함께 쳐들었다가 엇갈려 긋는다
  const atk=B.st==='atk'&&!opt.open,two=atk&&B.atkT>=CLAW.gap*CLAW.n,tell=two?CLAW.both.tell:CLAW.tell,ph=atk?(two?B.atkT-CLAW.gap*CLAW.n:B.atkT%CLAW.gap):99,
    raise=atk?clamp(ph/tell,0,1):0,swipe=atk&&ph>tell?Math.min(1,(ph-tell)/CLAW.strike):0,b=still()?0:Math.sin(B.time*0.05)*2,hy=cy-44+b;
  glow(c,cx,cy+30,180,'rgba(150,200,235,A)',0.15);
  // 몸: 어깨가 솟은 커다란 털 덩어리, 등에 쌓인 눈
  shape(c,[[cx-138,cy+126],[cx-134,cy+70],[cx-118,cy+18],[cx-84,cy-24],[cx-40,cy-40],[cx,cy-34],[cx+40,cy-40],[cx+84,cy-24],[cx+118,cy+18],[cx+134,cy+70],[cx+138,cy+126],[cx,cy+130]],FUR,1,INK,2.6);
  for(let i=0;i<30;i++){const x=cx-116+hash(i*2.1)*232,y=cy-10+hash(i*5.3)*128;brush(c,[[x,y],[x+3,y+14]],2,'#54463b',0.6);}
  for(let i=0;i<14;i++){const a=-Math.PI+i*Math.PI/13,x=cx+Math.cos(a)*120,y=cy+40+Math.sin(a)*66;sharp(c,[[x-4,y],[x+Math.cos(a)*10,y+Math.sin(a)*10],[x+4,y]],FUR,1);}   // 날 선 털끝
  shape(c,[[cx-92,cy-4],[cx-40,cy-26],[cx+20,cy-26],[cx+90,cy-4],[cx+40,cy+4],[cx-40,cy+4]],SNOW,0.9);
  if(!opt.open)sharp(c,[[cx-52,cy+22],[cx,cy+54],[cx+52,cy+22],[cx+42,cy+36],[cx,cy+64],[cx-42,cy+36]],SNOW,0.95,INK,1.2);   // 반달
  else chestHeart(c,cx,cy+44,1.15,'bear');   // 결정 D-1450: 털가죽 속 심장
  // 왼 앞발: 쳐들었다가 내리긋는다. 발톱이 길고 굵다
  const ax=cx-108+swipe*40,ay=cy-36-raise*24+swipe*130;
  brush(c,[[cx-84,cy+24],[cx-104,cy-4],[ax,ay]],34,FUR,1);
  blob(c,ax,ay,24,20,FUR);
  for(let k=-1;k<=1;k++)sharp(c,[[ax+k*12-4,ay+10],[ax+k*12+4,ay+10],[ax+k*15+(swipe?6:0),ay+44]],TUSK,1,INK,1.4);
  if(swipe>0&&swipe<1)for(let k=-1;k<=1;k++)brush(c,[[ax+k*14,ay-60],[ax+k*14,ay+30]],3,'#ffffff',0.5*(1-swipe));
  if(two){   // 오른 앞발도 쳐들었다가 엇갈려 내리긋는다
    const bx=cx+108-swipe*40,by=cy-36-raise*24+swipe*130;
    brush(c,[[cx+84,cy+24],[cx+104,cy-4],[bx,by]],34,FUR,1);blob(c,bx,by,24,20,FUR);
    for(let k=-1;k<=1;k++)sharp(c,[[bx+k*12-4,by+10],[bx+k*12+4,by+10],[bx+k*15-(swipe?6:0),by+44]],TUSK,1,INK,1.4);
    if(swipe>0&&swipe<1)for(let k=-1;k<=1;k++)brush(c,[[bx+k*14,by-60],[bx+k*14,by+30]],3,'#ffffff',0.5*(1-swipe));
  }else{brush(c,[[cx+88,cy+30],[cx+108,cy+100]],32,FUR,1);blob(c,cx+110,cy+108,24,14,FUR);
    for(let k=-1;k<=1;k++)sharp(c,[[cx+110+k*11-4,cy+112],[cx+110+k*11+4,cy+112],[cx+110+k*13,cy+128]],TUSK,1,INK,1.2);}
  // 낮게 숙인 머리: 작은 귀, 서리 뿔, 도깨비 눈
  for(const s of [-1,1]){blob(c,cx+s*40,hy-30,13,12,FUR);blob(c,cx+s*40,hy-29,6,5,'#54463b');}
  sternFace(c,cx,hy,42,{skin:'#4a3d34',dark:'#2c231e',bear:true,roar:atk||B.st==='tell'});
  shape(c,[[cx-30,hy-36],[cx-12,hy-46],[cx+6,hy-40],[cx+22,hy-48],[cx+30,hy-34],[cx,hy-30]],SNOW,0.95);
  iceHorn(c,cx-4,hy-36,36,1);
  if(opt.tired)pant(c,cx,hy+38);
}
/* 멧돼지: 내닫는 동안 몸은 판 위에서 사라지고 눈보라만 남는다 (결정 D-763) */
function drawBoar(c,cx,cy,opt={}){
  const gone=B.st==='atk'&&!opt.open&&B.cur&&B.cur.id==='boar',paw=B.st==='tell'&&!still()?Math.abs(Math.sin(B.time*0.36))*7:0,hy=cy+24;
  if(gone){   // 판 위에 남은 것: 박차고 나간 눈보라와 깊은 발자국 넷
    for(let i=0;i<22;i++){const a=B.time*0.05+i*0.9,r=30+hash(i)*90;blob(c,cx+Math.cos(a)*r,cy+90+Math.sin(a*1.4)*28,4+hash(i*3)*6,3+hash(i*2)*4,SNOW,0.55);}
    for(const lx of [-92,-50,50,92]){blob(c,cx+lx-4,cy+122,5,3,INK,0.6);blob(c,cx+lx+4,cy+122,5,3,INK,0.6);}
    return;}
  glow(c,cx,cy+50,170,'rgba(150,200,235,A)',0.15);
  // 낮고 넓은 몸통, 등 갈기는 싸리비 살
  sharp(c,[[cx-128,cy+120],[cx-122,cy+50],[cx-80,cy+14],[cx,cy+4],[cx+80,cy+14],[cx+122,cy+50],[cx+128,cy+120]],'#2a221d',1,INK,2.6);
  for(let i=0;i<30;i++){const x=cx-116+i*8,top=cy+16-Math.sin(i/29*Math.PI)*18;brush(c,[[x,top],[x+(i-15)*0.7,top-30-hash(i)*14]],2.2,BRISTLE,0.95);
    if(i%3===0)brush(c,[[x,top-20],[x+(i-15)*0.8,top-34-hash(i)*12]],1.2,SNOW,0.8);}
  for(let i=0;i<20;i++){const x=cx-110+hash(i*4.4)*220,y=cy+36+hash(i*1.9)*76;brush(c,[[x,y],[x+2,y+12]],1.6,'#544840',0.6);}
  // 다리와 굽: 앞굽으로 눈을 긁는다
  for(const [lx,s] of [[-96,1],[-52,0],[52,0],[96,1]]){const ly=cy+114-(s&&lx<0?paw:0);brush(c,[[cx+lx,cy+88],[cx+lx,ly]],14,'#2a221d');blob(c,cx+lx-4,ly+5,5,4,INK);blob(c,cx+lx+4,ly+5,5,4,INK);}
  if(paw)for(let i=0;i<6;i++)blob(c,cx-100+i*6,cy+120-paw*1.6*hash(i+B.time%7),3,2,SNOW,0.85);
  // 앞으로 숙인 쐐기 머리, 휘어 솟은 엄니, 얼음 뿔, 서리빛 눈
  for(const s of [-1,1])sharp(c,[[cx+s*30,hy-30],[cx+s*50,hy-50],[cx+s*42,hy-20]],'#2a221d',1,INK,1.6);
  sharp(c,[[cx-48,hy-30],[cx,hy-42],[cx+48,hy-30],[cx+34,hy+30],[cx,hy+48],[cx-34,hy+30]],'#352c26',1,INK,2.2);
  blob(c,cx,hy+46,20,12,'#4f4239');blob(c,cx-7,hy+46,3,4,INK);blob(c,cx+7,hy+46,3,4,INK);
  for(const s of [-1,1])sharp(c,[[cx+s*14,hy+40],[cx+s*36,hy+34],[cx+s*50,hy-4],[cx+s*34,hy+24],[cx+s*16,hy+32]],TUSK,1,INK,1.6);
  for(const s of [-1,1]){const ex=cx+s*20,ey=hy-10;sharp(c,[[ex-s*12,ey-6],[ex+s*10,ey-2],[ex-s*10,ey+4]],INK,0.85);glow(c,ex,ey,14,COLD,0.6);
    sharp(c,[[ex-s*9,ey-3],[ex+s*7,ey-1],[ex-s*7,ey+2]],BLUE_LT,1);brush(c,[[ex,ey-3],[ex,ey+2]],1.6,INK,0.9);}
  for(const s of [-1,1])brush(c,[[cx+s*6,hy-20],[cx+s*32,hy-28]],3,SNOW,0.95);   // 찌푸린 서리 눈썹
  iceHorn(c,cx-2,hy-34,30,1);
  if(opt.open)chestHeart(c,cx,cy+66,0.9,'boar');   // 결정 D-1450: 곤두선 갈기 밑 심장
  if(opt.tired)pant(c,cx,hy+52);
}

/* 눈도깨비 그리기: 지금 둔갑에 따라 모습이 바뀐다. 숨은 동안은 거의 보이지 않고, 수리부엉이 눈에만 윤곽이 보인다 */
let ghostCanvas=null;
/* 결정 D-1450: 둔갑 패턴이 끝나면(D-1460: 맞았어도) 그 둔갑 모습 그대로 지친다(B.st open + tired). 심장을 치면(reverted) 본모습으로 돌아와 헐떡인다.
   발악(core) 뒤에는 본모습으로 드러나 지친다 */
function shownForm(){
  const n=nd();
  if(B.st==='end')return B.result==='win'?'down':'';
  if(!B.cur||['intro','idle','bonk'].includes(B.st))return '';
  if(B.st==='open'&&n.tired&&(n.reverted||B.cur.core))return 'tired';
  if(B.cur.core)return B.st==='open'?'':'ghost';
  return B.cur.id;
}
const HEART_AT={eagle:50,bear:44,boar:66,tired:22};
/* 다른 판에 그려 alpha 만큼 옅게 얹는다. filter 가 있으면 둘레에 빛을 두른다 */
function faint(c,draw,alpha,filter){
  if(!ghostCanvas)ghostCanvas=document.createElement('canvas');
  if(ghostCanvas.width!==bcv.width||ghostCanvas.height!==bcv.height){ghostCanvas.width=bcv.width;ghostCanvas.height=bcv.height;}
  const g=ghostCanvas.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,ghostCanvas.width,ghostCanvas.height);g.setTransform(c.getTransform());
  draw(g);
  c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=alpha;if(filter)c.filter=filter;c.drawImage(ghostCanvas,0,0);c.restore();
}
function drawNundok(c){
  const cx=LW/2,cy=EY,f=shownForm(),n=nd(),tired=B.st==='open'&&n.tired,heart=tired&&!n.reverted&&!!B.mark;
  if(f==='down'){   // 진 눈도깨비: 눈 더미로 무너지고 부러진 얼음 뿔과 몽당 싸리비 한 자루가 남는다 (설화의 몽당 빗자루)
    shape(c,[[cx-130,cy+124],[cx-70,cy+80],[cx,cy+70],[cx+80,cy+86],[cx+132,cy+124]],SNOW,0.95,FROST,1.4);
    sharp(c,[[cx-70,cy+96],[cx+10,cy+92],[cx+20,cy+112],[cx-60,cy+116]],ROBE,0.9,INK,1.4);
    brush(c,[[cx+20,cy+100],[cx+60,cy+108]],4,'#6b4e33',0.95);for(let i=-3;i<=3;i++)brush(c,[[cx+60,cy+108],[cx+74,cy+106+i*3]],1.4,BRISTLE,0.9);
    sharp(c,[[cx-24,cy+86],[cx-6,cy+60],[cx-2,cy+64],[cx-12,cy+88]],ICE,0.9,FROST_DK,1.2);
    return;}
  const body=(cc)=>{
    if(f==='eagle')drawEagle(cc,cx,cy,{open:heart,tired});
    else if(f==='bear')drawBear(cc,cx,cy,{open:heart,tired});
    else if(f==='boar')drawBoar(cc,cx,cy,{open:heart,tired});
    else if(f==='tired')drawBase(cc,cx,cy,{open:heart&&B.cur.core,tired:true});
    else drawBase(cc,cx,cy,{roar:B.st==='tell'});
  };
  if(f==='ghost'){
    // 숨은 동안: 다른 판에 그려 아주 옅게 얹는다. 수리부엉이 눈이면 서리 윤곽이 또렷하다
    const owl=battleForm()==='owl';
    faint(c,body,owl?0.55:0.05,owl?'drop-shadow(0 0 6px rgba(120,190,240,.9))':null);
    // 결정 D-766·D-941: 숨은 몸을 가운데 두고 눈발이 비스듬히 기운 고리로 세차게 감아 돈다
    stormSwirl(c,cx,cy+30,150,60,14,1);
  }else if(n.veiled){
    // 결정 D-1456: 수리부엉이 눈이 아니면 밖에서처럼 눈보라에 싸인다. 드러난 심장의 푸른 빛만은 눈보라를 뚫고 보인다
    // 결정 D-1459: 몸은 아예 보이지 않고(nundok_veil_body 0), 그 자리에 눈보라만 휘몰아친다. 공격은 반투명하게 보인다(bulletAlpha)
    //   (사용자 피드백 2026-11-11 9). 예전엔 몸이 0.16만큼 비쳤다
    if(veilBody()>0)faint(c,body,veilBody());
    stormSwirl(c,cx,cy+30,150,70,16,1);
    if(heart){const form=f==='tired'?'core':f;chestHeart(c,cx,cy+HEART_AT[f==='tired'?'tired':f],1,form);}
  }else body(c);
  // 둔갑이 바뀌는 순간 눈보라가 확 인다
  if(f!==n.shown){n.shown=f;n.swap=22;}
  if(n.swap>0){const k=1-n.swap/22;for(let i=0;i<16;i++){const a=i/16*Math.PI*2+hash(i)*0.4,r=30+k*120;blob(c,cx+Math.cos(a)*r,cy+40+Math.sin(a)*r*0.7,8*(1-k)+3,6*(1-k)+2,SNOW,0.85*(1-k));}}
}

/* ---------- 배경: 그믐밤 상단 창고, 열린 문으로 눈보라가 든다 ---------- */
function drawStoreRoom(c){
  const t=B.time,still0=still(),gy=BOX.y-52,WOOD='rgba(110,82,58,',f=shownForm();
  c.save();c.fillStyle='rgba(40,52,70,.22)';c.fillRect(0,0,LW,LH);c.restore();
  c.save();c.fillStyle=WOOD+'.12)';c.fillRect(0,0,LW,gy);c.restore();
  for(let x=18;x<LW;x+=38)brush(c,[[x,0],[x+(hash(x)*4-2),gy]],1.3,INK,0.15+hash(x*0.3)*0.08);
  brush(c,[[0,30],[LW,24]],10,'#4a3a2c',0.55);brush(c,[[0,30],[LW,24]],2,INK,0.5);
  for(let x=20;x<LW;x+=26)sharp(c,[[x,32],[x+6,32],[x+3,40+hash(x)*10]],ICE,0.8);   // 대들보 고드름
  for(const x of [LW*0.04,LW*0.96])brush(c,[[x,0],[x,gy]],9,'#4a3a2c',0.45);
  // 등불
  {const lx=LW*0.3,ly=64,fl=still0?1:1+Math.sin(t*0.19)*0.05+Math.sin(t*0.47)*0.04;
    const g=c.createRadialGradient(lx,ly,4,lx,ly,LW*0.28*fl);g.addColorStop(0,'rgba(236,178,92,.38)');g.addColorStop(0.45,'rgba(220,150,80,.12)');g.addColorStop(1,'rgba(220,150,80,0)');
    c.save();c.fillStyle=g;c.fillRect(0,0,LW,LH);c.restore();
    brush(c,[[lx,28],[lx,ly-18]],1.5,INK,0.6);blob(c,lx,ly,14,18,RED,0.75);blob(c,lx,ly,7,11,'#f2b04a',0.75);
    brush(c,[[lx-12,ly-16],[lx+12,ly-16]],3,INK,0.7);brush(c,[[lx-12,ly+16],[lx+12,ly+16]],3,INK,0.7);}
  // 오른쪽: 열린 창고 문 밖 눈밤
  {const dx=LW*0.84,dw=LW*0.11;c.save();c.fillStyle='rgba(30,40,62,.55)';c.fillRect(dx,gy-120,dw,120);c.restore();
    brush(c,[[dx,gy],[dx,gy-122],[dx+dw,gy-122],[dx+dw,gy]],4,'#4a3a2c',0.7);
    for(let i=0;i<12;i++){const sx=dx+hash(i*1.7)*dw,sy=gy-120+((still0?hash(i)*120:(t*0.8+i*29)%120));blob(c,sx,sy,1.6,1.6,SNOW,0.9);}
    shape(c,[[dx-30,gy],[dx+dw*0.2,gy-14],[dx+dw,gy-8],[dx+dw+6,gy]],SNOW,0.85);}
  c.save();c.fillStyle=WOOD+'.11)';c.fillRect(0,gy,LW,LH-gy);c.restore();
  brush(c,[[0,gy],[LW,gy+2]],4,INK,0.5);
  // 설 대목 짐: 쌀가마와 보자기 짐 (몇 자루는 비었다)
  const sack=(x,y,w,h,empty)=>{c.save();c.fillStyle=empty?'rgba(196,176,136,.14)':'rgba(196,176,136,.3)';c.beginPath();c.ellipse(x,y-h/2,w/2,h/2,0,0,Math.PI*2);c.fill();c.restore();
    c.save();c.strokeStyle=INK;c.globalAlpha=empty?0.25:0.45;c.lineWidth=2;c.beginPath();c.ellipse(x,y-h/2,w/2,h/2,0,0,Math.PI*2);c.stroke();c.restore();};
  sack(LW*0.07,gy,50,36,true);sack(LW*0.14,gy,54,40,false);sack(LW*0.105,gy-32,44,30,true);
  sack(LW*0.7,gy,54,40,false);sack(LW*0.77,gy,48,26,true);
  // 바닥 눈 위에 찍힌 큰 맨발 자국과 그 곁을 쓸고 간 옷자락 자국 (결정 D-760·D-766)
  for(let i=0;i<5;i++){const x=LW*0.55+i*30,y=gy+8+(i%2)*6;blob(c,x,y,7,3,FROST_DK,0.4);for(let k=0;k<3;k++)blob(c,x+6+k*3,y-3+k*2,1.6,1.4,FROST_DK,0.45);brush(c,[[x-8,gy+16],[x+22,gy+18]],1,FROST_DK,0.25);}
  // 숨은 동안 창고 안에 눈보라
  if(f==='ghost'&&B.st!=='open'){c.save();c.fillStyle='rgba(230,240,248,.24)';c.fillRect(0,0,LW,LH);c.restore();
    // 결정 D-941: 창고 안 눈보라가 숨은 눈도깨비를 가운데 두고 비스듬히 기운 큰 고리로 휘몰아친다 (예전 D-877: 판 전체에 아래로 사선)
    stormSwirl(c,LW/2,EY+30,Math.hypot(LW,LH)*0.62,130,22,0.9);}   // 결정 D-766: 숨으면 창고 안 눈보라가 세차다
  else if(f!=='down'&&nd().veiled){c.save();c.fillStyle='rgba(230,240,248,.12)';c.fillRect(0,0,LW,LH);c.restore();   // 결정 D-1456: 눈보라에 싸인 동안 창고 안도 뿌옇다
    stormSwirl(c,LW/2,EY+30,Math.hypot(LW,LH)*0.5,70,12,0.5);}
}


/* ---------- 공격 ---------- */
// 독수리 (결정 D-761): 날개를 내리칠 때마다 판 바닥에서 소용돌이가 일어 하늘로 커지며 떠돈다
// 결정 D-878: 소용돌이가 좌우로 판을 오간다(speed) (사용자 지시 2026-11-06 네 번째 묶음). 좌우 빠르기는 가장 느린 손(산양 2.2)보다 느리다.
//   손 가까이에서는 일지 않는다(clear). 그때 줄인 키(2/3)는 아래 D-942 가 다시 줄였다.
// 결정 D-942: 소용돌이 키를 판 높이의 0.4로 낮추고, 바닥에서 이는 것(아래 칸)과 공중에서 도는 것(위 칸)을 번갈아 띄운다
//   (사용자 지시 2026-11-06 "회오리 경로가 너무 경직, 높이를 줄이고 위치를 바꿔 위아래로 움직이며 피하게").
//   첫 소용돌이는 손이 있는 칸에 일어 손을 다른 칸으로 옮기게 하고, 다음 것은 다른 칸에 인다. 위 칸 소용돌이는 판 위쪽(highTop)에서
//   아래로 늘어진다. 두 칸 사이(gapBand)는 늘 비어 지나갈 틈이 있다. 좌우로는 옛 빠르기 그대로 오가며 위아래로 조금 출렁인다(bob).
// 결정 D-1453: 태풍처럼 기운 깔때기. 위로 갈수록 넓고 가는 쪽(lean)으로 기울며, 꼭대기에서 나선 눈구름 띠가 돈다(허리케인의 나선 띠).
//   꼭대기 띠에서 눈뭉치(ndFlurry)가 flurry 프레임마다 비스듬히 흩뿌려진다 (사용자 지시 2026-11-11 큰 장터 6 독수리)
const TWIST={gap:62,n:3,grow:40,life:190,fade:22,arm:16,tall:0.42,wide:32,speed:1.15,clear:56,highTop:0.06,bob:6,lean:0.55,turn:0.04,
  flurry:58,flurrySpeed:1.5,flurryFall:0.42,flurryR:7};
// 곰 (결정 D-764): 굵고 빠른 발톱 세 줄
// 결정 D-1451: 곰은 심장이 거의 안 나왔다. 예고가 24틀이라 너구리 손(2.7px/틀)으로는 반응한 뒤 62px 너비의 세 줄 밖으로 못 빠져나가
//   늘 맞았고, 한 대라도 맞으면 지치지 않았다(D-940 nundok_gloat_hits, D-1460으로 지웠다). 예고를 36틀로 늘리고 판정 반지름을 10으로 줄였다.
//   한 손 긁기 세 번 뒤 마지막으로 두 앞발을 엇갈려 긋는다(both: X 자 여섯 줄, 예고 46틀) (사용자 지시 2026-11-11 큰 장터 6 곰)
const CLAW={gap:52,tell:36,strike:5,stay:16,len:230,sep:20,n:3,hit:10,both:{tell:46,a:0.62}};
// 멧돼지 (결정 D-763): 발자국만 어지러운 길을 따라 찍힌다
// 결정 D-879: 발자국 사이(step)를 17에서 54로 벌려 수를 1/3로 줄이고(한 번 내닫는 동안 약 47 → 15), 찍힐 때마다 쿵 하고 판이 울린다
//   (quake·눈먼지 고리·얼음 금, 두 걸음에 한 번 nd_stomp 소리) (사용자 지시 2026-11-06 "멧돼지 발바닥 수는 줄이고 좀 더 위협적으로 땅을 울리는 듯하게")
// 결정 D-1452: 무거운 것이 내달리면 땅이 울린다. 몸 판정을 15에서 20으로 넓히고, 두 걸음에 한 번 내리찍는 발에서 땅을 타고
//   충격파(wave)가 퍼진다. 퍼지는 고리 띠(band)에 닿으면 맞는다. 판도 더 크게 흔들린다 (사용자 지시 2026-11-11 큰 장터 6 멧돼지)
const RUSH={gap:150,tell:42,run:130,hitR:20,step:54,n:2,turns:4,quake:7,quakeHeavy:11,ring:18,scale:1.4,wave:36,waveT:18,band:5};
// 발악: 보이지 않는 빙산
// 결정 D-880: 맨눈에는 눈보라에 감싸인 반투명 빙산(veil), 수리부엉이 눈에는 burst 프레임 만에 peak 보다 over 배 치솟았다 서는 빙산
//   (사용자 지시 2026-11-06 "잘 안 보일때는 눈보라에 휩싸여 반투명하게. 수리부엉이 폼으로 볼때는 빙산이 확 솟아나게"). 맞는 자리와 때는 그대로다
const BERG={gap:30,tell:36,rise:9,hold:22,fall:14,r:19,n:6,h:46,veil:0.38,burst:5,peak:60,over:1.22,quake:4,quakeOwl:9};
/* 결정 D-942: 아래 칸은 바닥에서 위로 자란다. 위 칸은 판 위쪽에 넓은 끝을 걸고 좁은 끝(base)이 아래로 늘어진다.
   그래서 둘 다 'base 에서 위로 H' 꼴로 같은 그리기·판정을 쓴다 */
function twistGeom(b){
  const g=Math.min(1,b.t/TWIST.grow),ease=1-(1-g)*(1-g),H=BOX.h*TWIST.tall*ease,f=Math.max(0,Math.min(1,(b.life-b.t)/TWIST.fade));
  const sway=u=>still()?0:Math.sin(b.t*0.07+u*3.2+b.seed)*8*u;
  const width=u=>(5+TWIST.wide*Math.pow(u,1.3))*(0.5+0.5*ease);
  const bob=still()?0:Math.sin(b.t*0.045+b.seed)*TWIST.bob;
  const base=b.high?BOX.y+BOX.h*TWIST.highTop+H+bob:BOX.y+BOX.h-6+Math.min(0,bob);
  const axis=u=>b.x+sway(u)+(b.lean||0)*u*H;   // 결정 D-1453: 위로 갈수록 가는 쪽으로 기운다
  return {H,f,sway,width,base,axis};
}
function drawTwist(c,b,mul=1){
  const {H,f,width,base,axis}=twistGeom(b);if(H<4)return;
  const rot=still()?b.seed:b.t*0.24+b.seed,a=f*mul,dir=Math.sign(b.lean||1);
  const L=[],R=[];for(let i=0;i<=12;i++){const u=i/12,y=base-u*H,x=axis(u),w=width(u);L.push([x-w,y]);R.push([x+w,y]);}
  sharp(c,L.concat(R.reverse()),'rgba(214,235,242,1)',0.22*a);
  c.save();c.lineCap='round';
  for(let i=0;i<=16;i++){const u=i/16,y=base-u*H,x=axis(u),w=width(u),ry=w*0.22+1;
    c.globalAlpha=0.32*a;c.strokeStyle=FROST;c.lineWidth=1.2;c.beginPath();c.ellipse(x,y,w,ry,0,Math.PI,Math.PI*2);c.stroke();   // 뒤쪽 호
    const s=rot*(1+u*0.6)+i*0.7;c.globalAlpha=(0.55+0.35*u)*a;c.strokeStyle=i%3?FROST_DK:INK;c.lineWidth=1.3+u*1.8;
    c.beginPath();c.ellipse(x,y,w,ry,0,s,s+2.3);c.stroke();}   // 감아 도는 앞쪽 호
  // 결정 D-1453: 꼭대기의 나선 눈구름 띠. 납작한 원반 위로 팔 셋이 감겨 돌며, 기운 쪽으로 더 길게 끌린다 (허리케인의 나선 띠)
  {const tx=axis(1),ty=base-H,W0=width(1);
    for(let j=0;j<3;j++){const pts=[];for(let q=0;q<=14;q++){const r=W0*(0.35+q*0.1),ang=rot*0.8+j*Math.PI*2/3+q*0.34;
        pts.push([tx+Math.cos(ang)*r*(1+0.25*dir*Math.cos(ang)),ty+Math.sin(ang)*r*0.26]);}
      brush(c,pts,3.2,SNOW,0.75*a);brush(c,pts,1.2,FROST_DK,0.45*a);}
    blob(c,tx,ty,W0*0.32,W0*0.1,'#e8f2f6',0.5*a);}   // 가운데 눈
  c.restore();
  // 감겨 오르는 눈발과 깃털, 나선 띠를 따라 도는 눈보라
  for(let k=0;k<30;k++){const u=(hash(k*3.3)+b.t*0.011*(0.6+hash(k)))%1,y=base-u*H,ang=b.t*0.3*(0.8+hash(k*2))+k*1.3,w=width(u);
    const front=Math.sin(ang)>0;blob(c,axis(u)+Math.cos(ang)*w,y+Math.sin(ang)*w*0.22,front?2.4:1.6,front?2:1.4,SNOW,(front?0.95:0.5)*a);}
  for(let k=0;k<14;k++){const ang=b.t*0.12+k*0.45,r=width(1)*(0.6+(k%5)*0.22);blob(c,axis(1)+Math.cos(ang)*r*(1+0.25*dir*Math.cos(ang)),base-H+Math.sin(ang)*r*0.26,2,1.6,SNOW,0.85*a);}
  for(let k=0;k<3;k++){const u=(hash(k*9.1)+b.t*0.008)%1,ang=b.t*0.26+k*2.1,w=width(u);feather(c,axis(u)+Math.cos(ang)*w,base-u*H,15,3.6,ang,k%2?SHEEN:INK,SNOW,a);}
  // 비스듬히 휘날리는 눈줄기: 기운 쪽으로 끌린다
  for(let k=0;k<6;k++){const u=0.3+hash(k*4.7)*0.7,y=base-u*H,x=axis(u)+width(u)*(hash(k*2.9)-0.5)*1.6,len=12+hash(k)*10;
    brush(c,[[x,y],[x+dir*len,y-len*0.35]],1.2,SNOW,0.6*a);}
  // 바닥에서 튀는 눈 (아래 칸만). 위 칸은 늘어진 끝에서 눈가루가 흩날린다
  if(!b.high)for(let k=0;k<7;k++){const q=b.t*0.2+k*0.9;blob(c,axis(0)+Math.cos(q)*(10+k*3),base+2-Math.abs(Math.sin(q))*6,4,2.6,SNOW,0.8*a);}
  else for(let k=0;k<5;k++){const q=(b.t*0.02+hash(k*2.1))%1;blob(c,axis(0)+(hash(k*3.7)-0.5)*14,base+q*16,2,1.6,SNOW,0.7*a*(1-q));}
}
defineAttacks({
  ndWind:{dur:TWIST.gap*(TWIST.n-1)+TWIST.life,tick(t,X,Y,W,H){
    if(t%TWIST.gap||t/TWIST.gap>=TWIST.n)return;
    const i=t/TWIST.gap;let x,n=0;
    // 결정 D-942: 첫 소용돌이는 손이 있는 칸(위·아래)에, 다음부터는 칸을 번갈아. 손 바로 곁에서는 일지 않는다
    const nd0=nd();if(i===0)nd0.twistHigh=B.py<Y+H*0.5;else nd0.twistHigh=!nd0.twistHigh;
    do{x=i===0?clamp(B.px+(Math.random()<0.5?-1:1)*(60+Math.random()*30),X+30,X+W-30):X+30+Math.random()*(W-60);n++;}while(n<12&&Math.abs(x-B.px)<TWIST.clear);
    const dir=altDir('ndWind')?1:-1;   // 결정 D-878: 번갈아 왼쪽·오른쪽으로 쓸고 가다 벽에서 튕긴다
    B.bullets.push({k:'ndTwist',x,high:nd0.twistHigh,vx:dir*TWIST.speed*(0.9+Math.random()*0.2),lean:dir*TWIST.lean,t:0,life:TWIST.life,seed:Math.random()*6});
    nd().flap=26;}},
  ndClaw:{dur:CLAW.gap*CLAW.n+CLAW.both.tell+CLAW.strike+CLAW.stay+2,tick(t,X,Y,W,H){
    if(t%CLAW.gap||t/CLAW.gap>CLAW.n)return;
    const x=clamp(B.px+(Math.random()-0.5)*30,X+30,X+W-30),y=clamp(B.py+(Math.random()-0.5)*24,Y+24,Y+H-24);
    if(t/CLAW.gap===CLAW.n){B.bullets.push({k:'ndClaw',x,y,t:0,a:CLAW.both.a,both:true});return;}   // 결정 D-1451: 마지막은 두 앞발 엇갈려 긋기
    const s=altDir('ndClaw')?1:-1,a=s*(0.45+Math.random()*0.5);
    B.bullets.push({k:'ndClaw',x,y,t:0,a});}},
  ndRush:{dur:RUSH.gap*(RUSH.n-1)+RUSH.tell+RUSH.run+10,tick(t,X,Y,W,H){
    if(t%RUSH.gap||t/RUSH.gap>=RUSH.n)return;
    B.bullets.push({k:'ndRush',P:boarPath(X,Y,W,H,t===0),t:0,next:0,foot:0});}},
  ndBerg:{dur:BERG.gap*(BERG.n-1)+BERG.tell+BERG.rise+BERG.hold+BERG.fall+4,tick(t,X,Y,W,H){
    if(t%BERG.gap||t/BERG.gap>=BERG.n)return;
    const x=clamp(B.px+(Math.random()-0.5)*16,X+BERG.r,X+W-BERG.r),y=clamp(B.py+(Math.random()-0.5)*12+8,Y+BERG.r+20,Y+H-6);
    B.bullets.push({k:'ndBerg',x,y,t:0,seed:Math.random()*9});}},
});
/* 발톱 세 줄의 선분 (상자 안에서 길게) */
function clawLines(b){
  const set=a=>{const ca=Math.cos(a),sa=Math.sin(a),px=-sa,py=ca,L=CLAW.len/2;
    return [-1,0,1].map(j=>{const ox=b.x+px*CLAW.sep*j,oy=b.y+py*CLAW.sep*j;return [[ox-ca*L,oy-sa*L],[ox+ca*L,oy+sa*L]];});};
  return b.both?set(b.a).concat(set(-b.a)):set(b.a);   // 결정 D-1451: 두 앞발은 X 자로 엇갈린다
}
/* 양끝이 뾰족하고 가운데가 굵은 찢긴 자국 */
function gash(c,p0,p1,w,col,alpha){
  const dx=p1[0]-p0[0],dy=p1[1]-p0[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,at=(k,o)=>[p0[0]+dx*k+nx*o,p0[1]+dy*k+ny*o];
  sharp(c,[p0,at(0.18,w*0.38),at(0.45,w*0.5),at(0.75,w*0.36),p1,at(0.72,-w*0.3),at(0.4,-w*0.48),at(0.15,-w*0.32)],col,alpha);
}
function segDist(x,y,[[x1,y1],[x2,y2]],k=1){
  const ex=x1+(x2-x1)*k,ey=y1+(y2-y1)*k,dx=ex-x1,dy=ey-y1,q=clamp(((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy||1),0,1);
  return Math.hypot(x-x1-q*dx,y-y1-q*dy);
}
/* 멧돼지가 날뛰는 길: 판 밖에서 뛰어들어 판 안을 몇 번 꺾어 달리고 다시 판 밖으로. 첫 길은 손 자리를 지난다 */
function boarPath(X,Y,W,H,first){
  const m=18,rnd=i=>[X+m+Math.random()*(W-2*m),i%2?Y+m+Math.random()*H*0.3:Y+H-m-Math.random()*H*0.3];
  const side=altDir('ndRush')?1:-1;let p=[side>0?X-30:X+W+30,Y+m+Math.random()*(H-2*m)];const pts=[p];
  for(let i=0;i<RUSH.turns;i++){let q,n=0;
    do{q=first&&i===1?[clamp(B.px,X+m,X+W-m),clamp(B.py,Y+m,Y+H-m)]:rnd(i+(side>0?0:1));n++;}
    while(n<24&&!(first&&i===1)&&(Math.hypot(q[0]-p[0],q[1]-p[1])<100||(pts.length>1&&Math.abs(Math.atan2(q[1]-p[1],q[0]-p[0])-Math.atan2(p[1]-pts[pts.length-2][1],p[0]-pts[pts.length-2][0]))<0.5)));
    pts.push(q);p=q;}
  pts.push([p[0]<X+W/2?X+W+30:X-30,Y+m+Math.random()*(H-2*m)]);
  const acc=[0];for(let i=1;i<pts.length;i++)acc.push(acc[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  return {pts,acc,len:acc[acc.length-1]};
}
function pathAt(P,d){
  let i=1;while(i<P.pts.length-1&&P.acc[i]<d)i++;
  const a=P.pts[i-1],b=P.pts[i],seg=P.acc[i]-P.acc[i-1]||1,k=clamp((d-P.acc[i-1])/seg,0,1);
  return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,Math.atan2(b[1]-a[1],b[0]-a[0])];
}
/* 갈라진 멧돼지 발굽 자국 하나 */
function hoof(c,x,y,a,alpha){
  c.save();c.translate(x,y);c.rotate(a);c.scale(RUSH.scale,RUSH.scale);c.globalAlpha=alpha;   // 결정 D-879: 깊고 큰 발자국
  c.fillStyle='rgba(239,244,248,.9)';c.beginPath();c.ellipse(-1,0,7,6,0,0,Math.PI*2);c.fill();   // 파인 눈
  c.fillStyle=INK;for(const s of [-1,1]){c.beginPath();c.ellipse(1.5,s*2.6,4.4,2,s*0.15,0,Math.PI*2);c.fill();}
  c.globalAlpha=alpha*0.6;for(const s of [-1,1]){c.beginPath();c.ellipse(-4.5,s*3.4,1.4,1,0,0,Math.PI*2);c.fill();}   // 며느리발톱
  c.restore();
}
defineBullets({
  ndTwist:{
    step(b){b.t++;if(b.t>b.life){b.dead=1;return;}
      const {H,f,width,base,axis}=twistGeom(b),w0=width(0.5);
      b.x+=b.vx+(still()?0:Math.sin(b.t*0.03+b.seed)*0.35);
      if((b.x<BOX.x+w0*0.6&&b.vx<0)||(b.x>BOX.x+BOX.w-w0*0.6&&b.vx>0))b.vx*=-1;
      b.lean+=(Math.sign(b.vx)*TWIST.lean-b.lean)*TWIST.turn;   // 벽에서 튕기면 기울기도 천천히 돌아선다
      if(b.t>TWIST.arm&&f>0.4){const u=(base-B.py)/H;if(u>=0&&u<=1&&Math.abs(B.px-axis(u))<width(u)*0.75+2)bHitMe();}
      // 결정 D-1453: 꼭대기 나선 띠에서 눈뭉치가 기운 쪽으로 비스듬히 흩뿌려진다
      if(b.t>TWIST.arm+10&&f>0.6&&b.t%TWIST.flurry===0){const tx=axis(1),side=Math.sign(b.lean||1);
        B.bullets.push({k:'ndFlurry',x:tx+side*width(1)*0.8,y:base-H+4,vx:side*TWIST.flurrySpeed*(0.8+Math.random()*0.4),vy:TWIST.flurryFall,t:0,seed:Math.random()*6});}},
    draw(c,b){drawTwist(c,b);}},
  ndFlurry:{
    step(b,X1,X2,Y1,Y2){b.t++;b.x+=b.vx;b.y+=b.vy;b.vy+=0.004;
      if(b.x<X1-10||b.x>X2+10||b.y>Y2+6){b.dead=1;return;}
      if(b.y>Y1&&Math.hypot(B.px-b.x,B.py-b.y)<TWIST.flurryR+2)bHitMe();},
    draw(c,b){const ang=Math.atan2(b.vy,b.vx);
      for(let i=1;i<6;i++)blob(c,b.x-Math.cos(ang)*i*4,b.y-Math.sin(ang)*i*4,TWIST.flurryR*(1-i*0.15),TWIST.flurryR*0.7*(1-i*0.15),SNOW,0.55-i*0.09);   // 눈보라 꼬리
      blob(c,b.x,b.y,TWIST.flurryR,TWIST.flurryR*0.85,SNOW,0.97);blob(c,b.x+1.5,b.y+1.5,TWIST.flurryR*0.6,TWIST.flurryR*0.5,FROST,0.6);
      c.save();c.strokeStyle=FROST_DK;c.globalAlpha=0.8;c.lineWidth=1.2;c.beginPath();c.arc(b.x,b.y,TWIST.flurryR,0,Math.PI*2);c.stroke();c.restore();}},
  ndClaw:{
    step(b){b.t++;const s=b.t-(b.both?CLAW.both.tell:CLAW.tell);
      if(s===1&&!still())B.quakeT=Math.max(B.quakeT||0,b.both?12:8);
      if(s>0&&s<=CLAW.strike){const k=s/CLAW.strike;if(clawLines(b).some(l=>segDist(B.px,B.py,l,k)<CLAW.hit))bHitMe();}
      if(s===CLAW.strike)nd().scars.push({lines:clawLines(b),t:0});
      if(s>CLAW.strike+CLAW.stay)b.dead=1;},
    draw(c,b){const s=b.t-(b.both?CLAW.both.tell:CLAW.tell),L=clawLines(b);
      if(s<=0){const blink=0.4+0.4*(Math.floor(b.t/3)%2);for(const l of L){c.save();c.setLineDash([9,5]);c.strokeStyle=RED;c.globalAlpha=blink;c.lineWidth=3.5;c.lineCap='round';c.beginPath();c.moveTo(...l[0]);c.lineTo(...l[1]);c.stroke();c.restore();}return;}
      const k=Math.min(1,s/CLAW.strike),fade=s>CLAW.strike?1-(s-CLAW.strike)/CLAW.stay:1;
      for(const l of L){const ex=l[0][0]+(l[1][0]-l[0][0])*k,ey=l[0][1]+(l[1][1]-l[0][1])*k;
        gash(c,l[0],[ex,ey],18,INK,0.92*fade);gash(c,[l[0][0]+(ex-l[0][0])*0.12,l[0][1]+(ey-l[0][1])*0.12],[ex-(ex-l[0][0])*0.1,ey-(ey-l[0][1])*0.1],5,'#ffffff',0.6*fade);
        if(s<=CLAW.strike+2)for(let i=0;i<5;i++)blob(c,ex+(Math.random()-0.5)*18,ey+(Math.random()-0.5)*18,4,3,SNOW,0.95);}}},
  ndRush:{
    step(b){b.t++;const s=b.t-RUSH.tell,P=b.P;
      if(s>0&&s<=RUSH.run){const d=P.len*s/RUSH.run,[x,y,a]=pathAt(P,d);b.hx=x;b.hy=y;b.ha=a;
        while(b.next<=d){const [px,py,pa]=pathAt(P,b.next),o=b.foot?5:-5;
          if(px>BOX.x-6&&px<BOX.x+BOX.w+6){nd().prints.push({x:px-Math.sin(pa)*o,y:py+Math.cos(pa)*o,a:pa,t:0,seed:Math.random()*6});
            if(!b.foot){Sound.playSfx('nd_stomp');nd().waves.push({x:px,y:py,t:0,hit:false,seed:Math.random()*6});}   // 결정 D-1452: 내리찍는 발에서 충격파
            if(!still())B.quakeT=Math.max(B.quakeT||0,b.foot?RUSH.quake:RUSH.quakeHeavy);}   // 결정 D-879: 찍힐 때마다 쿵
          b.next+=RUSH.step;b.foot^=1;}
        if(Math.hypot(B.px-x,B.py-y)<RUSH.hitR)bHitMe();}
      if(s>RUSH.run+8)b.dead=1;},
    draw(c,b){const s=b.t-RUSH.tell,P=b.P;
      // 예고: 날뛸 길이 붉은 점선으로 먼저 그어진다. 달리는 동안 남은 길은 옅게 남는다
      const from=s>0?P.len*Math.min(1,s/RUSH.run):0,to=s>0?P.len:P.len*Math.min(1,b.t/(RUSH.tell*0.7));
      if(to>from){c.save();c.setLineDash([8,6]);c.strokeStyle=RED;c.lineWidth=3.2;c.lineCap='round';
        c.globalAlpha=s>0?0.3:0.45+0.3*(Math.floor(b.t/5)%2);c.beginPath();
        const [x0,y0]=pathAt(P,from);c.moveTo(x0,y0);for(let i=1;i<P.pts.length;i++)if(P.acc[i]>from&&P.acc[i-1]<to){const [x,y]=P.acc[i]<=to?P.pts[i]:pathAt(P,to);c.lineTo(x,y);}
        c.stroke();c.restore();}
      if(s<=0||s>RUSH.run)return;
      // 보이지 않는 멧돼지: 박차는 눈보라만 일어난다
      const x=b.hx,y=b.hy,a=b.ha;
      for(let i=0;i<9;i++){const q=i*0.7+b.t*0.5;blob(c,x-Math.cos(a)*(6+i*4)+Math.cos(q)*5,y-Math.sin(a)*(6+i*4)+Math.sin(q)*5,6-i*0.5,4-i*0.3,SNOW,0.9-i*0.08);}
      brush(c,[[x-Math.cos(a)*40,y-Math.sin(a)*40],[x,y]],3,FROST_DK,0.45);}},
  ndBerg:{
    step(b){b.t++;const s=b.t-BERG.tell;
      if(s===1){Sound.playSfx('nd_berg');if(!still())B.quakeT=Math.max(B.quakeT||0,battleForm()==='owl'?BERG.quakeOwl:BERG.quake);}   // 결정 D-880
      if(s>0&&s<=BERG.rise+BERG.hold&&Math.hypot(B.px-b.x,B.py-(b.y-BERG.h*0.35))<BERG.r+4)bHitMe();
      if(s>BERG.rise+BERG.hold+BERG.fall)b.dead=1;},
    draw(c,b){const seen=battleForm()==='owl',s=b.t-BERG.tell,x=b.x,y=b.y,r=BERG.r;
      if(s<=0){const k=b.t/BERG.tell;
        if(!seen){   // 결정 D-880: 맨눈에는 솟기 직전 그 자리로 눈보라가 몰려 감긴다 (금은 안 보인다)
          if(k<0.55)return;const q=(k-0.55)/0.45;
          for(let i=0;i<10;i++){const a=b.seed+i*0.63+b.t*0.22,d=r*(1.5-q*0.8)+hash(i)*6;blob(c,x+Math.cos(a)*d,y-6+Math.sin(a)*d*0.45,2.4,1.8,SNOW,0.35+0.4*q);}
          return;}
        // 수리부엉이 눈에만 솟을 자리의 금이 보인다
        c.save();c.strokeStyle=BLUE;c.globalAlpha=0.3+0.5*k;c.lineWidth=2;c.setLineDash([4,4]);c.beginPath();c.ellipse(x,y,r,r*0.45,0,0,Math.PI*2);c.stroke();c.restore();
        for(let i=0;i<5;i++){const a=b.seed+i*1.26;brush(c,[[x,y],[x+Math.cos(a)*r*k,y+Math.sin(a)*r*0.45*k]],1.4,BLUE_LT,0.8);}
        return;}
      const fallK=s>BERG.rise+BERG.hold?(s-BERG.rise-BERG.hold)/BERG.fall:0;
      let h;
      if(seen){   // 결정 D-880: 수리부엉이 눈에는 빙산이 땅을 찢고 확 솟는다. 위로 치솟았다가 살짝 가라앉아 선다
        const up=BERG.burst,peak=BERG.peak;
        h=s<=up?peak*BERG.over*(1-Math.pow(1-s/up,3)):s<=up+5?peak*(BERG.over-(BERG.over-1)*(s-up)/5):peak;
        if(fallK)h=peak*(1-fallK);
      }else h=(s<=BERG.rise?BERG.h*s/BERG.rise:BERG.h)*(1-fallK);
      const a=seen?1:BERG.veil,spike=(ox,w,hh,col,al)=>sharp(c,[[x+ox-w,y],[x+ox-w*0.35,y-hh*0.6],[x+ox,y-hh],[x+ox+w*0.4,y-hh*0.55],[x+ox+w,y]],col,al,FROST_DK,1.6);
      if(seen){spike(-r*0.75,r*0.5,h*0.62,ICE,a);spike(r*0.8,r*0.45,h*0.5,ICE,a);}   // 곁 송곳
      sharp(c,[[x-r,y],[x-r*0.6,y-h*0.55],[x-r*0.25,y-h*0.7],[x,y-h],[x+r*0.3,y-h*0.62],[x+r*0.7,y-h*0.4],[x+r,y]],ICE,a,FROST_DK,1.8);
      sharp(c,[[x-r*0.2,y],[x-r*0.1,y-h*0.6],[x,y-h],[x+r*0.12,y-h*0.5],[x+r*0.25,y]],'#ffffff',a*0.6);
      if(seen){
        if(s<=BERG.burst+8){const k=s/(BERG.burst+8);   // 갈라진 땅에서 얼음 조각과 눈이 튄다
          for(let i=0;i<9;i++){const q=b.seed+i*0.7,d=r*0.6+k*36;sharp(c,[[x+Math.cos(q)*d,y-Math.abs(Math.sin(q))*k*30-4],[x+Math.cos(q)*d+3,y-Math.abs(Math.sin(q))*k*30-10],[x+Math.cos(q)*d+5,y-Math.abs(Math.sin(q))*k*30-3]],ICE,1-k,FROST_DK,1);}
          for(let i=0;i<10;i++){const q=i/10*Math.PI*2+b.seed;blob(c,x+Math.cos(q)*(r+k*30),y+Math.sin(q)*6-k*6,4.4,3,SNOW,0.95*(1-k));}}
        for(let i=0;i<6;i++){const a2=b.seed+i*1.05;brush(c,[[x+Math.cos(a2)*r*0.9,y+Math.sin(a2)*4],[x+Math.cos(a2)*(r+14),y+Math.sin(a2)*8]],1.4,FROST_DK,0.7*(1-fallK));}   // 찢긴 땅의 금
      }else{   // 결정 D-880: 맨눈에는 눈보라에 감싸여 반투명하게만 보인다
        for(let i=0;i<16;i++){const k=((b.t*0.03+hash(i*3.1+b.seed))%1),px=x-r*1.4+hash(i*7.7+b.seed)*r*2.8+r*0.6-k*r*1.2,py=y-h*1.1+k*(h*1.1+6);
          blob(c,px,py,2.2+hash(i)*1.6,1.7+hash(i*2),SNOW,0.75*Math.sin(k*Math.PI)*(1-fallK));}
        for(let i=0;i<4;i++){const k=((b.t*0.05+hash(i*5.3+b.seed))%1),px=x+r*0.9-k*r*1.8,py=y-h+k*h;brush(c,[[px,py],[px-8,py+11]],1.2,SNOW,0.6*(1-fallK));}
        if(s<=BERG.rise+4)for(let i=0;i<7;i++){const q=i/7*Math.PI*2+b.seed;blob(c,x+Math.cos(q)*(r+s*1.5),y+Math.sin(q)*5-s*0.6,4,3,SNOW,0.55);}}}},
});

/* 둔갑마다 공격을 고른다. 둔갑 둘이 풀리면 숨는 발악(심장)을 남은 둔갑과 번갈아 쓴다.
   결정 D-943: 둔갑 순서는 첫 번째부터 무작위다. 다만 같은 모습이 두 번 잇따르지 않는다 (사용자 지시 2026-11-06).
   남은 둔갑이 하나뿐이면 발악과 번갈아 나와 역시 잇따르지 않는다. 예전엔 첫 둔갑이 늘 독수리였다. */
const HIDE_FIRST='"눈보라야, 나를 감춰라." 눈도깨비가 눈보라 속으로 사라졌다.';
// 결정 D-1454: 빙산 발악이 처음 나올 때 한 번, 눈도깨비가 볼 수 있겠느냐고 으른다 (사용자 지시 2026-11-11 큰 장터 6 눈기둥)
const BERG_WARN='"네 눈으로 이것이 보이겠느냐?" 눈보라 속에서 낮은 목소리가 울린다.';
// 결정 D-1456: 눈보라에 싸여 흐릴 때는 둔갑한 모습 대신 들리고 느껴지는 것만 적는다
const VEIL_TELL={eagle:'눈보라 속에서 큰 날갯짓 소리가 난다.',bear:'눈보라 속에서 무거운 앞발이 쳐들리는 기척이 난다.',boar:'눈보라 속에서 무언가 눈을 긁는다. 콧김이 거칠다.'};
const UNVEIL='수리부엉이 눈으로 보니 눈보라 속 정체가 드러났다! 이제 똑똑히 보인다.';
/* 결정 D-1456: 싸우다 한 번이라도 수리부엉이가 되면 정체가 드러나 끝까지 또렷하다 */
function checkUnveil(){
  const n=nd();if(!n.veiled||B.st==='end'||battleForm()!=='owl')return;
  n.veiled=false;n.swap=22;B.msg=UNVEIL;G.f.ndUnveiled=true;Sound.playSfx('battle_warn');
}
function pickNundok(){
  const n=nd();n.scars=[];n.prints=[];n.waves=[];n.tired=false;n.reverted=false;
  checkUnveil();
  const animals=B.parts.filter(p=>!p.core&&!p.broken),core=part('core'),gone=B.parts.filter(p=>!p.core&&p.broken).length,first=!B.last;
  let p;
  if(!core.broken&&(gone>=2||!animals.length)&&(B.last!==core||!animals.length))p=core;
  else{const o=animals.filter(q=>q!==B.last),pool=o.length?o:animals;p=pool[Math.floor(Math.random()*pool.length)];}
  B.cur=p;B.last=p;B.st='tell';B.t=first?70:p.core?80:52;B.hitThis=false;B.msg=!p.core&&n.veiled?VEIL_TELL[p.id]:p.tell;
  if(p.core){
    if(!n.hidSaid){n.hidSaid=true;learn('core:'+B.kind);B.msg=HIDE_FIRST;}
    else B.msg='눈도깨비가 다시 눈보라 속으로 숨었다.';
    const after=battleForm()==='owl'?'수리부엉이 눈에는 눈 밑에서 솟을 얼음의 금이 보인다.':'보이지 않는 것이 온다. 발밑 눈이 들썩인다.';
    if(!n.bergWarned){n.bergWarned=true;B.t+=26;bLater(BERG_WARN,30);bLater(after,70);}
    else bLater(after,34);
  }
}
/* 결정 D-1450: 둔갑 패턴이 끝나면 눈도깨비가 그 둔갑 모습 그대로 지쳐 헐떡이고, 가슴과 판의 얼음 속에서 그 둔갑의 심장이 드러난다
   (날아가거나 떨어지지 않는다). 결정 D-1460: 맞았어도 지친다. 예전엔 nundok_gloat_hits 번 맞으면 기세가 올라 빈틈 없이 다음 둔갑으로 갔다.
   발악(숨어서 빙산)이 끝나면 늘 본모습으로 드러나 지친다. 처음 드러날 때 한 번만 그것이 심장인 줄 아이가 알아챈다. */
const OPEN_MSG={eagle:'독수리 모습 그대로 눈도깨비가 헐떡인다. 처진 깃 사이로 푸른 심장이 비친다.',
  bear:'곰 모습 그대로 눈도깨비가 헐떡인다. 털가죽 속에서 푸른 심장이 비친다.',
  boar:'멧돼지 모습 그대로 눈도깨비가 헐떡인다. 곤두선 갈기 밑으로 푸른 심장이 비친다.',
  core:'모습이 드러났다. 지친 눈도깨비의 얼음 속에서 푸른 심장이 뛴다.'};
const OPEN_VEILED='눈보라 속에서 거친 숨소리가 난다. 푸른 빛 하나가 뛴다.';
const HEART_FIRST='눈도깨비가 숨을 몰아쉰다. 얼어붙은 가슴 속에서 푸른 불이 뛴다. …저게 심장이다!';
const HEART_FIRST_VEILED='눈보라 속에서 거친 숨소리가 난다. 푸른 불 하나가 뛴다. …저게 심장인가!';
function nundokOpen(p){
  const n=nd();
  let x,y;
  const z=bMarkZone();   // 결정 D-876: 판 안쪽에만
  for(let k=0;k<30;k++){x=z.x1+Math.random()*(z.x2-z.x1);y=z.y1+Math.random()*(z.y2-z.y1);if(Math.hypot(x-B.px,y-B.py)>=70)break;}
  n.tired=true;n.reverted=false;B.mark={x,y,t:150,max:150,part:p};n.reveal=0;
  if(!n.heartSaid){n.heartSaid=true;G.f.ndHeartSeen=true;B.msg=n.veiled?HEART_FIRST_VEILED:HEART_FIRST;}
  else B.msg=n.veiled&&!p.core?OPEN_VEILED:OPEN_MSG[p.id];
  return true;
}
/* 얼음 금: 둔갑 기운(부위 내구도)이 깎인 만큼 번진다 */
function iceCrack(){const all=B.parts.reduce((s,p)=>s+p.max,0),left=B.parts.reduce((s,p)=>s+Math.max(0,p.hp),0);return all?1-left/all:0;}
/* 결정 D-682·결정 D-686·결정 D-1450: 심장을 친 뒤 그 둔갑이 깎이고 둔갑이 풀려 본모습으로 돌아온다(nundok_revert_frames 동안 헐떡인다).
   연장이 있으면 확률로 소매 속 재료가 쏟아진다 */
function nundokHit(p,m){
  bSplash(m.x,m.y,BLUE);Sound.playSfx('ice_tinkle');   // 심장을 싼 얼음이 쩡 하고 운다
  if(p.core)return;
  const n=nd();n.reverted=true;B.openHold=T().nundok_revert_frames;
  if(p.broken){B.msg=FORMS[p.id]+' 둔갑이 풀렸다! '+ITEMS[p.mat].n+' 획득.';return;}
  const back=n.veiled?'눈보라 속 모습이 바뀐다.':FORMS[p.id]+' 둔갑이 풀려 본모습으로 돌아왔다.';
  const tool=battleTool();if(!tool){B.msg='심장을 쳤다! '+back;return;}
  const by=jo(toolName(tool),'으로','로')+' ',fit=toolFit(p,tool)==='bad'?' 효과가 적은 것 같다.':'';
  if(Math.random()<toolChance(p,T().nundok_spill_chance,tool)){B.loot.push(p.mat);B.msg=by+'심장을 쳤다! 둔갑이 풀리며 소매 속에서 '+jo(ITEMS[p.mat].n,'이','가')+' 쏟아졌다.';}
  else B.msg=by+'심장을 쳤다! '+back+fit;
}
function tickNundok(){const n=nd();if(n.flap>0)n.flap--;if(n.swap>0)n.swap--;if(B.st==='open')n.reveal++;
  checkUnveil();
  for(const s of n.scars)s.t++;for(const p of n.prints)p.t++;n.prints=n.prints.filter(p=>p.t<260);if(n.prints.length>140)n.prints.splice(0,n.prints.length-140);
  // 결정 D-1452: 멧돼지 충격파. 퍼지는 고리 띠에 닿으면 한 번 맞는다 (고리는 판 위에 납작하게 0.6)
  for(const w of n.waves){w.t++;const r=RUSH.wave*w.t/RUSH.waveT;
    if(!w.hit&&r>8&&w.t<=RUSH.waveT&&Math.abs(Math.hypot(B.px-w.x,(B.py-w.y)/0.6)-r)<RUSH.band){w.hit=true;bHitMe();}}
  n.waves=n.waves.filter(w=>w.t<=RUSH.waveT+6);
}
/* 판 바닥: 멧돼지 발자국과 충격파, 발톱 자국, 얼음이 갈라지며 드러나는 심장 (결정 D-1450) */
function drawNundokFloor(c){
  const n=nd(),va=n.veiled?veilAtk():1;
  for(const p of n.prints){const al=Math.min(1,(260-p.t)/60),sd=p.seed||0;
    blob(c,p.x+1,p.y+2,17,8,FROST,0.45*al);blob(c,p.x,p.y,13,6,'#c9d6de',0.5*al);   // 결정 D-879: 무게에 눌려 깊게 꺼진 눈
    hoof(c,p.x,p.y,p.a,0.85*al);
    if(p.t<RUSH.ring){const k=p.t/RUSH.ring;   // 쿵: 눈덩이가 튄다
      for(let i=0;i<7;i++){const a=sd+i*0.9,d=8+k*26;blob(c,p.x+Math.cos(a)*d,p.y+Math.sin(a)*d*0.45-Math.sin(k*Math.PI)*12,3.4,2.6,SNOW,0.9*(1-k));}}}
  // 결정 D-1452: 내리찍은 발에서 땅을 타고 퍼지는 충격파: 갈라지는 땅 금, 눈먼지 고리, 들썩 튀는 눈덩이
  for(const w of n.waves){const k=Math.min(1,w.t/RUSH.waveT),r=RUSH.wave*k,fade=w.t>RUSH.waveT?1-(w.t-RUSH.waveT)/6:1;
    for(let i=0;i<6;i++){const a=w.seed+i*1.05,L=r*0.9;brush(c,[[w.x,w.y],[w.x+Math.cos(a)*L*0.5,w.y+Math.sin(a)*L*0.3+2],[w.x+Math.cos(a)*L,w.y+Math.sin(a)*L*0.6]],1.6,FROST_DK,0.7*fade*va);}
    c.save();c.strokeStyle=SNOW;c.globalAlpha=0.9*fade*va;c.lineWidth=RUSH.band*1.4;c.beginPath();c.ellipse(w.x,w.y,Math.max(1,r),Math.max(1,r*0.6),0,0,Math.PI*2);c.stroke();
    c.strokeStyle=FROST_DK;c.globalAlpha=0.55*fade*va;c.lineWidth=1.4;c.beginPath();c.ellipse(w.x,w.y,Math.max(1,r+RUSH.band*0.7),Math.max(1,(r+RUSH.band*0.7)*0.6),0,0,Math.PI*2);c.stroke();c.restore();
    for(let i=0;i<10;i++){const a=w.seed+i*0.63;blob(c,w.x+Math.cos(a)*r,w.y+Math.sin(a)*r*0.6-Math.sin(k*Math.PI)*10,3,2.4,SNOW,0.85*fade*va);}}
  for(const s of n.scars)for(const l of s.lines){gash(c,l[0],l[1],12,'#3a3f48',0.75);gash(c,[l[0][0],l[0][1]-5],[l[1][0],l[1][1]-5],3,SNOW,0.85);}
  if(B.mark&&B.st==='open'){const m=B.mark,k=Math.min(1,n.reveal/20),kk=clamp((k-0.35)/0.65,0,1);
    // 얼음에 금이 번진다
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2+hash(i)*0.5,L=(16+hash(i*3)*24)*Math.min(1,k*1.6),mid=a+(hash(i*5)-0.5)*0.7;
      const P=[[m.x,m.y],[m.x+Math.cos(mid)*L*0.5,m.y+Math.sin(mid)*L*0.35],[m.x+Math.cos(a)*L,m.y+Math.sin(a)*L*0.7]];
      brush(c,P,1.8,FROST_DK,0.85);brush(c,P.map(([x,y])=>[x+1,y-1]),0.8,'#ffffff',0.7);}
    if(kk>0){   // 벌어진 판 얼음 틈에서 그 둔갑의 심장이 솟는다
      blob(c,m.x,m.y+6,28*kk,12*kk,'#0e1820',0.7);
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2+0.4,r=24*kk+4;
        sharp(c,[[m.x+Math.cos(a-0.32)*r*0.85,m.y+6+Math.sin(a-0.32)*r*0.4],[m.x+Math.cos(a)*(r+9),m.y+6+Math.sin(a)*(r+9)*0.4-5*kk],[m.x+Math.cos(a+0.32)*r*0.85,m.y+6+Math.sin(a+0.32)*r*0.4]],ICE,0.95,FROST_DK,1);}
      noeHeart(c,m.x,m.y-4*kk,0.55+0.4*kk,B.cur.core?'core':B.cur.id,iceCrack());}}
}
/* 소용돌이는 판 위로 솟아 하늘까지 이어진다: 판 밖 윗부분만 따로 그린다 */
function drawNundokOver(c){
  if(!B.bullets.some(b=>b.k==='ndTwist'))return;
  const va=nd().veiled?veilAtk():1;
  c.save();c.beginPath();c.rect(0,0,LW,BOX.y);c.clip();
  for(const b of B.bullets)if(b.k==='ndTwist')drawTwist(c,b,0.5*va);
  c.restore();
}

defineEnemies({
  dokkaebi:{name:'눈도깨비',calmLabel:'진정',
    // 결정 D-227: 전투 글귀는 일어난 일만 짧게. 피하라·치라는 안내는 쓰지 않는다
    // 결정 D-1456: 수리부엉이 눈이 아니면 모습이 흐려 목소리만 또렷하다
    get intro(){return G.form==='owl'?'"…내 걸음을 본 놈이 있구나." 서리 뿔을 인 눈도깨비가 어깨옷을 떨친다.'
      :'"…내 걸음을 본 놈이 있구나." 눈보라 속에서 낮은 목소리가 울린다. 모습은 보이지 않고 눈보라만 휘몰아친다.';},
    settle:true,markLife:150,quietHits:true,   // 결정 D-765
    parts:tableParts('dokkaebi',{
      eagle:{atk:'ndWind',mark:'홍',tell:'눈도깨비가 독수리로 둔갑해 날개를 쳐든다.',weak:'눈도깨비가 약해졌다. 이제 독수리로는 둔갑하지 못한다.'},
      bear:{atk:'ndClaw',mark:'홍',tell:'눈도깨비가 곰으로 둔갑해 앞발을 쳐든다.',weak:'눈도깨비가 약해졌다. 이제 곰으로는 둔갑하지 못한다.'},
      boar:{atk:'ndRush',mark:'홍',tell:'눈도깨비가 멧돼지로 둔갑해 눈을 긁는다.',weak:'눈도깨비가 약해졌다. 이제 멧돼지로는 둔갑하지 못한다.'},
      core:{atk:'ndBerg',mark:'홍',tell:HIDE_FIRST}}),
    pickAttack:pickNundok,openMark:nundokOpen,onMarkHit:nundokHit,tickHazards:tickNundok,drawFloor:drawNundokFloor,drawOver:drawNundokOver,
    // 결정 D-1456: 눈보라에 싸인 동안 공격도 흐리다. 빙산 발악은 D-880 규칙 그대로 둔다
    bulletAlpha:b=>nd().veiled&&b.k!=='ndBerg'?veilAtk():1,
    // 결정 D-243: 달래기는 메밀떡·엿 선물로만 한다
    likes:TABLES.CALM.dokkaebi,likeText:'눈도깨비가 좋아한다.',
    likeTexts:{memiltteok:'"메밀떡이다, 메밀떡!" 눈도깨비가 냄새를 맡더니 무섭던 얼굴로 덩실덩실 춤을 춘다. 고드름 수염이 짤랑댄다.',
      dad_yeot:'아빠가 맡긴 엿을 건넸다. "엿이다, 엿! 내 거지?" 눈도깨비가 엿가락을 소중히 끌어안는다. 엿은 돌려받지 못한다.'},
    coreHidden:'',coreShown:'',   // 결정 D-683: 발악(심장)은 따로 알린다 (pickNundok)
    // PA-21 불씨 지급과 얼음 뿔(nundok_horn)은 jangteo 지역 쪽 전투 종료 처리에서 한 번만 준다.
    calmWin:'눈도깨비가 훔친 설 제수를 제자리에 돌려놓는다. "고맙다, 고마워! 이 불씨도 네 거다!" 가슴에서 푸른 불씨 하나를 떼어 주고, 얼음 뿔 끝도 똑 꺾어 얹어 준다.',
    win:'심장의 푸른 불이 꺼지자 눈도깨비가 눈 더미로 무너진다. 부러진 얼음 뿔과 닳은 싸리비 한 자루만 남았다.',   // 결정 D-1450
    lose:'눈도깨비의 눈보라에 창고 밖으로 내동댕이쳐졌다.',
    backdrop:drawStoreRoom,draw:drawNundok},
});
})();
