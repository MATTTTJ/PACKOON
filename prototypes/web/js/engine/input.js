'use strict';
/* 입력: 키보드와 터치 패드. 미니게임 창(대장간·채집 등)은 MINIGAMES 에 등록하면 입력과 일시정지가 자동으로 붙는다. */

/* {id:창 요소 id, step:매 프레임, hit:누르기} */
const MINIGAMES=[];
function defineMinigame(m){MINIGAMES.push(m);}
const open=id=>!!$(id)&&!$(id).hidden; // 없어진 패널 id(옛 'book')는 닫힌 것으로 본다
const openMinigame=()=>MINIGAMES.find(m=>open(m.id))||null;

const keys={};const touch={left:false,right:false,up:false,down:false,jump:false,roll:false};   // jump: 누르고 있는 동안 (수리부엉이 활공). roll: 휴대폰 구르기 단추 (D-381)
const padDirs=new Set();let dpadPointer=null;   // 결정 D-380: 방향 판에서 지금 켜진 방향과 그 판을 누른 손가락
const suppressedKeys=new Set();
let jumpQ=false,atkQ=false,dropQ=false;
const isDown=()=>keys['arrowdown']||keys['s']||touch.down;
const isLeft=()=>keys['arrowleft']||keys['a']||touch.left;
const isRight=()=>keys['arrowright']||keys['d']||touch.right;
addEventListener('keydown',e=>{
  if(e.target instanceof HTMLElement&&(e.target.matches('input,textarea,select')||e.target.isContentEditable))return;
  const k=e.key.toLowerCase();
  // 탈·닫기 등 실제 버튼을 키보드로 누를 때 뒤의 공격·대화 입력을 함께 실행하지 않는다.
  if(e.target instanceof HTMLButtonElement&&(k==='enter'||k===' '))return;
  if(suppressedKeys.has(k)){e.preventDefault();return;}
  if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
  const first=!keys[k];keys[k]=true;
  if(first)onPress(k);
});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();keys[k]=false;suppressedKeys.delete(k);if(k===' '&&typeof rollRelease==='function')rollRelease();});
function suppressHeldInputs(){for(const k in keys)if(keys[k])suppressedKeys.add(k);releaseInputs();}
function releaseInputs(){
  for(const k in keys)keys[k]=false;
  for(const k in touch)touch[k]=false;
  jumpQ=atkQ=dropQ=false;
  if(typeof endRoll==='function'){endRoll();rollHold=null;}
  document.querySelectorAll('#pad .on').forEach(b=>b.classList.remove('on'));
  padDirs.clear();dpadPointer=null;   // 판을 누른 채인 손가락은 한 번 떼고 다시 눌러야 움직인다 (키보드의 눌린 키를 막는 것과 같다)
  if(typeof endDrag==='function')endDrag();
}
addEventListener('blur',releaseInputs);
addEventListener('blur',()=>suppressedKeys.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseInputs();suppressedKeys.clear();}});
addEventListener('pointercancel',releaseInputs);

