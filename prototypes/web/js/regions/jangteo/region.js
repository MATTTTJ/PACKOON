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
      '돌산을 넘고도 고개를 여럿 더 넘었다. 첫눈은 고갯길에서 맞았다. 눈 덮인 길 끝에 붉은 등불이 줄지어 걸린 큰 장터가 나왔다. 설을 앞둔 대목이라 장꾼과 길손이 북적인다.',
      '그런데 장터 사람들 얼굴이 어둡다. 밤마다 물건이 없어지고, 설 제사상에 올릴 눈홍시까지 사라졌다고 한다. 두꺼비 할멈이 엄마 병을 한 번 더 늦출 수 있다고 한 그 눈홍시다.',
      '보부상은 장터에 오면 숙소부터 들른다. 약연의 글자 하나를 읽고 떠난 아빠도 여기 묵었을까.']},
    end:{kicker:'큰 장터 체험판 완료',head:'북쪽 영산으로',body:[
      '엄마가 동네에 떡을 돌리던 시루로, 이번엔 엄마를 위한 홍시 약떡을 쪘다. 까치가 떡 보자기를 물고 남쪽으로 날아갔다.',
      '"글자는 \'되돌림\'이었다. 값은 이미 치러졌다. 이번엔 내가 치른다." 누가, 무슨 값을 치렀다는 걸까. 아빠는 북쪽 영산에 있다.']},
  },
  newState:()=>({
    /* 뒷산 소나무 숲의 솔방울. 넷은 통나무 위에 있다. 결정 D-265: 80~100px 고른 간격을 몰렸다 비었다 하게 바꿨다.
       옛 구성에만 장터 골목에 땔감에서 흘린 솔방울 넷을 더한다(확장판은 구역 선언의 것을 쓴다). */
    pickups:[[1694,GROUND],[1772,158],[1797,158],[1952,GROUND],[2047,150],[2121,GROUND],[2236,156],[2318,GROUND]].map(([x,y])=>({x,y,item:'solbang',got:false}))
      .concat(CLASSIC?[215,500,790,1330].map((x,i)=>({id:'j_cl_'+i,x,y:GROUND,item:'solbang',got:false})):[]),
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
    diary('j_start','큰 장터에 왔다. 붉은 등불과 떡 찌는 김. 그런데 밤마다 장터 물건이 없어진다고 한다. 보부상이니 숙소부터 들러 보자.');
    // 결정 D-68: 첫 화면 안내는 '할 일' 한 줄만
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
    if(!g.forms.includes('owl'))g.forms.push('owl');   // 결정 D-69
  },
  endStats:()=>[
    ['아빠 단서',G.clues.length+'/'+clueTotalSoFar()],
    ['엿방울의 흥',G.rel.yeotbang.v],
    ['부엉 영감의 의리',G.rel.bueong.v],
    ['쓰러진 횟수',G.f.faints],
  ],
});

/* 사연 설정은 새 게임·저장 복원 때 정한 공통 판정을 따른다. */
Rg.arcs=arcsEnabled;

