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
      '아빠와 함께 집으로 돌아왔다. 엄마에게 되돌림 약을 드렸다.',
      '그날 밤.']},
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
  weather:()=>Vfx.setWeather(G.f.spring?'':'snow'),
  weatherFront(){if(!G.f.spring)R(0,0,W,H,'rgba(20,28,70,.12)');},
  onStart(){
    Rg.arcsEnabled();
    diary('y_start','영산에 왔다. 눈이 허리까지 쌓였다. 산막에 불빛이 보인다.');
    // 결정 D-68: 첫 화면 안내는 '할 일' 한 줄만
  },
  // 마지막 가족 장면 위에는 점수를 띄우지 않는다 (단서 수는 아빠의 수첩에서 본다).
  endStats:()=>[],
});

/* 사연 설정은 새 게임·저장 복원 때 정한 공통 판정을 따른다. */
Rg.arcsEnabled=arcsEnabled;

/* PA-43: 옛 배치와 저장은 classic 쪽에 남긴다. 공급은 기존 마가목 넷에 하나를 더한다. */
if(!CLASSIC){
  const oldState=Rg.newState;
  Rg.newState=()=>{
    const s=oldState();
    s.pickups=[{id:'shelter_straw',zone:'shelter',x:340,y:GROUND,item:'jip',got:false},
      ...[['slope',420,GROUND],['slope',900,150],['shore',880,GROUND],['slope',1265,150],['island',2140,108]].map(([zone,x,y],i)=>
        ({id:'slope_rowan_'+i,zone,x,y,item:'magamok',got:false}))];
    s.digs=s.digs.map((d,i)=>({...d,id:'shelter_vine_'+i,zone:'shelter',x:[300,330,660][i]}));
    return s;
  };
  Rg.placeRouteSupplies=()=>{
    for(const d of G.digs){
      const i=Number(d.id?.match(/^shelter_vine_([0-2])$/)?.[1]);
      if(Number.isInteger(i))Object.assign(d,{zone:'shelter',x:[300,330,660][i]});
    }
    const straw=G.pickups.find(p=>p.id==='shelter_straw');if(straw)straw.x=340;
  };
}

/* 아이템 이름·레어도·설명은 design/data/items.csv (js/data/tables.js). 여기에는 아이콘만 */
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
  // 결정 D-108: 모두 딱이면 덤불에 얽힌 마가목 가지가 흔들려 열매 하나가 떨어진다 (영산 비탈의 마가목, 한 단계 위)
  darae_vine:{title:'다래 덩굴 베기',hits:TABLES.MINIGAMES.gather_darae_vine_hits,spot:[-2,-14],rare:'magamok',hint:'눈 덮인 덤불 속 덩굴을 낫으로 벤다. 커지는 원이 큰 기준원에 꼭 맞을 때 휘두르면 딱! 한 줄기가 더 베인다. 모두 딱이면 얽힌 마가목 가지에서 열매도 떨어진다.'},
});

/* 아빠의 약연: 산군과의 셈이 맞은 뒤 아빠와 손을 포개면 깨어난다. 가공법은 heirlooms.csv */
})();

