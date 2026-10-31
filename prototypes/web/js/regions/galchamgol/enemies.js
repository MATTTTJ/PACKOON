'use strict';
/* 단풍골 전투: 엉킨 칡(보스)과 무쇠의 시험(NPC 전투). 원본 표: design/data/bosses.csv · boss_parts.csv */
(()=>{
function drawKudzu(c){
  const cx=LW/2,cy=EY;const arm=part('arm'),root=part('root'),core=part('core');
  const sway=Math.sin(B.time*0.03)*6;
  // 뿌리
  {const o=shk(root),col=partCol(root);const len=root.broken?0.45:1;
    [[-150,110],[-80,118],[-20,122],[55,118],[140,108]].forEach(([dx,dy],i)=>{brush(c,[[cx+o,cy+28],[cx+dx*0.45+o,cy+40+dy*0.3],[cx+dx*len+o,cy+28+dy*len*0.85]],10-i%2*3,col);
      brush(c,[[cx+dx*len*0.7+o,cy+28+dy*len*0.6],[cx+dx*len*0.8+12+o,cy+34+dy*len*0.75]],3,col);});}
  // 덩굴손
  {const o=shk(arm),col=partCol(arm);const droop=arm.broken?60:0;
    [-1,1].forEach(s=>{const pts=[[cx+s*30+o,cy-6],[cx+s*90+o,cy-50+sway*s+droop],[cx+s*150+o,cy-74+droop*1.4],[cx+s*178+o,cy-40+droop*1.5],[cx+s*160+o,cy-16+droop*1.5]];
      brush(c,pts,13,col);
      [[0.35,-62],[0.62,-80],[0.85,-48]].forEach(([k,dy],i)=>{const lx=cx+s*(40+k*140)+o,ly=cy+dy*0.9+droop*k+sway*s*0.5;c.save();c.translate(lx,ly);c.rotate(s*0.6+i);blob(c,0,0,11,5,col===INK?'#2a2a22':col,arm.broken?1:0.85);c.restore();});});}
  // 심
  {const o=shk(core),col=partCol(core);
    blob(c,cx+o,cy+4,50,44,col===INK?'#231e19':col,core.broken?0.25:1);
    for(let i=0;i<4;i++)brush(c,[[cx-38+o,cy-10+i*12],[cx+o,cy-2+i*14+(i%2?6:-6)],[cx+40+o,cy-8+i*12]],3,'#4a4038',core.broken?0.2:0.7);
    if(core.broken){brush(c,[[cx-10,cy-30],[cx+4,cy],[cx-6,cy+30]],3,'#efe3c8');blob(c,cx-16,cy-8,7,2,'#efe3c8');blob(c,cx+16,cy-8,7,2,'#efe3c8');}
    else{const [ex,ey]=lookAt(cx,cy);blob(c,cx-17+o,cy-8,10,8,'#efe3c8');blob(c,cx+17+o,cy-8,10,8,'#efe3c8');blob(c,cx-17+ex+o,cy-8+ey,4.5,5,INK);blob(c,cx+17+ex+o,cy-8+ey,4.5,5,INK);
      brush(c,[[cx-28+o,cy-22],[cx-10+o,cy-17]],3,INK);brush(c,[[cx+28+o,cy-22],[cx+10+o,cy-17]],3,INK);}
    // 꽃눈
    brush(c,[[cx+o,cy-40],[cx+3+o,cy-56]],4,col,core.broken?0.3:1);blob(c,cx+4+o,cy-62,8,10,col,core.broken?0.25:0.9);
    if(coreHidden()){brush(c,[[cx-70,cy-20],[cx,cy+10+sway],[cx+70,cy-26]],9,INK,0.85);brush(c,[[cx-60,cy+30],[cx+10,cy-6-sway],[cx+66,cy+24]],8,INK,0.8);}
  }
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
defineEnemies({
  kudzu:{name:'엉킨 칡',calmLabel:'진정',
    intro:'[시험판] 칡덩굴이 당산나무를 놓지 못한다. 고리를 옮겨 피할 길을 풀어 놓자.',
    howto:true,
    vinePath:true,calmAction:{kind:'knot',amount:TABLES.CALM.kudzu.ssari/2,prompt:'느슨한 매듭 위에서',text:'느슨한 매듭을 풀었다. 칡이 당산나무를 조금 놓아준다.'},
    parts:tableParts('kudzu',{arm:{atk:'kudzuVines',tell:'덩굴손이 가시 줄을 내린다. 고리를 놓은 흰 통로로!'},root:{atk:'kudzuRoots',tell:'먹 균열에서 뿌리가 솟는다. 풀어 둔 통로에 손을 맞추자.'},core:{atk:'kudzuSeeds',tell:'심이 손을 겨눈다. 먹점으로 씨앗을 유도하고 옆으로 빠지자.'}}),
    likes:TABLES.CALM.kudzu,likeText:'버섯 향에 덩굴이 느슨해지며 손 쪽으로 매듭을 내민다.',
    coreHidden:'심이 덩굴 뒤에 숨어 있다. 덩굴손이나 뿌리를 먼저 꺾자.',
    coreShown:'심이 드러났다! 이제 심을 노릴 수 있다.',
    calmWin:'엉킨 칡이 스르르 풀리며 당산나무를 놓아준다.',calmGift:'kflower',
    win:'칡의 심이 갈라지며 덩굴이 힘없이 흘러내린다.',
    lose:'덩굴에 밀려 숲 어귀로 물러났다.',
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
