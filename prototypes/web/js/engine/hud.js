'use strict';
/* HUD: 체력, 손에 든 연장, 지금 할 일 (REG.goal() 이 중요한 일, 사연 심부름(SIDE_QUESTS)이 잔일을 준다. 둘 다 목표로 보인다, D-890) */
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
/* 결정 D-890: 할 일은 행동이 아니라 목표로 보인다 (사용자 피드백 2026-11-06 "맷돌에 쌀 갈기가 아니라 떡 재료 구하기처럼").
   REG.goal() 은 goalLine(목표, 길잡이)로 '목표|길잡이' 한 줄을 돌려준다. 화면의 할 일 칸에는 목표만,
   수첩 '해야 할 일'에는 목표 밑에 지금 단계의 길잡이(누구에게·무엇을·어디서)를 적는다 (book.js).
   잔일은 이름(title)이 목표, text(F)가 길잡이다. 길잡이는 아이가 수첩에 적은 말이라, 아이가 들었거나 본 것만 쓴다. */
function goalLine(goal,guide){return guide?goal+'|'+guide:goal;}
function splitGoal(line){const s=line||'',i=s.indexOf('|');return i<0?{goal:s,guide:''}:{goal:s.slice(0,i),guide:s.slice(i+1)};}
function mainGoalParts(){
  if(regionCompleted(REG.id))return {goal:REG.cover.end.kicker,guide:''};
  const p=splitGoal(REG.goal()),step=p.guide||p.goal,floor=floorPickupGoal(step);
  if(floor===step)return p;
  // 바닥에 놓인 진행 물건(떨어뜨린 것·떨어진 열매)은 길잡이 앞에 먼저 알린다. 할 일 칸은 목표 그대로 둔다 (D-890이 '바닥의 ○○ 줍기' 칸 바꾸기를 대신함).
  const name=floor.replace(/^바닥의 | 줍기$/g,'');
  if(new RegExp(name+'[^.]{0,12}(줍|주워)').test(p.guide))return p;   // 길잡이가 이미 그 물건을 주우라고 한다
  return {goal:p.goal,guide:'바닥에 떨어진 '+name+'부터 주워 담자. '+p.guide,floor:true};
}
function mainGoalText(){return mainGoalParts().goal;}
const HUD_SIDE_MAX=2;
let lastGoal='';
function refreshGoal(){
  const g=mainGoalText(),subs=g&&!G.ended?activeSideQuests().map(q=>q.title):[];
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
  // 결정 D-1461: 품은 기운은 하트 오른쪽에 이름과 세기로 보인다. 자세한 것은 마우스를 올리거나 보따리에서 본다
  const buff=$('foodBuff');if(buff){buff.hidden=!validBuff(G.buff);buff.textContent=foodBuffName(G.buff);buff.title=foodBuffText(G.buff);}
  // 결정 D-1405 (사용자 피드백 2026-11-09): 하트 아래 도구 칸(결정 D-602)을 뺐다. 필드에는 도구를 바꾸는 단추·키가 없어(낫을 받으면 곡괭이 자리를 낫이 대신한다)
  //   무기 고르는 칸처럼 보여 헷갈렸다. 든 연장은 주인공 손에 보이고, 이름과 날 세움은 보따리 '손에 든 연장' 줄에 있다. 도구 바꾸기는 보스 전투(Q·도구 단추)에서만 한다.
  if(G){refreshGoal();refreshFormUi();}
  if(typeof B!=='undefined'&&B)renderBHud();
}

/* 소리 설정은 게임 저장과 별도로 모든 지역에 적용한다. */
function refreshSoundButtons(){
  $('btnSound').innerHTML=(Sound.enabled?'소리 켜짐':'소리 꺼짐')+' <kbd>V</kbd>';
  $('btnSound').setAttribute('aria-pressed',String(Sound.enabled));
  $('btnSound').title='전체 소리 켜기/끄기 (V)';
  // 결정 D-1407: 음량 슬라이더는 배경음·효과음 중 큰 쪽을 보여 준다 (따로 맞춘 값은 수첩의 소리 설정에서)
  $('volumeAll').value=Math.max(Sound.bgmVolume,Sound.sfxVolume);
  $('volumeBgm').value=Sound.bgmVolume;
  if(typeof GameMusic!=='undefined')$('musicRecorded').value=GameMusic.recordedMode;
  $('volumeSfx').value=Sound.sfxVolume;
}
$('btnSound').onclick=()=>Sound.toggle();
$('volumeAll').oninput=e=>Sound.setVolume(Number(e.target.value));
$('volumeAll').addEventListener('pointerup',e=>e.target.blur());   // 끌고 난 뒤 방향키가 슬라이더가 아니라 주인공을 움직이게
$('volumeBgm').oninput=e=>Sound.setBgmVolume(Number(e.target.value));
// 결정 D-121: 배경 음악(새 곡·합성) 고르기 (GameMusic은 game.js에서 늦게 만들어지므로 누를 때 찾는다)
// 결정 D-121: 새 곡(기본) / 합성 둘 중 하나
$('musicRecorded').onchange=e=>{if(typeof GameMusic!=='undefined')GameMusic.setRecorded(e.target.value);};
$('volumeSfx').oninput=e=>Sound.setSfxVolume(Number(e.target.value));
addEventListener('packoon-sound-change',refreshSoundButtons);
refreshSoundButtons();
