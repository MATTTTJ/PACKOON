'use strict';
/* 마지막 보스 어둑차사 전투의 이름 (설계 design/proposals/name-story.md §7, name-story-v2.md §6, name-story-v3.md §3.4).
   상대에 names:{part,body,mouth()} 가 있을 때만 켜진다(지금은 어둑차사, 보스 id gangcheol). battle.js 는 이 파일의 함수를 몇 군데에서 부르기만 한다.
   결정 D-1140 (사용자 지시 2026-11-07, name-story-v3.md §3.4-1 삼혼 부르기): 이름 부르기는 상대의 pickAttack 이 정한 차례에 nameCallBegin 으로 연다.
     예고: 적패지가 들리고 판 가장자리에 붉은 먹이 번진다. 이름 하나를 지어 준 이의 목소리로 세 번 부른다.
     첫째·둘째 부름은 귀를 당길 뿐이다. 손이 보스 쪽으로 조금씩 끌려가고, 손은 움직여도 된다.
     셋째 부름 동안 붉은 붓 획이 판 위를 가로지르며 차오른다. 이때 손이 움직이거나 휘두르면(돌아보면) 그 이름이 명부에 적혀 먹힌다.
     둘째와 셋째 사이의 짧은 틈에는 적패지에 칠 자리가 뜬다. 치면 부름이 끊겨 셋째가 오지 않는다.
     적패지가 부서지면 붓 획이 흐려져 셋째 부름에 조금 움직여도 적히지 않는다(name_call_move_px_torn).
   결정 D-433: 잃은 이름 하나마다 치는 힘(name_power_loss)과 손 빠르기(name_speed_loss)가 준다. 바닥이 있다. 손 그림도 옅어진다.
     남은 이름이 없으면 아무 이름도 불리지 않는다. 넋이 빠지지는 않는다(본이름은 몸에 붙어 있지 않아 읽히지 않는다, 규칙 5).
   결정 D-434: '이름' 단추. 빈틈에 남은 이름 하나를 스스로 대면 지어 준 이의 목소리가 겹친다.
     그 이름은 이번 전투에서 먹히지 않고(못 박힘), 다음 한 번 치기는 잘 먹는 도구만큼 깎는다. 이름마다 한 전투에 한 번.
     첫 이름을 먹힌 뒤 처음 열리는 빈틈에 단추가 잠깐 깜박인다. 설명 글은 없다.
   결정 D-1141 (§3.4-4, 결정 D-1271로 바뀜): 먹힌 이름은 패턴을 피한 뒤 빈틈에 판 바닥에서 떠오른다. 치면 하나씩 돌아온다(nameReturnIds).
     예전의 쪽지 문 까마귀는 뺐다(사용자 지시 2026-11-08 34·38: 까마귀 떼는 한 몸 같은 큰 떼로, 약점은 바닥의 이름으로).
     소매를 부수면 먹힌 이름이 모두 돌아온다. 이기거나 달래면 모두 돌아온다(G.f.nameRestored).
     물러나면 명부에 남는다(G.f.gangcheolSwallowed, 옛 저장 키 그대로).
   결정 D-1272: 붉은 오랏줄에 묶인 채 오래 버티면 이름 하나를 빼앗긴다(nameBindTarget·nameTake, 부름과 같은 결과).
   결정 D-1275: 부름마다 나레이션과 메아리(nameEchoes). 온 방향에서 이름이 빠르게 떴다가 천천히 사라진다.
   결정 D-1142 (§3.4-5 명부 펼치기): 마지막 부름(아빠 목소리, 본이름)은 발악 끝에 한 번 온다. 이름은 화면에 내지 않는다(빈칸).
     몸에 붙지 않은 이름이라 먹히지 않지만, 셋째 부름에 돌아보면 얼어붙어 크게 다친다. 참으면 적패지 끝의 낙관이 드러나 빈틈이 길게 열린다.
   결정 D-1074 (v2 §6.3): 까치 어르신의 깃이 있으면 전투마다 한 번, 셋째 부름에 돌아본 순간 "아가!" 소리가 겹쳐 그 이름을 지킨다. */
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
  B.names={eaten:swallowed,pinned:[],used:[],lock:0,jerk:null,fly:null,echo:null,boost:false,queued:false,call:null,kept:[],finalDone:false,featherUsed:false,bigOpen:false,
    flash:false,firstEat:false,retry:!!G.f.gangcheolRetry&&swallowed.length>0,spit:null,fade:0,wantFinal:false,echoes:[]};
}
/* 지금 잃은 이름 수. 앞 전투에서 먹히고 아직 못 되찾은 것도 센다 */
function namesLostNow(){return (G.nicknames||[]).filter(n=>n.lost).length;}
function namePowerMul(){if(!nameBattleOn())return 1;const t=nameTune();return Math.max(t.name_power_min,1-t.name_power_loss*namesLostNow());}
function nameSpeedMul(){if(!nameBattleOn())return 1;const t=nameTune();return Math.max(t.name_speed_min,1-t.name_speed_loss*namesLostNow());}
function nameLocked(){return nameBattleOn()&&B.names.lock>0;}
/* 결정 D-1140: 이름 부르기 예고(ntell)를 건다. 어느 차례에 부를지는 상대의 pickAttack 이 정한다. final 이면 마지막 부름(아빠 목소리) */
function nameCallBegin(p,final=false){
  if(!nameBattleOn())return false;
  const t=nameTune();
  B.cur=p;B.last=p;B.st='ntell';B.t=t.gangcheol_namecall_tell_frames;B.hitThis=false;B.names.wantFinal=final;
  B.msg=final?'다 풀린 적패지 끝에서 낯익은 숨소리가 난다.':'붉은 적패지가 들린다. 갓 아래 어둠이 숨을 들이켠다.';Sound.playSfx('battle_warn');
  return true;
}
function nameMouthAt(){const m=B.E.names.mouth&&B.E.names.mouth();return m||{x:LW/2-50,y:EY};}
/* 상대가 얼마나 남았나 (부위 칸의 합) */
function gangLeft(){let h=0,m=0;for(const p of B.parts){h+=Math.max(0,p.hp);m+=p.max;}return m?h/m:1;}
/* 부름: 남은 이름 가운데 가장 최근에 받은 것(스스로 댔거나 지켜 낸 이름은 다시 부르지 않는다).
   결정 D-1140: 바로 삼키지 않는다. N.call 을 열고 nameCallStep 이 세 번 부르며, 셋째 부름 동안 손이 움직이는지 본다. */
