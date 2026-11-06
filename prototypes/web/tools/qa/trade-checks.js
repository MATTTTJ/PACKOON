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
  }catch(error){findings.push({rule:'runner',severity:'높음',message:error.stack||String(error),scene:b.scene});}
  const file=path.join(outDir,'trade.json');fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(file,JSON.stringify({records,findings},null,2)+'\n');
  return {name:'trade',status:findings.length?'fail':'pass',summary:`교환 여러 몫·선물 답례 ${records.length}가지 확인`,findings,evidence:[file]};
}
module.exports={runTrade};
