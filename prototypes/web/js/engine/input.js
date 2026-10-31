'use strict';
/* 입력: 키보드와 터치 패드. 미니게임 창(대장간·채집 등)은 MINIGAMES 에 등록하면 입력과 일시정지가 자동으로 붙는다. */

/* {id:창 요소 id, step:매 프레임, hit:누르기} */
const MINIGAMES=[];
function defineMinigame(m){MINIGAMES.push(m);}
const open=id=>!!$(id)&&!$(id).hidden; // 없어진 패널 id(옛 'book')는 닫힌 것으로 본다
const openMinigame=()=>MINIGAMES.find(m=>open(m.id))||null;

const keys={};const touch={left:false,right:false,up:false,down:false,jump:false};   // jump: 누르고 있는 동안 (수리부엉이 활공)
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
    if(B.paused){if(k==='escape'||k==='k')closeGift();return;}
    if(battleFormKey(k))return;
    // 결정 D-65: 전투에서 C(필드의 점프)는 선물을 열지 않는다. 선물은 K와 '선물' 버튼.
    if(k==='j'||k==='x'||k===' '||k==='enter')bStrike();else if(k==='k')openGift();return;
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
  // 0 너구리 · 1 다람쥐 · 2 산양 · 3 수리부엉이 · 4 고라니 (forms.js)
  if(formKey(k))return;
  // C(또는 Space·↑·W)는 점프, 아래를 누른 채면 발판 아래로 내려간다.
  // 결정 D-94: 움직이는 중의 Space는 짧게면 점프, 꾹 누르면 구르기 (roll.js). C·W·↑는 늘 바로 점프.
  if(k===' '&&rollPress()){}
  else if(k==='c'||k===' '||k==='w'||k==='arrowup')jumpOrDrop();
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
  if(B){if(!$('bResult').hidden){if(k==='atk')$('bResOk').click();return;}if(B.paused)return;if(k==='atk')bStrike();return;}   // 결정 D-65: 패드 점프도 선물을 열지 않는다(화면의 '선물' 버튼)
  if(inkOn)return;
  const mg=openMinigame();
  if(k==='bag'){if(!open('dlg')&&!mg&&!open('trade'))toggleBag();return;}
  if(k==='note'||k==='book'){if(!open('dlg')&&!mg)toggleNote();return;}
  if(mg){if(k==='atk'||k==='jump')mg.hit();return;}
  if(open('dlg')){if(k!=='down')advance();return;}
  if(open('bag')||open('notebook')||open('trade'))return;
  if(k==='down')return;
  if(pickupPose)return;
  if(rolling&&k!=='jump')return;
  if(k==='jump')jumpOrDrop();else if(k==='atk')actionPress();else if(k==='talk')tryTalk();
}
// 결정 D-52: 휴대폰 ▲은 키보드 ↑과 같다(점프·오르기·↑ 상호작용). 전투에서는 움직임만.
document.querySelectorAll('#pad [data-k]').forEach(b=>{
  const k=b.dataset.k;
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('on');
    try{b.setPointerCapture(e.pointerId);}catch(_){}
    if(k==='jump')touch.jump=true;if(k==='left')touch.left=true;else if(k==='right')touch.right=true;else if(k==='up'){touch.up=true;if(!B)document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true}));}else if(k==='down'){touch.down=true;padAction(k);}else if(!(k==='jump'&&rollPress()))padAction(k);});
  const up=()=>{b.classList.remove('on');if(k==='jump'){touch.jump=false;rollRelease();}if(k==='left')touch.left=false;if(k==='right')touch.right=false;if(k==='up'){if(touch.up&&!B)document.body.dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowUp',bubbles:true}));touch.up=false;}if(k==='down')touch.down=false;};
  b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);
  b.addEventListener('contextmenu',e=>e.preventDefault());
});
$('prompt').addEventListener('click',()=>{if(paused())return;if(nearFloorItems().length)actionPress();else if(nearInteraction())tryInteract();else atkQ=true;});
