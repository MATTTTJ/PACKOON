'use strict';
/* 시작 화면, 끝 화면, 게임 루프, 부팅. 화면 글은 지역의 cover 에서 읽는다 */
// 음악은 진행 상태를 읽기만 한다. 타이머·보상·저장용 G.f에는 관여하지 않는다.
const GameMusic=(()=>{
  const player=PackoonMusic.createPlayer({...PackoonAudioData,sampleRate:22050});
  PackoonMusic.attachSound(Sound,player);
  const ids=new Set(PackoonAudioData.score.tracks.map(t=>t.id));
  const bosses={kudzu:'boss_kudzu',golem:'boss_golem',dokkaebi:'boss_dokkaebi',gangcheol:'boss_steel',musoe:'trial_iron'};
  const scenery={galchamgol:'scenery_danpunggol',dolneomeo:'scenery_dolneomeo',jangteo:'scenery_market',yeongsan:'scenery_yeongsan'};
  let owner=null,region=null,scene=null,requested=undefined,pending=false,duck=1,requestCount=0,travelTo=null,arrival=false;
  const history=[],warnings=new Set();
  function valid(value,fallback){
    const id=typeof value==='function'?value(G,zoneDef()):value;
    if(!id)return fallback;
    if(ids.has(id))return id;
    if(!warnings.has(id)){warnings.add(id);console.warn('없는 음악 id:',id);}
    return fallback;
  }
  function regionTrack(){
    const fallback={galchamgol:'danpunggol',dolneomeo:'dolneomeo',jangteo:G.f.night?'market_night':'market_day',yeongsan:G.f.spring?'yeongsan_spring':'yeongsan'}[G.region]||'theme';
    return valid(zoneDef()?.music,valid(REG.music,fallback));
  }
  function selection(){
    if(G.ended&&!REG.next)return {id:'ending',kind:'ending'};
    if(B&&!B.result)return {id:valid(B.E.music,bosses[B.kind]||regionTrack()),kind:'battle'};
    // 장단의 예약 반주만 들린다. 이야기 훅이 있어도 장단 위에 BGM을 겹치지 않는다.
    const mg=openMinigame();
    if(mg?.id==='rhythm')return {id:null,kind:'rhythm'};
    const story=scene||(open('dlg')?dlgMusic:null);
    if(story)return {id:valid(story,regionTrack()),kind:'story'};
    if(vistaMode)return {id:valid(vistaMode.p.music,scenery[G.region]||'scenery_danpunggol'),kind:'scenery'};
    if(mg)return {id:valid(mg.music,'minigame'),kind:'minigame'};
    if(brewing||craftHands)return {id:'crafting',kind:'crafting'};
    if(!G.started)return {id:TitleScreen.isOpen()?'title':arrival?regionTrack():'theme',kind:'title'};
    return {id:regionTrack(),kind:'region'};
  }
  function update(){
    if(!G||!REG)return;
    if(owner!==G||region!==G.region){
      const moved=owner===G&&region&&region!==G.region;
      owner=G;region=G.region;scene=null;requested=undefined;pending=false;requestCount++;
      travelTo=moved?regionTrack():null;arrival=!!moved;
      if(!moved)player.stop(.08);
    }
    const target=selection();
    // 대화·손맛·환경음을 살리되 BGM과 효과음의 사용자 음량은 각각 유지한다.
    const factor=open('dlg')||vistaMode||brewing||!!craftHands?0.72:1;
    if(factor!==duck){duck=factor;player.setDucking(duck,.18);}
    const travelling=player.getState().travel;
    // 다음 지역의 시작 화면은 길 위 간주를 끊지 않는다. 대화·전투는 기존 장면곡을 우선한다.
    if(travelling&&['region','title'].includes(target.kind))return;
    if(travelTo&&['region','title'].includes(target.kind)){
      if(!Sound.enabled||!Sound.context||Sound.context.state!=='running'||document.hidden||!player.getState().unlocked)return;
      const destination=travelTo;travelTo=null;requested=destination;pending=false;const ticket=++requestCount;
      history.push({id:destination,kind:'travel',region:G.region,zone:G.zone,audioTime:Sound.context.currentTime});
      player.travel(destination).then(ok=>{if(!ok&&ticket===requestCount)pending=true;}).catch(error=>{console.error('간주 재생 실패:',error);});
      return;
    }
    if(travelling||travelTo){travelTo=null;requested=undefined;}
    if(target.id===requested&&!pending)return;
    if(!target.id){requestCount++;player.stop(.12);requested=null;pending=false;return;}
    if(!Sound.enabled||!Sound.context||Sound.context.state!=='running'||document.hidden||!player.getState().unlocked){
      // 음소거 중 장면이 바뀌면 옛 곡의 자동 재개도 취소한다.
      if(requested!==target.id){requestCount++;player.stop(.025);requested=target.id;}
      pending=true;return;
    }
    requested=target.id;pending=false;const ticket=++requestCount;
    const row={id:target.id,kind:target.kind,region:G.region,zone:G.zone,audioTime:Sound.context.currentTime};
    history.push(row);if(history.length>80)history.shift();
    const settings={crossfade:['battle','scenery'].includes(target.kind)?.35:1.5};
    if(target.kind==='region'){
      const now=player.getState(),tracks=PackoonAudioData.score.tracks;
      const before=tracks.find(t=>t.id===now.id),after=tracks.find(t=>t.id===target.id);
      if(before&&after?.loop&&now.id!==target.id&&history.length>1&&history[history.length-2].kind==='region'){
        const beats=now.currentTime*before.tempo/60;
        const bar=after.meter[0]*4/after.meter[1],loopBeats=(after.loop.end-after.loop.start)*bar;
        settings.fromSeconds=(after.loop.start*bar+beats%loopBeats)*60/after.tempo;
      }
    }
    player.play(target.id,settings).then(ok=>{
      if(!ok&&ticket===requestCount)pending=true;
    }).catch(error=>{console.error('음악 재생 실패:',error);});
  }
  function setScene(id){update();scene=id||null;update();}
  function reset(){scene=null;dlgMusic=null;requested=undefined;pending=false;travelTo=null;requestCount++;if(owner!==G||region===G.region)player.stop(.08);}
  function getState(){return {...player.getState(),desired:selection(),duck,history:history.slice(),diagnostics:player.getDiagnostics()};}
  // Sound의 trusted 입력 처리와 resume Promise가 끝난 뒤 아직 잠긴 곡을 다시 요청한다.
  addEventListener('pointerdown',()=>setTimeout(update,0),true);
  addEventListener('keydown',()=>setTimeout(update,0),true);
  addEventListener('packoon-sound-change',()=>setTimeout(update,0));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(update,0);});
  return {update,setScene,reset,getState,player};
})();
function fillCover(){
  const C=REG.cover;
  $('regionTag').textContent=REG.name;$('regionSub').textContent='엄마의 약을 찾아 네 지역을 잇는 여행';
  cv.setAttribute('aria-label',REG.name+' 게임 화면');
  $('titleKicker').textContent=C.title.kicker;$('titleHead').textContent=C.title.head;
  const tb=$('titleBody');tb.innerHTML='';C.title.body.forEach(t=>tb.appendChild(el('p',null,t)));
  $('btnStart').textContent=C.title.start;$('btnStart').dataset.armed='';
  /* 개발용: 지역마다 버튼. 누르면 그 지역부터 새로 시작하고 주소에도 남겨 새로고침해도 그 지역에서 시작한다 */
  const dp=$('devPick');dp.innerHTML='';
  regionList().forEach(r=>{const b=el('button',null,r.order+' '+r.name);b.type='button';b.setAttribute('aria-pressed',r===REG);
    b.onclick=()=>{G=newGame(r.id);resetScreens();
      try{const u=new URL(location.href);u.searchParams.set('region',r.id);history.replaceState(null,'',u);}catch(_){}};
    dp.appendChild(b);});
  $('endKicker').textContent=C.end.kicker;$('endHead').textContent=C.end.head;
  const eb=$('endBody');eb.innerHTML='';C.end.body.forEach(t=>eb.appendChild(el('p',null,t)));
}
function startGame(){
  G.started=true;$('titleScreen').hidden=true;
  REG.onStart();
  lastGoal='';refreshHud();
}
/* 지역을 끝낼 때 지역 코드가 부른다. REG.next 가 있으면 다음 지역 버튼이 나온다 */
function endGame(){
  if(!REG.next)noteRestore();
  G.ended=true;
  showEnd();refreshGoal();writeSave(true);
}
function showEnd(){
  $('endStats').innerHTML=REG.endStats().map(([k,v])=>'<span>'+k+' <b>'+v+'</b></span>').join('');
  const nx=REGIONS[REG.next],b=$('btnNext');
  b.hidden=!nx;if(nx)b.textContent=REGIONS[REG.next].cover.go||nx.name+'로';
  $('btnRestart').className=nx?'btn':'btn primary';
  /* 지역이 끝 화면에 더 넣을 것 (예: 마지막 지역의 이름 짓기) */
  const ex=$('endExtra');ex.innerHTML='';if(REG.endExtra)REG.endExtra(ex);
  $('endScreen').hidden=false;
}
/* 화면과 상태를 지금 G 에 맞춘다 */
function resetScreens(){
  GameMusic.reset();
  resetFieldModes();REG=REGIONS[G.region];prepareZones(G,REG);fillCover();closePanels();
  $('endScreen').hidden=true;$('titleScreen').hidden=G.started;
  lastGoal='';lastTool='';lastNear=null;refreshHud();refreshSaveUI();
}
$('btnStart').onclick=startOrConfirm;   // 처음부터(btnRestart)는 save.js
/* 다음 지역으로: 보따리·연장·책·호감은 그대로 가지고 간다 */
$('btnNext').onclick=()=>{if(!REGIONS[REG.next])return;enterRegion(G,REGIONS[REG.next]);resetScreens();writeSave(true);};
$('btnBookEnd').onclick=()=>{bookTab='clues';renderBook();$('book').hidden=false;$('endScreen').hidden=true;
  $('bookClose').addEventListener('click',()=>{if(G.ended)$('endScreen').hidden=false;},{once:true});};

