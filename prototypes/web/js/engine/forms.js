'use strict';
/* 유씨 집안 잎사귀 변신 (PA-47, design/proposals/leaf-transform.md).
   상태: G.forms(열린 변신 id, squirrel·goat·owl·deer 순서), G.form(지금 모습, ''=너구리).
   - unlockForm(id), setForm(id), hasForm(id), formName(id)
   - 숫자 0(너구리)·1 다람쥐·2 산양·3 수리부엉이·4 고라니. 같은 키를 다시 누르면 너구리로 돌아온다.
   - 대화·미니게임·지도·경치·가방·책 중에는 바뀌지 않는다. 구역·지역을 옮기거나 전투에서 지면 너구리로 돌아온다.
   필드 능력 수치와 손님 교환 횟수는 tuning.csv 의 form_*·stranger_* 줄이다. 전투는 battle.js 가 battle_<id>_* 줄을 읽는다.

   구역 오브젝트 (zone 또는 classic REG 에 둔다)
   - climbs:[{x, top, bottom?, ledge?, draw?(x,y,top)}]: 다람쥐가 ↑를 누르는 동안 오르는 줄기·들보. top 높이에 발판을 두거나
     ledge:true 면 줄기 꼭대기가 다람쥐에게만 작은 디딤이 된다.
   - 문·가장자리 출구의 formPass:'squirrel'|'goat'|'owl'|'deer' (+ formLabel, formNeed()): 원래 need() 가 거짓이어도 그 변신이면 지난다.
     formNeed 는 몸이 아니라 약속으로 남는 조건(예: 뿔이의 허락)을 따로 적을 때 쓴다.
   - digs/pickups 의 form:'<id>': 그 변신일 때만 보이고 캔다·줍는다. cache:true 인 흙더미는 채집 놀이 없이 n 개(기본 2)를 바로 얻는다.
   - listen:true: 고라니일 때 form_deer_listen_range 안에 있으면 화면에 소리 표시를 띄운다 (pickups·digs·examines·stamps·wanderers).

   낯선 손님 (변신한 채 말 걸기): REG.strangers[npc.id] 가 있을 때만 strangerTalk(npc) 로 간다. 없으면 기존 npc.talk().
   REG.strangers={npcId:{line, kin, kinLine, fear:[...], fearLine, timid, timidGift:{item,n,line}, trades:[{give:{},get:{}}],
     swapPool:[...], price, talk?(form,npc)}}. REG.strangerCreditAtNight 가 참이면 수리부엉이 외상은 G.f.night 일 때만 연다.
   지역 파일은 REG.formCheck() 를 두면 필드가 돌 때마다 한 번 불린다 (이야기 표시가 참이 되면 unlockForm 하기 등). */
const FORM_IDS=['squirrel','goat','owl','deer'];
const FORM_NAMES={'':'너구리',squirrel:'다람쥐',goat:'산양',owl:'수리부엉이',deer:'고라니'};
const formName=id=>FORM_NAMES[id||'']??'';
const hasForm=id=>!id||(!!G&&Array.isArray(G.forms)&&G.forms.includes(id));
const formTo=id=>jo(formName(id),'으로','로');
// 결정 D-24: 잎사귀를 불어 변신 (design/data/decisions.csv)
function unlockForm(id){
  if(!G||!FORM_IDS.includes(id))return false;
  if(!Array.isArray(G.forms))G.forms=[];
  if(G.forms.includes(id))return false;
  G.forms.push(id);G.forms.sort((a,b)=>FORM_IDS.indexOf(a)-FORM_IDS.indexOf(b));
  toast('새 변신: '+formName(id));refreshFormUi();
  if(typeof B!=='undefined'&&B)renderBattleForms();
  return true;
}
function formChangeAllowed(){
  if(!G||!G.started||G.ended)return false;
  if(B)return !B.paused&&!(B.handShow>0)&&B.st!=='end'&&B.st!=='giftPlace'&&!B.E.dodge&&!B.noTool&&$('bResult').hidden;
  return !paused()&&!pickupPose&&!inkOn;
}
/* opts.force: 조건 검사 없이 (되돌리기용). opts.quiet: 소리·연출·알림 없이 */
// 결정 D-25: 변신 세부(능력·수치) (design/data/decisions.csv)
function setForm(id,opts={}){
  id=id||'';
  if(!G||!Object.hasOwn(FORM_NAMES,id)||!hasForm(id))return false;
  if(!opts.force&&!formChangeAllowed())return false;
  if((G.form||'')===id)return false;
  G.form=id;formClimb=null;
  if(!opts.quiet){
    Sound.leaf?.(id);
    if(!B)formFx={owner:G,x:G.px,y:G.py-12,t:0};
    toast(id?formTo(id)+' 변했다':'너구리로 돌아왔다');
  }
  refreshFormUi();if(typeof B!=='undefined'&&B)renderBattleForms();
  return true;
}
/* 구역·지역을 옮기거나 전투에서 지면 부른다 */
function revertForm(){if(G&&G.form)setForm('',{force:true,quiet:true});formClimb=null;}
function formIdForKey(k){return k==='0'?'':FORM_IDS[+k-1];}
/* 숫자 키. 처리했으면 true */
function formKey(k){
  if(!['0','1','2','3','4'].includes(k)||!G)return false;
  let id=formIdForKey(k);
  if(!G.forms?.length)return false;
  if(id&&!hasForm(id)){toast('아직 모르는 변신이다');return true;}
  if(id&&id===G.form)id='';
  setForm(id);return true;
}

