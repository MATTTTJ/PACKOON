'use strict';
/* 필드: 주인공 이동과 점프, 휘두르기, 줍기, 카메라, 화면 그리는 순서.
   지역마다 다른 것(배경, 장애물, 필드 보스, 날씨)은 REG 의 함수를 부른다. 필요한 함수 목록은 README 참고 */

function paused(){return !G.started||G.ended||!!B||inkOn||open('dlg')||open('bag')||open('book')||open('notebook')||!!openMinigame();}
function hitPlayer(x1,x2,y1,y2){return G.px+5>x1&&G.px-5<x2&&G.py>y1&&G.py-18<y2;}
function hurt(srcX){
  if(G.hurtT>0)return;G.hp--;G.hurtT=60;G.px+=(G.px<srcX?-16:16);G.vy=-2.6;G.onGround=false;refreshHud();
  if(G.hp<=0)faint();
}
function faint(){
  G.f.faints=(G.f.faints||0)+1;G.hp=G.maxhp;G.hurtT=60;
  REG.faint();
  refreshHud();
}

let shakeT=0;
function doHit(){
  Vfx.slash();
  const f=G.face,x1=f>0?G.px+TABLES.TUNING.field_hit_front:G.px-TABLES.TUNING.field_hit_back,x2=x1+TABLES.TUNING.field_hit_width;const dmg=G.sharp?2:1;
  for(const d of G.digs){if(!d.done&&!d.busy&&d.x>x1-TABLES.TUNING.field_dig_padding&&d.x<x2+TABLES.TUNING.field_dig_padding&&G.onGround){openGather(d);return;}}
  REG.onHit(x1,x2,dmg,f);
}
const sparks=[];
function spark(x,y){for(let i=0;i<8;i++)sparks.push({x,y,vx:(Math.random()-.5)*2.4,vy:-Math.random()*2.6,t:26});}

function step(){
  if(toastT>0){toastT--;if(toastT===0)$('toast').hidden=true;}
  Vfx.update();
  const mg=openMinigame();if(mg){mg.step();return;}
  if(REG.ambient)REG.ambient();   // 지역 진행 로직(예: 영산 아빠 몸짓)도 여기서 돈다. 날씨가 있어도 늘 부른다
  if(paused())return;
  G.anim++;
  let ax=0;if(isLeft())ax-=1;if(isRight())ax+=1;
  G.vx=ax*(G.attackT>0&&G.onGround?TABLES.TUNING.field_swing_speed:TABLES.TUNING.field_move_speed);if(ax)G.face=ax>0?1:-1;
  if(jumpQ&&G.onGround){Sound.jump();G.vy=TABLES.TUNING.field_jump_velocity;G.onGround=false;}jumpQ=false;
  G.vy=Math.min(TABLES.TUNING.field_fall_speed,G.vy+TABLES.TUNING.field_gravity);
  const wasGrounded=G.onGround,prevX=G.px;
  const prevY=G.py;G.px+=G.vx;G.py+=G.vy;
  G.px=clamp(G.px,16,REG.maxX());
  G.onGround=false;
  if(G.py>=GROUND){G.py=GROUND;G.vy=0;G.onGround=true;}
  else if(G.vy>=0){for(const p of REG.platforms){if(G.px>p.x-3&&G.px<p.x+p.w+3&&prevY<=p.y+0.01&&G.py>=p.y){G.py=p.y;G.vy=0;G.onGround=true;}}}
  Vfx.feet();
  if(!wasGrounded&&G.onGround)Sound.land();
  if(G.onGround&&wasGrounded&&Math.abs(G.px-prevX)>0.2)Sound.footstep();
  if(atkQ&&G.attackT<=0){Sound.swing();G.attackT=TABLES.TUNING.field_swing_frames;}atkQ=false;
  if(G.attackT>0){G.attackT--;if(G.attackT===TABLES.TUNING.field_swing_hit_at)doHit();}
  if(G.hurtT>0)G.hurtT--;
  for(const a of G.pickups){if(!a.got&&Math.abs(a.x-G.px)<TABLES.TUNING.field_pickup_x&&Math.abs(a.y-G.py)<TABLES.TUNING.field_pickup_y){a.got=true;addItem(a.item,1);if(REG.onPickup)REG.onPickup(a);}}
  REG.step();
  for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.x+=s.vx;s.y+=s.vy;s.vy+=0.15;if(--s.t<=0)sparks.splice(i,1);}
  if(shakeT>0)shakeT--;
  const target=G.px-W*0.42;G.cam+=(target-G.cam)*0.12;G.cam=clamp(G.cam,0,REG.world-W);
}

