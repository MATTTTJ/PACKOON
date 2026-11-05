'use strict';
/* 유씨 집안 잎사귀 변신 (PA-47, design/proposals/leaf-transform.md).
   상태: G.forms(열린 변신 id, squirrel·goat·owl·deer 순서), G.form(지금 모습, ''=너구리).
   - unlockForm(id), setForm(id), hasForm(id), formName(id)
   - 숫자 0(너구리)·1 다람쥐·2 산양·3 수리부엉이·4 고라니. 같은 키를 다시 누르면 너구리로 돌아온다.
   - 대화·미니게임·지도·경치·가방·책 중에는 바뀌지 않는다. 전투에서 지면 너구리로 돌아온다. 구역·마을을 옮겨도 그대로다(결정 D-722).
   필드 능력 수치와 손님 교환 횟수는 tuning.csv 의 form_*·stranger_* 줄이다. 전투는 battle.js 가 battle_<id>_* 줄을 읽는다.

   구역 오브젝트 (zone 또는 classic REG 에 둔다)
   - climbs:[{x, top, bottom?, ledge?, draw?(x,y,top)}]: 다람쥐가 ↑를 누르는 동안 오르는 줄기·들보. top 높이에 발판을 두거나
     ledge:true 면 줄기 꼭대기가 다람쥐에게만 작은 디딤이 된다.
   - 문·가장자리 출구의 formPass:'squirrel'|'goat'|'owl'|'deer' (+ formLabel, formNeed()): 원래 need() 가 거짓이어도 그 변신이면 지난다.
     formNeed 는 몸이 아니라 약속으로 남는 조건(예: 뿔영감의 허락)을 따로 적을 때 쓴다.
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
  // 결정 D-173: 새 변신은 알림 카드(대화가 끝난 뒤)로 확실히 알리고, 처음 써 볼 때까지 그 변신으로만 갈 수 있는 자리를 살짝 빛낸다.
  const hint=G.f.formHintIds||(G.f.formHintIds=[]);if(!hint.includes(id))hint.push(id);
  (G.f.formIntroQ||(G.f.formIntroQ=[])).push(id);
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
  // 결정 D-173: 플레이어가 한 번 골라 써 봤으면 빛내기를 그친다 (이야기 연출로 바뀐 것{scripted:true}은 세지 않는다)
  if(id&&!opts.scripted&&G.f.formHintIds?.includes(id))G.f.formHintIds=G.f.formHintIds.filter(x=>x!==id);
  // 결정 D-191: 변신하거나 풀릴 때 글 알림('…로 변했다', '너구리로 돌아왔다')은 띄우지 않는다. 잎 소리와 먹 번짐만 남긴다.
  if(!opts.quiet){
    Sound.leaf?.(id);
    if(!B)formFx={owner:G,x:G.px,y:G.py-12,t:0};
  }
  formIntroHide();   // 결정 D-192: 변신하면 새 변신 카드는 바로 닫힌다
  refreshFormUi();if(typeof B!=='undefined'&&B)renderBattleForms();
  return true;
}
/* 전투에서 지면 부른다 (구역·마을을 옮길 때는 부르지 않는다, D-722) */
function revertForm(){if(G&&G.form)setForm('',{force:true,quiet:true});formClimb=null;formIntroHide();}
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
// 결정 D-94: 변신별 구르기 (roll.js). roll: 되나 / speed: field_move_speed에 곱하는 tuning 줄 / r: 공 반지름(px) / say: 못 구를 때 처음 한 번 하는 혼잣말
const ROLL_FORMS={
  '':{roll:true,speed:'roll_speed',r:8},
  squirrel:{roll:true,speed:'roll_squirrel_speed',r:6},
  goat:{roll:false,say:'뿔이 걸려서 몸이 안 말려. 산양으론 못 구르겠어.'},
  owl:{roll:false,say:'날개를 접어도 공처럼은 안 되네.'},
  deer:{roll:false,say:'다리가 길어서 몸을 둥글게 말 수가 없어.'}
};
let formClimb=null,formGlide=false,formFx=null;
/* 결정 D-175: 걷는 동안의 네 박자 걸음(-1이면 서 있다). 필드 주인공을 그릴 때만 field.js drawRaccoon 이 정하고, 그린 뒤 -1로 되돌린다 */
let formGait=-1;
/* 결정 D-262: 네발 변신이 공중에 있을 때의 다리 (0 땅, 1 뛰어오름: 네 다리를 접는다, 2 내려옴: 앞다리를 앞아래로 뻗고 뒷다리는 뒤로).
   formGait 처럼 field.js drawRaccoon·drawCrawl 이 그리기 직전에 정하고 그린 뒤 0으로 되돌린다. 산양·고라니가 쓴다. */
