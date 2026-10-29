'use strict';
/* HUD: 체력, 손에 든 연장, 지금 할 일 (REG.goal() 이 글을 준다) */
let lastGoal='';
function refreshGoal(){
  const g=REG.goal();if(g===lastGoal)return;lastGoal=g;
  const e=$('goal');e.hidden=!g;e.innerHTML='<b>할 일</b>';e.appendChild(document.createTextNode(g));
  $('goalM').querySelector('span').textContent=g||REG.cover.ready;
}
let lastTool='';
function refreshHud(){
  $('hearts').innerHTML=Array.from({length:G.maxhp},(_,i)=>'<span class="'+(i<G.hp?'':'off')+'">♥</span>').join('');
  const t=heldTool();
  if(t+G.sharp!==lastTool){lastTool=t+G.sharp;const e=$('toolLabel');e.innerHTML='';e.appendChild(icon(t));e.appendChild(document.createTextNode(TOOLS[t].n+(G.sharp?' +':'')));}
  if(G)refreshGoal();
  if(typeof B!=='undefined'&&B)renderBHud();
}

/* 소리 설정은 게임 저장과 별도로 모든 지역에 적용한다. */
function refreshSoundButtons(){
  $('btnSound').innerHTML=(Sound.enabled?'소리 켜짐':'소리 꺼짐')+' <kbd>M</kbd>';
  $('btnSound').setAttribute('aria-pressed',String(Sound.enabled));
  $('btnSound').title='전체 소리 켜기/끄기 (M)';
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
