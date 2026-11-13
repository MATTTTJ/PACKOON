'use strict';

/* 결정 D-905·D-906: 교환의 여러 몫 한 번에, 선물 답례 가공법을 상태를 정해 놓고 본다 (사용자 피드백 2026-11-06).
   - 흔한 물건: 돌너머 날쌘의 메밀(하품, 한 번에 2개, 3번)과 돌쇠 할배의 돌가루(중품, 한 번에 1개, 2번).
     같은 단계 하나·한 단계 아래 둘이 한 몫이고, 몫이 안 되는 물건과 남은 횟수를 넘는 몫은 보따리에 남는다.
   - 몇 번이고 하는 부탁: 큰 장터 날쌘의 팥(쌀가루 하나에 팥 한 되). 쌀가루 셋이면 팥 세 되.
   - 선물 답례: 단풍골 두꺼비 할멈. 대화의 마지막 줄에서 건네면 반응에 이어 바로, 중간 줄에서 건네면 대화가 끝난 뒤에 가르친다. */
const fs=require('node:fs');
const path=require('node:path');
const j=JSON.stringify;
async function ready(b){
  await b.navigate(b.url);
  await b.eval("(()=>{localStorage.clear();TitleScreen.close();G=newGame();G.started=true;G.f.momNoteSeen=true;resetScreens();closePanels();})()");
}
async function region(b,id){
  await b.eval(`(()=>{if(G.region!==${j(id)})enterRegion(G,REGIONS[${j(id)}]);G.started=true;$('titleScreen').hidden=true;if(typeof syncPrologue==='function')syncPrologue();resetScreens();closePanels();dlgDismiss();})()`);
  await b.until('zoneFade===0&&!zoneMotion&&!mapTravel',{timeout:5000,label:id+' 도착 화면 전환'});
}
// 보따리 칸은 창 안에서 스크롤 밖에 있을 수 있어 좌표 대신 그 칸을 직접 누른다
async function offer(b,item,n){for(let i=0;i<n;i++)await b.eval(`(()=>{const s=document.querySelector('#tradeBody .bag-grid .slot[data-item="${item}"]');if(!s||s.disabled)throw new Error('얹을 수 없는 칸: ${item} '+(s?.title||''));s.scrollIntoView({block:'nearest'});s.click();})()`);}
async function press(b,sel){await b.eval(`(()=>{const e=document.querySelector('${sel}');if(!e||e.disabled)throw new Error('누를 수 없는 단추: ${sel}');e.click();})()`);}
async function runTrade({browser:b,outDir}){
  const findings=[],records=[];
  const check=(ok,rule,message,actual)=>{records.push({rule,ok,actual});if(!ok)findings.push({rule,severity:'높음',message,actual});};
  try{
    await ready(b);
    // 1) 흔한 물건 여러 몫
    await region(b,'dolneomeo');b.scene='trade / common';
    const st=id=>b.eval(`({got:G.inv[(TABLES.STOCK.find(r=>r.id==='${id}')).item]||0,acorn:G.inv.acorn||0,used:G.f.stockUsed?.${id}||0,log:document.querySelector('.trade-log')?.textContent||'',preview:document.querySelector('.trade-preview')?.textContent||''})`);
    // 1-1) 하품 메밀(한 번에 2개, 3번): 하품 도토리는 하나가 한 몫. 넷을 얹으면 세 번 몫만 바꾸고 하나는 남는다
    const memil=await b.eval("TABLES.STOCK.find(r=>r.id==='s_dol_nal_memil')");
    await b.eval("(()=>{G.inv={acorn:4};G.f.stockUsed={};Trade.open('nal');})()");
    await b.click('.trade-good[data-good="s_dol_nal_memil"]');await offer(b,'acorn',4);
    let s=await st('s_dol_nal_memil');
    check(s.preview.includes('메밀 '+memil.n*memil.times+'개')&&s.preview.includes('도토리 1개'),'trade-preview','도토리 넷을 얹었을 때 미리 보기가 받을 개수와 남는 하나를 말하지 않는다.',s);
    await press(b,'#tradePropose');s=await st('s_dol_nal_memil');
    check(s.got===memil.n*memil.times&&s.acorn===1&&s.used===memil.times,'trade-multiple','도토리 넷이면 남은 세 번 몫을 한 번에 바꾸고 하나는 보따리에 남아야 한다.',s);
    await b.eval('closePanels()');
    // 1-2) 중품 돌가루(한 번에 1개, 2번): 하품 도토리는 둘이 한 몫. 셋이면 한 몫에 하나 남고, 다섯이면 남은 한 번 몫만 바꾼다
    const dust=await b.eval("TABLES.STOCK.find(r=>r.id==='s_dol_dolsoe_dust')");
    await b.eval("(()=>{G.inv={acorn:8};G.f.stockUsed={};Trade.open('dolsoe');})()");
    await b.click('.trade-good[data-good="s_dol_dolsoe_dust"]');await offer(b,'acorn',3);
    await press(b,'#tradePropose');s=await st('s_dol_dolsoe_dust');
    check(s.got===dust.n&&s.acorn===6&&s.used===1&&s.log.includes('도토리 1개'),'trade-remainder','도토리 셋이면 한 몫만 바꾸고 하나는 보따리에 남아야 한다.',s);
    await offer(b,'acorn',5);await press(b,'#tradePropose');s=await st('s_dol_dolsoe_dust');
    check(s.got===dust.n*dust.times&&s.acorn===4&&s.used===dust.times,'trade-cap','남은 횟수를 넘는 몫은 바꾸지 않고 보따리에 남아야 한다.',s);
    await b.eval('closePanels()');
    // 2) 몇 번이고 하는 부탁
    await region(b,'jangteo');b.scene='trade / story multi';
    await b.eval("(()=>{G.inv={ssal_powder:3};G.ledger.nal_jangteo=G.ledger.nal_jangteo||{done:false};G.f.nalJBluff=false;Trade.open('nal');})()");
    await b.click('.trade-good[data-good="t_nal_jangteo_ssal"]');
    await offer(b,'ssal_powder',3);await press(b,'#tradePropose');
    s=await b.eval("({pat:G.inv.pat||0,powder:G.inv.ssal_powder||0,text:$('dlgText').textContent,dlg:!$('dlg').hidden})");
    check(s.pat===3&&s.powder===0&&s.dlg&&s.text.includes('3되'),'trade-story-multi','쌀가루 셋을 얹으면 팥 세 되를 한 번에 받아야 한다.',s);
    await b.eval('dlgDismiss()');
    // 3) 선물 답례 — 마지막 줄에서
    await region(b,'galchamgol');b.scene='gift / last line';
    const lesson=await b.eval("(TABLES.GIFT_RECIPES||[]).find(g=>g.id==='g_gal_toad')");
    check(!!lesson,'gift-table','gift_recipes.csv 의 두꺼비 할멈 줄이 tables.js 에 없다.',lesson);
    await b.eval("(()=>{G.inv={magamok_tea:1,ssanghwa:1};talk([['두꺼비 할멈','왔구나.']]);})()");
    await b.until("!document.getElementById('fieldTaste').hidden");
    await press(b,'#fieldTaste > button');await press(b,'#fieldTaste .taste-choices button');
    s=await b.eval("({known:knows('gift:g_gal_toad'),recipe:Object.values(RECIPES).flat().some(r=>r.out==='gyeol_hwan'&&recipeKnown(r)),who:$('dlgWho').textContent,text:$('dlgText').textContent,left:dlgQ.length})");
    check(s.known&&s.recipe&&s.who==='두꺼비 할멈'&&s.left===lesson.lines.length+1,'gift-lesson-now','마지막 줄에서 건넨 선물에 할멈이 반응하고 바로 가공법을 일러 줘야 한다.',s);
    const lines=[];await b.advanceDialogue({each:async line=>lines.push(line)});
    check(lines.some(l=>/결명자/.test(l.text))&&lines.some(l=>l.who==='너구리'&&/결명자 환 만드는 법을 적었다/.test(l.text)),'gift-lesson-lines','가공법 대사와 수첩에 적었다는 줄이 나오지 않았다.',lines);
    // 4) 선물 답례 — 대화 중간에서 (대화가 끝난 뒤에 잇는다). 할멈 줄은 다 배웠으니 같은 지역의 여울로 본다
    b.scene='gift / mid dialogue';
    await b.eval("(()=>{G.inv={acorn_jelly:1};talk([['여울','안녕!'],['여울','또 왔네?']]);})()");
    await b.until("!document.getElementById('fieldTaste').hidden");
    await press(b,'#fieldTaste > button');await press(b,'#fieldTaste .taste-choices button');
    s=await b.eval("({known:knows('gift:g_gal_otter'),queued:(G.f.giftLessonQ||[]).length,text:$('dlgText').textContent})");
    check(s.known&&s.queued===1&&s.text==='안녕!','gift-lesson-queue','대화 중간에 건넨 선물은 대화를 끊지 않고 답례를 뒤로 미뤄야 한다.',s);
    await b.advanceDialogue({});
    await b.until("!$('dlg').hidden&&/송이/.test($('dlgText').textContent)",{timeout:5000,label:'미룬 답례 대사'});
    const later=[];await b.advanceDialogue({each:async line=>later.push(line)});
    check(later.some(l=>/송이밥 만드는 법을 적었다/.test(l.text))&&!(await b.eval('(G.f.giftLessonQ||[]).length')),'gift-lesson-later','대화가 끝난 뒤 미룬 답례 대사가 이어지지 않았다.',later);
    // 5) 결정 D-1461: 먹을거리 먹기와 기운. 체력만 주는 것은 체력이 가득하면 못 먹고, 진행 몫은 남기며, 기운은 보스 한 판에 쓰고 사라진다
    b.scene='food / eat';
    s=await b.eval(`(()=>{closePanels();dlgDismiss();const all=Object.entries(ITEMS).filter(([k,v])=>v.kind==='먹을거리'&&v.food).length;
      G.buff=null;G.hp=G.maxhp;G.inv={rice:1,yakgwa:1,dubu:1};
      const full=foodBlock('rice');const ate=eatFood('yakgwa');const b1={...G.buff};
      G.hp=1;eatFood('rice');const hp=G.hp;eatFood('dubu');
      return {all,full,ate,b1,hp,b2:G.buff,inv:{...G.inv},hud:$('foodBuff').textContent,hudShown:!$('foodBuff').hidden};})()`);
    check(s.all===60&&!!s.full&&s.ate&&s.b1.k==='swift'&&s.b1.lv===2&&s.hp===3&&s.b2.k==='strong'&&!s.inv.yakgwa&&!s.inv.rice&&s.hudShown&&/힘 2/.test(s.hud),
      'food-eat','먹을거리 60종(정표 음식 21종, 들풀·열매 조합 9종 포함, 결정 D-1469)이 모두 먹을 수 있어야 하고, 주먹밥은 체력이 가득하면 막고, 약과는 날램 2, 두부는 힘 2로 기운을 바꿔야 한다.',s);
    await region(b,'jangteo');b.scene='food / progress';
    s=await b.eval("(()=>{G.f.bueongDone=false;G.inv={patsirutteok:1};return {why:foodBlock('patsirutteok')};})()");
    check(/쓸 데/.test(s.why),'food-progress','부엉 영감 고사떡으로 쓸 팥시루떡은 먹지 못해야 한다.',s);
    b.scene='food / battle';
    s=await b.eval(`(()=>{G.inv={};G.hp=G.maxhp;G.buff={k:'guard',lv:2,from:'rainbow_tteok'};startBattle('dokkaebi',()=>{});
      const g0=B.guard;B.inv=0;bHitMe();const hp1=G.hp,g1=B.guard;renderBHud();const gold=$('bHearts').querySelectorAll('.guard').length;
      bEnd('flee');const after=G.buff;
      G.buff={k:'swift',lv:1};startBattle('dokkaebi',()=>{});const sp=battleHandProfile().speed/(TABLES.TUNING.battle_bare_speed*nameSpeedMul());
      const st=toolDamage(B.parts[0]);bEnd('flee');
      G.buff={k:'strong',lv:2};startBattle('dokkaebi',()=>{});const st2=toolDamage(B.parts[0]);const kind=foodMul('kind');bEnd('flee');
      return {g0,hp1,g1,gold,after,sp:Math.round(sp*100)/100,mul:Math.round(st2/st*100)/100,kind,max:G.maxhp};})()`);
    await b.until("!document.getElementById('bResult').hidden||!B",{timeout:8000,label:'전투 끝'}).catch(()=>{});
    await b.eval("(()=>{if(B){$('bResult').hidden=true;}B=null;document.body.classList.remove('in-battle');$('battle').hidden=true;})()");
    check(s.g0===2&&s.hp1===s.max&&s.g1===1&&s.gold===1&&s.after===null&&s.sp===1.15&&s.mul===1.5&&s.kind===1,
      'food-battle','든든 2는 금빛 하트 둘로 한 번 맞아도 체력이 그대로여야 하고, 판이 끝나면 기운이 사라지며, 날램 1은 손 1.15배, 힘 2는 깎는 힘 1.5배여야 한다.',s);
    // 6) 결정 D-1462: 아이가 얼음 뿔을 꺼내 보이면 엿방울이 호박엿 셋으로 바꿔 준다
    b.scene='yeot / junk';
    await b.eval("(()=>{G.f.yeotMet=true;G.f.yeotDone=true;G.f.yeotHigh=true;G.f.yeotJunkHeard=false;G.f.yeotHorn=false;G.inv={nundok_horn:1};REG.npcs.find(n=>n.id==='yeotbang').talk();})()");
    const jl=[];await b.advanceDialogue({stop:'choices',each:async line=>jl.push(line)});
    jl.push(await b.eval("({who:$('dlgWho').textContent,text:$('dlgText').textContent})"));
    await press(b,'#dlgChoices button');   // 보따리를 펼친다
    s=await b.eval("({heard:G.f.yeotJunkHeard,ids:REG.trade.yeotbang().map(x=>x.id),open:!$('trade').hidden})");
    await b.click('.trade-good[data-good="t_yeotbang_horn"]');await offer(b,'nundok_horn',1);await press(b,'#tradePropose');
    const gl=[];await b.advanceDialogue({each:async line=>gl.push(line)});
    const inv=await b.eval('({...G.inv})');
    check(s.heard&&s.ids.includes('t_yeotbang_horn')&&jl.some(l=>/헌 물건/.test(l.text))&&inv.hobakyeot===3&&!inv.nundok_horn&&gl.some(l=>/호박엿/.test(l.text)),
      'yeot-junk','아이가 얼음 뿔을 꺼내 보인 뒤 교환에 뿔 자리가 생기고, 바꾸면 호박엿 셋을 얻어야 한다.',{s,jl,gl,inv});
    // 7) 결정 D-1463·D-1464·D-1467: 도담에게 좋아함(깨소금) 하나를 건네면 1칸(2점), 아주 좋아함(도토리묵)을 더하면 2칸(5점), 도토리 묻은 자리를 찾아 주면(이벤트) 3칸(6점).
    //    그 뒤 도담과 대화를 마치면 두 칸 몫(곳간 도토리 + 알도토리묵 조합법), 이어서 세 칸 몫(곳간 도토리 하나 더)을 받는다
    await region(b,'galchamgol');b.scene='bond / level';
    s=await b.eval(`(()=>{closePanels();dlgDismiss();G.buff=null;G.inv={acorn_jelly:1,sesame_salt:1};G.learned=G.learned.filter(k=>!k.startsWith('like:dodam')&&k!=='hint:aldotori_muk');G.f.bondGot=Object.fromEntries(Object.keys(TABLES.BONDS).map(id=>[id,3]));delete G.f.bondGot.dodam;bondHeard.clear();
      if(G.ledger.dodam)G.ledger.dodam.done=false;G.f.galArcDodam2=false;
      const l0=bondLevel('dodam');giftTaste('dodam','sesame_salt');const l1=bondLevel('dodam'),p1=bondPoints('dodam');giftTaste('dodam','acorn_jelly');const l2=bondLevel('dodam'),p2=bondPoints('dodam');
      G.f.galArcDodam2=true;const l3=bondLevel('dodam');
      return {l0,l1,l2,l3,p1,p2,p:bondPoints('dodam'),title:bondTitle('dodam')};})()`);
    check(s.l0===0&&s.l1===1&&s.p1===2&&s.l2===2&&s.p2===5&&s.l3===3&&s.p===6&&!/다음 칸/.test(s.title),'bond-level','도담의 정은 처음 0칸, 좋아함 선물 뒤 1칸(2점), 아주 좋아함 선물 뒤 2칸(5점), 묻은 자리를 찾아 주면(이벤트) 3칸(6점)이어야 한다.',s);
    b.scene='bond / gift scene';
    await b.eval("talk([['도담','고마워! 맛있다!']])");
    const who0=await b.eval("({bond:$('dlgWho').dataset.bond,bg:$('dlgWho').style.getPropertyValue('--bond').slice(0,22)})");
    await b.advanceDialogue({});
    await b.until("!$('dlg').hidden&&/곳간/.test($('dlgText').textContent)",{timeout:8000,label:'정 두 칸 장면'}).catch(async e=>{throw new Error(e.message+' '+JSON.stringify(await b.eval("({p:paused(),dlg:!$('dlg').hidden,text:$('dlgText').textContent.slice(0,30),heard:[...bondHeard],pend:bondPending('dodam'),q:G.f.giftLessonQ,started:G.started,ended:G.ended,think:thinkWait,zf:zoneFade,zm:!!zoneMotion,mt:!!mapTravel,mg:!!openMinigame(),vm:!!vistaMode,ink:inkOn,B:!!B,bag:open('bag'),tr:open('trade'),nb:open('notebook'),map:open('map')})")));});
    const bl=[];await b.advanceDialogue({each:async line=>bl.push(line)});
    await b.until("!$('dlg').hidden&&/내 몫/.test($('dlgText').textContent)",{timeout:8000,label:'정 세 칸 장면'});
    await b.advanceDialogue({each:async line=>bl.push(line)});
    s=await b.eval("({n:G.inv.gotgan_dotori||0,hint:knows('hint:aldotori_muk'),from:G.f.recipeFrom?.aldotori_muk,got:G.f.bondGot?.dodam})");
    check(who0.bond==='3'&&/^url\(/.test(who0.bg)&&s.n===2&&s.hint&&s.from==='도담'&&s.got===3&&bl.some(l=>/알도토리묵/.test(l.text))&&bl.some(l=>/곳간 도토리/.test(l.text)),
      'bond-reward','정이 세 칸인 도담과 대화를 마치면 곳간 도토리 둘과 알도토리묵 조합법을 받고, 대화창 이름 옆에 정 표식이 붙어야 한다.',{who0,s,bl});
    // 정표 재료는 보따리 '정표' 탭에, 정표 조합법은 가공대 목록과 수첩 조합법 장에 기운 칩과 함께 보인다
    b.scene='bond / ui';
    s=await b.eval(`(()=>{closePanels();dlgDismiss();G.inv.salt=1;openBag('정표');
      const slots=[...document.querySelectorAll('#bagBody .bag-grid .slot[aria-label]')].map(x=>x.getAttribute('aria-label'));
      switchTool('jeolgu');const rec=[...document.querySelectorAll('#bagBody .recipes .recipe')].find(x=>/알도토리묵/.test(x.textContent));
      const recChip=rec?.querySelector('.buff-chip.buff-strong')?.textContent||'';closePanels();
      const tag=document.createElement('span');tag.textContent='도담';bondDecorateTag(tag,{id:'dodam'},true);const tagMarks=!!tag.querySelector('.bond-marks');
      const unk=document.createElement('span');unk.textContent='?';bondDecorateTag(unk,{id:'dodam'},false);
      noteTab='recipes';$('notebook').hidden=false;renderNotebook();
      const tabName=[...document.querySelectorAll('#noteTabs button')].find(x=>x.dataset.tab==='recipes')?.textContent;
      const cards=[...document.querySelectorAll('#noteBody .recipe-card')];
      const known=cards.find(c=>!c.classList.contains('unknown')&&/알도토리묵/.test(c.textContent));
      const unknown=cards.filter(c=>c.classList.contains('unknown'));
      const memo=unknown.find(c=>/버섯찜/.test(c.textContent));
      const r={slots,recChip,tagMarks,unkMarks:!!unk.querySelector('.bond-marks'),tabName,known:known?.querySelector('.recipe-formula')?.textContent,unknownN:unknown.length,
        memo:memo?.textContent||'',head:document.querySelector('#noteBody .note-region')?.textContent};closePanels();return r;})()`);
    check(s.slots.some(x=>/곳간 도토리/.test(x))&&s.recChip==='힘 3'&&s.tagMarks&&!s.unkMarks&&s.tabName==='조합법'&&/곳간 도토리 \+ 소금 → 알도토리묵/.test(s.known||'')
      &&s.unknownN>0&&/□ \+ □ \+ □ → 버섯찜/.test(s.memo)&&/아빠/.test(s.memo)&&/알아낸 조합법/.test(s.head||''),
      'bond-ui','정표 탭·가공대 기운 칩·이름표 표식·수첩 조합법 장(아는 것은 조합식, 모르는 것은 빈칸과 아빠 메모)이 보여야 한다.',s);
    // 결정 D-1465: 화면 위 기운 칩에 마우스를 올리면 설명 풍선이 뜬다
    b.scene='buff / tip';
    s=await b.eval(`(()=>{G.buff={k:'eye',lv:3,from:'gamcho_hwan'};refreshHud();const c=document.querySelector('#foodBuff .buff-chip');
      c.dispatchEvent(new PointerEvent('pointerover',{bubbles:true}));const t=$('uiTip');const r={chip:c?.textContent,shown:!t.hidden,text:t.textContent};
      document.body.dispatchEvent(new PointerEvent('pointerover',{bubbles:true}));r.hid=t.hidden;G.buff=null;refreshHud();return r;})()`);
    check(s.chip==='밝은 눈 3'&&s.shown&&/다음 보스 싸움/.test(s.text)&&/칡 감초환을 먹고/.test(s.text)&&s.hid,'buff-tip','품은 기운 칩에 마우스를 올리면 기운 설명 풍선이 떠야 한다.',s);
    // 결정 D-1467: 정이 있는 인물은 늘 '선물하기'가 있다. 보따리의 먹을거리·재료를 모두 내밀 수 있고(도구는 뺀다),
    // 좋아하는 것이 아니면 그 인물의 보통대사로 마음만 받고 물건은 돌려준다. 보따리가 비어도 칸은 있다
    b.scene='bond / gift button';
    const giftSet=await b.eval(`(()=>{closePanels();dlgDismiss();const T=TABLES.TASTES.stream_otter||{};
      const plain=Object.keys(ITEMS).find(k=>ITEMS[k].kind==='재료'&&!T[k]&&!ITEMS[k].bond),tool=Object.keys(ITEMS).find(k=>ITEMS[k].kind==='도구');
      G.inv={[plain]:2,[tool]:1};talk([['여울','안녕!']]);return {plain,tool};})()`);
    await b.until("!document.getElementById('fieldTaste').hidden");
    await press(b,'#fieldTaste > button');
    s=await b.eval(`(()=>{const label=document.querySelector('#fieldTaste > button').textContent;
      const items=[...document.querySelectorAll('#fieldTaste .taste-choices .gift-item')].map(x=>x.dataset.item);
      document.querySelector('#fieldTaste .gift-item[data-item="${giftSet.plain}"]')?.click();
      return {label,items,resp:document.querySelector('#fieldTaste .taste-response').textContent,left:G.inv['${giftSet.plain}'],plainLine:TABLES.BONDS.stream_otter.plain};})()`);
    check(s.label==='선물하기'&&s.items.includes(giftSet.plain)&&!s.items.includes(giftSet.tool)&&s.resp.includes(s.plainLine)&&/물건은 그대로다/.test(s.resp)&&s.left===2,
      'bond-gift-plain','여울과 대화하면 선물하기 칸에 재료가 보이고(도구는 빠지고), 좋아하는 것이 아닌 물건은 보통대사와 함께 돌려받아야 한다.',{giftSet,s});
    await b.eval("(()=>{dlgDismiss();G.inv={};talk([['검댕','콜록…']]);})()");
    await b.until("!document.getElementById('fieldTaste').hidden");
    await press(b,'#fieldTaste > button');
    s=await b.eval("({label:document.querySelector('#fieldTaste > button').textContent,empty:document.querySelector('#fieldTaste .taste-empty')?.textContent||''})");
    check(s.label==='선물하기'&&/건넬 만한 것이 없다/.test(s.empty),'bond-gift-empty','보따리가 비어도 정이 있는 인물에게는 선물하기 칸이 있고, 펼치면 건넬 것이 없다고 보여야 한다.',s);
    await b.eval('dlgDismiss()');
  }catch(error){findings.push({rule:'runner',severity:'높음',message:error.stack||String(error),scene:b.scene});}
  const file=path.join(outDir,'trade.json');fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(file,JSON.stringify({records,findings},null,2)+'\n');
  return {name:'trade',status:findings.length?'fail':'pass',summary:`교환 여러 몫·선물 답례 ${records.length}가지 확인`,findings,evidence:[file]};
}
module.exports={runTrade};
