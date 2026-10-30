'use strict';
/* 방문 기록은 G, 선택·비행 시계는 화면에만 둔다. 길은 실제 exits/doors에서 읽는다. */
let mapTravel=null,mapSelection=null,mapReturnFocus=null,mapWasEnd=false,mapNoticeTimer=null;
const mapVisited=(region,zone)=>!!G.visitedZones?.[region]?.[zone];
const mapCurrent=(region,zone)=>G.region===region&&G.zone===zone;
function mapBlocked(){return !!B||inkOn||!!vistaMode||!!zoneMotion||zoneFade>0||!!openMinigame()||open('dlg')||!!pickupPose||!!craftHands||!!brewing;}
function mapNotice(message){
  toast(message);$('toast').hidden=false;$('toast').classList.add('map-notice');clearTimeout(mapNoticeTimer);
  mapNoticeTimer=setTimeout(()=>{if($('toast').textContent===message)$('toast').hidden=true;$('toast').classList.remove('map-notice');},TABLES.TUNING.toast_frames*1000/60);
}
function openMap(){
  if(CLASSIC)return false;
  if(mapTravel||mapBlocked()){mapNotice('지금은 까치 떼를 부를 수 없다');return false;}
  if(!G.f.mapUnlocked){mapNotice('아직 길을 함께 다닐 동무가 없다');return false;}
  if(G.ended&&!REG.next&&!G.f.newName){mapNotice('새 이름부터 정하자');$('newName')?.focus();return false;}
  if(!G.started)return false;
  if(open('map'))return true;
  mapReturnFocus=document.activeElement;mapWasEnd=open('endScreen');
  closePanels();suppressHeldInputs();G.vx=G.vy=G.attackT=0;
  markZoneVisited();
  $('endScreen').hidden=true;mapSelection={region:G.region,zone:G.zone};
  renderMap();$('map').hidden=false;document.body.classList.add('map-open');Sound.paper();
  const selected=$('mapBody').querySelector('[aria-pressed="true"]');selected?.focus();
  selected?.scrollIntoView({block:'nearest',inline:'nearest'});return true;
}
function closeMap(restore=true){
  const wasOpen=open('map');$('map').hidden=true;document.body.classList.remove('map-open');
  if(wasOpen){suppressHeldInputs();if(restore&&mapWasEnd)$('endScreen').hidden=false;
    if(restore&&mapReturnFocus instanceof HTMLElement&&mapReturnFocus.isConnected)mapReturnFocus.focus();}
  mapWasEnd=false;mapReturnFocus=null;
}
function toggleMap(){if(open('map'))closeMap();else openMap();}
function resetMap(){
  closeMap(false);mapTravel=null;mapSelection=null;$('mapCaption').hidden=true;document.body.classList.remove('map-flying');
}
function mapGraph(r){
  const ids=Object.keys(r.zones||{}),edges=[],seen=new Set();
  for(const id of ids){
    const z=r.zones[id];
    for(const raw of [...Object.values(z.exits||{}),...(z.doors||[]),...(r.doors||[]).filter(p=>p.zone===id)]){
      const to=typeof raw==='string'?raw:raw?.to;if(!ids.includes(to)||to===id)continue;
      const key=[id,to].sort().join(':');if(seen.has(key))continue;seen.add(key);edges.push([id,to]);
    }
  }
  // 가장자리의 좌우 순서를 주줄기로 삼고 문으로만 닿는 갈래는 별도 줄에 놓는다.
  const main=[],walk=id=>{if(!id||main.includes(id))return;main.push(id);const p=r.zones[id]?.exits?.right;walk(typeof p==='string'?p:p?.to);};
  walk(firstZone(r));
  const branches=ids.filter(id=>!main.includes(id)),count=Math.max(main.length,branches.length,2),positions={};
  main.forEach((id,i)=>positions[id]={x:12+76*i/(count-1),y:branches.length?32:50});
  branches.forEach((id,i)=>{
    const linked=edges.flatMap(([a,b])=>a===id?[b]:b===id?[a]:[]).filter(k=>main.includes(k));
    const index=linked.length?linked.reduce((sum,k)=>sum+main.indexOf(k),0)/linked.length:i;
    positions[id]={x:12+76*clamp(index+i*.12,0,count-1)/(count-1),y:76};
  });
  // 오른쪽 끝에 갈래가 몰려도 겹치지 않게 왼쪽부터 빈 열을 찾는다.
  const placed=[];for(const id of branches){const p=positions[id];
    if(placed.some(x=>Math.abs(p.x-x)<19)){
      const slots=Array.from({length:Math.max(branches.length,2)},(_,i)=>12+76*i/Math.max(1,branches.length-1));
      p.x=slots.filter(x=>placed.every(v=>Math.abs(x-v)>=19)).sort((a,b)=>Math.abs(a-p.x)-Math.abs(b-p.x))[0]??p.x;
    }placed.push(p.x);
  }
  return {ids,edges,positions};
}
function renderMap(){
  const body=$('mapBody');body.replaceChildren();
  for(const r of regionList().slice().reverse()){
    const graph=mapGraph(r),known=graph.ids.some(id=>mapVisited(r.id,id));
    const section=el('section','map-region'),heading=el('h3',null,known?r.name:'？');
    const chart=el('div','map-chart'),canvas=document.createElement('canvas');canvas.width=400;canvas.height=126;canvas.setAttribute('aria-hidden','true');
    const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
    // 먹선은 짧은 직사각형으로 이어 픽셀 가장자리를 지킨다.
    for(const [a,b] of graph.edges){const p=graph.positions[a],q=graph.positions[b],dx=(q.x-p.x)*4,dy=(q.y-p.y)*1.26;
      c.fillStyle=mapVisited(r.id,a)&&mapVisited(r.id,b)?'#75664e':'#c3b699';
      for(let i=0,n=Math.max(Math.abs(dx),Math.abs(dy));i<=n;i+=3){const t=n?i/n:0;c.fillRect(Math.round(p.x*4+dx*t),Math.round(p.y*1.26-20+dy*t),3,2);}
    }
    chart.appendChild(canvas);
    for(const id of graph.ids){
      const known=mapVisited(r.id,id),current=mapCurrent(r.id,id),p=graph.positions[id];
      const b=el('button','map-place',known?TABLES.ZONES[r.id][id]:'？');b.type='button';b.dataset.region=r.id;b.dataset.zone=id;
      b.style.left=p.x+'%';b.style.top=p.y+'%';b.disabled=!known;
      if(!known){b.title='아직 가 보지 않은 곳';b.setAttribute('aria-label','아직 가 보지 않은 곳');}
      if(current)b.setAttribute('aria-current','location');
      const selected=mapSelection?.region===r.id&&mapSelection?.zone===id;b.setAttribute('aria-pressed',String(selected));b.tabIndex=selected?0:-1;
      b.onclick=()=>selectMapPlace(b);
      b.onfocus=()=>{if(!b.disabled)selectMapPlace(b,false);};chart.appendChild(b);
    }
    section.append(heading,chart);body.appendChild(section);
  }
  updateMapSelection();
}
function selectMapPlace(button,focus=true){
  if(button.disabled)return;
  mapSelection={region:button.dataset.region,zone:button.dataset.zone};
  for(const b of $('mapBody').querySelectorAll('button')){const selected=b===button;b.setAttribute('aria-pressed',String(selected));b.tabIndex=selected?0:-1;}
  updateMapSelection();if(focus)button.focus();
}
function updateMapSelection(){
  const s=mapSelection;$('mapDestination').textContent=s?TABLES.ZONES[s.region]?.[s.zone]||'어딘가':'';
  $('mapTravel').disabled=!s||!mapVisited(s.region,s.zone)||mapCurrent(s.region,s.zone);
  // 완료 뒤 지도로 돌아다녀도, 아직 밟지 않은 다음 지역으로 나가는 기존 출발은 남긴다.
  const next=REGIONS[REG.next],exit=$('mapNext');exit.hidden=!next||!regionCompleted(REG.id)||!!G.regionStates[next.id];
  if(!exit.hidden)exit.textContent=next.cover.go||next.name+'로';
}
function mapKey(k){
  if(k===' '){if(document.activeElement?.matches('#map button'))document.activeElement.click();return;}
  if(k==='escape'||k==='m'){closeMap();return;}
  if(k==='enter'){if(document.activeElement?.matches('#mapClose,#mapNext,#mapTravel'))document.activeElement.click();else if(!$('mapTravel').disabled)$('mapTravel').click();return;}
  const dir={arrowleft:[-1,0],arrowright:[1,0],arrowup:[0,-1],arrowdown:[0,1]}[k];if(!dir)return;
  const all=[...$('mapBody').querySelectorAll('button:not(:disabled)')],from=all.find(b=>b.getAttribute('aria-pressed')==='true');if(!from)return;
  const a=from.getBoundingClientRect();let best=null,score=Infinity;
  for(const b of all){if(b===from)continue;const r=b.getBoundingClientRect(),dx=r.x-a.x,dy=r.y-a.y,forward=dx*dir[0]+dy*dir[1];if(forward<=1)continue;
    const side=Math.abs(dx*dir[1]-dy*dir[0]),n=forward+side*3;if(n<score){best=b;score=n;}}
  if(best){selectMapPlace(best);best.scrollIntoView({block:'nearest',inline:'nearest'});}
}
function startMapTravel(region,zone){
  if(CLASSIC||mapTravel||mapBlocked()||!G.f.mapUnlocked||!G.started||!mapVisited(region,zone)||!REGIONS[region]?.zones?.[zone]||mapCurrent(region,zone))return false;
  closeMap(false);closePanels();suppressHeldInputs();cancelPickup();
  const image=document.createElement('canvas');image.width=W;image.height=H;drawFieldScene(false);image.getContext('2d').drawImage(cv,0,0);
  mapTravel={owner:G,from:{region:G.region,zone:G.zone,x:G.px-cam,y:G.py},to:{region,zone},image,
    elapsed:0,duration:TABLES.TUNING.map_flight_ms,last:performance.now(),arrived:false,paused:document.hidden,wing:0};
  G.vx=G.vy=G.attackT=0;document.body.classList.add('map-flying');$('endScreen').hidden=true;
  $('mapCaption').hidden=false;$('prompt').hidden=true;$('toast').hidden=true;Sound.playSfx('magpie_wings');
  if(Vfx.reducedMotion)finishMapTravel();return true;
}
function arriveMapTravel(m){
  if(m.arrived)return;m.arrived=true;
  // 화면 초기화가 연출 객체를 지우지 않게 잠시 떼어 두고 목적지 상태를 복원한다.
  mapTravel=null;enterRegion(G,REGIONS[m.to.region],{mapTravel:true,zone:m.to.zone});resetScreens();
  G.px=clamp(TABLES.TUNING.map_landing_margin,16,fieldWidth()-16);G.py=fieldGround();G.vx=G.vy=G.attackT=0;G.onGround=true;
  G.cam=clamp(G.px-W*.42,0,Math.max(0,fieldWidth()-W));zoneFade=0;
  mapTravel=m;document.body.classList.add('map-flying');$('mapCaption').hidden=false;
}
function finishMapTravel(){
  const m=mapTravel;if(!m)return;
  if(m.owner!==G){resetMap();return;}
  arriveMapTravel(m);mapTravel=null;$('mapCaption').hidden=true;document.body.classList.remove('map-flying');
  suppressHeldInputs();lastNear=null;refreshHud();writeSave(true);
}
function stepMapTravel(){
  const m=mapTravel;if(!m)return;
  const now=performance.now(),dt=now-m.last;m.last=now;
  if(m.owner!==G){resetMap();return;}
  if(document.hidden||m.paused)return;
  if(Vfx.reducedMotion){finishMapTravel();return;}
  m.elapsed=Math.min(m.duration,m.elapsed+dt);
  const t=m.elapsed/m.duration;
  if(t>=.72)arriveMapTravel(m);
  const wing=Math.floor(t*3);if(wing>m.wing){m.wing=wing;if(t<1)Sound.playSfx('magpie_wings');}
  if(m.elapsed>=m.duration)finishMapTravel();
}
function drawMapTravel(){
  const m=mapTravel;if(!m)return;
  const t=m.elapsed/m.duration;
  if(t<.26)ctx.drawImage(m.image,0,0);else if(t>=.72)drawFieldScene(false);
  else{
    R(0,0,W,H,'#e3dcc8');
    for(let layer=0;layer<3;layer++)for(let i=-1;i<7;i++){
      const x=i*90-(t*180*(layer+1))%90,y=154+layer*17;
      for(let j=0;j<65;j+=3)R(x+j,y-Math.sin(j/65*Math.PI)*(23-layer*4),4,H,'#aeb6a2 #899b8d #657e74'.split(' ')[layer]);
    }
    for(let i=-1;i<6;i++){const x=i*97-(t*470)%97,y=31+(i+5)%3*29;R(x,y,62,8,'#f5edda');R(x+12,y-5,30,5,'#f5edda');}
  }
  const lift=t<.26?clamp((t-.1)/.16,0,1):t>=.72?1-clamp((t-.72)/.28,0,1):1;
  const smooth=lift*lift*(3-2*lift);
  const x=t<.26?m.from.x+(W*.5-m.from.x)*smooth:t>=.72?G.px-cam+(W*.5-(G.px-cam))*smooth:W*.5;
  const floor=t<.26?m.from.y:fieldGround(),y=floor+(110-floor)*smooth;
  drawMagpieCarrier(x,y,t);
}
function drawMagpieCarrier(x,y,t){
  // 네 귀마다 한 마리의 부리가 직접 천 끝에 닿는다. 나머지 두 마리는 앞장선다.
  const fold='#ae6757',edge='#713e36',ink='#292d31',white='#f5eedc';
  ctx.save();ctx.translate(Math.round(x),Math.round(y));
  R(-28,-8,56,11,fold);R(-22,3,44,5,fold);R(-17,8,34,3,edge);
  const corners=[[-31,-23],[-18,-36],[19,-35],[32,-23]];
  for(const [cx,cy] of corners){
    const bx=cx<0?-24:24,by=cy<-30?-7:-2;
    for(let i=0;i<=15;i++){const q=i/15;R(cx+(bx-cx)*q,cy+(by-cy)*q,2,2,fold);}
    R(cx-1,cy,3,2,edge);
  }
  // 보따리에 앉은 아이. 머리는 기존 한국 보부상 모자의 평평한 챙을 따른다.
  R(-6,-15,13,12,'#8c8070');R(-4,-12,8,8,'#d9c7a5');R(-10,-3,8,4,ink);R(3,-3,8,4,ink);
  R(-8,-28,17,13,'#8c8070');R(-8,-23,17,4,ink);R(-5,-22,2,1,white);R(4,-22,2,1,white);
  R(-6,-18,13,3,white);R(-10,-30,22,3,'#c39b55');R(-5,-37,12,7,'#dcbb7a');R(-5,-32,12,2,'#6e4f22');
  const bird=(bx,by,face,i,holding)=>{
    const flap=Math.sin(t*62+i*1.8),wing=flap>0?-10:4;
    R(bx-6,by-5,13,7,ink);R(bx-4,by-2,8,4,white);R(bx+face*6-2,by-7,5,5,ink);
    R(bx+face*8,by-6,1,1,white);R(bx+face*9,by-3,4,2,'#63533d');
    R(bx-face*13,by+1,10,2,ink);R(bx-face*16,by+3,9,2,ink);
    R(bx-3,by+wing,5,Math.abs(wing)+2,ink);R(bx-8,by+wing,6,3,ink);R(bx-7,by+wing+3,4,2,'#5e727a');
    if(holding)R(bx+face*11,by-1,2,2,fold);
  };
  const approach=t<.1?(1-t/.1)*68:t>.94?(t-.94)/.06*68:0;
  corners.forEach(([cx,cy],i)=>{const face=cx<0?1:-1;bird(cx-face*12,cy+2-approach,face,i,approach===0);});
  bird(-69,-48,1,4,false);bird(72,-58,1,5,false);ctx.restore();
}
$('mapClose').onclick=()=>closeMap();
$('mapTravel').onclick=()=>{if(mapSelection)startMapTravel(mapSelection.region,mapSelection.zone);};
$('mapNext').onclick=()=>{
  const next=REGIONS[REG.next];if(!open('map')||!next||!regionCompleted(REG.id)||G.regionStates[next.id])return;
  closeMap(false);enterRegion(G,next);resetScreens();writeSave(true);
};
$('btnMap').onclick=toggleMap;$('btnMapEnd').onclick=toggleMap;
// 모달 안에서는 방향키·Enter·닫기를 먼저 처리하고 뒤 화면의 입력을 막는다.
addEventListener('keydown',e=>{
  if(!open('map')&&!mapTravel)return;
  const k=e.key.toLowerCase();if(k==='v')return;
  if(k==='tab'&&open('map')){
    const all=[...$('map').querySelectorAll('button:not(:disabled)')].filter(b=>b.tabIndex!==-1&&!b.hidden&&b.getClientRects().length);
    const i=all.indexOf(document.activeElement),next=(i+(e.shiftKey?-1:1)+all.length)%all.length;
    e.preventDefault();e.stopImmediatePropagation();all[next]?.focus();return;
  }
  e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
  if(open('map'))mapKey(k);else if(k==='m')mapNotice('지금은 까치 떼를 부를 수 없다');
},true);
const pauseMapFlight=paused=>{if(mapTravel){mapTravel.paused=paused;mapTravel.last=performance.now();}};
addEventListener('blur',()=>pauseMapFlight(true));addEventListener('focus',()=>pauseMapFlight(document.hidden));
document.addEventListener('visibilitychange',()=>pauseMapFlight(document.hidden));
$('shell').addEventListener('click',e=>{
  if(mapTravel&&e.target.closest('#btnSound,#btnVolume'))return;
  if(mapTravel||open('map')&&!e.target.closest('#map')){e.preventDefault();e.stopImmediatePropagation();}
},true);
