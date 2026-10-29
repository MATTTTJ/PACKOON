'use strict';
/* 수묵 붓 도구: 전투 화면과 보스 그림이 같이 쓴다. 흑백 + 단청 붉은색 하나 */
const INK='#1d1814',RED='#b4432a';
function brush(c,pts,w,col,alpha){
  c.save();c.globalAlpha=alpha==null?1:alpha;c.strokeStyle=col||INK;c.lineCap='round';c.lineJoin='round';
  for(let pass=0;pass<2;pass++){
    c.lineWidth=pass?w*0.45:w;c.globalAlpha=(alpha==null?1:alpha)*(pass?0.5:0.92);
    c.beginPath();c.moveTo(pts[0][0]+(pass?1.5:0),pts[0][1]+(pass?-1:0));
    for(let i=1;i<pts.length-1;i++){const mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;c.quadraticCurveTo(pts[i][0],pts[i][1],mx,my);}
    const l=pts[pts.length-1];c.lineTo(l[0],l[1]);c.stroke();
  }
  c.restore();
}
function blob(c,x,y,rx,ry,col,alpha){c.save();c.globalAlpha=alpha==null?1:alpha;c.fillStyle=col||INK;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();c.restore();}
/* 부위 색: 부서지면 흐리게, 예고 중이면 붉게 깜빡 */
function partCol(p){if(p.broken)return 'rgba(29,24,20,.22)';if(B.st==='tell'&&B.cur===p&&Math.floor(B.t/5)%2)return RED;return INK;}
function shk(p){return p.shake?Math.sin(p.shake*1.7)*4:0;}
/* 눈동자가 손(B.px, B.py)을 보게 */
function lookAt(cx,cy){const a=Math.atan2(B.py-cy,B.px-cx);return [Math.cos(a)*3,Math.sin(a)*3];}
/* 보스 그림에서 부위 찾기 */
const part=id=>B.parts.find(p=>p.id===id);

/* 무쇠 시험판. 흰 여백과 판정은 같은 상자 비율을 쓴다. */
function drawForgeBench(c){
  const p=coverPoint({u:0.74,v:0.42}),bottom=BOX.y+BOX.h;
  c.save();c.fillStyle='rgba(255,252,242,.95)';c.fillRect(p.x-32,p.y+12,64,bottom-p.y-12);
  brush(c,[[p.x-32,p.y+12],[p.x-32,p.y-2],[p.x+32,p.y-2],[p.x+32,p.y+12]],4,INK);
  brush(c,[[p.x-30,p.y+7],[p.x+30,p.y+7]],8,'#6b5540');
  c.fillStyle=INK;c.textAlign='center';c.font='12px "Gowun Dodum", sans-serif';
  c.fillText('바람막이',p.x,p.y-10);c.fillText('풀무 쉼터',p.x,bottom-10);c.restore();
}
function drawForgeWork(c,b){
  const X=BOX.x,Y=BOX.y,Wd=BOX.w,Ht=BOX.h,active=!b.preview&&b.t>b.tell;
  c.save();
  if(b.k==='forgeHammer'){
    const x=coverPoint(b).x;
    c.fillStyle=active?'rgba(29,24,20,.7)':'rgba(29,24,20,.12)';c.fillRect(x-36,Y,72,Ht);
    // 굵은 먹줄과 내려칠 망치 그림자는 예고 첫 프레임부터 자리를 고정한다.
    brush(c,[[x,Y+4],[x-2,Y+Ht-10]],active?22:7,INK,active?0.95:0.6);
    const hy=active?Y+Ht-40:Y+25;
    brush(c,[[x,hy+34],[x+4,hy]],5,INK,0.7);c.fillStyle=INK;c.globalAlpha=active?1:0.5;c.fillRect(x-25,hy-9,50,18);c.globalAlpha=1;
    brush(c,[[x-32,Y+Ht-24],[x+32,Y+Ht-24]],9,INK);
    brush(c,[[x-14,Y+Ht-22],[x-18,Y+Ht-5],[x+18,Y+Ht-5],[x+14,Y+Ht-22]],4,INK);
    c.fillStyle=INK;c.textAlign='center';c.font='12px "Gowun Dodum", sans-serif';
    c.fillText('쉼터',x>X+Wd/2?X+40:X+Wd-40,Y+Ht-10);
  }else if(b.k==='forgeWind'){
    const p=coverPoint({u:0.74,v:0.42});
    // 판 아래 흰 폭 64px에는 바람길도 불똥도 그리지 않는다.
    for(let x=X+8;x<X+Wd;x+=15){
      const end=Math.abs(x-p.x)<=32?p.y-6:Y+Ht;
      brush(c,[[x,Y+3],[x+2,(Y+end)/2],[x,end]],active?4:1,INK,b.preview?0.3:active?0.65:0.5);
      if(active){const y=Y+((b.t*5+x*3)%(end-Y));blob(c,x,y,3,5,RED,0.8);}
    }
    if(b.preview){c.fillStyle=INK;c.font='12px "Gowun Dodum", sans-serif';c.textAlign='left';c.fillText('다음 · 풀무',X+6,Y+17);}
  }else{
    const cx=X+Wd/2,ay=Y-Ht*0.15,half=Wd*0.38;
    c.fillStyle=active?'rgba(29,24,20,.6)':'rgba(29,24,20,.12)';c.beginPath();c.moveTo(cx,ay);c.lineTo(cx-half,Y+Ht);c.lineTo(cx+half,Y+Ht);c.closePath();c.fill();
    for(let i=-3;i<=3;i++)brush(c,[[cx,ay],[cx+i*half/3,Y+Ht]],active?5:1.7,INK,active?0.7:0.5);
    c.fillStyle=INK;c.font='12px "Gowun Dodum", sans-serif';c.textAlign='center';c.fillText('쉼터',X+25,Y+Ht-10);c.fillText('쉼터',X+Wd-25,Y+Ht-10);
  }
  c.restore();
}
function drawForgeVoice(c){
  const b=B.bullets.find(b=>b.k==='forgeShout');if(!b)return;
  const x=LW/2,y=EY+0.84*(-22+Math.sin(B.time*0.05)*2),grow=Math.min(1,b.t/b.tell);
  for(let i=-2;i<=2;i++)brush(c,[[x,y],[x+i*(8+grow*7),y+16+grow*25]],2+grow*2,INK,0.45);
  c.save();c.strokeStyle=INK;c.lineWidth=2;c.beginPath();c.ellipse(x,y+15+grow*18,15+grow*18,5+grow*9,0,0,Math.PI);c.stroke();c.restore();
}
function drawOpenHands(c){
  const lift=Math.sin((1-B.handShow/72)*Math.PI)*12;
  drawPaw(c,B.px-19,B.py-lift);drawPaw(c,B.px+19,B.py-lift);
  for(const x of [B.px-19,B.px+19])brush(c,[[x-4,B.py-lift+3],[x,B.py-lift+6],[x+4,B.py-lift+2]],1,'#e2cdb6');
}

