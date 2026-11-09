'use strict';
/* 대화: talk([[말하는이, 대사, 선택지?], ...], 끝나면). 선택지는 [{t:글, go:고르면 할 일}] */
let dlgScene=null,dlgQ=[],dlgEnd=null,dlgMusic=null,dlgPlan=null,dlgNextScene=null,dlgLonging=false,dlgGone={at:-1e9,music:null,longing:false};
/* 결정 D-233: 콜백·setTimeout으로 잠깐 닫혔다 다시 열리는 이어진 대화를 한 대화로 본다.
   닫힌 뒤 music_dialog_hold_ms 안에 다시 열리면 앞 대화의 곡·그리움을 잇고, 음악(game.js)도 그동안 덕킹과 곡을 그대로 둔다.
   예전엔 그 틈마다 BGM이 커졌다 작아지고, 아빠 곡이 지역 곡으로 갔다 돌아왔다. */
const dlgHeld=()=>performance.now()-dlgGone.at<TABLES.TUNING.music_dialog_hold_ms;
function dlgClosed(){dlgGone={at:performance.now(),music:dlgMusic,longing:dlgLonging};dlgMusic=null;dlgLonging=false;}
/* 결정 D-331: 대화창 닫기는 여기 하나로. 창·장면 그림·남은 줄·음악 기록을 함께 정리한다 (교환 단추·되감기도 이걸 쓴다) */
// 결정 D-920: 대화 창 크기(초상·글씨·여백)는 css/style.css 끝의 D-920 덩어리가 정한다. 독백 창(field.js think)도 같이 키웠다
function dlgDismiss(){$('dlg').hidden=true;dlgPic(null);dlgQ=[];dlgEnd=null;dlgClosed();dlgPlan=null;dlgScene=null;}
// 세 번째 인자는 지역의 전용 이야기 장면용이다. 기존 호출·선택지·종료 순서는 유지한다.
/* 결정 D-72: 장면별 곡(design/data/scene_music.csv). options.scene 또는 바로 앞의 sceneNext(id)로 장면을 고르면
   표의 곡을 시작줄부터 깐다. 장면이 없으면 지역 곡을 그대로 둔다(결정 D-1401: 예전 자동 규칙, 아빠가 나오면 아빠 곡·날쌘과 여러 줄이면 날쌘 곡은 뺐다). */
