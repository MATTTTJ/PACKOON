'use strict';
/* 돌너머 진행: NPC 대화와 교환, 돌쇠 할배의 돌 쌓기, 돌 골렘 전투, 서리다래 약즙 보내기, 지금 할 일.
   흐름은 design/narrative/dolneomeo-scenario.md (확정 웹 흐름·개발자 결정), 교환은 design/data/trades.csv
   교환 연쇄: 칡꽃 → 결명자 → (돌 쌓기) 맷돌 깨어남 → 메밀가루 → 돌산 길 */
(()=>{
const Rg=REGIONS.dolneomeo;
const MG=TABLES.MINIGAMES;

const pick=lines=>lines[Math.floor(Math.random()*lines.length)];

/* ---------- 채택된 인물 사연: 필수 진행과 보상은 아래 선택지 밖에서도 열린다 ---------- */
function arcScene(key,lines,record,after){
  talk(lines,()=>{
    G.f[key]=true;diary(key,record);
    if(after)after();
  });
}
function arcMenu(name,say,normal,choices){
  talk([[name,say,[{t:'하던 이야기 계속하기',go:normal},...choices,{t:'다음에 이야기할게요',go:null}]]]);
}
function talkKkuArc(){
  const F=G.f;
  if(!Rg.arcs()||!F.kkuDone)return talkKku();
  if(!F.dolneomeo_arc_kku2){
    arcMenu('꾸벅이','잊기 전에… 맡길 말이 있어어…',talkKku,[{t:'무슨 말인데?',go:()=>arcScene('dolneomeo_arc_kku2',[
      ['꾸벅이','봄에 깨면… 들은 말도 잊어버려어…'],
      ['꾸벅이','지난가을… 네 아빠가 둥지 곁에서 잤어어…'],
      ['꾸벅이','잠결에 들었어… “미안하다…”'],
      ['꾸벅이','“그 겨울에 내가 없어서…” 그랬어어…'],
      ['꾸벅이','내가 잊기 전에… 너한테 맡길게에…']
    ],'꾸벅이가 지난가을 둥지 곁에서 들은 아빠의 말을 맡겼다. “미안하다… 그 겨울에 내가 없어서…”')}]);return;
  }
  if(!F.dolneomeo_arc_kku3){
    arcMenu('꾸벅이','그 말… 기억해 줄 거지이…?',talkKku,[{t:'내 기록에 적어 둘게',go:()=>arcScene('dolneomeo_arc_kku3',[
      ['너구리','내가 적어 둘게.'],
      ['너구리','(아빠 수첩을 덮고, 내 기록에 적었다.)'],
      ['꾸벅이','그래애… 이제 자도 되겠다아…']
    ],'꾸벅이에게 맡은 말을 내 기록에 적었다. 꾸벅이는 안심하고 잠들었다.',()=>learn('dolneomeo:arcs-kkubeogi'))}]);return;
  }
  talkKku();
}
function talkDolsoeArc(){
  const F=G.f;
  if(!Rg.arcs()||!F.dolsoeTea)return talkDolsoe();
  const c=[];
  const atYard=!F.dolBridgeCrewHere||G.zone!=='gate'; // 다리 현장에서는 마당 돌탑 이야기를 꺼내지 않는다.
  if(atYard&&!F.dolneomeo_arc_dolsoe1)c.push({t:'꼭대기 돌은 누가 올렸어요?',go:()=>arcScene('dolneomeo_arc_dolsoe1',[
    ['돌쇠 할배','(할배가 꼭대기 돌을 손끝으로 감싼다.)'],
    ['돌쇠 할배','먼저 간 할멈이 올린 돌이란다.'],
    ['돌쇠 할배','손끝마저 무뎌질까 봐, 날마다 만져 본다.'],
    ['돌쇠 할배','밑을 단단히 괴면, 작은 돌도 안 떨어지지.']
  ],'돌쇠 할배는 먼저 간 아내의 소원 돌을 지킨다. 손끝 감각마저 흐려질까 봐 날마다 돌을 만진다고 했다.')});
  else if(F.golemCalm&&knows('like:golem:story_stone')&&!F.dolneomeo_arc_dolsoe2)c.push({t:'아빠의 돌을 올렸어요',go:()=>arcScene('dolneomeo_arc_dolsoe2',[
    ['너구리','아빠의 돌, 대신 올렸어요.'],
    ['돌쇠 할배','(할배가 내 손을 가만히 짚는다.)'],
    ['돌쇠 할배','지난가을엔 네 아빠 손이 자꾸 떨렸지.'],
    ['돌쇠 할배','돌을 몇 번이고 놓쳐서, 내가 맡아 뒀단다.'],
    ['돌쇠 할배','손이 네 아비를 닮았구나. 고맙다.']
  ],'아빠가 떨리는 손으로 못 올린 돌을 대신 올렸다. 돌쇠 할배가 내 손을 짚고 고맙다고 했다.')});
  else if(atYard&&F.dolneomeo_arc_dolsoe2&&!F.dolneomeo_arc_dolsoe3)c.push({t:'엄마 몫도 올려도 돼요?',go:()=>arcScene('dolneomeo_arc_dolsoe3',[
    ['너구리','엄마 몫도 올려도 돼요?'],
    ['돌쇠 할배','이리 오너라. 밑을 받쳐 주마.'],
    ['너구리','(마당의 작은 돌을 골라, 할배 돌탑에 얹었다.)'],
    ['너구리','엄마, 약 보낼게.'],
    ['돌쇠 할배','돌은 마음을 알아야 선다.']
  ],'돌쇠 할배가 받쳐 준 돌탑에 엄마 몫의 돌을 얹었다. 약을 만들어 보내 드리자.')});
  if(c.length)return arcMenu('돌쇠 할배','손끝으로 짚어 보겠느냐.',talkDolsoe,c);
  talkDolsoe();
}
function talkPpuriArc(){
  const F=G.f;
  // 필수 교환과 석이버섯 안내를 사연 메뉴보다 먼저 처리한다.
  if(!Rg.arcs()||!F.ppuriMet||(!F.ppuriPassed&&has('memil_powder'))||(F.ppuriPassed&&!F.seogiTold)||(F.golemCalm&&!F.dolPpuriCalmThanks))return talkPpuri();
  const c=[];
  if(!F.dolneomeo_arc_ppuri1)c.push({t:'왜 꼭 장승제를 올려요?',go:()=>arcScene('dolneomeo_arc_ppuri1',[
    ['뿔이','규칙이다. 길을 살피고 열어야 한다.'],
    ['뿔이','내 아버지도 여기 장승지기였다.'],
    ['뿔이','폭설에 길을 열었다가 짐꾼이 떨어졌지.'],
    ['뿔이','다시는 그런 일이 생기면 안 된다.']
  ],'뿔이의 아버지도 장승지기였다. 폭설에 길을 열었다가 짐꾼이 떨어진 뒤, 뿔이는 길을 여는 조건을 지킨다.')});
  else if(!F.dolneomeo_arc_ppuri2)c.push({t:'아빠도 이 길로 갔어요?',go:()=>arcScene('dolneomeo_arc_ppuri2',[
    ['너구리','아빠 찾으러 왔어요. 이 길로 갔어요?'],
    ['뿔이','그 모자… 지난가을 그 너구리의 아이였나.'],
    ['뿔이','사흘을 눈 속에 세워 뒀다. 급하다는데도.'],
    ['뿔이','기침을 하면서도 한 번도 화를 안 냈다.'],
    ['뿔이','난 길만 살폈지. 기다리는 이는 못 봤다.']
  ],'뿔이는 지난가을 아빠를 사흘 동안 눈 속에서 기다리게 했다. 아빠는 기침을 하면서도 한 번도 화를 내지 않았다고 한다.')});
  else if(F.ppuriPassed&&!F.dolneomeo_arc_ppuri3)c.push({t:'아빠는 어느 길로 갔어요?',go:()=>arcScene('dolneomeo_arc_ppuri3',[
    ['뿔이',CLASSIC?'금줄 너머 납작한 바위가 보이나.':'돌담 마을 끝에 높은 돌계단이 있다.'],
    ['뿔이',CLASSIC?'그 옆으로 곧장 가면 성황당이다.':'돌계단 안쪽 길은 성황당으로 곧장 간다.'],
    ['뿔이','네 아빠가 지나간 지름길이다.'],
    ['너구리','알려 줘서 고마워요.'],
    ['뿔이',G.boss.dead?'돌무더기도 잠잠해졌군. 그래도 발밑을 살펴라.':'돌무더기는 아직 깨어 있다. 거긴 조심해라.']
  ],CLASSIC?'뿔이가 아빠가 지나간 지름 바위를 알려 줬다. 금줄 너머 납작한 바위 옆길이다. 성황당 돌무더기는 따로 지나야 한다.':'뿔이가 아빠가 지나간 마을 끝 돌계단 안쪽 길을 알려 줬다. 성황당 돌무더기는 따로 지나야 한다.')});
  if(c.length)return arcMenu('뿔이','묻고 싶은 게 있나.',talkPpuri,c);
  talkPpuri();
}
function nalSickle(){
  const lines=[['날쌘','그 낫…'],['날쌘','…아직 그 자루네.'],['너구리','아빠 거예요.']];
  // 앞 지역의 기존 표시를 읽기만 한다. 다른 지역 시험판의 플래그 이름을 가정하지 않는다.
  if(G.f.nalDone&&knows('nal:bluff-paid'))lines.push(['날쌘','숯더러 촌구석 물건이라더니. 잘 벼렸네.']);
  else lines.push(['날쌘','날은 잘 벼렸네.']);
  lines.push(['날쌘','됐어. 낫은 넣고, 바꿀 물건이나 꺼내.']);
  arcScene('dolneomeo_arc_nal2',lines,'날쌘은 아빠의 낫을 보고 하던 말을 멈췄다. 낡은 자루를 알아보는 듯했지만 더 말하지 않았다.');
}

/* ---------- 꾸벅이 (고슴도치): 고개를 들 때 맞춰 말 걸기 ---------- */
function talkKku(){
  const F=G.f;F.kkuTalk=true;
  if(!Rg.kkuAwakeNow()){
    Sound.stone('sleep');
    learn('kkubeogi:sleep');
    if(!G.clues.some(c=>c.id==='k1')){
      clue('k1','꾸벅이','꾸벅이의 잠꼬대: 보부상 아저씨가 할배네서 겨울을 날 것처럼 굴더니, 글자 하나를 읽고는 그날 밤 떠났다.');
      talk([['꾸벅이','쿨… 쿨…'],['꾸벅이','보부상 아저씨… 할배네서 겨울이라도 날 줄 알았는데…'],['꾸벅이','글자 하나 읽더니… 그날 밤 떠났어… 쿨…'],['너구리','(잠꼬대네. 고개 들 때 다시 말 걸자.)']]);
    }else talk([['꾸벅이',pick(['쿨… 둥지는… 폭신해야…','으음… 아직 꿈꾸는 중이야…','하암… 조금만 더…'])],['너구리',Rg.arcs()?(F.dolneomeo_arc_kku3?'(푹 자. 맡긴 말은 적어 뒀어.)':'(고개 들 때 다시 말 걸자.)'):'(코가 씰룩하네. 곧 고개 들겠다.)']]);
    return;
  }
  Sound.stone('wake');
  if(!F.kkuAwake){F.kkuAwake=true;rel('kkubeogi',1);learn('kkubeogi:awake');
    if(Rg.arcs()){F.dolneomeo_arc_kku1=true;diary('dolneomeo_arc_kku1','꾸벅이가 고개를 들 때 말을 걸었다. 겨울잠 둥지에 깔 억새가 모자란다고 했다.');}
    ledger('kkubeogi','꾸벅이','마른 억새 3','서리다래가 있는 곳');
    talk(Rg.arcs()?[
      ['꾸벅이','어, 어…? 안 잤어어… 진짜야아…'],
      ['꾸벅이','그 모자… 어디서 봤더라아…'],
      ['꾸벅이','둥지에 깔 마른 억새… 세 단만 줄래에…?'],
      ['꾸벅이','들판에서 낫으로 베면 돼애…']
    ]:[['꾸벅이','어, 어…? 안 잤어… 진짜야…'],['꾸벅이','처음 보는 꼬마네… 그 모자, 어디서 봤더라… 하암…'],
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
    talk([['날쌘','또 왔네, 꼬마 보부상. 돌만 잔뜩인 동네라 장사가 영 시원찮아.'],['날쌘',has('kflower')?'가만, 그 향은 단풍골 칡꽃이지?\n여기선 그게 귀한 줄이나 알아?':'단풍골 칡꽃 같은 건 없어?\n여기선 그게 귀하거든.']],nalMenu);}
  else nalMenu();
}
function nalMenu(){
  const F=G.f,c=[];
  if(!F.nalDDone){
    if(has('kflower'))c.push({t:'칡꽃을 내민다 (결명자 2)',go:()=>nalTrade('kflower')});
    if(has('gyeousari',2))c.push({t:'겨우살이 2개를 내민다 (결명자 1)',go:()=>nalTrade('gyeousari')});
    if(!F.nalDBluff)c.push({t:'허세 부리기: "칡꽃? 단풍골엔 흔한데."',go:nalBluff});
  }
  if(Rg.arcs()&&G.tool==='sickle'&&!F.dolneomeo_arc_nal2)c.push({t:'아빠의 낫을 보여 준다',go:nalSickle});
  if(!CLASSIC&&!F.dolneomeo_craft_oil)c.push({t:'여분 억새 한 단을 참기름과 바꾼다',go:()=>{
    // t_craft_oil: 꾸벅이 둥지 몫을 먼저 남긴다. 거절에는 소비가 없다.
    if(!has('eoksae',F.kkuDone?1:4)){
      talk([['날쌘',F.kkuDone?'억새 한 단은 있어야지.\n밭에 남은 마른 걸 베어 와.':(F.kkuTalk?'꾸벅이 둥지에 쓸 세 단은 남겨 둬.\n그 밖에 한 단 더 있으면 바꾸자.':'억새가 넉넉해지면 와.\n한 단이면 참기름 한 병이야.')]]);return;
    }
    talk([['날쌘','병을 감쌀 억새가 필요해.\n한 단 주면 참기름 한 병이다.',[
      {t:'여분 억새 한 단을 건넨다',go:()=>{
        if(G.f.dolneomeo_craft_oil||!has('eoksae',G.f.kkuDone?1:4))return;
        takeItem('eoksae',1);addItem('sesame_oil',1);G.f.dolneomeo_craft_oil=true;
        diary('dolneomeo_craft_oil','날쌘에게 여분 억새를 주고 참기름을 받았다. 병을 억새로 감싸니 돌길에서도 부딪는 소리가 작아졌다.');
        talk([['날쌘','이걸로 병끼리 안 부딪겠네.\n기름은 네가 쓸 데에 써.']]);
      }},{t:'지금은 챙겨 둘래',go:null}
    ]]]);
  }});
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
  talk(F.nalDBluff?[['날쌘',id==='kflower'?'그 흔한 물건도 여기 오면 귀해지는 거야.\n자, 결명자. 덤도 얹었어.':'칡꽃은 흔하다며? 겨우살이로 왔네.\n자, 결명자. 덤도 얹었어.'],['날쌘','날쌘이 짜다는 소리는 못 듣지.']]
    :[['날쌘','자, 결명자 '+n+'개. 이만하면 잘 바꿨지?'],['날쌘','눈 밝히는 약재니까 쓸 데가 있을걸.']]);
}
function nalBluff(){
  const again=knows('nal:bluff-paid');G.f.nalDBluff=true;rel('nal',1);
  talk([['너구리','칡꽃? 단풍골엔 흔한데.'],['날쌘',again?'허, 꼬마 보부상 허세는 여전하네. 날 뭘로 보고?':'허, 꼬마 보부상이 허세는. 날 뭘로 보고?'],['날쌘','좋아. 바꾸면 결명자 하나 더 얹어 줄게.']],nalMenu);
}

/* ---------- 돌쇠 할배 (두더지 석수) ---------- */
function talkDolsoe(){
  const F=G.f;
  if(F.stackDone)grantDolsoeMask();
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
    const lines=Rg.arcs()?[
      ['돌쇠 할배','고맙다. 맷돌도 이리 줘 보거라.'],
      ['돌쇠 할배','(할배가 자개 발자국을 손끝으로 더듬는다.)'],
      ['돌쇠 할배','네 집안 맷돌이구나. 4대째 내려온 게지.'],
      ['돌쇠 할배','“돌이 마음을 알아야 돈다.” 아빠한테 들었니?'],
      ['돌쇠 할배','탑 꼭대기가 가운데 올 때, 돌 세 개를 얹거라.']
    ]:[['돌쇠 할배','눈이 좀 밝아지는구나. 고맙다.'],['돌쇠 할배','보따리를 이리 줘 보거라.'],
      ['돌쇠 할배','(할배가 맷돌 윗돌의 자개 발자국을 손끝으로 천천히 더듬는다.)'],
      ['돌쇠 할배','이 자개 발자국… 그 녀석 집안 맷돌이구나. 4대째 내려온 게지.'],
      ['돌쇠 할배','"돌이 마음을 알아야 돈다." 네 아빠도 그 말을 하더냐. 내가 가르쳐 주었지.'],
      ['돌쇠 할배','돌 마음부터 읽어 보거라. 저 돌탑 꼭대기가 가운데 올 때, 돌을 하나씩 세 개 얹으면 된다.']];
    if(Rg.arcs())lines.push(['돌쇠 할배','배워 보겠느냐.',[
      {t:'돌 쌓기를 배운다',go:openStack},
      {t:'꼭대기 돌 이야기를 듣는다',go:talkDolsoeArc},
      {t:'조금 이따가요',go:null}
    ]]);
    talk(lines,Rg.arcs()?null:openStack);
  }},{t:'아직은 안 드릴래',go:null}]]]);
}