function nameCallFire(){
  const t=nameTune(),N=B.names,held=namesHeld(),free=held.filter(n=>!N.pinned.includes(n.id)&&!N.kept.includes(n.id));
  B.st='ncall';B.t=t.gangcheol_namecall_after_frames;
  if(N.wantFinal&&!N.finalDone){
    N.finalDone=true;N.wantFinal=false;
    N.call={final:true,n:{id:'',text:'',by:'아빠'},k:0,t:0,moved:0,lx:B.px,ly:B.py};B.t=99999;return;
  }
  if(!held.length){
    B.msg='(…아무 이름도 불리지 않았다.)';
    // 빈 이름 칸 장면(큰 장터 D-136)을 겪었다면 장부가 스친다. 까닭은 말하지 않는다
    if(G.f.jangteoArcsKid2||G.f.jangteoArcsKid3)bLater('(…부엉 영감님 장부의 빈 칸이 떠오른다.)',T_LATER);
    return;
  }
  if(!free.length){B.msg='(…이번엔 아무도 돌아보게 하지 못했다.)';return;}   // 결정 D-434: 스스로 댄 이름·지켜 낸 이름뿐
  N.call={final:false,n:free[free.length-1],k:0,t:0,moved:0,lx:B.px,ly:B.py};B.t=99999;
}
/* 세 번의 부름 글. 별명은 지어 준 이의 말투로, 본이름은 화면에 내지 않는다(빈칸) */
function nameCallLine(c){
  if(c.final)return ['"……, 이리 온."','"……."','"……? 아빠다."'][c.k-1];
  const n=c.n;return ['"'+nameVoice(n,'call')+'"','"'+n.text+'."','"…'+n.text+'?"'][c.k-1];
}
/* 결정 D-1275: 부름마다 나레이션 */
function nameCallNarration(c){
  if(c.final)return ['첫 번째 부름. 낯익은 목소리다.','두 번째 부름. 산이 그 목소리를 되받는다.','세 번째 부름. 붉은 붓이 먹을 찍는다.'][c.k-1];
  return ['첫 번째 부름이 언 호수를 건너온다.','두 번째 부름. 산이 그 이름을 되받아 운다.','세 번째 부름. 붉은 붓이 먹을 찍는다.'][c.k-1];
}
/* 메아리 말: 처음엔 부른 이름 그대로, 멀어질수록 끝말만 남는다 (본이름은 빈칸) */
function nameEchoWords(c){
  if(c.final)return ['"……"','"……"','"…"'];
  const s=c.n.text,parts=s.split(' '),last=parts[parts.length-1];
  return [s,parts.length>1?'…'+last:s,'…'+last.slice(-1)];
}
/* 결정 D-1275: 메아리. 적패지(소리 난 곳)에서 먼저 부른 말이 뜨고, 고리처럼 바깥으로 번지며 온 방향에 이름이 뜬다.
   먼 고리일수록 늦게 뜨고 작고 끝말만 남는다. 뜰 때는 빠르고(name_echo_in) 사라질 때는 느리다(name_echo_fade) */
