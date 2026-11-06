'use strict';
/* 강철이 전투의 이름 (설계 design/proposals/name-story.md §7, 사용자 지시 2026-11-03).
   상대에 names:{part,body,mouth()} 가 있을 때만 켜진다(지금은 강철이). battle.js 는 이 파일의 함수를 몇 군데에서 부르기만 한다.
   결정 D-432: 입의 '이름 부르기'. 입 차례 gangcheol_namecall_first 번째에 처음, 그 뒤 gangcheol_namecall_every 차례마다 한 번.
     피할 자리가 없다(탄이 없고 상자 가장자리가 하얗게 언다). 가장 최근에 받은 이름을 지어 준 이의 목소리로 부른다.
     손이 그쪽으로 홱 돌아가고 잠깐 움직이지 않는다. 그 이름패가 얼어 입으로 날아간다(loseName). 체력은 깎이지 않는다.
     입을 부수면 이 공격도 사라진다(부서진 부위는 고르지 않는다, D-370).
   결정 D-433: 잃은 이름 하나마다 치는 힘(name_power_loss)과 손 빠르기(name_speed_loss)가 준다. 바닥이 있다. 손 그림도 옅어진다.
     남은 이름이 없으면 아무 이름도 불리지 않는다. 넋이 빠지지는 않는다(본이름은 몸에 붙어 있지 않아 읽히지 않는다, 규칙 5).
   결정 D-434: '이름' 단추. 빈틈에 남은 이름 하나를 스스로 대면 지어 준 이의 목소리가 겹친다.
     그 이름은 이번 전투에서 먹히지 않고(못 박힘), 다음 한 번 치기는 잘 먹는 도구만큼 깎는다. 이름마다 한 전투에 한 번.
     첫 이름을 먹힌 뒤 처음 열리는 빈틈에 단추가 잠깐 깜박인다. 설명 글은 없다.
   결정 D-435: 몸통을 치면 삼킨 이름이 하나씩 돌아온다(물러났다 다시 온 첫 몸통 치기는 name_return_retry_bonus 개).
     몸통을 부수거나, 이기거나, 달래면 삼킨 이름이 모두 돌아온다(G.f.nameRestored). 물러나면 뱃속에 남는다(G.f.gangcheolSwallowed).
     달래면 입을 벌려 이름을 토해 낸다. '용'이라 불러 주면 하늘로 오르고, 불씨·떡이면 남쪽 바다로 떠난다.
   결정 D-1070 (사용자 지시 2026-11-06, design/proposals/name-story-v2.md §6.1): 이름 부르기는 피할 수 있다.
     강철이는 한 이름을 지어 준 이의 목소리로 세 번까지만 부른다(삼척 창귀 전승 "세 번은 못 들은 척, 네 번째가 사람").
     세 번 부르는 동안 손을 움직이거나 휘두르면(돌아보면) 그 이름을 삼킨다. 세 번을 참으면 그 이름은 이번 전투에서 다시 불리지 않는다.
   결정 D-1071 (§6.2): 별명을 다 먹었거나 강철이의 부위가 name_final_hp_ratio 밑으로 깎이면 한 번, 아빠 목소리로 아이 본이름을 부른다.
     이름은 화면에 내지 않는다(빈칸). 몸에 붙지 않은 이름이라 먹히지 않지만, 돌아보면 얼어붙어 크게 다친다. 참으면 빈틈이 길게 열린다.
   결정 D-1074 (§6.3): 까치 어르신의 깃이 있으면 전투마다 한 번, 돌아본 순간 "아가!" 소리가 겹쳐 그 이름을 지킨다. */
// 결정 D-1073: 넷째 변신 수달의 전투 손 설명 (battle.js 표에 더한다. 고라니 줄은 쓰이지 않는다)
if(typeof BATTLE_FORM_TRAITS!=='undefined'){BATTLE_FORM_TRAITS.otter='빠름 · 미끄러움';BATTLE_FORM_HINTS.otter='수달 · 미끄러지듯 빠르게 움직이고, 좁게 닿는다';}

