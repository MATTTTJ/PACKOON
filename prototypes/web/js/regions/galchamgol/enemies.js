'use strict';
/* 단풍골 전투: 엉킨 칡(보스)과 무쇠의 시험(NPC 전투). 원본 표: design/data/bosses.csv · boss_parts.csv */
(()=>{
/* ---------- 엉킨 칡 ----------
   결정 D-157: 엉킨 칡은 당산나무 줄기를 감아 오른 뱀 같은 덩굴이다 (사용자 피드백 13, 2026-11-01).
   몸통 덩굴이 줄기를 두 바퀴 반 감고 머리를 쳐든다. 칡꽃송이는 결정 D-542 로 머리가 아니라 앞쪽 몸 마디에 핀다. 부위는 셋:
   칡줄기(털 난 덩굴과 세 갈래 잎. 꼬리 쪽 줄기로 채찍질), 칡뿌리(밑동의 굵은 덩이뿌리. 위에서 내리찍기), 칡꽃(핵심. 달큰한 향).
   칡꽃과 그 향만 연보라 담채로 칠한다. 먹·붉은색 원칙(D-102)에 불처럼 둔 예외다. */
const KPUR='#7d5096',KPUR_LT='#b791cc',KPUR_DK='#4c2b5e',KSTEM='#23221a',KLEAF='#2e3527',KROOT='#8a6a4a';
/* 털 난 덩굴: 붓줄기 위에 짧은 잔털을 엇갈려 세운다 */
function kStem(c,pts,w,col,alpha=1){
  brush(c,pts,w,col,alpha);
  c.save();c.strokeStyle=col;c.globalAlpha=alpha*0.6;c.lineWidth=1;c.lineCap='round';c.beginPath();
  for(let i=1;i<pts.length;i++){
    const [x0,y0]=pts[i-1],[x1,y1]=pts[i],len=Math.hypot(x1-x0,y1-y0)||1,ux=(x1-x0)/len,uy=(y1-y0)/len;
    for(let d=3,n=0;d<len;d+=6,n++){const s=n%2?1:-1,x=x0+ux*d,y=y0+uy*d,r=w*0.5;
      c.moveTo(x-uy*s*r,y+ux*s*r);c.lineTo(x-uy*s*(r+3)+ux*2,y+ux*s*(r+3)+uy*2);}
  }
  c.stroke();c.restore();
}
/* 칡잎: 잎자루 끝에 넓은 달걀꼴 작은잎 셋 (가운데가 가장 크다) */
function kLeaf(c,x,y,s,rot,col=KLEAF,alpha=1){
  c.save();c.translate(x,y);c.rotate(rot);c.globalAlpha=alpha;
  c.strokeStyle=col;c.lineWidth=1.6*s;c.lineCap='round';c.beginPath();c.moveTo(0,9*s);c.lineTo(0,0);c.stroke();
  const leaflet=(a,len,wid)=>{c.save();c.rotate(a);c.fillStyle=col;c.beginPath();c.moveTo(0,0);
    c.bezierCurveTo(wid,-len*0.12,wid*0.95,-len*0.78,0,-len);c.bezierCurveTo(-wid*0.95,-len*0.78,-wid,-len*0.12,0,0);c.fill();
    c.strokeStyle='rgba(239,227,200,.38)';c.lineWidth=0.9;c.beginPath();c.moveTo(0,-1);c.lineTo(0,-len*0.85);c.stroke();c.restore();};
  leaflet(-1.2,13*s,7*s);leaflet(1.2,13*s,7*s);leaflet(0,17*s,9*s);
  c.restore();
}
/* 칡꽃송이: 꽃대 아래부터 나비 모양 꽃이 피고 위로 갈수록 봉오리. lean 은 꽃대 끝이 기우는 정도, len<0 이면 아래로 늘어진다.
   결정 D-620: wilt(0~1)를 주면 시든 꽃이다. 꽃대 끝이 고개를 숙이고, 꽃잎이 작아져 아래로 처지며 빛이 바랜다 (사용자 피드백 2026-11-05 단풍골 6).
   pal 을 주면 꽃 빛깔을 바꾼다 (싱싱한 약점 꽃). */
const KWILT='#a28c97',KWILT_DK='#5e4c55',KWILT_EDGE='#8a6a4e';
function kFlower(c,x,y,len,lean,petal,alpha=1,wilt=0,pal=null){
  const droop=wilt*Math.abs(len)*0.55*(lean<0?-1:1);
  const A=[x,y],Bp=[x+lean*0.35+droop*0.25,y-len*0.5],C=[x+lean+droop,y-len*(1-wilt*0.45)];
  const at=k=>[(1-k)*(1-k)*A[0]+2*(1-k)*k*Bp[0]+k*k*C[0],(1-k)*(1-k)*A[1]+2*(1-k)*k*Bp[1]+k*k*C[1]];
  brush(c,[A,Bp,C],2.2*(1-wilt*0.25),wilt?'#3a3528':(pal?.stem||KSTEM),alpha);
  const dk=pal?.dk||(wilt?KWILT_DK:KPUR_DK),col=wilt&&!pal?KWILT:petal,spot=pal?.spot||'#efe3c8';
  const n=wilt?8:11;
  for(let i=0;i<n;i++){const k=0.06+i*0.09,[px,py]=at(k),s=Math.sign(len)*(i%2?1:-1),z=8.4*(1-k*0.55)*(1-wilt*0.3),sag=wilt*z*0.55;
    if(k<0.66){
      blob(c,px+s*z*0.9,py+z*0.35+sag,z*0.5,z*0.34,dk,alpha);                    // 용골·날개 꽃잎
      blob(c,px+s*z*0.55,py-z*0.1+sag,z*0.78,z*(0.66-wilt*0.22),col,alpha);      // 기 꽃잎 (시들면 납작하게 처진다)
      if(wilt)blob(c,px+s*z*0.95,py+sag*1.2,z*0.3,z*0.18,KWILT_EDGE,alpha*0.7);  // 마른 꽃잎 끝
      else blob(c,px+s*z*0.5,py-z*0.12,z*0.18,z*0.16,spot,alpha*(pal?0.6:0.75));            // 기 꽃잎 가운데의 무늬
    }else blob(c,px+s*z*0.3,py+sag,z*0.36,z*0.58,dk,alpha);                      // 봉오리
  }
}
/* 결정 D-541: 칡뿌리는 오래 묵어 흙투성이다 (사용자 피드백 2026-11-04 단풍골 12). 겉껍질이 갈라지고 벗겨졌으며,
   아래쪽은 젖은 흙이 덩어리째 들러붙어 있고 실뿌리에도 흙이 매달려 있다. */
const KROOT_OLD='#76593f',KSOIL='#4b3a2a',KSOIL_LT='#6e5640';
function kSoil(c,x,y,r,alpha=1,seed=0){   // 들러붙은 흙덩이 하나: 짙은 덩이에 옅은 알갱이 두엇
  blob(c,x,y,r,r*0.75,KSOIL,0.92*alpha);blob(c,x-r*0.3,y-r*0.25,r*0.35,r*0.28,KSOIL_LT,0.8*alpha);
  if(hash(seed+x*0.13)>0.5)blob(c,x+r*0.5,y+r*0.35,r*0.22,r*0.2,'#2f241a',0.8*alpha);
}
/* 덩이뿌리: 머리(-x)가 굵고 꼬리(+x)로 가늘어지는 길쭉한 뿌리. 갈라진 겉, 벗겨진 껍질, 아래쪽에 들러붙은 흙, 흙 매단 실뿌리 */
function kTuber(c,x,y,len,wid,rot,fill,line,alpha=1){
  c.save();c.translate(x,y);c.rotate(rot);c.globalAlpha=alpha;
  const n=14,top=[],bot=[];
  for(let i=0;i<=n;i++){const s=i/n,px=-len/2+s*len,w=wid*Math.pow(Math.sin(Math.PI*Math.min(1,s*0.85+0.08)),0.7)*(1.05-0.75*s)*(1+(hash(i*1.7+len)-0.5)*0.3);
    top.push([px,-w]);bot.push([px,w*(0.85+hash(i*2.9+wid)*0.2)]);}
  const shape=()=>{c.beginPath();c.moveTo(top[0][0],top[0][1]);for(const p of top)c.lineTo(p[0],p[1]);for(let i=bot.length-1;i>=0;i--)c.lineTo(bot[i][0],bot[i][1]);c.closePath();};
  const g=c.createLinearGradient(0,-wid,0,wid);g.addColorStop(0,fill===KROOT?KROOT_OLD:fill);g.addColorStop(0.55,fill===KROOT?'#6a4f37':fill);g.addColorStop(1,KSOIL);
  c.fillStyle=g;shape();c.fill();
  c.strokeStyle=line;c.lineWidth=1.8;c.lineJoin='round';c.stroke();
  // 갈라진 겉: 가로로 터진 금과 세로 결
  c.strokeStyle='rgba(29,24,20,.5)';c.lineWidth=1;c.beginPath();
  for(let k=-1;k<=1;k++){c.moveTo(-len*0.38,k*wid*0.35);c.quadraticCurveTo(0,k*wid*0.42+1,len*0.3,k*wid*0.18);}
  for(let i=0;i<5;i++){const px=-len*0.36+i*len*0.16,h=wid*(0.5-i*0.06);c.moveTo(px,-h);c.lineTo(px+2,-h*0.2);c.lineTo(px-1,h*0.3);}
  c.stroke();
  // 벗겨진 껍질 조각
  for(let i=0;i<3;i++){const px=-len*0.3+i*len*0.22,py=-wid*0.35+hash(i+len)*wid*0.3;
    c.fillStyle='rgba(176,148,110,.55)';c.beginPath();c.moveTo(px,py);c.lineTo(px+5,py-1.5);c.lineTo(px+4,py+2.5);c.closePath();c.fill();}
  // 아래쪽에 들러붙은 흙덩이
  for(let i=0;i<7;i++){const s=0.06+i*0.13,b=bot[Math.round(s*n)];kSoil(c,b[0],b[1]-1,3+hash(i*3.7+len)*3,1,i);}
  for(let i=0;i<3;i++){const s=0.2+i*0.22,tp=top[Math.round(s*n)];kSoil(c,tp[0],tp[1]+2,2+hash(i*5.1+len)*1.6,0.9,i+20);}   // 위에도 흙이 묻었다
  // 꼬리 끝에서 이어지는 가는 뿌리와 흙 매단 실뿌리
  brush(c,[[len/2-2,0],[len/2+10,3],[len/2+20,-1]],1.6,line,0.8);
  c.strokeStyle=line;c.globalAlpha=alpha*0.6;c.lineWidth=0.9;c.beginPath();
  c.moveTo(len*0.32,wid*0.3);c.quadraticCurveTo(len*0.38,wid+4,len*0.46,wid+8);c.moveTo(len*0.1,-wid*0.6);c.quadraticCurveTo(len*0.14,-wid-3,len*0.2,-wid-6);
  c.moveTo(-len*0.2,wid*0.8);c.quadraticCurveTo(-len*0.24,wid+5,-len*0.18,wid+9);c.moveTo(len*0.05,wid*0.7);c.lineTo(len*0.07,wid+6);c.stroke();
  c.globalAlpha=alpha;kSoil(c,len*0.46,wid+8,1.6,1,7);kSoil(c,-len*0.18,wid+9,1.8,1,8);
  c.restore();
}
/* ---------- 칡빛 독사의 몸 ----------
   결정 D-540: 엉킨 칡은 칡 빛깔의 독사다 (사용자 피드백 2026-11-04 단풍골 12). 칡줄기의 올리브 갈색 몸에 짙은 마름모 무늬,
   옅은 배비늘 줄, 칡의 잔털. 굵은 몸은 원을 이어 그려 마디 없이 둥글게 보인다. */
const KBODY='#5b5833',KBODY_DK='#2a2818',KBELLY='#a39769',KHAIR='#7f6b45',KEYE='#c4a548';
/* 꺾은선을 같은 간격의 점(x, y, 방향)으로 */
function kPath(pts,step){
  const out=[];let carry=0;
  for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i],len=Math.hypot(x1-x0,y1-y0)||1,ux=(x1-x0)/len,uy=(y1-y0)/len;let d=carry;
    for(;d<len;d+=step)out.push([x0+ux*d,y0+uy*d,ux,uy]);carry=d-len;}
  return out;
}
/* 몸 한 토막. w0 에서 w1 로 가늘어진다. col 은 몸빛(시들면 흐린 빛) */
function kSnake(c,pts,w0,w1=w0,alpha=1,col=KBODY){
  const S=kPath(pts,2.5),n=S.length;if(!n)return;
  const R=i=>(w0+(w1-w0)*i/Math.max(1,n-1))/2;
  c.save();c.globalAlpha=alpha;
  c.fillStyle=INK;for(let i=0;i<n;i++){c.beginPath();c.arc(S[i][0],S[i][1],R(i)+1.6,0,Math.PI*2);c.fill();}
  c.fillStyle=col;for(let i=0;i<n;i++){c.beginPath();c.arc(S[i][0],S[i][1],R(i),0,Math.PI*2);c.fill();}
  c.fillStyle=KBELLY;c.globalAlpha=alpha*0.45;   // 아래쪽 배비늘 줄
  for(let i=0;i<n;i++){const [x,y,tx,ty]=S[i],s=tx>=0?1:-1,r=R(i);c.beginPath();c.arc(x-ty*s*r*0.5,y+tx*s*r*0.5,r*0.36,0,Math.PI*2);c.fill();}
  c.fillStyle=KBODY_DK;c.globalAlpha=alpha*0.92;   // 등의 마름모 무늬
  for(let i=3;i<n-2;i+=6){const [x,y,tx,ty]=S[i],r=R(i);c.save();c.translate(x,y);c.rotate(Math.atan2(ty,tx));
    c.beginPath();c.moveTo(-r*0.95,-r*0.1);c.lineTo(0,-r*0.8);c.lineTo(r*0.95,-r*0.1);c.lineTo(0,r*0.45);c.closePath();c.fill();c.restore();}
  c.strokeStyle=KHAIR;c.globalAlpha=alpha*0.6;c.lineWidth=1;c.lineCap='round';c.beginPath();   // 칡의 잔털
  for(let i=0;i<n;i+=2){const [x,y,tx,ty]=S[i],s=(i>>1)%2?1:-1,r=R(i)+1;c.moveTo(x-ty*s*r,y+tx*s*r);c.lineTo(x-ty*s*(r+3)+tx*2,y+tx*s*(r+3)+ty*2);}
  c.stroke();c.restore();
}
/* 독사 머리: 뒤가 넓은 세모꼴. 눈두덩이 눈을 내리눌러 노려보고, 동공은 세로로 가늘다. 오래된 흉터 두 줄.
   rot 은 주둥이가 향하는 쪽(아래가 0). open 이면 입을 벌려 송곳니를 보인다. closed 면 눈을 감는다 */
