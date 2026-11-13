'use strict';
/* 결정 D-1469 (사용자 지시 2026-11-13 "채집 및 루팅 재료 중 현실에 없는 것들도 만들어 주고 다른 재료와 똑같이 조합법에 녹여 쓰임새 만들어 주기.
   식물도감에 사람들이 잘 모를 만한 식물이나 과일의 모습을 차용하면 더 좋음"): 지역마다 두 가지씩, 이 세계에만 있는 들풀·열매.
   이름과 성질은 지어냈고, 모습은 잘 알려지지 않은 실제 식물에서 빌렸다.
     별받침 열매 ← 누리장나무 (붉은 별 꽃받침 가운데 쪽빛 알) · 솜구름 열매 ← 으름 (저절로 벌어지는 보랏빛 꼬투리)
     돌탑솔 ← 바위솔 (바위·기와 위에 탑처럼 쌓인 잎) · 초롱알 ← 노박덩굴 (세 쪽으로 벌어지는 노란 껍질과 주홍 알)
     엿가지 열매 ← 헛개나무 (꼬불꼬불 단 꼭지) · 딸랑망개 ← 청미래덩굴 (반질한 둥근 잎과 붉은 알 송이, 망개떡 잎)
     눈녹이꽃 ← 복수초 (눈을 녹이며 피는 금빛 꽃) · 서리까막 ← 시로미 (높은 산 바위에 깔리는 덩굴과 까만 알)
   이름·설명·얻는 곳은 design/data/items.csv, 조합법은 heirlooms.csv(숨은 조합법), 아빠 메모는 recipe_hints.csv 에 있다.
   좌표는 길을 줄인 뒤의 자리(addZoneGather). 지역 field.js 가 다른 채집 자리를 다 더한 뒤 addWildGather 를 부른다. */
const WILD_SPOTS={
  galchamgol:[
    {zone:'village',x:670,item:'byeolbatchim'},{zone:'forge',x:900,item:'byeolbatchim'},
    {zone:'forest',x:1220,item:'somgureum'},{zone:'hill',x:1220,item:'somgureum'},
  ],
  dolneomeo:[
    {zone:'cliff',x:1150,item:'doltapsol'},{zone:'shrine',x:960,item:'doltapsol'},
    {zone:'gate',x:450,item:'chorongal'},{zone:'village',x:620,item:'chorongal'},{zone:'village',x:2120,item:'chorongal'},
  ],
  jangteo:[
    {zone:'street',x:1170,item:'yeotgaji'},{zone:'inn',x:1640,item:'yeotgaji'},
    {zone:'entrance',x:920,item:'ttallang'},{zone:'pine',x:1160,item:'ttallang'},
  ],
  yeongsan:[
    {zone:'shelter',x:1330,item:'nunnogi'},{zone:'shore',x:1270,item:'nunnogi'},
    {zone:'shelter',x:860,item:'seorikkamak'},
    {zone:'snow',x:1290,y:108,item:'seorikkamak'},   // 능선(1170~1574, 높이 108) 위 바위. 땅 높이에 두면 능선 언덕 속에 묻힌다
  ],
};
function addWildGather(r,region){
  addZoneGather(r,'wild_'+region+'_',(WILD_SPOTS[region]||[]).map(s=>[s.zone,'p',s.x,s.item,s.y?{y:s.y}:{}]));
}

