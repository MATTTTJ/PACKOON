'use strict';
/* 첫 화면: 타이틀 장면(title-scene.js) + 메뉴. 메뉴는 기존 게임 흐름에 잇는다.
   - 이어서 하기: 저장이 있을 때만 (save.js 의 loadSave)
   - 새로 시작: 첫 화면을 닫고 지금 지역의 프롤로그 화면으로 (거기서 기존 시작 함수 startOrConfirm)
   - 움직임 켜기/끄기: 장면은 항상 정지로 시작한다. 직접 눌러야만 움직인다.
     기기의 '동작 줄이기'가 켜져 있으면 알려 주고, 움직이는 중에 켜지면 바로 멈춘다
   첫 화면을 닫으면 장면의 프레임 루프·ResizeObserver·이벤트를 모두 정리한다 */
const TitleScreen=(()=>{
  const el=$('titleScene'),view=$('titleView'),canvas=$('titleCanvas');
  const mq=matchMedia('(prefers-reduced-motion: reduce)');
  let scene=null;
  function render(){
    const s=readSave();
    $('tsContinue').hidden=!s;$('tsSaveMeta').hidden=!s;if(s)$('tsSaveMeta').textContent='저장된 진행: '+saveLabel(s);
    $('tsNew').className=s?'ts-btn':'ts-btn primary';
    const on=!!scene&&scene.isPlaying();
    $('tsMotion').textContent=on?'움직임 끄기':'움직임 켜기';$('tsMotion').setAttribute('aria-pressed',String(on));
    $('tsMotionNote').hidden=!mq.matches;
  }
  function onReduce(){if(mq.matches&&scene&&scene.isPlaying())scene.setPlaying(false);render();}
  function open(){
    if(scene)return;
    el.hidden=false;
    scene=createTitleScene(view,canvas,$('titleLoading'));
    mq.addEventListener('change',onReduce);
    render();
    setTimeout(()=>{const b=$('tsContinue').hidden?$('tsNew'):$('tsContinue');if(b&&matchMedia('(pointer:fine)').matches)b.focus({preventScroll:true});},0);
  }
  function close(){
    if(!scene)return;
    scene.destroy();scene=null;
    mq.removeEventListener('change',onReduce);
    el.hidden=true;
  }
  $('tsContinue').onclick=()=>{close();loadSave();};
  $('tsNew').onclick=()=>{close();};   // 프롤로그 화면(titleScreen)이 그대로 남아 있다
  $('tsMotion').onclick=()=>{if(!scene)return;scene.setPlaying(!scene.isPlaying());render();};
  return {open,close,isOpen:()=>!!scene,render,_scene:()=>scene};
})();
