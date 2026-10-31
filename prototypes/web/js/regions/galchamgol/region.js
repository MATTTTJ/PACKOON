'use strict';
/* 단풍골 (1지역, 늦가을): 지역 정보, 처음 상태, 아이템, 채집, 깨어나는 가보(엄마의 절구).
   원본 표: design/data/regions.csv · items.csv · trades.csv · npcs.csv (id가 같다)
   이 지역의 나머지: art.js(동물 그림), field.js(배경·장애물), enemies.js(전투), story.js(대화·진행) */
(()=>{
const Rg=defineRegion('galchamgol',{
  order:1,name:'단풍골',
  world:2400,startX:70,
  platforms:[{x:330,y:160,w:64},{x:690,y:150,w:72},{x:990,y:158,w:60},{x:1310,y:150,w:66}],
  clueTotal:6,
  gatherDiary:['gather','흙을 살살 달래 가며 뿌리를 캤다. 서두르면 뿌리가 다친다고 엄마가 그랬다.'],
  cover:{
    tag:'단풍골 체험판',sub:'엄마의 약을 찾아 길을 나서는 우리 마을',ready:'길 떠날 준비',
    // 결정 D-36: 아빠의 마지막 편지는 "북쪽으로 간다. 눈 오기 전에 돌아가마." (design/data/decisions.csv)
    title:{kicker:'프롤로그',head:'단풍골, 우리 집',start:'길을 나서기',body:[
      '엄마가 내 이름을 잊어 가고 있다. 처음엔 둔갑을 못 하게 되더니, 요즘은 말이 자꾸 끊긴다.',
      '아빠는 소문 속 만병통치약을 찾아 떠났고, 석 달째 소식이 없다. 까치가 물어 온 마지막 편지에는 이렇게 적혀 있었다. "북쪽으로 간다. 눈 오기 전에 돌아가마."',
      '곧 첫눈이 온다. 나는 부엌의 살림 도구를 보따리에 싸고, 아빠의 보부상 모자를 썼다.']},
    end:{kicker:'단풍골 체험판 완료',head:'북쪽 길이 열렸다',body:[
      '두꺼비 할멈이 해머루로 달인 약을 까치 편에 집으로 보냈다. 엄마의 병을 고치지는 못해도, 조금은 늦출 수 있을 것이다.',
      '아빠는 북쪽으로 갔다. 나도 간다.']},
  },
  newState:()=>({
    inv:{rice:2},
    pickups:[[210,GROUND],[362,160],[540,GROUND],[726,150],[880,GROUND],[1020,158],[1200,GROUND],[1343,150]].map(a=>({x:a[0],y:a[1],item:'acorn',got:false})),
    digs:[{x:470,item:'root',done:false},{x:950,item:'ssari',done:false},{x:1250,item:'root',done:false},{x:1540,item:'kkoe',done:false}],
    barrier:{x:1660,hp:3,cut:false,shake:0},
    mobs:[{x:1760,dir:-1,hp:2,dead:false,min:1700,max:1840,flash:0},{x:1860,dir:1,hp:2,dead:false,min:1800,max:1920,flash:0}],
    boss:{x:2180,dead:false},
    drop:null,
    f:{dodamTalk:false,dodamDone:false,musoeMet:false,musoeDone:false,nalTalk:false,nalDone:false,toadMet:false,faints:0,musoeTested:false},
    /* 호감 축: 수첩의 물품 장부에 이 순서로 나온다 */
    rel:{dodam:{t:'호감',v:0},musoe:{t:'의리',v:0},nal:{t:'경멸',v:0},toad:{t:'호감',v:0}},
  }),
  weather:()=>Vfx.setWeather('maple'),
  weatherFront(){if(G.boss.dead){const x=2348-cam;if(x<W+20){R(x,GROUND-26,2,26,'#6b4423');R(x-8,GROUND-26,18,8,'#c9a27a');R(x+6,GROUND-24,2,4,'#6b4423');}}},
  onStart(){
    diary('start','오늘 길을 나선다. 엄마는 오늘 아침에도 내 이름을 한 번 잊었다. 아빠가 간 북쪽 길은 단풍골 끝에서 시작된다.');
    // 결정 D-68: 첫 화면 안내는 '할 일' 한 줄만. 같은 말을 알림으로 한 번 더 띄우지 않는다.
  },
  next:'dolneomeo',
  /* ?region=dolneomeo 처럼 뒤 지역부터 바로 시작할 때, 단풍골을 이렇게 마친 것으로 친다 (확인용 바로가기) */
  finish(g){
    g.tool='sickle';g.sharp=false;g.inv={rice:1,acorn:2,root:1,kflower:1};
    ['acorn','root','ssari','kkoe','meoru','kflower','powder','coal','vine'].forEach(id=>g.learned.push('got:'+id));
    ['dodam','nal','musoe','toad'].forEach(id=>g.learned.push('met:'+id));g.learned.push('fight:musoe','fight:kudzu');
    ['d1','n1','m1','m2','t1','h1'].forEach(id=>g.clues.push({id,who:'단풍골',text:'단풍골에서 찾은 단서 (바로가기로 시작해서 내용은 비어 있다)'}));
    g.diary.push({id:'skip_galchamgol',text:'(단풍골은 바로가기로 건너뛰었다.)'});
    Object.assign(g.f,{dodamDone:true,musoeDone:true,nalDone:true,toadMet:true,leafGiven:true});
    // 결정 D-69: 바로가기로 뒤 지역부터 시작해도 앞 지역에서 배운 변신은 갖고 간다(앞질러 가는 길을 검수할 수 있게).
    if(!g.forms.includes('squirrel'))g.forms.push('squirrel');
    g.boss.dead=true;g.barrier.cut=true;g.ended=true;
  },
  endStats:()=>[
    ['아빠 단서',G.clues.length+'/'+Rg.clueTotal],
    ['날쌘과의 경멸',G.rel.nal.v],
    ['쓰러진 횟수',G.f.faints],
  ],
});

/* 아이템 이름·레어도·설명은 design/data/items.csv (js/data/tables.js). 여기에는 아이콘만 */
defineIcons({
  acorn:P=>{P(7,1,2,2,'#4a2e1a');P(5,3,6,2,'#6b4423');P(4,5,8,2,'#8a5a2b');P(5,7,6,5,'#c9894a');P(6,12,4,1,'#a86d35');P(6,8,1,2,'#e2b07a');},
  powder:P=>{P(5,6,6,3,'#e3c99a');P(6,5,4,1,'#efdcb5');P(3,9,10,4,'#7a4b2a');P(4,13,8,1,'#5a361e');P(4,9,8,1,'#9b6a3d');},
  root:P=>{P(9,1,3,2,'#5f8a3a');P(7,2,2,4,'#8a5a2b');P(6,6,3,3,'#9b6a35');P(5,9,2,3,'#8a5a2b');P(8,9,2,4,'#7a4b2a');P(4,12,2,2,'#6b4423');P(9,12,2,2,'#6b4423');P(3,14,1,1,'#6b4423');},
  coal:P=>{P(6,5,4,4,'#333333');P(3,8,5,5,'#2b2b2b');P(8,7,5,6,'#1e1e1e');P(4,9,1,1,'#5a5a5a');P(9,8,1,1,'#5a5a5a');P(7,6,1,1,'#ff8a3a');},
  ssari:P=>{P(7,10,2,4,'#e9d8c4');P(4,4,2,6,'#e88b74');P(7,3,2,7,'#f0a08a');P(10,4,2,6,'#e88b74');P(3,3,2,2,'#f6b9a8');P(7,2,2,1,'#f6b9a8');P(11,3,2,2,'#f6b9a8');P(5,9,6,2,'#e9d8c4');},
  kkoe:P=>{P(3,4,10,2,'#f2b632');P(4,6,8,2,'#e8a524');P(6,8,4,2,'#e3a020');P(7,10,2,4,'#e8b84a');P(5,4,2,1,'#ffd36b');},
  meoru:P=>{P(8,1,4,3,'#5f8a3a');P(7,3,1,2,'#6b4423');P(5,5,3,3,'#6b3f8f');P(8,5,3,3,'#7d4aa6');P(4,8,3,3,'#7d4aa6');P(7,8,3,3,'#5a2f7a');P(10,8,2,3,'#6b3f8f');P(6,11,3,3,'#6b3f8f');P(9,11,2,2,'#5a2f7a');P(6,6,1,1,'#d9b3f0');P(9,6,1,1,'#ffd76a');P(5,9,1,1,'#d9b3f0');},
  vine:P=>{P(3,12,3,2,'#4f8a35');P(5,10,3,2,'#4f8a35');P(7,8,3,2,'#3f6b2a');P(9,6,3,2,'#4f8a35');P(11,4,2,2,'#3f6b2a');P(4,8,3,2,'#7fb069');P(10,9,3,2,'#7fb069');P(12,2,2,2,'#7fb069');P(2,14,2,1,'#3f6b2a');},
  kflower:P=>{P(7,9,2,6,'#4f8a35');P(9,11,3,2,'#7fb069');P(5,3,6,2,'#b07ad6');P(4,5,8,3,'#8e4fc2');P(6,8,4,2,'#b07ad6');P(7,5,2,2,'#f0d0ff');P(3,4,1,2,'#b07ad6');P(12,4,1,2,'#b07ad6');},
});

/* 흙더미 채집 */
defineGather({
  // 결정 D-108: rare = 한 흙더미를 모두 딱으로 캤을 때 하나 더 나오는 한 단계 위 재료 (그 자리에서 날 법한 것만)
  root:{title:'칡뿌리 캐기',hits:TABLES.MINIGAMES.gather_root_hits,spot:[0,-9],rare:'ssari',hint:'흙이 무른 칡뿌리 자리다. 커지는 원이 큰 기준원에 꼭 맞을 때 휘두르면 딱! 더 깊이 들어가 하나 더 나온다. 모두 딱이면 깊은 흙의 싸리버섯까지 딸려 나온다.'},
  ssari:{title:'싸리버섯 따기',hits:TABLES.MINIGAMES.gather_ssari_hits,spot:[0,-9],hint:'밑동을 단번에 꺾어야 갓이 안 상한다. 커지는 원이 큰 기준원에 꼭 맞을 때 휘두르면 딱! 옆에 난 것까지 꺾인다.'},
  kkoe:{title:'꾀꼬리버섯 따기',hits:TABLES.MINIGAMES.gather_kkoe_hits,spot:[0,-9],hint:'노란 갓이 다치지 않게 밑동을 꺾자. 커지는 원이 큰 기준원에 꼭 맞을 때 휘두르면 딱! 옆에 난 것까지 꺾인다.'},
});

/* 엄마의 절구는 처음부터 깨어 있다. 가공법은 heirlooms.csv */
})();
