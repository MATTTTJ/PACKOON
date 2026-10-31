'use strict';
/* 채집: 따로 창을 띄우지 않는다. 흙더미(G.digs) 앞에 서면 채집 지점(뿌리 끝·버섯 밑동·억새 밑동) 바로 위에
   작은 목표 원이 뜨고, 점에서 시작한 고리가 커지며 그 원에 들어온다. 꼭 맞을 때 휘두르면(딱!) 두 몫을 파고 한 개가 더 나온다.
   아무 때나 휘둘러도 한 몫은 파이므로 벌은 없고 느릴 뿐이다.
   아이템별 설정은 defineGather 로 지역이 넣는다: {title, hits:보통 타수, hint:처음 캘 때 한 번 띄우는 말, spot:[dx,dy] 채집 지점}
   수치는 minigames.csv 의 gather_* (고리 주기·판정 창·딱 힘·수량·원 크기). 처음 캐면 남는 일기는 지역의 gatherDiary:[id, 글] */
const gatherCue={d:null,start:0,just:false,pops:[],dirt:[]};
function gatherCycle(){const MG=TABLES.MINIGAMES;return MG.gather_ring_period+MG.gather_just_window;}
/* 지금 고리 상태: t는 0(점)→1(목표 원에 꼭 맞음). 맞은 뒤 판정 창 동안 1로 머문다 */
function gatherPhase(){
  const MG=TABLES.MINIGAMES,f=(G.anim-gatherCue.start)%gatherCycle();
  return {t:Math.min(1,f/MG.gather_ring_period),just:f>=MG.gather_ring_period-MG.gather_just_window};
}
/* 휘두르기를 누른 순간에 판정한다 (손이 닿는 프레임보다 먼저라 누른 박자가 그대로 맞는다) */
function gatherPress(){const d=nearDig();gatherCue.just=!!(d&&!d.cache&&gatherCue.d===d&&gatherPhase().just);}
/* 휘두르기가 흙더미에 닿았을 때 (doHit) */
// 결정 D-31: 채집은 따로 창 없이 필드에서 고리 타이밍. 딱이면 두 몫, 아무 때나 쳐도 한 몫 (design/data/decisions.csv)
// 결정 D-41: 고리는 채집 지점 근처에서 점→목표 원으로 커진다. 딱 한 번마다 한 개 더, 고리 모양은 변신마다 다르다 (design/data/decisions.csv)
function gatherHit(d){
  const cfg=GATHER[d.item],MG=TABLES.MINIGAMES;if(!cfg||d.done)return;
  const just=gatherCue.just;gatherCue.just=false;
  if(!G.f.gatherHinted)G.f.gatherHinted={};
  if(!G.f.gatherHinted[d.item]){G.f.gatherHinted[d.item]=true;toast(cfg.hint);}
  d.prog=(d.prog||0)+(just?MG.gather_perfect_power:1);if(just)d.perfects=(d.perfects||0)+1;
  Sound.gather(true);
  const sp=gatherSpot(d),y=sp.y-4;
  Vfx.scatter(d.x,y+6,d.item,just);   // 캐는 물건에 따라 흙먼지 또는 잎
  gatherCue.pops.push({x:d.x,y,t:28,text:just?'딱! +'+MG.gather_perfect_bonus:''});
  for(let i=0;i<(just?9:4);i++)gatherCue.dirt.push({x:d.x,y:y+6,vx:(Math.random()-.5)*(just?2.6:1.6),vy:-Math.random()*(just?2.4:1.5),t:22,c:just?'#fff3b0':'#8b5a2b'});
  if(just)shakeT=Math.max(shakeT,4);
  gatherCue.start=G.anim;   // 한 번 칠 때마다 고리가 점에서 다시 커진다
  if(d.prog>=cfg.hits)finishGather(d);
}
function finishGather(d){
  const id=d.item,MG=TABLES.MINIGAMES;d.done=true;d.busy=false;
  // 딱 한 번마다 한 개 더. 진행에 쓰는 개수는 기본 한 개로 이미 채워지므로 더 나와도 깨지지 않는다.
  const extra=(d.perfects||0)*MG.gather_perfect_bonus,n=MG.gather_yield+extra;Vfx.gather(d.x,(d.y??fieldGround())-4,id);
  spawnDrops(id,n,{x:d.x,y:d.y??fieldGround(),zone:d.zone});
  if(extra)setTimeout(()=>toast('딱 맞춰 캐냈다! '+ITEMS[id].n+' ×'+n),700);
  if(REG.gatherDiary)diary(REG.gatherDiary[0],REG.gatherDiary[1]);
  if(gatherCue.d===d)gatherCue.d=null;
}
/* 채집 지점: 흙더미 그림에서 실제로 캐는 곳(뿌리 끝·밑동). 지역이 spot:[dx,dy]로 준다 */
function gatherSpot(d){const s=GATHER[d.item]?.spot||[0,-8];return {x:d.x+s[0],y:(d.y??fieldGround())+s[1]};}
/* 고리 무늬: 지금 모습(G.form)에 따라 고리를 이루는 작은 도트 조각이 다르다. [dx,dy,색] 목록, 가운데가 0,0 */
const GATHER_MARKS={
  '':[[0,-1,'#d9682b'],[-1,0,'#e8913a'],[0,0,'#f2b25a'],[1,0,'#e8913a'],[0,1,'#8a4a22']],             // 너구리: 단풍잎
  squirrel:[[-1,-1,'#5e3b1e'],[0,-1,'#6b4423'],[1,-1,'#5e3b1e'],[0,0,'#c8893f'],[0,1,'#a8692c']],    // 다람쥐: 도토리 깍정이
  goat:[[-1,-1,'#efe6d2'],[0,-1,'#d9cbb0'],[1,0,'#d9cbb0'],[1,1,'#8a7a5e']],                           // 산양: 굽은 뿔
  owl:[[0,-1,'#e8d6b0'],[0,0,'#a88456'],[0,1,'#7a5a36'],[-1,1,'#a88456']],                             // 수리부엉이: 깃털
  deer:[[-1,0,'#5a4632'],[-1,1,'#5a4632'],[1,0,'#5a4632'],[1,1,'#5a4632']]                             // 고라니: 갈라진 발굽 자국
};
function drawGatherRing(x,y,r,just){
  const marks=GATHER_MARKS[G.form||'']||GATHER_MARKS[''];
  if(r<1.5){R(x,y,1,1,just?'#ffe48a':marks[2]?.[2]||'#fff9e8');return;}
  const n=Math.max(3,Math.min(6,Math.round(r*.8))),spin=(G.anim*.02)%(Math.PI*2);
  // 조각마다 테두리를 먼저 깔아 흙·풀 위에서도 보이게 한다. 딱일 때는 테두리가 금빛.
  const pts=[];for(let i=0;i<n;i++){const a=spin+i*Math.PI*2/n;pts.push([Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r)]);}
  const edge=just?'#ffe48a':'rgba(30,20,12,.75)';
  for(const [cx,cy] of pts)for(const [dx,dy] of marks)R(cx+dx-1,cy+dy-1,3,3,edge);
  for(const [cx,cy] of pts)for(const [dx,dy,c] of marks)R(cx+dx,cy+dy,1,1,c);
}
/* 흙더미 위 고리·진행 점·튀는 흙. 필드 그리기에서 흙더미 다음에 부른다 */
function drawGatherCue(){
  const d=nearDig(),live=d&&!d.cache&&GATHER[d.item]?d:null;
  if(live!==gatherCue.d){gatherCue.d=live;gatherCue.start=G.anim;}
  const c=ctx;
  if(live){
    // 채집 지점 바로 위의 작은 목표 원. 점에서 시작한 고리가 커져 이 원에 꼭 맞을 때가 딱이다.
    const cfg=GATHER[live.item],sp=gatherSpot(live),x=Math.round(sp.x-cam),y=Math.round(sp.y),{t,just}=gatherPhase();
    const r0=TABLES.MINIGAMES.gather_ring_radius;
    c.save();
    if(just){c.fillStyle='rgba(255,228,138,.35)';c.beginPath();c.arc(x+.5,y+.5,r0+1,0,Math.PI*2);c.fill();}
    c.lineWidth=1;c.strokeStyle='rgba(42,30,20,.7)';c.setLineDash([2,2]);c.beginPath();c.arc(x+.5,y+.5,r0+1.5,0,Math.PI*2);c.stroke();
    c.restore();
    drawGatherRing(x,y,t*r0,just);
    // 진행 점: 목표 원 바로 위. 채운 점 = 판 몫
    const need=cfg.hits,done=Math.min(need,live.prog||0),top=y-r0-9;
    R(x-need*2-1,top,need*4+3,6,'rgba(42,30,20,.75)');
    for(let i=0;i<need;i++)R(x-need*2+1+i*4,top+2,3,2,i<done?'#ffe48a':'#7d6a52');
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