/* 아이템 이름·레어도·설명은 design/data/items.csv (js/data/tables.js). 여기에는 아이콘만 */
defineIcons({
  // 잣 세 알: 진한 테두리로 배경 위에서도 보이게 (PA-99 검수)
  jat:P=>{P(2,3,4,1,'#4f3820');P(1,4,1,4,'#4f3820');P(6,4,1,4,'#4f3820');P(2,8,4,1,'#4f3820');P(2,4,4,4,'#c79d5c');P(3,5,1,2,'#f1dcae');P(9,3,4,1,'#4f3820');P(8,4,1,4,'#4f3820');P(13,4,1,4,'#4f3820');P(9,8,4,1,'#4f3820');P(9,4,4,4,'#c79d5c');P(10,5,1,2,'#f1dcae');P(5,9,4,1,'#4f3820');P(4,10,1,4,'#4f3820');P(9,10,1,4,'#4f3820');P(5,14,4,1,'#4f3820');P(5,10,4,4,'#c79d5c');P(6,11,1,2,'#f1dcae');},
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
  // 결정 D-290: 해 준 일의 보상으로 받는 장터 먹을거리
  yugwa:P=>{P(3,5,10,6,'#5a3a22');P(4,4,8,8,'#f2e3c0');P(3,6,10,4,'#f2e3c0');P(5,5,2,1,'#fff7e2');P(9,7,1,1,'#e2c58e');P(6,9,1,1,'#e2c58e');P(8,10,1,1,'#e2c58e');},
  gangjeong:P=>{P(3,4,10,9,'#5a3a22');P(4,5,8,7,'#c9a35e');P(5,6,1,1,'#2f2418');P(8,6,1,1,'#f4ead0');P(10,8,1,1,'#2f2418');P(6,9,1,1,'#f4ead0');P(9,10,1,1,'#2f2418');P(5,11,1,1,'#f4ead0');},
  gotgam:P=>{P(7,2,2,2,'#4a3a22');P(5,3,6,2,'#6b5a2e');P(3,5,10,8,'#5a2a16');P(4,5,8,7,'#b4562a');P(5,6,2,2,'#d98a4e');P(4,11,8,1,'#efe6d6');P(3,9,1,2,'#efe6d6');},
  gunbam:P=>{P(3,5,5,6,'#3a2212');P(4,6,3,4,'#8a4a24');P(5,4,1,2,'#3a2212');P(8,6,5,6,'#3a2212');P(9,7,3,4,'#8a4a24');P(10,5,1,2,'#3a2212');P(9,8,1,2,'#f1d39a');P(4,7,1,2,'#f1d39a');},
  injeolmi:P=>{P(3,6,10,7,'#7a5a2a');P(4,7,8,5,'#e8c97a');P(5,6,6,1,'#f1d896');P(5,8,1,1,'#c9a050');P(9,9,1,1,'#c9a050');P(7,11,1,1,'#c9a050');},
  garaetteok:P=>{P(2,6,12,4,'#8a7a62');P(2,7,12,2,'#f7f3ea');P(3,6,10,1,'#ffffff');P(13,6,1,4,'#e2dbcc');P(6,7,1,2,'#e6dfd0');P(10,7,1,2,'#e6dfd0');},
  hobakyeot:P=>{P(3,4,4,9,'#6a3a10');P(4,5,2,7,'#e8a02a');P(9,3,4,10,'#6a3a10');P(10,4,2,8,'#e8a02a');P(4,5,1,2,'#f6d27a');P(10,4,1,2,'#f6d27a');},
});
// 결정 D-290: 보상 먹을거리는 먹으면 기운이 조금 난다 (주먹밥은 2)
defineItems({yugwa:{eat:1},gangjeong:{eat:1},gotgam:{eat:1},gunbam:{eat:1},injeolmi:{eat:1},garaetteok:{eat:1},hobakyeot:{eat:1}});

/* 가공법은 heirlooms.csv. 시루는 떡집 모락의 김 올리기를 배우면 깨어나고, 메밀떡은 모락에게 따로 배운다 (data/common.js) */
/* 수리부엉이 손님의 외상은 장터의 밤 장부에서만 연다 (PA-47, forms.js) */
Rg.strangerCreditAtNight=true;