function kViper(c,hx,hy,rot,col,closed,open){
  c.save();c.translate(hx,hy);c.rotate(rot);c.scale(1.4,1.4);
  // 결정 D-748: 둥글던 머리를 모난 세모꼴로 깎았다. 턱 뒤가 넓게 각지고 주둥이로 날카롭게 좁아진다 (사용자 피드백 2026-11-05: 보스는 귀엽지 않게)
  const HP=[[0,-16],[13,-15.5],[21,-8],[22.5,1],[14,15],[5,24],[0,25.5],[-5,24],[-14,15],[-22.5,1],[-21,-8],[-13,-15.5]];
  const head=()=>{c.beginPath();HP.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
  if(open){c.fillStyle='#3a1f1c';c.beginPath();c.moveTo(-7,19);c.quadraticCurveTo(0,33,7,19);c.closePath();c.fill();   // 벌린 입 속
    for(const s of [-1,1]){c.fillStyle='#efe3c8';c.beginPath();c.moveTo(s*5,20);c.lineTo(s*3.2,30);c.lineTo(s*2.4,20.5);c.closePath();c.fill();}}
  c.fillStyle=INK;c.save();c.scale(1.08,1.07);head();c.fill();c.restore();
  c.fillStyle=col;c.lineJoin='round';head();c.fill();
  blob(c,0,-3,11,8,KBODY_DK,0.55);   // 정수리의 짙은 큰 비늘
  for(const s of [-1,1]){
    brush(c,[[s*8,4],[s*14,-1],[s*19,-7]],3.2,KBODY_DK,0.85);   // 눈 뒤로 이어지는 짙은 띠
    blob(c,s*5.5,14,1.6,1.3,INK,0.85);blob(c,s*2.8,20.5,1.1,0.9,INK,0.9);   // 열 구멍과 콧구멍
    brush(c,[[s*7,21],[s*13,13],[s*18,4]],1,INK,0.6);   // 입선
  }
  brush(c,[[-13,-12],[-4,-2],[1,3]],1.5,'#cbbf98',0.75);brush(c,[[6,-13],[10,-6]],1.3,'#cbbf98',0.6);   // 오래된 흉터
  if(closed){for(const s of [-1,1])brush(c,[[s*13,4],[s*5,6]],2.2,'#efe3c8');}
  else{const [ex,ey]=lookAt(hx,hy),ca=Math.cos(-rot),sa=Math.sin(-rot),lx=(ex*ca-ey*sa)*0.4,ly=(ex*sa+ey*ca)*0.4;
    for(const s of [-1,1]){   // 결정 D-748: 가늘게 찢어진 눈. 바깥 끝이 치켜 올라가 노려본다
      c.save();c.translate(s*9.5,4.6);c.rotate(s*-0.32);blob(c,0,0,4.2,2.1,KEYE);blob(c,0,0,4.2,2.1,'#7a5a20',0.2);c.restore();
      blob(c,s*9.5+lx,4.6+ly,0.7,2.2,INK);}}
  for(const s of [-1,1]){brush(c,[[s*20,-3],[s*12,0.5],[s*3.5,4.5]],4.2,INK);   // 내리누른 눈두덩
    brush(c,[[s*15,-1.5],[s*19,-8.5],[s*21,-12]],2.6,INK);brush(c,[[s*15.5,-2],[s*18.5,-8]],1.1,KBODY_DK,0.9);}   // 눈 위로 돋은 뿔비늘
  c.restore();
}
/* 당산나무 앞 줄기: 늙고 굵은 느티나무. 밑동이 퍼져 땅을 움켜쥐고, 깊게 팬 껍질과 옹이, 이끼. 위는 화면 밖으로 이어진다 */
function kTrunk(c,cx,cy,TW){
  const top=cy-180,base=cy+101;
  c.save();
  const g=c.createLinearGradient(cx-TW,0,cx+TW,0);g.addColorStop(0,'#3a2e25');g.addColorStop(0.4,'#64503f');g.addColorStop(0.75,'#7a6550');g.addColorStop(1,'#43362b');
  c.fillStyle=g;c.globalAlpha=0.96;c.beginPath();
  c.moveTo(cx-TW-42,base+2);c.quadraticCurveTo(cx-TW-8,base-4,cx-TW-3,base-50);c.lineTo(cx-TW+5,top);c.lineTo(cx+TW-5,top);
  c.lineTo(cx+TW+3,base-50);c.quadraticCurveTo(cx+TW+8,base-4,cx+TW+44,base+2);c.closePath();c.fill();c.restore();
  brush(c,[[cx-TW-42,base+2],[cx-TW-8,base-6],[cx-TW-3,base-50],[cx-TW+5,top]],3.6,INK,0.85);
  brush(c,[[cx+TW+44,base+2],[cx+TW+8,base-6],[cx+TW+3,base-50],[cx+TW-5,top]],3.6,INK,0.85);
  // 땅을 움켜쥔 굵은 뿌리 둘
  brush(c,[[cx-TW*0.4,base-18],[cx-TW*0.7,base-6],[cx-TW-24,base+2]],7,'#4d3d30',0.8);brush(c,[[cx+TW*0.3,base-16],[cx+TW*0.75,base-4],[cx+TW+26,base+3]],7,'#4d3d30',0.8);
  // 깊게 팬 껍질 골
  for(let i=0;i<9;i++){const x=cx-TW*0.82+i*TW*0.205,w=hash(i*3.1)*6-3;
    brush(c,[[x+w,base-8],[x-w*0.6+hash(i)*4,cy+20],[x+w,cy-60],[x-w+2,top]],1.6+hash(i*7.7)*1.4,INK,0.3);}
  for(let i=0;i<14;i++){const x=cx-TW*0.8+hash(i*5.3)*TW*1.6,y=top+30+hash(i*2.2)*(base-top-60);brush(c,[[x,y],[x+5,y+1.5]],1.1,INK,0.28);}   // 껍질 비늘 틈
  // 옹이와 이끼
  {const ox=cx-TW*0.42,oy=cy+64;blob(c,ox,oy,9,12,'#3a2e25',0.85);c.save();c.strokeStyle=INK;c.globalAlpha=0.5;c.lineWidth=1.2;for(const r of [5,8,11]){c.beginPath();c.ellipse(ox,oy,r*0.75,r,0,0,Math.PI*2);c.stroke();}c.restore();}
  for(let i=0;i<7;i++)blob(c,cx-TW-10+hash(i*1.9)*(2*TW+20),base-4-hash(i*4.4)*30,6+hash(i)*5,3,'#68704a',0.32);
}
/* 금줄: 줄기를 가로지른 왼새끼에 흰 한지 조각과 솔가지를 끼웠다(번개 모양으로 접은 종이는 일본 표식이라 쓰지 않는다).
   몸에 짓눌린 한지는 찢겨 비스듬히 늘어졌다 */
function kRope(c,cx,y,TW){
  const L=cx-TW-2,Rr=cx+TW+2,P=t=>[L+(Rr-L)*t,y+Math.sin(t*Math.PI)*9];
  const pts=Array.from({length:9},(_,i)=>P(i/8));
  brush(c,pts,5.5,'#8a7454',0.95);
  c.save();c.strokeStyle='#4f4030';c.globalAlpha=0.8;c.lineWidth=1.2;c.beginPath();
  for(let i=1;i<24;i++){const [x,yy]=P(i/24);c.moveTo(x-2,yy-2.5);c.lineTo(x+2,yy+2.5);}c.stroke();c.restore();   // 꼬인 결
  for(let i=0;i<7;i++){const t=0.08+i*0.14,[x,yy]=P(t),torn=i===2||i===5,len=torn?8:16,lean=torn?0.4:(hash(i*3.3)-0.5)*0.2;
    c.save();c.translate(x,yy+1);c.rotate(lean);
    if(i%3===1){brush(c,[[0,0],[-3,7],[-5,12]],1.4,'#3f5a33',0.9);brush(c,[[0,0],[2,8],[4,13]],1.4,'#3f5a33',0.9);}   // 솔가지
    else{c.fillStyle=INK;c.globalAlpha=0.5;c.fillRect(-3.4,-0.6,6.8,len+1.2);c.fillStyle='#f4efe2';c.globalAlpha=0.97;c.fillRect(-2.8,0,5.6,len);
      if(torn){c.fillStyle='#f4efe2';c.beginPath();c.moveTo(-2.8,len);c.lineTo(-1,len+3);c.lineTo(0.5,len);c.lineTo(2.8,len+2);c.lineTo(2.8,len);c.fill();}}
    c.restore();}
}
function drawKudzu(c){
  const cx=LW/2,cy=EY,arm=part('arm'),root=part('root'),core=part('core');
  const still=Vfx.reducedMotion,t=B.time,sway=still?0:Math.sin(t*0.03)*6;
  const acting=id=>B.cur&&B.cur.id===id&&(B.st==='tell'||B.st==='atk');
  const end=B.st==='end'&&B.result!=='lose';
  const TW=56,CR=TW+10;   // 줄기 반폭, 감은 몸이 도는 반지름
  // 땅과 그늘
  blob(c,cx,cy+104,250,16,INK,0.12);brush(c,[[cx-260,cy+102],[cx,cy+98],[cx+260,cy+103]],3,INK,0.35);
  // 밑동의 돌무더기(서낭 돌탑)와 정화수를 올린 제단 돌
  {const sx=cx-TW-150,sy=cy+100;for(const [dx,dy,rx,ry] of [[0,0,16,7],[2,-11,12,6],[-1,-20,9,5],[1,-27,6,4]]){blob(c,sx+dx,sy+dy,rx,ry,'#8d8678',0.85);c.save();c.strokeStyle=INK;c.globalAlpha=0.6;c.lineWidth=1.3;c.beginPath();c.ellipse(sx+dx,sy+dy,rx,ry,0,0,Math.PI*2);c.stroke();c.restore();}}
  {const ax=cx+TW+96,ay=cy+98;c.save();c.fillStyle='#9a9384';c.globalAlpha=0.9;c.beginPath();c.moveTo(ax-34,ay+4);c.lineTo(ax-30,ay-8);c.lineTo(ax+32,ay-10);c.lineTo(ax+36,ay+4);c.closePath();c.fill();c.restore();
    brush(c,[[ax-34,ay+4],[ax-30,ay-8],[ax+32,ay-10],[ax+36,ay+4]],2,INK,0.7);blob(c,ax+6,ay-13,7,3.5,'#efe8d8',0.95);brush(c,[[ax-1,ay-13],[ax+6,ay-17],[ax+13,ay-13]],1.2,INK,0.6);}
  // 감은 몸: 줄기 뒤로 도는 마디는 줄기보다 먼저(줄기에 가린다), 앞으로 도는 마디는 나중에
  const aO=shk(arm),wob=still?0:Math.sin(t*0.02)*0.08,H=[];
  for(let i=0;i<=60;i++){const s=i/60,a=s*Math.PI*4+0.4+wob;H.push([cx+aO+Math.sin(a)*CR,cy+84-s*150,Math.cos(a)]);}
  const runs=front=>{const out=[];let cur=null;
    for(let i=1;i<H.length;i++){const f=(H[i-1][2]+H[i][2])>0;if(f===front){if(!cur){cur=[[H[i-1][0],H[i-1][1]]];out.push(cur);}cur.push([H[i][0],H[i][1]]);}else cur=null;}
    return out.filter(r=>r.length>1);};
  const body=end?'#4b4834':KBODY;
  for(const r of runs(false))kSnake(c,r,16,16,0.95,end?'#3f3d2c':'#47452a');
  kTrunk(c,cx,cy,TW);
  kRope(c,cx,cy+50,TW);
  // 칡뿌리: 밑동에 드러난 굵은 덩이뿌리. 가운데 것이 쳐들려 내리찍는다
  {const o=shk(root),col=partCol(root),dim=root.broken?0.35:1,line=col===INK?INK:col,L=cx-TW-24,Rx=cx+TW+24;
    brush(c,[[L+o,cy+96],[L-32+o,cy+100],[L-54+o,cy+98]],5,KROOT_OLD,0.85*dim);brush(c,[[Rx+o,cy+96],[Rx+18+o,cy+99]],5,KROOT_OLD,0.85*dim);
    for(const [mx,mw] of [[L-76,30],[Rx+40,26],[L-12,40]])blob(c,mx+o,cy+104,mw,6,KSOIL,0.55*dim);   // 파헤쳐진 흙 무더기
    kTuber(c,L-76+o,cy+98,44,11,Math.PI+0.06,KROOT,INK,0.85*dim);kTuber(c,Rx+40+o,cy+99,40,10,-0.05,KROOT,INK,0.85*dim);
    if(acting('root')&&B.st==='tell'){brush(c,[[L+o,cy+92],[L-60+o,cy+66],[L-92+o,cy+16]],13,KROOT_OLD,0.95);kTuber(c,L-96+o,cy-12,62,18,Math.PI/2+0.12,KROOT,line,1);
      if(!still)for(let i=0;i<4;i++){const k=((t*0.06+i*0.25)%1);kSoil(c,L-96+o+(hash(i)-0.5)*14,cy+20+k*80,1.6,1-k,i);}}   // 쳐든 뿌리에서 흙이 떨어진다
    else if(acting('root'))brush(c,[[L+o,cy+92],[L-30+o,cy+122],[L-40+o,cy+152]],13,KROOT_OLD,0.9);
    else if(root.broken){   // 결정 D-370: 부러진 덩이뿌리는 두 동강 나 땅에 떨어져 있다 (흐리게 붙어 있지 않다)
      kTuber(c,L+6,cy+106,34,13,Math.PI-0.1,KROOT,INK,0.8);kTuber(c,L-50,cy+112,30,12,Math.PI+0.35,KROOT,INK,0.75);
      blob(c,L-12,cy+107,4,7,'#efe3c8',0.85);blob(c,L-32,cy+111,4,6,'#efe3c8',0.8);   // 부러진 단면
      for(let i=0;i<5;i++)kSoil(c,L-24+i*7+hash(i)*4,cy+116+hash(i*2.3)*3,2,0.8,i);}
    else kTuber(c,L-12+o,cy+104,62,16,Math.PI-0.04,KROOT,line,dim);}
  // 줄기 앞으로 도는 마디와 몸에서 돋은 칡잎
  for(const r of runs(true))kSnake(c,r,17,17,1,body);
  for(const i of [6,19,45])if(H[i][2]>0)kLeaf(c,H[i][0],H[i][1]-6,0.85,i%2?-0.8:0.9,end?'#55503a':KLEAF,0.9);
  // 칡줄기: 꼬리가 칡줄기로 가늘어진 채찍이다. 예고 때 뒤로 감기고, 후려칠 땐 상자 쪽으로 뻗는다
  {const o=shk(arm),col=partCol(arm),sx=H[0][0]+o,sy=H[0][1],X=cx+TW-27;let pts;
    if(arm.broken)pts=[[sx,sy],[X+50+o,cy+82],[X+62+o,cy+92]];   // 결정 D-370: 끊긴 줄기는 짧은 그루터기만 남는다
    else if(acting('arm')&&B.st==='tell')pts=[[sx,sy],[X+82+o,cy+12],[X+112+o,cy-50],[X+152+o,cy-90],[X+190+o,cy-76],[X+184+o,cy-52]];
    else if(acting('arm'))pts=[[sx,sy],[X+104+o,cy+70],[X+172+o,cy+112],[X+222+o,cy+152]];
    else pts=[[sx,sy],[X+92+o,cy+40],[X+150+o,cy+5+sway],[X+170+o,cy-40+sway],[X+148+o,cy-66+sway],[X+132+o,cy-54+sway]];
    const red=col!==INK&&!arm.broken;
    kSnake(c,pts.slice(0,3),16,9,1,red?col:body);kStem(c,pts.slice(2),arm.broken?7:9,red?col:KSTEM,1);
    const n=pts.length;if(!arm.broken)for(let i=2;i<n-1;i++)kLeaf(c,pts[i][0],pts[i][1]-4,0.85,i%2?-0.7:0.7,red?col:KLEAF,0.9);
    if(arm.broken){const [ex,ey]=pts[n-1];blob(c,ex,ey,4.5,3.5,'#efe3c8',0.95);blob(c,ex,ey,2,1.6,'#9c8a62',0.9);   // 잘린 단면
      kStem(c,[[X+92,cy+104],[X+130,cy+106],[X+168,cy+102],[X+204,cy+106]],6,'#3b3a2c',0.75);   // 땅에 떨어져 시든 덩굴
      for(const [lx,ly,r] of [[X+118,cy+100,0.4],[X+160,cy+98,-0.5],[X+194,cy+101,0.3]])kLeaf(c,lx,ly,0.7,r,'#6b5a3a',0.6);}}
  // 결정 D-542: 칡꽃(핵심)은 머리가 아니라 줄기 앞을 도는 몸 마디에 핀다 (사용자 피드백 2026-11-04 단풍골 14)
  {const fi=28,[fx,fy]=H[fi],o=shk(core),col=partCol(core),petal=col===RED?RED:KPUR;
    if(core.broken){kFlower(c,fx+o,fy-4,-30,-12,KPUR_LT,0.35);for(let i=0;i<6;i++)blob(c,fx-40+i*14+hash(i)*6,cy+98-hash(i*3.1)*4,3,2,KPUR_LT,0.5);}
    else{kLeaf(c,fx-12+o,fy-2,0.8,-1.1,KLEAF,0.9);const w=col===RED?0:0.55;   // 결정 D-620: 몸에 핀 칡꽃도 시들어 고개를 숙였다
      kFlower(c,fx-2+o,fy-7,56,-12+sway*0.5,petal,1,w);kFlower(c,fx+9+o,fy-5,38,10-sway*0.3,petal,0.9,w);}
    // 핵심이 가려져 있는 동안은 큰 잎이 꽃송이를 덮는다
    if(coreHidden()){kLeaf(c,fx-10,fy-10,1.6,-0.5,KLEAF,0.97);kLeaf(c,fx+10,fy-24,1.7,0.35,KLEAF,0.97);kLeaf(c,fx-4,fy-42,1.45,-0.1,KLEAF,0.97);kLeaf(c,fx+14,fy-6,1.3,0.9,KLEAF,0.97);}}
  // 쳐든 목과 독사 머리. 공격하는 동안은 입을 벌린다
  {const top=H[H.length-1],hx=cx-TW-60+sway*0.4,hy=cy-34,o=shk(core);
    kSnake(c,[[top[0],top[1]],[cx-4+o,cy-96],[cx-TW-14+o,cy-98],[hx+18+o+sway*0.3,cy-72],[hx+6,hy-12]],17,13,1,body);
    const aim=Math.atan2(B.py-hy,B.px-hx)-Math.PI/2,rot=clamp(aim,-0.7,0.5)+(still?0:Math.sin(t*0.05)*0.04);
    const open=!end&&!core.broken&&(B.st==='tell'||B.st==='atk');
    kViper(c,hx+o,hy,rot,end||core.broken?'#47452f':body,end||core.broken,open);
    if(!still&&!open&&!end&&Math.floor(t/40)%4===0){const sx=hx+o-Math.sin(rot)*37,sy=hy+Math.cos(rot)*37;   // 덩굴손 혀를 날름
      brush(c,[[sx,sy],[sx+2,sy+7],[sx+1,sy+12]],1.4,KSTEM);brush(c,[[sx+1,sy+12],[sx-3,sy+16],[sx-2,sy+19]],1,KSTEM);brush(c,[[sx+1,sy+12],[sx+5,sy+16],[sx+4,sy+19]],1,KSTEM);}}
}
/* ---------- 무쇠의 시험 ----------
   결정 D-58: 배경은 무쇠 뒤쪽 화면 전체가 대장간이다. 벽돌 벽, 화덕과 풀무, 모루, 벽에 걸린 연장, 숯 더미.
   결정 D-59: 무쇠는 조카를 혼내며 가르치는 중이라 무기를 들지 않는다. 공격은 꿀밤 하나다.
     손 자리에 그림자가 지고(예고) → 주먹이 위에서 내리꽂힌다 → 쿵. 판마다 한 대 → 두 대 → 세 대, 예고는 점점 짧아진다.
   결정 D-60: 전투판 곳곳의 화덕 불씨가 어두운 불씨 → 살아나는 불(예고) → 밝은 불꽃으로 돈다. 밝은 불꽃 위에 오래 있으면 체력이 하나 닳는다.
     여섯 판을 버티면 입력을 막고 피할 수 없는 꿀밤 연출이 나온다. 몇 대는 손 옆에 떨어지고 마지막 한 대가 손등을 쥐어박는다. 이 연출로는 체력이 깎이지 않는다.
   수치는 tuning.csv 의 musoe_* 줄. */
const T=()=>TABLES.TUNING;
// 화덕 불씨 자리(판정 상자 비율). 시작 손 자리(가운데 아래)는 비운다. 처음 위상은 모두 어두운 불씨다.
const EMBERS=[{u:0.16,v:0.3,off:0},{u:0.84,v:0.26,off:40},{u:0.3,v:0.84,off:80},{u:0.74,v:0.8,off:120}];
function emberState(e){
  const t=T(),cycle=t.musoe_fire_cycle,warn=t.musoe_fire_warn,burn=t.musoe_fire_burn,pos=((B.fireT||0)+e.off)%cycle,calm=cycle-warn-burn;
  if(!B.fireOn||pos<calm||B.st==='finale'||B.st==='end')return {k:'ember',a:0};   // 마지막 연출부터는 불씨가 잦아든다
  if(pos<calm+warn)return {k:'warn',a:(pos-calm)/warn};
  return {k:'burn',a:1-(pos-calm-warn)/burn};
}
const emberPoint=e=>coverPoint(e);
function tickForgeFire(){
  if(!B.fireOn&&B.survived>=1){B.fireOn=true;B.fireT=0;}
  if(!B.fireOn)return;
  B.fireT++;
  let on=false;
  for(const e of EMBERS){
    const s=emberState(e),p=emberPoint(e);
    if(s.k==='warn'&&!B.fireTold){B.fireTold=true;B.msg='화덕 불씨가 살아난다! 밝아지기 전에 그 자리를 비켜라.';}
    if(s.k==='burn'&&Math.hypot(B.px-p.x,B.py-p.y)<T().musoe_fire_radius)on=true;
  }
  if(on){
    B.heat=(B.heat||0)+1;
    if(B.heat>=T().musoe_fire_heat&&B.inv<=0){
      // 불꽃은 꿀밤이 아니다: 맞은 횟수(hits)는 세지 않고 체력만 하나 닳는다.
      B.heat=0;G.hp-=1;B.burns=(B.burns||0)+1;B.inv=T().battle_iframes;refreshHud();
      bSplash(B.px,B.py,'#e07a2e');B.msg='앗, 뜨거! 불꽃 위에 너무 오래 있었다.';
      if(G.hp<=0)bEnd('lose');
    }
  }else B.heat=Math.max(0,(B.heat||0)-2);
}
function flame(c,x,y,h,w,alpha){
  const sway=Vfx.reducedMotion?0:Math.sin(B.time*0.3+x)*w*0.25;
  c.save();c.globalAlpha=alpha;
  c.fillStyle=FIRE;c.beginPath();c.moveTo(x-w,y);c.quadraticCurveTo(x-w*0.8,y-h*0.55,x+sway,y-h);c.quadraticCurveTo(x+w*0.8,y-h*0.55,x+w,y);c.closePath();c.fill();
  c.fillStyle='#f2b04a';c.beginPath();c.moveTo(x-w*0.5,y);c.quadraticCurveTo(x-w*0.4,y-h*0.4,x+sway*0.6,y-h*0.62);c.quadraticCurveTo(x+w*0.4,y-h*0.4,x+w*0.5,y);c.closePath();c.fill();
  c.restore();
}
function drawForgeFloor(c){
  const r=T().musoe_fire_radius;
  for(const e of EMBERS){
    const s=emberState(e),p=emberPoint(e);
    // 바닥 재 자국: 불씨 자리는 늘 보인다
    blob(c,p.x,p.y+4,r,r*0.42,'#6b5a4a',0.18);
    for(let i=0;i<4;i++)blob(c,p.x-9+i*6,p.y+2+(i%2)*3,2.4,2,i%2?FIRE:INK,0.55);
    if(s.k==='warn'){
      const g=c.createRadialGradient(p.x,p.y,2,p.x,p.y,r*(0.6+s.a*0.6));g.addColorStop(0,'rgba(226,108,40,'+(0.15+s.a*0.35)+')');g.addColorStop(1,'rgba(226,108,40,0)');
      c.save();c.fillStyle=g;c.fillRect(p.x-r*1.3,p.y-r*1.3,r*2.6,r*2.6);c.restore();
      if(Math.floor(B.time/6)%2||s.a>0.6)for(let i=-1;i<=1;i++)flame(c,p.x+i*8,p.y+4,6+s.a*10,4,0.35+s.a*0.4);
    }else if(s.k==='burn'){
      const g=c.createRadialGradient(p.x,p.y,2,p.x,p.y,r*1.5);g.addColorStop(0,'rgba(240,140,50,.6)');g.addColorStop(1,'rgba(226,108,40,0)');
      c.save();c.fillStyle=g;c.fillRect(p.x-r*1.6,p.y-r*1.6,r*3.2,r*3.2);c.restore();
      for(let i=-1;i<=1;i++)flame(c,p.x+i*10,p.y+6,24+(i?0:10)+s.a*6,7,0.9);
      c.save();c.strokeStyle=RED;c.globalAlpha=0.55;c.lineWidth=1.5;c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.stroke();c.restore();
    }
  }
  // 손이 달아오르는 중이면 김이 오른다 (얼마나 오래 서 있었는지 보인다)
  if(B.heat>0){const k=B.heat/T().musoe_fire_heat;for(let i=0;i<3;i++)brush(c,[[B.px-8+i*8,B.py-14],[B.px-6+i*8+Math.sin(B.time*0.3+i)*3,B.py-22-k*10],[B.px-8+i*8,B.py-30-k*16]],2,RED,0.25+k*0.5);}
}
/* 꿀밤: {delay(이 프레임에 손 자리를 겨눔), tell(그림자 예고), drop(내리꽂는 시간), x,y(겨눈 자리), near?(연출: 빗맞춤), final?(연출: 마지막 한 대)} */
function fistAt(b){const hit=b.delay+b.tell+b.drop;return {hit,aimed:b.t>b.delay,shadow:b.t>b.delay&&b.t<=b.delay+b.tell,falling:b.t>b.delay+b.tell&&b.t<=hit,after:b.t>hit};}
function stepFist(b){
  b.t++;
  if(b.x==null&&b.t>b.delay){b.x=B.px;b.y=B.py;}
  const f=fistAt(b);
  if(b.t===f.hit){
    Sound.playSfx('battle_hit');bSplash(b.x,b.y,b.final?RED:'#6f6357');
    if(b.final){B.bonk=34;B.msg='딱! 손등에 꿀밤 한 대가 떨어졌다.';}
    else if(!b.near&&Math.hypot(B.px-b.x,B.py-b.y)<T().musoe_bonk_radius)bHitMe();
  }
  if(b.t>f.hit+22)b.dead=1;
}
function drawFistShape(c,x,y,s,alpha){
  c.save();c.globalAlpha=alpha;
  // 팔뚝은 상자 위에서 내려온다
  brush(c,[[x+4,BOX.y-30],[x+2,y-18*s]],16*s,INK,0.85);
  blob(c,x,y,17*s,13*s,'#4a4038');
  for(let i=0;i<4;i++)blob(c,x-10*s+i*6.6*s,y+9*s,4.2*s,4*s,'#4a4038');
  c.strokeStyle=INK;c.lineWidth=2;c.beginPath();c.ellipse(x,y,17*s,13*s,0,0,Math.PI*2);c.stroke();
  for(let i=1;i<4;i++){c.beginPath();c.moveTo(x-13*s+i*6.6*s,y+5*s);c.lineTo(x-13*s+i*6.6*s,y+12*s);c.stroke();}
  c.restore();
}
function drawFist(c,b){
  if(b.x==null)return;const f=fistAt(b),R=T().musoe_bonk_radius;
  if(f.shadow||f.falling){
    const k=f.shadow?(b.t-b.delay)/b.tell:1;
    blob(c,b.x,b.y+6,R*(0.45+0.55*k),R*0.4*(0.45+0.55*k),INK,0.12+0.3*k);
    if(k>0.7&&Math.floor(b.t/4)%2){c.save();c.strokeStyle=RED;c.lineWidth=2;c.globalAlpha=0.8;c.beginPath();c.ellipse(b.x,b.y+6,R,R*0.4,0,0,Math.PI*2);c.stroke();c.restore();}
  }
  if(f.falling){const k=(b.t-b.delay-b.tell)/b.drop;drawFistShape(c,b.x,BOX.y-10+(b.y-4-(BOX.y-10))*k,1.15,1);}
  if(f.after){
    const a=b.t-f.hit,lift=Math.min(1,a/14);
    if(lift<1)drawFistShape(c,b.x,b.y-4-(b.y-BOX.y+10)*lift*lift,1.15,1-lift*0.6);
    c.save();c.strokeStyle=INK;c.globalAlpha=Math.max(0,1-a/22);c.lineWidth=3;c.beginPath();c.ellipse(b.x,b.y+6,R*0.6+a*2.2,(R*0.6+a*2.2)*0.4,0,0,Math.PI*2);c.stroke();c.restore();
    if(a<14&&!b.final){c.save();c.fillStyle=INK;c.globalAlpha=1-a/14;c.font='bold 15px "Gowun Batang", serif';c.textAlign='center';c.fillText('쿵',b.x+24,b.y-14);c.restore();}
  }
}
defineAttacks({musoeFist:{get dur(){return (B&&B.fistDur)||100;},tick(){}}});
defineBullets({musoeFist:{step:stepFist,draw:drawFist}});
// 결정 D-216: 판마다 재촉하지 않고, 잘 본 것을 짚어 주며 다음 판을 알린다 (사용자 피드백 37).
const BONK_LINES=['무쇠가 주먹을 쳐든다. 손 아래 그림자가 짙어지면 비켜라!','"잘 봤다. 한 번 더."','"이번엔 두 번이다. 서두르지 마라."','"조금 빨라진다. 겁먹을 것 없다."','"세 번이다. 눈은 주먹에 둬라."','"마지막이다. 끝까지 봐라."'];
function pickBonk(){
  const t=T(),r=B.survived,n=Math.min(3,1+Math.floor(r/2));
  const tell=Math.round(t.musoe_bonk_tell_first+(t.musoe_bonk_tell_last-t.musoe_bonk_tell_first)*r/Math.max(1,B.E.dodge-1));
  B.cur=B.parts[0];B.last=B.cur;B.st='tell';B.t=1;B.hitThis=false;B.msg=BONK_LINES[Math.min(r,BONK_LINES.length-1)];
  for(let i=0;i<n;i++)B.bullets.push({k:'musoeFist',t:0,delay:i*t.musoe_bonk_gap,tell,drop:t.musoe_bonk_drop,x:null,y:null});
  B.fistDur=(n-1)*t.musoe_bonk_gap+tell+t.musoe_bonk_drop+24;
}
const bonkFinale={
  start(){
    const t=T(),n=Math.max(1,t.musoe_finale_bonks);
    B.finaleT=0;B.bullets=[];B.heat=0;B.msg='"…끝까지 피하는구나. 그럼 이건 못 피한다."';
    // 마지막 꿀밤 앞의 몇 대는 손 둘레에 떨어진다. 손은 굳어 움직이지 못한다.
    for(let i=0;i<n;i++){
      const last=i===n-1,a=-Math.PI/2+i*2.1;
      B.bullets.push({k:'musoeFist',t:0,delay:30+i*t.musoe_finale_gap,tell:12,drop:5,near:!last,final:last,
        x:last?B.px:clamp(B.px+Math.cos(a)*40,BOX.x+12,BOX.x+BOX.w-12),y:last?B.py:clamp(B.py+Math.sin(a)*26,BOX.y+12,BOX.y+BOX.h-12)});
    }
    B.finaleEnd=30+(n-1)*t.musoe_finale_gap+17+t.musoe_finale_hold;
  },
  step(){
    B.finaleT++;
    if(B.finaleT===B.finaleEnd-30)B.msg='한 대 쥐어박은 무쇠가 주먹을 푼다. "…됐다."';
    return B.finaleT>=B.finaleEnd;
  }
};
/* 대장간 배경: 무쇠 뒤쪽 화면 전체. 위쪽은 벽돌 벽, 글귀 줄 아래로는 흙바닥. 판정 상자와 글귀는 그 위에 덮인다. */
function drawSmithy(c){
  const t=B.time,still=Vfx.reducedMotion,wallB=BOX.y-52;
  // 벽: 옅은 흙빛 담채 위에 벽돌을 먹선으로. 화덕 쪽(오른쪽)일수록 그을음이 짙다
  c.save();c.fillStyle='rgba(176,140,104,.22)';c.fillRect(0,0,LW,wallB);c.restore();
  const bh=22,bw=48;
  for(let row=0,y=wallB-bh;y>-bh;row++,y-=bh){
    for(let x=-(row%2)*bw/2;x<LW;x+=bw){
      const h=hash(row*31.7+x*0.13);
      if(h<0.35){c.save();c.fillStyle=h<0.12?'rgba(150,80,50,.16)':'rgba(120,90,66,.1)';c.fillRect(x+2,y+2,bw-4,bh-4);c.restore();}
      c.save();c.strokeStyle=INK;c.globalAlpha=0.16+h*0.12;c.lineWidth=1.4;c.strokeRect(x+1.5,y+1.5,bw-3,bh-3);c.restore();
    }
  }
  let g=c.createLinearGradient(LW*0.55,0,LW,0);g.addColorStop(0,'rgba(29,24,20,0)');g.addColorStop(1,'rgba(29,24,20,.18)');
  c.save();c.fillStyle=g;c.fillRect(0,0,LW,wallB);c.restore();
  // 흙바닥
  c.save();c.fillStyle='rgba(120,92,64,.14)';c.fillRect(0,wallB,LW,LH-wallB);c.restore();
  brush(c,[[0,wallB],[LW*0.5,wallB+2],[LW,wallB-1]],5,INK,0.7);
  for(let i=0;i<12;i++)blob(c,hash(i*7.3)*LW,wallB+12+hash(i*3.1)*(LH-wallB-20),6+hash(i)*10,1.6,INK,0.08);
  // 화덕: 무쇠의 오른쪽 뒤. 벽돌로 쌓은 아궁이, 위로 굴뚝
  const hx=LW*0.79,hy=wallB,hw=Math.min(78,LW*0.1);
  const flick=still?1:1+Math.sin(t*0.21)*0.06+Math.sin(t*0.53)*0.04;
  g=c.createRadialGradient(hx,hy-30,6,hx,hy-30,LW*0.42*flick);g.addColorStop(0,'rgba(226,108,40,.5)');g.addColorStop(0.4,'rgba(214,116,56,.18)');g.addColorStop(1,'rgba(214,120,60,0)');
  c.save();c.fillStyle=g;c.fillRect(0,0,LW,LH);c.restore();
  c.save();c.fillStyle='rgba(70,52,40,.55)';c.beginPath();c.moveTo(hx-hw*0.42,hy-hw*1.25);c.lineTo(hx-hw*0.26,0);c.lineTo(hx+hw*0.26,0);c.lineTo(hx+hw*0.42,hy-hw*1.25);c.closePath();c.fill();c.restore();
  brush(c,[[hx-hw*0.42,hy-hw*1.25],[hx-hw*0.26,0]],5,INK,0.75);brush(c,[[hx+hw*0.42,hy-hw*1.25],[hx+hw*0.26,0]],5,INK,0.75);
  c.save();c.fillStyle='rgba(96,64,44,.6)';c.beginPath();c.moveTo(hx-hw,hy);c.lineTo(hx-hw,hy-hw*0.85);c.quadraticCurveTo(hx,hy-hw*1.5,hx+hw,hy-hw*0.85);c.lineTo(hx+hw,hy);c.closePath();c.fill();c.restore();
  brush(c,[[hx-hw,hy],[hx-hw,hy-hw*0.85],[hx-hw*0.5,hy-hw*1.2],[hx+hw*0.5,hy-hw*1.2],[hx+hw,hy-hw*0.85],[hx+hw,hy]],6,INK,0.85);
  for(let i=1;i<4;i++)brush(c,[[hx-hw+3,hy-i*hw*0.24],[hx+hw-3,hy-i*hw*0.24]],1.4,INK,0.35);
  c.save();c.beginPath();c.ellipse(hx,hy-hw*0.18,hw*0.5,hw*0.42,0,Math.PI,0);c.lineTo(hx+hw*0.5,hy);c.lineTo(hx-hw*0.5,hy);c.closePath();c.fillStyle='rgba(29,24,20,.85)';c.fill();c.clip();
  for(let i=0;i<3;i++){const s=still?0:Math.sin(t*0.17+i*2.1)*4;blob(c,hx-hw*0.24+i*hw*0.24+s*0.5,hy-6-i%2*6,hw*0.2,hw*0.3+s,RED,0.75-i*0.15);}
  blob(c,hx,hy-4,hw*0.18,hw*0.13,'#f2b04a',0.85);c.restore();
  for(let i=0;i<20;i++){
    const life=70+hash(i*3.7)*60,age=still?life*hash(i*1.9):(t*(0.8+hash(i*5.3)*0.6)+i*37)%life,k=age/life;
    const x=hx+(hash(i*2.3)-0.5)*hw+Math.sin(age*0.09+i)*8,y=hy-hw*0.5-k*hw*1.6;
    if(y<6)continue;c.save();c.globalAlpha=(1-k)*0.85;c.fillStyle=i%3?RED:'#f2b04a';c.fillRect(x,y,2+(i%3),2+(i%3));c.restore();
  }
  // 풀무: 화덕 옆 가죽 주머니와 손잡이
  {const bx=hx+hw*1.55,by=hy-12,flat=still?1:1+Math.sin(t*0.08)*0.1;
    c.save();c.fillStyle='rgba(110,72,44,.55)';c.beginPath();c.moveTo(bx-30,by-22*flat);c.lineTo(bx+18,by-8*flat);c.lineTo(bx+18,by+8*flat);c.lineTo(bx-30,by+22*flat);c.closePath();c.fill();c.restore();
    brush(c,[[bx-30,by-22*flat],[bx+18,by-8*flat],[bx+18,by+8*flat],[bx-30,by+22*flat],[bx-30,by-22*flat]],4,INK,0.8);
    brush(c,[[bx+18,by],[hx+hw-2,by+4]],5,INK,0.75);brush(c,[[bx-30,by-22*flat],[bx-48,by-30*flat]],3,INK,0.7);}
  // 모루: 무쇠의 왼쪽 뒤, 나무 받침 위
  {const ax=LW*0.21,ay=wallB;
    brush(c,[[ax-20,ay],[ax-16,ay-30],[ax+16,ay-30],[ax+20,ay]],9,'#6b5540',0.9);
    c.save();c.fillStyle='#2b2520';c.beginPath();c.moveTo(ax-46,ay-50);c.lineTo(ax+30,ay-50);c.lineTo(ax+48,ay-42);c.lineTo(ax+22,ay-32);c.lineTo(ax-26,ay-32);c.lineTo(ax-42,ay-42);c.closePath();c.fill();c.restore();
    brush(c,[[ax-38,ay-48],[ax+26,ay-48]],2,'#f4ead4',0.35);}
  // 벽에 건 연장: 집게, 망치, 그리고 아빠가 맡긴 낫. 무쇠는 오늘 아무것도 들지 않았다
  {const ry=Math.max(26,wallB*0.28),rx=LW*0.3;
    brush(c,[[rx-70,ry],[rx+70,ry]],5,'#6b5540',0.85);
    for(const dx of [-50,-10,30,62])blob(c,rx+dx,ry,2.5,2.5,INK,0.8);
    brush(c,[[rx-56,ry+2],[rx-62,ry+46]],3,INK,0.6);brush(c,[[rx-44,ry+2],[rx-38,ry+46]],3,INK,0.6);
    brush(c,[[rx-10,ry+2],[rx-10,ry+44]],3,'#5a3a24',0.75);c.save();c.globalAlpha=0.7;c.fillStyle=INK;c.fillRect(rx-20,ry+40,20,9);c.restore();
    brush(c,[[rx+30,ry+2],[rx+30,ry+42]],3,'#5a3a24',0.75);c.save();c.strokeStyle=INK;c.globalAlpha=0.75;c.lineWidth=3.5;c.beginPath();c.arc(rx+38,ry+44,9,Math.PI,Math.PI*1.95);c.stroke();c.restore();}
  // 숯 더미와 물통: 판정 상자 양옆 바닥
  {const cy=BOX.y+BOX.h-6,cx=Math.min(LW-40,BOX.x+BOX.w+(LW-BOX.x-BOX.w)*0.55);
    for(let i=0;i<9;i++)blob(c,cx-24+(i%5)*12+(i>4?6:0),cy-(i>4?10:0),7,5,INK,0.75);
    const wx=Math.max(40,BOX.x*0.45);
    c.save();c.fillStyle='rgba(110,80,52,.35)';c.fillRect(wx-30,cy-28,60,28);c.restore();
    brush(c,[[wx-30,cy-28],[wx-30,cy],[wx+30,cy],[wx+30,cy-28]],4,INK,0.75);brush(c,[[wx-26,cy-22],[wx+26,cy-22]],2,'#9fb4c0',0.6);}
}
/* 결정 D-546: 무쇠를 실제 너구리에 가깝게 다시 그린다 (사용자 피드백 2026-11-04 단풍골 5).
   눈가를 가로지르던 검은 띠가 안대처럼 보였다. 이제 너구리의 탈무늬는 두 눈가에 따로 진 짙은 얼룩이고, 볼에는 북슬한 털이 옆으로 뻗는다.
   이마에는 대장장이가 땀받이로 두르는 무명 머리띠를 매고, 매듭 끝이 옆으로 늘어진다.
   몸은 선이 아니라 털빛을 칠한 덩어리다. 넓은 어깨와 굵은 팔에 잔근육이 지고, 너구리답게 가슴과 팔다리 털이 짙다. 가죽 앞치마를 둘렀다. */
const MFUR='#7a6e5f',MFUR_LT='#a99c86',MFUR_DK='#3a322b',MBAND='#e7ddc6',MLEATHER='#6e4529';
/* 털 덮인 팔다리: 마디마다 굵기가 바뀌는 둥근 관. 바깥에 먹 테두리, 가장자리에 털 */
function mTube(c,pts,ws,fill,alpha=1){
  const S=[];for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i],n=Math.max(2,Math.ceil(Math.hypot(x1-x0,y1-y0)/2.5));
    for(let k=0;k<=n;k++){const u=k/n;S.push([x0+(x1-x0)*u,y0+(y1-y0)*u,(ws[i-1]+(ws[i]-ws[i-1])*u)/2,x1-x0,y1-y0]);}}
  c.save();c.globalAlpha=alpha;
  c.fillStyle=INK;for(const [x,y,r] of S){c.beginPath();c.arc(x,y,r+2,0,Math.PI*2);c.fill();}
  c.fillStyle=fill;for(const [x,y,r] of S){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
  c.strokeStyle=fill;c.lineWidth=1.3;c.lineCap='round';c.beginPath();   // 테두리 밖으로 삐친 털
  S.forEach(([x,y,r,dx,dy],i)=>{if(i%3)return;const l=Math.hypot(dx,dy)||1,s=(i/3)%2?1:-1,nx=-dy/l*s,ny=dx/l*s;c.moveTo(x+nx*(r+1),y+ny*(r+1));c.lineTo(x+nx*(r+4)+dx/l*2,y+ny*(r+4)+dy/l*2);});
  c.stroke();c.restore();
}
/* 굵은 주먹: 짙은 털 주먹에 마디 셋 */
function mFist(c,x,y,r,rot=0){
  c.save();c.translate(x,y);c.rotate(rot);
  blob(c,0,0,r+2,r*0.85+2,INK);blob(c,0,0,r,r*0.85,MFUR_DK);
  c.strokeStyle='rgba(169,156,134,.55)';c.lineWidth=1.2;c.beginPath();for(const k of [-0.5,0,0.5]){c.moveTo(k*r,-r*0.6);c.quadraticCurveTo(k*r+2,-r*0.2,k*r,r*0.1);}c.stroke();
  c.restore();
}
function drawMusoe(c){
  const cx=LW/2,cy=EY,bob=Math.sin(B.time*0.05)*2;
  // 내리꽂는 주먹이 있으면 오른팔이 그쪽으로 뻗는다. 그림이 0.84배로 줄어 그려지므로 상자 좌표를 되돌려 쓴다.
  const fists=B.bullets.filter(b=>b.k==='musoeFist'&&b.x!=null);
  const live=fists.find(b=>{const f=fistAt(b);return f.falling||(f.after&&b.t<f.hit+8);});
  const raised=!live&&fists.some(b=>fistAt(b).shadow);
  const inv=(x,y)=>[cx+(x-cx)/0.84,cy+(y-cy)/0.84];
  const end=B.st==='end'&&B.result!=='lose'||B.st==='finale'&&B.finaleT>=B.finaleEnd-30;
  c.save();c.fillStyle='rgba(29,24,20,.14)';c.beginPath();c.ellipse(cx,cy+64+bob,104,60,0,0,Math.PI*2);c.fill();c.restore();
  // 몸통: 넓은 어깨에서 허리로 좁아지는 털 덩어리
  const y0=cy+bob;
  const torso=[[cx-92,cy+100],[cx-100,y0+48],[cx-90,y0+16],[cx-52,y0+2],[cx+52,y0+2],[cx+90,y0+16],[cx+100,y0+48],[cx+92,cy+100]];
  c.save();const g=c.createLinearGradient(0,y0,0,cy+100);g.addColorStop(0,MFUR);g.addColorStop(1,'#62584b');c.fillStyle=g;c.beginPath();c.moveTo(torso[0][0],torso[0][1]);
  for(let i=1;i<torso.length-1;i++){const m=[(torso[i][0]+torso[i+1][0])/2,(torso[i][1]+torso[i+1][1])/2];c.quadraticCurveTo(torso[i][0],torso[i][1],m[0],m[1]);}
  c.lineTo(torso[torso.length-1][0],torso[torso.length-1][1]);c.closePath();c.fill();c.restore();
  brush(c,torso.slice(0,4),4,INK,0.9);brush(c,torso.slice(4),4,INK,0.9);
  for(let i=0;i<14;i++){const s=i<7?-1:1,k=(i%7)/6,x=cx+s*(56+k*40),y=y0+3+k*k*40;brush(c,[[x,y],[x+s*4,y-3]],1.3,MFUR_LT,0.7);}   // 어깨 털
  // 너구리답게 짙은 가슴 털과 어깨·가슴 근육 결
  blob(c,cx,y0+22,40,24,MFUR_DK,0.75);
  for(const s of [-1,1]){brush(c,[[cx+s*58,y0+12],[cx+s*78,y0+24],[cx+s*80,y0+44]],1.8,INK,0.5);brush(c,[[cx+s*10,y0+34],[cx+s*30,y0+40],[cx+s*46,y0+34]],1.6,INK,0.35);}
  // 가죽 앞치마: 목끈, 허리끈, 불똥 자국, 집게 꽂은 주머니
  {c.save();const ag=c.createLinearGradient(0,y0+28,0,cy+102);ag.addColorStop(0,'#7c5033');ag.addColorStop(1,'#5a3820');c.fillStyle=ag;c.globalAlpha=0.95;
    c.beginPath();c.moveTo(cx-40,y0+30);c.lineTo(cx-52,cy+102);c.lineTo(cx+52,cy+102);c.lineTo(cx+40,y0+30);c.quadraticCurveTo(cx,y0+24,cx-40,y0+30);c.closePath();c.fill();c.restore();
    brush(c,[[cx-40,y0+30],[cx-52,cy+102],[cx+52,cy+102],[cx+40,y0+30]],3,'#3e2614',0.9);
    brush(c,[[cx-38,y0+31],[cx-26,y0+6]],3,'#4a2e1a',0.85);brush(c,[[cx+38,y0+31],[cx+26,y0+6]],3,'#4a2e1a',0.85);
    brush(c,[[cx-42,y0+58],[cx-80,y0+60]],2.6,'#4a2e1a',0.8);brush(c,[[cx+42,y0+58],[cx+80,y0+60]],2.6,'#4a2e1a',0.8);
    for(const [x,y,r] of [[cx-18,y0+52,3],[cx+22,y0+70,2.4],[cx-6,y0+84,2],[cx+30,y0+46,1.6]])blob(c,x,y,r,r*0.8,'#2a1a10',0.7);
    brush(c,[[cx-26,y0+68],[cx-26,y0+90],[cx+6,y0+90],[cx+6,y0+68],[cx-26,y0+68]],1.4,'#2e1c10',0.7);}   // 앞치마 주머니
  // 왼팔: 허리에 짚은 주먹. 위팔은 털빛, 팔꿈치 아래는 너구리답게 짙은 털
  {const s=[cx-86,y0+22],e=[cx-124,y0+60],h=[cx-86,y0+80];
    mTube(c,[s,e],[30,24],MFUR);mTube(c,[e,h],[24,19],MFUR_DK);
    brush(c,[[s[0]-8,s[1]+8],[s[0]-24,s[1]+18],[e[0]+6,e[1]-8]],1.6,INK,0.45);   // 위팔 근육 결
    mFist(c,h[0]+2,h[1],11,0.3);}
  // 오른팔: 평소엔 옆으로 내리고, 예고 땐 주먹을 머리 위로, 내리꽂을 땐 상자 쪽으로
  {const s=[cx+86,y0+22];
    if(live){const [tx,ty]=inv(live.x,BOX.y-30),e=[(s[0]+tx)/2+16,(s[1]+ty)/2-12];mTube(c,[s,e],[30,24],MFUR,0.95);mTube(c,[e,[tx,ty]],[24,20],MFUR_DK,0.95);mFist(c,tx,ty,13,0);}
    else if(raised){const e=[cx+132,y0-12],f=[cx+114,y0-84];mTube(c,[s,e],[30,25],MFUR);mTube(c,[e,f],[25,20],MFUR_DK);
      brush(c,[[s[0]+10,s[1]-4],[s[0]+30,s[1]-14],[e[0]-4,e[1]+6]],1.8,INK,0.5);   // 불끈 선 알통
      mFist(c,f[0],f[1],13,-0.2);
      c.save();c.strokeStyle=Math.floor(B.time/5)%2?RED:INK;c.lineWidth=2.4;c.beginPath();c.ellipse(f[0],f[1],17,15,0,0,Math.PI*2);c.stroke();c.restore();}
    else{const e=[cx+122,y0+60],h=[cx+94,y0+84];mTube(c,[s,e],[30,24],MFUR);mTube(c,[e,h],[24,19],MFUR_DK);
      brush(c,[[s[0]+8,s[1]+8],[s[0]+24,s[1]+18],[e[0]-6,e[1]-8]],1.6,INK,0.45);mFist(c,h[0]-2,h[1],11,-0.3);}}
  // 머리: 너구리. 옆으로 뻗은 북슬한 볼털, 작고 둥근 귀, 눈가마다 따로 진 탈무늬, 흰 주둥이
  const hx=cx,hy=cy-40+bob;
  for(const s of [-1,1]){c.save();c.translate(hx+s*27,hy-30);c.rotate(s*0.35);blob(c,0,0,13,14,INK);blob(c,0,0,11,12,MFUR_DK);blob(c,0,2,6,7,'#cbbfa8');c.restore();}   // 귀
  {c.save();c.fillStyle=MFUR_LT;c.beginPath();   // 볼털: 아래와 옆으로 삐죽삐죽 뻗는다
    for(let i=0;i<=26;i++){const a=-0.25+i/26*(Math.PI+0.5),r=i%2?0.92+hash(i*1.7)*0.1:0.8,x=hx+Math.cos(a)*60*r,y=hy+6+Math.sin(a)*38*r;i?c.lineTo(x,y):c.moveTo(x,y);}
    c.closePath();c.fill();c.strokeStyle=INK;c.globalAlpha=0.55;c.lineWidth=1.6;c.stroke();c.restore();
    for(let i=0;i<10;i++){const s=i<5?-1:1,k=(i%5)/4;brush(c,[[hx+s*(34+k*8),hy+8+k*20],[hx+s*(50+k*8),hy+14+k*16]],1.2,'#6e6252',0.55);}}
  blob(c,hx,hy-4,40,33,INK);blob(c,hx,hy-4,38,31,'#b3a690');   // 머리
  blob(c,hx,hy-30,15,9,'#5d5348',0.55);   // 정수리의 짙은 털
  for(const s of [-1,1]){   // 눈가의 짙은 탈무늬: 두 눈에 따로, 볼 쪽으로 처진다
    c.save();c.translate(hx+s*17,hy+5);c.rotate(s*0.42);blob(c,0,0,13,9.5,'#29231e');c.restore();blob(c,hx+s*28,hy+15,9,6.5,'#29231e',0.95);}
  blob(c,hx,hy+16,18,13,'#ece3cf');blob(c,hx,hy-1,6,11,'#ddd2bc');   // 흰 주둥이와 콧등
  blob(c,hx,hy+10,6.5,4.8,INK);blob(c,hx-2,hy+8.6,1.8,1.1,'#8f8579');   // 코
  // 대장장이 무명 머리띠: 이마에 감고 오른쪽에서 맨 매듭 끝이 늘어진다
  {const wave=Vfx.reducedMotion?0:Math.sin(B.time*0.07)*2;
    c.save();c.fillStyle=MBAND;c.beginPath();c.moveTo(hx-39,hy-22);c.quadraticCurveTo(hx,hy-34,hx+39,hy-22);c.lineTo(hx+40,hy-11);c.quadraticCurveTo(hx,hy-22,hx-40,hy-11);c.closePath();c.fill();
    c.strokeStyle=INK;c.lineWidth=2;c.stroke();c.restore();
    blob(c,hx-14,hy-23,8,3,'#c9b991',0.55);   // 땀 밴 자국
    brush(c,[[hx-26,hy-20],[hx-4,hy-24],[hx+22,hy-21]],1,INK,0.3);
    const kx=hx+40,ky=hy-16;
    brush(c,[[kx,ky],[kx+10,ky+7+wave],[kx+15,ky+17+wave]],5.5,INK,0.9);brush(c,[[kx,ky],[kx+10,ky+7+wave],[kx+15,ky+17+wave]],3.6,MBAND);
    brush(c,[[kx,ky],[kx+15,ky+1+wave*0.6],[kx+24,ky+6+wave]],5.5,INK,0.9);brush(c,[[kx,ky],[kx+15,ky+1+wave*0.6],[kx+24,ky+6+wave]],3.6,MBAND);
    blob(c,kx,ky,6.5,5.5,INK);blob(c,kx,ky,5,4.2,MBAND);}
  if(end){for(const s of [-1,1])brush(c,[[hx+s*22,hy+3],[hx+s*16,hy+5],[hx+s*10,hy+3]],2.4,'#ece3cf');
    brush(c,[[hx-7,hy+19],[hx,hy+22],[hx+7,hy+19]],2.2,INK);}
  else{const [ex,ey]=lookAt(hx,hy);
    for(const s of [-1,1]){blob(c,hx+s*16,hy+4,3.8,3.6,'#c9b48a');blob(c,hx+s*16+ex*0.6,hy+4+ey*0.6,2.1,2.3,INK);blob(c,hx+s*16+ex*0.6-0.8,hy+3+ey*0.6,0.7,0.7,'#f4ead4');
      brush(c,[[hx+s*28,hy-7],[hx+s*18,hy-6],[hx+s*8,hy-3]],3.2,INK);}   // 엄한 눈썹
    brush(c,[[hx,hy+14],[hx,hy+18]],1.6,INK,0.8);brush(c,[[hx-8,hy+21],[hx,hy+18],[hx+8,hy+21]],2.2,INK);}
}