let formAir=0;
const formMoveMul=()=>G.form==='squirrel'?TABLES.TUNING.form_squirrel_speed:G.form==='deer'?TABLES.TUNING.form_deer_speed:1;
const formJumpMul=()=>G.form==='goat'?TABLES.TUNING.form_goat_jump:1;
const upHeld=()=>!!(keys['arrowup']||keys['w']||touch.up);
const jumpHeld=()=>!!(keys['c']||keys[' ']||keys['arrowup']||keys['w']||touch.jump);
// 결정 D-665: hidden:'owl' 인 물건은 수리부엉이가 느껴 드러내기(found) 전에는 어떤 모습에게도 보이지 않는다
const formVisible=a=>!a||((!a.form||a.form===G.form)&&(!a.hidden||!!a.found));
/* 결정 D-665: 수리부엉이는 다른 모습으로는 못 보는 것을 느낀다 (사용자 피드백 2026-11-05).
   owlSenses() 는 지금 그런 눈을 가졌는지(수리부엉이 모습인지), owlSenses(x) 는 그 눈으로 x 를 느낄 만큼 가까운지.
   다른 코드(숨은 물건, 보스의 모습 드러내기 등)가 이 함수 하나로 판정한다. range 를 주지 않으면 tuning.csv form_owl_sense_range */
function owlSenses(x,range){
  if(!G||G.form!=='owl')return false;
  if(x==null)return true;
  return Math.abs(G.px-x)<=(range??TABLES.TUNING.form_owl_sense_range);
}
/* 필드가 돌 때마다: 수리부엉이가 숨은 물건 곁을 지나면 무언가 느껴진다는 알림과 함께 드러난다 (한 번 드러난 것은 그대로 보인다) */
function owlSenseTick(){
  if(!owlSenses()||paused())return;
  for(const a of fieldItems('pickups')){
    if(a.hidden!=='owl'||a.found||a.got||!owlSenses(a.x))continue;
    a.found=true;learn('rule:owl_sense');
    Vfx.burst(a.x,(a.y??fieldGround())-6);Sound.leaf?.('owl');
    const n=ITEMS[a.item]?.n||'무언가';
    think('…뭔가 느껴진다. 숨어 있던 '+jo(n,'이','가')+' 보인다.');
  }
}
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
/* 결정 D-720: 수리부엉이는 공중에서 점프를 한 번 더 누르면 날개를 한 번 쳐 살짝 더 떠오른다 (사용자 피드백 2026-11-05 "약간 낮은 턱은 날아서 올라갈 수 있게").
   땅에 닿을 때까지 form_owl_flaps 번. 날갯짓 높이는 form_owl_flap_velocity 로, 산양만 오르는 높은 턱(약 80px)에는 못 미친다(바닥 점프 꼭대기에서 쳐도 약 65px). */
