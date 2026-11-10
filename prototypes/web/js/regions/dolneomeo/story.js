'use strict';
/* 돌너머 진행: NPC 대화와 교환, 돌쇠 할배의 맷돌 배우기, 돌 골렘 전투, 서리다래 약즙 보내기, 지금 할 일.
   결정 D-130: Fable 검수 반영. 뿔영감에게 서리다래를 먼저 묻고 꾸벅이에게 보내진다. 뿔영감 말버릇은 "규칙이다" 하나.
   결정 D-135: 최종 검수. 지문은 너구리 아래, '어떻게 아나'(할배의 글자·자개, 꾸벅이의 자리), 아빠가 첫서리를 기다린 까닭, 부순 뒤 뿔영감의 반응.
   흐름은 design/narrative/dolneomeo-scenario.md (확정 웹 흐름·개발자 결정), 교환은 design/data/trades.csv
   교환 연쇄: 칡꽃 → 결명자 → (맷돌 배우기) 맷돌 깨어남 → 메밀가루 → 돌산 길 */
(()=>{
const Rg=REGIONS.dolneomeo;
const MG=TABLES.MINIGAMES;

const pick=lines=>lines[Math.floor(Math.random()*lines.length)];

/* ---------- 채택된 인물 사연: 필수 진행과 보상은 아래 선택지 밖에서도 열린다 ---------- */
function arcMenu(name,say,normal,choices){
  talk([[name,say,[{t:'하던 이야기 계속하기',go:normal},...choices,{t:'다음에 이야기하기',go:null}]]]);
}
// 결정 D-580: 사연은 막을 줄여 해야 할 말만 남긴다 (사용자 피드백 2026-11-04: 대화 하나가 끝나면 또 하나 생긴다).
//   여러 막을 한 장면으로 묶을 때, 묶인 옛 막의 진행값도 함께 붙인다 (그림·보통 일·옛 저장이 읽는다).
function arcAll(flags,lines,record,after){
  return arcScene(flags[0],lines,record,()=>{for(const f of flags.slice(1))G.f[f]=true;if(after)after();});
}
function talkKkuArc(){
  const F=G.f;
  // 결정 D-130: 사연도 고개를 들 때만 말이 통한다. 졸 때는 잠꼬대로 돌아간다.
  if(!Rg.arcs()||!F.kkuDone||!Rg.kkuAwakeNow())return talkKku();
  // 결정 D-580: 여섯 막을 세 막으로 묶었다 (맡긴 말 → 잊는 봄과 그림 생각 → 그림 달기).
  if(!F.dolneomeo_arc_kku3){
    // 결정 D-135: 아빠는 할배네서 나온 그 밤부터 뿔영감이 길을 열지 않은 가을장마 사흘을 둥지 곁에서 났다.
    arcMenu('꾸벅이','잊기 전에… 맡길 말이 있어어…',talkKku,[{t:'무슨 말인데?',go:()=>arcAll(['dolneomeo_arc_kku3','dolneomeo_arc_kku2'],[
      ['꾸벅이','그 모자 쓴 아저씨… 할배네서 나온 밤부터\n비 오는 사흘을 내 둥지 곁에서 잤어…'],
      ['꾸벅이','잠결에 들었어…\n“미안하다… 그 겨울에 내가 없어서…”'],
      ['꾸벅이','나는 봄에 깨면 다 잊으니까…\n너한테 맡길게에…'],
      ['너구리','(아빠 수첩 다음 장에 그대로 적었다.)'],
      ['꾸벅이','휴우… 이제 맘 놓고 졸겠다아…\n…원래도 졸았지만…']
    ],'아빠는 할배네서 나온 그 밤부터 비 오는 사흘을 꾸벅이 둥지 곁에서 잤다. 꾸벅이가 그때 들은 아빠의 말을 맡겨서 수첩에 적었다. “미안하다… 그 겨울에 내가 없어서…”',()=>learn('dolneomeo:arcs-kkubeogi'))}]);return;
  }
  // 결정 D-118: 꾸벅이는 봄에 깨면 반가워하는 이를 못 알아본다. 글은 못 읽으니 아이가 그림으로 남긴다(D-61 아이의 그림).
  if(!F.dolneomeo_arc_kku5&&F.ppuriPassed&&moleMet()){
    arcMenu('꾸벅이','봄에 깨면… 또 다 잊겠지이…',talkKku,[{t:'봄에 깨면 어떤데?',go:()=>arcAll(['dolneomeo_arc_kku5','dolneomeo_arc_kku4'],[
      ['꾸벅이','작년 봄에… 누가 날 보고 막 반가워했는데…\n누군지 몰라서… 그 애가 울었어…'],
      ['너구리','글은 못 읽지? 그럼 그림으로 남기자.\n봄에 보면 알아보게.'],
      ['꾸벅이','그림은… 볼 수 있어어…\n아, 생각났다… 반짝돌 갖고 놀던 애…'],
      ['너구리','돌쇠 할배 손주구나. 그려 줄게.']
    ],'꾸벅이는 봄에 깨면 반가워하는 이를 못 알아본다. 글은 못 읽으니 그림으로 남기기로 했다. 작년 봄에 울던 애는 반짝돌을 갖고 놀던 꼬마 두더지였다.')}]);return;
  }
  if(F.dolneomeo_arc_kku5&&!F.dolneomeo_arc_kku7&&G.boss.dead){
    arcMenu('꾸벅이','그림… 그려 왔어어…?',talkKku,[{t:'그린 그림을 둥지에 달아 준다',go:()=>arcAll(['dolneomeo_arc_kku7','dolneomeo_arc_kku6'],[
      ['너구리','(수첩 맨 뒤 장에 꼬마 두더지와 반짝돌,\n그 옆에 모자 쓴 내 얼굴을 그렸다.)'],
      ['꾸벅이','이 애다아… 너도 그 모자 아저씨랑\n똑같네에…'],
      ['너구리','(그림을 억새로 묶어\n둥지 문턱 돌에 괴어 두었다.)'],
      // 결정 D-271: 해 준 일에는 값이 있다. 둥지를 짓고 남은 억새꽃 솜(겨울잠 짐승다운 것)
      ['꾸벅이','봄에 깨면 제일 먼저 보이겠다아…\n둥지 깔고 남은 솜이야. 보따리에 깔아…'],
      gotLine('eoksae_som',1),
      ['꾸벅이','이제 진짜로 잔다아… 깨우지 마아… 쿨…']
    ],'수첩 맨 뒤 장에 꼬마 두더지와 반짝돌, 모자 쓴 내 얼굴을 그려 꾸벅이 둥지 문턱에 괴었다. 봄에 깨면 제일 먼저 보일 자리다. 꾸벅이가 둥지에 깔고 남은 억새꽃 솜을 주었다.',()=>learn('dolneomeo:kku-drawing'))}]);return;
  }
  talkKku();
}
const moleMet=()=>!!G.f.wanderersDone?.['dolneomeo:dol_mole'];
/* 마당 돌탑 꼭대기의 할멈 돌 (사연 dolsoe1).
   결정 D-1004: 결명자 차를 드린 자리에서 이 이야기를 고르면, 예전엔 "무얼 묻고 싶으냐" 메뉴가 한 번 더 떠서 같은 질문을 두 번 골라야 했고
   이야기가 끝나면 맷돌 배우기가 끊겼다. 이제 바로 이야기하고, 맷돌을 아직 안 배웠으면 할배가 하던 이야기(맷돌)로 돌아온다. */
function topStone(){
  arcScene('dolneomeo_arc_dolsoe1',[
    ['너구리','(할배가 마당 돌탑 꼭대기 돌을\n두 손으로 감싼다.)'],
    ['돌쇠 할배','먼저 간 우리 할멈이 올린 돌이다.\n눈이 이리 돼도 이 돌은 날마다 만진다.'],
    ['돌쇠 할배','밑을 단단히 괴면 작은 돌도 안 떨어진다.\n…할멈 잔소리도 그랬지.']
  ],'돌쇠 할배는 먼저 간 아내의 소원 돌을 지킨다. 눈이 어두워진 뒤에도 그 돌만은 날마다 만져 본다고 했다.',()=>{
    if(!G.f.stackDone)talk([['돌쇠 할배','…그래, 맷돌 얘기를 하던 참이었지.\n손을 얹어 보겠느냐.',[{t:'맷돌에 손을 얹는다',go:openStack},{t:'조금 이따가요',go:null}]]]);
  });
}
function talkDolsoeArc(){
  const F=G.f;
  // 결정 D-735: 꼬마가 감춘 정을 찾는 동안에는 그 일부터 (확장판 길손 이야기, story.js 아래 블록)
  if(F.dolMoleChisel===1&&Rg.moleChiselReturn){Rg.moleChiselReturn();return;}
  const atYard=true;   // 결정 D-164: 할배가 다리 현장에 나가던 일(옛 돌다리 복원)이 없어져 늘 마당에 있다
  const sack=Rg.arcs()&&atYard&&F.dolneomeo_badger1&&!F.dolneomeo_badger_sent;   // 결정 D-118: 메밀댁의 햇메밀 자루
  // 결정 D-130: 처음 인사를 나눈 뒤에야 메밀댁 이름을 꺼낸다.
  if(sack&&!F.dolsoeTea&&F.dolsoeMet)return arcMenu('돌쇠 할배','누가 왔느냐.',talkDolsoe,[badgerSack()]);
  if(!Rg.arcs()||!F.dolsoeTea)return talkDolsoe();
  const c=[];
  if(sack)c.push(badgerSack());
  if(atYard&&!F.dolneomeo_arc_dolsoe1)c.push({t:'마당 돌탑 꼭대기 돌은 누가 올렸어요?',go:()=>topStone()});
  // 결정 D-580: 아빠의 돌과 엄마 몫의 돌을 한 장면으로 묶었다 (dolsoe2·dolsoe3).
  else if(F.golemCalm&&knows('like:golem:story_stone')&&!F.dolneomeo_arc_dolsoe3)c.push({t:'아빠의 돌을 올렸어요',go:()=>arcAll(['dolneomeo_arc_dolsoe3','dolneomeo_arc_dolsoe2'],[
    ['너구리','아빠의 돌, 대신 올렸어요.'],
    // 결정 D-130: 성황당에 가기 전 할배 마당 탑에서 먼저 얹어 보다 손이 떨렸다. 그래서 할배가 그 돌을 갖고 있다.
    ['돌쇠 할배','지난가을 네 아비가 내 마당 탑에 먼저 얹어 보더니\n손이 떨려 못 올리고 두고 갔지.'],
    ['너구리','엄마 몫도 올려도 돼요?'],
    ['돌쇠 할배','이리 오너라. 밑은 내가 받치마.'],
    ['너구리','(할배 돌탑에 작은 돌 하나를 얹었다.\n엄마, 약 보낼게.)'],
    ['돌쇠 할배','손이 네 아비를 닮았구나. 덜 떨 뿐이지.']
  ],'아빠는 성황당에 가기 전 할배 마당 탑에 소원 돌을 얹어 보다, 손이 떨려 못 올리고 두고 떠났다. 그 돌을 대신 올렸다. 할배가 받쳐 준 돌탑에 엄마 몫의 돌도 얹었다.')});
  // 결정 D-118: 꼬마 두더지는 할배 눈이 정말 멀까 봐 손으로 돌 읽기를 피한다. 꼬마가 같은 마당에 있을 때만 연다.
  // 결정 D-130: 꼬마 두더지는 돌쇠 할배의 손주다.
  if(!c.length&&G.zone==='village'&&moleMet()&&F.dolneomeo_arc_dolsoe1){
    /* 꼬마 사연의 막들 */
    if(!F.dolneomeo_arc_dolsoe4)c.push({t:'꼬마는 요새 뭐 해요?',go:()=>arcScene('dolneomeo_arc_dolsoe4',[
      ['돌쇠 할배','우리 손주 녀석, 너하고는 잘 노는구나.'],
      ['돌쇠 할배','손으로 돌 읽는 걸 가르치려 들면\n도망만 간다.'],
      ['돌쇠 할배','내 눈이 더 흐려지기 전에\n한 번은 가르쳐야 하는데.']
    ],'돌쇠 할배는 눈이 더 흐려지기 전에 손주 꼬마 두더지에게 손으로 돌 읽는 법을 가르치고 싶어 한다. 꼬마는 도망만 다닌다.')});
    // 결정 D-135: 꼬마의 속마음(dolsoe5)은 꼬마에게 말을 걸어 듣는다. 할배 자리에서 꼬마가 말하지 않는다. 결정 D-891: 돌 쌓기를 마쳤는지는 따지지 않는다.
    else if(!F.dolneomeo_arc_dolsoe5)c.push({t:'꼬마한테 물어볼게요',go:()=>talk([['돌쇠 할배','그래 주련.\n조약돌 늘어놓고 노는 데 있을 게다.']])});   // 결정 D-1003: 꼬마는 돌담 뒤가 아니라 마을 길의 조약돌 놀이 자리(D-735)에 있다
    // 결정 D-580: 꼬마가 배우는 막과 맞히는 막을 묶었다 (dolsoe6·dolsoe7).
    else if(F.dolneomeo_arc_dolsoe5&&!F.dolneomeo_arc_dolsoe7&&G.boss.dead)c.push({t:'꼬마가 할배를 찾아요',go:()=>arcAll(['dolneomeo_arc_dolsoe7','dolneomeo_arc_dolsoe6'],[
      ['꼬마 두더지','…가르쳐 줘, 할배.'],
      ['돌쇠 할배','눈 감아라. 손바닥 전부로, 천천히.'],
      ['꼬마 두더지','차가워… 오돌토돌해.\n어, 이건… 우리 할머니 돌이다. 따뜻해.'],
      ['너구리','(할배가 소리 내어 웃었다.\n처음 듣는 웃음소리였다.)'],
      // 결정 D-271: 손주 마음을 돌려 준 값. 석수가 곱돌로 깎은 잔
      ['돌쇠 할배','이제 내 눈이 좀 쉬어도 되겠다.\n녀석 마음 돌려놓은 값이다. 곱돌 잔이다.'],
      gotLine('gopdol_jan',1),
      ['꼬마 두더지','할배 눈 대신 내 손으로 볼게.\n할배가 떡 숨긴 데도 다 찾을 거야.']
    ],'꼬마 두더지가 할배에게 손으로 돌 읽는 법을 배우고, 눈을 감은 채 꼭대기의 할머니 돌을 알아맞혔다. 돌쇠 할배가 처음으로 소리 내어 웃었다. 녀석 마음을 돌려놓은 값이라며 곱돌 잔을 주었다.',()=>learn('dolneomeo:mole-reads'))});
  }
  if(c.length)return arcMenu('돌쇠 할배','무얼 묻고 싶으냐.',talkDolsoe,c);
  talkDolsoe();
}
function badgerSack(){
  return {t:'메밀댁 아주머니가 보냈어요',go:()=>arcScene('dolneomeo_badger_sent',[
    ['너구리','메밀댁 아주머니가 보냈어요.\n맷돌 받침 고쳐 주신 값이래요.'],
    ['너구리','(보따리에서 햇메밀 자루를 쑥 꺼냈다.)'],
    ['돌쇠 할배','받침 값치곤 많다.\n그 사람은 늘 넘치게 준다.'],
    ['너구리','멍석 지키느라 못 오신대요.'],
    ['돌쇠 할배','해마다 그 소리지.\n…그럼 다음엔 내가 내려가야겠구나.']
  ],'메밀댁 아주머니의 햇메밀 자루를 돌쇠 할배에게 날랐다. 할배는 받침 값치곤 많다며, 다음엔 자기가 내려가겠다고 했다.')};
}
function talkPpuriArc(){
  const F=G.f;
  // 필수 교환과 석이버섯 안내를 사연 메뉴보다 먼저 처리한다.
  if(!Rg.arcs()||!F.ppuriMet||(!F.ppuriPassed&&has('memil_powder'))||(F.golemCalm&&!F.dolPpuriCalmThanks)||(G.boss.dead&&!F.golemCalm&&!F.dolPpuriBrokenSeen))return talkPpuri();
  const c=[];
  // 결정 D-130: 뿔영감은 모자로 아빠를 알아본다. 결정 D-580: 규칙의 사연과 아빠 이야기를 한 장면으로 묶었다 (ppuri1·ppuri2).
  const dadLines=[
    ['너구리','아빠 찾으러 왔어요. 아빠도 이 길로 갔어요?'],
    ['너구리','(뿔영감이 내 모자를 한참 본다.)'],
    ['뿔영감','같은 모자다. …지난가을 장마 사흘을\n돌려보냈다. 날마다 새벽에 와 섰지.'],   // 결정 D-142: 밤은 꾸벅이 둥지 곁에서 났다
    ['뿔영감','기침을 하면서도 한 번도 화를 안 냈다.\n난 길만 살폈지. 기다리는 이는 못 봤다.']];
  const dadRecord='뿔영감은 내 모자를 보고 아빠를 알아봤다. 지난가을 장맛비 속에 아빠를 사흘 동안 세워 뒀다고 했다. 아빠는 기침을 하면서도 한 번도 화를 내지 않았다고 한다.';
  if(!F.dolneomeo_arc_ppuri1)c.push({t:'왜 꼭 장승제를 올려요?',go:()=>arcAll(['dolneomeo_arc_ppuri1','dolneomeo_arc_ppuri2'],[
    // 결정 D-274: 규칙이 왜 생겼는지를 아버지 일로 말한다(말버릇 "규칙이다"는 한 장면에 한 번).
    ['뿔영감','내 아버지도 여기 장승지기였다.\n폭설 날, 급하다는 짐꾼에게 그냥 길을 열어 줬지.'],
    ['뿔영감','그 짐꾼이 절벽에서 떨어졌다.\n그 뒤로 누가 급하다 해도 살피고 연다. 규칙이다.'],
    ...dadLines
  ],'뿔영감의 아버지도 장승지기였다. 폭설 날 급하다는 짐꾼에게 그냥 길을 열어 줬다가 짐꾼이 절벽에서 떨어졌다. 그 뒤로 뿔영감은 누가 급하다 해도 길을 살핀 다음에야 연다. '+dadRecord)});
  else if(!F.dolneomeo_arc_ppuri2)c.push({t:'아빠도 이 길로 갔어요?',go:()=>arcScene('dolneomeo_arc_ppuri2',dadLines,dadRecord)});   // 옛 저장: 규칙만 들은 경우
  else if(F.ppuriPassed&&!F.dolneomeo_arc_ppuri3)c.push({t:'아빠는 어느 길로 갔어요?',go:()=>arcScene('dolneomeo_arc_ppuri3',[
    ['뿔영감',CLASSIC?'금줄 너머 납작한 바위 옆으로 곧장 가면\n성황당이다. 네 아빠도 그리로 지나갔다.':'돌계단 안쪽 길은 성황당으로 곧장 간다.\n네 아빠도 그리로 지나갔다.'],
    ['뿔영감','누가 어디로 갔는지는 원래 말 안 한다.\n…사흘 세워 둔 값이다. 규칙엔 없다.']
  ],CLASSIC?'뿔영감이 아빠가 지나간 지름 바위를 알려 줬다. 금줄 너머 납작한 바위 옆길이다. 성황당 돌무더기는 따로 지나야 한다.':'뿔영감이 아빠도 마을 끝 돌계단 안쪽 길로 올라갔다고 알려 줬다. 누가 어디로 갔는지는 원래 말 안 한다면서.')});
  // 결정 D-118: 뿔영감은 아버지가 세운 장승에게 아침마다 길 소식을 고한다. 아이가 벗겨진 장승 눈을 칠한다.
  // 결정 D-580: 장승 이야기·눈 칠·떠날 때 인사를 한 장면으로 묶었다 (ppuri4~ppuri7).
  else if(F.dolneomeo_arc_ppuri3&&!F.dolneomeo_arc_ppuri6&&G.boss.dead)c.push({t:'장승 얼굴이 흐려요',go:()=>arcAll(['dolneomeo_arc_ppuri6','dolneomeo_arc_ppuri4','dolneomeo_arc_ppuri5','dolneomeo_arc_ppuri7'],[
    ['뿔영감','아버지가 세운 장승이다. 아침마다 길 소식을\n고한다만… 눈 칠이 장마에 다 벗겨졌다.'],
    // 결정 D-130: 굽으로는 붓을 못 쥐니 붓도 아이가 만든다.
    ['뿔영감','이 굽으로는 붓을 못 쥔다.\n숯 갠 물은 있다.'],
    ['너구리','(억새 끝을 묶어 붓을 만들고\n장승 눈에 동그랗게 먹을 올렸다.)'],
    ['뿔영감','됐다. 길을 보는 눈이다.\n…생각보다 순하게 생겼군.'],
    hintLine('dol_mulgam',['뿔영감','아버지는 이끼 앉은 돌을 갈아\n기름에 개서 칠했다. 그 빛은 오래 갔지.']),   // 결정 D-461: 귀띔
    ['너구리','(장승 뒤에 오래된 이름 하나가 새겨져 있다.)'],
    ['뿔영감','그때 떨어진 짐꾼이다.\n길을 열 때마다 그 이름부터 본다.'],
    // 결정 D-427: 장승 몸의 이름. 영산 마을의 글자가 지워진 장승과 짝을 이룬다
    ['뿔영감','장승도 몸에 이름을 새겨야 서는 법이다.\n천하대장군, 지하여장군.'],
    // 결정 D-271: 품을 들였으면 값을 받는다(뿔영감다운 셈). 고개 넘는 짐꾼들이 두고 간 소금
    ['뿔영감','품삯이다. 짐꾼들이 두고 간 소금이다.'],
    gotLine('salt',2),
    ['뿔영감','네 아빠가 돌아오는 길에 여길 지나거든\n사흘 말고 하루만 세워 두마. …하루면 충분하다.']
  ],'억새 끝을 묶어 붓을 만들고, 뿔영감이 갠 숯물로 장승 눈을 칠했다. 장승 뒤에는 뿔영감 아버지 때 절벽에서 떨어진 짐꾼의 이름이 새겨져 있다. 품삯이라며 소금을 주었다. 아빠가 돌아오는 길엔 하루만 세워 두겠다고 했다.',()=>learn('dolneomeo:ppuri-eyes'))});
  if(c.length)return arcMenu('뿔영감','묻고 싶은 게 있나.',talkPpuri,c);
  talkPpuri();
}
// 결정 D-444: 날쌘에게 아빠 낫을 보여 주는 사연(dolneomeo_arc_nal2)은 뺐다 (사용자 피드백 2026-11-04). 옛 저장의 진행값·수첩 줄은 남아도 읽는 데가 없다.

/* ---------- 꾸벅이 (고슴도치): 고개를 들 때 맞춰 말 걸기 ---------- */
/* 결정 D-197: 꾸벅이가 고개를 들지 않았을 때(조는 동안·깊이 잠든 뒤)는 보따리를 펼치거나 물건을 건넬 수 없다 (사용자 피드백 57).
   대화 중엔 필드 시간(G.anim)이 멈춰, 말을 건 순간의 모습이 대화 끝까지 간다. */
Rg.tradeClosed=id=>id==='kkubeogi'&&!Rg.kkuAwakeNow();
function talkKku(){
  const F=G.f;F.kkuTalk=true;
  if(!Rg.kkuAwakeNow()){
    Sound.stone('sleep');
    learn('kkubeogi:sleep');
    if(!G.clues.some(c=>c.id==='k1')){
      // 결정 D-135: 꾸벅이는 할배 마당 돌탑 그늘에서 졸다 들었다. 단서 문장은 npcs.csv 확정 그대로.
      clue('k1',NAME_CLUES.k1.who,NAME_CLUES.k1.text);   // 결정 D-427: 글자 대신 늙은 까치가 물어 온 밤
      talk([['꾸벅이','쿨… 쿨…'],['꾸벅이','할배 돌탑 그늘에서… 졸고 있었는데…'],['꾸벅이','보부상 아저씨… 할배네서 겨울 날 것처럼 굴더니…'],['꾸벅이','늙은 까치가… 뭘 물어 온 밤에…\n짐 싸서 떠났어어… 쿨…'],['너구리','(보부상 아저씨…? 아빠 얘기일까.)']]);
    }else talk([['꾸벅이',pick(['쿨… 둥지는… 폭신해야…','으음… 아직 꿈꾸는 중이야…','하암… 조금만 더…'])],['너구리',Rg.arcs()?(F.dolneomeo_arc_kku3?'(푹 자. 맡긴 말은 적어 뒀어.)':'(고개를 들 때까지 기다리자.)'):'(코가 씰룩하네. 곧 고개 들겠다.)']]);
    return;
  }
  Sound.stone('wake');
  if(!F.kkuAwake){F.kkuAwake=true;rel('kkubeogi',1);learn('kkubeogi:awake');
    if(Rg.arcs()){F.dolneomeo_arc_kku1=true;diary('dolneomeo_arc_kku1','꾸벅이가 고개를 들 때 말을 걸었다. 겨울잠 둥지에 깔 억새가 모자란다고 했다.');}
    ledger('kkubeogi','꾸벅이','마른 억새 3','서리다래 자리에 대한 정보');
    // 결정 D-130: 아이가 먼저 서리다래를 묻는다. 뿔영감에게 들었으면 그 말을 한다.
    const ask=F.ppuriMet?'서리다래 어디 열리는지 알아?\n장승지기 할아버지가 너한테 물어보래.':'서리다래 어디 열리는지 알아?\n엄마 약에 써야 해.';
    talk([['꾸벅이','어, 어…? 안 잤어어… 진짜야아…'],['너구리',ask],
      ['꾸벅이','서리다래애… 알지이…\n그 모자… 어디서 봤더라아…'],
      ['꾸벅이','근데… 겨울잠 둥지가 아직 덜 됐어…\n깔 억새… 세 단만 베어다 줄래에…?'],
      ['꾸벅이','가져오면… 다 알려 줄게에… 쿨…']],()=>{if(has('eoksae',3))kkuTrade();});
    return;
  }
  if(!F.kkuDone){
    if(has('eoksae',3))kkuTrade();
    // 결정 D-582: 인물은 조작·요령을 말하지 않는다 (사용자 피드백 2026-11-04: '돌 만나면 그걸로 쳐라' 같은 말은 뺀다)
    else talk([['꾸벅이','억새 세 단… 둥지가 아직 휑해…\n하암… 꿈에서도 추워…']]);
    return;
  }
  // 결정 D-270: 할배께 차를 드린 뒤에는 같은 귀띔을 되풀이하지 않는다
  talk([['꾸벅이',F.dolsoeTea?pick(['하암… 둥지가… 폭신해…','쿨… 조금만 더… 자고 나서어…']):'돌쇠 할배는 눈이 침침해서 손끝으로 돌을 보셔…\n결명자 차를 좋아하실 거야… 쿨…']]);
}
function kkuTrade(){
  talk([['꾸벅이','오… 억새다… 나 주는 거야…?',[{t:'보따리를 펼친다',go:()=>Trade.open('kkubeogi')},{t:'아직은 안 줄래',go:null}]]]);
}
function kkuGive(){
  if(G.f.kkuDone||!has('eoksae',3))return;
  {
    takeItem('eoksae',3);G.f.kkuDone=true;ledgerDone('kkubeogi');rel('kkubeogi',1);learn('kkubeogi:eoksae');
    // 결정 D-130: 뿔영감에게 이미 들은 말은 되풀이하지 않는다. 가루를 낼 길(돌쇠 할배 → 결명자 → 날쌘)을 잇는다.
    const met=G.f.ppuriMet;
    // 결정 D-257: 서리다래는 성황당 돌무더기가 가슴(핵)에 품고 있다. 꾸벅이는 첫서리 밤의 파란 빛과 봄마다 돌무더기 앞에 놓인 열매로 안다.
    diary('d_kku','꾸벅이에게 억새를 주고 들었다. 서리다래는 성황당 돌무더기가 가슴에 품고 있다가, 봄이 오면 하나씩 앞에 내놓는단다. 봄까지 기다릴 수는 없다.'+(met?'':' 장승지기 뿔영감이 돌산 길을 막았다.')+' 메밀가루는 돌쇠 할배에게 물어보라고 했다. 할배는 눈이 침침해서 결명자 차를 좋아하신단다.');
    // 결정 D-580: 해야 할 말만 (열매 자리, 봄까지 못 기다림, 가루 낼 길).
    const lines=[['꾸벅이','와… 폭신하다…'],['꾸벅이','서리다래는… 성황당 돌무더기가 가슴에 품고 있어…\n봄이면 한 알씩 앞에 내놔… 주워 먹어 봤어어…'],
      ['너구리','(봄까지는… 못 기다려.)'],
      met?['꾸벅이','장승제엔 메밀전이니까…\n가루가 있어야겠네에…']:['꾸벅이','근데 장승지기 뿔영감이 돌산 길을 막았어…\n장승제 메밀전을 받아야 연대애…'],
      // 결정 D-159: 아이가 모르는 이는 무엇 하는 이인지 붙여 가리킨다.
      // 결정 D-135: 꾸벅이는 날쌘의 좌판 사정을 모른다. 눈 침침·결명자 차(trades.csv 확정)만 남긴다.
      ['꾸벅이','가루는… 돌 깎는 두더지, 돌쇠 할배가 알아…\n눈이 침침하셔서 결명자 차를 좋아하셔… 쿨…']];
    talk(lines);
  }
}

/* ---------- 날쌘 (다시 만남): 돌투성이 마을이라 칡꽃 향이 귀하다 ---------- */
function talkNal(){
  if(!G.f.nalDTalk){G.f.nalDTalk=true;ledger('nal_dolneomeo','날쌘','칡꽃 1 (또는 겨우살이 2)','결명자');
    // 결정 D-130: 단풍골에서 칡꽃을 귀띔했으면(nal:route-price) 그 말을 받는다.
    const told=G.f.galArcNal2||knows('nal:route-price');
    // 결정 D-161: 같은 보부상으로서 길 고생을 먼저 알아준다.
    talk([['날쌘','또 만났네, 꼬마 보부상.\n돌길 오느라 발바닥 꽤 아팠지?'],['날쌘','나도 그래. 돌밖에 없는 동네라\n장사도 영 시원찮고.'],['날쌘',has('kflower')?(told?'칡꽃 챙겨 왔네. 말한 대로지.\n귀띔값은 뺐다. 결명자 둘.':'가만, 그 향은 단풍골 칡꽃이지?\n여기선 그게 귀해. 결명자 두 개는 쳐줄게.'):'단풍골 칡꽃 같은 건 없어? 여기선 귀하거든.\n하나면 결명자 두 개는 쳐줄게.']],nalMenu);}
  else nalMenu();
}
function nalMenu(){
  const F=G.f,c=[];
  c.push({t:'보따리를 펼친다',go:()=>Trade.open('nal')});
  if(!CLASSIC&&!F.dolneomeo_craft_oil)c.push({t:'지게에서 달그락거리는 병을 묻는다',go:()=>{
    // t_craft_oil: 꾸벅이 둥지 몫을 먼저 남긴다. 거절에는 소비가 없다.
    // 아이는 병 소리를 듣고 묻는다. 날쌘이 억새를 원하는 까닭(돌길에 병이 부딪는다)을 말한다.
    // 결정 D-445: 참기름 값은 마른 억새 세 단 (사용자 피드백 2026-11-04: 한 단과 참기름은 값이 안 맞는다). 병이 셋이라 한 병에 한 단씩 감싼다.
    const lead=['날쌘','참기름 병이야. 셋이나 되는데\n돌길이라 병끼리 자꾸 부딪쳐.'];F.nalOilAsked=true;
    if(!has('eoksae',F.kkuDone?OIL_EOKSAE:OIL_EOKSAE+3)){
      talk(F.kkuTalk&&!F.kkuDone?[lead,['날쌘','억새 세 단이면 한 병씩 감쌀 텐데.\n꾸벅이 둥지에 쓸 세 단은 남겨 두고.'],['날쌘','그거 말고 세 단 더 생기면 한 병 줄게.']]
        :[lead,['날쌘','마른 억새 세 단이면 한 병씩 감쌀 텐데.\n밭에서 베어 오면 한 병 줄게.']]);return;
    }
    talk([lead,['날쌘','그 억새 세 단이면 한 병씩 감쌀 수 있겠다.\n주면 한 병은 네 몫이야.',[
      {t:'보따리를 펼친다',go:()=>Trade.open('nal')},{t:'지금은 챙겨 둘게요',go:null}
    ]]]);
  }});
  c.push({t:'그만두기',go:null});
  const say=F.nalDDone?'결명자는 볶아 차로 달이거나, 꿀에 개어\n환으로 빚어 둬. …이 훈수도 공짜 아니야.'   /* 결정 D-135: 날쌘 말버릇 "공짜 아니야"(D-117) */
    :(has('kflower')||has('gyeousari',2))?'어디, 뭘 내놓을 건데?':'빈손으로 흥정하게? 칡꽃이 없으면\n높은 가지 겨우살이 두 개라도 따 와. 그럼 결명자 하나.';
  talk([F.nalDDone?hintLine('gyeol_hwan',['날쌘',say,c]):['날쌘',say,c]]);   // 결정 D-461: 귀띔
}
const OIL_EOKSAE=3;   // 결정 D-445
function nalOilGive(){
  if(G.f.dolneomeo_craft_oil||!has('eoksae',G.f.kkuDone?OIL_EOKSAE:OIL_EOKSAE+3))return;
  // 결정 D-147: 병 이야기를 듣기 전에 보따리에서 바로 바꾸면, 날쌘이 억새를 원한 까닭부터 말한다.
  const first=!G.f.nalOilAsked;G.f.nalOilAsked=true;
  takeItem('eoksae',OIL_EOKSAE);G.f.dolneomeo_craft_oil=true;
  diary('dolneomeo_craft_oil','날쌘에게 여분 억새 세 단을 주고 참기름을 받았다. 병마다 억새를 감싸니 돌길에서도 부딪치는 소리가 작아졌다.');
  talk([...(first?[['날쌘','억새 세 단이네. 돌길이라\n참기름 병끼리 자꾸 부딪치던 참이야.']]:[]),['날쌘','한 병에 한 단씩. 이제 안 부딪치겠네.\n기름은 네가 쓸 데에 써.'],receiveItem('sesame_oil',1)]);
}
function nalTrade(id){
  const F=G.f;
  if(F.nalDDone||!has(id,id==='kflower'?1:2))return;
  takeItem(id,id==='kflower'?1:2);F.nalDDone=true;ledgerDone('nal_dolneomeo');
  const n=(id==='kflower'?2:1)+(F.nalDBluff?1:0);
  learn('nal:dolneomeo');
  diary('d_nal',id==='kflower'?'단풍골에서 가져온 칡꽃을 날쌘에게 주고 결명자를 받았다. 돌투성이 마을에선 꽃 향이 귀하다. 마을이 바뀌니 물건값도 달라진다.':'높은 가지의 겨우살이를 날쌘에게 주고 결명자를 받았다.');
  // 결정 D-235: 받은 개수는 날쌘이 세지 않고 "얻었다" 줄로 알린다
  talk(F.nalDBluff?[['날쌘',id==='kflower'?'그 흔한 물건도 여기 오면 귀해지는 거야.\n자, 결명자. 덤도 얹었어.':'칡꽃은 흔하다며? 겨우살이로 왔네.\n자, 결명자. 덤도 얹었어.'],receiveItem('gyeolmyeongja',n),['날쌘','날쌘이 짜다는 소리는 못 듣지.']]
    :[['날쌘','자, 결명자. 이만하면 잘 바꿨지?'],receiveItem('gyeolmyeongja',n),['날쌘','눈 밝히는 약재니까 쓸 데가 있을걸.']]);
}

/* ---------- 돌쇠 할배 (두더지 석수) ---------- */
function talkDolsoe(){
  const F=G.f;
  if(!F.dolsoeMet){F.dolsoeMet=true;
    // 결정 D-442: 첫 만남은 뒤 이야기의 실마리를 은근히 깐다 (사용자 피드백 2026-11-04: 영양가 없는 대화).
    //   할배는 소원 돌을 새기는 중이다 → 소원 돌엔 이름부터 새긴다는 석수의 옛말(아빠의 이름 없는 소원 돌, D-427),
    //   성황당 돌무더기가 첫서리 뒤로 들썩인다(골렘·서리다래), 장승 둘을 지나야 성황당(뿔영감 길). 이름의 힘은 옛말로만 흘린다.
    // 결정 D-580: 첫 만남은 실마리 셋만 (이름부터 새기는 소원 돌, 돌산 꼭대기 성황당, 들썩이는 돌무더기).
    talk([['너구리','(두더지 할배가 눈을 가늘게 뜨고\n납작한 돌을 쪼고 있다. 탁, 탁.)'],
      ['돌쇠 할배','발소리가 가볍구나. 소원 돌을 새기는 중이다.\n이름을 먼저 새기고, 소원은 그 밑에.'],
      ['돌쇠 할배','이름 없는 소원은 성황당에 올려도\n바람이 도로 내려보낸다더라. 누구 건지 몰라서.'],
      ['돌쇠 할배','성황당은 장승 둘 지나 돌산 꼭대기다.\n첫서리 뒤로 그 돌무더기가 밤마다 들썩인다.']],()=>{if(has('gyeolmyeongja'))dolsoeTea();});
    return;
  }
  if(!F.dolsoeTea){
    if(has('gyeolmyeongja'))dolsoeTea();
    else talk([['너구리','눈이 불편하세요?'],['돌쇠 할배','돌은 손끝으로 보면 된단다. 내 눈은 걱정 말거라.']]);
    return;
  }
  if(!F.stackDone){
    talk([['돌쇠 할배','맷돌에 손을 얹어 보겠느냐. 천천히 해도 된단다.',[{t:'맷돌에 손을 얹는다',go:openStack},{t:'조금 이따가요',go:null}]]]);
    return;
  }
  // 결정 D-271: 결명자를 한 번 더 드리면 할배가 빈손으로 보내지 않는다. 석수가 돌 깎다 남은 조각으로 다듬은 공깃돌 (한 번만)
  const c=[];if(has('gyeolmyeongja')&&!F.dolsoeTea2)c.push({t:'결명자를 하나 더 드린다',go:()=>{takeItem('gyeolmyeongja',1);rel('dolsoe',1);F.dolsoeTea2=true;
    talk([['돌쇠 할배','허허. 또 챙겨 왔구나.'],hintLine('gongi',['돌쇠 할배','빈손으로 보낼 순 없지.\n차돌 쪼가리를 찧어 다듬은 공깃돌이다.']),receiveItem('gongi',1)]);}},{t:'그만두기',go:null});
  // 메밀가루를 내기 전에는 맷돌 쓰는 법을 한 번 더 일러 준다.
  // 결정 D-582: 맷돌 쓰는 요령 대신 할배다운 한마디
  if(!F.ppuriPassed&&!has('memil_powder')){talk([['돌쇠 할배','맷돌은 잘 돌더냐.\n네 아비는 처음에 손잡이부터 뽑아 왔다.',...(c.length?[c]:[])]]);return;}
  // 결정 D-160: 할 이야기를 다 나눈 뒤에는 할배가 제 일에 바쁘다. 그때 하는 일은 이야기 흐름을 따른다.
  const busy=G.boss.dead&&!F.golemCalm?[['너구리','(할배가 마당 돌을 하나씩 뒤집으며\n손끝으로 모서리를 재고 있다.)'],hintLine('heuk_banjuk',['돌쇠 할배','성황당 무너진 데 맞을 돌을 고른다.\n틈은 진흙에 돌가루, 억새 썰어 넣고 찧어 메우고.']),['돌쇠 할배','지금은 손을 못 뗀다.']]
    :[['너구리','(할배가 정으로 돌을 쪼고 있다. 탁, 탁.)'],['돌쇠 할배','…응? 지금은 손을 못 뗀다.\n돌이 삐지면 사흘을 안 풀린다.']];
  if(c.length)busy[busy.length-1]=[...busy[busy.length-1],c];
  talk(busy);
}
function dolsoeTea(){
  G.f.dolsoeAsked=true;
  talk([['돌쇠 할배','결명자 냄새로구나.',[{t:'보따리를 펼친다',go:()=>Trade.open('dolsoe')},{t:'나중에 달여 드릴게요',go:null}]]]);
}
function dolsoeGive(){
  if(G.f.dolsoeTea||!has('gyeolmyeongja'))return;
  {
    const F=G.f;takeItem('gyeolmyeongja',1);F.dolsoeTea=true;rel('dolsoe',1);learn('dolsoe:tea');
    ledger('dolsoe','돌쇠 할배','결명자 1','맷돌을 깨움');
    diary('d_dolsoe','돌쇠 할배가 보따리 속 맷돌의 자개 발자국을 손끝으로 더듬더니, 우리 집안 맷돌이라는 걸 알아봤다.');
    const lines=Rg.arcs()?[
      ['너구리','(결명자를 볶아 차로 달여 드렸다.)'],
      ['돌쇠 할배','고맙다. …그 보따리에서 돌 소리가 나는구나.\n맷돌이냐? 이리 줘 보거라.'],
      // 결정 D-130: 맷돌로 아이가 그 녀석 아들인 걸 알아보고, 젊은 아빠를 가르쳤다고 말한다.
      // 결정 D-135: 떨어진 자개를 할배가 박아 줬다. 아이가 "돌이 마음을 알아야 돈다"를 말하고 할배가 알아듣는다(npcs.csv 확정).
      ['너구리','(할배가 자개 발자국을 손끝으로 더듬다가 멈춘다.)'],
      ['돌쇠 할배','이 자개 발자국… 떨어진 걸 내가 박아 준 거다.\n그 녀석 집안 맷돌이다. …그럼 네가 그 녀석 아들이냐.'],
      ['너구리','아빠가 그랬어요.\n돌이 마음을 알아야 돈다고.'],
      ['돌쇠 할배','…내가 가르친 말이다.\n네 아비, 젊을 적에 내 마당에서 돌을 배웠다.'],
      // 결정 D-443: 돌 쌓기를 빼고, 할배가 맷돌 쓰는 법을 직접 알려 주며 돌 목소리를 듣게 한다 (사용자 피드백 2026-11-04: 돌 쌓기와 맷돌이 무슨 관계인지 모르겠다)
      ['돌쇠 할배','돌리기 전에, 먼저 돌 소리부터 듣거라.']
    ]:[['너구리','(결명자를 볶아 차로 달여 드렸다.)'],['돌쇠 할배','눈이 좀 밝아지는구나. 고맙다.'],['돌쇠 할배','보따리에서 돌 부딪는 소리가 나는구나.\n이리 줘 보거라.'],
      ['너구리','(할배가 맷돌 윗돌의 자개 발자국을 손끝으로 천천히 더듬는다.)'],
      ['돌쇠 할배','이 자개 발자국… 떨어진 걸 내가 박아 준 거다.\n그 녀석 집안 맷돌이구나.'],
      ['너구리','아빠가 그랬어요. 돌이 마음을 알아야 돈다고.'],
      ['돌쇠 할배','…내가 가르쳐 준 말이다.'],
      ['돌쇠 할배','돌리기 전에, 먼저 돌 소리부터 들어 보거라.']];
    if(Rg.arcs())lines.push(['돌쇠 할배','배워 보겠느냐.',[
      {t:'맷돌 돌리는 법을 배운다',go:openStack},
      {t:'마당 돌탑 꼭대기 돌을 여쭤본다',go:topStone},   // 결정 D-1004
      {t:'조금 이따가요',go:null}
    ]]);
    talk(lines,Rg.arcs()?null:openStack);
  }
}

/* 맷돌 배우기(결정 D-443): 할배가 맷돌 윗돌에 아이 손을 얹어 돌 소리를 듣게 하고, 왼쪽으로 한 바퀴 돌리게 한다. 맷돌이 깨어난다.
   (예전 돌 쌓기. 진행값 stackDone·dolsoe:stack 은 옛 저장 때문에 이름을 그대로 둔다)
   Rg.stoneTask 는 길손과 함께 돌을 받치는 손일에도 쓴다 (소리 한 번 뒤 바로 끝). */
// 결정 D-88: 손일은 미니게임 없이 바로 마친다 (확정: 미니게임은 채집·전투·놀이에만, 대장 2026-10-30). 막혀 있던 판정 코드는 지웠다.
function openStack(done=null){
  Sound.stone('tap');
  if(typeof done==='function'){done();return;}
  finishStack();
}
Rg.stoneTask=openStack;
function finishStack(){
  const F=G.f;
  F.stackDone=true;awaken('maetdol');learn('dolsoe:stack');ledgerDone('dolsoe');rel('dolsoe',MG.handwork_stack_relation);
  diary('d_maetdol','돌쇠 할배가 맷돌 윗돌에 내 손을 얹어 주었다. 가만히 있으니 돌이 우웅, 낮게 울었다. 그 소리 따라 왼쪽으로 한 바퀴 돌리자 증조할아버지의 맷돌이 깨어났다.');
  refreshHud();
  // 결정 D-1000: 맷돌이 깨어났다는 속말은 왼쪽으로 한 바퀴 돌린 뒤에 대화 안에서 한다 (사용자 지시 2026-11-06 대사 전수 점검).
  //   예전엔 할배가 손을 얹어 주기도 전에 "맷돌이 깨어났다!" 독백 창이 먼저 떠서, 대화와 겹치고 순서가 거꾸로였다.
  const woke=['너구리','(증조할아버지 맷돌이 깨어났다.\n메밀 세 알이면 가루 한 줌은 나오겠다.)'];
  // 결정 D-427: 맷돌을 깨운 손에 할배가 이름을 붙인다(꼭 거치는 길의 둘째 이름). 눈이 어두운 할배는 손끝으로 아이 손의 돌가루를 만져 보고 부른다.
  // 결정 D-1001: 이름 이야기 씨앗 (design/proposals/name-story-v2.md §3, 규칙 0: 이름에는 그 이름으로 겪은 일이 쌓인다). 석수의 옛말로만 흘린다.
  const stoneHand=[Object.assign(['너구리','(할배가 내 손을 더듬어 쥔다.)'],{pic:null}),['돌쇠 할배','돌가루가 하얗게 앉았구나.\n돌손이로구나.'],
    ['돌쇠 할배','이름 붙은 손은\n제가 한 일을 잊지 않는 법이다.']];
  // 결정 D-443: 왼쪽으로 돌리는 건 집안 손버릇(맷돌 가공 동작, D-113)과 같다. 할배가 처음 그 버릇을 일러 준다.
  const learnLines=[
    ['너구리','(맷돌을 떠올리자 보따리에서 쑥 나왔다.\n할배가 윗돌에 내 손을 얹어 준다. 돌이 차다.)'],
    ['돌쇠 할배','돌리지 말고. 가만히.'],
    ['너구리','(…우웅. 손바닥 밑에서\n낮은 소리가 올라온다.)'],
    ['돌쇠 할배','그게 돌 목소리다.\n그 소리 나는 쪽으로, 왼쪽으로 한 바퀴.'],
    // 결정 D-734: 왼쪽으로 한 바퀴 돌리는 줄부터 맷돌 돌리는 그림을 띄운다 (할배가 손을 쥐는 줄에서 내린다)
    Object.assign(['너구리','(어처구니를 잡고 왼쪽으로 돌렸다. 드르륵.\n생각보다 가볍게 돈다.)'],{pic:Rg.expansionArt?.maetdolTurnPic?.()})];
  const lines=Rg.arcs()?[
    ...learnLines,['돌쇠 할배','됐다. 맷돌이 네 손을 알아보는구나.'],woke,...stoneHand
  ]:[...learnLines,['돌쇠 할배','한 번에 도는구나. 네 아비보다 낫다.'],woke,...stoneHand];
  // 결정 D-130: 아빠 이야기는 맷돌이 깨어난 뒤 따로 연다.
  // 결정 D-135: 석수 손끝은 돌 글자를 읽는다. 아빠는 첫서리를 기다려 성황당에서 서리다래를 얻어 가려다, 늙은 까치가 물어 온 북쪽 소식에 그 밤 떠났다(아이의 서리다래가 아빠가 못 한 일이 된다).
  // 결정 D-421·D-427: 약연과 '되돌림' 글자는 뺐다. 대신 할배가 아빠의 소원 돌을 손끝으로 읽는다. 새긴 이 이름 자리가 없다.
  //   이름이 먹히면 기억에서도 지워져(이름의 규칙 3) 할배는 이름이 지워진 줄 모르고, 처음부터 안 새긴 줄 안다.
  // 결정 D-257: 서리다래는 첫서리에 성황당 돌무더기 가슴(핵)에 맺힌다. 그래서 '따 간다'가 아니라 '성황당에서 얻어 간다'.
  const reveal=[
    ['돌쇠 할배','네 아비도 지난가을 여기 왔었다.\n소원 돌을 하나 새겨 두고 갔지.'],
    ['너구리','(할배가 마당 구석의 납작한 돌을 손끝으로 읽는다.)'],
    ['돌쇠 할배','“아내 병 낫기를.” …새긴 놈 이름이 없구나.\n소원 돌엔 제 이름부터 새기라 가르쳤건만.'],
    ['돌쇠 할배','첫서리 내리면 성황당에서 서리다래를 얻어 간다더니,\n늙은 까치가 북쪽 소식을 물어 온 밤에 떠났다.'],
    // 결정 D-1258 (사용자 지시 2026-11-08 31을 고치다 찾은 어긋남): 까치가 물어 온 소식은 '첫눈에 얼었다'가 아니라 '첫얼음이 잡혔다'다.
    //   두루미·살금이 말대로 아빠는 첫눈 전에 섬에 닿아 있어야 하고, 어둑차사는 첫눈 밤에 내려앉는다. 얼음이 잡혀야 섬까지 걸어 건넌다.
    ['돌쇠 할배','영산 호수에 첫얼음이 잡혔다더구나.\n얼음이 잡혀야 섬까지 걸어 건넌다면서.']];
  reveal.push(['너구리','(아빠는 그 밤에 무엇을 하러 간 걸까.)']);
  if(G.rel.dolsoe.v>=2&&!F.stoneGiven){F.stoneGiven=true;addItem('story_stone',1);
    diary('d_stone','돌쇠 할배가 아빠의 돌을 내주었다. 아빠가 성황당에 올리려다 끝내 못 올린 소원 돌이다.');
    if(Rg.arcs())reveal.push(['돌쇠 할배','네 아비가 못 올린 소원 돌이다. 받아 두거라.'],gotLine('story_stone'),['돌쇠 할배','성황당에 대신 올려 주겠느냐.']);
    else reveal.push(['돌쇠 할배','참, 이 돌도 가져가거라.'],['돌쇠 할배','네 아비가 소원을 적은 돌이란다.\n성황당에 올리려다 끝내 못 올리고 두고 갔지.'],gotLine('story_stone'),['돌쇠 할배','네가 대신 올려 주려무나.']);}
  // 결정 D-135: 단서 s1은 할배가 소원 돌을 읽은 뒤에 적힌다.
  talk(lines,()=>{
    if(grantNickname('dol_stone_hand','돌손','돌쇠 할배'))diary('nickname:dol_stone_hand','돌쇠 할배에게 돌손이라고 불렸다.');
    talk(reveal,()=>clue('s1',NAME_CLUES.s1.who,NAME_CLUES.s1.text));
  });
}

/* ---------- 뿔영감 (산양 장승지기): 규칙대로 메밀가루를 받아야 길을 연다 ---------- */
function talkPpuri(){
  const F=G.f;
  if(!F.ppuriMet){F.ppuriMet=true;ledger('ppuri','뿔영감','메밀가루 1','돌산 길 통과');
    // 결정 D-130: 아이가 서리다래(엄마 약)를 묻는다. 뿔영감은 열매 자리는 꾸벅이에게 보낸다.
    // 결정 D-1430 (사용자 피드백 2026-11-10): "열매 자리는 모른다. 나는 길만 본다." 줄을 뺐다.
    talk([
      ['뿔영감','멈춰라. 장승제 전에는 돌산에 못 오른다.'],
      ...(F.kkuDone?[['너구리','서리다래가 성황당 돌무더기 속에 있대요.\n엄마 약이에요.']]:[
        ['너구리','서리다래를 찾으러 왔어요.\n엄마 약이에요.'],
        // 결정 D-159: 아이는 아직 꾸벅이를 모른다. 이름 대신 무엇인지로 가리킨다.
        ['뿔영감','산 열매라면 고슴도치 녀석이 안다.\n둥지에서 졸고 있을 게다.']]),   // 결정 D-135: 자리 안내는 할 일 줄이 한다
      // 결정 D-274: 장승제(길을 여는 허락) → 제물 → 돌무더기 경고 순서. 예전엔 "어차피 못 오른다" 뒤에 "장승제가 먼저다"가 와서 앞뒤가 엇갈렸다.
      // 결정 D-159: 아이가 장승제를 되묻고 뿔영감이 짧게 풀어 준다.
      ['너구리','장승제가 뭐예요?'],
      ['뿔영감','장승 앞에 상을 차려 산에 고하는 일이다.\n제물은 오르는 이가 마련한다. 규칙이다.'],
      ['뿔영감','장승제엔 메밀전을 올린다.\n메밀가루 하나를 가져와라.']],()=>{if(has('memil_powder'))ppuriTrade();});
    return;
  }
  if(!F.ppuriPassed){
    if(has('memil_powder'))ppuriTrade();
    else talk([['뿔영감','메밀가루 하나다. 가져오기 전엔 못 간다.\n외상도 규칙에 없다.']]);
    return;
  }
  if(F.golemCalm&&!F.dolPpuriCalmThanks){
    F.dolPpuriCalmThanks=true;
    // 옛 저장의 석이버섯 보상 때 이미 받은 의리는 다시 주지 않는다.
    if(!G.diary.some(d=>d.id==='d_seogi'&&d.text.includes('달랬')))rel('ppuri',1);
    // 결정 D-130: 뿔영감은 길을 살피러 올라가 직접 봤다.
    talk([['뿔영감','길을 살피러 성황당에 올라가 봤다.\n돌 하나 안 깨지고 내려앉았더군.'],['뿔영감','…고맙다. 산이 한동안 조용하겠군.']]);return;
  }
  // 결정 D-135: 돌무더기를 부순 뒤 첫 만남에 한 번 반응한다(달랜 경우는 위 D-130 분기). 세계가 기억한다(D-141 묶음).
  if(G.boss.dead&&!F.golemCalm&&!F.dolPpuriBrokenSeen){
    F.dolPpuriBrokenSeen=true;
    talk([['뿔영감','길을 살피러 올라가 봤다.\n성황당이 무너졌더군.'],['뿔영감','돌은 다시 쌓으면 된다.\n눈돌만 할배가 찾더라.']]);return;
  }
  talk([['뿔영감','규칙을 지켰으니 통과다. 가도 좋다.']]);
}
function ppuriTrade(){
  talk([['뿔영감','메밀가루는 가져왔나.',[{t:'보따리를 펼친다',go:()=>Trade.open('ppuri')},{t:'나중에 드릴게요',go:null}]]]);
}
// 결정 D-78: 메밀묵을 얹으면 장승제 상에 함께 올리고, 산이 준 몫으로 석이 한 장을 덤으로 준다.
function ppuriGive(i=0){
  if(G.f.ppuriPassed||!has('memil_powder'))return;
  {
    const F=G.f,jelly=i===1&&has('memil_jelly');takeItem('memil_powder',1);F.ppuriPassed=true;ledgerDone('ppuri');rel('ppuri',1);tellSeogi();
    if(jelly)takeItem('memil_jelly',1);
    diary('d_ppuri','맷돌로 간 메밀가루로 내가 장승제 메밀전을 부쳤다. 뿔영감이 산에 올리고 절하자 금줄이 걷히고 돌산 길이 열렸다.');
    think('돌산 길이 열렸다!');refreshGoal();
    // 결정 D-130: 전은 아이가 부친다. 오르는 이가 제물을 마련하는 규칙이다.
    // 결정 D-274: "규칙대로·~하는 법이다"를 한 장면에 몰아 쓰지 않는다. 석이 자리 안내(D-78·석이 채집)는 그대로 둔다.
    talk([['뿔영감','좋다. 장승제를 올린다.'],...(jelly?[['뿔영감','메밀묵까지 쑤어 왔군. 상에 함께 올리지.']]:[]),['뿔영감','번철은 내주마. 전은 네가 부쳐라.'],
      ['너구리','(번철에 메밀전을 부쳤다.\n뿔영감이 돌산 쪽에 올려 절하고 금줄을 걷었다.)'],
      // 결정 D-582: 석이 자리는 수첩·지도 표시가 알린다. 길 요령(흰 돌턱 밟기)은 말하지 않는다.
      ...(jelly?[['뿔영감','묵까지 얹었으니 몫을 나눈다.\n말려 둔 석이 한 장이다.'],receiveItem('seogi',1)]:[]),['뿔영감','성황당 돌무더기가 뒤척이는 건 산이 노한 게다.\n노한 산엔 절벽 아래 백 년 바위의 석이를 올리지.'],['뿔영감','통과다. …전은 맛있었다.']]);
  }
}
function tellSeogi(){
  if(G.f.seogiTold)return;
  G.f.seogiTold=true;Rg.addSeogiSpot();learn('ppuri:seogi');
  diary('d_seogi','뿔영감이 길을 열며 석이버섯 자리를 알려 줬다. 산이 노하면 석이를 올리는 법이라고 했다. 성황당 돌무더기까지 가지 않아도 절벽 아래 백 년 바위에서 딸 수 있다.');
}

/* ---------- 돌 골렘 전투 ---------- */
// 결정 D-1303 (사용자 지시 2026-11-08 43): 돌 골렘 앞 쉼터. 옛 구성은 뿔영감 고개(1560) 너머 골렘 앞(1860) 앞.
//   확장판 성황당은 골렘을 처음 보는 비탈 꼭대기(설계 2150) 뒤, 작은 돌탑 조사(설계 2250) 앞인 설계 2200
Rg.rest={zone:'shrine',get x(){return CLASSIC?1790:trimX(2200,Rg.trimCuts?.shrine);},need:()=>!!G.f.ppuriPassed,
  line:'바람 그늘에서 부시를 쳐 불을 피웠다. 언 손부터 녹이고 가자.'};
Rg.startGolem=()=>{
  G.px=1845;
  inkTransition('돌 골렘',(G.boss.x-G.cam)/W*100,()=>startBattle('golem',res=>{
    if(res==='win'||res==='calm'){
      if(res==='calm'){G.f.golemCalm=true;diary('d_calm','성황당 돌무더기를 부수지 않고 달랬다. 돌 골렘이 조용히 내려앉았다.');}
      Rg.bossDie();
    }else restAfterBattle(res,()=>{G.px=1790;},()=>{   // 결정 D-1303: 지면 쉼터로 (rest.js)
      G.f.faints+=res==='lose'?1:0;
      diary('d_hint','돌 골렘의 가슴 핵은 처음엔 눈 껍데기에 덮여 있다. 다리나 팔을 먼저 무너뜨리거나, 마음을 달랠 물건을 건네 보자.');
      talk([['너구리','(가슴 핵이 눈 껍데기에 덮여 있었어.\n다리나 팔부터 무너뜨리거나, 달랠 물건을 건네 보자.)']],()=>think('준비되면 다시 다가가자.'));
    });
  }));
};

/* ---------- 끝: 까치 편에 약즙 보내기 ---------- */
Rg.sendMedicine=()=>{
  if(regionCompleted(Rg.id))return;
  G.f.yakMade=true;
  diary('d_end','깨어난 맷돌로 서리다래를 갈아 약즙을 만들었다. 이번에는 내 손으로 만든 약이다. 까치 발에 묶어 남쪽으로 보냈다.');
  talk(CLASSIC?[['너구리','(서리다래 약즙… 이번엔 내 손으로 만들었다.)'],['너구리','(휘파람을 불자 장승 위의 까치가 내려왔다.)'],['너구리','까치야, 엄마한테 전해 줘. 남쪽 단풍골 우리 집이야.']]
    :[['너구리','(약즙 통을 까치 발에 단단히 묶었다.)'],['늙은 까치','단단히 묶었구나. 다녀오마.'],['너구리','엄마한테… 제가 만들었다고 전해 주세요.'],...Rg.nextMedicineWord],()=>{
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
  diary('dol_home_reply',Rg.homeReplyText);endGame();
};

/* ---------- NPC (npcs.csv 의 id). x 는 필드 위치 ---------- */
Rg.npcs=[
  {id:'kkubeogi',name:'꾸벅이',hint:'쿨… 쿨… 마른 풀 더미 속에서 누가 코를 곤다.',x:320,talk:talkKkuArc,draw:Rg.art.hedgehog,props:Rg.props.nest},
  {id:'nal',name:'날쌘',x:820,talk:talkNal,draw:COMMON_ART.weasel,props:COMMON_ART.nalProps},
  {id:'dolsoe',name:'돌쇠 할배',x:1150,talk:talkDolsoeArc,draw:Rg.art.mole,props:Rg.props.yard},
  {id:'ppuri',name:'뿔영감',x:1560,talk:talkPpuriArc,draw:Rg.art.goat},
];

/* ---------- 지금 할 일 ---------- */
/* 결정 D-890: 목표(화면)와 길잡이(수첩)를 함께 돌려준다 (goalLine). 길잡이는 아이가 들은 말과 본 것만 쓴다.
   field.js 의 확장판 덮어쓰기도 같은 글(Rg.goalSteps)을 쓴다. 옛 구성은 구역 이름을 빼고 말한다. */
const where=(expanded,classic='')=>CLASSIC?classic:expanded;
const PATH_GOAL='돌산 길 열기',FIND_GOAL='서리다래 있는 곳 알아보기';
const goalSteps=Rg.goalSteps={
  send:()=>goalLine('엄마께 약즙 보내기','서리다래 약즙을 만들었다. 마을의 늙은 까치 어르신께 맡기면 엄마께 날라다 주신다.'),
  pick:()=>goalLine('서리다래 얻기','돌무더기가 품고 있던 서리다래가 드러났다. '+where('성황당에서 ')+'서리다래를 주워 담자.'),
  juice:()=>goalLine('엄마 약 만들기','서리다래를 얻었다. 보따리를 열고 맷돌에 갈아 약즙을 내자.'),
  // 결정 D-130: 할 일 줄은 아이가 본 대로 '움직이는 돌무더기'라 부른다. 이름은 만나기 전엔 모른다.
  fight:()=>goalLine('서리다래 얻기',(G.f.kkuDone?'서리다래는 성황당 돌무더기가 가슴에 품고 있단다. ':'')+'장승제를 올려 돌산 길이 열렸다. 돌산을 올라 움직이는 돌무더기와 맞서자.'),
  // 결정 D-447: 뿔영감이 "고슴도치 녀석"이라 하기 전엔 마을에 묻는다. 꾸벅이 이름은 만난 뒤에만
  askVillage:()=>goalLine(FIND_GOAL,'엄마 약에 쓸 서리다래가 어디 열리는지 모른다. 돌너머 마을 이웃들에게 물어보자.'),
  askHedgehog:()=>goalLine(FIND_GOAL,'뿔영감님이 산 열매라면 고슴도치 녀석이 안다고 했다. 둥지에서 졸고 있단다. '+where('메밀밭 쪽 ')+'둥지를 찾아가 보자.'),
  wake:()=>goalLine(FIND_GOAL,'꾸벅이는 꾸벅꾸벅 졸다가 가끔 고개를 든다. 고개를 들 때를 기다렸다가 말을 걸자.'),
  eoksae:()=>goalLine(FIND_GOAL,has('eoksae',3)?'마른 억새 세 단이 모였다. 꾸벅이가 고개를 들 때 건네자.'
    :'꾸벅이가 겨울잠 둥지에 깔 마른 억새 세 단을 베어다 주면 서리다래 자리를 알려 준댔다. 마른 억새를 베자. ('+(G.inv.eoksae||0)+'/3)'),
  ppuri:()=>goalLine(PATH_GOAL,'서리다래는 성황당 돌무더기가 가슴에 품고 있단다. 그런데 장승지기 뿔영감님이 돌산 길을 막았다고 한다. '+where('장승 고갯길의 ')+'뿔영감님을 찾아뵙자.'),
  // 뿔영감: "장승제엔 메밀전을 올린다. 메밀가루 하나를 가져와라."
  powderGive:()=>goalLine(PATH_GOAL,'메밀가루가 생겼다. '+where('장승 고갯길의 ')+'뿔영감님께 건네고 장승제를 올리자.'),
  tea:()=>goalLine(PATH_GOAL,'결명자를 구했다. 꾸벅이 말대로 돌쇠 할배께 결명자 차를 달여 드리자.'),
  // 꾸벅이: "가루는 돌쇠 할배가 알아. 눈이 침침하셔서 결명자 차를 좋아하셔"
  findTea:()=>goalLine(PATH_GOAL,'장승제 메밀전에 쓸 메밀가루가 있어야 한다. 꾸벅이 말로는 가루는 돌쇠 할배가 아시고, 할배는 결명자 차를 좋아하신다. 결명자 구할 데를 찾아보자.'),
  nal:()=>goalLine(PATH_GOAL,(has('kflower')||has('gyeousari',2))?'날쌘 아저씨가 칡꽃 하나나 겨우살이 둘을 받고 결명자를 준단다. 날쌘 아저씨께 건네자.'
    :'날쌘 아저씨가 겨우살이 둘이면 결명자를 준단다. 나무에 붙은 겨우살이 둘을 따자. ('+(G.inv.gyeousari||0)+'/2)'),
  dolsoe:()=>goalLine(PATH_GOAL,G.f.dolsoeTea?'돌쇠 할배가 우리 집안 맷돌을 알아보셨다. 할배 곁에서 맷돌에 손을 얹어 보자.':'결명자를 구했으니 돌쇠 할배를 찾아뵙자.'),
  memil:()=>{const m=G.inv.memil||0;return goalLine(PATH_GOAL,m<3?'맷돌이 깨어났다. 메밀 세 알을 갈면 메밀가루가 된다. '+where('메밀밭에서 ')+'메밀을 줍자. ('+m+'/3)'
    :'메밀 세 알이 모였다. 보따리를 열고 맷돌에 갈아 메밀가루를 내자.');},
};
Rg.goal=()=>{
  const F=G.f,S=goalSteps;
  if(!G.started)return '';
  if(G.ended)return '돌너머 마을 체험판 완료';
  // 결정 D-67: 앞선 진행부터 거꾸로 본다.
  if(G.boss.dead)return !F.daraePicked?S.pick():S.juice();
  if(F.ppuriPassed)return S.fight();
  if(!F.kkuTalk)return F.ppuriMet?S.askHedgehog():S.askVillage();
  if(!F.kkuAwake)return S.wake();
  if(!F.kkuDone)return S.eoksae();
  if(!F.ppuriMet)return S.ppuri();
  if(has('memil_powder'))return S.powderGive();
  if(!isAwake('maetdol')){
    if(has('gyeolmyeongja'))return S.tea();
    if(!F.nalDDone)return !F.nalDTalk?S.findTea():S.nal();
    return S.dolsoe();
  }
  return S.memil();
};
/* 결정 D-149: 보통 일(사연에서 맡은 심부름). 아이가 하겠다고 한 뒤부터 마칠 때까지만 보인다.
   결정 D-890: 이름(title)이 목표이고, text 는 수첩에 적는 지금 단계의 길잡이다. */
defineSideQuests(Rg.id,[
  {id:'dol_memil_sack',title:'메밀댁 햇메밀 자루 나르기',start:F=>F.dolneomeo_badger1,done:F=>F.dolneomeo_badger_sent,
    text:()=>'메밀댁 아주머니가 맡긴 햇메밀 자루가 보따리에 있다. 돌쇠 할배 댁 마당에서 할배께 전해 드리자.'},
  {id:'dol_mole',title:'꼬마 두더지 속마음 듣기',start:F=>F.dolneomeo_arc_dolsoe4,done:F=>F.dolneomeo_arc_dolsoe5,
    text:()=>'돌쇠 할배는 손주 꼬마 두더지에게 손으로 돌 읽는 법을 가르치고 싶어 하신다. 꼬마는 도망만 다닌다. 돌담 뒤 꼬마에게 왜 그러는지 물어보자.'},
  // 결정 D-580: 그림은 그리는 자리에서 바로 단다. 장승 눈은 이야기를 들은 자리에서 바로 칠해 보통 일로 남지 않는다.
  {id:'dol_kku_drawing',title:'꾸벅이에게 그림 남겨 주기',start:F=>F.dolneomeo_arc_kku5,done:F=>F.dolneomeo_arc_kku7,
    text:()=>G.boss.dead?'꾸벅이가 봄에 깨도 꼬마 두더지를 알아보게 그림을 그려 주기로 했다. 메밀밭 둥지의 꾸벅이에게 가자.'
      :'꾸벅이가 봄에 깨면 꼬마 두더지를 못 알아볼까 봐 걱정한다. 그림을 그려 주기로 했다. 엄마 약 서리다래부터 구하고 그려 주자.'},
  // 메밀댁이 맡긴 꽃수 보자기는 집에 돌아가 엄마 무릎에 올릴 때(영산을 마칠 때) 끝난다.
  {id:'dol_flower_bojagi',title:'꽃수 보자기 주인에게 돌려주기',start:F=>F.dolneomeo_badger4,done:()=>regionCompleted('yeongsan'),
    text:()=>'작년 여름 혼자 이 고개를 넘던 너구리 아낙이 두고 간 보자기다. 매듭도 꽃수도 엄마 것과 같다. 길을 마치고 집에 가면 엄마께 여쭤 보자.'},
]);
/* ---------- 교환 화면의 부탁 (engine/trade.js) ----------
   결정 D-39: 원하는 것을 들은 뒤에만 보인다(장부에 적혔거나, 냄새를 맡고 먼저 말을 꺼낸 뒤). 받은 뒤의 이야기는 위의 대화 함수가 이어 간다.
   결정 D-40: 날쌘에게 허세가 통하면 결명자를 하나 더 얹는다(경멸 축). 결명자를 바꾼 뒤라면 흔한 물건에 덤. */
function dolsoeEyeGive(){
  if(G.f.dolsoeEye||!has('mossy_eye'))return;
  takeItem('mossy_eye',1);G.f.dolsoeEye=true;rel('dolsoe',1);
  // 결정 D-135: 할배는 눈돌을 자리에 맞게 다듬어 두고 뒤에 성황당에 올라가 넣는다. 한 대화 안에서 다녀오지 않는다.
  diary('d_dolsoe_eye','골렘에게서 떨어진 이끼 낀 눈돌을 돌쇠 할배께 드렸다. 할배가 자리에 맞게 다듬어 두고, 성황당에 도로 넣어 주겠다고 했다.');
  talk([['너구리','(할배가 눈돌을 받아 손끝으로 이끼를 쓸어 본다.)'],['돌쇠 할배','…성황당 돌무더기 눈이구나.\n눈이 없으면 돌무더기가 편히 못 잔다.'],
    ['너구리','(할배가 눈돌 가장자리를 손끝으로 재며 깎아 낸다.)'],['돌쇠 할배','자리에 맞게 다듬었다. 넣는 건 내가 올라가 하마.\n깎인 가루는 네가 가져가라. 깨진 돌 때우는 데 쓴다.'],receiveItem('stonedust',2)]);
}
function kkuMudGive(){
  if(G.f.kkuMud||!has('mud'))return;
  takeItem('mud',1);G.f.kkuMud=true;rel('kkubeogi',1);
  talk([['꾸벅이','진흙… 이걸로 둥지 틈 바르면… 바람이 안 들겠다…'],['꾸벅이','가을에 주워 둔 메밀… 자는 동안 눅눅해지니까… 너 가져가…'],receiveItem('memil',2),['꾸벅이','쿨…']]);
}
Rg.trade={
  kkubeogi:()=>[
    ...(G.ledger.kkubeogi?[{id:'t_kkubeogi',item:'seoridarae',info:true,label:'서리다래 자리에 대한 정보',asks:[{eoksae:3}],done:()=>G.f.kkuDone,accept:kkuGive}]:[]),
    // 결정 D-77: 겨울잠 들기 전, 억새로 엮은 둥지의 바람 틈을 진흙으로 바른다.
    ...(G.f.kkuDone?[{id:'t_kkubeogi_mud',item:'memil',n:2,label:'둥지 바람 틈 바르기 · 메밀 2',asks:[{mud:1}],done:()=>G.f.kkuMud,accept:kkuMudGive}]:[])
  ],
  nal:()=>[
    ...(G.ledger.nal_dolneomeo?[{id:'t_nal_dolneomeo',item:'gyeolmyeongja',n:1,asks:[{kflower:1},{gyeousari:2}],done:()=>G.f.nalDDone,
      accept:i=>nalTrade(i===0?'kflower':'gyeousari')}]:[]),
    // 결정 D-147: 참기름은 처음부터 날쌘 지게에 있다. 꾸벅이 둥지 몫을 아직 모르면 까닭은 말하지 않고 남겨 두기만 한다.
    ...(!CLASSIC?[{id:'t_craft_oil',item:'sesame_oil',n:1,asks:[{eoksae:OIL_EOKSAE}],done:()=>G.f.dolneomeo_craft_oil,
      locked:()=>!G.f.kkuDone&&has('eoksae',OIL_EOKSAE)&&!has('eoksae',OIL_EOKSAE+3)?(G.f.kkuTalk?'마른 억새 세 단. 꾸벅이 둥지에 쓸 세 단은 남겨 두고 세 단이 더 있어야 한다.':'억새는 아직 쓸 데가 있다.'):null,accept:nalOilGive}]:[])
  ],
  dolsoe:()=>[
    ...(G.f.dolsoeAsked?[{id:'t_dolsoe',item:'gyeolmyeongja',icon:'maetdol',label:'맷돌 보는 법',asks:[{gyeolmyeongja:1}],done:()=>G.f.dolsoeTea,accept:dolsoeGive}]:[]),
    // 결정 D-77: 골렘이 잠든 뒤, 돌쇠 할배는 성황당 돌무더기의 눈돌을 제자리에 넣어 주려 한다.
    ...(G.f.dolsoeTea&&G.boss.dead?[{id:'t_dolsoe_eye',item:'stonedust',n:2,label:'돌무더기 눈돌 제자리 찾기 · 돌가루 2',asks:[{mossy_eye:1}],done:()=>G.f.dolsoeEye,accept:dolsoeEyeGive}]:[])
  ],
  ppuri:()=>G.ledger.ppuri?[{id:'t_ppuri',item:'memil_powder',icon:'geumjul',label:'돌산 길 열기',asks:[{memil_powder:1},{memil_powder:1,memil_jelly:1}],extra:[null,{seogi:1}],done:()=>G.f.ppuriPassed,accept:ppuriGive}]:[]
};
Rg.onHaggle=(npc,way)=>{
  if(npc!=='nal'||way!=='허세'||G.f.nalDDone)return false;
  if(!G.f.nalDBluff){G.f.nalDBluff=true;rel('nal',1);}
  return true;
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
  const last=text.charCodeAt(text.length-1)-0xAC00;
  diary('nickname:'+id,by+'에게 '+text+(last>=0&&last<11172&&last%28?'이라고':'라고')+' 불렸다.');
};
// 결정 D-580: 묶인 막의 진행값도 함께 붙인다 (위 블록의 arcAll 과 같다)
function arcAll(flags,lines,record,after){
  return arcScene(flags[0],lines,record,()=>{for(const f of flags.slice(1))G.f[f]=true;if(after)after();});
}
// 결정 D-343: 함께 돌을 받치는 일은 돌 소리 한 번 뒤 바로 끝난다 (D-88 손일 미니게임의 제목·단계 문구 인자는 지웠다)
function hands(done){Rg.stoneTask(done);}
function hareHands(){
  hands(()=>{
    finish('dol_hare','짐꾼과 등짐을 함께 받쳐 숫돌을 낮추고 끈을 고쳐 맸다. 장승 뒤 길표 이야기를 들었다. 품값으로 억새 한 단을 받았다. 짐 괴던 돌은 고갯길 돌탑에 보태겠다고 했다.','dolneomeo_pack_help')();
    nickname('dol_pack_friend','짐 동무','산토끼 짐꾼');
    // 결정 D-271: 함께 짐을 고쳐 맨 값. 짐꾼이 지고 가던 억새 한 단 (짐도 덜고 값도 치른다)
    talk([['산토끼 짐꾼','고맙다, 짐 동무!\n무거운 쪽을 알아서 받치는구나.'],['산토끼 짐꾼','위에 얹었던 억새 한 단은 네가 가져가.\n짐도 덜고, 품값도 치르고.'],receiveItem('eoksae',1),['산토끼 짐꾼','숫돌은 돌쇠 어른 댁에 내려놓고,\n짐 괴던 돌은 길섶 돌탑에 보태 둘게.']]);
  });
}
function frogHands(){
  hands(()=>{
    finish('dol_frog','따뜻한 돌을 개구리에게 밀고 물이 흐르는 홈을 피해 잠자리를 받쳤다. 높은 바위 틈의 붉은 발자국을 알려 줬다. 바람에 날려 와 돌 밑에 끼어 있던 겨우살이를 가져가라고 했다.','dolneomeo_frog_warm')();
    // 결정 D-271: 잠자리를 받쳐 준 값. 바위틈에 사는 개구리가 가진 것 — 바람에 날려 와 걸린 겨우살이
    talk([['움츠린 개구리','…돌 밑에 겨우살이 끼어 있지?\n바람에 날려 와 걸린 거야. 가져가.'],receiveItem('gyeousari',1)]);
  });
}
function magpieHands(){
  hands(()=>{
    finish('dol_magpie','까치 앞에서 바람을 막아 주고, 돌담 틈을 막고 발 놓을 돌을 놓았다. 바람 오는 쪽에 앉았다고 바람막이라고 불렀다. 가을에 숨겨 둔 잣을 주었다.','dolneomeo_magpie_rest')();
    // 결정 D-427: '돌손'은 맷돌을 깨운 손에 돌쇠 할배가 붙인다(꼭 거치는 길). 까치는 제 앞에서 바람을 막아 준 일로 부른다
    nickname('dol_windbreak','바람막이','늙은 까치');
    // 결정 D-271: 바람을 막아 준 값. 까치는 먹이를 숨겨 둔다 — 부리가 무뎌 못 깨는 잣
    talk([['늙은 까치','이제 날개 밑이 안 시리다.\n손이 하얗구나. 꼭 그 양반 손이로구나.'],['늙은 까치','…바람막이로구나. 이제 그리 부르마.\n이리 와 손 녹여라.'],
      ['늙은 까치','가을에 담 틈에 숨겨 둔 잣이다.\n이젠 부리가 무뎌 못 깬단다. 네가 먹으렴.'],receiveItem('jat',2)]);
  });
}

/* 결정 D-118: 새 인물 사연 둘. 사연을 켰을 때만 막이 이어진다. 막마다 다른 때에 연다(첫 만남 → 심부름 뒤 → 돌무더기가 잠잠해진 뒤 → 약즙을 보낸 뒤).
   메밀댁: 작년 여름 혼자 북쪽으로 고개를 넘던 너구리 아낙(엄마)이 값으로 두고 간 꽃수 보자기(엄마 복선. 두루미의 이야기와 두꺼비 할멈 D-02와 맞물린다).
   결정 D-1395 (사용자 지시 2026-11-08 47, name-story-v4 §1): 엄마는 앓는 아이를 할멈에게 맡기고 혼자 신목에 갔다. '오래전 겨울, 아기를 안고'를 '작년 여름, 혼자'로 바꿨다.
   결정 D-130: 메밀댁은 들쥐다(단풍골 검댕·무쇠와 오소리·다리 아픔이 겹쳐서). 멍석에 메밀을 널어 밭을 못 뜬다. 3막은 아이 보따리 매듭이 계기이고, 보자기도 같은 매듭으로 묶여 있다.
   보자기의 보답(주인에게 돌려주는 장면)은 엔딩에서 거둔다. 여기서는 받아 드는 데서 멈춘다.
   남생이 할미: 지난가을 아빠가 맨 흙빛 천, 백 년 전 북쪽에서 무언가 지나간 가뭄, "샘부터 찾아라"(강철이 복선, 강철이 달래기 D-11). */
function talkBadgerArc(){
  const F=G.f;
  if(!Rg.arcs()){talk([['메밀댁','메밀 거두는 철이라 손이 모자라구나.\n길 조심해 가거라.']]);return;}
  // 결정 D-580: 메밀댁 사연은 네 장면 (부탁 → 품삯과 매듭 → 할배가 내려온 일 → 보자기). 보자기를 보이는 막과 맡기는 막을 묶었다.
  if(!F.dolneomeo_badger1){
    talk([['메밀댁','보따리 멘 걸 보니 보부상이로구나.\n짐 하나만 날라 주련.'],
      ['메밀댁','햇메밀 한 자루, 돌쇠 할배 댁에.\n우리 맷돌 받침 고쳐 준 값이야.'],
      ['메밀댁','멍석 두고 자리를 뜨면 까마귀가 다 쪼아 먹어.\n늦었다고 전해 주렴.',[
        // 결정 D-446: 자루를 메지 않고 집안 가보 요술보따리에 넣는다 (사용자 피드백 2026-11-04, 요술보따리 D-425: 넣으면 무게를 못 느낀다)
        {t:'메밀 자루를 보따리에 넣는다',go:()=>arcScene('dolneomeo_badger1',[
          ['너구리','(보따리 끈을 풀고 자루를 밀어 넣었다.\n쑥 들어간다. 보따리는 납작한 그대로다.)'],
          ['메밀댁','…방금 그 자루, 어디 갔니?'],
          ['너구리','여기 있어요. 할배 댁 가서 꺼낼게요.'],
          ['메밀댁','보부상 보따리는 다르긴 다르구나.\n…우리 쌀독도 좀 그랬으면.']
        ],'메밀밭 들쥐, 메밀댁 아주머니의 햇메밀 자루를 보따리에 넣어 돌쇠 할배에게 나르기로 했다. 메밀을 널어 둔 멍석을 지키느라 밭을 못 뜨신다.')},
        {t:'지금은 다른 짐이 있어요',go:null}]]]);
    return;
  }
  if(!F.dolneomeo_badger_sent){talk([['메밀댁','…자루는 잘 있지?\n보따리 속에서 싹 나면 안 된다.']]);return;}
  if(!F.dolneomeo_badger2){
    arcScene('dolneomeo_badger2',[
      ['메밀댁','잘 받았다더냐?'],
      ['너구리','다음엔 할배가 내려오신대요.'],
      // 결정 D-271: 날라 준 품삯. 메밀댁은 늘 넘치게 준다(npcs.csv) — 하나는 그 자리에서, 하나는 싸서
      ['메밀댁','그 눈으로? …고집은.\n품삯이다. 한 장은 지금, 한 장은 가다가 먹어라.'],
      gotLine('memil_jeon',1),
      hintLine('seogibyeong',['메밀댁','잔칫날 같으면 쌀가루에 석이를 섞어\n쪄 줬을 텐데. 돌산 석이라 귀하단다.']),   // 결정 D-461: 귀띔
      ['너구리','(아주머니 눈이 내 보따리 매듭에서 멈췄다.)'],   // 결정 D-135: 꽃수를 2막에서 먼저 보인다
      ['메밀댁','그 매듭, 누가 묶어 줬니?'],
      ['너구리','엄마가요. 엄마가 묶는 대로 배웠어요.'],
      ['메밀댁','…그렇구나.']
    ],'메밀댁 아주머니가 품삯이라며 메밀전을 두 장 주었다. 한 장은 가다가 먹으라고 했다. 내 보따리 매듭을 한참 보더니, 누가 묶어 줬는지 물었다.');
    return;
  }
  // 두 사연이 만나는 자리: 할배가 "다음엔 내가 내려가마"고 한 말을, 손으로 길을 읽게 된 꼬마가 지키게 한다.
  if(F.dolneomeo_badger2&&F.dolneomeo_arc_dolsoe6&&!F.dolneomeo_badger_visit){
    arcScene('dolneomeo_badger_visit',[
      ['메밀댁','어제 돌쇠 할배가 내려왔더라. 그 눈으로.\n손주 녀석이 디딜 돌을 하나하나 짚어 주면서.'],
      ['메밀댁','"할배, 다음 돌은 이끼 있어. 미끄러워." 그러더라.'],
      ['메밀댁','받침 값은 벌써 치렀는데\n자꾸 더 고쳐 주겠다는구나. …고집은.']
    ],'돌쇠 할배가 손주 꼬마 두더지의 손을 잡고 메밀밭까지 내려왔다고 한다. 꼬마가 디딜 돌을 하나하나 짚어 주었다고.');
    return;
  }
  // 결정 D-118·D-1395: 작년 여름 혼자 고개를 넘던 너구리 아낙이 값으로 두고 간 꽃수 보자기 (엄마 복선).
  if(!F.dolneomeo_badger4&&G.boss.dead){
    arcAll(['dolneomeo_badger4','dolneomeo_badger3'],[
      ['메밀댁','네 매듭이 자꾸 눈에 밟혀서\n묵은 짐을 꺼내 봤다.'],
      ['너구리','(묶인 그대로인 보자기 꾸러미.\n매듭이… 내 보따리 매듭이랑 똑같다.)'],
      ['메밀댁','작년 여름, 너구리 아낙 하나가 혼자 이 고개를 넘었다.\n북쪽 산에 간다고, 해가 지는데도 걸음을 재촉하더라.'],
      ['메밀댁','메밀죽 먹이고 하룻밤 재웠더니\n이걸 값이라고 두고 갔어.'],
      ['너구리','(매듭 틈으로 귀퉁이 꽃수가 보인다.\n엄마가 내 보따리 끝에 놓던 그 꽃이다.)'],
      ['너구리','(작년 여름이면… 내가 앓아누웠던 때다.)'],
      ['메밀댁','보부상은 사람 찾는 데 선수라더라.\n이 고운 걸 주인한테 돌려주렴.'],
      ['너구리','…꼭 전해 드릴게요.'],
      ['메밀댁','그 매듭, 엄마한테 잘 배웠다고도 전하고.']
    ],'메밀댁 아주머니가 묵혀 둔 보자기 꾸러미를 꺼냈다. 작년 여름, 북쪽 산에 간다며 혼자 고개를 넘던 너구리 아낙이 값으로 두고 간 것이다. 내가 앓아누웠던 그 여름이다. 내 매듭과 똑같이 묶여 있었고, 귀퉁이에 엄마가 놓던 꽃수가 있었다. 주인에게 돌려주라며 내 손에 쥐여 주었다.',()=>{learn('dolneomeo:flower-bojagi');finishWanderer('dol_badger');});
    return;
  }
  talk([['메밀댁',G.boss.dead?'메밀 그루터기에도 서리가 앉는구나.\n겨울이 빨리 오겠다.':'성황당 쪽 돌무더기가 또 울리는구나.\n그쪽엔 가지 마라.']]);
}
function talkTurtleArc(){
  const F=G.f;
  if(!Rg.arcs()){talk([['남생이 할미','천천히 가거라.\n돌길은 서두르는 발을 먼저 문다.']]);return;}
  // 결정 D-580: 남생이 할미 사연은 두 장면 (소원 천 → 북쪽에서 지나간 것과 샘). 뒤의 두 막을 묶었다.
  if(!F.dolneomeo_turtle1){
    talk([['너구리','(돌 그늘에서 늙은 남생이가\n붉은 천 조각을 물고 있다.)'],
      ['남생이 할미','마침 잘 왔다.\n목을 빼도 저 가지까진 안 닿는구나.'],
      ['남생이 할미','이 소원 천 좀 높이 매 주련.\n…목이 이만큼 늘어난 것도 백 년 걸렸다.',[
        {t:'높은 가지에 천을 맨다',go:()=>arcScene('dolneomeo_turtle1',[
          ['너구리','(돌탑을 딛고 올라 높은 가지에 천을 맸다.\n맨 위엔 흙빛 천이 하나 먼저 매여 있다.)'],   // 결정 D-135: 매듭 알아봄은 메밀댁(엄마)에만
          ['남생이 할미','그 흙빛 천은 지난가을 모자 쓴 너구리가 맸지.\n무슨 소원인지는 말 안 하더구나.'],
          // 결정 D-272: 소원은 그 자리에서 말한다(사용자 지시 2026-11-02: 미루는 대화는 장난 같다).
          ['너구리','할머니 소원은요?'],
          ['남생이 할미','비다. 백 년 전 한 해 비가 안 와서\n샘이 마르고 내 등딱지가 쩍쩍 갈라졌지.'],
          // 결정 D-271: 매 준 값. 백 년 엎드려 산 바위에 난 석이(남생이 할미다운 것)
          ['남생이 할미','매 준 값이다.\n내가 백 년 엎드린 바위에 난 석이다.'],
          gotLine('seogi',1)
        ],'성황당 남생이 할미의 소원 천을 높은 가지에 매어 주었다. 할미의 소원은 비다. 백 년 전 한 해 비가 안 와 샘이 마르고 등딱지가 갈라졌다고 했다. 가장 높은 가지에는 아빠가 지난가을 맨 흙빛 천이 있었다. 매 준 값이라며 석이버섯을 주었다.')},
        {t:'나중에 매 드릴게요',go:null}]]]);
    return;
  }
  if(!F.dolneomeo_turtle3&&G.boss.dead){
    arcAll(['dolneomeo_turtle3','dolneomeo_turtle2'],[
      ['너구리','백 년 전 그해엔 왜 비가 안 왔어요?'],
      ['남생이 할미','그해 여름 북쪽에서 뭐가 지나갔다.\n너무 뜨거워 고개도 못 들었지.'],
      ['남생이 할미','요새 북쪽 바람이 그해랑 냄새가 같다.\n북쪽에서 물 마른 데를 만나거든 샘부터 찾아라.'],
      // 결정 D-130: 가뭄에 마른 샘과 강철이의 언 샘(D-11)을 함께 잇는다. 샘이 "죽는다".
      ['남생이 할미','뭐가 지나간 자리엔 샘이 먼저 죽는다.\n여름엔 마르고, 겨울엔 언다. 언 샘은 녹이면 흐르지.'],
      ['너구리','할머니 소원도 이뤄지면 좋겠어요.'],
      ['남생이 할미','백 년을 빌었더니 백 년 비가 왔다.\n…밑지는 장사는 아니지.']
    ],'남생이 할미가 백 년 전 비가 안 온 그해 여름, 북쪽에서 무언가 지나갔다고 했다. 요새 북쪽 바람이 그해와 냄새가 같다고. 물 마른 데를 만나면 샘부터 찾으라고 했다. 무언가 지나간 자리엔 샘이 먼저 죽는다고. 여름엔 마르고 겨울엔 언다고.',()=>{learn('dolneomeo:turtle-spring');finishWanderer('dol_turtle');});
    return;
  }
  talk([['남생이 할미',G.boss.dead?'돌무더기가 조용하니 낮잠이 잘 온다.':'돌무더기가 뒤척이는구나.\n저리 가까이 가지 마라.']]);
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
        // 결정 D-582: 길 요령 줄은 뺐다. 결정 D-1205: 장승 뒤 손바닥은 지나간 보부상이 남긴 길표다(아빠 도장, D-1200)
        ['산토끼 짐꾼','장승 뒤 받침에 낡은 손바닥 자국이 있지.\n우리 아버지가 그러는데, 지나간 보부상이 남긴 길표래.'],
        ['산토끼 짐꾼','고개 넘기 전에 거기서 짚신 끈을 고쳐 매라는 거지.\n우리도 거기서 끈을 다시 매.']
      ],hareHands)},
      {t:'지금은 길부터 살펴볼게요',go:null}
    ]]
  ]);
}

