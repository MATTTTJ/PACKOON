'use strict';
/* 돌너머 마을 (2지역, 초겨울·첫서리): 지역 정보, 처음 상태, 아이템, 채집, 깨어나는 가보(증조할아버지의 맷돌).
   흐름은 design/narrative/dolneomeo-scenario.md (제안). 원본 표: design/data/*.csv 의 dolneomeo 줄.
   수치 가운데 표에 없던 것은 웹에서 임시로 정한 값이다 (표에 '제안'으로 적어 둠) */
(()=>{
const Rg=defineRegion('dolneomeo',{
  order:2,name:'돌너머 마을',
  world:2400,startX:60,
  platforms:[{x:640,y:158,w:60},{x:1380,y:158,w:64},{x:2196,y:150,w:76}],
  clueTotal:3,
  cover:{
    tag:'돌너머 마을 체험판',sub:'첫서리 내린 돌담 마을',ready:'돌너머 마을로 들어갈 준비',go:'돌너머 마을로',
    title:{kicker:'둘째 마을',head:'돌너머 마을',start:'돌너머 마을로 들어가기',body:[
      '단풍골을 지나 북쪽으로 사흘을 걸었다. 밤새 첫서리가 내려 돌담마다 하얗게 소금을 뿌린 것 같다.',
      '해머루 약은 엄마의 병을 조금 늦췄을 뿐이다. 두꺼비 할멈은 돌산 절벽의 서리다래라면 한 번 더 늦출 수 있을 거라고 했다.',
      '아빠도 이 길을 지났을 것이다. 보따리 속 맷돌이 오늘따라 무겁다.']},
    end:{kicker:'돌너머 마을 체험판 완료',head:'큰 장터로 가는 길',body:[
      '깨어난 맷돌로 서리다래를 갈아, 내 손으로 엄마의 약을 만들었다. 까치가 약즙 통을 물고 남쪽으로 날아갔다.',
      '아빠는 약연의 글자 하나를 읽고 그날 밤 떠났다고 한다. 그 글자가 무엇이었을까. 큰 장터에 가면 알 수 있을지도 모른다.']},
  },
  newState:()=>({
    pickups:[
      ...[900,945,990,1240,1290,1335].map(x=>({x,y:GROUND,item:'memil',got:false})),
      {x:670,y:118,item:'gyeousari',got:false},{x:1412,y:118,item:'gyeousari',got:false},
    ],
    digs:[{x:470,item:'eoksae',done:false},{x:560,item:'eoksae',done:false},{x:760,item:'eoksae',done:false},{x:1030,item:'eoksae',done:false}],
    boss:{x:1990,dead:false},
    f:{kkuTalk:false,kkuAwake:false,kkuDone:false,ppuriMet:false,ppuriPassed:false,nalDTalk:false,nalDDone:false,nalDBluff:false,
      dolsoeMet:false,dolsoeTea:false,stackDone:false,stoneGiven:false,golemCalm:false,seogiTold:false,daraePicked:false,yakMade:false},
    rel:{kkubeogi:{t:'호감',v:0},dolsoe:{t:'신뢰',v:0},ppuri:{t:'의리',v:0},nal:{t:'경멸',v:0}},
  }),
  weather:()=>Vfx.setWeather('frost'),
  onStart(){
    diary('d_start','돌너머 마을에 왔다. 서리 맞은 돌담 사이로 장승이 우리를 내려다본다. 서리다래는 돌산 절벽에 있다고 했다.');
    toast('마을 어귀의 동물들에게 말을 걸어 보자');
  },
  next:'jangteo',
  /* 뒤 지역부터 바로 시작할 때 돌너머를 이렇게 마친 것으로 친다 (확인용 바로가기). 메밀 3은 큰 장터에서 메밀가루로 쓸 수 있다 */
  finish(g){
    g.inv.memil=(g.inv.memil||0)+3;g.inv.gyeolmyeongja=(g.inv.gyeolmyeongja||0)+1;g.inv.seogi=(g.inv.seogi||0)+1;
    if(!g.awake.includes('maetdol'))g.awake.push('maetdol');
    ['k1','s1','h2'].forEach(id=>g.clues.push({id,who:'돌너머 마을',text:'돌너머에서 찾은 단서 (바로가기로 시작해서 내용은 비어 있다)'}));
    g.diary.push({id:'skip_dolneomeo',text:'(돌너머 마을은 바로가기로 건너뛰었다.)'});
    ['eoksae','memil','memil_powder','gyeousari','gyeolmyeongja','seogi','seoridarae','darae_yak','story_stone'].forEach(id=>g.learned.push('got:'+id));
    ['kkubeogi','dolsoe','ppuri'].forEach(id=>g.learned.push('met:'+id));g.learned.push('fight:golem','kkubeogi:awake','dolsoe:tea','dolsoe:stack');
    Object.assign(g.f,{kkuDone:true,ppuriPassed:true,stackDone:true,yakMade:true});g.boss.dead=true;g.ended=true;
  },
  endStats:()=>[
    ['아빠 단서',G.clues.length+'/'+clueTotalSoFar()],
    ['돌쇠 할배의 신뢰',G.rel.dolsoe.v],
    ['쓰러진 횟수',G.f.faints],
  ],
});

/* 아이템 이름·레어도·설명은 design/data/items.csv (js/data/tables.js). 여기에는 아이콘만 */
defineIcons({
  eoksae:P=>{P(4,4,1,10,'#e8dcc0');P(7,2,1,12,'#efe6cf');P(10,3,1,11,'#e8dcc0');P(3,2,2,3,'#f6f0de');P(6,1,3,2,'#f6f0de');P(10,1,2,3,'#f6f0de');P(5,13,6,2,'#a8916a');},
  memil:P=>{P(6,4,4,2,'#3a3330');P(5,6,6,3,'#2b2522');P(6,9,4,2,'#3a3330');P(7,11,2,2,'#2b2522');P(7,5,1,2,'#6b625c');P(9,3,3,2,'#7a9a5a');},
  memil_powder:P=>{P(5,6,6,3,'#d8d2c6');P(6,5,4,1,'#ebe6dc');P(3,9,10,4,'#6b5a4a');P(4,13,8,1,'#4a3c30');P(4,9,8,1,'#8a7866');P(7,7,1,1,'#9a948a');},
  gyeousari:P=>{P(7,8,2,7,'#6b5a3a');P(3,4,4,3,'#6f9a4a');P(9,3,4,3,'#6f9a4a');P(5,7,3,2,'#5a8a3a');P(9,6,3,2,'#5a8a3a');P(6,3,2,2,'#f3e28a');P(10,8,2,2,'#f3e28a');P(4,8,1,1,'#f3e28a');},
  gyeolmyeongja:P=>{P(5,5,2,3,'#8a6a2a');P(8,4,2,3,'#9a7a32');P(10,7,2,3,'#8a6a2a');P(6,9,2,3,'#9a7a32');P(9,11,2,2,'#8a6a2a');P(3,10,2,2,'#9a7a32');P(5,5,1,1,'#c9a85a');P(8,4,1,1,'#c9a85a');},
  seogi:P=>{P(3,5,10,6,'#4a4440');P(4,4,8,1,'#5a544e');P(5,11,6,1,'#3a3430');P(6,6,4,3,'#2e2a26');P(4,6,1,1,'#7a746e');P(11,8,1,1,'#7a746e');P(7,12,2,3,'#8a8480');},
  seoridarae:P=>{P(7,1,2,3,'#6b5a3a');P(4,4,4,4,'#7fa860');P(8,4,4,4,'#8ab86a');P(5,8,4,4,'#7fa860');P(9,8,3,4,'#6f9850');P(5,5,1,1,'#f4fbff');P(9,5,1,1,'#f4fbff');P(6,9,1,1,'#f4fbff');P(10,9,1,1,'#f4fbff');},
  darae_yak:P=>{P(5,2,6,2,'#8a6a3a');P(4,4,8,10,'#a8c88a');P(4,4,8,1,'#c9e0b0');P(5,6,6,7,'#7fa860');P(6,7,2,2,'#d8f0c8');P(4,13,8,1,'#5a7a40');},
  story_stone:P=>{P(4,5,8,7,'#9a9690');P(3,7,10,4,'#8a8680');P(5,4,6,1,'#aeaaa4');P(5,7,1,3,'#2b2522');P(7,6,1,4,'#2b2522');P(9,7,1,3,'#2b2522');P(10,9,1,1,'#b4432a');P(4,12,8,1,'#6a6660');},
  mud:P=>{P(4,7,8,5,'#6b5038');P(3,9,10,3,'#5a422e');P(5,6,4,1,'#8a6a4a');P(9,10,2,1,'#3e2c1e');},
  stonedust:P=>{P(4,10,8,3,'#b8b2a8');P(5,8,6,2,'#c8c2b8');P(6,7,4,1,'#d8d2c8');P(3,12,10,1,'#9a948a');},
  mossy_eye:P=>{P(4,4,8,8,'#8a8680');P(3,6,10,4,'#8a8680');P(5,6,6,4,'#d8d2c6');P(7,7,2,2,'#2b2522');P(4,3,8,2,'#6f9a4a');P(3,4,2,2,'#5a8a3a');},
});

/* 채집 (낫으로 억새 베기, 절벽의 석이버섯 떼기) */
defineGather({
  eoksae:{title:'마른 억새 베기',hits:TABLES.MINIGAMES.gather_eoksae_hits,zw:TABLES.MINIGAMES.gather_eoksae_width,speed:TABLES.MINIGAMES.gather_eoksae_speed,hint:'아빠의 낫으로 밑동을 비스듬히 벤다. 밝은 곳에 맞춰 두 번이면 한 단이 넘어간다.',ok:['서걱, 반쯤 넘어갔다.'],miss:'줄기가 꺾이기만 했다…'},
  seogi:{title:'석이버섯 떼기',hits:TABLES.MINIGAMES.gather_seogi_hits,zw:TABLES.MINIGAMES.gather_seogi_width,speed:TABLES.MINIGAMES.gather_seogi_speed,hint:'바위에 바짝 붙은 버섯이다. 낫 끝으로 단번에 떼어 내야 찢어지지 않는다.',ok:[],miss:'가장자리가 찢어졌다…'},
});

/* 증조할아버지의 맷돌: 돌쇠 할배의 돌 쌓기를 통과하면 깨어난다. 가공법은 heirlooms.csv */
})();