let owlFlaps=0,owlFlapT=0;
function owlFlap(){
  const T=TABLES.TUNING;
  if(!G||G.form!=='owl'||G.onGround||G.dropHang>0||owlFlaps>=T.form_owl_flaps)return false;
  if(G.vy<=-T.form_owl_flap_velocity)return false;   // 아직 날갯짓보다 빠르게 오르는 중이면 아끼고 넘긴다
  owlFlaps++;owlFlapT=12;G.vy=-T.form_owl_flap_velocity;
  Sound.jump();Vfx.burst?.(G.px,G.py-8);
  return true;
}
/* 수리부엉이: 떨어지는 동안 점프 키를 누르고 있으면 천천히 내려온다 */
function formFallCap(){
  if(G.onGround||G.form!=='owl')owlFlaps=0;
  if(owlFlapT>0)owlFlapT--;
  formGlide=G.form==='owl'&&!G.onGround&&(owlFlapT>0||G.vy>0&&jumpHeld());
  if(owlFlapT>0)return;
  if(formGlide)G.vy=Math.min(G.vy,TABLES.TUNING.form_owl_glide_fall);
}
/* 다람쥐 잊은 몫: 채집 놀이 없이 바로 나온다 */
function openCache(d){
  d.done=true;Sound.gather(true);Vfx.gather(d.x,(d.y??fieldGround())-4);learn('rule:squirrel_cache');
  spawnDrops(d.item,d.n||2,{x:d.x,y:d.y??fieldGround(),zone:d.zone});
  think('묻어 두고 잊은 몫을 찾았다!');
}
function drawCache(d,x){
  const y=d.y??fieldGround();
  if(d.done){R(x-4,y-1,8,1,'#3e2615');return;}
  R(x-6,y-2,12,2,'#6b4423');R(x-4,y-4,8,2,'#7a4b2a');R(x-1,y-6,3,2,'#c9894a');R(x-1,y-7,3,1,'#6b4423');
  R(x-6,y-6,1,3,'#4a2e1a');R(x-4,y-7,1,3,'#4a2e1a');R(x+4,y-6,1,3,'#4a2e1a');   // 긁은 자국
}
/* 결정 D-80: 다람쥐가 아닌 모습에서 보이는 다람쥐 몫 자리. 흙을 판 흔적 없이 발톱 긁은 줄 셋만 남는다. */
function drawCacheHint(d,x){
  const y=d.y??fieldGround();x=Math.round(x);
  R(x-7,y-2,14,2,'rgba(110,70,40,.55)');   // 살짝 헤집은 흙
  for(const [dx,h] of [[-5,6],[-1,7],[3,6]]){R(x+dx,y-h,2,h-1,'#4a2e1a');R(x+dx,y-h,1,1,'#7a4b2a');}   // 발톱 긁은 줄 셋
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
    /* 결정 D-175: 산양은 대각선 두 다리씩 번갈아 든다(먼 뒷다리+가까운 앞다리 / 가까운 뒷다리+먼 앞다리).
       든 다리는 무릎을 굽혀 발굽이 앞으로 나오고, 다리를 드는 박자에 몸이 한 칸 떠오르며, 디디는 박자에 고개가 끄덕인다.
       걷지 않을 때(formGait<0)는 st 하나로 예전처럼 두 다리만 엇갈린다(초상·기어 내려가기 등). */
    const g=formAir?-1:formGait,lift=g===0?0:g===2?1:-1,bob=lift>=0?-1:0,nod=g===1||g===3?1:formAir===2?1:0;
    const legs=g<0?[[-6+st,S,-1],[-3,C,-1],[3-st,S,-1],[6,C,-1]]:[[-6,S,0],[-3,C,1],[3,S,1],[6,C,0]];
    if(formAir===1)for(const [lx,col] of legs){M(ox,oy,f,lx,-8,2,4,col);M(ox,oy,f,lx+(lx>0?1:-1),-5,2,2,col);M(ox,oy,f,lx+(lx>0?1:-1),-4,2,1,D);}   // 결정 D-262: 뛰어오를 때 네 다리를 접는다
    else if(formAir===2)for(const [lx,col] of legs){   // 결정 D-262: 내려올 때 앞다리는 디딜 곳으로 뻗고 뒷다리는 뒤로 민다
      if(lx>0){M(ox,oy,f,lx,-8,2,4,col);M(ox,oy,f,lx+1,-5,2,4,col);M(ox,oy,f,lx+1,-1,2,1,D);}
      else{M(ox,oy,f,lx,-8,2,3,col);M(ox,oy,f,lx-1,-6,2,3,col);M(ox,oy,f,lx-2,-4,2,2,col);M(ox,oy,f,lx-2,-3,2,1,D);}
    }
    else for(const [lx,col,pair] of legs){
      if(pair>=0&&pair===lift){M(ox,oy,f,lx,-8,2,4,col);M(ox,oy,f,lx+1,-5,2,2,col);M(ox,oy,f,lx+2,-3,2,1,D);}   // 든 다리: 무릎을 굽혀 앞으로
      else{M(ox,oy,f,lx,-8,2,8,col);M(ox,oy,f,lx,-1,2,1,D);}
    }
    const by=oy+bob,hy=by+nod;
    M(ox,by,f,-9,-15+(g>=0&&lift<0?1:0),2,2,C);                                            // 꼬리: 디딜 때 살짝 처진다
    M(ox,by,f,-8,-14,16,7,C);M(ox,by,f,-7,-8,14,1,S);
    M(ox,by,f,-5,-18,7,4,BUNDLE);M(ox,by,f,-4,-17,1,1,'#8a3b2a');M(ox,by,f,-1,-16,1,1,'#8a3b2a');
    M(ox,by,f,6,-20,4,8,C);M(ox,hy,f,7,-23,6,5,C);M(ox,hy,f,12,-21,2,3,C);M(ox,hy,f,13,-21,1,1,K);
    M(ox,hy,f,10,-22,1,1,K);M(ox,hy,f,11,-18,2,3,'#d6cfc2');M(ox,hy,f,5,-22,2,1,S);
    M(ox,hy,f,7,-26,2,3,H);M(ox,hy,f,6,-28,2,2,H);M(ox,hy,f,9,-25,1,2,H);
    M(ox,by,f,2,-15,1,7,STRAP);drawStrapLeaf(ox,by,f,2,-12);drawSwipe(ox,by-10,f,attackT,10);return;
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
    if(formAir===1)for(const [lx,col] of [[-5,D],[-2,C],[4,D],[7,C]]){const k=lx>0?1:-1;M(ox,oy,f,lx,-11,2,5,col);M(ox,oy,f,lx+k,-7,2,3,col);M(ox,oy,f,lx+k*2,-5,2,1,'#3a2a1f');}   // 결정 D-262: 뛰어오를 때 다리를 접는다
    else if(formAir===2)for(const [lx,col] of [[-5,D],[-2,C],[4,D],[7,C]]){   // 결정 D-262: 내려올 때 앞다리를 앞아래로 뻗고 뒷다리는 뒤로 길게
      if(lx>0){M(ox,oy,f,lx,-11,2,5,col);M(ox,oy,f,lx+1,-6,2,5,col);M(ox,oy,f,lx+1,-1,2,1,'#3a2a1f');}
      else{M(ox,oy,f,lx,-11,2,4,col);M(ox,oy,f,lx-1,-8,2,3,col);M(ox,oy,f,lx-2,-5,2,3,col);M(ox,oy,f,lx-3,-3,2,1,'#3a2a1f');}
    }
    else{M(ox,oy,f,-5+st,-11,2,11,D);M(ox,oy,f,-2,-11,2,11,C);M(ox,oy,f,4-st,-11,2,11,D);M(ox,oy,f,7,-11,2,11,C);
    for(const lx of [-5+st,-2,4-st,7])M(ox,oy,f,lx,-1,2,1,'#3a2a1f');}
    M(ox,oy,f,-8,-18,2,2,L);
    M(ox,oy,f,-7,-18,16,7,C);M(ox,oy,f,-5,-12,12,1,L);
    M(ox,oy,f,-3,-22,6,4,BUNDLE);M(ox,oy,f,-2,-21,1,1,'#8a3b2a');
    M(ox,oy,f,7,-24,3,8,C);M(ox,oy,f,8,-27,6,4,C);M(ox,oy,f,13,-26,2,3,C);M(ox,oy,f,14,-26,1,1,K);
    M(ox,oy,f,10,-26,1,1,K);M(ox,oy,f,12,-23,1,2,Tu);
    M(ox,oy,f,5,-29,4,3,C);M(ox,oy,f,4,-30,3,2,C);M(ox,oy,f,5,-29,2,1,L);
    M(ox,oy,f,4,-19,1,8,STRAP);drawStrapLeaf(ox,oy,f,4,-16);drawSwipe(ox,oy-12,f,attackT,10);return;
  }
}
/* 결정 D-400 (사용자 피드백 2026-11-03): 오르내릴 때 등을 보이는 것은 두 발로도 다닐 수 있는 동물뿐이다.
   너구리·다람쥐·수리부엉이는 등을 보이고, 산양·고라니처럼 네 발로만 다니는 짐승은 앞을 본 채 머리를 숙여 디딘다(drawTiltedForm).
   결정 D-401: 수리부엉이는 땅에서 두 발로 걷는 새라 기어 내려가는 문에서는 등을 보인다. 발판에서 빠질 때는 날개를 펴고 내려앉는다(D-262 그대로).
   발판 턱을 붙잡고 미끄러지는 것(G.dropBack)은 앞발로 붙잡을 수 있는 너구리·다람쥐만 한다. */
