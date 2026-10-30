'use strict';
/* 돌너머 동물들의 도트 그림과 소품. (ox, oy)는 발밑, f 는 바라보는 방향 */
(()=>{
const Rg=REGIONS.dolneomeo;
Rg.springRevisit=()=>!CLASSIC&&!!G?.f?.spring&&regionCompleted('yeongsan');
/* 꾸벅이는 졸다가 잠깐씩 고개를 든다. 고개를 든 동안에만 말이 통한다 */
const NOD=TABLES.TUNING.kkubeogi_cycle,AWAKE=TABLES.TUNING.kkubeogi_awake;
Rg.kkuAwakeNow=()=>!(Rg.arcs()&&G.f.dolneomeo_arc_kku3)&&(G.anim%NOD)<AWAKE;
/* 판정은 그대로 두고, 고개 들기 직전 32프레임의 기척만 필드에 알려 준다. */
Rg.kkuStirNow=()=>Rg.arcs()&&G.f.dolneomeo_arc_kku3?0:Math.max(0,(G.anim%NOD-(NOD-TABLES.TUNING.kkubeogi_cue))/TABLES.TUNING.kkubeogi_cue);
Rg.art={
  hedgehog(ox,oy,f){const Sp='#6b5038',Sd='#4a3626',Fc='#d9b892',K='#2b1d14';const awake=Rg.kkuAwakeNow();const dn=awake?0:2;
    M(ox,oy,f,-10,-11,15,10,Sp);M(ox,oy,f,-12,-8,3,6,Sp);
    for(let i=0;i<6;i++){M(ox,oy,f,-11+i*3,-13-(i%2),2,3,Sd);}
    M(ox,oy,f,-9,-9,1,1,'#8a6a4a');M(ox,oy,f,-4,-10,1,1,'#8a6a4a');M(ox,oy,f,0,-8,1,1,'#8a6a4a');
    M(ox,oy,f,3,-8+dn,6,6,Fc);M(ox,oy,f,8,-6+dn,2,2,K);
    if(awake){M(ox,oy,f,5,-7,1,1,K);}else{M(ox,oy,f,4,-6+dn,2,1,K);}
    M(ox,oy,f,-6,-1,3,1,Sd);M(ox,oy,f,1,-1,3,1,Sd);
    if(!awake&&ctx.canvas===cv){   // 잠꼬대 z (대화 초상에는 안 그림)
const z=Math.floor(G.anim/24)%3;M(ox,oy,f,8+z,-16-z*3,3,1,'#f4f7fa');M(ox,oy,f,10+z,-15-z*3,1,1,'#f4f7fa');M(ox,oy,f,8+z,-14-z*3,3,1,'#f4f7fa');}},
  goat(ox,oy,f){const Wt='#ece8de',Gy='#bdb6aa',Hn='#7a6a52',K='#2b1d14';
    M(ox,oy,f,-9,-13,14,8,Wt);M(ox,oy,f,-8,-5,2,5,Gy);M(ox,oy,f,-3,-5,2,5,Gy);M(ox,oy,f,1,-5,2,5,Gy);
    M(ox,oy,f,3,-22,6,10,Wt);M(ox,oy,f,8,-19,3,4,Wt);M(ox,oy,f,6,-19,1,1,K);M(ox,oy,f,10,-16,1,1,K);
    M(ox,oy,f,7,-13,2,4,Gy);
    M(ox,oy,f,2,-25,2,4,Hn);M(ox,oy,f,0,-27,3,2,Hn);M(ox,oy,f,-1,-25,2,2,Hn);
    M(ox,oy,f,-10,-13,2,2,Gy);
    M(ox,oy,f,-6,-12,6,2,'#b4432a');},
  mole(ox,oy,f){const Bd='#3e3530',Lt='#5a4e46',Pk='#e0a8a0',K='#1a1410';
    M(ox,oy,f,-7,-13,13,13,Bd);M(ox,oy,f,-5,-15,9,3,Bd);M(ox,oy,f,-4,-11,7,7,Lt);
    M(ox,oy,f,5,-11,3,3,Pk);M(ox,oy,f,3,-13,2,1,K);
    M(ox,oy,f,6,-6,3,2,Pk);M(ox,oy,f,7,-4,2,1,Pk);M(ox,oy,f,-8,-5,2,2,Pk);
    M(ox,oy,f,-5,-1,3,1,K);M(ox,oy,f,1,-1,3,1,K);
    M(ox,oy,f,-6,-17,11,2,'#8a7a5a');},
};
Rg.props={
  /* 꾸벅이의 낙엽 둥지 (억새를 받으면 둥지가 두툼해진다) */
  nest(n){const x=n.x-cam;const full=G.f.kkuDone;R(x-16,GROUND-4,30,4,'#8a6a3a');R(x-14,GROUND-6,26,2,'#a8823e');
    if(full){R(x-18,GROUND-9,34,5,'#e8dcc0');R(x-14,GROUND-11,26,2,'#f4ecd8');}},
  /* 돌쇠 할배의 석수 마당: 반쯤 쌓은 돌탑과 정 */
  yard(n){const x=n.x-cam;R(x-36,GROUND-8,16,8,'#8a8680');R(x-34,GROUND-15,12,7,'#9a9690');R(x-31,GROUND-21,8,6,'#8a8680');R(x-29,GROUND-25,5,4,'#aeaaa4');
    if(Rg.arcs()&&G.f.dolneomeo_arc_dolsoe3){R(x-28,GROUND-28,4,3,'#c4bbb0');R(x-27,GROUND-28,1,1,'#f4f2e8');}
    R(x+14,GROUND-6,14,6,'#7a7670');R(x+16,GROUND-8,10,2,'#9a9690');R(x+20,GROUND-14,1,6,'#6b4423');R(x+19,GROUND-15,3,2,'#9aa0a6');},
};
})();

