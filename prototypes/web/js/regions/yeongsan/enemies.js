'use strict';
/* 북쪽 영산 전투: 강철이 (용이 되지 못한 이무기). 원본 표: design/data/bosses.csv · boss_parts.csv
   부위 공격 넷은 온기 길(warmPath)의 gangcheol* 공격이다 (engine/battle-attacks.js, boss_parts.csv 의 공격 칸).
   머리는 몸통을 부숴야 드러난다 (coreNeeds).
   결정 D-340: 온기 길이 네 부위 공격을 모두 덮어 쓰이지 않던 옛 기본 공격(frostBreath·coil·icicleTail·blizzard)은 지웠다.
   결정 D-370: 부서진 부위는 흐리게 남지 않는다. 꼬리는 끊긴 그루터기와 깨진 고드름, 몸통은 힘이 빠져 바닥에 늘어진 똬리,
     입은 금 가 처진 턱으로 그린다. 부서진 부위의 공격은 더 고르지 않는다. */
(()=>{
/* 결정 D-435: 달래면 떠난다. '용'이라 불러 주었으면 하늘로 오르고, 불씨·떡이면 남쪽(오른쪽) 바다로 날아간다. 0 → 1 */
const GHEAD=1.25;   // 결정 D-746: 머리 그림 배율 (몸에 비해 작아 보이던 머리를 키운다)
function gangLeave(){return B.st==='end'&&B.result==='calm'?1-Math.max(0,B.t)/80:0;}
function gangLeaveOffset(){const k=gangLeave();if(!k)return {x:0,y:0};
  return B.lastGift==='lore:yong'?{x:0,y:-k*k*300}:{x:k*k*320,y:k*24};}
/* 결정 D-432: 입 자리(이름패가 날아드는 곳, 토해 낸 이름이 나오는 곳). drawGangcheol 의 머리·입 좌표를 전투 화면의 0.84배 축소(bDraw)에 맞춘다 */
function gangMouth(){
  const cx=LW/2,cy=EY,wave=Math.sin(B.time*0.04)*8,hidden=coreHidden(),o=gangLeaveOffset();
  const x=cx-70+32*GHEAD+o.x,y=cy-10+wave*0.5+(hidden?16:0)+10*GHEAD+o.y;   // 결정 D-746: 머리를 GHEAD 배로 키워 그린다
  return {x:LW/2+(x-LW/2)*0.84,y:EY+(y-EY)*0.84};
}
function drawGangcheol(c){
  const o=gangLeaveOffset();
  if(!o.x&&!o.y){drawGangcheolBody(c);return;}
  c.save();c.translate(o.x,o.y);drawGangcheolBody(c);c.restore();
}
function drawGangcheolBody(c){
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
    const coil=[[cx-150+o,cy+70],[cx-90+o,cy+40+wave+tight],[cx-10+o,cy+80],[cx+60+o,cy+50-wave+tight],[cx+60+o,cy+70]];
    // 결정 D-746: 등줄기를 따라 톱니 같은 등지느러미가 돋는다 (사용자 피드백 2026-11-05: 보스는 귀엽지 않게, 설화 속 악룡답게)
    for(let i=0;i<coil.length-2;i++){const [x0,y0]=coil[i],[x1,y1]=coil[i+1];
      for(let k=0;k<4;k++){const u=(k+0.5)/4,x=x0+(x1-x0)*u,y=y0+(y1-y0)*u-12,h=9+((i+k)%2)*5;
        gPoly(c,[[x-6,y+4],[x-1,y-h],[x+7,y+3]],col===INK?'#2a2420':col,0.9);}}
    brush(c,coil,26,col,0.9);
    brush(c,[[cx-130+o,cy+86],[cx-40+o,cy+92],[cx+40+o,cy+88]],18,col,0.75);
    for(let i=0;i<9;i++){const sx=cx-130+i*24+o,sy=cy+60+Math.sin(i*1.3)*14;brush(c,[[sx-6,sy],[sx,sy-6],[sx+6,sy]],2,'#efe3c8',0.6);
      brush(c,[[sx-4,sy+8],[sx+4,sy+8]],1.2,'#8a8f96',0.45);}   // 배 비늘 마디
    // 결정 D-435: 삼킨 이름이 똬리 속에서 빛으로 비친다 (몸통을 치면 하나씩 돌아온다)
    const eaten=B.names?B.names.eaten.length:0;
    for(let i=0;i<Math.min(eaten,8);i++){const sx=cx-118+i*26+o,sy=cy+66+Math.sin(i*1.3+B.time*0.03)*10,pulse=0.28+0.12*Math.sin(B.time*0.08+i);
      blob(c,sx,sy,7,5,GOLD,pulse);blob(c,sx,sy,3,2.4,'#fff4cf',pulse+0.2);}}
  // 머리와 입. 결정 D-746: 용이 되지 못한 이무기의 머리. 길게 뻗은 주둥이, 눈을 내리누르는 두툼한 눈두덩,
  // 그 밑에 세로로 찢어진 동공이 서리처럼 차갑게 빛난다. 뿔은 자라다 만 울퉁불퉁한 혹 둘이 뒤로 휘었고, 목덜미엔 갈기가 곤두섰다.
  // 둥근 머리·큰 동그란 눈(귀여워 보이던 그림)은 버렸다.
  {const o=shk(head),col=partCol(head);const hidden=coreHidden();const hx=cx-70+o,hy=cy-10+wave*0.5+(hidden?16:0);
    const dim=head.broken?0.3:1,HC=col===INK?'#231e19':col,calm=B.st==='end'&&B.result==='calm';
    const neckCol=body.broken?INK:partCol(body);
    brush(c,[[cx-120+o,cy+(body.broken?84:50)],[hx-22,hy+34],[hx-14,hy+8]],22,neckCol,0.9);
    c.save();c.translate(hx,hy);c.scale(GHEAD,GHEAD);c.translate(-hx,-hy);
    // 목덜미 갈기: 뒤로 날리는 거친 털 다발
    for(let i=0;i<6;i++){const u=i/5,bx=hx-30-u*26,by=hy-4+u*30,fl=Math.sin(B.time*0.05+i)*3;
      brush(c,[[bx,by],[bx-12-u*6,by-8+fl],[bx-24-u*8,by-4+fl*1.4]],3.2-u,INK,0.85*dim);}
    // 자라다 만 뿔: 울퉁불퉁한 혹 둘이 뒤로 휜다
    const horn=(x0,y0,x1,y1,w)=>{const mx=(x0+x1)/2+3,my=(y0+y1)/2-6;
      gPoly(c,[[x0-w,y0],[mx-w*0.6,my],[x1,y1],[mx+w*0.5,my+4],[x0+w,y0+2]],HC,dim,INK,1.4);
      for(let k=1;k<4;k++){const u=k/4,x=x0+(x1-x0)*u,y=y0+(y1-y0)*u;brush(c,[[x-w*(1-u)*0.8,y+1],[x+w*(1-u)*0.8,y-1]],1.1,'#6b625a',0.8*dim);}};
    horn(hx-8,hy-18,hx-40,hy-44,6);horn(hx-20,hy-12,hx-54,hy-28,5);
    // 머리뼈: 뒤가 넓고 주둥이로 갈수록 길게 좁아진다
    const P=pts=>pts.map(([dx,dy])=>[hx+dx,hy+dy]);
    gPoly(c,P([[-34,-4],[-28,-16],[-12,-22],[2,-21],[12,-15],[26,-9],[42,-5],[48,1],[42,7],[16,10],[-4,16],[-24,14],[-34,6]]),HC,dim,INK,2);
    gPoly(c,P([[-26,-14],[-10,-20],[4,-18],[-2,-12],[-22,-8]]),'#4a423b',0.55*dim);   // 정수리 큰 비늘판
    for(const [dx,dy] of [[-18,0],[-8,4],[-26,6],[24,-3],[32,-1]])brush(c,[[hx+dx-3,hy+dy],[hx+dx,hy+dy-3],[hx+dx+3,hy+dy]],1.2,'#8a8f96',0.6*dim);   // 비늘 무늬
    blob(c,hx+42,hy-1,2.4,1.2,'#0c0907',dim);   // 콧구멍
    // 입 (서리 숨). 아래턱이 벌어지면 송곳니가 보인다
    const mo=shk(mouth),mc=partCol(mouth);const open=B.st==='tell'&&B.cur===mouth?10:4;
    if(mouth.broken){brush(c,[[hx+14,hy+10],[hx+38,hy+8]],5,INK,1);brush(c,[[hx+12,hy+16],[hx+28,hy+28],[hx+36,hy+34]],6,INK,1);   // 금 가 처진 턱
      brush(c,[[hx+22,hy+18],[hx+26,hy+24],[hx+23,hy+29]],1.6,'#efe3c8',0.9);}
    else{const jaw=P([[12,12],[40+mo,10+open],[36+mo,16+open],[8,20]]);
      gPoly(c,P([[14,10],[42+mo,8],[40+mo,10+open*0.8],[14,14]]),'#3a1f1c',1);   // 벌린 입 속
      for(const fx of [22,32])gPoly(c,P([[fx-2+mo,8],[fx+2+mo,8],[fx+mo,13+open*0.25]]),'#efe3c8',1);   // 위 송곳니
      gPoly(c,jaw,mc===INK?'#231e19':mc,1,INK,1.6);
      gPoly(c,P([[28+mo,10+open],[31+mo,10+open],[29.5+mo,5+open]]),'#efe3c8',1);}   // 아래 송곳니
    if(!mouth.broken){const sw=Math.sin(B.time*0.03)*4;   // 길게 늘어진 수염
      brush(c,[[hx+38,hy+2],[hx+64,hy-12+sw],[hx+88,hy-4+sw],[hx+100,hy+8+sw]],2,INK,0.7);
      brush(c,[[hx+34,hy+12],[hx+58,hy+30-sw],[hx+82,hy+28-sw],[hx+96,hy+40-sw]],2,INK,0.7);}
    // 눈: 두툼한 눈두덩이 내리누르고, 그 밑에 세로로 찢어진 동공
    brush(c,[[hx-14,hy-14],[hx-2,hy-15],[hx+12,hy-9]],5,INK,dim);   // 눈두덩
    if(head.broken){brush(c,[[hx-8,hy-7],[hx+6,hy-6]],3,'#efe3c8');}
    else if(calm){brush(c,[[hx-8,hy-7],[hx+6,hy-6]],2.4,'#efe3c8');}
    else{const [ex]=lookAt(hx,hy);
      blob(c,hx,hy-8,9,4,'#bfe6ef',0.14);   // 서리 같은 눈빛
      gPoly(c,P([[-8,-7.5],[-1,-10.5],[7,-9.5],[3,-7],[-5,-6]]),'#d8f0f4',1);   // 가늘게 찢어진 눈
      gPoly(c,[[hx+0.4+ex*0.4,hy-10.6],[hx+1.6+ex*0.4,hy-10.6],[hx+1.4+ex*0.4,hy-6.2],[hx+0.6+ex*0.4,hy-6.2]],INK,1);}
    c.restore();
    if(hidden){brush(c,[[hx-50,hy-10],[hx,hy+20],[hx+50,hy-12]],10,INK,0.8);}
  }
}
function gPoly(c,pts,fill,alpha=1,stroke,lw=1.6){c.save();c.globalAlpha=alpha;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
  c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.lineJoin='round';c.stroke();}c.restore();}

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
    // 결정 D-432~D-435: 이름을 먹는 이무기. 입이 이름을 부르고, 몸통에 삼킨 이름이 비친다 (engine/battle-names.js)
    names:{part:'mouth',body:'body',mouth:gangMouth},
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
    parts:tableParts('gangcheol',{mouth:{tell:'서리 띠가 내려온다.',weak:'강철이가 약해졌다. 금 간 턱으로는 서리를 뿜지도, 이름을 부르지도 못한다.'},
      body:{tell:'강철이가 똬리를 조인다.',weak:'강철이가 약해졌다. 풀린 똬리로는 더 조이지 못한다.'},
      tail:{tell:'꼬리에서 고드름이 흩날린다.',weak:'강철이가 약해졌다. 끊긴 꼬리로는 고드름을 흩뿌리지 못한다.'},core:{tell:'눈보라가 돌아온다.'}}),
    likes:TABLES.CALM.gangcheol,likeText:'강철이가 잠시 숨을 멈춘다.',
    likeTexts:{dokkaebibul:'꺼지지 않는 도깨비불씨를 건넸다. 강철이가 그 온기에 눈을 감는다.',
      patsirutteok:'붉은 팥떡을 내밀자 강철이가 움찔 물러난다. 서리가 조금 걷혔다.'},
    coreHidden:'머리가 똬리 속에 숨어 있다.',
    coreShown:'똬리가 풀려 온기 길이 넓어졌다!',
    // 결정 D-435: 진정이 차면 입을 벌려 삼킨 이름을 토해 낸다. '용'이라 불러 주었으면 하늘로 오른다
    calmWin:'강철이가 삼킨 이름을 토해 내고, 따뜻한 남쪽 바다를 향해 천천히 날아간다.',calmGift:'frost_whisker',
    calmWinBy:{'lore:yong':'강철이가 삼킨 이름을 토해 내고, 구름을 가르며 하늘로 오른다.'},
    win:'여의주에 금이 가자 강철이가 삼킨 이름을 토해 내고 호수를 놓는다.',
    lose:'눈보라에 휩쓸려 호숫가로 밀려났다.',
    backdrop:drawFrozenLake,draw:drawGangcheol},
});
})();
