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
      '그날 밤, 엄마가 반딧불로 둔갑해 방을 밝혔다. 내가 아기였을 때처럼.']},
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
    toast('산막의 불빛 쪽으로 가 보자');
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
  darae_vine:{title:'다래 덩굴 베기',hits:TABLES.MINIGAMES.gather_darae_vine_hits,hint:'눈 덮인 덤불 속 덩굴을 낫으로 벤다. 고리가 가운데 원에 닿을 때 휘두르면 딱! 한 번에 더 깊이 들어간다.'},
});

/* 아빠의 약연: 산군과의 셈이 맞은 뒤 아빠와 손을 포개면 깨어난다. 가공법은 heirlooms.csv */
})();

/* PA-43 3단계: 채집의 왕복 바늘 판정을 짧은 공동 작업에 쓴다.
   판정은 소리·손동작만 바꾼다. 매 입력이 진행하며 물건·호감·체력을 걸지 않는다. */
(()=>{
const Rg=REGIONS.yeongsan, MG=TABLES.MINIGAMES;
const panel=el('div','forge');panel.id='yActivity';panel.hidden=true;
panel.innerHTML='<h2 id="yActTitle"></h2><canvas id="yActCv" width="320" height="110" style="display:block;width:100%;image-rendering:pixelated"></canvas><p id="yActLine" class="fhint" aria-live="polite"></p><div id="yActBar" style="position:relative;height:22px;background:#52667a;margin:16px"><span id="yActBand" style="position:absolute;top:0;bottom:0;background:#c3d8ab"></span><span id="yActMark" style="position:absolute;top:-4px;width:3px;height:30px;background:#ffe4aa"></span></div><p id="yActCount" class="fhint"></p><button id="yActHit" class="btn primary strike" type="button"></button><button id="yActSlow" class="btn" type="button">천천히 해 보기</button><button id="yActLeave" class="btn" type="button">잠깐 쉬기</button>';
$('shell').appendChild(panel);
Object.assign(panel.style,{top:'8%',bottom:'auto',gap:'8px',maxHeight:'calc(100dvh - 150px)',overflowY:'auto'});
Object.assign($('yActCv').style,{maxWidth:'320px',margin:'0 auto'});
// 작은 화면의 공통 소리 버튼 아래에서 제목을 시작한다.
$('yActTitle').style.paddingTop='28px';
const ac=$('yActCv').getContext('2d');
const descriptions={
  bear:{title:'보따리 자장가',verb:'보따리 톡톡',steps:[
    '곰 귀가 쫑긋하네. 보따리 위를 가볍게 두드리자.',
    '굴 밖 바람이 잦아든다. 이번엔 소리를 조금 낮추자.',
    '눈꺼풀이 내려온다. 마지막 박자는 손끝으로만.']},
  bearSpring:{title:'곰 굴에 돌아온 물소리',verb:'물소리 따라 톡톡',steps:[
    '굴 밖에서 물방울이 떨어진다. 곰과 함께 귀를 기울이자.',
    '돌 틈 물소리는 조금 빠르네. 보따리에 손끝으로 옮겨 보자.',
    '곰이 웃으며 박자를 받는다. 이번엔 잠들지 않고 같이 듣는다.']},
  crow:{title:'눈 위에 집으로 가는 길',verb:'능선 짚기',steps:[
    '눈앞의 낮은 봉우리부터 눈 위에 그어 보자.',
    '뾰족한 봉우리는 왼쪽. 그 아래 골짜기를 잇자.',
    '별보다 낮은 점이 집 불빛이야. 거기에 점을 찍자.']},
  otter:{title:'얼음 아래 작은 꼬리',verb:'낚싯줄 살짝 풀기',steps:[
    '수달이 줄을 잡고 있다. 손을 눈 위에 내려놓자.',
    '작은 물결이 구멍으로 온다. 먹이만 조금 낮추자.',
    '은빛 꼬리가 돌아선다. 줄을 풀어 보내 주자.']},
  knot:{title:'함께 묶는 짐끈',verb:'끈 당기기',steps:[
    '까치가 날개로 보자기를 누른다. 긴 끝을 잡자.',
    '짧은 끝은 안으로. 긴 끝엔 고리를 남기자.',
    '부리가 들어갈 틈은 남기고, 양쪽을 살짝 당기자.']},
  hutPrint:{title:'문설주에 남은 손길',verb:'홈 따라 짚기',steps:[
    '손바닥을 문설주에 대 보자. 기둥 바깥쪽은 바람에 매끈해졌네.',
    '발가락 홈에는 눈이 남았다. 손끝으로 눈을 밀고 홈이 꺾이는 데를 따라가자.',
    '맨 아래 발바닥까지 이어졌다. 내 손보다 큰 무늬를 수첩 그림과 맞춰 보자.']},
  snowPrint:{title:'이정표 위의 발바닥',verb:'눈 털고 짚기',steps:[
    '이정표 뒤에 쌓인 눈을 옆으로 밀자. 아래쪽 무늬부터 드러난다.',
    '위쪽 작은 홈은 발가락이네. 눈을 털 때마다 산 아래 불빛이 그 사이로 보인다.',
    '아빠가 내려다봤을 쪽으로 서 보자. 올라온 길과 내려갈 길이 같은 곳에서 갈라진다.']},
  shorePrint:{title:'바위의 무늬와 오늘의 발',verb:'발자국 맞춰 보기',steps:[
    '바위에 손을 대자. 오래된 무늬는 얕고, 옆 눈에 찍힌 발자국은 깊다.',
    '얕은 홈을 따라 발가락부터 짚어 보자. 새 발자국과 벌어진 모양이 꼭 같네.',
    '그 옆에 내 발도 나란히 놓자. 같은 무늬 사이에 작은 발 하나가 들어간다.']},
  ice1:{title:'얼음길 ① 바위 곁',verb:'막대로 두드리기',steps:[
    '눈을 쓸어 내니 속이 하얗다. 발은 돌 위에 두고 두드리자.',
    '갈대 곁에서는 물소리가 난다. 그쪽에 체중을 싣지 말자.',
    '바위에 붙은 쪽은 둔탁한 소리. 여기에 나뭇가지를 세우자.']},
  ice2:{title:'얼음길 ② 물이 흐르는 금',verb:'막대로 두드리기',steps:[
    '검은 금 밑에서 물이 움직인다. 눈만 덮인 다리구나.',
    '금의 끝을 따라가니 둑과 만난다. 둑 쪽부터 두드리자.',
    '돌아갈 둑이 바로 옆에 있다. 마른 돌을 따라 표시하자.']},
  ice3:{title:'얼음길 ③ 섬으로 난 길',verb:'막대로 두드리기',steps:[
    '섬 뿌리와 호숫가 돌이 한 줄이다. 발밑부터 살피자.',
    '멀리 반짝이는 곳은 얇다. 앞서 세운 가지를 따라가자.',
    '다음 가지까지 보인다. 두드린 자리만 이어 디디자.']},
  oar:{title:'봄 배 ① 겨울을 난 노',verb:'노 돌려 보기',steps:[
    '겨울에 둑에 올려 둔 노다. 수달이 한쪽을 들어 준다.',
    '살금이가 자루를 받친다. 날에 붙은 얼음을 털자.',
    '금이 간 데는 없다. 두 노의 날을 물 쪽으로 놓자.']},
  rope:{title:'봄 배 ② 손이 놓여도 남는 고리',verb:'밧줄 당기기',steps:[
    '얼어 굳었던 끈이 풀렸다. 수달이 배를 잡는 동안 고리를 만들자.',
    '살금이가 말뚝 곁을 눌러 준다. 고리를 말뚝에 걸자.',
    '밀려나도 다시 닿는 길이다. 끈을 당겨 배를 나란히 붙이자.']},
  launch:{title:'봄 배 ③ 함께 물에 띄우기',verb:'배 밀기',steps:[
    '배 아래 둥근 가지를 댔다. 수달이 앞, 나는 뒤를 받친다.',
    '살금이가 옆을 지킨다. 물결이 들 때 가볍게 밀자.',
    '배가 떴다. 한 발씩 오르고, 남은 고리는 뱃전에 걸자.']},
  sail:{title:'호수의 봄길',verb:'노 젓기',steps:[
    '겨울에 걸었던 길이 물결이 됐다. 두 노를 나란히 넣자.',
    '갈대 사이 물결은 옆으로 흐른다. 수달 손짓 쪽으로 저어 보자.',
    '섬의 금줄과 호숫가 바위를 번갈아 보자. 어느 쪽도 잃지 않게.',
    '겨울에 세운 가지 끝이 물 위로 나왔다. 그 바깥으로 천천히.',
    '살금이가 뱃전에 앉았다. 배가 기울지 않게 노를 함께 들자.',
    '잔물결이 둑으로 밀어 준다. 남긴 고리를 말뚝에 걸자.']}
  ,sailOut:{title:'내가 띄운 배로 신목 섬까지',verb:'함께 노 맞추기',steps:[
    '이번엔 내가 앞을 본다. 살금이가 고리를 풀면 두 노로 둑을 살짝 밀자.',
    '겨울에 피했던 검은 금이 긴 물결이 됐다. 수달과 양쪽 노를 나란히 넣자.',
    '갈대 쪽 물은 빠르네. 바위 쪽으로 짧게 저으니 살금이가 귀를 내린다.',
    '내가 세운 가지가 물 밖에 남았다. 가지 둘 사이로 배를 향하게 노를 바꾸자.',
    '신목 금줄이 보인다. 수달이 손을 들면 노를 쉬고, 섬 쪽 물결에 맡기자.',
    '살금이가 마른 돌을 짚는다. 노를 뱃전에 놓고 고리를 건네면 섬에 닿는다.']}
};
let act=null;
function paint(){
  if(!act)return;
  const {id,index,pos}=act,cfg=descriptions[id],spring=/oar|rope|launch|sail/.test(id);
  ac.fillStyle=spring?'#d8dfd3':'#263957';ac.fillRect(0,0,320,110);
  ac.fillStyle=spring?'#86b2bd':'#adc9db';ac.fillRect(0,73,320,37);
  if(id.startsWith('ice')){
    ac.fillStyle='#66798c';ac.fillRect(30,63,56,17);
    for(let i=0;i<3;i++){ac.fillStyle=i<=index?'#d4c18c':'#819cb0';ac.fillRect(102+i*66,71-i%2*5,34,4);if(i<=index)ac.fillRect(116+i*66,52,3,23);}
    ac.fillStyle='#f4edd4';ac.fillRect(59+index*66,41,3,30);
  }else if(id.endsWith('Print')){
    ac.fillStyle=id==='hutPrint'?'#8c7764':'#8395a1';ac.fillRect(73,12,174,88);
    ac.fillStyle='#465466';ac.fillRect(130,45,61,34);ac.fillRect(141,77,39,7);
    for(let i=0;i<3;i++){ac.fillStyle=i<=index?'#e2c18b':'#465466';ac.fillRect(118+i*31,23+Math.abs(1-i)*7,21,18);}
    ac.fillStyle='#e7d4b6';ac.fillRect(114+index*31,41+Math.abs(1-index)*7,7,19);ac.fillRect(111+index*31,52+Math.abs(1-index)*7,14,9);
  }else if(id==='sail'||spring){
    const x=45+index*(id.startsWith('sail')?35:52);ac.fillStyle='#71574a';ac.fillRect(x,68,65,9);ac.fillRect(x+7,77,51,5);
    ac.fillStyle='#ceb58c';ac.fillRect(x+12,57,3,24);ac.fillRect(x+52,57,3,24);
    ac.fillStyle='#a58d76';ac.fillRect(x+25,51,14,17);ac.fillStyle='#b7a27d';ac.fillRect(x+9,46,9,22);ac.fillRect(x+11,39,2,10);
    ac.fillStyle='#e3e5c2';ac.fillRect(289,36,8,38);ac.fillStyle='#85a570';ac.fillRect(268,18,47,22);
  }else{
    const old=ctx;ctx=ac;
    try{const fn={bear:'drawBear',bearSpring:'drawBear',crow:'drawCrow',otter:'drawOtter',knot:'drawMagpie'}[id];if(Rg.expArt?.[fn])Rg.expArt[fn](220,74,-1);}finally{ctx=old;}
    ac.fillStyle='#e7d7b9';ac.fillRect(50,53,57,25);ac.fillStyle='#ad8964';ac.fillRect(73,51,3,29);
    for(let i=0;i<=index;i++){ac.fillStyle='#f2cf8f';ac.fillRect(118+i*22,78-i*6,12,3);}
  }
  $('yActLine').textContent=cfg.steps[index];
  $('yActBand').style.left=act.band+'%';$('yActBand').style.width=MG.gather_darae_vine_width+'%';
  $('yActMark').style.left=pos+'%';$('yActCount').textContent=(index+1)+' / '+cfg.steps.length+' · 맞추지 못해도 괜찮아';
  $('yActHit').textContent=cfg.verb+(TOUCH?'':' (J · Space)');
}
function close(){panel.hidden=true;act=null;releaseInputs();}
Rg.playActivity=(id,callback)=>{
  if(!descriptions[id]){callback?.();return;}
  if(act)return;
  // 손일은 미니게임 없이 바로 마친다 (대장 2026-10-30: 미니게임은 채집·전투·놀이에만).
  {Sound.gather(true);const log=G.f.yActivities||(G.f.yActivities={});log[id]=(log[id]||0)+1;callback?.();return;}
  releaseInputs();G.vx=G.vy=0;
  act={id,index:0,pos:0,dir:1,cool:MG.gather_cooldown,band:40,callback};
  $('yActTitle').textContent=descriptions[id].title;panel.hidden=false;paint();
};
function hit(slow=false){
  if(!act||(!slow&&act.cool>0))return;
  const a=act,good=slow||(a.pos>=a.band&&a.pos<=a.band+MG.gather_darae_vine_width);
  Sound.gather(good);a.cool=MG.gather_cooldown;
  if(!good&&a.id.startsWith('ice')){
    G.px=Math.max(16,G.px-12);G.vx=G.vy=0;
    toast('첨벙. 뒤의 마른 돌로 올라왔다. 표시한 길은 남아 있다.');
  }
  a.index++;
  if(a.index>=descriptions[a.id].steps.length){
    const callback=a.callback;
    const log=G.f.yActivities||(G.f.yActivities={});log[a.id]=(log[a.id]||0)+1;
    close();callback?.();return;
  }
  a.band=MG.gather_zone_start+hash(a.index*17+a.id.length)*Math.max(0,MG.gather_zone_span-MG.gather_darae_vine_width);
  paint();
}
$('yActHit').onclick=()=>hit();$('yActSlow').onclick=()=>hit(true);$('yActCv').onclick=()=>hit();
$('yActLeave').onclick=close;
panel.addEventListener('keydown',e=>{
  if(!['Enter',' ','j','J','x','X'].includes(e.key))return;
  e.preventDefault();e.stopPropagation();if(e.repeat)return;
  if((e.key==='Enter'||e.key===' ')&&e.target instanceof HTMLButtonElement)e.target.click();else hit();
});
defineMinigame({id:'yActivity',step:()=>{if(!act)return;act.pos+=act.dir*MG.gather_darae_vine_speed;if(act.pos>=100||act.pos<=0){act.pos=clamp(act.pos,0,100);act.dir*=-1;}if(act.cool>0)act.cool--;paint();},hit:()=>hit()});

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
  if(i===3&&!G.f.dadDone){talk([['너구리','호숫가에 앉은 너구리가 이쪽을 보고 있어.\n얼음길에 오르기 전에 가 보자.']]);return;}
  if(G.f['yIce'+i]){talk([['너구리','여긴 두드려 봤어. 표시한 가지를 따라가면 돼.']]);return;}
  const lines={
    1:[['너구리','(가늘고 긴 가지를 주웠다. 발은 마른 돌 위에 둔다.)'],['너구리','흰 얼음과 갈대 곁이 다르게 울린다. 색만 보고 밟으면 안 되겠네.']],
    2:[['너구리','(얼음 밑의 검은 금이 호수 안쪽으로 이어진다.)'],['너구리','저기보다 둑 쪽이 가깝다. 돌아설 돌부터 봐 두자.']],
    3:[['아빠','(아빠가 앞서 세운 가지 셋을 손으로 잇는다. 그 끝에 신목이 있다.)'],['너구리','앞의 표시가 안 보이면 멈추기. 응, 알았어.']]
  };
  talk(lines[i],()=>Rg.playActivity('ice'+i,()=>{
    G.f['yIce'+i]=true;
    diary('y_ice_'+i,['','바위 곁에서 얼음을 두드렸다. 하얗게 보여도 갈대 곁에서는 물소리가 났다. 발 디딜 곳에 가지를 세웠다.','검은 금을 따라 흐르는 물을 봤다. 마른 둑 쪽을 택하고 돌아설 자리도 표시했다.','신목으로 이어지는 얼음길을 이었다. 두드린 자리와 다음 가지를 보며 건넌다. 봄엔 이 표시가 물길을 알려 주겠다.'][i]);
    talk([['너구리',i===3?'이제 섬까지 표시가 이어졌어. 아빠, 같이 가자.':'표시 하나 세웠다. 다음 돌까지는 여기서 보여.']],refreshGoal);
  }));
}
function prepareBoat(part){
  const key={oar:'yBoatOar',rope:'yBoatRope',launch:'yBoatLaunch'}[part];
  if(G.f[key]){talk([['너구리','아까 손본 자리다. 이제 배에 오를 수 있겠어.']]);return;}
  if(part==='launch'&&(!G.f.yBoatOar||!G.f.yBoatRope)){
    talk([['낚시하는 수달','둑에 둔 노부터 챙기자. 조금 앞에 있어.'],['살금이','노 옆 고리도… 보고 와 줘. 내가 배를 잡고 있을게.']]);return;
  }
  talk([['낚시하는 수달',part==='oar'?'겨울엔 얼음 구멍만 봤지.\n이제 같이 호수에 나가자. 노는 여기 올려 뒀어.':part==='rope'?(G.f.yParcelKnot?'얼음이 잡아 주던 배를 이제 이 끈이 잡아 줘야지.\n까치한테 배운 고리 기억해?':'얼음이 잡아 주던 배를 이제 이 끈이 잡아 줘야지.\n나중에 풀기 쉬운 고리를 만들자.'):'우린 겨울마다 배를 둑에 올려 둬. 이번엔 네가 뒤를 받쳐 줄래?'],
    ['살금이','나, 나도 도울게. 물가 돌이라면 내가 잘 아니까.']],()=>Rg.playActivity(part,()=>{
      G.f[key]=true;diary('y_boat_'+part,descriptions[part].title+'를 수달, 살금이와 함께 했다. 겨울에 살핀 얼음길이 봄 물길로 바뀌었다.');
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
    talk([['낚시하는 수달','물이 풀리자마자 살금이랑 노를 챙겨 왔어.\n봄마다 우리 둘이 타던 배야.'],['살금이','너, 너도 타. 아빠한테 데려다줄게.'],['낚시하는 수달','다음엔 네 손으로도 띄워 보자. 둑에 올릴 때 같이 들면 돼.']],()=>voyage(to,true));return;
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
    hut_post:{act:'hutPrint',intro:'문설주에 아빠 발바닥이 있어. 문을 잡던 손도 여기에 닿았겠지.',look:'바깥쪽은 매끈하고 무늬 안쪽은 거칠다. 눈을 털고 내 손으로 따라가 볼까?',after:'빈 보따리를 무겁게 채우려던 날이었구나. 나는 빈 곳이 있어야 엄마 약을 넣을 텐데.'},
    snow_sign:{act:'snowPrint',intro:'기둥 뒤에 무늬를 팠네. 눈이 덮여도 이 홈은 없어지지 않았어.',look:'젊은 아빠도 여기서 아래를 봤겠지. 무늬를 짚으면서 아빠가 보던 쪽으로 서 보자.',after:'올라올 때는 별을 봤어. 내려갈 때는 저 불빛 쪽이구나. 아빠도 길은 기억했겠네.'},
    shore_rock:{act:'shorePrint',intro:'바위의 오래된 무늬와 눈에 찍힌 새 발자국이 나란히 있어.',look:'무늬가 얼마나 닮았는지 손끝으로 짚어 보자. 미끄럽지 않은 바위 쪽에서부터.',after:'젊었을 땐 혼자 내려갔구나. 이번에는 내 발자국도 옆에 두고 같이 돌아가야지.'}
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
    talk([['아기 곰','이번엔 물소리에 깼어. 네 노래랑 다르더라. 같이 들어 볼래?']],()=>Rg.playActivity('bearSpring',()=>{
      G.f.yBearSpring=true;diary('y_bear_spring','봄에 곰 굴로 돌아왔다. 자장가 대신 물소리를 들으며 곰과 보따리를 두드렸다.');
      talk([['아기 곰','이번엔 안 졸려! 엄마도 곧 일어나겠지.']]);
    }));
  }));
  shore.npcs.push(fixture('y_home_parcel','까치에게 집으로 보낼 것 묻기',570,()=>{
    if(!G.f.spring){talk([['늙은 까치','호수 일이 끝나면 다시 들르렴.\n남쪽으로 갈 때 네 짐도 실어 주마.']]);return;}
    if(!Rg.offerHomeGift?.())talk([['늙은 까치','집에 갈 때 빨간 열매도 챙겨 가거라.\n엄마 손에 네가 쥐여 드려도 좋지.']]);
  }));
  for(const id of ['shelter','snow','shore']){
    const z=Rg.zones[id],npcs=z.npcs.slice(),oldStep=z.step;
    Object.defineProperty(z,'npcs',{get:()=>npcs.concat((Rg.expContent.stamps[id]||[]).filter(s=>stampFound(s.id)).map(s=>({...fixture('hands_'+s.id,'도장 홈 손끝으로 짚기',s.x,()=>traceStamp(s)),y:s.y})))});
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
