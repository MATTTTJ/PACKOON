// 단풍골 맵 확인 페이지: 새 회화풍 아트(디퓨즈+노말맵)를 웹 게임과 같은 구조에 놓고 걸어 다니며 본다.
// 그림이 아직 없는 에셋은 이름표 붙은 빈 상자로 그린다. 그림은 img/manifest.json 에 올라오는 대로 자동으로 쓴다.
(function(){
'use strict';
const L=window.ART_STAGE1, G=L.G;
const VIEW_H=280, CAM0=G-226;                // 카메라가 보는 높이(게임 단위)와 기준 윗변 (땅이 평평할 때)
let camY=CAM0;                               // 지금 화면 윗변. 땅 높이와 주인공을 따라 위아래로 움직인다
const MOVE={speed:1.7,jump:-5.4,grav:0.32,fall:6,step:1000/60};   // tuning.csv 의 필드 조작 값
const CSV_URL='../../../assets-godot/art/stage1/assets.csv', MAN_URL='img/manifest.json';
const $=id=>document.getElementById(id);
const cv=$('gl'), ov=$('ov'), oc=ov.getContext('2d');
const gl=cv.getContext('webgl2',{alpha:false,antialias:true,premultipliedAlpha:false});
if(!gl){$('nogl').style.display='flex';return;}

// ---------- 에셋 목록과 그림 목록 ----------
const INFO={};            // id → {group,name,w,h}
let CSV_N=79, MAN={};
const GROUP_COL={배경:[0.45,0.62,0.85],공통:[0.8,0.62,0.4],채집:[0.95,0.78,0.3],파티클:[0.95,0.6,0.3],꾸밈:[0.55,0.8,0.45],인물:[0.85,0.5,0.9]};
const ZONE_COL=[0.9,0.48,0.4];
function parseCsv(text){
  text=text.replace(/^﻿/,'');const rows=[];let row=[],v='',q=false;
  for(let i=0;i<text.length;i++){const c=text[i];
    if(q){if(c==='"'&&text[i+1]==='"'){v+='"';i++;}else if(c==='"')q=false;else v+=c;}
    else if(c==='"')q=true;else if(c===','){row.push(v);v='';}
    else if(c==='\n'){row.push(v.replace(/\r$/,''));rows.push(row);row=[];v='';}else v+=c;}
  if(v||row.length){row.push(v);rows.push(row);}
  return rows.filter(r=>r.some(Boolean));
}
function sizeOf(s){
  let m=/(\d+)\s*×\s*(\d+)/.exec(s);if(m)return[+m[1],+m[2]];
  m=/높이\s*(\d+)/.exec(s);if(m)return[400,+m[1]];
  return[40,40];
}
async function loadMeta(){
  try{
    const t=await (await fetch(CSV_URL,{cache:'no-store'})).text();
    const rows=parseCsv(t),h=rows[0],ix=k=>h.findIndex(x=>x.startsWith(k));
    const iId=ix('id'),iG=ix('묶음'),iN=ix('이름'),iS=ix('게임크기');
    for(const r of rows.slice(1)){const [w,hh]=sizeOf(r[iS]||'');INFO[r[iId]]={group:r[iG],name:r[iN],w,h:hh};}
    CSV_N=rows.length-1;
  }catch(e){console.warn('에셋 목록을 못 읽었다',e);}
  try{MAN=await (await fetch(MAN_URL,{cache:'no-store'})).json();}catch(e){MAN={};}
}
const nameOf=id=>INFO[id]?.name||id;
function colOf(id){const g=INFO[id]?.group;return GROUP_COL[g]||(g?ZONE_COL:[0.7,0.7,0.7]);}

// ---------- WebGL ----------
const VS=`#version 300 es
precision highp float;
in vec2 aP;
in vec3 aUV;
uniform vec4 uRect,uUV,uView;
uniform float uStrip;
out vec2 vUV,vW,vL;
void main(){bool st=uStrip>0.5;vec2 w=st?aP:uRect.xy+aP*uRect.zw;vW=w;vL=st?aUV.yz:aP;vUV=st?aUV.xy:mix(uUV.xy,uUV.zw,aP);
  vec2 c=(w-uView.xy)/uView.zw;gl_Position=vec4(c.x*2.-1.,1.-c.y*2.,0.,1.);}`;
const FS=`#version 300 es
precision highp float;
in vec2 vUV,vW,vL;
uniform vec4 uRect,uView;
uniform sampler2D uD,uN;
uniform int uMode,uNL;
uniform vec4 uTint,uFog,uC2;
uniform float uHasN,uFlip,uLit,uStrip;
uniform vec2 uDeep;
uniform vec3 uAmb,uSunL,uSunC;
uniform vec4 uLP[16];
uniform vec3 uLC[16];
out vec4 o;
vec3 shade(vec3 n,vec2 w){
  vec3 c=uAmb;float d=dot(n,normalize(uSunL));c+=uSunC*max(d*0.8+0.2,0.);
  for(int i=0;i<16;i++){if(i>=uNL)break;vec3 v=vec3(uLP[i].xy-w,uLP[i].w);
    float a=clamp(1.-length(v.xy)/uLP[i].z,0.,1.);a*=a;c+=uLC[i]*a*max(dot(n,normalize(v))*0.7+0.3,0.);}
  return c;}
void main(){
  if(uMode==2){                      // 빈 자리 상자
    vec2 s=uRect.zw,p=vL*s,q=abs(p-s*.5)-s*.5+min(4.,min(s.x,s.y)*.2);
    float r=min(4.,min(s.x,s.y)*.2),dd=length(max(q,0.))+min(max(q.x,q.y),0.)-r;
    if(dd>0.)discard;float edge=step(-0.9,dd);
    o=vec4(uTint.rgb,mix(0.26,0.85,edge)*uTint.a);return;}
  if(uMode==4){o=vec4(mix(uTint.rgb,uC2.rgb,vL.y),1.);return;}    // 하늘 자리 그라데이션
  vec4 d=uMode==3?uTint:texture(uD,vUV);
  if(d.a<0.01)discard;
  vec3 col=d.rgb;
  if(uLit>0.5){vec3 n=vec3(0.,0.,1.);
    if(uHasN>0.5){n=texture(uN,vUV).rgb*2.-1.;n.y=-n.y;n.x*=uFlip;n=normalize(n);}
    col*=shade(n,vW);}
  if(uMode!=3)col*=uTint.rgb;
  if(uStrip>0.5){float k=smoothstep(uDeep.x,uDeep.x+uDeep.y,vL.y);col*=mix(1.,0.16,k);}   // 땅속으로 갈수록 짙게 (오리처럼 깊이)
  col=mix(col,uFog.rgb,uFog.a);
  o=vec4(col,d.a*(uMode==3?1.:uTint.a));}`;
function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
const prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FS));
gl.bindAttribLocation(prog,0,'aP');gl.bindAttribLocation(prog,1,'aUV');gl.linkProgram(prog);
if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog));
gl.useProgram(prog);
const U={};for(const k of['uRect','uUV','uView','uD','uN','uMode','uNL','uTint','uFog','uC2','uHasN','uFlip','uLit','uAmb','uSunL','uSunC','uLP','uLC','uStrip','uDeep'])U[k]=gl.getUniformLocation(prog,k);
const vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),gl.STATIC_DRAW);
// 휘는 띠용 버퍼: 꼭짓점마다 x, y, u, v, 깊이. 매 프레임 같은 배열을 다시 채운다
const SB_MAX=900, sdata=new Float32Array(SB_MAX*5), sbo=gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,sbo);gl.bufferData(gl.ARRAY_BUFFER,sdata.byteLength,gl.DYNAMIC_DRAW);
let geo='';
function useQuad(){if(geo==='q')return;geo='q';gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.disableVertexAttribArray(1);gl.uniform1f(U.uStrip,0);}
function useStrip(){if(geo==='s')return;geo='s';gl.bindBuffer(gl.ARRAY_BUFFER,sbo);gl.vertexAttribPointer(0,2,gl.FLOAT,false,20,0);
  gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,20,8);gl.uniform1f(U.uStrip,1);}
