'use strict';
/* 큰 장터 진행: NPC 대화와 교환, 모락의 김 올리기, 엿방울의 엿가위 장단, 숙소 마루(낮/밤), 헌물 도깨비, 홍시 약떡 보내기, 지금 할 일.
   흐름은 design/narrative/jangteo-scenario.md (제안), 교환은 design/data/trades.csv
   교환 연쇄: 솔방울 → 쌀 → (맷돌) 쌀가루 → 모락 → 시루 깨어남 → 팥시루떡 → 부엉 영감 → 신표·아빠의 메모 → 창고 지키기 */
(()=>{
const Rg=REGIONS.jangteo;
const MG=TABLES.MINIGAMES;
const night=()=>G.f.night;
const originalStart=Rg.onStart;
Rg.onStart=()=>{
  originalStart();
  if((G.f.jxChoraengiEarned||G.f.yeotHigh)&&typeof grantMask==='function')grantMask('choraengi');
  if(typeof grantNickname==='function'){
    if(G.f.jxKiteDone)grantNickname('jangteo_kite','연 건지는 손','연 아이');
    if(G.f.jxYutReward)grantNickname('jangteo_yut','한판 벗','윷놀이 노인들');
  }
};

/* [시험판] 선택한 사연만 연다. 거래·가공·창고 지키기는 기존 조건을 따른다.
   지역 간 기억: nalDTalk는 읽기만, jangteoArcsNal3는 영산에서 읽을 수 있다. */
function arcScene(flag,text,lines,after){
  G.f[flag]=true;diary(flag,text);talk(lines,after);
}
function morakNight(){
  arcScene('jangteoArcsMorak2','모락은 멀리 떠난 새끼에게 보낼 설 떡을 따로 싸 두었다. 정작 자기 저녁은 아직이었다.',[
    ['모락','먹고 해, 먹고! 어, 이 보자기는 따로야.'],
    ['너구리','누구 거예요?'],
    ['모락','멀리 간 우리 새끼 줄 설 떡이야!'],
    ['너구리','모락은요?'],
    ['모락','내 저녁? 어이쿠, 그걸 잊었네!']
  ]);
}
function yeotNight(){
  arcScene('jangteoArcsYeot2','엿방울은 작년 그믐 밤 도깨비에게 엿가위를 빼앗겼다. 낮에 치던 가위는 빌린 것이었다.',[
    ['엿방울',G.boss.dead?'어라, 도깨비가 갔다고? 이제 수레 밖에 있어도 되겠네~':'쉿, 꼬마야. 수레 밑에 있는 건 비밀이야~'],
    ['너구리','가위는요?'],
    ['엿방울','작년 그믐에 도깨비가 내 엿가위를 가져갔지 뭐야.'],
    ['엿방울','지금 건 빌린 거야. 내 가위면 소리가 더 찰진데~']
  ]);
}
function yeotReturn(){
  arcScene('jangteoArcsYeotReturned','돌려받은 헌물 사이에서 엿방울의 엿가위를 찾았다. 제 가위로 치는 장단을 함께 맞춰 보기로 했다.',[
    ['너구리','돌려받은 헌물에 이게 있었어요.'],
    ['엿방울','어라, 내 엿가위! 자, 제 소리가 나는지 들어 볼까~']
  ],()=>openRhythm(false));
}
function bueongLedger(){
  arcScene('jangteoArcsBueong2','부엉 영감의 옛 장부에 날쌘의 줄이 있었다. 상단 물건을 잃었을 때 아빠가 대신 물어 준 기록이었다.',[
    ['부엉 영감','(장부를 한 장 넘겨 오래된 줄을 짚는다.)'],
    ['부엉 영감','날쌘. 상단 물건을 잃은 날의 기록이다.'],
    ['너구리','그 옆은 아빠예요?'],
    ['부엉 영감','그래. 네 아빠가 대신 물어 주었다.']
  ]);
}
function nalLedger(){
  arcScene('jangteoArcsNal3','날쌘은 부엉 영감이 있는 숙소를 피했다. 장부 이야기는 꺼내지 말라고 했다.',[
    ['너구리',G.f.nalDTalk?'돌너머에선 안 숨었잖아요.':'왜 숙소에서 떨어져 있어요?'],
    ['날쌘','누가 숨어? 여기서도 장사 잘돼.'],
    ['너구리','장부에 있던데요.'],
    ['날쌘','…장부 얘기 하지 마라. 팥이나 봐.']
  ]);
}
function bueongPromise(){
  arcScene('jangteoArcsBueong3','날쌘은 그 일 뒤 상단을 떠났다. 부엉 영감은 남이 갚은 줄도 지우지 않는다고 했다.',[
    ['부엉 영감','(장부를 넘기다 날쌘의 줄에 손을 멈춘다.)'],
    ['부엉 영감','날쌘은 그 뒤 상단을 떠났다.'],
    ['너구리','다 갚은 줄인데요?'],
    ['부엉 영감','셈은 맞아야 한다. 남이 갚은 줄도 지우진 않는다.']
  ]);
}

/* ---------- 작은 미니게임 창 만들기 (돌너머 돌 쌓기와 같은 모양) ---------- */
function makePanel(id,title,btn){
  const p=el('div','forge');p.id=id;p.hidden=true;
  p.innerHTML='<h2>'+title+'</h2><canvas id="'+id+'Cv" width="320" height="120" style="display:block;width:min(100%,380px);height:auto;margin:0 auto;image-rendering:pixelated;background:#efe3c8;border:2px solid var(--meok);border-radius:3px;touch-action:none"></canvas><div class="pips" id="'+id+'Pips"></div><div class="fhint" id="'+id+'Hint"></div><button class="btn primary strike" id="'+id+'Btn" type="button">'+btn+' <kbd>Space · J</kbd></button>';
  $('shell').appendChild(p);return p;
}

/* 짧은 손일은 채집의 바늘·판정 폭을 그대로 쓴다. 빗나가도 일을 마치며 물건은 쓰지 않는다. */
const handP=makePanel('jangteoHands','장터의 손일','손 맞추기');
// 새 지역 활동 창만 화면 안에 둔다. 작은 횡화면에 본문·버튼이 잘리지 않게 한다.
Object.assign(handP.style,{position:'fixed',left:'50%',right:'auto',top:'50%',bottom:'auto',transform:'translate(-50%,-50%)',width:'min(92vw,760px)',maxHeight:'92dvh',overflowY:'auto',boxSizing:'border-box',zIndex:'22'});
const hand={pos:0,dir:1,part:0,cool:0,kind:null,after:null};
const handJobs={
  kite:['아이와 연줄 감기',['꼬리 펴기','줄 감기','매듭 묶기']],
  snow:['새끼 멧돼지와 잠자리 치우기',['가지 들어 주기','쌓인 눈 털기','마른 풀 펴기']],
  lantern:['까치와 등불 달기',['심지 바로 세우기','등줄 묶기','불씨 옮기기']]
};
function drawHands(){
  const c=$('jangteoHandsCv').getContext('2d'),start=MG.gather_zone_start+hand.part*MG.gather_root_width;
  c.fillStyle='#efe3c8';c.fillRect(0,0,320,120);c.fillStyle='#7b6550';c.fillRect(24,57,272,16);
  c.fillStyle='#b79044';c.fillRect(24+start*2.72,57,MG.gather_root_width*2.72,16);
  c.fillStyle='#fff9df';c.fillRect(24+hand.pos*2.72,48,3,34);
  c.fillStyle='#3b3027';c.font='14px sans-serif';c.fillText(handJobs[hand.kind][1][hand.part],24,30);
  $('jangteoHandsPips').textContent=(hand.part+1)+' / '+handJobs[hand.kind][1].length+' · 금빛 칸에서 살짝';
}
Rg.handWork=(kind,after)=>{
  Object.assign(hand,{pos:0,dir:1,part:0,cool:0,kind,after});
  handP.querySelector('h2').textContent=handJobs[kind][0];handP.hidden=false;
  $('jangteoHandsHint').textContent='Space · J 또는 손 맞추기 버튼. 늦어도 같이 마칠 수 있어.';drawHands();
};
function handHit(){
  if(handP.hidden||hand.cool)return;
  const start=MG.gather_zone_start+hand.part*MG.gather_root_width;
  const good=hand.pos>=start&&hand.pos<=start+MG.gather_root_width;
  Sound.gather(good);hand.cool=MG.gather_cooldown;hand.part++;
  if(hand.part===handJobs[hand.kind][1].length){handP.hidden=true;const after=hand.after;hand.after=null;if(after)after();return;}
  $('jangteoHandsHint').textContent=good?'손이 딱 맞았다. 다음 것도 같이 하자.':'조금 늦었네. 옆에서 받쳐 줘서 마쳤다. 다음 걸 해 보자.';
  hand.pos=0;hand.dir=1;drawHands();
}
$('jangteoHandsBtn').addEventListener('pointerdown',e=>{e.preventDefault();handHit();});
defineMinigame({id:'jangteoHands',hit:handHit,step(){
  if(hand.cool)hand.cool--;if(!Vfx.reducedMotion){hand.pos+=hand.dir*MG.gather_root_speed;if(hand.pos>=100||hand.pos<=0)hand.dir*=-1;}
  drawHands();
}});

/* 장날 네 말 윷. 판·업기·잡기는 지역 규칙이며 타이밍 바늘은 채집 수치를 재사용한다.
   던진 뒤 옮기고, 윷·모 또는 잡기면 다시 던진다. 빽도는 쓰지 않는다. */
const yutP=makePanel('jangteoYut','설날 윷놀이 · 콩 네 말','윷 들기');
const ycv=$('jangteoYutCv');ycv.height=240;
Object.assign(yutP.style,{position:'fixed',left:'50%',right:'auto',top:'50%',bottom:'auto',transform:'translate(-50%,-50%)',width:'min(92vw,760px)',maxHeight:'92dvh',overflowY:'auto',boxSizing:'border-box',zIndex:'22'});
const ychoices=el('div');ychoices.id='jangteoYutChoices';yutP.appendChild(ychoices);
const yleave=el('button','btn','판을 두고 잠깐 일어나기');yleave.type='button';yutP.appendChild(yleave);
const ylabels=['','도','개','걸','윷','모'];
let yPos=0,yDir=1;
const yg=()=>G.f.jxYutGame;
const pawn=()=>({node:'S',lane:'outer'});
const routeChoices=p=>p.node==='A5'?['outer','b']:p.node==='A10'?['outer','d']:p.node==='C'?['b','d']:[p.lane];
function yMove(p,steps,route){
  let node=p.node,lane=route||p.lane;
  for(let i=0;i<steps&&node!=='H';i++){
    if(node==='S'){node='A1';lane='outer';}
    else if(node==='A5'&&lane==='b')node='B1';
    else if(node==='A10'&&lane==='d')node='D1';
    else if(node==='B1')node='B2';else if(node==='B2')node='C';
    else if(node==='D1')node='D2';else if(node==='D2')node='C';
    else if(node==='C')node=lane==='b'?'B4':'D4';
    else if(node==='B4')node='B5';else if(node==='D4')node='D5';
    else if(node==='B5'){node='A15';lane='outer';}
    else if(node==='D5'){node='A20';lane='outer';}
    else if(node==='A20')node='H';
    else node='A'+(+node.slice(1)+1);
  }
  return {node,lane};
}
Rg.yutRules={move:yMove,routes:routeChoices};
const youngStories=[
  '예전에 네 아빠도 이 방석에 앉았지. 아직 보따리 끈이 새것일 때야.',
  '젊은 아빠는 북쪽 장날부터 물었어. 장사도 길부터 알아야 한다면서.',
  '말 하나 잡히고 입이 댓 발 나왔지. 그래도 남의 콩은 주워 줬어.',
  '그땐 부를 준다는 열매 소문이 돌았지. 아빠도 그 소문을 쫓았고.',
  '판 끝나니 장보따리 끈을 고쳐 주더군. 손은 어릴 때부터 야물었어.',
  '우리가 길을 잘못 들까 봐 해 질 녘 깃대에 헝겊도 묶고 갔지.'
];
function yStory(){
  const s=yg(),i=Math.min(youngStories.length-1,Math.floor((s.throws-1)/5));
  if(i>=0&&!s.heard.includes(i)){s.heard.push(i);s.story=youngStories[i];}
  else s.story=G.f.night?'노인들: 등불이 켜지니 콩 그림자도 길어졌네. 낮에 놓친 길도 보이지.':'노인들: 말부터 골라 보거라. 모퉁이에 서면 안길로 꺾을 수 있단다.';
}
function yPoint(node){
  if(node==='S')return [285,205];if(node==='H')return [285,172];
  const fixed={B1:[235,62],B2:[201,88],C:[166,115],B4:[132,141],B5:[97,168],D1:[97,62],D2:[132,88],D4:[201,141],D5:[235,168]};
  if(fixed[node])return fixed[node];
  const i=+node.slice(1);
  if(i<=5)return [270,205-i*36];if(i<=10)return [270-(i-5)*42,25];
  if(i<=15)return [60,25+(i-10)*36];return [60+(i-15)*42,205];
}
function yDraw(){
  const s=yg();if(!s)return;const c=ycv.getContext('2d');
  c.fillStyle='#efe3c8';c.fillRect(0,0,320,240);c.strokeStyle='#9b754c';c.lineWidth=2;
  c.strokeRect(60,25,210,180);c.beginPath();c.moveTo(60,25);c.lineTo(270,205);c.moveTo(270,25);c.lineTo(60,205);c.stroke();
  for(const n of [...Array.from({length:20},(_,i)=>'A'+(i+1)),'B1','B2','C','B4','B5','D1','D2','D4','D5']){
    const [x,y]=yPoint(n);c.fillStyle='#fcf5e5';c.beginPath();c.arc(x,y,n==='C'?8:5,0,Math.PI*2);c.fill();c.stroke();
  }
  c.font='11px sans-serif';c.fillStyle='#3a3028';c.fillText('도착',278,159);c.fillText('출발',278,232);
  for(const [team,color] of [['me','#b54a34'],['elders','#416c82']]){
    const groups={};s[team].forEach((p,i)=>{const key=['S','H'].includes(p.node)?p.node+i:p.node;(groups[key]||(groups[key]=[])).push(i);});
    for(const ids of Object.values(groups)){
      const i=ids[0],p=s[team][i],[x,y]=yPoint(p.node);
      const dx=['S','H'].includes(p.node)?(team==='me'?-10:10)+(i%2?4:-4):0;
      const dy=['S','H'].includes(p.node)?Math.floor(i/2)*13-6:0;
      if(ids.length>1){c.fillStyle='#674a34';c.beginPath();c.arc(x+dx,y+dy-4,8,0,Math.PI*2);c.fill();}
      c.fillStyle=color;c.beginPath();c.arc(x+dx,y+dy,8,0,Math.PI*2);c.fill();c.fillStyle='#fff9e8';c.fillText(String(i+1),x+dx-3,y+dy+4);
      if(ids.length>1){c.fillStyle='#3b3027';c.fillText('×'+ids.length,x+dx+9,y+dy+4);}
    }
  }
  c.fillStyle='#3b3027';c.fillText('콩 '+s.me.filter(p=>p.node==='H').length+'/'+s.me.length,3,17);c.fillText('돌 '+s.elders.filter(p=>p.node==='H').length+'/'+s.elders.length,3,33);
  // 바늘을 멈추기 전에도 네 윷의 앞뒤와 지금 나올 수를 볼 수 있다.
  const bits=s.phase==='aim'?Math.min(15,Math.floor(yPos*16/100)):s.roll===5?0:(1<<s.roll)-1;
  let faces=0;
  for(let i=0;i<4;i++){
    const face=(bits>>i)&1;faces+=face;c.fillStyle=face?'#c9a266':'#8a633a';c.fillRect(5+i*12,75,7,52);
    if(face){c.fillStyle='#513c27';c.fillRect(7+i*12,85,2,2);c.fillRect(7+i*12,113,2,2);}
  }
  if(s.phase==='aim'||s.roll){c.fillStyle='#3b3027';c.fillText(ylabels[faces||5],14,146);}
  if(s.phase==='aim'){
    c.fillStyle='#a98f69';c.fillRect(10,218,260,12);c.fillStyle='#fff9e8';c.fillRect(10+yPos*2.6,214,3,20);
  }
  yutP.dataset.phase=s.phase;yutP.dataset.turn=s.turn;
}
function yButton(text,go){const b=el('button','btn',text);b.type='button';b.style.margin='3px';b.onclick=go;ychoices.appendChild(b);return b;}
function yRender(){
  const s=yg();ychoices.replaceChildren();
  $('jangteoYutHint').textContent=(s.message||'콩은 내 말, 푸른 돌은 노인들 말.')+'\n'+(s.story||'Space · J로 들고, 한 번 더 눌러 던져 보자.');
  $('jangteoYutHint').style.whiteSpace='pre-line';
  $('jangteoYutPips').textContent='도 1 · 개 2 · 걸 3 · 윷 4 · 모 5 | 업기·잡기 있음';
  const main=$('jangteoYutBtn');main.hidden=!['ready','aim','elder','review'].includes(s.phase);
  main.textContent=s.phase==='ready'?'윷 들기 · Space / J':s.phase==='aim'?'지금 던지기 · Space / J':s.phase==='elder'?'노인들 차례 보기 · Space / J':'다음 차례 · Space / J';
  if(s.phase==='ready'||s.phase==='aim')yButton('손에 맡겨 던지기 (타이밍 없이)',()=>yThrow(yRandom()));
  if(s.phase==='choose')s.me.forEach((p,i)=>{if(p.node!=='H')yButton('콩 '+(i+1)+'번 옮기기',()=>yChoose(i));});
  if(s.phase==='route')routeChoices(s.me[s.selected]).forEach(route=>{
    const end=yMove(s.me[s.selected],s.roll,route);
    yButton((route==='outer'?'바깥길':route==='b'?'왼쪽 안길':'오른쪽 안길')+' → '+yNodeName(end.node),()=>yApply('me',s.selected,route));
  });
  if(s.phase==='over'){
    yButton('한 판 더 (물건 덤은 첫 판만)',()=>yNew());
    yButton('판을 마치고 일어나기',()=>{yutP.hidden=true;refreshHud();});
  }
  yleave.hidden=s.phase==='over';
  yDraw();
}
function yNodeName(node){return node==='H'?'들기':node==='S'?'출발':node==='C'?'가운데':node[0]==='A'?'바깥 '+node.slice(1)+'칸':'안길 '+node;}
function yRandom(){const up=Array.from({length:4},()=>Math.random()<.5?1:0).reduce((a,b)=>a+b,0);return up||5;}
function yThrow(roll){
  const s=yg();if(!['ready','aim'].includes(s.phase))return;
  s.roll=roll;s.throws++;s.phase='choose';s.message=ylabels[roll]+'! '+roll+'칸. 옮길 콩 말을 골라 보자.';yStory();yRender();
}
function yChoose(i){
  const s=yg();if(s.phase!=='choose'||s.me[i].node==='H')return;s.selected=i;
  if(routeChoices(s.me[i]).length>1){s.phase='route';s.message='모퉁이에 섰다. 이번에 갈 길을 골라 보자.';yRender();}
  else yApply('me',i,s.me[i].lane);
}
function yApply(team,i,route){
  const s=yg(),other=team==='me'?'elders':'me',p=s[team][i],from=p.node;
  const moving=s[team].filter((q,k)=>k===i||(from!=='S'&&from!=='H'&&q.node===from));
  const end=yMove(p,s.roll,route);moving.forEach(q=>Object.assign(q,end));
  const caught=end.node!=='H'?s[other].filter(q=>q.node===end.node):[];
  caught.forEach(q=>Object.assign(q,pawn()));
  s.message=(team==='me'?'콩':'돌')+' '+(i+1)+'번 · '+ylabels[s.roll]+'('+s.roll+'칸) → '+yNodeName(end.node)+'.'+(moving.length>1?' 업은 말도 함께!':'')+(caught.length?' 상대 말을 잡았다. 한 번 더!':s.roll>=4?' 한 번 더 던진다.':'');
  const winner=s[team].every(q=>q.node==='H');
  if(winner){yFinish(team);return;}
  s.turn=(caught.length||s.roll>=4)?team:other;s.phase='review';yRender();
}
function yElder(){
  const s=yg();s.roll=yRandom();s.throws++;yStory();
  let best=null;
  s.elders.forEach((p,i)=>{if(p.node==='H')return;for(const route of routeChoices(p)){
    const end=yMove(p,s.roll,route),capture=s.me.filter(q=>q.node===end.node&&q.node!=='S'&&q.node!=='H').length;
    const score=(end.node==='H'?100:0)+capture*30+(end.node==='C'?18:0)+(end.node[0]==='A'?+end.node.slice(1):10);
    if(!best||score>best.score)best={i,route,score};
  }});yApply('elders',best.i,best.route);
}
function yFinish(team){
  const s=yg();s.phase='over';s.turn=team;s.message=team==='me'?'콩 네 말이 다 들었다. 내가 이겼다!':'돌 네 말이 먼저 들었다. 이번 판은 노인들이 이겼다.';
  s.story='노인들: 이겨도 져도 같이 앉은 벗이지. 다음엔 밤 불빛 아래서 놀아 보게.';
  if(!G.f.jxYutReward){G.f.jxYutReward=true;addItem('ssal',1);ledger('t_jangteo_yut','윷놀이 노인들','한 판 함께 놀기','쌀 1');ledgerDone('t_jangteo_yut');s.message+=' 승패와 관계없이 쌀 한 되를 받았다.';}
  G.f.jxYutPlays=(G.f.jxYutPlays||0)+1;
  if(G.f.night)G.f.jxYutNight=true;else G.f.jxYutDay=true;
  finishWanderer('j_yut');
  if(typeof grantNickname==='function')grantNickname('jangteo_yut','한판 벗','윷놀이 노인들');
  diary('jx_yut','노인들과 콩 말과 돌 말을 직접 옮기며 윷놀이를 했다. 젊은 아빠도 이 윷판에서 북쪽 장날을 물었단다. 깃대 밑 돌에 아빠의 옛 도장이 있다.');yRender();
}
function yNew(){G.f.jxYutGame={me:[pawn(),pawn(),pawn(),pawn()],elders:[pawn(),pawn(),pawn(),pawn()],phase:'ready',turn:'me',roll:0,throws:0,heard:[],story:G.f.night?'노인들: 낮엔 바빴지? 등불 밑에선 말 그림자도 보게.':'노인들: 자네 아빠 젊을 때도 여기서 한 판 놀았지.',message:'네 말씩 쓰는 장날 윷놀이. 윷·모·잡기는 옮긴 뒤 한 번 더. 빽도는 없어.'};yRender();}
Rg.playYut=()=>{if(CLASSIC)return;yutP.hidden=false;if(!yg())yNew();else yRender();};
function yHit(){
  if(yutP.hidden)return;const s=yg();
  if(s.phase==='ready'){s.phase='aim';yPos=0;yDir=1;s.message='바늘을 보다가 Space · J. 윷은 어느 쪽이 나와도 괜찮아.';yRender();}
  else if(s.phase==='aim'){
    // 네 윷의 앞뒤 조합 16개. 금빛 타격을 놓쳐도 다른 윷 결과로 이어진다.
    const bits=Math.min(15,Math.floor(yPos*16/100));let n=0;for(let b=0;b<4;b++)n+=(bits>>b)&1;yThrow(n||5);
  }else if(s.phase==='elder')yElder();
  else if(s.phase==='review'){s.phase=s.turn==='me'?'ready':'elder';yRender();}
}
$('jangteoYutBtn').onclick=yHit;
yleave.onclick=()=>{if(yg()?.phase==='aim')yg().phase='ready';yutP.hidden=true;toast('윷판은 그대로야. 거리의 윷판에서 이어 할 수 있어.');};
yutP.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)&&e.target.matches('button')){e.preventDefault();e.stopPropagation();e.target.click();}});
addEventListener('keydown',e=>{
  if(yutP.hidden||!['1','2','3','4'].includes(e.key))return;e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)ychoices.children[+e.key-1]?.click();
},true);
defineMinigame({id:'jangteoYut',hit:yHit,step(){if(yg()?.phase==='aim'&&!Vfx.reducedMotion){yPos+=yDir*MG.gather_root_speed;if(yPos>=100){yPos=100;yDir=-1;}if(yPos<=0){yPos=0;yDir=1;}yDraw();}}});

