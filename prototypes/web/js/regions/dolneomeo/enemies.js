'use strict';
/* 돌너머 전투: 돌 골렘 (깨어난 성황당 돌무더기). 원본 표: design/data/bosses.csv · boss_parts.csv
   [시험판] 부위 내구도와 재료는 표 그대로. 공격이 남긴 돌을 다음 공격의 엄폐물로 쓴다. */
(()=>{
const STONE='#2a2420';
/* 붓으로 찍은 돌 하나 */
function rock(c,x,y,rx,ry,col,alpha,seed){
  blob(c,x,y,rx,ry,col,alpha);
  brush(c,[[x-rx*0.7,y-ry*0.2+(seed%3)],[x-rx*0.1,y-ry*0.55],[x+rx*0.6,y-ry*0.3]],2,'#efe3c8',alpha==null?0.35:alpha*0.35);
}
function drawGolem(c){
  const cx=LW/2,cy=EY;const leg=part('leg'),arm=part('arm'),head=part('head');
  const bob=Math.sin(B.time*0.04)*2;
  const sink=leg.broken?28:0;   // 다리가 무너지면 주저앉아 머리가 낮아진다
  // 다리
  {const o=shk(leg),col=partCol(leg);const a=leg.broken?0.35:1;
    [-1,1].forEach(s=>{rock(c,cx+s*46+o,cy+112,24,16,col===INK?STONE:col,a,3);rock(c,cx+s*42+o,cy+88+sink*0.4,20,14,col===INK?'#3a332e':col,a,5);});}
  // 몸통
  const by=cy+50+sink+bob;
  rock(c,cx,by,74,46,'#2e2824',1,1);rock(c,cx-30,by-26,34,22,'#3a332e',1,2);rock(c,cx+28,by-22,30,20,'#332c28',1,4);
  for(let i=0;i<3;i++)brush(c,[[cx-60+i*36,by+30],[cx-50+i*36,by+10],[cx-36+i*36,by+24]],3,'#77736d',0.55);   // 이끼
  // 팔 (휩쓸기)
  {const o=shk(arm),col=partCol(arm);const raise=B.st==='tell'&&B.cur===arm?-26:0;const drop=arm.broken?56:0;
    [-1,1].forEach(s=>{const ax=cx+s*92+o,ay=by-14+raise*(s>0?1:0.4)+drop;
      brush(c,[[cx+s*56,by-18],[ax,ay],[ax+s*28,ay+30+drop*0.3]],10,col,arm.broken?0.35:0.85);
      rock(c,ax,ay,18,14,col===INK?STONE:col,arm.broken?0.3:1,s+3);rock(c,ax+s*30,ay+34+drop*0.3,20,16,col===INK?'#3a332e':col,arm.broken?0.3:1,s+6);});}
  // 머리
  {const o=shk(head),col=partCol(head);const hx=cx+o,hy=cy-34+sink+bob;
    rock(c,hx,hy,42,32,col===INK?'#352e2a':col,head.broken?0.3:1,7);
    brush(c,[[hx-40,hy-22],[hx-10,hy-34],[hx+24,hy-30],[hx+40,hy-18]],7,'#77736d',head.broken?0.25:0.8);   // 이끼 눈썹
    if(head.broken||(B.st==='end'&&B.result==='calm')){brush(c,[[hx-22,hy-2],[hx-10,hy+1]],3,'#efe3c8');brush(c,[[hx+10,hy+1],[hx+22,hy-2]],3,'#efe3c8');}
    else{const [ex,ey]=lookAt(hx,hy);blob(c,hx-16,hy-2,9,8,'#efe3c8');blob(c,hx+16,hy-2,9,8,'#efe3c8');blob(c,hx-16+ex,hy-2+ey,4,4.5,INK);blob(c,hx+16+ex,hy-2+ey,4,4.5,INK);}
    brush(c,[[hx-12,hy+18],[hx,hy+16],[hx+12,hy+18]],3,'#efe3c8',0.7);
    if(coreHidden()){c.save();c.strokeStyle=INK;c.globalAlpha=.5;c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.arc(hx,hy,50+i*7,Math.PI*1.1,Math.PI*1.9);c.stroke();}c.restore();}
  }
}

/* 결정 D-62: 모든 전투 배경은 상대 뒤쪽 화면 전체로 그린다 (design/data/decisions.csv).
   돌 골렘은 돌산 절벽 길. 양쪽 절벽, 절벽 위에서 늘어진 서리다래 덩굴, 길가의 돌탑과 장승. 찬 하늘. */
function drawStoneCliff(c){
  const t=B.time,still=Vfx.reducedMotion,gy=BOX.y-52,STONE='rgba(96,98,100,';
  let g=c.createLinearGradient(0,0,0,gy);g.addColorStop(0,'rgba(120,138,156,.18)');g.addColorStop(1,'rgba(120,138,156,.04)');
  c.save();c.fillStyle=g;c.fillRect(0,0,LW,gy);c.restore();
  // 먼 돌산 봉우리
  c.save();c.globalAlpha=0.09;c.fillStyle=INK;c.beginPath();c.moveTo(LW*0.2,gy);
  for(const [x,y] of [[0.3,0.35],[0.38,0.55],[0.47,0.25],[0.56,0.5],[0.64,0.3],[0.74,gy/gy]])c.lineTo(LW*x,y===1?gy:gy*y);
  c.closePath();c.fill();c.restore();
  // 양쪽 절벽: 들쭉날쭉한 바위 벽과 금
  const cliff=(side)=>{
    const x0=side<0?0:LW,edge=side<0?LW*0.27:LW*0.73,pts=[[x0,0]];
    for(let i=0;i<=8;i++){const y=i*gy/8;pts.push([edge+side*(-1)*(hash(i*2.1+side)*28-14)+side*Math.sin(i*1.3)*10,y]);}
    pts.push([x0,gy]);
    c.save();c.fillStyle=STONE+'.16)';c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(const p of pts)c.lineTo(p[0],p[1]);c.closePath();c.fill();c.restore();
    brush(c,pts.slice(1,-1),4,INK,0.42);
    for(let i=0;i<7;i++){const y=20+hash(i*3.7+side)*(gy-40),x=side<0?hash(i*1.9)*edge*0.85:LW-hash(i*1.9)*(LW-edge)*0.85;
      brush(c,[[x,y],[x+side*(-8),y+10],[x+side*(-4),y+22]],1.4,INK,0.25);}
  };
  cliff(-1);cliff(1);
  // 서리다래 덩굴: 오른쪽 절벽 위에서 늘어진 줄기와 서리 낀 열매
  for(let k=0;k<4;k++){
    const x=LW*0.76+k*LW*0.045,len=gy*(0.35+hash(k*2.2)*0.25),sw=still?0:Math.sin(t*0.025+k)*4;
    const pts=[];for(let s=0;s<=6;s++)pts.push([x+Math.sin(s*0.9+k)*8+sw*s/6,s*len/6]);
    brush(c,pts,2,'#4f6b3a',0.45);
    for(let s=2;s<=6;s+=2){blob(c,pts[s][0]+4,pts[s][1]+2,4,4,'#9fb8b0',0.7);blob(c,pts[s][0]+3,pts[s][1]+1,1.5,1.5,'#f4f6f2',0.8);}
  }
  // 길바닥
  c.save();c.fillStyle='rgba(110,104,96,.12)';c.fillRect(0,gy,LW,LH-gy);c.restore();
  brush(c,[[0,gy+2],[LW*0.4,gy-3],[LW,gy+3]],4,INK,0.45);
  for(let i=0;i<10;i++)blob(c,hash(i*7.3)*LW,gy+10+hash(i*3.1)*(LH-gy-20),5+hash(i)*8,3,STONE+'1)',0.14);
  // 돌탑: 왼쪽 길가에 크고 작은 둘
  const tower=(x,n,s)=>{let y=gy+2;for(let i=0;i<n;i++){const rw=(16-i*2.2)*s,rh=(6-i*0.4)*s;y-=rh*1.6;
    blob(c,x+(hash(x*0.1+i)-0.5)*3,y,rw,rh,STONE+'1)',0.32);c.save();c.strokeStyle=INK;c.globalAlpha=0.45;c.lineWidth=1.4;c.beginPath();c.ellipse(x+(hash(x*0.1+i)-0.5)*3,y,rw,rh,0,0,Math.PI*2);c.stroke();c.restore();}};
  tower(LW*0.12,6,1.1);tower(LW*0.2,4,0.8);
  // 장승 한 쌍: 오른쪽 길가
  const jang=(x,h,w)=>{const top=gy-h;
    c.save();c.fillStyle='rgba(120,92,64,.28)';c.fillRect(x-w/2,top,w,h);c.restore();
    brush(c,[[x-w/2,gy],[x-w/2,top+6],[x,top-4],[x+w/2,top+6],[x+w/2,gy]],3,INK,0.6);
    brush(c,[[x-w*0.35,top+12],[x-w*0.1,top+9]],2.4,INK,0.6);brush(c,[[x+w*0.1,top+9],[x+w*0.35,top+12]],2.4,INK,0.6);
    blob(c,x-w*0.2,top+16,2.4,2.4,INK,0.6);blob(c,x+w*0.2,top+16,2.4,2.4,INK,0.6);
    brush(c,[[x-w*0.25,top+28],[x,top+32],[x+w*0.25,top+28]],2,INK,0.55);
    for(let i=0;i<4;i++)brush(c,[[x,top+40+i*10],[x+2,top+46+i*10]],2,INK,0.35);};
  jang(LW*0.83,96,22);jang(LW*0.9,84,20);
  // 날리는 서리 가루
  if(!still)for(let i=0;i<14;i++){const y=((t*(0.2+hash(i)*0.3)+i*41)%(gy+20))-10,x=(hash(i*2.9)*LW+t*0.15*(1+hash(i)))%LW;c.save();c.globalAlpha=0.35;c.fillStyle='#f4f6f2';c.fillRect(x,y,2,2);c.restore();}
}
defineEnemies({
  golem:{name:'돌 골렘',calmLabel:'진정',
    intro:'[시험판] 첫서리 내린 성황당. 돌 아래 여백에 손을 숨기자. 머리는 높으니 다리나 팔이 틈을 보일 때 치자.',   // 결정 D-103: 부위는 고르지 않는다(확정 흐름). 고를 수 있는 것처럼 말하지 않는다
    cover:true,calmAction:{amount:TABLES.CALM.golem.story_stone/4},placeGift:'story_stone',
    headPose(){return {x:LW/2,y:EY+0.84*(-34+(part('leg').broken?28:0)+Math.sin(B.time*0.04)*2)};},
    markPosition(p){if(p.id==='head')return {x:BOX.x+BOX.w/2,y:BOX.y+30+(part('leg').broken?28*0.84:0)};},
    parts:tableParts('golem',{leg:{atk:'golemPillar',tell:'갈라진 바닥 밖으로! 솟은 돌은 다음 공격의 방패가 된다.'},arm:{atk:'golemSweep',tell:'돌 팔뚝이 쓸고 온다. 돌 아래 흰 여백이나 붓질의 틈으로!'},head:{atk:'golemThrow',tell:'눈돌이 손을 겨눈다. 먹선을 보고 돌 뒤로 숨자.'}}),
    likes:TABLES.CALM.golem,likeText:'돌무더기가 잠시 숨을 고른다.',
    likeTexts:{story_stone:'아빠가 못 올린 소원 돌을 건넸다. 돌 골렘이 가만히 내려다본다.'},
    coreHidden:'머리가 너무 높다. 다리나 팔을 먼저 무너뜨리자.',
    coreShown:'돌 골렘이 휘청인다! 이제 머리를 노릴 수 있다.',
    calmWin:'돌 골렘이 스르르 내려앉는다. 다시 성황당 돌무더기로 돌아왔다.',
    win:'눈돌이 빠지자 돌 골렘이 와르르 무너진다.',
    lose:'돌 골렘에게 밀려 데굴데굴 굴러 내려왔다.',
    backdrop:drawStoneCliff,draw:drawGolem},
});
})();
