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
  if(typeof grantNickname==='function'){
    if(G.f.jxKiteDone)grantNickname('jangteo_kite','연 건지는 손','얼레');
    if(G.f.jxYutReward)grantNickname('jangteo_yut','한판 벗','투호 노인들');
  }
};

// 결정 D-136: 순수 지문 (…) 줄은 모두 너구리 화자 밑에 두고 주어를 적는다 (Fable 최종 검수 Q6). 지문+대사 혼합 줄은 그대로.
/* [시험판] 선택한 사연만 연다. 거래·가공·창고 지키기는 기존 조건을 따른다.
   지역 간 기억: nalDTalk는 읽기만, jangteoArcsNal3는 영산에서 읽을 수 있다. */
// 결정 D-13: 큰 장터의 밤 얼굴 (design/data/decisions.csv)
function morakNight(){
  arcScene('jangteoArcsMorak2',[
    ['모락','어, 그 보자기 말고! 그건 따로 싼 거야.'],
    ['너구리','누구 거예요?'],
    ['모락','멀리 간 우리 새끼 줄 설 떡이야!'],
    ['너구리','아주머니는요? 아주머니 저녁은요?'],
    ['모락','내 저녁? 어이쿠, 그걸 잊었네!'],
    ['모락','참, 하나 더 쌌어!\n네 엄마도 설 떡 드셔야지!']
  ],'모락은 멀리 떠난 새끼에게 보낼 설 떡을 따로 싸 두었다. 정작 자기 저녁은 아직이었다. 엄마 몫의 설 떡도 하나 싸 주었다.');
}
function yeotNight(){
  arcScene('jangteoArcsYeot2',[
    ['엿방울',G.boss.dead?'어라… 오늘 밤은 창고 쪽이 조용하네?\n그래도 수레 밑이 버릇이 돼서~'/* 결정 D-136: 같은 밤엔 전해 들을 길이 없다 */:'쉿, 꼬마야. 수레 밑에 있는 건 비밀이야~'],
    ['너구리','왜 수레 밑에 계세요?'],
    ['엿방울','작년 그믐에 도깨비가 내 엿가위를 가져갔지 뭐야.'],
    ['엿방울','그 뒤로 밤엔… 여기가 제일 편해~']
  ],'엿방울은 작년 그믐 밤 도깨비에게 엿가위를 빼앗겼다. 낮에 치던 가위는 빌린 것이었다.');
}
function yeotReturn(){
  // 결정 D-290: 가위를 찾아 준 몫. 되찾은 가위로 처음 끊은 호박엿
  arcScene('jangteoArcsYeotReturned',[
    ['너구리','창고에 돌아온 물건 사이에\n날이 반질한 엿가위가 있었어요.'],
    ['너구리','작년 그믐에 빼앗겼다던 그 가위 같아서요.'],
    ['엿방울','어라, 내 엿가위! …손잡이 끈도 내가 감은 그대로네~'],
    ['너구리','(엿방울 아주머니가 그 가위로 호박엿을 툭툭 끊어 내 손에 얹는다.)'],
    ['엿방울','찾아 준 값은 해야지~ 내 가위로 끊은 첫 엿이야.'],
    gotLine('hobakyeot',2),
    ['엿방울','자, 제 소리가 나는지 들어 볼까~']
  ],'창고에 돌아온 물건 사이에서 엿방울의 엿가위를 찾았다. 엿방울은 그 가위로 처음 끊은 호박엿을 주고, 제 가위로 치는 장단을 함께 맞춰 보자고 했다.',()=>openRhythm(false));
}
/* 아빠 메모의 "값은 이미 치러졌다"를 묻는다. 영감은 엄마의 거래를 모른다. 자기 장부에 있는 아빠의 셈만 보여 준다. */
function bueongLedger(){
  arcScene('jangteoArcsBueong2',[
    ['너구리','아빠 메모에 "값은 이미 치러졌다"고 적혀 있어요.\n무슨 값이에요?'],
    ['너구리','(영감님이 장부를 한 장 넘겨 오래된 줄을 짚는다.)'],
    ['부엉 영감','내 장부에 있는 네 아비 셈은 이것뿐이다.'],
    ['부엉 영감','날쌘. 상단 물건을 잃은 날의 기록이다.'],
    ['너구리','그 옆은 아빠예요?'],
    ['부엉 영감','그래. 네 아비가 대신 물어 주었다.'],
    ['부엉 영감','메모의 값이 이건지는 나도 모른다.']
  ],'아빠 메모의 "값"을 묻자 부엉 영감이 옛 장부를 펼쳤다. 날쌘이 상단 물건을 잃었을 때 아빠가 대신 물어 준 줄이 있었다. 메모의 값이 이것인지는 영감도 모른다고 했다.');
}
function nalLedger(){
  sceneNext('j_nal_ledger');
  arcScene('jangteoArcsNal3',[
    ['너구리','아저씨, 부엉 영감님 장부에\n아저씨 이름이 있던데요.'],
    ['날쌘','…누가 남의 장부를 보래.'],
    ['너구리','아빠 이름 옆에요.'],
    ['날쌘','…장부 얘기 하지 마. 팥이나 봐.']
  ],'부엉 영감 장부에 날쌘 아저씨 이름이 아빠 이름 옆에 있다고 하자, 날쌘 아저씨가 말을 막았다. 장부 얘기는 하지 말라고 했다.');
}
/* 날쌘이 장부 얘기를 막은 뒤에만 연다. 영산에서 날쌘이 "갚을 게 많다"고 하는 까닭의 복선. */
// 결정 D-03: 상단 셈은 끝났지만 날쌘과 아빠 사이 셈은 남았다 (design/data/decisions.csv)
function bueongPromise(){
  arcScene('jangteoArcsBueong3',[
    ['너구리','날쌘 아저씨가 장부 얘기는 하지 말래요.'],
    ['너구리','(영감님이 장부를 넘기다 날쌘 아저씨 줄에 손을 멈춘다.)'],
    ['부엉 영감','그럴 테지. 그 일 뒤로 상단을 떠났고,\n이 마루엔 안 올라온다.'],
    ['너구리','아빠가 갚았으면 끝난 거 아니에요?'],
    ['부엉 영감','상단 셈은 끝났다.\n날쌘과 네 아비 사이 셈은 아직이고.'],
    ['부엉 영감','셈은 맞아야 한다. 그래서 이 줄은 안 지운다.']
  ],'날쌘은 그 일 뒤 상단을 떠났다. 부엉 영감은 상단 셈은 끝났어도 날쌘과 아빠 사이 셈은 아직이라며, 그 줄을 지우지 않는다고 했다.');
}

/* ---------- 결정 D-119: 큰 장터 사연 넷 (사용자 지시 "분량은 NPC 서사로", D-98) ----------
   모두 선택이다(?arcs=0이면 열리지 않는다). 막마다 다른 때(낮·밤·그믐 뒤 설날 아침)에 연다.
   ① 투호 노인들 "부르는 이름": 첫 판 구경 뒤 낮 → 그 밤 → 설날 아침
   ② 얼레 "멀리서 보이는 표시": 연을 건진 뒤 밤 → 설날 아침
   ③ 부엉 영감 "장부 아랫줄": 신표 뒤 밤 → 그믐 창고를 지킨 밤 → 약떡을 보낸 뒤 밤
   ④ 모락과 엿방울 "작년 그믐의 빚": 낮(떡 심부름) → 밤(엿방울의 속사정) → 엿가위를 찾은 뒤 낮 */

/* ① 투호 노인들(D-325). 흰눈썹 노인은 가을부터 이름을 흘린다. 곰방대 노인은 화살을 던질 때마다 제 이름을 외친다.
   아이는 엄마가 제 이름을 놓치는 걸 안다(출발 일기). 그래서 둘째 막에서 제 얘기를 꺼낸다. */
function elderArc1(){
  arcScene('jangteoArcsElder1',[
    ['흰눈썹 노인','한 판 더 하자. 이번엔 내가 이긴다.'],
    ['곰방대 노인','그 말은 어제도 했다.'],
    ['흰눈썹 노인','어제는 어제고. 자, 던져 봐라…'],
    ['흰눈썹 노인','…어, 그… 봉구야? 아니, 칠복이…'],
    ['곰방대 노인','곰방대다. 곰방대.'],
    ['곰방대 노인','쉰 해를 같이 놀고도 이런다니까.'],
    ['흰눈썹 노인','안다, 알아. 혀가 꼬여서 그래.'],
    ['너구리','(흰눈썹 할아버지 귀가 빨개졌다.)'],
    ['곰방대 노인','(화살을 높이 든다.) 곰방대가 던진다!'],
    ['곰방대 노인','…들었다. 곰방대 하나!'],
    ['너구리','왜 던질 때마다 이름을 외치세요?'],
    ['곰방대 노인','투호는 기세지, 기세.'],
    ['너구리','(곰방대 할아버지가 곰방대를 물고\n흰눈썹 할아버지 쪽은 보지 않는다.)'],
    ['곰방대 노인','밤에 다시 와 봐라.\n저 양반은 해 지면 일찍 들어가거든.']
  ],'투호 할아버지 하나가 쉰 해 친구의 이름을 놓쳤다. 곰방대 할아버지는 화살을 던질 때마다 제 이름을 크게 외쳤다. 밤에 다시 오라고 했다.');
}
function elderArc2(){
  arcScene('jangteoArcsElder2',[
    ['곰방대 노인','왔구나. 앉아라. 불 좀 쬐고.'],
    ['곰방대 노인','(곰방대를 털며) 낮에 봤지? 저 양반.'],
    ['너구리','이름을 잊으셨어요.'],
    ['곰방대 노인','가을부터다. 얼굴은 다 알아. 이름만 흘려.'],
    ['곰방대 노인','처음엔 장꾼들 이름이더니\n요즘은 내 이름까지.'],
    ['너구리','…우리 엄마도 그래요.'],
    ['너구리','제 얼굴은 보시는데,\n제 이름만 자꾸 놓쳐요.'],
    ['너구리','(곰방대 할아버지가 한참 말없이 연기만 뿜는다.)'],
    ['곰방대 노인','그래서 내가 외친다. 던질 때마다.'],
    ['곰방대 노인','잊는 건 저 양반 몫이고,\n부르는 건 내 몫이니까.'],
    ['너구리','그러면… 다시 기억하세요?'],
    ['곰방대 노인','모르지. 그래도 들리긴 하겠지.'],
    ['곰방대 노인','들리는 동안은 안 잊은 거다.'],
    ['곰방대 노인','설날 아침에 한 판 하자.\n저 양반, 설엔 꼭 일찍 나온다.']
  ],'밤에 곰방대 할아버지가 말했다. 흰눈썹 할아버지는 가을부터 이름을 흘린다고. 그래서 던질 때마다 제 이름을 외친다고. 들리는 동안은 안 잊은 거라고. 엄마 생각이 났다.');
}
function elderArc3(){
  arcScene('jangteoArcsElder3',[
    ['흰눈썹 노인','왔냐, 꼬마. 설날 첫판이다.'],
    ['곰방대 노인','네가 먼저 던져라.'],
    ['너구리','(화살을 던졌다. 항아리 테를 맞고 튕겨 나갔다.)'],
    ['흰눈썹 노인','이번엔 내 차례지.\n설에 귀에 한 번 꽂으면 한 해가 편하다더라.'],
    ['너구리','(흰눈썹 할아버지의 화살이 높이 떴다가 항아리 귀에 쏙 꽂힌다.)'],
    ['흰눈썹 노인','귀다! 곰방대야, 봤냐!'],
    ['곰방대 노인','…'],
    ['너구리','(곰방대 할아버지가 곰방대를 입에서 떼고 한참 웃는다.)'],
    ['곰방대 노인','봤다. 봤어.'],
    ['흰눈썹 노인','뭘 그렇게 웃어. 귀 한 번이 그렇게 좋으냐?'],
    ['곰방대 노인','그래. 귀에 꽂혀서 좋아 그런다.'],
    ['너구리','(곰방대 할아버지 눈가가 젖었다.)'],
    ['곰방대 노인','꼬마야. 집에 가거든\n네 이름, 네가 자꾸 들려 드려라.'],   // 결정 D-136: 노인의 논리대로 제 이름을 엄마 귀에 들려 드린다
    ['너구리','네.']
  ],'설날 아침 투호판에서 흰눈썹 할아버지가 곰방대 할아버지의 이름을 불렀다. 화살이 귀에 꽂혀서 웃는 거라고 했지만, 곰방대 할아버지는 한참 웃었다. 집에 가거든 나도 자꾸 불러 드리라고 했다.',()=>learn('arc:jangteo:elder-name'));
}

/* ② 얼레. 연을 건진 뒤(jxKiteDone)에 이어진다. 동생은 봄에 할머니 댁에 맡겨졌고 설에 온다고 했다.
   아이는 아빠 편지("눈 오기 전에 돌아가마", D-36)를 떠올린다. 모자는 아빠 것이다. */
function kiteArc2(){
  arcScene('jangteoArcsKite2',[
    ['얼레','밤엔 연이 안 보여.'],
    ['얼레','동생이 깜깜할 때 오면\n붉은 차일을 못 찾을 거야.'],
    ['너구리','등은 없어?'],
    ['얼레','있어. 근데 차일 기둥이 높아서 못 걸어.'],
    ['너구리','내가 올라갈게. 처마도 올라갔잖아.'],
    ['너구리','(상자를 딛고 차일 기둥 꼭대기에 등을 걸었다.)'],
    ['얼레','와, 저 끝 골목에서도 보이겠다!'],
    ['얼레','낮엔 연 꼬리를 보고 오고,\n밤엔 이 불을 보고 오면 돼.'],
    ['너구리','동생은 몇 살이야?'],
    ['얼레','꼭지라고, 나보다 두 살 아래.\n봄에 할머니 댁에 맡겨졌어.'],   // 결정 D-322: 동생 이름은 꼭지
    ['얼레','설엔 꼭 온댔어. 약속했어.'],
    ['너구리','(…눈 오기 전에 돌아가마.\n아빠 편지도 그랬는데.)'],
    ['얼레','왜? 무슨 생각 해?'],
    ['너구리','아냐. 불 안 꺼지게 기름 넉넉히 넣자.']
  ],'얼레와 붉은 차일 기둥 꼭대기에 등을 걸었다. 설에 온다는 동생이 밤에도 찾아오게. 아빠 편지의 "눈 오기 전에"가 생각났다.');
}
function kiteArc3(){
  // 결정 D-290: 차일 기둥에 등을 달아 준 몫. 동생이 할머니 댁에서 싸 온 깨강정을 나눠 준다.
  arcScene('jangteoArcsKite3',[
    ['얼레','왔어! 꼭지 왔어!'],
    ['너구리','(차일 뒤로 작은 발 두 개가 더 보인다.)'],
    ['얼레','새벽에 장터 들어오다가\n등불 보고 곧장 왔대!'],
    ['얼레','아침엔 연 꼬리도 봤대.\n둘 다 알아봤대!'],
    ['너구리','멀리서도?'],
    ['얼레','응. 우리 연은 꼬리가 길잖아.'],
    ['너구리','(차일 뒤에서 "형아, 연 날려 줘" 하는\n작은 목소리가 들린다.)'],
    ['얼레','이따 같이 날리자. 너도 와!'],
    ['너구리','난 북쪽으로 가야 해.'],
    ['얼레','북쪽엔 왜?'],
    ['너구리','아빠 찾으러. 이 모자, 아빠 거야.'],
    ['얼레','그럼 꼭 쓰고 다녀.\n우리 연 꼬리처럼 멀리서도 보이게.'],
    ['얼레','아, 잠깐! 할머니가 깨강정을 싸 보냈어.\n등 달아 준 값이야. 길에서 먹어.'],
    gotLine('gangjeong',2),
    hintLine('gangjeong',['얼레','할머니는 깨를 꿀에 버무려서\n꾹꾹 눌러 굳혀. 나도 거들었어!'])   // 결정 D-461: 귀띔
  ],'설날 아침, 얼레 동생 꼭지가 왔다. 새벽엔 차일 등불을, 아침엔 연 꼬리를 보고 찾아왔단다. 등 달아 준 값이라며 할머니가 싸 보낸 깨강정을 나눠 주었다. 아빠도 멀리서 이 모자를 알아볼까.');
}

/* ③ 부엉 영감. 아이의 물품 장부(아빠 수첩 뒤)에 날짜를 적는 법 → 창고 지킨 셈을 상단 장부에 적는 밤 → 떠나는 날의 셈.
   신표 줄엔 표시만 했다(bueongGiveNow). 셈 줄엔 이름이 필요하다. 아이는 엄마가 놓치는 제 이름을 선뜻 말하지 못한다.
   이름은 엔딩까지 나오지 않는다. 그래서 "그 아들"로 적고 이름 칸을 비운다. */
