'use strict';
/* 개발자 모드 (사용자 피드백 55). 지나간 장면·보스를 처음부터 다시 하지 않고 그 부분만 다시 해 본다.
   켜기: 주소 끝에 ?dev=1, 또는 게임 중 ` 키(백틱). 켜진 뒤 ` 는 패널을 열고 닫는다. 왼쪽 위 '개발' 표시를 눌러도 열린다.
   끄면 개발 중 바뀐 것은 버리고 원래 저장을 다시 불러온다. 꺼져 있으면 아무것도 기록하지 않는다. */
// 결정 D-220: 개발자 모드 중 저장은 개발용 칸(packoon-save-dev-v1)에만 한다. 원래 저장은 켜는 순간 그대로 두고, 끄면 그 저장으로 돌아간다.
const DEV_SAVE_KEY='packoon-save-dev-v1',DEV_MARKS_KEY='packoon-dev-marks-v1';
// 연습 전투를 그 지역에서 열기 위한 표. 상대 정의(defineEnemies)에 지역이 없어서 여기 적는다. 없는 상대는 지금 지역에서 연다.
const DEV_BOSS_REGION={musoe:'galchamgol',kudzu:'galchamgol',golem:'dolneomeo',dokkaebi:'jangteo',gangcheol:'yeongsan'};
const Dev=(()=>{
  const params=new URLSearchParams(location.search);
  let on=params.get('dev')==='1',panel=null,badge=null,practice=null,lastDlg=0,prevSnap=null,arcInfo=null,flagFilter='';
  const marks=[];
  const store={get:k=>{try{return localStorage.getItem(k);}catch(_){return null;}},set:(k,v)=>{try{localStorage.setItem(k,v);return true;}catch(_){return false;}},
    del:k=>{try{localStorage.removeItem(k);}catch(_){}}};
  /* 개발용 칸이 비어 있으면 원래 저장을 복사해 '이어서 하기'가 지금까지의 진행에서 시작하게 한다 */
  function seedDevSave(){const real=store.get(SAVE_KEY);if(store.get(DEV_SAVE_KEY)===null&&real!==null)store.set(DEV_SAVE_KEY,real);}
  function loadMarks(){try{const a=JSON.parse(store.get(DEV_MARKS_KEY)||'[]');if(Array.isArray(a))marks.push(...a.filter(m=>m&&typeof m.snap==='string'));}catch(_){}}
  function saveMarks(){while(marks.length&&!store.set(DEV_MARKS_KEY,JSON.stringify(marks)))marks.shift();}
  if(on){seedDevSave();loadMarks();}

  const snapshot=()=>{if(typeof returnPouch==='function')returnPouch();return JSON.stringify(G);};
  function restore(text){
    let g=JSON.parse(text);try{g=repairSavedState(g);}catch(_){}
    stopDialog();G=g;resetScreens();
  }
  function stopDialog(){if(open('dlg')){dlgQ=[];dlgEnd=null;$('dlg').hidden=true;dlgPic(null);}closePanels();}
  const regionName=id=>REGIONS[id]?.name||id;
  const zoneName=(r,z)=>TABLES.ZONES?.[r]?.[z]||z||'';

  /* 결정 D-222: 장면 되감기. 대화가 새로 열리거나 전투가 시작되면, 그 직전(0.4초 안)의 상태를 기록점으로 남긴다.
     대화를 여는 쪽이 진행값을 먼저 적고 talk()를 부르기 때문에 대화가 열린 순간이 아니라 그 전 상태를 쓴다.
     다음 기록점까지 진행값·보따리·변신이 하나도 안 바뀐 기록점(되풀이 대사)은 버린다. 최대 40개, 이 브라우저에만. */
  function diffOf(a,b){
    const out=[];const fa=a.f||{},fb=b.f||{};
    for(const k of new Set([...Object.keys(fa),...Object.keys(fb)]))if(JSON.stringify(fa[k])!==JSON.stringify(fb[k]))out.push(k);
    for(const k of new Set([...Object.keys(a.inv||{}),...Object.keys(b.inv||{})]))if((a.inv||{})[k]!==(b.inv||{})[k])out.push((b.inv?.[k]||0)>(a.inv?.[k]||0)?'+'+(ITEMS[k]?.n||k):'-'+(ITEMS[k]?.n||k));
    if(JSON.stringify(a.forms)!==JSON.stringify(b.forms))out.push('변신');
    if(a.region!==b.region)out.push('지역');
    return out;
  }
  function settle(){
    // 마지막 기록점 앞의 것들만 정리한다 (마지막은 아직 진행 중)
    for(let i=marks.length-2;i>=0;i--){
      const m=marks[i];if(m.changed)continue;
      const d=diffOf(JSON.parse(m.snap),JSON.parse(marks[i+1].snap));
      if(d.length)m.changed=d;else marks.splice(i,1);
    }
  }
  function addMark(kind,label){
    if(!on||practice||!G||!G.started||!prevSnap)return;
    const g=JSON.parse(prevSnap);
    marks.push({kind,label,at:Date.now(),region:g.region,zone:g.zone,x:Math.round(g.px),snap:prevSnap});
    settle();if(marks.length>40)marks.splice(0,marks.length-40);saveMarks();
    if(panel&&!panel.hidden)render();
  }
  setInterval(()=>{
    if(!on||!G||!G.started||B||inkOn||open('dlg')||performance.now()-lastDlg<400)return;
    prevSnap=JSON.stringify(G);
  },400);
  (function watch(){if(on&&open('dlg'))lastDlg=performance.now();requestAnimationFrame(watch);})();
  const baseTalk=talk;
  talk=function(lines,onEnd,options){
    // 이어지는 대사(앞 대화가 막 닫힌 직후·선택지)는 같은 장면으로 본다
    if(on&&!B&&!open('dlg')&&performance.now()-lastDlg>300&&Array.isArray(lines)&&lines[0])
      addMark('대화',lines[0][0]+': '+String(lines[0][1]||'').replace(/\n/g,' ').slice(0,26));
    return baseTalk(lines,onEnd,options);
  };
  const baseBattle=startBattle;
  startBattle=function(kind,onEnd){if(on&&!practice)addMark('전투',ENEMIES[kind]?.name||kind);return baseBattle(kind,onEnd);};

  /* 결정 D-221: 연습 전투. 이겼던 상대도 다시 연다. 시작 직전 상태를 통째로 들고 있다가, 결과 창을 닫으면 그대로 되돌린다
     (전리품·진행값·호감·체력 모두 원래대로). '다 갖추고'를 켜면 변신 넷과 곡괭이·벼린 낫을 쥐여 준다 (되돌릴 때 함께 사라진다). */
  function practiceBattle(kind,full){
    if(!G.started){toast('먼저 게임을 시작하세요');return;}
    if(B||inkOn){toast('전투가 끝난 뒤에 하세요');return;}
    stopDialog();
    const snap=snapshot(),r=DEV_BOSS_REGION[kind];
    if(r&&REGIONS[r]&&G.region!==r){enterRegion(G,REGIONS[r],{mapTravel:true});resetScreens();}
    if(full){FORM_IDS.forEach(id=>{if(!G.forms.includes(id))G.forms.push(id);});G.f.formIntroQ=[];grantTool('pickaxe');if(TOOLS.sickle){G.tool='sickle';G.sharp=true;}refreshFormUi();}
    G.hp=G.maxhp;practice={kind,snap};hidePanel();
    inkTransition('연습 · '+(ENEMIES[kind].name||kind),50,()=>{
      startBattle(kind,res=>{practice=null;restore(snap);toast('연습 끝 ('+({win:'이김',calm:'달램',lose:'짐',flee:'물러남'}[res]||res)+') · 진행은 그대로');});
      $('bName').textContent+=' · 연습';
    });
  }

  /* 바로 가기: 지역을 옮기면 그 지역의 보관된 필드를 불러오고(지도 이동과 같은 길), 구역과 x 로 선다 */
  function goTo(regionId,zoneId,x){
    if(B||inkOn){toast('전투가 끝난 뒤에 하세요');return;}
    stopDialog();
    if(G.region!==regionId){enterRegion(G,REGIONS[regionId],{mapTravel:true,zone:zoneId});}
    G.started=true;G.ended=false;resetScreens();
    const z=usesZones(REG)?REG.zones[zoneId]:null;
    if(z){G.zone=zoneId;markZoneVisited();}
    const w=fieldWidth();G.px=clamp(Number.isFinite(x)?x:(z?.startX??REG.startX??70),16,w-16);G.py=fieldGround();G.vx=G.vy=0;G.onGround=true;
    G.cam=clamp(G.px-W*.42,0,Math.max(0,w-W));lastNear=null;refreshHud();
    toast('개발 · '+regionName(G.region)+(z?' · '+zoneName(G.region,G.zone):'')+' x '+Math.round(G.px));
  }
  function npcSpots(regionId){
    const r=REGIONS[regionId],out=[];if(!r)return out;
    const byId=Object.fromEntries((r.npcs||[]).map(n=>[n.id,n]));
    if(usesZones(r))for(const [zid,z] of Object.entries(r.zones)){
      const list=z.npcs?z.npcs.map(n=>typeof n==='string'?byId[n]:n):(r.npcs||[]).filter(n=>(n.zone||firstZone(r))===zid);
      for(const n of list)if(n&&Number.isFinite(n.x)&&!out.some(o=>o.id===n.id&&o.zone===zid))out.push({id:n.id,name:n.name||n.id,zone:zid,x:n.x});
    }else for(const n of r.npcs||[])if(Number.isFinite(n.x))out.push({id:n.id,name:n.name||n.id,zone:null,x:n.x});
    return out;
  }

  /* 결정 D-222(이어서): 지나간 사연 장면. 사연 장면(arcScene)은 진행값과 같은 이름으로 아이의 기록을 남긴다.
     그래서 지금 저장의 기록 중 진행값도 켜진 것이 '지나간 사연'이다. 되돌리면 그 장면과 같은 인물의 뒤 장면 진행값·기록을 지운다.
     누가 말하는 장면인지는 지역 이야기 파일 글에서 읽는다 (http 로 열었을 때만. 못 읽으면 자리 이동 없이 되돌리기만). */
  function loadArcInfo(){
    if(arcInfo)return;arcInfo={};
    const srcs=[...document.scripts].map(s=>s.getAttribute('src')||'').filter(s=>/regions\/\w+\/story\.js/.test(s));
    srcs.forEach(src=>{
      const region=src.match(/regions\/(\w+)\//)[1];
      fetch(src).then(r=>r.text()).then(text=>{
        const re=/arcScene\(\s*'(\w+)'/g;let m;
        // 장면의 상대: 대사 줄 [이름, …] 가운데 주인공이 아닌 첫 이름
        while((m=re.exec(text))){const names=[...text.slice(m.index,m.index+900).matchAll(/\[\s*'([^']{1,8})'\s*,\s*['`]/g)].map(x=>x[1]);
          arcInfo[m[1]]={region,who:names.find(n=>n!=='너구리')||''};}
        if(panel&&!panel.hidden)render();
      }).catch(()=>{});
    });
  }
  const stemOf=id=>{const m=String(id).match(/^(.*?)(\d+)$/);return m?{stem:m[1],n:+m[2]}:{stem:id,n:0};};
  function passedArcs(){return (G.diary||[]).filter(d=>G.f[d.id]===true);}
  function rewindArc(id){
    const {stem,n}=stemOf(id);
    const gone=passedArcs().map(d=>d.id).filter(k=>{const s=stemOf(k);return k===id||(s.stem===stem&&s.n>=n&&n>0);});
    gone.forEach(k=>delete G.f[k]);G.diary=G.diary.filter(d=>!gone.includes(d.id));
    const info=arcInfo?.[id],spot=info&&npcSpots(info.region).find(s=>s.name===info.who);
    if(spot)goTo(info.region,spot.zone,spot.x-34);else refreshHud();
    toast('되돌림: '+gone.join(', ')+(spot?' · '+spot.name+' 앞':''));
  }

  /* 켜고 끄기 */
  function setUrl(v){try{const u=new URL(location.href);if(v)u.searchParams.set('dev','1');else u.searchParams.delete('dev');history.replaceState(null,'',u);}catch(_){}}
  function turnOn(){
    if(on)return;
    if(G?.started&&!busyForSave())writeSave(true);   // 지금까지는 원래 저장에 남기고
    on=true;setUrl(true);seedDevSave();loadMarks();
    if(G?.started&&!busyForSave())writeSave(true);   // 개발용 칸은 지금 상태에서 시작
    refreshSaveUI();showBadge();
  }
  function turnOff(){
    if(!on)return;if(B){toast('전투가 끝난 뒤에 끄세요');return;}
    if(G?.started&&!busyForSave())writeSave(true);
    on=false;setUrl(false);hidePanel();showBadge();stopDialog();
    if(!loadSave()){G=newGame(G.region);resetScreens();TitleScreen.open();}
    toast('개발자 모드를 껐다 · 원래 저장으로');
  }
  function showBadge(){
    if(!badge){badge=el('button','dev-badge','개발');badge.type='button';badge.title='개발자 모드 패널 (` 키)';badge.onclick=()=>togglePanel();document.body.appendChild(badge);}
    badge.hidden=!on;
  }
  function hidePanel(){if(panel)panel.hidden=true;}
  function togglePanel(){if(!panel){panel=el('div','dev-panel');panel.id='devPanel';document.body.appendChild(panel);panel.hidden=true;}
    panel.hidden=!panel.hidden;if(!panel.hidden){loadArcInfo();render();}}
  addEventListener('keydown',e=>{
    if(e.code!=='Backquote'&&e.key!=='`')return;
    if(e.target instanceof HTMLElement&&e.target.matches('input,textarea,select'))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(!on){turnOn();toast('개발자 모드를 켰다 · 저장은 개발용 칸에만');}
    togglePanel();
  },true);

  /* ---------- 패널 ---------- */
  function btn(text,fn,cls){const b=el('button',cls||null,text);b.type='button';b.onclick=e=>{e.stopPropagation();fn();b.blur();};return b;}
  function section(title,openIt){const d=el('details','dev-sec');if(openIt)d.open=true;d.appendChild(el('summary',null,title));panel.appendChild(d);return d;}
  const opened=new Set(['바로 가기','연습 전투','장면 되감기']);
  function render(){
    if(!panel)return;
    panel.querySelectorAll('details').forEach(d=>{const t=d.querySelector('summary').textContent;if(d.open)opened.add(t);else opened.delete(t);});
    const scroll=panel.scrollTop;panel.innerHTML='';
    const head=el('div','dev-head');head.appendChild(el('b',null,'개발자 모드'));
    head.appendChild(btn('끄기 · 원래 저장으로',turnOff));head.appendChild(btn('닫기',hidePanel));panel.appendChild(head);
    panel.appendChild(el('p','dev-note',G?.started?regionName(G.region)+(G.zone?' · '+zoneName(G.region,G.zone):'')+' · x '+Math.round(G.px)+' · 저장은 개발용 칸에만':'게임을 시작하면 쓸 수 있다'));
    if(!G?.started)return;
    const sec=t=>section(t,opened.has(t));

    // 바로 가기
    let s=sec('바로 가기');
    const rs=el('select');regionList().forEach(r=>{const o=el('option',null,r.order+' '+r.name);o.value=r.id;o.selected=r.id===(render.region||G.region);rs.appendChild(o);});
    const zs=el('select'),xs=el('input');xs.type='number';xs.placeholder='x (비우면 입구)';xs.className='dev-x';
    const fillZones=()=>{zs.innerHTML='';const r=REGIONS[rs.value];render.region=rs.value;
      if(usesZones(r))Object.keys(r.zones).forEach(z=>{const o=el('option',null,zoneName(r.id,z));o.value=z;o.selected=r.id===G.region&&z===G.zone;zs.appendChild(o);});};
    rs.onchange=()=>{fillZones();render();};fillZones();
    const row=el('div','dev-row');row.append(rs,zs,xs,btn('가기',()=>goTo(rs.value,zs.value||null,xs.value===''?NaN:+xs.value)));s.appendChild(row);
    const np=el('div','dev-chips');npcSpots(rs.value).forEach(n=>np.appendChild(btn(n.name+(n.zone?' · '+zoneName(rs.value,n.zone):''),()=>goTo(rs.value,n.zone,n.x-34))));s.appendChild(np);

    // 연습 전투
    s=sec('연습 전투');
    const full=el('label','dev-check');const fc=el('input');fc.type='checkbox';fc.checked=!!render.full;fc.onchange=()=>{render.full=fc.checked;};
    full.append(fc,document.createTextNode(' 변신 넷·곡괭이·벼린 낫 갖추고'));s.appendChild(full);
    const bs=el('div','dev-chips');Object.entries(ENEMIES).forEach(([k,E])=>bs.appendChild(btn(E.name+(knows('fight:'+k)?' ✓':''),()=>practiceBattle(k,!!render.full))));s.appendChild(bs);
    s.appendChild(el('p','dev-note','결과 창을 닫으면 시작 직전 상태로 돌아온다. 전리품·진행값은 남지 않는다.'));

    // 장면 되감기 (이번 개발 중 기록)
    s=sec('장면 되감기');
    if(!marks.length)s.appendChild(el('p','dev-note','개발자 모드를 켠 뒤 연 대화·전투가 여기 쌓인다. 고르면 그 장면 바로 전으로 돌아간다.'));
    [...marks].reverse().forEach(m=>{const idx=marks.indexOf(m);
      const r=el('div','dev-mark');r.appendChild(el('span',null,'['+m.kind+'] '+regionName(m.region)+(m.zone?'·'+zoneName(m.region,m.zone):'')+' '+m.label));
      r.appendChild(el('small',null,m.changed?'바뀐 것: '+m.changed.slice(0,6).join(', ')+(m.changed.length>6?' …':''):'진행 중'));
      r.appendChild(btn('직전으로',()=>{if(B||inkOn){toast('전투가 끝난 뒤에 하세요');return;}const snap=m.snap;marks.splice(idx);saveMarks();restore(snap);prevSnap=snap;toast('되감음: '+m.label);render();}));
      s.appendChild(r);});
    if(marks.length)s.appendChild(btn('기록 지우기',()=>{marks.length=0;saveMarks();render();}));

    // 지나간 사연 (지금 저장 기준)
    s=sec('지나간 사연 다시 보기');
    const arcs=passedArcs();
    if(!arcs.length)s.appendChild(el('p','dev-note','지금 저장에서 지나간 사연 장면이 없다.'));
    arcs.slice().reverse().forEach(d=>{const info=arcInfo?.[d.id];
      const r=el('div','dev-mark');r.appendChild(el('span',null,(info?regionName(info.region)+' · '+info.who+' · ':'')+d.id));
      r.appendChild(el('small',null,String(d.text).slice(0,60)));r.appendChild(btn('되돌리고 그 앞으로',()=>{rewindArc(d.id);render();}));s.appendChild(r);});

    // 상태 고치기
    // 결정 D-223: 상태 고치기 (아이템·변신·연장·체력·낮밤). 진행값 표는 아래 '진행값'에서 직접 고친다.
    s=sec('상태');
    const it=el('input');it.setAttribute('list','devItems');it.placeholder='아이템 이름';const dl=el('datalist');dl.id='devItems';
    Object.entries(ITEMS).forEach(([id,o])=>{const op=el('option');op.value=o.n||id;dl.appendChild(op);});
    const cnt=el('input');cnt.type='number';cnt.value='1';cnt.className='dev-x';
    const findItem=()=>{const v=it.value.trim();return Object.keys(ITEMS).find(id=>id===v||ITEMS[id].n===v);};
    const ir=el('div','dev-row');ir.append(it,dl,cnt,btn('넣기',()=>{const id=findItem();if(!id){toast('없는 아이템');return;}addItem(id,Math.max(1,+cnt.value||1));render();}),
      btn('빼기',()=>{const id=findItem();if(id&&has(id)){takeItem(id,Math.min(G.inv[id],Math.max(1,+cnt.value||1)));render();}}));s.appendChild(ir);
    const fr=el('div','dev-chips');FORM_IDS.forEach(id=>{const l=el('label','dev-check');const c=el('input');c.type='checkbox';c.checked=G.forms.includes(id);
      c.onchange=()=>{if(c.checked)unlockForm(id);else{if(G.form===id)revertForm();G.forms=G.forms.filter(x=>x!==id);refreshFormUi();}render();};
      l.append(c,document.createTextNode(' '+formName(id)));fr.appendChild(l);});s.appendChild(fr);
    const tr=el('div','dev-chips');
    const ts=el('select');Object.keys(TOOLS).forEach(id=>{const o=el('option',null,TOOLS[id].n||TOOLS[id].name||id);o.value=id;o.selected=G.tool===id;ts.appendChild(o);});
    ts.onchange=()=>{G.tool=ts.value;refreshHud();};tr.appendChild(ts);
    const chk=(text,get,set)=>{const l=el('label','dev-check');const c=el('input');c.type='checkbox';c.checked=!!get();c.onchange=()=>{set(c.checked);refreshHud();render();};l.append(c,document.createTextNode(' '+text));return l;};
    tr.appendChild(chk('벼린 낫',()=>G.sharp,v=>{G.sharp=v;}));
    tr.appendChild(chk('전투 곡괭이',()=>G.f.battleTools?.includes('pickaxe'),v=>{G.f.battleTools=(G.f.battleTools||[]).filter(x=>x!=='pickaxe');if(v)G.f.battleTools.push('pickaxe');}));
    tr.appendChild(chk('밤 (큰 장터)',()=>G.f.night,v=>{G.f.night=v;}));
    tr.appendChild(btn('체력 채우기',()=>{G.hp=G.maxhp;refreshHud();}));s.appendChild(tr);

    // 진행값
    s=sec('진행값');
    const fi=el('input');fi.placeholder='찾기 (이름 일부)';fi.value=flagFilter;fi.oninput=()=>{flagFilter=fi.value;draw();};s.appendChild(fi);
    const list=el('div','dev-flags');s.appendChild(list);
    const add=el('div','dev-row');const nk=el('input');nk.placeholder='새 진행값 이름';add.append(nk,btn('켜기',()=>{if(nk.value.trim()){G.f[nk.value.trim()]=true;render();}}));s.appendChild(add);
    function draw(){
      list.innerHTML='';
      Object.keys(G.f).filter(k=>k.toLowerCase().includes(flagFilter.toLowerCase())).sort().forEach(k=>{
        const r=el('div','dev-flag');r.appendChild(el('code',null,k));const v=G.f[k];
        if(typeof v==='boolean'){const c=el('input');c.type='checkbox';c.checked=v;c.onchange=()=>{G.f[k]=c.checked;refreshHud();};r.appendChild(c);}
        else{const t=el('input');t.value=JSON.stringify(v);t.onchange=()=>{try{G.f[k]=JSON.parse(t.value);}catch(_){G.f[k]=t.value;}refreshHud();};r.appendChild(t);}
        r.appendChild(btn('✕',()=>{delete G.f[k];refreshHud();draw();},'dev-x-btn'));list.appendChild(r);
      });
    }
    draw();
    panel.scrollTop=scroll;
  }
  if(on)setTimeout(showBadge,0);
  return {get on(){return on;},get practice(){return !!practice;},turnOn,turnOff,togglePanel,practiceBattle,goTo,marks};
})();
