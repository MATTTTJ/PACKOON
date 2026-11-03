'use strict';
/* 전투: 부위 공략. 공격을 피하면 금빛 표식(빈틈)이 뜨고, 든 도구의 날(bAim)을 그 위로 옮겨 치면 부위 내구도가 깎인다.
   선물로 진정 게이지를 채워 달랠 수도 있다 (진정은 선물로만, D-243). 상대는 지역 파일이 defineEnemies 로 넣는다.

   상대 {name, calmLabel, intro, howto?, npc?, dodge?(피하기만 하는 시험: 버틸 공격 수), bonkText?(dodge 시작 때 연장을 뺏기는 글),
         parts:[{id, name, hp, atk(battle-attacks.js), mat?(부수면 얻는 아이템), core?, tell}],
         coreNeeds?(이 부위를 꺾어야 핵심이 드러남), likes:{아이템:진정 오름}, likeText, likeTexts?:{아이템:그 선물만의 글}, coreHidden, coreShown, calmWin, calmGift?, win, lose,
         settle?:true(공격 탄이 다 사라진 뒤에 빈틈을 연다. 옛 calmAction 도 이 뜻으로만 읽는다, D-243), markLife?:빈틈 유지 프레임, placeGift?:꼭대기에 얹을 선물 id,
         firstPart?:첫 공격 부위 id(첫 예고는 조금 길다), strike?():치기를 상대가 먼저 처리했으면 true, onMarkHit?(부위, 표식):붉은 표식을 친 뒤(재료 얻기 등),
         부위의 mark?:붉은 표식에 쓸 글자(없으면 이름 첫 글자),
         backdrop?(c):상대 뒤쪽 화면 전체 배경(결정 D-58. 판정 상자와 글귀 줄 위로는 상자·글이 덮는다), goalText?:지금 할 일 글,
         showHands?:첫 선물 때 빈손을 펴 보이는 장면, pickAttack?():공격을 직접 고른다(B.bullets 를 넣고 B.st='tell'),
         tickHazards?():매 프레임 상자 안 환경 위험, drawFloor?(c):상자 안 바닥 그림(탄 아래), drawOver?(c):상자 밖까지 날아가는 탄(상자 위에 잘리지 않게, 결정 D-182),
         finale?:{start(), step()→끝나면 true}(dodge 를 다 버틴 뒤 입력을 막는 마무리 연출. 그 뒤 'win'),
         possession?:{order:빙의 순서, attacks:부위별 시험판 공격, travel:불 이동 시간, wait:도착 뒤 대피 시간}, partPose?(id):그려진 부위 좌표,
         warmPath?:{width,wideWidth,attacks:부위별 공격},
         headPose?():그림의 머리 좌표, markPosition?(p):상자 안 되치기 표식 좌표, openMark?(p):공격 뒤 표식을 직접 정했으면 true,
         draw(c):수묵 그림, onWin(B)?:이겼을 때 보상, onCalm(B)?:달랬을 때 보상 (B.loot 에 넣고 B.bonus 에 글)} */
const bcv=$('bcv');const bctx=bcv.getContext('2d');
let B=null,inkOn=false,LW=800,LH=450,BOX={x:250,y:262,w:300,h:160},EY=118;const BDPR=2;
let paper=null;
/* 결정 D-225: 보스 전투에서 치는 것은 늘 도구다. 변신은 움직임 성질(빠르기·치기 대기·닿는 범위·버티기·예고 보기)만 바꾸고
   피해량은 도구가 정한다. NPC 피하기 시험(dodge)에서는 늘 너구리다.
   수치는 tuning.csv 의 battle_bare_*(너구리)·battle_<변신>_* 줄. 버튼은 열린 변신만 보인다 (자리는 옛 탈 버튼 자리). */
const BATTLE_FORM_TRAITS={'':'익숙함',squirrel:'빠름 · 좁음',goat:'느림 · 덜 아픔',owl:'예고 일찍 · 넓음',deer:'빠름 · 무적 김'};
const BATTLE_FORM_HINTS={'':'너구리 · 익숙한 몸놀림',squirrel:'다람쥐 · 빠르게 움직이고 좁게 닿는다',goat:'산양 · 느리지만 두 번 맞아야 한 칸',
  owl:'수리부엉이 · 예고가 일찍 보이고 넓게 닿는다',deer:'고라니 · 빠르고, 맞은 뒤 오래 버틴다'};
/* 결정 D-224: 보스 전투는 늘 도구로 친다(사용자 피드백 61).
   - 보스를 만나기 직전 손에 든 도구(G.tool)를 들고 들어간다. 가진 도구가 여럿이면 Q 키나 도구 단추로 전투 중에 바꾼다.
   - 가진 도구: 손에 든 연장(낫 또는 곡괭이)과, 무쇠가 돌려준 전투 곡괭이(G.f.battleTools 'pickaxe').
   - 부위마다 잘 먹는 도구는 boss_parts.csv 잘먹는도구 칸(p.tool). 잘 먹으면 battle_tool_good_damage 만큼 깎고
     (날 세운 낫이 더 크면 그 값), 안 먹으면 피해와 재료 확률에 battle_tool_bad_mult 를 곱한다. 칸이 비면 가리지 않는다. */
const BATTLE_TOOL_ORDER=['sickle','pick'];
function ownedBattleTools(){
  const own=new Set();
  if(G.tool==='sickle'||G.tool==='pick')own.add(G.tool);
  if(Array.isArray(G.f.battleTools)&&G.f.battleTools.includes('pickaxe'))own.add('pick');
  return BATTLE_TOOL_ORDER.filter(id=>own.has(id));
}
function battleTool(){return B&&!B.E.dodge&&!B.noTool?B.tool||null:null;}
function toolFit(p,tool=battleTool()){if(!p||!p.tool||!tool)return 'plain';return p.tool===tool?'good':'bad';}
function toolDamage(p,tool=battleTool()){
  const t=TABLES.TUNING,base=tool==='sickle'&&G.sharp?t.battle_sharp_damage:t.battle_base_damage,fit=toolFit(p,tool);
  return fit==='good'?Math.max(base,t.battle_tool_good_damage):fit==='bad'?base*t.battle_tool_bad_mult:base;
}
/* 재료를 얻을 확률: 안 먹는 도구면 낮아진다 */
function toolChance(p,chance,tool=battleTool()){return toolFit(p,tool)==='bad'?chance*TABLES.TUNING.battle_tool_bad_mult:chance;}
function toolName(id){return id==='sickle'?'낫':id==='pick'?'곡괭이':'';}
function switchBattleTool(id){
  if(!B||B.E.dodge||B.noTool||['end','finale'].includes(B.st))return false;
  const own=ownedBattleTools();if(own.length<2)return false;
  const before=B.tool;B.tool=id&&own.includes(id)?id:own[(own.indexOf(B.tool)+1)%own.length];
  if(B.tool===before)return true;
  // 결정 D-242: 바꾼 것을 글귀와 손 둘레의 고리로 바로 알린다
  B.toolSwap=14;B.msg=jo(toolName(B.tool),'을','를')+' 들었다.';Sound.playSfx('rhythm_click');renderBHud();return true;
}
function battleToolKey(k){if(!B||k!=='q')return false;switchBattleTool();return true;}
/* 결정 D-240: 보스 전투에서 치는 판정 점은 손바닥이 아니라 든 도구(곡괭이 날·낫 날)가 내리꽂히는 자리다 (사용자 피드백 2026-11-02).
   손(B.px, B.py)은 몸이라 공격에 맞는 자리 그대로이고, 금빛 칠 곳과의 거리는 bAim() 으로 잰다. 도구가 없으면(피하기 시험) 손 자리.
   도구 끝은 손에서 왼쪽 battle_aim_left·위 battle_aim_up(×battle_hand_scale) 자리이고, 손 그림의 도구도 이 점에 날이 오게 그린다. */
