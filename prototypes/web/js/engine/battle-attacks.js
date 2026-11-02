'use strict';
/* 부위 공격 목록. 보스 부위의 atk 에 이름을 적으면 그 공격을 쓴다 (design/data/boss_parts.csv 의 공격 칸).
   ATTACKS[이름]={dur:지속 프레임, tick(t, 상자):탄을 만든다}
   BULLETS[종류]={step(b, 상자):움직이고 맞으면 bHitMe(), 끝나면 b.dead=1, draw(c, b)}
   새 공격은 이 파일에 더하거나, 지역 파일에서 defineAttacks / defineBullets 로 더한다. */
const ATTACKS={},BULLETS={};
function defineAttacks(m){Object.assign(ATTACKS,m);}
function defineBullets(m){Object.assign(BULLETS,m);}
/* 결정 D-246: 보스 공격의 방향과 자리를 섞는다 (사용자 피드백 2026-11-02: 같은 방향·같은 패턴만 나온다).
   같은 공격이 다음 차례에는 다른 방향(0·1)으로 온다. 처음 방향은 무작위. 예고는 방향마다 그 방향으로 그린다. */
function altDir(key){const m=B.altDir||(B.altDir={});return m[key]=(m[key]??(Math.random()<0.5?1:0))^1;}

/* 빙의 선택 기능 전용. 예고 때 정한 여백과 끝선을 공격 내내 그대로 쓴다.
   o:'x' 는 좌우로 움직이는 공격(틈은 위아래 자리), o:'y' 는 위아래로 움직이는 공격(틈은 좌우 자리). */