/* 필드에 떨어진 모습. 다른 줍는 재료처럼 주인공 머리보다 작게(가로 9·세로 12 안쪽, 결정 D-966). (x, y)는 땅에 닿는 밑동 가운데 */
const WILD_PICKUP={
  byeolbatchim(x,y,bob){
    R(x,y-12,1,5,'#5a4030');R(x-3,y-8,7,1,'#5a4030');
    const star=(cx,cy)=>{R(cx-2,cy,5,1,'#c8323a');R(cx,cy-2,1,5,'#c8323a');R(cx-1,cy-1,3,3,'#e0505a');R(cx,cy,1,1,'#2a3f8a');R(cx+1,cy,1,1,'#1c2c66');R(cx,cy-1,1,1,'#6a8ad0');};
    star(x-3,y-5+bob);star(x+3,y-4+bob);
  },
  somgureum(x,y,bob){
    R(x,y-2,1,2,'#5a3a20');   // 꼭지
    R(x-4,y-5,9,2,'#7a4a8a');R(x-3,y-3,7,1,'#5a2a6a');R(x-5,y-7,2,2,'#7a4a8a');R(x+4,y-7,2,2,'#7a4a8a');R(x-5,y-7,1,1,'#9a6aaa');   // 배처럼 벌어진 보랏빛 꼬투리
    R(x-3,y-8+bob,7,3,'#f4f2f8');R(x-2,y-10+bob,2,2,'#f4f2f8');R(x+1,y-11+bob,3,3,'#f4f2f8');R(x+1,y-11+bob,1,1,'#ffffff');R(x-2,y-10+bob,1,1,'#ffffff');   // 구름처럼 부푼 속살
    R(x-1,y-7+bob,1,1,'#2a2228');R(x+2,y-6+bob,1,1,'#2a2228');   // 까만 씨
  },
  doltapsol(x,y,bob){
    R(x-5,y-3,11,3,'#8a8478');R(x-4,y-4,9,1,'#a39d90');   // 받친 돌
    // 층마다 잎끝이 양옆으로 삐죽 나온 탑 (바위솔)
    for(const [dy,h,c] of [[-6,3,'#6a8a7a'],[-8,2,'#7a9a8a'],[-10,1,'#8ab0a0']]){R(x-h,y+dy+bob,h*2+1,2,c);R(x-h,y+dy+1+bob,h*2+1,1,'#4f6e60');R(x-h-1,y+dy+bob,1,1,c);R(x+h+1,y+dy+bob,1,1,c);}
    R(x,y-12+bob,1,2,'#9ac0b0');R(x,y-13+bob,1,1,'#d8a0b0');
  },
  chorongal(x,y,bob){
    R(x-4,y-12,9,1,'#6b5040');R(x-3,y-11,1,2,'#6b5040');R(x+2,y-11,1,2,'#6b5040');
    const lamp=(cx,cy)=>{R(cx-2,cy,1,2,'#e8c040');R(cx+1,cy,1,2,'#e8c040');R(cx-1,cy-1,2,1,'#f0d060');R(cx-1,cy+1,2,2,'#e0502a');R(cx-1,cy+1,1,1,'#ff8a5a');};
    lamp(x-3,y-8+bob);lamp(x+3,y-7+bob);
  },
  yeotgaji(x,y,bob){
    for(const [dx,dy] of [[0,-2],[1,-3],[1,-4],[0,-5],[-1,-6],[-1,-7],[0,-8],[1,-9]])R(x+dx,y+dy+bob,2,1,'#8a5a2a');   // 꼬불꼬불한 꼭지
    for(const [dx,dy] of [[2,-6],[3,-7],[-2,-4],[-3,-5]])R(x+dx,y+dy+bob,1,1,'#a06a32');
    R(x+1,y-9+bob,1,1,'#c08a4a');R(x-1,y-6+bob,1,1,'#c08a4a');
    for(const [dx,dy] of [[2,-11],[4,-8],[-4,-6]])R(x+dx,y+dy+bob,2,2,'#5a4a3a');R(x+2,y-11+bob,1,1,'#8a7a6a');
  },
  ttallang(x,y,bob){
    R(x-4,y-9,5,5,'#3a7a3a');R(x-3,y-8,2,2,'#6ab06a');R(x-4,y-4,1,1,'#2a5a2a');   // 반질한 둥근 잎
    R(x+1,y-11,1,5,'#5a6a30');
    for(const [dx,dy] of [[1,-5],[3,-5],[2,-3],[0,-3],[2,-7]]){R(x+dx,y+dy+bob,2,2,'#d02a2a');R(x+dx,y+dy+bob,1,1,'#ff8080');}
  },
  nunnogi(x,y,bob){
    R(x-5,y-1,11,1,'#6a5a4a');R(x-4,y-2,9,1,'#7a6a52');   // 꽃 둘레만 눈이 녹았다
    R(x,y-6,1,5,'#5a7a3a');R(x-3,y-3,2,1,'#6a9a4a');R(x+2,y-4,2,1,'#6a9a4a');R(x-2,y-4,1,1,'#6a9a4a');   // 줄기와 가는 잎
    // 위로 벌어진 꽃잎 여덟 장(틈이 보이게)과 가운데 꽃술
    for(const [dx,dy] of [[-4,-8],[3,-8],[-3,-10],[2,-10],[-1,-11],[-3,-7],[2,-7]])R(x+dx,y+dy+bob,2,2,'#f0c020');
    R(x-4,y-8+bob,1,1,'#ffe060');R(x+4,y-8+bob,1,1,'#ffe060');R(x-1,y-11+bob,2,1,'#ffe060');
    R(x-1,y-9+bob,3,2,'#c08a10');R(x,y-9+bob,1,1,'#ffe8a0');
  },
  seorikkamak(x,y,bob){
    R(x-5,y-2,11,2,'#2a4a3a');R(x-4,y-3,9,1,'#3a6a4a');R(x-3,y-4,2,1,'#4a7a5a');R(x+2,y-4,2,1,'#4a7a5a');   // 낮게 깔린 덩굴
    for(const [dx,dy] of [[-3,-6],[0,-7],[3,-6],[1,-5]]){R(x+dx,y+dy+bob,2,2,'#1a1a22');R(x+dx,y+dy+bob,1,1,'#e8f0f8');}
  },
};