function onPress(k){
  if(k==='v'){Sound.toggle();return;}
  if(k==='m'){toggleMap();return;}
  if(mapTravel)return;
  if(open('map')){mapKey(k);return;}
  if(vistaMode){endVista();return;}
  if(zoneFade>0||zoneMotion)return;
  if(!G.started||G.ended)return;
  if(B){
    if(!$('bResult').hidden){if(k==='enter'||k==='e'||k===' ')$('bResOk').click();return;}
    if(B.paused){if(k==='escape'||k==='k'||k==='l')closeGift();return;}
    if(battleToolKey(k))return;   // 결정 D-224: Q 로 도구 바꾸기
    if(battleFormKey(k))return;
    // 결정 D-65: 전투에서 C(필드의 점프)는 선물을 열지 않는다. 선물은 K와 '선물' 버튼.
    if(k==='j'||k==='x'||k===' '||k==='enter')bStrike();else if(k==='k')openGift();else if(k==='l')openNameMenu();return;   // 결정 D-434: L 은 이름 대기(강철이 전투만)
  }
  if(inkOn)return;
  const mg=openMinigame();
  if(mg){if(k===' '||k==='j'||k==='enter'||k==='x')mg.hit();return;}
  if(open('dlg')){
    if(['1','2','3','4'].includes(k)){const b=$('dlgChoices').children[+k-1];if(b)b.click();return;}
    if(k==='e'||k==='enter'||k===' ')advance();return;
  }
  if(k==='escape'){closePanels();return;}
  if(k==='i'){if(!open('trade'))toggleBag();return;}
  if(k==='n'||k==='b'){toggleNote();return;} // B 는 옛 너구리의 책 키. 이제 같은 아빠의 수첩을 연다
  if(open('bag')&&(k==='q'||k==='r')){cycleBagKind(k==='q'?-1:1);return;}
  if(open('bag')||open('notebook')||open('trade'))return;
  if(pickupPose)return;
  // 0 너구리 · 1 다람쥐 · 2 산양 · 3 수리부엉이 · 4 수달 (forms.js, 결정 D-1073)
  if(formKey(k))return;
  // C(또는 Space·↑·W)는 점프, 아래를 누른 채면 발판 아래로 내려간다.
  // 결정 D-94: 움직이는 중의 Space는 짧게면 점프, 꾹 누르면 구르기 (roll.js). C·W·↑는 늘 바로 점프.
  if(k===' '&&rollPress()){}
  else if(k==='c'||k===' '||k==='w'||k==='arrowup'){if(k!==' ')rollCancelHold();jumpOrDrop();}   // 결정 D-143
  // X(J) 하나로 발밑 물건은 줍고, 없으면 휘두른다.
  if(rolling)return;   // 구르는 동안에는 휘두르기·줍기·말걸기를 하지 않는다
  if(k==='j'||k==='x')actionPress();
  if(k==='e'||k==='enter')tryTalk();
}
function jumpOrDrop(){if(isDown()&&!(keys['arrowup']||keys['w']))dropQ=true;else jumpQ=true;}
function padAction(k){
  if(k==='map'){toggleMap();return;}
  if(mapTravel||open('map'))return;
  if(vistaMode){endVista();return;}
  if(zoneFade>0||zoneMotion)return;
  if(!G.started||G.ended)return;
  // 결정 D-65: 키보드 C는 선물을 열지 않는다. 휴대폰은 화면의 선물·치기 단추를 숨기고 패드에 '선물'·'치기'라고 쓰므로,
  //   결정 D-384: 패드의 '선물'(점프 자리)은 선물을 연다 (전엔 아무 일도 하지 않아 휴대폰에서 선물을 건넬 수 없었다). 결정 D-383: '도구'는 든 도구를 바꾼다
  if(B){if(!$('bResult').hidden){if(k==='atk')$('bResOk').click();return;}if(B.paused)return;if(k==='atk')bStrike();else if(k==='jump')openGift();else if(k==='tool')switchBattleTool();return;}
  if(inkOn)return;
  const mg=openMinigame();
  if(k==='bag'){if(!open('dlg')&&!mg&&!open('trade'))toggleBag();return;}
  if(k==='note'||k==='book'){if(!open('dlg')&&!mg)toggleNote();return;}
  if(mg){if(k==='atk'||k==='jump')mg.hit();return;}
  if(open('dlg')){if(k!=='down')advance();return;}
  if(open('bag')||open('notebook')||open('trade'))return;
  if(k==='down'||k==='tool')return;
  if(pickupPose)return;
  if(rolling&&k!=='jump')return;
  if(k==='jump')jumpOrDrop();else if(k==='atk')actionPress();else if(k==='talk')tryTalk();
}
// 결정 D-52: 휴대폰 ▲은 키보드 ↑과 같다(점프·오르기·↑ 상호작용). 전투에서는 움직임만.
// 결정 D-380: 방향 십자는 판 하나다. 엄지를 떼지 않고 밀면 방향이 바뀐다(◀에서 ▶로, 대각선도). 판 가운데는 쉼.
//   위·아래는 세로로 분명히 밀었을 때만 켠다. 옆으로 가다 엄지가 조금 들려도 점프하지 않는다. 크기와 자리는 css/style.css 의 D-380 묶음.
function setPadDir(k,on){
  if(on===padDirs.has(k))return;
  if(on)padDirs.add(k);else padDirs.delete(k);
  document.querySelector('#dpad [data-k="'+k+'"]')?.classList.toggle('on',on);
  if(k==='left')touch.left=on;
  else if(k==='right')touch.right=on;
  else if(k==='up'){
    if(on){touch.up=true;if(!B)document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true}));}
    else{if(touch.up&&!B)document.body.dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowUp',bubbles:true}));touch.up=false;}
  }else if(k==='down'){touch.down=on;if(on)padAction('down');}
}
function padDirsAt(x,y){
  const r=$('dpad').getBoundingClientRect(),dx=x-(r.left+r.width/2),dy=y-(r.top+r.height/2),ax=Math.abs(dx),ay=Math.abs(dy),dead=r.width*0.12;
  const want=new Set();
  if(ax>dead&&ax*2>=ay)want.add(dx<0?'left':'right');
  if(ay>dead&&ay>ax*1.2)want.add(dy<0?'up':'down');
  return want;
}
{
  const dpad=$('dpad');
  const update=e=>{const want=padDirsAt(e.clientX,e.clientY);for(const k of ['left','right','up','down'])if(!want.has(k))setPadDir(k,false);for(const k of want)setPadDir(k,true);};
  const end=e=>{if(e&&e.pointerId!==dpadPointer)return;dpadPointer=null;for(const k of [...padDirs])setPadDir(k,false);};
  dpad.addEventListener('pointerdown',e=>{e.preventDefault();if(dpadPointer!==null)return;dpadPointer=e.pointerId;try{dpad.setPointerCapture(e.pointerId);}catch(_){}update(e);});
  dpad.addEventListener('pointermove',e=>{if(e.pointerId===dpadPointer)update(e);});
  dpad.addEventListener('pointerup',end);dpad.addEventListener('pointercancel',end);dpad.addEventListener('lostpointercapture',end);
  dpad.addEventListener('contextmenu',e=>e.preventDefault());
}
// 결정 D-381: 휴대폰 점프는 기다림 없이 바로 뛴다(구르기는 따로 구르기 단추). 키보드 Space의 꾹 구르기(D-94)는 그대로.
document.querySelectorAll('#pad [data-k]').forEach(b=>{
  const k=b.dataset.k;if(b.closest('#dpad'))return;
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('on');
    try{b.setPointerCapture(e.pointerId);}catch(_){}
    if(k==='jump')touch.jump=true;
    if(k==='roll'){touch.roll=true;rollButtonPress();}else padAction(k);});
  const up=()=>{b.classList.remove('on');if(k==='jump'){touch.jump=false;rollRelease();}if(k==='roll'){touch.roll=false;rollRelease();}};
  b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);
  b.addEventListener('contextmenu',e=>e.preventDefault());
});
$('prompt').addEventListener('click',()=>{if(paused())return;if(nearFloorItems().length)actionPress();else if(nearInteraction())tryInteract();else atkQ=true;});
