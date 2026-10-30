'use strict';
/* 전투: 부위 공략. 공격을 피하면 붉은 표식(빈틈)이 뜨고, 손을 그 위로 옮겨 치면 부위 내구도가 깎인다.
   선물로 진정 게이지를 채워 달랠 수도 있다. 상대는 지역 파일이 defineEnemies 로 넣는다.

   상대 {name, calmLabel, intro, howto?, npc?, dodge?(피하기만 하는 시험: 버틸 공격 수), bonkText?(dodge 시작 때 연장을 뺏기는 글),
         parts:[{id, name, hp, atk(battle-attacks.js), mat?(부수면 얻는 아이템), core?, tell}],
         coreNeeds?(이 부위를 꺾어야 핵심이 드러남), likes:{아이템:진정 오름}, likeText, likeTexts?:{아이템:그 선물만의 글}, coreHidden, coreShown, calmWin, calmGift?, win, lose,
         cover?:엄폐물, vinePath?:칡 전용 통로(arm 부위 필요), calmAction?:{amount:행동 진정량, kind?, prompt?, text?}(cover/vinePath/possession/warmPath 공격 뒤), placeGift?:꼭대기에 얹을 선물 id,
         forgeTrial?:{sequence:부위 id 순서, repeatText:두 번째 바퀴 대사},
         possession?:{order:빙의 순서, attacks:부위별 시험판 공격, travel:불 이동 시간, wait:도착 뒤 대피 시간}, partPose?(id):그려진 부위 좌표,
         warmPath?:{width,wideWidth,attacks:부위별 공격},
         headPose?():그림의 머리 좌표, markPosition?(p):상자 안 되치기 표식 좌표,
         draw(c):수묵 그림, onWin(B)?:이겼을 때 보상, onCalm(B)?:달랬을 때 보상 (B.loot 에 넣고 B.bonus 에 글)} */
const bcv=$('bcv');const bctx=bcv.getContext('2d');
let B=null,inkOn=false,LW=800,LH=450,BOX={x:250,y:262,w:300,h:160},EY=118;const BDPR=2;
let paper=null;
/* 변신은 손 모양과 손놀림만 바꾼다. 피해량은 그대로이며 NPC 피하기 시험(dodge)에서는 늘 너구리 손이다.
   수치는 tuning.csv 의 battle_bare_*(너구리)·battle_<변신>_* 줄. 버튼은 열린 변신만 보인다 (자리는 옛 탈 버튼 자리). */
const BATTLE_FORM_TRAITS={'':'익숙한 손',squirrel:'빠름 · 좁음',goat:'느림 · 덜 아픔',owl:'예고 일찍 · 넓음',deer:'빠름 · 무적 김'};
const BATTLE_FORM_HINTS={'':'너구리 손 · 익숙한 손놀림',squirrel:'다람쥐 손 · 빠른 손과 걸음, 좁은 되치기',goat:'산양 발굽 · 느리지만 두 번 맞아야 한 칸',
  owl:'수리부엉이 깃 · 공격 예고가 일찍 보이고 넓게 닿는다',deer:'고라니 다리 · 빠른 걸음, 맞은 뒤 오래 버틴다'};
function battleForm(){const id=G&&G.form;return B&&!B.E.dodge&&!B.noTool&&id&&hasForm(id)?id:'';}
function battleHandProfile(){
  const id=battleForm(),prefix='battle_'+(id||'bare')+'_',t=TABLES.TUNING;
  return {speed:t[prefix+'speed'],cooldown:t[prefix+'cooldown'],radius:t[prefix+'radius']};
}
function battleFormKey(key){
  if(!B||!['0','1','2','3','4'].includes(key))return false;
  if(!G.forms?.length)return true;
  let id=formIdForKey(key);
  if(id&&!hasForm(id))return true;
  if(id&&id===G.form)id='';
  setForm(id);return true;
}
function renderBattleForms(){
  if(!B)return;
  let wrap=$('bMasks');
  if(!wrap){
    wrap=el('div','b-masks');wrap.id='bMasks';
    const buttons=el('div','b-mask-buttons');buttons.id='bFormButtons';buttons.setAttribute('aria-label','전투 변신');
    wrap.appendChild(buttons);const hint=el('p','small');hint.id='bMaskHint';wrap.appendChild(hint);
    $('bHit').parentElement.parentElement.appendChild(wrap);
  }
  // 세로 화면에서는 공격 상자 아래 여백에 놓아 적 그림과 예고 글을 가리지 않는다.
  const parent=TOUCH&&matchMedia('(orientation:portrait)').matches?$('battle'):$('bHit').parentElement.parentElement;
  if(wrap.parentElement!==parent)parent.appendChild(wrap);
  const ids=['',...(G.forms||[])],buttons=$('bFormButtons');
  if(buttons.dataset.ids!==ids.join(',')){
    buttons.dataset.ids=ids.join(',');buttons.innerHTML='';
    for(const id of ids){const key=id?FORM_IDS.indexOf(id)+1:0,button=el('button','bbtn',key+' · '+formName(id));button.type='button';button.dataset.form=id;
      button.appendChild(el('small','b-mask-trait',BATTLE_FORM_TRAITS[id]));
      button.onclick=()=>{if(id&&id===G.form)setForm('');else setForm(id);};buttons.appendChild(button);}
  }
  wrap.hidden=!G.forms?.length;
  buttons.querySelectorAll('button').forEach(button=>{
    button.disabled=!formChangeAllowed();
    button.setAttribute('aria-pressed',String(button.dataset.form===battleForm()));
  });
  $('bMaskHint').textContent=B.E.dodge?'이번 시험은 연장 없이 피하기.':BATTLE_FORM_HINTS[battleForm()];
  if(Array.isArray(G.f.battleTools)&&G.f.battleTools.includes('pickaxe')&&!B.E.dodge)$('bMaskHint').textContent+=' · 돌·얼음은 곡괭이 자동 사용';
}
function battlePickaxe(p){return !!(p&&!B.E.npc&&!B.noTool&&Array.isArray(G.f.battleTools)&&G.f.battleTools.includes('pickaxe')&&['stone','ice'].includes(p.material));}
/* 부위의 id·이름·내구도·부수면 얻는 것·핵심 여부는 design/data/boss_parts.csv (js/data/tables.js) 에서,
   공격 종류(atk)와 예고 글(tell)은 지역 코드에서 받아 합친다. 순서는 표 순서 */
