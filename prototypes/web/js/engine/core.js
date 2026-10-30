'use strict';
/* 공통 기본: 화면 크기, 짧은 도우미, 아이템·지역 등록소, 게임 상태와 상태를 바꾸는 함수.
   모든 js 파일은 일반 <script>로 차례대로 읽힌다. 맨 위에 선언한 const/let/function은 파일끼리 공유된다.
   지역 파일은 (()=>{ ... })() 안에 넣어 이름이 다른 지역과 부딪히지 않게 하고, 아래 define* 함수로만 내보낸다. */

const W=400,H=225,GROUND=192;
const cv=document.getElementById('cv');let ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function hash(n){const s=Math.sin(n*127.1)*43758.5453;return s-Math.floor(s);}
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
/* 받침 있는 글자 뒤에는 b, 없으면 a를 붙인다 (을/를, 이/가) */
function jo(w,a,b){const c=w.charCodeAt(w.length-1);if(c<0xAC00||c>0xD7A3)return w+a;return w+(((c-0xAC00)%28)?a:b);}
const TOUCH=matchMedia('(pointer:coarse)').matches;
const HITKEY=TOUCH?'치기 버튼':'J 키';
const CLASSIC=new URLSearchParams(location.search).get('classic')==='1';
/* 새 게임은 확장판 사연을 기본으로 켠다. 이어서 할 때는 저장한 선택을 유지한다.
   classic은 사연을 쓰지 않으며, 사연 칸이 없는 옛 저장은 현재 주소의 기본값을 따른다. */
function arcsEnabled(g=G){
  if(CLASSIC)return false;
  if(typeof g?.f?.arcs==='boolean')return g.f.arcs;
  return new URLSearchParams(location.search).get('arcs')!=='0';
}

/* ---------- 등록소 ---------- */
/* 아이템: n(이름)·r(레어도 단계, 0부터)·d(설명)는 design/data/items.csv 에서 만든 js/data/tables.js 가 넣는다.
   코드는 게임 전용 칸만 더한다 (eat:먹으면 오르는 체력) */
const ITEMS={};
function defineItems(map){for(const k in map)ITEMS[k]=Object.assign(ITEMS[k]||{},map[k]);}   // 칸별로 합친다
/* 손에 드는 연장 {n:이름, d:설명} */
const TOOLS={};
function defineTools(map){Object.assign(TOOLS,map);}
/* 16×16 아이콘 그림. ICON_ART[id]=P=>{P(x,y,w,h,색);...} */
const ICON_ART={};
function defineIcons(map){Object.assign(ICON_ART,map);}
/* 채집 미니게임 설정 (아이템 id별) */
const GATHER={};
function defineGather(map){Object.assign(GATHER,map);}
/* 전투 상대: id는 design/data/bosses.csv 의 id와 같다 */
const ENEMIES={};
function defineEnemies(map){Object.assign(ENEMIES,map);}
/* 지역: id는 design/data/regions.csv 의 id와 같다. 지역 파일이 이 객체에 필요한 것을 채운다 (README 참고) */
const REGIONS={};
function defineRegion(id,obj){REGIONS[id]=Object.assign(REGIONS[id]||{id},obj);return REGIONS[id];}

const RAR=['흔한 것','쓸 만한 것','귀한 것','보배','전설'];
const RCOL=['#9c8f78','#5f8a3a','#3f84b5','#8e4fc2','#d29a12'];

/* ---------- 상태 ---------- */
let REG=null;   // 지금 지역
let G;          // 게임 상태 (저장·복원되는 것은 여기에만 둔다)
const regionList=()=>Object.values(REGIONS).sort((a,b)=>a.order-b.order);
/* 지금 지역까지 지나온 지역들. 아빠 단서 개수는 이 지역들을 모두 더해 센다 */
const regionsSoFar=()=>regionList().filter(r=>r.order<=REG.order);
const clueTotalSoFar=()=>regionsSoFar().reduce((s,r)=>s+r.clueTotal,0);
function npcName(id){for(const r of regionList()){const n=(r.npcs||[]).find(n=>n.id===id);if(n)return n.name;}return id;}

