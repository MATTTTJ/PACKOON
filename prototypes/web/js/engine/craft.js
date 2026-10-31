'use strict';
/* 가공 결과는 bag.js에서 시작할 때 확정한다. 이 한 번의 동작은 그림·말·소리만 바꾼다. */
let craftHands=null,craftFrame=0;
function fillCraftRecipe(r){
  if(brewing||!isAwake(pouch.tool))return;
  const stock={...G.inv};for(const id of pouch.items)stock[id]=(stock[id]||0)+1;
  if(Object.entries(r.need).some(([id,n])=>(stock[id]||0)<n)){
    pouchMsg='아직 재료가 모자란다. 가진 재료부터 살펴보자.';renderBag();return;
  }
  returnPouch();
  for(const [id,n] of Object.entries(r.need))for(let i=0;i<n;i++){
    G.inv[id]--;if(!G.inv[id])delete G.inv[id];pouch.items.push(id);
  }
  selItem=null;lastOut=null;pouchMsg=liveHint();refreshHud();renderBag();
}
/* 결정 D-113: 가공은 재료 수와 상관없이 한 번의 동작으로 끝난다(D-54를 대신함). 누르면 동작 한 번(tuning craft_motion_ms)이 돌고 끝난다.
   도구는 움직이는 부분만 움직인다. 절구는 공이만 위아래로, 맷돌은 윗돌만 어처구니로 한 바퀴, 시루는 그대로 두고 솥에서 김이 올라 뚜껑이 들썩,
   약연은 홈은 두고 바퀴만 앞으로 굴렀다가 끝에 살짝 되돌린다. 집안 손버릇(D-30)은 동작 횟수가 아니라 이 한 동작 안의 버릇과 말로 남는다:
   절구는 찧은 뒤 한 박자 쉬고 들어 올리고, 맷돌은 왼쪽으로 돌리면 '증조할아버지처럼', 시루는 김이 오를 때 뚜껑을 톡, 약연은 끝에 한 번 거꾸로. */
