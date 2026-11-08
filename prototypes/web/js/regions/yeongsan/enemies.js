'use strict';
/* 북쪽 영산 전투: 어둑차사. 원본 표: design/data/bosses.csv · boss_parts.csv (보스 id 는 옛 강철이의 gangcheol 그대로)
   결정 D-1080 (사용자 지시 2026-11-07, design/proposals/name-story-v3.md §3): 마지막 보스는 이무기 강철이가 아니라 어둑차사다.
     저승사자의 갓과 도포를 쓴 어둠(어둑시니)이고, 소매 끝은 까마귀 깃으로 풀렸고, 한 손에 붉은 적패지(명부)를 늘어뜨린다. 정체는 밝히지 않는다.
   결정 D-1086: 패턴은 메인 넷과 발악 하나. 부위 넷은 적패지·소매·도포 자락·갓(핵심).
     - 갓의 차례 = 삼혼 부르기 (이름 먹기, engine/battle-names.js). 처음은 gangcheol_namecall_first 번째 공격, 그 뒤 gangcheol_namecall_every 차례마다.
     - 적패지 = 붉은 오랏줄 (결정 D-1144·D-1272) · 소매 = 까마귀 떼 (결정 D-1141·D-1270) · 도포 자락 = 도포 펼치기 (결정 D-1146·D-1276)
     - 발악 = 명부 펼치기 (결정 D-1142). 핵이 드러난 뒤 갓을 한 번 치거나 남은 몫이 name_final_hp_ratio 밑이면 한 번.
       끝에 아빠 목소리의 마지막 부름이 오고, 참으면 핵을 묶은 낙관 매듭이 느슨해진다.
   결정 D-1271 (사용자 지시 2026-11-08 38): 패턴을 피한 뒤 빈틈에는 금빛 표식 대신 적패지에 적힌 남의 이름이 판 바닥에서 떠오른다.
     치면 이름이 임자에게 돌아가고, 그 패턴을 낸 부위가 깎인다(부위 공략의 흐름은 그대로).
   결정 D-1273: 부위 셋의 몫을 chasa_core_reveal 만큼 깎으면 핵이 드러난다. 핵은 갓 아래 깊이 감춘 새잎 빛, 맨 먼저 먹은 신목의 이름이다.
     핵을 쳐서 갓(핵심 부위)을 다 깎으면 이긴다. 무엇인지 화면에 이름을 내지 않는다(신목 이름은 봄에도 화면에 내지 않는다).
   결정 D-370·D-1145: 부서진 부위는 그 공격을 더 고르지 않고, 부서진 모습으로 그린다.
   결정 D-1322 (사용자 지시 2026-11-08 42): 이 전투의 중심은 이름 빼앗기다. 패턴마다 실패하면 하트보다 이름을 먼저 잃는다.
     오랏줄에 오래 묶임·셋째 부름에 돌아봄(그대로), 까마귀 떼에 처음 닿으면 한 마리가 이름을 물어 감, 도포 속에서 못 빠져나오면 도포가 이름을 감싸 쥠.
     이름을 다 잃은 텅 빈 손(battle-names.js nameHollow)이면 빈틈의 바닥 이름(내 별명)이 손 바로 곁에 떠오른다. 핵이 드러난 뒤에도 그렇다.
   붉은색은 적패지와 오랏줄에만 쓴다 (§3.1). 칠 수 있는 것은 금빛(D-228). 넋의 손만 옅은 푸른 흰빛이다(결정 D-1276). */
