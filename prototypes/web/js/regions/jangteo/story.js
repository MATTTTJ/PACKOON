'use strict';
/* 큰 장터 진행: NPC 대화와 교환, 모락의 김 올리기, 엿방울의 엿가위 장단, 숙소 마루(낮/밤), 헌물 도깨비, 홍시 약떡 보내기, 지금 할 일.
   흐름은 design/narrative/jangteo-scenario.md (제안), 교환은 design/data/trades.csv
   교환 연쇄: 솔방울 → 쌀 → (맷돌) 쌀가루 → 모락 → 시루 깨어남 → 팥시루떡 → 부엉 영감 → 신표·아빠의 메모 → 창고 지키기 */
(()=>{
const Rg=REGIONS.jangteo;
const night=()=>G.f.night;

/* ---------- 작은 미니게임 창 만들기 (돌너머 돌 쌓기와 같은 모양) ---------- */
function makePanel(id,title,btn){
  const p=el('div','forge');p.id=id;p.hidden=true;
  p.innerHTML='<h2>'+title+'</h2><canvas id="'+id+'Cv" width="320" height="120" style="display:block;width:min(100%,380px);height:auto;margin:0 auto;image-rendering:pixelated;background:#efe3c8;border:2px solid var(--meok);border-radius:3px;touch-action:none"></canvas><div class="pips" id="'+id+'Pips"></div><div class="fhint" id="'+id+'Hint"></div><button class="btn primary strike" id="'+id+'Btn" type="button">'+btn+' <kbd>Space · J</kbd></button>';
  $('shell').appendChild(p);return p;
}

/* ---------- 모락 (반달가슴곰 떡집): 김 올리기 ---------- */
/* 김 올리기: 부채질(누르기)로 불을 올리면 김이 따라 오른다. 김을 금빛 칸에 맞춰 두면 잦아들던 게 차오른다. 너무 세면 멈출 뿐 깎이지 않는다 (임시 규칙) */
const steamP=makePanel('steam','떡집 아궁이 · 김 올리기','부채질');
const sm={fire:0,steam:0,prog:0,over:false,band:[55,80],cool:0};
const scv=$('steamCv'),sx=scv.getContext('2d');
function openSteam(){Object.assign(sm,{fire:10,steam:0,prog:0,over:false,cool:0});$('steamHint').textContent='부채질로 불을 조금씩 올리자. 김이 금빛 칸에 머물면 시루가 데워진다.';steamP.hidden=false;drawSteam();}
function drawSteam(){
  const c=sx,Wc=320,Hc=120;c.fillStyle='#efe3c8';c.fillRect(0,0,Wc,Hc);
  // 아궁이와 불
  c.fillStyle='#6e5b4b';c.fillRect(20,60,90,50);c.fillStyle='#2a1a10';c.fillRect(36,78,58,32);
  const fh=6+sm.fire*0.24;for(let i=0;i<5;i++){c.fillStyle=['#ff7b2e','#ffb347','#e8551f'][(i+Math.floor(G.anim/5))%3];c.fillRect(40+i*11,110-fh-((i*7)%5),8,fh);}
  // 시루와 김
  c.fillStyle='#9b5b3a';c.fillRect(30,40,70,22);c.fillStyle='#e6b54a';c.fillRect(28,38,74,4);
  const n=Math.floor(sm.steam/12);for(let i=0;i<n;i++){const k=(G.anim*0.8+i*14)%40;c.fillStyle='rgba(255,255,255,'+(0.8-k/60).toFixed(2)+')';c.fillRect(40+((i*13)%50)+Math.sin((G.anim+i*30)*0.05)*4,34-k,8,5);}
  // 김 막대
  const bx=140,bw=160,by=30;c.fillStyle='#3a2a20';c.fillRect(bx,by,bw,16);c.fillStyle='rgba(220,165,69,.7)';c.fillRect(bx+bw*sm.band[0]/100,by,bw*(sm.band[1]-sm.band[0])/100,16);
  c.fillStyle='#f4efe4';c.fillRect(bx+bw*Math.min(100,sm.steam)/100-2,by-4,4,24);
  c.fillStyle='#2a2019';c.font='12px "Gowun Dodum", sans-serif';c.fillText('김',bx,by-8);
  // 데워진 정도
  c.fillStyle='#d8c9a6';c.fillRect(bx,by+40,bw,10);c.fillStyle='#b4432a';c.fillRect(bx,by+40,bw*sm.prog/100,10);c.fillStyle='#2a2019';c.fillText('시루가 데워진 정도',bx,by+68);
  $('steamPips').innerHTML='';
}
function steamStep(){
  sm.fire=Math.max(0,sm.fire-0.32);sm.steam+=(sm.fire-sm.steam)*0.035;if(sm.cool>0)sm.cool--;
  const inBand=sm.steam>=sm.band[0]&&sm.steam<=sm.band[1];
  if(inBand&&sm.prog<100){sm.prog=Math.min(100,sm.prog+0.55);if(sm.prog>=100){$('steamHint').textContent='김이 고르게 올랐다!';setTimeout(finishSteam,500);}}
  if(sm.steam>90&&!sm.over){sm.over=true;$('steamHint').textContent='모락: "아이고, 너무 세다! 떡이 설겠어. 부채를 쉬어라."';}
  if(sm.steam<sm.band[1]&&sm.over){sm.over=false;$('steamHint').textContent='그렇지, 그대로. 김이 칸 안에 머물게.';}
  drawSteam();
}
function steamHit(){if(sm.cool>0||sm.prog>=100)return;sm.cool=6;sm.fire=Math.min(100,sm.fire+12);}
$('steamBtn').addEventListener('pointerdown',e=>{e.preventDefault();steamHit();});scv.addEventListener('pointerdown',e=>{e.preventDefault();steamHit();});
defineMinigame({id:'steam',step:steamStep,hit:steamHit});
function finishSteam(){
  if(steamP.hidden)return;steamP.hidden=true;const F=G.f;
  F.steamDone=true;awaken('siru');ledgerDone('morak');rel('morak',1);learn('morak:steam');
  diary('j_siru','모락에게 김 올리는 법을 배웠다. 보따리 속 시루에 처음으로 김이 서렸다. 잔칫날의 시루가 깨어났다.');
  toast('잔칫날의 시루가 깨어났다! 쌀가루 2 + 팥 1 → 팥시루떡');refreshHud();
  const lines=[['모락','그렇지! 떡은 김이 반이야.'],['너구리','(보따리 속 시루가 따뜻해졌다. 이제 시루로 떡을 찔 수 있다.)']];
  if(G.rel.morak.v>=2&&!F.morakTaught){F.morakTaught=true;learn('morak:memiltteok');addItem('memil_powder',1);
    lines.push(['모락','그리고 하나 더. 메밀가루 둘이면 메밀떡도 쪄져. 메밀가루 한 됫박 얹어 줄게.'],
      ['모락','장터 할머니들이 그러는데, 도깨비는 메밀을 좋아한대. 요즘 밤마다 장터 물건이 없어지잖니. 혹시 모르지.']);}
  talk(lines);
}
function talkMorak(){
  const F=G.f;
  if(!F.morakMet){F.morakMet=true;ledger('morak','모락','쌀가루 3','시루를 깨움');
    talk([['모락','어서 와! …아이고 미안, 정신이 없네. 설 대목인데 떡집 맷돌이 쩍 갈라졌지 뭐야.'],
      ['모락','쌀가루가 모자라 떡을 못 쪄. 누가 쌀가루 세 됫박만 갈아다 주면 소원이 없겠다.'],
      ['모락','쌀? 엿방울이 엿 고고 남은 쌀을 쌓아 두고 있을걸.']],()=>{if(has('ssal_powder',3))morakGive();});
    return;
  }
  if(!F.morakPowder){if(has('ssal_powder',3))morakGive();else talk([['모락','쌀가루 세 됫박. 갈 맷돌이 있다면 말이야… 하하.']]);return;}
  if(!F.steamDone){talk([['모락','다시 해 볼래? 불은 조금씩, 김은 고르게.',[{t:'다시 아궁이 앞에 앉는다',go:openSteam},{t:'조금 이따가요',go:null}]]]);return;}
  talk([['모락','떡은 김이 반이야. 시루 잘 쓰고 있지?']]);
}
function morakGive(){
  talk([['모락','쌀가루다! 줄 거니?',[{t:'쌀가루 3을 건넨다',go:()=>{
    const F=G.f;takeItem('ssal_powder',3);F.morakPowder=true;rel('morak',1);
    clue('j1','모락','모락: "네 엄마 떡 솜씨는 장터에서도 유명했지. 근데 네 아빠는 엄마 얘기만 나오면 말을 돌리더라."');
    diary('j_morak','떡집 모락이 우리 엄마를 안다. 엄마 떡 솜씨는 장터에서도 유명했다고. 그런데 아빠는 엄마 얘기만 나오면 말을 돌렸다고 한다.');
    talk([['모락','고맙다, 꼬마야! 그 보따리 속 맷돌로 갈았구나?'],['모락','…잠깐, 그 시루. 금빛 테 두른 그 시루, 어디서 났니?'],
      ['너구리','(보따리에서 시루를 꺼내 보였다.)'],['모락','너희 엄마 시루구나! 네 엄마 떡 솜씨는 장터에서도 유명했지.'],
      ['모락','근데 네 아빠는 엄마 얘기만 나오면 말을 돌리더라. 별일이지.'],
      ['모락','시루는 김을 다룰 줄 알아야 깨어나. 아궁이 불 다루는 거, 내가 가르쳐 주마.']],openSteam);
  }},{t:'아직은 안 줄래',go:null}]]]);
}

/* ---------- 엿방울 (여우 엿장수): 엿가위 장단 ---------- */
/* 엿가위 장단: 흘러오는 가위 소리 8개를 선에 맞춰 친다. 5개 이상이면 흥이 올라 아빠의 엿을 내준다. 못 맞춰도 쌀은 받고, 다시 할 수 있다 (임시 규칙) */
const rhP=makePanel('rhythm','엿가위 장단','쩔꺽');
const rh={t:0,notes:[],hits:0,done:false,cool:0,reward:false};
const rcv=$('rhythmCv'),rx=rcv.getContext('2d');const HIT_X=64,SPEED=1.9,NOTES=8;
function openRhythm(reward){Object.assign(rh,{t:0,hits:0,done:false,cool:0,reward,notes:Array.from({length:NOTES},(_,i)=>({x:340+i*62+(i%3===2?24:0),st:0}))});
  $('rhythmHint').textContent='가위가 선에 닿을 때 "쩔꺽"! 장단이 맞으면 엿방울의 흥이 오른다.';rhP.hidden=false;drawRhythm();}
function drawRhythm(){
  const c=rx;c.fillStyle='#efe3c8';c.fillRect(0,0,320,120);
  c.fillStyle='#e3d1ab';c.fillRect(0,46,320,30);c.fillStyle='#b4432a';c.fillRect(HIT_X-1,38,3,46);c.strokeStyle='#b4432a';c.lineWidth=2;c.beginPath();c.arc(HIT_X,61,12,0,Math.PI*2);c.stroke();
  rh.notes.forEach(n=>{if(n.st===1||n.x<-20||n.x>340)return;const g=n.st===2?'rgba(42,32,25,.3)':'#2a2019';
    c.fillStyle=g;c.fillRect(n.x-7,54,5,14);c.fillRect(n.x+2,54,5,14);c.fillRect(n.x-3,50,6,4);c.fillStyle=n.st===2?'rgba(42,32,25,.2)':'#7a7e84';c.fillRect(n.x-6,52,12,2);});
  c.fillStyle='#2a2019';c.font='13px "Gowun Dodum", sans-serif';c.fillText('흥 '+rh.hits+' / '+NOTES,12,24);
  $('rhythmPips').innerHTML=Array.from({length:NOTES},(_,i)=>'<span class="pip'+(i<rh.hits?' on':'')+'"></span>').join('');
}
function rhythmStep(){if(rh.done)return;rh.t++;if(rh.cool>0)rh.cool--;
  rh.notes.forEach(n=>{n.x-=SPEED;if(n.st===0&&n.x<HIT_X-14){n.st=2;$('rhythmHint').textContent='…장단을 놓쳤다. 다음 소리!';}});
  if(rh.notes.every(n=>n.st!==0)){rh.done=true;setTimeout(finishRhythm,500);}
  drawRhythm();}
function rhythmHit(){if(rh.done||rh.cool>0)return;rh.cool=8;
  const n=rh.notes.find(n=>n.st===0&&Math.abs(n.x-HIT_X)<11);
  if(n){n.st=1;rh.hits++;$('rhythmHint').textContent=['쩔꺽!','쩔꺽쩔꺽!','얼씨구!','좋다!','절씨구!','엿 사려~!','흥이 난다!','얼쑤!'][rh.hits-1];}
  drawRhythm();}
$('rhythmBtn').addEventListener('pointerdown',e=>{e.preventDefault();rhythmHit();});rcv.addEventListener('pointerdown',e=>{e.preventDefault();rhythmHit();});
defineMinigame({id:'rhythm',step:rhythmStep,hit:rhythmHit});
function finishRhythm(){
  if(rhP.hidden)return;rhP.hidden=true;const F=G.f;const high=rh.hits>=5;learn('yeotbang:rhythm');
  const lines=[];
  if(rh.reward){F.yeotDone=true;ledgerDone('yeotbang');addItem('ssal',8);
    lines.push(['엿방울',high?'얼씨구, 장단 좀 아네! 흥이 절로 난다.':'흥이 덜 났네. 그래도 엿장수 약속은 약속이지.'],['엿방울','엿 고고 남은 쌀 여덟 되. 가져가.']);}
  rel('yeotbang',high?2:1);
  if(high&&!F.yeotHigh){F.yeotHigh=true;addItem('dad_yeot',1);learn('yeotbang:high');
    clue('j2','엿방울','아빠는 아들 주려고 엿을 샀다가, 끝내 못 가져가고 엿방울에게 맡겨 두었다.');
    diary('j_yeot','엿방울이 흥이 나서 숨겨 둔 엿을 내줬다. 아빠가 나 주려고 사 두고 끝내 못 가져간 가락엿이라고 했다.');
    lines.push(['엿방울','흥 난 김에 하나 더. 이건 팔 물건이 아니야.'],['엿방울','그 너구리 아저씨, 아들 준다고 샀는데 끝내 못 가져갔어. 네가 그 아들이구나.']);}
  else if(!high&&!F.yeotHigh)lines.push(['엿방울','흥이 더 나면… 내놓을 게 하나 있긴 한데. 다음에 장단 다시 맞춰 보자.']);
  talk(lines);
}
function talkYeot(){
  const F=G.f;
  if(!F.yeotMet){F.yeotMet=true;ledger('yeotbang','엿방울','솔방울 5','쌀');
    talk([['엿방울','엿 사려, 엿! …라고 하고 싶은데 불이 꺼져 가네.'],
      ['엿방울','엿을 고려면 불을 오래 때야 하는데 솔방울이 떨어졌어. 뒷산 소나무 숲에서 솔방울 다섯만 주워 와.'],
      ['엿방울','엿 고고 남은 쌀을 줄게. 엿장수 마음대로지만, 흥만 나면 더 줄 수도 있고.']],()=>{if(has('solbang',5))yeotTrade();});
    return;
  }
  if(!F.yeotDone){if(has('solbang',5))yeotTrade();else talk([['엿방울','솔방울 다섯! 뒷산 소나무 숲에 굴러다녀.']]);return;}
  if(!F.yeotHigh){talk([['엿방울','장단 한 번 더 맞춰 볼래? 흥이 나면 내놓을 게 있다니까.',[{t:'엿가위 장단을 맞춘다',go:()=>openRhythm(false)},{t:'그만두기',go:null}]]]);return;}
  talk([['엿방울','엿 사려, 엿~ 장단 맞추는 꼬마 보부상이 왔네.']]);
}
function yeotTrade(){
  talk([['엿방울','솔방울이다! 줄 거지?',[{t:'솔방울 5개를 건넨다',go:()=>{
    takeItem('solbang',5);
    talk([['엿방울','좋아, 불 올리자! 엿 고는 동안 장단 한번 맞춰 볼래? 내 가위 소리에 맞춰서!']],()=>openRhythm(true));
  }},{t:'아직은 안 줄래',go:null}]]]);
}

/* ---------- 날쌘 (다시 만남): 설 대목 팥 ---------- */
function talkNal(){
  if(!G.f.nalJTalk){G.f.nalJTalk=true;ledger('nal_jangteo','날쌘','쌀가루 1 (또는 메밀가루 1)','팥');
    talk([['날쌘','또 너냐! 설 대목엔 팥이 금값이야. 고사떡엔 팥이 빠질 수 없거든.']],nalMenu);}
  else nalMenu();
}
function nalMenu(){
  const F=G.f,c=[];
  if(!F.nalJDone){
    if(has('ssal_powder'))c.push({t:'쌀가루를 내민다 (팥 1)',go:()=>nalTrade('ssal_powder')});
    if(has('memil_powder'))c.push({t:'메밀가루를 내민다 (팥 2)',go:()=>nalTrade('memil_powder')});
    if(!F.nalJBluff)c.push({t:'허세 부리기: "팥 한 되에 뭘 그리 비싸게 굴어"',go:nalBluff});
  }
  c.push({t:'그만두기',go:null});
  talk([['날쌘',F.nalJDone?'고사떡 잘 쪄라. 부엉 영감은 팥 빛깔까지 본다.':(has('ssal_powder')||has('memil_powder'))?'뭘 내놓을 건데?':'가루 한 됫박이면 팥 한 되. 쌀가루든 메밀가루든.',c]]);
}
function nalTrade(id){
  const F=G.f;takeItem(id,1);F.nalJDone=true;ledgerDone('nal_jangteo');
  const n=(id==='memil_powder'?2:1)+(F.nalJBluff?1:0);addItem('pat',n);
  if(id==='memil_powder')learn('nal:jangteo-memil');
  talk(id==='memil_powder'?[['날쌘','돌너머 메밀가루? 이야, 장터에선 귀한 거다. 팥 '+n+'되 쳐주지.']]:[['날쌘','거래 성립. 팥 '+n+'되.']]);
}
function nalBluff(){G.f.nalJBluff=true;rel('nal',1);
  talk([['너구리','팥 한 되에 뭘 그리 비싸게 굴어.'],['날쌘','하! 대목 장사를 몰라도 한참 모르는군.'],['날쌘','…좋아, 그 배짱에 한 되 더 얹어 주지.']],nalMenu);}

/* ---------- 숙소 마루: 쉬면 낮과 밤이 바뀐다 ---------- */
function restMaru(){
  const toNight=!night();
  talk([['너구리',toNight?'(숙소 마루에 앉아 해가 지기를 기다렸다. …장터에 하나둘 등불이 켜진다.)':'(마루에서 한숨 자고 나니 날이 밝았다.)']],()=>{
    G.f.night=toNight;learn('maru:rest');toast(toNight?'밤이 되었다':'아침이 되었다');refreshGoal();});
}

/* ---------- 부엉 영감 (보부상단 접장): 밤에만 깨어 있다 ---------- */
function talkBueong(){
  const F=G.f;
  if(!night()){learn('bueong:night');
    talk([['부엉 영감','(처마 밑에서 꾸벅꾸벅 졸고 있다.)'],['너구리','(낮에는 자는 모양이다. 숙소 마루에서 쉬며 해가 지기를 기다리자.)']]);return;}
  if(!F.bueongNight){F.bueongNight=true;F.bueongMet=true;learn('bueong:rule');ledger('bueong','부엉 영감','팥시루떡 1','아빠가 맡긴 짐');
    talk([['부엉 영감','부엉. …그 모자. 보부상단 장부에 이름이 있는 그 너구리 거로구나.'],
      ['부엉 영감','녀석이 짐을 맡겨 놨다. 허나 보부상단 물건은 보부상에게만 내준다. 그게 규칙이다.'],
      ['부엉 영감','정식 보부상이 되고 싶으면 보부상단 설 고사에 팥시루떡을 올려라. 그럼 신표를 주마.']],()=>{if(has('patsirutteok'))bueongGive();});
    return;
  }
  if(!F.bueongDone){if(has('patsirutteok'))bueongGive();else talk([['부엉 영감','팥시루떡. 쌀가루 둘에 팥 하나, 시루에 쪄야 제맛이다.']]);return;}
  if(!G.boss.dead){talk([['부엉 영감','창고다. 그믐 밤엔 헌것들이 들썩인다. 문 앞을 지켜라.']]);return;}
  talk([['부엉 영감','수고했다. 장부에 적어 두마. 진짜 보부상이로구나.']]);
}
function bueongGive(){
  talk([['부엉 영감','…고사떡이로구나.',[{t:'팥시루떡을 고사상에 올린다',go:()=>{
    const F=G.f;takeItem('patsirutteok',1);F.bueongDone=true;F.guard=true;ledgerDone('bueong');rel('bueong',1);learn('bueong:sinpyo');
    addItem('sinpyo',1);addItem('dad_memo',1);
    clue('j3','아빠의 메모','아빠가 숙소에 맡긴 짐 속 메모: "글자는 \'되돌림\'이었다. 값은 이미 치러졌다. 이번엔 내가 치른다. 북쪽 영산."');
    diary('j_memo','보부상 신표를 받았다. 아빠의 짐 속에 메모가 있었다. 아빠가 읽은 글자는 \'되돌림\'. "값은 이미 치러졌다. 이번엔 내가 치른다." 누가, 무슨 값을 치렀다는 걸까.');
    talk([['부엉 영감','붉은 팥이 제대로 들었다.'],['부엉 영감','(부엉 영감이 떡을 고사상에 올리고, 장부에 내 이름을 적는다.)'],
      ['부엉 영감','이제 너도 보부상단 식구다. 신표를 받아라.'],['부엉 영감','그리고 이건 녀석의 짐이다.'],
      ['너구리','(아빠의 짐 속에 접힌 종이가 있다. 아빠의 글씨다.)'],
      ['너구리','"글자는 \'되돌림\'이었다. 값은 이미 치러졌다. 이번엔 내가 치른다. 북쪽 영산."'],
      ['부엉 영감','…보부상에겐 의무가 있다. 오늘이 섣달그믐이다. 밤마다 장터 물건이 사라지니, 숙소 창고를 지켜라.']],()=>{toast('숙소 창고를 지키자');refreshGoal();});
  }},{t:'아직은 안 올릴래',go:null}]]]);
}

/* ---------- 헌물 도깨비 전투 ---------- */
Rg.startDokkaebi=()=>{
  G.px=Rg.STORE_X-30;
  inkTransition('전투',(Rg.STORE_X-G.cam)/W*100,()=>startBattle('dokkaebi',res=>{
    if(res==='win'||res==='calm'){
      if(res==='calm'){G.f.dokCalm=true;diary('j_calm','헌물 도깨비를 부수지 않고 달랬다. 도깨비는 훔친 것을 돌려놓고 춤추듯 사라졌다.');}
      Rg.bossDie(res==='calm');
    }else{
      G.px=Rg.STORE_X-70;G.f.faints+=res==='lose'?1:0;
      diary('j_hint','헌물 도깨비는 빗자루로 쓸고, 키로 콩을 뿌리고, 멍석을 말아 온다. 헌물을 하나 부수면 도깨비불이 드러난다. 도깨비는 메밀을 좋아한다는 말이 있다.');
      toast('일기에 공략을 적어 두었다. 준비되면 다시 창고 문 앞으로');
    }
  }));
};

/* ---------- 끝: 홍시 약떡을 까치 편에 보내기 ---------- */
Rg.sendMedicine=()=>{
  G.f.hongsiMade=true;
  diary('j_end','눈홍시와 쌀가루로 홍시 약떡을 쪘다. 엄마가 동네에 떡을 돌리던 시루로, 이번엔 엄마를 위한 떡을 쪘다.');
  talk([['너구리','홍시 약떡이다. 엄마 시루로 쪘어.'],['너구리','(숙소 처마에 앉아 있던 까치가 내려와 떡 보자기를 물었다.)'],['너구리','엄마한테 부탁해. 엄마 시루로 찐 거라고 꼭 전해 줘.']],()=>{
    takeItem('hongsi_tteok',1);endGame();
  });
};

/* ---------- NPC (npcs.csv 의 id). x 는 필드 위치 ---------- */
Rg.npcs=[
  {id:'morak',name:'모락',x:360,talk:talkMorak,draw:Rg.art.bear,props:Rg.props.tteokjip},
  {id:'yeotbang',name:'엿방울',x:640,talk:talkYeot,draw:Rg.art.fox,props:Rg.props.yeotcart},
  {id:'nal',name:'날쌘',x:960,talk:talkNal,draw:COMMON_ART.weasel,props:COMMON_ART.nalProps},
  {id:'maru',name:'숙소 마루',x:1070,prompt:'숙소 마루에서 쉬기',talk:restMaru,draw:()=>{},props:Rg.props.maru},
  {id:'bueong',name:'부엉 영감',x:1190,talk:talkBueong,draw:Rg.art.owl},
];

/* ---------- 지금 할 일 ---------- */
Rg.goal=()=>{
  const F=G.f;
  if(!G.started)return '';
  if(G.ended)return '큰 장터 체험판 완료';
  const toNight=s=>night()?s:'밤이 되면 '+s+' (숙소 마루에서 쉬기)';
  if(!F.bueongNight)return night()?'처마 밑의 부엉 영감에게 말 걸기 (밤에는 깨어 있다)':knows('bueong:night')?'숙소 마루에서 쉬며 해가 지기를 기다리기':'보부상 숙소의 부엉 영감 찾아가기';
  if(!F.bueongDone){
    if(has('patsirutteok'))return toNight('부엉 영감에게 팥시루떡 올리기');
    if(!isAwake('siru')){
      if(!F.morakMet)return '김이 오르는 떡집의 모락 찾아가기';
      if(F.morakPowder)return '모락에게 김 올리기 다시 배우기';
      const sp=G.inv.ssal_powder||0,s=G.inv.ssal||0;
      if(sp>=3)return '모락에게 쌀가루 3 건네기';
      if(sp+s>=3)return '보따리를 열고 맷돌에 쌀을 넣어 쌀가루 갈기 ('+sp+'/3)';
      if(!F.yeotMet)return '엿 수레의 엿방울에게 쌀 구하기';
      const sb=G.inv.solbang||0;
      return sb>=5?'엿방울에게 솔방울 건네기':'뒷산 소나무 숲에서 솔방울 줍기 ('+sb+'/5)';
    }
    if(!has('pat'))return '숙소 앞 날쌘에게 팥 구하기';
    if((G.inv.ssal_powder||0)<2)return '보따리를 열고 맷돌에 쌀을 넣어 쌀가루 갈기';
    return '보따리를 열고 시루에 쌀가루 2와 팥 1 넣어 찌기';
  }
  if(!G.boss.dead)return toNight('숙소 창고 문 앞을 지키기');
  if((G.inv.ssal_powder||0)<1&&!has('hongsi_tteok'))return '보따리를 열고 맷돌에 쌀을 넣어 쌀가루 갈기';
  return '보따리를 열고 시루에 눈홍시와 쌀가루 넣어 홍시 약떡 찌기';
};
})();
