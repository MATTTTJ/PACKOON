'use strict';
/* 북쪽 영산 (4지역, 늦겨울→첫봄): 지역 정보, 처음 상태, 아이템, 채집. 깨어나는 가보는 없다(결정 D-421).
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
      '아빠는 여기 있다. 보따리 끈에 매단 짐표가 찬바람에 달그락거린다.']},
    end:{kicker:'너구리 보부상 · 끝',head:'봄',body:[
      '아빠와 함께 집으로 돌아왔다. 엄마에게 되찾음 약을 드렸다.',
      '그날 밤.']},
  },
  newState:()=>({
    pickups:[[985,160],[1128,150],[1265,158],[1340,GROUND]].map(([x,y])=>({x,y,item:'magamok',got:false})).concat([{x:330,y:GROUND,item:'jip',got:false}])   // 산막 처마 밑 짚단
      // 결정 D-265: 옛 구성에만 소나무 밑 솔방울 둘을 더한다(확장판은 구역 선언의 것을 쓴다)
      .concat(CLASSIC?[190,742].map((x,i)=>({id:'y_cl_'+i,x,y:GROUND,item:'solbang',got:false})):[]),
    // 결정 D-265: 120px 고른 간격이던 덤불을 들쭉날쭉하게. 확장판은 이 순서대로 산막 자리(SHELTER_VINES)로 옮긴다
    digs:[{x:404,item:'darae_vine',done:false},{x:551,item:'darae_vine',done:false},{x:612,item:'darae_vine',done:false}],
    boss:{x:2120,dead:false},
    salg:{x:1480,home:1480,startle:0},   // 살금이: 귀를 세울 때 움직이면 달아난다
    f:{nalYTalk:false,nalYDone:false,seolpi:false,salgMet:false,salgDone:false,shortcut:false,
      dadMet:false,dadDone:false,sangunMet:false,spring:false,fruitGot:false,nameGiven:false,yakDone:false,newName:''},
    rel:{salgeumi:{t:'호감',v:0},sangun:{t:'외경',v:0},nal:{t:'경멸',v:0}},
  }),
  weather:()=>Vfx.setWeather(G.f.spring?'':'snow'),surface:()=>G.f.spring?'':'snow',   // 결정 D-174: 눈 쌓인 바닥 (발걸음 효과)
  weatherFront(){if(!G.f.spring)R(0,0,W,H,'rgba(20,28,70,.12)');},
  // 결정 D-1079 (사용자 피드백 2026-11-06 영산 17): 영산은 까치 줄 대신 주인공 독백으로 연다. 지도는 조용히 열린다(engine/map.js quietMapUnlock)
  quietMapUnlock:true,
  onStart(){
    Rg.arcsEnabled();
    diary('y_start','영산에 왔다. 눈이 허리까지 쌓였다. 산막에 불빛이 보인다.');
    // 결정 D-68: 첫 화면 안내는 '할 일' 한 줄만
    if(!CLASSIC&&!G.f.yOpening){G.f.yOpening=true;
      talk([['너구리','(북쪽 영산이다.\n아빠가 마지막 편지에 간다고 적은 산.)'],
        ['너구리','(눈이 소리를 다 덮었다.\n내 숨소리밖에 안 들린다.)'],
        ['너구리','(…아빠도 이 눈을 밟고 올라갔겠지.\n이제 정말 가까이 왔다.)']]);}
  },
  // 마지막 가족 장면 위에는 점수를 띄우지 않는다 (단서 수는 아빠의 수첩에서 본다).
  endStats:()=>[],
});

/* 사연 설정은 새 게임·저장 복원 때 정한 공통 판정을 따른다. */
Rg.arcsEnabled=arcsEnabled;

/* 결정 D-429: 호숫가 구역은 이름 잃은 마을이다 (사용자 지시 2026-11-03, design/proposals/name-story.md §6). 호숫가 구역 설계 좌표.
   장승 둘 사이가 비탈에서 내려오는 어귀, 초가 다섯, 우물, 빨랫줄. 아빠는 호숫가 끝 큰 바위 곁 얼음 가에 앉아 있다. */
Rg.VILLAGE={jangseung:[125,205],houses:[360,640,790,1410,1760],well:470,line:[1805,1885],loom:700,jige:790,kid:1440,dad:2185,bear:1730,cub:1700};   // 결정 D-1075: 곰 아주머니 문간(오른쪽 끝 집)과 아기 곰
/* 강철이가 삼킨 이름이 돌아왔는가. 강철이가 떠나 봄이 오면 이름도 돌아온다 (이름의 규칙 6, D-420) */
Rg.namesBack=()=>!!(typeof G!=='undefined'&&G&&G.f&&(G.f.nameRestored||G.f.spring));