/* 결정 D-82: 솔숲의 작은 소나무를 흔들어 솔방울을 떨군다 (채집 고리 D-41) */
defineGather({
  solbang:{title:'소나무 흔들기',rare:'jat',verb:'소나무 흔들기',hits:TABLES.MINIGAMES.gather_solbang_hits,spot:[0,-30],box:[-11,-44,11,0],hint:'작은 소나무 줄기를 친다. 커지는 원이 큰 기준원에 꼭 맞을 때 휘두르면 딱! 솔방울이 하나 더 떨어진다.'},
});
})();

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
    // 결정 D-321: 연 이벤트는 걸림 → 풀림 → 때움 → 다시 띄움으로 흐르고, 단계마다 연의 모습을 작은 창과 필드에 그린다(art.js kitePics·kiteScene).
    // 결정 D-293 의 지붕길 배우기는 뺐다(장터 순간이동 지붕문을 없앤다). 연 건져 준 값은 한과 좌판 유과(D-290)다.
    talk([
      ['얼레','살았다, 내 방패연!'],
      ['너구리','모서리가 처마 못에 찢겼어.'],
      ['얼레','이 정도는 괜찮아.\n조청 바르고 한지 덧대면 돼.'],
      ['너구리','(얼레가 좌판에서 조청을 찍어 와\n찢긴 모서리에 한지를 덧댄다.)'],
      Object.assign(['얼레','됐다. 다시 띄운다!'],{pic:Rg.kitePics.rise()}),
      ['너구리','꼬리를 길게 달았네.\n멀리서도 네 연인 줄 알겠어.'],
      ['얼레','설에 집으로 오는 동생한테 보이려고!\n저 붉은 차일 뒤로 오면 우리 좌판이거든.'],
      // 결정 D-322: '연 아이'를 얼레로 부른다. 아이는 연을 다시 띄운 뒤 제 입으로 이름을 알려 준다
      Object.assign(['얼레','난 얼레야. 연 날릴 땐 늘 얼레를 끼고 다녀서\n다들 그렇게 불러.'],{pic:null}),
      ['얼레','이건 우리 좌판 유과야. 연 건져 준 값!\n엄마가 파는 거니까 맛은 내가 장담해.'],
      gotLine('yugwa',2)
    ],()=>{addItem('yugwa',2);G.f.jxKiteDone=true;record('kite','설에 돌아오는 동생에게 보이려고 날린 연이 처마 못에 걸려 있었다. 꼬리를 풀어 주자 얼레가 찢긴 모서리를 한지로 때워 다시 띄웠다. 연 건져 준 값이라며 한과 좌판 유과를 받았다.');finishWanderer('j_kite');
      if(typeof grantNickname==='function')grantNickname('jangteo_kite','연 건지는 손','얼레');});
    return;
  }
  if(G.f.jxKiteStarted){
    talk([['얼레','상자 위에서 낮은 처마로 올라가 봐.\n꼬리만 살살 빼면 돼!']]);return;
  }
  talk([
    Object.assign(['얼레','줄을 당길수록 더 걸려.\n설 전에 동생한테 보여 줘야 하는 연인데…'],{pic:Rg.kitePics.stuck()}),
    ['너구리','꼬리가 처마 못에 감겼네.\n바람 불 때마다 연이 처마에 부딪혀.'],
    ['얼레','줄은 내가 느슨하게 잡고 있을게.\n올라가서 꼬리만 살짝 빼 줄래?',[
      {t:'상자를 밟고 올라간다',go:()=>{G.f.jxKiteStarted=true;toast('상자 → 낮은 처마 → 연. 가까이서 E · 연 꼬리 풀기');}},
      {t:'잠깐 둘러보고 올게',go:null}
    ]]
  ]);
}

/* 결정 D-318: 장터 길목의 작은 사건 (사용자 피드백 2026-11-02 "쓸모없는 부분을 콘텐츠로 채워라", 보상 규칙 D-271).
   해 준 일의 무게만큼, 그 장꾼다운 물건으로 갚는다. 받는 줄에는 "(○○을 얻었다.)"가 있다(D-235). */
