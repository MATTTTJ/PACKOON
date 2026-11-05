'use strict';
/* 큰 장터 전투: 눈도깨비. 원본 표: design/data/bosses.csv · boss_parts.csv
   결정 D-680: 헌물 도깨비를 눈도깨비로 바꿨다 (사용자 지시 2026-11-05 큰 장터 16·24).
     닳아 버린 싸리비가 섣달그믐 눈밤에 도깨비가 된 것이다(설화: 붙잡아 둔 도깨비가 아침에 보니 몽당 빗자루였다).
     까치 깃으로 엮은 도롱이를 두르고, 서리 앉은 흰 머리와 고드름 수염, 뭉툭한 뿔 하나, 부리부리한 눈과 엄니.
     일본 오니 표식(범 가죽 잠방이, 가시 박힌 쇠몽둥이, 두 뿔)은 쓰지 않는다. 손에는 방망이 대신 싸리비를 쥔다.
     몸을 감출 줄 알아 아무도 못 보고, 제 발자국을 싸리비로 쓸며 다닌다. 종종이가 들은 '사락사락'이 그 소리다.
   결정 D-681: 둔갑은 독수리·곰·멧돼지. 멧돼지는 한겨울 산에서 눈을 파헤치며 내려오는 짐승이라 장터 뒷산과 어울리고,
     멧돼지로 둔갑하면 싸리비 살이 곤두선 갈기가 된다(부수면 싸리 살). 공격은 곧게 내닫는 돌진이다.
     - 독수리: 깃털을 품은 바람 덩이가 판 안을 떠돈다(ndWind).
     - 곰(반달가슴곰): 앞발로 긁는다. 판에 발톱 세 줄이 먼저 붉게 그어지고, 긁고 나면 땅에 세 줄 자국이 남는다(ndClaw).
     - 멧돼지: 한 줄 고랑을 예고하고 그 줄로 내닫는다. 지나간 자리에 눈 고랑이 남는다(ndRush).
   결정 D-682: 둔갑 공격이 끝날 때마다 가슴이 열리고, 푸른 불로 된 도깨비 심장이 튀어나와 판 위 눈밭에 떨어져 뛴다.
     그 심장이 칠 자리다(빈 자리에 표식만 뜨지 않는다). 심장과 가슴 사이에는 불 줄기가 잇는다.
     치면 그 둔갑의 내구도가 깎이고, 연장이 있으면 nundok_spill_chance 확률로 도롱이 속에 넣어 둔 재료가 쏟아진다.
   결정 D-683: 둔갑 둘이 풀리면(체력이 적으면) 발악한다. "숨어야겠어!" 하고 몸을 감추고, 보이지 않는 빙산이 발밑에서 솟는다.
     수리부엉이 모습이면 숨은 도깨비와 솟을 자리의 금이 보이고, 아니면 솟는 순간의 눈보라만 보인다(ndBerg).
     발악 뒤에는 모습이 드러나 숨을 몰아쉬고 심장이 나온다. 심장(핵심)을 꺾으면 이긴다.
   결정 D-685: 전투 색(D-102 먹 + 단청 붉은색)에 눈도깨비만 서리 푸른 담채와 푸른 도깨비불을 더한다. 붉은색은 피할 예고에만 쓴다. */
