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
   도구는 움직이는 부분만 움직인다. 절구는 공이만 위아래로, 맷돌은 윗돌만 어처구니로 한 바퀴, 시루는 그대로 두고 솥에서 김이 올라 뚜껑이 들썩.
   집안 손버릇(D-30)은 동작 횟수가 아니라 이 한 동작 안의 버릇과 말로 남는다:
   절구는 찧은 뒤 한 박자 쉬고 들어 올리고, 맷돌은 왼쪽으로 돌리면 '증조할아버지처럼', 시루는 김이 오를 때 뚜껑을 톡. (결정 D-421: 아빠의 약연은 뺐다)
   결정 D-1434 (사용자 피드백 2026-11-10): 맷돌도 단추 하나다. 방향을 고르지 않고 늘 집안 버릇대로 왼쪽으로 돈다(돌쇠 할배가 일러 준 손버릇, D-443). */
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
    siru:['김이 오를 때 톡. 엄마 냄새가 난다.','뚜껑을 열자 따뜻한 김이 났다.']
  };
  // 버릇은 한 동작 안에 들어 있다. 맷돌은 늘 왼쪽으로 돈다(D-1434).
  const matched=h.started!==null&&(h.tool!=='maetdol'||h.dir==='left');
  if(matched)Sound.gather(true);
  pouchMsg=voices[h.tool][matched?0:1]+' '+ITEMS[h.recipe.out].n+' '+h.recipe.n+'개 완성.'+
    (h.discovered?' 찾은 가공법을 수첩에 이어 적었다.':'');
  if(redraw&&open('bag'))renderBag();
}
// 결정 D-201: 가공 한 동작을 조금 더 빠르게 (tuning craft_motion_ms 1100→750)
const craftMotionMs=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?300:TABLES.TUNING.craft_motion_ms;
// 한 번 누르면 동작 한 번이 시작된다. 동작 중에는 더 누르지 않는다.
function craftHandInput(direction){
  const h=craftHands;if(!h||h.owner!==G||h.region!==G.region||h.paused||h.started!==null)return;
  h.started=h.time;h.dir=direction;h.parts=[];
  if(h.tool==='maetdol')Sound.stone('place');
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
  const idle={jeolgu:'공이를 들어 한 번에 찧는다 · J / X / Space',maetdol:'어처구니를 잡고 한 바퀴 돌린다 · J / X / Space',
    siru:'솥에 불을 지펴 김을 올린다 · J / X / Space'}[h.tool];
  const busy={jeolgu:p<.6?'공이를 들어… 쿵!':'한 박자 쉬고 공이를 든다.',
    maetdol:h.dir==='left'?'드르륵… 왼쪽으로 한 바퀴.':'드르륵… 오른쪽으로 한 바퀴.',
    siru:p<.7?'솥에서 김이 오른다…':'김이 올랐다. 뚜껑을 톡.'}[h.tool];
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
  const buttons=h.tool==='maetdol'?[['left','어처구니 돌리기 · J / X']]:   // 결정 D-1434
    [['tap',{jeolgu:'공이로 찧기 · J / X',siru:'불 지펴 찌기 · J / X'}[h.tool]]];
  buttons.forEach(([dir,label],i)=>{const b=el('button','btn primary',label);b.type='button';b.dataset.craft=dir;b.onclick=()=>craftHandInput(dir);actions.appendChild(b);});
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
  // 결정 D-1434: 맷돌도 행동키(방향키도 받는다)로 늘 왼쪽으로 돌린다. 절구·시루는 행동키.
  const go=craftHands.tool==='maetdol'?(dir||tap?'left':null):(tap?'tap':null);
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
fieldTaste.id='fieldTaste';fieldTaste.hidden=true;$('dlgActions').appendChild(fieldTaste);   // 결정 D-163: '보따리 펼치기'와 한 줄
fieldTaste.addEventListener('click',e=>e.stopPropagation());
fieldTaste.addEventListener('keydown',e=>{
  if(![' ','enter'].includes(e.key.toLowerCase())||!e.target.matches('button'))return;
  e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)e.target.click();
});
let fieldTasteWho=null;
function renderFieldTaste(){
  // 결정 D-906: 떠돌이(구역 인물·확장 만남)도 이름으로 찾아 건넬 수 있다. 큰 장터 떠돌이의 j_ 붙은 id는 tastes.csv 의 인물 id로 읽는다
  const name=$('dlgWho').textContent,n=REG?.npcs.find(n=>n.name===name)||(REG&&name?portraitCandidates(REG).find(n=>n.name===name):null);
  const tid=n&&(TABLES.TASTES[n.id]||!TABLES.TASTES[n.id.replace(/^j_/,'')]?n.id:n.id.replace(/^j_/,''));
  const who=G&&open('dlg')&&!B&&!tradeClosedNow(n?.id)?tid:null;   // 결정 D-197 (disguise.js)
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
    if(result.given)giftLesson(who,result.line);   // 결정 D-906
  };choices.appendChild(b);});
}
/* 결정 D-906 (사용자 피드백 2026-11-06 "선물 시 보상으로 조합법을 배우도록. 성격에 따라 직접 알려 주거나 소문을 알려 주거나"):
   좋아하는 것을 건네면 그 인물이 답례로 숨은 가공법 하나를 일러 준다. 누가 무엇을 어떻게 일러 주는지는 gift_recipes.csv 에 있다
   (방식: 직접 가르침 · 들은 소문 · 혼잣말로 흘림 · 쪽지). 이 지역의 그 인물 줄 가운데 아직 모르는 가공법 하나만, 선물 한 번에 하나다.
   배운 것(gift:<id>)은 건넨 순간 수첩에 적고(대화가 끊겨도 잃지 않게), 대사는 이어서 보인다.
   대화의 마지막 줄에서 건네면 반응과 함께 바로 잇는다. 대화 중간이면 그 대화가 다 끝난 뒤에 잇는다 (결정 D-702: 대화를 중간에 끊지 않는다). */
