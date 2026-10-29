'use strict';
/* 단풍골 진행: NPC 대화와 교환, 무쇠의 대장간 미니게임, 전투 시작과 결과, 지금 할 일.
   흐름은 design/narrative/galchamgol-scenario.md, 교환은 design/data/trades.csv */
(()=>{
const Rg=REGIONS.galchamgol;
const MG=TABLES.MINIGAMES;

/* ---------- 도담 (다람쥐) ---------- */
function talkDodam(){
  const F=G.f;
  if(!F.dodamTalk){F.dodamTalk=true;
    talk([['도담','어, 못 보던 너구리네! 잠깐, 그 모자 어디서 봤는데…'],
      ['도담','뭐 찾아? 내가 알려 줄까?',[{t:'해머루는 어디 있어?',go:dodamFruit},{t:'우리 아빠 봤어? 너구리 보부상이야',go:()=>dodamDad(dodamFruit)}]]]);
  }else if(!F.dodamDone){
    if(has('powder'))dodamTrade();
    else talk([['도담','도토리 가루 하나면 해머루가 어딨는지 알려 줄게! 도토리 세 알을 절구에 넣고 빻으면 돼!']]);
  }else talk([['도담','당산나무는 마을 맨 끝이야! 참, 칡덩굴 조심해!']]);
}
function dodamDad(next){
  clue('d1','도담','몇 달 전 보부상 너구리가 단풍골에서 도토리 가루를 바꿔 갔다. 북쪽으로 간다고 했다.');
  rel('dodam',1);
  talk([['도담','아, 생각났다! 보부상 아저씨도 그 모자 썼어!'],['도담','몇 달 전에 여기서 도토리 가루를 잔뜩 바꿔 갔거든! 북쪽으로 간댔어. 엄청 급해 보이던데.']],next);
}
function dodamFruit(){
  ledger('dodam','도담','도토리 가루 1','해머루가 있는 곳');
  talk([['도담','해머루? 그럼, 내가 알지!'],['도담','대신 도토리 가루 하나 줘! 숲에서 도토리 세 알 주워서 보따리 속 절구로 빻으면 돼!']],()=>{if(has('powder'))dodamTrade();});
}
function dodamTrade(){
  talk([['도담','와, 도토리 가루! 나랑 바꿀 거지?',[{t:'도토리 가루 1개를 건넨다',go:()=>{
    takeItem('powder',1);G.f.dodamDone=true;ledgerDone('dodam');rel('dodam',1);
    diary('dodam','해머루는 당산나무 꼭대기에 있다. 요즘 칡덩굴이 나무를 꽁꽁 감았다고 한다.');
    talk([['도담','고마워! 해머루는 마을 끝 당산나무 꼭대기에 열려!'],['도담','근데 칡덩굴이 나무를 꽁꽁 감았어. 아무도 못 올라가! 곡괭이로는 안 끊길걸?'],['도담','아, 대장간 무쇠 아저씨한테 가 봐! 날 선 연장은 거기밖에 없어!']],()=>{if(!G.clues.some(c=>c.id==='d1'))dodamDad();});
  }},{t:'아직은 안 줄래',go:null}]]]);
}

/* ---------- 날쌘 (족제비 떠돌이 보부상) ---------- */
function talkNal(){
  if(!G.f.nalTalk){G.f.nalTalk=true;ledger('nal','날쌘','도토리 가루 1 + 칡뿌리 1','숯');
    talk([['날쌘','어이, 꼬마 보부상. 나도 보부상이거든? 이 동네 숯은 다 내 지게에 있지.'],['날쌘','바꿀 물건 있으면 꺼내 봐. 시시한 건 안 받아.']],nalMenu);}
  else nalMenu();
}
function nalMenu(){
  const c=[];
  if(!G.f.nalDone)c.push({t:'숯이랑 바꾸자 (도토리 가루 + 칡뿌리)',go:nalTrade});
  c.push({t:'아빠 짐의 약연을 내민다',go:nalYakyeon});
  if(!G.f.nalDone&&G.rel.nal.v===0)c.push({t:'허세 부리기: "흥, 촌구석 숯이 다 그렇지"',go:nalBluff});
  c.push({t:'그만두기',go:null});
  talk([['날쌘',G.f.nalDone?'또 뭐야? 볼일 끝났으면 길 좀 비켜.':'그래서, 뭘 내놓을 건데?',c]]);
}
function nalTrade(){
  if(!(has('powder')&&has('root'))){talk([['날쌘','빈손으로 흥정부터 해? 도토리 가루 하나에 칡뿌리 하나. 가져오면 숯 하나 줄게.'],['날쌘','칡뿌리는 반짝이는 흙더미를 곡괭이로 캐 봐. 보부상이 그런 것도 몰라?']]);return;}
  takeItem('powder',1);takeItem('root',1);G.f.nalDone=true;ledgerDone('nal');
  const extra=G.rel.nal.v>0;
  addItem('coal',extra?2:1);if(extra)learn('nal:bluff-paid');
  talk(extra?[['날쌘','봐, 이게 제대로 된 숯이야. 하나 더 얹어 줄 테니 써 봐.'],['날쌘','써 보고도 촌구석 소리가 나오나 보자고.']]:[['날쌘','자, 숯 하나. 딱 맞게 바꾼 거야.'],['날쌘','무쇠 영감한테 줄 거야? 그 영감, 여간 까다로운 게 아닌데.']]);
}
function nalYakyeon(){
  learn('nal:yakyeon');
  clue('n1','날쌘','날쌘은 약연을 보더니 "네 아빠 거잖아"라며 받지 않았다. 떠돌이 보부상들도 아빠를 안다.');
  talk([['날쌘','…이거 네 아빠 거잖아. 안 받아.'],['날쌘','남의 집 가업 잇는 물건까지 받았다간 장사 끝이야. 도로 넣어 둬.'],['날쌘','네 아빠는… 됐어. 갈 길이나 가.']]);
}
function nalBluff(){
  rel('nal',1);
  talk([['너구리','흥, 촌구석 숯이 다 그렇지.'],['날쌘','뭐? 촌구석?'],['날쌘','꼬마 보부상이 말은 잘하네. 바꿔 가 봐. 내 숯이 어떤지 보여 줄 테니까.']],nalMenu);
}

/* ---------- 무쇠 (오소리 대장장이) ---------- */
function talkMusoe(){
  const F=G.f;
  if(!F.musoeMet){F.musoeMet=true;
    talk([['무쇠','뭘 보냐. 대장간은 놀이터가 아니다.'],['무쇠','…잠깐. 그 모자.'],['무쇠','너, 그 떠돌이 너구리 아들이냐.',[{t:'우리 아빠 알아요?',go:musoe2}]]]);
  }else if(!F.musoeTested&&!F.musoeDone){
    talk([['무쇠','숨 골랐냐. 낫 쥘 자격이 있으면 다시 버텨 봐라.',[{t:'다시 해 볼게요',go:battleMusoe},{t:'조금 이따가요',go:null}]]]);
  }else if(!F.musoeDone){
    if(has('coal'))talk([['무쇠','숯 가져왔군. 불 올린다.'],['무쇠','주황빛 남았을 때 쳐라. 식으면 다시 달궈라.']],openForge);
    else talk([['무쇠','숯부터 가져와라. 숯 없인 낫 못 벼린다.'],['무쇠','물레방아 쪽 날쌘이 녀석한테 가 봐라. 숯을 쟁여 놨을 거다.']]);
  }else talk([['무쇠','낫은 손에 익었냐. 네 아비는 그걸로 덩굴을 잘도 쳐냈다.']]);
}
function musoe2(){
  clue('m1','무쇠','아빠는 무쇠에게 낫을 맡기고, 찾으러 오지 않았다.');
  diary('musoe','대장장이 무쇠 아저씨가 아빠의 모자를 알아봤다. 아빠가 맡겨 둔 낫이 있다고 한다. 그런데 갑자기 덤벼들었다.');
  talk([['무쇠','안다. 낫을 맡기고 갔지. 금방 찾으러 온다더니 소식이 없다.'],['무쇠','주인 아니면 안 내준다. …아들이라고?'],['무쇠','말로야 누가 못 하냐. 그 낫 쥘 자격이 있는지 버텨 봐라!']],battleMusoe);
}
function battleMusoe(){
  const n=Rg.npcs.find(n=>n.id==='musoe');
  inkTransition('전투',(n.x-G.cam)/W*100,()=>startBattle('musoe',(res,info)=>{
    if(res==='lose'||res==='flee'){talk([['무쇠','아직 멀었다. 숨 고르고 다시 와라.']]);return;}
    const perfect=res==='win'&&info.hits===0;
    G.f.musoeTested=true;rel('musoe',(res==='calm'||perfect)?2:1);ledger('musoe','무쇠','숯 1','아빠가 맡긴 낫');
    diary('test',res==='calm'?'무쇠 아저씨에게 먹을 것을 건네 마음을 풀었다. 아빠도 이렇게 했을까.':'무쇠 아저씨가 꿀밤으로 연장부터 빼앗고 덤볐다. 끝까지 피해서 시험을 통과했다.');
    talk([['무쇠',res==='calm'?'…됐다. 배부터 채웠으니 고집은 그만 부리마.':perfect?'허, 한 대도 안 맞았군. 그 녀석 아들 맞다.':'끝까지 버티는 건 네 아비를 닮았군.'],['무쇠','연장 도로 가져가라. 어른 앞에선 내려놓고.'],['무쇠','의리는 지켜야지. 낫은 내주마.'],['무쇠','다만 녹이 슬었다. 벼릴 숯이 마침 떨어졌으니 가져와라.']],()=>{if(has('coal'))talkMusoe();});
  }));
}

/* 대장간: 식기 전 세 번 벼린다. 놓쳐도 횟수·숯은 그대로, 같은 버튼으로 다시 달군다. */
const forge={heat:MG.forge_heat,hits:0,miss:0,edge:0,phase:'cold',wait:0,impact:0,particles:[]};
const forgeWords={
  start:['쇠빛 봐라. 손에 힘 빼고.','서두르지 마라. 쇠빛부터 봐라.','불은 내가 본다. 넌 망치 들어라.'],
  good:['그렇지. 힘 빼고 박자 맞춰라.','제법이군. 그대로 쳐라.','허, 망치 쥔 꼴은 봐줄 만하군.'],
  danger:['주황빛 꺼진다. 지금 쳐라!','다 식는다. 어서 내려쳐라.','주저하지 마라. 아직 칠 만하다.'],
  fail:['식었다. 다시 달궈라. 숯은 더 안 든다.','쇠야 다시 달구면 된다. 다시 해라.','낫은 내준다. 다시 해 봐라.'],
  edge:['딱 맞췄군. 간도 크다.','허, 식기 직전에 쳤군.','네 아비도 꼭 그렇게 쳤다.']
};
let forgeCanvas,forgeHeatLabel;
function forgeSay(kind){
  const lines=forgeWords[kind],last=forge.lastLine;
  const choices=lines.filter(t=>t!==last);
  forge.lastLine=choices[Math.floor(Math.random()*choices.length)];
  $('fhint').textContent='무쇠: “'+forge.lastLine+'”';
}
function forgeFloor(){return forge.miss>=MG.forge_help_misses?MG.forge_help_floor:MG.forge_floor;}
function prepareForge(){
  if(forgeCanvas)return;
  forgeCanvas=el('canvas');forgeCanvas.width=520;forgeCanvas.height=110;
  forgeCanvas.style.cssText='width:100%;height:clamp(65px,13vh,110px);display:block;border-radius:3px';
  forgeCanvas.setAttribute('aria-label','모루 위에서 빨강, 주황, 거무스름하게 식는 쇠와 망치');
  $('forge').insertBefore(forgeCanvas,$('fbar'));
  forgeHeatLabel=el('div');forgeHeatLabel.style.cssText='font-size:.9em;min-height:1.4em';
  $('forge').insertBefore(forgeHeatLabel,$('fbar'));
  $('fhint').setAttribute('aria-live','polite');
}
function openForge(){
  prepareForge();
  Object.assign(forge,{heat:MG.forge_heat,hits:0,miss:0,edge:0,phase:'hot',wait:0,impact:0,particles:[],warned:false,owner:G});
  $('forgeTitle').textContent='대장간 · 아빠의 낫 벼리기';$('forge').hidden=false;
  forgeSay('start');drawForge();
}
function drawForge(){
  const floor=forgeFloor(),edge=forge.phase==='hot'&&forge.heat<=floor+MG.forge_edge_width;
  $('fbar').style.background='linear-gradient(90deg,#302c2b '+floor+'%,#d67a2d '+(floor+MG.forge_edge_width)+'%,#d74425 100%)';
  $('fzone').style.left=floor+'%';$('fzone').style.width=MG.forge_edge_width+'%';
  $('fmark').style.left=forge.heat+'%';
  forgeHeatLabel.textContent=forge.phase==='cold'?'식었다 · 다시 달구기 (숯 추가 소모 없음)':
    forge.phase==='done'?'벼리기 끝!'+(forge.edge>=MG.forge_bonus_edges?' · 무쇠의 인정 +'+MG.forge_bonus_relation:''):
    '남은 열 '+Math.ceil(forge.heat)+'% · '+(edge?'아슬아슬! 금빛 칸에서 치면 큰 불똥':'빛이 남아 있으면 성공 · 금빛 칸은 식기 직전')+(forge.miss>=MG.forge_help_misses?' · 천천히 식도록 도움':'');
  $('fstrike').innerHTML=(forge.phase==='cold'?'다시 달구기':forge.phase==='done'?'벼리기 끝':'내려치기')+' <kbd>Space · J</kbd>';
  $('fpips').innerHTML=Array.from({length:MG.forge_hits},(_,i)=>'<span class="pip'+(i<forge.hits?' on':'')+'"></span>').join('');
  const c=forgeCanvas.getContext('2d');if(!c)return;
  c.clearRect(0,0,520,110);c.fillStyle='#29231f';c.fillRect(0,0,520,110);
  c.save();
  const kick=forge.impact?Math.sin(forge.impact*2)*forge.impact/5:edge?Math.sin(forge.heat*3):0;
  c.translate(kick,0);
  c.fillStyle='#514a43';c.fillRect(195,74,130,12);c.fillRect(230,86,60,12);c.fillRect(216,98,88,8);
  const h=Math.max(0,Math.min(1,(forge.heat-floor)/(MG.forge_heat-floor)));
  const color=forge.heat<floor?'#45403c':h>.45?'rgb(225,'+Math.round(60+(1-h)*70)+',37)':'rgb('+Math.round(110+h*240)+','+Math.round(65+h*110)+',38)';
  c.shadowColor=color;c.shadowBlur=forge.heat>=floor?8+h*16:0;c.fillStyle=color;
  c.fillRect(210,62,100,10);c.fillRect(305,57,20,8);c.shadowBlur=0;
  c.save();c.translate(285,forge.impact?35+forge.impact:23);c.rotate(forge.impact?-.35:-.8);
  c.fillStyle='#92633f';c.fillRect(-3,-4,7,44);c.fillStyle='#b4aca0';c.fillRect(-19,-12,37,18);c.restore();
  forge.particles.forEach(p=>{c.globalAlpha=p.life/p.max;c.fillStyle=p.color;c.fillRect(p.x,p.y,p.size,p.size);});
  c.restore();
}
function forgeStep(){
  if(forge.owner!==G||$('forge').hidden)return;
  if(forge.impact>0)forge.impact--;
  forge.particles=forge.particles.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.13;return --p.life>0;});
  if(forge.wait>0){
    if(--forge.wait===0){
      if(forge.phase==='done'){finishForge();return;}
      forge.phase='hot';forge.heat=MG.forge_heat;
    }
  }else if(forge.phase==='hot'){
    const floor=forgeFloor();forge.heat=Math.max(0,forge.heat-(forge.miss>=MG.forge_help_misses?MG.forge_help_cooling:MG.forge_cooling));
    if(forge.heat<floor){forge.phase='cold';forge.heat=0;forge.miss++;forgeSay('fail');}
    else if(forge.heat<=floor+MG.forge_edge_width&&!forge.warned){forge.warned=true;forgeSay('danger');}
  }
  drawForge();
}
function strike(){
  if($('forge').hidden||forge.owner!==G||forge.wait>0||forge.hits>=MG.forge_hits)return;
  if(forge.phase==='cold'){
    Sound.forge('cold');forge.phase='hot';forge.heat=MG.forge_heat;forge.warned=false;forgeSay('start');drawForge();return;
  }
  const edge=forge.heat<=forgeFloor()+MG.forge_edge_width;
  forge.hits++;if(edge)forge.edge++;
  Sound.forge(edge?'edge':'hit');forgeSay(edge?'edge':'good');
  forge.impact=edge?20:10;
  for(let i=0;i<(edge?38:12);i++){
    const life=18+Math.random()*16;
    forge.particles.push({x:260,y:62,vx:(Math.random()-.5)*(edge?12:6),vy:-2-Math.random()*(edge?6:3),life,max:life,size:edge?3:2,color:i%3?'#ffc45c':'#fff2b0'});
  }
  forge.phase=forge.hits>=MG.forge_hits?'done':'reheat';forge.wait=forge.hits>=MG.forge_hits?MG.forge_finish_wait:MG.forge_reheat_wait;forge.warned=false;
  drawForge();
}
$('fstrike').addEventListener('pointerdown',e=>{e.preventDefault();strike();});
$('fstrike').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();}});
$('fbar').addEventListener('pointerdown',e=>{e.preventDefault();strike();});
defineMinigame({id:'forge',step:forgeStep,hit:strike});
function finishForge(){
  if(forge.owner!==G||G.f.musoeDone||forge.hits<MG.forge_hits)return;
  $('forge').hidden=true;
  takeItem('coal',1);
  let sharp=false;if(has('coal')){takeItem('coal',1);sharp=true;}
  G.tool='sickle';G.sharp=sharp;G.f.musoeDone=true;learn('musoe:forge');ledgerDone('musoe');rel('musoe',MG.forge_relation);
  if(forge.edge>=MG.forge_bonus_edges)rel('musoe',MG.forge_bonus_relation);
  diary('sickle','아빠의 낫을 받았다. 손잡이에 아빠 손때가 묻어 있다.');
  clue('m2','무쇠','아빠는 대장간에서 사흘을 묵으며 밤마다 낡은 장부만 들여다봤다.');
  toast('아빠의 낫을 얻었다!'+(sharp?' 날이 더 날카롭다':''));
  refreshHud();
  talk([['무쇠','됐다. 네 아비 낫이다.'+(sharp?' 숯이 넉넉해서 날을 더 세웠다.':'')],['무쇠','그 녀석, 여기서 사흘 묵었다. 밤마다 낡은 장부만 보더군. 뭘 찾는지는 끝내 말 안 했다.'],['무쇠','덩굴은 그걸로 끊어라. 당산나무 앞 칡은 성질 고약하다. 조심해라.']]);
}