/* 밤에만 다는 등. 불빛은 길 안내이며 본길이나 출구의 조건으로 삼지 않는다. */
Rg.lanternTalk=()=>{
  if(!night()){talk([['늙은 까치',G.f.jxLanternDone?'밤새 등 따라 길손들이 쉬고 갔단다.\n아침 떡 김이 오르니 나도 떠나야지.':'해 지면 이 꾸러미를 풀자꾸나.\n숙소와 골목의 빈 등걸이에 등을 달아 다오.']]);return;}
  if(G.f.jxLanternDone){talk([['늙은 까치','네 등이 솔숲 입구까지 이어졌구나.\n길손들도 제 잠자리를 찾았단다.']]);return;}
  talk([['늙은 까치',G.f.jxLanternStarted?'남은 등걸이도 밝혀 다오.\n숙소 둘, 거리 골목 하나, 솔숲 입구 하나란다.':'밤 길손들이 숙소를 못 찾는구나.\n등은 네가 달아 주련? 나는 높은 데서 어디가 어두운지 봐 주마.',[
    {t:'꾸러미를 풀고 등 달기',go:()=>{G.f.jxLanternStarted=true;toast('숙소 기둥·창고문 가는 길·거리 골목·솔숲 입구의 빈 등걸이. E로 등을 달자.');}},
    {t:'조금 있다 올게요',go:null}
  ]]]);
};
Rg.lanternAction=id=>{
  if(!night())return;
  if(!G.f.jxLanternStarted){if(G.zone==='inn')Rg.lanternTalk();else talk([['너구리','빈 등걸이다.\n숙소 처마 밑 까치가 등불 꾸러미를 갖고 있었지.']]);return;}
  if(G.f.jxLanterns?.[id]){talk([['너구리',id==='pine'?'등 너머로 작은 코가 보여.\n솔숲 안에 누가 있나 봐.':'등이 잘 타네. 다음 등걸이도 보여.']]);return;}
  Rg.handWork('lantern',()=>{
    const lights=G.f.jxLanterns||(G.f.jxLanterns={});lights[id]=true;
    const done=Rg.lanternPoints.every(p=>lights[p.id]);
    const lines={porch:'처마 아래 짐꾼들 발이 보인다.\n눈 묻은 신을 벗고 들어오네.',gate:'창고문 가는 길이 환해졌다.\n돌아올 땐 이 등을 보고 오면 되겠다.',alley:'접힌 좌판 뒤에도 발자국이 있었네.\n저쪽이 숙소 지름길이구나.',pine:'눈 위에 작은 코 자국!\n솔숲 안에서 킁킁 소리가 나.'};
    if(done){G.f.jxLanternDone=true;diary('jx_lanterns','까치와 숙소·골목·솔숲 입구에 등을 달았다. 불빛을 따라 길손들이 돌아왔다. 솔숲 안에서 킁킁 소리가 났다.');}
    talk([['너구리',lines[id]],...(done?[['너구리','불이 다 이어졌다.\n까치한테 알려 줘야지.']]:[])]);
  });
};

