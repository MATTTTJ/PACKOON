'use strict';
/* 채집: 따로 창을 띄우지 않는다. 흙더미(G.digs) 앞에 서면 그 채집물을 감싸는
   기준원이 뜨고, 가운데 점 하나에서 원 하나가 밖으로 커진다. 커지는 원이 기준원에 꼭 맞을 때 휘두르면 딱(perfect),
   조금 어긋나면 좋아(good), 아무 때나 쳐도 한 몫은 판다(벌 없음). 원이 기준원을 지나치면 사라졌다가 다시 점에서 커진다.
   아이템별 설정은 defineGather 로 지역이 넣는다: {title, hits:보통 타수, hint, spot:[dx,dy] 캐는 자리(흙먼지·글자), box?:[x0,y0,x1,y1] 그림 범위, rare?:모두 딱일 때 덤으로 나오는 상위 재료}
   수치는 minigames.csv 의 gather_* (원이 커지는 시간·기준원 여유·딱/좋아 판정 창·딱 힘·수량). 처음 캐면 남는 일기는 지역의 gatherDiary:[id, 글] */
const gatherCue={d:null,start:0,grade:null,pops:[],dirt:[]};
// 결정 D-108: 원이 기준원에 닿는 프레임(ring_period) 앞뒤로 좋아 창만큼 더 커진 뒤 사라지고 다시 점에서 시작한다.
function gatherCycle(){const MG=TABLES.MINIGAMES;return MG.gather_ring_period+MG.gather_good_window;}
/* 지금 원 상태: r은 0(점)→1(기준원)→조금 넘침. off는 기준원에 닿는 순간과의 프레임 차이 */
function gatherPhase(){
  const MG=TABLES.MINIGAMES,f=(G.anim-gatherCue.start)%gatherCycle(),off=f-MG.gather_ring_period;
  const grade=Math.abs(off)<=MG.gather_perfect_window?'perfect':Math.abs(off)<=MG.gather_good_window?'good':null;
  return {r:f/MG.gather_ring_period,off,grade,just:grade==='perfect'};
}
/* 결정 D-266: 채집 자리의 설정은 보통 나오는 물건(d.item)으로 찾는다. 자리가 gather 이름을 달면 그 설정을 쓴다
   (돌너머 눈 둔덕은 파는 방법이 같고 나오는 물건만 자리마다 다르다). */
function gatherKey(d){return d&&GATHER[d.gather]?d.gather:d?.item;}
function gatherCfg(d){return d?GATHER[gatherKey(d)]:null;}
/* 결정 D-265: 길섶 채집물 (사용자 피드백 2026-11-02 "맵 가는 동안 빈 곳이 너무 많다").
   지역 field.js 가 구역 선언을 마친 뒤 [구역, 'p'(줍기)·'d'(캐기), x, 물건, 덧붙일 것?] 줄들을 넘긴다. y 는 덧붙일 것에 적고 없으면 바닥.
   x 는 길을 줄인 뒤(trimCuts)의 실제 자리로 적는다. 여기서 설계 좌표로 되돌려 넣으면 trimRegion 이 다시 같은 자리로 줄인다.
   id 는 접두사+구역+그 구역 안 순번이라, 줄을 지우거나 끼울 때는 그 구역의 뒤에 더한다(옛 저장의 got/done 을 지킨다). */
