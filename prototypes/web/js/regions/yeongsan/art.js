'use strict';
/* 북쪽 영산 동물들의 도트 그림과 소품. (ox, oy)는 발밑, f 는 바라보는 방향 */
(()=>{
const Rg=REGIONS.yeongsan;
Rg.art={
  /* 살금이: 고라니. 뿔이 없고 작은 송곳니가 있다 */
  deer(ox,oy,f){const Br='#a8865a',Dk='#7a5e3a',Lt='#e6d4b4',K='#1a1410';
    const s=G.salg||{},field=ctx.canvas===cv,warn=field&&s.phase==='warn'&&!G.f.salgDone;
    const arcDone=Rg.arcsEnabled()&&G.f.salgDone;
    const alert=arcDone?!G.f.yArcsSalg3:!field||(!G.f.salgDone&&(Rg.salgAlert()||s.startle>0));const dn=alert?0:warn?3:5;
    M(ox,oy,f,-10,-16,16,8,Br);M(ox,oy,f,-9,-9,2,9,Dk);M(ox,oy,f,-5,-9,2,9,Dk);M(ox,oy,f,1,-9,2,9,Dk);M(ox,oy,f,4,-9,2,9,Dk);M(ox,oy,f,-8,-12,12,3,Lt);
    M(ox,oy,f,4,-22+dn,4,8,Br);M(ox,oy,f,6,-25+dn,7,5,Br);M(ox,oy,f,11,-23+dn,2,2,K);M(ox,oy,f,8,-24+dn,1,1,K);M(ox,oy,f,11,-21+dn,1,2,'#f4f0e8');
    if(alert){M(ox,oy,f,5,-30,2,5,Br);M(ox,oy,f,8,-30,2,5,Br);M(ox,oy,f,5,-29,1,3,'#e6b4a0');}else{
      const twitch=warn&&Math.floor(s.timer/5)%2?2:0;
      M(ox,oy,f,4,-22-twitch,3,2+twitch,Br);M(ox,oy,f,7,-21,3,2,Br);}
    M(ox,oy,f,-11,-16-(warn&&s.timer>20?Math.floor(s.timer/4)%2*2:0),2,3,'#f4f0e8');
    if(field&&!G.f.salgDone&&Math.abs(s.x-G.px)<TABLES.MINIGAMES.salg_active_distance){
      if(!warn&&!alert){M(ox,oy,f,11,-16,3,1,'#9ab870');if(s.tick%28<14)M(ox,oy,f,12,-14,2,1,'#9ab870');}
      if(warn||alert){const left=warn?s.timer/TABLES.MINIGAMES.salg_warning_frames:1-(s.risk||0)/TABLES.MINIGAMES.salg_risk_limit;
        R(ox-13,oy-39,26,5,'#302c3e');R(ox-12,oy-38,Math.ceil(24*left),3,warn?'#e8c88a':s.risk?'#e6a082':'#b4d4cc');
        // 귀가 서기 전에는 시간이, 선 뒤에는 발소리를 참을 여유가 줄어든다.
        R(ox+11,oy-46,1,4,'#f4e8c8');R(ox+11,oy-41,1,1,'#f4e8c8');}
    }},
  /* 아빠: 말을 잃었다. 모자는 아들이 쓰고 있어서 목도리만 둘렀다 */
  dad(ox,oy,f){const Gy='#7c7062',K='#2a211b',Wt='#efe6d6',T='#6f6357',Sc='#b4432a';
    const p=Rg.dadPose||{},t=p.tick||0,a=p.act;
    const hx=ox+(['retry','mouth'].includes(a)?Math.round(Math.sin(t*.15)*2):0),hy=oy+(['nod','heart'].includes(a)?Math.round((1-Math.cos(t*.12))):0);
    M(ox,oy,f,-14,-10,8,5,T);M(ox,oy,f,-13,-10,1,5,K);M(ox,oy,f,-9,-10,1,5,K);
    M(ox,oy,f,-5,-15,11,11,Gy);M(ox,oy,f,-1,-13,5,8,'#cfc3b2');
    M(hx,hy,f,-4,-24,12,10,Gy);M(hx,hy,f,-3,-20,11,2,K);M(hx,hy,f,5,-20,1,1,'#ffffff');M(hx,hy,f,-3,-18,10,2,Wt);M(hx,hy,f,8,-19,1,2,K);
    M(hx,hy,f,-4,-26,3,3,Gy);M(hx,hy,f,5,-26,3,3,Gy);
    M(ox,oy,f,-5,-15,12,3,Sc);M(ox,oy,f,-6,-12,3,6,Sc);
    M(ox,oy,f,-4,-4,4,4,K);M(ox,oy,f,2,-4,4,4,K);
    if(a==='mouth'){M(ox,oy,f,5,-17,3,3,Wt);M(ox,oy,f,5,-14,2,4,Gy);}
    if(a==='cradle'||a==='heart'){
      const sway=a==='cradle'?Math.round(Math.sin(t*.07)):0;
      M(ox+sway,oy,f,-5,-11,4,3,Wt);M(ox+sway,oy,f,5,-11,4,3,Wt);M(ox+sway,oy,f,-1,-9,7,2,Wt);
      if(a==='heart')M(ox,oy,f,2,-14,3,3,Wt);
    }
    if(a==='paper'||a==='offer'){const reach=a==='offer'?2:0;
      M(ox,oy,f,1+reach,-14,8,7,'#e6dcc0');M(ox,oy,f,3+reach,-12,4,1,T);M(ox,oy,f,3+reach,-10,3,1,T);
      M(ox,oy,f,-1+reach,-9,3,2,Wt);M(ox,oy,f,8+reach,-9,2,2,Wt);
    }
    if(a==='retry'||a==='nod')M(ox,oy,f,7,-12,3,2,Wt);},
  /* 산군 할아버지: 호랑이. 느리고 크다 */
  tiger(ox,oy,f){const Or='#d9893a',Dk='#2a1a10',Wt='#f4ecdc',K='#0e0a08';
    M(ox,oy,f,-18,-18,28,14,Or);for(let i=0;i<5;i++)M(ox,oy,f,-15+i*6,-18,2,7,Dk);M(ox,oy,f,-14,-8,22,3,Wt);
    M(ox,oy,f,-16,-6,4,6,Or);M(ox,oy,f,-8,-6,4,6,Or);M(ox,oy,f,0,-6,4,6,Or);M(ox,oy,f,6,-6,4,6,Or);
    M(ox,oy,f,-24,-20,7,3,Or);M(ox,oy,f,-26,-23,3,4,Or);M(ox,oy,f,-26,-23,3,1,Dk);
    M(ox,oy,f,6,-30,14,13,Or);M(ox,oy,f,6,-33,4,4,Or);M(ox,oy,f,16,-33,4,4,Or);M(ox,oy,f,7,-32,2,2,Dk);M(ox,oy,f,17,-32,2,2,Dk);
    M(ox,oy,f,9,-25,10,8,Wt);M(ox,oy,f,9,-27,2,2,'#e8c040');M(ox,oy,f,16,-27,2,2,'#e8c040');M(ox,oy,f,10,-26,1,1,K);M(ox,oy,f,17,-26,1,1,K);
    M(ox,oy,f,13,-22,3,2,K);M(ox,oy,f,8,-29,1,3,Dk);M(ox,oy,f,18,-29,1,3,Dk);M(ox,oy,f,12,-31,4,1,Dk);
    M(ox,oy,f,20,-22,4,1,'#f4f4f4');M(ox,oy,f,20,-20,4,1,'#f4f4f4');},
};
Rg.props={
  /* 날쌘의 산막 */
  hut(n){const x=n.x-cam;R(x-50,GROUND-30,46,30,'#6b5038');R(x-56,GROUND-40,58,11,'#4a3424');R(x-56,GROUND-42,58,3,'#f4f6f8');
    R(x-36,GROUND-20,14,20,'#2a1a10');R(x-34,GROUND-18,10,6,'#ffb050');R(x-12,GROUND-48,5,12,'#5a4a3a');
    for(let i=0;i<3;i++){const k=(G.anim*0.5+i*26)%70;R(x-12+Math.sin((G.anim+i*30)*0.05)*3,GROUND-52-k,4,3,'rgba(230,230,240,'+(0.6-k/120).toFixed(2)+')');}
    COMMON_ART.nalProps({x:n.x});},
};
})();

