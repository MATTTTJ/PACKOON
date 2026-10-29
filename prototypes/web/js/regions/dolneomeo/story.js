'use strict';
/* 돌너머 진행: NPC 대화와 교환, 돌쇠 할배의 돌 쌓기, 돌 골렘 전투, 서리다래 약즙 보내기, 지금 할 일.
   흐름은 design/narrative/dolneomeo-scenario.md (제안), 교환은 design/data/trades.csv
   교환 연쇄: 칡꽃 → 결명자 → (돌 쌓기) 맷돌 깨어남 → 메밀가루 → 돌산 길 */
(()=>{
const Rg=REGIONS.dolneomeo;
const MG=TABLES.MINIGAMES;

const pick=lines=>lines[Math.floor(Math.random()*lines.length)];

/* ---------- 꾸벅이 (고슴도치): 고개를 들 때 맞춰 말 걸기 ---------- */
function talkKku(){
  const F=G.f;F.kkuTalk=true;
  if(!Rg.kkuAwakeNow()){
    Sound.stone('sleep');
    learn('kkubeogi:sleep');
    if(!G.clues.some(c=>c.id==='k1')){
      clue('k1','꾸벅이','꾸벅이의 잠꼬대: 보부상 아저씨가 할배네서 겨울을 날 것처럼 굴더니, 글자 하나를 읽고는 그날 밤 떠났다.');
      talk([['꾸벅이','쿨… 쿨…'],['꾸벅이','…보부상 아저씨… 할배네서 겨울 날 것처럼 굴더니…'],['꾸벅이','…글자 하나 읽고는… 그날 밤 떠났어… 쿨…'],['너구리','(잠꼬대다. 고개를 들 때 말을 걸어야 깨울 수 있겠다.)']]);
    }else talk([['꾸벅이',pick(['쿨… 둥지는… 폭신하게…','으음… 아직 꿈속인데…','하암… 조금만 더…'])],['너구리','(코가 씰룩하면 곧 고개를 들겠다.)']]);
    return;
  }
  Sound.stone('wake');
  if(!F.kkuAwake){F.kkuAwake=true;rel('kkubeogi',1);learn('kkubeogi:awake');
    ledger('kkubeogi','꾸벅이','마른 억새 3','서리다래가 있는 곳');
    talk([['꾸벅이','…어, 어? 안 잤어. 진짜야.'],['꾸벅이','너 처음 보는 너구리네. 그 모자, 어디서 봤더라… 하암.'],
      ['꾸벅이','나 겨울잠 둥지를 지어야 하는데 억새가 모자라. 들판의 하얗게 센 억새 세 단만 베어다 줄래?'],
      ['꾸벅이','그럼 내가 아는 거 다 알려 줄게… 쿨…']],()=>{if(has('eoksae',3))kkuTrade();});
    return;
  }
  if(!F.kkuDone){
    if(has('eoksae',3))kkuTrade();
    else talk([['꾸벅이','억새 세 단… 낫으로 슥슥 베면 금방이야… 하암…']]);
    return;
  }
  talk([['꾸벅이','돌쇠 할배는 요즘 눈이 침침해서 돌을 손으로만 만져. 결명자 차라면 좋아하실 텐데… 쿨…']]);
}
function kkuTrade(){
  talk([['꾸벅이','오, 억새다! 줄 거지?',[{t:'마른 억새 3단을 건넨다',go:()=>{
    takeItem('eoksae',3);G.f.kkuDone=true;ledgerDone('kkubeogi');rel('kkubeogi',1);learn('kkubeogi:eoksae');
    diary('d_kku','꾸벅이에게 억새를 주고 들었다. 서리다래는 돌산 절벽 바위턱에 있다. 성황당 돌무더기가 밤마다 움직인 뒤로, 장승지기 뿔이가 돌산 길을 닫았다.');
    const lines=[['꾸벅이','와, 폭신폭신하다… 고마워.'],['꾸벅이','서리다래 말이지? 돌산 절벽 바위턱에 열려. 첫서리를 맞아야 달아지거든.'],
      ['꾸벅이','근데 성황당 돌무더기가 밤마다 움직인 뒤로, 장승지기 뿔이가 돌산 길을 닫아 버렸어.']];
    if(G.rel.kkubeogi.v>=2)lines.push(['꾸벅이','그리고… 돌쇠 할배는 요즘 눈이 침침해서 돌을 손으로만 만져. 결명자 차라면 좋아하실 텐데. 날쌘 아저씨가 결명자를 갖고 다니더라.']);
    talk(lines);
  }},{t:'아직은 안 줄래',go:null}]]]);
}

/* ---------- 날쌘 (다시 만남): 돌투성이 마을이라 칡꽃 향이 귀하다 ---------- */
function talkNal(){
  if(!G.f.nalDTalk){G.f.nalDTalk=true;ledger('nal_dolneomeo','날쌘','칡꽃 1 (또는 겨우살이 2)','결명자');
    talk([['날쌘','또 만났네, 꼬마 보부상. 여긴 돌밖에 없어서 장사가 영 시원찮아.'],['날쌘','…잠깐. 그 보따리에서 나는 향, 단풍골 칡꽃이지? 여기선 그게 귀한 몸이야.']],nalMenu);}
  else nalMenu();
}
function nalMenu(){
  const F=G.f,c=[];
  if(!F.nalDDone){
    if(has('kflower'))c.push({t:'칡꽃을 내민다 (결명자 2)',go:()=>nalTrade('kflower')});
    if(has('gyeousari',2))c.push({t:'겨우살이 2개를 내민다 (결명자 1)',go:()=>nalTrade('gyeousari')});
    if(!F.nalDBluff)c.push({t:'허세 부리기: "칡꽃이 다 뭐야, 단풍골엔 흔해 빠졌는데"',go:nalBluff});
  }
  c.push({t:'그만두기',go:null});
  const say=F.nalDDone?'결명자는 눈 밝히는 약재야. 눈 침침한 영감님한테 차로 달여 드리면 좋아하겠지.'
    :(has('kflower')||has('gyeousari',2))?'뭘 내놓을 건데?':'빈손이면 흥정도 없어. 칡꽃이 없으면 높은 가지의 겨우살이라도 두 개 따 와.';
  talk([['날쌘',say,c]]);
}
function nalTrade(id){
  const F=G.f;
  takeItem(id,id==='kflower'?1:2);F.nalDDone=true;ledgerDone('nal_dolneomeo');
  const n=(id==='kflower'?2:1)+(F.nalDBluff?1:0);
  addItem('gyeolmyeongja',n);learn('nal:dolneomeo');
  diary('d_nal','단풍골에서는 흔하던 '+(id==='kflower'?'칡꽃을':'겨우살이를')+' 날쌘이 결명자와 바꿔 주었다. 같은 물건도 마을마다 값이 다르다.');
  talk(F.nalDBluff?[['날쌘','흔해 빠졌다더니 냄새는 기가 막히네. 자, 결명자. 덤까지 얹었다.'],['날쌘','날쌘이 짠돌이란 소리는 못 듣지.']]
    :[['날쌘','거래 성립. 결명자 '+n+'개.'],['날쌘','눈 밝히는 약재야. 쓸 데가 있을걸.']]);
}
function nalBluff(){
  G.f.nalDBluff=true;rel('nal',1);
  talk([['너구리','흥, 칡꽃이 다 뭐야. 단풍골엔 흔해 빠졌는데.'],['날쌘','흔해 빠졌다고? …허, 촌놈 허세는 여전하네.'],['날쌘','좋아. 거래하면 덤으로 하나 더 얹어 주지.']],nalMenu);
}

/* ---------- 돌쇠 할배 (두더지 석수) ---------- */
function talkDolsoe(){
  const F=G.f;
  if(!F.dolsoeMet){F.dolsoeMet=true;
    talk([['돌쇠 할배','…누구냐. 눈이 어두워서 말이다. 가까이 오너라.'],['돌쇠 할배','(할배가 돌을 손끝으로 쓰다듬으며 얼굴을 가까이 댄다. 눈이 많이 침침하신 것 같다.)']],()=>{if(has('gyeolmyeongja'))dolsoeTea();});
    return;
  }
  if(!F.dolsoeTea){
    if(has('gyeolmyeongja'))dolsoeTea();
    else talk([['돌쇠 할배','…돌만 만져도 안다. 넌 아직 빈손이구나.'],['너구리','(눈에 좋은 것을 드리면 좋겠다.)']]);
    return;
  }
  if(!F.stackDone){
    talk([['돌쇠 할배','다시 해 보겠느냐? 돌은 서두르는 놈한테 마음을 안 연다.',[{t:'다시 돌을 얹는다',go:openStack},{t:'조금 이따가요',go:null}]]]);
    return;
  }
  const c=[];if(has('gyeolmyeongja'))c.push({t:'결명자를 하나 더 드린다',go:()=>{takeItem('gyeolmyeongja',1);rel('dolsoe',1);talk([['돌쇠 할배','…허허. 이 늙은이 눈이 오늘은 호강하는구나.']]);}});
  c.push({t:'그만두기',go:null});
  talk([['돌쇠 할배','맷돌은 잘 돌더냐. 메밀은 세 알씩, 천천히.',c]]);
}
function dolsoeTea(){
  talk([['돌쇠 할배','…이 냄새는 결명자로구나.',[{t:'결명자 차를 달여 드린다',go:()=>{
    const F=G.f;takeItem('gyeolmyeongja',1);F.dolsoeTea=true;rel('dolsoe',1);learn('dolsoe:tea');
    ledger('dolsoe','돌쇠 할배','결명자 1','맷돌을 깨움');
    diary('d_dolsoe','돌쇠 할배가 보따리 속 맷돌의 자개 발자국을 손끝으로 더듬더니, 우리 집안 맷돌이라는 걸 알아봤다.');
    talk([['돌쇠 할배','…눈이 좀 밝아지는구나. 고맙다.'],['돌쇠 할배','그 보따리, 이리 줘 보거라.'],
      ['돌쇠 할배','(할배가 맷돌 윗돌의 자개 발자국을 손끝으로 천천히 더듬는다.)'],
      ['돌쇠 할배','…이건. 그 녀석 집안 맷돌이구나. 4대째 내려온 거지.'],
      ['돌쇠 할배','"돌이 마음을 알아야 돈다." 네 아빠가 그 말을 했을 게다. 내가 가르쳐 준 말이거든.'],
      ['돌쇠 할배','돌의 마음을 읽는 법부터 배워라. 저 돌탑에 돌 세 개를 얹어 봐라. 흔들릴 때 말고, 돌이 가운데 설 때다.']],openStack);
  }},{t:'아직은 안 드릴래',go:null}]]]);
}

/* 돌 쌓기: 흔들리는 돌탑이 가운데 설 때 돌을 얹는다. 세 개면 맷돌이 깨어난다 (임시 규칙) */
const panel=el('div','forge');panel.id='stack';panel.hidden=true;
panel.innerHTML='<h2>돌 쌓기 · 돌의 마음 읽기</h2><canvas id="stackCv" width="320" height="140" style="display:block;width:min(100%,360px);height:auto;margin:0 auto;image-rendering:pixelated;background:#efe3c8;border:2px solid var(--meok);border-radius:3px;touch-action:none"></canvas><div class="pips" id="spips"></div><div class="fhint" id="shint"></div><button class="btn primary strike" id="sstrike" type="button">돌 얹기 <kbd>Space · J</kbd></button>';
$('shell').appendChild(panel);
panel.insertBefore(el('p','fhint','붉은 꼭대기가 금빛 가운데에 오면 얹자. 세 개면 된다.'),$('spips'));
$('shint').setAttribute('aria-live','polite');
const st={phase:MG.stack_phase,hits:0,miss:0,cool:0,zone:MG.stack_zone,settle:0,land:0,edge:0,fall:null,warned:false,done:false};
const scv=$('stackCv'),sx=scv.getContext('2d');
const sway=()=>Math.sin(st.phase);
const stackAmp=()=>MG.stack_amplitude+st.hits*MG.stack_amplitude_gain;
const stackAdvice={
  start:['손끝에 힘 빼고, 기다려라.','돌도 숨을 고른다. 천천히.','가운데 서면 살며시 놓거라.'],
  good:['그래. 돌이 네 손을 아는구나.','잘 놓았다. 다음 돌도 천천히.','허허. 제자리를 찾았구나.'],
  danger:['기운다고 겁먹을 것 없다.','돌이 돌아올 때를 기다려라.','손은 가만히. 돌이 온다.'],
  edge:['허허… 버텼구나. 힘 빼거라.','휴… 돌도 놀랐겠다. 괜찮다.','아슬했구나. 그래도 섰다.'],
  miss:['괜찮다. 이 돌로 다시 해라.','돌은 안 다친다. 다시 놓거라.','서두를 것 없다. 다시 해 보자.']
};
function stackSay(kind,extra=''){$('shint').textContent='돌쇠 할배: “'+pick(stackAdvice[kind])+'”'+extra;}
function openStack(){
  Object.assign(st,{phase:MG.stack_phase,hits:0,miss:0,cool:0,zone:MG.stack_zone,settle:0,land:0,edge:0,fall:null,warned:false,done:false});
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
  $('spips').innerHTML=Array.from({length:MG.stack_hits},(_,i)=>'<span class="pip'+(i<st.hits?' on':'')+'"></span>').join('');
  $('sstrike').disabled=st.cool>0||st.done;
}
function stackStep(){
  if(panel.hidden||st.done)return;
  if(st.cool>0)st.cool--;
  st.phase+=MG.stack_speed+st.hits*MG.stack_speed_gain;
  if(st.settle>0){
    st.settle--;
    if(st.settle===0){
      if(st.hits>=MG.stack_hits){st.done=true;finishStack();return;}
      stackSay(st.edge?'edge':'good');
    }
  }
  if(st.fall&&++st.fall.age>=24)st.fall=null;
  // 한 단계에서 한 번만 훈수해 성공/실패 대사를 곧바로 덮지 않는다.
  if(!st.cool&&!st.fall&&!st.warned&&Math.abs(sway())>MG.stack_warning){st.warned=true;stackSay('danger');}
  drawStack();
}
function stackHit(){
  if(panel.hidden||st.cool>0||st.hits>=MG.stack_hits||st.done)return;
  const lean=sway(),distance=Math.abs(lean);
  if(distance<=st.zone){
    st.land=lean;
    st.edge=distance>=st.zone*MG.stack_edge_ratio?Math.sign(lean)*MG.stack_edge_lean:0;
    st.hits++;st.settle=st.edge?MG.stack_edge_wait:MG.stack_hit_wait;st.cool=st.settle;st.warned=false;
    stackSay(st.edge?'edge':'good');Sound.stone(st.edge?'edge':'tap');
  }else{
    const n=st.hits+2;st.fall={x:160+lean*stackAmp(),y:124-12-n*14,dir:Math.sign(lean),age:0};
    st.miss++;st.cool=MG.stack_miss_wait;st.warned=true;Sound.stone('fall');
    if(st.miss>=MG.stack_help_misses)st.zone=MG.stack_help_zone;
    stackSay('miss',st.miss>=MG.stack_help_misses?' 금빛 가운데가 넓어졌다.':'');
  }
  drawStack();
}
$('sstrike').addEventListener('pointerdown',e=>{e.preventDefault();stackHit();});
scv.addEventListener('pointerdown',e=>{e.preventDefault();stackHit();});
defineMinigame({id:'stack',step:stackStep,hit:stackHit});
function finishStack(){
  panel.hidden=true;const F=G.f;const perfect=st.miss===0;
  F.stackDone=true;awaken('maetdol');learn('dolsoe:stack');ledgerDone('dolsoe');rel('dolsoe',perfect?MG.stack_perfect_relation:MG.stack_relation);
  clue('s1','돌쇠 할배','아빠도 돌쇠 할배에게 약연 바퀴의 낯선 글자를 읽어 달라고 했다. 할배는 글자 하나만 읽어 주었고, 아빠는 그날 밤 떠났다.');
  diary('d_maetdol','돌탑에 돌 세 개를 얹었다. 그 순간 보따리 속 맷돌에서 우웅, 낮은 소리가 났다. 증조할아버지의 맷돌이 깨어났다.');
  toast('증조할아버지의 맷돌이 깨어났다! 메밀 3 → 메밀가루 1');refreshHud();
  const lines=[['돌쇠 할배',perfect?'…한 번도 안 무너뜨렸구나. 그 녀석보다 낫다.':'…됐다. 돌이 네 손을 알아봤다.'],
    ['너구리','(보따리 속 맷돌이 따뜻해졌다. 이제 맷돌로 메밀을 갈 수 있다.)'],
    ['돌쇠 할배','네 아빠도 여기 왔었다. 그 약연을 내밀면서, 바퀴에 새겨진 낯선 글자를 읽어 달라더구나.'],
    ['돌쇠 할배','나는 글자 하나만 읽어 주었다. 녀석은 그날 밤 짐을 싸서 떠났지.'],
    ['돌쇠 할배','…무슨 글자였냐고? 그건 아직 네가 들을 때가 아니다.']];
  if(G.rel.dolsoe.v>=2&&!F.stoneGiven){F.stoneGiven=true;addItem('story_stone',1);
    diary('d_stone','돌쇠 할배가 아빠의 돌을 내주었다. 아빠가 성황당에 올리려다 끝내 못 올린 소원 돌이다.');
    lines.push(['돌쇠 할배','그리고 이것.'],['돌쇠 할배','녀석이 성황당에 올리려다 두고 간 돌이다. 소원을 적어 놓고는 끝내 못 올렸지.'],['돌쇠 할배','네가 대신 올려 주려무나.']);}
  talk(lines);
}

/* ---------- 뿔이 (산양 장승지기): 원칙대로 메밀가루를 받아야 길을 연다 ---------- */
function talkPpuri(){
  const F=G.f;
  if(!F.ppuriMet){F.ppuriMet=true;ledger('ppuri','뿔이','메밀가루 1','돌산 길 통과');
    talk([['뿔이','멈춰라. 장승제를 올리지 않은 자는 돌산에 오르지 못한다.'],['뿔이','성황당 돌무더기가 밤마다 움직인다. 산이 노했다는 뜻이다.'],
      ['뿔이','장승제에는 메밀전을 부친다. 메밀가루를 가져오너라. 그게 원칙이다.']],()=>{if(has('memil_powder'))ppuriTrade();});
    return;
  }
  if(!F.ppuriPassed){
    if(has('memil_powder'))ppuriTrade();
    else talk([['뿔이','메밀가루. 원칙은 원칙이다.'],['뿔이','메밀은 거둔 밭에 떨어져 있다. 갈 도구가 없다면… 그건 네 사정이다.']]);
    return;
  }
  if(F.golemCalm&&!F.seogiTold){F.seogiTold=true;rel('ppuri',1);Rg.addSeogiSpot();learn('ppuri:seogi');
    diary('d_seogi','돌 골렘을 달랬다는 말에 뿔이가 석이버섯 자리를 알려 주었다. 절벽 아래 백 년 바위다.');
    talk([['뿔이','돌무더기를 부수지 않고 달랬다고?'],['뿔이','…의리를 아는 녀석이구나. 하나 알려 주마.'],['뿔이','절벽 아래 백 년 바위에 석이버섯이 붙어 있다. 아무한테나 안 알려 주는 자리다.']]);
    return;
  }
  talk([['뿔이','원칙은 지켰다. 갈 길 가라.']]);
}
function ppuriTrade(){
  talk([['뿔이','메밀가루로구나.',[{t:'메밀가루를 건넨다',go:()=>{
    const F=G.f;takeItem('memil_powder',1);F.ppuriPassed=true;ledgerDone('ppuri');rel('ppuri',1);
    diary('d_ppuri','맷돌로 간 메밀가루로 뿔이가 장승제 메밀전을 부쳤다. 금줄이 걷히고 돌산 길이 열렸다.');
    toast('돌산 길이 열렸다');refreshGoal();
    talk([['뿔이','…원칙대로구나.'],['뿔이','(뿔이가 메밀전을 부쳐 장승 앞에 올리고, 금줄을 걷었다.)'],['뿔이','길은 열어 주마. 허나 성황당 돌무더기가 깨어 있다. 조심해라.']]);
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
  talk([['너구리','서리다래 약즙이다. 이번엔 내 손으로 만들었다.'],['너구리','(휘파람을 불자 장승 위에 앉아 있던 까치가 내려왔다.)'],['너구리','까치야, 엄마한테 부탁해. 남쪽 단풍골 너머, 우리 집이야.']],()=>{
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