/* 돌 쌓기: 흔들리는 돌탑이 가운데 설 때 돌을 얹는다. 세 개면 맷돌이 깨어난다 (임시 규칙) */
const panel=el('div','forge');panel.id='stack';panel.hidden=true;
panel.innerHTML='<h2>돌 쌓기 · 돌의 마음 읽기</h2><canvas id="stackCv" width="320" height="140" style="display:block;width:min(100%,360px);height:auto;margin:0 auto;image-rendering:pixelated;background:#efe3c8;border:2px solid var(--meok);border-radius:3px;touch-action:none"></canvas><div class="pips" id="spips"></div><div class="fhint" id="shint"></div><button class="btn primary strike" id="sstrike" type="button">돌 얹기 <kbd>Space · J</kbd></button>';
$('shell').appendChild(panel);
panel.insertBefore(el('p','fhint','붉은 꼭대기가 금빛 가운데에 오면 얹자. 세 개면 된다.'),$('spips'));
$('shint').setAttribute('aria-live','polite');
const st={phase:MG.stack_phase,hits:0,miss:0,cool:0,zone:MG.stack_zone,settle:0,land:0,edge:0,fall:null,warned:false,done:false};
let stoneTask=null;
const scv=$('stackCv'),sx=scv.getContext('2d');
const sway=()=>Math.sin(st.phase);
const stackAmp=()=>MG.stack_amplitude+st.hits*MG.stack_amplitude_gain;
const stackAdvice={
  start:['손끝에 힘 빼고 기다리거라.','돌도 숨을 고른단다. 천천히.','가운데 오면 살며시 놓거라.'],
  good:['그래. 돌이 네 손을 아는구나.','잘 놓았다. 다음 것도 천천히 하거라.','허허. 제자리를 찾았구나.'],
  danger:['기울어도 겁먹지 말거라.','가운데로 돌아올 때를 기다리거라.','손은 가만히 두거라. 돌이 온다.'],
  edge:['허허, 버텼구나. 힘 빼거라.','돌도 놀랐겠구나. 괜찮다.','아슬아슬했어도 잘 섰구나.'],
  miss:['괜찮다. 이 돌을 다시 얹어 보거라.','돌은 다치지 않았단다. 다시 놓거라.','서두를 것 없다. 다시 해 보거라.']
};
function stackSay(kind,extra=''){
  $('shint').textContent=stoneTask?(stoneTask.steps[Math.min(st.hits,MG.stack_hits-1)]+(kind==='edge'?' · 살짝 고쳐 놓았다.':'')):'돌쇠 할배: “'+pick(stackAdvice[kind])+'”'+extra;
}
function openStack(task=null){
  // 손일은 미니게임 없이 바로 마친다 (대장 2026-10-30: 미니게임은 채집·전투·놀이에만).
  if(task){Sound.stone('tap');task.done();return;}
  Object.assign(st,{hits:MG.stack_hits,miss:0,done:true});Sound.stone('tap');finishStack();return;
  stoneTask=task;
  panel.querySelector('h2').textContent=task?.title||'돌 쌓기 · 돌의 마음 읽기';
  panel.querySelector('p.fhint').textContent=task?.hint||'붉은 꼭대기가 금빛 가운데에 오면 얹자. 세 개면 된다.';
  $('sstrike').innerHTML=(task?.verb||'돌 얹기')+' <kbd>Space · J</kbd>';
  Object.assign(st,{phase:MG.stack_phase,hits:0,miss:0,cool:0,zone:MG.stack_zone,settle:0,land:0,edge:0,fall:null,warned:false,done:false});
  stackSay('start');panel.hidden=false;drawStack();
}
// 같은 판정과 창을 짧은 공동 작업에도 쓴다. 작업 돌은 보따리 물건이 아니다.
Rg.stoneTask=openStack;
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
  if(stoneTask&&Rg.drawStoneTask)Rg.drawStoneTask(c,stoneTask,st);
  // 꼭대기와 같은 비율의 금빛 범위와 바늘로 남은 여유를 보여 준다.
  c.fillStyle='#c9b997';c.fillRect(80,5,160,3);c.fillStyle='#dca545';c.fillRect(cx-st.zone*80,4,st.zone*160,5);
  c.fillStyle='#b4432a';c.fillRect(cx+lean*80-2,3,4,7);
  c.fillStyle='#5a4030';c.font='10px sans-serif';c.textAlign='center';
  c.fillText(st.settle?(st.edge?'삐걱… 버틴다!':'탁… 자리 잡는 중'):st.fall?'또 얹으면 된다':Math.abs(sway())<=st.zone?'지금, 살며시!':'가운데를 기다려',cx,23);
  if(stoneTask){c.fillStyle='#5a4030';c.fillText(stoneTask.stones?.[Math.min(st.hits,MG.stack_hits-1)]||'함께 받치고 있으니 천천히 해도 돼.',cx,Hc-2);}
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
      if(st.hits>=MG.stack_hits){st.done=true;if(stoneTask){const done=stoneTask.done;stoneTask=null;panel.hidden=true;done();}else finishStack();return;}
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
  if(distance<=st.zone||stoneTask){
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
  clue('s1','돌쇠 할배','돌쇠 할배가 지난가을 아빠에게 읽어 준 약연의 글자는 “되돌림”이었다. 아빠는 그날 밤 떠났다.');
  diary('d_maetdol','돌탑에 돌 세 개를 얹었다. 그 순간 보따리 속 맷돌에서 우웅, 낮은 소리가 났다. 증조할아버지의 맷돌이 깨어났다.');
  toast('증조할아버지의 맷돌이 깨어났다! 메밀 3 → 메밀가루 1');refreshHud();
  const lines=Rg.arcs()?[
    ['돌쇠 할배','됐다. 맷돌이 네 손을 알아보는구나.'],
    ['돌쇠 할배','네 아빠도 지난가을 약연을 들고 왔었지.'],
    ['돌쇠 할배','(할배가 약연 바퀴의 글자를 손끝으로 짚는다.)'],
    ['돌쇠 할배','“되돌림.” 그렇게 읽어 줬더니 그날 밤 떠났단다.']
  ]:[['돌쇠 할배',perfect?'하나도 안 떨어뜨렸구나. 네 아빠보다 낫다.':'됐다. 돌이 네 손을 알아보았구나.'],
    ['너구리','(맷돌이 따뜻하네! 이제 메밀을 갈아 보자.)'],
    ['돌쇠 할배','네 아빠도 여기 왔었지. 약연 바퀴에 새겨진 낯선 글자를 읽어 달라더구나.'],
    ['돌쇠 할배','글자 하나만 읽어 주었단다. 녀석은 그날 밤 짐을 싸서 떠났지.'],
    ['돌쇠 할배','“되돌림.” 그렇게 읽어 줬단다.']];
  if(G.rel.dolsoe.v>=2&&!F.stoneGiven){F.stoneGiven=true;addItem('story_stone',1);
    diary('d_stone','돌쇠 할배가 아빠의 돌을 내주었다. 아빠가 성황당에 올리려다 끝내 못 올린 소원 돌이다.');
    if(Rg.arcs())lines.push(['돌쇠 할배','아빠가 못 올린 소원 돌이다. 받아 두거라.'],['돌쇠 할배','성황당에 대신 올려 주겠니.']);
    else lines.push(['돌쇠 할배','참, 이 돌도 가져가거라.'],['돌쇠 할배','네 아빠가 소원을 적은 돌이란다. 성황당에 올리려다 끝내 못 올리고 두고 갔지.'],['돌쇠 할배','네가 대신 올려 주려무나.']);}
  grantDolsoeMask(lines);
  talk(lines);
}
function grantDolsoeMask(lines){
  if(G.rel.dolsoe.v<2||G.f.dolGaksiGiven)return;
  if(typeof grantMask!=='function'){G.f.dolGaksiPending=true;return;}
  grantMask('gaksi');G.f.dolGaksiGiven=true;delete G.f.dolGaksiPending;
  if(lines)lines.push(['돌쇠 할배','네 손을 믿으마. 이 각시탈도 받아라.\n넓게 짚되, 서두르지 않는 손이란다.']);
  diary('dol_gaksi','돌쇠 할배가 손을 믿는다며 각시탈을 내주었다.');
}