/* 지역에 상관없이 이어지는 상태 */
function baseState(){return{
  started:false,ended:false,region:null,
  runId:Date.now().toString(36)+Math.floor(Math.random()*1e6).toString(36),   // 게임 하나를 가리키는 번호 (저장 덮어쓰기 확인용)
  px:0,py:GROUND,vx:0,vy:0,face:1,onGround:true,anim:0,
  hp:5,maxhp:5,attackT:0,hurtT:0,cam:0,
  inv:{},tool:'pick',sharp:false,
  floorItems:{},floorPickups:{},regionStates:{},visitedZones:{},   // 지역별 필드와 실제로 밟은 구역
  awake:Object.keys(HEIR).filter(k=>HEIR[k].awakeAtStart),   // 깨어난 가보
  clues:[],diary:[],learned:[],nicknames:[],ledger:{},rel:{},f:{faints:0,arcs:arcsEnabled(null)},   // learned: 수첩·아이의 기록에서 공유하는 발견 키
};}
/* 보따리·호감·진행 표시는 하나로 이어지고 필드만 지역별로 보관한다.
   새 지역의 시작 물건과 기본 진행값은 첫 입장에만 적용한다. */
const regionFieldKeys=r=>[...Object.keys(r.newState()).filter(k=>!['inv','rel','f'].includes(k)),'zone','zoneStates'];
function regionCompleted(id,g=G){return !!g?.regionStates?.[id]?.completed;}
function markZoneVisited(g=G,r=REG){
  if(CLASSIC||!g||!r||!usesZones(r)||!r.zones[g.zone])return;
  const regions=g.visitedZones||(g.visitedZones={});
  (regions[r.id]||(regions[r.id]={}))[g.zone]=true;
}
function rememberRegion(g=G){
  const r=REGIONS[g?.region];if(!r)return;
  const states=g.regionStates||(g.regionStates={}),previous=states[r.id];
  const fields={};for(const key of regionFieldKeys(r))if(g[key]!==undefined)fields[key]=structuredClone(g[key]);
  states[r.id]={fields,completed:!!g.ended||!!previous?.completed};
  (g.floorPickups||(g.floorPickups={}))[r.id]=structuredClone(g.pickups||[]);
  markZoneVisited(g,r);
  return states[r.id];
}
function enterRegion(g,r,options={}){
  const previous=REGIONS[g.region],moving=!!previous&&previous.id!==r.id;
  if(previous)rememberRegion(g);
  const saved=g.regionStates?.[r.id],first=!saved;
  if(moving&&first)fadeMomNote(g);
  if(g===G&&moving)Sound.travel();
  if(previous)for(const key of regionFieldKeys(previous))delete g[key];
  const ns=r.newState();
  for(const k in ns){
    if(k==='inv'){if(first)for(const i in ns.inv)g.inv[i]=(g.inv[i]||0)+ns.inv[i];}
    else if(k==='rel'){for(const i in ns.rel)if(!g.rel[i])g.rel[i]=ns.rel[i];}
    else if(k==='f'){for(const i in ns.f)if(g.f[i]===undefined)g.f[i]=ns.f[i];}
    else g[k]=ns[k];
  }
  Object.assign(g,saved?.fields||{});
  if(!saved&&g.floorPickups?.[r.id])g.pickups=structuredClone(g.floorPickups[r.id]);
  Object.assign(g,{region:r.id,started:!!options.mapTravel,ended:false,hp:options.mapTravel?g.hp:g.maxhp,px:r.startX,py:GROUND,vx:0,vy:0,face:1,onGround:true,attackT:0,hurtT:0,cam:0,
    zone:options.zone??saved?.fields?.zone??null,zoneStates:saved?.fields?.zoneStates||{}});
  if(r.order>=REGIONS.dolneomeo?.order)g.f.bagReachedDolneomeo=true;
  prepareZones(g,r,true);rememberRegion(g);return g;
}
/* 구역을 선언하지 않은 지역은 기존 REG 경로를 그대로 쓴다. 지역 자체는 바꾸지 않는다. */
const usesZones=r=>!CLASSIC&&!!r.zones&&Object.keys(r.zones).length>0;
const firstZone=r=>r.startZone||Object.keys(r.zones)[0];
const zoneDef=()=>usesZones(REG)?REG.zones[G.zone]:null;
const fieldDef=()=>zoneDef()||REG;
const fieldWidth=()=>zoneDef()?zoneDef().w:REG.world;
const fieldGround=()=>zoneDef()?.ground??GROUND;
const fieldPlatforms=()=>fieldDef().platforms||[];
function fieldCall(name,...args){const f=fieldDef()[name];return typeof f==='function'?f(...args):undefined;}
function fieldItems(name){return G[name].filter(a=>usesZones(REG)?(a.zone||firstZone(REG))===G.zone:!a.zone);}
function fieldNpcs(){
  const z=zoneDef();if(!z)return REG.npcs||[];
  if(z.npcs)return z.npcs.map(n=>typeof n==='string'?(REG.npcs||[]).find(a=>a.id===n):n).filter(Boolean);
  return (REG.npcs||[]).filter(n=>(n.zone||firstZone(REG))===G.zone);
}
function zoneState(){return G.zoneStates[G.zone];}
/* classic도 지역 안의 독립된 구역 키로 보관한다. 바닥 위치는 연출과 별개인 착지 좌표다. */
function floorDrops(regionId=G.region,zoneId=G.zone??'classic'){
  zoneId=zoneId??'classic';
  const regions=G.floorItems||(G.floorItems={});
  const zones=regions[regionId]||(regions[regionId]={});
  return zones[zoneId]||(zones[zoneId]=[]);
}
/* 보따리는 현재 무제한이다. 칸 제한이 주어진 경우에도 기존 묶음에는 계속 넣는다. */
function canPickupItem(id){
  if(!ITEMS[id])return false;
  if((G.inv[id]||0)>0||!Number.isFinite(G.bagSlots))return true;
  return Object.values(G.inv).filter(n=>n>0).length<Math.max(0,Math.floor(G.bagSlots));
}
function prepareZones(g,r,fresh=false){
  if(!usesZones(r)){
    if(g.zone&&r.zones&&g.zone!==firstZone(r)){g.px=r.startX;g.py=GROUND;g.cam=0;}
    g.zone=null;placeFloorPickups(g,r);return;
  }
  const start=firstZone(r),invalid=g.zone&&!r.zones[g.zone];
  const old=!g.zone;
  g.zone=r.zones[g.zone]?g.zone:start;g.zoneStates=g.zoneStates||{};
  for(const [id,z] of Object.entries(r.zones)){
    if(!g.zoneStates[id])g.zoneStates[id]=z.newState?z.newState():{};
    // 선언은 한 번만 복제한다. 저장한 done/got을 보존하고 왕복할 때 추가하지 않는다.
    for(const kind of ['digs','pickups'])for(const [i,a] of (z[kind]||[]).entries()){
      const key=a.id||id+':'+kind+':'+i;
      if(!g[kind].some(b=>b.id===key&&(b.zone||start)===id))g[kind].push({...a,id:key,zone:id});
    }
  }
  const z=r.zones[g.zone];
  if(fresh||invalid){g.px=z.startX??r.startX??70;g.py=z.ground??GROUND;g.cam=0;}
  g.px=clamp(g.px,16,z.w-16);
  if(old&&!fresh){g.vx=0;g.vy=0;}
  g.cam=clamp(g.cam||0,0,Math.max(0,z.w-W));
  placeFloorPickups(g,r);
  markZoneVisited(g,r);
}
/* 옛 공중 자동 줍기 지점도 같은 x의 받침 위에 둔다. 닫힌 길의 반대편으로 옮기지 않는다.
   한 번 정한 자리는 저장하며, 새 버전에서 불러온 옛 저장에만 이 보정을 처음 적용한다. */
