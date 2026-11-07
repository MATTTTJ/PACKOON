'use strict';
/* 수묵 붓 도구: 전투 화면과 보스 그림이 같이 쓴다. 흑백 + 단청 붉은색 하나 */
// 결정 D-102: 전투 색은 먹 + 단청 붉은색 하나. 불(화덕 불꽃·도깨비불)만 주황 담채로 따로 둬 공격 신호의 붉은색과 헷갈리지 않게 한다.
// 결정 D-157: 칡꽃과 그 향만 연보라 담채로 둔다(칡꽃은 보랏빛이라야 칡꽃으로 읽힌다). 색은 단풍골 enemies.js 에 있다.
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

/* 결정 D-228: 칠 수 있는 곳과 피해야 할 것을 색으로 가른다 (D-102 의 먹·붉은색에 금빛 하나를 더한다).
   - 금빛: 칠 수 있는 곳(빈틈 표식). 둘레의 금빛 호는 남은 시간이다. (행동으로 달래는 자리는 D-243 으로 없앴다)
   - 붉은색·먹: 무조건 피해야 하는 공격과 그 예고. 공격 예고 동안에는 글귀 앞에 작은 붉은 세모만 뜬다(D-227). */
const GOLD='#c98a12',GOLD_LT='rgba(244,207,99,';
function drawStrikeSpot(c,x,y,r,k,near,tool){
  const t=B?B.time:0,pulse=0.5+0.5*Math.sin(t*0.22);
  c.save();
  const g=c.createRadialGradient(x,y,r*0.15,x,y,r*1.4);g.addColorStop(0,GOLD_LT+(near?0.6:0.32+0.1*pulse)+')');g.addColorStop(1,GOLD_LT+'0)');
  c.fillStyle=g;c.beginPath();c.arc(x,y,r*1.4,0,Math.PI*2);c.fill();
  c.strokeStyle=GOLD;c.lineCap='round';c.lineWidth=near?3.4:2.4;
  c.beginPath();c.arc(x,y,r,-Math.PI/2,-Math.PI/2+Math.PI*2*clamp(k,0,1));c.stroke();
  c.lineWidth=2;
  for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,r1=r+4+pulse*3,r2=r1+5;c.beginPath();c.moveTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1);c.lineTo(x+Math.cos(a)*r2,y+Math.sin(a)*r2);c.stroke();}
  if(near){c.strokeStyle='#fffaf0';c.lineWidth=1.6;c.beginPath();c.arc(x,y,Math.max(4,r-5),0,Math.PI*2);c.stroke();}
  // 결정 D-373: 칠 자리 옆에 잘 먹는 도구 그림·Q 키를 그리지 않는다. 어느 도구가 먹는지는 친 뒤의 글로 안다
  c.restore();
}
function drawDangerSign(c,x,y,s=1,t=0){
  c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=0.75+0.25*Math.sin(t*0.5);
  c.fillStyle=RED;c.strokeStyle=INK;c.lineWidth=1.2;c.lineJoin='round';
  c.beginPath();c.moveTo(0,-8);c.lineTo(8,6);c.lineTo(-8,6);c.closePath();c.fill();c.stroke();
  c.fillStyle='#fff6e8';c.fillRect(-1,-3.5,2,5.5);c.fillRect(-1,3,2,1.8);
  c.restore();
}