function nameEchoes(c){
  const N=B.names,t=nameTune(),m=nameMouthAt(),words=nameEchoWords(c),n=t.name_echo_base+t.name_echo_step*(c.k-1);
  N.echoes.push({text:nameCallLine(c),x:clamp(m.x,120,LW-120),y:Math.max(30,m.y-34),t:0,max:t.name_echo_fade+40,size:18,k:c.k,main:true,vx:0,vy:-0.12});
  const turn=Math.random()*Math.PI*2;
  for(let i=0;i<n;i++){
    const ring=i%3,a=turn+i/n*Math.PI*2+(Math.random()-0.5)*0.5,r=[170,260,350][ring]+Math.random()*60;
    const x=clamp(LW/2+Math.cos(a)*r,46,LW-46),y=clamp(LH*0.42+Math.sin(a)*r*0.62,22,LH-16);
    N.echoes.push({text:words[ring],x,y,t:-(4+ring*t.name_echo_ring_gap+Math.floor(Math.random()*8)),max:t.name_echo_fade,size:16-ring*1.5,k:c.k,vx:Math.cos(a)*0.22,vy:Math.sin(a)*0.14});
  }
}
/* 적패지가 부서졌으면 붓 획이 흐려진다 */
function nameScrollTorn(){const p=B.parts.find(q=>q.id===B.E.names.scroll);return !!(p&&p.broken);}
/* 부름 하나를 끝낸다. how: kept(셋째를 참음)·feather(깃이 지킴)·cut(적패지를 쳐 끊음)·eaten(적힘)·frozen(본이름에 돌아봄) */
function nameCallEnd(how){
  const t=nameTune(),N=B.names,c=N.call;N.call=null;
  N.echoes=N.echoes.filter(e=>e.t>=0);   // 결정 D-1275: 부름이 끝나면 아직 안 뜬 메아리는 거둔다 (이미 뜬 것은 천천히 사라진다)
  if(B.mark&&B.mark.cut)B.mark=null;
  B.t=t.gangcheol_namecall_after_frames;
  if(c.final){
    if(how==='frozen'){
      // 결정 D-1071: 몸에 붙지 않은 이름이라 먹히지는 않는다. 아빠 목소리에 몸이 얼어붙어 한 차례 내내 움직이지 못하고 크게 다친다
      N.lock=t.name_final_lock_frames;
      for(let i=0;i<t.name_final_damage&&B.st!=='end';i++){B.inv=0;bHitMe();}
      bLater('(…아빠 이름을 먹을 때, 아빠가 기억하던 것까지 먹었구나.)',T_LATER);
      Sound.playSfx('battle_part_break');
    }else{
      // 결정 D-1142: 참았다(깃이 지킨 것도 같다). 붓이 미끄러지고 적패지 끝의 낙관이 드러난다. 빈틈이 길게 열린다
      N.bigOpen=true;B.quakeT=Math.max(B.quakeT||0,24);
      bLater('(아빠는 집 밖에선 그 이름을 안 불렀어.)',40);
      bLater('붓이 미끄러졌다. 새잎 빛을 묶은 붉은 낙관 매듭이 느슨해진다.',T_LATER);   // 결정 D-1273: 낙관은 핵(신목 이름)을 묶은 매듭
      Sound.playSfx('battle_soothe');
    }
    renderBHud();return;
  }
  const n=c.n;
  if(how==='cut'){
    bLater('(…세 번째가 오지 않았다.)',24);
    Sound.playSfx('battle_soothe');renderBHud();return;
  }
  if(how==='kept'||how==='feather'){
    if(!N.kept.includes(n.id))N.kept.push(n.id);
    bLater(how==='feather'?'(…돌아보지 않았다. '+n.text+', 지켰다.)':'(…세 번째. 돌아보지 않았다.)',30);
    Sound.playSfx('battle_soothe');renderBHud();return;
  }
  // 적힌다: 손이 소리 난 쪽(적패지)으로 홱 돌아가고 잠깐 움직이지 않는다
  const m=nameMouthAt(),dx=m.x-B.px,dy=m.y-B.py,d=Math.hypot(dx,dy)||1;
  N.jerk={vx:dx/d*5,vy:dy/d*5,t:7};N.lock=t.gangcheol_namecall_lock_frames;
  nameTake(n,B.px,B.py-18);
}
/* 이름 하나가 명부에 적혀 먹힌다. 이름패가 얼며 적패지로 날아간다 (셋째 부름에 돌아봄, 결정 D-1272: 오랏줄에 오래 묶임) */
function nameTake(n,x,y){
  const N=B.names;
  N.fly={text:n.text,x,y,t:0,max:46};
  loseName(n.id);if(!N.eaten.includes(n.id))N.eaten.push(n.id);
  G.f.gangcheolSwallowed=[...N.eaten];
  if(!N.firstEat){N.firstEat=true;N.flash=true;}
  // 결정 D-1078: 이름에 쌓인 기억도 함께 나간다 (수첩 그 길의 기록이 흐려진다, book.js)
  bLater('(…'+n.text+'? 누가 나를 그렇게 불렀더라.)',T_LATER);
  Sound.playSfx('chasa_write');renderBHud();
}
/* 결정 D-1272: 오랏줄이 묶어 갈 이름. 부름과 같이 가장 최근에 받은 것(스스로 댄 이름·지켜 낸 이름은 빼고) */
function nameBindTarget(){
  if(!nameBattleOn())return null;const N=B.names;
  const free=namesHeld().filter(n=>!N.pinned.includes(n.id)&&!N.kept.includes(n.id));
  return free[free.length-1]||null;
}
/* 결정 D-1140: 부르는 중. 첫째·둘째에는 손이 조금씩 끌려가고, 셋째 동안 손이 움직이거나 휘두르면 돌아본 것이다 */
function nameCallStep(){
  const t=nameTune(),N=B.names,c=N.call;if(!c)return;
  if((c.k===1||c.k===2)&&!nameLocked()){
    // 귀를 당긴다: 손이 소리 난 쪽(판 위 가운데)으로 조금씩 끌려간다. 움직여도 괜찮다
    const m=nameMouthAt(),dx=clamp(m.x,BOX.x+8,BOX.x+BOX.w-8)-B.px,dy=BOX.y+8-B.py,d=Math.hypot(dx,dy);
    if(d>2){B.px=clamp(B.px+dx/d*t.name_call_pull,BOX.x+8,BOX.x+BOX.w-8);B.py=clamp(B.py+dy/d*t.name_call_pull,BOX.y+8,BOX.y+BOX.h-8);}
  }
  if(c.k===3){
    c.moved+=Math.hypot(B.px-c.lx,B.py-c.ly);
    if(B.swing>0)c.moved+=999;
    const limit=nameScrollTorn()?t.name_call_move_px_torn:t.name_call_move_px;
    if(c.moved>limit){
      if(has('magpie_feather')&&!N.featherUsed){
        N.featherUsed=true;
        N.echo={by:'늙은 까치',text:'"아가!"',t:120,max:120,warm:true};B.msg='(깃이 떨린다. 귓가에서 "아가!" 하는 소리가 겹친다.)';
        nameCallEnd(c.final?'kept':'feather');return;
      }
      nameCallEnd(c.final?'frozen':'eaten');return;
    }
  }
  c.lx=B.px;c.ly=B.py;
  if(--c.t>0)return;
  if(c.k>=3){nameCallEnd('kept');return;}
  c.k++;c.t=c.k===3?t.name_call_third_frames:t.name_call_interval_frames;
  N.echo={by:c.n.by,text:'',t:c.t,max:c.t,cold:true};
  // 결정 D-1275 (사용자 지시 2026-11-08 37): 부름마다 나레이션 한 줄로 몇 번째인지 가른다. 부른 말은 적패지에서 한 번,
  //   이어서 판 곳곳 온 방향에서 메아리로 빠르게 떴다가 천천히 사라진다. 부름이 거듭될수록 메아리가 많고 짙다
  B.msg=nameCallNarration(c);nameEchoes(c);
  if(c.k===1&&c.final)bLater('(…내 이름이다. 아빠 목소리로.)',40);
  else if(c.k===1&&!N.taboo&&knows('lore:three_calls')){N.taboo=true;bLater('(세 번째엔… 돌아보지 말자.)',40);}
  // 둘째 부름 뒤 셋째 사이: 적패지에 칠 자리가 뜬다. 치면 부름이 끊긴다 (마지막 부름은 끊지 못한다)
  if(c.k===2&&!c.final&&B.E.names.cutAt){const p=B.parts.find(q=>q.id===B.E.names.scroll);
    if(p&&!p.broken){const m=B.E.names.cutAt(),q=bFitMark(m.x,m.y);B.mark={x:q.x,y:q.y,t:c.t,max:c.t,part:p,cut:true};}}
  if(c.k===3&&B.mark&&B.mark.cut)B.mark=null;
  Sound.playSfx(c.k===3?'chasa_write':'chasa_call');
}
function nameStep(){
  if(!nameBattleOn())return;const N=B.names;
  if(N.call&&B.st==='ncall')nameCallStep();
  if(N.bigOpen&&B.st==='open'&&B.mark){N.bigOpen=false;B.mark.t+=nameTune().name_final_open_bonus;B.mark.max+=nameTune().name_final_open_bonus;}
  if(N.lock>0)N.lock--;
  if(N.jerk&&N.jerk.t-->0){B.px=clamp(B.px+N.jerk.vx,BOX.x+8,BOX.x+BOX.w-8);B.py=clamp(B.py+N.jerk.vy,BOX.y+8,BOX.y+BOX.h-8);}
  if(N.fly&&++N.fly.t>=N.fly.max)N.fly=null;
  if(N.echo&&--N.echo.t<=0)N.echo=null;
  for(const e of N.echoes){e.t++;if(e.t>0&&!Vfx.reducedMotion){e.x+=e.vx;e.y+=e.vy;}}N.echoes=N.echoes.filter(e=>e.t<e.max);
  if(N.spit)N.spit.t++;
  const target=Math.min(nameTune().name_hand_fade_max,nameTune().name_hand_fade*namesLostNow());
  N.fade+=(target-N.fade)*0.08;
  if(N.queued&&B.st==='open'&&!B.paused){N.queued=false;openNameMenu();}
  // 깜박임은 첫 이름을 먹힌 뒤 처음 열린 빈틈 하나 동안만
  if(N.flash){if(B.st==='open')N.flashSeen=true;else if(N.flashSeen)N.flash=false;}
  const btn=$('bNames');if(btn)btn.classList.toggle('want',N.flash&&B.st==='open');
}
/* 결정 D-1141: 먹힌 이름을 k 개 돌려준다 (소매를 부숨) */
function nameReturn(k,x,y){
  if(!nameBattleOn())return 0;const N=B.names;if(!N.eaten.length)return 0;
  return nameReturnIds(N.eaten.slice(Math.max(0,N.eaten.length-k)),x,y);
}
/* 결정 D-1271: 바닥에 떠오른 내 이름을 쳐서 그 이름 하나를 되찾는다 */
function nameReturnIds(ids,x,y){
  if(!nameBattleOn())return 0;const N=B.names,back=ids.filter(id=>N.eaten.includes(id));if(!back.length)return 0;
  N.eaten=N.eaten.filter(id=>!back.includes(id));
  restoreNames(back);G.f.gangcheolSwallowed=[...N.eaten];
  const texts=(G.nicknames||[]).filter(n=>back.includes(n.id)).map(n=>n.text);
  texts.forEach((s,i)=>B.pops.push({x:(x??B.px)+(i%2?18:-18),y:(y??B.py)-40-i*14,t:60,text:s,good:true}));
  if(texts.length)bLater(texts.length>1?'(…그래, 다 나였지.)':'(…'+texts[0]+'. 그래, 나였지.)',20);
  renderBHud();return texts.length;
}
/* 친 부위: 부름 사이에 적패지를 쳤으면 부름이 끊긴다. 소매를 부수면 먹힌 이름이 모두 돌아온다 */
function nameOnPartHit(p,m){
  if(!nameBattleOn())return;const N=B.names;
  if(m&&m.cut&&N.call&&N.call.k===2&&!N.call.final){nameCallEnd('cut');B.msg='적패지를 쳤다! 부르던 소리가 끊겼다.';return;}
  if(p.id===B.E.names.body&&p.broken&&N.eaten.length){bLater('찢긴 소매에서 쪽지 문 까마귀들이 흩어진다.',8);nameReturn(N.eaten.length);}
}
/* 끝: 이기거나 달래면 모두 돌아온다. 물러나거나 지면 명부에 남는다 */
function nameBattleEnd(result){
  if(!nameBattleOn())return;const N=B.names;N.call=null;
  if(result==='win'||result==='calm'){
    const lost=(G.nicknames||[]).filter(n=>n.lost).map(n=>n.text);
    restoreNames();N.eaten=[];G.f.gangcheolSwallowed=[];G.f.gangcheolRetry=false;G.f.nameRestored=true;
    N.spit={texts:lost,t:0};N.fly=null;N.lock=0;
  }else{
    G.f.gangcheolSwallowed=[...N.eaten];G.f.gangcheolRetry=N.eaten.length>0;
    // 결정 D-435: 첫 물러남(지거나 물러남)에는 넋 빠진 아빠가 아이를 얼음 가에서 끌어낸다. 장면은 영산 이야기가 이 표시를 읽어 잇는다
    if(!G.f.nameDadPulled)G.f.nameDadPullDue=true;
  }
  renderBHud();
}
function calmWinText(){return B.E.calmWin;}
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
/* 결정 D-1140: 예고와 부름 동안 판 가장자리에 붉은 먹이 번진다. 셋째 부름 동안은 붉은 붓 획이 판 위를 가로지르며 차오른다 */
function drawNameFrost(c){
  if(!nameBattleOn())return;
  const tell=B.st==='ntell',call=B.st==='ncall';if(!tell&&!call)return;
  const t=nameTune(),N=B.names,k=clamp(tell?1-B.t/t.gangcheol_namecall_tell_frames:N.call?1:B.t/t.gangcheol_namecall_after_frames,0,1);
  const X=BOX.x,Y=BOX.y,W=BOX.w,H=BOX.h,d=4+k*14;
  c.save();c.globalAlpha=0.12+0.28*k;c.fillStyle='#7a1d16';
  c.fillRect(X,Y,W,d);c.fillRect(X,Y+H-d,W,d);c.fillRect(X,Y,d,H);c.fillRect(X+W-d,Y,d,H);c.restore();
  for(let i=0;i<14;i++){const u=hash(i*3.7),side=i%4,l=4+hash(i*1.9)*14*k;
    const [x,y,nx,ny]=side===0?[X+u*W,Y+d,0,1]:side===1?[X+u*W,Y+H-d,0,-1]:side===2?[X+d,Y+u*H,1,0]:[X+W-d,Y+u*H,-1,0];
    blob(c,x+nx*l*0.5,y+ny*l*0.5,2+l*0.25,2+l*0.2,RED,0.35*k);}
  const cl=N.call;
  if(cl&&cl.k===3){   // 셋째 부름: 붓 획이 왼쪽에서 오른쪽으로 차오른다. 적패지가 찢겼으면 흐리다
    const e=1-Math.max(0,cl.t)/t.name_call_third_frames,y=Y+H*0.5,torn=nameScrollTorn(),x2=X+8+(W-16)*e;
    c.save();c.globalAlpha=torn?0.35:0.8;c.strokeStyle=RED;c.lineCap='round';c.lineJoin='round';c.lineWidth=torn?5:9;c.beginPath();c.moveTo(X+8,y);
    for(let x=X+8;x<=x2;x+=6)c.lineTo(x,y+Math.sin(x*0.06)*4+(hash(x)-0.5)*2);c.stroke();c.restore();
    blob(c,x2,y,torn?4:6,torn?3:5,RED,torn?0.4:0.9);}
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
/* 결정 D-1275: 메아리. 부름이 거듭될수록 빛깔이 짙어진다(첫째 차가운 잿빛, 둘째 짙은 먹빛, 셋째 붉은 먹빛) */
const ECHO_COLS=['#62737e','#3b4750','#7d2a1f'];
function drawNameEchoes(c){
  const N=B.names;if(!N.echoes.length)return;
  c.save();c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
  for(const e of N.echoes){if(e.t<0)continue;
    const inT=nameTune().name_echo_in,a=e.t<inT?e.t/inT:Math.pow(1-(e.t-inT)/(e.max-inT),1.4),base=e.main?0.95:[0.5,0.66,0.8][e.k-1];
    const s=e.size*(1+0.12*e.t/e.max);
    c.globalAlpha=a*base;c.font=(e.main||e.k===3?'bold ':'')+s.toFixed(1)+'px "Gowun Batang", "Batang", serif';
    c.lineWidth=e.main?5:3.5;c.strokeStyle='rgba(255,250,240,.72)';c.strokeText(e.text,e.x,e.y);
    c.fillStyle=ECHO_COLS[e.k-1];c.fillText(e.text,e.x,e.y);}
  c.restore();
  // 몇 번째 부름인지: 판 위 가운데 붓 점 셋
  const cl=N.call;if(!cl||B.st!=='ncall')return;
  for(let i=0;i<3;i++){const x=BOX.x+BOX.w/2+(i-1)*16,y=BOX.y+11;
    blob(c,x,y,4.4,3.6,i<cl.k?(cl.k===3?RED:INK):'#d8ccb4',i<cl.k?0.9:0.7);}
}
function drawNames(c){
  if(!nameBattleOn())return;const N=B.names;
  drawNameFrost(c);drawNameEchoes(c);
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