function tableParts(boss,extra){return TABLES.BOSS_PARTS[boss].map(p=>Object.assign({},p,extra[p.id]));}
function blayout(){
  const hand=B&&(B.E.possession||B.E.vinePath)?{u:(B.px-BOX.x)/BOX.w,v:(B.py-BOX.y)/BOX.h}:null;
  if(B&&B.E.vinePath)bDrag=null;
  const r=$('battle').getBoundingClientRect();const tall=r.height>0&&r.width/r.height<1.25;
  if(tall){LW=600;LH=600;BOX={x:150,y:330,w:300,h:190};EY=168;}else{LW=800;LH=450;BOX={x:250,y:262,w:300,h:160};EY=112;}
  bcv.width=LW*BDPR;bcv.height=LH*BDPR;
  paper=document.createElement('canvas');paper.width=LW;paper.height=LH;const p=paper.getContext('2d');
  p.fillStyle='#efe3c8';p.fillRect(0,0,LW,LH);
  for(let i=0;i<260;i++){const x=hash(i*3.1)*LW,y=hash(i*7.7)*LH,l=8+hash(i*1.3)*30,a=hash(i*5.9)*Math.PI;
    p.strokeStyle='rgba(120,96,64,'+(0.05+hash(i*2.2)*0.07).toFixed(3)+')';p.lineWidth=1;p.beginPath();p.moveTo(x,y);p.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);p.stroke();}
  const g=p.createRadialGradient(LW/2,LH/2,LH*0.3,LW/2,LH/2,LH*0.85);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(90,60,30,.18)');p.fillStyle=g;p.fillRect(0,0,LW,LH);
  if(B){if(hand){B.px=BOX.x+hand.u*BOX.w;B.py=BOX.y+hand.v*BOX.h;}
    B.px=clamp(B.px,BOX.x+8,BOX.x+BOX.w-8);B.py=clamp(B.py,BOX.y+8,BOX.y+BOX.h-8);}
}
addEventListener('resize',()=>{if(B){blayout();renderBattleForms();}});

/* 필드에서 전투로 넘어가는 먹물 번짐. sx 는 번지기 시작하는 가로 위치(%) */
function inkTransition(text,sx,cb){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){cb();return;}
  const k=$('ink');$('inkText').textContent=text;
  k.style.setProperty('--ix',clamp(sx,5,95)+'%');k.hidden=false;k.className='ink';void k.offsetWidth;k.className='ink on';inkOn=true;
  setTimeout(()=>{cb();k.className='ink off';setTimeout(()=>{k.hidden=true;k.className='ink';inkOn=false;},460);},1050);
}
// 결정 D-11: 행동으로 달래기(calm) (design/data/decisions.csv)
/* onEnd(결과, {hits}) 결과는 'win' | 'calm' | 'lose' | 'flee' */
function startBattle(kind,onEnd){
  const E=ENEMIES[kind];learn('fight:'+kind);
  closePanels();$('dlg').hidden=true;
  B={hoof:0,kind,E,parts:E.parts.map(p=>Object.assign({},p,{max:p.hp,broken:false,shake:0})),calm:0,
    px:0,py:0,inv:0,st:'intro',t:90,cur:null,last:null,mark:null,bullets:[],fx:[],cool:0,swing:0,atkT:0,atkDur:0,
    loot:[],msg:E.intro,onEnd,paused:false,time:0,result:null,firstHit:true,hits:0,hitThis:false,survived:0,noTool:false,toolFly:null,bonk:0,bonus:'',autoToolT:0};
  document.body.classList.add('in-battle');$('battle').hidden=false;
  blayout();B.px=BOX.x+BOX.w/2;B.py=BOX.y+BOX.h*0.65;
  if(E.cover){B.covers=[];B.round=0;addCover(0.5,0.43);}
  if(E.forgeTrial){B.forgeNext=null;B.handShown=false;B.handShow=0;}
  if(E.possession){B.round=0;B.possession={from:'core',to:'core'};}
  if(E.vinePath){B.round=0;B.vinePath=null;B.pathLesson=false;}
  if(E.warmPath)B.warm={current:{u:0.25,v:0.7},next:null,points:[],round:0,ice:null,fire:0};
  $('bName').textContent=E.name;$('bCalmLabel').textContent=E.calmLabel;
  setPadLabels(true);renderBHud();
  const gm=$('goalM');gm.querySelector('b').textContent='전투';gm.querySelector('span').textContent=E.dodge?'연장 없이 피하기만! 화면을 끌거나 십자 버튼으로 피하자.':'붉은 표식 위에서 치기. 화면을 끌거나 십자 버튼으로 피하자.';
  if(E.cover)gm.querySelector('span').textContent='돌 아래 여백에 손을 숨기자. 공격 뒤에는 표식 치기 또는 소원 돌 바로 놓기.';
  if(E.forgeTrial)gm.querySelector('span').textContent='먹선이 생기면 작업대 밖으로! 풀무는 낮은 바람막이 뒤, 호통은 부채꼴 양옆으로.';
  if(E.possession)gm.querySelector('span').textContent='불이 옮겨 간 헌물의 공격을 읽자. 공격 뒤에는 되치기 또는 물건 집기 → 윤곽에서 치기로 돌려놓기.';
  if(E.vinePath)gm.querySelector('span').textContent='예고 중 고리 위에서 치기를 누른 채 이동하고 놓자. 공격 뒤에는 표식 치기 또는 매듭 풀기.';
  if(E.warmPath)gm.querySelector('span').textContent='물김 길을 따라 옆 샘으로. 공격 뒤에는 붉은 표식 치기 또는 샘의 얼음 걷기.';
}
function setPadLabels(on){
  const j=document.querySelector('#pad [data-k="jump"]'),a=document.querySelector('#pad [data-k="atk"]');
  if(j)j.textContent=on?'선물':'점프';if(a)a.textContent=on?'치기':'휘두르기';
}
function renderBHud(){
  if(!B)return;
  const wrap=$('bParts');wrap.innerHTML='';
  if(B.E.dodge){
    const r=el('div','b-part');r.appendChild(el('span','nm','버틴 공격'));const pp=el('span','pp');
    for(let i=0;i<B.E.dodge;i++){const d=document.createElement('i');if(i>=B.survived)d.className='off';pp.appendChild(d);}r.appendChild(pp);wrap.appendChild(r);
    const r2=el('div','b-part');r2.appendChild(el('span','nm','맞은 횟수 '+B.hits));if(B.noTool)r2.appendChild(el('span','tag','연장 없음'));wrap.appendChild(r2);
  }else{
  wrap.appendChild(el('div','small','부위 내구도'));
  const hidden=coreHidden();
  B.parts.forEach(p=>{const r=el('div','b-part'+(p.broken?' broken':''));r.appendChild(el('span','nm',p.name));
    const pp=el('span','pp');for(let i=0;i<p.max;i++){const d=document.createElement('i');if(i>=p.hp)d.className='off';pp.appendChild(d);}r.appendChild(pp);
    if(p.broken)r.appendChild(el('span','tag',B.E.npc?'꺾임':'부러짐'));else if(p.core&&hidden)r.appendChild(el('span','tag','가려짐'));
    wrap.appendChild(r);});
  }
  $('bHearts').innerHTML=Array.from({length:G.maxhp},(_,i)=>'<span class="'+(i<G.hp?'':'off')+'">♥</span>').join('');
  $('bCalm').style.width=B.calm+'%';
  renderBattleForms();
}
function bLiving(){return B.parts.filter(p=>!p.broken);}
/* 핵심 부위는 다른 부위를 하나도 못 꺾었을 때 가려져 있다. 상대에 coreNeeds:'<부위 id>' 가 있으면 그 부위를 꺾어야 드러난다 */
function coreHidden(){const c=B.parts.find(p=>p.core);if(!c||c.broken)return false;
  if(B.E.coreNeeds)return !B.parts.find(p=>p.id===B.E.coreNeeds).broken;
  return B.parts.filter(p=>!p.core).every(p=>!p.broken);}
