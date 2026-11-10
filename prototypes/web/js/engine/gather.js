'use strict';
/* 채집: 따로 창을 띄우지 않는다. 흙더미(G.digs) 앞에 서면 그 채집물을 거의 감싸는 원이 뜨고,
   12시 방향에서 표식 하나가 원을 따라 시계 방향으로 돌며 지나온 길에 먹선을 긋는다(D-815). 원 위에는 금빛 칸(정확)과 그 양옆의 옅은 칸(근접)이 두 군데 있다.
   휘두르면 표식이 그 자리에서 멈추고, 멈춘 칸에 따라 캐는 몫이 다르다. 아무 데서 멈춰도 한 몫은 판다(벌 없음).
   아이템별 설정은 defineGather 로 지역이 넣는다: {title, hits:보통 타수, hint, spot:[dx,dy] 캐는 자리(흙먼지·글자), box?:[x0,y0,x1,y1] 그림 범위, rare?:보통 칸에서 한 번도 멈추지 않을 때 덤으로 나오는 상위 재료}
   수치는 minigames.csv 의 gather_* (한 바퀴 시간·칸 넓이·칸 자리·정확 힘·수량). 처음 캐면 남는 일기는 지역의 gatherDiary:[id, 글] */
const gatherCue={d:null,start:0,zone:.5,zones:[.5],hitZone:.5,grade:null,stop:null,pops:[],dirt:[]};
/* 결정 D-500: 채집은 데드 바이 데이라이트의 발전기 점검처럼 원을 도는 표식을 멈추는 방식이다 (사용자 피드백 2026-11-04).
   금빛 칸(perfect)은 원 둘레의 gather_perfect_zone %(5%), 그 양옆 옅은 칸(good)은 한쪽에 gather_good_zone %, 나머지는 보통.
   정확: 두 몫 + 한 개 더. 근접: 한 몫, 덤 자격은 지킨다. 보통: 한 몫, 덤 자격을 잃는다.
   칸의 자리는 칠 때마다 gather_zone_min~max(12시에서 잰 둘레 %) 사이에서 새로 정한다.
   한 바퀴 시간은 gather_<채집 이름>_period(프레임), 없으면 gather_spin_period. 5%는 한 바퀴 96프레임에서 약 5프레임(0.08초)이다.
   "좋아·딱" 같은 감탄사 글자는 띄우지 않는다. */
/* 결정 D-1432 (사용자 피드백 2026-11-10 "채집할 때마다 원 크기 줄여서 난이도 소폭 상승"): 캐기를 하나 마칠 때마다(G.f.gatherDone)
   금빛 칸과 옅은 칸이 gather_shrink_step % 씩 좁아지고, gather_shrink_floor % 아래로는 줄지 않는다. 한 게임 내내 이어진다. */
function gatherZoneScale(){const MG=TABLES.MINIGAMES;return Math.max((MG.gather_shrink_floor??100)/100,1-(MG.gather_shrink_step||0)/100*(G?.f?.gatherDone||0));}
function gatherPeriod(d){const MG=TABLES.MINIGAMES;return MG['gather_'+gatherKey(d)+'_period']||MG.gather_spin_period;}
/* 결정 D-815: 칸은 한 바퀴에 gather_zone_count 군데(2)다 (사용자 피드백 2026-11-06 "퍼펙트존을 하나 더"). 모두 gather_zone_min~max 안에 놓고,
   칸 가운데끼리는 gather_zone_gap %보다 가깝지 않게 해 두 칸이 겹치지 않는다. 칠 때마다 새로 정한다 */
