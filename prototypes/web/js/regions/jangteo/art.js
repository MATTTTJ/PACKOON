'use strict';
/* 큰 장터 동물들의 도트 그림과 소품. (ox, oy)는 발밑, f 는 바라보는 방향 */
(()=>{
const Rg=REGIONS.jangteo;
Rg.springRevisit=()=>!CLASSIC&&!!G?.f?.spring&&regionCompleted('yeongsan');
// 결정 D-661·D-662: 눈 장승은 아이 키만 한 작은 장승(높이 30)이고, 날쌘까지 길을 반으로 줄이려 장터 거리로 나가는 출구 가까이(설계 2340) 선다.
Rg.SNOW_JANGSEUNG_DX=2340;Rg.SNOW_JANGSEUNG_H=30;
Rg.snowJangseungX=()=>trimX(Rg.SNOW_JANGSEUNG_DX,Rg.trimCuts?.entrance);
const night=()=>G&&G.f&&G.f.night;
Rg.art={
  /* 부엉 영감: 수리부엉이. 낮에는 눈을 감고 존다 */
  owl(ox,oy,f){const Br='#7a5a3a',Dk='#4a3420',Lt='#c9a878',K='#1a1410',Ey='#f0b030';
    M(ox,oy,f,-7,-20,14,18,Br);M(ox,oy,f,-5,-14,10,11,Lt);for(let i=0;i<3;i++)M(ox,oy,f,-4+i*3,-12+((i%2)*3),2,1,Dk);
    M(ox,oy,f,-8,-23,3,4,Dk);M(ox,oy,f,5,-23,3,4,Dk);
    if(night()||ctx.canvas!==cv){M(ox,oy,f,-5,-19,4,4,Ey);M(ox,oy,f,1,-19,4,4,Ey);M(ox,oy,f,-4,-18,2,2,K);M(ox,oy,f,2,-18,2,2,K);}
    else{M(ox,oy,f,-5,-17,4,1,K);M(ox,oy,f,1,-17,4,1,K);}
    M(ox,oy,f,-1,-15,2,2,'#5a4a3a');M(ox,oy,f,-5,-2,3,2,'#c9a040');M(ox,oy,f,2,-2,3,2,'#c9a040');
    M(ox,oy,f,7,-14,2,8,'#3a2a1e');M(ox,oy,f,6,-16,5,2,'#efe6cf');},
  /* 모락: 반달가슴곰 떡집 주인. 가슴에 흰 반달 */
  bear(ox,oy,f){const Bk='#2a2422',Gy='#3e3632',Wt='#efe8dc',K='#0e0a08';
    M(ox,oy,f,-9,-18,18,17,Bk);M(ox,oy,f,-6,-10,12,2,Wt);M(ox,oy,f,-4,-8,8,1,Wt);
    M(ox,oy,f,-6,-27,13,10,Bk);M(ox,oy,f,-7,-29,4,4,Bk);M(ox,oy,f,4,-29,4,4,Bk);
    M(ox,oy,f,2,-22,6,4,'#6b5a4a');M(ox,oy,f,6,-22,2,2,K);M(ox,oy,f,1,-25,2,2,'#e8e0d0');M(ox,oy,f,2,-25,1,1,K);
    M(ox,oy,f,-7,-15,14,6,'#f4efe4');M(ox,oy,f,-7,-15,14,1,'#d8cfc0');
    M(ox,oy,f,-7,-2,5,2,Gy);M(ox,oy,f,2,-2,5,2,Gy);},
  /* 엿방울: 여우 엿장수. 엿판을 메고 큰 가위를 든다 */
  fox(ox,oy,f){const Or='#d9733a',Dk='#a8502a',Wt='#f6efe2',K='#1a1410';const clip=Math.floor(G.anim/16)%2;
    if(Rg.arcs()&&night()&&!G.boss.dead&&ctx.canvas===cv){
      // 대화 초상은 그대로, 필드에서는 실제로 엿수레 밑에 웅크린다.
      const x=ox+29+(Math.floor(G.anim/8)%2),y=oy-3;
      R(x-4,y-3,8,3,Or);R(x-5,y-5,2,2,Or);R(x+3,y-5,2,2,Or);
      R(x-3,y-2,1,1,K);R(x+2,y-2,1,1,K);return;
    }
    M(ox,oy,f,-12,-8,6,4,Or);M(ox,oy,f,-14,-7,3,3,Wt);
    M(ox,oy,f,-5,-15,9,13,Or);M(ox,oy,f,-2,-12,4,8,Wt);
    M(ox,oy,f,-3,-23,9,8,Or);M(ox,oy,f,-4,-26,3,4,Or);M(ox,oy,f,3,-26,3,4,Or);M(ox,oy,f,-3,-25,1,2,Dk);M(ox,oy,f,4,-25,1,2,Dk);
    M(ox,oy,f,4,-19,4,3,Wt);M(ox,oy,f,7,-18,1,1,K);M(ox,oy,f,1,-21,1,1,K);
    M(ox,oy,f,-4,-2,3,2,Dk);M(ox,oy,f,1,-2,3,2,Dk);
    M(ox,oy,f,6,-15-clip,1,7,'#7a7e84');M(ox,oy,f,8,-15+clip,1,7,'#9aa0a6');M(ox,oy,f,6,-9,3,2,'#3a2a1e');},
};
Rg.props={
  /* 떡집: 초가 지붕, 굴뚝에서 장터 어디서나 보이는 김 */
  tteokjip(n){const x=n.x-cam;
    R(x-50,GROUND-34,64,34,'#c9a27a');R(x-50,GROUND-34,2,34,'#6b4423');R(x+12,GROUND-34,2,34,'#6b4423');
    R(x-56,GROUND-44,76,11,'#c49a52');R(x-50,GROUND-50,64,6,'#d4ae63');R(x-26,GROUND-26,14,26,'#4a2e1f');
    R(x-46,GROUND-28,14,9,'#f2e6cc');R(x-45,GROUND-25,12,1,'#b4432a');
    R(x+2,GROUND-64,8,22,'#7a6a5a');R(x+1,GROUND-66,10,3,'#5a4a3a');
    const t=G.anim;for(let i=0;i<5;i++){const k=(t*0.6+i*22)%110;R(x+4+Math.sin((t+i*40)*0.04)*5,GROUND-70-k,6-k/30,4,'rgba(255,255,255,'+(0.75-k/150).toFixed(2)+')');}
    R(x+16,GROUND-12,14,12,'#9b5b3a');R(x+15,GROUND-14,16,2,'#e6b54a');
    if(Rg.arcs()&&night()&&G.f.steamDone&&!G.f.jangteoArcsMorak3){
      R(x-15,GROUND-8,12,7,'#6f8c68');R(x-11,GROUND-10,4,3,'#8ca883');R(x-10,GROUND-8,2,7,'#d8c9a6');
    }},
  /* 엿 수레 */
  yeotcart(n){const x=n.x-cam;R(x+14,GROUND-16,30,10,'#8a5a2b');R(x+14,GROUND-18,30,2,'#c9a06a');
    for(let i=0;i<5;i++)R(x+16+i*6,GROUND-22,4,4,i%2?'#e6b54a':'#d9a441');
    R(x+18,GROUND-6,6,6,'#4a3420');R(x+36,GROUND-6,6,6,'#4a3420');R(x+20,GROUND-4,2,2,'#8a6a4a');R(x+38,GROUND-4,2,2,'#8a6a4a');},
  /* 보부상 숙소 마루: 등불 하나 */
  maru(n){const x=n.x-cam;R(x-22,GROUND-10,44,4,'#8a5a2b');R(x-22,GROUND-11,44,1,'#c9a06a');R(x-20,GROUND-6,3,6,'#5a361e');R(x+17,GROUND-6,3,6,'#5a361e');
    R(x+10,GROUND-30,1,20,'#5a361e');R(x+7,GROUND-34,7,6,night()?'#ffb050':'#c9452a');if(night())R(x+5,GROUND-36,11,10,'rgba(255,180,80,.18)');},
};
})();