/* 선택 기능. 돌의 좌표는 상자에 대한 비율이라 화면 회전에도 자리를 유지한다. */
function coverPoint(r){return {x:BOX.x+r.u*BOX.w,y:BOX.y+r.v*BOX.h};}
function addCover(u,v){
  if(!B.E.cover)return;
  if(B.covers.length>=3)B.covers.shift();
  const r={u:clamp(u,0.14,0.86),v:clamp(v,0.28,0.62),cracked:false,blockedRound:-1,flash:0};
  B.covers.push(r);return r;
}
function coverBehind(x,y){return B.E.cover&&B.covers.find(r=>{const p=coverPoint(r);return Math.abs(x-p.x)<22&&y>p.y+10;});}
function damageCover(r){
  r.flash=18;
  if(r.blockedRound===B.round)return;
  r.blockedRound=B.round;
  if(r.cracked){B.covers=B.covers.filter(q=>q!==r);const p=coverPoint(r);bSplash(p.x,p.y);B.msg='금 간 돌이 부서졌다. 다음 돌의 자리를 보자.';}
  else{r.cracked=true;B.msg='돌이 막았다! 금이 갔지만 이번 공격까지는 버틴다.';}
}
/* 칡 선택 기능. 비율 좌표로 저장해 화면을 돌려도 고리와 실제 통로가 함께 옮겨진다. */
function vineBounds(){const p=B.vinePath;return {x:BOX.x+p.u*BOX.w,w:p.width};}
function vineHeld(){return keys['j']||keys['x']||keys[' ']||keys['enter']||vinePointers.size>0;}
function grabVine(){
  const p=B.vinePath;if(!p||B.st!=='tell'||p.locked||p.dragging)return;
  const x=BOX.x+p.u*BOX.w,y=BOX.y+p.v*BOX.h;
  if(Math.hypot(B.px-x,B.py-y)<32+(p.width-78)/4){p.dragging=true;p.offset=p.u-(B.px-BOX.x)/BOX.w;}
}
function moveVine(){
  if(!B.E.vinePath||B.st!=='tell')return;
  const p=B.vinePath;
  if(vineHeld())grabVine();
  if(!p.dragging)return;
  if(!vineHeld()){p.dragging=false;p.locked=true;B.msg='고리를 놓았다. 비워 둔 통로로 피하자.';return;}
  p.u=clamp((B.px-BOX.x)/BOX.w+p.offset,p.width/2/BOX.w+0.04,1-p.width/2/BOX.w-0.04);
}
function openCalmAction(){
  if(!B.E.calmAction)return;
  if(B.E.calmAction.kind==='return'){
    // 놓친 물건은 보따리에서 빠지지 않고 바닥에 남아 다음 차례에도 집을 수 있다.
    if(!B.returnItem)B.returnItem={u:B.round%2?0.14:0.86,v:0.86,homeU:B.round%2?0.7:0.3,homeV:0.65};
    Object.assign(B.returnItem,{t:240,active:true,held:false});
    B.msg+=' / 물건 위에서 '+HITKEY+'로 집고, 빈 윤곽에서 한 번 더 눌러 돌려놓기.';return;
  }
  if(B.E.calmAction.kind==='ice'){
    B.warm.ice={...B.warm.current,t:180};
    B.msg+=' / 샘 위에서 '+HITKEY+': 얼음 걷기.';return;
  }
  const u=B.mark?(B.mark.x>BOX.x+BOX.w/2?0.14:0.86):(B.round%2?0.86:0.14);
  B.calmStone={u,v:0.8,t:150};
  B.msg+=' / '+(B.E.calmAction.prompt||'기울어진 돌 위에서')+' '+HITKEY+': '+(B.E.calmAction.kind==='knot'?'매듭 풀기.':'바로 놓기.');
}
/* 수리부엉이 깃: 부위 공격 예고(tell)를 battle_owl_tell_lead 만큼 먼저 보여 준다 */
function chooseAttack(){
  chooseAttackBase();
  if(battleForm()==='owl'&&B.st==='tell')B.t+=TABLES.TUNING.battle_owl_tell_lead;
}
function chooseAttackBase(){
  Sound.playSfx('battle_warn');
  if(B.E.cover){B.round++;B.calmStone=null;}
  if(B.E.forgeTrial){
    const seq=B.E.forgeTrial.sequence,p=B.parts.find(p=>p.id===seq[B.survived%seq.length]);
    B.cur=p;B.last=p;B.st='tell';B.t=60;B.hitThis=false;
    B.msg=(B.survived>=seq.length?B.E.forgeTrial.repeatText+' ':'')+p.tell;
    // 겹쳐 보인 풀무 예고에도 여기서부터 온전한 회피 시간을 준다.
    const b=B.forgeNext||{k:p.atk,u:B.survived===3?0.74:0.35,tell:120,hold:28};
    b.t=0;b.preview=false;B.forgeNext=null;B.bullets.push(b);return;
  }
  if(B.E.possession){
    const rule=B.E.possession,order=rule.order,start=(order.indexOf(B.possession.to)+1)%order.length;
    const id=Array.from({length:order.length},(_,i)=>order[(start+i)%order.length]).find(id=>{const p=part(id);return !p.broken&&(!p.core||!coreHidden());});
    const p=part(id);B.round++;B.possession={from:B.possession.to,to:id};
    if(B.returnItem){B.returnItem.active=false;B.returnItem.held=false;}
    B.returnEcho=null;B.cur=p;B.last=p;B.st='tell';B.t=rule.travel+rule.wait;B.hitThis=false;
    const attack=bAttackDef(p);B.attackPlan=attack.prepare?attack.prepare():null;B.msg=p.tell;return;
  }
  if(B.E.vinePath){B.round++;B.calmStone=null;}
  const L=bLiving();let o=L.filter(p=>p!==B.last);if(!o.length)o=L;
  const p=(!B.last&&B.E.vinePath?L.find(q=>q.id==='arm'):null)||o[Math.floor(Math.random()*o.length)];B.cur=p;B.last=p;B.st='tell';B.t=42;B.msg=p.tell;B.hitThis=false;
  if(B.E.vinePath){
    const help=Math.min(3,Math.floor(B.hits/2)),arm=B.parts.find(q=>q.id==='arm');
    B.vinePath={u:0.5,v:0.65,width:78+(arm.broken?24:0)+help*12,dragging:false,locked:false};
    B.t=110+help*18;
    if(!B.pathLesson){B.pathLesson=true;B.t+=90;B.msg='고리 위에서 '+jo(HITKEY,'을','를')+' 누른 채 좌우로 이동하고 놓자. 그 자리가 피할 길이 된다.';}
  }
  if(B.E.warmPath){prepareWarmPath();B.t=80;}
}
/* 온기 길은 비율 좌표로 보관한다. 판정과 그림이 같은 꺾은선을 쓴다. */
function prepareWarmPath(){
  const w=B.warm;w.round++;w.ice=null;
  w.next={u:w.current.u<0.5?0.77:0.23,v:Math.floor((w.round-1)/2)%2?0.76:0.24};
  // 같은 두 샘을 왕복하며 한곳에 머물 수 없도록 높이도 두 차례마다 바꾼다.
  const bend=B.cur.id==='body'?w.current.u:B.cur.id==='tail'?w.next.u:0.5;
  w.points=[w.current,{u:part('body').broken?0.5:bend,v:(w.current.v+w.next.v)/2},w.next];
  w.width=part('body').broken?B.E.warmPath.wideWidth:B.E.warmPath.width;
}
function warmSafe(x,y,padding=0){
  const w=B.warm;if(!w)return false;
  if([w.current,w.next].some(r=>r&&Math.hypot(x-coverPoint(r).x,y-coverPoint(r).y)<=38+padding))return true;
  for(let i=1;i<w.points.length;i++){
    const a=coverPoint(w.points[i-1]),z=coverPoint(w.points[i]),dx=z.x-a.x,dy=z.y-a.y;
    const q=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);
    if(Math.hypot(x-a.x-q*dx,y-a.y-q*dy)<=w.width/2+padding)return true;
  }
  return false;
}
function finishWarmAttack(){
  const w=B.warm;w.current=w.next; // 직전의 길도 다음 예고까지 남긴다.
}
function openMark(){
  const p=B.cur;
  if(p.core&&coreHidden()){B.mark=null;B.msg=B.E.coreHidden;return;}
  let x,y,n=0;do{x=BOX.x+30+Math.random()*(BOX.w-60);y=BOX.y+26+Math.random()*(BOX.h-52);n++;}while(Math.hypot(x-B.px,y-B.py)<70&&n<12);
  if(B.E.markPosition){const pos=B.E.markPosition(p);if(pos){x=pos.x;y=pos.y;}}
  const life=B.warm?180:B.E.calmAction?(B.E.calmAction.kind==='return'?240:150):120;
  B.mark={x,y,t:life,max:life,part:p};B.msg=jo(p.name,'에','에')+' 빈틈! 붉은 표식 위에서 '+jo(HITKEY,'을','를')+' 누르자.';
}
function bAttackDef(p){const mode=B.E.possession||B.E.warmPath;return ATTACKS[(mode&&mode.attacks&&mode.attacks[p.id])||p.atk];}
function attackTick(p){bAttackDef(p).tick(B.atkT,BOX.x,BOX.y,BOX.w,BOX.h);}
/* 하트는 정수다. 산양 발굽은 맞을 때마다 battle_goat_damage_taken 만큼 쌓고 1이 찰 때만 한 칸 준다 (0.5면 두 번에 한 칸).
   고라니는 맞은 뒤 무적 시간이 battle_deer_iframes 로 길다. */
