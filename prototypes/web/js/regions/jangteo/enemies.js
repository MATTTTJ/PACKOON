'use strict';
/* 큰 장터 전투: 헌물 도깨비 (낡은 빗자루·키·멍석에 깃든 도깨비). 원본 표: design/data/bosses.csv · boss_parts.csv
   [시험판] possession 설정으로 불 이동과 헌물별 예고 공격을 켠다. 아래 기존 공격 넷은 보존한다:
   broomSweep 빗자루가 상자를 가로질러 쓸고 지나감, 쓸리지 않는 줄 하나로 피함
   beans      키로 까부른 콩이 위에서 흩어져 떨어짐
   roll       멍석이 한쪽 끝부터 말려 들어와 피할 자리가 좁아짐
   wisp       도깨비불이 손을 느리게 따라옴
   전투 화면은 흑백 + 단청 붉은색 하나라서, 도깨비불은 필드와 달리 붉게 그린다 */
(()=>{
/* 그림과 불 이동·되치기 연결선이 함께 쓰는 실제 헌물 위치. */
function dokkaebiPose(id){
  const cx=LW/2,cy=EY,hop=Math.abs(Math.sin(B.time*0.06))*6,o=shk(part(id));
  if(id==='broom')return {x:cx-124+o,y:cy+40-hop};
  if(id==='ki')return {x:cx+128+o,y:cy-6-hop+(B.st==='tell'&&B.cur===part('ki')?-16:0)};
  if(id==='meongseok')return {x:cx+o,y:cy+70};
  return {x:cx+o,y:cy-30-hop};
}
defineAttacks({
  broomSweep:{dur:170,tick(t,X,Y,W,Hh){if(t%56===0&&t<150){const dir=(t/56)%2?-1:1;const gh=34;const gy=Y+10+Math.random()*(Hh-gh-20);B.bullets.push({k:'sweepv',x:dir>0?X-10:X+W+10,vx:dir*2.1,gy,gh,th:12});}}},
  beans:{dur:150,tick(t,X,Y,W,Hh){if(t%36===0&&t<120){for(let i=0;i<5;i++){const x=X+16+Math.random()*(W-32);B.bullets.push({k:'bean',x,y:Y-6,vx:(Math.random()-.5)*0.6,vy:-1.4-Math.random(),t:0,tell:26,r:4});}}}},
  roll:{dur:160,tick(t,X,Y,W,Hh){if(t===0||t===80){const s=t===0?(Math.random()<.5?-1:1):-(B.lastRoll||1);B.lastRoll=s;B.bullets.push({k:'roll',side:s,t:0,tell:30,grow:24,hold:20,depth:W*0.46,d:0});}}},
  wisp:{dur:150,tick(t,X,Y,W,Hh){if(t===0||t===60){const sx=X+W*(t===0?0.25:0.75),sy=Y-6;B.bullets.push({k:'wisp',x:sx,y:sy,t:0,life:130,r:7});}}},
});
defineBullets({
  sweepv:{
    step(b,X1,X2,Y1,Y2){b.x+=b.vx;if(b.x<X1-20||b.x>X2+20)b.dead=1;else if(Math.abs(B.px-b.x)<b.th/2+4&&!(B.py>b.gy+4&&B.py<b.gy+b.gh-4))bHitMe();},
    draw(c,b){brush(c,[[b.x,BOX.y-4],[b.x+(b.vx>0?-3:3),b.gy]],b.th,INK);brush(c,[[b.x,b.gy+b.gh],[b.x+(b.vx>0?-3:3),BOX.y+BOX.h+4]],b.th,INK);
      for(let y=BOX.y+4;y<BOX.y+BOX.h;y+=10){if(y>b.gy-4&&y<b.gy+b.gh+4)continue;brush(c,[[b.x,y],[b.x-(b.vx>0?12:-12),y+4]],2,INK,0.7);}}},
  bean:{
    step(b,X1,X2,Y1,Y2){b.t++;if(b.t<=b.tell)return;b.vy+=0.07;b.x+=b.vx;b.y+=b.vy;if(b.y>Y2+10)b.dead=1;else if(b.y>Y1&&Math.hypot(b.x-B.px,b.y-B.py)<b.r+4)bHitMe();},
    draw(c,b){if(b.t<=b.tell){c.save();c.globalAlpha=Math.floor(b.t/4)%2?0.9:0.4;c.fillStyle=RED;c.fillRect(b.x-1,BOX.y+2,2,6);c.restore();return;}
      blob(c,b.x,Math.max(b.y,BOX.y-2),b.r,b.r*0.85,INK);blob(c,b.x-1,Math.max(b.y,BOX.y-2)-1,1.4,1.2,'#efe3c8');}},
  roll:{
    step(b,X1,X2,Y1,Y2){b.t++;const T=b.tell,G2=T+b.grow,H2=G2+b.hold,E=H2+b.grow;
      b.d=b.t<=T?0:b.t<=G2?b.depth*(b.t-T)/b.grow:b.t<=H2?b.depth:b.t<=E?b.depth*(1-(b.t-H2)/b.grow):0;
      if(b.t>E){b.dead=1;return;}
      if(b.d>0&&(b.side<0?B.px<X1+b.d+4:B.px>X2-b.d-4))bHitMe();},
    draw(c,b){const X=BOX.x,Wd=BOX.w,Y=BOX.y,Hh=BOX.h;
      if(b.t<=b.tell){c.save();c.setLineDash([6,4]);c.strokeStyle=RED;c.lineWidth=2;c.globalAlpha=Math.floor(b.t/5)%2?1:0.5;const lx=b.side<0?X+b.depth:X+Wd-b.depth;c.beginPath();c.moveTo(lx,Y);c.lineTo(lx,Y+Hh);c.stroke();c.restore();return;}
      const x0=b.side<0?X:X+Wd-b.d;c.save();c.fillStyle='rgba(29,24,20,.82)';c.fillRect(x0,Y,b.d,Hh);c.restore();
      const ex=b.side<0?X+b.d:X+Wd-b.d;blob(c,ex,Y+Hh/2,9,Hh/2,INK);for(let y=Y+6;y<Y+Hh;y+=12)brush(c,[[ex-6,y],[ex+6,y+4]],2,'#efe3c8',0.5);}},
  wisp:{
    step(b,X1,X2,Y1,Y2){b.t++;if(b.t>b.life){b.dead=1;return;}const a=Math.atan2(B.py-b.y,B.px-b.x);const sp=b.t<20?0.4:1.05;b.x+=Math.cos(a)*sp;b.y+=Math.sin(a)*sp;if(b.t>20&&Math.hypot(b.x-B.px,b.y-B.py)<b.r+4)bHitMe();},
    draw(c,b){const f=1-Math.max(0,(b.t-b.life+20)/20);const fl=Math.sin(B.time*0.4+b.x)*2;
      blob(c,b.x,b.y,b.r,b.r+2,RED,0.85*f);blob(c,b.x,b.y-b.r-2+fl,b.r*0.55,b.r*0.9,RED,0.55*f);blob(c,b.x-2,b.y-1,2,2,'#efe3c8',f);blob(c,b.x+2,b.y-1,2,2,'#efe3c8',f);}},
});

function drawDokkaebi(c){
  const cx=LW/2,cy=EY;const broom=part('broom'),ki=part('ki'),mat=part('meongseok'),core=part('core');
  const hop=Math.abs(Math.sin(B.time*0.06))*6;
  // 멍석 (아래, 몸통)
  {const o=shk(mat),col=partCol(mat);const a=mat.broken?0.3:1;
    c.save();c.globalAlpha=a*0.25;c.fillStyle=col===INK?'#3a3028':col;c.beginPath();c.ellipse(cx+o,cy+70,96,34,0,0,Math.PI*2);c.fill();c.restore();
    for(let i=0;i<6;i++)brush(c,[[cx-90+o,cy+52+i*7],[cx+o,cy+56+i*7+(i%2?4:-2)],[cx+90+o,cy+52+i*7]],4,col,a*0.9);
    blob(c,cx+92+o,cy+70,14,26,col===INK?'#2a2420':col,a);brush(c,[[cx+86+o,cy+50],[cx+98+o,cy+90]],2,'#efe3c8',a*0.4);}
  // 빗자루 (왼쪽)
  {const o=shk(broom),col=partCol(broom);const a=broom.broken?0.3:1;const tilt=B.st==='tell'&&B.cur===broom?-0.3:0;
    const bx=cx-130+o,by=cy+10-hop;brush(c,[[bx+40,by-70],[bx+6,by+30+tilt*60]],6,'#5a3e26',a);
    for(let i=-4;i<=4;i++)brush(c,[[bx+6,by+30],[bx-10+i*5,by+86+Math.abs(i)*2]],3,col,a*0.9);
    brush(c,[[bx-6,by+40],[bx+18,by+40]],4,col,a);}
  // 키 (오른쪽)
  {const o=shk(ki),col=partCol(ki);const a=ki.broken?0.3:1;const lift=B.st==='tell'&&B.cur===ki?-16:0;
    const kx=cx+128+o,ky=cy-6+lift-hop;c.save();c.globalAlpha=a*0.3;c.fillStyle=col===INK?'#3a3028':col;c.beginPath();c.ellipse(kx,ky,44,30,0.2,0,Math.PI*2);c.fill();c.restore();
    brush(c,[[kx-44,ky+6],[kx-30,ky-24],[kx+10,ky-30],[kx+44,ky-10],[kx+34,ky+24],[kx-20,ky+30],[kx-44,ky+6]],4,col,a);
    for(let i=0;i<4;i++)brush(c,[[kx-30+i*16,ky-20],[kx-26+i*16,ky+22]],2,col,a*0.6);
    if(!ki.broken)for(let i=0;i<5;i++)blob(c,kx-20+i*10,ky-38-((i*7)%10)-hop,3,3,INK);}
  // 도깨비불 (가운데 위, 눈이 있는 불)
  {const col=partCol(core),loc=B.E.possession?possessionPoint():null;
    const hx=loc?cx+(loc.x-cx)/0.84:cx+shk(core),hy=loc?cy+(loc.y-cy)/0.84:cy-30-hop;const fl=Math.sin(B.time*0.25)*4;
    const fire=core.broken?'rgba(29,24,20,.2)':(col===INK?FIRE:col);   // 평소엔 주황 불, 노릴 때만 붉은 표시
    blob(c,hx,hy+6,30,26,fire,core.broken?1:0.75);blob(c,hx-6,hy-22+fl,14,22,fire,core.broken?1:0.55);blob(c,hx+10,hy-30-fl,8,16,fire,core.broken?1:0.45);
    if(!core.broken){const [ex,ey]=lookAt(hx,hy);blob(c,hx-11,hy+4,7,8,'#efe3c8');blob(c,hx+11,hy+4,7,8,'#efe3c8');blob(c,hx-11+ex,hy+4+ey,3.2,3.8,INK);blob(c,hx+11+ex,hy+4+ey,3.2,3.8,INK);
      brush(c,[[hx-12,hy+20],[hx-4,hy+24],[hx+4,hy+20],[hx+12,hy+24]],3,INK);
      brush(c,[[hx-8,hy-16],[hx-14,hy-30]],4,INK);}   // 뿔 하나
    else{brush(c,[[hx-16,hy+4],[hx-6,hy+6]],3,INK,0.5);brush(c,[[hx+6,hy+6],[hx+16,hy+4]],3,INK,0.5);}
    if(coreHidden()&&!B.E.possession){brush(c,[[hx-60,hy-10],[hx,hy+26],[hx+60,hy-14]],9,INK,0.8);brush(c,[[hx-50,hy+30],[hx+8,hy-2],[hx+56,hy+28]],8,INK,0.75);}
  }
}

/* 결정 D-62: 모든 전투 배경은 상대 뒤쪽 화면 전체로 그린다 (design/data/decisions.csv).
   헌물 도깨비는 그믐밤 보부상 숙소 창고. 어둑한 판자벽과 대들보, 걸린 등불 하나, 헌 멍석·키·빗자루 더미와 설 대목 짐.
   도깨비가 깃든 헌물은 앞에서 따로 그리므로, 뒤쪽 더미는 흐리게 둔다. */
function drawStoreRoom(c){
  const t=B.time,still=Vfx.reducedMotion,gy=BOX.y-52,WOOD='rgba(110,82,58,';
  c.save();c.fillStyle='rgba(38,36,54,.2)';c.fillRect(0,0,LW,LH);c.restore();
  // 판자벽과 대들보
  c.save();c.fillStyle=WOOD+'.13)';c.fillRect(0,0,LW,gy);c.restore();
  for(let x=18;x<LW;x+=38){brush(c,[[x,0],[x+(hash(x)*4-2),gy]],1.3,INK,0.16+hash(x*0.3)*0.08);}
  brush(c,[[0,30],[LW,24]],10,'#4a3a2c',0.55);brush(c,[[0,30],[LW,24]],2,INK,0.5);
  for(const x of [LW*0.04,LW*0.96])brush(c,[[x,0],[x,gy]],9,'#4a3a2c',0.45);
  // 등불: 대들보에 걸린 붉은 종이 등과 따뜻한 빛
  {const lx=LW*0.3,ly=64,   // 오른쪽 위 체력·진정 표시와 겹치지 않게 왼쪽 대들보에 건다
   fl=still?1:1+Math.sin(t*0.19)*0.05+Math.sin(t*0.47)*0.04;
    const g=c.createRadialGradient(lx,ly,4,lx,ly,LW*0.3*fl);g.addColorStop(0,'rgba(236,178,92,.42)');g.addColorStop(0.45,'rgba(220,150,80,.14)');g.addColorStop(1,'rgba(220,150,80,0)');
    c.save();c.fillStyle=g;c.fillRect(0,0,LW,LH);c.restore();
    brush(c,[[lx,28],[lx,ly-18]],1.5,INK,0.6);
    blob(c,lx,ly,14,18,RED,0.75);blob(c,lx,ly,7,11,'#f2b04a',0.75);
    brush(c,[[lx-12,ly-16],[lx+12,ly-16]],3,INK,0.7);brush(c,[[lx-12,ly+16],[lx+12,ly+16]],3,INK,0.7);
    brush(c,[[lx,ly+16],[lx,ly+28]],1.5,RED,0.7);}
  // 바닥
  c.save();c.fillStyle=WOOD+'.12)';c.fillRect(0,gy,LW,LH-gy);c.restore();
  brush(c,[[0,gy],[LW,gy+2]],4,INK,0.5);
  // 왼쪽: 말아 세운 헌 멍석들과 기대 놓은 빗자루
  for(let i=0;i<3;i++){const x=LW*0.07+i*22,h=70-i*10;
    c.save();c.fillStyle='rgba(176,148,96,.16)';c.fillRect(x-9,gy-h,18,h);c.restore();   // 부위 이름 글 뒤라 옅게
    brush(c,[[x-9,gy],[x-9,gy-h],[x+9,gy-h],[x+9,gy]],2.4,INK,0.26);blob(c,x,gy-h,9,4,'rgba(176,148,96,1)',0.35);
    for(let k=1;k<5;k++)brush(c,[[x-8,gy-h*k/5],[x+8,gy-h*k/5+2]],1,INK,0.25);}
  for(let i=0;i<2;i++){const x=LW*0.19+i*16;brush(c,[[x,gy-96],[x+14,gy-6]],3,'#6b5540',0.3);
    for(let k=0;k<6;k++)brush(c,[[x+14,gy-14],[x+8+k*3,gy]],1.4,'#8a7048',0.5);}
  // 기대 놓은 키(곡식 까부르는 바구니)
  {const kx=LW*0.27,ky=gy-26;c.save();c.fillStyle='rgba(176,148,96,.3)';c.beginPath();c.ellipse(kx,ky,24,26,0.25,0,Math.PI*2);c.fill();c.restore();
    c.save();c.strokeStyle=INK;c.globalAlpha=0.45;c.lineWidth=2;c.beginPath();c.ellipse(kx,ky,24,26,0.25,0,Math.PI*2);c.stroke();c.restore();
    for(let k=-2;k<=2;k++)brush(c,[[kx+k*8-4,ky-22],[kx+k*7+4,ky+22]],1,INK,0.22);}
  // 오른쪽: 설 대목 짐. 보자기로 싼 짐과 쌀가마
  const sack=(x,y,w,h)=>{c.save();c.fillStyle='rgba(196,176,136,.3)';c.beginPath();c.ellipse(x,y-h/2,w/2,h/2,0,0,Math.PI*2);c.fill();c.restore();
    c.save();c.strokeStyle=INK;c.globalAlpha=0.45;c.lineWidth=2;c.beginPath();c.ellipse(x,y-h/2,w/2,h/2,0,0,Math.PI*2);c.stroke();c.restore();
    brush(c,[[x-w*0.4,y-h*0.35],[x+w*0.4,y-h*0.35]],1.4,INK,0.3);brush(c,[[x-w*0.4,y-h*0.65],[x+w*0.4,y-h*0.65]],1.4,INK,0.3);};
  sack(LW*0.74,gy,54,40);sack(LW*0.83,gy,58,44);sack(LW*0.785,gy-36,48,34);
  const bundle=(x,y,s,col)=>{c.save();c.fillStyle=col;c.fillRect(x-14*s,y-22*s,28*s,22*s);c.restore();
    brush(c,[[x-14*s,y],[x-14*s,y-22*s],[x+14*s,y-22*s],[x+14*s,y]],2,INK,0.45);
    brush(c,[[x-5*s,y-22*s],[x,y-30*s],[x+5*s,y-22*s]],2.4,INK,0.5);};
  bundle(LW*0.92,gy,1.1,'rgba(180,67,42,.22)');bundle(LW*0.95,gy-26,0.8,'rgba(84,110,120,.2)');bundle(LW*0.66,gy,0.9,'rgba(84,110,120,.2)');
}
defineEnemies({
  dokkaebi:{name:'헌물 도깨비',calmLabel:'진정',
    intro:'[시험판] 불이 옮겨 간 헌물이 공격한다. 붓 자국을 읽고 피하자. 멍석부터 부숴 보자.',
    possession:{order:['ki','meongseok','broom','core'],attacks:{broom:'hauntedSweep',ki:'hauntedBeans',meongseok:'hauntedRoll'},travel:54,wait:114},
    calmAction:{kind:'return',amount:TABLES.CALM.dokkaebi.memiltteok/4},
    partPose(id){const p=dokkaebiPose(id);return {x:LW/2+(p.x-LW/2)*0.84,y:EY+(p.y-EY)*0.84};},
    markPosition(p){const pose=this.partPose(p.id),v={broom:0.38,ki:0.3,meongseok:0.7,core:0.19}[p.id];
      return {x:clamp(pose.x,BOX.x+28,BOX.x+BOX.w-28),y:BOX.y+BOX.h*v};},
    parts:tableParts('dokkaebi',{broom:{atk:'broomSweep',tell:'불이 빗자루 손잡이를 탄다. 흰 줄에서 기다렸다가 쓸고 간 뒤쪽으로!'},ki:{atk:'beans',tell:'불이 키 테두리를 돈다. 콩이 떨어질 먹점 사이의 넓은 흰 여백으로!'},meongseok:{atk:'roll',tell:'불이 멍석 끝으로 스민다. 붉은 끝선 너머 흰 여백으로 미리 건너가자!'},core:{atk:'wisp',tell:'헌물에서 나온 불이 손을 느리게 따라온다. 넓게 돌아 피하자.'}}),
    likes:TABLES.CALM.dokkaebi,likeText:'도깨비가 좋아한다.',
    likeTexts:{memiltteok:'"메밀떡이다, 메밀떡!" 도깨비가 냄새를 맡고 덩실덩실 춤을 춘다.',
      dad_yeot:'아빠가 맡긴 엿을 건넸다. "엿이다, 엿! 내 거지?" 도깨비가 엿가락을 소중히 끌어안는다. 엿은 돌려받지 못한다.'},
    coreHidden:'도깨비불이 헌물 뒤에 숨어 있다. 빗자루나 키, 멍석을 먼저 부수자.',
    coreShown:'도깨비불이 드러났다! 이제 불을 노릴 수 있다.',
    // PA-21 불씨 지급은 jangteo/story.js의 전투 종료 처리에서 한 번만 한다.
    calmWin:'도깨비가 훔친 설 제수를 돌려놓고 눈홍시 하나를 더 얹는다. "고맙다, 고마워! 이 불씨도 네 거다!" 도깨비가 불씨를 건넨다.',calmGift:'nunhongsi',
    win:'도깨비불이 꺼지자 빗자루와 키와 멍석이 털썩 주저앉는다.',
    lose:'도깨비의 장난에 창고 밖으로 내동댕이쳐졌다.',
    backdrop:drawStoreRoom,draw:drawDokkaebi},
});
})();