function bueongKidArc1(){
  arcScene('jangteoArcsKid1',[
    ['너구리','영감님, 저도 장부 적어요.'],
    ['너구리','아빠 수첩 뒤에 이어서요.\n누구랑 뭘 바꿨는지.'],
    ['너구리','(영감님이 장부를 덮고 수첩을 받아 한 장씩 넘긴다.)'],
    ['부엉 영감','도토리 가루, 칡뿌리, 숯… 단풍골이로군.'],
    // 결정 D-136: 영감이 아빠 글씨를 아는 근거는 눈앞의 수첩 앞장(아빠가 적은 2할, 기획서 §7 확정)이다.
    ['너구리','(영감님이 앞장으로 돌아가 바랜 먹을 짚는다.)'],
    ['부엉 영감','이 앞은 네 아비 글씨로구나. 두 번 읽어야겠다.\n네 글씨가 낫다.'],
    ['부엉 영감','헌데 날짜가 없구나.'],
    ['너구리','날짜요?'],
    ['부엉 영감','값은 철마다, 고장마다 다르다.\n언제 어디서 바꿨는지 없으면 셈이 안 맞는다.'],
    ['너구리','단풍골에선 도토리 가루가 귀했는데…'],
    ['부엉 영감','여기선 쌀가루가 귀하지. 설 대목이니까.'],
    ['부엉 영감','(붓을 꺼내 첫 줄 옆에 작게 적는다.)\n"늦가을, 단풍골."'],
    ['부엉 영감','이 뒤로는 네가 적어라.']
  ],'부엉 영감에게 물품 장부를 보여 드렸다. 글씨는 아빠보다 낫다고 했다. 값은 철마다 고장마다 달라서 날짜를 적어야 한다며, 첫 줄 옆에 "늦가을, 단풍골"을 적어 주었다.',()=>learn('arc:jangteo:dates'));
}
function bueongKidArc2(){
  arcScene('jangteoArcsKid2',[
    ['부엉 영감','그믐밤 창고. 지킨 셈을 적어야지.'],
    ['부엉 영감','신표 줄엔 표시만 했다만\n셈 줄엔 이름이 들어가야 한다.'],
    ['부엉 영감','(붓에 먹을 찍는다.) 이름.'],
    ['너구리','…'],
    ['너구리','(입을 열었다가 닫았다.\n엄마가 아침마다 놓치던 그 이름.)'],
    ['너구리','(영감님은 재촉하지 않고 장부를 한 장 넘긴다.)'],
    // 결정 D-136: 빈 이름 칸의 약속. 영산·엔딩 검수 Q8과 같은 줄이며 영산에는 다시 넣지 않는다. 설날 아침 영감이 이 말을 받는다.
    ['너구리','…엄마가 다시 불러 주면,\n그때 적으러 올게요.'],
    ['너구리','아빠 줄 아래 적어 주세요.\n그 아들이라고요.'],
    ['너구리','(영감님이 아빠 줄 바로 아래 새 줄을 긋는다.)'],
    ['부엉 영감','"그 아들. 그믐밤 창고를 지킴."'],
    // 결정 D-428: 바로 위 아빠 줄도 이름 칸이 하얗다(신표 장면). 영감은 그 칸을 제가 비워 둔 줄 안다
    ['부엉 영감','이름 없는 줄이 둘이로구나.\n아비 줄에, 아들 줄.'],
    ['너구리','…괜찮아요?'],
    ['부엉 영감','셈이 맞으면 된다. 이름 칸은 비워 두마.']
  ],'부엉 영감이 그믐밤 창고 지킨 셈을 상단 장부에 적었다. 이름을 물었는데 말이 나오지 않았다. 아빠 줄 바로 아래 "그 아들"이라고만 적었다. 이름 칸은 비워 두었다. 엄마가 다시 불러 주면 그때 적으러 오겠다고 했다.',()=>learn('arc:jangteo:kidline'));
}
function bueongKidArc3(){
  arcScene('jangteoArcsKid3',[
    ['너구리','영감님, 아침인데 안 주무세요?'],
    ['부엉 영감','창고 일은 끝났고, 보부상은 설 쇠면 길을 뜬다.\n셈은 떠나는 날 맞춘다. 상단 법이다.'],
    ['너구리','약떡을 다 쪘어요. 늙은 까치 편에\n엄마한테 보내고, 북쪽으로 가려고요.'],
    ['너구리','(영감님이 장부를 펼쳐 아빠 줄과\n그 아래 빈 이름 칸을 짚는다.)'],
    ['너구리','제가 갚을 게 있어요?'],
    ['부엉 영감','없다. 네 아비 셈은 네 아비 몫으로 남겨 둔다.\n와서 맞출 사람이 따로 있으니.'],   // 결정 D-136: 남은 셈은 아빠 몫(영산 복선)
    ['너구리','(영감님이 수첩 장부 끝장에 상단 도장을 꾹 찍는다.)'],
    ['부엉 영감','보부상끼리는 이 도장을 알아본다.'],
    ['너구리','아빠도 이 도장 받았어요?'],
    ['부엉 영감','받았지. 이 마루에서.'],
    ['부엉 영감','네 어미가 다시 부르거든,\n이름 칸 채우러 와라.'],   // 결정 D-136: 아이의 약속을 되받는다
    ['너구리','네. 꼭요.']
  ],'설날 아침, 부엉 영감이 자지 않고 기다렸다. 떠날 채비를 말씀드리자 부엉 영감이 상단 셈은 떠나는 날 맞춘다며 수첩 장부 끝에 상단 도장을 찍어 주었다. 아빠도 이 마루에서 받았단다. 이름 칸을 채우면 들르라고 했다.',()=>learn('arc:jangteo:stamp'));
}

/* ④ 모락과 엿방울. 작년 그믐 밤 모락이 엿방울을 떡 시렁 밑에 숨겼다. 엿방울은 가위를 찾겠다고 그 손을 뿌리치고 나갔다가
   가위를 빼앗겼다(yeotNight와 같은 사건). 고맙단 말을 못 해서 모락의 떡을 못 받는다. 제 가위를 되찾은 뒤에야 말한다. */
function pairArc1(){
  arcScene('jangteoArcsPair1',[
    ['모락','이거, 엿방울한테 좀 갖다줘.'],
    ['너구리','(따끈한 떡 보자기다. 김이 아직 오른다.)'],
    ['너구리','바로 옆인데, 직접 주시면 안 돼요?'],
    ['모락','내가 주면 안 받아. 그 여우 고집이 어떤데!'],
    ['모락','작년 그믐부터 내 떡은 입에도 안 대.'],
    ['너구리','왜요?'],
    ['모락','글쎄다! 물어도 웃기만 하고.'],
    ['모락','(국자를 휘휘 젓는다.)\n먹고 해야지. 장사는 먹고 하는 건데.']
  ],'모락 아주머니가 엿방울 아주머니에게 떡을 갖다 달라고 했다. 작년 그믐부터 모락의 떡은 입에도 안 댄다고 했다.');
}
function pairArc2(){
  arcScene('jangteoArcsPair2',[
    ['너구리','모락 아주머니가 드시래요.'],
    ['엿방울','어머~ 떡? 난 엿장수라 단 건 질렸어~'],
    ['너구리','엿도 단데요.'],
    ['엿방울','…이 너구리 꼬마, 말 받아치는 것 좀 봐~'],
    ['너구리','(엿방울 아주머니가 떡 보자기를 받으려다 손을 거둔다.)'],
    ['엿방울','도로 갖다드려. 고맙다고만 하고.'],
    ['너구리','왜 안 드세요?'],
    ['엿방울','엿장수 마음이지~'],
    ['너구리','(웃는데 귀가 축 처졌다.)']
  ],'엿방울 아주머니는 모락의 떡을 받으려다 손을 거뒀다. 고맙다고만 전해 달라고 했다. 웃는데 귀가 처져 있었다.');
}
function pairArc3(){
  arcScene('jangteoArcsPair3',[
    ['너구리','(엿방울 아주머니가 수레 밑에서 귀만 내놓고 있다.)'],
    ['너구리','아주머니, 모락 아주머니랑 싸웠어요?'],
    ['엿방울','싸운 거 아냐~ …내가 빚진 거지.'],
    ['엿방울','작년 그믐 밤에도 헌것들이 들썩였어.'],
    ['엿방울','나는 가위만 쥐고\n그 자리에 얼어붙었어.'],
    ['엿방울','그때 모락이 나를 번쩍 들어다\n떡 시렁 밑에 밀어 넣었지.'],
    ['엿방울','자기는 문 앞에 서서 주걱 들고.'],
    ['너구리','그럼 고마운 거잖아요.'],
    ['엿방울','고마운데… 그 와중에 가위를 떨어뜨렸거든.\n찾겠다고 그 손을 뿌리치고 나갔어.'],
    ['엿방울','가위는 빼앗기고, 고맙단 말은 못 하고.'],
    ['엿방울','그 떡을 받으면\n그날 일을 없던 걸로 하는 것 같아서~'],
    ['너구리','(아주머니는 끝까지 웃는 목소리였다.)']
  ],'밤에 엿방울 아주머니가 털어놓았다. 작년 그믐 밤 모락 아주머니가 자기를 떡 시렁 밑에 숨겨 줬는데, 가위를 찾겠다고 그 손을 뿌리치고 나갔다고. 고맙단 말을 못 해서 떡을 못 받는다고.',()=>learn('arc:jangteo:pair-night'));
}
function pairArc4(){
  arcScene('jangteoArcsPair4',[
    ['엿방울','너구리 꼬마, 따라와 봐~\n제 가위 소리 들려줄 데가 있어.'],
    ['너구리','(엿방울 아주머니가 떡집 줄 앞에 선다.)'],
    ['너구리','(철컥, 철컥. 아주머니의 가위 소리가 골목을 울린다.)'],
    ['엿방울','떡국 떡 사려~ 설날 아침 가래떡~\n모락네 떡은 김이 반이래요~'],   // 결정 D-136: 설날 아침 떡집 줄은 가래떡 줄
    ['모락','어? 너, 그 가위…!'],
    ['엿방울','작년 그믐에 고마웠어.\n…이제야 말하네~'],
    ['모락','…'],
    ['모락','먹고 해, 먹고! 그 말 하느라 굶었겠다!'],
    ['엿방울','(떡을 한 입 크게 문다.)\n…역시 김이 반이네~'],
    ['모락','(국자로 눈가를 훔친다.) 김이 매워서 그래!'],
    ['너구리','(떡집 줄이 엿가위 장단에 맞춰 줄어든다.)']
  ],'엿방울 아주머니가 제 엿가위 장단으로 모락 아주머니네 떡을 팔아 주었다. 작년 그믐 일 고마웠다고, 이제야 말했다. 모락 아주머니는 김이 매워서 운다고 했다.',()=>learn('arc:jangteo:pair'));
}
/* 떠돌이(region.js의 투호 노인들·얼레)에 사연 막을 붙인다. 원래 대화는 그대로 두고, 열릴 막이 있을 때만 앞에 고르게 한다.
   투호 노인들은 한 그림에 둘이 있어 speakers로 한 사람씩 말한다(PA-54 다람쥐 형제와 같은 방식). */
/* 결정 D-131: 떠돌이는 한 번 마치면(finishWanderer) 엔진이 talk 대신 greeting만 보여 준다(engine/field.js tryInteract).
   투호 노인·얼레·짠돌의 다음 막은 모두 그 뒤에 열리므로, 열릴 막이 있으면 greeting이 그 막을 고르는 대사가 된다. */
function arcGreeting(w,rows){
  const d=Object.getOwnPropertyDescriptor(w,'greeting'),base=d?.get?()=>d.get.call(w):()=>d?.value;
  Object.defineProperty(w,'greeting',{configurable:true,enumerable:true,get(){return rows()||base();}});
}
{
  const W=Rg.expEncounters?.wanderers||{};
  const elders=(W.street||[]).find(w=>w.id==='j_yut');
  if(elders){
    elders.speakers=['투호 노인들','흰눈썹 노인','곰방대 노인'];
    const base=elders.talk;
    const rows=()=>{
      const F=G.f;if(!Rg.arcs())return null;let act=null,label='',line='';
      if(!night()&&F.jxYutReward&&!F.jangteoArcsElder1){act=elderArc1;label='한 판 더 구경한다';line='꼬마 왔구나. 앉아서 구경이나 하려무나.';}
      else if(night()&&F.jangteoArcsElder1&&!F.jangteoArcsElder2){act=elderArc2;label='곰방대 할아버지 곁에 앉는다';line='(곰방대 할아버지 혼자 화롯불 앞에 앉아 있다.)';}
      else if(!night()&&G.boss.dead&&F.jangteoArcsElder2&&!F.jangteoArcsElder3){act=elderArc3;label='설날 첫판에 앉는다';line=G.f.jxSeollalPast?'설은 지났어도 약속은 약속이지. 첫판 하자.':'설날 아침이다! 약속대로 첫판 하자.';}
      // 흰눈썹 노인은 해 지면 일찍 들어간다(elderArc1). 밤 투호판엔 곰방대 노인만 남고, 내기는 둘이 있어야 하니 열리지 않는다(D-325).
      if(!act&&night())return [['곰방대 노인',F.jxYutReward?'저 양반은 들어갔다.\n내기는 둘이 있어야 하지. 날 밝거든 오너라.':'같이 던지는 양반은 해 지면 들어간다.\n내기 구경은 날 밝거든 오너라.']];
      if(!act)return null;
      return [[act===elderArc2?'너구리':'곰방대 노인',line,[{t:label,go:act},{t:'투호 내기를 건다',go:()=>Rg.playTuho()},{t:'다음에 올게요',go:null}]]];
    };
    elders.talk=()=>{const l=rows();if(l)talk(l);else base();};
    arcGreeting(elders,rows);
  }
  const kite=(W.entrance||[]).find(w=>w.id==='j_kite');
  if(kite){
    const base=kite.talk;
    const rows=()=>{
      const F=G.f;if(!Rg.arcs())return null;
      if(night()&&F.jxKiteDone&&!F.jangteoArcsKite2)return [['너구리','(얼레가 붉은 차일 아래서 깜깜한 골목 끝만 본다.)',[{t:'곁에 간다',go:kiteArc2},{t:'다음에',go:null}]]];
      if(!night()&&G.boss.dead&&F.jangteoArcsKite2&&!F.jangteoArcsKite3)return [['얼레','보부상! 이리 와 봐, 빨리!',[{t:'달려간다',go:kiteArc3},{t:'다음에',go:null}]]];
      return null;
    };
    kite.talk=()=>{const l=rows();if(l)talk(l);else base();};
    arcGreeting(kite,rows);
  }
}

/* ⑤ 새 인물 짠돌 (담비 소금장수, D-119). 낮엔 거리 좌판에서 소금값을 짜게 부르고, 밤엔 숙소 문간에서 떤다.
   지난가을 얼어붙은 짠돌에게 모자 쓴 너구리(아빠)가 제 신표를 쥐여 주고 "보여 주고 들어가 자요" 했다.
   짠돌은 남의 신표로 상단 행세를 못 해 한 번도 쓰지 않았고, 새벽에 돌려주러 나가니 아빠는 벌써 떠났다. 그 뒤로 밤마다 기다린다.
   아빠는 영감에게 신표를 잃었다고만 했다(새 신표도 마다함). 아이가 떡국·소금을 날라 주며 사정을 알게 되고,
   신표는 짠돌 것으로 두자고 한다. 영감은 "주인의 아들이 그렇다면 셈은 맞다"며 방값을 아빠 셈에서 뺀다. */