/* ---------- 모락 (반달가슴곰 떡집): 김 올리기 ---------- */
/* 김 올리기 (제안): 금빛 칸 누적 5초. 위태로워도 3초간 회복할 수 있고 쌓인 시간은 깎이지 않는다.
   후반 외풍은 한 번만. 실패는 같은 키/버튼으로 재시작하며 물건·호감·진행 보상 규칙은 그대로 둔다. */
const steamP=makePanel('steam','떡집 아궁이 · 김 올리기','부채질');
const sm={fire:0,steam:0,prog:0,band:[MG.steam_band_min,MG.steam_band_max],cool:0,t:0,danger:0,close:false,
  state:'playing',wind:0,windDone:false,voice:'',voiceCool:0,lastLine:''};
const scv=$('steamCv'),sx=scv.getContext('2d');
const steamLines={
  start:['자, 부채질은 조금씩! 김부터 보자!','허허, 바빠도 불은 살살 다뤄야지!','떡은 김이 반이지! 자, 부쳐 봐!'],
  good:['허허, 김 한번 곱게 오른다!','그래, 그래! 그 김이면 떡도 잘 익지!','좋다! 대목에 든든한 일손 생겼네!'],
  high:['어이쿠, 뚜껑 뜬다! 부채 내려놓자!','김 넘치겠다! 부채질 잠깐 쉬자!','그만 부쳐도 되겠다! 김 좀 빠지게 두자!'],
  low:['불씨 잦아든다! 한 번만 부쳐 보자!','어이쿠, 아궁이 식겠다! 조금만 부쳐 봐!','불씨부터 살리자! 조금씩 부치면 돼!'],
  wind:['외풍이다! 불씨 꺼지나 잘 보자!','찬바람 드네! 불씨 살리게 조금만 부쳐 봐!'],
  fail:['괜찮아! 불이야 다시 지피면 되지!','허허, 다시 해 보자! 불씨는 내가 챙길게!','쌀가루는 더 안 들어! 마음 놓고 다시 해 보자!'],
  close:['허허, 꺼질 뻔한 불씨를 살렸네! 제법이야!','어이쿠, 아슬아슬했다! 그래도 김은 잘 올렸네!'],
  success:['허허, 이 김이면 떡도 속까지 잘 익지!','좋다! 이제 떡집 일손 다 됐네!']
};
function steamSay(kind){
  if(sm.voice===kind&&sm.voiceCool>0)return;
  if(sm.voiceCool>0&&kind==='good')return;
  const choices=steamLines[kind].filter(s=>s!==sm.lastLine);
  sm.lastLine=choices[Math.floor(Math.random()*choices.length)];sm.voice=kind;sm.voiceCool=MG.steam_voice_cooldown;
  $('steamHint').textContent='모락: “'+sm.lastLine+'”';
}
function openSteam(){
  Object.assign(sm,{fire:MG.steam_fire_start,steam:0,prog:0,cool:0,t:0,danger:0,close:false,state:'playing',wind:0,windDone:false,voice:'',voiceCool:0});
  $('steamBtn').innerHTML='부채질 <kbd>Space · J</kbd>';
  $('steamPips').textContent='금빛 칸에 모두 '+(MG.steam_target_frames/60)+'초 · 칸 밖에서도 쌓인 시간은 그대로';
  steamP.hidden=false;steamSay('start');drawSteam();
}
function drawSteam(){
  const c=sx,Wc=320,Hc=120;c.fillStyle='#efe3c8';c.fillRect(0,0,Wc,Hc);
  // 아궁이와 불
  c.fillStyle='#6e5b4b';c.fillRect(20,60,90,50);c.fillStyle='#2a1a10';c.fillRect(36,78,58,32);
  const fh=sm.fire*0.3;for(let i=0;i<5;i++){c.fillStyle=['#ff7b2e','#ffb347','#e8551f'][(i+Math.floor(sm.t/5))%3];c.fillRect(40+i*11,110-fh-((i*7)%5),8,fh);}
  // 시루와 김
  c.fillStyle='#9b5b3a';c.fillRect(30,40,70,22);c.fillStyle='#e6b54a';c.fillRect(28,38,74,4);
  const lift=sm.steam>80?Math.abs(Math.sin(sm.t*0.5))*((sm.steam-80)/3):0;
  c.fillStyle='#6e4630';c.fillRect(27,33-lift,76,5);c.fillRect(59,29-lift,12,4);
  const n=Math.floor(sm.steam/10);for(let i=0;i<n;i++){const k=(sm.t*(sm.steam>80?1.6:0.8)+i*14)%40;c.fillStyle='rgba(255,255,255,'+(0.8-k/60).toFixed(2)+')';c.fillRect(32+((i*13)%66)+Math.sin((sm.t+i*30)*0.05)*4+(sm.wind? k*0.5:0),30-k,sm.steam>80?12:8,5);}
  if(sm.wind){c.fillStyle='#839da2';for(let i=0;i<3;i++)c.fillRect((sm.t*3+i*38)%115,50+i*9,18,1);}
  // 김 막대
  const bx=140,bw=160,by=30;c.fillStyle='#3a2a20';c.fillRect(bx,by,bw,16);c.fillStyle='rgba(220,165,69,.7)';c.fillRect(bx+bw*sm.band[0]/100,by,bw*(sm.band[1]-sm.band[0])/100,16);
  c.fillStyle='#f4efe4';c.fillRect(bx+bw*Math.min(100,sm.steam)/100-2,by-4,4,24);
  c.fillStyle='#2a2019';c.font='12px "Gowun Dodum", sans-serif';c.fillText(sm.wind?'김 · 외풍!':'김 · 금빛 칸에 맞추기',bx,by-8);
  // 데워진 정도
  c.fillStyle='#d8c9a6';c.fillRect(bx,60,bw,10);c.fillStyle='#b7852f';c.fillRect(bx,60,bw*sm.prog/MG.steam_max,10);c.fillStyle='#2a2019';c.fillText('고른 김 '+(sm.prog/(MG.steam_max/(MG.steam_target_frames/60))).toFixed(1)+' / '+(MG.steam_target_frames/60)+'초',bx,86);
  c.fillStyle='#d8c9a6';c.fillRect(bx,94,bw,5);c.fillStyle=sm.danger>MG.steam_close_at?'#b4432a':'#71824e';c.fillRect(bx,94,bw*(1-sm.danger/MG.steam_danger_limit),5);
  c.fillStyle='#2a2019';c.fillText(sm.state==='failed'?'다시 해 보자!':sm.danger?'불·김 회복 여유':'불씨 '+Math.round(sm.fire)+' · 남은 '+Math.ceil((MG.steam_time_limit-sm.t)/60)+'초',bx,115);
}
function steamStep(){
  if(steamP.hidden||sm.state!=='playing')return;
  sm.t++;if(sm.voiceCool>0)sm.voiceCool--;
  if(!sm.windDone&&sm.prog>=MG.steam_wind_at){sm.windDone=true;sm.wind=MG.steam_wind_frames;steamSay('wind');}
  sm.fire=Math.max(0,sm.fire-MG.steam_fire_decay-(sm.wind?MG.steam_wind_decay:0));sm.steam+=(sm.fire-sm.steam)*MG.steam_steam_follow;
  if(sm.wind>0)sm.wind--;if(sm.cool>0)sm.cool--;
  const inBand=sm.steam>=sm.band[0]&&sm.steam<=sm.band[1];
  const danger=sm.steam>MG.steam_danger_steam||(sm.t>MG.steam_low_grace&&sm.fire<MG.steam_danger_fire);
  sm.danger=Math.max(0,Math.min(MG.steam_danger_limit,sm.danger+(danger?1:-MG.steam_danger_recovery)));if(sm.danger>MG.steam_close_at)sm.close=true;
  if(inBand)sm.prog=Math.min(MG.steam_max,sm.prog+MG.steam_max/MG.steam_target_frames);
  if(sm.prog>=MG.steam_max){
    sm.state='won';sm.cool=0;steamSay(sm.close?'close':'success');$('steamPips').textContent='금빛 칸 '+(MG.steam_target_frames/60)+'초 완료!';
    // 프레임으로 마무리를 기다려 재시작 뒤에 이전 판 타이머가 남지 않게 한다.
  }else if(sm.danger>=MG.steam_danger_limit||sm.t>=MG.steam_time_limit){
    sm.state='failed';steamSay('fail');$('steamPips').textContent='물건·호감은 그대로 · 부채질 버튼으로 바로 다시 하기';
    $('steamBtn').innerHTML='다시 불 지피기 <kbd>Space · J</kbd>';
  }else if(!sm.wind){
    if(sm.steam>MG.steam_high_steam||sm.fire>MG.steam_high_fire)steamSay('high');
    else if(sm.t>MG.steam_low_hint_after&&sm.fire<MG.steam_low_fire)steamSay('low');
    else if(inBand)steamSay('good');
  }
  if(sm.t%36===0&&sm.steam>40)Sound.steam(sm.steam>MG.steam_high_steam?'lid':'bubble');
  drawSteam();
}
function steamHit(){
  if(steamP.hidden)return;
  if(sm.state==='failed'){openSteam();Sound.steam('fan');return;}
  if(sm.state!=='playing'||sm.cool>0)return;
  sm.cool=MG.steam_fan_cooldown;sm.fire=Math.min(MG.steam_max,sm.fire+MG.steam_fan_power);Sound.steam('fan');
}
$('steamBtn').addEventListener('pointerdown',e=>{e.preventDefault();steamHit();});scv.addEventListener('pointerdown',e=>{e.preventDefault();steamHit();});
defineMinigame({id:'steam',step:()=>{
  if(sm.state==='won'){sm.cool++;if(sm.cool>=MG.steam_finish_wait)finishSteam();return;}steamStep();
},hit:steamHit});
function finishSteam(){
  if(steamP.hidden)return;steamP.hidden=true;const F=G.f;
  F.steamDone=true;awaken('siru');ledgerDone('morak');rel('morak',MG.steam_relation);learn('morak:steam');
  diary('j_siru','모락에게 김 올리는 법을 배웠다. 보따리 속 시루에 처음으로 김이 서렸다. 잔칫날의 시루가 깨어났다.');
  toast('잔칫날의 시루가 깨어났다! 쌀가루 2 + 팥 1 → 팥시루떡');refreshHud();
  const lines=[['모락','허허, 바로 그거야! 떡은 김이 반이지!'],['너구리','시루가 따뜻해졌어. 이제 떡을 찔 수 있겠다!']];
  if(G.rel.morak.v>=2&&!F.morakTaught){F.morakTaught=true;learn('morak:memiltteok');addItem('memil_powder',1);
    lines.push(['모락',Rg.arcs()?'메밀가루 둘로 메밀떡을 쪄! 하나는 내가 줄게.':'시루에 메밀가루 두 됫박이면 메밀떡이지! 한 됫박은 내가 얹어 줄게.'],
      ['모락',Rg.arcs()?'도깨비는 메밀을 좋아한대. 메밀떡도 챙겨 둬!':'할머니들 말로는 도깨비가 메밀을 좋아한대. 밤마다 장터 물건이 사라지니, 메밀떡 좀 챙겨 둬 봐!']);}
  if(Rg.arcs()&&!F.jangteoArcsMorak1){
    F.jangteoArcsMorak1=true;diary('jangteoArcsMorak1','모락과 김을 올렸다. 지난가을 아빠도 여기서 떡을 먹고, 아이를 두고 왔다고 했단다.');
    lines.push(['모락','지난가을 아빠도 떡 먹었지. 아이를 두고 왔다더라.'],['모락','이번엔 그 아이한테 김을 가르쳤네. 먹고 해, 먹고!']);
  }
  talk(lines);
}
function talkMorak(){
  const F=G.f;
  if(!F.morakMet){F.morakMet=true;ledger('morak','모락','쌀가루 3','시루를 깨움');
    talk([['모락',Rg.arcs()?'어서 와, 꼬마야! 설 대목에 맷돌이 쩍 갈라졌지 뭐야!':'어서 와, 꼬마야! 아이고, 설 대목에 우리 맷돌이 쩍 갈라져서 정신이 없네.'],
      ['모락',Rg.arcs()?'쌀가루 세 됫박이면 김 다루는 법을 알려 줄게!':'쌀가루가 모자라 떡을 못 찌네. 세 됫박만 갈아다 주면 김 올리는 법을 가르쳐 줄게!'],
      ['모락',Rg.arcs()?'쌀은 엿방울한테! 받아서 맷돌에 갈면 돼.':'쌀은 엿방울한테 가 봐! 엿 고고 남은 게 있을 거야. 그걸 맷돌에 갈면 되지!']],()=>{if(has('ssal_powder',3))morakGive();});
    return;
  }
  if(!F.morakPowder){if(has('ssal_powder',3))morakGive();else talk([['모락','쌀가루 세 됫박만 부탁해, 꼬마야! 엿방울한테 쌀을 구해서 맷돌에 갈아 오면 돼!']]);return;}
  if(!F.steamDone){talk([['모락','자, 다시 해 보자! 부채질은 조금씩, 김은 고르게!',[{t:'다시 아궁이 앞에 앉는다',go:openSteam},{t:'조금 이따가요',go:null}]]]);return;}
  if(Rg.arcs()&&night()&&!F.jangteoArcsMorak2){
    talk([['모락','먹고 해, 먹고! 가게 닫기 전에 한 입 먹을래?',[{t:'따로 싼 떡을 본다',go:morakNight},{t:'다음에 올게요',go:null}]]]);return;
  }
  talk([['모락','허허, 꼬마야! 시루로 떡 좀 쪄 봤어? 떡은 김이 반인 거 알지?']]);
}
function morakGive(){
  talk([['모락','오, 쌀가루! 세 됫박만 나눠 줄래, 꼬마야?',[{t:'쌀가루 3을 건넨다',go:()=>{
    const F=G.f;takeItem('ssal_powder',3);F.morakPowder=true;rel('morak',1);
    clue('j1','모락','모락: "네 엄마 떡 솜씨야 이 장터에서도 알아줬지! 그런데 네 아빠는 엄마 얘기만 나오면 딴소리를 하더라."');
    diary('j_morak','떡집 모락은 엄마를 알았다. 엄마는 이 장터에서도 떡 잘하기로 유명했단다. 아빠는 왜 엄마 얘기만 나오면 말을 돌렸을까.');
    talk([['모락','고맙다, 꼬마야! 보따리 속 맷돌로 갈아 왔구나?'],['모락','어이쿠, 그 시루! 금빛 테 두른 거 말이야. 어디서 났어?'],
      ['너구리','엄마 시루예요.'],['모락',Rg.arcs()?'네 엄마 떡 솜씨는 장터에서도 유명하지!':'아하, 너희 엄마 거였구나! 네 엄마 떡 솜씨야 이 장터에서도 알아줬지!'],
      ['모락',Rg.arcs()?'네 아빠는 엄마 얘기만 나오면 말을 돌리더라.':'그런데 네 아빠는 엄마 얘기만 나오면 딴소리를 하더라. 이상하지?'],
      ['모락',Rg.arcs()?'아궁이로 와! 김을 고르게 올려 시루를 깨워 보자!':'시루를 깨우려면 김부터 다룰 줄 알아야지! 아궁이 앞으로 와. 내가 가르쳐 줄게.']],openSteam);
  }},{t:'아직은 안 줄래',go:null}]]]);
}