/* PA-43 · 확장 그림. 옛 장터 그림은 위에 남겨 ?classic=1에서 그대로 쓴다. */
(()=>{
if(CLASSIC)return;
const Rg=REGIONS.jangteo;
const n=()=>!!G?.f?.night;
const P=(x,y,w,h,c)=>R(Math.round(x),Math.round(y),Math.round(w),Math.round(h),c);
const tone=()=>Rg.springRevisit()?(n()?{sky:'#141c34',mist:'#343d5c',mount:'#253d38',snow:'#516b4a',wall:'#625358',wood:'#493a3b',tile:'#273346'}:
  {sky:'#dce8df',mist:'#bdcdb7',mount:'#99b09a',snow:'#8fa665',wall:'#b79272',wood:'#73503c',tile:'#4b5965'}):n()?{sky:'#141c34',mist:'#343d5c',mount:'#252f49',snow:'#c0cedb',wall:'#625358',wood:'#493a3b',tile:'#273346'}:
  {sky:'#dce8ef',mist:'#bbcdd9',mount:'#99b0c0',snow:'#f4f4ed',wall:'#b79272',wood:'#73503c',tile:'#4b5965'};
function steppedRidge(offset,base,amp,color,seed){
  for(let x=-2;x<W+2;x+=2){const u=x+offset,h=Math.round(base-Math.sin(u*.008+seed)*amp-Math.sin(u*.021+seed*2)*amp*.35);P(x,h,2,H-h,color);}
}
/* 결정 D-795: 하늘의 달과 해를 다시 그렸다 (사용자 피드백 2026-11-05 "3막 배경에 달 그림이 좀 이상하다. 제대로 다시 그려라").
   예전엔 네모 몇 개를 겹친 꼴이라 달은 꺾인 막대처럼, 낮의 해는 흰 십자처럼 보였다. 이제 줄마다 원의 폭을 재어 둥글게 칠한다.
   설을 앞둔 그믐 무렵이라 밤엔 왼쪽이 빛나는 가는 그믐달(어두운 쪽에 희미한 지구빛), 낮엔 엷은 겨울 해와 흐린 햇무리. */
function disc(cx,cy,r,color,cut=null){
  for(let dy=-r;dy<=r;dy++){
    const half=Math.sqrt(Math.max(0,r*r-dy*dy)),x0=Math.round(cx-half),x1=Math.round(cx+half);
    if(!cut){if(x1>x0)P(x0,cy+dy,x1-x0,1,color);continue;}
    // cut: 같은 반지름의 원을 오른쪽으로 밀어 겹치는 부분을 뺀다 (그믐달)
    const cHalf=Math.abs(dy)<r?Math.sqrt(r*r-dy*dy):0,c0=Math.round(cx+cut-cHalf);
    const end=Math.min(x1,c0);if(end>x0)P(x0,cy+dy,end-x0,1,color);
  }
}
function moon(cx,cy,r){
  disc(cx,cy,r+6,'rgba(245,232,190,.03)');disc(cx,cy,r+3,'rgba(245,232,190,.05)');disc(cx,cy,r+1,'rgba(245,232,190,.06)');   // 달무리
  disc(cx,cy,r,'#22304e');   // 어두운 쪽 지구빛
  disc(cx,cy,r,'#f5e8be',Math.round(r*0.62));
  disc(cx-1,cy,r-1,'#fff6d8',Math.round(r*0.78));   // 안쪽 밝은 테
  P(cx-r+2,cy-2,1,2,'#e2d3a4');P(cx-r+3,cy+3,1,1,'#e2d3a4');   // 엷은 얼룩
}
function winterSun(cx,cy,r){
  disc(cx,cy,r+7,'rgba(255,250,232,.18)');disc(cx,cy,r+3,'rgba(255,250,232,.32)');   // 흐린 햇무리
  disc(cx,cy,r,'#fbf6e2');disc(cx-1,cy-1,r-3,'#fffdf2');
}
function sky(offset=0){
  const t=tone();P(0,0,W,H,t.sky);
  const bands=n()?['#17213b','#1b2844','#24334e','#344259']:Rg.springRevisit()?['#dce8df','#e2eadb','#e9edda','#f1eee2']:['#dce8ef','#e2eaed','#e9edec','#f1eee2'];
  bands.forEach((c,i)=>P(0,35+i*30,W,31,c));
  if(n()){
    for(let i=0;i<61;i++){const x=((Math.round(hash(i*9.3)*1200-offset*.02)%W)+W)%W,y=8+Math.round(hash(i*3.7)*81);P(x,y,1,i%11===0?2:1,i%7?'#9eaec4':'#fff0c0');}
    moon(318,30,9);
  }else{
    winterSun(304,30,9);
    for(let i=0;i<4;i++){const x=((i*143-offset*.025)%550+550)%550-70;P(x,47+i%2*13,48,2,'#f2f5f3');P(x+12,44+i%2*13,24,3,'#f2f5f3');}
  }
}
function farAir(offset=0){
  // 지붕보다 먼 김과 골짜기 안개. 착지할 곳과는 겹치지 않는다.
  const shift=Math.round(offset*.14),fog=n()?'rgba(163,182,196,.10)':'rgba(246,247,232,.40)';
  for(let i=-1;i<5;i++){
    const x=i*151-shift%151,yy=115+(i+6)%3*7;
    P(x,yy,112,2,fog);P(x+21,yy-2,68,2,fog);
    for(let j=0;j<4;j++)P(x+64+Math.round(Math.sin(j+i)*5),139-j*8,5+j*3,5,n()?'rgba(154,174,194,.16)':'rgba(250,246,222,.44)');
  }
  if(!n())for(let i=0;i<5;i++){
    const x=((106+i*13-Math.round(offset*.055))%470+470)%470-30,y=69+Math.abs(i-2)*4;
    P(x-3,y,3,1,'#849398');P(x,y+1,2,1,'#849398');P(x+2,y,3,1,'#849398');
  }
}
function lantern(x,y,size=1,lit=n()){
  P(x,y-6,1,7,'#73503c');
  if(lit){P(x-6*size,y-2,13*size,13*size,'rgba(242,169,76,.08)');P(x-3*size,y,7*size,8*size,'#e6974b');P(x-2*size,y+1,5*size,6*size,'#ffcc79');P(x-1,y+2,2,4,'#ffe7ab');}
  else{P(x-3*size,y,7*size,8*size,'#b64e42');P(x-2*size,y+1,5*size,2*size,'#d97757');}
  P(x-2*size,y-1,5*size,1,'#65433b');P(x-2*size,y+8*size,5*size,1,'#65433b');P(x,y+9*size,1,3,'#b95743');
}
function drawWorkLantern(x,y,lit=false){
  // x,y는 상호작용 자리의 발밑. 불을 붙일 종이등은 손 닿는 높이에 건다.
  P(x+9,y-39,3,39,'#725743');P(x-5,y-40,17,3,'#90704f');P(x-6,y-37,1,6,'#bfa172');
  if(lit){P(x-17,y-33,26,28,'rgba(245,180,79,.12)');P(x-12,y-29,17,19,'rgba(255,202,116,.12)');}
  lantern(x-6,y-30,1.4,lit);
  if(!lit){P(x-8,y-27,5,6,'#716761');P(x-7,y-26,1,4,'#aaa18c');}
  else{P(x-8,y-26,4,1,'#fff4c6');P(x-7,y-25,2,4,'#fff4c6');}
  P(x+6,y-3,9,3,tone().snow);
}
function tileRoof(x,y,w,depth=15,snow=true){
  const t=tone();P(x+8,y-5,w-16,5,t.tile);P(x+2,y,w-4,depth,t.tile);P(x-4,y+depth-2,w+8,4,t.tile);
  for(let i=0;i<w;i+=7){P(x+i,y+2,2,depth-2,n()?'#38455a':'#687580');P(x+i,y+depth+2,5,1,n()?'#1d2a3d':'#384a55');}
  P(x-8,y+depth-5,8,3,t.tile);P(x+w,y+depth-5,8,3,t.tile);
  if(snow&&!Rg.springRevisit()){P(x+9,y-6,w-18,2,t.snow);P(x+2,y-1,9,2,t.snow);P(x+w-11,y-1,9,2,t.snow);P(x-6,y+depth-6,7,1,t.snow);P(x+w,y+depth-6,7,1,t.snow);}
}
function house(x,y,w=84,h=37,lit=n(),roofColor,variant=0){
  const t=tone();P(x,y,w,h,t.wall);P(x+4,y+3,w-8,3,t.wood);
  const count=variant%3===1?2:3;
  for(let j=0;j<count;j++){const wx=x+9+j*Math.floor((w-18)/count),hh=Math.min(17,h-14);P(wx,y+11,14,hh,lit?'#d69750':'#e5d8b8');P(wx+6,y+11,1,hh,t.wood);P(wx,y+18,14,1,t.wood);}
  P(x+1,y+5,3,h-5,t.wood);P(x+w-4,y+5,3,h-5,t.wood);P(x,y+h-3,w,3,t.wood);
  if(variant%3===2){
    // 낮은 초가지붕은 기와집 사이의 형태와 재료를 바꾼다.
    P(x+10,y-20,w-20,5,n()?'#776851':'#bd9c62');P(x-1,y-15,w+2,9,n()?'#75604b':'#c3a267');P(x-7,y-6,w+14,5,n()?'#5e5147':'#ac8a57');
    for(let j=4;j<w;j+=8)P(x+j,y-14,1,10,n()?'#8a775b':'#dbc187');
    P(x+11,y-21,w-22,2,t.snow);P(x-4,y-7,w+8,2,t.snow);
  }else tileRoof(x-5,y-15,w+10,variant%3===1?12:15);
  if(roofColor)P(x+10,y-19,w-20,2,roofColor);
  if(variant%2){P(x+w-15,y+h-12,10,9,n()?'#76604e':'#b28c60');P(x+w-16,y+h-13,12,2,t.wood);}
}
function smoke(x,y,seed=0){
  for(let j=0;j<7;j++){const xx=x+Math.round(Math.sin(j*.75+seed)*4),yy=y-j*6,alpha=(.65-j*.07).toFixed(2);P(xx,yy,4+j,4,n()?'rgba(143,158,177,'+alpha+')':'rgba(250,247,231,'+alpha+')');P(xx+2,yy-3,3+j,3,n()?'rgba(143,158,177,'+alpha+')':'rgba(250,247,231,'+alpha+')');}
}
function distantTown(offset,base=164,scale=1){
  const width=48*scale,start=Math.floor(offset/width)-2;
  for(let i=start;i<start+Math.ceil(W/width)+4;i++){
    const x=i*width-offset,y=base-Math.round(hash(i+51)*18*scale),w=(31+Math.floor(hash(i*7)*13))*scale,h=(15+Math.floor(hash(i*9)*10))*scale;
    P(x,y,w,h,n()?'#434656':'#a3978b');P(x-3*scale,y-4*scale,w+6*scale,5*scale,n()?'#293749':'#70808c');P(x+3*scale,y-5*scale,w-6*scale,1*scale,n()?'#7e95aa':'#ecf0eb');
    for(let k=0;k<3;k++)P(x+(5+k*10)*scale,y+6*scale,3*scale,4*scale,n()?'#efb46b':'#d6cbb4');
    if(i%4===0){P(x+8*scale,y-12*scale,2*scale,9*scale,n()?'#515365':'#928979');if(!n())smoke(x+8*scale,y-17*scale,i);}
    if(i%3===0){P(x+w-2*scale,y-13*scale,1*scale,14*scale,n()?'#7e5d55':'#8a6550');P(x+w,y-13*scale,8*scale,4*scale,n()?'#874740':'#b94d40');}
  }
}
function pine(x,y,h=86,foreground=false){
  const trunk=n()?'#2d343c':'#6c5141',leaf=n()?(foreground?'#112d32':'#24454b'):(foreground?'#34564d':'#4d6b61');
  const seed=Math.round(h),lean=(seed%3-1)*5;
  P(x-3,y-h+22,6,h-22,trunk);P(x+lean-3,y-h+15,6,Math.round(h*.49),trunk);P(x-8,y-10,16,10,trunk);
  for(let k=0;k<4;k++){
    const yy=y-h+k*Math.round(h*.16),ww=24+k*10+(seed+k*7)%15,cx=x+lean+(k%2?-8:7),left=cx-ww/2;
    P(left,yy,ww,7,leaf);P(left+5,yy-5,ww-11,6,leaf);P(left+11,yy-8,Math.max(8,ww-28),4,leaf);
    P(Math.min(x,cx),yy+7,Math.abs(cx-x)+4,3,trunk);P(left+3,yy-4,Math.round(ww*.42),2,tone().snow);P(left+ww-11,yy-1,8,2,tone().snow);
    P(left+1,yy+6,ww-2,2,n()?'#173a3e':'#37594f');
  }
}
/* 결정 D-310: 장터 어귀의 큰 깃발은 보부상단 깃발이다 (사용자 피드백 2026-11-02 "깃발을 더 의미 있는 그림으로").
   보부상단이 든 장에는 상단 깃발을 세워, 길 가던 보부상이 숙소(접장)를 찾아오게 한다. 상단의 표는 패랭이에 목화송이.
   주인공 모자 꼭지의 흰 송이와 같은 표라, 아이가 이 깃발을 보고 숙소부터 찾는 까닭이 선다.
   세로로 긴 흰 기폭에 쪽빛 테, 바깥 가장자리는 붉은 불꽃 이(화염각). 장대 꼭대기에는 꿩 깃 장목. 바람에 끝이 조금 흔들린다. */
function flag(x,y,h=64){
  const cloth=n()?'#b9b4a6':'#efe8d6',edge=n()?'#2f3f5c':'#3c5378',fire=n()?'#8a4745':'#c24e3e';
  const sway=Vfx.reducedMotion?0:Math.round(Math.sin(G.anim*.05)*1.2);
  P(x-1,y-h-6,5,4,'#3d2e26');P(x,y-h-11,3,6,'#58463a');   // 장목 받침
  P(x-2,y-h-16,2,7,'#6f5a3c');P(x+3,y-h-17,2,8,'#8a6f45');P(x+1,y-h-19,2,9,'#b08a50');   // 꿩 깃
  P(x,y-h,3,h,'#69503f');P(x+1,y-h,1,h,'#8a6a52');
  P(x+3,y-h+3,22,2,'#4d382f');   // 기폭을 거는 가로대
  const top=y-h+5,bw=19,bh=Math.round(h*.46);
  P(x+4,top,bw,bh,edge);P(x+6,top+2,bw-4,bh-4,cloth);
  for(let k=0;k<bh;k+=5)P(x+4+bw+(k%10?0:sway),top+k,3,3,fire);   // 바깥 불꽃 이
  P(x+4,top+bh,bw,2,fire);for(let k=0;k<bw;k+=5)P(x+4+k+sway,top+bh+2,3,2,fire);
  // 패랭이와 목화송이 (상단의 표)
  const cx=x+4+Math.floor(bw/2),cy=top+Math.round(bh*.42);
  P(cx-6,cy+2,13,2,'#2a211b');P(cx-3,cy-3,7,5,'#2a211b');P(cx-2,cy-2,5,3,n()?'#7d6a4a':'#c39b55');
  P(cx-8,cy-1,3,3,'#fbf7ee');P(cx+6,cy-1,3,3,'#fbf7ee');P(cx-7,cy,1,1,'#d9d2c0');P(cx+7,cy,1,1,'#d9d2c0');
  P(cx-1,cy+6,3,Math.max(2,bh-Math.round(bh*.42)-12),edge);   // 아래로 내린 쪽빛 줄
  P(x-6,y-4,16,4,'#807c78');P(x-7,y-5,18,2,tone().snow);P(x-4,y-8,10,4,'#6f6b66');
  /* 결정 D-778: 깃대 밑동을 두 쪽 나무판(지주)으로 감싸 짚 끈으로 묶었다. 높은 깃대가 바람에 흔들리지 않게 붙든다.
     가는 깃대(3px)보다 손바닥 자국(9px)이 넓어 자국이 깃대 밖으로 삐져나왔다. 아빠 도장은 이 판 앞면에 찍힌다 (사용자 피드백 2026-11-05)
     결정 D-861: 판과 도장을 작게 (사용자 피드백 2026-11-06 "깃대에 달린 나무판과 아빠 도장 좀 더 작게"). 판은 17×28에서 11×19로,
     도장은 작은 손바닥(mini, 5×4)으로 face 17에 찍는다 (field.js stamps의 mini) */
  const pl=n()?'#5e4a3a':'#8c6a4c',pf=n()?'#6e5844':'#a98258',pd=n()?'#3e3028':'#5e4534',rope=n()?'#8a7a52':'#d2b46a';
  P(x-4,y-27,11,19,pd);P(x-3,y-26,9,18,pl);P(x-2,y-26,7,17,pf);   // 판 둘레(어두운 테)와 앞면
  P(x-3,y-28,9,2,pd);P(x-3,y-29,9,1,tone().snow);   // 판 윗머리와 눈
  P(x+1,y-26,1,18,pd);   // 두 쪽 판이 맞닿은 금
  for(const yy of [y-26,y-12]){P(x-4,yy,11,2,rope);P(x-4,yy+2,11,1,n()?'#5e5236':'#a8883a');}   // 짚 끈 두 줄 (도장 자리를 비켜 묶었다)
  P(x-1,y-23,1,2,n()?'#7a6450':'#c49a6c');P(x+4,y-16,1,3,n()?'#7a6450':'#c49a6c');   // 나뭇결
}
/* 결정 D-311: 장터 어귀 집 사이에 되풀이되던 작은 붉은 깃발 대신, 장날 어귀에 실제로 놓였을 짐을 번갈아 둔다.
   지게에 얹은 짐, 장작더미, 옹기 독, 짚단. 길을 막지 않게 낮게 그린다. */
function marketProp(x,y,i){
  const t=tone(),k=((i%4)+4)%4;
  if(k===0){   // 받쳐 세운 지게와 짐
    P(x-1,y-30,2,30,t.wood);P(x+9,y-30,2,30,t.wood);P(x-1,y-12,12,2,t.wood);P(x-1,y-22,12,2,t.wood);P(x+4,y-6,2,6,'#5a4334');
    P(x-3,y-27,16,12,n()?'#6d6156':'#a98d6a');P(x-2,y-28,14,2,t.snow);P(x+4,y-27,2,12,'#d6be8c');
  }else if(k===1){   // 장작더미
    for(let r=0;r<3;r++)for(let c=0;c<4-r;c++){const xx=x-10+c*7+r*3,yy=y-6-r*6;P(xx,yy,6,6,n()?'#5d4a3c':'#8a6448');P(xx+2,yy+2,2,2,n()?'#7d6650':'#c79b6c');}
    P(x-11,y-19,24,2,t.snow);
  }else if(k===2){   // 옹기 독 셋
    for(const [dx,s] of [[-9,1],[2,1.3],[13,.9]]){const w=Math.round(9*s),h=Math.round(11*s);P(x+dx-w/2,y-h,w,h,n()?'#3e3330':'#6b4a34');P(x+dx-w/2+1,y-h+2,2,h-4,n()?'#5e4a40':'#9a6e4c');P(x+dx-w/2+1,y-h-2,w-2,2,'#4a3428');P(x+dx-w/2+1,y-h-3,w-2,1,t.snow);}
  }else{   // 세워 묶은 짚단
    for(let j=0;j<3;j++){const xx=x-8+j*8;P(xx,y-18,6,18,n()?'#8a7a52':'#d9b860');P(xx+1,y-18,1,18,n()?'#a8975f':'#ead27a');P(xx-1,y-10,8,2,'#8a6a3a');P(xx,y-20,6,2,t.snow);}
  }
}
/* 결정 D-560: 장승을 실제 마을 어귀 장승처럼 다시 그렸다 (사용자 피드백 2026-11-04 "장승들 좀 더 현실적인 이미지로").
   통나무를 그대로 세워 껍질 결과 갈라진 틈이 남고, 위쪽만 깎아 얼굴을 냈다. 부릅뜬 왕방울 눈, 주먹코, 드러난 이,
   몸통에는 세로로 먹 글씨(천하대장군·지하여장군) 자리가 있다. f=1 은 관모를 쓴 대장군, f=-1 은 관 없이 가르마를 탄 여장군.
   발치는 돌무더기로 받치고, 비바람에 바랜 붉은 칠이 눈자위와 입술에만 조금 남았다. */
/* 결정 D-661: hh 를 주면 그 키로 깎은 작은 장승이다 (장승 코의 눈: 짐꾼이 지나가며 코를 짚으려면 키가 아이만 해야 한다). 얼굴은 같은 크기, 몸통만 짧다 */
function jangseung(x,y,f,hh){
  const dk=n(),wood=dk?'#5e5246':'#8e7a62',shade=dk?'#463c34':'#6c5a46',lite=dk?'#76685a':'#b09a7c',crack=dk?'#2e2722':'#43372c';
  const red=dk?'#6e3a32':'#a4473a',ink=dk?'#1c1816':'#26201c',tooth=dk?'#b8b0a2':'#e8e0cc',snow=tone().snow;
  const male=f>0,h=hh||(male?66:60),top=y-h,w=12;
  // 발치 돌무더기
  P(x-11,y-5,22,5,dk?'#4a4744':'#7d7a74');P(x-9,y-8,9,4,dk?'#56524e':'#8f8b84');P(x+1,y-9,8,5,dk?'#514d49':'#88837c');P(x-8,y-6,4,1,dk?'#6a6560':'#a9a49b');P(x-12,y-1,24,1,snow);
  // 기둥: 통나무 몸통. 껍질 결(어두운 세로 줄)과 마른 틈
  P(x-w/2,top+14,w,h-18,wood);P(x-w/2,top+14,2,h-18,shade);P(x+w/2-2,top+14,2,h-18,lite);
  const l0=top+(h<40?21:32),lines=hh?Math.max(0,Math.min(5,Math.floor((y-12-l0)/6)+1)):5;
  for(let j=0;j<lines;j++)P(x-4+((j*5)%9),l0-2+j*6,1,4+(j%2)*3,crack);
  // 몸통 먹 글씨 자리 (한 줄 세로 글씨를 굵은 획 다섯으로)
  for(let j=0;j<lines;j++){const yy=l0+j*6;P(x-2,yy,4,1,ink);P(x-1,yy+1,1,3,ink);if(j%2)P(x+1,yy+2,2,1,ink);else P(x-3,yy+3,2,1,ink);}
  // 머리: 몸통보다 조금 넓게 깎은 얼굴
  P(x-7,top+2,14,16,wood);P(x-7,top+2,2,16,shade);P(x+5,top+2,2,16,lite);
  if(male){   // 관모: 위로 솟은 사모와 넓은 챙
    P(x-6,top-7,12,8,ink);P(x-5,top-6,10,1,'#3c3430');P(x-9,top,18,3,ink);P(x-9,top,18,1,'#3c3430');
    P(x-5,top-8,10,1,snow);P(x-9,top-1,4,1,snow);P(x+5,top-1,4,1,snow);
  }else{      // 여장군: 관 없이 가르마 탄 머리, 쪽진 뒤통수 둥근 끝
    P(x-7,top-2,14,6,ink);P(x,top-2,1,4,wood);P(x-8,top+1,2,4,ink);P(x+6,top+1,2,4,ink);
    P(x-6,top-3,12,1,snow);
  }
  // 왕방울 눈: 붉은 눈자위, 흰 눈알, 가운데 검은 점
  for(const s of [-1,1]){const ex=x+s*3-(s<0?3:0);P(ex,top+5,4,4,red);P(ex+1,top+6,2,2,tooth);P(ex+1,top+6,1,1,ink);}
  P(x-6,top+4,4,1,ink);P(x+2,top+4,4,1,ink);   // 부릅뜬 눈썹
  // 주먹코
  P(x-2,top+9,4,4,shade);P(x-3,top+12,6,2,lite);P(x-2,top+13,1,1,ink);P(x+1,top+13,1,1,ink);
  // 입: 여장군은 다문 입, 대장군은 이를 드러내고 웃는다
  if(male){P(x-5,top+15,10,3,ink);for(let j=0;j<4;j++)P(x-4+j*2+(j>1?1:0),top+15,1,2,tooth);P(x-5,top+18,10,1,red);
    for(let j=0;j<3;j++)P(x-4+j*3,top+19,1,3,crack);}   // 깎아 낸 수염 결
  else{P(x-4,top+15,8,2,red);P(x-3,top+16,6,1,ink);P(x-6,top+12,2,2,red);P(x+4,top+12,2,2,red);}   // 바랜 연지 볼
  P(x-6,top+18,12,1,shade);   // 턱 밑 깎인 자리
}
function stall(x,y,i){
  const t=tone(),red=i%3===0?'#ab4d43':i%3===1?'#d1bc8c':'#8d6a55';
  P(x,y-34,3,34,t.wood);P(x+69,y-34,3,34,t.wood);P(x-5,y-37,82,4,t.wood);
  if(n()){
    P(x-4,y-35,80,5,'#8b7668');P(x+5,y-29,61,19,'#4c4243');for(let j=0;j<7;j++)P(x+8+j*8,y-28,1,17,'#7c6960');P(x+9,y-11,53,2,'#ad8870');
  }else{
    P(x-6,y-49,84,11,red);P(x-10,y-39,92,5,red);P(x-8,y-49,88,2,t.snow);for(let j=0;j<8;j++)P(x-8+j*12,y-34,7,3,red);
    P(x+3,y-17,66,6,'#a37450');
    // 결정 D-312: 좌판마다 파는 것이 다르다 (포목·어물·옹기·곶감·짚신). 같은 좌판이 줄지어 되풀이되지 않게.
    const kind=((i%5)+5)%5;
    if(kind===0){for(let j=0;j<6;j++){const c=['#3c5378','#c24e3e','#e6d9b8','#6f8f6a','#b9914c','#8a5a7a'][(j+i)%6];P(x+6+j*10,y-27,8,10,c);P(x+6+j*10,y-27,8,1,'#f4ead0');P(x+9+j*10,y-27,1,10,'rgba(0,0,0,.18)');}}   // 포목: 세워 둔 피륙 두루마리
    else if(kind===1){P(x+4,y-33,64,1,'#5a4334');for(let j=0;j<7;j++){P(x+7+j*9,y-32,1,3,'#5a4334');P(x+5+j*9,y-29,5,12,'#b9a27a');P(x+6+j*9,y-27,3,1,'#7a6448');P(x+6+j*9,y-18,3,2,'#8a7458');}}   // 어물: 줄에 꿴 북어
    else if(kind===2){for(let j=0;j<5;j++){const h=8+(j%2)*4;P(x+6+j*13,y-17-h,10,h,'#6b4a34');P(x+7+j*13,y-15-h,2,h-4,'#9a6e4c');P(x+7+j*13,y-19-h,8,2,'#4a3428');}}   // 옹기
    else if(kind===3){P(x+4,y-33,64,1,'#5a4334');for(let j=0;j<4;j++)for(let k=0;k<3;k++)P(x+10+j*16,y-31+k*5,5,4,'#b4562a');P(x+20,y-23,22,6,'#8a6448');for(let j=0;j<5;j++)P(x+21+j*4,y-26,4,4,'#e0602a');}   // 곶감 꼬챙이와 감 바구니
    else{for(let j=0;j<6;j++){P(x+6+j*10,y-21,8,4,'#d9b860');P(x+7+j*10,y-20,6,1,'#a8883a');P(x+6+j*10,y-25,8,3,'#c9a850');}}   // 짚신 켤레
    // 손님은 좌판 뒤 작은 실루엣. 길을 가리는 물체로 그리지 않는다.
    P(x+28,y-34,11,15,'#647b79');P(x+30,y-41,8,7,'#92755e');P(x+29,y-44,3,4,'#92755e');P(x+36,y-44,3,4,'#92755e');
  }
  lantern(x+61,y-39,1);
}
/* 결정 D-314: 되풀이 배경(집·곳간·짐)을 줄인 뒤의 실제 좌표로 늘어놓는 자리. 랜드마크·높은 발판(busy)과 겹치면 건너뛰지 않고
   그 뒤 빈 자리로 밀어 둔다. 그래서 잘라 낸 자리에서 반쪽 집이 생기지 않고, 랜드마크 사이도 비지 않는다. */
function rowSlots(zw,start,step,widthOf,busy){
  const out=[];let rx=start;
  for(let i=0;rx<zw+120&&i<80;i++){
    const w=widthOf(i);let moved=true,guard=0;
    while(moved&&guard++<20){moved=false;for(const [a,b] of busy)if(rx<b&&rx+w>a){rx=b+12;moved=true;}}
    out.push({rx,i,w});rx=Math.max(rx+w+18,start+(i+1)*step);
  }
  return out;
}
function bundle(x,y,i=0){P(x-8,y-9,16,9,i%2?'#a17569':'#81928a');P(x-5,y-12,10,4,i%2?'#bd8b78':'#a3aea0');P(x-1,y-10,2,10,'#d6be8c');P(x-4,y-13,8,2,'#6c6654');}
function snowGround(id){
  if(Rg.springRevisit()){
    P(0,GROUND,W,H-GROUND,n()?'#4b5145':'#7d7d5e');P(0,GROUND,W,3,n()?'#516b4a':'#8fa665');
    for(let x=-16;x<W+16;x+=16){const wx=x+Math.round(cam/16)*16;if(hash(wx+19)>.45)P(x-cam%16,GROUND-2,2,3,n()?'#516b4a':'#79945d');}
    return;
  }
  const t=tone();P(0,GROUND,W,H-GROUND,id==='pine'?(n()?'#51606b':'#a2ada9'):(n()?'#625f65':'#afa89b'));P(0,GROUND,W,3,t.snow);
  for(let x=-16;x<W+16;x+=16){const wx=x+Math.round(cam/16)*16;P(x-cam%16,198+Math.floor(hash(wx+19)*18),4+Math.floor(hash(wx)*8),1,n()?'#9ba9b8':'#d8ddd9');}
  // 반복 발자국으로 본길과 생활 흔적을 잇는다.
  for(let wx=Math.floor(cam/36)*36;wx<cam+W+36;wx+=36){P(wx-cam,195,3,1,n()?'#8693a0':'#b3b7ad');P(wx-cam+8,197,3,1,n()?'#8693a0':'#b3b7ad');}
}
/* 결정 D-971: 솔숲의 배경 소나무가 흔들 소나무·다람쥐 몫·살펴보기·길손과 겹쳐 무엇을 만질 수 있는지 안 보였다 (사용자 피드백 2026-11-06 29).
   그 자리 둘레에는 배경 소나무를 세우지 않는다. 자리 목록은 지금 구역의 것을 그릴 때마다 읽는다(진행에 따라 길손 자리가 바뀐다). */
function busySpots(){
  const z=typeof zoneDef==='function'?zoneDef():null,xs=[];if(!z)return xs;
  try{for(const d of fieldItems('digs'))xs.push(d.x);}catch(_){}
  for(const k of ['examines','stamps','doors','vistas'])for(const p of (z[k]||[]))xs.push(p.x);
  try{for(const w of z.wanderers||[])xs.push(w.x);}catch(_){}
  return xs;
}
const nearBusy=(wx,r,xs)=>xs.some(x=>Math.abs(x-wx)<r);
function drawBack(id){
  sky(RC());steppedRidge(Math.round(RC()*.08),116,22,tone().mount,1);steppedRidge(Math.round(RC()*.19),137,15,n()?'#34445a':'#b2c1c9',4);
  farAir(RC());
  distantTown(Math.round(RC()*.32),173,1);
  if(id==='pine'){const busy=busySpots();for(let wx=Math.floor(cam/112)*112-112;wx<cam+W+112;wx+=112)if(!nearBusy(wx,30,busy))pine(wx-cam,GROUND,62+Math.round(hash(wx)*25));}
  snowGround(id);
}
function drawPlatforms(id){
  for(const p of fieldPlatforms()){
    const x=p.x-RC();if(x>W+10||x+p.w<-10)continue;   // 발판은 이미 옮긴 좌표 (D-128)
    /* 결정 D-313: 높은 발판이 공중에 뜬 판자로 보이지 않게, 밑을 땅까지 채운다 (사용자 피드백 "배경 완성 안 된 거").
       장터·숙소의 높은 처마(y<130)는 그 밑에 이층 곳간 몸채를, 창고 마당의 발판은 쌓은 짐짝을, 솔숲은 바위 더미를 그린다. */
    if(id==='street'||id==='inn'||id==='entrance'){
      const t=tone();
      if(p.y<130){
        const top=p.y+6;P(x+3,top,p.w-6,GROUND-top,t.wall);P(x+3,top,p.w-6,3,t.wood);
        P(x+3,top,3,GROUND-top,t.wood);P(x+p.w-6,top,3,GROUND-top,t.wood);P(x+3,GROUND-4,p.w-6,4,t.wood);
        const mid=Math.round((top+GROUND)/2);P(x+3,mid,p.w-6,3,t.wood);
        for(let j=14;j<p.w-16;j+=30){P(x+j,top+9,12,Math.min(14,mid-top-12),n()?'#d69750':'#e5d8b8');P(x+j+6,top+9,1,Math.min(14,mid-top-12),t.wood);}
        P(x+Math.round(p.w/2)-8,GROUND-26,16,22,n()?'#3a2c26':'#5a3e2c');P(x+Math.round(p.w/2),GROUND-26,1,22,t.wood);   // 곳간 문
      }
      P(x,p.y,p.w,6,t.wood);P(x,p.y-1,p.w,2,t.snow);for(let j=5;j<p.w;j+=10)P(x+j,p.y+2,1,4,n()?'#827475':'#c3a079');
      if(p.y<130){P(x-3,p.y-5,p.w+6,4,t.tile);P(x,p.y-6,p.w,2,t.snow);}
      else{P(x+4,p.y+6,3,GROUND-p.y-6,t.wood);P(x+p.w-7,p.y+6,3,GROUND-p.y-6,t.wood);Rg.drawIcicles?.(p,x);}   // 결정 D-864: 낮은 처마 끝 고드름 (field.js)
    }else if(id==='warehouse'){
      const top=p.y+5;
      for(let yy=top,r=0;yy<GROUND;yy+=13,r++){const off=r%2?6:0;for(let xx=x+2+off;xx<x+p.w-8;xx+=20){const w=Math.min(18,x+p.w-2-xx),h=Math.min(12,GROUND-yy);P(xx,yy,w,h,r%2?(n()?'#5d4a3c':'#8a6448'):(n()?'#6b5a48':'#a17a52'));P(xx+1,yy+1,w-2,1,n()?'#86705a':'#c79b6c');P(xx+Math.round(w/2),yy,1,h,n()?'#3d3028':'#6b4c36');}}
      P(x,p.y,p.w,5,n()?'#6b5a48':'#9b7a58');P(x,p.y-2,p.w,3,tone().snow);
    }else{
      if(id==='pine'){const top=p.y+10;P(x+5,top,p.w-10,GROUND-top,n()?'#46525c':'#8a9490');P(x+2,Math.round((top+GROUND)/2),p.w-4,GROUND-Math.round((top+GROUND)/2),n()?'#3e4a54':'#7f8a86');
        for(let yy=top+8;yy<GROUND-6;yy+=14)P(x+8+((yy*7)%Math.max(8,p.w-20)),yy,6,1,n()?'#2f3a44':'#6c7672');P(x+6,top,2,GROUND-top,n()?'#5d6973':'#a3aca7');}
      P(x,p.y,p.w,7,n()?'#5d6670':'#9a9c96');P(x+3,p.y+7,p.w-6,5,n()?'#424d57':'#7f847f');P(x,p.y-2,p.w,3,tone().snow);P(x+4,p.y+2,Math.max(3,p.w-11),1,n()?'#75838b':'#b5b9ad');
    }
  }
}
function drawScenery(id){
  const t=tone();
  if(id==='entrance'){
    // 결정 D-314: 되풀이 집은 줄인 뒤의 실제 좌표로 늘어놓는다. 설계 좌표로 그리면 잘라 낸 자리(trimCuts)에서 집이 반쪽으로 잘려 보였다.
    const zw=zoneDef().w,busy=[[95,275],[550,630],[Rg.snowJangseungX()-35,Rg.snowJangseungX()+35],...fieldPlatforms().map(p=>[p.x-14,p.x+p.w+14])];
    for(const {rx,i,w} of rowSlots(zw,150,150,i=>i%2?58:72+(i%3)*11,busy)){const x=rx-RC();if(x<-110||x>W+110)continue;
      if(i%2===0){const h=32+(i%4)*5;house(x,GROUND-h,w,h,n(),undefined,i/2);}else{bundle(x+6,GROUND,rx);marketProp(x+38,GROUND,i>>1);}}
    // 결정 D-776: 어귀 장승 둘은 길 양옆에서 입구를 지키게 가까이 붙여 세운다 (예전 125·242, 사용자 피드백 2026-11-05 "너무 떨어져 있다")
    jangseung(tx(150)-cam,GROUND,1);jangseung(tx(206)-cam,GROUND,-1);flag(tx(720)-cam,GROUND,96);
    // 결정 D-320: 연과 연줄은 얼레 그림(wanderer 'kite')이 얼레 손에서부터 함께 그린다.
  }else if(id==='street'){
    // 결정 D-315: 떡집 자리(1220~1560)와 뒷산 돌계단 자리(2140~2300)에는 좌판을 세우지 않는다 (예전엔 떡집 밑·골목 문 뒤에 좌판이 겹쳤다).
    for(let wx=170,i=0;wx<2800;wx+=185,i++){const x=wx-cam;if(x<-110||x>W+110)continue;if((wx+80>1220&&wx<1560)||(wx+80>2140&&wx<2300))continue;stall(x,GROUND,i);if(i%2===0){P(x+100,GROUND-31,4,31,t.wood);lantern(x+102,GROUND-32);}}
    /* 결정 D-315: 떡집은 땅 위의 가겟집이다. 앞을 터 둔 가게라 안(아궁이·시루·떡 시렁·맷돌)이 길에서 보이고, 모락은 그 안 땅에 선다.
       예전엔 떡집 안을 기둥 위 높은 마루의 단면으로 그려, 문을 열면 공중의 가게로 순간이동했다. 굴뚝은 오른쪽 지붕 위로 솟아 장터 어디서나 김이 보인다. */
    const x=1250-cam,g=GROUND;
    P(x,g-80,280,80,n()?'#7d624c':'#b8946a');P(x+8,g-72,264,68,n()?'#b8996e':'#e2c79b');P(x+8,g-72,264,3,'#8d6850');
    tileRoof(x-6,g-96,292,16);P(x+1,g-82,5,82,t.wood);P(x+274,g-82,5,82,t.wood);P(x+92,g-78,3,78,t.wood);P(x+184,g-78,3,78,t.wood);
    P(x,g-4,280,4,'#865c40');P(x+2,g-5,276,1,'#d4ae75');
    P(x+105,g-92,70,11,'#5a361e');P(x+108,g-90,64,7,'#d8c39e');for(let j=0;j<4;j++)P(x+116+j*14,g-89,5,5,'#5a361e');   // 떡집 현판
    P(x+238,g-128,10,36,n()?'#625253':'#907565');P(x+236,g-131,14,4,'#655451');smoke(x+241,g-135,2);   // 굴뚝
    // 아궁이, 가마솥, 그 위의 시루
    P(x+200,g-30,46,30,'#8c6651');P(x+204,g-26,38,4,'#b79b78');P(x+213,g-15,19,11,'#4b3a34');P(x+217,g-12,11,8,'#ecaa58');P(x+219,g-10,6,4,'#ffe0a0');
    P(x+206,g-38,34,9,'#4a4440');P(x+204,g-39,38,2,'#6b6460');P(x+210,g-54,26,16,'#a0623e');P(x+211,g-53,2,14,'#c27a4e');for(let j=0;j<4;j++)P(x+214+j*6,g-48,2,2,'#6b3a22');
    if(!n()||G.f.steamDone)for(let j=0;j<5;j++){const k=(G.anim*0.5+j*14)%60;P(x+216+Math.round(Math.sin((G.anim+j*30)*0.05)*3),g-58-k,5-k/20,3,'rgba(255,255,255,'+(0.7-k/90).toFixed(2)+')');}
    // 떡 시렁
    for(let j=0;j<3;j++){P(x+112,g-62+j*14,70,3,'#a97a51');P(x+112,g-63+j*14,70,1,'#d2aa70');for(let k=0;k<5;k++)P(x+116+k*13,g-68+j*14,9,5,['#f3eee1','#e8c97a','#9b594d','#6f8f6a','#f3eee1'][(k+j)%5]);}
    // 맷돌과 창호
    P(x+28,g-18,29,14,'#817b71');P(x+23,g-21,39,5,'#a39e8d');P(x+26,g-23,33,3,'#b9b4a0');P(x+41,g-29,3,7,'#6b5848');
    P(x+35,g-66,22,22,n()?'#e9c77f':'#efe2bb');P(x+45,g-66,2,22,'#927552');P(x+35,g-56,22,2,'#927552');
    // 밤에는 앞을 반쯤 판자로 막고, 오른쪽 아궁이 쪽만 불빛이 새어 나온다 (길은 열려 있다)
    if(n()){for(let j=0;j<9;j++)P(x+8+j*10,g-72,9,68,j%2?'#5a4638':'#66503f');P(x+8,g-40,90,2,'#3a2c26');P(x+190,g-70,80,60,'rgba(255,190,110,.12)');}
    lantern(x+12,g-76);lantern(x+266,g-76);
    // 떡집 앞 낮은 떡 좌판 (밤엔 보자기로 덮는다)
    const fx=1165-cam;P(fx,g-20,34,4,t.wood);P(fx+2,g-16,3,16,t.wood);P(fx+29,g-16,3,16,t.wood);
    if(n())P(fx,g-26,34,6,'#6f8c68');else for(let k=0;k<4;k++)P(fx+2+k*8,g-25,6,5,['#f3eee1','#e8c97a','#9b594d','#f3eee1'][k]);
    /* 결정 D-319: 거리 끝 뒷산으로 오르는 돌계단. 가게 줄이 끊긴 자리에 언덕이 있고, 돌계단이 솔숲으로 올라간다.
       '굴뚝 뒤'라 부르던 엉뚱한 이름 대신 길에서 그대로 보이는 고샅 돌계단이다. */
    const sx=2150-cam;
    if(sx>-180&&sx<W+40){
      for(let k=0;k<70;k++){const hy=Math.round(Math.min(64,k*1.1));P(sx+k*2,g-hy,2,hy,n()?'#3e4a4e':'#8e9a94');P(sx+k*2,g-hy-1,2,2,t.snow);}
      P(sx+140,g-64,30,64,n()?'#3e4a4e':'#8e9a94');P(sx+140,g-65,30,2,t.snow);
      for(let k=0;k<9;k++){const xx=sx+18+k*14,yy=g-6-k*6.5;P(xx,yy,13,4,n()?'#77736c':'#c2bcae');P(xx,yy+4,13,2,n()?'#4e4b47':'#8d877b');P(xx+1,yy-1,11,1,t.snow);}
      pine(sx+120,g-60,58);pine(sx+160,g-62,66);pine(sx+70,g-40,44);
      P(sx+6,g-30,3,30,t.wood);P(sx+1,g-32,13,6,'#ead4a6');P(sx+3,g-30,9,1,'#784b36');   // 이정 말뚝
    }
  }else if(id==='inn'){   // tx: 줄인 숙소 좌표 (D-116)
    {// 결정 D-314: 되풀이 집은 줄인 뒤의 실제 좌표로 (잘라 낸 자리에서 집이 반쪽으로 잘리지 않게). 숙소 몸채·누마루·높은 발판 자리는 비운다.
      const zw=zoneDef().w,busy=[[580,1420],[1690,1940],[1990,2130],...fieldPlatforms().map(p=>[p.x-14,p.x+p.w+14])];
      for(const {rx,i,w} of rowSlots(zw,100,165,i=>96+i%4*8,busy)){const x=rx-RC();if(x<-110||x>W+110)continue;
        const h=34+i%3*7;house(x,GROUND-h,w-20,h,n(),undefined,i);bundle(x+w-6,GROUND,rx);}}
    const x=760-cam;house(x,GROUND-69,460,69);tileRoof(x-9,GROUND-93,478,23);P(x+39,GROUND-77,382,4,t.wood);
    for(let j=0;j<7;j++){P(x+22+j*65,GROUND-67,5,67,t.wood);P(x+22+j*65,GROUND-65,2,63,n()?'#96715c':'#d2ac7c');}
    P(x+93,GROUND-8,278,8,'#82604c');P(x+93,GROUND-10,278,2,'#ba9470');for(let j=0;j<8;j++)P(x+99+j*34,GROUND-7,1,6,'#4e3a35');
    P(x+186,GROUND-109,90,15,'#65473c');P(x+190,GROUND-106,82,9,'#d8c39e');
    lantern(x+54,GROUND-62);lantern(x+411,GROUND-62);
    for(let j=0;j<9;j++){const ix=x+28+j*49;P(ix,GROUND-72,2,6+j%4*3,'#b5d4df');P(ix,GROUND-72,1,4+j%4*3,'#eff7f0');}
    // 마루 아래 물동이와 빗자루는 그믐 밤 창고 소품의 짝이다.
    P(x+435,GROUND-15,17,15,'#786b60');P(x+434,GROUND-17,19,3,'#aaa295');P(x+438,GROUND-18,11,2,t.snow);
    const pillar=1280-cam;P(pillar-4,89,8,103,t.wood);P(pillar-2,89,2,101,n()?'#987452':'#c4986d');P(pillar-5,86,10,3,t.snow);P(pillar-3,116,6,7,n()?'#a99374':'#d4bb8f');
    const vx=1770-cam;P(vx-8,44,196,7,t.wood);tileRoof(vx-13,27,206,17);P(vx+1,51,5,77,t.wood);P(vx+174,51,5,77,t.wood);P(vx-2,128,184,8,'#8d6b51');P(vx-2,126,184,2,'#cbb28c');
    for(let j=0;j<7;j++){const xx=vx+9+j*25;P(xx,49,2,6+j%3*4,'#b6d0dd');P(xx,49,1,4+j%3*4,'#f1f6ed');}lantern(vx+170,62);
  }else if(id==='pine'){
    const busy=busySpots();   // 결정 D-971
    for(let wx=120;wx<2800;wx+=145){const x=wx-cam;if(x<-80||x>W+80)continue;if(nearBusy(wx,40,busy))continue;pine(x,GROUND,72+Math.round(hash(wx)*32));if(wx%2===0)bundle(x+39,GROUND,wx);}
    const x=2410-cam;P(x-20,96,340,96,n()?'#53616f':'#929eaa');P(x-25,102,345,90,n()?'#53616f':'#929eaa');P(x-19,94,339,3,t.snow);P(x-11,109,4,57,n()?'#3a4b5d':'#798d9a');
    for(let j=0;j<5;j++)P(x+21+j*3,118+j*3,2,1,'#817a73');P(x-4,91,9,3,'#9b8770');
  }else if(id==='warehouse'){
    // 결정 D-314: 되풀이 곳간도 줄인 뒤의 실제 좌표로. 창고 큰 문과 짐짝 발판 자리는 비운다.
    const zw=zoneDef().w,sxr=trimX(2320,REG.trimCuts?.warehouse),busy=[[sxr-90,sxr+90],...fieldPlatforms().map(p=>[p.x-14,p.x+p.w+14])];
    for(const {rx,i,w:ww} of rowSlots(zw,120,190,i=>95+i%3*9+30,busy)){const x=rx-RC();if(x<-130||x>W+130)continue;const w=ww-30,h=42+i%3*7;house(x,GROUND-h,w,h,false,undefined,i);P(x+12,GROUND-36,w-24,33,n()?'#51464a':'#8c6c51');for(let j=0;j<(w-24)/11;j++)P(x+15+j*11,GROUND-34,1,29,t.wood);bundle(x+w+16,GROUND,i);}
    const x=tx(2320)-cam;house(x-64,GROUND-60,128,60,false);P(x-22,GROUND-42,44,42,'#2c2c35');P(x-1,GROUND-42,2,42,'#776154');P(x-8,GROUND-24,16,3,'#b19c73');
    if(n()&&!G.boss.dead){P(x-18,GROUND-29,3,3,'#89cbd3');P(x+13,GROUND-36,4,4,'#acdce0');P(x-16,GROUND-25,1,2,'#d7e7d7');}
    if(G.boss.dead){bundle(x-44,GROUND,1);bundle(x+43,GROUND,0);P(x+48,GROUND-19,1,15,'#bfa172');P(x+45,GROUND-7,7,5,'#ad8b54');}
  }
  drawPlatforms(id);
  // 조사 글의 대상은 실제 생활 물건으로도 알아볼 수 있게 둔다.
  if(id==='entrance'){
    const x=tx(240)-cam;P(x-6,GROUND-14,12,8,'#ac8b62');P(x-2,GROUND-18,4,8,'#d1b184');P(x-7,GROUND-15,6,3,'#ccbe95');P(x+1,GROUND-18,6,3,'#ccbe95');
    // 결정 D-314: 눈 장승은 잘라 낸 구간 안(설계 1680)에 있어 그림만 사라지고 조사 자리만 남았었다. 조사 자리(줄인 뒤 좌표)에 그린다.
    // 결정 D-560: 눈 쌓인 장승도 진짜 장승 위에 눈을 얹는다. 짐꾼들이 짚고 지나가는 코끝만 맨나무가 드러난다.
    // 결정 D-661: 이 장승은 아이 키만 한 작은 장승이다. 짐꾼이 지나가며 손을 뻗지 않고도 코를 짚는다 (사용자 피드백 2026-11-05)
    if(!Rg.springRevisit()){const sx=Rg.snowJangseungX()-RC(),top=GROUND-Rg.SNOW_JANGSEUNG_H;jangseung(sx,GROUND,1,Rg.SNOW_JANGSEUNG_H);
      P(sx-9,top-1,18,3,t.snow);P(sx-6,top-8,12,2,t.snow);P(sx-7,top+2,4,1,t.snow);P(sx+3,top+2,4,1,t.snow);P(sx-7,top+14,3,2,t.snow);P(sx+4,top+14,3,2,t.snow);
      P(sx-6,top+18,12,2,t.snow);P(sx-5,top+24,3,1,t.snow);}
  }else if(id==='street'){
    // 결정 D-561·D-783: 조사 '좌판 사이 골목'의 콩알 (사용자 피드백 2026-11-05 "외계인 같다. 더 동그랗게, 굴러다니지 말고 기둥 밑에 몇 알 정체되어 있게").
    // 둘째 좌판 왼쪽 기둥(설계 355) 밑에 동그란 콩알 여덟이 소복이 모여 있다. 굴러가지 않는다. 검은 배꼽(눈처럼 보였다)은 뺐다.
    // 밤에 도둑이 기둥에 기대 둔 콩 자루에서 샌 것이다(눈도깨비를 물리친 뒤엔 치워져 없다).
    if(!G.boss.dead){const px=355-cam;
      if(px>-60&&px<W+60){
        const bean=(bx,by)=>{const lit=n()?'#9a8a5c':'#e2c983',mid=n()?'#7d6f4a':'#cdb06a',dk=n()?'#5a5036':'#9c8248',hi=n()?'#b4a476':'#f6e8b8';
          P(bx+1,by,3,1,mid);P(bx,by+1,5,2,lit);P(bx+1,by+3,3,1,dk);P(bx,by+2,1,1,mid);P(bx+4,by+1,1,2,mid);P(bx+1,by+1,1,1,hi);};
        P(px-19,GROUND-1,19,1,n()?'#3e3a36':'#b6ada0');   // 콩이 깔린 자리의 옅은 그늘
        for(const [dx,dy] of [[-18,-4],[-14,-4],[-10,-4],[-6,-4],[-13,-7],[-9,-7],[-5,-7],[-7,-10]])bean(px+dx,GROUND+dy);   // 기둥 쪽으로 쌓였다
        bean(px-25,GROUND-4);   // 조금 떨어진 한 알
      }}
    // 결정 D-785: 조사 '쌀가루 묻은 발판'은 떡집 아궁이 앞(설계 1446~1500)에 깐 나무 발판이다. 쌀가루가 하얗게 앉고 곰 발자국이 찍혔다.
    // 예전엔 떡 좌판 앞(1150)에 쌀가루 자루 같은 것이 놓여 글과 그림이 맞지 않았다
    {const x=1446-cam;P(x,GROUND-3,54,3,'#7a5032');P(x+1,GROUND-3,52,1,'#a97a51');
      for(const [dx,ww] of [[3,12],[19,15],[38,13]])P(x+dx,GROUND-4,ww,2,n()?'#c9c2b4':'#efe8da');
      for(const dx of [8,24,44])P(x+dx,GROUND-4,3,1,n()?'#8f8574':'#a8987a');}
    // 결정 D-318: 장국밥 가마솥 (조사 '장국밥 가마솥')
    const gx=2470-cam;P(gx-16,GROUND-14,32,14,'#6b5848');P(gx-13,GROUND-11,26,8,'#4b3a34');if(!n())P(gx-8,GROUND-8,16,5,'#e08a3a');
    P(gx-14,GROUND-24,28,10,'#3e3834');P(gx-16,GROUND-25,32,2,'#5e5652');P(gx-6,GROUND-28,12,3,'#3e3834');
    if(!n())for(let j=0;j<4;j++){const k=(G.anim*0.5+j*15)%50;P(gx-4+Math.round(Math.sin((G.anim+j*25)*0.05)*3),GROUND-32-k,5,3,'rgba(255,255,255,'+(0.6-k/90).toFixed(2)+')');}
    P(gx+20,GROUND-12,14,3,t.wood);P(gx+22,GROUND-9,2,9,t.wood);P(gx+30,GROUND-9,2,9,t.wood);for(let j=0;j<3;j++)P(gx+21+j*4,GROUND-15,3,3,'#efe6cf');   // 국밥 그릇
    const yx=2130-cam;P(yx-16,GROUND-10,32,9,'#7d624b');P(yx-14,GROUND-12,28,2,'#cbb184');for(let j=0;j<4;j++)P(yx-10+j*6,GROUND-16+j%2,4,3,'#dfc898');
  }else if(id==='inn'){
    // 결정 D-318: 숙소 오른쪽 창고 쪽문 곁 마구간과 나귀 (조사 '마구간 나귀'). 설계 2060~2160, 잘라 낸 구간(2190~) 앞이다.
    {const sx=2110-cam;P(sx-50,GROUND-44,100,4,t.wood);tileRoof(sx-54,GROUND-58,108,12);P(sx-50,GROUND-40,3,40,t.wood);P(sx+47,GROUND-40,3,40,t.wood);
      P(sx-46,GROUND-38,92,34,n()?'#4a3e38':'#8f735a');P(sx-46,GROUND-8,92,8,n()?'#6b5a40':'#c9a850');
      const nx=sx-8,sl=!Vfx.reducedMotion&&!n()?Math.round(Math.sin(G.anim*.06)):0;   // 나귀: 여물을 씹으며 고개를 까딱인다
      P(nx-12,GROUND-22,24,11,'#7d746c');P(nx-12,GROUND-11,3,11,'#5e5650');P(nx+9,GROUND-11,3,11,'#5e5650');P(nx-6,GROUND-11,3,11,'#5e5650');P(nx+3,GROUND-11,3,11,'#5e5650');
      P(nx+10,GROUND-30+sl,7,10,'#7d746c');P(nx+15,GROUND-24+sl,5,5,'#b9b0a6');P(nx+11,GROUND-37+sl,2,8,'#5e5650');P(nx+14,GROUND-36+sl,2,7,'#5e5650');P(nx+15,GROUND-28+sl,1,1,'#1a1410');
      P(nx-14,GROUND-21,3,8,'#5e5650');P(nx-10,GROUND-25,14,3,'#a8432f');P(nx-9,GROUND-27,6,2,'#c9a06a');   // 꼬리와 길마
      P(sx+20,GROUND-14,22,10,'#6b4c36');P(sx+21,GROUND-16,20,3,n()?'#8a7a52':'#d9b860');}   // 여물통
    // 결정 D-791: 마루 아래 신발 그림은 뺐다. 그 자리의 숙소 아궁이는 field.js j_inn_fire가 그린다
  }else if(id==='pine'){
    // 결정 D-319: 솔숲 왼쪽 끝은 장터에서 올라온 돌계단의 꼭대기다. 계단이 왼쪽 아래 장터 지붕 쪽으로 내려간다.
    {const sx=-cam,dark=n()?'#2f3a44':'#6c7672',stone=n()?'#77736c':'#c2bcae',riser=n()?'#4e4b47':'#8d877b';
      // 언덕 마루 바로 앞(왼쪽 끝)에서 돌계단이 아래로 내려간다. 걷는 자리는 덮지 않는다.
      for(let k=0;k<5;k++){const xx=sx+50-k*11,yy=GROUND+3+k*5;P(xx-11,yy,12,H-yy,riser);P(xx-11,yy,12,2,stone);P(xx-10,yy-1,10,1,t.snow);}
      P(sx+52,GROUND+2,3,H-GROUND-2,dark);P(sx+52,GROUND+1,3,1,t.snow);
      pine(sx+96,GROUND,58);}
    const x=1870-cam;for(let j=0;j<7;j++){P(x-12+j*4,GROUND-2-j%2,4,1,'#9b8357');P(x-10+j*4,GROUND-3,1,3,'#78684c');}
    const sx=2280-cam;P(sx-3,122,6,5,'#b9aa89');P(sx-5,124,10,2,'#786e58');
  }else if(id==='warehouse'){
    // 결정 D-318: 짐꾼 화톳불 자리 (조사 '짐꾼 화톳불 자리'). 설계 1780은 줄인 뒤 880, 짐짝 더미와 창고 큰 문 사이 빈 마당
    // 결정 D-1304: 화톳불 돌 테와 불은 쉼터(engine/rest.js)가 그린다. 여기는 짐꾼이 걸터앉던 짐짝만
    {const fx=1780-cam;P(fx+19,GROUND-12,10,10,'#8a6448');P(fx+20,GROUND-13,8,2,'#a17a52');}
    const x=tx(400)-cam;for(let j=0;j<3;j++){P(x-9+j*5,GROUND-8,3,7,'#aa8c59');P(x-10+j*5,GROUND-10,6,2,'#ccb17b');}P(x-10,GROUND-2,17,2,'#7e6846');
    const mx=tx(2470)-cam;P(mx-17,121,34,7,'#ac9667');P(mx-17,120,34,2,'#d4be86');for(let j=0;j<8;j++)P(mx-15+j*4,122,1,5,'#816e4e');P(mx-12,117,24,3,'#c4aa73');
  }
}
function drawFront(id){
  // 눈 입자는 Vfx에 맡긴다. 전경은 가장자리에 두어 착지할 곳을 가리지 않는다.
  if(id==='pine'){const x=2540-cam;if(x>-100&&x<W+100)pine(x,H+12,122,true);}
}
function townVista(midCam,t,inn=false){
  const offset=midCam;
  // 등불의 강은 가게를 잇는 굽은 골목이다. 낮에는 다져진 눈길로 보인다.
  for(let y=133;y<H;y+=3){const cx=230+Math.round(Math.sin((y-125)*.047)*75)-offset%39,width=6+Math.floor((y-133)*.18);P(cx-width,y,width*2,3,n()?'#735440':'#ddd8c9');
    if(n()){P(cx-width+1,y,2,2,'#d49a58');P(cx+width-3,y,2,2,'#efbd76');}}
  for(let row=0;row<4;row++){
    const step=47+row*9,off=Math.round(offset*(.45+row*.16)),base=142+row*22;
    for(let i=Math.floor(off/step)-2;i<Math.floor(off/step)+W/step+4;i++){
      const seed=i*17+row*47,shape=Math.floor(hash(seed+9)*4);
      const x=i*step-off+Math.round(hash(i+row*31)*12),y=base-Math.round(hash(i*5+row*17)*11),
        w=23+row*5+Math.floor(hash(seed+3)*13),h=10+row*3+Math.floor(hash(seed+7)*8);
      const lane=230+Math.round(Math.sin((y-125)*.047)*75)-offset%39;
      if(Math.abs(x+w/2-lane)<16+row*4)continue;
      P(x,y,w,h,n()?(row%2?'#51515d':'#5d5156'):(row%2?'#b3a18a':'#b8a38b'));
      P(x-3,y-4,w+6,5,n()?'#26384c':'#647987');P(x+1,y-6,w-2,2,n()?'#97acbd':'#faf7ed');
      P(x-5,y-2,5,1,n()?'#8fa5b6':'#f3f5ef');P(x+w,y-2,5,1,n()?'#8fa5b6':'#f3f5ef');
      if(shape===0){
        // 낮고 둥근 초가. 기와 지붕 사이에 지붕 선과 색을 달리 둔다.
        P(x-2,y-7,w+4,4,n()?'#766955':'#b7a879');P(x+3,y-10,w-6,3,n()?'#92836a':'#d4c9a5');
        P(x+1,y-8,w-2,1,n()?'#baae8b':'#f1e9ce');
      }else{
        const rise=shape===1?4:shape===2?8:11;
        for(let ry=0;ry<rise;ry+=2){const inset=3+Math.floor(ry*(shape===3?.7:1.2));P(x+inset,y-6-ry,w-inset*2,2,n()?'#536d84':'#bed0d8');}
        if(shape===3){P(x+w-10,y-15,3,10,n()?'#394457':'#7c8790');P(x+w-12,y-16,7,2,n()?'#8d9eac':'#f4f0df');}
      }
      const windows=w<30?2:3;
      for(let k=0;k<windows;k++){const wx=x+4+k*Math.floor((w-8)/windows);P(wx,y+4,4,Math.min(4+row,h-5),n()?'#e6b774':'#e2d6b9');if(n()&&k===1)P(wx+1,y+5,2,2,'#ffe0a0');}
      if((i+row)%4===1){P(x+1,y+h-5,w-2,3,n()?'#965543':'#b94e43');P(x+3,y+h-5,w-6,1,n()?'#cf9660':'#dfa26b');}
      if((i+row)%3===0){lantern(x+w+3,y+3,1);}
      if(!n()&&(i+row)%6===0){P(x+8,y-13,3,8,'#93836f');smoke(x+8,y-18,i);}
      if(!n()&&(i+row)%5===0){P(x+w-1,y-18,1,17,'#7e6753');P(x+w,y-18,12,5,'#b55747');P(x+w+1,y-17,6,1,'#e7b582');}
    }
  }
  if(inn){
    const x=309-Math.round(offset*.08)%24;
    P(x,169,45,34,n()?'#4f5964':'#a9a69b');P(x-4,165,53,5,'#354d5f');P(x-1,163,47,2,n()?'#abc3ce':'#f3f2e8');
    P(x+15,179,15,24,n()?'#47758b':'#638d9a');P(x+22,179,1,24,'#a6c6cc');P(x+18,191,4,1,'#d6c693');lantern(x+38,178,1);
  }
}
const pineVista=[
  {speed:.035,draw:c=>sky(c)},
  {speed:.11,draw:c=>{steppedRidge(c,103,21,n()?'#2c3c57':'#9ab4c4',2);steppedRidge(Math.round(c*.7),121,14,n()?'#3c4d63':'#bfd0d7',5);P(0,128,W,4,n()?'#506070':'#d3ddd9');farAir(c);}},
  {speed:.34,draw:(c,t)=>townVista(c,t)},
  {speed:.72,draw:c=>{const q=Math.round(c*.08)%24;pine(-17-q,225,157,true);pine(425-q,237,146,true);P(0,216,W,9,n()?'#263f4b':'#99aead');P(0,216,W,2,tone().snow);for(let i=0;i<8;i++)P(i*61-c%61,216,28,2,n()?'#d6e0df':'#fff9ec');}}
];
const innVista=[
  {speed:.025,draw:c=>sky(c)},
  {speed:.10,draw:c=>{steppedRidge(c,109,22,n()?'#2e405b':'#a5bccc',3);steppedRidge(c,132,10,n()?'#42536a':'#c3d0d6',7);farAir(c);distantTown(c,159,1);}},
  {speed:.30,draw:(c,t)=>townVista(c,t,true)},
  {speed:.68,draw:c=>{
    // 고드름 아래 한 칸 빈 마루: 같은 지붕이 낮에는 흰빛, 밤에는 등빛을 받는다.
    const dx=c%67;P(0,0,W,13,n()?'#28313f':'#6e6257');P(0,13,W,6,n()?'#39404a':'#91755b');P(0,20,W,2,n()?'#74695e':'#b39b77');
    for(let i=-1;i<9;i++){const x=i*67-dx,len=12+(i+9)%4*6;P(x,19,6,len-5,'#a8c6d6');P(x+1,19,2,len,'#e1edf0');P(x+4,21,1,len-9,'#7fa4bb');P(x+1,19,2,3,'#fff8e8');}
    P(15-c%23,18,7,207,n()?'#423b3c':'#805d43');P(16-c%23,20,2,202,n()?'#796659':'#bd9164');
    P(387-c%23,18,9,207,n()?'#423b3c':'#805d43');P(0,214,W,11,n()?'#453b3c':'#956d4c');P(0,212,W,2,n()?'#9b8170':'#d0aa79');
    for(let x=0;x<W;x+=31)P(x-c%31,215,1,10,n()?'#292c34':'#614835');lantern(366-c%23,37,2);
  }}
];
/* 바둑 노인 한 사람 (결정 D-325·D-562). f는 바라보는 쪽. 흰눈썹은 눈 위에 흰 눈썹, 곰방대는 입에 문 곰방대로 가른다.
   거리의 두 노인 그림과 대화 초상(story.js Rg.portraits)이 같은 그림을 쓴다. */
function elder(ox,y,f,who){
  ox=Math.round(ox);y=Math.round(y);
  M(ox,y,f,-7,-14,14,13,'#777b75');M(ox,y,f,-6,-22,13,10,'#b6b1a0');M(ox,y,f,-7,-25,4,5,'#605b53');M(ox,y,f,3,-25,4,5,'#605b53');
  M(ox,y,f,-5,-21,3,6,'#3b3a37');M(ox,y,f,2,-21,3,6,'#3b3a37');M(ox,y,f,-3,-18,1,1,'#eee4cd');M(ox,y,f,3,-18,1,1,'#eee4cd');
  M(ox,y,f,-4,-14,9,3,who==='steady'?'#a46b54':'#8a7761');
  if(who==='steady'){M(ox,y,f,-6,-22,4,1,'#f6f1e4');M(ox,y,f,2,-22,4,1,'#f6f1e4');}
  else{M(ox,y,f,4,-16,6,1,'#5b4430');M(ox,y,f,9,-18,2,2,'#a5532f');}
}
/* 결정 D-320: 얼레(연 날리는 토끼 아이)의 방패연 (사용자 피드백 2026-11-02: 연 아이 이벤트가 구리다, 연이 바람에 날리듯, 연 상태를 그림으로).
   연은 늘 얼레 손의 얼레(실패)와 줄로 이어져 있고, 상태마다 모습이 다르다.
   - 처마 못에 걸림(jxKiteFreed 전): 긴 꼬리가 못에 감겨 연이 거꾸로 매달려 바람에 흔들린다. 줄은 얼레가 느슨하게 잡아 처진다.
   - 풀려 내려옴(jxKiteFreed, jxKiteDone 전): 찢긴 모서리를 위로 하고 얼레 발치 눈 위에 놓여 있다.
   - 다시 띄움(jxKiteDone, 낮): 한지로 때운 연이 하늘에서 바람결에 기울고 솟는다. 센 바람엔 줄이 팽팽해지고 잦아들면 처진다. 꼬리가 S 자로 나부낀다.
   - 밤: 연이 안 보여서 거둬들여 얼레 곁에 세워 둔다. 설날 아침(꼭지가 온 뒤)엔 꼭지의 작은 연이 하나 더 뜬다.
   바람은 kiteGust(초)가 -1~1로 정하고, 동작 줄이기면 0(바람 없는 한 장)이다. */
const KITE={paper:'#f4ecd6',paper2:'#e6dcc2',edge:'#7d5d3c',stick:'#a88a62',band:'#b8473c',cap:'#2f5f8f',patch:'#fffaf0',seam:'#cdbb92',tail1:'#c9523f',tail2:'#e0a23a',line:'#5f5246'};
const kiteNow=()=>performance.now()/1000;
function kiteGust(t){return Vfx.reducedMotion?0:Math.sin(t*0.9)*0.6+Math.sin(t*2.3+1)*0.4;}
// 방패연 한 장. (cx,cy) 가운데, ang 기울기(라디안), s 배율. o.torn 찢긴 모서리, o.patched 한지로 때운 모서리, o.hole 방구멍 너머 색
function kitePaper(cx,cy,ang,s=1,o={}){
  const w=10*s,h=13*s;
  ctx.save();ctx.translate(Math.round(cx),Math.round(cy));ctx.rotate(ang);
  const r=(x,y,ww,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(ww)),Math.max(1,Math.round(hh)));};
  r(-w/2-1,-h/2-1,w+2,h+2,KITE.edge);r(-w/2,-h/2,w,h,KITE.paper);r(w/2-2*s,-h/2,2*s,h,KITE.paper2);
  r(-w/2,-h/2,w,Math.max(2,2*s),KITE.band);                                   // 머리 띠
  r(-1.5*s,-h/2+2.5*s,3*s,2*s,KITE.cap);r(-1*s,-h/2+2*s,2*s,3*s,KITE.cap);     // 꼭지 (둥근 색종이)
  for(let i=1;i<8;i++){const u=i/8;r(-w/2+u*w,-h/2+u*h,1,1,KITE.stick);r(w/2-u*w-1,-h/2+u*h,1,1,KITE.stick);}   // X 자 대살
  r(-0.5,-h/2,1,h,KITE.stick);
  const hr=Math.max(1.5,1.8*s);r(-hr,1*s-hr+0.5,hr*2,hr*2-1,o.hole||'#c7d7df');r(-hr+0.5,1*s-hr,hr*2-1,hr*2,o.hole||'#c7d7df');   // 방구멍
  if(o.torn){r(-w/2,h/2-3*s,3*s,3*s,KITE.paper2);for(let i=0;i<3*s;i++)r(-w/2+i,h/2-3*s+i+((i%2)?1:0),1,1,KITE.edge);}   // 못에 찢긴 아래 모서리: 접힌 귀와 들쭉날쭉한 금
  if(o.patched){r(-w/2,h/2-3.5*s,3.5*s,3.5*s,KITE.patch);r(-w/2+3.5*s,h/2-3.5*s,1,3.5*s,KITE.seam);r(-w/2,h/2-3.5*s,3.5*s,1,KITE.seam);}
  ctx.restore();
}
// 연의 아래 끝에서 나온 꼬리. 바람 쪽(wx)으로 흘러가며 물결친다. 동작 줄이기면 곧게 처진다
function kiteTail(x0,y0,t,len,wx,down=1){
  const rm=Vfx.reducedMotion;let x=x0,y=y0;
  for(let i=0;i<len;i++){const ph=t*5-i*0.55;
    x+=wx*0.8+(rm?0:Math.sin(ph)*0.45*(1+i*0.06));y+=down*(0.9+(rm?0:Math.cos(ph)*0.35));
    P(x,y,2,2,i%4<2?KITE.tail1:KITE.tail2);if(i%6===5)P(x-1,y,4,1,KITE.tail1);}   // 군데군데 매듭
}
// 연줄: 손(x1,y1)에서 연(x2,y2)까지. sag 만큼 가운데가 처진다 (팽팽하면 0에 가깝다)
function kiteLine(x1,y1,x2,y2,sag){
  const n=Math.max(4,Math.ceil(Math.hypot(x2-x1,y2-y1)/1.5)),mx=(x1+x2)/2,my=(y1+y2)/2+sag;
  for(let i=0;i<=n;i++){const u=i/n,a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;P(a*x1+b*mx+c*x2,a*y1+b*my+c*y2,1,1,KITE.line);}
}
/* 결정 D-780: 처마 못에 감긴 연 꼬리 (사용자 피드백 2026-11-05 "연 꼬리가 실제로 묶여 있는 건지 모르겠다").
   처마 밑으로 삐죽 나온 쇠못을 대가리까지 또렷이 그리고, 꼬리가 못에 감긴 바퀴(loops)를 띠로 보인다.
   늘어진 꼬리에는 어두운 테를 둘러 처마 벽·하늘 어디서든 보이게 한다. (nx,ny) 못 밑동, (kx,ky) 연 머리 쪽 꼬리 끝.
   lift 는 손이 쥐고 들어 올린 높이(풀 때) */