function jjArc1(){
  arcScene('jangteoArcsJj1',[
    ['너구리','(문간의 담비가 기둥에 기대 이를 딱딱 부딪친다.)'],
    ['너구리','안 들어가세요? 안은 따뜻해요.'],
    ['짠돌','마루까진 누구나 든다만, 방은 상단 식구 몫이다.\n난 소금장수고.'],   // 결정 D-136: 마루는 길손 누구나, 방은 신표 있는 상단 식구만
    ['짠돌','장터에선 짠돌이라 부르지.\n값을 짜게 부른다고.'],
    ['너구리','영감님께 말씀드려 볼까요?'],
    ['짠돌','됐다. 규칙은 규칙이지.\n마루나 문간이나 춥긴 매한가지고, 여긴 길이 보여.'],
    ['너구리','(짠돌 아저씨가 목도리를 끌어올린다. 눈은 계속 길 쪽이다.)'],
    ['너구리','누구 기다리세요?'],
    ['짠돌','…장사꾼이 기다리는 건 손님이지.'],
    ['짠돌','대신 하나만 부탁하자.\n떡집 곰한테 떡국 한 그릇.'],
    ['짠돌','(소금 한 줌을 종이에 싸서 내민다.)\n값은 이걸로 치러라.'],
    ['너구리','다녀올게요.']
  ],'숙소 문밖에서 떨고 있는 담비 소금장수를 만났다. 장터에선 짠돌이라 부른단다. 상단 식구가 아니라 들어갈 수 없다며, 떡집에서 떡국 한 그릇을 받아다 달라고 했다. 길 쪽만 보고 있었다.');
}
function jjMorakSoup(){
  arcScene('jangteoArcsJjSoup',[
    ['너구리','아주머니, 떡국 한 그릇 싸 주실 수 있어요?'],
    ['너구리','숙소 문밖 손님 거예요.'],
    ['모락','문밖? 아, 그 담비!'],
    ['모락','가을부터 밤마다 거기 앉아 있어.\n들어오래도 안 들어와.'],
    ['너구리','이걸로 값을 치르래요.'],
    ['모락','소금? 넣어 둬! 떡국 한 그릇에 무슨 값이야.'],
    ['너구리','(모락 아주머니가 뚝배기에 떡국을 듬뿍 퍼서 보자기로 싼다.)'],
    ['모락','식기 전에 갖다줘! 먹고 해, 먹고!']
  ],'모락 아주머니가 문밖 손님 떡국을 듬뿍 싸 주었다. 소금 값은 받지 않았다. 그 담비는 가을부터 밤마다 거기 앉아 있었단다.');
}
function jjArc2(){
  arcScene('jangteoArcsJj2',[
    ['너구리','떡국이에요. 값은 안 받으셨어요.'],
    ['너구리','(소금 봉지를 도로 내밀었다.)'],
    ['짠돌','…곰이 그럴 줄 알았다.'],
    // 결정 D-290: 떡국 심부름 값. 장사꾼은 한 번 내준 값을 도로 받지 않는다
    ['짠돌','넣어 둬라. 장사꾼은 내준 값 도로 안 받는다.\n심부름 값이다.'],
    gotLine('salt'),
    ['너구리','(짠돌 아저씨가 김을 한참 쐬다가 천천히 먹는다.)'],
    ['너구리','(짠돌 아저씨가 숟가락을 멈추고 내 모자를 본다.)'],
    ['짠돌','그 모자… 어디서 났냐.'],
    ['너구리','아빠 거예요. 아빠 찾으러 북쪽으로 가요.'],
    ['짠돌','…'],
    ['너구리','(짠돌 아저씨가 품에서 천에 싼 것을 꺼낸다. 낡은 신표다.)'],
    ['짠돌','지난가을 늦은 밤, 이 문간에서\n이가 덜덜 떨리더라. 신표가 없으니 방엔 못 들고.'],
    ['짠돌','그 모자 쓴 너구리가\n이걸 내 손에 쥐여 주더라.'],
    ['짠돌','"이거 보여 주고 들어가 자요."\n그 한마디 하고 안으로 들어갔지.'],
    ['너구리','그럼 왜 안 들어가셨어요?'],
    ['짠돌','남의 신표로 상단 행세를 하라고?\n난 소금장수다.'],
    ['짠돌','새벽에 돌려주러 나가 보니\n벌써 북쪽으로 떠났더라.'],
    ['너구리','영감님한테 맡기면 아빠한테 가잖아요.'],
    ['짠돌','문간에선 마루 말소리가 다 들린다.\n그 너구리, 영감한테 신표를 잃었다 하더라.'],
    ['짠돌','내가 내밀면 그 말이 거짓이 되잖나.\n…그래서 기다렸다. 밤마다. 직접 돌려주려고.'],
    ['너구리','(아빠다. 아빠라면 그랬을 거야.)']
  ],'문밖 담비가 낡은 신표를 보여 주었다. 지난가을 문간에서 떨던 자기에게 모자 쓴 너구리가 쥐여 준 신표란다. 남의 신표로 상단 행세는 못 한다며 한 번도 쓰지 않았고, 새벽에 돌려주러 나가 보니 벌써 떠난 뒤였단다. 아빠다.');
}
function jjArc3(){
  arcScene('jangteoArcsJj3',[
    hintLine('dubu',['짠돌','소금 사려! 장 담글 소금, 떡 간 맞출 소금!\n콩 갈아 두부 앉힐 소금!']),   // 결정 D-461: 귀띔
    ['짠돌','(나를 보더니 목소리를 더 높인다.)\n값은 안 깎아! 소금은 원래 귀한 거야!'],
    ['너구리','밤에 뵌 일은요?'],
    ['짠돌','무슨 일? 난 밤엔 자는데.'],
    ['너구리','…'],
    ['너구리','(짠돌 아저씨가 소금 한 봉을 슬쩍 내 쪽으로 민다.)'],
    ['짠돌','이건 떡집 곰한테. 떡 간 맞추라고.'],
    ['짠돌','값은 안 받는다고 전해.\n곰이 안 받으니, 나도 안 받는다.']
  ],'낮의 짠돌 아저씨는 소금값을 짜게 부르는 장사꾼이었다. 밤 일은 모른 척하면서, 떡집에 갖다줄 소금 한 봉을 슬쩍 밀어 주었다.');
}
function jjMorakSalt(){
  arcScene('jangteoArcsJjSalt',[
    ['너구리','짠돌 아저씨가 떡 간 맞추시래요.\n값은 안 받는대요.'],
    ['모락','짠돌이가? 하하! 그 짠돌이가 공짜를!'],
    ['모락','(소금 봉을 열어 냄새를 맡는다.)\n…좋은 소금이네. 바닷바람 냄새가 나.'],
    ['모락','그 담비, 낮엔 그렇게 짜게 굴면서.'],
    ['모락','밤마다 문간에 앉아 있는 거,\n장터 사람들 다 알아. 모른 척해 줄 뿐이지.'],
    ['너구리','왜 모른 척해요?'],
    ['모락','기다리는 사람한텐\n기다리는 이유를 안 묻는 거야.'],
    // 결정 D-290: 소금을 날라 준 몫. 그 소금으로 간을 맞춰 처음 뽑은 가래떡
    ['너구리','(모락 아주머니가 소금을 한 줌 쳐서 반죽을 치대더니\n가래떡 한 줄을 뽑아 내 손에 쥐여 준다.)'],
    ['모락','첫 줄은 소금 날라 온 손 몫이야!'],
    gotLine('garaetteok')
  ],'모락 아주머니에게 짠돌 아저씨의 소금을 전했다. 장터 사람들은 그 담비가 밤마다 문간에서 기다리는 걸 다 알면서 모른 척해 준단다. 그 소금으로 뽑은 첫 가래떡을 받았다.');
}
function jjArc4(){
  arcScene('jangteoArcsJj4',[
    ['너구리','영감님, 문밖 손님 얘기 들어 주세요.'],
    ['부엉 영감','짠돌이 말이냐. 방은 신표 있는 이만 든다.\n마루라도 올라오래도 안 올라오는 이다.'],
    ['너구리','신표 있어요. 아빠가 드린 거래요.'],
    ['너구리','(문간으로 달려가 짠돌 아저씨 소매를 잡아끌었다.)'],
    ['짠돌','어, 어이. 난 마루에 설 자격이…'],
    ['너구리','(짠돌 아저씨가 마루 앞에서 머뭇거리다\n천을 풀어 신표를 내민다.)'],
    ['너구리','(영감님이 신표를 받아 장부를 한 장 넘긴다.)'],
    ['부엉 영감','…네 아비 것이 맞다.'],
    ['부엉 영감','지난가을 신표를 잃었다길래\n새로 내주려 했더니, 됐다고 하더군.'],
    ['부엉 영감','물어도 웃기만 하더니.'],
    ['짠돌','주인 아들이 왔으니 돌려드립니다.'],
    ['너구리','아니요. 아빠가 아저씨 드린 거예요.'],
    ['너구리','그 신표로 들어가 주무세요.\n아빠도 그러라고 드렸을 거예요.'],
    ['너구리','(영감님이 장부와 짠돌 아저씨와 나를 차례로 본다.)'],
    ['부엉 영감','주인의 아들이 그렇다면 셈은 맞다.'],
    ['부엉 영감','들어오시오, 손님.\n방값은 이 아이 아비 셈에서 뺀다.'],
    ['너구리','(짠돌 아저씨가 한참 서 있다가, 처음으로 마루에\n신을 벗고 올라선다. 영감님이 안쪽 방문을 열어 준다.)'],
    ['짠돌','…따뜻하네.']
  ],'부엉 영감이 신표를 알아봤다. 지난가을 아빠는 신표를 잃었다고만 하고 새 신표도 마다했단다. 신표는 짠돌 아저씨 것으로 두자고 했다. 영감은 셈이 맞다며 방값을 아빠 셈에서 뺐다. 짠돌 아저씨가 처음으로 마루에 올라서 방에 들었다.',()=>{G.f.jjInside=true;learn('arc:jangteo:jjandol');finishWanderer('j_jjandol');});
}
/* ⑥ 새 인물 등잔발 (생쥐 밤짐꾼, D-119). 해 지고 들어오는 길손 짐을 나르고 허리 등잔으로 길을 비춘다. 낮엔 잔다.
   얼레 사연(②)과 얽힌다: 설 첫새벽 어귀에서 우는 동생을 붉은 차일 등 쪽으로 데려온 게 등잔발이다.
   지난가을 늦은 밤 모자 쓴 너구리(아빠)의 짐을 숙소까지 날랐다. 짠돌에게 신표를 쥐여 준 그 밤이다(⑤).
   아이는 신표를 받을 때 부엉 영감에게서 아빠 짐을 받았다. 그래서 "약초 냄새"를 제 보따리에서 확인할 수 있다. */
function lampArc1(){
  // 결정 D-290: 짐을 같이 날라 준 몫. 밤짐꾼은 짐삯으로 받은 군밤을 반 나눈다.
  arcScene('jangteoArcsLamp1',[
    ['너구리','(생쥐 하나가 제 몸집 세 배는 되는 보따리를 지고 비틀거린다.)'],
    ['등잔발','어이쿠, 비켜, 비켜!\n아니, 비키지 말고 좀 받쳐 줘!'],
    ['너구리','(보따리 아래를 받쳐 같이 든다.)\n이거 어디까지요?'],
    ['등잔발','숙소 마루까지! 막차로 온 손님 짐이야.'],
    ['너구리','(마루 끝에 보따리를 내려놓았다.)'],
    ['등잔발','휴, 살았다. 나는 등잔발. 밤짐꾼이야.'],
    ['등잔발','해 지고 들어오는 길손들 짐을 나르지.\n낮엔 자고.'],
    ['너구리','왜 밤에만 해요?'],
    ['등잔발','밤에 오는 손님은 길이 안 보이잖아.\n이걸로 비춰 주는 거야.'],
    ['너구리','(등잔발 아저씨가 허리에 찬 작은 등잔을 툭툭 친다.)'],
    ['등잔발','설 대목엔 늦게 오는 손님이 많거든.\n다들 집에 가려고 서두르니까.'],
    ['너구리','(아빠도 어딘가에서 늦게 오는 중일까.)'],
    ['등잔발','아, 맞다! 짐삯으로 군밤을 받았어.\n같이 들었으니 반은 네 몫이지!'],
    gotLine('gunbam',2)
  ],'숙소 앞에서 제 몸집 세 배 보따리를 진 생쥐 밤짐꾼 등잔발을 도왔다. 해 지고 들어오는 길손들 짐을 나르고, 허리에 찬 작은 등잔으로 길을 비춰 준단다. 짐삯으로 받은 군밤을 반 나눠 주었다.');
}
function lampArc2(){
  const spare=(G.inv.sesame_oil||0)>0&&progressShortage({...G.inv,sesame_oil:G.inv.sesame_oil-1})<=progressShortage(G.inv);
  // 결정 D-290: 참기름을 부어 주면 그 기름값으로 손님에게 짐삯으로 받은 꿀 한 단지를 준다.
  arcScene('jangteoArcsLamp2',[
    ['등잔발','어이, 그 붉은 차일 등!\n얼레가 자랑하더라, 보부상이 달아 줬다고.'],   // 결정 D-136: 등잔발이 아는 경로는 얼레의 자랑
    ['너구리','얼레 동생이 밤에 오면 찾으라고요.'],
    ['등잔발','잘했다. 어귀에서도 저 불이 보이더라.'],
    ['등잔발','설 첫새벽엔 어귀에 나가 있을 거야.\n꼭 길 잃는 꼬마가 하나씩 있거든.'],
    ['너구리','(등잔발 아저씨가 등잔을 흔들어 본다. 찰랑, 바닥 소리가 난다.)'],
    ['등잔발','…기름이 간당간당하네.'],
    ...(spare?[
      ['너구리','참기름도 불이 붙어요?'],
      ['등잔발','붙지! 냄새가 고소해서 그렇지.'],
      ['너구리','(참기름 한 병을 등잔에 부어 주었다.)'],
      ['등잔발','이거면 새벽까지 넉넉해. 고소한 등잔이네!'],
      ['등잔발','기름값은 갚아야지! 손님한테 짐삯으로 받은 꿀이야.\n난 단 거 먹으면 졸려서 못 써!'],
      gotLine('honey')
    ]:[
      ['너구리','기름은 없는데…'],
      ['등잔발','괜찮아. 아껴 쓰면 새벽까진 가.'],
      ['등잔발','대신 네 차일 등이 꺼지지 않게만 해 줘.']
    ]),
    ['등잔발','둘이 같이 비추면 안 헤매겠지.']
  ],'등잔발이 설 첫새벽에 어귀로 길 잃은 손님을 마중 나간다고 했다. 얼레네 차일 등이 어귀에서도 보였단다.'+(spare?' 등잔에 참기름을 부어 주었더니 기름값이라며 꿀 한 단지를 주었다.':''),()=>{if(spare)takeItem('sesame_oil',1);});
}
function lampArc3(){
  arcScene('jangteoArcsLamp3',[
    ['너구리','(등잔발 아저씨가 담벼락 아래 웅크려 자다가 눈을 뜬다.)'],
    ['등잔발','…으음, 아침이야?\n새벽 손님 하나 데려왔어.'],
    ['등잔발','어귀에서 붉은 등만 쳐다보고 서 있더라.\n할미는 뒤에 처지고, 눈길이 깊어 못 건너길래 업어다 줬지.'],   // 결정 D-136: 얼레의 "등불 보고 곧장 왔대"와 한 판으로
    ['너구리','얼레 동생 꼭지예요. 아침에 만났어요.'],
    ['등잔발','그래? 다행이다. 그럼 잠이나 더 자야지.'],
    ['너구리','(등잔발 아저씨가 눈을 감다가 다시 뜬다. 코를 킁킁.)'],
    ['등잔발','…그 보따리, 약초 냄새.\n지난가을 밤에 똑같은 냄새 나는 짐을 날랐는데.'],
    ['등잔발','늦게 들어온 너구리 짐이었지. 무겁더라.'],
    ['너구리','(영감님이 내준 아빠 짐 보따리.\n지금도 약초 냄새가 난다.)'],
    ...(G.f.jangteoArcsJj2?[['너구리','(짠돌 아저씨가 신표를 받은 것도 그 밤이다.)']]:[]),
    ['등잔발','그 너구리, 짐 내려놓고 한참 서 있더라.\n남쪽 하늘만 보고.'],
    ['너구리','(남쪽. 우리 집이 있는 쪽.)'],
    ['등잔발','…난 마저 잘란다. 잘 가라.']
  ],'설날 아침, 등잔발이 새벽 어귀에서 울던 얼레 동생 꼭지를 데려왔다고 했다. 지난가을 늦은 밤엔 모자 쓴 너구리의 짐도 날랐단다. 무겁고 약초 냄새가 났다고. 그 너구리는 짐을 내려놓고 한참 남쪽 하늘을 봤단다.',()=>{G.f.lampWoke=true;learn('arc:jangteo:deungjan');});
}
// 결정 D-162: 등잔발은 밤·설날 아침에만 나오니 대화 초상이 언제든 찾게 그림을 올려 둔다
Rg.portraits={...Rg.portraits,'등잔발':lampDraw,
  // 결정 D-328: 투호 노인 둘은 한 그림이라, 말하는 사람의 얼굴만 따로 그려 초상으로 쓴다 (예전엔 가운데 항아리가 잘려 나왔다)
  '흰눈썹 노인':(x,y,f=1)=>Rg.expArt.elder(x,y,f,'steady'),'곰방대 노인':(x,y,f=1)=>Rg.expArt.elder(x,y,f,'bold')};
function lampDraw(x,y,f=1){
  const P=(dx,dy,w,h,c)=>R(Math.round(f>0?x+dx:x-dx-w),Math.round(y+dy),w,h,c);
  P(-12,-6,7,2,'#b9a99a');P(-14,-8,3,2,'#b9a99a');                         // 꼬리
  P(-6,-11,10,8,'#8f8a86');P(-2,-9,5,5,'#c9c3bd');                          // 몸통과 배
  P(2,-16,7,6,'#8f8a86');P(8,-14,2,2,'#e6a5a5');P(6,-15,1,1,'#1d1712');     // 머리, 코, 눈
  P(1,-19,3,3,'#e6a5a5');P(5,-19,3,3,'#e6a5a5');                            // 귀
  P(-4,-3,2,3,'#6a6560');P(2,-3,2,3,'#6a6560');                             // 다리
  P(-5,-17,8,6,'#a88456');P(-4,-18,6,2,'#c8a36c');                          // 등짐
  const glow=night();P(7,-9,3,4,'#5c4632');P(8,-10,1,1,glow?'#ffd36b':'#7a6a55');   // 허리 등잔
  if(glow){P(6,-11,5,1,'rgba(255,211,107,.45)');}
}
function lampTalk(){
  const F=G.f;
  if(night()){
    if(!F.jangteoArcsLamp1){lampArc1();return;}
    if(F.jangteoArcsKite2&&!F.jangteoArcsLamp2){lampArc2();return;}
    talk([['등잔발',F.jangteoArcsLamp2?'설 첫새벽엔 어귀에 나가 있을 거야.':'짐 나를 손님 없나…\n어이, 너 보따리 무거워 보인다?']]);return;
  }
  if(F.jangteoArcsLamp2&&F.jangteoArcsKite3&&F.bueongDone&&!F.jangteoArcsLamp3){lampArc3();return;}
  talk([['너구리','(등잔발 아저씨가 담벼락 아래서 곤히 잔다.)']]);
}

/* 마루에서 잔 다음 낮. 영감은 손님 장부에 짠돌의 본이름을 적었다(장부는 이름 칸을 비우지 않는다). 아이는 그 이름을 모른다.
   길 소금 한 줌은 덤이다(진행과 상관없다). */
