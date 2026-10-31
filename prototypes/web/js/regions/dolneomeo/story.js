'use strict';
/* 돌너머 진행: NPC 대화와 교환, 돌쇠 할배의 돌 쌓기, 돌 골렘 전투, 서리다래 약즙 보내기, 지금 할 일.
   결정 D-130: Fable 검수 반영. 뿔이에게 서리다래를 먼저 묻고 꾸벅이에게 보내진다. 뿔이 말버릇은 "규칙이다" 하나.
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
  talk([[name,say,[{t:'하던 이야기 계속하기',go:normal},...choices,{t:'다음에 이야기하기',go:null}]]]);
}
function talkKkuArc(){
  const F=G.f;
  // 결정 D-130: 사연도 고개를 들 때만 말이 통한다. 졸 때는 잠꼬대로 돌아간다.
  if(!Rg.arcs()||!F.kkuDone||!Rg.kkuAwakeNow())return talkKku();
  if(!F.dolneomeo_arc_kku2){
    arcMenu('꾸벅이','잊기 전에… 맡길 말이 있어어…',talkKku,[{t:'무슨 말인데?',go:()=>arcScene('dolneomeo_arc_kku2',[
      ['꾸벅이','봄에 깨면… 들은 말도 다 잊어버려…'],
      ['꾸벅이','그 모자 쓴 아저씨… 지난가을\n할배네서 나온 그 밤에… 둥지 곁에서 잤어…'],
      ['꾸벅이','잠결에 들었어… “미안하다…”'],
      ['꾸벅이','“그 겨울에 내가 없어서…” 그랬어어…'],
      ['꾸벅이','그러니까… 너한테 맡길게에…']
    ],'아빠는 할배네서 떠난 그 밤에 꾸벅이 둥지 곁에서 잤다. 꾸벅이가 그때 들은 아빠의 말을 맡겼다. “미안하다… 그 겨울에 내가 없어서…”')}]);return;
  }
  if(!F.dolneomeo_arc_kku3){
    arcMenu('꾸벅이','그 말… 기억해 줄 거지이…?',talkKku,[{t:'수첩에 적어 둘게',go:()=>arcScene('dolneomeo_arc_kku3',[
      ['너구리','잊어도 괜찮아. 내가 적어 둘게.'],
      ['너구리','(아빠 수첩 다음 장에 이어 적었다.)'],
      ['꾸벅이','그래애… 이제 맘 놓고 졸겠다아…']
    ],'꾸벅이에게 맡은 말을 수첩에 적었다. 꾸벅이는 안심한 얼굴로 다시 꾸벅꾸벅 졸았다.',()=>learn('dolneomeo:arcs-kkubeogi'))}]);return;
  }
  // 결정 D-118: 사연 덧붙임. 꾸벅이는 봄에 깨면 반가워하는 이를 못 알아본다. 글은 못 읽으니 아이가 그림으로 남긴다(D-61 아이의 그림).
  if(!F.dolneomeo_arc_kku4){
    arcMenu('꾸벅이','봄에 깨면… 또 다 잊겠지이…',talkKku,[{t:'봄에 깨면 어떤데?',go:()=>arcScene('dolneomeo_arc_kku4',[
      ['꾸벅이','작년 봄에 깼더니…\n누가 날 보고 막 반가워했어…'],
      ['꾸벅이','근데… 누군지 몰랐어어…'],
      ['꾸벅이','그 애가… 울었어…'],
      ['너구리','누구였는데?'],
      ['꾸벅이','그것도… 잊었어…\n그래서 미안해…'],
      ['꾸벅이','이번 봄엔… 안 잊고 싶어어…']
    ],'꾸벅이는 봄에 깨면 반가워하는 이를 못 알아본다. 작년 봄엔 누군가를 울렸다고 했다.')}]);return;
  }
  if(!F.dolneomeo_arc_kku5&&F.ppuriPassed&&moleMet()){
    arcMenu('꾸벅이','안 잊는 법… 생각해 봤어어…?',talkKku,[{t:'글자 대신 그림은 어때?',go:()=>arcScene('dolneomeo_arc_kku5',[
      ['너구리','꾸벅아, 글은 못 읽지?'],
      ['꾸벅이','응… 글자는… 다 똑같이 생겼어…'],
      ['너구리','그럼 그림으로 남기자.\n봄에 보면 알아볼 수 있게.'],
      ['꾸벅이','그림… 그건 볼 수 있어어…'],
      ['꾸벅이','아… 생각났다…\n울던 애… 반짝돌 갖고 놀던 애…'],
      ['너구리','돌쇠 할배 손주구나.\n돌집 짓는 거 같이 했어.'],
      ['꾸벅이','그 애… 그려 줄래애…?']
    ],'꾸벅이는 글을 못 읽는다. 봄에 알아볼 수 있게 그림으로 남기기로 했다. 작년 봄에 울던 애는 반짝돌을 갖고 놀던 꼬마 두더지였다.')}]);return;
  }
  if(F.dolneomeo_arc_kku5&&!F.dolneomeo_arc_kku6&&G.boss.dead){
    arcMenu('꾸벅이','그림… 그려 왔어어…?',talkKku,[{t:'그려 온 그림을 보여 준다',go:()=>arcScene('dolneomeo_arc_kku6',[
      ['너구리','(수첩 맨 뒤 빈 장을 조심조심 뜯어\n꼬마 두더지를 그렸다. 반짝돌도 크게.)'],
      ['꾸벅이','아… 이 애다아…\n이번엔 안 울리겠다…'],
      ['꾸벅이','근데… 너는…?\n너도 봄에 와…?'],
      ['너구리','나는 아빠 찾으러 더 가야 해.'],
      ['꾸벅이','그럼… 너도 그려 줘…\n모자도…'],
      ['너구리','(꼬마 옆에 내 얼굴을 그리고\n모자를 얹었다.)'],
      ['꾸벅이','그 모자…\n그 아저씨랑 똑같네에…']
    ],'수첩 맨 뒤 빈 장을 뜯어 꾸벅이에게 보여 줄 그림을 그렸다. 꼬마 두더지와 반짝돌, 그 옆에 모자 쓴 내 얼굴. 꾸벅이는 아빠 모자와 똑같다고 했다.')}]);return;
  }
  if(F.dolneomeo_arc_kku6&&!F.dolneomeo_arc_kku7&&F.yakMade){
    arcMenu('꾸벅이','이제… 정말 졸려어…',talkKku,[{t:'그림을 둥지에 달아 줄게',go:()=>arcScene('dolneomeo_arc_kku7',[
      ['너구리','(그림을 억새로 묶어\n둥지 문턱 돌에 괴어 두었다.)'],
      ['꾸벅이','봄에 깨면…\n제일 먼저 보이겠다아…'],
      ['꾸벅이','그 아저씨 말은… 네가 적었고…'],
      ['꾸벅이','이 얼굴들은… 내가 볼게…'],
      ['꾸벅이','이제 정말… 자도 되겠다… 쿨…']
    ],'그림을 억새로 묶어 꾸벅이 둥지 문턱에 괴었다. 봄에 깨면 제일 먼저 보일 자리다.',()=>learn('dolneomeo:kku-drawing'))}]);return;
  }
  talkKku();
}
const moleMet=()=>!!G.f.wanderersDone?.['dolneomeo:dol_mole'];
function talkDolsoeArc(){
  const F=G.f;
  const atYard=!F.dolBridgeCrewHere||G.zone!=='gate'; // 다리 현장에서는 마당 돌탑 이야기를 꺼내지 않는다.
  const sack=Rg.arcs()&&atYard&&F.dolneomeo_badger1&&!F.dolneomeo_badger_sent;   // 결정 D-118: 메밀댁의 햇메밀 자루
  // 결정 D-130: 처음 인사를 나눈 뒤에야 메밀댁 이름을 꺼낸다.
  if(sack&&!F.dolsoeTea&&F.dolsoeMet)return arcMenu('돌쇠 할배','누가 왔느냐.',talkDolsoe,[badgerSack()]);
  if(!Rg.arcs()||!F.dolsoeTea)return talkDolsoe();
  const c=[];
  if(sack)c.push(badgerSack());
  if(atYard&&!F.dolneomeo_arc_dolsoe1)c.push({t:'꼭대기 돌은 누가 올렸어요?',go:()=>arcScene('dolneomeo_arc_dolsoe1',[
    ['돌쇠 할배','(할배가 꼭대기 돌을 두 손으로 감싼다.)'],
    ['돌쇠 할배','먼저 간 우리 할멈이 올린 돌이란다.'],
    ['돌쇠 할배','눈이 이리 됐어도, 이 돌은 날마다 만져 본다.'],
    ['돌쇠 할배','밑을 단단히 괴면, 작은 돌도 안 떨어지지.']
  ],'돌쇠 할배는 먼저 간 아내의 소원 돌을 지킨다. 눈이 어두워진 뒤에도 그 돌만은 날마다 만져 본다고 했다.')});
  else if(F.golemCalm&&knows('like:golem:story_stone')&&!F.dolneomeo_arc_dolsoe2)c.push({t:'아빠의 돌을 올렸어요',go:()=>arcScene('dolneomeo_arc_dolsoe2',[
    ['너구리','아빠의 돌, 대신 올렸어요.'],
    ['돌쇠 할배','(할배가 내 손을 가만히 짚는다.)'],
    // 결정 D-130: 성황당에 가기 전 할배 마당 탑에서 먼저 얹어 보다 손이 떨렸다. 그래서 할배가 그 돌을 갖고 있다.
    ['돌쇠 할배','지난가을 네 아비가 성황당에 가기 전에\n내 마당 탑에서 먼저 얹어 보더구나.'],
    ['돌쇠 할배','손이 떨려 몇 번이고 놓치더니\n그날 밤 두고 떠났지. 내가 맡아 뒀단다.'],
    ['돌쇠 할배','손이 네 아비를 닮았구나. 고맙다.']
  ],'아빠는 성황당에 가기 전 할배 마당 탑에 소원 돌을 얹어 보다, 손이 떨려 못 올리고 두고 떠났다. 그 돌을 대신 올렸다. 돌쇠 할배가 내 손을 짚고 고맙다고 했다.')});
  else if(atYard&&F.dolneomeo_arc_dolsoe2&&!F.dolneomeo_arc_dolsoe3)c.push({t:'엄마 몫도 올려도 돼요?',go:()=>arcScene('dolneomeo_arc_dolsoe3',[
    ['너구리','엄마 몫도 올려도 돼요?'],
    ['돌쇠 할배','이리 오너라. 밑을 받쳐 주마.'],
    ['너구리','(마당의 작은 돌을 골라, 할배 돌탑에 얹었다.)'],
    ['너구리','엄마, 약 보낼게.'],
    ['돌쇠 할배','돌은 마음을 알아야 선다.']
  ],'돌쇠 할배가 받쳐 준 돌탑에 엄마 몫의 돌을 얹었다. 약을 만들어 보내 드리자.')});
  // 결정 D-118: 꼬마 두더지는 할배 눈이 정말 멀까 봐 손으로 돌 읽기를 피한다. 꼬마가 같은 마당에 있을 때만 연다.
  // 결정 D-130: 꼬마 두더지는 돌쇠 할배의 손주다.
  if(!c.length&&G.zone==='village'&&!F.dolBridgeCrewHere&&moleMet()&&F.dolneomeo_arc_dolsoe1){
    /* 꼬마 사연의 막들 */
    if(!F.dolneomeo_arc_dolsoe4)c.push({t:'꼬마는 요새 뭐 해요?',go:()=>arcScene('dolneomeo_arc_dolsoe4',[
      ['돌쇠 할배','(할배가 담 너머 달그락 소리 쪽으로\n고개를 돌린다.)'],
      ['돌쇠 할배','우리 손주 녀석, 너하고는 잘 노는구나.'],
      ['너구리','돌집 짓는 거 같이 했어요.'],
      ['돌쇠 할배','내가 손으로 돌 읽는 걸 가르치려 들면\n도망만 간다.'],
      ['돌쇠 할배','내 눈이 더 흐려지기 전에\n한 번은 가르쳐야 하는데.']
    ],'돌쇠 할배는 눈이 더 흐려지기 전에 손주 꼬마 두더지에게 손으로 돌 읽는 법을 가르치고 싶어 한다. 꼬마는 도망만 다닌다.')});
    else if(!F.dolneomeo_arc_dolsoe5&&F.stackDone)c.push({t:'꼬마한테 물어볼게요',go:()=>arcScene('dolneomeo_arc_dolsoe5',[
      ['너구리','(돌담 뒤에 숨은 꼬마 두더지 곁에\n쪼그려 앉았다.)'],
      ['너구리','할배가 돌 읽는 법 가르쳐 준대.\n왜 도망가?'],
      ['꼬마 두더지','…할배 손 잡으면, 손이 너무 차.'],
      ['꼬마 두더지','눈 감고 돌 만지는 거 보면…\n할배 진짜 안 보이는 거 같아.'],
      ['꼬마 두더지','그거 배우면, 할배가 진짜로\n안 보이게 될 것 같아.'],
      ['너구리','(대답을 못 했다. 엄마가 내 이름을\n부르다 멈추던 날이 생각났다.)'],
      ['너구리','우리 엄마도 말을 자꾸 잊어.'],
      ['너구리','그래서 나는 적어.\n잊어도 다시 볼 수 있게.'],
      ['꼬마 두더지','…그럼 할배 손도,\n내가 대신 기억하면 돼?']
    ],'꼬마 두더지는 할배 눈이 정말 멀까 봐 손으로 돌 읽기를 피해 왔다. 엄마 이야기를 해 줬더니 할배 손을 대신 기억하겠다고 했다.')});
    else if(F.dolneomeo_arc_dolsoe5&&!F.dolneomeo_arc_dolsoe6&&G.boss.dead)c.push({t:'꼬마가 할배를 찾아요',go:()=>arcScene('dolneomeo_arc_dolsoe6',[
      ['돌쇠 할배','녀석이 제 발로 왔구나.'],
      ['꼬마 두더지','…가르쳐 줘, 할배.'],
      ['돌쇠 할배','눈 감아라. 손바닥 전부로, 천천히.'],
      ['꼬마 두더지','차가워… 여기 오돌토돌해.'],
      ['돌쇠 할배','물이 지나간 자리다.\n이 돌이 냇가에서 왔다는 게지.'],
      ['너구리','(나도 눈을 감고 옆 돌을 짚어 봤다.\n한쪽만 매끈했다.)'],
      ['너구리','이건 한쪽만 매끈해요.'],
      ['돌쇠 할배','누가 오래 깔고 앉았던 돌이다.\n손이 좋구나.']
    ],'꼬마 두더지가 할배에게 손으로 돌 읽는 법을 배웠다. 나도 옆에서 따라 짚었다. 한쪽만 매끈한 돌은 누가 오래 깔고 앉았던 돌이라고 했다.')});
    else if(F.dolneomeo_arc_dolsoe6&&!F.dolneomeo_arc_dolsoe7&&F.yakMade)c.push({t:'꼬마가 맞혀 본대요',go:()=>arcScene('dolneomeo_arc_dolsoe7',[
      ['꼬마 두더지','할배, 이거 맞혀 볼게!'],
      ['너구리','(꼬마가 눈을 감고 돌탑 꼭대기의\n작은 돌을 더듬는다.)'],
      ['꼬마 두더지','이건… 우리 할머니 돌이다.\n날마다 만져서 따뜻해.'],
      ['너구리','(할배가 소리 내어 웃었다.\n처음 듣는 웃음소리였다.)'],
      ['돌쇠 할배','이제 내 눈이 좀 쉬어도 되겠다.'],
      ['꼬마 두더지','할배 눈 대신 내 손으로 볼게.'],
      ['너구리','(돌가루 묻은 손 두 개가\n나란히 돌탑에 얹혀 있었다.)']
    ],'꼬마 두더지가 눈을 감고 꼭대기의 할머니 돌을 알아맞혔다. 돌쇠 할배가 처음으로 소리 내어 웃었다.',()=>learn('dolneomeo:mole-reads'))});
  }
  if(c.length)return arcMenu('돌쇠 할배','무얼 묻고 싶으냐.',talkDolsoe,c);
  talkDolsoe();
}
function badgerSack(){
  return {t:'메밀댁 아주머니가 보냈어요',go:()=>arcScene('dolneomeo_badger_sent',[
    ['너구리','메밀댁 아주머니가 보냈어요.\n아주머니네 맷돌 받침 고쳐 주신 값이래요.'],
    ['돌쇠 할배','(할배가 자루를 손바닥으로 쓸어 본다.)'],
    ['돌쇠 할배','햇메밀이구나. 받침 값치곤 많다.'],
    ['돌쇠 할배','그 사람은 늘 넘치게 준다.\n겨울이 오기 전에, 꼭.'],
    ['돌쇠 할배','손수 안 오고 너를 보냈구나.'],
    ['너구리','멍석에 메밀을 널어 두셔서\n자리를 못 뜨신대요.'],
    ['돌쇠 할배','해마다 그 소리지.\n…그럼 다음엔 내가 내려가야겠구나.']
  ],'메밀댁 아주머니의 햇메밀 자루를 돌쇠 할배에게 날랐다. 할배는 받침 값치곤 많다며, 다음엔 자기가 내려가겠다고 했다.')};
}
function talkPpuriArc(){
  const F=G.f;
  // 필수 교환과 석이버섯 안내를 사연 메뉴보다 먼저 처리한다.
  if(!Rg.arcs()||!F.ppuriMet||(!F.ppuriPassed&&has('memil_powder'))||(F.golemCalm&&!F.dolPpuriCalmThanks))return talkPpuri();
  const c=[];
  // 결정 D-130: 규칙의 사연 뒤에 아빠 이야기를 바로 이어 물을 수 있다. 뿔이는 모자로 아빠를 알아본다.
  const ppuriDad=()=>arcScene('dolneomeo_arc_ppuri2',[
    ['너구리','아빠 찾으러 왔어요. 이 길로 갔어요?'],
    ['뿔이','(뿔이가 내 모자를 한참 본다.)'],
    ['뿔이','같은 모자다. …지난가을 그 너구리가\n네 아빠였군.'],
    ['뿔이','가을장마가 그칠 때까지 사흘을 비 속에 세워 뒀다.\n급하다는데도.'],
    ['뿔이','기침을 하면서도 한 번도 화를 안 냈다.'],
    ['뿔이','난 길만 살폈지. 기다리는 이는 못 봤다.']
  ],'뿔이는 내 모자를 보고 아빠를 알아봤다. 지난가을 장맛비 속에 아빠를 사흘 동안 세워 뒀다고 했다. 아빠는 기침을 하면서도 한 번도 화를 내지 않았다고 한다.');
  if(!F.dolneomeo_arc_ppuri1)c.push({t:'왜 꼭 장승제를 올려요?',go:()=>arcScene('dolneomeo_arc_ppuri1',[
    ['뿔이','규칙이다. 길은 살핀 다음에 연다.'],
    ['뿔이','내 아버지도 여기 장승지기였다.'],
    ['뿔이','폭설에 길을 열었다가 짐꾼이 떨어졌지.'],
    ['뿔이','다시는 그런 일이 생기면 안 된다.']
  ],'뿔이의 아버지도 장승지기였다. 폭설에 길을 열었다가 짐꾼이 떨어진 뒤, 뿔이는 길을 여는 조건을 지킨다.',
    ()=>talk([['뿔이','또 물을 게 있나.',[{t:'아빠도 이 길로 갔어요?',go:ppuriDad},{t:'다음에 물을게요',go:null}]]]))});
  else if(!F.dolneomeo_arc_ppuri2)c.push({t:'아빠도 이 길로 갔어요?',go:ppuriDad});
  else if(F.ppuriPassed&&!F.dolneomeo_arc_ppuri3)c.push({t:'아빠는 어느 길로 갔어요?',go:()=>arcScene('dolneomeo_arc_ppuri3',[
    ['뿔이',CLASSIC?'금줄 너머 납작한 바위가 보이나.':'돌담 마을 끝에 높은 돌계단이 있다.'],
    ['뿔이',CLASSIC?'그 옆으로 곧장 가면 성황당이다.':'돌계단 안쪽 길은 성황당으로 곧장 간다.'],
    ['뿔이','네 아빠도 그리로 지나갔다.'],
    ['뿔이','누가 어디로 갔는지는 원래 말 안 한다.\n…네 아빠를 사흘이나 세워 뒀으니.'],
    ['너구리','알려 줘서 고마워요.'],
    ['뿔이',G.boss.dead?'돌무더기도 잠잠해졌군. 그래도 발밑을 살펴라.':'돌무더기는 아직 깨어 있다. 거긴 조심해라.']
  ],CLASSIC?'뿔이가 아빠가 지나간 지름 바위를 알려 줬다. 금줄 너머 납작한 바위 옆길이다. 성황당 돌무더기는 따로 지나야 한다.':'뿔이가 아빠도 마을 끝 돌계단 안쪽 길로 올라갔다고 알려 줬다. 누가 어디로 갔는지는 원래 말 안 한다면서.')});
  // 결정 D-118: 뿔이는 아버지가 세운 장승에게 아침마다 길 소식을 고한다. 아이가 벗겨진 장승 눈을 칠한다.
  else if(F.dolneomeo_arc_ppuri3&&!F.dolneomeo_arc_ppuri4)c.push({t:'장승한테 무슨 말을 해요?',go:()=>arcScene('dolneomeo_arc_ppuri4',[
    ['뿔이','(뿔이가 장승 앞에 서서\n낮게 무어라 중얼거린다.)'],
    ['너구리','장승한테 무슨 말을 해요?'],
    ['뿔이','오늘 길 소식이다.\n누가 지나갔고, 어디가 미끄러운지.'],
    ['뿔이','아버지가 세운 장승이다.\n아버지도 아침마다 그랬다.'],
    ['너구리','장승이 들어요?'],
    ['뿔이','모른다. 규칙이다.'],
    ['뿔이','…말하고 나면, 내가 길을\n한 번 더 살피게 되거든.']
  ],'뿔이는 아버지가 세운 장승에게 아침마다 길 소식을 고한다. 말하고 나면 길을 한 번 더 살피게 된다고 했다.')});
  else if(F.dolneomeo_arc_ppuri4&&!F.dolneomeo_arc_ppuri5&&G.boss.dead)c.push({t:'장승 얼굴이 흐려요',go:()=>arcScene('dolneomeo_arc_ppuri5',[
    ['뿔이','돌무더기가 잠잠해지니\n장승 얼굴이 눈에 들어오는군.'],
    ['뿔이','눈 칠이 다 벗겨졌다.\n가을장마 탓이다.'],
    ['너구리','다시 칠하면 되잖아요.'],
    ['뿔이','(뿔이가 앞발 굽을 내려다본다.)'],
    ['뿔이','이 발로는 붓을 못 쥔다.\n아버지 땐 짐꾼들이 칠해 줬다.'],
    ['너구리','제가 칠해도 돼요?'],
    ['뿔이','…규칙엔 없다.\n하지 말라는 규칙도 없고.']
  ],'장승의 눈 칠이 가을장마에 다 벗겨졌다. 뿔이는 굽으로 붓을 못 쥔다. 내가 칠하기로 했다.')});
  else if(F.dolneomeo_arc_ppuri5&&!F.dolneomeo_arc_ppuri6)c.push({t:'장승 눈을 칠한다',go:()=>arcScene('dolneomeo_arc_ppuri6',[
    // 결정 D-130: 굽으로는 붓을 못 쥐니 붓도 아이가 만든다.
    ['뿔이','숯 갠 물이다.\n붓은 없다.'],
    ['너구리','(억새 끝을 모아 끈으로 묶어\n붓을 만들었다.)'],
    ['너구리','(장승 눈에 동그랗게 먹을 올렸다.\n손이 조금 떨렸다.)'],
    ['뿔이','됐다. 길을 보는 눈이다.'],
    ['너구리','(장승 뒤에 오래된 이름 하나가\n새겨져 있다.)'],
    ['너구리','뒤에 새긴 이름은 누구예요?'],
    ['뿔이','아버지 때 절벽에서 떨어진 짐꾼이다.'],
    ['뿔이','길을 열 때마다\n그 이름을 먼저 본다. 규칙이다.']
  ],'억새 끝을 묶어 붓을 만들고, 뿔이가 갠 숯물로 장승 눈을 칠했다. 장승 뒤에는 뿔이 아버지 때 절벽에서 떨어진 짐꾼의 이름이 새겨져 있다.',()=>learn('dolneomeo:ppuri-eyes'))});
  else if(F.dolneomeo_arc_ppuri6&&!F.dolneomeo_arc_ppuri7&&F.yakMade)c.push({t:'이제 떠나요',go:()=>arcScene('dolneomeo_arc_ppuri7',[
    ['뿔이','떠날 채비를 하는군.'],
    ['뿔이','네 아빠가 돌아오는 길에\n여길 지나거든,'],
    ['뿔이','사흘이 아니라 하루만 세워 두마.'],
    ['너구리','하루도 세워요?'],
    ['뿔이','규칙이다. 길은 살핀 다음에 연다.'],
    ['뿔이','…하루면, 내가 살피는 데 충분하다.']
  ],'떠나기 전 뿔이가 말했다. 아빠가 돌아오는 길엔 사흘이 아니라 하루만 세워 두겠다고. 하루면 살피는 데 충분하단다.')});
  if(c.length)return arcMenu('뿔이','묻고 싶은 게 있나.',talkPpuri,c);
  talkPpuri();
}
function nalSickle(){
  const lines=[['날쌘','그 낫…'],['날쌘','…아직 그 자루네.'],['너구리','아빠 거예요.']];
  // 앞 지역의 기존 표시를 읽기만 한다. 다른 지역 시험판의 플래그 이름을 가정하지 않는다.
  if(G.f.nalDone&&knows('nal:bluff-paid'))lines.push(['날쌘','촌구석 숯이 다 그렇다더니.\n그 숯으로 잘도 벼렸네.']);
  else lines.push(['날쌘','날은 잘 벼렸네.']);
  lines.push(['날쌘','됐어. 낫은 넣고, 바꿀 물건이나 꺼내.']);
  arcScene('dolneomeo_arc_nal2',lines,'날쌘은 아빠의 낫을 보고 하던 말을 멈췄다. “아직 그 자루네.” 하고는 더 묻지 않았다.');
}

