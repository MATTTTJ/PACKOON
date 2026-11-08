'use strict';
/* 결정 D-1301 (사용자 지시 2026-11-08 43): 쉼터. 모든 지역의 보스 바로 앞에 쉼터(작은 화톳불)가 있다.
   - 지역이 Rg.rest={zone,x,need,line,carry} 로 자리를 알린다. zone 은 확장판 구역(옛 구성은 무시), x 는 지금(자른 뒤) 좌표.
   - 다가가면 버튼 없이 켜진다(아이가 부시를 쳐서 불을 피운다). 켤 때마다 체력을 다 채우고, 그때의 G 전체를
     쉼터 칸(REST_KEY, 개발자 모드는 따로)에 따로 남기고, 보통 저장도 한다. 30초 자동 저장이 덮어써도 쉼터 칸은 남는다.
   - 보스에게 지면(lose) 결과 창을 닫은 뒤 쉼터 칸을 되살려 불 앞에 세운다(restAfterBattle). 물러나면(flee) 그 자리 그대로.
     되살린 뒤에도 남길 것: 쓰러진 횟수(faints), 알게 된 것(learned), 지역이 carry 로 적은 진행값.
   - 쉼터를 한 번도 켜지 않았거나(옛 저장) 칸이 다른 지역·다른 게임 것이면 예전처럼 그 자리에서 일어난다. */
