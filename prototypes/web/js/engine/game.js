'use strict';
/* 시작 화면, 끝 화면, 게임 루프, 부팅. 화면 글은 지역의 cover 에서 읽는다 */
// 음악은 진행 상태를 읽기만 한다. 타이머·보상·저장용 G.f에는 관여하지 않는다.
const GameMusic=(()=>{
  // 결정 D-121: 배경 음악은 ACE-Step이 새로 지은 곡을 기본으로 튼다. 예전 cover 녹음(D-105~107)은 대체됐다.
  // 만든 조건(모델·캡션·시드·고른 기준)은 design/data/music/README.md 의 "새 곡" 절.
  // 결정 D-121: 합성 원곡을 따라 만든 녹음(cover, D-105~107)은 쓰지 않는다. 모든 곡을 ACE-Step이 새로 지은 '새 곡'으로 바꿨다.
  const RECORDINGS={};
  // 결정 D-121: 새 곡의 파일·판·반복 구간(초) 표. tools/audio/ace/finish-v5.sh가 js/data/new-music.js로 만든다.
  const NEW_RECORDINGS=window.PACKOON_NEW_LOOPS||{};
  const RECORDED_KEY='packoon-music-recorded';
  const player=PackoonMusic.createPlayer({...PackoonAudioData,sampleRate:22050,recordings:RECORDINGS,newRecordings:NEW_RECORDINGS});
  // 저장 값: off(합성) / new(새 곡). 기본은 새 곡이다. 파일을 못 읽는 곳(file://·OGG 못 읽는 브라우저)에서는 곡마다 합성으로 돌아간다.
  player.setRecorded('new');
  try{const v=localStorage.getItem(RECORDED_KEY);if(v==='off'||v==='0')player.setRecorded('off');}catch(_){}
  $('musicRecorded').value=player.recordedMode;
  PackoonMusic.attachSound(Sound,player);
  const ids=new Set(PackoonAudioData.score.tracks.map(t=>t.id));
  const bosses={kudzu:'boss_kudzu',golem:'boss_golem',dokkaebi:'boss_dokkaebi',gangcheol:'boss_steel',musoe:'trial_iron'};
  const scenery={galchamgol:'scenery_danpunggol',dolneomeo:'scenery_dolneomeo',jangteo:'scenery_market',yeongsan:'scenery_yeongsan'};
  let owner=null,region=null,scene=null,requested=undefined,pending=false,duck=1,requestCount=0,travelTo=null,arrival=false;
  /* 결정 D-37: 주인공의 마음 상태에 따라 음악이 바뀐다 (design/data/decisions.csv).
     곡마다 성부를 층으로 묶고(base·longing·pulse), 템포는 같은 악보를 빠르기만 바꾼 단계로 갈아탄다.
     마음 상태는 두 값: 긴장(tension)과 그리움(longing). 0~1, 매 프레임 목표값으로 천천히 다가간다. */
  // 결정 D-87: 층 나눔과 템포 단계는 design/data/music_layers.csv가 원본이다. 네 지역 곡과 보스 넷·무쇠 시험에 쓴다.
  // 결정 D-47: 아쟁(low_string)·가야금 뜯기(arp)는 바탕, 모듬북(moduk_*)은 북 층에 둔다. 빠진 성부는 빌드 검사가 막는다.
  const ADAPTIVE=TABLES.MUSIC_LAYERS||{};
  const mood={tension:0,longing:0};
  let applied=null,tempoAt=-1e9,tempoNow=1,adaptKind=null;
  /* 결정 D-46: 경치는 지역 곡과 겹치지 않는다. 경치가 열리면 지역 곡을 0.4초에 내리고,
     경치 효과음이 끝날 만큼 쉰 뒤 경치 곡을 들인다. 돌아올 때도 경치 곡을 내리고 잠깐 쉰 뒤 지역 곡을 반복 처음부터 들인다. */
  const SCENERY_GAP_IN=800,SCENERY_GAP_OUT=350,SCENERY_FADE=.4;
  let gapFor=null,gapUntil=0,gapKind=null;
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
    // 도착 대화·패널·경치는 길 위 간주를 지우지 않는다. 전투와 장단은 먼저 들려주고 끝난 뒤 한 번 잇는다.
    const sceneFirst=['battle','rhythm','ending'].includes(target.kind);
    if(travelling&&!sceneFirst)return;
    if(travelTo&&!sceneFirst){
      if(!Sound.enabled||!Sound.context||Sound.context.state!=='running'||document.hidden||!player.getState().unlocked)return;
      const destination=travelTo;travelTo=null;requested=destination;pending=false;const ticket=++requestCount;
      history.push({id:destination,kind:'travel',region:G.region,zone:G.zone,audioTime:Sound.context.currentTime});
      player.travel(destination).then(ok=>{if(!ok&&ticket===requestCount){travelTo=destination;requested=undefined;pending=true;}}).catch(error=>{console.error('간주 재생 실패:',error);});
      return;
    }
    if(sceneFirst){
      if(target.kind==='ending')travelTo=null;
      else if(travelling)travelTo=travelling.to;
      if(travelling)requested=undefined;
    }
    // 지역 곡이 자리 잡으면 이 지역 경치 곡을 미리 합성해 둔다(첫 경치에서 소리가 비지 않게).
    if(target.kind==='region'&&scenery[G.region]&&player.getState().playing&&!player.getState().loading)player.preload(scenery[G.region]);
    if(gapFor&&gapFor!==target.id)gapFor=null;
    const lastKind=history.length?history[history.length-1].kind:null;
    if(lastKind&&target.id&&target.id!==requested&&(target.kind==='scenery')!==(lastKind==='scenery')&&['scenery','region'].includes(target.kind)&&['scenery','region'].includes(lastKind)){
      if(gapFor!==target.id){
        gapFor=target.id;gapKind=target.kind;gapUntil=performance.now()+(target.kind==='scenery'?SCENERY_GAP_IN:SCENERY_GAP_OUT);
        requestCount++;player.stop(SCENERY_FADE);requested=null;pending=false;
        history.push({id:null,kind:'gap',to:target.id,region:G.region,zone:G.zone,audioTime:Sound.context?.currentTime??0});
        return;
      }
    }
    if(gapFor===target.id&&performance.now()<gapUntil)return;
    const afterGap=gapFor===target.id;
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
    if(afterGap){settings.crossfade=.6;gapFor=null;}
    const spec=ADAPTIVE[target.id];
    if(spec&&['region','battle'].includes(target.kind)){
      adaptKind=target.kind;tempoNow=tempoStep(spec,target.kind);tempoAt=performance.now();applied=levelsFor(target.kind);
      Object.assign(settings,{layers:spec.layers,tempo:tempoNow,levels:applied});
    }
    if(afterGap&&target.kind==='region'){
      // 경치에서 돌아오면 지역 곡을 반복 처음(박 처음)부터 다시 들인다. 템포 단계가 있으면 그 빠르기로 센다.
      const t=PackoonAudioData.score.tracks.find(t=>t.id===target.id);
      if(t?.loop)settings.fromSeconds=t.loop.start*t.meter[0]*4/t.meter[1]*60/(t.tempo*(settings.tempo||1));
    }else if(target.kind==='region'){
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
  function targets(kind){
    let tension=0,longing=0;
    if(kind==='battle'&&B&&!B.result){
      // 전투: 기본 긴장, 핵심이 드러나면 더, 체력이 낮으면 더. 진정 게이지가 차는 만큼 가라앉는다.
      tension=.5;if(typeof coreHidden==='function'&&!coreHidden())tension=.75;
      if(G.hp<=Math.ceil(G.maxhp/3))tension+=.2;
      tension*=1-(B.calm/100)*.85;
    }else tension=REG.moodTension?.()||0;
    // 그리움: 엄마·아빠가 나오는 대화, 경치를 바라볼 때
    if(open('dlg')){const who=$('dlgWho').textContent,text=$('dlgText').textContent;if(who==='아빠'||who==='엄마'||/엄마|아빠/.test(text))longing=.9;}
    if(vistaMode)longing=Math.max(longing,.5);
    return {tension:clamp(tension,0,1),longing:clamp(longing,0,1)};
  }
  function levelsFor(kind){
    const t=mood.tension,l=mood.longing,calm=kind==='battle'&&B?B.calm/100:0;
    // 결정 D-121: mix는 새 곡 두 판(지역 calm→tense, 보스 base→climax)을 섞는 값이다. 보스는 핵심이 드러나거나 체력이 낮을 때(긴장 .75 이상) 절정판으로 넘어간다.
    const ease=(a,b)=>{const x=clamp((t-a)/(b-a),0,1);return x*x*(3-2*x);};
    if(kind==='battle')return {base:1,longing:clamp(.8-.4*t+.6*calm,0,1.6),pulse:clamp(.4+1.2*t,0,1.7),mix:ease(.6,.82)};
    return {base:1-.2*l,longing:clamp(.55+l-.3*t,0,1.6),pulse:clamp(.75+.9*t-.6*l,0,1.7),mix:ease(.25,.7)};
  }
  function tempoStep(spec,kind){
    const t=mood.tension,s=spec.tempos;
    if(kind==='battle')return s[Math.min(s.length-1,t<.3?0:t<.6?1:t<.85?2:3)];
    return (t>.55||(tempoNow>1&&t>.35))&&s[1]?s[1]:s[0];   // 올라갈 때와 내려올 때 문턱을 달리해 들쭉날쭉하지 않게
  }
  function adapt(){
    if(!G||!REG)return;
    const target=selection(),k=target.kind==='battle'||target.kind==='region'?target.kind:'other';
    const goal=targets(k);
    for(const key of ['tension','longing'])mood[key]+=(goal[key]-mood[key])*.03;
    const now=player.getState(),spec=ADAPTIVE[now.id];
    if(!spec||!now.playing||now.loading||now.id!==target.id||!['region','battle'].includes(target.kind))return;
    if(!now.layered&&!now.recorded){   // 길 위 간주처럼 층 없이 들어온 곡은 박을 이어 층 재생으로 바꾼다(새 곡은 판 섞기만)
      adaptKind=target.kind;tempoNow=tempoStep(spec,target.kind);tempoAt=performance.now();applied=levelsFor(target.kind);
      player.play(now.id,{layers:spec.layers,tempo:tempoNow,levels:applied,keepBeat:true,crossfade:.3});return;
    }
    const lv=levelsFor(target.kind);
    if(!applied||Object.keys(lv).some(n=>Math.abs(lv[n]-applied[n])>.04)){applied=lv;player.setLayers(lv,.6);}
    const step=tempoStep(spec,target.kind);
    if(step!==tempoNow&&performance.now()-tempoAt>3000){
      tempoNow=step;tempoAt=performance.now();
      player.play(now.id,{layers:spec.layers,tempo:step,levels:lv,keepBeat:true,crossfade:.3});
    }
  }
  function setScene(id){update();scene=id||null;update();}
  function reset(){scene=null;dlgMusic=null;requested=undefined;pending=false;travelTo=null;requestCount++;if(owner!==G||region===G.region)player.stop(.08);}
  function getState(){return {...player.getState(),desired:selection(),duck,mood:{...mood},levels:applied,history:history.slice(),diagnostics:player.getDiagnostics()};}
  // Sound의 trusted 입력 처리와 resume Promise가 끝난 뒤 아직 잠긴 곡을 다시 요청한다.
  addEventListener('pointerdown',()=>setTimeout(update,0),true);
  addEventListener('keydown',()=>setTimeout(update,0),true);
  addEventListener('packoon-sound-change',()=>setTimeout(update,0));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(update,0);});
  // 녹음 음원 켜고 끄기: 지금 곡을 처음부터 새로 틀게 한다(같은 곡이어도 합성↔녹음을 바꾼다).
  function setRecorded(mode){
    player.setRecorded(mode);try{localStorage.setItem(RECORDED_KEY,player.recordedMode);}catch(_){}
    requested=undefined;pending=false;update();
  }
  return {update,adapt,setScene,reset,getState,setRecorded,get recorded(){return player.recordedOn;},get recordedMode(){return player.recordedMode;},recordings:RECORDINGS,newRecordings:NEW_RECORDINGS,player};
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
  if(!CLASSIC&&G.region==='dolneomeo'&&!G.f.mapUnlocked){
    G.f.mapUnlocked=true;
    toast('돌담 위에 까치 떼가 앉아 있다. 지도(M)를 펴면 가 본 곳으로 데려다줄 것 같다');
  }
  lastGoal='';refreshHud();
}
/* 지역을 끝낼 때 지역 코드가 부른다. REG.next 가 있으면 다음 지역 버튼이 나온다 */
function endGame(){
  if(regionCompleted(G.region)){
    if(!CLASSIC&&typeof openMap==='function')openMap();
    return;
  }
  if(!REG.next)noteRestore();
  G.ended=true;
  rememberRegion(G);
  showEnd();refreshGoal();writeSave(true);
}
function showEnd(){
  $('endStats').innerHTML=REG.endStats().map(([k,v])=>'<span>'+k+' <b>'+v+'</b></span>').join('');
  const nx=REGIONS[REG.next],b=$('btnNext');
  b.hidden=!nx;if(nx)b.textContent=REGIONS[REG.next].cover.go||nx.name+'로';
  // 결정 D-73: '처음부터'는 맨 끝에 수수하게 둔다. 마지막 지역 끝 화면에서 가장 눈에 띄는 버튼이 되돌리기면 안 된다.
  $('btnRestart').className='btn';$('endButtons').hidden=false;
  document.body.classList.toggle('ending-scene',!nx);
  /* 지역이 끝 화면에 더 넣을 것 (예: 마지막 지역의 이름 짓기) */
  const ex=$('endExtra');ex.innerHTML='';if(REG.endExtra)REG.endExtra(ex);
  $('endScreen').hidden=false;
}
/* 화면과 상태를 지금 G 에 맞춘다 */
function resetScreens(){
  GameMusic.reset();
  resetFieldModes();REG=REGIONS[G.region];prepareZones(G,REG);fillCover();closePanels();
  $('endScreen').hidden=true;$('titleScreen').hidden=G.started;document.body.classList.remove('ending-scene');
  lastGoal='';lastTool='';lastNear=null;refreshHud();refreshSaveUI();
}
$('btnStart').onclick=startOrConfirm;   // 처음부터(btnRestart)는 save.js
/* 다음 지역으로: 보따리·연장·수첩·호감은 그대로 가지고 간다 */
$('btnNext').onclick=()=>{if(!REGIONS[REG.next])return;enterRegion(G,REGIONS[REG.next]);resetScreens();writeSave(true);};
$('btnBookEnd').onclick=()=>{Sound.panel(true);noteTab='animal';renderNotebook();$('notebook').hidden=false;$('noteBody').scrollTop=0;$('endScreen').hidden=true;
  $('noteClose').addEventListener('click',()=>{if(G.ended)$('endScreen').hidden=false;},{once:true});};

let last=0,acc=0;
function loop(t){
  if(!last)last=t;acc+=Math.min(100,t-last);last=t;
  while(acc>=1000/60){step();bStep();acc-=1000/60;}
  // 대화·선택지·전투·손일의 콜백이 바꾼 진행을 다음 화면에 함께 반영한다.
  // 전투 중에는 모바일 목표 칸의 전투 안내를 유지한다.
  if(!B&&!inkOn)refreshGoal();
  GameMusic.update();GameMusic.adapt();
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