defineAttacks({
  hauntedSweep:{dur:145,
    prepare(){const o=altDir('hSweep')?'y':'x',side=Math.random()<0.5?1:-1;
      return {kind:'sweep',o,gap:o==='x'?(Math.random()<0.5?0.25:0.66):(Math.random()<0.5?0.22:0.74),half:o==='x'?0.16:0.16*BOX.h/BOX.w,side};},
    tick(t){if(t===0)B.bullets.push({k:'hauntedSweep',t:0,life:145,...B.attackPlan});}},
  hauntedBeans:{dur:175,
    prepare(){const o=altDir('hBeans')?'y':'x';
      if(o==='x'){const gap=Math.random()<0.5?0.3:0.7;return {kind:'beans',o,gap,half:0.18,dots:[0.08,0.22,0.36,0.5,0.64,0.78,0.92].filter(u=>Math.abs(u-gap)>0.24)};}
      // 옆에서 키질해 날린 콩: 한 줄(v)이 비고, 콩은 왼쪽이나 오른쪽에서 날아든다
      const gap=Math.random()<0.5?0.3:0.7;return {kind:'beans',o,gap,half:0.2,side:Math.random()<0.5?1:-1,dots:[0.08,0.24,0.4,0.56,0.72,0.9].filter(v=>Math.abs(v-gap)>0.26)};},
    tick(t){if(t===0||t===40||t===80)for(const d of B.attackPlan.dots)B.bullets.push(B.attackPlan.o==='x'?{k:'hauntedBean',u:d,t:0,life:90}:{k:'hauntedBean',o:'y',v:d,side:B.attackPlan.side,t:0,life:90});}},
  hauntedRoll:{dur:140,
    prepare(){const o=altDir('hRoll')?'y':'x';return {kind:'roll',o,side:Math.random()<0.5?-1:1,depth:o==='x'?0.62:0.58};},
    tick(t){if(t===0)B.bullets.push({k:'hauntedRoll',t:0,grow:70,hold:38,back:30,...B.attackPlan});}},
});
function sweepPos(b){return b.side>0?-0.05+1.1*b.t/b.life:1.05-1.1*b.t/b.life;}
defineBullets({
  hauntedSweep:{
    step(b){b.t++;if(b.t>b.life){b.dead=1;return;}
      const u=sweepPos(b);
      if(b.o==='y'){if(Math.abs(B.py-(BOX.y+u*BOX.h))<11&&Math.abs((B.px-BOX.x)/BOX.w-b.gap)>b.half-5/BOX.w)bHitMe();}
      else if(Math.abs(B.px-(BOX.x+u*BOX.w))<11&&Math.abs((B.py-BOX.y)/BOX.h-b.gap)>b.half-5/BOX.h)bHitMe();},
    draw(c,b){const u=sweepPos(b);
      if(b.o==='y'){const y=BOX.y+u*BOX.h,l=BOX.x+(b.gap-b.half)*BOX.w,r=BOX.x+(b.gap+b.half)*BOX.w;
        brush(c,[[BOX.x,y],[l,y-b.side*4]],12,INK);brush(c,[[r,y-b.side*4],[BOX.x+BOX.w,y]],12,INK);
        for(let x=BOX.x+6;x<BOX.x+BOX.w;x+=12)if(x<l-4||x>r+4)brush(c,[[x,y],[x+4,y-b.side*14]],2,INK,0.65);
        return;}
      const x=BOX.x+u*BOX.w;
      const top=BOX.y+(b.gap-b.half)*BOX.h,bot=BOX.y+(b.gap+b.half)*BOX.h;
      brush(c,[[x,BOX.y],[x-b.side*4,top]],12,INK);brush(c,[[x,bot],[x-b.side*4,BOX.y+BOX.h]],12,INK);
      for(let y=BOX.y+6;y<BOX.y+BOX.h;y+=12)if(y<top-4||y>bot+4)brush(c,[[x,y],[x-b.side*14,y+4]],2,INK,0.65);
    }},
  hauntedBean:{
    step(b){b.t++;if(b.t>b.life){b.dead=1;return;}
      const k=-0.08+1.16*(b.t/b.life)**1.5;
      if(b.o==='y')b.u=b.side>0?k:1-k;else b.v=k;
      const p=coverPoint(b);if(Math.hypot(p.x-B.px,p.y-B.py)<9)bHitMe();},
    draw(c,b){const p=coverPoint(b);blob(c,p.x,p.y,4,3.5,INK);blob(c,p.x-1,p.y-1,1,1,'#f7f4ed');}},
  hauntedRoll:{
    step(b){b.t++;const g=b.grow,h=g+b.hold,end=h+b.back;if(b.t>end){b.dead=1;return;}
      b.d=b.depth*(b.t<=g?b.t/g:b.t<=h?1:1-(b.t-h)/b.back);
      if(b.o==='y'?(b.side<0?B.py<BOX.y+b.d*BOX.h+4:B.py>BOX.y+(1-b.d)*BOX.h-4):(b.side<0?B.px<BOX.x+b.d*BOX.w+4:B.px>BOX.x+(1-b.d)*BOX.w-4))bHitMe();},
    draw(c,b){
      if(b.o==='y'){const d=(b.d||0)*BOX.h,y=b.side<0?BOX.y:BOX.y+BOX.h-d,edge=b.side<0?y+d:y;   // 위나 아래에서 말려 들어오는 멍석
        c.save();c.fillStyle='rgba(29,24,20,.8)';c.fillRect(BOX.x,y,BOX.w,d);c.restore();
        blob(c,BOX.x+BOX.w/2,edge,BOX.w/2,7,INK);
        for(let x=BOX.x+6;x<BOX.x+BOX.w;x+=12)brush(c,[[x,edge-5],[x+4,edge+5]],2,'#f7f4ed',0.6);
        return;}
      const d=(b.d||0)*BOX.w,x=b.side<0?BOX.x:BOX.x+BOX.w-d,edge=b.side<0?x+d:x;
      c.save();c.fillStyle='rgba(29,24,20,.8)';c.fillRect(x,BOX.y,d,BOX.h);c.restore();
      blob(c,edge,BOX.y+BOX.h/2,7,BOX.h/2,INK);
      for(let y=BOX.y+6;y<BOX.y+BOX.h;y+=12)brush(c,[[edge-5,y],[edge+5,y+4]],2,'#f7f4ed',0.6);
    }},
});

/* 강철이 선택 기능. 예고부터 끝까지 같은 온기 길을 비워 둔다. */
function winterAttack(kind){return {dur:220,tick(t){
  if(t===0&&B.E.warmPath)B.bullets.push({k:'gangcheolWinter',kind,t:0,life:220});
}};}
defineAttacks({
  gangcheolFrost:winterAttack('mouth'),gangcheolCoil:winterAttack('body'),
  gangcheolIcicles:winterAttack('tail'),gangcheolBlizzard:winterAttack('core'),
});
/* 그린 먹과 피격 판정에 같은 범위를 쓴다. 온기 길은 이 범위보다 우선한다.
   결정 D-246: 방향 dir(B.warm.dir, 같은 부위는 차례마다 바뀐다)
   입: 0 위에서 내려오는 서리 띠 · 1 왼쪽에서 오른쪽으로 가는 서리 띠
   몸통: 0 양옆에서 조여 듦 · 1 위아래에서 조여 듦
   꼬리: 0 위에서 떨어지는 고드름 줄 · 1 오른쪽에서 날아드는 고드름 줄
   머리: 0 시계 방향 · 1 반대 방향으로 도는 눈보라 띠 */
