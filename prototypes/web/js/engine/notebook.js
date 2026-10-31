'use strict';
/* 아빠의 수첩: 젊은 아빠가 남긴 메모·도장 위에 아이가 이어 적는 한 권 (N·B 키, 화면의 수첩 버튼).
   동물·물건·도장 쪽에는 아빠의 줄(흐린 옛 먹, 글만)과 아이의 줄(새 먹)이 한 쪽에 같이 놓인다.
   결정 D-61: 그림은 아이가 직접 보고 겪은 것만 아이 손으로 그린다(크레용 그림). 보기 전에는 빈 칸이다.
   불리는 이름·익힌 솜씨·숨은 가공법·장부는 아이가 이어 적은 장이다 (그리기는 book.js).
   아빠 단서와 엄마의 쪽지는 보따리의 '중요' 탭에 있다 (bag.js). 일기·까치 답장 장은 없앴고 기록(G.diary)은 진행 판정에 그대로 쓴다.

   쪽 하나: {id, kind:'animal'|'item'|'stamp', name?, lines:[{who:'dad'|'me', text, when?, section}], dadDrawing?:true}
   - id 는 NPC·전투 상대·아이템 id (npcs.csv · bosses.csv · items.csv, 원본은 design/data/notebook.csv)
   - who:'dad' 이고 when 이 없으면 처음부터 보인다. when 이 있으면 learn(when) 된 뒤에 보인다
   - section 은 notebook.csv 의 기록갈래: 관찰 줄은 그 쪽에, 익힌 솜씨·숨은 가공법 줄은 같은 이름의 장에 놓인다
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
/* 아빠가 적어 둔 쪽: 아빠가 이름을 적어 둔 쪽(notebook.csv 비고 '아빠 그림 있음' → dadDrawing)이거나 아빠 줄이 하나라도 보인다 */
// 결정 D-101: 아빠의 쪽은 그 지역에 닿은 뒤에야 펼친다(앞 지역 이야기를 미리 보이지 않게). 첫 지역은 처음부터 펼쳐 있다.
const noteRegionOpen=id=>!id||!REGIONS[id]||(REGIONS[id].order||1)<=(REGIONS[G?.region]?.order||1)||!!(G?.visitedZones?.[id]&&Object.keys(G.visitedZones[id]).length);
const pageShown=e=>noteRegionOpen(e.region)&&(e.dadDrawing||e.lines.some(l=>l.who==='dad'&&lineShown(l)));
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

/* 아이의 그림: 본 모습을 세 배로 옮겨 그리고, 크레용 결(종이가 비치는 자리)과 흔들리는 연필 윤곽을 더한다.
   같은 쪽은 늘 같은 그림이 되도록 쪽 id로 정한 씨앗을 쓴다. */
