'use strict';
/* 필드: 주인공 이동과 점프, 휘두르기, 줍기, 카메라, 화면 그리는 순서.
   지역마다 다른 것(배경, 장애물, 필드 보스, 날씨)은 REG 의 함수를 부른다. 필요한 함수 목록은 README 참고 */

function paused(){return !G.started||G.ended||!!B||inkOn||!!vistaMode||zoneFade>0||open('dlg')||open('bag')||open('book')||open('notebook')||!!openMinigame();}
function hitPlayer(x1,x2,y1,y2){return G.px+5>x1&&G.px-5<x2&&G.py>y1&&G.py-18<y2;}
function hurt(srcX){
  if(G.hurtT>0)return;G.hp--;G.hurtT=60;G.px+=(G.px<srcX?-16:16);G.vy=-2.6;G.onGround=false;refreshHud();
  if(G.hp<=0)faint();
}
function faint(){
  G.f.faints=(G.f.faints||0)+1;G.hp=G.maxhp;G.hurtT=60;
  if(fieldDef().faint)fieldCall('faint');else{G.px=fieldDef().startX??70;G.py=fieldGround();}
  refreshHud();
}

let shakeT=0;
function doHit(){
  Vfx.slash();
  const f=G.face,x1=f>0?G.px+TABLES.TUNING.field_hit_front:G.px-TABLES.TUNING.field_hit_back,x2=x1+TABLES.TUNING.field_hit_width;const dmg=G.sharp?2:1;
  for(const d of fieldItems('digs')){if(!d.done&&!d.busy&&d.x>x1-TABLES.TUNING.field_dig_padding&&d.x<x2+TABLES.TUNING.field_dig_padding&&G.onGround){openGather(d);return;}}
  fieldCall('onHit',x1,x2,dmg,f);
}
const sparks=[];
function spark(x,y){for(let i=0;i<8;i++)sparks.push({x,y,vx:(Math.random()-.5)*2.4,vy:-Math.random()*2.6,t:26});}

function step(){
  if(vistaMode){if(!document.hidden&&!Vfx.reducedMotion)vistaMode.tick=Math.min(vistaMode.tick+1,TABLES.TUNING.vista_pan_frames);return;}
  if(zoneFade>0){zoneFade=Vfx.reducedMotion?0:zoneFade-1;return;}
  if(toastT>0){toastT--;if(toastT===0)$('toast').hidden=true;}
  Vfx.update();
  const mg=openMinigame();if(mg){mg.step();return;}
  fieldCall('ambient');   // 현재 구역의 날씨·진행만 갱신한다
  if(paused())return;
  G.anim++;
  let ax=0;if(isLeft())ax-=1;if(isRight())ax+=1;
  G.vx=ax*(G.attackT>0&&G.onGround?TABLES.TUNING.field_swing_speed:TABLES.TUNING.field_move_speed);if(ax)G.face=ax>0?1:-1;
  if(jumpQ&&G.onGround){Sound.jump();G.vy=TABLES.TUNING.field_jump_velocity;G.onGround=false;}jumpQ=false;
  G.vy=Math.min(TABLES.TUNING.field_fall_speed,G.vy+TABLES.TUNING.field_gravity);
  const wasGrounded=G.onGround,prevX=G.px;
  const prevY=G.py;G.px+=G.vx;G.py+=G.vy;
  if(zoneEdge())return;
  G.px=clamp(G.px,16,fieldDef().maxX?fieldCall('maxX'):fieldWidth()-16);
  G.onGround=false;
  if(G.py>=fieldGround()){G.py=fieldGround();G.vy=0;G.onGround=true;}
  else if(G.vy>=0){for(const p of fieldPlatforms()){if(G.px>p.x-3&&G.px<p.x+p.w+3&&prevY<=p.y+0.01&&G.py>=p.y){G.py=p.y;G.vy=0;G.onGround=true;}}}
  Vfx.feet();
  if(!wasGrounded&&G.onGround)Sound.land();
  if(G.onGround&&wasGrounded&&Math.abs(G.px-prevX)>0.2)Sound.footstep();
  if(atkQ&&G.attackT<=0){Sound.swing();G.attackT=TABLES.TUNING.field_swing_frames;}atkQ=false;
  if(G.attackT>0){G.attackT--;if(G.attackT===TABLES.TUNING.field_swing_hit_at)doHit();}
  if(G.hurtT>0)G.hurtT--;
  for(const a of fieldItems('pickups')){if(!a.got&&Math.abs(a.x-G.px)<TABLES.TUNING.field_pickup_x&&Math.abs(a.y-G.py)<TABLES.TUNING.field_pickup_y){a.got=true;addItem(a.item,1);fieldCall('onPickup',a);}}
  fieldCall('step');
  for(const s of zoneObjects('stamps'))if(s.auto&&pointNear(s))findStamp(s);
  for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.x+=s.vx;s.y+=s.vy;s.vy+=0.15;if(--s.t<=0)sparks.splice(i,1);}
  if(shakeT>0)shakeT--;
  const target=G.px-W*0.42;G.cam+=(target-G.cam)*0.12;G.cam=clamp(G.cam,0,Math.max(0,fieldWidth()-W));
}