gl.enableVertexAttribArray(0);gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
gl.uniform1i(U.uD,0);gl.uniform1i(U.uN,1);
gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
const blank=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,blank);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([128,128,255,255]));

// 그림 읽기: 구역에 들어갈 때 그 구역에 쓰는 것만 읽는다
const TEX=new Map();
function fileKey(id,v){
  const m=MAN[id];if(!m)return null;
  const st=m.states||[];
  if(v&&st.includes(v))return id+'@'+v;
  if(st.length&&!m.base)return id+'@'+st[0];
  return id;
}
function loadImg(src){return new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=src;});}
function upload(im,repeat){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,repeat?gl.REPEAT:gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
function want(id,v){
  const key=fileKey(id,v);if(!key||TEX.has(key))return;
  const rep=MAN[id].kind==='layer';
  const e={ok:false,d:null,n:null,w:0,h:0};TEX.set(key,e);
  const ver=MAN[id].v?('?v='+MAN[id].v):'';
  loadImg('img/'+key+'.d.webp'+ver).then(im=>{e.d=upload(im,rep);e.w=im.width;e.h=im.height;e.ok=true;
    if(MAN[id].normal!==false)loadImg('img/'+key+'.n.webp'+ver).then(n=>{e.n=upload(n,rep);}).catch(()=>{});
  }).catch(()=>{e.fail=true;});
}
function texOf(id,v){const k=fileKey(id,v);if(!k)return null;const e=TEX.get(k);return e&&e.ok?e:null;}

// ---------- 조명 ----------
const PRESETS={
  day:{name:'낮',amb:[0.56,0.53,0.5],sun:[-0.45,-0.6,0.65],sunC:[0.78,0.7,0.58],pt:0.45,fog:[0.86,0.78,0.68],sky:[1,1,1],skyA:[0.98,0.84,0.66],skyB:[0.62,0.74,0.86]},
  dusk:{name:'노을',amb:[0.36,0.31,0.42],sun:[-0.88,-0.18,0.45],sunC:[1.05,0.62,0.34],pt:0.85,fog:[0.78,0.56,0.55],sky:[1,0.92,0.9],skyA:[0.96,0.66,0.48],skyB:[0.42,0.38,0.58]},
  night:{name:'밤',amb:[0.13,0.16,0.27],sun:[0.3,-0.7,0.6],sunC:[0.36,0.46,0.75],pt:1.25,fog:[0.1,0.13,0.22],sky:[0.25,0.3,0.5],skyA:[0.12,0.14,0.26],skyB:[0.03,0.04,0.1]},
};
const LP=new Float32Array(64),LC=new Float32Array(48);

// ---------- 상태 ----------
const S={zone:'village',preset:null,overlay:false,labels:true,states:{}};
for(const k in L.STATES)S.states[k]=L.STATES[k].opts[0][0];
const hero={x:70,y:G,vy:0,on:true,face:1,walk:0,drop:0,dropPlat:null};
let Z=L.ZONES.village, deco=[], camX=0, viewW=500, scale=1, dpr=1;
const keys=Object.create(null), touch={l:false,r:false,j:false,u:false};
let jumpHeld=false,useHeld=false;

// 땅 높이: 구역의 ground 꺾은선 (없으면 웹 게임처럼 평평한 192)
function gy(x){const g=Z.ground;if(!g||!g.length)return G;
  if(x<=g[0][0])return g[0][1];
  for(let i=1;i<g.length;i++)if(x<=g[i][0]){const a=g[i-1],b=g[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}
  return g[g.length-1][1];}
const yOn=o=>o.y!=null?o.y:gy(o.x)+(o.dy||0);   // 물건 바닥: y 가 없으면 땅 위 (dy 만큼 아래)
const vpar=p=>(camY-CAM0)*(1-p);                 // 세로 시차: 먼 겹은 카메라가 오르내려도 덜 움직인다

// 길섶 덤불과 돌: 웹 게임처럼 170마다 (늪은 갈대)
function hash(n){n=Math.sin(n*127.1+311.7)*43758.5453;return n-Math.floor(n);}
function makeDeco(z,zid){const out=[],seed=zid.length*17;
  for(let u=0;u<z.w;u+=170){
    if(zid==='marsh')out.push({id:'cm_reeds',x:u+70,v:hash(u+seed)>0.5?'a':'b'});
    else out.push({id:'cm_shrub',x:u+31,v:'abc'[Math.floor(hash(u+seed)*3)]});
    if(hash(u*1.7+seed)>0.45)out.push({id:'cm_stone',x:u+81,v:'abc'[Math.floor(hash(u+3+seed)*3)]});}
  return out;}

function zoneIds(z){const ids=[];
  ids.push([L.SKY[z.sky]],['bg_far_ridge',z.sky],['bg_mid_ridge',z.sky],[z.woods],[z.groundArt],['bg_fg_foliage'],['ch_hero']);
  for(const b of z.bands||[])ids.push([b.id]);
  for(const o of z.objects)ids.push([o.id,o.v||(o.st?S.states[o.st]:null)]);
  for(const n of z.npcs||[])ids.push([n.id,n.v||(n.st?S.states[n.st]:null)]);
  for(const p of z.pickups||[])ids.push([p.item]);
  if((z.digs||[]).length)ids.push(['gt_dig']);
  for(const d of deco)ids.push([d.id,d.v]);
  for(const p of z.platforms)for(const k of PF_STATES)ids.push(['pf_'+p.kind,k]);
  return ids;}
function preload(){for(const [id,v] of zoneIds(Z))want(id,v);}

function enterZone(zid,x){
  Z=L.ZONES[zid];S.zone=zid;deco=makeDeco(Z,zid);
  hero.x=x??Z.startX;hero.y=gy(hero.x);hero.vy=0;hero.on=true;hero.drop=0;camY=camTarget();
  preload();
  $('zoneName').textContent='단풍골 · '+Z.name;
  for(const b of document.querySelectorAll('#zones button'))b.classList.toggle('on',b.dataset.z===zid);
  if(!S.presetLocked)setPreset(Z.sky==='dusk'?'dusk':'day',false);
  history.replaceState(null,'','#'+zid);
}

// ---------- 그리기 ----------
const tint=[1,1,1,1], noFog=[0,0,0,0];
function setCommon(mode,lit,hasN,flip,t,fog){
  gl.uniform1i(U.uMode,mode);gl.uniform1f(U.uLit,lit);gl.uniform1f(U.uHasN,hasN);gl.uniform1f(U.uFlip,flip);
  gl.uniform4f(U.uTint,t[0],t[1],t[2],t[3]);gl.uniform4f(U.uFog,fog[0],fog[1],fog[2],fog[3]);}
function rect(x,y,w,h,u0,v0,u1,v1){gl.uniform4f(U.uRect,x,y,w,h);gl.uniform4f(U.uUV,u0,v0,u1,v1);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
function bindTex(e){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,e.d);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,e.n||blank);}

// 이름표는 그리기 끝에 겹 캔버스에 쓴다 (매 프레임 새 객체를 만들지 않게 미리 만든 칸을 돌려쓴다)
const LBL=[];for(let i=0;i<400;i++)LBL.push({x:0,y:0,t:'',c:''});let nLbl=0;
function label(x,y,t,c){if(nLbl>=LBL.length)return;const l=LBL[nLbl++];l.x=x;l.y=y;l.t=t;l.c=c;}
const px=(x,p)=>(x-camX*p)*scale, py=y=>(y-camY)*scale;
const cssCol=c=>'rgb('+(c[0]*255|0)+','+(c[1]*255|0)+','+(c[2]*255|0)+')';

// 소품 하나: x는 가운데, y는 바닥. p는 시차(1이 땅과 같이 움직임)
function drawProp(id,v,x,y,s,p,flip,dark,fogAmt){
  const e=texOf(id,v),m=MAN[id];
  let w,h,ax=0.5,ay=1;
  if(m&&m.units){w=m.units[0];h=m.units[1];if(m.anchor){ax=m.anchor[0];ay=m.anchor[1];}}
  else{const i=INFO[id]||{w:30,h:30};w=i.w;h=i.h;}
  if(e){if(m&&m.sh&&v&&m.sh[v])h=m.sh[v];w=h*e.w/e.h;}   // 그림이 있으면 갈래마다 제 비율로 (높이는 갈래별 sh 가 있으면 그것)
  w*=s;h*=s;
  const wx=x+camX*(1-p)-w*ax, wy=y-h*ay+vpar(p);
  if(wx>camX+viewW||wx+w<camX)return;
  const f=PRESETS[S.preset].fog,fa=fogAmt||0;
  if(e){bindTex(e);const d=dark||1;
    setCommon(0,1,e.n?1:0,flip,[d,d,d,1],[f[0],f[1],f[2],fa]);
    if(flip<0)rect(wx,wy,w,h,1,0,0,1);else rect(wx,wy,w,h,0,0,1,1);}
  else{const c=colOf(id);setCommon(2,0,0,1,[c[0],c[1],c[2],dark?0.7:1],noFog);rect(wx,wy,w,h,0,0,1,1);
    if(S.labels)label(px(wx+w/2,1),py(wy)+12,nameOf(id)+(v?' '+v:''),cssCol(c));}
}
// 가로로 이어지는 겹 (하늘 제외). 그림이 있으면 타일로 잇고, 없으면 띠 상자
function drawLayer(id,cfg,x0,x1){
  const m=MAN[id],baked=!!(m&&m.baked),e=texOf(id,baked?Z.sky:null),p=cfg.p??1;   // baked: 빛까지 칠한 먼 겹. 구역 하늘(낮·노을) 판을 고르고 조명을 다시 입히지 않는다
  const y=((m&&m.y!=null)?m.y:cfg.y)+vpar(p), h=(m&&m.units)?m.units[1]:cfg.h;
  const f=PRESETS[S.preset].fog,fa=cfg.fog||0;
  const L0=camX, L1=camX+viewW;
  const lo=x0<0?L0:Math.max(L0,x0+camX*(1-p)), hi=x1<0?L1:Math.min(L1,x1+camX*(1-p));
  if(hi<=lo)return;
  if(e){const P=PRESETS[S.preset];bindTex(e);
    if(baked)setCommon(0,0,0,1,[P.sky[0],P.sky[1],P.sky[2],1],[f[0],f[1],f[2],fa*0.4]);else setCommon(0,1,e.n?1:0,1,tint,[f[0],f[1],f[2],fa]);
    const tw=(m&&m.units)?m.units[0]:h*e.w/e.h;
    const off=((camX*p)%tw+tw)%tw;let sx=camX-off;
    for(;sx<hi;sx+=tw){const a=Math.max(sx,lo),b=Math.min(sx+tw,hi);if(b<=a)continue;
      rect(a,y,b-a,h,(a-sx)/tw,0,(b-sx)/tw,1);}
  }else{const c=colOf(id);setCommon(2,0,0,1,[c[0]*0.8,c[1]*0.8,c[2]*0.8,0.32],noFog);rect(lo,y,hi-lo,h,0,0,1,1);
    if(S.labels)label(px(lo,1)+70,py(y)+14,nameOf(id),cssCol(c));}
}
function drawSky(){
  const id=L.SKY[Z.sky],e=texOf(id,null),P=PRESETS[S.preset];
  if(e){bindTex(e);setCommon(1,0,0,1,[P.sky[0],P.sky[1],P.sky[2],1],noFog);
    // 화면을 덮도록 가운데 맞춰 자른다
    const ar=e.w/e.h, vr=viewW/VIEW_H;let u0=0,u1=1,v0=0,v1=1;
    if(ar>vr){const k=vr/ar;u0=(1-k)/2;u1=u0+k;}else{const k=ar/vr;v0=(1-k)/2;v1=v0+k;}
    gl.uniform1i(U.uMode,1);rect(camX,camY,viewW,VIEW_H,u0,v0,u1,v1);}
  else{setCommon(4,0,0,1,[P.skyA[0],P.skyA[1],P.skyA[2],1],noFog);gl.uniform4f(U.uC2,P.skyB[0],P.skyB[1],P.skyB[2],1);
    rect(camX,camY,viewW,VIEW_H,0,0,1,1);if(S.labels)label(cv.clientWidth-70,22,nameOf(id),'#bcd');}
}
// 발판: 땅에서 솟은 지형(바위 턱, 흙 둔덕, 고목 그루터기, 말뚝 위 판, 늪 디딤돌). 윗면이 p.y, 몸통은 땅 띠 밑으로 묻힌다.
// 낮은·중간·높은 그림 가운데 땅까지 닿는 가장 낮은 것을 고르고, 모자라면 세로로 조금 늘이고 그래도 모자라면 넓힌다.
const PF_STATES=['low','mid','high'], PF_COL={rock:[0.5,0.48,0.44],mound:[0.42,0.47,0.27],stump:[0.45,0.32,0.2],scaffold:[0.55,0.4,0.24],marsh_stone:[0.36,0.42,0.38]};
function drawPlatform(p){
  if(p.x>camX+viewW+20||p.x+p.w<camX-20)return;
  const id='pf_'+p.kind,m=MAN[id],need=gy(p.x+p.w/2)-p.y+10;   // 윗면에서 땅 밑 10단위까지
  // 윗면은 살짝 위에서 본 납작한 타원이라, 걷는 선은 그림 윗변에서 폭의 surfW 만큼 아래다
  let e=null,w=p.w*1.16,h=0;const sw=(m&&m.surfW)||0.07;
  for(const k of PF_STATES){const t=texOf(id,k);if(!t)continue;e=t;h=w*t.h/t.w;if(h-w*sw>=need)break;}
  if(e){let hh=h,off=w*sw,body=hh-off;
    if(body<need){const r=Math.min(1.35,need/body);hh*=r;off*=r;body*=r;
      if(body<need){const k=need/body;w*=k;hh*=k;off*=k;}}
    bindTex(e);setCommon(0,1,e.n?1:0,1,tint,noFog);rect(p.x+p.w/2-w/2,p.y-off,w,hh,0,0,1,1);}
  else{const c=PF_COL[p.kind]||[0.5,0.4,0.3];setCommon(3,1,0,1,[c[0],c[1],c[2],1],noFog);rect(p.x-2,p.y,p.w+4,need,0,0,1,1);
    setCommon(3,1,0,1,[c[0]*1.3,c[1]*1.3,c[2]*1.2,1],noFog);rect(p.x-3,p.y-1.5,p.w+6,3,0,0,1,1);
    if(S.labels)label(px(p.x+p.w/2,1),py(p.y)+14,nameOf(id),cssCol(c));}
}
// 땅 띠: 꺾은선을 따라 휘어 깐다. 그림 윗변은 걷는 선보다 lip 만큼 위, 그림 밑은 땅속으로 더 이어 화면 끝까지 짙게 채운다
function stripPush(n,x,y,u,v,d){const i=n*5;sdata[i]=x;sdata[i+1]=y;sdata[i+2]=u;sdata[i+3]=v;sdata[i+4]=d;return n+1;}
function drawGround(){
  const id=Z.groundArt,cfg=L.LAYERS[id]||{},m=MAN[id],e=texOf(id,null);
  const lip=cfg.lip??4, h=(m&&m.units)?m.units[1]:(cfg.h||60), tw=(m&&m.units)?m.units[0]:400;
  const bottom=camY+VIEW_H+4, x0=camX-8, x1=camX+viewW+8, stepX=6;
  const P=PRESETS[S.preset];
  if(e)bindTex(e);
  useStrip();gl.uniform2f(U.uDeep,cfg.deep?cfg.deep[0]:12,cfg.deep?cfg.deep[1]:48);
  // 1) 그림이 있는 띠
  let n=0;
  for(let x=x0;x<=x1+stepX&&n<SB_MAX-2;x+=stepX){const g=gy(x),u=x/tw;
    n=stripPush(n,x,g-lip,u,0,-lip);n=stripPush(n,x,g-lip+h,u,1,h-lip);}
  if(e)setCommon(0,1,e.n?1:0,1,tint,noFog);else setCommon(3,1,0,1,[0.36,0.27,0.18,1],noFog);
  gl.bufferSubData(gl.ARRAY_BUFFER,0,sdata,0,n*5);gl.drawArrays(gl.TRIANGLE_STRIP,0,n);
  // 2) 그 아래 화면 끝까지: 그림 맨 아랫줄을 늘여 짙게
  n=0;
  for(let x=x0;x<=x1+stepX&&n<SB_MAX-2;x+=stepX){const g=gy(x),u=x/tw,yb=g-lip+h;
    n=stripPush(n,x,yb-0.5,u,0.995,h-lip);n=stripPush(n,x,Math.max(bottom,yb+1),u,0.999,h-lip+60);}
  gl.bufferSubData(gl.ARRAY_BUFFER,0,sdata,0,n*5);gl.drawArrays(gl.TRIANGLE_STRIP,0,n);
  useQuad();
  if(!e&&S.labels)label(px(camX+60,1),py(gy(camX+60))+18,nameOf(id),'#e9c');
}
// 앞 수풀: 화면 맨 아래, 주인공 앞. 어둡고 흐리게 (세 번 살짝 어긋나게 겹쳐 흐림을 흉내 낸다)
function drawFg(){
  const id='bg_fg_foliage',cfg=L.LAYERS[id]||{},m=MAN[id],e=texOf(id,null);if(!e)return;
  const p=cfg.p??1.15,h=(m&&m.units)?m.units[1]:50,tw=(m&&m.units)?m.units[0]:h*e.w/e.h;
  const y=camY+VIEW_H-(cfg.show??42), d=cfg.dark??0.3, P=PRESETS[S.preset];
  bindTex(e);
  const shift=camX*(p-1);
  for(const [ox,a] of [[-1.3,0.45],[1.3,0.45],[0,0.7]]){
    setCommon(0,1,e.n?1:0,1,[d,d,d,a],[P.fog[0]*0.2,P.fog[1]*0.2,P.fog[2]*0.25,0.25]);
    const off=(((camX+shift)%tw)+tw)%tw;
    for(let sx=camX-off+ox;sx<camX+viewW;sx+=tw)rect(sx,y,tw,h,0,0,1,1);}
}
const visible=o=>!o.when||S.states[o.when[0]]===o.when[1];
function drawObjects(layer){
  for(const o of Z.objects){if((o.layer||'mid')!==layer||!visible(o))continue;
    const v=o.st?S.states[o.st]:o.v;
    if(o.id==='fr_vine_curtain'&&v==='gone'&&!texOf(o.id,v))continue;
    drawProp(o.id,v,o.x,yOn(o),o.s||1,o.p??1,1,o.dark||0,layer==='far'?0.35:0);}
}
function drawHero(){
  const bob=hero.on&&Math.abs(hero.vxShow)>0.1?Math.abs(Math.sin(hero.walk*0.35))*1.4:0;
  const sq=hero.on?1:1.03;
  const e=texOf('ch_hero',null),m=MAN.ch_hero,i=INFO.ch_hero||{w:24,h:38};
  let w=(m&&m.units)?m.units[0]:i.w,h=((m&&m.units)?m.units[1]:i.h)*sq;
  const x=hero.x-w/2,y=hero.y-h-bob;
  if(e){bindTex(e);setCommon(0,1,e.n?1:0,hero.face,tint,noFog);
    if(hero.face<0)rect(x,y,w,h,1,0,0,1);else rect(x,y,w,h,0,0,1,1);}
  else{setCommon(2,0,0,1,[1,0.85,0.5,1],noFog);rect(x,y,w,h,0,0,1,1);
    label(px(hero.x,1),py(y)-4,'주인공 '+(hero.face>0?'▶':'◀'),'#ffd98a');}
}

// 낙엽: 미리 만든 칸을 돌려쓴다
const LEAF=[];for(let i=0;i<46;i++)LEAF.push({x:0,y:0,vx:0,vy:0,a:0,c:0,on:false});
const LEAF_C=[[0.8,0.41,0.22],[0.87,0.6,0.24],[0.73,0.54,0.27]];
let leafT=0;
function stepLeaves(){
  if(Z.sky!=='day'&&S.zone!=='hill'&&S.zone!=='marsh')return;
  if(++leafT%12===0){const l=LEAF.find(q=>!q.on);if(l){l.on=true;l.x=camX+Math.random()*viewW*1.1;l.y=camY+10;l.vx=-0.15-Math.random()*0.2;l.vy=0.45+Math.random()*0.25;l.a=Math.random()*6;l.c=(Math.random()*3)|0;}}
  for(const l of LEAF)if(l.on){l.a+=0.05;l.x+=l.vx+Math.sin(l.a)*0.3;l.y+=l.vy;if(l.y>gy(l.x)+2||l.x<camX-20)l.on=false;}
}
function drawLeaves(){for(const l of LEAF)if(l.on){const c=LEAF_C[l.c];setCommon(3,1,0,1,[c[0],c[1],c[2],1],noFog);rect(l.x,l.y,2.2,1.6+Math.abs(Math.sin(l.a))*0.8,0,0,1,1);}}

function setLights(){
  const P=PRESETS[S.preset];
  gl.uniform3f(U.uAmb,P.amb[0],P.amb[1],P.amb[2]);gl.uniform3f(U.uSunL,P.sun[0],P.sun[1],P.sun[2]);gl.uniform3f(U.uSunC,P.sunC[0],P.sunC[1],P.sunC[2]);
  let n=0;for(const l of Z.lights||[]){if(n>=16)break;if(l.when&&S.states[l.when[0]]!==l.when[1])continue;
    LP[n*4]=l.x;LP[n*4+1]=l.y+gy(l.x)-G;LP[n*4+2]=l.r;LP[n*4+3]=14;
    const k=l.i*P.pt;LC[n*3]=l.c[0]*k;LC[n*3+1]=l.c[1]*k;LC[n*3+2]=l.c[2]*k;n++;}
  gl.uniform1i(U.uNL,n);gl.uniform4fv(U.uLP,LP);gl.uniform3fv(U.uLC,LC);
}

// 웹 게임 구조 겹쳐 보기 (웹 게임 좌표 그대로)
function drawOverlay(){
  const c=oc;c.save();c.lineWidth=1.5;c.font='12px sans-serif';c.textAlign='center';
  c.strokeStyle='#5ff';c.setLineDash([6,4]);c.beginPath();c.moveTo(0,py(G));c.lineTo(ov.clientWidth,py(G));c.stroke();c.setLineDash([]);
  c.fillStyle='#5ff';c.fillText('땅 y=192',60,py(G)-4);
  c.strokeStyle='#4ff';c.fillStyle='rgba(80,255,255,.12)';
  for(const p of (Z.web&&Z.web.platforms)||[]){const x=px(p.x,1),w=p.w*scale;c.fillRect(x,py(p.y),w,5*scale);c.strokeRect(x,py(p.y),w,5*scale);}
  c.strokeStyle='#ffd34d';c.setLineDash([2,3]);c.beginPath();
  for(let x=Math.floor(camX);x<=camX+viewW;x+=8){const X=px(x,1),Y=py(gy(x));x===Math.floor(camX)?c.moveTo(X,Y):c.lineTo(X,Y);}
  c.stroke();c.setLineDash([]);
  const mark=(x,y,txt,col,shape)=>{const X=px(x,1),Y=py(y);c.fillStyle=col;c.strokeStyle=col;
    if(shape==='dot'){c.beginPath();c.arc(X,Y-3,3.5,0,7);c.fill();}
    else if(shape==='tri'){c.beginPath();c.moveTo(X-5,Y);c.lineTo(X+5,Y);c.lineTo(X,Y-8);c.fill();}
    else{c.beginPath();c.moveTo(X,Y);c.lineTo(X,Y-34);c.stroke();c.beginPath();c.arc(X,Y-38,4,0,7);c.fill();}
    if(txt){c.fillStyle='#000a';const w=c.measureText(txt).width+8;c.fillRect(X-w/2,Y-60,w,16);c.fillStyle=col;c.fillText(txt,X,Y-48);}};
  for(const n of Z.npcs||[])mark(n.x,G,n.name,'#ffd34d');
  for(const p of Z.pickups||[])mark(p.x,p.y??G,'','#ffa040','dot');
  for(const d of Z.digs||[])mark(d.x,G,'','#c08050','tri');
  for(const m of Z.marks||[])mark(m.x,m.y??G,m.label,m.type==='stamp'?'#d58cff':m.type==='vista'?'#7fb8ff':'#9fe08a');
  for(const d of Z.doors||[])mark(d.x,G,'문: '+d.label,'#ff7a7a');
  for(const cl of Z.climbs||[]){c.strokeStyle='#9f9';c.setLineDash([3,3]);c.beginPath();c.moveTo(px(cl.x,1),py(G));c.lineTo(px(cl.x,1),py(cl.top));c.stroke();c.setLineDash([]);
    c.fillStyle='#9f9';c.fillText(cl.label,px(cl.x,1),py(cl.top)-6);}
  c.fillStyle='#ff7a7a';c.font='bold 13px sans-serif';
  if(Z.exits.left&&camX<4){c.textAlign='left';c.fillText('◀ '+L.ZONES[Z.exits.left.to].name,8,py(G)-60);}
  if(Z.exits.right&&camX+viewW>Z.w-4){c.textAlign='right';c.fillText(L.ZONES[Z.exits.right.to].name+' ▶',px(Z.w,1)-8,py(G)-60);}
  c.restore();
}

function render(){
  const cw=cv.clientWidth,ch=cv.clientHeight;dpr=Math.min(window.devicePixelRatio||1,2.5);
  if(cv.width!==Math.round(cw*dpr)||cv.height!==Math.round(ch*dpr)){cv.width=Math.round(cw*dpr);cv.height=Math.round(ch*dpr);ov.width=cv.width;ov.height=cv.height;}
  viewW=VIEW_H*cw/ch;scale=ch/VIEW_H;
  camX=Z.w<=viewW?(Z.w-viewW)/2:Math.max(0,Math.min(Z.w-viewW,hero.x-viewW*0.42));
  camY+=(camTarget()-camY)*0.08;
  gl.viewport(0,0,cv.width,cv.height);gl.clearColor(0.05,0.05,0.07,1);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform4f(U.uView,camX,camY,viewW,VIEW_H);nLbl=0;setLights();
  drawSky();
  for(const id of['bg_far_ridge','bg_mid_ridge'])drawLayer(id,L.LAYERS[id],-1,-1);
  drawObjects('far');
  drawLayer(Z.woods,L.LAYERS[Z.woods],-1,-1);
  for(const b of Z.bands||[])if(b.behind)drawLayer(b.id,{y:b.y,h:b.h,p:b.p??1,fog:0},b.x0,b.x1);
  drawObjects('back');
  for(const p of Z.platforms)drawPlatform(p);
  drawGround();
  for(const b of Z.bands||[])if(!b.behind)drawLayer(b.id,{y:b.y,h:b.h,p:b.p??1,fog:0},b.x0,b.x1);
  for(const d of deco)drawProp(d.id,d.v,d.x,gy(d.x)+1,1,1,1,0,0);
  drawObjects('mid');
  for(const p of Z.pickups||[])drawProp(p.item,null,p.x,yOn(p),1,1,1,0,0);
  for(const d of Z.digs||[])drawProp('gt_dig',null,d.x,gy(d.x)+1,1,1,1,0,0);
  for(const n of Z.npcs||[])drawProp(n.id,n.v||(n.st?S.states[n.st]:null),n.x,yOn(n),n.s||1,1,hero.x<n.x?-1:1,0,0);
  drawHero();
  drawObjects('front');
  drawFg();
  drawLeaves();
  // 겹 캔버스
  oc.setTransform(dpr,0,0,dpr,0,0);oc.clearRect(0,0,cw,ch);
  if(S.overlay)drawOverlay();
  if(nLbl){oc.font='11px sans-serif';oc.textAlign='center';
    for(let i=0;i<nLbl;i++){const l=LBL[i];const w=oc.measureText(l.t).width+6;oc.fillStyle='#000a';oc.fillRect(l.x-w/2,l.y-11,w,14);oc.fillStyle=l.c;oc.fillText(l.t,l.x,l.y);}}
}

// 세로 카메라: 주인공 발밑 땅이 화면 아래 5분의 1쯤에 오게. 높은 발판에 오르면 그만큼 따라 오른다
function camTarget(){const g=gy(hero.x);return Math.min(g-226,hero.y-200);}

// ---------- 움직임 ----------
const down=k=>!!keys[k];
function nearDoor(){for(const d of Z.doors||[])if(Math.abs(hero.x-d.x)<18)return d;return null;}
function useDoor(d){
  if(d.block&&S.states[d.block]!=='gone'){toast('칡덩굴이 금줄 길을 막았다.\n메뉴의 칡덩굴 단추로 걷을 수 있다.');return;}
  enterZone(d.to,d.toX);toast(L.ZONES[d.to].name);
}
function step(){
  const left=down('ArrowLeft')||down('KeyA')||touch.l, right=down('ArrowRight')||down('KeyD')||touch.r;
  const jump=down('Space')||down('ArrowUp')||down('KeyW')||touch.j, use=down('KeyE')||down('ArrowDown')||down('KeyS')||touch.u;
  const vx=(right?1:0)-(left?1:0);hero.vxShow=vx;
  if(vx){hero.face=vx;hero.walk++;}
  hero.x+=vx*MOVE.speed;
  if(jump&&!jumpHeld&&hero.on){hero.vy=MOVE.jump;hero.on=false;}
  jumpHeld=jump;
  if(use&&!useHeld){const d=nearDoor();if(d)useDoor(d);
    else if(hero.on&&hero.y<gy(hero.x)-0.5){hero.drop=12;hero.on=false;hero.y+=1;}}
  useHeld=use;
  const wasOn=hero.on, py0=hero.y;hero.vy=Math.min(hero.vy+MOVE.grav,MOVE.fall);hero.y+=hero.vy;hero.on=false;
  if(hero.drop>0)hero.drop--;
  if(hero.vy>=0&&hero.drop<=0)for(const p of Z.platforms){
    if(hero.x>=p.x-2&&hero.x<=p.x+p.w+2&&py0<=p.y+0.01&&hero.y>=p.y){hero.y=p.y;hero.vy=0;hero.on=true;break;}}
  const g=gy(hero.x);
  if(hero.y>=g||(wasOn&&hero.vy>=0&&!hero.on&&hero.drop<=0&&py0>=g-6&&hero.y>=g-6)){hero.y=g;hero.vy=0;hero.on=true;}
  // 구역 끝: 출구가 있으면 다음 구역으로
  if(hero.x<0){if(Z.exits.left){const e=Z.exits.left;enterZone(e.to,e.toX);toast(L.ZONES[e.to].name);return;}hero.x=0;}
  if(hero.x>Z.w){if(Z.exits.right){const e=Z.exits.right;enterZone(e.to,e.toX);toast(L.ZONES[e.to].name);return;}hero.x=Z.w;}
  stepLeaves();
}
let toastT=0;
function toast(t){const el=$('toast');el.textContent=t;el.style.whiteSpace='pre-line';el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),1800);}