/* 이름마다 두 목소리. call: 강철이가 그 이름을 지어 준 이의 목소리로 부르는 말. own: 아이가 스스로 댈 때 지어 준 이가 겹쳐 하는 말.
   표에 없는 이름(나중에 더한 별명)은 이름만 부른다 */
const NAME_VOICES={
  gal_powder_pedlar:{call:'가루 보부상! 이리 와 봐, 빨리!',own:'맞아, 가루 보부상! 내가 지었거든!'},
  gal_quiet_steps:{call:'사뿐발 보부상… 나 여기 있어…',own:'사뿐발 보부상! 발소리 작게!'},
  gal_water_hands:{call:'물소리 보부상, 이리 오너라.',own:'그래, 물소리 보부상. 물길은 네 손이 안다.'},   // 옛 저장 (물레방아를 뺐다, D-730)
  gal_kkachibap:{call:'까치밥 보부상, 이리 오너라.',own:'그래, 까치밥 보부상. 꼭대기 몇 알은 남길 줄 알지.'},   // 결정 D-730
  dol_stone_hand:{call:'돌손아.',own:'…그래. 돌손이로구나.'},
  dol_pack_friend:{call:'짐 동무! 이쪽 좀 받쳐 줘!',own:'그렇지, 짐 동무! 같이 받치자고!'},
  dol_windbreak:{call:'바람막이야, 이리 와 손 녹여라.',own:'그래, 바람막이. 바람 오는 쪽은 네가 막지.'},
  jangteo_kite:{call:'연 건지는 손! 연이 또 걸렸어!',own:'맞아, 연 건지는 손! 네가 건졌잖아!'},
  jangteo_yut:{call:'한판 벗, 한 판 더 해야지?',own:'암, 우리 한판 벗이지.'},
  jang_sangdan_maknae:{call:'상단 막내, 장부 들고 이리 오너라.',own:'…그래. 상단 막내다.'},
  yeongsan_snow_walker:{call:'…어이, 눈길 보부상.',own:'…그래. 눈길 보부상.'},
  yeongsan_soft_step:{call:'머, 멈춤이…? 거기 있어…?',own:'머, 멈춤이… 맞아. 넌 멈춰 줬잖아.'},
};
function nameVoice(n,kind){const v=NAME_VOICES[n.id];return v&&v[kind]||(kind==='call'?'…'+n.text+'.':'…그래. '+n.text+'.');}
const nameTune=()=>TABLES.TUNING;
function nameBattleOn(){return !!(B&&B.names);}
function nameBattleStart(){
  if(!B||!B.E.names)return;
  const swallowed=(G.f.gangcheolSwallowed||[]).filter(id=>(G.nicknames||[]).some(n=>n.id===id&&n.lost));
  B.names={eaten:swallowed,pinned:[],used:[],turns:0,lock:0,jerk:null,fly:null,echo:null,boost:false,queued:false,call:null,kept:[],finalDone:false,featherUsed:false,bigOpen:false,
    flash:false,firstEat:false,retry:!!G.f.gangcheolRetry&&swallowed.length>0,spit:null,fade:0};
}
/* 지금 잃은 이름 수. 앞 전투에서 먹히고 아직 못 되찾은 것도 센다 */
function namesLostNow(){return (G.nicknames||[]).filter(n=>n.lost).length;}
function namePowerMul(){if(!nameBattleOn())return 1;const t=nameTune();return Math.max(t.name_power_min,1-t.name_power_loss*namesLostNow());}
function nameSpeedMul(){if(!nameBattleOn())return 1;const t=nameTune();return Math.max(t.name_speed_min,1-t.name_speed_loss*namesLostNow());}
function nameLocked(){return nameBattleOn()&&B.names.lock>0;}
/* 이 입 차례가 이름 부르기인가. 그렇다면 예고(ntell)를 걸고 true */
function nameCallTurn(p){
  if(!nameBattleOn()||p.id!==B.E.names.part)return false;
  const t=nameTune(),N=B.names;N.turns++;
  const first=t.gangcheol_namecall_first,every=t.gangcheol_namecall_every;
  if(N.turns<first||(N.turns-first)%every)return false;
  B.cur=p;B.last=p;B.st='ntell';B.t=t.gangcheol_namecall_tell_frames;B.hitThis=false;
  B.msg='강철이가 숨을 깊이 들이켠다.';Sound.playSfx('battle_warn');
  return true;
}
function nameMouthAt(){const m=B.E.names.mouth&&B.E.names.mouth();return m||{x:LW/2-50,y:EY};}
/* 강철이가 얼마나 남았나 (부위 칸의 합) */
function gangLeft(){let h=0,m=0;for(const p of B.parts){h+=Math.max(0,p.hp);m+=p.max;}return m?h/m:1;}
/* 결정 D-1071: 마지막 부름(아빠 목소리, 본이름)이 올 때인가 */
function nameFinalDue(){return !B.names.finalDone&&(!namesHeld().length||gangLeft()<=nameTune().name_final_hp_ratio);}
/* 부름: 남은 이름 가운데 가장 최근에 받은 것(스스로 댔거나 세 번을 참은 이름은 다시 부르지 않는다).
   결정 D-1070: 바로 삼키지 않는다. N.call 을 열고 nameStep 이 세 번 부르며 손이 움직이는지 본다. */
