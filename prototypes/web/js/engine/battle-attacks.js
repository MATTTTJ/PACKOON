'use strict';
/* 부위 공격 목록. 보스 부위의 atk 에 이름을 적으면 그 공격을 쓴다 (design/data/boss_parts.csv 의 공격 칸).
   ATTACKS[이름]={dur:지속 프레임, tick(t, 상자):탄을 만든다}
   BULLETS[종류]={step(b, 상자):움직이고 맞으면 bHitMe(), 끝나면 b.dead=1, draw(c, b)}
   새 공격은 이 파일에 더하거나, 지역 파일에서 defineAttacks / defineBullets 로 더한다. */
const ATTACKS={},BULLETS={};
function defineAttacks(m){Object.assign(ATTACKS,m);}
function defineBullets(m){Object.assign(BULLETS,m);}

/* 무쇠 선택 기능. 작업 예고는 chooseAttack 때 시작해 tell 상태에서도 보인다. */
defineAttacks({
  forgeHammer:{dur:100,tick(){}},
  forgeWind:{dur:100,tick(){}},
  forgeShout:{dur:100,tick(){}},
});
function forgeShelter(x,y){
  const p=coverPoint({u:0.74,v:0.42});
  return Math.abs(x-p.x)<=32&&y>=p.y+12;
}
function forgeWorkHits(b,x,y){
  if(b.k==='forgeHammer')return Math.abs(x-coverPoint(b).x)<=36;
  if(b.k==='forgeWind')return !forgeShelter(x,y);
  const apex=BOX.y-BOX.h*0.15,half=(y-apex)/(BOX.h*1.15)*BOX.w*0.38;
  return Math.abs(x-(BOX.x+BOX.w/2))<=half;
}
function forgeWorkStep(b){
  b.t++;
  if(b.k==='forgeHammer'&&B.survived===3&&b.t===80){
    // 예고는 아직 공격이 아니다. 이번 공격의 종료도 막지 않는다.
    B.forgeNext={k:'forgeWind',t:0,tell:120,hold:28,preview:true};
    B.msg='"아까 배운 대로!" 풀무 바람길도 보인다. 망치가 지나가면 오른쪽 판 뒤로 옮겨라.';
  }
  if(b.t>b.tell+b.hold)b.dead=1;
  else if(b.t>b.tell&&forgeWorkHits(b,B.px,B.py))bHitMe();
}
defineBullets({
  forgeHammer:{step:forgeWorkStep,draw:drawForgeWork},
  forgeWind:{step:forgeWorkStep,draw:drawForgeWork},
  forgeShout:{step:forgeWorkStep,draw:drawForgeWork},
});