/* ---------- 엿방울 (여우 엿장수): 엿가위 장단 ---------- */
/* 엿가위 장단 (제안): 세 박 묶음 반주와 노트가 같은 초 단위 시계를 쓴다.
   8개 중 5개면 엿 덤. 쌀 8개와 재도전에는 판정에 따른 불이익이 없다. */
const rhP=makePanel('rhythm','엿가위 장단','쩔꺽');
const rh={notes:[],hits:0,combo:0,done:true,reward:false,timer:null,bus:null};
const rcv=$('rhythmCv'),rx=rcv.getContext('2d');
const HIT_X=64,NOTES=MG.rhythm_notes,RH_GOOD=MG.rhythm_good,RH_PERFECT=MG.rhythm_perfect,RH_SPEED=MG.rhythm_scroll_speed;
const rhTalk={
  start:['엿 사려, 엿! 꼬마 보부상, 가위 소리부터 들어 봐.','쌀은 네 몫으로 떼 놨지. 어디, 흥 좀 내 볼까?','내 가위에 장단 맞춰 봐. 덤이 나갈지도 모르잖아?'],
  good:['얼쑤! 엿보다 네 장단이 더 찰진데?','어라, 이러다 엿은 안 팔고 춤만 추겠네!','얼쑤, 내 흥 돋우는 솜씨 좀 봐!'],
  danger:['어허, 엿 늘이듯 느긋하게! 내 가위 소릴 들어 봐.','덤이 나갈까, 말까? 다음 장단 잘 들어 봐.','가위 좀 놓친다고 쌀까지 안 줄까 봐? 쌀은 네 몫이지.'],
  late:['자, 끝 두 박은 살짝 당겨 볼까?','끝 두 박은 좀 빨라! 내 가위 따라와 봐.'],
  fail:['가위도 숨 좀 돌려야지. 쉬었다 다시 맞춰 볼까?','쌀은 네 몫이고! 덤은 다음 장단에 노려 볼까?','내 가위가 좀 빨랐나? 한 번 더 맞춰 봐.'],
  close:['어라, 아슬아슬하게 맞췄네! 흥이 안 날 수 없지.','딱 다섯! 내 흥 돋우는 법을 알았구나?','얼쑤, 턱걸이라도 다섯은 다섯이지!']
};
function rhSay(kind){const a=rhTalk[kind];return a[Math.floor(Math.random()*a.length)];}
// WebAudio가 없는 환경에서도 판정/보상은 유지한다. 오디오가 있으면 반드시 그 시계만 쓴다.
function rhNow(){return rh.audio?rh.audio.currentTime:performance.now()/1000;}
function rhStop(){clearInterval(rh.timer);rh.timer=null;if(rh.bus)rh.bus.stop();rh.bus=null;}
function openRhythm(reward){
  rhStop();Object.assign(rh,{hits:0,combo:0,done:false,reward,ready:false,audio:null,
    notes:[],beats:[],cursor:0,cool:-1,flashUntil:0,label:'준비',paused:null,late:false});
  $('rhythmHint').textContent='엿방울: '+rhSay('start');
  rhP.hidden=false;drawRhythm();
  // 대화 완료 콜백이 입력 밖에서 실행돼도 오디오 컨텍스트를 여기서 만들지 않는다.
  if(Sound.context&&Sound.context.state==='running')rhStart();
}
function rhStart(){
  rh.audio=Sound.context;
  if(rh.audio&&rh.audio.state!=='running')return;
  rh.ready=true;rh.origin=rhNow()+MG.rhythm_start_delay;rh.bus=Sound.group();
  // 0.22초 소박 세 개씩. 끝 두 박만 0.66초에서 0.55초로 당긴다.
  const offsets=[MG.rhythm_note_one,MG.rhythm_note_two,MG.rhythm_note_three,MG.rhythm_note_four,MG.rhythm_note_five,MG.rhythm_note_six,MG.rhythm_note_seven,MG.rhythm_note_eight];
  rh.notes=offsets.slice(0,NOTES).map(t=>({time:rh.origin+t,st:0}));
  const beats=[];
  for(let i=0;i<MG.rhythm_intro_beats;i++)beats.push({time:rh.origin+i*MG.rhythm_subbeat,part:i%MG.rhythm_parts,cue:false});
  offsets.forEach((t,i)=>{const gap=i<MG.rhythm_normal_last?MG.rhythm_normal_gap:MG.rhythm_late_gap;
    for(let p=0;p<MG.rhythm_parts;p++)beats.push({time:rh.origin+t+p*gap/MG.rhythm_parts,part:p,cue:p===0});});
  rh.beats=beats;rh.cursor=0;rh.timer=setInterval(rhSchedule,25);rhSchedule();
}
function rhSchedule(){
  if(rh.done||rhP.hidden){rhStop();return;}
  if(rh.paused!==null||!rh.ready)return;
  if(rh.audio&&rh.audio.state!=='running')return;
  const now=rhNow();
  while(rh.cursor<rh.beats.length&&rh.beats[rh.cursor].time<now+0.12){
    const b=rh.beats[rh.cursor++];if(b.time<now)continue; // 밀린 반주를 한꺼번에 재생하지 않는다.
    Sound.drum(b.time,b.part===0?0.24:0.09,rh.bus,b.part===1);
    if(b.cue)Sound.metal(b.time,0.12,rh.bus);
    else Sound.click(b.time,0.045,rh.bus);
    if(rh.combo>=MG.rhythm_combo){Sound.noise(b.time,0.045,rh.bus);
      if(b.part===0)Sound.metal(b.time,0.07,rh.bus,true);}
  }
}
function drawRhythm(){
  const c=rx,now=rh.paused===null?rhNow():rh.paused;
  c.fillStyle='#efe3c8';c.fillRect(0,0,320,120);c.save();
  if(now<rh.flashUntil&&rh.label==='잘 맞음')c.translate(0,-Math.sin((rh.flashUntil-now)*45)*2);
  c.fillStyle='#e3d1ab';c.fillRect(0,46,320,30);
  c.fillStyle='rgba(180,67,42,.15)';c.fillRect(HIT_X-RH_GOOD*RH_SPEED,40,RH_GOOD*RH_SPEED*2,42);
  c.fillStyle='#b4432a';c.fillRect(HIT_X-1,38,3,46);c.strokeStyle='#b4432a';c.lineWidth=2;c.beginPath();c.arc(HIT_X,61,12,0,Math.PI*2);c.stroke();
  rh.notes.forEach(n=>{const x=HIT_X+(n.time-now)*RH_SPEED;
    if(n.st===1||x<-20||x>340)return;
    c.fillStyle=n.st===2?'rgba(42,32,25,.3)':'#2a2019';
    c.fillRect(x-7,54,5,14);c.fillRect(x+2,54,5,14);c.fillRect(x-3,50,6,4);
    c.fillStyle=n.st===2?'rgba(42,32,25,.2)':'#7a7e84';c.fillRect(x-6,52,12,2);});
  c.restore();c.font='12px "Gowun Dodum", sans-serif';c.fillStyle='#2a2019';
  const left=rh.notes.filter(n=>n.st===0).length,need=Math.max(0,MG.rhythm_bonus_hits-rh.hits);
  c.fillText('흥 '+rh.hits+'/'+NOTES+' · '+(need?'덤까지 '+need+'개':'덤 나간다!'),10,17);
  c.fillText(rh.ready?'남은 가위 '+left+' · 연속 '+rh.combo:'버튼을 누르면 준비 장단!',10,34);
  // 5/8의 실제 덤 선. 실패해도 게이지와 보상을 깎지 않는다.
  c.fillStyle='#d2bb8b';c.fillRect(12,92,208,10);
  c.fillStyle=need===1&&left>0?(Math.sin(now*15)>0?'#c36a2c':'#e6b54a'):'#c36a2c';
  c.fillRect(12,92,208*rh.hits/NOTES,10);c.fillStyle='#713b28';c.fillRect(141,88,2,18);
  c.fillText('덤 선',129,118);
  c.fillStyle=rh.label==='빗나감'?'#7a6655':'#b4432a';
  c.fillText(now<rh.flashUntil?rh.label+(rh.combo>=MG.rhythm_combo?' · 얼쑤!':''):'찰칵에 맞춰!',228,99);
  $('rhythmPips').innerHTML=rh.notes.map(n=>'<span class="pip'+(n.st===1?' on':'')+'"'+(n.st===2?' style="opacity:.3"':'')+'></span>').join('');
}
function rhMiss(n,now){if(n)n.st=2;rh.combo=0;rh.label='빗나감';rh.flashUntil=now+0.45;
  $('rhythmHint').textContent='엿방울: '+rhSay('danger');}
