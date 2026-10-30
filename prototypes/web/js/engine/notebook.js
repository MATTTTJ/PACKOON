'use strict';
/* 아빠의 수첩: 젊은 아빠가 남긴 그림·메모·도장 위에 아이가 이어 적는 한 권 (N·B 키, 화면의 수첩 버튼).
   동물·물건·도장 쪽에는 아빠의 줄(흐린 옛 먹, 아빠 그림)과 아이의 줄(새 먹)이 한 쪽에 같이 놓인다.
   일기·단서·별명·손버릇·숨은 가공법·까치 답장·엄마의 쪽지·장부는 아이가 이어 적은 장이다 (그리기는 book.js).

   쪽 하나: {id, kind:'animal'|'item'|'stamp', name?, lines:[{who:'dad'|'me', text, when?, section}], dadDrawing?:true}
   - id 는 NPC·전투 상대·아이템 id (npcs.csv · bosses.csv · items.csv, 원본은 design/data/notebook.csv)
   - who:'dad' 이고 when 이 없으면 처음부터 보인다. when 이 있으면 learn(when) 된 뒤에 보인다
   - section 은 notebook.csv 의 기록갈래: 관찰 줄은 그 쪽에, 손버릇·숨은 가공법 줄은 같은 이름의 장에 놓인다
   - 엔진이 저절로 learn 하는 것: 'met:<npc>' 처음 말 걸기, 'fight:<상대>' 전투 시작, 'got:<아이템>' 처음 얻기,
     'like:<상대>:<아이템>' 전투에서 좋아하는 선물, 'core:<상대>' 핵심 부위가 드러남, 'calm:<상대>' 달래서 끝냄
   - 지역 기믹은 지역 코드가 learn('<키>') 를 부른다 */
const NOTES={};
/* 같은 쪽(예: 여러 지역에 나오는 날쌘)이 다시 오면 줄만 이어 붙인다. 쪽은 처음 정의한 지역에 놓인다 */
function defineNotes(region,list){list.forEach(e=>{if(NOTES[e.id])NOTES[e.id].lines.push(...e.lines);else NOTES[e.id]=Object.assign({region},e);});}
const knows=k=>(G.learned||[]).includes(k);
function noteName(e){return e.name||(e.kind==='item'?ITEMS[e.id].n:(ENEMIES[e.id]&&!npcFind(e.id)?ENEMIES[e.id].name:npcName(e.id)));}
function npcFind(id){for(const r of regionList()){const n=(r.npcs||[]).find(n=>n.id===id);if(n)return n;}return null;}
const lineShown=l=>l.when?knows(l.when):l.who==='dad';
const seen=e=>knows('met:'+e.id)||knows('fight:'+e.id)||knows('got:'+e.id);
/* 아빠가 적어 둔 쪽: 아빠 그림이 있거나 아빠 줄이 하나라도 보인다 */
const pageShown=e=>e.dadDrawing||e.lines.some(l=>l.who==='dad'&&lineShown(l));
const dadLinesOf=e=>e.lines.filter(l=>l.who==='dad'&&lineShown(l));
const gotItem=e=>e.kind==='item'&&!!ITEMS[e.id]&&knows('got:'+e.id);
/* 아이가 그 쪽에 적은 줄. 관찰이면 처음 얻은 물건의 생김새(items.csv 설명)도 아이가 적은 줄로 친다 */
function myTexts(e,section){
  const t=e.lines.filter(l=>l.who!=='dad'&&lineShown(l)&&(l.section||childNoteSection(l))===section).map(l=>l.text);
  if(section==='관찰'&&gotItem(e))t.unshift(ITEMS[e.id].d);
  return t;
}
/* 새로 알게 된 것. 그 덕에 수첩에 새 줄이 생기면 알려 준다 (quiet 면 조용히) */
function learn(k,quiet){
  if(!G||knows(k))return false;(G.learned||(G.learned=[])).push(k);
  const e=Object.values(NOTES).find(e=>e.lines.some(l=>l.when===k));
  if(e&&!quiet){const dad=e.lines.some(l=>l.when===k&&l.who==='dad');setTimeout(()=>toast((dad?'아빠 수첩을 펼쳤다 · ':'수첩에 이어 적었다 · ')+noteName(e)),1400);}
  if(!$('notebook').hidden)renderNotebook();
  return true;
}