/* ---------- 필드 능력 ---------- */
let formClimb=null,formGlide=false,formFx=null;
const formMoveMul=()=>G.form==='squirrel'?TABLES.TUNING.form_squirrel_speed:G.form==='deer'?TABLES.TUNING.form_deer_speed:1;
const formJumpMul=()=>G.form==='goat'?TABLES.TUNING.form_goat_jump:1;
const upHeld=()=>!!(keys['arrowup']||keys['w']||touch.up);
const jumpHeld=()=>!!(keys['c']||keys[' ']||keys['arrowup']||keys['w']||touch.jump);
const formVisible=a=>!a||!a.form||a.form===G.form;
function climbNear(){
  if(G.form!=='squirrel')return null;
  return zoneObjects('climbs').find(c=>Math.abs(c.x-G.px)<TABLES.TUNING.form_climb_reach&&G.py>c.top+.5&&G.py<=(c.bottom??fieldGround())+.5)||null;
}
/* 다람쥐의 줄기 꼭대기. 다른 모습에는 디딤이 아니다 */
function formLedges(){
  if(G.form!=='squirrel')return [];
  return zoneObjects('climbs').filter(c=>c.ledge).map(c=>({x:c.x-7,y:c.top,w:14}));
}
/* 오르는 중이면 위치를 여기서 정하고 true 를 돌려준다 (중력·발판 판정을 건너뛴다) */
function stepClimb(ax){
  const t=TABLES.TUNING;
  if(formClimb&&(formClimb.owner!==G||G.form!=='squirrel'))formClimb=null;
  if(!formClimb&&G.form==='squirrel'&&upHeld()&&!(G.attackT>0)){
    const c=climbNear();if(c){formClimb={owner:G,x:c.x,top:c.top,bottom:c.bottom??fieldGround()};jumpQ=false;}
  }
  if(!formClimb)return false;
  if(jumpQ&&!upHeld()){   // C·Space 로 뛰어내린다
    formClimb=null;jumpQ=false;Sound.jump();G.vy=t.field_jump_velocity*.75;G.onGround=false;return false;
  }
  jumpQ=dropQ=false;G.px=formClimb.x;G.vy=0;
  if(ax&&!upHeld()&&!isDown()){formClimb=null;G.onGround=false;return false;}   // 옆으로만 걸으면 놓는다
  const dir=upHeld()?-1:isDown()?1:0;
  G.py+=dir*t.form_climb_speed;G.vx=0;G.onGround=false;
  if(G.py<=formClimb.top){G.py=formClimb.top;formClimb=null;G.onGround=true;Sound.land();}
  else if(G.py>=formClimb.bottom){G.py=formClimb.bottom;formClimb=null;G.onGround=G.py>=fieldGround()-.01;}
  return true;
}
/* 수리부엉이: 떨어지는 동안 점프 키를 누르고 있으면 천천히 내려온다 */
function formFallCap(){
  formGlide=G.form==='owl'&&!G.onGround&&G.vy>0&&jumpHeld();
  if(formGlide)G.vy=Math.min(G.vy,TABLES.TUNING.form_owl_glide_fall);
}
/* 다람쥐 잊은 몫: 채집 놀이 없이 바로 나온다 */
function openCache(d){
  d.done=true;Sound.gather(true);Vfx.gather(d.x,(d.y??fieldGround())-4);
  spawnDrops(d.item,d.n||2,{x:d.x,y:d.y??fieldGround(),zone:d.zone});
  toast('묻어 두고 잊은 몫을 찾았다');
}
function drawCache(d,x){
  const y=d.y??fieldGround();
  if(d.done){R(x-4,y-1,8,1,'#3e2615');return;}
  R(x-6,y-2,12,2,'#6b4423');R(x-4,y-4,8,2,'#7a4b2a');R(x-1,y-6,3,2,'#c9894a');R(x-1,y-7,3,1,'#6b4423');
  R(x-6,y-6,1,3,'#4a2e1a');R(x-4,y-7,1,3,'#4a2e1a');R(x+4,y-6,1,3,'#4a2e1a');   // 긁은 자국
}
function drawClimbs(){
  for(const c of zoneObjects('climbs')){
    const x=Math.round(c.x-cam),bottom=c.bottom??fieldGround();if(x<-20||x>W+20)continue;
    if(c.draw){c.draw(x,bottom,c.top);continue;}
    R(x-2,c.top,4,bottom-c.top,'#6f4a2c');R(x-2,c.top,1,bottom-c.top,'#9a6c42');
    for(let y=c.top+6;y<bottom-2;y+=11){R(x+2,y,2,1,'#4a2e1a');R(x-4,y+5,2,1,'#4a2e1a');}
    R(x-5,c.top-1,10,2,'#7a5232');
  }
}
/* 고라니: 들은 쪽을 화면 가장자리에 작게 표시한다 */
function listenTargets(){
  const out=[...fieldItems('pickups').filter(a=>a.listen&&!a.got),...fieldItems('digs').filter(d=>d.listen&&!d.done)];
  for(const k of ['examines','stamps','wanderers'])for(const p of zoneObjects(k))if(p.listen&&!(k==='stamps'&&stampFound(p.id)))out.push(p);
  return out.filter(p=>Math.abs(p.x-G.px)<TABLES.TUNING.form_deer_listen_range);
}
function drawListenMarks(){
  if(G.form!=='deer'||!G.started||G.ended)return;
  const pulse=Vfx.reducedMotion?1:Math.floor(G.anim/10)%3;
  for(const p of listenTargets()){
    const sx=p.x-cam,y=Math.round(clamp((p.y??fieldGround())-14,24,fieldGround()-8));
    const col='rgba(255,246,214,.9)';
    if(sx>=8&&sx<=W-8){
      for(let i=0;i<=pulse;i++){R(sx-4-i*3,y-2-i,1,4+i*2,col);R(sx+4+i*3,y-2-i,1,4+i*2,col);}
    }else{
      const d=sx<8?-1:1,ex=d<0?4:W-6;
      for(let i=0;i<3;i++){const a=i<=pulse?col:'rgba(255,246,214,.35)',xx=ex-d*i*4;R(xx,y-2,1,1,a);R(xx+d,y-1,1,3,a);R(xx,y+2,1,1,a);}
    }
  }
}