const FORM_UPRIGHT={'':true,squirrel:true,owl:true};
const formShowsBack=form=>!!FORM_UPRIGHT[form||''];
const formClings=form=>!form||form==='squirrel';
/* 변신 모습의 뒷모습(결정 D-114 그림을 D-400으로 되살림). (ox,oy)는 발 아래 가운데, phase(0·1)마다 팔다리를 번갈아 디딘다. */
function drawFormBackAt(ox,oy,phase,form){
  ox=Math.round(ox);oy=Math.round(oy);
  const up=phase?1:-1;
  const P=(x,y,w,h,c)=>R(ox+x,oy+y,w,h,c);
  if(form==='squirrel'){
    // 결정 D-122: 줄기를 탈 때 뒷모습이 작아 안 보였다. 키우고 어두운 테두리를 두른다.
    // 결정 D-189: 꼬리가 몸보다 커서 어색했다(사용자 피드백 39). 앞모습(drawFormAt) 몸집에 맞춰 1.2배로 줄이고,
    //   꼬리는 몸 한쪽 옆으로 붙여 귀 높이까지만 올린다(몸통 폭의 절반쯤, 끝만 살짝 바깥으로 말린다).
    const C='#b5652d',D='#7a3f1c',T='#d08a4f',TL='#f0b878',O='#2a1a10',k=1.2;
    const Q=(x,y,w,h,c)=>P(Math.round(x*k),Math.round(y*k),Math.max(1,Math.round(w*k)),Math.max(1,Math.round(h*k)),c);
    // 결정 D-400: 머리·귀가 몸 테두리에 묻혀 상자처럼 보였다. 몸통·머리·귀를 따로 둘러 실루엣이 다람쥐로 읽히게 한다.
    Q(-9,-17,4,14,O);Q(-5,-12,10,11,O);Q(-4,-18,8,7,O);Q(-4,-21,3,4,O);Q(1,-21,3,4,O);   // 꼬리·몸·머리·귀 테두리(먼저 깐다)
    Q(-8,-16,3,12,T);Q(-9,-17,2,2,T);Q(-7,-15,1,9,TL);                                    // 몸 왼쪽에 붙은 꼬리, 끝은 바깥으로
    Q(-4,up<0?-2:-3,3,up<0?2:1,D);Q(1,up>0?-2:-3,3,up>0?2:1,D);                           // 뒷발: 한쪽은 디디고 한쪽은 올린다
    Q(-4,-11,8,9,C);Q(-1,-11,2,9,D);                                                      // 몸통과 등줄기
    Q(-3,-17,6,5,C);Q(-3,-20,1,3,C);Q(2,-20,1,3,C);Q(-3,-21,1,1,D);Q(2,-21,1,1,D);        // 뒤통수·귀·귀 끝 털
    Q(-3,-11,6,4,BUNDLE);Q(-1,-10,2,1,'#8a3b2a');                                         // 등 보따리
    Q(up<0?-6:4,-19,2,7,D);Q(up<0?4:-6,-14,2,4,D);                                        // 앞발: 한쪽은 위로 뻗어 잡는다
    return;
  }
  if(form==='owl'){   // 접은 날개와 등 보따리, 두 발로 한 칸씩 디딘다
    const C='#8a6a45',D='#4a3524',E='#c9a040';
    P(-5,-21,10,19,C);P(-5,-19,2,15,D);P(3,-19,2,15,D);P(-2,-6,4,4,D);
    P(-3,-16,6,4,BUNDLE);P(-2,-15,1,1,'#8a3b2a');
    P(-5,-25,10,5,C);P(-5,-27,2,2,C);P(3,-27,2,2,C);
    P(-3,up<0?-2:-3,2,2,E);P(1,up>0?-2:-3,2,2,E);
    return;
  }
  drawFormAt(ox,oy,1,phase,form);
}
/* 결정 D-262: 비탈을 디뎌 내려가는 네발 모습. 옆모습을 한 번 그려 세로 줄마다 기울기만큼 내려 붙인다(돌리지 않아 점이 흐려지지 않는다).
   slope>0이면 오른쪽이 내려간다. (ox,oy)는 발 아래 가운데. */
