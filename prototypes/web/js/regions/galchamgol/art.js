'use strict';
/* 단풍골 동물들의 도트 그림과 곁에 놓인 소품. (ox, oy)는 발밑, f 는 바라보는 방향 */
(()=>{
const Rg=REGIONS.galchamgol;
Rg.springRevisit=()=>!CLASSIC&&!!G?.f?.spring&&regionCompleted('yeongsan');
Rg.art={
  squirrel(ox,oy,f){const O='#c3632d',D='#8e3f1c',C='#f1d7b0',K='#2b1d14';const t=Math.floor(G.anim/20)%2;
    M(ox,oy,f,-11,-20+t,6,15,O);M(ox,oy,f,-13,-24+t,8,6,O);M(ox,oy,f,-9,-26+t,5,3,D);M(ox,oy,f,-9,-17+t,2,10,D);
    M(ox,oy,f,-4,-10,8,8,O);M(ox,oy,f,-1,-9,4,6,C);M(ox,oy,f,-2,-17,8,7,O);M(ox,oy,f,-1,-19,2,2,D);M(ox,oy,f,3,-15,1,1,K);M(ox,oy,f,6,-13,1,1,K);
    M(ox,oy,f,-3,-2,3,2,D);M(ox,oy,f,1,-2,3,2,D);M(ox,oy,f,4,-9,3,3,'#a8743b');M(ox,oy,f,4,-10,3,1,'#6b4423');},
  badger(ox,oy,f){const Gy='#6d6862',B='#2a2522',Wt='#eeeae2',Ap='#7a4b2a';
    M(ox,oy,f,-6,-14,13,12,Gy);M(ox,oy,f,-2,-12,8,10,Ap);M(ox,oy,f,-4,-22,11,8,Wt);M(ox,oy,f,-3,-21,3,5,B);M(ox,oy,f,3,-21,3,5,B);
    M(ox,oy,f,4,-19,1,1,'#ffffff');M(ox,oy,f,7,-16,2,1,B);M(ox,oy,f,-5,-2,4,2,B);M(ox,oy,f,2,-2,4,2,B);
    const up=Math.floor(G.anim/30)%2;M(ox,oy,f,8,-15-up,2,8,'#6b4423');M(ox,oy,f,7,-18-up,5,3,'#4a4a4a');},
  // 무쇠 삼촌: 아빠와 같은 너구리 털빛, 가죽 앞치마, 붕대 감은 다리, 망치.
  uncle(ox,oy,f){const Gy='#8c8070',K='#2a211b',Wt='#efe6d6',Ap='#7a4b2a',T='#6f6357';
    M(ox,oy,f,-12,-11,5,4,Gy);M(ox,oy,f,-12,-10,5,1,K);M(ox,oy,f,-12,-8,5,1,K);
    M(ox,oy,f,-6,-14,13,12,Gy);M(ox,oy,f,-2,-12,8,10,Ap);M(ox,oy,f,-4,-22,11,8,Gy);
    M(ox,oy,f,-4,-24,2,2,K);M(ox,oy,f,5,-24,2,2,K);M(ox,oy,f,-4,-20,11,3,K);
    M(ox,oy,f,-2,-19,1,1,Wt);M(ox,oy,f,4,-19,1,1,Wt);M(ox,oy,f,0,-17,6,3,Wt);M(ox,oy,f,6,-17,2,1,K);
    M(ox,oy,f,-5,-2,4,2,K);M(ox,oy,f,2,-2,4,2,T);M(ox,oy,f,2,-5,4,3,'#d8cfbd');
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
    R(x+14,GROUND-9,16,3,'#3b3b3b');R(x+18,GROUND-6,8,6,'#2c2c2c');
    // 새 낫과 구분되는, 대장간에 남은 젊은 시절의 낡은 자루.
    if(Rg.arcsEnabled()&&G.f.galArcMusoe3){R(x+15,GROUND-13,16,3,'#9c774e');R(x+17,GROUND-13,2,3,'#5a3d28');R(x+25,GROUND-12,4,1,'#c5a17b');}},
  toad(n){const x=n.x-cam;R(x+16,GROUND-12,10,12,'#7a4a2a');R(x+15,GROUND-14,12,3,'#5a361e');R(x+28,GROUND-9,8,9,'#8a5a3a');R(x+27,GROUND-11,10,2,'#5a361e');
    if(Math.floor(G.anim/18)%2){R(x+20,GROUND-20,1,3,'#f4efe4');R(x+22,GROUND-24,1,3,'#f4efe4');}else R(x+21,GROUND-22,1,4,'#f4efe4');},
};

/* 확장판의 풍경. 경치에서도 같은 물길·지붕·당산나무 윤곽을 되풀이해
   바라보던 곳과 실제로 들어가는 길이 이어져 보이게 한다. */
if(!CLASSIC){
  const C={ink:'#382b2b',bark:'#61402d',soil:'#67452f',ochre:'#d9a650',
    ember:'#c85c36',gold:'#f2c65d',cream:'#f7ddb0',water:'#668b87'};
  const springColors={
    '#d2b2a5':'#b9cfc2','#e0bc9c':'#c5d8c8','#edc9a0':'#d5dfc4','#f5d9ac':'#e1e5ca','#f3cea0':'#d6dfba','#edb886':'#c2d1a7',
    '#805f78':'#849e98','#9d6a7b':'#98b1a5','#bb7b7e':'#b4c4ad','#d8927e':'#c9d2b5','#edaa83':'#dce1bf','#f5c598':'#e7e6c9',
    '#bd8e83':'#91aa90','#aa7964':'#728c71','#877377':'#7c9586','#7c766e':'#6a8673',
    '#c85c36':'#668b50','#d37b3e':'#7f9b5c','#bc6139':'#66874e','#df9748':'#9ab16b','#966245':'#54754b','#9f7047':'#648552','#815139':'#496743',
    '#c57a38':'#779855','#ab5735':'#66874e','#b96738':'#779855','#bd7944':'#6f8d54','#d28c4b':'#8fa665',
    '#67452f':'#6c6243','#ab7842':'#8c9a5f','#7b5132':'#72804d','#4c5140':'#4c5b40','#8d9060':'#8b9d67',
    '#c65b37':'#668b50','#e4aa47':'#8fa665','#f0cc76':'#b0bc7c','#e99849':'#a6b778','#edb660':'#c2ca92'
  };
  const px=(x,y,w,h,c)=>R(Math.round(x),Math.round(y),Math.round(w),Math.round(h),Rg.springRevisit()?(springColors[c]||c):c);
  const visible=(x,w=80)=>x+w>-20&&x-w<W+20;

  function sky(dusk=false){
    const cols=dusk?['#805f78','#9d6a7b','#bb7b7e','#d8927e','#edaa83','#f5c598']:
      ['#d2b2a5','#e0bc9c','#edc9a0','#f5d9ac','#f3cea0','#edb886'];
    for(let i=0;i<cols.length;i++)px(0,i*32,W,33,cols[i]);
    // A small stepped disk reads as a pixel sun, without vector antialiasing.
    const x=300-Math.floor(cam*.025),y=dusk?54:31;
    px(x+5,y,16,3,'#ffe6b0');px(x+2,y+3,22,4,'#ffe6b0');
    px(x,y+7,26,13,'#ffe6b0');px(x+3,y+20,20,3,'#ffe6b0');px(x+6,y+23,14,2,'#ffe6b0');
    for(let i=0;i<5;i++){
      const cx=((i*113+26-Math.floor(cam*.07))%600+600)%600-80;
      px(cx,28+i%3*13,35,2,dusk?'#df9a8d':'#f8e2bc');
      px(cx+10,26+i%3*13,31,2,dusk?'#df9a8d':'#f8e2bc');
    }
  }
  function ridge(par,color,base,amp,freq=.012){
    for(let x=0;x<W;x+=2){
      const u=x+Math.floor(cam*par),h=Math.round(base-Math.sin(u*freq)*amp-Math.sin(u*freq*.47+1.8)*amp*.65);
      px(x,h,2,H-h,color);
    }
  }
  function tree(x,y,scale=1,color=C.ember,dark=false,shape=0){
    x=Math.round(x);y=Math.round(y);
    const q=(a,b,w,h,c)=>px(x+a*scale,y+b*scale,w*scale,h*scale,c);
    q(-3,-53,6,53,dark?'#46362f':C.bark);q(-13,-43,12,3,C.bark);q(1,-34,15,3,C.bark);
    if(shape===1){
      // A windward oak has a low crown, a long left fork and an open right shoulder.
      q(-27,-63,27,15,color);q(-36,-55,38,15,color);q(-22,-44,38,12,color);
      q(0,-72,23,14,color);q(8,-61,24,15,color);q(-19,-65,18,5,color);
      q(2,-46,18,3,C.bark);q(-27,-57,14,3,dark?'#76503d':'#e99849');
    }else if(shape===2){
      // A taller, sparsely leafed tree leaves its fork visible between two leaf clusters.
      q(-10,-77,19,15,color);q(-20,-68,32,13,color);q(-28,-55,24,12,color);
      q(9,-60,22,16,color);q(-12,-39,31,11,color);q(-14,-55,15,3,C.bark);
      q(-5,-73,11,3,dark?'#76503d':'#e99849');q(-20,-43,12,3,color);
    }else{
      q(-23,-72,43,15,color);q(-31,-62,59,18,color);q(-25,-44,47,12,color);
      q(-13,-78,23,8,color);q(-20,-69,17,4,dark?'#76503d':'#e99849');
    }
    q(9,-55,18,3,dark?'#684334':'#ac4b32');q(-29,-53,13,2,dark?'#684334':'#ac4b32');
    q(-17,-74,3,2,'#edb660');q(7,-66,4,2,'#edb660');q(-22,-47,3,2,'#edb660');
  }
  function woods(par,dark=false){
    const s=90,start=Math.floor(cam*par/s)*s;
    for(let u=start-s;u<start+W+s*2;u+=s){
      const a=hash(u+11),x=u-cam*par;
      tree(x,177+Math.floor(a*11),.65+a*.25,
        dark?['#966245','#9f7047','#815139'][Math.floor(a*3)]:['#d37b3e','#bc6139','#df9748'][Math.floor(a*3)],dark,Math.floor(hash(u+73)*3));
    }
  }
  function ground(marsh=false){
    px(0,GROUND,W,H-GROUND,marsh?'#4c5140':C.soil);
    px(0,GROUND,W,3,marsh?'#8d9060':'#ab7842');px(0,GROUND+3,W,2,marsh?'#747e50':'#7b5132');
    for(let x=-4;x<W+4;x+=4){
      const u=x+Math.floor(cam/4)*4,a=hash(u+37);
      if(a<.72)px(x-Math.floor(cam)%4,GROUND-1,3,1,['#c65b37','#e4aa47','#f0cc76'][Math.floor(a*4)%3]);
      if(a>.8)px(x-Math.floor(cam)%4,GROUND+8+Math.floor(a*14),2,1,marsh?'#353e36':'#503828');
    }
  }
  function house(x,y=GROUND,s=1,lit=false,shape=0){
    const q=(a,b,w,h,c)=>px(x+a*s,y+b*s,w*s,h*s,c);
    q(0,-27,48,27,'#d3b18a');q(2,-24,44,22,'#c7a17b');q(0,-27,3,27,C.bark);q(45,-27,3,27,C.bark);
    q(19,-19,12,19,'#5c4031');q(22,-17,7,17,lit?'#e8b46c':'#332b2b');
    q(6,-20,9,8,'#f0ddba');q(10,-20,1,8,'#9d7950');q(6,-16,9,1,'#9d7950');
    const e=shape===1?5:shape===2?-3:0;
    q(-6-e,-32,60+e*2,7,'#a87b43');q(-4-e,-38,56+e*2,6,'#c39350');
    q(1-e,-43,46+e*2,5,'#d8ad64');q(10-e,-47,28+e*2,4,'#e7c17b');
    for(let i=0;i<8;i++)q(-1-e+i*(7+e/4),-36,1,10,'#b38545');
    q(-9,-26,66,2,'#765337');q(15,0,21,2,'#876b4e');
    q(36,-54,4,9,'#88715b');q(33,-55,10,2,'#aa8a64');
    if(shape===1){q(-20,-19,20,19,'#b99368');q(-24,-24,26,5,'#bc8b49');q(-20,-28,19,4,'#d6ac65');q(-14,-13,7,13,'#5d4632');}
    if(shape===2){q(33,-18,10,8,lit?'#e1b369':'#ead5af');q(37,-18,1,8,'#95734e');q(33,-14,10,1,'#95734e');q(50,-9,9,9,'#78553c');q(49,-11,11,3,'#4f3b2e');}
  }
  function fence(x,y=GROUND,n=4){
    for(let i=0;i<n;i++){px(x+i*13,y-15,2,15,'#80603d');px(x+i*13-1,y-17,4,2,'#9d7c4d');}
    px(x-2,y-12,n*13-7,2,'#9c7849');px(x-2,y-6,n*13-7,2,'#79603c');
  }
  function well(x,y=GROUND){
    px(x-16,y-8,33,8,'#857a62');px(x-20,y-13,40,5,'#b6a385');px(x-12,y-12,24,3,'#4b4940');
    px(x-18,y-40,3,28,C.bark);px(x+15,y-40,3,28,C.bark);px(x-23,y-44,47,5,'#a47b41');
    px(x-18,y-48,37,4,'#c39b58');px(x-9,y-51,19,3,'#d9b76d');
    px(x,y-39,1,27,'#c9ad7b');px(x-4,y-17,9,6,'#a27547');px(x-3,y-19,7,2,'#d1ae72');
  }
  function wheel(x,y=GROUND){
    const stage=G.f.galWheelStage||0,working=!!G.f.galWheelDone;
    const phase=working&&!Vfx.reducedMotion?G.anim*Math.PI/240:0;
    px(x-47,y-2,104,11,'#5c847f');px(x-40,y+2,32,1,'#b5c5a7');px(x+7,y+5,39,1,'#b5c5a7');
    px(x+18,y-54,39,4,'#8d643a');px(x+25,y-50,4,48,'#5b4130');
    // Stepped rim and spokes keep the large wheel on the same pixel grid as the stream.
    const cy=y-25;
    for(let i=0;i<40;i++){
      const a=i*Math.PI/20,xx=Math.round(Math.cos(a)*23),yy=Math.round(Math.sin(a)*23);
      px(x+xx-1,cy+yy-1,3,3,'#855833');
    }
    for(let i=0;i<8;i++){
      if(!working&&stage<4&&(i===1||i===5))continue;
      const a=i*Math.PI/4+phase;
      for(let r=0;r<24;r+=2)px(x+Math.round(Math.cos(a)*r),cy+Math.round(Math.sin(a)*r),2,2,'#a07646');
      px(x+Math.round(Math.cos(a)*26)-3,cy+Math.round(Math.sin(a)*26)-2,6,4,'#6e4a30');
    }
    px(x-3,cy-3,6,6,'#4a3428');px(x-1,cy-1,2,2,'#d1ab6b');
    // A loose axle waits on trestles until the neighbours lift it into place.
    if(G.f.galWheelAxle&&stage<4&&!working){px(x-52,y-11,6,11,'#67482f');px(x-23,y-11,6,11,'#67482f');px(x-56,y-14,44,5,'#a78350');px(x-54,y-13,39,1,'#d4ad6b');}
    if(working){
      const shift=Vfx.reducedMotion?0:Math.floor(G.anim/5)%8;
      for(let i=0;i<5;i++){px(x+18,cy-22+i*7+shift,3,4,'#c1d2ae');px(x-23+i*11,y+8+(i%2),7,1,'#bcd0ae');}
    }
    if(stage>=4||working){
      // The wheel's shaft drives a wooden pounder; the player's heirloom stays in the bundle.
      const lift=!working||Vfx.reducedMotion?0:Math.max(0,Math.round(Math.sin(phase*2)*7));
      px(x+34,y-26,4,26,'#694a30');px(x+33,y-29-lift,42,4,'#9b7645');
      px(x+68,y-25-lift,4,15,'#a4804e');px(x+62,y-11,16,11,'#77715b');px(x+65,y-12,10,3,'#3e3f35');
      // Brief drawn sound strokes remain legible when sound is switched off.
      if(working&&!lift){px(x+62,y-18,2,3,'#dec690');px(x+76,y-17,2,3,'#dec690');}
    }
  }
  function farAir(dusk=false){
    // Low autumn vapour separates the two ridgelines without covering footholds.
    for(let i=0;i<6;i++){
      const x=((i*113+22-Math.floor(cam*.14))%720+720)%720-110,y=118+i%3*6;
      px(x,y,74+i%2*21,2,dusk?'#b79287':'#d8b89a');
      px(x+17,y+3,51+i%2*12,1,dusk?'#b79287':'#d8b89a');
    }
    const drift=Vfx.reducedMotion?0:Math.floor(G.anim/22)%620;
    for(let i=0;i<4;i++){
      const x=((64+i*15-drift-Math.floor(cam*.06))%620+620)%620-50,y=58+i%3*6;
      px(x,y,3,1,'#a08378');px(x+3,y+1,2,1,'#a08378');px(x+5,y,3,1,'#a08378');
    }
  }
  function basket(x,y=GROUND){
    px(x-9,y-10,18,8,'#b58a51');px(x-8,y-4,16,4,'#92703f');
    for(let i=-7;i<8;i+=4)px(x+i,y-9,1,8,'#d2aa68');px(x-10,y-11,20,2,'#765234');
  }
  function leaf(x,y,color=C.gold){
    if(Rg.springRevisit())color='#8fa665';
    px(x-3,y,7,2,color);px(x-2,y-2,5,5,color);px(x,y-4,2,8,color);px(x+1,y+3,4,1,'#855838');
  }
  function shrub(x,y=GROUND,color='#af6938'){
    if(Rg.springRevisit())color='#668b50';
    px(x-13,y-9,24,8,color);px(x-9,y-13,16,4,color);px(x-4,y-16,4,4,color);
    px(x-10,y-7,3,2,'#e4b568');px(x+4,y-10,3,2,'#e4b568');
  }
  function reeds(x,y=GROUND){
    for(let i=-15;i<16;i+=6){const h=17+Math.floor(hash(x+i)*14);px(x+i,y-h,1,h,'#9f955c');
      px(x+i-1,y-h-8,3,9,'#bbb180');px(x+i-2,y-h-7,5,3,'#c9bf8e');}
  }
  function treeHollow(x,y=GROUND){
    // One hollow trunk, viewed in section. The footholds themselves are engine platforms.
    px(x-40,4,80,y-4,'#5a3a2c');px(x-31,7,62,y-7,'#997047');px(x-25,9,50,y-9,'#382c28');
    for(let i=0;i<7;i++){const yy=15+i*25;px(x-39,yy,8,2,'#b18a59');px(x+31,yy+11,8,2,'#b18a59');}
    px(x-50,y-8,100,8,'#68432e');px(x-45,y-14,13,8,'#68432e');px(x+32,y-14,13,8,'#68432e');
    for(let i=0;i<5;i++){const yy=23+i*29;px(x-19,yy,9,1,'#775339');px(x+8,yy+15,12,1,'#775339');}
    px(x-19,35,38,2,'#bba16e');px(x-15,37,5,15,'#d7c6a1');px(x-5,37,4,10,'#cb9477');px(x+6,37,6,18,'#d9cbaa');
    px(x-2,GROUND-20,6,4,'#aa7842');px(x-3,GROUND-22,8,2,'#68452e');
    // Broad shoulders and a cut root distinguish the hollow from a wooden pillar.
    px(x-56,4,16,24,'#67442e');px(x+40,4,21,18,'#67442e');px(x-68,4,18,9,'#8c603b');
    px(x-52,y-7,13,7,'#b28b56');px(x+40,y-8,16,8,'#b28b56');
    for(let i=0;i<3;i++){px(x-51+i*3,y-6+i,6-i,1,'#765032');px(x+43+i*3,y-7+i,7-i,1,'#765032');}
    for(const yy of [86,143]){px(x-23,yy,14,3,'#8e663e');
      px(x-21,yy-5,4,4,'#c49049');px(x-22,yy-6,6,2,'#6b4730');px(x-14,yy-3,3,3,'#d3a260');}
  }
  function smallShrine(x,y=GROUND){
    px(x-20,y-21,40,21,'#845535');px(x-27,y-25,54,5,'#68412c');px(x-21,y-30,42,5,'#a77744');
    px(x-8,y-15,16,15,'#4f3829');px(x-18,y-18,4,18,'#b88247');px(x+14,y-18,4,18,'#b88247');
    px(x-25,y,50,3,'#8b7a5a');
  }

  function zoneBack(zone){
    sky(zone==='hill'||zone==='marsh');
    ridge(.1,zone==='marsh'?'#877377':'#bd8e83',116,17,.009);
    ridge(.23,zone==='marsh'?'#7c766e':'#aa7964',141,16,.014);
    farAir(zone==='hill'||zone==='marsh');
    woods(.45,zone==='forest'||zone==='marsh');
    if(zone==='village'){
      // The hill is first seen across the wheel's water, long before its path opens.
      const x=1530-cam*.35;px(x-3,91,6,44,'#6b5340');px(x-23,77,42,19,'#bd7944');px(x-14,68,30,14,'#d28c4b');
      house(70-cam);house(220-cam,GROUND,.8,false,2);well(440-cam);
      house(1098-cam,GROUND,.78,false,1);wheel(1050-cam);
      for(const x of [330,590,1200,1560,1980,2320])if(visible(x-cam)){
        fence(x-cam,GROUND,3);if(x!==590)basket(x-cam+53);
      }
    }else if(zone==='forge'){
      house(1010-cam,GROUND,1.65,false,1);px(1030-cam,GROUND-31,30,31,'#352b26');
      px(1048-cam,GROUND-40,10,9,'#dda25f');px(1051-cam,GROUND-37,4,6,'#ffe1a0');
      // Bellows charcoal and split wood belong beside the working forge.
      for(const u of [450,820,1230,1760,2120,2410]){const x=u-cam;if(!visible(x))continue;
        px(x,GROUND-7,24,7,'#725034');px(x+4,GROUND-11,20,4,'#9b7447');px(x+9,GROUND-15,12,4,'#bd945b');
        for(let i=0;i<3;i++)px(x+3+i*7,GROUND-6,3,3,'#c39c67');}
      fence(1500-cam,GROUND,6);px(1535-cam,GROUND-29,73,5,'#a2573b');px(1541-cam,GROUND-33,61,4,'#c2804c');
      px(1540-cam,GROUND-24,3,24,'#5a3c2a');px(1600-cam,GROUND-24,3,24,'#5a3c2a');
    }else if(zone==='forest'){
      for(const [i,u] of [180,550,1040,1420,1910,2390,2700].entries())
        tree(u-cam,GROUND,1.1+hash(u+15)*.48,i%3?'#c57a38':'#ab5735',false,i%3);
      basket(660-cam);basket(740-cam);
      // This high oak supports the actual upper path and its weathered knot.
      tree(2250-cam,GROUND,1.8,'#b96738');
      const x=2250-cam;px(x-8,96,17,18,'#61402f');px(x-5,100,11,11,'#ab7c4d');px(x-2,103,5,6,'#704730');
    }else if(zone==='marsh'){
      px(0,171,W,21,'#648379');
      for(let i=0;i<14;i++){const x=((i*43-Math.floor(cam*.7))%620+620)%620-80;
        px(x,176+i%4*4,21+i%3*8,1,'#9fb092');}
      for(const u of [160,470,800,1090,1370,1850,2140,2340])reeds(u-cam);
      house(1574-cam,GROUND,1.3,true,2);fence(1510-cam,GROUND,3);
      for(const u of [980,1200,1910]){const x=u-cam;px(x-21,GROUND-5,42,5,'#9d7950');px(x-24,GROUND-6,48,1,'#c3a278');}
    }else if(zone==='hill'){
      treeHollow(180-cam);smallShrine(1510-cam);
      for(const u of [610,970,1320,1770,2460]){const x=u-cam;
        px(x-21,GROUND-9,42,9,'#89795c');px(x-15,GROUND-13,31,4,'#aa956e');px(x-13,GROUND-11,14,1,'#cbb182');}
      // Home has become very small; the vista uses this same bent reed roof.
      house(800-cam*.28,163,.32,true);
    }
    ground(zone==='marsh');
    for(let u=Math.floor(cam/170)*170-170;u<cam+W+170;u+=170){
      const a=hash(u+67),x=u-cam;if(zone==='marsh')reeds(x+70);
      else shrub(x+31,GROUND,zone==='hill'?'#aa603d':'#ac713b');
      if(a>.45){px(x+81,GROUND-5,15,5,'#8e8060');px(x+84,GROUND-7,9,2,'#b4a17b');}
    }
  }
  function scenery(zone){
    if(zone==='village'){
      // A shallow stream occupies the foreground, with an ordinary bank to walk beside.
      const left=720-cam,right=1170-cam;
      if(right>0&&left<W){px(left,GROUND+8,right-left,24,'#5e8883');px(left,GROUND+10,right-left,1,'#acc7ac');
        for(let i=0;i<14;i++){let x=740+i*31-cam;px(x,GROUND+15+i%3*4,15,1,'#88aaa0');leaf(x+11,GROUND+13+i%2*8,['#dba448','#d0753d','#a85834'][i%3]);}}
      // The door leaves a small view of bedding; no new family portrait or names.
      const x=70-cam;px(x+22,GROUND-16,8,16,'#49372e');px(x+22,GROUND-8,7,4,'#cbad7b');px(x+23,GROUND-9,4,2,'#8c8070');
      // Leaves, missing spokes and the axle show three separate causes of the stopped mill.
      px(956-cam,138,107,4,'#8e6b42');px(957-cam,138,104,1,'#9ca889');
      px(998-cam,142,3,50,'#745536');px(1059-cam,142,3,50,'#745536');
      if(!G.f.galWheelStage)for(let i=0;i<5;i++)leaf(1037+i*4-cam,137+i%2*2,['#b86a38','#d39a43','#9f5836'][i%3]);
      else px(1038-cam,140,24,1,'#c7cdb0');
      if(G.f.galWheelDone){
        const fall=Vfx.reducedMotion?0:Math.floor(G.anim/5)%7;
        px(1030-cam,142,3,19,'#89aba0');
        for(let i=0;i<3;i++)px(1030-cam,142+i*6+fall,2,3,'#c6d7b8');
      }
    }
    if(zone==='forge'){
      // 함지박 도착 둑 아래의 개울과 낮은 가지. 걷는 바닥은 그대로 둔다.
      const sx=430-cam;
      px(sx-75,GROUND+3,120,13,'#73938b');px(sx-75,GROUND,120,3,'#a79669');
      for(let i=0;i<5;i++)px(sx-65+i*23,GROUND+7+i%2*3,13,1,'#c6d7b8');
      if(!G.f.galWheelSpoke){
        px(sx-17,GROUND-31,4,31,'#725038');px(sx-29,GROUND-27,16,3,'#725038');
        px(sx-25,GROUND-24,48,5,'#bd945d');px(sx-23,GROUND-23,43,1,'#dfba7d');
        for(let i=0;i<3;i++){px(sx+11+i*3,GROUND-24,1,2,'#725032');px(sx+12+i*3,GROUND-22,1,2,'#725032');}
      }
      for(let i=0;i<3;i++){const x=1008-cam+i*9;px(x,GROUND-90-i*8,5,3,'#d3b9a0');px(x+2,GROUND-95-i*8,4,3,'#d3b9a0');}
      for(const u of [1340,1830]){const x=u-cam;px(x-6,GROUND-11,12,11,'#514132');px(x-8,GROUND-12,16,2,'#a18b62');px(x-4,GROUND-14,8,2,'#3f3934');}
      Rg.expArt.marker(230-cam,GROUND);
      // The siblings' low sorting board holds their own winter stores.
      const bx=810-cam;px(bx-28,GROUND-10,57,4,'#ae8550');px(bx-25,GROUND-6,4,6,'#755332');px(bx+21,GROUND-6,4,6,'#755332');
      basket(bx-13,GROUND-10);basket(bx+14,GROUND-10);
      for(let side=0;side<2;side++){
        const count=G.f.galExpBrothersSorted?4:side===0?6:2;
        for(let i=0;i<count;i++){
          const xx=bx-18+side*27+(i%3)*5,yy=GROUND-24-Math.floor(i/3)*4;
          px(xx,yy,4,4,'#bc8648');px(xx-1,yy-1,6,2,'#68482e');
        }
      }
      if(!G.f.galWheelAxle){
        // The replacement axle rests on the low shelf beneath the sorting baskets.
        px(bx-26,GROUND-6,52,6,'#987347');px(bx-24,GROUND-5,48,1,'#c8a269');
        px(bx-26,GROUND-6,3,6,'#694a30');px(bx+23,GROUND-6,3,6,'#694a30');
        px(bx+13,GROUND-6,2,6,'#6c4f32');
      }
      const kx=1860-cam;
      px(kx-22,GROUND-19,44,19,'#87745a');px(kx-17,GROUND-25,34,6,'#9b8767');px(kx-11,GROUND-29,22,4,'#ad9672');
      px(kx-9,GROUND-11,18,11,'#3c3932');px(kx-5,GROUND-5,10,4,'#8d8b7b');px(kx-17,GROUND-7,6,2,'#c1b79a');
    }
    if(zone==='forest'){
      for(const u of [350,920,1730,2200]){const x=u-cam;px(x-6,GROUND-8,12,8,'#d2b47b');px(x-9,GROUND-12,18,5,'#b5744e');px(x-6,GROUND-14,12,2,'#d49a62');}
      // The mother stays by her safe reed shelter while the chick follows the child.
      const x=2090-cam;reeds(x+22);motherPheasant(x,GROUND,-1);
      const rx=280-cam;
      px(rx+8,GROUND-25,8,25,'#775237');px(rx-4,GROUND-13,17,4,'#775237');px(rx-16,GROUND-8,15,4,'#775237');
      px(rx-26,GROUND-4,15,3,'#775237');px(rx+12,GROUND-8,20,4,'#775237');px(rx+27,GROUND-4,11,3,'#775237');
      px(rx-14,GROUND-7,12,1,'#ae7a44');px(rx+15,GROUND-7,12,1,'#ae7a44');
      px(rx-8,GROUND-3,11,3,'#453326');px(rx-5,GROUND-4,6,1,'#a48050');
      // A trail rope hangs from living forks, pointing inward toward the sacred tree.
      const gx=1180-cam;
      for(const dx of [-31,31]){px(gx+dx,147,3,45,'#735239');px(gx+dx-8,146,19,3,'#735239');
        px(gx+dx-11,136,26,10,'#b77942');px(gx+dx-5,132,15,4,'#cb914e');}
      for(let i=-30;i<31;i+=4)px(gx+i,153+(i%8?1:0),4,2,'#cdb887');
      for(let i=-19;i<25;i+=14){px(gx+i,156,3,8,'#ede0ba');px(gx+i+2,163,3,5,'#ede0ba');}
    }
    if(zone==='marsh'){
      // Flat stepping stones lie at the field's walking height; no false raised platforms.
      const sx=320-cam;px(sx-39,GROUND,78,13,'#6a8d82');px(sx-39,GROUND+10,78,1,'#a5bda5');
      for(let i=0;i<4;i++){const xx=sx-34+i*20;px(xx,GROUND,15,3,'#b1ad8b');px(xx+2,GROUND-2,11,2,'#ccc49c');px(xx+1,GROUND+3,13,2,'#7a8067');}
      const hx=1220-cam;
      px(hx-22,144,45,4,'#b58b4f');px(hx-18,141,37,3,'#ccaa6c');
      px(hx-19,148,3,44,'#785537');px(hx+17,148,3,44,'#785537');px(hx-20,177,41,3,'#a17b47');
      for(let i=-12;i<15;i+=9){px(hx+i,148,1,6,'#cbb180');px(hx+i-2,154,5,11,'#8d9564');px(hx+i-4,160,8,4,'#a9aa70');}
      for(let i=-10;i<14;i+=13){px(hx+i-4,181,9,10,'#9b7044');px(hx+i-5,179,11,3,'#604630');px(hx+i-2,184,2,4,'#c0935a');}
      Rg.expArt.marker(2180-cam,GROUND);
      // A reed-framed open lantern gives the gathered fireflies somewhere to rest.
      const lx=1644-cam,lit=!!G.f.galLanternLit,count=G.f.galLanternCount||0;
      px(lx,146,1,10,'#a78a56');px(lx-8,155,17,2,'#ad8b50');
      px(lx-7,157,15,19,lit?'#b4a56b':'#655f46');
      px(lx-7,157,1,19,'#d1b67b');px(lx+7,157,1,19,'#d1b67b');px(lx-8,176,17,2,'#8e7345');
      for(let i=0;i<(lit?3:count);i++){
        const xx=lx-4+i*4,yy=162+i%2*7;
        if(lit)px(xx-1,yy-1,4,4,'#c8c888');px(xx,yy,2,2,lit?'#fff0a6':'#c0c782');
      }
      if(lit){px(lx-12,165,2,1,'#d6cc92');px(lx+12,160,2,1,'#d6cc92');px(1622-cam,GROUND-3,38,2,'#b4aa6e');}
      for(const [i,wx,y] of [[0,520,GROUND],[1,1030,158],[2,1450,GROUND]]){
        if(G.f['galLanternFly'+i])continue;
        const x=wx-cam,glow=Vfx.reducedMotion?true:Math.floor(G.anim/24+i)%3!==0;
        px(x-3,y-17,1,17,'#94905b');px(x-7,y-15,5,1,'#a9a06a');
        if(glow){px(x-5,y-23,9,7,'#8b9568');px(x-2,y-21,3,3,'#fff0a6');}
        px(x-5,y-21,3,1,'#d1d0a0');px(x+2,y-20,3,1,'#d1d0a0');px(x-1,y-23,1,2,'#45533b');
      }
      for(let i=0;i<18;i++){
        const wx=80+i*129,x=wx-cam;if(!visible(x,8))continue;
        const phase=Vfx.reducedMotion?i%4:Math.floor(G.anim/18+i)%4;
        const y=137+i%4*10;
        if(phase===0)px(x-1,y-1,4,4,'#91a272');
        if(phase<3)px(x,y,2,2,phase===1?'#ffe8a1':'#d2d285');
      }
    }
    if(zone==='hill'){
      // Small old cloth strips mark a public wish tree, not a transformation costume.
      const x=1510-cam;px(x-32,GROUND-41,64,1,'#bca376');
      for(let i=0;i<6;i++)px(x-28+i*11,GROUND-40,4,8+i%3*3,['#dac6a1','#c08a72','#d6b66e'][i%3]);
    }
  }

  function vistaSky(dusk=false){
    const colors=dusk?
      ['#785f78','#80617b','#8a677e','#956d80','#a17481','#ae7d83','#bb8785','#c69086','#d19b89','#dda78e','#e6b395','#edbe9d','#f2c9a6','#f5d1ac','#f5d1ac','#f5d1ac']:
      ['#cbb2ad','#d2b7ac','#d9bdac','#dfc2ac','#e6c8ad','#edceb0','#f2d3b1','#f6d9b4','#f8deba','#f9e2bf','#f9e3c1','#f9e3c1','#f9e3c1','#f9e3c1','#f9e3c1','#f9e3c1'];
    for(let i=0;i<colors.length;i++)px(0,i*15,W,16,colors[i]);
    const sx=311-Math.floor(cam*.1),sy=dusk?57:31;
    px(sx+5,sy,16,3,'#ffe8b7');px(sx+2,sy+3,22,4,'#ffe8b7');px(sx,sy+7,26,13,'#ffe8b7');px(sx+3,sy+20,20,3,'#ffe8b7');px(sx+6,sy+23,14,2,'#ffe8b7');
    for(let i=0;i<5;i++){const x=31+i*79-Math.floor(cam*.25),y=35+i%3*12;
      px(x,y,24+i%2*19,1,dusk?'#d9a08e':'#f8e7ca');px(x+8,y-2,36+i%2*10,2,dusk?'#d9a08e':'#f8e7ca');}
    // Evening errands continue above the valley: two magpies, seen only as wing strokes.
    const x=166-Math.floor(cam*.4);
    px(x,70,3,1,'#9c827a');px(x+3,71,2,1,'#9c827a');px(x+5,70,3,1,'#9c827a');
    px(x+17,64,3,1,'#9c827a');px(x+20,65,2,1,'#9c827a');px(x+22,64,3,1,'#9c827a');
  }
  function vistaCanopy(x,y,f=1){
    const q=(a,b,w,h,c)=>M(x,y,f,a,b,w,h,c);
    q(0,1,7,68,'#4a362e');q(2,4,2,59,'#6b4835');
    q(4,24,15,5,'#4a362e');q(15,20,15,4,'#4a362e');q(27,15,16,4,'#4a362e');q(39,11,12,3,'#4a362e');
    q(3,39,13,4,'#4a362e');q(14,35,8,4,'#4a362e');
    const cl=(a,b,w,h,c)=>{q(a+4,b,w-8,h,c);q(a,b+3,w,h-6,c);q(a+7,b-2,w-14,3,c);};
    cl(-5,-4,32,25,'#9d5136');cl(16,-7,27,20,'#b86b3b');cl(38,0,22,14,'#c07a3e');
    cl(-7,20,22,21,'#aa5e36');cl(18,15,18,14,'#bb723c');
    q(4,3,7,2,'#d1944d');q(23,3,5,2,'#dca151');q(40,6,4,2,'#e0aa57');q(0,26,4,2,'#d59b4e');
    q(33,15,3,2,'#d6a157');q(53,12,3,2,'#bd6b3b');
    // Sparse hanging leaves leave sky between the branch and the leaf clusters.
    q(20,28,1,7,'#745239');q(18,34,5,3,'#d39a4a');q(42,20,1,6,'#745239');q(40,25,5,3,'#c8823f');
  }
  function vistaStreamSky(){
    vistaSky();ridge(1,'#b59a96',112,14,.01);
    farAir();
    for(let i=0;i<5;i++){const x=12+i*92-cam;px(x,119+i%2*3,81,2,'#e5c8aa');px(x+16,122+i%2*3,53,1,'#e5c8aa');}
    // Its broad forked crown matches the sacred oak reached through the hollow.
    const tx=330-cam;
    px(tx-3,91,7,30,'#8c6c56');px(tx-12,88,15,4,'#8c6c56');px(tx+1,84,13,4,'#8c6c56');
    px(tx-24,76,46,14,'#b97f59');px(tx-16,70,31,8,'#c58b60');px(tx-30,83,59,9,'#b97f59');
    px(tx-9,65,19,7,'#ca9367');px(tx-20,77,13,2,'#d4a074');px(tx+10,85,15,2,'#9f7052');
    px(tx-6,105,13,1,'#c9ac7c');px(tx-4,106,1,3,'#e3c8a1');px(tx+3,106,1,4,'#e3c8a1');
    px(tx-17,120,36,2,'#d2a56e');
  }
  function vistaStreamVillage(){
    ridge(1,'#aa8b69',149,10,.017);
    house(39-cam,159,.85,true);fence(84-cam,160,4);
    house(174-cam,147,.43,false,2);house(381-cam,155,.62,true,1);
    // The wheel belongs to a small mill, with a race bringing the stream to its top.
    house(278-cam,159,.84,false,1);wheel(260-cam,175);
    px(283-cam,129,48,3,'#9d784e');px(322-cam,131,4,28,'#795b3e');px(284-cam,129,38,1,'#bdc3a0');
    // A jar terrace and bank steps make the three households different at a glance.
    for(let i=0;i<3;i++){const x=137+i*9-cam,y=160;
      px(x-3,y-7,7,7,'#78533b');px(x-4,y-9,9,3,'#503d31');px(x-1,y-6,1,4,'#b68b5b');}
    for(let i=0;i<4;i++)px(202-cam+i*4,154+i*3,22,3,['#b4a180','#c5b18b','#d1bd94','#b5a17e'][i]);
    px(0,166,W,4,'#c1a574');
    for(let x=0;x<W;x+=5){const u=x+cam;if(hash(u)>.55)px(x,164+Math.round(hash(u+7)*3),4,3,'#a58e61');}
  }
  function vistaStreamWater(_offset,t){
    px(0,170,W,55,'#6c9490');px(0,171,W,2,'#b7c7a8');px(0,178,W,8,'#719994');px(0,200,W,25,'#628d88');
    for(let i=0;i<30;i++){
      const x=((i*29-cam)%670+670)%670-110,y=178+(i%7)*6;
      px(x,y,10+i%3*5,1,i%3?'#9ebeb0':'#cdd4b6');
    }
    const drift=Vfx.reducedMotion?0:Math.floor(t*33);
    for(let i=0;i<11;i++)leaf(i*57+24-cam+drift,180+i%5*8,['#d98d43','#eab954','#bd6740'][i%3]);
    // Broken strips reflect the mill, warm paper window and the late sun.
    const refl=(x,y,w,c)=>{for(let i=0;i<8;i++)px(x+(i%2?2:-2),y+i*3,w-Math.floor(i*.8),1,c);};
    refl(50-cam*.42,174,21,'#b9b58c');refl(266-cam*.42,174,16,'#97a98d');
    for(let i=0;i<12;i++)px(311-cam*.14-Math.floor(i*.6)+(i%2?3:-2),174+i*3,9+i*2,1,i%3?'#c8ccaa':'#e1d8af');
    // A water strider makes tiny concentric ripples beside an eddy of stranded leaves.
    const rx=181-cam*.35,ry=191;
    px(rx-5,ry,3,1,'#bbceba');px(rx+4,ry,3,1,'#bbceba');px(rx-2,ry-2,4,1,'#bbceba');px(rx-2,ry+2,4,1,'#bbceba');
    px(rx-1,ry,2,1,'#4c6e69');px(rx-2,ry-1,4,1,'#4c6e69');
  }
  function vistaStreamFrame(){
    px(0,216,W,9,'#483b2c');px(0,212,83,5,'#8b7046');px(300,214,100,3,'#8b7046');
    reeds(14,217);reeds(386,223);vistaCanopy(0,0,1);vistaCanopy(W,0,-1);
    px(22,207,13,4,'#9d8a61');px(17,211,24,3,'#6e624a');px(350,211,18,3,'#897651');
    leaf(87,213,'#e8b855');leaf(317,215,'#bb6b3d');
  }
  function vistaHillSky(){
    vistaSky(true);ridge(1,'#9f7d87',112,22,.009);
    farAir(true);
    for(let i=0;i<4;i++){const x=16+i*124-cam;px(x,107+i*5,83,2,'#dba08f');px(x+12,110+i*5,61,1,'#dba08f');}
  }
  function vistaHillValley(){
    ridge(1,'#ad8579',142,18,.014);
    for(let i=0;i<6;i++){const x=i*84+9-cam,y=145+i%3*5;
      px(x,y,79,2,'#d6ad94');px(x+9,y+2,66,1,'#dfb99c');px(x+21,y+4,47,1,'#dfb99c');}
    ridge(1,'#bd9069',168,13,.021);
    for(let i=0;i<22;i++){
      const x=i*31+Math.floor(hash(i*71)*13)-cam,y=169+Math.floor(hash(i+17)*13);
      tree(x,y,.22+hash(i+2)*.15,['#ce8546','#a96846','#df9d51'][i%3],false,i%3);
    }
    // The winding water carries the eye from the near bank to home's lit paper window.
    for(let yy=139;yy<203;yy+=2){const x=184-cam+Math.round(Math.sin(yy*.043)*33);px(x,yy,5+Math.floor((yy-139)/5),2,'#d9bb8e');}
    house(165-cam,165,.45,true);house(236-cam,172,.29,false,2);house(107-cam,177,.28,false,1);
    px(175-cam,157,3,5,'#f8ce85');px(167-cam,156,3,3,'#ffe3a3');px(196-cam,161,2,14,'#9a7254');
    for(let i=0;i<4;i++)px(169-cam+i*2,145-i*3,3,2,'#cdb39a');
    const x=263-cam,y=180;
    px(x-3,y-11,7,10,'#806149');px(x-5,y-9,11,6,'#806149');px(x-2,y-9,5,6,'#c3a376');
    px(x,y-11,1,10,'#806149');px(x-4,y-6,9,1,'#806149');px(x+3,y-14,15,2,'#b08a59');px(x+12,y-12,2,13,'#806149');
  }
  function vistaHillNear(){
    ridge(1,'#8a6249',196,8,.018);
    for(const u of [5,66,343,405,462])tree(u-cam,210,.65,u%3?'#bf6339':'#d58e43');
    px(0,207,W,18,'#69503a');px(0,207,W,2,'#b99858');
    for(let x=4;x<W;x+=17)leaf(x,211+x%7,['#bc673b','#e3aa4d','#cc8840'][Math.floor(x/17)%3]);
  }
  function vistaHillFrame(){
    // High oak branches frame, rather than hide, the small home in the valley.
    vistaCanopy(0,0,1);vistaCanopy(W,0,-1);
    leaf(78,21,'#eab457');leaf(112,11,'#c7773e');leaf(310,24,'#edbc64');
    px(0,220,W,5,'#47392e');px(15,214,36,6,'#80603d');px(350,216,43,4,'#80603d');
  }
  function motherPheasant(x,y,f=1){
    M(x,y,f,-24,-8,20,3,'#8c6c45');M(x,y,f,-20,-11,16,3,'#a17c4c');
    M(x,y,f,-7,-14,16,11,'#ae8a55');M(x,y,f,-3,-17,11,7,'#b99966');
    M(x,y,f,5,-23,7,9,'#a48353');M(x,y,f,10,-19,4,2,'#75573a');M(x,y,f,8,-21,1,1,'#362b21');
    M(x,y,f,-3,-11,1,2,'#e1c18a');M(x,y,f,1,-8,1,2,'#e1c18a');M(x,y,f,4,-12,1,2,'#e1c18a');
    M(x,y,f,-1,-3,1,3,'#775638');M(x,y,f,6,-3,1,3,'#775638');
  }
  Rg.expArt={
    back:zoneBack,scenery,front:()=>{},
    vistaStream:[{speed:.06,draw:vistaStreamSky},{speed:.22,draw:vistaStreamVillage},{speed:.52,draw:vistaStreamWater},{speed:0,draw:vistaStreamFrame}],
    vistaHill:[{speed:.06,draw:vistaHillSky},{speed:.24,draw:vistaHillValley},{speed:.48,draw:vistaHillNear},{speed:0,draw:vistaHillFrame}],
    magpie(x,y,f=1){
      const q=(a,b,w,h,c)=>M(x,y,f,a,b,w,h,c);
      q(-14,-6,15,4,'#3c4145');q(-12,-8,8,2,'#647680');q(-4,-13,12,11,'#333c40');q(-1,-10,8,6,'#e0dbcb');
      q(3,-20,9,8,'#3b4142');q(10,-16,6,2,'#a18b62');q(8,-18,1,1,'#f0e5c8');
      q(-1,-2,1,2,'#8b7353');q(5,-2,1,2,'#8b7353');q(-1,-14,8,5,'#6b7e80');
      q(-7,-12,5,7,'#b88d55');q(-8,-13,7,2,'#e2bd78');
    },
    brothers(x,y){
      Rg.art.squirrel(x-17,y,1);Rg.art.squirrel(x+18,y,-1);
      basket(x,y);for(let i=-1;i<=1;i++){px(x+i*5-2,y-12,4,4,'#ba854a');px(x+i*5-2,y-13,4,1,'#68452f');}
    },
    motherPheasant,
    chick(x,y,f=1){
      M(x,y,f,-5,-9,10,7,'#c9a163');M(x,y,f,-3,-13,8,7,'#e0ba79');M(x,y,f,-2,-12,1,7,'#775338');
      M(x,y,f,3,-10,1,1,'#342b21');M(x,y,f,5,-8,3,1,'#aa6e3d');M(x,y,f,-3,-2,1,2,'#7c5536');M(x,y,f,2,-2,1,2,'#7c5536');
    },
    stamp(x,y){
      pawStamp(x,y-1,'#a25b41');
    },
    marker(x,y){
      px(x-1,y-29,3,29,'#6b4b32');px(x-15,y-30,31,9,'#d2af72');px(x-12,y-28,22,1,'#e8cb91');
      px(x+4,y-27,5,1,'#765237');px(x+7,y-29,1,5,'#765237');
    },
    blocked(x,y){
      for(let i=-13;i<=13;i+=6){px(x+i,y-56+Math.abs(i),4,56-Math.abs(i),'#526e3a');
        for(let j=0;j<4;j++)px(x+i-3,y-43+j*11,10,3,'#7d8d46');}
      px(x-18,y-32,37,3,'#3c5931');px(x-15,y-20,32,2,'#3c5931');
    },
    treeDoor(x,y){treeHollow(x,y);},
    streamDoor(x,y){
      // A wide leaf in the shallows, held by an ordinary bank-side rope.
      px(x-21,y-4,43,5,'#a2783e');px(x-16,y-8,32,5,'#d4a54c');px(x-10,y-11,19,4,'#e6bd61');
      px(x-16,y-4,33,1,'#856239');px(x-19,y-3,37,1,'#deb360');px(x,y-9,1,10,'#99723b');
      px(x+22,y-17,2,17,'#745535');px(x+10,y-3,14,1,'#ba9b67');
    },
  };
}
})();