function nameCallFire(){
  const t=nameTune(),N=B.names,held=namesHeld(),free=held.filter(n=>!N.pinned.includes(n.id)&&!N.kept.includes(n.id));
  B.st='ncall';B.t=t.gangcheol_namecall_after_frames;
  if(nameFinalDue()){
    N.finalDone=true;
    N.call={final:true,n:{id:'',text:'',by:'아빠'},k:0,t:0,moved:0,lx:B.px,ly:B.py};B.t=99999;return;
  }
  if(!held.length){
    B.msg='(…아무 이름도 불리지 않았다.)';
    // 빈 이름 칸 장면(큰 장터 D-136)을 겪었다면 장부가 스친다. 까닭은 말하지 않는다
    if(G.f.jangteoArcsKid2||G.f.jangteoArcsKid3)bLater('(…부엉 영감님 장부의 빈 칸이 떠오른다.)',T_LATER);
    return;
  }
  if(!free.length){B.msg='(…이번엔 아무도 돌아보게 하지 못했다.)';return;}   // 결정 D-434: 스스로 댄 이름·참아 낸 이름뿐
  N.call={final:false,n:free[free.length-1],k:0,t:0,moved:0,lx:B.px,ly:B.py};B.t=99999;
}
/* 세 번의 부름 글. 별명은 지어 준 이의 말투로, 본이름은 화면에 내지 않는다(빈칸) */
function nameCallLine(c){
  if(c.final)return ['"……, 이리 온."','"……."','"……? 아빠다."'][c.k-1];
  const n=c.n;return ['"'+nameVoice(n,'call')+'"','"'+n.text+'."','"…'+n.text+'?"'][c.k-1];
}
/* 부름 하나를 끝낸다. how: kept(세 번 참음)·feather(깃이 지킴)·eaten(삼킴)·frozen(본이름에 돌아봄) */
function nameCallEnd(how){
  const t=nameTune(),N=B.names,c=N.call;N.call=null;
  B.t=t.gangcheol_namecall_after_frames;
  if(c.final){
    if(how==='frozen'){
      // 결정 D-1071: 몸에 붙지 않은 이름이라 먹히지는 않는다. 아빠 목소리에 몸이 얼어붙어 한 차례 내내 움직이지 못하고 크게 다친다
      N.lock=t.name_final_lock_frames;
      for(let i=0;i<t.name_final_damage&&B.st!=='end';i++){B.inv=0;bHitMe();}
      bLater('(…아빠 이름을 먹을 때, 아빠가 기억하던 것까지 먹었구나.)',T_LATER);
      Sound.playSfx('battle_part_break');
    }else{
      // 참았다(깃이 지킨 것도 같다). 강철이가 크게 흔들리고 빈틈이 길게 열린다
      N.bigOpen=true;B.quakeT=Math.max(B.quakeT||0,24);
      bLater('(아빠는 집 밖에선 그 이름을 안 불렀어.)',40);
      bLater('강철이가 크게 흔들린다. 입 속에 무언가 비친다.',T_LATER);
      Sound.playSfx('battle_soothe');
    }
    renderBHud();return;
  }
  const n=c.n;
  if(how==='kept'||how==='feather'){
    if(!N.kept.includes(n.id))N.kept.push(n.id);
    bLater(how==='feather'?'(…돌아보지 않았다. '+n.text+', 지켰다.)':'(…세 번. 참았다.)',30);
    Sound.playSfx('battle_soothe');renderBHud();return;
  }
  // 삼킨다: 손이 소리 난 쪽(입)으로 홱 돌아가고 잠깐 움직이지 않는다
  const m=nameMouthAt(),dx=m.x-B.px,dy=m.y-B.py,d=Math.hypot(dx,dy)||1;
  N.jerk={vx:dx/d*5,vy:dy/d*5,t:7};N.lock=t.gangcheol_namecall_lock_frames;
  N.fly={text:n.text,x:B.px,y:B.py-18,t:0,max:46};
  loseName(n.id);if(!N.eaten.includes(n.id))N.eaten.push(n.id);
  G.f.gangcheolSwallowed=[...N.eaten];
  if(!N.firstEat){N.firstEat=true;N.flash=true;}
  // 결정 D-1078: 이름에 쌓인 기억도 함께 나간다 (수첩 그 길의 기록이 흐려진다, book.js)
  bLater('(…'+n.text+'? 누가 나를 그렇게 불렀더라.)',T_LATER);
  Sound.playSfx('battle_part_break');renderBHud();
}
/* 결정 D-1070: 부르는 중. 첫 부름 뒤로 손이 움직이거나 휘두르면 돌아본 것이다 */
function nameCallStep(){
  const t=nameTune(),N=B.names,c=N.call;if(!c)return;
  if(c.k>=1){
    c.moved+=Math.hypot(B.px-c.lx,B.py-c.ly);
    if(B.swing>0)c.moved+=t.name_call_move_px+1;
  }
  c.lx=B.px;c.ly=B.py;
  if(c.k>=1&&c.moved>t.name_call_move_px){
    if(has('magpie_feather')&&!N.featherUsed){
      N.featherUsed=true;
      N.echo={by:'늙은 까치',text:'"아가!"',t:120,max:120,warm:true};B.msg='(깃이 떨린다. 귓가에서 "아가!" 하는 소리가 겹친다.)';
      nameCallEnd(c.final?'kept':'feather');return;
    }
    nameCallEnd(c.final?'frozen':'eaten');return;
  }
  if(--c.t>0)return;
  if(c.k>=3){nameCallEnd('kept');return;}
  c.k++;c.t=t.name_call_interval_frames;
  N.echo={by:c.n.by,text:'',t:t.name_call_interval_frames,max:t.name_call_interval_frames,cold:true};
  B.msg=nameCallLine(c)+' ('+c.k+')';
  if(c.k===1&&c.final)bLater('(…내 이름이다. 아빠 목소리로.)',12);
  else if(c.k===1&&!N.taboo&&knows('lore:three_calls')){N.taboo=true;bLater('(세 번은… 못 들은 척.)',12);}
  Sound.playSfx('battle_warn');
}
function nameStep(){
  if(!nameBattleOn())return;const N=B.names;
  if(N.call&&B.st==='ncall')nameCallStep();
  if(N.bigOpen&&B.st==='open'&&B.mark){N.bigOpen=false;B.mark.t+=nameTune().name_final_open_bonus;B.mark.max+=nameTune().name_final_open_bonus;}
  if(N.lock>0)N.lock--;
  if(N.jerk&&N.jerk.t-->0){B.px=clamp(B.px+N.jerk.vx,BOX.x+8,BOX.x+BOX.w-8);B.py=clamp(B.py+N.jerk.vy,BOX.y+8,BOX.y+BOX.h-8);}
  if(N.fly&&++N.fly.t>=N.fly.max)N.fly=null;
  if(N.echo&&--N.echo.t<=0)N.echo=null;
  if(N.spit)N.spit.t++;
  const target=Math.min(nameTune().name_hand_fade_max,nameTune().name_hand_fade*namesLostNow());
  N.fade+=(target-N.fade)*0.08;
  if(N.queued&&B.st==='open'&&!B.paused){N.queued=false;openNameMenu();}
  // 깜박임은 첫 이름을 먹힌 뒤 처음 열린 빈틈 하나 동안만
  if(N.flash){if(B.st==='open')N.flashSeen=true;else if(N.flashSeen)N.flash=false;}
  const btn=$('bNames');if(btn)btn.classList.toggle('want',N.flash&&B.st==='open');
}
/* 친 부위가 몸통이면 삼킨 이름이 돌아온다 */
function nameOnPartHit(p){
  if(!nameBattleOn()||p.id!==B.E.names.body)return;
  const N=B.names;if(!N.eaten.length)return;
  const t=nameTune();
  let k=p.broken?N.eaten.length:N.retry?t.name_return_retry_bonus:t.name_return_on_body_hit;N.retry=false;
  const back=N.eaten.splice(Math.max(0,N.eaten.length-k),k);
  restoreNames(back);G.f.gangcheolSwallowed=[...N.eaten];
  const texts=(G.nicknames||[]).filter(n=>back.includes(n.id)).map(n=>n.text);
  texts.forEach((s,i)=>B.pops.push({x:B.px+(i%2?18:-18),y:B.py-40-i*14,t:60,text:s,good:true}));
  bLater(texts.length>1?'(…그래, 다 나였지.)':'(…'+texts[0]+'. 그래, 나였지.)',p.broken?T_LATER*2:30);
  renderBHud();
}
/* 끝: 이기거나 달래면 모두 돌아온다. 물러나거나 지면 뱃속에 남는다 */
function nameBattleEnd(result){
  if(!nameBattleOn())return;const N=B.names;
  if(result==='win'||result==='calm'){
    const lost=(G.nicknames||[]).filter(n=>n.lost).map(n=>n.text);
    restoreNames();N.eaten=[];G.f.gangcheolSwallowed=[];G.f.gangcheolRetry=false;G.f.nameRestored=true;
    if(result==='calm'&&B.lastGift==='lore:yong')G.f.gangCalmYong=true;
    N.spit={texts:lost,t:0};N.fly=null;N.lock=0;
  }else{
    G.f.gangcheolSwallowed=[...N.eaten];G.f.gangcheolRetry=N.eaten.length>0;
    // 결정 D-435: 첫 물러남(지거나 물러남)에는 넋 빠진 아빠가 아이를 얼음 가에서 끌어낸다. 장면은 영산 이야기가 이 표시를 읽어 잇는다
    if(!G.f.nameDadPulled)G.f.nameDadPullDue=true;
  }
  renderBHud();
}
/* 달래며 끝난 글: '용'이라 불러 주었으면 하늘로 오른다 */
function calmWinText(){return B.lastGift&&B.E.calmWinBy&&B.E.calmWinBy[B.lastGift]||B.E.calmWin;}
/* 부위 줄 아래 이름패 줄. 무엇인지 설명하지 않는다 */
function renderNameTags(wrap){
  if(!nameBattleOn()||!(G.nicknames||[]).length)return;
  const row=el('div','b-names');
  for(const n of G.nicknames){
    const tag=el('span','b-nametag'+(n.lost?' lost':'')+(B.names.pinned.includes(n.id)?' pinned':''),n.lost?'':n.text);
    tag.title=n.lost?'':n.text;row.appendChild(tag);
  }
  wrap.appendChild(row);
  const btn=$('bNames');if(btn)btn.disabled=!B.names.pinned.length&&!namesHeld().length;
}
/* '이름' 단추: 빈틈에만. 빈틈이 아니면 다음 빈틈에 연다(선물과 같은 결, D-64) */
function openNameMenu(){
  if(!nameBattleOn()||B.paused||B.handShow>0||['end','finale','giftPlace'].includes(B.st)||!$('bResult').hidden)return;
  const N=B.names;N.flash=false;
  if(B.st!=='open'){N.queued=true;B.msg='지금은 이름을 댈 틈이 없다.';return;}
  B.paused=true;const g=$('bGiftGrid');g.innerHTML='';
  $('bGiftMenu').querySelector('.b-gift-head span').textContent='어떤 이름을 댈까?';
  $('bGiftHint').textContent='';
  const left=namesHeld().filter(n=>!N.used.includes(n.id));
  if(!left.length)g.appendChild(el('span','small','댈 이름이 없다.'));
  left.forEach(n=>{const b=el('button','gift name');b.type='button';b.appendChild(el('b',null,n.text));b.appendChild(el('span','small',n.by));
    b.onclick=()=>chooseName(n.id);g.appendChild(b);});
  $('bGiftMenu').hidden=false;renderBattleForms();
}
function chooseName(id){
  if(!nameBattleOn()||!B.paused)return;
  const N=B.names,n=namesHeld().find(x=>x.id===id);if(!n||N.used.includes(id))return;
  N.used.push(id);if(!N.pinned.includes(id))N.pinned.push(id);N.boost=true;
  N.echo={by:n.by,text:'"'+nameVoice(n,'own')+'"',t:150,max:150,warm:true};
  B.msg='(나는 '+jo(n.text,'이다','다')+'.)';
  closeGift();Sound.playSfx('battle_soothe');renderBHud();
}
/* 다음 한 번 치기: 도구가 안 맞아도 잘 먹는 도구만큼, 그 뒤 잃은 이름만큼 힘이 준다 */
function nameStrikeDamage(p,base){
  if(!nameBattleOn())return base;
  let d=base;
  if(B.names.boost){B.names.boost=false;B.names.boosted=true;d=Math.max(d,toolDamage(p,p.tool||battleTool()));}
  return d*namePowerMul();
}
function nameHitText(p){if(!nameBattleOn()||!B.names.boosted)return null;B.names.boosted=false;return jo(p.name,'을','를')+' 쳤다. 잘 먹힌다!';}