/* 결정 D-735: 꼬마 두더지 만남을 돌집 돌 고르기에서 할배의 정 이야기로 바꿨다 (사용자 피드백 2026-11-05 돌너머 3: 돌 고르기가 난해하다. 할배와 이어진 부탁으로).
   꼬마는 할배가 정으로 돌을 쪼다 돌가루에 눈을 비비는 게 싫어 정을 몰래 감췄다(뒤 사연 D-118의 '할배 눈이 멀까 봐'와 같은 걱정).
   정이 없으면 할배는 마당을 손으로 더듬어 찾는다. 아이는 그게 눈을 더 쓰는 일이라 말하고, 꼬마와 함께 정을 돌려드린다.
   할배는 자루에 묻은 떡고물로 손주 짓인 걸 손끝으로 알아본다. 아이는 엄마가 약사발을 늘 머리맡 같은 자리에 두는 걸 떠올려
   정 자리를 정해 두자고 하고, 할배가 받침돌에 홈을 판다. 꼬마는 일이 끝나면 정을 그 홈에 꽂아 두기로 한다. 값은 꼬마가 땅 파다 찾은 도토리 2(D-271 그대로).
   진행값 dolMoleChisel: 1 정을 감춘 걸 들음(꼬마가 할배 곁으로 감) · 2 돌려드림. 할배를 먼저 만나야(dolsoeMet) 이야기가 열린다. */