/* ---------- 두꺼비 할멈 (약재상) ---------- */
function talkToad(){
  if(has('meoru')){
    talk([['두꺼비 할멈','해머루구나. …잘 익었구나.'],['두꺼비 할멈','이걸로 약을 달이면 네 엄마 병을 조금 늦출 수 있을 게다. 까치 편에 보내마.'],['두꺼비 할멈','다만 늦출 뿐이란다. 고치려면 전설의 열매가 있어야 한단다.'],['두꺼비 할멈','덩굴이 걷혔으니 북쪽 길도 열렸겠구나. 네 아빠도 그 길로 갔단다.']],()=>{
      takeItem('meoru',1);ledgerDone('toad');rel('toad',1);
      diary('end','할멈이 엄마에게 약을 보내 주었다. 북쪽 길이 열렸다. 아빠, 기다려요.');
      endGame();
    });
    return;
  }
  if(!G.f.toadMet){G.f.toadMet=true;rel('toad',1);
    ledger('toad','두꺼비 할멈','해머루 1','엄마의 병을 늦추는 약');
    clue('t1','두꺼비 할멈','아빠도 할멈에게 전설의 열매를 묻고 북쪽으로 갔다.');
    diary('toad','두꺼비 할멈은 엄마의 병을 고칠 수는 없지만 늦출 수는 있다고 했다. 해머루가 필요하다.');
    talk([['두꺼비 할멈','어서 오렴, 꼬마 보부상. 네 엄마 소식은 바람결에 들었단다. 말을 잃어 간다지.'],
      ['두꺼비 할멈','그건… 병이라기보다는…'],['두꺼비 할멈','…아니다. 내가 늙어서 헛말이 나오는구나.'],
      ['두꺼비 할멈','내 손으로 고치진 못해도 병을 늦출 수는 있단다. 당산나무 꼭대기 해머루를 가져오렴.'],
      ['두꺼비 할멈','전설의 열매라… 남들은 부자가 된다지만, 나는 잃어버린 걸 돌려준다고 들었단다.'],
      ['두꺼비 할멈','네 아빠도 그 열매를 묻더니 북쪽으로 갔단다.'],
      ['두꺼비 할멈','…그 보따리 속 약연. 그건 아직 네가 쓸 때가 아니구나.']]);
  }else talk([['두꺼비 할멈','해머루를 가져오렴. 당산나무 꼭대기란다.']]);
}