/* ---------- 꾸벅이 (고슴도치): 고개를 들 때 맞춰 말 걸기 ---------- */
function talkKku(){
  const F=G.f;F.kkuTalk=true;
  if(!Rg.kkuAwakeNow()){
    Sound.stone('sleep');
    learn('kkubeogi:sleep');
    if(!G.clues.some(c=>c.id==='k1')){
      clue('k1','꾸벅이','꾸벅이의 잠꼬대: 보부상 아저씨가 할배네서 며칠 묵다가, 글자 하나를 읽고는 그날 밤 떠났다.');
      talk([['꾸벅이','쿨… 쿨…'],['꾸벅이','보부상 아저씨… 할배네서 며칠 묵었는데…'],['꾸벅이','글자 하나 읽더니… 그날 밤 떠났어… 쿨…'],['너구리','(보부상 아저씨…? 아빠 얘기일까.)']]);
    }else talk([['꾸벅이',pick(['쿨… 둥지는… 폭신해야…','으음… 아직 꿈꾸는 중이야…','하암… 조금만 더…'])],['너구리',Rg.arcs()?(F.dolneomeo_arc_kku3?'(푹 자. 맡긴 말은 적어 뒀어.)':'(고개를 들 때까지 기다리자.)'):'(코가 씰룩하네. 곧 고개 들겠다.)']]);
    return;
  }
  Sound.stone('wake');
  if(!F.kkuAwake){F.kkuAwake=true;rel('kkubeogi',1);learn('kkubeogi:awake');
    if(Rg.arcs()){F.dolneomeo_arc_kku1=true;diary('dolneomeo_arc_kku1','꾸벅이가 고개를 들 때 말을 걸었다. 겨울잠 둥지에 깔 억새가 모자란다고 했다.');}
    ledger('kkubeogi','꾸벅이','마른 억새 3','서리다래 자리에 대한 정보');
    // 결정 D-130: 아이가 먼저 서리다래를 묻는다. 뿔이에게 들었으면 그 말을 한다.
    const ask=F.ppuriMet?'서리다래 어디 열리는지 알아?\n장승지기 아저씨가 너한테 물어보래.':'서리다래 어디 열리는지 알아?\n엄마 약에 써야 해.';
    talk([['꾸벅이','어, 어…? 안 잤어어… 진짜야아…'],['너구리',ask],
      ['꾸벅이','서리다래애… 알지이…\n그 모자… 어디서 봤더라아…'],
      ['꾸벅이','근데… 겨울잠 둥지가 아직 덜 됐어…\n깔 억새… 세 단만 베어다 줄래에…?'],
      ['꾸벅이','가져오면… 다 알려 줄게에… 쿨…']],()=>{if(has('eoksae',3))kkuTrade();});
    return;
  }
  if(!F.kkuDone){
    if(has('eoksae',3))kkuTrade();
    else talk([['꾸벅이','억새 세 단… 낫으로 슥슥 베면 금방이야… 하암…']]);
    return;
  }
  talk([['꾸벅이','돌쇠 할배는 눈이 침침해서 손끝으로 돌을 보셔…\n결명자 차를 좋아하실 거야… 쿨…']]);
}
function kkuTrade(){
  talk([['꾸벅이','오… 억새다… 나 주는 거야…?',[{t:'보따리를 펼친다',go:()=>Trade.open('kkubeogi')},{t:'아직은 안 줄래',go:null}]]]);
}
function kkuGive(){
  if(G.f.kkuDone||!has('eoksae',3))return;
  {
    takeItem('eoksae',3);G.f.kkuDone=true;ledgerDone('kkubeogi');rel('kkubeogi',1);learn('kkubeogi:eoksae');
    // 결정 D-130: 뿔이에게 이미 들은 말은 되풀이하지 않는다. 가루를 낼 길(돌쇠 할배 → 결명자 → 날쌘)을 잇는다.
    const met=G.f.ppuriMet;
    diary('d_kku','꾸벅이에게 억새를 주고 들었다. 서리다래는 돌산 절벽 바위턱에 열리고, 첫서리를 맞아야 단다.'+(met?'':' 장승지기 뿔이가 돌산 길을 막았다.')+' 메밀가루는 돌쇠 할배에게 물어보라고 했다. 할배는 결명자 차를 좋아하시고, 결명자는 날쌘 아저씨에게 있다.');
    const lines=[['꾸벅이','와… 폭신하다… 고마워…'],['꾸벅이','서리다래는… 돌산 절벽 바위턱에 열려…\n첫서리를 맞아야 달거든…'],
      ['꾸벅이','바람 불면 한두 알 굴러 내려와…\n그거 주워 먹어 봤어어…'],
      met?['꾸벅이','장승제엔 메밀전이니까…\n가루가 있어야겠네에…']:['꾸벅이','근데 장승지기 뿔이가… 돌산 길을 막았어…\n장승제 메밀전을 받아야 연대애…'],
      ['꾸벅이','가루를 내려면… 돌쇠 할배한테 가 봐…\n돌 일은 할배가 다 알아…'],
      ['꾸벅이','할배는 눈이 침침해서… 결명자 차를 좋아하셔…\n날쌘 아저씨한테 결명자가 있어…']];
    talk(lines);
  }
}

