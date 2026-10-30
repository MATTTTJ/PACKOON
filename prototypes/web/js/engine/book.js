'use strict';
/* 아이가 적은 기록을 그린다: 수첩의 불리는 이름·물품 장부, 보따리 '중요' 탭의 아빠 단서·엄마의 쪽지.
   패널과 탭, 동물·물건·도장·익힌 솜씨·숨은 가공법 쪽은 notebook.js 가 맡는다. 여기서는 받은 body 에 아이의 글씨로 그리기만 한다.
   저장 모양(G.diary·G.clues·G.nicknames·G.ledger·G.rel·G.f.momNote*)은 책이 둘이던 때와 같다. */
function childNoteSection(line){return line.when?.startsWith('habit:')?'익힌 솜씨':line.when?.startsWith('recipe:')?'숨은 가공법':'관찰';}
function renderMomNote(body){
  const stage=G.f.momNoteRestored?0:(G.f.momNoteFade||0),paper=el('div','mom-note');
  const recipient=G.f.momNoteRestored&&G.f.newName?G.f.newName:'＿＿＿',lines=[recipient+'에게',...MOM_NOTE];
  paper.dataset.fade=stage;paper.setAttribute('role','img');paper.setAttribute('aria-label','엄마가 겨우 써 준 쪽지. '+lines.join(' '));
  paper.appendChild(el('small',null,G.f.momNoteRestored?'다시 또렷해진 엄마의 글씨':'출발하는 날, 엄마가 건넨 한 장. 보따리 안쪽에 잘 넣어 두었다'));
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
/* 아이가 적은 장 하나 (tab: clues·nicknames·mom·ledger) */
function renderChildRecord(body,tab){
  const note=t=>body.appendChild(el('p','empty-note',t));
  const entry=(label,text)=>{const e=el('div','entry me');e.appendChild(el('small',null,label));e.appendChild(document.createTextNode(text));body.appendChild(e);};
  if(tab==='clues'){
    if(!G.clues.length)note('아빠의 흔적을 아직 찾지 못했다. '+REG.name+' 동물들에게 말을 걸어 보자.');
    G.clues.forEach(c=>entry(c.who,c.text));
  }else if(tab==='nicknames'){
    const list=G.nicknames||[];if(!list.length)note('길에서 누군가 나를 새롭게 불러 주면 적어 두자.');
    list.forEach(n=>entry((REGIONS[n.region]?.name||'길 위에서')+(n.by?' · '+(npcName(n.by)||n.by):''),n.text));
  }else if(tab==='mom')renderMomNote(body);
  else if(tab==='ledger'){
    const r=el('div','rels');
    Object.keys(G.rel).forEach(k=>{const s=el('span','rel',npcName(k)+' · '+G.rel[k].t+' '+G.rel[k].v);r.appendChild(s);});body.appendChild(r);
    strangerDebtRows().forEach(d=>entry(d.who,d.text));   // 수리부엉이로 받은 외상 (forms.js)
    const ids=Object.keys(G.ledger);if(!ids.length){note('아직 적힌 거래가 없다. 누가 무엇을 원하는지 들으면 여기에 적힌다.');return;}
    const wrap=el('div','ledger-wrap'),table=el('table','ledger me'),head=el('thead'),hr=el('tr');
    ['상대','원하는 것','주는 것','상태'].forEach(t=>hr.appendChild(el('th',null,t)));head.appendChild(hr);table.appendChild(head);
    const rows=el('tbody');ids.forEach(id=>{const L=G.ledger[id],row=el('tr');[L.npc,L.want,L.give].forEach(t=>row.appendChild(el('td',null,t)));
      const state=el('td');state.appendChild(el('span','state '+(L.done?'done':'open'),L.done?'끝남':'진행 중'));row.appendChild(state);rows.appendChild(row);});
    table.appendChild(rows);wrap.appendChild(table);body.appendChild(wrap);
  }
}
