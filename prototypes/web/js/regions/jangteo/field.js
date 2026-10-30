'use strict';
/* 큰 장터 필드: 설 대목 장터(낮/밤), 붉은 등불, 떡집, 보부상 숙소, 창고, 뒷산 소나무 숲, 눈.
   숙소 마루에서 쉬면 낮과 밤이 바뀐다 (부엉 영감은 밤에만 깨어 있다) */
(()=>{
const Rg=REGIONS.jangteo;
const INN_X0=1010,INN_X1=1270;     // 보부상 숙소
const STORE_X=1500;                // 숙소 창고 (그믐 밤에 헌물 도깨비가 나타난다)
const FOREST_X=1640;               // 뒷산 소나무 숲
const night=()=>G.f.night;

/* ---------- 배경 ---------- */
function ridge(par,col,base,amp,freq){ctx.fillStyle=col;for(let x=0;x<W;x+=2){const wx=x+cam*par;const h=base-Math.sin(wx*freq)*amp-Math.sin(wx*freq*2.7+1)*amp*0.35;ctx.fillRect(x,Math.round(h),2,H-Math.round(h));}}
function drawSky(){
  const g=ctx.createLinearGradient(0,0,0,H);
  if(night()){g.addColorStop(0,'#141a2e');g.addColorStop(.6,'#262c48');g.addColorStop(1,'#3a3a54');}
  else{g.addColorStop(0,'#dfe4ea');g.addColorStop(.6,'#c4ccd6');g.addColorStop(1,'#aeb6c2');}
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  if(night()){for(let i=0;i<40;i++){const x=Math.round((hash(i*9.1)*W*1.4-cam*0.02)%W+W)%W,y=Math.round(hash(i*3.3)*90);R(x,y,1,1,i%5?'#c8d0e8':'#fff6d8');}
    R(Math.round(70-cam*0.02),24,2,10,'#e8e0c0');}   // 그믐 전 가는 달
  else{const sx=Math.round(320-cam*0.03);R(sx,30,14,14,'#f8f6ee');R(sx-2,33,18,8,'#f8f6ee');}
  ridge(0.12,night()?'#1e2238':'#9aa4b2',120,28,0.007);
  ridge(0.25,night()?'#262a42':'#868f9c',140,20,0.012);
}
function drawGround(){
  R(0,GROUND,W,H-GROUND,night()?'#3a3a48':'#7a7468');R(0,GROUND,W,3,night()?'#d8dcea':'#f2f4f6');
  const s=Math.floor(cam);
  for(let x=0;x<W;x+=3){const wx=x+s-(s%3);const r=hash(wx+11);
    if(r<0.3)R(x-(s%3),GROUND+2+Math.floor(r*8),2,1,night()?'#c8cce0':'#e8ecf0');
    if(r>0.93)R(x-(s%3),GROUND+7+Math.floor(r*10),3,1,night()?'#2a2a36':'#5a544a');}
}
/* 장터 가게 줄: 처마, 붉은 등불, 낮에는 흰 천막 */
function drawStall(wx,i){const x=wx-cam;if(x<-60||x>W+60)return;
  const roof=['#7a4a2a','#6b4423','#8a5a3a'][i%3];
  R(x,GROUND-30,52,30,night()?'#4a3a30':'#a8825a');R(x,GROUND-30,52,2,'#5a3a22');R(x+4,GROUND-24,44,12,night()?'#2a2018':'#e8dcc0');
  R(x-6,GROUND-40,64,10,roof);R(x-6,GROUND-41,64,2,'#f4f6f8');
  for(let k=0;k<3;k++){const lx=x+6+k*20,ly=GROUND-38;R(lx+3,ly,1,4,'#3a2a1e');R(lx,ly+4,7,8,night()?'#ff9a3a':'#c9452a');R(lx+1,ly+5,5,1,night()?'#ffe0a0':'#e06a4a');
    if(night()){ctx.fillStyle='rgba(255,170,70,.14)';ctx.fillRect(Math.round(lx-5),ly,17,18);}}
  const goods=[['#e0602a','#e8783a'],['#efe8dc','#8a2a22'],['#d9a441','#e6b54a'],['#6f9a4a','#5a8a3a']][i%4];
  for(let k=0;k<4;k++)R(x+8+k*10,GROUND-16,7,4,goods[k%2]);
}
/* 보부상 숙소: 기와 지붕, 마당, 처마 등불 */
function drawInn(){const x=INN_X0-cam,w=INN_X1-INN_X0;if(x>W+20||x+w<-20)return;
  R(x,GROUND-44,w,44,night()?'#4a3e34':'#b8946a');R(x+6,GROUND-40,w-12,6,night()?'#3a3028':'#a07a52');
  for(let k=0;k<5;k++)R(x+20+k*48,GROUND-34,18,22,night()?'#e8b860':'#efe6cf');
  for(let k=0;k<5;k++)R(x+20+k*48,GROUND-24,18,1,'#6b4423');
  R(x-12,GROUND-58,w+24,14,'#3a3a44');R(x-16,GROUND-60,w+32,3,'#2a2a34');R(x-12,GROUND-61,w+24,2,'#f4f6f8');
  for(let k=0;k<w+24;k+=8)R(x-12+k,GROUND-46,6,2,'#4a4a56');
  R(x+w/2-26,GROUND-74,52,14,'#5a361e');R(x+w/2-22,GROUND-71,44,8,'#efe6cf');
  R(x+w/2-16,GROUND-69,4,4,'#2b1d14');R(x+w/2-8,GROUND-69,4,4,'#2b1d14');R(x+w/2,GROUND-69,4,4,'#2b1d14');R(x+w/2+8,GROUND-69,4,4,'#2b1d14');   // 현판
}
/* 창고 */
function drawStore(){const x=STORE_X-cam;if(x<-60||x>W+60)return;
  R(x-40,GROUND-40,80,40,night()?'#3a3028':'#8a6a4a');R(x-46,GROUND-50,92,10,'#4a3a30');R(x-46,GROUND-51,92,2,'#f4f6f8');
  R(x-12,GROUND-30,24,30,night()?'#1a1410':'#4a2e1f');R(x-1,GROUND-30,2,30,'#2a1a10');R(x-4,GROUND-18,8,3,'#9aa0a6');
  if(G.f.guard&&!G.boss.dead&&night()){const fl=Math.floor(G.anim/8)%2;R(x-30+fl,GROUND-26,4,4,'#4a90d0');R(x+24-fl,GROUND-34,3,3,'#7ab8e8');}   // 창고 안에서 푸른 불빛
}
/* 뒷산 소나무 숲 */
function drawForest(){for(let wx=FOREST_X;wx<2400;wx+=64){const x=wx-cam;if(x<-40||x>W+40)continue;const r=hash(wx);const h=60+r*30;
  R(x+12,GROUND-h*0.5,6,h*0.5,'#4a3424');R(x,GROUND-h,30,h*0.45,night()?'#1e3a2e':'#3e5a4a');R(x+4,GROUND-h-12,22,14,night()?'#24463a':'#46664f');R(x+10,GROUND-h-20,10,10,night()?'#2a5040':'#507458');
  R(x+2,GROUND-h-1,26,2,'#f4f6f8');R(x+6,GROUND-h-13,18,2,'#f4f6f8');}}
function drawLogsSnow(){for(const p of REG.platforms){const x=p.x-cam;if(x>W||x+p.w<0)continue;R(x,p.y-1,p.w,2,'#f4f6f8');}}
Rg.drawBack=()=>{drawSky();drawGround();};
Rg.drawScenery=()=>{
  [140,470,560,760,850].forEach((wx,i)=>drawStall(wx,i));
  drawInn();drawStore();drawForest();drawLogsSnow();
  const sx=2338-cam;if(G.f.hongsiMade&&sx<W+20){R(sx,GROUND-26,2,26,'#6b4423');R(sx-8,GROUND-26,18,8,'#c9a27a');R(sx+6,GROUND-24,2,4,'#6b4423');}
};
Rg.drawPickup=(a,x,bob)=>{R(x-2,a.y-7+bob,5,2,'#8a5a2b');R(x-3,a.y-5+bob,7,2,'#6b4423');R(x-2,a.y-3+bob,5,2,'#8a5a2b');R(x-1,a.y-1,3,1,'#5a3a20');};

/* 눈 */
const snow=Array.from({length:36},()=>({x:Math.random()*W,y:Math.random()*H,s:0.25+Math.random()*0.45,p:Math.random()*6}));
Rg.ambient=()=>{for(const l of snow){l.y+=l.s;l.p+=0.02;l.x+=Math.sin(l.p)*0.3-0.08;if(l.y>H){l.y=-3;l.x=Math.random()*W;}if(l.x<-3)l.x=W+2;}};
Rg.drawFront=()=>{for(const l of snow)R(l.x,l.y,Math.sin(l.p)>0.3?2:1,Math.sin(l.p)>0.3?2:1,'#ffffff');
  if(night()){ctx.fillStyle='rgba(10,14,40,.18)';ctx.fillRect(0,0,W,H);}};

/* ---------- 진행 ---------- */
Rg.maxX=()=>2330;
Rg.step=()=>{
  // 같은 출처에서 확장 저장을 옛 구성으로 비교해도 구역 태그 때문에 채집물이 사라지지 않는다.
  if(CLASSIC&&G.pickups.some(a=>a.zone)){
    G.pickups=Rg.newState().pickups;G.px=60;G.py=GROUND;G.vy=0;G.cam=0;
  }
  if(G.f.guard&&night()&&!G.boss.dead&&Math.abs(G.px-STORE_X)<24)Rg.startDokkaebi();
  if(has('hongsi_tteok')&&!G.f.hongsiMade)Rg.sendMedicine();
};
Rg.onHit=()=>{};
Rg.faint=()=>{G.px=Math.max(60,G.px-80);toast('눈길에 미끄러져 물러났다');};
/* 도깨비를 이기거나 달래면 훔쳐 간 설 제수가 돌아온다. 눈홍시는 보따리로 */
Rg.bossDie=calm=>{
  G.boss.dead=true;addItem('nunhongsi',1);
  if(Rg.arcs())G.f.jangteoArcsScissorsFound=true;
  diary('j_boss','창고를 털던 범인은 낡은 빗자루·키·멍석에 깃든 헌물 도깨비였다. 훔쳐 간 설 제수가 돌아왔다.'+(calm?' 도깨비는 눈홍시를 하나 더 내밀었다.':''));
  toast('눈홍시를 되찾았다! 시루로 홍시 약떡을 찌자');refreshGoal();
};
Rg.STORE_X=STORE_X;

/* PA-43 [개발자 결정]. 옛 장터는 위에 그대로 두고, 확장에서는 구역 안 좌표만 쓴다.
   필수: 입구 → 거리 → 숙소(밤) → 거리/솔숲 → 시루/고사떡 → 숙소 → 창고.
   지붕길과 밤 골목은 선택 지름길이다. 아래 눈길은 언제나 안전하게 이어진다. */
if(!CLASSIC){
  Rg.startZone='entrance';Rg.STORE_X=2320;
  const originalState=Rg.newState;
  Rg.newState=()=>{const s=originalState();s.pickups=[];s.boss.x=Rg.STORE_X;return s;};
  const peg=(x,y)=>{R(x-1,y-17,2,17,'#6b4934');R(x-9,y-19,18,7,'#ead4a6');R(x-6,y-17,11,1,'#784b36');};
  const glint=(x,y)=>pawStamp(x,y,'#a85344');
  const shutter=(x,y)=>{R(x-17,y-35,34,35,'#705346');for(let i=0;i<5;i++)R(x-15+i*6,y-33,2,30,'#987459');R(x-18,y-22,36,3,'#b64e41');};
  const gate=(x,y)=>{R(x-20,y-48,4,48,'#604635');R(x+16,y-48,4,48,'#604635');R(x-24,y-49,48,6,'#31434d');R(x-22,y-51,44,2,'#e6eaf0');if(!night()||!has('sinpyo')){R(x-16,y-23,32,3,'#ac4c43');R(x-12,y-27,24,1,'#dba56c');}};
  const needWarehouse=()=>night()&&has('sinpyo');
  const warehouseReason='신표를 받은 뒤, 숙소 마루에서 밤을 기다리자.';
  const stairs=(x,top=96)=>[{x,y:160,w:80},{x:x+90,y:128,w:90},{x:x+180,y:top,w:120}];
  const cones=(zone,coords)=>coords.map(([x,y],i)=>({id:'j_'+zone+'_fuel_'+i,x,y:y??GROUND,item:'solbang',got:false}));
  let viewedZone=null,depthDirection=0,lastFade=0;
  const common=id=>({ground:GROUND,startX:70,
    drawBack(){
      // 전경과 원경 사이의 문도 기존 구역 API로 이동한다. 지역 그리기에서만 짧게 확대한다.
      if(viewedZone!==id){
        depthDirection=(viewedZone==='street'&&id==='pine')||(viewedZone==='inn'&&id==='warehouse')?1:
          (viewedZone==='pine'&&id==='street')||(viewedZone==='warehouse'&&id==='inn')?-1:0;
        viewedZone=id;
      }else if(zoneFade>lastFade)depthDirection=0;
      lastFade=zoneFade;
      const depth=zoneFade>0&&depthDirection&&!Vfx.reducedMotion;
      ctx.save();if(depth){const z=1+depthDirection*zoneFade/(H/2);ctx.translate(W/2,H/2);ctx.scale(z,z);ctx.translate(-W/2,-H/2);}
      Rg.expArt.drawBack(id);
    },
    drawScenery(){Rg.expArt.drawScenery(id);},
    drawPickup:Rg.drawPickup,onHit:Rg.onHit,ambient:Rg.ambient,
    weather:()=>{if(Rg.springRevisit())Vfx.setWeather('');else Rg.weather();},
    weatherFront(){Rg.expArt.drawFront?.(id);ctx.restore();},
    faint(){G.px=Math.max(60,G.px-80);G.py=GROUND;G.vy=0;toast('눈을 털고 다시 걸었다.');},
    step(){
      const legacy=G.pickups.filter(a=>a.item==='solbang'&&!a.zone);
      if(legacy.length){
        const pine=G.pickups.filter(a=>a.zone==='pine');
        legacy.forEach((a,i)=>{if(a.got&&pine[i])pine[i].got=true;});
        G.pickups=G.pickups.filter(a=>a.zone||a.item!=='solbang');
      }
      if(has('hongsi_tteok')&&!G.f.hongsiMade&&id==='inn'&&Math.abs(G.px-1530)<45)Rg.sendMedicine();
      if(id==='warehouse'&&G.f.guard&&night()&&!G.boss.dead&&Math.abs(G.px-Rg.STORE_X)<24)Rg.startDokkaebi();
      if(isAwake('siru')&&!G.f.jxHubChanged&&id==='street'){
        G.f.jxHubChanged=true;diary('jx_hub','시루를 깨워 돌아오니 떡집 앞 멈췄던 줄이 줄었다. 모락의 김이 골목 끝까지 번졌다.');
        toast('떡집 앞 줄이 줄었다. 밤에는 접힌 좌판 사이로 숙소에 갈 수 있다.');
      }
    },
  });
  const E=Rg.expEncounters;
  Rg.lanternPoints=[
    {id:'porch',zone:'inn',x:1380,y:GROUND},
    {id:'gate',zone:'inn',x:2000,y:GROUND},
    {id:'alley',zone:'street',x:2250,y:GROUND},
    {id:'pine',zone:'pine',x:450,y:GROUND},
  ];
  // getter를 다시 읽어도 같은 대상을 찾도록 활동 오브젝트는 한 번만 만든다.
  const lanterns=Rg.lanternPoints.map(p=>({
    ...p,id:'j_lantern_'+p.id,
    get name(){return G.f.jxLanterns?.[p.id]?'불 켠 등':'빈 등걸이';},
    get prompt(){return G.f.jxLanterns?.[p.id]?'등불 아래 살펴보기':'등걸이에 등 달기';},
    draw:(x,y)=>Rg.expArt.drawWorkLantern(x,y,!!G.f.jxLanterns?.[p.id]),
    talk:()=>Rg.lanternAction(p.id),
  }));
  const nightLanterns=zone=>night()?lanterns.filter(p=>p.zone===zone):[];
  const yutBoard={id:'j_yut_board',name:'윷판',prompt:'윷놀이 시작·이어 하기',x:1960,y:GROUND,
    draw(x,y){
      R(x-15,y-4,30,4,'#c2a576');R(x-13,y-5,26,1,'#ead4a2');
      for(let i=0;i<4;i++)R(x-11+i*7,y-3,2,1,'#785c43');
      R(x-8,y-8,4,3,'#c6b691');R(x+4,y-8,4,3,'#936c46');
    },
    talk:()=>Rg.playYut(),
  };
  const lanternBundle={id:'j_lantern_bundle',name:'등불 꾸러미',prompt:'까치와 등불 꾸러미 풀기',x:1610,y:GROUND,
    draw(x,y){
      R(x-9,y-10,18,10,'#91704f');R(x-7,y-13,14,4,'#c3a26f');
      R(x-1,y-12,2,12,'#dfc88e');R(x-4,y-14,8,2,'#69523b');
      Rg.expArt.lantern(x+6,y-18,1,false);
    },
    talk:()=>Rg.lanternTalk(),
  };
  Rg.zones={
    entrance:{...common('entrance'),name:TABLES.ZONES.jangteo.entrance,w:2600,npcs:[],
      platforms:[...stairs(1040),...stairs(1980)],
      pickups:cones('entrance',[[330,192],[355,192],[380,192]]),
      exits:{right:{to:'street',toX:60}},
      doors:[{x:1310,y:96,to:'street',toX:1010,toY:96,label:'연줄을 따라 처마 건너기',need:()=>!!G.f.jxKiteDone,reason:'연을 풀어 준 뒤 아이에게 안전한 처마길을 물어보자.',draw:peg,drawBlocked:shutter}],
      wanderers:E.wanderers.entrance,examines:E.examines.entrance,
      stamps:[{id:'flag',x:720,note:'stamp:jangteo:flag',draw:glint}],
    },
    street:{...common('street'),name:TABLES.ZONES.jangteo.street,w:2800,npcs:['morak','yeotbang','nal'],
      platforms:[...stairs(430),{x:610,y:96,w:510},{x:1250,y:110,w:300},...stairs(2370),{x:2550,y:96,w:180}],
      pickups:cones('street',[[830,192],[850,192],[875,192]]),
      exits:{left:{to:'entrance',toX:2530},right:{to:'inn',toX:60}},
      doors:[{x:1180,to:'street',toX:1310,toY:110,label:'떡집 문 열기',need:()=>!night(),reason:'앞문은 닫혔다. 오른쪽에 불 켜진 옆문이 있다.',draw:peg,drawBlocked:shutter},
        {x:1590,to:'street',toX:1490,toY:110,label:'떡집 아궁이 옆문으로',draw:peg},
        {x:1515,y:110,to:'street',toX:1625,label:'떡집 밖으로',draw:peg},
        {x:1010,y:96,to:'entrance',toX:1310,toY:96,label:'연이 걸렸던 처마로 돌아가기',need:()=>!!G.f.jxKiteDone,reason:'입구에서 연을 풀어 준 뒤 걸어 보자.',draw:peg},
        {x:2180,to:'pine',toX:70,label:'굴뚝 뒤 소나무 숲으로',draw:peg},
        {x:2040,to:'inn',toX:1510,label:'접힌 좌판 사이, 숙소 지름길',need:night,reason:'낮에는 좌판이 골목을 막는다. 밤이면 접힌다.',draw:peg,drawBlocked:shutter},
        {x:2650,y:96,to:'pine',toX:2480,toY:96,label:'처마 너머 보이던 솔숲 능선으로',need:()=>!!G.f.jxKiteDone,reason:'입구의 아이가 연을 풀면 처마길을 알려 준다.',draw:peg}],
      get wanderers(){return [...E.wanderers.street,yutBoard,...nightLanterns('street')];},examines:E.examines.street,
    },
    inn:{...common('inn'),name:TABLES.ZONES.jangteo.inn,w:2600,npcs:['bueong','maru'],
      platforms:[...stairs(1160),{x:1340,y:96,w:100},...stairs(1590,128),{x:1770,y:128,w:200},...stairs(2220)],
      pickups:cones('inn',[[420,192],[445,192],[470,192]]),
      exits:{left:{to:'street',toX:2720},right:{to:'warehouse',toX:60,need:needWarehouse,reason:warehouseReason,drawBlocked:gate}},
      doors:[{x:700,to:'inn',toX:850,label:'숙소 문 열기',draw:peg},
        {x:1120,to:'inn',toX:660,label:'숙소 마당으로',draw:peg},
        {x:1510,to:'street',toX:2040,label:'밤 골목으로 돌아가기',need:night,reason:'낮에는 장터 좌판이 길을 막는다. 왼쪽 큰길로 돌아가자.',draw:peg,drawBlocked:shutter},
        {x:2130,to:'warehouse',toX:280,label:'마루에서 보았던 푸른 창고문 안으로',need:needWarehouse,reason:warehouseReason,draw:gate}],
      get wanderers(){return [...E.wanderers.inn,lanternBundle,...nightLanterns('inn')];},examines:E.examines.inn,
      stamps:[{id:'pillar',x:1280,y:128,note:'stamp:jangteo:pillar',draw:glint}],
      vistas:[{id:'icicles',x:1850,y:128,from:0,to:420,sound:'wind',draw:peg,
        thought:'고드름 속 지붕이다.\n저 푸른 문도 가 보고 싶어.',
        diary:'숙소 마루에서 고드름 너머 장터 지붕을 보았다. 처마 사이로 창고의 푸른 문이 보인다.',layers:Rg.expArt.innVista}],
    },
    pine:{...common('pine'),name:TABLES.ZONES.jangteo.pine,w:2800,npcs:[],
      platforms:[...stairs(420),...stairs(1100),...stairs(2180),{x:2390,y:96,w:340}],
      pickups:cones('pine',[[250,192],[280,192],[310,192],[600,96],[630,96],[700,192],[850,192],[1040,192],[1270,128],[1370,192],[1500,192],[1980,192],[2250,160],[2600,96]]),
      doors:[{x:70,to:'street',toX:2180,label:'떡집 굴뚝을 향해 내려가기',draw:peg},
        {x:2480,y:96,to:'street',toX:2650,toY:96,label:'등불 아래 장터 지붕으로',need:()=>!!G.f.jxKiteDone,reason:'처마길은 입구 아이에게 연을 돌려준 뒤 알려 달라고 하자.',draw:peg}],
      exits:{left:{to:'street',toX:2180}},
      get wanderers(){return night()?[...E.wanderers.pine,...nightLanterns('pine')]:[];},examines:E.examines.pine,
      stamps:[{id:'rock',x:2410,y:96,note:'stamp:jangteo:rock',draw:glint}],
      vistas:[{id:'lantern_river',x:2570,y:96,from:0,to:420,sound:'wind',draw:peg,
        get thought(){return night()?'등불이 쭉 이어졌네.\n엄마 방에도 달아 드릴까.':'깃발 아래서 김이 올라오네.\n아까 그 떡집이다.';},
        diary:'뒷산 솔숲 꼭대기에서 장터를 내려다봤다. 굴뚝과 깃발이 길을 가리키고, 밤이면 등불이 강물처럼 이어진다.',layers:Rg.expArt.pineVista}],
    },
    warehouse:{...common('warehouse'),name:TABLES.ZONES.jangteo.warehouse,w:2600,npcs:[],
      platforms:[...stairs(460),...stairs(1230),...stairs(1840),...stairs(2340)],
      pickups:cones('warehouse',[[700,192],[725,192],[750,192]]),
      exits:{left:{to:'inn',toX:2490}},
      doors:[{x:280,to:'inn',toX:2130,label:'지붕 사이, 숙소 불빛으로 돌아가기',draw:gate},
        {x:2290,to:'inn',toX:1530,label:'짐 나르는 귀환 문으로 숙소에',need:()=>G.boss.dead,
          reason:'도깨비가 물러나면 짐 나르는 귀환 문을 쓸 수 있겠다.',draw:gate,drawBlocked:shutter}],
      examines:E.examines.warehouse,
      drawActors(){
        const x=Rg.STORE_X-cam;R(x-38,GROUND-58,76,58,'#493d3b');R(x-44,GROUND-62,88,5,'#243b48');R(x-44,GROUND-64,88,2,'#dbe8ed');
        R(x-15,GROUND-41,30,41,'#222f3a');R(x-2,GROUND-41,3,41,'#678393');
        if(!G.boss.dead){R(x-24,GROUND-27,4,5,'#72b4c7');R(x+22,GROUND-18,3,5,'#a8d4d6');}
        else{R(x-21,GROUND-11,13,10,'#9b724c');R(x+9,GROUND-13,12,12,'#d1ab67');}
      },
    },
  };
  // 길손의 조사에는 배경과 구별되는 작고 일정한 표지를 쓴다. 숨은 도장은 표지를 붙이지 않는다.
  for(const z of Object.values(Rg.zones))for(const p of z.examines)p.draw=p.draw||((x,y)=>{R(x-2,y-6,5,4,'#caa970');R(x,y-10,1,2,'#f6ead0');});
}
})();
