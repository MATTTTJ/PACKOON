'use strict';
/* 단풍골 전투: 엉킨 칡(보스)과 무쇠의 시험(NPC 전투). 원본 표: design/data/bosses.csv · boss_parts.csv */
(()=>{
/* ---------- 엉킨 칡 ----------
   결정 D-157: 엉킨 칡은 당산나무 줄기를 감아 오른 뱀 같은 덩굴이다 (사용자 피드백 13, 2026-11-01).
   몸통 덩굴이 줄기를 두 바퀴 반 감고, 위로 쳐든 머리(두 눈) 정수리에 칡꽃송이가 선다. 부위는 셋:
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
/* 칡꽃송이: 꽃대 아래부터 나비 모양 꽃이 피고 위로 갈수록 봉오리. lean 은 꽃대 끝이 기우는 정도, len<0 이면 아래로 늘어진다 */
function kFlower(c,x,y,len,lean,petal,alpha=1){
  const A=[x,y],Bp=[x+lean*0.35,y-len*0.5],C=[x+lean,y-len];
  const at=k=>[(1-k)*(1-k)*A[0]+2*(1-k)*k*Bp[0]+k*k*C[0],(1-k)*(1-k)*A[1]+2*(1-k)*k*Bp[1]+k*k*C[1]];
  brush(c,[A,Bp,C],2.2,KSTEM,alpha);
  for(let i=0;i<11;i++){const k=0.06+i*0.09,[px,py]=at(k),s=Math.sign(len)*(i%2?1:-1),z=8.4*(1-k*0.55);
    if(k<0.66){
      blob(c,px+s*z*0.9,py+z*0.35,z*0.5,z*0.34,KPUR_DK,alpha);            // 용골·날개 꽃잎
      blob(c,px+s*z*0.55,py-z*0.1,z*0.78,z*0.66,petal,alpha);             // 기 꽃잎
      blob(c,px+s*z*0.5,py-z*0.12,z*0.22,z*0.2,'#efe3c8',alpha*0.7);      // 기 꽃잎 가운데의 옅은 무늬
    }else blob(c,px+s*z*0.3,py,z*0.36,z*0.58,KPUR_DK,alpha);              // 봉오리
  }
}
/* 덩이뿌리: 머리(-x)가 굵고 꼬리(+x)로 가늘어지는 길쭉한 뿌리. 울퉁불퉁한 겉, 세로 결, 꼬리 끝의 실뿌리 */
function kTuber(c,x,y,len,wid,rot,fill,line,alpha=1){
  c.save();c.translate(x,y);c.rotate(rot);c.globalAlpha=alpha;
  const n=14,top=[],bot=[];
  for(let i=0;i<=n;i++){const s=i/n,px=-len/2+s*len,w=wid*Math.pow(Math.sin(Math.PI*Math.min(1,s*0.85+0.08)),0.7)*(1.05-0.75*s)*(1+(hash(i*1.7+len)-0.5)*0.22);
    top.push([px,-w]);bot.push([px,w*(0.85+hash(i*2.9+wid)*0.2)]);}
  c.fillStyle=fill;c.beginPath();c.moveTo(top[0][0],top[0][1]);for(const p of top)c.lineTo(p[0],p[1]);
  for(let i=bot.length-1;i>=0;i--)c.lineTo(bot[i][0],bot[i][1]);c.closePath();c.fill();
  c.strokeStyle=line;c.lineWidth=1.8;c.lineJoin='round';c.stroke();
  c.strokeStyle='rgba(29,24,20,.35)';c.lineWidth=1;c.beginPath();
  for(let k=-1;k<=1;k++){c.moveTo(-len*0.38,k*wid*0.35);c.quadraticCurveTo(0,k*wid*0.42+1,len*0.3,k*wid*0.18);}
  c.stroke();
  // 꼬리 끝에서 이어지는 가는 뿌리와 실뿌리 두어 가닥
  brush(c,[[len/2-2,0],[len/2+10,3],[len/2+20,-1]],1.6,line,0.8);
  c.strokeStyle=line;c.globalAlpha=alpha*0.6;c.lineWidth=0.9;c.beginPath();
  c.moveTo(len*0.32,wid*0.3);c.quadraticCurveTo(len*0.38,wid+4,len*0.46,wid+8);c.moveTo(len*0.1,-wid*0.6);c.quadraticCurveTo(len*0.14,-wid-3,len*0.2,-wid-6);c.stroke();
  c.restore();
}
/* 머리: 납작한 뱀 머리 같은 덩굴 끝. 두 눈은 손을 본다. 가끔 덩굴손 혀를 날름 */
function kHead(c,hx,hy,col,closed){
  c.save();c.translate(hx,hy);c.rotate(0.38);
  c.fillStyle=col;c.beginPath();c.ellipse(0,0,21,13,0,0,Math.PI*2);c.fill();
  c.strokeStyle='rgba(239,227,200,.22)';c.lineWidth=1;for(const d of [-8,0,8]){c.beginPath();c.moveTo(d-4,-10);c.quadraticCurveTo(d+3,0,d-2,10);c.stroke();}
  c.restore();
  if(closed){brush(c,[[hx-13,hy-5],[hx-5,hy-3]],2.5,'#efe3c8');brush(c,[[hx+3,hy-1],[hx+11,hy+2]],2.5,'#efe3c8');return;}
  const [ex,ey]=lookAt(hx,hy);
  for(const [dx,dy] of [[-9,-5],[7,0]]){blob(c,hx+dx,hy+dy,5.5,4.5,'#efe3c8');blob(c,hx+dx+ex*0.7,hy+dy+ey*0.7,2.4,3.2,INK);}
  brush(c,[[hx-15,hy-11],[hx-4,hy-9]],2.5,INK);brush(c,[[hx+2,hy-6],[hx+12,hy-3]],2.5,INK);
  if(!Vfx.reducedMotion&&Math.floor(B.time/40)%4===0){const sx=hx+16,sy=hy+12;
    brush(c,[[sx,sy],[sx+4,sy+8],[sx+3,sy+14]],1.4,KSTEM);brush(c,[[sx+3,sy+14],[sx-2,sy+18],[sx-1,sy+21]],1,KSTEM);brush(c,[[sx+3,sy+14],[sx+8,sy+18],[sx+6,sy+21]],1,KSTEM);}
}
function drawKudzu(c){
  const cx=LW/2,cy=EY,arm=part('arm'),root=part('root'),core=part('core');
  const still=Vfx.reducedMotion,t=B.time,sway=still?0:Math.sin(t*0.03)*6;
  const acting=id=>B.cur&&B.cur.id===id&&(B.st==='tell'||B.st==='atk');
  const end=B.st==='end'&&B.result!=='lose';
  // 땅과 그늘
  blob(c,cx,cy+104,200,15,INK,0.1);brush(c,[[cx-220,cy+102],[cx,cy+98],[cx+220,cy+103]],3,INK,0.35);
  // 당산나무 줄기: 칡이 감은 몸
  const TW=27;
  c.save();c.fillStyle='rgba(91,70,52,.5)';c.beginPath();c.moveTo(cx-TW-7,cy+100);c.lineTo(cx-TW,cy-132);c.lineTo(cx+TW,cy-132);c.lineTo(cx+TW+7,cy+100);c.closePath();c.fill();c.restore();
  brush(c,[[cx-TW-7,cy+100],[cx-TW-2,cy-20],[cx-TW,cy-132]],3,INK,0.5);brush(c,[[cx+TW+7,cy+100],[cx+TW+2,cy-20],[cx+TW,cy-132]],3,INK,0.5);
  for(let i=0;i<4;i++)brush(c,[[cx-15+i*10,cy+92],[cx-13+i*10+hash(i*2.1)*4,cy-20],[cx-15+i*10,cy-126]],1.2,INK,0.22);
  // 감아 오른 몸통 덩굴: 줄기 뒤로 도는 마디는 옅게 먼저, 앞으로 도는 마디는 나중에
  const aO=shk(arm),wob=still?0:Math.sin(t*0.02)*0.08,H=[];
  for(let i=0;i<=60;i++){const s=i/60,a=s*Math.PI*4+0.4+wob;H.push([cx+aO+Math.sin(a)*(TW+12),cy+84-s*140,Math.cos(a)]);}
  const runs=front=>{const out=[];let cur=null;
    for(let i=1;i<H.length;i++){const f=(H[i-1][2]+H[i][2])>0;if(f===front){if(!cur){cur=[[H[i-1][0],H[i-1][1]]];out.push(cur);}cur.push([H[i][0],H[i][1]]);}else cur=null;}
    return out.filter(r=>r.length>1);};
  const body=end?'rgba(35,34,26,.55)':KSTEM;
  for(const r of runs(false))kStem(c,r,9,body,0.42);
  for(const i of [6,19,31,45])if(H[i][2]<=0)kLeaf(c,H[i][0],H[i][1],0.8,i%2?-0.8:0.9,KLEAF,0.35);
  // 칡뿌리: 밑동에 드러난 굵은 덩이뿌리. 가운데 것이 쳐들려 내리찍는다
  {const o=shk(root),col=partCol(root),dim=root.broken?0.35:1,line=col===INK?INK:col;
    // 밑동에서 뻗은 뿌리줄과 땅 위로 드러난 덩이뿌리 둘
    brush(c,[[cx-26+o,cy+94],[cx-58+o,cy+99],[cx-80+o,cy+97]],5,KROOT,0.85*dim);brush(c,[[cx+26+o,cy+94],[cx+44+o,cy+98]],5,KROOT,0.85*dim);
    kTuber(c,cx-102+o,cy+97,44,11,Math.PI+0.06,KROOT,INK,0.85*dim);kTuber(c,cx+66+o,cy+98,40,10,-0.05,KROOT,INK,0.85*dim);
    if(acting('root')&&B.st==='tell'){brush(c,[[cx-26+o,cy+92],[cx-86+o,cy+66],[cx-118+o,cy+16]],13,KROOT,0.95);kTuber(c,cx-122+o,cy-12,62,18,Math.PI/2+0.12,KROOT,line,1);}
    else if(acting('root'))brush(c,[[cx-26+o,cy+92],[cx-56+o,cy+122],[cx-66+o,cy+152]],13,KROOT,0.9);
    else{kTuber(c,cx-38+o,cy+104,62,16,Math.PI-0.04,KROOT,line,dim);if(root.broken)brush(c,[[cx-44,cy+94],[cx-38,cy+104],[cx-46,cy+114]],2,'#efe3c8',0.9);}}
  // 줄기 앞으로 도는 마디와 잎
  for(const r of runs(true))kStem(c,r,12,body,1);
  for(const i of [6,19,31,45])if(H[i][2]>0)kLeaf(c,H[i][0],H[i][1],0.9,i%2?-0.8:0.9,KLEAF,0.95);
  // 칡줄기: 꼬리 쪽 줄기가 채찍이다. 예고 때 뒤로 감기고, 후려칠 땐 상자 쪽으로 뻗는다
  {const o=shk(arm),col=partCol(arm),sx=cx+TW+8+o,sy=cy+64;let pts;
    if(arm.broken)pts=[[sx,sy],[cx+74+o,cy+92],[cx+132+o,cy+100]];
    else if(acting('arm')&&B.st==='tell')pts=[[sx,sy],[cx+82+o,cy+12],[cx+112+o,cy-50],[cx+152+o,cy-90],[cx+190+o,cy-76],[cx+184+o,cy-52]];
    else if(acting('arm'))pts=[[sx,sy],[cx+104+o,cy+70],[cx+172+o,cy+112],[cx+222+o,cy+152]];
    else pts=[[sx,sy],[cx+92+o,cy+40],[cx+150+o,cy+5+sway],[cx+170+o,cy-40+sway],[cx+148+o,cy-66+sway],[cx+132+o,cy-54+sway]];
    kStem(c,pts,arm.broken?7:10,col===INK?body:col,arm.broken?0.45:1);
    const n=pts.length;for(let i=1;i<n-1;i++)kLeaf(c,pts[i][0],pts[i][1]-4,0.85,i%2?-0.7:0.7,col===INK?KLEAF:col,arm.broken?0.3:0.9);
    if(arm.broken){const [ex,ey]=pts[n-1];brush(c,[[ex-2,ey-5],[ex+2,ey+5]],2.5,'#efe3c8');}}
  // 쳐든 목과 머리, 정수리의 칡꽃
  {const o=shk(core),hx=cx-84+o+sway*0.4,hy=cy-34,top=H[H.length-1];
    kStem(c,[[top[0],top[1]],[cx-4+o,cy-88],[cx-46+o,cy-92],[cx-74+o+sway*0.3,cy-66],[hx+6,hy-10]],12,body,1);
    kHead(c,hx,hy,end||core.broken?'#3a382e':'#25231b',end||core.broken);
    const col=partCol(core),petal=col===RED?RED:KPUR;
    if(core.broken){kFlower(c,hx-4,hy-10,-34,-16,KPUR_LT,0.35);for(let i=0;i<6;i++)blob(c,hx-40+i*14+hash(i)*6,cy+98-hash(i*3.1)*4,3,2,KPUR_LT,0.5);}
    else kFlower(c,hx-4,hy-11,60,-6+sway*0.5,petal,1);
    // 핵심이 가려져 있는 동안은 큰 잎이 꽃송이를 덮는다
    if(coreHidden()){kLeaf(c,hx-14,hy-18,1.5,-0.5,KLEAF,0.96);kLeaf(c,hx+6,hy-30,1.6,0.35,KLEAF,0.96);kLeaf(c,hx-8,hy-46,1.35,-0.1,KLEAF,0.96);}}
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
const BONK_LINES=['무쇠가 주먹을 쳐든다. 손 아래 그림자가 짙어지면 비켜라!','"한 번 더."','"이번엔 두 번이다."','"아까보다 빠르다."','"세 번! 눈 떼지 마라."','"마지막이다. 끝까지 봐라."'];
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
function drawMusoe(c){
  const cx=LW/2,cy=EY,bob=Math.sin(B.time*0.05)*2;
  // 내리꽂는 주먹이 있으면 오른팔이 그쪽으로 뻗는다. 그림이 0.84배로 줄어 그려지므로 상자 좌표를 되돌려 쓴다.
  const fists=B.bullets.filter(b=>b.k==='musoeFist'&&b.x!=null);
  const live=fists.find(b=>{const f=fistAt(b);return f.falling||(f.after&&b.t<f.hit+8);});
  const raised=!live&&fists.some(b=>fistAt(b).shadow);
  const inv=(x,y)=>[cx+(x-cx)/0.84,cy+(y-cy)/0.84];
  c.save();c.fillStyle='rgba(29,24,20,.14)';c.beginPath();c.ellipse(cx,cy+60+bob,92,62,0,0,Math.PI*2);c.fill();c.restore();
  // 몸통과 가죽 앞치마
  brush(c,[[cx-88,cy+82],[cx-92,cy+40+bob],[cx-50,cy+4+bob],[cx+50,cy+4+bob],[cx+92,cy+40+bob],[cx+88,cy+82]],6,INK);
  c.save();c.fillStyle='rgba(110,72,44,.55)';c.beginPath();c.moveTo(cx-40,cy+22+bob);c.lineTo(cx-46,cy+92);c.lineTo(cx+46,cy+92);c.lineTo(cx+40,cy+22+bob);c.closePath();c.fill();c.restore();
  brush(c,[[cx-40,cy+22+bob],[cx-46,cy+92],[cx+46,cy+92],[cx+40,cy+22+bob]],4,'#5a3a24',0.9);
  brush(c,[[cx-40,cy+22+bob],[cx-24,cy+4+bob]],3,'#5a3a24',0.8);brush(c,[[cx+40,cy+22+bob],[cx+24,cy+4+bob]],3,'#5a3a24',0.8);
  // 왼팔: 허리에 짚은 주먹
  brush(c,[[cx-80,cy+30+bob],[cx-112,cy+58],[cx-80,cy+76]],13,INK);blob(c,cx-76,cy+76,11,9,'#4a4038');
  // 오른팔: 평소엔 옆에, 예고 땐 머리 위로 쳐들고, 내리꽂을 땐 상자 쪽으로
  const sx=cx+80,sy=cy+30+bob;
  if(live){const [tx,ty]=inv(live.x,BOX.y-30);brush(c,[[sx,sy],[(sx+tx)/2+12,(sy+ty)/2-10],[tx,ty]],15,INK,0.9);}
  else if(raised){brush(c,[[sx,sy],[cx+124,cy-20+bob],[cx+112,cy-78+bob]],14,INK);blob(c,cx+112,cy-86+bob,14,12,'#4a4038');
    c.save();c.strokeStyle=Math.floor(B.time/5)%2?RED:INK;c.lineWidth=2.4;c.beginPath();c.ellipse(cx+112,cy-86+bob,15,13,0,0,Math.PI*2);c.stroke();c.restore();}
  else{brush(c,[[sx,sy],[cx+112,cy+56],[cx+88,cy+80]],13,INK);blob(c,cx+86,cy+80,11,9,'#4a4038');}
  // 머리: 너구리 삼촌. 눈가를 가로지르는 검은 탈무늬와 작은 귀
  const hx=cx,hy=cy-38+bob,end=B.st==='end'&&B.result!=='lose'||B.st==='finale'&&B.finaleT>=B.finaleEnd-30;
  blob(c,hx,hy,46,38,'#f4ead4');brush(c,[[hx-44,hy+6],[hx-40,hy-26],[hx,hy-40],[hx+40,hy-26],[hx+44,hy+6],[hx+20,hy+34],[hx-20,hy+34],[hx-44,hy+6]],4,INK);
  brush(c,[[hx-40,hy-2],[hx-22,hy-9],[hx-6,hy-2],[hx+6,hy-2],[hx+22,hy-9],[hx+40,hy-2]],13,INK);
  brush(c,[[hx-36,hy-26],[hx-30,hy-48],[hx-18,hy-36]],5,INK);brush(c,[[hx+36,hy-26],[hx+30,hy-48],[hx+18,hy-36]],5,INK);
  blob(c,hx,hy+16,7,5,INK);
  if(end){brush(c,[[hx-28,hy-2],[hx-16,hy+2]],3,'#f4ead4');brush(c,[[hx+16,hy+2],[hx+28,hy-2]],3,'#f4ead4');brush(c,[[hx-12,hy+26],[hx,hy+29],[hx+12,hy+26]],3,INK);}
  else{const [ex,ey]=lookAt(hx,hy);blob(c,hx-21+ex,hy-2+ey,3.5,3.5,'#f4ead4');blob(c,hx+21+ex,hy-2+ey,3.5,3.5,'#f4ead4');
    brush(c,[[hx-34,hy-18],[hx-12,hy-10]],4,INK);brush(c,[[hx+34,hy-18],[hx+12,hy-10]],4,INK);brush(c,[[hx-10,hy+26],[hx+10,hy+26]],3,INK);}
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
  // 당산나무: 칡 뒤 가운데의 굵은 줄기와 가지
  const tx=LW/2,tw=Math.min(118,LW*0.15);
  c.save();c.fillStyle='rgba(84,66,50,.17)';c.beginPath();c.moveTo(tx-tw*0.62,gy);c.lineTo(tx-tw*0.42,0);c.lineTo(tx+tw*0.42,0);c.lineTo(tx+tw*0.62,gy);c.closePath();c.fill();c.restore();
  brush(c,[[tx-tw*0.62,gy],[tx-tw*0.5,gy*0.5],[tx-tw*0.42,0]],5,INK,0.4);
  brush(c,[[tx+tw*0.62,gy],[tx+tw*0.5,gy*0.5],[tx+tw*0.42,0]],5,INK,0.4);
  for(let i=0;i<5;i++){const x=tx-tw*0.36+i*tw*0.18;brush(c,[[x,gy-12],[x+hash(i)*6-3,gy*0.55],[x+hash(i+9)*8-4,6]],1.4,INK,0.15);}
  brush(c,[[tx-tw*0.4,44],[tx-tw*1.4,14],[tx-tw*2.3,-8]],7,INK,0.3);brush(c,[[tx-tw*1.2,22],[tx-tw*1.5,-6]],3,INK,0.25);
  brush(c,[[tx+tw*0.4,34],[tx+tw*1.5,8],[tx+tw*2.4,-10]],7,INK,0.3);brush(c,[[tx+tw*1.3,16],[tx+tw*1.7,-8]],3,INK,0.25);
  // 금줄: 줄기를 가로지른 새끼줄과 흰 종이 술
  const ry=gy*0.4;brush(c,[[tx-tw*0.58,ry],[tx,ry+10],[tx+tw*0.58,ry]],3,'#6b5540',0.65);
  for(let i=0;i<5;i++){const x=tx-tw*0.4+i*tw*0.2,y=ry+3+Math.sin((i/4)*Math.PI)*7;
    c.save();c.fillStyle='rgba(250,246,236,.8)';c.fillRect(x-3,y,6,12);c.restore();brush(c,[[x-3,y],[x+3,y],[x+3,y+12],[x-3,y+12],[x-3,y]],1,INK,0.3);}
  // 줄기 밑 입구 아치와 그것을 덮은 칡 그물
  const aw=tw*0.36,ah=tw*0.56;
  c.save();c.fillStyle='rgba(29,24,20,.3)';c.beginPath();c.moveTo(tx-aw,gy);c.lineTo(tx-aw,gy-ah*0.6);c.quadraticCurveTo(tx,gy-ah*1.25,tx+aw,gy-ah*0.6);c.lineTo(tx+aw,gy);c.closePath();c.fill();c.restore();
  for(let i=0;i<6;i++)brush(c,[[tx-aw+i*aw*0.4,gy],[tx-aw*0.7+i*aw*0.3,gy-ah*0.45],[tx-aw+hash(i*3.3)*aw*2,gy-ah*0.95]],2,VINE,0.5);
  // 줄기를 비스듬히 감아 오르는 칡
  for(let k=0;k<4;k++){const pts=[];for(let s=0;s<=12;s++){const y=gy-s*gy/12-k*16;pts.push([tx+Math.sin(s*0.85+k*1.7)*tw*0.56,y]);}
    brush(c,pts,3,VINE,0.32);
    for(let s=1;s<12;s+=3)blob(c,pts[s][0],pts[s][1],5,3,VINE,0.28);}
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
   (줄기는 낫, 없으면 곡괭이 · kudzu_stem_cut_chance / 뿌리는 곡괭이, 없으면 낫 · kudzu_root_dig_chance). 표식이 닫히면 거둬 간다. */
/* 칡줄기 채찍: 상자 옆에서 위나 아래 띠를 가로로 후려친다. 띠가 먼저 옅게 붉어진다.
   세 번째는 손이 있는 띠를 노리고, 후려친 뒤 줄기가 축 늘어진다. */
const WHIP={gap:62,tell:40,swing:14,limp:24,fall:16,back:10,half:0.21};
function whipState(b){
  const tl=b.delay+WHIP.tell,sw=tl+WHIP.swing,lp=sw+(b.last?WHIP.limp:0),stop=b.cut?b.cutT+WHIP.fall:lp;
  return {wait:b.t<=b.delay,tell:b.t>b.delay&&b.t<=tl,swing:b.t>tl&&b.t<=sw,limp:b.last&&!b.cut&&b.t>sw&&b.t<=lp,lp,
    k:clamp((b.t-tl)/WHIP.swing,0,1),fallK:b.cut?clamp((b.t-b.cutT)/WHIP.fall,0,1):0,back:b.t>stop?clamp((b.t-stop)/WHIP.back,0,1):0,end:stop+WHIP.back};
}
/* 줄기가 지나는 높이. 늘어지면 가운데가 처진다 */
function stemY(b,x,sag){const u=(x-BOX.x)/BOX.w;return BOX.y+b.v*BOX.h+Math.sin(u*Math.PI*2+b.seed)*5+(sag?Math.sin(clamp(u,0,1)*Math.PI)*9:0);}
function whipY(b,x){const s=whipState(b);return stemY(b,x,s.limp||b.cut);}
function whipTipX(b,k){return b.side<0?BOX.x-14+(BOX.w+28)*k:BOX.x+BOX.w+14-(BOX.w+28)*k;}
function whipPts(b,x0,x1){const pts=[],n=10;for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n;pts.push([x,whipY(b,x)]);}return pts;}
/* 표식이 붙든 덩굴: 그 표식이 열려 있는 동안 남아 있다 */
function heldBy(b){return !!(B.kHold&&B.kHold.b===b&&B.mark);}
function stemTool(){return G.tool==='sickle'?'sickle':Array.isArray(G.f.battleTools)&&G.f.battleTools.includes('pickaxe')?'pickaxe':null;}
function rootTool(){return Array.isArray(G.f.battleTools)&&G.f.battleTools.includes('pickaxe')?'pickaxe':G.tool==='sickle'?'sickle':null;}
const TOOL_BY={sickle:'낫으로',pickaxe:'곡괭이로'};
/* 빈틈 자리: 줄기·뿌리는 남은 덩굴 위, 칡꽃은 꽃가루 잔향을 피한 자리 */
function kudzuMark(p){
  B.kHold=null;
  if(p.id==='arm'){const b=B.bullets.find(q=>q.k==='kudzuWhip'&&q.last&&q.v!=null&&!q.cut);
    if(b){const x=BOX.x+BOX.w*(B.px<BOX.x+BOX.w/2?0.72:0.28);B.kHold={b};return {x,y:stemY(b,x,true)};}}
  if(p.id==='root'){const b=B.bullets.find(q=>q.k==='kudzuSlam'&&q.last&&q.x!=null);
    if(b){B.kHold={b};return {x:b.x,y:clamp(b.y-10,BOX.y+18,BOX.y+BOX.h-18)};}}
  if(p.core){const puffs=B.bullets.filter(q=>q.k==='kudzuScent'&&q.x!=null);let x,y;
    for(let n=0;n<24;n++){x=BOX.x+30+Math.random()*(BOX.w-60);y=BOX.y+26+Math.random()*(BOX.h-52);
      if(Math.hypot(x-B.px,y-B.py)>=70&&puffs.every(q=>Math.hypot(x-q.x,y-q.y)>SCENT.radius+20))break;}
    return {x,y};}
  return null;
}
/* 표식을 친 뒤: 연장이 있으면 줄기를 끊거나 뿌리를 캐고, 확률로 재료를 얻는다 */
function kudzuMarkHit(p,m){
  const h=B.kHold;B.kHold=null;if(!h||(p.id!=='arm'&&p.id!=='root'))return;
  const b=h.b,arm=p.id==='arm',tool=arm?stemTool():rootTool();
  if(!tool){if(!p.broken)B.msg=arm?'칡줄기를 쳤다! 맨손으로는 질긴 줄기를 못 끊는다.':'칡뿌리를 쳤다! 맨손으로는 박힌 뿌리를 못 캔다.';return;}
  B.kTool=tool;B.kToolUntil=B.time+14;
  if(arm){b.cut=true;b.cutT=b.t;b.cutX=m.x;bSplash(m.x,m.y,'#3a3a2a');}
  else{b.dug=true;bSplash(m.x,m.y+6,'#8a6a4a');}
  if(p.broken)return;   // 부위가 부러지면 재료는 breakPart 가 준다
  const by=TOOL_BY[tool];
  if(arm)B.msg=Math.random()<T().kudzu_stem_cut_chance?(B.loot.push('vine'),by+' 칡줄기를 끊었다! 칡 줄기를 챙겼다.'):by+' 끊었지만 줄기가 짓이겨져 못 쓰겠다.';
  else B.msg=Math.random()<T().kudzu_root_dig_chance?(B.loot.push('root'),by+' 칡뿌리를 캤다! 칡뿌리를 챙겼다.'):by+' 찍었지만 뿌리가 부서져 못 쓰겠다.';
}
function kudzuHandTool(){
  if(B.kTool&&B.time<B.kToolUntil)return B.kTool;
  const m=B.mark;if(!m||!B.kHold||Math.hypot(m.x-B.px,m.y-B.py)>=battleHandProfile().radius)return null;
  return m.part.id==='arm'?stemTool():m.part.id==='root'?rootTool():null;
}
/* 칡뿌리 찍기: 손 자리에 그림자가 진 뒤 덩이뿌리가 위에서 내리찍는다. 칡뿌리가 공격할 때마다 한 대 → 두 대 → 세 대.
   마지막 뿌리는 땅에 박힌 채 남는다(D-176) */
const SLAM={tell:54,drop:8,gap:48,radius:28,stay:26};
function slamCount(){return Math.min(3,((B&&B.slamRound)||0)+1);}
function slamAt(b){const hit=b.delay+SLAM.tell+SLAM.drop;return {hit,shadow:b.t>b.delay&&b.t<=b.delay+SLAM.tell,falling:b.t>b.delay+SLAM.tell&&b.t<=hit,after:b.t>hit};}
function slamLiftAt(b){return b.liftAt??slamAt(b).hit+(b.last?14:8);}
/* 결정 D-178: 칡꽃 꽃가루. 손 자리 바닥에 칡꽃송이가 솟아(예고) 꽃가루를 터뜨리면 동그란 잔향이 바닥에 번진다.
   예전의 향 줄기·끌어당김은 없앴다. 번질 때도, 남은 잔향에 들어가도 맞는다. 피해는 kudzu_scent_damage(하트 반 칸)로 다른 공격보다 약하고,
   맞으면 kudzu_scent_slow_frames 동안 손이 kudzu_scent_slow 배로 느려진다. 연달아 깎이지 않게 맞은 뒤 무적(battle_iframes)을 그대로 쓴다.
   첫 꽃은 손 자리, 둘째·셋째는 그 양옆에 핀다 */
const SCENT={gap:44,tell:40,burst:20,fade:30,radius:30};
function scentAt(b){const a=b.delay,tl=a+SCENT.tell,bu=tl+SCENT.burst,li=bu+T().kudzu_scent_linger,end=li+SCENT.fade;
  return {wait:b.t<=a,tell:b.t>a&&b.t<=tl,burst:b.t>tl&&b.t<=bu,linger:b.t>bu&&b.t<=li,fade:b.t>li,
    k:b.t<=tl?clamp((b.t-a)/SCENT.tell,0,1):b.t<=bu?(b.t-tl)/SCENT.burst:b.t<=li?(b.t-bu)/T().kudzu_scent_linger:(b.t-li)/SCENT.fade,end};}
function scentHit(){
  if(!bHitMe(T().kudzu_scent_damage))return;
  B.slowT=T().kudzu_scent_slow_frames;B.slowK=T().kudzu_scent_slow;
  if(!B.scentNoted&&B.st!=='end'){B.scentNoted=true;B.msg='달큰한 꽃가루에 손이 무거워졌다.';}
}
defineAttacks({
  kudzuWhip:{dur:2*WHIP.gap+WHIP.tell+WHIP.swing,tick(t){if(t)return;B.kHold=null;
    const first=Math.random()<0.5?0.25:0.75,side=Math.random()<0.5?-1:1;
    for(let i=0;i<3;i++)B.bullets.push({k:'kudzuWhip',t:0,delay:i*WHIP.gap,v:i===2?null:i?1-first:first,last:i===2,side:i%2?-side:side,seed:i*1.7});}},
  kudzuSlam:{get dur(){return (slamCount()-1)*SLAM.gap+SLAM.tell+SLAM.drop+10;},tick(t){if(t)return;B.kHold=null;
    const n=slamCount();B.slamRound=n;
    for(let i=0;i<n;i++)B.bullets.push({k:'kudzuSlam',t:0,delay:i*SLAM.gap,x:null,y:null,last:i===n-1});}},
  kudzuScent:{dur:2*SCENT.gap+SCENT.tell+SCENT.burst,tick(t){if(t)return;B.kHold=null;
    const side=Math.random()<0.5?-1:1;for(let i=0;i<3;i++)B.bullets.push({k:'kudzuScent',t:0,delay:i*SCENT.gap,i,side,seed:i*2.3+side,x:null,y:null});}},
});
defineBullets({
  kudzuWhip:{
    step(b){const held=b.last&&!b.cut&&heldBy(b);b.t++;const s=whipState(b);
      if(held&&b.t>s.lp)b.t=s.lp;   // 표식이 열린 동안 늘어진 채로 둔다
      if(b.v==null&&b.t>b.delay)b.v=(B.py-BOX.y)/BOX.h<0.5?0.25:0.75;   // 마지막 채찍은 예고가 시작될 때 손이 있던 띠
      if(s.swing){const x=whipTipX(b,s.k),y=BOX.y+b.v*BOX.h;
        if(Math.abs(B.py-y)<WHIP.half*BOX.h&&(b.side<0?B.px<=x:B.px>=x))bHitMe();}
      if(b.t>s.end)b.dead=1;},
    draw(c,b){const s=whipState(b);if(s.wait)return;
      const yc=BOX.y+(b.v==null?(B.py-BOX.y)/BOX.h<0.5?0.25:0.75:b.v)*BOX.h,half=WHIP.half*BOX.h,from=b.side<0?BOX.x-14:BOX.x+BOX.w+14;
      if(s.tell){const k=(b.t-b.delay)/WHIP.tell,flash=k>0.72&&Math.floor(b.t/4)%2;
        c.save();c.fillStyle='rgba(180,67,42,'+(0.05+0.13*k).toFixed(3)+')';c.fillRect(BOX.x,yc-half,BOX.w,half*2);
        c.strokeStyle=RED;c.globalAlpha=flash?0.95:0.45;c.lineWidth=1.6;c.setLineDash([7,5]);
        c.beginPath();c.moveTo(BOX.x,yc-half);c.lineTo(BOX.x+BOX.w,yc-half);c.moveTo(BOX.x,yc+half);c.lineTo(BOX.x+BOX.w,yc+half);c.stroke();c.restore();
        // 띠 끝에서 줄기 끝이 뒤로 감긴다
        const ex=b.side<0?BOX.x+6:BOX.x+BOX.w-6,d=-b.side;
        kStem(c,[[ex-d*12,yc+10],[ex+d*4,yc+2],[ex+d*8,yc-10],[ex,yc-14],[ex-d*4,yc-6]],5,KSTEM,0.4+0.5*k);return;}
      if(s.swing){const x=whipTipX(b,s.k);
        for(let j=-2;j<=2;j++)brush(c,[[from,yc+j*half*0.4],[x,yc+j*half*0.3]],2,INK,0.12);   // 후려치는 바람
        const pts=whipPts(b,from,x);kStem(c,pts,8,KSTEM,1);
        for(let i=2;i<pts.length-1;i+=3)kLeaf(c,pts[i][0],pts[i][1]-3,0.6,b.side<0?0.5:-0.5,KLEAF,0.85);
        brush(c,[[x,whipY(b,x)],[x-b.side*8,whipY(b,x)-7],[x-b.side*3,whipY(b,x)-11]],3,KSTEM);return;}
      const back=s.back;
      if(!b.cut){const tip=b.side<0?from+(BOX.x+BOX.w+14-from)*(1-back):from-(from-BOX.x+14)*(1-back);
        const pts=whipPts(b,from,tip);kStem(c,pts,7,KSTEM,s.limp?0.9:0.7*(1-back));
        if(s.limp)for(let i=2;i<pts.length-1;i+=3)kLeaf(c,pts[i][0],pts[i][1]+2,0.6,b.side<0?2.6:-2.6,KLEAF,0.7);
        return;}
      // 끊긴 줄기: 뿌리 쪽은 거둬 가고, 끝 쪽은 떨어지며 흐려진다
      const cut=b.cutX,tipSide=b.side<0?BOX.x+BOX.w+14:BOX.x-14;
      const keep=b.side<0?from+(cut-from)*(1-back):from-(from-cut)*(1-back);
      kStem(c,whipPts(b,from,keep),7,KSTEM,0.85);
      c.save();c.globalAlpha=1-s.fallK;c.translate(0,s.fallK*24);kStem(c,whipPts(b,cut,tipSide),6,KSTEM,0.8);c.restore();
    }},
  kudzuSlam:{
    step(b){const held=b.last&&!b.dug&&heldBy(b);b.t++;
      if(b.x==null&&b.t>b.delay){b.x=B.px;b.y=B.py;}
      const f=slamAt(b);
      if(b.t===f.hit){Sound.playSfx('battle_hit');bSplash(b.x,b.y,'#6f6357');if(Math.hypot(B.px-b.x,B.py-b.y)<SLAM.radius)bHitMe();}
      if(held&&b.t>f.hit)b.liftAt=b.t+1;   // 표식이 열린 동안 땅에 박힌 채로 둔다
      if(!held&&b.t>Math.max(f.hit+SLAM.stay,slamLiftAt(b)+18))b.dead=1;},
    draw(c,b){if(b.x==null)return;const f=slamAt(b),R=SLAM.radius;
      if(f.shadow||f.falling){const k=f.shadow?(b.t-b.delay)/SLAM.tell:1;
        blob(c,b.x,b.y+6,R*(0.45+0.55*k),R*0.42*(0.45+0.55*k),INK,0.12+0.3*k);
        if(k>0.7&&Math.floor(b.t/4)%2){c.save();c.strokeStyle=RED;c.lineWidth=2;c.globalAlpha=0.8;c.beginPath();c.ellipse(b.x,b.y+6,R,R*0.42,0,0,Math.PI*2);c.stroke();c.restore();}}
      const club=(y,alpha)=>{brush(c,[[b.x+12,BOX.y-40],[b.x+6,(BOX.y-40+y)/2],[b.x,y-38]],12,KROOT,alpha);kTuber(c,b.x,y-18,46,16,-Math.PI/2,KROOT,INK,alpha);};
      if(f.falling){const k=(b.t-b.delay-SLAM.tell)/SLAM.drop;club(BOX.y-12+(b.y-BOX.y+12)*k,1);}
      if(f.after){const a=b.t-f.hit,lift=clamp((b.t-slamLiftAt(b))/16,0,1);
        if(b.last&&lift===0)blob(c,b.x,b.y+5,R*0.62,R*0.24,'#6f5a44',0.35);   // 박힌 자리의 흙
        club(b.y-(b.y-BOX.y+20)*lift*lift,1-lift*0.6);
        c.save();c.strokeStyle=INK;c.globalAlpha=Math.max(0,1-a/SLAM.stay);c.lineWidth=1.6;c.beginPath();
        for(let i=0;i<6;i++){const ang=i*Math.PI/3+0.3,r0=R*0.55,r1=R*0.55+8+a*0.5;c.moveTo(b.x+Math.cos(ang)*r0,b.y+6+Math.sin(ang)*r0*0.42);c.lineTo(b.x+Math.cos(ang+0.15)*r1,b.y+6+Math.sin(ang+0.15)*r1*0.42);}
        c.stroke();c.restore();
        if(a<14){c.save();c.fillStyle=INK;c.globalAlpha=1-a/14;c.font='bold 15px "Gowun Batang", serif';c.textAlign='center';c.fillText('쿵',b.x+26,b.y-12);c.restore();}}
    }},
  kudzuScent:{
    step(b){b.t++;
      if(b.x==null&&b.t>b.delay){const o=b.i===0?0:(b.i===1?1:-1)*b.side*80,m=SCENT.radius;
        b.x=clamp(B.px+o,BOX.x+m,BOX.x+BOX.w-m);b.y=clamp(B.py+(b.i===2?14:b.i?-10:0),BOX.y+m*0.7,BOX.y+BOX.h-m*0.7);}
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
      const bloom=(len,lean,alpha)=>{c.save();c.translate(x,y+8);c.scale(1.4,1.4);kFlower(c,0,0,len,lean,KPUR_LT,alpha);c.restore();};   // 바닥에서 솟은 칡꽃송이
      if(s.tell){const k=s.k;
        c.save();c.strokeStyle=KPUR;c.globalAlpha=0.35+0.2*k;c.lineWidth=1.2;c.setLineDash([3,4]);c.beginPath();c.arc(x,y,R*(0.55+0.45*k),0,Math.PI*2);c.stroke();c.restore();
        if(k>0.75&&Math.floor(b.t/4)%2){c.save();c.strokeStyle=RED;c.globalAlpha=0.8;c.lineWidth=1.8;c.beginPath();c.arc(x,y,R,0,Math.PI*2);c.stroke();c.restore();}
        const sway=still?0:Math.sin(b.t*0.25)*2;
        kLeaf(c,x-10,y+9,0.75,-0.9,KLEAF,0.4+0.5*k);kLeaf(c,x+10,y+9,0.7,0.9,KLEAF,0.4+0.5*k);
        bloom(10+22*k,sway,0.35+0.65*k);return;}
      if(s.burst){const k=s.k,e=1-(1-k)*(1-k);
        pool(R*e,1);
        bloom(32,still?0:Math.sin(b.t*0.9)*4,1-k*0.7);   // 꽃가루를 터뜨리며 흔들린다
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
    intro:'칡덩굴이 뱀처럼 당산나무를 감고 고개를 든다. 공격을 피하고 빈틈을 노리자.',
    howto:true,firstPart:'arm',
    // 결정 D-177: 공격 뒤 매듭 풀기(진정 행동)와 선물 받은 덩굴이 내미는 매듭을 없앤다. 달래기는 버섯 선물로만 한다.
    goalText:'줄기 채찍·뿌리 찍기·꽃가루를 피하자. 공격 뒤 남은 줄기와 뿌리를 치면 재료를 얻는다.',
    parts:tableParts('kudzu',{arm:{atk:'kudzuWhip',mark:'줄',tell:'칡줄기가 뒤로 감긴다. 붉어지는 띠에서 비키자!'},
      root:{atk:'kudzuSlam',mark:'뿌',tell:'덩이뿌리가 쳐들린다. 그림자가 짙어지면 비키자!'},
      core:{atk:'kudzuScent',mark:'꽃',tell:'칡꽃이 피어오른다. 꽃가루가 번진 자리는 피하자!'}}),
    likes:TABLES.CALM.kudzu,likeText:'버섯 향에 덩굴이 조금 느슨해진다.',
    coreHidden:'칡꽃이 잎 뒤에 숨어 있다. 줄기나 뿌리를 먼저 꺾자.',
    coreShown:'잎이 걷혀 칡꽃이 드러났다! 이제 꽃을 노릴 수 있다.',
    calmWin:'엉킨 칡이 스르르 풀리며 당산나무를 놓아준다.',calmGift:'kflower',
    win:'칡꽃송이가 꺾이자 덩굴이 힘없이 흘러내린다.',
    lose:'덩굴에 밀려 숲 어귀로 물러났다.',
    handTool:kudzuHandTool,markPosition:kudzuMark,onMarkHit:kudzuMarkHit,
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
