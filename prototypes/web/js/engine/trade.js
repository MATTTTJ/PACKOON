'use strict';
/* 보부상 교환: 서로 보따리를 펼쳐 놓고 바꾼다.
   결정 D-39: 상대가 내놓은 물건마다 원하는 것이 그림으로 붙어 있다. 내 보따리에서 골라 얹고 제안하면 상대가 받거나 거절한다.
     · 부탁: 이야기에 걸린 교환. 지역 코드가 REG.trade[npc]()로 넣는다.
         {id, item(그림), n, label?(물건이 아닌 것: 정보·허락), asks:[{물건id:개수}, …대체], locked?()→이유, done?(), accept(대체번호)}
       상대가 무엇을 원하는지 들은 뒤에만 넣는다(인과). 받은 뒤의 대사·물건 주고받기는 지역 코드가 이어 간다.
     · 흔한 물건: design/data/stock.csv. 값은 레어도 단계로만 맞춘다: 같은 단계 하나, 또는 한 단계 아래 둘(하품은 하품 하나).
       상대가 좋아하는 맛(tastes.csv)은 한 단계 위로 쳐 준다. 귀한 것·도구, 아직 쓸 데가 남은 물건은 흔한 물건과 바꾸지 않는다.
   결정 D-40: 흥정은 성공·실패가 아니라 조건의 차이다(기획서 §5). 허세·사정·칭찬 중 상대 성격에 맞는 말이면
     덤(흔한 물건 하나 더)이나 호감이 붙고, 싫어하는 말이면 그 지역에서는 흥정만 닫힌다. 값은 그대로라 교환은 언제든 된다.
     흥정은 지역마다 상대 하나에 한 번(좋아함·싫어함으로 끝난다). 본 반응은 버튼에 남는다. 대사는 haggle.csv.
     지역 코드의 REG.onHaggle(npc,방식)이 true를 돌려주면 덤을 지역 이야기가 맡는다(날쌘: 허세 부리면 그 지역 거래에 덤). */
