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