function bAim(){
  if(!B)return {x:0,y:0};
  const t=TABLES.TUNING,k=t.battle_hand_scale;
  if(!battleTool()||B.handShow>0)return {x:B.px,y:B.py};
  return {x:B.px-t.battle_aim_left*k,y:B.py-t.battle_aim_up*k};
}
/* 지금 칠 곳(빈틈)에 잘 먹는 도구가 따로 있고 그 도구를 가졌으면 그 id (결정 D-242) */
function wantedBattleTool(){
  if(!B||B.E.dodge||B.noTool)return null;
  const p=B.mark?B.mark.part:null,own=ownedBattleTools();
  return p&&p.tool&&p.tool!==battleTool()&&own.includes(p.tool)?p.tool:null;
}
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
    const tools=el('div','b-mask-buttons b-tool-buttons');tools.id='bToolButtons';tools.setAttribute('aria-label','전투 도구');wrap.appendChild(tools);
    const buttons=el('div','b-mask-buttons');buttons.id='bFormButtons';buttons.setAttribute('aria-label','전투 변신');
    wrap.appendChild(buttons);const hint=el('p','small');hint.id='bMaskHint';wrap.appendChild(hint);
    document.querySelector('.b-me').appendChild(wrap);
  }
  // 결정 D-382: 휴대폰은 변신 단추가 전투 그림을 가리지 않게 한다 (사용자 피드백 2026-11-03: 단추가 보스 전투를 가린다).
  //   세로는 무대 아래 빈자리로 옮긴다(물러나기도 함께). 가로는 이 줄을 숨기고(css) 필드와 같은 잎사귀 단추의 고리로 고른다.
  //   컴퓨터는 전처럼 오른쪽 위 내 체력 아래.
  const portrait=TOUCH&&matchMedia('(orientation:portrait)').matches,bme=document.querySelector('.b-me'),btns=$('bFlee').parentElement;
  const parent=portrait?$('padBattleTop'):bme;
  if(wrap.parentElement!==parent)parent.appendChild(wrap);
  if(portrait){if(btns.parentElement!==parent)parent.prepend(btns);}
  else if(btns.parentElement!==bme)bme.insertBefore(btns,wrap.parentElement===bme?wrap:null);
  // 결정 D-224: 도구 단추. 둘 이상 가졌을 때만 바꿀 수 있고, 하나면 든 도구만 보인다
  const own=B.E.dodge?[]:ownedBattleTools(),tools=$('bToolButtons');
  /* 결정 D-242: 도구 바꾸기를 한눈에 (사용자 피드백 2026-11-02: 무기를 어떻게 바꾸는지 안 보인다, D-227 의 키 글 금지보다 앞선다).
     가진 도구를 나란히 그림으로 두고 든 것은 먹색으로 채운다. 둘 이상이면 앞에 Q 키 표시(터치 화면은 단추만 누르면 된다).
     지금 빈틈에 잘 먹는 도구가 따로 있으면 그 단추가 금빛으로 깜박인다(B.toolWant, bStep 에서 갱신). */
  if(tools.dataset.ids!==own.join(',')){
    tools.dataset.ids=own.join(',');tools.innerHTML='';
    if(own.length>1&&!TOUCH){const kq=el('kbd','b-tool-key','Q');kq.title='Q 키로 도구 바꾸기';tools.appendChild(kq);}
    own.forEach(id=>{const button=el('button','bbtn b-tool');button.type='button';button.dataset.tool=id;
      button.appendChild(icon(id));button.appendChild(el('span','b-tool-name',toolName(id)));
      button.onclick=()=>switchBattleTool(id);tools.appendChild(button);});
  }
  tools.hidden=!own.length;
  // 결정 D-383: 휴대폰은 오른손 묶음의 '도구' 단추로 바꾼다(전투 그림 위의 도구 줄은 css 가 숨긴다). 하나뿐이면 든 것만 보이고 눌리지 않는다
  const pt=$('padTool');
  if(pt){const cur=battleTool()||'';pt.hidden=!own.length;pt.disabled=own.length<2;
    if(pt.dataset.tool!==cur){pt.dataset.tool=cur;pt.innerHTML='';if(cur){pt.appendChild(icon(cur));pt.appendChild(el('span','pt-name',toolName(cur)));}else pt.textContent='도구';}
    pt.classList.toggle('want',!!B.toolWant);pt.setAttribute('aria-label',cur?(own.length>1?'도구 바꾸기 · 지금 ':'든 도구 · ')+toolName(cur):'도구');}
  tools.querySelectorAll('button').forEach(button=>{const id=button.dataset.tool;button.disabled=own.length<2;
    button.setAttribute('aria-pressed',String(id===battleTool()));button.classList.toggle('want',id===B.toolWant);
    button.title=id===battleTool()?jo(toolName(id),'을','를')+' 들었다':jo(toolName(id),'으로','로')+' 바꾸기'+(TOUCH?'':' (Q)');});
  const ids=['',...(G.forms||[])],buttons=$('bFormButtons');
  if(buttons.dataset.ids!==ids.join(',')){
    buttons.dataset.ids=ids.join(',');buttons.innerHTML='';
    for(const id of ids){const key=id?FORM_IDS.indexOf(id)+1:0,button=el('button','bbtn');button.type='button';button.dataset.form=id;
      button.append(el('span','b-mask-key',key+' · '),formName(id));button.title=formName(id)+' · '+BATTLE_FORM_TRAITS[id];   // 결정 D-382: 휴대폰은 키 번호를 숨긴다
      button.appendChild(el('small','b-mask-trait',BATTLE_FORM_TRAITS[id]));
      button.onclick=()=>{if(id&&id===G.form)setForm('');else setForm(id);};buttons.appendChild(button);}
  }
  buttons.hidden=!G.forms?.length;
  wrap.hidden=!G.forms?.length&&!own.length;
  buttons.querySelectorAll('button').forEach(button=>{
    button.disabled=!formChangeAllowed();
    button.setAttribute('aria-pressed',String(button.dataset.form===battleForm()));
  });
  $('bMaskHint').textContent=B.E.dodge?'이번 시험은 연장 없이 피하기.':G.forms?.length?BATTLE_FORM_HINTS[battleForm()]:'';
  $('bMaskHint').hidden=!$('bMaskHint').textContent;
}
/* 부위의 id·이름·내구도·부수면 얻는 것·핵심 여부는 design/data/boss_parts.csv (js/data/tables.js) 에서,
   공격 종류(atk)와 예고 글(tell)은 지역 코드에서 받아 합친다. 순서는 표 순서 */
