'use strict';
/* 단풍골 동물들의 도트 그림과 곁에 놓인 소품. (ox, oy)는 발밑, f 는 바라보는 방향 */
(()=>{
const Rg=REGIONS.galchamgol;
Rg.art={
  squirrel(ox,oy,f){const O='#c3632d',D='#8e3f1c',C='#f1d7b0',K='#2b1d14';const t=Math.floor(G.anim/20)%2;
    M(ox,oy,f,-11,-20+t,6,15,O);M(ox,oy,f,-13,-24+t,8,6,O);M(ox,oy,f,-9,-26+t,5,3,D);M(ox,oy,f,-9,-17+t,2,10,D);
    M(ox,oy,f,-4,-10,8,8,O);M(ox,oy,f,-1,-9,4,6,C);M(ox,oy,f,-2,-17,8,7,O);M(ox,oy,f,-1,-19,2,2,D);M(ox,oy,f,3,-15,1,1,K);M(ox,oy,f,6,-13,1,1,K);
    M(ox,oy,f,-3,-2,3,2,D);M(ox,oy,f,1,-2,3,2,D);M(ox,oy,f,4,-9,3,3,'#a8743b');M(ox,oy,f,4,-10,3,1,'#6b4423');},
  badger(ox,oy,f){const Gy='#6d6862',B='#2a2522',Wt='#eeeae2',Ap='#7a4b2a';
    M(ox,oy,f,-6,-14,13,12,Gy);M(ox,oy,f,-2,-12,8,10,Ap);M(ox,oy,f,-4,-22,11,8,Wt);M(ox,oy,f,-3,-21,3,5,B);M(ox,oy,f,3,-21,3,5,B);
    M(ox,oy,f,4,-19,1,1,'#ffffff');M(ox,oy,f,7,-16,2,1,B);M(ox,oy,f,-5,-2,4,2,B);M(ox,oy,f,2,-2,4,2,B);
    const up=Math.floor(G.anim/30)%2;M(ox,oy,f,8,-15-up,2,8,'#6b4423');M(ox,oy,f,7,-18-up,5,3,'#4a4a4a');},
  toad(ox,oy,f){const Gr='#7d7a3c',Dg='#5a5728',Bl='#d9cfa6',K='#2b1d14',Sc='#e8e0cf';
    M(ox,oy,f,-9,-12,18,12,Gr);M(ox,oy,f,-5,-9,10,8,Bl);M(ox,oy,f,-7,-10,1,1,Dg);M(ox,oy,f,6,-8,1,1,Dg);M(ox,oy,f,-8,-5,1,1,Dg);
    M(ox,oy,f,-7,-18,14,7,Gr);M(ox,oy,f,-6,-20,4,3,Gr);M(ox,oy,f,3,-20,4,3,Gr);M(ox,oy,f,-5,-19,2,1,K);M(ox,oy,f,4,-19,2,1,K);M(ox,oy,f,-4,-13,9,1,Dg);
    M(ox,oy,f,-8,-22,16,3,Sc);M(ox,oy,f,-10,-21,3,3,Sc);M(ox,oy,f,10,-17,1,17,'#6b4423');},
};
/* 소품: 무쇠의 화덕과 모루, 할멈의 약탕관 (날쌘과 지게는 data/common.js 의 COMMON_ART) */
Rg.props={
  forge(n){const x=n.x-cam;R(x-34,GROUND-22,18,22,'#6e5b4b');R(x-32,GROUND-20,14,4,'#55463a');R(x-30,GROUND-34,6,14,'#5a4a3d');
    const fl=Math.floor(G.anim/6)%3;R(x-31,GROUND-12,12,6,['#ff7b2e','#ffb347','#e8551f'][fl]);R(x-29,GROUND-14,8,2,'#ffd27a');
    R(x+14,GROUND-9,16,3,'#3b3b3b');R(x+18,GROUND-6,8,6,'#2c2c2c');},
  toad(n){const x=n.x-cam;R(x+16,GROUND-12,10,12,'#7a4a2a');R(x+15,GROUND-14,12,3,'#5a361e');R(x+28,GROUND-9,8,9,'#8a5a3a');R(x+27,GROUND-11,10,2,'#5a361e');
    if(Math.floor(G.anim/18)%2){R(x+20,GROUND-20,1,3,'#f4efe4');R(x+22,GROUND-24,1,3,'#f4efe4');}else R(x+21,GROUND-22,1,4,'#f4efe4');},
};
})();