(()=>{
const T=()=>TABLES.TUNING;
const SNOW='#f8f6f0',ICE='#d6ebf2',FROST='#9dbccb',FROST_DK='#4d6c80',BLUE='#3f86c8',BLUE_LT='#a6d6f4',
  SHEEN='#2b4a6a',SKIN='#c3ced2',SKIN_DK='#8396a0',FUR='#3a2f28',BRISTLE='#b9874a',BEAK='#d9cfae';
const still=()=>Vfx.reducedMotion;
const FORMS={eagle:'독수리',bear:'곰',boar:'멧돼지'};
function nd(){return B.nd||(B.nd={shown:'',swap:0,scars:[],furrows:[],leap:0,hidSaid:false,puffs:[]});}

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
/* 깃 하나: (x,y)에서 ang 쪽으로 len. white 면 끝이 흰 까치 깃 */
function feather(c,x,y,len,wid,ang,col=INK,tip=null,alpha=1){
  c.save();c.translate(x,y);c.rotate(ang);c.globalAlpha=alpha;
  c.fillStyle=col;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(len*0.45,-wid,len,0);c.quadraticCurveTo(len*0.45,wid,0,0);c.fill();
  if(tip){c.fillStyle=tip;c.beginPath();c.moveTo(len*0.62,-wid*0.62);c.quadraticCurveTo(len*0.85,-wid*0.5,len,0);c.quadraticCurveTo(len*0.85,wid*0.5,len*0.62,wid*0.62);c.fill();}
  c.strokeStyle='rgba(239,227,200,.35)';c.lineWidth=0.8;c.beginPath();c.moveTo(2,0);c.lineTo(len*0.9,0);c.stroke();
  c.restore();
}
/* 푸른 불 심장. s 는 크기 배율 */
function heartFlame(c,x,y,s=1,alpha=1){
  const t=B.time,beat=still()?1:1+0.12*Math.max(0,Math.sin(t*0.32)),k=s*beat;
  c.save();c.globalAlpha=alpha;
  const g=c.createRadialGradient(x,y,2,x,y,34*k);g.addColorStop(0,'rgba(166,214,244,.75)');g.addColorStop(0.5,'rgba(63,134,200,.25)');g.addColorStop(1,'rgba(63,134,200,0)');
  c.fillStyle=g;c.beginPath();c.arc(x,y,34*k,0,Math.PI*2);c.fill();
  // 불꽃 혀
  for(let i=0;i<3;i++){const fl=still()?0:Math.sin(t*0.4+i*2)*3;
    shape(c,[[x-7*k+i*7*k,y-6*k],[x-4*k+i*7*k+fl,y-22*k-i%2*5*k],[x-1*k+i*7*k,y-6*k]],BLUE_LT,0.8);}
  // 심장 꼴
  c.fillStyle=BLUE;c.beginPath();c.moveTo(x,y+14*k);
  c.bezierCurveTo(x-20*k,y+2*k,x-16*k,y-14*k,x-7*k,y-12*k);c.bezierCurveTo(x-2*k,y-11*k,x,y-7*k,x,y-5*k);
  c.bezierCurveTo(x,y-7*k,x+2*k,y-11*k,x+7*k,y-12*k);c.bezierCurveTo(x+16*k,y-14*k,x+20*k,y+2*k,x,y+14*k);c.fill();
  c.strokeStyle=INK;c.lineWidth=1.6;c.globalAlpha=alpha*0.7;c.stroke();c.globalAlpha=alpha;
  blob(c,x-6*k,y-5*k,4*k,3*k,BLUE_LT,0.9*alpha);
  // 핏줄 같은 서리 금
  brush(c,[[x-2*k,y-4*k],[x+3*k,y+2*k],[x+1*k,y+8*k]],1.2,'#e8f6ff',0.7*alpha);
  c.restore();
}
/* 눈도깨비 얼굴. r 은 얼굴 반지름, beak 면 부리, bear 면 곰 얼굴 */
function dokkaebiFace(c,x,y,r,opt={}){
  const [ex,ey]=lookAt(x,y),still0=still(),t=B.time;
  // 뿔 하나: 서리 낀 뭉툭한 뿔
  sharp(c,[[x-r*0.16,y-r*0.82],[x+r*0.06,y-r*1.42],[x+r*0.24,y-r*1.36],[x+r*0.2,y-r*0.8]],ICE,1,INK,2);
  brush(c,[[x+r*0.04,y-r*1.25],[x+r*0.12,y-r*0.95]],1.4,'#ffffff',0.8);
  // 얼굴
  blob(c,x,y,r,r*0.94,opt.skin||SKIN);
  c.save();c.strokeStyle=INK;c.lineWidth=2.4;c.globalAlpha=0.9;c.beginPath();c.ellipse(x,y,r,r*0.94,0,0,Math.PI*2);c.stroke();c.restore();
  // 서리 앉은 눈썹: 까치 깃처럼 희고 검게
  for(const s of [-1,1]){feather(c,x+s*r*0.12,y-r*0.42,r*0.62,r*0.13,s<0?Math.PI+0.28:-0.28,INK,SNOW);}
  // 부리부리한 눈, 붉은 눈자위
  for(const s of [-1,1]){const cx=x+s*r*0.38,cy=y-r*0.18;
    blob(c,cx,cy,r*0.3,r*0.28,'#fbf7ec');c.save();c.strokeStyle=RED;c.globalAlpha=0.55;c.lineWidth=1.6;c.beginPath();c.ellipse(cx,cy,r*0.3,r*0.28,0,0,Math.PI*2);c.stroke();c.restore();
    blob(c,cx+ex*r*0.05,cy+ey*r*0.05,r*0.13,r*0.14,INK);blob(c,cx+ex*r*0.05-2,cy+ey*r*0.05-2,1.6,1.6,'#ffffff');}
  if(opt.beak){   // 독수리 부리: 굽은 부리가 코 자리에서 내려온다
    shape(c,[[x-r*0.22,y+r*0.02],[x+r*0.22,y+r*0.02],[x+r*0.16,y+r*0.42],[x,y+r*0.62],[x-r*0.06,y+r*0.48]],BEAK,1,INK,2);
    brush(c,[[x-r*0.18,y+r*0.22],[x+r*0.04,y+r*0.3]],1.2,INK,0.6);return;}
  // 주먹코
  blob(c,x,y+r*0.14,r*0.2,r*0.16,opt.bear?INK:SKIN_DK);blob(c,x-r*0.06,y+r*0.1,r*0.06,r*0.04,'#ffffff',0.5);
  // 입: 귀면처럼 크게 벌린 입, 이와 엄니
  const open=opt.roar?0.24:0.14;
  shape(c,[[x-r*0.56,y+r*0.36],[x,y+r*(0.4+open*0.4)],[x+r*0.56,y+r*0.36],[x+r*0.3,y+r*(0.48+open)],[x-r*0.3,y+r*(0.48+open)]],'#3a1e1a',1,INK,2);
  for(let i=-2;i<=2;i++)sharp(c,[[x+i*r*0.17-r*0.06,y+r*0.39],[x+i*r*0.17+r*0.06,y+r*0.39],[x+i*r*0.17,y+r*0.47]],'#fbf7ec');
  for(const s of [-1,1])sharp(c,[[x+s*r*0.36,y+r*(0.5+open)],[x+s*r*0.44,y+r*0.22],[x+s*r*0.28,y+r*(0.46+open)]],'#fbf7ec',1,INK,1.2);
  if(!still0&&!opt.bear&&Math.floor(t/50)%3===0){const k=(t%50)/50;blob(c,x+r*0.5+k*14,y+r*0.5-k*10,4+k*6,3+k*4,'#ffffff',0.5*(1-k));}   // 찬 입김
}
/* 흰 머리와 고드름 수염 */
function frostMane(c,x,y,r){   // 얼굴 뒤: 서리 앉은 더벅머리가 어깨까지 처진다
  const wob=i=>still()?0:Math.sin(B.time*0.04+i)*1.5,pts=[];
  for(let i=0;i<=16;i++){const a=-Math.PI*1.05+i*Math.PI*1.1/16,k=i%2?1.22:1.42+hash(i)*0.2;pts.push([x+Math.cos(a)*r*k+wob(i),y+Math.sin(a)*r*k*0.95]);}
  pts.push([x+r*1.3,y+r*0.9],[x+r*1.05,y+r*1.25],[x-r*1.05,y+r*1.25],[x-r*1.3,y+r*0.9]);
  shape(c,pts,SNOW,0.97,FROST_DK,1.6);
  for(const s of [-1,1])for(let i=0;i<4;i++){const sx=x+s*r*(0.92+i*0.1);brush(c,[[sx,y-r*0.1+i*6],[sx+s*4+wob(i),y+r*0.6+i*4],[sx+s*2,y+r*1.18]],2,FROST,0.8);}
  for(let i=0;i<5;i++){const sx=x-r*0.5+i*r*0.25;brush(c,[[sx,y-r*0.9],[sx+(i-2)*3,y-r*1.25-hash(i)*6]],2,FROST,0.7);}
}
function frostBeard(c,x,y,r){   // 턱 아래: 흰 수염과 고드름
  const pts=[[x-r*0.62,y+r*0.5]];
  for(let i=0;i<=8;i++){const bx=x-r*0.62+i*r*1.24/8;pts.push([bx,y+r*(i%2?1.25:1.55+hash(i)*0.2)]);}
  pts.push([x+r*0.62,y+r*0.5],[x,y+r*0.72]);
  shape(c,pts,SNOW,0.97,FROST_DK,1.4);
  for(let i=-2;i<=2;i++){const bx=x+i*r*0.24;brush(c,[[bx,y+r*0.8],[bx+i,y+r*1.3]],1.4,FROST,0.8);
    if(i%2===0)sharp(c,[[bx-3,y+r*1.42],[bx+3,y+r*1.42],[bx,y+r*1.42+12]],ICE,0.95,FROST_DK,1);}   // 고드름
}
/* 까치 깃 도롱이: 어깨에서 땅까지 깃을 층층이 */
function magpieCape(c,x,y,w,h,open=false){
  const rows=5;
  for(let r=rows-1;r>=0;r--){const yy=y+r*h/rows,half=w*(0.62+0.38*r/(rows-1));
    for(let k=-half;k<=half;k+=15){if(open&&Math.abs(k)<26&&r<4)continue;
      const white=r%2===1&&Math.abs(k)>half*0.45,col=(k/15|0)%3===0?SHEEN:INK;
      feather(c,x+k,yy,h/rows+16,7.5,Math.PI/2+k/half*0.25,col,white?SNOW:null);}}
  // 어깨에 쌓인 눈
  shape(c,[[x-w*0.62,y+4],[x-w*0.3,y-8],[x,y-4],[x+w*0.3,y-8],[x+w*0.62,y+4],[x+w*0.4,y+10],[x-w*0.4,y+10]],SNOW,0.95);
}
/* 싸리비: 손잡이와 부채꼴 살 */
function broom(c,x0,y0,x1,y1,alpha=1){
  brush(c,[[x0,y0],[x1,y1]],5,'#6b4e33',alpha);
  const a=Math.atan2(y1-y0,x1-x0);
  for(let i=-5;i<=5;i++){const b=a+i*0.07;brush(c,[[x1,y1],[x1+Math.cos(b)*44,y1+Math.sin(b)*44]],1.6,BRISTLE,alpha*0.9);}
  brush(c,[[x1-Math.sin(a)*8,y1+Math.cos(a)*8],[x1+Math.sin(a)*8,y1-Math.cos(a)*8]],3,'#5a3e26',alpha);
}
/* 가슴이 열린 자리: 심장이 튀어나가면 빈 구멍에 불씨만, 들어 있으면 심장 */
function chestHeart(c,x,y,s=1){
  const out=!!B.mark;
  c.save();c.globalAlpha=0.85;c.fillStyle='#14202a';c.beginPath();c.ellipse(x,y,18*s,22*s,0,0,Math.PI*2);c.fill();c.restore();
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;brush(c,[[x+Math.cos(a)*16*s,y+Math.sin(a)*20*s],[x+Math.cos(a)*26*s,y+Math.sin(a)*30*s]],2,FROST,0.7);}
  if(out)blob(c,x,y,8*s,8*s,BLUE_LT,0.5+0.3*Math.sin(B.time*0.3));
  else heartFlame(c,x,y,0.75*s);
}

/* ---------- 모습 ---------- */
function drawBase(c,cx,cy,opt={}){
  const b=still()?0:Math.sin(B.time*0.05)*3,hy=cy-46+b;
  // 등 뒤로 솟은 긴 까치 꽁지
  feather(c,cx+44,cy+64,150,11,-0.95,SHEEN,null,0.95);feather(c,cx+38,cy+70,128,9,-1.15,INK,null,0.9);
  // 싸리비 (왼쪽 손)
  broom(c,cx-118,cy-36+b,cx-98,cy+86,1);
  magpieCape(c,cx,cy-2+b,96,118,opt.open);
  // 까치 배처럼 흰 앞섶
  if(!opt.open)shape(c,[[cx-26,cy+22+b],[cx,cy+10+b],[cx+26,cy+22+b],[cx+20,cy+84],[cx-20,cy+84]],SNOW,0.95,INK,1.4);
  else chestHeart(c,cx,cy+34+b,1.1);
  // 팔: 털북숭이 팔과 주먹
  brush(c,[[cx-62,cy+6+b],[cx-86,cy+36+b],[cx-102,cy+56]],14,SKIN_DK,1);blob(c,cx-102,cy+58,13,12,SKIN,1);brush(c,[[cx-110,cy+54],[cx-94,cy+56]],2,INK,0.7);
  brush(c,[[cx+62,cy+6+b],[cx+88,cy+40+b],[cx+96,cy+66]],14,SKIN_DK,1);blob(c,cx+96,cy+70,14,13,SKIN,1);
  for(let i=0;i<3;i++)brush(c,[[cx+86+i*6,cy+64],[cx+88+i*6,cy+74]],1.4,INK,0.7);
  frostMane(c,cx,hy,40);
  frostBeard(c,cx,hy,40);
  dokkaebiFace(c,cx,hy,40,{roar:opt.roar});
  // 발치에 쌓인 눈
  shape(c,[[cx-120,cy+124],[cx-60,cy+108],[cx,cy+114],[cx+70,cy+106],[cx+124,cy+124]],SNOW,0.9);
}
function drawEagle(c,cx,cy,opt={}){
  const flap=still()?0:Math.sin(B.time*(B.st==='atk'?0.22:0.08))*0.22,hy=cy-34;
  for(const s of [-1,1]){
    // 날개: 어깨에서 바깥으로, 깃 끝에 눈
    const sx=cx+s*34,sy=cy+6,ang=s<0?Math.PI+0.25-flap:-0.25+flap;
    for(let i=0;i<9;i++){const a=ang+s*(i*0.12-0.28)*-1,len=120+i*10-(i>6?(i-6)*16:0);
      feather(c,sx,sy+i*3,len,10,a+s*(-0.06*i),i%3===0?SHEEN:INK,i>4?SNOW:null);}
    for(let i=0;i<6;i++)feather(c,sx,sy+4,70-i*6,11,ang+s*0.1*i,i%2?'#2a2420':INK,i===2?SNOW:null);   // 덮깃
  }
  // 몸통: 깃 덮인 가슴, 까치처럼 흰 배
  shape(c,[[cx-40,cy+10],[cx,cy-6],[cx+40,cy+10],[cx+34,cy+96],[cx,cy+110],[cx-34,cy+96]],'#2a2420',1,INK,2);
  if(!opt.open)shape(c,[[cx-22,cy+30],[cx,cy+20],[cx+22,cy+30],[cx+16,cy+90],[cx-16,cy+90]],SNOW,0.95);
  else chestHeart(c,cx,cy+48,1);
  for(let i=0;i<4;i++)brush(c,[[cx-18,cy+36+i*14],[cx,cy+42+i*14],[cx+18,cy+36+i*14]],1.4,INK,0.35);
  // 꽁지와 발톱
  for(let i=-2;i<=2;i++)feather(c,cx+i*8,cy+100,46,7,Math.PI/2+i*0.14,INK,SNOW);
  for(const s of [-1,1]){const fx=cx+s*20,fy=cy+112;brush(c,[[fx,fy-14],[fx,fy]],5,BEAK);
    for(let k=-1;k<=1;k++)brush(c,[[fx,fy],[fx+k*7+s*2,fy+8],[fx+k*9+s*3,fy+5]],2.4,INK);}
  // 흰 깃 볏과 도깨비 얼굴
  for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*0.32;feather(c,cx,hy-6,40+hash(i)*12,6,a,i%2?SNOW:FROST);}
  dokkaebiFace(c,cx,hy,30,{beak:true});
}
function drawBear(c,cx,cy,opt={}){
  const atk=B.st==='atk'&&!opt.open,swipe=atk?Math.sin(clamp(B.atkT%58/40,0,1)*Math.PI):0,b=still()?0:Math.sin(B.time*0.05)*2,hy=cy-40+b;
  // 몸: 커다란 털 덩어리, 등에 쌓인 눈
  shape(c,[[cx-118,cy+122],[cx-112,cy+40],[cx-70,cy-4],[cx,cy-14],[cx+70,cy-4],[cx+112,cy+40],[cx+118,cy+122]],FUR,1,INK,2.4);
  for(let i=0;i<22;i++){const x=cx-104+hash(i*2.1)*208,y=cy+6+hash(i*5.3)*104;brush(c,[[x,y],[x+3,y+12]],2,'#5a4a3e',0.6);}
  shape(c,[[cx-80,cy+2],[cx-30,cy-14],[cx+20,cy-12],[cx+76,cy+2],[cx+40,cy+8],[cx-40,cy+8]],SNOW,0.9);
  // 반달가슴곰의 흰 반달
  if(!opt.open)shape(c,[[cx-46,cy+24],[cx,cy+52],[cx+46,cy+24],[cx+38,cy+34],[cx,cy+60],[cx-38,cy+34]],SNOW,0.95,INK,1.2);
  else chestHeart(c,cx,cy+56,1.1);
  // 앞발: 하나는 쳐들고(예고·긁기), 하나는 짚는다
  const ax=cx-92-swipe*20,ay=cy-30+swipe*80;
  brush(c,[[cx-70,cy+20],[cx-92,cy-6],ax<cx?[ax,ay]:[ax,ay]],24,FUR,1);
  blob(c,ax,ay,18,15,FUR);for(let k=-1;k<=1;k++)sharp(c,[[ax+k*9-3,ay+8],[ax+k*9+3,ay+8],[ax+k*11,ay+30]],SNOW,1,INK,1.2);
  brush(c,[[cx+76,cy+30],[cx+96,cy+96]],24,FUR,1);blob(c,cx+98,cy+104,18,12,FUR);
  for(let k=-1;k<=1;k++)sharp(c,[[cx+98+k*9-3,cy+108],[cx+98+k*9+3,cy+108],[cx+98+k*10,cy+122]],SNOW,1,INK,1);
  // 곰 머리: 둥근 귀, 도깨비 눈과 뿔
  for(const s of [-1,1]){blob(c,cx+s*38,hy-34,14,13,FUR);blob(c,cx+s*38,hy-33,7,6,'#5a4a3e');}
  dokkaebiFace(c,cx,hy,42,{skin:'#4a3c33',bear:true,roar:atk});
  shape(c,[[cx-26,hy-38],[cx-10,hy-48],[cx+4,hy-42],[cx+20,hy-50],[cx+28,hy-36],[cx,hy-32]],SNOW,0.95);   // 정수리에 앉은 서리
}
function drawBoar(c,cx,cy,opt={}){
  const paw=B.st==='tell'&&!still()?Math.abs(Math.sin(B.time*0.3))*6:0,hy=cy+30;
  // 낮고 넓은 몸통, 등 갈기는 싸리비 살
  shape(c,[[cx-124,cy+118],[cx-118,cy+44],[cx-70,cy+16],[cx,cy+10],[cx+70,cy+16],[cx+118,cy+44],[cx+124,cy+118]],'#2e2620',1,INK,2.4);
  for(let i=0;i<26;i++){const x=cx-110+i*8.8,top=cy+22-Math.sin(i/25*Math.PI)*14;brush(c,[[x,top],[x+(i-13)*0.6,top-26-hash(i)*10]],2,BRISTLE,0.95);}
  for(let i=0;i<18;i++){const x=cx-104+hash(i*4.4)*208,y=cy+40+hash(i*1.9)*70;brush(c,[[x,y],[x+2,y+10]],1.6,'#5a4e44',0.6);}
  // 다리와 굽
  for(const [lx,s] of [[-92,1],[-50,0],[50,0],[92,1]]){const ly=cy+112-(s&&lx<0?paw:0);brush(c,[[cx+lx,cy+90],[cx+lx,ly]],12,'#2e2620');blob(c,cx+lx,ly+4,7,5,INK);}
  if(paw)for(let i=0;i<4;i++)blob(c,cx-96+i*5,cy+118-paw*hash(i+B.time%7),3,2,SNOW,0.8);
  // 머리: 앞으로 숙인 쐐기 머리, 엄니와 주둥이, 도깨비 뿔과 눈
  for(const s of [-1,1])sharp(c,[[cx+s*28,hy-30],[cx+s*44,hy-48],[cx+s*40,hy-22]],'#2e2620',1,INK,1.6);
  shape(c,[[cx-44,hy-30],[cx,hy-40],[cx+44,hy-30],[cx+30,hy+30],[cx,hy+46],[cx-30,hy+30]],'#3a3029',1,INK,2);
  blob(c,cx,hy+44,18,11,'#5a4a40');blob(c,cx-6,hy+44,3,4,INK);blob(c,cx+6,hy+44,3,4,INK);
  for(const s of [-1,1])shape(c,[[cx+s*14,hy+40],[cx+s*34,hy+30],[cx+s*40,hy+4],[cx+s*30,hy+28],[cx+s*16,hy+34]],SNOW,1,INK,1.4);
  sharp(c,[[cx-6,hy-34],[cx+2,hy-58],[cx+10,hy-56],[cx+8,hy-34]],ICE,1,INK,1.6);
  const [ex,ey]=lookAt(cx,hy);
  for(const s of [-1,1]){blob(c,cx+s*18,hy-10,8,7,'#fbf7ec');c.save();c.strokeStyle=RED;c.globalAlpha=0.6;c.lineWidth=1.4;c.beginPath();c.ellipse(cx+s*18,hy-10,8,7,0,0,Math.PI*2);c.stroke();c.restore();blob(c,cx+s*18+ex,hy-10+ey,3.4,3.6,INK);}
  for(const s of [-1,1])feather(c,cx+s*8,hy-22,26,4,s<0?Math.PI+0.5:-0.5,INK,SNOW);   // 까치 깃 눈썹
  if(opt.open)chestHeart(c,cx,cy+70,0.9);
}