/* 결정 D-62: 모든 전투 배경은 상대 뒤쪽 화면 전체로 그린다 (design/data/decisions.csv).
   엉킨 칡은 당산나무 언덕. 칡이 나무 줄기를 감아 오르고 금줄 아래 입구를 덮었다(D-51 필드 그림과 같은 설정). 늦가을 단풍.
   가운데 상대와 판정 상자가 먼저 읽히게 담채는 옅게, 먹선은 가늘게 둔다. */
function drawKudzuHill(c){
  const t=B.time,still=Vfx.reducedMotion,gy=BOX.y-52,VINE='#4f6b3a';
  let g=c.createLinearGradient(0,0,0,gy);g.addColorStop(0,'rgba(214,150,96,.18)');g.addColorStop(1,'rgba(214,150,96,.03)');
  c.save();c.fillStyle=g;c.fillRect(0,0,LW,gy);c.restore();
  // 먼 산 능선 두 겹
  for(const [k,a,yb] of [[0,.07,gy-74],[1,.11,gy-38]]){
    c.save();c.globalAlpha=a;c.fillStyle=INK;c.beginPath();c.moveTo(0,gy);
    for(let x=0;x<=LW+20;x+=20)c.lineTo(x,yb-Math.sin(x*0.007+k*2)*22-hash(x*0.1+k)*10);
    c.lineTo(LW,gy);c.closePath();c.fill();c.restore();
  }
  c.save();c.fillStyle='rgba(150,110,70,.12)';c.fillRect(0,gy,LW,LH-gy);c.restore();
  brush(c,[[0,gy+4],[LW*0.3,gy-6],[LW*0.6,gy+2],[LW,gy-4]],4,INK,0.45);
  // 양옆 단풍나무
  const maple=(x,y,s,k=1)=>{
    brush(c,[[x,y],[x-3*s,y-40*s],[x+2*s,y-72*s]],6*s,INK,0.5*k);
    for(let i=0;i<12;i++){const a=hash(x*0.01+i*3.3)*Math.PI*2,rr=34*s*Math.sqrt(hash(i*5.1+x*0.01));
      blob(c,x+Math.cos(a)*rr,y-78*s+Math.sin(a)*rr*0.7,22*s,16*s,i%3?RED:'#d98a3a',(0.16+hash(i+x*0.01)*0.12)*k);}
  };
  // 왼쪽은 부위 글 뒤라 옅게 둔다
  maple(LW*0.03,gy+6,1.05,0.5);maple(LW*0.2,gy+2,0.75,0.55);maple(LW*0.88,gy+4,1.2);maple(LW*0.97,gy,0.85);
  /* 결정 D-545: 당산나무를 크고 신성하게 (사용자 피드백 2026-11-04 단풍골 12). 몇백 년 묵은 느티나무 한 그루가 화면 위를 다 덮는다.
     굵은 가지가 양옆으로 크게 뻗고, 누렇고 붉게 물든 잎 그늘이 하늘을 가린다. 줄기 앞쪽(금줄·제단 돌·돌무더기)은 상대 그림(drawKudzu)이 그린다. */
  const tx=LW/2;
  c.save();c.fillStyle='rgba(70,55,42,.35)';c.beginPath();c.moveTo(tx-70,gy);c.lineTo(tx-52,0);c.lineTo(tx+52,0);c.lineTo(tx+70,gy);c.closePath();c.fill();c.restore();
  // 양옆으로 뻗은 굵은 가지와 잔가지
  const limbs=[[[tx-40,60],[tx-150,30],[tx-260,8],[tx-370,-6]],[[tx+40,52],[tx+160,24],[tx+280,4],[tx+390,-8]],[[tx-30,30],[tx-110,-4]],[[tx+30,26],[tx+120,-6]],
    [[tx-150,30],[tx-200,58],[tx-236,80]],[[tx+160,24],[tx+214,52],[tx+250,74]],[[tx-260,8],[tx-300,36]],[[tx+280,4],[tx+330,30]]];
  limbs.forEach((l,i)=>brush(c,l,i<2?13:i<4?9:4,INK,i<4?0.42:0.3));
  // 잎 그늘: 짙은 먹 덩이 위에 누렇고 붉은 잎 무리
  for(let i=0;i<34;i++){const u=hash(i*2.31),v=hash(i*5.17),x=LW*(0.02+0.96*u),y=-14+v*78-Math.cos((u-0.5)*Math.PI)*22,r=26+hash(i*7.3)*22;
    blob(c,x,y,r,r*0.62,INK,0.07);}
  for(let i=0;i<70;i++){const u=hash(i*3.71+1),v=hash(i*1.93+2),x=LW*(0.01+0.98*u),y=-10+v*84-Math.cos((u-0.5)*Math.PI)*20,left=x<LW*0.26;
    blob(c,x,y,9+hash(i)*9,6+hash(i*2)*5,i%4===0?RED:i%4===1?'#c98a3a':i%4===2?'#a8743a':'#d6a640',(left?0.1:0.2)+hash(i*9.1)*0.12);}
  // 가지에 걸린 오래된 소원 천 둘
  for(const [x,y,col] of [[tx-200,58,'#e8dfcc'],[tx+214,52,'#d8d2c0']]){brush(c,[[x,y],[x+2,y+10],[x-1,y+22]],4,col,0.75);brush(c,[[x+3,y+1],[x+6,y+14]],3,col,0.6);}
  // 떨어지는 단풍잎
  for(let i=0;i<10;i++){
    const sp=0.3+hash(i*2.7)*0.4,y=still?hash(i*4.1)*gy:((t*sp+i*53)%(gy+40))-20,x=hash(i*1.3)*LW+(still?0:Math.sin(t*0.03+i)*14);
    c.save();c.globalAlpha=0.32;c.fillStyle=i%2?RED:'#d98a3a';c.translate(x,y);c.rotate(still?i:t*0.04+i);c.fillRect(-3,-2,6,4);c.restore();
  }
}
/* ---------- 엉킨 칡의 공격 (결정 D-157) ---------- */
/* 결정 D-179: 공격은 빠르되 사이사이 숨 돌릴 틈을 둔다. 예고를 늘리고 한 공격 안의 간격을 벌렸다
   (채찍 간격 48→62·예고 30→40, 뿌리 예고 46→54·간격 36→48, 꽃 간격 40→44·예고 32→40 프레임).
   결정 D-176: 칡줄기·칡뿌리의 빈틈(붉은 표식)은 공격 뒤 남은 덩굴 위에 뜬다. 마지막 채찍의 늘어진 줄기, 마지막에 박힌 덩이뿌리.
   표식이 있는 동안 줄기·뿌리가 그 자리에 남고, 치면 부위가 깎이며 연장이 있으면 확률로 재료를 얻는다
   (든 도구로 끊고 캔다. 줄기는 낫·뿌리는 곡괭이가 잘 먹는다, D-224 · kudzu_stem_cut_chance · kudzu_root_dig_chance). 표식이 닫히면 거둬 간다. */
