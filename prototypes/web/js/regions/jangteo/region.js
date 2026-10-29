'use strict';
/* 큰 장터 (3지역, 한겨울·설 장날): 지역 정보, 처음 상태, 아이템, 가공법(맷돌 쌀가루, 깨어나는 잔칫날의 시루).
   흐름은 design/narrative/jangteo-scenario.md (제안). 원본 표: design/data/*.csv 의 jangteo 줄.
   표에 없던 값은 웹에서 임시로 정했다 (표에 '제안'으로 적어 둠) */
(()=>{
const Rg=defineRegion('jangteo',{
  order:3,name:'큰 장터',
  world:2400,startX:60,
  platforms:[{x:1750,y:158,w:62},{x:2010,y:150,w:66},{x:2200,y:156,w:60}],
  clueTotal:3,
  cover:{
    tag:'큰 장터 체험판',sub:'설 대목, 붉은 등불의 장터',ready:'큰 장터로 들어갈 준비',go:'큰 장터로',
    title:{kicker:'셋째 마을',head:'큰 장터',start:'큰 장터로 들어가기',body:[
      '돌산을 넘자 붉은 등불이 줄지어 걸린 큰 장터가 나왔다. 설을 앞둔 대목이라 눈 속에서도 사람과 짐승이 북적인다.',
      '그런데 장터 사람들 얼굴이 어둡다. 밤마다 물건이 없어지고, 설 제사상에 올릴 눈홍시까지 사라졌다고 한다.',
      '아빠가 보부상 숙소에 짐을 맡겨 두었다는 이야기를 들었다. 아빠는 약연의 글자 하나를 읽고 여기로 왔을까.']},
    end:{kicker:'큰 장터 체험판 완료',head:'북쪽 영산으로',body:[
      '엄마가 동네에 떡을 돌리던 시루로, 이번엔 엄마를 위한 홍시 약떡을 쪘다. 까치가 떡 보자기를 물고 남쪽으로 날아갔다.',
      '"글자는 \'되돌림\'이었다. 값은 이미 치러졌다. 이번엔 내가 치른다." 누가, 무슨 값을 치렀다는 걸까. 아빠는 북쪽 영산에 있다.']},
  },
  newState:()=>({
    /* 뒷산 소나무 숲의 솔방울. 셋은 통나무 위에 있다 */
    pickups:[[1700,GROUND],[1781,158],[1880,GROUND],[1960,GROUND],[2043,150],[2140,GROUND],[2230,156],[2300,GROUND]].map(([x,y])=>({x,y,item:'solbang',got:false})),
    digs:[],
    boss:{x:1500,dead:false},
    f:{night:false,bueongMet:false,bueongNight:false,bueongDone:false,guard:false,
      morakMet:false,morakPowder:false,steamDone:false,morakTaught:false,
      yeotMet:false,yeotDone:false,yeotHigh:false,nalJTalk:false,nalJDone:false,nalJBluff:false,
      dokCalm:false,hongsiMade:false},
    rel:{morak:{t:'호감',v:0},yeotbang:{t:'흥',v:0},bueong:{t:'의리',v:0},nal:{t:'경멸',v:0}},
  }),
  weather:()=>Vfx.setWeather(G.f.night?'market-night':'market-day'),
  weatherFront(){if(G.f.night)R(0,0,W,H,'rgba(10,14,40,.18)');},
  onStart(){
    diary('j_start','큰 장터에 왔다. 붉은 등불과 떡 찌는 김. 그런데 밤마다 장터 물건이 없어진다고 한다. 아빠가 보부상 숙소에 맡긴 짐이 있다.');
    toast('보부상 숙소와 떡집을 찾아보자');
  },
  next:'yeongsan',
  /* 뒤 지역부터 바로 시작할 때 큰 장터를 이렇게 마친 것으로 친다 (확인용 바로가기). 도깨비는 부순 것으로 (도깨비불씨·짚) */
  finish(g){
    Object.assign(g.inv,{sinpyo:1,dad_memo:1,dokkaebibul:1,jip:1,broom_sal:1,kong:1,eoksae:2,ssal:1});
    if(!g.awake.includes('siru'))g.awake.push('siru');
    ['j1','j2','j3'].forEach(id=>g.clues.push({id,who:'큰 장터',text:'큰 장터에서 찾은 단서 (바로가기로 시작해서 내용은 비어 있다)'}));
    g.diary.push({id:'skip_jangteo',text:'(큰 장터는 바로가기로 건너뛰었다.)'});
    ['solbang','ssal','ssal_powder','pat','patsirutteok','dokkaebibul','nunhongsi','sinpyo','dad_memo'].forEach(id=>g.learned.push('got:'+id));
    ['morak','yeotbang','bueong'].forEach(id=>g.learned.push('met:'+id));g.learned.push('fight:dokkaebi','morak:steam','bueong:sinpyo');
    Object.assign(g.f,{bueongDone:true,steamDone:true,yeotDone:true,hongsiMade:true});g.boss.dead=true;g.ended=true;
  },
  endStats:()=>[
    ['아빠 단서',G.clues.length+'/'+clueTotalSoFar()],
    ['엿방울의 흥',G.rel.yeotbang.v],
    ['부엉 영감의 의리',G.rel.bueong.v],
    ['쓰러진 횟수',G.f.faints],
  ],
});

/* 아이템 이름·레어도·설명은 design/data/items.csv (js/data/tables.js). 여기에는 아이콘만 */
defineIcons({
  solbang:P=>{P(6,3,4,2,'#8a5a2b');P(4,5,8,2,'#6b4423');P(5,7,6,2,'#8a5a2b');P(4,9,8,2,'#6b4423');P(6,11,4,2,'#8a5a2b');P(7,13,2,2,'#5a3a20');P(5,5,1,1,'#c9a06a');P(8,7,1,1,'#c9a06a');P(5,9,1,1,'#c9a06a');},
  ssal:P=>{P(4,9,8,4,'#f2efe6');P(5,8,6,1,'#f8f6ef');P(3,11,10,2,'#e6e1d4');P(5,10,1,1,'#d8d2c2');P(9,9,1,1,'#d8d2c2');P(2,13,12,1,'#c9b991');},
  ssal_powder:P=>{P(5,6,6,3,'#f6f4ee');P(6,5,4,1,'#ffffff');P(3,9,10,4,'#7a4b2a');P(4,13,8,1,'#5a361e');P(4,9,8,1,'#9b6a3d');},
  pat:P=>{P(4,6,3,3,'#8a2a22');P(8,5,3,3,'#a03228');P(6,9,3,3,'#8a2a22');P(10,9,3,3,'#a03228');P(4,6,1,1,'#e0a090');P(8,5,1,1,'#e0a090');P(10,9,1,1,'#e0a090');},
  patsirutteok:P=>{P(2,6,12,8,'#efe8dc');P(2,6,12,2,'#8a2a22');P(2,10,12,1,'#8a2a22');P(3,7,2,1,'#a03228');P(9,7,2,1,'#c04a3a');P(2,14,12,1,'#c9b991');},
  memiltteok:P=>{P(3,6,10,7,'#5a504a');P(3,6,10,1,'#7a706a');P(4,8,2,1,'#3a3430');P(9,10,2,1,'#3a3430');P(3,13,10,1,'#3a3430');},
  dad_yeot:P=>{P(3,4,2,9,'#d9a441');P(6,3,2,10,'#e6b54a');P(9,4,2,9,'#d9a441');P(3,9,8,2,'#b4432a');P(4,4,1,1,'#f6dc8a');P(7,3,1,1,'#f6dc8a');},
  sinpyo:P=>{P(4,2,8,12,'#8a5a2b');P(5,3,6,10,'#c9a06a');P(6,5,4,1,'#5a361e');P(6,7,4,1,'#5a361e');P(6,9,4,1,'#5a361e');P(7,0,2,3,'#b4432a');},
  dad_memo:P=>{P(3,2,10,12,'#efe6cf');P(3,2,10,1,'#d8c9a6');P(5,4,6,1,'#5a4a3a');P(5,6,5,1,'#5a4a3a');P(5,8,6,1,'#5a4a3a');P(5,10,4,1,'#5a4a3a');P(10,11,2,2,'#b4432a');},
  broom_sal:P=>{P(4,3,1,10,'#b9874a');P(7,2,1,11,'#a8743b');P(10,3,1,10,'#b9874a');P(3,12,10,2,'#8a5a2b');},
  kong:P=>{P(4,6,3,3,'#d9c07a');P(8,5,3,3,'#e6cf8a');P(6,9,3,3,'#d9c07a');P(10,9,3,3,'#c9b06a');},
  jip:P=>{P(3,5,10,2,'#d9b860');P(2,8,12,2,'#c9a850');P(3,11,10,2,'#d9b860');P(6,4,1,10,'#a8883a');},
  dokkaebibul:P=>{P(6,3,4,3,'#7ab8e8');P(5,6,6,5,'#4a90d0');P(6,11,4,2,'#3a70b0');P(7,5,2,3,'#d8f0ff');P(4,8,1,2,'#7ab8e8');P(11,7,1,2,'#7ab8e8');},
  nunhongsi:P=>{P(7,1,2,2,'#5a4a2a');P(5,3,6,2,'#6f9a4a');P(3,5,10,8,'#e0602a');P(4,4,8,1,'#e8783a');P(4,13,8,1,'#b4432a');P(5,6,2,2,'#f8b080');P(3,5,10,1,'#f4f7fa');P(10,6,2,1,'#f4f7fa');},
  hongsi_tteok:P=>{P(2,7,12,7,'#f2e6d2');P(3,6,10,1,'#f8f0e0');P(4,8,3,2,'#e0602a');P(9,9,3,2,'#e0602a');P(6,11,3,2,'#e8783a');P(2,14,12,1,'#c9b991');},
});

/* 가공법은 heirlooms.csv. 시루는 떡집 모락의 김 올리기를 배우면 깨어나고, 메밀떡은 모락에게 따로 배운다 (data/common.js) */})();