function strawSeller(){
  if(G.f.jxStrawDone){talk([['청설모 할아범','새 끈은 질기구먼.\n오늘 장은 짚신 흘릴 걱정이 없겠어.']]);return;}
  talk([
    ['청설모 할아범','아이고, 짚신 꿴 끈이 삭아서 끊어졌구먼.\n장 서기 전에 다 주워야 하는데, 허리가 영 안 굽혀져.'],
    ['청설모 할아범','눈에 묻히면 젖어서 못 팔지.',[
      {t:'흩어진 짚신을 주워 드린다',go:()=>talk([
        ['너구리','(눈에 반쯤 묻힌 짚신을 한 켤레씩 찾아 털고,\n할아범이 내민 새 끈에 꿰었다.)'],
        ['청설모 할아범','열하나, 열둘… 하나도 안 빠졌구먼.\n남의 장짐 주워 준 걸 그냥 보낼 순 없지.'],
        ['청설모 할아범','짚신 삼고 남은 짚이다.\n불쏘시개로도 끈으로도 쓴다.'],
        gotLine('jip',2)
      ],()=>{addItem('jip',2);G.f.jxStrawDone=true;record('straw','장터 어귀에서 청설모 할아범이 흘린 짚신을 주워 새 끈에 꿰어 드렸다. 짚신 삼고 남은 짚을 받았다.');finishWanderer('j_straw');})},
      {t:'다음에',go:null}
    ]]
  ]);
}
function beanSeller(){
  if(G.f.jxBeanDone){talk([['까투리 아주머니','자루 밑을 두 번 꿰맸어.\n이제 장 끝날 때까지 끄떡없지!']]);return;}
  talk([
    ['까투리 아주머니','어머, 어머! 자루 밑이 터졌네!\n콩이 눈밭으로 다 굴러간다!'],
    ['까투리 아주머니','새들이 먼저 보면 끝장이야!',[
      {t:'같이 콩을 쓸어 담는다',go:()=>talk([
        ['너구리','(눈 위에 흩어진 콩을 손바닥으로 쓸어 자루에 담았다.\n아주머니가 터진 데를 짚으로 동여맨다.)'],
        ['까투리 아주머니','휴, 다 건졌네. 혼자였으면 새들 잔치 났겠어!'],
        ['까투리 아주머니','콩장수는 콩으로 갚아야지.\n한 되 넉넉히 담았다!'],
        gotLine('kong')
      ],()=>{addItem('kong',1);G.f.jxBeanDone=true;record('bean','장터 거리에서 까투리 아주머니의 콩 자루가 터져 같이 쓸어 담았다. 콩 한 되를 받았다.');finishWanderer('j_bean');})},
      {t:'다음에',go:null}
    ]]
  ]);
}

// 결정 D-325: 윷판 대신 투호 항아리. 두 노인이 번갈아 던지고, 아이는 이길 쪽에 솔방울을 건다 (판은 story.js Rg.playTuho)
function yutElders(){
  talk([
    ['너구리','(할아버지 둘이 항아리를 사이에 두고 화살을 번갈아 던진다.)'],
    ['곰방대 노인','곰방대가 던진다! …에잇, 테만 맞았네.'],
    ['흰눈썹 노인','기세만 좋지. 투호는 입에 고르게 넣는 거다.'],
    ['곰방대 노인','고르게 넣다 늙었지, 저 양반은.\n…꼬마, 구경하려면 하나 걸어라. 그래야 재미가 있지.'],
    ['너구리','판돈은 뭘로 해요?'],
    ['곰방대 노인','솔방울 하나. 화롯불 땔 거다.\n맞히면 이긴 쪽이 제 주머니에서 값을 치른다.'],
    ['흰눈썹 노인','내가 이기면 곶감 하나, 저 양반이 이기면 군밤 둘.\n저 양반이 이기는 날이 드무니 그렇다.'],
    ['곰방대 노인','드물어도 이기면 크게 이기지.',[
      {t:'투호 내기를 건다',go:()=>Rg.playTuho()},
      {t:'이번엔 그냥 지나갈게요',go:null}
    ]]
  ]);
}