/* PA-43: 눈길에서 보던 능선과 신목을 실제로 걷는다. 옛 지도 그림은 위에 남긴다. */
(()=>{
if(CLASSIC)return;
const Rg=REGIONS.yeongsan, A={};
const pink=()=>!!G.f.spring;
const C={night:'#151e38',blue:'#273858',snow:'#e1e9ef',ice:'#9bbbd0',bark:'#54473e',rose:'#edb8cc'};
const px=(x,y,w,h,c)=>R(Math.round(x),Math.round(y),Math.round(w),Math.round(h),c);
function mountains(camera,base,height,col,seed){
  for(let x=-2;x<W+2;x+=2){
    const u=x+camera+seed,y=base-Math.abs(Math.sin(u*.009))*height-Math.abs(Math.sin(u*.0037))*height*.42;
    px(x,y,2,H-y,col);
  }
}
function pine(x,y,size=1,snow=true){
  const s=size;px(x-2*s,y-43*s,4*s,43*s,'#384a4d');
  for(let i=0;i<4;i++){
    const w=(8+i*5)*s,cy=y-52*s+i*11*s;
    px(x-w,cy,w*2,6*s,'#3b5361');px(x-w+3*s,cy-3*s,w*2-6*s,3*s,snow?'#cadce8':'#7b9a85');
  }
}
function rowan(x,y){
  px(x-2,y-48,4,48,C.bark);px(x-22,y-37,22,2,C.bark);px(x,y-45,24,2,C.bark);
  for(let i=0;i<5;i++){
    const bx=x-22+i*10,by=y-38-(i%2)*8;
    px(bx,by-2,7,2,pink()?'#89a386':C.snow);px(bx+1,by+1,3,3,'#ce6058');px(bx+4,by+3,3,3,'#b84c4b');
  }
}
function rock(x,y,w=28,h=18){
  px(x-w/2,y-h,w,h,'#637787');px(x-w/2+3,y-h-3,w-6,4,pink()?'#a5b7a8':'#eef3f5');
  px(x-w/2+5,y-h+7,7,2,'#8a9da7');px(x+w/2-9,y-5,5,2,'#526b80');
}
function hut(x,y){
  px(x-42,y-38,84,38,'#665147');px(x-48,y-47,96,10,'#3e3d42');
  px(x-43,y-51,86,4,'#e5edf1');px(x-36,y-55,72,4,'#eef3f5');
  for(let i=0;i<5;i++)px(x-38+i*16,y-33,2,32,'#4d403b');
  px(x-9,y-29,18,29,'#2e303a');px(x-7,y-26,14,10,'#c78b52');px(x-5,y-24,10,6,'#efd19b');
  px(x+22,y-29,12,12,'#d6b277');px(x+27,y-29,2,12,'#54473e');px(x+22,y-24,12,2,'#54473e');
  px(x-32,y-65,8,17,'#5a4b43');px(x-34,y-67,12,3,'#e1e9ef');
  for(let i=0;i<3;i++)px(x-31+i*3,y-76-i*12,6+i*2,3,'#8a9bab');
  px(x+46,y-10,23,9,'#b6a073');px(x+47,y-12,21,2,'#e2e6e9');
}
function sign(x,y){
  px(x-2,y-33,4,33,'#776354');px(x-19,y-36,37,9,'#b4aa94');px(x-22,y-39,41,3,'#e9eef1');
  px(x-12,y-32,17,1,'#5c5a58');px(x+4,y-34,4,4,'#5c5a58');
}
function boat(x,y){
  px(x-26,y-7,52,5,'#665248');px(x-22,y-2,44,5,'#90715a');px(x-16,y+3,32,3,'#574b47');
  px(x-17,y-8,34,2,'#bd9c72');px(x+11,y-26,3,21,'#8c765b');px(x+6,y-28,14,3,'#b99a70');
  px(x-2,y-4,3,8,'#b9a383');
}
function sacredTree(x,y,bloom){
  px(x-14,y-106,28,106,'#66514b');px(x-10,y-132,18,35,'#66514b');
  px(x-36,y-133,28,10,'#66514b');px(x+7,y-146,40,10,'#66514b');
  px(x-49,y-156,14,29,'#66514b');px(x+37,y-170,12,30,'#66514b');
  px(x-21,y-172,10,42,'#66514b');px(x+4,y-184,9,54,'#66514b');
  px(x-8,y-104,4,83,'#937367');px(x+4,y-79,3,59,'#473e40');
  px(x-33,y-8,66,5,'#baaa7d');px(x-40,y-4,80,4,'#d6c697');
  for(let i=0;i<7;i++){px(x-32+i*11,y-16,8,2,'#d9c8a0');px(x-30+i*11,y-14,2,7,'#f7ead8');}
  if(bloom){
    const b=[[-78,-172,66,25],[-39,-188,76,30],[15,-177,78,30],[-64,-143,59,22],[15,-148,65,24],[-10,-159,49,23]];
    for(const [bx,by,bw,bh] of b){
      px(x+bx+8,y+by,bw-16,bh,'#d88faa');px(x+bx,y+by+6,bw,bh-13,'#d88faa');
      px(x+bx+4,y+by+3,bw-8,bh-7,'#efb1c9');
      for(let j=0;j<bw-9;j+=8){
        const bump=Math.floor(hash(j+by)*5);
        px(x+bx+j+5,y+by-2+bump,8,5,'#f8cddd');
        px(x+bx+j+7,y+by+7+Math.floor(hash(j*8+bx)*12),3,2,'#ffe4ed');
        px(x+bx+j+4,y+by+bh-5,5,3,'#dfa0ba');
      }
    }
  }else{
    px(x-39,y-136,32,3,'#e6edf1');px(x+6,y-149,43,3,'#e6edf1');px(x-14,y-134,20,2,'#e6edf1');
  }
  for(let i=0;i<5;i++)px(x-40+i*19,y-1,11,3,'#756452');
}
function sky(camera=0,bloom=pink()){
  for(let y=0;y<H;y+=4){
    const band=Math.floor(y/40),cols=bloom?['#ecd5df','#efd8e2','#f2dce5','#f5dce5','#e6c9d7','#bbbac6']:['#141c34','#1c2845','#293a59','#3a4a67','#4b5f79','#8b9cae'];
    px(0,y,W,4,cols[Math.min(band,5)]);
  }
  if(!bloom){
    for(let i=0;i<100;i++){
      const x=((Math.round(hash(i*13.7)*560-camera*.18)%560)+560)%560-60,y=Math.round(hash(i*7.13)*116);
      px(x,y,i%19===0?2:1,1,i%11===0?'#fff0c8':'#aebfdc');
      if(i%19===0)px(x,y-1,1,3,'#d2ddef');
    }
    px(320-Math.round(camera*.03),24,12,12,'#d9e0dd');px(317-Math.round(camera*.03),22,12,12,'#1c2845');
  }else{
    px(300-Math.round(camera*.03),29,21,14,'#fff3e4');px(304-Math.round(camera*.03),25,13,22,'#fff3e4');
    for(let i=0;i<9;i++)px(i*51-((camera*.05)%51),64+i%3*8,38,2,'#f9e7ed');
  }
}
function ground(zone){
  const lake=zone==='shore'||zone==='island';
  if(lake){
    px(0,157,W,GROUND-157,pink()?'#739cae':'#abc5d6');
    for(let i=0;i<18;i++)px(i*29-(cam*.1)%29,163+i%4*6,17,1,pink()?'#bfd9dc':'#d6e8ed');
  }
  // 횡스크롤 바닥은 마른 해안이나 섬의 흙이다. 물길은 그 너머와 둑 아래에 둔다.
  px(0,GROUND,W,H-GROUND,pink()?'#8a9085':'#b8c7d6');
  px(0,GROUND,W,3,pink()?'#adbc99':'#f0f5f5');
  if(lake){px(0,GROUND+17,W,H-GROUND-17,pink()?'#739cae':'#abc5d6');px(0,GROUND+16,W,1,pink()?'#647f7b':'#8ca3b6');}
  for(let i=0;i<60;i++){
    const wx=Math.floor(cam/7)*7+i*7,x=wx-cam,r=hash(wx+8);
    if(lake){
      px(x,GROUND+20+Math.floor(r*6),pink()?8:17,1,pink()?'#b2ced8':'#d6e8ed');
      if(r>.6){px(x,GROUND+5,4,2,pink()?'#607969':'#8c9eac');px(x+2,GROUND-4,1,5,pink()?'#8d9d74':'#b4a78a');}
    }
    else if(r>.65)px(x,GROUND+5+Math.floor(r*20),3,1,pink()?'#65796a':'#93abc1');
  }
}
A.back=zone=>{
  sky(Math.round(cam*.1));
  mountains(Math.round(cam*.07),118,36,pink()?'#c9a6bd':'#384b68',34);
  mountains(Math.round(cam*.17),151,38,pink()?'#ad99b4':'#506783',109);
  mountains(Math.round(cam*.28),179,22,pink()?'#8797a3':'#748fa5',384);
  ground(zone);
};
A.scenery=zone=>{
  for(let wx=120;wx<2600;wx+=230){
    const x=wx-cam;if(x<-100||x>W+100)continue;
    if(zone==='shelter'){
      if(wx%460<200){pine(x,GROUND,.85,!pink());rock(x+56,GROUND,36,14);}
      else{rowan(x,GROUND);px(x+40,GROUND-6,28,6,'#8d7761');px(x+42,GROUND-9,24,3,'#dae4e9');}
    }else if(zone==='snow'){
      pine(x,GROUND,1,!pink());
      if(!pink()){
        const opened=(G.f.ySnowTrail||0)>wx;px(x+48,GROUND-(opened?10:29),75,opened?10:29,'#dbe7ee');
        px(x+51,GROUND-(opened?10:29),69,3,'#eff5f6');
        if(opened)for(let i=0;i<4;i++)px(x+53+i*17,GROUND-3,6,2,'#92adc4');
      }else{px(x+48,GROUND-3,63,3,'#859b88');for(let i=0;i<5;i++)px(x+50+i*12,GROUND-5,2,2,'#e5a9c3');}
    }else if(zone==='slope'){
      rock(x,GROUND,68,32);px(x+29,GROUND-65,22,65,pink()?'#9ba99c':'#a5c4d7');
      px(x+31,GROUND-66,18,3,'#e1edf1');
      if(G.f.shortcut)for(let i=0;i<4;i++)px(x+30+i*4,GROUND-10-i*12,8,3,'#6f6b5b');
      rowan(x+93,GROUND);
    }else{
      if(wx<650||wx>2040){rock(x,GROUND,45,15);if(wx%460<200)pine(x+28,GROUND,.8,!pink());}
      else{px(x,GROUND-3,44,3,pink()?'#9ebfc9':'#e4f0f4');if(!pink()){px(x+10,GROUND+3,2,14,'#8daabc');px(x+10,GROUND+16,13,1,'#8daabc');}}
    }
  }
  if(zone==='shelter'){
    hut(260-cam,GROUND);sign(2200-cam,GROUND);
    // 높은 대피소 별채는 오래된 문설주만 남았다. 도장을 찾는 위치와 맞춘다.
    const post=1040-cam;px(post-19,108-38,5,38,'#7b6a59');px(post+15,108-38,5,38,'#7b6a59');
    px(post-23,108-42,47,5,'#d9e4eb');px(post-18,108-35,4,11,'#b7a68f');
    px(1630-cam,GROUND-17,80,17,'#667a86');px(1627-cam,GROUND-20,86,4,'#e0eaf0');
    px(1653-cam,GROUND-12,33,12,'#333e50');px(1657-cam,GROUND-10,25,2,'#a3b6c8');
    px(2091-cam,GROUND-14,18,14,'#7c7a70');px(2088-cam,GROUND-17,24,4,'#dbe7ed');
    for(let i=0;i<4;i++)px(2096-cam+i*3,GROUND-24-i*8,8+i*2,2,'#a5b2bf');
  }
  if(zone==='snow'){
    sign(1780-cam,108);rock(2000-cam,GROUND,99,30);
    px(1079-cam,GROUND-1,42,1,'#8ca6bd');px(1087-cam,GROUND-3,2,3,'#8ca6bd');px(1102-cam,GROUND-5,2,5,'#8ca6bd');
    px(1107-cam,GROUND-4,7,1,'#52677e');px(1111-cam,GROUND-6,3,3,'#52677e');
    if(G.f.yCrowMap)for(let i=0;i<8;i++)px(1080-cam+i*5,GROUND-2-Math.round(Math.sin(i*.7)*3),6,1,'#667e98');
    sign(2100-cam,GROUND);for(let i=0;i<5;i++)px(2098-cam,GROUND-5-i*5,6,1,'#5a5d64');
    // 가지가 눈 지붕을 받친다. 설피를 얻으면 파란 다짐길이 안쪽까지 이어진다.
    px(220-cam,GROUND-28,60,5,'#e6eef2');px(225-cam,GROUND-35,50,7,'#eff5f5');
    px(220-cam,GROUND-23,7,23,'#c4d5e2');px(274-cam,GROUND-23,7,23,'#c4d5e2');
    px(226-cam,GROUND-24,49,3,'#7d7365');
    if(G.f.seolpi){px(227-cam,GROUND-2,47,2,'#8ca8be');for(let i=0;i<5;i++)px(232-cam+i*8,GROUND-3,4,1,'#627f9a');}
    // 어귀에서 보였던 두 봉우리 사이의 길. 붉은 천은 멀리서도 같은 자리다.
    px(1996-cam,GROUND-64,4,34,'#776354');px(2000-cam,GROUND-63,15,8,'#c38178');
  }
  if(zone==='slope'){
    rowan(250-cam,GROUND);
    const x=1100-cam;px(x-18,GROUND,36,3,'#536c82');px(x-14,GROUND+2,28,4,'#273e56');
    px(x-12,GROUND-3,24,3,'#deebef');px(x+23,GROUND-5,12,5,'#827467');
    // 눈을 닦아 넓힌 긴 물구멍. 판정은 평평한 바닥이며 추락하지 않는다.
    px(1112-cam,GROUND+2,170,2,'#65859a');px(1232-cam,GROUND-1,62,5,'#d8e8ed');px(1237-cam,GROUND+1,51,4,'#354e66');
    if(G.f.yOtterWait){px(1155-cam,GROUND+3,8,1,'#b5cdd4');px(1161-cam,GROUND+2,2,3,'#b5cdd4');}
    rock(2100-cam,GROUND,52,11);px(2075-cam,GROUND-10,54,3,'#d6dedb');
    for(let i=0;i<4;i++)px(2081-cam+i*11,GROUND-11,3,2,'#66766f');
  }
  if(zone==='shore'){
    const x=2320-cam;px(x-50,GROUND-2,100,5,'#9d8c73');
    for(let i=0;i<7;i++)px(x-48+i*15,GROUND-2,2,5,'#635c53');
    boat(x+16,GROUND+20);rock(2130-cam,GROUND,61,23);
    boat(250-cam,GROUND+4);rock(1100-cam,GROUND,26,9);
    px(1091-cam,GROUND-10,19,4,'#6a7880');px(1095-cam,GROUND-9,11,2,'#a1a69b');
    for(let i=0;i<5;i++)px(1091-cam+i*4,GROUND-10+i%2,2,2,'#c88675');
    // 지난가을부터 같은 돌에 앉아 있던 아빠의 발자국. 오래된 도장과 모양이 같다.
    for(let i=0;i<6;i++){px(2058-cam+i*9,GROUND-2,4,2,'#8195a6');px(2061-cam+i*9,GROUND-5,2,2,'#8195a6');}
  }
  if(zone==='island'){
    const x=2236-cam;px(x-117,GROUND-4,234,9,pink()?'#93a18c':'#dce8ed');
    px(x-95,GROUND-8,190,4,pink()?'#b6bea2':'#edf3f3');sacredTree(x,GROUND,pink());
    boat(160-cam,GROUND+20);
    px(234-cam,GROUND-21,3,21,'#7b6a57');px(265-cam,GROUND-24,3,24,'#7b6a57');
    for(let i=0;i<7;i++)px(236-cam+i*4,GROUND-20-i%3,5,2,'#d5c397');
    for(let i=0;i<3;i++){px(241-cam+i*8,GROUND-18,2,7,'#f1ece0');px(241-cam+i*8,GROUND-12,4,2,'#f1ece0');}
    // 같은 뿌리가 신목에서 입구 쪽으로 이어진다. 끊긴 통나무로 보이지 않게 연결한다.
    for(let wx=1070;wx<2240;wx+=5){const yy=GROUND+3+Math.round(Math.sin(wx*.018)*2);px(wx-cam,yy,6,4,'#73614f');px(wx-cam,yy,5,1,'#b7a287');}
    for(let i=0;i<7;i++)px(1096-cam-i*4,GROUND-i*2,5,3,'#73614f');
    if(pink())for(let i=0;i<7;i++)px(1075-cam+i*7,GROUND+9+i%2*2,5,1,'#c0dbe1');
    else{px(1069-cam,GROUND-1,33,1,'#d7e8eb');px(1080-cam,GROUND+7,35,1,'#c4d9e3');}
    // 낮게 뻗은 가지가 조사 자리까지 닿는다. 겨울눈이 같은 자리에서 꽃이 된다.
    px(2100-cam,GROUND-72,129,4,'#66514b');px(2100-cam,GROUND-82,3,11,'#66514b');
    px(2109-cam,GROUND-78,3,7,'#66514b');px(2099-cam,GROUND-85,5,4,pink()?'#f4c4d8':'#9b7c75');
    px(2108-cam,GROUND-81,5,4,pink()?'#f4c4d8':'#9b7c75');
    if(pink()){px(2097-cam,GROUND-86,9,3,'#f8d8e3');px(2105-cam,GROUND-83,10,3,'#f8d8e3');}
  }
};
A.ridgeLayers=[
  {speed:.015,draw:c=>{
    sky(c,false);
    // 별무리는 능선을 따라 길게 놓인다. 입자 대신 고정 도트로 침묵을 지킨다.
    for(let i=0;i<210;i++){
      const x=((Math.round(hash(i*11.73)*480)-c)%480+480)%480-40,y=Math.round(24+x*.15+(hash(i*5.39)-.5)*35);
      if(y>6&&y<112)px(x,y,1,1,i%9?'#687b9d':'#d3ddec');
    }
  }},
  {speed:.05,draw:c=>{
    mountains(c,147,44,'#293a59',7);mountains(c*.65,153,29,'#405370',116);
    for(let i=0;i<11;i++)px(i*47-c*.6,141+i%3*5,30,1,'#8b9fb5');
  }},
  {speed:.12,draw:c=>{
    mountains(c,194,37,'#4b657d',210);
    // 장터의 등불, 돌너머의 창, 단풍골 아궁이. 왔던 길이 한 줄로 이어진다.
    for(let i=0;i<40;i++){
      const x=31+i*10-c*.55,y=159+Math.round(Math.sin(i*.34)*9)+Math.floor(i/14)*9;
      px(x,y,2,1,i%3?'#d1aa77':'#f6d3a0');if(i%7===0)px(x-2,y-2,5,1,'#293e55');
    }
    for(let i=0;i<6;i++)px(82+i*41-c*.55,204-i%3*3,21,1,'#788b9e');
  }},
  {speed:.22,draw:c=>{
    px(0,211,W,14,'#263b51');for(let x=0;x<W;x+=3)px(x,206+Math.round(Math.sin((x+c)*.025)*5),3,19,'#c7dae6');
    pine(27-c*.16,223,1.2,true);pine(390-c*.13,234,1.45,true);
    px(272-c*.2,199,4,17,'#796656');px(276-c*.2,199,17,7,'#c48679');
    px(111-c*.2,214,25,2,'#92adc4');px(142-c*.2,217,20,2,'#92adc4');
  }},
];
A.springLayers=[
  {speed:.015,draw:c=>sky(c,true)},
  {speed:.05,draw:c=>{
    mountains(c,119,24,'#c5abc0',33);mountains(c,135,18,'#b39fb7',180);
    px(0,141,W,99,'#a9bbc8');for(let i=0;i<22;i++)px(i*23-c*.25,147+i%6*8,17,1,'#d8d6df');
  }},
  {speed:.12,draw:c=>{
    px(0,174,W,66,'#7eabbc');
    for(let i=0;i<48;i++){
      const x=((i*37-c*.4)%440+440)%440-20,y=177+i%8*7;
      px(x,y,8+i%4*3,1,i%3?'#bbd8df':'#e8e1e7');
    }
    // 녹은 얼음은 물 위에 조각으로 남아 겨울의 보행로와 구별된다.
    for(let i=0;i<12;i++){
      const x=((i*53+9-c*.3)%460+460)%460-30,y=185+i%5*10;
      px(x,y,13+i%4*4,2,'#d8e9eb');px(x+2,y-2,8+i%4*3,2,'#eef3f2');
    }
  }},
  {speed:.22,draw:c=>{
    const x=259-Math.round(c*.24);
    px(x-104,206,208,9,'#7d9185');px(x-90,200,180,7,'#bbc4a7');
    px(x-76,197,152,4,'#d9d0b6');sacredTree(x,201,true);
    // 신목의 분홍빛이 물까지 닿는다. 꽃잎 사이로 열린 물길을 남긴다.
    for(let i=0;i<54;i++){
      const xx=((i*47+7-c*.3)%440+440)%440-20,yy=18+(i*37)%215;
      px(xx,yy,i%5===0?3:2,1,i%3?'#f4c0d4':'#ffe2eb');
    }
    px(0,219,99,6,'#a9b59d');px(0,216,75,3,'#d8cfb9');
    for(let i=0;i<8;i++){px(8+i*10,212-i%3*3,2,6,'#789780');px(7+i*10,211-i%3*3,4,2,'#e8acc8');}
  }},
];
A.drawBear=(x,y,f=1)=>{
  M(x,y,f,-12,-11,24,11,'#8e7564');M(x,y,f,-10,-22,18,14,'#967e6d');
  M(x,y,f,-10,-25,5,5,'#8e7564');M(x,y,f,3,-25,5,5,'#8e7564');
  M(x,y,f,-8,-24,2,2,'#b99b85');M(x,y,f,4,-24,2,2,'#b99b85');
  M(x,y,f,-8,-17,3,1,'#392f2c');M(x,y,f,2,-17,3,1,'#392f2c');
  M(x,y,f,-5,-13,9,5,'#c3aa8e');M(x,y,f,-1,-14,3,2,'#392f2c');M(x,y,f,-9,-6,20,5,'#b6a385');
};
A.drawCrow=(x,y,f=1)=>{
  M(x,y,f,-9,-15,15,12,'#344052');M(x,y,f,-4,-26,12,12,'#2c3547');M(x,y,f,6,-21,8,3,'#6f7882');
  M(x,y,f,4,-23,1,1,'#d5dadd');M(x,y,f,-8,-11,8,4,'#4e5a6d');M(x,y,f,-14,-8,7,4,'#293345');
  M(x,y,f,-3,-4,1,4,'#677385');M(x,y,f,2,-4,1,4,'#677385');M(x,y,f,-5,-1,4,1,'#677385');M(x,y,f,1,-1,4,1,'#677385');
};
A.drawOtter=(x,y,f=1)=>{
  M(x,y,f,-10,-17,19,15,'#8c796b');M(x,y,f,-10,-28,20,13,'#9e8775');M(x,y,f,-12,-28,5,5,'#8c796b');M(x,y,f,7,-28,5,5,'#8c796b');
  M(x,y,f,-8,-18,16,6,'#cbb6a0');M(x,y,f,-5,-23,2,2,'#2d3037');M(x,y,f,4,-23,2,2,'#2d3037');M(x,y,f,-1,-20,3,2,'#2d3037');
  M(x,y,f,-15,-6,8,4,'#7a6b61');M(x,y,f,-11,-7,5,7,'#7a6b61');M(x,y,f,6,-5,4,5,'#7a6b61');
  M(x,y,f,9,-14,5,3,'#b5a08c');M(x,y,f,12,-32,2,25,'#b59b75');M(x,y,f,14,-32,14,1,'#d3d9dc');
  M(x,y,f,27,-31,1,34,'#d3d9dc');M(x,y,f,25,2,3,1,'#d3d9dc');
};
A.drawMagpie=(x,y,f=1)=>{
  A.drawCrow(x,y,f);M(x,y,f,-5,-14,8,6,'#e1e5e3');M(x,y,f,-13,-7,7,3,'#638291');M(x,y,f,-20,-5,9,2,'#344052');
  M(x,y,f,1,-9,9,6,'#b79e79');M(x,y,f,4,-11,2,3,'#8d735b');
};
A.blockedSnow=(x,y)=>{for(let i=0;i<5;i++){px(x-24+i*10,y-23-i%2*8,12,23+i%2*8,'#d8e7ef');px(x-23+i*10,y-25-i%2*8,10,3,'#f3f7f6');}};
A.blockedIce=(x,y)=>{px(x-24,y-44,48,44,'#8badc5');px(x-22,y-46,44,4,'#dfeef3');for(let i=0;i<4;i++)px(x-14+i*9,y-37+i*6,2,12,'#c4dce6');};
A.stamp=(x,y)=>{px(x-3,y-4,6,4,'#b98075');px(x-5,y-7,2,2,'#b98075');px(x-1,y-8,2,2,'#b98075');px(x+3,y-7,2,2,'#b98075');};
A.door=(x,y)=>{sign(x,y);px(x-8,y-32,12,1,'#eee7d4');px(x+2,y-34,3,5,'#eee7d4');};
Rg.expArt=A;
})();