/* ---------- 그리기 ---------- */
let cam=0;
function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
/* 좌우 방향(f)에 따라 뒤집어 그리기 */
function M(ox,oy,f,lx,ly,w,h,c){R(f>0?ox+lx:ox-lx-w,oy+ly,w,h,c);}

function drawLogs(){for(const p of fieldPlatforms()){const x=p.x-cam;if(x>W||x+p.w<0)continue;R(x,p.y,p.w,5,'#7a4b2a');R(x,p.y,p.w,1,'#a8743b');R(x,p.y+5,p.w,1,'#4a2e1a');R(x,p.y,3,5,'#c9a06a');R(x+p.w-3,p.y,3,5,'#c9a06a');}}
function drawPickups(){for(const a of fieldItems('pickups')){if(a.got)continue;const x=a.x-cam;if(x<-8||x>W+8)continue;const bob=Math.sin((G.anim+a.x)*0.08)>0.7?-1:0;
  fieldCall('drawPickup',a,x,bob);}}
function drawDigs(){const ground=fieldGround();for(const d of fieldItems('digs')){const x=d.x-cam;if(x<-12||x>W+12)continue;
  if(fieldCall('drawDig',d,x))continue;   // 지역이 직접 그리면 true
  if(d.done){R(x-6,ground-1,12,2,'#3e2615');continue;}
  R(x-7,ground-4,14,4,'#7a4b2a');R(x-5,ground-6,10,2,'#8b5a2b');
  if(Math.floor((G.anim+d.x)/14)%3===0){R(x-3,ground-10,1,1,'#fff3b0');R(x+3,ground-12,1,1,'#fff3b0');}else R(x,ground-11,1,1,'#ffe48a');}}
function drawNpcs(){for(const n of fieldNpcs()){const x=n.x-cam;if(x<-60||x>W+60)continue;const f=G.px<n.x?-1:1;
  if(n.props)n.props(n);
  n.draw(x,n.y??fieldGround(),f);}}

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
  R(G.px-cam-7,fieldGround(),14,1,'rgba(40,24,14,.35)');
  drawRaccoonAt(G.px-cam,G.py,G.face,st,G.attackT,heldTool());
}