function jjArc5(){
  arcScene('jangteoArcsJj5',[
    ['짠돌','(목소리를 낮춘다.) 방이 따숩더라.\n밤새 한 번도 안 깼다.'],
    ['너구리','다행이에요.'],
    ['짠돌','영감이 손님 장부에 날 적더라.\n짠돌 말고, 본이름으로.'],
    ['너구리','본이름이 뭔데요?'],
    ['짠돌','…비밀이다. 장터에선 짠돌이 편해.'],
    ['짠돌','근데 누가 적어 주니까\n내 이름도 쓸 데가 있구나 싶더라.'],
    ['너구리','(짠돌 아저씨가 소금 한 줌을 종이에 싸서 내 손에 쥐여 준다.)'],
    ['짠돌','길 소금이다. 북쪽 길은 눈 녹은 물이 싱겁거든.'],
    gotLine('salt'),
    ['짠돌','값은… 네 아비 셈에 달아 둬라.'],
    ['너구리','(웃음이 났다. 짠돌 아저씨도 웃었다.)']
  ],'방에서 잔 다음 날, 짠돌 아저씨가 길 소금 한 줌을 쥐여 주었다. 부엉 영감이 손님 장부에 짠돌 말고 본이름을 적었단다. 무슨 이름인지는 비밀이라고 했다.',()=>{learn('arc:jangteo:jjandol-name');});
}
/* 짠돌의 두 얼굴: 낮엔 거리 좌판, 밤엔 숙소 문간. 사연이 켜진 판에만 나온다. 문간의 짠돌은 방에 든 뒤로는 없다. */
function jjDraw(x,y,f=1){
  const P=(dx,dy,w,h,c)=>R(Math.round(f>0?x+dx:x-dx-w),Math.round(y+dy),w,h,c);
  const dark=night();
  P(-15,-11,7,3,'#4a3524');P(-17,-9,4,3,'#2f2218');                       // 꼬리
  P(-8,-15,14,11,'#7a5634');P(-1,-16,7,8,'#e8c35a');                       // 몸통과 노란 목
  P(3,-23,9,8,'#7a5634');P(10,-20,3,3,'#3a2a1c');                          // 머리와 코끝
  P(3,-25,3,3,'#5e4128');P(9,-25,3,3,'#5e4128');P(8,-21,1,1,'#1d1712');    // 귀와 눈
  P(-6,-4,3,4,'#3a2a1c');P(3,-4,3,4,'#3a2a1c');                            // 다리
  if(dark){P(-8,-17,16,3,'#8a3b2a');P(5,-14,3,6,'#8a3b2a');}             // 밤: 붉은 목도리
  else{const S=(dx,dy,w,h,c)=>R(Math.round(x+dx),Math.round(y+dy),w,h,c);   // 결정 D-154: 땅에 내려 둔 자루는 고개를 돌려도 늘 왼쪽 그 자리
    S(-20,-11,9,11,'#ece6d5');S(-19,-12,7,2,'#c9bfa5');S(-17,-8,3,1,'#9a8e74');}  // 낮: 소금 자루
}
function jjandolTalk(){
  const F=G.f;
  if(night()){
    if(!F.jangteoArcsJj1){jjArc1();return;}
    if(!F.jangteoArcsJjSoup){talk([['짠돌','떡집 곰한테 떡국 한 그릇. 부탁한다.']]);return;}
    if(!F.jangteoArcsJj2){jjArc2();return;}
    talk([['짠돌',F.jangteoArcsJjSalt?'(신표를 싼 천을 만지작거린다.)\n…영감 앞에 설 낯이 없다.':'낮엔 거리에 있다. 소금 팔아야지.']]);return;
  }
  if(F.jangteoArcsJj2&&!F.jangteoArcsJj3){jjArc3();return;}
  if(F.jjInside&&!F.jangteoArcsJj5){jjArc5();return;}
  talk([['짠돌',F.jjInside?'소금 사려! …어젯밤엔 방에서 잤다. 등이 따숩더라.':F.jangteoArcsJj3?'떡집 곰한테 소금은 전했냐?':'소금 사려! 값은 안 깎아.\n소금은 원래 귀한 거야!']]);
}
{
  const W=Rg.expEncounters?.wanderers;
  if(W){
    const jjDay={id:'j_jjandol',name:'짠돌',x:1300,talk:jjandolTalk,draw:jjDraw,greeting:'소금 사려! 장 담글 소금, 떡 간 맞출 소금!'};
    arcGreeting(jjDay,()=>!G.f.jjInside||night()?null:!G.f.jangteoArcsJj5?[['짠돌','소금 사려! …아, 너구나.',[{t:'다가간다',go:jjArc5},{t:'다음에',go:null}]]]
      :[['짠돌','소금 사려! …어젯밤엔 방에서 잤다. 등이 따숩더라.']]);
    // 넷째 막(jjArc4)에서 아이가 소매를 끌면 문간에서 영감 앞 마루로 걸어온다 (D-126 자리 옮김).
    const jjNight={id:'j_jjandol',name:'짠돌',get x(){return tx(G.f.jangteoArcsJj4?970:1320);},talk:jjandolTalk,draw:jjDraw,hint:'숙소 문간에서 누가 이를 딱딱 부딪치는 소리가 난다.',greeting:'(문간에 웅크려 길 쪽만 본다.)'};
    const street=W.street,inn=W.inn;
    Object.defineProperty(W,'street',{configurable:true,get(){return Rg.arcs()&&!night()?[...street,jjDay]:street;}});
    // 등잔발: 밤엔 숙소 앞 길목, 설날 아침엔 담벼락 아래서 잔다(사연이 남았을 때만).
    const lampNight={id:'j_deungjan',name:'등잔발',x:1800,talk:lampTalk,draw:lampDraw,hint:'어둠 속에서 작은 등잔 불빛이 흔들리며 다가온다.',greeting:'짐 나를 손님 없나~'};
    const lampDay={id:'j_deungjan',name:'등잔발',x:1760,talk:lampTalk,draw:lampDraw,greeting:[['너구리','(등잔발 아저씨가 담벼락 아래서 곤히 잔다.)']]};   // 결정 D-136: 지문은 너구리 화자
    Object.defineProperty(W,'inn',{configurable:true,get(){
      if(!Rg.arcs())return inn;
      if(night())return [...inn,...(G.f.jjInside?[]:[jjNight]),lampNight];
      return G.f.jangteoArcsLamp2&&!G.f.lampWoke?[...inn,lampDay]:inn;
    }});
  }
}

/* ---------- 작은 미니게임 창 만들기 (돌너머 돌 쌓기와 같은 모양) ---------- */
function makePanel(id,title,btn){
  const p=el('div','forge');p.id=id;p.hidden=true;
  p.innerHTML='<h2>'+title+'</h2><canvas id="'+id+'Cv" width="320" height="120" style="display:block;width:min(100%,380px);height:auto;margin:0 auto;image-rendering:pixelated;background:#efe3c8;border:2px solid var(--meok);border-radius:3px;touch-action:none"></canvas><div class="pips" id="'+id+'Pips"></div><div class="fhint" id="'+id+'Hint"></div><button class="btn primary strike" id="'+id+'Btn" type="button">'+btn+' <kbd>Space · J</kbd></button>';
  $('shell').appendChild(p);return p;
}

// 결정 D-88: 손일은 미니게임 없이 바로 마친다 (확정: 미니게임은 채집·전투·놀이에만, 대장 2026-10-30). 막혀 있던 판정 코드는 지웠다.
Rg.handWork=after=>{Sound.gather(true);if(after)after();};   // 결정 D-360: 손일은 소리 한 번 뒤 바로 끝난다 (옛 손일 종류 인자는 지웠다)

/* ---------- 결정 D-325: 투호 내기 (윷놀이를 뺐다, 사용자 지시 2026-11-02) ----------
   두 노인이 장터 한구석에서 항아리에 화살을 번갈아 던진다. 아이는 직접 던지지 않고, 판이 열리기 전에 이길 쪽에 솔방울 하나를 건다.
   솔방울은 곰방대 노인의 화롯불 땔감이 된다. 맞히면 이긴 노인이 제 주머니에서 값을 치른다(흰눈썹은 설에 쓰려던 곶감, 곰방대는 화롯불에 구운 군밤).
   결정 D-326: 흰눈썹 노인은 고르게 입에 넣고 귀는 드물다. 곰방대 노인은 자주 빗나가지만 귀(세 점)에 곧잘 꽂는다.
   대략 6 대 4로 흰눈썹이 이기므로 값은 흰눈썹 곶감 하나, 곰방대 군밤 둘이다. 비기면 한 살씩 더 던지고, 세 번을 더 비기면 판돈을 돌려준다.
   낮마다 tuho_bets_per_day 판까지 건다(해가 지고 다시 밝으면 다시 센다). 구경만 하는 판은 세지 않는다.
   사연이 켜진 밤에는 흰눈썹 노인이 일찍 들어가 내기가 없다(D-131). 수치는 minigames.csv의 tuho_* 줄. */
const tuhoP=makePanel('jangteoTuho','투호 구경 · 누가 이길까','건너뛰기');
const tcv=$('jangteoTuhoCv');tcv.height=150;tcv.style.width='min(100%,560px)';
Object.assign(tuhoP.style,{position:'fixed',left:'50%',right:'auto',top:'50%',bottom:'auto',transform:'translate(-50%,-50%)',width:'min(92vw,620px)',maxHeight:'92dvh',overflowY:'auto',boxSizing:'border-box',zIndex:'22'});
const tchoices=el('div');tchoices.id='jangteoTuhoChoices';tuhoP.appendChild(tchoices);
const TH={steady:{name:'흰눈썹 노인',short:'흰눈썹',x:46,hand:60,pay:'gotgam',fletch:'#b54a34'},
  bold:{name:'곰방대 노인',short:'곰방대',x:274,hand:260,pay:'gunbam',fletch:'#416c82'}};