function tableParts(boss,extra){return TABLES.BOSS_PARTS[boss].map(p=>Object.assign({},p,extra[p.id]));}
function blayout(){
  const hand=B&&B.E.possession?{u:(B.px-BOX.x)/BOX.w,v:(B.py-BOX.y)/BOX.h}:null;
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
/* 결정 D-243: 진정은 선물로만 한다 (사용자 피드백 2026-11-02, D-11 을 바꿈). 공격 뒤 행동으로 달래는 장치
   (골렘의 기울어진 소원 돌, 도깨비의 장터 물건 돌려놓기, 강철이의 샘 얼음 걷기)를 엔진에서 뺐다. 상대에 calmAction 이 남아 있어도 진정은 오르지 않는다.
   calmAction 은 '공격 탄이 다 사라진 뒤에 빈틈을 연다'(settle) 뜻으로만 읽는다. 새로 쓸 때는 settle:true 를 쓴다. */
/* onEnd(결과, {hits}) 결과는 'win' | 'calm' | 'lose' | 'flee' */
function startBattle(kind,onEnd){
  const E=ENEMIES[kind];learn('fight:'+kind);
  closePanels();$('dlg').hidden=true;
  B={hoof:0,kind,E,parts:E.parts.map(p=>Object.assign({},p,{max:p.hp,broken:false,shake:0})),calm:0,
    px:0,py:0,inv:0,st:'intro',t:90,cur:null,last:null,mark:null,bullets:[],fx:[],cool:0,swing:0,atkT:0,atkDur:0,
    loot:[],msg:E.intro,onEnd,paused:false,time:0,result:null,firstHit:true,hits:0,hitThis:false,survived:0,noTool:false,toolFly:null,bonk:0,bonus:'',
    hitStop:0,quakeT:0,pops:[],cracks:[],impact:null,toolWant:null};
  document.body.classList.add('in-battle');$('battle').hidden=false;
  blayout();B.px=BOX.x+BOX.w/2;B.py=BOX.y+BOX.h*0.65;
  if(E.showHands){B.handShown=false;B.handShow=0;}
  if(E.possession){B.round=0;B.possession={from:'core',to:'core'};}
  if(E.warmPath)B.warm={current:{u:0.25,v:0.7},next:null,points:[],round:0,fire:0,dir:0};
  // 결정 D-224: 만나기 직전 손에 든 도구를 들고 들어간다. 든 것이 전투 도구가 아니면 가진 첫 도구
  if(!E.dodge){const own=ownedBattleTools();B.tool=own.includes(G.tool)?G.tool:own[0]||null;B.toolSwap=0;}
  $('bName').textContent=E.name;$('bCalmLabel').textContent=E.calmLabel;
  setPadLabels(true);renderBHud();
  // 결정 D-227: 전투 중 튜토리얼 같은 안내 글을 띄우지 않는다. 할 일 줄에는 상대 이름만 (피하기 시험은 그 시험의 글)
  const gm=$('goalM');gm.querySelector('b').textContent='전투';gm.querySelector('span').textContent=E.dodge&&E.goalText?E.goalText:E.name;
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
  // 결정 D-244: 방금 맞은 부위 줄은 이름과 내구도 칸이 한 번 번쩍인다 (친 바로 그 그리기에만 붙여 다시 그려도 되풀이하지 않는다)
  B.parts.forEach(p=>{const r=el('div','b-part'+(p.broken?' broken':'')+(p.hitAt!=null&&B.time-p.hitAt<2?' hit'+(p.hitGood?' good':''):''));r.appendChild(el('span','nm',p.name));
    // 결정 D-224: 부위 옆 작은 그림이 잘 먹는 도구다. 지금 든 도구와 맞으면 진하게
    if(p.tool&&!p.broken){const k=el('span','b-fit'+(p.tool===battleTool()?' on':''));k.title=toolName(p.tool)+'이 잘 먹는다';k.appendChild(icon(p.tool));r.appendChild(k);}
    // 안 먹는 도구로 친 반 칸은 칸의 반만 채운다
    const pp=el('span','pp');for(let i=0;i<p.max;i++){const d=document.createElement('i');const f=clamp(p.hp-i,0,1);if(f<=0)d.className='off';else if(f<1){d.className='half';d.style.setProperty('--f',Math.round(f*100)+'%');}pp.appendChild(d);}r.appendChild(pp);
    if(p.broken)r.appendChild(el('span','tag',B.E.npc?'꺾임':'부러짐'));else if(p.core&&hidden)r.appendChild(el('span','tag','가려짐'));
    wrap.appendChild(r);});
  }
  // 결정 D-245: 약한 공격(bHitMe 의 power<1)으로 쌓인 피해(B.hoof)는 남은 마지막 하트를 그만큼 비워 보인다
  const worn=clamp(B.hoof||0,0,1);
  $('bHearts').innerHTML=Array.from({length:G.maxhp},(_,i)=>i===G.hp-1&&worn>0.01?'<span class="part" style="--f:'+Math.round((1-worn)*100)+'%">♥</span>':'<span class="'+(i<G.hp?'':'off')+'">♥</span>').join('');
  $('bCalm').style.width=B.calm+'%';
  renderBattleForms();
}
function bLiving(){return B.parts.filter(p=>!p.broken);}
/* 핵심 부위는 다른 부위를 하나도 못 꺾었을 때 가려져 있다. 상대에 coreNeeds:'<부위 id>' 가 있으면 그 부위를 꺾어야 드러난다 */
function coreHidden(){const c=B.parts.find(p=>p.core);if(!c||c.broken)return false;
  if(B.E.coreNeeds)return !B.parts.find(p=>p.id===B.E.coreNeeds).broken;
  return B.parts.filter(p=>!p.core).every(p=>!p.broken);}
/* 상자 비율 좌표({u,v})를 화면 좌표로. 비율이라 화면 회전에도 자리를 유지한다 (온기 길·불씨가 쓴다).
   결정 D-341: 쓰는 보스가 없던 엄폐물(cover) 기능은 지웠다. */