function seedOf(s){let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0||1;}
function crayonCanvas(src,seed){
  const s=3,w=src.width,h=src.height,sd=src.getContext('2d').getImageData(0,0,w,h).data;
  const o=document.createElement('canvas');o.width=w*s+8;o.height=h*s+8;const g=o.getContext('2d');
  const od=g.createImageData(o.width,o.height),p=od.data;let r=seed>>>0||1;const rnd=()=>((r=(Math.imul(r,1103515245)+12345)>>>0)/4294967296);
  const A=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&sd[(y*w+x)*4+3]>40;
  const put=(x,y,R,G,B,a)=>{if(x<0||y<0||x>=o.width||y>=o.height)return;const i=(y*o.width+x)*4;p[i]=R;p[i+1]=G;p[i+2]=B;p[i+3]=a;};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    if(!A(x,y))continue;const i=(y*w+x)*4,R=sd[i],G=sd[i+1],B=sd[i+2];
    for(let yy=0;yy<s;yy++)for(let xx=0;xx<s;xx++){
      const X=4+x*s+xx,Y=4+y*s+yy;if(rnd()<.05)continue;   // 크레용이 덜 묻은 자리
      const k=.12+((X+Y*2)%5===0?.4:(X*3+Y)%7===0?.22:0);
      put(X,Y,R+(246-R)*k|0,G+(236-G)*k|0,B+(214-B)*k|0,235);
    }
  }
  // 연필 윤곽: 바깥 가장자리를 따라 한 칸씩 흔들리며 긋는다
  const ink=(X,Y)=>put(X,Y,58,44,34,215);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    if(!A(x,y))continue;const X0=4+x*s,Y0=4+y*s;
    for(let k=0;k<s;k++){const j=rnd()<.3?1:0;
      if(!A(x,y-1))ink(X0+k,Y0-1-j);if(!A(x,y+1))ink(X0+k,Y0+s+j);
      if(!A(x-1,y))ink(X0-1-j,Y0+k);if(!A(x+1,y))ink(X0+s+j,Y0+k);}
  }
  g.putImageData(od,0,0);return o;
}
/* 도장 쪽: 찾은 아빠 도장(너구리 손바닥 자국)을 찾은 만큼 찍어 그린다 */
function pawCanvas(n){
  const c=document.createElement('canvas'),cols=Math.min(3,Math.max(1,n));c.width=cols*14+2;c.height=Math.ceil(n/3)*14+2;const g=c.getContext('2d');
  for(let i=0;i<n;i++){const x=1+(i%3)*14,y=1+Math.floor(i/3)*14;g.fillStyle='#8a3b2a';
    g.fillRect(x+3,y+6,7,6);g.fillRect(x+4,y+5,5,1);for(const [dx,dy] of [[1,3],[4,1],[7,1],[10,3]])g.fillRect(x+dx,y+dy,2,2);}
  return c;
}
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
function drawingFor(e){
  const seed=seedOf(e.id);
  if(e.kind==='item')return crayonCanvas(icon(e.id),seed);
  if(e.kind==='stamp'){const n=e.lines.filter(l=>l.when&&knows(l.when)).length;return n?crayonCanvas(pawCanvas(n),seed):null;}
  const n=npcFind(e.id);
  if(n)return crayonCanvas(spriteCanvas(n),seed);
  if(ENEMIES[e.id])return enemyCanvas(e.id);
  return null;
}
/* 아이가 직접 보았나: 동물은 만나거나 싸우거나 얻은 뒤, 물건은 처음 얻은 뒤, 도장은 하나라도 찾은 뒤 */
function witnessed(e){
  if(e.kind==='item')return gotItem(e);
  if(e.kind==='stamp')return e.lines.some(l=>l.when&&knows(l.when));
  return seen(e);
}
/* 새로 그린 그림: 수첩을 열 때 아직 펼쳐 보지 않은 그림을 모아 두고, 그 한 번 동안 '새로 그림'을 붙인다 */
let noteFresh=new Set();
function collectFreshDrawings(){
  const drawn=G.f.drawn||(G.f.drawn={});
  noteFresh=new Set(Object.values(NOTES).filter(e=>witnessed(e)&&!drawn[e.id]).map(e=>e.id));
  noteFresh.forEach(id=>drawn[id]=true);
}

/* 탭: 앞의 셋은 아빠와 같이 쓰는 쪽, 나머지는 아이가 이어 적은 장. 탭 선택은 저장하지 않는다 */
// 결정 D-30: 수첩에서 일기·까치 답장을 빼고, 아빠 단서·엄마의 쪽지는 보따리 '중요' 탭으로. 손버릇은 '익힌 솜씨' (design/data/decisions.csv)
const NOTE_TABS=[['animal','동물',1],['item','물건',1],...(CLASSIC?[]:[['stamp','도장',1]]),
  ['nicknames','불리는 이름'],['habits','익힌 솜씨'],['recipes','숨은 가공법'],['ledger','물품 장부']];
const PAGE_SECTION={animal:'관찰',item:'관찰',stamp:'관찰',habits:'익힌 솜씨',recipes:'숨은 가공법'};
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
function toggleNote(){const o=$('notebook').hidden;closePanels();if(o){Sound.book(true);collectFreshDrawings();renderNotebook();$('notebook').hidden=false;$('noteBody').scrollTop=0;}}
/* 옛 이름: 너구리의 책이 따로 있던 때 부르던 함수도 이 수첩을 연다 */
function toggleBook(){toggleNote();}
function renderBook(){renderNotebook();}
$('btnNote').onclick=()=>{if(G.started&&!open('dlg')&&!openMinigame())toggleNote();};
$('noteClose').onclick=closePanels;
/* 첫 지역에 처음 들어설 때 한 번: 보따리의 '중요' 탭에서 엄마의 쪽지를 펼친다 */
function showMomNote(){
  if(G.f.momNoteSeen)return false;
  G.f.momNoteSeen=true;openBag('중요');Sound.paper();return true;
}

/* 보이는 것만 센다: 아빠가 적어 둔 쪽 수와 아이가 이어 적은 줄 수 */
function noteTally(){
  const pages=Object.values(NOTES);
  const dad=pages.filter(e=>(!CLASSIC||e.kind!=='stamp')&&pageShown(e)).length;
  const mine=pages.reduce((n,e)=>n+e.lines.filter(l=>l.who!=='dad'&&lineShown(l)).length+(gotItem(e)?1:0),0)
    +(G.nicknames||[]).length+Object.keys(G.ledger||{}).length;
  return {dad,mine};
}
/* 쪽 하나: 아빠의 글 아래에 아이의 그림·줄.
   결정 D-61(D-57을 대신함): 아빠 쪽에는 그림이 없다. 아이가 직접 본 뒤에야 아이 그림이 생기고, 보기 전에는 빈 칸이다. */
