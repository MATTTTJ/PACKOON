'use strict';
/* 돌너머 동물들의 도트 그림과 소품. (ox, oy)는 발밑, f 는 바라보는 방향 */
(()=>{
const Rg=REGIONS.dolneomeo;
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
