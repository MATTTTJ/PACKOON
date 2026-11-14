'use strict';
/* 보부상 교환: 서로 보따리를 펼쳐 놓고 바꾼다.
   결정 D-39: 상대가 내놓은 물건마다 원하는 것이 그림으로 붙어 있다. 내 보따리에서 골라 얹고 제안하면 상대가 받거나 거절한다.
     · 부탁: 이야기에 걸린 교환. 지역 코드가 REG.trade[npc]()로 넣는다.
         {id, item(그림), n, label?(물건이 아닌 것: 정보·허락), asks:[{물건id:개수}, …대체], extra?:[덤|null, …], locked?()→이유, done?(), accept(대체번호)}
       결정 D-1102: 한 대체가 다른 대체에 재료를 더 얹은 꼴이면 그만한 덤을 extra[같은 번호]={물건id:개수}로 적는다. 창에 '덤'으로 보인다.
         덤 없는 상위 조합은 자동 검사(qa data, ask-checks.js)가 막는다 (사용자 피드백 2026-11-07).
       정보·허락·나중에 생긴 부탁은 상대가 무엇을 원하는지 들은 뒤에만 넣는다(인과). 결정 D-147: 상대가 처음부터 지닌 물건
       (날쌘의 소금·깨, 참기름, 떡 재료, 대추)은 만나자마자 보인다. 사연을 듣기 전에 바꾸면 받는 대사가 그 사연을 먼저 꺼낸다.
       받은 뒤의 대사·물건 주고받기는 지역 코드가 이어 간다.
     · 흔한 물건: design/data/stock.csv. 값은 레어도 단계로만 맞춘다: 같은 단계 하나, 또는 한 단계 아래 둘(하품은 하품 하나).
       상대가 좋아하는 맛(tastes.csv)은 한 단계 위로 쳐 준다. 귀한 것·도구, 아직 쓸 데가 남은 물건은 흔한 물건과 바꾸지 않는다.
   결정 D-40: 흥정은 성공·실패가 아니라 조건의 차이다(기획서 §5). 허세·사정·칭찬 중 상대 성격에 맞는 말이면
     덤(흔한 물건 하나 더)이나 호감이 붙고, 싫어하는 말이면 그 지역에서는 흥정만 닫힌다. 값은 그대로라 교환은 언제든 된다.
     흥정은 지역마다 상대 하나에 한 번(좋아함·싫어함으로 끝난다). 본 반응은 버튼에 남는다. 대사는 haggle.csv.
     지역 코드의 REG.onHaggle(npc,방식)이 true를 돌려주면 덤을 지역 이야기가 맡는다(날쌘: 허세 부리면 그 지역 거래에 덤). */