/* ---------- 뿔이 (산양 장승지기): 원칙대로 메밀가루를 받아야 길을 연다 ---------- */
function talkPpuri(){
  const F=G.f;
  if(!F.ppuriMet){F.ppuriMet=true;ledger('ppuri','뿔이','메밀가루 1','돌산 길 통과');
    talk(Rg.arcs()?[
      ['뿔이','멈춰라. 장승제 전에는 돌산에 못 오른다.'],
      ['뿔이','규칙이다. 돌무더기가 움직여 길이 위험하다.'],
      ['뿔이','메밀전을 부칠 메밀가루 하나가 필요하다.']
    ]:[['뿔이','멈춰라. 장승제를 올리기 전에는 돌산에 오를 수 없다.'],['뿔이','성황당 돌무더기가 밤마다 움직인다. 산이 노한 것이다.'],
      ['뿔이','장승제에 올릴 메밀전이 필요하다. 메밀가루 하나를 가져와라. 그게 원칙이다.']],()=>{if(has('memil_powder'))ppuriTrade();});
    return;
  }
  if(!F.ppuriPassed){
    if(has('memil_powder'))ppuriTrade();
    else talk([['뿔이','메밀가루 하나다. 가져오기 전엔 못 간다.'],['뿔이','거둔 밭에서 메밀을 주워 와라. 갈 도구는 네가 구해야 한다.']]);
    return;
  }
  if(!F.seogiTold){tellSeogi();
    talk([['뿔이','절벽 아래 백 년 바위에 석이버섯이 있다.'],['뿔이','성황당까지 갈 필요 없다. 낮은 바위에서 떼어라.\n돌무더기가 깨어 있어도 닿는 자리다.']]);
    return;
  }
  if(F.golemCalm&&!F.dolPpuriCalmThanks){
    F.dolPpuriCalmThanks=true;
    // 옛 저장의 석이버섯 보상 때 이미 받은 의리는 다시 주지 않는다.
    if(!G.diary.some(d=>d.id==='d_seogi'&&d.text.includes('달랬')))rel('ppuri',1);
    talk([['뿔이','돌무더기를 부수지 않고 달랬다지.\n고맙다. 길도 한결 든든하겠군.']]);return;
  }
  talk([['뿔이','원칙을 지켰으니 통과다. 가도 좋다.']]);
}
function ppuriTrade(){
  talk([['뿔이','메밀가루는 가져왔나.',[{t:'메밀가루를 건넨다',go:()=>{
    const F=G.f;takeItem('memil_powder',1);F.ppuriPassed=true;ledgerDone('ppuri');rel('ppuri',1);tellSeogi();
    diary('d_ppuri','맷돌로 간 메밀가루로 뿔이가 장승제 메밀전을 부쳤다. 금줄이 걷히고 돌산 길이 열렸다.');
    toast('돌산 길이 열렸다');refreshGoal();
    talk([['뿔이','좋다. 원칙대로 장승제를 올린다.'],['뿔이','(뿔이가 메밀전을 부쳐 장승 앞에 올리고, 금줄을 걷었다.)'],['뿔이','절벽 아래 백 년 바위에 석이버섯도 있다.\n성황당 돌무더기 앞까지 가지 않아도 딸 수 있다.'],['뿔이','통과다. 흰 돌턱을 밟고, 발밑을 살펴라.']]);
  }},{t:'아직은 안 줄래',go:null}]]]);
}
function tellSeogi(){
  if(G.f.seogiTold)return;
  G.f.seogiTold=true;Rg.addSeogiSpot();learn('ppuri:seogi');
  diary('d_seogi','뿔이가 길을 열며 석이버섯 자리를 알려 줬다. 골렘을 만나기 전, 절벽 아래 백 년 바위에서 딸 수 있다.');
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
  if(regionCompleted(Rg.id))return;
  G.f.yakMade=true;
  diary('d_end','깨어난 맷돌로 서리다래를 갈아 약즙을 만들었다. 이번에는 내 손으로 만든 약이다. 까치가 물고 남쪽으로 날아갔다.');
  talk(CLASSIC?[['너구리','서리다래 약즙, 내가 만들었어!'],['너구리','(휘파람을 불자 장승 위의 까치가 내려왔다.)'],['너구리','까치야, 엄마한테 전해 줘. 남쪽 단풍골 너머 우리 집이야.']]
    :[['너구리','(약즙 통을 까치 발에 단단히 묶었다.)'],['늙은 까치','단단히 묶었구나. 다녀오마.'],['너구리','엄마한테… 내가 만들었다고 해 줘.']],()=>{
    Rg.finishHomeDelivery();
  });
};
Rg.finishHomeDelivery=()=>{
  if(G.f.dolHomeDelivered||regionCompleted(Rg.id))return;
  G.f.dolHomeDelivered=true;
  const before=G.inv.darae_yak||0;
  if(!G.f.dolHomeSent&&typeof sendHomeGift==='function'){sendHomeGift('dolneomeo','darae_yak');G.f.dolHomeSent=true;}
  // 공통 함수가 물건을 소비하는 버전과 기록만 남기는 버전 모두 한 통만 보낸다.
  if((G.inv.darae_yak||0)===before&&before>0)takeItem('darae_yak',1);
  diary('dol_home_reply',Rg.homeReply);endGame();
};

