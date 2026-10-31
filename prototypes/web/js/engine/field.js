'use strict';
/* 필드: 주인공 이동과 점프, 휘두르기, 줍기, 카메라, 화면 그리는 순서.
   지역마다 다른 것(배경, 장애물, 필드 보스, 날씨)은 REG 의 함수를 부른다. 필요한 함수 목록은 README 참고 */

function paused(){return !G.started||G.ended||!!B||inkOn||!!vistaMode||!!zoneMotion||!!mapTravel||open('map')||zoneFade>0||open('dlg')||open('bag')||open('trade')||open('notebook')||!!openMinigame();}
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
  for(const d of fieldItems('digs')){if(!d.done&&!d.busy&&formVisible(d)&&d.x>x1-TABLES.TUNING.field_dig_padding&&d.x<x2+TABLES.TUNING.field_dig_padding&&G.onGround){if(d.cache)openCache(d);else gatherHit(d);return;}}
  fieldCall('onHit',x1,x2,dmg,f);
}
const sparks=[];
function spark(x,y){for(let i=0;i<8;i++)sparks.push({x,y,vx:(Math.random()-.5)*2.4,vy:-Math.random()*2.6,t:26});}

/* 바닥 좌표는 발이 닿는 높이(px)다. 포물선 그림 좌표와 분리해 저장한다.
   현재 필드는 전 구역에 연속된 바닥이 있고 물·절벽 그림은 그 앞뒤의 풍경이다.
   실제 발판과 maxX 통행 경계만 사용하므로 풍경의 물 위나 닫힌 길 너머로 던지지 않는다. */
function dropSurfaceAt(x,sourceY,sourceX,zoneId=G.zone){
  const z=usesZones(REG)?REG.zones[zoneId]:REG;
  if(!z)return null;
  const width=z.w??REG.world,ground=z.ground??GROUND;
  const max=typeof z.maxX==='function'?z.maxX():width-16;
  x=Math.round(clamp(x,16,Math.min(width-16,max)));
  const surfaces=(z.platforms||[]).filter(p=>x>=p.x+8&&x<=p.x+p.w-8&&p.y>=sourceY-.01);
  const y=surfaces.reduce((v,p)=>Math.min(v,p.y),ground);
  return {x,y};
}
function validDropSurface(a){
  const p=dropSurfaceAt(a.x,a.y,a.x,a.zone??G.zone);
  return !!p&&p.x===a.x&&p.y===a.y;
}
// 결정 D-19: 바닥에 뿌리고 줍기, 지역을 떠나도 남음 (design/data/decisions.csv)
function spawnDrops(item,count,source={}){
  if(!ITEMS[item]||!Number.isSafeInteger(count)||count<=0)return [];
  const zone=source.zone??G.zone,rows=floorDrops(G.region,zone);
  const sx=Number.isFinite(source.x)?source.x:G.px,sy=Number.isFinite(source.y)?source.y:fieldGround();
  const spacing=TABLES.TUNING.drop_min_spacing,spread=TABLES.TUNING.drop_spread;
  const occupied=[...rows.filter(a=>!a.got),...G.pickups.filter(a=>!a.got&&(usesZones(REG)?(a.zone||firstZone(REG))===zone:!a.zone))];
  const born=[];
  for(let i=0;i<count;i++){
    const side=i%2?-1:1,distance=spacing+Math.random()*Math.max(0,spread-spacing);
    let target=null;
    // 먼저 좌우로 번갈아 흩뿌리고, 자리가 차면 가까운 바닥부터 찾는다.
    for(let j=0;j<Math.ceil(fieldWidth()/spacing)*2+2;j++){
      const offset=j===0?side*distance:(j%2?1:-1)*Math.ceil(j/2)*spacing;
      const p=dropSurfaceAt(sx+offset,sy,sx,zone);
      if(p&&occupied.every(a=>Math.hypot(a.x-p.x,a.y-p.y)>=spacing)){target=p;break;}
    }
    if(!target)target=dropSurfaceAt(sx,sy,sx,zone); // 비정상적으로 가득한 시험 맵에서도 수량은 버리지 않는다.
    if(!target)continue;
    const a={id:'floor:'+G.region+':'+(zone||'classic')+':'+(G.floorSerial=(G.floorSerial||0)+1),item,...target,
      zone:zone||null,sourceX:sx,sourceY:sy-8,flight:Vfx.reducedMotion?0:TABLES.TUNING.drop_flight_frames,
      bounce:Vfx.reducedMotion?0:TABLES.TUNING.drop_bounce_frames,got:false};
    rows.push(a);occupied.push(a);born.push(a);
  }
  refreshGoal();return born;
}
function nearFloorItems(){
  return [...fieldItems('pickups').filter(formVisible),...floorDrops()].filter(a=>!a.got&&!(a.flight>0)&&!(a.bounce>0)&&
    Math.abs(a.x-G.px)<=TABLES.TUNING.pickup_range&&Math.abs(a.y-G.py)<=TABLES.TUNING.pickup_range_y);
}
function floorPickupGoal(original){
  if(!G.started||G.ended)return original;
  const rows=[...G.pickups,...Object.values(G.floorItems?.[G.region]||{}).flat()].filter(a=>!a.got);
  // 결정 D-35: 할 일 문구는 아이 말투(~하자)다 (design/data/decisions.csv)
  const a=rows.find(a=>((/줍자|따자|따서|베자|캐자/.test(original)&&original.includes(ITEMS[a.item]?.n))||
    (a.item==='root'&&!has('root')&&/흙더미를 캐자/.test(original))||
    (a.item==='meoru'&&G.region==='galchamgol'&&G.boss.dead&&!has('meoru')&&!G.diary.some(d=>d.id==='end')))&&
    !/건네자|넣어|빻자|갈자|찌자/.test(original));
  if(!a)return original;
  const n=ITEMS[a.item].n,last=n.charCodeAt(n.length-1)-0xAC00;
  return '바닥의 '+n+(last>=0&&last<11172&&last%28?'을':'를')+' 줍자';
}
let pickupPose=null;
const pickupIcons=new Map();
function cancelPickup(){pickupPose=null;}
function tryPickup(){
  if(paused()||pickupPose||!G.onGround||G.attackT>0)return false;
  const nearby=nearFloorItems();if(!nearby.length)return false;
  if(!nearby.some(a=>canPickupItem(a.item))){bagFullWarning();return false;}
  pickupPose={owner:G,region:G.region,zone:G.zone,tick:0,items:null};
  G.vx=0;jumpQ=atkQ=dropQ=false;return true;
}
/* X(J) 한 키: 발밑 물건이 있으면 줍고, 없으면 휘두른다. 보따리가 가득하면 휘두르기만 하고 알린다. */
function actionPress(){
  const nearby=!pickupPose&&G.onGround&&G.attackT<=0?nearFloorItems():[];
  if(nearby.length){
    if(nearby.some(a=>canPickupItem(a.item))){tryPickup();return;}
    bagFullWarning();
  }
  atkQ=true;
}
let bagFullAt=-1e9;
function bagFullWarning(){
  const now=performance.now();if(now-bagFullAt<1500)return;bagFullAt=now;
  toast('보따리가 가득 찼다. 더는 담을 수 없다.');
  for(const b of document.querySelectorAll('#btnBag,#pad [data-k="bag"]')){b.classList.remove('warn');void b.offsetWidth;b.classList.add('warn');setTimeout(()=>b.classList.remove('warn'),1200);}
}
function finishFloorPickup(a){
  if(a.got||!canPickupItem(a.item))return false;
  a.got=true;addItem(a.item,1);Vfx.burst(G.px,G.py-6);spark(G.px,G.py-6);Vfx.scatter(a.x,a.y,a.item);
  fieldCall('onPickup',a);REG.onFloorPickup?.(a);return true;
}
function stepFloorItems(){
  for(const a of floorDrops())if(!a.got){
    if(Vfx.reducedMotion){a.flight=a.bounce=0;}
    else if(a.flight>0)a.flight--;else if(a.bounce>0)a.bounce--;
  }
}
function stepPickup(){
  const p=pickupPose;
  if(p.owner!==G||p.region!==G.region||p.zone!==G.zone){cancelPickup();return;}
  p.tick++;
  if(p.tick===TABLES.TUNING.pickup_motion_frames){
    const stacks=new Set(Object.keys(G.inv).filter(id=>G.inv[id]>0));p.items=[];
    for(const a of nearFloorItems()){
      if(stacks.has(a.item)||!Number.isFinite(G.bagSlots)||stacks.size<G.bagSlots){p.items.push(a);stacks.add(a.item);}
      else p.full=true;
    }
  }
  if(p.tick>=TABLES.TUNING.pickup_motion_frames+TABLES.TUNING.pickup_pull_frames){
    let full=!!p.full;
    for(const a of p.items||[])if(!a.got&&!finishFloorPickup(a))full=true;
    cancelPickup();if(full)toast('보따리가 가득하다');
  }
}
function dropDrawPoint(a){
  const p=pickupPose;
  if(!Vfx.reducedMotion&&p?.items?.includes(a)){
    const t=clamp((p.tick-TABLES.TUNING.pickup_motion_frames)/TABLES.TUNING.pickup_pull_frames,0,1);
    return {x:a.x+(G.px-a.x)*t,y:a.y+(G.py-6-a.y)*t};
  }
  if(!Vfx.reducedMotion&&a.flight>0){
    // t=경과/총 프레임(0..1), y=직선 보간-4ht(1-t). h=24px일 때 t=.5에서 24px 높다.
    const t=1-a.flight/TABLES.TUNING.drop_flight_frames;
    return {x:a.sourceX+(a.x-a.sourceX)*t,y:a.sourceY+(a.y-a.sourceY)*t-4*TABLES.TUNING.drop_arc_height*t*(1-t)};
  }
  const t=1-(a.bounce||0)/TABLES.TUNING.drop_bounce_frames;
  return {x:a.x,y:a.y-(!Vfx.reducedMotion&&a.bounce>0?Math.sin(Math.PI*t)*TABLES.TUNING.drop_bounce_height:0)};
}
function drawFloorDrops(){
  for(const a of floorDrops()){
    if(a.got)continue;const p=dropDrawPoint(a),x=p.x-cam;
    if(x<-16||x>W+16)continue;
    if(!pickupIcons.has(a.item))pickupIcons.set(a.item,icon(a.item));
    floorShadow(a.x-cam,a.y);
    const ic=pickupIcons.get(a.item);drawOutlined(x,p.y,(ox,oy)=>ctx.drawImage(ic,ox-8,oy-16));
    floorGlint(x,p.y,12,a.x+a.y);
  }
}

