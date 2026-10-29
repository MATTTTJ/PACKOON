'use strict';
/* 입력: 키보드와 터치 패드. 미니게임 창(대장간·채집 등)은 MINIGAMES 에 등록하면 입력과 일시정지가 자동으로 붙는다. */

/* {id:창 요소 id, step:매 프레임, hit:누르기} */
const MINIGAMES=[];
function defineMinigame(m){MINIGAMES.push(m);}
const open=id=>!$(id).hidden;
const openMinigame=()=>MINIGAMES.find(m=>open(m.id))||null;

const keys={};const touch={left:false,right:false,up:false,down:false};
let jumpQ=false,atkQ=false;
const isLeft=()=>keys['arrowleft']||keys['a']||touch.left;
const isRight=()=>keys['arrowright']||keys['d']||touch.right;
addEventListener('keydown',e=>{
  if(e.target instanceof HTMLElement&&(e.target.matches('input,textarea,select')||e.target.isContentEditable))return;
  const k=e.key.toLowerCase();
  if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
  const first=!keys[k];keys[k]=true;
  if(first)onPress(k);
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
function releaseInputs(){
  for(const k in keys)keys[k]=false;
  for(const k in touch)touch[k]=false;
  jumpQ=atkQ=false;
  document.querySelectorAll('#pad .on').forEach(b=>b.classList.remove('on'));
  if(typeof endDrag==='function')endDrag();
}
addEventListener('blur',releaseInputs);
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseInputs();});
addEventListener('pointercancel',releaseInputs);

function onPress(k){
  if(k==='m'){Sound.toggle();return;}
  if(!G.started||G.ended)return;
  if(B){
    if(!$('bResult').hidden){if(k==='enter'||k==='e'||k===' ')$('bResOk').click();return;}
    if(B.paused){if(k==='escape'||k==='k'||k==='c')closeGift();return;}
    if(k==='j'||k==='x'||k===' '||k==='enter')bStrike();else if(k==='k'||k==='c')openGift();return;
  }
  if(inkOn)return;
  const mg=openMinigame();
  if(mg){if(k===' '||k==='j'||k==='enter'||k==='x')mg.hit();return;}
  if(open('dlg')){
    if(['1','2','3','4'].includes(k)){const b=$('dlgChoices').children[+k-1];if(b)b.click();return;}
    if(k==='e'||k==='enter'||k===' ')advance();return;
  }
  if(k==='escape'){closePanels();return;}
  if(k==='i'){toggleBag();return;}
  if(k==='b'){toggleBook();return;}
  if(k==='n'){toggleNote();return;}
  if(open('bag')&&(k==='q'||k==='r')){cycleBagKind(k==='q'?-1:1);return;}
  if(open('bag')||open('book')||open('notebook'))return;
  if(k===' '||k==='w'||k==='arrowup')jumpQ=true;
  if(k==='j'||k==='x')atkQ=true;
  if(k==='e'||k==='enter')tryTalk();
}
function padAction(k){
  if(!G.started||G.ended)return;
  if(B){if(!$('bResult').hidden){if(k==='atk')$('bResOk').click();return;}if(B.paused)return;if(k==='atk')bStrike();else if(k==='jump')openGift();return;}
  if(inkOn)return;
  const mg=openMinigame();
  if(k==='bag'){if(!open('dlg')&&!mg)toggleBag();return;}
  if(k==='book'){if(!open('dlg')&&!mg)toggleBook();return;}
  if(k==='note'){if(!open('dlg')&&!mg)toggleNote();return;}
  if(mg){if(k==='atk'||k==='jump')mg.hit();return;}
  if(open('dlg')){advance();return;}
  if(open('bag')||open('book')||open('notebook'))return;
  if(k==='jump')jumpQ=true;else if(k==='atk')atkQ=true;else if(k==='talk')tryTalk();
}
document.querySelectorAll('#pad [data-k]').forEach(b=>{
  const k=b.dataset.k;
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.classList.add('on');
    try{b.setPointerCapture(e.pointerId);}catch(_){}
    if(k==='left')touch.left=true;else if(k==='right')touch.right=true;else if(k==='up')touch.up=true;else if(k==='down')touch.down=true;else padAction(k);});
  const up=()=>{b.classList.remove('on');if(k==='left')touch.left=false;if(k==='right')touch.right=false;if(k==='up')touch.up=false;if(k==='down')touch.down=false;};
  b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);
  b.addEventListener('contextmenu',e=>e.preventDefault());
});
$('prompt').addEventListener('click',()=>{if(open('dlg'))return;if(nearNpc())tryTalk();else atkQ=true;});
