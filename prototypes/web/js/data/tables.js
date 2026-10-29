'use strict';
/* 자동으로 만든 파일이다. 직접 고치지 말고 design/data/*.csv 를 고친 뒤 node prototypes/web/tools/build-data.js 를 돌린다 */
const TABLES={
 "ITEMS": {
  "acorn": {
   "n": "도토리",
   "r": 0,
   "kind": "재료",
   "d": "참나무 열매. 떫어서 그냥은 못 먹고 가루로 빻아 쓴다."
  },
  "powder": {
   "n": "도토리 가루",
   "r": 1,
   "kind": "재료",
   "d": "절구로 빻은 도토리. 단풍골에서 잘 팔린다."
  },
  "root": {
   "n": "칡뿌리",
   "r": 1,
   "kind": "재료",
   "d": "땅속 깊이 뻗은 칡의 뿌리. 질기고 달다."
  },
  "coal": {
   "n": "숯",
   "r": 1,
   "kind": "재료",
   "d": "참나무를 구워 만든 숯. 대장간 불의 밥."
  },
  "ssari": {
   "n": "싸리버섯",
   "r": 2,
   "kind": "재료",
   "d": "싸리 빗자루처럼 가늘게 갈라진 버섯. 가을 참나무 숲에 난다."
  },
  "kkoe": {
   "n": "꾀꼬리버섯",
   "r": 2,
   "kind": "재료",
   "d": "꾀꼬리 깃털처럼 노란 버섯. 은은한 살구 향이 난다."
  },
  "meoru": {
   "n": "해머루",
   "r": 3,
   "kind": "귀한 것",
   "d": "당산나무 꼭대기에만 열리는 머루. 해를 머금은 듯 알이 따뜻하다."
  },
  "rice": {
   "n": "주먹밥",
   "r": 0,
   "kind": "먹을거리",
   "d": "엄마가 싸 준 주먹밥. 먹으면 기운이 난다."
  },
  "vine": {
   "n": "칡 줄기",
   "r": 1,
   "kind": "재료",
   "d": "엉킨 칡의 덩굴손에서 얻은 질긴 줄기. 끈이나 바구니를 엮기 좋다."
  },
  "kflower": {
   "n": "칡꽃",
   "r": 3,
   "kind": "재료",
   "d": "엉킨 칡의 심에서 핀 보랏빛 꽃. 달큰한 향이 오래 남는다."
  },
  "eoksae": {
   "n": "마른 억새",
   "r": 0,
   "kind": "재료",
   "d": "서리 맞아 하얗게 센 억새. 겨울잠 둥지를 짓기 좋다."
  },
  "memil": {
   "n": "메밀",
   "r": 0,
   "kind": "재료",
   "d": "세모난 검은 낟알. 돌밭에서도 잘 자란다."
  },
  "memil_powder": {
   "n": "메밀가루",
   "r": 1,
   "kind": "재료",
   "d": "맷돌에 곱게 간 메밀. 장승제 메밀전을 부친다."
  },
  "gyeousari": {
   "n": "겨우살이",
   "r": 1,
   "kind": "재료",
   "d": "겨울에도 푸른 기생 나무. 새들이 열매를 좋아한다."
  },
  "gyeolmyeongja": {
   "n": "결명자",
   "r": 2,
   "kind": "재료",
   "d": "눈을 밝힌다는 약재 씨앗. 볶아서 차로 달인다."
  },
  "seogi": {
   "n": "석이버섯",
   "r": 2,
   "kind": "재료",
   "d": "바위에 붙어 자라는 귀이개 모양 버섯. 백 년 바위에만 난다는 말이 있다."
  },
  "seoridarae": {
   "n": "서리다래",
   "r": 3,
   "kind": "귀한 것",
   "d": "첫서리를 맞아야 단맛이 드는 다래. 엄마의 병을 늦추는 약 재료."
  },
  "darae_yak": {
   "n": "서리다래 약즙",
   "r": 3,
   "kind": "귀한 것",
   "d": "맷돌에 간 서리다래. 까치 편에 엄마에게 보낸다."
  },
  "mud": {
   "n": "진흙 덩이",
   "r": 1,
   "kind": "재료",
   "d": "돌 골렘의 다리를 이루던 진흙. 아직 축축하다."
  },
  "stonedust": {
   "n": "돌가루",
   "r": 1,
   "kind": "재료",
   "d": "돌 골렘의 팔에서 떨어진 고운 돌가루."
  },
  "mossy_eye": {
   "n": "이끼 낀 눈돌",
   "r": 1,
   "kind": "재료",
   "d": "돌 골렘의 눈이던 둥근 돌. 이끼가 눈썹처럼 붙어 있다."
  },
  "story_stone": {
   "n": "사연 있는 돌",
   "r": 3,
   "kind": "귀한 것",
   "d": "아빠가 성황당에 올리려다 두고 간 돌. 소원이 적혀 있다. 돌 골렘을 달래는 선물이 된다."
  },
  "solbang": {
   "n": "솔방울",
   "r": 0,
   "kind": "재료",
   "d": "송진 냄새가 나는 솔방울. 불쏘시개로 그만이다."
  },
  "ssal": {
   "n": "쌀",
   "r": 0,
   "kind": "재료",
   "d": "엿을 고고 남은 쌀. 설 대목이라 장터에서 귀하다."
  },
  "ssal_powder": {
   "n": "쌀가루",
   "r": 1,
   "kind": "재료",
   "d": "맷돌에 간 쌀가루. 떡의 바탕."
  },
  "pat": {
   "n": "팥",
   "r": 1,
   "kind": "재료",
   "d": "붉은 팥. 설 고사떡에 꼭 들어간다."
  },
  "patsirutteok": {
   "n": "팥시루떡",
   "r": 1,
   "kind": "먹을거리",
   "d": "시루에 찐 붉은 팥떡. 보부상단 설 고사에 올린다."
  },
  "memiltteok": {
   "n": "메밀떡",
   "r": 1,
   "kind": "먹을거리",
   "d": "거무스름한 메밀떡. 도깨비가 메밀을 좋아한다는 말이 있다."
  },
  "dad_yeot": {
   "n": "아빠가 맡긴 엿",
   "r": 1,
   "kind": "먹을거리",
   "d": "아빠가 아들에게 주려고 사 두고 끝내 가져가지 못한 가락엿. 사연 있는 물건이라 엿보다 한 단계 위."
  },
  "sinpyo": {
   "n": "보부상 신표",
   "r": 2,
   "kind": "귀한 것",
   "d": "보부상단이 인정한 보부상에게 주는 패. 이제 정식 보부상이다."
  },
  "dad_memo": {
   "n": "아빠의 메모",
   "r": 2,
   "kind": "귀한 것",
   "d": "아빠의 글씨. \"글자는 '되돌림'이었다. 값은 이미 치러졌다. 이번엔 내가 치른다. 북쪽 영산.\""
  },
  "broom_sal": {
   "n": "싸리 살",
   "r": 1,
   "kind": "재료",
   "d": "헌물 도깨비의 빗자루에서 빠진 싸리 살."
  },
  "kong": {
   "n": "콩",
   "r": 1,
   "kind": "재료",
   "d": "헌물 도깨비가 키로 까불던 콩. 장터에서 훔쳐 온 것이다."
  },
  "jip": {
   "n": "짚",
   "r": 1,
   "kind": "재료",
   "d": "헌물 도깨비의 멍석에서 풀려나온 짚."
  },
  "dokkaebibul": {
   "n": "도깨비불씨",
   "r": 3,
   "kind": "귀한 것",
   "d": "꺼지지 않는 푸른 불씨. 손에 쥐어도 뜨겁지 않다."
  },
  "nunhongsi": {
   "n": "눈홍시",
   "r": 3,
   "kind": "귀한 것",
   "d": "처마 밑에서 눈을 맞으며 얼었다 녹기를 거듭한 홍시. 설 제사상의 으뜸."
  },
  "hongsi_tteok": {
   "n": "홍시 약떡",
   "r": 3,
   "kind": "먹을거리",
   "d": "엄마가 동네에 떡을 돌리던 시루로 이번엔 엄마를 위해 찐 떡. 까치 편에 집으로 보낸다."
  },
  "darae_vine": {
   "n": "다래 덩굴",
   "r": 0,
   "kind": "재료",
   "d": "질기고 잘 휘는 덩굴. 테를 짜기 좋다."
  },
  "magamok": {
   "n": "마가목 열매",
   "r": 1,
   "kind": "재료",
   "d": "눈 속에서도 빨갛게 매달린 작은 열매. 산짐승의 겨울 양식."
  },
  "seolpi": {
   "n": "설피",
   "r": 2,
   "kind": "도구",
   "d": "짚신 밑에 대는 둥근 눈신. 깊은 눈길에도 빠지지 않는다."
  },
  "fur_tosi": {
   "n": "털토시",
   "r": 2,
   "kind": "도구",
   "d": "날쌘이 말없이 얹어 준 토시. 손이 시리지 않다."
  },
  "frost_whisker": {
   "n": "서리 수염",
   "r": 2,
   "kind": "재료",
   "d": "강철이가 떠나며 남긴 수염. 녹지 않는 서리가 맺혀 있다."
  },
  "ice_scale": {
   "n": "얼음 비늘",
   "r": 1,
   "kind": "재료",
   "d": "강철이의 몸통에서 떨어진 비늘. 햇빛에 비추면 무지개가 든다."
  },
  "icicle": {
   "n": "고드름 조각",
   "r": 1,
   "kind": "재료",
   "d": "강철이의 꼬리에서 부러진 고드름."
  },
  "broken_orb": {
   "n": "깨진 여의주",
   "r": 3,
   "kind": "귀한 것",
   "d": "용이 되지 못한 이무기의 여의주. 금이 갔는데도 따뜻하다."
  },
  "dad_ledger": {
   "n": "아빠의 장부 한 장",
   "r": 3,
   "kind": "귀한 것",
   "d": "오래된 거래 기록. 엄마의 글씨: \"제 둔갑과 말을 드립니다. 아이의 숨을 주세요.\" 그 아래 아빠의 글씨: \"말 하나 더함.\""
  },
  "legend_fruit": {
   "n": "전설의 열매",
   "r": 4,
   "kind": "귀한 것",
   "d": "입으로만 전해지는 열매. 소문으로는 부를 준다지만 실은 잃어버린 것을 돌려준다."
  },
  "doerim_yak": {
   "n": "되돌림 약",
   "r": 4,
   "kind": "귀한 것",
   "d": "아빠와 함께 약연을 돌려 간 약. 엄마의 둔갑과 말을 되돌린다."
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
    "id": "hammer",
    "name": "망치질",
    "hp": 3
   },
   {
    "id": "bellows",
    "name": "풀무",
    "hp": 3
   },
   {
    "id": "core",
    "name": "호통",
    "hp": 3,
    "core": true
   }
  ],
  "golem": [
   {
    "id": "leg",
    "name": "다리",
    "hp": 3,
    "mat": "mud"
   },
   {
    "id": "arm",
    "name": "팔",
    "hp": 3,
    "mat": "stonedust"
   },
   {
    "id": "head",
    "name": "머리",
    "hp": 4,
    "mat": "mossy_eye",
    "core": true
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
    "mat": "ice_scale"
   },
   {
    "id": "tail",
    "name": "꼬리",
    "hp": 3,
    "mat": "icicle"
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
   }
  ],
  "yakyeon": [
   {
    "need": {
     "legend_fruit": 1
    },
    "out": "doerim_yak",
    "n": 1
   }
  ]
 },
 "NOTES": [
  {
   "id": "dodam",
   "region": "galchamgol",
   "kind": "animal",
   "lines": [
    {
     "who": "me",
     "text": "단풍골 어귀의 다람쥐. 아빠 모자를 알아봤다. 말이 많아서, 물으면 아는 걸 다 말해 준다.",
     "when": "met:dodam"
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
     "text": "족제비 떠돌이 보부상. 깍쟁이다. 얕보는 소리를 들으면 오기로 덤을 얹는다."
    },
    {
     "who": "me",
     "text": "정말이었다. 촌구석이라고 허세를 부렸더니 숯을 하나 더 줬다.",
     "when": "nal:bluff-paid"
    },
    {
     "who": "me",
     "text": "아빠의 약연은 받지 않는다. 남의 집 가업 물건은 안 받는 게 보부상 법도라고.",
     "when": "nal:yakyeon"
    },
    {
     "who": "me",
     "text": "돌너머에서는 단풍골 칡꽃을 귀하게 쳤다. 같은 물건도 마을마다 값이 다르다.",
     "when": "nal:dolneomeo"
    },
    {
     "who": "me",
     "text": "큰 장터에선 돌너머 메밀가루를 팥 두 되로 쳐줬다.",
     "when": "nal:jangteo-memil"
    },
    {
     "who": "me",
     "text": "아빠와 같은 보부상단이었다고 털어놓았다. 아빠는 날쌘을 끝까지 얕보지 않았다고.",
     "when": "nal:yeongsan"
    },
    {
     "who": "me",
     "text": "신표를 보더니 말없이 털토시를 얹어 줬다.",
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
     "text": "단풍골 대장장이 오소리. 무뚝뚝해도 의리는 있다. 숯이 없으면 불을 안 지핀다."
    },
    {
     "who": "me",
     "text": "말보다 시험이 먼저다. 덤비면 꿀밤으로 연장부터 뺏으니, 피하기만 해야 한다.",
     "when": "fight:musoe"
    },
    {
     "who": "me",
     "text": "출출할 때 주먹밥을 건네면 어깨가 내려간다.",
     "when": "like:musoe:rice"
    },
    {
     "who": "me",
     "text": "도토리 가루도 반긴다.",
     "when": "like:musoe:powder"
    },
    {
     "who": "me",
     "text": "쇠는 가장 빨갛게 달았을 때 쳐야 한다. 박자를 놓치면 쇠가 운다.",
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
     "text": "두꺼비 약재상. 약은 잘 짓는데, 아는 걸 다 말하지는 않는다."
    },
    {
     "who": "me",
     "text": "엄마의 병을 고치지는 못해도 늦출 수는 있다고 했다. 무언가 알면서 말을 아낀다.",
     "when": "met:toad"
    },
    {
     "who": "me",
     "text": "보따리 속 약연을 보더니 아직 쓸 때가 아니라고 했다.",
     "when": "met:toad"
    },
    {
     "who": "me",
     "text": "내가 아기였던 겨울에 엄마가 두고 간 포대기 끈을 받았다. 할멈이 내내 간직하고 있었다.",
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
     "when": "fight:kudzu"
    },
    {
     "who": "me",
     "text": "덩굴손이나 뿌리를 하나 꺾어야 심이 드러난다.",
     "when": "core:kudzu"
    },
    {
     "who": "me",
     "text": "싸리버섯 향을 맡으면 덩굴이 느슨해진다.",
     "when": "like:kudzu:ssari"
    },
    {
     "who": "me",
     "text": "꾀꼬리버섯 향도 좋아한다.",
     "when": "like:kudzu:kkoe"
    },
    {
     "who": "me",
     "text": "부수지 않고 달래면 보랏빛 칡꽃을 피워 두고 물러난다.",
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
     "text": "단풍골에선 도토리 가루가 돈 대신 돈다. 세 알이면 한 줌."
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
     "text": "밑동을 단번에 꺾을 것. 갓이 부서지면 값이 떨어진다."
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
     "text": "당산나무 꼭대기의 머루. 해를 머금은 듯 알이 따뜻하다."
    },
    {
     "who": "dad",
     "text": "(그림 옆에 나중에 덧쓴 글씨) 여기도 아니다.",
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
     "when": "kkubeogi:sleep"
    },
    {
     "who": "me",
     "text": "꾸벅꾸벅 졸다가 고개를 드는 잠깐에만 말이 통한다.",
     "when": "kkubeogi:awake"
    },
    {
     "who": "me",
     "text": "겨울잠 둥지에 쓸 마른 억새를 좋아한다.",
     "when": "kkubeogi:eoksae"
    },
    {
     "who": "me",
     "text": "지난가을 아빠가 둥지 곁에서 “미안하다… 그 겨울에 내가 없어서…”라고 했단다. 꾸벅이가 잊기 전에 내 기록에 맡겼다.",
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
     "text": "돌너머 석수 두더지. \"돌이 마음을 알아야 돈다.\" 할배한테 배운 말."
    },
    {
     "who": "me",
     "text": "눈이 침침해져서 이제 돌을 손끝으로만 읽는다.",
     "when": "met:dolsoe"
    },
    {
     "who": "me",
     "text": "결명자 차를 드리면 눈이 밝아진다며 마음을 연다.",
     "when": "dolsoe:tea"
    },
    {
     "who": "me",
     "text": "돌탑은 흔들릴 때 말고, 꼭대기가 가운데 설 때 얹는다.",
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
     "text": "돌산 장승지기 산양. 원칙대로다. 장승제를 안 올리면 누구도 못 지나간다."
    },
    {
     "who": "me",
     "text": "장승제에는 메밀전을 부친다. 메밀가루가 있어야 한다.",
     "when": "met:ppuri"
    },
    {
     "who": "me",
     "text": "의리를 보이면 아무한테나 안 알려 주는 자리를 알려 준다.",
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
     "text": "돌산 어귀 성황당. 지날 때 돌 하나 얹고 소원을 빈다."
    },
    {
     "who": "me",
     "text": "돌무더기가 깨어나 일어섰다. 머리가 높아 처음엔 손이 닿지 않는다.",
     "when": "fight:golem"
    },
    {
     "who": "me",
     "text": "다리나 팔을 하나 무너뜨리면 휘청이며 머리가 내려온다.",
     "when": "core:golem"
    },
    {
     "who": "me",
     "text": "아빠가 못 올린 소원 돌을 건네자 조용해졌다.",
     "when": "like:golem:story_stone"
    },
    {
     "who": "me",
     "text": "백 년 바위의 석이버섯도 반긴다.",
     "when": "like:golem:seogi"
    },
    {
     "who": "me",
     "text": "달래면 다시 성황당으로 내려앉는다.",
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
     "text": "돌너머 장승제 상에는 꼭 메밀전이 오른다."
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
     "text": "눈이 침침한 어른께 차로 달여 드리면 좋다."
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
     "text": "아는 이가 아니면 자리를 못 찾는다. 장승지기라면 알지도."
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
     "text": "큰 장터 떡집 곰. 손이 커서 떡을 덤으로 얹어 준다."
    },
    {
     "who": "me",
     "text": "설 대목인데 떡집 맷돌이 깨져 쌀가루가 모자란다.",
     "when": "met:morak"
    },
    {
     "who": "me",
     "text": "시루는 김을 다룰 줄 알아야 깨어난다. 불은 조금씩, 김은 고르게.",
     "when": "morak:steam"
    },
    {
     "who": "me",
     "text": "메밀가루 둘이면 메밀떡을 찔 수 있다고 알려 줬다. 도깨비는 메밀을 좋아한다는 말도.",
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
     "text": "여우 엿장수. 엿장수 마음대로다. 가위 장단을 맞춰 주면 흥이 나서 덤을 준다."
    },
    {
     "who": "me",
     "text": "엿을 고려면 불을 오래 때야 해서 솔방울을 귀하게 친다.",
     "when": "met:yeotbang"
    },
    {
     "who": "me",
     "text": "장단이 맞자 흥이 올라, 숨겨 둔 아빠의 엿을 내줬다.",
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
     "text": "보부상단 접장 수리부엉이. 밤에만 깬다. 장부를 꼼꼼히 적는 어른."
    },
    {
     "who": "me",
     "text": "낮에는 처마 밑에서 존다. 숙소 마루에서 해가 지기를 기다리면 된다.",
     "when": "bueong:night"
    },
    {
     "who": "me",
     "text": "보부상단 물건은 보부상에게만 내준다. 규칙이 먼저다.",
     "when": "bueong:rule"
    },
    {
     "who": "me",
     "text": "설 고사에 팥시루떡을 올리자 장부에 내 이름을 적고 신표를 줬다.",
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
     "text": "장터 도깨비 이야기: 헌것에 깃들어 장난을 친다. 메밀 한 그릇이면 순해진다더라."
    },
    {
     "who": "me",
     "text": "낡은 빗자루·키·멍석에 깃든 도깨비. 빗자루는 쓸고, 키는 콩을 뿌리고, 멍석은 말려 든다.",
     "when": "fight:dokkaebi"
    },
    {
     "who": "me",
     "text": "헌물을 하나 부수면 도깨비불이 드러난다.",
     "when": "core:dokkaebi"
    },
    {
     "who": "me",
     "text": "메밀떡을 주니 덩실덩실 춤을 췄다. 아빠 수첩에 적힌 대로다.",
     "when": "like:dokkaebi:memiltteok"
    },
    {
     "who": "me",
     "text": "아빠의 엿을 주자 꼭 끌어안고 돌려주지 않았다.",
     "when": "like:dokkaebi:dad_yeot"
    },
    {
     "who": "me",
     "text": "달래면 훔친 것을 제자리에 돌려놓고 눈홍시를 하나 더 준다.",
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
     "text": "설 고사떡에는 붉은 팥. 잡귀를 쫓는다."
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
     "when": "met:salgeumi"
    },
    {
     "who": "me",
     "text": "귀를 쫑긋 세울 때 움직이면 놀라 달아난다. 그땐 멈춰야 한다.",
     "when": "salgeumi:alert"
    },
    {
     "who": "me",
     "text": "마가목 열매를 좋아한다. 얼어붙은 비탈의 지름길을 안다.",
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
     "when": "met:dad"
    },
    {
     "who": "me",
     "text": "몸짓으로 말한다. 천천히 보면 알아들을 수 있다.",
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
     "text": "영산의 주인, 산군 할아버지. 셈이 맞지 않으면 아무것도 내주지 않는다."
    },
    {
     "who": "me",
     "text": "엄마의 오래된 거래 상대. 악하지 않다. 셈이 맞아야 할 뿐이다.",
     "when": "sangun:story"
    },
    {
     "who": "me",
     "text": "내 이름으로 셈을 맞췄다.",
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
     "text": "영산 호수의 이무기 이야기. 지나는 곳마다 추위를 몬다. 따뜻한 것을 그리워한다더라."
    },
    {
     "who": "me",
     "text": "호수를 휘감은 이무기. 입은 서리를 뿜고, 몸통은 조여 오고, 꼬리는 고드름을 뿌린다.",
     "when": "fight:gangcheol"
    },
    {
     "who": "me",
     "text": "몸통을 풀어야 머리가 드러난다.",
     "when": "core:gangcheol"
    },
    {
     "who": "me",
     "text": "도깨비불씨의 온기에 눈을 감았다. 아빠 수첩에 적힌 대로다.",
     "when": "like:gangcheol:dokkaebibul"
    },
    {
     "who": "me",
     "text": "붉은 팥을 꺼린다.",
     "when": "like:gangcheol:patsirutteok"
    },
    {
     "who": "me",
     "text": "달래면 남쪽 바다로 떠나며 서리 수염을 남긴다.",
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
     "text": "영산 비탈에 많다. 고라니가 좋아한다."
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
     "text": "영산 신목의 열매. 봄에만 열린다."
    },
    {
     "who": "dad",
     "text": "(그림 옆에 나중에 덧쓴 글씨) 여기다.",
     "when": "got:legend_fruit"
    }
   ],
   "dadDrawing": true
  }
 ],
 "MINIGAMES": {
  "forge_heat": 100,
  "forge_hits": 3,
  "forge_help_misses": 2,
  "forge_floor": 22,
  "forge_help_floor": 10,
  "forge_edge_width": 14,
  "forge_cooling": 0.43,
  "forge_help_cooling": 0.32,
  "forge_reheat_wait": 30,
  "forge_finish_wait": 36,
  "forge_bonus_edges": 2,
  "forge_relation": 1,
  "forge_bonus_relation": 1,
  "stack_phase": 0.9,
  "stack_hits": 3,
  "stack_zone": 0.2,
  "stack_help_zone": 0.34,
  "stack_help_misses": 2,
  "stack_amplitude": 42,
  "stack_amplitude_gain": 15,
  "stack_speed": 0.04,
  "stack_speed_gain": 0.014,
  "stack_warning": 0.92,
  "stack_edge_ratio": 0.65,
  "stack_edge_lean": 0.32,
  "stack_edge_wait": 42,
  "stack_hit_wait": 24,
  "stack_miss_wait": 14,
  "stack_relation": 1,
  "stack_perfect_relation": 2,
  "steam_fire_start": 25,
  "steam_band_min": 55,
  "steam_band_max": 80,
  "steam_max": 100,
  "steam_target_frames": 300,
  "steam_time_limit": 1800,
  "steam_wind_at": 65,
  "steam_wind_frames": 90,
  "steam_fire_decay": 0.32,
  "steam_wind_decay": 0.2,
  "steam_steam_follow": 0.035,
  "steam_danger_steam": 94,
  "steam_low_grace": 300,
  "steam_danger_fire": 8,
  "steam_danger_limit": 180,
  "steam_danger_recovery": 3,
  "steam_close_at": 90,
  "steam_fan_cooldown": 6,
  "steam_fan_power": 12,
  "steam_finish_wait": 45,
  "steam_high_steam": 82,
  "steam_high_fire": 92,
  "steam_low_hint_after": 120,
  "steam_low_fire": 35,
  "steam_voice_cooldown": 150,
  "steam_relation": 1,
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
  "gather_help_misses": 2,
  "gather_help_width": 12,
  "gather_zone_start": 10,
  "gather_zone_span": 80,
  "gather_speed_gain": 0.3,
  "gather_cooldown": 12,
  "gather_finish_wait": 300,
  "gather_yield": 1,
  "gather_perfect_yield": 2,
  "gather_root_hits": 3,
  "gather_root_width": 18,
  "gather_root_speed": 1.5,
  "gather_ssari_hits": 1,
  "gather_ssari_width": 14,
  "gather_ssari_speed": 2.2,
  "gather_kkoe_hits": 1,
  "gather_kkoe_width": 14,
  "gather_kkoe_speed": 2.4,
  "gather_eoksae_hits": 2,
  "gather_eoksae_width": 18,
  "gather_eoksae_speed": 1.8,
  "gather_seogi_hits": 1,
  "gather_seogi_width": 12,
  "gather_seogi_speed": 2.4,
  "gather_darae_vine_hits": 2,
  "gather_darae_vine_width": 18,
  "gather_darae_vine_speed": 1.8
 },
 "TUNING": {
  "kkubeogi_cycle": 200,
  "kkubeogi_awake": 56,
  "kkubeogi_cue": 32,
  "field_move_speed": 1.7,
  "field_swing_speed": 0.7,
  "field_jump_velocity": -5.4,
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
  "save_interval": 30000
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
 ]
};
