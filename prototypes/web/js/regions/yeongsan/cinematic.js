'use strict';
/* 북쪽 영산: 두루미가 본 것 (회상 장면 두 편). 재생기는 engine/cine.js.
   결정 D-1260 (사용자 지시 2026-11-08 33): 두루미가 들려주던 엄마의 겨울과 아빠의 지난 일을 대화창 대신 큰 회상 장면으로 보여 준다.
   결정 D-1261: 시점은 두루미 눈이다. 두루미는 신목 섬 앞 얼음 끝에 서서 고개를 돌리지 않으니(D-1160), 모든 컷은 얼음 끝에서 섬과 신목 쪽(북쪽)을
     바라본 한 방향이다. 멀리(섬 전체)·가까이(신목 아래)·아주 가까이(가지의 매듭) 세 거리만 쓴다. 왼쪽 아래 가장자리에 두루미 부리 끝과 깃이 걸린다.
     두루미가 그 자리에서 보거나 들은 것만 그린다. 아이의 집, 장삿길, 호숫가 끝 바위는 나오지 않는다.
   결정 D-1262: 사실은 지금까지의 두루미 대사 그대로다(D-01·D-132·D-437·D-1082·D-1083·D-1087). 더하거나 바꾸지 않는다.
     - 엄마가 낸 값(둔갑과 말)은 그 자리에서 빠져나가지 않는다. 아이가 제 발로 설 때까지 미뤘다(DEFER_LINES). 그래서 엄마는 절만 하고, 나무가 셈을 받는다.
     - 엄마는 매듭을 맨 뒤 아기 이름을 불렀다(따뜻한 물결). 어둑차사가 그 소리를 나무째 삼켜, 나중에 같은 빛깔의 물결로 아이 이름을 부른다.
     - 아빠는 지난가을에 모자 없이 목도리만 둘렀다(지금 모습, art.js dad). 젊을 때 한 번 왔던 아빠는 그 모자를 썼다(두루미가 모자를 알아보는 까닭).
     - 어둑차사는 enemies.js 그림대로: 넓은 갓, 얼굴 없는 어둠, 흰 동정, 까마귀 깃으로 풀린 소매와 자락, 붉은 적패지. 정체는 말하지 않는다(D-1161).
     - 붉은색은 적패지와 부름에만 쓴다(§3.1). 아빠 목도리는 필드 그림과 같은 빛이다.
   결정 D-1263: 첫 편(그 겨울)은 두루미가 엄마 이야기를 꺼낼 때, 둘째 편(지난가을부터)은 아이가 "아빠는 왜 저렇게 됐어요?" 하고 물을 때 튼다.
     아이의 놀람·깨달음 줄은 회상이 끝난 뒤 대화로 잇는다(story.js craneStory). 옛 구성(CLASSIC)은 같은 자막을 대화로 읽는다.
   결정 D-1264: 두 편 다 본 뒤에는 수첩의 두루미 쪽에서 '두루미가 본 것 다시 보기'로 이어서 다시 볼 수 있다. */
(()=>{
const Rg=REGIONS.yeongsan;
const CRANE='두루미';
const W=240,H=135;
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k,ease=k=>{k=cl(k);return k*k*(3-2*k);};
const hx=h=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];};
// 섞은 빛도 #rrggbb 로 돌려준다 (섞은 빛을 다시 섞을 수 있게)
const mix=(a,b,k)=>{const p=hx(a),q=hx(b);return '#'+p.map((v,i)=>Math.round(lerp(v,q[i],cl(k))).toString(16).padStart(2,'0')).join('');};
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const poly=(c,pts,fill,alpha=1)=>{c.save();c.globalAlpha*=alpha;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.restore();};
const A=(c,a,f)=>{if(a<=0)return;c.save();c.globalAlpha*=cl(a);f();c.restore();};
// 줄 i 의 움직임이 얼마나 진행됐나: 지난 줄은 1, 아직 안 온 줄은 0
const prog=(s,i,dur,delay=0)=>s.li>i?1:s.li<i?0:ease((s.lt-delay)/dur);
function pline(x0,y0,x1,y1,w,col){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));
  for(let i=0;i<=n;i++){const k=i/n,ww=Math.max(1,Math.round(lerp(w,Math.max(1,w*.6),k)));R(Math.round(lerp(x0,x1,k)-ww/2),Math.round(lerp(y0,y1,k)-ww/2),ww,ww,col);}}
function skyBands(top,bottom,y0,y1){for(let y=y0;y<y1;y++)R(0,y,W,1,mix(top,bottom,(y-y0)/Math.max(1,y1-y0-1)));}
function ridge(base,amp,seed,col,y1){for(let x=0;x<W;x+=2){const h=Math.sin(x*.045+seed)*amp+Math.sin(x*.11+seed*2)*amp*.45+Math.sin(x*.27+seed*3)*amp*.18;R(x,Math.round(base-h),2,y1-Math.round(base-h),col);}}
function snow(t,n,fall,wind,col,big=false){for(let i=0;i<n;i++){const sp=fall*(.6+hash(i)*.8),x=((i*53.7+t*wind*(.5+hash(i+3)))%W+W)%W,y=((i*37.3+t*sp)%(H+10))-5;
  R(Math.round(x+Math.sin(t*1.3+i)*2),Math.round(y),big&&i%5===0?2:1,big&&i%5===0?2:1,col);}}