function kiteSnag(nx,ny,kx,ky,t,loops,lift=0){
  const rm=Vfx.reducedMotion,OUT='#2a1f18';
  R(nx-1,ny-1,3,8,'#2e2826');R(nx-2,ny+6,5,2,'#55504b');R(nx,ny,1,6,'#6c6660');   // 쇠못 (대가리가 아래)
  for(let j=0;j<loops;j++){const yy=ny+1+j*3;R(nx-3,yy-1,8,4,OUT);R(nx-2,yy,6,2,j%2?KITE.tail2:KITE.tail1);}   // 못에 감긴 바퀴
  const top=ny+1+Math.max(0,loops)*3-lift,n=9,pts=[];
  for(let i=0;i<=n;i++){const u=i/n;pts.push([nx+(kx-nx)*u+(rm?0:Math.sin(t*6+i)*0.9*u),top+(ky-top)*u]);}
  for(const [x,y] of pts)R(x-1,y-1,4,4,OUT);
  pts.forEach(([x,y],i)=>R(x,y,2,2,i%4<2?KITE.tail1:KITE.tail2));
  const [bx,by]=pts[5];R(bx-2,by,6,1,OUT);R(bx-1,by,4,1,KITE.tail1);   // 꼬리 가운데 매듭
}
// 얼레(실 감는 틀)를 쥔 손. 줄은 여기서 나간다
function kiteReel(hx,hy){P(hx-2,hy-3,5,6,'#87694e');P(hx-1,hy-2,3,4,'#d8c7a3');P(hx-3,hy-1,7,1,'#6c5139');P(hx,hy+3,1,3,'#6c5139');}
/* 필드의 연 장면. (x,y)는 얼레 발밑 화면 좌표, f 는 얼레가 바라보는 쪽 */
function kiteScene(x,y,f){
  const F=G.f,t=kiteNow(),g=kiteGust(t),hx=x+f*13,hy=y-14;kiteReel(hx,hy);
  if(!F.jxKiteFreed){
    // 처마 못에 걸림: 꼬리가 못에 감기고 연은 거꾸로 매달려 흔들린다
    const nx=tx(1223)-cam,ny=98,sw=Vfx.reducedMotion?0.2:Math.sin(t*2.1)*0.35+g*0.25;
    const kx=nx+Math.sin(sw)*16,ky=ny+4+Math.cos(sw)*16;
    kiteSnag(nx,ny,kx,ky-7,t,2);   // 결정 D-780: 못에 두 바퀴 감긴 꼬리를 또렷이
    kitePaper(kx,ky,Math.PI+sw*0.8,1.2,{torn:true});
    kiteLine(hx,hy,kx,ky+3,26);
    return;
  }
  if(!F.jxKiteDone){
    // 풀려 내려옴: 얼레 발치 눈 위에 놓였다. 찢긴 모서리가 보인다
    kitePaper(hx+f*9,y-4,f*1.35,1,{torn:true});kiteTail(hx+f*14,y-2,0,6,f*0.9,0);
    kiteLine(hx,hy,hx+f*8,y-6,3);return;
  }
  if(n()){
    // 밤엔 연이 안 보여서 거둬들였다. 얼레 곁에 세워 둔다
    kitePaper(x-f*10,y-9,-f*0.12,0.9,{patched:true});return;
  }
  // 다시 띄움: 바람결에 기울고 솟고, 센 바람엔 줄이 팽팽해진다
  const kx=hx+f*(96+g*7),ky=46+(Vfx.reducedMotion?0:Math.sin(t*1.3)*4)-g*4,ang=f*(0.32+g*0.22);
  kiteLine(hx,hy,kx,ky+2,Math.max(2,16-g*11));
  kiteTail(kx-f*Math.sin(ang)*8,ky+7,t,34,f*0.9);
  kitePaper(kx,ky,ang,1.15,{patched:true});
  if(F.jangteoArcsKite3){
    // 설날 아침: 꼭지가 와서 작은 연을 하나 더 띄운다. 꼭지는 얼레 뒤에 붙어 선다
    const cx=x-f*12,sx=cx+f*8,sy=y-10,k2x=sx+f*(52+g*5),k2y=92+(Vfx.reducedMotion?0:Math.sin(t*1.7+1)*3)-g*3;
    const q=(a,b,w,h,c)=>M(cx,y,f,a,b,w,h,c);
    q(-3,-10,7,9,'#a8a197');q(-3,-16,7,7,'#d5c9b6');q(-3,-24,2,9,'#d5c9b6');q(2,-23,2,8,'#d5c9b6');q(2,-14,1,1,'#322c30');q(-4,-10,8,2,'#d9a441');q(-3,-1,3,1,'#77706a');q(1,-1,3,1,'#77706a');
    P(sx,sy,2,2,'#87694e');kiteLine(sx+1,sy,k2x,k2y+2,Math.max(2,10-g*6));kiteTail(k2x,k2y+5,t+0.7,12,f*0.8);kitePaper(k2x,k2y,f*(0.25+g*0.2),0.75,{});
  }
}
/* 대사 작은 창 그림 (결정 D-151 장면 그림, 64×44 칸). Rg.kitePics.stuck()·free()·rise() 는 열 때마다 새로 만든다 */
function kiteSky(w,h){R(0,0,w,h,'#c9d6de');R(0,0,w,8,'#bccbd5');}
function kiteEave(w){
  for(let x=-2;x<w;x+=6){R(x,0,6,6,'#5b6670');R(x,0,6,1,'#7d8992');R(x+5,0,1,6,'#3f4950');}
  R(0,6,w,2,'#f4f6f8');R(0,8,w,3,'#6d4f3a');R(0,11,w,1,'#4b3628');
}
function kiteFlakes(w,h,t,n=10){if(Vfx.reducedMotion)return;for(let i=0;i<n;i++){const sp=18+(i*7)%11,x=((i*23+t*sp*1.6)%(w+8))-4,y=((i*13+t*sp*0.6)%(h+4))-2;R(Math.round(x),Math.round(y),1,1,'#ffffff');}}
Rg.kitePics={
  // 처마 못에 꼬리가 감긴 연. 바람이 불 때마다 거꾸로 매달린 연이 휘청이며 모서리가 처마에 부딪힌다
  // 결정 D-780: 못(46,12)에 꼬리가 두 바퀴 감긴 모습이 또렷이 보이게 (kiteSnag). 줄은 왼쪽 아래 얼레에게로 처진다
  stuck(){return {animate:true,sound:'pic_kite',draw(w,h,t){   // 결정 D-483
    kiteSky(w,h);kiteEave(w);const g=kiteGust(t),rm=Vfx.reducedMotion;
    const nx=46,ny=12,sw=rm?0.3:Math.sin(t*2.1)*0.45+g*0.3;
    const kx=nx+Math.sin(sw)*12,ky=ny+19+Math.cos(sw)*2;
    kiteSnag(nx,ny,kx,ky-8,t,2);
    kitePaper(kx,ky,Math.PI+sw*0.8,1.2,{torn:true});
    kiteLine(kx,ky+4,-2,h+2,8);kiteFlakes(w,h,t);
  }};},
  /* 결정 D-780: 푸는 그림을 글("못에 감긴 꼬리를 한 바퀴, 두 바퀴 풀었다. 꼬리가 빠지자 연이 얼레 쪽으로 흔들흔들 내려간다")에 맞췄다.
     처마에 붙어 선 아이의 짧고 뭉툭한 앞발이 오른쪽에서 들어와(가까이서 본 손이라 팔뚝은 몇 칸뿐) 못을 한 바퀴씩 돌며 꼬리를 푼다.
     바퀴가 하나 풀릴 때마다 연이 조금씩 처지고, 다 풀리면 꼬리 끝을 쥐었다 놓는다. 연은 줄에 끌려 왼쪽 아래 얼레 쪽으로 흔들리며 내려간다 */
  free(){let t0=null;return {animate:true,sound:'pic_kite',draw(w,h,t){
    if(t0===null)t0=t;const rm=Vfx.reducedMotion,k=rm?1.3:Math.min(3.4,t-t0);
    kiteSky(w,h);kiteEave(w);
    const nx=46,ny=12,ss=e=>e*e*(3-2*e);
    const reach=ss(Math.min(1,k/0.45)),un=Math.max(0,Math.min(1,(k-0.45)/0.8)),loops=k<0.45?2:Math.max(0,2-Math.floor(un*2.0001)),
      pull=Math.max(0,Math.min(1,(k-1.25)/0.2)),fall=Math.max(0,(k-1.45)/1.4);
    // 손 자리: 못으로 다가와 → 못을 두 바퀴 돌며 풀고 → 꼬리 끝을 쥐고 살짝 당긴다
    let px=w+8-(w+8-(nx+4))*reach,py=ny+4;
    if(un>0&&un<1){const a=un*Math.PI*4;px=nx+4+Math.cos(a)*3;py=ny+4+Math.sin(a)*2;}
    if(pull>0){px=nx+4+pull*3;py=ny+4-pull*2;}
    if(fall>0.25){const back=Math.min(1,(fall-0.25)/0.5);px+=back*16;}
    let kx=nx+(rm?0:Math.sin(t*2.6)*2),ky=ny+17+(2-loops)*2,ang=Math.PI;
    if(fall>0){const e=Math.min(1,fall);kx=nx-e*38+Math.sin(fall*5)*4*(1-e*0.5);ky=ny+19+e*24;ang=Math.PI*(1-e)+Math.sin(fall*5)*0.5;}
    if(fall<0.02)kiteSnag(nx,ny,kx,ky-8,t,loops,pull*2);
    else{R(nx-1,ny-1,3,8,'#2e2826');R(nx-2,ny+6,5,2,'#55504b');R(nx,ny,1,6,'#6c6660');kiteTail(kx,ky-6,t,9,0.7,-1);}
    kitePaper(kx,ky,ang,1.2,{torn:true});kiteLine(kx,ky,-2,h+2,Math.max(2,10-fall*6));
    // 아이의 앞발 (가까이서 본 손). 회색 팔뚝 몇 칸에 검고 오동통한 손, 손끝 볼록한 발가락 셋
    px=Math.round(px);py=Math.round(py);
    if(px<w+6){
      R(px+4,py-4,w-px,9,'#4a4038');R(px+4,py-3,w-px,7,'#8c8070');R(px+4,py-3,w-px,2,'#a89d8c');   // 통통한 회색 팔뚝
      R(px+3,py-4,2,9,'#efe6d6');   // 손목의 흰 털
      R(px-2,py-4,6,9,'#2a211b');R(px-3,py-3,1,7,'#2a211b');R(px-1,py-3,4,7,'#3b332e');   // 둥근 손
      for(const dy of [-3,0,3])R(px-5,py+dy,3,2,'#2a211b');   // 오동통한 발가락 셋
      R(px-1,py-2,2,2,'#5a4f45');   // 손바닥 볼록살
    }
    kiteFlakes(w,h,t,6);
  }};},
  // 얼레가 찢긴 모서리를 한지로 때운 연을 다시 띄운다. 몇 걸음 달리자 줄이 팽팽해지고 연이 바람을 타고 솟는다
  rise(){let t0=null;return {animate:true,draw(w,h,t){
    if(t0===null)t0=t;const k=Vfx.reducedMotion?4:t-t0,g=kiteGust(t);
    kiteSky(w,h);R(0,30,w,3,'#9aa5a8');for(let x=0;x<w;x+=9)R(x,28+(x%4),6,3,'#aeb7b7');R(0,36,w,8,'#e8eeee');R(0,36,w,1,'#ffffff');
    const run=Math.min(1,k/0.7),ex=Math.round(6+run*8),ey=42;
    const q=(a,b,ww,hh,c)=>M(ex,ey,1,a,b,ww,hh,c);
    // 얼레 (토끼 아이). 달리는 동안 발이 엇갈린다
    const step=run<1&&!Vfx.reducedMotion&&Math.floor(k*10)%2;
    q(-4,-11,9,10,'#a8a197');q(-4,-18,9,8,'#d5c9b6');q(-3,-27,2,10,'#d5c9b6');q(3,-26,2,9,'#d5c9b6');q(-2,-25,1,6,'#c7988e');q(3,-15,1,1,'#322c30');q(5,-13,2,1,'#b87f72');q(-5,-11,11,3,'#b44d48');
    q(step?-4:-3,-1,3,1,'#77706a');q(step?3:2,-1,3,1,'#77706a');
    const hx=ex+9,hy=ey-10;R(hx-2,hy-2,4,5,'#87694e');R(hx-1,hy-1,2,3,'#d8c7a3');
    const up=Math.max(0,Math.min(1,(k-0.5)/1.3)),e=up*up*(3-2*up);
    const kx=40+e*5+g*2*e,ky=37-e*21+(Vfx.reducedMotion?0:Math.sin(t*1.3)*1.5*e)-g*1.5*e,ang=(1-e)*1.2+e*(0.3+g*0.2);
    kiteLine(hx,hy,kx,ky+2,Math.max(1,9*(1-e)+3-g*2));
    if(e>0.15)kiteTail(kx-Math.sin(ang)*6,ky+6,t,Math.round(6+e*12),0.7*e+0.1,1);
    kitePaper(kx,ky,ang,1.3,{patched:true});
  }};}
};
/* 결정 D-781·D-784: 작은 창 그림 속 손짓(톡 짚기·퉁기기)에 맞춰 소리를 낸다. 창이 열릴 때가 아니라 손이 닿는 그 순간에.
   소리는 popup_sounds.csv 의 그 줄(row)이다. 한 바퀴(cyc)에 한 번만 */