function placeFloorPickups(g,r){
  for(const a of g.pickups||[]){
    if(a.floorPlaced)continue;
    const z=usesZones(r)?r.zones[a.zone||firstZone(r)]:r;if(!z)continue;
    a.y=(z.platforms||[]).filter(p=>a.x>=p.x&&a.x<=p.x+p.w&&p.y>=a.y-.01)
      .reduce((y,p)=>Math.min(y,p.y),z.ground??GROUND);
    a.floorPlaced=true;
  }
}
/* 새 게임. id 지역부터 시작하면 앞 지역들은 그 지역의 finish(g)로 마친 것으로 친다 (확인용 바로가기) */
function newGame(id){
  const list=regionList(),target=REGIONS[id]||list[0];
  const g=baseState();
  for(const r of list){if(r.order>=target.order)break;enterRegion(g,r);if(r.finish)r.finish(g);}
  return enterRegion(g,target);
}
const heldTool=()=>G.tool;

function has(id,n){return (G.inv[id]||0)>=(n||1);}
function addItem(id,n){
  if(n>0)Sound.item();
  G.inv[id]=(G.inv[id]||0)+n;
  Vfx.item(id,n);
  if(learn('got:'+id,true)&&NOTES[id])toast('아이의 기록에 그렸다 · '+ITEMS[id].n);
  else toast('+ '+ITEMS[id].n+(n>1?' ×'+n:''));
  refreshHud();
}
function takeItem(id,n){G.inv[id]=(G.inv[id]||0)-n;if(G.inv[id]<=0)delete G.inv[id];refreshHud();}
function diary(id,text){if(G.diary.some(d=>d.id===id))return;G.diary.push({id,text});}
function clue(id,who,text){if(G.clues.some(c=>c.id===id))return;G.clues.push({id,who,text});setTimeout(()=>toast('아빠 단서를 찾았다 ('+G.clues.length+'/'+clueTotalSoFar()+')'),900);}
function ledger(id,npc,want,give){if(!G.ledger[id])G.ledger[id]={npc,want,give,done:false};}
function ledgerDone(id){if(G.ledger[id]&&!G.ledger[id].done){Vfx.burst(G.px,G.py-12);Sound.exchange();G.ledger[id].done=true;}}
function rel(id,d){G.rel[id].v+=d;}