function babyBoar(){
  if(G.f.jxBoarScent2){
    if(!G.f.jxBoarBed){Rg.handWork('snow',()=>{G.f.jxBoarBed=true;babyBoar();});return;}
    talk([
      ['알밤이','이 냄새야! 솔잎 아래 마른 풀이 있어.\n아까 엄마랑 여기서 쉬었어.'],
      ['너구리','눈 묻은 솔가지는 치워 둘게.\n바람은 바위가 막아 주네.'],
      ['알밤이','엄마가 찾으러 올 때까지 여기 있을래.\n큰 바위 뒤에 이상한 발자국도 봤어.'],
      // 결정 D-290: 잠자리를 찾아 준 몫. 멧돼지 코로 솔잎 밑 청설모가 묻은 잣을 파낸다
      ['너구리','(알밤이가 솔잎 더미에 코를 박고 킁킁 파헤친다.)'],
      ['알밤이','찾았다! 청설모가 묻어 둔 잣이야.\n엄마가 길에서 도움받으면 꼭 나누랬어.'],
      gotLine('jat',2),
      ['알밤이','이제 장터 냄새는 안 쫓아갈래.\n달콤한 냄새가 나도 여기서 기다릴 거야.']
    ],()=>{addItem('jat',2);record('boar','장터 냄새를 따라 나온 새끼 멧돼지 알밤이와 솔잎 냄새를 따라 잠자리로 돌아왔다. 멧돼지가 솔잎 밑에서 청설모가 묻은 잣을 파내 나눠 주었다. 바람을 막는 큰 바위 뒤에 발자국이 있다.');finishWanderer('j_boar');});
    return;
  }
  if(G.f.jxBoarStarted){
    talk([['알밤이',G.f.jxBoarScent1?'부러진 솔가지 냄새는 여기까지야.\n조금 더 가면 마른 솔잎 냄새가 나.':'장터 냄새 말고 숲 냄새를 찾아야 해.\n저기 부러진 솔가지, 같이 맡아 볼래?']]);return;
  }
  talk([
    ['알밤이','달콤한 냄새만 따라왔는데 깜깜해졌어.\n집으로 가는 냄새가 안 나.'],
    ['너구리','코에 눈이 붙었네.\n털고, 하나씩 맡아 보자. 이름이 뭐야?'],
    // 결정 D-322: '새끼 멧돼지'를 알밤이로 부른다. 밤빛 줄무늬에 동글동글해서 엄마가 붙인 이름이다
    ['알밤이','알밤이. 엄마가 그렇게 불러.\n집 냄새는 마른 풀하고 솔잎 냄새였어.'],
    ['알밤이','뛰지 말고 옆에서 같이 찾아줄래?',[
      {t:'솔가지부터 함께 살펴본다',go:()=>{G.f.jxBoarStarted=true;toast('오른쪽의 부러진 솔가지 → 마른 솔잎. E로 냄새 살펴보기');}},
      {t:'잠깐 길부터 살펴볼게',go:null}
    ]]
  ]);
}

