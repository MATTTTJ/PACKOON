'use strict';
/* HUD: 체력, 손에 든 연장, 지금 할 일 (REG.goal() 이 글을 준다) */
let lastGoal='';
function refreshGoal(){
  const g=regionCompleted(REG.id)?REG.cover.end.kicker:floorPickupGoal(REG.goal());if(g===lastGoal)return;lastGoal=g;
  const e=$('goal');e.hidden=!g;e.innerHTML='<b>할 일</b>';e.appendChild(document.createTextNode(g));
  $('goalM').querySelector('span').textContent=g||REG.cover.ready;
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
  const t=heldTool();
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
  $('volumeSfx').value=Sound.sfxVolume;
}
$('btnSound').onclick=()=>Sound.toggle();
$('btnVolume').onclick=()=>Sound.toggleVolume();
$('volumeBgm').oninput=e=>Sound.setBgmVolume(Number(e.target.value));
$('volumeSfx').oninput=e=>Sound.setSfxVolume(Number(e.target.value));
addEventListener('packoon-sound-change',refreshSoundButtons);
refreshSoundButtons();