(()=>{
const T=()=>TABLES.TUNING;
const still=()=>Vfx.reducedMotion;
const PALE='#ebe5d8',PALE_DK='#b9b0a0',SCROLL='#a3261c',SCROLL_DK='#5e120c',STRAW='#c9a868',SNOW='#f6f4ef',FIRE='#7ab8e8',NIGHT='#0e0b09';
function ch(){return B.ch||(B.ch={turn:0,despDone:false,dark:0,voices:[],seal:false,flap:0,
  bind:null,robe:0,night:0,flock:0,flights:[],strips:0,revealed:false,ropeDir:-1,
  wrap:0,squeeze:0,robeOut:false,robeFail:false,tornT:0,seamX:0,crowTook:false});}   // 결정 D-1323: 도포가 감싼 정도·조임·솔기
function poly(c,pts,fill,alpha=1,stroke=null,lw=1.6){c.save();c.globalAlpha=alpha;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
  c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.lineJoin='round';c.stroke();}c.restore();}
/* 까마귀 깃 하나: (x,y)에서 a 방향으로 len */
function quill(c,x,y,len,wid,a,col=INK,alpha=1){
  const ca=Math.cos(a),sa=Math.sin(a),nx=-sa,ny=ca;
  poly(c,[[x,y],[x+ca*len*0.35+nx*wid,y+sa*len*0.35+ny*wid],[x+ca*len,y+sa*len],[x+ca*len*0.4-nx*wid*0.7,y+sa*len*0.4-ny*wid*0.7]],col,alpha);
}
/* 나는 까마귀 한 마리를 지금 길(path)에 더한다. a 는 머리 쪽, k 는 크기, f 는 날갯짓(-1 아래 ~ 1 위).
   여러 마리를 한 길에 모아 한 번에 칠해 휴대폰에서도 버티게 한다 (결정 D-1270) */
/* 위에서 본 나는 까마귀: 굵은 부리, 둥근 머리, 쐐기꼴 꽁지, 끝이 손가락처럼 갈라진 넓은 날개. 날갯짓에 날개 폭이 접혔다 펴진다 */
function crowShape(c,x,y,a,k,f){
  const ca=Math.cos(a)*k,sa=Math.sin(a)*k,sp=5.2+4.6*(0.5+0.5*f),sw=1.2-1.6*(0.5+0.5*f);
  const half=s=>[[2.6,s*1.7],[0.6+sw,s*(sp*0.55)],[-0.8+sw,s*sp],[-1.9+sw,s*(sp-1.2)],[-2.6+sw,s*(sp-0.3)],[-3.2+sw,s*(sp-1.9)],[-3,s*1.5],[-5,s*1.2],[-9.6,s*3.4]];
  const pts=[[8.2,0],[6,-1.2],...half(-1),[-8.6,0],...half(1).reverse(),[6,1.2]];
  pts.forEach(([px,py],i)=>{const X=x+px*ca-py*sa,Y=y+px*sa+py*ca;i?c.lineTo(X,Y):c.moveTo(X,Y);});c.closePath();
}

/* ---------- 이름들 ---------- */
/* 결정 D-1271: 적패지에 적힌 남의 이름. 빈틈마다 판 바닥에서 하나씩 떠오른다. 먼저 먹힌 내 이름, 그다음 이 순서.
   - 호숫가 마을 넷: 이름이 하나씩뿐이라 세 번째 부름에 통째로 넘어간 이들(region.js 결정 D-430). 치면 호숫가 쪽으로 날아간다.
     봄에 순덕 아주머니가 "호수 쪽에서 내 이름이 날아왔어"라고 한다.
   - 명다리 아이들: 신목이 이름을 잃은 뒤 셋째 부름마다 풀려 날아간 천의 이름(두루미 이야기 CRANE_DAD). 치면 신목 가지로 돌아가 감긴다.
     오래 살라고 천하게 지은 아명들이다(명다리를 거는 까닭과 같다).
   - 다 돌려준 뒤엔 닳아 읽히지 않는 오래된 이름이 떠오른다. 임자를 아무도 몰라 하늘로 풀려 간다.
   hand 는 도포 속에서 솟는 그 임자의 넋의 손 (결정 D-1276). 돌려준 이름은 G.f.chasaFreed 에 남아 다시 싸워도 떠오르지 않는다. */
const LEDGER_NAMES=[
  {id:'lake_malsun',text:'말순',to:'lake',hand:'bear'},
  {id:'lake_gapdol',text:'갑돌',to:'lake',hand:'badger'},
  {id:'lake_bongsun',text:'봉순이',to:'lake',hand:'rabbit'},
  {id:'lake_sundeok',text:'순덕',to:'lake',hand:'weasel'},
  {id:'myeong_gaettong',text:'개똥이',to:'tree',hand:'otter'},
  {id:'myeong_ganan',text:'간난이',to:'tree',hand:'bird'},
  {id:'myeong_bawi',text:'바우',to:'tree',hand:'bear'},
  {id:'myeong_samwol',text:'삼월이',to:'tree',hand:'rabbit'},
  {id:'myeong_makdong',text:'막동이',to:'tree',hand:'otter'},
  {id:'myeong_kkotbun',text:'꽃분이',to:'tree',hand:'bird'},
];
function nextFloorName(){
  const N=B.names;
  if(N&&N.eaten.length){const id=N.eaten[N.eaten.length-1],n=(G.nicknames||[]).find(q=>q.id===id);if(n)return {kid:true,id,text:n.text};}
  const freed=G.f.chasaFreed||[],f=LEDGER_NAMES.find(q=>!freed.includes(q.id));
  return f||{old:true,text:''};
}
/* 이름이 임자에게 날아간다: 내 이름은 손으로, 호숫가 이름은 왼쪽 호숫가로, 명다리 이름은 오른쪽 신목 가지로, 오래된 이름은 하늘로 */
function freeFloorName(f,x,y){
  const S=ch();
  if(f.kid){nameReturnIds([f.id],x,y);Sound.playSfx('battle_soothe');return;}
  if(!f.old)G.f.chasaFreed=[...new Set([...(G.f.chasaFreed||[]),f.id])];
  S.flights.push({text:f.text,x,y,to:f.old?'sky':f.to,t:0,max:f.to==='tree'?84:64});
  bLater(f.old?'닳은 이름이 하늘로 풀려 간다.':f.to==='tree'?'"'+f.text+'." 이름이 신목 가지로 돌아가 감긴다.':'"'+f.text+'." 이름이 호숫가 쪽으로 날아간다.',34);
  Sound.playSfx('battle_soothe');
}
const treeAt=()=>{const gy=BOX.y-52;return {x:LW*0.96-4,y:gy*0.86+8};};
function flightTarget(q){if(q.to==='lake')return {x:-30,y:BOX.y-70};if(q.to==='tree')return treeAt();return {x:q.x+(q.x<LW/2?-60:60),y:-30};}

/* ---------- 그림 ---------- */
/* 달래면 짚신을 신고 갓을 숙인 뒤 북쪽 길(오른쪽 위)로 걸어 사라진다. 0 → 1 */
function chasaLeave(){return B.st==='end'&&B.result==='calm'?1-Math.max(0,B.t)/80:0;}
function chasaWon(){return B.st==='end'&&B.result==='win';}
/* 그림 좌표(0.84배 축소 전)를 화면 좌표로 */
function toScreen(x,y){return {x:LW/2+(x-LW/2)*0.84,y:EY+(y-EY)*0.84};}
/* 적패지가 늘어진 자리 (이름패가 날아드는 곳) */
function scrollAt(){const cx=LW/2,cy=EY,k=chasaLeave(),torn=B.parts&&part('body').broken;return toScreen((torn?cx-44:cx-86)+k*k*200,cy+40-k*k*120);}
/* 몸 둘레 어둠: 도포를 펼치거나 까마귀 떼가 솟으면 커진다 */
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
/* 결정 D-1270 (사용자 지시 2026-11-08 34): 하늘의 까마귀 떼. 수백 마리가 한 몸처럼 휘돌며 머리·눈·꼬리를 가진 커다란 것 하나를 그린다.
   머리가 지나간 길을 몸이 그대로 따라오고(뱀이 기듯), 머리 쪽이 굵고 꼬리로 갈수록 가늘다. 숨 쉬듯 굵기가 부풀었다 준다.
   머리 곁 빈자리가 눈처럼 보이고, 그 안에 흐린 빛이 비친다. 가까이 보면 한 마리 한 마리가 날갯짓하는 까마귀다.
   떼는 펼친 소매에서 쏟아져 나와 모이고, 패턴이 끝나면 소매로 돌아간다. 몸 그림 뒤에 그린다 */
/* 머리가 도는 길: 갓 위를 지나 어둑차사 둘레를 8자로 크게 감돈다 */
/* 결정 D-1324 (사용자 지시 2026-11-08 40: 그냥 뭉쳐 있는 모양이라 배열과 수에 변화를 줘 꾸물꾸물하게): 감도는 8자의 폭과 높이가 천천히 바뀐다.
   몸을 따라 부풂과 잘록함이 물결처럼 흐르고(chasa_crow_bulge), 까마귀가 몸 안에서 자리를 바꾸고, 몸이 두세 줄기로 갈라졌다 다시 합친다.
   가장자리에서 몇 마리씩 떨어져 나갔다 돌아오고, 꼬리 쪽 몇십 마리가 멀리 날아갔다 돌아와 마리 수가 늘고 준다. */
function skyHead(t){const w=0.012,ax=LW*0.27*(1+0.14*Math.sin(t*0.0041)),ay=52*(1+0.22*Math.sin(t*0.0063+1));return {x:LW/2+ax*Math.sin(t*w),y:EY-22+ay*Math.sin(t*w*2+0.6)};}
function skyFrame(t,s){
  const lag=170,p=skyHead(t-s*lag),q=skyHead(t-s*lag-2),dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy)||1;
  const breath=(1+0.1*Math.sin(t*0.045+s*4))*(1+T().chasa_crow_bulge*1.4*Math.sin(t*0.042-s*9.5)),w=(s<0.06?14+s/0.06*30:44*(1-0.84*Math.pow((s-0.06)/0.94,1.15)))*breath;
  return {x:p.x,y:p.y,nx:-dy/d,ny:dx/d,a:Math.atan2(dy,dx),w};
}
function drawSkyFlock(c,fade,src){
  const S=ch();if(S.flock<0.02)return;
  const t=still()?40:B.time,n=still()?90:T().chasa_crow_sky,e=S.flock*S.flock*(3-2*S.flock),mv=!still();
  const sm=x=>x*x*(3-2*x),split=mv?sm(clamp(Math.sin(t*0.0115+0.8)*1.5-0.5,0,1)):0;   // 두세 줄기로 갈라지는 정도
  const nVis=mv?Math.round(n*(0.9+0.1*Math.sin(t*0.021))):n;   // 이만큼 뒤의 까마귀는 멀리 날아갔다 돌아온다
  c.save();c.fillStyle=INK;
  for(const pass of [0,1]){
    c.globalAlpha=(pass?0.94:0.5)*fade*Math.min(1,e*1.4);c.beginPath();
    for(let j=pass;j<n;j+=2){
      const r=hash(j*5.17),lobe=j%3-1,s0=Math.pow((j+0.5)/n,1.25);
      const s=clamp(s0+(mv?0.035*Math.sin(t*0.05-s0*14):0)+lobe*split*0.05,0,1),F=skyFrame(t,s);   // 몸을 따라 흐르는 촘촘함의 물결
      let o=hash(j*7.31)*2-1;o=Math.sign(o)*Math.pow(Math.abs(o),0.7);
      if(mv)o=clamp(o+0.24*Math.sin(t*0.013*(0.6+r)+j*2.1),-1.15,1.15);   // 몸 안에서 자리를 바꾼다
      if(s<0.08&&o>0.1&&o<0.62)o=o<0.36?0.08:0.66;   // 눈 자리는 비운다
      o=o*(1-split*0.45)+lobe*split*0.75;   // 갈라지면 가는 줄기 셋이 나란히 난다
      const jx=mv?Math.sin(t*0.07+j*1.7)*3.4:0,jy=mv?Math.cos(t*0.06+j*2.3)*2.8:0;
      let x=F.x+F.nx*o*F.w+jx,y=F.y+F.ny*o*F.w+jy,a=F.a+(hash(j*2.9)-0.5)*0.6;
      if(mv&&r<0.16){const ex=Math.pow(Math.max(0,Math.sin(t*0.017*(0.7+r*4)+j)),3),sg=o>=0?1:-1;   // 가장자리에서 떨어져 나갔다 돌아온다
        x+=F.nx*sg*ex*F.w*1.6+Math.cos(F.a)*ex*16;y+=F.ny*sg*ex*F.w*1.6+Math.sin(F.a)*ex*16;a+=sg*ex*0.9;}
      if(mv&&j>=nVis-10){const k=clamp((j-nVis+10)/14,0,1),sg=hash(j*3.9)<0.5?-1:1,q=(sg<0?Math.PI:0)-sg*(0.2+hash(j*1.3)*0.5);x+=Math.cos(q)*k*LW*0.6;y+=Math.sin(q)*k*LH*0.25;a=q;}   // 옆으로 멀리 날아간다
      const from=j%2?src.R:src.L;x=from.x+(x-from.x)*e;y=from.y+(y-from.y)*e;
      crowShape(c,x,y,a,1.05+hash(j)*0.45,mv?Math.sin(t*0.5+j*1.3):0.3);
    }
    c.fill();}
  c.restore();
  if(e>0.6){const F=skyFrame(t,0.035),ex=F.x+F.nx*0.36*F.w,ey=F.y+F.ny*0.36*F.w,a=(e-0.6)/0.4*fade;
    blob(c,ex,ey,6,3.4,'#e9dfc8',0.55*a);blob(c,ex+Math.cos(F.a)*1.2,ey+Math.sin(F.a)*1.2,2,2,INK,0.85*a);}   // 흐린 눈빛
}
function drawChasaBody(c,fade){
  const cx=LW/2,cy=EY,S=ch(),scroll=part('mouth'),sleeve=part('body'),robe=part('tail'),gat=part('core');
  const tell=B.st==='tell'&&B.cur,sway=still()?0:Math.sin(B.time*0.03)*3,hidden=coreHidden(),calm=B.st==='end'&&B.result==='calm';
  const desp=tell&&B.cur.id==='ledger'||B.st==='atk'&&B.cur&&B.cur.id==='ledger';
  const R=robe.broken?0:S.robe;
  const grow=Math.max(S.dark,desp?0.8:0,hidden?0.25:0,R*0.7,S.flock*0.35);
  drawAura(c,cx,cy,grow,fade);
  // 길고 흰 손 둘: 왼손은 적패지를 쥐고, 오른손은 손가락을 늘어뜨린다. 소매가 뜯기면 손이 몸 가까이 내려온다. 도포를 펼치면 두 손이 자락 끝을 잡아 벌린다
  const open=(tell&&B.cur===sleeve||S.flock>0.05)&&!sleeve.broken?Math.max(tell&&B.cur===sleeve?1:0,S.flock):0;
  const handAt=s=>{const h=sleeve.broken?{x:cx+s*42+shk(sleeve),y:cy+34}:{x:cx+s*(86+open*26)+shk(sleeve),y:cy+(32-open*30)};
    if(R<=0.01)return h;const o={x:cx+s*(22+56*R),y:cy+6};return {x:h.x+(o.x-h.x)*R,y:h.y+(o.y-h.y)*R};};
  // 도포 자락 (몸): 어깨에서 바닥까지 넓게 퍼진다. 결정 D-1145: 부서지면 찢겨 짧아진다
  // 펼친 뒤엔 붉게 깜빡이지 않는다 (붉은색은 적패지·오랏줄에만, §3.1)
  {const o=shk(robe),col=R>0.1?INK:partCol(robe),spread=(tell&&B.cur===robe?6:0)+R*84,hemY=robe.broken?cy+74:cy+124;
    const L=[[cx-30+o,cy-38],[cx-46+o-spread*0.4,cy+20],[cx-66+o-spread,hemY-4],[cx-74+o-spread,hemY]],Rt=[[cx+30+o,cy-38],[cx+46+o+spread*0.4,cy+20],[cx+66+o+spread,hemY-4],[cx+74+o+spread,hemY]];
    const hem=[];for(let i=0;i<=10;i++){const u=i/10,x=cx-74-spread+u*(148+spread*2)+o,j=robe.broken?(hash(i*2.3)*16-4):Math.sin(i*1.7+(still()?0:B.time*0.05))*3;hem.push([x,hemY+j]);}
    const outline=[...L,...hem.slice(1,-1),...Rt.slice().reverse()];
    poly(c,outline,col===INK?'#191512':col,0.93*fade,S.night>0.05?'rgba(214,224,232,'+(0.2*S.night).toFixed(3)+')':null,1.2);   // 어둠이 내려앉으면 겉감 윤곽만 겨우 보인다
    for(let i=0;i<5;i++){const x=cx-34+i*17+o;brush(c,[[x,cy-20],[x+(i-2)*(4+R*10),cy+40],[x+(i-2)*(9+R*22),hemY-6]],1.4,'#4a423b',0.55*fade*(1-R*0.7));}   // 옷 주름
    // 자락 끝은 까마귀 깃처럼 풀려 있다
    for(let i=0;i<9;i++){const u=(i+0.5)/9,x=cx-70-spread+u*(140+spread*2)+o;quill(c,x,hemY-2,robe.broken?10:16,3,Math.PI/2+(hash(i)-0.5)*0.8,INK,0.85*fade);}
    if(robe.broken)for(let i=0;i<4;i++)blob(c,cx-50+i*32,hemY+4+hash(i)*6,6,3,'#efe3c8',0.5*fade);   // 찢긴 틈의 종이빛
    // 결정 D-1276 (사용자 지시 2026-11-08 36): 도포를 양쪽으로 펼치면 안은 아무것도 없는 어둠이다. 먹은 동물들의 이름만 떴다 사라진다
    if(R>0.02){const top=cy-30,w=y=>5+(10+50*R-5)*clamp((y-top)/(hemY-top),0,1);
      const left=[],right=[];for(let i=0;i<=8;i++){const y=top+(hemY-2-top)*i/8,ww=w(y)+Math.sin(i*1.3+(still()?0:B.time*0.04))*2*R;left.push([cx+o-ww,y]);right.push([cx+o+ww,y]);}
      // 바닥이 안 보이는 깊은 어둠: 가운데는 아주 짙은 먹, 가장자리로 갈수록 더 검다. 별빛 같은 것은 없다
      const mid=(top+hemY)/2,g=c.createRadialGradient(cx+o,mid,4,cx+o,mid,Math.max(40,(hemY-top)*0.7));
      g.addColorStop(0,'#1d1916');g.addColorStop(0.6,'#0b0908');g.addColorStop(1,'#020101');
      poly(c,[...left,...right.reverse()],g,0.98*fade*Math.min(1,R*1.6));
      // 이름은 자리 여섯에 하나씩만 뜬다. 줄마다 좌우로 번갈아 줄 간격이 글자보다 넓어 겹치지 않는다
      c.save();c.font='11px "Gowun Batang", "Batang", serif';c.textAlign='center';c.textBaseline='middle';
      for(let i=0;i<6;i++){const y=top+18+i/5*(hemY-top-34),x=cx+o+(i%2?0.38:-0.38)*w(y),
          fl=still()?0.5:Math.pow(Math.max(0,Math.sin(B.time*0.04+i*2.3)),3),nm=LEDGER_NAMES[(i+Math.floor(B.time/150)*6)%LEDGER_NAMES.length].text;
        c.globalAlpha=fl*R*fade*0.7;c.fillStyle='#b9c4cc';c.fillText(nm,x,y);}
      c.restore();}
    if(tell&&B.cur===robe&&!still())for(let i=0;i<6;i++)blob(c,cx-60+i*24,hemY+8+((B.time+i*7)%20),5,4,INK,0.5);}   // 자락에서 먹이 스민다
  // 소매 (까마귀 깃): 어깨에서 양옆으로 넓게 늘어진다. 결정 D-1145: 부서지면 깃이 다 뜯겨 넝마처럼 어깨에서 늘어진다
  {const o=shk(sleeve),col=partCol(sleeve),flap=S.flap>0&&!still()?Math.sin(S.flap*0.6)*6:0;
    for(const s of [-1,1]){
      const sx=cx+s*28+o,sy=cy-34,h=handAt(s),ex=h.x,ey=h.y-2+flap*s;
      if(sleeve.broken){for(let i=0;i<4;i++){const x=sx+s*(4+i*8),y=sy+2,l=24+hash(i*3+s)*16,sw=still()?0:Math.sin(B.time*0.04+i)*2;
          poly(c,[[x-3,y],[x+3,y],[x+2+s*2+sw,y+l],[x-1+sw,y+l-5],[x-2,y+l*0.6]],INK,0.82*fade);}
        for(let i=0;i<4;i++)quill(c,cx+s*(60+i*18),cy+126,10,2.5,(s>0?0.2:Math.PI-0.2)+hash(i)*0.4,INK,0.6*fade);}   // 바닥에 흩어진 깃
      else{poly(c,[[sx,sy],[sx+s*14,sy-4],[ex+s*8,ey-12],[ex+s*10,ey+10],[ex-s*16,ey+14],[sx-s*2,sy+30]],col===INK?'#1d1915':col,0.92*fade);
        for(let i=0;i<7;i++){const u=i/6;quill(c,ex-s*16+u*s*26,ey+8+u*4,14+hash(i+s)*6,3.4,Math.PI/2+s*(0.2+u*0.6),INK,0.9*fade);}}   // 깃으로 풀린 소매 끝
    }}
  for(const s of [-1,1]){const h=handAt(s),hx=h.x,hy=h.y;
    poly(c,[[hx-5,hy-4],[hx+5,hy-4],[hx+4,hy+8],[hx-4,hy+8]],PALE,0.95*fade,PALE_DK,1);
    for(let f=0;f<4;f++){const fx=hx-4.5+f*3,len=s>0?14+f%2*3:9;brush(c,[[fx,hy+6],[fx+s*0.6,hy+6+len*0.6],[fx+s*1.4,hy+6+len]],1.6,PALE,0.95*fade);}}
  // 적패지: 왼손에서 바닥까지 늘어진 붉은 무명 한 폭. 먹은 이름이 붉은 붓 자국으로 비친다. 결정 D-1145: 부서지면 찢겨 반은 바닥에 떨어진다
  {const o=shk(scroll),lift=(tell&&B.cur===scroll?-22:0)+(B.st==='ntell'||B.st==='ncall'?-30:0),h=handAt(-1),hx=h.x+o-2,hy=h.y+6+lift;
    const wv=still()?0:Math.sin(B.time*0.05)*6,len=(scroll.broken?48:92)-lift*0.3,col=scroll.broken?'#b0574d':SCROLL,al=(scroll.broken?0.6:0.92)*fade;
    const pts=[];for(let i=0;i<=12;i++){const u=i/12;pts.push([hx+Math.sin(u*4.2+wv*0.06)*(4+u*6)-u*8,hy+u*len]);}
    const L=[],Rr=[];pts.forEach((q,i)=>{const a=pts[Math.max(0,i-1)],z=pts[Math.min(pts.length-1,i+1)],dx=z[0]-a[0],dy=z[1]-a[1],d=Math.hypot(dx,dy)||1,
      w=(12+Math.sin(i*0.9+wv*0.1)*3)/2,nx=-dy/d*w,ny=dx/d*w;L.push([q[0]+nx,q[1]+ny]);Rr.push([q[0]-nx,q[1]-ny]);});
    const end=pts[pts.length-1];
    poly(c,[...L,[end[0]+3,end[1]+4],[end[0]-1,end[1]+1],[end[0]-4,end[1]+5],...Rr.reverse()],col,al);   // 끝은 올이 풀렸다
    c.save();c.globalAlpha=al*0.55;c.strokeStyle='#d8705e';c.lineWidth=1;c.beginPath();L.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore();   // 천의 접힌 가장자리
    for(let i=1;i<11;i++){if(i%2)continue;const q=pts[i];brush(c,[[q[0]-3,q[1]],[q[0]+2,q[1]+0.6]],1.1,SCROLL_DK,0.8*fade);brush(c,[[q[0]-2,q[1]+4],[q[0]+3,q[1]+4.4]],1,SCROLL_DK,0.6*fade);}   // 읽히지 않는 붓 자국
    const eaten=B.names?B.names.eaten.length:0;
    for(let i=0;i<Math.min(eaten,5);i++){const q=pts[2+i*2],pulse=0.4+0.2*Math.sin(B.time*0.08+i);blob(c,q[0],q[1]+2,3.4,2.4,'#e0503a',pulse*fade);}
    if(scroll.broken)drawScrollLying(c,cx-118,cy+128,0.7*fade);}
  // 갓끈과 구슬
  if(!gat.broken)for(const s of [-1,1]){brush(c,[[cx+s*18,cy-62],[cx+s*12,cy-40],[cx+s*6,cy-18]],1.2,INK,0.8*fade);
    for(let i=0;i<5;i++){const u=i/4;blob(c,cx+s*(18-u*12),cy-60+u*42,1.6,1.6,'#2c2620',0.9*fade);}}
  // 갓 아래: 얼굴이 없다. 어둠뿐이고, 그 안에 까마귀 부리 같은 그림자가 이따금 비친다. 결정 D-1273: 핵이 드러나면 깊은 데 새잎 빛이 비친다
  {const o=shk(gat),hy=cy-50+(calm?4:0);
    for(let i=0;i<5;i++)blob(c,cx+o+(i-2)*3,hy+2+i*2,22-i*2,25-i,'#0c0907',0.32*fade);   // 갓 아래로 번지는 어둠 (테두리가 없다)
    blob(c,cx+o,hy+3,17,19,'#0c0907',0.9*fade);
    if(S.revealed&&!gat.broken&&!calm){const p=0.55+0.25*Math.sin(B.time*0.06);
      const g=c.createRadialGradient(cx+o,hy+8,1,cx+o,hy+8,12);g.addColorStop(0,'rgba(244,222,140,'+(0.75*p*fade).toFixed(3)+')');g.addColorStop(1,'rgba(244,222,140,0)');
      c.save();c.fillStyle=g;c.beginPath();c.arc(cx+o,hy+8,12,0,Math.PI*2);c.fill();c.restore();
      leafBud(c,cx+o,hy+10,0.55,p*fade);}
    brush(c,[[cx-19+o,cy-37],[cx-6+o,cy-20],[cx+o,cy-16],[cx+6+o,cy-20],[cx+19+o,cy-37]],2.6,PALE,0.7*fade);   // 도포의 흰 동정
    const flick=still()?0.5:0.5+0.5*Math.sin(B.time*0.07)*Math.sin(B.time*0.031);
    if(flick>0.35&&!calm&&!S.revealed)poly(c,[[cx-3+o,hy-4],[cx-24+o,hy+10],[cx-6+o,hy+4]],'#3a332d',0.85*flick*fade);
    // 갓: 넓은 챙과 높은 대우
    const tilt=calm?0.18:0,col=partCol(gat),gc=col===INK?'#14100d':col,alpha=(hidden?0.35:1)*fade;
    c.save();c.translate(cx+o,cy-66+(calm?4:0));c.rotate(tilt);
    c.globalAlpha=alpha;c.fillStyle=gc;c.beginPath();c.ellipse(0,0,64,9,0,0,Math.PI*2);c.fill();
    c.strokeStyle=S.night>0.3?'#6d6a66':'#3d3630';c.lineWidth=1;c.beginPath();c.ellipse(0,0,64,9,0,0,Math.PI*2);c.stroke();
    for(let i=0;i<10;i++){const a=i/10*Math.PI;c.beginPath();c.moveTo(Math.cos(a)*20,Math.sin(a)*3);c.lineTo(Math.cos(a)*62,Math.sin(a)*8.6);c.stroke();}   // 챙의 대오리 결
    c.beginPath();c.moveTo(-19,-1);c.lineTo(-17,-28);c.quadraticCurveTo(0,-33,17,-28);c.lineTo(19,-1);c.closePath();c.fillStyle=gc;c.fill();c.stroke();   // 대우
    c.restore();
    if(hidden)for(let i=0;i<6;i++)blob(c,cx-50+i*20,cy-70+hash(i)*14,22,14,INK,0.35*fade);}   // 갓이 어둠 속에 가라앉아 있다
  // 짚신: 달래면 자락 아래로 짚신 두 짝이 보인다
  if(calm&&gotShoes()){for(const s of [-1,1]){blob(c,cx+s*14,cy+128,9,3.6,STRAW,0.95*fade);brush(c,[[cx+s*14-7,cy+127],[cx+s*14+7,cy+127]],1,'#8a6a38',0.9*fade);}}
  drawSkyFlock(c,fade,{L:handAt(-1),R:handAt(1)});   // 까마귀 떼는 몸 앞으로 지나간다
  drawRobeWrap(c);   // 결정 D-1323: 크게 펼친 도포가 판을 덮어 감싼다
}
/* 결정 D-1323 (사용자 지시 2026-11-08 41: 도포를 엄청 크게 확 펼쳐 주인공이 도포 속에 감싸인 느낌. 안의 어두운 공간에 갇혀 패턴을 깨고 빠져나온다):
   두 자락이 어깨에서 화면 양 끝까지 크게 펼쳐지고(앞 절반), 이어 위에서 판 위로 덮이며 솔기(seamX)에서 맞닿아 닫힌다(뒤 절반).
   닫히면 전투 화면 전체가 도포 안의 어둠이다. 동물 이름만 떴다 사라지고 손 둘레만 희미하게 밝다(drawChasaFloor).
   자락 끝은 까마귀 깃으로 풀려 있다. 찢고 나오면 자락이 양옆으로 젖혀지며 빛이 쏟아진다(tornT). */