/* 칡줄기 채찍: 상자 바깥에서 곧게 뻗어 들어와 후려친다. 줄기가 지나갈 띠가 먼저 옅게 붉어진다. 세 번째는 손 자리를 지나가고, 후려친 뒤 줄기가 축 늘어진다.
   결정 D-371: 방향은 여덟 방향(대각선 포함)에 조금씩 비틀어 무작위로, 연달아 같은 줄이나 맞은편 방향은 쓰지 않는다.
     줄기는 꼭 상자 끝에서 끝까지 닿지 않는다. 길이도 무작위라 중간에서 멈추기도 한다 (사용자 피드백 2026-11-03). 예고 띠도 그 길이만큼만 붉어진다.
     (D-246 의 가로 → 세로 → 섞어서 차례를 바꾼다.)
   b.ox·b.oy 는 줄기가 나오는 자리(상자 바로 바깥), b.dx·b.dy 는 뻗는 방향, b.L 은 줄기 길이. s 는 줄기를 따라 원점에서 잰 거리다. */
const WHIP={gap:62,tell:40,swing:14,limp:24,fall:16,back:10,half:0.21};
function whipState(b){
  const tl=b.delay+WHIP.tell,sw=tl+WHIP.swing,lp=sw+(b.last?WHIP.limp:0),stop=b.cut?b.cutT+WHIP.fall:lp;
  return {wait:b.t<=b.delay,tell:b.t>b.delay&&b.t<=tl,swing:b.t>tl&&b.t<=sw,limp:b.last&&!b.cut&&b.t>sw&&b.t<=lp,lp,
    k:clamp((b.t-tl)/WHIP.swing,0,1),fallK:b.cut?clamp((b.t-b.cutT)/WHIP.fall,0,1):0,back:b.t>stop?clamp((b.t-stop)/WHIP.back,0,1):0,end:stop+WHIP.back};
}
/* 띠 반폭(px) */
const whipHalf=()=>WHIP.half*BOX.h;
/* (px,py) 에서 (vx,vy) 쪽으로 상자 테두리까지의 거리 */
function toBoxEdge(px,py,vx,vy){let t=Infinity;
  if(vx>1e-6)t=Math.min(t,(BOX.x+BOX.w-px)/vx);else if(vx<-1e-6)t=Math.min(t,(BOX.x-px)/vx);
  if(vy>1e-6)t=Math.min(t,(BOX.y+BOX.h-py)/vy);else if(vy<-1e-6)t=Math.min(t,(BOX.y-py)/vy);
  return Math.max(0,t);}
