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
function flag(x,y,h=64){
  P(x,y-h,3,h,'#69503f');P(x-3,y-h+4,9,2,'#4d382f');P(x+3,y-h+5,23,19,n()?'#8a4745':'#bd5547');P(x+5,y-h+7,18,2,'#deae73');P(x+10,y-h+11,3,8,'#f3ddac');P(x+6,y-h+14,12,2,'#f3ddac');P(x+20,y-h+22,6,3,tone().sky);P(x-6,y-4,16,4,'#807c78');P(x-7,y-5,18,2,tone().snow);
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
    P(x+3,y-17,66,6,'#a37450');for(let j=0;j<6;j++){const c=['#b76743','#ded7c2','#b9914c','#9b594d'][i%4];P(x+6+j*10,y-23-(j%2)*2,7,6,c);P(x+7+j*10,y-24-(j%2)*2,5,1,'#e1bc83');}
    // 손님은 좌판 뒤 작은 실루엣. 길을 가리는 물체로 그리지 않는다.
    P(x+28,y-34,11,15,'#647b79');P(x+30,y-41,8,7,'#92755e');P(x+29,y-44,3,4,'#92755e');P(x+36,y-44,3,4,'#92755e');
  }
  lantern(x+61,y-39,1);
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
  sky(cam);steppedRidge(Math.round(cam*.08),116,22,tone().mount,1);steppedRidge(Math.round(cam*.19),137,15,n()?'#34445a':'#b2c1c9',4);
  farAir(cam);
  distantTown(Math.round(cam*.32),173,1);
  if(id==='pine'){for(let wx=Math.floor(cam/112)*112-112;wx<cam+W+112;wx+=112)pine(wx-cam,GROUND,62+Math.round(hash(wx)*25));}
  snowGround(id);
}
function drawPlatforms(id){
  for(const p of fieldPlatforms()){
    const x=p.x-cam;if(x>W+10||x+p.w<-10)continue;
    if(id==='street'||id==='inn'||id==='entrance'){
      P(x,p.y,p.w,6,tone().wood);P(x,p.y-1,p.w,2,tone().snow);for(let j=5;j<p.w;j+=10)P(x+j,p.y+2,1,4,n()?'#827475':'#c3a079');
      if(p.y<130){P(x-3,p.y-5,p.w+6,4,tone().tile);P(x,p.y-6,p.w,2,tone().snow);}
      else{P(x+4,p.y+6,3,GROUND-p.y-6,tone().wood);P(x+p.w-7,p.y+6,3,GROUND-p.y-6,tone().wood);}
    }else{
      P(x,p.y,p.w,7,n()?'#5d6670':'#9a9c96');P(x+3,p.y+7,p.w-6,5,n()?'#424d57':'#7f847f');P(x,p.y-2,p.w,3,tone().snow);P(x+4,p.y+2,Math.max(3,p.w-11),1,n()?'#75838b':'#b5b9ad');
    }
  }
}
function drawScenery(id){
  const t=tone();
  if(id==='entrance'){
    for(let wx=160,i=0;wx<2800;wx+=175,i++){const x=tx(wx)-cam;if(x<-110||x>W+110)continue;if(i%2===0){const h=32+(i%4)*5;house(x,GROUND-h,72+(i%3)*11,h,n(),undefined,i/2);}else{bundle(x,GROUND,wx);flag(x+38,GROUND,39+i%3*8);}}
    jangseung(tx(125)-cam,GROUND,1);jangseung(tx(242)-cam,GROUND,-1);flag(tx(720)-cam,GROUND,96);
    // 연줄이 낮은 상자에서 처마로 이어져 안전한 첫 오르기를 알린다.
    if(!G.f.jxKiteFreed){const kx=tx(1200)-cam;P(kx-5,89,10,12,'#795444');P(kx-8,92,16,6,'#795444');P(kx-1,88,2,14,'#795444');P(kx-6,93,12,4,'#efe1bb');P(kx-4,90,8,10,'#efe1bb');P(kx-1,90,2,10,'#b75745');P(kx-4,94,8,2,'#bc5946');
      for(let j=0;j<16;j++){const xx=kx-j*4,yy=102+j*2;P(xx,yy,1,2,'#a58f76');}P(kx-8,103,2,12,'#c9604b');P(kx-7,114,4,2,'#c9604b');}
  }else if(id==='street'){
    for(let wx=170,i=0;wx<2800;wx+=185,i++){const x=wx-cam;if(x<-110||x>W+110)continue;stall(x,GROUND,i);if(i%2===0){P(x+100,GROUND-31,4,31,t.wood);lantern(x+102,GROUND-32);}}
    const x=1250-cam;
    // 떡집 안은 높은 마루의 단면으로 보인다. 아궁이와 맷돌 자리까지 한눈에 잇는다.
    P(x,39,280,71,n()?'#9a775c':'#c8aa7d');P(x+8,48,264,56,n()?'#b8996e':'#e2c79b');P(x+8,48,264,3,'#8d6850');
    tileRoof(x-6,23,292,16);P(x+1,43,5,67,t.wood);P(x+274,43,5,67,t.wood);P(x,107,280,5,'#865c40');P(x+2,106,276,2,'#d4ae75');
    for(let j=0;j<6;j++)P(x+18+j*43,51,1,53,'#c2a075');
    P(x+201,79,45,31,'#8c6651');P(x+205,84,37,21,'#4b3a34');P(x+213,95,19,7,'#b35a3e');P(x+217,91,11,9,'#ecaa58');P(x+209,78,32,4,'#b79b78');
    for(let j=0;j<3;j++){P(x+213,68-j*7,26,5,'#a97a51');P(x+211,66-j*7,30,2,'#d2aa70');P(x+215,71-j*7,22,1,'#72513a');}
    P(x+28,94,29,16,'#817b71');P(x+23,91,39,5,'#a39e8d');P(x+26,89,33,3,'#b9b4a0');P(x+41,83,3,7,'#6b5848');
    P(x+35,57,22,26,n()?'#e9c77f':'#efe2bb');P(x+45,57,2,26,'#927552');P(x+35,68,22,2,'#927552');P(x+156,59,28,19,'#d8c49c');P(x+159,62,22,2,'#a47b55');P(x+159,68,15,2,'#a47b55');
    P(x+238,4,10,22,n()?'#625253':'#907565');P(x+236,1,14,4,'#655451');smoke(x+241,-3,2);
    // 낮에 열던 앞 좌판은 접힌다. 옆문과 불빛은 남아 필수 교환을 막지 않는다.
    P(1165-cam,GROUND-43,30,43,'#544338');P(1168-cam,GROUND-40,24,40,n()?'#bb8659':'#e0b47e');P(1178-cam,GROUND-39,1,39,'#805e46');P(1186-cam,GROUND-23,2,3,'#ead0a1');lantern(1159-cam,GROUND-45);
    for(let j=0;j<4;j++){P(x+12+j*65,128,46,64,n()?'#675a54':'#967958');if(n())for(let k=0;k<4;k++)P(x+14+j*65+k*11,130,1,59,'#8d7663');}P(x-3,125,286,5,t.wood);P(x-5,122,290,3,t.snow);
    const ax=2210-cam;P(ax,GROUND-72,5,72,t.wood);P(ax+120,GROUND-72,5,72,t.wood);P(ax,GROUND-74,125,5,t.wood);
    if(!n()){for(let j=0;j<5;j++){P(ax+6+j*23,GROUND-45,21,45,j%2?'#a76650':'#b69572');P(ax+7+j*23,GROUND-46,19,2,t.snow);}}
    else{P(ax+4,GROUND-4,116,3,'#b6b9b4');lantern(ax+12,GROUND-61);lantern(ax+111,GROUND-61);}
  }else if(id==='inn'){
    for(let wx=100,i=0;wx<2800;wx+=165,i++){const x=wx-cam;if(x<-110||x>W+110)continue;if(wx<650||wx>1450){const h=34+i%3*7;house(x,GROUND-h,76+i%4*8,h,n(),undefined,i);bundle(x+113,GROUND,wx);}}
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
    for(let wx=120,i=0;wx<2800;wx+=190,i++){const x=tx(wx)-cam;if(x<-130||x>W+130)continue;const w=95+i%3*9,h=42+i%3*7;house(x,GROUND-h,w,h,false,undefined,i);P(x+12,GROUND-36,w-24,33,n()?'#51464a':'#8c6c51');for(let j=0;j<(w-24)/11;j++)P(x+15+j*11,GROUND-34,1,29,t.wood);bundle(x+138,GROUND,i);}
    const x=tx(2320)-cam;house(x-64,GROUND-60,128,60,false);P(x-22,GROUND-42,44,42,'#2c2c35');P(x-1,GROUND-42,2,42,'#776154');P(x-8,GROUND-24,16,3,'#b19c73');
    if(n()&&!G.boss.dead){P(x-18,GROUND-29,3,3,'#89cbd3');P(x+13,GROUND-36,4,4,'#acdce0');P(x-16,GROUND-25,1,2,'#d7e7d7');}
    if(G.boss.dead){bundle(x-44,GROUND,1);bundle(x+43,GROUND,0);P(x+48,GROUND-19,1,15,'#bfa172');P(x+45,GROUND-7,7,5,'#ad8b54');}
  }
  drawPlatforms(id);
  // 조사 글의 대상은 실제 생활 물건으로도 알아볼 수 있게 둔다.
  if(id==='entrance'){
    const x=tx(240)-cam;P(x-6,GROUND-14,12,8,'#ac8b62');P(x-2,GROUND-18,4,8,'#d1b184');P(x-7,GROUND-15,6,3,'#ccbe95');P(x+1,GROUND-18,6,3,'#ccbe95');
    if(!Rg.springRevisit()){const sx=tx(1680)-cam;P(sx-10,GROUND-11,20,11,t.snow);P(sx-7,GROUND-19,14,10,t.snow);P(sx-4,GROUND-18,1,1,'#4c4843');P(sx+3,GROUND-18,1,1,'#4c4843');P(sx,GROUND-14,7,2,'#aa7251');}
  }else if(id==='street'){
    const x=1150-cam;P(x-7,GROUND-11,15,11,'#9a8267');P(x-5,GROUND-14,11,4,'#e4dbbb');P(x-3,GROUND-16,7,3,'#f3eee1');P(x-5,GROUND-7,11,1,'#c4aa7e');
    const yx=2130-cam;P(yx-16,GROUND-10,32,9,'#7d624b');P(yx-14,GROUND-12,28,2,'#cbb184');for(let j=0;j<4;j++)P(yx-10+j*6,GROUND-16+j%2,4,3,'#dfc898');
  }else if(id==='inn'){
    const x=350-cam;P(x-9,GROUND-5,8,4,'#77796b');P(x+2,GROUND-5,8,4,'#77796b');P(x-8,GROUND-7,5,3,'#bdb8a1');P(x+3,GROUND-7,5,3,'#bdb8a1');
  }else if(id==='pine'){
    const x=1870-cam;for(let j=0;j<7;j++){P(x-12+j*4,GROUND-2-j%2,4,1,'#9b8357');P(x-10+j*4,GROUND-3,1,3,'#78684c');}
    const sx=2280-cam;P(sx-3,122,6,5,'#b9aa89');P(sx-5,124,10,2,'#786e58');
  }else if(id==='warehouse'){
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
function wanderer(kind,x,y,f=1){
  x=Math.round(x);y=Math.round(y);const p=(a,b,w,h,c)=>M(x,y,f,a,b,w,h,c);
  if(kind==='kite'){
    p(-5,-16,11,14,'#a8a197');p(-5,-25,11,11,'#d5c9b6');p(-4,-38,3,15,'#d5c9b6');p(3,-36,3,12,'#d5c9b6');p(-3,-35,1,9,'#c7988e');p(4,-34,1,8,'#c7988e');p(3,-23,1,2,'#322c30');p(5,-19,3,2,'#b87f72');p(-6,-16,13,4,'#b44d48');p(-5,-2,4,2,'#77706a');p(2,-2,4,2,'#77706a');p(7,-14,7,2,'#c9b397');p(13,-15,3,5,'#87694e');
  }else if(kind==='yut'){
    for(let q=-1;q<=1;q+=2){const ox=x+q*19;M(ox,y,-q,-7,-14,14,13,'#777b75');M(ox,y,-q,-6,-22,13,10,'#b6b1a0');M(ox,y,-q,-7,-25,4,5,'#605b53');M(ox,y,-q,3,-25,4,5,'#605b53');M(ox,y,-q,-5,-21,3,6,'#3b3a37');M(ox,y,-q,2,-21,3,6,'#3b3a37');M(ox,y,-q,-3,-18,1,1,'#eee4cd');M(ox,y,-q,3,-18,1,1,'#eee4cd');M(ox,y,-q,-4,-14,9,3,q===-1?'#a46b54':'#8a7761');}
    P(x-14,y-3,28,3,'#d1b991');P(x-11,y-6,8,2,'#9d6d43');P(x+1,y-6,8,2,'#9d6d43');P(x-8,y-9,8,2,'#bc925e');P(x+2,y-9,8,2,'#bc925e');
  }else if(kind==='boar'){
    p(-10,-13,18,12,'#9b765c');p(-10,-11,13,2,'#d1b17b');p(-9,-7,12,2,'#d1b17b');p(3,-17,11,12,'#b18a6a');p(3,-21,4,6,'#98745b');p(10,-21,3,6,'#98745b');p(12,-11,6,5,'#c99a81');p(16,-10,1,2,'#60483e');p(9,-15,1,2,'#2d3033');p(-7,-2,3,2,'#55463e');p(4,-2,3,2,'#55463e');p(-14,-10,4,2,'#9b765c');
  }else{
    p(-7,-17,12,14,'#293b44');p(-5,-13,7,10,'#e9e3d1');p(-3,-24,10,9,'#2b3c42');p(5,-21,6,2,'#97794b');p(3,-22,1,1,'#f9e9bb');p(-11,-12,5,18,'#263b49');p(-8,-10,3,12,'#557384');p(-5,-2,2,3,'#5c4c3b');p(2,-2,2,3,'#5c4c3b');p(-5,-16,10,2,'#ad7051');p(6,-12,8,6,'#998267');p(8,-13,4,2,'#d2bd8c');
  }
}
Rg.expArt={drawBack,drawScenery,drawFront,pineVista,innVista,wanderer,lantern,drawWorkLantern,flag,pine,tileRoof};
})();