/* ---------- 날쌘 (다시 만남): 돌투성이 마을이라 칡꽃 향이 귀하다 ---------- */
function talkNal(){
  if(!G.f.nalDTalk){G.f.nalDTalk=true;ledger('nal_dolneomeo','날쌘','칡꽃 1 (또는 겨우살이 2)','결명자');
    // 결정 D-130: 단풍골에서 칡꽃을 귀띔했으면(nal:route-price) 그 말을 받는다.
    const told=G.f.galArcNal2||knows('nal:route-price');
    talk([['날쌘','또 만났네, 꼬마 보부상.\n돌밖에 없는 동네라 장사가 영 시원찮아.'],['날쌘',has('kflower')?(told?'칡꽃 챙겨 왔네. 말한 대로지.\n여기선 귀해. 결명자 두 개는 쳐줄게.':'가만, 그 향은 단풍골 칡꽃이지?\n여기선 그게 귀해. 결명자 두 개는 쳐줄게.'):'단풍골 칡꽃 같은 건 없어? 여기선 귀하거든.\n하나면 결명자 두 개는 쳐줄게.']],nalMenu);}
  else nalMenu();
}
function nalMenu(){
  const F=G.f,c=[];
  c.push({t:'보따리를 펼친다',go:()=>Trade.open('nal')});
  if(Rg.arcs()&&G.tool==='sickle'&&!F.dolneomeo_arc_nal2)c.push({t:'아빠의 낫을 보여 준다',go:nalSickle});
  if(!CLASSIC&&!F.dolneomeo_craft_oil)c.push({t:'지게에서 달그락거리는 병을 묻는다',go:()=>{
    // t_craft_oil: 꾸벅이 둥지 몫을 먼저 남긴다. 거절에는 소비가 없다.
    // 아이는 병 소리를 듣고 묻는다. 날쌘이 억새를 원하는 까닭(돌길에 병이 부딪는다)을 말한다.
    const lead=['날쌘','참기름 병이야. 돌길이라 병끼리 자꾸 부딪어.'];F.nalOilAsked=true;
    if(!has('eoksae',F.kkuDone?1:4)){
      talk(F.kkuTalk&&!F.kkuDone?[lead,['날쌘','억새 한 단이면 감쌀 텐데.\n꾸벅이 둥지에 쓸 세 단은 남겨 두고.'],['날쌘','그거 말고 한 단 더 생기면 한 병 줄게.']]
        :[lead,['날쌘','마른 억새 한 단이면 감쌀 텐데.\n밭에서 베어 오면 한 병 줄게.']]);return;
    }
    talk([lead,['날쌘','그 억새 한 단이면 감쌀 수 있겠다.\n주면 한 병은 네 몫이야.',[
      {t:'보따리를 펼친다',go:()=>Trade.open('nal')},{t:'지금은 챙겨 둘게요',go:null}
    ]]]);
  }});
  c.push({t:'그만두기',go:null});
  const say=F.nalDDone?'결명자는 볶아서 차로 달이는 거야.\n돌쇠 할배 눈이 침침하던데. 훈수는 공짜야.'
    :(has('kflower')||has('gyeousari',2))?'어디, 뭘 내놓을 건데?':'빈손으로 흥정하게? 칡꽃이 없으면\n높은 가지 겨우살이 두 개라도 따 와. 그럼 결명자 하나.';
  talk([['날쌘',say,c]]);
}
function nalOilGive(){
  if(G.f.dolneomeo_craft_oil||!has('eoksae',G.f.kkuDone?1:4))return;
  takeItem('eoksae',1);addItem('sesame_oil',1);G.f.dolneomeo_craft_oil=true;
  diary('dolneomeo_craft_oil','날쌘에게 여분 억새를 주고 참기름을 받았다. 병을 억새로 감싸니 돌길에서도 부딪는 소리가 작아졌다.');
  talk([['날쌘','이걸로 병끼리 안 부딪겠네.\n기름은 네가 쓸 데에 써.']]);
}
function nalTrade(id){
  const F=G.f;
  if(F.nalDDone||!has(id,id==='kflower'?1:2))return;
  takeItem(id,id==='kflower'?1:2);F.nalDDone=true;ledgerDone('nal_dolneomeo');
  const n=(id==='kflower'?2:1)+(F.nalDBluff?1:0);
  addItem('gyeolmyeongja',n);learn('nal:dolneomeo');
  diary('d_nal',id==='kflower'?'단풍골에서 가져온 칡꽃을 날쌘에게 주고 결명자를 받았다. 돌투성이 마을에선 꽃 향이 귀하다. 마을이 바뀌니 물건값도 달라진다.':'높은 가지의 겨우살이를 날쌘에게 주고 결명자를 받았다.');
  talk(F.nalDBluff?[['날쌘',id==='kflower'?'그 흔한 물건도 여기 오면 귀해지는 거야.\n자, 결명자. 덤도 얹었어.':'칡꽃은 흔하다며? 겨우살이로 왔네.\n자, 결명자. 덤도 얹었어.'],['날쌘','날쌘이 짜다는 소리는 못 듣지.']]
    :[['날쌘','자, 결명자 '+n+'개. 이만하면 잘 바꿨지?'],['날쌘','눈 밝히는 약재니까 쓸 데가 있을걸.']]);
}

