'use strict';
/* 단풍골 진행: NPC 대화와 교환, 무쇠 삼촌의 시험과 첫 변신, 전투 시작과 결과, 지금 할 일.
   흐름은 design/narrative/galchamgol-scenario.md, 교환은 design/data/trades.csv */
(()=>{
const Rg=REGIONS.galchamgol;
const MG=TABLES.MINIGAMES;

/* 사연 설정은 새 게임·저장 복원 때 정한 공통 판정을 따른다. */
Rg.arcsEnabled=arcsEnabled;
// 사연 장면을 열 수 있는지(사연을 켰고 아직 안 봄). 장면이 주는 물건은 gotLine으로 적어 장면 끝에 받는다 (결정 D-350).
const arcOpen=flag=>Rg.arcsEnabled()&&!G.f[flag];
/* 대사 줄에 작은 창 그림을 붙인다 (D-152, dialog.js). null이면 내린다. */
const picLine=(line,pic)=>Object.assign(line,{pic});
/* 결정 D-523: 당산나무 잎을 꺼낼 때 작은 창에 잎을 보인다 (사용자 피드백 2026-11-04). 당산나무는 느티나무다.
   비대칭인 밑동, 가장자리의 고른 톱니, 나란히 비스듬한 옆잎맥. 늦가을인데도 푸른 것은 집안 잎이라서다.
   무명 천 위에서 숨 쉬듯 살짝 들썩이고, 잎맥을 따라 빛이 한 번씩 지나간다. */
const leafPic={animate:true,sound:'pic_leaf',draw(w,h,t){
  R(0,0,w,h,'#e9dcc0');R(0,34,w,10,'#d8c7a3');for(let i=0;i<6;i++)R(3+i*11,37+(i%2)*3,6,1,'#c6b28a');   // 펼친 무명 천
  const bob=Math.round(Math.sin(t*1.5)),glint=(t*0.6)%1.6;
  R(6,23+bob,7,1,'#6b5a2a');R(5,24+bob,2,1,'#6b5a2a');   // 잎자루
  for(let x=0;x<44;x++){
    const u=x/43,s=Math.pow(Math.sin(Math.PI*Math.min(1,.06+u*1.02)),.8);
    const up=Math.round(s*9+(u<.22?1:0)),dn=Math.round(s*8-(u<.22?2:0)),cy=22+bob-Math.round(Math.sin(u*Math.PI)*2);
    const X=12+x;
    R(X,cy-up,1,up+dn+1,u>.7?'#86ad4c':'#6f9a3e');R(X,cy-up,1,1,'#4c6e2a');R(X,cy+dn,1,1,'#4c6e2a');
    if(x%4===1&&s>.25){R(X,cy-up-1,1,1,'#4c6e2a');R(X,cy+dn+1,1,1,'#4c6e2a');}   // 톱니
    R(X,cy,1,1,Math.abs(u-glint)<.05?'#f4f8d0':'#c9dc8a');   // 가운데 잎맥과 지나가는 빛
    if(x%6===3&&s>.3){for(let k=1;k<up-1;k++)R(X+Math.round(k*.6),cy-k,1,1,'#a9c76a');for(let k=1;k<dn-1;k++)R(X+Math.round(k*.6),cy+k,1,1,'#5f8a36');}   // 비스듬한 옆잎맥
  }
}};
/* 결정 D-524: 도담이 묻은 도토리를 찾은 순간 (사용자 피드백 2026-11-04). 흙 묻은 한 알 밑을 헤치니 도토리가 소복하다. */
const cachePic={sound:'pic_cache',draw(w,h,t){
  R(0,0,w,h,'#d9c39a');R(0,24,w,20,'#8a5f3a');R(0,24,w,2,'#a87a4c');
  R(14,22,36,10,'#6b4428');R(18,20,28,4,'#7a4f30');R(16,30,32,6,'#5a3820');   // 헤친 구덩이
  [[20,25],[26,27],[32,24],[38,26],[24,30],[31,30],[37,30],[43,28]].forEach(([x,y],i)=>{R(x,y,5,4,'#c9894a');R(x,y-1,5,2,'#6b4423');R(x+1,y+1,1,2,'#e2b07a');if(i%3===0)R(x+3,y+2,2,1,'#7a5536');});
  R(8,14,6,5,'#c9894a');R(8,13,6,2,'#6b4423');R(9,17,5,2,'#7a4b2a');   // 흙 묻은 첫 알
  const k=(Math.sin(t*3)+1)/2;if(k>.5){R(6,11,1,1,'#fff3b0');R(15,12,1,1,'#fff3b0');}
  for(const [x,y,c] of [[4,30,'#d0753d'],[54,27,'#dba448'],[50,36,'#a85834'],[10,38,'#dba448']])R(x,y,4,2,c);
}};
/* 결정 D-525: 엄마 방. 아이가 보낸 약에 따라 엄마가 조금씩 나아진다 (engine/core.js momStage). 얼굴은 그리지 않고 몸짓으로만 보인다.
   0 누워 잔다 · 1 머리맡에 빈 약사발, 숨이 고르다 · 2 벽에 기대 앉는다 · 3 문가에서 콩을 고른다 · 4 봄, 마당에서 빨래를 갠다.
   아이가 집으로 보낸 물건은 머리맡의 작은 그릇으로 놓인다. */
const momRoomPic={animate:true,sound:'pic_mom_room',draw(w,h,t){
  const st=momStage(),breath=Math.round((Math.sin(t*1.2)+1)/2),gifts=momGiftCount();
  R(0,0,w,h,st>=4?'#efe6c8':'#e3cfa4');R(0,30,w,14,'#b98a5a');R(0,30,w,1,'#8f6640');   // 벽과 장판
  R(46,4,14,14,st>=1?'#f3dfa8':'#cdb88e');R(46,4,14,1,'#7a5536');R(52,4,1,14,'#7a5536');R(46,10,14,1,'#7a5536');   // 창호, 약이 간 뒤로는 밝다
  const fur='#8a7a6a',mask='#2f2621',pale='#e6dccb';
  const head=(x,y)=>{R(x,y,9,7,fur);R(x+1,y-2,2,2,fur);R(x+6,y-2,2,2,fur);R(x+1,y+2,7,2,mask);R(x+3,y+5,3,2,pale);};
  if(st<=1){   // 누워 있다. 이불이 숨 쉬듯 오르내린다
    R(4,27,12,4,'#efe2c4');head(6,22);
    R(14,26-breath,34,6+breath,'#b0402c');R(14,26-breath,34,1,'#d0644a');for(let i=0;i<4;i++)R(18+i*8,29-breath,3,2,'#e0a060');
    if(st===1){R(4,33,7,3,'#f0ece2');R(5,32,5,1,'#7a5536');}   // 빈 약사발
  }else if(st===2){   // 벽에 기대 앉았다
    R(10,30,36,5,'#b0402c');R(10,30,36,1,'#d0644a');R(12,18,10,13,fur);head(12,11);R(22,24,4,3,fur);
  }else{   // 문가에서 콩을 고른다 / 봄 마당
    R(14,19,10,12,fur);head(14,12);R(24,27,12,4,'#9a7044');R(25,26,10,1,'#c99b66');
    for(let i=0;i<5;i++)R(26+i*2,28-(i===Math.floor(t*2)%5?1:0),1,1,'#e9d38a');   // 콩알 하나씩 고르는 손
    R(22,25,3,2,fur);
    if(st>=4){R(40,6,20,1,'#7a5536');R(42,7,6,7,'#f0ece2');R(50,7,6,6,'#9fbcc4');for(const [x,y] of [[4,38],[58,36],[30,40]])R(x,y,2,2,'#f4a6b8');}   // 빨랫줄과 봄꽃
  }
  for(let i=0;i<Math.min(3,gifts);i++)R(36+i*6,36,4,3,['#c9a27a','#e9d8c4','#a97b58'][i]);   // 아이가 보낸 것들
}};

/* ---------- 도담 (다람쥐) ---------- */
function talkDodam(){
  if(!Rg.arcsEnabled()){dodamMain();return;}
  const F=G.f,c=[{t:F.dodamDone?'해머루 가는 길 묻기':'해머루 이야기하기',go:dodamMain}];
  if(!F.galArcDodam1&&F.dodamTalk)c.push({t:'도토리 걱정을 들어 본다',go:dodamCacheAsk});
  else if(!F.galArcDodam2&&(F.galArcDodamFound||G.pickups[F.galArcDodamCache]?.got))c.push({t:'찾은 자리를 수첩에 그려 준다',go:dodamCacheDraw});
  else if(F.galArcDodam2&&F.dodamDone&&!F.galArcDodam3)c.push({t:'도담이 뭔가 내민다',go:dodamOldStory});   // 옛 저장: 찾은 자리를 그린 뒤 따로 받던 답례 (D-622: 할머니 이야기는 뺐다)
  if(c.length===1){dodamMain();return;}
  c.push({t:'다음에 이야기하자',go:null});
  talk([['도담','응? 나한테 물어볼 거 있어?',c]]);
}
function dodamCacheAsk(){
  talk([['도담','어, 그러니까… 겨울에 먹을 도토리를 묻었는데\n어디 묻었는지 잊었어!'],
    ['도담','흙 묻은 도토리가 보이면 그 밑이야!\n같이 찾아 줄래? 찾으면 꼭 갚을게!',[{t:'같이 찾아볼게',go:dodamCacheStart},{t:'해머루부터 물어볼게',go:dodamMain}]]]);
}
function dodamCacheStart(){
  const index=G.pickups.findIndex(a=>a.item==='acorn'&&a.y===GROUND&&!a.got&&(CLASSIC||a.zone==='forest'));
  // 이미 전부 주웠다면, 주울 때 흙 묻은 한 알이 있었던 걸 아이가 떠올린다. 그 자리에서 바로 그려 준다 (D-524).
  if(index<0){
    G.f.galArcDodamCache=-1;G.f.galArcDodamFound=true;
    arcScene('galArcDodam1',[['도담','어, 땅에 있던 건 벌써 다 주웠어?'],
      ['너구리','(그러고 보니 참나무 밑에서 주운 한 알은\n흙에 반쯤 묻혀 있었다. 그 밑이 불룩했지.)'],['너구리','그 자리 알아! 참나무 밑이었어.']],
      '도담이 겨울에 먹을 도토리를 묻은 자리를 잊었다. 아까 흙에 반쯤 묻힌 도토리를 주운 참나무 밑이 바로 거기였다.',dodamCacheDraw);
    return;
  }
  arcScene('galArcDodam1',[['도담','찾으면 꼭 알려 줘! 그 밑에 더 묻었거든!'],['도담','…아, 어디였더라. 참나무 밑이었는데…\n여기 참나무밖에 없잖아!']],
    '도담이 겨울에 먹을 도토리를 묻은 자리를 잊었다. 숲에서 흙 묻은 도토리가 보이면 그 밑을 살펴보기로 했다.',
    ()=>{G.f.galArcDodamCache=index;G.f.galArcDodamFound=false;});
}
Rg.arcCache=a=>Rg.arcsEnabled()&&G.f.galArcDodam1&&!G.f.galArcDodam2&&G.pickups[G.f.galArcDodamCache]===a;
// 결정 D-524: 흙 묻은 한 알을 줍는 그 자리에서 밑을 헤쳐 보고, 도담이 묻은 자리를 찾았다고 아이가 말한다 (예전엔 알림 한 줄뿐이라 언제 찾았는지 흐렸다).
Rg.onPickup=a=>{
  if(!Rg.arcCache(a))return;
  G.f.galArcDodamFound=true;
  talk([picLine(['너구리','(흙 묻은 도토리다. 밑을 헤쳐 보니\n도토리가 소복이 묻혀 있다.)'],cachePic),
    picLine(['너구리','찾았다! 도담이 묻어 둔 자리야.\n도담한테 알려 줘야지.'],null)]);
};
function dodamCacheDraw(){
  if(!(G.f.galArcDodamFound||G.pickups[G.f.galArcDodamCache]?.got))return;
  // 결정 D-134: 가루를 값으로 받는 도담은 답례로 가루가 아니라 도토리를 준다. 결정 D-280: 받은 물건은 그 대화에 "(○○을 얻었다.)"로.
  // 결정 D-526: 자리를 그려 주는 장면에 답례를 합친다 (사용자 피드백 2026-11-04: 대화가 끝나면 또 생기는 게 많다).
  // 결정 D-622: '해머루만 보고 돌아선 너구리' 할머니 이야기는 뺐다 (사용자 피드백 2026-11-05 단풍골 4).
  arcScene('galArcDodam2',[['너구리','네 도토리, 참나무 밑에 소복이 있었어.\n수첩에 그려 줄게. 보부상은 다 적거든.'],
    ['도담','여기에 동그라미! 적어 두면 안 잊겠다!\n…근데 그 수첩은 어디 묻어 둬?'],
    ['도담','찾아 준 값이야! 큰 도토리 세 알!\n빻으면 가루 하나야.'],gotLine('acorn',3)],
    '도담이 도토리 묻은 자리를 수첩에 그려 주었다. 찾아 준 값으로 큰 도토리 세 알을 받았다.',
    ()=>{learn('rule:squirrel_cache');G.f.galArcDodam3=true;});
}
function dodamOldStory(){
  if(!G.f.galArcDodam2||!G.f.dodamDone||!arcOpen('galArcDodam3'))return;
  arcScene('galArcDodam3',[['도담','아, 맞다! 찾아 주면 갚기로 했지!\n자, 큰 도토리 세 알!'],gotLine('acorn',3)],
    '도담이 도토리 찾아 준 값이라며 큰 도토리 세 알을 주었다.');
}
function dodamMain(){
  const F=G.f;
  if(!F.dodamTalk){F.dodamTalk=true;
    talk([['도담','어, 너구리다! 숲까지 오는 너구리는 오랜만이야!\n잠깐, 그 모자 어디서 봤는데…'],
      ['도담','뭐 찾아? 내가 알려 줄까?',[{t:'당산나무 해머루, 어떻게 가?',go:dodamFruit},{t:'우리 아빠 봤어? 너구리 보부상이야',go:()=>dodamDad(dodamFruit)}]]]);
  }else if(!F.dodamDone){
    if(has('powder'))dodamTrade();
    else talk([['도담','도토리 가루 하나면 가는 길 알려 줄게!\n도토리 세 알을 곱게 빻으면 돼!']]);
  }else talk([['도담',CLASSIC?'당산나무는 마을 맨 끝이야! 참, 칡덩굴 조심해!':'숲 안쪽의 금줄을 따라가!\n낫으로 덩굴을 걷으면 당산나무 언덕이야!',
    [{t:'보따리를 펼친다',go:()=>Trade.open('dodam')},{t:'고마워',go:null}]]]);
}
function dodamDad(next){
  // 결정 D-134: D-129 ⑥ 되돌림. 확정(npcs.csv) 그대로 아빠는 도담에게서 가루를 바꿔 갔고, 해머루가 익었는지 물었다.
  // 결정 D-527: 아빠는 작년 가을에 떠났다 (사용자 피드백 2026-11-04, D-36 고침)
  clue('d1','도담','작년 가을 보부상 너구리가 도담에게서 도토리 가루를 바꿔 갔다. 해머루가 익었는지 묻더니, 아직이라는 말에 북쪽으로 간다고 했다.');
  rel('dodam',1);
  talk([['도담','아, 생각났다! 보부상 아저씨도 그 모자 썼어!'],['너구리','진짜? 우리 아빠야!'],['도담','작년 가을에 그 아저씨가 여기서\n도토리 가루를 잔뜩 바꿔 갔거든!'],['도담','해머루 익었냐고 묻더니, 아직이라니까\n북쪽으로 간댔어. 엄청 급해 보이던데.']],next);
}
function dodamFruit(){
  ledger('dodam','도담','도토리 가루 1','해머루 자리에 대한 정보');
  const dad=G.clues.some(c=>c.id==='d1');
  const worry=Rg.arcsEnabled()&&!G.f.galArcDodam1?[['도담','아, 도토리 하니까 생각났다!\n내 겨울 도토리, 어디 묻었더라…']]:[];
  // 결정 D-281: 해머루는 보랏빛이다(그림·아이템 설명). 다람쥐는 절구가 없어 가루를 못 빻는다.
  talk([...(dad?[['너구리','나도 해머루 찾고 있어.\n당산나무까지 어떻게 가?']]:[]),['도담',dad?'가는 길? 그럼, 내가 알지!\n이번엔 익었어. 칡꽃 속에 보랏빛 알이 비치더라!':'가는 길? 그럼, 내가 알지!'],
    ['도담','대신 도토리 가루 하나 줘! 세 알이면 가루 하나야.\n우린 절구가 없어서 못 빻거든!'],...worry],()=>{if(has('powder'))dodamTrade();});
}
function dodamTrade(){
  // 결정 D-425: 처음 가루를 들고 오면, 짐도 없이 빻아 온 걸 도담이 신기해한다. 아이도 어떻게 됐는지 잘 모른다.
  const first=!G.f.dodamSawBag;G.f.dodamSawBag=true;
  talk([...(first?[['도담','와, 도토리 가루! 벌써 빻았어?\n근데 절구는 어디 있는데?'],['너구리','(보따리를 툭 쳤다.)'],
      ['도담','그 납작한 데서 절구가 나와?!\n나도 그런 거 있으면 도토리 안 잃어버릴 텐데!']]:[]),
    ['도담',first?'그 가루, 나랑 바꿀 거지?':'와, 도토리 가루! 나랑 바꿀 거지?',[{t:'보따리를 펼친다',go:()=>Trade.open('dodam')},{t:'아직은 안 줄래',go:null}]]]);
}
function dodamGive(){
  if(G.f.dodamDone||!has('powder'))return;
  {
    takeItem('powder',1);G.f.dodamDone=true;ledgerDone('dodam');rel('dodam',1);
    // 결정 D-411: 나무 속을 오르는 길은 없다. 숲 안쪽 금줄 길을 따라 언덕의 당산나무까지 걸어간다.
    // 결정 D-623: 해머루는 당산나무를 감은 늙은 칡이 꽃 속에 품어 맺는 열매다 (사용자 피드백 2026-11-05 단풍골 7). 나무 꼭대기에 열린다는 말은 뺐다
    diary('dodam',CLASSIC?'해머루는 마을 끝 당산나무를 감은 칡이 꽃 속에 품고 있다. 요즘 그 칡덩굴이 나무를 꽁꽁 감았다고 한다.':'당산나무 언덕으로는 숲 안쪽 금줄 친 길로 간다. 해머루는 당산나무를 감은 칡이 꽃 속에 품고 있다. 요즘 그 칡덩굴이 길이며 나무를 꽁꽁 감았다고 한다.');
    // 결정 D-426: 길에서 받는 첫 이름. 해머루 길을 알려면 꼭 거치는 교환이라, 누구나 이 이름을 받는다 (name-story.md §7.7)
    if(typeof grantNickname==='function')grantNickname('gal_powder_pedlar','가루 보부상','도담');
    // 결정 D-983: 지어 준 이가 불러 줘야 이름이 붙는다 (name-story-v2.md §3, 규칙 1). 도담은 그걸 모르고 자랑으로만 말한다.
    talk([['도담','와, 고마워! 너 이제 가루 보부상이다!\n내가 지었어!'],['너구리','…그게 뭐야.'],
      ['도담','내가 지었으니까 내가 젤 많이 부를 거야!\n가루 보부상! 가루 보부상!'],
      ['도담',CLASSIC?'아무튼! 해머루는 마을 끝 당산나무 칡꽃 속에 있어!\n근데 그 칡덩굴이 나무를 꽁꽁 감았어.':'아무튼! 숲 안쪽 금줄 친 길로 가면 당산나무 언덕이야!\n근데 칡덩굴이 길이며 나무를 꽁꽁 감았어.'],
      ['도담','곡괭이로는 안 끊길걸? 날 선 연장은\n대장간 무쇠 아저씨한테밖에 없어!']],()=>{if(!G.clues.some(c=>c.id==='d1'))dodamDad();});
  }
}

/* ---------- 날쌘 (족제비 떠돌이 보부상) ---------- */
// 결정 D-03: 첫 만남에서 날쌘이 아빠 모자를 알아본다(영산 고백의 복선) (design/data/decisions.csv)
function talkNal(){
  if(!G.f.nalTalk){G.f.nalTalk=true;ledger('nal','날쌘','도토리 가루 1 + 칡뿌리 1','숯');
    // 결정 D-236: 단풍골의 아이는 어른 보부상 흉내를 낸다 (꼬마 소리에 맞받고, 흥정은 어른 말투로)
    talk([['날쌘','어이, 꼬마 보부상. 이 동네 숯은 다 내 지게에 있지.\n시시한 건 안 받아.'],['너구리','꼬마 아니고 보부상이에요.\n…시시한 거요?'],['너구리','(날쌘의 눈이 내 모자에 잠깐 머문다.)'],
      // 결정 D-148: 물건의 품(레어도)과 그 표시를 날쌘이 첫 만남에 알려 준다. "시시한 건 안 받아"를 아이가 되묻는 데서 나온다.
      ['날쌘','물건마다 품이 있어. 잎 하나면 하품, 잎 둘이면 중품,\n열매 하나 붙으면 상품, 둘이면 최상품.'],
      ['날쌘','금빛이면 천하일품. 해머루쯤은 돼야 그 소리 듣지.\n같은 품이면 하나, 한 품 아래면 둘. 그게 보부상 셈이야.']],nalMenu);}   // 결정 D-282: 날쌘 말투는 반말("~야")로 한결같이. 해라체("~다")는 무쇠의 말투다   // 결정 D-134: 교환 규칙을 날쌘이 한 줄로 (D-39)
  else nalMenu();
}
function nalMenu(){
  const c=[{t:'보따리를 펼친다',go:()=>Trade.open('nal')}];
  if(!knows('nal:dadtag'))c.push({t:'아빠 짐표를 보여 준다',go:nalDadTag});   // 결정 D-426: 짐표는 내놓을 물건이 아니라 아빠를 묻는 표다
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
    talk([['날쌘','숯? 도토리 가루 하나에 칡뿌리 하나.\n그럼 숯 하나 줄게.'],['너구리','흠흠. 그 값이면… 생각해 보죠.'],...(both?[['날쌘','마침 둘 다 있네. 바꿀래?',[{t:'도토리 가루와 칡뿌리를 건넨다',go:nalTrade},{t:'조금 이따가요',go:null}]]]:
      [['날쌘',has('root')?'도토리 가루부터 빻아 와.':'칡뿌리는 흙 무른 데를 곡괭이로 파 봐.\n보부상이 그런 것도 몰라?'],
        ...(has('root')?[]:[['날쌘','…하긴, 나도 첫 장사 땐 몰랐어.']])])]);return;   // 결정 D-161: 놀린 뒤 같은 보부상으로 한 발 물러선다
  }
  if(!both){talk([['날쌘','값은 벌써 말했잖아.\n도토리 가루 하나에 칡뿌리 하나. 둘 다 가져와.']]);return;}
  takeItem('powder',1);takeItem('root',1);G.f.nalDone=true;ledgerDone('nal');
  const extra=G.rel.nal.v>0;
  const got=receiveItem('coal',extra?2:1);if(extra)learn('nal:bluff-paid');
  if(arcOpen('galArcNal1')&&extra){
    arcScene('galArcNal1',[['날쌘','봐. 이게 제대로 된 숯이야.'],['날쌘','하나 더 얹었어. 써 봐.'],got,['날쌘','꼬마가 숯 보는 눈은 아직이네.']],
      '날쌘에게 허세를 부렸더니 숯을 하나 더 얹어 주었다. 꼬마가 숯 보는 눈은 아직이라며 코웃음을 쳤다.');
    return;
  }
  talk(extra?[['날쌘','봐, 이게 제대로 된 숯이야. 하나 더 얹어 줄 테니 써 봐.'],got,['날쌘','써 보고도 촌구석 소리가 나오나 보자고.']]:[['날쌘','자, 숯 하나. 딱 맞게 바꾼 거야.'],got,['날쌘','네 삼촌한테 줄 거야? 그 양반, 여간 까다로운 게 아닌데.'],['너구리','…우리 삼촌인 거 어떻게 알아요?'],['날쌘','이 동네 대장장이가 너구리인데\n너구리 꼬마면 조카지. 가.']]);
}
function nalRoute(){
  arcScene('galArcNal2',[['너구리','숯 하나에 가루랑 뿌리 둘이요?\n숯이 더 비싸요?'],
    ['날쌘','단풍골엔 참나무가 흔해. 근데 돌너머 가면\n같은 숯도 값이 달라. 돌투성이라 나무가 귀하거든.'],
    ['날쌘','값은 물건이 정하는 게 아니야. 길이 정해.\n…칡꽃도 북쪽에선 귀하게 쳐.'],
    ['너구리','그걸 왜 알려 줘요?'],
    ['날쌘','공짜 아니야. 적어 둬. 나중에 받을 거니까.'],
    ['너구리','(수첩에 “값은 길이 정한다”고 적었다.)'],
    ['날쌘','…진짜 적네.']],
    '날쌘에게 숯값 셈을 물었다. 값은 물건이 아니라 길이 정한다고 했다. 북쪽 돌너머에선 칡꽃이 귀하다고 귀띔하고는, 공짜가 아니니 나중에 받겠다고 했다.',
    ()=>learn('nal:route-price'));
}
function nalHat(){
  // 결정 D-528: 칡 요령 같은 쓸데없는 귀띔은 뺐다 (사용자 피드백 2026-11-04). 칡을 푼 뒤라면 소문 한마디만.
  const tip=G.boss.dead?[['날쌘','칡도 풀었다며. …소문 한번 빠르네, 이 동네.']]:[];
  arcScene('galArcNal3',[['너구리','아저씨, 아까부터 제 모자 봐요.'],
    ['날쌘','누가? 지게 끈 보고 있었어.'],
    ['너구리','아빠 모자예요. 떠나는 날 엄마가 씌워 줬어요.'],
    ['너구리','(날쌘이 한동안 말이 없다가, 모자를 벗겨\n꺾인 챙을 손바닥으로 펴고 도로 씌워 준다.)'],
    ['날쌘','보부상은 모자부터 바로 써.\n비 오면 챙이 얼굴을 막아 줘.'],
    ['너구리','아빠도 비 오는 날 그 말 했어요.'],
    ['날쌘','흔한 말이야. 보부상이면 다 해.'],...tip],
    '날쌘이 꺾인 모자 챙을 펴서 도로 씌워 주었다. 엄마가 씌워 준 아빠 모자라고 하자 한동안 말이 없었다. 아빠가 하던 말과 같은 말을 하고는, 흔한 말이라고 했다.',
    ()=>learn('nal:hat'));
}
function nalAhead(){
  if(!arcOpen('galArcNal4'))return;
  arcScene('galArcNal4',[['너구리','(날쌘이 좌판을 걷어 지게에 묶고 있다.)\n…어디 가요?'],
    ['날쌘','북쪽. 날 밝으면 먼저 떠.\n첫눈 오기 전에 고개를 넘어야 하거든.'],
    ['너구리','저도 북쪽 가요. 같이 가요.'],
    ['날쌘','보부상은 혼자 다녀. 짐 나눠 지면 셈이 꼬여.\n…돌너머 어귀에 좌판 펴고 있을지도 모르지.'],
    ['날쌘','이건 남은 주먹밥이야. 상하기 전에 먹어.\n버리기 아까워서 주는 거야.'],gotLine('rice',1)],
    '날쌘이 좌판을 걷고 있었다. 날 밝으면 먼저 북쪽으로 간다고 했다. 같이 가자니 보부상은 혼자 다닌다면서, 돌너머 어귀에 있을지도 모른다고 했다. 남은 주먹밥이라며 하나를 줬다.');
}
/* 결정 D-426: 아이가 아빠 짐표를 보이며 아빠를 봤는지 묻는다. 날쌘은 뒷면 낙관만 보고 알아보지만, 아빠 얘기는 피한다(영산 고백 D-03의 복선) */
function nalDadTag(){
  learn('nal:dadtag');
  clue('n1',NAME_CLUES.n1.who,NAME_CLUES.n1.text);
  talk([['너구리','이거 우리 아빠 짐표예요.\n이거 단 보부상, 본 적 있어요?'],
    ['너구리','(날쌘이 짐표를 뒤집어 뒷면 낙관을 한참 본다.)'],
    ['날쌘','…流 낙관 모르는 보부상이 어딨어.'],['너구리','그럼 아빠 봤어요?'],
    ['날쌘','짐표는 아무한테나 내보이는 거 아니야.\n도로 매 둬.'],['날쌘','네 아빠는… 됐어. 갈 길이나 가.']]);
}

/* 선택 재료 수량은 trades.csv의 t_craft_salt 그대로다. 필수 교환과 별개로 한 번만 바꾼다.
   아이가 본 것(풀린 바구니 테)에서 시작한다. 날쌘이 줄기를 원하는 까닭과 소금·깨를 내놓는 까닭을 말한다. */
function nalCraftSalt(){
  if(G.f.craftTrade_salt){talk([hintLine('sesame_salt',['날쌘','소금 종지랑 깨는 벌써 줬잖아.\n묵을 쑤든, 깨랑 찧든 네 솜씨껏 써.'])]);return;}
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
  // 결정 D-147: 바구니 이야기를 듣기 전에 보따리에서 바로 바꾸면, 날쌘이 줄기를 원한 까닭부터 말한다.
  const first=!G.f.nalBasketSeen;G.f.nalBasketSeen=true;ledger('t_craft_salt','날쌘','칡 줄기 1','소금 2 + 깨 1');
  takeItem('vine',1);addItem('salt',2);addItem('sesame',1);G.f.craftTrade_salt=true;ledgerDone('t_craft_salt');
  talk([...(first?[['날쌘','칡 줄기네. 지게 바구니 테가 풀려서\n걸을 때마다 숯가루가 새던 참이야.']]:[]),['날쌘','이제 숯가루 안 새겠네.'],
    ['너구리','(소금 두 종지와 깨 한 봉지를 얻었다.)'],   // 결정 D-280: 종지·봉지는 날쌘이 부른 단위 그대로
    hintLine('sesame_salt',['날쌘','가루에 소금 넣고 묵 쑤는 건 알지?\n깨도 볶아 놨으니, 소금이랑 같이 찧어 봐.'])]);   // 결정 D-461: 귀띔
}

/* ---------- 무쇠 (삼촌, 아빠의 동생인 너구리 대장장이) ----------
   아빠와 젊은 날 같은 길에 나섰다가 다리를 다쳐 대장장이가 됐다. 몸이 성치 않아 형을 찾아 나서지 못한다.
   형이 작년 가을 낫과 아이의 잎사귀를 맡기며 "조심성부터 보고 주라"고 했다 (결정 D-527). 시험 뒤 집안 변신술을 가르친다. */
function talkMusoe(){
  // 집안 사람이라 변신해도 알아본다 (leaf-transform.md 6-4).
  if(G.form){talk([['무쇠','잎 소리 다 들린다.\n삼촌 앞에선 제 모습으로 와라.']]);return;}
  if(!Rg.arcsEnabled()){musoeMain();return;}
  const F=G.f,c=[{t:F.musoeDone?'낫 이야기하기':'낫과 시험 이야기하기',go:musoeMain}];
  // 결정 D-526: 낫 맡기던 날·낫 자루·삼촌 다리를 한 장면으로 합쳤다 (사용자 피드백 2026-11-04: 대화가 끝나면 또 생기는 게 많다).
  // 결정 D-117: "너는 살펴라"를 아이가 그대로 지킨다. 삼촌 다리 → 할멈의 칡뿌리 찜질 → 낫을 다시 세움.
  if((F.musoeTested||F.musoeDone)&&!F.galArcMusoe2)c.push({t:'아빠가 낫을 맡기던 날을 묻는다',go:musoeNight});
  else if(F.galArcMusoe2&&!F.galArcMusoeLeg1)c.push({t:'삼촌 다리를 살핀다',go:musoeLeg});   // 옛 저장: 따로 열리던 다리 이야기
  if(F.galArcMusoeLeg1&&F.galPoultice&&!F.galArcMusoeLeg3)c.push({t:'칡뿌리 찜질을 건넨다',go:musoeLegWrap});
  if(F.galArcMusoeLeg3&&!F.galArcMusoeBye&&G.diary.some(d=>d.id==='end'))c.push({t:'떠난다고 인사한다',go:musoeBye});
  if(c.length===1){musoeMain();return;}
  c.push({t:'다음에 올게요',go:null});
  talk([['무쇠','무슨 일이냐.',c]]);
}
function musoeNight(){
  if(!G.f.musoeTested&&!G.f.musoeDone)return;
  sceneNext('g_musoe_night');
  // 결정 D-283: 낫을 맡긴 까닭(조심성부터 보라)은 첫 만남에 들었다. 아이는 그날 아빠가 어땠는지를 묻는다.
  // 결정 D-134: 확정(npcs.csv) "사흘 묵으며 밤마다 장부만 봄". 집이 코앞인데 묵은 까닭은 무쇠의 짐작으로만 둔다.
  arcScene('galArcMusoe2',[['너구리','아빠가 낫 맡기던 날, 어땠어요?'],
    ['무쇠','작년 가을이다. 떠나기 전 사흘을 여기서 묵으며\n밤마다 낡은 장부만 들여다보더군.'],
    ['너구리','여기서요? 집이 코앞인데.'],
    ['무쇠','집에선 못 펴 볼 거였겠지.\n…그 얘긴 하지 말라더군. 벌써 반은 어겼다.'],
    ['너구리','(삼촌이 모루에 기대 무릎을 주무른다.)\n…다리 또 아파요?'],
    ['무쇠','젊어서 형 따라 같은 길에 나섰다가\n이 다리로 돌아왔다. 비 오기 전엔 쑤신다.'],
    ['무쇠','형은 앞만 봤다. 너는 살펴라.'],
    ['너구리','네. 그럼 삼촌 다리부터 살필게요.'],
    ['무쇠','…그 말을 거기다 쓰냐.\n할멈한테 가서 쓸데없는 소리 마라.'],
    // 결정 D-832: 할멈이 누군지 여기서 처음 듣는다 (사용자 피드백 2026-11-06 단풍골 4: 할멈이 뜬금없이 나온다).
    //   아이는 프롤로그에서 까치가 물어 온 '두꺼비 할멈의 말'만 안다. 삼촌이 어떤 이인지, 어디서 만나는지 일러 준다.
    ['너구리','할멈이요? …까치 편에 말 보낸\n두꺼비 할머니요?'],
    ['무쇠','늪가에서 약 짓는 두꺼비 말고 누가 있냐.\n네 어미 약도 다 그 할멈 손에서 나온다.'],
    ['무쇠','해머루 익을 철이면 당산나무 언덕 어귀에\n약탕관 걸고 앉아 있지. 가서 내 얘긴 꺼내지도 마라.']],
    '작년 가을 아빠는 떠나기 전 사흘을 삼촌 대장간에서 묵으며 밤마다 낡은 장부를 들여다봤다. 삼촌은 젊어서 아빠와 같은 길에 나섰다가 다리를 다쳤다. 형은 앞만 봤으니 너는 살피라고 했다. 두꺼비 할머니는 엄마 약을 짓는 늪가 약재상인데, 해머루 철이면 당산나무 언덕 어귀에서 기다린다고 한다. 할머니를 만나면 삼촌 다리 약을 여쭤보기로 했다.',
    ()=>{G.f.galArcMusoe3=true;G.f.galArcMusoeLeg1=true;
      clue('m2','무쇠 삼촌','작년 가을 아빠는 떠나기 전 사흘을 대장간에서 묵으며 밤마다 낡은 장부를 들여다봤다. 그 이야기는 하지 말라고 삼촌에게 부탁했다.');});
}
function musoeLeg(){
  arcScene('galArcMusoeLeg1',[['너구리','(삼촌이 모루에 기대 무릎을 주무르고 있다.)\n…다리 또 아파요?'],
    ['무쇠','비 오기 전엔 쑤신다. 그뿐이다.\n할멈한테 가서 쓸데없는 소리 마라.'],
    ['무쇠','…늪가 두꺼비 할멈 말이다. 해머루 철이면\n언덕 어귀에 앉아 있다. 거기 가서도 입 다물어라.'],   // 결정 D-832
    ['너구리','(…두꺼비 할머니 만나면 꼭 여쭤봐야지.)']],
    '삼촌이 모루에 기대 무릎을 주물렀다. 늪가 두꺼비 할머니한테 쓸데없는 소리 말라길래, 언덕 어귀에서 할머니를 만나면 여쭤보기로 했다.');
}
function musoeLegWrap(){
  if(!G.f.galPoultice||!arcOpen('galArcMusoeLeg3'))return;
  const sharp=G.sharp;
  arcScene('galArcMusoeLeg3',[['너구리','할머니가 칡뿌리 찜질을 싸 주셨어요.'],
    ['무쇠','…누가 할멈한테 가랬냐.'],
    ['너구리','쓸데없는 소리는 안 했어요.\n다리 얘기만 했어요.'],
    ['너구리','(삼촌이 한참 보다가, 말없이 받아 무릎에 감는다.)'],
    ['무쇠','…따뜻하군. 형도 그랬다.\n제 발은 터져도 남 다리만 봤다.'],
    hintLine('jjimjil_dol',['무쇠','…겨울이면 구들돌을 데워\n솜에 싸서 내 다리에 대 줬지. 그게 오래 갔다.']),   // 결정 D-461: 귀띔
    // 결정 D-284: 찜질 심부름의 값. 날이 덜 섰으면 날을 세워 주고, 이미 섰으면 벼리고 남은 숯을 준다.
    ...(sharp?[['무쇠','그 낫, 날은 멀쩡하군.\n…벼리고 남은 숯이다. 가져가라.'],gotLine('coal',1),['무쇠','고맙긴. 남은 거다.']]
      :[['너구리','(삼촌이 내 낫을 받아 숫돌에 몇 번 문지른다.\n날이 한결 날카로워졌다.)'],['무쇠','고맙긴. 덜 된 걸 마저 한 거다.']])],
    '할머니가 싸 준 칡뿌리 찜질을 삼촌께 갖다 드렸다. 삼촌은 말없이 무릎에 감고 따뜻하다고 했다. 아빠도 제 발은 터져도 남 다리만 봤다고. 그러고는 낫을 손봐 주었다.',
    ()=>{G.sharp=true;learn('musoe:leg');refreshHud();});
}
function musoeBye(){
  arcScene('galArcMusoeBye',[['너구리','(삼촌이 대장간 문턱까지 나와 서 있다.)'],
    ['무쇠','찜질 덕에 오늘은 덜 쑤신다.\n…네 어미한테도 아침에 다녀왔다. 죽은 받아먹더라.'],
    ['너구리','돌아올 때 할머니 찜질 또 갖다 드릴게요.'],
    ['무쇠','필요 없다. …칡뿌리는 굵은 걸로 가져와라.'],
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
      ['두꺼비 할멈','식기 전에 갖다 주렴.\n…그 집 형제는 고맙단 말을 못 배웠지.'],
      hintLine('ssanghwa',['두꺼비 할멈','남는 뿌리는 겨우살이에 대추 하나 넣고\n갈아 두렴. 겨울 약으론 그만이다.'])]);   // 결정 D-461: 귀띔
  };
  const tail=rootSpare()?[['두꺼비 할멈','칡뿌리 하나 있느냐? 찧는 건 내가 하마.',[{t:'칡뿌리 하나를 건넨다',go:give},{t:'조금 이따가요',go:null}]]]
    :[['두꺼비 할멈',has('root')?'그 뿌리는 아직 쓸 데가 있겠구나.\n남는 걸로 하나 가져오렴.':'칡뿌리 하나 가져오렴.\n찧는 건 내가 하마.']];
  if(!ask){talk(tail);return;}
  arcScene('galArcMusoeLeg2',[['너구리','할머니, 무쇠 삼촌 다리가 쑤신대요.\n할머니한테는 말하지 말래요.'],
    ['두꺼비 할멈','허허, 그럼 많이 아픈 게로구나.\n칡뿌리를 짓찧어 싸 매면 붓기가 좀 내린단다.']],
    '삼촌 다리 이야기를 하자 할머니는 웃었다. 말하지 말라고 했으면 많이 아픈 거라고. 칡뿌리를 짓찧어 싸 매면 붓기가 내린다고 했다.',
    ()=>talk(tail));   // 장면 줄에는 선택지를 두지 않는다 (D-350). 칡뿌리를 건넬지는 장면이 끝난 뒤 묻는다
}
function toadLegChoice(){
  const F=G.f;
  if(!Rg.arcsEnabled()||!F.galArcMusoeLeg1||F.galPoultice)return null;
  return {t:F.galArcMusoeLeg2?'삼촌 찜질에 쓸 칡뿌리 이야기':'삼촌 다리에 듣는 약을 묻는다',go:toadPoultice};
}
/* 결정 D-1203 (사용자 지시 2026-11-07: 아빠 도장은 뒤에 올 보부상을 위한 이정표): 대장간 모루 밑 도장을 찾으면
   곁의 무쇠 삼촌이 그 뜻을 말해 준다. 삼촌이 아는 까닭: 형이 삼촌의 대장간을 '연장 고칠 데'로 찍어 준 사람이라서다.
   (삼촌은 젊은 날 형과 길에 나섰다가 다리를 다쳐 대장장이가 됐다.) 다른 도장을 먼저 찾았으면 아이는 이미 아빠 손인 걸 안다. */