/* ---------- 여행하며 모으는 기록 ---------- */
const MOM_NOTE=['밥 잘 먹고','아빠 만나면','손 꼭 잡고 와.','엄마가 기다릴게.'];
function normalizeTravelRecords(g){
  g.f=g.f||{};g.nicknames=Array.isArray(g.nicknames)?g.nicknames:[];g.learned=Array.isArray(g.learned)?g.learned:[];
  g.f.arcs=arcsEnabled(g);
  if(g.f.mapUnlocked===undefined&&(g.f.wanderersDone?.['galchamgol:old_magpie']||(REGIONS[g.region]?.order||0)>=2))g.f.mapUnlocked=true;
  if(!Number.isFinite(g.f.momNoteFade))g.f.momNoteFade=Math.max(0,(REGIONS[g.region]?.order||1)-1);
  if(g.started&&g.f.momNoteSeen===undefined)g.f.momNoteSeen=true;
  if(g.ended&&REGIONS[g.region]&&!REGIONS[g.region].next){g.f.momNoteFade=0;g.f.momNoteRestored=true;}
  return g;
}
function fadeMomNote(g){
  if(!g.f.momNoteRestored)g.f.momNoteFade=clamp((g.f.momNoteFade||0)+1,0,Math.max(0,regionList().length-1));
  return g.f.momNoteFade||0;
}
function noteFade(){const stage=fadeMomNote(G);if(open('book'))renderBook();return stage;}
function noteRestore(){
  G.f.momNoteFade=0;G.f.momNoteRestored=true;
  if(open('book'))renderBook();return true;
}
function grantNickname(id,text,by){
  if(!G||typeof id!=='string'||!id||typeof text!=='string'||!text.trim())return false;
  const list=G.nicknames||(G.nicknames=[]);
  if(list.some(n=>n.id===id))return false;
  list.push({id,text:text.trim(),by:by||'',region:G.region});
  learn('nickname:'+id,true);toast('새로 불린 이름 · '+text.trim());
  if(open('book'))renderBook();return true;
}
function nickname(id){return (G?.nicknames||[]).find(n=>n.id===id)?.text||'';}
function grantBattleGear(field,id,allowed,name){
  if(!G||!allowed.includes(id))return false;
  const owned=G.f[field]||(G.f[field]=[]);if(owned.includes(id))return false;
  owned.push(id);toast(jo(name,'을','를')+' 얻었다');
  if(typeof renderBattleMasks==='function'&&typeof B!=='undefined'&&B)renderBattleMasks();return true;
}
function grantMask(id){return grantBattleGear('battleMasks',id,['choraengi','gaksi'],id==='choraengi'?'초랭이탈':'각시탈');}
function grantTool(id){return grantBattleGear('battleTools',id,['pickaxe'],'곡괭이');}