/* 빙의 선택 기능 전용. 예고 때 정한 여백과 끝선을 공격 내내 그대로 쓴다. */
defineAttacks({
  hauntedSweep:{dur:145,
    prepare(){return {kind:'sweep',gap:B.round%2?0.25:0.66,half:0.16,side:B.round%2?1:-1};},
    tick(t){if(t===0)B.bullets.push({k:'hauntedSweep',t:0,life:145,...B.attackPlan});}},
  hauntedBeans:{dur:175,
    prepare(){const gap=B.round%2?0.3:0.7;return {kind:'beans',gap,half:0.18,dots:[0.08,0.22,0.36,0.5,0.64,0.78,0.92].filter(u=>Math.abs(u-gap)>0.24)};},
    tick(t){if(t===0||t===40||t===80)for(const u of B.attackPlan.dots)B.bullets.push({k:'hauntedBean',u,t:0,life:90});}},
  hauntedRoll:{dur:140,
    prepare(){return {kind:'roll',side:B.round%2?-1:1,depth:0.62};},
    tick(t){if(t===0)B.bullets.push({k:'hauntedRoll',t:0,grow:70,hold:38,back:30,...B.attackPlan});}},
});
defineBullets({
  hauntedSweep:{
    step(b){b.t++;if(b.t>b.life){b.dead=1;return;}
      const u=b.side>0?-0.05+1.1*b.t/b.life:1.05-1.1*b.t/b.life;
      if(Math.abs(B.px-(BOX.x+u*BOX.w))<11&&Math.abs((B.py-BOX.y)/BOX.h-b.gap)>b.half-5/BOX.h)bHitMe();},
    draw(c,b){const x=BOX.x+(b.side>0?-0.05+1.1*b.t/b.life:1.05-1.1*b.t/b.life)*BOX.w;
      const top=BOX.y+(b.gap-b.half)*BOX.h,bot=BOX.y+(b.gap+b.half)*BOX.h;
      brush(c,[[x,BOX.y],[x-b.side*4,top]],12,INK);brush(c,[[x,bot],[x-b.side*4,BOX.y+BOX.h]],12,INK);
      for(let y=BOX.y+6;y<BOX.y+BOX.h;y+=12)if(y<top-4||y>bot+4)brush(c,[[x,y],[x-b.side*14,y+4]],2,INK,0.65);
    }},
  hauntedBean:{
    step(b){b.t++;if(b.t>b.life){b.dead=1;return;}
      b.v=-0.08+1.16*(b.t/b.life)**1.5;
      const p=coverPoint(b);if(Math.hypot(p.x-B.px,p.y-B.py)<9)bHitMe();},
    draw(c,b){const p=coverPoint(b);blob(c,p.x,p.y,4,3.5,INK);blob(c,p.x-1,p.y-1,1,1,'#f7f4ed');}},
  hauntedRoll:{
    step(b){b.t++;const g=b.grow,h=g+b.hold,end=h+b.back;if(b.t>end){b.dead=1;return;}
      b.d=b.depth*(b.t<=g?b.t/g:b.t<=h?1:1-(b.t-h)/b.back);
      if(b.side<0?B.px<BOX.x+b.d*BOX.w+4:B.px>BOX.x+(1-b.d)*BOX.w-4)bHitMe();},
    draw(c,b){const d=(b.d||0)*BOX.w,x=b.side<0?BOX.x:BOX.x+BOX.w-d,edge=b.side<0?x+d:x;
      c.save();c.fillStyle='rgba(29,24,20,.8)';c.fillRect(x,BOX.y,d,BOX.h);c.restore();
      blob(c,edge,BOX.y+BOX.h/2,7,BOX.h/2,INK);
      for(let y=BOX.y+6;y<BOX.y+BOX.h;y+=12)brush(c,[[edge-5,y],[edge+5,y+4]],2,'#f7f4ed',0.6);
    }},
});