function glow(c,x,y,r,rgb,a){if(a<=0)return;const gr=c.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba('+rgb+','+a.toFixed(3)+')');gr.addColorStop(1,'rgba('+rgb+',0)');c.fillStyle=gr;c.fillRect(x-r,y-r,r*2,r*2);}
/* 부름의 물결: (x,y)에서 (tx,ty) 쪽으로 반원이 퍼진다. age 는 부른 뒤 초 */
function ripple(c,x,y,tx,ty,age,col,maxR=90){
  if(age<0||age>2.2)return;const a=Math.atan2(ty-y,tx-x);
  c.save();c.strokeStyle=col;c.lineWidth=1;
  for(let i=0;i<3;i++){const r=(age-i*.18)*maxR/1.6;if(r<=2)continue;c.globalAlpha=cl(1-r/maxR)*.85;c.beginPath();c.arc(x,y,r,a-.55,a+.55);c.stroke();}
  c.restore();
}
/* 이름 빛: a 에서 b 로 둥글게 떠 간다. k 0→1 */
function nameLight(c,a,b,k,rgb='238,232,214'){
  if(k<=0||k>=1)return;const x=lerp(a[0],b[0],k),y=lerp(a[1],b[1],k)-Math.sin(k*Math.PI)*14;
  for(let i=1;i<5;i++){const q=cl(k-i*.04),tx=lerp(a[0],b[0],q),ty=lerp(a[1],b[1],q)-Math.sin(q*Math.PI)*14;glow(c,tx,ty,3,rgb,.18);}
  glow(c,x,y,7,rgb,.55);R(Math.round(x),Math.round(y),1,1,'#fffaf0');
}

/* ---------- 인물 그림 (작은 판에 한 번 그려 두고 거리에 따라 줄여 놓는다) ---------- */
const SPR={};
function sprite(key,w,h,draw){
  if(SPR[key])return SPR[key];
  const s=document.createElement('canvas');s.width=w;s.height=h;const sg=s.getContext('2d');
  const saved=ctx;ctx=sg;try{draw(w,h);}finally{ctx=saved;}
  return SPR[key]=s;
}
function put(c,s,x,y,k=1,flip=false,alpha=1){
  const w=Math.max(1,Math.round(s.width*k)),h=Math.max(1,Math.round(s.height*k));
  c.save();c.globalAlpha*=alpha;c.imageSmoothingEnabled=false;
  if(flip){c.translate(Math.round(x),0);c.scale(-1,1);c.drawImage(s,-Math.round(w/2),Math.round(y)-h,w,h);}
  else c.drawImage(s,Math.round(x-w/2),Math.round(y)-h,w,h);
  c.restore();
}
const K='#2a211b',MOM='#857a6b',MOM2='#958a7b',WRAP='#56648a',WRAP2='#46557a',SCARF='#e3d6b8',BABY='#9a8e7e';
const DAD='#7c7062',DAD2='#8a7d6e',SC='#b4432a',TAIL='#6f6357',BUND='#b98a5a',BUND2='#8f6640';
const HAT1='#c39b55',HAT2='#dcbb7a',HAT3='#6e4f22',COTTON='#fbf7ee';
// 엄마 뒷모습: 머릿수건, 포대기에 업은 아기(아기 얼굴은 두루미 쪽을 본다)
const momBack=f=>sprite('momBack'+f,17,25,()=>{
  R(4,21+(f?1:0),3,4-(f?1:0),K);R(9,21+(f?0:1),3,4-(f?0:1),K);
  R(11,14,3,8,TAIL);R(11,17,3,1,K);R(11,20,3,1,K);
  R(3,9,10,13,MOM);R(3,9,1,13,MOM2);
  R(3,10,10,9,WRAP);R(3,13,10,1,WRAP2);R(3,16,10,1,WRAP2);R(2,9,2,2,WRAP2);R(12,9,2,2,WRAP2);
  R(10,7,5,4,BABY);R(10,6,1,1,BABY);R(14,6,1,1,BABY);R(10,8,5,1,K);R(11,9,3,1,'#e8dccb');   // 오른 어깨 너머로 아기 얼굴
  R(3,1,8,7,MOM);R(3,0,2,2,MOM);R(9,0,2,2,MOM);R(3,1,8,3,SCARF);R(6,4,3,2,'#cdbf9e');R(7,6,2,2,'#cdbf9e');   // 엄마 뒤통수와 머릿수건 매듭
});
// 젊은 아빠: 패랭이에 목화송이, 큰 보따리 (등·앞)
const youngBack=f=>sprite('youngBack'+f,18,27,()=>{
  R(5,23+(f?1:0),3,4-(f?1:0),K);R(10,23+(f?0:1),3,4-(f?0:1),K);
  R(12,16,3,8,TAIL);R(12,19,3,1,K);R(12,22,3,1,K);
  R(4,12,10,12,DAD);
  R(3,9,12,11,BUND);R(3,9,12,2,'#d0a56e');R(8,8,3,3,BUND2);R(3,15,12,1,BUND2);
  R(5,3,8,7,DAD);R(5,2,2,2,DAD);R(11,2,2,2,DAD);
  R(2,3,14,2,HAT1);R(5,0,8,3,HAT2);R(5,2,8,1,HAT3);R(11,-1,2,2,COTTON);
});
const youngFront=f=>sprite('youngFront'+f,18,27,()=>{
  R(5,23+(f?1:0),3,4-(f?1:0),K);R(10,23+(f?0:1),3,4-(f?0:1),K);
  R(1,11,3,10,BUND);R(14,11,3,10,BUND);
  R(4,12,10,12,DAD);R(6,14,6,8,'#cfc3b2');R(4,12,2,9,'#4a3424');R(12,12,2,9,'#4a3424');
  R(5,3,8,8,DAD);R(5,6,8,2,K);R(6,6,1,1,'#ffffff');R(11,6,1,1,'#ffffff');R(6,8,6,2,'#efe6d6');R(8,8,2,1,K);
  R(2,3,14,2,HAT1);R(5,0,8,3,HAT2);R(5,2,8,1,HAT3);R(11,-1,2,2,COTTON);
});
// 지난가을의 아빠: 모자 없이 목도리, 보따리
const dadFront=(f,down)=>sprite('dadFront'+f+(down?'d':''),18,25,()=>{
  R(5,21+(f?1:0),3,4-(f?1:0),K);R(10,21+(f?0:1),3,4-(f?0:1),K);
  R(1,10,3,10,BUND);R(14,10,3,10,BUND);
  R(4,10,10,12,DAD);R(6,13,6,8,'#cfc3b2');
  const d=down?1:0;
  R(5,1+d,8,8,DAD);R(5,0+d,2,2,DAD);R(11,0+d,2,2,DAD);R(5,4+d,8,2,K);
  if(down){R(6,5,2,1,'#3a3028');R(10,5,2,1,'#3a3028');}else{R(6,4,1,1,'#ffffff');R(11,4,1,1,'#ffffff');}
  R(6,6+d,6,2,'#efe6d6');R(8,6+d,2,1,K);
  R(4,9,10,2,SC);R(5,11,3,4,SC);
});
const dadSide=f=>sprite('dadSide'+f,20,25,()=>{
  R(7,21+(f?1:0),3,4-(f?1:0),K);R(11,21+(f?0:1),3,4-(f?0:1),K);
  R(1,13,4,3,TAIL);R(1,13,1,3,K);
  R(5,10,10,12,DAD);R(2,8,6,11,BUND);R(2,8,6,2,'#d0a56e');
  R(9,2,9,8,DAD);R(9,1,2,2,DAD);R(14,4,6,2,K);R(16,4,1,1,'#ffffff');R(15,6,5,2,'#efe6d6');R(19,6,1,1,K);
  R(8,9,8,2,SC);
});
/* 섬 위의 아주 작은 아빠: 앉음 / 일어나 한 손을 듦. c 는 빛이 빠진 정도(0 그대로, 1 잿빛) */
function dadTiny(x,y,pose,grey=0){
  const body=mix(DAD,'#6a6a6a',grey*.8),sc=mix(SC,'#6b5a56',grey),dk=mix(K,'#4a4a4a',grey*.5);
  if(pose==='sit'){R(x-4,y-5,8,5,body);R(x-3,y-8,6,4,body);R(x-3,y-7,6,1,dk);R(x-3,y-5,6,1,sc);R(x+4,y-3,3,3,BUND);}
  else{R(x-2,y-2,2,2,dk);R(x+1,y-2,2,2,dk);R(x-3,y-8,6,6,body);R(x-2,y-12,5,4,body);R(x-2,y-11,5,1,dk);R(x-3,y-8,6,1,sc);
    if(pose==='raise'){R(x+3,y-14,1,6,body);R(x+3,y-15,2,2,dk);}R(x-6,y-4,3,3,BUND);}
}

/* ---------- 어둑차사 (먹빛, enemies.js 그림을 섬 거리로 줄였다) ---------- */
function chasa(c,x,y,k=1,alpha=1,marks=0,t=0){
  A(c,alpha,()=>{
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2+t*.4;blob(c,x+Math.cos(a)*12*k,y-16*k+Math.sin(a)*10*k,9*k,7*k,INK,.12);}
    poly(c,[[x-5*k,y-30*k],[x-9*k,y-12*k],[x-14*k,y],[x+14*k,y],[x+9*k,y-12*k],[x+5*k,y-30*k]],'#191512',.95);
    for(let i=0;i<6;i++){const u=(i+.5)/6;quillT(c,x-14*k+u*28*k,y-1,5*k,1.4*k,Math.PI/2+(hash(i)-.5)*.7);}   // 자락 끝 깃
    for(const s of [-1,1]){const sx=x+s*5*k,sy=y-28*k,ex=x+s*17*k,ey=y-12*k+Math.sin(t*1.6+s)*1.2*k;
      poly(c,[[sx,sy],[sx+s*4*k,sy-1],[ex+s*2*k,ey-4*k],[ex+s*2*k,ey+3*k],[ex-s*4*k,ey+4*k],[sx,sy+8*k]],'#1d1915',.95);
      for(let i=0;i<4;i++)quillT(c,ex-s*4*k+i*s*2*k,ey+2*k,5*k,1.2*k,Math.PI/2+s*(.2+i*.2));}
    blob(c,x,y-33*k,4.5*k,5*k,'#0c0907',.95);
    brush(c,[[x-4*k,y-29*k],[x,y-25*k],[x+4*k,y-29*k]],1,'#ebe5d8',.75);   // 흰 동정
    c.save();c.fillStyle='#14100d';c.beginPath();c.ellipse(x,y-37*k,15*k,2.4*k,0,0,Math.PI*2);c.fill();
    c.beginPath();c.moveTo(x-5*k,y-37*k);c.lineTo(x-4.5*k,y-44*k);c.quadraticCurveTo(x,y-45.5*k,x+4.5*k,y-44*k);c.lineTo(x+5*k,y-37*k);c.closePath();c.fill();c.restore();
    // 붉은 적패지: 왼손에서 늘어진 천. 먹은 이름이 붉은 자국으로 비친다
    const hx0=x-17*k,hy0=y-10*k,len=15*k;
    for(let i=0;i<=8;i++){const u=i/8;R(Math.round(hx0+Math.sin(u*4+t*1.2)*1.5-u*2),Math.round(hy0+u*len),Math.max(2,Math.round(3*k)),2,'#a3261c');}
    R(Math.round(hx0-1),Math.round(hy0-1),2,2,'#ebe5d8');   // 흰 손
    for(let i=0;i<Math.min(marks,8);i++){const u=(i+.6)/9;R(Math.round(hx0+Math.sin(u*4+t*1.2)*1.5-u*2),Math.round(hy0+u*len),1,1,'#e0503a');}
  });
}
function quillT(c,x,y,len,wid,a){const ca=Math.cos(a),sa=Math.sin(a),nx=-sa,ny=ca;
  poly(c,[[x,y],[x+ca*len*.35+nx*wid,y+sa*len*.35+ny*wid],[x+ca*len,y+sa*len],[x+ca*len*.4-nx*wid*.7,y+sa*len*.4-ny*wid*.7]],INK,.9);}

