'use strict';
/* 패널(보따리·책) 열고 닫기, 보따리 + 가보 가공대 */
function closePanels(){if(!$('bag').hidden&&G)returnPouch();$('bag').hidden=true;$('book').hidden=true;$('notebook').hidden=true;}
function toggleBag(){const o=$('bag').hidden;closePanels();if(o){selItem=null;lastOut=null;pouchMsg='';renderBag();$('bag').hidden=false;$('bagBody').scrollTop=0;}}
function toggleBook(){const o=$('book').hidden;closePanels();if(o){renderBook();$('book').hidden=false;}}
$('btnBag').onclick=()=>{if(G.started&&!G.ended&&!open('dlg')&&!openMinigame())toggleBag();};
$('btnBook').onclick=()=>{if(G.started&&!open('dlg')&&!openMinigame())toggleBook();};
$('bagClose').onclick=closePanels;$('bookClose').onclick=closePanels;

/* 가보: 순서대로 가공대 탭에 나온다. 내용은 data/common.js */
const HEIR={};
function defineHeirlooms(map){Object.assign(HEIR,map);}
/* 가공법: 그 가보가 깨어나는 지역 파일이 넣는다. RECIPES[가보]=[{need:{아이템:개수}, out:만들어지는 것, n:개수}]
   가공법은 가보가 깨어난 뒤(G.awake 에 들어간 뒤)에만 쓰인다. 깨우기는 awaken(가보) */
