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
/* 채집 설정 (아이템 id별): 필드에서 고리 타이밍으로 캔다 (gather.js) */
const GATHER={};
function defineGather(map){Object.assign(GATHER,map);}
/* 전투 상대: id는 design/data/bosses.csv 의 id와 같다 */
const ENEMIES={};
function defineEnemies(map){Object.assign(ENEMIES,map);}
/* 지역: id는 design/data/regions.csv 의 id와 같다. 지역 파일이 이 객체에 필요한 것을 채운다 (README 참고) */
const REGIONS={};
function defineRegion(id,obj){REGIONS[id]=Object.assign(REGIONS[id]||{id},obj);return REGIONS[id];}

const RAR=['하품','중품','상품','최상품','천하일품'];
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
  forms:[],form:'',   // 잎사귀 변신: 열린 변신 id 와 지금 모습 (''=너구리, forms.js)
  floorItems:{},floorPickups:{},regionStates:{},visitedZones:{},   // 지역별 필드와 실제로 밟은 구역
  awake:Object.keys(HEIR).filter(k=>HEIR[k].awakeAtStart),   // 깨어난 가보
  clues:[],diary:[],learned:[],nicknames:[],ledger:{},rel:{},f:{faints:0,arcs:arcsEnabled(null)},   // learned: 수첩·아이의 기록에서 공유하는 발견 키
};}
/* 보따리·호감·진행 표시는 하나로 이어지고 필드만 지역별로 보관한다.
   새 지역의 시작 물건과 기본 진행값은 첫 입장에만 적용한다. */