function drawRobeWrap(c){
  const S=ch(),w=S.wrap;if(w<0.005)return;
  const e=w*w*(3-2*w),cx=LW/2,cy=EY,sx=S.seamX||LW/2,k1=clamp(e/0.5,0,1),k2=clamp((e-0.5)/0.5,0,1),L=(a,b,u)=>a+(b-a)*u,mv=!still();
  c.save();c.translate(LW/2,EY);c.scale(1/0.84,1/0.84);c.translate(-LW/2,-EY);   // 몸 그림의 0.84배를 풀어 화면 좌표로
  const sh=toScreen(cx,cy-36);
  if(k2>0){c.fillStyle='#070504';c.globalAlpha=0.97*k2;c.fillRect(-40,-40,LW+80,LH+80);c.globalAlpha=1;}   // 다 덮이면 빈 데 없이 어둡다
  for(const s of [-1,1]){
    const E0={x:cx+s*90,y:cy+150},E1={x:s<0?-70:LW+70,y:LH*0.72},E2={x:sx,y:LH+70};
    const C0={x:cx+s*80,y:cy+40},C1={x:cx+s*LW*0.46,y:-50},C2={x:sx,y:BOX.y-34};
    const Ex=k2>0?L(E1.x,E2.x,k2):L(E0.x,E1.x,k1),Ey=k2>0?L(E1.y,E2.y,k2):L(E0.y,E1.y,k1);
    const Cx=k2>0?L(C1.x,C2.x,k2):L(C0.x,C1.x,k1),Cy=k2>0?L(C1.y,C2.y,k2):L(C0.y,C1.y,k1);
    const hem=[];for(let i=0;i<=26;i++){const u=i/26,x0=sh.x+s*16,x=(1-u)*(1-u)*x0+2*(1-u)*u*Cx+u*u*Ex,y=(1-u)*(1-u)*sh.y+2*(1-u)*u*Cy+u*u*Ey,
      wv=mv?Math.sin(u*11+B.time*0.13+s)*3*u:0;hem.push([x+wv*0.6,y+wv]);}
    const out=s<0?-90:LW+90,pts=[[cx,-60],...hem,[hem[hem.length-1][0],LH+90],[out,LH+90],[out,-60]];
    const g=c.createLinearGradient(sh.x,sh.y,Ex,Ey);g.addColorStop(0,'#1c1714');g.addColorStop(1,'#060403');
    poly(c,pts,g,0.98);const edge=1-k2*k2;if(edge<0.02)continue;
    for(let i=1;i<4;i++){const u=i/4;brush(c,[[sh.x+s*10,sh.y+6],[L(sh.x,Cx,u*0.8)+s*i*14,L(sh.y,Cy,u)+20],[L(sh.x,Ex,u)+s*i*26,L(sh.y,Ey,u)]],2,'#2e2620',0.5*edge);}   // 옷 주름
    c.save();c.strokeStyle='rgba(214,224,232,'+(0.28*edge).toFixed(3)+')';c.lineWidth=1.4;c.beginPath();hem.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore();   // 자락 가장자리
    for(let i=2;i<hem.length;i+=2){const [x,y]=hem[i],[x0,y0]=hem[i-1],a=Math.atan2(y-y0,x-x0)-s*Math.PI/2;quill(c,x,y,12+hash(i+s)*6,3,a+(hash(i*2.3)-0.5)*0.5,INK,0.9*edge);}   // 깃으로 풀린 끝
  }
  // 갇힌 어둠 속에 먹힌 동물 이름이 떴다 사라진다 (판 바깥 화면 곳곳)
  if(e>0.7){c.save();c.font='12px "Gowun Batang", "Batang", serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#b9c4cc';
    for(let i=0;i<9;i++){const fl=mv?Math.pow(Math.max(0,Math.sin(B.time*0.03+i*2.1)),4):0.3;if(fl<0.03)continue;
      const x=LW*(0.08+0.84*hash(i*3.7+Math.floor(B.time/200))),y=LH*(0.08+0.5*hash(i*5.1+Math.floor(B.time/200)));
      c.globalAlpha=fl*0.45*(e-0.7)/0.3;c.fillText(LEDGER_NAMES[(i+Math.floor(B.time/160))%LEDGER_NAMES.length].text,x,y);}
    c.restore();}
  // 솔기: 두 자락이 맞닿은 줄. 빛이 갈라지면 위아래로 밝은 틈이 난다 (판 안은 솔기 칼집이 따로 그린다)
  const seam=B.bullets.find(q=>q.k==='chasaSeam');
  if(k2>0.95){const lit=seam?seam.lit||0:0,y0=BOX.y-40;
    c.save();c.strokeStyle=lit>0?'rgba(255,244,207,'+(0.35+0.6*lit).toFixed(3)+')':'rgba(120,110,100,.4)';c.lineWidth=lit>0?2+lit*2:1;c.beginPath();
    for(let y=y0;y<=LH;y+=8)c.lineTo(sx+(hash(y*0.37)-0.5)*(lit>0?4:2),y);c.stroke();
    if(lit>0){const g=c.createLinearGradient(sx-18,0,sx+18,0);g.addColorStop(0,'rgba(255,244,207,0)');g.addColorStop(0.5,'rgba(255,244,207,'+(0.22*lit).toFixed(3)+')');g.addColorStop(1,'rgba(255,244,207,0)');c.fillStyle=g;c.fillRect(sx-18,y0,36,LH-y0);}
    c.restore();}
  c.restore();
}
/* 새잎 하나: 핵(신목 이름)의 모습. 금빛(칠 수 있는 것, D-228)에 새잎 결 */
function leafBud(c,x,y,k,a){
  if(a<=0)return;c.save();c.translate(x,y);c.scale(k,k);c.globalAlpha=a;
  c.strokeStyle='#8a5e0c';c.lineWidth=1.6;c.lineCap='round';c.beginPath();c.moveTo(0,5);c.quadraticCurveTo(-1,0,0,-5);c.stroke();   // 줄기
  // 떡잎 둘이 양옆으로 벌어진 새싹
  for(const s of [-1,1]){c.save();c.translate(0,-4);c.rotate(s*1.15);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(s*5,-5,0,-12);c.quadraticCurveTo(-s*3,-5,0,0);c.closePath();
    const g=c.createLinearGradient(0,0,0,-12);g.addColorStop(0,'#c98a12');g.addColorStop(1,'#f4de8c');c.fillStyle=g;c.fill();
    c.strokeStyle='#8a5e0c';c.lineWidth=1;c.stroke();c.beginPath();c.moveTo(0,-1);c.lineTo(s*0.8,-8);c.strokeStyle='rgba(255,250,230,.8)';c.stroke();c.restore();}
  blob(c,0,-6,2,2.6,'#f8e8a8',a);   // 가운데 움
  c.restore();
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
  // 결정 D-1273: 갓 아래 감춰 둔 새잎 빛이 섬(오른쪽) 쪽으로 날아간다
  const k=clamp((80-Math.max(0,B.t))/70,0,1),tr=treeAt(),s=toScreen(cx,cy-40);
  if(k<1)leafBud(c,s.x+(tr.x-s.x)*k,s.y+(tr.y-s.y)*k-Math.sin(k*Math.PI)*60,0.9,1-k*0.6);
}
/* 결정 D-1149: 전투 배경은 (D-62 대로) 상대 뒤쪽 화면 전체. 겨울밤의 언 호수: 눈구름 뒤 흐린 달빛, 눈 덮인 능선, 금줄 두른 맨가지 신목, 눈 얹힌 갈대, 내리는 눈 */
function drawNightLake(c){
  const t=B.time,gy=BOX.y-52,S=ch();
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
  // 결정 D-1271: 돌려준 명다리 이름마다 가지에 흰 천이 하나씩 다시 감긴다
  const BR=[[sx-30,gy*0.21],[sx-52,gy*0.17],[sx-74,gy*0.12],[sx+12,gy*0.2],[sx-92,gy*0.19],[sx+24,gy*0.08]];
  for(let i=0;i<Math.min(S.strips,BR.length);i++){const [x,y]=BR[i],sw=still()?0:Math.sin(t*0.04+i)*1.5;
    c.save();c.fillStyle='rgba(250,246,236,.88)';c.beginPath();c.moveTo(x-2.5,y);c.lineTo(x+2.5,y);c.lineTo(x+2.5+sw,y+12);c.lineTo(x-2.5+sw,y+12);c.closePath();c.fill();c.restore();
    brush(c,[[x-3,y],[x+3,y]],1.4,'#6b5540',0.7);}
  for(let i=0;i<9;i++){const x=LW*0.2+i*LW*0.011,h=40+hash(i*3.3)*36,sw=still()?0:Math.sin(t*0.02+i*0.7)*3;   // 눈 얹힌 갈대
    brush(c,[[x,gy+4],[x+sw*0.5,gy-h*0.5],[x+sw,gy-h]],1.6,INK,0.5);blob(c,x+sw,gy-h-3,3,4,SNOW,0.8);}
  const n=still()?40:70;   // 비스듬히 내리는 눈
  for(let i=0;i<n;i++){const x=(hash(i*2.1)*LW+(still()?0:t*(0.5+hash(i)*0.5)))%(LW+40)-20,y=(hash(i*6.1)*LH+(still()?0:t*(0.9+hash(i*1.3)*0.8)))%LH;
    blob(c,x,y,1.4+hash(i*4)*1.4,1.4+hash(i*4)*1.2,SNOW,0.75);}
  // 결정 D-1276: 도포 속을 열면 전투 칸 전체에 어둠이 내려앉는다
  if(S.night>0.01){c.save();c.fillStyle=NIGHT;c.globalAlpha=T().chasa_robe_dark*S.night;c.fillRect(0,0,LW,LH);c.restore();}
}