/* 영산의 함께 하는 일(곰 잠자리, 얼음 표시, 배 띄우기 등) */
(()=>{
const Rg=REGIONS.yeongsan;
// 결정 D-88: 손일은 미니게임 없이 바로 마친다 (확정: 미니게임은 채집·전투·놀이에만, 대장 2026-10-30). 막혀 있던 판정 코드는 지웠다.
// 다녀간 일은 G.f.yActivities에 센다(사연 조건).
const ACTIVITIES=new Set(['bear','bearSpring','crow','otter','knot','hutPrint','snowPrint','shorePrint','ice1','ice2','ice3','oar','rope','launch','sail']);
Rg.playActivity=(id,callback)=>{
  if(ACTIVITIES.has(id)){Sound.gather(true);const log=G.f.yActivities||(G.f.yActivities={});log[id]=(log[id]||0)+1;}
  callback?.();
};

/* 3개 관찰 지점은 본길에 놓인다. 샛길의 도장·선물과는 독립이다.
   마지막 선택을 미룬 채 봄 호수로 돌아와도 전 재료와 아빠에게 닿는다. */
if(CLASSIC)return;
const ready=()=>[1,2,3].every(i=>!!G.f['yIce'+i]);
const boatReady=()=>!!G.f.yBoatOar&&!!G.f.yBoatRope&&!!G.f.yBoatLaunch;
const mark=(x,y)=>{
  R(x-2,y-27,4,27,'#8c735d');R(x-9,y-28,18,3,'#d9c18c');
  for(let i=0;i<3;i++)R(x-15+i*13,y-1,8,2,'#bdcfd6');
};
const fixture=(id,name,x,talkFn)=>({id,name,x,prompt:name,talk:talkFn,draw:mark,peek:true});
function survey(i){
  if(i===3&&!G.f.dadDone){talk([['너구리',G.f.dadMet?'아빠가 아직 뭔가 보여 주려고 했어.\n얼음길보다 아빠가 먼저야.':'저기 앉은 너구리, 신목만 보고 있어.\n얼음길보다 저쪽이 먼저야.']]);return;}
  if(G.f['yIce'+i]){talk([['너구리','여긴 두드려 봤어. 표시한 가지를 따라가면 돼.']]);return;}
  const lines={
    1:[['너구리','(가늘고 긴 가지를 주웠다. 발은 마른 돌 위에 둔다.)'],['너구리','흰 얼음과 갈대 곁이 다르게 울린다. 색만 보고 밟으면 안 되겠네.']],
    2:[['너구리','(얼음 밑의 검은 금이 호수 안쪽으로 이어진다.)'],['너구리','저기보다 둑 쪽이 가깝다. 돌아설 돌부터 봐 두자.']],
    3:[['아빠','(아빠가 손끝으로 호숫가에서 신목까지 점을 찍듯 잇는다.\n그러다 한 점에서 손바닥을 펴 멈춘다.)'],['너구리','다음 표시가 안 보이면 멈추라고? 응, 알았어.']]
  };
  talk(lines[i],()=>Rg.playActivity('ice'+i,()=>{
    G.f['yIce'+i]=true;
    diary('y_ice_'+i,['','바위 곁에서 얼음을 두드렸다. 하얗게 보여도 갈대 곁에서는 물소리가 났다. 발 디딜 곳에 가지를 세웠다.','검은 금을 따라 흐르는 물을 봤다. 마른 둑 쪽을 택하고 돌아설 자리도 표시했다.','신목으로 이어지는 얼음길을 이었다. 두드린 자리와 다음 가지를 보며 건넌다. 봄엔 이 표시가 물길을 알려 주겠다.'][i]);
    talk([['너구리',i===3?'이제 섬까지 표시가 이어졌어.\n아빠, 다녀올게.':'표시 하나 세웠다. 다음 돌까지는 여기서 보여.']],refreshGoal);
  }));
}
function prepareBoat(part){
  const key={oar:'yBoatOar',rope:'yBoatRope',launch:'yBoatLaunch'}[part];
  if(G.f[key]){talk([['너구리','아까 손본 자리다.']]);return;}
  if(part==='launch'&&(!G.f.yBoatOar||!G.f.yBoatRope)){
    talk([['낚시하는 수달','둑에 둔 노부터 챙기자. 조금 앞에 있어.'],['살금이','노 옆 고리도… 보고 와 줘. 내가 배를 잡고 있을게.']]);return;
  }
  talk([['낚시하는 수달',part==='oar'?'겨울엔 얼음 구멍만 봤지.\n이제 같이 호수에 나가자. 노는 여기 올려 뒀어.':part==='rope'?(G.f.yParcelKnot?'물에 뜨면 이젠 이 끈이 배를 잡아 줘야지.\n까치한테 배운 고리 기억해?':'물에 뜨면 이젠 이 끈이 배를 잡아 줘야지.\n나중에 풀기 쉬운 고리를 만들자.'):'우린 겨울마다 배를 둑에 올려 둬. 이번엔 네가 뒤를 받쳐 줄래?'],
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
      const first=[1,2,3].find(i=>!G.f['yIce'+i]);
      talk([['너구리','아직 안 두드려 본 자리가 있어. '+({1:'바위 곁',2:'검은 금 곁',3:'선착장 앞'})[first]+'의 막대 표시로 가자.']]);return;
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
function traceStamp(s){
  const traced=G.f.yStampHands||(G.f.yStampHands={});
  if(traced[s.id]){talk([['너구리','손끝으로 따라가 본 무늬다. 수첩의 그날 이야기와 같은 자리야.']]);return;}
  const details={
    hut_post:{act:'hutPrint',intro:'문설주에 아빠 발바닥이 있어. 문을 잡던 손도 여기에 닿았겠지.',look:'바깥쪽은 매끈하고 무늬 안쪽은 거칠다.\n눈을 털고 내 손으로 따라가 볼까?',after:'보따리 가득 채워 올 줄 알았구나. 난 엄마 약 하나면 돼.'},
    snow_sign:{act:'snowPrint',intro:'기둥 뒤에 무늬를 팠네. 눈이 덮여도 이 홈은 없어지지 않았어.',look:'젊은 아빠도 여기서 아래를 봤겠지.\n무늬를 짚으면서 아빠가 보던 쪽으로 서 보자.',after:'여기서 내려갈 길을 그려 봤구나. 나도 저 불빛 따라 내려갈래.'},
    shore_rock:{act:'shorePrint',intro:'바위의 오래된 무늬와 눈에 찍힌 새 발자국이 나란히 있어.',look:'무늬가 얼마나 닮았는지 손끝으로 짚어 보자.\n미끄럽지 않은 바위 쪽에서부터.',after:'젊었을 땐 빈손으로 혼자 내려갔구나. 이번엔 같이 돌아가야지.'}
  }[s.id];
  if(!details)return;
  talk([['너구리',details.intro],['너구리',details.look,[
    {t:'손끝으로 무늬를 따라가 본다',go:()=>Rg.playActivity(details.act,()=>{
      traced[s.id]=true;
      const page=Object.values(NOTES).find(p=>p.lines.some(l=>l.when===s.note));
      const lines=(page?.lines||[]).filter(l=>l.when===s.note).map(l=>['아빠의 옛 기록',l.text]);
      diary('y_stamp_hands_'+s.id,'도장의 홈을 손끝으로 짚고 수첩의 그날 이야기를 읽었다. '+details.after);
      talk([...lines,['너구리',details.after]]);
    })},{t:'무늬는 찾았으니 나중에 볼게',go:null}
  ]]]);
}
function install(){
  const shore=Rg.zones.shore,island=Rg.zones.island;
  shore.doors=shore.doors.filter(d=>d.to!=='island');island.doors=island.doors.filter(d=>d.to!=='shore');
  shore.npcs.push(...[1350,1900,2240].map((winterX,j)=>({...fixture('y_ice_station_'+j,'얼음길 막대 '+(j+1),winterX,()=>G.f.spring?prepareBoat(['oar','rope','launch'][j]):survey(j+1)),
    get x(){return G.f.spring?[2180,2210,2240][j]:winterX;},
    get prompt(){return G.f.spring?['둑에 둔 노 손보기','배 묶는 고리 손보기','작은 배 물에 띄우기'][j]:'얼음길 막대 '+(j+1)+' 살피기';}})));
  shore.npcs.push(fixture('y_lake_depart','호수 건너기',2320,()=>sail('island')));
  island.npcs.push(fixture('y_lake_return','호숫가로 돌아가기',160,()=>sail('shore')));
  shore.exits.right.need=()=>!G.f.spring&&!!G.f.dadDone&&ready();
  shore.exits.right.reason='선착장 앞까지 세 막대 표시를 살피자. 두드린 얼음만 밟고 건넌다.';
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
    if(G.f.dadDone&&!G.f.sangunMet&&!ready())return '호숫가 얼음길의 막대 세 곳을 살피자 (바위 → 검은 금 → 선착장)';
    return oldGoal();
  };
  // 완료 길손의 greeting을 가로채지 않고, 봄에만 별도 행동 자리를 곁에 둔다.
  Rg.zones.shelter.npcs.push(fixture('y_bear_spring','곰 굴의 봄',700,()=>{
    if(!G.f.yBearQuiet){talk([['너구리','굴 밖에 작은 곰이 나와 있네. 먼저 말을 걸어 볼까?']]);return;}
    if(!G.f.spring){talk([['너구리','굴 앞에 곰 털이 걸려 있다. 발소리를 줄여야지.']]);return;}
    talk([['아기 곰','물소리 들려? 네 노래보다 빨라.\n같이 들어 볼래?']],()=>Rg.playActivity('bearSpring',()=>{
      G.f.yBearSpring=true;diary('y_bear_spring','봄에 곰 굴로 돌아왔다. 자장가 대신 물소리를 들으며 곰과 보따리를 두드렸다.');
      talk([['아기 곰','이번엔 안 졸려! 엄마도 곧 일어나겠지.']]);
    }));
  }));
  shore.npcs.push(fixture('y_home_parcel','까치에게 집으로 보낼 것 묻기',570,()=>{
    if(!G.f.spring){talk([['늙은 까치','호수 일이 끝나면 다시 들르렴.\n남쪽으로 갈 때 작은 건 실어 주마.']]);return;}
    if(!Rg.offerHomeGift?.())talk([['늙은 까치','집에 갈 때 빨간 열매도 챙겨 가거라.\n엄마 손에 네가 쥐여 드려도 좋지.']]);
  }));
  for(const id of ['shelter','snow','shore']){
    const z=Rg.zones[id],npcs=z.npcs.slice(),oldStep=z.step;
    Object.defineProperty(z,'npcs',{get:()=>npcs.concat((Rg.expContent.stamps[id]||[]).filter(s=>stampFound(s.id)).map(s=>({...fixture('hands_'+s.id,'도장 홈 손끝으로 짚기',s.x,()=>traceStamp(s)),y:s.y,draw:()=>{}})))});
    z.step=()=>{
      oldStep?.();if(paused())return;
      const prompted=G.f.yStampPrompted||(G.f.yStampPrompted={});
      const s=(Rg.expContent.stamps[id]||[]).find(s=>stampFound(s.id)&&!prompted[s.id]&&pointNear(s));
      if(s){prompted[s.id]=true;traceStamp(s);}
    };
  }
  // 봄이 오면 아빠는 섬으로 건너와 산군 곁에 선다. 이름·약·귀향 장면이 모두 섬에서 열리기 때문이다.
  {
    const isl=Rg.zones.island,sh=Rg.zones.shore;
    const islList=isl.npcs,shGet=Object.getOwnPropertyDescriptor(sh,'npcs').get;
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
        const courier=Rg.expContent.wanderers.shore.find(n=>n.id==='y_magpie_knot');
        current.push({...courier,x:G.px+24,zone:id});
      }
      return Rg.npcs.find(n=>n.id==='salgeumi').zone===id?[...current,'salgeumi']:current;
    }});
  }
}
addEventListener('DOMContentLoaded',install,{once:true});
})();