const moleChiselPic=(w,h)=>{
  R(0,0,w,h,'#dcd8c8');R(0,30,w,14,'#a39b8a');R(0,30,w,1,'#857d6e');
  for(const [x,y] of [[6,36],[19,40],[44,38],[57,35]])R(x,y,2,1,'#8a8273');
  // 꼬마 두더지가 등 뒤로 감춘 긴 정 (몸보다 길다)
  R(14,8,3,26,'#6f7a7a');R(14,8,3,2,'#c9d0cc');R(15,30,1,4,'#4c5554');R(13,24,5,8,'#8a6a45');R(14,25,1,6,'#a9875a');
  R(20,16,16,15,'#70675b');R(23,12,11,8,'#8a7967');R(32,15,5,3,'#d6ab8d');R(31,14,1,1,'#2e3834');R(20,16,14,3,'#a2926c');
  R(18,29,5,3,'#4e5549');R(30,29,5,3,'#4e5549');R(17,20,4,4,'#c5ab86');   // 정을 쥔 작은 손
  // 꼬마의 반짝돌
  R(42,27,5,4,'#59626a');R(43,26,3,1,'#6e7880');R(44,27,1,1,'#fff6c8');R(45,28,1,1,'#e9f0f2');
  // 정 자루에 묻은 떡고물
  R(15,26,1,1,'#e8c46a');R(16,28,1,1,'#e8c46a');
};
function meetMole(){
  const F=G.f;
  if(!F.dolsoeMet){
    talk([['꼬마 두더지','이 반짝돌 봐! 씻으니까 별이 나왔어.'],
      ['꼬마 두더지','돌은 우리 할배가 다 알아.\n탁, 탁 소리 나는 마당 있지? 거기가 할배네야.']]);return;
  }
  if(F.dolMoleChisel===1){chiselReturn();return;}
  talk([
    Object.assign(['너구리','(꼬마 두더지가 반짝돌을 굴리다가\n긴 쇠꼬챙이를 얼른 등 뒤로 감춘다.)'],{pic:moleChiselPic}),
    ['너구리','그거 할배 정 아니야?\n아까 할배가 그걸로 돌을 쪼시던데.'],
    ['꼬마 두더지','쉿! 할배 쉬실 때 몰래 가져왔어.'],
    ['꼬마 두더지','할배는 정 들면 자꾸 눈을 비벼.\n돌가루가 들어가서. 정이 없으면 쉬실 거야.'],
    Object.assign(['너구리','정이 없어지면 할배는 어떻게 하셔?'],{pic:null}),
    ['꼬마 두더지','…아까부터 마당을 손으로 더듬고 계셔.'],
    ['너구리','그럼 찾느라 눈을 더 쓰시잖아.\n같이 돌려드리자. 내가 옆에 있을게.'],
    ['꼬마 두더지','…혼나면 네가 같이 혼나 줘야 돼.']
  ],()=>{F.dolMoleChisel=1;think('꼬마가 정을 안고 할배 마당 쪽으로 간다. 따라가자.');});
}
function chiselReturn(){
  const F=G.f;
  talk([
    ['너구리','(할배가 무릎을 꿇고 받침돌 둘레를\n손바닥으로 더듬고 있다.)'],
    ['돌쇠 할배','정을 어디 뒀더라.\n분명 받침돌 위에 뒀는데.'],
    ['꼬마 두더지','…할배, 여기.'],
    ['너구리','(꼬마가 내민 정을 할배가 받아 쥐고\n자루를 손끝으로 쓸어 본다.)'],
    ['돌쇠 할배','자루에 떡고물이 묻었구나.\n시렁에 숨겨 둔 떡 꺼내 먹은 손이지?'],
    ['꼬마 두더지','할배가 정 들면 눈을 비비니까….\n정이 없으면 쉬실 줄 알았어.'],
    ['돌쇠 할배','녀석. 정이 없으면 이 늙은이는\n마당을 기어서 찾는다. 그게 눈을 더 쓰는 거다.'],
    ['너구리','할아버지, 정 자리를 정해 두면 어때요?\n우리 엄마도 약사발은 늘 머리맡 같은 데 둬요.'],
    ['너구리','늘 같은 데 있으면\n눈 감고도 손만 뻗으면 잡히잖아요.'],
    ['돌쇠 할배','허허, 그 말이 맞다.\n받침돌 모서리에 홈을 하나 파 두마. 정은 늘 거기다.'],
    ['꼬마 두더지','그럼 할배 일 끝나면\n정은 내가 맨날 거기 꽂아 둘게!'],
    ['너구리','(할배가 정 끝으로 받침돌 모서리를 몇 번 쪼아\n정이 꼭 들어갈 홈을 냈다.)'],
    ['꼬마 두더지','고마워. 이거 너 줘.\n땅 파다 찾았어. 다람쥐가 묻고 잊었나 봐.'],receiveItem('acorn',2)
  ],()=>{
    F.dolMoleChisel=2;Sound.stone('tap');
    finish('dol_mole','꼬마 두더지가 할배 눈이 걱정돼 감춘 정을 같이 돌려드렸다. 정 자리를 늘 같은 데 두자고 하니 할배가 받침돌에 홈을 팠다. 꼬마는 일이 끝나면 정을 거기 꽂아 두기로 했다. 꼬마가 땅을 파다 찾은 도토리를 주었다.')();
  });
}
Rg.moleChiselReturn=chiselReturn;
moleChiselPic.sound='pic_mole_chisel';   // 결정 D-483: 대사 그림 소리 (popup_sounds.csv)