/* ---------- NPC (npcs.csv 의 id). x 는 필드 위치 ---------- */
Rg.npcs=[
  {id:'kkubeogi',name:'꾸벅이',x:320,talk:talkKkuArc,draw:Rg.art.hedgehog,props:Rg.props.nest},
  {id:'nal',name:'날쌘',x:820,talk:talkNal,draw:COMMON_ART.weasel,props:COMMON_ART.nalProps},
  {id:'dolsoe',name:'돌쇠 할배',x:1150,talk:talkDolsoeArc,draw:Rg.art.mole,props:Rg.props.yard},
  {id:'ppuri',name:'뿔이',x:1560,talk:talkPpuriArc,draw:Rg.art.goat},
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

/* PA-43 [개발자 결정] 돌에 새긴 소원. 선택 만남은 필수 교환·가보·출구 조건에 쓰지 않는다. */
(()=>{
if(CLASSIC)return;
const Rg=REGIONS.dolneomeo;
const drawGuest=kind=>(x,y,f)=>Rg.expansionArt.drawWanderer(kind,x,y,f);
const finish=(id,record,flag)=>()=>{
  if(flag)G.f[flag]=true;
  finishWanderer(id);diary('wanderer:dolneomeo:'+id,record);
};
const nickname=(id,text,by)=>{
  if(typeof grantNickname==='function')grantNickname(id,text,by);
  diary('nickname:'+id,by+'에게 '+text+'이라고 불렸다.');
};
function hands(title,verb,steps,done){
  Rg.stoneTask({title,verb,steps,hint:'금빛 가운데에 맞춰 보자. 빗나가도 함께 받쳐 주니 떨어지지 않아.',done});
}
function hareHands(){
  hands('짐꾼과 등짐 고쳐 묶기','함께 받치기',['등짐 밑을 두 손으로 받치자.','숫돌을 등에 붙여 낮추자.','풀리지 않게 끈을 눌러 매자.'],()=>{
    finish('dol_hare','짐꾼과 등짐을 함께 받쳐 숫돌을 낮추고 끈을 고쳐 맸다. 장승 뒤 길표와 옛 다리 이야기를 들었다.','dolneomeo_pack_help')();
    nickname('dol_pack_friend','짐짝 동무','산토끼 짐꾼');
    talk([['산토끼 짐꾼','고맙다, 짐짝 동무!\n무거운 쪽을 알아서 받치는구나.'],['산토끼 짐꾼','숫돌은 돌쇠 어른 댁에 내려놓고,\n남는 받침돌은 무너진 다리 쪽에 갖다 둘게.']]);
  });
}
function frogHands(){
  hands('개구리의 마른 잠자리','돌 밀기',['물 흐르는 홈 옆에 작은 돌을 괴자.','따뜻한 돌을 천천히 밀자.','마른 틈까지 돌을 바짝 붙이자.'],finish('dol_frog','따뜻한 돌을 개구리에게 밀고 물이 흐르는 홈을 피해 잠자리를 받쳤다. 높은 바위 틈의 붉은 발자국을 알려 줬다.','dolneomeo_frog_warm'));
}
function magpieHands(){
  hands('까치와 바람막이 놓기','돌 받치기',['담 틈에 넓은 돌을 세우자.','바람 오는 쪽을 한 번 더 받치자.','까치 발 놓을 작은 돌을 놓자.'],()=>{
    finish('dol_magpie','까치와 돌담 틈을 막고 발 놓을 돌을 놓았다. 돌가루 묻은 손을 보고 돌손이라고 불렀다.','dolneomeo_magpie_rest')();
    nickname('dol_stone_hand','돌손','늙은 까치');
    talk([['늙은 까치','이제 날개 밑이 안 시리다.\n돌손, 네 손도 이리 녹여라.'],['늙은 까치','담에서 빠진 흰 돌이 남았구나.\n눈 오는 날엔 흰 돌이 길을 알려 주지.']]);
  });
}

function helpHare(){
  talk([
    ['산토끼 짐꾼','돌쇠 어른 댁에 숫돌을 지고 가는 길이야.\n첫서리만 오면 이 끈이 자꾸 미끄러져.'],
    ['산토끼 짐꾼','숫돌은 꼭대기에, 억새는 밑에 묶었거든.\n걸을 때마다 등짐이 나보다 먼저 고개를 넘어.'],
    ['너구리','무거운 걸 아래로 내려 볼까요?\n제가 이쪽을 잡을게요.'],
    ['산토끼 짐꾼','그럼 잠깐 같이 들어 주겠니?\n길바닥에 내려놓고 끈부터 풀자.',[
      {t:'등짐을 받치고 숫돌을 아래로 옮긴다',go:()=>talk([
        ['너구리','(짐꾼과 등짐을 내려놓았다.\n숫돌을 등에 붙이고 억새는 위로 올렸다.)'],
        ['산토끼 짐꾼','어이쿠, 등이 한결 가볍네.\n짐은 그대로인데 걷는 게 다르구나.'],
        ['산토끼 짐꾼','장승 뒤 받침을 살펴봐. 낡은 발바닥 자국이 있어.\n우리 아버지도 길짐승들이 남긴 길표랬지.'],
        ['산토끼 짐꾼','고개 안쪽 돌다리는 지금은 무너졌어.\n없는 길로 성큼 내딛지는 마라.']
      ],hareHands)},
      {t:'지금은 길부터 살펴볼게요',go:null}
    ]]
  ]);
}

function stoneChoice(kind){
  const flat=kind==='flat';
  talk([
    ['너구리',flat?'(마당에서 주운 납작돌을 내밀었다.\n꼬마의 반짝돌과 바꾸었다.)':'(마당에서 주운 줄무늬 돌을 내밀었다.\n꼬마의 반짝돌과 바꾸었다.)'],
    ['꼬마 두더지',flat?'납작해서 내 돌집 문이 되겠다!\n반짝돌은 네 손에도 잘 어울리네.':'이건 줄마다 길이 하나씩 있네!\n반짝돌은 네 손에도 잘 어울리네.'],
    ['꼬마 두더지','할배가 버린 돌에도 쓸 데가 있댔어.\n남은 쐐기돌은 옛 다리에 보탤래.'],
    ['꼬마 두더지','맷돌 받침도 그 다리에서 가져온 거래.\n이번에는 우리가 돌을 돌려주는 거네!'],
    ['너구리','(반짝돌은 꼬마 돌집 창가에 놓았다.\n둘이 바꾼 돌이 한 집에 나란히 섰다.)']
  ],()=>{
    G.f.dolneomeo_mole_pebble=kind;
    Rg.stoneTask({title:'꼬마와 돌집 짓기',verb:'문돌 받치기',hint:'금빛 가운데에 맞춰 놓자. 꼬마가 옆에서 받쳐 주니 굴러가지 않아.',
      steps:['밑돌 두 개를 나란히 놓자.','납작한 문돌을 세워 보자.','반짝돌은 창가에 괴어 놓자.'],
      done:finish('dol_mole','꼬마와 돌집의 밑돌·문돌·창가 돌을 직접 놓았다. 맷돌 받침은 옛 돌다리에서 왔다고 한다.')});
  });
}
function meetMole(){
  talk([
    ['꼬마 두더지','이 돌 봐! 씻으니까 별이 나왔어.\n돌쇠 할배 마당에는 이런 돌이 많아.'],
    ['꼬마 두더지','나는 돌집을 짓는데 문이랑 담이 비었어.\n이 반짝돌은 예쁘지만 자꾸 굴러가.'],
    ['너구리','저 납작한 건 문이 되겠네.\n줄무늬 돌은 담으로 쓰고.'],
    ['꼬마 두더지','네가 고른 돌이랑 바꿀래.\n여기 마당에 있는 걸 골라도 돼!',[
      {t:'납작한 돌과 바꾼다',go:()=>stoneChoice('flat')},
      {t:'줄무늬 돌과 바꾼다',go:()=>stoneChoice('stripe')},
      {t:'돌집을 좀 더 구경한다',go:null}
    ]]
  ]);
}

function warmFrog(){
  talk([
    ['움츠린 개구리','돌 틈에서 겨울잠을 자려 했는데…\n고드름 녹은 물이 등을 적셨어.'],
    ['움츠린 개구리','석수들이 두고 간 화로는 식어 가고.\n저 넓적한 돌만 아직 온기가 남았네.'],
    ['너구리','이 돌, 미지근해.\n젖은 자리 말고 이 위로 올라올래?'],
    ['움츠린 개구리','다리에 힘이 안 들어가네.\n돌을 내 쪽으로 밀어 주겠니?',[
      {t:'따뜻한 돌을 밀어 건넨다',go:()=>talk([
        ['너구리','(식은 화로 옆 돌을 두 손으로 밀었다.\n개구리가 천천히 배를 붙인다.)'],
        ['움츠린 개구리','아… 배부터 좀 풀린다.\n겨울 들기 전에 자리를 잘못 잡았어.'],
        ['움츠린 개구리','위쪽 갈라진 바위는 비도 바람도 안 들어.\n안쪽에 붉은 발자국도 하나 있어.'],
        ['너구리','(마른 틈 쪽으로 돌을 바짝 붙여 줬다.\n개구리가 다리를 접고 눈을 감는다.)']
      ],frogHands)},
      {t:'화로 옆을 먼저 둘러본다',go:null}
    ]]
  ]);
}

function restMagpie(){
  // 다른 지역 기록은 읽기만 한다. 바로가기를 실제 배달 기억으로 바꾸지 않는다.
  const home=knows('home:galchamgol');
  const met=!!G.f.wanderersDone?.['galchamgol:old_magpie'];
  talk([
    ['늙은 까치',home?'아가, 또 만났구나.\n네가 보낸 것, 엄마 손에 잘 쥐여 드렸다.':met?'아가, 또 만났구나.\n밥 잘 먹고 있다는 말, 네 엄마한테 전했다.':'그 모자… 개울 아래 초가 아이로구나.\n나는 그 골짜기에 약 나르던 까치란다.'],
    ['늙은 까치','이 고개는 해마다 높아지는구나.\n…고개가 아니라 내 날개가 낮아진 게지.'],
    ['너구리','그럼 여기서 쉬어.\n내가 바람 오는 쪽에 앉을게.'],
    ['늙은 까치','그럼 저 돌담 밑에 잠깐 앉자꾸나.\n담에 틈이 나서 바람이 새는구나.',[
      {t:'돌담에 기대 까치와 쉰다',go:()=>talk([
        ['너구리','(보따리를 세우니 찬바람이 조금 잦아들었다.\n까치가 한쪽 발을 깃털 속에 넣는다.)'],
        ['늙은 까치','돌쇠 어른도 꼭 이 자리에 앉곤 했어.\n손에 박힌 돌가루를 천천히 털면서.'],
        ['늙은 까치','손이 하얗구나. 돌쇠 그 양반 손 같다.\n…돌손아. 이제 그리 부르마.'],
        ['너구리','돌손…\n(보따리 속 맷돌을 한 번 만져 봤다.)']
      ],magpieHands)},
      {t:'먼저 둘러보고 올게',go:null}
    ]]
  ]);
}

/* 옛길을 보았다고 지금의 돌이 저절로 놓이지는 않는다. 현장의 세 작업을 잇는다.
   각 공정은 따로 저장한다. 아빠의 소원 돌·채집 재료·교환 물건은 쓰지 않는다. */
const bridgeWorks=[
  {job:'bank',name:'양쪽 받침',at:'왼쪽 물길 옆',title:'돌다리 복원 · 받침돌',
    wishes:['짐꾼의 돌 · 짐이 기울지 않게','꼬마의 돌 · 작은 발도 건너게','돌쇠의 돌 · 밑돌이 버티게'],
    steps:['물길을 막지 않게 밑돌을 받치자.','낮은 쪽에 넓은 돌을 대자.','틈에 작은 돌을 끼워 수평을 맞추자.']},
  {job:'arch',name:'다리판',at:'가운데 다리판 자리',title:'돌다리 복원 · 다리판',
    wishes:['길손의 돌 · 돌아오는 길도 있기를','까치의 돌 · 약이 무사히 닿기를','돌쇠의 돌 · 함께 받치기를'],
    steps:['넓은 면이 위를 보게 돌을 놓자.','가운데 돌을 양옆에서 받치자.','발이 걸리지 않게 이음새를 맞추자.']},
  {job:'rail',name:'가장자리',at:'오른쪽 끝 돌무더기',title:'돌다리 복원 · 가장자리',
    wishes:['짐꾼의 돌 · 눈에도 길이 보이게','꼬마의 돌 · 무서우면 쉬어 가게','내 돌 · 엄마한테 돌아가게'],
    steps:['가장자리에 둥근 돌을 세우자.','쉴 자리에 넓적돌을 놓자.','돌 사이에 흰 돌을 끼워 길을 보이자.']},
];
Rg.bridgeTalk=job=>{
  const F=G.f,stage=F.dolBridgeStage||0;
  if(!Rg.bridgeMemorySeen?.()){
    talk([['너구리','다리가 어디에 걸렸을까?\n왼쪽 소원 돌에 손부터 대 보자.']]);return;
  }
  if(!isAwake('maetdol')){
    talk([['너구리','할배한테 돌 놓는 법부터 배워야겠다.\n마을 석수 마당으로 가 보자.']]);return;
  }
  if(stage>=3){
    talk([['너구리','우리가 놓은 돌다리다.\n끝의 흰 돌턱에서 절벽길로 갈 수 있어.'],['너구리',F.ppuriPassed?'짐꾼 아저씨도 다리를 보러 왔네.':'돌산에 가기 전에는 뿔이 허락을 받아야 해.']]);return;
  }
  const work=bridgeWorks[stage];
  const missing=!F.dolneomeo_pack_help?'받침돌이 모자라.\n고갯길에서 돌 지고 가던 산토끼가 있었는데.':!F.dolneomeo_mole_pebble?'틈에 끼울 쐐기돌이 모자라.\n마을 꼬마 두더지가 돌을 잔뜩 모으던데.':!F.dolneomeo_magpie_rest?'가장자리에 놓을 흰 돌이 모자라.\n마을 돌담에 흰 돌이 빠져 있던데.':null;
  if(missing){talk([['너구리',missing]]);return;}
  if(!Rg.bridgeSurveyReady?.(work.job)){
    talk([['너구리','옛 '+work.name+'은 어떻게 놓였을까?\n소원 돌에서 옛길을 보고, 흰 자리를 짚어 보자.']]);return;
  }
  F.dolBridgeCrewHere=true;
  if(job!==work.job){
    if(!F.dolBridgeBegun){
      talk([['너구리','(할배가 마당 수레를 밀고 왔다.\n길손들이 내려놓은 돌을 한데 모으셨다.)'],['돌쇠 할배','옛 다리를 보았느냐.\n길손들이 모은 돌도 이제 제자리를 찾겠구나.'],['돌쇠 할배','돌마다 소원이 있다. 읽지 않아도 괜찮다.\n우리는 그 위를 걸을 길을 놓자.'],['너구리','제가 놓을게요. 밑에서 받쳐 주세요.'],['돌쇠 할배',work.at+'부터다.\n먼저 받침이 기울지 않게 해야지.']],()=>{F.dolBridgeBegun=true;});
    }else talk([['너구리','다음은 '+work.name+'이다.\n'+work.at+'로 가 보자.']]);
    return;
  }
  talk([['돌쇠 할배',stage===0?'이 돌들은 짐꾼과 꼬마가 날라 왔단다.\n물이 흐를 틈은 남겨 두거라.':stage===1?'밑이 단단하구나. 이제 넓은 돌을 잇자.\n다리판 밑은 내가 받쳐 주마.':'길은 이었으니 발이 벗어나지 않게 하자.\n흰 돌을 놓으면 서리 내려도 가장자리가 보인다.'],
    ['너구리',jo(work.name,'를','을')+' 놓을까?',[
      {t:jo(work.name,'를','을')+' 함께 놓는다',go:()=>Rg.stoneTask({title:work.title,verb:'돌 맞춰 놓기',steps:work.steps,stones:work.wishes,
        hint:'돌쇠 할배가 밑을 받쳐 준다. 가운데를 맞춰 놓자. 떨어져도 다시 받쳐 주신다.',done:()=>{
          F.dolBridgeStage=stage+1;
          diary('dol_bridge_'+stage,work.name+'을 놓았다. '+work.wishes.join(' / '));
          if(stage===2)bridgeComplete();
          else talk([['돌쇠 할배',stage===0?'받침이 섰다. 가운데 다리판 자리로 가자.':'이제 걸을 수 있겠다. 오른쪽 끝에 가장자리 돌도 놓자.']]);
        }})},
      {t:'돌 모양을 더 살펴볼게요',go:null}]]]);
};
function bridgeComplete(){
  const lines=[['뿔이','다리 끝을 손으로 짚어 봐도 되겠나.'],['돌쇠 할배','물길은 남겼고 가장자리도 세웠다.\n네가 마지막으로 살펴보거라.']];
  if(G.f.dolneomeo_arc_ppuri1)lines.push(['뿔이','그 사고 뒤로, 길을 열 때마다 겁이 났다.']);
  else lines.push(['뿔이','아버지가 폭설에 길을 열었다가\n지나던 짐꾼이 떨어진 적이 있다.'],['뿔이','그래서 길 여는 일엔 규칙부터 세웠다.']);
  lines.push(['너구리','이제 같이 살펴요.'],['뿔이','그래. 다음에 돌이 흔들리면\n함께 고쳐 보자.'],['뿔이',G.f.ppuriPassed?'안전하다. 끝의 흰 돌턱으로 가면 절벽길이다.':'다리는 안전하다. 돌산 금줄은 장승제 뒤에 걷겠다.']);
  talk(lines,()=>{
      G.f.dolBridgeCrewHere=false;
      diary('dol_bridge_complete','기억 속에서 본 돌다리를 지금의 돌로 다시 놓았다. 뿔이는 아버지가 길을 열었다가 짐꾼이 떨어진 일을 들려줬다. 이제 길을 함께 살펴보기로 했다.');
      toast('돌다리를 복원했다 · 위쪽 흰 돌턱 ↔ 절벽길');
    });
}
function bridgeReturn(){
  if(G.f.dolBridgeReturn){talk([['산토끼 짐꾼','짐짝 동무, 이번엔 나도 길을 받칠게.\n다녀오면 헐거운 돌부터 같이 보자.']]);return;}
  talk([['산토끼 짐꾼','저 다리를 네가 다시 놓았다며?\n짐을 지고도 쉴 자리가 생겼구나.'],['산토끼 짐꾼','바깥 돌을 같이 짚어 볼까?\n눈이 와도 이 줄은 보이겠네.',[
    {t:'짐꾼과 가장자리를 눌러 본다',go:()=>hands('돌다리 다시 살피기','함께 눌러 보기',['첫 받침이 움직이지 않는지 짚자.','이음새가 벌어졌는지 보자.','쉼돌을 함께 눌러 보자.'],()=>{
      G.f.dolBridgeReturn=true;diary('dol_bridge_return','복원한 다리에서 다시 만난 짐꾼과 가장자리·이음새·쉼돌을 짚었다. 짐꾼도 지나갈 때마다 길을 살피겠다고 했다.');
      talk([['산토끼 짐꾼','끄떡없네. 나도 지날 때마다 볼게.\n짐 받쳐 준 손이 길도 받쳤구나.']]);
    })},{t:'건너갔다 돌아올게요',go:null}]]]);
}
// 완료 길손의 인사 뒤에도 새 행동을 열 수 있도록 이 지역의 만남만 가로챈다.
function returningHare(e){
  if(REG!==Rg||paused())return;
  const p=nearInteraction();
  const mail=p?.id==='dol_magpie'&&has('darae_yak')&&!G.f.yakMade;
  const returning=p?.id==='dol_hare'&&(G.f.dolBridgeStage||0)>=3&&G.f.dolneomeo_pack_help;
  if(!mail&&!returning)return;
  e.preventDefault();e.stopImmediatePropagation();if(e.type==='keydown')suppressedKeys.add(e.key.toLowerCase());
  if(returning){bridgeReturn();return;}
  talk([['늙은 까치','네 손으로 만든 약이로구나.\n이건 내가 꼭 날라 주마.',[
    {t:'약즙을 맡긴다 · 큰 장터로 떠날 준비',go:()=>Rg.sendMedicine()},
    {t:'마을을 조금 더 둘러볼게',go:null}]]]);
}
addEventListener('keydown',e=>{if(!e.repeat&&['e','enter'].includes(e.key.toLowerCase())&&!e.target?.matches?.('input,textarea,select'))returningHare(e);},true);
$('padTalk').addEventListener('pointerdown',returningHare,true);$('prompt').addEventListener('click',returningHare,true);

/* 조사점마다 손에 닿는 물건을 그린다. 장식 발판과 혼동되지 않도록 모두 무릎 아래다. */
function drawThing(kind,x,y){
  x=Math.round(x);y=Math.round(y);
  if(kind==='stalk'){
    R(x-5,y-13,1,13,'#a39478');R(x+1,y-17,1,17,'#b4a58a');R(x-8,y-14,5,3,'#d3ccb6');R(x-1,y-18,5,3,'#e1dcc9');
  }else if(kind==='cloth'){
    R(x,y-21,2,21,'#665b4e');R(x-8,y-18,10,9,'#b3aaa0');R(x-7,y-17,7,2,'#e2d8c2');R(x-2,y-9,2,3,'#b34735');
  }else if(kind==='bowl'){
    R(x-8,y-5,16,4,'#605d55');R(x-6,y-2,12,2,'#454c4a');R(x-6,y-7,12,2,'#c7b99b');R(x-3,y-8,6,1,'#e6dbc0');
  }else if(kind==='water'){
    R(x-14,y-2,28,2,'#a1c1ca');R(x-10,y-1,20,1,'#e0edf0');R(x-15,y-4,4,4,'#687b7f');R(x+12,y-5,4,5,'#687b7f');
  }else if(kind==='bell'){
    R(x,y-23,1,14,'#77776a');R(x-3,y-10,7,6,'#9e9d83');R(x-4,y-5,9,2,'#cfbf8c');R(x,y-2,1,2,'#665b4e');
  }else{
    R(x-10,y-6,20,6,'#747f7d');R(x-8,y-8,15,3,'#9da7a1');R(x-6,y-8,6,1,'#e2ece5');R(x+5,y-4,3,3,'#698470');
  }
}
const examine=(id,x,label,kind,text,y=GROUND)=>({id,x,y,label,text,draw:(sx,sy)=>drawThing(kind,sx,sy)});
const stamp=(id,x,y)=>({id,x,y,note:'stamp:dolneomeo:'+id});
Rg.expansionContent=()=>({
  gate:{
    examines:[
      examine('frost_print',280,'서리 자국 살펴보기','stone','돌 위는 하얗고 발바닥 자리는 까맣다.\n먼저 지나간 짐꾼도 발을 비볐나 봐.'),
      examine('gate_bell',1240,'장승 풍경 들어 보기','bell','바람이 불 때마다 얇은 쇳소리가 난다.\n산 안쪽에서도 이 소리가 들릴까?'),
      {...examine('broken_bridge',2170,'다리 받침 살펴보기','stone',''),get text(){return (G.f.dolBridgeStage||0)>=3?'돌이 다시 이어졌다. 아래로 물도 잘 흐른다.\n새 다리 가장자리는 흰 돌이라 잘 보이네.':'받침돌만 남고 다리판은 아래로 떨어졌다.\n왼쪽 소원 돌에 손을 대면 옛길이 보일까?';}}
    ],
    wanderers:[{id:'dol_hare',name:'산토끼 짐꾼',get x(){return G?.f.dolBridgeStage>=3?2280:940;},draw:drawGuest('hare'),talk:helpHare,greeting:'낮게 묶으니 발이 편하구나.\n고개 안쪽 길은 꼭 살피고 가라.'}],
    stamps:[stamp('jangseung',1710,156)]
  },
  village:{
    examines:[
      examine('stone_channel',360,'돌 물길 들여다보기','water','집집마다 돌 홈을 이어 물을 나눠 쓴다.\n얼지 말라고 짚도 조금 덮어 뒀네.'),
      {...examine('mill_edge',1310,'맷돌 받침 만져 보기','stone',''),get text(){
        return G.f.ppuriPassed?'내가 간 가루로 장승 앞 금줄이 걷혔다.\n맷돌 자개 틈에도 메밀 냄새가 남아 있다.':G.f.dolneomeo_mole_pebble?'꼬마가 말한 옛 돌다리 받침이다.\n한쪽에는 물이 닳게 한 둥근 자국이 있다.':'받침돌 한쪽만 유난히 매끈하다.\n맷돌 밑에서도 먼 길을 온 돌 냄새가 난다.';
      }},
      examine('warm_hearth',2290,'공동 화로 살펴보기','bowl','석수들이 일을 마치고 손을 녹이는 화로다.\n재 속 돌은 불이 꺼진 뒤에도 미지근하다.')
    ],
    wanderers:[
      {id:'dol_mole',name:'꼬마 두더지',x:740,draw:drawGuest('mole'),talk:meetMole,greeting:'우리 돌집에 문이 생겼어!\n반짝돌도 이제 안 굴러가.'},
      {id:'dol_magpie',name:'늙은 까치',x:2080,draw:drawGuest('magpie'),talk:restMagpie,greeting:'돌손, 좀 쉬어 가거라.\n담 뒤는 바람이 덜하단다.'}
    ],
    stamps:[stamp('mill_base',1160,156)]
  },
  field:{
    examines:[
      examine('memil_stubble',390,'메밀 그루터기 살펴보기','stalk','메밀을 거둔 자리마다 짧은 줄기가 섰다.\n돌 사이에 떨어진 알은 아직 단단하다.'),
      examine('tied_reeds',1120,'억새 묶음 살펴보기','stalk','긴 억새는 병을 싸고 짧은 억새는 둥지에 깐다.\n꺾인 것도 버리지 않는구나.'),
      {...examine('nest_door',1590,'둥지 앞 작은 돌 살펴보기','stone',''),get text(){return G.f.kkuDone?'내가 벤 억새 끝이 둥지 틈에서 삐져나왔다.\n바람이 불어도 안쪽은 가만하다.':'둥지 문턱에 납작돌을 비스듬히 세웠다.\n꾸벅이가 졸다가 굴러 나오지 말라고 놨나?';}}
    ],wanderers:[],stamps:[]
  },
  cliff:{
    examines:[
      examine('silver_lichen',530,'은빛 바위 살펴보기','stone','서리 아래 이끼가 동그란 테를 그렸다.\n돌은 가만있어도 무늬가 자라는구나.'),
      examine('frozen_trickle',1850,'얼어붙은 물줄기 살펴보기','water','물이 흐르던 홈에 가느다란 얼음이 매달렸다.\n한 방울씩 녹으면 아래 바위 틈이 젖겠다.'),
      {...examine('dry_crack',2540,'갈라진 바위 들여다보기','stone','',138),get text(){return G.f.dolneomeo_frog_warm?'개구리가 말한 마른 바위 틈이다.\n붉은 발자국이 구름바다 쪽을 향한다.':'깊은 틈 안쪽은 서리가 하나도 없다.\n누가 비를 피해 쪼그려 앉았던 걸까?';}}
    ],
    wanderers:[{id:'dol_frog',name:'움츠린 개구리',x:1440,draw:drawGuest('frog'),talk:warmFrog,greeting:'배가 따뜻해졌어… 고마워.\n이번엔 마른 틈에서 잘게.'}],
    stamps:[stamp('cliff_crack',2390,112)]
  },
  shrine:{
    examines:[
      examine('wish_cloth',380,'소원 천 살펴보기','cloth','새 천 밑에 색 바랜 천이 겹쳐 달렸다.\n같은 가지에 몇 번의 겨울이 묶였을까?'),
      examine('grain_dish',950,'작은 제기 살펴보기','bowl','돌그릇 안에 메밀가루가 조금 남았다.\n바람이 들어도 깊은 그릇이라 안 날아간다.'),
      {...examine('small_tower',2080,'낮은 돌탑 살펴보기','stone',''),get text(){return G.boss.dead?'큰 돌들이 내려앉아 낮은 탑을 받쳤다.\n작은 돌 하나도 굴러떨어지지 않았다.':'바람이 세도 이 낮은 탑은 흔들리지 않는다.\n밑돌 틈마다 작은 돌을 받쳐 뒀네.';}}
    ],wanderers:[],stamps:[]
  }
});
for(const [id,content] of Object.entries(Rg.expansionContent())){
  if(Rg.zones?.[id])Object.assign(Rg.zones[id],content);
}
Rg.installExpansion?.();
})();