function draw(){
  if(vistaMode){drawVista();return;}
  cam=Math.round(G.cam)+(shakeT&&!Vfx.reducedMotion?(shakeT%2?1:-1):0);
  if(fieldDef().drawBack)fieldCall('drawBack');else{R(0,0,W,H,'#d7cfb4');R(0,fieldGround(),W,H-fieldGround(),'#785b3a');}
  Vfx.draw('back');
  drawLogs();
  fieldCall('drawScenery');
  drawZoneObjects();
  drawDigs();
  drawPickups();
  drawNpcs();
  fieldCall('drawActors');
  drawRaccoon();
  if(!Vfx.reducedMotion)for(const s of sparks)R(s.x-cam,s.y,1,1,'#fff3b0');
  Vfx.front();
  updateOverlay();
  if(zoneFade>0){ctx.save();ctx.globalAlpha=zoneFade/TABLES.TUNING.zone_transition_frames;R(0,0,W,H,'#211d24');ctx.restore();}
}
let lastNear=null;
function nearDig(){if(paused())return null;for(const d of fieldItems('digs')){if(!d.done&&!d.busy&&Math.abs(d.x-(G.px+G.face*TABLES.TUNING.field_dig_ahead))<TABLES.TUNING.field_dig_distance)return d;}return null;}
function updateOverlay(){
  const pr=$('prompt');
  const n=paused()?null:nearInteraction();const dg=n?null:nearDig();
  if(n){pr.hidden=false;pr.textContent=(TOUCH?'':'E · ')+interactionLabel(n);lastNear=n;pr.style.left=((n.x-cam)/W*100)+'%';pr.style.top=(((n.y??fieldGround())-32)/H*100)+'%';}
  else if(dg){pr.hidden=false;if(lastNear!==dg){pr.textContent=TOUCH?'휘두르기로 캐기':'J · 캐기';lastNear=dg;}pr.style.left=((dg.x-cam)/W*100)+'%';pr.style.top=((GROUND-14)/H*100)+'%';}
  else{pr.hidden=true;lastNear=null;}
  $('padTalk').classList.toggle('ready',!!n);
  /* 필드 보스 체력 막대: REG.fieldBoss() 가 {name, hp, max} 를 주면 보인다 */
  const fb=fieldCall('fieldBoss');$('bossbar').hidden=!fb;
  if(fb){$('bossName').textContent=fb.name;$('bossfill').style.width=(fb.hp/fb.max*100)+'%';}
}

