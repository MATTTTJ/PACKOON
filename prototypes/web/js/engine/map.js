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
/* 결정 D-146: 길 지도의 가 본 구역마다 그곳에서 만난 이와 본 채집물을 적는다 (피드백 16). 아이가 제 눈으로 본 것만 남는다.
   - 만난 이: 말을 나눈 적 있는(learned 'met:') 인물이 화면에 보였던 마지막 구역. 인물이 자리를 옮겨도 아이가 다시 보기 전까지는 본 자리에 둔다.
   - 채집물: 화면에 보였던 흙더미(채집)와 주울 거리. 다람쥐가 잊은 몫(cache)은 적지 않는다. 다 캐고 다 주운 것은 흐리게.
   기록은 G.mapSeen = {지역:{npcs:{id:{zone,name}}, items:{구역:{아이템:1}}}}. 없거나 모양이 틀린 옛 저장은 빈 기록에서 시작하고, 이미 캔·주운 것만 채운다. */
function mapSeenRegion(region){
  if(!saveObject(G.mapSeen))G.mapSeen={};
  const s=G.mapSeen[region];
  if(saveObject(s)&&saveObject(s.npcs)&&saveObject(s.items))return s;
  return G.mapSeen[region]={npcs:{},items:{}};
}
function mapNoteItem(s,zone,item){if(!ITEMS[item])return;(saveObject(s.items[zone])?s.items[zone]:(s.items[zone]={}))[item]=1;}
/* 필드 한 걸음마다(10프레임에 한 번) 지금 화면에 보이는 것을 적는다 */
function mapNoteSeen(){
  if(CLASSIC||!G?.started||!REG||!usesZones(REG)||!G.zone||G.anim%10)return;
  const s=mapSeenRegion(REG.id),zone=G.zone,shown=x=>x-cam>-12&&x-cam<W+12;
  for(const n of [...fieldNpcs(),...zoneObjects('wanderers')]){
    if(!n?.id||!n.draw||!formVisible(n)||!shown(n.x)||!G.learned.includes('met:'+n.id))continue;
    const name=typeof n.name==='string'&&n.name?n.name:npcName(n.id);
    if(s.npcs[n.id]?.zone!==zone||s.npcs[n.id]?.name!==name)s.npcs[n.id]={zone,name};
  }
  for(const d of fieldItems('digs'))if(!d.cache&&(d.done||formVisible(d)&&shown(d.x)))mapNoteItem(s,zone,d.item);
  for(const a of fieldItems('pickups'))if(a.got||formVisible(a)&&shown(a.x))mapNoteItem(s,zone,a.item);
}
/* 이 지역의 흙더미·주울 거리 (지금 지역은 G, 다른 지역은 보관한 상태) */
function mapRegionRows(region,key){const rows=region===G.region?G[key]:G.regionStates?.[region]?.fields?.[key];return Array.isArray(rows)?rows:[];}
/* 옛 저장: 이미 캔 흙더미와 주운 물건은 아이가 본 것이니 기록에 채운다 */
function mapBackfillSeen(){
  for(const r of regionList()){if(!usesZones(r))continue;const s=mapSeenRegion(r.id),z0=firstZone(r);
    for(const d of mapRegionRows(r.id,'digs'))if(!d.cache&&d.done&&mapVisited(r.id,d.zone||z0))mapNoteItem(s,d.zone||z0,d.item);
    for(const a of mapRegionRows(r.id,'pickups'))if(a.got&&mapVisited(r.id,a.zone||z0))mapNoteItem(s,a.zone||z0,a.item);}
}
/* 한 구역에서 본 것: 만난 이 이름들, 채집물(spent=그 구역에 남은 것이 없다) */
function mapSeenAt(region,zone){
  const s=G.mapSeen?.[region];if(!saveObject(s)||!mapVisited(region,zone))return {who:[],items:[]};
  const who=Object.values(saveObject(s.npcs)?s.npcs:{}).filter(v=>v?.zone===zone&&typeof v.name==='string').map(v=>v.name);
  const z0=firstZone(REGIONS[region]),here=a=>(a.zone||z0)===zone;
  const digs=mapRegionRows(region,'digs').filter(d=>here(d)&&!d.cache),picks=mapRegionRows(region,'pickups').filter(here);
  const items=Object.keys(saveObject(s.items?.[zone])?s.items[zone]:{}).filter(id=>ITEMS[id]).map(id=>{
    const rows=[...digs.filter(d=>d.item===id).map(d=>!d.done),...picks.filter(a=>a.item===id).map(a=>!a.got)];
    return {id,spent:rows.length>0&&!rows.some(Boolean)};
  });
  return {who,items};
}
function mapSeenText(seen){
  const parts=[];
  if(seen.who.length)parts.push(seen.who.join('·'));   // 결정 D-448: '만난 이' 말 없이 그 구역에서 만난 이름만
  if(seen.items.length)parts.push('채집물 '+seen.items.map(i=>ITEMS[i.id].n+(i.spent?'(다 거둠)':'')).join('·'));
  return parts.join(' · ');
}
/* 결정 D-816: 지도 이동은 이야기상 정말 못 할 때(늙은 까치를 만나기 전의 단풍골, 대화·전투·연출 중)만 막는다 (사용자 피드백 2026-11-06
   "3스테이지에 지도 누르면 같이 다닐 동무가 없다고 뜨냐. 지도로 이동 안되는경우는 없어야한다").
   두 번째 지역부터는 어느 길로 들어왔든(늙은 까치를 지나쳤든, 지역 고르기로 바로 시작했든, 끝 화면의 다음 지역 단추든) 그 지역 까치 둘이 맡는다.
   처음 맡을 때 아이가 까치를 본 속말 한 줄을 남긴다 (D-706). 시작(startGame)과 끝 화면의 다음 지역 단추가 부른다. */