const RECIPES={};
function defineRecipes(map){for(const k in map)RECIPES[k]=(RECIPES[k]||[]).concat(map[k]);}
const isAwake=t=>G.awake.includes(t);
function awaken(t){if(!isAwake(t))G.awake.push(t);}
const pouch={tool:'jeolgu',items:[]};
let selItem=null,pouchMsg='',lastOut=null,brewing=false;
function pouchCount(){const c={};pouch.items.forEach(i=>c[i]=(c[i]||0)+1);return c;}
function matchRecipe(){const c=pouchCount(),ck=Object.keys(c);if(!isAwake(pouch.tool))return null;for(const r of RECIPES[pouch.tool]||[]){const k=Object.keys(r.need);if(ck.length===k.length&&k.every(x=>c[x]===r.need[x]))return r;}return null;}
function returnPouch(){if(!pouch.items.length)return;pouch.items.forEach(id=>{G.inv[id]=(G.inv[id]||0)+1;});pouch.items=[];refreshHud();}
function liveHint(){
  if(!pouch.items.length)return '';
  const h=HEIR[pouch.tool];
  return h.live&&isAwake(pouch.tool)?h.live(pouchCount(),matchRecipe()):'무엇이 될지는 아직 모른다.';
}
function putIn(id){
  if(brewing||!has(id))return;
  if(pouch.items.length>=3){pouchMsg='가보에 더 넣을 자리가 없다. 먼저 하나를 꺼내자.';renderBag();return;}
  G.inv[id]--;if(G.inv[id]<=0){delete G.inv[id];if(selItem===id)selItem=null;}
  pouch.items.push(id);lastOut=null;pouchMsg=liveHint();refreshHud();renderBag(true);
}
function takeOut(i){if(brewing)return;const id=pouch.items.splice(i,1)[0];if(!id)return;G.inv[id]=(G.inv[id]||0)+1;lastOut=null;pouchMsg=liveHint();refreshHud();renderBag();}
function switchTool(t){if(brewing||t===pouch.tool)return;returnPouch();pouch.tool=t;lastOut=null;pouchMsg='';renderBag();}
function craft(){
  if(brewing||!pouch.items.length)return;
  const r=matchRecipe();const box=document.querySelector('#bagBody .pouch');
  if(!r){
    pouchMsg=HEIR[pouch.tool].fail(pouch.items,isAwake(pouch.tool));
    if(box){box.classList.remove('fizzle');void box.offsetWidth;box.classList.add('fizzle');}
    const m=$('benchMsg');if(m)m.textContent=pouchMsg;return;
  }
  brewing=true;const tool=pouch.tool;pouch.items=[];
  if(box)box.classList.add('brew');
  document.querySelectorAll('#bagBody .inslot').forEach(x=>x.classList.add('sucked'));
  const btn=$('craftBtn');if(btn)btn.disabled=true;
  setTimeout(()=>{
    brewing=false;addItem(r.out,r.n);lastOut=r.out;
    pouchMsg=ITEMS[r.out].n+' '+r.n+'개가 보따리로 들어갔다.';
    const fk='crafted_'+tool;
    if(!G.f[fk]){G.f[fk]=true;if(HEIR[tool].firstCraft)diary(fk,HEIR[tool].firstCraft);}
    renderBag();
  },matchMedia('(prefers-reduced-motion: reduce)').matches?60:760);
}
function renderBag(pop){
  const body=$('bagBody');const sc=body.scrollTop;body.innerHTML='';
  body.appendChild(el('div','sub','소지품'));
  const items=Object.keys(G.inv).filter(k=>G.inv[k]>0);
  const grid=el('div','bag-grid');
  for(let i=0;i<12;i++){
    const id=items[i];const b=el('button','slot'+(id&&selItem===id?' sel':''));b.type='button';
    if(id){b.appendChild(icon(id));b.appendChild(el('span','n',G.inv[id]));const dot=el('span','dot');dot.style.background=RCOL[ITEMS[id].r];b.appendChild(dot);
      b.setAttribute('aria-label',ITEMS[id].n+' '+G.inv[id]+'개');
      b.onclick=()=>{if(selItem===id)putIn(id);else{selItem=id;renderBag();}};}
    else{b.disabled=true;b.setAttribute('aria-label','빈 칸');}
    grid.appendChild(b);
  }
  body.appendChild(grid);
  const d=el('div','detail');
  if(selItem&&has(selItem)){
    const id=selItem;d.appendChild(icon(id));const info=el('div','info');
    const name=el('b',null,ITEMS[id].n);const ch=el('span','chip',RAR[ITEMS[id].r]);ch.style.background=RCOL[ITEMS[id].r];name.appendChild(ch);info.appendChild(name);
    info.appendChild(el('div',null,ITEMS[id].d));
    const row=el('div','row');
    const put=el('button','btn primary',HEIR[pouch.tool].short+'에 넣기');put.type='button';put.onclick=()=>putIn(id);row.appendChild(put);
    const eat=ITEMS[id].eat;
    if(eat){const b=el('button','btn','먹기 · 체력 +'+eat);b.type='button';b.disabled=G.hp>=G.maxhp;
      b.onclick=()=>{takeItem(id,1);G.hp=Math.min(G.maxhp,G.hp+eat);refreshHud();if(!has(id))selItem=null;renderBag();};row.appendChild(b);}
    info.appendChild(row);info.appendChild(el('span','small','한 번 더 누르면 바로 고른 가보에 넣는다.'));
    d.appendChild(info);
  }else d.appendChild(el('span','small','소지품을 누르면 설명이 나오고, 한 번 더 누르면 아래에서 고른 가보에 들어간다.'));
  body.appendChild(d);

  const wrap=el('div','pouch-wrap');
  const sr=el('div','sub-row');sr.appendChild(el('div','sub','가보로 가공하기'));sr.appendChild(el('span','small','보따리 속 가보를 고르고 소지품을 넣으면 가공된다'));wrap.appendChild(sr);
  const tabs=el('div','tooltabs');
  Object.keys(HEIR).forEach(t=>{const b=el('button','tooltab');b.type='button';b.setAttribute('aria-pressed',t===pouch.tool);
    b.appendChild(icon(t));b.appendChild(el('span',null,HEIR[t].short));if(!isAwake(t))b.appendChild(el('span','q','?'));
    b.onclick=()=>switchTool(t);tabs.appendChild(b);});
  wrap.appendChild(tabs);
  const Hr=HEIR[pouch.tool],awake=isAwake(pouch.tool);
  const card=el('div','heir'+(awake?'':' sleep'));
  const art=el('div','art');art.appendChild(icon(pouch.tool));card.appendChild(art);
  const tx=el('div','txt');tx.appendChild(el('span','state',awake?'깨어난 가보':'잠든 가보'));
  tx.appendChild(el('div','title',Hr.title));tx.appendChild(el('div','gen',Hr.gen));tx.appendChild(el('div','story',Hr.story));
  if(!awake&&Hr.hint)tx.appendChild(el('div','hint',Hr.hint));
  card.appendChild(tx);const seal=el('span','seal','너');seal.setAttribute('aria-label','너구리 집안 낙관');card.appendChild(seal);
  wrap.appendChild(card);
  const bench=el('div','bench');
  const ins=el('div','ins');
  for(let i=0;i<3;i++){const id=pouch.items[i];const s=el('button','inslot'+(id?' full':'')+(pop&&id&&i===pouch.items.length-1?' pop':''));s.type='button';
    if(id){s.appendChild(icon(id));s.setAttribute('aria-label',ITEMS[id].n+' 꺼내기');s.onclick=()=>takeOut(i);}
    else{s.textContent='빈칸';s.disabled=true;}
    ins.appendChild(s);}
  bench.appendChild(ins);bench.appendChild(el('span','arrow','→'));
  const pb=el('div','pouch'+(pouch.items.length?' has':''));pb.style.setProperty('--glow',Hr.glow);
  pb.appendChild(el('div','glow'));const relic=icon(pouch.tool);relic.className='relic';pb.appendChild(relic);pb.setAttribute('aria-label',Hr.title);
  [[-34,-30],[30,-34],[-40,4],[40,0],[-18,-46],[16,-48]].forEach(([dx,dy])=>{const k=el('span','spk');k.style.setProperty('--dx',dx+'px');k.style.setProperty('--dy',dy+'px');pb.appendChild(k);});
  bench.appendChild(pb);bench.appendChild(el('span','arrow','→'));
  const r=matchRecipe();
  const out=el('div','outslot'+(lastOut?' got':r?' ghost':''));
  if(lastOut)out.appendChild(icon(lastOut));else if(r)out.appendChild(icon(r.out));else out.textContent='?';
  out.setAttribute('aria-label',lastOut?ITEMS[lastOut].n+' 완성':r?ITEMS[r.out].n+' 예정':'결과');
  bench.appendChild(out);wrap.appendChild(bench);
  const msg=el('div','bench-msg',pouchMsg||(awake?(Hr.prompt||'넣을 것을 골라 보자.'):'쓰는 법을 아직 모른다. 무엇을 넣으면 반응할까?'));msg.id='benchMsg';wrap.appendChild(msg);
  const rl=el('div','recipes');
  if(awake)(RECIPES[pouch.tool]||[]).forEach(rc=>{const it=el('span','recipe');it.appendChild(el('span',null,'아는 쓰는 법 ·'));
    Object.keys(rc.need).forEach(k=>{it.appendChild(icon(k));it.appendChild(el('span',null,ITEMS[k].n+' ×'+rc.need[k]));});
    it.appendChild(el('span',null,'→'));it.appendChild(icon(rc.out));it.appendChild(el('span',null,ITEMS[rc.out].n));rl.appendChild(it);});
  else rl.appendChild(el('span',null,'아직 깨어나지 않은 가보다. 넣어 보는 건 자유다.'));
  wrap.appendChild(rl);
  const cb=el('button','btn primary craft',brewing?'가공 중…':'가공하기');cb.type='button';cb.id='craftBtn';cb.disabled=brewing||!pouch.items.length;cb.onclick=craft;wrap.appendChild(cb);
  body.appendChild(wrap);

  const wt=heldTool();const wl=el('div','weapon');wl.appendChild(icon(wt));
  const wd=el('div');wd.appendChild(el('b',null,'손에 든 연장 · '+TOOLS[wt].n+(G.sharp?' (날 세움)':'')));wd.appendChild(el('div','small',TOOLS[wt].d));wl.appendChild(wd);
  body.appendChild(wl);
  body.scrollTop=sc;
}