function addZoneGather(r,prefix,rows){
  const seen={};
  for(const [zone,kind,x,item,more={}] of rows){
    const z=r.zones?.[zone];if(!z||!ITEMS[item])continue;
    const key=kind==='d'?'digs':'pickups',list=Array.isArray(z[key])?z[key]:(z[key]=[]);
    const n=seen[zone+kind]=(seen[zone+kind]||0)+1,id=prefix+zone+'_'+kind+n,X=untrimX(x,r.trimCuts?.[zone]);
    list.push(kind==='d'?{id,x:X,item,done:false,...more}:{id,x:X,y:GROUND,item,got:false,...more});
  }
}
/* 휘두르기를 누른 순간에 판정한다 (손이 닿는 프레임보다 먼저라 누른 박자가 그대로 맞는다) */
function gatherPress(){const d=nearDig();gatherCue.grade=d&&!d.cache&&gatherCue.d===d?gatherPhase().grade:null;}
/* 휘두르기가 흙더미에 닿았을 때 (doHit) */
// 결정 D-31: 채집은 따로 창 없이 필드에서 고리 타이밍. 딱이면 두 몫, 아무 때나 쳐도 한 몫 (design/data/decisions.csv)
// 결정 D-108: 기준원 하나 + 점에서 커지는 원 하나. 딱이면 두 몫과 +1개, 한 흙더미를 모두 딱으로 캐면 상위 재료 하나 더 (design/data/decisions.csv)
function gatherHit(d){
  const cfg=gatherCfg(d),MG=TABLES.MINIGAMES;if(!cfg||d.done)return;
  const grade=gatherCue.grade,just=grade==='perfect';gatherCue.grade=null;if(!just)d.flaw=true;
  if(!G.f.gatherHinted)G.f.gatherHinted={};
  if(!G.f.gatherHinted[gatherKey(d)]){G.f.gatherHinted[gatherKey(d)]=true;toast(cfg.hint);}
  d.prog=(d.prog||0)+(just?MG.gather_perfect_power:1);if(just)d.perfects=(d.perfects||0)+1;
  Sound.gather(true);
  const sp=gatherSpot(d),y=sp.y-4;
  Vfx.scatter(d.x,y+6,'scatter' in cfg?cfg.scatter:d.item,just);   // 캐는 물건에 따라 흙먼지 또는 잎 (눈 둔덕은 흙먼지 자리에 눈가루)
  gatherCue.pops.push({x:d.x,y,t:28,text:just?'딱! +'+MG.gather_perfect_bonus:grade==='good'?'좋아':''});
  for(let i=0;i<(just?9:4);i++)gatherCue.dirt.push({x:d.x,y:y+6,vx:(Math.random()-.5)*(just?2.6:1.6),vy:-Math.random()*(just?2.4:1.5),t:22,c:just?'#fff3b0':cfg.dirt||'#8b5a2b'});
  if(just)shakeT=Math.max(shakeT,4);
  gatherCue.start=G.anim;   // 한 번 칠 때마다 고리가 점에서 다시 커진다
  if(d.prog>=cfg.hits)finishGather(d);
}
function finishGather(d){
  const id=d.item,MG=TABLES.MINIGAMES;d.done=true;d.busy=false;
  // 딱 한 번마다 한 개 더. 진행에 쓰는 개수는 기본 한 개로 이미 채워지므로 더 나와도 깨지지 않는다.
  const extra=(d.perfects||0)*MG.gather_perfect_bonus,n=MG.gather_yield+extra;Vfx.gather(d.x,(d.y??fieldGround())-4,id);
  spawnDrops(id,n,{x:d.x,y:d.y??fieldGround(),zone:d.zone});
  // 한 번도 어긋나지 않고 모두 딱이면, 그 자리에서 날 법한 한 단계 위 재료가 하나 더 나온다(지역 defineGather의 rare).
  const cfg=gatherCfg(d)||{},rare=!d.flaw&&d.perfects&&cfg.rare&&ITEMS[cfg.rare]?cfg.rare:null;
  if(rare){spawnDrops(rare,1,{x:d.x+6,y:d.y??fieldGround(),zone:d.zone});learn('gather:rare:'+id);}
  // 결정 D-266: 무엇이 왜 묻혀 있었는지 자리가 알려 준다(눈 둔덕). 딱 맞춘 알림은 그 뒤에 띄운다.
  if(d.found)setTimeout(()=>toast(d.found),250);
  if(rare)setTimeout(()=>toast('모두 딱 맞췄다! '+ITEMS[id].n+' ×'+n+' · '+ITEMS[rare].n+'도 나왔다'),d.found?1700:700);
  else if(extra)setTimeout(()=>toast('딱 맞춰 캐냈다! '+ITEMS[id].n+' ×'+n),d.found?1700:700);
  if(REG.gatherDiary)diary(REG.gatherDiary[0],REG.gatherDiary[1]);
  if(gatherCue.d===d)gatherCue.d=null;
}
/* 채집 지점: 흙더미 그림에서 실제로 캐는 곳(뿌리 끝·밑동). 지역이 spot:[dx,dy]로 준다 */
function gatherSpot(d){const s=gatherCfg(d)?.spot||[0,-8];return {x:d.x+s[0],y:(d.y??fieldGround())+s[1]};}
/* 결정 D-145: 기준원은 채집물 그림을 다 감싸는 크기에 여유(gather_ring_pad)만 더하고, 가운데는 그 그림 한가운데에 둔다 (피드백: 원이 너무 크다).
   그림 범위는 지역이 defineGather 의 box:[x0,y0,x1,y1](흙더미 x·바닥 y 기준)로 준다. 없으면 엔진이 그리는 기본 흙더미(field.js drawDigs) 범위 */
