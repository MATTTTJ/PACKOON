'use strict';
/* 돌너머 진행: NPC 대화와 교환, 돌쇠 할배의 돌 쌓기, 돌 골렘 전투, 서리다래 약즙 보내기, 지금 할 일.
   흐름은 design/narrative/dolneomeo-scenario.md (제안), 교환은 design/data/trades.csv
   교환 연쇄: 칡꽃 → 결명자 → (돌 쌓기) 맷돌 깨어남 → 메밀가루 → 돌산 길 */
(()=>{
const Rg=REGIONS.dolneomeo;

const pick=lines=>lines[Math.floor(Math.random()*lines.length)];

/* ---------- 꾸벅이 (고슴도치): 고개를 들 때 맞춰 말 걸기 ---------- */
function talkKku(){
  const F=G.f;F.kkuTalk=true;
  if(!Rg.kkuAwakeNow()){
    Sound.stone('sleep');
    learn('kkubeogi:sleep');
    if(!G.clues.some(c=>c.id==='k1')){
      clue('k1','꾸벅이','꾸벅이의 잠꼬대: 보부상 아저씨가 할배네서 겨울을 날 것처럼 굴더니, 글자 하나를 읽고는 그날 밤 떠났다.');
      talk([['꾸벅이','쿨… 쿨…'],['꾸벅이','보부상 아저씨… 할배네서 겨울이라도 날 줄 알았는데…'],['꾸벅이','글자 하나 읽더니… 그날 밤 떠났어… 쿨…'],['너구리','(잠꼬대네. 고개 들 때 다시 말 걸자.)']]);
    }else talk([['꾸벅이',pick(['쿨… 둥지는… 폭신해야…','으음… 아직 꿈꾸는 중이야…','하암… 조금만 더…'])],['너구리','(코가 씰룩하네. 곧 고개 들겠다.)']]);
    return;
  }
  Sound.stone('wake');
  if(!F.kkuAwake){F.kkuAwake=true;rel('kkubeogi',1);learn('kkubeogi:awake');
    ledger('kkubeogi','꾸벅이','마른 억새 3','서리다래가 있는 곳');
    talk([['꾸벅이','어, 어…? 안 잤어… 진짜야…'],['꾸벅이','처음 보는 꼬마네… 그 모자, 어디서 봤더라… 하암…'],
      ['꾸벅이','겨울잠 둥지에 깔 억새가 모자라… 들판에서 하얗게 센 걸로 세 단만 베어다 줄래…?'],
      ['꾸벅이','그럼 내가 아는 거 다 알려 줄게… 쿨…']],()=>{if(has('eoksae',3))kkuTrade();});
    return;
  }
  if(!F.kkuDone){
    if(has('eoksae',3))kkuTrade();
    else talk([['꾸벅이','억새 세 단… 낫으로 슥슥 베면 금방이야… 하암…']]);
    return;
  }
  talk([['꾸벅이','돌쇠 할배는 눈이 침침해서 손끝으로 돌을 보셔… 결명자 차를 좋아하실 거야… 쿨…']]);
}
function kkuTrade(){
  talk([['꾸벅이','오… 억새다… 나 주는 거야…?',[{t:'마른 억새 3단을 건넨다',go:()=>{
    takeItem('eoksae',3);G.f.kkuDone=true;ledgerDone('kkubeogi');rel('kkubeogi',1);learn('kkubeogi:eoksae');
    diary('d_kku','꾸벅이에게 억새를 주고 들었다. 서리다래는 돌산 절벽 바위턱에 있다. 성황당 돌무더기가 밤마다 움직인 뒤로, 장승지기 뿔이가 돌산 길을 닫았다.');
    const lines=[['꾸벅이','와… 폭신하다… 고마워…'],['꾸벅이','서리다래는… 돌산 절벽 바위턱에 열려… 첫서리를 맞아야 달거든…'],
      ['꾸벅이','성황당 돌무더기가 밤마다 움직여서… 장승지기 뿔이가 돌산 길을 막았어…']];
    if(G.rel.kkubeogi.v>=2)lines.push(['꾸벅이','돌쇠 할배는 눈이 침침해서 손끝으로 돌을 보셔… 결명자 차를 좋아하실 거야… 날쌘 아저씨한테 결명자가 있어…']);
    talk(lines);
  }},{t:'아직은 안 줄래',go:null}]]]);
}

/* ---------- 날쌘 (다시 만남): 돌투성이 마을이라 칡꽃 향이 귀하다 ---------- */
function talkNal(){
  if(!G.f.nalDTalk){G.f.nalDTalk=true;ledger('nal_dolneomeo','날쌘','칡꽃 1 (또는 겨우살이 2)','결명자');
    talk([['날쌘','또 왔네, 꼬마 보부상. 돌만 잔뜩인 동네라 장사가 영 시원찮아.'],['날쌘','가만, 그 향은 단풍골 칡꽃이지? 여기선 그게 귀한 줄이나 알아?']],nalMenu);}
  else nalMenu();
}
function nalMenu(){
  const F=G.f,c=[];
  if(!F.nalDDone){
    if(has('kflower'))c.push({t:'칡꽃을 내민다 (결명자 2)',go:()=>nalTrade('kflower')});
    if(has('gyeousari',2))c.push({t:'겨우살이 2개를 내민다 (결명자 1)',go:()=>nalTrade('gyeousari')});
    if(!F.nalDBluff)c.push({t:'허세 부리기: "칡꽃? 단풍골엔 흔한데."',go:nalBluff});
  }
  c.push({t:'그만두기',go:null});
  const say=F.nalDDone?'결명자는 눈 밝히는 약재야. 돌쇠 할배한테 차로 달여 드려 봐. 쓸 만한 거래였지?'
    :(has('kflower')||has('gyeousari',2))?'어디, 뭘 내놓을 건데?':'빈손으로 흥정하게? 칡꽃이 없으면 높은 가지에 달린 겨우살이 두 개라도 따 와.';
  talk([['날쌘',say,c]]);
}
function nalTrade(id){
  const F=G.f;
  takeItem(id,id==='kflower'?1:2);F.nalDDone=true;ledgerDone('nal_dolneomeo');
  const n=(id==='kflower'?2:1)+(F.nalDBluff?1:0);
  addItem('gyeolmyeongja',n);learn('nal:dolneomeo');
  diary('d_nal','단풍골에서 흔하던 '+(id==='kflower'?'칡꽃을':'겨우살이를')+' 날쌘에게 주고 결명자를 받았다. 마을이 바뀌니 물건값도 달라진다.');
  talk(F.nalDBluff?[['날쌘','그 흔한 물건도 여기 오면 귀해지는 거야. 자, 결명자. 덤도 얹었어.'],['날쌘','날쌘이 짜다는 소리는 못 듣지.']]
    :[['날쌘','자, 결명자 '+n+'개. 이만하면 잘 바꿨지?'],['날쌘','눈 밝히는 약재니까 쓸 데가 있을걸.']]);
}
function nalBluff(){
  G.f.nalDBluff=true;rel('nal',1);
  talk([['너구리','칡꽃? 단풍골엔 흔한데.'],['날쌘','허, 꼬마 보부상 허세는 여전하네. 날 뭘로 보고?'],['날쌘','좋아. 바꾸면 결명자 하나 더 얹어 줄게.']],nalMenu);
}

/* ---------- 돌쇠 할배 (두더지 석수) ---------- */
function talkDolsoe(){
  const F=G.f;
  if(!F.dolsoeMet){F.dolsoeMet=true;
    talk([['돌쇠 할배','누가 왔느냐. 눈이 어두우니 이리 가까이 오거라.'],['돌쇠 할배','(돌을 쓰다듬던 할배가 얼굴을 가까이 댄다. 눈을 가늘게 뜨고 들여다보신다.)']],()=>{if(has('gyeolmyeongja'))dolsoeTea();});
    return;
  }
  if(!F.dolsoeTea){
    if(has('gyeolmyeongja'))dolsoeTea();
    else talk([['돌쇠 할배','돌은 손끝으로 보면 된단다. 내 눈은 걱정 말거라.'],['너구리','(눈에 좋은 차를 구해 드리자.)']]);
    return;
  }
  if(!F.stackDone){
    talk([['돌쇠 할배','다시 얹어 보겠느냐. 천천히 해도 된단다.',[{t:'다시 돌을 얹는다',go:openStack},{t:'조금 이따가요',go:null}]]]);
    return;
  }
  const c=[];if(has('gyeolmyeongja'))c.push({t:'결명자를 하나 더 드린다',go:()=>{takeItem('gyeolmyeongja',1);rel('dolsoe',1);talk([['돌쇠 할배','허허. 또 챙겨 왔구나. 고맙다.']]);}});
  c.push({t:'그만두기',go:null});
  talk([['돌쇠 할배','맷돌은 잘 돌더냐. 메밀 세 알을 넣고 갈아 보거라.',c]]);
}
function dolsoeTea(){
  talk([['돌쇠 할배','결명자 냄새로구나.',[{t:'결명자 차를 달여 드린다',go:()=>{
    const F=G.f;takeItem('gyeolmyeongja',1);F.dolsoeTea=true;rel('dolsoe',1);learn('dolsoe:tea');
    ledger('dolsoe','돌쇠 할배','결명자 1','맷돌을 깨움');
    diary('d_dolsoe','돌쇠 할배가 보따리 속 맷돌의 자개 발자국을 손끝으로 더듬더니, 우리 집안 맷돌이라는 걸 알아봤다.');
    talk([['돌쇠 할배','눈이 좀 밝아지는구나. 고맙다.'],['돌쇠 할배','보따리를 이리 줘 보거라.'],
      ['돌쇠 할배','(할배가 맷돌 윗돌의 자개 발자국을 손끝으로 천천히 더듬는다.)'],
      ['돌쇠 할배','이 자개 발자국… 그 녀석 집안 맷돌이구나. 4대째 내려온 게지.'],
      ['돌쇠 할배','"돌이 마음을 알아야 돈다." 네 아빠도 그 말을 하더냐. 내가 가르쳐 주었지.'],
      ['돌쇠 할배','돌 마음부터 읽어 보거라. 저 돌탑 꼭대기가 가운데 올 때, 돌을 하나씩 세 개 얹으면 된다.']],openStack);
  }},{t:'아직은 안 드릴래',go:null}]]]);
}

/* 돌 쌓기: 흔들리는 돌탑이 가운데 설 때 돌을 얹는다. 세 개면 맷돌이 깨어난다 (임시 규칙) */
const panel=el('div','forge');panel.id='stack';panel.hidden=true;
panel.innerHTML='<h2>돌 쌓기 · 돌의 마음 읽기</h2><canvas id="stackCv" width="320" height="140" style="display:block;width:min(100%,360px);height:auto;margin:0 auto;image-rendering:pixelated;background:#efe3c8;border:2px solid var(--meok);border-radius:3px;touch-action:none"></canvas><div class="pips" id="spips"></div><div class="fhint" id="shint"></div><button class="btn primary strike" id="sstrike" type="button">돌 얹기 <kbd>Space · J</kbd></button>';
$('shell').appendChild(panel);
panel.insertBefore(el('p','fhint','붉은 꼭대기가 금빛 가운데에 오면 얹자. 세 개면 된다.'),$('spips'));
$('shint').setAttribute('aria-live','polite');
const st={phase:.9,hits:0,miss:0,cool:0,zone:.2,settle:0,land:0,edge:0,fall:null,warned:false,done:false};
const scv=$('stackCv'),sx=scv.getContext('2d');
const sway=()=>Math.sin(st.phase);
const stackAmp=()=>42+st.hits*15;
const stackAdvice={
  start:['손끝에 힘 빼고 기다리거라.','돌도 숨을 고른단다. 천천히.','가운데 오면 살며시 놓거라.'],
  good:['그래. 돌이 네 손을 아는구나.','잘 놓았다. 다음 것도 천천히 하거라.','허허. 제자리를 찾았구나.'],
  danger:['기울어도 겁먹지 말거라.','가운데로 돌아올 때를 기다리거라.','손은 가만히 두거라. 돌이 온다.'],
  edge:['허허, 버텼구나. 힘 빼거라.','돌도 놀랐겠구나. 괜찮다.','아슬아슬했어도 잘 섰구나.'],
  miss:['괜찮다. 이 돌을 다시 얹어 보거라.','돌은 다치지 않았단다. 다시 놓거라.','서두를 것 없다. 다시 해 보거라.']
};
function stackSay(kind,extra=''){$('shint').textContent='돌쇠 할배: “'+pick(stackAdvice[kind])+'”'+extra;}
function openStack(){
  Object.assign(st,{phase:.9,hits:0,miss:0,cool:0,zone:.2,settle:0,land:0,edge:0,fall:null,warned:false,done:false});
  stackSay('start');panel.hidden=false;drawStack();
}
function stackStone(x,y,w,angle,color){
  const c=sx;c.save();c.translate(Math.round(x),y+10);c.rotate(angle);
  c.fillStyle=color;c.fillRect(-w/2,-10,w,12);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-w/2+2,-9,w-4,2);c.restore();
}
function drawStack(){
  const c=sx,Wc=320,Hc=140,cx=Wc/2,base=Hc-16,amp=stackAmp();
  c.fillStyle='#efe3c8';c.fillRect(0,0,Wc,Hc);
  c.fillStyle='rgba(220,165,69,.35)';c.fillRect(cx-st.zone*amp,8,st.zone*amp*2,base-8);
  c.fillStyle='#8a8680';c.fillRect(cx-46,base,92,10);c.fillStyle='#6a6660';c.fillRect(cx-46,base+8,92,2);
  const recovery=st.settle/42;
  const blend=st.settle?Math.max(0,1-st.settle/12):1;
  const lean=st.land*(1-blend)+sway()*blend+Math.sin(st.settle*.45)*recovery*.12;
  const n=st.hits+2;
  for(let i=0;i<=n;i++){
    const k=i/n,x=cx+lean*amp*k*k,y=base-12-i*14,w=40-i*3;
    const tilt=i===n?st.edge*recovery*(.65+Math.sin(st.settle*.24)*.35):lean*k*.055;
    stackStone(x,y-(i===n?recovery*6:0),w,tilt,i===n?'#b4432a':['#9a9690','#8a8680','#aeaaa4'][i%3]);
  }
  if(st.fall){const f=st.fall,t=f.age;stackStone(f.x+f.dir*t*2,f.y-t*1.6+t*t*.15,30,f.dir*t*.2,'#b4432a');}
  // 꼭대기와 같은 비율의 금빛 범위와 바늘로 남은 여유를 보여 준다.
  c.fillStyle='#c9b997';c.fillRect(80,5,160,3);c.fillStyle='#dca545';c.fillRect(cx-st.zone*80,4,st.zone*160,5);
  c.fillStyle='#b4432a';c.fillRect(cx+lean*80-2,3,4,7);
  c.fillStyle='#5a4030';c.font='10px sans-serif';c.textAlign='center';
  c.fillText(st.settle?(st.edge?'삐걱… 버틴다!':'탁… 자리 잡는 중'):st.fall?'또 얹으면 된다':Math.abs(sway())<=st.zone?'지금, 살며시!':'가운데를 기다려',cx,23);
  $('spips').innerHTML=[0,1,2].map(i=>'<span class="pip'+(i<st.hits?' on':'')+'"></span>').join('');
  $('sstrike').disabled=st.cool>0||st.done;
}
function stackStep(){
  if(panel.hidden||st.done)return;
  if(st.cool>0)st.cool--;
  st.phase+=.04+st.hits*.014;
  if(st.settle>0){
    st.settle--;
    if(st.settle===0){
      if(st.hits>=3){st.done=true;finishStack();return;}
      stackSay(st.edge?'edge':'good');
    }
  }
  if(st.fall&&++st.fall.age>=24)st.fall=null;
  // 한 단계에서 한 번만 훈수해 성공/실패 대사를 곧바로 덮지 않는다.
  if(!st.cool&&!st.fall&&!st.warned&&Math.abs(sway())>.92){st.warned=true;stackSay('danger');}
  drawStack();
}
function stackHit(){
  if(panel.hidden||st.cool>0||st.hits>=3||st.done)return;
  const lean=sway(),distance=Math.abs(lean);
  if(distance<=st.zone){
    st.land=lean;
    st.edge=distance>=st.zone*.65?Math.sign(lean)*.32:0;
    st.hits++;st.settle=st.edge?42:24;st.cool=st.settle;st.warned=false;
    stackSay(st.edge?'edge':'good');Sound.stone(st.edge?'edge':'tap');
  }else{
    const n=st.hits+2;st.fall={x:160+lean*stackAmp(),y:124-12-n*14,dir:Math.sign(lean),age:0};
    st.miss++;st.cool=14;st.warned=true;Sound.stone('fall');
    if(st.miss>=2)st.zone=.34;
    stackSay('miss',st.miss>=2?' 금빛 가운데가 넓어졌다.':'');
  }
  drawStack();
}
$('sstrike').addEventListener('pointerdown',e=>{e.preventDefault();stackHit();});
scv.addEventListener('pointerdown',e=>{e.preventDefault();stackHit();});
defineMinigame({id:'stack',step:stackStep,hit:stackHit});
function finishStack(){
  panel.hidden=true;const F=G.f;const perfect=st.miss===0;
  F.stackDone=true;awaken('maetdol');learn('dolsoe:stack');ledgerDone('dolsoe');rel('dolsoe',perfect?2:1);
  clue('s1','돌쇠 할배','아빠도 돌쇠 할배에게 약연 바퀴의 낯선 글자를 읽어 달라고 했다. 할배는 글자 하나만 읽어 주었고, 아빠는 그날 밤 떠났다.');
  diary('d_maetdol','돌탑에 돌 세 개를 얹었다. 그 순간 보따리 속 맷돌에서 우웅, 낮은 소리가 났다. 증조할아버지의 맷돌이 깨어났다.');
  toast('증조할아버지의 맷돌이 깨어났다! 메밀 3 → 메밀가루 1');refreshHud();
  const lines=[['돌쇠 할배',perfect?'하나도 안 떨어뜨렸구나. 네 아빠보다 낫다.':'됐다. 돌이 네 손을 알아보았구나.'],
    ['너구리','(맷돌이 따뜻하네! 이제 메밀을 갈아 보자.)'],
    ['돌쇠 할배','네 아빠도 여기 왔었지. 약연 바퀴에 새겨진 낯선 글자를 읽어 달라더구나.'],
    ['돌쇠 할배','글자 하나만 읽어 주었단다. 녀석은 그날 밤 짐을 싸서 떠났지.'],
    ['돌쇠 할배','무슨 글자였느냐고? 아직 네가 들을 때는 아니란다.']];
  if(G.rel.dolsoe.v>=2&&!F.stoneGiven){F.stoneGiven=true;addItem('story_stone',1);
    diary('d_stone','돌쇠 할배가 아빠의 돌을 내주었다. 아빠가 성황당에 올리려다 끝내 못 올린 소원 돌이다.');
    lines.push(['돌쇠 할배','참, 이 돌도 가져가거라.'],['돌쇠 할배','네 아빠가 소원을 적은 돌이란다. 성황당에 올리려다 끝내 못 올리고 두고 갔지.'],['돌쇠 할배','네가 대신 올려 주려무나.']);}
  talk(lines);
}

/* ---------- 뿔이 (산양 장승지기): 원칙대로 메밀가루를 받아야 길을 연다 ---------- */
function talkPpuri(){
  const F=G.f;
  if(!F.ppuriMet){F.ppuriMet=true;ledger('ppuri','뿔이','메밀가루 1','돌산 길 통과');
    talk([['뿔이','멈춰라. 장승제를 올리기 전에는 돌산에 오를 수 없다.'],['뿔이','성황당 돌무더기가 밤마다 움직인다. 산이 노한 것이다.'],
      ['뿔이','장승제에 올릴 메밀전이 필요하다. 메밀가루 하나를 가져와라. 그게 원칙이다.']],()=>{if(has('memil_powder'))ppuriTrade();});
    return;
  }
  if(!F.ppuriPassed){
    if(has('memil_powder'))ppuriTrade();
    else talk([['뿔이','메밀가루 하나다. 가져오기 전엔 못 간다.'],['뿔이','거둔 밭에서 메밀을 주워 와라. 갈 도구는 네가 구해야 한다.']]);
    return;
  }
  if(F.golemCalm&&!F.seogiTold){F.seogiTold=true;rel('ppuri',1);Rg.addSeogiSpot();learn('ppuri:seogi');
    diary('d_seogi','돌 골렘을 달랬다는 말에 뿔이가 석이버섯 자리를 알려 주었다. 절벽 아래 백 년 바위다.');
    talk([['뿔이','돌무더기를 부수지 않고 달랬다고?'],['뿔이','의리를 아는 꼬마로군. 그렇다면 알려 주지.'],['뿔이','절벽 아래 백 년 바위에 석이버섯이 붙어 있다. 이 자리는 아무한테나 알려 주지 않는다.']]);
    return;
  }
  talk([['뿔이','원칙을 지켰으니 통과다. 가도 좋다.']]);
}
function ppuriTrade(){
  talk([['뿔이','메밀가루는 가져왔나.',[{t:'메밀가루를 건넨다',go:()=>{
    const F=G.f;takeItem('memil_powder',1);F.ppuriPassed=true;ledgerDone('ppuri');rel('ppuri',1);
    diary('d_ppuri','맷돌로 간 메밀가루로 뿔이가 장승제 메밀전을 부쳤다. 금줄이 걷히고 돌산 길이 열렸다.');
    toast('돌산 길이 열렸다');refreshGoal();
    talk([['뿔이','좋다. 원칙대로 장승제를 올린다.'],['뿔이','(뿔이가 메밀전을 부쳐 장승 앞에 올리고, 금줄을 걷었다.)'],['뿔이','통과를 허락한다. 성황당 돌무더기가 깨어 있으니 조심해라.']]);
  }},{t:'아직은 안 줄래',go:null}]]]);
}

/* ---------- 돌 골렘 전투 ---------- */
Rg.startGolem=()=>{
  G.px=1845;
  inkTransition('전투',(G.boss.x-G.cam)/W*100,()=>startBattle('golem',res=>{
    if(res==='win'||res==='calm'){
      if(res==='calm'){G.f.golemCalm=true;diary('d_calm','아빠가 올리다 만 소원 돌을 성황당 꼭대기에 대신 올려 주었다. 돌 골렘이 조용히 내려앉았다.');}
      Rg.bossDie();
    }else{
      G.px=1790;G.f.faints+=res==='lose'?1:0;
      diary('d_hint','돌 골렘은 머리가 높아서 처음엔 닿지 않는다. 다리나 팔을 먼저 무너뜨리거나, 마음을 달랠 물건을 건네 보자.');
      toast('일기에 공략을 적어 두었다. 준비되면 다시 다가가자');
    }
  }));
};

/* ---------- 끝: 까치 편에 약즙 보내기 ---------- */
Rg.sendMedicine=()=>{
  G.f.yakMade=true;
  diary('d_end','깨어난 맷돌로 서리다래를 갈아 약즙을 만들었다. 이번에는 내 손으로 만든 약이다. 까치가 물고 남쪽으로 날아갔다.');
  talk([['너구리','서리다래 약즙, 내가 만들었어!'],['너구리','(휘파람을 불자 장승 위의 까치가 내려왔다.)'],['너구리','까치야, 엄마한테 전해 줘. 남쪽 단풍골 너머 우리 집이야.']],()=>{
    takeItem('darae_yak',1);endGame();
  });
};

/* ---------- NPC (npcs.csv 의 id). x 는 필드 위치 ---------- */
Rg.npcs=[
  {id:'kkubeogi',name:'꾸벅이',x:320,talk:talkKku,draw:Rg.art.hedgehog,props:Rg.props.nest},
  {id:'nal',name:'날쌘',x:820,talk:talkNal,draw:COMMON_ART.weasel,props:COMMON_ART.nalProps},
  {id:'dolsoe',name:'돌쇠 할배',x:1150,talk:talkDolsoe,draw:Rg.art.mole,props:Rg.props.yard},
  {id:'ppuri',name:'뿔이',x:1560,talk:talkPpuri,draw:Rg.art.goat},
];

/* ---------- 지금 할 일 ---------- */
Rg.goal=()=>{
  const F=G.f;
  if(!G.started)return '';
  if(G.ended)return '돌너머 마을 체험판 완료';
  if(!F.kkuTalk)return '장승 옆 고슴도치 꾸벅이에게 말 걸기';
  if(!F.kkuAwake)return '꾸벅이가 고개를 들 때 맞춰 말 걸기';
  if(!F.kkuDone)return has('eoksae',3)?'꾸벅이에게 억새 건네기 (고개를 들 때)':'들판의 마른 억새를 낫으로 베기 ('+(G.inv.eoksae||0)+'/3)';
  if(!F.ppuriMet)return '돌산 길목의 장승지기 뿔이 찾아가기';
  if(!F.ppuriPassed){
    if(has('memil_powder'))return '뿔이에게 메밀가루 건네기';
    if(!isAwake('maetdol')){
      if(F.dolsoeTea)return '돌쇠 할배에게 돌 쌓기 다시 배우기';
      if(has('gyeolmyeongja'))return '석수 마당의 돌쇠 할배에게 결명자 차 드리기';
      if(!F.nalDDone)return (has('kflower')||has('gyeousari',2))?'날쌘에게 칡꽃을 보여 주고 결명자 구하기':'높은 가지의 겨우살이 2개 따서 날쌘에게 가져가기';
      return '석수 마당의 돌쇠 할배 찾아가기';
    }
    const m=G.inv.memil||0;
    if(m<3)return '거둔 메밀밭에서 메밀 줍기 ('+m+'/3)';
    return '보따리를 열고 맷돌에 메밀 3개 넣어 갈기';
  }
  if(!G.boss.dead)return '돌산 절벽 길의 돌 골렘과 맞서기 (부수거나 달래기)';
  if(!F.daraePicked)return '절벽 바위턱의 서리다래 따기';
  return '보따리를 열고 맷돌에 서리다래 넣어 약즙 만들기';
};
})();