/* 칡 시험판 전용. 예고 중 놓은 고리의 통로를 공격이 끝날 때까지 쓴다. */
defineAttacks({
  kudzuVines:{dur:160,tick(t){if(t===0)B.bullets.push({k:'kudzuVines',t:0});}},
  kudzuRoots:{dur:120,tick(t){if(t===0)B.bullets.push({k:'kudzuRoots',t:0});}},
  kudzuSeeds:{dur:160,tick(t){if(t%52===0&&t<130){
    B.bullets.push({k:'kudzuSeed',u:0.5,v:-0.04,tu:(B.px-BOX.x)/BOX.w,tv:(B.py-BOX.y)/BOX.h,t:0,tell:34});
  }}},
});
function outsideVine(x){const g=vineBounds();return Math.abs(x-g.x)>g.w/2-8;}
/* 붓의 둥근 끝과 가시도 안전한 여백을 침범하지 않게 잘라 그린다. */
function clipVineDanger(c){
  const g=vineBounds();c.beginPath();c.rect(BOX.x,BOX.y,g.x-g.w/2-BOX.x,BOX.h);
  c.rect(g.x+g.w/2,BOX.y,BOX.x+BOX.w-g.x-g.w/2,BOX.h);c.clip();
}
defineBullets({
  kudzuVines:{
    step(b){
      b.t++;const speed=1.65;
      for(const delay of [0,64]){const y=BOX.y-12+(b.t-delay)*speed;
        if(b.t>=delay&&Math.abs(B.py-y)<12&&outsideVine(B.px))bHitMe();}
      if(BOX.y-12+(b.t-64)*speed>BOX.y+BOX.h+16)b.dead=1;
    },
    draw(c,b){c.save();clipVineDanger(c);
      for(const delay of [0,64]){if(b.t<delay)continue;const y=BOX.y-12+(b.t-delay)*1.65;
        brush(c,[[BOX.x-4,y],[BOX.x+BOX.w/2,y-3],[BOX.x+BOX.w+4,y]],10,INK);
        for(let x=BOX.x+6;x<BOX.x+BOX.w;x+=16)brush(c,[[x,y],[x+5,y+9]],2,INK);
      }c.restore();
    }},
  kudzuRoots:{
    step(b){b.t++;if(b.t>96){b.dead=1;return;}
      if(b.t>32&&outsideVine(B.px)&&B.py>BOX.y+BOX.h-Math.min(BOX.h,(b.t-32)*BOX.h/16)-5)bHitMe();
    },
    draw(c,b){if(b.t<=32)return;const h=Math.min(BOX.h,(b.t-32)*BOX.h/16);c.save();clipVineDanger(c);
      for(let x=BOX.x+5;x<BOX.x+BOX.w;x+=15)brush(c,[[x,BOX.y+BOX.h+5],[x-4,BOX.y+BOX.h-h+12],[x+2,BOX.y+BOX.h-h]],15,INK);
      c.restore();
    }},
  kudzuSeed:{
    step(b){b.t++;
      if(b.t<=b.tell){if(b.t===b.tell){const a=Math.atan2((b.tv-b.v)*BOX.h,(b.tu-b.u)*BOX.w);b.vx=Math.cos(a)*2;b.vy=Math.sin(a)*2;}return;}
      b.u+=b.vx/BOX.w;b.v+=b.vy/BOX.h;const p=coverPoint(b);
      if(Math.hypot(p.x-B.px,p.y-B.py)<11){bHitMe();b.dead=1;}
      else if(b.u<-.08||b.u>1.08||b.v>1.12||b.v<-.15)b.dead=1;
    },
    draw(c,b){const p=coverPoint(b),tx=BOX.x+b.tu*BOX.w,ty=BOX.y+b.tv*BOX.h;
      brush(c,[[BOX.x+BOX.w/2,BOX.y],[tx,ty]],1.1,INK,0.22);
      drawVineAim(c,tx,ty,Math.min(1,b.t/b.tell),b.t<=b.tell?0.7:0.25);
      if(b.t>b.tell){blob(c,p.x,p.y,6,6,INK);brush(c,[[p.x-3,p.y-2],[p.x+1,p.y-3]],1,'#f7f4ed');}
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
/* 그린 먹과 피격 판정에 같은 범위를 쓴다. 온기 길은 이 범위보다 우선한다. */
function winterThreat(kind,t,x,y){
  if(t<=30)return false;
  const u=(x-BOX.x)/BOX.w,v=(y-BOX.y)/BOX.h;
  if(kind==='mouth')return Math.abs(v-((t-30)%100)/80)<0.18;
  if(kind==='body'){const depth=Math.min(0.46,(t-30)/180);return u<depth||u>1-depth;}
  if(kind==='tail'){
    const fall=((t-30)%80)/65;
    return Math.abs(v-fall)<0.14&&Math.abs(u*8-Math.round(u*8))<0.2;
  }
  // 머리를 드러낸 뒤에도 눈보라는 남는다. 읽을 수 있는 두 띠가 회전한다.
  const a=(t-30)*0.025,dx=(u-0.5)*BOX.w,dy=(v-0.5)*BOX.h;
  return Math.abs(dx*Math.cos(a)+dy*Math.sin(a))<28;
}
defineBullets({gangcheolWinter:{
  step(b){b.t++;if(b.t>=b.life){b.dead=1;return;}
    if(!warmSafe(B.px,B.py)&&winterThreat(b.kind,b.t,B.px,B.py))bHitMe();
  },
  draw(c,b){drawWinterThreat(c,b.kind,b.t);},
}});

/* 골렘 시험판 전용. 기존 공격과 탄은 건드리지 않는다. */
defineAttacks({
  golemPillar:{dur:105,tick(t){if(t===0){
    const u=clamp((B.px-BOX.x)/BOX.w,0.16,0.84);
    B.bullets.push({k:'golemPillar',u,v:0.5,t:0,tell:40,hold:30});
  }}},
  golemSweep:{dur:130,tick(t){if(t===0){
    B.bullets.push({k:'golemSweep',t:0,tell:38,y:BOX.y-10,gap:B.round%2?0.08:0.72});
  }}},
  golemThrow:{dur:135,tick(t){if(t===0){
    const eye=B.E.headPose();
    B.bullets.push({k:'golemThrow',x:eye.x,y:eye.y,tx:B.px,ty:B.py,t:0,tell:38});
  }}},
});
defineBullets({
  golemPillar:{
    step(b){b.t++;if(b.t>b.tell+b.hold){addCover(b.u,b.v);b.dead=1;}
      else if(b.t>b.tell&&Math.abs(B.px-coverPoint(b).x)<23)bHitMe();},
    draw(c,b){const p=coverPoint(b);
      if(b.t<=b.tell){for(let i=0;i<5;i++)brush(c,[[p.x-14+(i%2)*7,BOX.y+i*BOX.h/5],[p.x+10,BOX.y+(i+0.5)*BOX.h/5],[p.x-9,BOX.y+(i+1)*BOX.h/5]],1.6,RED,0.65);}
      else{brush(c,[[p.x,BOX.y+BOX.h],[p.x-4,BOX.y+10]],32,INK);brush(c,[[p.x-9,BOX.y+BOX.h],[p.x+3,BOX.y+18]],4,'#e6e2da',0.55);}
    }},
  golemSweep:{
    step(b){b.t++;if(b.t<=b.tell)return;b.y+=2.4;
      if(b.y>BOX.y+BOX.h+12){b.dead=1;return;}
      const gap=BOX.x+b.gap*BOX.w;
      if(Math.abs(B.py-b.y)<12&&!(B.px>gap+4&&B.px<gap+54)&&!coverBehind(B.px,B.py))bHitMe();},
    draw(c,b){const gap=BOX.x+b.gap*BOX.w;
      if(b.t<=b.tell){c.save();c.globalAlpha=0.1; c.fillStyle=INK;c.fillRect(BOX.x,BOX.y,BOX.w,BOX.h);c.fillStyle='#f7f4ed';c.fillRect(gap,BOX.y,58,BOX.h);c.restore();
        for(const r of B.covers){const p=coverPoint(r);c.fillStyle='#f7f4ed';c.fillRect(p.x-22,p.y+10,44,BOX.y+BOX.h-p.y-10);}
      }
      const y=b.t<=b.tell?BOX.y+12:b.y,col=b.t<=b.tell?RED:INK;
      // 붓질에도 안전한 여백을 남긴다.
      const safe=[[gap,gap+58],...B.covers.map(r=>{const p=coverPoint(r);return y>p.y+10?[p.x-22,p.x+22]:[0,0];})];
      for(let x=BOX.x;x<BOX.x+BOX.w;x+=4)if(!safe.some(([a,z])=>x>=a&&x<=z))brush(c,[[x,y],[x+3,y+1]],b.t<=b.tell?5:15,col,0.85);
    }},
  golemThrow:{
    step(b){b.t++;
      if(b.t<=b.tell){if(b.t===b.tell){const a=Math.atan2(b.ty-b.y,b.tx-b.x);b.vx=Math.cos(a)*4.2;b.vy=Math.sin(a)*4.2;}return;}
      const ox=b.x,oy=b.y;b.x+=b.vx;b.y+=b.vy;
      // 선분을 돌의 타원에 대조해 빠른 돌도 엄폐물을 통과하지 않게 한다.
      for(const r of B.covers){const p=coverPoint(r),dx=b.x-ox,dy=b.y-oy;
        const q=clamp(((p.x-ox)*dx+(p.y-oy)*dy)/(dx*dx+dy*dy),0,1);
        if(((ox+q*dx-p.x)/31)**2+((oy+q*dy-p.y)/21)**2<=1){damageCover(r);b.dead=1;return;}
      }
      if(Math.hypot(b.x-B.px,b.y-B.py)<13){
        // 비스듬한 먹선에서도 표시한 흰 엄폐 범위와 안전 판정을 맞춘다.
        const shelter=coverBehind(B.px,B.py);if(shelter)damageCover(shelter);else bHitMe();b.dead=1;
      }
      else if(b.y>BOX.y+BOX.h+25||b.x<BOX.x-100||b.x>BOX.x+BOX.w+100||b.y<0)b.dead=1;
    },
    draw(c,b){if(b.t>b.tell){blob(c,b.x,b.y,10,8,INK);brush(c,[[b.x-5,b.y-3],[b.x+3,b.y-4]],2,'#f7f4ed');}}
  },
});

defineAttacks({
  /* 틈이 하나 있는 가로줄이 위에서 내려온다 */
  sweep:{dur:160,tick(t,X,Y,W,Hh){if(t%52===0){const gw=58;const gx=X+14+Math.random()*(W-gw-28);B.bullets.push({k:'bar',y:Y-8,vy:1.55,gx,gw,th:9});}}},
  /* 바닥 점선 예고 후 가시가 솟는다 */
  spike:{dur:150,tick(t,X,Y,W,Hh){if(t%28===0&&t<126){const x=X+18+Math.random()*(W-36);B.bullets.push({k:'spike',x,w:26,t:0,tell:36,up:24,maxh:Hh*0.6,h:0});}}},
  /* 손을 조준한 씨앗 */
  seed:{dur:130,tick(t,X,Y,W,Hh){if(t%22===0){const sx=X+W/2+(Math.random()-.5)*60,sy=Y-6;const a=Math.atan2(B.py-sy,B.px-sx);B.bullets.push({k:'seed',x:sx,y:sy,vx:Math.cos(a)*2.4,vy:Math.sin(a)*2.4,r:6});}}},
  /* 세로 줄 예고 후 내려친다 */
  slam:{dur:150,tick(t,X,Y,W,Hh){if(t%44===0&&t<130){const w=58;const x=X+Math.random()*(W-w);B.bullets.push({k:'slam',x,w,t:0,tell:34,hold:14});}}},
  /* 물결치며 옆에서 날아오는 불씨 */
  ember:{dur:140,tick(t,X,Y,W,Hh){if(t%13===0){const y=Y+12+Math.random()*(Hh-24);B.bullets.push({k:'ember',x:X-8,y0:y,y,vx:2.2,ph:Math.random()*6,r:5});}}},
  /* 손을 향해 세 갈래로 퍼지는 호통 */
  shout:{dur:130,tick(t,X,Y,W,Hh){if(t%42===0){const sx=X+W/2,sy=Y-6;const a0=Math.atan2(B.py-sy,B.px-sx);for(let i=-1;i<=1;i++){const a=a0+i*0.3;B.bullets.push({k:'seed',x:sx,y:sy,vx:Math.cos(a)*2.1,vy:Math.sin(a)*2.1,r:7,ring:true});}}}},
});

defineBullets({
  bar:{
    step(b,X1,X2,Y1,Y2){b.y+=b.vy;if(b.y>Y2+8)b.dead=1;else if(Math.abs(B.py-b.y)<b.th/2+4&&!(B.px>b.gx+4&&B.px<b.gx+b.gw-4))bHitMe();},
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
    step(b,X1,X2,Y1,Y2){b.x+=b.vx;b.ph+=0.11;b.y=b.y0+Math.sin(b.ph)*16;if(b.x>X2+10)b.dead=1;else if(Math.hypot(b.x-B.px,b.y-B.py)<b.r+4)bHitMe();},
    draw(c,b){blob(c,b.x,b.y,b.r,b.r,RED);blob(c,b.x-6,b.y,b.r*0.6,b.r*0.5,RED,0.4);}},
});