/* ---------- 엉킨 칡 전투 ---------- */
Rg.startKudzu=()=>{
  G.px=1950;
  inkTransition('전투',(G.boss.x-G.cam)/W*100,()=>startBattle('kudzu',res=>{
    if(res==='win'||res==='calm'){
      if(res==='calm')diary('calm','엉킨 칡을 부수지 않고 달랬다. 칡이 놓아준 자리에 보랏빛 꽃이 피어 있었다.');
      Rg.bossDie();
    }else{
      G.px=1900;G.f.faints+=res==='lose'?1:0;
      diary('hint','엉킨 칡은 부위마다 공격이 다르다. 덩굴손이나 뿌리를 먼저 꺾어야 심이 드러난다. 버섯 향을 좋아하는 것 같다.');
      toast('일기에 공략을 적어 두었다. 준비되면 다시 다가가자');
    }
  }));
};

/* ---------- NPC (npcs.csv 의 id). x 는 필드 위치 ---------- */
Rg.npcs=[
  {id:'dodam',name:'도담',x:300,talk:talkDodam,draw:Rg.art.squirrel},
  {id:'nal',name:'날쌘',x:820,talk:talkNal,draw:COMMON_ART.weasel,props:COMMON_ART.nalProps},
  {id:'musoe',name:'무쇠',x:1110,talk:talkMusoe,draw:Rg.art.badger,props:Rg.props.forge},
  {id:'toad',name:'두꺼비 할멈',x:1430,talk:talkToad,draw:Rg.art.toad,props:Rg.props.toad},
];