/* 눈도깨비 그리기: 지금 둔갑에 따라 모습이 바뀐다. 숨은 동안은 거의 보이지 않고, 수리부엉이 눈에만 윤곽이 보인다 */
let ghostCanvas=null;
function shownForm(){
  if(B.st==='end')return B.result==='win'?'down':'';
  if(!B.cur||['intro','idle','bonk'].includes(B.st))return '';
  return B.cur.core?'ghost':B.cur.id;
}
function drawNundok(c){
  const cx=LW/2,cy=EY,f=shownForm(),n=nd(),open=B.st==='open';
  if(f==='down'){   // 진 눈도깨비: 눈 더미로 무너지고 싸리비와 까치 깃만 남는다 (설화의 몽당 빗자루)
    shape(c,[[cx-130,cy+124],[cx-70,cy+80],[cx,cy+70],[cx+80,cy+86],[cx+132,cy+124]],SNOW,0.95,FROST,1.4);
    broom(c,cx-60,cy+96,cx+30,cy+110,1);for(let i=0;i<4;i++)feather(c,cx+40+i*16,cy+100-i*5,30,5,-0.4-i*0.2,i%2?SHEEN:INK,SNOW);
    return;}
  const body=(cc)=>{
    if(f==='eagle')drawEagle(cc,cx,cy,{open});
    else if(f==='bear')drawBear(cc,cx,cy,{open});
    else if(f==='boar')drawBoar(cc,cx,cy,{open});
    else drawBase(cc,cx,cy,{open:open&&f==='ghost',roar:B.st==='tell'});
  };
  if(f==='ghost'&&!open){
    // 숨은 동안: 다른 판에 그려 아주 옅게 얹는다. 수리부엉이 눈이면 서리 윤곽이 또렷하다
    const owl=battleForm()==='owl';
    if(!ghostCanvas)ghostCanvas=document.createElement('canvas');
    if(ghostCanvas.width!==bcv.width||ghostCanvas.height!==bcv.height){ghostCanvas.width=bcv.width;ghostCanvas.height=bcv.height;}
    const g=ghostCanvas.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,ghostCanvas.width,ghostCanvas.height);g.setTransform(c.getTransform());
    body(g);
    c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=owl?0.55:0.04;
    if(owl){c.filter='drop-shadow(0 0 6px rgba(120,190,240,.9))';}
    c.drawImage(ghostCanvas,0,0);c.restore();
    // 숨은 자리에 휘도는 눈발
    for(let i=0;i<14;i++){const a=B.time*0.03+i*0.45,r=60+hash(i)*70;blob(c,cx+Math.cos(a)*r,cy+40+Math.sin(a*1.3)*50,2+hash(i*3)*2,2,SNOW,0.7);}
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
  // 바닥 눈 위로 쓸고 간 싸리비 자국 (발자국은 없다)
  for(let i=0;i<5;i++){const x=LW*0.55+i*26;brush(c,[[x,gy+6],[x+18,gy+10]],1.2,FROST_DK,0.35);brush(c,[[x+2,gy+9],[x+20,gy+13]],1,FROST_DK,0.3);}
  // 숨은 동안 창고 안에 눈보라
  if(f==='ghost'&&B.st!=='open'){c.save();c.fillStyle='rgba(230,240,248,.18)';c.fillRect(0,0,LW,LH);c.restore();
    for(let i=0;i<40;i++){const x=(hash(i*2.3)*LW+(still0?0:t*2.2*(0.6+hash(i))))%LW,y=(hash(i*7.1)*LH+(still0?0:t*0.9))%LH;blob(c,x,y,1.8,1.8,SNOW,0.8);}}
}