function drawOpenHands(c){
  const lift=Math.sin((1-B.handShow/72)*Math.PI)*12;
  // 결정 D-375: 손은 늘 하나다. 빈손을 펴 보이는 장면도 그 손 하나를 뒤집어 손바닥을 보인다 (손이 둘로 보이던 일, 사용자 피드백 2026-11-03)
  drawPaw(c,B.px,B.py-lift,true);
  brush(c,[[B.px-4,B.py-lift+3],[B.px,B.py-lift+6],[B.px+4,B.py-lift+2]],1,'#e2cdb6');
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
    // 결정 D-246: o:'y' 는 위아래로 오는 공격. 빈 띠와 화살표를 그 방향으로 그린다
    const arrow=(x,y,dx,dy)=>{brush(c,[[x,y],[x+dx*38,y+dy*38]],2,INK,0.7);
      brush(c,[[x+dx*27-dy*6,y+dy*27-dx*6],[x+dx*38,y+dy*38],[x+dx*27+dy*6,y+dy*27+dx*6]],2,INK,0.7);};
    if(p.kind==='sweep'&&p.o==='y'){
      const x=X+p.gap*W,hw=p.half*W;c.fillRect(x-hw,Y,hw*2,H);
      brush(c,[[x-hw,Y],[x-hw,Y+H]],1.5,RED,0.6);brush(c,[[x+hw,Y],[x+hw,Y+H]],1.5,RED,0.6);
      arrow(x,p.side>0?Y+14:Y+H-14,0,p.side>0?1:-1);
    }else if(p.kind==='sweep'){
      const y=Y+p.gap*H,hh=p.half*H;c.fillRect(X,y-hh,W,hh*2);
      brush(c,[[X,y-hh],[X+W,y-hh]],1.5,RED,0.6);brush(c,[[X,y+hh],[X+W,y+hh]],1.5,RED,0.6);
      arrow(p.side>0?X+30:X+W-30,y,p.side,0);
    }else if(p.kind==='beans'&&p.o==='y'){
      c.fillRect(X,Y+(p.gap-p.half)*H,W,2*p.half*H);
      const from=p.side>0?X+8:X+W-8,to=p.side>0?X+W-8:X+8;
      for(const v of p.dots){const y=Y+v*H;brush(c,[[X+6,y],[X+W-5,y]],1,INK,0.18);blob(c,from,y,4,5,INK,0.9);blob(c,to,y,3,4,RED,0.7);}
    }else if(p.kind==='beans'){
      c.fillRect(X+(p.gap-p.half)*W,Y,2*p.half*W,H);
      for(const u of p.dots){const x=X+u*W;brush(c,[[x,Y+6],[x,Y+H-5]],1,INK,0.18);blob(c,x,Y+8,5,4,INK,0.9);blob(c,x,Y+H-8,4,3,RED,0.7);}
    }else if(p.kind==='roll'&&p.o==='y'){
      const edge=Y+(p.side<0?p.depth:1-p.depth)*H;
      c.fillRect(X,p.side<0?edge+9:Y,W,(1-p.depth)*H-9);
      brush(c,[[X,edge],[X+W,edge]],2.5,RED,0.85);
      arrow(X+W/2,edge+(p.side<0?-30:30),0,p.side<0?1:-1);
    }else if(p.kind==='roll'){
      const edge=X+(p.side<0?p.depth:1-p.depth)*W;
      c.fillRect(p.side<0?edge+9:X,Y,(1-p.depth)*W-9,H);
      brush(c,[[edge,Y],[edge,Y+H]],2.5,RED,0.85);
      const x=edge+(p.side<0?22:-22);brush(c,[[edge,Y+H/2],[x,Y+H/2]],2,INK,0.6);
      brush(c,[[x+(p.side<0?-6:6),Y+H/2-5],[x,Y+H/2],[x+(p.side<0?-6:6),Y+H/2+5]],2,INK,0.6);
    }
  }
  // 다음 되치기 자리를 옅은 금빛 점선으로 미리 보인다 (결정 D-228: 글은 쓰지 않는다)
  if(!B.mark&&B.st!=='open'){
    const m=B.E.markPosition(B.cur);
    c.strokeStyle=GOLD;c.globalAlpha=0.45;c.lineWidth=1.2;c.setLineDash([3,4]);c.beginPath();c.arc(m.x,m.y,20,0,Math.PI*2);c.stroke();c.setLineDash([]);
  }
  c.restore();
}
