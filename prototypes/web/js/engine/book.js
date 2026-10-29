'use strict';
/* 너구리의 책: 아이의 일기·단서·관찰·별명·손버릇·가공법·까치 답장과 엄마의 쪽지. */
let bookTab='diary';
const BOOK_TABS={diary:'일기',clues:'아빠 단서',observations:'관찰',nicknames:'불리는 이름',habits:'손버릇',recipes:'숨은 가공법',replies:'까치 답장',mom:'엄마의 쪽지',ledger:'물품 장부'};
// HTML에 있던 세 탭도 함께 재배치한다. 저장에는 탭 선택을 남기지 않는다.
const bookTabs=$('bookTabs');bookTabs.innerHTML='';
for(const [id,name] of Object.entries(BOOK_TABS)){
  const b=el('button',null,name);b.type='button';b.dataset.tab=id;b.setAttribute('role','tab');
  b.onclick=()=>{if(bookTab!==id)Sound.tab();bookTab=id;renderBook();};bookTabs.appendChild(b);
}
$('btnBookEnd').addEventListener('click',()=>Sound.panel(true));
function showMomNote(){
  if(G.f.momNoteSeen)return false;
  G.f.momNoteSeen=true;bookTab='mom';closePanels();renderBook();$('book').hidden=false;Sound.paper();return true;
}
function renderChildNotes(body,section){
  let shown=false;
  for(const r of regionList()){
    const pages=Object.values(NOTES).map(e=>({e,lines:e.lines.filter(l=>l.who==='me'&&lineShown(l)&&(l.section||childNoteSection(l))===section)}))
      .filter(({e,lines})=>e.region===r.id&&(lines.length||(section==='관찰'&&e.kind==='item'&&ITEMS[e.id]&&knows('got:'+e.id))));
    if(!pages.length)continue;shown=true;body.appendChild(el('div','note-region',r.name));
    const grid=el('div','note-grid');
    for(const {e,lines} of pages){
      const card=el('div','note-card');
      const picture=drawingFor(e,false);if(picture){const pics=el('div','note-pics');pics.appendChild(picture);card.appendChild(pics);}
      card.appendChild(el('b','note-name',noteName(e)));
      if(section==='관찰'&&e.kind==='item'&&ITEMS[e.id]&&knows('got:'+e.id))card.appendChild(el('p','note-line me',ITEMS[e.id].d));
      for(const line of lines)card.appendChild(el('p','note-line me',line.text));
      grid.appendChild(card);
    }
    body.appendChild(grid);
  }
  if(!shown)body.appendChild(el('p','empty-note',section==='손버릇'?'가보로 만들어 보며 손에 남는 것을 적는다.':section==='숨은 가공법'?'재료를 직접 넣어 찾은 맛을 여기에 적는다.':'여행하며 보고 들은 것을 여기에 적는다.'));
}
function childNoteSection(line){return line.when?.startsWith('habit:')?'손버릇':line.when?.startsWith('recipe:')?'숨은 가공법':'관찰';}
function renderMomNote(body){
  const stage=G.f.momNoteRestored?0:(G.f.momNoteFade||0),paper=el('div','mom-note');
  const recipient=G.f.momNoteRestored&&G.f.newName?G.f.newName:'＿＿＿',lines=[recipient+'에게',...MOM_NOTE];
  paper.dataset.fade=stage;paper.setAttribute('role','img');paper.setAttribute('aria-label','엄마가 겨우 써 준 쪽지. '+lines.join(' '));
  paper.appendChild(el('small',null,G.f.momNoteRestored?'다시 또렷해진 엄마의 글씨':'출발하는 날, 엄마가 건넨 한 장'));
  let index=0;
  for(const text of lines){const line=el('p');for(const ch of text){
    const glyph=el('span',null,ch);glyph.setAttribute('aria-hidden','true');
    const wear=(index++*7+3)%11;glyph.style.opacity=stage===0?'1':String(Math.max(.08,1-stage*(.15+wear*.025)));line.appendChild(glyph);
  }paper.appendChild(line);}
  body.appendChild(paper);
  body.appendChild(el('p','small',stage?'길을 옮길 때마다 글씨가 조금씩 흐려졌다. 엄마가 건넨 마음은 남아 있다.':'접힌 자리에 엄마 손때가 남아 있다.'));
  // 흐려짐은 그림 연출뿐이다. 쪽지 내용을 다시 읽을 수 있다.
  const transcript=el('details','mom-transcript');transcript.appendChild(el('summary',null,'쪽지 글 다시 읽기'));
  lines.forEach(text=>transcript.appendChild(el('p',null,text)));body.appendChild(transcript);
}
function renderBook(){
  document.querySelectorAll('#bookTabs button').forEach(b=>{b.setAttribute('aria-selected',b.dataset.tab===bookTab);b.textContent=BOOK_TABS[b.dataset.tab];});
  const body=$('bookBody');body.innerHTML='';body.scrollTop=0;
  const note=t=>body.appendChild(el('p','empty-note',t));
  const entry=(label,text)=>{const e=el('div','entry');e.appendChild(el('small',null,label));e.appendChild(document.createTextNode(text));body.appendChild(e);};
  if(bookTab==='diary'){
    if(!G.diary.length)note('아직 적은 것이 없다.');
    G.diary.forEach((d,i)=>entry((i+1)+'번째 기록',d.text));
  }else if(bookTab==='clues'){
    if(!G.clues.length)note('아빠의 흔적을 아직 찾지 못했다. '+REG.name+' 동물들에게 말을 걸어 보자.');
    G.clues.forEach(c=>entry(c.who,c.text));
  }else if(['observations','habits','recipes'].includes(bookTab)){
    renderChildNotes(body,{observations:'관찰',habits:'손버릇',recipes:'숨은 가공법'}[bookTab]);
  }else if(bookTab==='nicknames'){
    const list=G.nicknames||[];if(!list.length)note('길에서 누군가 나를 새롭게 불러 주면 적어 두자.');
    list.forEach(n=>entry((REGIONS[n.region]?.name||'길 위에서')+(n.by?' · '+(npcName(n.by)||n.by):''),n.text));
  }else if(bookTab==='replies'){
    const replies=G.diary.filter(d=>d.id.startsWith('homeReply:'));
    if(!replies.length)note('까치가 집에 다녀오면 다음 고을 쉼터에서 엄마의 몸짓을 전해 준다.');
    replies.forEach(d=>entry((REGIONS[d.id.slice(10)]?.name||'집에서 온')+' 답장',d.text));
  }else if(bookTab==='mom')renderMomNote(body);
  else if(bookTab==='ledger'){
    const r=el('div','rels');
    Object.keys(G.rel).forEach(k=>{const s=el('span','rel',npcName(k)+' · '+G.rel[k].t+' '+G.rel[k].v);r.appendChild(s);});body.appendChild(r);
    const ids=Object.keys(G.ledger);if(!ids.length){note('아직 적힌 거래가 없다. 누가 무엇을 원하는지 들으면 여기에 적힌다.');return;}
    const wrap=el('div','ledger-wrap'),table=el('table','ledger'),head=el('thead'),hr=el('tr');
    ['상대','원하는 것','주는 것','상태'].forEach(t=>hr.appendChild(el('th',null,t)));head.appendChild(hr);table.appendChild(head);
    const rows=el('tbody');ids.forEach(id=>{const L=G.ledger[id],row=el('tr');[L.npc,L.want,L.give].forEach(t=>row.appendChild(el('td',null,t)));
      const state=el('td');state.appendChild(el('span','state '+(L.done?'done':'open'),L.done?'끝남':'진행 중'));row.appendChild(state);rows.appendChild(row);});
    table.appendChild(rows);wrap.appendChild(table);body.appendChild(wrap);
  }
}
