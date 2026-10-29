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
