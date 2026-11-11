'use strict';
/* 자동으로 만든 파일이다. 직접 고치지 말고 design/data/*.csv 를 고친 뒤 node prototypes/web/tools/build-data.js 를 돌린다 */
const TABLES={
 "ITEMS": {
  "acorn": {
   "n": "도토리",
   "r": 0,
   "kind": "재료",
   "region": "galchamgol",
   "d": "참나무 열매. 떫어서 그냥은 못 먹고 가루로 빻아 쓴다.",
   "u": "알"
  },
  "bam": {
   "n": "밤",
   "r": 0,
   "kind": "재료",
   "region": "galchamgol",
   "d": "가시 송이째 떨어져 벌어진 알밤. 구우면 속이 노랗고 달다."
  },
  "acorn_gift": {
   "n": "다람쥐 형제의 도토리",
   "r": 1,
   "kind": "귀한 것",
   "region": "galchamgol",
   "d": "형이 고른 큰 것 하나, 동생이 고른 작은 것 하나. 썩지 않게 꼭 싸 두었다. 엄마랑 나눠 먹을 것.",
   "u": "알"
  },
  "powder": {
   "n": "도토리 가루",
   "r": 1,
   "kind": "재료",
   "region": "galchamgol",
   "d": "절구로 빻은 도토리. 단풍골에서 잘 팔린다.",
   "u": "줌"
  },
  "root": {
   "n": "칡뿌리",
   "r": 1,
   "kind": "재료",
   "region": "galchamgol",
   "d": "땅속 깊이 뻗은 칡의 뿌리. 질기고 달다.",
   "u": "뿌리"
  },
  "coal": {
   "n": "숯",
   "r": 1,
   "kind": "재료",
   "region": "galchamgol",
   "d": "참나무를 구워 만든 숯. 대장간 불의 밥.",
   "u": "덩이"
  },
  "ssari": {
   "n": "싸리버섯",
   "r": 2,
   "kind": "재료",
   "region": "galchamgol",
   "d": "싸리 빗자루처럼 가늘게 갈라진 버섯. 가을 참나무 숲에 난다.",
   "u": "송이"
  },
  "kkoe": {
   "n": "꾀꼬리버섯",
   "r": 2,
   "kind": "재료",
   "region": "galchamgol",
   "d": "꾀꼬리 깃털처럼 노란 버섯. 은은한 살구 향이 난다.",
   "u": "송이"
  },
  "meoru": {
   "n": "해머루",
   "r": 3,
   "kind": "귀한 것",
   "region": "galchamgol",
   "d": "당산나무를 감은 늙은 칡이 꽃 속에 품어 맺는 머루. 해를 머금은 듯 알이 따뜻하다."
  },
  "rice": {
   "n": "주먹밥",
   "r": 0,
   "kind": "먹을거리",
   "region": "전체",
   "d": "엄마가 싸 준 주먹밥. 먹으면 기운이 난다.",
   "eat": 2,
   "food": {
    "group": "끼니"
   }
  },
  "vine": {
   "n": "칡 줄기",
   "r": 1,
   "kind": "재료",
   "region": "galchamgol",
   "d": "엉킨 칡의 줄기에서 얻은 질긴 줄기. 끈이나 바구니를 엮기 좋다.",
   "u": "가닥"
  },
  "kflower": {
   "n": "칡꽃",
   "r": 3,
   "kind": "재료",
   "region": "galchamgol",
   "d": "엉킨 칡의 머리에 핀 보랏빛 꽃. 달큰한 향이 오래 남는다."
  },
  "eoksae": {
   "n": "마른 억새",
   "r": 0,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "서리 맞아 하얗게 센 억새. 겨울잠 둥지를 짓기 좋다.",
   "u": "단"
  },
  "memil": {
   "n": "메밀",
   "r": 0,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "세모난 검은 낟알. 돌밭에서도 잘 자란다.",
   "u": "줌"
  },
  "memil_powder": {
   "n": "메밀가루",
   "r": 1,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "맷돌에 곱게 간 메밀. 장승제 메밀전을 부친다.",
   "u": "줌"
  },
  "gyeousari": {
   "n": "겨우살이",
   "r": 1,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "겨울에도 푸른 기생 나무. 새들이 열매를 좋아한다.",
   "u": "줌"
  },
  "gyeolmyeongja": {
   "n": "결명자",
   "r": 2,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "눈을 밝힌다는 약재 씨앗. 볶아서 차로 달인다.",
   "u": "줌"
  },
  "seogi": {
   "n": "석이버섯",
   "r": 2,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "바위에 붙어 자라는 귀 모양 버섯. 백 년 바위에만 난다는 말이 있다.",
   "u": "장"
  },
  "seoridarae": {
   "n": "서리다래",
   "r": 3,
   "kind": "귀한 것",
   "region": "dolneomeo",
   "d": "첫서리 밤에 성황당 돌무더기가 가슴의 핵 안에 품어 맺은 다래. 엄마 기운을 붙드는 약 재료."
  },
  "darae_yak": {
   "n": "서리다래 약즙",
   "r": 3,
   "kind": "귀한 것",
   "region": "dolneomeo",
   "d": "맷돌에 간 서리다래. 까치 편에 엄마에게 보낸다."
  },
  "mud": {
   "n": "진흙 덩이",
   "r": 1,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "돌 골렘의 다리를 이루던 진흙. 아직 축축하다.",
   "u": "덩이"
  },
  "stonedust": {
   "n": "돌가루",
   "r": 1,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "돌 골렘의 팔에서 떨어진 고운 돌가루.",
   "u": "줌"
  },
  "mossy_eye": {
   "n": "이끼 낀 눈돌",
   "r": 1,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "돌 골렘의 눈이던 둥근 돌. 이끼가 눈썹처럼 붙어 있다."
  },
  "story_stone": {
   "n": "사연 있는 돌",
   "r": 3,
   "kind": "귀한 것",
   "region": "dolneomeo",
   "d": "아빠가 성황당에 올리려다 두고 간 돌. 소원이 적혀 있다. 돌 골렘을 달래는 선물이 된다."
  },
  "gudeuldol": {
   "n": "구들돌",
   "r": 1,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "돌 골렘의 다리를 이루던 넓적한 구들돌. 불기운을 오래 품는다. 품이 중품이라 흔한 물건 교환의 값으로 쓴다."
  },
  "chadol": {
   "n": "차돌",
   "r": 2,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "돌 골렘의 팔에서 떨어진 흰 차돌. 부딪치면 불꽃이 튈 만큼 단단하다. 품이 상품이라 흔한 물건 교환의 값으로 쓴다."
  },
  "okdol": {
   "n": "옥돌",
   "r": 3,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "돌 골렘의 가슴 속에 있던 푸른 옥돌. 눈 속에서도 은은하게 빛난다. 큰 장터의 소금장수 짠돌이 값을 후하게 쳐 준다."
  },
  "solbang": {
   "n": "솔방울",
   "r": 0,
   "kind": "재료",
   "region": "jangteo",
   "d": "송진 냄새가 나는 솔방울. 불쏘시개로 그만이다."
  },
  "ssal": {
   "n": "쌀",
   "r": 0,
   "kind": "재료",
   "region": "jangteo",
   "d": "엿을 고고 남은 쌀. 설 대목이라 장터에서 귀하다.",
   "u": "되"
  },
  "ssal_powder": {
   "n": "쌀가루",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "맷돌에 간 쌀가루. 떡의 바탕.",
   "u": "줌"
  },
  "pat": {
   "n": "팥",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "붉은 팥. 설 고사떡에 꼭 들어간다.",
   "u": "되"
  },
  "patsirutteok": {
   "n": "팥시루떡",
   "r": 1,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "시루에 찐 붉은 팥떡. 보부상단 설 고사에 올린다.",
   "eat": 1,
   "food": {
    "group": "떡",
    "k": "guard",
    "lv": 1
   }
  },
  "memiltteok": {
   "n": "메밀떡",
   "r": 1,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "거무스름한 메밀떡. 도깨비가 메밀을 좋아한다는 말이 있다.",
   "eat": 1,
   "food": {
    "group": "떡",
    "k": "guard",
    "lv": 1
   }
  },
  "dad_yeot": {
   "n": "아빠가 맡긴 엿",
   "r": 1,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "아빠가 아들에게 주려고 사 두고 끝내 가져가지 못한 가락엿. 엿방울이 맡아 두었다.",
   "eat": 1,
   "food": {
    "group": "엿과 한과",
    "k": "swift",
    "lv": 2,
    "line": "(아빠가 나 주려고 사 둔 엿이다. 한 가락 입에 넣었다. 달다.)"
   }
  },
  "sinpyo": {
   "n": "보부상 신표",
   "r": 2,
   "kind": "귀한 것",
   "region": "jangteo",
   "d": "보부상단이 인정한 보부상에게 주는 패. 이제 정식 보부상이다."
  },
  "dad_memo": {
   "n": "아빠의 메모",
   "r": 2,
   "kind": "귀한 것",
   "region": "jangteo",
   "d": "아빠의 글씨. \"값은 이미 치러졌다. 이번엔 내가 치른다. 북쪽 영산.\""
  },
  "dad_tag": {
   "n": "아빠의 짐표",
   "r": 2,
   "kind": "귀한 것",
   "region": "galchamgol",
   "d": "손바닥만 한 박달나무 패. 뒷면에 집안 낙관 流가 지져져 있다. 앞면은 닳아서 매끈하다."
  },
  "yosul_bottari": {
   "n": "요술보따리",
   "r": 2,
   "kind": "귀한 것",
   "region": "galchamgol",
   "d": "流를 수놓은 낡은 보따리. 무엇을 넣어도 납작하고, 메면 깃털처럼 가볍다. 꺼낼 땐 떠올리기만 하면 된다."
  },
  "broom_sal": {
   "n": "싸리 살",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "눈도깨비가 멧돼지로 둔갑할 때 곤두선 갈기가 되던 싸리비 살.",
   "u": "단"
  },
  "kong": {
   "n": "콩",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "눈도깨비가 곰 발톱으로 긁어 소매 속에 담아 간 콩. 장터에서 훔쳐 온 것이다.",
   "u": "되"
  },
  "jip": {
   "n": "짚",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "눈도깨비가 독수리 깃 속에 둥지처럼 쑤셔 넣었던 짚. 상단 창고 짚단에서 뽑아 간 것이다.",
   "u": "단"
  },
  "dokkaebibul": {
   "n": "도깨비불씨",
   "r": 3,
   "kind": "귀한 것",
   "region": "jangteo",
   "d": "꺼지지 않는 푸른 불씨. 손에 쥐어도 뜨겁지 않다."
  },
  "nundok_horn": {
   "n": "얼음 뿔",
   "r": 3,
   "kind": "재료",
   "region": "jangteo",
   "d": "눈도깨비 이마에서 뒤로 휘어 솟았던 얼음 뿔. 손에 쥐어도 녹지 않고 속에서 푸른 빛이 돈다. 장에 내면 값을 꽤 받는 귀한 재료.",
   "u": "토막"
  },
  "nunhongsi": {
   "n": "눈홍시",
   "r": 3,
   "kind": "귀한 것",
   "region": "jangteo",
   "d": "처마 밑에서 눈을 맞으며 얼었다 녹기를 거듭한 홍시. 설 제사상의 으뜸."
  },
  "hongsi_tteok": {
   "n": "홍시 약떡",
   "r": 3,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "엄마가 동네에 떡을 돌리던 시루로 이번엔 엄마를 위해 찐 떡. 까치 편에 집으로 보낸다."
  },
  "darae_vine": {
   "n": "다래 덩굴",
   "r": 0,
   "kind": "재료",
   "region": "yeongsan",
   "d": "질기고 잘 휘는 덩굴. 테를 짜기 좋다.",
   "u": "가닥"
  },
  "magamok": {
   "n": "마가목 열매",
   "r": 1,
   "kind": "재료",
   "region": "yeongsan",
   "d": "눈 속에서도 빨갛게 매달린 작은 열매. 산짐승의 겨울 양식.",
   "u": "송이"
  },
  "seolpi": {
   "n": "설피",
   "r": 2,
   "kind": "도구",
   "region": "yeongsan",
   "d": "짚신 밑에 대는 둥근 눈신. 깊은 눈길에도 빠지지 않는다."
  },
  "fur_tosi": {
   "n": "털토시",
   "r": 2,
   "kind": "도구",
   "region": "yeongsan",
   "d": "날쌘이 말없이 얹어 준 토시. 손이 시리지 않다."
  },
  "frost_whisker": {
   "n": "붉은 천 조각",
   "r": 2,
   "kind": "재료",
   "region": "yeongsan",
   "d": "어둑차사의 적패지에서 찢겨 나온 붉은 무명. 붓 자국이 빼곡한데 한 글자도 읽히지 않는다.",
   "u": "조각"
  },
  "ice_scale": {
   "n": "언 까마귀 깃",
   "r": 1,
   "kind": "재료",
   "region": "yeongsan",
   "d": "어둑차사의 소매에서 뜯긴 까마귀 깃. 얼음이 덮여 볕에 두어도 녹지 않는다.",
   "u": "개"
  },
  "icicle": {
   "n": "고드름 조각",
   "r": 1,
   "kind": "재료",
   "region": "yeongsan",
   "d": "어둑차사의 도포 자락 끝에 얼어붙어 있던 고드름. 먹물 빛이 비친다.",
   "u": "조각"
  },
  "broken_orb": {
   "n": "검은 갓",
   "r": 3,
   "kind": "귀한 것",
   "region": "yeongsan",
   "d": "어둑차사가 쓰고 있던 넓은 검은 갓. 안쪽이 텅 비어 있고, 들면 겨울밤처럼 차다."
  },
  "dad_ledger": {
   "n": "아빠의 장부 한 장",
   "r": 3,
   "kind": "귀한 것",
   "region": "yeongsan",
   "d": "두루미의 셈책에서 뜯은 한 장. 지난가을 두루미가 아빠에게 건넸다. 엄마의 글씨: \"제 둔갑과 말을 드립니다. 아이의 숨을 주세요.\""
  },
  "legend_fruit": {
   "n": "전설의 열매",
   "r": 4,
   "kind": "귀한 것",
   "region": "yeongsan",
   "d": "입으로만 전해지는 열매. 소문으로는 부를 준다지만 실은 잃어버린 것을 돌려준다."
  },
  "doerim_yak": {
   "n": "되찾음 약",
   "r": 4,
   "kind": "귀한 것",
   "region": "yeongsan",
   "d": "아빠와 함께 엄마의 절구로 찧은 약. 엄마의 둔갑과 말을 되찾아 준다."
  },
  "salt": {
   "n": "소금",
   "r": 0,
   "kind": "재료",
   "region": "galchamgol",
   "d": "작은 종지에 담은 굵은 소금. 채집으로는 얻지 못한다.",
   "u": "줌"
  },
  "sesame": {
   "n": "깨",
   "r": 1,
   "kind": "재료",
   "region": "galchamgol",
   "d": "고소한 볶은 깨. 절구에 찧으면 향이 더 난다. 교환으로만 얻는다.",
   "u": "줌"
  },
  "sesame_oil": {
   "n": "참기름",
   "r": 1,
   "kind": "재료",
   "region": "전체",
   "d": "작은 병에 담은 참기름. 묵이나 반죽에 고소한 향을 더한다. 교환으로만 얻는다.",
   "u": "병"
  },
  "mung": {
   "n": "녹두",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "설 장터에서 건너온 녹두. 맷돌에 갈아 반죽을 만든다. 교환으로만 얻는다.",
   "u": "되"
  },
  "honey": {
   "n": "꿀",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "작은 단지에 담은 겨울 꿀. 약과를 빚을 때 쓴다. 채집으로는 얻지 못한다.",
   "u": "단지"
  },
  "jujube": {
   "n": "대추",
   "r": 1,
   "kind": "재료",
   "region": "yeongsan",
   "d": "길손 움막에서 말린 붉은 대추. 맷돌에서 지역 재료와 함께 간다. 교환으로만 얻는다.",
   "u": "알"
  },
  "acorn_jelly": {
   "n": "도토리묵",
   "r": 1,
   "kind": "먹을거리",
   "region": "galchamgol",
   "d": "단풍골 도토리로 빚은 말랑한 묵. 참나무 숲 냄새가 난다.",
   "eat": 1,
   "food": {
    "group": "묵과 찬",
    "k": "strong",
    "lv": 1
   }
  },
  "sesame_salt": {
   "n": "깨소금",
   "r": 1,
   "kind": "재료",
   "region": "galchamgol",
   "d": "소금과 깨를 함께 찧었다. 엄마가 밥상 끝에 놓던 고소한 가루다.",
   "u": "줌"
  },
  "memil_jelly": {
   "n": "메밀묵",
   "r": 1,
   "kind": "먹을거리",
   "region": "dolneomeo",
   "d": "돌너머 메밀의 구수한 맛에 참기름 향을 더한 묵.",
   "eat": 1,
   "food": {
    "group": "묵과 찬",
    "k": "strong",
    "lv": 1
   }
  },
  "mung_batter": {
   "n": "녹두 빈대떡 반죽",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "설 장터 녹두를 곱게 갈아 기름을 섞은 반죽. 모락이 부쳐 먹는 맛을 안다."
  },
  "yakgwa": {
   "n": "약과",
   "r": 1,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "꿀을 넣어 빚고 시루에 익힌 집안식 약과. 설 장터의 달콤한 냄새가 난다.",
   "eat": 1,
   "food": {
    "group": "엿과 한과",
    "k": "swift",
    "lv": 2
   }
  },
  "rainbow_tteok": {
   "n": "무지개떡",
   "r": 1,
   "kind": "먹을거리",
   "region": "yeongsan",
   "d": "단풍골 가루와 장터 팥, 영산 열매를 포갠 떡. 지나온 세 계절이 한 조각에 들었다.",
   "eat": 1,
   "food": {
    "group": "떡",
    "k": "guard",
    "lv": 2
   }
  },
  "magamok_tea": {
   "n": "마가목차",
   "r": 1,
   "kind": "먹을거리",
   "region": "yeongsan",
   "d": "영산의 빨간 열매에 말린 대추를 더한 차. 손에 쥐면 온기가 돈다.",
   "food": {
    "group": "차와 환",
    "k": "eye",
    "lv": 1
   }
  },
  "ssanghwa": {
   "n": "쌍화 약재",
   "r": 1,
   "kind": "재료",
   "region": "yeongsan",
   "d": "남쪽 칡뿌리와 겨울 산의 겨우살이, 대추를 함께 갈았다. 건네기 좋은 향긋한 약재다."
  },
  "ongdal_gourd": {
   "n": "옹달샘 표주박",
   "r": 3,
   "kind": "귀한 것",
   "region": "yeongsan",
   "d": "봄에 풀린 옹달샘 첫물이 담긴 낡은 표주박. 끈은 엄마가 가르쳐 준 보따리 매듭으로 묶여 있다."
  },
  "songi": {
   "n": "송이버섯",
   "r": 3,
   "kind": "재료",
   "region": "galchamgol",
   "d": "솔잎 밑 흙에서 드물게 올라오는 가을 송이. 향이 진해 약재상도 반긴다.",
   "u": "송이"
  },
  "eoksae_som": {
   "n": "억새꽃 솜",
   "r": 1,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "억새 이삭에서 털어 낸 하얀 솜. 둥지에 깔면 바람이 덜 든다.",
   "u": "줌"
  },
  "seokcheong": {
   "n": "석청",
   "r": 3,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "절벽 바위틈에 벌이 모아 둔 꿀. 석이 따는 자리에서 드물게 만난다."
  },
  "bingeo": {
   "n": "빙어",
   "r": 0,
   "kind": "먹을거리",
   "region": "yeongsan",
   "d": "얼음 구멍에서 낚은 작고 맑은 물고기. 눈에 묻어 두면 오래 간다.",
   "u": "마리",
   "eat": 1,
   "food": {
    "group": "묵과 찬",
    "k": "strong",
    "lv": 1
   }
  },
  "memil_jeon": {
   "n": "메밀전",
   "r": 1,
   "kind": "먹을거리",
   "region": "dolneomeo",
   "d": "들쥐 아주머니가 부친 메밀전. 식어도 고소하다.",
   "u": "장",
   "eat": 1,
   "food": {
    "group": "묵과 찬",
    "k": "strong",
    "lv": 1
   }
  },
  "gongi": {
   "n": "공깃돌",
   "r": 0,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "돌쇠 할배가 돌 깎다 남은 조각으로 다듬은 공깃돌 다섯 알. 손에 쥐면 매끈하다."
  },
  "gopdol_jan": {
   "n": "곱돌 잔",
   "r": 1,
   "kind": "귀한 것",
   "region": "dolneomeo",
   "d": "돌쇠 할배가 곱돌로 깎은 작은 잔. 따뜻한 것을 오래 따뜻하게 둔다."
  },
  "jat": {
   "n": "잣",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "청설모가 솔가지 사이에 숨겨 둔 잣. 떡 고명으로 귀하게 쓴다.",
   "u": "줌"
  },
  "yugwa": {
   "n": "유과",
   "r": 0,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "얼레네 한과 좌판의 유과. 바삭하고 고물이 잔뜩 묻었다. 먹으면 기운이 조금 난다.",
   "eat": 1,
   "food": {
    "group": "엿과 한과",
    "k": "swift",
    "lv": 1
   }
  },
  "gangjeong": {
   "n": "깨강정",
   "r": 0,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "얼레 할머니가 설에 싸 보낸 깨강정. 깨가 촘촘히 엉겨 있다. 먹으면 기운이 조금 난다.",
   "eat": 1,
   "food": {
    "group": "엿과 한과",
    "k": "swift",
    "lv": 1
   }
  },
  "gotgam": {
   "n": "곶감",
   "r": 0,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "등불을 보고 숙소를 찾은 길손이 까치 편에 남기고 간 곶감. 쫀득하고 달다. 먹으면 기운이 조금 난다.",
   "eat": 1,
   "food": {
    "group": "청과 곶감",
    "k": "kind",
    "lv": 1
   }
  },
  "gunbam": {
   "n": "군밤",
   "r": 0,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "막차 손님이 짐삯으로 준 군밤. 품에 넣으면 한동안 따뜻하다. 먹으면 기운이 조금 난다.",
   "eat": 1,
   "food": {
    "group": "떡",
    "k": "guard",
    "lv": 1
   }
  },
  "injeolmi": {
   "n": "인절미",
   "r": 0,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "모락이 엿방울 몫으로 싼 콩고물 인절미. 받을 사람이 안 받아 심부름한 몫이 됐다. 먹으면 기운이 조금 난다.",
   "u": "덩이",
   "eat": 1,
   "food": {
    "group": "떡",
    "k": "guard",
    "lv": 1
   }
  },
  "garaetteok": {
   "n": "가래떡",
   "r": 0,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "짠돌의 소금으로 간을 맞춰 처음 뽑은 가래떡. 설날 떡국 거리다. 먹으면 기운이 조금 난다.",
   "u": "가락",
   "eat": 1,
   "food": {
    "group": "떡",
    "k": "guard",
    "lv": 1
   }
  },
  "hobakyeot": {
   "n": "호박엿",
   "r": 0,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "엿방울이 되찾은 제 가위로 툭툭 끊어 준 호박엿. 이에 쩍 달라붙는다. 먹으면 기운이 조금 난다.",
   "eat": 1,
   "food": {
    "group": "엿과 한과",
    "k": "swift",
    "lv": 1
   }
  },
  "gyeol_hwan": {
   "n": "결명자 환",
   "r": 2,
   "kind": "먹을거리",
   "region": "dolneomeo",
   "d": "볶은 결명자를 꿀에 개어 콩알만 하게 빚었다. 하나씩 먹으면 눈이 맑아진다.",
   "u": "알",
   "food": {
    "group": "차와 환",
    "k": "eye",
    "lv": 2
   }
  },
  "kkot_cheong": {
   "n": "칡꽃청",
   "r": 2,
   "kind": "먹을거리",
   "region": "galchamgol",
   "d": "칡꽃을 찧어 꿀에 재웠다. 한 숟갈 떠 먹으면 목이 시원하다.",
   "u": "병",
   "food": {
    "group": "청과 곶감",
    "k": "kind",
    "lv": 2
   }
  },
  "solbang_cheong": {
   "n": "솔방울청",
   "r": 2,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "푸른 솔방울을 찧어 석청에 재웠다. 기침 날 때 한 숟갈.",
   "u": "병",
   "food": {
    "group": "청과 곶감",
    "k": "kind",
    "lv": 2
   }
  },
  "sirumit": {
   "n": "시룻밑",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "싸리 살에 짚을 두드려 엮은 시루 바닥 깔개. 김이 고르게 오른다.",
   "u": "장"
  },
  "heuk_banjuk": {
   "n": "흙반죽",
   "r": 1,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "진흙에 돌가루와 썬 억새를 넣고 찧었다. 돌담 틈을 메우면 겨울을 난다.",
   "u": "덩이"
  },
  "jjimjil_dol": {
   "n": "찜질 돌",
   "r": 1,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "숯불 김에 데운 구들돌을 억새꽃 솜에 쌌다. 쑤시는 데 대면 오래 따뜻하다."
  },
  "dol_mulgam": {
   "n": "돌 물감",
   "r": 1,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "이끼 낀 돌을 갈아 기름에 갰다. 칠하면 오래 바래지 않는 푸른 먹빛이다.",
   "u": "종지"
  },
  "okgaru": {
   "n": "옥가루",
   "r": 2,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "옥돌을 곱게 갈았다. 손등에 바르면 뽀얗게 빛난다.",
   "u": "줌"
  },
  "dubu": {
   "n": "두부",
   "r": 1,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "콩을 갈아 끓이고 소금 간수로 앉혔다. 말랑하고 고소하다.",
   "u": "모",
   "eat": 1,
   "food": {
    "group": "묵과 찬",
    "k": "strong",
    "lv": 2
   }
  },
  "jatjuk": {
   "n": "잣죽",
   "r": 1,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "쌀과 잣을 함께 곱게 갈아 쑨 죽. 앓던 사람도 넘기기 쉽다.",
   "u": "그릇",
   "eat": 3,
   "food": {
    "group": "끼니"
   }
  },
  "songibap": {
   "n": "송이밥",
   "r": 2,
   "kind": "먹을거리",
   "region": "galchamgol",
   "d": "쌀에 송이를 찢어 얹고 시루에 쪘다. 김만 맡아도 배가 부르다.",
   "u": "그릇",
   "eat": 3,
   "food": {
    "group": "끼니",
    "k": "guard",
    "lv": 1
   }
  },
  "beoseot_jjim": {
   "n": "버섯찜",
   "r": 2,
   "kind": "먹을거리",
   "region": "galchamgol",
   "d": "싸리버섯과 꾀꼬리버섯에 깨소금을 쳐서 쪘다. 숯 굽는 날 저녁 같은 맛.",
   "u": "그릇",
   "eat": 1,
   "food": {
    "group": "묵과 찬",
    "k": "strong",
    "lv": 2
   }
  },
  "seogibyeong": {
   "n": "석이병",
   "r": 2,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "석이를 곱게 다져 쌀가루에 섞어 찐 떡. 잔칫상에나 오르던 거무스름한 떡이다.",
   "u": "조각",
   "eat": 1,
   "food": {
    "group": "떡",
    "k": "guard",
    "lv": 2
   }
  },
  "yaksik": {
   "n": "약식",
   "r": 1,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "쌀에 밤과 대추를 넣어 시루에 쪘다. 정월에 먹는 달큰한 밥.",
   "u": "덩이",
   "eat": 2,
   "food": {
    "group": "끼니",
    "k": "guard",
    "lv": 1
   }
  },
  "chik_sil": {
   "n": "칡 실",
   "r": 1,
   "kind": "재료",
   "region": "galchamgol",
   "d": "칡 줄기를 쪄서 껍질을 벗겨 뽑은 실. 연장 자루에 감으면 손에 안 미끄러진다.",
   "u": "타래"
  },
  "darae_cha": {
   "n": "다래 줄기차",
   "r": 1,
   "kind": "먹을거리",
   "region": "yeongsan",
   "d": "다래 덩굴을 찧어 대추와 달였다. 속이 풀리는 산사람 차.",
   "u": "잔",
   "food": {
    "group": "차와 환",
    "k": "eye",
    "lv": 1
   }
  },
  "hwachae": {
   "n": "마가목 화채",
   "r": 1,
   "kind": "먹을거리",
   "region": "yeongsan",
   "d": "고드름을 깨 넣고 마가목 열매를 으깨 띄웠다. 이가 시리게 새콤하다.",
   "u": "그릇",
   "food": {
    "group": "차와 환",
    "k": "eye",
    "lv": 1
   }
  },
  "bigeul_garu": {
   "n": "서리 깃 가루",
   "r": 1,
   "kind": "재료",
   "region": "yeongsan",
   "d": "언 까마귀 깃과 고드름 조각을 함께 갈았다. 가루가 손끝에서 서늘하다. 열 내리는 데 좋을 것 같다.",
   "u": "줌"
  },
  "meju": {
   "n": "메주",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "삶은 콩을 찧어 덩이로 빚고 짚으로 묶었다. 매달아 띄우면 장맛이 된다.",
   "u": "덩이"
  },
  "nurungji": {
   "n": "누룽지",
   "r": 0,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "장국밥 가마솥 바닥에서 긁어 말린 누룽지. 고소하고 바삭하다. 먹으면 기운이 조금 난다.",
   "u": "조각",
   "eat": 1,
   "food": {
    "group": "끼니"
   }
  },
  "magpie_feather": {
   "n": "까치 어르신의 깃",
   "r": 3,
   "kind": "귀한 것",
   "region": "yeongsan",
   "d": "늙은 까치가 마지막 남쪽 길에 앞서 뽑아 준 꽁지깃. 누가 부를 때 쥐면 어르신이 \"아가\" 하던 소리가 귓가에 난다. 어둑차사 앞에서 전투마다 한 번, 돌아본 이름을 지켜 준다 (결정 D-1074).",
   "u": "개"
  },
  "jipsin": {
   "n": "짚신",
   "r": 1,
   "kind": "재료",
   "region": "yeongsan",
   "d": "넋이 빠진 할아버지가 손버릇처럼 삼은 짚신 한 켤레. 먼 길 떠나는 이가 신으라고 초상집 문간에 놓던 그 신이다.",
   "u": "켤레"
  }
 },
 "BOSS_PARTS": {
  "kudzu": [
   {
    "id": "arm",
    "name": "칡줄기",
    "hp": 3,
    "mat": "vine",
    "tool": "sickle"
   },
   {
    "id": "root",
    "name": "칡뿌리",
    "hp": 3,
    "mat": "root",
    "tool": "pick"
   },
   {
    "id": "core",
    "name": "칡꽃",
    "hp": 4,
    "mat": "kflower",
    "core": true,
    "tool": "sickle"
   }
  ],
  "musoe": [
   {
    "id": "fist",
    "name": "꿀밤",
    "hp": 3
   }
  ],
  "golem": [
   {
    "id": "leg",
    "name": "다리",
    "hp": 3,
    "mat": "mud",
    "tool": "pick"
   },
   {
    "id": "arm",
    "name": "팔",
    "hp": 3,
    "mat": "stonedust",
    "tool": "pick"
   },
   {
    "id": "head",
    "name": "몸",
    "hp": 4,
    "mat": "mossy_eye",
    "core": true,
    "tool": "pick"
   }
  ],
  "dokkaebi": [
   {
    "id": "eagle",
    "name": "독수리",
    "hp": 3,
    "mat": "jip",
    "tool": "sickle"
   },
   {
    "id": "bear",
    "name": "곰",
    "hp": 3,
    "mat": "kong",
    "tool": "pick"
   },
   {
    "id": "boar",
    "name": "멧돼지",
    "hp": 3,
    "mat": "broom_sal",
    "tool": "sickle"
   },
   {
    "id": "core",
    "name": "심장",
    "hp": 4,
    "mat": "dokkaebibul",
    "core": true,
    "tool": "pick"
   }
  ],
  "gangcheol": [
   {
    "id": "mouth",
    "name": "적패지",
    "hp": 3,
    "mat": "frost_whisker",
    "tool": "sickle"
   },
   {
    "id": "body",
    "name": "소매",
    "hp": 4,
    "mat": "ice_scale",
    "tool": "sickle"
   },
   {
    "id": "tail",
    "name": "도포 자락",
    "hp": 3,
    "mat": "icicle",
    "tool": "pick"
   },
   {
    "id": "core",
    "name": "갓",
    "hp": 5,
    "mat": "broken_orb",
    "core": true,
    "tool": "pick"
   }
  ]
 },
 "CALM": {
  "kudzu": {
   "ssari": 50,
   "kkoe": 50
  },
  "musoe": {
   "rice": 50,
   "powder": 35
  },
  "golem": {
   "story_stone": 100,
   "seogi": 40
  },
  "gangcheol": {
   "jipsin": 100,
   "rice": 50
  },
  "dokkaebi": {
   "memiltteok": 100,
   "dad_yeot": 100
  }
 },
 "RECIPES": {
  "jeolgu": [
   {
    "need": {
     "acorn": 3
    },
    "out": "powder",
    "n": 1
   },
   {
    "need": {
     "powder": 1,
     "salt": 1
    },
    "out": "acorn_jelly",
    "n": 1,
    "optional": true
   },
   {
    "need": {
     "sesame": 1,
     "salt": 1
    },
    "out": "sesame_salt",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:sesame_salt"
   },
   {
    "need": {
     "sesame": 1,
     "honey": 1
    },
    "out": "gangjeong",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:gangjeong"
   },
   {
    "need": {
     "gyeolmyeongja": 1,
     "honey": 1
    },
    "out": "gyeol_hwan",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:gyeol_hwan"
   },
   {
    "need": {
     "kflower": 1,
     "honey": 1
    },
    "out": "kkot_cheong",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:kkot_cheong"
   },
   {
    "need": {
     "solbang": 2,
     "seokcheong": 1
    },
    "out": "solbang_cheong",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:solbang_cheong"
   },
   {
    "need": {
     "broom_sal": 1,
     "jip": 1
    },
    "out": "sirumit",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:sirumit"
   },
   {
    "need": {
     "mud": 1,
     "stonedust": 1,
     "eoksae": 1
    },
    "out": "heuk_banjuk",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:heuk_banjuk"
   },
   {
    "need": {
     "chadol": 2
    },
    "out": "gongi",
    "n": 5,
    "optional": true,
    "hidden": true,
    "discover": "recipe:gongi"
   },
   {
    "need": {
     "darae_vine": 1,
     "jujube": 1
    },
    "out": "darae_cha",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:darae_cha"
   },
   {
    "need": {
     "icicle": 1,
     "magamok": 2
    },
    "out": "hwachae",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:hwachae"
   },
   {
    "need": {
     "kong": 2,
     "jip": 1
    },
    "out": "meju",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:meju"
   }
  ],
  "maetdol": [
   {
    "need": {
     "memil": 3
    },
    "out": "memil_powder",
    "n": 1
   },
   {
    "need": {
     "seoridarae": 1
    },
    "out": "darae_yak",
    "n": 1
   },
   {
    "need": {
     "ssal": 1
    },
    "out": "ssal_powder",
    "n": 1
   },
   {
    "need": {
     "memil_powder": 1,
     "sesame_oil": 1
    },
    "out": "memil_jelly",
    "n": 1,
    "optional": true
   },
   {
    "need": {
     "mung": 1,
     "sesame_oil": 1
    },
    "out": "mung_batter",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:mung_batter"
   },
   {
    "need": {
     "magamok": 1,
     "jujube": 1
    },
    "out": "magamok_tea",
    "n": 1,
    "optional": true
   },
   {
    "need": {
     "root": 1,
     "gyeousari": 1,
     "jujube": 1
    },
    "out": "ssanghwa",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:ssanghwa"
   },
   {
    "need": {
     "mossy_eye": 1,
     "sesame_oil": 1
    },
    "out": "dol_mulgam",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:dol_mulgam"
   },
   {
    "need": {
     "okdol": 1
    },
    "out": "okgaru",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:okgaru"
   },
   {
    "need": {
     "kong": 2,
     "salt": 1
    },
    "out": "dubu",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:dubu"
   },
   {
    "need": {
     "ssal": 1,
     "jat": 1
    },
    "out": "jatjuk",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:jatjuk"
   },
   {
    "need": {
     "ice_scale": 1,
     "icicle": 1
    },
    "out": "bigeul_garu",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:bigeul_garu"
   }
  ],
  "siru": [
   {
    "need": {
     "ssal_powder": 2,
     "pat": 1
    },
    "out": "patsirutteok",
    "n": 1
   },
   {
    "need": {
     "memil_powder": 2
    },
    "out": "memiltteok",
    "n": 1
   },
   {
    "need": {
     "ssal_powder": 1,
     "honey": 1
    },
    "out": "yakgwa",
    "n": 1,
    "optional": true
   },
   {
    "need": {
     "powder": 1,
     "pat": 1,
     "magamok": 1
    },
    "out": "rainbow_tteok",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:rainbow_tteok"
   },
   {
    "need": {
     "ssal": 2,
     "songi": 1
    },
    "out": "songibap",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:songibap"
   },
   {
    "need": {
     "ssari": 1,
     "kkoe": 1,
     "sesame_salt": 1
    },
    "out": "beoseot_jjim",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:beoseot_jjim"
   },
   {
    "need": {
     "ssal_powder": 1,
     "seogi": 1
    },
    "out": "seogibyeong",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:seogibyeong"
   },
   {
    "need": {
     "ssal": 1,
     "bam": 1,
     "jujube": 1
    },
    "out": "yaksik",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:yaksik"
   },
   {
    "need": {
     "vine": 2
    },
    "out": "chik_sil",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:chik_sil"
   },
   {
    "need": {
     "gudeuldol": 1,
     "coal": 1,
     "eoksae_som": 1
    },
    "out": "jjimjil_dol",
    "n": 1,
    "optional": true,
    "hidden": true,
    "discover": "recipe:jjimjil_dol"
   }
  ]
 },
 "CRAFT": {
  "jeolgu": {
   "habit": "엄마는 세 번 찧고 한 번 쉬었다. 엄마가 잊어도 내 손은 기억할 거다.",
   "habitKey": "habit:jeolgu",
   "fail": "절구가 헛돌았다. 엄마도 이 조합은 안 찧었겠지. 재료는 그대로 챙겼다."
  },
  "maetdol": {
   "habit": "증조할아버지는 맷돌을 꼭 왼쪽으로 돌렸단다. 자개 발자국을 따라 손을 돌렸다.",
   "habitKey": "habit:maetdol",
   "fail": "맷돌이 꿈쩍도 안 한다. 증조할아버지도 이건 안 갈았겠지. 재료는 그대로 챙겼다."
  },
  "siru": {
   "habit": "잔칫날이면 엄마는 김이 오를 때 뚜껑을 톡 두드렸다. 나도 같은 소리를 냈다.",
   "habitKey": "habit:siru",
   "fail": "시루에서 김만 새어 나왔다. 잔칫날에도 이런 떡은 없었지. 재료는 그대로 챙겼다."
  }
 },
 "TASTES": {
  "dodam": {
   "acorn_jelly": {
    "kind": "아주 좋아함",
    "line": "도토리가 이렇게 말랑해졌네! 한 입만 더!",
    "effect": "none"
   },
   "sesame_salt": {
    "kind": "좋아함",
    "line": "고소해! 도토리랑 같이 숨겨 둬야지.",
    "effect": "none"
   },
   "kkot_cheong": {
    "kind": "아주 좋아함",
    "line": "칡꽃청! 달다! 한 숟갈만 더!",
    "effect": "none"
   }
  },
  "nal": {
   "yakgwa": {
    "kind": "좋아함",
    "line": "제법 빚었네. 팔 건 아니고, 내가 먹으려고.",
    "effect": "none"
   },
   "sesame_salt": {
    "kind": "아주 좋아함",
    "line": "흥, 길에서 밥 먹을 때 딱이겠네.",
    "effect": "none"
   },
   "chik_sil": {
    "kind": "좋아함",
    "line": "칡 실이네. 바구니 테 감기 좋겠어. …덤은 없다.",
    "effect": "none"
   }
  },
  "musoe": {
   "rice": {
    "kind": "좋아함",
    "line": "…마침 출출하던 참이다.",
    "effect": "none"
   },
   "acorn_jelly": {
    "kind": "아주 좋아함",
    "line": "…손 많이 갔겠네. 잠깐 앉아라.",
    "effect": "none"
   },
   "sesame_salt": {
    "kind": "좋아함",
    "line": "밥에 얹으면 되겠군. 잘 빻았다.",
    "effect": "none"
   }
  },
  "toad": {
   "magamok_tea": {
    "kind": "아주 좋아함",
    "line": "허허, 찻잔에 산 냄새가 담겼구나.",
    "effect": "none"
   },
   "bigeul_garu": {
    "kind": "아주 좋아함",
    "line": "…서늘하구나. 열 내리는 데 그만이겠다. 약방엔 열 오른 아이가 끊이질 않는단다. 요긴하게 쓰마.",
    "effect": "none"
   },
   "songi": {
    "kind": "좋아함",
    "line": "가을 송이로구나. 향만 맡아도 기운이 나는구나.",
    "effect": "none"
   }
  },
  "stream_otter": {
   "acorn_jelly": {
    "kind": "좋아함",
    "line": "말랑말랑! 물에 넣으면 미끄러질 것 같아.",
    "effect": "none"
   },
   "salt": {
    "kind": "그저 그럼",
    "line": "짜! 개울물 마셔야겠다.",
    "effect": "none"
   },
   "gongi": {
    "kind": "아주 좋아함",
    "line": "공깃돌이다! 다섯 알 맞지? 넓적돌 위에서 하면 안 굴러가겠다. 같이 할래?",
    "effect": "none"
   }
  },
  "charcoal_badger": {
   "rice": {
    "kind": "좋아함",
    "line": "…가마 지키다 보면 끼니를 잊는다. 잘 먹으마.",
    "effect": "none"
   },
   "sesame_salt": {
    "kind": "그저 그럼",
    "line": "고소하군. 숯내에 묻혀 맛은 잘 모르겠다.",
    "effect": "none"
   },
   "gyeol_hwan": {
    "kind": "아주 좋아함",
    "line": "…눈이 시원하다. 이거면 연기 빛도 보겠다.",
    "effect": "none"
   }
  },
  "dolsoe": {
   "memil_jelly": {
    "kind": "아주 좋아함",
    "line": "매끈하구나. 잘 갈았어.",
    "effect": "none"
   },
   "sesame_salt": {
    "kind": "좋아함",
    "line": "손끝에도 고소한 냄새가 배겠네.",
    "effect": "none"
   },
   "seokcheong": {
    "kind": "좋아함",
    "line": "…석청이구나. 바위틈에서 땄냐. 귀한 걸 손에 쥐었구나.",
    "effect": "none"
   }
  },
  "ppuri": {
   "memil_jelly": {
    "kind": "아주 좋아함",
    "line": "메밀 향이 곧군. 정성을 받겠다.",
    "effect": "none"
   },
   "yakgwa": {
    "kind": "그저 그럼",
    "line": "정갈하게 빚었군. 마음은 받겠다.",
    "effect": "none"
   },
   "dol_mulgam": {
    "kind": "아주 좋아함",
    "line": "이 빛이다. 아버지가 장승 눈에 올리던 빛.",
    "effect": "none"
   }
  },
  "kkubeogi": {
   "acorn_jelly": {
    "kind": "아주 좋아함",
    "line": "말랑해서… 졸면서도 먹겠어…",
    "effect": "none"
   },
   "memil_jelly": {
    "kind": "좋아함",
    "line": "이건… 숨겨 두고… 천천히…",
    "effect": "none"
   },
   "eoksae_som": {
    "kind": "좋아함",
    "line": "포근해… 이거 깔면… 겨울 내내 안 춥겠다…",
    "effect": "none"
   }
  },
  "yeotbang": {
   "yakgwa": {
    "kind": "아주 좋아함",
    "line": "어이쿠, 내 엿도 긴장하겠는걸!",
    "effect": "none"
   },
   "ssanghwa": {
    "kind": "싫어함",
    "line": "에구, 쓴 건 사양! 네가 잘 챙겨 둬.",
    "effect": "none"
   },
   "okgaru": {
    "kind": "좋아함",
    "line": "옥가루? 분 바르면 장날에 손님 몰리겠는걸~",
    "effect": "none"
   }
  },
  "morak": {
   "mung_batter": {
    "kind": "아주 좋아함",
    "line": "잘 갈았네! 넓게 한 장 부쳐야겠다!",
    "effect": "none"
   },
   "rainbow_tteok": {
    "kind": "좋아함",
    "line": "허허, 떡 한 조각에 온 길이 다 들었네!",
    "effect": "none"
   },
   "jat": {
    "kind": "좋아함",
    "line": "잣이네! 떡 고명으로 딱이야. 고마워!",
    "effect": "none"
   }
  },
  "bueong": {
   "rainbow_tteok": {
    "kind": "아주 좋아함",
    "line": "층을 흐트러뜨리지 않았군. 솜씨가 좋다.",
    "effect": "none"
   },
   "yakgwa": {
    "kind": "좋아함",
    "line": "장부는 덮고 먹어야겠군. 손에 묻겠다.",
    "effect": "none"
   },
   "jatjuk": {
    "kind": "아주 좋아함",
    "line": "…잣죽이로구나. 늙은이 속을 아는구나.",
    "effect": "none"
   }
  },
  "salgeumi": {
   "magamok_tea": {
    "kind": "아주 좋아함",
    "line": "따, 따뜻해… 여기서 같이 마셔도 돼?",
    "effect": "none"
   },
   "sesame_salt": {
    "kind": "그저 그럼",
    "line": "고소한 냄새네… 마음은 고마워.",
    "effect": "none"
   },
   "hwachae": {
    "kind": "좋아함",
    "line": "시, 시원해… 이가 시려…",
    "effect": "none"
   }
  },
  "dad": {
   "acorn_jelly": {
    "kind": "아주 좋아함",
    "line": "(묵을 한 입 먹고, 내 손을 꼭 잡는다.)",
    "effect": "none"
   },
   "rainbow_tteok": {
    "kind": "아주 좋아함",
    "line": "(떡의 층을 짚다가, 내 어깨를 감싼다.)",
    "effect": "none"
   },
   "ssanghwa": {
    "kind": "좋아함",
    "line": "(향을 맡고 고개를 끄덕인다. 내 손을 덮는다.)",
    "effect": "none"
   }
  },
  "durumi": {
   "bingeo": {
    "kind": "아주 좋아함",
    "line": "…빙어로구나. 고개를 못 돌리니 물고기 볼 틈이 없었다. 고맙다.",
    "effect": "none"
   },
   "kong": {
    "kind": "좋아함",
    "line": "낟알이로구나. 남쪽 논에서 겨울 날 적엔 이걸 주워 먹었지.",
    "effect": "none"
   },
   "frost_whisker": {
    "kind": "좋아함",
    "line": "…적패지 조각이구나. 내가 지키지 못한 이름들이 적혔던 천이다. 금줄에 매어 두마. 잊지 않게.",
    "effect": "none"
   }
  },
  "kudzu": {
   "acorn_jelly": {
    "kind": "좋아함",
    "line": "도토리 향에 덩굴이 느슨해진다.",
    "effect": "calm:50"
   },
   "powder": {
    "kind": "좋아함",
    "line": "곱게 빻은 도토리 냄새에 덩굴 끝이 고개를 든다.",
    "effect": "calm:35"
   }
  },
  "golem": {
   "memil_jelly": {
    "kind": "좋아함",
    "line": "메밀 향을 맡은 돌무더기가 천천히 내려앉는다.",
    "effect": "calm:40"
   },
   "sesame_salt": {
    "kind": "그저 그럼",
    "line": "돌무더기가 고소한 향을 잠깐 맡는다.",
    "effect": "none"
   }
  },
  "dokkaebi": {
   "mung_batter": {
    "kind": "아주 좋아함",
    "line": "메밀도 좋지만 녹두도 좋지! 얼른 부치자!",
    "effect": "calm:60"
   },
   "yakgwa": {
    "kind": "좋아함",
    "line": "약과다! 꿀 바른 거! 이건 내 몫이지?",
    "effect": "calm:60"
   }
  },
  "gangcheol": {
   "jujube": {
    "kind": "그저 그럼",
    "line": "대추 단내에도 갓 아래 어둠은 꿈쩍하지 않는다.",
    "effect": "none"
   },
   "yakgwa": {
    "kind": "그저 그럼",
    "line": "약과를 내밀어도 길고 흰 손이 받지 않는다.",
    "effect": "none"
   },
   "jipsin": {
    "kind": "아주 좋아함",
    "line": "짚신 한 켤레를 갓 아래 어둠 앞에 놓았다. 길고 흰 손이 오래도록 신을 쓰다듬는다.",
    "effect": "calm:100"
   },
   "rice": {
    "kind": "좋아함",
    "line": "주먹밥을 놓았다. 고개를 숙이듯 갓이 기울고, 붉은 천이 잠잠해진다.",
    "effect": "calm:50"
   }
  },
  "jjandol": {
   "rice": {
    "kind": "좋아함",
    "line": "…짜게 먹는 놈한텐 맨밥이 제일이지.",
    "effect": "none"
   },
   "salt": {
    "kind": "그저 그럼",
    "line": "소금장수한테 소금을 주냐?",
    "effect": "none"
   },
   "okdol": {
    "kind": "좋아함",
    "line": "…옥돌이잖아. 이거면 소금 한 섬은 쳐 주지.",
    "effect": "none"
   }
  },
  "deungjan": {
   "rice": {
    "kind": "좋아함",
    "line": "쌀 한 톨이 밤새 힘이다!",
    "effect": "none"
   },
   "sesame_oil": {
    "kind": "아주 좋아함",
    "line": "고소한 등잔! 이걸로 밤새 비추지.",
    "effect": "none"
   },
   "yaksik": {
    "kind": "좋아함",
    "line": "약식이네. 짐 나르다 먹으면 힘 나겠다.",
    "effect": "none"
   }
  },
  "ongdal": {
   "jujube": {
    "kind": "좋아함",
    "line": "대추구먼. 솥에 넣으면 물이 달아지지.",
    "effect": "none"
   },
   "magamok_tea": {
    "kind": "아주 좋아함",
    "line": "…끓인 걸 받아 보는 건 몇 해 만이여.",
    "effect": "none"
   },
   "jjimjil_dol": {
    "kind": "아주 좋아함",
    "line": "뜨끈하구먼. 언 무릎엔 이게 최고여.",
    "effect": "none"
   }
  },
  "dol_badger": {
   "memil_jelly": {
    "kind": "아주 좋아함",
    "line": "내 메밀로 쑨 거냐? 묵이 탱글하구나.",
    "effect": "none"
   },
   "gyeolmyeongja": {
    "kind": "그저 그럼",
    "line": "내 눈은 멀쩡하다. 돌쇠 할배나 드려라.",
    "effect": "none"
   },
   "sirumit": {
    "kind": "아주 좋아함",
    "line": "시룻밑이구나. 메밀떡 찔 때 요긴하겠다.",
    "effect": "none"
   }
  },
  "dol_turtle": {
   "memil": {
    "kind": "좋아함",
    "line": "메밀 알은 천천히 씹어도 달구나.",
    "effect": "none"
   },
   "stonedust": {
    "kind": "그저 그럼",
    "line": "돌가루는… 내 등딱지에도 잔뜩 붙어 있다.",
    "effect": "none"
   },
   "heuk_banjuk": {
    "kind": "좋아함",
    "line": "샘 둑 틈을 메우면 되겠구나. 고맙다, 아가.",
    "effect": "none"
   }
  },
  "haengsu": {
   "yakgwa": {
    "kind": "좋아함",
    "line": "약과라. 장꾼 셈엔 단 게 약이지.",
    "effect": "none"
   },
   "salt": {
    "kind": "그저 그럼",
    "line": "소금이야 상단 짐에도 넘친다.",
    "effect": "none"
   },
   "songibap": {
    "kind": "좋아함",
    "line": "송이를 이만큼 얹었으면 장터 셈으로도 귀한 밥이다. 잘 먹으마.",
    "effect": "none"
   }
  },
  "jongjong": {
   "gunbam": {
    "kind": "좋아함",
    "line": "군밤! 밤샘엔 이게 최고예요.",
    "effect": "none"
   },
   "injeolmi": {
    "kind": "아주 좋아함",
    "line": "인절미다! 엄마가 해 주던 맛이야.",
    "effect": "none"
   },
   "beoseot_jjim": {
    "kind": "아주 좋아함",
    "line": "따뜻하다… 문 지키는 밤에 이거면 안 졸겠어요.",
    "effect": "none"
   }
  }
 },
 "NOTES": [
  {
   "id": "dodam",
   "region": "galchamgol",
   "kind": "animal",
   "lines": [
    {
     "who": "me",
     "text": "단풍골 숲의 다람쥐. 아빠 모자를 알아봤다. 말이 많아서, 묻지 않은 것까지 말해 준다.",
     "section": "관찰",
     "when": "met:dodam"
    },
    {
     "who": "me",
     "text": "흙에 발톱으로 긁은 줄이 셋 있으면 다람쥐가 무언가 묻고 잊은 자리다. 너구리 코로는 어디 묻었는지 모르겠다. 다람쥐라면 알겠지.",
     "section": "관찰",
     "when": "rule:squirrel_cache"
    }
   ]
  },
  {
   "id": "nal",
   "region": "galchamgol",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "족제비 떠돌이 보부상. 다들 깍쟁이라 하지만 셈은 바르다. 제 물건을 깎아내리면 오기로 덤을 얹는다.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "정말이었다. 촌구석이라고 허세를 부렸더니 숯을 하나 더 줬다.",
     "section": "관찰",
     "when": "nal:bluff-paid"
    },
    {
     "who": "me",
     "text": "아빠의 짐표는 받지 않는다. 남의 짐표 받았다간 장사 끝이라고.",
     "section": "관찰",
     "when": "nal:dadtag"
    },
    {
     "who": "me",
     "text": "값은 물건이 아니라 길이 정한다. 어디서 사서 어디로 가져가느냐. 공짜가 아니니 적어 두라고 했다.",
     "section": "관찰",
     "when": "nal:route-price"
    },
    {
     "who": "me",
     "text": "꺾인 모자 챙을 펴서 도로 씌워 줬다. 보부상은 모자부터 바로 쓴다고. 아빠도 비 오는 날 그렇게 말했다.",
     "section": "관찰",
     "when": "nal:hat"
    },
    {
     "who": "me",
     "text": "돌너머에서는 단풍골 칡꽃을 귀하게 쳤다. 같은 물건도 마을마다 값이 다르다.",
     "section": "관찰",
     "when": "nal:dolneomeo"
    },
    {
     "who": "me",
     "text": "큰 장터에선 돌너머 메밀가루를 팥 두 되로 쳐줬다.",
     "section": "관찰",
     "when": "nal:jangteo-memil"
    },
    {
     "who": "me",
     "text": "아빠와 같은 보부상단이었다고 털어놓았다. 아빠는 날쌘을 끝까지 얕보지 않았다고.",
     "section": "관찰",
     "when": "nal:yeongsan"
    },
    {
     "who": "me",
     "text": "신표를 보더니 털토시를 얹어 줬다. 덤이 아니라 신표 단 보부상끼리 주는 거란다.",
     "section": "관찰",
     "when": "nal:tosi"
    },
    {
     "who": "me",
     "text": "아빠가 나를 알아보거든 갖다주라며 대추 두 알을 묶어 맡겼다. 자기가 줬다고는 하지 말라고.",
     "section": "관찰",
     "when": "nal:jujube_for_dad"
    },
    {
     "who": "me",
     "text": "갚을 게 없으면 뭘 지고 다니냐고 했다. 먼저 내려가 고갯길을 봐 두겠단다.",
     "section": "관찰",
     "when": "nal:no_debt"
    }
   ]
  },
  {
   "id": "musoe",
   "region": "galchamgol",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "동생 무쇠. 이 길에서 다리를 다쳤다. 단풍골에 남아 망치를 잡겠단다. 내가 앞만 본 탓이다.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "삼촌은 말보다 시험이 먼저다. 덤비면 꿀밤으로 연장부터 뺏으니, 피하기만 해야 한다.",
     "section": "관찰",
     "when": "fight:musoe"
    },
    {
     "who": "me",
     "text": "출출할 때 주먹밥을 건네면 어깨가 내려간다.",
     "section": "관찰",
     "when": "like:musoe:rice"
    },
    {
     "who": "me",
     "text": "도토리 가루도 반긴다.",
     "section": "관찰",
     "when": "like:musoe:powder"
    },
    {
     "who": "me",
     "text": "삼촌은 다리를 절어도 망치는 흔들리지 않는다. 쇠가 가장 빨갈 때 세 번 친다.",
     "section": "관찰",
     "when": "musoe:forge"
    },
    {
     "who": "me",
     "text": "삼촌 다리는 비 오기 전에 쑤신다. 할머니가 싸 준 칡뿌리 찜질을 감아 드렸더니 따뜻하다고 했다.",
     "section": "관찰",
     "when": "musoe:leg"
    }
   ]
  },
  {
   "id": "toad",
   "region": "galchamgol",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "두꺼비 약재상. 약은 잘 짓는데, 아는 걸 다 말하지는 않는다.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "엄마를 낫게 하지는 못해도 기운은 붙들 수 있다고 했다. 아빠가 작년 가을 찾아왔다는데 무슨 얘기를 했는지는 아빠한테 들으란다.",
     "section": "관찰",
     "when": "met:toad"
    },
    {
     "who": "me",
     "text": "짐표 앞면을 손으로 쓸어 보더니 아빠 이름이 혀끝에서 맴돈다고 했다. 늙으면 이름부터 놓친단다.",
     "section": "관찰",
     "when": "met:toad"
    },
    {
     "who": "me",
     "text": "작년 여름 앓는 나를 업고 할멈 약방에 맡기고 혼자 북쪽 길로 갔던 엄마가 돌아와 나를 데려가며 잊고 간 포대기 끈을 받았다.",
     "section": "관찰",
     "when": "galchamgol:arc-toad-wrap"
    }
   ]
  },
  {
   "id": "stream_otter",
   "region": "galchamgol",
   "kind": "animal",
   "lines": [
    {
     "who": "me",
     "text": "개울의 어린 수달. 물이 불어 떠내려간 함지박을 밤마다 도로 이고 올라온다. 엄마를 \"빨래 아줌마\"라고 부른다.",
     "section": "관찰",
     "when": "met:stream_otter"
    },
    {
     "who": "me",
     "text": "엄마는 빨래를 마치면 물수제비를 일곱 번 떴다고 한다. 나는 몰랐다.",
     "section": "관찰",
     "when": "otter:stone"
    }
   ],
   "name": "여울"
  },
  {
   "id": "charcoal_badger",
   "region": "galchamgol",
   "kind": "animal",
   "lines": [
    {
     "who": "me",
     "text": "참나무 숲에서 숯 굽는 오소리. 흰 연기는 아직, 푸른 연기면 다 된 숯이다.",
     "section": "관찰",
     "when": "met:charcoal_badger"
    },
    {
     "who": "me",
     "text": "날쌘 아저씨는 값을 깎는 척하고 가마 옆에 몰래 덤을 두고 간다. 모른 척하기로 했다.",
     "section": "관찰",
     "when": "geom:nal"
    }
   ],
   "name": "검댕"
  },
  {
   "id": "kudzu",
   "region": "galchamgol",
   "kind": "animal",
   "lines": [
    {
     "who": "me",
     "text": "당산나무를 뱀처럼 감은 칡덩굴. 줄기는 채찍처럼 후려치고, 덩이뿌리는 위에서 내리찍고, 꽃은 꽃가루를 터뜨려 바닥에 달큰한 잔향을 남긴다.",
     "section": "관찰",
     "when": "fight:kudzu"
    },
    {
     "who": "me",
     "text": "줄기나 뿌리를 하나 꺾어야 잎이 걷히고 칡꽃이 드러난다.",
     "section": "관찰",
     "when": "core:kudzu"
    },
    {
     "who": "me",
     "text": "싸리버섯 향을 맡으면 덩굴이 느슨해진다.",
     "section": "관찰",
     "when": "like:kudzu:ssari"
    },
    {
     "who": "me",
     "text": "꾀꼬리버섯 향도 좋아한다.",
     "section": "관찰",
     "when": "like:kudzu:kkoe"
    },
    {
     "who": "me",
     "text": "부수지 않고 달래면 보랏빛 칡꽃을 피워 두고 물러난다.",
     "section": "관찰",
     "when": "calm:kudzu"
    }
   ]
  },
  {
   "id": "dad_tag",
   "region": "galchamgol",
   "kind": "item",
   "lines": []
  },
  {
   "id": "yosul_bottari",
   "region": "galchamgol",
   "kind": "item",
   "lines": []
  },
  {
   "id": "acorn",
   "region": "galchamgol",
   "kind": "item",
   "lines": [
    {
     "who": "dad",
     "text": "단풍골에선 도토리 가루가 돈 대신 돈다. 세 알이면 한 줌.",
     "section": "아빠 수첩"
    }
   ],
   "dadDrawing": true
  },
  {
   "id": "bam",
   "region": "galchamgol",
   "kind": "item",
   "lines": []
  },
  {
   "id": "acorn_gift",
   "region": "galchamgol",
   "kind": "item",
   "lines": []
  },
  {
   "id": "root",
   "region": "galchamgol",
   "kind": "item",
   "lines": []
  },
  {
   "id": "ssari",
   "region": "galchamgol",
   "kind": "item",
   "lines": [
    {
     "who": "dad",
     "text": "밑동을 단번에 꺾을 것. 갓이 부서지면 값이 떨어진다.",
     "section": "아빠 수첩"
    }
   ],
   "dadDrawing": true
  },
  {
   "id": "kkoe",
   "region": "galchamgol",
   "kind": "item",
   "lines": []
  },
  {
   "id": "meoru",
   "region": "galchamgol",
   "kind": "item",
   "lines": [
    {
     "who": "dad",
     "text": "해를 머금은 듯 알이 따뜻한 머루. 달여 먹이면 앓던 몸도 기운을 차린다.",
     "section": "아빠 수첩"
    },
    {
     "who": "dad",
     "text": "(해머루 글 끝에 나중에 덧쓴 글씨) 여기도 아니다.",
     "section": "아빠 수첩",
     "when": "got:meoru"
    }
   ],
   "dadDrawing": true
  },
  {
   "id": "kflower",
   "region": "galchamgol",
   "kind": "item",
   "lines": []
  },
  {
   "id": "kkubeogi",
   "region": "dolneomeo",
   "kind": "animal",
   "lines": [
    {
     "who": "me",
     "text": "늘 존다. 졸 때 말을 걸면 잠꼬대만 한다.",
     "section": "관찰",
     "when": "kkubeogi:sleep"
    },
    {
     "who": "me",
     "text": "꾸벅꾸벅 졸다가 고개를 드는 잠깐에만 말이 통한다.",
     "section": "관찰",
     "when": "kkubeogi:awake"
    },
    {
     "who": "me",
     "text": "겨울잠 둥지에 쓸 마른 억새를 좋아한다.",
     "section": "관찰",
     "when": "kkubeogi:eoksae"
    },
    {
     "who": "me",
     "text": "지난가을 아빠가 둥지 곁에서 “미안하다… 그 겨울에 내가 없어서…”라고 했단다. 꾸벅이가 잊기 전에 나한테 맡겼다.",
     "section": "관찰",
     "when": "dolneomeo:arcs-kkubeogi"
    },
    {
     "who": "me",
     "text": "글은 못 읽어도 그림은 알아본다. 봄에 깨면 제일 먼저 볼 자리에 꼬마 두더지와 내 얼굴을 그려 두었다.",
     "section": "관찰",
     "when": "dolneomeo:kku-drawing"
    }
   ]
  },
  {
   "id": "dolsoe",
   "region": "dolneomeo",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "돌너머 석수 두더지. \"돌이 마음을 알아야 돈다.\" 할배한테 배운 말.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "눈이 침침해져서 이제 돌을 손끝으로만 읽는다.",
     "section": "관찰",
     "when": "met:dolsoe"
    },
    {
     "who": "me",
     "text": "결명자 차를 드리면 눈이 밝아진다며 마음을 연다.",
     "section": "관찰",
     "when": "dolsoe:tea"
    },
    {
     "who": "me",
     "text": "돌은 돌리기 전에 먼저 소리를 듣는다. 소리 나는 쪽, 왼쪽으로 한 바퀴.",
     "section": "관찰",
     "when": "dolsoe:stack"
    },
    {
     "who": "me",
     "text": "할배 눈 대신 꼬마 손이 돌을 읽는다. 할배가 처음으로 소리 내어 웃었다.",
     "section": "관찰",
     "when": "dolneomeo:mole-reads"
    }
   ]
  },
  {
   "id": "ppuri",
   "region": "dolneomeo",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "돌산 장승지기 산양. 원칙대로다. 장승제를 안 올리면 누구도 못 지나간다.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "장승제에는 메밀전을 부친다. 메밀가루가 있어야 한다.",
     "section": "관찰",
     "when": "met:ppuri"
    },
    {
     "who": "me",
     "text": "산이 노하면 석이를 올리는 법이라고 했다. 석이 붙은 바위를 알려 줬다.",
     "section": "관찰",
     "when": "ppuri:seogi"
    },
    {
     "who": "me",
     "text": "아버지가 세운 장승에게 아침마다 길 소식을 고한다. 장승 뒤에 떨어진 짐꾼의 이름이 있다.",
     "section": "관찰",
     "when": "dolneomeo:ppuri-eyes"
    }
   ]
  },
  {
   "id": "golem",
   "region": "dolneomeo",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "돌산 어귀 성황당. 지날 때 돌 하나 얹고 소원을 빈다.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "눈을 뒤집어쓴 돌무더기가 설인처럼 일어섰다. 구들돌 발로 땅을 찧고 차돌 팔로 휩쓸고 눈덩이를 던진다.",
     "section": "관찰",
     "when": "fight:golem"
    },
    {
     "who": "me",
     "text": "다리나 팔을 하나 무너뜨리면 가슴의 눈 껍데기가 깨지고 서리빛 핵이 드러난다. 속에 다래 그림자가 비친다.",
     "section": "관찰",
     "when": "core:golem"
    },
    {
     "who": "me",
     "text": "아빠가 못 올린 소원 돌을 건네자 조용해졌다.",
     "section": "관찰",
     "when": "like:golem:story_stone"
    },
    {
     "who": "me",
     "text": "백 년 바위의 석이버섯도 반긴다.",
     "section": "관찰",
     "when": "like:golem:seogi"
    },
    {
     "who": "me",
     "text": "달래면 핵에서 서리다래를 꺼내 내려놓고 성황당으로 내려앉는다.",
     "section": "관찰",
     "when": "calm:golem"
    }
   ]
  },
  {
   "id": "eoksae",
   "region": "dolneomeo",
   "kind": "item",
   "lines": []
  },
  {
   "id": "memil",
   "region": "dolneomeo",
   "kind": "item",
   "lines": [
    {
     "who": "dad",
     "text": "돌너머 장승제 상에는 꼭 메밀전이 오른다.",
     "section": "아빠 수첩"
    }
   ],
   "dadDrawing": true
  },
  {
   "id": "gyeousari",
   "region": "dolneomeo",
   "kind": "item",
   "lines": []
  },
  {
   "id": "gyeolmyeongja",
   "region": "dolneomeo",
   "kind": "item",
   "lines": [
    {
     "who": "dad",
     "text": "눈이 침침한 어른께 차로 달여 드리면 좋다.",
     "section": "아빠 수첩"
    }
   ],
   "dadDrawing": true
  },
  {
   "id": "seogi",
   "region": "dolneomeo",
   "kind": "item",
   "lines": [
    {
     "who": "dad",
     "text": "아는 이가 아니면 자리를 못 찾는다. 장승지기라면 알지도.",
     "section": "아빠 수첩"
    }
   ],
   "dadDrawing": true
  },
  {
   "id": "seoridarae",
   "region": "dolneomeo",
   "kind": "item",
   "lines": []
  },
  {
   "id": "morak",
   "region": "jangteo",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "큰 장터 떡집 곰. 손이 커서 떡을 덤으로 얹어 준다.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "설 대목인데 떡집 맷돌이 깨져 쌀가루가 모자란다.",
     "section": "관찰",
     "when": "met:morak"
    },
    {
     "who": "me",
     "text": "시루는 김을 다룰 줄 알아야 깨어난다. 불은 조금씩, 김은 고르게.",
     "section": "관찰",
     "when": "morak:steam"
    },
    {
     "who": "me",
     "text": "메밀가루 둘이면 메밀떡을 찔 수 있다고 알려 줬다. 도깨비는 메밀을 좋아한다는 말도.",
     "section": "관찰",
     "when": "morak:memiltteok"
    },
    {
     "who": "me",
     "text": "엿방울 아주머니가 제 가위로 떡집 줄을 불러 주자 김이 맵다며 눈가를 훔쳤다.",
     "section": "관찰",
     "when": "arc:jangteo:pair"
    }
   ]
  },
  {
   "id": "yeotbang",
   "region": "jangteo",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "여우 엿장수. 엿장수 마음대로다. 흥이 나면 덤을 준다.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "엿을 고려면 불을 오래 때야 해서 솔방울을 귀하게 친다.",
     "section": "관찰",
     "when": "met:yeotbang"
    },
    {
     "who": "me",
     "text": "가위 장단으로 나를 웃기더니, 숨겨 둔 아빠의 엿을 내줬다.",
     "section": "관찰",
     "when": "yeotbang:high"
    },
    {
     "who": "me",
     "text": "작년 그믐 밤 모락 아주머니가 숨겨 줬다. 고맙단 말을 못 해서 떡을 못 받았다.",
     "section": "관찰",
     "when": "arc:jangteo:pair-night"
    }
   ]
  },
  {
   "id": "bueong",
   "region": "jangteo",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "보부상단 접장 수리부엉이. 밤에만 깬다. 장부를 꼼꼼히 적는 어른.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "낮에는 처마 밑에서 존다. 숙소 마루에서 해가 지기를 기다리면 된다.",
     "section": "관찰",
     "when": "bueong:night"
    },
    {
     "who": "me",
     "text": "보부상단 물건은 보부상에게만 내준다. 규칙이 먼저다.",
     "section": "관찰",
     "when": "bueong:rule"
    },
    {
     "who": "me",
     "text": "설 고사에 팥시루떡을 올리자 장부 한 줄에 표시를 하고 신표를 줬다. 이름은 묻지 않았다.",
     "section": "관찰",
     "when": "bueong:sinpyo"
    },
    {
     "who": "me",
     "text": "값은 철마다 고장마다 다르다. 장부엔 날짜를 적는다. 첫 줄은 \"늦가을, 단풍골.\"",
     "section": "관찰",
     "when": "arc:jangteo:dates"
    },
    {
     "who": "me",
     "text": "상단 장부, 아빠 줄 아래에 \"그 아들\". 이름 칸은 비어 있다.",
     "section": "관찰",
     "when": "arc:jangteo:kidline"
    },
    {
     "who": "me",
     "text": "수첩 장부 끝장에 상단 도장. 보부상끼리는 이 도장을 알아본다.",
     "section": "관찰",
     "when": "arc:jangteo:stamp"
    },
    {
     "who": "me",
     "text": "수리부엉이 눈으로 걸으면 남들 눈엔 안 보이던 것이 느껴진다. 영감님이 밤마다 깨어 장부를 넘기는 까닭을 조금 알 것 같다.",
     "section": "관찰",
     "when": "rule:owl_sense"
    }
   ]
  },
  {
   "id": "jjandol",
   "region": "jangteo",
   "kind": "animal",
   "lines": [
    {
     "who": "me",
     "text": "낮엔 소금값을 짜게 부르는 담비. 밤엔 숙소 문간에 앉아 길 쪽만 본다.",
     "section": "관찰",
     "when": "met:j_jjandol"
    },
    {
     "who": "me",
     "text": "아빠가 지난가을 쥐여 준 신표를 한 번도 쓰지 않고 품고 있었다. 이제 그 신표로 방에서 잔다.",
     "section": "관찰",
     "when": "arc:jangteo:jjandol"
    },
    {
     "who": "me",
     "text": "부엉 영감이 손님 장부에 짠돌 말고 본이름을 적었단다. 무슨 이름인지는 비밀.",
     "section": "관찰",
     "when": "arc:jangteo:jjandol-name"
    }
   ]
  },
  {
   "id": "deungjan",
   "region": "jangteo",
   "kind": "animal",
   "lines": [
    {
     "who": "me",
     "text": "생쥐 밤짐꾼. 해 지고 들어오는 길손 짐을 나르고 허리 등잔으로 길을 비춘다.",
     "section": "관찰",
     "when": "met:j_deungjan"
    },
    {
     "who": "me",
     "text": "내 보따리 약초 냄새로 알아봤다. 지난가을 밤 아빠 짐을 날랐단다. 무거웠고 아빠는 한참 남쪽 하늘만 봤다고. 우리 집이 있는 쪽이다.",
     "section": "관찰",
     "when": "arc:jangteo:deungjan"
    }
   ]
  },
  {
   "id": "dokkaebi",
   "region": "jangteo",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "장터 도깨비 이야기: 그믐 눈밤엔 닳은 헌것이 도깨비가 되어 몸을 감추고 다닌다. 메밀 한 그릇이면 순해진다더라.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "서리 뿔을 이고 어깨옷을 빳빳이 세운 눈도깨비. 독수리는 날갯짓으로 땅에서 솟는 소용돌이를 일으키고, 곰은 굵은 발톱 세 줄로 긁고, 멧돼지는 보이지 않게 날뛰며 발자국만 찍고 땅을 울린다. 둔갑 공격이 끝나면 그 모습 그대로 지쳐 헐떡이고 푸른 심장이 드러난다. 심장을 치면 둔갑이 풀린다.",
     "section": "관찰",
     "when": "fight:dokkaebi"
    },
    {
     "who": "me",
     "text": "둔갑 둘이 풀리면 숨어 버린다. 보이지 않는 빙산이 발밑에서 솟는데 수리부엉이 눈에는 보인다.",
     "section": "관찰",
     "when": "core:dokkaebi"
    },
    {
     "who": "me",
     "text": "메밀떡을 주니 덩실덩실 춤을 췄다. 아빠 수첩에 적힌 대로다.",
     "section": "관찰",
     "when": "like:dokkaebi:memiltteok"
    },
    {
     "who": "me",
     "text": "아빠의 엿을 주자 꼭 끌어안고 돌려주지 않았다.",
     "section": "관찰",
     "when": "like:dokkaebi:dad_yeot"
    },
    {
     "who": "me",
     "text": "달래면 훔친 것을 제자리에 돌려놓고 얼음 뿔 끝을 꺾어 준다.",
     "section": "관찰",
     "when": "calm:dokkaebi"
    }
   ]
  },
  {
   "id": "solbang",
   "region": "jangteo",
   "kind": "item",
   "lines": []
  },
  {
   "id": "pat",
   "region": "jangteo",
   "kind": "item",
   "lines": [
    {
     "who": "dad",
     "text": "설 고사떡에는 붉은 팥. 잡귀를 쫓는다.",
     "section": "아빠 수첩"
    }
   ],
   "dadDrawing": true
  },
  {
   "id": "dokkaebibul",
   "region": "jangteo",
   "kind": "item",
   "lines": []
  },
  {
   "id": "nundok_horn",
   "region": "jangteo",
   "kind": "item",
   "lines": []
  },
  {
   "id": "salgeumi",
   "region": "yeongsan",
   "kind": "animal",
   "lines": [
    {
     "who": "me",
     "text": "겁 많은 고라니. 겨울 끝이라 굶주렸다.",
     "section": "관찰",
     "when": "met:salgeumi"
    },
    {
     "who": "me",
     "text": "귀를 쫑긋 세울 때 움직이면 놀라 달아난다. 그땐 멈춰야 한다.",
     "section": "관찰",
     "when": "salgeumi:alert"
    },
    {
     "who": "me",
     "text": "마가목 열매를 좋아한다. 얼어붙은 비탈 끝 바위턱의 눈에 묻힌 디딤돌로 호숫가에 내려가는 길을 안다.",
     "section": "관찰",
     "when": "salgeumi:shortcut"
    },
    {
     "who": "me",
     "text": "봄이니까 제 발로 샘까지 가겠단다. 그동안 가져간 물을 갚으러.",
     "section": "관찰",
     "when": "ongdal:salg_goes"
    }
   ]
  },
  {
   "id": "dad",
   "region": "yeongsan",
   "kind": "animal",
   "lines": [
    {
     "who": "me",
     "text": "호숫가 끝 얼음 가에서 매듭을 묶었다 풀었다. 불러도 돌아보지 않았다.",
     "section": "관찰",
     "when": "met:dad"
    },
    {
     "who": "me",
     "text": "손이 버릇처럼 꺾인 챙을 폈다. 품에 안은 나무 패는 놓지 않았다. 패를 꿴 끈이 엄마 매듭이었다.",
     "section": "관찰",
     "when": "dad:ledger"
    },
    {
     "who": "me",
     "text": "짐표 앞면에 아빠 이름이 돌아왔다. 세 번 부르니 세 번째에 돌아보았다. \"…모자, 잘 맞네.\"",
     "section": "관찰",
     "when": "dad:back"
    },
    {
     "who": "me",
     "text": "가을부터 하루에 하나씩 막대에 금을 긋는다. 깊은 금 하나에서 엄지가 멈췄다가 지나간다.",
     "section": "관찰",
     "when": "dad:tally"
    },
    {
     "who": "me",
     "text": "끈 매듭만 보고 누가 보냈는지 알았다. \"갚을 거 없다고 해라.\"",
     "section": "관찰",
     "when": "dad:no_debt"
    },
    {
     "who": "me",
     "text": "말 대신 흙에 그림을 그린다. 우리 셋과 지붕. 내 머리에는 모자.",
     "section": "관찰",
     "when": "dad:mud"
    },
    {
     "who": "me",
     "text": "수첩 맨 뒤에 아빠 손도장. 그 옆에 내 손도장. 다음 쪽은 집에서.",
     "section": "관찰",
     "when": "dad:palm"
    },
    {
     "who": "me",
     "text": "한참 들여다보더니 내 보따리 끈에 도로 매 주었다. \"네 거다.\"",
     "section": "관찰",
     "when": "dad:sinpyo"
    },
    {
     "who": "me",
     "text": "엄마가 맨 매듭에서 손을 멈췄다. 물 한 바가지 빚은 셋이서 갚으러 오자고.",
     "section": "관찰",
     "when": "dad:gourd"
    }
   ]
  },
  {
   "id": "durumi",
   "region": "yeongsan",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "영산 신목 섬 앞에 늙은 두루미가 산다고 들었다. 어미들이 가져온 아이 명패를 받아 가지에 매어 준다고. 장삿길에 들를 일은 없겠다.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "첫눈 뒤로 고개를 한 번도 돌리지 않아 제 이름을 지킨 늙은 두루미. 셋째 부름에 돌아보면 이름이 붉은 천에 적힌단다.",
     "section": "관찰",
     "when": "durumi:call"
    },
    {
     "who": "me",
     "text": "신목지기. 작년 여름 엄마가 내 명패를 매는 걸 지켜봤다. 엄마 목소리에 돌아본 아빠가 이름을 잃는 것도 봤다. 돕지 못한 걸 부끄러워한다.",
     "section": "관찰",
     "when": "durumi:story"
    },
    {
     "who": "me",
     "text": "내 명패를 신목 가지에 엄마 매듭으로 다시 맸다. 나무가 엄마의 값을 돌려보낸다고 했다.",
     "section": "관찰",
     "when": "durumi:plate"
    }
   ]
  },
  {
   "id": "gangcheol",
   "region": "yeongsan",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "북쪽 산 사람들 옛말. 밤에 누가 이름을 부르거든 돌아보지 말 것. 세 번째 부름엔 넋이 따라간다.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "갓 쓴 어둠. 이름을 세 번 부르고, 마주 보면 커지고, 붉은 오랏줄을 던지고, 소매에서 까마귀가 쏟아진다. 정체는 아무도 모른다.",
     "section": "관찰",
     "when": "fight:gangcheol"
    },
    {
     "who": "me",
     "text": "갓이 떨어지면 그 아래가 비어 있다.",
     "section": "관찰",
     "when": "core:gangcheol"
    },
    {
     "who": "me",
     "text": "짚신을 내려다보다 갓을 숙였다. 맨발로 먼 길을 왔나 보다. 옹달 할머니가 말한 사잣밥이다.",
     "section": "관찰",
     "when": "like:gangcheol:jipsin"
    },
    {
     "who": "me",
     "text": "밥 냄새에 소매가 멈췄다. 초상집 문간의 밥 한 그릇이 생각났다.",
     "section": "관찰",
     "when": "like:gangcheol:rice"
    },
    {
     "who": "me",
     "text": "달래면 짚신을 신고 갓을 숙인 뒤 북쪽 길로 걸어 사라진다. 붉은 천은 두고 간다.",
     "section": "관찰",
     "when": "calm:gangcheol"
    }
   ]
  },
  {
   "id": "darae_vine",
   "region": "yeongsan",
   "kind": "item",
   "lines": []
  },
  {
   "id": "magamok",
   "region": "yeongsan",
   "kind": "item",
   "lines": [
    {
     "who": "dad",
     "text": "영산 비탈에 많다. 고라니가 좋아한다.",
     "section": "아빠 수첩"
    }
   ]
  },
  {
   "id": "broken_orb",
   "region": "yeongsan",
   "kind": "item",
   "lines": []
  },
  {
   "id": "gal_stamp_anvil",
   "region": "galchamgol",
   "kind": "stamp",
   "lines": [
    {
     "who": "me",
     "text": "모루 밑에 아빠 손. 쇳가루랑 숯검댕이 손금마다 박혔다. 연장 고칠 대장간이 여기 있다는 표시다. 삼촌이 이 모루를 들이던 해에 아빠가 찍어 줬대.",
     "section": "관찰",
     "when": "stamp:galchamgol:anvil"
    }
   ],
   "name": "모루 밑 아빠 손"
  },
  {
   "id": "gal_stamp_knot",
   "region": "galchamgol",
   "kind": "stamp",
   "lines": [
    {
     "who": "me",
     "text": "높은 가지 옹이에 아빠 손. 손끝에 단풍잎 한 조각이 같이 찍혔다. 여기 올라서니 금줄 길이 보였다. 숲에서 길을 놓치면 여기 오르라는 표시다.",
     "section": "관찰",
     "when": "stamp:galchamgol:knot"
    }
   ],
   "name": "높은 가지 아빠 손"
  },
  {
   "id": "gal_stamp_roots",
   "region": "galchamgol",
   "kind": "stamp",
   "lines": [
    {
     "who": "me",
     "text": "당산나무 뿌리에 아빠 손. 가운데가 보랏빛이다. 머루 만진 손으로 짚었나 봐. 북쪽 길은 이 언덕 끝에서 떠난다. 나도 여기서 떠난다.",
     "section": "관찰",
     "when": "stamp:galchamgol:roots"
    }
   ],
   "name": "당산나무 뿌리 아빠 손"
  },
  {
   "id": "jeolgu",
   "region": "galchamgol",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "엄마는 세 번 찧고 한 번 쉬었다. 엄마가 잊어도 내 손은 기억할 거다.",
     "section": "익힌 솜씨",
     "when": "habit:jeolgu"
    }
   ],
   "name": "엄마의 절구"
  },
  {
   "id": "maetdol",
   "region": "dolneomeo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "증조할아버지는 맷돌을 꼭 왼쪽으로 돌렸단다. 자개 발자국을 따라 손을 돌렸다.",
     "section": "익힌 솜씨",
     "when": "habit:maetdol"
    }
   ],
   "name": "증조할아버지의 맷돌"
  },
  {
   "id": "siru",
   "region": "jangteo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "잔칫날이면 엄마는 김이 오를 때 뚜껑을 톡 두드렸다. 나도 같은 소리를 냈다.",
     "section": "익힌 솜씨",
     "when": "habit:siru"
    }
   ],
   "name": "잔칫날의 시루"
  },
  {
   "id": "sesame_salt",
   "region": "galchamgol",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "깨와 소금을 함께 찧으니 깨소금이 됐다. 엄마가 밥상에 놓던 냄새다.",
     "section": "숨은 가공법",
     "when": "recipe:sesame_salt"
    },
    {
     "who": "me",
     "text": "날쌘 아저씨가 볶은 깨를 소금이랑 같이 찧어 보라고 했다.",
     "section": "숨은 가공법",
     "when": "hint:sesame_salt"
    },
    {
     "who": "me",
     "text": "날쌘이 말없이 쪽지를 넣어 줬다. 깨 하나, 소금 하나, 절구에.",
     "section": "숨은 가공법",
     "when": "gift:g_gal_nal"
    }
   ]
  },
  {
   "id": "mung_batter",
   "region": "jangteo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "녹두에 참기름을 더해 갈았다. 장터에서 먹던 빈대떡 반죽이 됐다.",
     "section": "숨은 가공법",
     "when": "recipe:mung_batter"
    },
    {
     "who": "me",
     "text": "모락 아주머니 말로는 녹두에 참기름을 넣고 갈아야 빈대떡 부치기 좋다.",
     "section": "숨은 가공법",
     "when": "hint:mung_batter"
    },
    {
     "who": "me",
     "text": "날쌘이 쪽지를 쥐여 줬다. 녹두 하나, 참기름 하나, 맷돌에.",
     "section": "숨은 가공법",
     "when": "gift:g_jang_nal"
    }
   ]
  },
  {
   "id": "rainbow_tteok",
   "region": "yeongsan",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "단풍골 가루에 장터 팥과 영산 열매를 포갰다. 세 계절이 한 떡이 됐다.",
     "section": "숨은 가공법",
     "when": "recipe:rainbow_tteok"
    },
    {
     "who": "me",
     "text": "모락 아주머니가 도토리 가루, 팥, 마가목 열매를 시루에 한 켜씩 앉히라고 가르쳐 주셨다.",
     "section": "숨은 가공법",
     "when": "gift:g_jang_morak"
    }
   ]
  },
  {
   "id": "ssanghwa",
   "region": "yeongsan",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "칡뿌리와 겨우살이, 대추를 함께 갈았다. 증조할아버지의 맷돌에서 새 향이 났다.",
     "section": "숨은 가공법",
     "when": "recipe:ssanghwa"
    },
    {
     "who": "me",
     "text": "할머니가 칡뿌리는 겨우살이에 대추 하나 넣고 갈면 겨울 약이 된다고 했다.",
     "section": "숨은 가공법",
     "when": "hint:ssanghwa"
    },
    {
     "who": "me",
     "text": "날쌘이 보따리 끈에 쪽지를 끼워 두고 갔다. 칡뿌리, 겨우살이, 대추를 하나씩 맷돌에.",
     "section": "숨은 가공법",
     "when": "gift:g_yeong_nal"
    }
   ]
  },
  {
   "id": "dolneomeo_jangseung",
   "region": "dolneomeo",
   "kind": "stamp",
   "lines": [
    {
     "who": "me",
     "text": "장승 뒤 받침에 아빠 손. 짚 부스러기가 같이 눌렸다. 고갯길 앞이라 짚신을 고쳐 신고 넘으라는 표시다. 내 짚신 끈도 여기서 다시 맸다.",
     "section": "관찰",
     "when": "stamp:dolneomeo:jangseung"
    }
   ],
   "name": "장승 뒤 아빠 손"
  },
  {
   "id": "dolneomeo_mill_base",
   "region": "dolneomeo",
   "kind": "stamp",
   "lines": [
    {
     "who": "me",
     "text": "맷돌 받침돌에 아빠 손. 흰 돌가루가 고루 뱄다. 곡식 빻을 맷돌이 있는 집이라는 표시다. 돌쇠 할배가 돌을 가르쳐 준 그 손이다.",
     "section": "관찰",
     "when": "stamp:dolneomeo:mill_base"
    }
   ],
   "name": "맷돌 받침돌 아빠 손"
  },
  {
   "id": "dolneomeo_cliff_crack",
   "region": "dolneomeo",
   "kind": "stamp",
   "lines": [
    {
     "who": "me",
     "text": "절벽 바위 틈에 아빠 손. 손가락만 길게 눌렸고 끝에 서리가 앉았다. 여기는 붙잡아도 안 미끄러진다는 표시다. 나도 그 틈을 잡고 아래를 봤다. 다리가 후들거렸다.",
     "section": "관찰",
     "when": "stamp:dolneomeo:cliff_crack"
    }
   ],
   "name": "절벽 바위 틈 아빠 손"
  },
  {
   "id": "salt",
   "region": "galchamgol",
   "kind": "item",
   "lines": []
  },
  {
   "id": "sesame",
   "region": "galchamgol",
   "kind": "item",
   "lines": []
  },
  {
   "id": "sesame_oil",
   "region": "dolneomeo",
   "kind": "item",
   "lines": []
  },
  {
   "id": "mung",
   "region": "jangteo",
   "kind": "item",
   "lines": []
  },
  {
   "id": "honey",
   "region": "jangteo",
   "kind": "item",
   "lines": []
  },
  {
   "id": "jujube",
   "region": "yeongsan",
   "kind": "item",
   "lines": []
  },
  {
   "id": "acorn_jelly",
   "region": "galchamgol",
   "kind": "item",
   "lines": []
  },
  {
   "id": "memil_jelly",
   "region": "dolneomeo",
   "kind": "item",
   "lines": []
  },
  {
   "id": "dol_badger",
   "region": "dolneomeo",
   "kind": "animal",
   "lines": [
    {
     "who": "me",
     "text": "메밀밭 들쥐 아주머니. 메밀 널어 둔 멍석을 지키느라 밭을 못 뜬다. 짐을 맡기는 손이 크다.",
     "section": "관찰",
     "when": "met:dol_badger"
    },
    {
     "who": "me",
     "text": "오래전 겨울에 값으로 받은 꽃수 보자기를 주인에게 돌려 달라고 했다. 내 보따리 매듭과 똑같이 묶였고, 귀퉁이 꽃이 엄마 수다.",
     "section": "관찰",
     "when": "dolneomeo:flower-bojagi"
    }
   ],
   "name": "메밀댁"
  },
  {
   "id": "dol_turtle",
   "region": "dolneomeo",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "성황당 돌 그늘의 남생이. 백 년을 살았다고 한다. 말이 느리고 짧다.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "소원 천은 높을수록 잘 들린다고 했다. 가장 높은 가지에 아빠가 맨 천이 있다.",
     "section": "관찰",
     "when": "met:dol_turtle"
    },
    {
     "who": "me",
     "text": "무언가 지나간 자리엔 샘이 먼저 죽는다. 여름엔 마르고 겨울엔 언다. 물 마른 데를 만나면 샘부터 찾으라고 했다.",
     "section": "관찰",
     "when": "dolneomeo:turtle-spring"
    }
   ],
   "name": "남생이 할미"
  },
  {
   "id": "yakgwa",
   "region": "jangteo",
   "kind": "item",
   "lines": []
  },
  {
   "id": "magamok_tea",
   "region": "yeongsan",
   "kind": "item",
   "lines": []
  },
  {
   "id": "dad_stamp_jangteo_flag",
   "region": "jangteo",
   "kind": "stamp",
   "lines": [
    {
     "who": "me",
     "text": "깃대 판에 작은 아빠 손. 흙먼지가 한쪽으로 끌렸다. 장 서는 마당 한가운데라는 표시다. 길 물을 데가 없으면 깃발부터 찾으라는 거겠지.",
     "section": "관찰",
     "when": "stamp:jangteo:flag"
    }
   ],
   "name": "장터 깃대 아빠 손"
  },
  {
   "id": "dad_stamp_jangteo_pillar",
   "region": "jangteo",
   "kind": "stamp",
   "lines": [
    {
     "who": "me",
     "text": "숙소 기둥에 아빠 손. 물 자국이 흘러내렸다. 보부상이 묵어 갈 숙소라는 표시다. 새벽에 젖은 손으로 짚고 나섰나 봐.",
     "section": "관찰",
     "when": "stamp:jangteo:pillar"
    }
   ],
   "name": "숙소 기둥 아빠 손"
  },
  {
   "id": "dad_stamp_jangteo_rock",
   "region": "jangteo",
   "kind": "stamp",
   "lines": [
    {
     "who": "me",
     "text": "솔숲 큰 바위에 아빠 손. 송진 방울이랑 솔잎이 붙었다. 바위에 오르니 장터 불빛이 다 보였다. 밤에 솔숲에서 길 잃으면 여기 오르라는 표시다.",
     "section": "관찰",
     "when": "stamp:jangteo:rock"
    }
   ],
   "name": "솔숲 바위 아빠 손"
  },
  {
   "id": "y_stamp_hut",
   "region": "yeongsan",
   "kind": "stamp",
   "lines": [
    {
     "who": "me",
     "text": "움막 문설주에 아빠 손. 둘레에 서리꽃이 폈다. 눈보라 치면 여기 들어와 묵으라는 표시다. 아빠 손을 따라 그리니 내 손이 시렸다.",
     "section": "관찰",
     "when": "stamp:yeongsan:hut_post"
    }
   ],
   "name": "움막 문설주 아빠 손"
  },
  {
   "id": "y_stamp_snow",
   "region": "yeongsan",
   "kind": "stamp",
   "lines": [
    {
     "who": "me",
     "text": "쉼바위 옆에 아빠 손. 손끝이랑 손바닥 가에 눈이 묻었다. 지게를 받쳐 두고 숨 돌리라는 표시다. 윗면 홈마다 지게 다리 자국이 닳아 있었다. 여럿이 쉬어 갔다.",
     "section": "관찰",
     "when": "stamp:yeongsan:snow_sign"
    }
   ],
   "name": "쉼바위 아빠 손"
  },
  {
   "id": "y_stamp_shore",
   "region": "yeongsan",
   "kind": "stamp",
   "lines": [
    {
     "who": "me",
     "text": "호숫가 바위에 아빠 손. 호수 바람과 얼음에 닳아 아주 옅다. 호수 건너 신목 섬이 보이는 자리라는 표시다. 아빠가 찾던 데가 저기다.",
     "section": "관찰",
     "when": "stamp:yeongsan:shore_rock"
    }
   ],
   "name": "호숫가 바위 아빠 손"
  },
  {
   "id": "ongdal",
   "region": "yeongsan",
   "kind": "animal",
   "lines": [
    {
     "who": "me",
     "text": "얼어붙은 샘 대신 금 간 솥에 눈을 녹인다. 오는 짐승마다 한 모금씩.",
     "section": "관찰",
     "when": "ongdal:pot"
    },
    {
     "who": "me",
     "text": "할미 물은 반씩 호숫가로 갔다. 첫눈 뒤 솥이 비는 게 제 탓 같아 살금이는 발을 끊었다.",
     "section": "관찰",
     "when": "ongdal:half"
    },
    {
     "who": "me",
     "text": "솔잎 국물 한 그릇. 겨울 산을 혼자 오르는 너구리는 내가 둘째란다. 본이름은 그놈이 가져갔고 옹달 할미라 불려 솥을 건다.",
     "section": "관찰",
     "when": "ongdal:soup"
    },
    {
     "who": "me",
     "text": "표주박 끈 매듭이 내 보따리 매듭과 똑같다. 엄마가 가르쳐 준 매듭이다.",
     "section": "관찰",
     "when": "ongdal:knot"
    },
    {
     "who": "me",
     "text": "첫 샘물을 담은 표주박을 맡겼다. 아빠 몫 물 한 바가지 빚은 집에서 갚으라고.",
     "section": "관찰",
     "when": "ongdal:gourd"
    },
    {
     "who": "me",
     "text": "샘이 풀렸는데도 솥을 다시 걸어 빚진 국물을 끓였다. 솥 걸어 놓고 기다리겠단다.",
     "section": "관찰",
     "when": "ongdal:bye"
    }
   ]
  },
  {
   "id": "gyeol_hwan",
   "region": "dolneomeo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "날쌘 아저씨가 결명자는 꿀에 개어 환으로 빚어 두면 길에서도 먹는다고 했다.",
     "section": "숨은 가공법",
     "when": "hint:gyeol_hwan"
    },
    {
     "who": "me",
     "text": "결명자를 꿀에 개어 빚었다. 콩알만 한 환이 됐다.",
     "section": "숨은 가공법",
     "when": "recipe:gyeol_hwan"
    },
    {
     "who": "me",
     "text": "두꺼비 할머니가 손바닥을 펴 보라더니 결명자를 꿀에 개어 환으로 빚는 법을 일러 주셨다.",
     "section": "숨은 가공법",
     "when": "gift:g_gal_toad"
    },
    {
     "who": "me",
     "text": "날쌘이 또 쪽지를 떨구고 갔다. 결명자 하나, 꿀 하나, 절구에.",
     "section": "숨은 가공법",
     "when": "gift:g_dol_nal"
    }
   ]
  },
  {
   "id": "kkot_cheong",
   "region": "galchamgol",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "할머니 말로는 칡꽃을 꿀에 재워 두면 겨울 내내 목이 안 붓는다.",
     "section": "숨은 가공법",
     "when": "hint:kkot_cheong"
    },
    {
     "who": "me",
     "text": "칡꽃을 찧어 꿀에 재웠다. 단풍골 냄새가 난다.",
     "section": "숨은 가공법",
     "when": "recipe:kkot_cheong"
    }
   ]
  },
  {
   "id": "solbang_cheong",
   "region": "jangteo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "솔방울을 찧어 석청에 재워 봤다. 송진 냄새가 단맛 속에 숨었다.",
     "section": "숨은 가공법",
     "when": "recipe:solbang_cheong"
    },
    {
     "who": "me",
     "text": "부엉 영감님이 장부 한 장을 찢어 주셨다. 솔방울 둘에 석청 하나, 절구에 찧어 잰다.",
     "section": "숨은 가공법",
     "when": "gift:g_jang_bueong"
    }
   ]
  },
  {
   "id": "sirumit",
   "region": "jangteo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "모락 아주머니 시룻밑이 해졌다. 싸리 살에 짚을 엮어 새로 깔아야 한단다.",
     "section": "숨은 가공법",
     "when": "hint:sirumit"
    },
    {
     "who": "me",
     "text": "싸리 살에 짚을 두드려 엮었다. 시루 바닥에 꼭 맞는다.",
     "section": "숨은 가공법",
     "when": "recipe:sirumit"
    }
   ]
  },
  {
   "id": "heuk_banjuk",
   "region": "dolneomeo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "돌쇠 할배는 담 틈을 진흙에 돌가루, 썬 억새를 넣고 찧어 메운다.",
     "section": "숨은 가공법",
     "when": "hint:heuk_banjuk"
    },
    {
     "who": "me",
     "text": "진흙에 돌가루와 억새를 넣고 찧었다. 손에 쩍쩍 붙는다.",
     "section": "숨은 가공법",
     "when": "recipe:heuk_banjuk"
    },
    {
     "who": "me",
     "text": "남생이 할머니가 진흙 덩이에 돌가루, 마른 억새를 같이 찧으면 둑 메우는 흙이 된다고 일러 주셨다.",
     "section": "숨은 가공법",
     "when": "gift:g_dol_turtle"
    }
   ]
  },
  {
   "id": "jjimjil_dol",
   "region": "dolneomeo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "아빠는 겨울이면 구들돌을 데워 솜에 싸서 삼촌 다리에 대 줬다고 한다.",
     "section": "숨은 가공법",
     "when": "hint:jjimjil_dol"
    },
    {
     "who": "me",
     "text": "구들돌을 숯불 김에 데워 억새꽃 솜에 쌌다. 한참 따뜻하다.",
     "section": "숨은 가공법",
     "when": "recipe:jjimjil_dol"
    },
    {
     "who": "me",
     "text": "검댕 아저씨가 받은 셈이라며 구들돌을 숯불에 달궈 억새꽃 솜에 싸서 찌는 법을 일러 줬다.",
     "section": "숨은 가공법",
     "when": "gift:g_gal_geomdaeng"
    }
   ]
  },
  {
   "id": "dol_mulgam",
   "region": "dolneomeo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "뿔영감 아버지는 이끼 앉은 돌을 갈아 기름에 개서 장승 눈을 칠했다고 한다.",
     "section": "숨은 가공법",
     "when": "hint:dol_mulgam"
    },
    {
     "who": "me",
     "text": "이끼 낀 눈돌을 기름에 갈았다. 푸른 먹빛 물감이 됐다.",
     "section": "숨은 가공법",
     "when": "recipe:dol_mulgam"
    },
    {
     "who": "me",
     "text": "뿔영감님이 이끼 낀 눈돌을 참기름에 개어 갈면 장승 눈에 올리는 빛이 된다고 하셨다.",
     "section": "숨은 가공법",
     "when": "gift:g_dol_ppuri"
    }
   ]
  },
  {
   "id": "okgaru",
   "region": "dolneomeo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "옥돌을 맷돌에 갈아 봤다. 손등에 바르니 뽀얗다.",
     "section": "숨은 가공법",
     "when": "recipe:okgaru"
    },
    {
     "who": "me",
     "text": "돌쇠 할아버지가 내 손을 잡고 옥돌을 맷돌에 갈면 옥가루가 된다고 일러 주셨다.",
     "section": "숨은 가공법",
     "when": "gift:g_dol_dolsoe"
    }
   ]
  },
  {
   "id": "dubu",
   "region": "jangteo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "짠돌 아저씨 말로는 콩 갈아 두부 앉힐 때도 소금이 든다.",
     "section": "숨은 가공법",
     "when": "hint:dubu"
    },
    {
     "who": "me",
     "text": "콩을 갈고 소금으로 앉혔더니 두부가 됐다. 말랑하다.",
     "section": "숨은 가공법",
     "when": "recipe:dubu"
    }
   ]
  },
  {
   "id": "jatjuk",
   "region": "jangteo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "부엉 영감님은 쌀에 잣을 같이 갈아 쑨 잣죽이 늙은 속에 낫다고 하셨다.",
     "section": "숨은 가공법",
     "when": "hint:jatjuk"
    },
    {
     "who": "me",
     "text": "쌀과 잣을 같이 갈았다. 죽이 곱게 쒀졌다.",
     "section": "숨은 가공법",
     "when": "recipe:jatjuk"
    },
    {
     "who": "me",
     "text": "꾸벅이가 졸면서 겨울잠 들기 전엔 쌀이랑 잣을 같이 갈아 죽을 먹는다고 중얼거렸다.",
     "section": "숨은 가공법",
     "when": "gift:g_dol_kkubeogi"
    }
   ]
  },
  {
   "id": "songibap",
   "region": "galchamgol",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "송이를 찢어 쌀에 얹고 쪄 봤다. 시루 김에 송이 냄새가 가득하다.",
     "section": "숨은 가공법",
     "when": "recipe:songibap"
    },
    {
     "who": "me",
     "text": "여울이 빨래 아줌마한테 들었다며 쌀 두 줌에 송이 하나를 쪄 보라고 했다. 빨래 아줌마는 엄마다.",
     "section": "숨은 가공법",
     "when": "gift:g_gal_otter"
    },
    {
     "who": "me",
     "text": "말뚝 행수님이 셈을 갚는다며 쌀 두 줌에 송이 하나를 얹어 찌는 상단 밥을 일러 주셨다.",
     "section": "숨은 가공법",
     "when": "gift:g_jang_haengsu"
    }
   ]
  },
  {
   "id": "beoseot_jjim",
   "region": "galchamgol",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "검댕 아저씨는 싸리버섯 꾀꼬리버섯에 깨소금을 쳐서 쪄 먹으며 가마를 지킨다.",
     "section": "숨은 가공법",
     "when": "hint:beoseot_jjim"
    },
    {
     "who": "me",
     "text": "버섯 두 가지에 깨소금을 쳐서 쪘다. 검댕 아저씨네 저녁 맛이다.",
     "section": "숨은 가공법",
     "when": "recipe:beoseot_jjim"
    },
    {
     "who": "me",
     "text": "도담이 숯가마 쪽에선 버섯 두 가지에 깨소금을 쳐서 쪄 먹는다고 알려 줬다.",
     "section": "숨은 가공법",
     "when": "gift:g_gal_dodam"
    },
    {
     "who": "me",
     "text": "종종이가 엄마가 쪄 주던 버섯찜 이야기를 혼잣말로 흘렸다.",
     "section": "숨은 가공법",
     "when": "gift:g_jang_jongjong"
    }
   ]
  },
  {
   "id": "seogibyeong",
   "region": "dolneomeo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "메밀댁 아주머니는 잔칫날이면 쌀가루에 석이를 섞어 떡을 쪘다고 했다.",
     "section": "숨은 가공법",
     "when": "hint:seogibyeong"
    },
    {
     "who": "me",
     "text": "석이를 쌀가루에 섞어 쪘다. 거무스름한 잔치떡이 됐다.",
     "section": "숨은 가공법",
     "when": "recipe:seogibyeong"
    },
    {
     "who": "me",
     "text": "메밀댁이 말없이 시늉으로 쌀가루에 석이를 섞어 쪄 보였다. 석이병이다.",
     "section": "숨은 가공법",
     "when": "gift:g_dol_badger"
    },
    {
     "who": "me",
     "text": "등잔발이 밤길에 들었다며 돌너머 메밀댁의 석이병 이야기를 해 줬다. 쌀가루에 석이를 섞어 찐다.",
     "section": "숨은 가공법",
     "when": "gift:g_jang_deungjan"
    }
   ]
  },
  {
   "id": "yaksik",
   "region": "jangteo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "엿방울 아주머니 말로는 정월엔 쌀에 밤이랑 대추를 넣어 시루에 찐 약식을 먹는다.",
     "section": "숨은 가공법",
     "when": "hint:yaksik"
    },
    {
     "who": "me",
     "text": "쌀에 밤과 대추를 넣어 쪘다. 엿보다 달다는 말이 맞다.",
     "section": "숨은 가공법",
     "when": "recipe:yaksik"
    }
   ]
  },
  {
   "id": "chik_sil",
   "region": "galchamgol",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "아빠 낫 자루에 감긴 끈은 칡 실이다. 칡 줄기를 쪄서 뽑는다고 삼촌이 그랬다.",
     "section": "숨은 가공법",
     "when": "hint:chik_sil"
    },
    {
     "who": "me",
     "text": "칡 줄기를 쪄서 껍질을 벗기니 실이 나왔다. 아빠 낫 자루의 그 끈이다.",
     "section": "숨은 가공법",
     "when": "recipe:chik_sil"
    }
   ]
  },
  {
   "id": "darae_cha",
   "region": "yeongsan",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "옹달 할미는 추울 때 다래 덩굴을 찧어 대추 하나 넣고 달여 먹는다.",
     "section": "숨은 가공법",
     "when": "hint:darae_cha"
    },
    {
     "who": "me",
     "text": "다래 덩굴을 찧어 대추와 달였다. 속이 풀린다.",
     "section": "숨은 가공법",
     "when": "recipe:darae_cha"
    }
   ]
  },
  {
   "id": "hwachae",
   "region": "yeongsan",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "고드름을 깨 넣고 마가목을 으깨 띄웠다. 이가 시리다.",
     "section": "숨은 가공법",
     "when": "recipe:hwachae"
    },
    {
     "who": "me",
     "text": "살금이가 고드름 조각에 마가목 두 알을 찧어 띄우면 시원하다고 중얼거렸다.",
     "section": "숨은 가공법",
     "when": "gift:g_yeong_salgeumi"
    }
   ]
  },
  {
   "id": "bigeul_garu",
   "region": "yeongsan",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "언 까마귀 깃과 고드름 조각을 같이 갈았다. 가루가 손끝에서 서늘하다.",
     "section": "숨은 가공법",
     "when": "recipe:bigeul_garu"
    },
    {
     "who": "me",
     "text": "옹달 할머니가 언 까마귀 깃과 고드름 조각을 맷돌에 같이 갈면 열 내리는 가루가 된다고 하셨다.",
     "section": "숨은 가공법",
     "when": "gift:g_yeong_ongdal"
    }
   ]
  },
  {
   "id": "gongi",
   "region": "dolneomeo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "돌쇠 할배는 차돌 쪼가리를 찧어 공깃돌로 다듬는다.",
     "section": "숨은 가공법",
     "when": "hint:gongi"
    },
    {
     "who": "me",
     "text": "차돌을 찧으니 결대로 갈라졌다. 모난 데를 갈아 공깃돌 다섯 알.",
     "section": "숨은 가공법",
     "when": "recipe:gongi"
    },
    {
     "who": "me",
     "text": "삼촌은 어릴 때 아빠랑 차돌 두 개를 절구에 찧어 공깃돌을 만들었다고 혼잣말을 했다.",
     "section": "숨은 가공법",
     "when": "gift:g_gal_musoe"
    }
   ]
  },
  {
   "id": "gangjeong",
   "region": "jangteo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "얼레네 할머니는 깨를 꿀에 버무려 꾹꾹 눌러 강정을 굳힌다.",
     "section": "숨은 가공법",
     "when": "hint:gangjeong"
    },
    {
     "who": "me",
     "text": "깨에 꿀을 버무려 찧었더니 강정이 굳었다. 얼레네 할머니 솜씨엔 아직 못 미친다.",
     "section": "숨은 가공법",
     "when": "recipe:gangjeong"
    },
    {
     "who": "me",
     "text": "엿방울이 장터 사람이면 다 안다며 깨를 꿀에 버무려 찧으면 깨강정이라고 했다.",
     "section": "숨은 가공법",
     "when": "gift:g_jang_yeot"
    }
   ]
  },
  {
   "id": "meju",
   "region": "jangteo",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "뭉근 할멈 말로는 콩 두 됫박을 절구에 찧어 덩이를 빚고 짚으로 묶으면 메주가 된다.",
     "section": "숨은 가공법",
     "when": "hint:meju"
    },
    {
     "who": "me",
     "text": "콩을 찧어 덩이를 빚고 짚으로 묶었다. 할멈 말대로 매달아 띄우면 장이 된다.",
     "section": "숨은 가공법",
     "when": "recipe:meju"
    },
    {
     "who": "me",
     "text": "짠돌이 장국밥 할머니네 메주 빚는 법을 들은 대로 알려 줬다. 콩 둘을 찧어 짚으로 묶는다.",
     "section": "숨은 가공법",
     "when": "gift:g_jang_jjandol"
    }
   ]
  }
 ],
 "STAMP_MARKS": {
  "galchamgol:anvil": {
   "mark": "soot",
   "press": "strong"
  },
  "galchamgol:knot": {
   "mark": "leaf",
   "press": "strong"
  },
  "galchamgol:roots": {
   "mark": "juice",
   "press": "normal"
  },
  "dolneomeo:jangseung": {
   "mark": "straw",
   "press": "normal"
  },
  "dolneomeo:mill_base": {
   "mark": "dust",
   "press": "normal"
  },
  "dolneomeo:cliff_crack": {
   "mark": "grip",
   "press": "normal"
  },
  "jangteo:flag": {
   "mark": "wind",
   "press": "normal"
  },
  "jangteo:pillar": {
   "mark": "wet",
   "press": "normal"
  },
  "jangteo:rock": {
   "mark": "resin",
   "press": "strong"
  },
  "yeongsan:hut_post": {
   "mark": "frost",
   "press": "normal"
  },
  "yeongsan:snow_sign": {
   "mark": "snow",
   "press": "normal"
  },
  "yeongsan:shore_rock": {
   "mark": "ice",
   "press": "faint"
  }
 },
 "MINIGAMES": {
  "handwork_forge_relation": 2,
  "handwork_stack_relation": 2,
  "handwork_steam_relation": 1,
  "salg_graze": 108,
  "salg_return_graze": 114,
  "salg_moving": 0.2,
  "salg_active_distance": 190,
  "salg_arrival_distance": 30,
  "salg_grass_interval": 28,
  "salg_risk_distance": 150,
  "salg_grace": 12,
  "salg_relief_frames": 2,
  "salg_recovery": 2,
  "salg_risk_limit": 12,
  "salg_startle_frames": 60,
  "salg_max_retreat": 80,
  "salg_retreat": 60,
  "salg_warning_frames": 36,
  "salg_alert_frames": 52,
  "salg_near_distance": 100,
  "salg_near_graze": 90,
  "salg_near_random": 31,
  "gather_spin_period": 96,
  "gather_ring_pad": 3,
  "gather_perfect_zone": 4,
  "gather_good_zone": 6,
  "gather_shrink_step": 2,
  "gather_shrink_floor": 75,
  "gather_zone_min": 30,
  "gather_zone_max": 85,
  "gather_zone_count": 2,
  "gather_zone_gap": 25,
  "gather_stop_frames": 24,
  "gather_perfect_power": 2,
  "gather_yield": 1,
  "gather_perfect_bonus": 1,
  "gather_root_hits": 3,
  "gather_ssari_hits": 2,
  "gather_kkoe_hits": 2,
  "gather_eoksae_hits": 2,
  "gather_seogi_hits": 2,
  "gather_darae_vine_hits": 2,
  "gather_solbang_hits": 2,
  "gather_snow_mound_hits": 2,
  "gather_root_period": 104,
  "gather_ssari_period": 88,
  "gather_kkoe_period": 84,
  "gather_eoksae_period": 92,
  "gather_seogi_period": 100,
  "gather_snow_mound_period": 100,
  "gather_solbang_period": 88,
  "gather_darae_vine_period": 96,
  "baduk_steady_win": 0.6,
  "baduk_stake": 1,
  "baduk_steady_pay": 1,
  "baduk_bold_pay": 2,
  "baduk_bets_total": 2
 },
 "TUNING": {
  "kkubeogi_cycle": 200,
  "kkubeogi_awake": 56,
  "kkubeogi_cue": 32,
  "field_move_speed": 1.7,
  "field_swing_speed": 0.7,
  "field_jump_velocity": -5.4,
  "field_drop_frames": 14,
  "field_drop_hang_frames": 14,
  "field_drop_hang_speed": 0.9,
  "field_drop_hang_ratio": 0.2,
  "field_drop_hang_min_frames": 4,
  "field_crawl_frames": 54,
  "field_gravity": 0.32,
  "field_fall_speed": 6,
  "field_slope_slip_grade": 0.45,
  "field_slope_slip_speed": 0.95,
  "field_slope_climb_speed": 0.8,
  "field_slope_slipback_every": 54,
  "field_slope_slipback_frames": 10,
  "field_edge_margin": 30,
  "field_talk_distance": 30,
  "field_dig_ahead": 12,
  "field_dig_distance": 16,
  "field_dig_height": 10,
  "field_swing_frames": 18,
  "field_swing_hit_at": 9,
  "field_hit_front": 2,
  "field_hit_back": 24,
  "field_hit_width": 22,
  "field_dig_padding": 6,
  "save_interval": 30000,
  "field_interact_y": 24,
  "zone_transition_frames": 18,
  "zone_slide_frames": 30,
  "zone_fade_out_frames": 16,
  "zone_fade_in_frames": 22,
  "depth_gate_open_frames": 20,
  "vista_pan_frames": 480,
  "map_flight_ms": 2000,
  "map_landing_margin": 40,
  "battle_bare_speed": 2.7,
  "battle_bare_cooldown": 16,
  "battle_bare_radius": 9,
  "battle_mark_radius": 13,
  "battle_mark_margin": 28,
  "battle_mark_spare": 6,
  "battle_iframes": 60,
  "battle_squirrel_speed": 3.3,
  "battle_squirrel_cooldown": 10,
  "battle_squirrel_radius": 7,
  "battle_goat_speed": 2.2,
  "battle_goat_cooldown": 18,
  "battle_goat_radius": 9,
  "battle_goat_damage_taken": 0.5,
  "battle_owl_speed": 2.5,
  "battle_owl_cooldown": 24,
  "battle_owl_radius": 12,
  "battle_owl_tell_lead": 30,
  "battle_deer_speed": 3.2,
  "battle_deer_cooldown": 16,
  "battle_deer_radius": 8,
  "battle_deer_iframes": 96,
  "battle_base_damage": 1,
  "battle_sharp_damage": 2,
  "battle_tool_good_damage": 2,
  "battle_tool_bad_mult": 0.5,
  "battle_hand_scale": 1.2,
  "golem_stone_chance": 0.1,
  "golem_stone_step": 0.075,
  "golem_stone_cap": 1,
  "golem_foot_rest": 110,
  "golem_arm_rest": 110,
  "golem_core_frames": 150,
  "golem_barrage_count": 12,
  "golem_barrage_count_armless": 7,
  "golem_snowball_damage": 0.334,
  "golem_stomp_clumps": 5,
  "golem_whip_tell": 58,
  "golem_whip_sweep": 30,
  "golem_light_tell": 72,
  "golem_light_frames": 300,
  "golem_light_beams": 2,
  "golem_light_beams_low": 3,
  "golem_light_width": 0.1,
  "golem_snowball_size_jitter": 0.5,
  "golem_snowball_fly_jitter": 0.4,
  "kudzu_stem_cut_chance": 0.4,
  "kudzu_root_dig_chance": 0.4,
  "kudzu_scent_damage": 0.5,
  "kudzu_scent_slow": 0.55,
  "kudzu_scent_slow_frames": 80,
  "kudzu_scent_linger": 150,
  "kudzu_hole_frames": 90,
  "nundok_spill_chance": 0.35,
  "toast_frames": 300,
  "name_card_ms": 3600,
  "peek_ms": 1400,
  "peek_fade_ms": 240,
  "peek_open_ms": 460,
  "hint_range": 150,
  "craft_motion_ms": 750,
  "drop_arc_height": 24,
  "drop_flight_frames": 28,
  "drop_min_spacing": 18,
  "drop_spread": 48,
  "drop_bounce_height": 3,
  "drop_bounce_frames": 10,
  "pickup_range": 28,
  "pickup_range_y": 20,
  "pickup_motion_frames": 15,
  "pickup_pull_frames": 8,
  "form_squirrel_speed": 1.2,
  "form_climb_speed": 1.6,
  "form_climb_reach": 10,
  "form_goat_jump": 1.4,
  "form_owl_glide_fall": 0.9,
  "form_owl_flap_velocity": 3.6,
  "form_owl_flaps": 1,
  "form_owl_sense_range": 56,
  "form_fx_frames": 24,
  "form_intro_ms": 5000,
  "form_gait_frames": 4,
  "snow_print_frames": 360,
  "snow_print_max": 48,
  "stranger_trade_limit": 2,
  "musoe_bonk_tell_first": 66,
  "musoe_bonk_tell_last": 34,
  "musoe_bonk_drop": 9,
  "musoe_bonk_gap": 26,
  "musoe_bonk_radius": 30,
  "musoe_fire_cycle": 300,
  "musoe_fire_warn": 70,
  "musoe_fire_burn": 80,
  "musoe_fire_radius": 22,
  "musoe_fire_heat": 36,
  "musoe_finale_bonks": 4,
  "musoe_finale_gap": 16,
  "musoe_finale_hold": 70,
  "roll_hold_ms": 230,
  "roll_speed": 1.8,
  "roll_squirrel_speed": 2,
  "roll_accel_frames": 10,
  "roll_step_frames": 9,
  "roll_boost_after": 60,
  "roll_boost_ramp": 40,
  "roll_boost_mult": 1.3,
  "roll_dizzy_after": 240,
  "roll_dizzy_frames": 75,
  "npc_move_out_ms": 1000,
  "npc_move_in_ms": 450,
  "npc_move_walk_px": 36,
  "npc_move_step_ms": 130,
  "npc_move_min_px": 12,
  "npc_move_window_ms": 1500,
  "wish_anim_side": 7,
  "wish_anim_hover": 6,
  "wish_anim_carry_frames": 50,
  "wish_anim_pause_frames": 20,
  "wish_anim_lower_frames": 30,
  "wish_anim_settle_frames": 24,
  "wish_anim_done_frames": 50,
  "music_duck": 0.5,
  "music_duck_in_s": 0.8,
  "music_duck_out_s": 1.6,
  "music_dialog_hold_ms": 600,
  "music_fade_return": 2,
  "music_story_min_ms": 8000,
  "battle_aim_left": 1,
  "battle_aim_up": 19,
  "battle_hitstop": 4,
  "gangcheol_namecall_first": 2,
  "gangcheol_namecall_every": 3,
  "gangcheol_namecall_tell_frames": 80,
  "gangcheol_namecall_after_frames": 60,
  "gangcheol_namecall_lock_frames": 36,
  "name_power_loss": 0.12,
  "name_power_min": 0.5,
  "name_speed_loss": 0.06,
  "name_speed_min": 0.6,
  "name_hand_fade": 0.07,
  "name_hand_fade_max": 0.5,
  "peek_sound_delay_ms": 180,
  "snow_burst_count": 10,
  "snow_burst_count_just": 16,
  "snow_burst_shake": 2,
  "snow_burst_shake_just": 4,
  "dlg_touch_advance_lock_ms": 220,
  "dlg_touch_choice_lock_ms": 450,
  "think_base_ms": 1800,
  "think_char_ms": 75,
  "think_far_px": 140,
  "form_otter_speed": 0.95,
  "form_otter_slide_speed": 1.5,
  "battle_otter_speed": 3.1,
  "battle_otter_cooldown": 16,
  "battle_otter_radius": 8,
  "name_call_interval_frames": 54,
  "name_call_move_px": 4,
  "name_final_hp_ratio": 0.35,
  "name_final_lock_frames": 150,
  "name_final_damage": 2,
  "name_final_open_bonus": 150,
  "y_lure_range": 90,
  "y_crane_range": 40,
  "y_crane_hold_frames": 150,
  "cine_card_ms": 1700,
  "cine_line_min_ms": 450,
  "cine_hold_skip_ms": 800,
  "cine_fade_ms": 520,
  "y_dad_revert_range": 60,
  "think_stop_base_ms": 700,
  "think_stop_char_ms": 35,
  "think_stop_max_ms": 2200,
  "gather_min_gap": 48,
  "gather_dig_interact_gap": 58,
  "gather_interact_gap": 42,
  "trade_tip_hold_ms": 350,
  "trade_tip_show_ms": 2400,
  "trade_haggle_on": 0,
  "name_call_third_frames": 60,
  "name_call_pull": 0.35,
  "name_call_move_px_torn": 14,
  "chasa_rope_count": 3,
  "chasa_rope_gap": 44,
  "chasa_rope_lash": 14,
  "chasa_rope_hold": 26,
  "chasa_rope_back": 14,
  "chasa_rope_hit": 7,
  "chasa_crow_waves": 3,
  "chasa_crow_speed": 4.4,
  "chasa_ledger_tell": 90,
  "chasa_ledger_frames": 420,
  "chasa_ledger_stroke_every": 34,
  "chasa_ledger_stroke_tell": 30,
  "chasa_ledger_light": 38,
  "chasa_seal_life": 180,
  "chasa_seal_bonus": 2,
  "chasa_rope_tell": 22,
  "chasa_rope_seek": 14,
  "chasa_rope_bind_frames": 150,
  "chasa_rope_cut_hits": 3,
  "chasa_rope_spot": 16,
  "chasa_rope_spot_slack": 4,
  "chasa_rope_tether": 12,
  "chasa_rope_bound_slow": 0.35,
  "chasa_crow_gap": 140,
  "chasa_crow_scout": 34,
  "chasa_crow_body": 230,
  "chasa_crow_band": 20,
  "chasa_crow_margin": 40,
  "chasa_crow_count": 110,
  "chasa_crow_sky": 220,
  "chasa_robe_frames": 300,
  "chasa_hand_every": 16,
  "chasa_hand_tell": 26,
  "chasa_hand_rise": 7,
  "chasa_hand_hold": 16,
  "chasa_hand_sink": 12,
  "chasa_hand_height": 34,
  "chasa_hand_hit": 7,
  "chasa_fire_tell_bonus": 10,
  "chasa_robe_dark": 0.66,
  "chasa_floor_life": 150,
  "chasa_core_reveal": 0.5,
  "chasa_core_life": 160,
  "name_echo_base": 5,
  "name_echo_step": 4,
  "name_echo_ring_gap": 9,
  "name_echo_in": 5,
  "name_echo_fade": 95,
  "name_hollow_speed": 0.1,
  "name_hollow_grip": 0.06,
  "name_hollow_twist": 0.75,
  "name_hollow_near": 26,
  "chasa_robe_wrap_frames": 40,
  "chasa_robe_tear_hits": 2,
  "chasa_robe_tear_frames": 210,
  "chasa_robe_squeeze_frames": 50,
  "chasa_robe_inside_dark": 0.97,
  "chasa_crow_bulge": 0.24,
  "chasa_crow_thick_min": 0.8,
  "chasa_crow_thick_max": 1.2,
  "rest_range": 22,
  "rest_toast_gap_ms": 20000,
  "rest_return_back": 16,
  "field_stamp_revisit_margin": 12,
  "nundok_revert_frames": 40,
  "nundok_veil_body": 0,
  "nundok_veil_attack": 0.45,
  "food_guard_step": 1,
  "food_swift_step": 0.15,
  "food_strong_step": 0.25,
  "food_eye_step": 0.3,
  "food_kind_step": 0.25
 },
 "PROGRESS": [
  {
   "region": "galchamgol",
   "done": "dodamDone",
   "options": [
    {
     "powder": 1
    }
   ]
  },
  {
   "region": "galchamgol",
   "done": "nalDone",
   "options": [
    {
     "powder": 1
    }
   ]
  },
  {
   "region": "galchamgol",
   "done": "nalDone",
   "options": [
    {
     "root": 1
    }
   ]
  },
  {
   "region": "galchamgol",
   "done": "musoeDone",
   "options": [
    {
     "coal": 1
    }
   ]
  },
  {
   "region": "galchamgol",
   "done": "ended",
   "options": [
    {
     "meoru": 1
    }
   ]
  },
  {
   "region": "dolneomeo",
   "done": "nalDDone",
   "options": [
    {
     "kflower": 1
    },
    {
     "gyeousari": 2
    }
   ]
  },
  {
   "region": "dolneomeo",
   "done": "kkuDone",
   "options": [
    {
     "eoksae": 3
    }
   ]
  },
  {
   "region": "yeongsan",
   "done": "seolpi",
   "options": [
    {
     "eoksae": 2
    },
    {
     "jip": 1
    }
   ]
  },
  {
   "region": "dolneomeo",
   "done": "ppuriPassed",
   "options": [
    {
     "memil_powder": 1
    }
   ]
  },
  {
   "region": "jangteo",
   "done": "nalJDone",
   "options": [
    {
     "memil_powder": 1
    },
    {
     "ssal_powder": 1
    }
   ]
  },
  {
   "region": "dolneomeo",
   "done": "dolsoeTea",
   "options": [
    {
     "gyeolmyeongja": 1
    }
   ]
  },
  {
   "region": "dolneomeo",
   "done": "yakMade",
   "options": [
    {
     "darae_yak": 1
    }
   ]
  },
  {
   "region": "jangteo",
   "done": "yeotDone",
   "options": [
    {
     "solbang": 5
    }
   ]
  },
  {
   "region": "jangteo",
   "done": "morakPowder",
   "options": [
    {
     "ssal_powder": 3
    }
   ]
  },
  {
   "region": "jangteo",
   "done": "bueongDone",
   "options": [
    {
     "patsirutteok": 1
    }
   ]
  },
  {
   "region": "jangteo",
   "done": "ended",
   "options": [
    {
     "sinpyo": 1
    }
   ]
  },
  {
   "region": "yeongsan",
   "done": "seolpi",
   "options": [
    {
     "broom_sal": 1
    },
    {
     "darae_vine": 2
    }
   ]
  },
  {
   "region": "yeongsan",
   "done": "shortcut",
   "options": [
    {
     "kong": 2
    },
    {
     "magamok": 3
    }
   ]
  },
  {
   "region": "yeongsan",
   "done": "yakDone",
   "options": [
    {
     "doerim_yak": 1
    }
   ]
  }
 ],
 "ZONES": {
  "galchamgol": {
   "village": "집·마을 어귀",
   "forge": "대장간 길",
   "forest": "참나무 숲",
   "hill": "당산나무 언덕"
  },
  "dolneomeo": {
   "gate": "장승 고갯길",
   "village": "돌너머 마을",
   "field": "메밀밭·둥지",
   "cliff": "돌산 절벽길",
   "shrine": "성황당 돌탑"
  },
  "jangteo": {
   "entrance": "장터 입구",
   "street": "장터 거리",
   "inn": "보부상 숙소",
   "pine": "뒷산 솔숲",
   "warehouse": "창고 뒷길"
  },
  "yeongsan": {
   "shelter": "영산 어귀",
   "snow": "깊은 눈길",
   "slope": "얼어붙은 비탈",
   "shore": "호숫가",
   "island": "신목 섬"
  }
 },
 "STOCK": [
  {
   "id": "s_gal_nal_acorn",
   "region": "galchamgol",
   "npc": "nal",
   "item": "acorn",
   "n": 2,
   "times": 3
  },
  {
   "id": "s_gal_dodam_acorn",
   "region": "galchamgol",
   "npc": "dodam",
   "item": "acorn",
   "n": 1,
   "times": 3
  },
  {
   "id": "s_gal_toad_kkoe",
   "region": "galchamgol",
   "npc": "toad",
   "item": "kkoe",
   "n": 1,
   "times": 1
  },
  {
   "id": "s_dol_nal_memil",
   "region": "dolneomeo",
   "npc": "nal",
   "item": "memil",
   "n": 2,
   "times": 3
  },
  {
   "id": "s_dol_dolsoe_dust",
   "region": "dolneomeo",
   "npc": "dolsoe",
   "item": "stonedust",
   "n": 1,
   "times": 2
  },
  {
   "id": "s_jang_nal_mung",
   "region": "jangteo",
   "npc": "nal",
   "item": "mung",
   "n": 1,
   "times": 2
  },
  {
   "id": "s_jang_yeot_ssal",
   "region": "jangteo",
   "npc": "yeotbang",
   "item": "ssal",
   "n": 1,
   "times": 3
  },
  {
   "id": "s_jang_morak_yakgwa",
   "region": "jangteo",
   "npc": "morak",
   "item": "yakgwa",
   "n": 1,
   "times": 1
  },
  {
   "id": "s_yeong_nal_magamok",
   "region": "yeongsan",
   "npc": "nal",
   "item": "magamok",
   "n": 1,
   "times": 2
  }
 ],
 "HAGGLE": {
  "dodam": {
   "허세": {
    "all": {
     "kind": "싫어함",
     "kid": "흥, 도토리야 아무 데나 굴러다니잖아.",
     "line": "뭐? 아무 데나? 내가 하나하나 고른 거야! 흥정은 안 해!"
    }
   },
   "사정": {
    "all": {
     "kind": "그저 그럼",
     "kid": "엄마가 아파서 그래. 조금만 더 줄 수 있어?",
     "line": "어, 그러니까… 그건 안됐다! 근데 값은 값이래. 우리 할머니가 그랬어!"
    }
   },
   "칭찬": {
    "all": {
     "kind": "좋아함",
     "kid": "네 도토리는 알이 다 굵네.",
     "line": "그치? 제일 굵은 것만 골랐거든! 하나 더 얹어 줄게!"
    }
   }
  },
  "nal": {
   "허세": {
    "galchamgol": {
     "kind": "좋아함",
     "kid": "흥, 촌구석 숯이 다 그렇지.",
     "line": "뭐? 촌구석? 좋아, 바꿔 가 봐. 내 숯이 어떤지 보여 줄 테니까."
    },
    "dolneomeo": {
     "kind": "좋아함",
     "kid": "칡꽃? 단풍골엔 흔한데.",
     "line": "허, 꼬마 보부상이 허세는. 좋아, 바꾸면 결명자 하나 더 얹어 줄게."
    },
    "jangteo": {
     "kind": "좋아함",
     "kid": "흥, 팥 한 되가 뭐 그리 귀해!",
     "line": "하! 내 팥이 시시하다고? 좋아, 거래하면 한 되 더 얹어 줄게."
    },
    "yeongsan": {
     "kind": "그저 그럼",
     "kid": "흥, 설피쯤이야 나도 엮을 줄 알아요.",
     "line": "허세는 접어 둬. 이젠 보부상끼리 제값이야."
    },
    "all": {
     "kind": "좋아함",
     "kid": "흥, 이만한 물건이야 어디서든 구하지.",
     "line": "어디서든? 좋아, 그 말 후회하게 하나 더 얹어 주지."
    }
   },
   "사정": {
    "all": {
     "kind": "싫어함",
     "kid": "엄마가 아파서 그래요. 조금만 깎아 주세요.",
     "line": "사정 없는 보부상이 어디 있어. 장사는 장사야. 흥정은 끝."
    }
   },
   "칭찬": {
    "all": {
     "kind": "그저 그럼",
     "kid": "아저씨 지게는 물건이 참 많네요.",
     "line": "알아. 입에 발린 소리로는 덤 안 나와."
    }
   }
  },
  "toad": {
   "허세": {
    "all": {
     "kind": "싫어함",
     "kid": "이런 건 우리 동네에도 흔해요.",
     "line": "흔하면 거기서 구하려무나. 흥정은 그만두자."
    }
   },
   "사정": {
    "all": {
     "kind": "그저 그럼",
     "kid": "엄마가 아파서 그래요. 조금만 더요.",
     "line": "아픈 사연이야 여기 오는 이마다 들고 오지. 값은 그대로란다."
    }
   },
   "칭찬": {
    "all": {
     "kind": "좋아함",
     "kid": "할머니 약 냄새는 멀리서도 알겠어요.",
     "line": "허허, 코가 좋구나. 그 코 값으로 조금 얹어 주마."
    }
   }
  },
  "kkubeogi": {
   "허세": {
    "all": {
     "kind": "싫어함",
     "kid": "흥, 이런 건 어디든 있어!",
     "line": "…시끄러… 흥정 안 해… 쿨…"
    }
   },
   "사정": {
    "all": {
     "kind": "좋아함",
     "kid": "나 길이 멀어. 조금만 더 줄래?",
     "line": "으음… 먼 길이구나… 내 둥지 옆에서 쉬다 가… 쿨…"
    }
   },
   "칭찬": {
    "all": {
     "kind": "그저 그럼",
     "kid": "네 둥지 참 포근해 보인다.",
     "line": "응… 포근해… 근데 값은 그대로야…"
    }
   }
  },
  "dolsoe": {
   "허세": {
    "all": {
     "kind": "싫어함",
     "kid": "이 정도 돌은 아무 데나 굴러다녀요.",
     "line": "…돌은 다 제자리가 있다. 흥정은 그만하자."
    }
   },
   "사정": {
    "all": {
     "kind": "그저 그럼",
     "kid": "엄마가 아파서 그래요.",
     "line": "…그래. 그래도 값은 맞춰야지."
    }
   },
   "칭찬": {
    "all": {
     "kind": "좋아함",
     "kid": "할배 돌탑은 손으로만 쌓았는데도 반듯해요.",
     "line": "…손끝이 기억하는 게지. 하나 더 쥐여 주마."
    }
   }
  },
  "ppuri": {
   "허세": {
    "all": {
     "kind": "싫어함",
     "kid": "산양 뿔쯤이야 하나도 안 무서워요.",
     "line": "…장승 앞에서는 말을 가려라. 흥정은 없다."
    }
   },
   "사정": {
    "all": {
     "kind": "좋아함",
     "kid": "아빠 길을 따라가야 해서요. 사정 좀 봐 주세요.",
     "line": "원칙은 원칙이다. 다만 네 사정은 기억해 두마."
    }
   },
   "칭찬": {
    "all": {
     "kind": "그저 그럼",
     "kid": "장승이 참 늠름해요.",
     "line": "장승은 칭찬 듣자고 서 있는 게 아니다. 값은 그대로다."
    }
   }
  },
  "yeotbang": {
   "허세": {
    "all": {
     "kind": "좋아함",
     "kid": "엿장수 마음대로라면서요? 저도 제 마음대로 할래요.",
     "line": "어머, 이 꼬마 봐라~ 말이 통하네. 하나 더 얹어 주지~"
    }
   },
   "사정": {
    "all": {
     "kind": "싫어함",
     "kid": "엄마가 아파서요. 조금만 깎아 주세요.",
     "line": "아이고~ 대목에 우는소리는 질색이야. 흥정은 끝~"
    }
   },
   "칭찬": {
    "all": {
     "kind": "그저 그럼",
     "kid": "엿가락이 참 윤이 나네요.",
     "line": "그거야 당연하지~ 값은 그대로야~"
    }
   }
  },
  "morak": {
   "허세": {
    "all": {
     "kind": "싫어함",
     "kid": "떡이야 집에서도 쪄 먹어요.",
     "line": "그럼 집에서 쪄 먹어! 바빠 죽겠는데 흥정은 무슨!"
    }
   },
   "사정": {
    "all": {
     "kind": "그저 그럼",
     "kid": "엄마가 아파서요.",
     "line": "에구, 안됐네. 그래도 대목이라 값은 못 깎아."
    }
   },
   "칭찬": {
    "all": {
     "kind": "좋아함",
     "kid": "아주머니 떡은 김만 맡아도 배불러요.",
     "line": "하하! 말 한번 예쁘게 하네! 하나 더 가져가!"
    }
   }
  },
  "bueong": {
   "허세": {
    "all": {
     "kind": "그저 그럼",
     "kid": "이 정도 짐은 저 혼자서도 다 날라요.",
     "line": "혼자서 다 나르는 보부상은 없다. 값은 그대로다."
    }
   },
   "사정": {
    "all": {
     "kind": "좋아함",
     "kid": "아빠를 찾는 길이라 짐이 모자라요.",
     "line": "보부상끼리는 서로 사정을 봐주는 법이다. 장부에 적어 두마."
    }
   },
   "칭찬": {
    "all": {
     "kind": "싫어함",
     "kid": "영감님 장부는 글씨가 참 반듯해요.",
     "line": "장부는 칭찬받자고 적는 게 아니다. 흥정은 여기까지."
    }
   }
  },
  "salgeumi": {
   "허세": {
    "all": {
     "kind": "싫어함",
     "kid": "흥! 이 산에 무서운 건 하나도 없어요!",
     "line": "쉿! 크게 말하지 마… 흥정은 그만해."
    }
   },
   "사정": {
    "all": {
     "kind": "그저 그럼",
     "kid": "아빠를 찾고 있어요.",
     "line": "…알아. 그래도 내 몫도 모자라."
    }
   },
   "칭찬": {
    "all": {
     "kind": "좋아함",
     "kid": "귀가 밝으시네요. 멀리서 오는 소리도 다 들리세요?",
     "line": "어, 응… 그런 말은 처음 들어. 고마워."
    }
   }
  }
 },
 "GIFT_RECIPES": [
  {
   "id": "g_gal_toad",
   "region": "galchamgol",
   "npc": "toad",
   "out": "gyeol_hwan",
   "way": "직접",
   "lines": [
    [
     0,
     "받기만 하면 쓰나. 손바닥 펴 보렴."
    ],
    [
     0,
     "결명자를 꿀에 개어 절구에 찧으면 콩알만 한 환이 된단다. 눈이 침침할 때 한 알씩 먹지."
    ],
    [
     0,
     "언제고 둘 다 손에 들어오거든 빚어 두렴. 연기를 많이 마시는 이한테 그만이란다."
    ]
   ]
  },
  {
   "id": "g_gal_otter",
   "region": "galchamgol",
   "npc": "stream_otter",
   "out": "songibap",
   "way": "소문",
   "lines": [
    [
     0,
     "있잖아, 빨래 아줌마가 그랬어. 송이는 쌀이랑 같이 쪄야 향이 안 날아간대."
    ],
    [
     0,
     "쌀 두 줌에 송이 하나! 또박또박 외웠어. 너도 외울 수 있어?"
    ]
   ]
  },
  {
   "id": "g_gal_musoe",
   "region": "galchamgol",
   "npc": "musoe",
   "out": "gongi",
   "way": "혼잣말",
   "lines": [
    [
     0,
     "…어릴 때 형이랑 냇가 차돌을 주워다 절구에 찧었다."
    ],
    [
     0,
     "두 개 찧으면 공깃돌이 다섯 개 나왔지. …형이 늘 이겼다."
    ],
    [
     1,
     "(삼촌이 혼잣말처럼 흘린 말이다. 차돌 두 개를 절구에 찧으면 공깃돌이 되나 보다.)"
    ]
   ]
  },
  {
   "id": "g_gal_geomdaeng",
   "region": "galchamgol",
   "npc": "charcoal_badger",
   "out": "jjimjil_dol",
   "way": "직접",
   "lines": [
    [
     0,
     "받았으면 셈은 해야지. 하나 일러 주마."
    ],
    [
     0,
     "구들돌을 숯불에 달궈 억새꽃 솜에 싸서 찌면 찜질 돌이 된다. 밤새 안 식는다."
    ],
    [
     0,
     "…언 다리에 대면 좋다. 콜록."
    ]
   ]
  },
  {
   "id": "g_gal_dodam",
   "region": "galchamgol",
   "npc": "dodam",
   "out": "beoseot_jjim",
   "way": "소문",
   "lines": [
    [
     0,
     "고마워! 대신 내가 들은 거 알려 줄게!"
    ],
    [
     0,
     "숯가마 쪽에선 싸리버섯이랑 꾀꼬리버섯에 깨소금 쳐서 쪄 먹는대! 지나가면 맨날 그 냄새 나거든!"
    ]
   ]
  },
  {
   "id": "g_gal_nal",
   "region": "galchamgol",
   "npc": "nal",
   "out": "sesame_salt",
   "way": "쪽지",
   "lines": [
    [
     0,
     "…흥. 받은 건 받은 거고."
    ],
    [
     1,
     "(날쌘이 보따리에 쪽지 한 장을 툭 넣고 돌아섰다. 깨 하나, 소금 하나, 절구에.)"
    ]
   ]
  },
  {
   "id": "g_dol_dolsoe",
   "region": "dolneomeo",
   "npc": "dolsoe",
   "out": "okgaru",
   "way": "직접",
   "lines": [
    [
     0,
     "이리 손 좀 다오."
    ],
    [
     0,
     "골렘 가슴께에 푸른 돌이 박혀 있다더구나. 옥돌이지. 맷돌에 한 바퀴 갈면 옥가루가 된다."
    ],
    [
     0,
     "갈린 가루가 손끝에 밀가루처럼 닿으면 다 된 게다. 기억해 두거라."
    ]
   ]
  },
  {
   "id": "g_dol_kkubeogi",
   "region": "dolneomeo",
   "npc": "kkubeogi",
   "out": "jatjuk",
   "way": "혼잣말",
   "lines": [
    [
     0,
     "고마워어… 이제 자도 되겠다아…"
    ],
    [
     0,
     "겨울잠 들기 전엔… 쌀이랑 잣을… 맷돌에 같이 갈아서… 죽 한 그릇 먹고 자는 거야아…"
    ],
    [
     1,
     "(졸린 말 속에 잣죽 쑤는 법이 섞여 있었다. 쌀과 잣을 맷돌에 같이 가나 보다.)"
    ]
   ]
  },
  {
   "id": "g_dol_turtle",
   "region": "dolneomeo",
   "npc": "dol_turtle",
   "out": "heuk_banjuk",
   "way": "직접",
   "lines": [
    [
     0,
     "고맙다, 아가. 하나 일러 주마."
    ],
    [
     0,
     "진흙 덩이에 돌가루, 마른 억새를 같이 찧으면 둑을 메우는 흙이 된단다."
    ],
    [
     0,
     "이제 내 손으론 못 찧는구나."
    ]
   ]
  },
  {
   "id": "g_dol_badger",
   "region": "dolneomeo",
   "npc": "dol_badger",
   "out": "seogibyeong",
   "way": "직접",
   "lines": [
    [
     0,
     "…잠깐 봐라."
    ],
    [
     1,
     "(메밀댁이 말없이 가루를 뭉쳐 석이 한 쪽을 얹고 시루에 찌는 시늉을 한다.)"
    ],
    [
     0,
     "쌀가루에 석이 섞어 쪄라. 석이병이다."
    ]
   ]
  },
  {
   "id": "g_dol_ppuri",
   "region": "dolneomeo",
   "npc": "ppuri",
   "out": "dol_mulgam",
   "way": "직접",
   "lines": [
    [
     0,
     "받았으면 갚는 법이다."
    ],
    [
     0,
     "이끼 낀 눈돌을 참기름에 개어 맷돌에 갈아라. 장승 눈에 올리는 빛이 그것이다."
    ]
   ]
  },
  {
   "id": "g_dol_nal",
   "region": "dolneomeo",
   "npc": "nal",
   "out": "gyeol_hwan",
   "way": "쪽지",
   "lines": [
    [
     0,
     "…셈은 나중에 하자."
    ],
    [
     1,
     "(날쌘이 또 쪽지를 툭 떨구고 갔다. 결명자 하나, 꿀 하나, 절구에. 길에서 먹기 좋음.)"
    ]
   ]
  },
  {
   "id": "g_jang_yeot",
   "region": "jangteo",
   "npc": "yeotbang",
   "out": "gangjeong",
   "way": "소문",
   "lines": [
    [
     0,
     "에헤, 받았으니 엿장수 비법 하나 풀어 볼까~?"
    ],
    [
     0,
     "비법은 무슨~ 장터 사람이면 다 아는 거야. 깨를 꿀에 버무려 절구에 꾹꾹 찧으면 깨강정이지~"
    ],
    [
     0,
     "내가 알려 줬다고는 하지 마~ 엿값 떨어지니까!"
    ]
   ]
  },
  {
   "id": "g_jang_morak",
   "region": "jangteo",
   "npc": "morak",
   "out": "rainbow_tteok",
   "way": "직접",
   "lines": [
    [
     0,
     "이리 와 봐, 이리 와!"
    ],
    [
     0,
     "무지개떡은 켜켜이 따로 앉히는 거야! 도토리 가루, 팥, 마가목 열매를 시루에 한 켜씩! 한 켜씩!"
    ],
    [
     0,
     "마가목은 영산 가야 나니까, 거기 가거든 꼭 해 봐!"
    ]
   ]
  },
  {
   "id": "g_jang_bueong",
   "region": "jangteo",
   "npc": "bueong",
   "out": "solbang_cheong",
   "way": "쪽지",
   "lines": [
    [
     0,
     "빈손으로 받을 수는 없지. 장부에 적힌 걸 하나 떼어 주마."
    ],
    [
     1,
     "(부엉 영감님이 장부 한 장을 찢어 건넨다.)"
    ],
    [
     1,
     "(상단 겨울 길 상비약. 솔방울 둘에 석청 하나, 절구에 찧어 잰다.)"
    ],
    [
     0,
     "기침 나는 길손에게 한 숟갈씩 팔던 것이지."
    ]
   ]
  },
  {
   "id": "g_jang_deungjan",
   "region": "jangteo",
   "npc": "deungjan",
   "out": "seogibyeong",
   "way": "소문",
   "lines": [
    [
     0,
     "고마워! 밤길에 들은 얘기 하나 줄게!"
    ],
    [
     0,
     "돌너머 메밀댁은 쌀가루에 석이를 섞어 시루에 쪄 낸대! 석이병이라나!"
    ],
    [
     0,
     "짐꾼들이 그거 얻어먹으려고 줄을 선다지!"
    ]
   ]
  },
  {
   "id": "g_jang_haengsu",
   "region": "jangteo",
   "npc": "haengsu",
   "out": "songibap",
   "way": "직접",
   "lines": [
    [
     0,
     "받은 셈은 갚아야지. 상단 밥 하나 일러 주마."
    ],
    [
     0,
     "쌀 두 줌에 송이 하나를 찢어 얹어 시루에 찐다. 송이밥이다. 먼 길엔 이만한 밥이 없지."
    ]
   ]
  },
  {
   "id": "g_jang_jongjong",
   "region": "jangteo",
   "npc": "jongjong",
   "out": "beoseot_jjim",
   "way": "혼잣말",
   "lines": [
    [
     0,
     "고, 고마워요…"
    ],
    [
     0,
     "(작게) 엄마는 싸리버섯이랑 꾀꼬리버섯에 깨소금 쳐서 쪄 줬는데… 그거 먹으면 밤에도 안 졸았는데…"
    ],
    [
     1,
     "(종종이가 혼잣말로 흘린 말이다. 버섯 두 가지에 깨소금을 쳐서 시루에 찌나 보다.)"
    ]
   ]
  },
  {
   "id": "g_jang_jjandol",
   "region": "jangteo",
   "npc": "jjandol",
   "out": "meju",
   "way": "소문",
   "lines": [
    [
     0,
     "…맨입으론 안 받는다. 들은 거나 하나 알려 주지."
    ],
    [
     0,
     "장국밥 할멈네는 콩 두 됫박을 절구에 찧고 짚으로 묶어 메주를 빚더라. 소금은 내 거 쓰고."
    ]
   ]
  },
  {
   "id": "g_jang_nal",
   "region": "jangteo",
   "npc": "nal",
   "out": "mung_batter",
   "way": "쪽지",
   "lines": [
    [
     0,
     "…또 뭘 줘."
    ],
    [
     1,
     "(날쌘이 쪽지를 내 손에 쥐여 주고 고개를 돌렸다. 녹두 하나, 참기름 하나, 맷돌에. 떡집에서 사 감.)"
    ]
   ]
  },
  {
   "id": "g_yeong_salgeumi",
   "region": "yeongsan",
   "npc": "salgeumi",
   "out": "hwachae",
   "way": "혼잣말",
   "lines": [
    [
     0,
     "(귀를 쫑긋 세웠다가 내린다.) 고, 고마워…"
    ],
    [
     0,
     "(귀를 늘어뜨리고 혼자 중얼거린다.) 고드름 조각에… 마가목 두 알… 찧어서 띄우면… 시원한데…"
    ],
    [
     1,
     "(살금이가 혼잣말로 흘린 말이다. 고드름 조각과 마가목 열매 두 알을 절구에 찧나 보다.)"
    ]
   ]
  },
  {
   "id": "g_yeong_ongdal",
   "region": "yeongsan",
   "npc": "ongdal",
   "out": "bigeul_garu",
   "way": "소문",
   "lines": [
    [
     0,
     "받기만 하믄 쓰나. 들은 거 하나 일러 주지."
    ],
    [
     0,
     "언 까마귀 깃하고 고드름 조각은 맷돌에 같이 갈아야 쓰는겨. 옛날 산사람들은 그 가루를 열 오른 이마에 얹었구먼."
    ]
   ]
  },
  {
   "id": "g_yeong_nal",
   "region": "yeongsan",
   "npc": "nal",
   "out": "ssanghwa",
   "way": "쪽지",
   "lines": [
    [
     0,
     "…추운데 뭘 이런 걸."
    ],
    [
     1,
     "(날쌘이 보따리 끈에 쪽지를 끼우고 갔다. 칡뿌리, 겨우살이, 대추 하나씩, 맷돌에. 산 위는 춥다.)"
    ]
   ]
  }
 ],
 "SCENE_MUSIC": {
  "g_musoe_night": {
   "music": "father",
   "from": 0
  },
  "j_nal_ledger": {
   "music": "",
   "from": 0
  },
  "y_nal_confess": {
   "music": "father",
   "from": 0
  },
  "y_dad_reunion": {
   "music": "father",
   "from": 1
  },
  "y_dad_ledger": {
   "music": "father",
   "from": 0
  },
  "y_sangun_story": {
   "music": "theme",
   "from": 0
  },
  "y_sangun_name": {
   "music": "theme",
   "from": 0
  },
  "y_give_name": {
   "music": "theme",
   "from": 0
  },
  "y_dad_back": {
   "music": "father",
   "from": 0
  },
  "y_dad_palm": {
   "music": "father",
   "from": 0
  }
 },
 "MUSIC_LAYERS": {
  "danpunggol": {
   "layers": {
    "base": [
     "melody",
     "bass",
     "stream",
     "low_string"
    ],
    "longing": [
     "answer"
    ],
    "pulse": [
     "janggu_low",
     "janggu_high",
     "moduk_low",
     "moduk_mid"
    ]
   },
   "tempos": [
    1,
    1.12
   ]
  },
  "dolneomeo": {
   "layers": {
    "base": [
     "melody",
     "bass",
     "air",
     "low_string"
    ],
    "longing": [
     "answer",
     "bowed"
    ],
    "pulse": [
     "stone",
     "moduk_low",
     "moduk_mid"
    ]
   },
   "tempos": [
    1,
    1.1
   ]
  },
  "market_day": {
   "layers": {
    "base": [
     "melody",
     "bass",
     "low_string"
    ],
    "longing": [
     "answer",
     "bowed"
    ],
    "pulse": [
     "janggu_low",
     "janggu_high",
     "janggu_roll",
     "small_gong",
     "scissors",
     "moduk_low",
     "moduk_mid"
    ]
   },
   "tempos": [
    1,
    1.06
   ]
  },
  "market_night": {
   "layers": {
    "base": [
     "melody",
     "bass",
     "air"
    ],
    "longing": [
     "answer"
    ],
    "pulse": [
     "soft_drum"
    ]
   },
   "tempos": [
    1,
    1.1
   ]
  },
  "yeongsan": {
   "layers": {
    "base": [
     "melody",
     "air"
    ],
    "longing": [
     "low_string"
    ],
    "pulse": [
     "moduk_low",
     "moduk_mid"
    ]
   },
   "tempos": [
    1,
    1.1
   ]
  },
  "yeongsan_spring": {
   "layers": {
    "base": [
     "melody",
     "bass",
     "piri_answer",
     "chime"
    ],
    "longing": [
     "answer",
     "bowed_answer"
    ],
    "pulse": [
     "janggu_low",
     "janggu_high",
     "deong",
     "gong",
     "small_gong",
     "buk"
    ]
   },
   "tempos": [
    1,
    1
   ]
  },
  "boss_kudzu": {
   "layers": {
    "base": [
     "melody",
     "bass",
     "arp",
     "low_string"
    ],
    "longing": [
     "answer"
    ],
    "pulse": [
     "janggu_low",
     "janggu_high",
     "vine_stroke",
     "moduk_low",
     "moduk_mid"
    ]
   },
   "tempos": [
    0.94,
    1,
    1.05,
    1.1
   ]
  },
  "boss_golem": {
   "layers": {
    "base": [
     "melody",
     "bass",
     "arp",
     "low_string"
    ],
    "longing": [
     "answer"
    ],
    "pulse": [
     "rock",
     "buk",
     "jing",
     "moduk_low",
     "moduk_mid"
    ]
   },
   "tempos": [
    0.94,
    1,
    1.06,
    1.12
   ]
  },
  "boss_dokkaebi": {
   "layers": {
    "base": [
     "melody",
     "bass",
     "arp",
     "low_string"
    ],
    "longing": [
     "answer"
    ],
    "pulse": [
     "janggu_low",
     "janggu_high",
     "roll",
     "small_gong",
     "scissors",
     "moduk_low",
     "moduk_mid"
    ]
   },
   "tempos": [
    0.95,
    1,
    1.03,
    1.06
   ]
  },
  "boss_steel": {
   "layers": {
    "base": [
     "melody",
     "bass",
     "arp",
     "low_string",
     "winter_air"
    ],
    "longing": [
     "answer"
    ],
    "pulse": [
     "buk",
     "cold_gong",
     "moduk_low",
     "moduk_mid"
    ]
   },
   "tempos": [
    0.94,
    1,
    1.05,
    1.1
   ]
  },
  "trial_iron": {
   "layers": {
    "base": [
     "melody",
     "bass",
     "arp",
     "bellows"
    ],
    "longing": [
     "low_string"
    ],
    "pulse": [
     "hammer",
     "buk",
     "moduk_low",
     "moduk_mid"
    ]
   },
   "tempos": [
    0.94,
    1,
    1.06,
    1.12
   ]
  }
 },
 "POPUP_SOUNDS": {
  "village_well": {
   "sfx": "water_drop"
  },
  "village_wheel": {
   "sfx": "water_trickle",
   "repeat": 1800
  },
  "forge_sign": {
   "sfx": "wood_tap"
  },
  "forge_charcoal": {
   "sfx": "fire_crackle",
   "repeat": 1500
  },
  "forest_root": {
   "sfx": "leaf_rustle"
  },
  "forest_oak": {
   "sfx": "leaf_rustle",
   "repeat": 2200
  },
  "forest_trail": {
   "sfx": "cloth_flutter",
   "repeat": 1900
  },
  "forest_mother": {
   "sfx": "leaf_rustle",
   "repeat": 2000
  },
  "hill_grass": {
   "sfx": "leaf_rustle"
  },
  "hill_cloth": {
   "sfx": "cloth_flutter",
   "repeat": 1900
  },
  "hill_fruit": {
   "sfx": "leaf_rustle"
  },
  "hill_north": {
   "sfx": "wood_tap"
  },
  "pic_bojagi": {
   "sfx": "cloth_flutter"
  },
  "pic_hamjibak": {
   "sfx": "water_trickle"
  },
  "pic_hamjibak_stamp": {
   "sfx": "wood_tap"
  },
  "pic_mom_room": {
   "sfx": "door"
  },
  "pic_leaf": {
   "sfx": "leaf_rustle"
  },
  "pic_cache": {
   "sfx": "leaf_rustle"
  },
  "pic_gam_pole": {
   "sfx": "leaf_rustle"
  },
  "pic_sickle": {
   "sfx": "sickle"
  },
  "frost_print": {
   "sfx": "footstep_frost"
  },
  "gate_bell": {
   "sfx": "wind_bell",
   "repeat": 1300
  },
  "stone_channel": {
   "sfx": "water_trickle",
   "repeat": 1800
  },
  "mill_edge": {
   "sfx": "stone_knock"
  },
  "warm_hearth": {
   "sfx": "fire_crackle",
   "repeat": 1400
  },
  "memil_stubble": {
   "sfx": "leaf_rustle"
  },
  "tied_reeds": {
   "sfx": "leaf_rustle"
  },
  "nest_door": {
   "sfx": "stone_knock"
  },
  "silver_lichen": {
   "sfx": "stone_knock"
  },
  "frozen_trickle": {
   "sfx": "ice_tinkle"
  },
  "dry_crack": {
   "sfx": "wind_gust"
  },
  "wish_cloth": {
   "sfx": "cloth_flutter",
   "repeat": 1900
  },
  "grain_dish": {
   "sfx": "clay_ring"
  },
  "small_tower": {
   "sfx": "stone_knock"
  },
  "pic_wish_tower": {
   "sfx": "stone_knock"
  },
  "pic_maetdol_turn": {
   "sfx": "mill",
   "repeat": 3200
  },
  "pic_mole_chisel": {
   "sfx": "stone_knock"
  },
  "j_jangseung_snow": {
   "sfx": "wood_tap"
  },
  "j_stall_gap": {
   "sfx": "cloth_flutter"
  },
  "j_onggi": {
   "sfx": "onggi_ring"
  },
  "j_steam_flour": {
   "sfx": "steamer"
  },
  "j_inn_pillar": {
   "sfx": "wood_tap"
  },
  "j_inn_stable": {
   "sfx": "leaf_rustle"
  },
  "j_pine_scent1": {
   "sfx": "leaf_rustle"
  },
  "j_pine_scent2": {
   "sfx": "leaf_rustle"
  },
  "j_pine_scale": {
   "sfx": "wood_tap"
  },
  "j_warehouse_rope": {
   "sfx": "cloth_flutter"
  },
  "j_warehouse_fire": {
   "sfx": "fire_crackle"
  },
  "j_warehouse_scratches": {
   "sfx": "leaf_rustle"
  },
  "pic_kite": {
   "sfx": "cloth_flutter",
   "repeat": 1600
  },
  "pic_siru_steam": {
   "sfx": "steamer",
   "repeat": 1800
  },
  "y_slope_hoof": {
   "sfx": "footstep_snow"
  },
  "y_shore_boat": {
   "sfx": "water_trickle"
  },
  "y_shore_bowl": {
   "sfx": "stone_knock"
  },
  "y_shore_prints": {
   "sfx": "footstep_snow"
  },
  "y_tree_rope": {
   "sfx": "cloth_flutter",
   "repeat": 1900
  },
  "y_tree_root": {
   "sfx": "wood_tap"
  },
  "y_tree_bud": {
   "sfx": "leaf_rustle"
  },
  "pic_baduk_flip": {
   "sfx": "baduk_scatter"
  },
  "pic_magpie_roofs": {
   "sfx": "wind_gust"
  },
  "pic_gukbap": {
   "sfx": "fire_crackle",
   "repeat": 1500
  }
 }
};