const regionFieldKeys=r=>[...Object.keys(r.newState()).filter(k=>!['inv','rel','f'].includes(k)),'zone','zoneStates','trimVer'];
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
  trimRegion(r);const ns=trimState(r,r.newState());
  for(const k in ns){
    if(k==='inv'){if(first)for(const i in ns.inv)g.inv[i]=(g.inv[i]||0)+ns.inv[i];}
    else if(k==='rel'){for(const i in ns.rel)if(!g.rel[i])g.rel[i]=ns.rel[i];}
    else if(k==='f'){for(const i in ns.f)if(g.f[i]===undefined)g.f[i]=ns.f[i];}
    else g[k]=ns[k];
  }
  Object.assign(g,saved?.fields||{});
  if(saved&&saved.fields.trimVer===undefined)delete g.trimVer;   // 자르기 전에 저장한 지역은 prepareZones에서 한 번 옮긴다 (D-109)
  if(!saved&&g.floorPickups?.[r.id])g.pickups=structuredClone(g.floorPickups[r.id]);
  Object.assign(g,{form:'',region:r.id,started:!!options.mapTravel,ended:false,hp:options.mapTravel?g.hp:g.maxhp,px:r.startX,py:GROUND,vx:0,vy:0,face:1,onGround:true,attackT:0,hurtT:0,cam:0,
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
/* 결정 D-48: 발판 무리는 오르락내리락한다 (사용자 피드백 2026-10-31 "난간이 너무 일정함").
   두 칸 계단(낮은 단 → 높은 단)을 되풀이하던 자리를, 올라갔다가 다시 내려오는 n칸 무리로 바꾼다.
   고정 시드라 열 때마다 같은 모양이다(저장·바닥 물건이 흔들리지 않는다). 한 번에 오르는 높이는 rise 안이라
   점프(약 45px)로 닿는다. 첫 단은 low 근처라 땅에서 오른다. 물건·문이 놓인 발판은 지역 코드가 그대로 둔다. */
/* 결정 D-50: 갈대·억새·풀의 흔들림 (사용자 피드백 2026-10-31 "갈대 흔들리는 게 이질적, 사인처럼, 속도도 은은하게 바뀌게").
   바람 세기는 아주 느린 사인 셋의 합이라 세졌다 잦아들기를 되풀이한다. 줄기 흔들림은 사인 둘의 합이고,
   위상이 느린 사인으로 밀려서 빠르기도 조금씩 바뀐다. 줄기마다 seed(세상 x)가 달라 같이 움직이지 않는다.
   뿌리는 고정, 위로 갈수록 많이 휜다(높이 비율 frac의 제곱). 움직임 줄이기면 진폭을 1/4로 줄인다. 반환값은 가로 밀림 px. */
function windSway(seed,frac,amp=3){
  const t=G?G.anim:0,reduced=typeof Vfx!=='undefined'&&Vfx.reducedMotion;
  const gust=.55+.25*Math.sin(t*.0023+seed*.011)+.12*Math.sin(t*.0061+1.7)+.08*Math.sin(t*.0137+.4);
  const phase=t*.05+2.4*Math.sin(t*.0031+seed*.37)+seed*1.9;
  const v=.78*Math.sin(phase)+.22*Math.sin(phase*1.83+seed);
  return amp*(reduced?.25:1)*gust*v*frac*frac;
}
/* 휘는 줄기 하나: 아래(x,y)에서 위로 h px. 2px 마디마다 windSway만큼 밀어 그린다. 끝의 밀림을 돌려준다. */
function swayStem(draw,x,y,h,seed,color,amp=3){
  for(let k=0;k<h;k+=2)draw(x+Math.round(windSway(seed,k/h,amp)),y-k-2,1,2,color);
  return Math.round(windSway(seed,1,amp));
}
function stepRidge(x,seed,n=4,{low=160,high=112,rise=30}={}){
  let s=(seed*2654435761)>>>0;const rnd=()=>(s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296;
  const top=1+Math.floor(rnd()*(n-1));
  const out=[];let y=low-Math.round(rnd()*6),px=x;
  for(let i=0;i<n;i++){
    const w=Math.round(54+rnd()*40);out.push({x:Math.round(px),y,w});
    // 결정 D-110: 이웃 발판은 가로로 겹치지 않는다(사이 6px 이상). 겹치면 단상이 포개져 지저분해 보인다.
    px+=w+Math.max(6,Math.round(rnd()*30)-8);
    const step=Math.round(rise*.5+rnd()*rise*.5);
    y=i<top?Math.max(high,y-step):Math.min(low+4,y+step);
  }
  return out;
}
/* 결정 D-109: 빈 걷기 구간 줄이기 (design/data/decisions.csv).
   지역 field.js가 Rg.trimCuts={구역:[[c,d],…]}를 둔다. 설계 좌표 c부터 d만큼을 지우고 그 뒤는 d만큼 당긴다.
   좌표가 여러 파일(field·story·strangers)에 흩어져 있어, 숫자를 고치지 않고 게임 상태를 만들 때 한 번에 옮긴다.
   · 구역 정의: 너비·시작·발판·문·물건·채집·도장·경치·오르기·조사·인물(같은 구역), 다른 구역에서 들어오는 문의 toX
   · 게터 목록(떠돌이·조사·도장): 처음 꺼낼 때 그 자리에서 한 번 옮긴다(접근자 x는 이미 실제 좌표라 두지 않는다)
   · 배경·장식 그림: 그 구역 art의 x에 tx()를 씌운다(잘린 구간 안의 장식은 숨긴다)
   · 상태(물건·채집)는 trimState, 옛 저장은 trimMigrate가 한 번 옮긴다. 옛 구성(classic)에는 쓰지 않는다. */
function trimX(x,cuts){if(!cuts||!Number.isFinite(x))return x;let s=0;for(const [c,d] of cuts){if(x>=c+d)s+=d;else if(x>c)s+=x-c;}return x-s;}
/* 자른 좌표 → 설계 좌표. 잘린 구간 시작에 모인 것은 그 시작으로 돌아간다 (옛 저장을 새 자르기로 옮길 때 쓴다). */
function untrimX(t,cuts){if(!cuts||!Number.isFinite(t))return t;let s=0;for(const [c,d] of [...cuts].sort((a,b)=>a[0]-b[0])){if(t+s>=c)s+=d;else break;}return t+s;}
/* 결정 D-116: 자르기 판 번호. 1은 PR #91(D-109) 첫 자르기, 2는 남은 빈 구간까지 줄인 판이다.
   결정 D-128: 3은 걷기만 하는 길을 콘텐츠 사이 230px 안팎까지 줄인 판이다.
   지역이 Rg.trimCutsV1·V2(그 판의 자르기)를 두면, 그 판으로 저장한 상태는 그 차이만큼만 옮긴다. */
const TRIM_VER=3;
/* 결정 D-128: 자른 구역의 배경은 남은 구간마다 나눠 그린다(engine/field.js segmentedDraw).
   그리는 동안 TRIM_SEG는 그 구간이 당겨진 만큼이고, cam은 그만큼 옮겨진다. 그래서 설계 좌표로 쓴 그림(u-cam)이 제자리에 온다.
   이미 옮긴 좌표(발판·도장·물건)나 원경 원근(cam*k)은 RC()(실제 카메라)를 쓴다. */
var TRIM_SEG=0,TRIM_SEGMENTING=false;
function RC(){return cam-TRIM_SEG;}
const trimInside=(x,cuts)=>!!cuts&&cuts.some(([c,d])=>x>c&&x<c+d);
function trimObj(o,cuts,done){
  if(!o||typeof o!=='object'||done?.has(o))return o;done?.add(o);
  const dx=Object.getOwnPropertyDescriptor(o,'x');
  if(dx&&'value' in dx&&Number.isFinite(dx.value))o.x=trimX(dx.value,cuts);
  return o;
}
/* 그림 좌표: 자른 구역의 배경·장식 x를 옮긴다. 잘린 구간 안의 장식은 화면 밖으로 보낸다. */
function tx(u){if(TRIM_SEGMENTING)return u;const c=!CLASSIC&&REG?.trimCuts?.[G?.zone];if(!c)return u;return trimInside(u,c)?-1e4:trimX(u,c);}
/* 결정 D-110: 단상(발판)이 포개져 보이지 않게 한다 (design/data/decisions.csv).
   가로로 겹치고 세로 차이가 48px 미만인 두 발판: 같은 높이면 하나로 합치고, 다른 높이면 6px 사이를 두고 뗀다.
   물건·문·경치가 올라앉은 자리(anchors)는 남기도록 반대쪽을 줄인다. 너비 40px 밑으로는 줄이지 않는다. */
const PLAT_GAP=6,PLAT_STACK=48;
function tidyPlatforms(list,anchors=[]){
  const on=(p,lo,hi)=>anchors.some(a=>Math.abs(a.y-p.y)<=3&&a.x>=lo&&a.x<=hi);
  const ps=list.map(p=>({...p})).sort((a,b)=>a.x-b.x||a.y-b.y);
  for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){
    const a=ps[i],b=ps[j];if(!a||!b||Math.abs(a.y-b.y)>6)continue;
    if(Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>-PLAT_GAP){const x=Math.min(a.x,b.x);a.w=Math.max(a.x+a.w,b.x+b.w)-x;a.x=x;a.y=Math.min(a.y,b.y);ps[j]=null;}
  }
  const out=ps.filter(Boolean).sort((a,b)=>a.x-b.x);
  for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){
    const a=out[i],b=out[j],dy=Math.abs(a.y-b.y);if(!a.w||!b.w||dy<=6||dy>=PLAT_STACK)continue;
    if(Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)<=-PLAT_GAP)continue;
    const [L,R]=a.x<=b.x?[a,b]:[b,a];
    const cut=L.x+L.w-(R.x-PLAT_GAP);
    if(cut>0&&L.w-cut>=40&&!on(L,R.x-PLAT_GAP,L.x+L.w)){L.w-=cut;continue;}
    const cut2=L.x+L.w+PLAT_GAP-R.x;
    if(cut2>0&&R.w-cut2>=40&&!on(R,R.x,R.x+cut2)){R.x+=cut2;R.w-=cut2;continue;}
    // 둘 다 줄일 수 없고, 한쪽이 다른 발판 밑에 대부분 숨어 있으면(겹친 길이가 제 너비의 절반 이상) 숨은 쪽을 뺀다.
    const ov=Math.min(L.x+L.w,R.x+R.w)-Math.max(L.x,R.x),low=L.y>R.y?L:R;
    if(ov>=low.w*.5&&!on(low,low.x,low.x+low.w))low.w=0;
  }
  return out.filter(p=>p.w>0);
}
function platformAnchors(r,id,z){
  const list=[];const take=a=>{if(a&&Number.isFinite(a.x)&&Number.isFinite(a.y)&&a.y<GROUND)list.push({x:a.x,y:a.y});};
  for(const k of ['pickups','doors','vistas','stamps','climbs','digs','examines']){
    const d=Object.getOwnPropertyDescriptor(z,k);if(d&&'value' in d&&Array.isArray(d.value))d.value.forEach(take);
  }
  if(r.trimAnchorState)for(const a of r.trimAnchorState.pickups||[])if((a.zone||firstZone(r))===id)take(a);
  return list;
}
function trimRegion(r){
  if(!r?.trimCuts||!r.zones||r.trimDone||CLASSIC)return;r.trimDone=true;
  const cuts=r.trimCuts,done=new WeakSet();
  for(const [id,z] of Object.entries(r.zones)){
    const c=cuts[id];
    for(const p of [...(z.doors||[]),...Object.values(z.exits||{})]){
      if(p&&typeof p==='object'&&cuts[p.to]&&Number.isFinite(p.toX))p.toX=trimX(p.toX,cuts[p.to]);
    }
    if(!c)continue;
    z.w=trimX(z.w,c);if(Number.isFinite(z.startX))z.startX=trimX(z.startX,c);
    if(Array.isArray(z.platforms))z.platforms=z.platforms.filter(p=>!trimInside(p.x+p.w/2,c)).map(p=>({...p,x:trimX(p.x,c)}));
    for(const k of ['doors','pickups','digs','stamps','vistas','climbs','examines','npcs']){
      const d=Object.getOwnPropertyDescriptor(z,k);if(!d)continue;
      if('value' in d&&Array.isArray(d.value))d.value.forEach(o=>trimObj(o,c,done));
      else if(d.get){const get=d.get;Object.defineProperty(z,k,{configurable:true,enumerable:d.enumerable,get(){const l=get.call(this);(l||[]).forEach(o=>trimObj(o,c,done));return l;}});}
    }
    for(const k of ['wanderers']){
      const d=Object.getOwnPropertyDescriptor(z,k);
      if(d?.get){const get=d.get;Object.defineProperty(z,k,{configurable:true,enumerable:d.enumerable,get(){const l=get.call(this);(l||[]).forEach(o=>trimObj(o,c,done));return l;}});}
      else if(d&&Array.isArray(d.value))d.value.forEach(o=>trimObj(o,c,done));
    }
    if(typeof z.maxX==='function'){const f=z.maxX;z.maxX=()=>trimX(f(),c);}
  }
  // 구역이 게터인 인물(진행에 따라 자리가 바뀜)은 그 게터가 실제 좌표를 돌려주므로 두지 않는다.
  // 발판 정리(D-110): 자른 뒤 좌표로, 모든 구역에. 시작 상태의 물건 자리도 받침으로 지킨다.
  try{r.trimAnchorState=trimState(r,r.newState());}catch(_){r.trimAnchorState=null;}
  for(const [id,z] of Object.entries(r.zones))if(Array.isArray(z.platforms))z.platforms=tidyPlatforms(z.platforms,platformAnchors(r,id,z));
  delete r.trimAnchorState;
  for(const n of r.npcs||[]){const d=Object.getOwnPropertyDescriptor(n,'zone');const zid=d&&'value' in d?d.value:null;if(zid&&cuts[zid])trimObj(n,cuts[zid],done);}
  r.trimHook?.(trimX);
}
function trimState(r,s){
  if(!r?.trimCuts||CLASSIC)return s;
  trimRegion(r);const z0=firstZone(r);
  for(const k of ['pickups','digs'])for(const a of s[k]||[]){const c=r.trimCuts[a.zone||z0];if(c)a.x=trimX(a.x,c);}
  r.trimStateHook?.(s,trimX);s.trimVer=TRIM_VER;return s;
}
/* 옛 저장(자르기 전)의 좌표를 한 번만 옮긴다. 잘린 구간 안에 있던 것은 구간 시작으로 모인다. */
function trimMigrate(r,g){
  if(!r?.trimCuts||CLASSIC||!g||g.trimVer===TRIM_VER)return;
  // 자르기 전 저장은 설계 좌표에서, 첫 판(1) 저장은 첫 판 좌표에서 지금 자르기로 옮긴다.
  const prev=g.trimVer===1?(r.trimCutsV1||r.trimCuts):g.trimVer===2?(r.trimCutsV2||r.trimCuts):null;
  const conv=(zone,x)=>trimX(untrimX(x,prev?.[zone]),r.trimCuts[zone]);
  g.trimVer=TRIM_VER;const z0=firstZone(r);
  for(const k of ['pickups','digs'])for(const a of g[k]||[]){const z=a.zone||z0;if(r.trimCuts[z])a.x=conv(z,a.x);}
  for(const zid of Object.keys(r.trimCuts)){
    for(const a of g.floorItems?.[r.id]?.[zid]||[])a.x=conv(zid,a.x);
    if(g.zone===zid&&g.region===r.id){g.px=conv(zid,g.px);g.cam=0;}
  }
  r.trimMigrateHook?.(g,trimX,conv);
}
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
  trimRegion(r);if(usesZones(r)&&r.trimCuts)trimMigrate(r,g);
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
// 결정 D-63: 귀한 것·도구와 아빠·엄마 물건은 맞바꾸기·흔한 물건 교환·선물로 내놓지 않는다.
// 예외는 그 전투 상대가 좋아하는 물건뿐이다(사연 있는 돌, 도깨비불씨, 아빠가 맡긴 엿). "네 아빠 거잖아"(기획서 §5).
function keepsake(id){const it=ITEMS[id];return !it||['귀한 것','도구'].includes(it.kind)||/^(dad|mom)_/.test(id);}
function addItem(id,n){
  if(n>0)Sound.item();
  G.inv[id]=(G.inv[id]||0)+n;
  Vfx.item(id,n);
  if(learn('got:'+id,true)&&NOTES[id])toast('수첩에 그렸다 · '+ITEMS[id].n);
  else toast('+ '+ITEMS[id].n+(n>1?' ×'+n:''));
  refreshHud();
}
function takeItem(id,n){G.inv[id]=(G.inv[id]||0)-n;if(G.inv[id]<=0)delete G.inv[id];refreshHud();}
function diary(id,text){if(G.diary.some(d=>d.id===id))return;G.diary.push({id,text});}
// 결정 D-140: 단서에 숫자를 붙이지 않는다 (확정 "사연은 은근히, 탐색 퍼즐이 되면 안 된다"). 세는 것은 보따리 '중요' 탭과 끝 화면에서만.
function clue(id,who,text){if(G.clues.some(c=>c.id===id))return;G.clues.push({id,who,text});setTimeout(()=>toast('아빠 단서를 찾았다'),900);}
function ledger(id,npc,want,give){if(!G.ledger[id])G.ledger[id]={npc,want,give,done:false};}
function ledgerDone(id){if(G.ledger[id]&&!G.ledger[id].done){Vfx.burst(G.px,G.py-12);Sound.exchange();G.ledger[id].done=true;}}
function rel(id,d){G.rel[id].v+=d;}