function coverPoint(r){return {x:BOX.x+r.u*BOX.w,y:BOX.y+r.v*BOX.h};}
/* 수리부엉이 깃: 부위 공격 예고(tell)를 battle_owl_tell_lead 만큼 먼저 보여 준다 */
function chooseAttack(){
  chooseAttackBase();
  if(battleForm()==='owl'&&B.st==='tell')B.t+=TABLES.TUNING.battle_owl_tell_lead;
}
function chooseAttackBase(){
  Sound.playSfx('battle_warn');
  if(B.E.pickAttack){B.E.pickAttack();return;}
  if(B.E.possession){
    const rule=B.E.possession,order=rule.order,start=(order.indexOf(B.possession.to)+1)%order.length;
    const id=Array.from({length:order.length},(_,i)=>order[(start+i)%order.length]).find(id=>{const p=part(id);return !p.broken&&(!p.core||!coreHidden());});
    const p=part(id);B.round++;B.possession={from:B.possession.to,to:id};
    B.cur=p;B.last=p;B.st='tell';B.t=rule.travel+rule.wait;B.hitThis=false;
    const attack=bAttackDef(p);B.attackPlan=attack.prepare?attack.prepare():null;B.msg=p.tell;return;
  }
  const L=bLiving();let o=L.filter(p=>p!==B.last);if(!o.length)o=L;
  const first=!B.last&&B.E.firstPart?L.find(q=>q.id===B.E.firstPart):null;
  const p=first||o[Math.floor(Math.random()*o.length)];B.cur=p;B.last=p;B.st='tell';B.t=first?72:42;B.msg=p.tell;B.hitThis=false;
  if(B.E.warmPath){prepareWarmPath();B.t=80;}
}
/* 온기 길은 비율 좌표로 보관한다. 판정과 그림이 같은 꺾은선을 쓴다. */
function prepareWarmPath(){
  const w=B.warm;w.round++;
  // 결정 D-246: 같은 부위의 공격이 다음 차례에는 다른 방향에서 온다 (battle-attacks.js winterThreat 가 w.dir 로 읽는다)
  w.dirs=w.dirs||{};const k=B.cur.id;w.dir=w.dirs[k]=(w.dirs[k]??(Math.random()<0.5?1:0))^1;
  const tell=B.E.warmPath.tells&&B.E.warmPath.tells[k];if(tell)B.msg=tell[w.dir];
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
  if(B.E.openMark&&B.E.openMark(p))return;   // 결정 D-183: 표식 자리와 글을 상대가 직접 정한다
  if(p.core&&coreHidden()){B.mark=null;B.msg=B.E.coreHidden;return;}
  const aim=bAim();let x,y,n=0;do{x=BOX.x+30+Math.random()*(BOX.w-60);y=BOX.y+26+Math.random()*(BOX.h-52);n++;}while(Math.hypot(x-aim.x,y-aim.y)<70&&n<12);
  if(B.E.markPosition){const pos=B.E.markPosition(p);if(pos){x=pos.x;y=pos.y;}}
  const life=B.E.markLife||(B.warm?180:B.E.settle||B.E.calmAction?150:120);
  B.mark={x,y,t:life,max:life,part:p};B.msg=p.name+'에 빈틈.';   // 결정 D-227: 누를 키를 알려 주는 글은 쓰지 않는다
}
function bAttackDef(p){const mode=B.E.possession||B.E.warmPath;return ATTACKS[(mode&&mode.attacks&&mode.attacks[p.id])||p.atk];}
function attackTick(p){bAttackDef(p).tick(B.atkT,BOX.x,BOX.y,BOX.w,BOX.h);}
/* 하트는 정수다. 산양 발굽은 맞을 때마다 battle_goat_damage_taken 만큼 쌓고 1이 찰 때만 한 칸 준다 (0.5면 두 번에 한 칸).
   고라니는 맞은 뒤 무적 시간이 battle_deer_iframes 로 길다.
   결정 D-178: power 는 약한 공격의 피해(칡꽃 꽃가루 kudzu_scent_damage). 산양 배수와 곱해 같은 자리에 쌓는다. 맞았으면 true. */
function bHitMe(power=1){
  if(B.inv>0||B.st==='end'||B.st==='finale')return false;
  const form=battleForm(),t=TABLES.TUNING;let loss=1;
  if(form==='goat'||power!==1){B.hoof+=power*(form==='goat'?t.battle_goat_damage_taken:1);loss=Math.floor(B.hoof+1e-9);B.hoof-=loss;}
  G.hp-=loss;B.inv=form==='deer'?t.battle_deer_iframes:t.battle_iframes;B.hits++;B.hitThis=true;refreshHud();
  bSplash(B.px,B.py,loss?'#b4432a':'#6f6357');if(!loss&&form==='goat')B.msg='굳은 발굽이 버텼다!';
  if(G.hp<=0)bEnd('lose');
  return true;
}
function bSplash(x,y,col){for(let i=0;i<9;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*2.4;B.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:2+Math.random()*4,t:28,col:col||'#1d1814'});}}
function bStrike(){
  if(!B||B.paused||B.handShow>0||B.st==='end'||B.st==='giftPlace'||B.st==='finale')return;
  if(B.cool>0)return;
  if(B.noTool){B.msg='연장이 없다! 피하기만 하자.';B.cool=20;return;}
  B.cool=battleHandProfile().cooldown;B.swing=12;
  const aim=bAim(),hits0=B.parts.map(p=>p.hp);
  if(B.E.strike&&B.E.strike()){strikeFeedback(aim,hits0,true);return;}
  const m=B.mark;
  if(m&&Math.hypot(m.x-aim.x,m.y-aim.y)<battleHandProfile().radius){
    const p=m.part;
    p.hp=Math.max(0,p.hp-toolDamage(p));bSplash(m.x,m.y);B.mark=null;
    if(p.hp>0)Sound.playSfx('battle_hit');
    if(p.hp<=0)breakPart(p);else B.msg=toolHitText(p);
    if(B.E.onMarkHit&&B.st!=='end')B.E.onMarkHit(p,m);
  }   // 결정 D-227: 헛친 때 안내 글을 띄우지 않는다
  strikeFeedback(aim,hits0);
}
/* 결정 D-244: 타격감과 '어디를 쳤는지'. 친 뒤 부위 내구도가 줄었으면(상대가 치기를 직접 처리한 경우 포함)
   잠깐 멈춤(battle_hitstop), 친 자리의 먹 튐·금 간 자국·빛살, 부위 이름과 깎인 칸 글, 화면 흔들림, 부위 줄 번쩍임.
   잘 먹는 도구면 금빛이 더 크고, 안 먹는 도구면 잿빛으로 작다. 헛치면 도구 끝 자리에 흙먼지만 인다. */