/* 아이콘 (16×16) */
defineIcons({
  byeolbatchim:P=>{P(7,1,1,4,'#5a4030');P(3,4,10,1,'#5a4030');
    const star=(cx,cy)=>{P(cx-3,cy,7,1,'#c8323a');P(cx,cy-3,1,7,'#c8323a');P(cx-2,cy-2,5,5,'#e0505a');P(cx-1,cy-1,3,3,'#2a3f8a');P(cx-1,cy-1,1,1,'#6a8ad0');P(cx+1,cy+1,1,1,'#1c2c66');};
    star(4,8);star(11,10);},
  somgureum:P=>{P(7,13,2,2,'#5a3a20');P(2,10,12,3,'#7a4a8a');P(3,12,10,1,'#5a2a6a');P(1,7,2,4,'#7a4a8a');P(13,7,2,4,'#7a4a8a');P(1,7,1,2,'#9a6aaa');
    P(3,6,10,4,'#f4f2f8');P(4,3,4,4,'#f4f2f8');P(8,2,5,5,'#f4f2f8');P(9,2,2,1,'#ffffff');P(5,3,1,1,'#ffffff');P(6,7,1,1,'#2a2228');P(10,8,1,1,'#2a2228');},
  doltapsol:P=>{P(2,12,12,3,'#8a8478');P(3,11,10,1,'#a39d90');
    for(const [y,h,c] of [[9,4,'#6a8a7a'],[7,3,'#7a9a8a'],[5,2,'#8ab0a0'],[3,1,'#9ac0b0']])P(8-h,y,h*2,2,c);P(7,2,2,1,'#d8a0b0');P(5,9,1,1,'#b8d8c8');},
  chorongal:P=>{P(1,2,14,1,'#6b5040');P(4,3,1,2,'#6b5040');P(11,3,1,2,'#6b5040');
    const lamp=(cx,cy)=>{P(cx-3,cy,2,4,'#e8c040');P(cx+1,cy,2,4,'#e8c040');P(cx-1,cy-1,2,1,'#f0d060');P(cx-1,cy+1,2,4,'#e0502a');P(cx-1,cy+1,1,1,'#ff8a5a');};
    lamp(5,6);lamp(12,7);},
  yeotgaji:P=>{for(const [x,y] of [[7,13],[8,12],[8,11],[7,10],[6,9],[6,8],[7,7],[8,6],[8,5],[7,4]])P(x,y,2,1,'#8a5a2a');
    P(9,9,3,1,'#a06a32');P(11,8,1,1,'#a06a32');P(4,11,3,1,'#a06a32');P(3,10,1,1,'#a06a32');P(8,6,1,1,'#c08a4a');P(7,10,1,1,'#c08a4a');
    for(const [x,y] of [[6,2],[11,6],[2,8]]){P(x,y,2,2,'#5a4a3a');P(x,y,1,1,'#8a7a6a');}},
  ttallang:P=>{P(1,4,7,7,'#3a7a3a');P(2,5,3,3,'#6ab06a');P(1,10,1,1,'#2a5a2a');P(4,7,1,4,'#2a5a2a');P(9,1,1,6,'#5a6a30');
    for(const [x,y] of [[8,7],[11,7],[9,10],[12,10],[10,13],[7,11]]){P(x,y,3,3,'#d02a2a');P(x,y,1,1,'#ff8080');}},
  nunnogi:P=>{P(1,13,14,2,'#6a5a4a');P(2,12,12,1,'#7a6a52');P(7,8,2,5,'#5a7a3a');P(4,10,3,1,'#6a9a4a');P(9,11,3,1,'#6a9a4a');
    for(const [x,y] of [[2,4],[11,4],[4,1],[9,1],[7,0],[3,7],[10,7]]){P(x,y,3,3,'#f0c020');P(x,y,1,1,'#ffe060');}
    P(6,4,4,3,'#c08a10');P(7,4,1,1,'#ffe8a0');},
  seorikkamak:P=>{P(1,12,14,3,'#2a4a3a');P(2,11,12,1,'#3a6a4a');P(3,10,3,1,'#4a7a5a');P(10,10,3,1,'#4a7a5a');
    for(const [x,y] of [[3,6],[7,4],[11,6],[8,8]]){P(x,y,3,3,'#1a1a22');P(x,y,1,1,'#e8f0f8');}},
  /* 조합한 먹을거리 */
  jjokbit_dasik:P=>{for(const [x,y] of [[2,6],[9,4],[6,10]]){P(x,y,5,5,'#3a5aa8');P(x,y,5,1,'#6a8ad0');P(x+1,y+2,3,1,'#2a3f8a');P(x+2,y+1,1,3,'#2a3f8a');}},
  somgureum_pyeon:P=>{for(const [x,y] of [[2,6],[8,8]]){P(x,y,6,5,'#c8b0d8');P(x,y,6,1,'#e8dcf0');P(x+1,y+2,1,1,'#7a4a8a');P(x+4,y+3,1,1,'#7a4a8a');}},
  gureumtteok:P=>{P(2,6,12,7,'#f6f2f8');P(2,6,12,1,'#ffffff');P(3,8,3,2,'#d8c8e8');P(9,9,3,2,'#d8c8e8');P(6,11,2,1,'#c0a8d8');P(2,13,12,1,'#b8a8c8');},
  doltapsol_jangajji:P=>{P(3,4,10,10,'#7a5a3a');P(4,3,8,1,'#5a4028');P(4,5,8,7,'#4a3a28');P(5,6,2,2,'#7a9a8a');P(8,7,2,2,'#8ab0a0');P(6,9,2,2,'#6a8a7a');P(10,9,1,1,'#9ac0b0');},
  chorongal_eungi:P=>{P(2,8,12,2,'#684b37');P(3,10,10,3,'#a77b52');P(5,13,6,1,'#684b37');P(4,6,8,3,'#f0c8a0');P(6,6,2,1,'#e0502a');P(9,7,1,1,'#e0502a');},
  yeotgaji_kongyeot:P=>{P(2,5,12,8,'#9a6a32');P(2,5,12,1,'#c08a4a');for(const [x,y] of [[3,7],[6,8],[9,7],[11,10],[5,11],[8,10]]){P(x,y,2,2,'#e2cf8a');P(x,y,1,1,'#f4e6b0');}},
  mangaetteok:P=>{for(const [x,y] of [[2,5],[8,8]]){P(x,y,6,6,'#3a7a3a');P(x+1,y+1,4,4,'#f4f0e6');P(x+2,y+2,2,2,'#8a3a2a');P(x,y,6,1,'#5aa05a');}},
  nunnogi_seolgi:P=>{P(2,6,12,8,'#f8f6ee');P(2,6,12,1,'#ffffff');P(2,13,12,1,'#d8d0c0');P(5,8,3,3,'#f0c020');P(6,9,1,1,'#c08a10');P(10,9,2,2,'#ffe060');},
  sanyeolmae_jeonggwa:P=>{for(const [x,y] of [[2,7],[7,5],[10,9]]){P(x,y,4,4,'#c88a2a');P(x,y,4,1,'#f0c060');}P(4,8,1,1,'#1a1a22');P(9,6,1,1,'#d8402a');P(12,10,1,1,'#1a1a22');P(3,13,10,1,'#a87020');},
});