/* 예고가 시작될 때 줄기의 자리를 정한다. 마지막 줄기는 그때 손이 있던 자리를 지나간다 */
function aimWhip(b){
  const a=b.dir*Math.PI/4+(Math.random()-0.5)*0.35,dx=Math.cos(a),dy=Math.sin(a);
  const tx=b.last?B.px:BOX.x+BOX.w*(0.22+0.56*Math.random()),ty=b.last?B.py:BOX.y+BOX.h*(0.22+0.56*Math.random());
  const back=toBoxEdge(tx,ty,-dx,-dy)+14,far=toBoxEdge(tx,ty,dx,dy),full=back+far+14;
  b.dx=dx;b.dy=dy;b.ox=tx-dx*back;b.oy=ty-dy*back;
  b.L=b.last?Math.min(full,back+Math.max(40,far*(0.45+0.55*Math.random()))):Math.max(back+24,full*(0.42+0.58*Math.random()));
}
/* 줄기가 지나는 자리. 잔물결이 있고, 늘어지면 가운데가 아래로 처진다 */
function whipPt(b,s,sag){const u=s/b.L,w=Math.sin(u*Math.PI*2+b.seed)*5,g=sag?Math.sin(clamp(u,0,1)*Math.PI)*9:0;
  return [b.ox+b.dx*s-b.dy*w,b.oy+b.dy*s+b.dx*w+g];}