/* ---------- 배경: 얼음 끝에서 북쪽 (멀리) ---------- */
const P={
  winterDusk:{sky:['#28304c','#8c8496'],far:'#4e5670',near:'#3e465e',lake:['#9fb4c4','#dbe7ee'],isle:'snow',flakes:'#f2f4f8'},
  oldDay:{sky:['#a9b4bc','#e2ddcf'],far:'#8c96a0',near:'#7a8590',lake:['#9fb0b4','#c9d4d4'],isle:'thin',flakes:null},
  autumn:{sky:['#3c3452','#d69a62'],far:'#5a4a5a',near:'#4a3c4c',lake:['#3e4f60','#5e6e78'],isle:'autumn',flakes:null,water:true},
  night:{sky:['#090c18','#1e2840'],far:'#141a2a',near:'#10141f',lake:['#26323f','#3e4c5c'],isle:'snow',flakes:'#c9d4dc'},
};
const ISLE={x:150,top:60,base:78};
const TREE=[[150,72,149,48,4],[149,48,148,26,3],[149,52,128,40,2],[128,40,116,36,1],[128,40,124,30,1],[150,47,170,38,2],[170,38,184,36,1],[170,38,174,28,1],
  [148,37,136,24,2],[136,24,128,20,1],[149,34,162,22,2],[162,22,170,16,1],[148,28,146,15,1],[150,60,166,54,1]];
