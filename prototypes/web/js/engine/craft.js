'use strict';
/* 가공 결과는 bag.js에서 시작할 때 확정한다. 이 손놀림은 말과 소리만 바꾼다. */
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
function startCraftHands(tool,recipe,discovered){
  cancelAnimationFrame(craftFrame);
  craftHands={owner:G,region:G.region,tool,recipe,discovered,cfg:TABLES.CRAFT[tool],
    count:0,good:true,time:0,turn:0,lastDir:null,last:performance.now(),lastHit:null,restAt:null,paused:document.hidden||!document.hasFocus()};
  craftFrame=requestAnimationFrame(stepCraftHands);
}
function finishCraftHands(redraw=true){
  const h=craftHands;if(!h)return;
  cancelAnimationFrame(craftFrame);craftHands=null;brewing=false;
  if(G!==h.owner||G.region!==h.region)return;
  Sound.craft();lastOut=h.recipe.out;
  const voices={
    jeolgu:['세 번 찧고, 한 번 쉬고. 엄마처럼 했다.','절구 손잡이가 손에 꼭 맞는다.'],
    maetdol:['왼쪽으로. 증조할아버지 손도 이랬겠지.','맷돌이 느긋하게 한 바퀴 돌았다.'],
    siru:['김이 오를 때 톡. 엄마 냄새가 난다.','뚜껑을 열자 따뜻한 김이 났다.'],
    yakyeon:['끝에 한 번 거꾸로. 아빠 손을 따라 했다.','약연 바퀴에 아빠 손때가 남아 있다.']
  };
  const matched=h.count>=h.cfg.steps&&h.good;
  if(matched)Sound.gather(true);
  pouchMsg=voices[h.tool][matched?0:1]+' '+ITEMS[h.recipe.out].n+' '+h.recipe.n+'개 완성.'+
    (h.discovered?' 찾은 가공법을 수첩에 적었다.':'');
  if(redraw&&open('bag'))renderBag();
}
function craftHandInput(direction){
  const h=craftHands;if(!h||h.owner!==G||h.region!==G.region||h.paused)return;
  if(h.restAt!==null){h.good=false;finishCraftHands();return;}
  const {tool,cfg}=h;
  if(tool==='jeolgu'){
    if(h.lastHit!==null&&Math.abs(h.time-h.lastHit-cfg.intervalMs)>cfg.windowMs)h.good=false;
    h.lastHit=h.time;Sound.forge('hit');
  }else if(tool==='maetdol'){
    if(direction!=='left')h.good=false;h.turn+=direction==='left'?-cfg.turnDegrees:cfg.turnDegrees;Sound.stone('place');
  }else if(tool==='siru'){
    if(Math.abs(h.time-cfg.steamMs)>cfg.windowMs)h.good=false;Sound.steam('tap');
  }else{
    if(direction!==(h.count===cfg.steps-1?'left':'right'))h.good=false;Sound.paper();
  }
  h.lastDir=direction;h.count++;
  const figure=$('craftFigure');if(figure&&tool==='jeolgu'){figure.classList.remove('pound');void figure.offsetWidth;figure.classList.add('pound');}
  if(h.count>=cfg.steps){
    if(tool==='jeolgu')h.restAt=h.time;else{finishCraftHands();return;}
  }
  updateCraftHands();
}
function stepCraftHands(now){
  const h=craftHands;if(!h)return;
  if(h.owner!==G||h.region!==G.region||!open('bag')){finishCraftHands(false);return;}
  if(!h.paused&&!document.hidden)h.time+=now-h.last;
  h.last=now;
  if(h.restAt!==null&&h.time-h.restAt>=h.cfg.restMs){finishCraftHands();return;}
  updateCraftHands();craftFrame=requestAnimationFrame(stepCraftHands);
}
function updateCraftHands(){
  const h=craftHands,box=$('craftHands');if(!h||!box)return;
  const cfg=h.cfg;
  let cue='',ratio=0;
  if(h.paused)cue='잠깐 손을 쉬는 중. 돌아오면 이어 한다.';
  else if(h.tool==='jeolgu'){
    if(h.restAt!==null){cue='한 번 쉬기. 손잡이를 놓고 기다린다.';ratio=(h.time-h.restAt)/cfg.restMs;}
    else{cue='세 번 찧기 · '+h.count+'/'+cfg.steps+' · J / X / Space';ratio=h.lastHit===null?1:Math.min(1,(h.time-h.lastHit)/cfg.intervalMs);}
  }else if(h.tool==='maetdol'){
    cue='왼쪽으로 돌리기 · '+h.count+'/'+cfg.steps+' · ← → / A D';ratio=h.count/cfg.steps;
  }else if(h.tool==='siru'){
    cue=h.time<cfg.steamMs-cfg.windowMs?'김이 오르는 중… 뚜껑을 보고 기다려 보자.':
      h.time<=cfg.steamMs+cfg.windowMs?'김이 올랐다. 지금 뚜껑을 톡!':'김은 충분하다. 언제 눌러도 잘 익는다.';
    ratio=Math.min(1,h.time/cfg.steamMs);
  }else{cue=(h.count===cfg.steps-1?'마지막에는 거꾸로 ← / A':'앞으로 굴리기 → / D')+' · '+h.count+'/'+cfg.steps;ratio=h.count/cfg.steps;}
  const caption=$('craftCue');if(caption&&caption.textContent!==cue)caption.textContent=cue;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shown=reduced?(h.tool==='siru'?(h.time>=cfg.steamMs?1:0):h.count/cfg.steps):ratio;
  const meter=$('craftMeter');if(meter){meter.style.width=(clamp(shown,0,1)*100)+'%';meter.parentElement.setAttribute('aria-valuenow',Math.round(clamp(shown,0,1)*100));}
  box.dataset.rest=String(h.restAt!==null);
  box.dataset.steam=String(h.tool==='siru'&&h.time>=cfg.steamMs-cfg.windowMs);
  const figure=$('craftFigure');if(figure){figure.style.setProperty('--craft-turn',h.turn+'deg');figure.dataset.direction=h.lastDir||'';}
}
function renderCraftHands(wrap){
  const h=craftHands;if(!h||h.owner!==G)return;
  const box=el('section','craft-hands');box.id='craftHands';box.dataset.tool=h.tool;box.setAttribute('aria-label','가보 손맛');
  box.appendChild(el('p','small','솜씨가 달라도 완성품은 같다. 창을 닫아도 보따리에 남는다.'));
  const cue=el('p','craft-cue');cue.id='craftCue';cue.setAttribute('role','status');box.appendChild(cue);
  const figure=el('div','craft-figure');figure.id='craftFigure';figure.setAttribute('aria-hidden','true');figure.appendChild(icon(h.tool));
  if(h.tool==='siru'){const steam=el('span','craft-vapor');for(let i=0;i<3;i++)steam.appendChild(el('i'));figure.appendChild(steam);}
  box.appendChild(figure);
  const track=el('div','craft-track');track.setAttribute('role','progressbar');track.setAttribute('aria-label','손놀림 여유');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');
  const meter=el('div');meter.id='craftMeter';track.appendChild(meter);box.appendChild(track);
  const actions=el('div','craft-actions');
  const directions=h.tool==='maetdol'||h.tool==='yakyeon';
  const labels=h.tool==='maetdol'?['왼쪽으로 돌리기','오른쪽으로 돌리기']:['거꾸로 굴리기','앞으로 굴리기'];
  if(directions){
    ['left','right'].forEach((dir,i)=>{const b=el('button','btn',labels[i]);b.type='button';b.dataset.craft=dir;b.onclick=()=>craftHandInput(dir);actions.appendChild(b);});
  }else{
    const b=el('button','btn primary',h.tool==='jeolgu'?'절구 찧기 · J / X':'뚜껑 두드리기 · J / X');b.type='button';b.dataset.craft='tap';b.onclick=()=>craftHandInput('tap');actions.appendChild(b);
  }
  box.appendChild(actions);
  if(directions){
    const pad=el('div','craft-drag',h.tool==='maetdol'?'여기에 왼쪽으로 원을 그려도 된다.':'여기를 앞뒤로 밀어도 된다.');
    pad.setAttribute('aria-hidden','true');let drag=null;
    pad.onpointerdown=e=>{e.preventDefault();const r=pad.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,cx:r.left+r.width/2,cy:r.top+r.height/2,angle:Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2),arc:0};pad.setPointerCapture(e.pointerId);};
    pad.onpointermove=e=>{
      if(!drag||drag.id!==e.pointerId||!craftHands)return;
      if(h.tool==='maetdol'){
        const angle=Math.atan2(e.clientY-drag.cy,e.clientX-drag.cx);let d=angle-drag.angle;
        if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;drag.angle=angle;drag.arc+=d;
        if(Math.abs(drag.arc)>=h.cfg.turnDegrees*Math.PI/180){craftHandInput(drag.arc<0?'left':'right');drag.arc=0;}
      }else if(Math.abs(e.clientX-drag.x)>=h.cfg.dragPx){craftHandInput(e.clientX<drag.x?'left':'right');drag.x=e.clientX;}
    };
    pad.onpointerup=pad.onpointercancel=pad.onlostpointercapture=()=>{drag=null;};box.appendChild(pad);
  }
  wrap.appendChild(box);updateCraftHands();
}
// 기존 행동키만 가공대 안에서 받는다. 반복 keydown은 한 번만 센다.
addEventListener('keydown',e=>{
  if(!craftHands||!open('bag')||e.target.matches('input,textarea,select')||e.target.isContentEditable)return;
  const k=e.key.toLowerCase();
  if([' ','enter'].includes(k)&&e.target.matches('[data-craft]')){
    e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)e.target.click();return;
  }
  const action=craftHands.tool==='maetdol'||craftHands.tool==='yakyeon';
  const dir=['arrowleft','a'].includes(k)?'left':['arrowright','d'].includes(k)?'right':null;
  if(!(action?dir:['j','x',' '].includes(k)))return;
  if(k===' '&&e.target.matches('button'))return;
  e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)craftHandInput(dir||'tap');
},true);
function pauseCraftHands(paused){if(craftHands){craftHands.paused=paused;craftHands.last=performance.now();craftHands.lastHit=null;updateCraftHands();}}
addEventListener('blur',()=>pauseCraftHands(true));
addEventListener('focus',()=>pauseCraftHands(document.hidden));
document.addEventListener('visibilitychange',()=>pauseCraftHands(document.hidden||!document.hasFocus()));