/* 결정 D-330: own 이면 보스가 strike() 안에서 제 타격 그림(골렘 golemImpact)을 이미 냈다. 빛 고리·흔들림·금·파편은 건너뛰고 멈칫과 숫자만 낸다 */
function strikeFeedback(aim,hits0,own){
  if(!B)return;
  const t=TABLES.TUNING;let hit=null,loss=0;
  B.parts.forEach((p,i)=>{const d=hits0[i]-p.hp;if(d>loss){loss=d;hit=p;}});
  if(!hit&&own)return;
  if(!hit){B.impact={x:aim.x,y:aim.y,t:14,max:14,miss:true};
    for(let i=0;i<5;i++){const a=-Math.PI*(0.15+Math.random()*0.7),s=0.8+Math.random()*1.6;B.fx.push({x:aim.x,y:aim.y+2,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:1.6+Math.random()*2,t:18,col:'#8a7d6e'});}
    return;}
  const good=toolFit(hit)==='good',bad=toolFit(hit)==='bad',seed=Math.random()*6;
  hit.shake=good?22:16;hit.hitAt=B.time;hit.hitGood=good;
  B.hitStop=good?t.battle_hitstop+2:bad?Math.max(1,t.battle_hitstop-2):t.battle_hitstop;
  const n=Math.round(loss*10)/10;
  B.pops.push({x:aim.x,y:aim.y-26,t:46,text:hit.name+' −'+n,good,bad});if(B.pops.length>3)B.pops.shift();
  if(own){renderBHud();return;}
  if(!Vfx.reducedMotion)B.quakeT=good?10:bad?4:7;
  B.impact={x:aim.x,y:aim.y,t:22,max:22,good,bad,seed};
  B.cracks.push({x:aim.x,y:aim.y,t:70,seed,n:good?5:bad?2:4});if(B.cracks.length>4)B.cracks.shift();
  for(let i=0;i<(good?14:8);i++){const a=Math.random()*Math.PI*2,s=1.4+Math.random()*(good?3.4:2.2);B.fx.push({x:aim.x,y:aim.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:1.5+Math.random()*3.2,t:24,col:good?'#c98a12':bad?'#8a7d6e':INK});}
  renderBHud();
}
/* 결정 D-224: 친 뒤 한 줄. 잘 먹는지 아닌지만 짧게 */
function toolHitText(p,tool=battleTool()){
  const by=tool?jo(toolName(tool),'으로','로')+' ':'',fit=toolFit(p,tool);
  return by+jo(p.name,'을','를')+' 쳤다.'+(fit==='good'?' 잘 먹힌다!':fit==='bad'?' 잘 안 먹힌다.':'');
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
  if(B.st==='end')return;B.st='end';B.t=80;B.result=result;B.mark=null;B.bullets=[];
  if(result==='win'||result==='calm')Sound.playSfx(result==='calm'?'battle_soothe':'battle_victory');
  if(B.E.showHands)B.handShow=0;
  if(B.E.possession)B.attackPlan=null;
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
  // 결정 D-244: 친 순간 잠깐 멈춘다. 멈춘 동안에는 흔들림·튐만 흐르고 공격과 시간은 서 있다
  if(B.hitStop>0){B.hitStop--;if(B.quakeT>0)B.quakeT--;return;}
  B.time++;if(B.inv>0)B.inv--;if(B.cool>0)B.cool--;if(B.swing>0)B.swing--;if(B.toolSwap>0)B.toolSwap--;if(B.quakeT>0)B.quakeT--;
  if(B.impact&&--B.impact.t<=0)B.impact=null;
  for(const k of B.cracks)k.t--;B.cracks=B.cracks.filter(k=>k.t>0);
  for(const q of B.pops){q.t--;q.y-=0.45;}B.pops=B.pops.filter(q=>q.t>0);
  {const want=wantedBattleTool();if(want!==B.toolWant){B.toolWant=want;renderBattleForms();}}
  if(B.slowT>0)B.slowT--;
  if(B.warm&&B.warm.fire>0)B.warm.fire--;
  if(B.st!=='end'&&B.st!=='giftPlace'&&B.st!=='finale'){
    let dx=0,dy=0;
    if(keys['arrowleft']||keys['a']||touch.left)dx-=1;if(keys['arrowright']||keys['d']||touch.right)dx+=1;
    if(keys['arrowup']||keys['w']||touch.up)dy-=1;if(keys['arrowdown']||keys['s']||touch.down)dy+=1;
    if(dx&&dy){dx*=0.72;dy*=0.72;}
    const speed=battleHandProfile().speed*(B.slowT>0?B.slowK:1);   // 결정 D-178: 꽃가루에 맞으면 잠깐 느려진다
    B.px=clamp(B.px+dx*speed,BOX.x+8,BOX.x+BOX.w-8);B.py=clamp(B.py+dy*speed,BOX.y+8,BOX.y+BOX.h-8);
  }
  B.parts.forEach(p=>{if(p.shake>0)p.shake--;});
  if(B.bonk>0)B.bonk--;
  if(B.toolFly){const f=B.toolFly;f.vy+=0.25;f.x+=f.vx;f.y+=f.vy;f.rot+=0.32;}
  for(const f of B.fx){f.x+=f.vx;f.y+=f.vy;f.vx*=0.9;f.vy*=0.9;f.t--;}B.fx=B.fx.filter(f=>f.t>0);
  // 미뤄 둔 선물: 빈틈이 열리면 선물 창을 연다 (결정 D-64)
  if(B.giftQueued&&giftWindow()&&B.giftUsed!==giftKey()){openGift();if(B.paused)return;}
  switch(B.st){
    case 'intro':
      if(--B.t<=0){if(B.E.dodge&&!B.noTool){B.st='bonk';B.t=120;B.noTool=true;B.bonk=34;B.msg=B.E.bonkText;B.toolFly={x:B.px+10,y:B.py-12,vx:-3.2,vy:-5.5,rot:0};renderBHud();}else{B.st='idle';B.t=20;}}break;
    case 'bonk':if(B.t===60)B.msg='연장을 놓쳤다! 이번엔 피하기만 해야 한다.';if(--B.t<=0){B.st='idle';B.t=20;B.toolFly=null;}break;
    case 'idle':if(--B.t<=0)chooseAttack();break;
    case 'tell':if(--B.t<=0){B.st='atk';B.atkT=0;B.atkDur=bAttackDef(B.cur).dur;}break;
    case 'atk':attackTick(B.cur);if(++B.atkT>=B.atkDur){if(B.E.dodge)B.st='clear';else if(B.E.possession||B.E.warmPath||B.E.settle||B.E.calmAction)B.st='settle';else{B.st='open';B.opens=(B.opens||0)+1;openMark();}}break;
    case 'settle':if(!B.bullets.length){if(B.warm)finishWarmAttack();B.st='open';B.opens=(B.opens||0)+1;openMark();}break;
    case 'giftPlace':if(--B.t<=0){B.giftPlace=null;bEnd('calm');}break;
    case 'clear':if(!B.bullets.length){B.survived++;B.msg=(B.hitThis?'아야… 그래도 버텼다. ':'잘 피했다! ')+'('+B.survived+'/'+B.E.dodge+')';renderBHud();if(B.survived>=B.E.dodge){if(B.E.finale){B.st='finale';B.E.finale.start();}else bEnd('win');}else{B.st='idle';B.t=40;}}break;
    case 'finale':if(B.E.finale.step())bEnd('win');break;
    case 'open':
      if(B.mark&&--B.mark.t<=0){B.mark=null;B.msg='빈틈이 닫혔다.';}
      if(!B.mark&&!B.bullets.length){B.st='idle';B.t=36;}break;
    case 'end':if(--B.t<=0)showResult();return;
  }
  const X1=BOX.x,X2=BOX.x+BOX.w,Y1=BOX.y,Y2=BOX.y+BOX.h;
  for(const b of B.bullets)BULLETS[b.k].step(b,X1,X2,Y1,Y2);
  B.bullets=B.bullets.filter(b=>!b.dead);
  if(B.E.tickHazards&&B&&!['intro','bonk','end','finale'].includes(B.st))B.E.tickHazards();
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
/* 결정 D-64: 선물은 빈틈에만, 빈틈 하나에 하나. 부위 공략 전투는 빈틈(open), 피하기 시험(무쇠)은 판과 판 사이(idle·clear).
   빈틈이 아닐 때 누르면 다음 빈틈에 선물 창이 열리도록 미뤄 둔다. 인트로 중에는 받지 않는다. */
function giftWindow(){return !!B&&(B.E.dodge?['idle','clear'].includes(B.st):B.st==='open');}
function giftKey(){return B.E.dodge?'r'+B.survived:'o'+(B.opens||0);}
function giftLiked(id){const t=tasteOf(B.kind,id);return !!B.E.likes[id]||!!(t&&['아주 좋아함','좋아함'].includes(t.kind));}
function openGift(){
  if(!B||B.handShow>0||B.st==='end'||B.st==='giftPlace'||B.st==='finale'||!$('bResult').hidden)return;
  if(!giftWindow()||B.giftUsed===giftKey()){
    B.giftQueued=true;B.msg=B.st==='intro'?'아직 건넬 틈이 없다. 공격을 피한 뒤 빈틈에 건네자.':B.giftUsed===giftKey()?'이번 빈틈엔 벌써 건넸다. 다음 빈틈에 건네자.':'지금은 건넬 틈이 없다. 피한 뒤 빈틈에 건네자.';
    renderBattleForms();return;
  }
  B.giftQueued=false;
  if(B.E.showHands&&!B.handShown){
    B.handShown=true;B.handShow=72;B.handMsg=B.msg;B.msg='빈손을 펴 보였다. 무쇠가 손바닥을 살핀다. "…손은 성하냐. 어디 보자."';renderBattleForms();return;
  }
  B.paused=true;const g=$('bGiftGrid');g.innerHTML='';
  $('bGiftHint').textContent='좋아하는 걸 주면 마음이 누그러진다. 빈틈 하나에 하나만 건넬 수 있다.';
  // 결정 D-63: 집안 물건·귀한 것은 이 상대가 좋아하는 것만 꺼낸다.
  const ids=Object.keys(G.inv).filter(k=>G.inv[k]>0&&(!keepsake(k)||giftLiked(k)));
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
  const v=B.E.likes[id]||(effect?+effect[1]:0);
  // 결정 D-64: 좋아하지 않는 물건은 진정 0, 물건은 보따리에 그대로 둔다. 빈틈도 쓰지 않는다.
  if(!v){$('bGiftHint').textContent=(taste?taste.line:jo(ITEMS[id].n,'에는','에는')+' 별 관심이 없는 것 같다.')+' 물건은 보따리에 그대로 두었다.';return;}
  takeItem(id,1);learn('like:'+B.kind+':'+id);B.giftUsed=giftKey();
  B.calm=Math.min(100,B.calm+v);
  B.msg=taste?taste.line:((B.E.likeTexts&&B.E.likeTexts[id])||B.E.likeText);
  if(B.warm&&id==='dokkaebibul')B.warm.fire=180;
  closeGift();renderBHud();
  if(B.calm>=100){
    if(B.E.placeGift===id){B.giftPlace={x:B.px,y:B.py};B.st='giftPlace';B.t=60;B.mark=null;B.bullets=[];B.msg='아빠의 소원 돌을 손으로 꼭대기에 얹는다.';}
    else bEnd('calm');
  }
}
$('bGift').onclick=openGift;$('bHit').onclick=()=>bStrike();$('bGiftClose').onclick=closeGift;
// 결정 D-84: 물러나기는 한 번 더 눌러야 끝난다. 처음 누르면 글이 바뀌고 잠시 뒤 되돌아간다.
let fleeArmT=null;
function disarmFlee(){clearTimeout(fleeArmT);fleeArmT=null;const b=$('bFlee');b.classList.remove('armed');b.textContent='물러나기';}
$('bFlee').onclick=()=>{
  if(!B||B.st==='end'||B.st==='finale'||B.paused)return;
  if(!fleeArmT){const b=$('bFlee');b.classList.add('armed');b.textContent='정말 물러날까? 한 번 더';fleeArmT=setTimeout(disarmFlee,2600);return;}
  disarmFlee();bEnd('flee');
};
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
  touch.up=touch.down=false;B=null;
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
  B.px=clamp(B.px+dx*speed,BOX.x+8,BOX.x+BOX.w-8);B.py=clamp(B.py+dy*speed,BOX.y+8,BOX.y+BOX.h-8);});
