'use strict';
/* 저장: 이 기기의 브라우저(localStorage)에 게임 상태(G) 하나를 저장한다. 다른 기기·다른 브라우저와는 이어지지 않는다.
   - 저장하기 버튼 (화면 위 버튼 줄, 너구리의 책 아래)
   - 자동 저장: 플레이 중 30초마다, 다음 지역으로 넘어갈 때, 지역을 끝냈을 때
   - 대화·전투·미니게임 중에는 저장하지 않는다 (그 상태는 G 밖에 있어서)
   - 시작 화면: 저장이 있으면 '이어서 하기'
   - 처음부터 하기 / 새로 시작: 저장이 있으면 한 번 더 눌러야 저장을 지운다 */
const SAVE_KEY='packoon-save-v1';
let saveRecoveryBlocked=false;
const busyForSave=()=>!!B||inkOn||!!vistaMode||!!zoneMotion||zoneFade>0||(typeof mapTravel!=='undefined'&&!!mapTravel)||open('dlg')||!!openMinigame();
const saveObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
/* 빠진 칸만 지역 기본값으로 보충한다. 존재하는 진행·수량을 새 게임 값으로 덮지 않는다. */
function repairSavedState(source,repairRegions=true){
  if(!saveObject(source)||!Object.hasOwn(REGIONS,source.region))throw Error('region');
  // 변신 칸이 없거나 모양이 틀린 옛 저장은 너구리, 열린 변신 없음으로 읽는다 (forms.js)
  source={...source};if(!Array.isArray(source.forms))delete source.forms;if(typeof source.form!=='string')delete source.form;
  const r=REGIONS[source.region],defaults=baseState(),ns=r.newState();
  const flags={...defaults.f,...ns.f};Object.assign(defaults,ns,{region:r.id,f:{},inv:{}});
  function fill(value,fallback){
    if(value===undefined)return structuredClone(fallback);
    if(Array.isArray(fallback)){
      if(!Array.isArray(value))throw Error('array');return value;
    }
    if(saveObject(fallback)){
      if(!saveObject(value))throw Error('object');
      const out={...value};for(const key of Object.keys(fallback))out[key]=fill(value[key],fallback[key]);return out;
    }
    if(fallback!==null&&(typeof value!==typeof fallback||typeof value==='number'&&!Number.isFinite(value)))throw Error('value');
    return value;
  }
  const g=fill(source,defaults);
  // 진행값(f)은 플레이 중 형태가 바뀔 수 있어 검사하지 않는다. 빠진 칸만 기본값으로 채운다 (옛 저장 호환).
  g.f={...flags,...g.f};
  for(const [id,n] of Object.entries(g.inv)){if(!Object.hasOwn(ITEMS,id)){delete g.inv[id];continue;}if(!Number.isSafeInteger(n)||n<0)throw Error('inv');} // 없어진 아이템은 버리고 나머지는 살린다
  for(const row of Object.values(g.rel))if(!saveObject(row)||typeof row.t!=='string'||!Number.isFinite(row.v))throw Error('rel');
  for(const key of ['awake','learned'])if(g[key].some(id=>typeof id!=='string'))throw Error(key);
  g.forms=FORM_IDS.filter(id=>g.forms.includes(id));if(!g.forms.includes(g.form))g.form='';
  for(const key of ['diary','clues','nicknames'])if(g[key].some(row=>!saveObject(row)||typeof row.id!=='string'||typeof row.text!=='string'))throw Error(key);
  for(const key of ['digs','pickups','mobs'])if(g[key]?.some(row=>!saveObject(row)||!Number.isFinite(row.x)))throw Error(key);
  for(const key of ['digs','pickups'])if(g[key]?.some(row=>!Object.hasOwn(ITEMS,row.item)))throw Error(key);
  if(g.pickups?.some(row=>!Number.isFinite(row.y)))throw Error('pickups');
  if(!saveObject(g.floorItems)||!saveObject(g.floorPickups))throw Error('floorItems');
  const validFloorRow=row=>saveObject(row)&&Object.hasOwn(ITEMS,row.item)&&Number.isFinite(row.x)&&Number.isFinite(row.y)&&
    ['sourceX','sourceY','flight','bounce'].every(key=>row[key]===undefined||Number.isFinite(row[key]));
  for(const zones of Object.values(g.floorItems)){
    if(!saveObject(zones))throw Error('floorItems');
    for(const rows of Object.values(zones))if(!Array.isArray(rows)||rows.some(row=>!validFloorRow(row)))throw Error('floorItems');
  }
  for(const rows of Object.values(g.floorPickups))if(!Array.isArray(rows)||rows.some(row=>!validFloorRow(row)))throw Error('floorPickups');
  if(g.bagSlots!==undefined&&(!Number.isSafeInteger(g.bagSlots)||g.bagSlots<0))throw Error('bagSlots');
  if(g.drop!==undefined&&g.drop!==null&&(!saveObject(g.drop)||!['x','y','vy'].every(key=>Number.isFinite(g.drop[key]))))throw Error('drop');
  if(!Number.isSafeInteger(g.hp)||!Number.isSafeInteger(g.maxhp)||g.hp<0||g.maxhp<=0||g.maxhp>100||g.hp>g.maxhp||!Object.hasOwn(TOOLS,g.tool))throw Error('player');
  for(const row of Object.values(g.ledger))if(!saveObject(row)||typeof row.npc!=='string')throw Error('ledger');
  if(g.zoneStates===undefined)g.zoneStates={};
  if(!saveObject(g.zoneStates))throw Error('zoneStates');
  if(usesZones(r)){
    if(typeof g.zone!=='string'||!Object.hasOwn(r.zones,g.zone)){
      g.zone=firstZone(r);g.px=r.zones[g.zone].startX??r.startX;g.py=r.zones[g.zone].ground??GROUND;g.cam=0;
    }
    for(const [id,z] of Object.entries(r.zones))g.zoneStates[id]=fill(g.zoneStates[id],z.newState?z.newState():{});
  }else g.zone=null;
  if(!saveObject(g.regionStates)||!saveObject(g.visitedZones))throw Error('regions');
  for(const [id,zones] of Object.entries(g.visitedZones)){
    if(!Object.hasOwn(REGIONS,id)||!saveObject(zones))throw Error('visitedZones');
    for(const [zone,value] of Object.entries(zones))if(!TABLES.ZONES[id]?.[zone]||value!==true)throw Error('visitedZones');
  }
  if(repairRegions)for(const [id,snapshot] of Object.entries(g.regionStates)){
    if(!Object.hasOwn(REGIONS,id)||!saveObject(snapshot)||!saveObject(snapshot.fields)||typeof snapshot.completed!=='boolean')throw Error('regionStates');
    const restored=repairSavedState({...g,...snapshot.fields,region:id,ended:snapshot.completed,regionStates:{},visitedZones:{}},false);
    const fields={};for(const key of regionFieldKeys(REGIONS[id]))if(restored[key]!==undefined)fields[key]=restored[key];
    g.regionStates[id]={fields,completed:snapshot.completed};
  }
  normalizeTravelRecords(g);
  if(repairRegions)rememberRegion(g); // 옛 저장은 현재 지역 한 곳만 보관한다.
  return g;
}
function readSave(){
  let raw;try{raw=localStorage.getItem(SAVE_KEY);}catch(_){return null;}
  if(raw===null)return null;
  try{
    const s=JSON.parse(raw);if(!saveObject(s)||s.v!==1)throw Error('version');
    return {...s,at:Number.isFinite(s.at)?s.at:Date.now(),G:repairSavedState(s.G)};
  }catch(_){
    // 읽지 못한 저장은 지우지 않고 다른 칸에 옮겨 둔 뒤, 저장이 없는 것처럼 새로 시작하게 한다.
    try{
      let key=SAVE_KEY+'-unreadable-'+Date.now();while(localStorage.getItem(key)!==null)key+='-copy';
      localStorage.setItem(key,raw);localStorage.removeItem(SAVE_KEY);
      setTimeout(()=>toast('저장을 읽지 못해 따로 보관했어요. 새로 시작할 수 있어요'),0);
    }catch(_){saveRecoveryBlocked=true;}   // 옮기지 못했으면 자동 저장도 원본을 덮지 않는다
    return null;
  }
}
function writeSave(quiet){
  // 원문을 별도 보관하지 못했다면 자동 저장도 원본을 덮지 않는다.
  if(saveRecoveryBlocked){if(!quiet)toast('이 브라우저에서는 저장할 수 없다');return false;}
  if(!G||busyForSave()){if(!quiet)toast('대화나 전투가 끝난 뒤에 저장할 수 있다');return false;}
  returnPouch();   // 가공대에 올려 둔 물건은 보따리로 돌려 놓고 저장
  // 저장 주기를 유지하면서 실제로 반환한 재료·소지품·버튼을 화면에도 반영한다.
  if(open('bag')){pouchMsg='';renderBag();}
  rememberRegion(G);
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({v:1,at:Date.now(),G}));}
  catch(_){if(!quiet)toast('이 브라우저에서는 저장할 수 없다');return false;}
  if(!quiet)toast('저장했다');
  refreshSaveUI();return true;
}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);saveRecoveryBlocked=false;}catch(_){}refreshSaveUI();}
function loadSave(){
  const s=readSave();if(!s)return false;
  TitleScreen.close();
  if(s.invalid){
    saveRecoveryBlocked=true;
    try{
      let key=SAVE_KEY+'-unreadable-'+Date.now();while(localStorage.getItem(key)!==null)key+='-copy';
      localStorage.setItem(key,s.raw);saveRecoveryBlocked=false;
    }catch(_){}
    G=newGame();resetScreens();toast('저장을 읽지 못했어요. 새로 시작할 수 있어요');return false;
  }
  G=s.G;
  resetScreens();if(G.ended)showEnd();
  toast('이어서 한다 · '+REGIONS[G.region].name);return true;
}
function saveLabel(s){
  if(s.invalid)return '저장을 읽지 못했어요. 새로 시작할 수 있어요';
  const d=new Date(s.at),now=new Date();
  const t=d.toLocaleTimeString('ko-KR',{hour:'numeric',minute:'2-digit'});
  const day=d.toDateString()===now.toDateString()?'오늘':(d.getMonth()+1)+'월 '+d.getDate()+'일';
  return REGIONS[s.G.region].name+' · '+day+' '+t;
}
/* 저장 여부에 따라 시작 화면과 책의 버튼 글을 맞춘다 */
function refreshSaveUI(){
  const s=readSave();
  $('btnContinue').hidden=!s;$('saveMeta').hidden=!s;
  if(s)$('saveMeta').textContent='저장된 진행: '+saveLabel(s);
  const other=s&&s.G.runId!==G.runId;   // 화면의 게임이 저장된 게임과 다르면 새로 시작하는 셈
  $('btnStart').className=other?'btn':'btn primary';
  $('saveInfo').textContent=s?'마지막 저장: '+saveLabel(s):'아직 저장하지 않았다';
  disarm($('btnStart'));disarm($('btnNewGame'));disarm($('btnRestart'));
}
/* 저장을 지우는 버튼은 두 번 눌러야 한다. 처음 누르면 글이 바뀌고, 한 번 더 누르면 실행 */
function arm(btn,text){btn.dataset.prev=btn.textContent;btn.dataset.armed='1';btn.textContent=text;}
function disarm(btn){if(btn.dataset.armed){btn.textContent=btn.dataset.prev;btn.dataset.armed='';}}
$('btnContinue').onclick=()=>loadSave();
$('btnSave').onclick=()=>writeSave(false);
$('btnSaveHud').onclick=()=>{if(G.started)writeSave(false);};
/* 처음부터 하기 (책 아래, 끝 화면): 저장이 있으면 한 번 더 눌러야 지우고 단풍골 처음으로 */
function confirmNewGame(b){
  if(readSave()&&!b.dataset.armed){arm(b,'정말요? 한 번 더 누르면 저장이 지워진다');return;}
  disarm(b);clearSave();G=newGame();resetScreens();
  try{const u=new URL(location.href);u.searchParams.delete('region');history.replaceState(null,'',u);}catch(_){}
  toast('처음부터 시작한다');
  TitleScreen.open();
}
$('btnNewGame').onclick=()=>confirmNewGame($('btnNewGame'));
$('btnRestart').onclick=()=>confirmNewGame($('btnRestart'));
/* 시작 화면의 출발 버튼: 저장된 게임과 다른 게임을 새로 시작하면 저장이 덮어쓰이니 한 번 더 묻는다.
   같은 게임에서 다음 지역으로 넘어온 경우는 묻지 않는다 */
function startOrConfirm(){
  const b=$('btnStart'),s=readSave();
  if(s&&s.G.runId!==G.runId){
    if(!b.dataset.armed){arm(b,'정말요? 새로 시작하면 저장이 지워진다');return;}
    clearSave();
  }
  disarm(b);startGame();
}
/* 자동 저장 */
setInterval(()=>{if(G&&G.started&&!G.ended&&!busyForSave())writeSave(true);},TABLES.TUNING.save_interval);
