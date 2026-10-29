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

/* 강철이의 먹 예고. 위험 범위는 공격이 끝날 때까지 옅게 남긴다. */
function drawWinterThreat(c,kind,t){
  for(let y=BOX.y+6;y<BOX.y+BOX.h;y+=12)for(let x=BOX.x+6;x<BOX.x+BOX.w;x+=12){
    if(warmSafe(x,y,10))continue;
    blob(c,x,y,7,7,INK,0.07);
    if(winterThreat(kind,t,x,y)){
      if(kind==='tail')brush(c,[[x-3,y-9],[x+3,y-9],[x,y+7]],3,INK,0.9);
      else brush(c,[[x-5,y+2],[x,y-2],[x+5,y+1]],12,INK,0.65);
    }
  }
  if(kind==='mouth')for(let y=BOX.y+24;y<BOX.y+BOX.h;y+=32){
    for(let x=BOX.x+8;x<BOX.x+BOX.w;x+=14)if(!warmSafe(x,y,10))brush(c,[[x-4,y],[x+4,y]],2,INK,0.2);
  }
  if(kind==='body')for(const u of [0.46,0.54])for(let y=BOX.y+8;y<BOX.y+BOX.h;y+=14){
    const x=BOX.x+BOX.w*u;if(!warmSafe(x,y,10))brush(c,[[x,y-4],[x,y+4]],3,RED,0.6);
  }
  if(kind==='tail')for(let i=0;i<=8;i++)for(let y=BOX.y+12;y<BOX.y+BOX.h;y+=30){
    const x=BOX.x+BOX.w*i/8;if(!warmSafe(x,y,10))blob(c,x,y,3,4,INK,0.4);
  }
}
function drawWarmPath(c){
  const w=B.warm;
  if(B.st==='tell')drawWinterThreat(c,B.cur.id,0);
  if(w.points.length){
    // 곡선 붓질로 길을 좁히지 않도록 판정과 같은 직선에 둥근 끝을 쓴다.
    c.save();c.strokeStyle='#faf9f5';c.lineWidth=w.width;c.lineCap='round';c.lineJoin='round';c.beginPath();
    w.points.forEach((r,i)=>{const p=coverPoint(r);if(i)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);});c.stroke();c.restore();
    for(let i=1;i<w.points.length;i++){
      const a=coverPoint(w.points[i-1]),z=coverPoint(w.points[i]);
      for(let q=0.15;q<1;q+=0.3){const x=a.x+(z.x-a.x)*q,y=a.y+(z.y-a.y)*q;
        brush(c,[[x-6,y+6],[x+4,y],[x-3,y-7]],1.5,INK,0.22);
      }
    }
  }
  for(const r of [w.current,w.next])if(r){const p=coverPoint(r);
    blob(c,p.x,p.y,38,38,'#faf9f5');blob(c,p.x,p.y+4,25,11,INK,0.12);
    for(let i=-1;i<=1;i++){const x=p.x+i*12,y=p.y-4;
      brush(c,[[x,y],[x-5,y-10],[x+4,y-20],[x,y-28]],2,INK,0.28);
    }
    if(r===w.next&&B.st!=='open'){
      brush(c,[[p.x-8,p.y+20],[p.x,p.y+26],[p.x+8,p.y+20]],2,RED,0.7);
    }
  }
  if(w.ice){const p=coverPoint(w.ice),near=Math.hypot(p.x-B.px,p.y-B.py)<26;
    brush(c,[[p.x-21,p.y+4],[p.x-8,p.y-7],[p.x+20,p.y+3],[p.x+5,p.y+12],[p.x-21,p.y+4]],2,INK,0.7);
    brush(c,[[p.x-9,p.y],[p.x,p.y+4],[p.x+7,p.y-2]],1.5,RED);
    c.save();c.strokeStyle=RED;c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,27,-Math.PI/2,-Math.PI/2+Math.PI*2*w.ice.t/180);c.stroke();
    c.fillStyle=near?RED:INK;c.font='12px "Gowun Dodum", sans-serif';c.textAlign='center';c.fillText((TOUCH?'치기':'J')+' · 얼음 걷기',p.x,p.y+(w.ice.v<0.5?-29:34));c.restore();
  }
  if(w.thaw){const p=coverPoint(w.thaw),f=w.thaw.t/90;
    for(let i=0;i<3;i++){const spread=18+i*8+(1-f)*15;
      brush(c,[[p.x-spread,p.y+5+i*5],[p.x,p.y+12+i*5],[p.x+spread,p.y+5+i*5]],1.5,INK,f*0.5);
    }
  }
}