function whipSag(b){const s=whipState(b);return s.limp||b.cut||(b.last&&heldBy(b));}
function whipPts(b,s0,s1,sag=whipSag(b)){const pts=[],n=10;for(let i=0;i<=n;i++)pts.push(whipPt(b,s0+(s1-s0)*i/n,sag));return pts;}
/* 손이 줄기를 따라 몇 px 지점에 있고, 줄기에서 옆으로 얼마나 떨어졌는지 */
function whipLocal(b,x,y){const rx=x-b.ox,ry=y-b.oy;return {s:rx*b.dx+ry*b.dy,d:Math.abs(-rx*b.dy+ry*b.dx)};}
/* 표식이 붙든 덩굴: 그 표식이 열려 있는 동안 남아 있다 */
function heldBy(b){return !!(B.kHold&&B.kHold.b===b&&B.mark);}
/* 결정 D-224: 줄기·뿌리를 끊고 캐는 도구는 플레이어가 든 전투 도구다(battleTool). 줄기는 낫, 뿌리는 곡괭이가 잘 먹고
   (boss_parts.csv 잘먹는도구), 안 먹는 도구로 치면 재료 확률이 battle_tool_bad_mult 배로 준다. */
/* 빈틈 자리: 줄기·뿌리는 남은 덩굴 위, 칡꽃은 꽃가루 잔향을 피한 자리 */
function kudzuMark(p){
  B.kHold=null;
  if(p.id==='arm'){const b=B.bullets.find(q=>q.k==='kudzuWhip'&&q.last&&q.ox!=null&&!q.cut);
    if(b){let best=null;B.kHold={b};
      for(let i=0;i<=12;i++){const sv=b.L*(0.25+0.65*i/12),[x,y]=whipPt(b,sv,true);
        if(x<BOX.x+18||x>BOX.x+BOX.w-18||y<BOX.y+18||y>BOX.y+BOX.h-26)continue;
        const d=Math.hypot(x-B.px,y-B.py);if(!best||d>best.d)best={x,y,d};}
      if(best)return {x:best.x,y:best.y};
      const [x,y]=whipPt(b,b.L*0.6,true);return {x:clamp(x,BOX.x+18,BOX.x+BOX.w-18),y:clamp(y,BOX.y+18,BOX.y+BOX.h-26)};}}
  if(p.id==='root'){const b=B.bullets.find(q=>q.k==='kudzuSlam'&&q.last&&q.x!=null);
    if(b){B.kHold={b};return {x:b.x,y:clamp(b.y-10,BOX.y+18,BOX.y+BOX.h-18)};}}
  if(p.core){const puffs=B.bullets.filter(q=>q.k==='kudzuScent'&&q.x!=null);let x,y;
    for(let n=0;n<24;n++){x=BOX.x+30+Math.random()*(BOX.w-60);y=BOX.y+50+Math.random()*(BOX.h-86);   // 솟는 꽃이 칸 안에 들게
      if(Math.hypot(x-B.px,y-B.py)>=70&&puffs.every(q=>Math.hypot(x-q.x,y-q.y)>SCENT.radius+20))break;}
    return {x,y};}
  return null;
}
/* 표식을 친 뒤: 연장이 있으면 줄기를 끊거나 뿌리를 캐고, 확률로 재료를 얻는다 */
function kudzuMarkHit(p,m){
  if(p.core&&B.kWeak){bSplash(m.x,m.y,KMUD);B.kWeak.fade=Math.max(B.kWeak.fade,6);}   // 친 약점 꽃이 터져 시든다
  const h=B.kHold;B.kHold=null;if(!h||(p.id!=='arm'&&p.id!=='root'))return;
  const b=h.b,arm=p.id==='arm',tool=battleTool();
  if(!tool){if(!p.broken)B.msg=arm?'칡줄기를 쳤다. 맨손으로는 질긴 줄기를 못 끊는다.':'칡뿌리를 쳤다. 맨손으로는 박힌 뿌리를 못 캔다.';return;}
  if(arm){b.cut=true;b.cutT=b.t;b.cutS=clamp(whipLocal(b,m.x,m.y).s,0,b.L);bSplash(m.x,m.y,'#3a3a2a');}
  else{b.dug=true;bSplash(m.x,m.y+6,'#8a6a4a');}
  if(p.broken)return;   // 부위가 부러지면 재료는 breakPart 가 준다
  const by=jo(toolName(tool),'으로','로')+' ',fit=toolFit(p,tool)==='bad'?' 효과가 적은 것 같다.':'';   // 결정 D-373
  if(arm)B.msg=Math.random()<toolChance(p,T().kudzu_stem_cut_chance,tool)?(B.loot.push('vine'),by+'칡줄기를 끊었다! 칡 줄기를 챙겼다.'):by+'끊었지만 줄기가 짓이겨져 못 쓰겠다.'+fit;
  else B.msg=Math.random()<toolChance(p,T().kudzu_root_dig_chance,tool)?(B.loot.push('root'),by+'칡뿌리를 캤다! 칡뿌리를 챙겼다.'):by+'찍었지만 뿌리가 부서져 못 쓰겠다.'+fit;
}
/* 칡뿌리 찍기: 손 자리에 그림자가 진 뒤 뿌리 끝이 위에서 내리찍는다. 칡뿌리가 공격할 때마다 한 대 → 두 대 → 세 대.
   마지막 뿌리는 땅에 박힌 채 남는다(D-176).
   결정 D-372: 덩이뿌리 전체를 보이지 않고, 골렘 발 찧기처럼 뾰족한 뿌리 끝만 칸 위에서 내리꽂힌다.
   찍힌 자리에는 작고 동그란 구멍이 kudzu_hole_frames 동안 남았다가 사라진다 (사용자 피드백 2026-11-03). */
const SLAM={tell:54,drop:8,gap:48,radius:28,stay:26};
function slamCount(){return Math.min(3,((B&&B.slamRound)||0)+1);}
function slamAt(b){const hit=b.delay+SLAM.tell+SLAM.drop;return {hit,shadow:b.t>b.delay&&b.t<=b.delay+SLAM.tell,falling:b.t>b.delay+SLAM.tell&&b.t<=hit,after:b.t>hit};}
function slamLiftAt(b){return b.liftAt??slamAt(b).hit+(b.last?14:8);}
/* 결정 D-178: 칡꽃 꽃가루. 손 자리 바닥에 칡꽃송이가 솟아(예고) 꽃가루를 터뜨리면 동그란 잔향이 바닥에 번진다.
   예전의 향 줄기·끌어당김은 없앴다. 번질 때도, 남은 잔향에 들어가도 맞는다. 피해는 kudzu_scent_damage(하트 반 칸)로 다른 공격보다 약하고,
   맞으면 kudzu_scent_slow_frames 동안 손이 kudzu_scent_slow 배로 느려진다. 연달아 깎이지 않게 맞은 뒤 무적(battle_iframes)을 그대로 쓴다.
   첫 꽃은 손 자리, 둘째·셋째는 그 양옆에 핀다.
   결정 D-543: 칡꽃은 빨리 솟아 팡 터진다 (사용자 피드백 2026-11-04 단풍골 13). 예고 40→22, 터짐 20→10, 간격 44→30 프레임.
   터지는 순간 흰 테가 퍼지고 꽃잎이 사방으로 튄다. D-179 의 숨 돌릴 틈은 채찍·뿌리에 그대로 남는다 */