/* PA-43 돌너머 확장 그림. 기존 필드에서는 호출하지 않는다.
   경치의 먼 장승·돌탑은 실제 고갯길·성황당과 같은 모양으로 그린다. */
(()=>{
if(CLASSIC)return;
const Rg=REGIONS.dolneomeo;
const P={ink:'#38494e',deep:'#394d57',ridge:'#647b87',far:'#a8b7bf',stone:'#818c8c',light:'#b6c1bf',frost:'#edf4f0',moss:'#667b60',earth:'#525d5b',warm:'#ead1a1'};
const springColors={'#edf4f0':'#8b9e78','#a7b8b4':'#8b9e78','#748580':'#667b60','#525d5b':'#626b50',
  '#bfcdd3':'#c5d7c3','#cbd8d9':'#d4dfc8','#dce1da':'#e0e5ce','#a4b7bd':'#b4c4ad',
  '#a3b6be':'#a4b799','#829aa6':'#89a181','#657f89':'#6e896a','#d0ddd6':'#a5b689'};
const px=(x,y,w,h,c)=>R(Math.round(x),Math.round(y),Math.round(w),Math.round(h),Rg.springRevisit()?(springColors[c]||c):c);
const mod=(n,d)=>(n%d+d)%d;
function bands(colors,heights){let y=0;colors.forEach((c,i)=>{px(0,y,W,heights[i],c);y+=heights[i];});}
function wash(stops){const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));for(let y=0;y<H;y+=3){let i=0;while(i<stops.length-2&&y>stops[i+1][0])i++;const a=stops[i],b=stops[i+1],t=Math.max(0,Math.min(1,(y-a[0])/(b[0]-a[0]))),ca=rgb(a[1]),cb=rgb(b[1]);px(0,y,W,3,'#'+ca.map((v,j)=>Math.round(v+(cb[j]-v)*t).toString(16).padStart(2,'0')).join(''));}}
function disc(x,y,r,c){for(let yy=-r;yy<=r;yy++){const ww=Math.floor(Math.sqrt(r*r-yy*yy));px(x-ww,y+yy,ww*2+1,1,c);}}
function ridge(c,base,amplitude,period,offset=0){for(let x=0;x<W;x+=2){const v=x+cam+offset;const y=base-Math.abs(Math.sin(v/period))*amplitude-Math.abs(Math.sin(v/(period*.43)+1.2))*amplitude*.27;px(x,y,2,H-y,c);}}
function pine(x,y,s=1,palette=P){x=Math.round(x);y=Math.round(y);const q=(a,b,w,h,c)=>px(x+a*s,y+b*s,w*s,h*s,c);
  q(-2,-35,3,35,palette.deep);q(0,-44,2,13,palette.deep);q(-3,-8,2,8,palette.ink);q(1,-5,3,5,palette.ink);
  const bough=(cx,cy,w,h)=>{for(let j=0;j<h;j++){const bend=(j-h*.56)/(h*.7),half=Math.floor(w*.5*Math.sqrt(Math.max(0,1-bend*bend)));q(cx-half,cy-h+j,half*2,1,j<2?palette.light:j<h-2?palette.deep:palette.ink);}q(cx-w*.25,cy-h,w*.5,1,palette.frost);q(cx-w*.4,cy-h+2,w*.7,1,palette.frost);q(cx-w*.2,cy-h+4,w*.45,1,palette.moss);q(cx-w/2+3,cy,3,1,palette.deep);q(cx+w/2-6,cy,4,1,palette.deep);};
  bough(1,-38,14,6);bough(-5,-29,23,8);bough(9,-25,23,7);bough(-11,-17,28,8);bough(9,-14,27,8);
  q(-12,-19,13,2,palette.deep);q(2,-27,9,2,palette.deep);q(-7,-29,9,2,palette.deep);
}
function stone(x,y,w,h,seed=0,frost=true){const c=seed%2?P.stone:'#748282';px(x+2,y-h,w-4,1,P.light);px(x,y-h+2,w,h-2,c);px(x+1,y-h,w-2,3,c);px(x+2,y-h+1,w-4,1,frost?P.frost:P.light);px(x+2,y-2,w-4,2,'#626f70');if(w>10){px(x+w-5,y-h+4,1,3,'#5b696a');px(x+4,y-h+3,2,1,'#a2b0ac');}}
function cairn(x,y,height=22,seed=0,frost=true){const count=Math.max(3,Math.floor(height/5));for(let j=0;j<count;j++){const w=Math.max(3,Math.round((count-j)*3.5)),h=j===count-1?4:5;stone(x-w/2+(j%2),y-j*5,w,h,seed+j,frost);}if(seed%7===0)px(x-1,y-height+3,1,3,'#9d5d48');}
function gatePost(x,y,tall=false){const h=tall?54:47;px(x-5,y-h,11,h,'#796d58');px(x-6,y-h-4,13,5,'#4b4e46');px(x-5,y-h-4,12,1,P.frost);px(x-3,y-h+8,2,3,'#293736');px(x+2,y-h+8,2,3,'#293736');px(x-2,y-h+16,5,1,'#293736');px(x-3,y-h+15,1,2,'#293736');px(x+3,y-h+15,1,2,'#293736');px(x-1,y-h+24,3,14,'#5e5b4b');px(x-4,y-h,9,2,'#a2765e');}
function frostGround(){px(0,GROUND,W,H-GROUND,P.earth);px(0,GROUND,W,2,'#a7b8b4');px(0,GROUND+2,W,2,'#748580');const off=Math.floor(cam);for(let x=-(off%7);x<W;x+=7){const v=hash(x+off+9);if(v<.62)px(x,GROUND-1,2,1,v<.28?P.frost:'#d0ddd6');if(v>.75)px(x+2,GROUND+7+Math.floor(v*17),3,1,'#3d4d4c');}}
function backdrop(zone){bands(['#bfcdd3','#cbd8d9','#dce1da','#a4b7bd'],[54,49,59,63]);const keep=cam;cam=Math.round(keep*.08);ridge('#a3b6be',131,44,113,480);cam=Math.round(keep*.17);ridge('#829aa6',151,49,82,720);cam=Math.round(keep*.31);ridge('#657f89',177,39,53,140);cam=keep;
  // 골짜기 안개는 능선보다 조금 빨리 흐른다. 가까운 발판은 덮지 않는다.
  for(let i=0;i<4;i++){const x=mod(i*143-cam*.24,572)-120,y=150+(i%2)*9;px(x,y,136,3,'#a9bfbd');px(x+21,y-2,83,2,'#bbcdca');px(x+12,y+3,104,1,'#9fb8b7');}
  const wing=Vfx.reducedMotion?0:Math.floor(G.anim/24)%2;
  for(let i=0;i<5;i++){const x=mod(58+i*18-cam*.055+(Vfx.reducedMotion?0:G.anim*.035),490)-40,y=52+Math.abs(i-2)*4;px(x,y,2,1,'#7a959c');px(x-3,y-1-wing,3,1,'#7a959c');px(x+2,y-1-wing,3,1,'#7a959c');}
  // 절벽 위 경치가 고갯길과 마을에서 먼저 보인다.
  const distant=Math.round(312-mod(cam*.09,100));px(distant,93,23,5,'#a4b0b1');px(distant+5,88,14,5,'#aab7b6');px(distant+11,83,3,5,'#e7ece4');
  if(zone==='field'){for(let i=0;i<8;i++){const x=mod(i*64-cam*.46,512)-52;pine(x,188,.55+(i%3)*.13);}}
  if(zone==='shrine'){for(let i=0;i<11;i++){const x=mod(i*47-cam*.4,517)-45;cairn(x,184,G.f.dolMemory?.zone===zone?8+i%3*3:15+i%4*5,i+4);}}
  frostGround();
}
function wall(x,y,width){for(let j=0;j<width;j+=17){stone(x+j,y,16,7,j,true);stone(x+j+6,y-7,15,6,j+1,true);}}
function house(x,y,wide=false,variant=0){const w=(wide?80:59)+[0,-7,6][variant%3],h=34+(variant%3)*4,roof=5+variant%3;px(x,y-h,w,h,'#9a9e8d');px(x+5,y-h+4,w-10,h-7,'#bec0a9');px(x-6,y-h-3,w+12,6,'#505e5d');px(x-11,y-h-5,w+22,3,'#e0e6d9');for(let j=0;j<roof;j++){px(x-5+j*3,y-h-7-j,w+10-j*6,2,j%2?'#7e8677':'#6c776d');}px(x+7,y-25,13,14,'#57645a');px(x+8,y-24,11,1,'#d9c794');px(x+13,y-23,1,11,'#aab190');px(x+8,y-18,11,1,'#aab190');px(x+w-24,y-24,16,24,'#586057');px(x+w-22,y-22,12,22,'#6c6c5d');px(x+w-20,y-18,1,14,'#9b9b7e');px(x+6,y-h-12,3,13,'#66736e');if(variant%2){px(x+w+3,y-17,2,17,'#6e715c');px(x+w-1,y-19,11,3,'#a3a17e');}}
function smoke(x,y,seed){const t=Vfx.reducedMotion?0:Math.floor(G.anim/18);for(let i=0;i<4;i++){const rise=(t+i*7)%29,sway=Math.round(Math.sin((rise+seed)*.15)*3);px(x+sway,y-rise,7+i%2*3,2,'#c7d3cd');px(x+sway+2,y-rise-2,4,2,'#c7d3cd');}}
function hearth(x,y,warm=true){stone(x-16,y,32,5,1,false);px(x-12,y-7,24,5,'#555f59');px(x-9,y-7,18,2,'#76796a');px(x-7,y-6,14,3,'#444b45');if(warm){px(x-5,y-5,3,1,'#ba8d62');px(x+2,y-4,2,1,'#b17c55');}px(x-14,y-9,5,3,'#929788');px(x+9,y-9,5,3,'#929788');}
function scenery(zone,fixtures={}){const sx=x=>Math.round(x-cam);const visible=(x,margin=80)=>x>cam-margin&&x<cam+W+margin;
  // 낮은 돌담은 뒤쪽 장식이다. 실제 발판의 흰 윗면은 지역 필드에서 따로 그린다.
  for(let x=80;x<3100;x+=122){if(!visible(x))continue;const y=GROUND-2;stone(sx(x),y,15+(x%3)*3,7,Math.floor(x/122));if(x%244===80){px(sx(x+23),y-5,1,5,'#b8bea1');px(sx(x+21),y-8,5,2,'#c8cbb5');}}
  if(zone==='gate'){
    const gx=fixtures.gateX??1650;gatePost(sx(gx-23),GROUND,true);gatePost(sx(gx+23),GROUND,false);
    const pole=sx(gx);if(!G.f.ppuriPassed){px(pole-19,GROUND-35,38,1,'#d5c59d');for(let i=0;i<5;i++)px(pole-16+i*8,GROUND-34,2,5,i%2?'#f0e8ce':'#9d5d48');}
    for(const x of [180,820,1300,1790,2380])if(visible(x))pine(sx(x),GROUND,.92+hash(x)*.43);
    if(visible(1020))wall(sx(980),GROUND-3,75);
    if(visible(940)){const x=sx(925);stone(x-12,GROUND,24,9,0);px(x-5,GROUND-16,12,6,'#a89c79');px(x-6,GROUND-12,14,1,'#d0c29c');px(x-3,GROUND-16,1,10,'#685f47');}
    if(visible(2170)){const x=sx(2170);stone(x-24,GROUND,16,30,0);stone(x+22,GROUND,18,22,1);px(x-18,GROUND-28,6,23,'#5d716c');px(x-7,GROUND-4,24,3,'#6b7a76');px(x+4,GROUND-6,10,3,'#8e9a90');}
  }else if(zone==='village'){
    for(const [i,x] of [220,1020,1640,2240].entries())if(visible(x,110)){house(sx(x),GROUND-2,x===1020,i);smoke(sx(x+7),GROUND-55-i%3*4,i*9);}
    for(const x of [430,1320,2020,2590])if(visible(x))wall(sx(x),GROUND-2,83);
    const mx=sx(fixtures.millX??1160);stone(mx-29,GROUND,58,36);px(mx-25,GROUND-40,50,5,'#a6b0a7');px(mx-23,GROUND-41,46,1,P.frost);px(mx-2,GROUND-48,4,8,'#746f57');px(mx-4,GROUND-50,8,3,'#746f57');px(mx+17,GROUND-46,2,6,'#5a5f50');
    const ax=sx(fixtures.workshopX??1080);px(ax-25,GROUND-5,48,5,'#5e665c');px(ax-17,GROUND-14,31,9,'#85918a');px(ax-15,GROUND-15,27,2,'#c4cdc1');px(ax+1,GROUND-24,2,9,'#645b47');px(ax-2,GROUND-26,8,3,'#a5b3ab');
    if(visible(740)){const x=sx(772),door=G.f.dolneomeo_mole_pebble;stone(x-18,GROUND,36,5,0);stone(x-16,GROUND-5,8,9,1);stone(x+9,GROUND-5,8,9,0);stone(x-19,GROUND-14,38,4,0);px(x-7,GROUND-13,15,12,'#505e58');px(x+10,GROUND-11,4,2,'#dfe4d2');if(door){px(x-5,GROUND-10,9,10,door==='flat'?'#9eaca1':'#82948c');if(door==='stripe')for(let i=0;i<3;i++)px(x-5,GROUND-9+i*3,9,1,'#bec6b2');px(x+10,GROUND-11,1,1,'#f9edbe');}else{stone(x-33,GROUND,10,4,0);stone(x+27,GROUND,10,4,1);}px(x+12,GROUND-9,1,1,'#f7edc5');}
    if(visible(2080))wall(sx(2055),GROUND-2,67);
    if(visible(2290))hearth(sx(2290),GROUND);
  }else if(zone==='field'){
    for(let x=100;x<3000;x+=9){if(!visible(x,3))continue;const h=3+Math.floor(hash(x)*4);px(sx(x),GROUND-h,1,h,'#a09c7d');if(hash(x+1)>.8)px(sx(x)-1,GROUND-h,3,1,'#d9d9c1');}
    for(const x of [410,1260,2190])if(visible(x))pine(sx(x),GROUND,1.08+hash(x+3)*.55);
    const nx=sx(fixtures.nestX??1510);px(nx-22,GROUND-5,44,5,'#8d876a');px(nx-19,GROUND-8,38,3,'#bab18b');px(nx-15,GROUND-11,30,3,'#d8cfaa');
    for(const x of [720,1730,2570])if(visible(x))wall(sx(x),GROUND-2,62);
  }else if(zone==='cliff'){
    for(let x=60;x<3100;x+=124){if(!visible(x))continue;const h=20+Math.floor(hash(x)*19);stone(sx(x),GROUND,35,h,Math.floor(x/124));px(sx(x)+4,GROUND-h+3,19,1,P.frost);}
    for(const x of [210,1120,2010,2680])if(visible(x))pine(sx(x),GROUND,.84+hash(x+9)*.58);
    const dx=sx(fixtures.daraeX??2780);px(dx-2,96,2,19,'#5f6950');px(dx-16,103,18,2,'#5f6950');px(dx,109,19,2,'#5f6950');px(dx-18,100,4,2,'#8a9d6b');px(dx+15,106,5,2,'#8a9d6b');
    if(visible(1440)){const x=sx(1460),done=G.f.dolneomeo_frog_warm;hearth(x+15,GROUND);stone(x+(done?-21:-3),GROUND,23,4,0,false);px(x+(done?-18:0),GROUND-4,15,1,'#bea882');px(x-48,GROUND-29,8,29,'#5e716e');px(x-48,GROUND-31,12,3,'#a1b2a5');px(x-42,GROUND-25,1,11,'#c5d7d3');px(x-43,GROUND-15,3,2,'#d9e4de');px(x-45,GROUND-1,8,1,'#8baaaa');}
  }else if(zone==='shrine'){
    for(let x=60;x<3100;x+=61){if(!visible(x))continue;cairn(sx(x),GROUND,G.f.dolMemory?.zone===zone?8+Math.floor(hash(x)*10):15+Math.floor(hash(x)*24),Math.floor(x/61));}
    for(const x of [240,880,1510,2510])if(visible(x))pine(sx(x),GROUND,1.16+hash(x+11)*.61);
    const cx=sx(fixtures.shrineX??2400);px(cx-27,GROUND-7,54,7,'#6e7b77');px(cx-22,GROUND-17,44,10,'#8a9790');px(cx-17,GROUND-19,34,2,P.frost);px(cx-18,GROUND-41,3,24,'#726653');px(cx+15,GROUND-41,3,24,'#726653');px(cx-25,GROUND-43,50,4,'#4c605c');px(cx-29,GROUND-45,58,2,P.frost);px(cx-20,GROUND-47,40,2,'#75867b');px(cx-12,GROUND-49,24,2,'#a4b0a0');
  }
}
function front(zone){
  // 받침돌의 흐린 흔적만 보인다. 글자나 집안 낙관은 정하지 않는다.
  const host={gate:[1710,160],village:[1160,161],cliff:[2390,116]}[zone];
  if(host)pawStamp(host[0]-cam,host[1]+2,'#937e73');
  if(Vfx.reducedMotion||Rg.springRevisit())return;for(let i=0;i<13;i++){const x=mod(i*37-Math.floor(G.anim*.13),W),y=mod(i*23+Math.floor(G.anim*.09),H);if(i%3!==1)px(x,y,1,1,i%2?'#eff5ed':'#cbdad7');}if(zone==='shrine'&&Math.floor(G.anim/36)%3===0){px(56,74,17,1,'#dce6df');px(77,72,9,1,'#dce6df');}}

