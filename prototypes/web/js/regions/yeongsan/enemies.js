'use strict';
/* 북쪽 영산 전투: 강철이 (용이 되지 못한 이무기). 원본 표: design/data/bosses.csv · boss_parts.csv
   부위 공격 넷은 온기 길(warmPath)의 gangcheol* 공격이다 (engine/battle-attacks.js, boss_parts.csv 의 공격 칸).
   머리는 몸통을 부숴야 드러난다 (coreNeeds).
   결정 D-340: 온기 길이 네 부위 공격을 모두 덮어 쓰이지 않던 옛 기본 공격(frostBreath·coil·icicleTail·blizzard)은 지웠다.
   결정 D-370: 부서진 부위는 흐리게 남지 않는다. 꼬리는 끊긴 그루터기와 깨진 고드름, 몸통은 힘이 빠져 바닥에 늘어진 똬리,
     입은 금 가 처진 턱으로 그린다. 부서진 부위의 공격은 더 고르지 않는다. */
(()=>{
function drawGangcheol(c){
  const cx=LW/2,cy=EY;const mouth=part('mouth'),body=part('body'),tail=part('tail'),head=part('core');
  const wave=Math.sin(B.time*0.04)*8;
  if(B.warm&&B.warm.fire>0){
    const x=cx+35,y=cy+95;
    for(let i=-1;i<=1;i++)brush(c,[[x+i*10,y],[x-4+i*10,y-14],[x+4+i*10,y-26]],2,INK,0.3);
    brush(c,[[cx-30,cy+48],[cx+2,cy+65],[x-7,y-12]],5,INK,0.75);
    for(let i=0;i<3;i++)brush(c,[[x-7,y-12],[x+3+i*4,y-17+i*3]],2,INK,0.75);
  }
  // 꼬리 (오른쪽 아래)
  if(tail.broken){   // 끊긴 꼬리: 짧은 그루터기와 바닥에 깨져 흩어진 고드름
    brush(c,[[cx+60,cy+70],[cx+104,cy+70]],10,INK,1);
    c.save();c.fillStyle='#efe3c8';c.globalAlpha=0.9;c.beginPath();c.moveTo(cx+100,cy+64);c.lineTo(cx+110,cy+67);c.lineTo(cx+104,cy+70);c.lineTo(cx+111,cy+74);c.lineTo(cx+100,cy+76);c.closePath();c.fill();c.restore();
    for(let i=0;i<5;i++){const tx=cx+122+i*16,ty=cy+98+hash(i*1.7)*4;c.save();c.fillStyle=INK;c.globalAlpha=0.75;c.translate(tx,ty);c.rotate(1.2+hash(i)*1.4);c.beginPath();c.moveTo(-3,0);c.lineTo(3,0);c.lineTo(0,8);c.closePath();c.fill();c.restore();}}
  else{const o=shk(tail),col=partCol(tail);const a=1;const lift=B.st==='tell'&&B.cur===tail?-20:0;
    brush(c,[[cx+60+o,cy+70],[cx+130+o,cy+60+lift],[cx+170+o,cy+20+lift+wave],[cx+150+o,cy-10+lift]],10,col,a);
    for(let i=0;i<4;i++){const tx=cx+120+i*14+o,ty=cy+54-i*14+lift;c.save();c.fillStyle=INK;c.globalAlpha=a;c.beginPath();c.moveTo(tx-4,ty);c.lineTo(tx+4,ty);c.lineTo(tx,ty+14);c.closePath();c.fill();c.restore();}}
  // 몸통 (휘감은 똬리)
  if(body.broken){   // 풀린 똬리: 힘이 빠져 바닥에 늘어지고, 비늘 몇 장이 떨어져 금이 보인다
    brush(c,[[cx-150,cy+88],[cx-90,cy+80],[cx-10,cy+92],[cx+60,cy+84],[cx+70,cy+92]],24,INK,0.85);
    for(let i=0;i<6;i++){const sx=cx-128+i*34,sy=cy+84+Math.sin(i*1.3)*4;brush(c,[[sx-5,sy-4],[sx+2,sy+2],[sx-2,sy+7]],1.6,'#efe3c8',0.8);}
    for(let i=0;i<5;i++)blob(c,cx-120+i*40+hash(i)*10,cy+104+hash(i*3.1)*3,4,2.4,'#efe3c8',0.5);}
  else{const o=shk(body),col=partCol(body);const tight=B.st==='tell'&&B.cur===body?-10:0;
    brush(c,[[cx-150+o,cy+70],[cx-90+o,cy+40+wave+tight],[cx-10+o,cy+80],[cx+60+o,cy+50-wave+tight],[cx+60+o,cy+70]],26,col,0.9);
    brush(c,[[cx-130+o,cy+86],[cx-40+o,cy+92],[cx+40+o,cy+88]],18,col,0.75);
    for(let i=0;i<9;i++){const sx=cx-130+i*24+o,sy=cy+60+Math.sin(i*1.3)*14;brush(c,[[sx-6,sy],[sx,sy-6],[sx+6,sy]],2,'#efe3c8',0.6);}}
  // 머리와 입
  {const o=shk(head),col=partCol(head);const hidden=coreHidden();const hx=cx-70+o,hy=cy-10+wave*0.5+(hidden?16:0);
    brush(c,[[cx-120+o,cy+(body.broken?84:50)],[hx-10,hy+30],[hx,hy+6]],20,body.broken?INK:partCol(body),0.9);
    blob(c,hx,hy,34,24,col===INK?'#231e19':col,head.broken?0.3:1);
    brush(c,[[hx-26,hy-16],[hx-34,hy-36]],5,INK,head.broken?0.3:1);brush(c,[[hx-6,hy-20],[hx-4,hy-40]],5,INK,head.broken?0.3:1);   // 뿔이 되다 만 혹
    // 입 (서리 숨)
    const mo=shk(mouth),mc=partCol(mouth);const open=B.st==='tell'&&B.cur===mouth?10:4;
    if(mouth.broken){brush(c,[[hx+18,hy+6],[hx+36,hy+6]],6,INK,1);brush(c,[[hx+18,hy+16],[hx+30,hy+28],[hx+36,hy+34]],6,INK,1);   // 금 가 처진 턱
      brush(c,[[hx+26,hy+18],[hx+30,hy+24],[hx+27,hy+29]],1.6,'#efe3c8',0.9);}
    else{brush(c,[[hx+18+mo,hy+6],[hx+38+mo,hy+4+open*0.3]],6,mc,1);brush(c,[[hx+18+mo,hy+14],[hx+38+mo,hy+16+open]],6,mc,1);}
    if(!mouth.broken){brush(c,[[hx+30,hy+2],[hx+70,hy-10],[hx+96,hy+6]],2,INK,0.6);brush(c,[[hx+30,hy+18],[hx+66,hy+34],[hx+92,hy+28]],2,INK,0.6);}   // 수염
    if(head.broken){brush(c,[[hx-14,hy-2],[hx-4,hy]],3,'#efe3c8');}
    else{const [ex,ey]=lookAt(hx,hy);blob(c,hx-4,hy-4,8,7,'#efe3c8');blob(c,hx-4+ex,hy-4+ey,3.5,4,INK);}
    if(B.st==='end'&&B.result==='calm'){brush(c,[[hx-10,hy-4],[hx+2,hy-2]],3,'#efe3c8');}
    if(hidden){brush(c,[[hx-50,hy-10],[hx,hy+20],[hx+50,hy-12]],10,INK,0.8);}
  }
}

/* 결정 D-62: 모든 전투 배경은 상대 뒤쪽 화면 전체로 그린다 (design/data/decisions.csv).
   강철이는 영산 호숫가. 지나는 곳마다 가뭄이 드는 악룡이라 겨울인데도 눈이 말랐다. 마른 겨울 산, 얼어붙은 호수, 금줄 두른 신목(잎 없는 가지),
   물이 말라 갈라진 호숫가와 마른 갈대. */
function drawFrozenLake(c){
  const t=B.time,still=Vfx.reducedMotion,gy=BOX.y-52;
  let g=c.createLinearGradient(0,0,0,gy);g.addColorStop(0,'rgba(150,168,186,.2)');g.addColorStop(1,'rgba(200,190,170,.06)');
  c.save();c.fillStyle=g;c.fillRect(0,0,LW,gy);c.restore();
  // 마른 겨울 산: 눈이 거의 없는 먹빛 능선, 꼭대기에만 얇은 눈
  for(const [k,a,base,amp] of [[0,.1,gy*0.55,60],[1,.16,gy*0.78,40]]){
    const pts=[];for(let x=-20;x<=LW+20;x+=24)pts.push([x,base-Math.abs(Math.sin(x*0.006+k*1.9))*amp-hash(x*0.07+k)*14]);
    c.save();c.globalAlpha=a;c.fillStyle=INK;c.beginPath();c.moveTo(-20,gy);for(const p of pts)c.lineTo(p[0],p[1]);c.lineTo(LW+20,gy);c.closePath();c.fill();c.restore();
    if(k===0)for(let i=1;i<pts.length-1;i++)if(pts[i][1]<pts[i-1][1]&&pts[i][1]<pts[i+1][1])brush(c,[[pts[i][0]-10,pts[i][1]+6],[pts[i][0],pts[i][1]+1],[pts[i][0]+10,pts[i][1]+6]],2,'#f4f2ec',0.7);
  }
  // 얼어붙은 호수: 지평선 앞의 넓은 얼음 띠와 금
  const ly=gy-18,lh=34;
  c.save();c.fillStyle='rgba(196,214,226,.42)';c.beginPath();c.ellipse(LW/2,ly,LW*0.48,lh,0,0,Math.PI*2);c.fill();c.restore();
  c.save();c.strokeStyle=INK;c.globalAlpha=0.3;c.lineWidth=1.6;c.beginPath();c.ellipse(LW/2,ly,LW*0.48,lh,0,0,Math.PI*2);c.stroke();c.restore();
  for(let i=0;i<7;i++){const x=LW*0.12+hash(i*4.3)*LW*0.76,y=ly-lh*0.5+hash(i*2.9)*lh;brush(c,[[x,y],[x+12,y+4],[x+22,y-2]],1,INK,0.22);}
  if(!still){const k=(t*0.004)%1;c.save();c.globalAlpha=0.25;c.fillStyle='#ffffff';c.fillRect(LW*(0.1+k*0.8),ly-2,30,2);c.restore();}
  // 갈라진 호숫가 바닥
  c.save();c.fillStyle='rgba(176,150,112,.14)';c.fillRect(0,gy,LW,LH-gy);c.restore();
  brush(c,[[0,gy+2],[LW*0.5,gy-2],[LW,gy+2]],4,INK,0.45);
  for(let i=0;i<16;i++){const x=hash(i*5.7)*LW,y=gy+8+hash(i*1.7)*(LH-gy-16);brush(c,[[x,y],[x+8,y+3],[x+12,y-3],[x+20,y+1]],1,INK,0.16);}
  // 신목: 오른쪽 끝, 잎 없이 비틀린 굵은 가지와 금줄
  const sx=LW*0.96;   // 오른쪽 끝: 왼쪽 부위 글을 가리지 않게
  brush(c,[[sx-18,gy],[sx-12,gy*0.6],[sx-4,gy*0.3]],16,INK,0.36);brush(c,[[sx+14,gy],[sx+8,gy*0.6],[sx-2,gy*0.3]],10,INK,0.32);
  for(const [a,b,w] of [[[sx-6,gy*0.35],[sx-80,gy*0.1],6],[[sx-2,gy*0.3],[sx+30,gy*0.05],6],[[sx-40,gy*0.2],[sx-70,-6],3],[[sx-60,gy*0.15],[sx-110,gy*0.2],3],[[sx+16,gy*0.1],[sx+24,-8],2]])
    brush(c,[a,[(a[0]+b[0])/2+8,(a[1]+b[1])/2-6],b],w,INK,0.3);
  const ry=gy*0.86;brush(c,[[sx-24,ry],[sx,ry+8],[sx+20,ry]],3,'#6b5540',0.65);
  for(let i=0;i<4;i++){const x=sx-16+i*11,y=ry+3+Math.sin(i/3*Math.PI)*5;c.save();c.fillStyle='rgba(250,246,236,.8)';c.fillRect(x-3,y,6,11);c.restore();brush(c,[[x-3,y],[x+3,y],[x+3,y+11],[x-3,y+11],[x-3,y]],1,INK,0.3);}
  // 마른 갈대: 판정 상자 왼쪽 호숫가
  for(let i=0;i<9;i++){const x=LW*0.2+i*LW*0.011,h=40+hash(i*3.3)*36,sw=still?0:Math.sin(t*0.02+i*0.7)*3;
    brush(c,[[x,gy+4],[x+sw*0.5,gy-h*0.5],[x+sw,gy-h]],1.6,'#8a7048',0.6);blob(c,x+sw,gy-h-4,2.5,6,'#a88c5c',0.55);}
  // 마른 바람에 날리는 흙먼지
  if(!still)for(let i=0;i<8;i++){const x=(hash(i*2.1)*LW+t*(0.6+hash(i)*0.6))%(LW+60)-30,y=gy-10-hash(i*6.1)*60;brush(c,[[x,y],[x+18,y-2]],1,'#a88c5c',0.2);}
}
defineEnemies({
  gangcheol:{name:'강철이',calmLabel:'진정',coreNeeds:'body',
    // 결정 D-227: 전투 글귀는 일어난 일만 짧게. 피하라·치라는 안내는 쓰지 않는다
    intro:'[시험판] 서리 덮인 호수에 물김이 오른다.',
    // 결정 D-246: 방향(0·1)마다 예고 글. 없는 부위는 parts 의 tell 을 쓴다
    warmPath:{width:76,wideWidth:100,attacks:{mouth:'gangcheolFrost',body:'gangcheolCoil',tail:'gangcheolIcicles',core:'gangcheolBlizzard'},
      tells:{mouth:['서리 띠가 내려온다.','서리 띠가 옆으로 밀려온다.'],body:['강철이가 양옆에서 똬리를 조인다.','강철이가 위아래로 똬리를 조인다.'],
        tail:['꼬리에서 고드름이 쏟아진다.','꼬리가 옆으로 고드름을 흩뿌린다.']}},
    // 결정 D-243: 샘의 얼음 걷기(행동 진정)를 뺐다. 온기 길은 피하는 길로만 남고, 달래기는 도깨비불씨·팥시루떡 선물로만 한다
    markPosition(p){const u=p.id==='mouth'?0.26:p.id==='tail'?0.74:0.5;
      const v=B.warm&&B.warm.current.v<0.5?0.76:0.24;
      return {x:BOX.x+BOX.w*u,y:BOX.y+BOX.h*v};},
    // 결정 D-370: weak 는 부서진 뒤 한 줄
    parts:tableParts('gangcheol',{mouth:{tell:'서리 띠가 내려온다.',weak:'강철이가 약해졌다. 금 간 턱으로는 서리를 뿜지 못한다.'},
      body:{tell:'강철이가 똬리를 조인다.',weak:'강철이가 약해졌다. 풀린 똬리로는 더 조이지 못한다.'},
      tail:{tell:'꼬리에서 고드름이 흩날린다.',weak:'강철이가 약해졌다. 끊긴 꼬리로는 고드름을 흩뿌리지 못한다.'},core:{tell:'눈보라가 돌아온다.'}}),
    likes:TABLES.CALM.gangcheol,likeText:'강철이가 잠시 숨을 멈춘다.',
    likeTexts:{dokkaebibul:'꺼지지 않는 도깨비불씨를 건넸다. 강철이가 그 온기에 눈을 감는다.',
      patsirutteok:'붉은 팥떡을 내밀자 강철이가 움찔 물러난다. 서리가 조금 걷혔다.'},
    coreHidden:'머리가 똬리 속에 숨어 있다.',
    coreShown:'똬리가 풀려 온기 길이 넓어졌다!',
    calmWin:'강철이가 서리를 거두고, 따뜻한 남쪽 바다를 향해 천천히 날아오른다.',calmGift:'frost_whisker',
    win:'여의주에 금이 가자 강철이가 호수를 놓고 물러난다.',
    lose:'눈보라에 휩쓸려 호숫가로 밀려났다.',
    backdrop:drawFrozenLake,draw:drawGangcheol},
});
})();
