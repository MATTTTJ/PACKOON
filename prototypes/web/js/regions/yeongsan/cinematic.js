'use strict';
/* 북쪽 영산: 두루미가 본 것 (회상 장면 두 편). 재생기는 engine/cine.js.
   결정 D-1260 (사용자 지시 2026-11-08 33): 두루미가 들려주던 엄마의 겨울과 아빠의 지난 일을 대화창 대신 큰 회상 장면으로 보여 준다.
   결정 D-1261: 시점은 두루미 눈이다. 두루미는 신목 섬 앞 얼음 끝에 서서 고개를 돌리지 않으니(D-1160), 모든 컷은 얼음 끝에서 섬과 신목 쪽(북쪽)을
     바라본 한 방향이다. 멀리(섬 전체)·가까이(신목 아래)·아주 가까이(가지의 매듭) 세 거리만 쓴다. 왼쪽 아래 가장자리에 두루미 부리 끝과 깃이 걸린다.
     두루미가 그 자리에서 보거나 들은 것만 그린다. 아이의 집, 장삿길, 호숫가 끝 바위는 나오지 않는다.
   결정 D-1262 (사용자 지시 2026-11-08 47로 바뀜, name-story-v4 D-1363·D-1364): 사실은 v4 §1의 순서 그대로다.
     - 첫 편 '그 여름': 엄마가 혼자 작은 배로 건너와 아이 명패를 엄마 매듭으로 매고, 이름을 한 번 부르고, 값(둔갑과 말)이 빛 두 줄기로 나무에 든다.
       값을 미루던 옛 설정(DEFER_LINES)과 업은 아기, 젊은 아빠의 열매 컷은 뺐다.
     - 둘째 편 '첫눈 무렵': 아빠가 지게짐을 지고 온다 → 어둑차사가 신목 이름을 먹는다 → 명패들이 끌려간다 → 아빠가 짐을 풀어 제 이름을 대며 빈다
       → 아들 명패를 풀어 품에 안는다 → 엄마 목소리가 아빠 이름을 세 번 부른다 → 세 번째에 돌아본다 → 이름이 적힌다 → 패를 안고 호숫가로 간다.
     - 어둑차사는 enemies.js 그림대로: 넓은 갓, 얼굴 없는 어둠, 흰 동정, 까마귀 깃으로 풀린 소매와 자락, 붉은 적패지. 정체는 말하지 않는다(D-1161).
     - 붉은색은 적패지와 부름에만 쓴다(§3.1). 엄마 목소리의 부름은 따뜻한 빛깔의 물결이다.
   결정 D-1263: 첫 편(그 여름)은 두루미가 엄마 이야기를 꺼낼 때, 둘째 편(첫눈 무렵)은 아이가 "아빠는 왜 저렇게 됐어요?" 하고 물을 때 튼다.
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
const K='#2a211b',MOM='#857a6b',MOM2='#958a7b',WRAP='#56648a',WRAP2='#46557a',SCARF='#e3d6b8';
const DAD='#7c7062',DAD2='#8a7d6e',SC='#b4432a',TAIL='#6f6357',BUND='#b98a5a',BUND2='#8f6640';
// 결정 D-1360 (name-story-v4 §1): 작년 여름의 엄마는 혼자 왔다. 업은 아기 없이 머릿수건만 둘렀고, 품에 나무 패를 안았다
const momSolo=f=>sprite('momSolo'+f,17,25,()=>{
  R(4,21+(f?1:0),3,4-(f?1:0),K);R(9,21+(f?0:1),3,4-(f?0:1),K);
  R(11,14,3,8,TAIL);R(11,17,3,1,K);R(11,20,3,1,K);
  R(3,9,10,13,MOM);R(3,9,1,13,MOM2);R(3,13,10,2,WRAP);R(3,15,10,1,WRAP2);
  R(3,1,8,7,MOM);R(3,0,2,2,MOM);R(9,0,2,2,MOM);R(3,1,8,3,SCARF);R(6,4,3,2,'#cdbf9e');R(7,6,2,2,'#cdbf9e');
});
/* 작은 거룻배 (멀리): 배 위에 엄마가 앉아 노를 젓는다. row 0→1 은 노의 한 번 젓기 */
function boatFar(c,x,y,d,row){
  const w=Math.round(20*d),h=Math.max(2,Math.round(3*d));
  R(Math.round(x-w/2),Math.round(y-h),w,h,'#5a3e28');R(Math.round(x-w/2)+1,Math.round(y-h),w-2,1,'#7a5a3a');R(Math.round(x-w/2)-1,Math.round(y-h)-1,2,1,'#5a3e28');
  const a=Math.sin(row*Math.PI*2);pline(x+3*d,y-h-6*d,x+(9+a*4)*d,y+2*d,1,'#6e4f22');
  for(let i=0;i<3;i++)R(Math.round(x-w/2-4-i*5-row*3),Math.round(y+1+i%2),3,1,'rgba(240,248,250,.35)');   // 배 뒤 물결
}
// 첫눈 무렵의 아빠: 지게에 짐을 한가득 졌다(옆모습). 보부상으로 모은 귀한 것
const dadJige=f=>sprite('dadJige'+f,24,34,()=>{
  R(9,30+(f?1:0),3,4-(f?1:0),K);R(13,30+(f?0:1),3,4-(f?0:1),K);
  R(3,22,4,3,TAIL);R(3,22,1,3,K);
  R(7,19,10,12,DAD);R(13,11,9,8,DAD);R(13,10,2,2,DAD);R(18,13,6,2,K);R(20,13,1,1,'#ffffff');R(19,15,5,2,'#efe6d6');R(23,15,1,1,K);
  R(12,18,8,2,SC);
  R(2,0,2,30,'#6e4f22');R(8,4,2,26,'#6e4f22');R(2,8,8,1,'#6e4f22');R(2,20,8,1,'#6e4f22');   // 지게 틀
  R(0,1,11,6,'#8a5a3a');R(0,7,11,5,'#3e5a7a');R(1,12,10,4,'#c9a45a');R(0,16,11,4,'#7a3a3a');R(1,2,2,2,'#e6d8b8');R(5,13,2,2,'#e8e2d2');   // 비단 필·놋그릇·약재 짐
});
// 신목 앞에 무릎 꿇은 아빠 뒷모습 (가까이). bow 0→1 이마를 숙인다
function dadKneel(x,y,bow){
  const b=Math.round(bow*4);
  R(x-10,y-4,20,4,K);R(x+7,y-14,4,11,TAIL);R(x+7,y-10,4,1,K);R(x+7,y-6,4,1,K);
  R(x-9,y-24+b,18,20,DAD);R(x-9,y-24+b,2,20,DAD2);R(x-9,y-23+b,18,3,SC);R(x-6,y-20+b,4,6,SC);
  R(x-7,y-35+b*2,14,11,DAD);R(x-7,y-37+b*2,3,3,DAD);R(x+4,y-37+b*2,3,3,DAD);
}
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
  // 결정 D-1362 (name-story-v4 §1): 작년 여름. 호수가 녹아 엄마는 작은 배로 건넜다. 신목은 그때 아직 제 이름이 있어 잎이 무성하다
  summer:{sky:['#7fa6c4','#e6dcc2'],far:'#5e7a6a',near:'#4c6a58',lake:['#4f7f94','#9cc2c8'],isle:'summer',flakes:null,water:true},
  snowDay:{sky:['#8e9cac','#d4dadf'],far:'#6a7686',near:'#5a6676',lake:['#a8bac6','#dce6ec'],isle:'snow',flakes:'#f2f4f8'},
  dawn:{sky:['#3a4462','#c8a4a0'],far:'#3e4660',near:'#323a52',lake:['#8094a8','#b8c6d0'],isle:'snow',flakes:null},
  // 결정 D-1265 (D-1258과 맞춤): 늦가을 첫얼음. 아빠는 첫얼음을 밟고 걸어서 섬에 건넜다. 옅은 잿빛 얼음판에 금과 검은 물 자리
  autumn:{sky:['#3c3452','#d69a62'],far:'#5a4a5a',near:'#4a3c4c',lake:['#7f888f','#aeb5b8'],isle:'autumn',flakes:null,firstIce:true},
  night:{sky:['#090c18','#1e2840'],far:'#141a2a',near:'#10141f',lake:['#26323f','#3e4c5c'],isle:'snow',flakes:'#c9d4dc'},
};
const ISLE={x:150,top:60,base:78};
const TREE=[[150,72,149,48,4],[149,48,148,26,3],[149,52,128,40,2],[128,40,116,36,1],[128,40,124,30,1],[150,47,170,38,2],[170,38,184,36,1],[170,38,174,28,1],
  [148,37,136,24,2],[136,24,128,20,1],[149,34,162,22,2],[162,22,170,16,1],[148,28,146,15,1],[150,60,166,54,1]];