function endDrag(e){if(e&&bDrag&&e.pointerId!==bDrag.pointerId)return;bDrag=null;}bcv.addEventListener('pointerup',endDrag);bcv.addEventListener('pointercancel',endDrag);
bcv.addEventListener('lostpointercapture',endDrag);

/* ---------- 전투 화면 그리기 ---------- */
/* 도구 그림. 자루 끝(0,0)에서 위로 len, 날의 가운데가 (0,-len) 이다 */
function drawTool(c,kind,len=25){
  const h=-len;
  c.lineCap='round';
  c.strokeStyle='#5a3e26';c.lineWidth=3.2;c.beginPath();c.moveTo(0,0);c.lineTo(0,h+1);c.stroke();
  c.fillStyle=INK;
  if(kind==='sickle'){c.strokeStyle=INK;c.lineWidth=3.6;c.beginPath();c.arc(6,h+1,7,Math.PI,Math.PI*1.95);c.stroke();c.lineWidth=1.2;c.strokeStyle='#efe3c8';c.beginPath();c.arc(6,h+1,5.5,Math.PI*1.1,Math.PI*1.6);c.stroke();}
  else{c.beginPath();c.moveTo(-11,h+3);c.quadraticCurveTo(0,h-4,11,h+3);c.lineTo(11,h+0.5);c.quadraticCurveTo(0,h-7,-11,h+0.5);c.closePath();c.fill();}
}
/* 결정 D-240: 손 그림의 도구는 날이 bAim() 자리에 오게 기운다. 손 안 쥔 자리(HAND_GRIP)에서 그 점까지 */
const HAND_GRIP={x:4,y:1};
function toolPose(){
  const t=TABLES.TUNING,dx=-t.battle_aim_left-HAND_GRIP.x,dy=-t.battle_aim_up-HAND_GRIP.y;
  return {a:Math.atan2(dx,-dy),len:Math.hypot(dx,dy)};
}
/* 너구리 손. palm 이면 손바닥(무쇠에게 빈손을 펴 보일 때), 아니면 결정 D-241: 도구를 쥔 손을 위에서 본 손등 */
function drawPaw(c,x,y,palm=false){
  if(!B.handShow&&B.inv>0&&Math.floor(B.inv/5)%2)return;
  const form=battleForm();
  // 결정 D-224: 보스 전투에서는 늘 고른 도구를 든다. 결정 D-226: 손 그림은 battle_hand_scale 배(옛 1.6배)로 작게
  const tool=B.E.dodge?(B.noTool?null:heldTool()):battleTool();
  const k=TABLES.TUNING.battle_hand_scale*(B.toolSwap>0?1+0.18*Math.sin(B.toolSwap/14*Math.PI):1);
  c.save();c.translate(x,y);c.scale(k,k);
  const holding=tool&&!B.noTool&&!B.handShow;
  if(holding){
    /* 내리꽂기: 누른 순간 날이 조준 자리에 꽂혀 눌린 채(납작하게) 멈춤 동안 머물고, 그 뒤 반동으로 살짝 들렸다가 제자리로 온다 */
    const pose=toolPose(),s=B.swing/12,stuck=s>0.75,lift=stuck?0:Math.sin(Math.PI*(1-s/0.75))*0.45,sq=stuck?0.9:1+lift*0.5;
    c.save();c.translate(HAND_GRIP.x,HAND_GRIP.y);c.rotate(pose.a+lift);c.scale(sq,sq);drawTool(c,tool,pose.len);c.restore();
  }
  if(form&&!B.handShow)drawFormPaw(c,form);
  else if(palm){
  // 손목
  blob(c,7,11,6.5,6,'#3a322b');
  // 손바닥 (오동통한 너구리 손)
  blob(c,0,2,9.5,8.5,'#4a4038');
  for(let i=0;i<4;i++)blob(c,-7.2+i*4.8,-6.2+(i===0||i===3?1.4:0),3.3,3.8,'#4a4038');
  blob(c,0.5,3.5,4.6,3.6,'#b9a38f');
  for(let i=0;i<4;i++)blob(c,-7.2+i*4.8,-6.4+(i===0||i===3?1.4:0),1.7,1.9,'#b9a38f');
  c.strokeStyle=INK;c.lineWidth=1.3;c.beginPath();c.ellipse(0,2,9.5,8.5,0,0,Math.PI*2);c.stroke();
  }else{
  // 손목과 손등: 손바닥 살은 보이지 않고 털 덮인 등만 보인다 (손바닥 그림보다 밝은 갈색 털)
  blob(c,6,12,6.5,6,'#2e2722');
  blob(c,0,3,9.5,8,'#5d4f43');
  c.strokeStyle=INK;c.lineWidth=1.3;c.beginPath();c.ellipse(0,3,9.5,8,0,0,Math.PI*2);c.stroke();
  // 손등 털결: 손목에서 손가락 쪽으로 짧게
  c.save();c.strokeStyle='#9a8878';c.globalAlpha=0.75;c.lineWidth=0.9;c.lineCap='round';c.beginPath();
  for(const [fx,fy] of [[-5,7],[-1.5,8.5],[2.5,7.5],[5.5,5],[-3,3.5],[1,4]]){c.moveTo(fx,fy);c.lineTo(fx-0.5,fy-2.8);}
  c.stroke();c.restore();
  // 자루를 감아쥔 손가락 넷: 손등 위 끝에 마디가 가로로 둥글게 솟고, 끝은 자루 너머로 말려 들어가 보이지 않는다
  for(let i=0;i<4;i++){const fx=-6.6+i*4.4,fy=-4.2+(i===0||i===3?1.1:0);
    blob(c,fx,fy,2.6,2.8,'#4a3f36');
    c.strokeStyle=INK;c.lineWidth=1;c.beginPath();c.ellipse(fx,fy,2.6,2.8,0,Math.PI*0.95,Math.PI*2.05);c.stroke();
    c.save();c.strokeStyle='#c9b7a4';c.globalAlpha=0.9;c.lineWidth=1;c.beginPath();c.arc(fx,fy+0.3,1.5,Math.PI*1.15,Math.PI*1.85);c.stroke();c.restore();}   // 마디의 밝은 등
  // 엄지: 오른쪽 옆에서 자루를 누른다
  blob(c,8.8,-0.6,2.8,3.6,'#4a3f36');c.strokeStyle=INK;c.lineWidth=1;c.beginPath();c.ellipse(8.8,-0.6,2.8,3.6,0.3,Math.PI*1.4,Math.PI*2.6);c.stroke();
  }
  c.restore();
}
/* 결정 D-240: 도구 날이 꽂힐 자리의 작은 조준 표시. 금빛 칠 곳에 들어가면 하얗게 밝아진다 */
function drawAim(c){
  if(!battleTool()||B.handShow>0||B.st==='giftPlace'||B.st==='end')return;
  if(B.inv>0&&Math.floor(B.inv/5)%2)return;
  const p=bAim(),m=B.mark,on=m&&Math.hypot(m.x-p.x,m.y-p.y)<battleHandProfile().radius,r=on?9:7;
  c.save();c.lineCap='round';
  c.strokeStyle=on?'#fffaf0':INK;c.globalAlpha=on?1:0.6;c.lineWidth=on?2.2:1.4;
  for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;c.beginPath();c.moveTo(p.x+Math.cos(a)*(r-3),p.y+Math.sin(a)*(r-3));c.lineTo(p.x+Math.cos(a)*(r+2),p.y+Math.sin(a)*(r+2));c.stroke();}
  if(on){c.strokeStyle=GOLD;c.lineWidth=1.4;c.beginPath();c.arc(p.x,p.y,r+4,0,Math.PI*2);c.stroke();}
  c.restore();
}
/* 결정 D-244: 친 자리의 효과. 꽂힌 순간의 고리·빛살, 남는 금 간 자국, 떠오르는 부위 이름과 깎인 칸 */
function drawImpact(c){
  for(const k of B.cracks){const a=Math.min(1,k.t/30);
    c.save();c.strokeStyle=INK;c.globalAlpha=0.7*a;c.lineWidth=1.4;c.lineCap='round';c.beginPath();
    for(let i=0;i<k.n;i++){const ang=k.seed+i*Math.PI*2/k.n+hash(i+k.seed)*0.5,l1=7+hash(i*2.3+k.seed)*7,l2=l1+4+hash(i*3.1+k.seed)*6;
      c.moveTo(k.x+Math.cos(ang)*3,k.y+Math.sin(ang)*3);c.lineTo(k.x+Math.cos(ang)*l1,k.y+Math.sin(ang)*l1);
      c.lineTo(k.x+Math.cos(ang+0.35)*l2,k.y+Math.sin(ang+0.35)*l2);}
    c.stroke();c.restore();}
  const m=B.impact;
  if(m){const e=1-m.t/m.max;
    if(m.miss){c.save();c.strokeStyle='#6f6357';c.globalAlpha=0.6*(1-e);c.lineWidth=1.4;c.beginPath();c.ellipse(m.x,m.y+3,6+e*8,2.5+e*3,0,0,Math.PI*2);c.stroke();c.restore();}
    else{const col=m.good?GOLD:m.bad?'#7d7368':INK,R=(m.good?16:m.bad?9:13)+e*(m.good?20:12);
      c.save();c.strokeStyle=col;c.globalAlpha=1-e;c.lineWidth=(m.good?4:2.6)*(1-e)+1;c.beginPath();c.arc(m.x,m.y,R,0,Math.PI*2);c.stroke();
      if(!m.bad){c.lineWidth=2.2;c.lineCap='round';c.beginPath();
        for(let i=0;i<8;i++){const a=m.seed+i*Math.PI/4,r1=R*0.55,r2=R*0.55+6+(m.good?8:4)*(1-e);c.moveTo(m.x+Math.cos(a)*r1,m.y+Math.sin(a)*r1);c.lineTo(m.x+Math.cos(a)*r2,m.y+Math.sin(a)*r2);}
        c.stroke();}
      if(e<0.35){c.globalAlpha=(0.35-e)/0.35*0.85;c.fillStyle=m.good?'#fff4cf':'#fffaf0';c.beginPath();c.arc(m.x,m.y,R*0.5,0,Math.PI*2);c.fill();}
      c.restore();}}
}
function drawPops(c){
  for(const q of B.pops){const a=Math.min(1,q.t/18);
    c.save();c.globalAlpha=a;c.font='bold 15px "Gowun Batang", "Batang", serif';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
    c.lineWidth=4;c.strokeStyle='rgba(255,250,240,.92)';c.strokeText(q.text,q.x,q.y);
    c.fillStyle=q.good?'#9a6608':q.bad?'#6f6357':INK;c.fillText(q.text,q.x,q.y);c.restore();}
}
/* 결정 D-242: 도구를 바꾸면 손 둘레에 금빛 고리가 한 번 퍼진다 */
function drawToolSwap(c){
  if(!(B.toolSwap>0)||B.handShow>0)return;const e=1-B.toolSwap/14,p=bAim();
  c.save();c.strokeStyle=GOLD;c.globalAlpha=1-e;c.lineWidth=2.4;c.beginPath();c.arc(p.x,p.y,8+e*18,0,Math.PI*2);c.stroke();c.restore();
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
  if(B.quakeT>0)c.translate(Math.sin(B.quakeT*2.9)*B.quakeT*0.28,Math.cos(B.quakeT*3.7)*B.quakeT*0.18);   // 결정 D-244: 친 순간 화면이 살짝 울린다
  if(paper)c.drawImage(paper,0,0,LW,LH);
  // 결정 D-58: NPC·보스 전투 배경은 상대 뒤쪽 화면 전체로 그린다 (물건 하나를 구석에 두지 않는다)
  if(B.E.backdrop)B.E.backdrop(c);
  c.save();c.translate(LW/2,EY);c.scale(0.84,0.84);c.translate(-LW/2,-EY);
  B.E.draw(c);
  c.restore();
  if(B.E.possession)drawPossession(c);
  // 글귀
  c.fillStyle=INK;c.textAlign='center';c.textBaseline='alphabetic';c.font='17px "Gowun Batang", "Batang", serif';
  const msg=B.msg||'';const maxW=LW-60;
  let msgW=c.measureText(msg).width,msgY=BOX.y-14;
  if(msgW>maxW){const mid=Math.floor(msg.length/2);let cut=msg.lastIndexOf(' ',mid);if(cut<6)cut=msg.indexOf(' ',mid);if(cut<0)cut=mid;
    c.fillText(msg.slice(0,cut),LW/2,BOX.y-34);c.fillText(msg.slice(cut).trim(),LW/2,BOX.y-13);msgW=c.measureText(msg.slice(0,cut)).width;msgY=BOX.y-34;}
  else c.fillText(msg,LW/2,BOX.y-14);
  // 결정 D-227: 공격 예고 동안 글귀 앞에 작은 위험 표시만 둔다
  if(B.st==='tell'&&!B.E.dodge)drawDangerSign(c,msg?LW/2-msgW/2-16:LW/2,msgY-6,1,B.t);
  // 상자
  c.save();c.fillStyle='rgba(255,252,242,.55)';c.fillRect(BOX.x,BOX.y,BOX.w,BOX.h);c.restore();
  c.save();c.beginPath();c.rect(BOX.x,BOX.y,BOX.w,BOX.h);c.clip();
  if(B.E.drawFloor)B.E.drawFloor(c);
  if(B.E.possession)drawPossessedAttack(c);
  for(const b of B.bullets)BULLETS[b.k].draw(c,b);
  if(B.warm)drawWarmPath(c);
  // 결정 D-228: 칠 수 있는 곳은 금빛으로만 강조한다(빨강·먹은 피할 것). 도구 날(bAim)이 닿으면 더 밝게 빛난다.
  //   작은 도구 그림은 그 부위에 잘 먹는 도구다.
  if(B.mark){const m=B.mark,radius=battleHandProfile().radius,a=bAim();
    drawStrikeSpot(c,m.x,m.y,radius,m.t/m.max,Math.hypot(m.x-a.x,m.y-a.y)<radius,m.part.tool);}
  drawImpact(c);
  if(B.handShow>0)drawOpenHands(c);
  else if(B.st!=='giftPlace'){drawPaw(c,B.px,B.py);drawAim(c);drawToolSwap(c);}
  for(const f of B.fx)blob(c,f.x,f.y,f.r*(f.t/28),f.r*(f.t/28),f.col,Math.min(1,f.t/14));
  c.restore();
  drawPops(c);
  if(B.E.drawOver)B.E.drawOver(c);
  if(B.giftPlace)drawPlacedGift(c);
  drawBonk(c);
  // 붓 테두리
  const X=BOX.x,Y=BOX.y,Wd=BOX.w,Ht=BOX.h;
  brush(c,[[X-3,Y+1],[X+Wd*0.5,Y-1],[X+Wd+3,Y+1]],4,INK);brush(c,[[X+Wd+1,Y-2],[X+Wd-1,Y+Ht*0.5],[X+Wd+1,Y+Ht+3]],4,INK);
  brush(c,[[X+Wd+2,Y+Ht+1],[X+Wd*0.5,Y+Ht+2],[X-3,Y+Ht]],4,INK);brush(c,[[X-1,Y+Ht+2],[X+1,Y+Ht*0.5],[X-1,Y-3]],4,INK);
}