const SCENT={gap:30,tell:22,burst:10,fade:26,radius:30};
function scentAt(b){const a=b.delay,tl=a+SCENT.tell,bu=tl+SCENT.burst,li=bu+T().kudzu_scent_linger,end=li+SCENT.fade;
  return {wait:b.t<=a,tell:b.t>a&&b.t<=tl,burst:b.t>tl&&b.t<=bu,linger:b.t>bu&&b.t<=li,fade:b.t>li,
    k:b.t<=tl?clamp((b.t-a)/SCENT.tell,0,1):b.t<=bu?(b.t-tl)/SCENT.burst:b.t<=li?(b.t-bu)/T().kudzu_scent_linger:(b.t-li)/SCENT.fade,end};}
function scentHit(){
  if(!bHitMe(T().kudzu_scent_damage))return;
  B.slowT=T().kudzu_scent_slow_frames;B.slowK=T().kudzu_scent_slow;
  if(!B.scentNoted&&B.st!=='end'){B.scentNoted=true;B.msg='달큰한 꽃가루에 손이 무거워졌다.';}
}
/* 결정 D-372: 내리꽂히는 칡뿌리 끝. 굵은 쪽은 칸 위로 잘려 보이지 않고, 끝으로 갈수록 가늘어져 뾰족하다. (x,y) 는 끝 자리.
   결정 D-541: 오래 묵은 뿌리라 겉이 갈라지고 흙덩이가 들러붙어 있다. 떨어질 때 흙 부스러기가 함께 떨어진다 */
function kSpike(c,x,y,lean,alpha){
  const len=58,tx=x+lean*16,ty=y-len,w=9.5;
  // 위쪽은 옅어지며 사라져 굵은 뿌리 몸은 보이지 않는다
  const fade=(r,g,b)=>{const q=c.createLinearGradient(tx,ty,x,y);q.addColorStop(0,`rgba(${r},${g},${b},0)`);q.addColorStop(0.45,`rgba(${r},${g},${b},1)`);q.addColorStop(1,`rgba(${r},${g},${b},1)`);return q;};
  c.save();c.globalAlpha=alpha;c.fillStyle=fade(112,86,60);c.strokeStyle=fade(29,24,20);c.lineWidth=1.6;c.lineJoin='round';
  c.beginPath();c.moveTo(tx-w,ty);c.quadraticCurveTo(x-w*0.55+lean*6,y-len*0.45,x,y);c.quadraticCurveTo(x+w*0.55+lean*6,y-len*0.45,tx+w,ty);c.closePath();c.fill();c.stroke();
  c.strokeStyle='#5c4630';c.lineWidth=1;c.beginPath();
  for(const k of [0.5,0.68,0.82]){const yy=ty+len*k,xx=tx+(x-tx)*k,hw=w*(1-k)*0.9;c.moveTo(xx-hw,yy);c.quadraticCurveTo(xx,yy+2,xx+hw,yy-1);}   // 뿌리 마디
  c.stroke();
  c.strokeStyle='rgba(29,24,20,.55)';c.beginPath();   // 갈라진 겉
  for(const k of [0.48,0.6,0.74]){const yy=ty+len*k,xx=tx+(x-tx)*k;c.moveTo(xx-1,yy-4);c.lineTo(xx+1.5,yy);c.lineTo(xx-0.5,yy+3);}
  c.stroke();
  c.restore();
  {const P=k=>[tx+(x-tx)*k,ty+len*k];   // 들러붙은 흙덩이와 벗겨진 껍질
    for(const [k,side,r] of [[0.5,-1,2.6],[0.62,1,2.2],[0.78,-1,1.9],[0.88,1,1.4],[0.56,1,1.6]]){const [px,py]=P(k);kSoil(c,px+side*w*(1-k)*0.8,py,r,alpha,k*10);}
    const [qx,qy]=P(0.66);c.save();c.globalAlpha=alpha*0.6;c.fillStyle='#b0946e';c.beginPath();c.moveTo(qx-2,qy-3);c.lineTo(qx+2,qy-1);c.lineTo(qx-1,qy+2);c.closePath();c.fill();c.restore();}
  {const P=k=>[tx+(x-tx)*k,ty+len*k];const a=P(0.55),b=P(0.7);brush(c,[[a[0]-w*0.4,a[1]],[a[0]-w*1.1,a[1]+5]],1,INK,0.5*alpha);brush(c,[[b[0]+w*0.3,b[1]],[b[0]+w*0.9,b[1]+4]],1,INK,0.5*alpha);}   // 잔뿌리
}
/* 찍힌 자리의 구멍: 작고 동그랗게 남았다가 흙이 메워지듯 옅어진다 */
function drawKudzuFloor(c){drawKudzuHoles(c);drawWeakFlower(c);}
function drawKudzuHoles(c){
  for(const h of B.kHoles||[]){const a=Math.min(1,h.t/30);
    blob(c,h.x,h.y,8.5,3.8,'#8a6a4a',0.45*a);blob(c,h.x,h.y+0.3,6,2.6,'#2a2118',0.85*a);
    c.save();c.strokeStyle=INK;c.globalAlpha=0.45*a;c.lineWidth=1;c.beginPath();c.ellipse(h.x,h.y,8.5,3.8,0,Math.PI*0.05,Math.PI*0.95);c.stroke();c.restore();}
}
/* 결정 D-544: 칡꽃의 빈틈은 빈 곳이 아니라 꽃 공격이 끝난 뒤 바닥에서 솟는 칡꽃이다 (사용자 피드백 2026-11-04 단풍골 13).
   결정 D-620: 공격하는 꽃들은 시들어 힘이 없고, 해머루를 품은 이 꽃만 싱싱하다 (사용자 피드백 2026-11-05 단풍골 6. 예전의 크고 탁한 꽃은 징그러웠다).
   곧게 선 꽃대에 맑은 자줏빛 꽃이 층층이 피고, 밑동의 푸른 꽃받침이 해머루 송이를 그릇처럼 받쳐 든다. 알은 해를 머금은 듯 따뜻하게 빛난다.
   빈틈 표식은 그 해머루 자리에 뜬다. 빈틈이 닫히거나 맞으면 시들어 가라앉는다. */
const KFRESH={dk:'#7b2f6e',spot:'#f2cf5a',stem:'#3f5a2a'},KFRESH_PET='#c45ea6',KFRESH_LEAF='#4f7a35',KMEORU='#4b2f78';
const KMUD=KFRESH_PET;   // 친 꽃이 터질 때 튀는 빛깔
function kudzuOpenMark(p){
  if(!p.core||coreHidden())return false;
  const pos=kudzuMark(p),life=B.E.markLife||120;
  B.mark={x:pos.x,y:pos.y,t:life,max:life,part:p};B.kWeak={x:pos.x,y:pos.y,t:0,fade:0};
  B.msg=B.kWeakSeen?'싱싱한 칡꽃이 솟았다.':'싱싱한 칡꽃이 솟았다. 꽃받침에 해머루가 담겼다.';B.kWeakSeen=true;
  return true;
}
function drawWeakFlower(c){
  const w=B.kWeak;if(!w)return;
  const rise=Math.min(1,w.t/9),pop=rise<1?rise*(1+0.25*Math.sin(rise*Math.PI)):1,a=1-w.fade/16,x=w.x,still=Vfx.reducedMotion;let y=w.y;
  if(a<=0)return;
  // 결정 D-745: 약점 꽃을 예전(1.2배)의 2/3 크기(0.8배)로 줄인다 (사용자 피드백 2026-11-05 단풍골 3). 해머루 송이가 칠 자리(w.x, w.y)에
  // 꼭 겹치게, 줄인 그림의 해머루가 y 에 오도록 꽃 전체를 그 아래에서 그린다. 칠 자리 판정은 그 점 그대로다.
  const S=0.8,gy=y+16,y0=gy-(gy-y)/S;
  const sway=still?0:Math.sin(B.time*0.06)*1.2,fx=x+sway*0.4;
  blob(c,x,gy,11,3.2,KSOIL,0.55*a);brush(c,[[x-9,gy],[x-2,gy-1],[x+2,gy+1],[x+9,gy-1]],1.1,INK,0.45*a);   // 갈라진 흙 틈
  c.save();c.globalAlpha=a;c.translate(x,gy);c.scale(pop*S,pop*S);c.translate(-x,-gy);y=y0;
  brush(c,[[x,gy],[x+sway*0.2,y+12],[fx,y+5]],3.6,KFRESH.stem);   // 곧은 푸른 꽃대
  kLeaf(c,x-8,gy-6,0.95,-1.15,KFRESH_LEAF);kLeaf(c,x+8,gy-9,0.85,1.05,KFRESH_LEAF);
  // 꽃받침 위로 곧게 솟은 싱싱한 꽃송이 (아래는 활짝, 위로 갈수록 봉오리)
  kFlower(c,fx,y-4,34,sway*1.5,KFRESH_PET,1,0,KFRESH);
  // 해를 머금은 듯한 따뜻한 빛 (해머루)
  {const g=c.createRadialGradient(fx,y+3,1,fx,y+3,15);g.addColorStop(0,'rgba(255,214,120,.55)');g.addColorStop(1,'rgba(255,214,120,0)');
    c.save();c.fillStyle=g;c.beginPath();c.arc(fx,y+3,15,0,Math.PI*2);c.fill();c.restore();}
  // 해머루 송이: 알 다섯이 꽃받침 그릇에 소복이 담겼다
  for(const [dx,dy,r] of [[-4,-1,3.5],[3.6,-1.4,3.5],[0,-4.8,3.5],[-1.8,1.8,3.2],[2.6,2,3.1]]){
    blob(c,fx+dx,y+dy,r+0.5,r+0.5,INK,0.55);blob(c,fx+dx,y+dy,r,r,KMEORU);
    blob(c,fx+dx-r*0.3,y+dy-r*0.35,r*0.32,r*0.28,'#f4e9ff',0.85);}
  // 꽃받침: 해머루를 아래에서 감싸 드는 푸른 잎 그릇
  for(const s of [-1,1]){c.save();c.translate(fx+s*6.5,y+7);c.rotate(s*0.85);blob(c,0,0,4.2,8.5,INK,0.8);blob(c,0,0,3.4,7.6,KFRESH_LEAF);blob(c,-s*0.8,-2,1.2,3,'#9cc27a',0.6);c.restore();}
  blob(c,fx,y+9.5,8,3,INK,0.75);blob(c,fx,y+9.2,7,2.4,KFRESH_LEAF);
  c.restore();
}
function tickKudzu(){for(const h of B.kHoles||[])h.t--;if(B.kHoles)B.kHoles=B.kHoles.filter(h=>h.t>0);
  const w=B.kWeak;if(w){w.t++;if(!B.mark||!B.mark.part.core)w.fade++;if(w.fade>16)B.kWeak=null;}}