/* PA-43: 옛 배치와 저장은 classic 쪽에 남긴다. 공급은 기존 마가목 넷에 하나를 더한다. */
if(!CLASSIC){
  // 결정 D-207: 다래 덩굴 셋과 짚단이 30px 간격으로 붙어 있던 것을 들쭉날쭉 떨어뜨린다(사용자 피드백 58). 셋째 덩굴은 다람쥐 숨긴 몫(640)과 붙지 않게.
  const SHELTER_VINES=[296,348,706],SHELTER_STRAW=404;
  const oldState=Rg.newState;
  Rg.newState=()=>{
    const s=oldState();
    s.pickups=[{id:'shelter_straw',zone:'shelter',x:SHELTER_STRAW,y:GROUND,item:'jip',got:false},
      ...[['slope',420,GROUND],['slope',900,150],['shore',880,GROUND],['slope',1265,150],['island',2140,108]].map(([zone,x,y],i)=>
        ({id:'slope_rowan_'+i,zone,x,y,item:'magamok',got:false}))];
    s.digs=s.digs.map((d,i)=>({...d,id:'shelter_vine_'+i,zone:'shelter',x:SHELTER_VINES[i]}));
    return s;
  };
  Rg.placeRouteSupplies=()=>{
    for(const d of G.digs){
      const i=Number(d.id?.match(/^shelter_vine_([0-2])$/)?.[1]);
      if(Number.isInteger(i))Object.assign(d,{zone:'shelter',x:SHELTER_VINES[i]});
    }
    const straw=G.pickups.find(p=>p.id==='shelter_straw');if(straw)straw.x=SHELTER_STRAW;
  };
}

/* 아이템 이름·레어도·설명은 design/data/items.csv (js/data/tables.js). 여기에는 아이콘만 */
defineIcons({
  darae_vine:P=>{P(3,12,3,2,'#6b5a3a');P(5,10,3,2,'#7a6a42');P(7,8,3,2,'#6b5a3a');P(9,6,3,2,'#7a6a42');P(11,4,2,2,'#6b5a3a');P(4,7,3,2,'#7fa860');P(10,9,3,2,'#7fa860');},
  magamok:P=>{P(7,2,2,4,'#6b4423');P(4,5,8,1,'#5a3a20');P(4,6,3,3,'#d0302a');P(8,6,3,3,'#e0402a');P(6,9,3,3,'#d0302a');P(10,9,3,3,'#c02a22');P(3,10,3,3,'#e0402a');P(4,6,1,1,'#ffb0a0');P(8,6,1,1,'#ffb0a0');P(3,4,10,1,'#f4f7fa');},
  seolpi:P=>{P(3,3,10,10,'#8a6a3a');P(4,4,8,8,'#d9b860');P(5,5,6,6,'#8a6a3a');P(6,6,4,4,'#d9b860');P(7,2,2,12,'#6b4423');P(2,7,12,2,'#6b4423');},
  fur_tosi:P=>{P(3,4,10,8,'#c9a878');P(3,4,10,2,'#efe6cf');P(3,10,10,2,'#efe6cf');P(5,6,1,4,'#a8865a');P(9,6,1,4,'#a8865a');},
  // 결정 D-1148: 어둑차사 부위에서 얻는 것 (id 는 옛 강철이 것 그대로). 붉은 천 조각 · 언 까마귀 깃 · 고드름 조각 · 검은 갓 · 짚신
  frost_whisker:P=>{P(4,3,8,10,'#a3261c');P(4,3,8,1,'#c84a3a');P(5,5,4,1,'#5e120c');P(6,7,5,1,'#5e120c');P(5,9,3,1,'#5e120c');P(11,10,2,3,'#a3261c');P(3,12,2,1,'#a3261c');},
  ice_scale:P=>{P(7,2,2,12,'#2a2420');P(5,4,2,8,'#1d1915');P(9,4,3,8,'#1d1915');P(4,6,1,4,'#2a2420');P(12,5,1,5,'#2a2420');P(6,3,1,2,'#d8ecf8');P(10,6,1,2,'#d8ecf8');P(8,13,1,2,'#6b5a4a');},
  icicle:P=>{P(5,2,6,2,'#d8ecf8');P(6,4,4,3,'#c0dcf0');P(7,7,2,4,'#a8d0e8');P(7,11,1,3,'#88b0c8');P(6,3,1,1,'#ffffff');},
  broken_orb:P=>{P(1,10,14,2,'#14100d');P(2,9,12,1,'#2a2420');P(5,4,6,6,'#14100d');P(5,4,6,1,'#3d3630');P(4,12,1,3,'#2a2420');P(11,12,1,3,'#2a2420');},
  jipsin:P=>{P(3,4,4,10,'#c9a868');P(9,3,4,10,'#c9a868');P(3,6,4,1,'#8a6a38');P(3,9,4,1,'#8a6a38');P(9,5,4,1,'#8a6a38');P(9,8,4,1,'#8a6a38');P(4,4,2,1,'#e8d29a');P(10,3,2,1,'#e8d29a');},
  dad_ledger:P=>{P(3,2,10,12,'#e6dcc0');P(3,2,10,1,'#c9b991');P(5,4,6,1,'#5a4a3a');P(5,6,6,1,'#5a4a3a');P(5,8,5,1,'#5a4a3a');P(5,11,4,1,'#2b1d14');P(10,10,2,2,'#b4432a');},
  legend_fruit:P=>{P(7,1,2,3,'#6b4423');P(9,1,3,2,'#7fa860');P(4,4,8,9,'#f0a0b8');P(3,6,10,5,'#f0a0b8');P(5,5,3,3,'#fde0ea');P(4,12,8,1,'#c06080');P(10,8,2,2,'#e080a0');},
  doerim_yak:P=>{P(5,2,6,2,'#8a6a3a');P(4,4,8,10,'#f4d0dc');P(4,4,8,1,'#fde8ee');P(5,6,6,7,'#f0a0b8');P(6,7,2,2,'#ffffff');P(4,13,8,1,'#c06080');},
});

/* 다래 덩굴은 낫으로 벤다 */
defineGather({
  // 결정 D-500: 한 번도 칸을 놓치지 않으면 덤불에 얽힌 마가목 가지가 흔들려 열매 하나가 떨어진다 (영산 비탈의 마가목, 한 단계 위)
  darae_vine:{title:'다래 덩굴 베기',hits:TABLES.MINIGAMES.gather_darae_vine_hits,spot:[-2,-14],box:[-10,-18,10,0],rare:'magamok',hint:'눈 덮인 덤불 속 덩굴을 낫으로 벤다.'},
});

