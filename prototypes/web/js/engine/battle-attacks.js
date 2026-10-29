'use strict';
/* 부위 공격 목록. 보스 부위의 atk 에 이름을 적으면 그 공격을 쓴다 (design/data/boss_parts.csv 의 공격 칸).
   ATTACKS[이름]={dur:지속 프레임, tick(t, 상자):탄을 만든다}
   BULLETS[종류]={step(b, 상자):움직이고 맞으면 bHitMe(), 끝나면 b.dead=1, draw(c, b)}
   새 공격은 이 파일에 더하거나, 지역 파일에서 defineAttacks / defineBullets 로 더한다. */
const ATTACKS={},BULLETS={};
function defineAttacks(m){Object.assign(ATTACKS,m);}
function defineBullets(m){Object.assign(BULLETS,m);}

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