defineAttacks({
  kudzuWhip:{dur:2*WHIP.gap+WHIP.tell+WHIP.swing,tick(t){if(t)return;B.kHold=null;
    // 결정 D-371: 여덟 방향 가운데 무작위. 바로 앞 줄기와 같은 방향이나 맞은편 방향은 피한다
    let prev=B.kWhipDir??-1;
    for(let i=0;i<3;i++){let k;do k=Math.floor(Math.random()*8);while(prev>=0&&(k===prev||(k+4)%8===prev));prev=k;
      B.bullets.push({k:'kudzuWhip',t:0,delay:i*WHIP.gap,dir:k,last:i===2,seed:i*1.7,ox:null});}
    B.kWhipDir=prev;}},
  kudzuSlam:{get dur(){return (slamCount()-1)*SLAM.gap+SLAM.tell+SLAM.drop+10;},tick(t){if(t)return;B.kHold=null;
    const n=slamCount();B.slamRound=n;const lean=Math.random()<0.5?-1:1;
    // 결정 D-246: 뿌리가 내리찍는 기울기가 한 대마다 왼쪽·오른쪽 위로 번갈아 바뀐다
    for(let i=0;i<n;i++)B.bullets.push({k:'kudzuSlam',t:0,delay:i*SLAM.gap,x:null,y:null,last:i===n-1,lean:i%2?-lean:lean});}},
  kudzuScent:{dur:2*SCENT.gap+SCENT.tell+SCENT.burst,tick(t){if(t)return;B.kHold=null;
    // 결정 D-246: 둘째·셋째 꽃은 양옆이나 위아래에 번갈아 핀다
    const side=Math.random()<0.5?-1:1,axis=altDir('kScent')?'v':'h';for(let i=0;i<3;i++)B.bullets.push({k:'kudzuScent',t:0,delay:i*SCENT.gap,i,side,axis,seed:i*2.3+side,x:null,y:null});}},
});
defineBullets({
  kudzuWhip:{
    step(b){const held=b.last&&!b.cut&&heldBy(b);b.t++;const s=whipState(b);
      if(held&&b.t>s.lp)b.t=s.lp;   // 표식이 열린 동안 늘어진 채로 둔다
      if(b.ox==null&&b.t>b.delay)aimWhip(b);   // 예고가 시작될 때 자리를 정한다 (마지막 줄기는 그때의 손 자리)
      if(s.swing&&b.ox!=null){const tip=b.L*s.k,h=whipLocal(b,B.px,B.py);
        if(h.d<whipHalf()&&h.s>=0&&h.s<=tip)bHitMe();}
      if(b.t>s.end)b.dead=1;},
    draw(c,b){const s=whipState(b);if(s.wait||b.ox==null)return;
      const half=whipHalf(),nx=-b.dy,ny=b.dx,P=(sv,o=0)=>[b.ox+b.dx*sv+nx*o,b.oy+b.dy*sv+ny*o];
      if(s.tell){const k=(b.t-b.delay)/WHIP.tell,flash=k>0.72&&Math.floor(b.t/4)%2;
        // 줄기가 닿을 길이만큼만 띠가 붉어진다. 끝선이 있어 어디서 멈추는지 보인다
        const q=[P(0,-half),P(b.L,-half),P(b.L,half),P(0,half)];
        c.save();c.fillStyle='rgba(180,67,42,'+(0.05+0.13*k).toFixed(3)+')';c.beginPath();c.moveTo(q[0][0],q[0][1]);for(const v of q.slice(1))c.lineTo(v[0],v[1]);c.closePath();c.fill();
        c.strokeStyle=RED;c.globalAlpha=flash?0.95:0.45;c.lineWidth=1.6;c.setLineDash([7,5]);c.beginPath();
        c.moveTo(q[0][0],q[0][1]);c.lineTo(q[1][0],q[1][1]);c.lineTo(q[2][0],q[2][1]);c.lineTo(q[3][0],q[3][1]);c.stroke();c.restore();
        // 상자 가장자리에서 줄기 끝이 뒤로 감긴다
        const e=toBoxEdge(b.ox,b.oy,b.dx,b.dy)>0?14:0,C=(sv,o)=>P(e+sv,o);
        kStem(c,[C(-6,10),C(4,2),C(10,-8),C(4,-13),C(-2,-6)],5,KSTEM,0.4+0.5*k);return;}
      if(s.swing){const tip=b.L*s.k;
        for(let j=-2;j<=2;j++)brush(c,[P(0,j*half*0.4),P(tip,j*half*0.3)],2,INK,0.12);   // 후려치는 바람
        const pts=whipPts(b,0,tip,false);kStem(c,pts,8,KSTEM,1);
        for(let i=2;i<pts.length-1;i+=3)kLeaf(c,pts[i][0]+nx*3,pts[i][1]+ny*3,0.6,Math.atan2(b.dy,b.dx)+0.6,KLEAF,0.85);
        const [tx,ty]=whipPt(b,tip,false);brush(c,[[tx,ty],[tx-b.dx*8+nx*7,ty-b.dy*8+ny*7],[tx-b.dx*3+nx*11,ty-b.dy*3+ny*11]],3,KSTEM);return;}
      const back=s.back;
      if(!b.cut){const pts=whipPts(b,0,b.L*(1-back),s.limp||heldBy(b));kStem(c,pts,7,KSTEM,s.limp||heldBy(b)?0.9:0.7*(1-back));
        if(s.limp||heldBy(b))for(let i=2;i<pts.length-1;i+=3)kLeaf(c,pts[i][0]-nx*2,pts[i][1]+2,0.6,Math.atan2(b.dy,b.dx)+2.6,KLEAF,0.7);
        return;}
      // 끊긴 줄기: 뿌리 쪽은 거둬 가고, 끝 쪽은 떨어지며 흐려진다
      const cut=b.cutS,keep=cut*(1-back);
      kStem(c,whipPts(b,0,keep,true),7,KSTEM,0.85);
      c.save();c.globalAlpha=1-s.fallK;c.translate(0,s.fallK*24);kStem(c,whipPts(b,cut,b.L,true),6,KSTEM,0.8);c.restore();
    }},
  kudzuSlam:{
    step(b){const held=b.last&&!b.dug&&heldBy(b);b.t++;
      if(b.x==null&&b.t>b.delay){b.x=B.px;b.y=B.py;}
      const f=slamAt(b);
      if(b.t===f.hit){Sound.playSfx('battle_hit');bSplash(b.x,b.y,KSOIL);if(Math.hypot(B.px-b.x,B.py-b.y)<SLAM.radius)bHitMe();
        (B.kHoles||(B.kHoles=[])).push({x:b.x,y:b.y+4,t:T().kudzu_hole_frames,max:T().kudzu_hole_frames,seed:Math.random()*6});if(B.kHoles.length>6)B.kHoles.shift();}
      if(held&&b.t>f.hit)b.liftAt=b.t+1;   // 표식이 열린 동안 땅에 박힌 채로 둔다
      if(!held&&b.t>Math.max(f.hit+SLAM.stay,slamLiftAt(b)+18))b.dead=1;},
    draw(c,b){if(b.x==null)return;const f=slamAt(b),R=SLAM.radius;
      if(f.shadow||f.falling){const k=f.shadow?(b.t-b.delay)/SLAM.tell:1;
        blob(c,b.x,b.y+6,R*(0.45+0.55*k),R*0.42*(0.45+0.55*k),INK,0.12+0.3*k);
        if(k>0.7&&Math.floor(b.t/4)%2){c.save();c.strokeStyle=RED;c.lineWidth=2;c.globalAlpha=0.8;c.beginPath();c.ellipse(b.x,b.y+6,R,R*0.42,0,0,Math.PI*2);c.stroke();c.restore();}}
      if(f.falling){const k=(b.t-b.delay-SLAM.tell)/SLAM.drop,ty=BOX.y-6+(b.y+4-BOX.y+6)*k*k;kSpike(c,b.x,ty,b.lean||0.3,1);
        for(let i=0;i<3;i++)kSoil(c,b.x+(i-1)*7+(b.lean||0.3)*6,ty-34-i*9+k*6,1.3,0.8,i);   // 함께 떨어지는 흙 부스러기
        for(let i=-1;i<=1;i++)brush(c,[[b.x+i*9,b.y-46],[b.x+i*9,b.y-24]],1.1,INK,0.3);}   // 내리꽂히는 줄
      if(f.after){const a=b.t-f.hit,lift=clamp((b.t-slamLiftAt(b))/16,0,1);
        kSpike(c,b.x,b.y+4-(b.y-BOX.y+40)*lift*lift,b.lean||0.3,1-lift*0.6);
        c.save();c.strokeStyle=INK;c.globalAlpha=Math.max(0,1-a/SLAM.stay);c.lineWidth=1.4;c.beginPath();
        for(let i=0;i<5;i++){const ang=i*Math.PI*2/5+0.3,r0=8,r1=12+a*0.45;c.moveTo(b.x+Math.cos(ang)*r0,b.y+5+Math.sin(ang)*r0*0.42);c.lineTo(b.x+Math.cos(ang+0.12)*r1,b.y+5+Math.sin(ang+0.12)*r1*0.42);}
        c.stroke();c.restore();}
    }},
  kudzuScent:{
    step(b){b.t++;
      if(b.x==null&&b.t>b.delay){const o=b.i===0?0:(b.i===1?1:-1)*b.side,m=SCENT.radius;
        if(b.axis==='v'){b.x=clamp(B.px+(b.i===2?14:b.i?-10:0),BOX.x+m,BOX.x+BOX.w-m);
          // 위아래로 피면 상자 안에 들도록, 손이 가장자리에 붙어 있으면 반대쪽으로 더 멀리 민다
          let y=B.py+o*58;if(y<BOX.y+m*0.7||y>BOX.y+BOX.h-m*0.7)y=B.py-o*58;b.y=clamp(y,BOX.y+m*0.7,BOX.y+BOX.h-m*0.7);}
        else{b.x=clamp(B.px+o*80,BOX.x+m,BOX.x+BOX.w-m);b.y=clamp(B.py+(b.i===2?14:b.i?-10:0),BOX.y+m*0.7,BOX.y+BOX.h-m*0.7);}}
      const s=scentAt(b);
      if(b.x!=null){const d=Math.hypot(b.x-B.px,b.y-B.py);
        if(s.burst&&d<SCENT.radius*(1-(1-s.k)*(1-s.k)))scentHit();          // 꽃가루가 번지는 동안
        else if((s.linger||(s.fade&&s.k<0.5))&&d<SCENT.radius-4)scentHit();}  // 남은 잔향에 들어가도
      if(b.t>s.end)b.dead=1;},
    draw(c,b){if(b.x==null)return;const s=scentAt(b),R=SCENT.radius,still=Vfx.reducedMotion,x=b.x,y=b.y;
      const motes=(n,spread,rise,alpha)=>{for(let i=0;i<n;i++){const h1=hash(i*1.7+b.seed),h2=hash(i*3.1+b.seed*2),a=h1*Math.PI*2,r=spread*(0.35+0.65*h2);
        blob(c,x+Math.cos(a)*r,y+Math.sin(a)*r-rise*(0.4+h2),2+1.6*h1,2+1.6*h1,i%3?KPUR_LT:'#efe3c8',alpha);}};
      const pool=(r,alpha)=>{const g=c.createRadialGradient(x,y,2,x,y,r);
        g.addColorStop(0,'rgba(125,80,150,'+(0.5*alpha).toFixed(3)+')');g.addColorStop(0.75,'rgba(183,145,204,'+(0.38*alpha).toFixed(3)+')');g.addColorStop(1,'rgba(183,145,204,0)');
        c.save();c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.restore();};
      const bloom=(len,lean,alpha)=>{c.save();c.translate(x,y+8);c.scale(1.4,1.4);kFlower(c,0,0,len,lean,KPUR_LT,alpha,0.7);c.restore();};   // 바닥에서 솟은 칡꽃송이. 결정 D-620: 힘없이 시든 꽃
      if(s.tell){const k=s.k;
        c.save();c.strokeStyle=KPUR;c.globalAlpha=0.35+0.2*k;c.lineWidth=1.2;c.setLineDash([3,4]);c.beginPath();c.arc(x,y,R*(0.55+0.45*k),0,Math.PI*2);c.stroke();c.restore();
        if(k>0.75&&Math.floor(b.t/4)%2){c.save();c.strokeStyle=RED;c.globalAlpha=0.8;c.lineWidth=1.8;c.beginPath();c.arc(x,y,R,0,Math.PI*2);c.stroke();c.restore();}
        const sway=still?0:Math.sin(b.t*0.25)*2;
        kLeaf(c,x-10,y+9,0.75,-0.9,KLEAF,0.4+0.5*k);kLeaf(c,x+10,y+9,0.7,0.9,KLEAF,0.4+0.5*k);
        const pop=k<0.7?k/0.7:1+Math.sin((k-0.7)/0.3*Math.PI)*0.12;   // 빨리 솟아 터지기 직전에 한 번 부푼다
        bloom(6+28*Math.min(pop,1.12),sway,0.45+0.55*k);return;}
      if(s.burst){const k=s.k,e=1-(1-k)*(1-k);
        pool(R*e,1);
        if(k<0.6)bloom(34*(1-k),still?0:Math.sin(b.t*0.9)*4,1-k*1.4);   // 팡 터지며 꽃송이가 흩어진다
        c.save();c.strokeStyle='#fffaf0';c.globalAlpha=Math.max(0,0.9-k*1.1);c.lineWidth=3*(1-k)+1;c.beginPath();c.arc(x,y,R*(0.35+1.05*e),0,Math.PI*2);c.stroke();c.restore();
        for(let i=0;i<9;i++){const a=i*0.7+b.seed,d=R*(0.25+1.25*e),px2=x+Math.cos(a)*d,py2=y+Math.sin(a)*d*0.85;   // 사방으로 튀는 꽃잎
          c.save();c.translate(px2,py2);c.rotate(a+k*3);c.globalAlpha=Math.max(0,1-k*0.9);c.fillStyle=i%3?KPUR:KPUR_LT;c.beginPath();c.ellipse(0,0,4.2,2.4,0,0,Math.PI*2);c.fill();c.restore();}
        motes(24,R*1.05*e,6*k,0.9-0.3*k);return;}
      const a=s.fade?1-s.k:1,pulse=still?1:1+Math.sin(b.t*0.12+b.seed)*0.04;
      pool(R*pulse,a);
      c.save();c.strokeStyle=KPUR;c.globalAlpha=0.3*a;c.lineWidth=1;c.beginPath();c.arc(x,y,R-4,0,Math.PI*2);c.stroke();c.restore();
      const drift=still?0:b.t*0.02;
      for(let i=0;i<6;i++){const ang=drift+i*1.05+b.seed,r=R*(0.25+0.5*hash(i+b.seed));
        blob(c,x+Math.cos(ang)*r,y+Math.sin(ang)*r*0.8-(still?0:Math.sin(b.t*0.05+i)*2),1.6,1.6,i%2?KPUR_LT:'#efe3c8',0.65*a);}
    }},
});
defineEnemies({
  kudzu:{name:'엉킨 칡',calmLabel:'진정',
    // 결정 D-227: 전투 글귀는 일어난 일만 짧게. 피하라·치라는 안내는 쓰지 않는다
    intro:'칡덩굴이 뱀처럼 당산나무를 감고 고개를 든다.',
    firstPart:'arm',
    // 결정 D-177: 공격 뒤 매듭 풀기(진정 행동)와 선물 받은 덩굴이 내미는 매듭을 없앤다. 달래기는 버섯 선물로만 한다.
    // 결정 D-370: 부서진 부위의 공격은 더 고르지 않는다. weak 는 부서진 뒤 한 줄
    parts:tableParts('kudzu',{arm:{atk:'kudzuWhip',mark:'줄',tell:'칡줄기가 뒤로 감긴다.',weak:'칡이 약해졌다. 끊긴 줄기로는 더 후려치지 못한다.'},
      root:{atk:'kudzuSlam',mark:'뿌',tell:'칡뿌리 끝이 쳐들린다.',weak:'칡이 약해졌다. 부러진 뿌리로는 더 찍지 못한다.'},
      core:{atk:'kudzuScent',mark:'꽃',tell:'칡꽃이 피어오른다.'}}),
    likes:TABLES.CALM.kudzu,likeText:'버섯 향에 덩굴이 조금 느슨해진다.',
    coreHidden:'칡꽃이 잎 뒤에 숨어 있다.',
    coreShown:'잎이 걷혀 칡꽃이 드러났다!',
    calmWin:'엉킨 칡이 스르르 풀리며 당산나무를 놓아준다.',calmGift:'kflower',
    win:'칡꽃송이가 꺾이자 덩굴이 힘없이 흘러내린다.',
    lose:'덩굴에 밀려 숲 어귀로 물러났다.',
    markPosition:kudzuMark,openMark:kudzuOpenMark,onMarkHit:kudzuMarkHit,drawFloor:drawKudzuFloor,tickHazards:tickKudzu,
    backdrop:drawKudzuHill,draw:drawKudzu},
  /* 무쇠는 피하기만 하는 시험이다. 꿀밤으로 연장을 놓치고 여섯 판을 버틴다 (결정 D-59·D-60). */
  musoe:{name:'무쇠',calmLabel:'마음',npc:true,dodge:6,showHands:true,
    intro:'"삼촌, 왜 이래요!" 손 아래 그림자가 짙어지면 그 자리에서 비키자.',
    goalText:'연장 없이 피하기만! 그림자가 지면 비키고, 밝아지는 화덕 불씨 위에는 오래 있지 말자.',
    bonkText:'"어른 앞에서 연장 들이대지 마라!" 딱! 꿀밤이 날아왔다.',
    parts:tableParts('musoe',{fist:{atk:'musoeFist',tell:BONK_LINES[0]}}),
    pickAttack:pickBonk,tickHazards:tickForgeFire,drawFloor:drawForgeFloor,finale:bonkFinale,
    likes:TABLES.CALM.musoe,likeText:'"…마침 출출하던 참이다." 무쇠의 어깨가 조금 내려간다.',
    coreHidden:'',coreShown:'',
    calmWin:'무쇠 삼촌이 쳐들었던 주먹을 푼다. "…됐다. 형을 꼭 닮았군."',
    win:'한 대 쥐어박고 나서야 무쇠가 고개를 끄덕인다. "됐다. 보부상 소리 할 만하다."',
    lose:'무쇠의 꿀밤에 밀려 대장간 밖으로 굴러 나왔다.',
    /* 마지막 연출의 꿀밤은 세지 않는다. 그 전까지 맞은 횟수로 덤을 정한다: 0대면 숯, 1~2대면 주먹밥 (bosses.csv 비고) */
    onWin(B){if(B.hits===0){B.loot.push('coal');B.bonus='마지막 한 대 말고는 다 피했다! 무쇠가 숯 한 덩이를 던져 준다.';}else if(B.hits<=2){B.loot.push('rice');B.bonus='무쇠가 주먹밥을 하나 내준다. "잘 버텼다."';}else B.bonus='간신히 버텼다. 무쇠가 피식 웃는다.';},
    backdrop:drawSmithy,draw:drawMusoe},
});
})();