/* ---------- 돌쇠 할배 (두더지 석수) ---------- */
function talkDolsoe(){
  const F=G.f;
  if(!F.dolsoeMet){F.dolsoeMet=true;
    talk([['돌쇠 할배','누가 왔느냐. 이리 가까이 오너라.'],['돌쇠 할배','(돌을 쓰다듬던 할배가 얼굴을 가까이 댄다.\n눈을 가늘게 뜨고 들여다본다.)']],()=>{if(has('gyeolmyeongja'))dolsoeTea();});
    return;
  }
  if(!F.dolsoeTea){
    if(has('gyeolmyeongja'))dolsoeTea();
    else talk([['너구리','눈이 불편하세요?'],['돌쇠 할배','돌은 손끝으로 보면 된단다. 내 눈은 걱정 말거라.']]);
    return;
  }
  if(!F.stackDone){
    talk([['돌쇠 할배','돌을 얹어 보겠느냐. 천천히 해도 된단다.',[{t:'돌을 얹는다',go:openStack},{t:'조금 이따가요',go:null}]]]);
    return;
  }
  const c=[];if(has('gyeolmyeongja'))c.push({t:'결명자를 하나 더 드린다',go:()=>{takeItem('gyeolmyeongja',1);rel('dolsoe',1);talk([['돌쇠 할배','허허. 또 챙겨 왔구나. 고맙다.']]);}});
  c.push({t:'그만두기',go:null});
  talk([['돌쇠 할배','맷돌은 잘 돌더냐.\n메밀은 한 줌씩 넣어야 곱게 갈린다.',c]]);
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
      ['돌쇠 할배','(할배가 자개 발자국을 손끝으로 더듬다가 멈춘다.)'],
      ['돌쇠 할배','그 녀석 집안 맷돌이다. 4대째 내려온 게지.\n…그럼 네가 그 녀석 아들이냐.'],
      ['돌쇠 할배','네 아비, 젊을 적에 내 마당에서 돌을 배웠다.\n“돌이 마음을 알아야 돈다.” 내가 가르친 말이다.'],
      ['돌쇠 할배','돌 마음부터 읽고, 저 탑에 돌 세 개를 얹거라.']
    ]:[['너구리','(결명자를 볶아 차로 달여 드렸다.)'],['돌쇠 할배','눈이 좀 밝아지는구나. 고맙다.'],['돌쇠 할배','보따리에서 돌 부딪는 소리가 나는구나.\n이리 줘 보거라.'],
      ['돌쇠 할배','(할배가 맷돌 윗돌의 자개 발자국을 손끝으로 천천히 더듬는다.)'],
      ['돌쇠 할배','이 자개 발자국… 그 녀석 집안 맷돌이구나. 4대째 내려온 게지.'],
      ['돌쇠 할배','"돌이 마음을 알아야 돈다." 네 아비도 그 말을 하더냐.\n내가 가르쳐 주었지.'],
      ['돌쇠 할배','돌 마음부터 읽어 보거라.\n저 돌탑에 돌을 하나씩 세 개 얹으면 된다.']];
    if(Rg.arcs())lines.push(['돌쇠 할배','배워 보겠느냐.',[
      {t:'돌 쌓기를 배운다',go:openStack},
      {t:'꼭대기 돌을 여쭤본다',go:talkDolsoeArc},
      {t:'조금 이따가요',go:null}
    ]]);
    talk(lines,Rg.arcs()?null:openStack);
  }
}

/* 돌 쌓기·돌 놓기: 할배 손을 따라 돌을 얹는다. 맷돌이 깨어난다. */
// 결정 D-88: 손일은 미니게임 없이 바로 마친다 (확정: 미니게임은 채집·전투·놀이에만, 대장 2026-10-30). 막혀 있던 판정 코드는 지웠다.
function openStack(task=null){
  Sound.stone('tap');
  if(task){task.done();return;}
  finishStack();
}
Rg.stoneTask=openStack;
function finishStack(){
  const F=G.f;
  F.stackDone=true;awaken('maetdol');learn('dolsoe:stack');ledgerDone('dolsoe');rel('dolsoe',MG.handwork_stack_relation);
  clue('s1','돌쇠 할배','돌쇠 할배가 지난가을 아빠에게 읽어 준 약연의 글자는 “되돌림”이었다. 아빠는 그날 밤 떠났다.');
  diary('d_maetdol','돌탑에 돌 세 개를 얹었다. 그 순간 보따리 속 맷돌에서 우웅, 낮은 소리가 났다. 증조할아버지의 맷돌이 깨어났다.');
  toast('증조할아버지의 맷돌이 깨어났다! 메밀 3 → 메밀가루 1');refreshHud();
  const lines=Rg.arcs()?[
    ['너구리','(할배 손을 따라 돌탑에 돌 세 개를 얹었다.\n보따리 속 맷돌이 우웅, 낮게 울린다.)'],['돌쇠 할배','됐다. 맷돌이 네 손을 알아보는구나.']
  ]:[['너구리','(할배 손을 따라 돌탑에 돌 세 개를 얹었다.)'],['돌쇠 할배','하나도 안 떨어뜨렸구나. 네 아비보다 낫다.'],
    ['너구리','(맷돌이 따뜻하네! 이제 메밀을 갈아 보자.)']];
  // 결정 D-130: 되돌림은 맷돌이 깨어난 뒤 따로 한 마디로 연다. 아이는 할멈에게 들은 열매 이야기(단풍골 첫 만남)를 떠올린다.
  const reveal=Rg.arcs()?[
    ['돌쇠 할배','(할배가 보따리 속 약연 바퀴를 손끝으로 짚는다.)'],
    ['돌쇠 할배','이 글자… 지난가을 네 아비가 돌에 새겨 와 묻던 거다.'],
    ['돌쇠 할배','“되돌림.” 그렇게 읽어 줬더니 그날 밤 떠났단다.']
  ]:[['돌쇠 할배','네 아비도 지난가을 여기 왔었지.\n약연 글자를 돌에 옮겨 새겨 와서 읽어 달라더구나.'],
    ['돌쇠 할배','글자 하나만 읽어 주었단다. “되돌림.”'],
    ['돌쇠 할배','녀석은 그날 밤 짐을 싸서 떠났지.']];
  reveal.push(['너구리','(되돌림… 두꺼비 할멈이 그랬지.\n잃어버린 걸 돌려준다는 열매라고.)'],['너구리','(아빠는 그 밤에 뭘 알아챈 걸까.)']);
  if(G.rel.dolsoe.v>=2&&!F.stoneGiven){F.stoneGiven=true;addItem('story_stone',1);
    diary('d_stone','돌쇠 할배가 아빠의 돌을 내주었다. 아빠가 성황당에 올리려다 끝내 못 올린 소원 돌이다.');
    if(Rg.arcs())reveal.push(['돌쇠 할배','네 아비가 못 올린 소원 돌이다. 받아 두거라.'],['돌쇠 할배','성황당에 대신 올려 주겠느냐.']);
    else reveal.push(['돌쇠 할배','참, 이 돌도 가져가거라.'],['돌쇠 할배','네 아비가 소원을 적은 돌이란다.\n성황당에 올리려다 끝내 못 올리고 두고 갔지.'],['돌쇠 할배','네가 대신 올려 주려무나.']);}
  talk(lines,()=>talk(reveal));
}

