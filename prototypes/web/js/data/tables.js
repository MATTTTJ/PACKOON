'use strict';
/* 자동으로 만든 파일이다. 직접 고치지 말고 design/data/*.csv 를 고친 뒤 node prototypes/web/tools/build-data.js 를 돌린다 */
const TABLES={
 "ITEMS": {
  "acorn": {
   "n": "도토리",
   "r": 0,
   "kind": "재료",
   "region": "galchamgol",
   "d": "참나무 열매. 떫어서 그냥은 못 먹고 가루로 빻아 쓴다."
  },
  "powder": {
   "n": "도토리 가루",
   "r": 1,
   "kind": "재료",
   "region": "galchamgol",
   "d": "절구로 빻은 도토리. 단풍골에서 잘 팔린다."
  },
  "root": {
   "n": "칡뿌리",
   "r": 1,
   "kind": "재료",
   "region": "galchamgol",
   "d": "땅속 깊이 뻗은 칡의 뿌리. 질기고 달다."
  },
  "coal": {
   "n": "숯",
   "r": 1,
   "kind": "재료",
   "region": "galchamgol",
   "d": "참나무를 구워 만든 숯. 대장간 불의 밥."
  },
  "ssari": {
   "n": "싸리버섯",
   "r": 2,
   "kind": "재료",
   "region": "galchamgol",
   "d": "싸리 빗자루처럼 가늘게 갈라진 버섯. 가을 참나무 숲에 난다."
  },
  "kkoe": {
   "n": "꾀꼬리버섯",
   "r": 2,
   "kind": "재료",
   "region": "galchamgol",
   "d": "꾀꼬리 깃털처럼 노란 버섯. 은은한 살구 향이 난다."
  },
  "meoru": {
   "n": "해머루",
   "r": 3,
   "kind": "귀한 것",
   "region": "galchamgol",
   "d": "당산나무 꼭대기에만 열리는 머루. 해를 머금은 듯 알이 따뜻하다."
  },
  "rice": {
   "n": "주먹밥",
   "r": 0,
   "kind": "먹을거리",
   "region": "전체",
   "d": "엄마가 싸 준 주먹밥. 먹으면 기운이 난다."
  },
  "vine": {
   "n": "칡 줄기",
   "r": 1,
   "kind": "재료",
   "region": "galchamgol",
   "d": "엉킨 칡의 덩굴손에서 얻은 질긴 줄기. 끈이나 바구니를 엮기 좋다."
  },
  "kflower": {
   "n": "칡꽃",
   "r": 3,
   "kind": "재료",
   "region": "galchamgol",
   "d": "엉킨 칡의 심에서 핀 보랏빛 꽃. 달큰한 향이 오래 남는다."
  },
  "eoksae": {
   "n": "마른 억새",
   "r": 0,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "서리 맞아 하얗게 센 억새. 겨울잠 둥지를 짓기 좋다."
  },
  "memil": {
   "n": "메밀",
   "r": 0,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "세모난 검은 낟알. 돌밭에서도 잘 자란다."
  },
  "memil_powder": {
   "n": "메밀가루",
   "r": 1,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "맷돌에 곱게 간 메밀. 장승제 메밀전을 부친다."
  },
  "gyeousari": {
   "n": "겨우살이",
   "r": 1,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "겨울에도 푸른 기생 나무. 새들이 열매를 좋아한다."
  },
  "gyeolmyeongja": {
   "n": "결명자",
   "r": 2,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "눈을 밝힌다는 약재 씨앗. 볶아서 차로 달인다."
  },
  "seogi": {
   "n": "석이버섯",
   "r": 2,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "바위에 붙어 자라는 귀 모양 버섯. 백 년 바위에만 난다는 말이 있다."
  },
  "seoridarae": {
   "n": "서리다래",
   "r": 3,
   "kind": "귀한 것",
   "region": "dolneomeo",
   "d": "첫서리를 맞아야 단맛이 드는 다래. 엄마의 병을 늦추는 약 재료."
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
   "d": "돌 골렘의 다리를 이루던 진흙. 아직 축축하다."
  },
  "stonedust": {
   "n": "돌가루",
   "r": 1,
   "kind": "재료",
   "region": "dolneomeo",
   "d": "돌 골렘의 팔에서 떨어진 고운 돌가루."
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
   "d": "엿을 고고 남은 쌀. 설 대목이라 장터에서 귀하다."
  },
  "ssal_powder": {
   "n": "쌀가루",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "맷돌에 간 쌀가루. 떡의 바탕."
  },
  "pat": {
   "n": "팥",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "붉은 팥. 설 고사떡에 꼭 들어간다."
  },
  "patsirutteok": {
   "n": "팥시루떡",
   "r": 1,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "시루에 찐 붉은 팥떡. 보부상단 설 고사에 올린다."
  },
  "memiltteok": {
   "n": "메밀떡",
   "r": 1,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "거무스름한 메밀떡. 도깨비가 메밀을 좋아한다는 말이 있다."
  },
  "dad_yeot": {
   "n": "아빠가 맡긴 엿",
   "r": 1,
   "kind": "먹을거리",
   "region": "jangteo",
   "d": "아빠가 아들에게 주려고 사 두고 끝내 가져가지 못한 가락엿. 엿방울이 맡아 두었다."
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
   "d": "아빠의 글씨. \"글자는 '되돌림'이었다. 값은 이미 치러졌다. 이번엔 내가 치른다. 북쪽 영산.\""
  },
  "broom_sal": {
   "n": "싸리 살",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "헌물 도깨비의 빗자루에서 빠진 싸리 살."
  },
  "kong": {
   "n": "콩",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "헌물 도깨비가 키로 까불던 콩. 장터에서 훔쳐 온 것이다."
  },
  "jip": {
   "n": "짚",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "헌물 도깨비의 멍석에서 풀려나온 짚."
  },
  "dokkaebibul": {
   "n": "도깨비불씨",
   "r": 3,
   "kind": "귀한 것",
   "region": "jangteo",
   "d": "꺼지지 않는 푸른 불씨. 손에 쥐어도 뜨겁지 않다."
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
   "d": "질기고 잘 휘는 덩굴. 테를 짜기 좋다."
  },
  "magamok": {
   "n": "마가목 열매",
   "r": 1,
   "kind": "재료",
   "region": "yeongsan",
   "d": "눈 속에서도 빨갛게 매달린 작은 열매. 산짐승의 겨울 양식."
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
   "n": "서리 수염",
   "r": 2,
   "kind": "재료",
   "region": "yeongsan",
   "d": "강철이의 입가에 늘어졌던 수염. 녹지 않는 서리가 맺혀 있다."
  },
  "ice_scale": {
   "n": "얼음 비늘",
   "r": 1,
   "kind": "재료",
   "region": "yeongsan",
   "d": "강철이의 몸통에서 떨어진 비늘. 햇빛에 비추면 무지개가 든다."
  },
  "icicle": {
   "n": "고드름 조각",
   "r": 1,
   "kind": "재료",
   "region": "yeongsan",
   "d": "강철이의 꼬리에서 부러진 고드름."
  },
  "broken_orb": {
   "n": "깨진 여의주",
   "r": 3,
   "kind": "귀한 것",
   "region": "yeongsan",
   "d": "용이 되지 못한 이무기의 여의주. 금이 갔는데도 따뜻하다."
  },
  "dad_ledger": {
   "n": "아빠의 장부 한 장",
   "r": 3,
   "kind": "귀한 것",
   "region": "yeongsan",
   "d": "오래된 거래 기록. 엄마의 글씨: \"제 둔갑과 말을 드립니다. 아이의 숨을 주세요.\" 그 아래 아빠의 글씨: \"말 하나 더함.\""
  },
  "legend_fruit": {
   "n": "전설의 열매",
   "r": 4,
   "kind": "귀한 것",
   "region": "yeongsan",
   "d": "입으로만 전해지는 열매. 소문으로는 부를 준다지만 실은 잃어버린 것을 돌려준다."
  },
  "doerim_yak": {
   "n": "되돌림 약",
   "r": 4,
   "kind": "귀한 것",
   "region": "yeongsan",
   "d": "아빠와 함께 약연을 굴려 만든 약. 엄마의 둔갑과 말을 되돌린다."
  },
  "salt": {
   "n": "소금",
   "r": 0,
   "kind": "재료",
   "region": "galchamgol",
   "d": "작은 종지에 담은 굵은 소금. 채집으로는 얻지 못한다."
  },
  "sesame": {
   "n": "깨",
   "r": 1,
   "kind": "재료",
   "region": "galchamgol",
   "d": "고소한 볶은 깨. 절구에 찧으면 향이 더 난다. 교환으로만 얻는다."
  },
  "sesame_oil": {
   "n": "참기름",
   "r": 1,
   "kind": "재료",
   "region": "전체",
   "d": "작은 병에 담은 참기름. 묵이나 반죽에 고소한 향을 더한다. 교환으로만 얻는다."
  },
  "mung": {
   "n": "녹두",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "설 장터에서 건너온 녹두. 맷돌에 갈아 반죽을 만든다. 교환으로만 얻는다."
  },
  "honey": {
   "n": "꿀",
   "r": 1,
   "kind": "재료",
   "region": "jangteo",
   "d": "작은 단지에 담은 겨울 꿀. 약과를 빚을 때 쓴다. 교환으로만 얻는다."
  },
  "jujube": {
   "n": "대추",
   "r": 1,
   "kind": "재료",
   "region": "yeongsan",
   "d": "산막에서 말린 붉은 대추. 약연에서 지역 재료와 함께 간다. 교환으로만 얻는다."
  },
  "acorn_jelly": {
   "n": "도토리묵",
   "r": 1,
   "kind": "먹을거리",
   "region": "galchamgol",
   "d": "단풍골 도토리로 빚은 말랑한 묵. 참나무 숲 냄새가 난다."
  },
  "sesame_salt": {
   "n": "깨소금",
   "r": 1,
   "kind": "재료",
   "region": "galchamgol",
   "d": "소금과 깨를 함께 찧었다. 엄마가 밥상 끝에 놓던 고소한 가루다."
  },
  "memil_jelly": {
   "n": "메밀묵",
   "r": 1,
   "kind": "먹을거리",
   "region": "dolneomeo",
   "d": "돌너머 메밀의 구수한 맛에 참기름 향을 더한 묵."
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
   "d": "꿀을 넣어 빚고 시루에 익힌 집안식 약과. 설 장터의 달콤한 냄새가 난다."
  },
  "rainbow_tteok": {
   "n": "무지개떡",
   "r": 1,
   "kind": "먹을거리",
   "region": "yeongsan",
   "d": "단풍골 가루와 장터 팥, 영산 열매를 포갠 떡. 지나온 세 계절이 한 조각에 들었다."
  },
  "magamok_tea": {
   "n": "마가목차",
   "r": 1,
   "kind": "먹을거리",
   "region": "yeongsan",
   "d": "영산의 빨간 열매에 말린 대추를 더한 차. 손에 쥐면 온기가 돈다."
  },
  "ssanghwa": {
   "n": "쌍화 약재",
   "r": 1,
   "kind": "재료",
   "region": "yeongsan",
   "d": "남쪽 칡뿌리와 겨울 산의 겨우살이, 대추를 함께 갈았다. 건네기 좋은 향긋한 약재다."
  }
 },
 "BOSS_PARTS": {
  "kudzu": [
   {
    "id": "arm",
    "name": "덩굴손",
    "hp": 3,
    "mat": "vine"
   },
   {
    "id": "root",
    "name": "뿌리",
    "hp": 3,
    "mat": "root"
   },
   {
    "id": "core",
    "name": "칡의 심",
    "hp": 4,
    "mat": "kflower",
    "core": true
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
    "material": "stone"
   },
   {
    "id": "arm",
    "name": "팔",
    "hp": 3,
    "mat": "stonedust",
    "material": "stone"
   },
   {
    "id": "head",
    "name": "머리",
    "hp": 4,
    "mat": "mossy_eye",
    "core": true,
    "material": "stone"
   }
  ],
  "dokkaebi": [
   {
    "id": "broom",
    "name": "빗자루",
    "hp": 3,
    "mat": "broom_sal"
   },
   {
    "id": "ki",
    "name": "키",
    "hp": 3,
    "mat": "kong"
   },
   {
    "id": "meongseok",
    "name": "멍석",
    "hp": 3,
    "mat": "jip"
   },
   {
    "id": "core",
    "name": "도깨비불",
    "hp": 4,
    "mat": "dokkaebibul",
    "core": true
   }
  ],
  "gangcheol": [
   {
    "id": "mouth",
    "name": "입",
    "hp": 3,
    "mat": "frost_whisker"
   },
   {
    "id": "body",
    "name": "몸통",
    "hp": 4,
    "mat": "ice_scale",
    "material": "ice"
   },
   {
    "id": "tail",
    "name": "꼬리",
    "hp": 3,
    "mat": "icicle",
    "material": "ice"
   },
   {
    "id": "core",
    "name": "머리",
    "hp": 5,
    "mat": "broken_orb",
    "core": true
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
   "dokkaebibul": 100,
   "patsirutteok": 60
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
     "nunhongsi": 1,
     "ssal_powder": 1
    },
    "out": "hongsi_tteok",
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
   }
  ],
  "yakyeon": [
   {
    "need": {
     "legend_fruit": 1
    },
    "out": "doerim_yak",
    "n": 1
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
   }
  ]
 },
 "CRAFT": {
  "jeolgu": {
   "habit": "엄마는 세 번 찧고 한 번 쉬었다. 엄마가 잊어도 내 손은 기억할 거다.",
   "habitKey": "habit:jeolgu",
   "fail": "절구가 헛돌았다. 엄마도 이 조합은 안 찧었겠지. 재료는 그대로 챙겼다.",
   "steps": 3,
   "intervalMs": 650,
   "windowMs": 280,
   "restMs": 800,
   "steamMs": 0,
   "dragPx": 0,
   "turnDegrees": 0
  },
  "maetdol": {
   "habit": "증조할아버지는 맷돌을 꼭 왼쪽으로 돌렸단다. 자개 발자국을 따라 손을 돌렸다.",
   "habitKey": "habit:maetdol",
   "fail": "맷돌이 꿈쩍도 안 한다. 증조할아버지도 이건 안 갈았겠지. 재료는 그대로 챙겼다.",
   "steps": 4,
   "intervalMs": 0,
   "windowMs": 0,
   "restMs": 0,
   "steamMs": 0,
   "dragPx": 0,
   "turnDegrees": 90
  },
  "siru": {
   "habit": "잔칫날이면 엄마는 김이 오를 때 뚜껑을 톡 두드렸다. 나도 같은 소리를 냈다.",
   "habitKey": "habit:siru",
   "fail": "시루에서 김만 새어 나왔다. 잔칫날에도 이런 떡은 없었지. 재료는 그대로 챙겼다.",
   "steps": 1,
   "intervalMs": 0,
   "windowMs": 350,
   "restMs": 0,
   "steamMs": 1200,
   "dragPx": 0,
   "turnDegrees": 0
  },
  "yakyeon": {
   "habit": "아빠는 끝에 한 번 거꾸로 굴렸다. 말 대신 포갠 손으로 그 버릇을 배웠다.",
   "habitKey": "habit:yakyeon",
   "fail": "약연 바퀴가 덜컥 멎었다. 아빠가 고개를 젓는 것 같다. 재료는 그대로 챙겼다.",
   "steps": 4,
   "intervalMs": 0,
   "windowMs": 0,
   "restMs": 0,
   "steamMs": 0,
   "dragPx": 24,
   "turnDegrees": 0
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
   "ssanghwa": {
    "kind": "좋아함",
    "line": "한데 갈았어도 저마다 향이 남았네.",
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
  "sangun": {
   "magamok_tea": {
    "kind": "아주 좋아함",
    "line": "네가 지나온 산의 향이구나. 잘 받으마.",
    "effect": "none"
   },
   "ssanghwa": {
    "kind": "좋아함",
    "line": "여러 향이 한데 머무는구나. 잠시 쉬어라.",
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
    "kind": "아주 좋아함",
    "line": "달인 대추의 따뜻한 김에 강철이의 긴 몸이 풀린다.",
    "effect": "calm:60"
   },
   "yakgwa": {
    "kind": "좋아함",
    "line": "꿀 바른 약과의 단내에 강철이가 언 숨을 길게 내쉰다.",
    "effect": "calm:40"
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
     "text": "아빠의 약연은 받지 않는다. 남의 집 가업 물건은 안 받는 게 보부상 법도라고.",
     "section": "관찰",
     "when": "nal:yakyeon"
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
     "text": "신표를 보더니 말없이 털토시를 얹어 줬다.",
     "section": "관찰",
     "when": "nal:tosi"
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
     "text": "엄마의 병을 고치지는 못해도 늦출 수는 있다고 했다. 무언가 알면서 말을 아낀다.",
     "section": "관찰",
     "when": "met:toad"
    },
    {
     "who": "me",
     "text": "보따리 속 약연을 보더니 아직 쓸 때가 아니라고 했다.",
     "section": "관찰",
     "when": "met:toad"
    },
    {
     "who": "me",
     "text": "내가 아기였던 겨울에 엄마가 두고 간 포대기 끈을 받았다. 할멈이 내내 간직하고 있었다.",
     "section": "관찰",
     "when": "galchamgol:arc-toad-wrap"
    }
   ]
  },
  {
   "id": "kudzu",
   "region": "galchamgol",
   "kind": "animal",
   "lines": [
    {
     "who": "me",
     "text": "당산나무를 감은 칡덩굴. 덩굴손은 위에서 휩쓸고, 뿌리는 땅에서 솟는다.",
     "section": "관찰",
     "when": "fight:kudzu"
    },
    {
     "who": "me",
     "text": "덩굴손이나 뿌리를 하나 꺾어야 심이 드러난다.",
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
     "text": "(그림 옆에 나중에 덧쓴 글씨) 여기도 아니다.",
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
     "text": "돌탑은 돌 마음부터 읽고, 하나씩 천천히 얹는다.",
     "section": "관찰",
     "when": "dolsoe:stack"
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
     "text": "돌무더기가 깨어나 일어섰다. 머리가 높아 처음엔 손이 닿지 않는다.",
     "section": "관찰",
     "when": "fight:golem"
    },
    {
     "who": "me",
     "text": "다리나 팔을 하나 무너뜨리면 휘청이며 머리가 내려온다.",
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
     "text": "달래면 다시 성황당으로 내려앉는다.",
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
     "text": "여우 엿장수. 엿장수 마음대로다. 가위 장단을 맞춰 주면 흥이 나서 덤을 준다.",
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
     "text": "장단이 맞자 흥이 올라, 숨겨 둔 아빠의 엿을 내줬다.",
     "section": "관찰",
     "when": "yeotbang:high"
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
     "text": "설 고사에 팥시루떡을 올리자 장부에 내 이름을 적고 신표를 줬다.",
     "section": "관찰",
     "when": "bueong:sinpyo"
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
     "text": "장터 도깨비 이야기: 헌것에 깃들어 장난을 친다. 메밀 한 그릇이면 순해진다더라.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "낡은 빗자루·키·멍석에 깃든 도깨비. 빗자루는 쓸고, 키는 콩을 뿌리고, 멍석은 말려 든다.",
     "section": "관찰",
     "when": "fight:dokkaebi"
    },
    {
     "who": "me",
     "text": "헌물을 하나 부수면 도깨비불이 드러난다.",
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
     "text": "달래면 훔친 것을 제자리에 돌려놓고 눈홍시를 하나 더 준다.",
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
   "id": "nunhongsi",
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
     "text": "마가목 열매를 좋아한다. 얼어붙은 비탈의 지름길을 안다.",
     "section": "관찰",
     "when": "salgeumi:shortcut"
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
     "text": "호숫가에서 신목만 바라보고 있었다. 말을 잃었다.",
     "section": "관찰",
     "when": "met:dad"
    },
    {
     "who": "me",
     "text": "몸짓으로 말한다. 천천히 보면 알아들을 수 있다.",
     "section": "관찰",
     "when": "dad:ledger"
    }
   ]
  },
  {
   "id": "sangun",
   "region": "yeongsan",
   "kind": "animal",
   "lines": [
    {
     "who": "dad",
     "text": "영산의 주인, 산군 할아버지. 셈이 맞지 않으면 아무것도 내주지 않는다.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "엄마의 오래된 거래 상대. 악하지 않다. 셈이 맞아야 할 뿐이다.",
     "section": "관찰",
     "when": "sangun:story"
    },
    {
     "who": "me",
     "text": "내 이름으로 셈을 맞췄다.",
     "section": "관찰",
     "when": "sangun:name"
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
     "text": "영산 호수의 이무기 이야기. 지나는 곳마다 추위를 몬다. 따뜻한 것을 그리워한다더라.",
     "section": "아빠 수첩"
    },
    {
     "who": "me",
     "text": "호수를 휘감은 이무기. 입은 서리를 뿜고, 몸통은 조여 오고, 꼬리는 고드름을 뿌린다.",
     "section": "관찰",
     "when": "fight:gangcheol"
    },
    {
     "who": "me",
     "text": "몸통을 풀어야 머리가 드러난다.",
     "section": "관찰",
     "when": "core:gangcheol"
    },
    {
     "who": "me",
     "text": "도깨비불씨의 온기에 눈을 감았다. 아빠 수첩에 적힌 대로다.",
     "section": "관찰",
     "when": "like:gangcheol:dokkaebibul"
    },
    {
     "who": "me",
     "text": "붉은 팥 냄새에 움찔 물러났다. 좋아서가 아니라 꺼려서다. 팥은 잡귀를 쫓는다더니.",
     "section": "관찰",
     "when": "like:gangcheol:patsirutteok"
    },
    {
     "who": "me",
     "text": "달래면 남쪽 바다로 떠나며 서리 수염을 남긴다.",
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
   ],
   "dadDrawing": true
  },
  {
   "id": "broken_orb",
   "region": "yeongsan",
   "kind": "item",
   "lines": []
  },
  {
   "id": "legend_fruit",
   "region": "yeongsan",
   "kind": "item",
   "lines": [
    {
     "who": "dad",
     "text": "영산 신목의 열매. 봄에만 열린다.",
     "section": "아빠 수첩"
    },
    {
     "who": "dad",
     "text": "(그림 옆에 나중에 덧쓴 글씨) 여기다.",
     "section": "아빠 수첩",
     "when": "got:legend_fruit"
    }
   ],
   "dadDrawing": true
  },
  {
   "id": "dad_stamps_galchamgol",
   "region": "galchamgol",
   "kind": "stamp",
   "lines": [
    {
     "who": "dad",
     "text": "부를 준다는 열매를 찾으러 낫날부터 벼렸다.",
     "section": "아빠 수첩",
     "when": "stamp:galchamgol:anvil"
    },
    {
     "who": "dad",
     "text": "높이 오르면 남보다 먼저 열매를 찾을 줄 알았다.",
     "section": "아빠 수첩",
     "when": "stamp:galchamgol:knot"
    },
    {
     "who": "dad",
     "text": "해를 머금은 머루. 맛은 좋다. 내가 찾는 부는 여기 없다.",
     "section": "아빠 수첩",
     "when": "stamp:galchamgol:roots"
    }
   ],
   "name": "젊은 아빠의 그날"
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
   "id": "yakyeon",
   "region": "yeongsan",
   "kind": "item",
   "lines": [
    {
     "who": "me",
     "text": "아빠는 끝에 한 번 거꾸로 굴렸다. 말 대신 포갠 손으로 그 버릇을 배웠다.",
     "section": "익힌 솜씨",
     "when": "habit:yakyeon"
    }
   ],
   "name": "아빠의 약연"
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
     "text": "칡뿌리와 겨우살이, 대추를 함께 갈았다. 아빠의 약연에서 새 향이 났다.",
     "section": "숨은 가공법",
     "when": "recipe:ssanghwa"
    }
   ]
  },
  {
   "id": "dolneomeo_jangseung",
   "region": "dolneomeo",
   "kind": "stamp",
   "lines": [
    {
     "who": "dad",
     "text": "장승 뒤에서 짚신을 고쳤다. 부를 준다는 열매가 북쪽에 있다니 고개 하나쯤은 더 넘을 수 있다.",
     "section": "아빠 수첩",
     "when": "stamp:dolneomeo:jangseung"
    }
   ],
   "name": "장승 뒤 도장"
  },
  {
   "id": "dolneomeo_mill_base",
   "region": "dolneomeo",
   "kind": "stamp",
   "lines": [
    {
     "who": "dad",
     "text": "돌쇠 어른께 돌을 배웠다. 부자가 되면 돌가루 묻힐 일도 없겠지. 그래도 손에 밴 돌 냄새가 싫지는 않다.",
     "section": "아빠 수첩",
     "when": "stamp:dolneomeo:mill_base"
    }
   ],
   "name": "맷돌 받침돌 도장"
  },
  {
   "id": "dolneomeo_cliff_crack",
   "region": "dolneomeo",
   "kind": "stamp",
   "lines": [
    {
     "who": "dad",
     "text": "구름 아래 마을이 좁쌀만 하다. 부자가 되어 돌아올 길을 잊을까 바위 틈에 발바닥을 찍어 둔다.",
     "section": "아빠 수첩",
     "when": "stamp:dolneomeo:cliff_crack"
    }
   ],
   "name": "절벽 바위 틈 도장"
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
     "who": "dad",
     "text": "부를 준다는 열매를 찾으러 북쪽으로 간다. 장터 깃발에 길을 물으니 바람만 대답했다.",
     "section": "아빠 수첩",
     "when": "stamp:jangteo:flag"
    }
   ],
   "name": "젊은 아빠의 그날 · 장터 깃대"
  },
  {
   "id": "dad_stamp_jangteo_pillar",
   "region": "jangteo",
   "kind": "stamp",
   "lines": [
    {
     "who": "dad",
     "text": "부자가 되어 돌아가겠다고 다짐하며 묵었다. 새벽길을 서두르다 젖은 발로 기둥을 짚었다.",
     "section": "아빠 수첩",
     "when": "stamp:jangteo:pillar"
    }
   ],
   "name": "젊은 아빠의 그날 · 숙소 기둥"
  },
  {
   "id": "dad_stamp_jangteo_rock",
   "region": "jangteo",
   "kind": "stamp",
   "lines": [
    {
     "who": "dad",
     "text": "보배가 열린다는 산은 아직 멀다. 바위에서 내려다보니 장터 등불은 밤늦도록 꺼지지 않았다. 나도 저렇게 벌 테다.",
     "section": "아빠 수첩",
     "when": "stamp:jangteo:rock"
    }
   ],
   "name": "젊은 아빠의 그날 · 솔숲 바위"
  },
  {
   "id": "y_stamp_hut",
   "region": "yeongsan",
   "kind": "stamp",
   "lines": [
    {
     "who": "dad",
     "text": "부를 준다는 열매가 산 위에 있다기에 산막에서 짐을 고쳐 맸다. 빈 보따리를 무겁게 채워 돌아올 줄 알았다.",
     "section": "아빠 수첩",
     "when": "stamp:yeongsan:hut_post"
    }
   ],
   "name": "젊은 아빠의 그날 · 산막"
  },
  {
   "id": "y_stamp_snow",
   "region": "yeongsan",
   "kind": "stamp",
   "lines": [
    {
     "who": "dad",
     "text": "이정표 위 눈을 털고 발바닥 무늬를 남겼다. 부자가 되어 내려올 때도 이 길로 오겠거니 했다.",
     "section": "아빠 수첩",
     "when": "stamp:yeongsan:snow_sign"
    }
   ],
   "name": "젊은 아빠의 그날 · 눈길"
  },
  {
   "id": "y_stamp_shore",
   "region": "yeongsan",
   "kind": "stamp",
   "lines": [
    {
     "who": "dad",
     "text": "부를 주는 열매가 아니었다. 되찾을 것이 없던 나는 빈손으로 돌아갔다. 그래도 신목이 있는 자리는 수첩에 적어 두었다.",
     "section": "아빠 수첩",
     "when": "stamp:yeongsan:shore_rock"
    }
   ],
   "name": "젊은 아빠의 그날 · 호숫가"
  }
 ],
 "MINIGAMES": {
  "handwork_forge_relation": 2,
  "handwork_stack_relation": 2,
  "handwork_steam_relation": 1,
  "rhythm_notes": 8,
  "rhythm_good": 0.18,
  "rhythm_perfect": 0.075,
  "rhythm_scroll_speed": 145,
  "rhythm_bonus_hits": 5,
  "rhythm_start_delay": 0.15,
  "rhythm_subbeat": 0.22,
  "rhythm_intro_beats": 6,
  "rhythm_parts": 3,
  "rhythm_normal_gap": 0.66,
  "rhythm_late_gap": 0.55,
  "rhythm_normal_last": 5,
  "rhythm_late_hint_delay": 0.2,
  "rhythm_finish_delay": 0.65,
  "rhythm_cooldown": 0.12,
  "rhythm_stray_window": 0.36,
  "rhythm_resume_delay": 0.3,
  "rhythm_combo": 3,
  "rhythm_relation": 1,
  "rhythm_high_relation": 2,
  "rhythm_note_one": 1.32,
  "rhythm_note_two": 1.98,
  "rhythm_note_three": 2.64,
  "rhythm_note_four": 3.3,
  "rhythm_note_five": 3.96,
  "rhythm_note_six": 4.62,
  "rhythm_note_seven": 5.17,
  "rhythm_note_eight": 5.72,
  "salg_graze": 108,
  "salg_return_graze": 114,
  "salg_moving": 0.2,
  "salg_return_speed": 0.25,
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
  "dad_steps": 3,
  "gather_ring_period": 48,
  "gather_ring_radius": 7,
  "gather_just_window": 7,
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
  "yut_needle_speed": 1.5,
  "yut_nak_zone": 10
 },
 "TUNING": {
  "kkubeogi_cycle": 200,
  "kkubeogi_awake": 56,
  "kkubeogi_cue": 32,
  "field_move_speed": 1.7,
  "field_swing_speed": 0.7,
  "field_jump_velocity": -5.4,
  "field_drop_frames": 14,
  "field_crawl_frames": 54,
  "field_gravity": 0.32,
  "field_fall_speed": 6,
  "field_pickup_x": 10,
  "field_pickup_y": 16,
  "field_talk_distance": 30,
  "field_dig_ahead": 12,
  "field_dig_distance": 16,
  "field_swing_frames": 18,
  "field_swing_hit_at": 9,
  "field_hit_front": 2,
  "field_hit_back": 24,
  "field_hit_width": 22,
  "field_dig_padding": 6,
  "save_interval": 30000,
  "field_interact_y": 24,
  "zone_transition_frames": 18,
  "vista_pan_frames": 480,
  "map_flight_ms": 2000,
  "map_landing_margin": 40,
  "battle_bare_speed": 2.7,
  "battle_bare_cooldown": 16,
  "battle_bare_radius": 26,
  "battle_iframes": 60,
  "battle_squirrel_speed": 3.3,
  "battle_squirrel_cooldown": 10,
  "battle_squirrel_radius": 20,
  "battle_goat_speed": 2.2,
  "battle_goat_cooldown": 18,
  "battle_goat_radius": 26,
  "battle_goat_damage_taken": 0.5,
  "battle_owl_speed": 2.5,
  "battle_owl_cooldown": 24,
  "battle_owl_radius": 36,
  "battle_owl_tell_lead": 30,
  "battle_deer_speed": 3.2,
  "battle_deer_cooldown": 16,
  "battle_deer_radius": 24,
  "battle_deer_iframes": 96,
  "battle_base_damage": 1,
  "battle_sharp_damage": 2,
  "battle_pickaxe_bonus": 1,
  "toast_frames": 300,
  "peek_ms": 1400,
  "peek_fade_ms": 180,
  "hint_range": 150,
  "craft_auto_step_ms": 260,
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
  "form_deer_speed": 1.45,
  "form_deer_listen_range": 360,
  "form_fx_frames": 24,
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
  "musoe_finale_hold": 70
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
   "done": "hongsiMade",
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
   "region": "jangteo",
   "done": "hongsiMade",
   "options": [
    {
     "hongsi_tteok": 1
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
   "marsh": "늪가 약방",
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
   "shelter": "산막",
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
  }
 }
};
