'use strict';
/* 채집: 따로 창을 띄우지 않는다. 흙더미(G.digs) 앞에 서면 그 위에 고리가 줄어들고,
   고리가 가운데 원에 닿을 때 휘두르면(딱!) 두 몫을 판다. 아무 때나 휘둘러도 한 몫은 파이므로 벌은 없고 느릴 뿐이다.
   아이템별 설정은 defineGather 로 지역이 넣는다: {title, hits:보통 타수, hint:처음 캘 때 한 번 띄우는 말}
   수치는 minigames.csv 의 gather_* (고리 주기·판정 창·딱 힘·수량). 처음 캐면 남는 일기는 지역의 gatherDiary:[id, 글] */
const gatherCue={d:null,start:0,just:false,pops:[],dirt:[]};
function gatherCycle(){const MG=TABLES.MINIGAMES;return MG.gather_ring_period+MG.gather_just_window;}
/* 지금 고리 상태: t는 0(크게)→1(가운데 원에 닿음). 닿은 뒤 판정 창 동안 1로 머문다 */
function gatherPhase(){
  const MG=TABLES.MINIGAMES,f=(G.anim-gatherCue.start)%gatherCycle();
  return {t:Math.min(1,f/MG.gather_ring_period),just:f>=MG.gather_ring_period-MG.gather_just_window};
}
/* 휘두르기를 누른 순간에 판정한다 (손이 닿는 프레임보다 먼저라 누른 박자가 그대로 맞는다) */
function gatherPress(){const d=nearDig();gatherCue.just=!!(d&&!d.cache&&gatherCue.d===d&&gatherPhase().just);}
/* 휘두르기가 흙더미에 닿았을 때 (doHit) */
// 결정 D-31: 채집은 따로 창 없이 필드에서 고리 타이밍. 딱이면 두 몫, 아무 때나 쳐도 한 몫 (design/data/decisions.csv)
function gatherHit(d){
  const cfg=GATHER[d.item],MG=TABLES.MINIGAMES;if(!cfg||d.done)return;
  const just=gatherCue.just;gatherCue.just=false;
  if(!G.f.gatherHinted)G.f.gatherHinted={};
  if(!G.f.gatherHinted[d.item]){G.f.gatherHinted[d.item]=true;toast(cfg.hint);}
  d.prog=(d.prog||0)+(just?MG.gather_perfect_power:1);if(!just)d.flaw=true;
  Sound.gather(true);
  const y=(d.y??fieldGround())-10;
  Vfx.scatter(d.x,y+6,d.item,just);   // 캐는 물건에 따라 흙먼지 또는 잎
  gatherCue.pops.push({x:d.x,y,t:28,text:just?'딱!':''});
  for(let i=0;i<(just?9:4);i++)gatherCue.dirt.push({x:d.x,y:y+6,vx:(Math.random()-.5)*(just?2.6:1.6),vy:-Math.random()*(just?2.4:1.5),t:22,c:just?'#fff3b0':'#8b5a2b'});
  if(just)shakeT=Math.max(shakeT,4);
  gatherCue.start=G.anim;   // 한 번 칠 때마다 고리가 처음부터 다시 줄어든다
  if(d.prog>=cfg.hits)finishGather(d);
}
function finishGather(d){
  const id=d.item,MG=TABLES.MINIGAMES;d.done=true;d.busy=false;
  const perfect=!d.flaw;Vfx.gather(d.x,(d.y??fieldGround())-4,id);
  spawnDrops(id,perfect?MG.gather_perfect_yield:MG.gather_yield,{x:d.x,y:d.y??fieldGround(),zone:d.zone});
  if(perfect)setTimeout(()=>toast('딱딱 맞춰 캐냈다! '+ITEMS[id].n+' ×'+MG.gather_perfect_yield),700);
  if(REG.gatherDiary)diary(REG.gatherDiary[0],REG.gatherDiary[1]);
  if(gatherCue.d===d)gatherCue.d=null;
}
/* 흙더미 위 고리·진행 점·튀는 흙. 필드 그리기에서 흙더미 다음에 부른다 */
function drawGatherCue(){
  const d=nearDig(),live=d&&!d.cache&&GATHER[d.item]?d:null;
  if(live!==gatherCue.d){gatherCue.d=live;gatherCue.start=G.anim;}
  const c=ctx;
  if(live){
    // 흙더미 바닥에 납작한 과녁: 가운데 작은 원(흙더미 둘레)으로 큰 고리가 줄어든다. 주인공 몸과 겹치지 않게 땅 높이에 그린다.
    const cfg=GATHER[live.item],x=Math.round(live.x-cam),y=Math.round((live.y??fieldGround())-3),{t,just}=gatherPhase();
    const r0=8,r=r0+(1-t)*16,flat=.42;
    c.save();
    c.lineWidth=1;c.strokeStyle='rgba(58,40,24,.6)';c.beginPath();c.ellipse(x+.5,y+.5,r0,r0*flat,0,0,Math.PI*2);c.stroke();
    if(just){c.fillStyle='rgba(255,228,138,.5)';c.beginPath();c.ellipse(x+.5,y+.5,r0,r0*flat,0,0,Math.PI*2);c.fill();}
    c.lineWidth=just?2:1;c.strokeStyle=just?'#ffe48a':'#fff9e8';c.beginPath();c.ellipse(x+.5,y+.5,r,r*flat,0,0,Math.PI*2);c.stroke();
    c.restore();
    // 진행 점: 흙더미 바로 위. 채운 점 = 판 몫
    const need=cfg.hits,done=Math.min(need,live.prog||0);
    R(x-need*2-1,y-23,need*4+3,6,'rgba(42,30,20,.75)');
    for(let i=0;i<need;i++)R(x-need*2+1+i*4,y-21,3,2,i<done?'#ffe48a':'#7d6a52');
  }
  for(let i=gatherCue.dirt.length-1;i>=0;i--){const p=gatherCue.dirt[i];
    if(!paused()){p.x+=p.vx;p.y+=p.vy;p.vy+=.15;p.t--;}
    if(p.t<=0){gatherCue.dirt.splice(i,1);continue;}if(!Vfx.reducedMotion)R(p.x-cam,p.y,1,1,p.c);}
  for(let i=gatherCue.pops.length-1;i>=0;i--){const p=gatherCue.pops[i];
    if(!paused())p.t--;if(p.t<=0){gatherCue.pops.splice(i,1);continue;}
    if(p.text){c.save();c.font='bold 9px "Gowun Dodum", sans-serif';c.textAlign='center';c.fillStyle='#3a2818';
      const yy=Math.round(p.y-28-(28-p.t)*.3);c.fillText(p.text,Math.round(p.x-cam)+1,yy+1);c.fillStyle='#ffe48a';c.fillText(p.text,Math.round(p.x-cam),yy);c.restore();}
  }
}
