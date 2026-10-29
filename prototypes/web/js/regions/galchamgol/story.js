'use strict';
/* 단풍골 진행: NPC 대화와 교환, 무쇠의 대장간 미니게임, 전투 시작과 결과, 지금 할 일.
   흐름은 design/narrative/galchamgol-scenario.md, 교환은 design/data/trades.csv */
(()=>{
const Rg=REGIONS.galchamgol;
const MG=TABLES.MINIGAMES;

/* [시험판] 저장을 읽은 뒤에도 판단한다. 다른 지역은 galArcNal1을 읽어 첫 거래를 기억할 수 있다. */
Rg.arcsEnabled=()=>{
  const ARCS=/[?&]arcs=1\b/.test(location.search)||!!(G&&G.f&&G.f.arcs);
  if(ARCS)G.f.arcs=true;
  return ARCS;
};
function arcScene(flag,lines,entry,apply,next){
  if(!Rg.arcsEnabled()||G.f[flag])return;
  const owner=G;
  G.f[flag]=true;
  if(apply)apply();
  diary(flag,entry);
  talk(lines,()=>{if(G===owner&&G.region===Rg.id&&next)next();});
}

/* ---------- 도담 (다람쥐) ---------- */
function talkDodam(){
  if(!Rg.arcsEnabled()){dodamMain();return;}
  const F=G.f,c=[{t:F.dodamDone?'해머루 가는 길 묻기':'해머루 이야기하기',go:dodamMain}];
  if(!F.galArcDodam1)c.push({t:'도토리 걱정을 들어 본다',go:dodamCacheAsk});
  else if(!F.galArcDodam2&&(F.galArcDodamFound||G.pickups[F.galArcDodamCache]?.got))c.push({t:'찾은 자리를 내 여행 기록에 그린다',go:dodamCacheDraw});
  else if(F.galArcDodam2&&F.dodamDone&&!F.galArcDodam3)c.push({t:'도담이 부르는 소리를 듣는다',go:dodamOldStory});
  if(c.length===1){dodamMain();return;}
  c.push({t:'다음에 이야기하자',go:null});
  talk([['도담','어, 그러니까! 무슨 일이야?',c]]);
}
function dodamCacheAsk(){
  talk([['도담','어, 그러니까, 그게 말이지!'],
    ['도담','겨울 먹을 도토리를 묻었는데…'],['도담','어디 묻었는지 잊었어!'],
    ['도담','같이 찾자! 해머루 자리도 알려 줄게!',[{t:'같이 찾아볼게',go:dodamCacheStart},{t:'해머루부터 물어볼게',go:dodamMain}]]]);
}
function dodamCacheStart(){
  const index=G.pickups.findIndex(a=>a.item==='acorn'&&a.y===GROUND&&!a.got&&(CLASSIC||a.zone==='forest'));
  // 이미 전부 주웠다면 그 자리를 그려 줄 수 있다. 도토리를 다시 내거나 새로 모을 필요는 없다.
  arcScene('galArcDodam1',index<0?
    [['도담','어, 땅에 있던 건 다 주웠어?'],['도담','해머루는 당산나무 꼭대기야!']]:
    [['도담','흙 묻은 도토리가 내 거야!'],['도담','해머루는 당산나무 꼭대기야!']],
    '도담이 겨울 먹을 도토리를 묻은 자리를 잊었다. 숲에서 도토리를 찾을 때 함께 살펴보기로 했다.',
    ()=>{G.f.galArcDodamCache=index;G.f.galArcDodamFound=index<0;});
}
Rg.arcCache=a=>Rg.arcsEnabled()&&G.f.galArcDodam1&&!G.f.galArcDodam2&&G.pickups[G.f.galArcDodamCache]===a;
Rg.onPickup=a=>{
  if(Rg.arcCache(a)){G.f.galArcDodamFound=true;toast('도담이 묻은 도토리다! 찾은 자리를 알려 주자');}
};
function dodamCacheDraw(){
  if(!(G.f.galArcDodamFound||G.pickups[G.f.galArcDodamCache]?.got))return;
  arcScene('galArcDodam2',[['너구리','여기였어. 내 기록에 그려 둘게.'],
    ['도담','어, 그러니까… 여기에 동그라미!'],['도담','적어 두면 안 잊는구나!'],['도담','잊으면 다시 찾으면 되지!']],
    '도담과 도토리를 찾은 자리를 내 여행 기록에 그렸다. 도담은 적어 두면 안 잊겠다며 웃었다.');
}
function dodamOldStory(){
  if(!G.f.galArcDodam2||!G.f.dodamDone)return;
  arcScene('galArcDodam3',[['도담','도토리 가루야! 이건 덤!'],['도담','참, 우리 할머니가 그랬는데!'],
    ['도담','옛날에 너구리 하나가 왔대.'],['도담','해머루만 보고 돌아섰대!'],
    ['너구리','언제?'],['도담','네가 태어나기도 전이래!']],
    '도담이 도토리 가루를 덤으로 주었다. 할머니에게 들었다며 아주 옛날 해머루만 보고 돌아선 너구리 이야기를 했다.',
    ()=>addItem('powder',1));
}
function dodamMain(){
  const F=G.f;
  if(!F.dodamTalk){F.dodamTalk=true;
    talk([['도담','어, 못 보던 너구리네! 잠깐, 그 모자 어디서 봤는데…'],
      ['도담','뭐 찾아? 내가 알려 줄까?',[{t:'해머루는 어디 있어?',go:dodamFruit},{t:'우리 아빠 봤어? 너구리 보부상이야',go:()=>dodamDad(dodamFruit)}]]]);
  }else if(!F.dodamDone){
    if(has('powder'))dodamTrade();
    else talk([['도담','도토리 가루 하나면 해머루가 어딨는지 알려 줄게! 도토리 세 알을 절구에 넣고 빻으면 돼!']]);
  }else talk([['도담',CLASSIC?'당산나무는 마을 맨 끝이야! 참, 칡덩굴 조심해!':'숲 안쪽의 금줄을 따라가!\n낫으로 덩굴을 걷으면 당산나무 속으로 갈 수 있어!']]);
}
function dodamDad(next){
  clue('d1','도담','몇 달 전 보부상 너구리가 단풍골에서 도토리 가루를 바꿔 갔다. 북쪽으로 간다고 했다.');
  rel('dodam',1);
  talk([['도담','아, 생각났다! 보부상 아저씨도 그 모자 썼어!'],['도담','몇 달 전에 여기서 도토리 가루를 잔뜩 바꿔 갔거든! 북쪽으로 간댔어. 엄청 급해 보이던데.']],next);
}
function dodamFruit(){
  ledger('dodam','도담','도토리 가루 1','해머루가 있는 곳');
  talk([['도담','해머루? 그럼, 내가 알지!'],['도담','대신 도토리 가루 하나 줘! 숲에서 도토리 세 알 주워서 보따리 속 절구로 빻으면 돼!']],()=>{if(has('powder'))dodamTrade();});
}
function dodamTrade(){
  talk([['도담','와, 도토리 가루! 나랑 바꿀 거지?',[{t:'도토리 가루 1개를 건넨다',go:()=>{
    takeItem('powder',1);G.f.dodamDone=true;ledgerDone('dodam');rel('dodam',1);
    diary('dodam','해머루는 당산나무 꼭대기에 있다. 요즘 칡덩굴이 나무를 꽁꽁 감았다고 한다.');
    talk([['도담',CLASSIC?'고마워! 해머루는 마을 끝 당산나무 꼭대기에 열려!':'고마워! 해머루는 당산나무 꼭대기에 열려!\n숲 안쪽 금줄에, 나무로 들어가는 길이 있어!'],['도담','근데 칡덩굴이 나무를 꽁꽁 감았어. 아무도 못 올라가! 곡괭이로는 안 끊길걸?'],['도담','아, 대장간 무쇠 아저씨한테 가 봐! 날 선 연장은 거기밖에 없어!']],()=>{if(!G.clues.some(c=>c.id==='d1'))dodamDad();});
  }},{t:'아직은 안 줄래',go:null}]]]);
}

/* ---------- 날쌘 (족제비 떠돌이 보부상) ---------- */
function talkNal(){
  if(!G.f.nalTalk){G.f.nalTalk=true;ledger('nal','날쌘','도토리 가루 1 + 칡뿌리 1','숯');
    talk([['날쌘','어이, 꼬마 보부상. 나도 보부상이거든? 이 동네 숯은 다 내 지게에 있지.'],['날쌘','바꿀 물건 있으면 꺼내 봐. 시시한 건 안 받아.']],nalMenu);}
  else nalMenu();
}
function nalMenu(){
  const c=[];
  if(!G.f.nalDone)c.push({t:'숯이랑 바꾸자 (도토리 가루 + 칡뿌리)',go:nalTrade});
  c.push({t:'아빠 짐의 약연을 내민다',go:nalYakyeon});
  if(!G.f.nalDone&&G.rel.nal.v===0)c.push({t:'허세 부리기: "흥, 촌구석 숯이 다 그렇지"',go:nalBluff});
  if(!CLASSIC){
    c.push({t:G.f.craftTrade_salt?'바꿔 간 소금 이야기':'칡 줄기로 소금과 깨 바꾸기',go:nalCraftSalt});
    c.push({t:'다음 장사터의 참기름을 묻는다',go:nalCraftOilHint});
  }
  c.push({t:'그만두기',go:null});
  talk([['날쌘',G.f.nalDone?'또 뭐야? 볼일 끝났으면 길 좀 비켜.':'그래서, 뭘 내놓을 건데?',c]]);
}
function nalTrade(){
  if(!(has('powder')&&has('root'))){talk([['날쌘','빈손으로 흥정부터 해? 도토리 가루 하나에 칡뿌리 하나. 가져오면 숯 하나 줄게.'],['날쌘','칡뿌리는 반짝이는 흙더미를 곡괭이로 캐 봐. 보부상이 그런 것도 몰라?']]);return;}
  takeItem('powder',1);takeItem('root',1);G.f.nalDone=true;ledgerDone('nal');
  const extra=G.rel.nal.v>0;
  addItem('coal',extra?2:1);if(extra)learn('nal:bluff-paid');
  if(Rg.arcsEnabled()&&extra){
    arcScene('galArcNal1',[['날쌘','봐. 이게 제대로 된 숯이야.'],['날쌘','하나 더 얹었어. 써 봐.'],['날쌘','꼬마가 숯 보는 눈은 아직이네.']],
      '날쌘에게 허세를 부렸더니 숯을 하나 더 얹어 주었다. 꼬마가 숯 보는 눈은 아직이라며 코웃음을 쳤다.');
    return;
  }
  talk(extra?[['날쌘','봐, 이게 제대로 된 숯이야. 하나 더 얹어 줄 테니 써 봐.'],['날쌘','써 보고도 촌구석 소리가 나오나 보자고.']]:[['날쌘','자, 숯 하나. 딱 맞게 바꾼 거야.'],['날쌘','무쇠 영감한테 줄 거야? 그 영감, 여간 까다로운 게 아닌데.']]);
}
function nalYakyeon(){
  learn('nal:yakyeon');
  clue('n1','날쌘','날쌘은 약연을 보더니 "네 아빠 거잖아"라며 받지 않았다. 떠돌이 보부상들도 아빠를 안다.');
  talk([['날쌘','…이거 네 아빠 거잖아. 안 받아.'],['날쌘','남의 집 가업 잇는 물건까지 받았다간 장사 끝이야. 도로 넣어 둬.'],['날쌘','네 아빠는… 됐어. 갈 길이나 가.']]);
}
function nalBluff(){
  rel('nal',1);
  talk([['너구리','흥, 촌구석 숯이 다 그렇지.'],['날쌘','뭐? 촌구석?'],['날쌘','꼬마 보부상이 말은 잘하네. 바꿔 가 봐. 내 숯이 어떤지 보여 줄 테니까.']],nalMenu);
}

/* 선택 재료 수량은 trades.csv의 t_craft_salt 그대로다. 필수 교환과 별개로 한 번만 바꾼다. */
function nalCraftSalt(){
  if(G.f.craftTrade_salt){talk([['날쌘','소금 종지랑 깨는 아까 줬잖아.\n묵을 쑤든, 깨랑 찧든 네 솜씨껏 써.']]);return;}
  ledger('t_craft_salt','날쌘','칡 줄기 1','소금 2 + 깨 1');
  if(!has('vine')){
    talk([['날쌘','바구니 엮을 칡 줄기 하나면\n소금 두 종지에 깨 한 봉지. 한 번만 바꾸자.'],
      ['날쌘','억지로 뜯을 건 없어. 당산나무 칡이 풀리면\n뿌리 곁에도 줄기가 놓일 테니까.']]);return;
  }
  talk([['날쌘','질긴 줄기네. 이걸로 바구니 테를 엮으면 되겠어.\n소금 두 종지랑 깨 한 봉지, 바꿀래?',[
    {t:'칡 줄기 1개를 건넨다',go:()=>{
      if(G.f.craftTrade_salt||!has('vine'))return;
      takeItem('vine',1);addItem('salt',2);addItem('sesame',1);G.f.craftTrade_salt=true;ledgerDone('t_craft_salt');
      talk([['날쌘','가루에 소금 넣고 묵 쑤는 건 알지?\n깨도 볶아 놨으니, 소금이랑 같이 찧어 봐.']]);
    }},{t:'줄기는 더 살펴보고 올게',go:null}]]]);
}
function nalCraftOilHint(){
  // t_craft_oil의 원래 지역과 재료를 유지한다. 단풍골에서 억새를 요구하지 않는다.
  talk([['날쌘','참기름은 돌너머에서 풀 거야.\n여기서는 소금이랑 깨만 바꾼다.'],
    ['날쌘','그쪽 마른 억새 하나면 기름 한 병.\n둥지 지을 녀석 몫은 먼저 남겨 둬.']]);
}

/* ---------- 무쇠 (오소리 대장장이) ---------- */
function talkMusoe(){
  if(!Rg.arcsEnabled()){musoeMain();return;}
  const F=G.f,c=[{t:F.musoeDone?'낫 이야기하기':'낫과 시험 이야기하기',go:musoeMain}];
  if(!F.musoeTested&&!F.musoeDone&&!F.galArcMusoe1)c.push({t:'아빠의 낫을 보여 달라고 한다',go:musoePromise});
  if((F.musoeTested||F.musoeDone)&&!F.galArcMusoe2)c.push({t:'아빠가 묵던 밤 이야기를 묻는다',go:musoeNight});
  if(F.galArcMusoe2&&!F.galArcMusoe3&&(has('coal',2)||(F.musoeDone&&G.sharp)))c.push({t:'넉넉히 챙긴 숯 이야기를 한다',go:musoeOldHandle});
  if(c.length===1){musoeMain();return;}
  c.push({t:'다음에 올게요',go:null});
  talk([['무쇠','무슨 일이냐.',c]]);
}
function musoePromise(){
  if(G.f.musoeTested||G.f.musoeDone)return;
  arcScene('galArcMusoe1',[['너구리','아빠 낫, 볼 수 있어요?'],['무쇠','아직 안 된다.'],
    ['무쇠','네 아비가 맡기며 당부했다.'],['무쇠','조심성부터 봐 달라더군.'],['무쇠','되치기는 없다. 피하는 걸 본다.']],
    '무쇠 아저씨는 아빠가 조심성부터 봐 달라며 낫을 맡겼다고 했다. 낫은 시험을 통과한 뒤에 내준다고 한다.');
}
function musoeNight(){
  if(!G.f.musoeTested&&!G.f.musoeDone)return;
  arcScene('galArcMusoe2',[['너구리','아빠가 여기서 잤어요?'],['무쇠','지난가을. 사흘 묵었다.'],
    ['무쇠','밤마다 뭘 들여다봤다.'],['무쇠','그 얘긴 말 말라더군.'],['무쇠','내가 벌써 반은 어겼군.']],
    '지난가을 아빠는 대장간에서 사흘 묵으며 밤마다 무언가 들여다봤다. 무쇠 아저씨는 말하지 않기로 한 약속을 반만 깼다.',
    ()=>clue('m2','무쇠','지난가을 아빠는 대장간에서 사흘 묵으며 밤마다 무언가 들여다봤다. 그 이야기는 하지 말라고 무쇠에게 부탁했다.'));
}
function musoeOldHandle(){
  if(!G.f.galArcMusoe2||!(has('coal',2)||(G.f.musoeDone&&G.sharp)))return;
  arcScene('galArcMusoe3',[['무쇠','숯을 넉넉히 챙겼군.'],['무쇠','이 자루 봐라. 네 아비 젊을 적 거다.'],
    ['너구리','그때도 낫을 벼려 주셨어요?'],['무쇠','그래. 그때도 앞만 보더니.'],['너구리','이번엔 살필게요.']],
    '무쇠 아저씨가 아빠의 젊은 시절 낫 자루를 꺼내 보여 주었다. 지난가을 맡긴 낫보다 훨씬 오래된 물건이다.');
}
function musoeMain(){
  const F=G.f;
  if(!F.musoeMet){F.musoeMet=true;
    talk([['무쇠','뭘 보냐. 대장간은 놀이터가 아니다.'],['무쇠','…잠깐. 그 모자.'],['무쇠','너, 그 떠돌이 너구리 아들이냐.',[{t:'우리 아빠 알아요?',go:musoe2}]]]);
  }else if(!F.musoeTested&&!F.musoeDone){
    talk([['무쇠','숨 골랐냐. 낫 쥘 자격이 있으면 다시 버텨 봐라.',[{t:'다시 해 볼게요',go:battleMusoe},{t:'조금 이따가요',go:null}]]]);
  }else if(!F.musoeDone){
    if(has('coal'))talk([['무쇠','숯 가져왔군. 불 올린다.'],['무쇠','주황빛 남았을 때 쳐라. 식으면 다시 달궈라.']],openForge);
    else talk([['무쇠','숯부터 가져와라. 숯 없인 낫 못 벼린다.'],['무쇠',CLASSIC?'물레방아 쪽 날쌘이 녀석한테 가 봐라. 숯을 쟁여 놨을 거다.':'오른쪽 좌판에 날쌘이 있다.\n숯을 쟁여 놨을 거다.']]);
  }else talk([['무쇠','낫은 손에 익었냐. 네 아비는 그걸로 덩굴을 잘도 쳐냈다.']]);
}
function musoe2(){
  clue('m1','무쇠','아빠는 무쇠에게 낫을 맡기고, 찾으러 오지 않았다.');
  diary('musoe','대장장이 무쇠 아저씨가 아빠의 모자를 알아봤다. 아빠가 맡겨 둔 낫이 있다고 한다. 그런데 갑자기 덤벼들었다.');
  talk(Rg.arcsEnabled()?
    [['무쇠','안다. 낫을 맡기고 갔다.'],['무쇠','조심성부터 보라더군. 네 아비가.'],['무쇠','되치기는 없다. 피해 봐라.']]:
    [['무쇠','안다. 낫을 맡기고 갔지. 금방 찾으러 온다더니 소식이 없다.'],['무쇠','주인 아니면 안 내준다. …아들이라고?'],['무쇠','말로야 누가 못 하냐. 그 낫 쥘 자격이 있는지 버텨 봐라!']],battleMusoe);
}
function battleMusoe(){
  const n=Rg.npcs.find(n=>n.id==='musoe');
  inkTransition('전투',(n.x-G.cam)/W*100,()=>startBattle('musoe',(res,info)=>{
    if(res==='lose'||res==='flee'){talk([['무쇠','아직 멀었다. 숨 고르고 다시 와라.']]);return;}
    const perfect=res==='win'&&info.hits===0;
    G.f.musoeTested=true;rel('musoe',(res==='calm'||perfect)?2:1);ledger('musoe','무쇠','숯 1','아빠가 맡긴 낫');
    if(typeof grantTool==='function')grantTool('pickaxe');
    diary('test',res==='calm'?'무쇠 아저씨에게 먹을 것을 건네 마음을 풀었다. 아빠도 이렇게 했을까.':'무쇠 아저씨가 꿀밤으로 연장부터 빼앗고 덤볐다. 끝까지 피해서 시험을 통과했다.');
    talk([['무쇠',res==='calm'?'…됐다. 배부터 채웠으니 고집은 그만 부리마.':perfect?'허, 한 대도 안 맞았군. 그 녀석 아들 맞다.':'끝까지 버티는 건 네 아비를 닮았군.'],['무쇠','연장은 도로 가져가라. 이 곡괭이도 덤이다.\n돌 만날 때 써라.'],['무쇠','의리는 지켜야지. 낫은 내주마.'],['무쇠','다만 녹이 슬었다. 벼릴 숯이 마침 떨어졌으니 가져와라.']],()=>{if(has('coal'))talkMusoe();});
  }));
}

/* 대장간: 식기 전 세 번 벼린다. 놓쳐도 횟수·숯은 그대로, 같은 버튼으로 다시 달군다. */
const forge={heat:MG.forge_heat,hits:0,miss:0,edge:0,phase:'cold',wait:0,impact:0,particles:[]};
const forgeWords={
  start:['쇠빛 봐라. 손에 힘 빼고.','서두르지 마라. 쇠빛부터 봐라.','불은 내가 본다. 넌 망치 들어라.'],
  good:['그렇지. 힘 빼고 박자 맞춰라.','제법이군. 그대로 쳐라.','허, 망치 쥔 꼴은 봐줄 만하군.'],
  danger:['주황빛 꺼진다. 지금 쳐라!','다 식는다. 어서 내려쳐라.','주저하지 마라. 아직 칠 만하다.'],
  fail:['식었다. 다시 달궈라. 숯은 더 안 든다.','쇠야 다시 달구면 된다. 다시 해라.','낫은 내준다. 다시 해 봐라.'],
  edge:['딱 맞췄군. 간도 크다.','허, 식기 직전에 쳤군.','네 아비도 꼭 그렇게 쳤다.']
};
let forgeCanvas,forgeHeatLabel;
function forgeSay(kind){
  const lines=forgeWords[kind],last=forge.lastLine;
  const choices=lines.filter(t=>t!==last);
  forge.lastLine=choices[Math.floor(Math.random()*choices.length)];
  $('fhint').textContent='무쇠: “'+forge.lastLine+'”';
}
function forgeFloor(){return forge.miss>=MG.forge_help_misses?MG.forge_help_floor:MG.forge_floor;}
function prepareForge(){
  if(forgeCanvas)return;
  forgeCanvas=el('canvas');forgeCanvas.width=520;forgeCanvas.height=110;
  forgeCanvas.style.cssText='width:100%;height:clamp(65px,13vh,110px);display:block;border-radius:3px';
  forgeCanvas.setAttribute('aria-label','모루 위에서 빨강, 주황, 거무스름하게 식는 쇠와 망치');
  $('forge').insertBefore(forgeCanvas,$('fbar'));
  forgeHeatLabel=el('div');forgeHeatLabel.style.cssText='font-size:.9em;min-height:1.4em';
  $('forge').insertBefore(forgeHeatLabel,$('fbar'));
  $('fhint').setAttribute('aria-live','polite');
}
function openForge(){
  prepareForge();
  Object.assign(forge,{heat:MG.forge_heat,hits:0,miss:0,edge:0,phase:'hot',wait:0,impact:0,particles:[],warned:false,owner:G});
  $('forgeTitle').textContent='대장간 · 아빠의 낫 벼리기';$('forge').hidden=false;
  forgeSay('start');drawForge();
}
function drawForge(){
  const floor=forgeFloor(),edge=forge.phase==='hot'&&forge.heat<=floor+MG.forge_edge_width;
  $('fbar').style.background='linear-gradient(90deg,#302c2b '+floor+'%,#d67a2d '+(floor+MG.forge_edge_width)+'%,#d74425 100%)';
  $('fzone').style.left=floor+'%';$('fzone').style.width=MG.forge_edge_width+'%';
  $('fmark').style.left=forge.heat+'%';
  forgeHeatLabel.textContent=forge.phase==='cold'?'식었다 · 다시 달구기 (숯 추가 소모 없음)':
    forge.phase==='done'?'벼리기 끝!'+(forge.edge>=MG.forge_bonus_edges?' · 무쇠의 인정 +'+MG.forge_bonus_relation:''):
    '남은 열 '+Math.ceil(forge.heat)+'% · '+(edge?'아슬아슬! 금빛 칸에서 치면 큰 불똥':'빛이 남아 있으면 성공 · 금빛 칸은 식기 직전')+(forge.miss>=MG.forge_help_misses?' · 천천히 식도록 도움':'');
  $('fstrike').innerHTML=(forge.phase==='cold'?'다시 달구기':forge.phase==='done'?'벼리기 끝':forge.wait>0?'다시 달구는 중':'내려치기')+' <kbd>Space · J</kbd>';
  $('fstrike').disabled=forge.wait>0||forge.phase==='done';
  $('fpips').innerHTML=Array.from({length:MG.forge_hits},(_,i)=>'<span class="pip'+(i<forge.hits?' on':'')+'"></span>').join('');
  const c=forgeCanvas.getContext('2d');if(!c)return;
  c.clearRect(0,0,520,110);c.fillStyle='#29231f';c.fillRect(0,0,520,110);
  c.save();
  const kick=forge.impact?Math.sin(forge.impact*2)*forge.impact/5:edge?Math.sin(forge.heat*3):0;
  c.translate(kick,0);
  c.fillStyle='#514a43';c.fillRect(195,74,130,12);c.fillRect(230,86,60,12);c.fillRect(216,98,88,8);
  const h=Math.max(0,Math.min(1,(forge.heat-floor)/(MG.forge_heat-floor)));
  const color=forge.heat<floor?'#45403c':h>.45?'rgb(225,'+Math.round(60+(1-h)*70)+',37)':'rgb('+Math.round(110+h*240)+','+Math.round(65+h*110)+',38)';
  c.shadowColor=color;c.shadowBlur=forge.heat>=floor?8+h*16:0;c.fillStyle=color;
  c.fillRect(210,62,100,10);c.fillRect(305,57,20,8);c.shadowBlur=0;
  c.save();c.translate(285,forge.impact?35+forge.impact:23);c.rotate(forge.impact?-.35:-.8);
  c.fillStyle='#92633f';c.fillRect(-3,-4,7,44);c.fillStyle='#b4aca0';c.fillRect(-19,-12,37,18);c.restore();
  forge.particles.forEach(p=>{c.globalAlpha=p.life/p.max;c.fillStyle=p.color;c.fillRect(p.x,p.y,p.size,p.size);});
  c.restore();
}
function forgeStep(){
  if(forge.owner!==G||$('forge').hidden)return;
  if(forge.impact>0)forge.impact--;
  forge.particles=forge.particles.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.13;return --p.life>0;});
  if(forge.wait>0){
    if(--forge.wait===0){
      if(forge.phase==='done'){finishForge();return;}
      forge.phase='hot';forge.heat=MG.forge_heat;
    }
  }else if(forge.phase==='hot'){
    const floor=forgeFloor();forge.heat=Math.max(0,forge.heat-(forge.miss>=MG.forge_help_misses?MG.forge_help_cooling:MG.forge_cooling));
    if(forge.heat<floor){forge.phase='cold';forge.heat=0;forge.miss++;forgeSay('fail');}
    else if(forge.heat<=floor+MG.forge_edge_width&&!forge.warned){forge.warned=true;forgeSay('danger');}
  }
  drawForge();
}
function strike(){
  if($('forge').hidden||forge.owner!==G||forge.wait>0||forge.hits>=MG.forge_hits)return;
  if(forge.phase==='cold'){
    Sound.forge('cold');forge.phase='hot';forge.heat=MG.forge_heat;forge.warned=false;forgeSay('start');drawForge();return;
  }
  const edge=forge.heat<=forgeFloor()+MG.forge_edge_width;
  forge.hits++;if(edge)forge.edge++;
  Sound.forge(edge?'edge':'hit');forgeSay(edge?'edge':'good');
  forge.impact=edge?20:10;
  for(let i=0;i<(edge?38:12);i++){
    const life=18+Math.random()*16;
    forge.particles.push({x:260,y:62,vx:(Math.random()-.5)*(edge?12:6),vy:-2-Math.random()*(edge?6:3),life,max:life,size:edge?3:2,color:i%3?'#ffc45c':'#fff2b0'});
  }
  forge.phase=forge.hits>=MG.forge_hits?'done':'reheat';forge.wait=forge.hits>=MG.forge_hits?MG.forge_finish_wait:MG.forge_reheat_wait;forge.warned=false;
  drawForge();
}
$('fstrike').addEventListener('pointerdown',e=>{e.preventDefault();strike();});
$('fstrike').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();}});
$('fbar').addEventListener('pointerdown',e=>{e.preventDefault();strike();});
defineMinigame({id:'forge',step:forgeStep,hit:strike});
function finishForge(){
  if(forge.owner!==G||G.f.musoeDone||forge.hits<MG.forge_hits)return;
  $('forge').hidden=true;
  takeItem('coal',1);
  let sharp=false;if(has('coal')){takeItem('coal',1);sharp=true;}
  G.tool='sickle';G.sharp=sharp;G.f.musoeDone=true;learn('musoe:forge');ledgerDone('musoe');rel('musoe',MG.forge_relation);
  if(forge.edge>=MG.forge_bonus_edges)rel('musoe',MG.forge_bonus_relation);
  diary('sickle','아빠의 낫을 받았다. 손잡이에 아빠 손때가 묻어 있다.');
  if(!Rg.arcsEnabled())clue('m2','무쇠','아빠는 대장간에서 사흘을 묵으며 밤마다 낡은 장부만 들여다봤다.');
  toast('아빠의 낫을 얻었다!'+(sharp?' 날이 더 날카롭다':''));
  refreshHud();
  talk(Rg.arcsEnabled()?
    [['무쇠','됐다. 네 아비 낫이다.'],['무쇠',sharp?'숯이 넉넉해서 날을 더 세웠다.':'덩굴은 그걸로 끊어라.'],['무쇠','당산나무 앞 칡은 조심해라.']]:
    [['무쇠','됐다. 네 아비 낫이다.'+(sharp?' 숯이 넉넉해서 날을 더 세웠다.':'')],['무쇠','그 녀석, 여기서 사흘 묵었다. 밤마다 낡은 장부만 보더군. 뭘 찾는지는 끝내 말 안 했다.'],['무쇠','덩굴은 그걸로 끊어라. 당산나무 앞 칡은 성질 고약하다. 조심해라.']]);
}