/* 결정 D-421: 마지막 약은 아빠와 함께 엄마의 절구로 찧는다(story.js makeReturningMedicine). 가공법은 heirlooms.csv 절구 줄 */
})();

/* 영산의 함께 하는 일(곰 잠자리, 얼음 표시, 배 띄우기 등) */
(()=>{
const Rg=REGIONS.yeongsan;
// 결정 D-88: 손일은 미니게임 없이 바로 마친다 (확정: 미니게임은 채집·전투·놀이에만, 대장 2026-10-30). 막혀 있던 판정 코드는 지웠다.
// 다녀간 일은 G.f.yActivities에 센다(사연 조건).
const ACTIVITIES=new Set(['lure','nutcracker','otter','farewell','namesPost','hutPrint','snowPrint','shorePrint','ice1','ice2','ice3','oar','rope','launch','sail']);   // 결정 D-1075·D-1076: 곰 굴·까마귀 대신 아기 곰·잣까마귀
Rg.playActivity=(id,callback)=>{
  if(ACTIVITIES.has(id)){Sound.gather(true);const log=G.f.yActivities||(G.f.yActivities={});log[id]=(log[id]||0)+1;}
  callback?.();
};

/* 3개 관찰 지점은 본길에 놓인다. 샛길의 도장·선물과는 독립이다.
   마지막 선택을 미룬 채 봄 호수로 돌아와도 전 재료와 아빠에게 닿는다. */
if(CLASSIC)return;
// 결정 D-132: 바위 곁·검은 금 막대(1·2)는 둘러보기. 건너는 데는 아빠가 길을 이어 주는 선착장 앞 막대(3)만 있으면 된다.
const ready=()=>!!G.f.yIce3;
const boatReady=()=>!!G.f.yBoatOar&&!!G.f.yBoatRope&&!!G.f.yBoatLaunch;
const mark=(x,y)=>{
  R(x-2,y-27,4,27,'#8c735d');R(x-9,y-28,18,3,'#d9c18c');
  for(let i=0;i<3;i++)R(x-15+i*13,y-1,8,2,'#bdcfd6');
};
const fixture=(id,name,x,talkFn)=>({id,name,x,prompt:name,talk:talkFn,draw:mark,peek:true});
function survey(i){
  if(i===3&&!G.f.dadDone){talk([['너구리',G.f.dadMet?'아빠한테 다시 가 보자.\n얼음길보다 아빠가 먼저야.':'호숫가 끝에 누가 앉아 있어.\n얼음길보다 저쪽이 먼저야.']]);return;}
  if(G.f['yIce'+i]){talk([['너구리','여긴 두드려 봤어. 표시한 가지를 따라가면 돼.']]);return;}
  // 결정 D-1022: 막대 자리 그림은 말하는 것(두드리는 가지·검은 금·아빠 발자국)을 그린다
  const pic=Rg.pics,withPic=(l,p)=>Object.assign(l,{pic:p});
  const lines={
    1:[withPic(['너구리','(가늘고 긴 가지를 주웠다. 발은 마른 돌 위에 둔다.)'],pic.iceTap),['너구리','흰 얼음과 갈대 곁이 다르게 울린다. 색만 보고 밟으면 안 되겠네.']],
    2:[withPic(['너구리','(얼음 밑의 검은 금이 호수 안쪽으로 이어진다.)'],pic.blackCrack),['너구리','금 밑으로 물이 흐른다. 저리로는 못 가.\n마른 둑 쪽으로 돌아가자.']],
    // 결정 D-436: 넋이 빠진 아빠는 길을 일러 주지 못한다. 대신 버릇처럼 날마다 섬 기슭까지 오가며 다진 발자국이 남았다(싸우러 건너던 길)
    3:[withPic(['너구리','(얼음 위에 발자국이 한 줄로 나 있다.\n호숫가 끝에서 섬 쪽으로 갔다가, 되돌아온 발자국.)'],pic.dadPrints),['너구리','(아빠 발자국이다. 날마다 같은 데로 다녔구나.\n…여기만 밟으면 꺼지지 않겠다.)']]
  };
  talk(lines[i],()=>Rg.playActivity('ice'+i,()=>{
    G.f['yIce'+i]=true;
    diary('y_ice_'+i,['','바위 곁에서 얼음을 두드렸다. 하얗게 보여도 갈대 곁에서는 물소리가 났다. 발 디딜 곳에 가지를 세웠다.','검은 금을 따라 흐르는 물을 봤다. 마른 둑 쪽을 택하고 돌아설 자리도 표시했다.','신목으로 이어지는 아빠 발자국을 찾았다. 날마다 섬 기슭까지 갔다가 되돌아온 자국이다. 그 자리에 가지를 세웠다. 봄엔 이 표시가 물길을 알려 주겠다.'][i]);
    talk([['너구리',i===3?'아빠 발자국 따라 가지를 세웠어.\n여기만 밟고 가자. 아빠, 다녀올게.':'표시 하나 세웠다. 다음 돌까지는 여기서 보여.']],refreshGoal);
  }));
}
function prepareBoat(part){
  const key={oar:'yBoatOar',rope:'yBoatRope',launch:'yBoatLaunch'}[part];
  if(G.f[key]){talk([['너구리','아까 손본 자리다.']]);return;}
  if(part==='launch'&&(!G.f.yBoatOar||!G.f.yBoatRope)){
    talk([['낚시하는 수달','둑에 둔 노부터 챙기자. 조금 앞에 있어.'],['살금이','노 옆 고리도… 보고 와 줘. 내가 배를 잡고 있을게.']]);return;
  }
  // 결정 D-1022: 노·고리·배 띄우기를 그린 그림을 첫 줄에 단다
  talk([Object.assign(['낚시하는 수달',part==='oar'?'겨울엔 얼음 구멍만 봤지.\n이제 같이 호수에 나가자. 노는 여기 올려 뒀어.':part==='rope'?'물에 뜨면 이젠 이 끈이 배를 잡아 줘야지.\n나중에 풀기 쉬운 고리를 만들자.':'우린 겨울마다 배를 둑에 올려 둬. 이번엔 네가 뒤를 받쳐 줄래?'],{pic:Rg.pics[part]}),
    ['살금이','나, 나도 도울게. 물가 돌이라면 내가 잘 아니까.']],()=>Rg.playActivity(part,()=>{
      G.f[key]=true;diary('y_boat_'+part,{oar:'둑에 올려 둔 노를 수달, 살금이와 함께 손봤다.',rope:'배 묶는 고리를 새로 맸다. 살금이가 말뚝 곁을 눌러 줬다.',launch:'수달, 살금이와 작은 배를 물에 띄웠다.'}[part]+' 겨울에 살핀 얼음길이 봄 물길로 바뀌었다.');
      talk([['너구리',part==='launch'?'배가 떴다! 겨울에 못 본 호수도 보러 가자.':'됐다. 다음 자리도 같이 보자.']]);
    }));
}
function sail(to){
  const returning=G.zone==='island';
  if(!G.f.spring){
    if(!G.f.dadDone){talk([['너구리','아빠가 기다리고 있어. 먼저 아빠에게 가자.']]);return;}
    if(!ready()){
      talk([['너구리','아직 길을 모르겠어. 선착장 앞 막대에서 얼음을 먼저 두드려 보자.']]);return;
    }
    changeZone(to,{x:to==='island'?200:2320});return;
  }
  if(!returning&&!boatReady()){
    talk([['낚시하는 수달','배는 둑에 올려 뒀어. 노, 고리, 배 밑 차례로 같이 보자.'],['살금이','마른 돌길로 걸어와. 나는 선착장에서 기다릴게.']]);return;
  }
  if(returning&&!G.f.yBoatReturn){
    talk([['낚시하는 수달','물이 풀리자마자 살금이랑 노를 챙겨 왔어.\n봄마다 내가 타던 배야.'],['살금이','너, 너도 타. 호숫가까지 데려다줄게.'],['낚시하는 수달','다음엔 네 손으로도 띄워 보자. 둑에 올릴 때 같이 들면 돼.']],()=>voyage(to,true));return;
  }
  talk([['낚시하는 수달','이번엔 어느 길로 갈까?',[{t:'겨울에 표시한 길 따라 노를 젓는다',go:()=>voyage(to,false)},
    {t:'앞서 건넌 물길로 바로 간다',go:()=>{if(G.f.yBoatSailed)changeZone(to,{x:to==='island'?200:2320});else voyage(to,false);}},
    {t:'아직 물가를 더 본다',go:null}]]]);
}
function voyage(to,firstReturn){
  Rg.playActivity(to==='island'?'sailOut':'sail',()=>{
    G.f.yBoatSailed=true;if(firstReturn)G.f.yBoatReturn=true;
    diary('y_boat_sail','수달, 살금이와 노를 저었다. 겨울 얼음길에 세운 가지가 봄 호수에서도 길을 알려 줬다. 물길은 열렸고 둑에서 다시 배를 띄울 수 있다.');
    changeZone(to,{x:to==='island'?200:2320});
    talk([['살금이','돌만 보던 길인데… 물 건너서 보니 다르네.'],['너구리','우리 발자국 있던 데로 배가 왔어.']]);
  });
}
function traceStamp(s,fresh=false){
  const traced=G.f.yStampHands||(G.f.yStampHands={});
  const record=()=>{const page=Object.values(NOTES).find(p=>p.lines.some(l=>l.when===s.note));return (page?.lines||[]).filter(l=>l.when===s.note).map(l=>['아빠의 옛 기록',l.text]);};
  // 결정 D-1023: 따라가 본 도장도 다시 누르면 그날 이야기를 다시 읽는다
  if(traced[s.id]){talk([['너구리','손끝으로 따라가 본 무늬다. 수첩의 그날 이야기를 다시 읽어 보자.'],...record()]);return;}
  const details={
    hut_post:{act:'hutPrint',intro:'문설주에 아빠 손바닥 도장이 있어. 문을 잡던 손이 여기에 닿았겠지.',look:'바깥쪽은 매끈하고 무늬 안쪽은 거칠다.\n눈을 털고 내 손으로 따라가 볼까?',after:'보따리 가득 채워 올 줄 알았구나. 난 엄마 약 하나면 돼.'},
    snow_sign:{act:'snowPrint',intro:'기둥 뒤에 무늬를 팠네. 눈이 덮여도 이 홈은 없어지지 않았어.',look:'젊은 아빠도 여기서 아래를 봤겠지.\n무늬를 짚으면서 아빠가 보던 쪽으로 서 보자.',after:'여기서 내려갈 길을 그려 봤구나. 나도 저 불빛 따라 내려갈래.'},
    shore_rock:{act:'shorePrint',intro:'바위의 오래된 무늬와 눈에 찍힌 새 발자국이 나란히 있어.',look:'무늬가 얼마나 닮았는지 손끝으로 짚어 보자.\n미끄럽지 않은 바위 쪽에서부터.',after:'젊었을 땐 빈손으로 혼자 내려갔구나. 이번엔 같이 돌아가야지.'}
  }[s.id];
  if(!details)return;
  // 결정 D-1023 (사용자 피드백 2026-11-06 영산 24·32): 찾은 순간의 알림을 먼저 이 대화의 첫 줄로 끝낸다. 대화가 끝난 뒤에 찾았다는 창이 다시 뜨지 않는다.
  //   "나중에"로 끊어도 그 도장을 다시 누르면 이 대화가 다시 열린다(s.revisit, engine/field.js interactWith).
  const first=fresh?[['너구리','(아빠 손바닥 도장이다!\n수첩에 그날 이야기가 있을 거야.)']]:[];
  talk([...first,['너구리',details.intro],['너구리',details.look,[
    {t:'손끝으로 무늬를 따라가 본다',go:()=>Rg.playActivity(details.act,()=>{
      traced[s.id]=true;
      const lines=record();
      diary('y_stamp_hands_'+s.id,'도장의 홈을 손끝으로 짚고 수첩의 그날 이야기를 읽었다. '+details.after);
      talk([...lines,['너구리',details.after]]);
    })},{t:'무늬는 찾았으니 나중에 볼게',go:null}
  ]]]);
}
/* 결정 D-1022: 짐 부리는 기둥의 이름들. 지나간 보부상들이 칼끝으로 새긴 이름 사이에 한 자리만 매끈하다(아빠 이름, 이름의 규칙 3).
   그 밑 짐 걸이에 엄마에게 배운 보따리 매듭이 남아 아빠가 여기 묵었다는 걸 안다. 봄엔 글씨가 돌아온다(규칙 6). */
function namesPost(){
  const F=G.f,pic=Rg.pics,withPic=(l,p)=>Object.assign(l,{pic:p});
  if(Rg.namesBack()){talk([withPic(['너구리','(매끈하던 자리에 글씨가 돌아왔다.\n아빠 이름이다. 날쌘 아저씨 이름 바로 곁.)'],pic.namesPostBack)]);return;}
  if(F.yNamesPost){talk([withPic(['너구리','(빼곡한 이름 사이에 한 자리만 매끈하다.\n그 밑 짐 걸이엔 엄마 매듭.)'],pic.namesPost)]);return;}
  talk([withPic(['너구리','(산막 옆 짐 부리는 기둥에 칼끝으로 새긴 이름이\n빼곡하다. 여기 묵어 간 보부상들이 남긴 거다.)'],pic.namesPost),
    ['너구리','(날쌘 아저씨 이름도 있다. 그 곁에…\n한 자리만 매끈하다.)'],
    ['너구리','(내 짐표 앞면처럼.)'],
    ['너구리','(그 밑 짐 걸이에 끈이 묶여 있다.\n두 번 감고, 한 번 당긴 매듭.)'],
    ['너구리','(엄마가 가르쳐 준 보따리 매듭이다.\n…아빠가 여기 묵었구나.)']],()=>Rg.playActivity('namesPost',()=>{
      F.yNamesPost=true;learn('y:names_post');
      diary('y_names_post','산막 옆 짐 부리는 기둥에 지나간 보부상들이 새긴 이름이 빼곡했다. 날쌘 아저씨 이름 곁에 한 자리만 매끈했다. 내 짐표 앞면처럼. 그 밑 짐 걸이에 엄마가 가르쳐 준 매듭이 묶여 있었다. 아빠가 여기 묵었다.');
    }));
}
/* 결정 D-1075 (design/proposals/name-story-v2.md §5.4): 호수 쪽에서 엄마 목소리로 아기 곰을 부른다. 문간의 진짜 엄마는 꿈쩍 않는다.
   강철이는 곰 아주머니 이름을 먹으며 그 기억(아기 이름, 부르던 목소리)도 먹었다(이름의 규칙 2). 아이는 날쌘에게 들은 금기대로 세 번을 함께 버틴다. */
function lureScene(){
  const F=G.f;if(F.yLureDone)return;F.yLureDone=true;
  const tosi=has('fur_tosi');
  const rest=[['호수 쪽 목소리','"…곰실아."'],
    ['아기 곰','(아기 곰이 몸을 떤다.)'],
    ['호수 쪽 목소리','"곰실아?"'],
    ['너구리','…셋.'],
    ['너구리','(바람 소리만 남았다. 네 번째는 오지 않았다.)'],
    ['아기 곰','…엄마 목소리였는데.'],
    ['너구리','네 엄마는 저기 계셔.\n목소리는 저기서 안 났어.'],
    ['아기 곰','(아기 곰이 문간의 엄마를 본다. 엄마는 돌아보지 않는다.)\n…엄마는 요즘 나를 안 불러.'],
    ['너구리','(그놈은 아주머니 목소리를 안다.\n아주머니 이름을 먹었으니까.)'],
    ['너구리','(아빠도… 이렇게 돌아봤을까.)']];
  const finish=()=>Rg.playActivity('lure',()=>{learn('lore:lure');learn('lore:three_calls');
    diary('y_lure','호숫가 마을에서 호수 쪽 목소리가 아기 곰을 엄마 목소리로 불렀다. 진짜 엄마는 문간에 앉아 꿈쩍도 안 했다. 아기 곰을 붙잡고 세 번을 함께 버텼다. 네 번째는 오지 않았다. 그놈은 먹은 이름의 목소리로 부른다.');});
  const block=ears=>talk([ears?['너구리',tosi?'(날쌘 아저씨가 준 털토시를\n아기 곰 귀에 씌웠다.)':'(두 손으로 아기 곰 귀를 덮었다.)']:
      ['너구리','(아기 곰 앞을 막아서 손을 잡았다.)\n세 번만 참자. 세 번은 못 들은 척하는 거래.'],...rest],finish);
  talk([['너구리','(곰 아주머니 문간에 아기 곰이 쪼그려 앉아 있다.\n아주머니는 돌아보지 않는다.)'],
    Object.assign(['호수 쪽 목소리','(호수 쪽에서 누가 부른다.)\n"곰실아… 곰실아, 이리 온."'],{pic:Rg.pics.lure}),
    ['아기 곰','엄마다!\n(아기 곰이 벌떡 일어나 얼음 쪽으로 걸어간다.)'],
    ['너구리','(…엄마는 저기, 문간에 앉아 계신데?)',[
      {t:'아기 곰 귀를 막아 준다',go:()=>block(true)},
      {t:'앞을 막고 같이 센다',go:()=>block(false)}]]]);
}
// 결정 D-1075: '호수 쪽 목소리'는 모습이 없다. 대화 초상은 얼음 호수 위로 번지는 김과 그 너머 검은 똬리 그림자만 그린다(D-328 Rg.portraits)
Rg.portraits={...Rg.portraits,'호수 쪽 목소리':(x,y)=>{
  R(x-14,y-22,28,22,'#3a4a62');R(x-14,y-6,28,6,'#b9d3e1');R(x-14,y-6,28,1,'#e6f1f6');
  R(x-6,y-12,14,5,'#1a1d24');R(x+4,y-15,5,4,'#1a1d24');R(x+6,y-14,1,1,'#c9e4f0');   // 똬리 그림자와 희미한 눈
  for(let i=0;i<3;i++)R(x-12+i*3,y-19+i*3,10-i*2,1,'rgba(230,240,246,.7)');            // 건너오는 부름의 김
}};
function talkCub(){
  const F=G.f;
  if(!F.yLureDone&&!F.spring){lureScene();return;}
  if(!Rg.namesBack()){talk([['아기 곰','…세 번은 참았어.\n진짜 엄마는 네 번 부를 거지?']]);return;}
  if(F.wanderersDone?.[expansionKey('y_lost_bear')]){talk([['아기 곰','엄마가 네 번 불렀어! 히히.']]);return;}
  talk([['아기 곰','엄마가 나 봐! 엄마한테 가 봐.\n(아기 곰이 문간 쪽으로 손짓한다.)']]);
}
function install(){
  const shore=Rg.zones.shore,island=Rg.zones.island;
  // 결정 D-430: 호숫가 마을의 이름 잃은 이들. 이름을 다 먹혀 버릇만 남았다. 길손이라 지역 NPC 넷에 세지 않는다.
  // 이름이 여럿이라 버티는 옹달 할미는 마을 위 옹달샘(눈길)에 그대로 둔다. 기존 길손은 옮기지 않는다.
  // 결정 D-436: 겨울엔 불러도 돌아보지 않는다. 봄(이름이 돌아온 뒤)엔 이름을 되찾은 걸 말하고, 그 사람다운 물건으로 한 번 사례한다.
  //   아이가 섬에 건너간 걸 아는 까닭: 봄에 돌아온 낚시하는 수달이 마을에 전했다(수달은 겨울 내내 호숫가에서 아이를 봤다).
  {
    const V=Rg.VILLAGE,back=Rg.namesBack;
    const lost=(id,x,winterName,springName,draw,winter,spring,thanks,after)=>({id,x,draw,speakers:[winterName,springName],   // 초상은 겨울·봄 이름 모두로 찾는다
      get name(){return back()?springName:winterName;},
      talk:()=>{
        if(!back()){talk(winter);return;}
        if(G.f.wanderersDone?.[expansionKey(id)]){talk(after);return;}
        talkGive([...spring,...(typeof thanks==='function'?thanks():thanks)],()=>finishWanderer(id));   // 결정 D-352: 사례는 끝까지 들으면 받는다
      }});
    (Rg.expContent.wanderers._shore||Rg.expContent.wanderers.shore).push(
      lost('y_lost_loom',V.loom,'물레 앞 아주머니','순덕 아주머니',(x,y)=>Rg.expArt.drawLostLoom(x,y),
        [['너구리','아주머니?'],['물레 앞 아주머니','(돌아보지 않는다. 실도 없이 물레만 돈다.)']],
        [['순덕 아주머니','(물레를 멈추고 나를 본다.)\n…호수 쪽에서 내 이름이 날아왔어.'],
          ['순덕 아주머니','누가 "순덕아" 부르는 것처럼.\n겨울 내내 뭘 하고 살았는지 모르겠네.'],
          ['너구리','물레 돌리셨어요. 실도 없이.'],
          ['순덕 아주머니','…손은 안 잊었구나.']],
        [['순덕 아주머니','수달이 그러는데, 네가 섬에 건너갔다며.\n실 자으려고 모아 둔 솜이야. 가져가.'],gotLine('eoksae_som',2)],
        [['순덕 아주머니','(물레가 돈다. 이번엔 실이 감긴다.)']]),
      lost('y_lost_jige',V.jige,'빈 지게 할아버지','갑돌 할아버지',(x,y,f)=>Rg.expArt.drawLostJige(x,y,f),
        [['빈 지게 할아버지','…어디 가던 길이더라.'],['너구리','(지게를 지고 문간을 나섰다가, 도로 들어간다.)']],
        [['갑돌 할아버지','(지게에 장작을 얹다 말고 나를 본다.)\n…장에 가던 길이었지. 이제 생각났다.'],
          ['갑돌 할아버지','수달 녀석이 그러더구나.\n꼬마 보부상이 섬에 건너갔다고.']],
        [['갑돌 할아버지','보부상이면 짐은 받아야지.\n불쏘시개다. 겨울 산엔 이만한 게 없어.'],gotLine('solbang',3)],
        [['갑돌 할아버지','장에 갔다 오마. 겨울에 못 간 몫까지.']]),
      lost('y_lost_kid',V.kid,'문간 아이','봉순이',(x,y,f)=>Rg.expArt.drawLostKid(x,y,f),
        [['문간 아이','내 이름 알아? …나도 몰라.'],['너구리','(아이가 문지르는 문패가 하얗다.\n글씨 자리만 매끈하다.)'],['너구리','(…내 짐표 앞면이랑 똑같다.)']],
        [['봉순이','나 봉순이야! 봉순이!'],['봉순이','문패에 써 있잖아! 봐 봐!'],['너구리','(문패에 먹 글씨가 또렷하다.)']],
        [['봉순이','수달 아저씨가 그러는데 너 덕분이래.\n이거 줄게. 내가 제일 아끼는 거.'],gotLine('gongi',1)],
        [['봉순이','봉순아! 봉순아!\n…헤헤, 내가 나 불렀어.']]),
      // 결정 D-1075 (사용자 피드백 2026-11-06 영산 22·23): 곰 굴 대신 이름 잃은 곰 아주머니와 아기 곰.
      //   봄엔 진짜 엄마가 아기 곰을 부른다. 아기 곰은 겨울에 배운 대로 세 번을 참고, 네 번째에 돌아본다(이름의 규칙 8).
      lost('y_lost_bear',V.bear,'문간 곰 아주머니','말순 아주머니',(x,y,f)=>(Rg.expArt.drawBearMom||Rg.expArt.drawBear)(x,y,-1),
        [['너구리','아주머니?'],['문간 곰 아주머니','(돌아보지 않는다. 빈 바구니에\n도토리를 넣는 시늉만 되풀이한다.)']],
        [['말순 아주머니','(아주머니가 문간에서 벌떡 일어난다.)\n곰실아!'],
          ['아기 곰','(아기 곰이 귀를 쫑긋 세우더니… 꾹 참는다.)'],
          ['말순 아주머니','곰실아! …곰실아?'],
          ['너구리','(…셋.)'],
          ['말순 아주머니','곰실아아! 엄마 여기 있잖아!'],
          ['아기 곰','(아기 곰이 돌아보며 달려간다.)\n엄마는 네 번 불렀어!'],
          ['말순 아주머니','(아주머니가 아기 곰을 꼭 끌어안는다.)\n…겨울 내내 엄마가 어디 가 있었나 몰라.']],
        ()=>[...(G.f.yLureDone?[['아기 곰','엄마, 얘가 나 붙잡아 줬어.\n호수 쪽 목소리 따라가려고 할 때.']]:[]),
          ['말순 아주머니','…그랬구나. 굴에 넣어 두려던 겨울 도토리야.\n굴은 다음 겨울에나 가지 뭐.'],gotLine('acorn',3)],
        [['말순 아주머니','곰실아! 밥 먹자!'],['아기 곰','(한 번에 돌아본다.)\n밥은 한 번만 불러도 돼!']]),
      {id:'y_bear_cub',name:'아기 곰',get x(){return V.cub;},draw:(x,y,f)=>Rg.expArt.drawBear(x,y,f),talk:talkCub});
    // 아빠는 호숫가 끝 큰 바위 곁에 앉아 호수만 본다 (지난가을부터 같은 돌에 앉아 남은 발자국과 같은 자리)
    const dad=Rg.npcs.find(n=>n.id==='dad');if(dad)dad.x=V.dad;
  }
  shore.doors=shore.doors.filter(d=>d.to!=='island');island.doors=island.doors.filter(d=>d.to!=='shore');
  shore.npcs.push(...[1350,1900,2240].map((winterX,j)=>({...fixture('y_ice_station_'+j,'얼음길 막대 '+(j+1),winterX,()=>G.f.spring?prepareBoat(['oar','rope','launch'][j]):survey(j+1)),
    get x(){return G.f.spring?[2180,2210,2240][j]:winterX;},
    get prompt(){return G.f.spring?['둑에 둔 노 손보기','배 묶는 고리 손보기','작은 배 물에 띄우기'][j]:'얼음길 막대 '+(j+1)+' 살피기';}})));
  shore.npcs.push(fixture('y_lake_depart','호수 건너기',2320,()=>sail('island')));
  island.npcs.push(fixture('y_lake_return','호숫가로 돌아가기',160,()=>sail('shore')));
  shore.exits.right.need=()=>!G.f.spring&&!!G.f.dadDone&&ready();
  shore.exits.right.reason='선착장 앞 막대에서 얼음길을 살피자. 두드린 얼음만 밟고 건넌다.';
  const oldDraw=shore.drawActors;
  shore.drawActors=()=>{
    oldDraw?.();
    if(!G.f.spring)return;
    Rg.expArt.drawOtter(2280-cam,GROUND,1);
    const ox=2180-cam;R(ox-24,GROUND-6,43,2,'#a78a65');R(ox-26,GROUND-9,12,7,'#c3ab7a');
    R(ox-13,GROUND-14,39,2,'#836b50');R(ox+16,GROUND-17,13,7,'#bea579');
    const rx=2210-cam;for(let i=0;i<3;i++){R(rx-12+i*3,GROUND-9+i*2,24-i*6,1,'#d6bd88');R(rx-12+i*3,GROUND-7+i,1,4-i,'#b49a6d');}
    const bx=2240-cam;for(let i=0;i<3;i++){R(bx-20+i*8,GROUND-5-i*2,31,3,'#a18462');R(bx-21+i*8,GROUND-5-i*2,3,3,'#c7b48e');}
  };
  const oldGoal=Rg.goal;
  Rg.goal=()=>{
    if(G.f.dadDone&&!G.f.sangunMet&&!ready())return Rg.iceGoal();   // 결정 D-149·D-890
    return oldGoal();
  };
  // 결정 D-1075·D-1074: 곰 굴의 봄 자리와 '까치에게 집으로 보낼 것 묻기'는 뺐다 (사용자 피드백 2026-11-06 영산 23·38).
  // 결정 D-1022 (영산 18·28): 산막의 매듭 살펴보기를 날쌘(산막 문간)과 떨어진 산막 옆 짐 부리는 기둥으로 옮기고 '기둥의 이름들'로 바꿨다
  Rg.zones.shelter.npcs.push({id:'y_names_post',name:'짐 부리는 기둥',x:620,prompt:'짐 부리는 기둥 살펴보기',talk:namesPost,draw:(x,y)=>Rg.drawNamesPost(x,y)});
  // 결정 D-1023: 도장을 찾는 순간 그 이야기 대화를 바로 연다(engine/field.js findStamp 의 REG.onStampFound). 찾은 도장을 다시 누르면 다시 열린다
  Rg.onStampFound=s=>{if(!['hut_post','snow_sign','shore_rock'].includes(s.id))return false;
    if(typeof thoughtT!=='undefined')thoughtT=0;traceStamp(s,true);return true;};
  for(const list of Object.values(Rg.expContent.stamps||{}))for(const s of list)s.revisit=()=>traceStamp(s);
  // 결정 D-1075: 호숫가 마을에서 아기 곰 곁에 들어서면 호수 쪽에서 엄마 목소리가 난다(겨울 한 번)
  {const oldStep=shore.step;shore.step=()=>{oldStep?.();
    if(paused()||B||G.f.spring||G.f.yLureDone||!G.onGround||G.zone!=='shore')return;
    if(Math.abs(G.px-Rg.VILLAGE.cub)<TABLES.TUNING.y_lure_range)lureScene();};}
  // 결정 D-1073: 얼어붙은 비탈은 수달도 배를 깔고 미끄러져 내려간다 (수리부엉이처럼 지름길 없이)
  {const sl=Rg.zones.slope,lab=()=>G?.form==='otter'?'수달로 배 깔고 비탈 미끄러져 내려가기':'수리부엉이로 날개 펴고 비탈 내려가기';
    for(const p of [sl.exits.right,...(sl.doors||[]).filter(d=>d.to==='shore')]){if(!p||typeof p!=='object')continue;
      p.formPass=['owl','otter'];Object.defineProperty(p,'formLabel',{configurable:true,get:lab});}}
  // 봄이 오면 아빠는 섬으로 건너와 산군 곁에 선다. 이름·약·귀향 장면이 모두 섬에서 열리기 때문이다.
  {
    const isl=Rg.zones.island,sh=Rg.zones.shore;
    const islList=isl.npcs,shDesc=Object.getOwnPropertyDescriptor(sh,'npcs'),shList=sh.npcs,shGet=()=>shDesc.get?shDesc.get():shList;
    Object.defineProperty(isl,'npcs',{configurable:true,get:()=>G?.f?.spring?[...islList,'dad']:islList});
    Object.defineProperty(sh,'npcs',{configurable:true,get:()=>{const l=shGet();return G?.f?.spring?l.filter(n=>n!=='dad'):l;}});
    // 수달과 살금이는 배와 함께 오간다. 섬 선착장에서도 보인다.
    const oldIsl=isl.drawActors;
    isl.drawActors=()=>{
      oldIsl?.();
      if(!G.f.spring)return;
      Rg.expArt.drawOtter(260-cam,GROUND,-1);
    };
  }
  // 살금이는 진행과 배 도착지에 따라 한 구역에만 둔다. 옛 저장도 같은 진행값으로 복원한다.
  Rg.replyCourierHere=()=>G?.zone==='shelter'&&open('dlg')&&$('dlgWho').textContent==='까치';
  for(const [id,z] of Object.entries(Rg.zones)){
    const desc=Object.getOwnPropertyDescriptor(z,'npcs'),list=z.npcs;
    Object.defineProperty(z,'npcs',{configurable:true,get:()=>{
      const current=(desc.get?desc.get():list).filter(n=>(typeof n==='string'?n:n.id)!=='salgeumi');
      if(id==='shelter'&&Rg.replyCourierHere()){
        const courier=Rg.expContent.wanderers.shore.find(n=>n.id==='y_magpie_farewell');
        current.push({...courier,x:G.px+24,zone:id});
      }
      return Rg.npcs.find(n=>n.id==='salgeumi').zone===id?[...current,'salgeumi']:current;
    }});
  }
}
addEventListener('DOMContentLoaded',install,{once:true});
})();