const TAGS=[[121,38],[131,27],[165,25],[178,38],[160,56]];   // 멀리서 본 명다리 자리 (마지막이 아이 것, 낮은 가지)
function wideBack(c,p,t,o={}){
  const sky=o.sky||p.sky;skyBands(sky[0],sky[1],0,60);
  if(o.stars)for(let i=0;i<26;i++)R(Math.round(hash(i)*W),Math.round(hash(i+9)*44)+9,1,1,(i+Math.floor(t*2))%7?'#3c4a66':'#8a9ab6');
  if(o.moon)glow(c,o.moon[0],o.moon[1],16,'200,210,230',.18);
  ridge(52,7,1.3,o.far||p.far,62);ridge(57,4,4.1,o.near||p.near,62);
  const lake=o.lake||p.lake;for(let y=60;y<H;y++)R(0,y,W,1,mix(lake[0],lake[1],(y-60)/(H-60)));
  if(p.water||o.water){for(let i=0;i<22;i++){const y=62+Math.floor(hash(i)*60),x=((hash(i+4)*W+t*(4+i%3))%W);R(Math.round(x),y,3+(i%3),1,o.glint||'rgba(240,190,130,.35)');}}
  else for(let i=0;i<7;i++){const x=hash(i*3)*W,y=82+hash(i*5)*40;pline(x,y,x+10+hash(i)*14,y+2-hash(i+1)*4,1,'rgba(255,255,255,.35)');}   // 얼음 금
  // 섬
  const isle=o.isle||p.isle;
  for(let y=ISLE.top;y<ISLE.base;y++){const k=(y-ISLE.top)/(ISLE.base-ISLE.top),hw=Math.round(24+k*20+Math.sin(y*.9)*1.5);
    const col=isle==='autumn'?mix('#8a7448','#5a4a30',k):isle==='thin'?mix('#b8b49c','#8a8a78',k):mix('#eef3f6','#b8c8d2',k);R(ISLE.x-hw,y,hw*2,1,col);}
  R(ISLE.x-44,ISLE.base,88,1,isle==='autumn'?'#2e2a26':'#5a6a78');
  if(p.water||o.water)for(let i=0;i<5;i++)R(ISLE.x-36+i*16,ISLE.base+2+i%2,10,1,'rgba(20,24,30,.35)');   // 물에 비친 섬
}
function tree(c,o={}){
  const col=o.col||'#3a2e2a';
  if(o.aura)glow(c,150,40,44,'240,214,150',o.aura*(.16+.04*Math.sin((o.t||0)*1.4)));
  for(const [x0,y0,x1,y1,w] of TREE)pline(x0,y0,x1,y1,w,col);
  if(o.snow)for(const [x0,y0,x1,y1,w] of TREE)if(w>1)pline(x0,y0-1,x1,y1-1,1,'rgba(240,244,248,.75)');
  if(o.leaves)for(let i=0;i<o.leaves;i++){const [x0,y0,x1,y1]=TREE[i%TREE.length],u=hash(i);R(Math.round(lerp(x0,x1,u)+hash(i+2)*4-2),Math.round(lerp(y0,y1,u)-1-hash(i+5)*3),1,1,i%3?'#d8903c':'#e8b85a');}
  R(146,64,9,1,'#c9b07a');R(147,65,1,2,'#f4efe4');R(150,65,1,2,'#f4efe4');R(153,65,1,2,'#f4efe4');   // 금줄
  const tags=o.tags==null?TAGS.length:o.tags;
  TAGS.forEach(([x,y],i)=>{
    if(i===4&&!o.kid)return;
    if(i<4&&i>=tags){R(x,y,1,2,'#b8a888');return;}   // 끈만 남은 자리
    const sw=Math.round(Math.sin((o.t||0)*2+i)*.6);R(x+sw,y,2,6,'#f1ece0');R(x,y-1,2,1,i===4?'#d8b968':'#b8a888');
  });
}
/* 두루미 눈: 왼쪽 아래 가장자리에 부리 끝과 검은 목깃, 흰 뺨깃이 흐릿하게 걸린다 */
function craneEye(c,dark=0){
  // 자막 띠(아래 5분의 1)에 가리지 않게 왼쪽 가장자리 가운데쯤에 건다. 부리는 길고 곧으며 끝이 뾰족하다
  const bk=mix('#8f8a62','#3c3a2a',dark),bkL=mix('#bdb78a','#55523e',dark),bkD=mix('#5e5a3e','#22201a',dark);
  blob(c,-10,92,16,30,mix('#1c1a1a','#07070a',dark),.9);                        // 검은 목깃 (초점 밖이라 흐릿하다)
  blob(c,-4,70,7,12,mix('#f2f0ea','#6a6a70',dark),.45);                          // 흰 뺨깃
  poly(c,[[-2,80],[40,70],[47,69.5],[40,73],[-2,90]],bk,.95);                    // 윗부리
  poly(c,[[-2,80],[40,70],[47,69.5],[38,71]],bkL,.7);                            // 부리 등줄의 빛
  poly(c,[[-2,87],[38,73],[40,73],[-2,90]],bkD,.8);                              // 아랫부리 그늘
  for(let i=0;i<5;i++)brush(c,[[-2,100+i*5],[6+i*2,96+i*4]],1.4,mix('#1c1a1a','#07070a',dark),.5);   // 깃 끝
}
let vig=null;
function finish(c,o={}){
  if(o.tint){c.save();c.globalCompositeOperation='multiply';c.globalAlpha=o.tint[1];c.fillStyle=o.tint[0];c.fillRect(0,0,W,H);c.restore();}
  craneEye(c,o.dark||0);
  if(!vig){vig=c.createRadialGradient(W/2,H/2-6,W*.28,W/2,H/2,W*.62);vig.addColorStop(0,'rgba(6,7,11,0)');vig.addColorStop(1,'rgba(6,7,11,.62)');}
  c.fillStyle=vig;c.fillRect(0,0,W,H);
  const f=Math.floor(performance.now()/90);for(let i=0;i<30;i++){const u=hash(i+f*31);R(Math.floor(u*W),Math.floor(hash(i*7+f)*H),1,1,i%2?'rgba(255,250,235,.07)':'rgba(0,0,0,.08)');}
}
/* 멀리 → 가까이 거리에 따른 크기 */
const depth=y=>lerp(.42,1.05,cl((y-78)/(118-78)));