function picCue(st,row,cyc){
  if(st.cyc===cyc)return;st.cyc=cyc;
  const s=TABLES.POPUP_SOUNDS?.[row];if(s&&typeof Sound!=='undefined')Sound.cue(s.sfx,0,1);
}
/* 결정 D-661·D-781: 작은 장승 작은 창. 아이 키만 한 장승에 눈이 소복한데 코끝만 반들반들하다.
   장승 곁에 붙어 선 아기 너구리가 짧고 뭉툭한 앞발을 들어 코를 톡 짚는다 (사용자 피드백 2026-11-05 "팔이 젓가락처럼 길다. 오동통한 손이 코를 톡").
   짚는 순간 '톡' 소리가 나고 장승 머리의 눈가루가 날린다. 다른 모습으로 둔갑해 있으면 그 모습으로 코앞에 몸을 내밀어 콕 댄다 */
Rg.jangseungPic=()=>{let t0=null;const st={};return {animate:true,draw(w,h,t){
  if(t0===null)t0=t;
  const rm=Vfx.reducedMotion,snow='#f6f8fa',g=h-3,P0=2.4,el=t-t0,k=rm?0.75:el%P0,cyc=Math.floor(el/P0);
  R(0,0,w,h,'#c9d6de');R(0,0,w,7,'#bccbd5');
  for(let x=0;x<w;x+=13){R(x+2,g-15,10,9,'#a39b8f');R(x,g-18,14,3,'#5b6670');R(x,g-18,14,1,snow);}   // 먼 장터 지붕
  R(0,g,w,3,'#e9edf0');R(0,g,w,1,snow);
  const x=20,top=g-Rg.SNOW_JANGSEUNG_H;jangseung(x,g,1,Rg.SNOW_JANGSEUNG_H);
  R(x-9,top-1,18,3,snow);R(x-6,top-8,12,2,snow);R(x-7,top+2,4,1,snow);R(x+3,top+2,4,1,snow);R(x-7,top+14,3,2,snow);R(x+4,top+14,3,2,snow);R(x-6,top+18,12,2,snow);
  R(x-2,top+9,4,1,'#c9b392');   // 짚여서 반들반들한 코끝
  // 손을 드는 정도: 쉼 → 들기(0.35~0.65) → 톡(0.7) → 내리기(0.9~1.2)
  const up=k<0.35?0:k<0.65?(k-0.35)/0.3:k<0.9?1:k<1.2?1-(k-0.9)/0.3:0,e=up*up*(3-2*up),tap=!rm&&k>=0.7&&k<0.8;
  if(!rm&&k>=0.7)picCue(st,'j_jangseung_snow',cyc);
  const ox=x+16,tip=e>0.9?1:0,form=G?.form||'';
  if(form)drawPlayerAt(ox+(tap?-3:0),g,-1,0,0,null,0,form);
  else{
    drawRaccoonAt(ox,g-tip,-1,0,0,null,0);   // 장승 바로 곁에 붙어 서서 발끝을 살짝 든다
    if(e>0){
      // 몸 앞쪽 어깨에서 코끝까지 짧고 굵은 팔(털 소시지처럼 통통하게)과 검고 둥근 손
      const sx=ox-5,sy=g-10-tip,ex=x+4+(tap?0:1),ey=top+11,ax=Math.round(sx+(ex-sx)*e),ay=Math.round(sy+(ey-sy)*e);
      const n=Math.max(1,Math.round(Math.hypot(ax-sx,ay-sy)/2));
      for(let i=0;i<=n;i++){const u=i/n,px=Math.round(sx+(ax-sx)*u),py=Math.round(sy+(ay-sy)*u);R(px-2,py-1,4,4,'#5a5046');}
      for(let i=0;i<=n;i++){const u=i/n,px=Math.round(sx+(ax-sx)*u),py=Math.round(sy+(ay-sy)*u);R(px-1,py-1,3,3,'#8c8070');R(px-1,py-1,2,1,'#a89d8c');}
      R(ax-3,ay-2,5,5,'#2a211b');R(ax-2,ay-1,3,3,'#3b332e');R(ax-4,ay-1,1,1,'#2a211b');R(ax-4,ay+1,1,1,'#2a211b');R(ax-2,ay-1,1,1,'#5a4f45');   // 오동통한 손과 발가락
    }
  }
  if(tap){R(x+3,top+7,1,1,'#ffffff');R(x+5,top+8,1,1,'#ffffff');R(x+5,top+12,1,1,'#ffffff');}   // 톡 하고 닿은 자리
  if(!rm&&k>0.7&&k<1.35){const p=(k-0.7)/0.65;for(let i=0;i<4;i++)R(Math.round(x-3+i*2-p*3),Math.round(top-2-p*(4+i*2)),1,1,snow);}   // 짚는 바람에 머리 눈가루가 날린다
  kiteFlakes(w,h,t,8);
}};};
/* 결정 D-784: 옹기전 독 작은 창 (사용자 피드백 2026-11-05 "독을 손으로 실제 튕긴 것처럼 맑은 소리가 퍼지게").
   좌판 널 위의 큰 독. 아이의 뭉툭한 앞발이 오른쪽에서 들어와 손끝을 살짝 젖혔다가 독 어깨를 톡 퉁긴다.
   닿는 순간 맑은 울림(onggi_ring)이 나고, 독이 가늘게 떨며 울림 고리가 둘레로 번져 나간다. 2.2초마다 되풀이한다 */