/* ---------- 지금 할 일 ---------- */
Rg.goal=()=>{
  const F=G.f;
  if(!G.started)return '';
  if(G.ended)return '단풍골 체험판 완료';
  if(!F.dodamTalk)return '마을 어귀의 다람쥐 도담에게 말 걸기';
  const ac=G.inv.acorn||0;
  const powderStep=()=>has('powder')?null:(ac<3?'도토리 줍기 ('+ac+'/3)':'보따리를 열고 엄마의 절구에 도토리 3개 넣어 빻기');
  if(!F.dodamDone)return powderStep()||'도담에게 도토리 가루 건네기';
  if(!F.musoeMet)return '물레방아 너머 대장간의 무쇠 찾아가기';
  if(!F.musoeTested&&!F.musoeDone)return '무쇠의 시험 통과하기 (다시 말 걸기)';
  if(!F.musoeDone){
    if(has('coal'))return '무쇠에게 숯 가져가기';
    if(!F.nalTalk)return '물레방아 옆 족제비 날쌘에게 숯 구하기';
    const p=powderStep();if(p)return p;
    if(!has('root'))return '반짝이는 흙더미를 휘둘러 칡뿌리 캐기';
    return '날쌘에게 도토리 가루와 칡뿌리 건네기';
  }
  if(!G.barrier.cut)return '마을 끝 칡덩굴을 낫으로 끊기';
  if(!G.boss.dead)return '당산나무의 엉킨 칡과 맞서기 (부수거나 달래기)';
  if(G.drop)return '떨어진 해머루 줍기';
  return '두꺼비 할멈에게 해머루 가져가기';
};
})();