/* ---------- 뿔이 (산양 장승지기): 규칙대로 메밀가루를 받아야 길을 연다 ---------- */
function talkPpuri(){
  const F=G.f;
  if(!F.ppuriMet){F.ppuriMet=true;ledger('ppuri','뿔이','메밀가루 1','돌산 길 통과');
    // 결정 D-130: 아이가 서리다래(엄마 약)를 묻는다. 뿔이는 길만 보니 열매 자리는 꾸벅이에게 보낸다.
    talk([
      ['뿔이','멈춰라. 장승제 전에는 돌산에 못 오른다.'],
      ...(F.kkuDone?[['너구리','서리다래가 돌산 절벽에 있대요.\n엄마 약이에요.']]:[
        ['너구리','서리다래를 찾으러 왔어요.\n엄마 약이에요.'],
        ['뿔이','열매 자리는 모른다. 나는 길만 본다.'],
        ['뿔이','산 열매라면 꾸벅이가 안다.\n메밀밭 끝 둥지의 고슴도치다.']]),
      ['뿔이','어차피 지금은 못 오른다.\n성황당 돌무더기가 밤마다 움직인다.'],
      ['뿔이','산을 달래는 장승제가 먼저다.\n제물은 오르는 이가 마련한다. 규칙이다.'],
      ['뿔이','장승제엔 메밀전을 올린다.\n메밀가루 하나를 가져와라.']],()=>{if(has('memil_powder'))ppuriTrade();});
    return;
  }
  if(!F.ppuriPassed){
    if(has('memil_powder'))ppuriTrade();
    else talk([['뿔이','메밀가루 하나다. 가져오기 전엔 못 간다.'],['뿔이','거둔 밭에서 메밀을 주워 와라. 갈 도구는 네가 구해야 한다.']]);
    return;
  }
  if(F.golemCalm&&!F.dolPpuriCalmThanks){
    F.dolPpuriCalmThanks=true;
    // 옛 저장의 석이버섯 보상 때 이미 받은 의리는 다시 주지 않는다.
    if(!G.diary.some(d=>d.id==='d_seogi'&&d.text.includes('달랬')))rel('ppuri',1);
    // 결정 D-130: 뿔이는 길을 살피러 올라가 직접 봤다.
    talk([['뿔이','길을 살피러 성황당에 올라가 봤다.\n돌 하나 안 깨지고 내려앉았더군.'],['뿔이','…고맙다. 산이 한동안 조용하겠군.']]);return;
  }
  talk([['뿔이','규칙을 지켰으니 통과다. 가도 좋다.']]);
}
function ppuriTrade(){
  talk([['뿔이','메밀가루는 가져왔나.',[{t:'보따리를 펼친다',go:()=>Trade.open('ppuri')},{t:'나중에 드릴게요',go:null}]]]);
}
// 결정 D-78: 메밀묵을 얹으면 장승제 상에 함께 올리고, 산이 준 몫으로 석이 한 장을 덤으로 준다.
function ppuriGive(i=0){
  if(G.f.ppuriPassed||!has('memil_powder'))return;
  {
    const F=G.f,jelly=i===1&&has('memil_jelly');takeItem('memil_powder',1);F.ppuriPassed=true;ledgerDone('ppuri');rel('ppuri',1);tellSeogi();
    if(jelly){takeItem('memil_jelly',1);addItem('seogi',1);}
    diary('d_ppuri','맷돌로 간 메밀가루로 내가 장승제 메밀전을 부쳤다. 뿔이가 산에 올리고 절하자 금줄이 걷히고 돌산 길이 열렸다.');
    toast('돌산 길이 열렸다');refreshGoal();
    // 결정 D-130: 전은 아이가 부친다. 오르는 이가 제물을 마련하는 규칙이다.
    talk([['뿔이','좋다. 규칙대로 장승제를 올린다.'],...(jelly?[['뿔이','메밀묵까지 쑤어 왔군. 상에 함께 올리지.']]:[]),['뿔이','전은 네가 부쳐라. 오르는 이가 부치는 법이다.'],
      ['너구리','(뿔이가 내준 번철에 메밀전을 부쳤다.\n뿔이가 돌산 쪽에 올려 절하고 금줄을 걷었다.)'],
      ...(jelly?[['뿔이','정성을 받았으니 몫을 나눈다. 산이 준 석이 한 장이다.'],['너구리','(뿔이가 말린 석이버섯 한 장을 내민다.)']]:[]),['뿔이','산이 노하면 석이를 올리는 법이다.\n절벽 아래 백 년 바위에 붙어 있다.'],['뿔이','돌무더기 앞까지 안 가도 닿는 자리다.'],['뿔이','통과다. 흰 돌턱을 밟고, 발밑을 살펴라.']]);
  }
}
function tellSeogi(){
  if(G.f.seogiTold)return;
  G.f.seogiTold=true;Rg.addSeogiSpot();learn('ppuri:seogi');
  diary('d_seogi','뿔이가 길을 열며 석이버섯 자리를 알려 줬다. 산이 노하면 석이를 올리는 법이라고 했다. 성황당 돌무더기까지 가지 않아도 절벽 아래 백 년 바위에서 딸 수 있다.');
}

/* ---------- 돌 골렘 전투 ---------- */
Rg.startGolem=()=>{
  G.px=1845;
  inkTransition('돌 골렘',(G.boss.x-G.cam)/W*100,()=>startBattle('golem',res=>{
    if(res==='win'||res==='calm'){
      if(res==='calm'){G.f.golemCalm=true;diary('d_calm','성황당 돌무더기를 부수지 않고 달랬다. 돌 골렘이 조용히 내려앉았다.');}
      Rg.bossDie();
    }else{
      G.px=1790;G.f.faints+=res==='lose'?1:0;
      diary('d_hint','돌 골렘은 머리가 높아서 처음엔 닿지 않는다. 다리나 팔을 먼저 무너뜨리거나, 마음을 달랠 물건을 건네 보자.');
      talk([['너구리','(머리가 높아서 처음엔 안 닿아.\n다리나 팔부터 무너뜨리거나, 달랠 물건을 건네 보자.)']],()=>toast('준비되면 다시 다가가자'));
    }
  }));
};