/* 첫 경치: 햇빛은 구름 사이의 틈에서만 따뜻하다. 돌과 서리는 은빛이다. */
function cliffSky(){wash([[0,'#57788e'],[50,'#8ba6af'],[84,'#bdc2b6'],[117,'#efd6a5'],[225,'#e7e5d3']]);disc(291,88,26,'#e8ce9d');disc(291,88,23,'#f2daa7');disc(291,88,19,'#ffe8b2');for(let i=0;i<22;i++)px(mod(i*47-cam*.1,430)-15,25+i%4*9,1,1,'#afc5cd');px(254,105,78,1,'#f9e7bc');px(263,108,58,1,'#f8e6ba');px(176,69,73,1,'#c7c6b7');px(192,67,31,1,'#c7c6b7');px(335,74,56,1,'#d0c8b2');}
function cloudBank(x,y,w,h,c,top){px(x+5,y,w-10,h,c);px(x,y+2,w,h-3,c);px(x+13,y-3,w-26,4,top);px(x+24,y-5,w-48,2,top);px(x+36,y-7,Math.max(12,w-80),2,top);px(x+9,y+h,w-30,1,'#c4d1c9');}
function crag(x,y,w,h,near=false){const dark=near?'#435b61':'#7d9396',light=near?'#b3c6bc':'#bfcec3';for(let i=0;i<w;i+=3){const edge=Math.min(i,w-i),top=y+Math.max(0,12-edge*.6)+Math.floor(hash(i+9)*4);px(x+i,top,3,h-(top-y),dark);if(edge>8)px(x+i,top,3,2,light);}for(let i=0;i<6;i++){const xx=x+6+i*(w-14)/6,yy=y+17+i%3*12;px(xx,yy,2,h-(yy-y)-3,near?'#384f56':'#718b8e');px(xx+2,yy+11,9+i%3*3,1,near?'#6d8788':'#9ab0a8');}px(x+12,y-1,w-24,2,'#e7eedd');}
function cliffFar(){ridge('#9eafb0',139,29,91,190);ridge('#b8bdb1',145,20,65,520);for(let i=0;i<8;i++){const x=mod(i*79-cam,590)-90,y=128+i%3*10;cloudBank(x,y,110,4,'#d8dacc','#e8e3cc');}}
function cliffSea(){for(let i=0;i<9;i++){const x=mod(i*83-cam,650)-110,y=151+i%3*17;cloudBank(x,y,139,7,i%2?'#dbe1d7':'#e8eadf','#eef0e1');px(x+31,y-8,33,1,'#f5f1de');}const x=mod(275-cam,670)-80;crag(x,148,54,78);pine(x+31,148,.56);cairn(x+16,148,11,2);}
function cliffNear(){const a=12-Math.round(cam*.09);for(let x=-20;x<W+20;x+=4){const y=201+Math.round(Math.sin((x+cam)/42)*4);px(x,y,4,H-y,'#435b61');px(x,y,4,2,'#bacdc2');if(hash(x+cam)>.6)px(x,y-1,2,1,'#f5f6de');}crag(a,153,84,72,true);pine(a+40,151,1.55);cairn(347-mod(cam*.2,40),211,24,4);for(let i=0;i<32;i++){const x=mod(i*31-cam,430)-12,y=195+i%4*5;px(x,y,1,1,i%3?'#e6ecda':'#fff2c6');if(i%5===0){px(x-1,y,3,1,'#fff8da');px(x,y-1,1,3,'#fff8da');}}}