function step(){
  if(mapTravel){stepMapTravel();return;}
  if(open('map'))return;
  if(vistaMode){if(!document.hidden&&!Vfx.reducedMotion)vistaMode.tick=Math.min(vistaMode.tick+1,TABLES.TUNING.vista_pan_frames);return;}
  if(zoneMotion){stepZoneTransition();return;}
  if(zoneFade>0){zoneFade=Vfx.reducedMotion?0:zoneFade-1;return;}
  if(toastT>0){toastT--;if(toastT===0)$('toast').hidden=true;}
  Vfx.update();
  const mg=openMinigame();if(mg){mg.step();return;}
  fieldCall('ambient');   // 현재 구역의 날씨·진행만 갱신한다
  if(paused())return;
  if(document.hidden)return;
  stepFloorItems();
  if(pickupPose){G.vx=0;jumpQ=atkQ=dropQ=false;stepPickup();return;}
  if(REG.order===regionList()[0].order&&!G.f.momNoteSeen){showMomNote();return;}
  if(usesZones(REG)&&['inn','shelter'].includes(G.zone)&&deliverHomeReply())return;
  REG.formCheck?.();   // 지역이 이야기 진행에 맞춰 변신을 여는 자리 (forms.js)
  G.anim++;
  let ax=0;if(isLeft())ax-=1;if(isRight())ax+=1;
  G.vx=ax*(G.attackT>0&&G.onGround?TABLES.TUNING.field_swing_speed:TABLES.TUNING.field_move_speed*formMoveMul());if(ax)G.face=ax>0?1:-1;
  const climbing=stepClimb(ax);
  if(!climbing){
  if(jumpQ&&G.onGround){Sound.jump();G.vy=TABLES.TUNING.field_jump_velocity*formJumpMul();G.onGround=false;}jumpQ=false;
  // ↓+점프: 땅이 아닌 발판 위에서만 아래로 빠진다. 지나는 동안 그 높이의 발판만 무시한다.
  if(dropQ&&G.onGround&&G.py<fieldGround()-0.5){G.dropY=G.py;G.dropT=TABLES.TUNING.field_drop_frames;G.py+=1;G.vy=1;G.onGround=false;}dropQ=false;
  if(G.dropT>0)G.dropT--;
  G.vy=Math.min(TABLES.TUNING.field_fall_speed,G.vy+TABLES.TUNING.field_gravity);
  formFallCap();
  }else formGlide=false;
  const wasGrounded=G.onGround||climbing,prevX=G.px;
  const prevY=G.py;
  if(!climbing){G.px+=G.vx;G.py+=G.vy;}
  if(zoneEdge())return;
  G.px=clamp(G.px,16,fieldDef().maxX?fieldCall('maxX'):fieldWidth()-16);
  if(!climbing){
  G.onGround=false;
  if(G.py>=fieldGround()){G.py=fieldGround();G.vy=0;G.onGround=true;}
  else if(G.vy>=0){for(const p of [...fieldPlatforms(),...formLedges()]){if(G.dropT>0&&Math.abs(p.y-G.dropY)<1)continue;if(G.px>p.x-3&&G.px<p.x+p.w+3&&prevY<=p.y+0.01&&G.py>=p.y){G.py=p.y;G.vy=0;G.onGround=true;}}}
  }
  Vfx.feet();
  if(!wasGrounded&&G.onGround)Sound.land();
  if(G.onGround&&wasGrounded&&Math.abs(G.px-prevX)>0.2)Sound.footstep();
  if(atkQ&&G.attackT<=0){Sound.swing();gatherPress();G.attackT=TABLES.TUNING.field_swing_frames;}atkQ=false;
  if(G.attackT>0){G.attackT--;if(G.attackT===TABLES.TUNING.field_swing_hit_at)doHit();}
  if(G.hurtT>0)G.hurtT--;
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
/* 바닥 물건이 배경에 묻히지 않게 (피드백 16): 그림 둘레에 한지빛 1px 테두리, 밑에 그림자, 가끔 반짝임 한 번.
   y는 물건이 놓인 바닥, h는 그림 높이. 반짝임은 물건마다 때를 엇갈리고, 움직임 줄이기에서는 끈다. */
const OUTLINE_W=40,OUTLINE_H=34,OUTLINE_OX=20,OUTLINE_OY=30,OUTLINE_COLOR='#fff4d6';
const outlineBuf=document.createElement('canvas'),outlineSil=document.createElement('canvas');
outlineBuf.width=outlineSil.width=OUTLINE_W;outlineBuf.height=outlineSil.height=OUTLINE_H;
/* draw(ox,oy): (ox,oy)를 바닥 가운데로 삼아 물건을 그린다. 화면의 (x,y)에 테두리와 함께 옮겨 찍는다 */
function drawOutlined(x,y,draw){
  const b=outlineBuf.getContext('2d'),s=outlineSil.getContext('2d');
  b.clearRect(0,0,OUTLINE_W,OUTLINE_H);b.imageSmoothingEnabled=false;
  const saved=ctx;ctx=b;try{draw(OUTLINE_OX,OUTLINE_OY);}finally{ctx=saved;}
  s.globalCompositeOperation='source-over';s.clearRect(0,0,OUTLINE_W,OUTLINE_H);s.drawImage(outlineBuf,0,0);
  s.globalCompositeOperation='source-in';s.fillStyle=OUTLINE_COLOR;s.fillRect(0,0,OUTLINE_W,OUTLINE_H);
  const dx=Math.round(x)-OUTLINE_OX,dy=Math.round(y)-OUTLINE_OY;
  ctx.save();ctx.globalAlpha=.9;
  for(const [ox,oy] of [[1,0],[-1,0],[0,1],[0,-1]])ctx.drawImage(outlineSil,dx+ox,dy+oy);
  ctx.globalAlpha=1;ctx.drawImage(outlineBuf,dx,dy);ctx.restore();
}
function floorShadow(x,y){R(x-6,y,12,1,'rgba(30,18,10,.38)');R(x-4,y+1,8,1,'rgba(30,18,10,.2)');}
/* 캐는 자리: 흙더미 밑에 옅은 빛 한 줄 (그림은 지역마다 달라 테두리 대신) */
function floorMark(x,y){
  ctx.save();ctx.globalAlpha=.3;ctx.fillStyle='#fff3cf';ctx.beginPath();ctx.ellipse(Math.round(x),Math.round(y-1),11,3,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
function floorGlint(x,y,h=10,seed=0){
  if(Vfx.reducedMotion)return;
  const t=((G.anim||0)+Math.abs(seed*37|0))%150;if(t>=16)return;
  const s=t<5||t>11?1:2,gx=Math.round(x+4),gy=Math.round(y-h-2),c='#fffbe8';
  R(gx,gy-s,1,s*2+1,c);R(gx-s,gy,s*2+1,1,c);
}
function drawPickups(){for(const a of fieldItems('pickups')){if(a.got||!formVisible(a))continue;const p=dropDrawPoint(a),x=p.x-cam;if(x<-8||x>W+8)continue;const bob=Vfx.reducedMotion?0:Math.sin((G.anim+a.x)*0.08)>0.7?-1:0;
  floorShadow(x,a.y);
  drawOutlined(x,p.y,(ox,oy)=>fieldCall('drawPickup',{...a,y:oy},ox,bob));
  floorGlint(x,p.y,9,a.x);}}
function drawDigs(){const ground=fieldGround();for(const d of fieldItems('digs')){const x=d.x-cam;if(x<-12||x>W+12||!formVisible(d))continue;
  if(d.cache){drawCache(d,x);continue;}   // 다람쥐의 잊은 몫 (forms.js)
  const dy=d.y??ground,live=!d.done&&!d.busy;
  if(live)floorMark(x,dy);                // 캘 수 있는 자리도 밑을 밝혀 눈에 띄게 (피드백 16)
  if(fieldCall('drawDig',d,x)){if(live)floorGlint(x,dy,10,d.x);continue;}   // 지역이 직접 그리면 true
  if(d.done){R(x-6,ground-1,12,2,'#3e2615');continue;}
  R(x-7,ground-4,14,4,'#7a4b2a');R(x-5,ground-6,10,2,'#8b5a2b');
  if(Math.floor((G.anim+d.x)/14)%3===0){R(x-3,ground-10,1,1,'#fff3b0');R(x+3,ground-12,1,1,'#fff3b0');}else R(x,ground-11,1,1,'#ffe48a');}}
function drawNpcs(){for(const n of fieldNpcs()){const x=n.x-cam;if(x<-60||x>W+60)continue;const f=G.px<n.x?-1:1;
  if(n.props)n.props(n);
  n.draw(x,n.y??fieldGround(),f);}}

/* 새 표시가 없는 옛 저장도 도착 지역과 기존 진행을 읽어 겉모습만 복원한다. */
function backpackStage(){
  const f=G.f;
  if((REGIONS[G.region]?.order||1)>=2)f.bagReachedDolneomeo=true;
  if(f.bueongDone&&!open('dlg'))f.bagTokenGiven=true;
  if(f.dadDone&&!open('dlg'))f.bagDadGiven=true;
  return f.bagDadGiven?3:f.bagTokenGiven?2:f.bagReachedDolneomeo?1:0;
}
function drawBackpack(ox,oy,f){
  const stage=backpackStage();
  if(stage===0){
    M(ox,oy,f,-9,-18,8,9,'#d9a441');M(ox,oy,f,-8,-17,1,1,'#8a3b2a');M(ox,oy,f,-5,-14,1,1,'#8a3b2a');M(ox,oy,f,-7,-11,1,1,'#8a3b2a');M(ox,oy,f,-3,-19,3,2,'#b07d26');
  }else if(stage===1){
    M(ox,oy,f,-10,-19,8,12,'#99733d');M(ox,oy,f,-9,-18,6,3,'#d9bc82');M(ox,oy,f,-9,-12,6,1,'#5c412a');M(ox,oy,f,-5,-20,2,13,'#563b2b');
  }else{
    const dad=stage===3,top=dad?-27:-23,wood=dad?'#61462d':'#a37743';
    M(ox,oy,f,-11,top,2,-top-3,wood);M(ox,oy,f,-4,top+1,2,-top-4,wood);
    M(ox,oy,f,-11,top+4,9,2,'#d0a56d');M(ox,oy,f,-12,-8,11,2,wood);
    M(ox,oy,f,-10,-20,7,11,dad?'#a28661':'#c4a064');M(ox,oy,f,-9,-18,5,1,'#e3c995');M(ox,oy,f,-7,-21,1,14,'#473526');
    if(dad){M(ox,oy,f,-11,-13,3,2,'#d6c6a3');M(ox,oy,f,-10,-12,1,3,'#403126');}
  }
}
function drawRaccoonAt(ox,oy,f,st,attackT,tool,pickFrame=0){
  const Gy='#8c8070',K='#2a211b',Wt='#efe6d6',Bl='#d9a441',T='#6f6357';
  if(pickFrame){
    const bend=pickFrame===2?5:3;
    M(ox,oy,f,-12,-7,7,4,T);M(ox,oy,f,-10,-7,1,4,K);M(ox,oy,f,-7,-7,1,4,K);
    drawBackpack(ox-f*2,oy+bend,f);
    M(ox,oy,f,-4,-4,4,4,K);M(ox,oy,f,2,-4,4,4,K);
    M(ox,oy,f,-4,-12+bend,10,6,Gy);M(ox,oy,f,3,-15+bend,9,7,Gy);
    M(ox,oy,f,4,-13+bend,9,2,K);M(ox,oy,f,10,-13+bend,1,1,'#ffffff');
    M(ox,oy,f,5,-11+bend,8,2,Wt);M(ox,oy,f,12,-12+bend,1,2,K);
    M(ox,oy,f,0,-17+bend,15,2,'#c39b55');M(ox,oy,f,4,-21+bend,8,4,'#dcbb7a');
    M(ox,oy,f,4,-18+bend,8,1,'#6e4f22');M(ox,oy,f,10,-23+bend,2,2,'#fbf7ee');
    M(ox,oy,f,6,-6,3,4,Gy);M(ox,oy,f,8,-3,4,2,K);return;
  }
  M(ox,oy,f,-13,-9,7,4,T);M(ox,oy,f,-12,-9,1,4,K);M(ox,oy,f,-9,-9,1,4,K);
  drawBackpack(ox,oy,f);
  M(ox,oy,f,-3+st,-4,3,4,K);M(ox,oy,f,2-st,-4,3,4,K);
  M(ox,oy,f,-4,-12,9,8,Gy);M(ox,oy,f,0,-11,4,6,'#cfc3b2');
  M(ox,oy,f,-3,-20,10,8,Gy);M(ox,oy,f,-2,-17,9,2,K);M(ox,oy,f,4,-17,1,1,'#ffffff');M(ox,oy,f,-2,-15,8,2,Wt);M(ox,oy,f,7,-16,1,2,K);
  M(ox,oy,f,-7,-21,16,2,'#c39b55');M(ox,oy,f,-3,-25,8,4,'#dcbb7a');M(ox,oy,f,-3,-22,8,1,'#6e4f22');M(ox,oy,f,4,-27,2,2,'#fbf7ee');
  // 삼촌이 따 준 잎사귀는 보따리 끈에 매단다 (머리에 얹지 않는다)
  if(G?.forms?.length){M(ox,oy,f,-4,-12,1,5,'#6e4f22');drawStrapLeaf(ox,oy,f,-3,-9);}
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
  const phase=pickupPose?(pickupPose.tick<TABLES.TUNING.pickup_motion_frames/3?1:pickupPose.tick<TABLES.TUNING.pickup_motion_frames*2/3?2:1):0;
  drawPlayerAt(G.px-cam,G.py,G.face,st,G.attackT,heldTool(),phase);
}

function draw(){
  if(mapTravel){drawMapTravel();return;}
  if(vistaMode){drawVista();return;}
  const hideHero=zoneMotion&&['slide','crawl'].includes(zoneMotion.kind);
  drawFieldScene(!hideHero);
  updateOverlay();
  if(zoneFade>0){ctx.save();ctx.globalAlpha=zoneFade/TABLES.TUNING.zone_transition_frames;R(0,0,W,H,'#211d24');ctx.restore();}
  drawZoneTransition();
}
function drawFieldScene(showPlayer=true){
  cam=Math.round(G.cam)+(shakeT&&!Vfx.reducedMotion?(shakeT%2?1:-1):0);
  if(fieldDef().drawBack)fieldCall('drawBack');else{R(0,0,W,H,'#d7cfb4');R(0,fieldGround(),W,H-fieldGround(),'#785b3a');}
  Vfx.draw('back');
  drawLogs();
  fieldCall('drawScenery');
  drawZoneObjects();
  drawDigs();
  drawPickups();
  drawFloorDrops();
  drawNpcs();
  fieldCall('drawActors');
  if(showPlayer){drawRaccoon();drawFormFx();}
  drawGatherCue();   // 채집 고리 (gather.js). 주인공 몸에 가리지 않게 주인공 다음에 그린다
  if(!Vfx.reducedMotion)for(const s of sparks)R(s.x-cam,s.y,1,1,'#fff3b0');
  Vfx.front();
  if(showPlayer)drawListenMarks();
}
let lastNear=null;
/* 결정 D-53: 필드 인물 머리 위에 이름. 아이가 아는 이름만 쓴다: 처음 말을 걸기 전에는 '?', 만난 뒤(met:<id>)에는 이름.
   집안 어른처럼 처음부터 아는 인물은 known:true, 다른 부름(무쇠 삼촌)은 tag:'…'. 물건·자리(prompt가 있는 것, tag:false)는 쓰지 않는다.
   말 걸기 안내가 그 인물 위에 떠 있으면 이름은 안내에 맡기고 숨긴다. 대화·경치·전투·패널 중에는 모두 숨긴다. 높이는 tagY(발에서 위로 px). */
const npcTagLayer=el('div','npc-tags');npcTagLayer.setAttribute('aria-hidden','true');$('stage').appendChild(npcTagLayer);
const npcTagEls=new Map();
// 이름표 높이: 그림을 한 번 그려 보아 가장 높은 칠한 점 위에 둔다(인물마다 키가 다르다). tagY가 있으면 그 값.
const npcTagHeights=new WeakMap();
function npcTagHeight(n){
  if(n.tagY)return n.tagY;if(npcTagHeights.has(n))return npcTagHeights.get(n);
  let h=30;try{const c=document.createElement('canvas');c.width=96;c.height=96;const save=ctx;ctx=c.getContext('2d');try{n.draw(48,90,1);}finally{ctx=save;}
    const d=c.getContext('2d').getImageData(0,0,96,96).data;for(let y=0;y<96;y++){let hit=false;for(let x=0;x<96;x++)if(d[(y*96+x)*4+3]>40){hit=true;break;}if(hit){h=90-y+4;break;}}}catch(_){}
  h=clamp(h,14,80);npcTagHeights.set(n,h);return h;
}
function npcTagText(n){return n.known||knows('met:'+n.id)?(n.tag||n.name):'?';}
function updateNpcTags(near){
  const shown=new Set();
  if(G&&G.started&&!G.ended&&!paused()&&!B){
    for(const n of [...fieldNpcs(),...zoneObjects('wanderers')]){
      if(n.tag===false||n.prompt||!n.name||!n.draw||n===near)continue;
      const x=n.x-cam;if(x<-20||x>W+20)continue;
      if(typeof formVisible==='function'&&!formVisible(n))continue;
      const key=n.id+'@'+n.x;let e=npcTagEls.get(key);
      if(!e){e=el('span','npc-tag');npcTagEls.set(key,e);npcTagLayer.appendChild(e);}
      const text=npcTagText(n);if(e.textContent!==text)e.textContent=text;
      e.classList.toggle('unknown',text==='?');
      e.style.left=(x/W*100)+'%';e.style.top=(((n.y??fieldGround())-npcTagHeight(n))/H*100)+'%';e.hidden=false;shown.add(key);
    }
  }
  for(const [key,e] of npcTagEls)if(!shown.has(key))e.hidden=true;
}
/* 결정 D-55: 가까이 가면 들리는·보이는 기척. 인물·떠돌이에 hint:'…'(아이가 아는 말로)와 hintRange?(px), hintWhen?()을 두면
   처음 그 거리 안에 들어올 때 한 번 알림으로 띄운다. 이미 만났거나(met), 떠돌이 일을 마쳤거나, 한 번 띄운 뒤에는 나오지 않는다. */
function updateHints(){
  if(!G||!G.started||G.ended||paused())return;
  for(const p of [...fieldNpcs(),...zoneObjects('wanderers')]){
    if(!p.hint)continue;
    const key=G.region+':'+p.id,seen=G.f.hintsSeen||(G.f.hintsSeen={});
    if(seen[key]||knows('met:'+p.id)||G.f.wanderersDone?.[expansionKey(p.id)])continue;
    if(p.hintWhen&&!p.hintWhen())continue;
    if(Math.abs(p.x-G.px)>(p.hintRange||TABLES.TUNING.hint_range))continue;
    seen[key]=true;toast(typeof p.hint==='function'?p.hint():p.hint);return;
  }
}
function nearDig(){if(paused())return null;for(const d of fieldItems('digs')){if(!d.done&&!d.busy&&formVisible(d)&&Math.abs(d.x-(G.px+G.face*TABLES.TUNING.field_dig_ahead))<TABLES.TUNING.field_dig_distance)return d;}return null;}
function updateOverlay(){
  const pr=$('prompt');
  const n=paused()?null:nearInteraction();const dg=n?null:nearDig();
  const floor=paused()||pickupPose?null:nearFloorItems()[0];
  if(floor){pr.hidden=false;const room=nearFloorItems().some(a=>canPickupItem(a.item));pr.textContent=!room?'보따리 가득':TOUCH?'휘두르기로 줍기':'X · 줍기';lastNear=floor;pr.style.left=((floor.x-cam)/W*100)+'%';pr.style.top=((floor.y-30)/H*100)+'%';}
  else if(n){pr.hidden=false;pr.textContent=(TOUCH?'':'E · ')+interactionLabel(n);lastNear=n;pr.style.left=((n.x-cam)/W*100)+'%';pr.style.top=(((n.y??fieldGround())-32)/H*100)+'%';}
  else if(dg){pr.hidden=false;if(lastNear!==dg){pr.textContent=(TOUCH?'휘두르기로 ':'X · ')+(dg.cache?'잊은 몫 캐기':'캐기');lastNear=dg;}pr.style.left=((dg.x-cam)/W*100)+'%';pr.style.top=((GROUND-14)/H*100)+'%';}
  else if(!paused()&&!formClimb&&climbNear()){const c=climbNear();pr.hidden=false;pr.textContent=TOUCH?'▲ 눌러 오르기':'↑ · 오르기';lastNear=c;pr.style.left=((c.x-cam)/W*100)+'%';pr.style.top=((fieldGround()-36)/H*100)+'%';}
  else{pr.hidden=true;lastNear=null;}
  if(!formRing.hidden&&!formChangeAllowed())formRing.hidden=true;
  $('padTalk').classList.toggle('ready',!!n);
  {const t=n?actionVerb(n):'말걸기';if($('padTalk').textContent!==t)$('padTalk').textContent=t;}
  updateNpcTags(n);updateHints();
  /* 필드 보스 체력 막대: REG.fieldBoss() 가 {name, hp, max} 를 주면 보인다 */
  const fb=fieldCall('fieldBoss');$('bossbar').hidden=!fb;
  if(fb){$('bossName').textContent=fb.name;$('bossfill').style.width=(fb.hp/fb.max*100)+'%';}
}

/* ---------- 확장: 구역·문·조사·길손·도장·경치 ---------- */
let zoneFade=0,vistaMode=null,blockedEdge=null,zoneMotion=null;
const expansionKey=id=>REG.id+':'+id;
function zoneObjects(kind){
  if(CLASSIC)return [];
  const z=zoneDef();
  return [...(z?.[kind]||[]),...(REG[kind]||[]).filter(a=>!usesZones(REG)||(a.zone||firstZone(REG))===G.zone)];
}
const pointNear=p=>Math.abs(p.x-G.px)<(p.distance??TABLES.TUNING.field_talk_distance)&&Math.abs((p.y??fieldGround())-G.py)<TABLES.TUNING.field_interact_y;
/* 원래 조건(need) 또는 몸으로 넘는 변신(formPass). formNeed 는 변신으로도 남는 약속 조건이다 (forms.js) */
const needMet=p=>!p.need||p.need();
const formPasses=p=>!!(p.formPass&&G?.form===p.formPass&&(!p.formNeed||p.formNeed()));
const pathOpen=p=>needMet(p)||formPasses(p);
const exitSpec=e=>typeof e==='string'?{to:e}:e;
function resetFieldModes(){
  resetMap();
  cancelPickup();
  endVista();zoneMotion=null;zoneFade=0;blockedEdge=null;sparks.length=0;shakeT=0;releaseInputs();suppressedKeys.clear();Vfx.clear();
}
function changeZone(to,arrival={}){
  if(!usesZones(REG)||!REG.zones[to]||paused())return false;
  cancelPickup();
  const edge=arrival.edgeDirection===1||arrival.edgeDirection===-1;
  let image,start;
  if(edge&&!Vfx.reducedMotion){
    // 배경 두 장을 밀고 주인공은 그 위에 한 번만 그린다.
    drawFieldScene(false);start={x:G.px-cam,y:G.py};
    image=document.createElement('canvas');image.width=W;image.height=H;image.getContext('2d').drawImage(cv,0,0);
  }
  const z=REG.zones[to];
  revertForm();   // 구역을 옮기면 너구리로 돌아온다
  G.zone=to;G.px=clamp(arrival.x??z.startX??70,16,z.w-16);G.py=arrival.y??z.ground??GROUND;
  markZoneVisited();
  if(!edge)G.vx=0;
  G.vy=G.attackT=0;G.onGround=G.py===(z.ground??GROUND);
  G.cam=clamp(G.px-W*.42,0,Math.max(0,z.w-W));
  if(edge){
    for(const k in keys)if(!['arrowleft','arrowright','a','d'].includes(k)){
      if(keys[k])suppressedKeys.add(k);keys[k]=false;
    }
    touch.up=touch.down=false;jumpQ=atkQ=dropQ=false;
    document.querySelectorAll('#pad .on').forEach(b=>{if(!['left','right'].includes(b.dataset.k))b.classList.remove('on');});
  }else suppressHeldInputs();
  hidePeek();sparks.length=0;shakeT=0;lastNear=null;blockedEdge=null;Vfx.clear();
  zoneFade=edge||Vfx.reducedMotion?0:TABLES.TUNING.zone_transition_frames;
  if(image){
    const incoming=document.createElement('canvas');incoming.width=W;incoming.height=H;
    zoneMotion={kind:'slide',opts:{direction:arrival.edgeDirection},image,incoming,start,
      frames:TABLES.TUNING.zone_transition_frames,tick:0,owner:G,region:G.region,zone:G.zone,end:{x:G.px,y:G.py}};
    // 지역이 자체 보관하는 이전 화면에도 가장자리 전환 그림이 겹치지 않게 한다.
    ctx.clearRect(0,0,W,H);
  }
  Sound.playSfx(arrival.sound||'zone_travel');return true;
}
/* 지역 전용 전환을 다음 패스에서 교체할 공통 틀. 좌표는 필드 px, frames는 CSV에서 읽은 60Hz 갱신 횟수다.
   확대/세로 화면 넘김은 이전 그림을 보관하고, 흐름은 도착 구역에서 입력 없이 지정 좌표까지 이동한다. */
function zoneTransition(kind,opts={}){
  if(!['zoom','flow','climb'].includes(kind)||!opts||typeof opts!=='object'||paused())return false;
  for(const key of ['x','y','fromX','fromY','focusX','focusY'])if(opts[key]!==undefined&&!Number.isFinite(opts[key]))return false;
  for(const key of ['draw','onComplete'])if(opts[key]!==undefined&&typeof opts[key]!=='function')return false;
  if(!usesZones(REG)||!REG.zones[opts.to])return false;
  const frames=opts.frames??TABLES.TUNING.zone_transition_frames;
  if(!Number.isInteger(frames)||frames<=0)return false;
  const image=document.createElement('canvas');image.width=W;image.height=H;image.getContext('2d').drawImage(cv,0,0);
  if(!changeZone(opts.to,{x:opts.x,y:opts.y,sound:opts.sound}))return false;
  zoneFade=0;
  const z=zoneDef(),end={x:G.px,y:G.py};
  zoneMotion={kind,opts:{...opts},image,frames,tick:0,owner:G,region:G.region,zone:G.zone,end};
  if(kind==='flow'){
    G.px=clamp(opts.fromX??end.x,16,z.w-16);G.py=opts.fromY??end.y;
    zoneMotion.start={x:G.px,y:G.py};
  }
  if(Vfx.reducedMotion)finishZoneTransition();
  return true;
}
function finishZoneTransition(){
  const m=zoneMotion;if(!m)return;
  zoneMotion=null;
  if(m.owner!==G||m.region!==G.region||m.zone!==G.zone)return;
  if(m.kind==='slide'){
    // 전환 도중 손을 뗐거나 방향을 바꾼 입력도 그대로 반영한다.
    G.vx=((isRight()?1:0)-(isLeft()?1:0))*Math.abs(G.vx);
    return;
  }
  G.px=m.end.x;G.py=m.end.y;G.vx=G.vy=G.attackT=0;G.onGround=G.py===fieldGround();
  G.cam=clamp(G.px-W*.42,0,Math.max(0,fieldWidth()-W));
  suppressHeldInputs();
  if(typeof m.opts.onComplete==='function')m.opts.onComplete();
}
function stepZoneTransition(){
  const m=zoneMotion;
  if(m.owner!==G||m.region!==G.region||m.zone!==G.zone){zoneMotion=null;releaseInputs();return;}
  if(document.hidden)return;
  if(Vfx.reducedMotion){finishZoneTransition();return;}
  m.tick=Math.min(m.tick+1,m.frames);
  if(m.kind==='crawl')crawlStep(m);
  if(m.kind==='flow'){
    const t=m.tick/m.frames;
    G.px=m.start.x+(m.end.x-m.start.x)*t;G.py=m.start.y+(m.end.y-m.start.y)*t;
    G.cam=clamp(G.px-W*.42,0,Math.max(0,fieldWidth()-W));
  }
  if(m.tick===m.frames)finishZoneTransition();
}
function drawZoneTransition(){
  const m=zoneMotion;if(!m)return;
  if(Vfx.reducedMotion){
    if(m.kind==='slide'||m.kind==='crawl')drawRaccoon();
    return;
  }
  const t=m.tick/m.frames,e=t*t*(3-2*t);
  ctx.save();
  if(m.kind==='slide'){
    m.incoming.getContext('2d').drawImage(cv,0,0);
    const shift=m.opts.direction*Math.round(W*e);
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(m.image,-shift,0);ctx.drawImage(m.incoming,m.opts.direction*W-shift,0);
    const x=m.start.x+(G.px-cam-m.start.x)*e,y=m.start.y+(G.py-m.start.y)*e;
    const st=G.onGround&&G.vx?Math.floor((G.anim+m.tick)/6)%2:0;
    drawPlayerAt(x,y,G.face,st,0,heldTool());
  }else if(m.kind==='zoom'){
    const x=m.opts.focusX??W/2,y=m.opts.focusY??H/2,s=1+(m.opts.reverse?-.16:.18)*e;
    ctx.globalAlpha=1-e;ctx.translate(x,y);ctx.scale(s,s);ctx.drawImage(m.image,-x,-y);
  }else if(m.kind==='climb'){
    const shift=(m.opts.reverse?-1:1)*Math.round(H*e);
    ctx.drawImage(m.image,0,shift);
  }else if(m.kind==='crawl')drawCrawl(m,t);
  // 장면별 그림은 지역 쪽에서 넘긴다. 공통 함수는 진행과 입력 정리만 맡는다.
  ctx.restore();
  if(typeof m.opts.draw==='function'){ctx.save();try{m.opts.draw(t,m.kind);}finally{ctx.restore();}}
}
/* 결정 D-44: 내려가는 문(descend)은 그 자리에서 등을 보이며 기어 내려간 뒤 구역을 넘어가고,
   올라가는 문(ascend)은 도착한 곳에서 아래로부터 기어 올라온다 (design/data/decisions.csv).
   나무를 타는 짐승처럼 팔다리를 번갈아 디딘다. 시간은 tuning.csv의 field_crawl_frames, 움직임 줄이기에서는 바로 넘어간다. */
const CRAWL_DEPTH=30;   // 땅 아래로 내려가 보이는 깊이(px). 화면 아래 끝(225)보다 위에서 어두워진다.
function startCrawl(p){
  if(Vfx.reducedMotion||paused())return false;
  const frames=TABLES.TUNING.field_crawl_frames,face=G.face;
  if(p.descend){
    G.vx=G.vy=0;suppressHeldInputs();
    zoneMotion={kind:'crawl',opts:{dir:1,x:p.x,onComplete:()=>changeZone(p.to,{x:p.toX,y:p.toY,sound:p.sound||'door'})},
      frames,tick:0,owner:G,region:G.region,zone:G.zone,start:{x:G.px,y:G.py},end:{x:G.px,y:G.py},form:G.form||'',face};
    return true;
  }
  if(!changeZone(p.to,{x:p.toX,y:p.toY,sound:p.sound||'door'}))return false;
  zoneFade=0;   // 도착 화면은 모션이 직접 밝힌다
  zoneMotion={kind:'crawl',opts:{dir:-1,x:G.px},frames,tick:0,owner:G,region:G.region,zone:G.zone,
    start:{x:G.px,y:G.py},end:{x:G.px,y:G.py},form:'',face};
  return true;
}
function crawlStep(m){
  // 팔다리를 한 번 바꿔 디딜 때마다 사각 소리를 낸다.
  const beat=Math.max(1,Math.round(m.frames/8));
  if(m.tick%beat===0&&m.tick<m.frames)Sound.playSfx(G.region==='jangteo'?'footstep_market':'footstep_leaf',{gain:.45});
}
function drawCrawl(m,t){
  const down=m.opts.dir>0,steps=8;
  // 내려갈 때: 문 쪽으로 반 발 다가선 뒤 등을 돌리고 디딤을 따라 내려간다. 올라올 때는 거꾸로.
  const depth=down?t:1-t;
  const seg=Math.min(steps-1,Math.floor(depth*steps)),frac=depth*steps-seg;
  const sink=CRAWL_DEPTH*(seg+Math.min(1,frac*1.6))/steps;   // 한 발씩 끊어 내려간다
  const lead=down?Math.min(1,t/.18):1;
  const wx=m.start.x+(m.opts.x-m.start.x)*lead,x=Math.round(wx-cam),y=Math.round(m.start.y+sink);
  // 디딜 뿌리와 흙 턱: 땅 밑으로 이어진 두 줄기와 가로 매듭
  const gy=fieldGround();
  R(x-10,gy,2,H-gy,'#5a3a24');R(x+8,gy,2,H-gy,'#5a3a24');R(x-9,gy,1,H-gy,'#8a6040');
  for(let yy=gy+4;yy<H;yy+=7)R(x-10,yy,20,1,'#7a5234');
  const phase=Math.floor(depth*steps)%2;
  if(down&&t<.18)drawPlayerAt(x,y,m.face,Math.floor(t*20)%2,0,heldTool(),0,m.form);   // 다가서는 반 발
  else if(!m.form)drawRaccoonBackAt(x,y,phase);
  else if(m.form==='squirrel'){
    // 다람쥐는 머리부터 내려간다.
    ctx.save();ctx.translate(x-5,y-6);ctx.rotate(Math.PI/2*(down?1:-1));drawFormAt(0,8,1,phase,'squirrel');ctx.restore();
  }else drawFormAt(x,y-(phase?1:0),m.face,phase,m.form,0,m.form==='owl');
  // 내려갈 때는 끝에서 어두워지고, 올라올 때는 어둠에서 밝아진다.
  const dark=down?clamp((t-.55)/.45,0,1):clamp(1-t/.4,0,1);
  if(dark>0){ctx.save();ctx.globalAlpha=dark;R(0,0,W,H,'#211d24');ctx.restore();}
}
/* 등 뒤에서 본 너구리: 등에 진 보따리, 줄무늬 꼬리. phase마다 위로 뻗은 팔과 아래 디딘 발이 바뀐다. */
function drawRaccoonBackAt(ox,oy,phase){
  const Gy='#8c8070',Dk='#6f6357',K='#2a211b';
  const up=phase?1:-1;   // 위로 뻗은 팔 쪽 (-1 왼쪽, 1 오른쪽). 같은 쪽 발은 아래를 디딘다.
  // 꼬리: 아래로 늘어뜨린 줄무늬
  R(ox-1,oy-8,3,9,Gy);for(const yy of [-6,-3,0])R(ox-1,oy+yy,3,1,K);
  // 뒷다리
  const legL=up<0?[-6,-6,3,7]:[-6,-10,3,4],legR=up>0?[3,-6,3,7]:[3,-10,3,4];
  R(ox+legL[0],oy+legL[1],legL[2],legL[3],K);R(ox+legR[0],oy+legR[1],legR[2],legR[3],K);
  // 몸통과 등줄기
  R(ox-5,oy-18,10,11,Gy);R(ox-1,oy-17,2,9,Dk);
  // 보따리 (여행 단계에 따라 겉모습이 바뀐다)
  const stage=backpackStage();
  if(stage===0){R(ox-5,oy-19,10,8,'#d9a441');R(ox-4,oy-17,1,1,'#8a3b2a');R(ox+1,oy-15,1,1,'#8a3b2a');R(ox+3,oy-18,1,1,'#8a3b2a');R(ox-2,oy-21,4,2,'#b07d26');}
  else if(stage===1){R(ox-5,oy-20,10,11,'#99733d');R(ox-4,oy-19,8,3,'#d9bc82');R(ox-4,oy-13,8,1,'#5c412a');}
  else{const wood=stage===3?'#61462d':'#a37743';R(ox-6,oy-24,2,18,wood);R(ox+4,oy-24,2,18,wood);R(ox-5,oy-20,10,10,stage===3?'#a28661':'#c4a064');R(ox-6,oy-11,12,2,wood);}
  R(ox-5,oy-21,1,4,'#6e4f22');R(ox+4,oy-21,1,4,'#6e4f22');
  if(G?.forms?.length)drawStrapLeaf(ox,oy,1,-5,-17);
  // 팔: 한쪽은 위로 뻗어 잡고, 다른 쪽은 어깨 아래를 짚는다
  const armUp=[up<0?-9:6,-28,3,9],armDown=[up<0?6:-9,-21,3,5];
  R(ox+armUp[0],oy+armUp[1],armUp[2],armUp[3],K);R(ox+armDown[0],oy+armDown[1],armDown[2],armDown[3],K);
  // 뒤통수와 모자
  R(ox-4,oy-23,8,4,Gy);R(ox-4,oy-21,8,1,Dk);
  R(ox-7,oy-25,14,2,'#c39b55');R(ox-4,oy-29,8,4,'#dcbb7a');R(ox-4,oy-26,8,1,'#6e4f22');R(ox+2,oy-31,2,2,'#fbf7ee');
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
  if(!needMet(p))toast(p.formLabel||formTo(p.formPass)+' 지나간다');
  const dest=REG.zones[p.to];if(!dest)return false;
  const direction=side==='right'?1:-1;
  return changeZone(p.to,{x:direction>0?16:dest.w-16,y:p.toY,edgeDirection:direction});
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
  // 결정 D-32: 막힌 길 위에는 짧은 이름(blockedLabel)만. 까닭은 다가가 말을 걸면 아이 혼잣말(blockedSay)로 한다 (design/data/decisions.csv)
  if(k==='doors')return needMet(p)?(p.label||'들어가기'):formPasses(p)?(p.formLabel||formTo(p.formPass)+' 지나가기'):(p.blockedLabel||p.reason||'아직 닫힌 길');
  if(k==='vistas')return '바라보기';
  if(k==='stamps')return p.label||'희미한 자국 살펴보기';
  if(k==='examines')return p.label||'조사하기';
  return p.prompt||(p.name||'길손')+'에게 말 걸기';
}
/* 결정 D-85: 휴대폰 말걸기 버튼 글자는 대상에 맞춘다. 말풍선 안내의 마지막 낱말(들어가기·살피기·쉬기…)을 쓰고, 길면 종류별 기본 말 */
function actionVerb(p){
  const k=interactionKind(p);
  if(k==='npc'||k==='wanderers'){if(!p.prompt)return '말걸기';}
  if(k==='vistas')return '바라보기';
  if(k==='doors'&&!pathOpen(p))return '살피기';
  const last=String(interactionLabel(p)).trim().split(/\s+/).pop()||'';
  if(last.length&&last.length<=5&&/기$/.test(last))return last;
  return k==='doors'?'들어가기':k==='npc'||k==='wanderers'?'말걸기':'살피기';
}
function tryInteract(){
  const p=nearInteraction();if(!p)return;
  const kind=interactionKind(p);
  if(isHomeReplyPoint(p,kind)&&deliverHomeReply())return;
  // 변신한 채로는 등록된 인물만 아이를 몰라보고 손님으로 대한다 (forms.js). 그 밖은 기존 대화
  if((kind==='npc'||kind==='wanderers')&&strangerApplies(p)){strangerTalk(p);return;}
  if(kind==='npc'){learn('met:'+p.id);if(p.peek)peekAt(p.x,p.y??fieldGround());p.talk();}
  else if(kind==='doors'){
    if(!pathOpen(p)){const say=typeof p.blockedSay==='function'?p.blockedSay():p.blockedSay;
      if(say)talk([['너구리',say]]);else toast(p.reason||'아직 지나갈 수 없는 길이다');return;}
    if((p.descend||p.ascend)&&startCrawl(p))return;
    changeZone(p.to,{x:p.toX,y:p.toY,sound:p.sound||'door'});
  }else if(kind==='vistas')startVista(p);
  else if(kind==='stamps')findStamp(p);
  else if(kind==='examines'){
    const texts=Array.isArray(p.text)?p.text:[p.text];
    const visits=G.f.examineVisits||(G.f.examineVisits={}),key=expansionKey(p.id),i=Math.min(visits[key]||0,texts.length-1);
    visits[key]=Math.min(i+1,texts.length-1);
    if(p.peek!==false)peekAt(p.x,p.y??fieldGround());
    talk([[p.who||'너구리',texts[i]]]);
  }else if(kind==='wanderers'){
    learn('met:'+p.id,true);
    if(G.f.wanderersDone?.[expansionKey(p.id)])talk(Array.isArray(p.greeting)?p.greeting:[[p.name||'길손',p.greeting||'길에서 또 만나자.']]);
    else p.talk();
  }
}
function isHomeReplyPoint(p,kind){
  if(p.homeReply||p.rest)return true;
  if(/magpie|kkachi|까치/.test((p.id||'')+' '+(p.name||'')))return true;
  return kind==='npc'&&/^(maru|shelter)$/.test(p.id||'');
}
// 결정 D-10: 길손 (design/data/decisions.csv)
function finishWanderer(id){
  if(CLASSIC)return false;
  const done=G.f.wanderersDone||(G.f.wanderersDone={}),key=expansionKey(id);
  if(done[key])return false;done[key]=true;
  G.f.wandererCount=Object.keys(done).length;return true;
}
const wandererCount=(region)=>Object.keys(G.f.wanderersDone||{}).filter(k=>!region||k.startsWith(region+':')).length;
const stampFound=id=>!!G.f.stampsFound?.[expansionKey(id)];
const stampCount=(region)=>Object.keys(G.f.stampsFound||{}).filter(k=>!region||k.startsWith(region+':')).length;
/* 아빠의 도장 = 너구리 손바닥 자국. 손바닥과 길게 벌어진 다섯 손가락 (네 지역 공용). */
function pawStamp(x,y,c){
  x=Math.round(x);y=Math.round(y);
  R(x-3,y-4,7,3,c);R(x-2,y-1,5,1,c);
  R(x-5,y-7,1,2,c);R(x-3,y-9,1,3,c);R(x-1,y-10,1,4,c);R(x+1,y-10,1,4,c);R(x+3,y-9,1,3,c);
}
function findStamp(s){
  if(CLASSIC||stampFound(s.id))return false;
  // 문구는 notebook.csv의 알게되는키로 연결한다. 위치와 발견 방식만 지역이 정한다.
  const found=G.f.stampsFound||(G.f.stampsFound={});found[expansionKey(s.id)]=true;
  G.f.stampCount=stampCount();G.f.stampsByRegion=G.f.stampsByRegion||{};G.f.stampsByRegion[REG.id]=stampCount(REG.id);
  learn(s.note,true);Vfx.burst(s.x,s.y??fieldGround());Sound.playSfx('stamp_found');
  peekAt(s.x,s.y??fieldGround(),{w:40,h:28,below:6});
  toast('아빠의 손바닥 도장이다. 수첩에 그날 이야기가 보인다.');return true;
}
function drawZoneObjects(){
  for(const p of zoneObjects('wanderers'))if(p.draw)p.draw(p.x-cam,p.y??fieldGround(),G.px<p.x?-1:1);
  for(const k of ['doors','examines','vistas','stamps'])for(const p of zoneObjects(k)){
    if(k==='stamps'&&!stampFound(p.id))continue;
    if(p.draw)p.draw(p.x-cam,p.y??fieldGround());
    if(k==='doors'&&!needMet(p)&&p.drawBlocked)p.drawBlocked(p.x-cam,p.y??fieldGround());
  }
  const z=zoneDef();if(z)for(const side of ['left','right']){
    const p=exitSpec(z.exits?.[side]);
    if(p&&!needMet(p)&&p.drawBlocked)p.drawBlocked((side==='left'?16:z.w-16)-cam,fieldGround());
  }
  drawClimbs();
}
/* 살펴보기 작은 그림: 살펴본 물건 둘레를 주인공 없이 다시 그려 크게 키운 뒤 잠깐 띄운다.
   조사(examines)·도장은 저절로, 지역 대사에서는 peekAt(x,y)로 부른다. {peek:false}면 띄우지 않는다. */
const peekBox=el('div','peek');peekBox.hidden=true;peekBox.setAttribute('aria-hidden','true');
const peekCv=document.createElement('canvas');peekCv.width=64*3;peekCv.height=44*3;peekBox.appendChild(peekCv);
$('stage').appendChild(peekBox);
let peekTimer=0;
function peekAt(x,y=fieldGround(),opts={}){
  if(CLASSIC||!Number.isFinite(x))return;
  const full=document.createElement('canvas');full.width=W;full.height=H;
  const saved=ctx,oldCam=cam;ctx=full.getContext('2d');ctx.imageSmoothingEnabled=false;
  try{drawFieldScene(false);}finally{ctx=saved;cam=oldCam;}
  const cw=opts.w||64,ch=opts.h||44,sx=Math.round(clamp(x-G.cam-cw/2,0,W-cw)),sy=Math.round(clamp(y-ch+(opts.below??10),0,H-ch));
  const pc=peekCv.getContext('2d');pc.imageSmoothingEnabled=false;pc.clearRect(0,0,peekCv.width,peekCv.height);
  pc.drawImage(full,sx,sy,cw,ch,0,0,peekCv.width,peekCv.height);
  peekBox.hidden=false;placePeek();requestAnimationFrame(placePeek);peekBox.classList.remove('show');void peekBox.offsetWidth;peekBox.classList.add('show');
  // 결정 D-56: 화면 가운데에 작게, 짧게. 끝에서 흐려지며 사라진다.
  peekBox.classList.remove('out');clearTimeout(peekTimer);
  const ms=opts.ms||TABLES.TUNING.peek_ms,fade=TABLES.TUNING.peek_fade_ms;
  peekTimer=setTimeout(()=>{peekBox.classList.add('out');peekTimer=setTimeout(hidePeek,fade);},Math.max(0,ms-fade));
}
/* 무대 가운데. 대화창이 무대 아래를 덮고 있으면 덮이지 않은 위쪽 영역의 가운데로 올린다 */
function placePeek(){
  if(peekBox.hidden)return;
  const sr=$('stage').getBoundingClientRect(),d=$('dlg'),dr=d.hidden?null:d.getBoundingClientRect();
  const bottom=dr&&dr.top<sr.bottom&&dr.bottom>sr.top?Math.max(sr.top,dr.top):sr.bottom;
  peekBox.style.top=Math.round((bottom-sr.top)/2)+'px';
}
function hidePeek(){clearTimeout(peekTimer);peekBox.hidden=true;peekBox.classList.remove('show','out');}
const vistaCaption=el('div',null);
vistaCaption.setAttribute('role','status');vistaCaption.hidden=true;
vistaCaption.className='vista-caption';
const vistaThought=el('p','vista-thought'),vistaReturn=el('p','vista-return');
vistaCaption.append(vistaThought,vistaReturn);
$('stage').appendChild(vistaCaption);
Sound.setQuiet(()=>!!vistaMode);   // 결정 D-74: 경치를 바라보는 동안만 효과음을 쉰다
function startVista(p){
  if(paused())return;
  const seen=G.f.vistasSeen||(G.f.vistasSeen={}),key=expansionKey(p.id),first=!seen[key];
  seen[key]=true;if(first&&p.diary)diary('vista:'+key,p.diary);
  closePanels();suppressHeldInputs();G.vx=G.vy=G.attackT=0;
  const hidden=[document.querySelector('.hud'),$('pad'),$('dlg'),$('prompt'),$('toast'),$('bossbar')].map(e=>[e,e.hidden]);
  hidden.forEach(([e])=>e.hidden=true);
  vistaMode={p,tick:0,hidden};vistaThought.textContent=first&&p.thought?p.thought:'';vistaThought.hidden=!vistaThought.textContent;
  vistaReturn.textContent=TOUCH?'화면을 누르면 돌아간다':'아무 키나 누르면 돌아간다';vistaCaption.hidden=false;
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
addEventListener('keydown',e=>{if(vistaMode&&!['m','v'].includes(e.key.toLowerCase())){e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;suppressedKeys.add(e.key.toLowerCase());endVista();}},true);
