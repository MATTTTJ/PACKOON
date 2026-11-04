'use strict';
/* 큰 장터 동물들의 도트 그림과 소품. (ox, oy)는 발밑, f 는 바라보는 방향 */
(()=>{
const Rg=REGIONS.jangteo;
Rg.springRevisit=()=>!CLASSIC&&!!G?.f?.spring&&regionCompleted('yeongsan');
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
function sky(offset=0){
  const t=tone();P(0,0,W,H,t.sky);
  const bands=n()?['#17213b','#1b2844','#24334e','#344259']:Rg.springRevisit()?['#dce8df','#e2eadb','#e9edda','#f1eee2']:['#dce8ef','#e2eaed','#e9edec','#f1eee2'];
  bands.forEach((c,i)=>P(0,35+i*30,W,31,c));
  if(n()){
    for(let i=0;i<61;i++){const x=((Math.round(hash(i*9.3)*1200-offset*.02)%W)+W)%W,y=8+Math.round(hash(i*3.7)*81);P(x,y,1,i%11===0?2:1,i%7?'#9eaec4':'#fff0c0');}
    P(312,21,3,11,'#f5e8be');P(309,24,3,6,'#f5e8be');P(312,23,2,7,'#17213b');
  }else{
    P(295,23,18,14,'#faf5df');P(298,20,12,20,'#faf5df');
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
function jangseung(x,y,f){
  P(x-5,y-55,10,55,'#987752');P(x-6,y-58,12,6,'#806143');P(x-4,y-52,8,1,'#d0ad79');
  P(x-3,y-43,2,3,'#3c3130');P(x+1,y-43,2,3,'#3c3130');P(x-2,y-36,5,2,'#3c3130');P(x,y-39,2,4,'#6c4b37');
  for(let j=0;j<3;j++)P(x-2+(j%2),y-25+j*7,4,2,'#5e4233');P(x-4,y-59,8,2,tone().snow);
  P(x+f*12,y-34,19,2,'#7d6650');
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
function drawBack(id){
  sky(RC());steppedRidge(Math.round(RC()*.08),116,22,tone().mount,1);steppedRidge(Math.round(RC()*.19),137,15,n()?'#34445a':'#b2c1c9',4);
  farAir(RC());
  distantTown(Math.round(RC()*.32),173,1);
  if(id==='pine'){for(let wx=Math.floor(cam/112)*112-112;wx<cam+W+112;wx+=112)pine(wx-cam,GROUND,62+Math.round(hash(wx)*25));}
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
      else{P(x+4,p.y+6,3,GROUND-p.y-6,t.wood);P(x+p.w-7,p.y+6,3,GROUND-p.y-6,t.wood);}
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
    const zw=zoneDef().w,busy=[[95,275],[550,630],[1170,1240],...fieldPlatforms().map(p=>[p.x-14,p.x+p.w+14])];
    for(const {rx,i,w} of rowSlots(zw,150,150,i=>i%2?58:72+(i%3)*11,busy)){const x=rx-RC();if(x<-110||x>W+110)continue;
      if(i%2===0){const h=32+(i%4)*5;house(x,GROUND-h,w,h,n(),undefined,i/2);}else{bundle(x+6,GROUND,rx);marketProp(x+38,GROUND,i>>1);}}
    jangseung(tx(125)-cam,GROUND,1);jangseung(tx(242)-cam,GROUND,-1);flag(tx(720)-cam,GROUND,96);
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
    for(let wx=120;wx<2800;wx+=145){const x=wx-cam;if(x<-80||x>W+80)continue;pine(x,GROUND,72+Math.round(hash(wx)*32));if(wx%2===0)bundle(x+39,GROUND,wx);}
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
    if(!Rg.springRevisit()){const sx=trimX(1680,REG.trimCuts?.entrance)-RC();P(sx-10,GROUND-11,20,11,t.snow);P(sx-7,GROUND-19,14,10,t.snow);P(sx-4,GROUND-18,1,1,'#4c4843');P(sx+3,GROUND-18,1,1,'#4c4843');P(sx,GROUND-14,7,2,'#aa7251');}
  }else if(id==='street'){
    const x=1150-cam;P(x-7,GROUND-11,15,11,'#9a8267');P(x-5,GROUND-14,11,4,'#e4dbbb');P(x-3,GROUND-16,7,3,'#f3eee1');P(x-5,GROUND-7,11,1,'#c4aa7e');
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
    const x=350-cam;P(x-9,GROUND-5,8,4,'#77796b');P(x+2,GROUND-5,8,4,'#77796b');P(x-8,GROUND-7,5,3,'#bdb8a1');P(x+3,GROUND-7,5,3,'#bdb8a1');
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
    {const fx=1780-cam;for(let j=0;j<5;j++)P(fx-12+j*5,GROUND-4,5,4,'#6b6460');P(fx-9,GROUND-6,18,3,'#3a3430');P(fx-6,GROUND-8,4,2,n()?'#ff9a3a':'#c9604b');P(fx+1,GROUND-7,3,2,n()?'#ffcf70':'#8a4a2a');
      if(n())P(fx-14,GROUND-20,28,18,'rgba(255,160,70,.10)');P(fx+14,GROUND-12,10,10,'#8a6448');P(fx+15,GROUND-13,8,2,'#a17a52');}   // 짐꾼이 걸터앉던 짐짝
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
/* 투호 노인 한 사람 (결정 D-325). f는 바라보는 쪽. 흰눈썹은 눈 위에 흰 눈썹, 곰방대는 입에 문 곰방대로 가른다.
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
// 얼레(실 감는 틀)를 쥔 손. 줄은 여기서 나간다
function kiteReel(hx,hy){P(hx-2,hy-3,5,6,'#87694e');P(hx-1,hy-2,3,4,'#d8c7a3');P(hx-3,hy-1,7,1,'#6c5139');P(hx,hy+3,1,3,'#6c5139');}
/* 필드의 연 장면. (x,y)는 얼레 발밑 화면 좌표, f 는 얼레가 바라보는 쪽 */
function kiteScene(x,y,f){
  const F=G.f,t=kiteNow(),g=kiteGust(t),hx=x+f*13,hy=y-14;kiteReel(hx,hy);
  if(!F.jxKiteFreed){
    // 처마 못에 걸림: 꼬리가 못에 감기고 연은 거꾸로 매달려 흔들린다
    const nx=tx(1223)-cam,ny=98,sw=Vfx.reducedMotion?0.2:Math.sin(t*2.1)*0.35+g*0.25;
    P(nx-1,ny-2,2,3,'#3a3330');
    const kx=nx+Math.sin(sw)*13,ky=ny+Math.cos(sw)*13;
    for(let i=0;i<6;i++){const u=i/6;P(nx+(kx-nx)*u+(Vfx.reducedMotion?0:Math.sin(t*6+i)*0.8),ny+(ky-6-ny)*u,2,2,i%4<2?KITE.tail1:KITE.tail2);}
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
  stuck(){return {animate:true,sound:'pic_kite',draw(w,h,t){   // 결정 D-483
    kiteSky(w,h);kiteEave(w);const g=kiteGust(t),rm=Vfx.reducedMotion;
    const nx=36,ny=11,sw=rm?0.3:Math.sin(t*2.1)*0.45+g*0.3;R(nx-1,ny-1,2,3,'#2e2826');
    const kx=nx+Math.sin(sw)*14,ky=ny+Math.cos(sw)*14;
    for(let i=0;i<7;i++){const u=i/7;R(Math.round(nx+(kx-nx)*u+(rm?0:Math.sin(t*6+i)*0.8)),Math.round(ny+(ky-7-ny)*u),2,2,i%4<2?KITE.tail1:KITE.tail2);}
    kitePaper(kx,ky,Math.PI+sw*0.8,1.45,{torn:true});
    kiteLine(kx,ky+4,-2,h+2,8);kiteFlakes(w,h,t);
  }};},
  // 너구리 손이 못에서 꼬리를 풀자 연이 줄에 끌려 얼레 쪽(왼쪽 아래)으로 흔들리며 내려간다
  free(){let t0=null;return {animate:true,sound:'pic_kite',draw(w,h,t){
    if(t0===null)t0=t;const k=Vfx.reducedMotion?1.2:Math.min(2.6,t-t0);
    kiteSky(w,h);kiteEave(w);R(35,10,2,3,'#2e2826');
    const reach=Math.min(1,k/0.5),lift=Math.max(0,Math.min(1,(k-0.5)/0.3)),fall=Math.max(0,(k-0.8)/1.4);
    // 너구리 팔 (오른쪽 위 처마 너머에서 뻗어 온다). 회색 털 팔, 검은 손, 앞으로 내민 손가락
    const px=Math.round(56-reach*17),py=Math.round(6+reach*4-lift*3);
    for(let i=0;i<5;i++)R(px+4+i*3,py-3-i*2,5,4,i%2?'#7d7163':'#8c8070');   // 팔 (어깨 쪽으로 비스듬히)
    R(px+1,py-2,6,5,'#3b332e');R(px,py-1,1,3,'#3b332e');R(px-2,py,2,1,'#2a2420');R(px-2,py+2,2,1,'#2a2420');R(px+2,py+3,1,1,'#2a2420');   // 손과 손가락
    R(px+3,py-1,2,1,'#5a5049');
    let kx=36,ky=25,ang=Math.PI;
    if(fall>0){const e=Math.min(1,fall);kx=36-e*30+Math.sin(fall*5)*4*(1-e*0.5);ky=25+e*26;ang=Math.PI*(1-e)+Math.sin(fall*5)*0.5;}
    if(fall<0.05)for(let i=0;i<6;i++)R(36+(i%2),Math.round(11+i*1.6-lift*2),2,2,i%4<2?KITE.tail1:KITE.tail2);
    else kiteTail(kx,ky-6,t,8,0.6,-1);
    kitePaper(kx,ky,ang,1.45,{torn:true});kiteLine(kx,ky,-2,h+2,Math.max(2,10-fall*6));kiteFlakes(w,h,t,6);
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
    // 결정 D-325: 둘 사이에 투호 항아리와 꽂힌 화살 (예전엔 윷판)
    P(x-14,y-2,28,2,'#d1b991');P(x-4,y-10,8,8,'#5d6a6b');P(x-5,y-8,10,4,'#5d6a6b');P(x-3,y-9,2,4,'#7d8b8a');P(x-1,y-15,3,5,'#5d6a6b');P(x-2,y-16,5,1,'#3f4a4b');P(x-3,y-14,1,2,'#5d6a6b');P(x+3,y-14,1,2,'#5d6a6b');
    P(x,y-22,1,7,'#6b4a2c');P(x,y-23,1,2,'#b54a34');P(x+2,y-20,1,5,'#6b4a2c');P(x+2,y-21,1,2,'#416c82');
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
  }else if(kind==='boar'){
    p(-10,-13,18,12,'#9b765c');p(-10,-11,13,2,'#d1b17b');p(-9,-7,12,2,'#d1b17b');p(3,-17,11,12,'#b18a6a');p(3,-21,4,6,'#98745b');p(10,-21,3,6,'#98745b');p(12,-11,6,5,'#c99a81');p(16,-10,1,2,'#60483e');p(9,-15,1,2,'#2d3033');p(-7,-2,3,2,'#55463e');p(4,-2,3,2,'#55463e');p(-14,-10,4,2,'#9b765c');
  }else{
    p(-7,-17,12,14,'#293b44');p(-5,-13,7,10,'#e9e3d1');p(-3,-24,10,9,'#2b3c42');p(5,-21,6,2,'#97794b');p(3,-22,1,1,'#f9e9bb');p(-11,-12,5,18,'#263b49');p(-8,-10,3,12,'#557384');p(-5,-2,2,3,'#5c4c3b');p(2,-2,2,3,'#5c4c3b');p(-5,-16,10,2,'#ad7051');p(6,-12,8,6,'#998267');p(8,-13,4,2,'#d2bd8c');
  }
}
Rg.expArt={drawBack,drawScenery,drawFront,pineVista,innVista,wanderer,elder,lantern,drawWorkLantern,flag,pine,tileRoof};
})();