/* ---------- 공격 ---------- */
// 독수리: 깃털 품은 바람 덩이
const GUST={life:210,gap:46,n:3,r:16,fadeIn:16,fadeOut:18};
// 곰: 발톱 세 줄
const CLAW={gap:58,tell:32,strike:7,stay:12,len:200,sep:15,n:3};
// 멧돼지: 한 줄 돌진
const RUSH={gap:76,tell:44,run:24,half:19,n:3};
// 발악: 보이지 않는 빙산
const BERG={gap:30,tell:36,rise:9,hold:22,fall:14,r:19,n:6,h:46};
defineAttacks({
  ndWind:{dur:GUST.gap*(GUST.n-1)+GUST.life,tick(t,X,Y,W,H){
    if(t%GUST.gap||t/GUST.gap>=GUST.n)return;
    const side=altDir('ndGust')?1:-1,y=Y+H*(0.2+0.6*Math.random()),sp=1.25+Math.random()*0.45;
    B.bullets.push({k:'ndGust',x:side>0?X-18:X+W+18,y,vx:side*sp,vy:(Math.random()<0.5?-1:1)*(0.45+Math.random()*0.5),t:0,life:GUST.life,r:GUST.r,seed:Math.random()*6});}},
  ndClaw:{dur:CLAW.gap*(CLAW.n-1)+CLAW.tell+CLAW.strike+CLAW.stay+2,tick(t,X,Y,W,H){
    if(t%CLAW.gap||t/CLAW.gap>=CLAW.n)return;
    const s=altDir('ndClaw')?1:-1,a=s*(0.45+Math.random()*0.5);
    const x=clamp(B.px+(Math.random()-0.5)*30,X+30,X+W-30),y=clamp(B.py+(Math.random()-0.5)*24,Y+24,Y+H-24);
    B.bullets.push({k:'ndClaw',x,y,t:0,a});}},
  ndRush:{dur:RUSH.gap*(RUSH.n-1)+RUSH.tell+RUSH.run+8,tick(t,X,Y,W,H){
    if(t%RUSH.gap||t/RUSH.gap>=RUSH.n)return;
    const i=t/RUSH.gap,prev=B.ndLane;let y;
    if(i===0)y=clamp(B.py,Y+RUSH.half+4,Y+H-RUSH.half-4);
    else{let n=0;do{y=Y+RUSH.half+4+Math.random()*(H-2*RUSH.half-8);n++;}while(prev!=null&&Math.abs(y-prev)<RUSH.half*2.4&&n<20);}
    B.ndLane=y;B.bullets.push({k:'ndRush',y,dir:altDir('ndRush')?1:-1,t:0});}},
  ndBerg:{dur:BERG.gap*(BERG.n-1)+BERG.tell+BERG.rise+BERG.hold+BERG.fall+4,tick(t,X,Y,W,H){
    if(t%BERG.gap||t/BERG.gap>=BERG.n)return;
    const x=clamp(B.px+(Math.random()-0.5)*16,X+BERG.r,X+W-BERG.r),y=clamp(B.py+(Math.random()-0.5)*12+8,Y+BERG.r+20,Y+H-6);
    B.bullets.push({k:'ndBerg',x,y,t:0,seed:Math.random()*9});}},
});
/* 발톱 세 줄의 선분 (상자 안에서 길게) */
function clawLines(b){
  const ca=Math.cos(b.a),sa=Math.sin(b.a),px=-sa,py=ca,L=CLAW.len/2;
  return [-1,0,1].map(j=>{const ox=b.x+px*CLAW.sep*j,oy=b.y+py*CLAW.sep*j;return [[ox-ca*L,oy-sa*L],[ox+ca*L,oy+sa*L]];});
}
function segDist(x,y,[[x1,y1],[x2,y2]],k=1){
  const ex=x1+(x2-x1)*k,ey=y1+(y2-y1)*k,dx=ex-x1,dy=ey-y1,q=clamp(((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy||1),0,1);
  return Math.hypot(x-x1-q*dx,y-y1-q*dy);
}
function rushX(b,k){return b.dir>0?BOX.x-40+(BOX.w+80)*k:BOX.x+BOX.w+40-(BOX.w+80)*k;}
defineBullets({
  ndGust:{
    step(b){b.t++;if(b.t>b.life){b.dead=1;return;}
      b.x+=b.vx;b.y+=b.vy+Math.sin(b.t*0.07+b.seed)*0.55;
      if(b.t>30){if((b.x<BOX.x+b.r&&b.vx<0)||(b.x>BOX.x+BOX.w-b.r&&b.vx>0))b.vx*=-1;if((b.y<BOX.y+b.r&&b.vy<0)||(b.y>BOX.y+BOX.h-b.r&&b.vy>0))b.vy*=-1;}
      if(b.t>GUST.fadeIn&&b.t<b.life-GUST.fadeOut&&Math.hypot(b.x-B.px,b.y-B.py)<b.r+3)bHitMe();},
    draw(c,b){const a=Math.min(1,b.t/GUST.fadeIn,(b.life-b.t)/GUST.fadeOut),rot=still()?b.seed:b.t*0.18+b.seed;
      blob(c,b.x,b.y,b.r+4,b.r+3,'rgba(214,235,242,1)',0.35*a);
      c.save();c.globalAlpha=a;c.lineCap='round';
      for(let i=0;i<3;i++){const r=b.r*(0.45+i*0.28),s=rot+i*2.1;c.strokeStyle=i===1?INK:FROST_DK;c.lineWidth=i===1?2.6:2;c.beginPath();c.arc(b.x,b.y,r,s,s+Math.PI*1.2);c.stroke();}
      c.restore();
      for(let i=0;i<4;i++){const s=rot*1.4+i*Math.PI/2,fx=b.x+Math.cos(s)*b.r*1.05,fy=b.y+Math.sin(s)*b.r*0.85;feather(c,fx,fy,17,4.2,s+Math.PI/2,i%2?SHEEN:INK,SNOW,a);}
      for(let i=0;i<3;i++){const q=rot*0.6+i*2.1;brush(c,[[b.x+Math.cos(q)*b.r*1.5,b.y+Math.sin(q)*b.r*1.1],[b.x+Math.cos(q+0.5)*b.r*1.9,b.y+Math.sin(q+0.5)*b.r*1.4]],1.6,FROST_DK,0.5*a);}}},
  ndClaw:{
    step(b){b.t++;const s=b.t-CLAW.tell;
      if(s>0&&s<=CLAW.strike){const k=s/CLAW.strike;if(clawLines(b).some(l=>segDist(B.px,B.py,l,k)<7))bHitMe();}
      if(s===CLAW.strike)nd().scars.push({lines:clawLines(b),t:0});
      if(s>CLAW.strike+CLAW.stay)b.dead=1;},
    draw(c,b){const s=b.t-CLAW.tell,L=clawLines(b);
      if(s<=0){const blink=0.35+0.4*(Math.floor(b.t/4)%2);for(const l of L){c.save();c.setLineDash([7,6]);c.strokeStyle=RED;c.globalAlpha=blink;c.lineWidth=2;c.beginPath();c.moveTo(...l[0]);c.lineTo(...l[1]);c.stroke();c.restore();}return;}
      const k=Math.min(1,s/CLAW.strike),fade=s>CLAW.strike?1-(s-CLAW.strike)/CLAW.stay:1;
      for(const l of L){const ex=l[0][0]+(l[1][0]-l[0][0])*k,ey=l[0][1]+(l[1][1]-l[0][1])*k;brush(c,[l[0],[ex,ey]],7,INK,0.9*fade);brush(c,[l[0],[ex,ey]],2,'#ffffff',0.6*fade);
        if(s<=CLAW.strike)for(let i=0;i<3;i++)blob(c,ex+(Math.random()-0.5)*10,ey+(Math.random()-0.5)*10,3,3,SNOW,0.9);}}},
  ndRush:{
    step(b){b.t++;const s=b.t-RUSH.tell;
      if(s>0&&s<=RUSH.run){const x=rushX(b,s/RUSH.run);if(Math.abs(B.py-b.y)<RUSH.half&&Math.abs(B.px-x)<28)bHitMe();}
      if(s===RUSH.run)nd().furrows.push({y:b.y,t:0});
      if(s>RUSH.run+6)b.dead=1;},
    draw(c,b){const s=b.t-RUSH.tell;
      if(s<=0){c.save();c.fillStyle=RED;c.globalAlpha=0.1+0.1*(Math.floor(b.t/5)%2);c.fillRect(BOX.x,b.y-RUSH.half,BOX.w,RUSH.half*2);c.restore();
        for(let x=BOX.x+20;x<BOX.x+BOX.w;x+=34){const xx=b.dir>0?x:BOX.x+BOX.w-(x-BOX.x);brush(c,[[xx-b.dir*6,b.y-7],[xx+b.dir*4,b.y],[xx-b.dir*6,b.y+7]],2.4,RED,0.6);}
        return;}
      const k=Math.min(1,s/RUSH.run),x=rushX(b,k),d=b.dir;
      // 내닫는 멧돼지: 낮은 몸, 앞으로 숙인 머리와 엄니, 곤두선 싸리 갈기
      blob(c,x-d*8,b.y,30,15,'#2e2620');blob(c,x+d*20,b.y+2,14,11,'#3a3029');
      for(let i=0;i<9;i++)brush(c,[[x-d*30+d*i*6,b.y-11],[x-d*34+d*i*6,b.y-22-hash(i)*5]],1.6,BRISTLE,0.95);
      for(const sy of [-1,1])shape(c,[[x+d*26,b.y+sy*3],[x+d*38,b.y+sy*8-6],[x+d*30,b.y+sy*5]],SNOW,1,INK,1);
      blob(c,x+d*14,b.y-4,2.6,2.6,'#fbf7ec');
      for(let i=0;i<5;i++)blob(c,x-d*(36+i*8),b.y+(Math.random()-0.5)*16,4-i*0.5,3,SNOW,0.8-i*0.12);}},
  ndBerg:{
    step(b){b.t++;const s=b.t-BERG.tell;
      if(s>0&&s<=BERG.rise+BERG.hold&&Math.hypot(B.px-b.x,B.py-(b.y-BERG.h*0.35))<BERG.r+4)bHitMe();
      if(s>BERG.rise+BERG.hold+BERG.fall)b.dead=1;},
    draw(c,b){const seen=battleForm()==='owl',s=b.t-BERG.tell;
      if(s<=0){if(!seen)return;   // 수리부엉이 눈에만 솟을 자리의 금이 보인다
        const k=b.t/BERG.tell;c.save();c.strokeStyle=BLUE;c.globalAlpha=0.3+0.5*k;c.lineWidth=2;c.setLineDash([4,4]);c.beginPath();c.ellipse(b.x,b.y,BERG.r,BERG.r*0.45,0,0,Math.PI*2);c.stroke();c.restore();
        for(let i=0;i<5;i++){const a=b.seed+i*1.26;brush(c,[[b.x,b.y],[b.x+Math.cos(a)*BERG.r*k,b.y+Math.sin(a)*BERG.r*0.45*k]],1.4,BLUE_LT,0.8);}
        return;}
      const h=s<=BERG.rise?BERG.h*s/BERG.rise:s<=BERG.rise+BERG.hold?BERG.h:BERG.h*(1-(s-BERG.rise-BERG.hold)/BERG.fall),a=seen?1:0.1;
      const r=BERG.r,x=b.x,y=b.y;
      sharp(c,[[x-r,y],[x-r*0.6,y-h*0.55],[x-r*0.25,y-h*0.7],[x,y-h],[x+r*0.3,y-h*0.62],[x+r*0.7,y-h*0.4],[x+r,y]],ICE,a,FROST_DK,1.8);
      sharp(c,[[x-r*0.2,y],[x-r*0.1,y-h*0.6],[x,y-h],[x+r*0.12,y-h*0.5],[x+r*0.25,y]],'#ffffff',a*0.6);
      if(s<=BERG.rise+4)for(let i=0;i<7;i++){const q=i/7*Math.PI*2+b.seed;blob(c,x+Math.cos(q)*(r+s*1.5),y+Math.sin(q)*5-s*0.6,4,3,SNOW,seen?0.9:0.55);}}},
});

/* 둔갑마다 공격을 고른다. 둔갑 둘이 풀리면 숨는 발악(심장)을 남은 둔갑과 번갈아 쓴다 */
function pickNundok(){
  const n=nd();n.scars=[];n.furrows=[];B.ndLane=null;
  const animals=B.parts.filter(p=>!p.core&&!p.broken),core=part('core'),gone=B.parts.filter(p=>!p.core&&p.broken).length,first=!B.last;
  let p;
  if(!core.broken&&(gone>=2||!animals.length)&&(B.last!==core||!animals.length))p=core;
  else if(first)p=part('eagle');
  else{const o=animals.filter(q=>q!==B.last),pool=o.length?o:animals;p=pool[Math.floor(Math.random()*pool.length)];}
  B.cur=p;B.last=p;B.st='tell';B.t=first?70:p.core?80:52;B.hitThis=false;B.msg=p.tell;
  if(p.core){
    if(!n.hidSaid){n.hidSaid=true;learn('core:'+B.kind);B.msg='"숨어야겠어!" 눈도깨비가 눈보라 속으로 사라졌다.';}
    else B.msg='눈도깨비가 다시 눈보라 속으로 숨었다.';
    bLater(battleForm()==='owl'?'수리부엉이 눈에는 눈 밑에서 솟을 얼음의 금이 보인다.':'보이지 않는 것이 온다. 발밑 눈이 들썩인다.',34);
  }
}
/* 공격 뒤: 가슴이 열리고 심장이 튀어나와 판 위에 떨어진다 */
const OPEN_MSG={eagle:'독수리 깃이 벌어지며 심장이 튀어나왔다.',bear:'반달 가슴이 열리며 심장이 튀어나왔다.',boar:'갈기 밑이 갈라지며 심장이 튀어나왔다.',core:'모습이 드러났다. 헐떡이는 심장이 튀어나왔다.'};
function nundokOpen(p){
  let x,y;
  for(let n=0;n<30;n++){x=BOX.x+30+Math.random()*(BOX.w-60);y=BOX.y+34+Math.random()*(BOX.h-58);if(Math.hypot(x-B.px,y-B.py)>=70)break;}
  B.mark={x,y,t:150,max:150,part:p};nd().leap=16;B.msg=OPEN_MSG[p.id];
  return true;
}
/* 결정 D-682·결정 D-686: 심장을 친 뒤 그 둔갑이 깎이고, 연장이 있으면 확률로 도롱이 속 재료가 쏟아진다 */
function nundokHit(p,m){
  bSplash(m.x,m.y,BLUE);
  if(p.core)return;
  if(p.broken){B.msg=FORMS[p.id]+' 둔갑이 풀렸다! '+ITEMS[p.mat].n+' 획득.';return;}
  const tool=battleTool();if(!tool)return;
  const by=jo(toolName(tool),'으로','로')+' ',fit=toolFit(p,tool)==='bad'?' 효과가 적은 것 같다.':'';
  if(Math.random()<toolChance(p,T().nundok_spill_chance,tool)){B.loot.push(p.mat);B.msg=by+'심장을 쳤다! 도롱이 속에서 '+jo(ITEMS[p.mat].n,'이','가')+' 쏟아졌다.';}
  else B.msg=by+'심장을 쳤다! '+FORMS[p.id]+' 둔갑이 흔들린다.'+fit;
}
function tickNundok(){const n=nd();if(n.leap>0)n.leap--;if(n.swap>0)n.swap--;for(const s of n.scars)s.t++;for(const f of n.furrows)f.t++;}
/* 판 바닥: 발톱 자국 세 줄, 멧돼지 고랑, 떨어져 뛰는 심장 */
function drawNundokFloor(c){
  const n=nd();
  for(const f of n.furrows){const a=Math.min(1,f.t/8);c.save();c.fillStyle='rgba(157,188,203,.35)';c.globalAlpha=a;c.fillRect(BOX.x,f.y-5,BOX.w,10);c.restore();
    brush(c,[[BOX.x,f.y-6],[BOX.x+BOX.w,f.y-6]],2,SNOW,0.9*a);brush(c,[[BOX.x,f.y+6],[BOX.x+BOX.w,f.y+6]],2,FROST_DK,0.5*a);}
  for(const s of n.scars)for(const l of s.lines){brush(c,l,5,'#3a3f48',0.75);brush(c,[[l[0][0],l[0][1]-3],[l[1][0],l[1][1]-3]],1.6,SNOW,0.85);}
  if(B.mark&&B.st==='open'&&n.leap<=4){const m=B.mark;
    c.save();c.fillStyle='rgba(20,32,42,.35)';c.beginPath();c.ellipse(m.x,m.y+12,20,6,0,0,Math.PI*2);c.fill();c.restore();
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;brush(c,[[m.x+Math.cos(a)*14,m.y+12+Math.sin(a)*4],[m.x+Math.cos(a)*24,m.y+12+Math.sin(a)*7]],1.4,FROST_DK,0.6);}
    heartFlame(c,m.x,m.y,0.82);}
}
/* 가슴에서 심장까지 불 줄기. 튀어나오는 동안은 불덩이가 날아간다 (상자 밖까지 그린다) */
function drawNundokOver(c){
  const n=nd();if(!B.mark||B.st!=='open')return;
  const m=B.mark,f=shownForm(),chestY={eagle:48,bear:56,boar:70}[f]??34,sx=LW/2,sy=EY+chestY*0.84;
  const k=n.leap>0?1-n.leap/16:1,mx=sx+(m.x-sx)*k,my=sy+(m.y-sy)*k-Math.sin(k*Math.PI)*40;
  c.save();c.strokeStyle=BLUE_LT;c.globalAlpha=0.35;c.lineWidth=2;c.setLineDash([3,6]);c.lineDashOffset=still()?0:-B.time*0.6;
  c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo((sx+mx)/2,Math.min(sy,my)-30,mx,my);c.stroke();c.restore();
  if(n.leap>0)heartFlame(c,mx,my,0.7);
}

