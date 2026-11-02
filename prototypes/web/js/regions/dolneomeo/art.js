'use strict';
/* 돌너머 동물들의 도트 그림과 소품. (ox, oy)는 발밑, f 는 바라보는 방향 */
(()=>{
const Rg=REGIONS.dolneomeo;
Rg.springRevisit=()=>!CLASSIC&&!!G?.f?.spring&&regionCompleted('yeongsan');
/* 꾸벅이는 졸다가 잠깐씩 고개를 든다. 고개를 든 동안에만 말이 통한다 */
const NOD=TABLES.TUNING.kkubeogi_cycle,AWAKE=TABLES.TUNING.kkubeogi_awake;
// 결정 D-130: 사연을 켜면 그림을 둥지에 단 뒤(kku7)에야 깊이 잠든다. 그 전엔 꾸벅꾸벅 고개를 든다.
Rg.kkuAwakeNow=()=>!(Rg.arcs()&&G.f.dolneomeo_arc_kku7)&&(G.anim%NOD)<AWAKE;
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
/* 결정 D-263: 장승 둘은 실제 장승처럼 다르게 깎는다 (사용자 피드백 2026-11-02: 두 장승이 너무 같은 그림이다).
   - 천하대장군(tall, 왼쪽): 키가 크고 검은 사모를 쓴다. 굵게 치켜 올린 눈썹, 부릅뜬 왕방울 눈, 큰 코, 이를 드러낸 입과 송곳니, 턱수염. 붉은 칠이 바랜 짙은 나무.
   - 지하여장군(오른쪽): 작고 갓 없이 둥근 머리에 가르마 탄 검은 머리. 가는 눈썹, 내리감은 순한 눈, 작은 코와 다문 입, 볼에 연지. 밝은 나무.
   - 몸통 글씨(세로 다섯 자·넷 자)와 나뭇결·갈라진 틈 자리도 서로 다르다. (x,y)는 발치 가운데. */
function gatePost(x,y,tall=false){
  const K='#26201b',Wt='#eee5cc';
  if(tall){
    const h=56;
    px(x-5,y-h,11,h,'#6f5f4b');px(x-5,y-h,1,h,'#5c4e3e');px(x+5,y-h+22,1,h-22,'#857257');            // 몸통과 그늘
    px(x-3,y-h+24,1,22,'#5e503f');px(x+3,y-h+30,1,18,'#5e503f');px(x+2,y-h+44,2,1,'#4a3f33');           // 나뭇결·갈라진 틈
    px(x-5,y-h,11,21,'#94583f');px(x-5,y-h+19,11,2,'#7a4a36');                                        // 바랜 붉은 얼굴
    px(x-4,y-h-7,9,6,'#2b2925');px(x-6,y-h-2,13,2,'#2b2925');px(x-9,y-h-5,3,2,'#2b2925');px(x+7,y-h-5,3,2,'#2b2925');   // 사모와 양 날개
    px(x-4,y-h-7,9,1,P.frost);px(x-6,y-h-2,13,1,'#4a4740');
    px(x-5,y-h+3,3,1,K);px(x-3,y-h+4,2,1,K);px(x+3,y-h+3,3,1,K);px(x+2,y-h+4,2,1,K);                     // 치켜 올린 눈썹
    px(x-4,y-h+6,3,3,Wt);px(x+2,y-h+6,3,3,Wt);px(x-3,y-h+7,1,1,K);px(x+3,y-h+7,1,1,K);                  // 부릅뜬 눈
    px(x-1,y-h+9,3,4,'#7a4532');px(x-1,y-h+12,1,1,K);px(x+1,y-h+12,1,1,K);                              // 큰 코
    px(x-4,y-h+14,9,3,K);px(x-3,y-h+14,7,1,Wt);px(x-3,y-h+15,1,2,Wt);px(x+3,y-h+15,1,2,Wt);            // 이와 송곳니
    px(x-3,y-h+18,1,3,'#3d322a');px(x-1,y-h+18,1,4,'#3d322a');px(x+1,y-h+18,1,4,'#3d322a');px(x+3,y-h+18,1,3,'#3d322a');   // 턱수염
    for(let i=0;i<5;i++){const yy=y-h+24+i*6;px(x-1,yy,3,1,K);px(x,yy-1+(i%2),1,3,K);if(i%2)px(x-1,yy+2,1,1,K);else px(x+1,yy+2,1,1,K);}   // 天下大將軍
  }else{
    const h=46;
    px(x-5,y-h,10,h,'#958467');px(x+4,y-h,1,h,'#7f7057');px(x-4,y-h-2,8,2,'#958467');px(x-3,y-h-3,6,1,'#958467');   // 둥근 머리 몸통
    px(x-2,y-h+22,1,18,'#83745b');px(x+2,y-h+18,1,14,'#83745b');                                        // 나뭇결
    px(x-4,y-h-3,8,4,'#2f2924');px(x-3,y-h-3,6,1,P.frost);px(x,y-h-2,1,3,'#958467');                    // 가르마 탄 검은 머리
    px(x-4,y-h+4,3,1,'#4a3c30');px(x+1,y-h+4,3,1,'#4a3c30');                                            // 가는 눈썹
    px(x-4,y-h+6,3,1,K);px(x+1,y-h+6,3,1,K);px(x-3,y-h+7,1,1,'#6e5f4a');px(x+2,y-h+7,1,1,'#6e5f4a');     // 내리감은 눈
    px(x-1,y-h+8,1,3,'#76664f');                                                                       // 작은 코
    px(x-4,y-h+9,2,2,'#b4513a');px(x+2,y-h+9,2,2,'#b4513a');                                            // 연지
    px(x-2,y-h+12,3,1,'#7a3326');                                                                      // 다문 입
    for(let i=0;i<4;i++){const yy=y-h+19+i*6;px(x-2,yy,3,1,K);px(x-1,yy+1,1,2,K);if(i===1||i===3)px(x-2,yy+2,1,1,K);}   // 地下女將軍
  }
  px(x-6,y-2,13,2,'#5d6660');px(x-4,y-3,3,1,P.frost);                                                  // 발치에 괸 돌
}
/* 결정 D-166: 장승이 비켜 설 때는 발치를 축으로 바깥쪽으로 기운다 (open 0~1) */
function leanPost(x,y,tall,angle){if(!angle){gatePost(x,y,tall);return;}ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(angle);gatePost(0,0,tall);ctx.restore();}
const OPEN_PX=14,OPEN_LEAN=.14;
function gatePair(x,y,open=0,gap=23){const o=Math.round(open*OPEN_PX),a=open*OPEN_LEAN;leanPost(x-gap-o,y,true,-a);leanPost(x+gap+o,y,false,a);}
function frostGround(){px(0,GROUND,W,H-GROUND,P.earth);px(0,GROUND,W,2,'#a7b8b4');px(0,GROUND+2,W,2,'#748580');const off=Math.floor(cam);for(let x=-(off%7);x<W;x+=7){const v=hash(x+off+9);if(v<.62)px(x,GROUND-1,2,1,v<.28?P.frost:'#d0ddd6');if(v>.75)px(x+2,GROUND+7+Math.floor(v*17),3,1,'#3d4d4c');}}
function backdrop(zone){bands(['#bfcdd3','#cbd8d9','#dce1da','#a4b7bd'],[54,49,59,63]);const keep=cam,rk=RC();cam=Math.round(rk*.08);ridge('#a3b6be',131,44,113,480);cam=Math.round(rk*.17);ridge('#829aa6',151,49,82,720);cam=Math.round(rk*.31);ridge('#657f89',177,39,53,140);cam=keep;
  // 골짜기 안개는 능선보다 조금 빨리 흐른다. 가까운 발판은 덮지 않는다.
  for(let i=0;i<4;i++){const x=mod(i*143-RC()*.24,572)-120,y=150+(i%2)*9;px(x,y,136,3,'#a9bfbd');px(x+21,y-2,83,2,'#bbcdca');px(x+12,y+3,104,1,'#9fb8b7');}
  const wing=Vfx.reducedMotion?0:Math.floor(G.anim/24)%2;
  for(let i=0;i<5;i++){const x=mod(58+i*18-RC()*.055+(Vfx.reducedMotion?0:G.anim*.035),490)-40,y=52+Math.abs(i-2)*4;px(x,y,2,1,'#7a959c');px(x-3,y-1-wing,3,1,'#7a959c');px(x+2,y-1-wing,3,1,'#7a959c');}
  // 절벽 위 경치가 고갯길과 마을에서 먼저 보인다.
  const distant=Math.round(312-mod(RC()*.09,100));px(distant,93,23,5,'#a4b0b1');px(distant+5,88,14,5,'#aab7b6');px(distant+11,83,3,5,'#e7ece4');
  if(zone==='field'){for(let i=0;i<8;i++){const x=mod(i*64-RC()*.46,512)-52;pine(x,188,.55+(i%3)*.13);}}
  if(zone==='shrine'){for(let i=0;i<11;i++){const x=mod(i*47-RC()*.4,517)-45;cairn(x,184,15+i%4*5,i+4);}}
  frostGround();
}
function wall(x,y,width){for(let j=0;j<width;j+=17){stone(x+j,y,16,7,j,true);stone(x+j+6,y-7,15,6,j+1,true);}}
function house(x,y,wide=false,variant=0){const w=(wide?80:59)+[0,-7,6][variant%3],h=34+(variant%3)*4,roof=5+variant%3;px(x,y-h,w,h,'#9a9e8d');px(x+5,y-h+4,w-10,h-7,'#bec0a9');px(x-6,y-h-3,w+12,6,'#505e5d');px(x-11,y-h-5,w+22,3,'#e0e6d9');for(let j=0;j<roof;j++){px(x-5+j*3,y-h-7-j,w+10-j*6,2,j%2?'#7e8677':'#6c776d');}px(x+7,y-25,13,14,'#57645a');px(x+8,y-24,11,1,'#d9c794');px(x+13,y-23,1,11,'#aab190');px(x+8,y-18,11,1,'#aab190');px(x+w-24,y-24,16,24,'#586057');px(x+w-22,y-22,12,22,'#6c6c5d');px(x+w-20,y-18,1,14,'#9b9b7e');px(x+6,y-h-12,3,13,'#66736e');if(variant%2){px(x+w+3,y-17,2,17,'#6e715c');px(x+w-1,y-19,11,3,'#a3a17e');}}
function smoke(x,y,seed){const t=Vfx.reducedMotion?0:Math.floor(G.anim/18);for(let i=0;i<4;i++){const rise=(t+i*7)%29,sway=Math.round(Math.sin((rise+seed)*.15)*3);px(x+sway,y-rise,7+i%2*3,2,'#c7d3cd');px(x+sway+2,y-rise-2,4,2,'#c7d3cd');}}
function hearth(x,y,warm=true){stone(x-16,y,32,5,1,false);px(x-12,y-7,24,5,'#555f59');px(x-9,y-7,18,2,'#76796a');px(x-7,y-6,14,3,'#444b45');if(warm){px(x-5,y-5,3,1,'#ba8d62');px(x+2,y-4,2,1,'#b17c55');}px(x-14,y-9,5,3,'#929788');px(x+9,y-9,5,3,'#929788');}
function scenery(zone,fixtures={}){const sx=x=>Math.round(tx(x)-cam);const visible=(x,margin=80)=>{const t=tx(x);return t>cam-margin&&t<cam+W+margin;};   // tx: 줄인 구역 좌표 (D-109)
  // 낮은 돌담은 뒤쪽 장식이다. 실제 발판의 흰 윗면은 지역 필드에서 따로 그린다.
  for(let x=80;x<3100;x+=122){if(!visible(x))continue;const y=GROUND-2;stone(sx(x),y,15+(x%3)*3,7,Math.floor(x/122));if(x%244===80){px(sx(x+23),y-5,1,5,'#b8bea1');px(sx(x+21),y-8,5,2,'#c8cbb5');}}
  if(zone==='gate'){
    const gx=fixtures.gateX??1650;gatePair(sx(gx),GROUND,Rg.depthOpen?.('dol_depth_gate')||0);
    const pole=sx(gx);if(!G.f.ppuriPassed)keumjul(pole,GROUND-36,19);   // 결정 D-264: 장승 둘 사이에 금줄만
    for(const x of [180,820,1300,1930,2380])if(visible(x))pine(sx(x),GROUND,.92+hash(x)*.43);
    if(visible(1020))wall(sx(980),GROUND-3,75);
    if(visible(940)){const x=sx(925);stone(x-12,GROUND,24,9,0);px(x-5,GROUND-16,12,6,'#a89c79');px(x-6,GROUND-12,14,1,'#d0c29c');px(x-3,GROUND-16,1,10,'#685f47');}
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
    for(let x=60;x<3100;x+=61){if(!visible(x))continue;cairn(sx(x),GROUND,15+Math.floor(hash(x)*24),Math.floor(x/61));}
    for(const x of [240,880,1510,2510])if(visible(x))pine(sx(x),GROUND,1.16+hash(x+11)*.61);
    const cx=sx(fixtures.shrineX??2400);px(cx-27,GROUND-7,54,7,'#6e7b77');px(cx-22,GROUND-17,44,10,'#8a9790');px(cx-17,GROUND-19,34,2,P.frost);px(cx-18,GROUND-41,3,24,'#726653');px(cx+15,GROUND-41,3,24,'#726653');px(cx-25,GROUND-43,50,4,'#4c605c');px(cx-29,GROUND-45,58,2,P.frost);px(cx-20,GROUND-47,40,2,'#75867b');px(cx-12,GROUND-49,24,2,'#a4b0a0');
  }
}
function front(zone){
  // 아빠 도장 자리(받침과 흐린 손바닥)는 엔진이 도장 자리마다 그린다 (결정 D-115, engine/field.js drawStampBase).
  if(Vfx.reducedMotion||Rg.springRevisit())return;for(let i=0;i<13;i++){const x=mod(i*37-Math.floor(G.anim*.13),W),y=mod(i*23+Math.floor(G.anim*.09),H);if(i%3!==1)px(x,y,1,1,i%2?'#eff5ed':'#cbdad7');}if(zone==='shrine'&&Math.floor(G.anim/36)%3===0){px(56,74,17,1,'#dce6df');px(77,72,9,1,'#dce6df');}}

/* 첫 경치: 햇빛은 구름 사이의 틈에서만 따뜻하다. 돌과 서리는 은빛이다. */
function cliffSky(){wash([[0,'#57788e'],[50,'#8ba6af'],[84,'#bdc2b6'],[117,'#efd6a5'],[225,'#e7e5d3']]);disc(291,88,26,'#e8ce9d');disc(291,88,23,'#f2daa7');disc(291,88,19,'#ffe8b2');for(let i=0;i<22;i++)px(mod(i*47-RC()*.1,430)-15,25+i%4*9,1,1,'#afc5cd');px(254,105,78,1,'#f9e7bc');px(263,108,58,1,'#f8e6ba');px(176,69,73,1,'#c7c6b7');px(192,67,31,1,'#c7c6b7');px(335,74,56,1,'#d0c8b2');}
function cloudBank(x,y,w,h,c,top){px(x+5,y,w-10,h,c);px(x,y+2,w,h-3,c);px(x+13,y-3,w-26,4,top);px(x+24,y-5,w-48,2,top);px(x+36,y-7,Math.max(12,w-80),2,top);px(x+9,y+h,w-30,1,'#c4d1c9');}
function crag(x,y,w,h,near=false){const dark=near?'#435b61':'#7d9396',light=near?'#b3c6bc':'#bfcec3';for(let i=0;i<w;i+=3){const edge=Math.min(i,w-i),top=y+Math.max(0,12-edge*.6)+Math.floor(hash(i+9)*4);px(x+i,top,3,h-(top-y),dark);if(edge>8)px(x+i,top,3,2,light);}for(let i=0;i<6;i++){const xx=x+6+i*(w-14)/6,yy=y+17+i%3*12;px(xx,yy,2,h-(yy-y)-3,near?'#384f56':'#718b8e');px(xx+2,yy+11,9+i%3*3,1,near?'#6d8788':'#9ab0a8');}px(x+12,y-1,w-24,2,'#e7eedd');}
function cliffFar(){ridge('#9eafb0',139,29,91,190);ridge('#b8bdb1',145,20,65,520);for(let i=0;i<8;i++){const x=mod(i*79-cam,590)-90,y=128+i%3*10;cloudBank(x,y,110,4,'#d8dacc','#e8e3cc');}}
function cliffSea(){for(let i=0;i<9;i++){const x=mod(i*83-cam,650)-110,y=151+i%3*17;cloudBank(x,y,139,7,i%2?'#dbe1d7':'#e8eadf','#eef0e1');px(x+31,y-8,33,1,'#f5f1de');}const x=mod(275-cam,670)-80;crag(x,148,54,78);pine(x+31,148,.56);cairn(x+16,148,11,2);}
function cliffNear(){const a=12-Math.round(RC()*.09);for(let x=-20;x<W+20;x+=4){const y=201+Math.round(Math.sin((x+cam)/42)*4);px(x,y,4,H-y,'#435b61');px(x,y,4,2,'#bacdc2');if(hash(x+cam)>.6)px(x,y-1,2,1,'#f5f6de');}crag(a,153,84,72,true);pine(a+40,151,1.55);cairn(347-mod(RC()*.2,40),211,24,4);for(let i=0;i<32;i++){const x=mod(i*31-cam,430)-12,y=195+i%4*5;px(x,y,1,1,i%3?'#e6ecda':'#fff2c6');if(i%5===0){px(x-1,y,3,1,'#fff8da');px(x,y-1,1,3,'#fff8da');}}}

/* 두 번째 경치: 수백 개의 소원 돌. 한 장면 안에서도 크기가 달라 깊이가 보인다. */
function shrineSky(){wash([[0,'#6b8796'],[66,'#a4b7b9'],[142,'#c7d1c5'],[225,'#d8d9c7']]);disc(317,49,12,'#e7e6c8');const hold=cam;cam=Math.round(RC()*.5);ridge('#7f969e',129,41,102,260);cam=hold;}
function shrineFar(){for(let row=0;row<3;row++)for(let i=0;i<26;i++){const seed=i+row*31,x=mod(i*20+row*9+Math.floor(hash(seed+2)*7)-cam,520)-30,y=124+row*13+Math.floor(hash(seed)*7);const height=7+(i*3+row)%8;for(let j=0;j<height;j+=3){const w=Math.max(2,8-Math.floor(j/3)*2);px(x-w/2,y-j,w,3,row===0?'#94a8a9':'#8da29f');px(x-w/2,y-j,w,1,'#b9c7bd');}}}
function shrineMid(){for(let row=0;row<3;row++)for(let i=0;i<16;i++){const seed=i+row*17,x=mod(i*37+row*17+Math.floor(hash(seed+7)*13)-cam,592)-42,y=155+row*16+Math.floor(hash(seed)*9);cairn(x,y,12+(i*7+row*3)%19,i+row*16);}const x=mod(192-cam,580);px(x-1,95,2,36,'#c5c6a8');px(x-22,109,43,1,'#c6c4a1');for(let i=0;i<5;i++){const xx=x-19+i*9;px(xx,110,2,12+i%2*4,i%2?'#d5d8c4':'#a47f6b');px(xx+1,119+i%2*4,3,2,'#d5d8c4');}for(let i=0;i<4;i++){const xx=mod(60+i*99-RC()*.6,480)-40,yy=137+i*11;px(xx,yy,31,1,'#dce3d5');px(xx+33,yy-1,9,1,'#dce3d5');}}
function shrineNear(){px(0,205,W,20,'#526763');for(let x=-20;x<W+35;x+=24){const xx=x-mod(cam,24);stone(xx,213,23,10,Math.floor((x+cam)/24));}for(let i=0;i<8;i++){const x=mod(i*59-cam,472)-30;cairn(x,211,20+(i*7)%20,i+80);}const tree=340-mod(RC()*.11,35);pine(tree,203,2.9);px(tree-10,191,22,3,'#7f9080');px(tree-18,196,39,3,'#6a8074');const x=52-mod(RC()*.1,25);cairn(x,213,37,3);px(x-2,174,4,1,'#f1edcf');for(let i=0;i<11;i++)px(mod(17+i*43-cam,440)-20,81+i%4*14,1,1,'#dbe7df');}
/* 결정 D-264: 막힌 길은 기둥·가로대 틀 없이 금줄로만 막는다 (검수: 기둥 둘에 가로대 둘, 윗대가 기둥 밖으로 뻗은 옛 틀이 일본 도리이처럼 보였다).
   금줄은 왼새끼로 꼰 새끼줄이 가운데로 처지고, 사이사이 한지 오리와 솔가지를 끼운다. (x,y)는 줄 가운데 아래 땅, top은 묶은 높이, half는 반 길이. */
function keumjul(x,top,half){
  const sag=Math.max(2,Math.round(half/6)),yAt=i=>top+Math.round(sag*(1-(i/half)*(i/half)));
  for(let i=-half;i<=half;i++){const yy=yAt(i);px(x+i,yy,1,2,(i+half)%3===0?'#9c8452':'#c9b27a');}   // 꼰 새끼줄
  for(let i=-half+4,k=0;i<=half-4;i+=5,k++){const yy=yAt(i)+2;
    if(k%2===0){px(x+i,yy,2,2,'#f3eedb');px(x+i+1,yy+2,2,2,'#f3eedb');px(x+i,yy+4,2,1,'#dcd5bd');}   // 한지 오리 (꺾어 접은 흰 종이)
    else{px(x+i-1,yy,3,2,'#4f6b3a');px(x+i,yy+2,2,1,'#6d8a4c');}}                                          // 솔가지
}
/* 결정 D-264: 장승이 없는 막힌 길은 양쪽에 작은 돌무더기를 괴고 그 사이에 낮은 금줄을 맨다 */
function drawBlocked(x,y){cairn(x-16,y,12,3);cairn(x+16,y,12,4);keumjul(x,y-11,15);}
function drawDepthGate(x,y,spread=0,open=0){gatePair(x,y,open,24+spread);px(x-13,y-1,26,2,'#bdcbb9');px(x-9,y-5,18,1,'#a8bba7');px(x-5,y-8,10,1,'#8ca69b');}
/* 결정 D-166: 금줄만. 장승 둘은 문 그림(drawDepthGate)이 늘 그린다 */
function drawGateRope(x,y){keumjul(x,y-36,20);}   // 결정 D-264
/* 결정 D-164: 고갯길 길섶의 소원 돌탑. 길손들이 하나씩 얹다 허리께에서 멈췄다. stage(0~3)는 아이가 얹은 돌 수.
   아이가 얹은 돌은 아직 서리가 앉지 않았다. 짐꾼이 괸 돌(hare)은 밑동 옆에 하나 더 붙는다. */
const TOWER_ROWS=[[26,6],[22,6],[19,5],[15,5],[12,4]],TOWER_ADD=[[10,4],[8,3],[5,3]];
// 결정 D-230: offs는 아이가 얹은 돌마다 탑 가운데에서 비낀 거리(px). 새로 얹으면 늘 이 고정값이고, 옛 쌓기 판의 저장에 G.f.dolWishOffs가 있으면 그 자리를 그대로 그린다.
const TOWER_OFFS=[0,1,0];
function towerStones(x,y,stage,drop=0,hare=false,offs=TOWER_OFFS){
  let top=y;
  TOWER_ROWS.forEach(([w,h],j)=>{stone(x-w/2+(j%2?1:-1),top,w,h,j+3,true);top-=h;});
  if(hare)stone(x+13,y,7,4,9,false);
  for(let i=0;i<Math.min(stage,3);i++){const [w,h]=TOWER_ADD[i],lift=i===stage-1?Math.round(drop):0;stone(Math.round(x-w/2+(offs[i]??0)),top-lift,w,h,i,false);top-=h;}
  return top;
}
const wishOffs=()=>G.f.dolWishOffs||TOWER_OFFS;
function drawWishTower(x,y,stage=0,hare=false){towerStones(Math.round(x),Math.round(y),stage,0,hare,wishOffs());}
/* 대사 장면 그림(64×44, D-152). drop이면 마지막 돌이 위에서 내려와 앉는다 */
function wishSky(w,h){
  const g=h-12;
  px(0,0,w,h,'#cbd8d9');px(0,0,w,12,'#bfcdd3');
  for(let i=0;i<w;i+=2){const yy=g-12+Math.round(Math.abs(Math.sin(i/9))*5);px(i,yy,2,g-yy,'#a3b6be');}
  px(0,g,w,12,'#7d8a86');px(0,g,w,1,'#edf4f0');for(let i=3;i<w;i+=7)px(i,g+1+(i%3),2,1,'#d0ddd6');
  pine(9,g+1,.5);
}
function wishTowerPic(stage,drop=false){
  let start=null;
  return {animate:drop,draw(w,h,t){
    if(start===null){start=t;if(drop)Sound.stone('tap');}
    wishSky(w,h);
    const k=drop?clamp((t-start)/.35,0,1):1;
    towerStones(32,39,stage,(1-k*k)*14,false,wishOffs());
    if(drop&&k<1)px(30,8,4,1,'#edf4f0');
  }};
}
/* 결정 D-229: 소원 돌탑 얹기 장면. s={n:얹은 수, offs, cx, ground, stone:{x,y,paws}}.
   든 돌은 아이 두 앞발에 들려 내려오고, 맨 위 돌에 앉을 자리의 옅은 그림자가 진다. */
const WISH_ARM='#3d332b',WISH_PAD='#7a6656';
/* 맨 위 돌 윗면의 [왼쪽, 오른쪽] (든 돌이 닿을 자리) */
function wishStackSpan(cx,n,offs){
  if(!n){const j=TOWER_ROWS.length-1,[w]=TOWER_ROWS[j],l=cx-w/2+(j%2?1:-1);return [l,l+w];}
  const [w]=TOWER_ADD[n-1],l=Math.round(cx-w/2+(offs[n-1]??0));return [l,l+w];
}
function wishStackPaint(w,h,s){
  wishSky(w,h);
  const top=towerStones(s.cx,s.ground,s.n,0,false,s.offs);
  const b=s.stone;if(!b||s.n>=3)return;
  const [sw,sh]=TOWER_ADD[s.n],l=Math.round(b.x-sw/2);
  if(b.paws){const [sl,sr]=wishStackSpan(s.cx,s.n,s.offs),x0=Math.max(l,sl),x1=Math.min(l+sw,sr);if(x1>x0)px(x0,top-1,x1-x0,1,'rgba(40,52,56,.35)');}
  stone(l,Math.round(b.y),sw,sh,s.n,false);
  // 아이의 두 앞발(화면 위에서 뻗어 내려온 팔)이 돌 양옆을 쥐고 있다
  if(b.paws){const y=Math.round(b.y)-sh;
    for(const ax of [l-2,l+sw]){px(ax,0,2,y+1,WISH_ARM);px(ax,y+1,2,2,WISH_ARM);}
    px(l-1,y+1,1,1,WISH_PAD);px(l+sw,y+1,1,1,WISH_PAD);}
}
/* 지금 맨 위 돌의 윗면 높이 (든 돌이 내려앉을 높이) */
function wishStackTop(ground,n){let top=ground;TOWER_ROWS.forEach(([,h])=>top-=h);for(let i=0;i<n;i++)top-=TOWER_ADD[i][1];return top;}
/* 결정 D-165: 성황당 돌탑 그늘에 녹지 않은 첫눈 둔덕. 오른쪽으로 갈수록 높다 */
function drawSnowDrift(x,y){
  for(const [dx,w,h] of [[-4,56,7],[52,72,11],[130,96,15]])
    for(let j=0;j<h;j++){const half=Math.round(w/2*Math.sqrt(1-(j/h)**2));px(x+dx+w/2-half,y-j-1,half*2,1,j>=h-2?'#ffffff':j%3?'#e4ecee':'#d3dfe3');}
}
/* 다진 눈 계단: 윗면은 밟을 자리, 밑은 땅까지 다져진 눈 둔덕 */
function drawSnowStep(x,y,w){
  // 밑은 땅까지 다져진 눈. 아래로 갈수록 그늘이 진다
  const h=GROUND-y-6;for(let j=0;j<h;j+=3){const k=j/h;px(x+3,y+6+j,w-6,3,k<.35?'#dde6e9':k<.7?'#d2dde1':'#c5d2d7');}
  px(x+3,y+6,1,h,'#bccbd0');px(x+w-4,y+6,1,h,'#e8eff1');
  px(x+1,y,w-2,6,'#e4ecee');px(x,y+1,w,4,'#e4ecee');px(x+1,y,w-2,2,'#ffffff');px(x+2,y+5,w-4,1,'#b9c8cc');
  for(let k=9;k<w;k+=15)px(x+k,y+2,3,1,'#c6d3d6');for(let k=6;k<w-6;k+=11)px(x+k,y+10+(k%3)*7,2,1,'#e9f0f2');
}

function drawWanderer(kind,x,y,f=1){const q=(a,b,w,h,c)=>M(Math.round(x),Math.round(y),f,a,b,w,h,c);if(kind==='hare'||kind==='rabbit'||kind==='porter'){
  const helped=!!G.f.dolneomeo_pack_help,heavy=helped?-10:-24,reeds=helped?-23:-11;
  // 결정 D-209: 짐을 거꾸로 멘 동안(숫돌이 꼭대기) 등짐이 좌우로 쏠리고, 짐꾼은 그 쪽으로 끌려 휘청이며 한 발을 내딛는다(사용자 피드백 45).
  // 필드에서만 움직인다(대화 초상은 그대로). 고쳐 맨 뒤에는 똑바로 선다.
  const wob=!helped&&ctx.canvas===cv&&!Vfx.reducedMotion,sw=wob?Math.sin(G.anim/17):0;
  const lean=Math.round(sw*1.4),load=Math.round(sw*2.8),stag=wob&&Math.abs(sw)>.82?(sw>0?-2:2):0;
  const b=(a,y,w,h,c)=>q(a+lean,y,w,h,c),k=(a,y,w,h,c)=>q(a+load,y,w,h,c);
  b(-7,-20,13,19,'#c4c1ad');b(-5,-24,9,10,'#ded7bc');b(-5,-37,3,14,'#d7d1b9');b(0,-39,3,15,'#d7d1b9');b(-4,-35,1,9,'#ab9e8e');b(1,-37,1,10,'#ab9e8e');b(3,-22,1,2,'#35423e');b(5,-19,3,2,'#938979');b(-9,-16,3,11,'#908c72');b(-12,-18,4,14,'#8b7c5d');b(-13,-18,6,2,'#bbaa7c');
  q(-7+(stag<0?stag:0),-2-(stag<0?1:0),5,2,'#767764');q(2+(stag>0?stag:0),-2-(stag>0?1:0),5,2,'#767764');q(7,-20,2,20,'#6b735f');b(-8,-21,15,2,'#776d55');
  const sq=helped?b:k;   // 숫돌: 거꾸로 멘 동안 꼭대기에서 크게 흔들린다
  sq(-14,heavy,8,7,'#7d8982');sq(-13,heavy,6,1,'#bec5af');sq(-11,heavy+1,1,5,'#57685f');b(-16,reeds,10,4,'#b4ac85');b(-15,reeds-2,1,7,'#d5cc9e');b(-12,reeds-3,1,8,'#c8bc8f');b(-9,reeds-1,1,6,'#d5cc9e');
  if(helped)b(-15,heavy+5,10,1,'#c3b888');else{const m=Math.round(load/2);q(-14+m,heavy+7,1,reeds-heavy-7,'#c3b888');q(-8+m,heavy+7,1,reeds-heavy-7,'#c3b888');}   // 끈: 위 숫돌에서 밑 억새로 늘어진다
  if(wob&&G.anim%96<34)b(6,-31-Math.floor((G.anim%96)/12),1,2,'#d4e4ea');   // 진땀
}else if(kind==='mole'||kind==='child'){
  q(-6,-13,12,12,'#70675b');q(-4,-16,8,7,'#8a7967');q(4,-13,4,3,'#d6ab8d');q(3,-15,1,1,'#2e3834');q(-6,-13,11,3,'#a2926c');q(-7,-3,4,3,'#4e5549');q(2,-3,4,3,'#4e5549');q(4,-6,4,3,'#c5ab86');q(6,-8,4,3,'#a7b6a9');q(7,-8,2,1,'#e5e9d8');
}else if(kind==='badger'){
  // 결정 D-118: 메밀밭 일꾼 오소리. 머릿수건, 메밀 묻은 앞치마, 무릎이 아파 짚는 막대.
  q(-9,-14,18,13,'#5d5a55');q(-7,-21,13,9,'#6a6660');q(-2,-22,3,10,'#e8e4d6');q(-7,-19,4,5,'#3e3c39');q(3,-19,3,5,'#3e3c39');
  q(3,-17,1,1,'#f2efe2');q(6,-15,2,2,'#2b2a28');q(-8,-23,13,3,'#c9b27a');q(-9,-22,2,4,'#b39a62');
  q(-6,-11,11,9,'#d8cfae');q(-4,-8,1,1,'#7a6a4f');q(0,-6,1,1,'#7a6a4f');q(2,-9,1,1,'#7a6a4f');
  q(-8,-2,4,2,'#3d3b37');q(3,-2,4,2,'#3d3b37');q(9,-17,1,17,'#7b6243');q(8,-17,3,1,'#5c4732');
}else if(kind==='mouse'){
  // 결정 D-130: 메밀밭 일꾼 들쥐. 머릿수건, 메밀 묻은 앞치마, 긴 꼬리. 발치에 메밀 널린 멍석.
  // 결정 D-154: 멍석은 땅에 펴 둔 것이라 들쥐가 고개를 돌려도(f) 늘 왼쪽 같은 자리에 있다.
  {const mx=Math.round(x),my=Math.round(y),m=(a,b,w,h,c)=>R(mx+a,my+b,w,h,c);
    m(-22,-2,13,2,'#b8a46e');m(-21,-3,11,1,'#cbb985');m(-19,-3,1,1,'#3a3330');m(-15,-3,1,1,'#3a3330');m(-12,-3,1,1,'#3a3330');}
  q(-12,-5,6,1,'#b58f7c');q(-13,-8,1,4,'#b58f7c');q(-12,-9,1,1,'#b58f7c');
  q(-6,-12,11,11,'#8a7258');q(-3,-17,9,7,'#9a8064');q(5,-14,3,2,'#c79a86');q(8,-14,1,1,'#3a2a24');q(3,-15,1,1,'#1f1a17');
  q(-4,-21,4,4,'#9a8064');q(-3,-20,2,2,'#d6a593');q(2,-21,4,4,'#9a8064');q(3,-20,2,2,'#d6a593');
  q(-4,-18,9,2,'#c9b27a');q(-5,-17,2,3,'#b39a62');
  q(-4,-9,9,7,'#d8cfae');q(-2,-6,1,1,'#7a6a4f');q(1,-4,1,1,'#7a6a4f');q(3,-7,1,1,'#7a6a4f');
  q(5,-9,2,2,'#c79a86');q(-6,-2,3,2,'#5a4a3a');q(2,-2,3,2,'#5a4a3a');
}else if(kind==='turtle'){
  // 결정 D-118: 성황당 돌 그늘의 늙은 남생이. 소원 천을 매기 전에는 붉은 천 조각을 물고 있다.
  q(-9,-9,18,7,'#5f6b4a');q(-7,-11,14,3,'#6f7c56');q(-5,-10,3,1,'#4a553a');q(1,-10,3,1,'#4a553a');q(-2,-8,3,1,'#4a553a');
  q(9,-7,5,4,'#7f8a62');q(12,-6,1,1,'#1f2522');q(-8,-3,16,1,'#a8a378');q(-8,-2,3,2,'#6c7653');q(5,-2,3,2,'#6c7653');
  if(!G.f.dolneomeo_turtle1){q(13,-4,2,1,'#b9584a');q(14,-3,1,4,'#b9584a');}
}else if(kind==='frog'){
  q(-8,-9,17,8,'#6b8a77');q(-6,-14,12,8,'#849c80');q(-6,-16,4,5,'#98ad8c');q(3,-16,4,5,'#98ad8c');if(G.f.dolneomeo_frog_warm){q(-5,-14,3,1,'#354b42');q(3,-14,3,1,'#354b42');}else{q(-4,-15,1,2,'#354b42');q(4,-15,1,2,'#354b42');}q(-7,-6,15,5,'#aaaf8a');q(-11,-2,5,2,'#648170');q(7,-2,5,2,'#648170');q(-10,-7,3,6,'#648170');q(9,-7,3,6,'#648170');q(-4,-11,2,1,'#d5dab4');q(4,-11,2,1,'#d5dab4');
}else{
  q(-7,-14,14,11,'#344b52');q(-4,-11,9,7,'#e2e4d3');q(2,-20,8,9,'#344b52');q(8,-17,6,2,'#b8b798');q(7,-19,1,1,'#eef1d9');q(-15,-7,10,3,'#344b52');q(-18,-6,4,2,'#71878a');q(-4,-4,1,4,'#75775f');q(3,-4,1,4,'#75775f');q(-7,-12,4,6,'#627b80');
}}
/* 결정 D-83: 밭 둔덕 경치. 메밀밭 너머 먼 산 아래 성황당 돌무더기가 이따금 꿈틀한다. */
function stirFar(){
  ridge('#8fa3a6',132,30,96,140);ridge('#a7b4ac',146,16,70,400);
  const x=Math.round(250-RC()*.6),still=Vfx.reducedMotion,stir=!still&&Math.sin(G.anim*0.05)>0.82,k=stir?Math.round(Math.sin(G.anim*0.8)*1.5):0;
  // 돌무더기: 서리 없는 회갈색 돌을 둥글게 쌓은 더미. 꿈틀할 때 위쪽 돌이 한 칸씩 어긋나고 먼지가 인다.
  px(x-34,153,68,2,'#6f7a73');
  const rows=[[0,6,10],[7,5,10],[13,4,10],[19,3,9],[24,2,9]];
  rows.forEach(([dy,n,w],j)=>{const off=j>=2?k:0;for(let i=0;i<n;i++){const sx=x-n*w/2+i*w+off+(j%2?3:0);stone(sx,152-dy,w-1,7,i+j*7,false);}});
  if(stir){px(x-40,149,6,1,'#d8d2bd');px(x+36,147,5,1,'#d8d2bd');px(x-6,122,2,1,'#d8d2bd');px(x+8,120,1,1,'#d8d2bd');}
}
function stirMid(){px(0,158,W,30,'#9c9a7b');for(let i=0;i<70;i++){const x=mod(i*13-cam,460)-20,y=160+(i%6)*4;px(x,y,2,1,i%3?'#f1efe2':'#d9d3bf');}}
function stirNear(){for(let x=-20;x<W+20;x+=4){const y=194-Math.round(Math.sin((x+cam)/58)*7);px(x,y,4,H-y,'#7d7a5c');px(x,y,4,2,'#aaa77d');if(hash(x+cam)>.72)px(x,y-2,1,2,'#c9c492');}stone(30-mod(RC()*.2,40),214,22,8,3);}
Rg.expansionArt={drawBack:backdrop,drawScenery:scenery,drawFront:front,drawBlocked,drawDepthGate,drawGateRope,drawWishTower,wishTowerPic,wishStackPaint,wishStackTop,wishStackSpan,TOWER_ADD,TOWER_OFFS,drawSnowDrift,drawSnowStep,drawWanderer,
  cliffLayers:[{speed:.04,draw:cliffSky},{speed:.14,draw:cliffFar},{speed:.4,draw:cliffSea},{speed:.83,draw:cliffNear}],
  shrineLayers:[{speed:.04,draw:shrineSky},{speed:.16,draw:shrineFar},{speed:.43,draw:shrineMid},{speed:.86,draw:shrineNear}],
  stirLayers:[{speed:.04,draw:shrineSky},{speed:.14,draw:stirFar},{speed:.45,draw:stirMid},{speed:.86,draw:stirNear}],
};
})();