/* ---------- 공격 ---------- */
/* (x,y)에서 (vx,vy) 쪽으로 상자 테두리까지의 거리 */
function boxEdge(x,y,vx,vy){let t=Infinity;
  if(vx>1e-6)t=Math.min(t,(BOX.x+BOX.w-x)/vx);else if(vx<-1e-6)t=Math.min(t,(BOX.x-x)/vx);
  if(vy>1e-6)t=Math.min(t,(BOX.y+BOX.h-y)/vy);else if(vy<-1e-6)t=Math.min(t,(BOX.y-y)/vy);
  return Math.max(0,t);}
/* 결정 D-1272 (사용자 지시 2026-11-08 35, 결정 D-1144를 바꿈): 붉은 오랏줄. 넋이 도망치지 못하게 묶는 차사의 포승줄이다.
   - 여덟 방향 가운데 무작위로 뻗는다(1스테이지 칡 채찍처럼 바로 앞 줄과 같거나 맞은편 방향은 피한다). 뻗기 시작할 때의 손 자리를 겨누고,
     뻗는 동안 줄 끝이 손 쪽으로 조금 휘어 다가온다(chasa_rope_seek). 숫자 예고는 없다. 판 가장자리에 줄 끝이 잠깐 비죽 나와 떠는 것이 전조다.
   - 닿아도 다치지 않는다. 손목이 묶인다. 묶인 동안 손은 묶인 자리 둘레(chasa_rope_tether)만 겨우 움직인다.
   - 묶이면 손 바로 곁 줄 위에 금빛 칠 곳이 생긴다. chasa_rope_cut_hits 번 빠르게 치면 끊긴다. 칠 때마다 올이 튀고, 반쯤 끊기고, 끊어진다.
   - chasa_rope_bind_frames 동안 못 끊으면 손 위에 떠는 이름패 하나가 줄을 타고 적패지로 끌려가 먹힌다(battle-names.js nameTake).
     먹을 이름이 없으면 손목을 조여 한 칸 다치고 풀린다. */
function ropePlan(){
  const S=ch(),n=T().chasa_rope_count,ropes=[];let prev=S.ropeDir;
  for(let i=0;i<n;i++){let d;do d=Math.floor(Math.random()*8);while(prev>=0&&(d===prev||(d+4)%8===prev));prev=d;ropes.push({dir:d,delay:i*T().chasa_rope_gap});}
  S.ropeDir=prev;return {kind:'rope',ropes};
}
function ropeSpawn(dir){
  const a=dir*Math.PI/4+(Math.random()-0.5)*0.3,dx=Math.cos(a),dy=Math.sin(a),tx=B.px,ty=B.py;
  const back=boxEdge(tx,ty,-dx,-dy)+12,L=back+boxEdge(tx,ty,dx,dy)+14;
  return {k:'chasaRope',t:0,dx,dy,ox:tx-dx*back,oy:ty-dy*back,L,sp:back,bend:0,seed:Math.random()*6};
}
function ropePhase(b){const t=T(),tl=t.chasa_rope_tell,la=tl+t.chasa_rope_lash,ho=la+t.chasa_rope_hold,end=ho+t.chasa_rope_back;
  const tip=b.t<=tl?0:b.t<=la?(b.t-tl)/t.chasa_rope_lash*b.L:b.t<=ho?b.L:Math.max(0,1-(b.t-ho)/t.chasa_rope_back)*b.L;
  return {tl,la,ho,end,tip,tell:b.t<=tl};}
function ropeOff(b,s){const k=clamp(s/b.sp,0,1),wave=still()?0:Math.sin(s*0.09+b.t*0.25+b.seed)*2.4;return b.bend*k*k*(3-2*k)+wave;}
function ropePt(b,s){const o=ropeOff(b,s);return [b.ox+b.dx*s-b.dy*o,b.oy+b.dy*s+b.dx*o];}
function ropeLocal(b,x,y){const rx=x-b.ox,ry=y-b.oy;return {s:rx*b.dx+ry*b.dy,d:-rx*b.dy+ry*b.dx};}
function ropeStroke(c,pts,w,alpha){
  if(pts.length<2||alpha<=0)return;
  c.save();c.globalAlpha=alpha;c.strokeStyle=SCROLL;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
  c.strokeStyle='#e8b0a0';c.lineWidth=1;c.globalAlpha=alpha*0.6;c.beginPath();   // 꼰 줄의 결
  for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i],n=Math.max(1,Math.floor(Math.hypot(x1-x0,y1-y0)/5));
    for(let k=0;k<n;k++){const u=(k+0.5)/n,x=x0+(x1-x0)*u,y=y0+(y1-y0)*u;c.moveTo(x-1.5,y-1.5);c.lineTo(x+1.5,y+1.5);}}
  c.stroke();c.restore();
}
/* 줄 끝의 올: (x,y)에서 a 쪽으로 풀린 가닥 */
function fray(c,x,y,a,n,len,alpha,seed=0){c.save();c.strokeStyle=SCROLL;c.globalAlpha=alpha;c.lineWidth=1.2;c.lineCap='round';c.beginPath();
  for(let i=0;i<n;i++){const q=a+(hash(i*3.3+seed)-0.5)*1.4,l=len*(0.6+hash(i*1.7+seed)*0.6);c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(q)*l*0.5,y+Math.sin(q)*l*0.5+1,x+Math.cos(q+0.3)*l,y+Math.sin(q+0.3)*l);}
  c.stroke();c.restore();}
function ropeBind(b){
  const t=T(),S=ch(),aimUp=t.battle_aim_up*t.battle_hand_scale;
  B.py=Math.max(B.py,BOX.y+12+aimUp);   // 줄이 손을 끌어 도구 날이 판 안에 들게 한다
  const a=bAim(),dx=b.ox-B.px,dy=b.oy-B.py,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
  const sx=clamp(a.x+ux*t.chasa_rope_spot,BOX.x+8,BOX.x+BOX.w-8),sy=clamp(a.y+uy*t.chasa_rope_spot,BOX.y+8,BOX.y+BOX.h-8);
  S.bind={b,t:0,hits:0,px:B.px,py:B.py,sx,sy,name:nameBindTarget(),flash:0};b.caught=true;
  B.msg='붉은 오랏줄이 손목을 감았다!';Sound.playSfx('chasa_write');B.quakeT=Math.max(B.quakeT||0,6);
}
/* 묶인 채 치기: 칠 곳에 도구 날이 닿으면 한 단계씩 끊긴다 (상대가 치기를 먼저 처리한다, battle.js strike) */
function chasaStrike(){
  const S=ch(),bd=S.bind;
  // 결정 D-1323: 도포 솔기를 친다. 칠 때마다 틈이 벌어지고 chasa_robe_tear_hits 번이면 찢겨 빛이 쏟아진다
  const seam=!bd&&B.bullets.find(q=>q.k==='chasaSeam'&&q.ph==='lit'&&q.lit>0.6);
  if(seam){const a=bAim();if(Math.hypot(a.x-seam.x,a.y-seam.y)>battleHandProfile().radius+T().chasa_rope_spot_slack+4)return false;
    seam.hits++;seam.flash=12;B.hitStop=3;if(!still())B.quakeT=5;
    for(let i=0;i<6+seam.hits*4;i++){const q=Math.random()*Math.PI*2,s=1+Math.random()*2.8;B.fx.push({x:seam.x,y:seam.y,vx:Math.cos(q)*s,vy:Math.sin(q)*s,r:1+Math.random()*1.8,t:24,col:i%2?'#fff4cf':'#e9dfc8'});}
    if(seam.hits>=T().chasa_robe_tear_hits){seam.ph='torn';seam.t=0;S.robeOut=true;S.tornT=30;B.msg='솔기가 찢어졌다! 빛이 쏟아져 들어온다.';Sound.playSfx('battle_part_break');return true;}
    B.msg='탁! 솔기 틈이 벌어진다.';Sound.playSfx('battle_hit');return true;}
  if(!bd)return false;
  const a=bAim();if(Math.hypot(a.x-bd.sx,a.y-bd.sy)>battleHandProfile().radius+T().chasa_rope_spot_slack)return false;
  bd.hits++;bd.flash=12;B.hitStop=3;if(!still())B.quakeT=5;
  for(let i=0;i<5+bd.hits*3;i++){const q=Math.random()*Math.PI*2,s=1+Math.random()*2.6;B.fx.push({x:bd.sx,y:bd.sy,vx:Math.cos(q)*s,vy:Math.sin(q)*s,r:1+Math.random()*1.6,t:22,col:i%3?SCROLL:'#e8b0a0'});}
  if(bd.hits>=T().chasa_rope_cut_hits){ropeRelease('cut');return true;}
  B.msg=bd.hits===1?'탁! 오랏줄 올이 튀었다.':'탁! 오랏줄이 반쯤 끊겼다.';Sound.playSfx('battle_hit');return true;
}
/* 묶임이 끝난다: cut(끊음) · take(이름을 묶어 감) */
function ropeRelease(how){
  const S=ch(),bd=S.bind;if(!bd)return;S.bind=null;const b=bd.b;b.caught=false;
  b.after={how,t:0,sx:bd.sx,sy:bd.sy,px:B.px,py:B.py};
  if(how==='cut'){B.msg='오랏줄이 끊어졌다!';Sound.playSfx('battle_part_break');bSplash(bd.sx,bd.sy,SCROLL);return;}
  const n=bd.name&&namesHeld().some(q=>q.id===bd.name.id)?bd.name:nameBindTarget();
  if(n){B.msg='오랏줄이 이름 하나를 묶어 끌고 간다.';nameTake(n,B.px,B.py-34);}
  else{B.inv=0;bHitMe();if(B.st!=='end')B.msg='오랏줄이 손목을 조이다 풀렸다.';}
}
/* 결정 D-1270 (사용자 지시 2026-11-08 34, 결정 D-1141을 바꿈): 까마귀 떼. 하늘에서 한 몸처럼 휘돌던 떼가 판으로 내리꽂혀 굵은 띠가 되어 지나간다.
   - 지나갈 길은 먼저 정찰 까마귀 몇 마리가 빠르게 날며 깃 자국으로 그어 둔다(전조). 그 뒤 떼의 머리가 들어오고 몸이 길을 그대로 따라온다.
   - 떼(띠)에 닿으면 다친다. 띠 위아래(또는 양옆)의 빈 데로 비켜 선다. 머리와 꼬리 쪽은 가늘다.
   - 판을 가로(왼↔오) 또는 세로(위↔아래)로 chasa_crow_waves 번 지나가고, 바로 앞과 다른 쪽에서 온다.
   - 예전의 쪽지 문 까마귀는 뺐다. 먹힌 이름은 빈틈에 바닥에서 떠오른다(결정 D-1271). */
function crowPlan(){
  const t=T(),passes=[];let prev=-1;
  for(let i=0;i<t.chasa_crow_waves;i++){let d;do d=Math.floor(Math.random()*4);while(d===prev);prev=d;
    // 결정 D-1324: 떼마다 굵기와 마리 수가 다르다(굵은 떼일수록 많다)
    const k=Math.random(),thick=t.chasa_crow_thick_min+k*(t.chasa_crow_thick_max-t.chasa_crow_thick_min);
    passes.push({dir:d,c:0.32+Math.random()*0.36,a:(d<2?0.2:0.18)+Math.random()*0.1,f:0.7+Math.random()*0.8,ph:Math.random()*Math.PI*2,delay:i*t.chasa_crow_gap,
      thick,n:Math.round(t.chasa_crow_count*(0.62+0.38*k))});}
  ch().crowTook=false;   // 결정 D-1322: 이번 차례에 까마귀가 이름을 물어 갔나
  return {kind:'crows',passes};
}
function passLen(P){const m=T().chasa_crow_margin;return (P.dir<2?BOX.w:BOX.h)+2*m;}
function passPt(P,u){
  const X=BOX.x,Y=BOX.y,W=BOX.w,H=BOX.h,m=T().chasa_crow_margin,L=passLen(P),sg=P.dir%2?-1:1,w=Math.sin(P.f*Math.PI*u/L+P.ph);
  if(P.dir<2)return [sg>0?X-m+u:X+W+m-u,Y+H*(P.c+P.a*w)];
  return [X+W*(P.c+P.a*w),sg>0?Y-m+u:Y+H+m-u];
}
function passU(P,x,y){const m=T().chasa_crow_margin,sg=P.dir%2?-1:1;
  if(P.dir<2)return sg>0?x-(BOX.x-m):BOX.x+BOX.w+m-x;return sg>0?y-(BOX.y-m):BOX.y+BOX.h+m-y;}
// 결정 D-1324: 굵기가 떼를 따라 물결치듯 부풀고 잘록해진다. 닿는 폭도 그림과 같이 바뀐다
function bandHalf(s,P){const t=T(),k=s<0.08?0.5+0.5*s/0.08:s>0.72?1-0.7*(s-0.72)/0.28:1;
  return t.chasa_crow_band*k*(P?P.thick:1)*(1+t.chasa_crow_bulge*Math.sin(B.time*0.09-s*10+(P?P.ph:0)));}