function rhythmStep(){
  if(rh.done||rh.paused!==null)return;
  if(!rh.ready){
    if(!Sound.initialized)return;
    if(!Sound.context||Sound.context.state==='running')rhStart();else return;
  }
  const now=rhNow();rhSchedule();
  rh.notes.forEach(n=>{if(n.st===0&&now-n.time>RH_GOOD)rhMiss(n,now);});
  if(!rh.late&&now>=rh.notes[MG.rhythm_normal_last].time+MG.rhythm_late_hint_delay){rh.late=true;$('rhythmHint').textContent='엿방울: '+rhSay('late');}
  if(rh.notes.every(n=>n.st!==0)&&now>=rh.notes[NOTES-1].time+MG.rhythm_finish_delay){rh.done=true;rhStop();finishRhythm();}
  drawRhythm();
}
function rhythmHit(){
  if(rh.done||rhP.hidden||rh.paused!==null)return;
  if(!rh.ready){rhStart();return;}
  if(rh.audio&&rh.audio.state!=='running')return;
  const now=rhNow();if(now-rh.cool<MG.rhythm_cooldown)return;rh.cool=now;
  // 입력 직전에도 지난 노트를 처리해 프레임이 느려도 판정이 같도록 한다.
  rh.notes.forEach(n=>{if(n.st===0&&now-n.time>RH_GOOD)rhMiss(n,now);});
  const n=rh.notes.filter(n=>n.st===0).sort((a,b)=>Math.abs(a.time-now)-Math.abs(b.time-now))[0];
  if(n&&Math.abs(n.time-now)<=RH_GOOD){
    const perfect=Math.abs(n.time-now)<=RH_PERFECT;n.st=1;rh.hits++;rh.combo++;
    rh.label=perfect?'잘 맞음':'맞음';rh.flashUntil=now+0.45;
    Sound.metal(now,perfect?0.25:0.14,rh.bus,perfect);
    $('rhythmHint').textContent='엿방울: '+rhSay(rh.hits===MG.rhythm_bonus_hits-1?'danger':'good');
  }else{rhMiss(null,now);Sound.click(now,0.035,rh.bus);}
  drawRhythm();
}
// 다른 탭을 보는 동안 기회가 사라지지 않게 반주와 노트를 함께 멈춘다.
document.addEventListener('visibilitychange',()=>{
  if(rhP.hidden||rh.done||!rh.ready)return;
  if(document.hidden){rh.paused=rhNow();rhStop();}
  else if(rh.paused!==null){
    const gap=rhNow()-rh.paused+MG.rhythm_resume_delay;rh.origin+=gap;
    rh.notes.forEach(n=>n.time+=gap);rh.beats.forEach(b=>b.time+=gap);
    rh.cool+=gap;rh.flashUntil+=gap;rh.paused=null;rh.bus=Sound.group();
    rh.cursor=rh.beats.findIndex(b=>b.time>=rhNow());if(rh.cursor<0)rh.cursor=rh.beats.length;
    rh.timer=setInterval(rhSchedule,25);rhSchedule();
  }
});
$('rhythmBtn').addEventListener('pointerdown',e=>{e.preventDefault();rhythmHit();});rcv.addEventListener('pointerdown',e=>{e.preventDefault();rhythmHit();});
defineMinigame({id:'rhythm',step:rhythmStep,hit:rhythmHit});
function finishRhythm(){
  if(rhP.hidden)return;rhStop();rhP.hidden=true;const F=G.f;const high=rh.hits>=MG.rhythm_bonus_hits;learn('yeotbang:rhythm');
  const lines=[['엿방울',rhSay(high?(rh.hits===MG.rhythm_bonus_hits?'close':'good'):'fail')]];
  if(rh.reward){F.yeotDone=true;ledgerDone('yeotbang');addItem('ssal',8);
    lines.push(['엿방울',high?'얼쑤, 장단 좀 아는걸? 내 흥을 다 돋우네!':'흥은 좀 덜 났지만, 쌀 준다는 말은 안 바꾸지!'],['엿방울','자, 엿 고고 남은 쌀 여덟 되! 이건 약속한 네 몫이야.']);}
  rel('yeotbang',high?MG.rhythm_high_relation:MG.rhythm_relation);
  if(high){F.jxChoraengiEarned=true;if(typeof grantMask==='function')grantMask('choraengi');}
  if(Rg.arcs()){
    if(!F.jangteoArcsYeot1){
      F.jangteoArcsYeot1=true;diary('jangteoArcsYeot1','엿방울의 장단에 맞췄다. 빌린 가위라 손에 덜 익는다고 했다. 쌀 여덟 되는 그대로 받았다.');
      lines.push(['엿방울','빌린 가위도 엿장수 마음대로지~']);
    }
    if(F.jangteoArcsYeotReturned&&!F.jangteoArcsYeot3&&high){
      const paid=F.yeotHigh||knows('yeotbang:high');
      F.jangteoArcsYeot3=true;F.yeotHigh=true;
      // 옛 저장에서 이미 받은 엿(먹거나 선물한 경우도 포함)은 다시 주지 않는다.
      if(!paid){
        addItem('dad_yeot',1);learn('yeotbang:high');
        clue('j2','엿방울','아빠는 아들 주려고 엿을 샀다가, 끝내 못 가져가고 엿방울에게 맡겨 두었다.');
      }
      diary('jangteoArcsYeot3',paid?'제 엿가위로 치니 엿방울의 흥이 올랐다. 전에 받은 엿이 아빠가 맡긴 내 몫이었다고 다시 말해 주었다.':'제 엿가위로 치니 엿방울의 흥이 올랐다. 아빠가 나 주려고 사서 맡겨 둔 엿을 꺼냈다.');
      lines.push(['엿방울',paid?'얼쑤, 제 가위 소리가 돌아왔네~':'얼쑤, 이 소리지! 흥 난 김에 맡아 둔 엿도 꺼내야겠네~'],
        ['엿방울',paid?'네 아빠가 맡긴 엿은 전에 줬지? 그건 네 몫이었어.':'네 아빠가 아들 주려고 맡긴 엿이야.']);
    }else if(!F.jangteoArcsYeot3){
      lines.push(['엿방울',F.jangteoArcsYeotReturned?'제 가위 소리에 맞춰 보자~ 다섯 번 맞추면 나도 흥이 나겠지!':'내 엿가위는 따로 있지~ 밤에 오면 얘기해 줄게.']);
    }
    talk(lines);return;
  }
  if(high&&!F.yeotHigh){F.yeotHigh=true;addItem('dad_yeot',1);learn('yeotbang:high');
    clue('j2','엿방울','아빠는 아들 주려고 엿을 샀다가, 끝내 못 가져가고 엿방울에게 맡겨 두었다.');
    diary('j_yeot','장단을 맞췄더니 엿방울이 숨겨 둔 가락엿을 꺼냈다. 아빠가 나 주려고 샀다가 끝내 못 가져가고 맡긴 엿이다.');
    lines.push(['엿방울','흥 난 김에 이 엿도 꺼내 볼까? 팔 건 아니고, 맡아 둔 거야.'],['엿방울','너구리 아저씨가 아들 준다고 샀다가 끝내 못 가져가고 내게 맡겼지. 그 아들이 너구나, 꼬마 보부상.']);}
  else if(!high&&!F.yeotHigh)lines.push(['엿방울','내 흥만 좀 더 나면 꺼낼 게 있는데 말이야. 다음에 가위 여덟 번 중 다섯 번만 맞춰 봐.']);
  talk(lines);
}
function talkYeot(){
  const F=G.f;
  if(!F.yeotMet){F.yeotMet=true;ledger('yeotbang','엿방울','솔방울 5','쌀');
    talk([['엿방울','엿 사려, 엿! 어라, 불부터 살려야겠네.'],
      ['엿방울',Rg.arcs()?'뒷산 솔방울 다섯 개면 불을 살리지~':'엿 고느라 불을 오래 땠더니 솔방울이 동났네. 뒷산 소나무 숲에서 다섯 개만 주워 올래?'],
      ['엿방울',Rg.arcs()?'쌀 여덟 되랑 바꾸자~ 덤은 엿장수 마음이지!':'대신 남은 쌀 여덟 되를 줄게. 덤? 그야 엿장수 마음이지. 흥만 나면 또 모르고!']],()=>{if(has('solbang',5))yeotTrade();});
    return;
  }
  if(!F.yeotDone){if(has('solbang',5))yeotTrade();else talk([['엿방울','꼬마 보부상, 솔방울 다섯 개면 돼. 뒷산 소나무 숲에 가 봐.']]);return;}
  if(Rg.arcs()){
    const c=[];
    if(night()&&!F.jangteoArcsYeot2)c.push({t:'밤의 엿수레를 살핀다',go:yeotNight});
    if(F.jangteoArcsYeot2&&(F.jangteoArcsScissorsFound||G.boss.dead)&&!F.jangteoArcsYeotReturned)c.push({t:'돌려받은 헌물에서 엿가위를 꺼낸다',go:yeotReturn});
    c.push({t:'엿가위 장단을 맞춘다',go:()=>openRhythm(false)},{t:'그만두기',go:null});
    talk([['엿방울',F.jangteoArcsYeotReturned?'내 가위 소리 들으러 왔어? 엿장수 마음대로 쳐 볼까~':'엿 사려, 엿! 꼬마 보부상, 무슨 일이야?',c]]);return;
  }
  if(!F.yeotHigh){talk([['엿방울','장단 한 번 더? 여덟 번 중 다섯 번만 맞춰 봐. 흥이 나면 꺼낼 게 있다니까.',[{t:'엿가위 장단을 맞춘다',go:()=>openRhythm(false)},{t:'그만두기',go:null}]]]);return;}
  talk([['엿방울','엿 사려, 엿! 어라, 내 흥 돋우던 꼬마 보부상이네?']]);
}
function yeotTrade(){
  talk([['엿방울',Rg.arcs()?'솔방울 다섯 개랑 쌀 여덟 되, 바꿀래?':'어라, 솔방울 챙겨 왔네? 다섯 개 주면 쌀 여덟 되, 어때?',[{t:'솔방울 5개를 건넨다',go:()=>{
    takeItem('solbang',5);
    talk([['엿방울',Rg.arcs()?'불부터 올리고! 가위 장단도 맞춰 볼래?':'좋아, 불부터 올리고! 엿 고는 동안 내 가위 소리에 장단 맞춰 볼래?']],()=>openRhythm(true));
  }},{t:'아직은 안 줄래',go:null}]]]);
}