function bHitMe(){
  if(B.inv>0||B.st==='end')return;
  const form=battleForm(),t=TABLES.TUNING;let loss=1;
  if(form==='goat'){B.hoof+=t.battle_goat_damage_taken;loss=Math.floor(B.hoof+1e-9);B.hoof-=loss;}
  G.hp-=loss;B.inv=form==='deer'?t.battle_deer_iframes:t.battle_iframes;B.hits++;B.hitThis=true;refreshHud();
  bSplash(B.px,B.py,loss?'#b4432a':'#6f6357');if(!loss)B.msg='굳은 발굽이 버텼다!';
  if(G.hp<=0)bEnd('lose');
}
function bSplash(x,y,col){for(let i=0;i<9;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*2.4;B.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:2+Math.random()*4,t:28,col:col||'#1d1814'});}}
function bStrike(){
  if(!B||B.paused||B.handShow>0||B.st==='end'||B.st==='giftPlace')return;
  if(B.E.vinePath&&B.st==='tell'){grabVine();return;}
  if(B.cool>0)return;
  if(B.noTool){B.msg='연장이 없다! 피하기만 하자.';B.cool=20;return;}
  B.cool=battleHandProfile().cooldown;B.swing=12;
  const r=B.returnItem;
  if(r&&r.active&&B.st==='open'){
    const source=coverPoint(r),home=coverPoint({u:r.homeU,v:r.homeV});
    if(r.held&&Math.hypot(home.x-B.px,home.y-B.py)<26){
      B.returnItem=null;B.mark=null;B.returnEcho={u:r.homeU,v:r.homeV,t:60};
      B.calm=Math.min(100,B.calm+B.E.calmAction.amount);B.msg='장터 물건을 제자리에 놓았다. 도깨비도 옆 물건을 따라 돌려놓는다.';
      B.st='idle';B.t=60;renderBHud();if(B.calm>=100)bEnd('calm');return;
    }
    if(!r.held&&Math.hypot(source.x-B.px,source.y-B.py)<26){r.held=true;B.msg='물건을 집었다. 빈 윤곽으로 옮겨 '+jo(HITKEY,'을','를')+' 한 번 더 누르자.';return;}
  }
  if(B.warm&&B.warm.ice){const s=coverPoint(B.warm.ice);
    if(Math.hypot(s.x-B.px,s.y-B.py)<26){
      B.warm.thaw={...B.warm.ice,t:90};
      B.warm.ice=null;B.mark=null;B.calm=Math.min(100,B.calm+B.E.calmAction.amount);
      B.msg='얇은 얼음을 걷자 따뜻한 물이 흐른다. 강철이가 숨을 고른다.';
      B.st='idle';B.t=36;renderBHud();if(B.calm>=100)bEnd('calm');return;
    }
  }
  if(B.calmStone){const s=coverPoint(B.calmStone);
    if(Math.hypot(s.x-B.px,s.y-B.py)<26){
      B.calmStone=null;B.mark=null;B.calm=Math.min(100,B.calm+B.E.calmAction.amount);
      B.msg=B.E.calmAction.text||'기울어진 소원 돌을 바로 놓았다. 골렘이 숨을 고른다.';B.st='idle';B.t=36;renderBHud();
      if(B.calm>=100)bEnd('calm');return;
    }
  }
  const m=B.mark;
  if(m&&Math.hypot(m.x-B.px,m.y-B.py)<battleHandProfile().radius){
    B.calmStone=null;
    if(B.returnItem){B.returnItem.active=false;B.returnItem.held=false;}
    if(B.warm)B.warm.ice=null;
    const p=m.part,pickaxe=battlePickaxe(p),t=TABLES.TUNING;
    const dmg=(G.sharp&&!B.E.npc?t.battle_sharp_damage:t.battle_base_damage)+(pickaxe?t.battle_pickaxe_bonus:0);
    B.autoToolT=pickaxe?12:0;p.hp=Math.max(0,p.hp-dmg);p.shake=16;bSplash(m.x,m.y);B.mark=null;
    if(p.hp>0)Sound.playSfx('battle_hit');
    if(p.hp<=0)breakPart(p);else B.msg=(pickaxe?'곡괭이로 ':'')+jo(p.name,'을','를')+' 쳤다! 내구도가 깎였다.';
    renderBHud();
  }else{B.msg=m?'조금 더 가까이! 손이 표식 안에 들어가야 맞는다.':'아직 빈틈이 없다. 피하면서 붉은 표식을 기다리자.';}
}
function breakPart(p){
  p.broken=true;
  if(!p.core)Sound.playSfx('battle_part_break');
  if(B.warm&&p.id==='body')B.warm.width=B.E.warmPath.wideWidth;
  if(p.mat&&!p.core)B.loot.push(p.mat);
  if(p.core){if(p.mat)B.loot.push(p.mat);bEnd('win');return;}
  B.msg=B.E.npc?jo(p.name,'의','의')+' 기세를 꺾었다!':jo(p.name,'이','가')+' 부러졌다! '+(p.mat?ITEMS[p.mat].n+' 획득.':'');
  if(B.E.coreNeeds?p.id===B.E.coreNeeds:B.parts.filter(q=>!q.core).filter(q=>q.broken).length===1){learn('core:'+B.kind);setTimeout(()=>{if(B&&B.st!=='end')B.msg=B.E.coreShown;},1300);}
}
function bEnd(result){
  if(B.st==='end')return;B.st='end';B.t=80;B.result=result;B.mark=null;B.calmStone=null;B.bullets=[];
  if(result==='win'||result==='calm')Sound.playSfx(result==='calm'?'battle_soothe':'battle_victory');
  if(B.E.forgeTrial){B.forgeNext=null;B.handShow=0;}
  if(B.E.possession){B.returnItem=null;B.returnEcho=null;B.attackPlan=null;}
  if(B.E.vinePath)B.vinePath=null;
  if(B.warm)B.warm.ice=null;
  B.msg=result==='win'?B.E.win:result==='calm'?B.E.calmWin:result==='flee'?'일단 물러나자.':B.E.lose;
  if(result==='calm'){learn('calm:'+B.kind);if(B.E.calmGift)B.loot.push(B.E.calmGift);}
  if(result==='calm'&&B.E.onCalm)B.E.onCalm(B);
  if(result==='win'&&B.E.onWin)B.E.onWin(B);
  renderBHud();
}
function bStep(){
  if(!B||B.paused||!$('bResult').hidden)return;
  // 손을 살피는 동안 전투 시간과 탄을 함께 멈춘다. 진정 수치는 바꾸지 않는다.
  if(B.handShow>0){if(--B.handShow===0){B.msg=B.handMsg;openGift();}return;}
  B.time++;if(B.inv>0)B.inv--;if(B.cool>0)B.cool--;if(B.swing>0)B.swing--;
  if(B.autoToolT>0)B.autoToolT--;
  if(B.covers)B.covers.forEach(r=>{if(r.flash>0)r.flash--;});
  if(B.returnEcho&&--B.returnEcho.t<=0)B.returnEcho=null;
  if(B.scentKnot&&--B.scentKnot.t<=0)B.scentKnot=null;
  if(B.warm&&B.warm.fire>0)B.warm.fire--;
  if(B.warm&&B.warm.thaw&&--B.warm.thaw.t<=0)B.warm.thaw=null;
  if(B.st!=='end'&&B.st!=='giftPlace'){
    let dx=0,dy=0;
    if(keys['arrowleft']||keys['a']||touch.left)dx-=1;if(keys['arrowright']||keys['d']||touch.right)dx+=1;
    if(keys['arrowup']||keys['w']||touch.up)dy-=1;if(keys['arrowdown']||keys['s']||touch.down)dy+=1;
    if(dx&&dy){dx*=0.72;dy*=0.72;}
    const speed=battleHandProfile().speed;
    B.px=clamp(B.px+dx*speed,BOX.x+8,BOX.x+BOX.w-8);B.py=clamp(B.py+dy*speed,BOX.y+8,BOX.y+BOX.h-8);
  }
  if(B.E.vinePath)moveVine();
  B.parts.forEach(p=>{if(p.shake>0)p.shake--;});
  if(B.bonk>0)B.bonk--;
  if(B.toolFly){const f=B.toolFly;f.vy+=0.25;f.x+=f.vx;f.y+=f.vy;f.rot+=0.32;}
  for(const f of B.fx){f.x+=f.vx;f.y+=f.vy;f.vx*=0.9;f.vy*=0.9;f.t--;}B.fx=B.fx.filter(f=>f.t>0);
  switch(B.st){
    case 'intro':if(B.t===50&&B.E.howto)B.msg='공격을 피하면 붉은 표식이 뜬다. 손을 그 위로 옮겨 '+jo(HITKEY,'을','를')+' 누르자!';
      if(--B.t<=0){if(B.E.dodge&&!B.noTool){B.st='bonk';B.t=120;B.noTool=true;B.bonk=34;B.msg=B.E.bonkText;B.toolFly={x:B.px+10,y:B.py-12,vx:-3.2,vy:-5.5,rot:0};renderBHud();}else{B.st='idle';B.t=20;}}break;
    case 'bonk':if(B.t===60)B.msg='연장을 놓쳤다! 이번엔 피하기만 해야 한다.';if(--B.t<=0){B.st='idle';B.t=20;B.toolFly=null;}break;
    case 'idle':if(--B.t<=0)chooseAttack();break;
    case 'tell':if(--B.t<=0){if(B.E.vinePath){B.vinePath.dragging=false;B.vinePath.locked=true;B.msg=B.cur.tell;}B.st='atk';B.atkT=0;B.atkDur=bAttackDef(B.cur).dur;}break;
    case 'atk':attackTick(B.cur);if(++B.atkT>=B.atkDur){if(B.E.dodge)B.st='clear';else if(B.E.cover||B.E.possession||B.E.vinePath||B.E.warmPath)B.st='settle';else{B.st='open';openMark();}}break;
    case 'settle':if(!B.bullets.length){if(B.warm)finishWarmAttack();B.st='open';if(B.E.vinePath)B.vinePath=null;openMark();openCalmAction();}break;
    case 'giftPlace':if(--B.t<=0){B.giftPlace=null;bEnd('calm');}break;
    case 'clear':if(!B.bullets.length){B.survived++;B.msg=(B.hitThis?'아야… 그래도 버텼다. ':'잘 피했다! ')+'('+B.survived+'/'+B.E.dodge+')';renderBHud();if(B.survived>=B.E.dodge)bEnd('win');else{B.st='idle';B.t=40;}}break;
    case 'open':
      if(B.warm&&B.warm.ice&&--B.warm.ice.t<=0)B.warm.ice=null;
      if(B.returnItem&&B.returnItem.active&&--B.returnItem.t<=0){B.returnItem.active=false;B.returnItem.held=false;}
      if(B.calmStone&&--B.calmStone.t<=0)B.calmStone=null;if(B.mark&&--B.mark.t<=0){B.mark=null;B.msg='빈틈이 닫혔다.';}
      if(!B.mark&&!B.calmStone&&!(B.returnItem&&B.returnItem.active)&&!(B.warm&&B.warm.ice)&&!B.bullets.length){B.st='idle';B.t=36;}break;
    case 'end':if(--B.t<=0)showResult();return;
  }
  const X1=BOX.x,X2=BOX.x+BOX.w,Y1=BOX.y,Y2=BOX.y+BOX.h;
  for(const b of B.bullets)BULLETS[b.k].step(b,X1,X2,Y1,Y2);
  B.bullets=B.bullets.filter(b=>!b.dead);
}