/* ---------- 그리기 ---------- */
let cam=0;
function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
/* 좌우 방향(f)에 따라 뒤집어 그리기 */
function M(ox,oy,f,lx,ly,w,h,c){R(f>0?ox+lx:ox-lx-w,oy+ly,w,h,c);}

function drawLogs(){for(const p of REG.platforms){const x=p.x-cam;if(x>W||x+p.w<0)continue;R(x,p.y,p.w,5,'#7a4b2a');R(x,p.y,p.w,1,'#a8743b');R(x,p.y+5,p.w,1,'#4a2e1a');R(x,p.y,3,5,'#c9a06a');R(x+p.w-3,p.y,3,5,'#c9a06a');}}
function drawPickups(){for(const a of G.pickups){if(a.got)continue;const x=a.x-cam;if(x<-8||x>W+8)continue;const bob=Math.sin((G.anim+a.x)*0.08)>0.7?-1:0;
  REG.drawPickup(a,x,bob);}}
function drawDigs(){for(const d of G.digs){const x=d.x-cam;if(x<-12||x>W+12)continue;
  if(REG.drawDig&&REG.drawDig(d,x))continue;   // 지역이 직접 그리면 true
  if(d.done){R(x-6,GROUND-1,12,2,'#3e2615');continue;}
  R(x-7,GROUND-4,14,4,'#7a4b2a');R(x-5,GROUND-6,10,2,'#8b5a2b');
  if(Math.floor((G.anim+d.x)/14)%3===0){R(x-3,GROUND-10,1,1,'#fff3b0');R(x+3,GROUND-12,1,1,'#fff3b0');}else R(x,GROUND-11,1,1,'#ffe48a');}}
function drawNpcs(){for(const n of REG.npcs){const x=n.x-cam;if(x<-60||x>W+60)continue;const f=G.px<n.x?-1:1;
  if(n.props)n.props(n);
  n.draw(x,GROUND,f);}}