/* ---------- 날쌘 (다시 만남): 설 대목 팥 ---------- */
function talkNal(){
  if(!G.f.nalJTalk){G.f.nalJTalk=true;ledger('nal_jangteo','날쌘','쌀가루 1 (또는 메밀가루 1)','팥');
    talk([['날쌘',Rg.arcs()?'또 왔냐. 설 고사떡엔 팥이지. 이 대목엔 귀하거든?':'또 왔냐, 꼬마 보부상. 설 고사떡엔 팥이 꼭 들어가니, 이 대목엔 귀한 몸이지.']],nalMenu);}
  else nalMenu();
}
function nalMenu(){
  const F=G.f,c=[];
  if(!F.nalJDone){
    if(has('ssal_powder'))c.push({t:'쌀가루를 내민다 (팥 1)',go:()=>nalTrade('ssal_powder')});
    if(has('memil_powder'))c.push({t:'메밀가루를 내민다 (팥 2)',go:()=>nalTrade('memil_powder')});
    if(!F.nalJBluff)c.push({t:'허세 부리기: "흥, 팥 한 되가 뭐 그리 귀해!"',go:nalBluff});
  }
  if(!CLASSIC){
    if(!F.jxCraftMarket)c.push({t:'솔방울로 떡 재료 바꾸기',go:marketCraftTrade});
    if(F.nalJDone)c.push({t:'고사떡에 쓸 팥 다시 구하기',go:()=>{
      const id=has('memil_powder')?'memil_powder':'ssal_powder';
      if(!has(id)){talk([['날쌘','쌀가루 하나, 아니면 메밀가루 하나.\n엿방울한테 쌀을 받아 맷돌에 갈아 와.']]);return;}
      talk([['날쌘','떡을 다른 데 썼냐? 다시 바꾸면 되지.\n지난번이랑 같은 셈이다.',[
        {t:ITEMS[id].n+' 1로 팥 바꾸기',go:()=>nalTrade(id)},{t:'다음에',go:null}]]]);
    }});
  }
  if(Rg.arcs()&&night()&&F.jangteoArcsBueong2&&!F.jangteoArcsNal3)c.push({t:'숙소를 피하는 까닭을 묻는다',go:nalLedger});
  c.push({t:'그만두기',go:null});
  const line=Rg.arcs()?(F.nalJDone?'팥 아껴 써. 부엉 영감은 빛깔까지 따지거든.':(has('ssal_powder')||has('memil_powder'))?'빈손은 아니네? 뭘 바꿀 건데?':'쌀가루 하나면 팥 하나. 메밀가루면 둘. 뭘 낼 건데?'):
    F.nalJDone?'팥 아껴 쓰고 고사떡 잘 쪄라. 부엉 영감은 팥 빛깔까지 따지니까.':(has('ssal_powder')||has('memil_powder'))?'빈손은 아니겠지? 뭘 내놓을 테냐?':'쌀가루 한 됫박엔 팥 한 되. 메밀가루면 두 되 쳐주지. 뭘 낼 테냐?';
  talk([['날쌘',line,c]]);
}
/* 수량은 trades.csv t_craft_market 그대로. 엿방울의 필수 몫을 먼저 남긴다. */
function marketCraftTrade(){
  const enough=has('solbang',G.f.yeotDone?3:8);
  talk([['날쌘',enough?'솔방울 셋이면 꿀, 참기름, 녹두, 팥.\n하나씩 묶어 주지. 한 번만이다.':'엿방울한테 줄 다섯은 남겨 둬.\n솔숲에서 셋을 더 주워 오면 떡 재료랑 바꾸자.',
    enough?[{t:'솔방울 3개와 바꾼다',go:()=>{
      if(G.f.jxCraftMarket||!has('solbang',G.f.yeotDone?3:8))return;
      takeItem('solbang',3);for(const id of ['honey','sesame_oil','mung','pat'])addItem(id,1);
      G.f.jxCraftMarket=true;ledger('t_craft_market','날쌘','솔방울 3','떡 재료 묶음');ledgerDone('t_craft_market');
      talk([['날쌘','쌀가루에 꿀을 섞어 시루에 쪄 봐.\n엄마한테 보낼 건 네가 골라.']]);
    }},{t:'다음에',go:null}]:[{t:'알겠어',go:null}]]]);
}
function nalTrade(id){
  const F=G.f;takeItem(id,1);F.nalJDone=true;ledgerDone('nal_jangteo');
  const n=(id==='memil_powder'?2:1)+(F.nalJBluff?1:0);addItem('pat',n);
  if(id==='memil_powder')learn('nal:jangteo-memil');
  talk(id==='memil_powder'?[['날쌘','돌너머 메밀가루로군. 장터에선 귀하니 팥 '+n+'되 쳐주지. 잘 받은 줄 알아라.']]:[['날쌘','자, 팥 '+n+'되. 거래 끝이다.']]);
}
function nalBluff(){G.f.nalJBluff=true;rel('nal',1);
  talk([['너구리','흥, 팥 한 되가 뭐 그리 귀해!'],['날쌘','하! 대목 장사를 모르는 꼬마가 큰소리는.'],['날쌘','내 팥이 시시하단 말이냐? 좋아, 거래하면 한 되 더 얹어 주지.']],nalMenu);}