function oldMagpie(){
  const south=G.diary.some(e=>e.id==='end'||e.id==='d_end');
  const earlier=Object.keys(G.f.wanderersDone||{}).some(k=>!k.startsWith('jangteo:')&&/magpie|kkachi|까치/.test(k));
  talk([
    ['늙은 까치',earlier?'아가, 또 만났구나.\n이 처마는 깊어서 늙은 날개가 쉬기 좋단다.':'남쪽 오가는 까치들은 이 처마에서 쉰단다.\n아가, 너도 앉으련?'],
    ['너구리',south?'엄마 약은 잘 갔어요?':'남쪽 단풍골에 우리 집이 있어요.\n여기 앉으면 그쪽 하늘도 보일까요?'],
    ['늙은 까치',south?'잘 갔지. 네 엄마가 통을 품에 안고 한참 있더라.\n…이번 길은 쉬엄쉬엄 왔다. 날개가 예전 같지 않아서.':'굴뚝 김이 낮게 눕는 쪽이 남쪽이란다.\n지붕에 가렸어도, 조금 높이 앉으면 보이지.'],
    ['늙은 까치','발 녹을 동안만 같이 앉아 있자꾸나.',[
      {t:'곁에 앉아 지붕을 본다',go:()=>talk([
        ['너구리','지붕 위에서 김이 이어지네.\n엄마 시루에서도 저렇게 났는데.'],
        ['늙은 까치','눈 오는 날 하늘에서 보면 김부터 보인단다.\n저기 따뜻한 밥 짓는 집이 있다고.'],
        ['늙은 까치',G.awake.includes('siru')?'네 보따리에서도 김 냄새가 나는구나.\n이제 너도 누굴 먹일 줄 아는구나.':'숙소 마루 끝에서 한번 바라보렴.\n고드름 너머 지붕이 낮은 산처럼 이어진단다.'],
        ['늙은 까치','밤이면 골목 등걸이 반은 비어 있단다. 길손들이 숙소를 못 찾지.\n…이 늙은 날개로는 이제 등을 못 달겠고.'],
        ['너구리','그럼 밤에 제가 달아 드릴게요.']
      ],()=>{G.f.jxMagpieRest=true;record('magpie','숙소 처마에서 까치와 지붕 위 김을 봤다. 밤에는 등불 꾸러미를 함께 풀기로 했다.');finishWanderer('j_magpie');startVista(Rg.zones.inn.vistas[0]);})},
      {t:'길을 조금 더 둘러볼게요',go:null}
    ]]
  ]);
}

