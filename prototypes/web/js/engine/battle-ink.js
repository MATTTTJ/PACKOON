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

/* 칡 선택 기능. 고리와 통로의 여백은 공격이 모두 지나갈 때까지 남긴다. */
function drawVineLoop(c,x,y,r,alpha){
  const pts=[];for(let i=0;i<=12;i++){const a=-0.3+i*Math.PI*1.8/12;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r*0.65]);}
  brush(c,pts,3,INK,alpha);
  brush(c,[[x+r,y-3],[x+r+8,y-12]],1.4,INK,alpha);
}
function drawVineAim(c,x,y,progress,alpha){
  blob(c,x,y,5,5,RED,alpha);
  // 먹점이 손에 가려져도 겨냥을 읽을 수 있도록 바깥 고리를 함께 좁힌다.
  c.save();c.strokeStyle=RED;c.globalAlpha=alpha;c.lineWidth=1.6;c.beginPath();c.arc(x,y,26-4*progress,0,Math.PI*2);c.stroke();c.restore();
}
function drawVinePath(c){
  const p=B.vinePath,g=vineBounds(),y=BOX.y+p.v*BOX.h,seed=B.cur.atk==='kudzuSeeds';
  c.save();c.fillStyle='rgba(255,255,255,.85)';c.fillRect(g.x-g.w/2,BOX.y,g.w,BOX.h);c.restore();
  // 갈필 선은 여백 바깥에만 남긴다. 뿌리 균열도 예고부터 끝까지 같은 자리다.
  c.save();clipVineDanger(c);
  for(let x=BOX.x+6;x<BOX.x+BOX.w;x+=20){
    if(B.cur.atk==='kudzuRoots')brush(c,[[x,BOX.y+BOX.h],[x-5,BOX.y+BOX.h*.6],[x+4,BOX.y+8]],1.2,INK,0.3);
    else if(!seed)brush(c,[[x,BOX.y+7],[x+5,BOX.y+13]],2,RED,0.65);
  }c.restore();
  for(const s of [-1,1])brush(c,[[g.x+s*(g.w/2+2),BOX.y+3],[g.x+s*(g.w/2+4),BOX.y+BOX.h-3]],1,INK,0.22);
  drawVineLoop(c,g.x,y,28+(p.width-78)/4,p.dragging?1:0.7);
  c.save();c.font='12px "Gowun Dodum", sans-serif';c.textAlign='center';c.fillStyle=INK;
  c.fillText(B.st==='tell'?(p.dragging?'놓으면 고정':p.locked?'고정한 통로':(TOUCH?'치기':'J')+' 누른 채 끌기'):(seed?'먹점을 보고 옆으로':'비워 둔 길'),g.x,BOX.y+BOX.h-8);c.restore();
  if(seed&&B.st==='tell'){
    brush(c,[[BOX.x+BOX.w/2,BOX.y],[B.px,B.py]],1,INK,0.3);drawVineAim(c,B.px,B.py,0,0.65);
  }
}
function drawCalmKnot(c){
  const p=coverPoint(B.calmStone),near=Math.hypot(p.x-B.px,p.y-B.py)<26;
  drawVineLoop(c,p.x-5,p.y,14,0.85);drawVineLoop(c,p.x+7,p.y+4,12,0.75);
  brush(c,[[p.x-20,p.y+2],[p.x-26,p.y+14]],2,INK,0.6);
  c.save();c.strokeStyle=RED;c.lineWidth=1.7;c.beginPath();c.arc(p.x,p.y,23,0,Math.PI*2*(B.calmStone.t/150));c.stroke();
  c.font='12px "Gowun Dodum", sans-serif';c.fillStyle=near?RED:INK;c.textAlign='center';c.fillText((TOUCH?'치기':HITKEY)+' · 매듭 풀기',clamp(p.x,BOX.x+65,BOX.x+BOX.w-65),p.y-30);c.restore();
}
function drawScentKnot(c){
  const s=B.scentKnot,t=Math.min(1,(90-s.t)/36),p=coverPoint({u:0.5+(s.u-0.5)*t,v:s.v*t});
  brush(c,[[BOX.x+BOX.w/2,BOX.y],[p.x-24,p.y-22],[p.x,p.y]],2,INK,0.5);
  drawVineLoop(c,p.x,p.y,16,Math.min(1,s.t/20));
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