function gatherNewZone(){
  const MG=TABLES.MINIGAMES,a=MG.gather_zone_min/100,b=MG.gather_zone_max/100,n=Math.max(1,MG.gather_zone_count||1),gap=(MG.gather_zone_gap||0)/100;
  const room=Math.max(0,b-a-gap*(n-1)),picks=Array.from({length:n},()=>Math.random()*room).sort((p,q)=>p-q);
  gatherCue.zones=picks.map((v,i)=>a+v+gap*i);gatherCue.zone=gatherCue.zones[0];
}
/* 지금 표식 자리: p는 12시에서 잰 둘레 비율(0~1). 멈춘 동안은 멈춘 자리 */
function gatherPhase(d){
  const MG=TABLES.MINIGAMES,per=gatherPeriod(d);
  const p=gatherCue.stop?gatherCue.stop.p:((G.anim-gatherCue.start)%per)/per;
  // 가장 가까운 칸으로 판정한다 (D-815)
  let zone=gatherCue.zone,off=1;for(const z of gatherCue.zones||[gatherCue.zone]){const o=Math.abs(p-z);if(o<off){off=o;zone=z;}}
  const k=gatherZoneScale(),half=MG.gather_perfect_zone/200*k,grade=off<=half?'perfect':off<=half+MG.gather_good_zone/100*k?'good':null;   // 결정 D-1432
  return {p,grade,just:grade==='perfect',zone};
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
function gatherPress(){const d=nearDig(),live=d&&!d.cache&&gatherCue.d===d&&!gatherCue.stop,ph=live?gatherPhase(d):null;gatherCue.grade=ph?ph.grade:null;
  if(ph){gatherCue.hitZone=ph.zone;gatherCue.stop={p:ph.p,t:TABLES.MINIGAMES.gather_stop_frames,grade:gatherCue.grade};}}
/* 휘두르기가 흙더미에 닿았을 때 (doHit) */
// 결정 D-31: 채집은 따로 창 없이 필드에서 타이밍. 정확하면 두 몫, 아무 때나 쳐도 한 몫 (design/data/decisions.csv)
// 결정 D-500: 정확이면 두 몫과 +1개. 보통 칸에서 한 번도 멈추지 않고 정확이 하나라도 있으면 상위 재료 하나 더
function gatherHit(d){
  const cfg=gatherCfg(d),MG=TABLES.MINIGAMES;if(!cfg||d.done)return;
  const grade=gatherCue.grade,just=grade==='perfect';gatherCue.grade=null;if(!grade)d.flaw=true;
  if(!G.f.gatherHinted)G.f.gatherHinted={};
  const firstEver=!Object.keys(G.f.gatherHinted).length;   // 결정 D-1100: 예전에 한 번이라도 캔 저장은 처음이 아니다
  /* 결정 D-922: 채집 설명(바늘이 금빛 칸에 닿을 때 치기)은 한 게임에 단 한 번, 처음 캘 때만 띄운다 (사용자 피드백 2026-11-06:
     "채집에 대한 설명 게임 당 시작할 때 단 한 번만"). 자리마다 띄우던 한 줄(cfg.hint)은 그 첫 번에만 붙인다. G.f 는 지역을 넘어도 이어지고
     저장에 남아, 다음 지역·이어 하기에서도 다시 뜨지 않는다. 채집하면서 손으로 익힌 것이라 가벼운 속말로 띄운다(D-921, 멈춰 세우지 않음). */
  G.f.gatherHinted[gatherKey(d)]=true;
  /* 결정 D-1100: 그 한 번은 1스테이지 단풍골의 첫 채집뿐이다 (사용자 피드백 2026-11-07 "게임 시작 시, 1스테이지에서 처음 채집할 때만 튜토리얼처럼").
     D-922 이전 저장(이 표시가 없던 저장, 이미 캔 자리가 있음)을 이어 하거나 뒤 지역에서 시작해 뒤 지역에서 처음 캐면 설명 없이 표시만 남긴다. */
  if(!G.f.gatherRuleSaid){G.f.gatherRuleSaid=true;if(firstEver&&G.region==='galchamgol')think(cfg.hint+' 도는 바늘이 금빛 칸에 닿을 때 치면 더 나오겠다.',{light:true});}
  d.prog=(d.prog||0)+(just?MG.gather_perfect_power:1);if(just)d.perfects=(d.perfects||0)+1;
  // 결정 D-482: 채집 자리마다 칠 때 소리를 따로 줄 수 있다(cfg.hitSound). 눈 둔덕은 쇠 날이 언 눈을 때리는 '팡'
  if(cfg.hitSound)Sound.hit(cfg.hitSound);else Sound.gather(true);
  const sp=gatherSpot(d),y=sp.y-4;
  Vfx.scatter(d.x,y+6,'scatter' in cfg?cfg.scatter:d.item,just);   // 캐는 물건에 따라 흙먼지 또는 잎 (눈 둔덕은 흙먼지 자리에 눈가루)
  if(grade){const g=gatherRing(d),a=-Math.PI/2+gatherCue.hitZone*Math.PI*2;gatherCue.pops.push({x:g.x+Math.cos(a)*g.r,y:g.y+Math.sin(a)*g.r,t:16,just});}   // 멈춘 칸이 반짝인다. 글자는 없다 (D-500)
  for(let i=0;i<(just?9:4);i++)gatherCue.dirt.push({x:d.x,y:y+6,vx:(Math.random()-.5)*(just?2.6:1.6),vy:-Math.random()*(just?2.4:1.5),t:22,c:just?'#fff3b0':cfg.dirt||'#8b5a2b'});
  // 결정 D-482: 눈 둔덕은 칠 때마다 눈이 사방으로 흩어지고(굵은 눈덩이 섞임), 화면이 살짝 흔들린다. 날이 닿은 자리에 하얀 번쩍임 한 번
  if(cfg.burst==='snow'){const T=TABLES.TUNING,n=just?T.snow_burst_count_just:T.snow_burst_count;
    for(let i=0;i<n;i++){const ang=-Math.PI*(0.08+Math.random()*0.84),sp2=1.2+Math.random()*(just?2.8:2);gatherCue.dirt.push({x:d.x+(Math.random()-.5)*6,y:y+4,vx:Math.cos(ang)*sp2,vy:Math.sin(ang)*sp2,t:18+Math.floor(Math.random()*10),c:i%4?'#ffffff':'#dfe8ea',s:i%5===0?2:1});}
    gatherCue.flash={x:d.x,y:y+2,t:6};shakeT=Math.max(shakeT,just?T.snow_burst_shake_just:T.snow_burst_shake);}
  else if(just)shakeT=Math.max(shakeT,4);
  if(d.prog>=cfg.hits)finishGather(d);
}
function finishGather(d){
  const id=d.item,MG=TABLES.MINIGAMES;d.done=true;d.busy=false;G.f.gatherDone=(G.f.gatherDone||0)+1;   // 결정 D-1432
  // 정확 한 번마다 한 개 더. 진행에 쓰는 개수는 기본 한 개로 이미 채워지므로 더 나와도 깨지지 않는다.
  const extra=(d.perfects||0)*MG.gather_perfect_bonus,n=MG.gather_yield+extra;Vfx.gather(d.x,(d.y??fieldGround())-4,id);
  spawnDrops(id,n,{x:d.x,y:d.y??fieldGround(),zone:d.zone});
  // 보통 칸에서 한 번도 멈추지 않고 정확이 하나라도 있으면, 그 자리에서 날 법한 한 단계 위 재료가 하나 더 나온다(지역 defineGather의 rare).
  const cfg=gatherCfg(d)||{},rare=!d.flaw&&d.perfects&&cfg.rare&&ITEMS[cfg.rare]?cfg.rare:null;
  if(rare){spawnDrops(rare,1,{x:d.x+6,y:d.y??fieldGround(),zone:d.zone});learn('gather:rare:'+id);}
  // 결정 D-266: 무엇이 왜 묻혀 있었는지 자리가 알려 준다(눈 둔덕). 칸을 맞춘 알림은 그 뒤에 띄운다.
  if(d.found)setTimeout(()=>think(d.found),250);
  if(rare)setTimeout(()=>toast(ITEMS[id].n+' ×'+n+' · '+ITEMS[rare].n+'도 나왔다'),d.found?1700:700);
  else if(extra)setTimeout(()=>toast('더 캐냈다 · '+ITEMS[id].n+' ×'+n),d.found?1700:700);   // 결정 D-922: 칸 규칙은 다시 말하지 않는다
  if(REG.gatherDiary)diary(REG.gatherDiary[0],REG.gatherDiary[1]);
  if(gatherCue.d===d)gatherCue.d=null;
}
/* 결정 D-393: 솔방울(돌너머·큰 장터·영산이 같이 쓴다). 벌어진 비늘이 마름모로 엇갈리고 가운데가 가장 넓다. (x,y)는 바닥 가운데. snow면 위에 눈 */
function drawPineCone(x,y,snow){
  for(const [dy,h] of [[-9,1],[-8,2],[-7,3],[-6,3],[-5,3],[-4,2],[-3,1]])R(x-h,y+dy,h*2+1,1,'#6b4423');
  R(x,y-2,1,1,'#4a2e18');
  for(const [dy,xs] of [[-8,[-1,1]],[-7,[-2,0,2]],[-6,[-3,-1,1,3]],[-5,[-2,0,2]],[-4,[-1,1]],[-3,[0]]])for(const dx of xs)R(x+dx,y+dy,1,1,'#a8703a');
  for(const [dy,xs] of [[-7,[-1,1]],[-6,[0]],[-5,[-1,1]]])for(const dx of xs)R(x+dx,y+dy,1,1,'#3e2614');
  if(snow){R(x-2,y-10,5,1,'#f4f7fa');R(x-1,y-11,3,1,'#ffffff');}
}
/* 채집 지점: 흙더미 그림에서 실제로 캐는 곳(뿌리 끝·밑동). 지역이 spot:[dx,dy]로 준다 */
function gatherSpot(d){const s=gatherCfg(d)?.spot||[0,-8];return {x:d.x+s[0],y:(d.y??fieldGround())+s[1]};}
/* 결정 D-145: 원은 채집물 그림을 거의 감싸는 크기에 여유(gather_ring_pad)만 더하고, 가운데는 그 그림 한가운데에 둔다.
   그림 범위는 지역이 defineGather 의 box:[x0,y0,x1,y1](흙더미 x·바닥 y 기준)로 준다. 없으면 엔진이 그리는 기본 흙더미(field.js drawDigs) 범위.
   결정 D-500: 모양은 모두 동그라미다 (D-392의 타원·마름모·네모와 좁혀 오기는 뺐다. 빠르기는 채집마다 그대로 다르다). */
const GATHER_DEFAULT_BOX=[-7,-12,7,0];
function gatherRing(d){
  const b=gatherCfg(d)?.box||GATHER_DEFAULT_BOX,ground=d.y??fieldGround(),pad=TABLES.MINIGAMES.gather_ring_pad;
  const a=(b[2]-b[0])/2,h=(b[3]-b[1])/2,r=Math.ceil(Math.hypot(a,h)*.92)+pad;
  return {x:d.x+(b[0]+b[2])/2,y:ground+(b[1]+b[3])/2,r,rx:r,ry:r};
}
/* 원과 진행 점 맨 위 (말풍선 안내는 그 위에 띄운다) */
function gatherRingTop(d){const g=gatherRing(d);return g.y-g.r-10;}
/* 결정 D-815: 채집 표식은 D-500 의 원 그림(바탕 원·금빛 칸·옅은 칸·도는 바늘)으로 되돌리고, 수묵 느낌은 바늘이 지나온 길에 먹선이 그어지는 것만 남긴다
   (사용자 피드백 2026-11-06 "채집 스킬 체크 바꾼거 엉망이네. 원래 버젼으로 하되 퍼펙트존을 하나 더. 먹처럼 그려지는 느낌은 나쁘지 않으니 원본에 맞게").
   먹선은 바탕 원 위, 칸 아래에 긋는다. 그래서 칸은 늘 또렷하고, 바늘이 어디쯤 왔는지는 먹선 길이로도 보인다.
   멈춘 칸에는 금빛(정확)이나 먹(근접)이 둘레로 번진다. D-715 의 도장·붓끝 그림은 뺐다. */
const G_INK='#1d1714',G_INK_SOFT='rgba(29,23,20,.72)',G_PAPER='rgba(246,238,216,.55)';
/* 원 둘레의 한 구간(12시에서 잰 비율 a~b)을 테두리(halo) 위에 호로 긋는다. halo 가 null 이면 테두리 없이 */
function arcStroke(c,x,y,r,a,b,color,width,halo='rgba(30,20,12,.75)'){
  const A=-Math.PI/2+a*Math.PI*2,B=-Math.PI/2+b*Math.PI*2;
  if(halo){c.lineWidth=width+2;c.strokeStyle=halo;c.beginPath();c.arc(x+.5,y+.5,r,A-.04,B+.04);c.stroke();}
  c.lineWidth=width;c.strokeStyle=color;c.beginPath();c.arc(x+.5,y+.5,r,A,B);c.stroke();
}
/* 도는 표식의 색: 지금 모습(G.form)마다 다르다 (D-41의 변신별 표현을 표식 하나로 옮김). dash는 옛 값이라 쓰지 않는다 */
const GATHER_RING_STYLE={
  '':{c:'#f2a24a',dash:[]},            // 너구리: 단풍빛 실선
  squirrel:{c:'#c8893f',dash:[3,1]},    // 다람쥐: 도토리빛 촘촘한 끊긴 선
  goat:{c:'#efe6d2',dash:[]},           // 산양: 뿔빛 실선
  owl:{c:'#e8d6b0',dash:[4,2]},         // 수리부엉이: 깃털빛 긴 끊긴 선
  deer:{c:'#b08a5c',dash:[1,2]}         // 고라니: 발굽빛 점선
};
/* 바늘이 지나온 먹선: 0에서 p까지. 바늘에 가까울수록 굵고 진하며, 지나온 길은 가늘어지고 마른 붓 자국처럼 군데군데 빈다.
   밑에 옅은 종이빛을 깔아 밤 배경에서도 먹선이 보인다.
   결정 D-1410: 돌 때 먹 느낌이 더 잘 보이게 한다 (사용자 피드백 2026-11-09 "돌 때 먹의 느낌이 좀 더 잘보이게").
   종이빛 바탕과 먹선을 한 단계 굵게 하고, 지나온 자리에는 먹이 원 안팎으로 스며 번진 점이 남는다(오래된 자리일수록 넓고 옅다).
   바늘 끝에는 붓끝에 고인 먹 방울이 따라 돈다. 칸은 그 위에 그어 늘 또렷하다 */
function drawInkTrail(c,x,y,r,p){
  if(p<=0)return;
  const N=Math.max(1,Math.ceil(p*64)),soak=Vfx.reducedMotion?0:1;
  arcStroke(c,x,y,r,0,p,G_PAPER,6,null);
  for(let i=0;i<N;i+=2){   // 번짐: 정해진 자리마다 먹이 안팎으로 스민다 (매 프레임 같은 자리라 떨리지 않는다)
    const a=i/64;if(a>p)break;const k=(i*37+11)%7;if(k>3)continue;
    const age=(p-a)/Math.max(p,.0001),ang=-Math.PI/2+a*Math.PI*2,off=(k%2?1:-1)*(2+age*2.5*soak);
    const px=x+.5+Math.cos(ang)*(r+off),py=y+.5+Math.sin(ang)*(r+off),s=age>.45?2:1;
    c.fillStyle='rgba(29,23,20,'+(.6-age*.35).toFixed(2)+')';c.fillRect(Math.round(px-s/2),Math.round(py-s/2),s+(k===0?1:0),s);
  }
  for(let i=0;i<N;i++){
    const a=i/64,b=Math.min(p,(i+1)/64),near=1-(p-b)/Math.max(p,.0001);
    if(near<.5&&(i*7+3)%9===0)continue;   // 비백: 마른 붓이 종이를 스친 빈 자리
    const w=near>.85?4:near>.45?3:2;
    arcStroke(c,x,y,r,a,b+.004,near>.3?G_INK:G_INK_SOFT,w,null);
  }
  // 붓끝에 고인 먹 방울: 옅은 번짐 위에 진한 방울
  const A=-Math.PI/2+p*Math.PI*2,hx=x+.5+Math.cos(A)*r,hy=y+.5+Math.sin(A)*r;
  c.fillStyle='rgba(29,23,20,.35)';c.beginPath();c.arc(hx,hy,4.2,0,Math.PI*2);c.fill();
  c.fillStyle=G_INK;c.beginPath();c.arc(hx,hy,2.6,0,Math.PI*2);c.fill();
}
/* 흙더미 위 원·먹선·칸·도는 표식·진행 점·튀는 흙. 필드 그리기에서 흙더미 다음에 부른다 */
function drawGatherCue(){
  const d=promptPick().d,live=d&&!d.cache&&gatherCfg(d)?d:null;   // 결정 D-1413: 말 걸기 안내가 이기면 원을 그리지 않는다
  if(live!==gatherCue.d){gatherCue.d=live;gatherCue.start=G.anim;gatherCue.stop=null;gatherNewZone();}
  const c=ctx,MG=TABLES.MINIGAMES;
  // 멈춘 표식은 잠깐 머문 뒤 12시로 돌아가 다시 돈다. 칸 자리도 새로 정한다 (D-500)
  if(gatherCue.stop&&!paused()&&--gatherCue.stop.t<=0){gatherCue.stop=null;gatherCue.start=G.anim;gatherNewZone();}
  if(live){
    const cfg=gatherCfg(live),ring=gatherRing(live),x=Math.round(ring.x-cam),y=Math.round(ring.y),r=ring.r,ph=gatherPhase(live);
    const st=GATHER_RING_STYLE[G.form||'']||GATHER_RING_STYLE[''],hp=MG.gather_perfect_zone/200*gatherZoneScale(),gd=MG.gather_good_zone/100*gatherZoneScale();   // 결정 D-1432
    c.save();
    // 바탕 원: 어두운 테두리 위 옅은 실선
    c.lineWidth=3;c.strokeStyle='rgba(30,20,12,.5)';c.beginPath();c.arc(x+.5,y+.5,r,0,Math.PI*2);c.stroke();
    c.lineWidth=1;c.strokeStyle='rgba(255,249,232,.45)';c.beginPath();c.arc(x+.5,y+.5,r,0,Math.PI*2);c.stroke();
    // 바늘이 지나온 먹선 (D-815)
    c.lineCap='round';drawInkTrail(c,x,y,r,ph.p);c.lineCap='butt';
    // 근접 칸(양옆, 흰색)과 정확 칸(가운데, 진한 금빛)을 칸마다. 먹선 위에 그어 늘 보인다
    for(const z of gatherCue.zones||[gatherCue.zone]){
      arcStroke(c,x,y,r,z-hp-gd,z+hp+gd,'#fffdf4',3);
      arcStroke(c,x,y,r,z-hp,z+hp,'#ffc21a',4);
    }
    // 도는 표식: 원을 가로지르는 짧은 바늘. 멈추면 맞춘 칸의 색으로 빛난다
    const A=-Math.PI/2+ph.p*Math.PI*2,cs=Math.cos(A),sn=Math.sin(A),sg=gatherCue.stop?.grade;
    const col=sg==='perfect'?'#fff3a0':sg==='good'?'#ffffff':st.c,x0=x+.5+cs*(r-4),y0=y+.5+sn*(r-4),x1=x+.5+cs*(r+4),y1=y+.5+sn*(r+4);
    c.lineCap='round';
    c.lineWidth=4;c.strokeStyle='rgba(30,20,12,.8)';c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
    c.lineWidth=2;c.strokeStyle=col;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
    c.restore();
    // 진행 점: 원 바로 위. 채운 점 = 판 몫
    const need=cfg.hits,done=Math.min(need,live.prog||0),top=y-r-9;
    R(x-need*2-1,top,need*4+3,6,'rgba(42,30,20,.75)');
    for(let i=0;i<need;i++)R(x-need*2+1+i*4,top+2,3,2,i<done?'#ffe48a':'#7d6a52');
  }
  for(let i=gatherCue.dirt.length-1;i>=0;i--){const p=gatherCue.dirt[i];
    if(!paused()){p.x+=p.vx;p.y+=p.vy;p.vy+=.15;p.t--;}
    if(p.t<=0){gatherCue.dirt.splice(i,1);continue;}if(!Vfx.reducedMotion)R(p.x-cam,p.y,p.s||1,p.s||1,p.c);}
  const fl=gatherCue.flash;if(fl){if(!paused())fl.t--;if(fl.t<=0)gatherCue.flash=null;else if(!Vfx.reducedMotion){const r=7-fl.t,x=Math.round(fl.x-cam),y=Math.round(fl.y);
    for(const [ex,ey] of [[1,0],[-1,0],[0,-1],[.7,-.7],[-.7,-.7]])R(x+Math.round(ex*r),y+Math.round(ey*r),1,1,'#ffffff');R(x,y,1,1,'#fff9d8');}}
  for(let i=gatherCue.pops.length-1;i>=0;i--){const p=gatherCue.pops[i];
    if(!paused())p.t--;if(p.t<=0){gatherCue.pops.splice(i,1);continue;}
    if(Vfx.reducedMotion)continue;
    const k=16-p.t,x=Math.round(p.x-cam),y=Math.round(p.y),n=p.just?10:6,col=p.just?'#ffc21a':G_INK;
    // 결정 D-815: 정확 칸에 맞으면 금빛이, 근접이면 먹이 둘레로 번진다 (바깥으로 갈수록 성기다)
    for(let j=0;j<n;j++){const a=j/n*Math.PI*2+(j%2)*.3,dd=k*(.35+(j%3)*.12);R(x+Math.round(Math.cos(a)*dd),y+Math.round(Math.sin(a)*dd),k<8?2:1,k<8?2:1,j%3?col:'rgba(246,238,216,.8)');}
  }
}