const MAP_MAGPIE_LINES={
  dolneomeo:'돌담 위에 덩치 큰 까치 둘이 앉아 있다. 지도를 펴면 데려다줄 것 같다.',
  jangteo:'장터 처마 위에 까치 둘이 앉아 이쪽을 본다. 지도를 펴면 데려다줄 것 같다.'
};
function ensureMapCompanions(){
  if(CLASSIC||!G||G.f.mapUnlocked||(REG?.order||0)<2)return false;
  // 결정 D-1079: 영산은 주인공 독백으로 연다. 지도는 조용히 열린다(REG.quietMapUnlock)
  G.f.mapUnlocked=true;if(!REG.quietMapUnlock)think(MAP_MAGPIE_LINES[G.region]||'나뭇가지에 까치 둘이 앉아 이쪽을 본다. 지도를 펴면 데려다줄 것 같다.');return true;
}
// 결정 D-18: M 지도와 까치 떼 이동 (design/data/decisions.csv)
function openMap(){
  if(CLASSIC)return false;
  if(mapTravel||mapBlocked()){mapNotice('지금은 까치를 부를 수 없다');return false;}
  if(!G.f.mapUnlocked)ensureMapCompanions();   // 다른 길(저장·개발용 이동)로 들어와 아직 못 맡았으면 여기서 맡는다 (D-816)
  if(!G.f.mapUnlocked){mapNotice('아직 길을 함께 다닐 동무가 없다');return false;}
  if(G.ended&&!REG.next&&!G.f.newName){mapNotice('내 이름부터 적자');$('newName')?.focus();return false;}
  if(!G.started)return false;
  if(open('map'))return true;
  mapReturnFocus=document.activeElement;mapWasEnd=open('endScreen');
  closePanels();suppressHeldInputs();G.vx=G.vy=G.attackT=0;
  markZoneVisited();mapBackfillSeen();
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
    const seen=Object.fromEntries(graph.ids.map(id=>[id,mapSeenAt(r.id,id)])),tall=Object.values(seen).some(v=>v.who.length||v.items.length);
    // 본 것이 있는 지역은 칸을 키워 이름 아래에 만난 이·채집물 줄을 넣는다 (D-146). 먹선은 칸 위 점에 닿게 맞춘다.
    const CH=tall?170:126,DOT=tall?28:20;
    const section=el('section','map-region'),heading=el('h3',null,known?r.name:'？');
    const chart=el('div','map-chart'+(tall?' has-seen':'')),canvas=document.createElement('canvas');canvas.width=400;canvas.height=CH;canvas.setAttribute('aria-hidden','true');
    const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
    // 먹선은 짧은 직사각형으로 이어 픽셀 가장자리를 지킨다.
    for(const [a,b] of graph.edges){const p=graph.positions[a],q=graph.positions[b],dx=(q.x-p.x)*4,dy=(q.y-p.y)*CH/100;
      c.fillStyle=mapVisited(r.id,a)&&mapVisited(r.id,b)?'#75664e':'#c3b699';
      for(let i=0,n=Math.max(Math.abs(dx),Math.abs(dy));i<=n;i+=3){const t=n?i/n:0;c.fillRect(Math.round(p.x*4+dx*t),Math.round(p.y*CH/100-DOT+dy*t),3,2);}
    }
    chart.appendChild(canvas);
    for(const id of graph.ids){
      const known=mapVisited(r.id,id),current=mapCurrent(r.id,id),p=graph.positions[id];
      const b=el('button','map-place');b.type='button';b.dataset.region=r.id;b.dataset.zone=id;
      b.appendChild(el('span','map-place-name',known?TABLES.ZONES[r.id][id]:'？'));
      b.style.left=p.x+'%';b.style.top=p.y+'%';b.disabled=!known;
      if(!known){b.title='아직 가 보지 않은 곳';b.setAttribute('aria-label','아직 가 보지 않은 곳');}
      else{const v=seen[id],line=mapSeenText(v);
        // 결정 D-203: 만난 이 이름은 칸에 바로 쓰지 않고 작은 점으로만 둔다. 마우스를 올리거나(터치는 눌러 고르면) 이름 쪽지가 뜬다 (사용자 피드백 53)
        if(v.who.length){const row=el('span','map-seen-who');row.setAttribute('aria-hidden','true');
          for(let i=0;i<Math.min(v.who.length,MAP_WHO_DOTS);i++)row.appendChild(el('i','map-who-dot'));
          if(v.who.length>MAP_WHO_DOTS)row.appendChild(el('b',null,'+'+(v.who.length-MAP_WHO_DOTS)));
          b.appendChild(row);b.dataset.who=v.who.join(' · ');}
        if(v.items.length){const row=el('span','map-seen-items');
          for(const it of v.items.slice(0,3)){const ic=icon(it.id);if(it.spent)ic.classList.add('spent');ic.setAttribute('aria-hidden','true');row.appendChild(ic);}
          if(v.items.length>3)row.appendChild(el('b',null,'+'+(v.items.length-3)));
          b.appendChild(row);}
        if(line)b.setAttribute('aria-label',TABLES.ZONES[r.id][id]+' · '+line);
        b.onpointerenter=e=>{if(e.pointerType==='mouse')showMapTip(b);};b.onpointerleave=e=>{if(e.pointerType==='mouse')showMapTip(mapSelectedButton());};}
      if(current)b.setAttribute('aria-current','location');
      const selected=mapSelection?.region===r.id&&mapSelection?.zone===id;b.setAttribute('aria-pressed',String(selected));b.tabIndex=selected?0:-1;
      b.onclick=()=>selectMapPlace(b);
      b.onfocus=()=>{if(!b.disabled)selectMapPlace(b,false);};chart.appendChild(b);
    }
    section.append(heading,chart);body.appendChild(section);
  }
  updateMapSelection();body.onscroll=()=>showMapTip(mapTipButton);
}
/* 만난 이 쪽지: 지도 칸 위에 뜨는 작은 이름표. 지도 몸통이 굴러도 잘리지 않게 지도 창에 따로 둔다 */
const MAP_WHO_DOTS=5;
function mapSelectedButton(){return $('mapBody')?.querySelector('.map-place[aria-pressed="true"]')||null;}
let mapTipButton=null;
function showMapTip(button){
  if(button&&!button.isConnected)button=mapSelectedButton();   // 지도를 다시 그린 뒤의 옛 칸
  mapTipButton=button;let tip=$('mapTip');
  if(!tip){tip=el('div','map-tip');tip.id='mapTip';tip.setAttribute('aria-hidden','true');$('map').appendChild(tip);}
  const who=button&&!button.disabled&&open('map')?button.dataset.who:'';
  tip.hidden=!who;if(!who)return;
  tip.textContent=who;   // 결정 D-448tip.style.left='0px';   // 너비를 잴 때 오른쪽 끝에 눌려 접히지 않게
  const box=$('map').getBoundingClientRect(),r=button.getBoundingClientRect(),above=r.top-box.top>48;
  const view=$('mapBody').getBoundingClientRect();if(r.bottom<view.top||r.top>view.bottom){tip.hidden=true;return;}   // 굴러서 안 보이는 칸
  tip.classList.toggle('below',!above);
  const half=tip.offsetWidth/2,center=clamp(r.left+r.width/2-box.left,half+6,box.width-half-6);   // 지도 창 밖으로 나가지 않게
  tip.style.left=Math.round(center)+'px';
  tip.style.top=Math.round((above?r.top:r.bottom)-box.top)+'px';
}
function selectMapPlace(button,focus=true){
  if(button.disabled)return;
  mapSelection={region:button.dataset.region,zone:button.dataset.zone};
  for(const b of $('mapBody').querySelectorAll('button')){const selected=b===button;b.setAttribute('aria-pressed',String(selected));b.tabIndex=selected?0:-1;}
  updateMapSelection();if(focus)button.focus();showMapTip(button);
}
function updateMapSelection(){
  const s=mapSelection;$('mapDestination').textContent=s?TABLES.ZONES[s.region]?.[s.zone]||'어딘가':'';
  const seenLine=s?mapSeenText(mapSeenAt(s.region,s.zone)):'';$('mapSeenDetail').textContent=seenLine;$('mapSeenDetail').hidden=!seenLine;
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
    elapsed:0,duration:TABLES.TUNING.map_flight_ms,last:performance.now(),arrived:false,paused:document.hidden,wing:0,form:G.form||''};   // 결정 D-1457: 날아가는 동안의 모습
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
  arriveMapTravel(m);mapTravel=null;$('mapCaption').hidden=true;
  // 결정 D-1457: 떠날 때의 둔갑으로 내려앉는다 (D-722, 사용자 피드백 2026-11-11 8 "도착할 때까지 유지")
  if(m.form!==(G.form||'')&&hasForm(m.form))setForm(m.form,{force:true,quiet:true,scripted:true});document.body.classList.remove('map-flying');
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
  drawMagpieCarrier(x,y,t,m.form||'');
}
/* 결정 D-504: 보자기는 튼튼한 까치 둘이 양쪽에서 맞잡아 나른다 (사용자 피드백 2026-11-04: 늙은 까치 곁에 나오는 두 마리와 맞게,
   적당히 근육질의 두툼한 까치 둘만). 보자기 두 귀를 묶은 매듭을 굵은 발로 움켜쥐고, 가슴이 두툼하다. 둘은 서로 마주 본다.
   결정 D-1457 (사용자 피드백 2026-11-11 8 "까치 타고 날아갈 때 변신폼에 따라 다르게"): 나르는 모습은 떠날 때의 둔갑을 따르고,
   내려앉을 때까지 그 모습 그대로다.
   - 너구리: 위 D-504 그대로 보자기에 앉는다.
   - 다람쥐: 가벼워서 까치 한 마리가 등에 태운다. 다람쥐는 등에 엎드려 붙는다.
   - 산양: 무거워서 까치 넷이 크고 축 처진 보자기를 들고 날갯짓이 빠르다. 산양은 보자기에 다리가 묻힌 채 선다.
   - 수리부엉이: 제 날개로 난다. 까치 둘은 앞뒤에서 길을 잡는다(보자기 없음).
   - 수달: 긴 몸으로 보자기에 배를 걸치고 엎드려, 꼬리가 보자기 밖으로 늘어진다. */