/* 선물 (달래기) */
/* 남은 교환·약에 필요한 물건은 items.csv의 진행보호와 가공법으로 계산한다.
   완제품부터 확보한 뒤 부족분만 재료로 풀고, 대체재 조합 중 부족 수량이 가장 적은 쪽을 고른다. */
function progressShortage(inv){
  const goals=TABLES.PROGRESS.filter(g=>REGIONS[g.region].order>=REG.order&&
    !regionCompleted(g.region)&&!(g.done==='ended'?(g.region===G.region&&G.ended):G.f[g.done]));
  const recipes=Object.values(RECIPES).flat();
  function shortage(need){
    const stock={...inv};let missing=0;
    // 모든 목표의 완제품을 먼저 떼어 두어 같은 물건을 두 번 세지 않는다.
    let pending={};
    for(const [id,n] of Object.entries(need)){
      const used=Math.min(stock[id]||0,n);stock[id]=(stock[id]||0)-used;
      if(n>used)pending[id]=n-used;
    }
    while(Object.keys(pending).length){
      const next={};
      for(const [id,n] of Object.entries(pending)){
        const r=recipes.find(r=>r.out===id);
        if(!r){missing+=n;continue;}
        const batches=Math.ceil(n/r.n);
        for(const [item,count] of Object.entries(r.need))next[item]=(next[item]||0)+count*batches;
      }
      pending={};
      for(const [id,n] of Object.entries(next)){
        const used=Math.min(stock[id]||0,n);stock[id]=(stock[id]||0)-used;
        if(n>used)pending[id]=n-used;
      }
    }
    return missing;
  }
  function choose(i,need){
    if(i===goals.length)return shortage(need);
    return Math.min(...goals[i].options.map(option=>{
      const next={...need};for(const id in option)next[id]=(next[id]||0)+option[id];
      return choose(i+1,next);
    }));
  }
  return choose(0,{});
}
function openGift(){
  if(!B||B.handShow>0||B.st==='end'||B.st==='giftPlace'||!$('bResult').hidden)return;
  if(B.E.forgeTrial&&!B.handShown){
    B.handShown=true;B.handShow=72;B.handMsg=B.msg;B.msg='빈손을 펴 보였다. 무쇠가 손바닥을 살핀다. "…손은 성하냐. 어디 보자."';renderBattleForms();return;
  }
  if(B.E.vinePath)bDrag=null;
  B.paused=true;const g=$('bGiftGrid');g.innerHTML='';
  $('bGiftHint').textContent='좋아하는 걸 주면 마음이 누그러진다. 건넨 물건은 돌아오지 않는다.';
  const ids=Object.keys(G.inv).filter(k=>G.inv[k]>0);
  if(!ids.length)g.appendChild(el('span','small','건넬 물건이 없다.'));
  ids.forEach(id=>{const b=el('button','gift');b.type='button';b.appendChild(icon(id));b.appendChild(el('span',null,ITEMS[id].n+' ×'+G.inv[id]));
    const taste=tasteOf(B.kind,id);
    if(taste&&knows('like:'+B.kind+':'+id))b.appendChild(el('span','small',taste.kind));
    b.onclick=()=>giveGift(id);g.appendChild(b);});
  $('bGiftMenu').hidden=false;
  renderBattleForms();
}
function closeGift(){$('bGiftMenu').hidden=true;if(B){B.paused=false;renderBattleForms();}}
function giveGift(id){
  if(!B||!B.paused||B.st==='end'||!has(id))return;
  const taste=tasteOf(B.kind,id);
  if(taste&&taste.kind==='싫어함'){
    $('bGiftHint').textContent=taste.line+' 물건은 보따리에 그대로 두었다.';return;
  }
  const after={...G.inv,[id]:G.inv[id]-1};
  if(progressShortage(after)>progressShortage(G.inv)){
    $('bGiftHint').textContent='이건 아직 쓸 데가 있어. 다른 걸 건네자.';return;
  }
  // 기존 선물의 진정수치가 우선이다. 새 가공품의 효과만 맛 표에서 더한다.
  const effect=taste&&taste.effect.match(/^calm:(\d+)$/);
  takeItem(id,1);const v=B.E.likes[id]||(effect?+effect[1]:0);
  if(v||(taste&&['아주 좋아함','좋아함'].includes(taste.kind)))learn('like:'+B.kind+':'+id);
  B.calm=Math.min(100,B.calm+(v||8));
  B.msg=taste?taste.line:v?((B.E.likeTexts&&B.E.likeTexts[id])||B.E.likeText):jo(ITEMS[id].n,'에는','에는')+' 별 관심이 없는 것 같다.';
  if(v&&B.E.vinePath)B.scentKnot={u:(B.px-BOX.x)/BOX.w,v:(B.py-BOX.y)/BOX.h,t:90};
  if(B.warm&&id==='dokkaebibul')B.warm.fire=180;
  closeGift();renderBHud();
  if(B.calm>=100){
    if(B.E.placeGift===id){B.giftPlace={x:B.px,y:B.py};B.st='giftPlace';B.t=60;B.mark=null;B.calmStone=null;B.bullets=[];B.msg='아빠의 소원 돌을 손으로 꼭대기에 얹는다.';}
    else bEnd('calm');
  }
}
$('bGift').onclick=openGift;$('bHit').onclick=()=>bStrike();$('bGiftClose').onclick=closeGift;
$('bFlee').onclick=()=>{if(B&&B.st!=='end'&&!B.paused)bEnd('flee');};
/* 기존 치기 버튼의 누름/놓기를 읽는다. 다른 보스의 클릭 처리는 그대로 둔다. */
const vinePointers=new Set();
[$('bHit'),document.querySelector('#pad [data-k="atk"]')].filter(Boolean).forEach(button=>{
  button.addEventListener('pointerdown',e=>{
    if(!B||!B.E.vinePath||B.paused||B.st!=='tell')return;
    vinePointers.add(e.pointerId);try{button.setPointerCapture(e.pointerId);}catch(_){}
    grabVine();
  });
  const release=e=>{vinePointers.delete(e.pointerId);if(B&&!B.paused&&B.E.vinePath)moveVine();};
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
});
addEventListener('blur',()=>{vinePointers.clear();});