function onggiJar(cx,base,s,shake){
  const x=cx+shake,body='#6b4a34',lite='#9a6e4c',dark='#4a3428',rim='#3a2a20';
  const rows=[[0,6,rim],[2,7,dark],[3,9,body],[5,11,body],[8,12,body],[14,12,body],[19,11,body],[22,10,body],[24,8,dark]];   // [위에서부터 y, 반너비]
  const hgt=Math.round(26*s);
  for(let i=0;i<rows.length-1;i++){const [y0,w0,c]=rows[i],[y1]=rows[i+1];const a=Math.round(y0*s),b=Math.round(y1*s),hw=Math.round(w0*s);R(x-hw,base-hgt+a,hw*2,Math.max(1,b-a),c);}
  R(x-Math.round(8*s),base-2,Math.round(16*s),2,rim);
  R(x-Math.round(10*s),base-hgt+Math.round(7*s),2,Math.round(13*s),lite);   // 왼쪽 윤기
  R(x+Math.round(9*s),base-hgt+Math.round(8*s),2,Math.round(12*s),dark);    // 오른쪽 그늘
  if(s>0.8)for(let j=0;j<16;j+=2)R(x-8+j,base-hgt+13+((j/2)%2),2,1,'#8a6448');   // 손가락으로 그은 물결무늬 (큰 독만, 이어진 물결로)
}
Rg.onggiPic=()=>{let t0=null;const st={};return {animate:true,draw(w,h,t){
  if(t0===null)t0=t;
  const rm=Vfx.reducedMotion,P0=2.2,el=t-t0,k=rm?0.62:el%P0,cyc=Math.floor(el/P0),g=h-5;
  R(0,0,w,h,'#d8cbb6');R(0,0,w,6,'#ab4d43');for(let i=0;i<w;i+=8)R(i,6,5,2,'#ab4d43');   // 좌판 차일
  R(0,g,w,5,'#8a6448');R(0,g,w,1,'#b8875c');R(0,g+4,w,1,'#5a3a26');   // 좌판 널
  onggiJar(9,g,0.55,0);onggiJar(55,g,0.5,0);
  const cx=29,hit=k>=0.6,ring=hit&&k<0.9&&!rm,shake=ring?((Math.floor(k*40)%2)?1:-1)*(k<0.75?1:0):0;
  onggiJar(cx,g,1,shake);
  if(hit&&k<1.0&&!rm){const a=(1-(k-0.6)/0.4)*0.8;ctx.fillStyle='rgba(255,236,200,'+a.toFixed(2)+')';ctx.fillRect(cx-8,g-23,3,10);}   // 울릴 때 윤기가 반짝
  if(!rm&&k>=0.6)picCue(st,'j_onggi',cyc);
  // 울림 고리: 퉁긴 자리에서 셋이 차례로 번진다
  const hx=cx+12,hy=g-19;
  if(!rm)for(let r=0;r<3;r++){const p=(k-0.6-r*0.14)/0.9;if(p<=0||p>=1)continue;
    ctx.strokeStyle='rgba(255,248,222,'+(0.85*(1-p)).toFixed(2)+')';ctx.lineWidth=1;ctx.beginPath();ctx.arc(hx,hy,3+p*30,0,Math.PI*2);ctx.stroke();}
  // 아이의 앞발: 다가와 → 손끝을 젖혀 → 톡 → 살짝 튕겨 나옴
  let px;
  if(rm)px=hx+6;
  else if(k<0.3)px=w+6-(w+6-(hx+10))*(k/0.3);
  else if(k<0.5)px=hx+10+((k-0.3)/0.2)*3;
  else if(k<0.6)px=hx+13-((k-0.5)/0.1)*8;
  else if(k<0.8)px=hx+5+((k-0.6)/0.2)*5;
  else px=hx+10;
  px=Math.round(px);const py=hy,flick=k>=0.5&&k<0.66;
  R(px+4,py-4,w-px,9,'#4a4038');R(px+4,py-3,w-px,7,'#8c8070');R(px+4,py-3,w-px,2,'#a89d8c');   // 통통한 팔뚝 (가까이서 본 손이라 몇 칸뿐)
  R(px+3,py-4,2,9,'#efe6d6');   // 손목의 흰 털
  R(px-2,py-4,6,9,'#2a211b');R(px-3,py-3,1,7,'#2a211b');R(px-1,py-3,4,7,'#3b332e');R(px-1,py-2,2,2,'#5a4f45');   // 둥근 손
  if(flick){R(px-6,py-1,4,2,'#2a211b');R(px-6,py-1,1,1,'#5a4f45');R(px-5,py+2,3,2,'#2a211b');}   // 젖혔다 퉁기는 손끝
  else for(const dy of [-3,0,3])R(px-5,py+dy,3,2,'#2a211b');   // 오동통한 발가락 셋
}};};
/* 결정 D-785: 쌀가루 묻은 발판 작은 창 (사용자 피드백 2026-11-05 "나오는 내용과 이미지가 최대한 매칭되게").
   글은 "아궁이 앞 발판에 쌀가루가 하얗게 묻었고 그 위에 큰 곰 발자국이 어지럽다". 그대로 그린다:
   위쪽은 아궁이 불빛과 김, 아래는 쌀가루가 하얗게 앉은 나무 발판. 큰 곰 발자국 여럿이 이리저리 찍혀 있고,
   시루를 깨운 뒤엔 아이의 작은 발자국도 섞였다.
   결정 D-862: 발이 내려와 찍는 움직임은 뺐다. 발자국은 이미 찍혀 있는 것으로 둔다 (사용자 피드백 2026-11-06). 아궁이 김만 움직인다 */