/* 인물 사연과 지역 대화도 같은 표를 조회한다. 불명인 취향은 null이다. */
function tasteOf(who,item){return TABLES.TASTES[who]?.[item]||null;}
function isHomeCraft(item){return Object.values(RECIPES).some(list=>list.some(r=>r.optional&&r.out===item));}
function sendCraftHome(item){
  if(brewing||!G.started||G.ended||!has(item)||!isHomeCraft(item)||knows('home:'+G.region))return;
  returnPouch();
  const after={...G.inv,[item]:G.inv[item]-1};
  if(progressShortage(after)>progressShortage(G.inv)){pouchMsg='먼저 쓸 몫을 남긴 뒤 엄마에게 보내자.';renderBag();return;}
  const key='home:'+G.region,name=ITEMS[item].n;
  takeItem(item,1);learn(key,true);closePanels();
  diary(key,name+' 하나를 까치 편에 집으로 보냈다. 한참 뒤 돌아온 까치가 엄마가 두 손을 포개고 볼에 댄 모습을 흉내 냈다.');
  talk([['너구리',name+' 하나야. 엄마한테 내가 만들었다고 전해 줘.'],
    ['너구리','(한참 뒤, 까치가 돌아와 두 날개를 포개고 볼에 댄다.)'],
    ['너구리','엄마가 이렇게 했어? …엄마 손도 따뜻했겠다.']]);
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