function sceneNext(id){dlgNextScene=id;setTimeout(()=>{if(dlgNextScene===id)dlgNextScene=null;},0);}   // 바로 이어지는 talk 한 번에만 쓴다
function talk(lines,onEnd,options={}){
  const scene=TABLES.SCENE_MUSIC?.[options.scene||dlgNextScene];dlgNextScene=null;
  const held=dlgHeld();
  if(scene){dlgPlan=lines.map((_,i)=>i>=scene.from?(scene.music||null):null);dlgMusic=dlgPlan[0];}
  else{dlgPlan=null;dlgMusic=options.music||(held?dlgGone.music:null);}   // 결정 D-1401: 화자로 곡을 고르지 않는다
  // 결정 D-234: 음악의 그리움은 줄마다가 아니라 대화 단위로 정한다 (줄마다 바꾸면 넘길 때마다 층 음량이 출렁였다)
  dlgLonging=lines.some(l=>l[0]==='아빠'||l[0]==='엄마'||/엄마|아빠/.test(l[1]||''))||(held&&dlgGone.longing);
  dlgQ=lines.slice();dlgEnd=onEnd||null;showLine();
}
function showLine(){
  if(dlgPlan){const i=dlgPlan.length-dlgQ.length;if(i<dlgPlan.length)dlgMusic=dlgPlan[i];}
  const L=dlgQ.shift();
  if(!L){const f=dlgEnd;dlgDismiss();if(f)f();return;}
  // 결정 D-600: 이름(#dlgWho)은 창 위 테두리의 꼬리표로 그린다(style.css). 이름이 빈 줄(지문)은 꼬리표도 숨는다
  $('dlg').hidden=false;$('dlgWho').textContent=L[0];fillDlgText($('dlgText'),L[1]);dlgShownAt=performance.now();
  if(L.hint){const R=G.f.recipeFrom||(G.f.recipeFrom={}),out=L.hint.slice(5);if(!R[out]&&L[0])R[out]=L[0];learn(L.hint);}   // 결정 D-461: 숨은 가공법 귀띔은 그 줄을 들은 순간 수첩에 적힌다 (arcs.js hintLine). 결정 D-1406: 일러 준 이를 남긴다
  if(typeof meetSpeaker==='function')meetSpeaker(L[0]);   // 결정 D-1428: 말한 인물은 이름표가 '?'에서 이름으로 (field.js)
  if(typeof L.on==='function')L.on();   // 결정 D-1420: 그 줄이 뜨는 순간의 연출(받은 물건 효과, 인물 모습 바뀜)
  if('pic' in L)dlgPic(L.pic);
  const face=$('dlgFace');face.innerHTML='';face.appendChild(portrait(L[0]));
  const ch=$('dlgChoices');ch.innerHTML='';
  if(L[2]){
    $('dlgNext').hidden=true;
    // 결정 D-701: 고르기 단추는 글 길이만큼, 가운데 정렬 (style.css .choices)
    L[2].forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.textContent=c.t;
      b.onclick=e=>{e.stopPropagation();if(dlgTouchLocked('choice'))return;Sound.choice(!!c.go);dlgDismiss();if(c.go)c.go();};ch.appendChild(b);});
    if(TOUCH){ch.classList.add('wait');const at=dlgShownAt;setTimeout(()=>{if(dlgShownAt===at)ch.classList.remove('wait');},TABLES.TUNING.dlg_touch_choice_lock_ms);}
    setTimeout(()=>{const f=ch.querySelector('button');if(f&&matchMedia('(pointer:fine)').matches)f.focus();},0);
  }else $('dlgNext').hidden=false;
  if(typeof placePeek==='function'){placePeek();requestAnimationFrame(placePeek);}   // 결정 D-151: 선택지로 대화창이 커지면 그림을 그 위로 비킨다
}
/* 결정 D-700: 대사는 문장 단위로 줄을 바꾼다 (사용자 피드백 2026-11-05: '개울 소리가 들'에서 줄이 끝난다).
   문장마다 한 덩어리(span.sent, style.css)로 감싸 그 줄에 다 들어가면 잇고, 안 들어가면 문장째 다음 줄로 넘긴다.
   문장 끝은 . ? ! … ~ 와 대사 속 줄바꿈(\n). 글자는 그대로 두어 textContent 는 원래 대사와 같다. 낱말 안에서는 끊지 않는다(keep-all). */
