'use strict';
/* 북쪽 영산 (4지역, 늦겨울→첫봄): 지역 정보, 처음 상태, 아이템, 채집, 깨어나는 가보(아빠의 약연).
   흐름과 엔딩은 design/narrative/yeongsan-scenario.md (제안). 원본 표: design/data/*.csv 의 yeongsan 줄.
   표에 없던 값은 웹에서 임시로 정했다 (표에 '제안'으로 적어 둠) */
(()=>{
const Rg=defineRegion('yeongsan',{
  order:4,name:'북쪽 영산',
  world:2400,startX:60,
  platforms:[{x:960,y:160,w:52},{x:1100,y:150,w:56},{x:1240,y:158,w:52},{x:2200,y:150,w:72}],
  clueTotal:3,
  cover:{
    tag:'북쪽 영산 체험판',sub:'늦겨울, 산꼭대기 호수',ready:'영산으로 오를 준비',go:'북쪽 영산으로',
    title:{kicker:'마지막 산',head:'북쪽 영산',start:'영산으로 오르기',body:[
      '큰 장터에서 북쪽으로 닷새. 길이 끝나는 곳에 눈 덮인 영산이 있다. 꼭대기 호수 가운데 섬에 오래된 신목이 서 있다고 한다.',
      '"값은 이미 치러졌다. 이번엔 내가 치른다." 아빠의 메모가 보따리 속에서 바스락거린다.',
      '아빠는 여기 있다. 그리고 아빠의 약연이, 처음으로 조금 따뜻하다.']},
    end:{kicker:'너구리 보부상 · 끝',head:'봄',body:[
      '아빠와 함께 집으로 돌아왔다. 엄마에게 되돌림 약을 먹였다.',
      '그날 밤, 엄마가 반딧불로 둔갑해 방을 밝혔다. 내가 아기였을 때처럼.',
      '엄마가 나를 부르려다 멈췄다. 내 이름은 이제 이 세상 누구에게도 없다. 엄마는 웃으며 새 이름을 지어 주었다.',
      '아빠의 말은 돌아오지 않았다. 아빠는 몸짓으로 웃었다. 모든 게 원래대로 돌아가지는 않았지만, 셈은 맞았다.']},
  },
  newState:()=>({
    pickups:[[985,160],[1128,150],[1265,158],[1340,GROUND]].map(([x,y])=>({x,y,item:'magamok',got:false})).concat([{x:330,y:GROUND,item:'jip',got:false}]),   // 산막 처마 밑 짚단
    digs:[{x:420,item:'darae_vine',done:false},{x:540,item:'darae_vine',done:false},{x:660,item:'darae_vine',done:false}],
    boss:{x:2120,dead:false},
    salg:{x:1480,home:1480,startle:0},   // 살금이: 귀를 세울 때 움직이면 달아난다
    f:{nalYTalk:false,nalYDone:false,seolpi:false,salgMet:false,salgDone:false,shortcut:false,
      dadMet:false,dadDone:false,sangunMet:false,spring:false,fruitGot:false,nameGiven:false,yakDone:false,newName:''},
    rel:{salgeumi:{t:'호감',v:0},sangun:{t:'외경',v:0},nal:{t:'경멸',v:0}},
  }),
  onStart(){
    diary('y_start','영산에 왔다. 눈이 허리까지 쌓였다. 산막에 불빛이 보인다.');
    toast('산막의 불빛 쪽으로 가 보자');
  },
  endStats:()=>[
    ['아빠 단서',G.clues.length+'/'+clueTotalSoFar()],
    ['쓰러진 횟수',G.f.faints],
  ],
});

/* 아이템 (items.csv). r 은 레어도 단계 - 1. 단계가 비어 있던 것은 임시로 정함 */
defineItems({
  darae_vine:{n:'다래 덩굴',r:0,d:'질기고 잘 휘는 덩굴. 테를 짜기 좋다.'},
  magamok:{n:'마가목 열매',r:1,d:'눈 속에서도 빨갛게 매달린 작은 열매. 산짐승의 겨울 양식.'},
  seolpi:{n:'설피',r:2,d:'짚신 밑에 대는 둥근 눈신. 깊은 눈길에도 빠지지 않는다.'},
  fur_tosi:{n:'털토시',r:2,d:'날쌘이 말없이 얹어 준 토시. 손이 시리지 않다.'},
  frost_whisker:{n:'서리 수염',r:2,d:'강철이가 떠나며 남긴 수염. 녹지 않는 서리가 맺혀 있다.'},
  ice_scale:{n:'얼음 비늘',r:1,d:'강철이의 몸통에서 떨어진 비늘. 햇빛에 비추면 무지개가 든다.'},
  icicle:{n:'고드름 조각',r:1,d:'강철이의 꼬리에서 부러진 고드름.'},
  broken_orb:{n:'깨진 여의주',r:3,d:'용이 되지 못한 이무기의 여의주. 금이 갔는데도 따뜻하다.'},
  dad_ledger:{n:'아빠의 장부 한 장',r:3,d:'오래된 거래 기록. 엄마의 글씨: "제 둔갑과 말을 드립니다. 아이의 숨을 주세요." 그 아래 아빠의 글씨: "말 하나 더함."'},
  legend_fruit:{n:'전설의 열매',r:4,d:'입으로만 전해지는 열매. 소문으로는 부를 준다지만 실은 잃어버린 것을 돌려준다.'},
  doerim_yak:{n:'되돌림 약',r:4,d:'아빠와 함께 약연을 돌려 간 약. 엄마의 둔갑과 말을 되돌린다.'},
});
defineIcons({
  darae_vine:P=>{P(3,12,3,2,'#6b5a3a');P(5,10,3,2,'#7a6a42');P(7,8,3,2,'#6b5a3a');P(9,6,3,2,'#7a6a42');P(11,4,2,2,'#6b5a3a');P(4,7,3,2,'#7fa860');P(10,9,3,2,'#7fa860');},
  magamok:P=>{P(7,2,2,4,'#6b4423');P(4,5,8,1,'#5a3a20');P(4,6,3,3,'#d0302a');P(8,6,3,3,'#e0402a');P(6,9,3,3,'#d0302a');P(10,9,3,3,'#c02a22');P(3,10,3,3,'#e0402a');P(4,6,1,1,'#ffb0a0');P(8,6,1,1,'#ffb0a0');P(3,4,10,1,'#f4f7fa');},
  seolpi:P=>{P(3,3,10,10,'#8a6a3a');P(4,4,8,8,'#d9b860');P(5,5,6,6,'#8a6a3a');P(6,6,4,4,'#d9b860');P(7,2,2,12,'#6b4423');P(2,7,12,2,'#6b4423');},
  fur_tosi:P=>{P(3,4,10,8,'#c9a878');P(3,4,10,2,'#efe6cf');P(3,10,10,2,'#efe6cf');P(5,6,1,4,'#a8865a');P(9,6,1,4,'#a8865a');},
  frost_whisker:P=>{P(2,8,4,1,'#e8f2fa');P(5,7,4,1,'#d8e8f4');P(8,6,4,1,'#e8f2fa');P(11,5,3,1,'#c8dcec');P(3,9,1,1,'#ffffff');P(9,7,1,1,'#ffffff');},
  ice_scale:P=>{P(5,4,6,8,'#a8d0e8');P(4,6,8,4,'#c8e4f4');P(6,5,2,2,'#ffffff');P(7,12,2,1,'#88b0c8');},
  icicle:P=>{P(5,2,6,2,'#d8ecf8');P(6,4,4,3,'#c0dcf0');P(7,7,2,4,'#a8d0e8');P(7,11,1,3,'#88b0c8');P(6,3,1,1,'#ffffff');},
  broken_orb:P=>{P(4,4,8,8,'#e8c860');P(3,6,10,4,'#e8c860');P(5,5,2,2,'#fff4c0');P(8,6,1,5,'#8a6a2a');P(9,8,2,1,'#8a6a2a');},
  dad_ledger:P=>{P(3,2,10,12,'#e6dcc0');P(3,2,10,1,'#c9b991');P(5,4,6,1,'#5a4a3a');P(5,6,6,1,'#5a4a3a');P(5,8,5,1,'#5a4a3a');P(5,11,4,1,'#2b1d14');P(10,10,2,2,'#b4432a');},
  legend_fruit:P=>{P(7,1,2,3,'#6b4423');P(9,1,3,2,'#7fa860');P(4,4,8,9,'#f0a0b8');P(3,6,10,5,'#f0a0b8');P(5,5,3,3,'#fde0ea');P(4,12,8,1,'#c06080');P(10,8,2,2,'#e080a0');},
  doerim_yak:P=>{P(5,2,6,2,'#8a6a3a');P(4,4,8,10,'#f4d0dc');P(4,4,8,1,'#fde8ee');P(5,6,6,7,'#f0a0b8');P(6,7,2,2,'#ffffff');P(4,13,8,1,'#c06080');},
});

/* 다래 덩굴은 낫으로 벤다 */
defineGather({
  darae_vine:{title:'다래 덩굴 베기',hits:2,zw:18,speed:1.8,hint:'눈 덮인 덤불 속 덩굴을 낫으로 벤다. 밝은 곳에 맞춰 두 번.',ok:['서걱, 한 줄기가 풀렸다.'],miss:'눈만 털렸다…'},
});

/* 아빠의 약연: 산군과의 셈이 맞은 뒤 아빠와 손을 포개면 깨어난다 (heirlooms.csv) */
defineRecipes({yakyeon:[{need:{legend_fruit:1},out:'doerim_yak',n:1}]});
})();