/* 결정 D-1322: 떼에 닿았다. 이번 차례에 처음이면 까마귀 한 마리가 이름을 물고 날아간다(하트는 그대로). 그 뒤로는 다친다 */
function crowHit(){
  if(B.inv>0||B.st==='end')return;const S=ch(),n=S.crowTook?null:nameBindTarget();
  if(n){S.crowTook=true;B.inv=T().battle_iframes;B.msg='까마귀 한 마리가 이름을 물고 날아오른다.';Sound.playSfx('crow_caw');nameTake(n,B.px,B.py-20,'crow');return;}
  bHitMe();
}
function flockHead(b){return (b.t-T().chasa_crow_scout)*T().chasa_crow_speed;}
/* 결정 D-1276 (사용자 지시 2026-11-08 36, 결정 D-1146을 바꿈): 도포 펼치기. 어둑차사가 도포를 양쪽으로 펼치면 안은 아무것도 없는 어둠이고
   먹은 동물들의 이름만 떴다 사라진다. 전투 칸 전체에 어둠이 내려앉는다(chasa_robe_dark).
   - 먹힌 이름이 튀어나와 친다: 이름은 그 동물의 기억이라, 판 바닥 곳곳에서 그 임자의 넋의 손이 밑에서 위로 솟는다.
     곰 발(둥근 발바닥, 짧고 굵은 발톱), 오소리 발(길게 휜 땅 파는 발톱), 토끼 발(길쭉하고 털 뭉치), 족제비 발(가늘게 벌린 다섯 발가락),
     수달 발(발가락 사이 물갈퀴), 새 발(비늘진 다리에 세 갈래 발가락과 뒷발가락). 손 곁에 그 이름이 흐리게 비친다.
   - 솟기 전 바닥에 넋빛 물결이 동그랗게 인다(전조 chasa_hand_tell). 셋에 하나는 손이 있는 자리를 노린다.
   - 도깨비불씨를 지녔으면 품 안 불빛이 어둠 속 물결을 일찍 비춰 전조가 chasa_fire_tell_bonus 만큼 길다. 손 둘레도 밝다.
   예전의 어둑 그림자(위에서 번지는 어둠, 손가락)는 뺐다. */
const HANDS=['bear','badger','rabbit','weasel','otter','bird'];
function handSpawn(near){
  const t=T(),X=BOX.x,Y=BOX.y,W=BOX.w,H=BOX.h;let x,y,n=0;
  do{if(near){x=B.px+(Math.random()-0.5)*20;y=B.py+6+Math.random()*12;}else{x=X+12+Math.random()*(W-24);y=Y+H*0.3+Math.random()*(H*0.7-8);}
    x=clamp(x,X+10,X+W-10);y=clamp(y,Y+24,Y+H-14);n++;}
  while(n<12&&B.bullets.some(q=>q.k==='chasaHand'&&Math.abs(q.x-x)<44&&Math.abs(q.y-y)<24));   // 이름표(손 아래 한 줄)끼리 안 겹치게
  const who=LEDGER_NAMES[Math.floor(Math.random()*LEDGER_NAMES.length)];
  // 높이를 섞어 곳곳에서 제각기 솟는다
  return {k:'chasaHand',x,y,t:0,kind:who.hand,name:who.text,h:t.chasa_hand_height*(0.7+Math.random()*0.6),
    tell:t.chasa_hand_tell+(has('dokkaebibul')?t.chasa_fire_tell_bonus:0),flip:Math.random()<0.5?-1:1};
}
/* 손 이름표는 손 바로 아래 한 줄. 먼저 솟은 손의 이름표와 겹치면 그 손이 가라앉은 뒤에 띄운다 */
function handLabelFree(b){return !B.bullets.some(q=>q!==b&&q.k==='chasaHand'&&!q.dead&&q.t>b.t&&Math.abs(q.x-b.x)<42&&Math.abs(q.y-b.y)<14);}
function handLabel(c,b,a){if(a<=0.01||!handLabelFree(b))return;
  c.save();c.globalAlpha=a;c.font='10px "Gowun Batang", "Batang", serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#d6e0e6';c.fillText(b.name,b.x,b.y+10);c.restore();}
function handPhase(b){const t=T(),r=b.tell+t.chasa_hand_rise,h=r+t.chasa_hand_hold,e=h+t.chasa_hand_sink;
  return {k:b.t<=b.tell?0:b.t<=r?(b.t-b.tell)/t.chasa_hand_rise:b.t<=h?1:Math.max(0,1-(b.t-h)/t.chasa_hand_sink),end:e,live:b.t>b.tell&&b.t<=h};}