/* ---------- 숙소 마루: 쉬면 낮과 밤이 바뀐다 ---------- */
function restMaru(){
  const toNight=!night();
  talk([['너구리',toNight?(Rg.arcs()?'(마루에서 기다리니 해가 졌다. 등불이 켜진다.)':'(숙소 마루에서 해가 지기를 기다렸다. 장터에 하나둘 등불이 켜진다.)'):'(마루에서 한숨 자고 나니 날이 밝았다.)']],()=>{
    G.f.night=toNight;learn('maru:rest');
    if(!CLASSIC){
      // 잠든 사이 바람이 새 솔방울을 떨어뜨린다. 고정 id를 되살려 저장 중복을 만들지 않는다.
      for(const a of G.pickups)if(a.zone==='pine'&&a.item==='solbang')a.got=false;
      toast(toNight?'밤이 되었다. 좌판이 접히고 골목이 열렸다.':'아침이 되었다. 솔숲에 새 솔방울이 떨어졌다.');
    }else toast(toNight?'밤이 되었다':'아침이 되었다');refreshGoal();});
}

/* ---------- 부엉 영감 (보부상단 접장): 밤에만 깨어 있다 ---------- */
function talkBueong(){
  const F=G.f;
  if(!night()){learn('bueong:night');
    talk([['부엉 영감','(처마 밑에서 꾸벅꾸벅 졸고 있다.)'],['너구리','(낮엔 주무시네. 숙소 마루에서 해 질 때까지 쉬자.)']]);return;}
  if(!F.bueongNight){F.bueongNight=true;F.bueongMet=true;learn('bueong:rule');ledger('bueong','부엉 영감','팥시루떡 1','아빠가 맡긴 짐');
    talk([['부엉 영감',Rg.arcs()?'부엉. 그 모자 주인의 아들이냐.':'부엉. 그 모자, 장부에 오른 너구리의 것이로구나. 네가 그 녀석 아들이냐.'],
      ['부엉 영감',Rg.arcs()?'아빠 짐은 보부상에게만 내준다. 상단 규칙이다.':'녀석이 짐을 맡겼다. 보부상단에 맡긴 물건은 보부상에게만 내준다. 규칙이다.'],
      ['부엉 영감',Rg.arcs()?'설 고사에 팥시루떡을 올려라. 보부상 신표를 내주마.':'보부상단 설 고사에 팥시루떡을 올려라. 정식 보부상으로 인정하고 신표를 내주마.']],()=>{if(has('patsirutteok'))bueongGive();});
    return;
  }
  if(!F.bueongDone){if(has('patsirutteok'))bueongGive();else talk([['부엉 영감','쌀가루 두 됫박에 팥 한 되다. 시루에 쪄서 팥시루떡을 가져오너라.']]);return;}
  if(Rg.arcs()){
    const c=[];
    if(!F.jangteoArcsBueong2)c.push({t:'오래된 장부를 본다',go:bueongLedger});
    else if(F.jangteoArcsNal3&&!F.jangteoArcsBueong3)c.push({t:'날쌘의 줄을 다시 본다',go:bueongPromise});
    c.push({t:'그만두기',go:null});
    talk([['부엉 영감',G.boss.dead?'제 몫을 했구나. 장부에 적어 두마.':'밤에 숙소 창고 문 앞을 지켜라.',c]]);return;
  }
  if(!G.boss.dead){talk([['부엉 영감','그믐 밤엔 헌것들이 들썩인다. 밤에 숙소 창고 문 앞을 지켜라.']]);return;}
  talk([['부엉 영감','수고했다. 제 몫을 하는 보부상이로구나. 장부에 적어 두마.']]);
}
function bueongGive(){
  talk([['부엉 영감','고사떡을 가져왔구나.',[{t:'팥시루떡을 고사상에 올린다',go:()=>{
    const F=G.f;takeItem('patsirutteok',1);F.bueongDone=true;F.guard=true;ledgerDone('bueong');rel('bueong',1);learn('bueong:sinpyo');
    addItem('sinpyo',1);addItem('dad_memo',1);
    clue('j3','아빠의 메모','아빠가 숙소에 맡긴 짐 속 메모: "글자는 \'되돌림\'이었다. 값은 이미 치러졌다. 이번엔 내가 치른다. 북쪽 영산."');
    diary('j_memo','보부상 신표를 받았다. 아빠의 짐 속에 메모가 있었다. 아빠가 읽은 글자는 \'되돌림\'. "값은 이미 치러졌다. 이번엔 내가 치른다." 누가, 무슨 값을 치렀다는 걸까.');
    if(Rg.arcs()){
      F.jangteoArcsBueong1=true;diary('jangteoArcsBueong1','부엉 영감이 장부에 표시하고 신표를 내주었다. 아빠가 맡긴 짐도 몇 달째 보관하고 있었다.');
      talk([['부엉 영감','(고사떡을 올리고 장부를 한 장 넘긴다.)'],
        ['부엉 영감','신표와 작은 지게다. 아빠 짐도 받아라.\n보관 값은 안 받으마.'],
        ['너구리','(짐 속에 아빠 메모가 있다.)\n"글자는 \'되돌림\'이었다."'],
        ['너구리','"값은 이미 치러졌다.\n이번엔 내가 치른다. 북쪽 영산."'],
        ['부엉 영감','오늘 밤 창고를 지켜라. 물건이 자꾸 사라진다.']
      ],()=>{toast('숙소 창고를 지키자');refreshGoal();});return;
    }
    talk([['부엉 영감','붉은 팥이 제대로 들었구나. 고사상에 올릴 만하다.'],['부엉 영감','(부엉 영감이 떡을 올리고 장부에 신표 표시를 한다.)'],
      ['부엉 영감','이제 너도 보부상단 식구다.\n신표와 작은 지게를 받아라.'],['부엉 영감','이건 그 녀석이 맡긴 짐이다. 받아라.'],
      ['너구리','(짐 속에 접힌 종이가 있다. 아빠 글씨다.)'],
      ['너구리','"글자는 \'되돌림\'이었다. 값은 이미 치러졌다. 이번엔 내가 치른다. 북쪽 영산."'],
      ['부엉 영감','오늘은 섣달그믐이다. 밤마다 장터 물건이 사라진다. 보부상의 의무로 오늘 밤 숙소 창고를 지켜라.']],()=>{toast('숙소 창고를 지키자');refreshGoal();});
  }},{t:'아직은 안 올릴래',go:null}]]]);
}