const POT={x:160,mouth:66,ear:80,earDx:13,floor:132};
let tg=null;   // 지금 판. 판은 짧아서 저장하지 않는다 (창을 닫으면 그 판은 끝난다)
const yAlone=()=>!!G.f.night&&Rg.arcs();
function tBetsLeft(){const d=G.f.jxTuhoDay;return MG.tuho_bets_per_day-(d&&d.night===!!G.f.night?d.n:0);}
function tPay(who){return MG['tuho_'+who+'_pay'];}
function tRoll(who){const r=Math.random(),ear=MG['tuho_'+who+'_ear'],mouth=MG['tuho_'+who+'_mouth'];return r<ear?'ear':r<ear+mouth?'mouth':'miss';}
const tPoints=r=>r==='ear'?MG.tuho_ear_points:r==='mouth'?1:0;
function tPlan(){
  const list=[];for(let i=0;i<MG.tuho_arrows;i++)for(const who of ['steady','bold'])list.push({who,res:tRoll(who)});
  const sum=who=>list.filter(a=>a.who===who).reduce((n,a)=>n+tPoints(a.res),0);
  for(let k=0;k<3&&sum('steady')===sum('bold');k++)for(const who of ['steady','bold'])list.push({who,res:tRoll(who),extra:true});
  // 떨어지는 자리: 귀는 던진 쪽 귀, 입은 가운데에서 조금씩, 빗나가면 항아리 둘레 멍석 위
  return list.map((a,i)=>Object.assign(a,{seed:hash(i*7.3+Math.random()*99),side:a.who==='steady'?-1:1}));
}
function tTarget(a){
  if(a.res==='ear')return [POT.x+a.side*POT.earDx,POT.ear];
  if(a.res==='mouth')return [POT.x+Math.round((a.seed-.5)*4),POT.mouth];
  return [POT.x+a.side*(18+Math.round(a.seed*18)),POT.floor-2];
}
function tNew(){tg={phase:'bet',bet:null,plan:[],i:0,t:0,score:{steady:0,bold:0},message:'',story:''};tRender();}
function tStart(bet){
  if(bet){if(!has('solbang',MG.tuho_stake)||tBetsLeft()<=0)return;takeItem('solbang',MG.tuho_stake);
    const d=G.f.jxTuhoDay;G.f.jxTuhoDay={night:!!G.f.night,n:(d&&d.night===!!G.f.night?d.n:0)+1};}
  Object.assign(tg,{phase:'play',bet,plan:tPlan(),i:0,t:0,score:{steady:0,bold:0},story:''});
  tg.message=bet?TH[bet].short+' 할아버지에게 솔방울을 걸었다. 흰눈썹 할아버지부터 던진다.':'걸지 않고 구경한다. 흰눈썹 할아버지부터 던진다.';
  tRender();
}
const T_SAY={
  steady:{mouth:'쏙, 입에 들었다.',ear:'귀에 꽂혔다! 흰눈썹 할아버지가 수염을 쓸어내린다.',miss:'테를 맞고 멍석에 떨어졌다.'},
  bold:{mouth:'…들었다! 곰방대 하나!',ear:'귀에 꽂혔다! 곰방대 셋!',miss:'…에잇, 바람이 샜다.'}
};
function tLand(a){
  tg.score[a.who]+=tPoints(a.res);
  tg.message=(a.extra?'비겨서 한 살 더. ':'')+(a.who==='bold'?'곰방대가 던진다! ':'흰눈썹 할아버지가 숨을 고르고 던진다. ')+T_SAY[a.who][a.res];
  if(tg.i===MG.tuho_arrows)tStory();   // 판 가운데쯤, 노인들이 옛 방석 이야기를 하나 꺼낸다
}
// 결정 D-327: 아빠 이야기(D-136 보부상 청년)는 투호 구경판에서 듣는다. 청년은 늘 기복 큰 쪽에 걸었다. 부를 준다는 열매 소문을 쫓던 그때와 같은 결.
const youngStories=[
  '예전에 보부상 청년 하나가 이 자리에서 구경했지. 보따리 끈 끝을 꼭 한 번 거꾸로 감더라. 그 집 버릇인지.',
  '그 청년, 앉자마자 북쪽 장날부터 물었어. 장사도 길부터 알아야 한다면서.',
  '그 청년은 꼭 곰방대 쪽에 걸더라. 한 번에 크게 먹겠다고. 지고는 입이 댓 발 나왔지. 그래도 떨어진 화살은 주워 줬어.',
  '그땐 부를 준다는 열매 소문이 돌았지. 그 청년도 그 소문을 쫓았고.',
  '판 끝나니 우리 장보따리 끈도 고쳐 주더군. 손이 야물었어.',
  '우리가 길을 잘못 들까 봐 해 질 녘 깃대에 헝겊도 묶고 갔지.'
];
function tStory(){
  const heard=G.f.jxYutHeard||(G.f.jxYutHeard=[]),i=youngStories.findIndex((_,k)=>!heard.includes(k));
  const who=yAlone()?'곰방대 노인':'흰눈썹 노인';
  if(i>=0){heard.push(i);tg.story=who+': '+youngStories[i];}
  else tg.story=G.f.night?'곰방대 노인: 등불이 켜지니 화살 그림자도 길어졌네.':'흰눈썹 노인: 투호는 마음을 고르는 놀이다. 기세만으론 안 들어가.';
}
function tFinish(){
  const s=tg.score,winner=s.steady>s.bold?'steady':s.bold>s.steady?'bold':null;tg.phase='over';
  let msg=winner?TH[winner].name+'이 이겼다 ('+s.steady+' 대 '+s.bold+').':'세 번을 더 던져도 비겼다 ('+s.steady+' 대 '+s.bold+').';
  if(tg.bet&&!winner){addItem('solbang',MG.tuho_stake);msg+=' 판돈 솔방울을 도로 받았다.';}
  else if(tg.bet&&tg.bet===winner){const n=tPay(winner);addItem(TH[winner].pay,n);
    msg+=' '+(winner==='bold'?'곰방대 할아버지가 화롯불에서 군밤을 꺼내 준다.':'흰눈썹 할아버지가 소매에서 곶감을 꺼내 준다.')+'\n'+gotText([[TH[winner].pay,n]]);}
  else if(tg.bet)msg+=' 솔방울은 화롯불 바구니로 들어갔다.';
  tg.message=msg;
  if(tg.bet&&!G.f.jxTuhoBetOnce){G.f.jxTuhoBetOnce=true;ledger('t_jangteo_yut','투호 노인들','투호 한 판에 솔방울 걸기','이긴 노인의 곶감 또는 군밤');ledgerDone('t_jangteo_yut');}
  if(!G.f.jxYutReward){
    // 첫 판을 끝까지 함께 본 뒤에 사연 막(elderArc1)이 열린다. 옛 이름의 진행값을 그대로 쓴다(옛 저장과 맞춘다).
    G.f.jxYutReward=true;finishWanderer('j_yut');
    if(typeof grantNickname==='function')grantNickname('jangteo_yut','한판 벗','투호 노인들');
    diary('jx_yut','장터 노인 둘이 항아리에 화살을 던지는 투호를 구경했다. 옛날 이 자리에서 구경하던 보부상 청년이 끈 끝을 한 번 거꾸로 감았단다. 아빠다.');
  }
  tRender();
}
function tSkip(){
  if(tg?.phase!=='play')return;
  while(tg.i<tg.plan.length){tLand(tg.plan[tg.i]);tg.i++;}
  tFinish();
}
function tButton(text,go,disabled){const b=el('button','btn',text);b.type='button';b.style.margin='3px';b.disabled=!!disabled;b.onclick=go;tchoices.appendChild(b);return b;}
function tClose(){
  const heard=G.f.jxYutHeard||[];tuhoP.hidden=true;tg=null;refreshHud();
  // 결정 D-136: 아이가 먼저 알아본다. 끈 끝을 한 번 거꾸로 감는 건 집에서 본 아빠 손버릇. 노인들은 아이를 알아보지 못했다.
  if(!G.f.jxYutDadKnown&&heard.includes(0)){G.f.jxYutDadKnown=true;const who=yAlone()?'곰방대 노인':'흰눈썹 노인';
    talk([['너구리','끈 끝을 한 번 거꾸로 감는 거…\n아빠가 보따리 묶을 때 꼭 그랬어요.'],[who,'…네 아비냐? 그 청년이?'],['너구리','네. 이 모자도 아빠 거예요.'],[who,'허, 그 청년이 그새 아비가 됐구나.\n다음 판엔 그 청년 얘기 더 해 주마.']]);}
}
function tRender(){
  const s=tg;tchoices.replaceChildren();
  const left=tBetsLeft(),stake=MG.tuho_stake,have=has('solbang',stake);
  if(s.phase==='bet')s.message=left<=0?'오늘 내기는 다 걸었다. 구경은 얼마든지 된다.':
    !have?'걸 솔방울이 없다. 구경만 할 수는 있다.':'누가 이길까? 오늘 '+left+'판 더 걸 수 있다.';
  $('jangteoTuhoHint').textContent=s.message+(s.story?'\n'+s.story:'');$('jangteoTuhoHint').style.whiteSpace='pre-line';
  $('jangteoTuhoPips').textContent='입 1점 · 귀 '+MG.tuho_ear_points+'점 · 한 사람 '+MG.tuho_arrows+'살';
  const main=$('jangteoTuhoBtn');main.hidden=s.phase!=='play';main.textContent='끝까지 건너뛰기 · Space / J';
  if(s.phase==='bet'){
    for(const who of ['steady','bold'])tButton(TH[who].short+' 할아버지에게 솔방울 걸기 (맞히면 '+ITEMS[TH[who].pay].n+' '+tPay(who)+')',()=>tStart(who),!have||left<=0);
    tButton('걸지 않고 구경만 하기',()=>tStart(null));
    tButton('일어나기',tClose);
  }
  if(s.phase==='over'){
    tButton('한 판 더 보기',tNew);
    tButton('일어나기',tClose);
  }
  tuhoP.dataset.phase=s.phase;tDraw();
}
function tArrow(c,x,y,ang,color,len=16){
  const dx=Math.cos(ang),dy=Math.sin(ang);c.strokeStyle='#6b4a2c';c.lineWidth=1.5;
  c.beginPath();c.moveTo(x,y);c.lineTo(x-dx*len,y-dy*len);c.stroke();
  c.fillStyle='#2f2a26';c.fillRect(Math.round(x-1),Math.round(y-1),2,2);   // 촉
  c.fillStyle=color;const fx=x-dx*len,fy=y-dy*len;c.fillRect(Math.round(fx-2),Math.round(fy-2),4,4);   // 깃
}
function tElder(c,who){
  const e=TH[who],x=e.x,f=POT.floor,face=who==='steady'?1:-1;
  // 거리 그림(art.js expArt.elder)과 같은 노인을 두 배로 그린다: 귀, 눈가 검은 털, 흰 눈썹 또는 곰방대
  const Q=(dx,dy,w,h,col)=>{c.fillStyle=col;c.fillRect(face>0?x+dx*2:x-(dx+w)*2,f+dy*2,w*2,h*2);};
  Q(-7,-14,14,14,who==='steady'?'#8b8f88':'#777b75');Q(-6,-22,13,10,'#b6b1a0');Q(-7,-25,4,5,'#605b53');Q(3,-25,4,5,'#605b53');
  Q(-5,-21,3,6,'#3b3a37');Q(2,-21,3,6,'#3b3a37');Q(-3,-18,1,1,'#eee4cd');Q(3,-18,1,1,'#eee4cd');
  Q(-4,-14,9,3,who==='steady'?'#a46b54':'#8a7761');
  if(who==='steady'){Q(-6,-22,4,1,'#f6f1e4');Q(2,-22,4,1,'#f6f1e4');}   // 흰 눈썹
  else{Q(4,-16,6,1,'#5b4430');Q(9,-18,2,2,'#a5532f');}                  // 입에 문 곰방대
  // 던지는 차례면 화살 쥔 팔을 항아리 쪽으로 든다
  const cur=tg.phase==='play'?tg.plan[tg.i]:null,throwing=cur&&cur.who===who&&tg.t<(Vfx.reducedMotion?1:MG.tuho_throw_frames)*0.35;
  if(throwing)Q(6,-20,5,3,'#777b75');else Q(6,-9,4,3,'#777b75');
  c.fillStyle='#3b3027';c.font='11px sans-serif';c.textAlign='center';c.fillText(e.short,x,f+14);
  if(tg.bet===who){c.fillStyle='#8a5a32';c.fillRect(x-3,f-64,6,7);c.fillStyle='#b98a52';c.fillRect(x-2,f-63,4,2);c.fillRect(x-2,f-60,4,2);}   // 건 솔방울
}
function tDraw(){
  if(!tg)return;const c=tcv.getContext('2d');c.save();c.textAlign='left';
  c.fillStyle='#efe3c8';c.fillRect(0,0,320,150);
  c.fillStyle='#d9c08a';c.fillRect(0,POT.floor,320,18);c.fillStyle='#c4a66d';for(let x=2;x<320;x+=8)c.fillRect(x,POT.floor+3,5,1);   // 멍석
  for(const who of ['steady','bold'])tElder(c,who);
  // 투호 항아리: 둥근 몸, 긴 목, 목 양옆의 귀
  const P2=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  P2(POT.x-12,POT.floor-26,24,26,'#5d6a6b');P2(POT.x-14,POT.floor-20,28,16,'#5d6a6b');P2(POT.x-10,POT.floor-24,6,14,'#7d8b8a');
  P2(POT.x-4,POT.mouth,8,POT.floor-26-POT.mouth,'#5d6a6b');P2(POT.x-5,POT.mouth-2,10,3,'#3f4a4b');
  for(const sd of [-1,1]){P2(POT.x+sd*POT.earDx-2,POT.ear-1,4,9,'#5d6a6b');P2(POT.x+sd*POT.earDx-3,POT.ear-2,6,2,'#3f4a4b');P2(POT.x+sd*7-(sd>0?0:3),POT.ear+4,6,2,'#5d6a6b');}
  // 이미 던진 화살
  const dur=Vfx.reducedMotion?1:MG.tuho_throw_frames;
  tg.plan.forEach((a,k)=>{
    if(k>tg.i||(k===tg.i&&tg.phase==='play'&&tg.t<dur))return;
    const [tx,ty]=tTarget(a),col=TH[a.who].fletch;
    if(a.res==='miss')tArrow(c,tx,ty,a.side>0?0.05:Math.PI-0.05,col,14);
    else tArrow(c,tx,ty+(a.res==='ear'?2:4),Math.PI/2+(a.seed-.5)*0.35,col,16);
  });
  // 날아가는 화살
  if(tg.phase==='play'&&tg.i<tg.plan.length){
    const a=tg.plan[tg.i],u=Math.min(1,tg.t/dur),x0=TH[a.who].hand,y0=POT.floor-30,[tx,ty]=tTarget(a),H=48;
    if(u<1){const x=x0+(tx-x0)*u,y=y0+(ty-y0)*u-H*4*u*(1-u),vx=tx-x0,vy=(ty-y0)-H*4*(1-2*u);tArrow(c,x,y,Math.atan2(vy,vx),TH[a.who].fletch);}
  }
  // 점수 줄: 이름과 숫자를 따로 놓아 붙어 보이지 않게 (흰눈썹 ··· 3 : 1 ··· 곰방대)
  c.fillStyle='#3b3027';c.font='12px sans-serif';c.textAlign='right';c.fillText('흰눈썹',128,17);
  c.textAlign='left';c.fillText('곰방대',192,17);
  c.font='bold 14px sans-serif';c.textAlign='center';
  c.fillText(String(tg.score.steady),145,17);c.fillText(':',160,16);c.fillText(String(tg.score.bold),175,17);
  const thrown=w=>tg.plan.slice(0,tg.i).filter(a=>a.who===w&&!a.extra).length;
  for(const who of ['steady','bold'])for(let k=0;k<MG.tuho_arrows;k++){c.fillStyle=k<thrown(who)?'#c9b893':TH[who].fletch;c.fillRect(TH[who].x-11+k*6,8,4,8);}
  c.restore();
}
function tStep(){
  if(tg?.phase!=='play')return;
  const dur=Vfx.reducedMotion?1:MG.tuho_throw_frames;
  tg.t++;
  if(tg.t===dur){tLand(tg.plan[tg.i]);tRender();}
  if(tg.t>=dur+MG.tuho_pause_frames){tg.i++;tg.t=0;if(tg.i>=tg.plan.length)tFinish();}
  tDraw();
}
function tHit(){if(tuhoP.hidden||!tg)return;if(tg.phase==='play')tSkip();}
Rg.playTuho=()=>{
  if(CLASSIC)return;
  if(yAlone()){talk([['곰방대 노인','저 양반은 들어갔다.\n내기는 둘이 있어야 하지. 날 밝거든 오너라.']]);return;}
  tuhoP.hidden=false;tNew();
};
$('jangteoTuhoBtn').onclick=tHit;
tuhoP.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)&&e.target.matches('button')){e.preventDefault();e.stopPropagation();e.target.click();}});
addEventListener('keydown',e=>{
  if(tuhoP.hidden||!['1','2','3','4'].includes(e.key))return;e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)tchoices.children[+e.key-1]?.click();
},true);
defineMinigame({id:'jangteoTuho',hit:tHit,step:tStep});

/* 밤에만 다는 등. 불빛은 길 안내이며 본길이나 출구의 조건으로 삼지 않는다. */
/* 결정 D-290: 등을 다 단 몫. 불빛을 보고 숙소를 찾은 길손이 까치 편에 곶감을 남기고 갔다(까치는 물건을 나르는 우체부다).
   등을 다 단 뒤 까치 곁에 오거나 꾸러미에 말을 걸면 한 번 준다. 까치는 길을 마친 떠돌이라 인사(greeting)만 하므로 field.js가 곁에 오면 부른다. */
function lanternThanks(){
  if(!G.f.jxLanternDone||G.f.jxLanternPaid)return false;
  G.f.jxLanternPaid=true;
  talkGive([['늙은 까치','아가, 이리 오렴. 네 등을 보고 숙소를 찾은 길손이\n등 단 아이 주라고 이걸 맡기고 갔단다.'],
    ['너구리','(까치가 부리로 작은 보자기를 끌어 내민다.)'],
    gotLine('gotgam',2),
    ['늙은 까치','나는 나르기만 했으니 내 몫은 없단다.']]);
  return true;
}
Rg.lanternThanks=lanternThanks;
Rg.lanternTalk=()=>{
  if(lanternThanks())return;
  if(!night()){talk([['늙은 까치',G.f.jxLanternDone?'밤새 등 따라 길손들이 쉬고 갔단다.\n아침 떡 김이 오르니 나도 떠나야지.':'해 지면 이 꾸러미를 풀자꾸나.\n숙소와 골목의 빈 등걸이에 등을 달아 다오.']]);return;}
  if(G.f.jxLanternDone){if(!lanternThanks())talk([['늙은 까치','네 등이 솔숲 입구까지 이어졌구나.\n길손들도 제 잠자리를 찾았단다.']]);return;}
  talk([['늙은 까치',G.f.jxLanternStarted?'남은 등걸이도 밝혀 다오.\n숙소 둘, 거리 골목 하나, 솔숲 입구 하나란다.':'밤 길손들이 숙소를 못 찾는구나.\n등은 네가 달아 주련? 나는 높은 데서 어디가 어두운지 봐 주마.',[
    {t:'꾸러미를 풀고 등 달기',go:()=>{G.f.jxLanternStarted=true;toast('숙소 기둥·창고문 가는 길·거리 골목·솔숲 입구의 빈 등걸이. E로 등을 달자.');}},
    {t:'조금 있다 올게요',go:null}
  ]]]);
};
Rg.lanternAction=id=>{
  if(!night())return;
  // 결정 D-292: 혼자 하는 말은 괄호 안 독백으로 쓴다
  if(!G.f.jxLanternStarted){if(G.zone==='inn')Rg.lanternTalk();else talk([['너구리','(빈 등걸이다.\n숙소 처마 옆에 등불 꾸러미가 있었는데.)']]);return;}
  if(G.f.jxLanterns?.[id]){talk([['너구리',id==='pine'?'(등 너머로 작은 코가 보인다.\n솔숲 안에 누가 있나 보다.)':'(등이 잘 탄다. 다음 등걸이도 보인다.)']]);return;}
  Rg.handWork(()=>{
    const lights=G.f.jxLanterns||(G.f.jxLanterns={});lights[id]=true;
    const done=Rg.lanternPoints.every(p=>lights[p.id]);
    const lines={porch:'(처마 아래 짐꾼들 발이 보인다.\n눈 묻은 신을 벗고 들어온다.)',gate:'(창고문 가는 길이 환해졌다.\n돌아올 땐 이 등을 보고 오면 되겠다.)',alley:'(접힌 좌판 뒤에도 발자국이 있다.\n저쪽이 숙소 지름길이구나.)',pine:'(눈 위에 작은 콧자국이 찍혀 있다.\n솔숲 안에서 킁킁 소리가 난다.)'};
    if(done){G.f.jxLanternDone=true;diary('jx_lanterns','까치와 숙소·골목·솔숲 입구에 등을 달았다. 불빛을 따라 길손들이 돌아왔다. 솔숲 안에서 킁킁 소리가 났다.');}
    talk([['너구리',lines[id]],...(done?[['너구리','(불이 다 이어졌다.\n늙은 까치한테 알려 드려야지.)']]:[])]);
  });
};

