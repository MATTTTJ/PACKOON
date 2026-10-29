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