function notePage(e,section){
  const dad=section==='관찰'?dadLinesOf(e):[],mine=myTexts(e,section);
  const card=el('div','note-card');
  if(section==='관찰'){
    const fig=el('figure','kid-drawing'),saw=witnessed(e),d=saw?drawingFor(e):null;
    fig.style.setProperty('--tilt',((seedOf(e.id)%7)-3)*.5+'deg');
    if(d){d.classList.add('me');fig.appendChild(d);fig.setAttribute('aria-label','내가 그린 '+noteName(e));
      if(noteFresh.has(e.id)){fig.classList.add('fresh');fig.appendChild(el('span','fresh-mark','새로 그림'));}}
    else{fig.classList.add('blank');fig.appendChild(el('span','blank-text',e.kind==='item'?'아직 못 얻었다':e.kind==='stamp'?'아직 못 찾았다':'아직 못 봤다'));}
    card.appendChild(fig);
  }
  card.appendChild(el('b','note-name',noteName(e)));
  const write=(cls,who,texts)=>{const box=el('div','note-lines '+cls);texts.forEach(t=>{const p=el('p','note-line '+(who==='아빠'?'dad':'me'));p.appendChild(el('span','who',who));p.appendChild(document.createTextNode(t));box.appendChild(p);});card.appendChild(box);};
  if(dad.length)write('dad-ink','아빠',dad.map(l=>l.text));
  if(mine.length)write('my-ink','나',mine);
  else if(dad.length){const gap=el('div','my-ink blank');gap.setAttribute('aria-hidden','true');card.appendChild(gap);}
  return card;
}
// 결정 D-81: 도장 전체 수는 수첩 데이터에서 센다(도장 쪽의 stamp: 키). 지역별로도 센다.
const stampTotal=region=>new Set(Object.values(NOTES).filter(e=>e.kind==='stamp'&&(!region||e.region===region)).flatMap(e=>e.lines.map(l=>l.when).filter(w=>w&&w.startsWith('stamp:')))).size;
function renderPages(body,section,kind){
  let shown=false;
  for(const r of regionList()){
    const pages=Object.values(NOTES).filter(e=>e.region===r.id&&(kind?e.kind===kind&&(pageShown(e)||myTexts(e,section).length):myTexts(e,section).length));
    if(!pages.length)continue;shown=true;
    body.appendChild(el('div','note-region',r.name+(kind==='stamp'?' · '+stampCount(r.id)+' / '+stampTotal(r.id):'')));
    const grid=el('div','note-grid');pages.forEach(e=>grid.appendChild(notePage(e,section)));body.appendChild(grid);
  }
  if(!shown)body.appendChild(el('p','empty-note',section==='익힌 솜씨'?'가보로 만들어 보며 손에 익은 것을 적는다.':section==='숨은 가공법'?'재료를 직접 넣어 찾은 맛을 여기에 적는다.':'여행하며 보고 들은 것을 여기에 적는다.'));
}
function renderNotebook(){
  if(!NOTE_TABS.some(t=>t[0]===noteTab))noteTab='animal';
  document.querySelectorAll('#noteTabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===noteTab));
  const {dad,mine}=noteTally();$('noteTally').textContent='아빠가 적은 쪽 '+dad+' · 내가 이어 적은 줄 '+mine;
  const body=$('noteBody');const sc=body.scrollTop;body.innerHTML='';
  if(noteTab==='stamp'){
    body.appendChild(el('p','small','찾은 아빠 도장 '+stampCount()+' / '+stampTotal()));
    // 아빠가 젊어서 적어 둔 말. 열두 곳을 다 찾으면 영산 끝에서 아빠와 나란히 서는 장면이 더해진다 (yeongsan/story.js).
    body.appendChild(el('p','note-line dad','아빠: 내 손바닥 도장은 네 고장에 열두 개. 다 찾는 이가 있다면 내 길을 다 걸은 셈이다.'));
  }
  if(PAGE_SECTION[noteTab])renderPages(body,PAGE_SECTION[noteTab],['animal','item','stamp'].includes(noteTab)?noteTab:null);
  else renderChildRecord(body,noteTab);
  body.scrollTop=sc;
}