defineEnemies({
  dokkaebi:{name:'눈도깨비',calmLabel:'진정',
    // 결정 D-227: 전투 글귀는 일어난 일만 짧게. 피하라·치라는 안내는 쓰지 않는다
    intro:'"흐흐, 들켰네!" 까치 깃 도롱이를 두른 눈도깨비가 싸리비를 휘두른다.',
    settle:true,markLife:150,
    parts:tableParts('dokkaebi',{
      eagle:{atk:'ndWind',mark:'심',tell:'눈도깨비가 독수리로 둔갑해 날개를 편다.',weak:'눈도깨비가 약해졌다. 이제 독수리로는 둔갑하지 못한다.'},
      bear:{atk:'ndClaw',mark:'심',tell:'눈도깨비가 곰으로 둔갑해 앞발을 쳐든다.',weak:'눈도깨비가 약해졌다. 이제 곰으로는 둔갑하지 못한다.'},
      boar:{atk:'ndRush',mark:'심',tell:'눈도깨비가 멧돼지로 둔갑해 눈을 긁는다.',weak:'눈도깨비가 약해졌다. 이제 멧돼지로는 둔갑하지 못한다.'},
      core:{atk:'ndBerg',mark:'심',tell:'"숨어야겠어!" 눈도깨비가 눈보라 속으로 사라졌다.'}}),
    pickAttack:pickNundok,openMark:nundokOpen,onMarkHit:nundokHit,tickHazards:tickNundok,drawFloor:drawNundokFloor,drawOver:drawNundokOver,
    // 결정 D-243: 달래기는 메밀떡·엿 선물로만 한다
    likes:TABLES.CALM.dokkaebi,likeText:'눈도깨비가 좋아한다.',
    likeTexts:{memiltteok:'"메밀떡이다, 메밀떡!" 눈도깨비가 냄새를 맡고 덩실덩실 춤을 춘다. 고드름 수염이 짤랑댄다.',
      dad_yeot:'아빠가 맡긴 엿을 건넸다. "엿이다, 엿! 내 거지?" 눈도깨비가 엿가락을 소중히 끌어안는다. 엿은 돌려받지 못한다.'},
    coreHidden:'',coreShown:'',   // 결정 D-683: 심장은 발악 때 따로 알린다 (pickNundok)
    // PA-21 불씨 지급은 jangteo/story.js의 전투 종료 처리에서 한 번만 한다.
    calmWin:'눈도깨비가 훔친 설 제수를 돌려놓고 눈홍시 하나를 더 얹는다. "고맙다, 고마워! 이 불씨도 네 거다!" 가슴에서 푸른 불씨 하나를 떼어 준다.',calmGift:'nunhongsi',
    win:'심장 불이 사그라지자 눈도깨비가 눈 더미로 무너진다. 닳은 싸리비 한 자루와 까치 깃만 남았다.',
    lose:'눈도깨비의 눈보라에 창고 밖으로 내동댕이쳐졌다.',
    backdrop:drawStoreRoom,draw:drawNundok},
});
/* 필드에서 정체를 밝힐 때 쓰는 그림 (field.js): 도트 모습은 field.js 가 그린다 */
})();