function fillDlgText(box,text){
  box.textContent='';
  let sent=null;
  const close=()=>{sent=null;};
  for(const part of String(text??'').split(/(\s+)/)){
    if(!part)continue;
    if(/^\s+$/.test(part)){box.appendChild(document.createTextNode(part));if(part.includes('\n'))close();continue;}
    if(!sent){sent=document.createElement('span');sent.className='sent';box.appendChild(sent);}
    else if(sent.lastChild&&sent.nextSibling)sent.appendChild(box.lastChild);   // 문장 안의 띄어쓰기는 그 문장 덩어리 안으로
    sent.appendChild(document.createTextNode(part));
    if(/[.?!…~][”"'’)\]」』]*$/.test(part))close();
  }
}
/* 결정 D-151: 대사 줄의 장면 그림. 줄 배열에 pic을 달면 그 줄부터 화면 가운데 작은 창에 띄우고,
   pic:null인 줄이 오거나 대화창이 닫히면 내린다. pic은 그리기 함수이거나 {draw, animate}. */
function dlgPic(pic){
  if(typeof peekPicture!=='function')return;
  if(!pic){peekRelease();return;}
  if(typeof pic==='function')peekPicture(pic);else peekPicture(pic.draw,pic);
}
/* 결정 D-235: NPC에게서 물건을 받으면 그 대화에 받은 것을 알리는 한 줄을 넣는다 (사용자 피드백 2026-11-02:
   "대화 끝에 뭔가를 얻으면 가방으로 들어온다. ~~을 얻었다로 표현"). 주인공 독백 꼴 '(메밀 두 개를 얻었다.)'.
   gotLine('memil',2) 는 줄만 만든다. receiveItem('memil',2) 는 보따리에 넣고 같은 줄을 돌려준다.
   여러 가지는 gotLine([['memil',2],['seogi',1]]) → '(메밀 두 개와 석이를 얻었다.)'. */
const KO_COUNT=['','한','두','세','네','다섯','여섯','일곱','여덟','아홉','열'];
function gotText(list){
  const words=list.map(([id,n=1])=>{const name=ITEMS[id]?ITEMS[id].n:id;return n>1?name+' '+(KO_COUNT[n]||n)+' '+(ITEMS[id]?.u||'개'):name;});   // 결정 D-238: 세는 말은 items.csv 세는말 칸
  const joined=words.reduce((a,w,i)=>i?jo(a,'과','와')+' '+w:w,'');
  return '('+jo(joined,'을','를')+' 얻었다.)';
}
// 결정 D-352: gotLine 줄은 받을 물건을 give로 들고 있다. talkGive·arcScene(arcs.js)이 대화 끝에 넣는다. receiveItem 줄은 이미 넣어서 given이다.
function gotLine(id,n=1){const list=Array.isArray(id)?id:[[id,n]];return Object.assign(['너구리',gotText(list)],{give:list});}
/* 결정 D-1420: receiveItem 은 물건을 곧바로 보따리에 넣되(중간에 대화가 닫혀도 받은 것은 남는다), 소리·날아가는 그림·알림은
   '(…을 얻었다.)' 줄이 뜰 때 낸다. 예전엔 대화를 여는 순간 터져서, 감나무 장면에서 도토리를 받기도 전에 도토리 효과가 떴다. */
function receiveItem(id,n=1){
  const L=gotLine(id,n),fx=L.give.map(([i,k=1])=>addItem(i,k,true));L.given=true;
  L.on=()=>{fx.forEach(f=>f&&f());L.on=null;};
  return L;
}
/* 결정 D-484: 휴대폰에서 대화가 너무 급하게 넘어갔다(사용자 피드백 2026-11-04). 글이 한 번에 뜨는데 탭에 아무 쉼이 없어서,
   빠르게 두 번 누르면 한 줄을 읽기도 전에 지나갔고, 넘기려고 누르던 자리에 선택지가 뜨면 그 탭이 곧바로 선택지를 골랐다.
   휴대폰(TOUCH)에서만: 새 줄이 뜬 뒤 dlg_touch_advance_lock_ms 동안은 넘기지 않고, 선택지는 dlg_touch_choice_lock_ms 뒤에야 눌린다(그동안 흐리게).
   키보드·마우스는 그대로다. */
let dlgShownAt=0;
function dlgTouchLocked(kind){
  if(!TOUCH)return false;
  const T=TABLES.TUNING,ms=kind==='choice'?T.dlg_touch_choice_lock_ms:T.dlg_touch_advance_lock_ms;
  return performance.now()-dlgShownAt<ms;
}
function advance(){if($('dlgChoices').children.length)return;if(dlgTouchLocked('advance'))return;Sound.paper();showLine();}
$('dlg').addEventListener('click',e=>{if(e.target.tagName!=='BUTTON')advance();});

/* 지역의 NPC: {id, name, x, talk(), draw(x,y,방향), props(npc)?, prompt?(말 걸기 대신 쓸 안내 글, 예: 숙소 마루에서 쉬기)} */
function nearNpc(){let best=null,bd=TABLES.TUNING.field_talk_distance;for(const n of fieldNpcs()){if(typeof npcMoving==='function'&&npcMoving(n))continue;const d=Math.abs(n.x-G.px);if(d<bd){bd=d;best=n;}}return best;}
function tryTalk(){tryInteract();}

/* 대화 초상: 캐릭터 그리기 함수를 작은 캔버스에 재사용. 주인공 그림은 '너구리'와 지문에만 쓴다.
   결정 D-162: 예전에는 지금 구역에 서 있는 인물만 찾아서, 다른 구역에서 불러온 대사나 자리를 옮기는 중인 인물
   (돌너머 뿔이: 마을에서 장승제를 기다릴 때)이 말하면 주인공 얼굴이 나왔다. 이제 지금 구역 → 이 지역 전체 → 다른 지역 순서로
   그 이름의 인물을 찾는다. 이름이 바뀌었거나 한 그림에 여럿이 있는 화자는 PORTRAIT_ALIAS 로 인물 id 에 잇는다.
   때를 타서만 나오는 인물(큰 장터 밤의 등잔발)은 지역이 Rg.portraits[이름]=그리기 함수 로 올려 둔다. */
const PORTRAIT_ALIAS={
  '뿔이':'ppuri','뿔영감':'ppuri',                        // 이름 바꾸는 중에도 같은 산양 그림
  '흰눈썹 노인':'j_yut','곰방대 노인':'j_yut',             // 바둑판의 두 노인은 한 그림(바둑 노인들, 결정 D-325)
  '까치':'old_magpie',                                    // 까치 답장(deliverHomeReply)은 늙은 까치 그림
  '아빠의 옛 기록':'dad',                                 // 아빠가 남긴 글은 아빠 얼굴
};
/* 한 지역의 말하는 인물 후보: 고정 인물, 구역별 인물·떠돌이, 확장 만남 */
function portraitCandidates(r){
  const list=[...(r.npcs||[]),...(r.wanderers||[])];
  for(const z of Object.values(r.zones||{})){
    try{for(const n of z.npcs||[])list.push(typeof n==='string'?(r.npcs||[]).find(a=>a.id===n):n);}catch(_){}
    try{list.push(...(z.wanderers||[]));}catch(_){}
  }
  for(const l of Object.values(r.expEncounters?.wanderers||{}))if(Array.isArray(l))list.push(...l);
  return list.filter(n=>n&&typeof n.draw==='function');
}
function portraitNpc(name){
  if(!name||name==='너구리'||/^[（(]/.test(name))return null;
  // 결정 D-328: 지금 지역이 그 이름으로 직접 올린 초상(Rg.portraits)이 먼저다. 한 그림에 여럿이 있는 떠돌이(투호 노인들)도 말하는 사람 얼굴이 나온다.
  const own=REG?.portraits?.[name];if(typeof own==='function')return {id:name,name,draw:own};
  const id=PORTRAIT_ALIAS[name];
  const hit=n=>n&&typeof n.draw==='function'&&(n.name===name||n.speakers?.includes(name)||(id&&n.id===id));
  const here=[...fieldNpcs(),...zoneObjects('wanderers')].find(hit);if(here)return here;
  const order=[REG,...regionList().filter(r=>r!==REG)];
  for(const r of order){const n=portraitCandidates(r).find(hit);if(n)return n;}
  for(const r of order){const d=r.portraits?.[name];if(typeof d==='function')return {id:name,name,draw:d};}
  return null;
}
function portrait(name){
  const c=document.createElement('canvas');c.width=30;c.height=24;
  const save=ctx;ctx=c.getContext('2d');
  // speakers: 한 그림에 둘이 있는 인물(다람쥐 형제)은 한 사람씩 말한다. 초상은 같은 그림을 쓴다.
  const n=portraitNpc(name);
  try{if(n)n.draw(15,30,1);else drawPlayerAt(16,31,1,0,0,heldTool());}   // 변신한 채면 그 모습 (forms.js)
  finally{ctx=save;}
  return c;
}