/* ---------- 모락 (반달가슴곰 떡집): 김 올리기 ---------- */
/* 김 올리기: 모락 곁에서 아궁이 김을 올린다. 시루가 깨어난다. */
// 결정 D-88: 손일은 미니게임 없이 바로 마친다 (확정: 미니게임은 채집·전투·놀이에만, 대장 2026-10-30). 막혀 있던 판정 코드는 지웠다.
function openSteam(){Sound.steam?.('fan');finishSteam();}
function finishSteam(){
  const F=G.f;if(F.steamDone)return;
  F.steamDone=true;awaken('siru');ledgerDone('morak');rel('morak',MG.handwork_steam_relation);learn('morak:steam');
  diary('j_siru','모락에게 김 올리는 법을 배웠다. 보따리 속 시루에 처음으로 김이 서렸다. 잔칫날의 시루가 깨어났다.');
  toast('잔칫날의 시루가 깨어났다! 쌀가루 2 + 팥 1 → 팥시루떡');refreshHud();
  const lines=[['모락','옳지, 바로 그거야! 떡은 김이 반이지!'],['너구리','(시루가 따뜻해졌다. 이제 떡을 찔 수 있다.)'],
    hintLine('sirumit',['모락','우리 시룻밑은 해져서 김이 새.\n싸리 살에 짚 엮어 새로 깔아야 하는데.'])];   // 결정 D-461: 귀띔
  if(G.rel.morak.v>=2&&!F.morakTaught){F.morakTaught=true;learn('morak:memiltteok');addItem('memil_powder',1);
    lines.push(['모락',Rg.arcs()?'메밀가루 둘로 메밀떡을 쪄! 하나는 내가 줄게.':'시루에 메밀가루 두 됫박이면 메밀떡이지! 한 됫박은 내가 얹어 줄게.'],gotLine('memil_powder'),
      ['모락',Rg.arcs()?'밤마다 물건이 없어지잖아.\n도깨비 짓이면 메밀떡이 약이래. 챙겨 둬!':'할머니들 말로는 도깨비가 메밀을 좋아한대.\n밤마다 장터 물건이 사라지니, 메밀떡 좀 챙겨 둬 봐!']);}
  if(Rg.arcs()&&!F.jangteoArcsMorak1){
    F.jangteoArcsMorak1=true;diary('jangteoArcsMorak1','모락과 김을 올렸다. 지난가을 아빠도 여기서 떡을 먹고, 아이를 두고 왔다고 했단다.');
    lines.push(['모락','지난가을 네 아빠가 굶은 채 지나가길래\n떡을 먹여 보냈지. …아이를 두고 왔다더라.'],['모락','그 아이가 와서 내 김을 배우네.\n자, 먹고 해, 먹고!']);
  }
  talk(lines);
}
function talkMorak(){
  const F=G.f;
  if(!F.morakMet){F.morakMet=true;ledger('morak','모락','쌀가루 3','시루를 깨움');
    talk([['모락',Rg.arcs()?'어서 와, 꼬마야! 설 대목에 맷돌이 쩍 갈라졌지 뭐야!':'어서 와, 꼬마야!\n아이고, 설 대목에 우리 맷돌이 쩍 갈라져서 정신이 없네.'],
      ['모락',Rg.arcs()?'쌀가루 세 됫박만 갈아다 줘!\n섭섭잖게 갚을게!':'쌀가루가 모자라 떡을 못 찌네.\n세 됫박만 갈아다 주면 섭섭잖게 갚을게!'],
      ['모락',Rg.arcs()?'쌀은 엿방울한테 있어, 엿 고고 남은 거!\n갈 맷돌이 문제지만.':'쌀은 엿방울한테 가 봐! 엿 고고 남은 게 있을 거야.\n갈 맷돌이 문제지만.'],
      ['너구리','(맷돌이라면 내 보따리에 있다. 증조할아버지 맷돌.)']],()=>{if(has('ssal_powder',3))morakGive();});
    return;
  }
  if(!F.morakPowder){if(has('ssal_powder',3))morakGive();else talk([['모락','쌀가루 세 됫박만 부탁해, 꼬마야!\n쌀은 엿방울한테 있을 거야!']]);return;}
  if(!F.steamDone){talk([['모락','자, 다시 해 보자! 부채질은 조금씩, 김은 고르게!',[{t:'다시 아궁이 앞에 앉는다',go:openSteam},{t:'조금 이따가요',go:null}]]]);return;}
  if(Rg.arcs()&&F.jangteoArcsPair2&&!F.jangteoArcsPair4&&!F.jxPairBack){
    F.jxPairBack=true;
    // 결정 D-290: 떡 보자기를 두 번 날라 준 몫. 엿방울이 안 받은 떡을 심부름한 아이 몫으로 덜어 준다.
    talkGive([['너구리','엿방울 아주머니가 도로 갖다드리래요.\n고맙다고만 하셨어요.'],['모락','안 받았지? …알았어.'],
      ['모락','(보자기를 풀어 인절미 한 덩이를 떼어 준다.)\n두 번이나 걸었는데 빈손이면 안 되지! 먹고 해, 먹고!'],
      gotLine('injeolmi'),
      ['모락','나머진 식으면 내가 먹지, 뭐.']]);return;
  }
  if(Rg.arcs()&&night()&&(!F.jangteoArcsMorak2||F.jangteoArcsJj1&&!F.jangteoArcsJjSoup)){
    const c=[];
    if(!F.jangteoArcsMorak2)c.push({t:'따로 싼 떡을 본다',go:morakNight});
    if(F.jangteoArcsJj1&&!F.jangteoArcsJjSoup)c.push({t:'문밖 손님 떡국을 부탁한다',go:jjMorakSoup});
    c.push({t:'다음에 올게요',go:null});
    talk([['모락','먹고 해, 먹고! 가게 닫기 전에 한 입 먹을래?',c]]);return;
  }
  if(Rg.arcs()&&!night()&&F.jangteoArcsJj3&&!F.jangteoArcsJjSalt){
    talk([['모락','어, 꼬마야! 그 봉지는 뭐야?',[{t:'짠돌 아저씨 소금을 건넨다',go:jjMorakSalt},{t:'다음에 올게요',go:null}]]]);return;
  }
  if(Rg.arcs()&&!night()&&F.yeotDone&&!F.jangteoArcsPair1){
    talk([['모락','꼬마야, 부탁 하나만 들어줄래?',[{t:'무슨 부탁이에요?',go:pairArc1},{t:'다음에 올게요',go:null}]]]);return;
  }
  talk([['모락','아이고, 꼬마야! 시루로 떡 좀 쪄 봤어?\n떡은 김이 반인 거 알지?'],
    hintLine('mung_batter',['모락','설엔 빈대떡도 부쳐야지.\n녹두에 참기름 한 숟갈 넣고 갈아야 잘 부쳐져.'])]);   // 결정 D-461: 귀띔
}
function morakGive(){
  talk([['모락','오, 쌀가루! 세 됫박만 나눠 줄래, 꼬마야?',[{t:'보따리를 펼친다',go:()=>Trade.open('morak')},{t:'아직은 안 줄래',go:null}]]]);
}
function morakGiveNow(){
  if(G.f.morakPowder||!has('ssal_powder',3))return;
  {
    const F=G.f;takeItem('ssal_powder',3);F.morakPowder=true;rel('morak',1);
    // 결정 D-136: npcs.csv 모락 아빠 단서(확정) 문장을 그대로 되살린다(D-131의 '아빠 자랑' 판 되돌림). 엄마가 아빠 따라 설 대목마다 금빛 테 시루째 떡을 이고 장에 왔기에 모락이 안다.
    clue('j1','모락','모락: "네 엄마 떡 솜씨는 장터에서도 유명했지. 근데 네 아빠는 엄마 얘기만 나오면 말을 돌리더라."');
    diary('j_morak','떡집 모락은 엄마를 알았다. 아빠 따라 설 대목마다 금빛 테 시루째 떡을 이고 장에 왔단다. 엄마가 몇 해 안 오자 지난가을 아빠에게 안부를 물었는데, 엄마 얘기만 나오면 말을 돌렸다고. 왜일까.');
    talk([['모락','고맙다, 꼬마야! 맷돌로 갈아 왔구나?'],['모락','어이쿠, 그 시루! 금빛 테 두른 거…\n네 엄마 거 아니냐?'],
      ['너구리','엄마 시루예요. 어떻게 아세요?'],
      ['모락','네 아빠 따라 설 대목마다 그 시루째 이고 왔거든!\n네 엄마 떡 솜씨는 장터에서도 유명했지.'],
      ['모락',Rg.arcs()?'몇 해 안 오길래 지난가을 네 아빠한테 물었더니\n엄마 얘기만 나오면 말을 돌리더라.':'몇 해 안 오길래 지난가을 네 아빠한테 물었더니\n엄마 얘기만 나오면 말을 돌리더라. 이상하지?'],
      ['모락',Rg.arcs()?'아궁이로 와! 김을 고르게 올려 시루를 깨워 보자!':'시루를 깨우려면 김부터 다룰 줄 알아야지!\n아궁이 앞으로 와. 내가 가르쳐 줄게.']],openSteam);
  }
}

/* ---------- 엿방울 (여우 엿장수): 엿가위 장단 ---------- */
/* 엿가위 장단 (제안): 세 박 묶음 반주와 노트가 같은 초 단위 시계를 쓴다.
   8개 중 5개면 엿 덤. 쌀 8개와 재도전에는 판정에 따른 불이익이 없다. */
const rhP=makePanel('rhythm','엿가위 장단','쩔꺽');
const rh={notes:[],hits:0,combo:0,done:true,reward:false,timer:null,bus:null};
const rcv=$('rhythmCv'),rx=rcv.getContext('2d');
const HIT_X=64,NOTES=MG.rhythm_notes,RH_GOOD=MG.rhythm_good,RH_PERFECT=MG.rhythm_perfect,RH_SPEED=MG.rhythm_scroll_speed;
const rhTalk={
  start:['엿 사려, 엿! 너구리 꼬마, 가위 소리부터 들어 봐.','쌀은 네 몫으로 떼 놨지. 어디, 흥 좀 내 볼까?','내 가위에 장단 맞춰 봐. 덤이 나갈지도 모르잖아?'],
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
  }else{
    // 결정 D-71: 헛가위는 빗나감이다. 가장 가까운 남은 가위가 rhythm_stray_window 안이면 그 가위를 놓친 것으로 센다.
    // 그래서 쉬지 않고 두드리면 가위가 오기 전에 헛가위가 먼저 나가 맞힌 수가 줄어든다. 쌀 8개는 그대로다(확정).
    rhMiss(n&&Math.abs(n.time-now)<=MG.rhythm_stray_window?n:null,now);Sound.click(now,0.035,rh.bus);
  }
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
// 결정 D-22: 아빠의 부탁 "한바탕 웃긴 다음에 주라" (design/data/decisions.csv)
function finishRhythm(){
  if(rhP.hidden)return;rhStop();rhP.hidden=true;const F=G.f;const high=rh.hits>=MG.rhythm_bonus_hits;learn('yeotbang:rhythm');
  const lines=[['엿방울',rhSay(high?(rh.hits===MG.rhythm_bonus_hits?'close':'good'):'fail')]];
  // 결정 D-291: 되·줌으로 세는 물건은 그 단위로 "(○○ 여덟 되를 얻었다.)"라고 적는다 (D-235의 줄과 같은 꼴)
  if(rh.reward){F.yeotDone=true;ledgerDone('yeotbang');addItem('ssal',8);
    lines.push(['엿방울',high?'얼쑤, 장단 좀 아는걸? 흥이 제법 나네!':'흥은 좀 덜 났지만, 쌀 준다는 말은 안 바꾸지!'],['엿방울','자, 엿 고고 남은 쌀 여덟 되! 이건 약속한 네 몫이야.'],['너구리','(쌀 여덟 되를 얻었다.)']);}
  rel('yeotbang',high?MG.rhythm_high_relation:MG.rhythm_relation);
  if(Rg.arcs()){
    if(!F.jangteoArcsYeot1){
      F.jangteoArcsYeot1=true;diary('jangteoArcsYeot1','엿방울의 장단에 맞췄다. 빌린 가위라 손에 덜 익는다고 했다. 쌀 여덟 되는 그대로 받았다.');
      lines.push(['엿방울','이 가위는 빌린 거라 손에 덜 익어.\n소리가 영 심심하네~']);
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
        ['엿방울',paid?'네 아빠가 맡긴 엿은 전에 줬지? 그건 네 몫이었어.':'너구리 아저씨가 아들 준다고 맡긴 엿이야.']);
      if(!paid)lines.push(['엿방울','눈매가 아저씨 판박이라 진작 알았지~\n웃긴 다음에 주랬으니 참았고.'],gotLine('dad_yeot'));
    }else if(!F.jangteoArcsYeot3){
      lines.push(['엿방울',F.jangteoArcsYeotReturned?'제 가위 소리에 맞춰 보자~\n다섯 번 맞추면 나도 흥이 나겠지!':F.jangteoArcsYeot2?'제 가위만 찾으면 소리가 더 찰질 텐데~':'내 엿가위는 따로 있었지~\n…아니다, 장사나 하자.']);
    }
    talk(lines);return;
  }
  if(high&&!F.yeotHigh){F.yeotHigh=true;addItem('dad_yeot',1);learn('yeotbang:high');
    clue('j2','엿방울','아빠는 아들 주려고 엿을 샀다가, 끝내 못 가져가고 엿방울에게 맡겨 두었다.');
    diary('j_yeot','장단을 맞췄더니 엿방울이 숨겨 둔 가락엿을 꺼냈다. 아빠가 나 주려고 샀다가 끝내 못 가져가고 맡긴 엿이다.');
    lines.push(['엿방울','흥 난 김에 이 엿도 꺼내 볼까? 팔 건 아니고, 맡아 둔 거야.'],['엿방울','너구리 아저씨가 아들 준다고 샀다가\n끝내 못 가져가고 내게 맡겼지.'],['엿방울','눈매가 아저씨 판박이라 진작 알았지~\n한바탕 웃긴 다음에 주랬으니 참았고.'],gotLine('dad_yeot'));}
  else if(!high&&!F.yeotHigh)lines.push(['엿방울','내 흥만 좀 더 나면 꺼낼 게 있는데 말이야.\n다음에 가위 여덟 번 중 다섯 번만 맞춰 봐.']);
  talk(lines);
}
function talkYeot(){
  const F=G.f;
  if(!F.yeotMet){F.yeotMet=true;ledger('yeotbang','엿방울','솔방울 5','쌀');
    const hush=Rg.arcs()&&night()&&!G.boss.dead;   // 결정 D-136: 밤·도깨비 전엔 필드에서 수레 밑에 웅크리므로(art.js fox) 첫 만남·거래 권유도 속삭인다.
    talk(hush?[['엿방울','(수레 밑에서) 쉿… 밤엔 큰소리 못 내.\n너구리 꼬마구나~'],
      ['엿방울','불도 꺼졌고 솔방울도 동났어.\n뒷산 솔방울 다섯 개면 다시 살리지.'],
      ['엿방울','엿 고고 남은 쌀 여덟 되랑 바꾸자~\n가위는 작게 쳐도 장단은 장단이지.']]
    :[['엿방울','엿 사려, 엿! 어라, 불부터 살려야겠네.'],
      ['엿방울',Rg.arcs()?'엿 고느라 불을 오래 땠더니 솔방울이 동났네~\n뒷산 솔방울 다섯 개면 불을 살리지.':'엿 고느라 불을 오래 땠더니 솔방울이 동났네.\n뒷산 소나무 숲에서 다섯 개만 주워 올래?'],
      ['엿방울',Rg.arcs()?'엿 고고 남은 쌀 여덟 되랑 바꾸자~\n덤은 엿장수 마음이지!':'대신 남은 쌀 여덟 되를 줄게. 덤?\n그야 엿장수 마음이지. 흥만 나면 또 모르고!']],()=>{if(has('solbang',5))yeotTrade();});
    return;
  }
  // 솔방울을 건넨 뒤 장단을 마치지 못했으면(창을 닫고 다시 열었을 때) 장단부터 마저 한다. 쌀은 장단이 끝나면 준다.
  if(!F.yeotDone&&F.yeotPaid){talk([['엿방울','솔방울은 받았지~ 불 올랐으니 장단 마저 맞춰 볼래?']],()=>openRhythm(true));return;}
  if(!F.yeotDone){if(has('solbang',5))yeotTrade();else talk([['엿방울',Rg.arcs()&&night()&&!G.boss.dead?'(수레 밑에서) 솔방울 다섯 개야. 조용히 다녀와~':'너구리 꼬마, 솔방울 다섯 개면 돼. 뒷산 소나무 숲에 가 봐.']]);return;}
  if(Rg.arcs()){
    const c=[];
    if(night()&&!F.jangteoArcsYeot2)c.push({t:'밤의 엿수레를 살핀다',go:yeotNight});
    if(F.jangteoArcsYeot2&&(F.jangteoArcsScissorsFound||G.boss.dead)&&!F.jangteoArcsYeotReturned)c.push({t:'창고에서 찾은 엿가위를 꺼낸다',go:yeotReturn});
    if(F.jangteoArcsPair1&&!F.jangteoArcsPair2)c.push({t:'모락 아주머니 떡을 건넨다',go:pairArc2});
    if(night()&&F.jangteoArcsPair2&&F.jangteoArcsYeot2&&!F.jangteoArcsPair3)c.push({t:'모락 아주머니 얘기를 묻는다',go:pairArc3});
    if(!night()&&F.jangteoArcsPair3&&F.jangteoArcsYeotReturned&&!F.jangteoArcsPair4)c.push({t:'떡집 앞으로 따라간다',go:pairArc4});
    c.push({t:'엿가위 장단을 맞춘다',go:()=>openRhythm(false)},{t:'그만두기',go:null});
    // 도깨비가 남은 밤엔 수레 밑에 숨어 있다. 큰소리 장사는 낮에만.
    const scared=night()&&!G.boss.dead;
    talk([['엿방울',scared?'누, 누구야? …아, 너구리 꼬마구나~':F.jangteoArcsYeotReturned?'내 가위 소리 들으러 왔어?\n오늘은 가위가 손에 착 붙네~':'엿 사려, 엿! 너구리 꼬마, 무슨 일이야?',c]]);return;
  }
  if(!F.yeotHigh){talk([['엿방울','장단 한 번 더? 여덟 번 중 다섯 번만 맞춰 봐.\n흥이 나면 꺼낼 게 있다니까.',[{t:'엿가위 장단을 맞춘다',go:()=>openRhythm(false)},{t:'그만두기',go:null}]]]);return;}
  talk([['엿방울','엿 사려, 엿! 어라, 내 흥 돋우던 너구리 꼬마네?'],
    hintLine('yaksik',['엿방울','정월엔 약식이지~ 쌀에 밤이랑 대추,\n시루에 쪄 내면 엿보다 달다니까?'])]);   // 결정 D-461: 귀띔
}
function yeotTrade(){
  talk([['엿방울',Rg.arcs()?(night()&&!G.boss.dead?'솔방울 다섯 개랑 쌀 여덟 되. 조용히 바꿀래?':'솔방울 다섯 개랑 쌀 여덟 되, 바꿀래?'):'어라, 솔방울 챙겨 왔네? 다섯 개 주면 쌀 여덟 되, 어때?',[{t:'보따리를 펼친다',go:()=>Trade.open('yeotbang')},{t:'아직은 안 줄래',go:null}]]]);
}
function yeotGive(){
  if(G.f.yeotDone||G.f.yeotPaid||!has('solbang',5))return;
  takeItem('solbang',5);G.f.yeotPaid=true;
  talk([['엿방울',Rg.arcs()?(night()&&!G.boss.dead?'불부터 올리고! 장단은… 작게, 작게~':'불부터 올리고! 가위 장단도 맞춰 볼래?'):'좋아, 불부터 올리고! 엿 고는 동안 내 가위 소리에 장단 맞춰 볼래?']],()=>openRhythm(true));
}
function yeotMoreGive(){
  if(!G.f.yeotDone||!has('solbang',5))return;
  takeItem('solbang',5);addItem('ssal',8);talk([['엿방울','자, 쌀 여덟 되. 떡이야 또 찌면 되지~'],['너구리','(쌀 여덟 되를 얻었다.)']]);
}