/* 두 번째 경치: 수백 개의 소원 돌. 한 장면 안에서도 크기가 달라 깊이가 보인다. */
function shrineSky(){wash([[0,'#6b8796'],[66,'#a4b7b9'],[142,'#c7d1c5'],[225,'#d8d9c7']]);disc(317,49,12,'#e7e6c8');const hold=cam;cam=Math.round(hold*.5);ridge('#7f969e',129,41,102,260);cam=hold;}
function shrineFar(){for(let row=0;row<3;row++)for(let i=0;i<26;i++){const seed=i+row*31,x=mod(i*20+row*9+Math.floor(hash(seed+2)*7)-cam,520)-30,y=124+row*13+Math.floor(hash(seed)*7);const height=7+(i*3+row)%8;for(let j=0;j<height;j+=3){const w=Math.max(2,8-Math.floor(j/3)*2);px(x-w/2,y-j,w,3,row===0?'#94a8a9':'#8da29f');px(x-w/2,y-j,w,1,'#b9c7bd');}}}
function shrineMid(){for(let row=0;row<3;row++)for(let i=0;i<16;i++){const seed=i+row*17,x=mod(i*37+row*17+Math.floor(hash(seed+7)*13)-cam,592)-42,y=155+row*16+Math.floor(hash(seed)*9);cairn(x,y,12+(i*7+row*3)%19,i+row*16);}const x=mod(192-cam,580);px(x-1,95,2,36,'#c5c6a8');px(x-22,109,43,1,'#c6c4a1');for(let i=0;i<5;i++){const xx=x-19+i*9;px(xx,110,2,12+i%2*4,i%2?'#d5d8c4':'#a47f6b');px(xx+1,119+i%2*4,3,2,'#d5d8c4');}for(let i=0;i<4;i++){const xx=mod(60+i*99-cam*.6,480)-40,yy=137+i*11;px(xx,yy,31,1,'#dce3d5');px(xx+33,yy-1,9,1,'#dce3d5');}}
function shrineNear(){px(0,205,W,20,'#526763');for(let x=-20;x<W+35;x+=24){const xx=x-mod(cam,24);stone(xx,213,23,10,Math.floor((x+cam)/24));}for(let i=0;i<8;i++){const x=mod(i*59-cam,472)-30;cairn(x,211,20+(i*7)%20,i+80);}const tree=340-mod(cam*.11,35);pine(tree,203,2.9);px(tree-10,191,22,3,'#7f9080');px(tree-18,196,39,3,'#6a8074');const x=52-mod(cam*.1,25);cairn(x,213,37,3);px(x-2,174,4,1,'#f1edcf');for(let i=0;i<11;i++)px(mod(17+i*43-cam,440)-20,81+i%4*14,1,1,'#dbe7df');}
function drawBlocked(x,y){px(x-15,y-38,3,38,'#7a7058');px(x+12,y-38,3,38,'#7a7058');px(x-16,y-34,32,3,'#b19b70');px(x-13,y-25,26,2,'#cbb786');for(let i=0;i<5;i++)px(x-11+i*5,y-32,2,5,i%2?'#ece7cd':'#9d5d48');stone(x-11,y,22,8,0);}
function drawDepthGate(x,y,spread=0){gatePost(x-24-spread,y,true);gatePost(x+24+spread,y,false);px(x-13,y-1,26,2,'#bdcbb9');px(x-9,y-5,18,1,'#a8bba7');px(x-5,y-8,10,1,'#8ca69b');}
function drawMemoryBridge(x,y,w){for(let i=0;i<w;i+=19){stone(x+i,y,18,6,i,false);if(i%38===0){px(x+i+7,y,4,18,'#8e9690');px(x+i+4,y+16,10,3,'#7e8984');}}px(x-2,y-8,w+4,2,'#a1aaa1');for(let i=0;i<w;i+=38)px(x+i+6,y-17,3,18,'#919c93');}
function drawRestoredBridge(x,y,w){
  for(let i=0;i<w;i+=19){const width=Math.min(18,w-i);if(width<6){px(x+i,y+2,width,5,P.stone);continue;}stone(x+i,y+7,width,7,i,true);px(x+i+4,y+2,Math.min(7,width-5),1,'#b29c81');if(i%38===0){px(x+i+7,y+7,4,GROUND-y-7,'#687b77');px(x+i+4,GROUND-4,10,4,'#7e8c82');}}
  px(x,y,w,2,P.frost); // 실제 발판의 흰 윗면은 끊김 없이 보인다.
}
function drawBridgeWork(x,y){
  const stage=G.f.dolBridgeStage||0;
  for(let i=0;i<5;i++){const sx=x-68+i*43;stone(sx,y,15,7,i,false);if(stage>0)stone(sx+3,y-7,10,6,i+1,false);if(stage>1){px(sx+5,y-27,4,14,'#73857d');px(sx+2,y-29,11,3,'#9caa9b');}}
  if(stage<3){for(let i=0;i<5-stage;i++){const sx=x+28+i*12;stone(sx,y-(i%2)*5,11,5,i,false);px(sx+3,y-3-(i%2)*5,4,1,'#bca68b');}px(x-24,y-2,17,2,'#998d6e');px(x-17,y-14,2,12,'#867a5e');px(x-20,y-16,8,3,'#b7c5bb');}
  if(stage>=3){px(x-34,y-4,10,3,'#bcb58d');px(x-32,y-7,7,3,'#d6cba0');}
}
function drawBridgeWorkMarker(x,y){stone(x-9,y,18,11,0,false);px(x-6,y-9,12,2,'#d8d4b5');px(x-4,y-6,7,1,'#88765e');px(x-4,y-4,10,1,'#88765e');}
function drawBridgeSurvey(x,y,seen){const col=seen?'#adbc98':'#f1ddb3';px(x-7,y-6,14,1,col);px(x-8,y-5,1,5,col);px(x+7,y-5,1,5,col);px(x-4,y-12,8,1,col);px(x-3,y-13,6,1,col);if(!seen){px(x,y-18,1,3,col);px(x-2,y-16,5,1,col);}}