/* ---------- 두꺼비 할멈 (약재상) ---------- */
function talkToad(){
  if(G.diary.some(d=>d.id==='end')){toadFarewell();return;}
  if(Rg.arcsEnabled()&&G.f.galArcToad1){toadFarewell();return;}
  if(has('meoru')){
    talk(Rg.arcsEnabled()?
      [['두꺼비 할멈','해머루구나. 잘 익었어.'],['두꺼비 할멈','이걸로 네 엄마 약을 달이마.'],
        ['두꺼비 할멈','까치 편에 집으로 보내 주마.'],['두꺼비 할멈','병을 늦출 뿐이란다.'],['두꺼비 할멈','고치려면 전설의 열매가 있어야 해.']]:
      [['두꺼비 할멈','해머루구나. …잘 익었구나.'],['두꺼비 할멈','이걸로 약을 달이면 네 엄마 병을 조금 늦출 수 있을 게다. 까치 편에 보내마.'],['두꺼비 할멈','다만 늦출 뿐이란다. 고치려면 전설의 열매가 있어야 한단다.'],['두꺼비 할멈','덩굴이 걷혔으니 북쪽 길도 열렸겠구나. 네 아빠도 그 길로 갔단다.']],()=>{
      takeItem('meoru',1);ledgerDone('toad');rel('toad',1);
      diary('end','할멈이 엄마에게 약을 보내 주었다. 북쪽 길이 열렸다. 아빠, 기다려요.');
      if(Rg.arcsEnabled()){
        G.f.galArcToad1=true;
        diary('galArcToad1','두꺼비 할멈이 해머루로 엄마의 병을 늦추는 약을 지어 까치 편에 보냈다.');
        toadFarewell();return;
      }
      toadFarewell();
    });
    return;
  }
  if(!G.f.toadMet){G.f.toadMet=true;rel('toad',1);
    ledger('toad','두꺼비 할멈','해머루 1','엄마의 병을 늦추는 약');
    clue('t1','두꺼비 할멈','아빠도 할멈에게 전설의 열매를 묻고 북쪽으로 갔다.');
    diary('toad','두꺼비 할멈은 엄마의 병을 고칠 수는 없지만 늦출 수는 있다고 했다. 해머루가 필요하다.');
    talk([['두꺼비 할멈','어서 오렴, 꼬마 보부상. 네 엄마 소식은 바람결에 들었단다. 말을 잃어 간다지.'],
      ['두꺼비 할멈','그건… 병이라기보다는…'],['두꺼비 할멈','…아니다. 내가 늙어서 헛말이 나오는구나.'],
      ['두꺼비 할멈','내 손으로 고치진 못해도 병을 늦출 수는 있단다. 당산나무 꼭대기 해머루를 가져오렴.'],
      ['두꺼비 할멈','전설의 열매라… 남들은 부자가 된다지만, 나는 잃어버린 걸 돌려준다고 들었단다.'],
      ['두꺼비 할멈','네 아빠도 그 열매를 묻더니 북쪽으로 갔단다.'],
      ['두꺼비 할멈','…그 보따리 속 약연. 그건 아직 네가 쓸 때가 아니구나.']]);
  }else talk([['두꺼비 할멈','해머루를 가져오렴. 당산나무 꼭대기란다.']]);
}
function toadFarewell(){
  const F=G.f,c=[{t:'북쪽으로 떠난다',go:endGame}];
  if(Rg.arcsEnabled()&&!F.galArcToad2&&G.rel.toad.v>=1)c.push({t:'엄마도 이 길을 갔는지 묻는다',go:toadWinter});
  if(Rg.arcsEnabled()&&F.galArcToad2&&!F.galArcToad3)c.push({t:'떠나기 전에 인사를 드린다',go:toadWrap});
  if(!knows('home:'+Rg.id))for(const item of ['acorn_jelly','sesame_salt'])if(has(item))
    c.push({t:ITEMS[item].n+'을 까치 편에 보낸다',go:()=>galSendHome(item)});
  c.push({t:'마을을 좀 더 둘러본다',go:null});
  talk([['두꺼비 할멈','북쪽으로 갈 채비는 됐니?',c]]);
}
// 새 엔진과 합치기 전에도 기존 가공품 배달로 한 번만 보낸다. 약 배달과는 별개다.
const homeReplies={
  acorn_jelly:'빈 묵 그릇에 엄마가 늘 쓰던 나무숟가락이 얹혀 돌아왔다. 숟가락 손잡이를 쥐어 봤다.',
  sesame_salt:'엄마가 깨소금 종지를 두 손으로 감싸 코끝에 댔다고, 까치가 날개를 모아 보여 주었다.'
};
Rg.homeReply=homeReplies.acorn_jelly;
function galSendHome(item){
  if(knows('home:'+Rg.id)||!has(item))return;
  Rg.homeReply=homeReplies[item];
  if(typeof sendHomeGift==='function'){sendHomeGift(Rg.id,item);return;}
  if(typeof sendCraftHome==='function'){
    sendCraftHome(item);
    const entry=G.diary.find(d=>d.id==='home:'+Rg.id);
    if(entry){
      entry.text=ITEMS[item].n+' 하나를 까치 편에 집으로 보냈다. '+Rg.homeReply;
      talk([['너구리',ITEMS[item].n+' 하나야. 엄마한테 내가 만들었다고 전해 줘.'],['너구리',Rg.homeReply]]);
    }
  }
}
function toadWinter(){
  if(!G.f.galArcToad1||G.rel.toad.v<1)return;
  arcScene('galArcToad2',[['너구리','엄마도 이 길을 갔어요?'],['두꺼비 할멈','너를 안고 지나갔지.'],
    ['두꺼비 할멈','눈 내리던 겨울이었단다.'],['두꺼비 할멈','불가에서 너를 꼭 안고 있었어.'],
    ['너구리','엄마가요?'],['두꺼비 할멈','늙으면 말이 느려지지… 기억은 나.']],
    '두꺼비 할멈은 내가 아기였던 겨울, 엄마가 나를 안고 이 길을 지났다고 했다.',null,toadFarewell);
}
function toadWrap(){
  if(!G.f.galArcToad2)return;
  arcScene('galArcToad3',[['두꺼비 할멈','이 끈도 가져가렴.'],['두꺼비 할멈','그 겨울, 네 포대기에 매던 거야.'],
    ['너구리','엄마가 두고 갔어요?'],['두꺼비 할멈','그래. 내내 간직했단다.'],['너구리','엄마한테 가져갈게요.']],
    '두꺼비 할멈에게 그 겨울 엄마가 두고 간 포대기 끈을 받았다. 엄마에게 가져가려고 조심히 챙겼다.',
    ()=>learn('galchamgol:arc-toad-wrap'),toadFarewell);
}