/* 결정 D-402 (사용자 피드백 2026-11-03): 변신한 채 만난 인물의 손님 교환도 이 창에서 한다(openGuest).
     대화에는 "도토리 4 → 소금" 같은 목록을 늘어놓지 않고 '보따리를 펼친다'만 둔다. 손님 물건은 부탁처럼 원하는 물건 그림이 붙고,
     값은 손님 값(strangers.js price)이다. 한 고을에서 바꿀 수 있는 횟수(stranger_trade_limit)를 다 쓰면 목록이 빈다.
     손님은 아이를 모르니 흥정 줄과 '좋아함' 표시는 두지 않는다. 바꾸고 나도 창은 닫히지 않는다. */
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
  /* 결정 D-123: 상대가 지닌 물건은 바꿀 수 없을 때도 보따리에 보인다.
     결정 D-147: 상태는 셋이다. 열림 / 값 부족(지금 내 보따리로는 못 맞춤) / 잠김(지역 조건). '거래 불가' 딱지는 달지 않는다.
       값이 모자라면 원하는 물건 그림 가운데 모자란 것만 흐리게 하고 가진 수/필요한 수를 붙인다.
       다 바꿔서 남은 게 없는 물건은 목록에서 뺀다. 바꿀 수 있는 것부터 늘어놓는다. */
  function goodsOf(npc){
    const story=(REG.trade?.[npc]?.()||[]).map(g=>({...g,kind:'story'}));
    const common=stockOf(npc).map(r=>({id:r.id,item:r.item,n:r.n,kind:'common',row:r}));
    const order={open:0,short:1,lock:2};
    return [...story,...common].map((g,i)=>({g,i,k:stateOf(g).k})).filter(x=>x.k!=='done').sort((a,b)=>order[a.k]-order[b.k]||a.i-b.i).map(x=>x.g);
  }
  function stateOf(g){
    if(asked(g)?g.done?.():stockLeft(g.row)<=0)return {k:'done',why:'다 바꿨다.'};
    const lock=g.locked?.();if(lock)return {k:'lock',why:lock};
    if(asked(g)){
      if(!g.asks.some(a=>Object.entries(a).every(([id,n])=>has(id,n))))return {k:'short',why:'지금 보따리로는 못 바꾼다. 필요한 것:'+asksList(g)};
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
  const asked=g=>g.kind!=='common';   // 부탁·손님 교환: 원하는 물건이 정해져 있다
  const priceText=g=>{const r=ITEMS[g.item].r;return r?rank(r)+' 하나나 '+rank(r-1)+' 둘':rank(0)+' 하나';};
  const askText=a=>Object.entries(a).map(([id,n])=>ITEMS[id].n+' '+n).join(' + ');
  // 결정 D-925: 글로 말할 때도 바꾸는 법을 '또는'으로 잇지 않고 한 줄에 하나씩 (교환 기록은 줄바꿈을 그대로 보인다)
  const asksList=g=>g.asks.length>1?'\n'+g.asks.map((a,i)=>'· '+askText(a)+extraText(g.extra?.[i])).join('\n'):' '+askText(g.asks[0])+'.';
  const priceRows=g=>{const r=ITEMS[g.item].r;return r?[rank(r)+' 하나',rank(r-1)+' 둘']:[rank(0)+' 하나'];};
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
    const low=need>0?kinds.filter(id=>step(S.npc,id)<need-1):[];
    if(low.length)return {ok:false,why:head+josa(low,'은','는')+' 값이 모자라다. '+jo(rank(need-1),'이라면','라면')+' 둘이어야 한다.'};
    /* 결정 D-905 (사용자 피드백 2026-11-06 "도토리 3개 올리면 메밀 3개로 바로 교환"): 한 번 몫의 몇 배를 얹어도 한 번에 바꾼다.
       같은 단계 이상 물건은 하나가 한 몫, 한 단계 아래 물건은 둘이 한 몫이다. 몫은 상대가 남긴 횟수(stock.csv 횟수)까지만 친다.
       몫을 채우지 못하고 남는 물건(한 단계 아래 하나, 횟수를 넘은 몫)은 받지 않고 보따리에 그대로 둔다.
       횟수를 넘으면 값이 낮은 물건부터 쓰고 좋은 물건을 돌려준다. */
    const hi=ids.filter(id=>step(S.npc,id)>=need).sort((a,b)=>step(S.npc,a)-step(S.npc,b)),lo=ids.filter(id=>step(S.npc,id)<need);
    if(!hi.length&&lo.length<2)return {ok:false,why:jo(rank(need-1),'으로는','로는')+' 둘이어야 한다. 지금 '+lo.length+'개다.'};
    const cap=stockLeft(g.row),use={};let k=0;
    for(let i=0;i+1<lo.length&&k<cap;i+=2,k++){use[lo[i]]=(use[lo[i]]||0)+1;use[lo[i+1]]=(use[lo[i+1]]||0)+1;}
    for(const id of hi){if(k>=cap)break;use[id]=(use[id]||0)+1;k++;}
    return {ok:true,k,use,back:leftOver(offer,use)};
  }
  const leftOver=(offer,use)=>Object.fromEntries(Object.entries(offer).map(([id,n])=>[id,n-(use[id]||0)]).filter(([,n])=>n>0));
  /* 결정 D-905: 몇 번이고 하는 교환(손님 교환, 지역이 multi 로 연 부탁)은 원하는 묶음의 몇 배든 한 번에 바꾼다.
     cap 은 남은 횟수. 묶음을 채우지 못한 나머지는 보따리에 그대로 둔다. 한 번만 하는 부탁(이야기 교환)은 묶음과 똑같아야 한다. */
  function multiMatch(g,offer,cap){
    const keys=Object.keys(offer).filter(id=>offer[id]>0);
    for(let i=0;i<g.asks.length;i++){
      const a=g.asks[i];
      if(Object.keys(a).length!==keys.length||!keys.every(id=>a[id]))continue;
      const k=Math.min(cap,...keys.map(id=>Math.floor(offer[id]/a[id])));
      if(k<1)continue;
      const use=Object.fromEntries(keys.map(id=>[id,a[id]*k]));
      return {ok:true,alt:i,k,use,back:leftOver(offer,use)};
    }
    return null;
  }
  const guestLeft=()=>Math.max(0,TABLES.TUNING.stranger_trade_limit-strangerUsed(S.guest.npc.id));
  function storyMatch(g,offer){
    const keys=Object.keys(offer).filter(id=>offer[id]>0);
    const i=g.asks.findIndex(a=>Object.keys(a).length===keys.length&&keys.every(id=>a[id]===offer[id]));
    if(i>=0&&g.kind==='story'&&!g.multi)return {ok:true,alt:i,k:1};
    const multi=g.kind==='guest'?multiMatch(g,offer,guestLeft()):g.multi?multiMatch(g,offer,typeof g.multi==='function'?g.multi():Infinity):null;
    if(multi)return multi;
    if(i>=0)return {ok:true,alt:i,k:1};
    // 결정 D-124: 물건이 맞는지 먼저, 그다음 수를 본다
    const same=g.asks.find(a=>Object.keys(a).length===keys.length&&keys.every(id=>a[id]));
    if(same)return {ok:false,why:'물건은 맞다. 수를 맞추자: '+askText(same)+'.'};
    return {ok:false,why:'원하는 것:'+asksList(g)};
  }
  // 이 물건을 지금 고른 교환에 얹을 수 있는가. 못 얹으면 까닭을 돌려준다.
  function blocked(id){
    const g=S.goods.find(g=>g.id===S.sel);
    if(!g)return '먼저 받을 물건을 고른다.';
    const st=stateOf(g);if(st.k==='done'||st.k==='lock')return st.why;
    return offerBlock(g,id,S.offer);
  }
  function offerBlock(g,id,offer){
    if(asked(g))return g.asks.some(a=>a[id])?null:g.kind==='guest'?'이 교환과는 상관없는 물건이다.':'이 부탁과는 상관없는 물건이다.';
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
  function guestGoods(){
    const {npc,e}=S.guest,limit=TABLES.TUNING.stranger_trade_limit,spent=()=>strangerUsed(npc.id)>=limit;
    return (Array.isArray(e.trades)?e.trades:[]).filter(t=>validItems(t?.give)&&validItems(t?.get)).map((t,i)=>{
      const give=priced(e,t.give),[[item,n]]=Object.entries(t.get);
      return {id:'guest'+i,item,n,kind:'guest',asks:[give],done:spent,accept:()=>strangerTrade(npc,give,t.get)};
    });
  }
  function openGuest(npc,e){
    closePanels();
    S={npc:npc.id,name:npc.name||'손님',guest:{npc,e},goods:[],sel:null,offer:{},tried:{},log:[]};
    S.goods=guestGoods();S.sel=(S.goods.find(g=>stateOf(g).k==='open')||S.goods[0])?.id||null;
    Sound.panel(true);render();$('trade').hidden=false;$('tradeBody').scrollTop=0;
  }
  function close(){hideTip();if(!$('trade').hidden){Sound.panel(false);$('trade').hidden=true;}S=null;}
  /* 결정 D-1101: 물건 그림에 마우스를 올리면 작은 정보 창이 뜬다 (사용자 피드백 2026-11-07 "그림만 봐서는 구분이 안 되는 경우가 있다").
     이름·품·한 줄 설명(items.csv 설명)과 가진 수(원하는 물건 그림이면 필요한 수도). 휴대폰은 그림을 꾹 누르거나(보따리 칸) 한 번 누르면(원하는 물건 그림) 뜨고
     잠시 뒤 사라진다. 창은 교환 창 밖 맨 위 겹에 고정 위치로 띄워, 창이 다시 그려져도(render) 그 자리에 남는다. */
  const tip=el('div','trade-tip');tip.id='tradeTip';tip.hidden=true;tip.setAttribute('role','tooltip');document.body.appendChild(tip);
  let tipEl=null,tipHide=0,tipPress=0;
  function tipOn(node,id,need,why){node.dataset.tip=id;if(need)node.dataset.need=need;if(why)node.dataset.why=why;return node;}
  function hideTip(){clearTimeout(tipHide);clearTimeout(tipPress);tip.hidden=true;tipEl=null;}
  function showTip(node,ms){
    const id=node?.dataset.tip,it=ITEMS[id];if(!it)return;
    clearTimeout(tipHide);tipEl=node;tip.innerHTML='';
    const head=el('div','trade-tip-head');head.appendChild(icon(id));head.appendChild(el('b',null,it.n));head.appendChild(rarityIcon(it.r));head.appendChild(el('span','small',rank(it.r)));
    tip.appendChild(head);
    if(it.d)tip.appendChild(el('p',null,it.d));
    const have=G.inv[id]||0,need=+node.dataset.need||0;
    tip.appendChild(el('p','trade-tip-count',need?'필요 '+need+'개 · 지금 '+have+'개':node.dataset.extra?'덤으로 더 받는다 · 지금 '+have+'개':'가진 것 '+have+'개'));
    if(node.dataset.why)tip.appendChild(el('p','trade-tip-why',node.dataset.why));
    tip.hidden=false;
    const r=node.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;
    let top=r.top-h-6;if(top<4)top=r.bottom+6;
    tip.style.left=Math.round(clamp(r.left+r.width/2-w/2,4,innerWidth-w-4))+'px';tip.style.top=Math.round(clamp(top,4,innerHeight-h-4))+'px';
    if(ms)tipHide=setTimeout(hideTip,ms);
  }
  const tipTarget=e=>e.target?.closest?.('[data-tip]');
  $('trade').addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const t=tipTarget(e);if(t&&t!==tipEl)showTip(t);});
  $('trade').addEventListener('pointerout',e=>{if(e.pointerType!=='mouse'||!tipEl)return;const to=e.relatedTarget;if(!to||!tipEl.contains(to))hideTip();});
  $('trade').addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;const t=tipTarget(e);clearTimeout(tipPress);if(t)tipPress=setTimeout(()=>showTip(t,TABLES.TUNING.trade_tip_show_ms),TABLES.TUNING.trade_tip_hold_ms);});
  $('trade').addEventListener('pointerup',e=>{
    if(e.pointerType==='mouse')return;clearTimeout(tipPress);
    const t=tipTarget(e);if(t&&t.classList.contains('trade-ask')&&!t.closest('.trade-chip'))showTip(t,TABLES.TUNING.trade_tip_show_ms);   // 원하는 물건 그림은 한 번 눌러도 뜬다
  });
  $('trade').addEventListener('pointercancel',()=>clearTimeout(tipPress));
  $('tradeBody').addEventListener('scroll',hideTip,{passive:true});
  /* 결정 D-1102: 덤 표시. 재료를 더 얹는 조합에는 무엇을 더 받는지 그 줄 끝에 '덤'으로 붙인다 */
  function extraChip(extra){
    const c=el('span','trade-extra');c.appendChild(el('span','trade-extra-tag','덤'));
    for(const [id,n] of Object.entries(extra)){const p=picture(id,n);p.dataset.extra='1';c.appendChild(p);}
    return c;
  }
  const extraText=extra=>extra?' (덤 '+Object.entries(extra).map(([id,n])=>ITEMS[id].n+' '+n).join(', ')+')':'';
  function picture(id,n,need){const s=el('span','trade-ask');s.appendChild(icon(id));if(n>1)s.appendChild(el('b',null,'×'+n));tipOn(s,id,need);return s;}
  // 결정 D-147: 부탁의 원하는 물건 그림. 모자란 물건은 흐리게, 가진 수/필요한 수를 붙인다.
  function askPicture(id,n){
    const have=G.inv[id]||0;if(have>=n)return picture(id,n,n);
    const s=el('span','trade-ask missing');s.appendChild(icon(id));s.appendChild(el('b',null,have+'/'+n));
    tipOn(s,id,n);return s;
  }
  // 결정 D-148: 품 표시 보기. 날쌘이 첫 만남에 말로 알려 준 것(잎·열매)을 화면의 실제 표시로 늘 보여 준다.
  function legend(){
    const d=el('div','trade-legend');d.setAttribute('aria-label','품 표시: 하품, 중품, 상품, 최상품, 천하일품');
    for(let r=0;r<5;r++){const s=el('span','trade-legend-item');s.appendChild(rarityIcon(r));s.appendChild(el('span',null,rank(r)));d.appendChild(s);}
    return d;
  }
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
    if(!S.goods.some(g=>['open','short'].includes(stateOf(g).k)))theirs.appendChild(el('p','small',S.guest&&S.goods.length?'이번 고을에서 손님으로 바꿀 만큼은 다 바꿨다.':'지금은 바꿀 물건이 없다.'));
    for(const g of S.goods){
      const st=stateOf(g),lock=st.k==='open'?null:st.why,b=el('button','trade-good'+(st.k==='lock'?' off':''));b.type='button';b.dataset.good=g.id;b.dataset.state=st.k;
      b.setAttribute('aria-pressed',String(S.sel===g.id));
      // 결정 D-112: 물건이 아닌 정보(info:true)는 찢긴 수첩 쪽 아이콘으로 그리고, 이름은 "~에 대한 정보"로 적는다.
      const head=el('span','trade-good-head'),hi=icon(g.info?'torn_page':(g.icon||g.item));
      if(g.info||g.icon)head.appendChild(hi);else{const w=tipOn(el('span','trade-good-icon'),g.item);w.appendChild(hi);head.appendChild(w);}   // 결정 D-1101
      head.appendChild(el('b',null,(g.label||ITEMS[g.item].n)+(g.n>1?' ×'+g.n:'')));
      if(!g.label)head.appendChild(rarityIcon(ITEMS[g.item].r));
      head.appendChild(el('span','chip',g.info?'정보':g.kind==='story'?'부탁':g.kind==='guest'?'손님 교환':'흔한 물건'));
      b.appendChild(head);
      const asks=el('span','trade-asks');
      if(st.k==='lock')asks.appendChild(el('span','small',lock));
      /* 결정 D-925: 바꾸는 법이 여럿이면 '또는'으로 가로로 잇지 않고 한 줄에 한 가지씩 세로로 적는다 (사용자 피드백 2026-11-06 20:
         "또는으로 연결하지 말고 세로로 깔끔하게 리스트화처럼"). 한 줄 안의 재료는 + 로 잇는다. 줄 앞에는 작은 점 하나. */
      else if(asked(g)){asks.classList.add('list');g.asks.forEach(a=>{
        const row=el('span','trade-ask-row');row.appendChild(el('span','dot','·'));
        Object.entries(a).forEach(([id,n],k)=>{if(k)row.appendChild(el('span','plus','+'));row.appendChild(st.k==='short'?askPicture(id,n):picture(id,n,n));});
        const ex=g.extra?.[g.asks.indexOf(a)];if(ex)row.appendChild(extraChip(ex));   // 결정 D-1102
        asks.appendChild(row);
      });}
      else{   // 결정 D-925: 흔한 물건의 값(같은 단계 하나 / 한 단계 아래 둘)도 한 줄에 하나씩
        asks.classList.add('list');
        for(const t of priceRows(g)){const row=el('span','trade-ask-row');row.appendChild(el('span','dot','·'));row.appendChild(el('span','small',t));asks.appendChild(row);}
        asks.appendChild(el('span','small trade-left',stockLeft(g.row)*(g.n||1)+'개 남음'));}   // 결정 D-1480: '남은 3번' 대신 남은 물건 수 (한 번에 g.n개씩)
      if(g.kind==='guest'&&st.k!=='lock')asks.appendChild(el('span','small','· '+Math.max(0,TABLES.TUNING.stranger_trade_limit-strangerUsed(S.guest.npc.id))+'번 더 바꿀 수 있음'));   // 결정 D-1480
      b.appendChild(asks);
      b.setAttribute('aria-label',(g.label||ITEMS[g.item].n)+'. '+(lock||(asked(g)?'원하는 것: '+g.asks.map((a,i)=>askText(a)+extraText(g.extra?.[i])).join('; '):priceText(g))));
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
      if(!S.guest&&liked(S.npc,id))s.appendChild(el('span','trade-like','좋아함'));
      tipOn(s,id,0,why);s.setAttribute('aria-label',ITEMS[id].n+' '+left+'개'+(why?'. '+why:''));   // 결정 D-1101: 정보 창이 이름과 못 얹는 까닭을 보인다
      s.disabled=!!why||left<=0;
      s.onclick=()=>{if(blocked(id)||G.inv[id]-(S.offer[id]||0)<=0)return;S.offer[id]=(S.offer[id]||0)+1;render();};
      grid.appendChild(s);
    }
    mine.appendChild(grid);
    // 결정 D-111: 내 보따리가 왼쪽(휴대폰에서는 위), 상대 물건이 오른쪽이다.
    body.appendChild(legend());wrap.appendChild(mine);wrap.appendChild(theirs);body.appendChild(wrap);
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
    // 결정 D-1404 (사용자 지시 2026-11-09): 흥정 줄은 tuning.csv trade_haggle_on 이 1일 때만 보인다. 지금은 꺼 둔다(나중에 아이디어가 생기면 다시 켠다).
    //   흥정 덤은 모두 덤일 뿐 진행에 쓰이지 않는다(날쌘 숯·결명자·팥 덤, haggleBonus).
    if(TABLES.TUNING.trade_haggle_on&&!S.guest&&TABLES.HAGGLE?.[S.npc]&&S.goods.some(g=>['open','short'].includes(stateOf(g).k))){
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
    const pv=previewText(S.goods.find(g=>g.id===S.sel));if(pv){const p=el('p','small trade-preview',pv);tray.appendChild(p);}   // 결정 D-905
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
    const m=asked(g)?storyMatch(g,S.offer):commonMatch(g,S.offer);
    if(!m.ok){S.log.push({who:'',line:'('+jo(S.name,'이','가')+' 고개를 젓는다.) '+m.why});render();return;}
    // 결정 D-905: 여러 몫을 한 번에. 부탁은 지역 코드가 몫 수(k)를 받아 대사와 물건을 맞춘다 (multi 가 없는 부탁은 늘 1)
    if(g.kind==='story'){close();g.accept(m.alt,m.k||1);return;}
    if(g.kind==='guest'){
      let got=0;for(let i=0;i<(m.k||1);i++){if(!g.accept())break;got++;}
      if(got)S.log.push({who:'',line:'('+S.name+'에게서 '+ITEMS[g.item].n+' '+g.n*got+'개를 받았다.'+backText(got<(m.k||1)?null:m.back)+')'});
      S.offer={};S.goods=guestGoods();const cur=S.goods.find(x=>x.id===S.sel);if(!cur||stateOf(cur).k!=='open')S.sel=(S.goods.find(x=>stateOf(x).k==='open')||S.goods[0])?.id||null;render();return;
    }
    for(const [id,n] of Object.entries(m.use))takeItem(id,n);
    const bonus=!!G.f.haggleBonus?.[key(S.npc)],n=g.n*m.k+(bonus?1:0);   // 흥정 덤은 한 번 바꿀 때 하나다
    if(bonus)delete G.f.haggleBonus[key(S.npc)];
    addItem(g.item,n);(G.f.stockUsed=G.f.stockUsed||{})[g.row.id]=(G.f.stockUsed[g.row.id]||0)+m.k;
    learn('trade:'+g.row.id);Sound.exchange();
    S.log.push({who:'',line:'('+S.name+'에게서 '+ITEMS[g.item].n+' '+n+'개를 받았다.'+(bonus?' 덤이 하나 붙었다.':'')+backText(m.back)+')'});
    S.offer={};S.goods=goodsOf(S.npc);const cur=S.goods.find(x=>x.id===S.sel);if(!cur||stateOf(cur).k!=='open')S.sel=(S.goods.find(x=>stateOf(x).k==='open')||S.goods[0])?.id||null;render();
  }
  // 몫이 안 되어 남는 물건 (세는 말이 늘 '개'라 조사는 '는')
  const backText=back=>{const list=Object.entries(back||{}).map(([id,n])=>ITEMS[id].n+' '+n+'개');return list.length?' 몫이 안 되는 '+list.join(', ')+'는 도로 챙겼다.':'';};
  // 결정 D-905: 얹은 물건으로 무엇을 몇 개 받는지 제안 전에 미리 보인다
  function previewText(g){
    if(!g||!Object.keys(S.offer).length)return '';
    const st=stateOf(g);if(st.k==='done'||st.k==='lock')return '';
    const m=asked(g)?storyMatch(g,S.offer):commonMatch(g,S.offer);
    if(!m.ok||(g.kind==='story'&&!g.multi))return '';
    const n=(g.n||1)*m.k+(g.kind==='common'&&G.f.haggleBonus?.[key(S.npc)]?1:0);
    const ex=g.extra?.[m.alt],exs=ex?' 덤으로 '+Object.entries(ex).map(([id,c])=>ITEMS[id].n+' '+c*m.k+'개').join(', ')+'도 받는다.':'';   // 결정 D-1102
    return '이대로면 '+ITEMS[g.item].n+' '+n+'개를 받는다.'+(m.k>1?' ('+m.k+'번 몫)':'')+exs+backText(m.back).replace('도로 챙겼다','그대로 남는다');
  }
  $('tradeClose').onclick=()=>closePanels();
  /* 흔한 물건이 남은 상대와 이야기할 때는 대화창에 '보따리 펼치기'를 늘 둔다. 부탁을 마친 뒤에도 바꿀 수 있게.
     대화 선택지에 이미 '보따리를 펼친다'가 있으면 두지 않는다. */
  const quick=el('div','field-taste trade-quick');quick.hidden=true;$('dlgActions').appendChild(quick);   // 결정 D-163: '물건 건네기'와 한 줄
  const quickBtn=el('button','btn','보따리 펼치기');quickBtn.type='button';quick.appendChild(quickBtn);
  quick.addEventListener('click',e=>e.stopPropagation());
  function quickNpc(){
    if(!G||!REG||B||$('dlg').hidden)return null;
    const n=fieldNpcs().find(n=>n.name===$('dlgWho').textContent);
    if(n&&tradeClosedNow(n.id))return null;   // 결정 D-197: 조는 꾸벅이·변신한 채로는 펼치지 않는다 (disguise.js)
    // 결정 D-77: 부탁이 남은 상대(눈돌·진흙·비늘 같은 뒤늦은 부탁)도 대화창에서 바로 펼친다.
    return n&&(stockOf(n.id).some(r=>stockLeft(r)>0)||(REG.trade?.[n.id]?.()||[]).some(g=>!g.done?.()))?n.id:null;
  }
  /* 결정 D-702: '보따리 펼치기'는 대화의 마지막 줄(뒤에 남은 줄도, 끝나고 할 일도 없을 때)에만 둔다.
     예전엔 대화 중간에도 떠서, 누르면 대화가 끊긴 채 진행값만 남아 그 인물이 다음 단계로 건너뛰었다
     (사용자 피드백 2026-11-05: 대화 중간에 끊으면 NPC가 다음 걸 강제로 진행한다). 이야기가 진행값을 먼저 세우고 talk 하는 곳이 많다. */
  const dlgLastLine=()=>!dlgQ.length&&!dlgEnd;
  function renderQuick(){
    const npc=quickNpc(),dup=[...$('dlgChoices').children].some(b=>b.textContent==='보따리를 펼친다');
    quick.hidden=!npc||dup||!dlgLastLine();quick.dataset.npc=npc||'';
  }
  quickBtn.onclick=()=>{const npc=quick.dataset.npc;if(!npc||!dlgLastLine())return;dlgDismiss();open(npc);};   // 결정 D-331
  for(const id of ['dlgWho','dlgText','dlgChoices'])new MutationObserver(renderQuick).observe($(id),{childList:true,characterData:true,subtree:true});
  new MutationObserver(renderQuick).observe($('dlg'),{attributes:true,attributeFilter:['hidden']});
  return {open,openGuest,close,get state(){return S;}};
})();