/* 그림: 아빠 그림은 먹으로 흐리게, 내 그림은 색으로 */
function inkCanvas(c){const x=c.getContext('2d');const d=x.getImageData(0,0,c.width,c.height);const p=d.data;
  for(let i=0;i<p.length;i+=4){if(!p[i+3])continue;const l=(0.3*p[i]+0.59*p[i+1]+0.11*p[i+2])/255;p[i]=38;p[i+1]=29;p[i+2]=22;p[i+3]=Math.round(255*Math.min(1,(1-l)*0.95+0.12));}
  x.putImageData(d,0,0);return c;}
function spriteCanvas(n){const c=document.createElement('canvas');c.width=30;c.height=24;const save=ctx;ctx=c.getContext('2d');n.draw(15,30,1);ctx=save;return c;}
/* 전투 상대의 수묵 그림을 작게: 잠깐 가짜 전투 상태로 그린다 */
function enemyCanvas(kind){
  const E=ENEMIES[kind];const c=document.createElement('canvas');c.width=400;c.height=250;const g=c.getContext('2d');
  const saved={B,LW,LH,EY};
  B={E,parts:E.parts.map(p=>Object.assign({},p,{max:p.hp,broken:false,shake:0})),st:'idle',t:0,time:0,cur:null,px:400,py:330,result:null};
  LW=800;LH=450;EY=150;
  try{g.scale(0.5,0.5);E.draw(g);}catch(_){}
  ({B,LW,LH,EY}=saved);
  return cropCanvas(c,'boss');
}
/* 그림 둘레의 빈 곳을 잘라 낸다 */
function cropCanvas(c,cls){
  const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=0,y1=0;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>20){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  if(x1<x0)return c;const o=document.createElement('canvas');o.width=x1-x0+5;o.height=y1-y0+5;o.getContext('2d').drawImage(c,x0-2,y0-2,o.width,o.height,0,0,o.width,o.height);
  if(cls)o.className=cls;return o;
}
function drawingFor(e,dad){
  if(e.kind==='item'){const c=icon(e.id,dad);return c;}
  const n=npcFind(e.id);
  if(n){const c=spriteCanvas(n);return dad?inkCanvas(c):c;}
  if(ENEMIES[e.id])return enemyCanvas(e.id);
  return null;
}

/* 탭: 앞의 셋은 아빠와 같이 쓰는 쪽, 나머지는 아이가 이어 적은 장. 탭 선택은 저장하지 않는다 */
const NOTE_TABS=[['animal','동물',1],['item','물건',1],...(CLASSIC?[]:[['stamp','도장',1]]),
  ['diary','일기'],['clues','아빠 단서'],['nicknames','불리는 이름'],['habits','손버릇'],['recipes','숨은 가공법'],['replies','까치 답장'],['mom','엄마의 쪽지'],['ledger','물품 장부']];
const PAGE_SECTION={animal:'관찰',item:'관찰',stamp:'관찰',habits:'손버릇',recipes:'숨은 가공법'};
let noteTab='animal';
// 너구리의 책이 따로 있던 때의 이름(bookTab)도 같은 탭을 가리킨다. 없어진 관찰 탭은 동물 쪽으로 간다
Object.defineProperty(window,'bookTab',{configurable:true,get:()=>noteTab,set:v=>{noteTab=v==='observations'?'animal':v;}});
{
  const tabs=$('noteTabs');tabs.innerHTML='';
  NOTE_TABS.forEach(([id,name,dad],i)=>{
    if(i&&!dad&&NOTE_TABS[i-1][2]){const s=el('span','tab-sep');s.setAttribute('aria-hidden','true');tabs.appendChild(s);}
    const b=el('button',dad?'dad-tab':'me-tab',name);b.type='button';b.dataset.tab=id;b.setAttribute('role','tab');
    b.onclick=()=>{if(noteTab!==id)Sound.tab();noteTab=id;renderNotebook();$('noteBody').scrollTop=0;};
    tabs.appendChild(b);
  });
}
function toggleNote(){const o=$('notebook').hidden;closePanels();if(o){Sound.panel(true);renderNotebook();$('notebook').hidden=false;$('noteBody').scrollTop=0;}}
/* 옛 이름: 너구리의 책이 따로 있던 때 부르던 함수도 이 수첩을 연다 */
function toggleBook(){toggleNote();}
function renderBook(){renderNotebook();}
$('btnNote').onclick=()=>{if(G.started&&!open('dlg')&&!openMinigame())toggleNote();};
$('noteClose').onclick=closePanels;
/* 첫 지역에 처음 들어설 때 한 번: 엄마의 쪽지 장을 펼친다 */
function showMomNote(){
  if(G.f.momNoteSeen)return false;
  G.f.momNoteSeen=true;noteTab='mom';closePanels();renderNotebook();$('notebook').hidden=false;$('noteBody').scrollTop=0;Sound.paper();return true;
}