/* ---------- 가까이: 신목 아래 ---------- */
const NEAR_TAGS=[[110,0],[134,0],[158,0],[184,0],[210,0]];
const hiY=x=>30-(x-84)*8/152,loY=x=>60-(x-84)*8/112;
function nearBack(c,p,t,o={}){
  skyBands(p.sky[0],p.sky[1],0,92);ridge(78,6,2.2,p.far,96);
  const ground=o.ground||(p.isle==='autumn'?['#6f5e3c','#4a3e28']:['#e8eef2','#b8c8d2']);
  for(let y=96;y<H;y++)R(0,y,W,1,mix(ground[0],ground[1],(y-96)/(H-96)));
  if(o.aura)glow(c,80,50,80,'240,214,150',o.aura*(.14+.04*Math.sin(t*1.4)));
  const bark=o.bark||'#4a3a32';
  R(68,0,18,100,bark);R(68,0,3,100,'#5e4a40');R(83,0,3,100,'#332822');for(let i=0;i<9;i++)R(72+(i*5)%10,hash(i)*90,1,10+hash(i+2)*8,'#3a2e28');
  R(64,96,26,4,bark);
  R(67,86,20,2,'#c9b07a');for(let i=0;i<4;i++)R(70+i*5,88,2,4,'#f4efe4');   // 금줄
  pline(84,30,236,22,4,bark);pline(110,29,104,16,2,bark);pline(160,26,170,12,2,bark);pline(206,24,214,12,1,bark);
  pline(84,60,196,52,3,bark);pline(130,57,138,46,1,bark);
  if(p.isle==='snow'){pline(84,28,236,20,1,'rgba(240,244,248,.8)');pline(84,58,196,50,1,'rgba(240,244,248,.8)');}
}
function nearTag(x,y,len,t,i,col='#f1ece0',knot='#b8a888'){
  const sw=Math.sin(t*1.6+i)*1.2;
  for(let j=0;j<len;j++){const d=Math.round(sw*j/len);R(x-2+d,y+2+j,5,1,j%7===3?'#e2dccf':col);}
  R(x-1+Math.round(sw*.4),y+6,1,Math.min(6,len-6),'#7a6a58');R(x+1+Math.round(sw*.6),y+9,1,Math.min(4,len-10),'#7a6a58');   // 읽히지 않는 먹 자국
  R(x-2,y,5,2,knot);
}
// 엄마 뒷모습 크게: pose 'hold'(천을 들어 보인다) · 'bow'(절한다)
function momBig(x,y,pose,t,bow=0){
  R(x-7,y-6,4,6,K);R(x+3,y-6,4,6,K);
  R(x+6,y-16,4,11,TAIL);R(x+6,y-12,4,1,K);R(x+6,y-8,4,1,K);
  R(x-9,y-28,18,22,MOM);R(x-9,y-28,2,22,MOM2);
  const b=Math.round(bow*3);
  R(x-8,y-31+b,16,17,WRAP);R(x-8,y-25+b,16,1,WRAP2);R(x-8,y-20+b,16,1,WRAP2);R(x-10,y-32+b,3,3,WRAP2);R(x+7,y-32+b,3,3,WRAP2);
  if(pose==='hold'){R(x-11,y-60,3,31,MOM);R(x+8,y-60,3,31,MOM);R(x-12,y-63,4,3,K);R(x+8,y-63,4,3,K);}
  else{R(x-11,y-28+b,3,10,MOM);R(x+8,y-28+b,3,10,MOM);}
  // 아기: 엄마 오른 어깨 너머로 얼굴이 두루미 쪽을 본다. 눈은 감았고 숨이 여리다
  const bx=x+5,by=y-35+b;R(bx-3,by,7,6,BABY);R(bx-3,by-1,2,2,'#8a7e6e');R(bx+2,by-1,2,2,'#8a7e6e');R(bx-3,by+2,7,1,K);R(bx-2,by+2,1,1,'#5a4a3e');R(bx+2,by+2,1,1,'#5a4a3e');R(bx-1,by+4,3,1,'#e8dccb');R(bx,by+4,1,1,K);
  // 엄마 뒤통수: 얼굴은 신목 쪽이라 보이지 않는다. 머릿수건과 매듭
  const hy=y-45+b*2;R(x-7,hy,12,10,MOM);R(x-7,hy-2,3,3,MOM);R(x+2,hy-2,3,3,MOM);R(x-7,hy,12,4,SCARF);R(x-7,hy+4,1,3,'#cdbf9e');R(x-2,hy+5,3,2,'#cdbf9e');R(x-1,hy+7,2,3,'#cdbf9e');
}

/* ---------- 아주 가까이: 가지의 매듭 ---------- */
const brY=x=>36+x*14/240;   // 가지 가운데 줄
const KX=124;
function closeBack(c,p,t,o={}){
  skyBands(p.sky[0],p.sky[1],0,H);ridge(104,5,3.3,p.far,H);
  if(o.aura)glow(c,KX,60,70,'240,214,150',o.aura);
  R(0,0,22,H,'#2c221e');R(18,0,4,H,'#3a2e28');
  for(let x=0;x<W;x++){const y=Math.round(brY(x));R(x,y-6,1,13,'#4e3c34');R(x,y-6,1,2,'#6a564a');R(x,y+5,1,2,'#2e2420');if(x%9===0)R(x,y-2+(x%3),1,4,'#3a2e28');}
  if(p.isle==='snow')for(let x=0;x<W;x++)R(x,Math.round(brY(x))-8,1,2+(x%11===0?1:0),'#e8eef2');
}
/* 매듭: tie 0→1 (두 번 감고 한 번 당긴다), loose 0→1 (셋째 부름에 느슨해짐) */
function knot(c,t,tie,loose,sway){
  const by=brY(KX),cl1=tie>.33,cl2=tie>.66,pull=ease((tie-.66)/.34),sl=ease(loose);
  // 무명천: 매듭 밑에 늘어진다
  const top=Math.round(by+6),len=56,tilt=sway+sl*3;
  for(let j=0;j<len;j++){const d=Math.round(tilt*j/len+Math.sin(t*1.4+j*.08)*.8*(j/len));R(KX-10+d,top+j,21,1,j%9===4?'#e6dfd0':'#f1ece0');R(KX+9+d,top+j,2,1,'#d8d0c0');}
  for(const [dx,a,b] of [[-4,8,30],[1,12,40],[5,9,22]])for(let j=a;j<b;j++)if(j%5)R(KX+dx+Math.round(tilt*j/len),top+j,1,1,'#7a6a58');   // 읽히지 않는 먹 자국
  const CORD='#d8b968',CD='#a8853e';
  if(cl1){const x=KX-5,yy=Math.round(sl*1);R(x,by-7+yy,2,14,CORD);R(x,by-7+yy,1,14,CD);}
  if(cl2){const x=KX+3,yy=Math.round(sl*4);R(x,by-7+yy,2,14,CORD);R(x+1,by-7+yy,1,14,CD);}
  const bulb=Math.round(lerp(10,7,pull)+sl*3);R(KX-bulb/2,by+6,bulb,3,CORD);R(KX-bulb/2,by+8,bulb,1,CD);
  const tail=Math.round(lerp(4,10,pull)+sl*5);R(KX-3,by+9,1,tail,CORD);R(KX+2,by+9,1,tail-1+Math.round(sl*2),CORD);
}
/* 반투명하게 겹쳐 그릴 것: 한 판에 그린 뒤 통째로 옅게 얹는다 (겹친 칸이 얼룩지지 않게) */
const LAY=document.createElement('canvas');LAY.width=W;LAY.height=H;
function layered(c,alpha,fn,dx=0,dy=0){
  if(alpha<=0)return;if(alpha>=.999&&!dx&&!dy){fn(c);return;}
  const lg=LAY.getContext('2d');lg.setTransform(1,0,0,1,0,0);lg.globalAlpha=1;lg.clearRect(0,0,W,H);lg.imageSmoothingEnabled=false;
  const saved=ctx;ctx=lg;try{fn(lg);}finally{ctx=saved;}
  c.save();c.globalAlpha*=Math.min(1,alpha);c.drawImage(LAY,dx,dy);c.restore();
}
/* 너구리 팔과 손 하나: 아래 가장자리(side 쪽)에서 비스듬히 올라와 (x,y)에서 손가락을 오므린다. 너구리 손은 짙다 */
function paw(x,y,side,fur,furLt,hand){
  const bx=x+side*46,byy=H+12;
  pline(bx,byy,x+side*2,y+5,11,fur);pline(bx-side*2,byy-2,x+side*1,y+3,2,furLt);   // 팔뚝과 털빛
  R(x-4,y-2,9,7,hand);R(x-3,y-1,7,1,'#4a4038');                                   // 손바닥
  for(let i=0;i<4;i++)R(x-4+i*2+(i>1?1:0),y-5+(i===0||i===3?1:0),2,4,hand);         // 오므린 손가락
  R(x-side*6,y,2,4,hand);                                                           // 엄지
}
/* 손 둘이 매듭을 맨다. tie 0→1 에 맞춰 움직인다. 첫 감기·둘째 감기는 오른손이 끈을 가지 너머로 돌리고, 마지막에 두 손이 끈 끝을 당긴다 */
function hands(t,tie,fur,furLt,hand,enter=1){
  const by=brY(KX),off=Math.round((1-enter)*60);
  let lx=KX-12,ly=by+14,rx=KX+14,ry=by+20;
  if(tie<.66){const w=(tie%.33)/.33,cx=tie<.33?KX-5:KX+3,a=w*Math.PI*2;
    rx=cx+4+Math.round(Math.cos(a+Math.PI/2)*13);ry=by+4+Math.round(Math.sin(a+Math.PI/2)*13);}
  else{const p=ease((tie-.66)/.34);lx=KX-8-p*9;ly=by+15+p*7;rx=KX+8+p*9;ry=by+15+p*7;}
  paw(lx,ly+off,-1,fur,furLt,hand);paw(rx,ry+off,1,fur,furLt,hand);
  if(tie<.66)pline(KX,by+8,rx,ry+off-2,1,'#d8b968');
}

