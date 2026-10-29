'use strict';
/* 갈참골 진행: NPC 대화와 교환, 무쇠의 대장간 미니게임, 전투 시작과 결과, 지금 할 일.
   흐름은 design/narrative/galchamgol-scenario.md, 교환은 design/data/trades.csv */
(()=>{
const Rg=REGIONS.galchamgol;

/* ---------- 도담 (다람쥐) ---------- */
function talkDodam(){
  const F=G.f;
  if(!F.dodamTalk){F.dodamTalk=true;
    talk([['도담','어, 처음 보는 너구리네! 그 모자… 어디서 봤더라?'],
      ['도담','뭐 찾는 거 있어?',[{t:'해머루를 찾고 있어',go:dodamFruit},{t:'우리 아빠 못 봤어? 보부상 너구리야',go:()=>dodamDad(dodamFruit)}]]]);
  }else if(!F.dodamDone){
    if(has('powder'))dodamTrade();
    else talk([['도담','도토리 가루 하나 가져오면 해머루가 어딨는지 알려 줄게! 도토리 세 알이면 절구로 빻을 수 있잖아?']]);
  }else talk([['도담','당산나무는 마을 맨 끝이야. 칡덩굴 조심하고!']]);
}
function dodamDad(next){
  clue('d1','도담','몇 달 전 보부상 너구리가 갈참골에서 도토리 가루를 바꿔 갔다. 북쪽으로 간다고 했다.');
  rel('dodam',1);
  talk([['도담','아! 그 모자, 보부상 아저씨 거랑 똑같다!'],['도담','몇 달 전에 여기서 도토리 가루를 잔뜩 바꿔 갔어. 북쪽으로 간다던데? 엄청 급해 보였어.']],next);
}
function dodamFruit(){
  ledger('dodam','도담','도토리 가루 1','해머루가 있는 곳');
  talk([['도담','해머루? 알지, 알지~'],['도담','근데 공짜로는 안 알려 줘. 도토리 가루 하나 가져와! 도토리는 숲에 굴러다니니까 보따리 속 절구로 빻으면 돼.']],()=>{if(has('powder'))dodamTrade();});
}
function dodamTrade(){
  talk([['도담','오, 도토리 가루! 거래하는 거지?',[{t:'도토리 가루 1개를 건넨다',go:()=>{
    takeItem('powder',1);G.f.dodamDone=true;ledgerDone('dodam');rel('dodam',1);
    diary('dodam','해머루는 당산나무 꼭대기에 있다. 요즘 칡덩굴이 나무를 꽁꽁 감았다고 한다.');
    talk([['도담','고마워! 해머루는 마을 끝 당산나무 꼭대기에 열려.'],['도담','근데 요즘 칡덩굴이 나무를 꽁꽁 감아서 아무도 못 올라가. 곡괭이로는 안 끊길걸?'],['도담','대장간 무쇠 아저씨한테 가 봐. 날 선 연장은 거기밖에 없어.']],()=>{if(!G.clues.some(c=>c.id==='d1'))dodamDad();});
  }},{t:'아직은 안 줄래',go:null}]]]);
}

/* ---------- 날쌘 (족제비 떠돌이 보부상) ---------- */
function talkNal(){
  if(!G.f.nalTalk){G.f.nalTalk=true;ledger('nal','날쌘','도토리 가루 1 + 칡뿌리 1','숯');
    talk([['날쌘','어이, 꼬마 보부상! 나도 보부상이야. 이 동네 숯은 다 내 지게에 있지.'],['날쌘','거래할 거 있으면 꺼내 봐. 아무거나 안 받는다고.']],nalMenu);}
  else nalMenu();
}
function nalMenu(){
  const c=[];
  if(!G.f.nalDone)c.push({t:'숯이랑 바꾸자 (도토리 가루 + 칡뿌리)',go:nalTrade});
  c.push({t:'아빠 짐의 약연을 내민다',go:nalYakyeon});
  if(!G.f.nalDone&&G.rel.nal.v===0)c.push({t:'허세 부리기: "이런 촌구석 숯이 다 거기서 거기지"',go:nalBluff});
  c.push({t:'그만두기',go:null});
  talk([['날쌘',G.f.nalDone?'또 뭐? 장사 끝났으면 길 비켜.':'뭘 내놓을 건데?',c]]);
}
function nalTrade(){
  if(!(has('powder')&&has('root'))){talk([['날쌘','빈손으로 흥정하는 건 보부상 실례야. 도토리 가루 하나, 칡뿌리 하나. 그럼 숯 줄게.'],['날쌘','칡뿌리? 반짝이는 흙더미를 곡괭이로 파 봐. 보부상이 그것도 몰라?']]);return;}
  takeItem('powder',1);takeItem('root',1);G.f.nalDone=true;ledgerDone('nal');
  const extra=G.rel.nal.v>0;
  addItem('coal',extra?2:1);
  talk(extra?[['날쌘','자, 진짜 숯이다. 덤으로 하나 더.'],['날쌘','다신 촌구석이라고 하지 마라. 알았지?']]:[['날쌘','거래 성립. 숯 하나.'],['날쌘','무쇠 영감한테 가져가려고? 그 영감 까다로워.']]);
}
function nalYakyeon(){
  clue('n1','날쌘','날쌘은 약연을 보더니 "네 아빠 거잖아"라며 받지 않았다. 떠돌이 보부상들도 아빠를 안다.');
  talk([['날쌘','…야, 이거 네 아빠 거잖아.'],['날쌘','보부상이 남의 집 가업 물건 받으면 그날로 장사 끝이야. 도로 넣어 둬.'],['날쌘','네 아빠는… 아니다. 갈 길이나 가.']]);
}
function nalBluff(){
  rel('nal',1);
  talk([['너구리','흥, 이런 촌구석 숯이 다 거기서 거기지.'],['날쌘','하! 촌구석?'],['날쌘','…재밌는 꼬마네. 좋아, 거래하면 진짜 숯이 뭔지 보여 주지.']],nalMenu);
}

/* ---------- 무쇠 (오소리 대장장이) ---------- */
function talkMusoe(){
  const F=G.f;
  if(!F.musoeMet){F.musoeMet=true;
    talk([['무쇠','…뭘 봐. 대장간은 놀이터가 아니다.'],['무쇠','…잠깐. 그 모자.'],['무쇠','네 녀석, 그 떠돌이 너구리 아들이냐.',[{t:'우리 아빠를 알아요?',go:musoe2}]]]);
  }else if(!F.musoeTested&&!F.musoeDone){
    talk([['무쇠','숨은 골랐냐? 낫을 쥘 자격, 다시 보여 봐라.',[{t:'다시 덤빈다',go:battleMusoe},{t:'조금 이따가요',go:null}]]]);
  }else if(!F.musoeDone){
    if(has('coal'))talk([['무쇠','숯이군. 좋다, 불 올린다.'],['무쇠','빨갛게 달았을 때 내려쳐라. 박자 놓치면 쇠가 운다.']],openForge);
    else talk([['무쇠','숯. 숯이 없으면 쇠도 없다.'],['무쇠','물레방아 쪽 날쌘이 녀석이 숯을 쟁여 놨을 거다.']]);
  }else talk([['무쇠','낫은 손에 익었냐. 네 아빠는 그 낫으로 덩굴을 잘도 쳐냈지.']]);
}
function musoe2(){
  clue('m1','무쇠','아빠는 무쇠에게 낫을 맡기고, 찾으러 오지 않았다.');
  diary('musoe','대장장이 무쇠 아저씨가 아빠의 모자를 알아봤다. 아빠가 맡겨 둔 낫이 있다고 한다. 그런데 갑자기 덤벼들었다.');
  talk([['무쇠','안다. 녀석이 낫을 맡기고 갔다. 금방 찾으러 온다더니 소식이 없어.'],['무쇠','주인 아니면 안 내준다. …아들이라고?'],['무쇠','말로는 누가 못 해. 그 낫을 쥘 자격이 있는지 몸으로 보여 봐라!']],battleMusoe);
}
function battleMusoe(){
  const n=Rg.npcs.find(n=>n.id==='musoe');
  inkTransition('전투',(n.x-G.cam)/W*100,()=>startBattle('musoe',(res,info)=>{
    if(res==='lose'||res==='flee'){talk([['무쇠','허, 아직 멀었다. 숨 고르고 다시 덤벼라.']]);return;}
    const perfect=res==='win'&&info.hits===0;
    G.f.musoeTested=true;rel('musoe',(res==='calm'||perfect)?2:1);ledger('musoe','무쇠','숯 1','아빠가 맡긴 낫');
    diary('test',res==='calm'?'무쇠 아저씨에게 먹을 것을 건네 마음을 풀었다. 아빠도 이렇게 했을까.':'무쇠 아저씨가 꿀밤으로 연장부터 빼앗고 덤볐다. 끝까지 피해서 시험을 통과했다.');
    talk([['무쇠',res==='calm'?'…됐다. 배고픈 놈 앞에서 고집 부려 뭐 하겠냐.':perfect?'허허, 한 대도 안 맞다니. 그 녀석 아들 맞구나.':'허허, 끝까지 버티는 건 제 아비를 닮았구나.'],['무쇠','연장은 도로 가져가라. 어른 앞에선 내려놓는 거다.'],['무쇠','의리는 의리다. 낫을 내주마.'],['무쇠','근데 녹이 슬었다. 벼리려면 숯이 있어야 하는데, 마침 떨어졌다. 숯 가져와.']],()=>{if(has('coal'))talkMusoe();});
  }));
}

/* 대장간: 쇠가 가장 빨갈 때 세 번 내려치는 타이밍 미니게임 */
const forge={pos:0,dir:1,hits:0,miss:0,zone:[42,58],cool:0};
function openForge(){Object.assign(forge,{pos:0,dir:1,hits:0,miss:0,zone:[42,58],cool:0});$('forgeTitle').textContent='대장간 · 아빠의 낫 벼리기';$('forge').hidden=false;$('fhint').textContent='쇠가 가장 빨갛게 달았을 때 내려친다. 세 번이면 된다.';drawForge();}
function drawForge(){
  $('fzone').style.left=forge.zone[0]+'%';$('fzone').style.width=(forge.zone[1]-forge.zone[0])+'%';
  $('fmark').style.left=forge.pos+'%';
  $('fpips').innerHTML=[0,1,2].map(i=>'<span class="pip'+(i<forge.hits?' on':'')+'"></span>').join('');
}
function forgeStep(){
  forge.pos+=forge.dir*(1.3+forge.hits*0.35);
  if(forge.pos>=100){forge.pos=100;forge.dir=-1;}if(forge.pos<=0){forge.pos=0;forge.dir=1;}
  if(forge.cool>0)forge.cool--;
  drawForge();
}
function strike(){
  if(forge.cool>0||forge.hits>=3)return;forge.cool=14;
  if(forge.pos>=forge.zone[0]&&forge.pos<=forge.zone[1]){
    forge.hits++;$('fhint').textContent=['쾅! 불꽃이 튄다.','쾅! 날이 서기 시작한다.','쾅!'][forge.hits-1];
    if(forge.hits>=3){drawForge();setTimeout(finishForge,380);}
  }else{
    forge.miss++;
    if(forge.miss>=2){forge.zone=[32,68];$('fhint').textContent='무쇠: "급하다. 가운데, 제일 빨갈 때다." (판정이 넓어졌다)';}
    else $('fhint').textContent='팅… 박자가 어긋났다. 가운데 빛나는 곳을 노리자.';
  }
  drawForge();
}
$('fstrike').addEventListener('pointerdown',e=>{e.preventDefault();strike();});
$('fstrike').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();}});
$('fbar').addEventListener('pointerdown',e=>{e.preventDefault();strike();});
defineMinigame({id:'forge',step:forgeStep,hit:strike});
function finishForge(){
  $('forge').hidden=true;
  takeItem('coal',1);
  let sharp=false;if(has('coal')){takeItem('coal',1);sharp=true;}
  G.tool='sickle';G.sharp=sharp;G.f.musoeDone=true;ledgerDone('musoe');rel('musoe',1);
  diary('sickle','아빠의 낫을 받았다. 손잡이에 아빠 손때가 묻어 있다.');
  clue('m2','무쇠','아빠는 대장간에서 사흘을 묵으며 밤마다 낡은 장부만 들여다봤다.');
  toast('아빠의 낫을 얻었다!'+(sharp?' 날이 더 날카롭다':''));
  refreshHud();
  talk([['무쇠','됐다. 네 아빠 낫이다.'+(sharp?' 숯이 넉넉해서 날을 더 세웠다.':'')],['무쇠','…녀석은 여기서 사흘을 묵었다. 밤마다 낡은 장부만 들여다보더군. 뭘 찾는지는 끝내 말 안 했다.'],['무쇠','덩굴은 그걸로 끊어라. 당산나무 앞 칡은 성질이 고약하니 조심하고.']]);
}

