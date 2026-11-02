'use strict';
/* 대화: talk([[말하는이, 대사, 선택지?], ...], 끝나면). 선택지는 [{t:글, go:고르면 할 일}] */
let dlgQ=[],dlgEnd=null,dlgMusic=null,dlgPlan=null,dlgNextScene=null,dlgLonging=false,dlgGone={at:-1e9,music:null,longing:false};
/* 결정 D-233: 콜백·setTimeout으로 잠깐 닫혔다 다시 열리는 이어진 대화를 한 대화로 본다.
   닫힌 뒤 music_dialog_hold_ms 안에 다시 열리면 앞 대화의 곡·그리움을 잇고, 음악(game.js)도 그동안 덕킹과 곡을 그대로 둔다.
   예전엔 그 틈마다 BGM이 커졌다 작아지고, 아빠 곡이 지역 곡으로 갔다 돌아왔다. */
const dlgHeld=()=>performance.now()-dlgGone.at<TABLES.TUNING.music_dialog_hold_ms;
function dlgClosed(){dlgGone={at:performance.now(),music:dlgMusic,longing:dlgLonging};dlgMusic=null;dlgLonging=false;}
// 세 번째 인자는 지역의 전용 이야기 장면용이다. 기존 호출·선택지·종료 순서는 유지한다.
/* 결정 D-72: 장면별 곡(design/data/scene_music.csv). options.scene 또는 바로 앞의 sceneNext(id)로 장면을 고르면
   표의 곡을 시작줄부터 깐다. 장면이 없으면 예전 자동 규칙(아빠가 나오면 아빠 곡, 날쌘과 여러 줄이면 날쌘 곡)이다. */
function sceneNext(id){dlgNextScene=id;setTimeout(()=>{if(dlgNextScene===id)dlgNextScene=null;},0);}   // 바로 이어지는 talk 한 번에만 쓴다
function talk(lines,onEnd,options={}){
  const scene=TABLES.SCENE_MUSIC?.[options.scene||dlgNextScene];dlgNextScene=null;
  const held=dlgHeld();
  if(scene){dlgPlan=lines.map((_,i)=>i>=scene.from?(scene.music||null):null);dlgMusic=dlgPlan[0];}
  else{dlgPlan=null;dlgMusic=options.music||(lines.some(l=>l[0]==='아빠')?'father':lines.length>1&&lines.some(l=>l[0]==='날쌘')?'nalsaen':null)||(held?dlgGone.music:null);}
  // 결정 D-234: 음악의 그리움은 줄마다가 아니라 대화 단위로 정한다 (줄마다 바꾸면 넘길 때마다 층 음량이 출렁였다)
  dlgLonging=lines.some(l=>l[0]==='아빠'||l[0]==='엄마'||/엄마|아빠/.test(l[1]||''))||(held&&dlgGone.longing);
  dlgQ=lines.slice();dlgEnd=onEnd||null;showLine();
}
function showLine(){
  if(dlgPlan){const i=dlgPlan.length-dlgQ.length;if(i<dlgPlan.length)dlgMusic=dlgPlan[i];}
  const L=dlgQ.shift();
  if(!L){$('dlg').hidden=true;dlgPic(null);dlgClosed();dlgPlan=null;const f=dlgEnd;dlgEnd=null;if(f)f();return;}
  $('dlg').hidden=false;$('dlgWho').textContent=L[0];$('dlgText').textContent=L[1];
  if('pic' in L)dlgPic(L.pic);
  const face=$('dlgFace');face.innerHTML='';face.appendChild(portrait(L[0]));
  const ch=$('dlgChoices');ch.innerHTML='';
  if(L[2]){
    $('dlgNext').hidden=true;
    L[2].forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.textContent=c.t;
      b.onclick=e=>{e.stopPropagation();Sound.choice(!!c.go);$('dlg').hidden=true;dlgPic(null);dlgQ=[];dlgEnd=null;dlgClosed();dlgPlan=null;if(c.go)c.go();};ch.appendChild(b);});
    setTimeout(()=>{const f=ch.querySelector('button');if(f&&matchMedia('(pointer:fine)').matches)f.focus();},0);
  }else $('dlgNext').hidden=false;
  if(typeof placePeek==='function'){placePeek();requestAnimationFrame(placePeek);}   // 결정 D-151: 선택지로 대화창이 커지면 그림을 그 위로 비킨다
}
/* 결정 D-151: 대사 줄의 장면 그림. 줄 배열에 pic을 달면 그 줄부터 화면 가운데 작은 창에 띄우고,
   pic:null인 줄이 오거나 대화창이 닫히면 내린다. pic은 그리기 함수이거나 {draw, animate}. */
function dlgPic(pic){
  if(typeof peekPicture!=='function')return;
  if(!pic){peekRelease();return;}
  if(typeof pic==='function')peekPicture(pic);else peekPicture(pic.draw,pic);
}
function advance(){if($('dlgChoices').children.length)return;Sound.paper();showLine();}
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
  '흰눈썹 노인':'j_yut','곰방대 노인':'j_yut',             // 윷판의 두 노인은 한 그림(윷놀이 노인들)
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