/* 판정 막대는 story.js가 그린다. 여기서는 손을 쓰는 대상만 바꾼다. */
Rg.drawStoneTask=(c,task,st)=>{
  const title=task?.title||'';
  if(!/돌집|등짐|잠자리|바람막이|복원|살피기/.test(title))return false;
  c.save();c.beginPath();c.rect(0,30,320,94);c.clip();
  const q=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const block=(x,y,w,h,col='#8b9586')=>{q(x,y,w,h,col);q(x+2,y+1,w-4,2,'#ccd1b5');q(x+1,y+h-2,w-2,2,'#687467');};
  const n=Math.min(st.hits,3),shift=st.settle?st.land*13:Math.sin(st.phase)*24;
  const hand=(x,y,f=1)=>{q(x,y,18*f,6,'#89775f');q(x+12*f,y-3,8*f,7,'#bca07c');q(x+16*f,y-5,3*f,8,'#d0b28b');};
  q(0,30,320,94,'#efe3c8');
  q(0,115,320,9,'#c6bfa2');q(0,115,320,2,'#a8ad8e');
  if(title.includes('돌집')){
    q(112,73,96,43,'#a8aa8b');q(129,82,62,34,'#736f55');
    if(n>0){block(108,107,28,9);block(184,107,28,9);}
    if(n>1){block(121,82,13,25);block(187,82,13,25);block(121,73,79,9);}
    if(n>2){block(139,93,8,8,'#b7c5ac');q(141,93,2,2,'#f9e9b6');}
    block(140+shift,45,39,12,'#9aa793');hand(107+shift,52);hand(213+shift,52,-1);
    q(64,96,18,20,'#75634f');q(66,91,14,10,'#927c60');q(78,97,7,4,'#d1aa87');q(77,94,2,2,'#323c32');
  }else if(title.includes('등짐')){
    q(139,65,45,51,'#8e7d5a');q(136,66,51,4,'#b5a27a');
    const sy=n>0?94:70;block(143,sy,36,16,'#818a7d');
    for(let i=0;i<7;i++)q(140+i*6,n>1?52:96,2,n>1?22:18,i%2?'#d7c79b':'#b4ab78');
    if(n>2){q(155,54,3,62,'#d4c09b');q(137,90,50,3,'#d4c09b');q(157,89,7,7,'#796a4c');}
    hand(113+shift,100);hand(205+shift,100,-1);q(231,78,12,38,'#c5bea0');q(229,61,4,22,'#ded1af');q(236,59,4,24,'#ded1af');
  }else if(title.includes('잠자리')){
    q(42,114,74,4,'#8daeb0');q(51,112,52,2,'#d4dfcd');
    block(196,68,55,48,'#a4a98c');q(201,74,44,42,'#777e65');
    if(n>0)block(124,109,15,7);const rx=n>1?164:119+shift;
    block(rx,101,55,14,'#a39c76');q(rx+5,101,44,2,'#cfb583');
    if(n>1){q(rx+13,94,1,5,'#e5c795');q(rx+37,93,1,6,'#e5c795');}
    const fx=n>2?rx+24:68;q(fx-10,n>2?90:106,20,9,'#879b72');q(fx-8,n>2?85:101,5,7,'#a5b18a');q(fx+3,n>2?85:101,5,7,'#a5b18a');
    hand(87+shift,103);hand(174+shift,103,-1);
  }else if(title.includes('바람막이')){
    for(let j=0;j<4;j++){block(161,54+j*15,26,14);block(215,54+j*15,26,14);}
    q(189,57,23,58,'#bfc7b2');for(let i=0;i<3;i++)q(58,65+i*13,86,1,'#b6c2b2');
    for(let i=0;i<n;i++)block(187,99-i*15,29,15);
    block(178+shift,40,39,12,'#a7ad91');hand(144+shift,49);hand(242+shift,49,-1);
    q(266,97,15,13,'#415955');q(270,91,12,9,'#415955');q(280,97,10,3,'#aca889');q(274,95,2,2,'#e9e8c8');
  }else{
    q(54,115,215,8,'#8ba9a4');for(let i=0;i<3;i++)q(76+i*65,119,31,1,'#d4dfca');
    block(63,89,36,26);block(225,89,36,26);
    for(let i=0;i<3;i++){
      const x=97+i*43,y=82-(i===1?8:0);if(i<n)block(x,y,42,13,'#9ca68e');
      else{q(x,y,42,1,'#c8bfa1');q(x,y,1,13,'#c8bfa1');q(x+41,y,1,13,'#c8bfa1');}
    }
    if(n>1){q(74,75,5,14,'#a9b399');q(245,75,5,14,'#a9b399');}
    block(137+shift,43,43,13,'#a6af95');hand(102+shift,52);hand(219+shift,52,-1);
  }
  c.restore();return true;
};
function drawWanderer(kind,x,y,f=1){const q=(a,b,w,h,c)=>M(Math.round(x),Math.round(y),f,a,b,w,h,c);if(kind==='hare'||kind==='rabbit'||kind==='porter'){
  q(-7,-20,13,19,'#c4c1ad');q(-5,-24,9,10,'#ded7bc');q(-5,-37,3,14,'#d7d1b9');q(0,-39,3,15,'#d7d1b9');q(-4,-35,1,9,'#ab9e8e');q(1,-37,1,10,'#ab9e8e');q(3,-22,1,2,'#35423e');q(5,-19,3,2,'#938979');q(-9,-16,3,11,'#908c72');q(-12,-18,4,14,'#8b7c5d');q(-13,-18,6,2,'#bbaa7c');q(-7,-2,5,2,'#767764');q(2,-2,5,2,'#767764');q(7,-20,2,20,'#6b735f');q(-8,-21,15,2,'#776d55');
  const helped=!!G.f.dolneomeo_pack_help,heavy=helped?-10:-24,reeds=helped?-23:-11;
  q(-14,heavy,8,7,'#7d8982');q(-13,heavy,6,1,'#bec5af');q(-11,heavy+1,1,5,'#57685f');q(-16,reeds,10,4,'#b4ac85');q(-15,reeds-2,1,7,'#d5cc9e');q(-12,reeds-3,1,8,'#c8bc8f');q(-9,reeds-1,1,6,'#d5cc9e');q(-15,heavy+5,10,1,'#c3b888');
}else if(kind==='mole'||kind==='child'){
  q(-6,-13,12,12,'#70675b');q(-4,-16,8,7,'#8a7967');q(4,-13,4,3,'#d6ab8d');q(3,-15,1,1,'#2e3834');q(-6,-13,11,3,'#a2926c');q(-7,-3,4,3,'#4e5549');q(2,-3,4,3,'#4e5549');q(4,-6,4,3,'#c5ab86');q(6,-8,4,3,'#a7b6a9');q(7,-8,2,1,'#e5e9d8');
}else if(kind==='frog'){
  q(-8,-9,17,8,'#6b8a77');q(-6,-14,12,8,'#849c80');q(-6,-16,4,5,'#98ad8c');q(3,-16,4,5,'#98ad8c');if(G.f.dolneomeo_frog_warm){q(-5,-14,3,1,'#354b42');q(3,-14,3,1,'#354b42');}else{q(-4,-15,1,2,'#354b42');q(4,-15,1,2,'#354b42');}q(-7,-6,15,5,'#aaaf8a');q(-11,-2,5,2,'#648170');q(7,-2,5,2,'#648170');q(-10,-7,3,6,'#648170');q(9,-7,3,6,'#648170');q(-4,-11,2,1,'#d5dab4');q(4,-11,2,1,'#d5dab4');
}else{
  q(-7,-14,14,11,'#344b52');q(-4,-11,9,7,'#e2e4d3');q(2,-20,8,9,'#344b52');q(8,-17,6,2,'#b8b798');q(7,-19,1,1,'#eef1d9');q(-15,-7,10,3,'#344b52');q(-18,-6,4,2,'#71878a');q(-4,-4,1,4,'#75775f');q(3,-4,1,4,'#75775f');q(-7,-12,4,6,'#627b80');
}}
Rg.expansionArt={drawBack:backdrop,drawScenery:scenery,drawFront:front,drawBlocked,drawDepthGate,drawMemoryBridge,drawRestoredBridge,drawBridgeWork,drawBridgeWorkMarker,drawBridgeSurvey,drawWanderer,
  cliffLayers:[{speed:.04,draw:cliffSky},{speed:.14,draw:cliffFar},{speed:.4,draw:cliffSea},{speed:.83,draw:cliffNear}],
  shrineLayers:[{speed:.04,draw:shrineSky},{speed:.16,draw:shrineFar},{speed:.43,draw:shrineMid},{speed:.86,draw:shrineNear}],
};
})();