/* ---------- 엉킨 칡 전투 ---------- */
Rg.startKudzu=()=>{
  G.px=1950;
  inkTransition('전투',(G.boss.x-G.cam)/W*100,()=>startBattle('kudzu',res=>{
    if(res==='win'||res==='calm'){
      if(res==='calm')diary('calm','엉킨 칡을 부수지 않고 달랬다. 칡이 놓아준 자리에 보랏빛 꽃이 피어 있었다.');
      Rg.bossDie();
    }else{
      G.px=1900;G.f.faints+=res==='lose'?1:0;
      diary('hint','엉킨 칡은 부위마다 공격이 다르다. 덩굴손이나 뿌리를 먼저 꺾어야 심이 드러난다. 버섯 향을 좋아하는 것 같다.');
      toast('일기에 공략을 적어 두었다. 준비되면 다시 다가가자');
    }
  }));
};

/* ---------- NPC (npcs.csv 의 id). x 는 필드 위치 ---------- */
Rg.npcs=[
  {id:'dodam',name:'도담',x:300,talk:talkDodam,draw:Rg.art.squirrel},
  {id:'nal',name:'날쌘',x:820,talk:talkNal,draw:COMMON_ART.weasel,props:COMMON_ART.nalProps},
  {id:'musoe',name:'무쇠',x:1110,talk:talkMusoe,draw:Rg.art.badger,props:Rg.props.forge},
  {id:'toad',name:'두꺼비 할멈',x:1430,talk:talkToad,draw:Rg.art.toad,props:Rg.props.toad},
];