const GATHER_DEFAULT_BOX=[-7,-12,7,0];
function gatherRing(d){
  const b=gatherCfg(d)?.box||GATHER_DEFAULT_BOX,ground=d.y??fieldGround();
  return {x:d.x+(b[0]+b[2])/2,y:ground+(b[1]+b[3])/2,r:Math.ceil(Math.hypot((b[2]-b[0])/2,(b[3]-b[1])/2))+TABLES.MINIGAMES.gather_ring_pad};
}
/* 기준원과 진행 점 맨 위 (말풍선 안내는 그 위에 띄운다) */
function gatherRingTop(d){const g=gatherRing(d);return g.y-g.r-10;}
/* 커지는 원의 색과 선 무늬: 지금 모습(G.form)마다 다르다 (D-41의 변신별 표현을 원 하나로 옮김) */
const GATHER_RING_STYLE={
  '':{c:'#f2a24a',dash:[]},            // 너구리: 단풍빛 실선
  squirrel:{c:'#c8893f',dash:[3,1]},    // 다람쥐: 도토리빛 촘촘한 끊긴 선
  goat:{c:'#efe6d2',dash:[]},           // 산양: 뿔빛 실선
  owl:{c:'#e8d6b0',dash:[4,2]},         // 수리부엉이: 깃털빛 긴 끊긴 선
  deer:{c:'#b08a5c',dash:[1,2]}         // 고라니: 발굽빛 점선
};
/* 원 하나를 어두운 테두리 위에 그린다(흙·풀 위에서도 보이게) */
function ringStroke(c,x,y,r,color,width,dash){
  c.save();c.setLineDash(dash||[]);
  c.lineWidth=width+2;c.strokeStyle='rgba(30,20,12,.7)';c.beginPath();c.arc(x+.5,y+.5,r,0,Math.PI*2);c.stroke();
  c.lineWidth=width;c.strokeStyle=color;c.beginPath();c.arc(x+.5,y+.5,r,0,Math.PI*2);c.stroke();
  c.restore();
}
/* 흙더미 위 고리·진행 점·튀는 흙. 필드 그리기에서 흙더미 다음에 부른다 */
function drawGatherCue(){
  const d=nearDig(),live=d&&!d.cache&&gatherCfg(d)?d:null;
  if(live!==gatherCue.d){gatherCue.d=live;gatherCue.start=G.anim;}
  const c=ctx;
  if(live){
    // 채집물을 감싸는 기준원(가는 실선)과, 그 가운데 점에서 커지는 원 하나. 커지는 원이 기준원에 꼭 맞을 때가 딱이다. (D-145)
    const cfg=gatherCfg(live),ring=gatherRing(live),x=Math.round(ring.x-cam),ph=gatherPhase(),grade=ph.grade;
    const r0=ring.r,y=Math.round(ring.y);
    const just=grade==='perfect',st=GATHER_RING_STYLE[G.form||'']||GATHER_RING_STYLE[''];
    if(grade){c.save();c.fillStyle=just?'rgba(255,228,138,.32)':'rgba(255,249,232,.14)';c.beginPath();c.arc(x+.5,y+.5,r0,0,Math.PI*2);c.fill();c.restore();}
    ringStroke(c,x,y,r0,just?'#ffe48a':'#fff9e8',1,[]);
    const rr=ph.r*r0;
    if(rr<1.5){R(x-1,y-1,3,3,'rgba(30,20,12,.7)');R(x,y,1,1,st.c);}
    else ringStroke(c,x,y,rr,just?'#ffe48a':st.c,just?2:1,just?[]:st.dash);
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