Rg.onStampFound=s=>{
  if(s.id!=='anvil')return false;
  const knew=knows('lore:dad_stamp');learn('lore:dad_stamp',true);
  talk([['너구리',knew?'(길에서 본 아빠 손이 모루 밑에도 있다.)':'(모루 밑에 너구리 손바닥 자국이 눌려 있다.\n아빠 수첩 첫 장에 찍힌 손이랑 똑같다.)'],
    ['너구리','삼촌, 모루 밑에 아빠 손이 있어요.'],
    ['무쇠','…형이 찍었다. 내가 이 모루를 들이던 해에.'],
    ['무쇠','보부상은 뒤에 올 이들 보라고 길에 표를 남긴다.\n형은 손바닥으로 했다.'],
    ['무쇠','여긴 연장 고칠 데가 있다는 표다.\n…덕분에 지나던 보부상이 꽤 들렀지.'],
    ['너구리','그럼 아빠 가는 길마다 이런 손이 있어요?'],
    ['무쇠','쓸 만한 데마다 있을 거다.\n형 길을 따라가 봐라.'],
    ['너구리','(아빠 손을 찾는 대로 수첩에 그려 두자.)']],
    ()=>diary('gal_stamp_anvil','대장간 모루 밑에서 아빠 손바닥 도장을 찾았다. 삼촌이 대장간을 열던 해에 아빠가 연장 고칠 데라는 표로 찍어 준 거란다. 보부상은 뒤에 올 이들을 위해 길에 표를 남기고, 아빠는 손바닥으로 남겼다. 아빠 길을 따라가면 쓸 만한 데마다 있을 거라고 했다.'));
  return true;
};
function musoeMain(){
  const F=G.f;
  if(!F.musoeMet){F.musoeMet=true;
    // 결정 D-216: 무쇠는 까칠·무뚝뚝(확정)하되 서두르지 않는다. 막는 까닭은 걱정이고, 시험은 보내 줄 길이다 (사용자 피드백 37).
    talk([['무쇠','왔냐. …보따리는 왜 멨냐.'],['너구리','아빠 찾으러 가요.\n엄마 약도 구하고요.'],
      ['무쇠','길이 멀다. 넌 아직 어리고.'],['너구리','안 어려요. 보따리도 제가 쌌어요.'],
      ['무쇠','…집안 보따리를 꺼냈구나.\n형은 그걸로 모루도 지고 다녔다.'],   // 결정 D-425: 요술보따리의 내력은 집안 사람의 이 한마디로만
      ['무쇠','형은 한 해째 소식이 없다.\n너까지 길에서 다치면 네 어미 볼 낯이 없다.',[{t:'저도 보부상이에요, 삼촌. 보내 주세요',go:musoe2}]]]);
  }else if(!F.musoeTested&&!F.musoeDone){
    talk([['무쇠','숨은 골랐냐.\n급할 것 없다. 준비되면 다시 해 보자.',[{t:'다시 해 볼게요',go:battleMusoe},{t:'조금 이따가요',go:null}]]]);
  }else if(!F.leafGiven){
    musoeLeaf();
  }else if(!F.musoeAfterLeaf&&F.leafSplit&&!F.musoeDone){
    musoeAfterLeaf();
  }else if(!F.musoeDone){
    // 결정 D-139: 시험에서 받은 숯은 날 세우는 몫이라, 그 숯이 있으면 벼릴 숯이 하나 더 든다.
    if(has('coal',F.musoeCoal?2:1))talk([['무쇠','숯 가져왔군. 불 올린다.'],['너구리','(삼촌이 쇠를 달궈 세 번 내리친다.\n다리는 절어도 망치는 흔들리지 않는다.)']],openForge);
    else talk([['무쇠',F.musoeCoal&&has('coal')?'그 숯은 날 세우는 몫이다.\n벼릴 숯은 따로 가져와라.':'숯이 있어야 불을 올리지.\n네 연장이니 값은 네가 치러라.'],['무쇠',CLASSIC?'물레방아 쪽 날쌘이 녀석한테 가 봐라. 숯을 쟁여 놨을 거다.':'날쌘이 녀석이 길목에 좌판을 폈더라.\n숯을 쟁여 놨을 거다.']]);
  }else talk([['무쇠','낫은 손에 익었냐.\n형은 그걸로 덩굴을 잘도 쳐냈다.'],['무쇠','너도 곧 그럴 게다.']]);
}
function musoe2(){
  clue('m1','무쇠 삼촌','아빠는 작년 가을 삼촌에게 낫을 맡기고 떠났다. 내가 따라나설 줄 알았다고 한다.');
  diary('musoe','무쇠 삼촌이 길을 막았다. 아빠가 낫을 맡기며 내 조심성부터 보고 주라고 했단다. 나도 어른 보부상이라는 걸 보여 줘야 한다.');
  // 결정 D-413: 낫 이야기가 갑자기 나오지 않게 잇는다 (사용자 피드백 2026-11-03). 도담에게 칡 이야기를 들었으면 아이가 먼저 날 선 연장을 청하고,
  // 삼촌은 대답 대신 대장간 벽(art: 벽에 걸린 아빠의 낫)을 올려다본다. 아이가 그 낫을 알아보고 묻자 삼촌이 맡은 사연을 말한다.
  const ask=G.f.dodamDone?[['너구리','당산나무 칡을 끊어야 해요.\n날 선 연장 좀 빌려주세요.']]:[];
  talk([...ask,['너구리','(삼촌이 대답 대신 벽에 걸린 낫을 올려다본다.)'],['너구리','…저거, 아빠 낫이죠?\n자루에 감은 끈이 똑같아요.'],
    ['무쇠','작년 가을에 형이 맡기고 갔다. 네가 따라나서면\n그때 주라더군. 조심성부터 보고.'],
    ['무쇠','한 해를 기다린 낫이다.\n덤비지 말고 버텨 봐라.'],['너구리','(…흥, 버티는 거라면 자신 있어.)']],battleMusoe);
}
function battleMusoe(){
  const n=Rg.npcs.find(n=>n.id==='musoe');
  // 결정 D-75: 먹 전환 글자는 상대에 맞춘다. 삼촌과는 싸움이 아니라 시험이다.
  inkTransition('시험',(n.x-G.cam)/W*100,()=>startBattle('musoe',(res,info)=>{
    if(res==='lose'||res==='flee'){talk([['무쇠','다친 데는 없냐.'],['무쇠',res==='flee'?'그래, 무리다 싶으면 물러나는 거다.\n숨 고르고 다시 와라.':'서두르니까 맞는 거다.\n숨 고르고 다시 와라.']]);return;}
    const perfect=res==='win'&&info.hits===0;
    G.f.musoeTested=true;rel('musoe',(res==='calm'||perfect)?2:1);ledger('musoe','무쇠 삼촌','숯 1','아빠가 맡긴 낫');
    if(perfect)G.f.musoeCoal=true;   // 결정 D-139: 시험 숯은 날을 더 세우는 몫(확정 §9). 벼리기엔 날쌘 숯이 따로 든다.
    if(typeof grantTool==='function')grantTool('pickaxe');
    diary('test',res==='calm'?'무쇠 삼촌에게 먹을 것을 건네 마음을 풀었다. 아빠도 이렇게 했을까.':'무쇠 삼촌이 꿀밤으로 연장부터 빼앗고 덤볐다. 끝까지 피했더니, 마지막에 꿀밤을 한 대 쥐어박고는 됐다고 했다.');
    // 결정 D-528: '돌 만나면 그걸로 쳐라' 같은 쓸데없는 요령 대사는 뺐다 (사용자 피드백 2026-11-04)
    talk([['무쇠',res==='calm'?'…배부터 채웠으니 고집은 그만 부리마.\n먹을 걸 내밀 줄도 아는구나.':perfect?'허, 그 한 대 말고는 다 피했군.\n형 아들 맞다.':'끝까지 버티는 건 형을 닮았군.\n…그만하면 길에서 제 몸은 지키겠다.'],
      ['무쇠','연장은 도로 가져가라.\n이가 나갔으니 낫 벼릴 때 같이 세우마.']],musoeLeaf);
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
    talk([['무쇠','하나 더 줄 게 있다만. 오늘 다람쥐는 봤냐.'],['너구리','다람쥐요? 아직요. …다람쥐는 왜요?'],
      ['무쇠','보고 오면 안다. 그럼 이건 좀 이따 주마.'],
      ['무쇠',CLASSIC?'마을 어귀에 도담이가 있다.':'길목에 다람쥐 형제가 도토리를 세더라.\n숲엔 도담이도 있고.']]);
    return;
  }
  const thinkOf=sawDodam?'도담을 떠올리며 잎을 분다':'길에서 본 다람쥐 형제를 떠올리며 잎을 분다';
  const open=F.leafHeld?[['무쇠','다람쥐는 봤냐.'],['너구리','네. 보고 왔어요.'],['무쇠','그럼 이거다.']]:[['무쇠','하나 더 있다.']];
  // 결정 D-523: 잎을 꺼내는 줄부터 작은 창에 당산나무 잎을 띄우고, 삼촌이 제 잎을 불 때 내린다
  talk([...open,picLine(['너구리','(삼촌이 품에서 접어 둔 잎 하나를 꺼내 편다.\n톱니가 고른, 늦가을에도 푸른 잎이다.)'],leafPic),
    ['무쇠','당산나무 잎이다. 형이 낫이랑 같이 맡겼다.\n제 발로 길 나서는 날 주는 게 우리 집안 풍습이다.'],
    picLine(['무쇠','잘 봐라.'],null),
    ['너구리','(삼촌이 자기 잎을 입술에 대고 짧게 분다.\n모루 옆에 오소리 한 마리가 선다.)'],
    ['너구리','삼촌이… 오소리가 됐어!'],
    ['무쇠','잎은 네가 아는 만큼만 바뀐다.\n오늘 본 것 중에 제일 잘 아는 걸 떠올려라.',[{t:thinkOf,go:musoeFirstForm}]]]);
}
function musoeFirstForm(){
  const F=G.f;F.leafGiven=true;F.leafSplit=true;   // 결정 D-117: 이 뒤로 엄마 잎 이야기는 다시 말을 걸 때 한 번만
  if(typeof unlockForm==='function')unlockForm('squirrel');
  if(typeof setForm==='function')setForm('squirrel',{scripted:true});
  diary('form_squirrel','삼촌에게 아빠가 맡긴 잎사귀를 받았다. 다람쥐를 떠올리며 잎을 부니 내가 다람쥐가 됐다. 다람쥐는 잊어도 다시 찾는다. 그래서 겁 없이 오른다.');
  talk([['너구리','(삐익, 풀피리 소리가 났다. 몸이 작아지고 꼬리가 커졌다.)'],['너구리','나… 다람쥐야!'],
    ['무쇠','됐다. 한 번 더 불면 돌아온다.\n…도토리는 묻지 마라. 잊는다.'],['너구리','(잎을 다시 부니 너구리로 돌아왔다.)']],()=>{
      if(typeof setForm==='function')setForm('');
      // 결정 D-173: 숫자 키와 다람쥐가 잘하는 것은 새 변신 알림 카드가 알린다 (forms.js)
      // 결정 D-89: 무쇠 대사를 한자리에 몰지 않는다. 엄마 잎 이야기와 낫 벼리기 안내는 다시 말을 걸 때 이어진다.
    });
}
function musoeAfterLeaf(){
  const F=G.f;F.musoeAfterLeaf=true;
  // 결정 D-413: 잎 이야기로 갑자기 건너뛰지 않게, 아이가 받은 잎을 만지작거리다 엄마 잎을 떠올린다.
  talk([['너구리','(받은 잎을 만지작거리다 보니 어디서 본 것 같다.)\n삼촌, 엄마 경대 위에도 마른 잎이 있어요.'],
    ['무쇠','네 어미 잎이다.\n둔갑을 못 하게 된 뒤로 말라 갔을 게다.'],
    ['너구리','엄마 약을 구하면 그 잎도 살아나요?'],['무쇠','모른다. 그러니 가 봐라.\n네 어미는 내가 들여다본다. 다리는 절어도 그 길은 간다.'],
    // 결정 D-139: 시험 숯을 받았으면 벼릴 숯이 따로 든다.
    ['무쇠',has('coal',F.musoeCoal?2:1)?'다만 녹슨 낫은 벼려야 한다.\n숯은 있으니 됐다.':F.musoeCoal?'다만 녹슨 낫은 벼려야 한다.\n아까 그 숯은 날 세울 때 쓰마. 벼릴 숯은 네가 구해 와라.':'다만 녹슨 낫은 벼려야 한다.\n벼릴 숯은 네 연장이니 네가 구해 와라.'],
    // 결정 D-447: 할 일 줄이 '날쌘에게 숯 구하기'를 띄우기 전에, 아이가 날쌘을 모르면 삼촌이 숯 있는 데를 일러 준다
    ...(!has('coal',F.musoeCoal?2:1)&&!F.nalTalk?[['무쇠',CLASSIC?'물레방아 쪽 날쌘이 녀석한테 가 봐라.\n숯을 쟁여 놨을 거다.':'날쌘이 녀석이 길목에 좌판을 폈더라.\n숯을 쟁여 놨을 거다.']]:[])],()=>{if(has('coal',F.musoeCoal?2:1))musoeMain();});   // 결정 D-986: 사연 판에서 '무슨 일이냐' 고르기로 되돌아가던 것을 바로 벼리기로 잇는다
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
  // 결정 D-280: 낫은 보따리가 아니라 손에 드는 연장이라 "얻었다"에 손때 이야기를 잇는다.
  const gotSickle=['너구리','(아빠의 낫을 얻었다.\n자루에 아빠 손때가 반들반들하다.)'];
  // 결정 D-426: 아빠 이름이 먹혀 자루에서도 지워졌다(name-story.md 규칙 3). 무쇠는 처음부터 안 지진 줄 안다.
  const handle=[['너구리','(삼촌이 자루 끝을 엄지로 한 번 문지른다.)'],['무쇠','형은 연장마다 제 이름을 지졌는데.\n…이건 안 지졌군.'],
    hintLine('chik_sil',['무쇠','자루에 감은 건 칡 실이다.\n칡 줄기를 쪄서 뽑지. 형 손버릇이었다.'])];   // 결정 D-461: 귀띔
  talk(Rg.arcsEnabled()?
    [['무쇠','됐다. 네 아비 낫이다.\n곡괭이 이도 메웠다.'+(sharp?' 숯이 넉넉해서 날을 더 세웠다.':'')],gotSickle,...handle,['무쇠','당산나무 칡은 성질이 고약하다. 무리하지 마라.']]:
    [['무쇠','됐다. 네 아비 낫이다. 곡괭이 이도 메웠다.'+(sharp?'\n숯이 넉넉해서 날을 더 세웠다.':'')],gotSickle,...handle,['너구리','아빠는 이거 맡기고 바로 떠났어요?'],['무쇠','떠나기 전 사흘을 여기서 묵었다.\n낡은 장부만 보더군. 집에선 못 펴 볼 거였겠지.'],['무쇠','당산나무 칡은 성질이 고약하다. 무리하지 마라.']]);   // 결정 D-413: 장부 이야기 앞에 아이의 물음
}

/* ---------- 두꺼비 할멈 (약재상) ---------- */
/* 결정 D-412: 1장의 끝은 엉킨 칡이다(사용자 피드백 2026-11-03). 할멈은 약방 마당에서 당산나무 꼭대기가 크게 흔들리는 걸 보고,
   칡이 풀렸으면 칡꽃·칡뿌리를 거둘 수 있겠다 싶어 약탕관째 언덕으로 올라온다. 아이가 해머루를 주울 즈음 닿는다.
   결정 D-521: 늪가 약방 구역을 뺐다 (사용자 피드백 2026-11-04). 할멈은 칡이 풀린 뒤에야 언덕에서 처음 만난다.
   해머루를 주우면 할멈이 먼저 아이를 불러 사정을 말하고 약 교환을 연다. 첫 만남·찜질·눈약도 모두 언덕에서 한다 (반딧불 부탁은 D-624로 뺐다).
   결정 D-833: 할멈은 보스 전에 만난다 (사용자 피드백 2026-11-06 단풍골 5: 보스를 잡아야만 나와서 그 전엔 못 만난다).
   할멈은 해마다 해머루가 익을 철이면 언덕 어귀(금줄 길 들머리 바로 안쪽)에 약탕관을 걸고 기다린다. 칡이 열매를 떨구면 마르기 전에 달여야 약이 되어서다.
   올해는 칡이 유난히 엉켜 늙은 다리로는 당산나무 곁까지 못 간다. 아이가 언덕에 들어서면 할멈이 먼저 불러 첫 만남 이야기를 한다(진행을 막지 않게 한 번만, 땅을 딛고 있을 때).
   결정 D-834: 칡이 풀리면 할멈이 어귀에서 아이 곁까지 직접 걸어와 이야기를 잇는다. 약탕관은 어귀에 둔 채 온다. 다다른 자리에 머문다 (G.f.galToadX). */
const TOAD_HILL_X=1060;   // 예전 저장(칡이 풀린 뒤 할멈이 올라와 있던 자리)
const TOAD_GATE_X=300;    // 언덕 어귀. 금줄 길 들머리(180) 바로 안쪽
function toadUphill(){
  return !CLASSIC&&!!G;
}
Rg.toadUphill=toadUphill;
function toadHillX(){
  const F=G?.f;if(!F)return TOAD_GATE_X;
  if(Number.isFinite(F.galToadX))return F.galToadX;
  return F.galToadUphill&&!F.galToadCame?TOAD_HILL_X:TOAD_GATE_X;   // 예전 저장: 해머루를 주워 할멈이 이미 올라와 있다
}
// 결정 D-833·D-834: 어귀에서 먼저 부르고, 칡이 풀린 뒤에는 걸어서 온다. Rg.expStep 에서 부른다.
function toadHillStep(){
  if(CLASSIC||G.zone!=='hill'||G.ended)return;
  const F=G.f,free=!open('dlg')&&!B&&!paused()&&!G.form;   // 변신한 동안엔 할멈이 아이를 몰라본다 (확정 §2) — 제 모습일 때 부른다
  if(!F.toadMet&&!G.boss.dead){
    if(free&&G.onGround&&G.px>=TOAD_GATE_X-70){G.vx=0;talkToad();}
    return;
  }
  if(!G.boss.dead||F.galToadCame)return;
  if(F.galToadUphill||G.diary.some(d=>d.id==='end')){F.galToadCame=true;F.galToadX=toadHillX();return;}   // 예전 저장은 그 자리 그대로
  if(!free)return;
  const x=toadHillX(),dx=G.px-x,reach=TABLES.TUNING.field_talk_distance;
  if(Math.abs(dx)<=reach){F.galToadCame=true;F.galToadX=Math.round(x);toadCome();return;}
  F.galToadX=x+Math.sign(dx)*Math.min(Math.abs(dx)-reach+1,TABLES.TUNING.field_move_speed*.8);
}
function toadHillIntro(){
  if(!toadUphill()||G.f.galToadHillMet)return [];
  G.f.galToadHillMet=true;
  if(G.boss.dead)return [['두꺼비 할멈','얘야! 나무 꼭대기가 크게 흔들리길래\n어귀에서 올라와 봤다. 칡이 풀렸구나.']];   // 예전 저장: 칡을 먼저 푼 판
  return [['두꺼비 할멈','얘야, 거기 보따리 멘 아이.\n…그 모자를 보니 네가 그 집 아이로구나.'],
    ['너구리','두꺼비 할머니세요?\n까치가 할머니 말을 물어 왔어요.'],
    ['두꺼비 할멈','옳지, 까치가 말을 잘 전했구나.\n해머루 익을 철이면 나는 해마다 여기서 기다린단다.'],
    ['두꺼비 할멈','칡이 열매를 떨구면 마르기 전에 달여야 약이 되거든.\n올해는 칡이 저리 엉켜서 늙은 다리로는 못 간다.']];
}
// 결정 D-834: 칡이 풀린 뒤 아이 곁까지 와서 하는 말. 칡꽃 귀띔(D-461)도 이때 한다: 이제야 꽃을 거둘 수 있다.
function toadCome(){
  if(!G.f.toadMet){talkToad();return;}
  if(G.diary.some(d=>d.id==='end')||(Rg.arcsEnabled()&&G.f.galArcToad1)){toadFarewell();return;}
  const fruit=has('meoru'),trade=[{t:'보따리를 펼친다',go:()=>Trade.open('toad')},{t:'조금 이따가요',go:null}];
  talk([['두꺼비 할멈','얘야, 다친 데는 없니?\n나무 꼭대기가 크게 흔들려서 가슴이 철렁했다.'],
    ['너구리',fruit?'괜찮아요. 칡이 풀리면서\n해머루를 떨어뜨렸어요!':'괜찮아요. 칡이 스르르 풀렸어요.\n해머루도 나무 밑에 떨어졌어요.'],
    hintLine('kkot_cheong',['두꺼비 할멈','장하다. 이제 칡꽃도 거둘 수 있겠구나.\n칡꽃은 꿀에 재워 두면 겨울 내내 목이 안 붓지.']),   // 결정 D-461: 귀띔
    fruit?['두꺼비 할멈','어디 보자. …잘 익었구나.\n보따리를 펼쳐 보렴.',trade]
      :['두꺼비 할멈','그럼 어서 주워 오렴.\n마르기 전에 달여야지.']]);
}
// 결정 D-78: 가공품을 얹으면 덤 하나(확정 PA-9 B). 할멈은 묵을 약과 함께 엄마에게 보내고, 길에서 먹을 버섯을 얹어 준다.
function toadGive(i=0){
  if(!has('meoru')||G.diary.some(d=>d.id==='end'))return;
  if(i===1&&has('acorn_jelly')){
    takeItem('acorn_jelly',1);G.f.galJellyToMom=true;   // 결정 D-525: 엄마 머리맡에 묵 그릇이 놓인다
    talk([['두꺼비 할멈','묵까지 쑤어 왔구나. 약이랑 같이 까치 편에 보내마.\n이건 말린 꾀꼬리버섯이란다. 길에서 끓여 먹으렴.'],
      receiveItem('kkoe',1)],()=>toadGive(0));return;
  }
  // 결정 D-129: 집은 마을 어귀다. 아이가 들고 가지 않고 까치가 나르는 까닭을 할멈이 말한다.
  // 결정 D-426: 고개 넘는 아이에게 하는 옛말. 마지막 보스의 공격 방식(돌아보면 먹힌다)의 복선이지만 잔소리로만 들린다
  // 결정 D-526: 약 이야기와 까치가 나르는 까닭을 짧게 한 흐름으로 (사용자 피드백 2026-11-04)
  // 결정 D-1392 (사용자 지시 2026-11-08 47, name-story-v4 §3): 전설의 열매를 뺐다. 할멈은 엄마가 앓는 까닭이 병이 아닌 줄 안다.
  //   그래서 '고친다'는 말을 하지 않고 기운을 붙들 뿐이라고만 한다. 서리다래는 그 기운을 한 번 더 붙들 귀한 약재다.
  talk([['두꺼비 할멈','이걸로 약을 달여 까치 편에 집으로 보내마.\n다만 기운을 붙들 뿐이란다.'],
    ['두꺼비 할멈','네 엄마를 낫게 하는 건 내 약탕관에 없다.\n북쪽 돌너머 서리다래라면 한 번 더 붙들 게다.'],
    ['너구리','제가 갖다 드리면 안 돼요?'],
    ['두꺼비 할멈','엄마 얼굴 보면 그 문턱을 다시 넘기 어려울 게다.\n너는 눈 오기 전에 고개를 넘으렴.'],
    // 결정 D-982·D-1083 (name-story-v3 §6): 금기는 '돌아보지 마라, 세 번째 부름엔 넋이 따라간다'. 할멈은 약초 캐러 산을 오르내린 늙은이라 산사람 금기를 안다.
    ['두꺼비 할멈','하나만 일러 두마. 밤 산길에서 누가 이름을 부르거든\n돌아보지 마라. 세 번째 부름엔 넋이 따라간단다.'],
    ['두꺼비 할멈','약초 캐러 산을 오르내리며 늙은이들한테 들은 말이다.\n…늙은이 잔소리지.'],
    ['너구리','(…내 이름 부를 사람도 없는데.)']],()=>{
    takeItem('meoru',1);ledgerDone('toad');rel('toad',1);
    diary('end','할멈이 엄마에게 약을 보내 주었다. 북쪽 길이 열렸다. 아빠, 기다려요.');
    if(Rg.arcsEnabled()){G.f.galArcToad1=true;diary('galArcToad1','두꺼비 할멈이 해머루로 엄마 기운을 붙드는 약을 지어 까치 편에 보냈다.');}
    toadFarewell();
  });
}
function talkToad(){
  if(G.diary.some(d=>d.id==='end')||(Rg.arcsEnabled()&&G.f.galArcToad1)){toadFarewell();return;}
  const trade=[{t:'보따리를 펼친다',go:()=>Trade.open('toad')},{t:'조금 이따가요',go:null}];
  if(has('meoru')&&G.f.toadMet){
    talk([['두꺼비 할멈','잘 익었구나. 어디, 보따리를 펼쳐 보렴.',trade]]);
    return;
  }
  if(!G.f.toadMet){G.f.toadMet=true;rel('toad',1);
    ledger('toad','두꺼비 할멈','해머루 1','엄마 기운을 붙드는 약');
    // 결정 D-1393 (사용자 지시 2026-11-08 47, name-story-v4 §1.1): D-134·D-142의 '아빠가 전설의 열매를 물었다'를 바꿨다.
    //   작년 여름 엄마는 앓는 아이를 업고 할멈에게 와 살릴 길을 물었고, 할멈은 젊을 때 들은 신목 이야기를 해 줬다.
    //   작년 가을 장삿길에서 돌아온 아빠가 할멈을 찾아와 그 일을 들었다. 할멈은 엄마와 한 약속 때문에 아이에게는 말하지 않는다.
    //   말까지 잃어 간다는 건 편지를 나른 까치에게 들었다(그대로). 결정 D-527: 아빠가 떠난 때는 작년 가을이다.
    const fruit=has('meoru'),intro=toadHillIntro();
    clue('t1','두꺼비 할멈','작년 가을 장삿길에서 돌아온 아빠는 두꺼비 할멈을 찾아가 무언가를 들었다. 며칠 뒤 북쪽으로 갔다. 할멈은 아빠한테 들으라며 말을 아꼈다.');
    diary('toad','두꺼비 할멈은 엄마를 낫게 할 약은 없지만 기운은 붙들 수 있다고 했다. 해머루가 필요하다.');
    talk([...intro,...(intro.length>1?[]:[['두꺼비 할멈',intro.length?'네가 그 집 아이로구나. 까치가 말을 잘 전했구나.':'어서 오렴. 까치가 말을 잘 전했구나.']]),
      ['두꺼비 할멈','편지 나르는 그 까치가 그러더구나.\n네 엄마가 이젠 말까지 잃어 간다고.'],
      ['두꺼비 할멈','그건… 병이라기보다는…\n…아니다. 늙으니 헛말이 나오는구나.'],
      ['두꺼비 할멈',fruit?'해머루… 이거면 기운은 붙들 수 있단다.':CLASSIC||!G.boss.dead?'내 손으로 낫게 하진 못해도 기운은 붙들 수 있단다.\n당산나무 칡꽃 속 해머루를 가져오렴.':'내 손으로 낫게 하진 못해도 기운은 붙들 수 있단다.\n떨어진 해머루부터 주워 오렴.'],
      ['너구리','아빠는 엄마 낫게 할 걸 찾으러 갔어요.\n할머니는 그게 뭔지 알아요?'],
      ['두꺼비 할멈','(할머니가 한참 말이 없다.)\n…작년 가을, 장삿길에서 돌아온 네 아빠가 날 찾아왔더구나.'],
      ['두꺼비 할멈','늙은이 얘기를 듣고 며칠 뒤 북쪽으로 갔다.\n그 얘긴 네 아빠 입으로 듣거라. 내가 할 말이 아니란다.'],
      // 결정 D-426: 끈에 매단 아빠의 짐표. 할멈은 앞면을 쓸어 보지만 아빠 이름이 떠오르지 않는다 (name-story.md 규칙 3)
      ['너구리','(아빠 얘기에 나도 모르게 짐표를 꼭 쥐었다.\n할머니가 짐표 앞면을 손끝으로 쓸어 본다.)'],
      ['두꺼비 할멈','…그 양반 이름이 혀끝에서 맴도는데.\n이름이란 게 참 잘도 달아나는구나.'],
      ...(fruit?[['두꺼비 할멈','자, 해머루를 보자꾸나.',trade]]
        // 결정 D-833: 칡을 풀기 전 첫 만남은 칡 곁으로 보내는 말로 끝난다. 다리 약·눈약은 그다음 말을 걸면 고른다.
        :!CLASSIC&&!G.boss.dead?[['두꺼비 할멈','칡이 성나거든 무리 말고 물러났다 오렴.\n나는 여기서 약탕관 불을 지키고 있으마.']]:[])]);
    return;
  }
  const leg=toadLegChoice(),geom=Rg.toadGeomChoice?.();
  talk([['두꺼비 할멈',CLASSIC?'해머루를 가져오렴. 당산나무 칡꽃 속이란다.':!G.boss.dead?'해머루는 저 칡꽃 속에 들었단다.\n칡이 성나거든 물러났다 오렴.':'떨어진 해머루부터 주워 오렴.\n그 나무 밑에 있을 게다.',[...(leg?[leg]:[]),...(geom?[geom]:[]),{t:'보따리를 펼친다',go:()=>Trade.open('toad')},{t:'다녀올게요',go:null}]]]);
}
function toadFarewell(){
  const F=G.f,c=[{t:'북쪽으로 떠난다',go:endGame}];
  if(Rg.arcsEnabled()&&!F.galArcToad2&&G.rel.toad.v>=1)c.push({t:'엄마를 아는지 묻는다',go:toadWinter});
  if(Rg.arcsEnabled()&&F.galArcToad2&&!F.galArcToad3)c.push({t:'떠나기 전에 인사를 드린다',go:toadWrap});   // 옛 저장: 따로 열리던 포대기 끈 장면
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
// 결정 D-02: 할멈은 엄마가 "이 길로 갔다"까지만 말한다 (design/data/decisions.csv). 언덕 끝이 북쪽 길 들머리라 '이 길'이 그 길이다.
// 결정 D-526: 엄마 이야기와 포대기 끈을 한 장면으로 (예전엔 두 번에 나눠 열렸다)
// 결정 D-1394 (사용자 지시 2026-11-08 47, name-story-v4 §1·§1.1): '아기였던 겨울, 엄마가 아기를 안고 이 길을 지났다'를 바꿨다.
//   작년 여름 엄마는 열에 들뜬 아이를 업고 할멈에게 와 살릴 길을 물었다. 할멈에게 아이를 맡기고
//   혼자 이 길로 북쪽에 갔다. 할멈이 그동안 아이에게 데우는 약을 끓여 먹였다. 아이는 열에 들떠 할멈 얼굴을 기억하지 못한다(첫 만남에 낯설다).
//   돌아와 아이를 안고 갈 때 포대기 끈은 잊고 갔다. 어디 갔는지, 무엇을 냈는지는 엄마와 한 약속이라 말하지 않는다. 아빠에게는 작년 가을 다 말했다.
function toadWinter(){
  if(!G.f.galArcToad1||G.rel.toad.v<1)return;
  arcScene('galArcToad2',[['너구리','할머니는 우리 엄마를 알아요?'],
    ['두꺼비 할멈','알다마다. 작년 여름, 네가 열에 들떠 앓을 때\n네 엄마가 너를 업고 내 약방까지 왔더랬다.'],
    // 결정 D-1394: 아이가 버틴 까닭(데우는 약)과, 아빠가 영산 전에 사정을 안 출처(할멈이 작년 가을 다 말했다).
    ['두꺼비 할멈','숨이 가늘어서… 데우는 약을 끓여 먹였지.\n네 엄마는 너를 내게 맡기고 이 언덕 끝 길로 혼자 올라갔다.'],
    ['너구리','(…그 여름, 누가 쓴 약을 떠먹여 주던 것만 어렴풋하다.\n엄마 손이 아니었다.)'],
    ['너구리','엄마가요? 어디 가는 길이었어요?'],
    ['두꺼비 할멈','…늙으면 말이 느려지지.\n네 엄마랑 한 약속이 있단다. 네 아빠한테는 작년 가을에 다 말했고.'],   // 결정 D-142·D-1394
    ['두꺼비 할멈','자, 그날 네 엄마가 너를 업었던 포대기 끈이다.\n돌아와 너를 안고 갈 땐 이 끈은 잊고 갔지.'],
    ['두꺼비 할멈','내내 간직했으니, 이젠 네가 지니렴.'],
    ['너구리','(포대기 끈을 얻었다.\n보따리 말고 품 안쪽에 넣었다.)']],
    '두꺼비 할멈은 작년 여름 내가 열에 들떠 앓을 때 엄마가 나를 업고 왔다고 했다. 엄마는 나를 할멈 약방에 맡기고 언덕 끝 북쪽 길로 혼자 올라갔고, 할멈이 그동안 데우는 약을 끓여 먹였단다. 돌아온 엄마가 나를 안고 갈 때 잊고 간 포대기 끈을 할멈이 간직해 왔다. 어디 가는 길이었는지 묻자 엄마와 한 약속이 있다며 말을 아꼈다. 아빠에게는 작년 가을 다 말했단다. 그 포대기 끈을 받았다.',
    ()=>{G.f.galArcToad3=true;learn('galchamgol:arc-toad-wrap');toadFarewell();});
}
function toadWrap(){
  if(!G.f.galArcToad2)return;
  arcScene('galArcToad3',[['두꺼비 할멈','이 끈을 가져가렴. 작년 여름 네 엄마가 너를 업었던 끈이란다.'],
    ['너구리','(포대기 끈을 얻었다.\n보따리 말고 품 안쪽에 넣었다.)']],
    '두꺼비 할멈에게 작년 여름 엄마가 잊고 간 포대기 끈을 받았다. 엄마에게 가져가려고 조심히 챙겼다.',()=>{learn('galchamgol:arc-toad-wrap');toadFarewell();});
}

/* ---------- 엉킨 칡 전투 ---------- */
// 결정 D-1302 (사용자 지시 2026-11-08 43): 엉킨 칡 앞 쉼터. 확장판은 언덕의 금줄 천 조사(810)를 지나 칡을 처음 보는 자리(960) 앞,
//   옛 구성은 칡덩굴 장막(1660)을 끊은 바로 너머 1680. 칡 앞(1955)까지는 덩굴 몹 둘이 1700~1920 을 오가서 그 앞에 둔다(불 앞에서 일어나자마자 몹에 닿지 않게).
//   둘 다 쉼터와 칡 사이에 할 일·인물·문은 없다
Rg.rest={zone:'hill',get x(){return CLASSIC?1680:890;},need:()=>CLASSIC?!!G.barrier?.cut:true,
  line:'부시를 쳐서 작은 불을 피웠다. 손 좀 녹이고, 숨 고르고 가자.'};
Rg.startKudzu=()=>{
  G.px=1950-(Rg.hillShift||0);
  inkTransition('엉킨 칡',(G.boss.x-G.cam)/W*100,()=>startBattle('kudzu',res=>{
    if(res==='win'||res==='calm'){
      if(res==='calm')diary('calm','엉킨 칡을 부수지 않고 달랬다. 칡이 놓아준 자리에 보랏빛 꽃이 피어 있었다.');
      Rg.bossDie();
    }else restAfterBattle(res,()=>{G.px=1900-(Rg.hillShift||0);},()=>{   // 결정 D-1302: 지면 쉼터로 (rest.js)
      G.f.faints+=res==='lose'?1:0;
      diary('hint','엉킨 칡에게 밀려났다. 서두르지 말고 칡이 틈을 보일 때를 노리자. 버섯 향을 좋아하는 것 같았다.');
      talk([['너구리','(…서두르지 말자. 버섯 향을 좋아하는 것 같았어.)']],()=>think('준비되면 다시 다가가자.'));
    });
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
/* 결정 D-890: 할 일은 목표(화면)와 길잡이(수첩)를 함께 돌려준다 (goalLine). 길잡이는 아이가 들은 말과 본 것만 쓴다.
   옛 구성(CLASSIC)은 구역이 없어 자리 이름을 빼고 말한다. 아래 확장판 덮어쓰기(D-67)도 같은 글을 쓴다. */
const where=(expanded,classic='')=>CLASSIC?classic:expanded;
const acornStep=why=>{const ac=G.inv.acorn||0;return has('powder')?null:ac<3?why+' 도토리 세 알을 줍자. 참나무 밑에 많이 떨어져 있다. ('+ac+'/3)':'도토리 세 알이 모였다. 보따리를 열고 절구에 빻아 도토리 가루를 내자.';};
const TOOL_GOAL='칡을 끊을 연장 구하기';
const goalSteps={
  farewell:()=>goalLine('북쪽으로 떠나기','엄마 기운을 붙들 약은 할머니가 달여 보내 주셨다. 두꺼비 할머니께 인사드리고, 아빠가 간 북쪽 길로 떠나자.'),
  boss:()=>has('meoru')?goalLine('해머루 전해 드리기','해머루를 얻었다. 두꺼비 할머니께 가져다드리면 엄마 기운을 붙들 약을 달여 주신다고 했다.')
    :goalLine('해머루 얻기','엉킨 칡이 풀리며 해머루가 떨어졌다. 당산나무 '+where('언덕','밑')+'에서 해머루를 주워 담자.'),
  fight:()=>goalLine('엉킨 칡 걷어 내기','해머루는 당산나무를 감은 칡이 꽃 속에 품고 있다. 나무를 꽁꽁 감은 엉킨 칡과 맞서자.'),
  climb:()=>goalLine('해머루 찾기','금줄 길이 열렸다. 길을 따라 당산나무 언덕으로 올라가자.'),
  findWay:()=>goalLine('당산나무 가는 길 알아보기','해머루는 당산나무에 있다는데, 가는 길을 모른다. '+where('대장간 길 너머 참나무 숲 쪽에서','동네에서')+' 길을 아는 이를 찾아 물어보자.'),
  dodam:()=>goalLine('당산나무 가는 길 알아보기',acornStep('도담이 도토리 가루 하나를 주면 길을 알려 준댔다.')||'도토리 가루가 생겼다. '+where('참나무 숲의 ')+'도담에게 건네고 당산나무 가는 길을 듣자.'),
  // 도담: "날 선 연장은 대장간 무쇠 아저씨한테밖에 없어!"
  musoe:()=>goalLine(TOOL_GOAL,'칡덩굴이 길이며 나무를 꽁꽁 감았단다. 날 선 연장은 대장간 무쇠 삼촌께밖에 없다고 도담이 그랬다. 대장간으로 삼촌을 찾아뵙자.'),
  test:()=>goalLine(TOOL_GOAL,'벽에 걸린 낫은 아빠가 맡긴 것이다. 삼촌은 내 조심성부터 보고 주신댔다. 대장간에서 삼촌 앞에 서서 끝까지 버텨 내자.'),
  // 삼촌은 "줄 게 있다"고만 했다. 잎사귀라는 건 받을 때 안다
  leaf:()=>goalLine(TOOL_GOAL,'삼촌이 다람쥐를 보고 오면 하나 더 줄 게 있다고 하셨다. 다람쥐를 봤으니 대장간에 다시 가 보자.'),
  afterLeaf:()=>goalLine(TOOL_GOAL,'아빠 낫은 아직 못 받았다. 대장간에서 삼촌께 다시 말씀을 여쭙자.'),
  coal:()=>goalLine(TOOL_GOAL,'숯을 구했다. 대장간의 무쇠 삼촌께 갖다드리면 녹슨 낫을 벼려 주신다.'),   // 결정 D-139
  nal:()=>goalLine(TOOL_GOAL,'녹슨 아빠 낫을 벼리려면 숯이 있어야 한다. 삼촌 말로는 날쌘 아저씨가 숯을 쟁여 놨다. 날쌘 아저씨를 찾아가자.'),
  nalPowder:()=>{const p=acornStep('날쌘 아저씨는 도토리 가루 하나와 칡뿌리 하나를 받고 숯을 준다.');return p&&goalLine(TOOL_GOAL,p);},
  root:()=>goalLine(TOOL_GOAL,'숯 값으로 칡뿌리도 하나 있어야 한다. 반짝이는 흙더미에서 칡뿌리를 캐자.'),
  nalGive:()=>goalLine(TOOL_GOAL,'숯 값이 다 모였다. 날쌘 아저씨께 도토리 가루와 칡뿌리를 건네고 숯을 받자.'),
  cut:()=>goalLine('당산나무 가는 길 열기','삼촌이 아빠 낫을 벼려 주셨다. '+where('참나무 숲 안쪽 금줄 길을','당산나무 가는 길을')+' 막은 칡덩굴을 낫으로 끊자.'),
};
Rg.goal=()=>{
  const F=G.f,S=goalSteps;
  if(!G.started)return '';
  if(G.ended)return '단풍골 체험판 완료';
  // 결정 D-67: 할 일은 가장 앞선 진행부터 거꾸로 본다. 변신으로 앞질러 가도 지금 상태에 맞는 일을 알려 준다.
  if(G.diary.some(d=>d.id==='end')||(Rg.arcsEnabled()&&F.galArcToad1))return S.farewell();
  if(G.boss.dead)return S.boss();
  if(G.barrier.cut||mapVisited(Rg.id,'hill'))return S.fight();
  if(!F.dodamTalk)return S.findWay();
  if(!F.dodamDone)return S.dodam();
  if(!F.musoeMet)return S.musoe();
  if(!F.musoeTested&&!F.musoeDone)return S.test();
  if(F.leafHeld&&!F.leafGiven&&!F.musoeDone)return S.leaf();
  if(F.leafGiven&&!F.musoeAfterLeaf&&!F.musoeDone)return S.afterLeaf();
  if(!F.musoeDone){
    if(has('coal',F.musoeCoal?2:1))return S.coal();
    if(!F.nalTalk)return S.nal();
    return S.nalPowder()||(has('root')?S.nalGive():S.root());
  }
  return S.cut();
};
/* 결정 D-149: 보통 일(사연에서 맡은 심부름). 아이가 하겠다고 한 뒤부터 마칠 때까지만 보인다.
   결정 D-890: 이름(title)이 목표이고, text 는 수첩에 적는 지금 단계의 길잡이다. */
defineSideQuests(Rg.id,[
  {id:'gal_dodam_cache',title:'도담이 묻은 도토리 찾기',start:F=>F.galArcDodam1,done:F=>F.galArcDodam2,
    text:F=>F.galArcDodamFound||(G.region===Rg.id&&G.pickups[F.galArcDodamCache]?.got)?'도담이 묻은 도토리를 찾았다. 참나무 숲의 도담에게 찾은 자리를 알려 주자.'
      :'도담이 참나무 밑 어딘가에 겨울 도토리를 묻었는데 자리를 잊었단다. 참나무 숲의 참나무 밑을 살펴 찾아 주자.'},
  {id:'gal_geom_eye',title:'검댕 아저씨 눈약 구해 드리기',start:F=>F.galArcGeom1,done:F=>F.galArcGeom5,
    text:F=>!F.galGeomEyeWash?'검댕 아저씨는 숯 연기에 눈이 절어 빛이 다 뿌옇다고 한다. 해머루를 들고 두꺼비 할머니께 갈 때 눈약도 여쭙기로 했다.'
      :'두꺼비 할머니가 눈약을 지어 주셨다. 참나무 숲의 검댕 아저씨께 갖다드리자.'},   // 결정 D-530
  {id:'gal_musoe_leg',title:'무쇠 삼촌 다리 찜질 구해 드리기',start:F=>F.galArcMusoeLeg1,done:F=>F.galArcMusoeLeg3,
    text:F=>!F.galArcMusoeLeg2?'무쇠 삼촌이 쑤시는 다리를 주무르고 계셨다. 엄마 약을 지으시는 두꺼비 할머니라면 듣는 약을 아실 것이다. 삼촌 말로는 해머루 철이면 당산나무 언덕 어귀에 앉아 계신단다. 할머니께 여쭤 보자.'
      :!F.galPoultice?'할머니가 칡뿌리를 짓찧어 찜질을 싸 주신단다. 쓸 데 없는 칡뿌리 하나를 캐서 할머니께 갖다드리자.'
      :'할머니가 칡뿌리 찜질을 싸 주셨다. 식기 전에 대장간의 무쇠 삼촌께 갖다드리자.'},
  {id:'gal_lost_chick',title:'꺼병이 엄마 찾아 주기',start:F=>F.galExpChickWith,done:F=>!!F.wanderersDone?.['galchamgol:lost_chick'],
    text:F=>F.galExpChickArrived?'갈대 너머에서 어미 꿩이 답했다. 꺼병이에게 말해 주자.'
      :'꺼병이 엄마는 해 지면 물가의 갈대 아래에 있겠다고 했단다. 꺼병이가 놓치지 않게 너무 앞서지 말고 오른쪽 갈대까지 같이 걷자.'},
]);

/* PA-43: 첫 가을의 길손과 조사. classic은 위의 지도와 대사를 그대로 쓴다. */
if(!CLASSIC){
  // 결정 D-88: 손일은 미니게임 없이 바로 마친다 (확정: 미니게임은 채집·전투·놀이에만, 대장 2026-10-30). 막혀 있던 판정 코드는 지웠다.
  // 함께 손쓰는 일(보자기 누르기 등)은 대사 속 한 동작으로 끝낸다.
  // 결정 D-343: 제목·종류·단계 문구 인자와 옛 진행 기록(galHandsProgress) 정리는 지웠다
  function hands(commit){
    if(G.ended)return;
    Sound.gather(true);commit();refreshHud();
  }
  const done=id=>!!G.f.wanderersDone?.['galchamgol:'+id];
  const picture=name=>(x,y,f)=>Rg.expArt[name](x,y,f);
  /* 결정 D-152: 대사 속 장면 그림(64×44). 화면 가운데 작은 창에 띄운다(field.js peekPicture, 살펴보기 그림과 같은 창).
     withPic(줄, 그림)로 그 줄부터 띄우고, withPic(줄, null)로 내린다. 대화가 끝나면 저절로 내린다. */
  const withPic=(line,pic)=>Object.assign(line,{pic});
  const scenePic={
    // 까치의 약보자기: 아이의 두 손이 양쪽 귀를 누르고, 까치가 위에서 매듭을 문다
    bojagi(w,h){
      R(0,0,w,h,'#e9dcc0');R(0,31,w,13,'#a97b58');R(0,31,w,1,'#7a5536');R(0,37,w,1,'#946a49');
      const cl='#5d7f8c',dk='#46636e',lt='#7d9da6';
      R(16,20,32,12,cl);R(19,17,26,3,cl);R(14,24,36,7,cl);R(15,30,34,2,dk);
      for(const [x,y] of [[20,22],[27,25],[35,22],[42,26],[24,28],[38,28]])R(x,y,2,1,lt);
      R(2,26,14,4,cl);R(0,27,3,2,cl);R(48,26,14,4,cl);R(61,27,3,2,cl);   // 양쪽 귀
      R(27,10,4,8,cl);R(33,10,4,8,cl);R(29,15,6,3,dk);                    // 위로 모은 귀와 매듭
      // 너구리 손: 검은 팔뚝, 밝은 손바닥, 귀를 누르는 손가락 끝
      const paw=(x)=>{R(x-1,30,8,8,'#2f241d');R(x,24,9,7,'#4a3426');R(x+1,25,7,3,'#8a6a4e');for(let i=0;i<4;i++)R(x+i*2+1,23,1,2,'#4a3426');R(x+1,30,7,1,'#2e211a');};
      paw(5);paw(50);                                                       // 두 손이 귀를 꾹 누른다
      R(37,3,5,4,'#1d1a1a');R(41,4,9,6,'#1d1a1a');R(43,8,6,2,'#f0ece2');R(45,5,3,2,'#f0ece2');R(50,5,9,2,'#26304a');
      R(38,4,1,1,'#f0ece2');R(34,6,3,1,'#2a2622');R(33,7,1,2,'#2a2622');   // 매듭 쪽으로 부리를 내민 까치
    },
    // 함지박: 통나무를 파서 만든 넓고 얕은 둥근 나무 그릇. 개울가 둑에 놓였다
    hamjibak(w,h){
      R(0,0,w,h,'#e9dcc0');R(0,33,w,11,'#6f9a9a');for(let i=0;i<5;i++)R(4+i*13,37+(i%2)*3,7,1,'#a9c9c4');
      R(9,20,46,4,'#a77b52');R(11,24,42,3,'#a77b52');R(14,27,36,2,'#9a6f49');R(18,29,28,2,'#8d6340');R(22,31,20,1,'#7a5536');   // 둥근 몸통
      R(15,22,9,1,'#8d6340');R(34,25,12,1,'#8d6340');R(21,27,7,1,'#8d6340');                                                     // 나뭇결
      R(14,13,36,1,'#c99b66');R(10,14,44,1,'#c99b66');R(8,15,48,5,'#c99b66');R(10,20,44,1,'#b58a5c');R(14,21,36,1,'#b58a5c');   // 둥근 테
      R(15,15,34,1,'#7a5536');R(11,16,42,2,'#6b4a30');R(14,18,36,1,'#7a5536');                                                   // 파낸 속
      R(55,22,4,1,'#d9c08a');R(58,23,1,5,'#d9c08a');R(57,28,3,1,'#d9c08a');   // 둑에 매는 끈
    },
    // 뒤집어 말리는 함지박 밑바닥의 붉은 낙관(流)
    hamjibakStamp(w,h){
      R(0,0,w,h,'#e9dcc0');R(0,34,w,10,'#9e7150');R(0,34,w,1,'#7a5536');
      R(10,24,44,10,'#a77b52');R(14,20,36,4,'#b8895a');R(20,17,24,3,'#c99b66');R(8,33,48,2,'#7a5536');
      R(15,27,9,1,'#8d6340');R(40,29,9,1,'#8d6340');
      R(28,20,9,9,'#b0402c');const s='#f1d9c8';
      R(29,21,1,1,s);R(29,23,1,1,s);R(29,26,1,2,s);R(31,21,5,1,s);R(33,22,1,2,s);R(31,24,5,1,s);R(31,25,1,3,s);R(33,25,1,3,s);R(35,25,1,3,s);
    },
    // 결정 D-830: 감 따는 장대 (D-730을 고침). 긴 단소처럼 곧고 마디 진 대막대를 두 손으로 쥐고 들어 올려 아래 가지를 톡 친다.
    //   가지가 떨리며 감 하나가 멍석 위로 떨어진다 (2.4초마다 되풀이). 꼭대기 네 알(까치밥)은 장대가 닿지 않는 오른쪽 위에 그대로다.
    gamPole(w,h,t){
      const bark='#5b3d2a';
      R(0,0,w,h,'#e9dcc0');R(0,40,w,4,'#c9b48c');
      R(3,38,34,2,'#cfa95e');for(let x=5;x<37;x+=3)R(x,38,1,2,'#a9843f');   // 나무 밑에 편 멍석
      const gam=(x,y)=>{R(x,y,5,5,'#e8792b');R(x+1,y+4,3,1,'#c95a1d');R(x+1,y+1,1,1,'#f6b46a');R(x+1,y-1,3,1,'#4f6b2c');};
      const c=Vfx.reducedMotion?.4:(t%2.4)/2.4,ease=k=>k*k*(3-2*k);
      const hit=c<.35?ease(c/.35):c<.42?1:1-ease((c-.42)/.58);          // 0 내린 자리 → 1 가지를 친 자리
      const shake=c>=.35&&c<.45&&!Vfx.reducedMotion?((Math.floor(t*20)%2)?1:-1):0;
      // 잎 진 감나무 가지 (아래 잔가지가 맞으면 떨린다)
      R(0,6,40,2,bark);R(14,4,12,2,bark);R(26+shake,8,2,9,bark);R(38,4,2,5,bark);R(40,3,16,2,bark);
      gam(11,7);gam(44,5);gam(52,5);R(18,8,4,2,'#b2492a');   // 꼭대기 쪽 감은 까치밥, 한 잎만 남았다
      gam(9,33);gam(16,34);                                   // 먼저 떨군 감이 멍석 위에
      if(c<.38)gam(25+shake,17);else{const f=Math.min(1,(c-.38)/.24);gam(Math.round(25-4*f),Math.round(17+16*f*f));}   // 맞은 잔가지의 감이 툭
      if(c>=.35&&c<.45){R(31,9,2,1,'#fff7e6');R(32,13,2,1,'#fff7e6');R(23,10,1,2,'#fff7e6');}                     // 톡 치는 순간
      // 장대: 오른쪽 아래 두 손에서 가지까지 곧게. 대 마디가 9칸마다 진하다
      const bx=60,by=44,tx=40+(28-40)*hit,ty=22+(12-22)*hit,N=46;
      for(let i=0;i<=N;i++){const s=i/N,x=Math.round(tx+(bx-tx)*s),y=Math.round(ty+(by-ty)*s),node=i%9===4;R(x,y,2,2,node?'#7f6636':'#a98a4e');R(x,y,1,1,node?'#7f6636':'#cdb27a');}
      // 장대를 쥔 너구리 두 손 (검은 팔이 화면 밖 오른쪽으로 이어진다)
      for(const s of [.78,.92]){const x=Math.round(tx+(bx-tx)*s),y=Math.round(ty+(by-ty)*s);R(x+2,y+2,w-x,3,'#2f241d');R(x-1,y-1,4,4,'#4a3426');R(x,y-1,2,1,'#8a6a4e');}
    },
  };
  // 결정 D-483: 대사 그림이 뜰 때의 소리 (design/data/popup_sounds.csv 의 pic_이름)
  for(const k of Object.keys(scenePic))scenePic[k].sound='pic_'+k.replace(/[A-Z]/g,c=>'_'+c.toLowerCase());
  function magpieTalk(){
    talk([['늙은 까치','에구, 이 바람아. 아가, 이 끝 좀 눌러 다오.\n발이 예전 같지 않아서 매듭이 자꾸 도망가는구나.'],
      ['너구리','제가 잡을게요. …이거 약보자기예요?'],
      ['늙은 까치','그래. 늪가 두꺼비 할멈이 달인 약을 아픈 집마다 나르지.\n개울 아래 초가, 네 집 문턱도 내가 안단다.',[
        {t:'두 손으로 보자기를 눌러 드린다',go:()=>hands(()=>talk([
          withPic(['너구리','(두 손으로 보자기 귀를 꾹 누른다.)'],scenePic.bojagi),   // 결정 D-152
          ['늙은 까치','옳지. 손이 따뜻하구나.\n…예전엔 이걸 한 발로도 묶었는데.'],
          // 결정 D-129: 아빠의 마지막 편지도 이 까치가 날랐다. 할멈은 이 까치에게 엄마 소식을 들었다.
          withPic(['너구리','우리 집 문턱을 아시면…\n아빠 편지도 갖다주셨어요?'],null),   // 결정 D-984: 까치에게는 부르는 말 없이 (D-218)
          ['늙은 까치','그래. 돌너머 까치가 넘겨 준 걸 받아 날랐지.\n네 아빠 얼굴은 나도 못 봤구나.'],
          ['늙은 까치','길 떠나는 게지? 길 따라 소식 나르는 게 내 일이니\n길에서 또 만나면 집 소식을 전해 주마.'],
          ['너구리','그럼 엄마한테도…\n나 잘 있으니까 걱정 마시라고 전해 주세요.']
        ],()=>{
          diary('galExpMagpie','늙은 까치의 약보자기를 두 손으로 눌러 드렸다. 아빠의 마지막 편지도 이 까치가 날라 왔다. 까치는 길 따라 소식을 나른다고 했다. 엄마한테 나는 잘 있으니 걱정 마시라고 전해 달라고 했다.');
          finishWanderer('old_magpie');
          // 결정 D-33: 까치 이동을 말할 때 젊은 까치 둘이 곁에 내려앉고, 그 뒤로 늙은 까치 곁에 머문다 (design/data/decisions.csv)
          // 결정 D-526: 한 대화로 잇는다 (예전엔 대화가 세 번 끊겼다가 이어졌다)
          G.f.galMagpieYoung=true;
          talk([['늙은 까치','참, 아가. 길이 멀어 발이 아프거든 하늘을 보고 불러라.'],
              ['너구리','(까치 어르신이 짧게 울자, 덩치 큰 까치 둘이\n지붕에서 내려앉았다.)'],   // 결정 D-835: 어른은 이름만으로 부르지 않는다
              ['늙은 까치','우리 집 젊은 것들이다. 네 귀 한쪽씩 잡고\n가 본 길이면 어디든 데려다줄 게다.'],
              ['너구리','…귀요?']
            ],()=>{G.f.mapUnlocked=true;think('지도를 펴면 젊은 까치 둘을 부를 수 있겠다.');});
        }))},{t:'바람이 잦아들면 도와드릴게요',go:null}]]]);
  }
  function brothersTalk(){
    G.f.galSquirrelSeen=true;   // 결정 D-129: 다람쥐를 봤다 (무쇠의 잎사귀 변신은 본 것만 된다)
    const sorted=G.f.galExpBrothersSorted;
    if(G.f.galExpBrothersAsked&&sorted){
      // 결정 D-34: 고르게 나누기 / 형 편 / 동생 편. 덤만 다르고 붉은 옹이 길 안내는 같다 (design/data/decisions.csv)
      const side=G.f.galExpBrothersSide||'even';
      // 결정 D-286: 나눠 준 값은 한 번만, 받은 줄과 함께. 고르게 나눈 판은 형제가 한 알씩 내어 두 알(예전엔 편든 판보다 적은 한 알이었다).
      const gift=({even:['acorn',2],hyung:['acorn',2],dongsaeng:['ssari',1]})[side];
      const got=G.f.galExpBrothersPaid?[]:[receiveItem(...gift)];G.f.galExpBrothersPaid=true;
      const lines={
        even:[['다람쥐 형','큰 것부터 번갈아 놓으니 양쪽이 비슷하네.'],['다람쥐 동생','내 몫이 적다고만 생각했는데!'],
          ['다람쥐 형','그럼 묻는 건 같이 하자.\n나는 자리를 외워 둘게.'],['다람쥐 동생','난 덮어 둔 낙엽 모양을 외워 둘래!'],
          ['다람쥐 형','고르게 나눠 줬으니까 우리 둘이 한 알씩!'],...got,
          ['다람쥐 형','높은 가지에 붉은 옹이가 있어.\n그 아래 굵은 가지를 디뎌 봐.'],['다람쥐 동생','거기 우리 말고 누가 남긴 자국이 있더라!']],
        hyung:[['다람쥐 형','봐, 내 말이 맞지! 큰 건 내 몫이야.'],['다람쥐 동생','…치.'],
          ['다람쥐 형','내 편 들어 줬으니 큰 도토리 두 알 줄게.'],...got,
          ['다람쥐 형','그리고 높은 가지에 붉은 옹이가 있어.\n그 아래 굵은 가지를 디뎌 봐.'],['다람쥐 동생','…거기 누가 남긴 자국도 있어. 형은 모르지?']],
        dongsaeng:[['다람쥐 동생','거봐! 찾은 건 나라니까.'],['다람쥐 형','…쳇.'],
          ['다람쥐 동생','내 편 들어 줬으니까 이거 줄게.\n낙엽 밑에서 찾은 싸리버섯이야.'],...got,
          ['다람쥐 동생','높은 가지에 붉은 옹이가 있어.\n거기 우리 말고 누가 남긴 자국이 있더라!'],['다람쥐 형','…그 아래 굵은 가지를 디디면 돼.']]
      };
      const notes={
        even:'다람쥐 형제와 도토리를 큰 것부터 번갈아 나눴다. 겨울에는 같은 바구니에서 먹기로 했다. 형제가 숲 높은 가지의 붉은 옹이를 알려 주었다.',
        hyung:'다람쥐 형제 다툼에서 일곱 번 오간 형 편을 들었다. 형이 큰 도토리 두 알을 주었고 동생은 토라졌다. 숲 높은 가지의 붉은 옹이를 들었다.',
        dongsaeng:'다람쥐 형제 다툼에서 낙엽을 걷어 찾은 동생 편을 들었다. 동생이 싸리버섯을 주었고 형은 토라졌다. 숲 높은 가지의 붉은 옹이를 들었다.'
      };
      talk(lines[side],()=>{
        diary('galExpBrothers',notes[side]);
        finishWanderer('squirrel_brothers');
      });return;
    }
    if(G.f.galExpBrothersAsked){
      talk([['다람쥐 동생','우린 아직 큰 도토리를 서로 세고 있어.'],['다람쥐 형','오른쪽 낮은 평상에서 같이 나눠 주기로 했잖아!']],shareBaskets);return;
    }
    // 결정 D-529: 형제 대화의 말을 바로잡았다 (사용자 피드백 2026-11-04: "겨울 먹을 거야?" → "겨울에 먹을 거야?")
    talk([['다람쥐 형','내가 일곱 번을 오갔으니 큰 도토리는 내 몫이지.'],['다람쥐 동생','내가 낙엽을 걷어 찾았잖아!'],
      ['너구리','겨울에 먹을 거야?\n큰 건 다 한쪽 바구니에만 있네.'],
      ['다람쥐 형','큰 건 몇 알 안 되는데, 둘 다 욕심이 나서.'],['다람쥐 동생','형은 큰 걸 자기가 다 묻겠대!\n도담처럼 묻어 놓고 잊으면 어쩌려고.'],
      ['다람쥐 형','오른쪽 낮은 평상으로 바구니를 옮겨 둘게.\n어떻게 나누면 좋을지 같이 봐 줄래?',[
        {t:'좋아, 같이 봐 줄게',go:()=>{G.f.galExpBrothersAsked=true;think('오른쪽 낮은 평상에서 바구니를 나누자.');}},
        {t:'다음에 같이 보자',go:null}]]]);
  }
  /* 결정 D-117: 다람쥐 형제 후일담. 누구 편을 들었는지(galExpBrothersSide)가 그 뒤의 관계를 바꾼다.
     ① 바구니 자리 다툼, 또는 편을 들어 준 일로 토라짐 → ② 칡이 풀린 숲 안쪽에 묻을 자리를 그려 줌 → ③ 떠나는 날 도토리 두 알 */
  function brosArcChoice(){
    const F=G.f;if(!Rg.arcsEnabled()||!done('squirrel_brothers'))return null;
    const side=F.galExpBrothersSide||'even';
    // 결정 D-526: 바구니 다툼 장면(galArcBros1)은 뺐다. 칡이 풀린 뒤 묻을 자리를 그려 주며 화해까지 한 번에 맺는다.
    if(!F.galArcBros2&&G.boss.dead)return {t:'숲 안쪽 이야기를 듣는다',go:brosMap};
    if(F.galArcBros2&&!F.galArcBros3&&G.diary.some(d=>d.id==='end'))return {t:'북쪽으로 간다고 인사한다',go:brosFarewell};
    return null;
  }
  function brosMap(){
    const side=G.f.galExpBrothersSide||'even';
    const split={
      even:[['다람쥐 동생','형 자리는 내가 외울게.'],['다람쥐 형','네 자리는 내가.']],
      hyung:[['다람쥐 형','…뿌리 쪽은 네가 찾은 데니까 네 거 해.'],['다람쥐 동생','진짜? …그럼 바위 쪽은 형 거.']],
      dongsaeng:[['다람쥐 동생','…바위 쪽은 형이 여러 번 날라야 하니까\n형 거 해.'],['다람쥐 형','…그래. 그럼 뿌리 쪽은 네 거.']]
    }[side];
    arcScene('galArcBros2',[['다람쥐 형','당산나무 칡이 풀리니까\n숲 안쪽 흙이 부드러워졌어! 거기 묻을 거야.'],
      ['너구리',G.f.galArcDodam2?'자리 그려 줄까? 도담한테도 그려 줬어.':'자리 그려 줄까? 그려 두면 안 잊어.'],
      ['너구리','(나뭇가지로 넓은 껍질에 두 자리를 그렸다.\n큰 바위 밑 하나, 단풍나무 뿌리 하나.)'],
      ...split,
      // 결정 D-286: 자리를 그려 준 값. 부드러워진 흙을 파 보다 뿌리 곁에서 딴 꾀꼬리버섯
      ['다람쥐 형','그려 준 값! 흙 파 보다가 뿌리 옆에서 땄어.'],gotLine('kkoe',1)],
      '칡이 풀리자 숲 안쪽 흙이 부드러워졌다. 다람쥐 형제에게 묻을 자리 둘을 나무껍질에 그려 주었다. 둘이 같이 보는 껍질이 되었다.');
  }
  function brosFarewell(){
    arcScene('galArcBros3',[['너구리','나 내일 북쪽으로 가.'],['다람쥐 형','잠깐만 기다려!'],
      ['너구리','(형제가 낙엽 더미에 머리를 박고 한참 뒤적인다.)'],
      ['다람쥐 형','큰 거 하나, 내가 골랐어.'],['다람쥐 동생','작은 거 하나, 내가 골랐어!'],
      gotLine('acorn_gift',2),   // 결정 D-137: 형제의 도토리는 사연 아이템(교환·가공 불가)
      ['너구리','집에 돌아가면 엄마랑 나눠 먹을게.'],
      ['다람쥐 동생','그럼 큰 건 엄마 드려!\n…형이 고른 거니까.']],
      '북쪽으로 간다고 하자 다람쥐 형제가 도토리를 하나씩 골라 주었다. 큰 것 하나, 작은 것 하나. 집에 돌아가면 엄마랑 나눠 먹을 것이다.');
  }
  function shareBaskets(){
    if(!G.f.galExpBrothersAsked){brothersTalk();return;}
    if(G.f.galExpBrothersSorted){brothersTalk();return;}
    const pick=side=>{G.f.galExpBrothersSorted=true;G.f.galExpBrothersSide=side;brothersTalk();};
    talk([['다람쥐 형','바구니 두 개 다 가져왔어.\n어떻게 나눌래?',[
      {t:'큰 것부터 번갈아 고르게 나눈다',go:()=>hands(()=>pick('even'))},
      {t:'형 편을 든다: "일곱 번 오갔으니 큰 건 형 몫이야"',go:()=>pick('hyung')},
      {t:'동생 편을 든다: "낙엽을 걷어 찾았으니 동생 몫이야"',go:()=>pick('dongsaeng')},
      {t:'조금 더 생각해 볼게',go:null}]]]);
  }
  function chickTalk(){
    if(G.f.galExpChickWith&&G.f.galExpChickX>=2090){
      talk([['꺼병이','저기 갈대가 흔들려! 엄마 꼬리야!\n아까는 내 발소리에 묻혀서 못 들었나 봐.'],
        ['너구리','이제 뛰어가도 돼.\n난 여기서 보고 있을게.'],
        ['꺼병이','엄마! 나 여기 있어!\n…아, 도토리 얘기는 엄마한테 비밀이야.'],
        // 결정 D-217: 꺼병이는 쫓아오던 도토리를 엄마 앞에 들고 갈 수 없어 아이에게 준다 (사용자 피드백 40: 작은 보상)
        ['꺼병이','이거 너 가져.\n엄마가 보면 또 쫓아갔냐고 할 거야.'],
        ['너구리','(꺼병이가 품고 온 도토리 두 알을\n내 발치에 굴려 놓았다.)'],
        ...(done('lost_chick')?[]:[receiveItem('acorn',2)]),
        // 결정 D-287: 아이는 이 마을 아이라 약방 길을 안다. 꺼병이가 길을 일러 주던 말은 지웠다.
        ['꺼병이','고마워, 사뿐발 보부상!\n발소리 작게 걸어 줘서 엄마 소리가 들렸어.']
      ],()=>{
        diary('galExpChick','도토리를 따라오다 길을 잃은 꺼병이와 물가까지 걸었다. 갈대 너머 어미의 대답을 듣고 제 길을 찾았다. 쫓아오던 도토리 두 알은 엄마한테 비밀이라며 나를 주었다. 내 발소리도 작아졌다.');
        if(typeof grantNickname==='function')grantNickname('gal_quiet_steps','사뿐발 보부상','꺼병이');
        finishWanderer('lost_chick');
      });return;
    }
    if(G.f.galExpChickWith){talk([['꺼병이','물가의 갈대까지 천천히 가자.\n네가 너무 앞서가면 난 여기서 기다릴게.']]);return;}
    talk([['꺼병이','엄마가 둥지 곁에만 있으랬는데,\n도토리가 굴러가서… 나무가 다 똑같아.'],
      ['너구리','어디서 만나기로 했어?\n엄마가 뭐라고 했는데?'],
      ['꺼병이','해 지면 물가의 갈대 아래. 울음으로 부르랬어.\n근데 내 발소리가 너무 커서 대답이 안 들려.'],
      ['너구리','같이 천천히 걷자.\n네가 멈추면 나도 멈출게.',[
        {t:'꺼병이 곁에서 물가 쪽으로 걷는다',go:()=>{G.f.galExpChickWith=true;G.f.galExpChickX=1540;think('오른쪽 갈대까지 같이 걷자. 너무 앞서면 꺼병이가 멈춘다.');}},
        {t:'여기서 기다려. 길부터 살필게',go:null}]]]);
  }
  /* 결정 D-117: 새 떠돌이 둘. 아이가 날라 주는 것으로 관계가 생긴다.
     여울(개울의 어린 수달): 물이 불어 떠내려간 함지박을 밤마다 넓적돌까지 도로 밀어 올려 둔다. 그 함지박 밑에 우리 집 낙관(流)이 있다.
     검댕(참나무 숲 숯쟁이 오소리): 연기에 눈이 절었다. 할멈의 눈약 ↔ 검댕의 숯을 아이가 오가며 나르고, 날쌘의 숨은 덤을 듣는다. */
  function otterTalk(){
    const F=G.f;
    if(!F.galArcOtter1){
      // 결정 D-152: 함지박이 무엇인지 그림으로 보인다. 함지박 이야기가 이어지는 동안 띄워 둔다.
      arcScene('galArcOtter1',[withPic(['너구리','(수달 하나가 빈 함지박을 머리에 이고\n개울을 거슬러 오른다.)'],scenePic.hamjibak),
        // 결정 D-287: 누가 함지박을 올려놓는지 한 가지로 (예전엔 '아이가 올려놔야지'와 '밤마다 내가 밀어 올린다'가 함께 나왔다)
        // 결정 D-414: 함지박 타기(순간이동)를 뺐다. 여울이 함지박을 이고 오르는 까닭은 물이 불면 떠내려가서다.
        ['너구리','그거 어디까지 가져가?'],
        ['여울','저기 넓적돌까지! 물이 불면 자꾸 떠내려가.\n그래서 밤마다 내가 도로 올려놔.'],
        withPic(['여울','빨래 아줌마 거야. 넓적돌에서 방망이 두드리던 아줌마.\n작년 여름부터 안 와.'],null),
        ['여울','그래도 내가 지켜.\n아줌마 오면 바로 써야 하니까.']],
        '개울에서 빈 함지박을 이고 오르는 수달 여울을 만났다. 물이 불어 떠내려가면 밤마다 넓적돌까지 도로 올려 둔다고 한다. 작년 여름부터 안 오는 빨래 아줌마 것이라, 그분이 오면 써야 한다며.');
      return;
    }
    if(!F.galArcOtter2){
      // 결정 D-129·D-414: 고인 물을 빼려고 함지박을 같이 뒤집다가 낙관을 본다. 대장간에 다녀온 뒤(삼촌을 만난 뒤) 다시 들르면 열린다.
      if(!F.musoeMet){talk([['여울','빨래 아줌마 아직 안 왔어.']]);return;}
      // 결정 D-526: 낙관을 본 장면 끝에 물수제비를 바로 잇는다 (예전엔 낫을 받은 뒤 다시 와야 열렸다)
      arcScene('galArcOtter2',[['여울','이거 속에 물이 고였어. 같이 뒤집어 줄래?'],
        withPic(['너구리','(함지박을 같이 뒤집어 물을 빼는데, 밑바닥에\n낙관 하나가 찍혀 있다. 流.)'],scenePic.hamjibakStamp),   // 결정 D-152
        ['너구리','…이거 우리 집 거야.'],
        withPic(['여울','어? 너 빨래 아줌마네 애야?\n아줌마 왜 안 와? 나 계속 기다렸는데.'],null),
        ['너구리','엄마가 아파. 작년 여름부터.'],
        ['여울','…아줌마는 빨래 다 하면 물수제비 떠 줬어.\n일곱 번! 나보다 잘해.'],
        ['너구리','(엄마가 물가에서 웃는 걸 본 지 오래됐다.)']],
        '함지박 밑바닥에 우리 집 낙관 流가 찍혀 있었다. 여울이 말하는 빨래 아줌마는 엄마였다. 엄마는 빨래를 마치면 여울에게 물수제비를 일곱 번 떠 줬다고 한다. 나는 몰랐다.',
        ()=>{learn('otter:stone');otterStone();});
      return;
    }
    if(!F.galArcOtter2b){otterStone();return;}   // 옛 저장: 낙관 장면 뒤 물수제비를 아직 안 떴다
    if(!F.galArcOtter3&&G.diary.some(d=>d.id==='end')){
      arcScene('galArcOtter3',[['여울','늙은 까치가 그러는데, 아줌마한테 약 갔대!\n그럼 아줌마 이제 와?'],
        ['너구리','…아직. 북쪽 가서 더 좋은 약 구해 올 거야.\n봄에 엄마랑 같이 빨래하러 올게.'],
        ['여울','약속! 그때 나랑 물수제비 내기해. 아줌마 빼고.'],
        ['너구리','왜 엄마는 빼?'],
        ['여울','아줌마는 일곱 번이잖아. 반칙이야.']],
        '약이 갔다는 소식을 여울도 까치에게 들었다. 봄에 엄마랑 빨래하러 오겠다고 약속했다. 그때 물수제비 내기를 하자며, 엄마는 일곱 번이라 반칙이니 빼자고 했다.',
        ()=>finishWanderer('stream_otter'));
      return;
    }
    talk([['여울',F.galArcOtter2?'함지박 잘 지키고 있어!\n아줌마 오면 바로 써야 하니까.':'빨래 아줌마 아직 안 왔어.']]);
  }
  // 선택지를 고르면 대화의 끝 콜백이 지워지므로, 던진 뒤의 대사를 사연 장면으로 선택지에서 잇는다 (결정 D-350: 장면은 끝까지 들어야 기록)
  function otterStone(){
    if(!arcOpen('galArcOtter2b'))return;
    const thrown=[['너구리','(돌이 통, 통, 통 하고 가라앉았다.)'],
      ['여울','세 번? 빨래 아줌마 아들이면서?'],
      ['너구리','오, 오늘은 손이 좀 차서 그래.\n…사실 엄마한테 안 배웠어.'],
      ['여울','그럼 봄에 배워.\n아줌마가 손목을 이렇게 꺾으라 그랬어.'],
      ['너구리','(여울이 손목을 꺾어 보인다.\n엄마 손목도 저렇게 움직였을까.)']];
    talk([['너구리','(여울이 납작한 돌을 골라 물 위로 던진다.\n통, 통, 통, 통.)'],
      ['여울','네 번! 너도 해 봐.',[{t:'납작한 돌을 골라 던진다',go:()=>arcScene('galArcOtter2b',thrown,
        '여울과 물수제비를 떴다. 나는 세 번, 여울은 네 번이었다. 엄마는 일곱 번이라고 했다.')}]]]);
  }
  function badgerTalk(){
    const F=G.f;
    if(!F.galArcGeom1){
      // 결정 D-530: 약방이 없으니 아이는 해머루를 들고 할멈을 만날 때 눈약을 여쭙기로 한다. 숯 심부름 왕복은 뺐다.
      arcScene('galArcGeom1',[['검댕','콜록… 거기 너. 눈 좀 빌리자.\n저 연기가 희냐, 푸르냐.'],
        ['너구리','…하얘요. 뭉게뭉게.'],
        ['검댕','아직이군. 푸르스름해지면 다 된 숯이다.\n연기에 눈이 절어서 이젠 빛이 다 뿌옇다.'],
        // 결정 D-985: 아이는 프롤로그에서 '약방 두꺼비 할멈'만 들었다. 늪가는 검댕이 알려 준다. 할머니를 이미 만났으면 언덕 어귀를 안다.
        ['너구리','약방 두꺼비 할머니한테\n눈약이 있을 거예요.'],
        ['검댕','약방은 늪 건너다.\n가마 불은 사흘 내내 지켜야 하고.'],
        hintLine('beoseot_jjim',['검댕','끼니도 가마 곁에서 때운다.\n싸리버섯 꾀꼬리버섯에 깨소금 쳐서 쪄 먹지.']),   // 결정 D-461: 귀띔
        ['너구리',F.toadMet?'할머니는 당산나무 언덕 어귀에 계세요.\n가는 길에 눈약도 여쭤볼게요.':'해머루 따면 할머니께 갈 거예요.\n그때 눈약도 여쭤볼게요.'],
        ['검댕','…보부상이면 공짜로는 안 하겠군.\n값은 숯으로 치마.']],
        '참나무 숲에서 숯 굽는 오소리 검댕을 만났다. 연기에 눈이 절어 연기 빛을 못 본다. 흰 연기는 아직, 푸른 연기면 다 된 숯이라고. 해머루를 들고 할머니를 만나면 눈약을 여쭤보기로 했다.');
      return;
    }
    if(F.galGeomEyeWash&&arcOpen('galArcGeom5')){
      arcScene('galArcGeom5',[['너구리','할머니 눈약이에요.\n아침저녁으로 씻으래요.'],
        ['너구리','(검댕 아저씨가 눈을 씻고 한참 가마 쪽을 본다.)'],   // 결정 D-835
        ['검댕','…푸르구나. 저 연기, 푸르다.\n사흘 만에 처음 제대로 봤다.'],
        ['검댕','이 숯은 날쌘이 받아 갈 거다. 그놈, 값 깎는 척\n실컷 하고는 가마 옆에 꼭 덤을 두고 가지.'],
        ['검댕','모른 척하라더라. 체면 깎인다고.'],
        ['너구리','…저도 모른 척할게요.'],
        // 결정 D-289: 눈약을 날라 준 값은 눈을 뜬 그 자리에서 준다
        ['검댕','눈약 값이다. 연기 안 매운 숯 하나.\n할멈 몫 한 자루는 내가 지고 가마.'],gotLine('coal',1)],
        '검댕 아저씨가 할머니 눈약으로 눈을 씻고, 가마 연기가 푸른 걸 처음으로 제대로 봤다. 날쌘 아저씨는 값을 깎는 척하고는 가마 옆에 꼭 덤을 두고 간다고 한다. 모른 척하기로 했다. 눈약 값이라며 연기가 안 매운 숯을 하나 주었다.',
        ()=>{F.galGeomBlue=true;learn('geom:nal');finishWanderer('charcoal_badger');});
      return;
    }
    if(F.galArcGeom5&&!done('charcoal_badger'))finishWanderer('charcoal_badger');   // 옛 저장: 떠나는 인사 장면(galArcGeom6)에서 끝내던 만남
    talk([['검댕',F.galArcGeom5?'푸르다. 이제 잘 보인다.\n…심부름 값은 했다.':F.galArcGeom1?'콜록… 연기가 아직 희구나.\n할멈은 만났냐.':'콜록… 연기가 아직 희구나.']]);
  }
  /* 할멈 쪽 고리: 검댕의 눈 이야기를 들으면 언덕의 약탕관 곁에서 결명자 물을 달여 준다 (결정 D-530). */
  function toadGeom(){
    const F=G.f;
    const brew=[['너구리','(할머니가 약 보따리에서 결명자를 꺼내\n작은 약탕에 따로 달인다.)'],
      ['두꺼비 할멈','식혀서 아침저녁으로 눈을 씻으라고 하렴.\n숯쟁이 눈 씻길 물을 숯불에 달였으니, 숯 한 자루 빚진 셈이다.']];
    const give=()=>{F.galGeomEyeWash=true;F.galGeomToadCoal=false;};
    if(F.galArcGeom2){talk(brew,give);return;}   // 옛 저장: 숯을 기다리던 판
    arcScene('galArcGeom2',[['너구리','숲에서 숯 굽는 검댕 아저씨요.\n연기에 눈이 절어서 뿌옇대요.'],
      ['두꺼비 할멈','검댕이로구나.\n그 눈으로 아직도 가마를 지키는구나.'],...brew],
      '할머니가 검댕 아저씨 눈 씻을 결명자 물을 달여 주었다. 숯불에 달였으니 숯 한 자루 빚진 셈이라고 했다.',give);
  }
  function toadGeomChoice(){
    const F=G.f;
    if(!Rg.arcsEnabled()||!F.galArcGeom1||F.galGeomEyeWash||F.galArcGeom5)return null;
    return {t:'검댕 아저씨 눈약을 여쭙는다',go:toadGeom};
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
    get greeting(){return G.f.galGamDone?'꼭대기 네 알이면 올겨울은 넉넉하다.\n네 어미 소식은 내가 날라 주마.':G.tool==='sickle'?'그게 네 아비 낫이구나.\n무쇠가 날을 잘 세웠네.':'날개 좀 말리고 가련다.\n올해는 저 감나무에 아무도 장대를 안 대는구나.';}};
  const hubMagpie={id:magpie.id,name:magpie.name,x:480,draw:magpie.draw,talk:magpie.talk};
  Object.defineProperty(hubMagpie,'greeting',{get:()=>magpie.greeting});
  // 결정 D-730: 만난 뒤로 까치는 집 옆 감나무 낮은 가지에 앉아 있다 (예전엔 물레방아 곁). 젊은 까치 둘은 나무 밑에 내려앉는다.
  const GAM_X=300;
  const gamMagpie={id:magpie.id,name:magpie.name,x:GAM_X+18,y:GROUND-46,talk:magpie.talk,
    draw:(x,y,f)=>{Rg.expArt.magpie(x,y,f);if(G.f.galMagpieYoung){Rg.expArt.youngMagpie(x+34,GROUND,-1);Rg.expArt.youngMagpie(x+72,GROUND,-1);}}};
  Object.defineProperty(gamMagpie,'greeting',{get:()=>magpie.greeting});
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
  /* 결정 D-730: 물레방아 고치기를 뺐다 (사용자 피드백 2026-11-05 단풍골 1). 대신 집 옆 감나무의 까치밥 이야기를 둔다.
     엄마는 해마다 감을 따며 꼭대기 몇 알을 까치밥으로 남겼다. 늙은 까치 식구는 그 감으로 겨울을 났고, 그래서 이 집 문턱을 알고 약과 소식을 나른다
     (첫 만남의 "네 집 문턱도 내가 안단다"가 여기서 풀린다). 올해는 엄마가 앓아 아무도 장대를 못 댔다.
     아이가 장대로 아래 감을 따고 꼭대기 네 알은 남긴다. 홍시는 엄마 방 문턱 안에, 단단한 감은 처마 밑 바구니에 둔다.
     값은 까치가 지붕 틈에 묻어 둔 도토리 2 (까치는 먹이를 숨겨 둔다). 칡이 풀린 뒤 다시 오면, 엄마를 들여다보던 삼촌이 감을 깎아 처마에 매달아 두었다. */
  function gamStage(){return G.f.galGamDone?2:done('old_magpie')?1:0;}
  function gamTalk(){
    const F=G.f,stage=gamStage();
    if(stage===0){
      talk([['너구리','(홍시가 툭 떨어져 터졌다.\n올해는 엄마가 장대를 못 들었지.)']]);return;
    }
    if(stage===2){
      talk([['너구리',G.boss.dead&&F.musoeAfterLeaf?'(처마 밑에 깎은 감이 줄줄이 매달렸다.\n엄마를 들여다보러 온 삼촌이 깎아 달았나 보다.)':'(꼭대기 네 알이 그대로 매달려 있다.\n까치가 한 알을 쪼다 말고 나를 본다.)']]);return;
    }
    talk([['너구리','(감이 익다 못해 툭툭 떨어진다.\n까치 어르신이 터진 홍시를 쪼고 있다.)'],   // 결정 D-835
      ['늙은 까치','올해는 아무도 장대를 안 대는구나.\n떨어진 것만 이리 아깝게 터지고.'],
      ['너구리','엄마가 해마다 따던 감이에요.\n올해는 엄마가 못 일어나서요.'],
      ['늙은 까치','알지. 이 집은 해마다 꼭대기 몇 알을 남겼다.\n눈 오는 날 우리 식구가 그걸로 겨울을 났지.'],
      ['너구리','엄마가 그걸 까치밥이라고 했어요.\n그래서 우리 집 문턱을 아셨구나.'],
      ['늙은 까치','그래. 받은 게 있으니\n약도 소식도 날라 주는 게지.'],
      ['너구리','제가 딸게요. 장대는 처마 밑에 있어요.\n꼭대기는 엄마처럼 남겨 둘게요.',[
        // 결정 D-830: 장대는 긴 단소처럼 곧은 대막대다. 가지를 쳐서 감을 떨군다 (사용자 피드백 2026-11-06 단풍골 3: 집게처럼 꺾지 않는다).
        //   홍시가 터지지 않게 엄마가 하던 대로 나무 밑에 멍석부터 편다 (까치를 만나기 전 떨어진 홍시는 맨땅에서 터졌다).
        {t:'장대로 아래 가지를 친다',go:()=>hands(()=>talk([
            ['너구리','(엄마가 하던 대로 나무 밑에 멍석부터 폈다.\n맨땅에 떨어지면 홍시가 터지니까.)'],
            withPic(['너구리','(긴 장대로 아래 가지를 톡톡 쳤다.\n감이 멍석 위로 툭, 툭 떨어진다.)'],scenePic.gamPole),
            ['너구리','(아래 가지 감은 다 떨궜다.\n꼭대기 네 알은 장대가 닿지 않게 그대로 두었다.)'],
            withPic(['늙은 까치','네 어미 손이랑 똑같이 남기는구나.'],null),
            ['너구리','(말랑한 홍시 둘은 엄마 방 문턱 안에 들여놓고,\n단단한 감은 처마 밑 바구니에 담았다.)'],
            ['늙은 까치','꼭대기를 남겨 줬으니 올겨울 걱정은 덜었다.\n지붕 틈에 묻어 둔 도토리를 좀 내주마.'],receiveItem('acorn',2),
            ['늙은 까치','네 어미 버릇을 네가 이었구나.\n까치밥 보부상이라 불러야겠다.']
          ],()=>{
            F.galGamDone=true;
            if(typeof grantNickname==='function')grantNickname('gal_kkachibap','까치밥 보부상','늙은 까치');
            diary('galGamDone','엄마 대신 집 감나무의 감을 땄다. 엄마가 해마다 남기던 꼭대기 네 알은 까치밥으로 두었다. 늙은 까치 식구는 그 감으로 겨울을 나서 우리 집 문턱을 안다고 했다. 까치가 묻어 둔 도토리를 주었다.');
          }))},
        {t:'다음에 딴다',go:null}]]]);
  }
  // 평상 자리는 형제의 도토리 나누기만 맡는다 (굴대 들기는 물레방아와 함께 뺐다, D-730).
  function basketsTalk(){
    if(!G.f.galExpBrothersSorted){shareBaskets();return;}
    if(!done('squirrel_brothers')){brothersTalk();return;}
    talk([['다람쥐 형','바구니는 이제 우리끼리 나눌 수 있어.'],['다람쥐 동생','겨울엔 한 바구니에서 먹을 거야!']]);
  }
  // 결정 D-624: 두꺼비 할멈의 반딧불 부탁을 뺐다 (사용자 피드백 2026-11-05 단풍골 8). 등롱·반딧불 자리·싸리버섯 답례(D-285)도 함께 뺐다.
  Rg.expWanderers={village:[magpie,otter],forge:[brothers],forest:[chick,badger],hill:[]};
  function examine(id,x,label,read,y,pic){
    return {id,x,label,...(y===undefined?{}:{y}),...(pic?{pic}:{}),get text(){return read();}};
  }
  /* 결정 D-989: 살펴보기 작은 창이 필드를 잘라 보이면 말과 맞지 않는 자리에 장면 그림을 단다 (사용자 피드백 2026-11-06 34, 엔진 PA-229의 pic).
     누운 풀: 칡이 훑고 간 언덕 들머리 풀이 한쪽으로 다 누웠고, 끌린 자국이 언덕 위로 이어진다.
     갈대 너머: 갈대 사이로 어미 꿩의 긴 꼬리와 머리가 비치고, 짧게 우는 입김이 오른다.
     북쪽 길 팻말: 언덕 끝 갈림길 팻말. 오른쪽 위로 '돌너머' 길이 산 너머로 이어진다. */
  const examPic={
    hillGrass:{animate:true,draw(w,h,t){
      R(0,0,w,h,'#e3c6a4');R(0,30,w,14,'#9a6a42');R(0,30,w,1,'#7a5232');
      for(let i=0;i<14;i++){const x=2+i*4.5,s=Math.round(Math.sin(t*1.4+i)*1);   // 오른쪽으로 누운 풀
        R(x,28,1,3,'#9c8a4c');R(x+1,27+s,5,1,'#b7a35c');R(x+5,26+s,3,1,'#cdb874');}
      for(let i=0;i<10;i++)R(6+i*5,33+(i%2),4,1,'#6b4a2c');   // 끌린 자국
      R(40,18,22,3,'#5d5a33');R(54,14,8,4,'#5d5a33');R(43,17,4,1,'#2b2919');   // 언덕 위로 사라지는 칡 꼬리
      R(47,12,3,2,'#4f8a35');R(58,10,3,3,'#5f9a3c');
    }},
    reedMother:{animate:true,draw(w,h,t){
      R(0,0,w,h,'#dccbaa');R(0,36,w,8,'#7f8a62');
      const bob=Math.round(Math.sin(t*2)*1);
      R(22,24+bob,20,6,'#ae8a55');R(36,18+bob,6,7,'#a48353');R(41,21+bob,3,1,'#75573a');R(39,20+bob,1,1,'#362b21');   // 어미 꿩 머리와 몸
      R(4,26+bob,20,2,'#8c6c45');R(2,25+bob,6,1,'#a17c4c');   // 긴 꼬리
      if(Math.floor(t*1.5)%2)R(45,15,2,1,'#f4efe4');
      for(let i=0;i<12;i++){const x=2+i*5,hh=14+(i*7)%9,s=Math.round(Math.sin(t*1.2+i*.7));R(x+s,36-hh,1,hh,'#9f955c');R(x-1+s,34-hh,3,4,'#c9bf8e');}   // 앞을 가린 갈대
    }},
    northSign:{draw(w,h){
      R(0,0,w,h,'#e8c9a2');
      for(let x=0;x<w;x+=2){const y=Math.round(18-Math.sin(x*.09)*6);R(x,y,2,h-y,'#b88c74');}   // 먼 산
      R(36,20,24,2,'#9b7a5a');R(40,16,20,2,'#a98a66');R(46,12,14,2,'#b89a76');   // 산 너머로 오르는 길
      R(0,34,w,10,'#8a5f3a');R(0,34,w,1,'#6b4423');
      R(20,14,3,22,'#6b4423');R(10,12,24,7,'#c9a27a');R(10,12,24,1,'#e0c08a');R(31,13,4,5,'#c9a27a');R(34,15,2,1,'#c9a27a');   // 오른쪽을 가리키는 팻말
      for(let i=0;i<5;i++)R(13+i*4,15,2,1,'#5a3d28');   // 새긴 글자
    }},
  };
  Rg.expExamines={
    village:[

      examine('village_well',440,'우물 두레박 살펴보기',()=>G.tool==='sickle'?
        '두레박 줄이 반들반들하다. 엄마 손이 닿던 자리.\n아빠 낫 자루도 꼭 이렇게 닳았네.':'떠나기 전에 물독을 가득 채워 놨다.\n엄마가 물 길으러 나오지 않아도 되게.'),
      // 결정 D-730: 물레방아는 멈춘 채 풍경으로만 남는다. 고치는 일은 없다.
      examine('village_wheel',990,'물레방아 물길 살펴보기',()=>'빠진 살 사이로 물만 흘러간다. 굴대도 갈라졌다.\n이 방아가 멈춘 뒤로 엄마가 절구질을 도맡았지.')],
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
        '개울에서 보던 나무의 금줄이 여기까지 이어졌다.\n안쪽 덩굴을 걷고 금줄 길로 올라가자.':'개울에서 보던 당산나무다. 금줄이 숲 안으로 이어졌다.\n덩굴을 걷을 낫이 있으면 저곳까지 닿겠어.'),
      examine('forest_mother',2020,'갈대 너머 소리 듣기',()=>G.f.galExpChickWith?
        '갈대 뒤에서 꿩이 짧게 대답한다.\n꺼병이도 듣게 발소리를 낮추자.':'갈대가 흔들리더니 꿩 울음이 들렸다.\n작은 발자국이 왔던 쪽을 자꾸 부르네.',undefined,examPic.reedMother)],
    hill:[
      // 결정 D-411: 나무 속 나이테 대신, 칡이 훑고 지나간 들머리 풀
      examine('hill_grass',225,'누운 풀 살펴보기',()=> '풀이 한쪽으로 다 누웠다.\n칡덩굴이 이 언덕을 훑고 지나갔구나.',undefined,examPic.hillGrass),
      examine('hill_cloth',810,'오래된 소원 천 보기',()=> '매듭은 낡았는데 천은 덜 바랬다.\n잎 그늘이 볕을 대신 맞아 줬나 봐.'),
      // 결정 D-623: 해머루는 칡꽃 속에 맺힌다. 나무 꼭대기의 열매 꼭지 이야기를 칡꽃 자리로 바꿨다
      examine('hill_fruit',2310-(Rg.hillShift||0),'칡꽃 자리 올려다보기',()=>G.boss.dead?
        '칡이 풀린 자리에 시든 꽃대만 걸려 있다.\n나무가 한결 숨을 쉬는 것 같다.':'칡꽃 속에 보랏빛 알이 비친다. 해머루다.\n저 칡을 풀어 줘야 꺼낼 수 있겠다.'),
      // 결정 D-410: 북쪽 길은 당산나무 언덕 끝에서 시작한다 (예전엔 약방 끝 팻말). 집 쪽 일기 'start'의 "단풍골 끝에서 시작된다"와 같은 길.
      examine('hill_north',1520,'북쪽 길 팻말 읽기',()=>G.f.galArcToad1||G.diary.some(d=>d.id==='end')?
        '약은 집으로 갔다. 이 길은 북쪽으로 간다.\n다음엔 아빠한테도 집 이야기를 해 줘야지.':'돌너머로 가는 북쪽 길.\n먼저 할머니께 해머루를 드리자.',undefined,examPic.northSign)]
  };
  // 집에서 묶은 보자기를 들고 대장간 거점으로 날아온다. 같은 id라 만남은 한 번만 센다.
  for(const [zone,list] of Object.entries(Rg.expWanderers))if(Rg.zones?.[zone]){
    Object.defineProperty(Rg.zones[zone],'wanderers',{configurable:true,get:()=>
      (zone==='village'&&done('old_magpie')?[gamMagpie,...list.filter(w=>w!==magpie)]:list).filter(w=>!w.when||w.when())});
    Rg.zones[zone].examines=Rg.expExamines[zone];
  }
  // 주연 NPC 목록은 그대로다. 이 객체들은 E로 만지는 작업 자리이며 인물·만남 수에 더하지 않는다.
  const work=(id,x,label,talk,y=GROUND)=>({id:'gal_work_'+id,name:label,x,y,prompt:label,talk,peek:true,
    draw:()=>{}});
  // 결정 D-730: 감나무 자리. 까치를 만나기 전과 감을 딴 뒤에는 올려다보기만 한다.
  const gamWork=work('gam',GAM_X,'',gamTalk);
  Object.defineProperties(gamWork,{name:{get:()=>gamStage()===1?'감나무 감 따기':'감나무 올려다보기'},prompt:{get:()=>gamWork.name}});
  Rg.zones.village.npcs.push(gamWork);
  Rg.zones.forge.npcs.push(work('baskets',810,'평상에서 도토리 나누기',basketsTalk));
  Object.defineProperty(Rg.zones.hill,'npcs',{configurable:true,enumerable:true,get:()=>toadUphill()?['toad']:[]});
  // 결정 D-525: 엄마 방. 아이가 보낸 약에 따라 엄마 모습이 달라진다 (engine/core.js momStage). 열린 방문으로 들여다본다.
  const MOM_LINES=[
    '엄마가 이불 끝을 꼭 쥐고 잔다. 금방 올게, 엄마.\n문은 조금 열어 두자. 개울 소리가 들리게.',
    '머리맡에 빈 약사발이 있다. 숨소리가 한결 고르다.\n할머니 약이 듣긴 듣는구나.',
    '엄마가 벽에 기대 앉아 있다. 나를 보고 한참 만에 웃었다.\n볼에 핏기가 조금 돈다.',
    '엄마가 볕 드는 문가에서 콩을 고른다. 손은 아직 느리다.\n"…왔니." 한마디가 또렷했다.',
    '엄마가 마당에서 빨래를 갠다. 나를 보더니 이름을 부른다.\n…몇 번을 들어도 좋다.'];
  // 결정 D-625: 돌너머에 들어선 뒤 처음 엄마를 보러 오면, 아이가 엄마 얼굴을 보고 다시 떠나기 힘들어한다 (사용자 피드백 2026-11-05 단풍골 9).
  //   엄마는 말 대신 손으로 보낸다. 떠나던 날 씌워 준 아빠 모자(프롤로그)를 바로 씌우고, 손수 매어 준 아빠 짐표(D-422)를 친다.
  //   아이는 짐표를 치는 뜻(아빠를 찾아오라)을 알아듣고 다시 길을 나선다. 한 번만 나온다. 영산을 마친 뒤(엄마가 나음)에는 나오지 않는다.
  //   결정 D-1402: 엄마의 쪽지를 뺐으니 쪽지 글씨를 떠올리던 줄을 짐표의 뜻을 알아듣는 줄로 바꿨다.
  const momLeaveOpen=st=>!G.f.galMomLeave&&st>0&&st<4&&Object.keys(G.visitedZones?.dolneomeo||{}).length>0;
  function momVisit(){
    const st=momStage(),gifts=momGiftCount();
    const lines=[withPic(['너구리',MOM_LINES[st]],momRoomPic),
      ...(gifts&&st>0&&st<4?[['너구리','(머리맡에 내가 보낸 것들이 가지런히 놓였다.\n엄마가 하나하나 만져 봤나 보다.)']]:[])];
    if(!momLeaveOpen(st)){talk(lines);return;}
    G.f.galMomLeave=true;
    talk([...lines,
      ['너구리','(엄마 얼굴을 보니 발이 안 떨어진다.\n…그냥 집에 있을까. 물도 길어 드리고.)'],
      ['너구리',st<=1?'(엄마가 눈을 뜨고 손을 뻗어 내 모자를 바로 씌워 준다.\n떠나던 날 아침처럼.)':'(엄마가 손을 뻗어 내 모자를 바로 씌워 준다.\n떠나던 날 아침처럼.)'],
      ['너구리','(그러고는 보따리 끈의 아빠 짐표를 톡톡 친다.\n…아빠를 찾아오라는 거구나.)'],
      ['너구리','…응. 아빠 만나면 손 꼭 잡고 올게.\n그때까지 약 잘 드세요, 엄마.'],
      ['너구리','(문은 조금 열어 두고 나왔다.\n개울 소리가 들리게.)']],
      ()=>diary('galMomLeave','엄마를 보러 집에 들렀다. 발이 안 떨어졌는데, 엄마가 내 모자를 바로 씌워 주고 보따리 끈의 아빠 짐표를 톡톡 쳤다. 아빠를 찾아오라는 뜻이었다. 다시 길을 나섰다.'));
  }
  Rg.zones.village.npcs.push(Object.assign(work('home',95,'열린 방문 들여다보기',momVisit),{peek:false}));
  Rg.expStep=()=>{
    toadHillStep();   // 결정 D-833·D-834
    // 결정 D-134: 대장간 길목의 다람쥐 형제를 눈으로 보고 지나가도 '봤다'(D-129 ⑤ 보강)
    if(G.zone==='forge'&&!G.f.galSquirrelSeen&&Math.abs(G.px-tx(620))<TABLES.TUNING.hint_range)G.f.galSquirrelSeen=true;
    if(G.zone!=='forest'||!G.f.galExpChickWith||done('lost_chick'))return;
    if(G.f.galExpChickArrived){G.f.galExpChickX=2090;return;}
    const x=G.f.galExpChickX??1540,dx=(CLASSIC?G.px:untrimX(G.px,Rg.trimCuts?.forest))-x;   // 설계 좌표끼리 잰다 (D-128)
    // 빠르게 앞질러도 꺼병이는 안전한 자리에서 기다린다. 돌아오면 다시 따라온다.
    if(Math.abs(dx)>TABLES.TUNING.field_talk_distance&&Math.abs(dx)<W*.5){
      G.f.galExpChickX=clamp(x+Math.sign(dx)*TABLES.TUNING.field_move_speed,1540,2090);
    }
    if(G.f.galExpChickX>=2090&&!G.f.galExpChickArrived){G.f.galExpChickArrived=true;think('갈대 너머에서 어미가 답한다! 꺼병이한테 말해 주자.');}
  };
  for(const n of Rg.npcs){
    const positions={dodam:['forest',700],nal:['forge',1560],musoe:['forge',1040],toad:['hill',TOAD_HILL_X]};   // 결정 D-521
    [n.zone,n.x]=positions[n.id];
    // 결정 D-833·D-834: 할멈 자리는 어귀에서 시작해 칡이 풀린 뒤 아이 곁으로 옮겨 간다. 약탕관은 어귀에 둔다.
    if(n.id==='toad'){
      Object.defineProperty(n,'x',{configurable:true,enumerable:true,get:toadHillX,set:()=>{}});
      const pot=n.props;n.props=p=>pot({...p,x:G.f.galToadUphill?toadHillX():TOAD_GATE_X});   // 예전 저장은 할멈 곁 그대로
    }
  }
  // 결정 D-833: 할멈은 처음부터 언덕 어귀에 있다 (예전 D-412·D-521: 칡이 풀린 뒤에만 언덕에 왔다).
  const oldGoal=Rg.goal;
  Rg.goal=()=>{
    const F=G.f;
    if(!G.started||G.ended)return oldGoal();
    // 결정 D-890: 글은 위 goalSteps 의 목표·길잡이를 같이 쓴다.
    const S=goalSteps;
    if(G.diary.some(d=>d.id==='end')||(Rg.arcsEnabled()&&F.galArcToad1))return S.farewell();
    // 결정 D-67: 앞선 진행부터 본다. 다람쥐로 덩굴을 넘어 칡을 먼저 만나도 안내가 뒤처지지 않는다.
    if(G.boss.dead)return S.boss();
    if(mapVisited(Rg.id,'hill'))return S.fight();
    if(G.barrier.cut)return S.climb();
    if(!F.dodamTalk)return S.findWay();
    if(F.dodamDone&&!F.musoeMet)return S.musoe();
    if(F.musoeMet&&!F.musoeTested&&!F.musoeDone)return S.test();
    if(F.leafHeld&&!F.leafGiven&&!F.musoeDone)return S.leaf();
    if(F.leafGiven&&!F.musoeAfterLeaf&&!F.musoeDone)return S.afterLeaf();
    if(F.dodamDone&&!F.musoeDone&&!has('coal',F.musoeCoal?2:1)&&!F.nalTalk)return S.nal();
    if(!F.musoeDone&&F.nalTalk&&!F.nalDone&&!has('coal',F.musoeCoal?2:1)&&!has('root'))return S.nalPowder()||S.root();
    if(F.musoeDone&&!G.barrier.cut)return S.cut();
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
    // 결정 D-147: 소금·깨는 처음부터 날쌘 지게에 있다. 칡 줄기가 없으면 값이 모자랄 뿐이다.
    ...(!CLASSIC?[{id:'t_craft_salt',item:'salt',label:'소금 2 · 깨 1',asks:[{vine:1}],done:()=>G.f.craftTrade_salt,accept:nalSaltGive}]:[])
  ],
  toad:()=>G.f.toadMet?[{id:'t_toad',item:'meoru',icon:'magamok_tea',label:'엄마 기운을 붙드는 약',asks:[{meoru:1},{meoru:1,acorn_jelly:1}],extra:[null,{kkoe:1}],done:()=>G.diary.some(d=>d.id==='end'),accept:toadGive}]:[]
};
Rg.onHaggle=(npc,way)=>{
  if(npc!=='nal'||way!=='허세'||G.f.nalDone)return false;
  if(G.rel.nal.v===0)rel('nal',1);
  return true;
};

})();