const REST_KEY='packoon-rest-v1',DEV_REST_KEY='packoon-rest-dev-v1';
const restKey=()=>typeof Dev!=='undefined'&&Dev.on?DEV_REST_KEY:REST_KEY;
let restInside=false,restSavedAt=0,restOwner=null,restOwnerWhere='';
/* 켜짐 판정은 같은 게임·지역·구역 안에서만 이어진다 (G 를 바꾸거나 구역을 옮기면 새로 본다) */
const restWhere=()=>G?G.runId+'|'+G.region+'|'+(G.zone||''):'';
/* 지금 지역의 쉼터 자리 (없으면 null) */
function restSpot(){
  const r=REG?.rest;if(!r||!G)return null;
  if(usesZones(REG)&&r.zone&&G.zone!==r.zone)return null;
  return r;
}
const restLit=()=>!!(G?.f?.restLit&&G.f.restLit[G.region]);
/* 쉼터 칸 읽기: 이 게임(runId)·이 지역 것만 */
function readRest(){
  let raw;try{raw=localStorage.getItem(restKey());}catch(_){return null;}
  if(!raw||!G)return null;
  try{
    const s=JSON.parse(raw);
    if(!s||s.v!==1||s.runId!==G.runId||!Number.isFinite(s.x))return null;
    if(s.region!==G.region){clearRest();return null;}   // 다음 지역으로 넘어가면 앞 지역 쉼터는 버린다
    return s;
  }catch(_){return null;}
}
function clearRest(){try{localStorage.removeItem(restKey());}catch(_){}}
function writeRest(r){
  returnPouch();rememberRegion(G);
  try{localStorage.setItem(restKey(),JSON.stringify({v:1,at:Date.now(),region:G.region,zone:usesZones(REG)?G.zone:null,x:r.x,runId:G.runId,G}));return true;}
  catch(_){return false;}
}
/* 필드 한 걸음마다 (engine/field.js step) */
function restStep(){
  const r=restSpot();
  const where=restWhere();if(restOwner!==G||restOwnerWhere!==where){restInside=false;restOwner=G;restOwnerWhere=where;}
  if(!r||!G.started||G.ended||G.boss?.dead||(r.need&&!r.need())){restInside=false;return;}
  const near=Math.abs(G.px-r.x)<TABLES.TUNING.rest_range&&G.onGround;
  if(!near){restInside=false;return;}
  if(restInside||busyForSave()||paused())return;
  restInside=true;
  const first=!restLit();
  (G.f.restLit||(G.f.restLit={}))[G.region]=true;
  G.hp=G.maxhp;refreshHud();
  if(!writeRest(r))return;
  writeSave(true);
  if(first){
    for(let i=0;i<14;i++)sparks.push({x:r.x+(Math.random()-0.5)*10,y:surfaceY(r.x)-8,vx:(Math.random()-0.5)*1.2,vy:-1.2-Math.random()*1.6,t:24+Math.floor(Math.random()*18),c:i%3?'#ffcf70':'#ff9a3a'});
    Sound.craft();
    if(r.line)think(r.line);
    toast('쉼터에 불을 피웠어요. 보스에게 지면 여기서 다시 시작해요');
  }else if(Date.now()-restSavedAt>TABLES.TUNING.rest_toast_gap_ms)toast('쉼터 · 여기까지 저장했어요');
  restSavedAt=Date.now();
}
/* 보스 전투 결과 뒤. lose 이고 쉼터 칸이 있으면 쉼터로 되돌린 뒤 hint, 아니면 place(예전 자리) 뒤 hint */
function restAfterBattle(res,place,hint){
  if(res!=='lose'||!restLit()||!readRest()){place?.();hint?.();return;}
  inkTransition('쉼터',42,()=>{if(!restReturn())place?.();hint?.();});
}
function restReturn(){
  const s=readRest(),r=REG?.rest;if(!s||!r)return false;
  const keep={faints:G.f.faints||0,restLit:{...(G.f.restLit||{})}};
  for(const k of r.carry||[])if(G.f[k]!==undefined)keep[k]=G.f[k];
  const learned=G.learned.slice();
  let g;try{g=repairSavedState(s.G);}catch(_){return false;}
  G=g;Object.assign(G.f,keep);
  for(const id of learned)if(!G.learned.includes(id))G.learned.push(id);
  G.form='';G.hp=G.maxhp;G.hurtT=0;G.ended=false;G.started=true;   // 불 앞에서 깜박이지 않고 바로 보이게
  if(usesZones(REG)&&s.zone)G.zone=s.zone;
  resetScreens();
  G.px=s.x-TABLES.TUNING.rest_return_back;G.py=surfaceY(G.px);G.vx=G.vy=0;G.onGround=true;G.face=1;G.attackT=0;
  G.cam=clamp(G.px-W*.42,0,Math.max(0,fieldWidth()-W));
  restInside=true;restOwner=G;restOwnerWhere=restWhere();restSavedAt=Date.now();
  return true;
}
/* 화톳불 그림: 둥근 돌 테와 엇갈린 장작. 켜면 불꽃이 너울대고 불티가 오른다. 보스를 넘긴 뒤에는 식은 재만 남는다 */
function restDraw(){
  const r=restSpot();if(!r||r.draw===false)return;
  const x=Math.round(r.x-cam),y=Math.round(surfaceY(r.x));if(x<-40||x>W+40)return;
  const lit=restLit()&&!G.boss?.dead,t=G.anim;
  if(lit){const a=0.2+0.05*Math.sin(t*0.21),g=ctx.createRadialGradient(x,y-8,1,x,y-8,22);
    g.addColorStop(0,'rgba(255,170,80,'+a.toFixed(3)+')');g.addColorStop(1,'rgba(255,170,80,0)');
    ctx.save();ctx.fillStyle=g;ctx.fillRect(x-22,y-30,44,32);ctx.restore();}
  // 장작 둘 (엇갈림)
  for(let i=0;i<9;i++){R(x-9+i,y-3-Math.floor(i/3),2,2,lit?'#5a3a22':'#3a2e26');R(x+7-i,y-3-Math.floor(i/3),2,2,lit?'#6b4423':'#45362b');}
  R(x-6,y-2,12,2,lit?'#2a1d16':'#2a2522');
  if(!lit){R(x-4,y-3,3,1,'#8a8580');R(x+1,y-4,2,1,'#77716b');}   // 재
  // 돌 테
  const stones=[[-13,-3,5,3],[-9,-1,5,2],[-4,0,5,2],[1,0,5,2],[6,-1,5,2],[10,-3,5,3]];
  for(const [dx,dy,w,h] of stones){R(x+dx,y+dy-h+1,w,h,'#6f6a64');R(x+dx,y+dy-h+1,w,1,'#a39d93');}
  if(!lit)return;
  // 불꽃: 세 겹이 따로 흔들린다
  const f=k=>Math.round(Math.sin(t*0.27+k)*1.5+Math.sin(t*0.61+k*2)*1);
  const h1=11+f(0),h2=8+f(1.7),h3=5+f(3.1);
  for(let i=-4;i<=4;i++){const s=1-Math.abs(i)/5;R(x+i,y-4-Math.round(h1*s),1,Math.round(h1*s),'#e0602a');}
  for(let i=-3;i<=3;i++){const s=1-Math.abs(i)/4;R(x+i,y-4-Math.round(h2*s),1,Math.round(h2*s),'#ff9a3a');}
  for(let i=-1;i<=1;i++){const s=1-Math.abs(i)/2.5;R(x+i,y-4-Math.round(h3*s),1,Math.round(h3*s),'#ffd76a');}
  if(!Vfx.reducedMotion)for(let k=0;k<3;k++){const p=(t*0.9+k*23)%46,sx=x+Math.round(Math.sin((t+k*40)*0.08)*3);R(sx,y-14-Math.round(p*0.6),1,1,p<30?'#ffcf70':'#c9874a');}
}