/* ---------- 날쌘 (다시 만남): 설 대목 팥 ---------- */
function talkNal(){
  if(!G.f.nalJTalk){G.f.nalJTalk=true;ledger('nal_jangteo','날쌘','쌀가루 1 (또는 메밀가루 1)','팥');
    // 결정 D-142: 아이가 부엉 영감을 만나기 전엔 영감과 고사떡 이야기를 하지 않는다
    talk([['날쌘',!G.f.bueongMet?'또 만났네, 꼬마 보부상. 여긴 설 대목이라 팥이 귀해.\n떡 찔 일 있거든 나한테 와.':Rg.arcs()?'또 만났네, 꼬마 보부상. 여긴 설 대목이라 팥이 귀해.\n부엉 영감 고사떡엔 팥이 들어가야 하거든.':'또 만났네, 꼬마 보부상. 부엉 영감 고사떡엔\n팥이 꼭 들어가니, 이 대목엔 귀한 몸이지.']],nalMenu);}
  else nalMenu();
}
function nalMenu(){
  const F=G.f,c=[{t:'보따리를 펼친다',go:()=>Trade.open('nal')}];
  if(!CLASSIC&&!F.jxCraftMarket)c.push({t:'떡 재료를 더 구할 데를 묻는다',go:marketCraftTrade});
  if(Rg.arcs()&&F.jangteoArcsBueong2&&!F.jangteoArcsNal3)c.push({t:'부엉 영감 장부 얘기를 꺼낸다',go:nalLedger});
  c.push({t:'그만두기',go:null});
  const line=Rg.arcs()?(F.nalJDone?'팥 아껴 써. 부엉 영감은 빛깔까지 따지거든.':(has('ssal_powder')||has('memil_powder'))?'빈손은 아니네? 뭘 바꿀 건데?':'쌀가루 하나면 팥 하나. 메밀가루면 둘. 뭘 낼 건데?'):
    F.nalJDone?'팥 아껴 쓰고 고사떡 잘 쪄.\n부엉 영감은 팥 빛깔까지 따지니까.':(has('ssal_powder')||has('memil_powder'))?'빈손은 아니겠지? 뭘 내놓을 건데?':'쌀가루 한 됫박엔 팥 한 되. 메밀가루면\n두 되 쳐줄게. 뭘 낼 건데?';
  talk([['날쌘',line,c]]);
}
/* 수량은 trades.csv t_craft_market 그대로. 엿방울의 필수 몫을 먼저 남긴다.
   날쌘은 숙소를 피해 밖에서 밤을 나서 솔방울(불쏘시개)이 필요하다. 까닭은 말하지 않는다 (nalLedger 복선). */
function marketCraftTrade(){
  G.f.jxCraftMarketHeard=true;
  const enough=has('solbang',G.f.yeotDone?3:8);
  talk([['날쌘','꿀, 참기름, 녹두, 팥. 한 줌씩 남았어.\n떡 찌기엔 모자라지 않을걸.'],['너구리','뭐랑 바꿔 줘요?'],
    ['날쌘','솔방울 셋. 밤에 불 피울 데가 있어서.'],
    ['날쌘',enough?'넷 다 묶어 줄게. 바꿀래?':G.f.yeotDone?'솔숲에서 셋만 주워 와.':'엿방울한테 줄 다섯은 남겨 두고,\n솔숲에서 셋 더 주워 와.',
    enough?[{t:'보따리를 펼친다',go:()=>Trade.open('nal')},{t:'다음에',go:null}]:[{t:'알겠어요',go:null}]]]);
}
function nalMarketGive(){
  if(G.f.jxCraftMarket||!has('solbang',G.f.yeotDone?3:8))return;
  // 결정 D-147: 묻기 전에 보따리에서 바로 바꾸면, 날쌘이 솔방울을 받는 말을 먼저 한다(까닭은 여전히 흐린다. nalLedger 복선).
  const first=!G.f.jxCraftMarketHeard;G.f.jxCraftMarketHeard=true;
  takeItem('solbang',3);for(const id of ['honey','sesame_oil','mung','pat'])addItem(id,1);
  G.f.jxCraftMarket=true;ledger('t_craft_market','날쌘','솔방울 3','떡 재료 묶음');ledgerDone('t_craft_market');
  talk([...(first?[['날쌘','솔방울 셋이라. 마침 밤에 불 피울 데가 있어.\n한 줌씩 남은 거 묶어 줄게.']]:[]),['너구리','(꿀, 참기름, 녹두, 팥을 하나씩 얻었다.)'],['날쌘','쌀가루에 꿀을 섞어 시루에 쪄 봐.\n어디 쓰든 그건 네 셈이고.']]);
}
// 결정 D-78: 쌀가루에 약과를 얹으면 날쌘이 제 몫으로 먹고 팥 한 되를 더 준다(날쌘은 약과를 좋아한다, tastes.csv).
function nalTrade(id,yak=false){
  const F=G.f;if(!has(id))return;
  takeItem(id,1);F.nalJDone=true;ledgerDone('nal_jangteo');
  const extra=yak&&has('yakgwa');if(extra)takeItem('yakgwa',1);
  const n=(id==='memil_powder'?2:1)+(F.nalJBluff?1:0)+(extra?1:0);addItem('pat',n);
  if(id==='memil_powder')learn('nal:jangteo-memil');
  const lead=extra?[['날쌘','약과? …제법 빚었네.\n이건 팔 거 아니고, 내가 먹을게. 한 되 더 얹지.']]:[];
  const got=['너구리','(팥 '+(KO_COUNT[n]||n)+' 되를 얻었다.)'];
  talk(id==='memil_powder'?[...lead,['날쌘','돌너머 메밀가루네. 장터에선 귀하니까\n팥 '+n+'되 쳐줄게. 잘 받은 줄 알아.'],got]:[...lead,['날쌘','자, 팥 '+n+'되. 거래 끝.'],got]);
}
/* 결정 D-79: 솔방울과 쌀은 진행에 필요한 몫이 모자랄 때만 다시 생긴다(무한 반복 막기). 확정 '쌀 8개'는 그대로다. */
function riceNeeded(){return progressShortage({...G.inv,ssal:(G.inv.ssal||0)+8})<progressShortage(G.inv);}
function conesNeeded(){return riceNeeded()||progressShortage({...G.inv,solbang:(G.inv.solbang||0)+5})<progressShortage(G.inv);}
Rg.riceNeeded=riceNeeded;
// 결정 D-77: 설 대목에 깨진 떡집 맷돌을 돌가루로 때운다(trades.csv t_morak 비고). 모락은 약과로 갚는다.
function morakQuernGive(){
  if(G.f.morakQuern||!has('stonedust'))return;
  takeItem('stonedust',1);addItem('yakgwa',1);G.f.morakQuern=true;rel('morak',1);
  talk([['모락','돌가루? 마침 깨진 맷돌 틈을 못 메워서 애먹었는데!'],['너구리','(모락 아주머니가 돌가루를 물에 개어 맷돌 금에 꾹꾹 채운다.)'],['모락','옳지, 이제 덜컹대지 않겠다!\n자, 약과 하나 가져가!'],gotLine('yakgwa')]);
}

/* ---------- 숙소 마루: 쉬면 낮과 밤이 바뀐다 ---------- */
function restMaru(){
  const toNight=!night();
  // 결정 D-131: 도깨비를 물리친 그믐밤 뒤 첫 아침이 설날이다. 장터 사연의 마지막 막이 이 아침에 열린다.
  const seollal=!toNight&&G.boss.dead&&!G.f.jxSeollal;
  talk([['너구리',toNight?(Rg.arcs()?'(마루에서 기다리니 해가 졌다. 등불이 켜진다.)':'(숙소 마루에서 해가 지기를 기다렸다. 장터에 하나둘 등불이 켜진다.)'):seollal?'(마루에서 한숨 자고 나니 설날 아침이다.\n지붕마다 떡 김이 오른다.)':'(마루에서 한숨 자고 나니 날이 밝았다.)']],()=>{
    G.f.night=toNight;learn('maru:rest');if(seollal)G.f.jxSeollal=true;
    if(toNight&&G.f.jxSeollal)G.f.jxSeollalPast=true;   // 설날 아침 뒤로 또 밤을 보내면 그다음 아침부터는 설날이 아니다
    const morning=seollal?'설날 아침이다.':'아침이 되었다.';
    if(!CLASSIC){
      // 잠든 사이 바람이 새 솔방울을 떨어뜨린다. 고정 id를 되살려 저장 중복을 만들지 않는다.
      // 결정 D-79: 진행에 필요한 몫(엿방울 몫, 모자란 쌀)이 모자랄 때만 다시 떨어진다.
      const refill=!toNight&&conesNeeded();
      if(refill)for(const a of G.pickups)if(a.zone==='pine'&&a.item==='solbang')a.got=false;
      toast(toNight?'밤이 되었다. 좌판이 접히고 골목이 열렸다.':refill?morning+' 솔숲에 새 솔방울이 떨어졌다.':morning);
    }else toast(toNight?'밤이 되었다':morning);refreshGoal();});
}

/* ---------- 부엉 영감 (보부상단 접장): 밤에만 깨어 있다 ---------- */
function talkBueong(){
  const F=G.f;
  if(!night()&&Rg.arcs()&&G.boss.dead&&F.jangteoArcsKid2&&!F.jangteoArcsKid3&&has('hongsi_tteok')){
    talk([['너구리',G.f.jxSeollalPast?'(부엉 영감님이 아침인데 처마 밑에서 눈을 뜨고 있다.)':'(부엉 영감님이 설날 아침인데 처마 밑에서 눈을 뜨고 있다.)',[{t:'떠날 채비를 말씀드린다',go:bueongKidArc3},{t:'다음에',go:null}]]]);return;
  }
  if(!night()){learn('bueong:night');
    talk([['너구리','(부엉 영감님이 처마 밑에서 꾸벅꾸벅 졸고 있다.)'],['너구리','(낮엔 주무시네. 숙소 마루에서 해 질 때까지 쉬자.)']]);return;}
  if(!F.bueongNight){F.bueongNight=true;F.bueongMet=true;learn('bueong:rule');ledger('bueong','부엉 영감','팥시루떡 1','아빠가 맡긴 짐');
    talk([...(Rg.arcs()?[['너구리','(수리부엉이가 장부를 한 장 넘긴다.)']]:[]),['부엉 영감',Rg.arcs()?'부엉. 그 모자 주인의 아들이냐.':'부엉. 그 모자, 장부에 오른 너구리의 것이로구나.\n네가 그 녀석 아들이냐.'],
      ['부엉 영감',Rg.arcs()?'네 아비가 짐을 맡겼다. 보부상단에 맡긴 짐은\n보부상에게만 내준다. 규칙이다.':'네 아비가 짐을 맡겼다.\n보부상단에 맡긴 물건은 보부상에게만 내준다. 규칙이다.'],
      ['부엉 영감',Rg.arcs()?'설 고사에 팥시루떡을 올려라. 그러면\n보부상 신표, 상단이 인정한 패를 내주마.':'보부상단 설 고사에 팥시루떡을 올려라.\n정식 보부상으로 인정하는 패, 신표를 내주마.']],()=>{if(has('patsirutteok'))bueongGive();});
    return;
  }
  if(!F.bueongDone){if(has('patsirutteok'))bueongGive();else talk([['부엉 영감','쌀가루 두 됫박에 팥 한 되다. 시루에 쪄서 팥시루떡을 가져오너라.']]);return;}
  if(Rg.arcs()){
    const c=[];
    if(!F.jangteoArcsBueong2)c.push({t:'아빠 메모의 "값"을 묻는다',go:bueongLedger});
    else if(F.jangteoArcsNal3&&!F.jangteoArcsBueong3)c.push({t:'날쌘 아저씨 얘기를 꺼낸다',go:bueongPromise});
    if(!F.jangteoArcsKid1)c.push({t:'수첩 뒤의 물품 장부를 보여 드린다',go:bueongKidArc1});
    else if(G.boss.dead&&!F.jangteoArcsKid2)c.push({t:'장부에 적는 걸 지켜본다',go:bueongKidArc2});
    if(F.jangteoArcsJj2&&F.jangteoArcsJjSalt&&!F.jangteoArcsJj4)c.push({t:'문밖 손님 얘기를 꺼낸다',go:jjArc4});
    c.push({t:'그만두기',go:null});
    // 결정 D-141: 부수기와 달래기에 세계가 다르게 반응한다(보스 뒤 첫 인사 한 번). 불이익은 없다.
    const bossWord=G.boss.dead&&!F.jxBueongBossWord?(knows('calm:dokkaebi')?'헌것들을 제자리로 돌려보냈구나. ':'창고가 조용하군. 헌것들은 내다 태우마. '):'';
    if(G.boss.dead)F.jxBueongBossWord=true;
    talk([['부엉 영감',G.boss.dead?bossWord+'제 몫을 했구나. 장부에 적어 두마.':'오늘 밤 숙소 창고 문 앞을 지켜라.',c]]);return;
  }
  if(!G.boss.dead){talk([['부엉 영감','그믐 밤엔 헌것들이 들썩인다. 오늘 밤 숙소 창고 문 앞을 지켜라.']]);return;}
  talk([['부엉 영감','수고했다. 제 몫을 하는 보부상이로구나. 장부에 적어 두마.'],
    hintLine('jatjuk',['부엉 영감','…늙으니 잣죽이 낫구나.\n쌀에 잣을 같이 갈아야 곱지.'])]);   // 결정 D-461: 귀띔
}
// 결정 D-23: 짐 보관 값을 안 받는 근거 (design/data/decisions.csv)
function bueongGive(){
  talk([['부엉 영감','고사떡을 가져왔구나.',[{t:'보따리를 펼친다',go:()=>Trade.open('bueong')},{t:'조금 이따가요',go:null}]]]);
}
function bueongGiveNow(){
  if(G.f.bueongDone||!has('patsirutteok')||!night())return;
  {
    const F=G.f;takeItem('patsirutteok',1);F.bueongDone=true;F.guard=true;ledgerDone('bueong');rel('bueong',1);learn('bueong:sinpyo');
    addItem('sinpyo',1);addItem('dad_memo',1);
    // 결정 D-421·D-428: 메모의 '되돌림' 줄을 빼고 이무기와 "이름 불러도 돌아보지 말 것"을 넣었다.
    // 결정 D-428: 영감이 짐을 내주며 장부의 아빠 줄을 짚는다. 이름 칸만 하얗다(이름의 규칙 3: 영감도 지워진 줄 모르고 제가 비워 둔 줄 안다).
    //   아이는 짐표를 쥐어 본다. 둘을 잇는 말은 하지 않는다. 이름을 묻지 않은 영감은 아이를 '상단 막내'라 부른다(꼭 거치는 길의 셋째 이름).
    const maknae=()=>{if(grantNickname('jang_sangdan_maknae','상단 막내','부엉 영감'))diary('nickname:jang_sangdan_maknae','부엉 영감에게 상단 막내라고 불렸다.');};
    clue('j3',NAME_CLUES.j3.who,NAME_CLUES.j3.text);
    diary('j_memo','보부상 신표를 받았다. 아빠의 짐 속에 메모가 있었다. "값은 이미 치러졌다. 이번엔 내가 치른다." 누가, 무슨 값을 치렀다는 걸까.');
    if(Rg.arcs()){
      F.jangteoArcsBueong1=true;diary('jangteoArcsBueong1','부엉 영감이 장부에 표시하고 신표를 내주었다. 아빠가 맡긴 짐도 몇 달째 보관하고 있었다.');
      talk([['너구리','(영감님이 고사떡을 올리고 장부 한 줄에 표시만 한다.\n내 이름은 묻지 않는다.)'],
        ['부엉 영감','신표다. 네 아비 짐도 받아라.\n보관 값은 안 받으마.'],   // 결정 D-424: 작은 지게는 뺐다(요술보따리)
        ['너구리','(보부상 신표와 아빠가 맡긴 짐을 얻었다.)'],
        ['부엉 영감','네 아비 셈은 장부에 넉넉히 남아 있다.'],
        ['너구리','(영감님이 짚은 줄. 셈은 빼곡한데\n이름 칸만 하얗다.)'],
        ['부엉 영감','…이 칸을 내가 왜 비워 뒀나. 늙었구나.'],
        ['너구리','(보따리 끈의 짐표를 쥐어 본다.\n앞면이 매끈하다.)'],
        ['너구리','(짐 속에 아빠 메모가 있다.)\n"값은 이미 치러졌다. 이번엔 내가 치른다."'],
        ['너구리','"북쪽 영산. 호수에 이무기가 앉았다 한다.\n이름 불러도 돌아보지 말 것."'],
        ['부엉 영감','이제 상단 식구다. 막내지.'],
        ['부엉 영감','상단 막내, 오늘이 섣달그믐이다.\n그믐 밤엔 헌것들이 들썩이고, 창고 물건이 없어진다.'],
        ['부엉 영감','오늘 밤 창고 문 앞을 지켜라. 보부상의 일이다.']
      ],()=>{maknae();toast('숙소 창고를 지키자');refreshGoal();});return;
    }
    talk([['부엉 영감','붉은 팥이 제대로 들었구나. 고사상에 올릴 만하다.'],['너구리','(영감님이 떡을 올리고 장부에 신표 표시를 한다.)'],
      ['부엉 영감','이제 너도 보부상단 식구다. 막내지.\n신표를 받아라.'],['부엉 영감','이건 네 아비가 맡긴 짐이다.'],
      ['너구리','(영감님이 짐과 장부의 아빠 줄을 맞춰 본다.\n셈은 빼곡한데 이름 칸만 하얗다.)'],
      ['부엉 영감','…이 칸을 내가 왜 비워 뒀나. 늙었구나. 받아라.'],['너구리','(보부상 신표와 아빠가 맡긴 짐을 얻었다.)'],
      ['너구리','(보따리 끈의 짐표를 쥐어 본다.\n앞면이 매끈하다.)'],
      ['너구리','(짐 속에 접힌 종이가 있다. 아빠 글씨다.)'],
      ['너구리','"값은 이미 치러졌다. 이번엔 내가 치른다.\n북쪽 영산. 호수에 이무기가 앉았다 한다."'],
      ['너구리','"이름 불러도 돌아보지 말 것."'],
      ['부엉 영감','상단 막내, 오늘은 섣달그믐이다. 밤마다 장터 물건이 사라진다.\n보부상의 의무로 오늘 밤 숙소 창고를 지켜라.']],()=>{maknae();toast('숙소 창고를 지키자');refreshGoal();});
  }
}