Rg.expEncounters={
  wanderers:{
    entrance:[{id:'j_straw',name:'청설모 할아범',x:360,talk:strawSeller,draw:draw('straw'),greeting:'새 끈은 질기구먼.\n오늘 장은 짚신 흘릴 걱정이 없겠어.'},{id:'j_kite',name:'얼레',x:1010,talk:kiteChild,draw:draw('kite'),greeting:'이번엔 줄을 짧게 잡았어!\n붉은 차일 뒤에서 동생을 기다릴 거야.'}],
    street:[{id:'j_bean',name:'까투리 아주머니',x:880,talk:beanSeller,draw:draw('bean'),greeting:'자루 밑을 두 번 꿰맸어.\n이제 장 끝날 때까지 끄떡없지!'},{id:'j_yut',name:'투호 노인들',x:1900,talk:yutElders,draw:draw('yut'),get greeting(){return G.awake.includes('siru')?'보따리에서 떡 김 냄새가 나네.\n설 준비가 한결 든든하겠구나.':'또 걸 테냐? 솔방울 하나면 된다.\n화롯불은 늘 배가 고프거든.';}}],
    inn:[{id:'j_magpie',name:'늙은 까치',x:1530,talk:()=>{const l=Rg.magpieTteok?.();if(l)talk(l);else oldMagpie();},draw:draw('magpie'),get greeting(){const l=Rg.magpieTteok?.();if(l)return l;return G.f.night?(G.f.jxLanternDone?'네가 단 등을 따라 길손들이 찾아왔구나.\n아침 떡 김이 오르면 다들 또 떠나겠지.':'밤이 됐구나. 등불 꾸러미는 처마 옆에 있단다.\n등은 네가 달고, 길은 내가 일러 주마.'):G.f.jxLanternDone?'밤새 길손들이 쉬고 갔단다.\n이제 나도 남쪽으로 날아갈 차례구나.':'해 지면 다시 오려무나.\n골목 등 다는 걸 좀 거들어 다오.';}}],
    pine:[{id:'j_boar',name:'알밤이',hint:'킁킁, 킁킁. 솔숲 쪽에서 무언가 냄새를 쫓는 소리가 난다.',get x(){return G.f.jxBoarScent2?1980:G.f.jxBoarScent1?1780:1600;},talk:babyBoar,draw:draw('boar'),greeting:'엄마가 오면 여기서 코를 맞댈 거야.\n이번엔 달콤한 냄새가 나도 기다릴래.'}],
    warehouse:[]
  },
  examines:{
    entrance:[
      // 결정 D-310: 조사 자리를 큰 보부상단 깃발 밑(설계 700)으로 옮겼다. 예전엔 깃발 없는 장승 곁(240)에 있었다.
      {id:'j_flag_knot',x:700,label:'보부상단 깃발',text:['패랭이에 목화송이. 보부상단의 표다.\n내 모자 꼭지의 송이랑 같다.','이 깃발이 선 장에는 상단 숙소가 있다.\n돌받침 안쪽에는 붉은 점이 있다. 손바닥 모양일까?']},
      // 결정 D-321: 연 꼬리는 그 자리 그림 대신 연 장면 그림을 띄운다 (걸림 → 너구리 손이 풀면 줄에 끌려 내려감)
      {id:'j_kite_tail',x:1180,y:128,label:'연 꼬리 풀기',peek:false,get text(){
        if(!G.f.jxKiteStarted){if(typeof peekPicture==='function')peekPicture(Rg.kitePics.stuck().draw,{animate:true});
          return '방패연 꼬리가 처마 못에 감겼다.\n아래 아이에게 줄을 느슨하게 잡아 달라고 하자.';}
        if(!G.f.jxKiteFreed&&typeof peekPicture==='function')peekPicture(Rg.kitePics.free().draw,{animate:true});
        G.f.jxKiteFreed=true;return ['줄이 느슨해진 사이 꼬리를 못에서 살짝 뺐다.\n연이 얼레 쪽으로 흔들흔들 내려간다.',
          '처마 못에 연 종이 부스러기가 걸려 있다.\n여기에 모서리가 찢겼구나.'];
      }},
      {id:'j_jangseung_snow',x:1680,label:'장승 코의 눈',text:'장승 코에만 눈이 안 쌓였다.\n지나가는 짐꾼들이 코를 톡 짚고 들어오나 봐.'}
    ],
    street:[
      {id:'j_stall_gap',x:310,label:'좌판 사이 골목',get text(){return G.f.night?'차일을 걷고 판을 접으니 골목이 휑하다.\n낮에 북적이던 자리에 발자국만 남았다.':'좌판 아래로 콩알 몇 개가 굴러다닌다.\n어디 자루가 샜나?';}},   // 결정 D-316: 밤 골목 지름길을 뺐다
      {id:'j_onggi',x:575,label:'옹기전 독',text:'독을 손끝으로 퉁기니 맑게 운다.\n금 간 독은 둔하게 운다고, 장꾼이 하나씩 두드려 보고 판다.'},
      {id:'j_steam_flour',x:1150,label:'쌀가루 묻은 발판',get text(){return G.awake.includes('siru')?'바닥 가루에 내 발자국도 섞였다.\n모락이랑 김을 올린 자리는 아직 따뜻하다.':'하얀 가루 위에 큰 발자국이 어지럽다.\n모락이 아궁이 앞을 몇 번이나 오갔을까.';}},
      {id:'j_broken_yut',x:2130,label:'반질반질한 화살',text:'화살 하나만 깃이 유난히 반질반질하다.\n던지기 전마다 손가락으로 쓸어 넘긴 자국이다.'},
      {id:'j_gukbap',x:2470,label:'장국밥 가마솥',get text(){return G.f.night?'불 꺼진 가마솥에 아직 온기가 남았다.\n내일 장에 끓일 뼈가 소금에 절여 있다.':'가마솥에서 장국밥 김이 오른다.\n장꾼들이 선 채로 한 그릇씩 비우고 다시 짐을 진다.';}}
    ],
    inn:[
      {id:'j_inn_shoes',x:350,label:'마루 아래 신발',text:'눈 묻은 신발은 코를 바깥으로 돌려 뒀다.\n내일 갈 길을 향해 벌써 줄을 섰네.'},
      {id:'j_inn_pillar',x:1210,label:'기둥의 키 자국',text:'기둥에 작은 금이 층층이 그어져 있다.\n짐 높이를 잰 걸까, 해마다 온 아이들 키일까?'},
      {id:'j_inn_icicle',x:1780,label:'처마 끝 고드름',text:'고드름 끝에 지붕이 거꾸로 매달렸다.\n물방울이 떨어지자 지붕도 잠깐 흔들린다.'},
      {id:'j_inn_stable',x:2110,label:'마구간 나귀',get text(){return G.f.night?'나귀가 선 채로 졸다가 귀만 쫑긋한다.\n여물통에 짚이 반쯤 남았다.':'짐을 부린 나귀가 여물을 씹는다.\n숙소에 묵는 보부상들은 짐을 나귀에 실어 온다.';}}
    ],
    pine:[
      {id:'j_pine_scent1',x:1730,label:'부러진 솔가지',get text(){
        if(!G.f.jxBoarStarted)return '눈 아래 가지 하나가 부러져 있다.\n진한 송진 냄새. 코끝이 얼얼하다.';
        G.f.jxBoarScent1=true;return '솔가지에 쌓인 눈을 손바닥으로 털었다.\n알밤이가 코를 들고 마른 솔잎 쪽으로 간다.';
      }},
      {id:'j_pine_scent2',x:1870,label:'눈 아래 마른 솔잎',get text(){
        if(!G.f.jxBoarScent1)return '큰 바위 밑에 마른 솔잎이 모였다.\n바람은 여기를 비켜 가는 모양이다.';
        G.f.jxBoarScent2=true;return '마른 솔잎 아래에서 따뜻한 풀 냄새가 났다.\n알밤이가 오른쪽 잠자리를 알아보고 뛰어간다.';
      }},
      {id:'j_pine_scale',x:2280,y:128,label:'큰 바위의 솔방울 비늘',text:'솔방울 비늘이 바위 틈에 차곡차곡 끼었다.\n작은 발자국 아래에는 훨씬 오래된 붉은 자국이 있다.'}
    ],
    warehouse:[
      {id:'j_warehouse_rope',x:400,label:'접어 둔 좌판 끈',text:'끈 끝을 한데 묶어 바구니에 담았다.\n아침엔 이걸 풀어 다시 장을 펼치겠지.'},
      {id:'j_warehouse_fire',x:1780,label:'짐꾼 화톳불 자리',text:'짐꾼들이 짐을 부리며 쬐던 화톳불 자리다.\n재 속에 군밤 껍질이 묻혀 아직 따뜻하다.'},
      {id:'j_warehouse_scratches',x:1230,label:'창고 문 앞 빗자루 자국',get text(){return G.boss.dead?(Rg.arcs()&&!G.f.jangteoArcsYeotReturned?'창고 문 옆에 돌아온 물건들이 놓였다.\n그 사이에 날이 반질한 엿가위 하나. 장터 엿장수 거겠지?':'창고 문 옆에 돌아온 물건들이 놓였다.\n아침에 찾아갈 자리가 저마다 비어 있다.'):'눈 위에 빗자루 자국이 지그재그로 났다.\n청소를 했다기엔 창고 문 앞만 빙빙 돌았네.';}},
      {id:'j_warehouse_mended',x:2470,y:128,label:'기운 멍석',get text(){return G.boss.dead?'바느질한 모서리에 눈 한 톨 안 묻었다.\n누가 멍석을 얌전히 접어 놓고 갔다.':'멍석 한 귀를 다른 색 짚으로 기웠다.\n헌것도 함부로 버리지 않는 장터구나.';}}
    ]
  }
};
})();