const Trade=(()=>{
  const WAYS=['허세','사정','칭찬'];
  let S=null;
  function npcName(id){
    const n=REG.npcs.find(n=>n.id===id)||Object.values(REG.zones||{}).flatMap(z=>(z.npcs||[]).filter(p=>typeof p==='object')).find(p=>p.id===id);
    return n?.name||id;
  }
  const rank=r=>['하품','중품','상품','최상품','천하일품'][r]||'';
  const liked=(npc,id)=>{const t=tasteOf(npc,id);return !!t&&['아주 좋아함','좋아함'].includes(t.kind);};
  const step=(npc,id)=>ITEMS[id].r+(liked(npc,id)?1:0);
  const key=npc=>G.region+':'+npc;
  const stockLeft=row=>row.times-(G.f.stockUsed?.[row.id]||0);
  const stockOf=npc=>(TABLES.STOCK||[]).filter(r=>r.region===G.region&&r.npc===npc);
  /* 결정 D-123: 상대가 지녔다고 말한 물건은 바꿀 수 없을 때도 보따리에 보인다(인과: 아이가 들은 것만 보인다).
     상태는 넷이다. 열림 / 거래 불가(잠김: 지역 조건) / 거래 불가(값: 지금 내 보따리로는 못 맞춤) / 다 바꿈. 바꿀 수 있는 것부터 늘어놓는다. */
  function goodsOf(npc){
    const story=(REG.trade?.[npc]?.()||[]).map(g=>({...g,kind:'story'}));
    const common=stockOf(npc).map(r=>({id:r.id,item:r.item,n:r.n,kind:'common',row:r}));
    const order={open:0,short:1,lock:2,done:3};
    return [...story,...common].map((g,i)=>({g,i,k:stateOf(g).k})).sort((a,b)=>order[a.k]-order[b.k]||a.i-b.i).map(x=>x.g);
  }
  function stateOf(g){
    if(g.kind==='story'?g.done?.():stockLeft(g.row)<=0)return {k:'done',why:'다 바꿨다.'};
    const lock=g.locked?.();if(lock)return {k:'lock',why:lock};
    if(g.kind==='story'){
      if(!g.asks.some(a=>Object.entries(a).every(([id,n])=>has(id,n))))return {k:'short',why:'지금 보따리로는 못 바꾼다. 필요한 것: '+g.asks.map(askText).join(', 또는 ')+'.'};
    }else{
      const need=ITEMS[g.item].r,ok=id=>!offerBlock(g,id,{});
      const units=Object.keys(G.inv).filter(id=>G.inv[id]>0&&ITEMS[id]&&ok(id));
      const one=units.some(id=>step(npcOf(g),id)>=need);
      const two=need>0&&units.reduce((s,id)=>s+(step(npcOf(g),id)>=need-1?G.inv[id]:0),0)>=2;
      if(!one&&!two)return {k:'short',why:'지금 보따리에 값이 맞는 물건이 없다. '+priceText(g)+'면 된다.'};
    }
    return {k:'open'};
  }
  const npcOf=g=>g.row?.npc||S?.npc;
  const priceText=g=>{const r=ITEMS[g.item].r;return r?rank(r)+' 하나, 또는 '+rank(r-1)+' 둘':rank(0)+' 하나';};
  const askText=a=>Object.entries(a).map(([id,n])=>ITEMS[id].n+' '+n).join(' + ');
  /* 결정 D-124: 값은 레어도 단계가 먼저, 수량이 나중이다. 단계가 모자라면 몇 개를 얹었든 단계 이야기만 한다. */
  function commonMatch(g,offer){
    const ids=Object.entries(offer).flatMap(([id,n])=>Array(n).fill(id)),need=ITEMS[g.item].r;
    if(!ids.length)return {ok:false,why:'내놓을 물건을 얹어야 한다.'};
    if(ids.includes(g.item))return {ok:false,why:'같은 물건끼리는 바꾸지 않는다.'};
    const kinds=[...new Set(ids)],tag=id=>ITEMS[id].n+'('+rank(step(S.npc,id))+')';
    // 조사는 괄호 앞 낱말(물건 이름) 받침에 맞춘다: 도토리(하품)로는 / 꾀꼬리버섯(상품)으로는
    const josa=(list,a,b)=>{const last=ITEMS[list[list.length-1]].n;return list.map(tag).join('·')+jo(last,a,b).slice(last.length);};
    const best=Math.max(...kinds.map(id=>step(S.npc,id)));
    const head=jo(ITEMS[g.item].n,'은','는')+' '+rank(need)+'이다. ';
    // 1) 단계: 하나로도, 한 단계 아래 둘로도 닿지 않으면 단계만 말한다
    if(best<need-(need>0?1:0))return {ok:false,why:head+josa(kinds,'으로는','로는')+' 안 된다.'};
    if(best<need){
      const low=kinds.filter(id=>step(S.npc,id)<need-1);
      if(low.length)return {ok:false,why:head+josa(low,'은','는')+' 값이 모자라다. '+jo(rank(need-1),'이라면','라면')+' 둘이어야 한다.'};
      // 2) 수량: 한 단계 아래 물건은 둘
      if(ids.length!==2)return {ok:false,why:jo(rank(need-1),'으로는','로는')+' 둘이어야 한다. 지금 '+ids.length+'개다.'};
      return {ok:true};
    }
    // 2) 수량: 같은 단계 이상이면 하나로 충분하다
    if(ids.length===1)return {ok:true};
    if(ids.length===2&&need>0&&ids.every(id=>step(S.npc,id)>=need-1))return {ok:true};
    return {ok:false,why:rank(need)+' 하나면 된다. 나머지는 빼자.'};
  }
  function storyMatch(g,offer){
    const keys=Object.keys(offer).filter(id=>offer[id]>0);
    const i=g.asks.findIndex(a=>Object.keys(a).length===keys.length&&keys.every(id=>a[id]===offer[id]));
    if(i>=0)return {ok:true,alt:i};
    // 결정 D-124: 물건이 맞는지 먼저, 그다음 수를 본다
    const same=g.asks.find(a=>Object.keys(a).length===keys.length&&keys.every(id=>a[id]));
    if(same)return {ok:false,why:'물건은 맞다. 수를 맞추자: '+askText(same)+'.'};
    return {ok:false,why:'원하는 건 '+g.asks.map(askText).join(', 또는 ')+'이다.'};
  }
  // 이 물건을 지금 고른 교환에 얹을 수 있는가. 못 얹으면 까닭을 돌려준다.
  function blocked(id){
    const g=S.goods.find(g=>g.id===S.sel);
    if(!g)return '먼저 받을 물건을 고른다.';
    const st=stateOf(g);if(st.k==='done'||st.k==='lock')return st.why;
    return offerBlock(g,id,S.offer);
  }
  function offerBlock(g,id,offer){
    if(g.kind==='story')return g.asks.some(a=>a[id])?null:'이 부탁과는 상관없는 물건이다.';
    if(id===g.item)return '같은 물건끼리는 바꾸지 않는다.';
    if(keepsake(id))return /^(dad|mom)_/.test(id)?'집안 물건은 내놓지 않는다.':'귀한 것은 흔한 물건과 바꾸지 않는다.';   // 결정 D-63
    const now={...G.inv,[id]:(G.inv[id]||0)-(offer[id]||0)};
    if(progressShortage({...now,[id]:now[id]-1})>progressShortage(now))return '아직 쓸 데가 있다.';
    return null;
  }
  function open(npc){
    closePanels();
    S={npc,name:npcName(npc),goods:goodsOf(npc),sel:null,offer:{},tried:{},log:[]};
    S.sel=(S.goods.find(g=>g.kind==='story'&&stateOf(g).k==='open')||S.goods.find(g=>stateOf(g).k==='open')||S.goods[0])?.id||null;
    Sound.panel(true);render();$('trade').hidden=false;$('tradeBody').scrollTop=0;
    setTimeout(()=>{const f=$('tradeBody').querySelector('.trade-good');if(f&&matchMedia('(pointer:fine)').matches)f.focus();},0);
  }
  function close(){if(!$('trade').hidden){Sound.panel(false);$('trade').hidden=true;}S=null;}
  function picture(id,n){const s=el('span','trade-ask');s.appendChild(icon(id));if(n>1)s.appendChild(el('b',null,'×'+n));s.title=ITEMS[id].n+(n>1?' '+n:'');return s;}
  function haggleState(){
    const used=G.f.haggleUsed?.[key(S.npc)];
    if(G.f.haggleBonus?.[key(S.npc)])return '덤을 하나 얹어 주기로 했다.';
    return used==='좋아함'?'흥정은 이미 잘 끝났다.':used==='싫어함'?'흥정은 그만두자. 값은 그대로다.':'흥정:';
  }
  function render(){
    const body=$('tradeBody');body.innerHTML='';
    $('tradeTitle').textContent=jo(S.name,'과','와')+' 보따리 펼치기';
    const wrap=el('div','trade-wrap');
    // 상대가 내놓은 물건과, 그 값으로 원하는 것
    const theirs=el('section','trade-side');theirs.appendChild(el('h3',null,S.name+'의 물건'));
    if(!S.goods.some(g=>['open','short'].includes(stateOf(g).k)))theirs.appendChild(el('p','small','지금은 바꿀 물건이 없다.'));
    for(const g of S.goods){
      const st=stateOf(g),lock=st.k==='open'?null:st.why,b=el('button','trade-good'+(st.k==='done'||st.k==='lock'?' off':''));b.type='button';b.dataset.good=g.id;b.dataset.state=st.k;
      b.setAttribute('aria-pressed',String(S.sel===g.id));
      // 결정 D-112: 물건이 아닌 정보(info:true)는 찢긴 수첩 쪽 아이콘으로 그리고, 이름은 "~에 대한 정보"로 적는다.
      const head=el('span','trade-good-head');head.appendChild(icon(g.info?'torn_page':(g.icon||g.item)));
      head.appendChild(el('b',null,(g.label||ITEMS[g.item].n)+(g.n>1?' ×'+g.n:'')));
      if(!g.label)head.appendChild(rarityIcon(ITEMS[g.item].r));
      head.appendChild(el('span','chip',g.info?'정보':g.kind==='story'?'부탁':'흔한 물건'));
      if(st.k!=='open')head.appendChild(el('span','chip trade-state '+st.k,st.k==='done'?'다 바꿈':'거래 불가'));
      b.appendChild(head);
      const asks=el('span','trade-asks');
      if(st.k==='done'||st.k==='lock')asks.appendChild(el('span','small',lock));
      else if(g.kind==='story')g.asks.forEach((a,i)=>{
        if(i)asks.appendChild(el('span','small','또는'));
        Object.entries(a).forEach(([id,n],k)=>{if(k)asks.appendChild(el('span','plus','+'));asks.appendChild(picture(id,n));});
      });
      else{asks.appendChild(el('span','small',priceText(g)));asks.appendChild(el('span','small','· 남은 '+stockLeft(g.row)+'번'));}
      b.appendChild(asks);
      if(st.k==='short')b.appendChild(el('span','small trade-why',st.why));
      b.setAttribute('aria-label',(g.label||ITEMS[g.item].n)+'. '+(lock||(g.kind==='story'?'원하는 것: '+g.asks.map(askText).join(', 또는 '):priceText(g))));
      b.onclick=()=>{if(S.sel!==g.id){S.sel=g.id;S.offer={};}render();};
      theirs.appendChild(b);
    }
    // 내 보따리
    const mine=el('section','trade-side');mine.appendChild(el('h3',null,'내 보따리'));
    const grid=el('div','bag-grid');
    const ids=Object.keys(G.inv).filter(id=>G.inv[id]>0&&ITEMS[id]);
    if(!ids.length)mine.appendChild(el('p','small','보따리가 비었다.'));
    for(const id of ids){
      const left=G.inv[id]-(S.offer[id]||0),why=blocked(id);
      const s=el('button','slot');s.type='button';s.dataset.item=id;
      s.appendChild(icon(id));s.appendChild(el('span','n',left));s.appendChild(rarityIcon(ITEMS[id].r));
      if(liked(S.npc,id))s.appendChild(el('span','trade-like','좋아함'));
      s.title=ITEMS[id].n+(why?' — '+why:'');s.setAttribute('aria-label',ITEMS[id].n+' '+left+'개'+(why?'. '+why:''));
      s.disabled=!!why||left<=0;
      s.onclick=()=>{if(blocked(id)||G.inv[id]-(S.offer[id]||0)<=0)return;S.offer[id]=(S.offer[id]||0)+1;render();};
      grid.appendChild(s);
    }
    mine.appendChild(grid);
    // 결정 D-111: 내 보따리가 왼쪽(휴대폰에서는 위), 상대 물건이 오른쪽이다.
    wrap.appendChild(mine);wrap.appendChild(theirs);body.appendChild(wrap);
    // 내가 내놓을 것, 흥정, 제안
    const tray=el('section','trade-tray');tray.appendChild(el('h3',null,'내가 내놓을 것'));
    const chips=el('div','trade-offer');
    const offered=Object.entries(S.offer).filter(([,n])=>n>0);
    if(!offered.length)chips.appendChild(el('span','small','내 보따리에서 물건을 눌러 얹는다. 얹은 물건을 누르면 뺀다.'));
    for(const [id,n] of offered){
      const c=el('button','trade-chip');c.type='button';c.appendChild(picture(id,n));c.appendChild(el('span',null,ITEMS[id].n));
      c.setAttribute('aria-label',ITEMS[id].n+' '+n+'개. 누르면 하나 뺀다');
      c.onclick=()=>{S.offer[id]--;if(!S.offer[id])delete S.offer[id];render();};chips.appendChild(c);
    }
    tray.appendChild(chips);
    const row=el('div','trade-actions');
    // 결정 D-125: 상대에게 지금 바꿀 수 있는 물건(열림·값 부족)이 하나도 없으면 흥정 줄을 숨긴다.
    if(TABLES.HAGGLE?.[S.npc]&&S.goods.some(g=>['open','short'].includes(stateOf(g).k))){
      const hag=el('div','trade-haggle'),closed=!!G.f.haggleUsed?.[key(S.npc)];
      hag.appendChild(el('span','small',haggleState()));
      if(!closed)for(const way of WAYS){
        const seen=G.f.haggleSeen?.[S.npc+':'+way],b=el('button','btn',way+(seen?' · '+seen:''));b.type='button';b.dataset.way=way;
        b.disabled=!!S.tried[way];b.onclick=()=>haggle(way);hag.appendChild(b);
      }
      row.appendChild(hag);
    }
    const go=el('button','btn primary','제안하기');go.type='button';go.id='tradePropose';go.disabled=!offered.length||!S.sel;go.onclick=propose;row.appendChild(go);
    tray.appendChild(row);
    const log=el('div','trade-log');log.setAttribute('role','status');log.setAttribute('aria-live','polite');
    for(const l of S.log.slice(-3)){const p=el('p');if(l.who)p.appendChild(el('b',null,l.who+' '));p.appendChild(document.createTextNode(l.line));log.appendChild(p);}
    tray.appendChild(log);body.appendChild(tray);
  }
  function haggle(way){
    const rows=TABLES.HAGGLE[S.npc][way],r=rows[G.region]||rows.all;
    if(!r||G.f.haggleUsed?.[key(S.npc)])return;
    S.tried[way]=true;(G.f.haggleSeen=G.f.haggleSeen||{})[S.npc+':'+way]=r.kind;
    S.log.push({who:'너구리',line:r.kid},{who:S.name,line:r.line});
    if(r.kind!=='그저 그럼')(G.f.haggleUsed=G.f.haggleUsed||{})[key(S.npc)]=r.kind;
    if(r.kind==='좋아함'){
      if(!REG.onHaggle?.(S.npc,way)){
        if(stockOf(S.npc).some(row=>stockLeft(row)>0))(G.f.haggleBonus=G.f.haggleBonus||{})[key(S.npc)]=true;
        else if(G.rel[S.npc])rel(S.npc,1);
      }
      Sound.exchange();
    }
    learn('haggle:'+S.npc+':'+way);S.goods=goodsOf(S.npc);render();   // 덤이 붙은 부탁은 개수가 바로 바뀐다
  }
  function propose(){
    const g=S.goods.find(g=>g.id===S.sel);if(!g)return;
    const st=stateOf(g);if(st.k==='done'||st.k==='lock'){S.log.push({who:'',line:st.why});render();return;}
    const m=g.kind==='story'?storyMatch(g,S.offer):commonMatch(g,S.offer);
    if(!m.ok){S.log.push({who:'',line:'('+jo(S.name,'이','가')+' 고개를 젓는다.) '+m.why});render();return;}
    if(g.kind==='story'){close();g.accept(m.alt);return;}
    for(const [id,n] of Object.entries(S.offer))takeItem(id,n);
    const bonus=!!G.f.haggleBonus?.[key(S.npc)],n=g.n+(bonus?1:0);
    if(bonus)delete G.f.haggleBonus[key(S.npc)];
    addItem(g.item,n);(G.f.stockUsed=G.f.stockUsed||{})[g.row.id]=(G.f.stockUsed[g.row.id]||0)+1;
    learn('trade:'+g.row.id);Sound.exchange();
    S.log.push({who:'',line:'('+S.name+'에게서 '+ITEMS[g.item].n+' '+n+'개를 받았다.'+(bonus?' 덤이 하나 붙었다.':'')+')'});
    S.offer={};S.goods=goodsOf(S.npc);if(stateOf(S.goods.find(x=>x.id===S.sel)||{}).k!=='open')S.sel=(S.goods.find(x=>stateOf(x).k==='open')||S.goods[0])?.id||null;render();
  }
  $('tradeClose').onclick=()=>closePanels();
  /* 흔한 물건이 남은 상대와 이야기할 때는 대화창에 '보따리 펼치기'를 늘 둔다. 부탁을 마친 뒤에도 바꿀 수 있게.
     대화 선택지에 이미 '보따리를 펼친다'가 있으면 두지 않는다. */
  const quick=el('div','field-taste trade-quick');quick.hidden=true;$('dlg').querySelector('.dbody').appendChild(quick);
  const quickBtn=el('button','btn','보따리 펼치기');quickBtn.type='button';quick.appendChild(quickBtn);
  quick.addEventListener('click',e=>e.stopPropagation());
  function quickNpc(){
    if(!G||!REG||B||$('dlg').hidden)return null;
    const n=fieldNpcs().find(n=>n.name===$('dlgWho').textContent);
    // 결정 D-77: 부탁이 남은 상대(눈돌·진흙·비늘 같은 뒤늦은 부탁)도 대화창에서 바로 펼친다.
    return n&&(stockOf(n.id).some(r=>stockLeft(r)>0)||(REG.trade?.[n.id]?.()||[]).some(g=>!g.done?.()))?n.id:null;
  }
  function renderQuick(){
    const npc=quickNpc(),dup=[...$('dlgChoices').children].some(b=>b.textContent==='보따리를 펼친다');
    quick.hidden=!npc||dup;quick.dataset.npc=npc||'';
  }
  quickBtn.onclick=()=>{const npc=quick.dataset.npc;if(!npc)return;$('dlg').hidden=true;dlgQ=[];dlgEnd=null;open(npc);};
  for(const id of ['dlgWho','dlgChoices'])new MutationObserver(renderQuick).observe($(id),{childList:true,characterData:true,subtree:true});
  new MutationObserver(renderQuick).observe($('dlg'),{attributes:true,attributeFilter:['hidden']});
  return {open,close,get state(){return S;}};
})();
