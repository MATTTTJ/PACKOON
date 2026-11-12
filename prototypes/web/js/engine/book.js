'use strict';
/* 아이가 적은 기록을 그린다: 수첩의 해야 할 일·아빠 단서·이름·물품 장부 (결정 D-703).
   결정 D-1402 (사용자 지시 2026-11-09): 이름 장의 '엄마가 지어 준 이름' 줄과 그 아래 엄마의 쪽지를 뺐다. 첫 출발 쪽지 장면도 없다.
   패널과 탭, 동물·물건·도장·숨은 가공법 쪽은 notebook.js 가 맡는다. 여기서는 받은 body 에 아이의 글씨로 그리기만 한다.
   저장 모양(G.diary·G.clues·G.nicknames·G.ledger·G.rel·G.f.momNote*)은 책이 둘이던 때와 같다. */
function childNoteSection(line){return line.when?.startsWith('habit:')?'익힌 솜씨':/^(recipe|hint):/.test(line.when||'')?'숨은 가공법':'관찰';}   // 결정 D-461: 귀띔(hint:)도 숨은 가공법 장
/* 결정 D-150: 수첩 '해야 할 일' 장. 중요(지금 지역의 본 줄거리 한 줄)와 잔일(맡은 심부름, D-200)을 나누고,
   끝낸 일은 접어 둔 '끝낸 일' 묶음에 남긴다(지나온 지역의 본 줄거리와 마친 심부름). 할 일 글은 HUD와 같다(hud.js). */
function renderTodo(body){
  const item=(box,cls,text,sub)=>{const d=el('div','todo-item '+cls);d.appendChild(document.createTextNode(text));if(sub)d.appendChild(el('small',null,sub));box.appendChild(d);};
  const head=(cls,text)=>body.appendChild(el('div','todo-head '+cls,text));
  // 결정 D-890: 목표 밑에 지금 단계의 길잡이를 적는다. 길을 잃었을 때 여기서 누구에게 가서 무엇을 할지 본다.
  const guide=(text)=>{if(text)body.lastChild.appendChild(el('p','todo-guide',text));};
  head('main','중요');
  const g=mainGoalParts();item(body,'main',g.goal||REG.cover.ready,REG.name);guide(g.guide);
  head('sub','잔일');
  const subs=activeSideQuests();
  if(!subs.length)body.appendChild(el('p','empty-note','맡은 부탁이 아직 없다. 길에서 만난 이들의 이야기를 들어 보자.'));
  subs.forEach(q=>{item(body,'sub',q.title,REGIONS[q.region]?.name);markNew(body.lastChild,'q:'+q.id);const t=q.text(G.f);guide(t!==q.title?t:'');});
  const done=[...regionList().filter(r=>r.id!==G.region&&regionCompleted(r.id)).map(r=>({cls:'main',text:r.cover.end.head,sub:r.name+' · 중요'})),
    ...SIDE_QUESTS.filter(sideDone).map(q=>({cls:'sub',text:q.title,sub:(REGIONS[q.region]?.name||'')+' · 잔일'}))];
  if(!done.length)return;
  const box=el('details','todo-done');box.appendChild(el('summary',null,'끝낸 일 '+done.length));
  done.forEach(d=>item(box,d.cls,d.text,d.sub));body.appendChild(box);
}
/* 아이가 적은 장 하나 (tab: todo·clues·nicknames·ledger) */
function renderChildRecord(body,tab){
  const note=t=>body.appendChild(el('p','empty-note',t));
  const entry=(label,text)=>{const e=el('div','entry me');e.appendChild(el('small',null,label));e.appendChild(document.createTextNode(text));body.appendChild(e);return e;};
  if(tab==='todo')renderTodo(body);
  else if(tab==='clues'){
    if(!G.clues.length)note('아빠의 흔적을 아직 찾지 못했다. '+REG.name+' 동물들에게 말을 걸어 보자.');
    // 결정 D-1078: 이름에는 그 이름으로 불리며 겪은 일이 쌓인다. 먹힌 이름을 지어 준 이에게서 들은 단서는 흐려진다(되찾으면 돌아온다)
    const dim=new Set((G.nicknames||[]).filter(n=>n.lost&&n.by).flatMap(n=>[n.by,npcName(n.by)]).filter(Boolean));
    G.clues.forEach(c=>{const e=entry(c.who,c.text);if(dim.has(c.who))e.classList.add('lost');markNew(e,'c:'+c.id);});
  }else if(tab==='nicknames'){
    const list=G.nicknames||[];if(!list.length)note('길에서 누군가 나를 새롭게 불러 주면 적어 두자.');
    // 먹힌 이름은 글자만 비고, 지어 준 이와 받은 곳은 흐리게 남는다
    // 결정 D-1320 (사용자 지시 2026-11-08 42, D-1078 의 한 줄을 바꿈): 먹힌 이름 칸은 글씨가 지워진 빈 줄이다. 옅은 먹 번짐만 남는다
    list.forEach(n=>{const e=entry((REGIONS[n.region]?.name||'길 위에서')+(n.by?' · '+(npcName(n.by)||n.by):''),n.lost?'':n.text);
      if(n.lost){e.classList.add('lost');e.appendChild(el('span','ink-smear'));e.title='글씨가 지워졌다';}else markNew(e,'n:'+n.id);});
  }else if(tab==='ledger'){
    /* 결정 D-1463: 장부 맨 위에는 만난 인물과의 정을 표식 셋으로 보인다 (예전 G.rel 의 호감·의리 숫자 대신. G.rel 은 이야기 쪽에서 그대로 쓴다) */
    const r=el('div','rels');
    for(const [id,b] of Object.entries(TABLES.BONDS||{})){
      if(!knows('met:'+id)&&!knows('met:j_'+id))continue;
      const s=el('span','rel',b.name+' ');const m=bondMarksEl(id);if(m)s.appendChild(m);r.appendChild(s);
    }
    if(r.children.length)body.appendChild(r);
    strangerDebtRows().forEach(d=>entry(d.who,d.text));   // 수리부엉이로 받은 외상 (forms.js)
    const ids=Object.keys(G.ledger);if(!ids.length){note('아직 적힌 거래가 없다. 누가 무엇을 원하는지 들으면 여기에 적힌다.');return;}
    const wrap=el('div','ledger-wrap'),table=el('table','ledger me'),head=el('thead'),hr=el('tr');
    ['상대','원하는 것','주는 것','상태'].forEach(t=>hr.appendChild(el('th',null,t)));head.appendChild(hr);table.appendChild(head);
    const rows=el('tbody');ids.forEach(id=>{const L=G.ledger[id],row=el('tr');[L.npc,L.want,L.give].forEach(t=>row.appendChild(el('td',null,t)));markNew(row.firstChild,'l:'+id);
      const state=el('td');state.appendChild(el('span','state '+(L.done?'done':'open'),L.done?'끝남':'진행 중'));row.appendChild(state);rows.appendChild(row);});
    table.appendChild(rows);wrap.appendChild(table);body.appendChild(wrap);
  }
}