/* ---------- 두꺼비 할멈 (약재상) ---------- */
function talkToad(){
  if(has('meoru')){
    talk([['두꺼비 할멈','해머루로구나. …잘 익었다.'],['두꺼비 할멈','이걸로 약을 달이면 네 엄마의 병을 조금 늦출 수 있을 게다. 까치 편에 보내마.'],['두꺼비 할멈','허나 늦출 뿐이다. 고치려면 결국 그 열매가 있어야 해.'],['두꺼비 할멈','덩굴이 걷혔으니 북쪽 길도 열렸겠지. 네 아빠가 간 길이다.']],()=>{
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
    talk([['두꺼비 할멈','어서 오너라, 작은 보부상. 네 엄마 얘기는 바람결에 들었다. 말을 잃어 간다지.'],
      ['두꺼비 할멈','그건… 병이라기보다는…'],['두꺼비 할멈','…아니다. 내가 늙어서 헛말이 나오는구나.'],
      ['두꺼비 할멈','고치는 건 내 손으론 안 된다. 다만 늦출 수는 있지. 당산나무 꼭대기의 해머루를 가져오렴.'],
      ['두꺼비 할멈','전설의 열매? 세상은 부를 준다고들 하더라만, 나는 잃어버린 걸 돌려준다고 들었다.'],
      ['두꺼비 할멈','네 아빠도 꼭 같은 걸 묻고 북쪽으로 갔지.'],
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
  if(G.ended)return '갈참골 체험판 완료';
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