function showResult(){
  const r=B.result,E=B.E;
  $('bResKick').textContent=E.npc?(r==='win'||r==='calm'?'시험 통과':'시험 실패'):(r==='win'?'승리':r==='calm'?'진정':'후퇴');
  $('bResTitle').textContent=r==='win'?E.win:r==='calm'?E.calmWin:r==='flee'?'일단 물러났다.':E.lose;
  $('bResText').textContent=B.bonus?B.bonus:B.loot.length?'얻은 것은 보따리에 챙겼다.':(r==='lose'||r==='flee')?(E.npc?'다시 말을 걸면 언제든 재도전할 수 있다.':'부위마다 공격이 다르다. 순서를 바꿔 다시 맞서 보자.'):'';
  const L=$('bLoot');L.innerHTML='';
  const cnt={};B.loot.forEach(id=>cnt[id]=(cnt[id]||0)+1);
  Object.keys(cnt).forEach(id=>{const d=el('div','loot');d.appendChild(icon(id));d.appendChild(el('span',null,ITEMS[id].n+(cnt[id]>1?' ×'+cnt[id]:'')));L.appendChild(d);});
  $('bResult').hidden=false;setTimeout(()=>$('bResOk').focus(),0);
}
$('bResOk').onclick=()=>{
  if(!B)return;const r=B.result,loot=B.loot.slice(),cb=B.onEnd,info={hits:B.hits};
  $('bResult').hidden=true;$('bGiftMenu').hidden=true;$('battle').hidden=true;document.body.classList.remove('in-battle');setPadLabels(false);
  touch.up=touch.down=false;vinePointers.clear();B=null;
  loot.forEach(id=>addItem(id,1));
  if(r==='lose'||r==='flee'){G.hp=G.maxhp;G.hurtT=60;}
  if(r==='lose')revertForm();   // 지면 너구리로 돌아온다
  $('goalM').querySelector('b').textContent='지금 할 일';lastGoal='';
  refreshHud();if(cb)cb(r,info);
};