/* ---------- 여행하며 모으는 기록 ---------- */
// 결정 D-38: 첫 줄은 "엄마 걱정은 하지 말고" (사용자 요청 2026-10-31). 늙은 까치에게 아이가 하는 대답이 이 줄을 받는다.
const MOM_NOTE=['엄마 걱정은 하지 말고','아빠 만나면','손 꼭 잡고 와.','엄마가 기다릴게.'];
function normalizeTravelRecords(g){
  g.f=g.f||{};g.nicknames=Array.isArray(g.nicknames)?g.nicknames:[];g.learned=Array.isArray(g.learned)?g.learned:[];
  g.f.arcs=arcsEnabled(g);
  if(g.f.mapUnlocked===undefined&&(g.f.wanderersDone?.['galchamgol:old_magpie']||(REGIONS[g.region]?.order||0)>=2))g.f.mapUnlocked=true;
  if(!Number.isFinite(g.f.momNoteFade))g.f.momNoteFade=Math.max(0,(REGIONS[g.region]?.order||1)-1);
  if(g.started&&g.f.momNoteSeen===undefined)g.f.momNoteSeen=true;
  if(g.ended&&REGIONS[g.region]&&!REGIONS[g.region].next){g.f.momNoteFade=0;g.f.momNoteRestored=true;}
  return g;
}
// 결정 D-08: 흐려지는 엄마 쪽지 (design/data/decisions.csv)
function fadeMomNote(g){
  if(!g.f.momNoteRestored)g.f.momNoteFade=clamp((g.f.momNoteFade||0)+1,0,Math.max(0,regionList().length-1));
  return g.f.momNoteFade||0;
}
function noteFade(){const stage=fadeMomNote(G);if(open('notebook'))renderNotebook();return stage;}
function noteRestore(){
  G.f.momNoteFade=0;G.f.momNoteRestored=true;
  if(open('notebook'))renderNotebook();return true;
}
// 결정 D-07: 불리는 이름 (design/data/decisions.csv)
function grantNickname(id,text,by){
  if(!G||typeof id!=='string'||!id||typeof text!=='string'||!text.trim())return false;
  const list=G.nicknames||(G.nicknames=[]);
  if(list.some(n=>n.id===id))return false;
  list.push({id,text:text.trim(),by:by||'',region:G.region});
  learn('nickname:'+id,true);toast('새로 불린 이름 · '+text.trim());
  if(open('notebook'))renderNotebook();return true;
}
function nickname(id){return (G?.nicknames||[]).find(n=>n.id===id)?.text||'';}
function grantBattleGear(field,id,allowed,name){
  if(!G||!allowed.includes(id))return false;
  const owned=G.f[field]||(G.f[field]=[]);if(owned.includes(id))return false;
  owned.push(id);toast(jo(name,'을','를')+' 얻었다');
  if(typeof renderBattleForms==='function'&&typeof B!=='undefined'&&B)renderBattleForms();return true;
}
/* 초랭이탈·각시탈은 잎사귀 변신으로 바뀌었다 (PA-47). 옛 이야기 호출이 남아 있어도 아무 일도 하지 않는다. */
function grantMask(){return false;}
function grantTool(id){return grantBattleGear('battleTools',id,['pickaxe'],'곡괭이');}

/* 지역별 한 번, 현재 지역의 그림 또는 가공품 하나를 보낸다. 그림은 소지품이 없을 때 null을 쓴다.
   home:<지역> 발견 키는 옛 저장과 지역 사연이 이미 쓰고 있어 그대로 유지한다. */
// 결정 D-06: 집으로 보내기와 엄마의 몸짓 답장 (design/data/decisions.csv)
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
  if(open('notebook'))renderNotebook();return true;
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