/* 넋의 손 하나: 바닥(x,y)에서 위로 top 까지 솟은 팔과 그 끝의 발 */
function ghostHand(c,x,y,top,kind,a,flip){
  if(a<=0)return;
  const F='rgba(226,236,243,',L='rgba(140,168,188,',C='rgba(252,253,255,';
  c.save();c.lineJoin='round';c.lineCap='round';
  const wy=top+9,bird=kind==='bird',hw=bird?1.4:kind==='weasel'?3.2:kind==='bear'?5.6:4.4;
  // 팔: 밑은 흐려지고 위로 갈수록 또렷하다
  const g=c.createLinearGradient(0,y,0,wy);g.addColorStop(0,F+'0)');g.addColorStop(1,F+(0.6*a).toFixed(3)+')');
  c.fillStyle=g;c.beginPath();c.moveTo(x-hw-2,y);
  for(let i=0;i<=6;i++){const u=i/6,yy=y+(wy-y)*u,sw=still()?0:Math.sin(B.time*0.15+u*5)*1.2;c.lineTo(x-hw-2*(1-u)+sw,yy);}
  for(let i=6;i>=0;i--){const u=i/6,yy=y+(wy-y)*u,sw=still()?0:Math.sin(B.time*0.15+u*5+1)*1.2;c.lineTo(x+hw+2*(1-u)+sw,yy);}
  c.closePath();c.fill();
  c.strokeStyle=L+(0.55*a).toFixed(3)+')';c.lineWidth=1;c.beginPath();c.moveTo(x-hw,wy+4);c.lineTo(x-hw-1,y-2);c.moveTo(x+hw,wy+4);c.lineTo(x+hw+1,y-2);c.stroke();
  if(bird){c.strokeStyle=L+(0.6*a).toFixed(3)+')';c.beginPath();for(let i=0;i<4;i++){const yy=wy+3+i*((y-wy-6)/4);c.moveTo(x-2,yy);c.lineTo(x+2,yy-1);}c.stroke();}   // 비늘진 다리
  const fill=F+(0.82*a).toFixed(3)+')',line=L+(0.9*a).toFixed(3)+')',claw=C+Math.min(1,a+0.1).toFixed(3)+')';
  const ell=(cx,cy,rx,ry,r=0)=>{c.beginPath();c.ellipse(cx,cy,rx,ry,r,0,Math.PI*2);c.fillStyle=fill;c.fill();c.strokeStyle=line;c.lineWidth=1;c.stroke();};
  const hook=(x0,y0,len,ang,w,bend=0.35)=>{c.strokeStyle=claw;c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);
    c.quadraticCurveTo(x0+Math.cos(ang)*len*0.6,y0+Math.sin(ang)*len*0.6,x0+Math.cos(ang+bend*flip)*len,y0+Math.sin(ang+bend*flip)*len);c.stroke();};
  const up=-Math.PI/2,py=top+5;
  c.translate(x,py);c.scale(1.4,1.4);c.translate(-x,-py);   // 발은 팔보다 크게, 누구 발인지 보이게
  if(kind==='bear'){   // 곰: 넓고 둥근 발바닥, 다섯 발가락 콩, 짧고 굵은 발톱, 털 뭉치
    ell(x,py+2,8.2,6.6);for(let i=0;i<5;i++){const q=up+(i-2)*0.44,tx=x+Math.cos(q)*9,ty=py+2+Math.sin(q)*8.4;ell(tx,ty,2.6,2.3);hook(tx+Math.cos(q)*2,ty+Math.sin(q)*2,3.4,q,1.6,0.2);}
    for(const s of [-1,1])for(let i=0;i<3;i++){c.strokeStyle=line;c.lineWidth=1;c.beginPath();c.moveTo(x+s*8,py+4+i*3);c.lineTo(x+s*10.5,py+3+i*3);c.stroke();}
  }else if(kind==='badger'){   // 오소리: 좁은 발바닥에 길게 휜 땅 파는 발톱 다섯
    ell(x,py+3,5.6,5);for(let i=0;i<5;i++){const q=up+(i-2)*0.32,tx=x+Math.cos(q)*5.4,ty=py+3+Math.sin(q)*5.4;hook(tx,ty,9.5,q,1.8,0.55);}
  }else if(kind==='rabbit'){   // 토끼: 길쭉한 발, 끝이 털 뭉치로 둥글고 발톱이 안 보인다
    ell(x,py+1,4.2,8.4);for(let i=0;i<4;i++)ell(x-3+i*2,py-7+Math.abs(i-1.5)*0.8,1.8,2.2);
    c.strokeStyle=line;c.lineWidth=0.8;c.beginPath();for(let i=0;i<5;i++){c.moveTo(x-3+i*1.5,py+6);c.lineTo(x-3.4+i*1.5,py-2);}c.stroke();
  }else if(kind==='weasel'){   // 족제비: 작은 발바닥에 가늘게 벌린 다섯 발가락과 작은 발톱
    ell(x,py+4,3.6,3.2);for(let i=0;i<5;i++){const q=up+(i-2)*0.55,ex=x+Math.cos(q)*7.5,ey=py+4+Math.sin(q)*7.5;
      c.strokeStyle=line;c.lineWidth=1.6;c.beginPath();c.moveTo(x+Math.cos(q)*2.5,py+4+Math.sin(q)*2.5);c.lineTo(ex,ey);c.stroke();hook(ex,ey,2.2,q,1,0.4);}
  }else if(kind==='otter'){   // 수달: 다섯 발가락 사이를 물갈퀴가 잇는다
    const tips=[];for(let i=0;i<5;i++){const q=up+(i-2)*0.4;tips.push([x+Math.cos(q)*9.5,py+3+Math.sin(q)*9]);}
    c.beginPath();c.moveTo(x-6,py+4);tips.forEach(([tx,ty],i)=>{if(i){const [px2,py2]=tips[i-1];c.quadraticCurveTo((px2+tx)/2,(py2+ty)/2+3.2,tx,ty);}else c.lineTo(tx,ty);});c.lineTo(x+6,py+4);c.closePath();
    c.fillStyle=F+(0.45*a).toFixed(3)+')';c.fill();c.strokeStyle=line;c.lineWidth=0.8;c.stroke();   // 물갈퀴
    ell(x,py+4,5.4,4.4);for(const [tx,ty] of tips){c.strokeStyle=line;c.lineWidth=2.2;c.beginPath();c.moveTo(x+(tx-x)*0.35,py+4+(ty-py-4)*0.35);c.lineTo(tx,ty);c.stroke();ell(tx,ty,1.5,1.5);}
  }else{   // 새: 세 갈래 앞발가락과 뒷발가락, 굽은 발톱
    for(const q of [up-0.6,up,up+0.6]){const ex=x+Math.cos(q)*11,ey=wy-2+Math.sin(q)*11;c.strokeStyle=line;c.lineWidth=2;c.beginPath();c.moveTo(x,wy-1);c.lineTo(ex,ey);c.stroke();
      c.strokeStyle=fill;c.lineWidth=1;c.beginPath();c.moveTo(x,wy-1);c.lineTo(ex,ey);c.stroke();hook(ex,ey,3,q,1.2,0.9);}
    c.strokeStyle=line;c.lineWidth=2;c.beginPath();c.moveTo(x,wy-1);c.lineTo(x+flip*3,wy+5);c.stroke();hook(x+flip*3,wy+5,2.4,Math.PI/2,1.1,0.9);
  }
  c.restore();
}
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
  chasaRope:{get dur(){const t=T();return t.chasa_rope_gap*(t.chasa_rope_count-1)+t.chasa_rope_tell+t.chasa_rope_lash+t.chasa_rope_hold+t.chasa_rope_back+2;},
    tick(t){for(const r of B.attackPlan.ropes)if(t===r.delay){B.bullets.push(ropeSpawn(r.dir));Sound.playSfx('chasa_write');}}},
  chasaCrows:{get dur(){const t=T();return t.chasa_crow_gap*(t.chasa_crow_waves-1)+t.chasa_crow_scout+Math.ceil((BOX.w+2*t.chasa_crow_margin+t.chasa_crow_body)/t.chasa_crow_speed)+4;},
    tick(t){const P=B.attackPlan;for(const p of P.passes)if(t===p.delay){B.bullets.push({k:'chasaFlock',P:p,t:0,cawed:false});ch().flap=30;}}},
  chasaRobe:{get dur(){return T().chasa_robe_frames;},
    // 결정 D-1323: 도포가 판을 다 감싼 뒤(chasa_robe_wrap_frames) 넋의 손이 솟는다. 손이 그칠 무렵 솔기가 생긴다(손이 다 가라앉으면 빛이 갈라진다)
    tick(t){const T_=T(),w0=T_.chasa_robe_wrap_frames;
      if(t===T_.chasa_robe_frames-50)B.bullets.push({k:'chasaSeam',ph:'wait',x:ch().seamX,y:0,t:0,lit:0,hits:0,flash:0});
      if(t<w0||t>=T_.chasa_robe_frames-50||(t-w0)%T_.chasa_hand_every)return;
      const i=(t-w0)/T_.chasa_hand_every;B.bullets.push(handSpawn(i%3===1));}},
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
    step(b){const S=ch();
      if(b.caught)return;   // 묶은 동안은 tickChasa 가 맡는다
      if(b.after){if(++b.after.t>22)b.dead=1;return;}
      b.t++;const t=T(),ph=ropePhase(b);if(b.t>ph.end){b.dead=1;return;}
      // 다가온다: 뻗는 동안 줄 끝이 손 쪽으로 조금 휜다
      if(b.t>ph.tl&&b.t<=ph.la){const r=ropeLocal(b,B.px,B.py);b.bend+=(clamp(r.d,-t.chasa_rope_seek,t.chasa_rope_seek)-b.bend)*0.25;}
      if(ph.tip>4&&!S.bind&&B.st!=='end'){const r=ropeLocal(b,B.px,B.py);
        if(r.s>=0&&r.s<=ph.tip&&Math.abs(r.d-ropeOff(b,r.s))<t.chasa_rope_hit)ropeBind(b);}},
    draw(c,b){const S=ch(),t=T();
      if(b.caught){const bd=S.bind;if(!bd||bd.b!==b)return;drawBound(c,b,bd);return;}
      if(b.after){const a=b.after,k=a.t/22;
        const back=[];for(let i=0;i<=10;i++){const u=i/10*(1-k);back.push([b.ox+(a.sx-b.ox)*u,b.oy+(a.sy-b.oy)*u]);}
        if(a.how==='cut'){ropeStroke(c,back,4.4,0.92*(1-k*0.3));fray(c,back[back.length-1][0],back[back.length-1][1],Math.atan2(a.sy-b.oy,a.sx-b.ox),5,6,0.9,b.seed);
          ropeStroke(c,[[a.sx,a.sy+k*22],[a.px+2,a.py+2+k*24]],3.4,1-k);   // 손에 남은 토막이 떨어진다
          c.save();c.strokeStyle=SCROLL;c.globalAlpha=0.8*(1-k);c.lineWidth=2;c.beginPath();c.ellipse(a.px,a.py+3+k*24,9+k*6,4,0,0,Math.PI*2);c.stroke();c.restore();}
        else{const tail=[];for(let i=0;i<=10;i++){const u=i/10*(1-k);tail.push([b.ox+(a.px-b.ox)*u,b.oy+(a.py-b.oy)*u]);}ropeStroke(c,tail,4.4,0.92);}
        return;}
      const ph=ropePhase(b);
      if(ph.tell){   // 전조: 판 가장자리에서 줄 끝이 비죽 나와 뱀 머리처럼 고개를 들고 떤다
        const e=b.t/ph.tl,peek=14+18*e,tr=still()?0:Math.sin(b.t*1.3)*2.2,pts=[];
        for(let i=0;i<=6;i++){const s=peek*i/6,[x,y]=[b.ox+b.dx*s,b.oy+b.dy*s],w=Math.sin(i/6*Math.PI*1.5)*tr;pts.push([x-b.dy*w,y+b.dx*w]);}
        const [x,y]=pts[pts.length-1],edge=pts[2];
        blob(c,edge[0],edge[1],9+4*e,9+4*e,SCROLL,0.12+0.14*e);   // 줄이 나오는 자리에 붉은 기운
        ropeStroke(c,pts,5.2,0.6+0.4*e);fray(c,x,y,Math.atan2(b.dy,b.dx),6,6+4*e,0.95,b.seed);
        blob(c,x,y,3.6,3.6,SCROLL_DK,0.9);return;}
      const pts=[];for(let i=0;i<=20;i++)pts.push(ropePt(b,ph.tip*i/20));
      ropeStroke(c,pts,4.6,0.94);const [x,y]=pts[pts.length-1];
      blob(c,x,y,3.6,3.6,SCROLL_DK,0.9);fray(c,x,y,Math.atan2(b.dy,b.dx),4,5,0.85,b.seed);}},   // 줄 끝 매듭과 올
  chasaFlock:{
    step(b){b.t++;const t=T(),P=b.P,L=passLen(P),head=flockHead(b),body=t.chasa_crow_body;
      if(head-body>L+20){b.dead=1;return;}
      if(head>0&&!b.cawed){b.cawed=true;Sound.playSfx('crow_caw');}
      if(head<=0)return;
      const u=passU(P,B.px,B.py);if(u>head||u<head-body)return;
      const s=(head-u)/body,[cx,cy]=passPt(P,u),[nx2,ny2]=passPt(P,u+3),ax=nx2-cx,ay=ny2-cy,al=Math.hypot(ax,ay)||1;
      const perp=Math.abs((B.px-cx)*(-ay/al)+(B.py-cy)*(ax/al));
      if(perp<bandHalf(s,P)-1.5)crowHit();},
    draw(c,b){const t=T(),P=b.P,L=passLen(P),head=flockHead(b),body=t.chasa_crow_body,scoutU=(b.t)*t.chasa_crow_speed*2.6;
      // 깃 자국: 정찰 까마귀가 지나간 길. 떼의 꼬리가 지나가면 사라진다
      const tailU=head-body,trailEnd=Math.min(L,scoutU),fadeT=clamp(1-(tailU-L*0.6)/(L*0.5),0,1);
      if(fadeT>0){c.save();c.fillStyle=INK;c.globalAlpha=0.32*fadeT;c.beginPath();
        for(let u=Math.max(0,tailU);u<trailEnd;u+=11){const [x,y]=passPt(P,u),[x2,y2]=passPt(P,u+2),a=Math.atan2(y2-y,x2-x)+0.6;
          c.moveTo(x+Math.cos(a)*3,y+Math.sin(a)*3);c.lineTo(x-Math.cos(a)*3+Math.cos(a+1.57),y-Math.sin(a)*3+Math.sin(a+1.57));c.lineTo(x-Math.cos(a)*3,y-Math.sin(a)*3);}
        c.fill();c.restore();}
      if(scoutU<L+60&&head<L*0.5){c.save();c.fillStyle=INK;c.globalAlpha=0.6;c.beginPath();
        for(let i=0;i<5;i++){const u=scoutU-i*13-hash(i)*6;if(u<-10||u>L+10)continue;const [x,y]=passPt(P,u),[x2,y2]=passPt(P,u+2);
          crowShape(c,x+(hash(i*2.2)-0.5)*10,y+(hash(i*4.1)-0.5)*10,Math.atan2(y2-y,x2-x),0.75,still()?0.3:Math.sin(B.time*0.7+i*2));}
        c.fill();c.restore();}
      if(head<=0)return;
      // 떼: 머리 쪽이 굵고 꼬리로 갈수록 가늘다. 한 길에 모아 칠한다
      const n=still()?Math.round((P.n||t.chasa_crow_count)*0.6):(P.n||t.chasa_crow_count),mv=!still();
      c.save();c.fillStyle=INK;
      for(const pass of [0,1]){c.globalAlpha=pass?0.95:0.6;c.beginPath();
        for(let j=pass;j<n;j+=2){const r=hash(j*5.17+P.ph),s0=Math.pow((j+0.5)/n,1.15),s=mv?clamp(s0+0.03*Math.sin(B.time*0.11-s0*16+P.ph),0,1):s0,u=head-s*body;if(u<-14||u>L+14)continue;
          const [x,y]=passPt(P,u),[x2,y2]=passPt(P,u+3),a=Math.atan2(y2-y,x2-x),half=bandHalf(s,P);
          let o=hash(j*7.31+b.P.ph)*2-1;o=Math.sign(o)*Math.pow(Math.abs(o),0.8);
          if(mv)o=clamp(o+0.2*Math.sin(B.time*0.05*(0.6+r)+j*1.3),-1,1);   // 결정 D-1324: 떼 안에서 자리를 바꾼다
          if(mv&&r<0.08)o+=(o>=0?1:-1)*Math.pow(Math.max(0,Math.sin(B.time*0.03*(1+r*5)+j)),3)*0.35;   // 가장자리 몇 마리가 비어져 나왔다 돌아온다
          if(s<0.07&&o>0.12&&o<0.6)o=o<0.36?0.08:0.64;   // 머리 곁 눈 자리
          const jx=still()?0:Math.sin(B.time*0.09+j*1.9)*2.2,jy=still()?0:Math.cos(B.time*0.08+j*2.7)*2.2;
          crowShape(c,x-Math.sin(a)*o*half+jx,y+Math.cos(a)*o*half+jy,a+(hash(j*3.3)-0.5)*0.45,0.82+hash(j)*0.3,still()?0.3:Math.sin(B.time*0.55+j*1.3));}
        c.fill();}
      c.restore();
      const eu=head-0.04*body;if(eu>0&&eu<L){const [x,y]=passPt(P,eu),[x2,y2]=passPt(P,eu+3),a=Math.atan2(y2-y,x2-x),h=bandHalf(0.04,P)*0.34;
        blob(c,x-Math.sin(a)*h,y+Math.cos(a)*h,3.2,2,'#efe3c8',0.65);blob(c,x-Math.sin(a)*h+Math.cos(a),y+Math.cos(a)*h+Math.sin(a),1.2,1.2,INK,0.9);}}},   // 흐린 눈빛
  chasaHand:{
    step(b){b.t++;const t=T(),ph=handPhase(b);if(b.t>ph.end){b.dead=1;return;}
      if(!ph.live)return;const top=b.y-(b.h||t.chasa_hand_height)*ph.k;
      if((Math.abs(B.px-b.x)<t.chasa_hand_hit&&B.py>top-4&&B.py<b.y+6)||Math.hypot(B.px-b.x,B.py-b.y)<t.chasa_hand_hit+2)bHitMe();},
    draw(c,b){const t=T(),ph=handPhase(b),pulse=still()?0.5:(b.t%14)/14;
      if(b.t<=b.tell){const e=b.t/b.tell;   // 전조: 넋빛 물결이 동그랗게 인다
        c.save();c.strokeStyle='rgba(200,220,234,'+(0.35+0.5*e).toFixed(3)+')';c.lineWidth=1.4;
        for(let i=0;i<2;i++){const r=(pulse+i*0.5)%1;c.globalAlpha=1-r;c.beginPath();c.ellipse(b.x,b.y,5+r*12,2+r*4,0,0,Math.PI*2);c.stroke();}
        c.restore();blob(c,b.x,b.y,6*e+2,2.4*e+1,'#dfe9f0',0.35+0.4*e);
        handLabel(c,b,e>0.4?(e-0.4)*0.9:0);return;}
      const top=b.y-(b.h||t.chasa_hand_height)*ph.k;
      blob(c,b.x,b.y,9,3,'#dfe9f0',0.4*ph.k);
      ghostHand(c,b.x,b.y,top,b.kind,ph.k,b.flip);
      handLabel(c,b,0.75*ph.k);}},
  /* 결정 D-1323: 도포 솔기. 넋의 손이 다 가라앉으면(wait → lit) 솔기에 빛 한 줄이 갈라지고, 손 높이의 솔기 위에 금빛 칠 곳이 뜬다.
     chasa_robe_tear_hits 번 치면 찢긴다(torn, chasaStrike). chasa_robe_tear_frames 안에 못 찢으면 도포가 조인다(squeeze):
     손 둘레 빛이 좁아지다가 이름 하나를 감싸 쥐고 풀어 준다(이름이 없으면 한 칸 다친다). 그때는 빈틈이 열리지 않는다 */
  chasaSeam:{
    step(b){const t=T(),S=ch();if(b.flash>0)b.flash--;
      if(b.ph==='wait'){if(!B.bullets.some(q=>q.k==='chasaHand'&&!q.dead)){b.ph='lit';b.t=0;const q=bFitMark(b.x,clamp(B.py-14,BOX.y+20,BOX.y+BOX.h-16));b.x=q.x;b.y=q.y;
          B.msg='두 자락이 맞닿은 솔기에 빛 한 줄이 갈라진다.';Sound.playSfx('battle_soothe');}return;}
      b.t++;
      if(b.ph==='lit'){b.lit=Math.min(1,b.t/18);if(b.t>=t.chasa_robe_tear_frames){b.ph='squeeze';b.t=0;S.robeFail=true;B.msg='빛이 닫힌다. 도포가 조여 온다.';Sound.playSfx('chasa_write');}return;}
      if(b.ph==='squeeze'){S.squeeze=Math.min(1,b.t/t.chasa_robe_squeeze_frames);b.lit=Math.max(0,b.lit-0.08);if(!still())B.quakeT=Math.max(B.quakeT||0,3);
        if(b.t>=t.chasa_robe_squeeze_frames){S.squeeze=0;S.robeOut=true;b.dead=1;const n=nameBindTarget();
          if(n){B.msg='도포가 이름 하나를 감싸 쥐고 풀린다.';nameTake(n,B.px,B.py-20);}else{B.inv=0;bHitMe();if(B.st!=='end')B.msg='도포가 조이다 풀렸다.';}}
        return;}
      if(b.ph==='torn'&&b.t>26)b.dead=1;},
    draw(c,b){if(b.ph==='wait')return;const Y0=BOX.y,H=BOX.h,lit=b.ph==='torn'?1:b.lit,open=b.ph==='torn'?Math.min(1,b.t/14):b.hits*0.25;
      // 판 안을 가로지르는 빛의 틈. 칠수록, 찢기면 넓게 벌어진다
      const half=1.5+open*16+(b.ph==='torn'?b.t*3:0),a=b.ph==='torn'?Math.max(0,1-b.t/26):lit;
      const g=c.createLinearGradient(b.x-half-10,0,b.x+half+10,0);g.addColorStop(0,'rgba(255,244,207,0)');g.addColorStop(0.5,'rgba(255,244,207,'+(0.85*a).toFixed(3)+')');g.addColorStop(1,'rgba(255,244,207,0)');
      c.save();c.fillStyle=g;c.fillRect(b.x-half-10,Y0,half*2+20,H);c.strokeStyle='rgba(255,250,232,'+(0.9*a).toFixed(3)+')';c.lineWidth=1.4+open*2;c.beginPath();
      for(let y=Y0;y<=Y0+H;y+=7)c.lineTo(b.x+(hash(y*0.37)-0.5)*3,y);c.stroke();c.restore();
      if(b.ph!=='lit')return;
      const life=1-b.t/T().chasa_robe_tear_frames,near=Math.hypot(bAim().x-b.x,bAim().y-b.y)<=battleHandProfile().radius+T().chasa_rope_spot_slack+4,p=0.5+0.5*Math.sin(B.time*0.3);
      c.save();const gg=c.createRadialGradient(b.x,b.y,1,b.x,b.y,17);gg.addColorStop(0,GOLD_LT+(near?0.75:0.4+0.15*p)+')');gg.addColorStop(1,GOLD_LT+'0)');c.fillStyle=gg;c.beginPath();c.arc(b.x,b.y,17,0,Math.PI*2);c.fill();
      c.strokeStyle=GOLD;c.lineWidth=near?2.8:2;c.beginPath();c.arc(b.x,b.y,11,-Math.PI/2,-Math.PI/2+Math.PI*2*life);c.stroke();
      if(b.flash>0){c.strokeStyle='#fff4cf';c.globalAlpha=b.flash/12;c.lineWidth=2.4;c.beginPath();c.arc(b.x,b.y,10+(12-b.flash)*1.4,0,Math.PI*2);c.stroke();}
      c.restore();}},
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
/* 묶인 줄: 판 밖에서 칠 곳을 지나 손목을 두 번 감는다. 칠 곳은 금빛, 칠수록 그 자리가 끊어져 간다.
   손 위에는 끌려갈 이름패가 떨고, 시간이 갈수록 붉은 붓 획이 줄을 타고 적패지 쪽으로 번진다 */
