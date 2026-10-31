'use strict';
/* 수묵 붓 도구: 전투 화면과 보스 그림이 같이 쓴다. 흑백 + 단청 붉은색 하나 */
// 결정 D-102: 전투 색은 먹 + 단청 붉은색 하나. 불(화덕 불꽃·도깨비불)만 주황 담채로 따로 둬 공격 신호의 붉은색과 헷갈리지 않게 한다.
const INK='#1d1814',RED='#b4432a',FIRE='#d9822b';
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

function drawOpenHands(c){
  const lift=Math.sin((1-B.handShow/72)*Math.PI)*12;
  drawPaw(c,B.px-19,B.py-lift);drawPaw(c,B.px+19,B.py-lift);
  for(const x of [B.px-19,B.px+19])brush(c,[[x-4,B.py-lift+3],[x,B.py-lift+6],[x+4,B.py-lift+2]],1,'#e2cdb6');
}

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
  const shot=B.bullets.find(b=>b.k==='golemThrow'&&!b.dead);
  if(shot)brush(c,[[shot.sx,shot.sy],[shot.tx,shot.ty]],1.7,INK,0.55);
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

/* 빙의 경로와 도착점은 보스 그림과 같은 좌표를 쓴다. 공격 중에도 경로를 지우지 않는다. */
function possessionPoint(){
  const rule=B.E.possession;
  const t=B.st==='tell'?clamp((rule.travel+rule.wait-B.t)/rule.travel,0,1):1;
  return possessionPathPoint(t);
}
function possessionPathPoint(t){
  const s=B.possession,a=B.E.partPose(s.from),z=B.E.partPose(s.to);
  const mx=(a.x+z.x)/2,my=Math.min(a.y,z.y)-32;
  return {x:(1-t)**2*a.x+2*(1-t)*t*mx+t*t*z.x,y:(1-t)**2*a.y+2*(1-t)*t*my+t*t*z.y};
}
function drawPossession(c){
  if(!B.cur||B.st==='end')return;
  const z=B.E.partPose(B.possession.to);
  brush(c,Array.from({length:17},(_,i)=>{const p=possessionPathPoint(i/16);return [p.x,p.y];}),3,RED,0.55);
  // 도착한 헌물의 손잡이·테두리·끝선에 불의 붓결이 남는다.
  if(B.cur.id==='broom')brush(c,[[z.x+24,z.y-70],[z.x,z.y],[z.x-20,z.y+42]],3,RED,0.65);
  else if(B.cur.id==='ki'){
    const pts=[];for(let i=0;i<=12;i++){const a=i*Math.PI/6;pts.push([z.x+36*Math.cos(a),z.y+24*Math.sin(a)]);}brush(c,pts,3,RED,0.65);
  }else if(B.cur.id==='meongseok')brush(c,[[z.x-72,z.y-13],[z.x+74,z.y-13],[z.x+74,z.y+15],[z.x-72,z.y+15]],3,RED,0.65);
  const m=B.E.markPosition(B.cur);
  brush(c,[[z.x,z.y+18],[m.x,m.y]],1.2,INK,0.22);
}
function drawPossessedAttack(c){
  const p=B.attackPlan;if(!B.cur||!['tell','atk','settle','open'].includes(B.st))return;
  const X=BOX.x,Y=BOX.y,W=BOX.w,H=BOX.h;
  c.save();
  if(p){
    c.fillStyle='rgba(29,24,20,.08)';c.fillRect(X,Y,W,H);c.fillStyle='#f7f4ed';
    if(p.kind==='sweep'){
      const y=Y+p.gap*H,hh=p.half*H;c.fillRect(X,y-hh,W,hh*2);
      brush(c,[[X,y-hh],[X+W,y-hh]],1.5,RED,0.6);brush(c,[[X,y+hh],[X+W,y+hh]],1.5,RED,0.6);
      const x=p.side>0?X+30:X+W-30;brush(c,[[x,y],[x+p.side*38,y]],2,INK,0.7);
      brush(c,[[x+p.side*27,y-6],[x+p.side*38,y],[x+p.side*27,y+6]],2,INK,0.7);
    }else if(p.kind==='beans'){
      c.fillRect(X+(p.gap-p.half)*W,Y,2*p.half*W,H);
      for(const u of p.dots){const x=X+u*W;brush(c,[[x,Y+6],[x,Y+H-5]],1,INK,0.18);blob(c,x,Y+8,5,4,INK,0.9);blob(c,x,Y+H-8,4,3,RED,0.7);}
    }else if(p.kind==='roll'){
      const edge=X+(p.side<0?p.depth:1-p.depth)*W;
      c.fillRect(p.side<0?edge+9:X,Y,(1-p.depth)*W-9,H);
      brush(c,[[edge,Y],[edge,Y+H]],2.5,RED,0.85);
      const x=edge+(p.side<0?22:-22);brush(c,[[edge,Y+H/2],[x,Y+H/2]],2,INK,0.6);
      brush(c,[[x+(p.side<0?-6:6),Y+H/2-5],[x,Y+H/2],[x+(p.side<0?-6:6),Y+H/2+5]],2,INK,0.6);
    }
  }
  // 다음 되치기 자리를 같은 헌물의 이름과 연결해 미리 읽게 한다.
  if(!B.mark&&B.st!=='open'){
    const m=B.E.markPosition(B.cur);blob(c,m.x,m.y,20,20,RED,0.06);
    c.strokeStyle=INK;c.globalAlpha=0.35;c.lineWidth=1;c.setLineDash([3,4]);c.beginPath();c.arc(m.x,m.y,20,0,Math.PI*2);c.stroke();c.setLineDash([]);
    c.globalAlpha=0.7;c.fillStyle=INK;c.textAlign='center';c.font='11px "Gowun Dodum", sans-serif';c.fillText(B.cur.name+' 되치기',m.x,m.y+32);
  }
  c.restore();
}
/* 튕겨 나온 물건과 원래 윤곽. 치기로 집고 치기로 놓으므로 터치와 키보드가 같은 동작이다. */
function marketObject(c,x,y,outline){
  if(!outline)blob(c,x,y,13,8,'#f7f4ed');
  brush(c,[[x-13,y-3],[x-9,y+7],[x+9,y+7],[x+13,y-3],[x-13,y-3]],2,INK,outline?0.4:0.9);
  brush(c,[[x-8,y-4],[x-6,y-11],[x+6,y-11],[x+8,y-4]],2,INK,outline?0.4:0.9);
}
function drawReturnedObject(c){
  const r=B.returnItem;
  if(r){
    const home=coverPoint({u:r.homeU,v:r.homeV}),src=coverPoint(r),p=r.held?{x:B.px,y:B.py-16}:src;
    c.save();c.setLineDash([3,3]);marketObject(c,home.x,home.y,true);c.restore();marketObject(c,p.x,p.y,false);
    if(r.active){
      brush(c,[[src.x,src.y],[home.x,home.y]],1,INK,0.2);
      const at=r.held?home:src,near=Math.hypot(at.x-B.px,at.y-B.py)<26;
      c.save();c.strokeStyle=RED;c.lineWidth=2;c.beginPath();c.arc(at.x,at.y,23,-Math.PI/2,-Math.PI/2+Math.PI*2*r.t/240);c.stroke();
      c.fillStyle=near?RED:INK;c.textAlign='center';c.font='12px "Gowun Dodum", sans-serif';
      c.fillText((TOUCH?'치기':HITKEY)+(r.held?' · 돌려놓기':' · 집기'),at.x,at.y+(r.held?30:-26));c.restore();
    }
  }
  if(B.returnEcho){
    const e=B.returnEcho,home=coverPoint(e),t=1-e.t/60;
    marketObject(c,home.x,home.y,false);
    // 도깨비가 옆 물건도 윤곽에 맞춰 돌려놓는다.
    const dest={x:home.x+(e.u>0.5?-38:38),y:home.y-24};
    c.save();c.setLineDash([3,3]);marketObject(c,dest.x,dest.y,true);c.restore();
    const x=LW/2+(dest.x-LW/2)*t,y=BOX.y-18+(dest.y-BOX.y+18)*t;
    blob(c,x,y-15,5,7,RED,0.7);marketObject(c,x,y,false);
  }
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