/* 골렘 선택 기능의 수묵 표현. 흰 여백이 엄폐 범위다. */
function drawBattleCover(c){
  for(const r of B.covers){const p=coverPoint(r);
    c.save();c.fillStyle='rgba(255,255,255,.8)';c.fillRect(p.x-22,p.y+10,44,BOX.y+BOX.h-p.y-10);c.restore();
    blob(c,p.x,p.y+8,30,7,INK,0.14);
    blob(c,p.x,p.y,25,15,'#55534f');
    brush(c,[[p.x-23,p.y+3],[p.x-18,p.y-10],[p.x+7,p.y-15],[p.x+23,p.y-3]],3,INK);
    brush(c,[[p.x-15,p.y-7],[p.x+6,p.y-10]],2,'#f7f4ed',0.8);
    if(r.cracked)brush(c,[[p.x-4,p.y-12],[p.x+2,p.y-3],[p.x-5,p.y+3],[p.x+4,p.y+12]],2,r.flash>0?RED:INK);
    if(r.flash>0)blob(c,p.x,p.y,29,19,RED,r.flash/70);
  }
}
function drawWishStone(c){
  const p=coverPoint(B.calmStone),near=Math.hypot(p.x-B.px,p.y-B.py)<26;
  blob(c,p.x,p.y+13,23,7,INK,0.22);
  c.save();c.translate(p.x,p.y);c.rotate(0.4);blob(c,0,0,15,10,'#65625d');brush(c,[[-12,3],[0,-10],[14,0]],2,INK);c.restore();
  c.save();c.strokeStyle=RED;c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,23,0,Math.PI*2*(B.calmStone.t/150));c.stroke();
  c.fillStyle=near?RED:INK;c.textAlign='center';c.font='12px "Gowun Dodum", sans-serif';c.fillText((TOUCH?'치기':HITKEY)+' · 바로 놓기',p.x,p.y+32);c.restore();
}
function drawGolemAim(c){
  const shot=B.bullets.find(b=>b.k==='golemThrow'&&b.t<=b.tell);
  if(shot)brush(c,[[shot.x,shot.y],[shot.tx,shot.ty]],1.7,INK,0.55);
  else if(B.st==='tell'&&B.cur.atk==='golemThrow'){const p=B.E.headPose();brush(c,[[p.x,p.y],[B.px,B.py]],1.3,INK,0.45);}
  if(B.mark&&B.mark.part.id==='head'){
    const p=B.E.headPose();brush(c,[[p.x,p.y+20],[B.mark.x,B.mark.y-22]],1,INK,0.18);
  }
}
function drawPlacedGift(c){
  const f=B.giftPlace,p=B.E.headPose(),t=1-B.t/60,e=t*t*(3-2*t);
  const x=f.x+(p.x-f.x)*e,y=f.y+(p.y-30-f.y)*e;
  drawPaw(c,x,y+15);blob(c,x,y,12,8,'#65625d');brush(c,[[x-8,y-3],[x+3,y-6]],2,'#f7f4ed');
}