function startCraftHands(tool,recipe,discovered){
  cancelAnimationFrame(craftFrame);
  craftHands={owner:G,region:G.region,tool,recipe,discovered,time:0,started:null,dir:null,last:performance.now(),
    sounds:{},parts:[],paused:document.hidden||!document.hasFocus()};
  craftFrame=requestAnimationFrame(stepCraftHands);
}
function finishCraftHands(redraw=true){
  const h=craftHands;if(!h)return;
  cancelAnimationFrame(craftFrame);craftHands=null;brewing=false;
  if(G!==h.owner||G.region!==h.region)return;
  Sound.craft();lastOut=h.recipe.out;
  const voices={
    jeolgu:['한 번 힘껏 찧고, 한 박자 쉬고. 엄마처럼 했다.','절구 공이가 손에 꼭 맞는다.'],
    maetdol:['왼쪽으로 한 바퀴. 증조할아버지 손도 이랬겠지.','맷돌이 느긋하게 한 바퀴 돌았다.'],
    siru:['김이 오를 때 톡. 엄마 냄새가 난다.','뚜껑을 열자 따뜻한 김이 났다.'],
    yakyeon:['끝에 한 번 거꾸로. 아빠 손을 따라 했다.','약연 바퀴에 아빠 손때가 남아 있다.']
  };
  // 맷돌만 돌리는 방향을 고른다. 나머지 버릇은 한 동작 안에 들어 있다.
  const matched=h.started!==null&&(h.tool!=='maetdol'||h.dir==='left');
  if(matched)Sound.gather(true);
  pouchMsg=voices[h.tool][matched?0:1]+' '+ITEMS[h.recipe.out].n+' '+h.recipe.n+'개 완성.'+
    (h.discovered?' 찾은 가공법을 수첩에 이어 적었다.':'');
  if(redraw&&open('bag'))renderBag();
}
const craftMotionMs=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?300:TABLES.TUNING.craft_motion_ms;
// 한 번 누르면 동작 한 번이 시작된다. 동작 중에는 더 누르지 않는다.
function craftHandInput(direction){
  const h=craftHands;if(!h||h.owner!==G||h.region!==G.region||h.paused||h.started!==null)return;
  h.started=h.time;h.dir=direction;h.parts=[];
  if(h.tool==='yakyeon')Sound.roller();   // 결정 D-74: 약연은 약연 굴리는 소리
  else if(h.tool==='maetdol')Sound.stone('place');
  updateCraftHands();
}
function stepCraftHands(now){
  const h=craftHands;if(!h)return;
  if(h.owner!==G||h.region!==G.region||!open('bag')){finishCraftHands(false);return;}
  if(!h.paused&&!document.hidden)h.time+=now-h.last;
  h.last=now;
  if(h.started!==null){
    const p=(h.time-h.started)/craftMotionMs();
    // 소리는 동작 안의 한 순간에 한 번씩
    const once=(k,at,f)=>{if(p>=at&&!h.sounds[k]){h.sounds[k]=true;f();}};
    if(h.tool==='jeolgu')once('pound',.5,()=>Sound.forge('hit'));
    if(h.tool==='maetdol')once('grind',.5,()=>Sound.stone('place'));
    if(h.tool==='siru')once('tap',.78,()=>Sound.steam('tap'));
    if(p>=1){finishCraftHands();return;}
  }
  updateCraftHands();craftFrame=requestAnimationFrame(stepCraftHands);
}
function updateCraftHands(){
  const h=craftHands,box=$('craftHands');if(!h||!box)return;
  const p=h.started===null?0:clamp((h.time-h.started)/craftMotionMs(),0,1);
  const idle={jeolgu:'공이를 들어 한 번에 찧는다 · J / X / Space',maetdol:'어처구니를 잡고 한 바퀴 돌린다 · ← → / A D',
    siru:'솥에 불을 지펴 김을 올린다 · J / X / Space',yakyeon:'바퀴를 밀어 한 번 굴린다 · J / X / → / D'}[h.tool];
  const busy={jeolgu:p<.6?'공이를 들어… 쿵!':'한 박자 쉬고 공이를 든다.',
    maetdol:h.dir==='left'?'드르륵… 왼쪽으로 한 바퀴.':'드르륵… 오른쪽으로 한 바퀴.',
    siru:p<.7?'솥에서 김이 오른다…':'김이 올랐다. 뚜껑을 톡.',
    yakyeon:p<.8?'데굴데굴… 바퀴를 앞으로 민다.':'끝에서 한 번 거꾸로.'}[h.tool];
  const cue=h.paused?'잠깐 손을 쉬는 중. 돌아오면 이어 한다.':h.started===null?idle:busy;
  const caption=$('craftCue');if(caption&&caption.textContent!==cue)caption.textContent=cue;
  const meter=$('craftMeter');if(meter){meter.style.width=(p*100)+'%';meter.parentElement.setAttribute('aria-valuenow',Math.round(p*100));}
  box.dataset.busy=String(h.started!==null);
  for(const b of box.querySelectorAll('[data-craft]'))b.disabled=h.started!==null;
  const cv=$('craftCanvas');if(cv)drawCraftTool(cv,h,p);
}
/* 도구 그림: 40×34 도트. 몸통(고정)과 움직이는 부분을 따로 그린다. */
function drawCraftTool(cv,h,p){
  const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);
  const P=(x,y,w,ht,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,ht);};
  const going=h.started!==null,GOLD='#e6b54a';
  // 튀는 가루·흐르는 가루 (동작 중에만)
  const dust=(x,y,vx,vy,c)=>{if(h.parts.length<40)h.parts.push({x,y,vx,vy,c,life:1});};
  if(h.tool==='jeolgu'){
    // 공이: 쉬는 자리 → 들어 올림 → 내리찧기(0.5) → 한 박자 쉼 → 제자리
    const rest=17,up=13,hit=22;
    const y=!going?rest:p<.35?rest+(up-rest)*(p/.35):p<.5?up+(hit-up)*((p-.35)/.15):p<.72?hit:hit+(rest-hit)*((p-.72)/.28);
    P(18,y-12,4,13,'#a8743b');P(18,y-12,4,1,GOLD);P(17,y,6,2,'#8a5a2b');   // 공이 (손잡이 + 머리)
    // 절구 몸통 (고정)
    P(9,22,22,2,'#5a361e');P(8,24,24,6,'#8a5a2b');P(8,27,24,1,GOLD);P(11,30,18,2,'#6b4423');
    P(12,26,1,1,'#bfe6e0');P(19,26,1,1,'#e9c8f5');P(26,26,1,1,'#bfe6e0');
    if(going&&p>=.5&&!h.sounds.dust){h.sounds.dust=true;for(let i=0;i<8;i++)dust(20,22,(i-3.5)*.35,-1-Math.random()*1.2,'#c9a26a');}
  }else if(h.tool==='maetdol'){
    // 아랫돌·홈 (고정)
    P(6,24,28,5,'#8c8a84');P(6,24,28,1,GOLD);P(7,29,26,1,'#6f6d68');P(34,25,4,2,'#6f6d68');P(37,26,1,1,'#5c5a55');
    // 윗돌: 몸은 그대로, 어처구니와 자개 무늬가 둘레를 돈다 (옆에서 본 회전)
    const a=(going?p*Math.PI*2*(h.dir==='left'?-1:1):0)-Math.PI/2;
    const hx=20+Math.cos(a)*9,front=Math.sin(a)>0;
    const handle=()=>{P(hx-1,9,2,10,'#6b4423');P(hx-1,9,2,1,GOLD);};
    if(!front)handle();
    P(8,18,24,6,'#a3a19a');P(8,18,24,1,'#c4c2bb');P(19,18,2,1,'#5c5a55');
    for(let k=0;k<3;k++){const b=a+k*Math.PI*2/3;if(Math.sin(b)>0)P(20+Math.cos(b)*10,21,1,1,k%2?'#e9c8f5':'#bfe6e0');}
    if(front)handle();
    if(going&&p>.2&&p<.95&&Math.random()<.6)dust(37,27,.15,.3,'#d8d2c0');
  }else if(h.tool==='siru'){
    // 불·솥·시루 (고정), 뚜껑만 김에 들썩인다
    const flick=going?Math.round(Math.sin(h.time/70)):0;
    if(going){P(14,32,12,2,'#e8551f');P(16,31+flick,3,1,'#ffb347');P(22,31-flick,2,1,'#ffb347');}
    P(6,26,28,2,'#555048');P(8,28,24,4,'#3a3a3a');
    P(9,14,22,12,'#9b5b3a');P(9,14,22,1,GOLD);P(7,18,2,3,'#7a4428');P(31,18,2,3,'#7a4428');
    for(const [x,y] of [[13,18],[18,18],[23,18],[15,22],[21,22],[26,22]])P(x,y,1,1,'#3a2016');
    const lift=going&&p>.55?(p>.76&&p<.84?-2:Math.round(Math.sin(h.time/90))*-1):0;
    P(8,11+lift,24,3,'#7a4428');P(8,11+lift,24,1,'#9b5b3a');P(19,9+lift,2,2,GOLD);
    if(going&&p>.25)for(let i=0;i<3;i++){const s=((h.time/600+i/3)%1),x=12+i*8+Math.sin(h.time/200+i)*2;g.globalAlpha=Math.min(1,(p-.25)*3)*(1-s);P(x,10-s*10,1,3,'#e9e3d5');g.globalAlpha=1;}
  }else{
    // 약연: 배 모양 홈 (고정), 바퀴만 앞으로 굴렀다가 끝에 살짝 되돌린다
    P(4,24,32,4,'#5c4a3a');P(4,24,32,1,GOLD);P(8,24,24,1,'#3a2e24');P(6,28,28,2,'#3f3226');P(9,26,1,1,'#e9c8f5');P(30,26,1,1,'#bfe6e0');
    const x0=12,x1=28,back=24;
    const wx=!going?x0:p<.8?x0+(x1-x0)*(p/.8):x1+(back-x1)*((p-.8)/.2);
    const ang=(wx-x0)/6,cy=19,r=6;
    for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++){const d=xx*xx+yy*yy;if(d<=r*r)P(wx+xx,cy+yy,1,1,d>(r-1.5)*(r-1.5)?'#7a6a5a':'#8f7f6d');}
    for(let k=0;k<3;k++){const b=ang+k*Math.PI*2/3;for(let s=1;s<r-1;s++)P(wx+Math.cos(b)*s,cy+Math.sin(b)*s,1,1,'#5c4a3a');}
    P(wx-1,cy-1,2,2,GOLD);P(wx-10,cy,20,1,'#6b4423');P(wx-11,cy-1,2,3,'#6b4423');P(wx+9,cy-1,2,3,'#6b4423');   // 축 손잡이
    if(going&&p<.8&&Math.random()<.4)dust(wx-6,24,-.3,-.4,'#b9a98c');
  }
  // 가루 입자
  for(let i=h.parts.length-1;i>=0;i--){const d=h.parts[i];d.x+=d.vx;d.y+=d.vy;d.vy+=.12;d.life-=.03;
    if(d.life<=0||d.y>cv.height){h.parts.splice(i,1);continue;}g.globalAlpha=d.life;P(d.x,d.y,1,1,d.c);g.globalAlpha=1;}
}
function renderCraftHands(wrap){
  const h=craftHands;if(!h||h.owner!==G)return;
  const box=el('section','craft-hands');box.id='craftHands';box.dataset.tool=h.tool;box.setAttribute('aria-label','가보 손맛');
  box.appendChild(el('p','small','솜씨가 달라도 완성품은 같다. 창을 닫아도 보따리에 남는다.'));
  const cue=el('p','craft-cue');cue.id='craftCue';cue.setAttribute('role','status');box.appendChild(cue);
  const figure=el('div','craft-figure');figure.id='craftFigure';figure.setAttribute('aria-hidden','true');
  const cv=document.createElement('canvas');cv.id='craftCanvas';cv.width=40;cv.height=34;figure.appendChild(cv);
  box.appendChild(figure);
  const track=el('div','craft-track');track.setAttribute('role','progressbar');track.setAttribute('aria-label','가공 진행');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');
  const meter=el('div');meter.id='craftMeter';track.appendChild(meter);box.appendChild(track);
  const actions=el('div','craft-actions');
  const buttons=h.tool==='maetdol'?[['left','왼쪽으로 돌리기'],['right','오른쪽으로 돌리기']]:
    [['tap',{jeolgu:'공이로 찧기 · J / X',siru:'불 지펴 찌기 · J / X',yakyeon:'바퀴 굴리기 · J / X'}[h.tool]]];
  buttons.forEach(([dir,label],i)=>{const b=el('button',h.tool==='maetdol'?'btn':'btn primary',label);b.type='button';b.dataset.craft=dir;b.onclick=()=>craftHandInput(dir);actions.appendChild(b);});
  box.appendChild(actions);
  wrap.appendChild(box);updateCraftHands();
}
// 기존 행동키만 가공대 안에서 받는다. 반복 keydown은 한 번만 센다.
addEventListener('keydown',e=>{
  if(!craftHands||!open('bag')||e.target.matches('input,textarea,select')||e.target.isContentEditable)return;
  const k=e.key.toLowerCase();
  if([' ','enter'].includes(k)&&e.target.matches('[data-craft]')){
    e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)e.target.click();return;
  }
  const dir=['arrowleft','a'].includes(k)?'left':['arrowright','d'].includes(k)?'right':null;
  const tap=['j','x',' '].includes(k);
  // 맷돌은 방향을 고른다. 약연은 앞(→)이나 행동키로 민다. 절구·시루는 행동키.
  const go=craftHands.tool==='maetdol'?dir:craftHands.tool==='yakyeon'?(tap||dir==='right'?'tap':null):(tap?'tap':null);
  if(!go)return;
  if(k===' '&&e.target.matches('button'))return;
  e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)craftHandInput(go);
},true);
function pauseCraftHands(paused){if(craftHands){craftHands.paused=paused;craftHands.last=performance.now();updateCraftHands();}}
addEventListener('blur',()=>pauseCraftHands(true));
addEventListener('focus',()=>pauseCraftHands(document.hidden));
document.addEventListener('visibilitychange',()=>pauseCraftHands(document.hidden||!document.hasFocus()));

