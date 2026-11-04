'use strict';
/* 아이가 적은 기록을 그린다: 수첩의 해야 할 일·이름·물품 장부, 보따리 '중요' 탭의 아빠 단서·엄마의 쪽지.
   패널과 탭, 동물·물건·도장·숨은 가공법 쪽은 notebook.js 가 맡는다. 여기서는 받은 body 에 아이의 글씨로 그리기만 한다.
   저장 모양(G.diary·G.clues·G.nicknames·G.ledger·G.rel·G.f.momNote*)은 책이 둘이던 때와 같다. */
function childNoteSection(line){return line.when?.startsWith('habit:')?'익힌 솜씨':/^(recipe|hint):/.test(line.when||'')?'숨은 가공법':'관찰';}   // 결정 D-461: 귀띔(hint:)도 숨은 가공법 장
function renderMomNote(body){
  const stage=G.f.momNoteRestored?0:(G.f.momNoteFade||0),paper=el('div','mom-note');
  // 결정 D-38: 받는 이의 이름은 번져서 읽히지 않는다. 아이의 이름은 엔딩에서야 나온다. 엔딩 뒤에는 새 이름이 또렷하게 보인다.
  // 결정 D-132: 산군에게 이름을 내놓은 뒤부터 엔딩 전까지는 번진 자국도 없이 이름 자리가 빈다.
  const named=!!(G.f.momNoteRestored&&G.f.newName),blank=!named&&!!G.f.nameGiven;
  const recipient=named?G.f.newName:blank?'　　　':'아무개',lines=[recipient+'에게',...MOM_NOTE];
  const spoken=[(named?recipient:blank?'(빈자리)':'(번진 이름)')+'에게',...MOM_NOTE];
  paper.dataset.fade=stage;paper.setAttribute('role','img');paper.setAttribute('aria-label','엄마가 겨우 써 준 쪽지. '+spoken.join(' '));
  paper.appendChild(el('small',null,G.f.momNoteRestored?'다시 또렷해진 엄마의 글씨':'출발하는 날, 엄마가 건넨 한 장. 보따리 안쪽에 잘 넣어 두었다'));
  let index=0;
  lines.forEach((text,row)=>{const line=el('p');[...text].forEach((ch,col)=>{
    const glyph=el('span',row===0&&!named&&!blank&&col<recipient.length?'smudge':null,ch);glyph.setAttribute('aria-hidden','true');
    const wear=(index++*7+3)%11;glyph.style.opacity=stage===0?'1':String(Math.max(.08,1-stage*(.15+wear*.025)));line.appendChild(glyph);
  });paper.appendChild(line);});
  body.appendChild(paper);
  if(blank)body.appendChild(el('p','small','받는 이 자리가 하얗게 비었다. 번진 자국도 없다.'));
  body.appendChild(el('p','small',stage?'길을 옮길 때마다 글씨가 조금씩 흐려졌다. 엄마가 건넨 마음은 남아 있다.':'접힌 자리에 엄마 손때가 남아 있다.'));
  // 흐려짐은 그림 연출뿐이다. 쪽지 내용을 다시 읽을 수 있다.
  const transcript=el('details','mom-transcript');transcript.appendChild(el('summary',null,'쪽지 글 다시 읽기'));
  spoken.forEach(text=>transcript.appendChild(el('p',null,text)));body.appendChild(transcript);
}
/* 결정 D-150: 수첩 '해야 할 일' 장. 중요(지금 지역의 본 줄거리 한 줄)와 잔일(맡은 심부름, D-200)을 나누고,
   끝낸 일은 접어 둔 '끝낸 일' 묶음에 남긴다(지나온 지역의 본 줄거리와 마친 심부름). 할 일 글은 HUD와 같다(hud.js). */
function renderTodo(body){
  const item=(box,cls,text,sub)=>{const d=el('div','todo-item '+cls);d.appendChild(document.createTextNode(text));if(sub)d.appendChild(el('small',null,sub));box.appendChild(d);};
  const head=(cls,text)=>body.appendChild(el('div','todo-head '+cls,text));
  head('main','중요');
  const g=mainGoalText();item(body,'main',g||REG.cover.ready,REG.name);
  head('sub','잔일');
  const subs=activeSideQuests();
  if(!subs.length)body.appendChild(el('p','empty-note','맡은 부탁이 아직 없다. 길에서 만난 이들의 이야기를 들어 보자.'));
  subs.forEach(q=>item(body,'sub',q.text(G.f),REGIONS[q.region]?.name));
  const done=[...regionList().filter(r=>r.id!==G.region&&regionCompleted(r.id)).map(r=>({cls:'main',text:r.cover.end.head,sub:r.name+' · 중요'})),
    ...SIDE_QUESTS.filter(sideDone).map(q=>({cls:'sub',text:q.title,sub:(REGIONS[q.region]?.name||'')+' · 잔일'}))];
  if(!done.length)return;
  const box=el('details','todo-done');box.appendChild(el('summary',null,'끝낸 일 '+done.length));
  done.forEach(d=>item(box,d.cls,d.text,d.sub));body.appendChild(box);
}
/* 아이가 적은 장 하나 (tab: todo·clues·nicknames·mom·ledger) */
function renderChildRecord(body,tab){
  const note=t=>body.appendChild(el('p','empty-note',t));
  const entry=(label,text)=>{const e=el('div','entry me');e.appendChild(el('small',null,label));e.appendChild(document.createTextNode(text));body.appendChild(e);return e;};
  if(tab==='todo')renderTodo(body);
  else if(tab==='clues'){
    if(!G.clues.length)note('아빠의 흔적을 아직 찾지 못했다. '+REG.name+' 동물들에게 말을 걸어 보자.');
    G.clues.forEach(c=>entry(c.who,c.text));
  }else if(tab==='nicknames'){
    // 결정 D-423: 맨 위는 엄마가 지어 준 이름. 아이가 길에서 한 번도 말하지 않은 이름이라 엔딩에서 새 이름을 받을 때까지 비어 있다
    entry('엄마가 지어 준 이름',G.f.newName||'(아직 적지 않았다)').classList.add('own-name');
    const list=G.nicknames||[];if(!list.length)note('길에서 누군가 나를 새롭게 불러 주면 적어 두자.');
    // 먹힌 이름은 글자만 비고, 지어 준 이와 받은 곳은 흐리게 남는다
    list.forEach(n=>{const e=entry((REGIONS[n.region]?.name||'길 위에서')+(n.by?' · '+(npcName(n.by)||n.by):''),n.lost?'　':n.text);if(n.lost)e.classList.add('lost');});
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