const TAGS=[[121,38],[131,27],[165,25],[178,38],[160,56]];   // 멀리서 본 명패 자리 (마지막이 아이 것, 낮은 가지)
function wideBack(c,p,t,o={}){
  const sky=o.sky||p.sky;skyBands(sky[0],sky[1],0,60);
  if(o.stars)for(let i=0;i<26;i++)R(Math.round(hash(i)*W),Math.round(hash(i+9)*44)+9,1,1,(i+Math.floor(t*2))%7?'#3c4a66':'#8a9ab6');
  if(o.moon)glow(c,o.moon[0],o.moon[1],16,'200,210,230',.18);
  ridge(52,7,1.3,o.far||p.far,62);ridge(57,4,4.1,o.near||p.near,62);
  const lake=o.lake||p.lake;for(let y=60;y<H;y++)R(0,y,W,1,mix(lake[0],lake[1],(y-60)/(H-60)));
  if(p.water||o.water){for(let i=0;i<22;i++){const y=62+Math.floor(hash(i)*60),x=((hash(i+4)*W+t*(4+i%3))%W);R(Math.round(x),y,3+(i%3),1,o.glint||'rgba(240,190,130,.35)');}}
  else if(p.firstIce){
    // 얇은 첫얼음: 아직 다 덮지 못해 검은 물 자리가 군데군데 남았고, 가는 금이 많다. 저녁놀이 얼음에 옅게 비친다
    for(let i=0;i<9;i++){const x=hash(i*7+1)*W,y=64+hash(i*3+2)*58,k=(y-60)/75,rw=(4+hash(i)*10)*(.5+k),rh=(1+hash(i+5)*2)*(.5+k);
      if(Math.abs(y-110)<9&&x<130)continue;   // 아빠가 걸어온 줄에는 물 자리가 없다 (단단한 데를 골라 디뎠다)
      blob(c,x,y,rw,rh,'#2a3440',.9);blob(c,x-rw*.3,y-rh*.3,rw*.5,rh*.4,'#3e4a56',.8);R(Math.round(x-rw*.6),Math.round(y+rh-1),Math.max(2,Math.round(rw*.8)),1,'rgba(230,236,240,.45)');}
    for(let i=0;i<16;i++){const x=hash(i*5)*W,y=62+hash(i*11)*62,l=6+hash(i+1)*18;pline(x,y,x+l*(hash(i+9)-.3),y+3-hash(i+2)*6,1,'rgba(240,244,248,.4)');pline(x+l*.5,y+1,x+l*.5+4,y+4,1,'rgba(60,70,80,.35)');}
    for(let i=0;i<10;i++)R(Math.round(hash(i+40)*W),Math.round(66+hash(i+41)*50),6+(i%4)*3,1,'rgba(232,170,110,.22)');
  }
  else for(let i=0;i<7;i++){const x=hash(i*3)*W,y=82+hash(i*5)*40;pline(x,y,x+10+hash(i)*14,y+2-hash(i+1)*4,1,'rgba(255,255,255,.35)');}   // 얼음 금
  // 섬
  const isle=o.isle||p.isle;
  for(let y=ISLE.top;y<ISLE.base;y++){const k=(y-ISLE.top)/(ISLE.base-ISLE.top),hw=Math.round(24+k*20+Math.sin(y*.9)*1.5);
    const col=isle==='autumn'?mix('#8a7448','#5a4a30',k):isle==='summer'?mix('#7a9a58','#4a6a38',k):mix('#eef3f6','#b8c8d2',k);R(ISLE.x-hw,y,hw*2,1,col);}
  R(ISLE.x-44,ISLE.base,88,1,isle==='autumn'?'#2e2a26':isle==='summer'?'#2e3a26':'#5a6a78');
  if(p.water||o.water)for(let i=0;i<5;i++)R(ISLE.x-36+i*16,ISLE.base+2+i%2,10,1,'rgba(20,24,30,.35)');   // 물에 비친 섬
}
function tree(c,o={}){
  const col=o.col||'#3a2e2a';
  if(o.aura)glow(c,150,40,44,'240,214,150',o.aura*(.16+.04*Math.sin((o.t||0)*1.4)));
  for(const [x0,y0,x1,y1,w] of TREE)pline(x0,y0,x1,y1,w,col);
  if(o.snow)for(const [x0,y0,x1,y1,w] of TREE)if(w>1)pline(x0,y0-1,x1,y1-1,1,'rgba(240,244,248,.75)');
  if(o.leaves)for(let i=0;i<o.leaves;i++){const [x0,y0,x1,y1]=TREE[i%TREE.length],u=hash(i);const lc=o.leafCol||['#d8903c','#e8b85a'];R(Math.round(lerp(x0,x1,u)+hash(i+2)*4-2),Math.round(lerp(y0,y1,u)-1-hash(i+5)*3),o.leafCol?2:1,o.leafCol?2:1,i%3?lc[0]:lc[1]);}
  R(146,64,9,1,'#c9b07a');R(147,65,1,2,'#f4efe4');R(150,65,1,2,'#f4efe4');R(153,65,1,2,'#f4efe4');   // 금줄
  const tags=o.tags==null?TAGS.length:o.tags;
  TAGS.forEach(([x,y],i)=>{
    if(i===4&&!o.kid)return;
    if(i<4&&i>=tags){R(x,y,1,2,'#b8a888');return;}   // 끈만 남은 자리
    // 결정 D-1361 (name-story-v4 §2): 멀리서 본 명패. 끈 끝에 매달린 작은 나무 패
    const sw=Math.round(Math.sin((o.t||0)*2+i)*.6);R(x,y-1,2,1,i===4?'#d8b968':'#b8a888');R(x+sw,y+1,1,2,i===4?'#d8b968':'#b8a888');R(x+sw-1,y+3,3,4,'#b8955e');R(x+sw-1,y+3,3,1,'#d4b47a');
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
  const ground=o.ground||(p.isle==='autumn'?['#6f5e3c','#4a3e28']:p.isle==='summer'?['#6a8a4a','#4a6a34']:['#e8eef2','#b8c8d2']);
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
/* 결정 D-1361: 명패(가까이). 가지에서 끈이 내려와 손바닥만 한 나무 패가 달린다. 패의 먹 자국은 읽히지 않게 */
function nearTag(x,y,len,t,i,col='#c9a878',knot='#b8a888'){
  const sw=Math.sin(t*1.6+i)*1.2,cord=Math.max(4,len-10),d=Math.round(sw);
  for(let j=0;j<cord;j++)R(x+Math.round(sw*j/cord),y+2+j,1,1,knot);
  const py=y+2+cord;R(x-3+d,py,7,9,col);R(x-3+d,py,7,1,mix(col,'#ffffff',.3));R(x-3+d,py+8,7,1,mix(col,'#000000',.25));
  R(x-1+d,py+2,1,5,'#4a3a2a');R(x+1+d,py+3,1,3,'#4a3a2a');   // 읽히지 않는 먹 자국
  R(x-2,y,5,2,knot);
}
// 엄마 뒷모습 크게: pose 'hold'(명패를 들어 보인다) · 'bow'(절한다) · 'stand'
function momBig(x,y,pose,t,bow=0){
  R(x-7,y-6,4,6,K);R(x+3,y-6,4,6,K);
  R(x+6,y-16,4,11,TAIL);R(x+6,y-12,4,1,K);R(x+6,y-8,4,1,K);
  R(x-9,y-28,18,22,MOM);R(x-9,y-28,2,22,MOM2);
  const b=Math.round(bow*3);
  R(x-8,y-31+b,16,17,WRAP);R(x-8,y-25+b,16,1,WRAP2);R(x-8,y-20+b,16,1,WRAP2);R(x-10,y-32+b,3,3,WRAP2);R(x+7,y-32+b,3,3,WRAP2);
  if(pose==='hold'){R(x-11,y-60,3,31,MOM);R(x+8,y-60,3,31,MOM);R(x-12,y-63,4,3,K);R(x+8,y-63,4,3,K);}
  else{R(x-11,y-28+b,3,10,MOM);R(x+8,y-28+b,3,10,MOM);}
  // 결정 D-1360: 업은 아기는 없다. 아이는 단풍골 할멈 약방에 맡겨져 앓고 있다. 'hold' 면 두 손으로 나무 명패를 들어 보인다
  if(pose==='hold'){R(x-6,y-72,12,15,'#c9a878');R(x-6,y-72,12,1,'#ddc497');R(x-6,y-58,12,1,'#9a7a4e');R(x-1,y-75,2,4,'#d8b968');R(x-3,y-69,1,8,'#4a3a2a');R(x+1,y-68,1,6,'#4a3a2a');}
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
/* 매듭: tie 0→1 (두 번 감고 한 번 당긴다), loose 0→1 (셋째 부름에 느슨해짐), drop 0→1 (끈이 풀린 패가 손에 들려 내려간다)
   결정 D-1361: 끈 끝에 매달린 것은 무명천이 아니라 나무 명패다 */
function knot(c,t,tie,loose,sway,drop=0){
  const by=brY(KX),cl1=tie>.33,cl2=tie>.66,pull=ease((tie-.66)/.34),sl=ease(loose),dr=ease(drop);
  const tilt=sway+sl*3,cord=Math.round(14+sl*3),top=Math.round(by+6+dr*90);
  if(dr<.02)for(let j=0;j<cord;j++)R(KX+Math.round(tilt*j/cord),by+6+j,2,1,'#c9a45a');   // 패를 단 끈
  const px0=KX-11+Math.round(tilt),py0=top+(dr<.02?cord:6);
  R(px0,py0,23,30,'#c9a878');R(px0,py0,23,2,'#ddc497');R(px0,py0+28,23,2,'#9a7a4e');R(px0,py0,2,30,'#b8955e');R(px0+21,py0,2,30,'#9a7a4e');
  R(px0+11,py0-3,2,4,'#c9a45a');   // 끈 구멍
  for(const [dx,a,b] of [[7,7,24],[12,6,26],[16,9,20]])for(let j=a;j<b;j++)if(j%4)R(px0+dx,py0+j,1,1,'#4a3a2a');   // 읽히지 않는 먹 글씨 자국
  if(dr>=.02)return;
  const CORD='#d8b968',CD='#a8853e';
  if(cl1){const x=KX-5,yy=Math.round(sl*1);R(x,by-7+yy,2,14,CORD);R(x,by-7+yy,1,14,CD);}
  if(cl2){const x=KX+3,yy=Math.round(sl*4);R(x,by-7+yy,2,14,CORD);R(x+1,by-7+yy,1,14,CD);}
  const bulb=Math.round(lerp(10,7,pull)+sl*3);R(KX-bulb/2,by+6,bulb,3,CORD);R(KX-bulb/2,by+8,bulb,1,CD);
  const tail=Math.round(lerp(4,10,pull)+sl*5);R(KX-3,by+9,1,Math.min(tail,6),CORD);R(KX+2,by+9,1,Math.min(tail-1+Math.round(sl*2),6),CORD);
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

/* ---------- 첫 편: 그 여름 ----------
   결정 D-1363 (name-story-v4 §1·§5, 사용자 지시 2026-11-08 47): 엄마는 작년 여름 혼자 배로 건너왔다. 아이는 단풍골 두꺼비 할멈 약방에서 앓고 있었다.
   명패를 엄마 매듭으로 가지에 매고, 아이 이름을 한 번 부르고, 값(둔갑과 말)이 빛 두 줄기로 나무에 든다. 값은 미루지 않는다.
   젊은 아빠가 열매 소문을 좇아 왔던 컷은 뺐다(열매를 뺐다). */
const LEAF=['#4f7a3a','#6f9a4a'];
function nearLeaves(c,t,n=70){for(let i=0;i<n;i++){const x=Math.round(90+hash(i)*146),y=Math.round((i%2?hiY(x):loY(x))-3-hash(i+3)*7+Math.sin(t*1.3+i)*.6);R(x,y,2,2,i%3?LEAF[0]:LEAF[1]);}}
function closeLeaves(c,t){for(let i=0;i<40;i++){const x=Math.round(30+hash(i+7)*200);if(Math.abs(x-KX)<16)continue;const y=Math.round(brY(x)-8-hash(i)*12+Math.sin(t*1.2+i)*.8);R(x,y,4,3,i%3?LEAF[0]:LEAF[1]);R(x+1,y,2,1,'#8aba5a');}}
const boatPath=k=>[lerp(70,132,k),lerp(126,84,Math.pow(k,.85))];
const SUMMER={id:'crane_winter',who:CRANE,music:'theme',sub:'두루미가 본 것',title:'그 여름',cuts:[
  {lines:[{text:'작년 여름이다.\n너구리 하나가 작은 배를 저어 건너왔다.',cues:[[.4,'water_trickle'],[2.6,'water_trickle']]},
          {text:'혼자였다.\n품에 나무 패 하나만 안고서.'}],
   draw(c,s){const p=P.summer;wideBack(c,p,s.t,{glint:'rgba(255,255,255,.35)'});tree(c,{aura:1,t:s.t,tags:4,leaves:140,leafCol:LEAF});
     const k=.85*prog(s,0,6.5)+.15*prog(s,1,3),[x,y]=boatPath(k),d=depth(y);
     boatFar(c,x,y,d,k<.999?(s.t*.7)%1:.25);put(c,momSolo(0),x-2*d,y-2*d,d*.9);
     finish(c,{tint:['#f4ead0',.22]});}},
  {lines:[{text:'아이가 숨이 넘어간다 했다.\n그 이름을 신목에 걸겠다고.',cues:[[.4,'leaf_rustle']]},
          {text:'값으로 제 둔갑과 말을 내놓았다.'}],
   draw(c,s){const p=P.summer;nearBack(c,p,s.t,{aura:s.li?lerp(.6,1.4,prog(s,1,2.5)):.6});nearLeaves(c,s.t);
     NEAR_TAGS.slice(0,4).forEach(([x],i)=>nearTag(x,Math.round(hiY(x)),16+(i%2)*4,s.t,i));
     const bow=s.li===1?(Math.sin(cl(s.lt/3.2)*Math.PI*2-Math.PI/2)+1)/2*(s.lt<3.2?1:0):0;
     momBig(150,104,s.li===0?'hold':'bow',s.t,bow);
     finish(c,{tint:['#f4ead0',.22]});}},
  {lines:[{text:'제 손으로 가지에 매더구나.\n두 번 감고, 한 번 당겨서.',cues:[[.6,'cloth_flutter'],[3.4,'held_string']]}],
   draw(c,s){const p=P.summer,tie=cl((s.lt-.5)/2.8);
     closeBack(c,p,s.t);closeLeaves(c,s.t);
     knot(c,s.t,tie,0,0);
     hands(s.t,tie,MOM,MOM2,K,ease(s.lt/.5));
     finish(c,{tint:['#f4ead0',.22]});}},
  {lines:[{text:'그러고는 아이 이름을 한 번 불렀다.',cues:[[.5,'held_string']]},
          {text:'어미 몸에서 빛 두 줄기가 빠져나가\n나무로 들었다.',cues:[[.6,'leaf_rustle'],[2.2,'leaf_rustle']]}],
   draw(c,s){const p=P.summer;nearBack(c,p,s.t,{aura:s.li?.6+.8*prog(s,1,3,1):.6});nearLeaves(c,s.t);
     NEAR_TAGS.slice(0,4).forEach(([x],i)=>nearTag(x,Math.round(hiY(x)),16+(i%2)*4,s.t,i));
     nearTag(150,Math.round(loY(150)),20,s.t,9,'#c9a878','#d8b968');   // 방금 맨 아이 명패 (엄마 매듭)
     // 엄마는 패 아래에서 한 발 물러나 선다(패가 머리에 가리지 않게). 값이 빠져나가는 동안 몸빛이 조금씩 잿빛으로 가라앉는다
     const dim=s.li===1?prog(s,1,3.5,1):0;
     layered(c,1,g2=>momBig(126,104,'stand',s.t,0));
     if(dim>0)layered(c,dim*.4,g2=>{g2.save();g2.globalCompositeOperation='source-over';momBig(126,104,'stand',s.t,0);g2.globalCompositeOperation='source-atop';g2.fillStyle='#6a6a6a';g2.fillRect(0,0,W,H);g2.restore();});
     if(s.li===0)for(let i=0;i<3;i++)ripple(c,126,60,150,Math.round(loY(150))+10,s.lt-.5-i*.4,'rgba(236,196,120,.9)',70);   // 아이 이름을 부르는 따뜻한 소리
     if(s.li===1){nameLight(c,[122,70],[78,36],cl((s.lt-.6)/1.6),'236,226,200');nameLight(c,[130,72],[80,52],cl((s.lt-2.2)/1.6),'236,226,200');}   // 둔갑과 말
     finish(c,{tint:['#f4ead0',.22]});}},
  {lines:[{text:'어미는 절을 하고 돌아갔다.',cues:[[.4,'water_trickle']]},
          {text:'그날부터 나무가 그 아이 숨을 쥐었다.'}],
   draw(c,s){const p=P.summer;wideBack(c,p,s.t,{glint:'rgba(255,255,255,.35)'});tree(c,{aura:1+.3*prog(s,1,2),t:s.t,tags:4,kid:true,leaves:140,leafCol:LEAF});
     const k=1-prog(s,0,6),[x,y]=boatPath(k),d=depth(y);
     if(s.li===0){boatFar(c,x,y,d,(s.t*.7)%1);put(c,momSolo(0),x-2*d,y-2*d,d*.9);}
     finish(c,{tint:['#f4ead0',.22]});}},
]};

/* ---------- 둘째 편: 첫눈 무렵 ----------
   결정 D-1364 (name-story-v4 §1·§5): 아빠는 엄마 일을 듣고 평생 장삿길에서 모은 것을 지게에 지고 왔다. 그 무렵 어둑차사가 내려앉아 신목 이름을 먹었다.
   아빠는 짐을 다 풀어 제 이름을 대며 빌었지만 이름 잃은 나무는 받지 못했다. 아빠는 아들 명패를 풀어 품에 안았다.
   어느 밤 어둑차사가 엄마 목소리로 아빠 이름을 세 번 불렀고, 세 번째에 아빠가 돌아봤다(규칙 2). 옛 '여기 있소'(대신 대답, 규칙 11)는 뺐다.
   두루미는 얼음 끝에서 섬 쪽만 본다(D-1261). 아빠가 호숫가에서 매듭을 다시 묶는 모습은 두루미가 볼 수 없어 그리지 않는다. */
const dadNear=[104,110];
const SNOWFALL={id:'crane_autumn',who:CRANE,music:'theme',sub:'두루미가 본 것',title:'첫눈 무렵',cuts:[
  {lines:[{text:'작년 첫눈 무렵 네 아비가 왔다.\n지게에 짐을 한가득 지고.',cues:[[.3,'footstep_snow'],[1.5,'footstep_snow']]},
          {text:'어미 일을 다 듣고 왔다더구나.\n평생 장삿길에서 모은 것을 바치겠다고.'}],
   draw(c,s){const p=P.autumn;wideBack(c,p,s.t);tree(c,{aura:1,t:s.t,leaves:24,tags:4,kid:true});
     for(let x=0;x<W;x+=3){const h=10+hash(x)*10;pline(x,H,x+Math.sin(s.t*1.2+x)*2,H-h,1,x%2?'#b89048':'#8a6a34');}   // 물가 갈대
     const walk=prog(s,0,3.6),x=lerp(-12,dadNear[0],walk);
     for(let px=2,i=0;px<x-8;px+=6,i++)R(px,dadNear[1]-1+(i%2),2,1,'rgba(56,62,70,.55)');   // 첫얼음 위에 찍힌 아빠 발자국
     const fade=s.li===1?cl((s.lt-2.2)/1.2):0;
     A(c,1-fade,()=>put(c,dadJige(walk<.999?Math.floor(s.t*3.5)%2:0),x,dadNear[1],1));
     if(fade>0)A(c,fade,()=>dadTiny(162,72,'sit'));
     finish(c,{tint:['#f0dcc0',.2]});}},
  {lines:[{text:'그 무렵 그게 내려앉았다.\n먼저 신목을 부르더구나.',cues:[[.2,'crow_caw'],[2.4,'chasa_call'],[3.8,'chasa_call']]},
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
  {lines:[{text:'그다음엔 가지의 명패들을 불렀다.\n지켜 줄 나무가 없으니.',cues:[[.6,'chasa_call']]},
          {text:'세 번째마다 패가 하나씩\n끈째 끌려가 이름이 먹혔다.',cues:[[.9,'cloth_flutter'],[2.5,'cloth_flutter'],[4.1,'cloth_flutter']]}],
   draw(c,s){const p=P.night;nearBack(c,p,s.t,{bark:'#2e2622'});
     const FLY=[2,0,3];   // 끌려가는 차례 (가운데, 맨 왼쪽, 오른쪽)
     NEAR_TAGS.slice(0,4).forEach(([x],i)=>{const y=Math.round(hiY(x)),o=FLY.indexOf(i),f=s.li===1&&o>=0?cl((s.lt-(.9+o*1.6))/1.1):0;
       if(f>=1){R(x,y,1,3,'#8a7c68');return;}   // 끈 자리만 남는다
       if(f>0){R(x,y,1,3,'#8a7c68');A(c,1-f,()=>nearTag(Math.round(x-f*110),Math.round(y-f*24+Math.sin(f*9)*4),16,s.t*4,i,'#a8906a','#8a7c68'));return;}
       nearTag(x,y,16+(i%2)*4,s.t,i,'#b8a07a','#8a7c68');});
     nearTag(150,Math.round(loY(150)),20,s.t,9,'#b8a07a','#d8b968');   // 아이 명패 (엄마 매듭)
     R(56,92,10,6,mix(DAD,'#555555',.2));R(57,88,7,5,mix(DAD,'#555555',.2));R(57,89,7,1,K);R(56,92,10,1,SC);   // 신목 아래 웅크린 아빠
     const calls=s.li===0?[.6]:[0,1.6,3.2];
     for(const at of calls)for(let i=0;i<3;i++)ripple(c,-10,40,150,40,s.lt-at-i*.3,'rgba(200,52,38,.85)',140);
     snow(s.t,40,12,-4,p.flakes);finish(c,{dark:.7});}},
  {lines:[{text:'네 아비는 지고 온 것을 다 풀어 놓고\n제 이름을 대며 빌었다.',cues:[[.5,'cloth_flutter'],[2.4,'held_string']]},
          {text:'나무는 받지 못했다.\n제 이름을 잃은 나무는 셈도 못 한다.'}],
   draw(c,s){const p=P.snowDay;nearBack(c,p,s.t,{bark:'#3e322c'});
     NEAR_TAGS.forEach(([x])=>R(x,Math.round(hiY(x)),1,3,'#8a7c68'));   // 끈 자리만 남은 가지
     nearTag(150,Math.round(loY(150)),20,s.t,9,'#c0a478','#d8b968');   // 남은 아이 명패
     // 나무 앞에 풀어 놓은 짐: 비단 필, 놋그릇, 약재 꾸러미, 옹기, 빈 지게
     R(92,96,14,5,'#3e5a7a');R(92,96,14,1,'#5a7a9a');R(108,95,8,6,'#c9a45a');R(109,95,6,1,'#e8d08a');R(118,97,12,4,'#7a3a3a');R(132,94,7,7,'#6a4a32');R(133,94,5,1,'#8a6a4a');
     pline(198,100,204,72,2,'#6e4f22');pline(208,100,212,74,2,'#6e4f22');pline(200,90,210,90,1,'#6e4f22');
     const bow=s.li===0?(Math.sin(cl(s.lt/3)*Math.PI*2-Math.PI/2)+1)/2*(s.lt<3?1:0):.15;
     dadKneel(170,108,bow);   // 아들 명패(150) 곁, 머리에 가리지 않게
     if(s.li===0)for(let i=0;i<2;i++)ripple(c,170,74,80,40,s.lt-1-i*.5,'rgba(230,234,238,.6)',60);   // 제 이름을 대며 비는 소리
     snow(s.t,30,14,-6,p.flakes,true);finish(c,{tint:['#dfe6ec',.15]});}},
  {lines:[{text:'아비는 남은 패 가운데 하나를 풀어 품에 안았다.\n네 어미 매듭이 매인 것.',cues:[[.6,'held_string'],[2.8,'cloth_flutter']]},
          {text:'며칠이고 그걸 안고\n섬에 앉아 궁리하더구나.'}],
   draw(c,s){const p=P.snowDay;
     const tie=s.li===0?1-cl((s.lt-.5)/2.6):0,drop=s.li===1?cl(s.lt/1.6):0;
     closeBack(c,p,s.t);
     knot(c,s.t,tie,0,0,drop);
     hands(s.t,s.li===0?Math.max(tie,.01):.99,DAD,DAD2,K,s.li===0?ease(s.lt/.5):1-ease(drop));
     snow(s.t,36,12,-4,p.flakes,true);finish(c,{tint:['#dfe6ec',.15]});}},
  {lines:[{text:'어느 밤 그게 네 아비 이름을 불렀다.\n네 어미 목소리로.',cues:[[.8,'held_string'],[2.2,'held_string']]},
          {text:'나는 돌아보지 말라 했다.\n…세 번째가 왔다.',cues:[[1.4,'held_string']]},
          {text:'아비가 돌아봤다.\n그 이름이 붉은 천에 적혔다.',cues:[[.9,'chasa_write']]}],
   draw(c,s){const p=P.night;wideBack(c,p,s.t,{stars:true,moon:[60,20]});tree(c,{t:s.t,snow:true,tags:1,col:'#2a2624'});
     const cx=122,cy=74,from=[cx,cy-30],to=[160,56],WARM='rgba(236,196,120,.95)';
     chasa(c,cx,cy,1,1,1+(s.li===2&&s.lt>1.6?1:0),s.t);
     const turn=s.li===2,grey=s.li===2?cl((s.lt-1.6)/1.5)*.6:0;
     dadTiny(162,72,turn?(s.lt<.4?'stand':'raise'):'sit',grey);
     R(turn?160:161,turn?63:66,2,3,'#c9a878');   // 품의 명패
     if(s.li===0){ripple(c,from[0],from[1],to[0],to[1],s.lt-.8,WARM);ripple(c,from[0],from[1],to[0],to[1],s.lt-2.2,WARM);}
     if(s.li===1)ripple(c,from[0],from[1],to[0],to[1],s.lt-1.4,WARM);
     if(s.li===2){nameLight(c,[163,60],[cx-17,cy-6],cl((s.lt-.5)/1.2));glow(c,cx-18,cy-6,8,'224,80,58',.4*cl((s.lt-1.4)/.6)*(1-cl((s.lt-2.4)/2)));}
     snow(s.t,50,14,-4,p.flakes);finish(c,{dark:.7});}},
  {lines:[{text:'아비는 이름이 많은 보부상이었는데,\n다 그 이름 하나에 매달려 있더구나.'},
          {text:'넋이 나간 채로도 그 패는 놓지 않았다.\n그걸 안고 호숫가 쪽으로 건너갔지.',cues:[[.6,'footstep_snow'],[2,'footstep_snow']]}],
   draw(c,s){const p=P.dawn;wideBack(c,p,s.t);tree(c,{t:s.t,snow:true,tags:1,col:'#2a2624'});
     layered(c,.35,g2=>chasa(g2,122,74,1,1,3,s.t));
     const k=s.li===1?prog(s,1,6,.4):0,x=lerp(162,36,k),y=lerp(72,122,Math.pow(k,1.3)),d=lerp(1,1.7,k);
     c.save();c.translate(x,y);c.scale(d,d);c.translate(-x,-y);dadTiny(Math.round(x),Math.round(y),k>0&&k<1?'stand':'sit',.75);R(Math.round(x)+(k>0?-1:-2),Math.round(y)-(k>0?7:4),2,3,'#c9a878');c.restore();
     for(let i=1;i<10;i++){const u=k-i*.08;if(u<=0)break;const [fx,fy]=[lerp(162,36,u),lerp(72,122,Math.pow(u,1.3))];R(Math.round(fx),Math.round(fy)+1,2,1,'rgba(70,74,84,.45)');}   // 얼음 위 발자국
     snow(s.t,18,10,-4,'#e8eef2');finish(c,{dark:.35,tint:['#e6d0c8',.15]});}},
]};

/* 결정 D-1263: 옛 구성이나 재생기가 없으면 같은 자막을 두루미 대사로 읽는다 */
const asLines=def=>def.cuts.flatMap(cut=>cut.lines.map(l=>[l.who||CRANE,l.text]));
Rg.craneMemory=(part,then)=>{
  const def=part==='autumn'?SNOWFALL:SUMMER;
  if(CLASSIC||typeof Cine==='undefined'){talk(asLines(def),then,{scene:'y_sangun_story'});return;}
  Cine.play(def,then);
};
Rg.craneMemoryLines=part=>asLines(part==='autumn'?SNOWFALL:SUMMER);   // QA 대사 검사용 (읽기만 한다)
// 결정 D-1264: 수첩 두루미 쪽에서 두 편을 이어서 다시 본다
if(typeof Cine!=='undefined')Cine.addReplay('durumi',{label:'두루미가 본 것 다시 보기',when:()=>!CLASSIC&&knows('durumi:story'),
  play:()=>Cine.play(SUMMER,()=>Cine.play(SNOWFALL))});
})();