/* 인물 사연과 지역 대화도 같은 표를 조회한다. 불명인 취향은 null이다. */
function tasteOf(who,item){return TABLES.TASTES[who]?.[item]||null;}
function isHomeCraft(item){return ITEMS[item]?.region===G.region&&Object.values(RECIPES).some(list=>list.some(r=>r.optional&&r.out===item));}
function sendCraftHome(item){
  if(!isHomeCraft(item)||!sendHomeGift(G.region,item))return false;
  closePanels();talk([['너구리',ITEMS[item].n+' 하나예요. 엄마한테 제가 만들었다고 전해 주세요.']]);return true;
}
function giftTaste(who,item){
  const taste=tasteOf(who,item);if(!taste||!G||!has(item))return null;
  const liked=['아주 좋아함','좋아함'].includes(taste.kind);
  if(liked){
    if(knows('like:'+who+':'+item))return {kind:taste.kind,line:'아까 나눈 맛을 아직 기억하고 있다.',given:false};
    const after={...G.inv,[item]:G.inv[item]-1};
    if(progressShortage(after)>progressShortage(G.inv))return {kind:taste.kind,line:'이건 아직 쓸 데가 있어. 다른 걸 건네자.',given:false};
    takeItem(item,1);learn('like:'+who+':'+item);Sound.exchange();
  }
  return {kind:taste.kind,line:taste.line,given:liked};
}
/* 지역 대화의 선택지·종료 함수를 건드리지 않고 먹을거리 나누기를 붙인다. */
const fieldTaste=el('div','field-taste');
fieldTaste.id='fieldTaste';fieldTaste.hidden=true;$('dlg').querySelector('.dbody').appendChild(fieldTaste);
fieldTaste.addEventListener('click',e=>e.stopPropagation());
fieldTaste.addEventListener('keydown',e=>{
  if(![' ','enter'].includes(e.key.toLowerCase())||!e.target.matches('button'))return;
  e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)e.target.click();
});
let fieldTasteWho=null;
function renderFieldTaste(){
  const n=REG?.npcs.find(n=>n.name===$('dlgWho').textContent);
  const who=G&&open('dlg')&&!B?n?.id:null;
  if(who!==fieldTasteWho){fieldTaste.innerHTML='';fieldTasteWho=who;}
  const items=who?Object.keys(TABLES.TASTES[who]||{}).filter(id=>has(id)):[];
  fieldTaste.hidden=!who||!items.length;if(fieldTaste.hidden||fieldTaste.children.length)return;
  const toggle=el('button','btn','물건 건네기');toggle.type='button';toggle.setAttribute('aria-expanded','false');fieldTaste.appendChild(toggle);
  const choices=el('div','taste-choices');choices.hidden=true;fieldTaste.appendChild(choices);
  const response=el('p','taste-response');response.setAttribute('role','status');fieldTaste.appendChild(response);
  toggle.onclick=()=>{choices.hidden=!choices.hidden;toggle.setAttribute('aria-expanded',String(!choices.hidden));};
  items.forEach(id=>{const b=el('button','btn',ITEMS[id].n);b.type='button';b.onclick=()=>{
    if(fieldTasteWho!==who||!open('dlg'))return;
    const result=giftTaste(who,id);if(!result){b.disabled=true;return;}
    response.textContent=result.line+(result.given?'':' (물건은 그대로다.)');if(result.given||!has(id))b.disabled=true;
  };choices.appendChild(b);});
}
new MutationObserver(renderFieldTaste).observe($('dlgWho'),{childList:true,characterData:true,subtree:true});
new MutationObserver(renderFieldTaste).observe($('dlg'),{attributes:true,attributeFilter:['hidden']});