/* 터치로 손 끌기 */
let bDrag=null;
bcv.addEventListener('pointerdown',e=>{if(!B||B.paused||B.handShow>0||B.st==='end'||B.st==='giftPlace'||bDrag)return;e.preventDefault();const r=bcv.getBoundingClientRect();bDrag={pointerId:e.pointerId,x:e.clientX,y:e.clientY,sx:LW/r.width,sy:LH/r.height};try{bcv.setPointerCapture(e.pointerId);}catch(_){}});
bcv.addEventListener('pointermove',e=>{if(!B||!bDrag||B.paused||B.handShow>0||B.st==='end'||B.st==='giftPlace'||e.pointerId!==bDrag.pointerId)return;const dx=(e.clientX-bDrag.x)*bDrag.sx*1.25,dy=(e.clientY-bDrag.y)*bDrag.sy*1.25;bDrag.x=e.clientX;bDrag.y=e.clientY;
  const speed=battleHandProfile().speed/TABLES.TUNING.battle_bare_speed;
  B.px=clamp(B.px+dx*speed,BOX.x+8,BOX.x+BOX.w-8);B.py=clamp(B.py+dy*speed,BOX.y+8,BOX.y+BOX.h-8);if(B.E.vinePath)moveVine();});
function endDrag(e){if(e&&bDrag&&e.pointerId!==bDrag.pointerId)return;bDrag=null;if(!e)vinePointers.clear();}bcv.addEventListener('pointerup',endDrag);bcv.addEventListener('pointercancel',endDrag);
bcv.addEventListener('lostpointercapture',endDrag);