/* ---------- 지금 할 일 ---------- */
Rg.goal=()=>{
  const F=G.f;
  if(!G.started)return '';
  if(G.ended)return '단풍골 체험판 완료';
  if(G.diary.some(d=>d.id==='end')||(Rg.arcsEnabled()&&F.galArcToad1))return '두꺼비 할멈에게 인사하고 북쪽으로 떠나기';
  if(!F.dodamTalk)return '마을 어귀의 다람쥐 도담에게 말 걸기';
  const ac=G.inv.acorn||0;
  const powderStep=()=>has('powder')?null:(ac<3?'도토리 줍기 ('+ac+'/3)':'보따리를 열고 엄마의 절구에 도토리 3개 넣어 빻기');
  if(!F.dodamDone)return powderStep()||'도담에게 도토리 가루 건네기';
  if(!F.musoeMet)return '물레방아 너머 대장간의 무쇠 찾아가기';
  if(!F.musoeTested&&!F.musoeDone)return '무쇠의 시험 통과하기 (다시 말 걸기)';
  if(!F.musoeDone){
    if(has('coal'))return '무쇠에게 숯 가져가기';
    if(!F.nalTalk)return '물레방아 옆 족제비 날쌘에게 숯 구하기';
    const p=powderStep();if(p)return p;
    if(!has('root'))return '반짝이는 흙더미를 휘둘러 칡뿌리 캐기';
    return '날쌘에게 도토리 가루와 칡뿌리 건네기';
  }
  if(!G.barrier.cut)return '마을 끝 칡덩굴을 낫으로 끊기';
  if(!G.boss.dead)return '당산나무의 엉킨 칡과 맞서기 (부수거나 달래기)';
  if(G.drop)return '떨어진 해머루 줍기';
  return '두꺼비 할멈에게 해머루 가져가기';
};

