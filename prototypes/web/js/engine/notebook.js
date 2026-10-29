'use strict';
/* 아빠의 보부상 수첩: 아빠가 젊은 보부상 시절 군데군데 적어 둔 짧은 메모(처음부터 보인다)에,
   내가 여행하며 알게 된 것을 이어 적는다. 개수를 세거나 빈칸을 보여 주지 않는다. 정답을 채우는 도감이 아니라 메모장이다.

   쪽 하나: {id, kind:'animal'|'item', name?, lines:[{who:'dad'|'me', text, when?}], dadDrawing?:true}
   - id 는 NPC·전투 상대·아이템 id (npcs.csv · bosses.csv · items.csv, 원본은 design/data/notebook.csv)
   - who:'dad' 이고 when 이 없으면 처음부터 보인다. when 이 있으면 learn(when) 된 뒤에 보인다
   - 엔진이 저절로 learn 하는 것: 'met:<npc>' 처음 말 걸기, 'fight:<상대>' 전투 시작, 'got:<아이템>' 처음 얻기,
     'like:<상대>:<아이템>' 전투에서 좋아하는 선물, 'core:<상대>' 핵심 부위가 드러남, 'calm:<상대>' 달래서 끝냄
   - 지역 기믹은 지역 코드가 learn('<키>') 를 부른다 */
const NOTES={};
/* 같은 쪽(예: 여러 지역에 나오는 날쌘)이 다시 오면 줄만 이어 붙인다. 쪽은 처음 정의한 지역에 놓인다 */
function defineNotes(region,list){list.forEach(e=>{if(NOTES[e.id])NOTES[e.id].lines.push(...e.lines);else NOTES[e.id]=Object.assign({region},e);});}
const knows=k=>G.learned.includes(k);
function noteName(e){return e.name||(e.kind==='item'?ITEMS[e.id].n:(ENEMIES[e.id]&&!npcFind(e.id)?ENEMIES[e.id].name:npcName(e.id)));}
function npcFind(id){for(const r of regionList()){const n=(r.npcs||[]).find(n=>n.id===id);if(n)return n;}return null;}
const lineShown=l=>l.when?knows(l.when):l.who==='dad';
const seen=e=>knows('met:'+e.id)||knows('fight:'+e.id)||knows('got:'+e.id);
const pageShown=e=>seen(e)||e.lines.some(lineShown);
/* 새로 알게 된 것. 그 덕에 수첩에 새 줄이 생기면 알려 준다 (quiet 면 조용히) */
function learn(k,quiet){
  if(!G||knows(k))return false;G.learned.push(k);
  const e=Object.values(NOTES).find(e=>e.lines.some(l=>l.when===k));
  if(e&&!quiet)setTimeout(()=>toast('수첩에 적었다 · '+noteName(e)),1400);
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

let noteTab='animal';
function toggleNote(){const o=$('notebook').hidden;closePanels();if(o){Sound.panel(true);renderNotebook();$('notebook').hidden=false;$('noteBody').scrollTop=0;}}
document.querySelectorAll('#noteTabs button').forEach(b=>b.onclick=()=>{if(noteTab!==b.dataset.tab)Sound.tab();noteTab=b.dataset.tab;renderNotebook();$('noteBody').scrollTop=0;});
$('btnNote').onclick=()=>{if(G.started&&!open('dlg')&&!openMinigame())toggleNote();};
$('noteClose').onclick=closePanels;
function renderNotebook(){
  document.querySelectorAll('#noteTabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===noteTab));
  const body=$('noteBody');const sc=body.scrollTop;body.innerHTML='';
  regionList().forEach(r=>{
    const pages=Object.values(NOTES).filter(e=>e.region===r.id&&e.kind===noteTab&&pageShown(e));
    if(!pages.length)return;
    body.appendChild(el('div','note-region',r.name));
    const grid=el('div','note-grid');
    pages.forEach(e=>{
      const card=el('div','note-card');
      const pics=el('div','note-pics');
      const dadLines=e.lines.filter(l=>l.who==='dad'&&lineShown(l));
      if(e.dadDrawing||(e.kind!=='item'&&npcFind(e.id)&&dadLines.length)){const d=drawingFor(e,true);if(d){d.classList.add('dad');pics.appendChild(d);}}
      if(seen(e)){const m=drawingFor(e,false);if(m)pics.appendChild(m);}
      if(pics.children.length)card.appendChild(pics);
      card.appendChild(el('b','note-name',noteName(e)));
      const list=el('div','note-lines');
      e.lines.filter(lineShown).forEach(l=>{const p=el('p','note-line '+l.who);p.appendChild(el('span','who',l.who==='dad'?'아빠':'나'));p.appendChild(document.createTextNode(l.text));list.appendChild(p);});
      if(e.kind==='item'&&seen(e)){const p=el('p','note-line me');p.appendChild(el('span','who','나'));p.appendChild(document.createTextNode(ITEMS[e.id].d));list.insertBefore(p,list.querySelector('.note-line.me'));}
      card.appendChild(list);grid.appendChild(card);
    });
    body.appendChild(grid);
  });
  body.scrollTop=sc;
}