/* ---------- 전투 화면 그리기 ---------- */
function drawTool(c,kind){
  c.lineCap='round';
  c.strokeStyle='#5a3e26';c.lineWidth=3.2;c.beginPath();c.moveTo(0,0);c.lineTo(0,-24);c.stroke();
  c.fillStyle=INK;
  if(kind==='sickle'){c.strokeStyle=INK;c.lineWidth=3.6;c.beginPath();c.arc(6,-24,7,Math.PI,Math.PI*1.95);c.stroke();c.lineWidth=1.2;c.strokeStyle='#efe3c8';c.beginPath();c.arc(6,-24,5.5,Math.PI*1.1,Math.PI*1.6);c.stroke();}
  else{c.beginPath();c.moveTo(-11,-22);c.quadraticCurveTo(0,-29,11,-22);c.lineTo(11,-24.5);c.quadraticCurveTo(0,-32,-11,-24.5);c.closePath();c.fill();}
}
function drawPaw(c,x,y){
  if(!B.handShow&&B.inv>0&&Math.floor(B.inv/5)%2)return;
  const form=battleForm();
  const near=B.mark&&Math.hypot(B.mark.x-B.px,B.mark.y-B.py)<battleHandProfile().radius;
  const tool=B.E.dodge&&!B.noTool?heldTool():B.autoToolT>0||(near&&battlePickaxe(B.mark.part))?'pickaxe':null;
  c.save();c.translate(x,y);c.scale(1.6,1.6);
  if(tool&&!B.noTool&&!B.handShow){
    const a=B.swing>0?(-1.5+(1-B.swing/12)*2.5):-0.35;
    c.save();c.translate(5,-3);c.rotate(a);drawTool(c,tool);c.restore();
  }
  if(form&&!B.handShow)drawFormPaw(c,form);
  else{
  // 손목
  blob(c,7,11,6.5,6,'#3a322b');
  // 손바닥 (오동통한 너구리 손)
  blob(c,0,2,9.5,8.5,'#4a4038');
  for(let i=0;i<4;i++)blob(c,-7.2+i*4.8,-6.2+(i===0||i===3?1.4:0),3.3,3.8,'#4a4038');
  blob(c,0.5,3.5,4.6,3.6,'#b9a38f');
  for(let i=0;i<4;i++)blob(c,-7.2+i*4.8,-6.4+(i===0||i===3?1.4:0),1.7,1.9,'#b9a38f');
  c.strokeStyle=INK;c.lineWidth=1.3;c.beginPath();c.ellipse(0,2,9.5,8.5,0,0,Math.PI*2);c.stroke();
  }
  if(B.swing>0&&!B.handShow){c.strokeStyle=INK;c.lineWidth=2;c.globalAlpha=B.swing/12;c.beginPath();c.arc(4,-6,20+(12-B.swing),-1.9,0.4);c.stroke();}
  c.restore();
}
function drawBonk(c){
  if(B.bonk>0){const x=B.px,y=B.py-24;c.save();c.strokeStyle=RED;c.lineWidth=2.4;c.globalAlpha=Math.min(1,B.bonk/12);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(x+Math.cos(a)*8,y+Math.sin(a)*8);c.lineTo(x+Math.cos(a)*(16+(34-B.bonk)*0.4),y+Math.sin(a)*(16+(34-B.bonk)*0.4));c.stroke();}
    c.fillStyle=RED;c.font='bold 20px "Gowun Batang", serif';c.textAlign='center';c.fillText('딱!',x+26,y-6);c.restore();}
  if(B.toolFly){const f=B.toolFly;c.save();c.translate(f.x,f.y);c.rotate(f.rot);c.globalAlpha=0.9;drawTool(c,heldTool());c.restore();}
}
function bDraw(){
  if(!B)return;const c=bctx;c.setTransform(BDPR,0,0,BDPR,0,0);
  if(B.bonk>20)c.translate(Math.sin(B.bonk*2.3)*3,0);
  if(paper)c.drawImage(paper,0,0,LW,LH);
  c.save();c.translate(LW/2,EY);c.scale(0.84,0.84);c.translate(-LW/2,-EY);
  B.E.draw(c);
  c.restore();
  if(B.E.cover)drawGolemAim(c);
  if(B.E.forgeTrial)drawForgeVoice(c);
  if(B.E.possession)drawPossession(c);
  // 글귀
  c.fillStyle=INK;c.textAlign='center';c.textBaseline='alphabetic';c.font='17px "Gowun Batang", "Batang", serif';
  const msg=B.msg||'';const maxW=LW-60;
  if(c.measureText(msg).width>maxW){const mid=Math.floor(msg.length/2);let cut=msg.lastIndexOf(' ',mid);if(cut<6)cut=msg.indexOf(' ',mid);if(cut<0)cut=mid;
    c.fillText(msg.slice(0,cut),LW/2,BOX.y-34);c.fillText(msg.slice(cut).trim(),LW/2,BOX.y-13);}
  else c.fillText(msg,LW/2,BOX.y-14);
  // 상자
  c.save();c.fillStyle='rgba(255,252,242,.55)';c.fillRect(BOX.x,BOX.y,BOX.w,BOX.h);c.restore();
  c.save();c.beginPath();c.rect(BOX.x,BOX.y,BOX.w,BOX.h);c.clip();
  if(B.E.cover)drawBattleCover(c);
  if(B.E.forgeTrial){drawForgeBench(c);if(B.forgeNext)drawForgeWork(c,B.forgeNext);}
  if(B.E.possession)drawPossessedAttack(c);
  if(B.vinePath)drawVinePath(c);
  for(const b of B.bullets)BULLETS[b.k].draw(c,b);
  if(B.warm)drawWarmPath(c);
  if(B.calmStone){if(B.E.calmAction.kind==='knot')drawCalmKnot(c);else drawWishStone(c);}
  if(B.scentKnot)drawScentKnot(c);
  if(B.returnItem||B.returnEcho)drawReturnedObject(c);
  if(B.mark){const m=B.mark,radius=battleHandProfile().radius;c.save();c.translate(m.x,m.y);
    c.strokeStyle=RED;c.lineWidth=3;c.beginPath();c.arc(0,0,radius,-Math.PI/2,-Math.PI/2+Math.PI*2*(m.t/m.max));c.stroke();
    c.fillStyle='rgba(180,67,42,.16)';c.beginPath();c.arc(0,0,radius-3,0,Math.PI*2);c.fill();
    c.fillStyle=RED;c.font='bold 15px "Gowun Batang", serif';c.textAlign='center';c.textBaseline='middle';c.fillText(m.part.name[0],0,1);c.restore();
    const near=Math.hypot(m.x-B.px,m.y-B.py)<radius;const lab=near?(TOUCH?'지금 치기!':'지금 J!'):(TOUCH?'치기':'J');
    c.save();c.font='bold 13px "Gowun Dodum", sans-serif';const tw=c.measureText(lab).width+12;const ly=m.y+(m.y>BOX.y+BOX.h-46?-44:30);
    c.fillStyle=near?RED:'rgba(255,250,238,.95)';c.strokeStyle=near?RED:INK;c.lineWidth=1.5;c.beginPath();c.rect(m.x-tw/2,ly-10,tw,20);c.fill();c.stroke();
    c.fillStyle=near?'#fff6e8':INK;c.textAlign='center';c.textBaseline='middle';c.fillText(lab,m.x,ly+1);c.restore();}
  if(B.handShow>0)drawOpenHands(c);
  else if(B.st!=='giftPlace')drawPaw(c,B.px,B.py);
  for(const f of B.fx)blob(c,f.x,f.y,f.r*(f.t/28),f.r*(f.t/28),f.col,Math.min(1,f.t/14));
  c.restore();
  if(B.giftPlace)drawPlacedGift(c);
  drawBonk(c);
  // 붓 테두리
  const X=BOX.x,Y=BOX.y,Wd=BOX.w,Ht=BOX.h;
  brush(c,[[X-3,Y+1],[X+Wd*0.5,Y-1],[X+Wd+3,Y+1]],4,INK);brush(c,[[X+Wd+1,Y-2],[X+Wd-1,Y+Ht*0.5],[X+Wd+1,Y+Ht+3]],4,INK);
  brush(c,[[X+Wd+2,Y+Ht+1],[X+Wd*0.5,Y+Ht+2],[X-3,Y+Ht]],4,INK);brush(c,[[X-1,Y+Ht+2],[X+1,Y+Ht*0.5],[X-1,Y-3]],4,INK);
}