/* ---------- 첫 편: 그 겨울 ---------- */
const momPath=k=>[lerp(98,148,k),lerp(118,72,Math.pow(k,.85))];
const WINTER={id:'crane_winter',who:CRANE,music:'theme',sub:'두루미가 본 것',title:'그 겨울',cuts:[
  {lines:[{text:'여러 해 전 겨울이다.\n너구리 하나가 얼음을 건너왔다.',cues:[[.3,'footstep_snow'],[1.4,'footstep_snow']]},
          {text:'등에 업은 아기는\n숨이 꺼져 가고 있었다.'}],
   draw(c,s){const p=P.winterDusk;wideBack(c,p,s.t);tree(c,{aura:1,t:s.t,snow:true,tags:4});
     const k=.8*prog(s,0,6.5)+.2*prog(s,1,3),moving=k<.999,[x,y]=momPath(k),d=depth(y);
     put(c,momBack(moving?Math.floor(s.t*3.5)%2:0),x,y,d);
     if(s.li===1){const ph=s.lt%2.6,a=cl(1-ph/1.4)*cl(1-s.lt/9)*.7;if(ph<1.4)R(Math.round(x+2*d),Math.round(y-20*d-ph*3),1,1,'rgba(240,244,248,'+a.toFixed(2)+')');}   // 아기의 여린 입김
     snow(s.t,70,26,-14,p.flakes,true);finish(c,{tint:['#efe2cc',.35]});}},
  {lines:[{text:'아기 이름을 천에 적어 와서\n신목에 팔겠다 했지.',cues:[[.4,'cloth_flutter']]},
          {text:'값으로 제 둔갑과 말을 내놓았다.'}],
   draw(c,s){const p=P.winterDusk;nearBack(c,p,s.t,{aura:s.li?lerp(.6,1.4,prog(s,1,2.5)):.6});
     NEAR_TAGS.slice(0,4).forEach(([x],i)=>nearTag(x,Math.round(hiY(x)),16+(i%2)*4,s.t,i));
     const bow=s.li===1?(Math.sin(cl(s.lt/3.2)*Math.PI*2-Math.PI/2)+1)/2*(s.lt<3.2?1:0):0;
     momBig(150,104,s.li===0?'hold':'bow',s.t,bow);
     if(s.li===0){const sw=Math.sin(s.t*2)*1.2;for(let j=0;j<14;j++)R(141+Math.round(sw*j/14),42+j,19,1,j%5===2?'#e6dfd0':'#f1ece0');R(146,45,1,7,'#7a6a58');R(150,46,1,8,'#7a6a58');R(154,44,1,6,'#7a6a58');}   // 아기 이름 적은 무명천을 들어 보인다
     snow(s.t,50,22,-10,p.flakes,true);finish(c,{tint:['#efe2cc',.35]});}},
  {lines:[{text:'제 손으로 가지에 매더구나.\n두 번 감고, 한 번 당겨서.',cues:[[.6,'cloth_flutter'],[3.4,'held_string']]}],
   draw(c,s){const p=P.winterDusk,tie=cl((s.lt-.5)/2.8),pulled=s.lt-3.4;
     closeBack(c,p,s.t,{aura:pulled>0?.22*cl(1-pulled/3):0});
     knot(c,s.t,tie,0,0);
     hands(s.t,tie,MOM,MOM2,K,ease(s.lt/.5));
     if(pulled>0)for(let i=0;i<3;i++)ripple(c,KX,H+6,KX,brY(KX),pulled-i*.55,'rgba(236,196,120,.9)',120);   // 매듭을 묶고 아기 이름을 부른다 (따뜻한 소리)
     snow(s.t,40,20,-8,p.flakes,true);finish(c,{tint:['#efe2cc',.35]});}},
  {lines:[{text:'그보다 오래전, 네 아비가 젊어서 한 번 왔었다.\n열매 소문을 좇아서.',cues:[[.3,'footstep_snow']]},
          {text:'열매는 잃은 것만 돌려준다.\n빈손으로 돌아가더구나.'}],
   draw(c,s){const p=P.oldDay;wideBack(c,p,s.t);tree(c,{aura:1,t:s.t,tags:3,col:'#4a3e38'});
     if(s.li===0){const k=prog(s,0,4.5),x=lerp(84,112,k),y=lerp(122,100,k);put(c,youngBack(k<.999?Math.floor(s.t*3.5)%2:0),x,y,depth(y));}
     else{const w=cl((s.lt-1.4)/4),x=lerp(112,150,w),y=lerp(100,140,w);
       put(c,w>0?youngFront(Math.floor(s.t*3.5)%2):youngBack(0),x,y,depth(y));}
     finish(c,{tint:['#e6cfa6',.55]});}},
]};