function winterThreat(kind,t,x,y,dir=B.warm?B.warm.dir:0){
  if(t<=30)return false;
  const u=(x-BOX.x)/BOX.w,v=(y-BOX.y)/BOX.h;
  if(kind==='mouth')return dir?Math.abs(u-((t-30)%100)/80)<0.18*BOX.h/BOX.w*1.2:Math.abs(v-((t-30)%100)/80)<0.18;
  if(kind==='body'){if(dir){const depth=Math.min(0.4,(t-30)/200);return v<depth||v>1-depth;}
    const depth=Math.min(0.46,(t-30)/180);return u<depth||u>1-depth;}
  if(kind==='tail'){
    const fall=((t-30)%80)/65;
    if(dir)return Math.abs((1-u)-fall)<0.1&&Math.abs(v*5-Math.round(v*5))<0.2;
    return Math.abs(v-fall)<0.14&&Math.abs(u*8-Math.round(u*8))<0.2;
  }
  // 머리를 드러낸 뒤에도 눈보라는 남는다. 읽을 수 있는 두 띠가 회전한다.
  const a=(t-30)*0.025*(dir?-1:1),dx=(u-0.5)*BOX.w,dy=(v-0.5)*BOX.h;
  return Math.abs(dx*Math.cos(a)+dy*Math.sin(a))<28;
}
defineBullets({gangcheolWinter:{
  step(b){b.t++;if(b.t>=b.life){b.dead=1;return;}
    if(!warmSafe(B.px,B.py)&&winterThreat(b.kind,b.t,B.px,B.py))bHitMe();
  },
  draw(c,b){drawWinterThreat(c,b.kind,b.t);},
}});

defineAttacks({
  /* 틈이 하나 있는 가로줄이 위에서 내려오거나 아래에서 올라온다 (결정 D-246) */
  sweep:{dur:160,tick(t,X,Y,W,Hh){if(t%52===0){const gw=58;const gx=X+14+Math.random()*(W-gw-28),up=altDir('sweep');B.bullets.push({k:'bar',y:up?Y+Hh+8:Y-8,vy:up?-1.55:1.55,gx,gw,th:9});}}},
  /* 바닥 점선 예고 후 가시가 솟는다 */
  spike:{dur:150,tick(t,X,Y,W,Hh){if(t%28===0&&t<126){const x=X+18+Math.random()*(W-36);B.bullets.push({k:'spike',x,w:26,t:0,tell:36,up:24,maxh:Hh*0.6,h:0});}}},
  /* 손을 조준한 씨앗 */
  seed:{dur:130,tick(t,X,Y,W,Hh){if(t%22===0){const sx=X+W/2+(Math.random()-.5)*60,sy=Y-6;const a=Math.atan2(B.py-sy,B.px-sx);B.bullets.push({k:'seed',x:sx,y:sy,vx:Math.cos(a)*2.4,vy:Math.sin(a)*2.4,r:6});}}},
  /* 세로 줄 예고 후 내려친다 */
  slam:{dur:150,tick(t,X,Y,W,Hh){if(t%44===0&&t<130){const w=58;const x=X+Math.random()*(W-w);B.bullets.push({k:'slam',x,w,t:0,tell:34,hold:14});}}},
  /* 물결치며 옆에서 날아오는 불씨 */
  ember:{dur:140,tick(t,X,Y,W,Hh){if(t===0)B.emberSide=altDir('ember')?-1:1;if(t%13===0){const y=Y+12+Math.random()*(Hh-24),s=B.emberSide;B.bullets.push({k:'ember',x:s>0?X-8:X+W+8,y0:y,y,vx:2.2*s,ph:Math.random()*6,r:5});}}},
  /* 손을 향해 세 갈래로 퍼지는 호통 */
  shout:{dur:130,tick(t,X,Y,W,Hh){if(t%42===0){const sx=X+W/2,sy=Y-6;const a0=Math.atan2(B.py-sy,B.px-sx);for(let i=-1;i<=1;i++){const a=a0+i*0.3;B.bullets.push({k:'seed',x:sx,y:sy,vx:Math.cos(a)*2.1,vy:Math.sin(a)*2.1,r:7,ring:true});}}}},
});