function drawRaccoonAt(ox,oy,f,st,attackT,tool){
  const Gy='#8c8070',K='#2a211b',Wt='#efe6d6',Bl='#d9a441',T='#6f6357';
  M(ox,oy,f,-13,-9,7,4,T);M(ox,oy,f,-12,-9,1,4,K);M(ox,oy,f,-9,-9,1,4,K);
  M(ox,oy,f,-9,-18,8,9,Bl);M(ox,oy,f,-8,-17,1,1,'#8a3b2a');M(ox,oy,f,-5,-14,1,1,'#8a3b2a');M(ox,oy,f,-7,-11,1,1,'#8a3b2a');M(ox,oy,f,-3,-19,3,2,'#b07d26');
  M(ox,oy,f,-3+st,-4,3,4,K);M(ox,oy,f,2-st,-4,3,4,K);
  M(ox,oy,f,-4,-12,9,8,Gy);M(ox,oy,f,0,-11,4,6,'#cfc3b2');
  M(ox,oy,f,-3,-20,10,8,Gy);M(ox,oy,f,-2,-17,9,2,K);M(ox,oy,f,4,-17,1,1,'#ffffff');M(ox,oy,f,-2,-15,8,2,Wt);M(ox,oy,f,7,-16,1,2,K);
  M(ox,oy,f,-7,-21,16,2,'#c39b55');M(ox,oy,f,-3,-25,8,4,'#dcbb7a');M(ox,oy,f,-3,-22,8,1,'#6e4f22');M(ox,oy,f,4,-27,2,2,'#fbf7ee');
  const hx=ox+f*5,hy=oy-10;const a=attackT>0?-0.9+(1-attackT/18)*3.2:0.35;
  const dx=f*Math.sin(a),dy=-Math.cos(a);
  for(let i=0;i<10;i++)R(hx+dx*i,hy+dy*i,1,1,'#7a4b2a');
  const ex=hx+dx*10,ey=hy+dy*10,px=-dy*f,py=dx*f;
  if(tool==='sickle'){for(let i=0;i<6;i++){const k=i/5;R(ex+px*(i*0.9)+dx*(k*k*4),ey+py*(i*0.9)+dy*(k*k*4),2,2,'#d8dde2');}}
  else{for(let i=-3;i<=3;i++)R(ex+px*i,ey+py*i,2,2,i===3||i===-3?'#7d8389':'#9aa0a6');}
  if(!Vfx.reducedMotion&&attackT>4&&attackT<13){for(let i=0;i<12;i++){const a=-1.4+i*.18;R(hx+f*Math.cos(a)*12,hy+Math.sin(a)*12,1,1,'#ecdcb4');}}
}
function drawRaccoon(){
  if(!Vfx.reducedMotion&&G.hurtT>0&&Math.floor(G.hurtT/4)%2)return;
  const st=(G.onGround&&Math.abs(G.vx)>0.2)?Math.floor(G.anim/6)%2:0;
  R(G.px-cam-7,GROUND,14,1,'rgba(40,24,14,.35)');
  drawRaccoonAt(G.px-cam,G.py,G.face,st,G.attackT,heldTool());
}

function draw(){
  cam=Math.round(G.cam)+(shakeT&&!Vfx.reducedMotion?(shakeT%2?1:-1):0);
  REG.drawBack();
  Vfx.draw('back');
  drawLogs();
  if(REG.drawScenery)REG.drawScenery();
  drawDigs();
  drawPickups();
  drawNpcs();
  if(REG.drawActors)REG.drawActors();
  drawRaccoon();
  if(!Vfx.reducedMotion)for(const s of sparks)R(s.x-cam,s.y,1,1,'#fff3b0');
  Vfx.front();
  updateOverlay();
}
let lastNear=null;
function nearDig(){if(paused())return null;for(const d of G.digs){if(!d.done&&!d.busy&&Math.abs(d.x-(G.px+G.face*TABLES.TUNING.field_dig_ahead))<TABLES.TUNING.field_dig_distance)return d;}return null;}
function updateOverlay(){
  const pr=$('prompt');
  const n=paused()?null:nearNpc();const dg=n?null:nearDig();
  if(n){pr.hidden=false;if(lastNear!==n){pr.textContent=(TOUCH?'':'E · ')+(n.prompt||n.name+'에게 말 걸기');lastNear=n;}pr.style.left=((n.x-cam)/W*100)+'%';pr.style.top=((GROUND-32)/H*100)+'%';}
  else if(dg){pr.hidden=false;if(lastNear!==dg){pr.textContent=TOUCH?'휘두르기로 캐기':'J · 캐기';lastNear=dg;}pr.style.left=((dg.x-cam)/W*100)+'%';pr.style.top=((GROUND-14)/H*100)+'%';}
  else{pr.hidden=true;lastNear=null;}
  $('padTalk').classList.toggle('ready',!!n);
  /* 필드 보스 체력 막대: REG.fieldBoss() 가 {name, hp, max} 를 주면 보인다 */
  const fb=REG.fieldBoss?REG.fieldBoss():null;$('bossbar').hidden=!fb;
  if(fb){$('bossName').textContent=fb.name;$('bossfill').style.width=(fb.hp/fb.max*100)+'%';}
}
