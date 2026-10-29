'use strict';
/* 큰 장터 전투: 헌물 도깨비 (낡은 빗자루·키·멍석에 깃든 도깨비). 원본 표: design/data/bosses.csv · boss_parts.csv
   부위 공격 넷은 이 지역에서 새로 만든다 (boss_parts.csv 의 공격 칸):
   broomSweep 빗자루가 상자를 가로질러 쓸고 지나감, 쓸리지 않는 줄 하나로 피함
   beans      키로 까부른 콩이 위에서 흩어져 떨어짐
   roll       멍석이 한쪽 끝부터 말려 들어와 피할 자리가 좁아짐
   wisp       도깨비불이 손을 느리게 따라옴
   전투 화면은 흑백 + 단청 붉은색 하나라서, 도깨비불은 필드와 달리 붉게 그린다 */
(()=>{
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
  {const o=shk(core),col=partCol(core);const hx=cx+o,hy=cy-30-hop;const fl=Math.sin(B.time*0.25)*4;
    const fire=core.broken?'rgba(29,24,20,.2)':(col===INK?RED:col);
    blob(c,hx,hy+6,30,26,fire,core.broken?1:0.75);blob(c,hx-6,hy-22+fl,14,22,fire,core.broken?1:0.55);blob(c,hx+10,hy-30-fl,8,16,fire,core.broken?1:0.45);
    if(!core.broken){const [ex,ey]=lookAt(hx,hy);blob(c,hx-11,hy+4,7,8,'#efe3c8');blob(c,hx+11,hy+4,7,8,'#efe3c8');blob(c,hx-11+ex,hy+4+ey,3.2,3.8,INK);blob(c,hx+11+ex,hy+4+ey,3.2,3.8,INK);
      brush(c,[[hx-12,hy+20],[hx-4,hy+24],[hx+4,hy+20],[hx+12,hy+24]],3,INK);
      brush(c,[[hx-8,hy-16],[hx-14,hy-30]],4,INK);}   // 뿔 하나
    else{brush(c,[[hx-16,hy+4],[hx-6,hy+6]],3,INK,0.5);brush(c,[[hx+6,hy+6],[hx+16,hy+4]],3,INK,0.5);}
    if(coreHidden()){brush(c,[[hx-60,hy-10],[hx,hy+26],[hx+60,hy-14]],9,INK,0.8);brush(c,[[hx-50,hy+30],[hx+8,hy-2],[hx+56,hy+28]],8,INK,0.75);}
  }
}

defineEnemies({
  dokkaebi:{name:'헌물 도깨비',calmLabel:'진정',
    intro:'창고 구석의 낡은 빗자루와 키와 멍석이 들썩이더니, 푸른 불이 깃든다.',
    parts:[
      {id:'broom',name:'빗자루',hp:3,atk:'broomSweep',mat:'broom_sal',tell:'빗자루가 바닥을 쓸 채비를 한다…'},
      {id:'ki',name:'키',hp:3,atk:'beans',mat:'kong',tell:'키가 콩을 까불러 올린다…'},
      {id:'meongseok',name:'멍석',hp:3,atk:'roll',mat:'jip',tell:'멍석이 끝에서부터 말려 든다…'},
      {id:'core',name:'도깨비불',hp:4,atk:'wisp',mat:'dokkaebibul',core:true,tell:'도깨비불이 손을 노려본다…'}],
    likes:{memiltteok:100,dad_yeot:100},likeText:'도깨비가 좋아한다.',
    likeTexts:{memiltteok:'메밀떡 냄새에 도깨비가 덩실덩실 춤을 춘다. "메밀이다, 메밀!"',
      dad_yeot:'아빠가 맡긴 엿을 건넸다. 도깨비가 엿가락을 소중히 끌어안는다. 돌려줄 생각은 없어 보인다.'},
    coreHidden:'도깨비불이 헌물 뒤에 숨어 있다. 빗자루나 키, 멍석을 먼저 부수자.',
    coreShown:'도깨비불이 드러났다! 이제 불을 노릴 수 있다.',
    calmWin:'도깨비가 훔친 설 제수를 하나하나 제자리에 돌려놓고, 눈홍시 하나를 더 얹어 놓았다.',calmGift:'nunhongsi',
    win:'도깨비불이 꺼지자 빗자루와 키와 멍석이 털썩 주저앉는다.',
    lose:'도깨비의 장난에 창고 밖으로 내동댕이쳐졌다.',
    draw:drawDokkaebi},
});
})();