function drawMagpieCarrier(x,y,t,form=''){
  const fold='#ae6757',edge='#713e36',ink='#292d31',white='#f5eedc',sheen='#4f6a7a',beak='#3a3530',leg='#2a2420';
  ctx.save();ctx.translate(Math.round(x),Math.round(y));
  const approach=t<.1?(1-t/.1)*68:t>.94?(t-.94)/.06*68:0,holding=approach===0;
  // 까치 한 마리 (face 1이면 오른쪽을 본다). 발은 (bx+1~6, by+8) 에서 매듭을 쥔다. flap 이 크면 날갯짓이 빠르다
  const bird=(bx,by,face,i,flap=62)=>{
    const q=(dx,dy,w,h,c)=>R(face>0?bx+dx:bx-dx-w+1,by+dy,w,h,c);
    const up=Math.sin(t*flap+i*1.8)>0;
    q(-26,-5,12,3,ink);q(-30,-3,9,2,ink);q(-24,-6,8,1,sheen);                    // 긴 꽁지
    if(!up){q(-11,-3,15,8,ink);q(-14,4,9,3,ink);q(-13,6,5,2,white);q(-9,-2,10,2,sheen);}   // 내린 날개
    q(-13,-11,23,12,ink);q(5,-10,7,10,ink);                                      // 두툼한 몸과 불룩한 가슴
    q(-11,-10,9,3,white);                                                        // 어깨의 흰 깃
    q(-4,-4,14,6,white);q(6,-7,4,5,white);q(5,-4,1,3,'#d6d0c2');q(8,-3,1,2,'#d6d0c2');   // 흰 배와 가슴 근육 결
    q(7,-14,7,6,ink);q(9,-19,10,9,ink);q(15,-16,1,1,white);                      // 굵은 목과 머리, 눈
    q(19,-15,5,2,beak);q(19,-14,4,1,leg);                                        // 부리
    if(up){q(-11,-23,15,12,ink);q(-14,-27,9,5,ink);q(-14,-26,5,2,white);q(-9,-20,11,2,sheen);}   // 든 날개
    q(0,1,3,7,leg);q(5,1,3,7,leg);q(-1,7,10,2,leg);                              // 굵은 다리와 움켜쥔 발
  };
  // 보자기: 아래가 불룩하고 귀를 위로 묶었다. 까치가 쥐고 있을 때만 귀가 위로 당겨진다. hw 반 너비, sag 처짐, cords [보자기 귀 x, 매듭 x, 매듭 y]
  const sack=(hw,sag,cords)=>{
    R(-hw,-8,hw*2,11+sag,fold);R(-hw+6,3+sag,hw*2-12,5,fold);R(-hw+11,8+sag,hw*2-22,3,edge);
    for(const [bx,kx,ky] of cords){const by=-7,ty=holding?ky:-12;
      for(let k=0;k<=12;k++){const q=k/12;R(bx+(kx-bx)*q-1,by+(ty-by)*q,3,2,fold);}
      R(kx-2,ty-1,5,3,edge);}
  };
  const PAIR=[[-24,-23,-25],[24,23,-25]];
  if(form==='squirrel'){
    // 등이 아이 발밑에 오게 낮게 난다. 내려오는 동안 다람쥐는 땅에서 기다렸다가 등에 오른다
    const by=8-approach;bird(2,by,1,0);
    if(holding){drawFormAt(-1,by-9,1,0,'squirrel');R(-14,by-21,3,2,'#d08a4f');}   // 바람에 젖혀진 꼬리 끝
    else drawFormAt(0,0,1,0,'squirrel');
  }else if(form==='goat'){
    sack(36,3,[[-32,-49,-25],[-12,-17,-49],[12,17,-49],[32,49,-25]]);
    drawFormAt(0,1,1,0,'goat');R(-14,-6,28,8,fold);R(-14,-6,28,1,edge);   // 다리는 보자기에 묻힌다
    bird(-24,-58-approach,1,2,90);bird(24,-58-approach,-1,3,90);bird(-56,-34-approach,1,0,90);bird(56,-34-approach,-1,1,90);
  }else if(form==='owl'){
    drawFormAt(0,holding?Math.round(Math.sin(t*50)*2):0,1,0,'owl',0,holding);   // 날개를 펴고 제 힘으로 날며 날갯짓마다 살짝 오르내린다
    bird(44,-24-approach,1,0);bird(-46,-8-approach,1,1);
  }else if(form==='otter'){
    sack(28,0,PAIR);
    otterSlideDraw=true;try{drawFormAt(2,-6,1,0,'otter');}finally{otterSlideDraw=null;}
    R(-26,-11,5,2,'#4a3222');R(-30,-10,3,10,'#4a3222');R(-30,0,2,3,'#4a3222');   // 보자기 밖으로 늘어진 꼬리
    bird(-30,-34-approach,1,0);bird(30,-34-approach,-1,1);
  }else{
    sack(28,0,PAIR);
    // 보따리에 앉은 아이. 머리는 기존 한국 보부상 모자의 평평한 챙을 따른다.
    R(-6,-15,13,12,'#8c8070');R(-4,-12,8,8,'#d9c7a5');R(-10,-3,8,4,ink);R(3,-3,8,4,ink);
    R(-8,-28,17,13,'#8c8070');R(-8,-23,17,4,ink);R(-5,-22,2,1,white);R(4,-22,2,1,white);
    R(-6,-18,13,3,white);R(-10,-30,22,3,'#c39b55');R(-5,-37,12,7,'#dcbb7a');R(-5,-32,12,2,'#6e4f22');
    bird(-30,-34-approach,1,0);bird(30,-34-approach,-1,1);
  }
  ctx.restore();
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
  if(open('map'))mapKey(k);else if(k==='m')mapNotice('지금은 까치를 부를 수 없다');
},true);
const pauseMapFlight=paused=>{if(mapTravel){mapTravel.paused=paused;mapTravel.last=performance.now();}};
addEventListener('blur',()=>pauseMapFlight(true));addEventListener('focus',()=>pauseMapFlight(document.hidden));
document.addEventListener('visibilitychange',()=>pauseMapFlight(document.hidden));
$('shell').addEventListener('click',e=>{
  if(mapTravel&&e.target.closest('#btnSound,#btnVolume'))return;
  if(mapTravel||open('map')&&!e.target.closest('#map')){e.preventDefault();e.stopImmediatePropagation();}
},true);