/* ---------- 확장: 구역·문·조사·길손·도장·경치 ---------- */
let zoneFade=0,vistaMode=null,blockedEdge=null;
const expansionKey=id=>REG.id+':'+id;
function zoneObjects(kind){
  if(CLASSIC)return [];
  const z=zoneDef();
  return [...(z?.[kind]||[]),...(REG[kind]||[]).filter(a=>!usesZones(REG)||(a.zone||firstZone(REG))===G.zone)];
}
const pointNear=p=>Math.abs(p.x-G.px)<(p.distance??TABLES.TUNING.field_talk_distance)&&Math.abs((p.y??fieldGround())-G.py)<TABLES.TUNING.field_interact_y;
const pathOpen=p=>!p.need||p.need();
const exitSpec=e=>typeof e==='string'?{to:e}:e;
function resetFieldModes(){
  endVista();zoneFade=0;blockedEdge=null;sparks.length=0;shakeT=0;releaseInputs();suppressedKeys.clear();Vfx.clear();
}
function changeZone(to,arrival={}){
  if(!usesZones(REG)||!REG.zones[to]||paused())return false;
  const z=REG.zones[to];
  G.zone=to;G.px=clamp(arrival.x??z.startX??70,16,z.w-16);G.py=arrival.y??z.ground??GROUND;
  G.vx=G.vy=G.attackT=0;G.onGround=G.py===(z.ground??GROUND);
  G.cam=clamp(G.px-W*.42,0,Math.max(0,z.w-W));
  suppressHeldInputs();sparks.length=0;shakeT=0;lastNear=null;blockedEdge=null;Vfx.clear();
  zoneFade=Vfx.reducedMotion?0:TABLES.TUNING.zone_transition_frames;
  Sound.playSfx(arrival.sound||'zone_travel');return true;
}
function zoneEdge(){
  const z=zoneDef();if(!z)return false;
  const side=G.px<16&&G.vx<0?'left':G.px>z.w-16&&G.vx>0?'right':null;
  if(!side){blockedEdge=null;return false;}
  const p=exitSpec(z.exits?.[side]);if(!p)return false;
  if(!pathOpen(p)){
    if(blockedEdge!==side)toast(p.reason||'아직 지나갈 수 없는 길이다');
    blockedEdge=side;return false;
  }
  const dest=REG.zones[p.to];if(!dest)return false;
  return changeZone(p.to,{x:p.toX??(side==='right'?16:dest.w-16),y:p.toY});
}
function nearInteraction(){
  if(paused())return null;
  if(!usesZones(REG)&&!['wanderers','doors','examines','vistas','stamps'].some(k=>zoneObjects(k).length))return nearNpc();
  const points=[...fieldNpcs(),...zoneObjects('wanderers'),...zoneObjects('doors'),...zoneObjects('examines'),...zoneObjects('vistas'),...zoneObjects('stamps').filter(s=>!stampFound(s.id))];
  let best=null,dist=Infinity;
  for(const p of points)if(pointNear(p)&&Math.abs(p.x-G.px)<dist){best=p;dist=Math.abs(p.x-G.px);}
  return best;
}
function interactionKind(p){
  for(const kind of ['wanderers','doors','examines','vistas','stamps'])if(zoneObjects(kind).includes(p))return kind;
  return 'npc';
}
function interactionLabel(p){
  const k=interactionKind(p);
  if(k==='doors')return pathOpen(p)?(p.label||'들어가기'):(p.reason||'아직 닫힌 길');
  if(k==='vistas')return '바라보기';
  if(k==='stamps')return p.label||'희미한 자국 살펴보기';
  if(k==='examines')return p.label||'조사하기';
  return p.prompt||(p.name||'길손')+'에게 말 걸기';
}
function tryInteract(){
  const p=nearInteraction();if(!p)return;
  const kind=interactionKind(p);
  if(kind==='npc'){learn('met:'+p.id);p.talk();}
  else if(kind==='doors'){
    if(!pathOpen(p)){toast(p.reason||'아직 지나갈 수 없는 길이다');return;}
    changeZone(p.to,{x:p.toX,y:p.toY,sound:p.sound||'door'});
  }else if(kind==='vistas')startVista(p);
  else if(kind==='stamps')findStamp(p);
  else if(kind==='examines'){
    const texts=Array.isArray(p.text)?p.text:[p.text];
    const visits=G.f.examineVisits||(G.f.examineVisits={}),key=expansionKey(p.id),i=Math.min(visits[key]||0,texts.length-1);
    visits[key]=Math.min(i+1,texts.length-1);
    talk([[p.who||'너구리',texts[i]]]);
  }else if(kind==='wanderers'){
    if(G.f.wanderersDone?.[expansionKey(p.id)])talk([[p.name||'길손',p.greeting||'길에서 또 만나자.']]);
    else p.talk();
  }
}
function finishWanderer(id){
  if(CLASSIC)return false;
  const done=G.f.wanderersDone||(G.f.wanderersDone={}),key=expansionKey(id);
  if(done[key])return false;done[key]=true;
  G.f.wandererCount=Object.keys(done).length;return true;
}
const wandererCount=(region)=>Object.keys(G.f.wanderersDone||{}).filter(k=>!region||k.startsWith(region+':')).length;
const stampFound=id=>!!G.f.stampsFound?.[expansionKey(id)];
const stampCount=(region)=>Object.keys(G.f.stampsFound||{}).filter(k=>!region||k.startsWith(region+':')).length;
function findStamp(s){
  if(CLASSIC||stampFound(s.id))return false;
  // 문구는 notebook.csv의 알게되는키로 연결한다. 위치와 발견 방식만 지역이 정한다.
  const found=G.f.stampsFound||(G.f.stampsFound={});found[expansionKey(s.id)]=true;
  G.f.stampCount=stampCount();G.f.stampsByRegion=G.f.stampsByRegion||{};G.f.stampsByRegion[REG.id]=stampCount(REG.id);
  learn(s.note,true);Vfx.burst(s.x,s.y??fieldGround());Sound.playSfx('stamp_found');
  toast('아빠의 도장이다. 수첩에 그날 이야기가 보인다.');return true;
}
function drawZoneObjects(){
  for(const p of zoneObjects('wanderers'))if(p.draw)p.draw(p.x-cam,p.y??fieldGround(),G.px<p.x?-1:1);
  for(const k of ['doors','examines','vistas','stamps'])for(const p of zoneObjects(k)){
    if(k==='stamps'&&!stampFound(p.id))continue;
    if(p.draw)p.draw(p.x-cam,p.y??fieldGround());
    if(k==='doors'&&!pathOpen(p)&&p.drawBlocked)p.drawBlocked(p.x-cam,p.y??fieldGround());
  }
  const z=zoneDef();if(z)for(const side of ['left','right']){
    const p=exitSpec(z.exits?.[side]);
    if(p&&!pathOpen(p)&&p.drawBlocked)p.drawBlocked((side==='left'?16:z.w-16)-cam,fieldGround());
  }
}
const vistaCaption=el('div',null);
vistaCaption.setAttribute('role','status');vistaCaption.hidden=true;
vistaCaption.style.cssText='position:absolute;left:8%;right:8%;bottom:8%;text-align:center;color:#fff3cf;text-shadow:1px 1px #241f28;pointer-events:none;white-space:pre-line';
$('stage').appendChild(vistaCaption);
function startVista(p){
  if(paused())return;
  const seen=G.f.vistasSeen||(G.f.vistasSeen={}),key=expansionKey(p.id),first=!seen[key];
  seen[key]=true;if(first&&p.diary)diary('vista:'+key,p.diary);
  closePanels();suppressHeldInputs();G.vx=G.vy=G.attackT=0;
  const hidden=[document.querySelector('.hud'),$('pad'),$('dlg'),$('prompt'),$('toast'),$('bossbar')].map(e=>[e,e.hidden]);
  hidden.forEach(([e])=>e.hidden=true);
  vistaMode={p,tick:0,hidden};vistaCaption.textContent=(first&&p.thought?p.thought+'\n':'')+'아무 키나 화면을 누르면 돌아간다';vistaCaption.hidden=false;
  Sound.playSfx('scenery_open');Sound.ambience(p.sound||'wind');
}
function endVista(){
  if(!vistaMode)return;
  vistaMode.hidden.forEach(([e,h])=>e.hidden=h);vistaMode=null;vistaCaption.hidden=true;
  Sound.ambience(null);releaseInputs();lastNear=null;
}
function drawVista(){
  const {p,tick}=vistaMode,max=Math.max(0,fieldWidth()-W);
  const a=clamp(p.from??G.cam,0,max),b=clamp(p.to??a,0,max),t=Vfx.reducedMotion?0:tick/TABLES.TUNING.vista_pan_frames;
  const view=a+(b-a)*(t*t*(3-2*t));
  R(0,0,W,H,p.color||'#273342');
  (p.layers||[]).forEach((layer,i,all)=>{
    const speed=layer.speed??(i+1)/all.length;cam=Math.round(view*speed);
    ctx.save();try{(typeof layer==='function'?layer:layer.draw)(cam,t);}finally{ctx.restore();}
  });
}
// 시작 입력은 경치를 열고, 그다음 입력부터 닫는다. 닫은 입력이 이동·공격·버튼에 새지 않는다.
addEventListener('pointerdown',e=>{if(vistaMode){endVista();e.preventDefault();e.stopImmediatePropagation();}},true);
addEventListener('keydown',e=>{if(vistaMode){e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;suppressedKeys.add(e.key.toLowerCase());endVista();}},true);