// ---------- 메뉴 ----------
function setPreset(k,lock){S.preset=k;if(lock)S.presetLocked=true;for(const b of document.querySelectorAll('#presets button'))b.classList.toggle('on',b.dataset.p===k);}
function buildHud(){
  const zs=$('zones');for(const zid of L.order){const b=document.createElement('button');b.textContent=L.ZONES[zid].name;b.dataset.z=zid;b.onclick=()=>{enterZone(zid);};zs.appendChild(b);}
  const ps=$('presets');for(const k in PRESETS){const b=document.createElement('button');b.textContent=PRESETS[k].name;b.dataset.p=k;b.onclick=()=>setPreset(k,true);ps.appendChild(b);}
  const auto=document.createElement('button');auto.textContent='구역 따라';auto.onclick=()=>{S.presetLocked=false;setPreset(Z.sky==='dusk'?'dusk':'day',false);};ps.appendChild(auto);
  const st=$('states');
  for(const k in L.STATES){const g=L.STATES[k],span=document.createElement('span');span.className='row';span.style.margin='0 8px 0 0';
    span.innerHTML='<span class="lab">'+g.label+'</span>';
    for(const [id,txt] of g.opts){const b=document.createElement('button');b.textContent=txt;b.dataset.k=k;b.dataset.v=id;
      b.onclick=()=>{S.states[k]=id;for(const x of span.querySelectorAll('button'))x.classList.toggle('on',x.dataset.v===id);preload();};
      if(S.states[k]===id)b.classList.add('on');span.appendChild(b);}
    st.appendChild(span);}
  const tog=(id,key)=>{const b=$(id);b.classList.toggle('on',S[key]);b.onclick=()=>{S[key]=!S[key];b.classList.toggle('on',S[key]);};};
  tog('tOverlay','overlay');tog('tLabels','labels');
  $('fold').onclick=()=>{const h=$('hud');h.classList.toggle('closed');$('fold').textContent=h.classList.contains('closed')?'메뉴 펼치기':'메뉴 접기';};
  const real=Object.keys(INFO).filter(id=>MAN[id]).length;$('count').textContent='에셋 '+real+'/'+CSV_N;
  // 휴대폰 단추
  const coarse=matchMedia('(pointer:coarse)').matches||/[?&]touch=1/.test(location.search);
  if(coarse)$('touch').classList.add('show');
  for(const [id,k] of [['tL','l'],['tR','r'],['tJ','j'],['tU','u']]){const b=$(id);
    b.addEventListener('pointerdown',e=>{touch[k]=true;b.setPointerCapture(e.pointerId);e.preventDefault();});
    for(const ev of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{touch[k]=false;});}
}
addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});

// ---------- 시작 ----------
let acc=0,last=0;
function frame(t){if(!last)last=t;acc+=Math.min(t-last,100);last=t;
  while(acc>=MOVE.step){step();acc-=MOVE.step;}
  render();requestAnimationFrame(frame);}
(async function start(){
  await loadMeta();buildHud();
  const q=new URLSearchParams(location.search);
  if(q.get('overlay')==='1'){S.overlay=true;$('tOverlay').classList.add('on');}
  if(q.get('fold')==='1')$('fold').click();
  if(q.get('auto')==='right')touch.r=true;if(q.get('auto')==='left')touch.l=true;   // 확인용 자동 걷기
  const z=location.hash.slice(1);
  enterZone(L.ZONES[z]?z:'village',q.has('x')?+q.get('x'):undefined);
  if(q.get('preset')&&PRESETS[q.get('preset')])setPreset(q.get('preset'),true);
  for(const [k,v] of q)if(k.startsWith('st.')&&S.states[k.slice(3)]!==undefined){S.states[k.slice(3)]=v;}
  requestAnimationFrame(frame);
})();
})();
