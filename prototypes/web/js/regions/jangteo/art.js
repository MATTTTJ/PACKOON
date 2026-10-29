'use strict';
/* 큰 장터 동물들의 도트 그림과 소품. (ox, oy)는 발밑, f 는 바라보는 방향 */
(()=>{
const Rg=REGIONS.jangteo;
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
    R(x+16,GROUND-12,14,12,'#9b5b3a');R(x+15,GROUND-14,16,2,'#e6b54a');},
  /* 엿 수레 */
  yeotcart(n){const x=n.x-cam;R(x+14,GROUND-16,30,10,'#8a5a2b');R(x+14,GROUND-18,30,2,'#c9a06a');
    for(let i=0;i<5;i++)R(x+16+i*6,GROUND-22,4,4,i%2?'#e6b54a':'#d9a441');
    R(x+18,GROUND-6,6,6,'#4a3420');R(x+36,GROUND-6,6,6,'#4a3420');R(x+20,GROUND-4,2,2,'#8a6a4a');R(x+38,GROUND-4,2,2,'#8a6a4a');},
  /* 보부상 숙소 마루: 등불 하나 */
  maru(n){const x=n.x-cam;R(x-22,GROUND-10,44,4,'#8a5a2b');R(x-22,GROUND-11,44,1,'#c9a06a');R(x-20,GROUND-6,3,6,'#5a361e');R(x+17,GROUND-6,3,6,'#5a361e');
    R(x+10,GROUND-30,1,20,'#5a361e');R(x+7,GROUND-34,7,6,night()?'#ffb050':'#c9452a');if(night())R(x+5,GROUND-36,11,10,'rgba(255,180,80,.18)');},
};
})();