/* ---------- 끝: 까치 편에 약즙 보내기 ---------- */
Rg.sendMedicine=()=>{
  if(regionCompleted(Rg.id))return;
  G.f.yakMade=true;
  diary('d_end','깨어난 맷돌로 서리다래를 갈아 약즙을 만들었다. 이번에는 내 손으로 만든 약이다. 까치 발에 묶어 남쪽으로 보냈다.');
  talk(CLASSIC?[['너구리','서리다래 약즙, 내가 만들었어!'],['너구리','(휘파람을 불자 장승 위의 까치가 내려왔다.)'],['너구리','까치야, 엄마한테 전해 줘. 남쪽 단풍골 우리 집이야.']]
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
  {id:'ppuri',name:'뿔이',x:1560,talk:talkPpuriArc,draw:Rg.art.goat},
];

/* ---------- 지금 할 일 ---------- */
Rg.goal=()=>{
  const F=G.f;
  if(!G.started)return '';
  if(G.ended)return '돌너머 마을 체험판 완료';
  // 결정 D-67: 앞선 진행부터 거꾸로 본다
  if(G.boss.dead)return !F.daraePicked?'절벽 바위턱의 서리다래를 따자':'보따리를 열고 맷돌에 서리다래를 넣어 약즙을 만들자';
  // 결정 D-130: 할 일 줄은 아이가 본 대로 '움직이는 돌무더기'라 부른다. 이름은 만나기 전엔 모른다.
  if(F.ppuriPassed)return '돌산 절벽 길의 움직이는 돌무더기와 맞서자 (부수거나 달래거나)';
  if(!F.kkuTalk)return '장승 옆 고슴도치에게 서리다래를 물어보자';
  if(!F.kkuAwake)return '꾸벅이가 고개를 들 때 말을 걸자';
  if(!F.kkuDone)return has('eoksae',3)?'고개를 들 때 꾸벅이에게 억새를 건네자':'들판의 마른 억새를 낫으로 베자 ('+(G.inv.eoksae||0)+'/3)';
  if(!F.ppuriMet)return '돌산 길목의 장승지기 뿔이를 찾아가자';
  if(!F.ppuriPassed){
    if(has('memil_powder'))return '뿔이에게 메밀가루를 건네자';
    if(!isAwake('maetdol')){
      if(has('gyeolmyeongja'))return '석수 마당의 돌쇠 할배께 결명자 차를 드리자';
      if(!F.nalDDone)return (has('kflower')||has('gyeousari',2))?'날쌘에게 칡꽃을 보여 주고 결명자를 구하자':'높은 가지의 겨우살이 2개를 따서 날쌘에게 가져가자';
      return '석수 마당의 돌쇠 할배를 찾아가자';
    }
    const m=G.inv.memil||0;
    if(m<3)return '거둔 메밀밭에서 메밀을 줍자 ('+m+'/3)';
    return '보따리를 열고 맷돌에 메밀 3개를 넣어 갈자';
  }
  return '돌산 절벽 길의 움직이는 돌무더기와 맞서자 (부수거나 달래거나)';
};
/* ---------- 교환 화면의 부탁 (engine/trade.js) ----------
   결정 D-39: 원하는 것을 들은 뒤에만 보인다(장부에 적혔거나, 냄새를 맡고 먼저 말을 꺼낸 뒤). 받은 뒤의 이야기는 위의 대화 함수가 이어 간다.
   결정 D-40: 날쌘에게 허세가 통하면 결명자를 하나 더 얹는다(경멸 축). 결명자를 바꾼 뒤라면 흔한 물건에 덤. */
function dolsoeEyeGive(){
  if(G.f.dolsoeEye||!has('mossy_eye'))return;
  takeItem('mossy_eye',1);addItem('stonedust',2);G.f.dolsoeEye=true;rel('dolsoe',1);
  diary('d_dolsoe_eye','골렘에게서 떨어진 이끼 낀 눈돌을 돌쇠 할배께 드렸다. 할배가 손끝으로 자리를 찾아 성황당 돌무더기에 도로 넣었다.');
  talk([['돌쇠 할배','(할배가 눈돌을 받아 손끝으로 이끼를 쓸어 본다.)'],['돌쇠 할배','…성황당 돌무더기 눈이구나.\n눈이 없으면 돌무더기가 편히 못 잔다.'],
    ['돌쇠 할배','자리를 맞추느라 좀 깎았다.\n남은 돌가루는 가져가라. 깨진 돌 때우는 데 쓴다.']]);
}
function kkuMudGive(){
  if(G.f.kkuMud||!has('mud'))return;
  takeItem('mud',1);addItem('memil',2);G.f.kkuMud=true;rel('kkubeogi',1);
  talk([['꾸벅이','진흙… 이걸로 둥지 틈 바르면… 바람이 안 들겠다…'],['꾸벅이','가을에 주워 둔 메밀… 자는 동안 눅눅해지니까… 너 가져가…'],['꾸벅이','쿨…']]);
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
    ...(!CLASSIC&&G.f.nalOilAsked?[{id:'t_craft_oil',item:'sesame_oil',n:1,asks:[{eoksae:1}],done:()=>G.f.dolneomeo_craft_oil,
      locked:()=>!G.f.kkuDone&&!has('eoksae',4)?'마른 억새 한 단. 꾸벅이 둥지에 쓸 세 단은 남겨 두고 한 단이 더 있어야 한다.':null,accept:nalOilGive}]:[])
  ],
  dolsoe:()=>[
    ...(G.f.dolsoeAsked?[{id:'t_dolsoe',item:'gyeolmyeongja',icon:'maetdol',label:'맷돌 보는 법',asks:[{gyeolmyeongja:1}],done:()=>G.f.dolsoeTea,accept:dolsoeGive}]:[]),
    // 결정 D-77: 골렘이 잠든 뒤, 돌쇠 할배는 성황당 돌무더기의 눈돌을 제자리에 넣어 주려 한다.
    ...(G.f.dolsoeTea&&G.boss.dead?[{id:'t_dolsoe_eye',item:'stonedust',n:2,label:'돌무더기 눈돌 제자리 찾기 · 돌가루 2',asks:[{mossy_eye:1}],done:()=>G.f.dolsoeEye,accept:dolsoeEyeGive}]:[])
  ],
  ppuri:()=>G.ledger.ppuri?[{id:'t_ppuri',item:'memil_powder',icon:'geumjul',label:'돌산 길 열기',asks:[{memil_powder:1},{memil_powder:1,memil_jelly:1}],done:()=>G.f.ppuriPassed,accept:ppuriGive}]:[]
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
function hands(title,verb,steps,done){
  Rg.stoneTask({title,verb,steps,hint:'금빛 가운데에 맞춰 보자. 빗나가도 함께 받쳐 주니 떨어지지 않아.',done});
}
function hareHands(){
  hands('짐꾼과 등짐 고쳐 묶기','함께 받치기',['등짐 밑을 두 손으로 받치자.','숫돌을 등에 붙여 낮추자.','풀리지 않게 끈을 눌러 매자.'],()=>{
    finish('dol_hare','짐꾼과 등짐을 함께 받쳐 숫돌을 낮추고 끈을 고쳐 맸다. 장승 뒤 길표와 옛 다리 이야기를 들었다.','dolneomeo_pack_help')();
    nickname('dol_pack_friend','짐 동무','산토끼 짐꾼');
    talk([['산토끼 짐꾼','고맙다, 짐 동무!\n무거운 쪽을 알아서 받치는구나.'],['산토끼 짐꾼','숫돌은 돌쇠 어른 댁에 내려놓고,\n짐 괴던 돌은 무너진 다리 쪽에 보태 둘게.']]);
  });
}
function frogHands(){
  hands('개구리의 마른 잠자리','돌 밀기',['물 흐르는 홈 옆에 작은 돌을 괴자.','따뜻한 돌을 천천히 밀자.','마른 틈까지 돌을 바짝 붙이자.'],finish('dol_frog','따뜻한 돌을 개구리에게 밀고 물이 흐르는 홈을 피해 잠자리를 받쳤다. 높은 바위 틈의 붉은 발자국을 알려 줬다.','dolneomeo_frog_warm'));
}
function magpieHands(){
  hands('까치와 바람막이 놓기','돌 받치기',['담 틈에 넓은 돌을 세우자.','바람 오는 쪽을 한 번 더 받치자.','까치 발 놓을 작은 돌을 놓자.'],()=>{
    finish('dol_magpie','까치와 돌담 틈을 막고 발 놓을 돌을 놓았다. 돌가루 묻은 손을 보고 돌손이라고 불렀다.','dolneomeo_magpie_rest')();
    nickname('dol_stone_hand','돌손','늙은 까치');
    talk([['늙은 까치','이제 날개 밑이 안 시리다.\n손이 하얗구나. 꼭 그 양반 손이로구나.'],['늙은 까치','…돌손아. 이제 그리 부르마. 이리 와 손 녹여라.'],['늙은 까치','담에서 빠진 흰 돌이 남았구나.\n눈 오는 날엔 흰 돌이 길을 알려 주지.']]);
  });
}

/* 결정 D-118: 새 인물 사연 둘. 사연을 켰을 때만 막이 이어진다. 막마다 다른 때에 연다(첫 만남 → 심부름 뒤 → 돌무더기가 잠잠해진 뒤 → 약즙을 보낸 뒤).
   메밀댁: 오래전 겨울 아기를 안고 고개를 넘던 젊은 너구리가 값으로 두고 간 꽃수 보자기(엄마 복선. 산군의 이야기와 두꺼비 할멈 D-02와 맞물린다).
   결정 D-130: 메밀댁은 들쥐다(단풍골 검댕·무쇠와 오소리·다리 아픔이 겹쳐서). 멍석에 메밀을 널어 밭을 못 뜬다. 3막은 아이 보따리 매듭이 계기이고, 보자기도 같은 매듭으로 묶여 있다.
   보자기의 보답(주인에게 돌려주는 장면)은 엔딩에서 거둔다. 여기서는 받아 드는 데서 멈춘다.
   남생이 할미: 지난가을 아빠가 맨 흙빛 천, 백 년 전 북쪽에서 무언가 지나간 가뭄, "샘부터 찾아라"(강철이 복선, 강철이 달래기 D-11). */
function arcScene(key,lines,record,after){
  talk(lines,()=>{G.f[key]=true;diary(key,record);if(after)after();});
}
function talkBadgerArc(){
  const F=G.f;
  if(!Rg.arcs()){talk([['메밀댁','메밀 거두는 철이라 손이 모자라구나.\n길 조심해 가거라.']]);return;}
  if(!F.dolneomeo_badger1){
    talk([['메밀댁','(들쥐 아주머니가 멍석 가에서\n도리깨를 내려놓는다.)'],
      ['메밀댁','보따리 멘 걸 보니 보부상이로구나.'],
      ['메밀댁','짐 나르는 게 일이지?\n하나만 날라 주련.'],
      ['너구리','뭘요?'],
      ['메밀댁','햇메밀 한 자루. 돌쇠 할배 댁에.'],
      ['메밀댁','메밀을 널어 놔서 자리를 못 뜬다.\n등 돌리면 까마귀가 다 쪼아 먹어.'],
      ['메밀댁','우리 맷돌 받침 고쳐 준 값이야.\n늦었다고 전해 주렴.',[
        {t:'메밀 자루를 멘다',go:()=>arcScene('dolneomeo_badger1',[
          ['너구리','(자루를 보따리 위에 얹었다.\n생각보다 무겁다.)'],
          ['메밀댁','허리 펴고 걸어라. 짐이 사람을 끈다.']
        ],'메밀밭 들쥐, 메밀댁 아주머니의 햇메밀 자루를 돌쇠 할배에게 나르기로 했다. 메밀을 널어 둔 멍석을 지키느라 밭을 못 뜨신다.')},
        {t:'지금은 다른 짐이 있어요',go:null}]]]);
    return;
  }
  if(!F.dolneomeo_badger_sent){talk([['메밀댁','돌쇠 할배 댁은 돌담 마을 안쪽이다.\n자루 끈 풀리지 않게 해라.']]);return;}
  if(!F.dolneomeo_badger2){
    arcScene('dolneomeo_badger2',[
      ['메밀댁','잘 받았다더냐?'],
      ['너구리','다음엔 할배가 내려오신대요.'],
      ['메밀댁','그 눈으로? …고집은.'],
      ['메밀댁','(아주머니가 메밀전을 한 장 접어 내민다.)'],
      ['메밀댁','품삯이다. 식기 전에 먹어라.'],
      ['너구리','(메밀전을 먹는 동안, 아주머니 눈이\n내 보따리 매듭에서 멈췄다.)'],
      ['메밀댁','그 매듭, 누가 묶어 줬니?'],
      ['너구리','엄마가요. 떠나는 날 묶어 줬어요.'],
      ['메밀댁','…그렇구나.']
    ],'메밀댁 아주머니가 품삯이라며 메밀전을 주었다. 내 보따리 매듭을 한참 보더니, 누가 묶어 줬는지 물었다.');
    return;
  }
  // 두 사연이 만나는 자리: 할배가 "다음엔 내가 내려가마"고 한 말을, 손으로 길을 읽게 된 꼬마가 지키게 한다.
  if(F.dolneomeo_badger2&&F.dolneomeo_arc_dolsoe6&&!F.dolneomeo_badger_visit){
    arcScene('dolneomeo_badger_visit',[
      ['메밀댁','어제 돌쇠 할배가 내려왔더라.\n그 눈으로, 그 돌담길을.'],
      ['메밀댁','손주 녀석이 할배 손을 잡고\n디딜 돌을 하나하나 짚어 주더구나.'],
      ['메밀댁','"할배, 다음 돌은 이끼가 있어.\n미끄러워." 그러면서.'],
      ['너구리','꼬마가 손으로 돌 읽는 걸 배웠어요.'],
      ['메밀댁','그랬구나. 할배가 내 맷돌 받침을\n손바닥으로 한참 쓸어 보고 갔다.'],
      ['메밀댁','받침 값은 벌써 치렀는데도\n자꾸 더 고쳐 주겠다는구나. …고집은.']
    ],'돌쇠 할배가 손주 꼬마 두더지의 손을 잡고 메밀밭까지 내려왔다고 한다. 꼬마가 디딜 돌을 하나하나 짚어 주었다고.');
    return;
  }
  if(!F.dolneomeo_badger3&&G.boss.dead){
    arcScene('dolneomeo_badger3',[
      ['메밀댁','네 보따리 매듭이 자꾸 눈에 밟혀서\n묵은 짐을 꺼내 봤다.'],
      ['메밀댁','(아주머니가 묶인 그대로인\n보자기 꾸러미를 내민다.)'],
      ['너구리','(매듭이… 내 보따리 매듭이랑 똑같다.)'],
      ['메밀댁','오래전 겨울, 젊은 너구리 하나가\n아기를 안고 이 고개를 넘었다.'],
      ['메밀댁','애가 열이 펄펄 끓길래\n메밀죽을 먹이고 하룻밤 재웠지.'],
      ['메밀댁','떠나면서 이걸 값이라고 두고 갔어.\n그 너구리가 묶은 그대로다.'],
      ['너구리','(매듭 틈으로 귀퉁이 꽃수가 보인다.\n엄마가 내 보따리 끝에 놓던 그 꽃이다.)'],
      ['너구리','…'],
      ['메밀댁','북쪽으로 간다더니,\n돌아오는 길엔 안 들르더구나.']
    ],'메밀댁 아주머니가 내 보따리 매듭을 보고 오래 간직한 보자기 꾸러미를 꺼냈다. 오래전 겨울, 아기를 안고 고개를 넘던 젊은 너구리가 값으로 두고 간 것이다. 내 매듭과 똑같이 묶여 있었고, 귀퉁이에 엄마가 놓던 꽃수가 있었다.');
    return;
  }
  if(F.dolneomeo_badger3&&!F.dolneomeo_badger4&&F.yakMade){
    arcScene('dolneomeo_badger4',[
      ['메밀댁','떠나는구나.'],
      ['메밀댁','(아주머니가 보자기 꾸러미를\n내 손에 쥐여 준다.)'],
      ['메밀댁','보부상은 길에서\n사람 찾는 데 선수라더라.'],
      ['메밀댁','이 고운 걸 주인한테 돌려주렴.\n그 아기도 이제 컸겠지.'],
      ['너구리','…꼭 전해 드릴게요.'],
      ['메밀댁','그 매듭, 엄마한테\n잘 배웠다고도 전하고.']
    ],'메밀댁 아주머니가 꽃수 보자기를 주인에게 돌려주라며 내 손에 쥐여 주었다. 매듭을 잘 배웠다고 엄마에게 전하라고 했다.',()=>{learn('dolneomeo:flower-bojagi');finishWanderer('dol_badger');});
    return;
  }
  talk([['메밀댁',G.boss.dead?'메밀 그루터기에도 서리가 앉는구나.\n겨울이 빨리 오겠다.':'성황당 쪽 돌무더기가 또 울리는구나.\n저쪽 밭엔 가지 마라.']]);
}
function talkTurtleArc(){
  const F=G.f;
  if(!Rg.arcs()){talk([['남생이 할미','천천히 가거라.\n돌길은 서두르는 발을 먼저 문다.']]);return;}
  if(!F.dolneomeo_turtle1){
    talk([['남생이 할미','(돌 그늘에서 늙은 남생이가\n붉은 천 조각을 물고 있다.)'],
      ['남생이 할미','마침 잘 왔다.\n목을 빼도 저 가지까진 안 닿는구나.'],
      ['남생이 할미','이 천 좀 높이 매 주련.\n소원 천은 높을수록 잘 들린다더라.'],
      ['너구리','무슨 소원인데요?'],
      ['남생이 할미','매 주면 말해 주마.',[
        {t:'높은 가지에 천을 맨다',go:()=>arcScene('dolneomeo_turtle1',[
          ['너구리','(돌탑을 딛고 올라\n높은 가지에 붉은 천을 맸다.)'],
          ['너구리','(가장 높은 가지에 흙빛 천이 먼저\n매여 있다. 아빠가 짐 묶을 때 하던 매듭이다.)'],
          ['남생이 할미','그 흙빛 천은 지난가을\n모자 쓴 너구리가 맸지.'],
          ['남생이 할미','키가 커서 손쉽게 닿더구나.\n무슨 소원인지는 말 안 하고.'],
          ['너구리','할머니 소원은요?'],
          ['남생이 할미','…다음에 오거든 말해 주마.\n오늘은 해가 너무 좋다.']
        ],'성황당 남생이 할미의 소원 천을 높은 가지에 매어 주었다. 가장 높은 가지에 아빠가 지난가을 맨 흙빛 천이 있었다. 아빠가 짐 묶을 때 하던 매듭이었다.')},
        {t:'나중에 매 드릴게요',go:null}]]]);
    return;
  }
  if(!F.dolneomeo_turtle2&&G.boss.dead){
    arcScene('dolneomeo_turtle2',[
      ['너구리','소원, 말해 준다고 하셨잖아요.'],
      ['남생이 할미','비 오게 해 달라는 거다.'],
      ['너구리','비는 해마다 오잖아요.'],
      ['남생이 할미','백 년 전에도 그랬지.\n그러다 한 해, 북쪽에서 뭐가 지나갔어.'],
      ['남생이 할미','샘이 마르고,\n내 등딱지가 쩍쩍 갈라졌다.'],
      ['너구리','뭐가 지나갔는데요?'],
      ['남생이 할미','못 봤다. 해가 너무 뜨거워\n고개도 못 들었으니.'],
      ['남생이 할미','요새 북쪽 바람이\n그해랑 냄새가 같구나.']
    ],'남생이 할미의 소원은 비였다. 백 년 전 북쪽에서 무언가 지나간 해에 샘이 마르고 등딱지가 갈라졌다고 했다. 요새 북쪽 바람이 그해와 냄새가 같다고 한다.');
    return;
  }
  if(F.dolneomeo_turtle2&&!F.dolneomeo_turtle3&&F.yakMade){
    arcScene('dolneomeo_turtle3',[
      ['남생이 할미','북쪽으로 가는구나.'],
      ['남생이 할미','물 마른 데를 만나거든\n서두르지 말고 샘부터 찾아라.'],
      // 결정 D-130: 가뭄에 마른 샘과 강철이의 언 샘(D-11)을 함께 잇는다. 샘이 "죽는다".
      ['남생이 할미','뭐가 지나간 자리엔 샘이 먼저 죽는다.\n여름엔 마르고, 겨울엔 언다.'],
      ['남생이 할미','언 샘은 녹이면 다시 흐르지.'],
      ['너구리','할머니 소원도 이뤄지면 좋겠어요.'],
      ['남생이 할미','이 나이엔 소원보다 매듭이 중하다.\n단단히 맸지?'],
      ['너구리','(가지 위 붉은 천과 흙빛 천이\n나란히 바람에 날렸다.)']
    ],'떠나기 전 남생이 할미가 말했다. 물 마른 데를 만나면 서두르지 말고 샘부터 찾으라고. 무언가 지나간 자리엔 샘이 먼저 죽는다고. 여름엔 마르고 겨울엔 언다고.',()=>{learn('dolneomeo:turtle-spring');finishWanderer('dol_turtle');});
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
    ['꼬마 두더지',flat?'납작해서 내 돌집 문이 되겠다!':'줄무늬는 담에 끼우면 딱이겠다!'],
    ['꼬마 두더지','반짝돌은 이제 네 거야. 바꾼 거니까.'],
    ['너구리','그럼 이건 네 돌집 창가에 둘게.\n굴러가지 않게 괴어 주면 되잖아.'],
    ['꼬마 두더지','정말? 창문까지 생겼다!\n할배가 그랬어. 구르는 돌도 괴면 선다고.'],
    ['꼬마 두더지','쐐기돌이 남으면 옛 다리에 보탤래.\n우리 마당 맷돌 받침도 그 다리 돌이래.']
  ],()=>{
    G.f.dolneomeo_mole_pebble=kind;
    Rg.stoneTask({title:'꼬마와 돌집 짓기',verb:'문돌 받치기',hint:'금빛 가운데에 맞춰 놓자. 꼬마가 옆에서 받쳐 주니 굴러가지 않아.',
      steps:['밑돌 두 개를 나란히 놓자.','납작한 문돌을 세워 보자.','반짝돌은 창가에 괴어 놓자.'],
      done:finish('dol_mole','꼬마와 돌집의 밑돌·문돌·창가 돌을 직접 놓았다. 할배 마당의 맷돌 받침은 옛 돌다리 돌이라고 한다.')});
  });
}
function meetMole(){
  talk([
    ['꼬마 두더지','이 돌 봐! 씻으니까 별이 나왔어.\n우리 할배 마당에는 이런 돌이 많아.'],
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

function restMagpie(){
  // 다른 지역 기록은 읽기만 한다. 바로가기를 실제 배달 기억으로 바꾸지 않는다.
  const home=knows('home:galchamgol');
  const met=!!G.f.wanderersDone?.['galchamgol:old_magpie'];
  talk([
    ['늙은 까치',home?'아가, 또 만났구나.\n네가 보낸 것, 네 엄마 손에 잘 쥐여 주었단다.':met?'아가, 또 만났구나.\n걱정 마시라던 네 말, 네 엄마한테 전했단다.':'그 모자… 혹시 단풍골 개울 아래 초가 아이냐?\n나는 그 골짜기에 약 나르던 까치란다.'],
    ['늙은 까치','이 고개는 해마다 높아지는구나.\n…고개가 아니라 내 날개가 낮아진 게지.'],
    ['너구리','그럼 여기서 쉬어 가세요.\n제가 바람 오는 쪽에 앉을게요.'],
    ['늙은 까치','그럼 저 돌담 밑에 잠깐 앉자꾸나.\n담에 틈이 나서 바람이 새는구나.',[
      {t:'돌담에 기대 까치와 쉰다',go:()=>talk([
        ['너구리','(보따리를 세우니 찬바람이 조금 잦아들었다.\n까치가 한쪽 발을 깃털 속에 넣는다.)'],
        ['늙은 까치','돌쇠 그 양반도 꼭 이 자리에 앉곤 했단다.\n손에 박힌 돌가루를 천천히 털면서.'],
        ['늙은 까치','담이 새면 그 양반이 돌부터 괴었지.\n요새는 눈이 어두워 틈이 안 보이는 게지.'],
        ['너구리','(담 틈으로 찬바람이 새어 든다.\n널린 돌 몇 개면 막을 수 있겠다.)']
      ],magpieHands)},
      {t:'먼저 둘러보고 올게요',go:null}
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
    talk([['너구리','다리가 어디에 걸렸을까?\n왼쪽 소원 돌부터 살펴보자.']]);return;
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
    talk([['너구리','옛 '+jo(work.name,'은','는')+' 어떻게 놓였을까?\n소원 돌에서 옛길을 보고, 흰 자리를 짚어 보자.']]);return;
  }
  F.dolBridgeCrewHere=true;
  if(job!==work.job){
    if(!F.dolBridgeBegun){
      talk([['너구리','(할배가 마당 수레를 밀고 왔다.\n수레 가득 돌이 실려 있다.)'],['돌쇠 할배','옛 다리를 보았느냐.\n길손들이 모은 돌도 이제 제자리를 찾겠구나.'],['돌쇠 할배','돌마다 누군가 빈 소원이 있단다.\n그 돌들로 건널 길을 놓자꾸나.'],['너구리','제가 놓을게요. 밑에서 받쳐 주세요.'],['돌쇠 할배',work.at+'부터다.\n먼저 받침이 기울지 않게 해야지.']],()=>{F.dolBridgeBegun=true;});
    }else talk([['너구리','다음은 '+jo(work.name,'이다','다')+'.\n'+work.at+'에 가 보자.']]);
    return;
  }
  talk([['돌쇠 할배',stage===0?'이 돌들은 짐꾼과 꼬마가 날라 왔단다.\n물이 흐를 틈은 남겨 두거라.':stage===1?'밑이 단단하구나. 이제 넓은 돌을 잇자.\n다리판 밑은 내가 받쳐 주마.':'길은 이었으니 발이 벗어나지 않게 하자.\n흰 돌을 놓으면 서리 내려도 가장자리가 보인다.'],
    ['너구리',jo(work.name,'을','를')+' 놓을까요?',[
      {t:jo(work.name,'을','를')+' 함께 놓는다',go:()=>Rg.stoneTask({title:work.title,verb:'돌 맞춰 놓기',steps:work.steps,stones:work.wishes,
        hint:'돌쇠 할배가 밑을 받쳐 준다. 가운데를 맞춰 놓자. 떨어져도 다시 받쳐 주신다.',done:()=>{
          F.dolBridgeStage=stage+1;
          diary('dol_bridge_'+stage,jo(work.name,'을','를')+' 놓았다. '+work.wishes.join(' / '));
          if(stage===2)bridgeComplete();
          else talk([['돌쇠 할배',stage===0?'받침이 섰다. 가운데 다리판 자리로 가자.':'이제 걸을 수 있겠다. 오른쪽 끝에 가장자리 돌도 놓자.']]);
        }})},
      {t:'돌 모양을 더 살펴볼게요',go:null}]]]);
};
function bridgeComplete(){
  const lines=[['뿔이','다리 끝을 디뎌 봐도 되겠나.'],['돌쇠 할배','물길은 남겼고 가장자리도 세웠다.\n네가 마지막으로 살펴보거라.']];
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
  if(G.f.dolBridgeReturn){talk([['산토끼 짐꾼','짐 동무, 이번엔 나도 길을 받칠게.\n다녀오면 헐거운 돌부터 같이 보자.']]);return;}
  talk([['산토끼 짐꾼','저 다리를 네가 다시 놓았다며?\n짐을 지고도 쉴 자리가 생겼구나.'],['산토끼 짐꾼','바깥 돌을 같이 짚어 볼까?\n눈이 와도 이 줄은 보이겠네.',[
    {t:'짐꾼과 가장자리를 눌러 본다',go:()=>hands('돌다리 다시 살피기','함께 눌러 보기',['첫 받침이 움직이지 않는지 짚자.','이음새가 벌어졌는지 보자.','쉼돌을 함께 눌러 보자.'],()=>{
      G.f.dolBridgeReturn=true;diary('dol_bridge_return','복원한 다리에서 다시 만난 짐꾼과 가장자리·이음새·쉼돌을 짚었다. 짐꾼도 지나갈 때마다 길을 살피겠다고 했다.');
      talk([['산토끼 짐꾼','끄떡없네. 나도 지날 때마다 볼게.\n짐 받쳐 주던 손으로 다리까지 놓았구나.']]);
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
    {t:'마을을 조금 더 둘러볼게요',go:null}]]]);
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
      {...examine('broken_bridge',2170,'다리 받침 살펴보기','stone',''),get text(){return (G.f.dolBridgeStage||0)>=3?'돌이 다시 이어졌다. 아래로 물도 잘 흐른다.\n새 다리 가장자리는 흰 돌이라 잘 보이네.':'받침돌만 남고 다리판은 아래로 떨어졌다.\n왼쪽 소원 돌은 왜 여기 서 있을까?';}}
    ],
    wanderers:[{id:'dol_hare',name:'산토끼 짐꾼',hint:'길 저편에서 무거운 등짐에 끙끙대는 소리가 들린다.',get x(){return G?.f.dolBridgeStage>=3?2280:940;},draw:drawGuest('hare'),talk:helpHare,greeting:'낮게 묶으니 발이 편하구나.\n고개 안쪽 길은 꼭 살피고 가라.'}],
    stamps:[stamp('jangseung',1710,156)]
  },
  village:{
    examines:[
      examine('stone_channel',360,'돌 물길 들여다보기','water','집집마다 돌 홈을 이어 물을 나눠 쓴다.\n얼지 말라고 짚도 조금 덮어 뒀네.'),
      {...examine('mill_edge',1310,'마당 맷돌 받침 만져 보기','stone',''),get text(){
        return G.f.ppuriPassed?'내가 간 가루로 장승 앞 금줄이 걷혔다.\n맷돌 자개 틈에도 메밀 냄새가 남아 있다.':G.f.dolneomeo_mole_pebble?'꼬마가 옛 돌다리 돌이라던 받침이다.\n한쪽에 물에 닳은 둥근 자국이 있다.':'받침돌 한쪽만 유난히 매끈하다.\n맷돌 밑에서도 먼 길을 온 돌 냄새가 난다.';
      }},
      examine('warm_hearth',2290,'공동 화로 살펴보기','bowl','석수들이 일을 마치고 손을 녹이는 화로다.\n재 속 돌은 불이 꺼진 뒤에도 미지근하다.')
    ],
    wanderers:[
      {id:'dol_mole',name:'꼬마 두더지',hint:'달그락, 달그락. 누가 돌멩이를 굴리며 노는 소리가 난다.',x:740,draw:drawGuest('mole'),talk:meetMole,greeting:'우리 돌집에 문이 생겼어!\n반짝돌도 이제 안 굴러가.'},
      {id:'dol_magpie',name:'늙은 까치',x:2080,draw:drawGuest('magpie'),talk:restMagpie,greeting:'돌손, 좀 쉬어 가거라.\n담 뒤는 바람이 덜하단다.'}
    ],
    stamps:[{...stamp('mill_base',1160,156),base:'none',face:-12}]   // D-116: 맷돌 그림 앞면에 바로 찍는다(받침 겹침 없음)
  },
  field:{
    examines:[
      examine('memil_stubble',390,'메밀 그루터기 살펴보기','stalk','메밀을 거둔 자리마다 짧은 줄기가 섰다.\n돌 사이에 떨어진 알은 아직 단단하다.'),
      examine('tied_reeds',1120,'억새 묶음 살펴보기','stalk','긴 억새는 병을 싸고 짧은 억새는 둥지에 깐다.\n꺾인 것도 버리지 않는구나.'),
      {...examine('nest_door',1590,'둥지 앞 작은 돌 살펴보기','stone',''),get text(){return G.f.dolneomeo_arc_kku7?'억새로 묶은 그림이 문턱 돌에 괴어 있다.\n봄에 눈을 뜨면 제일 먼저 보일 자리다.':G.f.kkuDone?'내가 벤 억새 끝이 둥지 틈에서 삐져나왔다.\n바람이 불어도 안쪽은 가만하다.':'둥지 문턱에 납작돌을 비스듬히 세웠다.\n꾸벅이가 졸다가 굴러 나오지 말라고 놨나?';}}
    ],
    wanderers:[{id:'dol_badger',name:'메밀댁',hint:'털썩, 털썩. 메밀밭 쪽에서 도리깨질 소리가 난다.',x:760,draw:drawGuest('mouse'),talk:talkBadgerArc,
      greeting:'보자기 잘 챙겼지?\n길에서 젖지 않게 품에 넣어라.'}],stamps:[]
  },
  cliff:{
    examines:[
      examine('silver_lichen',530,'은빛 바위 살펴보기','stone','서리 아래 이끼가 동그란 테를 그렸다.\n돌은 가만있어도 무늬가 자라는구나.'),
      examine('frozen_trickle',1850,'얼어붙은 물줄기 살펴보기','water','물이 흐르던 홈에 가느다란 얼음이 매달렸다.\n한 방울씩 녹으면 아래 바위 틈이 젖겠다.'),
      {...examine('dry_crack',2540,'갈라진 바위 들여다보기','stone','',138),get text(){return G.f.dolneomeo_frog_warm?'개구리가 말한 마른 바위 틈이다.\n붉은 발자국이 구름바다 쪽을 향한다.':'깊은 틈 안쪽은 서리가 하나도 없다.\n누가 비를 피해 쪼그려 앉았던 걸까?';}}
    ],
    wanderers:[{id:'dol_frog',name:'움츠린 개구리',hint:'돌 틈 어딘가에서 가늘게 떠는 개구리 울음이 들린다.',x:1440,draw:drawGuest('frog'),talk:warmFrog,greeting:'배가 따뜻해졌어… 고마워.\n이번엔 마른 틈에서 잘게.'}],
    stamps:[stamp('cliff_crack',2390)]   // D-116: 골렘 뒤에야 깔리는 턱(112) 대신 절벽 밑 바위에. 턱이 없을 때 허공에 뜨지 않는다
  },
  shrine:{
    examines:[
      examine('wish_cloth',380,'소원 천 살펴보기','cloth','새 천 밑에 색 바랜 천이 겹쳐 달렸다.\n같은 가지에 몇 번의 겨울이 묶였을까?'),
      examine('grain_dish',950,'작은 제기 살펴보기','bowl','돌그릇 안에 메밀가루가 조금 남았다.\n바람이 들어도 깊은 그릇이라 안 날아간다.'),
      {...examine('small_tower',2080,'낮은 돌탑 살펴보기','stone',''),get text(){return G.boss.dead?'큰 돌들이 내려앉아 낮은 탑을 받쳤다.\n작은 돌 하나도 굴러떨어지지 않았다.':'바람이 세도 이 낮은 탑은 흔들리지 않는다.\n밑돌 틈마다 작은 돌을 받쳐 뒀네.';}}
    ],
    wanderers:[{id:'dol_turtle',name:'남생이 할미',hint:'돌 그늘 쪽에서 느릿느릿 돌을 긁는 소리가 난다.',x:560,draw:drawGuest('turtle'),talk:talkTurtleArc,
      greeting:'샘부터 찾으라 했지?\n…매듭은 단단히 맸고.'}],stamps:[]
  }
});
for(const [id,content] of Object.entries(Rg.expansionContent())){
  if(Rg.zones?.[id])Object.assign(Rg.zones[id],content);
}
Rg.installExpansion?.();

})();