function giftLessonFor(who){
  const knownOut=out=>Object.values(RECIPES).flat().some(r=>r.out===out&&recipeKnown(r));
  return (TABLES.GIFT_RECIPES||[]).find(g=>g.region===G.region&&g.npc===who&&!knows('gift:'+g.id)&&!knownOut(g.out))||null;
}
// 말하는 이름은 선물을 건넨 대화의 이름 그대로 쓴다 (떠돌이는 지역 인물 목록에 없다)
function giftLessonLines(g,name){
  const item=ITEMS[g.out].n;
  const lines=g.lines.map(([kid,text])=>[kid?'너구리':name,text]);
  lines.push(['너구리',g.way==='쪽지'?'(쪽지를 수첩 사이에 끼워 두었다. '+item+' 만드는 법이다.)':'(수첩에 '+item+' 만드는 법을 적었다.)']);
  return lines;
}
function giftLesson(who,reaction){
  const g=giftLessonFor(who);if(!g)return;
  learn('gift:'+g.id,true);
  const name=$('dlgWho').textContent,last=!dlgQ.length&&!dlgEnd&&!$('dlgChoices').children.length;
  if(last){dlgDismiss();talk([[name,reaction],...giftLessonLines(g,name)]);return;}
  (G.f.giftLessonQ||(G.f.giftLessonQ=[])).push({id:g.id,name});
}
// 대화 중간에 건넨 선물의 답례: 대화와 창이 모두 닫히고 잠깐 조용하면 잇는다
let giftLessonIdle=0;
setInterval(()=>{
  if(!G||!G.f?.giftLessonQ?.length)return;
  if(!G.started||G.ended||paused()){giftLessonIdle=0;return;}
  if(++giftLessonIdle<2)return;giftLessonIdle=0;
  const q=G.f.giftLessonQ.shift(),g=(TABLES.GIFT_RECIPES||[]).find(x=>x.id===q?.id);
  if(g&&g.region===G.region)talk(giftLessonLines(g,q.name));
},250);
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
    mung:P=>bowl(P,'#8f9c56'),jujube:P=>{P(4,5,8,7,'#9b4538');P(6,4,4,9,'#ac5040');P(5,6,2,2,'#d9956d');},
    // 결정 D-460: 모든 재료에 가공법을 두며 생긴 가공품 (design/proposals/recipes.md)
    gyeol_hwan:P=>{bowl(P,'#d8c7a0');for(const [x,y] of [[5,6],[8,5],[10,7],[6,8],[9,8]])P(x,y,2,2,'#6b4a2a');},
    kkot_cheong:P=>{bottle(P,'#8a5ca8');P(7,10,2,2,'#c79ad8');},
    solbang_cheong:P=>{bottle(P,'#7a6a32');P(7,10,2,2,'#4f4420');},
    sirumit:P=>{P(2,6,12,6,'#8a6a3a');P(3,7,10,4,'#c9a35e');for(let x=4;x<12;x+=2)P(x,7,1,4,'#9b7a45');P(3,9,10,1,'#e0c27a');},
    heuk_banjuk:P=>{P(3,7,10,6,'#7a5636');P(4,6,8,2,'#93683f');P(5,8,3,1,'#c9b48a');P(9,10,3,1,'#d9c58c');P(6,11,1,1,'#b9b2a6');P(10,8,1,1,'#b9b2a6');},
    jjimjil_dol:P=>{P(3,6,10,7,'#f4efe0');P(4,5,8,2,'#fbf8ee');P(5,8,6,3,'#6b625a');P(6,8,4,1,'#8a8178');P(4,12,8,1,'#d9d0b8');},
    dol_mulgam:P=>{P(4,8,8,4,'#684b37');P(5,7,6,2,'#2f6a5e');P(6,7,2,1,'#5aa08e');P(5,12,6,1,'#4a3526');},
    okgaru:P=>{bowl(P,'#d9ead9');P(6,6,1,1,'#ffffff');P(9,7,1,1,'#ffffff');},
    dubu:P=>{P(3,6,10,7,'#f2eee2');P(3,6,10,1,'#ffffff');P(3,12,10,1,'#d6cfbd');P(7,6,1,7,'#e2dccb');},
    jatjuk:P=>{bowl(P,'#efe4c8');P(6,7,1,1,'#c9a35e');P(9,7,1,1,'#c9a35e');},
    songibap:P=>{bowl(P,'#f4f0e4');P(6,4,4,2,'#9b6a3d');P(7,6,2,2,'#e6d6b8');},
    beoseot_jjim:P=>{bowl(P,'#c9a36a');P(5,6,2,2,'#e7c34a');P(9,6,2,2,'#e7c34a');P(7,5,2,2,'#efe2c8');},
    seogibyeong:P=>{for(const [x,y] of [[3,6],[8,8]]){P(x,y,6,5,'#4b4744');P(x,y,6,1,'#6b6763');P(x+1,y+2,1,1,'#8a8580');}},
    yaksik:P=>{P(3,5,10,8,'#7a4a24');P(3,5,10,1,'#9b6a3d');P(5,7,2,2,'#c99a5c');P(9,8,2,2,'#9b3a2c');P(6,10,2,1,'#c99a5c');},
    chik_sil:P=>{P(3,5,10,8,'#a88a5a');P(4,6,8,6,'#c9ad7a');P(5,7,6,4,'#a88a5a');P(6,8,4,2,'#d9c08a');P(12,11,2,1,'#c9ad7a');},
    darae_cha:P=>{bowl(P,'#7a7f3a');P(13,9,2,3,'#a77b52');P(7,7,2,1,'#b9452f');},
    hwachae:P=>{bowl(P,'#c5503a');P(5,6,2,2,'#e8f2fa');P(9,7,2,1,'#ffffff');P(7,5,2,1,'#d8e8f4');},
    bigeul_garu:P=>{bowl(P,'#bcdcee');P(6,6,1,1,'#ffffff');P(9,7,1,1,'#ffffff');P(7,8,1,1,'#88b0c8');}
  });
})();
