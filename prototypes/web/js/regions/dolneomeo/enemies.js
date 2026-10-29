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

defineEnemies({
  golem:{name:'돌 골렘',calmLabel:'진정',
    intro:'[시험판] 첫서리 내린 성황당. 돌 아래 여백에 손을 숨기자. 다리부터 노려 보자.',
    cover:true,calmAction:{amount:TABLES.CALM.golem.story_stone/4},placeGift:'story_stone',
    headPose(){return {x:LW/2,y:EY+0.84*(-34+(part('leg').broken?28:0)+Math.sin(B.time*0.04)*2)};},
    markPosition(p){if(p.id==='head')return {x:BOX.x+BOX.w/2,y:BOX.y+30+(part('leg').broken?28*0.84:0)};},
    parts:tableParts('golem',{leg:{atk:'golemPillar',tell:'갈라진 바닥 밖으로! 솟은 돌은 다음 공격의 방패가 된다.'},arm:{atk:'golemSweep',tell:'돌팔이 쓸고 온다. 돌 아래 흰 여백이나 붓질의 틈으로!'},head:{atk:'golemThrow',tell:'눈돌이 손을 겨눈다. 먹선을 보고 돌 뒤로 숨자.'}}),
    likes:TABLES.CALM.golem,likeText:'돌무더기가 잠시 숨을 고른다.',
    likeTexts:{story_stone:'아빠가 못 올린 소원 돌을 건넸다. 돌 골렘이 가만히 내려다본다.'},
    coreHidden:'머리가 너무 높다. 다리나 팔을 먼저 무너뜨리자.',
    coreShown:'돌 골렘이 휘청인다! 이제 머리를 노릴 수 있다.',
    calmWin:'소원 돌이 꼭대기에 놓이자 돌 골렘이 스르르 내려앉는다. 다시 성황당 돌무더기로 돌아왔다.',
    win:'눈돌이 빠지자 돌 골렘이 와르르 무너진다.',
    lose:'돌 골렘에게 밀려 장승 앞까지 데굴데굴 굴러 내려왔다.',
    draw:drawGolem},
});
})();