/* ---------- 둘째 편: 지난가을부터 ---------- */
const dadNear=[104,110];
const AUTUMN={id:'crane_autumn',who:CRANE,music:'theme',sub:'두루미가 본 것',title:'지난가을부터',cuts:[
  {lines:[{text:'지난가을 네 아비가 왔다.\n제 것으로 셈을 닫겠다 했지.',cues:[[.3,'leaf_rustle']]},
          {text:'안 된다 했다.\n숨을 받은 쪽이 닫아야 하는 셈이니.'},
          {text:'봄이 오면 열매가 연다 했더니,\n봄까지 기다리겠다고 섬에 남았다.',cues:[[.2,'leaf_rustle']]}],
   draw(c,s){const p=P.autumn;wideBack(c,p,s.t);tree(c,{aura:1,t:s.t,leaves:24,tags:4});
     for(let i=0;i<6;i++){const u=((s.t*.12+hash(i))%1),x=Math.round(lerp(130,120+hash(i+1)*60,u)),y=Math.round(lerp(30,80,u));R(x+Math.round(Math.sin(s.t*2+i)*2),y,1,1,'#d8903c');}   // 지는 잎
     for(let x=0;x<W;x+=3){const h=10+hash(x)*10;pline(x,H,x+Math.sin(s.t*1.2+x)*2,H-h,1,x%2?'#b89048':'#8a6a34');}   // 물가 갈대
     const walk=prog(s,0,3.2),x=lerp(-8,dadNear[0],walk);
     if(s.li<2||s.lt<1)A(c,s.li===2?1-cl(s.lt):1,()=>{
       if(walk<.999)put(c,dadSide(Math.floor(s.t*3.5)%2),x,dadNear[1],1);
       else put(c,dadFront(0,s.li>=1&&!(s.li===1&&s.lt<.6)),x,dadNear[1],1);});
     if(s.li===2)A(c,cl(s.lt-.6),()=>dadTiny(162,72,'sit'));
     finish(c,{tint:['#f0dcc0',.2]});}},
  {lines:[{text:'첫눈 오던 밤에 그게 내려앉았다.\n먼저 신목을 부르더구나.',cues:[[.2,'crow_caw'],[2.4,'chasa_call'],[3.8,'chasa_call']]},
          {text:'나무는 대답할 줄 모르니…\n세 번째에 이름이 나갔지.',cues:[[.5,'chasa_call'],[1.6,'chasa_write']]},
          {text:'그 뒤로 나무는 그냥 나무다.\n제가 신목인 줄도 잊었지.'}],
   draw(c,s){const p=P.night;wideBack(c,p,s.t,{stars:true,moon:[60,20],water:false});
     const lose=prog(s,1,1.4,1),aura=1-lose;
     tree(c,{aura,t:s.t,snow:s.li>=1,tags:4,kid:true,col:mix('#3a2e2a','#2a2624',lose)});
     dadTiny(162,72,'sit');
     const land=prog(s,0,2.2),cx=128,cy=lerp(-30,74,land);
     if(s.li===0&&land<1)for(let i=0;i<5;i++)blob(c,cx+(hash(i)-.5)*20,cy-40+i*10*(1-land),3,5,INK,.4*(1-land));   // 먹이 흘러내리며 내려앉는다
     chasa(c,cx,cy,1,1,lose>.5?1:0,s.t);
     const from=[cx,cy-30],to=[150,40];
     if(s.li===0){ripple(c,from[0],from[1],to[0],to[1],s.lt-2.4,'rgba(200,52,38,.9)');ripple(c,from[0],from[1],to[0],to[1],s.lt-3.8,'rgba(200,52,38,.9)');}
     if(s.li===1){ripple(c,from[0],from[1],to[0],to[1],s.lt-.5,'rgba(200,52,38,.9)');nameLight(c,[150,40],[cx-17,cy-6],cl((s.lt-1)/1.4),'250,226,160');}
     snow(s.t,s.li?55:22,14,-4,p.flakes);finish(c,{dark:.7});}},
  {lines:[{text:'그다음엔 명다리들을 불렀다.\n지켜 줄 나무가 없으니.',cues:[[.6,'chasa_call']]},
          {text:'세 번째마다 천이 하나씩\n풀려 날아갔지.',cues:[[.9,'cloth_flutter'],[2.5,'cloth_flutter'],[4.1,'cloth_flutter']]}],
   draw(c,s){const p=P.night;nearBack(c,p,s.t,{bark:'#2e2622'});
     const FLY=[2,0,4];   // 날아가는 차례 (가운데, 맨 왼쪽, 맨 오른쪽)
     NEAR_TAGS.forEach(([x],i)=>{const y=Math.round(hiY(x)),o=FLY.indexOf(i),f=s.li===1&&o>=0?cl((s.lt-(.9+o*1.6))/1.1):0;
       if(f>=1){R(x,y,1,3,'#8a7c68');return;}   // 끈만 남는다
       if(f>0){R(x,y,1,3,'#8a7c68');A(c,1-f,()=>nearTag(Math.round(x-f*110),Math.round(y-f*24+Math.sin(f*9)*4),16,s.t*4,i,'#e8e2d4','#8a7c68'));return;}
       nearTag(x,y,16+(i%2)*4,s.t,i,'#d8d2c4','#8a7c68');});
     nearTag(150,Math.round(loY(150)),20,s.t,9,'#d8d2c4','#d8b968');   // 아이 명다리 (엄마 매듭)
     R(56,92,10,6,mix(DAD,'#555555',.2));R(57,88,7,5,mix(DAD,'#555555',.2));R(57,89,7,1,K);R(56,92,10,1,SC);   // 신목 아래 웅크린 아빠
     const calls=s.li===0?[.6]:[0,1.6,3.2];
     for(const at of calls)for(let i=0;i<3;i++)ripple(c,-10,40,150,40,s.lt-at-i*.3,'rgba(200,52,38,.85)',140);
     snow(s.t,40,12,-4,p.flakes);finish(c,{dark:.7});}},
  {lines:[{text:'어느 밤 그게 네 이름을 불렀다.\n네 어미 목소리로.',cues:[[.8,'held_string'],[2.2,'held_string']]},
          {text:'세 번째 부름에 네 아비가 일어나 대답했다.\n"여기 있소." 제 이름을 대면서.',cues:[[.4,'held_string'],[1.9,'chasa_write']]},
          {text:'그게 그 이름을 적어 갔지.'}],
   draw(c,s){const p=P.night;wideBack(c,p,s.t,{stars:true,moon:[60,20]});tree(c,{t:s.t,snow:true,tags:1,kid:true,col:'#2a2624'});
     const back=prog(s,2,2),cx=lerp(128,122,back),cy=74,from=[cx,cy-30],to=[160,56],WARM='rgba(236,196,120,.95)';
     chasa(c,cx,cy,1,1,1+(s.li>=1&&s.lt>2.4||s.li>1?1:0),s.t);
     const up=s.li===1&&s.lt>1;
     dadTiny(162,72,up&&s.lt<4?(s.lt>1.3?'raise':'stand'):'sit',s.li>1?.15:0);
     if(s.li===0){ripple(c,from[0],from[1],to[0],to[1],s.lt-.8,WARM);ripple(c,from[0],from[1],to[0],to[1],s.lt-2.2,WARM);}
     if(s.li===1){ripple(c,from[0],from[1],to[0],to[1],s.lt-.4,WARM);nameLight(c,[163,60],[cx-17,cy-6],cl((s.lt-1.7)/1.4));}
     if(s.li===2)glow(c,cx-18,cy-6,8,'224,80,58',.4*(1-cl(s.lt/2.5)));
     snow(s.t,50,14,-4,p.flakes);finish(c,{dark:.7});}},
  {lines:[{text:'다음 밤에 또 너를 불렀고,\n아비는 또 대답했다.'},
          {text:'밤마다 하나씩.\n아비는 이름이 많은 보부상이었으니까.'}],
   draw(c,s){
     const T=s.t,day=T/2.6,ph=day%1,nightK=ph<.5?1-ph*2:(ph-.5)*2,dn=Math.floor(day);
     const sky=[mix('#8ea2b6','#090c18',nightK),mix('#c9d0d6','#1e2840',nightK)],lake=[mix('#b8c8d4','#26323f',nightK),mix('#e2eaef','#3e4c5c',nightK)];
     wideBack(c,P.night,T,{sky,lake,far:mix('#7a8494','#141a2a',nightK),near:mix('#6a7484','#10141f',nightK),stars:nightK>.6});
     tree(c,{t:T,snow:true,tags:0,kid:true,col:'#2a2624'});
     const grey=cl(dn/7),marks=2+dn;
     layered(c,cl((nightK-.35)*3),g2=>chasa(g2,122,74,1,1,marks,T));   // 밤에만 앉아 있다
     const age=((ph+.15)%1)*2.6;   // 그 밤 부름이 시작된 뒤 초 (해가 지고 어두워질 무렵부터)
     dadTiny(162,72,age>.55&&age<.95?'raise':'sit',grey);
     if(age<1.4){for(let i=0;i<3;i++)ripple(c,122,44,160,56,age-i*.25,'rgba(236,196,120,.9)');nameLight(c,[163,60],[105,68],cl((age-.6)/.7));}
     snow(T,30,12,-4,nightK>.5?'#c9d4dc':'#ffffff');finish(c,{dark:nightK*.7});}},
  {lines:[{text:'이름이 다 나간 뒤에도 손은 남더구나.\n밤마다 건너와 그 매듭을 다시 묶는다.',cues:[[.4,'chasa_call'],[1.9,'cloth_flutter']]},
          {text:'네 어미가 그 겨울 매던 매듭 그대로다.',cues:[[.8,'held_string']]}],
   draw(c,s){const p=P.night;
     let tie,loose,enter,ghost=0;
     if(s.li===0){loose=ease((s.lt-1.9)/.5);enter=ease((s.lt-2.4)/.6);tie=cl((s.lt-3)/2.8);loose*=1-cl(tie*1.5);}
     else{loose=0;enter=1;tie=.66+.34*ease(s.lt/2.6);ghost=ease(s.lt/1.4);}
     closeBack(c,p,s.t,{aura:ghost*.18});
     const sway=s.li===0&&s.lt<2?Math.sin(s.lt*9)*cl(1-s.lt/2)*2:0;
     knot(c,s.t,s.li===0&&s.lt<3?1:tie,loose,sway);
     if(s.li===0)for(let i=0;i<3;i++)ripple(c,-10,brY(0),KX,brY(KX),s.lt-.4-i*.5,'rgba(200,52,38,.85)',150);
     if(enter>0)hands(s.t,s.li===0&&s.lt<3?.66:tie,mix(DAD,'#6a6a6a',.45),mix(DAD2,'#7a7a7a',.45),'#2e2a26',enter);   // 이름이 빠져 잿빛이 된 아빠 손
     layered(c,.5*ghost,g2=>{glow(g2,KX,brY(KX)+24,46,'236,196,120',.4);hands(s.t,tie,'#c8b088','#e8d4a8','#6a5038',1);},-3,-2);   // 그 겨울 엄마 손이 살짝 비껴 겹쳐 보인다
     snow(s.t,36,12,-4,p.flakes,true);finish(c,{dark:.7});}},
]};

/* 결정 D-1263: 옛 구성이나 재생기가 없으면 같은 자막을 두루미 대사로 읽는다 */
const asLines=def=>def.cuts.flatMap(cut=>cut.lines.map(l=>[l.who||CRANE,l.text]));
Rg.craneMemory=(part,then)=>{
  const def=part==='autumn'?AUTUMN:WINTER;
  if(CLASSIC||typeof Cine==='undefined'){talk(asLines(def),then,{scene:'y_sangun_story'});return;}
  Cine.play(def,then);
};
Rg.craneMemoryLines=part=>asLines(part==='autumn'?AUTUMN:WINTER);   // QA 대사 검사용 (읽기만 한다)
// 결정 D-1264: 수첩 두루미 쪽에서 두 편을 이어서 다시 본다
if(typeof Cine!=='undefined')Cine.addReplay('durumi',{label:'두루미가 본 것 다시 보기',when:()=>!CLASSIC&&knows('durumi:story'),
  play:()=>Cine.play(WINTER,()=>Cine.play(AUTUMN))});
})();
