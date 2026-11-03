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
  /* 옹달 할미 (결정 D-120): 늙은 오소리. 흰 줄무늬 얼굴, 자주색 머릿수건. 곁에 금 간 솥과 작은 불, 허리춤에 표주박.
     봄이 오면(강철이가 떠나면) 솥을 엎어 말린다. */
  badger(ox,oy,f){const Gy='#857d70',Dk='#4a443d',Wt='#eee6d6',K='#17120e',Sc='#7a4a6a';
    // 결정 D-154: 옆에 걸어 둔 솥은 Rg.props.ongdalPot이 제자리에 그린다(할미가 고개를 돌려도 움직이지 않는다).
    M(ox,oy,f,-9,-11,15,8,Gy);M(ox,oy,f,-9,-5,15,2,Dk);M(ox,oy,f,-10,-10,2,5,Dk);
    M(ox,oy,f,-8,-3,3,3,K);M(ox,oy,f,-3,-3,3,3,K);M(ox,oy,f,1,-3,3,3,K);
    M(ox,oy,f,4,-16,9,8,Wt);M(ox,oy,f,5,-16,2,8,K);M(ox,oy,f,9,-16,2,7,K);M(ox,oy,f,12,-11,2,2,K);M(ox,oy,f,10,-12,1,1,'#ffffff');
    M(ox,oy,f,3,-18,10,3,Sc);M(ox,oy,f,2,-16,2,3,Sc);
    M(ox,oy,f,-3,-9,4,5,'#c9a45a');M(ox,oy,f,-2,-11,2,2,'#c9a45a');M(ox,oy,f,-2,-6,2,1,'#6a3a2a');},
  /* 아빠: 모자는 아들이 쓰고 있어서 목도리만 둘렀다.
     결정 D-431: 강철이에게 이름을 다 먹혀 넋이 빠졌다(이름이 돌아오기 전). 호수만 보고, 고개를 조금 떨궜고, 눈에 빛이 없다.
     버릇만 남았다: 보따리 매듭을 묶었다 풀고, 곁에 꽂은 겨울 막대에 금을 긋는다(가을부터 하루 하나, 깊은 금 하나는 강철이와 싸운 날). */
  dad(ox,oy,f){const Gy='#7c7062',K='#2a211b',Wt='#efe6d6',T='#6f6357',Sc='#b4432a';
    const lost=!Rg.namesBack();
    if(lost)f=1;   // 다가가도 돌아보지 않는다
    const hx=ox,hy=oy+(lost?1:0);
    M(ox,oy,f,-14,-10,8,5,T);M(ox,oy,f,-13,-10,1,5,K);M(ox,oy,f,-9,-10,1,5,K);
    M(ox,oy,f,-5,-15,11,11,Gy);M(ox,oy,f,-1,-13,5,8,'#cfc3b2');
    M(hx,hy,f,-4,-24,12,10,Gy);M(hx,hy,f,-3,-20,11,2,K);M(hx,hy,f,5,-20,1,1,'#ffffff');M(hx,hy,f,-3,-18,10,2,Wt);M(hx,hy,f,8,-19,1,2,K);
    M(hx,hy,f,-4,-26,3,3,Gy);M(hx,hy,f,5,-26,3,3,Gy);
    M(ox,oy,f,-5,-15,12,3,Sc);M(ox,oy,f,-6,-12,3,6,Sc);
    M(ox,oy,f,-4,-4,4,4,K);M(ox,oy,f,2,-4,4,4,K);
    if(lost){
      const g=Vfx.reducedMotion?0:(typeof G!=='undefined'&&G?G.anim:0),Cord='#8a6a3a',Stick='#8c735d';
      M(hx,hy,f,5,-20,1,1,K);                                                      // 눈에 빛이 없다
      M(ox,oy,f,12,-26,2,26,Stick);for(let i=0;i<8;i++)M(ox,oy,f,11,-24+i*3,1,1,'#4a3a2a');M(ox,oy,f,10,-9,4,1,'#1e140c');   // 겨울 막대와 금
      if(Math.floor(g/300)%2===0){                                                  // 매듭을 묶었다 푼다
        const tight=Math.floor(g/40)%2;
        M(ox,oy,f,0,-10,3,2,Wt);M(ox,oy,f,7,-10,3,2,Wt);M(ox,oy,f,3,-10,4,1,Cord);
        if(tight)M(ox,oy,f,4,-12,2,2,Cord);else{M(ox,oy,f,3,-13,1,3,Cord);M(ox,oy,f,6,-13,1,3,Cord);M(ox,oy,f,4,-14,2,1,Cord);}
      }else{const s=Math.floor(g/18)%4;M(ox,oy,f,6,-12,4,2,Gy);M(ox,oy,f,9,-21+s*3,3,2,Wt);}   // 막대에 금을 긋는다
    }},
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
  /* 결정 D-154: 옹달 할미의 솥. 할미 왼쪽 눈밭에 걸려 있다. 봄(강철이 뒤)에는 불을 끄고 엎어 둔다. */
  ongdalPot(n){const x=Math.round(n.x-cam),y=n.y??fieldGround(),Pot='#3a3532',t=(G&&G.anim)||0;
    if(G&&G.boss&&G.boss.dead){R(x-26,y-5,12,5,Pot);R(x-25,y-6,10,1,'#56504a');return;}
    R(x-25,y-9,11,7,Pot);R(x-26,y-10,13,2,'#56504a');R(x-21,y-8,1,6,'#6a625a');
    R(x-24,y-2,8,2,t%20<10?'#e07a2c':'#f0a640');R(x-22,y-3,3,1,'#ffd27a');
    R(x-21,y-14-(t>>3)%3,2,2,'#dcd6cc');R(x-18,y-17+((t>>3)%3),2,2,'#e8e2d8');},
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
function pine(x,y,size=1,snow=true,shape=0){
  const s=size,lean=(shape%3-1)*2;px(x-2*s,y-43*s,4*s,43*s,'#384a4d');
  for(let i=0;i<4;i++){
    const w=(7+i*(shape%2?4:5))*s,cy=y-(50+shape%3*3)*s+i*11*s,bx=x+lean*(3-i);
    px(bx-w,cy,w*2,6*s,'#3b5361');px(bx-w+3*s,cy-3*s,w*2-6*s,3*s,snow?'#cadce8':'#7b9a85');
  }
}
function rowan(x,y,seed=0){
  const h=Math.round(hash(seed+7)*13),spread=Math.round(hash(seed+19)*9);
  px(x-2,y-48-h,4,48+h,C.bark);px(x-22-spread,y-37-h,22+spread,2,C.bark);px(x,y-45-h,24-spread,2,C.bark);
  for(let i=0;i<5;i++){
    const bx=x-22-spread+i*(10+spread/3),by=y-38-h-(i%2)*8;
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
  // 늙은 느티나무의 갈라진 수피와 뿌리. 금줄은 뿌리가 아니라 줄기에 두른다.
  for(let i=0;i<9;i++){const bx=x-11+i%4*6,by=y-95+i*9;px(bx,by,2,5+i%3,'#423c38');px(bx+2,by+2,2,3,'#a18569');}
  px(x-33,y-8,66,5,'#78654c');px(x-40,y-4,80,4,'#a18c64');
  px(x-17,y-43,34,3,'#b6a06c');px(x-17,y-39,34,2,'#dfce99');
  for(let i=0;i<6;i++){px(x-17+i*6,y-44+i%2*3,6,2,'#e6d5a1');}
  for(const dx of [-12,0,11]){px(x+dx,y-38,2,6,'#f5ead3');px(x+dx-1,y-33,4,3,'#f5ead3');px(x+dx+1,y-30,3,3,'#f5ead3');}
  if(bloom){
    const b=[[-88,-174,58,21],[-50,-190,65,26],[2,-191,60,24],[43,-177,54,22],[-67,-149,46,17],[16,-154,65,19]];
    for(const [bx,by,bw,bh] of b){
      px(x+bx+8,y+by,bw-16,bh,'#65885a');px(x+bx,y+by+6,bw,bh-13,'#65885a');
      px(x+bx+4,y+by+3,bw-8,bh-7,'#99b975');
      for(let j=0;j<bw-9;j+=8){
        const bump=Math.floor(hash(j+by)*5);
        px(x+bx+j+5,y+by-2+bump,7,4,'#c7d99a');
        px(x+bx+j+7,y+by+7+Math.floor(hash(j*8+bx)*8),3,2,'#e0e5ad');
        px(x+bx+j+4,y+by+bh-5,5,3,'#799c63');
      }
    }
  }else{
    px(x-39,y-136,32,3,'#e6edf1');px(x+6,y-149,43,3,'#e6edf1');px(x-14,y-134,20,2,'#e6edf1');
  }
  for(let i=0;i<5;i++)px(x-40+i*19,y-1,11,3,'#756452');
}
function azalea(x,y,size=1,seed=0){
  // 꽃은 낮은 진달래 덤불에만 둔다. 신목의 새잎과 높이·모양을 구분한다.
  for(let i=0;i<5;i++){
    const bx=x+(i-2)*6*size,by=y-(9+hash(seed+i*7)*7)*size;
    px(bx,by,1*size,y-by,'#7c645b');
    px(bx-3*size,by-2*size,6*size,3*size,i%2?'#be7196':'#d38ba9');
    px(bx-1*size,by-4*size,3*size,7*size,'#e3a2bc');px(bx,by,1*size,1*size,'#f1d0cd');
  }
}
function azaleaRidge(camera,base,seed=0,height=18){
  // 낮은 덤불이 산자락의 굴곡을 따라 이어진다. 신목 수관에는 꽃을 얹지 않는다.
  for(let row=0;row<3;row++){
    const step=9+row*2,offset=camera;
    for(let i=Math.floor(offset/step)-3;i<Math.floor(offset/step)+W/step+4;i++){
      const x=i*step-offset,u=x+camera+seed,
        y=base-Math.abs(Math.sin(u*.009))*height-Math.abs(Math.sin(u*.0037))*height*.42+row*5+hash(i+row*19)*3;
      const size=.32+row*.075+hash(i*11+seed+row*37)*.07;
      px(x-5,y-5,step+3,6,row===0?'#aa7395':row===1?'#c181a4':'#d391ae');
      azalea(x,y,size,i*13+seed+row*29);
    }
  }
}
function mist(camera,y,bloom=false){
  for(let i=0;i<7;i++){
    const x=((i*79-camera*.23)%530+530)%530-65;
    px(x,y+i%3*4,62+i%2*22,2,bloom?'#d7d5d0':'#899aaf');
    px(x+11,y-2+i%3*4,41+i%2*16,2,bloom?'#e5dfd7':'#a0adbb');
  }
}
function birds(camera,y,bloom=false){
  const ox=255-camera*.08;
  for(let i=0;i<(bloom?7:3);i++){
    const x=((ox+i*17)%440+440)%440-20,by=y+Math.abs(i-3)*3;
    px(x,by,3,1,bloom?'#7c8586':'#667a96');px(x+2,by+1,3,1,bloom?'#7c8586':'#667a96');px(x+4,by,3,1,bloom?'#7c8586':'#667a96');
  }
}
function sky(camera=0,bloom=pink()){
  for(let y=0;y<H;y+=4){
    const band=Math.floor(y/40),cols=bloom?['#ecd5df','#efd8e2','#f2dce5','#f5dce5','#e6c9d7','#bbbac6']:['#17232c','#1c2845','#293a59','#3a4a67','#4b5f79','#8b9cae'];
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
    for(let i=0;i<18;i++)px(i*29-(RC()*.1)%29,163+i%4*6,17,1,pink()?'#bfd9dc':'#d6e8ed');
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
  sky(Math.round(RC()*.1));
  mountains(Math.round(RC()*.07),118,36,pink()?'#c9a6bd':'#384b68',34);
  mountains(Math.round(RC()*.17),151,38,pink()?'#ad99b4':'#506783',109);
  mountains(Math.round(RC()*.28),179,22,pink()?'#8797a3':'#748fa5',384);
  mist(RC(),142,pink());birds(RC(),49,pink());
  if(pink())azaleaRidge(Math.round(RC()*.28),179,384,22);
  ground(zone);
};
A.scenery=zone=>{
  for(let wx=120;wx<2600;wx+=230){
    const x=wx+Math.round(hash(wx)*34)-17-cam,size=.72+hash(wx+7)*.48,shape=Math.floor(hash(wx+11)*5);if(x<-100||x>W+100)continue;
    if(zone==='shelter'){
      if(wx%460<200){pine(x,GROUND,size,!pink(),shape);rock(x+56,GROUND,28+shape*3,12+shape*2);}
      else{rowan(x,GROUND,wx);px(x+40,GROUND-6,28,6,'#8d7761');px(x+42,GROUND-9,24,3,'#dae4e9');}
    }else if(zone==='snow'){
      pine(x,GROUND,size,!pink(),shape);
      if(!pink()){
        const opened=(G.f.ySnowTrail||0)>wx;px(x+48,GROUND-(opened?10:29),75,opened?10:29,'#dbe7ee');
        px(x+51,GROUND-(opened?10:29),69,3,'#eff5f6');
        if(opened)for(let i=0;i<4;i++)px(x+53+i*17,GROUND-3,6,2,'#92adc4');
      }else{px(x+48,GROUND-3,63,3,'#859b88');azalea(x+78,GROUND,.55,wx);}
    }else if(zone==='slope'){
      rock(x,GROUND,68,32);px(x+29,GROUND-65,22,65,pink()?'#9ba99c':'#a5c4d7');
      px(x+31,GROUND-66,18,3,'#e1edf1');
      if(G.f.shortcut)for(let i=0;i<4;i++)px(x+30+i*4,GROUND-10-i*12,8,3,'#6f6b5b');
      rowan(x+93,GROUND,wx);
    }else{
      // 결정 D-429: 호숫가 서쪽(마을 어귀~집들)에는 바위·솔을 두지 않는다. 마을 그림은 A.village가 그린다
      if(wx>2040){rock(x,GROUND,34+shape*4,12+shape*2);if(wx%460<200)pine(x+28,GROUND,size*.8,!pink(),shape);}
      else if(wx>=650){px(x,GROUND-3,44,3,pink()?'#9ebfc9':'#e4f0f4');if(!pink()){px(x+10,GROUND+3,2,14,'#8daabc');px(x+10,GROUND+16,13,1,'#8daabc');}}
    }
  }
  if(zone==='shelter'){
    hut(260-cam,GROUND);sign(Rg.zones?.shelter?.w?Rg.zones.shelter.w-400-cam:2200-cam,GROUND);   // 오른쪽 끝에서 400 (D-109로 너비가 줄어도 끝에 둔다)
    // 높은 대피소 별채는 오래된 문설주만 남았다. 도장을 찾는 위치와 맞춘다.
    const post=tx(1040)-cam;px(post-19,108-38,5,38,'#7b6a59');px(post+15,108-38,5,38,'#7b6a59');
    px(post-23,108-42,47,5,'#d9e4eb');px(post-18,108-35,4,11,'#b7a68f');
    px(tx(1630)-cam,GROUND-17,80,17,'#667a86');px(tx(1627)-cam,GROUND-20,86,4,'#e0eaf0');
    px(tx(1653)-cam,GROUND-12,33,12,'#333e50');px(tx(1657)-cam,GROUND-10,25,2,'#a3b6c8');
    px(tx(2091)-cam,GROUND-14,18,14,'#7c7a70');px(tx(2088)-cam,GROUND-17,24,4,'#dbe7ed');
    for(let i=0;i<4;i++)px(tx(2096)-cam+i*3,GROUND-24-i*8,8+i*2,2,'#a5b2bf');
  }
  if(zone==='snow'){
    sign(tx(1780)-cam,108);rock(tx(2000)-cam,GROUND,99,30);
    px(tx(1079)-cam,GROUND-1,42,1,'#8ca6bd');px(tx(1087)-cam,GROUND-3,2,3,'#8ca6bd');px(tx(1102)-cam,GROUND-5,2,5,'#8ca6bd');
    px(tx(1107)-cam,GROUND-4,7,1,'#52677e');px(tx(1111)-cam,GROUND-6,3,3,'#52677e');
    if(G.f.yCrowMap)for(let i=0;i<8;i++)px(tx(1080)-cam+i*5,GROUND-2-Math.round(Math.sin(i*.7)*3),6,1,'#667e98');
    sign(tx(2100)-cam,GROUND);for(let i=0;i<5;i++)px(tx(2098)-cam,GROUND-5-i*5,6,1,'#5a5d64');
    // 가지가 눈 지붕을 받친다. 설피를 얻으면 파란 다짐길이 안쪽까지 이어진다.
    px(tx(220)-cam,GROUND-28,60,5,'#e6eef2');px(tx(225)-cam,GROUND-35,50,7,'#eff5f5');
    px(tx(220)-cam,GROUND-23,7,23,'#c4d5e2');px(tx(274)-cam,GROUND-23,7,23,'#c4d5e2');
    px(tx(226)-cam,GROUND-24,49,3,'#7d7365');
    if(G.f.seolpi){px(tx(227)-cam,GROUND-2,47,2,'#8ca8be');for(let i=0;i<5;i++)px(tx(232)-cam+i*8,GROUND-3,4,1,'#627f9a');}
    // 어귀에서 보였던 두 봉우리 사이의 길. 붉은 천은 멀리서도 같은 자리다.
    px(tx(1996)-cam,GROUND-64,4,34,'#776354');px(tx(2000)-cam,GROUND-63,15,8,'#c38178');
  }
  if(zone==='slope'){   // tx: 줄인 비탈 좌표 (D-116)
    rowan(tx(250)-cam,GROUND);
    const x=tx(1100)-cam;px(x-18,GROUND,36,3,'#536c82');px(x-14,GROUND+2,28,4,'#273e56');
    px(x-12,GROUND-3,24,3,'#deebef');px(x+23,GROUND-5,12,5,'#827467');
    // 눈을 닦아 넓힌 긴 물구멍. 판정은 평평한 바닥이며 추락하지 않는다.
    px(tx(1112)-cam,GROUND+2,170,2,'#65859a');px(tx(1232)-cam,GROUND-1,62,5,'#d8e8ed');px(tx(1237)-cam,GROUND+1,51,4,'#354e66');
    if(G.f.yOtterWait){px(tx(1155)-cam,GROUND+3,8,1,'#b5cdd4');px(tx(1161)-cam,GROUND+2,2,3,'#b5cdd4');}
    const rx=tx(2100)-cam;rock(rx,GROUND,52,11);px(rx-25,GROUND-10,54,3,'#d6dedb');
    for(let i=0;i<4;i++)px(rx-19+i*11,GROUND-11,3,2,'#66766f');
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
    const x=tx(2236)-cam;px(x-117,GROUND-4,234,9,pink()?'#93a18c':'#dce8ed');
    px(x-95,GROUND-8,190,4,pink()?'#b6bea2':'#edf3f3');sacredTree(x,GROUND,pink());
    if(pink()){azalea(x-98,GROUND,.85,3);azalea(x+96,GROUND,.65,14);}
    boat(tx(160)-cam,GROUND+20);
    px(tx(234)-cam,GROUND-21,3,21,'#7b6a57');px(tx(265)-cam,GROUND-24,3,24,'#7b6a57');
    for(let i=0;i<7;i++)px(tx(236)-cam+i*4,GROUND-20-i%3,5,2,'#d5c397');
    for(let i=0;i<3;i++){px(tx(241)-cam+i*8,GROUND-18,2,7,'#f1ece0');px(tx(241)-cam+i*8,GROUND-12,4,2,'#f1ece0');}
    // 같은 뿌리가 신목에서 입구 쪽으로 이어진다. 끊긴 통나무로 보이지 않게 연결한다.
    for(let wx=1070;wx<2240;wx+=5){const yy=GROUND+3+Math.round(Math.sin(wx*.018)*2);px(tx(wx)-cam,yy,6,4,'#73614f');px(tx(wx)-cam,yy,5,1,'#b7a287');}
    for(let i=0;i<7;i++)px(tx(1096)-cam-i*4,GROUND-i*2,5,3,'#73614f');
    if(pink())for(let i=0;i<7;i++)px(tx(1075)-cam+i*7,GROUND+9+i%2*2,5,1,'#c0dbe1');
    else{px(tx(1069)-cam,GROUND-1,33,1,'#d7e8eb');px(tx(1080)-cam,GROUND+7,35,1,'#c4d9e3');}
    // 낮게 뻗은 가지가 조사 자리까지 닿는다. 겨울눈이 같은 자리에서 새잎이 된다.
    px(tx(2100)-cam,GROUND-72,129,4,'#66514b');px(tx(2100)-cam,GROUND-82,3,11,'#66514b');
    px(tx(2109)-cam,GROUND-78,3,7,'#66514b');px(tx(2099)-cam,GROUND-85,5,4,pink()?'#9dbb76':'#9b7c75');
    px(tx(2108)-cam,GROUND-81,5,4,pink()?'#9dbb76':'#9b7c75');
    if(pink()){px(tx(2097)-cam,GROUND-86,9,3,'#d1dfa1');px(tx(2105)-cam,GROUND-83,10,3,'#d1dfa1');}
  }
};
/* ---------- 결정 D-429·D-431: 호숫가 마을 (design/proposals/name-story.md §6) ----------
   겨울: 문패·장승 글자 자리가 하얗게 매끈하고, 굴뚝에 연기가 없고, 빨랫줄이 비었고, 우물이 얼었다.
   봄(이름이 돌아온 뒤): 글자가 먹빛으로 돌아오고, 연기가 오르고, 빨래가 널리고, 두레박이 내려간다. */
function choga(x,y,i,back){
  if(x<-80||x>W+80)return;
  const t=Vfx.reducedMotion?0:G.anim,w=64+(i%3)*6,h=26+(i%2)*3,L=Math.round(x-w/2);
  px(L,y-h,w,h,back?'#c2ab86':'#b3aa9c');                                   // 흙벽
  px(L,y-h,2,h,'#5d4c3f');px(L+w-2,y-h,2,h,'#5d4c3f');px(L,y-h,w,2,'#5d4c3f');   // 기둥·도리
  px(L-3,y-3,w+6,3,'#8b8a86');                                               // 돌 기단
  // 문: 겨울엔 닫혀 있다. 봄엔 문짝을 열어 불빛이 보인다
  px(x-7,y-h+5,14,h-5,back?'#e3a85e':'#4a4440');
  if(back)px(x-7,y-h+5,4,h-5,'#7a5a3e');else{px(x-1,y-h+5,1,h-5,'#2f2b28');px(x-5,y-h+9,10,1,'#5d5650');}
  // 창호지 창
  px(L+5,y-h+6,9,8,back?'#efe2c0':'#cfcbc2');px(L+9,y-h+6,1,8,'#7d6c5c');px(L+5,y-h+9,9,1,'#7d6c5c');
  // 문패: 문 오른쪽. 겨울엔 하얗게 매끈하다(이름이 먹혔다). 봄엔 먹 글씨가 돌아온다
  const nx=x+13,ny=y-h+4;
  px(nx,ny,6,11,back?'#c9b48c':'#eef0ec');px(nx,ny,6,1,back?'#a68f68':'#ffffff');
  if(back){px(nx+2,ny+2,2,1,'#2b2420');px(nx+2,ny+3,1,2,'#2b2420');px(nx+1,ny+6,4,1,'#2b2420');px(nx+2,ny+7,2,2,'#2b2420');}
  // 초가지붕: 둥글게 덮은 짚과 새끼줄. 겨울엔 눈이 얹혔다
  const straw=back?'#b39a60':'#9b9182',dark=back?'#8a744a':'#7c7468';
  px(L-8,y-h-8,w+16,8,straw);px(L-4,y-h-13,w+8,5,straw);px(L+4,y-h-17,w-8,4,straw);px(L+14,y-h-19,w-28,2,straw);
  px(L-8,y-h-1,w+16,1,dark);
  for(let k=0;k<6;k++){const edge=k===0||k===5;px(Math.round(L-2+k*(w+4)/6),y-h-17+(edge?6:0),1,16-(edge?6:0),dark);}
  if(!back){px(L-4,y-h-14,w+8,2,'#eef3f5');px(L+4,y-h-18,w-8,2,'#f6f9fa');px(L+14,y-h-20,w-28,2,'#ffffff');}
  // 굴뚝: 겨울엔 연기가 없다. 봄엔 연기가 오른다
  const cx=L+w-10;px(cx,y-h-14,6,10,'#7a6a5a');px(cx-1,y-h-15,8,2,back?'#6a5a4a':'#e4ecef');
  if(back)for(let k=0;k<3;k++){const kk=(t*.5+k*22+i*13)%60;px(cx+1+Math.sin((t+k*30)*.05)*2,y-h-18-kk,4,3,'rgba(232,232,236,'+(0.6-kk/110).toFixed(2)+')');}
}
function jangseung(x,y,male,back){
  if(x<-30||x>W+30)return;
  const wood=back?'#8c7258':'#a59a8c',face=back?'#a3866a':'#b5ab9e',ink='#2b2420';
  px(x-5,y-58,10,58,wood);px(x-5,y-58,2,58,back?'#6f5a46':'#8f8578');      // 몸통
  px(x-6,y-66,12,10,face);                                                   // 머리
  if(male){const hat=back?'#2f2a26':'#6d6862';px(x-8,y-70,16,4,hat);px(x-5,y-75,10,5,hat);}   // 천하대장군의 관모
  else px(x-6,y-69,12,3,back?'#3d3530':'#77716b');                           // 지하여장군의 머리
  // 부릅뜬 눈·주먹코·이. 겨울엔 칠이 바랬다
  const e=back?ink:'#7f786f';
  px(x-4,y-63,3,3,e);px(x+1,y-63,3,3,e);px(x-1,y-60,2,3,back?'#a8443a':'#9b8c84');px(x-4,y-57,8,2,e);px(x-3,y-57,1,1,'#efe9df');px(x+2,y-57,1,1,'#efe9df');
  // 몸통의 이름 글자 자리: 겨울엔 하얗게 매끈하다. 봄엔 먹 글씨가 돌아온다
  px(x-3,y-50,6,40,back?'#b49a7c':'#e4e2dc');
  if(back)for(let k=0;k<5;k++){px(x-2,y-48+k*8,4,1,ink);px(x-1,y-47+k*8,1,3,ink);px(x+1,y-46+k*8,1,2,ink);}
  px(x-7,y-2,14,2,'#7f7d78');
}
function well(x,y,back){
  if(x<-30||x>W+30)return;
  px(x-14,y-12,28,12,'#7b858c');for(let k=0;k<4;k++)px(x-13+k*7,y-11+(k%2)*5,6,1,'#5f686f');   // 돌 둘레
  px(x-15,y-14,30,3,back?'#8f979c':'#e7eff2');                                                  // 테두리 (겨울엔 눈)
  if(back)px(x-11,y-13,22,2,'#3e5868');else{px(x-11,y-13,22,2,'#cfe2ea');px(x-6,y-13,3,1,'#ffffff');}   // 언 물낯 / 봄 물
  px(x-13,y-36,2,24,'#6f5a46');px(x+11,y-36,2,24,'#6f5a46');px(x-15,y-38,30,3,'#5d4c3f');      // 기둥과 들보
  // 두레박: 겨울엔 테두리에 얼어붙었다. 봄엔 줄에 매달려 흔들린다
  if(!back){px(x+4,y-18,6,4,'#7a5e44');px(x+4,y-19,6,1,'#dde8ec');}
  else{const s=Vfx.reducedMotion?0:Math.round(Math.sin(G.anim*.05));px(x+s,y-35,1,15,'#8a7a68');px(x-3+s,y-21,7,5,'#7a5e44');}
}
function clothesline(x1,x2,y,back){
  if(x2<-20||x1>W+20)return;
  px(x1,y-40,2,40,'#6f5f4f');px(x2,y-40,2,40,'#6f5f4f');
  const span=x2-x1,sag=k=>Math.round(Math.sin(k/span*Math.PI)*4);
  for(let k=0;k<=span;k+=2)px(x1+k,y-38+sag(k),2,1,'#8a7a68');
  if(!back){for(let k=6;k<span-4;k+=14)px(x1+k,y-39+sag(k),6,1,'#f2f6f7');return;}   // 빈 줄에 눈만 얹혔다
  const t=Vfx.reducedMotion?0:G.anim;
  [['#f2eee4',10,14],['#4f668c',30,12],['#c98a7a',50,10],['#e8dfc6',66,9]].forEach(([c,k,h],j)=>{
    if(k>span-10)return;const sw=Math.round(Math.sin(t*.04+j));
    px(x1+k+sw,y-37+sag(k),9,h,c);px(x1+k+sw,y-37+sag(k),9,1,'#6f5f4f');});
}
A.village=()=>{
  const V=Rg.VILLAGE,back=Rg.namesBack();
  for(const [i,hx] of V.houses.entries())choga(hx-cam,GROUND,i,back);
  well(V.well-cam,GROUND,back);clothesline(V.line[0]-cam,V.line[1]-cam,GROUND,back);
  jangseung(V.jangseung[0]-cam,GROUND,true,back);jangseung(V.jangseung[1]-cam,GROUND,false,back);
};
/* 결정 D-430: 이름 잃은 이들. 넋이 빠져 버릇만 남았다. 다가가도 돌아보지 않는다(눈에 빛이 없다). 봄엔 서로를 마주 본다. */
// 물레 앞 아주머니(족제비): 실도 없는 물레를 돌린다. 봄엔 물레에 실이 감기고 빨래터 쪽(지게 할아버지)을 본다
A.drawLostLoom=(x,y)=>{
  const back=Rg.namesBack(),t=Vfx.reducedMotion?0:G.anim,f=1,K='#1a1410';
  const B0=back?'#a07a52':'#8f8170',Dk=back?'#6a4c32':'#665c50',Lt=back?'#e2cfa8':'#cfc6b6',Sc=back?'#c46a5a':'#b8b2a6';
  const cx=Math.round(x+19),cy=y-13,ang=t*.05;
  px(cx-1,cy,2,13,'#6f5a46');px(cx-9,y-2,24,2,'#6f5a46');px(cx+12,cy-1,2,12,'#6f5a46');   // 물레 받침
  for(let k=0;k<24;k++){const a=k/24*Math.PI*2;px(cx+Math.round(Math.cos(a)*9),cy+Math.round(Math.sin(a)*9),1,1,'#5a4838');}
  for(let k=0;k<2;k++){const a=ang+k*Math.PI/2;for(let r=2;r<9;r+=2){
    px(cx+Math.round(Math.cos(a)*r),cy+Math.round(Math.sin(a)*r),1,1,'#8c735d');px(cx-Math.round(Math.cos(a)*r),cy-Math.round(Math.sin(a)*r),1,1,'#8c735d');}}
  px(cx+10,cy-2,8,2,'#8c735d');                                                              // 가락
  if(back){px(cx+15,cy-4,4,6,'#efe8d6');for(let k=0;k<12;k++)px(cx+Math.round(k*15/12),cy-9+Math.round(k*6/12),1,1,'#e8e0cc');}   // 실이 감긴다
  M(x,y,f,-9,-11,13,11,B0);M(x,y,f,-5,-9,7,8,Lt);M(x,y,f,-14,-6,6,3,Dk);                     // 앉은 몸·꼬리
  M(x,y,f,-4,-21,11,10,B0);M(x,y,f,-5,-23,12,3,Sc);M(x,y,f,-5,-20,2,6,Sc);                   // 머리·머릿수건
  M(x,y,f,4,-17,1,1,K);M(x,y,f,7,-15,1,1,K);if(back)M(x,y,f,5,-18,1,1,'#ffffff');
  const hx=cx-x+Math.round(Math.cos(ang)*4),hy=Math.round(Math.sin(ang)*4)-13;               // 손잡이를 쥔 손
  M(x,y,f,3,-11,Math.max(2,hx-3),2,B0);M(x,y,f,hx-1,hy-1,3,3,Lt);
};
// 빈 지게 할아버지(오소리): 빈 지게를 지고 제 집 문간을 오락가락한다. 말을 걸면 그 자리에 멈춘다. 봄엔 장작을 지고 물레 쪽을 본다
A.drawLostJige=(x,y,f)=>{
  const back=Rg.namesBack(),t=Vfx.reducedMotion?0:G.anim,talking=typeof open==='function'&&open('dlg');
  const walk=!back&&!talking,s=t*.016;
  const ox=Math.round(x+(walk?Math.sin(s)*14:0)),d=back?-1:walk?(Math.cos(s)>=0?1:-1):(f||1),step=walk?Math.floor(t/12)%2:0;
  const Gy=back?'#857d70':'#7f7a72',Dk='#4a443d',Wt='#e8e2d6',K='#17120e',Wd=back?'#7a6248':'#6f665c';
  M(ox,y,d,-13,-36,2,34,Wd);M(ox,y,d,-9,-36,2,34,Wd);M(ox,y,d,-13,-30,6,1,Wd);M(ox,y,d,-13,-22,6,1,Wd);M(ox,y,d,-15,-14,4,2,Wd);   // 지게
  if(back){M(ox,y,d,-21,-34,12,9,'#8a6a48');for(let k=0;k<3;k++)M(ox,y,d,-21,-33+k*3,1,2,'#c49a6a');}                         // 봄: 장작
  M(ox,y,d,-8,-15,14,10,Gy);M(ox,y,d,-8,-6,14,2,Dk);
  M(ox,y,d,-6,-4,3,4+step,K);M(ox,y,d,2,-4,3,5-step,K);
  M(ox,y,d,3,-21,9,8,Wt);M(ox,y,d,4,-21,2,8,K);M(ox,y,d,8,-21,2,7,K);M(ox,y,d,11,-16,2,2,K);if(back)M(ox,y,d,9,-18,1,1,'#ffffff');
  M(ox,y,d,-1,-17,4,2,Gy);   // 멜빵 쥔 팔
};
// 문간 아이(토끼): 제 집 문패를 손으로 문지른다(왼쪽 집). 봄엔 이름을 되찾아 손을 번쩍 들고 깡충거린다
A.drawLostKid=(x,y,f)=>{
  const back=Rg.namesBack(),t=Vfx.reducedMotion?0:G.anim,d=back?(f||1):-1,K='#1a1410';
  const Wt=back?'#f1ece2':'#d9d5cd',Sh=back?'#cfc6b6':'#b9b3a9',In='#e3b4b0',hop=back?Math.abs(Math.round(Math.sin(t*.12)*2)):0,yy=y-hop;
  M(x,yy,d,-5,-12,10,10,Wt);M(x,yy,d,-5,-4,10,2,Sh);M(x,yy,d,-8,-9,3,3,Wt);                    // 몸·꼬리
  M(x,yy,d,-3,-20,9,8,Wt);M(x,yy,d,-2,-29,2,9,Wt);M(x,yy,d,2,-28,2,8,Wt);M(x,yy,d,-2,-27,1,6,In);M(x,yy,d,2,-26,1,5,In);
  M(x,yy,d,3,-17,1,1,K);M(x,yy,d,6,-15,1,1,'#c08080');if(back)M(x,yy,d,3,-18,1,1,'#ffffff');
  M(x,yy,d,-4,-2,3,2,Sh);M(x,yy,d,2,-2,3,2,Sh);
  if(!back){const r=Math.floor(t/9)%3;M(x,y,d,5,-13,4,2,Wt);M(x,y,d,9,-22+r,2,3,Wt);}          // 문패를 문지르는 손
  else{M(x,yy,d,4,-15,2,4,Wt);M(x,yy,d,5,-19,2,2,Wt);}
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
  {speed:.16,draw:c=>{mist(c,184,false);birds(c,104,false);}},
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
    azaleaRidge(c,135,180,18);
  }},
  {speed:.08,draw:c=>{mist(c,146,true);birds(c,58,true);}},
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
    // 느티 새잎 아래 낮은 진달래가 핀다. 물길 위에는 꽃비 대신 버들씨 몇 점만 둔다.
    azalea(x-100,203,.75,4);azalea(x+96,202,.6,17);
    for(let i=0;i<9;i++){
      const xx=((i*47+7-c*.3)%440+440)%440-20,yy=122+(i*37)%75;
      px(xx,yy,2,1,'#f4efdb');px(xx+1,yy-1,1,1,'#fbf7e9');
    }
    px(0,219,99,6,'#a9b59d');px(0,216,75,3,'#d8cfb9');
    for(let i=0;i<8;i++){px(8+i*10,212-i%3*3,2,6,'#789780');px(7+i*10,211-i%3*3,4,2,'#b9ce86');}
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
A.willowSeeds=()=>{
  const t=Vfx.reducedMotion?0:G.anim;
  for(let i=0;i<9;i++){
    const x=((hash(i*9+3)*W-t*.08)%W+W)%W,y=(hash(i*5+1)*H+t*.13)%H;
    px(x,y,1,2,'#f8f2df');if(i%3===0)px(x-1,y,3,1,'#eae6d2');
  }
};
A.blockedSnow=(x,y)=>{for(let i=0;i<5;i++){px(x-24+i*10,y-23-i%2*8,12,23+i%2*8,'#d8e7ef');px(x-23+i*10,y-25-i%2*8,10,3,'#f3f7f6');}};
A.blockedIce=(x,y)=>{px(x-24,y-44,48,44,'#8badc5');px(x-22,y-46,44,4,'#dfeef3');for(let i=0;i<4;i++)px(x-14+i*9,y-37+i*6,2,12,'#c4dce6');};
A.stamp=(x,y)=>pawStamp(x,y,'#b98075');
A.door=(x,y)=>{sign(x,y);px(x-8,y-32,12,1,'#eee7d4');px(x+2,y-34,3,5,'#eee7d4');};
Rg.expArt=A;
})();
