'use strict';
/* 북쪽 영산 전투: 강철이 (용이 되지 못한 이무기). 원본 표: design/data/bosses.csv · boss_parts.csv
   부위 공격 넷 (boss_parts.csv 의 공격 칸):
   frostBreath 입: 상자 위쪽부터 얼어붙는 띠가 내려옴
   coil        몸통: 양옆에서 휘감아 조여 피할 자리가 좁아짐
   icicleTail  꼬리: 고드름을 흩뿌리는 꼬리 내려치기
   blizzard    머리: 손을 노리는 눈보라 소용돌이
   머리는 몸통을 부숴야 드러난다 (coreNeeds) */
(()=>{
defineAttacks({
  frostBreath:{dur:150,tick(t,X,Y,W,Hh){if(t===0)B.bullets.push({k:'frost',t:0,tell:30,grow:26,hold:30,depth:Hh*0.5,d:0});}},
  coil:{dur:150,tick(t,X,Y,W,Hh){if(t===0)B.bullets.push({k:'squeeze',t:0,tell:30,grow:30,hold:34,depth:W*0.33,d:0,shift:(Math.random()-.5)*W*0.2});}},
  icicleTail:{dur:150,tick(t,X,Y,W,Hh){if(t%30===0&&t<120){for(let i=0;i<4;i++){const x=X+14+Math.random()*(W-28);B.bullets.push({k:'icicle',x,y:Y-8,vy:0,t:0,tell:28});}}}},
  blizzard:{dur:150,tick(t,X,Y,W,Hh){if(t%10===0&&t<120){const sx=X+W/2,sy=Y-10;const a=t*0.09;for(let i=0;i<2;i++){const aa=a+i*Math.PI;const toward=Math.atan2(B.py-sy,B.px-sx);const dir=toward+Math.sin(aa)*0.9;B.bullets.push({k:'seed',x:sx,y:sy,vx:Math.cos(dir)*1.9,vy:Math.sin(dir)*1.9,r:5});}}}},
});
defineBullets({
  frost:{
    step(b,X1,X2,Y1,Y2){b.t++;const T=b.tell,G2=T+b.grow,H2=G2+b.hold,E=H2+b.grow;
      b.d=b.t<=T?0:b.t<=G2?b.depth*(b.t-T)/b.grow:b.t<=H2?b.depth:b.t<=E?b.depth*(1-(b.t-H2)/b.grow):0;
      if(b.t>E){b.dead=1;return;}if(b.d>0&&B.py<Y1+b.d+4)bHitMe();},
    draw(c,b){const X=BOX.x,Wd=BOX.w,Y=BOX.y;
      if(b.t<=b.tell){c.save();c.setLineDash([6,4]);c.strokeStyle=RED;c.lineWidth=2;c.globalAlpha=Math.floor(b.t/5)%2?1:0.5;c.beginPath();c.moveTo(X,Y+b.depth);c.lineTo(X+Wd,Y+b.depth);c.stroke();c.restore();return;}
      c.save();c.fillStyle='rgba(29,24,20,.7)';c.fillRect(X,Y,Wd,b.d);c.restore();
      for(let x=X+8;x<X+Wd;x+=16)brush(c,[[x,Y+b.d-2],[x+4,Y+b.d+8]],3,INK,0.8);}},
  squeeze:{
    step(b,X1,X2,Y1,Y2){b.t++;const T=b.tell,G2=T+b.grow,H2=G2+b.hold,E=H2+b.grow;
      b.d=b.t<=T?0:b.t<=G2?b.depth*(b.t-T)/b.grow:b.t<=H2?b.depth:b.t<=E?b.depth*(1-(b.t-H2)/b.grow):0;
      if(b.t>E){b.dead=1;return;}const l=X1+b.d+b.shift,r=X2-b.d+b.shift;if(b.d>0&&(B.px<l+4||B.px>r-4))bHitMe();},
    draw(c,b){const X=BOX.x,Wd=BOX.w,Y=BOX.y,Hh=BOX.h;const l=X+b.depth+b.shift,r=X+Wd-b.depth+b.shift;
      if(b.t<=b.tell){c.save();c.setLineDash([6,4]);c.strokeStyle=RED;c.lineWidth=2;c.globalAlpha=Math.floor(b.t/5)%2?1:0.5;c.beginPath();c.moveTo(l,Y);c.lineTo(l,Y+Hh);c.moveTo(r,Y);c.lineTo(r,Y+Hh);c.stroke();c.restore();return;}
      const L=X+b.d+b.shift,Rr=X+Wd-b.d+b.shift;c.save();c.fillStyle='rgba(29,24,20,.75)';c.fillRect(X,Y,L-X,Hh);c.fillRect(Rr,Y,X+Wd-Rr,Hh);c.restore();
      for(let y=Y+10;y<Y+Hh;y+=18){brush(c,[[L-10,y],[L,y+8]],4,INK);brush(c,[[Rr+10,y],[Rr,y+8]],4,INK);}}},
  icicle:{
    step(b,X1,X2,Y1,Y2){b.t++;if(b.t<=b.tell)return;b.vy=Math.min(4.2,b.vy+0.18);b.y+=b.vy;if(b.y>Y2+10)b.dead=1;else if(Math.abs(b.x-B.px)<6&&Math.abs(b.y-B.py)<12)bHitMe();},
    draw(c,b){if(b.t<=b.tell){c.save();c.globalAlpha=Math.floor(b.t/4)%2?0.9:0.4;c.fillStyle=RED;c.fillRect(b.x-1,BOX.y+2,2,8);c.restore();return;}
      c.fillStyle=INK;c.beginPath();c.moveTo(b.x-5,b.y-14);c.lineTo(b.x+5,b.y-14);c.lineTo(b.x,b.y+6);c.closePath();c.fill();}},
});

function drawGangcheol(c){
  const cx=LW/2,cy=EY;const mouth=part('mouth'),body=part('body'),tail=part('tail'),head=part('core');
  const wave=Math.sin(B.time*0.04)*8;
  // 꼬리 (오른쪽 아래)
  {const o=shk(tail),col=partCol(tail);const a=tail.broken?0.3:1;const lift=B.st==='tell'&&B.cur===tail?-20:0;
    brush(c,[[cx+60+o,cy+70],[cx+130+o,cy+60+lift],[cx+170+o,cy+20+lift+wave],[cx+150+o,cy-10+lift]],10,col,a);
    if(!tail.broken)for(let i=0;i<4;i++){const tx=cx+120+i*14+o,ty=cy+54-i*14+lift;c.save();c.fillStyle=INK;c.globalAlpha=a;c.beginPath();c.moveTo(tx-4,ty);c.lineTo(tx+4,ty);c.lineTo(tx,ty+14);c.closePath();c.fill();c.restore();}}
  // 몸통 (휘감은 똬리)
  {const o=shk(body),col=partCol(body);const a=body.broken?0.3:1;const tight=B.st==='tell'&&B.cur===body?-10:0;
    brush(c,[[cx-150+o,cy+70],[cx-90+o,cy+40+wave+tight],[cx-10+o,cy+80],[cx+60+o,cy+50-wave+tight],[cx+60+o,cy+70]],26,col,a*0.9);
    brush(c,[[cx-130+o,cy+86],[cx-40+o,cy+92],[cx+40+o,cy+88]],18,col,a*0.75);
    if(!body.broken)for(let i=0;i<9;i++){const sx=cx-130+i*24+o,sy=cy+60+Math.sin(i*1.3)*14;brush(c,[[sx-6,sy],[sx,sy-6],[sx+6,sy]],2,'#efe3c8',0.6);}}
  // 머리와 입
  {const o=shk(head),col=partCol(head);const hidden=coreHidden();const hx=cx-70+o,hy=cy-10+wave*0.5+(hidden?16:0);
    brush(c,[[cx-120+o,cy+50],[hx-10,hy+30],[hx,hy+6]],20,partCol(body),body.broken?0.3:0.9);
    blob(c,hx,hy,34,24,col===INK?'#231e19':col,head.broken?0.3:1);
    brush(c,[[hx-26,hy-16],[hx-34,hy-36]],5,INK,head.broken?0.3:1);brush(c,[[hx-6,hy-20],[hx-4,hy-40]],5,INK,head.broken?0.3:1);   // 뿔이 되다 만 혹
    // 입 (서리 숨)
    const mo=shk(mouth),mc=partCol(mouth);const open=B.st==='tell'&&B.cur===mouth?10:mouth.broken?0:4;
    brush(c,[[hx+18+mo,hy+6],[hx+38+mo,hy+4+open*0.3]],6,mc,mouth.broken?0.3:1);brush(c,[[hx+18+mo,hy+14],[hx+38+mo,hy+16+open]],6,mc,mouth.broken?0.3:1);
    if(!mouth.broken){brush(c,[[hx+30,hy+2],[hx+70,hy-10],[hx+96,hy+6]],2,INK,0.6);brush(c,[[hx+30,hy+18],[hx+66,hy+34],[hx+92,hy+28]],2,INK,0.6);}   // 수염
    if(head.broken){brush(c,[[hx-14,hy-2],[hx-4,hy]],3,'#efe3c8');}
    else{const [ex,ey]=lookAt(hx,hy);blob(c,hx-4,hy-4,8,7,'#efe3c8');blob(c,hx-4+ex,hy-4+ey,3.5,4,INK);}
    if(B.st==='end'&&B.result==='calm'){brush(c,[[hx-10,hy-4],[hx+2,hy-2]],3,'#efe3c8');}
    if(hidden){brush(c,[[hx-50,hy-10],[hx,hy+20],[hx+50,hy-12]],10,INK,0.8);}
  }
}

defineEnemies({
  gangcheol:{name:'강철이',calmLabel:'진정',coreNeeds:'body',
    intro:'호수를 휘감은 이무기가 고개를 든다. 숨결마다 서리가 내린다.',
    parts:[
      {id:'mouth',name:'입',hp:3,atk:'frostBreath',mat:'frost_whisker',tell:'강철이가 서리 숨을 들이마신다…'},
      {id:'body',name:'몸통',hp:4,atk:'coil',mat:'ice_scale',tell:'똬리가 조여 든다…'},
      {id:'tail',name:'꼬리',hp:3,atk:'icicleTail',mat:'icicle',tell:'꼬리가 높이 치켜든다…'},
      {id:'core',name:'머리',hp:5,atk:'blizzard',mat:'broken_orb',core:true,tell:'눈보라가 소용돌이친다…'}],
    likes:{dokkaebibul:100,patsirutteok:60},likeText:'강철이가 잠시 숨을 멈춘다.',
    likeTexts:{dokkaebibul:'꺼지지 않는 도깨비불씨를 건넸다. 강철이가 그 온기에 눈을 감는다.',
      patsirutteok:'붉은 팥떡을 내밀자 강철이가 움찔 물러난다. 서리가 조금 걷혔다.'},
    coreHidden:'머리가 똬리 속에 파묻혀 있다. 몸통을 먼저 풀어야 한다.',
    coreShown:'똬리가 풀렸다! 이제 머리를 노릴 수 있다.',
    calmWin:'강철이가 서리를 거두고, 따뜻한 남쪽 바다를 향해 천천히 날아오른다.',calmGift:'frost_whisker',
    win:'여의주에 금이 가자 강철이가 호수를 놓고 물러난다.',
    lose:'눈보라에 휩쓸려 호숫가로 밀려났다.',
    draw:drawGangcheol},
});
})();