defineBullets({
  bar:{
    step(b,X1,X2,Y1,Y2){b.y+=b.vy;if(b.y>Y2+8||b.y<Y1-10)b.dead=1;else if(Math.abs(B.py-b.y)<b.th/2+4&&!(B.px>b.gx+4&&B.px<b.gx+b.gw-4))bHitMe();},
    draw(c,b){brush(c,[[BOX.x-4,b.y],[b.gx,b.y]],b.th,INK);brush(c,[[b.gx+b.gw,b.y],[BOX.x+BOX.w+4,b.y]],b.th,INK);
      for(let x=BOX.x+6;x<BOX.x+BOX.w;x+=14){if(x>b.gx-4&&x<b.gx+b.gw+4)continue;brush(c,[[x,b.y],[x+4,b.y+8]],2,INK);}}},
  spike:{
    step(b,X1,X2,Y1,Y2){b.t++;if(b.t>b.tell+b.up)b.dead=1;else if(b.t>b.tell){b.h=Math.min(b.maxh,(b.t-b.tell)*b.maxh/5);if(Math.abs(B.px-b.x)<b.w/2+3&&B.py>Y2-b.h-3)bHitMe();}},
    draw(c,b){if(b.t<=b.tell){c.save();c.setLineDash([5,4]);c.strokeStyle=RED;c.lineWidth=2;c.globalAlpha=Math.floor(b.t/5)%2?1:0.5;c.strokeRect(b.x-b.w/2,BOX.y+BOX.h-b.maxh,b.w,b.maxh);c.restore();}
      else{c.fillStyle=INK;c.beginPath();c.moveTo(b.x-b.w/2,BOX.y+BOX.h);c.lineTo(b.x-3,BOX.y+BOX.h-b.h);c.lineTo(b.x+3,BOX.y+BOX.h-b.h);c.lineTo(b.x+b.w/2,BOX.y+BOX.h);c.closePath();c.fill();}}},
  seed:{
    step(b,X1,X2,Y1,Y2){b.x+=b.vx;b.y+=b.vy;if(b.x<X1-20||b.x>X2+20||b.y>Y2+20||b.y<Y1-30)b.dead=1;else if(Math.hypot(b.x-B.px,b.y-B.py)<b.r+4)bHitMe();},
    draw(c,b){blob(c,b.x,b.y,b.r,b.r,INK);if(b.ring){c.save();c.strokeStyle=INK;c.lineWidth=1.5;c.beginPath();c.arc(b.x,b.y,b.r+4,0,Math.PI*2);c.stroke();c.restore();}else blob(c,b.x-2,b.y-2,1.6,1.6,'#efe3c8');}},
  slam:{
    step(b,X1,X2,Y1,Y2){b.t++;if(b.t>b.tell+b.hold)b.dead=1;else if(b.t>b.tell&&B.px>b.x-3&&B.px<b.x+b.w+3)bHitMe();},
    draw(c,b){if(b.t<=b.tell){c.save();c.setLineDash([6,4]);c.strokeStyle=RED;c.lineWidth=2;c.globalAlpha=Math.floor(b.t/5)%2?1:0.5;c.strokeRect(b.x,BOX.y,b.w,BOX.h);c.restore();}
      else{c.save();c.fillStyle=INK;c.globalAlpha=0.9;c.fillRect(b.x,BOX.y,b.w,BOX.h);c.restore();blob(c,b.x+b.w/2,BOX.y+BOX.h-4,b.w*0.7,6,INK,0.6);}}},
  ember:{
    step(b,X1,X2,Y1,Y2){b.x+=b.vx;b.ph+=0.11;b.y=b.y0+Math.sin(b.ph)*16;if(b.x>X2+10||b.x<X1-10)b.dead=1;else if(Math.hypot(b.x-B.px,b.y-B.py)<b.r+4)bHitMe();},
    draw(c,b){blob(c,b.x,b.y,b.r,b.r,RED);blob(c,b.x-6,b.y,b.r*0.6,b.r*0.5,RED,0.4);}},
});