/* ---------- 그림 ---------- */
const LEAF='#5f9a3c',LEAF_LIGHT='#9ccf5a',STRAP='#6e4f22',BUNDLE='#d9a441';
function drawStrapLeaf(ox,oy,f,lx,ly){M(ox,oy,f,lx,ly,2,2,LEAF);M(ox,oy,f,lx+2,ly-1,1,1,LEAF_LIGHT);M(ox,oy,f,lx-1,ly+2,1,1,'#3d6a2b');}
function drawSwipe(ox,oy,f,attackT,r){
  if(Vfx.reducedMotion||!(attackT>4&&attackT<13))return;
  for(let i=0;i<9;i++){const a=-1.3+i*.24;R(ox+f*(4+Math.cos(a)*r),oy+Math.sin(a)*r,1,1,'#ecdcb4');}
}
function drawFormAt(ox,oy,f,st,form,attackT=0,glide=false){
  const K='#2a211b';
  if(form==='squirrel'){
    const C='#b5652d',L='#e9cfa4',D='#7a3f1c',T='#d08a4f';
    M(ox,oy,f,-10,-17,4,13,C);M(ox,oy,f,-13,-23,6,7,C);M(ox,oy,f,-11,-26,6,4,C);M(ox,oy,f,-12,-22,2,4,T);M(ox,oy,f,-9,-25,3,1,T);
    M(ox,oy,f,-7,-13,5,5,BUNDLE);M(ox,oy,f,-6,-12,1,1,'#8a3b2a');M(ox,oy,f,-4,-10,1,1,'#8a3b2a');
    M(ox,oy,f,-4+st,-3,3,3,D);M(ox,oy,f,1-st,-3,3,3,D);
    M(ox,oy,f,-5,-10,9,7,C);M(ox,oy,f,0,-9,3,5,L);
    M(ox,oy,f,-1,-16,8,6,C);M(ox,oy,f,0,-19,2,3,C);M(ox,oy,f,0,-20,1,1,K);M(ox,oy,f,4,-14,1,1,K);M(ox,oy,f,7,-13,1,1,K);M(ox,oy,f,3,-12,4,2,L);
    M(ox,oy,f,3,-7,2,2,D);
    M(ox,oy,f,-3,-11,1,1,STRAP);M(ox,oy,f,-2,-10,1,1,STRAP);M(ox,oy,f,-1,-9,1,1,STRAP);
    drawStrapLeaf(ox,oy,f,-1,-8);drawSwipe(ox,oy-8,f,attackT,8);return;
  }
  if(form==='goat'){
    const C='#ebe5d9',S='#b9b0a0',H='#8a7a5c',D='#3a2f28';
    M(ox,oy,f,-6+st,-7,2,7,S);M(ox,oy,f,-3,-7,2,7,C);M(ox,oy,f,3-st,-7,2,7,S);M(ox,oy,f,6,-7,2,7,C);
    for(const lx of [-6+st,-3,3-st,6])M(ox,oy,f,lx,-1,2,1,D);
    M(ox,oy,f,-9,-15,2,2,C);
    M(ox,oy,f,-8,-14,16,7,C);M(ox,oy,f,-7,-8,14,1,S);
    M(ox,oy,f,-5,-18,7,4,BUNDLE);M(ox,oy,f,-4,-17,1,1,'#8a3b2a');M(ox,oy,f,-1,-16,1,1,'#8a3b2a');
    M(ox,oy,f,6,-20,4,8,C);M(ox,oy,f,7,-23,6,5,C);M(ox,oy,f,12,-21,2,3,C);M(ox,oy,f,13,-21,1,1,K);
    M(ox,oy,f,10,-22,1,1,K);M(ox,oy,f,11,-18,2,3,'#d6cfc2');M(ox,oy,f,5,-22,2,1,S);
    M(ox,oy,f,7,-26,2,3,H);M(ox,oy,f,6,-28,2,2,H);M(ox,oy,f,9,-25,1,2,H);
    M(ox,oy,f,2,-15,1,7,STRAP);drawStrapLeaf(ox,oy,f,2,-12);drawSwipe(ox,oy-10,f,attackT,10);return;
  }
  if(form==='owl'){
    const C='#8a6a45',L='#d8c09a',D='#4a3524',E='#f2b43a';
    if(glide){
      M(ox,oy,f,-17,-19,12,3,D);M(ox,oy,f,-15,-16,9,2,C);M(ox,oy,f,5,-19,12,3,D);M(ox,oy,f,6,-16,9,2,C);
      for(let i=0;i<4;i++){M(ox,oy,f,-16+i*3,-17,1,1,L);M(ox,oy,f,7+i*3,-17,1,1,L);}
    }
    M(ox,oy,f,-9,-16,3,6,BUNDLE);
    M(ox,oy,f,-5,-21,10,19,C);M(ox,oy,f,-2,-17,6,13,L);
    for(const [lx,ly] of [[-1,-14],[2,-12],[0,-9],[3,-7]])M(ox,oy,f,lx,ly,1,1,D);
    M(ox,oy,f,-5,-25,10,5,C);M(ox,oy,f,-5,-27,2,2,C);M(ox,oy,f,3,-27,2,2,C);
    M(ox,oy,f,0,-24,5,4,L);M(ox,oy,f,1,-23,2,2,E);M(ox,oy,f,2,-23,1,1,K);M(ox,oy,f,5,-21,1,2,'#3a2a1a');
    if(!glide)M(ox,oy,f,-6,-19,3,14,D);
    M(ox,oy,f,-3,-2,2,2,'#c9a040');M(ox,oy,f,1+st,-2,2,2,'#c9a040');
    M(ox,oy,f,-4,-18,1,1,STRAP);M(ox,oy,f,-3,-17,1,1,STRAP);M(ox,oy,f,-2,-16,1,1,STRAP);M(ox,oy,f,-1,-15,1,1,STRAP);
    drawStrapLeaf(ox,oy,f,0,-15);drawSwipe(ox,oy-12,f,attackT,9);return;
  }
  if(form==='deer'){
    const C='#b88a55',L='#e3c9a0',D='#8a6440',Tu='#f4efe2';
    M(ox,oy,f,-5+st,-11,2,11,D);M(ox,oy,f,-2,-11,2,11,C);M(ox,oy,f,4-st,-11,2,11,D);M(ox,oy,f,7,-11,2,11,C);
    for(const lx of [-5+st,-2,4-st,7])M(ox,oy,f,lx,-1,2,1,'#3a2a1f');
    M(ox,oy,f,-8,-18,2,2,L);
    M(ox,oy,f,-7,-18,16,7,C);M(ox,oy,f,-5,-12,12,1,L);
    M(ox,oy,f,-3,-22,6,4,BUNDLE);M(ox,oy,f,-2,-21,1,1,'#8a3b2a');
    M(ox,oy,f,7,-24,3,8,C);M(ox,oy,f,8,-27,6,4,C);M(ox,oy,f,13,-26,2,3,C);M(ox,oy,f,14,-26,1,1,K);
    M(ox,oy,f,10,-26,1,1,K);M(ox,oy,f,12,-23,1,2,Tu);
    M(ox,oy,f,5,-29,4,3,C);M(ox,oy,f,4,-30,3,2,C);M(ox,oy,f,5,-29,2,1,L);
    M(ox,oy,f,4,-19,1,8,STRAP);drawStrapLeaf(ox,oy,f,4,-16);drawSwipe(ox,oy-12,f,attackT,10);return;
  }
}
/* 필드·초상·구역 전환에서 함께 쓴다. form 을 주지 않으면 지금 모습 */
function drawPlayerAt(ox,oy,f,st,attackT,tool,pickFrame=0,form=G?.form||''){
  if(!form){drawRaccoonAt(ox,oy,f,st,attackT,tool,pickFrame);return;}
  drawFormAt(ox,oy+(pickFrame===2?2:pickFrame?1:0),f,st,form,attackT,form==='owl'&&formGlide&&!pickFrame);
}
/* 먹물이 번지듯 바뀐다 (잎사귀를 불면) */
function drawFormFx(){
  const fx=formFx;if(!fx)return;
  if(fx.owner!==G||Vfx.reducedMotion){formFx=null;return;}
  const total=TABLES.TUNING.form_fx_frames,t=fx.t/total,x=Math.round(fx.x-cam),y=Math.round(fx.y);
  ctx.save();ctx.globalAlpha=(1-t)*.75;ctx.fillStyle='#1d1814';
  for(let i=0;i<9;i++){const a=i*.7+fx.x,r=4+t*16+(i%3)*2;ctx.beginPath();ctx.arc(x+Math.cos(a)*r,y+Math.sin(a)*r*.7,Math.max(1,3.4-t*2.6),0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1-t;R(x+8+Math.round(t*10),y-8-Math.round(t*8),2,2,LEAF);R(x+12+Math.round(t*12),y-12-Math.round(t*10),1,3,'#efe3c8');
  ctx.restore();
  if(++fx.t>=total)formFx=null;
}
/* 전투 손 (수묵). battle.js drawPaw 의 1.6배 좌표 안에서 그린다 */
function drawFormPaw(c,form){
  c.save();
  if(form==='squirrel'){   // 작고 재빠른 다람쥐 손
    blob(c,5,9,4.5,4.2,'#6a3a1e');
    c.scale(.82,.86);
    blob(c,0,3,7.5,6.6,'#8a4a22');
    for(let i=0;i<4;i++){blob(c,-5.4+i*3.6,-4.6+(i===0||i===3?1.2:0),1.7,3.8,'#8a4a22');brush(c,[[-5.4+i*3.6,-8+(i===0||i===3?1.2:0)],[-5+i*3.6,-10+(i===0||i===3?1.2:0)]],1,INK);}
    blob(c,0.5,4,3.4,2.6,'#d9b08a');
    c.strokeStyle=INK;c.lineWidth=1.2;c.beginPath();c.ellipse(0,3,7.5,6.6,0,0,Math.PI*2);c.stroke();
  }else if(form==='goat'){   // 굳은 산양 발굽, 흰 털 손목
    blob(c,0,10,7.5,5,'#cbc2b0');c.strokeStyle=INK;c.lineWidth=1;c.beginPath();c.ellipse(0,10,7.5,5,0,0,Math.PI);c.stroke();brush(c,[[-6,12],[0,14],[6,12]],1.2,INK);
    blob(c,-6.5,6,1.8,1.6,'#3a2f28');blob(c,6.5,6,1.8,1.6,'#3a2f28');
    blob(c,-3.8,0,4.6,7.6,'#2e2621');blob(c,3.8,0,4.6,7.6,'#2e2621');
    brush(c,[[-6.5,-4],[-4,-7],[-1.5,-4]],1.2,'#8a7d70');brush(c,[[1.5,-4],[4,-7],[6.5,-4]],1.2,'#8a7d70');
    brush(c,[[0,-6],[0,7]],1.4,'#efe3c8');
  }else if(form==='owl'){   // 깃 달린 수리부엉이 손, 노란 발가락과 발톱
    blob(c,7,11,6,5.5,'#5a4430');
    for(let i=-2;i<=2;i++){c.save();c.translate(0,4);c.rotate(i*.32);blob(c,0,-9,2.6,8.5,i%2?'#8a6a45':'#6f5436');brush(c,[[0,-14],[0,-4]],.9,'#d8c09a',.8);c.restore();}
    blob(c,0,4,6.5,5,'#d8c09a');for(let i=-1;i<=1;i++)brush(c,[[i*3,2],[i*3,6]],.8,'#6f5436');
    for(let i=-1;i<=1;i++){brush(c,[[i*3.5,7],[i*4.5,10.5]],2,'#c9a040');brush(c,[[i*4.5,10.5],[i*5.5,12.5],[i*5.8+(i||.4),11.5]],1.1,INK);}
  }else if(form==='deer'){   // 긴 고라니 다리, 갈라진 작은 발굽
    brush(c,[[3,16],[1.5,8],[0,-1]],5,'#b88a55');brush(c,[[3.5,14],[2,8]],1.4,'#e3c9a0');
    brush(c,[[-2,1],[2,1]],2,'#f4efe2');
    blob(c,-2.2,-5,2.4,4.2,'#3a2a1f');blob(c,2.2,-5,2.4,4.2,'#3a2a1f');
    brush(c,[[0,-8.5],[0,-1.5]],1,'#efe3c8');
  }
  c.restore();
}

/* ---------- 낯선 손님 ---------- */
const strangerEntry=id=>{const e=REG?.strangers?.[id];return e&&typeof e==='object'&&id!=='_default'&&id!=='_ids'?e:null;};
/* 변신한 채 말을 걸면 등록된 인물만 손님으로 대한다. 없으면 기존 대화 */
const strangerApplies=p=>!!(G?.form&&p&&strangerEntry(p.id));
const strangerKey=id=>REG.id+':'+id;
const strangerUsed=id=>(G.f.strangerTrades||{})[strangerKey(id)]||0;
function strangerCount(id){const t=G.f.strangerTrades||(G.f.strangerTrades={});t[strangerKey(id)]=(t[strangerKey(id)]||0)+1;}
const itemsText=map=>Object.entries(map||{}).map(([id,n])=>(ITEMS[id]?.n||id)+(n>1?' '+n:'')).join(', ');
const priced=(e,give)=>Object.fromEntries(Object.entries(give||{}).map(([id,n])=>[id,n*(e.price||1)]));
const hasAll=map=>Object.entries(map).every(([id,n])=>has(id,n));
const validItems=map=>map&&typeof map==='object'&&Object.entries(map).length>0&&Object.entries(map).every(([id,n])=>ITEMS[id]&&Number.isSafeInteger(n)&&n>0);
/* 진행에 필요한 몫은 건네지 않는다 (선물과 같은 규칙) */
function strangerKeepsProgress(give){
  const after={...G.inv};for(const [id,n] of Object.entries(give)){after[id]=(after[id]||0)-n;if(after[id]<=0)delete after[id];}
  if(progressShortage(after)>progressShortage(G.inv)){toast('이건 아직 쓸 데가 있어. 다른 걸 건네자.');return false;}
  return true;
}
const strangerDebts=()=>G.f.strangerDebt||(G.f.strangerDebt={});
const regionDebt=()=>Object.entries(G.f.strangerDebt||{}).filter(([k])=>k.startsWith(REG.id+':'));
const creditOpen=()=>REG.strangerCreditAtNight?!!G.f.night:true;
function strangerTalk(npc){
  const e=strangerEntry(npc?.id);if(!e){npc?.talk?.();return;}
  const form=G.form,who=npc.name||'손님';
  if(typeof e.talk==='function'){e.talk(form,npc);return;}
  const lines=[];if(e.line)lines.push([who,e.line]);
  if(Array.isArray(e.fear)&&e.fear.includes(form)){
    if(e.fearLine)lines.push([who,e.fearLine]);
    if(lines.length)talk(lines);else toast(jo(who,'이','가')+' 몸을 숨겼다');
    return;
  }
  if(e.kin===form&&e.kinLine)lines.push([who,e.kinLine]);
  const gifts=G.f.strangerGifts||(G.f.strangerGifts={}),gift=e.timidGift;
  if(form==='deer'&&e.timid&&gift&&ITEMS[gift.item]&&!gifts[strangerKey(npc.id)]){
    gifts[strangerKey(npc.id)]=true;if(gift.line)lines.push([who,gift.line]);
    addItem(gift.item,Number.isSafeInteger(gift.n)&&gift.n>0?gift.n:1);
  }
  const menu=strangerMenu(npc,e);
  if(!menu.length){if(lines.length)talk(lines);return;}
  menu.push({t:'그만두기',go:null});
  if(lines.length){const last=lines[lines.length-1];lines[lines.length-1]=[last[0],last[1],menu];}
  else lines.push([who,'…',menu]);
  talk(lines);
}
function strangerMenu(npc,e){
  const form=G.form,out=[],limit=TABLES.TUNING.stranger_trade_limit,left=strangerUsed(npc.id)<limit;
  const trades=(Array.isArray(e.trades)?e.trades:[]).filter(t=>validItems(t?.give)&&validItems(t?.get));
  const key=strangerKey(npc.id),debt=(G.f.strangerDebt||{})[key];
  if(form==='owl'&&debt&&validItems(debt.give))out.push({t:'외상 갚기 · '+itemsText(debt.give),go:()=>repayDebt(npc,key)});
  if(left){
    for(const t of trades){const give=priced(e,t.give);
      out.push({t:itemsText(give)+' → '+itemsText(t.get),go:()=>strangerTrade(npc,give,t.get)});}
    if(form==='owl'&&creditOpen()&&!regionDebt().length)
      for(const t of trades){const give=priced(e,t.give);
        out.push({t:'외상으로 받기 · '+itemsText(t.get),go:()=>takeCredit(npc,key,give,t.get)});}
    if(form==='goat'&&swapCandidates(e).length)out.push({t:'같은 품 맞바꾸기',go:()=>swapMenu(npc,e)});
  }else if(trades.length||(form==='goat'&&e.swapPool?.length))out.push({t:'(이번 고을 손님 교환은 다 했다)',go:null});
  return out;
}
function strangerTrade(npc,give,get){
  if(!hasAll(give)){toast('가진 것이 모자라다');return;}
  if(!strangerKeepsProgress(give))return;
  for(const [id,n] of Object.entries(give))takeItem(id,n);
  for(const [id,n] of Object.entries(get))addItem(id,n);
  Sound.exchange();strangerCount(npc.id);
}
function takeCredit(npc,key,give,get){
  if(regionDebt().length||!creditOpen())return;
  strangerDebts()[key]={npc:npc.id,name:npc.name||npc.id,region:REG.id,give};
  for(const [id,n] of Object.entries(get))addItem(id,n);
  Sound.exchange();strangerCount(npc.id);toast('장부에 외상을 적었다');
  if(open('notebook'))renderBook();
}
function repayDebt(npc,key){
  const d=(G.f.strangerDebt||{})[key];if(!d)return;
  if(!hasAll(d.give)){toast('갚을 것이 모자라다');return;}
  if(!strangerKeepsProgress(d.give))return;
  for(const [id,n] of Object.entries(d.give))takeItem(id,n);
  delete G.f.strangerDebt[key];Sound.exchange();toast('외상을 갚았다');
  if(open('notebook'))renderBook();
}
/* 산양: 같은 품(ITEMS[id].r)끼리 하나 대 하나 */
function swapTargets(e,id){return (Array.isArray(e.swapPool)?e.swapPool:[]).filter(p=>p!==id&&ITEMS[p]&&ITEMS[id]&&ITEMS[p].r===ITEMS[id].r);}
function swapCandidates(e){return Object.keys(G.inv).filter(id=>G.inv[id]>0&&swapTargets(e,id).length);}
function swapMenu(npc,e){
  const who=npc.name||'손님',ids=swapCandidates(e).slice(0,6);
  if(!ids.length){toast('맞바꿀 물건이 없다');return;}
  talk([[who,'…',[...ids.map(id=>({t:ITEMS[id].n+' ('+RAR[ITEMS[id].r]+')',go:()=>{
    const targets=swapTargets(e,id);
    if(targets.length===1){doSwap(npc,id,targets[0]);return;}
    talk([[who,'…',[...targets.slice(0,6).map(p=>({t:ITEMS[id].n+' → '+ITEMS[p].n,go:()=>doSwap(npc,id,p)})),{t:'그만두기',go:null}]]]);
  }})),{t:'그만두기',go:null}]]]);
}
function doSwap(npc,id,target){
  if(!has(id)||strangerUsed(npc.id)>=TABLES.TUNING.stranger_trade_limit)return;
  if(!strangerKeepsProgress({[id]:1}))return;
  takeItem(id,1);addItem(target,1);Sound.exchange();strangerCount(npc.id);
}
/* 책의 물품 장부에 남는 외상 */
function strangerDebtRows(){
  return Object.values(G?.f?.strangerDebt||{}).filter(d=>d&&validItems(d.give)).map(d=>({
    who:'외상 · '+(REGIONS[d.region]?.name||'')+' · '+(d.name||npcName(d.npc)),text:'갚을 것: '+itemsText(d.give)}));
}

/* ---------- 화면: HUD 표시, 휴대폰 잎사귀 버튼 ---------- */
const formRing=el('div','form-ring');formRing.id='formRing';formRing.hidden=true;formRing.setAttribute('aria-label','변신 고르기');
const padLeaf=$('padLeaf');
if(padLeaf){padLeaf.parentElement.appendChild(formRing);
  padLeaf.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();
    if(formRing.hidden&&!formChangeAllowed())return;formRing.hidden=!formRing.hidden;if(!formRing.hidden)renderFormRing();});
  padLeaf.addEventListener('contextmenu',e=>e.preventDefault());}
addEventListener('pointerdown',e=>{if(!formRing.hidden&&!formRing.contains(e.target)&&e.target!==padLeaf)formRing.hidden=true;},true);
function renderFormRing(){
  formRing.innerHTML='';
  for(const id of ['',...(G.forms||[])]){
    const b=el('button','form-pick',formName(id));b.type='button';b.dataset.form=id;b.setAttribute('aria-pressed',String((G.form||'')===id));
    b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();setForm(id);formRing.hidden=true;});
    formRing.appendChild(b);
  }
}
function refreshFormUi(){
  if(!G)return;
  const label=$('formLabel');
  if(label){label.hidden=!G.forms?.length;label.textContent='';label.append(el('span','form-leaf'),document.createTextNode(formName(G.form)));}
  if(padLeaf)padLeaf.hidden=!G.forms?.length;
  if(!formRing.hidden)renderFormRing();
}