function bearPrint(x,y,f){
  // 가루에 눌린 곰 발자국: 가로로 넓은 발바닥 + 부채꼴 발가락 다섯 + 발톱 자국. f=-1 이면 반대쪽(아래)을 향해 찍혔다
  const d='#9c8b6e',dd='#7a6a50',s=f<0?-1:1;
  R(x-3,y,7,3,d);R(x-2,y+(s>0?3:-1),5,1,d);
  for(const [dx,dy] of [[-4,2],[-2,3],[0,4],[2,3],[4,2]]){const ty=s>0?y-dy:y+2+dy;R(x+dx,ty,1,2,d);R(x+dx,s>0?ty-2:ty+3,1,1,dd);}
}
function kidPrint(x,y){const d='#a8987a';R(x-1,y,3,2,d);R(x-2,y-2,1,1,d);R(x,y-3,1,1,d);R(x+2,y-2,1,1,d);}
Rg.flourPic=()=>{return {animate:true,sound:'j_steam_flour',draw(w,h,t){
  const rm=Vfx.reducedMotion;
  // 아궁이 앞 흙바닥과 아궁이 (위쪽)
  R(0,0,w,h,'#b89a78');R(30,0,30,16,'#8c6651');R(34,2,22,3,'#b79b78');R(39,7,13,9,'#4b3a34');R(41,9,9,7,'#ecaa58');R(43,11,5,4,'#ffe0a0');
  if(!rm)for(let j=0;j<3;j++){const q=((t*0.6+j*0.33)%1);R(Math.round(44+Math.sin((t+j)*2)*3),Math.round(6-q*8),4-q*2,2,'rgba(255,255,255,'+(0.6-q*0.6).toFixed(2)+')');}   // 아궁이 김
  // 나무 발판에 쌀가루
  R(0,19,w,22,'#7a5032');R(0,20,w,20,'#a97a51');for(let x=0;x<w;x+=16)R(x,20,1,20,'#7a5032');R(0,30,w,1,'#8f6542');
  for(const [x,y,ww,hh] of [[2,22,18,7],[14,27,22,10],[30,21,20,8],[40,29,22,9],[0,33,12,6],[52,22,12,6]])R(x,y,ww,hh,'#efe8da');
  for(const [x,y] of [[7,24],[22,31],[34,23],[47,33],[57,24],[12,36]])R(x,y,2,1,'#fbf8f0');
  // 오가며 찍힌 큰 곰 발자국 (방향이 엇갈린다)
  const spots=[[10,26,1],[24,33,-1],[38,25,1],[52,34,-1]];
  for(const [x,y,f] of spots)bearPrint(x,y,f);
  if(isAwake('siru'))for(const [x,y] of [[17,24],[31,30],[45,25],[58,30]])kidPrint(x,y);   // 아이의 작은 발자국
}};};
/* 결정 D-786: 모락과 김 올리기 대화 그림 (사용자 피드백 2026-11-05 "시루가 쓰이면서 깨어 가는 과정을 애니메이션으로, 모락과의 대화 중 맞는 대목에서").
   0 아궁이 가마솥 위에 얹은 엄마 시루(금빛 테). 아직 차다.
   1 솥과 시루가 맞닿은 틈에 쌀가루 반죽(시룻번)을 아이 손이 꼭꼭 눌러 붙여 간다.
   2 모락의 부채가 아궁이를 살살 부치고, 불이 커지며 시루 구멍에서 첫 김이 오른다.
   3 김이 고르게 오르고 금빛 테가 환해지며 시루 몸에 빛이 타고 오른다. 시루가 깨어난다 */