/* 지역별 한 번, 현재 지역의 그림 또는 가공품 하나를 보낸다. 그림은 소지품이 없을 때 null을 쓴다.
   home:<지역> 발견 키는 옛 저장과 지역 사연이 이미 쓰고 있어 그대로 유지한다. */
function sendHomeGift(regionId,itemId){
  if(!G||!G.started||G.ended||regionId!==G.region||!REGIONS[regionId]||knows('home:'+regionId))return false;
  if(itemId!=null&&(!ITEMS[itemId]||!has(itemId)||ITEMS[itemId].region!==regionId||!Object.values(RECIPES).some(list=>list.some(r=>r.out===itemId))))return false;
  if(typeof brewing!=='undefined'&&brewing)return false;
  returnPouch();
  if(itemId!=null){
    const after={...G.inv,[itemId]:G.inv[itemId]-1};
    if(progressShortage(after)>progressShortage(G.inv)){toast('먼저 쓸 몫을 남긴 뒤 엄마에게 보내자.');return false;}
  }
  const key='home:'+regionId,next=REGIONS[regionId].next||null;
  const gifts=G.f.homeGifts||(G.f.homeGifts={});
  gifts[regionId]={itemId:itemId||null,to:next,delivered:false};
  if(itemId!=null)takeItem(itemId,1);
  learn(key,true);diary(key,(itemId?ITEMS[itemId].n+' 하나':'이곳에서 그린 그림')+'를 까치 편에 집으로 보냈다.');
  Sound.paper();toast('까치가 집으로 날아갔다.');
  if(open('book'))renderBook();return true;
}
/* 다음 지역의 첫 쉼터 또는 까치 길손에서 부른다. 답장을 보이면 true, 없으면 false. */
function deliverHomeReply(){
  if(!G||!G.started||G.ended||open('dlg')||B||openMinigame())return false;
  const row=Object.entries(G.f.homeGifts||{}).find(([id,gift])=>gift&&gift.to===G.region&&!gift.delivered&&id!==G.region);
  if(!row)return false;
  const [id,gift]=row,source=REGIONS[id];if(!source)return false;
  let raw;try{raw=typeof source.homeReply==='function'?source.homeReply(gift):source.homeReply;}catch(_){return false;}
  // 지역 글이 아직 없으면 공통 대사로 대신하지 않는다. 연결 뒤 같은 접점에서 다시 받을 수 있다.
  if(!raw)return false;
  const rows=typeof raw==='string'?[raw]:raw;if(!Array.isArray(rows))return false;
  const lines=rows.map(line=>typeof line==='string'?['까치',line]:line);
  if(!lines.length||lines.some(line=>!Array.isArray(line)||typeof line[0]!=='string'||typeof line[1]!=='string'||(line[2]!=null&&(!Array.isArray(line[2])||line[2].some(c=>!c||typeof c.t!=='string'||(c.go!=null&&typeof c.go!=='function'))))))return false;
  gift.delivered=true;learn('homeReply:'+id,true);
  diary('homeReply:'+id,lines.map(line=>line[1]).join(' '));
  closePanels();suppressHeldInputs();talk(lines);return true;
}

let toastT=0;
function toast(msg){const t=$('toast');t.textContent=msg;t.hidden=!!vistaMode;toastT=TABLES.TUNING.toast_frames;}
