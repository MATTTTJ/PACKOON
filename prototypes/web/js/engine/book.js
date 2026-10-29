'use strict';
/* 너구리의 책: 일기, 아빠 단서, 물품 장부. 도감은 따로 여는 아빠의 보부상 수첩(notebook.js) */
let bookTab='diary';
document.querySelectorAll('#bookTabs button').forEach(b=>b.onclick=()=>{bookTab=b.dataset.tab;renderBook();});
function renderBook(){
  const total=clueTotalSoFar();   // 지나온 지역을 모두 더해 센다
  const names={diary:'일기',clues:'아빠 단서 '+G.clues.length+'/'+total,ledger:'물품 장부'};
  document.querySelectorAll('#bookTabs button').forEach(b=>{b.setAttribute('aria-selected',b.dataset.tab===bookTab);b.textContent=names[b.dataset.tab];});
  const body=$('bookBody');body.innerHTML='';body.scrollTop=0;
  const note=t=>{const p=document.createElement('p');p.className='empty-note';p.textContent=t;body.appendChild(p);};
  if(bookTab==='diary'){
    if(!G.diary.length)note('아직 적은 것이 없다.');
    G.diary.forEach((d,i)=>{const e=document.createElement('div');e.className='entry';e.innerHTML='<small>'+(i+1)+'번째 기록</small>';e.appendChild(document.createTextNode(d.text));body.appendChild(e);});
  }else if(bookTab==='clues'){
    if(!G.clues.length)note('아빠의 흔적을 아직 찾지 못했다. '+REG.name+' 동물들에게 말을 걸어 보자.');
    G.clues.forEach(c=>{const e=document.createElement('div');e.className='entry';e.innerHTML='<small>'+c.who+'</small>';e.appendChild(document.createTextNode(c.text));body.appendChild(e);});
    if(G.clues.length&&G.clues.length<total)note('아직 찾지 못한 단서가 '+(total-G.clues.length)+'개 있다.');
  }else{
    const r=document.createElement('div');r.className='rels';
    Object.keys(G.rel).forEach(k=>{const nm=npcName(k);const s=document.createElement('span');s.className='rel';s.innerHTML=nm+' · <b>'+G.rel[k].t+' '+G.rel[k].v+'</b>';r.appendChild(s);});
    body.appendChild(r);
    const ids=Object.keys(G.ledger);
    if(!ids.length){note('아직 적힌 거래가 없다. 누가 무엇을 원하는지 들으면 여기에 적힌다.');return;}
    const wrap=document.createElement('div');wrap.className='ledger-wrap';
    let h='<table class="ledger"><thead><tr><th>상대</th><th>원하는 것</th><th>주는 것</th><th>상태</th></tr></thead><tbody>';
    ids.forEach(id=>{const L=G.ledger[id];h+='<tr><td>'+L.npc+'</td><td>'+L.want+'</td><td>'+L.give+'</td><td><span class="state '+(L.done?'done':'open')+'">'+(L.done?'끝남':'진행 중')+'</span></td></tr>';});
    wrap.innerHTML=h+'</tbody></table>';body.appendChild(wrap);
  }
}