/* ---------- 헌물 도깨비 전투 ---------- */
Rg.startDokkaebi=()=>{
  // 표의 부수면 칸은 id 하나만 받는다. 키의 기본 콩 1개에 지역 결정분 1개를 보탠다.
  // 전투 결과 콜백은 후퇴·패배 때도 부위 전리품 지급이 끝난 뒤 한 번 실행된다.
  let encounter=null;
  G.px=Rg.STORE_X-30;
  inkTransition('헌물 도깨비',(Rg.STORE_X-G.cam)/W*100,()=>{startBattle('dokkaebi',res=>{
    if(encounter?.parts.some(p=>p.id==='ki'&&p.broken))addItem('kong',1);
    if(res==='win'||res==='calm'){
      if(res==='calm'){
        if(!has('dokkaebibul'))addItem('dokkaebibul',1);
        diary('j_calm','헌물 도깨비를 부수지 않고 달랬다. 도깨비는 훔친 것을 돌려놓고 고맙다며 도깨비불씨를 건넨 뒤 춤추듯 사라졌다.');
      }
      Rg.bossDie(res==='calm');
    }else{
      G.px=Rg.STORE_X-70;G.f.faints+=res==='lose'?1:0;
      diary('j_hint','헌물 도깨비는 빗자루로 쓸고, 키로 콩을 뿌리고, 멍석을 말아 온다. 헌물을 하나 부수면 도깨비불이 드러난다. 도깨비는 메밀을 좋아한다는 말이 있다.');
      talk([['너구리','(헌물을 하나 부수면 도깨비불이 드러나.\n메밀을 좋아한다는 말도 있었지.)']],()=>toast('준비되면 다시 창고 문 앞으로'));
    }
  });encounter=B;});
};

/* ---------- 끝: 홍시 약떡을 까치 편에 보내기 ---------- */
// 결정 D-131: 약떡은 그믐밤에 쪄도 설날 아침에 맡긴다. 늙은 까치는 밤길을 못 난다(region.js 첫 만남 "날개가 예전 같지 않아서").
// 그래서 아이는 마루에서 하룻밤을 더 자고, 그 아침에 장터 사연의 마지막 막(투호 첫판·얼레 동생 꼭지·등잔발·영감 도장 등)이 열린다.
Rg.magpieTteok=()=>{
  if(CLASSIC||!G.boss.dead||!has('hongsi_tteok')||G.f.hongsiMade||regionCompleted(Rg.id))return null;
  if(night())return [['늙은 까치','아가, 늙은 날개로 밤길은 못 난단다.\n마루에서 한숨 자고, 아침 김 오를 때 떠나자꾸나.',
    [{t:'아침 일찍 올게요',go:()=>{G.f.jxMagpieNight=true;refreshGoal();}}]]];
  return [['늙은 까치',(G.f.jxSeollalPast?'날이 밝았구나.':'설날 아침이구나.')+' 이제 날 수 있겠다.\n장터에 인사할 데가 있으면 다녀오렴. 기다리마.',
    [{t:'홍시 약떡을 맡긴다',go:Rg.sendMedicine},{t:'인사하고 올게요',go:()=>{G.f.jxMagpieMorning=true;}}]]];
};
// 결정 D-89: 까치 답장은 아이가 본 것을 지문으로 쓴다.
// 결정 D-131: 답장 끝에 엄마가 말을 하나 더 놓친 몸짓을 둔다. 까치는 흉내만 내고, 뜻은 아이가 읽는다.
Rg.homeReplyText='한참 뒤, 까치가 빈 떡보자기를 물고 돌아왔다. 엄마가 빨아 갠 보자기에는 말린 감 꼭지 하나가 싸여 있었다. 까치는 엄마처럼 날개를 볼에 대고 고개를 끄덕이더니, 부리를 열었다가 그냥 닫았다. 엄마가 아침마다 내 이름 앞에서 하던 몸짓이다.';
Rg.homeReply=[['너구리','(한참 뒤, 까치가 빈 떡보자기를 물고 돌아왔다.)'],
  ['너구리','(엄마가 빨아 갠 보자기에 말린 감 꼭지가 싸여 있다.)'],
  ['너구리','(까치가 엄마처럼 날개를 볼에 대고 끄덕인다.\n그러고는 부리를 열었다가, 그냥 닫는다.)'],
  ['너구리','(엄마가 아침마다 내 이름 앞에서 하던 거다.)']];
function handMedicineToMagpie(){
  const before=G.inv.hongsi_tteok||0;
  if(typeof sendHomeGift==='function')sendHomeGift('jangteo','hongsi_tteok');
  // 공통 연결이 없거나 선택 가공품을 먼저 보낸 경우에도 필수 약떡은 보낸다.
  if((G.inv.hongsi_tteok||0)===before)takeItem('hongsi_tteok',1);
  learn('home:jangteo',true);
  diary('jx_home_reply',Rg.homeReplyText);
}
Rg.sendMedicine=()=>{
  if(regionCompleted(Rg.id))return;
  if(Rg.arcs()&&G.f.jangteoArcsMorak2&&!G.f.jangteoArcsMorak3){
    talk([['너구리','엄마 드릴 홍시 약떡이에요.',[{t:'모락 아주머니의 설 떡도 함께 보낸다',go:()=>{
      // 별도 소지품·추가 재료 없이 모락이 자기 떡을 보탠다. 약떡은 기존처럼 하나만 소비한다.
      G.f.hongsiMade=true;G.f.jangteoArcsMorak3=true;
      diary('j_end','눈홍시와 쌀가루로 홍시 약떡을 쪘다. 엄마가 동네에 떡을 돌리던 시루로, 이번엔 엄마를 위한 떡을 쪘다.');
      talk([['너구리','(모락 아주머니가 싸 준 설 떡도 같이 얹었다.\n“네 엄마도 설 떡 드셔야지.” 하셨지.)'],
        ['너구리','(까치가 떡을 문다.)\n엄마 시루로 쪘다고 전해 주세요.']
      ],()=>{
        handMedicineToMagpie();
        // 날아간 직후 답장이 오지 않도록 시간 경과를 밝힌 짧은 후일담으로 마무리한다.
        talk([...Rg.homeReply,
          ['너구리','(…그래도 맛있게는 드셨구나.\n모락 아주머니한테도 알려 드려야지.)']
        ],()=>{
          diary('jangteoArcsMorak3','모락 아주머니의 설 떡도 약떡과 함께 보냈다. 돌아온 까치가 날개를 볼에 대는 엄마 몸짓을 흉내 냈다. 맛있게 드셨다는 뜻이다. 그러고는 부리를 열었다 닫았다.');endGame();
        });
      });
    }},{t:'약떡만 보낸다',go:sendMedicine}]]]);return;
  }
  sendMedicine();
};
function sendMedicine(){
  G.f.hongsiMade=true;
  diary('j_end','눈홍시와 쌀가루로 홍시 약떡을 쪘다. 엄마가 동네에 떡을 돌리던 시루로, 이번엔 엄마를 위한 떡을 쪘다.');
  talk([['너구리','엄마 드릴 홍시 약떡이에요.'],['너구리','(늙은 까치가 처마에서 내려와 떡 보자기를 물었다.)'],['너구리','엄마한테 전해 주세요. 엄마 시루로 쪘다고요.']],()=>{
    handMedicineToMagpie();
    talk([...Rg.homeReply,['너구리','(…그래도 감 냄새는 맡으셨구나.)']],endGame);
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
    const place={morak:['street',1380,GROUND],yeotbang:['street',1660,GROUND],nal:['street',430,GROUND],maru:['inn',1080,GROUND],bueong:['inn',920,GROUND]}[n.id];
    const p=Object.defineProperties({},Object.getOwnPropertyDescriptors(n));
    Object.defineProperty(p,'x',{value:place[1],writable:true,enumerable:true,configurable:true});
    p.zone=place[0];p.y=place[2];
    if(n.id==='morak')p.props=null; // 결정 D-315: 떡집은 확장 배경(art.js)이 땅 위 가게로 그리고, 모락은 그 안 땅에 선다.
    if(n.id==='yeotbang')p.talk=()=>{
      if(!G.f.yeotDone){n.talk();return;}
      const hide=night()&&!G.boss.dead&&Rg.arcs();
      talk([[hide?'너구리':'엿방울',hide?'(엿방울 아주머니는 수레 밑에서 꼬리 끝만 비죽 보인다.)':(Rg.riceNeeded()?'불쏘시개는 늘 필요하지~\n솔방울을 더 주우면 쌀도 더 바꿔 줄게.':'쌀은 넉넉해 보이는데~\n떡 찌다 모자라면 그때 와.'),[
        {t:'가위 장단과 이야기',go:n.talk},
        // 결정 D-79: 쌀이 진행에 모자랄 때만 더 바꿔 준다.
        ...(Rg.riceNeeded()?[{t:'솔방울 5개로 쌀 8개 더 구하기',go:()=>{
          if(!has('solbang',5)){talk([['엿방울','솔방울 다섯 개면 쌀 여덟 되야~\n솔숲이 비었으면 숙소에서 쉬고 와. 그새 또 떨어지거든.']]);return;}
          Trade.open('yeotbang');
        }}]:[]),{t:'다음에',go:null}]]]);
    };
    return p;
  });
}

/* ---------- 지금 할 일 ---------- */
Rg.goal=()=>{
  const F=G.f;
  if(!G.started)return '';
  if(G.ended)return '큰 장터 체험판 완료';
  // 결정 D-149: 짧은 명사형으로 핵심만, 장소는 붙이지 않는다. 밤에만 되는 일은 낮에 '밤에'를 앞에 붙인다.
  const toNight=s=>night()?s:'밤에 '+s;
  // 결정 D-67: 앞선 진행부터 거꾸로 본다
  if(G.boss.dead){
    if(!CLASSIC&&has('hongsi_tteok'))return night()&&G.f.jxMagpieNight?'아침에 늙은 까치에게 약떡 맡기기':'늙은 까치에게 홍시 약떡 맡기기';
    if((G.inv.ssal_powder||0)<1&&!has('hongsi_tteok'))return '맷돌에 쌀 갈기';
    return '시루에 눈홍시와 쌀가루 넣어 약떡 찌기';
  }
  if(F.bueongDone)return toNight('창고 문 앞 지키기');
  // 결정 D-447: 아직 말을 나눠 보지 않은 인물은 이름 대신 아이가 아는 것(숙소, 떡집)으로 부른다. 시작 글: "보부상은 장터에 오면 숙소부터 들른다"
  const bueongKnown=knows('met:bueong')||knows('bueong:night');
  if(!F.bueongNight)return night()?(bueongKnown?'부엉 영감님께 말 걸기':'보부상 숙소 주인께 말 걸기'):knows('bueong:night')?'마루에서 쉬며 밤 기다리기':'보부상 숙소 찾아가기';
  if(!F.bueongDone){
    if(has('patsirutteok'))return toNight('부엉 영감님께 팥시루떡 올리기');
    if(!isAwake('siru')){
      if(!F.morakMet)return '떡집 찾아가기';
      const sp=G.inv.ssal_powder||0,s=G.inv.ssal||0;
      if(sp>=3)return '모락에게 쌀가루 3개 건네기';
      if(sp+s>=3)return '맷돌에 쌀 갈기 ('+sp+'/3)';
      if(!F.yeotMet)return '엿방울에게 쌀 구하기';
      const sb=G.inv.solbang||0;
      return sb>=5?'엿방울에게 솔방울 건네기':'솔방울 줍기 ('+sb+'/5)';
    }
    if(!has('pat'))return '날쌘에게 팥 구하기';
    if((G.inv.ssal_powder||0)<2)return '맷돌에 쌀 갈기';
    return '시루에 쌀가루 2개와 팥 1개 찌기';
  }
  return toNight('창고 문 앞 지키기');
};
/* 결정 D-149: 보통 일(사연에서 맡은 심부름). 아이가 하겠다고 한 뒤부터 마칠 때까지만 보인다. */
defineSideQuests(Rg.id,[
  {id:'jang_jj_soup',title:'짠돌 아저씨께 떡국 날라 드리기',start:F=>F.jangteoArcsJj1,done:F=>F.jangteoArcsJj2,
    text:F=>F.jangteoArcsJjSoup?'짠돌 아저씨께 떡국 갖다드리기':'모락에게 떡국 부탁하기'},
  {id:'jang_jj_salt',title:'모락에게 짠돌 아저씨 소금 전하기',start:F=>F.jangteoArcsJj3,done:F=>F.jangteoArcsJjSalt,text:()=>'모락에게 짠돌 아저씨 소금 전하기'},
  {id:'jang_scissors',title:'엿방울의 엿가위 찾기',start:F=>F.jangteoArcsYeot2,done:F=>F.jangteoArcsYeotReturned,
    text:F=>F.jangteoArcsScissorsFound?'엿방울에게 엿가위 돌려주기':'엿방울의 엿가위 찾기'},
  {id:'jang_pair_tteok',title:'엿방울에게 모락 떡 전하기',start:F=>F.jangteoArcsPair1,done:F=>F.jangteoArcsPair2,text:()=>'엿방울에게 모락 떡 전하기'},
  {id:'jang_elder_night',title:'곰방대 할아버지 밤 이야기 듣기',start:F=>F.jangteoArcsElder1,done:F=>F.jangteoArcsElder2,
    text:()=>night()?'곰방대 할아버지께 말 걸기':'밤에 곰방대 할아버지 찾아가기'},
]);

/* ---------- 교환 화면의 부탁 (engine/trade.js) ----------
   결정 D-39: 원하는 것을 들은 뒤에만 보인다. 받은 뒤의 이야기는 위의 대화 함수가 이어 간다.
   엿방울의 쌀 8되는 솔방울을 받은 뒤 장단이 끝나면 준다(확정. 장단은 덤 엿에만 영향).
   결정 D-40: 날쌘에게 허세가 통하면 팥을 한 되 더 얹는다(경멸 축). 그 뒤 다시 바꾸는 팥에도 같은 셈이다. */
Rg.trade={
  yeotbang:()=>[
    ...(G.f.yeotMet?[{id:'t_yeotbang',item:'ssal',n:8,asks:[{solbang:5}],
      locked:()=>G.f.yeotPaid?'솔방울은 벌써 건넸다. 엿 고는 동안 장단을 맞추면 쌀을 준다.':null,
      done:()=>G.f.yeotDone,accept:yeotGive}]:[]),
    // 결정 D-123: 엿방울이 "쌀은 넉넉해 보인다"고 말한 뒤에도 그 쌀은 보따리에 보인다. 모자랄 때만 바꾼다.
    ...(!CLASSIC&&G.f.yeotDone?[{id:'t_yeotbang_more',item:'ssal',n:8,asks:[{solbang:5}],
      locked:()=>riceNeeded()?null:'쌀은 넉넉해 보인다고 했다. 떡 찌다 모자라면 그때 오자.',accept:yeotMoreGive}]:[])
  ],
  nal:()=>[
    ...(G.ledger.nal_jangteo?[
      {id:'t_nal_jangteo_ssal',item:'pat',n:1+(G.f.nalJBluff?1:0),asks:[{ssal_powder:1},{ssal_powder:1,yakgwa:1}],done:()=>G.f.nalJDone&&CLASSIC,accept:i=>nalTrade('ssal_powder',i===1)},
      {id:'t_nal_jangteo_memil',item:'pat',n:2+(G.f.nalJBluff?1:0),asks:[{memil_powder:1}],done:()=>G.f.nalJDone&&CLASSIC,accept:()=>nalTrade('memil_powder')}
    ]:[]),
    // 결정 D-147: 떡 재료 묶음은 처음부터 날쌘 지게에 있다. 엿방울 몫을 아직 모르면 까닭은 말하지 않고 남겨 두기만 한다.
    ...(!CLASSIC?[{id:'t_craft_market',item:'honey',label:'꿀 · 참기름 · 녹두 · 팥',asks:[{solbang:3}],
      locked:()=>!G.f.yeotDone&&has('solbang',3)&&(G.inv.solbang||0)<8?(G.f.yeotMet?'엿방울한테 줄 솔방울 다섯은 남겨 둬야 한다.':'솔방울은 아직 쓸 데가 있다.'):null,
      done:()=>G.f.jxCraftMarket,accept:nalMarketGive}]:[])
  ],
  morak:()=>G.f.morakMet?[{id:'t_morak',item:'patsirutteok',label:'시루를 깨우는 김 다루기',asks:[{ssal_powder:3}],done:()=>G.f.morakPowder,accept:morakGiveNow},
    {id:'t_morak_quern',item:'yakgwa',n:1,label:'깨진 떡집 맷돌 때우기 · 약과 1',asks:[{stonedust:1}],done:()=>G.f.morakQuern,accept:morakQuernGive}]:[],
  bueong:()=>G.f.bueongNight?[{id:'t_bueong',item:'sinpyo',label:'보부상 신표 · 아빠가 맡긴 짐',asks:[{patsirutteok:1}],
    locked:()=>night()?null:'부엉 영감님은 밤에만 깨어 계신다.',done:()=>G.f.bueongDone,accept:bueongGiveNow}]:[]
};
Rg.onHaggle=(npc,way)=>{
  if(npc!=='nal'||way!=='허세'||G.f.nalJBluff)return false;
  G.f.nalJBluff=true;rel('nal',1);
  return true;
};
})();