const tiltBuf=document.createElement('canvas');tiltBuf.width=48;tiltBuf.height=44;
function drawTiltedForm(ox,oy,slope,fn){
  const g=tiltBuf.getContext('2d');g.clearRect(0,0,48,44);
  const saved=ctx;ctx=g;try{fn(24,40);}finally{ctx=saved;}
  ox=Math.round(ox);oy=Math.round(oy);
  for(let x=0;x<48;x++){const dy=Math.round((x-24)*slope);ctx.drawImage(tiltBuf,x,0,1,44,ox-24+x,oy-40+dy,1,44);}
}
/* 필드·초상·구역 전환에서 함께 쓴다. form 을 주지 않으면 지금 모습 */
function drawPlayerAt(ox,oy,f,st,attackT,tool,pickFrame=0,form=G?.form||''){
  if(!form){drawRaccoonAt(ox,oy,f,st,attackT,tool,pickFrame);return;}
  drawFormAt(ox,oy+(pickFrame===2?2:pickFrame?1:0),f,st,form,attackT,form==='owl'&&(formGlide||formAir===2)&&!pickFrame);   // 결정 D-262: 수리부엉이는 내려올 때 늘 날개를 편다
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
/* 전투 손 (수묵). battle.js drawPaw 의 1.6배 좌표 안에서 그린다. 결정 D-374: 손목·다리 없이 손바닥(발바닥·발굽)만 */
function drawFormPaw(c,form){
  c.save();
  if(form==='squirrel'){   // 작고 재빠른 다람쥐 손
    c.scale(.82,.86);
    blob(c,0,3,7.5,6.6,'#8a4a22');
    for(let i=0;i<4;i++){blob(c,-5.4+i*3.6,-4.6+(i===0||i===3?1.2:0),1.7,3.8,'#8a4a22');brush(c,[[-5.4+i*3.6,-8+(i===0||i===3?1.2:0)],[-5+i*3.6,-10+(i===0||i===3?1.2:0)]],1,INK);}
    blob(c,0.5,4,3.4,2.6,'#d9b08a');
    c.strokeStyle=INK;c.lineWidth=1.2;c.beginPath();c.ellipse(0,3,7.5,6.6,0,0,Math.PI*2);c.stroke();
  }else if(form==='goat'){   // 굳은 산양 발굽
    blob(c,-3.8,0,4.6,7.6,'#2e2621');blob(c,3.8,0,4.6,7.6,'#2e2621');
    brush(c,[[-6.5,-4],[-4,-7],[-1.5,-4]],1.2,'#8a7d70');brush(c,[[1.5,-4],[4,-7],[6.5,-4]],1.2,'#8a7d70');
    brush(c,[[0,-6],[0,7]],1.4,'#efe3c8');
  }else if(form==='owl'){   // 깃 달린 수리부엉이 손, 노란 발가락과 발톱
    for(let i=-2;i<=2;i++){c.save();c.translate(0,4);c.rotate(i*.32);blob(c,0,-9,2.6,8.5,i%2?'#8a6a45':'#6f5436');brush(c,[[0,-14],[0,-4]],.9,'#d8c09a',.8);c.restore();}
    blob(c,0,4,6.5,5,'#d8c09a');for(let i=-1;i<=1;i++)brush(c,[[i*3,2],[i*3,6]],.8,'#6f5436');
    for(let i=-1;i<=1;i++){brush(c,[[i*3.5,7],[i*4.5,10.5]],2,'#c9a040');brush(c,[[i*4.5,10.5],[i*5.5,12.5],[i*5.8+(i||.4),11.5]],1.1,INK);}
  }else if(form==='deer'){   // 갈라진 고라니 발굽 (다리는 그리지 않는다)
    blob(c,-3,-1,3.2,5.4,'#3a2a1f');blob(c,3,-1,3.2,5.4,'#3a2a1f');
    brush(c,[[0,-6],[0,4]],1.2,'#efe3c8');
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
/* 결정 D-232: opts.reveal 이 있으면 교환 목록 끝에 '본모습을 보인다'를 둔다(disguise.js). opts.askLine 은 손님 첫마디(line)가 없을 때 대신 하는 누구냐는 말 */
function strangerTalk(npc,opts={}){
  const e=strangerEntry(npc?.id);if(!e){npc?.talk?.();return;}
  const form=G.form,who=npc.name||'손님';
  // 결정 D-196: 지역의 talk(form)이 거짓을 돌려주면 손님 첫마디와 교환으로 간다 (예전엔 그대로 끝나, 다람쥐로 꾸벅이에게 말을 걸면 아무 일도 없었다)
  if(typeof e.talk==='function'&&e.talk(form,npc))return;
  // 결정 D-232: 손님 첫마디가 없으면 누구냐는 말(disguise.js)로 받는다
  const lines=[],first=e.line||opts.askLine;if(first)lines.push([who,first]);
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
  if(opts.reveal)menu.push({t:'본모습을 보인다',go:opts.reveal});   // 결정 D-232: 손님 대접이 기본, 본모습은 고를 때만
  if(!menu.length){if(!lines.length&&e.line)lines.push([who,e.line]);if(lines.length)talk(lines);return;}   // 바꿀 것이 없으면 손님 첫마디가 곧 그 인물의 대답이다
  menu.push({t:'그만두기',go:null});
  if(lines.length){const last=lines[lines.length-1];lines[lines.length-1]=[last[0],last[1],menu];}
  else lines.push([who,'…',menu]);
  talk(lines);
}
/* 결정 D-402: 대화에는 물건 목록을 늘어놓지 않는다. 교환은 '보따리를 펼친다'로 교환 창(Trade.openGuest)에서,
   변신만 하는 일(수리부엉이 외상, 산양 같은 품 맞바꾸기)은 한 줄씩 묻고 고른 뒤에 물건을 고른다. */
function strangerMenu(npc,e){
  const form=G.form,out=[],limit=TABLES.TUNING.stranger_trade_limit,left=strangerUsed(npc.id)<limit;
  const trades=(Array.isArray(e.trades)?e.trades:[]).filter(t=>validItems(t?.give)&&validItems(t?.get));
  const key=strangerKey(npc.id),debt=(G.f.strangerDebt||{})[key];
  if(form==='owl'&&debt&&validItems(debt.give))out.push({t:'외상을 갚는다',go:()=>repayDebt(npc,key)});
  if(left){
    if(trades.length)out.push({t:'보따리를 펼친다',go:()=>Trade.openGuest(npc,e)});
    if(form==='owl'&&creditOpen()&&!regionDebt().length&&trades.length)out.push({t:'외상으로 받는다',go:()=>creditMenu(npc,e,key)});
    if(form==='goat'&&swapCandidates(e).length)out.push({t:'같은 품 맞바꾸기',go:()=>swapMenu(npc,e)});
  }else if(trades.length||(form==='goat'&&e.swapPool?.length))out.push({t:'(이번 고을 손님 교환은 다 했다)',go:null});
  return out;
}
/* 수리부엉이 외상: 고른 뒤에 받을 물건을 고른다 (산양 맞바꾸기와 같은 모양) */
function creditMenu(npc,e,key){
  const who=npc.name||'손님',trades=(Array.isArray(e.trades)?e.trades:[]).filter(t=>validItems(t?.give)&&validItems(t?.get));
  talk([[who,'…',[...trades.map(t=>({t:itemsText(t.get),go:()=>takeCredit(npc,key,priced(e,t.give),t.get)})),{t:'그만두기',go:null}]]]);
}
function strangerTrade(npc,give,get){
  if(!hasAll(give)){toast('가진 것이 모자라다');return false;}
  if(!strangerKeepsProgress(give))return false;
  for(const [id,n] of Object.entries(give))takeItem(id,n);
  for(const [id,n] of Object.entries(get))addItem(id,n);
  Sound.exchange();strangerCount(npc.id);return true;
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
  // 결정 D-79: 갚으면 사연 한 줄. 부엉 영감 장부에서 본 아빠처럼, 아이도 제 이름 옆 줄을 지운다.
  if(!knows('debt:repaid')){learn('debt:repaid');
    diary('debt_repaid','수리부엉이 모습으로 진 외상을 갚았다. 장부의 내 줄이 지워졌다. 아빠도 남의 빚을 이렇게 지워 주었을까.');
    talk([['너구리','(장부에서 내 외상 줄이 지워졌다. 갚고 나니 어깨가 가볍다.)']]);}
  if(open('notebook'))renderBook();
}
/* 산양: 같은 품(ITEMS[id].r)끼리 하나 대 하나 */
function swapTargets(e,id){return (Array.isArray(e.swapPool)?e.swapPool:[]).filter(p=>p!==id&&ITEMS[p]&&ITEMS[id]&&ITEMS[p].r===ITEMS[id].r);}
function swapCandidates(e){return Object.keys(G.inv).filter(id=>G.inv[id]>0&&!keepsake(id)&&swapTargets(e,id).length);}
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
  if(!has(id)||keepsake(id)||strangerUsed(npc.id)>=TABLES.TUNING.stranger_trade_limit)return;
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
  // 결정 D-173: 아직 한 번도 안 써 본 새 변신이 있으면 잎사귀 표시가 숨 쉬듯 깜박인다
  const fresh=!!G.f?.formHintIds?.length;label?.classList.toggle('is-new',fresh);padLeaf?.classList.toggle('is-new',fresh);
  if(!formRing.hidden)renderFormRing();
}

/* ---------- 결정 D-173: 새 변신 알림 카드와 빛내기 ----------
   unlockForm 이 G.f.formIntroQ 에 넣으면, 대화·전투·패널이 모두 닫힌 첫 순간에 화면 위쪽 가운데에 카드를 띄운다.
   카드는 그 변신이 잘하는 것을 짧은 그림으로 한 번 보여 주고(말로 늘어놓지 않는다), 숫자 키와 휴대폰 잎사귀 버튼을 알린다.
   입력을 막지 않고 form_intro_ms 뒤 흐려진다.
   결정 D-192: 카드는 길어야 form_intro_ms(5초)다. 구역·지역을 옮기거나 플레이어가 변신하면 바로 닫는다. 처음 써 볼 때까지(G.f.formHintIds) 그 변신으로만 갈 수 있는 자리에 작은 잎빛이 반짝인다. */
const FORM_INTRO={
  squirrel:{line:'줄기를 타고 높은 데까지 오른다'},
  goat:{line:'디딜 데를 보고 훌쩍 높이 뛴다'},
  owl:{line:'남들 눈엔 안 보이는 것을 느끼고, 천천히 내려앉는다'},   // 결정 D-665
  deer:{line:'날쌔게 달리고, 숨은 소리를 먼저 듣는다'}
};
const formIntroBox=el('div','form-intro');formIntroBox.hidden=true;formIntroBox.setAttribute('role','status');
const formIntroCv=document.createElement('canvas');formIntroCv.width=96*3;formIntroCv.height=64*3;
const formIntroHead=el('b','form-intro-head'),formIntroKeys=el('p','form-intro-keys'),formIntroLine=el('p','form-intro-line');
formIntroBox.append(formIntroHead,formIntroCv,formIntroLine,formIntroKeys);
$('stage')?.appendChild(formIntroBox);
let formIntroShow=null,formIntroBuf=null;
/* 결정 D-192: 떠 있는 카드를 곧바로 닫는다 (변신·구역 이동) */
function formIntroHide(){
  if(!formIntroShow)return;
  formIntroShow=null;formIntroBox.hidden=true;formIntroBox.classList.remove('show','out');
}
/* 변신이 잘하는 것을 DEMO_W×DEMO_H 칸에 그린다(바닥 y=56). t: 카드가 뜬 뒤 흐른 초 */
const DEMO_W=96,DEMO_H=64,DG=56;
function drawFormDemo(id,t){
  R(0,0,DEMO_W,DEMO_H,'#e9dcc0');R(0,DG,DEMO_W,DEMO_H-DG,'#9e7a52');R(0,DG,DEMO_W,1,'#7a5536');
  const walkSt=Math.floor(t*8)%2;
  if(id==='squirrel'){   // 줄기를 타고 오른다
    R(52,4,9,DG-4,'#6f4a2c');R(52,4,2,DG-4,'#9a6c42');for(let y=10;y<DG-2;y+=10){R(59,y,2,1,'#4a2e1a');R(55,y+5,2,1,'#4a2e1a');}
    R(42,4,30,4,'#7f9a4a');R(38,7,8,3,'#6a8a3e');R(66,6,10,3,'#6a8a3e');
    const c=t%3.4,top=34;
    if(c<.7)drawFormAt(Math.round(24+c*38),DG,1,walkSt,'squirrel');
    else if(c<2.6)drawFormBackAt(56,Math.round(DG-(DG-top)*(c-.7)/1.9),Math.floor(t*7)%2,'squirrel');   // 결정 D-400
    else drawFormBackAt(56,top,0,'squirrel');
    return;
  }
  if(id==='goat'){   // 디딜 데를 보고 바위턱으로 훌쩍
    const lx=62,ly=32;
    R(lx,ly,DEMO_W-lx,DG-ly,'#b5ab98');R(lx,ly,DEMO_W-lx,2,'#8f8676');R(lx+5,ly+8,9,1,'#9a907e');R(lx+16,ly+15,10,1,'#9a907e');
    const c=t%3.6;let x,y;
    if(c<1.1){x=10+c*30;y=DG;formGait=Math.floor(t*12)%4;}
    else if(c<1.8){const k=(c-1.1)/.7;x=43+k*31;y=Math.round(DG-(DG-ly)*k-10*Math.sin(Math.PI*k));formGait=-1;}
    else{x=74;y=ly;formGait=-1;}
    drawFormAt(Math.round(x),y,1,0,'goat');formGait=-1;
    return;
  }
  if(id==='owl'){   // 떨어지며 날개를 펴고 천천히 내려앉으면, 곁에 숨어 있던 물건이 반짝 드러난다 (결정 D-665)
    R(0,30,22,4,'#8a6a48');R(0,34,5,DG-34,'#7a5c3c');
    const c=t%3.6;
    if(c<.6)drawFormAt(9,30,1,walkSt,'owl');
    else if(c<3){const k=(c-.6)/2.4;drawFormAt(Math.round(18+k*56),Math.round(30+k*(DG-30)),1,0,'owl',0,true);}
    else drawFormAt(74,DG,1,0,'owl');
    if(c>2.2){const k=Math.min(1,(c-2.2)/.5),gx=87,gy=DG-4;
      ctx.save();ctx.globalAlpha=k;R(gx-2,gy-2,5,4,'#8a5a2c');R(gx-1,gy-3,3,1,'#5a3a1c');R(gx-1,gy-1,1,1,'#c99a5a');ctx.restore();   // 드러난 알밤
      if(c<3.2){const s=Math.round((c-2.2)*6)%3+2;R(gx,gy-4-s,1,2*s+1,'#fbf2c8');R(gx-s,gy-4,2*s+1,1,'#fbf2c8');}}   // 반짝
    return;
  }
  if(id==='deer'){   // 날쌔게 달리다 덤불 속 소리를 먼저 듣는다
    R(78,42,16,14,'#6f8a4a');R(75,48,5,8,'#5f7a3e');R(82,39,8,4,'#86a35a');
    const run=(t*52)%130-16,x=Math.round(Math.min(run,62));
    drawFormAt(x,DG,1,run<62?Math.floor(t*12)%2:0,'deer');
    if(run>30){const pulse=Math.floor(t*6)%3,col='rgba(90,60,30,.85)';for(let i=0;i<=pulse;i++)R(74-i*3,44-i,1,4+i*2,col);}
    return;
  }
}
function formIntroTick(){
  const q=G?.f?.formIntroQ;
  if(formIntroShow||!q?.length||B||open('dlg')||paused())return;
  const id=q.shift();if(!FORM_INTRO[id]||!hasForm(id))return;
  const n=FORM_IDS.indexOf(id)+1;
  formIntroHead.textContent='새 변신 · '+formName(id);
  formIntroLine.textContent=FORM_INTRO[id].line;
  formIntroKeys.innerHTML='';
  // 손가락으로 하는 화면이면 잎사귀 버튼을, 아니면 숫자 키를 알린다
  if(matchMedia('(pointer:coarse)').matches)formIntroKeys.textContent='잎사귀 버튼을 눌러 바꾼다';
  else formIntroKeys.append(el('kbd',null,String(n)),document.createTextNode(' '+formName(id)+' · '),el('kbd',null,'0'),document.createTextNode(' 너구리'));
  formIntroShow={id,t0:performance.now(),zone:G.zone,reg:REG};
  formIntroBox.hidden=false;formIntroBox.classList.remove('out');void formIntroBox.offsetWidth;formIntroBox.classList.add('show');
  Sound.leaf?.(id);
  const paint=()=>{
    if(!formIntroShow||formIntroShow.id!==id)return;
    if(formIntroShow.zone!==G.zone||formIntroShow.reg!==REG){formIntroHide();return;}   // 구역·지역을 옮겼다
    const el2=(performance.now()-formIntroShow.t0)/1000,g=formIntroCv.getContext('2d');
    const buf=formIntroBuf||(formIntroBuf=Object.assign(document.createElement('canvas'),{width:DEMO_W,height:DEMO_H}));
    const b=buf.getContext('2d');b.imageSmoothingEnabled=false;b.clearRect(0,0,DEMO_W,DEMO_H);
    const saved=ctx;ctx=b;try{drawFormDemo(id,Vfx.reducedMotion?1.2:el2);}finally{ctx=saved;formGait=-1;}
    g.imageSmoothingEnabled=false;g.clearRect(0,0,formIntroCv.width,formIntroCv.height);g.drawImage(buf,0,0,formIntroCv.width,formIntroCv.height);
    if(el2*1000>=TABLES.TUNING.form_intro_ms){formIntroBox.classList.add('out');setTimeout(()=>{if(formIntroShow?.id===id){formIntroShow=null;formIntroBox.hidden=true;formIntroBox.classList.remove('show','out');}},300);return;}
    if(!Vfx.reducedMotion||el2<.05)requestAnimationFrame(paint);
    else setTimeout(paint,250);
  };
  paint();
}
/* 그 변신으로만 갈 수 있거나 그 변신에게만 보이는 자리 (지금 구역) */
function formHintSpots(id){
  const out=[],gy=fieldGround();
  for(const p of zoneObjects('doors'))if(p.formPass===id&&!needMet(p))out.push({x:p.x,y:(p.y??gy)-24});
  const z=zoneDef();
  if(z)for(const side of ['left','right']){const p=exitSpec(z.exits?.[side]);if(p&&p.formPass===id&&!needMet(p))out.push({x:side==='left'?16:z.w-16,y:gy-24});}
  if(id==='squirrel')for(const c of zoneObjects('climbs'))out.push({x:c.x,y:c.top+6});
  for(const d of fieldItems('digs'))if(d.form===id&&!d.done)out.push({x:d.x,y:(d.y??gy)-12});
  for(const a of fieldItems('pickups'))if(a.form===id&&!a.got)out.push({x:a.x,y:(a.y??gy)-12});
  if(id==='owl')for(const a of fieldItems('pickups'))if(a.hidden==='owl'&&!a.found&&!a.got)out.push({x:a.x,y:(a.y??gy)-12});   // 결정 D-665: 수리부엉이만 느끼는 숨은 물건
  return out;
}
/* 작은 잎빛: 서너 초에 한 번 십자로 반짝인다. 처음 써 보면(setForm) 그친다 */
function drawFormHints(){
  const ids=G?.f?.formHintIds;if(!ids?.length||!G.started||G.ended)return;
  for(const id of ids){
    if(!hasForm(id)||G.form===id)continue;
    formHintSpots(id).forEach((p,i)=>{
      const x=Math.round(p.x-cam),y=Math.round(p.y);if(x<-6||x>W+6)return;
      const k=Vfx.reducedMotion?.5:Math.max(0,Math.sin(((G.anim+i*23)%200)/200*Math.PI*2));
      if(k<.05)return;
      ctx.save();ctx.globalAlpha=.25+.6*k;
      R(x,y-2,1,5,'#d8f0a0');R(x-2,y,5,1,'#d8f0a0');if(k>.6){R(x-1,y-1,3,3,'#b7e07a');R(x,y,1,1,'#fbffe8');}
      ctx.restore();
    });
  }
}