function drawBound(c,b,bd){
  const t=T(),k=bd.t/t.chasa_rope_bind_frames,tr=still()?0:Math.sin(bd.t*0.9)*1.2,sx=bd.sx,sy=bd.sy;
  const a=[];for(let i=0;i<=12;i++){const u=i/12,w=Math.sin(u*Math.PI)*tr*3;a.push([b.ox+(sx-b.ox)*u-b.dy*w,b.oy+(sy-b.oy)*u+b.dx*w]);}
  ropeStroke(c,a,4.6,0.95);
  // 붉은 붓 획: 손에서 판 밖 쪽으로 차오른다 (이름을 적어 가는 중)
  if(bd.name){const n=Math.floor(12*k);c.save();c.strokeStyle=SCROLL_DK;c.lineWidth=2;c.globalAlpha=0.85;c.beginPath();
    for(let i=12;i>=12-n;i--){const [x,y]=a[i];i===12?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();c.restore();}
}
/* 묶인 손 위로: 손목을 감은 두 바퀴, 칠 곳에서 손목까지의 줄, 칠 곳과 끊긴 단계, 끌려갈 이름패 (손 그림 위에 그린다) */
function drawBoundOver(c,bd){
  const t=T(),k=bd.t/t.chasa_rope_bind_frames,tr=still()?0:Math.sin(bd.t*0.9)*1.2,sx=bd.sx,sy=bd.sy,h=bd.hits;
  // 칠 곳에서 손목까지: 칠수록 그 자리가 가늘어지고 벌어진다
  const gap=h>=2?5:h?2.5:0,dx=B.px-sx,dy=B.py+8-sy,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
  ropeStroke(c,[[sx+ux*gap,sy+uy*gap],[(sx+B.px)/2+tr,(sy+B.py+8)/2],[B.px+2,B.py+8]],h>=2?2.4:h?3.6:4.6,0.95);
  c.save();c.strokeStyle=SCROLL;c.lineWidth=2.8;c.globalAlpha=0.95;for(let i=0;i<2;i++){c.beginPath();c.ellipse(B.px+1,B.py+8+i*4.5,9.5,3.4,0.15,0,Math.PI*2);c.stroke();}
  c.strokeStyle='#e8b0a0';c.lineWidth=0.8;c.globalAlpha=0.7;c.beginPath();c.ellipse(B.px+1,B.py+8,9.5,3.4,0.15,0.2,1.4);c.stroke();c.restore();   // 손목을 감은 두 바퀴
  // 칠 곳(금빛): 둘레 호는 이름이 끌려가기까지 남은 시간
  const near=Math.hypot(bAim().x-sx,bAim().y-sy)<=battleHandProfile().radius+t.chasa_rope_spot_slack,pulse=0.5+0.5*Math.sin(B.time*0.3);
  c.save();const g=c.createRadialGradient(sx,sy,1,sx,sy,16);g.addColorStop(0,GOLD_LT+(near?0.7:0.35+0.15*pulse)+')');g.addColorStop(1,GOLD_LT+'0)');c.fillStyle=g;c.beginPath();c.arc(sx,sy,16,0,Math.PI*2);c.fill();
  c.strokeStyle=GOLD;c.lineWidth=near?2.8:2;c.beginPath();c.arc(sx,sy,11,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-k));c.stroke();c.restore();
  // 끊긴 단계: 하나 올이 튄다 · 둘 반쯤 끊겨 벌어진다
  if(h>=1){fray(c,sx,sy,Math.atan2(-uy,-ux)+1.2,4+h*3,5+h*2.5,0.95,h);fray(c,sx,sy,Math.atan2(-uy,-ux)-1.2,3+h*3,5+h*2.5,0.9,h+5);
    fray(c,sx+ux*gap,sy+uy*gap,Math.atan2(uy,ux)+Math.PI,3+h,4+h*2,0.9,h+9);}
  if(bd.flash>0){c.save();c.strokeStyle='#fff4cf';c.globalAlpha=bd.flash/12;c.lineWidth=2.4;c.beginPath();c.arc(sx,sy,10+(12-bd.flash)*1.4,0,Math.PI*2);c.stroke();c.restore();}
  // 끌려갈 이름패: 손 아래에서 떨고, 붉은 먹이 번져 간다
  if(bd.name){const tt=still()?0:Math.sin(bd.t*1.1)*(1+k*2),y=Math.min(B.py+30,BOX.y+BOX.h+14);
    drawNameTag(c,B.px+tt,y,bd.name.text,k>0.5,0.95);
    c.save();c.font='bold 12px "Gowun Batang", "Batang", serif';const w=c.measureText(bd.name.text).width+12;
    c.globalAlpha=0.2+0.35*k;c.fillStyle=SCROLL;c.fillRect(B.px+tt-w/2,y-9,w*k,18);c.restore();}
}

/* 공격 고르기: 발악 → 삼혼 부르기 → 남은 부위 가운데 바로 앞과 다른 것 */
function pickChasa(){
  const S=ch(),t=T(),core=part('core'),first=!B.last;S.turn++;
  const living=B.parts.filter(p=>!p.core&&!p.broken);
  // 결정 D-1142·D-1273: 발악은 핵이 드러난 뒤 한 번. 핵을 한 번 쳤거나 남은 몫이 바닥 가까우면 온다(마지막 부름을 거치지 않고 끝나지 않게)
  if(!S.despDone&&S.revealed&&(core.hp<core.max||gangLeft()<=t.name_final_hp_ratio)){
    S.despDone=true;B.cur=LEDGER;B.last=LEDGER;B.st='tell';B.t=t.chasa_ledger_tell;B.msg=LEDGER.tell;B.hitThis=false;B.attackPlan=null;Sound.playSfx('chasa_call');return;}
  const f=t.gangcheol_namecall_first,e=t.gangcheol_namecall_every;
  if(S.turn===f||(S.turn>f&&(S.turn-f)%e===0)||!living.length){nameCallBegin(core);return;}
  const o=living.filter(q=>q!==B.last),pool=o.length?o:living,p=pool[Math.floor(Math.random()*pool.length)];
  B.cur=p;B.last=p;B.st='tell';B.t=first?72:p.id==='tail'?62:50;B.msg=p.tell;B.hitThis=false;
  // 결정 D-1323: 도포마다 솔기 자리를 새로 정한다
  if(p.id==='tail'){S.robeOut=false;S.robeFail=false;S.squeeze=0;S.seamX=BOX.x+BOX.w*(0.3+Math.random()*0.4);}
  B.attackPlan=p.id==='mouth'?ropePlan():p.id==='body'?crowPlan():{kind:'robe'};
}
/* 부위 셋의 남은 몫 */
function chasaPartsLeft(){let h=0,m=0;for(const p of B.parts)if(!p.core){h+=Math.max(0,p.hp);m+=p.max;}return m?h/m:1;}
function coreMark(life,seal){const z=bMarkZone(),q=bFitMark(BOX.x+BOX.w/2,z.y1+6);return {x:q.x,y:q.y,t:life,max:life,part:part('core'),core:true,seal:!!seal};}
function floorSpot(){const aim=bAim(),z=bMarkZone();let x,y,n=0;
  do{x=z.x1+Math.random()*(z.x2-z.x1);y=z.y1+8+Math.random()*Math.max(0,z.y2-z.y1-8);n++;}while(Math.hypot(x-aim.x,y-aim.y)<70&&n<14);return {x,y};}
/* 빈틈 자리. 결정 D-1271·D-1273:
   - 발악 뒤에는 마지막 부름. 그 부름을 참았으면 핵을 묶은 낙관 매듭(오래 남고 더 깎는다).
   - 핵이 드러났으면 핵(갓 아래 새잎 빛)이 판 위쪽 가운데로 드리운다.
   - 아니면 바닥에서 이름 하나가 떠오른다. 그 패턴을 낸 부위가 깎인다(갓의 차례 뒤에는 적패지, 찢겼으면 남은 부위) */