let last=0,acc=0;
function loop(t){
  if(!last)last=t;acc+=Math.min(100,t-last);last=t;
  while(acc>=1000/60){step();bStep();acc-=1000/60;}
  GameMusic.update();
  if(B&&!$('battle').hidden)bDraw();else draw();requestAnimationFrame(loop);
}
/* 주소 뒤 ?region=<id> 로 그 지역부터 시작할 수 있다 (앞 지역은 마친 것으로 친다). 없으면 첫 지역 */
function boot(data){
  G=(data&&data.G&&REGIONS[data.G.region])?normalizeTravelRecords(Object.assign(baseState(),data.G)):newGame(new URLSearchParams(location.search).get('region'));
  REG=REGIONS[G.region];
  prepareZones(G,REG);
  fillCover();
  if(G.started)$('titleScreen').hidden=true;
  if(G.ended)showEnd();
  refreshHud();refreshSaveUI();requestAnimationFrame(loop);
  /* 첫 화면: 처음 들어올 때만. 개발용 ?region= 이나 이어 붙인 상태로 열 때는 건너뛴다 */
  if(!(data&&data.G)&&!new URLSearchParams(location.search).get('region')&&!G.started)TitleScreen.open();
}
window.claude?.hot?.snapshot?.(()=>{const g=JSON.parse(JSON.stringify(G));pouch.items.forEach(id=>{g.inv[id]=(g.inv[id]||0)+1;});return {G:g};});
window.claude?.hot?.ready?window.claude.hot.ready(boot):boot(window.claude?.hot?.data??{});