function warmFrog(){
  talk([
    ['움츠린 개구리','돌 틈에서 겨울잠을 자려 했는데…\n고드름 녹은 물이 등을 적셨어.'],
    ['움츠린 개구리','석수들이 두고 간 화로는 식어 가고.\n저 넓적한 돌만 아직 온기가 남았네.'],
    ['너구리','이 돌, 미지근해요.\n젖은 자리 말고 이 위로 올라오실래요?'],
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

/* 결정 D-273: 늙은 까치 바람막이 장면 (사용자 지시 2026-11-02). 돌담 밑, 오른쪽에서 눈바람이 분다.
   아이가 바람 오는 쪽으로 걸어와 앉고 보따리를 세운다. 그 뒤로 눈발은 아이 등과 보따리에 막혀 떨어지고,
   떨던 까치는 부푼 깃이 가라앉고 한쪽 발을 깃 속에 넣은 채 눈을 가늘게 감는다. draw(w,h,초)는 64×44 칸. */
function magpieWindPic(){
  let t0=null;
  const flakes=Array.from({length:22},(_,i)=>({y:4+((i*37)%34),sp:22+((i*13)%17),ph:(i*0.173)%1}));
  return {animate:true,draw(w,h,t){
    if(t0===null)t0=t;
    const k=t-t0,move=Math.min(1,k/0.9),ease=move*move*(3-2*move),calm=Math.min(1,Math.max(0,(k-0.9)/1.6));
    // 하늘과 돌담
    R(0,0,w,h,'#c9d4d6');R(0,0,w,6,'#b8c6cc');
    for(let row=0;row<4;row++){const y=8+row*6,off=row%2?5:0;
      for(let x=-off;x<w;x+=11){R(x,y,10,5,row%2?'#8d918c':'#9a9d97');R(x,y,10,1,'#b3b6af');R(x,y+4,10,1,'#6f736e');}}
    R(50,14,3,5,'#5b5f5b');R(51,15,1,3,'#3f433f');   // 담 틈 (바람이 새는 곳)
    // 눈 쌓인 바닥
    R(0,34,w,10,'#e8eeee');R(0,34,w,1,'#ffffff');for(let x=3;x<w;x+=9)R(x,36+(x%3),3,1,'#cfd9da');
    // 아이: 오른쪽 밖에서 바람 오는 쪽 자리로 걸어와 앉는다(왼쪽을 본다)
    const hx=Math.round(34+(1-ease)*20),sit=ease>=1;
    // 세운 보따리 (바람막이)
    if(ease>0.6){const bx=hx+7;R(bx,23,8,12,'#d9a441');R(bx,23,8,1,'#e8bd62');R(bx+2,21,4,2,'#b07d26');
      for(const [dx,dy] of [[1,26],[4,29],[2,32],[6,27]])R(bx+dx,dy,1,1,'#8a3b2a');}
    // 꼬리
    R(hx+4,32,6,3,'#6f6357');R(hx+6,32,1,3,'#2a211b');R(hx+8,32,1,3,'#2a211b');
    // 몸 (앉으면 낮아진다)
    const by=sit?27:25;R(hx-4,by,9,35-by,'#8c8070');R(hx-4,by+2,3,35-by-3,'#cfc3b2');
    // 등 털이 바람에 날린다
    if(Math.floor(k*6)%2)R(hx+5,by+1,1,2,'#a89c8c');else R(hx+5,by+2,1,2,'#a89c8c');
    // 머리·얼굴 (왼쪽, 까치 쪽)
    const hy=by-8;R(hx-6,hy,9,8,'#8c8070');R(hx-6,hy+3,8,2,'#2a211b');R(hx-4,hy+3,1,1,'#ffffff');
    R(hx-7,hy+5,4,2,'#efe6d6');R(hx-7,hy+5,1,1,'#2a211b');R(hx-4,hy-1,2,1,'#2a211b');R(hx+1,hy-1,2,1,'#2a211b');
    // 모자
    R(hx-9,hy-2,14,2,'#c39b55');R(hx-6,hy-6,8,4,'#dcbb7a');R(hx-6,hy-3,8,1,'#6e4f22');
    if(!sit){R(hx-3,35,2,1,'#2a211b');R(hx+1,35,2,1,'#2a211b');}else{R(hx-4,34,3,1,'#2a211b');R(hx+1,34,3,1,'#2a211b');}
    // 까치: 돌담 밑에 웅크렸다(오른쪽, 아이 쪽을 본다)
    const shiver=calm<1&&Math.floor(k*14)%2?1:0,mx=14+shiver;
    R(mx-9,30,8,2,'#22303a');R(mx-11,32,4,1,'#22303a');               // 긴 꼬리
    R(mx-3,26,9,7,'#1c2228');R(mx,29,6,4,'#eef1f2');R(mx-3,28,4,2,'#eef1f2');   // 몸·흰 배·어깨 흰 깃
    R(mx+3,22,5,5,'#1c2228');R(mx+4,22,2,1,'#5a6670');                 // 머리 (희끗한 정수리)
    const eyeShut=calm>0.8;R(mx+6,24,1,1,eyeShut?'#3a4650':'#9aaab6');R(mx+8,24,2,1,'#3a3a3a');   // 다 가라앉으면 눈을 가늘게 감는다
    R(mx,33,1,2,'#3a3a3a');if(calm<0.6)R(mx+3,33,1,2,'#3a3a3a');        // 한쪽 발을 깃 속에 넣는다
    // 바람에 부푼 깃 (아이가 막아 줄수록 가라앉는다)
    const ruffle=1-calm;
    if(ruffle>0.05)for(let i=0;i<5;i++){if(((i*7+Math.floor(k*10))%5)/5>ruffle)continue;R(mx-3+i*2,25-(i%2),1,1,'#2b3640');}
    // 눈발: 오른쪽에서 왼쪽으로. 아이와 보따리 높이로 오는 것은 막혀 떨어진다
    const wall=hx+(ease>0.6?15:5),guard=hy-2;
    for(const f of flakes){
      const span=w+10,x=w+4-((f.ph*span+k*f.sp)%span);
      const blocked=ease>0.6&&f.y>guard&&x<wall;   // 자리를 잡고 나면 아이 키보다 낮게 오는 눈은 등 너머(까치 쪽)로 못 간다
      if(blocked){const drop=Math.min(6,(wall-x)*0.5);if(drop<6)R(wall,Math.min(34,f.y+drop),1,1,'#ffffff');continue;}
      const yy=f.y+Math.sin((k+f.ph)*3)*1.2;
      R(Math.round(x),Math.round(yy),1,1,'#ffffff');
      if(f.sp>30)R(Math.round(x)+1,Math.round(yy),1,1,'rgba(255,255,255,.55)');
    }
    // 바람 줄: 아이 등 뒤에서 끊긴다
    for(let i=0;i<3;i++){const y=12+i*7,x0=w-((k*40+i*17)%30);const x1=Math.max(y>guard?wall:0,x0-9);if(x0>x1)R(x1,y,x0-x1,1,'rgba(255,255,255,.6)');}
    // 막힌 눈이 보따리 밑에 조금씩 쌓인다
    if(ease>0.6){const pile=Math.min(3,Math.floor(k*1.2));if(pile)R(wall-1,35-pile,3,pile,'#ffffff');}
  }};
}
function restMagpie(){
  // 다른 지역 기록은 읽기만 한다. 바로가기를 실제 배달 기억으로 바꾸지 않는다.
  const home=knows('home:galchamgol');
  const met=!!G.f.wanderersDone?.['galchamgol:old_magpie'];
  talk([
    ['늙은 까치',home?'아가, 또 만났구나.\n네가 보낸 것, 네 엄마 손에 잘 쥐여 주었단다.':met?'아가, 또 만났구나.\n걱정 마시라던 네 말, 네 엄마한테 전했단다.':'그 모자… 혹시 단풍골 개울 아래 초가 아이냐?\n나는 그 골짜기에 약 나르던 까치란다.'],
    ['늙은 까치','이 고개는 해마다 높아지는구나.\n…고개가 아니라 내 날개가 낮아진 게지.'],
    ['너구리','그럼 여기서 좀 쉬어 가세요.'],
    ['늙은 까치','그럼 저 돌담 밑에 잠깐 앉자꾸나.\n담에 틈이 나서 바람이 새는구나.',[
      {t:'바람 오는 쪽에 앉아 까치를 가려 준다',go:()=>talk([
        // 결정 D-273: 아이가 바람을 막아 주는 장면 그림. 앉아 있는 동안 떠 있다가 담 틈 이야기에서 내린다.
        Object.assign(['너구리','(까치 앞, 바람 오는 쪽에 앉았다.\n보따리도 세워 바람을 막았다.)'],{pic:magpieWindPic()}),
        ['너구리','(눈발이 등에 톡톡 부딪친다.\n까치가 한쪽 발을 깃 속에 넣는다.)'],
        ['늙은 까치','…바람을 등으로 받는구나.\n어린 것이.'],
        ['늙은 까치','돌쇠 그 양반도 꼭 이 자리에 앉곤 했단다.\n손에 박힌 돌가루를 천천히 털면서.'],
        ['늙은 까치','담이 새면 그 양반이 돌부터 괴었지.\n요새는 눈이 어두워 틈이 안 보이는 게지.'],
        Object.assign(['너구리','(담 틈으로 찬바람이 새어 든다.\n널린 돌 몇 개면 막을 수 있겠다.)'],{pic:null})
      ],magpieHands)},
      {t:'먼저 둘러보고 올게요',go:null}
    ]]
  ]);
}

/* 결정 D-164: 고갯길 길섶의 소원 돌탑 (옛 돌다리 다시 놓기를 대신한다, 사용자 피드백 24).
   반쯤 쌓인 돌탑을 작은 창으로 보이고, 아이가 아빠한테 들은 말을 떠올린 뒤 돌 셋을 얹고 소원을 빈다.
   결정 D-229: 돌 셋을 하나씩 얹는 모습은 저절로 흐르는 장면이다(아래 stackWish). */
const withPic=(line,pic)=>Object.assign(line,{pic});   // 결정 D-152: 대사 줄에 장면 그림
Rg.wishTower=()=>{
  const A=Rg.expansionArt,F=G.f;
  if(F.dolWishTower){
    talk([withPic(['너구리','(맨 위 돌 셋에는 아직\n서리가 앉지 않았다.)'],A.wishTowerPic(3)),
      ['너구리',F.dolHareTower?'(밑동에는 짐꾼 아저씨가 괸 돌도 있다.)':'(아빠도 이 길을 지나며\n돌 하나쯤 얹었을까.)']]);
    return;
  }
  talk([withPic(['너구리','(길섶에 돌탑 하나가 서 있다.\n허리께까지 쌓이다 멈췄다.)'],A.wishTowerPic(0)),
    ['너구리','(어릴 때 아빠 손을 잡고 걷다가\n이런 돌탑 앞에서 멈춘 적이 있다.)'],
    ['너구리','(아빠는 작은 돌 하나를 얹으며 그랬다.\n돌탑을 쌓으면 소원이 이뤄진다고.)'],
    ['너구리','…나도 쌓아 볼까.',[
      {t:'돌을 골라 얹는다',go:stackWish},
      {t:'나중에 다시 올게',go:null}]]]);
};
/* 결정 D-229: 소원 돌탑 얹기는 미니게임이 아니라 저절로 흐르는 장면이다 (사용자 지시 2026-11-01, 확정 D-88·기획서 §6 손일은 미니게임 없이).
   아이가 돌 하나를 들어 맨 위로 옮기고, 잠깐 멈칫한 뒤 살며시 내려놓는다. 셋을 다 얹으면 소원을 빈다. 입력도 실패도 없다.
   시간은 tuning.csv wish_anim_*. 움직임 줄이기에서는 절반. */
const TU=TABLES.TUNING,WS_W=64,WS_H=50,WS_SCALE=5,WS_CX=32,WS_GROUND=46;
// 결정 D-214: 돌마다 짧은 혼잣말 한 줄.
// 결정 D-733: 작은 돌이라 한 손으로 집는다. 산양·고라니 모습이면 입에 물고 내려놓는다 (art.js carryHand).
const WS_HINT_HAND=['(길섶에서 주운 납작한 돌. 한 손으로 집어 맨 위 한가운데에, 살며시.)','(하나 더. 흔들리지 않게 손끝으로.)','(마지막 작은 돌. 까치발을 들었다.)'];
const WS_HINT_MOUTH=['(길섶에서 주운 납작한 돌을 입에 물었다. 맨 위 한가운데에, 살며시.)','(하나 더. 흔들리지 않게 고개를 천천히.)','(마지막 작은 돌. 목을 길게 뺐다.)'];
// 결정 D-1006: 수달도 입에 물고 내려놓는다 (고라니는 옛 저장용으로 남긴다)
const mouthForm=()=>['goat','deer','otter'].includes(G.form);
const wsHintFor=n=>(mouthForm()?WS_HINT_MOUTH:WS_HINT_HAND)[n];
const wsP=el('div','forge');wsP.id='dolWishStack';wsP.hidden=true;
wsP.innerHTML='<h2>소원 돌탑</h2><canvas id="dolWishStackCv" width="'+WS_W*WS_SCALE+'" height="'+WS_H*WS_SCALE+'" style="display:block;width:min(100%,320px);height:auto;margin:0 auto;image-rendering:pixelated;border:2px solid var(--meok);border-radius:3px"></canvas>'
  +'<div class="fhint" id="dolWishStackHint"></div>';
$('shell').appendChild(wsP);
const wsBuf=document.createElement('canvas');wsBuf.width=WS_W;wsBuf.height=WS_H;
let ws=null;
const wsTop=()=>Rg.expansionArt.wishStackTop(WS_GROUND,ws.n);
// 결정 D-230: 새로 얹는 돌은 늘 같은 자리(가운데·오른쪽 1px·가운데)에 앉는다. 반쯤 쌓인 탑의 맨 윗돌은 가운데에서 왼쪽으로 1px (art.js TOWER_ROWS).
const wsAim=n=>WS_CX+Rg.expansionArt.TOWER_OFFS[n];
const wsSupport=()=>ws.n?wsAim(ws.n-1):WS_CX-1;
const wsFrames=id=>Math.max(1,Math.round(TU[id]*(Vfx.reducedMotion?0.5:1)));
const wsEase=k=>k*k*(3-2*k);
function wsHint(t){$('dolWishStackHint').textContent=t;}
function wsSpawn(){
  const side=ws.n%2?1:-1,from=wsSupport()+side*TU.wish_anim_side;
  ws.stone={x:from,y:4,from,paws:true};ws.phase='carry';ws.t=0;wsHint(wsHintFor(ws.n));
}
function wsPaint(){
  const g=wsBuf.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,WS_W,WS_H);
  const saved=ctx;ctx=g;try{Rg.expansionArt.wishStackPaint(WS_W,WS_H,{n:ws.n,offs:ws.offs,cx:WS_CX,ground:WS_GROUND,stone:ws.stone});}finally{ctx=saved;}
  const c=$('dolWishStackCv').getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,WS_W*WS_SCALE,WS_H*WS_SCALE);c.drawImage(wsBuf,0,0,WS_W*WS_SCALE,WS_H*WS_SCALE);
}
function wsStep(){
  if(!ws||wsP.hidden)return;
  const b=ws.stone,hover=()=>wsTop()-TU.wish_anim_hover;ws.t++;
  if(ws.phase==='carry'){
    // 옆에서 들어 맨 위 돌 바로 위로 옮긴다
    const k=wsEase(Math.min(1,ws.t/wsFrames('wish_anim_carry_frames')));
    b.x=b.from+(wsAim(ws.n)-b.from)*k;b.y=4+(hover()-4)*k;
    if(k>=1){ws.phase='pause';ws.t=0;}
  }else if(ws.phase==='pause'){
    // 내려놓기 전에 잠깐 멈칫한다
    if(ws.t>=wsFrames('wish_anim_pause_frames')){ws.phase='lower';ws.t=0;}
  }else if(ws.phase==='lower'){
    const k=wsEase(Math.min(1,ws.t/wsFrames('wish_anim_lower_frames')));
    b.y=hover()+TU.wish_anim_hover*k;
    if(k>=1){
      ws.offs.push(Rg.expansionArt.TOWER_OFFS[ws.n]);ws.n++;ws.stone=null;Sound.stone('place');
      ws.phase=ws.n>=3?'done':'settle';ws.t=0;
      if(ws.n>=3)wsHint('(돌 셋이 나란히 올라앉았다.)');
    }
  }else if(ws.phase==='settle'){
    if(ws.t>=wsFrames('wish_anim_settle_frames'))wsSpawn();
  }else if(ws.phase==='done'){
    if(ws.t>=wsFrames('wish_anim_done_frames')){finishWishStack();return;}
  }
  wsPaint();
}
function stackWish(){
  ws={n:0,offs:[],stone:null,phase:'carry',t:0};
  suppressHeldInputs();wsSpawn();wsP.hidden=false;wsPaint();
}
function finishWishStack(){
  const A=Rg.expansionArt;
  wsP.hidden=true;ws=null;
  talk([withPic(['너구리',mouthForm()?'(돌탑 앞에서 눈을 감았다.)':'(두 손을 모았다.)'],A.wishTowerPic(3)),
    ['너구리','아빠를… 빨리 만나게 해 주세요.']],()=>{
    G.f.dolWishTower=true;
    diary('dol_wish_tower','고갯길 돌탑에 돌 셋을 얹었다. 아빠가 그랬다. 돌탑을 쌓으면 소원이 이뤄진다고. 아빠를 빨리 만나게 해 달라고 빌었다.');
  });
}
defineMinigame({id:'dolWishStack',step:wsStep,hit:()=>{}});
// QA가 장면이 어디까지 흘렀는지 읽는다 (읽기만 한다)
Rg.wishStackState=()=>ws&&{phase:ws.phase,n:ws.n};
/* 짐꾼은 등짐을 고쳐 맨 뒤 짐 괴던 돌을 이 돌탑에 보탠다(hareHands). 아이가 돌을 얹은 뒤 만나면 돌탑 옆에서 말한다. */
function hareTower(){
  talk([['산토끼 짐꾼','맨 위에 서리 안 앉은 돌 셋,\n네가 얹은 거지?'],
    ['너구리','네. 아빠 빨리 만나게 해 달라고요.'],
    ['산토끼 짐꾼','그럼 짐 괴던 돌로\n밑을 한 번 더 받쳐 둘게.'],
    ['산토끼 짐꾼','짐 동무 소원이 기울면 안 되지.']],()=>{
    G.f.dolHareTower=true;
    diary('dol_hare_tower','짐꾼 아저씨가 짐 괴던 돌로 내 소원 돌탑 밑동을 받쳐 주었다.');
  });
}
// 결정 D-135: 꼬마의 속마음은 꼬마에게 듣는다(할배 dolsoe4를 본 뒤. D-891).
function moleAsk5(){
  // 결정 D-580: 해야 할 말만 (할배 손이 무서운 까닭, 엄마와 적는 일, 대신 기억하기).
  arcScene('dolneomeo_arc_dolsoe5',[
    ['너구리','할배가 돌 읽는 법 가르쳐 준대.\n왜 도망가?'],
    ['꼬마 두더지','눈 감고 돌 만지는 할배 보면…\n그거 배우면 할배가 진짜 안 보이게 될 것 같아.'],
    ['너구리','우리 엄마도 말을 자꾸 잊어.\n그래서 나는 적어. 잊어도 다시 볼 수 있게.'],
    ['꼬마 두더지','…그럼 할배 손은, 내가 대신 기억하면 돼?']
  ],'꼬마 두더지는 할배 눈이 정말 멀까 봐 손으로 돌 읽기를 피해 왔다. 엄마 이야기를 해 줬더니 할배 손을 대신 기억하겠다고 했다.');
}
// 완료 길손의 인사 뒤에도 새 행동을 열 수 있도록 이 지역의 만남만 가로챈다.
function returningHare(e){
  if(REG!==Rg||paused())return;
  const p=nearInteraction();
  const mail=p?.id==='dol_magpie'&&has('darae_yak')&&!G.f.yakMade;
  const returning=p?.id==='dol_hare'&&G.f.dolWishTower&&G.f.dolneomeo_pack_help&&!G.f.dolHareTower;   // 결정 D-164
  // 결정 D-135·D-891: 할배에게 꼬마 얘기를 들은 뒤(dolsoe4. 돌 쌓기를 기다리지 않는다), 이미 인사한 꼬마에게 말을 걸면 속마음 막이 열린다.
  const moleAsk=p?.id==='dol_mole'&&Rg.arcs()&&!!G.f.wanderersDone?.['dolneomeo:dol_mole']&&G.f.dolneomeo_arc_dolsoe4&&!G.f.dolneomeo_arc_dolsoe5;
  if(!mail&&!returning&&!moleAsk)return;
  e.preventDefault();e.stopImmediatePropagation();if(e.type==='keydown')suppressedKeys.add(e.key.toLowerCase());
  if(returning){hareTower();return;}
  if(moleAsk){moleAsk5();return;}
  // 결정 D-1005: 까치가 약즙을 알아보기 전에 아이가 먼저 꺼내 보인다 (보따리 속 약을 까치가 어떻게 아나)
  talk([['너구리','(보따리에서 약즙 통을 꺼내 보였다.)\n서리다래로 제가 갈았어요.'],['늙은 까치','네 손으로 만든 약이로구나.\n이건 내가 꼭 날라 주마.',[
    {t:'약즙을 맡긴다 · 큰 장터로 떠날 준비',go:()=>Rg.sendMedicine()},
    {t:'마을을 조금 더 둘러볼게요',go:null}]]]);
}
addEventListener('keydown',e=>{if(!e.repeat&&['e','enter'].includes(e.key.toLowerCase())&&!e.target?.matches?.('input,textarea,select'))returningHare(e);},true);
$('padTalk').addEventListener('pointerdown',returningHare,true);$('prompt').addEventListener('click',returningHare,true);


/* 결정 D-1010: 살펴보기 작은 그림을 그 대사가 말하는 것으로 그린다 (사용자 피드백 2026-11-06 34: 그림과 말이 안 맞는다).
   예전엔 필드를 잘라 키운 그림이라, 화로는 밥그릇으로, 고드름 물줄기는 물웅덩이로, 이끼 테는 민 돌로 보였다.
   엔진(PA-229)이 살펴보기의 pic(64×44 그리기, 또는 {draw,animate})을 잘라 보기 대신 띄운다. 필드 잘라 보기가 대사와 맞는 곳(풍경·소원 천·제기·둥지 문턱·그루터기)은 그대로 둔다. */
function frostPrintPic(w,h){
  R(0,0,w,h,'#c9d6da');R(4,8,56,30,'#7f8b8b');R(5,9,54,1,'#a2aeac');R(4,37,56,1,'#5f6b6b');
  for(let i=0;i<80;i++)R(5+((i*37)%53),10+((i*13)%26),1,1,'#eef4f2');   // 하얀 서리
  // 서리가 녹아 까맣게 남은 발바닥 자리. 디딜 때마다 비빈 듯 끝이 번졌다
  for(const [x,y] of [[10,27],[21,18],[32,26],[43,17]]){R(x,y,5,7,'#3e4746');R(x+1,y-2,3,2,'#3e4746');R(x+1,y+1,3,4,'#4c5654');R(x+5,y+2,2,3,'#59625f');}
}
function channelPic(){
  return {animate:true,draw(w,h,t){
    R(0,0,w,h,'#c9d4d6');R(0,32,w,12,'#9aa19a');
    R(0,17,w,5,'#848c86');R(0,17,w,1,'#b3bab2');R(0,28,w,5,'#848c86');R(0,32,w,1,'#5e6660');   // 돌 홈 위아래 턱
    for(let x=0;x<w;x+=11){R(x,17,1,5,'#6a726c');R(x+5,28,1,5,'#6a726c');}
    R(0,22,w,6,'#7fa3ad');
    const s=Math.floor(t*14)%12;for(let x=-12+s;x<w;x+=12){R(x,23,4,1,'#d9eaee');R(x+6,26,3,1,'#b6d0d6');}   // 흐르는 물
    for(let i=0;i<9;i++){R(34+i*3,15-(i%2),2,15,'#cdb57a');R(34+i*3,15,2,1,'#e6d39a');}R(33,23,28,1,'#a8925a');   // 얼지 말라고 덮은 짚
  }};
}
function millEdgePic(w,h){
  R(0,0,w,h,'#d8d6c8');R(0,38,w,6,'#a39b8a');
  R(6,24,52,14,'#7f8682');R(6,24,52,2,'#a9b0aa');R(6,36,52,2,'#5c6260');   // 받침돌
  R(40,26,16,10,'#9aa39e');R(42,27,12,1,'#d0d6cf');R(43,30,9,1,'#c2c9c2');   // 한쪽만 매끈하다
  for(const [x,y] of [[10,28],[16,32],[22,27],[28,33],[13,35]])R(x,y,2,1,'#5e6562');   // 거친 정 자국
  R(16,12,32,10,'#8b918b');R(16,12,32,2,'#b8beb6');R(16,21,32,1,'#5e6562');R(30,8,4,4,'#6d5a3c');   // 맷돌 윗돌과 어처구니
  for(const [x,y] of [[20,16],[24,18],[38,16],[42,18]]){R(x,y,2,2,'#e9f1f0');R(x,y,1,1,'#b5d6e4');}   // 자개 발자국
  if(G.f.ppuriPassed)for(const [x,y] of [[18,22],[26,23],[44,22],[50,23]])R(x,y,2,1,'#f2efe4');   // 내가 간 메밀가루
}
function hearthPic(){
  return {animate:true,draw(w,h,t){
    R(0,0,w,h,'#c6d0cc');R(0,34,w,10,'#8e958c');
    R(10,26,44,10,'#6e7670');R(10,26,44,2,'#a5aca4');R(12,34,40,2,'#4f5651');   // 둘레 돌
    R(14,22,36,6,'#8e8c86');R(16,21,32,2,'#b3b0a8');   // 재
    R(18,19,7,5,'#857a6c');R(28,18,8,6,'#7c7366');R(39,19,7,5,'#857a6c');R(19,19,5,1,'#a99a86');R(29,18,6,1,'#a99a86');R(40,19,5,1,'#a99a86');   // 재 속 돌
    const f=Math.floor(t*5)%3;R(24+f,24,2,1,'#c9764a');R(35-f,25,2,1,'#b9643c');R(30,23,1,1,f===1?'#e8a060':'#a05a38');   // 꺼져 가는 불씨
    for(let i=0;i<3;i++){const yy=Math.round(15-((t*8+i*5)%10));R(20+i*10+Math.round(Math.sin(t*3+i)*1.5),yy,3,1,'#eef0e8');}   // 아른거리는 온기
  }};
}
function reedsPic(w,h){
  R(0,0,w,h,'#d3d6c8');R(0,36,w,8,'#9d987c');
  for(let i=0;i<6;i++)R(6+i*2,8,1,28,i%2?'#e2d6b6':'#cbbd98');R(5,7,13,2,'#f2ead2');R(5,15,13,2,'#8a6e45');R(5,27,13,2,'#8a6e45');   // 긴 억새 단
  R(28,14,8,22,'#5e6a5c');R(30,10,4,4,'#4c584c');R(30,8,4,2,'#8a6a45');   // 참기름 병
  for(let i=0;i<5;i++)R(27+i*2,18,1,18,i%2?'#e2d6b6':'#cbbd98');R(26,22,12,1,'#8a6e45');R(26,30,12,1,'#8a6e45');   // 병을 싼 긴 억새
  for(let i=0;i<7;i++)R(44+i*2,28-(i%3),1,8+(i%3),i%2?'#d9cba8':'#c2b48e');R(46,25,1,3,'#e8dcc0');R(52,24,2,1,'#e8dcc0');R(43,33,16,2,'#8a6e45');   // 짧고 꺾인 억새도 묶어 둔다
}
function lichenPic(w,h){
  R(0,0,w,h,'#b9c4c3');R(4,6,56,34,'#6f7a79');R(4,6,56,2,'#93a09e');
  const ring=(cx,cy,r,c)=>{for(let a=0;a<28;a++)R(Math.round(cx+Math.cos(a/28*Math.PI*2)*r),Math.round(cy+Math.sin(a/28*Math.PI*2)*r*.8),1,1,c);};
  ring(20,21,9,'#c9d4cc');ring(20,21,6,'#aebdb4');ring(20,21,3,'#d8e1da');ring(44,28,7,'#c9d4cc');ring(44,28,4,'#aebdb4');ring(34,13,3,'#c9d4cc');   // 은빛 이끼 테
  for(let i=0;i<30;i++)R(6+((i*29)%52),8+((i*11)%30),1,1,'#eef4f2');
}
function tricklePic(){
  return {animate:true,draw(w,h,t){
    R(0,0,w,h,'#c4ced0');R(0,0,w,14,'#6a7574');R(0,12,w,2,'#93a09e');R(28,0,6,14,'#4f5a5a');   // 물이 흐르던 홈
    for(const [x,l] of [[22,10],[26,16],[30,22],[34,14],[38,9]]){R(x,14,3,l,'#d9ecf3');R(x+1,14,1,l,'#ffffff');R(x+1,14+l,1,2,'#b7d3df');}   // 가는 고드름
    const k=(t%2)/2,yy=k<.6?38:38+(k-.6)*12;R(31,Math.min(39,Math.round(yy)),1,2,'#a9d0e0');   // 한 방울씩 녹는다
    R(0,40,w,4,'#7c8786');R(25,40,14,1,'#55646c');   // 아래 바위 틈이 젖는다
  }};
}
function crackPic(w,h){
  R(0,0,w,h,'#b7c3c3');R(2,4,60,38,'#6c7877');
  for(let i=0;i<40;i++){const x=3+((i*31)%58);if(Math.abs(x-30)>5)R(x,5+((i*7)%36),1,1,'#eef4f2');}   // 바깥엔 서리, 틈 안쪽엔 없다
  for(let y=4;y<42;y++){const cx=30+Math.round(Math.sin(y/5)*3),half=y<10||y>36?1:3;R(cx-half,y,half*2+1,1,'#26302f');}
  if(G.f.dolneomeo_frog_warm){const x=29+Math.round(Math.sin(24/5)*3);R(x,24,3,3,'#a33a2a');R(x-1,22,1,1,'#a33a2a');R(x+1,21,1,1,'#a33a2a');R(x+3,22,1,1,'#a33a2a');R(x+4,24,1,1,'#a33a2a');}   // 붉은 발자국
}
function lowTowerPic(w,h){
  R(0,0,w,h,'#c7d0c7');R(0,36,w,8,'#8d968d');
  const st=(x,y,ww,hh,c)=>{R(x,y,ww,hh,c);R(x+1,y,ww-2,1,'#e9eee6');};
  st(18,28,28,8,'#7f8a86');st(22,21,20,7,'#8a9590');st(26,15,12,6,'#7f8a86');st(29,10,6,5,'#8a9590');
  for(const [x,y] of [[16,33],[45,33],[20,26],[41,26],[25,19]])R(x,y,3,2,'#a2aaa4');   // 밑돌 틈마다 받친 작은 돌
  if(G.boss.dead){st(4,30,12,6,'#6e7973');st(50,29,12,7,'#6e7973');st(8,25,7,5,'#7a8580');}   // 내려앉은 큰 돌들이 받친다
}
/* 조사점마다 손에 닿는 물건을 그린다. 장식 발판과 혼동되지 않도록 모두 무릎 아래다. */
function drawThing(kind,x,y){
  x=Math.round(x);y=Math.round(y);
  if(kind==='none')return;   // 결정 D-1008: 경치가 이미 그리는 것(공동 화로)은 덧그리지 않는다
  if(kind==='stalk'){
    R(x-5,y-13,1,13,'#a39478');R(x+1,y-17,1,17,'#b4a58a');R(x-8,y-14,5,3,'#d3ccb6');R(x-1,y-18,5,3,'#e1dcc9');
  }else if(kind==='cloth'){
    R(x,y-21,2,21,'#665b4e');R(x-8,y-18,10,9,'#b3aaa0');R(x-7,y-17,7,2,'#e2d8c2');R(x-2,y-9,2,3,'#b34735');
  }else if(kind==='bowl'){
    R(x-8,y-5,16,4,'#605d55');R(x-6,y-2,12,2,'#454c4a');R(x-6,y-7,12,2,'#c7b99b');R(x-3,y-8,6,1,'#e6dbc0');
  }else if(kind==='water'){
    R(x-14,y-2,28,2,'#a1c1ca');R(x-10,y-1,20,1,'#e0edf0');R(x-15,y-4,4,4,'#687b7f');R(x+12,y-5,4,5,'#687b7f');
  }else if(kind==='bell'){
    // 결정 D-261: 풍경은 바람에 흔들리고 추는 반대로 늦게 따라간다 (살펴보기 작은 창 안에서도)
    const a=Vfx.reducedMotion?0:G.anim*.09,s=Math.round(Math.sin(a)*1.6),k=Math.round(Math.sin(a-1.1)*2.2);
    R(x,y-23,1,13,'#77776a');R(x+Math.round(s/2),y-11,1,2,'#77776a');R(x-3+s,y-10,7,6,'#9e9d83');R(x-4+s,y-5,9,2,'#cfbf8c');R(x+s+k,y-2,1,2,'#665b4e');R(x+s+k,y,1,3,'#b9b08a');
  }else{
    R(x-10,y-6,20,6,'#747f7d');R(x-8,y-8,15,3,'#9da7a1');R(x-6,y-8,6,1,'#e2ece5');R(x+5,y-4,3,3,'#698470');
  }
}
const examine=(id,x,label,kind,text,y=GROUND,pic)=>({id,x,y,label,text,draw:(sx,sy)=>drawThing(kind,sx,sy),...(pic?{pic}:{})});
const stamp=(id,x,y)=>({id,x,y,note:'stamp:dolneomeo:'+id});
Rg.expansionContent=()=>({
  gate:{
    examines:[
      examine('frost_print',280,'서리 자국 살펴보기','stone','돌 위는 하얗고 발바닥 자리는 까맣다.\n먼저 지나간 짐꾼도 발을 비볐나 봐.',GROUND,frostPrintPic),
      examine('gate_bell',1240,'장승 풍경 들어 보기','bell','바람이 불 때마다 얇은 쇳소리가 난다.\n산 안쪽에서도 이 소리가 들릴까?'),
    ],
    wanderers:[{id:'dol_hare',name:'산토끼 짐꾼',hint:'길 저편에서 무거운 등짐에 끙끙대는 소리가 들린다.',get x(){const x=G?.f.dolneomeo_pack_help&&G.f.dolWishTower?1860:940;   /* 결정 D-164: 짐 괸 돌을 보태러 돌탑 곁으로 */return CLASSIC?x:trimX(x,Rg.trimCuts?.gate);}   /* 결정 D-128: 접근자 자리도 줄인 고갯길 좌표로 */,draw:drawGuest('hare'),talk:helpHare,greeting:'낮게 묶으니 발이 편하구나.\n고개 안쪽 길은 꼭 살피고 가라.'}],
    stamps:[stamp('jangseung',1722,174)]   // 결정 D-1008: 장승 뒤 낮은 받침(1692, 높이 174)에 찍힌다
  },
  village:{
    examines:[
      examine('stone_channel',480,'돌 물길 들여다보기','water','집집마다 돌 홈을 이어 물을 나눠 쓴다.\n얼지 말라고 짚도 조금 덮어 뒀네.',GROUND,channelPic()),   // 결정 D-1008: 첫 집 벽 밑(360)에서 집 앞 길로
      {...examine('mill_edge',1310,'마당 맷돌 받침 만져 보기','stone','',GROUND,millEdgePic),get text(){
        return G.f.ppuriPassed?'내가 간 가루로 장승 앞 금줄이 걷혔다.\n맷돌 자개 틈에도 메밀 냄새가 남아 있다.':'받침돌 한쪽만 유난히 매끈하다.\n맷돌 밑에서도 먼 길을 온 돌 냄새가 난다.';
      }},
      examine('warm_hearth',2290,'공동 화로 살펴보기','none','석수들이 일을 마치고 손을 녹이는 화로다.\n재 속 돌은 불이 꺼진 뒤에도 미지근하다.',GROUND,hearthPic())
    ],
    wanderers:[
      {id:'dol_mole',name:'꼬마 두더지',hint:'달그락, 달그락. 누가 돌멩이를 굴리며 노는 소리가 난다.',get x(){const x=G?.f.dolMoleChisel===1?1020:740;   /* 결정 D-735: 정을 돌려드리러 할배 곁으로 */return CLASSIC?x:trimX(x,Rg.trimCuts?.village);},draw:drawGuest('mole'),talk:meetMole,greeting:'정은 받침돌 홈에 꽂아 뒀어!\n할배가 손만 뻗으면 돼.'},
      {id:'dol_magpie',name:'늙은 까치',x:2080,draw:drawGuest('magpie'),talk:restMagpie,greeting:'바람막이야, 좀 쉬어 가거라.\n담 뒤는 바람이 덜하단다.'}
    ],
    stamps:[{...stamp('mill_base',1160,156),base:'none',face:-12}]   // D-116: 맷돌 그림 앞면에 바로 찍는다(받침 겹침 없음)
  },
  field:{
    examines:[
      examine('memil_stubble',390,'메밀 그루터기 살펴보기','stalk','메밀을 거둔 자리마다 짧은 줄기가 섰다.\n돌 사이에 떨어진 알은 아직 단단하다.'),
      examine('tied_reeds',1120,'억새 묶음 살펴보기','stalk','긴 억새는 병을 싸고 짧은 억새는 둥지에 깐다.\n꺾인 것도 버리지 않는구나.',GROUND,reedsPic),
      {...examine('nest_door',1590,'둥지 앞 작은 돌 살펴보기','stone',''),get text(){return G.f.dolneomeo_arc_kku7?'억새로 묶은 그림이 문턱 돌에 괴어 있다.\n봄에 눈을 뜨면 제일 먼저 보일 자리다.':G.f.kkuDone?'내가 벤 억새 끝이 둥지 틈에서 삐져나왔다.\n바람이 불어도 안쪽은 가만하다.':'둥지 문턱에 납작돌을 비스듬히 세웠다.\n꾸벅이가 졸다가 굴러 나오지 말라고 놨나?';}}
    ],
    wanderers:[{id:'dol_badger',name:'메밀댁',hint:'털썩, 털썩. 메밀밭 쪽에서 도리깨질 소리가 난다.',x:760,draw:drawGuest('mouse'),talk:talkBadgerArc,
      greeting:'보자기 잘 챙겼지?\n길에서 젖지 않게 품에 넣어라.'}],stamps:[]
  },
  cliff:{
    examines:[
      examine('silver_lichen',530,'은빛 바위 살펴보기','stone','서리 아래 이끼가 동그란 테를 그렸다.\n돌은 가만있어도 무늬가 자라는구나.',GROUND,lichenPic),
      examine('frozen_trickle',1850,'얼어붙은 물줄기 살펴보기','water','물이 흐르던 홈에 가느다란 얼음이 매달렸다.\n한 방울씩 녹으면 아래 바위 틈이 젖겠다.',GROUND,tricklePic()),
      // 결정 D-1009: 갈라진 바위는 골렘 뒤에 깔리는 높은 턱(138) 위다. 턱이 없을 땐 돌이 허공에 떠 보였다. 턱이 있을 때만 그린다
      {...examine('dry_crack',2540,'갈라진 바위 들여다보기','stone','',138,crackPic),draw:(sx,sy)=>{if(G.boss.dead)drawThing('stone',sx,sy);},get text(){return G.f.dolneomeo_frog_warm?'개구리가 말한 마른 바위 틈이다.\n붉은 발자국이 구름바다 쪽을 향한다.':'깊은 틈 안쪽은 서리가 하나도 없다.\n누가 비를 피해 쪼그려 앉았던 걸까?';}}
    ],
    wanderers:[{id:'dol_frog',name:'움츠린 개구리',hint:'돌 틈 어딘가에서 가늘게 떠는 개구리 울음이 들린다.',x:1440,draw:drawGuest('frog'),talk:warmFrog,greeting:'배가 따뜻해졌어… 고마워.\n이번엔 마른 틈에서 잘게.'}],
    stamps:[stamp('cliff_crack',2390)]   // D-116: 골렘 뒤에야 깔리는 턱(112) 대신 절벽 밑 바위에. 턱이 없을 때 허공에 뜨지 않는다
  },
  shrine:{
    examines:[
      examine('wish_cloth',380,'소원 천 살펴보기','cloth','새 천 밑에 색 바랜 천이 겹쳐 달렸다.\n같은 가지에 몇 번의 겨울이 묶였을까?'),
      examine('grain_dish',950,'작은 제기 살펴보기','bowl','돌그릇 안에 메밀가루가 조금 남았다.\n바람이 들어도 깊은 그릇이라 안 날아간다.'),
      {...examine('small_tower',2250,'낮은 돌탑 살펴보기','stone','',Rg.shrineSummitY?.()??GROUND,lowTowerPic),get text(){return G.boss.dead?'큰 돌들이 내려앉아 낮은 탑을 받쳤다.\n작은 돌 하나도 굴러떨어지지 않았다.':'바람이 세도 이 낮은 탑은 흔들리지 않는다.\n밑돌 틈마다 작은 돌을 받쳐 뒀네.';}}
    ],
    wanderers:[{id:'dol_turtle',name:'남생이 할미',hint:'돌 그늘 쪽에서 느릿느릿 돌을 긁는 소리가 난다.',x:560,draw:drawGuest('turtle'),talk:talkTurtleArc,
      greeting:'샘부터 찾으라 했지?\n…네가 맨 천은 아직 잘 매여 있다.'}],stamps:[]
  }
});
for(const [id,content] of Object.entries(Rg.expansionContent())){
  if(Rg.zones?.[id])Object.assign(Rg.zones[id],content);
}
Rg.installExpansion?.();

})();
