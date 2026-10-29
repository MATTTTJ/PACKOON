'use strict';
/* 저장: 이 기기의 브라우저(localStorage)에 게임 상태(G) 하나를 저장한다. 다른 기기·다른 브라우저와는 이어지지 않는다.
   - 저장하기 버튼 (화면 위 버튼 줄, 너구리의 책 아래)
   - 자동 저장: 플레이 중 30초마다, 다음 지역으로 넘어갈 때, 지역을 끝냈을 때
   - 대화·전투·미니게임 중에는 저장하지 않는다 (그 상태는 G 밖에 있어서)
   - 시작 화면: 저장이 있으면 '이어서 하기'
   - 처음부터 하기 / 새로 시작: 저장이 있으면 한 번 더 눌러야 저장을 지운다 */
const SAVE_KEY='packoon-save-v1';
const busyForSave=()=>!!B||inkOn||open('dlg')||!!openMinigame();
function readSave(){
  try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(s&&s.v===1&&s.G&&REGIONS[s.G.region])return s;}catch(_){}
  return null;
}
function writeSave(quiet){
  if(!G||busyForSave()){if(!quiet)toast('대화나 전투가 끝난 뒤에 저장할 수 있다');return false;}
  returnPouch();   // 가공대에 올려 둔 물건은 보따리로 돌려 놓고 저장
  // 저장 주기를 유지하면서 실제로 반환한 재료·소지품·버튼을 화면에도 반영한다.
  if(open('bag')){pouchMsg='';renderBag();}
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({v:1,at:Date.now(),G}));}
  catch(_){if(!quiet)toast('이 브라우저에서는 저장할 수 없다');return false;}
  if(!quiet)toast('저장했다');
  refreshSaveUI();return true;
}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(_){}refreshSaveUI();}
function loadSave(){
  const s=readSave();if(!s)return false;
  TitleScreen.close();
  G=Object.assign(baseState(),s.G);   // 나중에 생긴 칸이 빠진 옛 저장도 기본값으로 채운다
  resetScreens();if(G.ended)showEnd();
  toast('이어서 한다 · '+REGIONS[G.region].name);return true;
}
function saveLabel(s){
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
