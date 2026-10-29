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
      '돌산을 넘자 붉은 등불이 줄지어 걸린 큰 장터가 나왔다. 설을 앞둔 대목이라 눈 속에서도 장꾼과 길손이 북적인다.',
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
    Rg.arcs();
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

/* [시험판] 저장에 없는 플래그는 거짓으로 읽는다. 다른 지역의 상태는 바꾸지 않는다. */
Rg.arcs=()=>{
  const ARCS=/[?&]arcs=1\b/.test(location.search)||!!(G&&G.f&&G.f.arcs);
  if(ARCS&&G&&G.f)G.f.arcs=true;
  return ARCS;
};

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

/* PA-43 큰 장터 확장. 길손은 상인 명단과 별개이며 필수 물건을 받지 않는다.
   조사 text 접근자는 E로 조사할 때만 실행된다. 새 플래그는 큰 장터 안에서만 쓴다. */
(()=>{
if(CLASSIC)return;
const Rg=REGIONS.jangteo;
const draw=kind=>(x,y,f)=>Rg.expArt.wanderer(kind,x,y,f);
const record=(id,text)=>diary('jx_'+id,text);

function kiteChild(){
  if(G.f.jxKiteFreed){
    if(!G.f.jxKiteReeled){
      Rg.handWork('kite',()=>{G.f.jxKiteReeled=true;kiteChild();});return;
    }
    talk([
      ['연 아이','살았다, 내 방패연!\n줄은 천천히 감을게. 또 처마에 걸리면 곤란하니까.'],
      ['너구리','꼬리를 길게 달았네.\n저 멀리서도 네 연인 줄 알겠어.'],
      ['연 아이','설에 집으로 오는 동생한테 보이려고!\n저 붉은 차일 뒤로 오면 우리 좌판이거든.'],
      ['연 아이','고마워, 연 건져 준 보부상!\n기와가 이어진 쪽으로 가면 장터 지붕길이야.']
    ],()=>{G.f.jxKiteDone=true;record('kite','설에 돌아오는 동생에게 보이려고 날린 연을 내려 줬다. 아이와 연줄을 감고 붉은 차일 뒤 지붕길을 배웠다.');finishWanderer('j_kite');
      if(typeof grantNickname==='function')grantNickname('jangteo_kite','연 건지는 손','연 아이');});
    return;
  }
  if(G.f.jxKiteStarted){
    talk([['연 아이','상자 위에서 낮은 처마로 올라가 봐.\nSpace로 뛰고, 연 가까이서 E를 누르면 돼.']]);return;
  }
  talk([
    ['연 아이','줄을 당길수록 더 걸려.\n설 전에 동생한테 보여 줘야 하는 연인데…'],
    ['너구리','처마에 꼬리가 걸렸네.\n아래 상자부터 올라가 볼까?'],
    ['연 아이','줄은 내가 느슨하게 잡고 있을게.\n연 가까이서 E로 꼬리만 살짝 빼 주겠어?',[
      {t:'상자를 밟고 올라간다',go:()=>{G.f.jxKiteStarted=true;toast('상자 → 낮은 처마 → 연. 가까이서 E · 연 꼬리 풀기');}},
      {t:'잠깐 둘러보고 올게',go:null}
    ]]
  ]);
}

function yutElders(){
  talk([
    ['윷놀이 노인들','한 자리 비었네. 방석 당겨 앉게.\n객지 나간 새끼들 오기 전에 손부터 풀어야지.'],
    ['너구리','콩이랑 돌이 말이에요?'],
    ['윷놀이 노인들','식구들 좋아하는 걸로 골랐지.\n자네는 콩 네 알, 우리는 돌 네 개. 모두 들이면 이겨.'],
    ['윷놀이 노인들','윷은 직접 던지고 말도 골라 보게.\n이기든 지든 한 판 놀면 쌀 한 되 얹어 주지.',[
      {t:'윷판 앞에 앉는다',go:()=>Rg.playYut()},
      {t:'이번엔 구경할게요',go:null}
    ]]
  ]);
}

function babyBoar(){
  if(G.f.jxBoarScent2){
    if(!G.f.jxBoarBed){Rg.handWork('snow',()=>{G.f.jxBoarBed=true;babyBoar();});return;}
    talk([
      ['새끼 멧돼지','이 냄새야! 솔잎 아래 마른 풀이 있어.\n아까 엄마랑 여기서 쉬었어.'],
      ['너구리','눈 묻은 솔가지는 치워 둘게.\n바람은 바위가 막아 주네.'],
      ['새끼 멧돼지','엄마가 찾으러 오면 여기 있을래.\n큰 바위 뒤에 이상한 발자국도 봤어.'],
      ['새끼 멧돼지','킁킁, 이제 장터 냄새는 안 쫓아가.\n같이 천천히 걸어 줘서 고마워!']
    ],()=>{record('boar','장터 냄새를 따라 나온 새끼 멧돼지와 솔잎 냄새를 따라 잠자리로 돌아왔다. 바람을 막는 큰 바위 뒤에 발자국이 있다.');finishWanderer('j_boar');});
    return;
  }
  if(G.f.jxBoarStarted){
    talk([['새끼 멧돼지',G.f.jxBoarScent1?'부러진 솔가지 냄새는 여기까지야.\n조금 오른쪽, 마른 솔잎을 E로 살펴봐 줄래?':'장터 냄새 말고 숲 냄새를 찾아야 해.\n오른쪽에 부러진 솔가지를 E로 살펴봐 줄래?']]);return;
  }
  talk([
    ['새끼 멧돼지','달콤한 냄새만 따라왔는데 깜깜해졌어.\n집으로 가는 냄새가 안 나.'],
    ['너구리','코에 눈이 붙었네.\n털고, 하나씩 맡아 보자.'],
    ['새끼 멧돼지','마른 풀하고 솔잎 냄새였어.\n뛰지 말고 옆에서 같이 찾아줄래?',[
      {t:'솔가지부터 함께 살펴본다',go:()=>{G.f.jxBoarStarted=true;toast('오른쪽의 부러진 솔가지 → 마른 솔잎. E로 냄새 살펴보기');}},
      {t:'잠깐 길부터 살펴볼게',go:null}
    ]]
  ]);
}

function oldMagpie(){
  const south=G.diary.some(e=>e.id==='end'||e.id==='d_end');
  const earlier=Object.keys(G.f.wanderersDone||{}).some(k=>!k.startsWith('jangteo:')&&/magpie|kkachi|까치/.test(k));
  talk([
    ['늙은 까치',earlier?'또 만났구나. 이번엔 눈을 잔뜩 밟았네.\n나도 이 처마 밑에서 날개 좀 녹이려던 참이야.':'남쪽 오가는 까치들은 이 처마에서 쉬지.\n깊은 처마가 바람을 막아 주거든. 자네도 앉겠나?'],
    ['너구리',south?'약 보자기는 잘 갔겠죠?\n매듭은 꼭 묶었어요.':'남쪽 단풍골 너머에 우리 집이 있어요.\n여기 앉으면 그쪽 하늘도 보일까요?'],
    ['늙은 까치',south?'단풍골로 가는 길은 익숙하단다.\n보자기는 안쪽에 물고 날아야 바람에 풀리지 않아.':'굴뚝 김이 낮게 눕는 쪽이 남쪽이야.\n지금은 지붕에 가렸지만, 조금 높이 앉으면 보여.'],
    ['늙은 까치','잠깐 같이 김을 보고 있을까.\n발이 녹을 동안이면 충분해.',[
      {t:'곁에 앉아 지붕을 본다',go:()=>talk([
        ['너구리','지붕 위에서 김이 이어지네.\n엄마 시루에서도 저렇게 났는데.'],
        ['늙은 까치','눈 오는 날엔 김부터 눈에 들어오지.\n따뜻한 밥을 짓는 집이 저기 있다고.'],
        ['늙은 까치',G.awake.includes('siru')?'보따리에서도 따뜻한 김 냄새가 나는구나.\n이제 자네도 누굴 먹일 줄 아는 보부상이네.':'숙소 마루 끝에서 한번 바라보렴.\n고드름 너머 지붕이 낮은 산처럼 이어진단다.'],
        ['늙은 까치','밤엔 거리의 좌판을 접어 둔단다.\n그 뒤 틈길로 오면 이 처마까지 금방 돌아와.']
      ],()=>{G.f.jxMagpieRest=true;record('magpie','숙소 처마에서 까치와 지붕 위 김을 봤다. 밤에는 등불 꾸러미를 함께 풀기로 했다.');finishWanderer('j_magpie');startVista(Rg.zones.inn.vistas[0]);})},
      {t:'길을 조금 더 둘러볼게요',go:null}
    ]]
  ]);
}

Rg.expEncounters={
  wanderers:{
    entrance:[{id:'j_kite',name:'연 아이',x:1010,talk:kiteChild,draw:draw('kite'),greeting:'이번엔 줄을 짧게 잡았어!\n붉은 차일 뒤에서 동생을 기다릴 거야.'}],
    street:[{id:'j_yut',name:'윷놀이 노인들',x:1900,talk:yutElders,draw:draw('yut'),get greeting(){return G.awake.includes('siru')?'보따리에서 김 냄새가 나네.\n시루까지 깨어났으니 설 준비가 한결 든든하겠어.':'콩 말 주인이 오면 네 자리 얘기도 하마.\n다음엔 더 큰 방석을 펴 두지.';}}],
    inn:[{id:'j_magpie',name:'늙은 까치',x:1530,talk:oldMagpie,draw:draw('magpie'),get greeting(){return G.f.night?(G.f.jxLanternDone?'자네가 단 등을 따라 밤 길손들이 돌아왔네.\n아침에 떡 김 올라오면 다시 떠나겠지.':'밤이 됐구나. 오른쪽 등불 꾸러미를 풀어 보게.\n꺼진 골목에 같이 등을 달자.'):G.f.jxLanternDone?'밤새 등 따라 찾아온 길손들이 쉬고 갔네.\n이번엔 내가 남쪽으로 날아갈 차례야.':'밤에 다시 오게. 오른쪽에 등불 꾸러미를 놔둘게.\n길손들이 숙소를 찾게 불을 밝혀 주자.';}}],
    pine:[{id:'j_boar',name:'새끼 멧돼지',get x(){return G.f.jxBoarScent2?1980:G.f.jxBoarScent1?1780:1600;},talk:babyBoar,draw:draw('boar'),greeting:'엄마가 오면 여기서 코를 맞댈 거야.\n이번엔 달콤한 냄새가 나도 기다릴래.'}],
    warehouse:[]
  },
  examines:{
    entrance:[
      {id:'j_flag_knot',x:240,label:'장터 깃발 매듭',text:['깃발 아래 매듭은 풀기 쉽게 묶었다.\n장이 끝나면 눈 오기 전에 내려야 하니까.','돌받침 안쪽에 붉은 점이 있다.\n눈을 털면 발가락 모양이 보일까?']},
      {id:'j_kite_tail',x:1180,y:128,label:'연 꼬리 풀기',get text(){
        if(!G.f.jxKiteStarted)return '방패연 꼬리가 처마 못에 걸렸다.\n아래 아이에게 줄을 느슨하게 잡아 달라고 하자.';
        G.f.jxKiteFreed=true;return ['줄이 느슨해진 사이 꼬리를 살짝 뺐다.\n연이 아이 쪽으로 사르르 내려간다.',
          '처마에 걸렸던 꼬리를 반듯하게 폈다.\n아래에서 아이가 줄을 감고 있다.'];
      }},
      {id:'j_jangseung_snow',x:1680,label:'장승 코의 눈',text:'장승 코에만 눈이 안 쌓였다.\n지나가는 짐꾼들이 코를 톡 짚고 들어오나 봐.'}
    ],
    street:[
      {id:'j_stall_gap',x:310,label:'좌판 사이 골목',get text(){return G.f.night?'차일을 걷고 판을 접으니 골목이 나왔다.\n낮에는 물건 밑에 감춰져 있던 길이다.':'좌판 아래로 발자국이 이어지다 끊긴다.\n장을 마치고 판을 접으면 저 안으로 갈 수 있겠다.';}},
      {id:'j_steam_flour',x:1150,label:'쌀가루 묻은 발판',get text(){return G.awake.includes('siru')?'바닥 가루에 내 발자국도 섞였다.\n모락이랑 김을 올린 자리는 아직 따뜻하다.':'하얀 가루 사이로 큰 발자국이 오간다.\n모락이 맷돌과 아궁이를 몇 번이나 오갔을까.';}},
      {id:'j_broken_yut',x:2130,label:'반질반질한 윷가락',text:'한쪽 윷가락만 유난히 반질반질하다.\n노인들이 자기 차례마다 소매로 문질렀나 봐.'}
    ],
    inn:[
      {id:'j_inn_shoes',x:350,label:'마루 아래 신발',text:'눈 묻은 신발은 코를 바깥으로 돌려 뒀다.\n내일 갈 길을 향해 벌써 줄을 섰네.'},
      {id:'j_inn_pillar',x:1210,label:'기둥의 키 자국',text:'기둥에 작은 금이 층층이 그어져 있다.\n짐 키를 잰 걸까, 해마다 온 아이들 키일까?'},
      {id:'j_inn_icicle',x:1780,label:'처마 끝 고드름',text:'고드름 끝에 지붕이 거꾸로 매달렸다.\n물방울이 떨어지자 지붕도 잠깐 흔들린다.'}
    ],
    pine:[
      {id:'j_pine_scent1',x:1730,label:'부러진 솔가지',get text(){
        if(!G.f.jxBoarStarted)return '눈 아래에서 가지 하나가 부러졌다.\n진한 송진 냄새. 코끝이 얼얼하다.';
        G.f.jxBoarScent1=true;return '솔가지를 손바닥으로 덮어 눈을 털었다.\n새끼 멧돼지가 코를 들고 마른 솔잎 쪽으로 간다.';
      }},
      {id:'j_pine_scent2',x:1870,label:'눈 아래 마른 솔잎',get text(){
        if(!G.f.jxBoarScent1)return '큰 바위 밑에 마른 솔잎이 모였다.\n바람은 여기를 비켜 가는 모양이다.';
        G.f.jxBoarScent2=true;return '마른 솔잎 아래에서 따뜻한 풀 냄새가 났다.\n새끼 멧돼지가 오른쪽 잠자리를 알아보고 뛰어간다.';
      }},
      {id:'j_pine_scale',x:2280,y:128,label:'큰 바위의 솔방울 비늘',text:'솔방울 비늘이 바위 틈에 차곡차곡 끼었다.\n작은 발자국 아래에는 훨씬 오래된 붉은 자국이 있다.'}
    ],
    warehouse:[
      {id:'j_warehouse_rope',x:400,label:'접어 둔 좌판 끈',text:'끈 끝을 한데 묶어 바구니에 담았다.\n아침엔 이걸 풀어 다시 장을 펼치겠지.'},
      {id:'j_warehouse_scratches',x:1230,label:'창고 문 긁힌 자리',get text(){return G.boss.dead?'긁힌 문 옆에 돌아온 물건들이 놓였다.\n아침에 찾아갈 자리가 저마다 비어 있다.':'눈 위에 빗자루 자국이 지그재그로 났다.\n청소를 했다기엔 창고 문 앞만 빙빙 돌았네.';}},
      {id:'j_warehouse_mended',x:2470,y:128,label:'기운 멍석',get text(){return G.boss.dead?'바느질한 모서리에 눈 한 톨 안 묻었다.\n누가 멍석을 얌전히 접어 놓고 갔다.':'멍석 한 귀를 다른 색 짚으로 기웠다.\n헌것도 함부로 버리지 않는 장터구나.';}}
    ]
  }
};
})();