/* ---------- 그리기 ---------- */
const NAME_PORTRAITS={};
function namePortrait(by){
  if(!by)return null;
  if(!(by in NAME_PORTRAITS))NAME_PORTRAITS[by]=portraitNpc(by)?portrait(by):null;
  return NAME_PORTRAITS[by];
}
/* 예고: 상자 가장자리가 안쪽으로 하얗게 언다. 피할 자리가 없다는 표시 */
function drawNameFrost(c){
  if(!nameBattleOn())return;
  const tell=B.st==='ntell',call=B.st==='ncall';if(!tell&&!call)return;
  const t=nameTune(),k=tell?1-B.t/t.gangcheol_namecall_tell_frames:B.names.call?1:Math.max(0,Math.min(1,B.t/t.gangcheol_namecall_after_frames));
  const X=BOX.x,Y=BOX.y,W=BOX.w,H=BOX.h,d=6+k*26;
  c.save();c.globalAlpha=0.25+0.55*k;c.fillStyle='#f4f8fb';
  c.fillRect(X,Y,W,d);c.fillRect(X,Y+H-d,W,d);c.fillRect(X,Y,d,H);c.fillRect(X+W-d,Y,d,H);
  c.strokeStyle='#ffffff';c.lineWidth=1.4;c.globalAlpha=0.5+0.5*k;c.beginPath();
  for(let i=0;i<18;i++){const u=hash(i*3.7),side=i%4,l=6+hash(i*1.9)*12*k;
    const [x,y,nx,ny]=side===0?[X+u*W,Y+d,0,1]:side===1?[X+u*W,Y+H-d,0,-1]:side===2?[X+d,Y+u*H,1,0]:[X+W-d,Y+u*H,-1,0];
    c.moveTo(x,y);c.lineTo(x+nx*l+ny*3,y+ny*l+nx*3);}
  c.stroke();c.restore();
}
/* 손이 옅어진다: 잃은 이름만큼 종이빛을 손 위에 덮는다 */
function drawNameFade(c){
  if(!nameBattleOn()||B.names.fade<0.01||B.handShow>0)return;
  const g=c.createRadialGradient(B.px,B.py,2,B.px,B.py,30);
  g.addColorStop(0,'rgba(239,227,200,'+B.names.fade.toFixed(3)+')');g.addColorStop(1,'rgba(239,227,200,0)');
  c.save();c.fillStyle=g;c.beginPath();c.arc(B.px,B.py,30,0,Math.PI*2);c.fill();c.restore();
}
function drawNameTag(c,x,y,text,frost,alpha){
  c.save();c.globalAlpha=alpha;c.font='bold 12px "Gowun Batang", "Batang", serif';c.textAlign='center';c.textBaseline='middle';
  const w=c.measureText(text).width+12;
  c.fillStyle=frost?'#eef4f8':'#c8a274';c.strokeStyle=INK;c.lineWidth=1.2;
  c.beginPath();c.rect(x-w/2,y-9,w,18);c.fill();c.stroke();
  c.fillStyle=frost?'#7d8c96':INK;c.fillText(text,x,y+0.5);c.restore();
}
function drawNames(c){
  if(!nameBattleOn())return;const N=B.names;
  drawNameFrost(c);
  // 먹힌 이름패가 얼며 입으로 날아간다
  if(N.fly){const f=N.fly,e=f.t/f.max,m=nameMouthAt(),mx=(f.x+m.x)/2,my=Math.min(f.y,m.y)-40;
    const x=(1-e)*(1-e)*f.x+2*(1-e)*e*mx+e*e*m.x,y=(1-e)*(1-e)*f.y+2*(1-e)*e*my+e*e*m.y;
    drawNameTag(c,x,y,f.text,e>0.25,1-Math.max(0,e-0.8)*5);}
  // 지어 준 이의 목소리: 초상이 흐리게 비치고, 스스로 댄 때는 그 말이 겹친다
  if(N.echo){const E=N.echo,a=Math.min(1,E.t/30,(E.max-E.t+1)/12),pic=namePortrait(E.by);
    const y=BOX.y+22;
    if(pic){c.save();c.globalAlpha=a*(E.cold?0.35:0.55);c.imageSmoothingEnabled=false;c.drawImage(pic,E.text?LW/2-150:LW/2-30,y-24,60,48);c.restore();}
    if(E.text){c.save();c.globalAlpha=a*0.85;c.font='15px "Gowun Batang", "Batang", serif';c.textAlign='left';c.textBaseline='middle';
      c.lineJoin='round';c.lineWidth=4;c.strokeStyle='rgba(255,250,240,.9)';c.strokeText(E.text,LW/2-84,y);
      c.fillStyle=E.warm?'#7a5520':'#5a6a74';c.fillText(E.text,LW/2-84,y);c.restore();}}
  // 달래거나 이기면 입을 벌려 삼킨 이름을 토해 낸다
  if(N.spit&&N.spit.texts.length){const m=nameMouthAt(),n=N.spit.texts.length;
    N.spit.texts.forEach((s,i)=>{const e=Math.min(1,(N.spit.t-i*4)/60);if(e<=0)return;
      const a=-Math.PI*0.95+i/Math.max(1,n-1)*Math.PI*0.9,r=30+e*140;
      drawNameTag(c,m.x+Math.cos(a)*r,m.y+Math.sin(a)*r*0.7+e*e*30,s,e<0.3,1-Math.max(0,e-0.75)*4);});}
}
