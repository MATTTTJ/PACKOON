'use strict';
/* 단풍골 진행: NPC 대화와 교환, 무쇠 삼촌의 시험과 첫 변신, 전투 시작과 결과, 지금 할 일.
   흐름은 design/narrative/galchamgol-scenario.md, 교환은 design/data/trades.csv */
(()=>{
const Rg=REGIONS.galchamgol;
const MG=TABLES.MINIGAMES;

/* 사연 설정은 새 게임·저장 복원 때 정한 공통 판정을 따른다. */
Rg.arcsEnabled=arcsEnabled;
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
  if(!F.galArcDodam1&&F.dodamTalk)c.push({t:'도토리 걱정을 들어 본다',go:dodamCacheAsk});
  else if(!F.galArcDodam2&&(F.galArcDodamFound||G.pickups[F.galArcDodamCache]?.got))c.push({t:'찾은 자리를 수첩에 그린다',go:dodamCacheDraw});
  else if(F.galArcDodam2&&F.dodamDone&&!F.galArcDodam3)c.push({t:'도담 이야기를 더 듣는다',go:dodamOldStory});
  if(c.length===1){dodamMain();return;}
  c.push({t:'다음에 이야기하자',go:null});
  talk([['도담','응? 나한테 물어볼 거 있어?',c]]);
}
function dodamCacheAsk(){
  talk([['도담','어, 그러니까, 그게 말이지!'],
    ['도담','겨울 먹을 도토리를 묻었는데…'],['도담','어디 묻었는지 잊었어!'],
    ['도담','같이 찾아 줘! 찾으면 꼭 갚을게!',[{t:'같이 찾아볼게',go:dodamCacheStart},{t:'해머루부터 물어볼게',go:dodamMain}]]]);
}
function dodamCacheStart(){
  const index=G.pickups.findIndex(a=>a.item==='acorn'&&a.y===GROUND&&!a.got&&(CLASSIC||a.zone==='forest'));
  // 이미 전부 주웠다면 그 자리를 그려 줄 수 있다. 도토리를 다시 내거나 새로 모을 필요는 없다.
  arcScene('galArcDodam1',index<0?
    [['도담','어, 땅에 있던 건 다 주웠어?'],['도담','그중에 흙 묻은 게 내 거였을 거야!\n어디서 주웠어?']]:
    [['도담','흙 묻은 도토리가 내 거야!'],['도담','찾으면 꼭 알려 줘! 그 밑에 더 묻었거든!']],
    '도담이 겨울 먹을 도토리를 묻은 자리를 잊었다. 숲에서 도토리를 찾을 때 함께 살펴보기로 했다.',
    ()=>{G.f.galArcDodamCache=index;G.f.galArcDodamFound=index<0;});
}
Rg.arcCache=a=>Rg.arcsEnabled()&&G.f.galArcDodam1&&!G.f.galArcDodam2&&G.pickups[G.f.galArcDodamCache]===a;
Rg.onPickup=a=>{
  if(Rg.arcCache(a)){G.f.galArcDodamFound=true;toast('도담이 묻은 도토리다! 찾은 자리를 알려 주자');}
};
function dodamCacheDraw(){
  if(!(G.f.galArcDodamFound||G.pickups[G.f.galArcDodamCache]?.got))return;
  arcScene('galArcDodam2',[['너구리','여기 묻혀 있었어. 수첩에 그려 둘게.'],
    ['도담','어, 그러니까… 여기에 동그라미!\n남은 건 나중에 내가 파 갈게!'],['도담','적어 두면 안 잊는구나!'],['도담','그래도 잊으면 다시 찾으면 되지!']],
    '도담과 도토리를 찾은 자리를 수첩에 그렸다. 도담은 적어 두면 안 잊겠다며 웃었다.',()=>learn('rule:squirrel_cache'));
}
function dodamOldStory(){
  if(!G.f.galArcDodam2||!G.f.dodamDone)return;
  // 결정 D-134: 가루를 값으로 받는 도담은 답례로 가루가 아니라 도토리를 준다.
  arcScene('galArcDodam3',[['도담','아, 맞다! 찾아 주면 갚기로 했지!\n자, 큰 도토리 세 알! 빻으면 가루 하나야.'],['도담','참, 우리 할머니가 그랬는데!'],
    ['도담','옛날에 너구리 하나가 왔대.'],['도담','해머루만 보고 돌아섰대!'],
    ['너구리','언제?'],['도담','네가 태어나기도 전이래!']],
    '도담이 도토리 찾아 준 값이라며 큰 도토리 세 알을 주었다. 할머니에게 들었다며 아주 옛날 해머루만 보고 돌아선 너구리 이야기를 했다.',
    ()=>addItem('acorn',3));
}
function dodamMain(){
  const F=G.f;
  if(!F.dodamTalk){F.dodamTalk=true;
    talk([['도담','어, 이게 얼마 만의 너구리야!\n잠깐, 그 모자 어디서 봤는데…'],
      ['도담','뭐 찾아? 내가 알려 줄까?',[{t:'당산나무 해머루, 어떻게 올라가?',go:dodamFruit},{t:'우리 아빠 봤어? 너구리 보부상이야',go:()=>dodamDad(dodamFruit)}]]]);
  }else if(!F.dodamDone){
    if(has('powder'))dodamTrade();
    else talk([['도담','도토리 가루 하나면 올라가는 길 알려 줄게!\n도토리 세 알을 곱게 빻으면 돼!']]);
  }else talk([['도담',CLASSIC?'당산나무는 마을 맨 끝이야! 참, 칡덩굴 조심해!':'숲 안쪽의 금줄을 따라가!\n낫으로 덩굴을 걷으면 당산나무 속으로 갈 수 있어!',
    [{t:'보따리를 펼친다',go:()=>Trade.open('dodam')},{t:'고마워',go:null}]]]);
}
function dodamDad(next){
  // 결정 D-134: D-129 ⑥ 되돌림. 확정(npcs.csv) 그대로 아빠는 도담에게서 가루를 바꿔 갔고, 해머루가 익었는지 물었다.
  clue('d1','도담','몇 달 전 보부상 너구리가 도담에게서 도토리 가루를 바꿔 갔다. 해머루가 익었는지 묻더니, 아직이라는 말에 북쪽으로 간다고 했다.');
  rel('dodam',1);
  talk([['도담','아, 생각났다! 보부상 아저씨도 그 모자 썼어!'],['도담','몇 달 전에 그 아저씨가 여기서\n도토리 가루를 잔뜩 바꿔 갔거든!'],['도담','해머루 익었냐고 묻더니, 아직이라니까\n북쪽으로 간댔어. 엄청 급해 보이던데.']],next);
}
function dodamFruit(){
  ledger('dodam','도담','도토리 가루 1','해머루 자리에 대한 정보');
  const dad=G.clues.some(c=>c.id==='d1');
  const worry=Rg.arcsEnabled()&&!G.f.galArcDodam1?[['도담','아, 도토리 하니까 생각났다!\n내 겨울 도토리, 어디 묻었더라…']]:[];
  talk([...(dad?[['너구리','나도 해머루 찾고 있어.\n당산나무 꼭대기, 어떻게 올라가?']]:[]),['도담',dad?'올라가는 길? 그럼, 내가 알지!\n이번엔 익었어. 꼭대기가 빨갛더라!':'올라가는 길? 그럼, 내가 알지!'],
    ['도담','대신 도토리 가루 하나 줘!\n도토리 세 알 주워서 곱게 빻으면 돼!'],...worry],()=>{if(has('powder'))dodamTrade();});
}
function dodamTrade(){
  talk([['도담','와, 도토리 가루! 나랑 바꿀 거지?',[{t:'보따리를 펼친다',go:()=>Trade.open('dodam')},{t:'아직은 안 줄래',go:null}]]]);
}
function dodamGive(){
  if(G.f.dodamDone||!has('powder'))return;
  {
    takeItem('powder',1);G.f.dodamDone=true;ledgerDone('dodam');rel('dodam',1);
    diary('dodam','당산나무 꼭대기까지는 숲 안쪽 금줄 친 데서 나무 속으로 오른다. 요즘 칡덩굴이 나무를 꽁꽁 감았다고 한다.');
    talk([['도담',CLASSIC?'고마워! 해머루는 마을 끝 당산나무 꼭대기에 열려!':'고마워! 꼭대기까진 나무 속으로 올라가!\n숲 안쪽 금줄 친 데에 들어가는 길이 있어!'],['도담','근데 칡덩굴이 나무를 꽁꽁 감았어.\n아무도 못 올라가! 곡괭이로는 안 끊길걸?'],['도담','아, 대장간 무쇠 아저씨한테 가 봐! 날 선 연장은 거기밖에 없어!']],()=>{if(!G.clues.some(c=>c.id==='d1'))dodamDad();});
  }
}

/* ---------- 날쌘 (족제비 떠돌이 보부상) ---------- */
// 결정 D-03: 첫 만남에서 날쌘이 아빠 모자를 알아본다(영산 고백의 복선) (design/data/decisions.csv)
function talkNal(){
  if(!G.f.nalTalk){G.f.nalTalk=true;ledger('nal','날쌘','도토리 가루 1 + 칡뿌리 1','숯');
    talk([['날쌘','어이, 꼬마 보부상. 나도 보부상이거든?\n이 동네 숯은 다 내 지게에 있지.'],['너구리','(날쌘의 눈이 내 모자에 잠깐 머문다.)'],['날쌘','…바꿀 물건 있으면 꺼내 봐. 시시한 건 안 받아.'],['날쌘','같은 품이면 하나, 한 품 아래면 둘.\n보부상 셈이다.']],nalMenu);}   // 결정 D-134: 교환 규칙을 날쌘이 한 줄로 (D-39)
  else nalMenu();
}
function nalMenu(){
  const c=[{t:'보따리를 펼친다',go:()=>Trade.open('nal')}];
  c.push({t:'아빠 짐의 약연을 내민다',go:nalYakyeon});
  if(!CLASSIC){
    c.push({t:G.f.craftTrade_salt?'바꿔 간 소금 이야기':G.f.nalBasketSeen?'바구니 테 감을 칡 줄기 이야기':'지게 바구니 테가 풀린 걸 알려 준다',go:nalCraftSalt});
  }
  // 결정 D-117: 단풍골 날쌘 사연(값은 길이 정한다 → 모자 챙 → 먼저 떠남). 영산 고백(D-03)의 복선이다.
  if(Rg.arcsEnabled()){
    const F=G.f;
    if(F.nalDone&&!F.galArcNal2)c.push({t:'숯값은 누가 정하는지 묻는다',go:nalRoute});
    else if(F.galArcNal2&&F.musoeDone&&!F.galArcNal3)c.push({t:'모자를 왜 자꾸 보는지 묻는다',go:nalHat});
    else if(F.galArcNal3&&G.diary.some(d=>d.id==='end')&&!F.galArcNal4)c.push({t:'지게를 꾸리는 까닭을 묻는다',go:nalAhead});
  }
  c.push({t:'그만두기',go:null});
  talk([['날쌘',G.f.nalDone?'또 뭐야? 볼일 끝났으면 길 좀 비켜.':'그래서, 뭘 내놓을 건데?',c]]);
}
function nalTrade(){
  const both=has('powder')&&has('root');
  if(!G.f.nalPriceHeard){
    G.f.nalPriceHeard=true;
    // 처음엔 값부터 듣는다. 재료가 다 있으면 건넬지 고른다.
    talk([['날쌘','숯? 도토리 가루 하나에 칡뿌리 하나.\n그럼 숯 하나 줄게.'],...(both?[['날쌘','마침 둘 다 있네. 바꿀래?',[{t:'도토리 가루와 칡뿌리를 건넨다',go:nalTrade},{t:'조금 이따가요',go:null}]]]:
      [['날쌘',has('root')?'도토리 가루부터 빻아 와.':'칡뿌리는 흙 무른 데를 곡괭이로 파 봐.\n보부상이 그런 것도 몰라?']])]);return;
  }
  if(!both){talk([['날쌘','값은 벌써 말했잖아.\n도토리 가루 하나에 칡뿌리 하나. 둘 다 가져와.'],['날쌘','가루는 빻아 오고, 칡뿌리는 흙 무른 데를 파 봐.\n보부상이 그런 것도 몰라?']]);return;}
  takeItem('powder',1);takeItem('root',1);G.f.nalDone=true;ledgerDone('nal');
  const extra=G.rel.nal.v>0;
  addItem('coal',extra?2:1);if(extra)learn('nal:bluff-paid');
  if(Rg.arcsEnabled()&&extra){
    arcScene('galArcNal1',[['날쌘','봐. 이게 제대로 된 숯이야.'],['날쌘','하나 더 얹었어. 써 봐.'],['날쌘','꼬마가 숯 보는 눈은 아직이네.']],
      '날쌘에게 허세를 부렸더니 숯을 하나 더 얹어 주었다. 꼬마가 숯 보는 눈은 아직이라며 코웃음을 쳤다.');
    return;
  }
  talk(extra?[['날쌘','봐, 이게 제대로 된 숯이야. 하나 더 얹어 줄 테니 써 봐.'],['날쌘','써 보고도 촌구석 소리가 나오나 보자고.']]:[['날쌘','자, 숯 하나. 딱 맞게 바꾼 거야.'],['날쌘','네 삼촌한테 줄 거야? 그 양반, 여간 까다로운 게 아닌데.'],['너구리','…우리 삼촌인 거 어떻게 알아요?'],['날쌘','이 동네 대장장이가 너구리인데\n너구리 꼬마면 조카지. 가.']]);
}
function nalRoute(){
  arcScene('galArcNal2',[['너구리','숯 하나에 가루랑 뿌리 둘이요?\n숯이 더 비싸요?'],
    ['날쌘','단풍골엔 참나무가 흔해. 숯도 흔하지.\n가루는 품이 들고.'],
    ['날쌘','같은 숯도 돌너머 가면 값이 달라.\n돌투성이라 나무가 귀하거든.'],
    ['너구리','그럼 북쪽에 가져가면 더 쳐줘요?'],
    ['날쌘','이제 좀 보부상 같은 소리 하네.'],
    ['날쌘','값은 물건이 정하는 게 아니야.\n길이 정해.'],
    ['날쌘','…하나 더. 칡꽃은 북쪽에선 못 봐.\n돌너머 사람들은 꽃 냄새를 귀하게 쳐.'],
    ['너구리','그걸 왜 알려 줘요?'],
    ['날쌘','공짜 아니야. 적어 둬.\n나중에 받을 거니까.'],
    ['너구리','(수첩에 “값은 길이 정한다”고 적었다.)'],
    ['날쌘','…진짜 적네.']],
    '날쌘에게 숯값 셈을 물었다. 값은 물건이 아니라 길이 정한다고 했다. 북쪽 돌너머에선 칡꽃이 귀하다고 귀띔하고는, 공짜가 아니니 나중에 받겠다고 했다.',
    ()=>learn('nal:route-price'));
}
function nalHat(){
  const tip=G.boss.dead?['날쌘','칡도 풀었다며.\n…소문 한번 빠르네, 이 동네.']:['날쌘','덩굴 치러 가거든 서두르지 마.\n칡은 급하게 당기면 더 감겨.'];
  arcScene('galArcNal3',[['너구리','아저씨, 아까부터 제 모자 봐요.'],
    ['날쌘','누가? 지게 끈 보고 있었어.'],
    ['너구리','아빠 모자예요. 떠나는 날 엄마가 씌워 줬어요.\n길에서 누가 알아보라고 그런 거겠죠.'],
    ['너구리','(날쌘이 한동안 아무 말도 하지 않는다.)'],
    ['날쌘','…챙이 꺾였잖아. 이리 와 봐.'],
    ['너구리','(날쌘이 모자를 벗겨 챙을 손바닥으로 편다.\n그리고 도로 씌워 준다.)'],
    ['날쌘','보부상은 모자부터 바로 써.\n비 오면 챙이 얼굴을 막아 줘.'],
    ['너구리','아빠도 비 오는 날 그 말 했어요.'],
    ['날쌘','흔한 말이야. 보부상이면 다 해.'],tip],
    '날쌘이 꺾인 모자 챙을 펴서 도로 씌워 주었다. 엄마가 씌워 준 아빠 모자라고 하자 한동안 말이 없었다. 아빠가 하던 말과 같은 말을 하고는, 흔한 말이라고 했다.',
    ()=>learn('nal:hat'));
}
function nalAhead(){
  arcScene('galArcNal4',[['너구리','(날쌘이 좌판을 걷어 지게에 묶고 있다.)'],
    ['너구리','어디 가요?'],
    ['날쌘','북쪽. 날 밝으면 먼저 떠.\n첫눈 오기 전에 고개를 넘어야 하거든.'],
    ['너구리','저도 북쪽 가요. 같이 가요.'],
    ['날쌘','보부상은 혼자 다녀.\n짐 나눠 지면 셈이 꼬여.'],
    ['날쌘','돌너머 어귀에 좌판 펴고 있을지도 모르지.\n그건 그때 가 봐야 알고.'],
    ['너구리','그럼 거기서 봬요.'],
    ['날쌘','칡꽃 챙겼어? 빈손으로 오면 흥정 안 해.'],
    ['날쌘','이건… 남은 주먹밥이야. 상하기 전에 먹어.\n버리기 아까워서 주는 거야.']],
    '날쌘이 좌판을 걷고 있었다. 날 밝으면 먼저 북쪽으로 간다고 했다. 같이 가자니 보부상은 혼자 다닌다면서, 돌너머 어귀에 있을지도 모른다고 했다. 남은 주먹밥이라며 하나를 줬다.',
    ()=>addItem('rice',1));
}
function nalYakyeon(){
  learn('nal:yakyeon');
  clue('n1','날쌘','날쌘은 약연을 보더니 "네 아빠 거잖아"라며 받지 않았다. 떠돌이 보부상들도 아빠를 안다.');
  talk([['날쌘','…이거 네 아빠 거잖아. 안 받아.'],['날쌘','남의 집 대물림 물건 받았다간 장사 끝이야.\n도로 넣어 둬.'],['날쌘','네 아빠는… 됐어. 갈 길이나 가.']]);
}

/* 선택 재료 수량은 trades.csv의 t_craft_salt 그대로다. 필수 교환과 별개로 한 번만 바꾼다.
   아이가 본 것(풀린 바구니 테)에서 시작한다. 날쌘이 줄기를 원하는 까닭과 소금·깨를 내놓는 까닭을 말한다. */
function nalCraftSalt(){
  if(G.f.craftTrade_salt){talk([['날쌘','소금 종지랑 깨는 벌써 줬잖아.\n묵을 쑤든, 깨랑 찧든 네 솜씨껏 써.']]);return;}
  ledger('t_craft_salt','날쌘','칡 줄기 1','소금 2 + 깨 1');
  const first=!G.f.nalBasketSeen;G.f.nalBasketSeen=true;
  const lead=first?[['날쌘','…알아, 나도. 테가 풀려서\n걸을 때마다 숯가루가 새.']]:[];
  if(!has('vine')){
    talk([...lead,['날쌘','칡 줄기 하나면 다시 감을 텐데.\n숯 말고 지게에 남은 건 소금이랑 깨뿐이야.'],
      ['날쌘','줄기 구해 오면 소금 두 종지에 깨 한 봉지.\n당산나무 칡이 풀리면 발에 채일 거야.']]);return;
  }
  talk([...lead,['날쌘','마침 질긴 칡 줄기네. 그걸로 테를 감으면 되겠어.'],
    ['날쌘','숯 말고 남은 건 소금이랑 깨뿐이야.\n소금 두 종지에 깨 한 봉지, 바꿀래?',[
    {t:'보따리를 펼친다',go:()=>Trade.open('nal')},{t:'줄기는 더 살펴보고 올게요',go:null}]]]);
}
function nalSaltGive(){
  if(G.f.craftTrade_salt||!has('vine'))return;
  takeItem('vine',1);addItem('salt',2);addItem('sesame',1);G.f.craftTrade_salt=true;ledgerDone('t_craft_salt');
  talk([['날쌘','이제 숯가루 안 새겠네.'],['날쌘','가루에 소금 넣고 묵 쑤는 건 알지?\n깨도 볶아 놨으니, 소금이랑 같이 찧어 봐.']]);
}

/* ---------- 무쇠 (삼촌, 아빠의 동생인 너구리 대장장이) ----------
   아빠와 젊은 날 같은 길에 나섰다가 다리를 다쳐 대장장이가 됐다. 몸이 성치 않아 형을 찾아 나서지 못한다.
   형이 석 달 전 낫과 아이의 잎사귀를 맡기며 "조심성부터 보고 주라"고 했다. 시험 뒤 집안 변신술을 가르친다. */
function talkMusoe(){
  // 집안 사람이라 변신해도 알아본다 (leaf-transform.md 6-4).
  if(G.form){talk([['무쇠','잎 소리 다 들린다.\n삼촌 앞에선 제 모습으로 와라.']]);return;}
  if(!Rg.arcsEnabled()){musoeMain();return;}
  const F=G.f,c=[{t:F.musoeDone?'낫 이야기하기':'낫과 시험 이야기하기',go:musoeMain}];
  if((F.musoeTested||F.musoeDone)&&!F.galArcMusoe2)c.push({t:'아빠가 낫을 맡기던 날을 묻는다',go:musoeNight});
  if(F.galArcMusoe2&&!F.galArcMusoe3&&F.musoeDone)c.push({t:'낫 자루가 왜 이렇게 닳았는지 묻는다',go:musoeOldHandle});
  // 결정 D-117: "너는 살펴라"(galArcMusoe3)를 아이가 그대로 지킨다. 삼촌 다리 → 할멈의 칡뿌리 찜질 → 낫을 다시 세움.
  if(F.galArcMusoe3&&!F.galArcMusoeLeg1)c.push({t:'삼촌 다리를 살핀다',go:musoeLeg});
  if(F.galArcMusoeLeg1&&F.galPoultice&&!F.galArcMusoeLeg3)c.push({t:'칡뿌리 찜질을 건넨다',go:musoeLegWrap});
  if(F.galArcMusoeLeg3&&!F.galArcMusoeBye&&G.diary.some(d=>d.id==='end'))c.push({t:'떠난다고 인사한다',go:musoeBye});
  if(c.length===1){musoeMain();return;}
  c.push({t:'다음에 올게요',go:null});
  talk([['무쇠','무슨 일이냐.',c]]);
}
function musoeNight(){
  if(!G.f.musoeTested&&!G.f.musoeDone)return;
  sceneNext('g_musoe_night');
  arcScene('galArcMusoe2',[['너구리','아빠가 낫을 왜 여기 맡겼어요?\n집이 코앞인데.'],['무쇠','석 달 전. 떠나기 전 사흘을\n여기서 묵었다.'],
    ['무쇠','밤마다 낡은 장부를 들여다봤다.\n집에선 못 펴 볼 거였겠지.'],['무쇠','그 얘긴 말 말라더군.'],['무쇠','내가 벌써 반은 어겼군.']],
    // 결정 D-134: D-129 ④ 되돌림. 확정(npcs.csv) "사흘 묵으며 밤마다 장부만 봄". 집이 코앞인데 묵은 까닭은 무쇠의 짐작으로만 둔다.
    '석 달 전 아빠는 떠나기 전 사흘을 삼촌 대장간에서 묵으며 밤마다 낡은 장부를 들여다봤다. 집에선 펴 볼 수 없는 것이었나 보다. 삼촌은 말하지 않기로 한 약속을 반만 깼다.',
    ()=>clue('m2','무쇠 삼촌','석 달 전 아빠는 떠나기 전 사흘을 대장간에서 묵으며 밤마다 낡은 장부를 들여다봤다. 그 이야기는 하지 말라고 삼촌에게 부탁했다.'));
}
function musoeOldHandle(){
  if(!G.f.galArcMusoe2||!G.f.musoeDone)return;
  arcScene('galArcMusoe3',[['너구리','삼촌, 낫 자루가 손 모양대로 닳았어요.'],['무쇠','형이 젊을 때부터 쓰던 거다.'],
    ['너구리','그때도 삼촌이 벼려 줬어요?'],['무쇠','그 길엔 나도 같이 갔다.'],['무쇠','돌아올 땐 이 다리로 왔지.'],
    ['너구리','…다리, 지금도 아파요?'],['무쇠','형은 앞만 봤다.\n너는 살펴라.']],
    '아빠 낫 자루가 손 모양대로 닳아 있었다. 젊을 때부터 쓰던 낫이란다. 삼촌은 그 길에 아빠와 같이 갔다가 다리를 다쳤다고 한다.');
}
function musoeLeg(){
  arcScene('galArcMusoeLeg1',[['너구리','(삼촌이 모루에 기대 무릎을 주무르고 있다.)'],
    ['무쇠','뭘 보냐.'],
    ['너구리','다리 또 아파요?'],
    ['무쇠','비 오기 전엔 쑤신다. 그뿐이다.'],
    ['너구리','살피라고 했잖아요. 삼촌이.'],
    ['무쇠','…그 말을 거기다 쓰냐.'],
    ['무쇠','약 같은 건 됐다.\n할멈한테 가서 쓸데없는 소리 마라.'],
    ['너구리','(…할머니한테 여쭤봐야겠다.)']],
    '삼촌이 모루에 기대 무릎을 주물렀다. 비 오기 전엔 쑤신다고만 했다. 할멈한테 쓸데없는 소리 말라길래, 할머니께 여쭤보기로 했다.');
}
function musoeLegWrap(){
  if(!G.f.galPoultice)return;
  const sharp=G.sharp;
  arcScene('galArcMusoeLeg3',[['너구리','할머니가 칡뿌리 찜질을 싸 주셨어요.'],
    ['무쇠','…누가 할멈한테 가랬냐.'],
    ['너구리','쓸데없는 소리는 안 했어요.\n다리 얘기만 했어요.'],
    ['너구리','(삼촌이 한참 보다가, 말없이 받아 무릎에 감는다.)'],
    ['무쇠','…따뜻하군.'],
    ['무쇠','형도 그랬다.\n제 발은 터져도 남 다리만 봤다.'],
    ['무쇠','그 낫 이리 줘 봐라.'],
    ['너구리','(삼촌이 숫돌에 낫을 몇 번 문지른다.)'],
    ...(sharp?[['무쇠','날은 멀쩡하다. 기름이나 먹여 두마.'],['너구리','고맙습니다, 삼촌.'],['무쇠','고맙긴. 손이 심심해서 그런다.']]
      :[['무쇠','날이 불량이다. 이제 좀 쓸 만하군.'],['너구리','고맙습니다, 삼촌.'],['무쇠','고맙긴. 불량품 고친 거다.']])],
    '할머니가 싸 준 칡뿌리 찜질을 삼촌께 갖다 드렸다. 삼촌은 말없이 무릎에 감고 따뜻하다고 했다. 아빠도 제 발은 터져도 남 다리만 봤다고. 그러고는 낫 날을 다시 세워 주었다.',
    ()=>{G.sharp=true;learn('musoe:leg');refreshHud();});
}
function musoeBye(){
  arcScene('galArcMusoeBye',[['너구리','(삼촌이 대장간 문턱까지 나와 서 있다.)'],
    ['너구리','삼촌, 다리는요?'],
    ['무쇠','찜질 덕에 오늘은 덜 쑤신다.'],
    ['무쇠','…네 어미한테도 아침에 다녀왔다.\n죽은 받아먹더라.'],
    ['너구리','돌아올 때 할머니 찜질 또 갖다 드릴게요.'],
    ['무쇠','필요 없다.'],
    ['무쇠','…칡뿌리는 굵은 걸로 가져와라.'],
    ['너구리','(삼촌이 처음으로 손을 들어 흔들었다.)']],
    '떠나는 날 삼촌이 대장간 문턱까지 나와 있었다. 찜질 덕에 덜 쑤신다고, 아침엔 엄마한테도 다녀왔다고 했다. 필요 없다면서 칡뿌리는 굵은 걸로 가져오라고 했다. 처음으로 손을 흔들어 주었다.');
}
/* 칡뿌리는 날쌘 교환 몫이 남아 있으면 내놓지 않는다(진행 보호). */
function rootSpare(){
  if(!has('root'))return false;
  return progressShortage({...G.inv,root:G.inv.root-1})<=progressShortage(G.inv);
}
function toadPoultice(){
  const ask=!G.f.galArcMusoeLeg2;
  const give=()=>{
    if(G.f.galPoultice||!rootSpare())return;
    takeItem('root',1);G.f.galPoultice=true;
    diary('galPoultice','할머니가 칡뿌리를 짓찧어 무명에 싸 주었다. 식기 전에 삼촌께 갖다 드리라고 했다.');
    talk([['너구리','(할머니가 칡뿌리를 찧어 무명에 싸 준다.\n아직 따뜻하다.)'],
      ['두꺼비 할멈','식기 전에 갖다 주렴.\n…그 집 형제는 고맙단 말을 못 배웠지.']]);
  };
  const tail=rootSpare()?[['두꺼비 할멈','칡뿌리 하나 있느냐? 찧는 건 내가 하마.',[{t:'칡뿌리 하나를 건넨다',go:give},{t:'조금 이따가요',go:null}]]]
    :[['두꺼비 할멈',has('root')?'그 뿌리는 아직 쓸 데가 있겠구나.\n남는 걸로 하나 가져오렴.':'칡뿌리 하나 가져오렴.\n찧는 건 내가 하마.']];
  if(!ask){talk(tail);return;}
  arcScene('galArcMusoeLeg2',[['너구리','할머니, 무쇠 삼촌 다리가 쑤신대요.\n비 오기 전에요.'],
    ['두꺼비 할멈','그 고집쟁이가 제 입으로 그러더냐?'],
    ['너구리','아뇨. 할머니한테 말하지 말래요.'],
    ['두꺼비 할멈','허허, 그럼 많이 아픈 게로구나.'],
    ['두꺼비 할멈','칡뿌리를 짓찧어 따뜻하게 싸 매면\n붓기가 좀 내린단다.'],
    ...tail],
    '삼촌 다리 이야기를 하자 할머니는 웃었다. 말하지 말라고 했으면 많이 아픈 거라고. 칡뿌리를 짓찧어 싸 매면 붓기가 내린다고 했다.');
}
function toadLegChoice(){
  const F=G.f;
  if(!Rg.arcsEnabled()||!F.galArcMusoeLeg1||F.galPoultice)return null;
  return {t:F.galArcMusoeLeg2?'삼촌 찜질에 쓸 칡뿌리 이야기':'삼촌 다리에 듣는 약을 묻는다',go:toadPoultice};
}
function musoeMain(){
  const F=G.f;
  if(!F.musoeMet){F.musoeMet=true;
    talk([['무쇠','왔냐. 보따리는 왜 멨냐.'],['너구리','아빠 찾으러 가요.\n엄마 약도 구하고요.'],
      ['무쇠','안 된다. 넌 아직 어리다.'],['무쇠','형도 석 달째 소식이 없다.\n너까지 보낼 순 없다.',[{t:'저도 보부상이에요, 삼촌. 보내 주세요',go:musoe2}]]]);
  }else if(!F.musoeTested&&!F.musoeDone){
    talk([['무쇠','숨 골랐냐.\n보부상 소리 하려면 다시 버텨 봐라.',[{t:'다시 해 볼게요',go:battleMusoe},{t:'조금 이따가요',go:null}]]]);
  }else if(!F.leafGiven){
    musoeLeaf();
  }else if(!F.musoeAfterLeaf&&F.leafSplit&&!F.musoeDone){
    musoeAfterLeaf();
  }else if(!F.musoeDone){
    // 결정 D-139: 시험에서 받은 숯은 날 세우는 몫이라, 그 숯이 있으면 벼릴 숯이 하나 더 든다.
    if(has('coal',F.musoeCoal?2:1))talk([['무쇠','숯 가져왔군. 불 올린다.'],['너구리','(삼촌이 쇠를 달궈 세 번 내리친다.\n다리는 절어도 망치는 흔들리지 않는다.)']],openForge);
    else talk([['무쇠',F.musoeCoal&&has('coal')?'그 숯은 날 세우는 몫이다.\n벼릴 숯은 따로 가져와라.':'숯부터 가져와라.\n네 연장이니 값은 네가 치러라.'],['무쇠',CLASSIC?'물레방아 쪽 날쌘이 녀석한테 가 봐라. 숯을 쟁여 놨을 거다.':'날쌘이 녀석이 길목에 좌판을 폈더라.\n숯을 쟁여 놨을 거다.']]);
  }else talk([['무쇠','낫은 손에 익었냐.\n형은 그걸로 덩굴을 잘도 쳐냈다.']]);
}
function musoe2(){
  clue('m1','무쇠 삼촌','아빠는 석 달 전 삼촌에게 낫을 맡기고 떠났다. 내가 따라나설 줄 알았다고 한다.');
  diary('musoe','무쇠 삼촌이 길을 막았다. 아빠가 낫을 맡기며 내 조심성부터 보고 주라고 했단다. 나도 어른 보부상이라는 걸 보여 줘야 한다.');
  talk([['무쇠','…형이 낫을 맡기고 갔다.\n네가 따라나설 줄 알았던 게지.'],['무쇠','조심성부터 보고 주라더군.'],
    ['무쇠','이 정도도 겁내면 보부상 못 한다.\n덤비지 말고 버텨 봐라.'],['너구리','(…흥, 버티는 거라면 자신 있어.)']],battleMusoe);
}
function battleMusoe(){
  const n=Rg.npcs.find(n=>n.id==='musoe');
  // 결정 D-75: 먹 전환 글자는 상대에 맞춘다. 삼촌과는 싸움이 아니라 시험이다.
  inkTransition('시험',(n.x-G.cam)/W*100,()=>startBattle('musoe',(res,info)=>{
    if(res==='lose'||res==='flee'){talk([['무쇠','아직 멀었다.\n숨 고르고 다시 와라.']]);return;}
    const perfect=res==='win'&&info.hits===0;
    G.f.musoeTested=true;rel('musoe',(res==='calm'||perfect)?2:1);ledger('musoe','무쇠 삼촌','숯 1','아빠가 맡긴 낫');
    if(perfect)G.f.musoeCoal=true;   // 결정 D-139: 시험 숯은 날을 더 세우는 몫(확정 §9). 벼리기엔 날쌘 숯이 따로 든다.
    if(typeof grantTool==='function')grantTool('pickaxe');
    diary('test',res==='calm'?'무쇠 삼촌에게 먹을 것을 건네 마음을 풀었다. 아빠도 이렇게 했을까.':'무쇠 삼촌이 꿀밤으로 연장부터 빼앗고 덤볐다. 끝까지 피했더니, 마지막에 꿀밤을 한 대 쥐어박고는 됐다고 했다.');
    talk([['무쇠',res==='calm'?'…배부터 채웠으니 고집은 그만 부리마.':perfect?'허, 그 한 대 말고는 다 피했군.\n형 아들 맞다.':'끝까지 버티는 건 형을 닮았군.'],
      ['무쇠','연장은 도로 가져가라.\n떨어지며 이가 나갔다. 낫 벼릴 때 같이 세우마.'],['무쇠','돌 만나면 그걸로 쳐라.']],musoeLeaf);
  }));
}
/* 시험 뒤: 아빠가 맡긴 잎사귀와 첫 변신. 길 떠나는 날 집안 어른이 잎을 주는 것이 유씨 집안 풍습이다. */
function musoeLeaf(){
  const F=G.f;
  if(F.leafGiven){musoeAfterLeaf();return;}
  // 결정 D-129: 잎은 아는 만큼만 바뀐다. 다람쥐를 아직 못 봤으면 잎을 주지 않고 보고 오라고 한다.
  const sawDodam=F.dodamTalk||knows('met:dodam'),sawBros=F.galSquirrelSeen;
  if(!sawDodam&&!sawBros){
    F.leafHeld=true;
    talk([['무쇠','하나 더 줄 게 있다만.'],['무쇠','오늘 다람쥐는 봤냐.'],['너구리','다람쥐요? 아직요.'],
      ['무쇠','그럼 아직 못 준다.\n가서 다람쥐부터 보고 와라.'],['너구리','다람쥐는 왜요?'],['무쇠','보고 오면 안다.'],
      ['무쇠',CLASSIC?'마을 어귀에 도담이가 있다.':'길목에 다람쥐 형제가 도토리를 세더라.\n숲엔 도담이도 있고.']]);
    return;
  }
  const thinkOf=sawDodam?'도담을 떠올리며 잎을 분다':'길에서 본 다람쥐 형제를 떠올리며 잎을 분다';
  const open=F.leafHeld?[['무쇠','다람쥐는 봤냐.'],['너구리','네. 보고 왔어요.'],['무쇠','그럼 이거다.']]:[['무쇠','하나 더 있다.']];
  talk([...open,['너구리','(삼촌이 품에서 접어 둔 잎 하나를 꺼낸다.)'],['너구리','나뭇잎이요?'],
    ['무쇠','당산나무 잎이다.\n형이 낫이랑 같이 맡겼다.'],['무쇠','제 발로 길 나서는 날 주라더군.\n우리 집안 풍습이다.'],
    ['무쇠','잘 봐라.'],
    ['너구리','(삼촌이 자기 잎을 입술에 대고 짧게 분다.\n모루 옆에 오소리 한 마리가 선다.)'],
    ['너구리','삼촌이… 오소리가 됐어!'],
    ['무쇠','잎은 네가 아는 만큼만 바뀐다.\n모르는 건 흉내도 안 된다.'],
    ['무쇠','오늘 본 것 중에 제일 잘 아는 걸 떠올려라.\n이것도 할 수 있겠냐?',[{t:thinkOf,go:musoeFirstForm}]]]);
}
function musoeFirstForm(){
  const F=G.f;F.leafGiven=true;F.leafSplit=true;   // 결정 D-117: 이 뒤로 엄마 잎 이야기는 다시 말을 걸 때 한 번만
  if(typeof unlockForm==='function')unlockForm('squirrel');
  if(typeof setForm==='function')setForm('squirrel');
  diary('form_squirrel','삼촌에게 아빠가 맡긴 잎사귀를 받았다. 다람쥐를 떠올리며 잎을 부니 내가 다람쥐가 됐다. 다람쥐는 잊어도 다시 찾는다. 그래서 겁 없이 오른다.');
  talk([['너구리','(삐익, 풀피리 소리가 났다. 몸이 작아지고 꼬리가 커졌다.)'],['너구리','나… 다람쥐야!'],
    ['무쇠','됐다. 잎을 한 번 더 불면 돌아온다.'],['너구리','(잎을 다시 부니 너구리로 돌아왔다.)']],()=>{
      if(typeof setForm==='function')setForm('');
      toast('잎사귀 변신을 배웠다! 1 다람쥐 · 0 너구리 (휴대폰은 잎사귀 버튼)');
      // 결정 D-89: 무쇠 대사를 한자리에 몰지 않는다. 엄마 잎 이야기와 낫 벼리기 안내는 다시 말을 걸 때 이어진다.
    });
}
function musoeAfterLeaf(){
  const F=G.f;F.musoeAfterLeaf=true;
  talk([['너구리','엄마 경대 위에도 마른 잎이 있었어요.\n버리지 말라고 하셨는데.'],
    ['무쇠','네 어미 잎이다.\n둔갑을 못 하게 된 뒤로 말라 갔을 게다.'],
    ['너구리','엄마 약을 구하면 그 잎도 살아나요?'],['무쇠','모른다.\n그러니 가 봐라.'],['무쇠','네 어미는 내가 들여다본다.\n다리는 절어도 그 길은 간다.'],
    // 결정 D-139: 시험 숯을 받았으면 벼릴 숯이 따로 든다.
    ['무쇠',has('coal',F.musoeCoal?2:1)?'다만 녹슨 낫은 벼려야 한다.\n숯은 있으니 됐다.':F.musoeCoal?'다만 녹슨 낫은 벼려야 한다.\n아까 그 숯은 날 세울 때 쓰마. 벼릴 숯은 네가 구해 와라.':'다만 녹슨 낫은 벼려야 한다.\n숯이 떨어졌으니 구해 와라.']],()=>{if(has('coal',F.musoeCoal?2:1))talkMusoe();});
}

/* 대장간: 낫 벼리기는 무쇠 삼촌이 직접 한다. */
// 결정 D-88: 손일은 미니게임 없이 바로 마친다 (확정: 미니게임은 채집·전투·놀이에만, 대장 2026-10-30). 막혀 있던 판정 코드는 지웠다.
function openForge(){Sound.stone?.('tap');finishForge();}
function finishForge(){
  if(G.f.musoeDone)return;
  takeItem('coal',1);
  let sharp=false;if(has('coal')){takeItem('coal',1);sharp=true;}
  G.tool='sickle';G.sharp=sharp;G.f.musoeDone=true;learn('musoe:forge');ledgerDone('musoe');rel('musoe',MG.handwork_forge_relation);
  diary('sickle','아빠의 낫을 받았다. 손잡이에 아빠 손때가 묻어 있다.');
  if(!Rg.arcsEnabled())clue('m2','무쇠 삼촌','아빠는 떠나기 전 사흘을 삼촌 대장간에서 묵으며 밤마다 낡은 장부만 들여다봤다.');
  toast('아빠의 낫을 얻었다!'+(sharp?' 날이 더 날카롭다':''));
  refreshHud();
  talk(Rg.arcsEnabled()?
    [['무쇠','됐다. 네 아비 낫이다.\n곡괭이 이도 메웠다.'],['무쇠',sharp?'숯이 넉넉해서 날을 더 세웠다.':'덩굴은 그걸로 끊어라.'],['무쇠','당산나무 앞 칡은 조심해라.']]:
    [['무쇠','됐다. 네 아비 낫이다. 곡괭이 이도 메웠다.'+(sharp?'\n숯이 넉넉해서 날을 더 세웠다.':'')],['무쇠','형은 떠나기 전 사흘을 여기서 묵었다.\n낡은 장부만 보더군. 집에선 못 펴 볼 거였겠지.'],['무쇠','덩굴은 그걸로 끊어라.\n당산나무 앞 칡은 성질 고약하다.']]);
}

/* ---------- 두꺼비 할멈 (약재상) ---------- */
// 결정 D-78: 가공품을 얹으면 덤 하나(확정 PA-9 B). 할멈은 묵을 약과 함께 엄마에게 보내고, 길에서 먹을 버섯을 얹어 준다.
function toadGive(i=0){
  if(!has('meoru')||G.diary.some(d=>d.id==='end'))return;
  if(i===1&&has('acorn_jelly')){
    takeItem('acorn_jelly',1);addItem('kkoe',1);
    talk([['두꺼비 할멈','묵까지 쑤어 왔구나. 약이랑 같이 까치 편에 보내마.\n네 엄마 입이 좀 달겠지.'],['두꺼비 할멈','너도 길에서 끓여 먹으렴.'],
      ['너구리','(할멈이 말린 꾀꼬리버섯을 하나 얹어 준다.)']],()=>toadGive(0));return;
  }
  // 결정 D-129: 집은 마을 어귀다. 아이가 들고 가지 않고 까치가 나르는 까닭을 할멈이 말한다.
  const why=[['너구리','제가 갖다 드리면 안 돼요?'],
    ['두꺼비 할멈','네가 들고 가면, 엄마 얼굴 보고\n그 문턱을 다시 넘기 어려울 게다.'],
    ['두꺼비 할멈','약은 까치가 나른다.\n너는 눈 오기 전에 고개를 넘으렴.'],['너구리','…그럼 까치한테 같이 전해 주세요.\n아빠 손 꼭 잡고 돌아가겠다고.']];   // 결정 D-134: 아이의 답
  talk(Rg.arcsEnabled()?
    [['두꺼비 할멈','이걸로 네 엄마 약을 달여서\n까치 편에 집으로 보내 주마.'],...why,
      ['두꺼비 할멈','다만 병을 늦출 뿐이란다.'],['두꺼비 할멈','고치려면 전설의 열매가 있어야 한단다.'],
      ['두꺼비 할멈','북쪽 돌너머의 서리다래라면 한 번 더 늦출 게다.\n어디 열리는지는 그 마을에 물어보렴.']]:
    [['두꺼비 할멈','이걸로 약을 달이면 네 엄마 병을 조금 늦출 수 있을 게다.\n까치 편에 보내마.'],...why,['두꺼비 할멈','다만 늦출 뿐이란다. 고치려면 전설의 열매가 있어야 한단다.'],['두꺼비 할멈','북쪽 돌너머의 서리다래라면 한 번 더 늦출 게다.\n어디 열리는지는 그 마을에 물어보렴.'],['두꺼비 할멈','덩굴이 걷혔으니 북쪽 길도 열렸겠구나. 네 아빠도 그 길로 갔단다.']],()=>{
    takeItem('meoru',1);ledgerDone('toad');rel('toad',1);
    diary('end','할멈이 엄마에게 약을 보내 주었다. 북쪽 길이 열렸다. 아빠, 기다려요.');
    if(Rg.arcsEnabled()){
      G.f.galArcToad1=true;
      diary('galArcToad1','두꺼비 할멈이 해머루로 엄마의 병을 늦추는 약을 지어 까치 편에 보냈다.');
      toadFarewell();return;
    }
    toadFarewell();
  });
}
function talkToad(){
  if(G.diary.some(d=>d.id==='end')){toadFarewell();return;}
  if(Rg.arcsEnabled()&&G.f.galArcToad1){toadFarewell();return;}
  if(has('meoru')&&G.f.toadMet){
    talk([['두꺼비 할멈','해머루구나. 칡이 나무를 놓아줬구나.'],['두꺼비 할멈','…잘 익었구나. 어디, 보따리를 펼쳐 보렴.',[{t:'보따리를 펼친다',go:()=>Trade.open('toad')},{t:'조금 이따가요',go:null}]]]);
    return;
  }
  if(!G.f.toadMet){G.f.toadMet=true;rel('toad',1);
    ledger('toad','두꺼비 할멈','해머루 1','엄마의 병을 늦추는 약');
    // 결정 D-134: D-129 ② 되돌림. 확정(npcs.csv) 그대로 아빠는 전설의 열매를 물었다. 할멈은 그때 엄마 병을 알았다. 말까지 잃어 간다는 건 편지를 나른 까치에게 들었다.
    // 해머루가 익자 까치 편에 아이 집으로 말을 보냈다(프롤로그). 해머루를 들고 먼저 와도 맞는 말을 한다.
    const fruit=has('meoru');
    clue('t1','두꺼비 할멈','아빠도 할멈에게 전설의 열매를 묻고 북쪽으로 갔다. 해머루가 익기를 기다리지 않았다.');
    diary('toad','두꺼비 할멈은 엄마의 병을 고칠 수는 없지만 늦출 수는 있다고 했다. 해머루가 필요하다.');
    talk([['두꺼비 할멈','어서 오렴. 까치가 말을 잘 전했구나.'],
      ['두꺼비 할멈','편지 물어다 준 그 까치가 그러더구나.\n네 엄마가 이젠 말까지 잃어 간다고.'],
      ['두꺼비 할멈','그건… 병이라기보다는…'],['두꺼비 할멈','…아니다. 내가 늙어서 헛말이 나오는구나.'],
      ['두꺼비 할멈',fruit?'칡이 그 나무를 놓아줬구나. 네 손이 한 게지.\n해머루… 이거면 병을 늦출 수는 있단다.':'내 손으로 고치진 못해도 병을 늦출 수는 있단다.\n당산나무 꼭대기 해머루를 가져오렴.'],
      ['너구리','아빠가 찾으러 간 만병통치약은요?\n그거면 엄마가 나아요?'],
      ['두꺼비 할멈','전설의 열매 말이로구나. 남들은 부자가 된다지만,\n나는 잃어버린 걸 돌려준다고 들었단다.'],
      ['두꺼비 할멈','네 아빠도 여기서 그 열매를 묻더구나.\n해머루는 아직이라니까, 기다리지 않고 북쪽으로 갔단다.'],
      ['두꺼비 할멈','…보따리에 약연 자루가 비죽 나왔구나.\n그건 아직 네가 쓸 때가 아니란다.'],
      ...(fruit?[['두꺼비 할멈','자, 해머루를 보자꾸나.',[{t:'보따리를 펼친다',go:()=>Trade.open('toad')},{t:'조금 이따가요',go:null}]]]:[])]);
  }else{
    const c=Rg.expLanternChoice?.();
    const leg=toadLegChoice(),geom=Rg.toadGeomChoice?.();
    talk([['두꺼비 할멈','해머루를 가져오렴. 당산나무 꼭대기란다.',[...(c?[c]:[]),...(leg?[leg]:[]),...(geom?[geom]:[]),{t:'보따리를 펼친다',go:()=>Trade.open('toad')},{t:'다녀올게요',go:null}]]]);
  }
}
function toadFarewell(){
  const F=G.f,c=[{t:'북쪽으로 떠난다',go:endGame}];
  if(Rg.arcsEnabled()&&!F.galArcToad2&&G.rel.toad.v>=1)c.push({t:'엄마를 아는지 묻는다',go:toadWinter});
  if(Rg.arcsEnabled()&&F.galArcToad2&&!F.galArcToad3)c.push({t:'떠나기 전에 인사를 드린다',go:toadWrap});
  {const lc=Rg.expLanternChoice?.();if(lc)c.push(lc);}
  if(!knows('home:'+Rg.id))for(const item of ['acorn_jelly','sesame_salt'])if(has(item))
    c.push({t:ITEMS[item].n+'을 까치 편에 보낸다',go:()=>galSendHome(item)});
  c.push({t:'보따리를 펼친다',go:()=>Trade.open('toad')});
  {const leg=toadLegChoice();if(leg)c.push(leg);const geom=Rg.toadGeomChoice?.();if(geom)c.push(geom);}
  c.push({t:'마을을 좀 더 둘러본다',go:null});
  talk([['두꺼비 할멈','북쪽으로 갈 채비는 됐니?',c]]);
}
// 새 엔진과 합치기 전에도 기존 가공품 배달로 한 번만 보낸다. 약 배달과는 별개다.
// 결정 D-89: 까치 답장은 아이가 본 것을 지문으로 쓴다 (영산과 같은 방식).
const homeReplies={
  acorn_jelly:[['너구리','(까치가 빈 묵 그릇을 물고 돌아왔다.)'],['너구리','(그릇에 엄마가 늘 쓰던 나무숟가락이 얹혀 있다.)']],
  sesame_salt:[['너구리','(돌아온 까치가 날개를 모아 코끝에 댔다.)'],['너구리','(엄마가 깨소금 종지를 그렇게 감싸 쥐었나 보다.)']]
};
Rg.homeReply=gift=>homeReplies[gift?.itemId]||homeReplies.acorn_jelly;
function galSendHome(item){
  if(knows('home:'+Rg.id)||!has(item))return;
  const reply=homeReplies[item];
  if(typeof sendHomeGift==='function'){sendHomeGift(Rg.id,item);return;}
  if(typeof sendCraftHome==='function'){
    sendCraftHome(item);
    const entry=G.diary.find(d=>d.id==='home:'+Rg.id);
    if(entry){
      entry.text=ITEMS[item].n+' 하나를 까치 편에 집으로 보냈다. '+reply;
      talk([['너구리',ITEMS[item].n+' 하나예요. 엄마한테 제가 만들었다고 전해 주세요.'],['너구리',reply]]);
    }
  }
}
// 결정 D-02: 할멈은 "너를 안고 이 길을 지나갔다"까지만 (design/data/decisions.csv)
function toadWinter(){
  if(!G.f.galArcToad1||G.rel.toad.v<1)return;
  arcScene('galArcToad2',[['너구리','할머니는 우리 엄마를 알아요?'],['두꺼비 할멈','알다마다. 너를 안고 이 길을 지나갔지.'],
    ['두꺼비 할멈','눈 내리던 겨울이었단다.'],['두꺼비 할멈','불가에 앉아서도 너를 한 번을 안 내려놓더구나.'],
    // 결정 D-134: 아기가 버틴 까닭(데우는 약)과, 아빠가 영산 전에 짐작을 품은 출처(할멈이 그 겨울 얘기를 했다).
    ['두꺼비 할멈','숨이 가늘어서… 데우는 약을 끓여 먹였지.'],
    ['너구리','엄마가요? 어디 가는 길이었어요?'],['두꺼비 할멈','…늙으면 말이 느려지지.'],
    ['두꺼비 할멈','네 아빠한테도 이 얘기는 했단다.\n석 달 전, 그 열매를 물으러 왔을 때.']],
    '두꺼비 할멈은 내가 아기였던 겨울, 엄마가 나를 안고 이 길을 지났다고 했다. 숨이 가늘던 나에게 데우는 약을 끓여 먹였고, 석 달 전 아빠에게도 이 이야기를 했단다. 어디 가는 길이었는지 묻자 말을 돌렸다.',null,toadFarewell);
}
function toadWrap(){
  if(!G.f.galArcToad2)return;
  arcScene('galArcToad3',[['두꺼비 할멈','이 끈을 가져가렴.'],['두꺼비 할멈','그 겨울, 네 포대기를 여미던 끈이란다.'],
    ['너구리','엄마가 두고 갔어요?'],['두꺼비 할멈','그래. 내내 간직했단다.\n떠나는 길이니, 네가 지니는 게 맞겠다.'],['너구리','엄마한테 가져갈게요.']],
    '두꺼비 할멈에게 그 겨울 엄마가 두고 간 포대기 끈을 받았다. 엄마에게 가져가려고 조심히 챙겼다.',
    ()=>learn('galchamgol:arc-toad-wrap'),toadFarewell);
}

/* ---------- 엉킨 칡 전투 ---------- */
Rg.startKudzu=()=>{
  G.px=1950-(Rg.hillShift||0);
  inkTransition('엉킨 칡',(G.boss.x-G.cam)/W*100,()=>startBattle('kudzu',res=>{
    if(res==='win'||res==='calm'){
      if(res==='calm')diary('calm','엉킨 칡을 부수지 않고 달랬다. 칡이 놓아준 자리에 보랏빛 꽃이 피어 있었다.');
      Rg.bossDie();
    }else{
      G.px=1900-(Rg.hillShift||0);G.f.faints+=res==='lose'?1:0;
      diary('hint','엉킨 칡은 부위마다 공격이 다르다. 덩굴손이나 뿌리를 먼저 꺾어야 심이 드러난다. 버섯 향을 좋아하는 것 같다.');
      talk([['너구리','(덩굴손이나 뿌리부터 꺾어야 심이 드러나.\n버섯 향을 좋아하는 것 같았어.)']],()=>toast('준비되면 다시 다가가자'));
    }
  }));
};

/* ---------- NPC (npcs.csv 의 id). x 는 필드 위치 ---------- */
Rg.npcs=[
  {id:'dodam',name:'도담',x:300,talk:talkDodam,draw:Rg.art.squirrel},
  {id:'nal',name:'날쌘',x:820,talk:talkNal,draw:COMMON_ART.weasel,props:COMMON_ART.nalProps},
  {id:'musoe',name:'무쇠',known:true,tag:'무쇠 삼촌',x:1110,talk:talkMusoe,draw:Rg.art.uncle,props:Rg.props.forge},
  {id:'toad',name:'두꺼비 할멈',x:1430,talk:talkToad,draw:Rg.art.toad,props:Rg.props.toad},
];

/* ---------- 지금 할 일 ---------- */
Rg.goal=()=>{
  const F=G.f;
  if(!G.started)return '';
  if(G.ended)return '단풍골 체험판 완료';
  // 결정 D-67: 할 일은 가장 앞선 진행부터 거꾸로 본다. 변신으로 앞질러 가도 지금 상태에 맞는 일을 알려 준다.
  if(G.diary.some(d=>d.id==='end')||(Rg.arcsEnabled()&&F.galArcToad1))return '할멈께 인사드리고 북쪽으로 떠나자';
  if(G.boss.dead)return has('meoru')?'할멈께 해머루를 가져다드리자':'떨어진 해머루를 줍자';
  if(G.barrier.cut||mapVisited(Rg.id,'hill'))return '당산나무의 엉킨 칡과 맞서자 (부수거나 달래거나)';
  if(!F.dodamTalk)return '당산나무 해머루에 오르는 길을 마을 어귀의 도담에게 묻자';
  const ac=G.inv.acorn||0;
  const powderStep=()=>has('powder')?null:(ac<3?'도토리를 줍자 ('+ac+'/3)':'보따리를 열고 엄마의 절구에 도토리 3개를 넣어 빻자');
  if(!F.dodamDone)return powderStep()||'도담에게 도토리 가루를 건네자';
  if(!F.musoeMet)return '물레방아 너머 대장간의 무쇠 삼촌을 찾아가자';
  if(!F.musoeTested&&!F.musoeDone)return '무쇠 삼촌 앞에서 버텨 내자 (다시 말을 걸면 된다)';
  if(F.leafHeld&&!F.leafGiven&&!F.musoeDone)return '다람쥐를 봤으니 무쇠 삼촌께 잎사귀를 받자';
  if(F.leafGiven&&!F.musoeAfterLeaf&&!F.musoeDone)return '무쇠 삼촌과 하던 이야기를 마저 하자';
  if(!F.musoeDone){
    if(has('coal',F.musoeCoal?2:1))return '무쇠 삼촌께 숯을 가져다드리자';   // 결정 D-139
    if(!F.nalTalk)return '물레방아 옆 날쌘에게 숯을 구하자';
    const p=powderStep();if(p)return p;
    if(!has('root'))return '반짝이는 흙더미를 곡괭이로 쳐서 칡뿌리를 캐자';
    return '날쌘에게 도토리 가루와 칡뿌리를 건네자';
  }
  return '마을 끝 칡덩굴을 낫으로 끊자';
};

/* PA-43: 첫 가을의 길손과 조사. classic은 위의 지도와 대사를 그대로 쓴다. */
if(!CLASSIC){
  // 결정 D-88: 손일은 미니게임 없이 바로 마친다 (확정: 미니게임은 채집·전투·놀이에만, 대장 2026-10-30). 막혀 있던 판정 코드는 지웠다.
  // 함께 손쓰는 일(보자기 누르기 등)은 대사 속 한 동작으로 끝낸다.
  function hands(title,kind,steps,commit){
    if(G.ended)return;
    Sound.gather(true);if(G.f.galHandsProgress)delete G.f.galHandsProgress[kind];commit();refreshHud();
  }
  const done=id=>!!G.f.wanderersDone?.['galchamgol:'+id];
  const picture=name=>(x,y,f)=>Rg.expArt[name](x,y,f);
  function magpieTalk(){
    talk([['늙은 까치','에구, 이 바람아.\n빈 보자기까지 채 가려고.'],
      ['늙은 까치','아가, 이 끝 좀 눌러 다오.\n발이 예전 같지 않아서 매듭이 자꾸 도망가는구나.'],
      ['너구리','제가 잡을게요.\n…이거 약보자기예요?'],
      ['늙은 까치','그래. 늪가 두꺼비 할멈이 달인 약을 아픈 집마다 나르지.\n개울 아래 초가, 네 집 문턱도 내가 안단다.',[
        {t:'두 손으로 보자기를 눌러 드린다',go:()=>hands('까치의 약보자기','magpie',[
          '보자기 왼쪽 귀를 누른다','반대쪽 귀도 겹쳐 잡는다','까치가 묶을 손잡이를 남긴다'],()=>talk([
          ['너구리','(두 손으로 보자기 귀를 꾹 누른다.)'],
          ['늙은 까치','옳지. 손이 따뜻하구나.\n…예전엔 이걸 한 발로도 묶었는데.'],
          // 결정 D-129: 아빠의 마지막 편지도 이 까치가 날랐다. 할멈은 이 까치에게 엄마 소식을 들었다.
          ['너구리','우리 집 문턱을 아시면…\n아빠 편지도 할머니가 갖다주셨어요?'],
          ['늙은 까치','그래. 돌너머 까치가 넘겨 준 걸 받아 날랐지.\n네 아빠 얼굴은 나도 못 봤구나.'],
          ['늙은 까치','보따리를 멨구나. 길 떠나는 게지?\n길 따라 소식 나르는 게 내 일이란다.'],
          ['늙은 까치','길에서 또 만나면, 집 소식을 전해 주마.'],
          ['너구리','그럼 그때 엄마한테도…\n나 잘 있으니까 걱정 마시라고 전해 주세요.']
        ],()=>{
          diary('galExpMagpie','늙은 까치의 약보자기를 두 손으로 눌러 드렸다. 아빠의 마지막 편지도 이 까치가 날라 왔다. 까치는 길 따라 소식을 나른다고 했다. 엄마한테 나는 잘 있으니 걱정 마시라고 전해 달라고 했다.');
          finishWanderer('old_magpie');
          // 결정 D-33: 까치 떼 이동을 말할 때 젊은 까치 둘이 곁에 내려앉고, 그 뒤로 늙은 까치 곁에 머문다 (design/data/decisions.csv)
          talk([['늙은 까치','참, 아가. 길이 멀어 발이 아프거든 하늘을 보고 불러라.']],()=>{
            G.f.galMagpieYoung=true;
            talk([
              ['너구리','(늙은 까치가 짧게 울자, 덩치 큰 까치 둘이\n지붕에서 내려앉았다.)'],
              ['늙은 까치','우리 집 젊은 것들이다.\n이 애들이 데려다줄 게다.'],
              ['너구리','저를요? 어떻게요?'],
              ['늙은 까치','네 귀 한쪽씩 잡고 날면 되지.\n…가 본 길로만 다닌단다. 모르는 길은 저 애들도 몰라.']
            ],()=>{G.f.mapUnlocked=true;toast('지도(M)를 펴면 가 본 곳으로 까치 떼를 부를 수 있다');});
          });
        }))},{t:'바람이 잦아들면 도와드릴게요',go:null}]]]);
  }
  function brothersTalk(){
    G.f.galSquirrelSeen=true;   // 결정 D-129: 다람쥐를 봤다 (무쇠의 잎사귀 변신은 본 것만 된다)
    const sorted=G.f.galExpBrothersSorted;
    if(G.f.galExpBrothersAsked&&sorted){
      // 결정 D-34: 고르게 나누기 / 형 편 / 동생 편. 덤만 다르고 붉은 옹이 길 안내는 같다 (design/data/decisions.csv)
      const side=G.f.galExpBrothersSide||'even';
      const pay=(id,n)=>{if(!G.f.galExpBrothersPaid){G.f.galExpBrothersPaid=true;addItem(id,n);}};
      const lines={
        even:[['다람쥐 형','큰 것부터 번갈아 놓으니 양쪽이 비슷하네.'],['다람쥐 동생','내 몫이 적다고만 생각했는데!'],
          ['너구리','한 바구니에 담고,\n겨울에 같이 먹으면?'],
          ['다람쥐 형','그럼 내가 숨긴 자리를 적어 둘게.'],['다람쥐 동생','난 덮어 둔 낙엽 모양을 그려 둘래!'],
          ['다람쥐 형','이건 고르게 나눠 준 몫이야. 도토리 한 알.'],
          ['다람쥐 형','높은 가지에 붉은 옹이가 있어.\n그 아래 굵은 가지를 디뎌 봐.'],['다람쥐 동생','거기 우리 말고 누가 남긴 자국이 있더라!']],
        hyung:[['다람쥐 형','봐, 내 말이 맞지! 큰 건 내 몫이야.'],['다람쥐 동생','…치.'],
          ['다람쥐 형','내 편 들어 줬으니 큰 도토리 두 알 줄게.'],
          ['다람쥐 형','그리고 높은 가지에 붉은 옹이가 있어.\n그 아래 굵은 가지를 디뎌 봐.'],['다람쥐 동생','…거기 누가 남긴 자국도 있어. 형은 모르지?']],
        dongsaeng:[['다람쥐 동생','거봐! 찾은 건 나라니까.'],['다람쥐 형','…쳇.'],
          ['다람쥐 동생','내 편 들어 줬으니까 이거 줄게.\n낙엽 밑에서 찾은 싸리버섯이야.'],
          ['다람쥐 동생','높은 가지에 붉은 옹이가 있어.\n거기 우리 말고 누가 남긴 자국이 있더라!'],['다람쥐 형','…그 아래 굵은 가지를 디디면 돼.']]
      };
      const notes={
        even:'다람쥐 형제와 도토리를 큰 것부터 번갈아 나눴다. 겨울에는 같은 바구니에서 먹기로 했다. 형제가 숲 높은 가지의 붉은 옹이를 알려 주었다.',
        hyung:'다람쥐 형제 다툼에서 일곱 번 오간 형 편을 들었다. 형이 큰 도토리 두 알을 주었고 동생은 토라졌다. 숲 높은 가지의 붉은 옹이를 들었다.',
        dongsaeng:'다람쥐 형제 다툼에서 낙엽을 걷어 찾은 동생 편을 들었다. 동생이 싸리버섯을 주었고 형은 토라졌다. 숲 높은 가지의 붉은 옹이를 들었다.'
      };
      talk(lines[side],()=>{
        pay(...({even:['acorn',1],hyung:['acorn',2],dongsaeng:['ssari',1]})[side]);
        diary('galExpBrothers',notes[side]);
        finishWanderer('squirrel_brothers');
      });return;
    }
    if(G.f.galExpBrothersAsked){
      talk([['다람쥐 동생','우린 아직 큰 도토리를 서로 세고 있어.'],['다람쥐 형','오른쪽 낮은 평상에서 같이 나눠 주기로 했잖아!']],shareBaskets);return;
    }
    talk([['다람쥐 형','내가 일곱 번을 오갔으니 큰 도토리는 내 몫이지.'],['다람쥐 동생','내가 낙엽을 걷어 찾았잖아!'],
      ['너구리','겨울 먹을 거야?\n작은 것만 한쪽에 몰렸네.'],
      ['다람쥐 형','큰 건 몇 알 안 되는데, 둘 다 욕심이 나서.'],['다람쥐 동생','도담처럼 묻어 놓고 잊을까 봐 더 그래.'],
      ['다람쥐 형','오른쪽 낮은 평상으로 바구니를 옮겨 둘게.\n어떻게 나누면 좋을지 같이 봐 줄래?',[
        {t:'좋아, 같이 봐 줄게',go:()=>{G.f.galExpBrothersAsked=true;toast('오른쪽 낮은 평상에서 바구니를 나누자 · E');}},
        {t:'다음에 같이 보자',go:null}]]]);
  }
  /* 결정 D-117: 다람쥐 형제 후일담. 누구 편을 들었는지(galExpBrothersSide)가 그 뒤의 관계를 바꾼다.
     ① 바구니 자리 다툼, 또는 편을 들어 준 일로 토라짐 → ② 칡이 풀린 숲 안쪽에 묻을 자리를 그려 줌 → ③ 떠나는 날 도토리 두 알 */
  function brosArcChoice(){
    const F=G.f;if(!Rg.arcsEnabled()||!done('squirrel_brothers'))return null;
    const side=F.galExpBrothersSide||'even';
    if(!F.galArcBros1&&F.leafGiven)return {t:side==='even'?'바구니를 어디 묻을지 묻는다':'둘이 왜 따로 앉았는지 묻는다',go:brosQuarrel};
    if(F.galArcBros1&&!F.galArcBros2&&G.boss.dead)return {t:'숲 안쪽 이야기를 듣는다',go:brosMap};
    if(F.galArcBros2&&!F.galArcBros3&&G.diary.some(d=>d.id==='end'))return {t:'북쪽으로 간다고 인사한다',go:brosFarewell};
    return null;
  }
  function brosQuarrel(){
    const side=G.f.galExpBrothersSide||'even';
    const lines={
      even:[['다람쥐 형','바구니를 어디 묻을지로 또 다퉜어.'],['다람쥐 동생','형은 큰 바위 밑, 나는 단풍나무 뿌리!'],
        ['너구리','둘 다 잊어버리면?'],['다람쥐 형','…그럼 둘 다 겨울에 굶지.'],['다람쥐 동생','도담처럼!'],
        ['너구리','반씩 나눠 묻고, 형 자리는 동생이,\n동생 자리는 형이 외우면?'],
        ['다람쥐 형','내가 잊어도 동생이 기억하고…'],['다람쥐 동생','내가 잊어도 형이 기억하고!'],
        ['다람쥐 형','그럼 한 바구니에서 먹는 거랑 똑같네.']],
      hyung:[['너구리','(동생이 형한테서 등을 돌리고 앉아 있다.)'],['다람쥐 형','쟤 아직도 저래.\n큰 거 몇 알 가지고.'],
        ['너구리','…그때 내가 형 편만 들어서 그래?'],['다람쥐 동생','낙엽 걷는 것도 힘들거든.\n그건 아무도 안 세.'],
        ['너구리','미안. 그건 내가 못 봤어.'],['다람쥐 형','…낙엽 밑에서 찾은 건 맞아. 쟤가.'],
        ['다람쥐 동생','형이 방금 뭐라고 했어?'],['다람쥐 형','아무 말도 안 했어!']],
      dongsaeng:[['너구리','(형이 동생한테서 등을 돌리고 앉아 있다.)'],['다람쥐 동생','형 아직도 삐졌어.\n찾은 건 나라니까.'],
        ['너구리','…그때 내가 동생 편만 들어서 그래?'],['다람쥐 형','일곱 번 오간 다리는 아무도 안 세.'],
        ['너구리','미안. 그건 내가 못 봤어.'],['다람쥐 동생','…형이 많이 오간 건 맞아.'],
        ['다람쥐 형','방금 뭐라고 했어?'],['다람쥐 동생','아무 말도 안 했어!']]
    };
    const notes={
      even:'다람쥐 형제가 바구니 묻을 자리로 다퉜다. 반씩 묻고 서로 상대의 자리를 외우자고 했다. 한 사람이 잊어도 다른 사람이 기억한다.',
      hyung:'형 편을 들어 줬던 일로 동생이 아직 토라져 있었다. 낙엽을 걷은 수고는 아무도 세지 않았다고. 미안하다고 하자 형이 처음으로 동생이 찾은 걸 인정했다.',
      dongsaeng:'동생 편을 들어 줬던 일로 형이 아직 토라져 있었다. 일곱 번 오간 다리는 아무도 세지 않았다고. 미안하다고 하자 동생이 처음으로 형의 수고를 인정했다.'
    };
    arcScene('galArcBros1',lines[side],notes[side]);
  }
  function brosMap(){
    const side=G.f.galExpBrothersSide||'even';
    const split={
      even:[['다람쥐 동생','형 자리는 내가 외울게.'],['다람쥐 형','네 자리는 내가.']],
      hyung:[['다람쥐 형','…뿌리 쪽은 네가 찾은 데니까 네 거 해.'],['다람쥐 동생','진짜? …그럼 바위 쪽은 형 거.']],
      dongsaeng:[['다람쥐 동생','…바위 쪽은 형이 여러 번 날라야 하니까\n형 거 해.'],['다람쥐 형','…그래. 그럼 뿌리 쪽은 네 거.']]
    }[side];
    arcScene('galArcBros2',[['다람쥐 형','당산나무 칡이 풀리니까\n숲 안쪽 흙이 부드러워졌어!'],
      ['다람쥐 동생','거기 묻으면 겨울에도 안 얼겠다.'],
      ['너구리',G.f.galArcDodam2?'자리 그려 줄까? 도담한테도 그려 줬어.':'자리 그려 줄까? 그려 두면 안 잊어.'],
      ['다람쥐 형','그려 줘! 나무껍질에!'],
      ['너구리','(나뭇가지로 넓은 껍질에 두 자리를 그렸다.\n큰 바위 밑 하나, 단풍나무 뿌리 하나.)'],
      ...split,
      ['다람쥐 형','이 껍질은 둘이 같이 보는 거야.'],['다람쥐 동생','응. 같이!']],
      '칡이 풀리자 숲 안쪽 흙이 부드러워졌다. 다람쥐 형제에게 묻을 자리 둘을 나무껍질에 그려 주었다. 둘이 같이 보는 껍질이 되었다.');
  }
  function brosFarewell(){
    arcScene('galArcBros3',[['너구리','나 내일 북쪽으로 가.'],['다람쥐 동생','벌써?'],['다람쥐 형','잠깐만 기다려!'],
      ['너구리','(형제가 낙엽 더미에 머리를 박고 한참 뒤적인다.)'],
      ['다람쥐 형','큰 거 하나, 내가 골랐어.'],['다람쥐 동생','작은 거 하나, 내가 골랐어!'],
      ['다람쥐 형','길에서 배고프면 먹어.'],['다람쥐 동생','누구랑 나눠 먹어도 되고!'],
      ['너구리','집에 돌아가면 엄마랑 나눠 먹을게.'],
      ['다람쥐 형','그럼 썩지 않게 꼭 싸 둬.']],
      '북쪽으로 간다고 하자 다람쥐 형제가 도토리를 하나씩 골라 주었다. 큰 것 하나, 작은 것 하나. 집에 돌아가면 엄마랑 나눠 먹을 것이다.',
      ()=>addItem('acorn',2));
  }
  function shareBaskets(){
    if(!G.f.galExpBrothersAsked){brothersTalk();return;}
    if(G.f.galExpBrothersSorted){brothersTalk();return;}
    const pick=side=>{G.f.galExpBrothersSorted=true;G.f.galExpBrothersSide=side;brothersTalk();};
    talk([['다람쥐 형','바구니 두 개 다 가져왔어.\n어떻게 나눌래?',[
      {t:'큰 것부터 번갈아 고르게 나눈다',go:()=>hands('형제와 도토리 나누기','brothers',['제일 큰 알은 왼쪽','다음 큰 알은 오른쪽','작은 알도 왼쪽','마지막 알은 오른쪽'],()=>pick('even'),true)},
      {t:'형 편을 든다: "일곱 번 오갔으니 큰 건 형 몫이야"',go:()=>pick('hyung')},
      {t:'동생 편을 든다: "낙엽을 걷어 찾았으니 동생 몫이야"',go:()=>pick('dongsaeng')},
      {t:'조금 더 생각해 볼게',go:null}]]]);
  }
  function chickTalk(){
    if(G.f.galExpChickWith&&G.f.galExpChickX>=2090){
      talk([['꺼병이','저기 갈대가 흔들려! 엄마 꼬리야!\n아까는 내 발소리에 묻혀서 못 들었나 봐.'],
        ['너구리','이제 뛰어가도 돼.\n난 여기서 보고 있을게.'],
        ['꺼병이','엄마! 나 여기 있어!\n…아, 도토리 얘기는 엄마한테 비밀이야.'],
        ['꺼병이','고마워, 사뿐발 보부상!\n물이 반짝이는 쪽으로 가면 약방이야. 엄마가 그랬어.']
      ],()=>{
        diary('galExpChick','도토리를 따라오다 길을 잃은 꺼병이와 물가까지 걸었다. 갈대 너머 어미의 대답을 듣고 제 길을 찾았다. 내 발소리도 작아졌다.');
        if(typeof grantNickname==='function')grantNickname('gal_quiet_steps','사뿐발 보부상','꺼병이');
        finishWanderer('lost_chick');
      });return;
    }
    if(G.f.galExpChickWith){talk([['꺼병이','물가의 갈대까지 천천히 가자.\n네가 너무 앞서가면 난 여기서 기다릴게.']]);return;}
    talk([['꺼병이','엄마가 둥지 곁에만 있으랬는데,\n도토리가 굴러가서… 나무가 다 똑같아.'],
      ['너구리','어디서 만나기로 했어?\n엄마가 뭐라고 했는데?'],
      ['꺼병이','해 지면 물가의 갈대 아래. 울음으로 부르랬어.\n근데 내 발소리가 너무 커서 대답이 안 들려.'],
      ['너구리','같이 천천히 걷자.\n네가 멈추면 나도 멈출게.',[
        {t:'꺼병이 곁에서 물가 쪽으로 걷는다',go:()=>{G.f.galExpChickWith=true;G.f.galExpChickX=1540;toast('오른쪽 갈대까지 함께 걷자. 멀어지면 꺼병이는 기다린다');}},
        {t:'여기서 기다려. 길부터 살필게',go:null}]]]);
  }
  /* 결정 D-117: 새 떠돌이 둘. 아이가 날라 주는 것으로 관계가 생긴다.
     여울(개울의 어린 수달): 아이가 타고 내려가는 함지박을 밤마다 도로 밀어 올려 둔다. 그 함지박 밑에 우리 집 낙관(流)이 있다.
     검댕(참나무 숲 숯쟁이 오소리): 연기에 눈이 절었다. 할멈의 눈약 ↔ 검댕의 숯을 아이가 오가며 나르고, 날쌘의 숨은 덤을 듣는다. */
  function otterTalk(){
    const F=G.f;
    if(!F.galArcOtter1){
      arcScene('galArcOtter1',[['너구리','(수달 하나가 빈 함지박을 머리에 이고\n개울을 거슬러 오른다.)'],
        ['여울','어! 이거 타고 대장간 쪽 내려가려고?'],
        ['너구리','타도 돼?'],
        ['여울','타도 돼. 다 타면 도로 올려놔야지.\n밤마다 내가 밀어 올린다고!'],
        ['너구리','아… 그래서 늘 그 자리에 있었구나.'],
        ['여울','이거 빨래 아줌마 거야.\n아줌마 오면 써야 하니까.'],
        ['너구리','빨래 아줌마?'],
        ['여울','넓적돌에서 방망이 두드리던 아줌마.\n여름부터 안 와.'],
        ['여울','그래도 내가 지키고 있어.\n넌 타고 놀아도 돼. 대신 올려놓고 가.']],
        '개울에서 빈 함지박을 이고 오르는 수달 여울을 만났다. 그 함지박을 밤마다 도로 밀어 올려 둔다고 한다. 여름부터 안 오는 빨래 아줌마 것이라, 그분이 오면 써야 한다며.');
      return;
    }
    if(!F.galArcOtter2){
      // 결정 D-129: 함지박을 타 보고 뒤집어 말릴 때 낙관을 본다 (할멈을 만난 것과는 상관없다).
      if(!F.galTravelTaught_stream){talk([['여울','빨래 아줌마 아직 안 왔어.\n…함지박 안 타 봐? 재밌는데.']]);return;}
      arcScene('galArcOtter2',[['너구리','(함지박을 뒤집어 말리는데, 밑바닥에\n낙관 하나가 찍혀 있다. 流.)'],
        ['너구리','…이거 우리 집 거야.\n함지박은 다 똑같은 줄 알았는데.'],
        ['여울','어? 너 빨래 아줌마네 애야?'],
        ['너구리','빨래 아줌마… 우리 엄마야.'],
        ['여울','아줌마 왜 안 와? 나 계속 기다렸는데.'],
        ['너구리','엄마가 아파. 여름부터.'],
        ['너구리','(여울이 함지박 끈을 만지작거린다.)'],
        ['여울','…아줌마가 빨래 다 하면\n나한테 물수제비 떠 줬어. 일곱 번.'],
        ['너구리','엄마가? 그런 거 하는 줄 몰랐어.'],
        ['여울','엄청 잘해! 나보다 잘해.'],
        ['너구리','(엄마가 물가에서 웃는 걸 본 지 오래됐다.)']],
        '함지박 밑바닥에 우리 집 낙관 流가 찍혀 있었다. 여울이 말하는 빨래 아줌마는 엄마였다. 엄마는 빨래를 마치면 여울에게 물수제비를 일곱 번 떠 줬다고 한다. 나는 몰랐다.',
        ()=>learn('otter:stone'));
      return;
    }
    if(!F.galArcOtter2b&&F.musoeDone){
      // 선택지를 고르면 대화의 끝 콜백이 지워지므로, 던진 뒤의 대사는 선택지에서 바로 잇는다.
      const thrown=[['너구리','(돌이 통, 통, 통 하고 가라앉았다.)'],
        ['여울','세 번? 빨래 아줌마 아들이면서?'],
        ['너구리','엄마한테 안 배웠어. 몰랐으니까.'],
        ['여울','그럼 봄에 배워.\n아줌마가 손목을 이렇게 꺾으라 그랬어.'],
        ['너구리','(여울이 손목을 꺾어 보인다.\n엄마 손목도 저렇게 움직였을까.)']];
      arcScene('galArcOtter2b',[['너구리','(여울이 납작한 돌을 골라 물 위로 던진다.\n통, 통, 통, 통.)'],
        ['여울','네 번! 너도 해 봐.',[{t:'납작한 돌을 골라 던진다',go:()=>talk(thrown)}]]],
        '여울과 물수제비를 떴다. 나는 세 번, 여울은 네 번이었다. 엄마는 일곱 번이라고 했다.');
      return;
    }
    if(!F.galArcOtter3&&G.diary.some(d=>d.id==='end')){
      arcScene('galArcOtter3',[['여울','까치 할머니가 그러는데,\n아줌마한테 약 갔대!'],
        ['너구리','응. 할머니가 달여 주셨어.'],
        ['여울','그럼 아줌마 이제 와?'],
        ['너구리','…아직. 북쪽 가서 더 좋은 약 구해 올 거야.'],
        ['여울','그럼 함지박은 내가 계속 지킬게.'],
        ['너구리','봄에 엄마랑 같이 올게. 빨래하러.'],
        ['여울','약속!\n그때 나랑 물수제비 내기해. 아줌마 빼고.'],
        ['너구리','왜 엄마는 빼?'],
        ['여울','아줌마는 일곱 번이잖아. 반칙이야.']],
        '약이 갔다는 소식을 여울도 까치에게 들었다. 봄에 엄마랑 빨래하러 오겠다고 약속했다. 그때 물수제비 내기를 하자며, 엄마는 일곱 번이라 반칙이니 빼자고 했다.',
        ()=>finishWanderer('stream_otter'));
      return;
    }
    talk([['여울',F.galArcOtter2?'함지박 잘 지키고 있어!\n타고 내려가도 돼. 올려놓기만 해.':'빨래 아줌마 아직 안 왔어.']]);
  }
  function badgerTalk(){
    const F=G.f;
    if(!F.galArcGeom1){
      arcScene('galArcGeom1',[['검댕','콜록, 콜록…'],
        ['검댕','거기 너. 눈 좀 빌리자.\n저 연기가 무슨 빛이냐. 희냐, 푸르냐.'],
        ['너구리','…하얘요. 뭉게뭉게.'],
        ['검댕','아직이군.\n푸르스름해지면 숯이 다 된 거다.'],
        ['너구리','아저씨는 안 보여요?'],
        ['검댕','연기에 눈이 절었다.\n평생 숯을 구웠으니.'],
        ['검댕','요즘은 빛이 다 뿌옇다.\n숯이 타 버릴까 봐 밤에 잠을 못 잔다.'],
        ['너구리','늪가 할머니한테 눈약 있을 거예요.'],
        ['검댕','내려갈 틈이 어딨냐.\n가마 불은 사흘 내내 지켜야 한다.'],
        ['너구리','제가 다녀올게요. 저 보부상이에요.'],
        ['검댕','…보부상이면 공짜로는 안 하겠군.\n갔다 와 봐라.']],
        '참나무 숲에서 숯 굽는 오소리 검댕을 만났다. 연기에 눈이 절어 연기 빛을 못 본다. 흰 연기는 아직, 푸른 연기면 다 된 숯이라고. 늪가 할머니께 눈약을 여쭤보기로 했다.');
      return;
    }
    if(F.galArcGeom2&&!F.galArcGeom3){
      arcScene('galArcGeom3',[['너구리','할머니가 눈약 달여 주신대요.\n그런데 약탕에 땔 숯이 필요하대요.'],
        ['검댕','허, 내 눈약을 내 숯으로 달인다고?'],
        ['너구리','(검댕이 가마 옆 자루에서 숯 두 덩이를 꺼낸다.)'],
        ['검댕','하나는 할멈 몫. 하나는 네 몫이다.\n심부름 값은 받아야지, 보부상이면.'],
        ['너구리','(할머니 몫은 보자기에 따로 싸 넣었다.)']],
        '검댕 아저씨가 숯 두 덩이를 꺼내 주었다. 하나는 할머니 약탕에 땔 몫, 하나는 내 심부름 값이라고 했다.',
        ()=>{F.galGeomToadCoal=true;addItem('coal',1);});
      return;
    }
    if(F.galGeomEyeWash&&!F.galArcGeom5){
      arcScene('galArcGeom5',[['너구리','할머니 눈약이에요.\n아침저녁으로 씻으래요.'],
        ['너구리','(검댕이 눈을 씻고 한참 가마 쪽을 본다.)'],
        ['검댕','…푸르구나. 저 연기, 푸르다.'],
        ['너구리','다 된 거예요?'],
        ['검댕','다 됐다. 사흘 만에 처음 제대로 봤다.'],
        ['검댕','이 숯은 날쌘이 받아 갈 거다.\n장에 내다 팔 테지.'],
        ['너구리','날쌘 아저씨는 엄청 깍쟁이던데요.'],
        ['검댕','그놈? 값 깎는 척 실컷 하고는,\n가마 옆에 꼭 덤을 두고 간다.'],
        ['검댕','쌀 한 줌, 마른 쑥 한 단.\n모른 척하라더라. 체면 깎인다고.'],
        ['너구리','…저도 모른 척할게요.'],
        ['검댕','그래라. 보부상은 입이 무거워야 한다.']],
        '검댕 아저씨가 할머니 눈약으로 눈을 씻고, 가마 연기가 푸른 걸 처음으로 제대로 봤다. 날쌘 아저씨는 값을 깎는 척하고는 가마 옆에 꼭 덤을 두고 간다고 한다. 모른 척하기로 했다.',
        ()=>{F.galGeomBlue=true;learn('geom:nal');});
      return;
    }
    if(F.galArcGeom5&&!F.galArcGeom6&&G.diary.some(d=>d.id==='end')){
      arcScene('galArcGeom6',[['너구리','(가마 연기가 가늘고 푸르게 오른다.)'],
        ['너구리','저 내일 북쪽으로 가요.'],
        ['검댕','까치가 지나가며 그러더라.\n늪가 할멈 약이 너희 집으로 갔다고.'],
        ['검댕','숯은 다 됐을 때 꺼내야 한다.\n덜 되면 연기 나고, 너무 되면 재가 된다.'],
        ['너구리','…다 됐는지는 어떻게 알아요?'],
        ['검댕','연기 빛을 봐라.\n네 눈은 좋으니 잘 보겠지.'],
        ['검댕','이거 가져가라. 길에서 불 피울 때 써라.\n연기가 안 매운 숯이다.']],
        '떠난다고 하자 검댕 아저씨는 숯은 다 됐을 때 꺼내야 한다고 했다. 다 됐는지는 연기 빛을 보면 안다고. 길에서 불 피울 때 쓰라며 숯 한 덩이를 주었다.',
        ()=>{addItem('coal',1);finishWanderer('charcoal_badger');});
      return;
    }
    talk([['검댕',F.galArcGeom5?'푸르다. 이제 잘 보인다.\n…심부름 값은 했다.':F.galArcGeom3?'할멈 몫 숯은 잘 갖다줬냐.\n콜록… 연기가 아직 희구나.':'콜록… 연기가 아직 희구나.']]);
  }
  /* 할멈 쪽 고리: 검댕의 눈 이야기를 듣고 → 숯을 받아 오면 눈약을 달인다. */
  function toadGeom(){
    const F=G.f;
    if(!F.galArcGeom2){
      arcScene('galArcGeom2',[['너구리','숲에서 숯 굽는 오소리 아저씨요.\n연기에 눈이 절어서 뿌옇대요.'],
        ['두꺼비 할멈','검댕이로구나.\n그 눈으로 아직도 가마를 지키는구나.'],
        ['두꺼비 할멈','눈 씻을 물을 달여 주마.\n…헌데 약탕 불 땔 숯이 떨어졌구나.'],
        ['두꺼비 할멈','늘 날쌘이 갖다주는데,\n요즘은 대장간에 먼저 대는지 영 안 오는구나.'],
        ['너구리','그럼 숯은 검댕 아저씨한테 받아 올게요.'],
        ['두꺼비 할멈','허허, 숯쟁이 눈약을\n숯쟁이 숯으로 달이는구나.']],
        '할머니가 검댕 아저씨 눈 씻을 물을 달여 주겠다고 했다. 다만 약탕에 땔 숯이 떨어졌다. 숯은 검댕 아저씨한테 받아 오기로 했다.');
      return;
    }
    if(F.galGeomToadCoal&&!F.galArcGeom4){
      arcScene('galArcGeom4',[['너구리','검댕 아저씨가 보낸 숯이에요.'],
        ['너구리','(할멈이 숯을 넣고 약탕을 올린다.\n쑥 냄새 섞인 김이 오른다.)'],
        ['두꺼비 할멈','식혀서 아침저녁으로 눈을 씻으라고 하렴.'],
        ['두꺼비 할멈','검댕이는 고맙단 말 대신 숯을 보낼 게다.\n그 집 숯은 연기가 안 매워.']],
        '검댕 아저씨 숯으로 할머니가 눈 씻을 물을 달여 주었다. 쑥 냄새가 났다.',
        ()=>{F.galGeomToadCoal=false;F.galGeomEyeWash=true;});
    }
  }
  function toadGeomChoice(){
    const F=G.f;
    if(!Rg.arcsEnabled()||!F.galArcGeom1)return null;
    if(!F.galArcGeom2)return {t:'숯쟁이 오소리의 눈약을 묻는다',go:toadGeom};
    if(F.galGeomToadCoal&&!F.galArcGeom4)return {t:'검댕 아저씨의 숯을 건넨다',go:toadGeom};
    return null;
  }
  Rg.toadGeomChoice=toadGeomChoice;
  const otter={id:'stream_otter',name:'여울',x:1290,when:()=>Rg.arcsEnabled(),draw:picture('otter'),talk:otterTalk,
    hint:'첨벙, 첨벙… 개울 쪽에서 무언가 함지박을 밀어 올리는 소리가 난다.',
    greeting:'함지박은 내가 지키고 있어!\n봄에 와. 물수제비 내기야.'};
  const badger={id:'charcoal_badger',name:'검댕',x:430,tagY:28,when:()=>Rg.arcsEnabled(),draw:picture('badgerKiln'),talk:badgerTalk,
    hint:'숲 안쪽에서 매캐한 연기 냄새와 기침 소리가 난다.',
    greeting:'푸른 연기 보이면 다 된 거다.\n…너도 다 되면 돌아와라.'};
  // 결정 D-17: 늙은 까치는 네 지역에 걸친 한 인물 (design/data/decisions.csv)
  const drawMagpies=(x,y,f)=>{Rg.expArt.magpie(x,y,f);if(G.f.galMagpieYoung){Rg.expArt.youngMagpie(x-32,y,1);Rg.expArt.youngMagpie(x+34,y,-1);}};
  const magpie={id:'old_magpie',name:'늙은 까치',x:820,draw:drawMagpies,talk:magpieTalk,
    get greeting(){return G.f.galWheelDone?'쿵, 쿵, 쿵. 이 소리는 내가 안 날라도\n네 집까지 가겠구나.':G.tool==='sickle'?'그게 네 아비 낫이구나.\n무쇠가 날을 잘 세웠네.':'날개 좀 말리고 가련다.\n저 방아가 멈춘 뒤로 개울이 너무 조용해.';}};
  const hubMagpie={id:magpie.id,name:magpie.name,x:480,draw:magpie.draw,talk:magpie.talk};
  Object.defineProperty(hubMagpie,'greeting',{get:()=>magpie.greeting});
  // 만난 뒤로 까치는 물레방아 곁에 앉아 있다. 방아를 같이 고치고, 다 고친 뒤에도 그 소리를 듣는다.
  const wheelMagpie={id:magpie.id,name:magpie.name,x:1120,draw:magpie.draw,talk:magpie.talk};
  Object.defineProperty(wheelMagpie,'greeting',{get:()=>magpie.greeting});
  const brothers={id:'squirrel_brothers',name:'다람쥐 형제',speakers:['다람쥐 형','다람쥐 동생'],x:620,draw:picture('brothers'),talk:brothersTalk,
    get greeting(){
      const base=({
        hyung:[['다람쥐 형','큰 건 역시 내 몫이지!'],['다람쥐 동생','…다음엔 내가 먼저 찾을 거야.']],
        dongsaeng:[['다람쥐 동생','찾는 건 내가 최고야!'],['다람쥐 형','…다음엔 내가 더 많이 오갈 거야.']]
      })[G.f.galExpBrothersSide]||[['다람쥐 형','큰 것부터 번갈아!'],['다람쥐 동생','겨울에는 한 바구니에서!']];
      const arc=brosArcChoice();if(!arc)return base;
      const last=base[base.length-1];return [...base.slice(0,-1),[last[0],last[1],[arc,{t:'다음에 보자',go:null}]]];
    }};
  const chick={id:'lost_chick',name:'꺼병이',hint:'삐약… 삐약… 어디선가 엄마를 찾는 병아리 소리가 들린다.',get x(){const x=G.f.galExpChickX??1540;return CLASSIC?x:trimX(x,Rg.trimCuts?.forest);}   /* 결정 D-128: galExpChickX는 설계 좌표로 두고 자리만 줄인 숲 좌표로 */,draw:picture('chick'),talk:chickTalk,
    greeting:'이제 엄마 울음이 들려.\n다음엔 도토리 말고 엄마를 따라갈래!'};
  function wheelStage(){
    if(G.f.galWheelDone)return 5;
    if((G.f.galWheelStage||0)>=4)return 4;
    return G.f.galWheelSpoke&&G.f.galWheelAxle?3:G.f.galWheelSpoke?2:G.f.galWheelStage||0;
  }
  function wheelTalk(){
    const F=G.f,stage=wheelStage();
    if(F.galWheelDone){
      talk([['너구리','쿵, 쿵, 쿵… 한 번 쉬고.\n오늘도 잘 도네.'],
        ['너구리','엄마, 이제 혼자 절구 안 찧어도 돼.',[
          {t:'물소리에 맞춰 절구 손버릇을 해 본다',go:()=>hands('엄마의 절구 박자','wheel_revisit',[
            '가볍게 한 번','두 번, 힘을 빼고','세 번, 이제 한 번 쉰다'],()=>{
              diary('galWheelReturn','돌아와 물레방아 소리에 맞춰 엄마의 절구 손짓을 해 봤다. 세 번 찧고 한 번 쉬는 버릇이 물소리에도 맞았다.');
              talk([['너구리','손이 먼저 쉬네.\n엄마가 하던 대로.']]);
            })},{t:'소리만 듣고 간다',go:null}]]]);return;
    }
    if(stage===0){
      talk([['너구리','살이 빠지고 굴대도 갈라졌네.\n물만 흘러가고 있어.'],
        ['늙은 까치','방아가 멈춘 뒤로 밤마다 네 엄마 절구 소리가\n개울까지 들렸단다. 아프기 전까지.'],
        ['너구리','제가 고쳐 볼게요.\n같이 해 주세요.'],
        ['늙은 까치','낙엽은 내가 부리로 물어내마.\n너는 손으로 물받이를 긁어 주렴.',[
          {t:'물받이 낙엽부터 함께 걷는다',go:()=>hands('물레방아 물받이 비우기','wheel_leaves',[
            '물받이 위 낙엽을 모은다','젖은 낙엽은 옆 물로 뺀다','막힌 물구멍을 드러낸다'],()=>{
              F.galWheelStage=1;diary('galWheelStart','오래 멈춰 있던 물레방아를 고치기로 했다. 엄마는 아프기 전까지 마을 곡식을 혼자 절구에 찧었다. 까치와 물받이를 비웠다.');
              talk([['늙은 까치','살 하나는 물에 떠내려갔을 게다. 개울 아래로.\n굴대는… 무쇠가 새로 깎아 뒀다더라.']]);
            })},{t:'어디가 고장 났는지 보고 간다',go:null}]]]);return;
    }
    if(stage<3){
      talk([['너구리',F.galWheelAxle?'굴대는 개울 받침에 왔어.\n떠내려간 살만 찾으면 돼. 개울 아래로 갔댔지.':!F.galWheelSpoke?'살은 물살 따라 개울 아래로 갔대.\n굴대는 무쇠 삼촌이 깎아 뒀다고 했어.':'살은 찾았어.\n이제 무쇠 삼촌이 깎아 둔 굴대만 있으면 돼.']]);return;
    }
    if(stage===3){
      talk([['너구리','살도 굴대도 다 왔어요.'],['늙은 까치','쐐기는 내가 부리로 물고 있으마.\n넌 살을 홈에 맞춰 끼우렴.',[
        {t:'받쳐 주는 손에 맞춰 조립한다',go:()=>hands('함께 물레방아 맞추기','wheel_fit',[
          '굴대의 홈을 위로 돌린다','빠진 살을 홈에 끼운다','까치가 물고 있던 쐐기를 받아 박는다'],()=>{
            F.galWheelStage=4;diary('galWheelFit','까치가 쐐기를 물고 있는 동안 개울가에서 찾은 살을 끼웠다. 물레방아가 다시 한 몸이 됐다.');
            talk([['너구리','이제 물만 돌리면 돼요.'],['늙은 까치','물길 위에 칡이 엉켰구나.\n날 선 것이 있어야 걷히겠다.']]);
          })},{t:'조금 쉬고 맞춘다',go:null}]]]);return;
    }
    if(G.tool!=='sickle'){
      talk([['너구리','물길 위를 마른 칡이 막았어요.'],['늙은 까치','무쇠가 네 아비 낫을 맡아 두고 있다더라.\n그게 오면 이 칡도 걷히겠지.']]);return;
    }
    talk([['너구리','낫으로 덩굴부터 걷을게요.'],['늙은 까치','수문은 조금씩 열렴.\n내가 물을 볼 테니 넌 손잡이를 잡아.',[
      {t:'덩굴을 걷고 수문을 함께 연다',go:()=>hands('물레방아에 물 돌리기','wheel_water',[
        '낫으로 마른 덩굴을 걷는다','수문 손잡이를 조금 올린다','첫 물을 받으면 손을 놓는다'],()=>{
          F.galWheelStage=5;F.galWheelDone=true;
          if(typeof grantNickname==='function')grantNickname('gal_water_hands','물소리 보부상','늙은 까치');
          diary('galWheelDone','물레방아를 고쳐 마을에 방아 소리가 돌아왔다. 방아 공이가 세 번 내려갔다가 쉬었다. 엄마가 절구 찧던 손버릇에 내 손도 맞춰 움직였다.');
          talk([['너구리','돌아요! …쿵, 쿵, 쿵.'],['늙은 까치','그러고 한 번 쉬지.\n네 엄마 손도 꼭 저랬단다.'],['너구리','(절구질하듯 오므린 손을 펴고, 한 박자 쉰다.)'],['늙은 까치','개울 소리를 네가 돌려놨구나.\n물소리 보부상이라 불러야겠다.',[
            {t:'방아 소리에 엄마의 절구 손짓을 맞춘다',go:()=>hands('물소리에 남은 엄마 손버릇','wheel_mom',[
              '가볍게 한 번 찧는 손짓','두 번, 어깨 힘을 빼고','세 번 뒤 손바닥을 편다'],()=>{
                diary('galWheelMom','물레방아 옆에서 엄마의 절구 손짓을 따라 했다. 세 번 찧은 뒤 저절로 손바닥을 폈다. 엄마가 쉬던 한 박자가 내 손에도 남았다.');
                talk([['너구리','세 번 찧고 한 번 쉬기.\n엄마는 이 쉬는 틈에 숨을 골랐구나.'],['늙은 까치','이젠 마을 곡식은 방아가 찧는다.\n네 엄마 몫이 하나 줄었구나.']]);
              })},{t:'물소리를 더 듣고 간다',go:null}]]]);
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
          diary('galWheelSpoke','대장간 아래 개울가 낮은 가지에서 물레방아 살을 받았다. 물에 쓸려도 끝의 빗금은 남아 있었다.');
          talk([['너구리',F.galWheelAxle?'굴대도 개울 받침에 왔지.\n물레방아로 돌아가자.':'굴대는 무쇠 삼촌이 깎아 뒀다고 했지.\n대장간 쪽에서 찾아보자.']]);
        })},{t:'먼저 가지 모양을 살핀다',go:null}]]]);
  }
  function wheelAxle(){
    const F=G.f;
    if(!F.galExpBrothersSorted){shareBaskets();return;}
    if(!done('squirrel_brothers')){brothersTalk();return;}
    if(F.galWheelAxle){talk([['다람쥐 형','굴대는 물레방아 받침에 올려 뒀어.'],['다람쥐 동생','셋이 드니 하나도 안 무거웠지?']]);return;}
    if(!F.galWheelStage){talk([['다람쥐 형','이 통나무는 물레방아 굴대야.'],['다람쥐 동생','근데 고칠 사람이 없어.\n무쇠 아저씨는 다리가 아프대.']]);return;}
    talk([['다람쥐 형','무쇠 아저씨가 깎아 둔 굴대야.'],['다람쥐 동생','우린 둘이 들어도 한쪽이 자꾸 처져.'],
      ['너구리',(F.galExpBrothersSide||'even')==='even'?'내가 가운데를 들게.\n아까 도토리처럼 양쪽을 맞추자.':'내가 가운데를 들게.\n이번엔 양쪽 높이를 똑같이 맞추자.',[
        {t:'형제와 굴대 무게를 나눠 든다',go:()=>hands('셋이 굴대 들기','wheel_axle',[
          '형이 드는 쪽을 함께 받친다','동생 쪽도 같은 높이로 든다','개울 받침까지 함께 옮긴다'],()=>{
            F.galWheelAxle=true;F.galWheelStage=wheelStage();
            diary('galWheelAxle','형제와 굴대를 나눠 들고 개울 받침까지 옮겼다. 셋이 드니 한쪽으로 처지지 않았다.');
            talk(F.galWheelSpoke?[['다람쥐 형','굴대는 개울 받침에 왔어.'],['다람쥐 동생','살도 찾았으니 이제 끼우자!']]
              :[['다람쥐 형','굴대는 개울 받침에 올려 뒀어.'],['다람쥐 동생','살만 오면 끼우기만 하면 돼!']]);
          })},{t:'손 놓을 자리를 먼저 본다',go:null}]]]);
  }
  // 반딧불 부탁은 할멈 대화에서만 연다 (할멈이 곁에 없을 때 할멈 대사가 나오지 않게).
  function lanternTalk(){
    const F=G.f;
    if(F.galLanternAsked&&!F.galLanternLit&&(F.galLanternCount||0)<3){
      talk([['두꺼비 할멈','낮은 갈대, 돌 위, 약재 선반 옆이란다.\n등롱 입구만 열어 두면 제 발로 들어오지.']]);return;
    }
    if(F.galLanternLit){talk([['너구리','불빛이 처마 아래로 모였네.'],['두꺼비 할멈','문을 열어 뒀으니 아침이면 갈대로 돌아가겠지.\n또 올 때는 빈 등롱만 살펴 주렴.']]);return;}
    if(F.galLanternCount>=3){
      talk([['너구리','세 마리 다 왔어요.'],['두꺼비 할멈','뚜껑은 닫지 마렴.\n들어앉을 자리만 내어 주면 된단다.',[
        {t:'반딧불이 든 등롱을 처마에 건다',go:()=>hands('약방에 반딧불 등불 달기','lamp_hang',[
          '갈대 잎을 등롱 밑에 깐다','등롱 고리를 처마에 건다','입구는 열린 채로 놓아둔다'],()=>{
            F.galLanternLit=true;finishWanderer('reed_fireflies');
            diary('galLanternLit','늪의 반딧불을 등롱에 잠깐 불러 약방 처마를 밝혔다. 입구는 열어 두었다. 밤마다 반딧불로 방을 밝혀 주던 엄마가 생각났다.');
            talk([['너구리','엄마도 밤마다 반딧불이 돼서\n내 방을 밝혀 줬는데.'],['두꺼비 할멈','…그랬구나.\n덕분에 약재 빛깔이 잘 보이겠다.'],['너구리','(처마 밑 불빛을 한참 올려다본다.)']]);
          })},{t:'먼저 불빛을 보고 있는다',go:null}]]]);return;
    }
    talk([['두꺼비 할멈','약재를 추려야 하는데 처마가 어둡구나.\n늪의 반딧불에게 잠깐 빛을 빌려 볼까.'],
      ['너구리','잡아 와요?'],['두꺼비 할멈','아니, 빈 등롱을 내밀렴. 앉으면 같이 오는 거지.\n낮은 갈대, 돌 위, 약재 선반 옆에 한 마리씩 있단다.',[
        {t:'빈 등롱을 받아 갈대로 간다',go:()=>{F.galLanternAsked=true;toast('왼쪽 갈대, 가운데 디딤돌 위, 약재 선반 옆 불빛 · E');}},
        {t:'약 이야기부터 할게요',go:talkToad}]]]);
  }
  Rg.expLanternChoice=()=>{
    const F=G.f;if(CLASSIC||F.galLanternLit)return null;
    return {t:(F.galLanternCount||0)>=3?'반딧불이 다 왔다고 말씀드린다':F.galLanternAsked?'반딧불 자리를 다시 묻는다':'어두운 처마 이야기를 한다',go:lanternTalk};
  };
  // 반딧불 표식과 불빛 자리는 아이 혼자 보는 곳이다. 할멈 대사를 부르지 않는다.
  function fireflyLook(){
    const F=G.f;
    if((F.galLanternCount||0)>=3){talk([['너구리','세 마리 다 등롱에 있어.\n할멈께 가져가서 처마에 걸자.']]);return;}
    if(F.galLanternAsked){talk([['너구리','등롱 걸 자리는 여기 처마 밑이야.\n갈대, 디딤돌, 선반 옆 불빛부터 데려오자.']]);return;}
    talk([['너구리','처마 밑에 작은 불빛이 들락거린다.\n할멈 약방이 어두워서 그런가.']]);
  }
  function inviteFirefly(i){
    const F=G.f;
    if(!F.galLanternAsked){talk([['너구리','작은 불빛이 깜박인다.\n빈손으로 다가가면 날아가 버리겠지.']]);return;}
    if(F['galLanternFly'+i]){talk([['너구리','여기 앉던 반딧불은 등롱에 있어.\n다른 데도 둘러보자.']]);return;}
    hands('반딧불에게 자리 내어 주기','lamp_'+i,['불빛 아래로 등롱을 받친다','가만히 손을 펴 앉을 곳을 보인다'],()=>{
      F['galLanternFly'+i]=true;F.galLanternCount=[0,1,2].filter(n=>F['galLanternFly'+n]).length;
      talk([['너구리',F.galLanternCount===3?'다 왔네.\n할멈께 가져가서 처마에 걸자.':'앉았다. 꽉 쥐지는 않을게.\n다음 불빛도 찾아보자.']]);
    });
  }
  const fireflies={id:'reed_fireflies',name:'반딧불',tag:false,hint:'갈대숲 사이로 작은 불빛이 깜박인다.',x:1760,draw:(x,y)=>Rg.expArt.marker(x,y),talk:fireflyLook,
    greeting:[['너구리','등롱 입구로 작은 빛이 드나든다.\n잡아 두지 않아도 환하네.']]};
  Rg.expWanderers={village:[magpie,otter],forge:[brothers],forest:[chick,badger],marsh:[fireflies],hill:[]};
  function examine(id,x,label,read,y){
    return {id,x,label,...(y===undefined?{}:{y}),get text(){return read();}};
  }
  Rg.expExamines={
    village:[
      examine('village_home',95,'열린 방문 들여다보기',()=> '엄마가 이불 끝을 꼭 쥐고 잔다.\n문은 조금 열어 두자. 개울 소리가 들리게.'),
      examine('village_well',440,'우물 두레박 살펴보기',()=>G.tool==='sickle'?
        '두레박 줄이 반들반들하다. 엄마 손이 닿던 자리.\n아빠 낫 자루도 꼭 이렇게 닳았네.':'떠나기 전에 물독을 가득 채워 놨다.\n엄마가 물 길으러 나오지 않아도 되게.'),
      examine('village_wheel',990,'물레방아 물길 살펴보기',()=>G.f.galWheelDone?
        '쿵, 쿵, 쿵. 나무 공이도 한 번 쉬네.\n엄마는 혼자 이 소리를 다 냈구나.':'빠진 살 사이로 물만 흘러간다. 굴대도 갈라졌다.\n이 방아가 멈춘 뒤로 엄마가 절구질을 도맡았지.')],
    forge:[
      examine('forge_sign',230,'갈림길 팻말 읽기',()=> '왼쪽은 집과 개울, 오른쪽은 참나무 숲.\n숯 냄새가 난다. 삼촌이 불을 올렸구나.'),
      examine('forge_charcoal',1820,'식힌 숯가마 살펴보기',()=> '재는 차가운데 안쪽 벽은 아직 따뜻하다.\n무쇠 삼촌 불씨도 여기서 시작했겠지.'),
      examine('forge_share',870,'낮은 평상 살펴보기',()=>G.f.galExpBrothersSorted?({
        hyung:'큰 도토리는 형 바구니에 수북하다.\n동생 바구니는 아직 반도 안 찼다.',
        dongsaeng:'큰 도토리는 동생 바구니에 수북하다.\n형 바구니는 아직 반도 안 찼다.'})[G.f.galExpBrothersSide]||
        '큰 도토리부터 양쪽 바구니에 번갈아 놓았다.\n작은 것도 나눠 담으니 높이가 비슷해졌다.':'빈 바구니 두 개가 나란히 놓였다.\n작은 발 둘이 서기 딱 좋은 낮은 평상이다.')],
    forest:[
      examine('forest_root',280,'드러난 뿌리 살펴보기',()=> '칡은 나무를 타고, 참나무는 땅을 붙든다.\n뿌리 밑 흙은 곡괭이가 들어갈 만큼 무르네.'),
      // 결정 D-49: 도담 옆 높은 참나무 가지(다람쥐만 오르는 자리, PA-47). 지나가면 살펴볼 수 있고, 아이는 아는 만큼만 말한다.
      Object.assign(examine('forest_oak',772,'높은 참나무 가지 올려다보기',()=>G.form==='squirrel'?
        '줄기 껍질에 발톱이 쏙쏙 걸린다.\n이 모습이면 저 가지까지 타고 오르겠어.':hasForm('squirrel')?
        '가지가 너무 높아서 이 몸으로는 못 오르겠다.\n다람쥐가 되면 줄기를 타고 오를 수 있겠어.':
        G.pickups.some(p=>p.id?.startsWith('gal_branch_acorn')&&!p.got)?
        '가지에 도토리가 달렸는데 너무 높다.\n지금은 올라가기 힘들겠어.':'저 가지는 너무 높다.\n지금은 올라가기 힘들겠어.'),{peek:false}),
      examine('forest_trail',1180,'나뭇가지에 걸린 금줄 보기',()=>G.tool==='sickle'?
        '개울에서 보던 나무의 금줄이 여기까지 이어졌다.\n안쪽 덩굴을 걷고 나무 속으로 올라가자.':'개울에서 보던 당산나무다. 금줄이 숲 안으로 이어졌다.\n덩굴을 걷을 낫이 있으면 저곳까지 닿겠어.'),
      examine('forest_mother',2020,'갈대 너머 소리 듣기',()=>G.f.galExpChickWith?
        '갈대 뒤에서 꿩이 짧게 대답한다.\n꺼병이도 듣게 발소리를 낮추자.':'갈대가 흔들리더니 꿩 울음이 들렸다.\n작은 발자국이 왔던 쪽을 자꾸 부르네.')],
    marsh:[
      examine('marsh_shallows',320,'얕은 물 들여다보기',()=> '발밑 돌은 또렷한데 깊은 곳은 하늘색이다.\n돌을 밟으면 신을 적시지 않고 건너겠네.'),
      examine('marsh_shelf',1220,'약재 선반 살펴보기',()=> '습한 풀은 들보에, 마른 열매는 항아리에.\n할멈은 눕혀 둔 풀에도 자리를 정해 주셨다.'),
      examine('marsh_north',2180,'북쪽 길 팻말 읽기',()=>G.f.galArcToad1||G.diary.some(d=>d.id==='end')?
        '약은 집으로 갔다. 이 길은 북쪽으로 간다.\n다음엔 아빠한테도 집 이야기를 해 줘야지.':'돌너머로 가는 북쪽 길.\n먼저 할멈께 해머루를 드리자.')],
    hill:[
      examine('hill_rings',225,'나무 속 나이테 짚어 보기',()=> '어린 나무였을 때의 둥근 줄이 아직 남았다.\n몇 해나 여기서 해머루를 키웠을까.'),
      examine('hill_cloth',810,'오래된 소원 천 보기',()=> '매듭은 낡았는데 천은 덜 바랬다.\n잎 그늘이 볕을 대신 맞아 줬나 봐.'),
      examine('hill_fruit',2310-(Rg.hillShift||0),'해머루 자리 올려다보기',()=>G.boss.dead?
        '열매가 있던 꼭지가 노을을 보고 있다.\n다음 가을에도 여기서 익겠지.':'잎 뒤에 보랏빛 알 하나. 해를 오래 받는 자리네.\n저기까지 엉킨 칡을 풀어 줘야겠다.')]
  };
  // 집에서 묶은 보자기를 들고 대장간 거점으로 날아온다. 같은 id라 만남은 한 번만 센다.
  for(const [zone,list] of Object.entries(Rg.expWanderers))if(Rg.zones?.[zone]){
    Object.defineProperty(Rg.zones[zone],'wanderers',{configurable:true,get:()=>
      (zone==='village'&&done('old_magpie')?[wheelMagpie,...list.filter(w=>w!==magpie)]:list).filter(w=>!w.when||w.when())});
    Rg.zones[zone].examines=Rg.expExamines[zone];
  }
  // 주연 NPC 목록은 그대로다. 이 객체들은 E로 만지는 작업 자리이며 인물·만남 수에 더하지 않는다.
  const work=(id,x,label,talk,y=GROUND)=>({id:'gal_work_'+id,name:label,x,y,prompt:label,talk,peek:true,
    draw:(sx,sy)=>{if(id==='wheel')Rg.expArt.marker(sx,sy);}});
  Rg.zones.village.npcs.push(work('wheel',1050,'물레방아 함께 고치기',wheelTalk));
  Rg.zones.forge.npcs.push(work('baskets',810,'평상에서 도토리 나누기 · 굴대 함께 들기',wheelAxle));
  Rg.zones.forge.npcs.push(work('spoke',430,'낮은 가지의 물레방아 살 받기',wheelSpoke));
  const flySpot=(id,x,where,i,y)=>{const w=work(id,x,'',()=>inviteFirefly(i),y);
    const label=()=>where+(G.f.galLanternAsked?' 불빛에 등롱 내밀기':' 불빛 보기');
    Object.defineProperty(w,'name',{get:label});Object.defineProperty(w,'prompt',{get:label});return w;};
  Rg.zones.marsh.npcs.push(flySpot('fly_reeds',520,'갈대의',0),
    flySpot('fly_stone',1030,'디딤돌 위',1,158),
    flySpot('fly_shelf',1450,'선반 옆',2));
  Rg.expStep=()=>{
    // 결정 D-134: 대장간 길목의 다람쥐 형제를 눈으로 보고 지나가도 '봤다'(D-129 ⑤ 보강)
    if(G.zone==='forge'&&!G.f.galSquirrelSeen&&Math.abs(G.px-tx(620))<TABLES.TUNING.hint_range)G.f.galSquirrelSeen=true;
    if(G.zone!=='forest'||!G.f.galExpChickWith||done('lost_chick'))return;
    if(G.f.galExpChickArrived){G.f.galExpChickX=2090;return;}
    const x=G.f.galExpChickX??1540,dx=(CLASSIC?G.px:untrimX(G.px,Rg.trimCuts?.forest))-x;   // 설계 좌표끼리 잰다 (D-128)
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
    if(G.diary.some(d=>d.id==='end')||(Rg.arcsEnabled()&&F.galArcToad1))return '약을 보냈다 · 할멈께 인사드리고 북쪽으로 떠나자';
    // 결정 D-67: 앞선 진행부터 본다. 다람쥐로 덩굴을 넘어 칡을 먼저 만나도 안내가 뒤처지지 않는다.
    if(G.boss.dead)return has('meoru')?'언덕 끝 약초 귀환길로 내려가 늪가 약방의 할멈께 가자':'언덕에 떨어진 해머루를 줍자';
    if(mapVisited(Rg.id,'hill'))return '당산나무 언덕의 엉킨 칡과 맞서자';
    if(G.barrier.cut)return '당산나무 속을 올라 엉킨 칡을 만나자';
    if(!F.dodamTalk)return '당산나무 해머루에 어떻게 오르는지 숲의 도담에게 묻자 · 대장간 길 오른쪽';
    if(F.dodamDone&&!F.musoeMet)return '대장간 길로 돌아가 무쇠 삼촌께 날 선 연장을 여쭤보자';
    if(F.musoeMet&&!F.musoeTested&&!F.musoeDone)return '무쇠 삼촌 앞에서 버텨 내자 · 다시 말을 걸면 된다';
    if(F.leafHeld&&!F.leafGiven&&!F.musoeDone)return '다람쥐를 봤으니 무쇠 삼촌께 잎사귀를 받자';
    if(F.leafGiven&&!F.musoeAfterLeaf&&!F.musoeDone)return '무쇠 삼촌과 하던 이야기를 마저 하자';
    if(F.dodamDone&&!F.musoeDone&&!has('coal',F.musoeCoal?2:1)&&!F.nalTalk)return '대장간 오른쪽 좌판의 날쌘에게 숯을 구하자';
    if(!F.musoeDone&&F.nalTalk&&!F.nalDone&&!has('coal',F.musoeCoal?2:1)&&!has('root'))return '대장간 길 · 날쌘 좌판 옆 반짝이는 흙더미를 캐자';
    if(F.musoeDone&&!G.barrier.cut)return '참나무 숲 안쪽 금줄의 덩굴을 낫으로 걷자';
    return oldGoal();
  };
}
/* ---------- 교환 화면의 부탁 (engine/trade.js) ----------
   결정 D-39: 원하는 것을 들은 뒤(장부에 적힌 뒤)에만 보인다. 받은 뒤의 이야기는 위의 대화 함수가 이어 간다.
   결정 D-40: 날쌘에게 허세가 통하면 숯을 하나 더 얹는다(경멸 축: 얕보이면 오기로 더 준다). 숯을 바꾼 뒤라면 흔한 물건에 덤. */
Rg.trade={
  dodam:()=>G.ledger.dodam?[{id:'t_dodam',item:'meoru',info:true,label:'해머루 자리에 대한 정보',asks:[{powder:1}],done:()=>G.f.dodamDone,accept:dodamGive}]:[],
  nal:()=>[
    ...(G.ledger.nal?[{id:'t_nal_galchamgol',item:'coal',n:1,asks:[{powder:1,root:1}],done:()=>G.f.nalDone,accept:()=>{G.f.nalPriceHeard=true;nalTrade();}}]:[]),
    ...(G.ledger.t_craft_salt?[{id:'t_craft_salt',item:'salt',label:'소금 2 · 깨 1',asks:[{vine:1}],done:()=>G.f.craftTrade_salt,accept:nalSaltGive}]:[])
  ],
  toad:()=>G.f.toadMet?[{id:'t_toad',item:'meoru',icon:'magamok_tea',label:'엄마의 병을 늦추는 약',asks:[{meoru:1},{meoru:1,acorn_jelly:1}],done:()=>G.diary.some(d=>d.id==='end'),accept:toadGive}]:[]
};
Rg.onHaggle=(npc,way)=>{
  if(npc!=='nal'||way!=='허세'||G.f.nalDone)return false;
  if(G.rel.nal.v===0)rel('nal',1);
  return true;
};

})();