// 새 물건의 그림만 둔다. 이름·재료·수량·취향은 CSV에서 읽는다.
(()=>{
  const bowl=(P,c)=>{P(2,8,12,2,'#684b37');P(3,10,10,3,'#a77b52');P(5,13,6,1,'#684b37');P(4,6,8,3,c);};
  const bottle=(P,c)=>{P(6,2,4,2,'#684b37');P(5,4,6,9,c);P(6,7,4,3,'#f4e3bb');};
  defineIcons({
    acorn_jelly:P=>bowl(P,'#9f794b'),sesame_salt:P=>{bowl(P,'#ddd0a4');P(6,7,1,1,'#6e5137');P(9,8,1,1,'#6e5137');},
    memil_jelly:P=>bowl(P,'#aaa28c'),mung_batter:P=>bowl(P,'#b7b778'),
    yakgwa:P=>{P(5,3,6,10,'#bd7d32');P(3,5,10,6,'#bd7d32');P(6,6,4,4,'#e8b85c');P(7,7,2,2,'#9a5b27');},
    rainbow_tteok:P=>{['#cc8368','#efdfba','#9cba7d'].forEach((c,i)=>P(3,4+i*3,10,3,c));},
    magamok_tea:P=>{bowl(P,'#a7553d');P(13,9,2,3,'#a77b52');},
    ssanghwa:P=>{bowl(P,'#75543d');P(5,4,2,4,'#c8a36c');P(9,5,2,3,'#9f794b');},
    salt:P=>bowl(P,'#f2eee2'),sesame:P=>bowl(P,'#d0b375'),
    sesame_oil:P=>bottle(P,'#c3943f'),honey:P=>bottle(P,'#d6a147'),
    mung:P=>bowl(P,'#8f9c56'),jujube:P=>{P(4,5,8,7,'#9b4538');P(6,4,4,9,'#ac5040');P(5,6,2,2,'#d9956d');}
  });
})();
