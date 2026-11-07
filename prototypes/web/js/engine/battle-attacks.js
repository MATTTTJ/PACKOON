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