function siruScene(w,h,t,k,stage){
  const g=h,rm=Vfx.reducedMotion;
  R(0,0,w,h,'#e2c79b');R(0,0,w,3,'#b8946a');R(0,3,w,1,'#8d6850');   // 떡집 안 벽
  R(8,30,48,14,'#8c6651');R(10,32,44,2,'#b79b78');for(let x=10;x<54;x+=9)R(x,36,1,8,'#6f4e3c');   // 아궁이 벽돌
  const fire=stage===0?0.35:stage===1?0.45:stage===2?0.45+Math.min(0.55,k/2.2):1;
  R(24,35,16,9,'#3a2c26');
  const fh=Math.round(3+fire*5);R(26,44-fh,12,fh,'#e0782a');R(28,44-fh+1,8,fh-1,'#ecaa58');R(30,44-Math.max(2,fh-2),4,Math.max(2,fh-2),'#ffe0a0');
  if(!rm)for(let i=0;i<3;i++){const fl=Math.sin(t*12+i*2)>0?1:0;R(27+i*4,44-fh-1-fl,2,1+fl,'#ecaa58');}   // 날름거리는 불
  R(12,24,40,7,'#3e3834');R(10,23,44,2,'#5e5652');   // 가마솥
  // 시루: 위로 벌어진 질그릇, 양옆 손잡이, 금빛 테
  for(let y=8;y<24;y++){const hw=Math.round(13+(24-y)*0.25);R(32-hw,y,hw*2,1,y%5===0?'#8a5232':'#a0623e');}
  R(17,9,30,1,'#7a4428');R(12,14,3,3,'#8a5232');R(49,14,3,3,'#8a5232');
  const glow=stage===3?0.6+(rm?0.3:Math.sin(t*4)*0.3):stage===2?Math.min(0.5,k/4):0;
  R(16,10,32,2,glow>0.5?'#ffd66a':glow>0.2?'#e8b850':'#d9a441');R(16,12,32,1,'#9a7428');   // 금빛 테
  if(stage===3)for(let i=0;i<6;i++){const q=rm?0.5:((t*0.5+i/6)%1);R(19+((i*7)%26),Math.round(23-q*14),1,1,'rgba(255,230,140,'+(1-q).toFixed(2)+')');}   // 시루 몸을 타고 오르는 빛
  return {fire};
}
Rg.siruPics={
  stage(stage){let t0=null;return {animate:true,sound:stage>=2?'pic_siru_steam':undefined,draw(w,h,t){
    if(t0===null)t0=t;const rm=Vfx.reducedMotion,k=rm?3:t-t0;
    siruScene(w,h,t,k,stage);
    // 시룻번: 솥과 시루가 맞닿은 틈(y 23~25)에 흰 반죽 띠
    const band=stage===0?0:stage===1?Math.min(1,k/1.8):1;
    if(band>0){const bw=Math.round(32*band);R(16,23,bw,2,'#f3eee1');R(16,25,bw,1,'#d8cfbf');}
    if(stage===1&&band<1){const px=16+Math.round(32*band);R(px-1,19,4,4,'#2a211b');R(px,18,3,1,'#2a211b');R(px+3,20,6,3,'#8c8070');R(px+3,20,6,1,'#a89d8c');}   // 아이 손이 눌러 붙인다
    if(stage===2){   // 모락의 부채 (아궁이 앞에서 살랑)
      const a=rm?0:Math.sin(k*5)*0.5;ctx.save();ctx.translate(14,38);ctx.rotate(a);R(-1,-1,2,8,'#5a361e');ctx.fillStyle='#d9c8a0';ctx.beginPath();ctx.arc(0,-5,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b44d48';ctx.fillRect(-1,-7,3,3);ctx.restore();
      R(0,30,8,14,'#1f1a18');R(2,29,6,3,'#2e2622');   // 부채를 쥔 검은 곰 손
    }
    // 김: 2에선 몇 가닥, 3에선 고르게 다섯 줄기
    if(stage>=2&&!rm){const cols=stage===3?5:Math.min(3,1+Math.floor(k/1.2));
      for(let c=0;c<cols;c++){const x0=stage===3?20+c*6:24+c*8;for(let j=0;j<3;j++){const q=((t*0.7+j/3+c*0.17)%1);R(Math.round(x0+Math.sin((t+c+j)*3)*1.5),Math.round(7-q*9),stage===3?3:2,2,'rgba(255,255,255,'+(0.75-q*0.75).toFixed(2)+')');}}}
  }};}
};
function wanderer(kind,x,y,f=1){
  x=Math.round(x);y=Math.round(y);const p=(a,b,w,h,c)=>M(x,y,f,a,b,w,h,c);
  if(kind==='kite'){
    // 얼레: 연 날리는 토끼 아이. 손에 실 감는 얼레를 쥐었다. 대화 초상(작은 칸)에는 연을 그리지 않는다.
    // 필드에서는 늘 연(바람 부는 오른쪽)을 보고 선다
    if(ctx.canvas.width===W)f=1;
    p(-5,-16,11,14,'#a8a197');p(-5,-25,11,11,'#d5c9b6');p(-4,-38,3,15,'#d5c9b6');p(3,-36,3,12,'#d5c9b6');p(-3,-35,1,9,'#c7988e');p(4,-34,1,8,'#c7988e');p(3,-23,1,2,'#322c30');p(5,-19,3,2,'#b87f72');p(-6,-16,13,4,'#b44d48');p(-5,-2,4,2,'#77706a');p(2,-2,4,2,'#77706a');p(6,-14,6,2,'#c9b397');
    if(ctx.canvas.width===W&&G.zone==='entrance')kiteScene(x,y,f);
  }else if(kind==='yut'){
    // 결정 D-131: 사연이 켜진 판의 밤엔 흰눈썹 노인이 일찍 들어가고 곰방대 노인만 화롯불 곁에 남는다 (story.js elderArc2).
    const alone=!!G.f.night&&!!Rg.arcs?.();
    if(alone){P(x-24,y-5,10,5,'#4b3b31');P(x-23,y-8,8,3,'#c4532f');P(x-21,y-10,4,2,'#f0a54e');}
    for(let q=-1;q<=1;q+=2){if(alone&&q<0)continue;elder(x+q*19,y,-q,q<0?'steady':'bold');}   // 왼쪽 흰눈썹, 오른쪽 곰방대
    // 결정 D-562: 투호 항아리 대신 다리 달린 바둑판 (사용자 지시 2026-11-04 "투호 내기 말고 바둑"). 판 위에 흑백 돌 몇 점, 양옆에 돌 통.
    // 밤에 혼자 남은 곰방대 노인 곁엔 판을 덮어 둔다(둘이 있어야 두니까).
    P(x-14,y-2,28,2,'#d1b991');
    P(x-11,y-9,22,5,'#c99a58');P(x-11,y-9,22,1,'#e3bf7c');P(x-10,y-4,3,4,'#8a6538');P(x+7,y-4,3,4,'#8a6538');
    if(alone){P(x-11,y-10,22,2,'#7a5a3a');}
    else{for(let i=0;i<4;i++){P(x-9+i*6,y-8,1,3,'#8a6538');}P(x-10,y-7,20,1,'#8a6538');
      for(const [dx,dy,c] of [[-7,-8,'#1d1712'],[-2,-7,'#f4efe2'],[3,-8,'#1d1712'],[6,-7,'#f4efe2'],[-5,-6,'#f4efe2'],[1,-6,'#1d1712']])P(x+dx,y+dy,2,1,c);}
    P(x-19,y-5,5,5,'#7a5232');P(x-18,y-6,3,1,'#1d1712');P(x+14,y-5,5,5,'#7a5232');P(x+15,y-6,3,1,'#f4efe2');
  }else if(kind==='straw'){
    // 결정 D-318: 청설모 짚신장수 할아범. 귀 끝 털, 굽은 등, 등에 짚신 꾸러미. 끝내기 전엔 발치에 짚신이 흩어져 있다.
    p(-6,-15,12,13,'#6f5a4c');p(-4,-11,6,8,'#c9b8a0');p(-3,-24,10,10,'#7a6454');p(-3,-27,2,4,'#4e3e34');p(4,-27,2,4,'#4e3e34');p(-4,-29,1,3,'#4e3e34');p(5,-29,1,3,'#4e3e34');
    p(5,-21,4,3,'#c9b8a0');p(8,-20,1,1,'#2a211b');p(2,-22,1,1,'#2a211b');p(-1,-25,8,1,'#e8e0d0');
    p(-14,-14,6,12,'#7a6454');p(-15,-18,5,6,'#8a7262');p(-13,-20,3,3,'#9a8272');   // 꼬리
    p(-10,-27,9,13,'#d9b860');p(-9,-26,7,1,'#a8883a');p(-9,-21,7,1,'#a8883a');p(-9,-16,7,1,'#a8883a');   // 짚신 꾸러미
    p(-4,-2,3,2,'#4e3e34');p(2,-2,3,2,'#4e3e34');p(7,-14,1,14,'#8a6a3a');
    if(!G.f.jxStrawDone)for(const [dx,dy] of [[14,-2],[20,-1],[-22,-2],[26,-2]])p(dx,dy,6,2,'#d9b860');
  }else if(kind==='bean'){
    // 결정 D-318: 까투리(암꿩) 콩장수 아주머니. 얼룩 깃, 머릿수건, 곁에 콩 자루. 끝내기 전엔 자루 밑이 터져 콩이 흩어져 있다.
    p(-7,-15,14,12,'#a8875e');for(let i=0;i<4;i++)p(-5+i*3,-13+(i%2)*3,2,2,'#6b5034');p(-3,-24,9,10,'#b8986e');p(-3,-25,9,3,'#c9604b');p(-4,-23,2,4,'#c9604b');
    p(5,-20,4,2,'#d9b860');p(3,-21,1,1,'#2a211b');p(-14,-12,8,3,'#8a6a48');p(-17,-11,5,2,'#6b5034');   // 부리·꼬리깃
    p(-3,-2,2,3,'#c9a06a');p(3,-2,2,3,'#c9a06a');
    p(10,-12,12,12,'#b9a27a');p(11,-14,10,3,'#d6be8c');p(15,-15,2,2,'#8a6a3a');
    if(!G.f.jxBeanDone){p(11,-1,10,1,'#8a6a3a');for(const [dx,dy] of [[24,-1],[28,-2],[33,-1],[19,-1],[37,-1]])p(dx,dy,2,2,'#d9c07a');}
  }else if(kind==='gorani'){
    // 결정 D-790: 장국밥 가마솥의 뭉근 할멈. 고라니(뿔 없는 사슴)라 귀가 크고 둥글다. 흰 머릿수건과 행주치마, 손에 긴 국자. 주둥이 끝이 희끗하다.
    p(-5,-6,2,6,'#6b5644');p(3,-6,2,6,'#6b5644');p(-5,-1,2,1,'#2a211b');p(3,-1,2,1,'#2a211b');   // 가는 다리와 발굽
    p(-7,-19,13,12,'#9a7f62');p(-7,-9,13,3,'#6a4a5a');p(-4,-17,9,11,'#ece4d2');p(-7,-17,13,1,'#b9a888');   // 몸, 치마, 행주치마
    p(-9,-18,2,2,'#f2ece0');   // 짧은 흰 꼬리
    p(1,-24,4,6,'#a98c6c');p(0,-30,9,7,'#a98c6c');p(7,-27,4,3,'#c9b090');p(10,-27,1,1,'#1a1410');p(8,-25,3,1,'#ddd5c8');p(5,-28,1,1,'#1a1410');   // 목, 머리, 주둥이, 코, 눈
    p(-2,-35,3,6,'#a98c6c');p(3,-36,3,6,'#a98c6c');p(-1,-34,1,4,'#d9b8a0');p(4,-35,1,4,'#d9b8a0');   // 큰 귀
    p(-1,-31,9,2,'#f2ece0');p(-2,-30,2,3,'#f2ece0');   // 머릿수건
    p(4,-18,8,2,'#a98c6c');p(12,-27,1,11,'#8a6a3a');p(11,-17,3,2,'#5a5450');   // 팔과 국자
  }else if(kind==='boar'){
    p(-10,-13,18,12,'#9b765c');p(-10,-11,13,2,'#d1b17b');p(-9,-7,12,2,'#d1b17b');p(3,-17,11,12,'#b18a6a');p(3,-21,4,6,'#98745b');p(10,-21,3,6,'#98745b');p(12,-11,6,5,'#c99a81');p(16,-10,1,2,'#60483e');p(9,-15,1,2,'#2d3033');p(-7,-2,3,2,'#55463e');p(4,-2,3,2,'#55463e');p(-14,-10,4,2,'#9b765c');
  }else{
    p(-7,-17,12,14,'#293b44');p(-5,-13,7,10,'#e9e3d1');p(-3,-24,10,9,'#2b3c42');p(5,-21,6,2,'#97794b');p(3,-22,1,1,'#f9e9bb');p(-11,-12,5,18,'#263b49');p(-8,-10,3,12,'#557384');p(-5,-2,2,3,'#5c4c3b');p(2,-2,2,3,'#5c4c3b');p(-5,-16,10,2,'#ad7051');p(6,-12,8,6,'#998267');p(8,-13,4,2,'#d2bd8c');
  }
}
Rg.expArt={drawBack,drawScenery,drawFront,pineVista,innVista,wanderer,elder,lantern,drawWorkLantern,flag,pine,tileRoof};
})();