/* ---------- 헌물 도깨비 전투 ---------- */
Rg.startDokkaebi=()=>{
  // 표의 부수면 칸은 id 하나만 받는다. 키의 기본 콩 1개에 지역 결정분 1개를 보탠다.
  // 전투 결과 콜백은 후퇴·패배 때도 부위 전리품 지급이 끝난 뒤 한 번 실행된다.
  let encounter=null;
  G.px=Rg.STORE_X-30;
  inkTransition('전투',(Rg.STORE_X-G.cam)/W*100,()=>{startBattle('dokkaebi',res=>{
    if(encounter?.parts.some(p=>p.id==='ki'&&p.broken))addItem('kong',1);
    if(res==='win'||res==='calm'){
      if(res==='calm'){
        G.f.dokCalm=true;
        if(!has('dokkaebibul'))addItem('dokkaebibul',1);
        diary('j_calm','헌물 도깨비를 부수지 않고 달랬다. 도깨비는 훔친 것을 돌려놓고 고맙다며 도깨비불씨를 건넨 뒤 춤추듯 사라졌다.');
      }
      Rg.bossDie(res==='calm');
    }else{
      G.px=Rg.STORE_X-70;G.f.faints+=res==='lose'?1:0;
      diary('j_hint','헌물 도깨비는 빗자루로 쓸고, 키로 콩을 뿌리고, 멍석을 말아 온다. 헌물을 하나 부수면 도깨비불이 드러난다. 도깨비는 메밀을 좋아한다는 말이 있다.');
      toast('일기에 공략을 적어 두었다. 준비되면 다시 창고 문 앞으로');
    }
  });encounter=B;});
};

/* ---------- 끝: 홍시 약떡을 까치 편에 보내기 ---------- */
Rg.homeReply='한참 뒤, 까치가 빈 떡보자기를 가져왔다. 엄마가 빨아 갠 보자기에는 말린 감 꼭지 하나가 싸여 있었다. 까치는 엄마처럼 두 손을 볼에 대고 고개를 끄덕였다.';
function handMedicineToMagpie(){
  const before=G.inv.hongsi_tteok||0;
  if(typeof sendHomeGift==='function')sendHomeGift('jangteo','hongsi_tteok');
  // 공통 연결이 없거나 선택 가공품을 먼저 보낸 경우에도 필수 약떡은 보낸다.
  if((G.inv.hongsi_tteok||0)===before)takeItem('hongsi_tteok',1);
  learn('home:jangteo',true);
  diary('jx_home_reply',Rg.homeReply);
}
Rg.sendMedicine=()=>{
  if(Rg.arcs()&&G.f.jangteoArcsMorak2&&!G.f.jangteoArcsMorak3){
    talk([['너구리','엄마 드릴 홍시 약떡, 다 됐다!',[{t:'모락 아주머니의 설 떡도 함께 보낸다',go:()=>{
      // 별도 소지품·추가 재료 없이 모락이 자기 떡을 보탠다. 약떡은 기존처럼 하나만 소비한다.
      G.f.hongsiMade=true;G.f.jangteoArcsMorak3=true;
      diary('j_end','눈홍시와 쌀가루로 홍시 약떡을 쪘다. 엄마가 동네에 떡을 돌리던 시루로, 이번엔 엄마를 위한 떡을 쪘다.');
      talk([['너구리','(모락 아주머니가 싸 준 설 떡도 같이 얹었다.\n“네 엄마도 설 떡 드셔야지.” 하셨지.)'],
        ['너구리','(까치가 떡을 문다.)\n엄마 시루로 쪘다고 전해 줘.']
      ],()=>{
        handMedicineToMagpie();
        // 날아간 직후 답장이 오지 않도록 시간 경과를 밝힌 짧은 후일담으로 마무리한다.
        talk([['너구리','(한참 뒤, 까치가 숙소 처마로 돌아왔다.)'],
          ['너구리','(엄마처럼 날개를 볼에 대고 끄덕인다.)'],
          ['너구리','맛있게 드셨구나.\n모락 아주머니한테도 알려 드려야지.']
        ],()=>{
          diary('jangteoArcsMorak3','모락 아주머니의 설 떡도 약떡과 함께 보냈다. 돌아온 까치가 엄마의 몸짓을 흉내 냈다. 맛있게 드셨다는 뜻이다.');endGame();
        });
      });
    }},{t:'약떡만 보낸다',go:sendMedicine}]]]);return;
  }
  sendMedicine();
};
function sendMedicine(){
  G.f.hongsiMade=true;
  diary('j_end','눈홍시와 쌀가루로 홍시 약떡을 쪘다. 엄마가 동네에 떡을 돌리던 시루로, 이번엔 엄마를 위한 떡을 쪘다.');
  talk([['너구리','엄마 드릴 홍시 약떡, 다 됐다!'],['너구리','(숙소 처마의 까치가 내려와 떡 보자기를 물었다.)'],['너구리','엄마한테 전해 줘. 엄마 시루로 쪘다고.']],()=>{
    handMedicineToMagpie();
    talk([['너구리','(한참 뒤, 까치가 빈 떡보자기를 가져왔다.)'],
      ['너구리','(엄마가 빨아 갠 보자기에 말린 감 꼭지 하나가 들어 있다.)'],
      ['너구리','엄마도 감 냄새 맡았구나.']],endGame);
  });
}

/* ---------- NPC (npcs.csv 의 id). x 는 필드 위치 ---------- */
Rg.npcs=[
  {id:'morak',name:'모락',x:360,talk:talkMorak,draw:Rg.art.bear,props:Rg.props.tteokjip},
  {id:'yeotbang',name:'엿방울',x:640,talk:talkYeot,draw:Rg.art.fox,props:Rg.props.yeotcart},
  {id:'nal',name:'날쌘',get x(){return Rg.arcs()&&night()&&G.f.jangteoArcsBueong2?900:960;},talk:talkNal,draw:COMMON_ART.weasel,props:COMMON_ART.nalProps},
  {id:'maru',name:'숙소 마루',x:1070,prompt:'숙소 마루에서 쉬기',talk:restMaru,draw:()=>{},props:Rg.props.maru},
  {id:'bueong',name:'부엉 영감',x:1190,talk:talkBueong,draw:Rg.art.owl},
];

if(!CLASSIC){
  Rg.npcs=Rg.npcs.map(n=>{
    const place={morak:['street',1380,110],yeotbang:['street',720,GROUND],nal:['entrance',430,GROUND],maru:['inn',1080,GROUND],bueong:['inn',920,GROUND]}[n.id];
    const p=Object.defineProperties({},Object.getOwnPropertyDescriptors(n));
    Object.defineProperty(p,'x',{value:place[1],writable:true,enumerable:true,configurable:true});
    p.zone=place[0];p.y=place[2];
    if(n.id==='morak')p.props=null; // 떡집 실내는 확장 배경에서 발판 높이에 맞춰 그린다.
    if(n.id==='yeotbang')p.talk=()=>{
      if(!G.f.yeotDone){n.talk();return;}
      talk([['엿방울','불쏘시개는 늘 필요하지~\n솔방울을 더 주우면 쌀도 더 바꿔 줄게.',[
        {t:'가위 장단과 이야기',go:n.talk},
        {t:'솔방울 5개로 쌀 8개 더 구하기',go:()=>{
          if(!has('solbang',5)){talk([['엿방울','솔방울 다섯 개면 쌀 여덟 되야~\n솔숲이 비었으면 숙소에서 쉬었다 가.']]);return;}
          takeItem('solbang',5);addItem('ssal',8);talk([['엿방울','자, 쌀 여덟 되. 떡도 또 찌면 되지~\n솜씨가 서툴러도 굶길 순 없잖아.']]);
        }},{t:'다음에',go:null}]]]);
    };
    return p;
  });
}

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
    if(!has('pat'))return CLASSIC?'숙소 앞 날쌘에게 팥 구하기':'장터 입구 날쌘에게 팥 구하기';
    if((G.inv.ssal_powder||0)<2)return '보따리를 열고 맷돌에 쌀을 넣어 쌀가루 갈기';
    return '보따리를 열고 시루에 쌀가루 2와 팥 1 넣어 찌기';
  }
  if(!G.boss.dead)return toNight('숙소 창고 문 앞을 지키기');
  if(!CLASSIC&&has('hongsi_tteok'))return '숙소 처마의 까치에게 홍시 약떡 보내기';
  if((G.inv.ssal_powder||0)<1&&!has('hongsi_tteok'))return '보따리를 열고 맷돌에 쌀을 넣어 쌀가루 갈기';
  return '보따리를 열고 시루에 눈홍시와 쌀가루 넣어 홍시 약떡 찌기';
};
})();