/* PA-43: 첫 가을의 길손과 조사. classic은 위의 지도와 대사를 그대로 쓴다. */
if(!CLASSIC){
  /* 채집의 왕복 바늘과 절구의 손동작을 짧게 재사용한다. 소모품·실패 비용은 없다.
     진행한 손동작만 G.f에 둬서 중단·저장 뒤 같은 자리에서 이어 할 수 있다. */
  const hp=el('section');hp.id='galHands';hp.hidden=true;
  hp.setAttribute('role','dialog');hp.setAttribute('aria-label','함께 손쓰기');
  hp.style.cssText='position:absolute;inset:8% 6%;z-index:7;padding:18px;background:#f2dfb8;color:#493822;border:3px solid #805b36;overflow:auto;text-align:center';
  const ht=el('h2'),hh=el('p'),hc=el('canvas'),hm=el('div'),hz=el('span'),hn=el('span'),hs=el('p'),hb=el('button','btn primary'),hl=el('button','btn','왼쪽 바구니'),hr=el('button','btn','오른쪽 바구니'),hx=el('button','btn','잠깐 쉬기');
  hc.width=400;hc.height=120;hc.style.cssText='width:100%;max-width:600px;image-rendering:pixelated';
  hm.style.cssText='position:relative;height:20px;background:#b29b73;margin:12px 0';
  hz.style.cssText='position:absolute;top:0;height:100%;background:#78925b';
  hn.style.cssText='position:absolute;top:-3px;width:4px;height:26px;background:#49301d';
  hm.append(hz,hn);hb.id='galHandsHit';hx.id='galHandsClose';hl.id='galHandsLeft';hr.id='galHandsRight';
  for(const b of [hb,hl,hr,hx])b.type='button';
  hp.append(ht,hh,hc,hm,hs,hb,hl,hr,hx);$('shell').appendChild(hp);
  let hand=null;
  function hands(title,kind,steps,commit,sort=false){
    if(hand||G.ended)return;
    const saved=G.f.galHandsProgress?.[kind]||0;
    hand={owner:G,kind,steps,commit,sort,hits:Math.min(saved,steps.length-1),pos:0,dir:1,miss:0,cool:0};
    hp.dataset.kind=kind;ht.textContent=title;
    // 조작은 실제 입력 이름으로 안내한다. 움직임 줄이기에서는 바늘을 가운데 둔다.
    hh.textContent=sort?'큰 것부터 양쪽에 번갈아 놓자. 바구니를 누르거나 '+HITKEY+'로 놓기.':'밝은 자리에서 '+HITKEY+' · 놓쳐도 그대로, 쉬었다 이어 해도 돼.';
    hb.textContent=sort?'다음 바구니에 놓기'+(TOUCH?'':' · J / Space'):'손 맞추기'+(TOUCH?'':' · J / Space');
    hl.hidden=hr.hidden=!sort;hm.hidden=sort;hp.hidden=false;releaseInputs();drawHands();
  }
  function closeHands(){hp.hidden=true;hand=null;releaseInputs();}
  function handHit(side){
    const a=hand;if(!a||a.owner!==G||G.region!==Rg.id){closeHands();return;}
    if(a.cool>0)return;
    a.cool=MG.gather_cooldown;
    if(a.sort&&side!==undefined&&side!==a.hits%2){hh.textContent='이번에는 '+(a.hits%2?'오른쪽':'왼쪽')+' 바구니. 한쪽에만 큰 게 쌓이지 않게.';return;}
    const width=MG.gather_root_width+(a.miss>=MG.gather_help_misses?MG.gather_help_width:0);
    if(!a.sort&&!Vfx.reducedMotion&&Math.abs(a.pos-50)>width/2){
      a.miss++;hh.textContent='손을 잠깐 멈추자. 밝은 자리에서 다시 맞추면 돼.';drawHands();return;
    }
    Sound.gather(true);a.hits++;
    (G.f.galHandsProgress||(G.f.galHandsProgress={}))[a.kind]=a.hits;
    if(a.hits===a.steps.length){
      delete G.f.galHandsProgress[a.kind];const commit=a.commit;closeHands();commit();refreshHud();return;
    }
    a.pos=0;a.dir=1;drawHands();
  }
  hb.onclick=()=>handHit();hl.onclick=()=>handHit(0);hr.onclick=()=>handHit(1);hx.onclick=closeHands;
  hp.addEventListener('keydown',e=>{
    if((e.key==='Enter'||e.key===' ')&&e.target instanceof HTMLButtonElement){
      e.preventDefault();e.stopPropagation();if(!e.repeat)e.target.click();
    }
  });
  function drawHands(){
    const a=hand;if(!a)return;
    hs.textContent=(a.hits+1)+' / '+a.steps.length+' · '+a.steps[a.hits];
    const width=MG.gather_root_width+(a.miss>=MG.gather_help_misses?MG.gather_help_width:0);
    hz.style.left=(50-width/2)+'%';hz.style.width=width+'%';hn.style.left=a.pos+'%';
    hp.dataset.pos=a.pos;hp.dataset.hits=a.hits;hp.dataset.target=width;
    const c=hc.getContext('2d');c.clearRect(0,0,400,120);c.fillStyle='#d3bd90';c.fillRect(0,88,400,32);
    const box=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
    if(a.sort){
      for(let i=0;i<2;i++){box(65+i*230,65,45,24,'#9d7041');box(62+i*230,62,51,5,'#65452b');}
      for(let i=0;i<a.steps.length;i++){const placed=i<a.hits,x=placed?78+(i%2)*230+(i>1?12:0):175+i*14,y=placed?57:72;box(x,y,9,10,'#b37b3c');box(x-1,y-2,11,4,'#65452b');}
    }else if(a.kind.startsWith('lamp')){
      box(173,20,54,65,'#6c6947');box(179,26,42,50,'#c2b374');
      for(let i=0;i<=a.hits;i++){const x=194+(i%2)*15,y=37+Math.floor(i/2)*19;box(x-3,y-3,8,8,'#e5db80');box(x,y,2,2,'#fff7b7');}
      box(140,73,30,8,'#94633e');box(147,68,13,5,'#bf915c');
    }else if(a.kind==='magpie'){
      box(135,55,130,32,'#8d6354');box(145,47,110,8,'#bb8b6c');box(196,45,7,44,'#ecd7a7');box(186,39,27,7,'#ecd7a7');
    }else{
      c.strokeStyle='#79512c';c.lineWidth=6;c.beginPath();c.arc(200,51,37,0,Math.PI*2);c.stroke();
      for(let i=0;i<6;i++){const p=i*Math.PI/3;c.beginPath();c.moveTo(200,51);c.lineTo(200+Math.cos(p)*37,51+Math.sin(p)*37);c.stroke();}
      box(155,91,92,5,'#668886');
      for(let i=a.hits;i<a.steps.length;i++)box(148+i*22,91,12,4,'#a66d37');
    }
    // 도구를 쥐지 않은 너구리 앞발. 맞춘 뒤에는 잡을 자리가 하나씩 옮겨진다.
    box(113+a.hits*9,84,22,12,'#926a44');box(112+a.hits*9,80,24,7,'#b58957');
    box(264-a.hits*9,84,22,12,'#926a44');box(263-a.hits*9,80,24,7,'#b58957');
  }
  defineMinigame({id:hp.id,hit:()=>handHit(),step:()=>{
    const a=hand;if(!a)return;
    if(a.owner!==G||G.region!==Rg.id){closeHands();return;}
    if(a.cool>0)a.cool--;
    a.pos=Vfx.reducedMotion?50:clamp(a.pos+a.dir*MG.gather_root_speed,0,100);
    if(a.pos===100)a.dir=-1;else if(a.pos===0)a.dir=1;drawHands();
  }});
  const done=id=>!!G.f.wanderersDone?.['galchamgol:'+id];
  const picture=name=>(x,y,f)=>Rg.expArt[name](x,y,f);
  function magpieTalk(){
    talk([['늙은 까치','약방에 들렀다 집집마다 돌아가려던 참이란다.\n개울바람에 빈 약보자기까지 펄럭이는구나.'],
      ['늙은 까치','무거운 짐은 날개로 들지만, 매듭은 발로 묶지.\n바람에 자꾸 풀리니 잠깐 누가 눌러 주면 좋겠는데.'],
      ['너구리','내가 잡을게요.\n엄마 약도 이 보자기에 싸나요?'],
      ['늙은 까치','그래. 할멈이 약을 달이면 내가 집으로 나르지.\n네가 길에 있어도 약은 집에 닿을 거란다.',[
        {t:'두 손으로 보자기를 눌러 드린다',go:()=>hands('까치의 약보자기','magpie',[
          '보자기 왼쪽 귀를 누른다','반대쪽 귀도 겹쳐 잡는다','까치가 묶을 손잡이를 남긴다'],()=>talk([
          ['너구리','(바람이 빠져나갈 틈을 남겨 두고 누른다.)\n이렇게 잡으면 매듭이 보이겠죠?'],
          ['늙은 까치','잘 잡았다. 납작하게 싸야 날다가도 안 흔들려.\n이 매듭은 손잡이처럼 남겨 두고.'],
          ['늙은 까치','물레방아 옆 함지박도 물살만 잘 받으면 뜬단다.\n개울 위 당산나무를 봐 두렴. 나중에 그리 갈 테니.'],
          ['너구리','엄마가 기다리면,\n길을 잘 보고 있다고 전해 주세요.']
        ],()=>{
          diary('galExpMagpie','늙은 까치가 약보자기를 묶는 동안 두 손으로 눌러 드렸다. 약은 까치가 집으로 나른다. 나는 당산나무로 가는 길을 살핀다.');
          finishWanderer('old_magpie');
        }))},{t:'바람이 잦아들면 도와드릴게요',go:null}]]]);
  }
  function brothersTalk(){
    const sorted=G.f.galExpBrothersSorted;
    if(G.f.galExpBrothersAsked&&sorted){
      talk([['다람쥐 형제','형: 큰 것부터 번갈아 놓으니 양쪽이 비슷하네.\n동생: 내 몫이 적다고만 생각했는데!'],
        ['너구리','한 바구니에 담고,\n겨울에 같이 먹으면?'],
        ['다람쥐 형제','형: 그럼 내가 숨긴 자리를 적어 둘게.\n동생: 난 덮어 둔 낙엽 모양을 그려 둘래!'],
        ['다람쥐 형제','높은 가지에 붉은 옹이가 있어. 그 아래 굵은 가지를 딛어 봐.\n우리 도토리 말고도, 누가 남긴 자국이 있더라.']
      ],()=>{
        diary('galExpBrothers','다람쥐 형제와 도토리를 큰 것부터 번갈아 나눴다. 겨울에는 같은 바구니에서 먹기로 했다. 형제가 숲 높은 가지의 붉은 옹이를 알려 주었다.');
        finishWanderer('squirrel_brothers');
      });return;
    }
    if(G.f.galExpBrothersAsked){
      talk([['다람쥐 형제','동생: 우린 아직 큰 도토리를 서로 세고 있어.\n형: 오른쪽 낮은 평상에서 같이 나눠 주기로 했잖아!']],shareBaskets);return;
    }
    talk([['다람쥐 형제','형: 내가 일곱 번을 오갔으니 큰 도토리는 내 몫이지.\n동생: 내가 낙엽을 걷어 찾았잖아!'],
      ['너구리','겨울 먹을 거야?\n작은 것만 한쪽에 몰렸네.'],
      ['다람쥐 형제','형: 큰 건 몇 알 안 되는데, 둘 다 욕심이 나서.\n동생: 도담처럼 묻어 놓고 잊을까 봐 더 그래.'],
      ['다람쥐 형제','오른쪽 낮은 평상으로 바구니를 옮겨 둘게.\n어떻게 나누면 좋을지 같이 봐 줄래?',[
        {t:'같이 고르게 나눠 보자',go:()=>{G.f.galExpBrothersAsked=true;toast('오른쪽 낮은 평상에서 바구니를 나누자 · E');}},
        {t:'다음에 같이 보자',go:null}]]]);
  }
  function shareBaskets(){
    if(!G.f.galExpBrothersAsked){brothersTalk();return;}
    if(G.f.galExpBrothersSorted){brothersTalk();return;}
    hands('형제와 도토리 나누기','brothers',['제일 큰 알은 왼쪽','다음 큰 알은 오른쪽','작은 알도 왼쪽','마지막 알은 오른쪽'],()=>{
      G.f.galExpBrothersSorted=true;brothersTalk();
    },true);
  }
  function chickTalk(){
    if(G.f.galExpChickWith&&G.f.galExpChickX>=2090){
      talk([['꺼병이','저기 갈대가 흔들려! 엄마 꼬리야!\n아까는 내 발소리에 묻혀서 못 들었나 봐.'],
        ['너구리','이제 뛰어가도 돼.\n난 여기서 보고 있을게.'],
        ['꺼병이','엄마가 해 지면 물가에서 만나자고 했거든.\n내가 도토리 구르는 것만 따라갔어.'],
        ['꺼병이','고마워, 천천히 걷는 보부상!\n물이 반짝이는 쪽으로 가면 약방이야. 엄마가 그랬어.']
      ],()=>{
        diary('galExpChick','도토리를 따라오다 길을 잃은 꺼병이와 물가까지 걸었다. 갈대 너머 어미의 대답을 듣고 제 길을 찾았다. 내 발소리도 작아졌다.');
        if(typeof grantNickname==='function')grantNickname('gal_quiet_steps','사뿐발 보부상','꺼병이');
        finishWanderer('lost_chick');
      });return;
    }
    if(G.f.galExpChickWith){talk([['꺼병이','물가의 갈대까지 천천히 가자.\n네가 너무 멀면 안 따라갈 거야. 여기서 기다릴게.']]);return;}
    talk([['꺼병이','엄마가 숲 밖으로 나오지 말랬는데,\n도토리가 굴러가서… 나무가 다 똑같아.'],
      ['너구리','어디서 만나기로 했어?\n엄마가 뭐라고 했는데?'],
      ['꺼병이','해 지면 물가의 갈대 아래. 울음으로 부르랬어.\n근데 내 발소리가 너무 커서 대답이 안 들려.'],
      ['너구리','같이 천천히 걷자.\n네가 멈추면 나도 멈출게.',[
        {t:'꺼병이 곁에서 물가 쪽으로 걷는다',go:()=>{G.f.galExpChickWith=true;G.f.galExpChickX=1540;toast('오른쪽 갈대까지 함께 걷자. 멀어지면 꺼병이는 기다린다');}},
        {t:'여기서 기다려. 길부터 살필게',go:null}]]]);
  }
  const magpie={id:'old_magpie',name:'늙은 까치',x:820,draw:picture('magpie'),talk:magpieTalk,
    get greeting(){return G.f.galWheelDone?'개울 소리가 달라졌구나. 네가 방아를 고쳤지?\n그 소리도 집에 전하마.':G.tool==='sickle'?'낫을 받았구나. 물레방아 물길의 덩굴도 걷겠네.\n네 엄마가 찧던 마을 곡식도 다시 빻을 수 있을 게다.':'매듭이 단단하니 날기 좋구나.\n멈춘 물레방아는 개울 오른쪽에 있단다.';}};
  const hubMagpie={id:magpie.id,name:magpie.name,x:480,draw:magpie.draw,talk:magpie.talk};
  Object.defineProperty(hubMagpie,'greeting',{get:()=>magpie.greeting});
  const brothers={id:'squirrel_brothers',name:'다람쥐 형제',x:620,draw:picture('brothers'),talk:brothersTalk,
    greeting:'형: 큰 것부터 번갈아!\n동생: 겨울에는 한 바구니에서!'};
  const chick={id:'lost_chick',name:'꺼병이',get x(){return G.f.galExpChickX??1540;},draw:picture('chick'),talk:chickTalk,
    greeting:'이제 엄마 울음이 들려.\n다음엔 도토리 말고 엄마를 따라갈래!'};
  function wheelStage(){
    if(G.f.galWheelDone)return 5;
    if((G.f.galWheelStage||0)>=4)return 4;
    return G.f.galWheelSpoke&&G.f.galWheelAxle?3:G.f.galWheelSpoke?2:G.f.galWheelStage||0;
  }
  function wheelTalk(){
    const F=G.f,stage=wheelStage();
    if(F.galWheelDone){
      talk([['너구리','쿵, 쿵, 쿵… 한 번 쉬고.\n엄마가 절구 찧던 소리랑 같네.'],
        ['늙은 까치','방아가 돌아가니 네 엄마 몫도 줄겠구나.\n다시 올 땐 빈 보따리로 쉬어 가렴.'],
        ['너구리','엄마, 이제 마을 곡식은 같이 빻아요.',[
          {t:'물소리에 맞춰 절구 손버릇을 해 본다',go:()=>hands('엄마의 절구 박자','wheel_revisit',[
            '가볍게 한 번','두 번, 힘을 빼고','세 번, 이제 한 번 쉰다'],()=>{
              diary('galWheelReturn','돌아와 물레방아 소리에 맞춰 엄마의 절구 손짓을 해 봤다. 세 번 찧고 한 번 쉬는 버릇이 물소리에도 맞았다.');
              talk([['너구리','손이 먼저 쉬네.\n엄마가 하던 대로.']]);
            })},{t:'소리만 듣고 간다',go:null}]]]);return;
    }
    if(stage===0){
      talk([['너구리','살이 빠지고 굴대도 갈라졌네.\n물만 흘러가고 있어.'],
        ['늙은 까치','네 엄마가 아프고 나서 멈췄지.\n그동안 마을 곡식을 네 엄마 혼자 절구에 찧었단다.'],
        ['너구리','혼자요? …이번엔 같이 고쳐요.'],
        ['늙은 까치','나는 마른 낙엽을 물어낼 테니 물받이를 비워 주렴.\n살은 참나무 숲 낮은 가지에, 굴대는 형제네 평상에 있단다.',[
          {t:'물받이 낙엽부터 함께 걷는다',go:()=>hands('물레방아 물받이 비우기','wheel_leaves',[
            '물받이 위 낙엽을 모은다','젖은 낙엽은 옆 물로 뺀다','막힌 물구멍을 드러낸다'],()=>{
              F.galWheelStage=1;diary('galWheelStart','엄마가 아프고 나서 멈춘 물레방아를 고치기로 했다. 그동안 엄마 혼자 마을 곡식을 절구에 찧었다. 까치와 물받이를 비웠다.');
              talk([['늙은 까치','물구멍이 보이는구나.\n나는 여기서 받치마. 길에서 부품을 만나면 챙겨 오렴.']]);
            })},{t:'어디가 고장 났는지 보고 간다',go:null}]]]);return;
    }
    if(stage<3){
      talk([['너구리',F.galWheelAxle?'굴대는 개울 받침에 왔어.\n참나무 숲 입구의 낮은 가지에서 살만 찾자.':!F.galWheelSpoke?'빠진 살은 참나무 숲 입구의 낮은 가지.\n굵은 굴대는 대장간 길 형제네 평상에서 같이 들자.':'살은 가져왔어.\n대장간 길 형제네 평상에서 굴대를 함께 들자.']]);return;
    }
    if(stage===3){
      talk([['너구리','살도 굴대도 다 왔어요.'],['늙은 까치','형제는 밑에서 받치고 나는 쐐기를 잡으마.\n넌 살을 굴대 홈에 맞춰 주렴.',[
        {t:'받쳐 주는 손에 맞춰 조립한다',go:()=>hands('함께 물레방아 맞추기','wheel_fit',[
          '굴대의 홈을 위로 돌린다','빠진 살을 홈에 끼운다','까치가 잡은 쐐기를 밀어 넣는다'],()=>{
            F.galWheelStage=4;diary('galWheelFit','형제가 굴대를 받치고 까치가 쐐기를 잡았다. 숲에서 되찾은 살을 끼우니 물레방아가 다시 한 몸이 됐다.');
            talk([['너구리','이제 물만 돌리면 돼.'],['늙은 까치','위 물길의 덩굴을 낫으로 걷어야 한단다.\n무쇠에게 받은 낫을 가져오렴.']]);
          })},{t:'조금 쉬고 맞춘다',go:null}]]]);return;
    }
    if(G.tool!=='sickle'){
      talk([['너구리','물길 위를 마른 칡이 막았네.'],['늙은 까치','날쌘에게 숯을 바꿔 무쇠에게 가져가렴.\n낫을 받으면 이 덩굴도 걷을 수 있지.']]);return;
    }
    talk([['너구리','낫으로 덩굴부터 걷을게요.'],['늙은 까치','수문은 조금씩 열렴.\n내가 물을 볼 테니 넌 손잡이를 잡아.',[
      {t:'덩굴을 걷고 수문을 함께 연다',go:()=>hands('물레방아에 물 돌리기','wheel_water',[
        '낫으로 마른 덩굴을 걷는다','수문 손잡이를 조금 올린다','첫 물을 받으면 손을 놓는다'],()=>{
          F.galWheelStage=5;F.galWheelDone=true;
          if(typeof grantNickname==='function')grantNickname('gal_water_hands','물소리 보부상','늙은 까치');
          diary('galWheelDone','물레방아를 고쳐 마을에 방아 소리가 돌아왔다. 방아 공이가 세 번 내려갔다가 쉬었다. 엄마가 절구 찧던 손버릇에 내 손도 맞춰 움직였다.');
          talk([['너구리','돌아요! …쿵, 쿵, 쿵.'],['늙은 까치','그러고 한 번 쉬지.\n네 엄마 손도 꼭 저랬단다.'],['너구리','(공이를 쥐던 손을 펴고, 한 박자 쉰다.)'],['늙은 까치','물소리를 돌려줬으니, 물소리 보부상이구나.\n집으로 갈 때 이 소리도 전하마.']]);
        })},{t:'물소리를 먼저 들어 본다',go:null}]]]);
  }
  function wheelSpoke(){
    const F=G.f;
    if(F.galWheelSpoke){talk([['너구리','이 가지에 물레방아 살이 걸려 있었지.\n끝에 빗금이 남아 있었어.']]);return;}
    if(!F.galWheelStage){talk([['너구리','나뭇가지에 긴 나무 살이 걸렸네.\n집 앞 물레방아에서 본 빗금인데.']]);return;}
    talk([['너구리','물레방아 살이다.\n물에 떠내려가다 가지에 걸렸구나.',[
      {t:'가지가 내려올 때 두 손으로 받는다',go:()=>hands('가지에 걸린 물레방아 살','wheel_spoke',[
        '낮은 가지를 살짝 당긴다','걸린 살 끝을 받친다','살을 비틀지 않고 빼낸다'],()=>{
          F.galWheelSpoke=true;F.galWheelStage=wheelStage();
          diary('galWheelSpoke','숲 입구의 낮은 가지에서 물레방아 살을 받았다. 물에 쓸려도 끝의 빗금은 남아 있었다.');
          talk([['너구리',F.galWheelAxle?'굴대도 개울 받침에 왔지.\n물레방아로 돌아가자.':'굴대는 형제네 평상이라고 했어.\n대장간 길로 나가며 들르자.']]);
        })},{t:'먼저 가지 모양을 살핀다',go:null}]]]);
  }
  function wheelAxle(){
    const F=G.f;
    if(!F.galExpBrothersSorted){shareBaskets();return;}
    if(!done('squirrel_brothers')){brothersTalk();return;}
    if(F.galWheelAxle){talk([['다람쥐 형제','형: 굴대는 물레방아 받침에 올려 뒀어.\n동생: 셋이 드니 하나도 안 무거웠지?']]);return;}
    if(!F.galWheelStage){talk([['다람쥐 형제','형: 이 통나무는 물레방아 굴대야.\n동생: 누가 고치러 온대? 개울에 물어보자.']]);return;}
    talk([['다람쥐 형제','형: 무쇠 아저씨가 깎아 둔 굴대야.\n동생: 우린 둘이 들어도 한쪽이 자꾸 처져.'],
      ['너구리','내가 가운데를 들게.\n아까 도토리처럼 양쪽을 맞추자.',[
        {t:'형제와 굴대 무게를 나눠 든다',go:()=>hands('셋이 굴대 들기','wheel_axle',[
          '형이 드는 쪽을 함께 받친다','동생 쪽도 같은 높이로 든다','까치가 가리킨 받침에 내려놓는다'],()=>{
            F.galWheelAxle=true;F.galWheelStage=wheelStage();
            diary('galWheelAxle','형제와 굴대를 나눠 들었다. 형제가 개울까지 함께 옮겨 받침에 올렸다.');
            talk([['다람쥐 형제',F.galWheelSpoke?'형: 굴대는 개울 받침에 왔어.\n동생: 살도 찾았으니 이제 끼우자!':'형: 우린 개울에서 굴대를 받치고 있을게.\n동생: 네 살이 오면 끼우기만 하면 돼!']]);
          })},{t:'손 놓을 자리를 먼저 본다',go:null}]]]);
  }
  function lanternTalk(){
    const F=G.f;
    if(F.galLanternLit){talk([['너구리','불빛이 처마 아래로 모였네.'],['두꺼비 할멈','문을 열어 뒀으니 아침이면 갈대로 돌아가겠지.\n또 올 때는 빈 등롱만 살펴 주렴.']]);return;}
    if(F.galLanternCount>=3){
      talk([['너구리','세 마리 다 왔어요.'],['두꺼비 할멈','뚜껑은 닫지 마렴.\n들어앉을 자리만 내어 주면 된단다.',[
        {t:'반딧불이 든 등롱을 처마에 건다',go:()=>hands('약방에 반딧불 등불 달기','lamp_hang',[
          '갈대 잎을 등롱 밑에 깐다','등롱 고리를 처마에 건다','입구는 열린 채로 놓아둔다'],()=>{
            F.galLanternLit=true;finishWanderer('reed_fireflies');
            diary('galLanternLit','늪의 반딧불을 등롱에 잠깐 불러 약방 처마를 밝혔다. 입구는 열어 두었다. 밤마다 반딧불로 방을 밝혀 주던 엄마가 생각났다.');
            talk([['너구리','엄마도 이렇게 방을 밝혀 줬는데.'],['두꺼비 할멈','…네 엄마도 이 불빛을 한참 보았지.\n너를 안고 이 길을 지날 때.'],['너구리','오늘은 내가 달아 줄게요.']]);
          })},{t:'먼저 불빛을 보고 있는다',go:null}]]]);return;
    }
    talk([['두꺼비 할멈','약재를 추려야 하는데 처마가 어둡구나.\n늪의 반딧불에게 잠깐 빛을 빌려 볼까.'],
      ['너구리','잡아 와요?'],['두꺼비 할멈','아니, 빈 등롱을 내밀렴. 앉으면 같이 오는 거지.\n낮은 갈대, 돌 위, 처마 아래에 한 마리씩 있단다.',[
        {t:'빈 등롱을 들고 갈대로 간다',go:()=>{F.galLanternAsked=true;toast('왼쪽 갈대, 가운데 디딤돌 위, 약재 선반 옆 불빛 · E');}},
        {t:'약 이야기부터 할게요',go:talkToad}]]]);
  }
  function inviteFirefly(i){
    const F=G.f;
    if(!F.galLanternAsked){lanternTalk();return;}
    if(F['galLanternFly'+i]){talk([['너구리','여기 앉던 반딧불은 등롱에 있어.\n다른 데도 둘러보자.']]);return;}
    hands('반딧불에게 자리 내어 주기','lamp_'+i,['불빛 아래로 등롱을 받친다','가만히 손을 펴 앉을 곳을 보인다'],()=>{
      F['galLanternFly'+i]=true;F.galLanternCount=[0,1,2].filter(n=>F['galLanternFly'+n]).length;
      talk([['너구리',F.galLanternCount===3?'다 왔네.\n처마에 등롱을 걸자.':'앉았다. 꽉 쥐지는 않을게.\n다음 불빛도 찾아보자.']]);
    });
  }
  const fireflies={id:'reed_fireflies',name:'반딧불',x:1760,draw:(x,y)=>Rg.expArt.marker(x,y),talk:lanternTalk,
    greeting:'등롱 입구로 작은 빛이 드나든다.\n잡아 두지 않아도 환하네.'};
  Rg.expWanderers={village:[magpie],forge:[brothers],forest:[chick],marsh:[fireflies],hill:[]};
  function examine(id,x,label,read,y){
    return {id,x,label,...(y===undefined?{}:{y}),get text(){return read();}};
  }
  Rg.expExamines={
    village:[
      examine('village_home',95,'열린 방문 들여다보기',()=> '엄마가 이불 끝을 꼭 쥐고 잔다.\n문은 조금 열어 두자. 개울 소리가 들리게.'),
      examine('village_well',440,'우물 두레박 살펴보기',()=>G.tool==='sickle'?
        '두레박 줄과 낫 자루에 같은 손때가 묻었다.\n엄마, 이제 덩굴도 걷을 수 있어.':'두레박은 내려갈 때 가볍고 올라올 때 무겁다.\n엄마는 물부터 다 쓰고 떠나라고 했는데.'),
      examine('village_wheel',990,'물레방아 물길 살펴보기',()=>G.f.galWheelDone?
        '쿵, 쿵, 쿵. 나무 공이도 한 번 쉬네.\n엄마는 혼자 이 소리를 다 내셨구나.':'빠진 살 사이로 물만 새네. 굴대도 갈라졌다.\n엄마가 아프고 나서 멈췄다고 했지.')],
    forge:[
      examine('forge_sign',230,'갈림길 팻말 읽기',()=> '왼쪽은 집과 개울, 오른쪽은 참나무 숲.\n숯 냄새를 따라가면 무쇠 아저씨가 있겠다.'),
      examine('forge_charcoal',1860,'식힌 숯가마 살펴보기',()=> '재는 차가운데 안쪽 벽은 아직 따뜻하다.\n무쇠 아저씨 불씨도 여기서 시작했겠지.'),
      examine('forge_share',870,'낮은 평상 살펴보기',()=>G.f.galExpBrothersSorted?
        '큰 도토리부터 양쪽 바구니에 번갈아 놓았다.\n작은 것도 나눠 담으니 높이가 비슷해졌다.':'빈 바구니 두 개가 나란히 놓였다.\n작은 발 둘이 서기 딱 좋은 낮은 평상이다.')],
    forest:[
      examine('forest_root',280,'드러난 뿌리 살펴보기',()=> '칡은 나무를 타고, 참나무는 땅을 붙든다.\n뿌리 밑 흙은 곡괭이가 들어갈 만큼 무르네.'),
      examine('forest_trail',1180,'나뭇가지에 걸린 금줄 보기',()=>G.tool==='sickle'?
        '개울에서 보던 나무의 금줄이 여기까지 이어졌다.\n안쪽 덩굴을 걷고 나무 속으로 올라가자.':'개울에서 보던 큰 나무다. 금줄이 숲 안으로 이어졌다.\n덩굴을 걷을 낫이 있으면 저곳까지 닿겠어.'),
      examine('forest_mother',2020,'갈대 너머 소리 듣기',()=>G.f.galExpChickWith?
        '갈대 뒤에서 꿩이 짧게 대답한다.\n꺼병이도 듣게 발소리를 낮추자.':'갈대가 흔들리더니 꿩 울음이 들렸다.\n작은 발자국이 왔던 쪽을 자꾸 부르네.')],
    marsh:[
      examine('marsh_shallows',320,'얕은 물 들여다보기',()=> '발밑 돌은 또렷한데 깊은 곳은 하늘색이다.\n돌을 밟으면 신을 적시지 않고 건너겠네.'),
      examine('marsh_shelf',1220,'약재 선반 살펴보기',()=> '습한 풀은 들보에, 마른 열매는 항아리에.\n할멈은 눕혀 둔 풀에도 자리를 정해 주셨다.'),
      examine('marsh_north',2180,'북쪽 길 팻말 읽기',()=>G.f.galArcToad1||G.diary.some(d=>d.id==='end')?
        '약은 집으로 갔다. 이 길은 북쪽으로 간다.\n다음엔 아빠한테도 집 이야기를 해 줘야지.':'돌너머로 가는 북쪽 길. 먼저 할멈께 해머루를 드리자.\n집으로 보낼 약을 아직 못 만들었으니까.')],
    hill:[
      examine('hill_rings',225,'나무 속 나이테 짚어 보기',()=> '어린 나무였을 때의 둥근 줄이 아직 남았다.\n아빠가 왔을 때는 이만큼 굵었을까.'),
      examine('hill_cloth',1510,'오래된 소원 천 보기',()=> '매듭은 낡았는데 천은 잎 그늘이라 덜 바랬다.\n나무가 바람을 대신 맞아 줬나 봐.'),
      examine('hill_fruit',2310,'해머루 자리 올려다보기',()=>G.boss.dead?
        '열매가 있던 꼭지가 노을을 보고 있다.\n다음 가을에도 여기서 익겠지.':'잎 뒤에 보랏빛 알 하나. 해를 오래 받는 자리네.\n저기까지 엉킨 칡을 풀어 줘야겠다.')]
  };
  // 집에서 묶은 보자기를 들고 대장간 거점으로 날아온다. 같은 id라 만남은 한 번만 센다.
  for(const [zone,list] of Object.entries(Rg.expWanderers))if(Rg.zones?.[zone]){
    Object.defineProperty(Rg.zones[zone],'wanderers',{configurable:true,get:()=>
      zone==='village'?(done('old_magpie')?[]:list):zone==='forge'?(done('old_magpie')?[hubMagpie,...list]:list):list});
    Rg.zones[zone].examines=Rg.expExamines[zone];
  }
  // 주연 NPC 목록은 그대로다. 이 객체들은 E로 만지는 작업 자리이며 인물·만남 수에 더하지 않는다.
  const work=(id,x,label,talk,y=GROUND)=>({id:'gal_work_'+id,name:label,x,y,prompt:label,talk,
    draw:(sx,sy)=>{if(id==='wheel')Rg.expArt.marker(sx,sy);}});
  Rg.zones.village.npcs.push(work('wheel',1050,'물레방아 함께 고치기',wheelTalk));
  Rg.zones.forge.npcs.push(work('baskets',810,'평상에서 도토리 나누기 · 굴대 함께 들기',wheelAxle));
  Rg.zones.forest.npcs.push(work('spoke',450,'낮은 가지의 물레방아 살 받기',wheelSpoke));
  Rg.zones.marsh.npcs.push(work('fly_reeds',520,'갈대의 반딧불에게 등롱 내밀기',()=>inviteFirefly(0)),
    work('fly_stone',1030,'디딤돌 위 불빛에 등롱 내밀기',()=>inviteFirefly(1),158),
    work('fly_shelf',1450,'선반 옆 불빛에 등롱 내밀기',()=>inviteFirefly(2)));
  Rg.expStep=()=>{
    if(G.zone!=='forest'||!G.f.galExpChickWith||done('lost_chick'))return;
    if(G.f.galExpChickArrived){G.f.galExpChickX=2090;return;}
    const x=G.f.galExpChickX??1540,dx=G.px-x;
    // 빠르게 앞질러도 꺼병이는 안전한 자리에서 기다린다. 돌아오면 다시 따라온다.
    if(Math.abs(dx)>TABLES.TUNING.field_talk_distance&&Math.abs(dx)<W*.5){
      G.f.galExpChickX=clamp(x+Math.sign(dx)*TABLES.TUNING.field_move_speed,1540,2090);
    }
    if(G.f.galExpChickX>=2090&&!G.f.galExpChickArrived){G.f.galExpChickArrived=true;toast('갈대 너머에서 어미가 답한다. 꺼병이에게 말을 걸자');}
  };
  for(const n of Rg.npcs){
    const positions={dodam:['forest',700],nal:['forge',1560],musoe:['forge',1040],toad:['marsh',1600]};
    [n.zone,n.x]=positions[n.id];
  }
  const oldGoal=Rg.goal;
  Rg.goal=()=>{
    const F=G.f;
    if(!G.started||G.ended)return oldGoal();
    if(G.diary.some(d=>d.id==='end')||(Rg.arcsEnabled()&&F.galArcToad1))return '약을 보냈다 · 할멈께 인사하고 북쪽으로 떠나기';
    if(!F.dodamTalk)return '참나무 숲의 도담 찾아가기 · 대장간 길 오른쪽';
    if(F.dodamDone&&!F.musoeMet)return '대장간 길로 돌아가 무쇠에게 낫 묻기';
    if(F.musoeMet&&!F.musoeTested&&!F.musoeDone)return '무쇠의 시험 통과하기 · 다시 말 걸기';
    if(F.dodamDone&&!F.musoeDone&&!has('coal')&&!F.nalTalk)return '대장간 오른쪽 좌판의 날쌘에게 숯 구하기';
    if(F.musoeDone&&!G.barrier.cut)return '참나무 숲 안쪽 금줄의 덩굴을 낫으로 걷기';
    if(G.barrier.cut&&!G.boss.dead)return '당산나무 속을 올라 엉킨 칡과 만나기';
    if(G.boss.dead&&!G.drop)return '늪가 약방의 두꺼비 할멈에게 해머루 가져가기';
    return oldGoal();
  };
}
})();