/* 보이는 것만 센다: 아빠가 적어 둔 쪽 수와 아이가 이어 적은 줄 수 */
function noteTally(){
  const pages=Object.values(NOTES);
  const dad=pages.filter(e=>(!CLASSIC||e.kind!=='stamp')&&pageShown(e)).length;
  const mine=pages.reduce((n,e)=>n+e.lines.filter(l=>l.who!=='dad'&&lineShown(l)).length+(gotItem(e)?1:0),0)
    +G.diary.length+G.clues.length+(G.nicknames||[]).length+Object.keys(G.ledger||{}).length;
  return {dad,mine};
}
/* 쪽 하나: 아빠 그림·줄 아래에 아이의 그림·줄 */
function notePage(e,section){
  const dad=section==='관찰'?dadLinesOf(e):[],mine=myTexts(e,section);
  const card=el('div','note-card'),pics=el('div','note-pics');
  if(section==='관찰'&&(e.dadDrawing||(e.kind!=='item'&&npcFind(e.id)&&dad.length))){const d=drawingFor(e,true);if(d){d.classList.add('dad');pics.appendChild(d);}}
  // 전투 상대의 수묵 그림은 한 장이면 된다
  if(mine.length&&!(pics.children.length&&ENEMIES[e.id]&&!npcFind(e.id))){const d=drawingFor(e,false);if(d){d.classList.add('me');pics.appendChild(d);}}
  if(pics.children.length)card.appendChild(pics);
  card.appendChild(el('b','note-name',noteName(e)));
  const write=(cls,who,texts)=>{const box=el('div','note-lines '+cls);texts.forEach(t=>{const p=el('p','note-line '+(who==='아빠'?'dad':'me'));p.appendChild(el('span','who',who));p.appendChild(document.createTextNode(t));box.appendChild(p);});card.appendChild(box);};
  if(dad.length)write('dad-ink','아빠',dad.map(l=>l.text));
  if(mine.length)write('my-ink','나',mine);
  else if(dad.length){const gap=el('div','my-ink blank');gap.setAttribute('aria-hidden','true');card.appendChild(gap);}
  return card;
}
function renderPages(body,section,kind){
  let shown=false;
  for(const r of regionList()){
    const pages=Object.values(NOTES).filter(e=>e.region===r.id&&(kind?e.kind===kind&&(pageShown(e)||myTexts(e,section).length):myTexts(e,section).length));
    if(!pages.length)continue;shown=true;
    body.appendChild(el('div','note-region',r.name+(kind==='stamp'?' · '+stampCount(r.id)+'개':'')));
    const grid=el('div','note-grid');pages.forEach(e=>grid.appendChild(notePage(e,section)));body.appendChild(grid);
  }
  if(!shown)body.appendChild(el('p','empty-note',section==='손버릇'?'가보로 만들어 보며 손에 남는 것을 적는다.':section==='숨은 가공법'?'재료를 직접 넣어 찾은 맛을 여기에 적는다.':'여행하며 보고 들은 것을 여기에 적는다.'));
}
function renderNotebook(){
  if(!NOTE_TABS.some(t=>t[0]===noteTab))noteTab='animal';
  document.querySelectorAll('#noteTabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===noteTab));
  const {dad,mine}=noteTally();$('noteTally').textContent='아빠가 적은 쪽 '+dad+' · 내가 이어 적은 줄 '+mine;
  const body=$('noteBody');const sc=body.scrollTop;body.innerHTML='';
  if(noteTab==='stamp')body.appendChild(el('p','small','찾은 아빠 도장 · 전체 '+stampCount()+'개'));
  if(PAGE_SECTION[noteTab])renderPages(body,PAGE_SECTION[noteTab],['animal','item','stamp'].includes(noteTab)?noteTab:null);
  else renderChildRecord(body,noteTab);
  body.scrollTop=sc;
}
