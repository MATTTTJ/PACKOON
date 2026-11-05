'use strict';
/* HUD: 체력, 손에 든 연장, 지금 할 일 (REG.goal() 이 중요한 일, 사연 심부름(SIDE_QUESTS)이 잔일을 준다) */
/* 결정 D-149: 할 일은 '중요'(이 지역 본 줄거리)와 '잔일'(인물 사연에서 맡은 심부름)으로 나눠 함께 보인다.
   결정 D-200: 아래 칸 이름은 '보통' 대신 소일거리라는 뜻의 '잔일' (사용자 피드백 36).
   문구는 짧은 명사형(~하기)으로 핵심만 쓰고 장소는 붙이지 않는다(사용자 피드백 2026-11-01). 수첩 '해야 할 일' 탭(D-150)도 같은 목록을 쓴다.
   잔일 하나: {id, region, title(끝낸 뒤 이름), start(F), done(F), text(F)}. 시작 표시가 서고 끝 표시가 없는 동안만 진행 중이다. */
const SIDE_QUESTS=[];
function defineSideQuests(region,list){list.forEach(q=>SIDE_QUESTS.push(Object.assign({region},q)));}
const sideOn=q=>!!(G&&G.started&&q.start(G.f)&&!q.done(G.f));
const sideDone=q=>!!(G&&q.start(G.f)&&q.done(G.f));
/* 진행 중인 잔일. 지금 지역 것을 앞에 둔다 */
function activeSideQuests(){
  const list=SIDE_QUESTS.filter(sideOn);
  return [...list.filter(q=>q.region===G.region),...list.filter(q=>q.region!==G.region)];
}
function mainGoalText(){return regionCompleted(REG.id)?REG.cover.end.kicker:floorPickupGoal(REG.goal());}
const HUD_SIDE_MAX=2;
let lastGoal='';
function refreshGoal(){
  const g=mainGoalText(),subs=g&&!G.ended?activeSideQuests().map(q=>q.text(G.f)):[];
  const key=g+'|'+subs.join('|');if(key===lastGoal)return;lastGoal=key;
  const e=$('goal');e.hidden=!g;e.innerHTML='';
  const row=(cls,label,text)=>{const r=el('div','goal-row '+cls);r.appendChild(el('b',null,label));r.appendChild(document.createTextNode(text));e.appendChild(r);};
  if(g)row('main','중요',g);
  subs.slice(0,HUD_SIDE_MAX).forEach(t=>row('sub','잔일',t));
  if(subs.length>HUD_SIDE_MAX)e.appendChild(el('div','goal-more','잔일 '+(subs.length-HUD_SIDE_MAX)+'개 더 · 수첩 해야 할 일'));
  const m=$('goalM');m.querySelector('b').textContent=g?'중요':'지금 할 일';m.querySelector('span').textContent=g||REG.cover.ready;
  let ms=$('goalMSub');if(!ms){ms=el('small','goal-m-sub');ms.id='goalMSub';m.appendChild(ms);}
  ms.hidden=!subs.length;ms.textContent=subs.length?'잔일 · '+subs[0]+(subs.length>1?' 외 '+(subs.length-1):''):'';
}
let lastTool='';
/* 결정 D-85: 키 안내의 잎사귀 변신은 가진 변신만 보인다. 변신을 하나도 못 배웠으면 줄을 숨긴다. */
function refreshKeyForms(){
  const span=$('keyForms');if(!span)return;
  const ids=G&&Array.isArray(G.forms)?FORM_IDS.filter(id=>G.forms.includes(id)):[];
  const key=ids.join(',');if(span.dataset.key===key)return;span.dataset.key=key;
  span.hidden=!ids.length;if(!ids.length){span.textContent='';return;}
  const all=['',...ids],num=id=>id?FORM_IDS.indexOf(id)+1:0;
  span.innerHTML='';
  all.forEach((id,i)=>{if(i)span.append('·');const k=el('kbd',null,String(num(id)));span.append(k);});
  span.append(' 잎사귀 변신 ('+all.map(id=>num(id)+' '+formName(id)).join(' · ')+', 필드·전투)');
}
function refreshHud(){
  refreshKeyForms();
  $('btnMap').hidden=CLASSIC;$('padMap').hidden=CLASSIC;$('btnMapEnd').hidden=CLASSIC;
  $('mapKeyHint').hidden=CLASSIC;$('mapCoverKeys').hidden=CLASSIC;
  $('hearts').innerHTML=Array.from({length:G.maxhp},(_,i)=>'<span class="'+(i<G.hp?'':'off')+'">♥</span>').join('');
  const t=heldTool();   // 결정 D-602: 도구·모습 칸은 하트 아래 둘째 줄에 놓인다 (style.css .status)
  if(t+G.sharp!==lastTool){lastTool=t+G.sharp;const e=$('toolLabel');e.innerHTML='';e.appendChild(icon(t));e.appendChild(document.createTextNode(TOOLS[t].n+(G.sharp?' +':'')));}
  if(G){refreshGoal();refreshFormUi();}
  if(typeof B!=='undefined'&&B)renderBHud();
}

/* 소리 설정은 게임 저장과 별도로 모든 지역에 적용한다. */
function refreshSoundButtons(){
  $('btnSound').innerHTML=(Sound.enabled?'소리 켜짐':'소리 꺼짐')+' <kbd>V</kbd>';
  $('btnSound').setAttribute('aria-pressed',String(Sound.enabled));
  $('btnSound').title='전체 소리 켜기/끄기 (V)';
  $('btnVolume').textContent='음량 '+(Sound.volume==='high'?'크게':'작게');
  $('btnVolume').setAttribute('aria-pressed',String(Sound.volume==='high'));
  $('btnVolume').title='음량 크게/작게';
  $('volumeBgm').value=Sound.bgmVolume;
  if(typeof GameMusic!=='undefined')$('musicRecorded').value=GameMusic.recordedMode;
  $('volumeSfx').value=Sound.sfxVolume;
}
$('btnSound').onclick=()=>Sound.toggle();
$('btnVolume').onclick=()=>Sound.toggleVolume();
$('volumeBgm').oninput=e=>Sound.setBgmVolume(Number(e.target.value));
// 결정 D-121: 배경 음악(새 곡·합성) 고르기 (GameMusic은 game.js에서 늦게 만들어지므로 누를 때 찾는다)
// 결정 D-121: 새 곡(기본) / 합성 둘 중 하나
$('musicRecorded').onchange=e=>{if(typeof GameMusic!=='undefined')GameMusic.setRecorded(e.target.value);};
$('volumeSfx').oninput=e=>Sound.setSfxVolume(Number(e.target.value));
addEventListener('packoon-sound-change',refreshSoundButtons);
refreshSoundButtons();