function chasaOpen(p){
  const S=ch(),N=B.names,core=part('core'),t=T();
  if(p===LEDGER){B.mark=null;nameCallBegin(core,true);return true;}
  if(core.broken){B.mark=null;return true;}
  // 결정 D-1323: 도포가 조여 이름을 가져갔으면 이번엔 빈틈이 없다
  if(p.id==='tail'&&S.robeFail){S.robeFail=false;B.mark=null;B.msg='(…도포 속에서 겨우 풀려났다.)';return true;}
  // 결정 D-1322: 텅 빈 손이면 먹힌 내 별명이 손 바로 곁 바닥에서 떠오른다 (핵이 드러났어도)
  if(nameHollow()&&N&&N.eaten.length){
    const target=!p.core&&!p.broken&&p!==LEDGER?p:B.parts.find(q=>!q.core&&!q.broken)||core,f=nextFloorName(),a=bAim(),ang=Math.random()*Math.PI*2,d=t.name_hollow_near;
    const q=bFitMark(a.x+Math.cos(ang)*d,a.y+Math.sin(ang)*d);
    B.mark={x:q.x,y:q.y,t:t.chasa_floor_life,max:t.chasa_floor_life,part:target,floor:f};B.msg='손 바로 곁 바닥에서 낯익은 이름이 떠오른다.';return true;}
  if(N&&N.finalDone&&N.bigOpen&&!S.seal&&!coreHidden()){S.seal=true;B.mark=coreMark(t.chasa_seal_life,true);B.msg='새잎 빛을 묶은 낙관 매듭에 빈틈.';return true;}
  if(!coreHidden()){B.mark=coreMark(t.chasa_core_life,false);B.msg='갓 아래 새잎 빛이 드리운다.';return true;}
  const target=p.core||p.broken?(!part('mouth').broken?part('mouth'):B.parts.find(q=>!q.core&&!q.broken)):p;
  if(!target){B.mark=null;return true;}
  const f=nextFloorName(),pos=floorSpot();
  B.mark={x:pos.x,y:pos.y,t:t.chasa_floor_life,max:t.chasa_floor_life,part:target,floor:f};
  B.msg=f.old?'닳아 읽히지 않는 이름 하나가 바닥에 떠오른다.':f.kid?'바닥에서 낯익은 이름이 떠오른다.':'바닥에 이름 하나가 떠오른다.';
  return true;
}
/* 친 뒤: 바닥 이름은 임자에게 날아가고, 낙관 매듭은 더 깎는다 */
function chasaHit(p,m){
  if(m.floor)freeFloorName(m.floor,m.x,m.y);
  if(m.core&&!m.seal&&!p.broken)bLater('새잎 빛을 쳤다. 갓이 크게 흔들린다.',24);
  if(!m.seal||p.broken)return;
  p.hp=Math.max(0,p.hp-T().chasa_seal_bonus);B.msg='낙관 매듭을 쳤다! 갓이 크게 흔들린다.';renderBHud();
  if(p.hp<=0)breakPart(p);
}
/* 이 전투에서 짚신을 건넸나 (마지막 선물이면 tickChasa 가 아직 못 봤다) */
function gotShoes(){return !!(B&&((B.ch&&B.ch.shoes)||B.lastGift==='jipsin'));}
function tickChasa(){const S=ch(),t=T();if(S.flap>0)S.flap--;if(B.lastGift==='jipsin')S.shoes=true;
  for(const v of S.voices)v.t++;S.voices=S.voices.filter(v=>v.t<v.max);
  // 도포가 펼쳐지는 동안 어둠이 내려앉고, 까마귀 떼는 하늘로 솟는다. 끝나면 천천히 거둔다
  const on=['tell','atk','settle'].includes(B.st),robeGoal=on&&B.cur&&B.cur.id==='tail'&&!B.cur.broken&&!S.robeOut?1:0,flockGoal=on&&B.cur&&B.cur.id==='body'&&!B.cur.broken?1:0;
  S.robe+=(robeGoal-S.robe)*(robeGoal?0.05:0.04);
  // 결정 D-1323: 공격이 시작되면 자락이 chasa_robe_wrap_frames 동안 판을 덮어 닫힌다. 찢으면 빠르게, 풀려나면 천천히 걷힌다
  const wrapOn=robeGoal&&(B.st==='atk'||B.st==='settle');
  S.wrap=clamp(S.wrap+(wrapOn?1/t.chasa_robe_wrap_frames:-(S.tornT>0?0.09:0.035)),0,1);if(S.tornT>0)S.tornT--;
  if(!wrapOn&&S.squeeze>0&&!B.bullets.some(q=>q.k==='chasaSeam'))S.squeeze=0;
  S.night=Math.max(S.robe,S.wrap);
  S.flock+=(flockGoal-S.flock)*(flockGoal?0.035:0.03);
  if(S.dark>0)S.dark=Math.max(0,S.dark-0.004);
  // 묶임: 손은 묶인 자리 둘레만 느리게 움직인다. 오래 못 끊으면 이름을 묶어 간다
  const bd=S.bind;
  if(bd){bd.t++;if(bd.flash>0)bd.flash--;B.slowT=2;B.slowK=t.chasa_rope_bound_slow;
    const dx=B.px-bd.px,dy=B.py-bd.py,d=Math.hypot(dx,dy),R=t.chasa_rope_tether;if(d>R){B.px=bd.px+dx/d*R;B.py=bd.py+dy/d*R;}
    if(bd.t>=t.chasa_rope_bind_frames)ropeRelease('take');}
  // 결정 D-1273: 부위 셋의 몫을 깎으면 핵이 드러난다
  if(!S.revealed&&chasaPartsLeft()<=t.chasa_core_reveal){S.revealed=true;learn('core:'+B.kind);
    bLater(B.E.coreShown,T_LATER);bLater('(새잎 빛… 맨 먼저 먹혔다던 신목 이름일까.)',T_LATER*2);}
  for(const q of S.flights){q.t++;if(q.t===q.max&&q.to==='tree')S.strips++;}S.flights=S.flights.filter(q=>q.t<=q.max);
}
/* 판 바닥: 도포 속 어둠과 손 둘레 빛 */
function drawChasaFloor(c){
  const S=ch(),X=BOX.x,Y=BOX.y,W=BOX.w,H=BOX.h;
  if(S.night>0.01){c.save();c.fillStyle=NIGHT;c.globalAlpha=Math.max(0.84*S.night,T().chasa_robe_inside_dark*S.wrap);c.fillRect(X,Y,W,H);c.restore();
    // 먹힌 이름들이 바닥 어둠 속에서 떴다 사라진다
    c.save();c.font='10px "Gowun Batang", "Batang", serif';c.textAlign='center';c.fillStyle='#b9c6cf';
    // 칸 여섯(가로 셋 × 세로 둘)에 하나씩만 띄워 서로 겹치지 않고, 넋의 손이 있는 자리 곁은 비운다
    for(let i=0;i<6;i++){const fl=still()?0.3:Math.pow(Math.max(0,Math.sin(B.time*0.035+i*1.9)),4);if(fl<0.02)continue;
      const x=X+W*(i%3+0.5)/3+(hash(i*4.7)-0.5)*W*0.12,y=Y+H*(Math.floor(i/3)+0.5)/2+(hash(i*2.3)-0.5)*H*0.16;
      if(B.bullets.some(q=>q.k==='chasaHand'&&Math.abs(q.x-x)<50&&q.y-(q.h||34)-8<y+8&&q.y+18>y-8))continue;
      c.globalAlpha=fl*0.4*S.night;c.fillText(LEDGER_NAMES[(i+Math.floor(B.time/120)*6)%LEDGER_NAMES.length].text,x,y);}
    c.restore();
    const fire=has('dokkaebibul'),R=(fire?34:24)*(1-0.65*S.squeeze),g=c.createRadialGradient(B.px,B.py,2,B.px,B.py,R);   // 결정 D-1323: 도포가 조이면 손 둘레 빛이 좁아진다
    g.addColorStop(0,(fire?'rgba(122,184,232,':'rgba(239,227,200,')+(0.45*S.night).toFixed(3)+')');g.addColorStop(1,'rgba(239,227,200,0)');
    c.save();c.fillStyle=g;c.beginPath();c.arc(B.px,B.py,R,0,Math.PI*2);c.fill();c.restore();
    // 결정 D-1323: 도포가 조이면 먹빛 주름 자락이 사방에서 손 쪽으로 오므라든다
    if(S.squeeze>0){const sq=S.squeeze,r0=150-110*sq;for(let i=0;i<10;i++){const a=i/10*Math.PI*2+(still()?0:B.time*0.01),x=B.px+Math.cos(a)*r0,y=B.py+Math.sin(a)*r0*0.75;
      brush(c,[[x+Math.cos(a)*60,y+Math.sin(a)*45],[x+Math.cos(a+0.25)*24,y+Math.sin(a+0.25)*18],[x,y]],10+sq*8,'#050302',0.75*sq);}}
    if(fire&&!still()){const y=B.py+10;for(let i=0;i<3;i++)blob(c,B.px+(i-1)*5,y-((B.time+i*9)%14),2.4,3.2,FIRE,0.6*S.night);}}   // 품 안의 도깨비불씨
}
/* 결정 D-1271: 바닥 이름과 핵을 그린다 (battle.js drawMark). 칠 수 있는 것이라 금빛이다 */
function drawChasaMark(c,m){
  if(m.floor)return drawFloorName(c,m),true;
  if(m.core)return drawCoreMark(c,m),true;
  return false;
}
function drawFloorName(c,m){
  const life=m.t/m.max,e=clamp((m.max-m.t)/16,0,1),near=bAimOn(m),f=m.floor,dim=Math.min(1,m.t/20);
  blob(c,m.x,m.y+8,20*e,5.5*e,SCROLL,0.5*dim);blob(c,m.x,m.y+8,12*e,3*e,SCROLL_DK,0.5*dim);   // 붉은 먹 웅덩이에서 떠오른다
  const g=c.createRadialGradient(m.x,m.y,2,m.x,m.y,26);g.addColorStop(0,GOLD_LT+((near?0.55:0.3)*dim).toFixed(3)+')');g.addColorStop(1,GOLD_LT+'0)');
  c.save();c.fillStyle=g;c.beginPath();c.arc(m.x,m.y,26,0,Math.PI*2);c.fill();
  c.strokeStyle=GOLD;c.globalAlpha=0.8*dim;c.lineWidth=near?2.4:1.5;c.beginPath();c.arc(m.x,m.y,19,-Math.PI/2,-Math.PI/2+Math.PI*2*life);c.stroke();c.restore();
  // 글자는 웅덩이에서 한 자씩 솟아 위아래로 천천히 일렁인다. 닳은 이름은 읽히지 않는 붓 자국
  c.save();c.textAlign='left';c.textBaseline='middle';c.font='bold 16px "Gowun Batang", "Batang", serif';c.lineJoin='round';
  const chars=f.old?['ㅡ','ㅡ','ㅡ']:[...f.text],ws=chars.map(s=>c.measureText(s).width),total=ws.reduce((a,b)=>a+b,0);let x=m.x-total/2;
  chars.forEach((s,i)=>{const y=m.y-4*e-(still()?0:Math.sin(B.time*0.08+i*1.3)*1.2)+(1-e)*6,al=dim*clamp(e*1.5-i*0.12,0,1);
    if(f.old)brush(c,[[x+1,y-1],[x+ws[i]*0.5,y+1],[x+ws[i]-1,y-1]],2.2,'#8a5e0c',al*0.8);
    else if(s!==' '){c.globalAlpha=al;c.lineWidth=3.4;c.strokeStyle=near?GOLD:'rgba(29,24,20,.75)';c.strokeText(s,x,y);c.fillStyle=near?'#fff4cf':'#e8b23a';c.fillText(s,x,y);}
    x+=ws[i];});
  c.restore();
}
function drawCoreMark(c,m){
  const life=m.t/m.max,near=bAimOn(m),p=0.6+0.4*Math.sin(B.time*0.12),dim=Math.min(1,m.t/20);
  const g=c.createRadialGradient(m.x,m.y,2,m.x,m.y,30);g.addColorStop(0,GOLD_LT+((near?0.75:0.45)*dim).toFixed(3)+')');g.addColorStop(1,GOLD_LT+'0)');
  c.save();c.fillStyle=g;c.beginPath();c.arc(m.x,m.y,30,0,Math.PI*2);c.fill();
  c.strokeStyle=GOLD;c.globalAlpha=dim;c.lineWidth=near?3:2;c.beginPath();c.arc(m.x,m.y,17,-Math.PI/2,-Math.PI/2+Math.PI*2*life);c.stroke();c.restore();
  leafBud(c,m.x,m.y+10,1.45,dim*(0.85+0.15*p));
  // 붉은 노끈이 새잎 밑동을 묶고 있다. 낙관 매듭은 붉은 네모 도장
  c.save();c.strokeStyle=SCROLL;c.lineWidth=1.6;c.globalAlpha=dim*(m.seal?0.55:0.9);c.beginPath();c.ellipse(m.x,m.y+6,7,2.4,0.3,0,Math.PI*2);c.stroke();c.beginPath();c.ellipse(m.x,m.y+5,7,2.4,-0.3,0,Math.PI*2);c.stroke();
  c.beginPath();c.moveTo(m.x+5,m.y+7);c.quadraticCurveTo(m.x+9,m.y+12,m.x+7,m.y+16);c.stroke();c.restore();   // 매듭에서 늘어진 끈
  if(m.seal){c.save();c.translate(m.x+11,m.y+8);c.rotate(0.15);c.globalAlpha=dim;c.fillStyle=SCROLL;c.fillRect(-4.5,-4.5,9,9);c.strokeStyle='#f4e3d0';c.lineWidth=0.9;c.strokeRect(-2.8,-2.8,5.6,5.6);c.restore();}
  if(near){c.save();c.strokeStyle='#fffaf0';c.lineWidth=1.6;c.globalAlpha=dim;c.beginPath();c.arc(m.x,m.y,12,0,Math.PI*2);c.stroke();c.restore();}
}
/* 상자 밖까지: 먹은 목소리들(발악), 날아가는 이름, 핵을 갓에 잇는 어둠 줄 */
function drawChasaOver(c){
  const S=ch();
  for(const v of S.voices){const a=Math.min(1,v.t/12,(v.max-v.t)/20),pic=namePortrait(v.by);
    if(pic){c.save();c.globalAlpha=a*0.3;c.imageSmoothingEnabled=false;c.drawImage(pic,v.x-70,v.y-18,40,32);c.restore();}
    c.save();c.globalAlpha=a*0.8;c.font='14px "Gowun Batang", "Batang", serif';c.textAlign='left';c.textBaseline='middle';
    c.lineJoin='round';c.lineWidth=4;c.strokeStyle='rgba(255,250,240,.85)';c.strokeText(v.text,v.x-26,v.y);c.fillStyle='#5a3a34';c.fillText(v.text,v.x-26,v.y);c.restore();}
  const m=B.mark;
  if(m&&m.core){const s=toScreen(LW/2,EY-40),pts=[];for(let i=0;i<=10;i++){const u=i/10,w=still()?0:Math.sin(u*9+B.time*0.08)*3*(1-u);pts.push([s.x+(m.x-s.x)*u+w,s.y+(m.y-6-s.y)*u]);}
    brush(c,pts,2.2,INK,0.55);}
  if(S.bind)drawBoundOver(c,S.bind);
  // 결정 D-1323: 갇힌 동안 판 테두리가 어둠 속에 희미하게 비친다. 솔기를 찢는 순간 빛이 쏟아진다
  if(S.wrap>0.5){c.save();c.strokeStyle='rgba(200,210,220,'+(0.2*(S.wrap-0.5)*2).toFixed(3)+')';c.setLineDash([4,6]);c.lineWidth=1;c.strokeRect(BOX.x+0.5,BOX.y+0.5,BOX.w-1,BOX.h-1);c.restore();}
  if(S.tornT>0){c.save();c.fillStyle='#fff4cf';c.globalAlpha=0.55*S.tornT/30;c.fillRect(0,0,LW,LH);c.restore();}
  for(const q of S.flights){const e=q.t/q.max,to=flightTarget(q),mx=(q.x+to.x)/2,my=Math.min(q.y,to.y)-60,ee=e*e*(3-2*e);
    const x=(1-ee)*(1-ee)*q.x+2*(1-ee)*ee*mx+ee*ee*to.x,y=(1-ee)*(1-ee)*q.y+2*(1-ee)*ee*my+ee*ee*to.y,a=q.to==='sky'?1-e:Math.min(1,(1-e)*3);
    for(let i=0;i<3;i++)blob(c,x-(to.x-q.x)*0.02*i+(hash(i+q.t)-0.5)*6,y+(hash(i*2+q.t)-0.5)*6+i*2,1.4,1.4,'#f4de8c',a*0.6);
    c.save();c.globalAlpha=a;c.textAlign='center';c.textBaseline='middle';c.font='bold '+(15-4*e).toFixed(1)+'px "Gowun Batang", "Batang", serif';c.lineJoin='round';
    if(q.text){c.lineWidth=3;c.strokeStyle='rgba(29,24,20,.6)';c.strokeText(q.text,x,y);c.fillStyle='#f4de8c';c.fillText(q.text,x,y);}
    else{brush(c,[[x-6,y],[x+6,y+1]],2,'#c98a12',a);}
    c.restore();}
}

defineEnemies({
  gangcheol:{name:'어둑차사',calmLabel:'진정',
    // 결정 D-1140: 이름을 먹는 차사. 갓의 차례가 삼혼 부르기, 적패지에 이름이 적힌다 (engine/battle-names.js)
    names:{part:'core',body:'body',scroll:'mouth',mouth:scrollAt,cutAt:()=>({x:BOX.x+BOX.w*0.24,y:BOX.y+BOX.h*0.32})},
    // 결정 D-227: 전투 글귀는 일어난 일만 짧게. 피하라·치라는 안내는 쓰지 않는다
    intro:'언 호수 위에 갓 쓴 그림자가 서 있다. 붉은 천이 바람도 없이 나부낀다.',
    settle:true,markLife:150,
    pickAttack:pickChasa,openMark:chasaOpen,onMarkHit:chasaHit,tickHazards:tickChasa,drawFloor:drawChasaFloor,drawOver:drawChasaOver,
    strike:chasaStrike,drawMark:drawChasaMark,coreRevealed:()=>ch().revealed,msgColor:()=>ch().night>0.4?'#efe6d6':null,
    // 결정 D-370·D-1145: weak 는 부서진 뒤 한 줄
    parts:tableParts('gangcheol',{
      mouth:{atk:'chasaRope',tell:'붉은 적패지가 오랏줄처럼 풀려 나온다.',weak:'적패지가 찢겼다. 오랏줄이 사라지고, 붓 자국이 흐려진다.'},
      body:{atk:'chasaCrows',tell:'소매가 날개처럼 펼쳐진다. 깃 속에서 까마귀 떼가 쏟아진다.',weak:'소매가 뜯겼다. 까마귀 떼가 흩어져 더는 모이지 않는다.'},
      tail:{atk:'chasaRobe',tell:'어둑차사가 도포 자락을 양쪽으로 펼친다. 안은 텅 빈 어둠이다.',weak:'도포 자락이 찢겼다. 도포를 더는 펼치지 못한다.'},
      core:{tell:'갓 아래 어둠이 숨을 들이켠다.'}}),
    // 결정 D-1147: 달래기는 짚신·주먹밥(초상집 사잣밥)으로만 한다. 반응 글은 tastes.csv
    likes:TABLES.CALM.gangcheol,likeText:'갓 아래 어둠이 잠시 잠잠해진다.',
    coreHidden:'갓 아래 깊은 데는 아직 어둠뿐이다.',
    coreShown:'어둠이 엷어지며 갓 아래 깊은 데서 새잎 빛이 비친다.',
    // 짚신을 받았으면 신고 떠나고, 주먹밥만 받았으면 그 앞에 갓을 숙이고 떠난다
    get calmWin(){return gotShoes()?'어둑차사가 짚신을 신고 갓을 숙인다. 적패지를 내려놓고 북쪽 길로 걸어 사라진다. 풀린 붉은 천에서 이름들이 흩어진다.'
      :'어둑차사가 주먹밥 앞에 갓을 숙인다. 적패지를 내려놓고 북쪽 길로 걸어 사라진다. 풀린 붉은 천에서 이름들이 흩어진다.';},calmGift:'frost_whisker',
    win:'갓이 떨어진다. 그 아래는 텅 비어 있다. 새잎 빛이 섬 쪽으로 날아가고, 풀린 적패지에서 이름들이 흩어진다.',
    lose:'어둠에 휩쓸려 호숫가로 밀려났다.',
    backdrop:drawNightLake,draw:drawChasa},
});
})();
