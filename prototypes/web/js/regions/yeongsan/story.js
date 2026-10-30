'use strict';
/* 북쪽 영산 진행: 날쌘의 설피, 살금이(살금살금 다가가기), 아빠(몸짓 읽기와 장부 한 장), 산군 할아버지(엄마의 오래된 거래와 마지막 교환),
   강철이, 전설의 열매, 약연이 깨어남, 집으로. 흐름은 design/narrative/yeongsan-scenario.md (제안).
   주인공의 이름은 끝까지 나오지 않는다. 끝 화면에서 엄마가 지어 준 새 이름을 플레이어가 적는다 (제안) */
(()=>{
const Rg=REGIONS.yeongsan;
const MG=TABLES.MINIGAMES;
const arcs=()=>Rg.arcsEnabled();
const nickname=(id,text,by)=>{if(typeof grantNickname==='function')grantNickname(id,text,by);};

const SALG_LINES={
  start:['귀, 귀를 세우면 멈춰 줘.','나, 발소리에 잘 놀라… 살살 와 줘.'],
  cue:['자, 잠깐… 무슨 소리야?','어… 풀은 그만 뜯고 들어 볼게. 잠깐 멈춰 줘.'],
  good:['응… 그렇게 살금살금 와 줘.','이, 이제 가까이 와도 괜찮아.'],
  scare:['히익! 까, 깜짝이야…','자, 잠깐! 발소리 좀…!'],
  relief:['휴… 조, 조금만 늦게 멈췄어도 놀랐겠어.','휴… 멈춰 줘서 다행이야.'],
};
Rg.salgSay=kind=>{const a=SALG_LINES[kind];toast('살금이: '+a[Math.floor(Math.random()*a.length)]);};

/* ---------- 날쌘 (마지막 만남): 설피 ---------- */
const vineOK=()=>has('darae_vine',2)||has('broom_sal');
const bindOK=()=>has('jip')||has('eoksae',2);
function talkNal(){
  const F=G.f;
  if(!F.nalYTalk){F.nalYTalk=true;ledger('nal_yeongsan','날쌘','다래 덩굴 2 + 짚 1','설피');
    talk([['날쌘','…여기까지 왔네.'],['날쌘','눈이 허리까지 찬다. 그 발로는 어림없어.\n설피를 엮어 주지.'],
      ['날쌘','다래 덩굴 둘에 짚 하나. 덩굴 대신 싸리 살 하나,\n짚 대신 마른 억새 둘도 받아.']],nalMenu);return;}
  nalMenu();
}
/* 설피를 받은 뒤 물을 수 있는 것. 고백(④)을 아직 안 들었으면 고백, 들었으면 아빠가 위에 있는 걸 아는 까닭. */
function nalAskChoices(){
  const F=G.f,c=[];if(!arcs())return c;
  if(!F.yArcsNal4)c.push({t:'아빠를 어떻게 알아요?',go:()=>nalConfess(false)});
  else if(!F.yNalAutumn)c.push({t:'아빠가 위에 있는 걸 어떻게 알아요?',go:nalAutumn});
  return c;
}
function nalMenu(){
  const F=G.f;
  if(!CLASSIC&&F.nalYDone){
    const c=[];
    if(!F.yCraftJujube)c.push({t:'다래 덩굴로 대추를 바꾼다',go:craftJujube});
    c.push(...nalAskChoices());
    c.push({t:'산길로 간다',go:null});
    talk([['날쌘',F.shortcut?'설피에 눈이 꽉 붙었네. 털고 가.\n안쪽 길도 이제 알겠지.':'설피 끈 단단히 매. 눈 굴에서는\n네 발자국을 따라 돌아오면 돼.',c]]);return;
  }
  if(F.nalYDone){
    if(arcs()){
      const c=nalAskChoices();
      c.push({t:'산길로 간다',go:null});
      talk([['날쌘','설피 끈 단단히 매. 눈에 푹 빠지지 말고.',c]]);return;
    }
    talk([['날쌘','설피 끈이나 단단히 매라. 눈길에서 서두르다간 푹 빠진다.']]);return;
  }
  const c=[];if(vineOK()&&bindOK())c.push({t:'설피 재료를 건넨다',go:nalTrade});c.push({t:'그만두기',go:null});
  if(arcs()){
    talk([['날쌘',vineOK()&&bindOK()?'다 모았네. 이리 줘.':!vineOK()?'산막 옆 덤불을 낫으로 베 봐. 다래 덩굴이 나와.':'짚 하나면 돼. 산막 처마 밑에서 한 줌 빼 와.',c]]);return;
  }
  talk([['날쌘',vineOK()&&bindOK()?'재료는 다 모았군. 이리 내봐.':!vineOK()?'산막 옆 눈 덮인 덤불을 봐라. 네 낫으로 베면 다래 덩굴이 나와.':'짚 하나만 가져와라. 산막 처마 밑 짚단에서 한 줌 빼면 돼.',c]]);
}
/* trades.csv t_craft_jujube: 설피를 받은 뒤 남은 덩굴 하나로 대추 둘. */
function craftJujube(){
  if(CLASSIC||!G.f.seolpi||G.f.yCraftJujube)return;
  ledger('t_craft_jujube','날쌘','다래 덩굴 1','대추 2');
  if(!has('darae_vine')){
    talk([['날쌘','대추 말려 뒀어. 덩굴 하나만 바꾸자.\n산막 옆이나 눈 굴 끝 덤불을 베 봐.']]);return;
  }
  talk([['날쌘','덩굴은 장작 묶는 데 써.\n하나에 말린 대추 둘, 어때?',[
    {t:'바꾼다',go:()=>{
      if(G.f.yCraftJujube||!has('darae_vine'))return;
      takeItem('darae_vine',1);addItem('jujube',2);G.f.yCraftJujube=true;ledgerDone('t_craft_jujube');
      talk([['날쌘','잘 말렸지? 마가목이랑 같이\n약연에 갈아 봐.']]);
    }},{t:'지금은 놔둘게',go:null}]]]);
}
function nalTrade(){
  const F=G.f;
  const vine=has('darae_vine',2)?'다래 둘':'싸리 살 하나',bind=has('jip')?'짚 하나':'억새 둘';
  if(has('darae_vine',2))takeItem('darae_vine',2);else takeItem('broom_sal',1);
  if(has('jip'))takeItem('jip',1);else takeItem('eoksae',2);
  F.nalYDone=true;F.seolpi=true;addItem('seolpi',1);ledgerDone('nal_yeongsan');
  if(arcs()){
    diary('y_nal','날쌘에게 재료를 건네고 설피를 받았다. 이번에는 덤 없이 제값으로 바꿨다.');
    const done=()=>nalHandover(vine,bind);
    // 장부를 본 아이만 먼저 장부 얘기를 꺼낼 수 있다. 장터에서 하다 만 얘기면 그걸 잇는다.
    if(F.jangteoArcsBueong2&&!F.yArcsNal4){
      talk([['날쌘','(날쌘이 재료를 무릎에 대고 둥글게 휜다.)',[
        {t:F.jangteoArcsNal3?'장터에서 하다 만 장부 얘기를 꺼낸다':'장부 얘기를 꺼낸다',go:()=>nalConfess(true,done)},
        {t:'말없이 기다린다',go:done}]]]);return;
    }
    talk([['날쌘','(날쌘이 재료를 무릎에 대고 둥글게 휜다.)']],done);return;
  }
  nickname('yeongsan_snow_walker','눈길 보부상','날쌘');
  learn('nal:yeongsan');
  diary('y_nal','날쌘이 설피를 엮으며 아빠와 같은 보부상단이었다고 했다. 다들 날쌘을 얕봤지만, 아빠는 끝까지 그러지 않았단다.');
  const lines=[['날쌘','(날쌘이 말없이 덩굴로 테를 짜고 짚을 엮는다.)'],['날쌘','…나도 네 아빠랑 같은 보부상단에 있었다.'],
    ['날쌘','다들 나보고 깍쟁이라고 얕봤지.\n네 아빠는… 끝까지 그러지 않더군.']];
  if(has('sinpyo')){addItem('fur_tosi',1);learn('nal:tosi');lines.push(['날쌘','(보따리 끈에 매단 신표를 보더니, 날쌘이 말없이 털토시를 얹어 준다.)']);}
  lines.push(['날쌘','직접 구한 재료로 눈길까지 여네. 눈길 보부상이야.'],['날쌘','가 봐라. 네 아빠, 저 위에 있다.']);
  talk(lines);
}
/* 설피를 건네며: 처음으로 덤 없이 제값. 별명은 날쌘이 그 이름을 부를 때 붙는다. */
function nalHandover(vine,bind){
  talk([['날쌘','(날쌘이 끈을 꼬아 설피에 매고, 이로 끊는다.)'],
    ['날쌘',vine+', '+bind+'. 설피 한 켤레.\n덤은 없어.'],
    ['너구리','이제 꼬마 보부상이라고 안 해요?'],
    ['날쌘','꼬마는 무슨. 이제 눈길 보부상이지.\n보부상끼린 제값이야.'],
    ['날쌘','신어. 네 아빠는 위에 있어.'],
    ['너구리','아빠 만나면 말할게요.\n날쌘 아저씨가 설피 엮어 줬다고.'],
    ['날쌘','…말하지 마. 가.']],()=>nickname('yeongsan_snow_walker','눈길 보부상','날쌘'));
}
/* ④ 날쌘의 고백. 듣지 않아도 설피는 받는다. 앞 지역 표시는 읽기만 한다.
   fromLedger: 아이가 부엉 영감의 장부를 보고 먼저 꺼낸 경우. 아니면 "아빠를 어떻게 알아요?"에 답한다. */
function nalConfess(fromLedger,next){
  const F=G.f;if(!arcs()||F.yArcsNal4){if(next)next();return;}
  const lines=[];
  if(fromLedger){
    if(F.jangteoArcsNal3)lines.push(['너구리','장터에서 하다 만 얘기요.\n부엉 영감님 장부에 있던 거.'],['날쌘','…끝까지 물고 늘어지네.']);
    else lines.push(['너구리','부엉 영감님 장부에서 봤어요.\n아빠가 아저씨 대신 갚았다면서요.'],['날쌘','…영감이 그걸 보여 줬냐.']);
  }
  lines.push(['날쌘','같은 상단이었어. 내가 상단 물건 잃었을 때\n네 아빠가 물어 줬어.'],
    ['날쌘','다들 나보고 깍쟁이라고 했어.\n네 아빠만 안 그랬고. 끝까지.']);
  const met=[F.nalDTalk&&'돌너머에서도',F.nalJTalk&&'장터에서도'].filter(Boolean);
  lines.push(['너구리','그럼 '+(met.length?met.join(', '):'여기서 기다린 것도')+'…'],
    ['날쌘','단풍골에서 처음 봤을 때 그 모자,\n내가 갚을 게 많은 보부상 거거든.']);
  // 묻고 나서 들은 경우엔 설피를 이미 받았으니, 아빠가 위에 있는 걸 아는 까닭까지 잇는다.
  if(!fromLedger)lines.push(['날쌘','가을에 이 길로 올라가는 걸 봤어.\n내려오는 건 못 봤고.']);
  talk(lines,()=>{
    F.yArcsNal4=true;if(!fromLedger)F.yNalAutumn=true;learn('nal:yeongsan');
    diary('y_arcs_nal4','날쌘은 아빠와 같은 상단이었다. 아빠가 날쌘이 잃은 물건값을 대신 물어 줬고, 다들 깍쟁이라 할 때도 아빠만은 그러지 않았다. 단풍골에서 아빠 모자를 보고 나를 앞질러 다녔단다.');
    if(next)next();
  });
}
function nalAutumn(){
  talk([['날쌘','가을에 이 길로 올라가는 걸 봤어.\n내려오는 건 못 봤고.']],()=>{G.f.yNalAutumn=true;});
}

/* ---------- 살금이 (고라니 산지기): 귀를 세울 때는 멈춘다 (field.js) ---------- */
function talkSalg(){
  const F=G.f;
  if(!F.salgMet){F.salgMet=true;ledger('salgeumi','살금이','마가목 열매 3 (또는 콩 2)','호숫가 지름길');
    if(arcs()){
      talk([['살금이','가, 가까이 왔네. 무서운 애는 아니지?'],
        ['살금이','겨울 끝이라… 먹을 게 없어.'],
        ['살금이','마가목 세 알이나 콩 두 알 줄래? 지름길 알려 줄게.']],()=>{
          F.yArcsSalg1=true;diary('y_arcs_salg1','살금이 가까이 다가가 말을 나눴다. 겨울 끝이라 굶주렸다고 한다.');
          if(salgCan())salgTrade();
        });return;
    }
    talk([['살금이','(고라니가 귀를 쫑긋 세우고 몸을 떤다.)'],['살금이','…너, 무서운 애는 아니지? 겨울 끝이라 먹을 게 없어.'],
      ['살금이','비탈의 빨간 마가목 열매 세 알… 아니면 콩 두 알 줄래? 호숫가 지름길 알려 줄게.']],()=>{if(salgCan())salgTrade();});
    return;
  }
  if(!F.salgDone){if(salgCan())salgTrade();else talk([['살금이','마, 마가목 열매 세 알이면 돼. 비탈 나무에 있어… 콩 두 알도 괜찮아.']]);return;}
  if(arcs()){salgArcMenu();return;}
  talk([['살금이','봄이 오면 좋겠다… 호숫가 풀이 제일 먼저 나거든.']]);
}
const salgCan=()=>has('magamok',3)||has('kong',2);
function salgTrade(){
  talk([['살금이','그, 그거 나한테 줄래?',[{t:has('magamok',3)?'마가목 열매 3을 건넨다':'콩 2를 건넨다',go:()=>{
    const F=G.f;if(has('magamok',3))takeItem('magamok',3);else takeItem('kong',2);
    F.salgDone=true;F.shortcut=true;rel('salgeumi',1);ledgerDone('salgeumi');learn('salgeumi:shortcut');
    nickname('yeongsan_soft_step','사뿐발','살금이');
    if(arcs()){
      clue('y1','살금이','"가을부터 호숫가에 너구리 하나가 있어. 입은 달싹이는데, 소리가 안 나더라."');
      diary('y_salg','살금이에게 먹을 것을 주고 비탈의 지름길을 들었다. 가을부터 호숫가에 너구리가 있는데, 입은 달싹여도 소리가 안 난다고 한다. 호수는 강철이가 붙들고 있다.');
      talk([['살금이','발소리를 죽이고 와 줬네. 사, 사뿐발이라고 불러도 돼?'],
        ['살금이','고, 고마워. 왼쪽 바위턱을 디디면 호숫가로 올라가.'],
        ['살금이','가을부터 호숫가에 너구리 하나가 있어.\n입은 달싹이는데, 소리가 안 나더라.'],
        ['살금이','이, 이무기가 호수를 휘감아서 봄이 안 와…'],
        ['살금이','가, 강철이래. 우리 할머니가 그랬어.\n강철이가 지나간 데는 풀 한 포기 안 난대.'],
        ['살금이','첫눈 올 무렵 호수에 내려앉더니…\n얼음을 붙들고 안 놓아줘.',salgArcChoices()]]);
      toast('얼어붙은 비탈을 지날 수 있다');refreshGoal();return;
    }
    clue('y1','살금이','"가을부터 호숫가에 너구리 하나가 있어. 신목만 바라보는데… 말은 못 하더라."');
    diary('y_salg','살금이가 얼어붙은 비탈의 지름길을 알려 주었다. 가을부터 호숫가에 말 못 하는 너구리가 머물렀다고 한다.');
    talk([['살금이','고, 고마워… 사, 사뿐발. 조용히 와 줘서.'],['살금이','어, 얼어붙은 비탈 있지? 왼쪽 바위턱을 디디면 호숫가로 올라갈 수 있어.'],
      ['살금이','가을부터 호숫가에 너구리 하나가 있어. 신목만 바라보는데… 말은 못 하더라.'],
      ['살금이','지, 지금은 이무기가 호수에 똬리를 틀고 있어. 그 녀석 때문에 봄이 안 와…']],()=>{toast('얼어붙은 비탈을 지날 수 있다');refreshGoal();});
  }},{t:'아직은 안 줄래',go:null}]]]);
}
function salgArcChoices(){
  const F=G.f,c=[];
  if(!F.yArcsSalg2)c.push({t:'왜 먹을 게 없어?',go:salgFoodArc});
  if(F.yArcsSalg2&&F.dadDone&&!F.yArcsSalg3)c.push({t:'우리 아빠였어. 고마워.',go:salgThanksArc});
  c.push({t:'길을 나선다',go:null});return c;
}
function salgArcMenu(){
  talk([['살금이',G.f.yArcsSalg3?'이, 이젠 가까이 있어도 괜찮아.':
    G.f.spring?'보, 봄이야. 호숫가에도 풀이 났어.':'호, 호숫가 풀이 나면 좋겠다…',salgArcChoices()]]);
}
function salgFoodArc(){
  const F=G.f;if(!arcs()||!F.salgDone||F.yArcsSalg2)return;
  talk([['살금이','원래도 모자란데… 그 너구리한테 내 걸 줘서.'],
    ['살금이','가을부터 마가목을 갖다 뒀어. 가, 가까이는 못 가고.'],
    ['살금이','놓고 도망쳤다가 보면… 먹었더라. 겨울 내내.']],()=>{
      F.yArcsSalg2=true;
      diary('y_arcs_salg2','살금이는 제 몫의 마가목을 호숫가 너구리에게 나눠 줬다. 가까이 가지 못해 멀리 놓고 돌아왔다고 한다.');
    });
}
function salgThanksArc(){
  const F=G.f;if(!arcs()||!F.salgDone||!F.yArcsSalg2||!F.dadDone||F.yArcsSalg3)return;
  F.yArcsSalg3=true;
  const s=G.salg;s.x+=Math.sign(G.px-s.x)*Math.min(12,Math.abs(G.px-s.x));
  talk([['너구리','우리 아빠였어. 먹을 걸 줘서 고마워.'],
    ['살금이','그, 그랬구나. 네 아빠였어…'],
    ['살금이','(살금이가 귀를 내리고 한 걸음 다가온다.)'],
    ['살금이','이, 이제 도망 안 가도 되지?']],()=>{
      diary('y_arcs_salg3','아빠가 겨울을 난 건 살금이 덕분이었다. 고맙다고 하자 살금이가 귀를 내리고 내 곁으로 왔다.');
    });
}

/* ---------- 아빠: 몸짓 읽기 (틀려도 아빠가 다시 해 보인다) ---------- */
const GESTURES=[
  {pose:'mouth',reply:'nod',act:'(아빠가 나와 눈을 맞추고 입을 짚는다. 천천히 고개를 젓는다. 입을 열어도 소리가 나지 않는다.)',
   opts:[['말이… 안 나와?',1],['배고파?',0],['조용히 할까?',0]],after:'(아빠가 크게 끄덕이며 내 어깨를 살며시 두드린다.)'},
  {pose:'cradle',reply:'heart',act:'(아빠가 나를 가리킨다. 아기를 안듯 두 팔을 모아 살살 흔들더니, 가슴에 손을 얹는다.)',
   opts:[['나 안아 주려고?',0],['내가… 아기였을 때?',1],['추워?',0]],after:'(아빠의 눈이 젖는다. 작게 끄덕이며 가슴에 얹었던 손을 내 손 위에 포갠다.)'},
  {pose:'paper',reply:'offer',act:'(아빠가 품에서 낡은 종이 한 장을 꺼낸다. 내가 글씨를 볼 수 있게 돌려 두 손으로 내민다.)',
   opts:[['…나 주려고?',1],['버릴까?',0]],after:'(아빠가 눈웃음을 짓는다. 내 손을 펴 장부를 얹고, 손끝을 가만히 감싸 준다.)'},
];
function dadPose(act){Rg.dadPose={act,tick:0,owner:G};}
/* 대화 중에도 도는 ambient에서 초상을 다시 그린다. 판정 시간제한은 없다. */
Rg.stepDadPose=()=>{
  const p=Rg.dadPose;if(!p)return;if(p.owner!==G){Rg.dadPose=null;return;}p.tick++;
  if(p.tick%6===0&&!$('dlg').hidden&&$('dlgWho').textContent==='아빠'){
    const face=$('dlgFace');face.replaceChildren(portrait('아빠'));
  }
};
const RETRIES=['(아빠가 살며시 고개를 젓는다. 괜찮다는 듯 손을 펴고, 천천히 몸짓을 되풀이한다.)',
  '(아빠가 작게 고개를 저으며 눈웃음을 짓는다. 나와 눈을 맞추고 몸짓을 하나씩 다시 보여 준다.)',
  '(아빠가 내 손등을 토닥인다. 천천히 하자는 듯 손바닥을 낮추고, 다시 해 보인다.)'];
function gesture(i){
  const g=GESTURES[i];dadPose(g.pose);
  talk([['아빠',g.act,g.opts.map(([t,ok])=>({t,go:()=>{
    if(!ok){dadPose('retry');talk([['아빠',RETRIES[Math.floor(Math.random()*RETRIES.length)]]],()=>gesture(i));return;}
    const next=()=>i+1<MG.dad_steps?gesture(i+1):dadLedger();
    dadPose(g.reply);Sound.yeongsan('dad');talk([['아빠',g.after]],next);
  }}))]]);
}
function dadLedger(){
  const F=G.f;F.dadDone=true;addItem('dad_ledger',1);learn('dad:ledger');
  clue('y2','아빠의 장부 한 장','엄마의 글씨: "제 둔갑과 말을 드립니다. 아이의 숨을 주세요." 그 아래 아빠의 글씨: "말 하나 더함."');
  diary('y_ledger','아빠가 내민 장부에 엄마의 글씨가 있었다. "제 둔갑과 말을 드립니다. 아이의 숨을 주세요." 그 아래에는 아빠의 글씨. "말 하나 더함." 엄마가 아픈 건 나를 살린 값이었다.');
  talk([['너구리','(낡은 장부다. 이 글씨는…)'],
    ['너구리','(엄마의 글씨) "제 둔갑과 말을 드립니다. 아이의 숨을 주세요."'],
    ['너구리','(그 아래, 아빠의 글씨) "말 하나 더함."'],
    ['너구리','…나를 살리려고?'],
    ['아빠','(아빠가 내 손을 꼭 잡는다. 신목 쪽에 드리운 커다란 그림자를 가리킨다.)']],()=>{Rg.dadPose=null;refreshGoal();});
}
function talkDad(){
  const F=G.f;
  // 아빠는 집안 사람이라 변신한 아이를 알아본다 (leaf-transform.md 6-4).
  if(G.form&&F.dadMet){talk([['아빠','(아빠가 보따리 끈의 잎사귀를 손가락으로 톡 친다.\n다 안다는 얼굴이다.)']]);return;}
  if(!F.dadMet){F.dadMet=true;
    talk([['너구리','(호숫가의 너구리가 신목을 바라보고 있다. 저 뒷모습은…)'],['너구리','…아빠?'],
      ['아빠','(아빠가 돌아본다. 입을 열지만 아무 소리도 나오지 않는다.)']],()=>gesture(0));return;}
  if(!F.dadDone){gesture(0);return;}
  if(!F.nameGiven){talk([['아빠','(아빠가 신목 쪽을 가리키고, 내 어깨를 두드린다.)']]);return;}
  if(F.yakDone){returnPrep();return;}
  talk([['아빠','(아빠가 보따리 속 약연을 가리키며 고개를 끄덕인다.)']]);
}

/* ---------- 산군 할아버지 (호랑이, 영산의 주인) ---------- */
function talkSangun(){
  const F=G.f;
  // 영산의 주인은 무엇으로 와도 알아본다. 셈은 본모습으로만 한다.
  if(G.form){talk([['산군 할아버지','무엇으로 와도 너는 너다.\n셈은 본모습으로 하자.']]);return;}
  if(!F.dadDone){talk([['산군 할아버지','(커다란 호랑이가 눈을 감고 앉아 있다.)'],['산군 할아버지','…어린 보부상이로구나. 먼저 호숫가에서 네 아비를 만나고 오너라.']]);return;}
  if(!F.sangunMet){F.sangunMet=true;rel('sangun',1);learn('sangun:story');ledger('sangun','산군 할아버지','셈이 맞는 값','되돌림');
    if(arcs()){
      clue('y3','산군 할아버지','엄마는 아빠가 젊을 때 다녀온 영산 이야기를 듣고 나를 안고 혼자 왔다. 아빠는 지난가을 말을 내놓아 글로도 연락할 수 없게 됐다.');
      diary('y_sangun','젊은 아빠는 부를 준다는 소문을 좇아 영산에 왔지만 되찾을 것이 없어 빈손으로 돌아갔다. 엄마는 그 이야기를 기억해 나를 안고 혼자 왔다. 그때 아빠는 장삿길에 있었다. 지난가을 아빠가 말을 내놓은 뒤에는 글도 쓸 수 없었다. 장부는 두 분이 값을 내놓기 전에 쓴 것이다.');
      talk([['산군 할아버지','네 아비는 젊어서 부를 좇아 왔지. 열매는 잃은 것만 돌려준다.'],
        ['산군 할아버지','그 이야기를 들은 어미가 널 안고 왔다. 아비는 장삿길에 있었지.'],
        ['산군 할아버지','가장 귀한 말부터 거둔다. 어미가 네 이름부터 잊는 까닭이지.'],
        ['산군 할아버지','말을 내놓으면 글도 못 쓴다. 장부는 그 전에 쓴 것이지.'],
        ['산군 할아버지','지난가을 아비가 제 말을 보탰다. 어미의 것을 돌려 달라며.'],
        ['산군 할아버지','강철이가 겨울을 붙들어 열매가 없구나. 봄이 오거든 다시 오너라.']],()=>refreshGoal());return;
    }
    clue('y3','산군 할아버지','엄마는 아기였던 나를 살리려고 영산에 올라와, 둔갑과 말을 값으로 내놓았다. 아빠는 그걸 알고 자기 말을 더 얹었다.');
    diary('y_sangun','산군 할아버지가 엄마의 오래된 거래를 들려주었다. 숨이 다해 가던 아기였던 나를 살리려고, 엄마가 둔갑과 말을 내놓았다. 아빠는 되돌려 달라고 자기 말을 더 얹었다.');
    talk([['산군 할아버지','네가 그 아기로구나. 숨이 꺼져 가던…'],
      ['산군 할아버지','오래전 겨울, 네 어미가 너를 품에 안고 이 산에 올랐다.'],
      ['산군 할아버지','어미는 제 둔갑과 말을 값으로 내놓았다. 나는 네 숨을 돌려주었다.'],
      ['산군 할아버지','셈은 맞아야 한다. 이 산의 법이지. 어미가 약속한 값은 이제 거두고 있다.'],
      ['산군 할아버지','네 아비도 그 일을 알고 찾아왔다. 어미의 것을 되돌려 달라며 제 말을 더 얹었지.'],
      ['산군 할아버지','신목의 열매는 잃은 것을 돌려준다. 허나 강철이가 호수를 휘감고 겨울을 붙드니, 봄도 열매도 오지 않는구나.'],
      ['산군 할아버지','봄이 오거든 다시 오너라. 그때 셈을 하자꾸나.']],()=>refreshGoal());
    return;
  }
  if(!G.boss.dead){talk([['산군 할아버지','강철이가 호수를 놓지 않는 한 봄은 오지 않는다.']]);return;}
  if(!F.fruitGot){talk([['산군 할아버지','봄이로구나. 신목에 열매가 열렸다. 따 오너라.']]);return;}
  if(!F.nameGiven){
    talk([['산군 할아버지','어미의 둔갑과 말, 둘을 돌려주려면 아비의 말 하나론 모자란다.'],
      ['너구리','아빠 이름은요?'],
      ['산군 할아버지','받을 수 없었다. 숨을 받은 네 것이어야 한다.'],
      ['산군 할아버지','아비는 네게 값을 치르게 하기 싫어 돌아가지도, 끝내지도 못했다.'],
      ['너구리','제 이름을 내면… 엄마가 나아요?'],
      ['산군 할아버지','그렇다. 어미의 둔갑과 말은 돌아오고, 아비의 말은 돌아오지 않는다.'],
      ['산군 할아버지','네 이름은 모두의 기억에서 사라진다. 그래도 내놓겠느냐?',[
        {t:'제 이름을 드릴게요',go:giveName},{t:'…조금만 생각할게요',go:null}]]]);
    return;
  }
  if(!F.yakDone){makeReturningMedicine();return;}
  returnPrep();
}
/* 되돌림 약을 만든 뒤에도 봄길과 선택 가공을 둘러볼 수 있다. 귀향은 직접 고른다. */
function returnPrep(){
  if(!G.f.yakDone||G.ended||regionCompleted(Rg.id))return;
  talk([['아빠','(약을 보자기에 싸고, 약연 바퀴에 남은 가루를 턴다. 내 손이 닿도록 약연을 돌려 놓는다.)'],
    ['너구리','엄마 약은 챙겼어.\n같이 마실 것도 갈아 갈까?',[
      {t:'아빠와 집으로 돌아간다',go:()=>Rg.goHome()},
      {t:'보따리를 열어 약연으로 더 만든다',go:()=>{toggleBag();toast('약연에 마가목과 대추를 넣어 보자 · 돌아갈 땐 아빠나 산군에게 말 걸기');}},
      {t:'봄이 온 호수를 조금 더 둘러본다',go:()=>toast('준비되면 아빠나 산군에게 말 걸어 집으로 돌아가기')}
    ]]]);
}
Rg.offerReturnPrep=returnPrep;
function giveName(){
  const F=G.f;if(F.nameGiven)return;
  F.nameGiven=true;ledgerDone('sangun');rel('sangun',1);learn('sangun:name');
  diary('y_name','산군 할아버지에게 내 이름을 내놓았다. 셈이 맞았다. 무언가가 가슴에서 조용히 빠져나갔다.');
  talk([['산군 할아버지','…그 이름이면 셈이 맞는다.'],
    ['너구리','(가슴에서 무언가 빠져나갔다. 내 이름… 뭐였지?)'],
    ['아빠','(아빠가 다가와 약연을 내려놓는다. 내 손 위에 손을 포개자 바퀴의 글자가 빛난다.)'],
    ['너구리','(되돌림. 따뜻해진 약연에 전설의 열매를 놓는다.)']],makeReturningMedicine);
}
/* 마지막 교환부터 약연 각성·가공까지 이어지는 한 장면. 가공법과 수량은 CSV를 읽는다. */
function makeReturningMedicine(){
  if(G.f.yakDone||!G.f.nameGiven)return;
  const recipe=RECIPES.yakyeon.find(r=>r.out==='doerim_yak');
  if(!recipe)return;
  if(typeof returnPouch==='function')returnPouch();
  if(!has(recipe.out,recipe.n)&&Object.entries(recipe.need).some(([id,n])=>!has(id,n))){
    talk([['아빠','(아빠가 신목의 열매를 가리키고 약연 곁을 가만히 두드린다.)']]);return;
  }
  awaken('yakyeon');learn('yakyeon:awake');
  if(!has(recipe.out,recipe.n)){
    for(const [id,n] of Object.entries(recipe.need))takeItem(id,n);
    addItem(recipe.out,recipe.n);
  }
  if(!G.f.crafted_yakyeon){G.f.crafted_yakyeon=true;diary('crafted_yakyeon',HEIR.yakyeon.firstCraft);}
  learn(TABLES.CRAFT.yakyeon.habitKey,true);
  G.f.yakDone=true;refreshHud();Sound.craft();
  talk([['아빠','(아빠 손을 따라 바퀴를 앞으로 굴렸다. 마지막에는 한 번 거꾸로.)'],
    ['너구리','(열매가 곱게 갈린다. 약연 바퀴에 비친 봄빛이 약에 스며든다.)'],
    ['너구리','엄마 약이다.']],returnPrep);
}

/* ---------- 강철이 전투 ---------- */
Rg.startGangcheol=()=>{
  G.px=2000;
  inkTransition('전투',(G.boss.x-G.cam)/W*100,()=>startBattle('gangcheol',res=>{
    if(res==='win'||res==='calm'){
      if(res==='calm')diary('y_calm','강철이를 부수지 않고 달랬다. 강철이는 서리 수염 하나를 남기고 따뜻한 남쪽 바다로 떠났다.');
      Rg.bringSpring();
    }else{
      G.px=1960;G.f.faints+=res==='lose'?1:0;
      diary('y_hint','강철이는 입으로 서리를 뿜고, 몸통으로 조여 오고, 꼬리로 고드름을 뿌린다. 머리는 몸통을 풀어야 드러난다. 따뜻한 것을 그리워한다는 말이 있다.');
      toast('일기에 공략을 적어 두었다. 준비되면 다시 호수로');
    }
  }));
};
/* 전설의 열매를 따면 수첩의 아빠 그림 옆 글씨가 보인다 (notes.js 의 got:legend_fruit) */
Rg.fruitFound=()=>{
  diary('y_fruit','전설의 열매를 수첩에 그렸다. 아빠의 "여기다."는 젊은 시절 이 신목을 찾아와 적은 메모다.');
  setTimeout(()=>toast('아빠가 적어 둔 "여기다."의 신목이다. 산군 할아버지에게 가자'),1600);refreshGoal();
};

/* 호숫가 까치에게 보내는 마지막 안부. 공통 발송 API가 받는 가공품과 그림을 고른다. */
Rg.homeReply=parcel=>parcel.itemId?
  '돌아온 까치가 두 날개를 둥글게 모아 가슴에 댔다. 엄마도 네가 만든 것을 두 손으로 감싸고 한참 품고 있었단다.':
  '돌아온 까치가 날개로 호수 모양을 그렸다. 엄마는 네 그림을 무릎에 펴 놓고 손끝으로 물길을 따라갔단다.';
Rg.offerHomeGift=()=>{
  if(!G.f.shortcut||knows('home:yeongsan')||typeof sendHomeGift!=='function')return false;
  const choices=['magamok_tea','ssanghwa'].filter(id=>has(id)).map(id=>({
    t:ITEMS[id].n+' 하나를 엄마에게 보낸다',go:()=>{
      if(sendHomeGift('yeongsan',id))talk([['늙은 까치','고리는 이쪽에 남겨 두마.\n네가 집에 갈 때 엄마와 함께 풀어 보렴.']]);
    }}));
  choices.push({t:'봄 호수 그림을 엄마에게 보낸다',go:()=>{
    if(sendHomeGift('yeongsan',null))talk([['늙은 까치','물길도 새잎도 그렸구나.\n구겨지지 않게 보자기 안에 넣으마.']]);
  }},{t:'같이 돌아가서 드릴게',go:null});
  talk([['늙은 까치','남쪽으로 갈 채비를 하던 참이란다.\n만든 것이나 호수 그림을 엄마에게 먼저 전해 줄까?',choices]]);return true;
};

/* ---------- 끝: 집으로 ---------- */
Rg.goHome=()=>{
  if(G.f.yHomeScene||G.ended)return;
  G.f.yHomeScene=true;
  G.f.yakDone=true;
  diary('y_end','아빠와 함께 약연을 굴려 되돌림 약을 만들었다. 이제 집으로 간다.');
  const lines=[['아빠','(아빠가 제 지게를 내려놓고 내 보따리를 옮겨 싣는다. 오래된 끈을 풀어 내 어깨에 맞게 고쳐 맨다.)'],
    ['아빠','(등에 닿는 받침을 살피고 끈을 한 번 더 당긴다. 아빠가 양손을 놓아도 지게가 꼭 붙어 있다.)'],
    ['아빠','(아빠가 내 어깨를 두드리고 남쪽을 가리킨다. 집이다.)'],
    ['너구리','가자, 아빠. 엄마한테.']];
  if(!CLASSIC&&stampCount()>=12)lines.push(
    ['너구리','(수첩의 열두 도장 위로 아빠 손이 멈췄다.\n빈손으로 돌아온 젊은 날의 길이다.)'],
    ['아빠','(아빠가 내 발 옆에 발을 나란히 놓는다.\n이번에는 둘이서 돌아간다.)']);
  talk(lines,()=>{G.f.yDadCarrier=true;endGame();});
};
/* 엄마의 절정 대사는 decisions.md 그대로. 이름은 이 브라우저의 저장에만 남는다. */
Rg.endExtra=box=>{
  const wrap=el('div','newname');
  // 엄마의 마른 잎사귀 (leaf-transform.md 8): 둔갑을 되찾는 순간 같은 잎 소리가 난다.
  wrap.appendChild(el('p',null,'(경대 위 마른 잎이 엄마 입술에 닿자 초록빛이 돈다. 삐익, 내 잎과 같은 소리가 났다.)'));
  wrap.appendChild(el('p',null,'(방 안에 반딧불이 가득 찬다. 엄마가 예전처럼 둔갑했다.)'));
  wrap.appendChild(el('p',null,'(반딧불에서 돌아온 엄마가 내 얼굴을 쓰다듬는다.)'));
  wrap.appendChild(el('p','newname-call','엄마: "…네 얼굴은 하나도 안 잊었어. 이름만 비었지."'));
  wrap.appendChild(el('p','newname-call','엄마: "봄에 돌아온 아이니까… 엄마가 새로 지어 줄게."'));
  const call=(n,pause)=>{
    const speech=el('div');speech.setAttribute('aria-live','polite');
    speech.appendChild(el('p','newname-call','엄마: "'+n+'아."'));wrap.appendChild(speech);
    const finish=()=>{
      speech.appendChild(el('p','newname-call','엄마: "'+n+'아, 어서 와."'));
      speech.appendChild(el('p','newname-call','너구리: "네, 엄마."'));
      speech.appendChild(el('p',null,'(아빠는 말없이 웃으며 두 팔로 우리를 감싼다.)'));
    };
    if(pause){const owner=G;setTimeout(()=>{if(owner===G&&speech.isConnected)finish();},1000);}else finish();
  };
  if(G.f.newName){call(G.f.newName,false);box.appendChild(wrap);return;}
  wrap.appendChild(el('label','newname-label','엄마가 지어 준 새 이름'));
  const row=el('div','row');const inp=el('input','newname-input');inp.type='text';inp.maxLength=6;inp.placeholder='이름을 적어 주세요';inp.id='newName';
  const btn=el('button','btn primary','부르기');btn.type='button';
  const go=()=>{const n=(inp.value||'').trim().slice(0,6);if(!n){inp.focus();return;}
    if(G.f.newName)return;G.f.newName=n;row.remove();wrap.querySelector('label').remove();call(n,true);
    if(typeof writeSave==='function')writeSave(true);
  };
  btn.onclick=go;inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')go();});
  row.appendChild(inp);row.appendChild(btn);wrap.appendChild(row);box.appendChild(wrap);
};

/* ---------- NPC (npcs.csv 의 id). 살금이는 달아났다 돌아오므로 x 를 상태에서 읽는다 ---------- */
Rg.npcs=[
  {id:'nal',name:'날쌘',x:260,talk:talkNal,draw:COMMON_ART.weasel,props:Rg.props.hut},
  {id:'salgeumi',name:'살금이',get x(){return G&&G.salg?G.salg.x:1480;},talk:talkSalg,draw:Rg.art.deer},
  {id:'dad',name:'아빠',x:1740,talk:talkDad,draw:Rg.art.dad},
  {id:'sangun',name:'산군 할아버지',x:1920,talk:talkSangun,draw:Rg.art.tiger},
];
if(!CLASSIC){
  const zones={nal:'shelter',salgeumi:'slope',dad:'shore',sangun:'island'};
  for(const n of Rg.npcs)n.zone=zones[n.id];
  const salg=Rg.npcs.find(n=>n.id==='salgeumi'),salgTalk=salg.talk;
  let salgScene=null;
  Rg.clearRouteScenes=()=>{if(!open('dlg'))salgScene=null;};
  const location=()=>{
    if(salgScene?.owner===G&&open('dlg'))return salgScene.at;
    if(G.f.spring&&G.zone==='island')return ['island',330];
    if(G.f.dadDone||G.f.spring)return ['shore',arcs()&&!G.f.yArcsSalg3?1050:G.f.spring?2365:1050];
    return ['slope',G.salg?.x??1480];
  };
  Object.defineProperties(salg,{
    zone:{configurable:true,get:()=>location()[0]},x:{configurable:true,get:()=>location()[1]},
  });
  salg.talk=()=>{
    salgScene={owner:G,at:location()};
    if(G.zone==='shore'&&G.f.dadDone&&arcs()&&!G.f.yArcsSalg3)
      talk([['살금이','아, 아빠 만났구나…\n궁금해서 따라와 봤어.']],salgTalk);
    else salgTalk();
  };
  delete Rg.npcs[0].props; // 확장 산막은 지역 배경이 그린다.
}

/* ---------- 지금 할 일 ---------- */
Rg.goal=()=>{
  const F=G.f;
  if(!G.started)return '';
  if(G.ended)return '너구리 보부상 · 끝';
  if(!F.nalYTalk)return '산막의 불빛 쪽 날쌘에게 가 보기';
  if(!F.seolpi){
    if(vineOK()&&bindOK())return '날쌘에게 설피 재료 건네기';
    if(!vineOK())return '눈 덮인 덤불에서 다래 덩굴을 낫으로 베기 ('+(G.inv.darae_vine||0)+'/2)';
    return '산막 처마 밑 짚단에서 짚 한 줌 줍기';
  }
  if(!F.salgMet)return '마가목 비탈 너머 고라니 살금이에게 살금살금 다가가기';
  if(!F.salgDone){const m=G.inv.magamok||0;return m>=3||has('kong',2)?'살금이에게 마가목 열매 건네기 (귀를 세울 때는 멈추기)':'비탈의 마가목 열매 따기 ('+m+'/3)';}
  if(!F.dadMet)return '얼어붙은 비탈을 지나 호숫가로';
  if(!F.dadDone)return '아빠의 몸짓 읽기 (아빠에게 다시 말 걸기)';
  if(!F.sangunMet)return CLASSIC?'호숫가의 산군 할아버지 찾아가기':'호숫가 선착장에서 얼음길을 건너 신목 섬의 산군 할아버지 만나기';
  if(!G.boss.dead)return '언 호수의 강철이와 맞서기 (부수거나 달래기)';
  if(!F.fruitGot)return '신목의 전설의 열매 따기';
  if(!F.nameGiven)return '산군 할아버지에게 셈하러 가기';
  if(F.yakDone)return '봄길·약연 가공 더 둘러보기 · 준비되면 아빠나 산군에게 말 걸어 귀향';
  return '아빠와 손을 포개 약연 굴리기';
};
})();

/* PA-43 · 영산의 선택 만남. 필수 교환과 독립이며 거절하면 물건도 기록도 바뀌지 않는다. */
(()=>{
if(CLASSIC)return;
const Rg=REGIONS.yeongsan;
const draw=kind=>(x,y,d)=>Rg.expArt[kind](x,y,d);
const done=(id,flag,key,text)=>()=>{
  if(!finishWanderer(id))return;
  G.f[flag]=true;diary(key,text);
};
/* 손으로 하는 짧은 행동이 끝나면 기존 인사·기록으로 잇는다. */
const act=(id,next)=>{if(typeof Rg.playActivity==='function')Rg.playActivity(id,next);else next();};
function bearSong(){
  talk([
    ['너구리','잘 자. 바람은 굴 밖에 두고.\n잘 자. 눈은 내가 밟고 갈게.'],
    ['아기 곰','엄마는 같은 데를 두 번씩 불러 주곤 해.\n그다음엔 말도 발소리도 점점 작아지거든.',[
      {t:'작은 목소리로 한 번 더 부른다',go:()=>bearSleep(false)},
      {t:'발끝으로 살짝 박자를 맞춘다',go:()=>bearSleep(true)}
    ]]
  ]);
}
function bearSleep(beat){
  act('bear',()=>talk([
    ['아기 곰',beat?
      '그 소린 눈 위보다 네 보따리에 톡톡 해 줘.\n그럼 굴 안까지 안 울려. 응. 지금이 좋아.':
      '두 번째는 바람 소리보다 조금 작아졌네.\n귀를 기울여 듣다 보니 눈이 저절로 감겨.'],
    ['아기 곰','눈이 녹기 전에 또 깨면 자꾸 밖을 보게 돼.\n굴 안에선 바람이 나를 부르는 것 같거든.'],
    ['아기 곰','입구 가지에 털을 걸어 둘게. 자는 곰 표지야.\n다시 지나갈 땐 나 대신 그 털만 보고 가 줘.']
  ],done('y_bear_lullaby','yBearQuiet','y_bear_lullaby','이른 봄인 줄 알고 깬 아기 곰에게 자장가를 불러 주었다. 소리와 박자를 낮추니 곰이 잠들었다. 굴 앞 나뭇가지에 걸린 털이 조용히 지나가라는 표지가 됐다.')));
}
function talkBear(){
  talk([
    ['아기 곰','굴 안에 햇빛이 들어와서 봄인 줄 알았어.\n마른 풀을 밀치고 나왔는데 발이 푹 빠졌지.'],
    ['아기 곰','엄마는 아직 자. 옆에 도로 누워 봤는데\n눈만 말똥말똥해. 굴 밖 바람이 자꾸 들려.'],
    ['아기 곰','엄마 깨우면 또 너무 일찍 일어났다고 할 거야.\n나 다시 잠들게 작은 목소리로 노래 불러 줄래?',[
      {t:'작은 목소리로 자장가를 부른다',go:bearSong},
      {t:'지금은 조용히 지나간다',go:null}
    ]]
  ]);
}
function crowMap(){
  talk([
    ['너구리','(눈 위에 눈앞의 능선 셋을 나란히 그린다.\n선 아래 골짜기엔 불빛만 한 작은 점을 찍는다.)'],
    ['길 잃은 까마귀','내가 날아온 데를 위에서 보면 늘 같은 산이야.\n어디부터 짚으면 우리 집이랑 맞춰 볼 수 있지?',[
      {t:'골짜기의 작은 불빛부터 짚는다',go:()=>crowHome(false)},
      {t:'뾰족한 능선의 방향부터 짚는다',go:()=>crowHome(true)}
    ]]
  ]);
}
function crowHome(ridge){
  act('crow',()=>talk([
    ['길 잃은 까마귀',ridge?
      '우리 집에선 저 뾰족한 봉우리가 왼쪽이었어.\n그 선을 따라 내려가면 네가 찍은 점이구나.':
      '불빛 위로 뾰족한 봉우리가 왼쪽에 있네.\n우리 집에서도 저렇게 보여. 저 골짜기였어.'],
    ['길 잃은 까마귀','난 아래로 가면 되겠네. 넌 높은 데도 봐 둬.\n위쪽 이정표 뒤에 작은 발자국 무늬가 있어.'],
    ['길 잃은 까마귀','눈이 쌓여도 거기만 패여 있어 부리로 털었지.\n네가 그린 지도는 바람 불기 전에 외워 둘게.']
  ],done('y_crow_direction','yCrowMap','y_crow_direction','눈 위에 능선을 그려 까마귀와 집 방향을 짚었다. 까마귀는 높은 이정표 뒤의 발자국 무늬를 알려 주었다.')));
}
function talkCrow(){
  talk([
    ['길 잃은 까마귀','먹이를 찾으러 넘은 산이 어느 산이었지?\n눈이 한번 쏟아지니 내가 온 자국이 다 지워졌어.'],
    ['길 잃은 까마귀','집 아래 골짜기엔 밤에도 불빛이 있어.\n여기선 별이랑 섞여 보여서 자꾸 위로 날게 돼.'],
    ['길 잃은 까마귀','넌 걸어 올라오면서 골짜기를 봤겠구나.\n네 눈높이에서 보이는 산 모양을 알려 줄래?',[
      {t:'눈 위에 낮은 골짜기를 그린다',go:crowMap},
      {t:'조금 더 둘러보고 온다',go:null}
    ]]
  ]);
}
function otterWait(){
  talk([
    ['너구리','(수달 옆에 앉아 미끄러운 자리에 발을 댄다.\n검은 물 위로 찌의 동그란 물결이 번져 간다.)'],
    ['낚시하는 수달','움직였다. 아니. 내 손이 줄을 당긴 거네.\n찌만 보니까 자꾸 뭐가 잡힌 것처럼 보여.',[
      {t:'구멍 안쪽 물결을 더 살펴본다',go:()=>otterWater(false)},
      {t:'줄 잡은 손을 눈 위에 내려놓는다',go:()=>otterWater(true)}
    ]]
  ]);
}
function otterWater(still){
  act('otter',()=>talk([
    ['낚시하는 수달',still?
      '손이 멈추니 물결도 가라앉는구나. 저기 봐.\n은빛 꼬리가 있어. 먹이보다도 작은 녀석이네.':
      '얼음 아래서 물결이 하나 더 오네. 저기 봐.\n작은 꼬리가 물을 차고 있어. 아직 새끼구나.'],
    ['낚시하는 수달','(수달이 줄을 천천히 풀어 먹이를 내려놓는다.\n은빛 꼬리가 돌고 어두운 물속으로 스며든다.)'],
    ['낚시하는 수달','낚싯줄만 보던 호수를 네 덕에 좀 넓게 봤어.\n봄엔 구멍이 트인 이 물길로 작은 배가 다녀.']
  ],done('y_otter_wait','yOtterWait','y_otter_wait','수달 옆에서 기다리니 얼음 아래 어린 물고기가 보였다. 수달은 줄을 풀어 주었다. 겨울의 낚시 구멍은 봄에 배가 다니는 물길과 이어진다.')));
}
function talkOtter(){
  talk([
    ['낚시하는 수달','쉿. 방금 찌가 움직였어. 이번엔 큰 녀석…\n내 꼬리였구나. 미끄러져서 줄을 건드렸네.'],
    ['낚시하는 수달','겨울엔 이 작은 구멍으로만 호수를 보게 돼.\n얼음 밑에선 물이 어느 쪽으로 흐르고 있을까?'],
    ['낚시하는 수달','잠깐 앉아 볼래? 잡혔나 싶으면 자꾸 서둘러.\n옆에서 같이 물을 보면 손이 덜 바쁠 것 같아.',[
      {t:'수달 옆에서 물속을 기다려 본다',go:otterWait},
      {t:'다음에 앉을게',go:null}
    ]]
  ]);
}
function magpieKnot(){
  talk([
    ['너구리','(까치가 날개로 보자기를 누르는 동안 짐끈을 잡는다.\n짧은 끝과 긴 끝이 남았다.)'],
    ['늙은 까치','날 땐 안 풀리고, 받는 쪽에선 쉽게 풀려야 한단다.\n고리는 어느 쪽에 남길래?',[
      {t:'밖으로 나온 긴 끝에 고리를 만든다',go:()=>magpieLoop(true)},
      {t:'매듭 안쪽의 짧은 끝을 접는다',go:()=>magpieLoop(false)}
    ]]
  ]);
}
function magpieLoop(outside){
  act('knot',()=>talk([
    ['늙은 까치',outside?
      '옳지. 밖으로 나온 고리를 부리로 쏙 물면 되겠다.':
      '그 고리는 짐 밑에 눌려 부리가 안 닿겠구나.\n바깥으로 돌려 보자꾸나. …옳지.'],
    ['늙은 까치','이게 내 마지막 남쪽 길일 게다.\n봄이 오면 골짜기 배달은 젊은 것들한테 넘겨야지.'],
    ['늙은 까치','네 보따리는 네가 들고 가거라.\n엄마 것은 네 손으로 쥐여 드리렴. 그게 제일 빠른 배달이란다.']
  ],done('y_magpie_knot','yParcelKnot','y_magpie_knot','늙은 까치의 짐끈을 이번엔 내가 묶었다. 까치는 이번이 마지막 남쪽 길이라고 했다. 엄마 것은 내 손으로 쥐여 드리라고 했다.')));
}
function talkMagpie(){
  const earlier=Object.keys(G.f.wanderersDone||{}).some(k=>!k.startsWith('yeongsan:')&&/magpie|kkachi/.test(k));
  const sent=['galchamgol','dolneomeo','jangteo'].some(id=>knows('home:'+id));
  const first=!!G.f.wanderersDone?.['galchamgol:old_magpie'];
  const memory=earlier?'아가, 또 만났구나.\n…여기까지 오는 데 꼬박 열흘 걸렸다.':sent?
    '네가 보낸 것들을 남쪽으로 날랐던 까치란다.\n얼굴은 처음 보는구나.':
    '아랫마을 짐을 나르다 눈을 피해 여기서 쉰단다.\n이렇게 높이 오른 건 처음이구나.';
  talk([
    ['늙은 까치',memory],
    ['늙은 까치','이제는 발이 영 말을 안 듣는구나.\n끈 하나를 못 묶어서 한나절을 앉아 있었다.'],
    ['늙은 까치',first?'단풍골에선 네가 눌러 주고 내가 묶었지.\n이번엔 네가 묶어 주련?':'아가, 이 끈 좀 묶어 주련?',[
      {t:'짐끈을 대신 묶어 준다',go:magpieKnot},
      {t:'나중에 도울게',go:null}
    ]]
  ]);
}
const examine=(id,x,label,text)=>({id,x,label,text});
const examines={
  shelter:[
    {...examine('y_hut_bindings',250,'산막의 매듭 살펴보기',''),get text(){return G.f.seolpi?
      '내 설피와 같은 매듭이다.\n이젠 어느 끈을 당겨야 풀리는지 알겠다.':
      '문 안쪽에 납작한 나무테가 걸려 있다.\n발보다 넓네. 저걸 신으면 눈이 덜 꺼질까?';}},
    {...examine('y_hut_post',1100,'닳은 문설주 살펴보기',''),get text(){return G.f.yBearQuiet?
      '굴 쪽 나뭇가지에 곰 털이 걸려 있다.\n여기서는 설피도 살살 디뎌야지.':
      '문설주 위쪽까지 손때가 묻었다.\n젊은 아빠는 저 위에도 손이 닿았겠지?';}},
    examine('y_hut_smoke',2100,'낮게 흐르는 연기 살펴보기','굴뚝 연기가 산 아래로 낮게 흐른다.\n바람도 따뜻한 쪽으로 가고 싶은가 보다.')
  ],
  snow:[
    {...examine('y_snow_tunnel',250,'눈 터널 안 들여다보기',''),get text(){return G.f.seolpi?
      '설피로 다진 바닥 위에 눈 지붕이 남았다.\n내가 지나간 자리만 파랗게 이어진다.':
      '눈 밑에 가지가 둥근 지붕처럼 엉켰다.\n발이 빠지지 않으면 안쪽까지 가 볼 텐데.';}},
    {...examine('y_snow_map',1100,'눈 위의 선 살펴보기',''),get text(){return G.f.yCrowMap?
      '까마귀와 그린 낮은 골짜기다.\n별을 따라 그리면 하늘로 가 버리겠지.':
      '눈 위로 날개 끝이 쓸고 간 자국이 있다.\n까만 깃 하나는 산 아래를 향한다.';}},
    examine('y_snow_sign',2100,'낡은 이정표 살펴보기','기둥에 가로줄이 여럿 새겨져 있다.\n해마다 눈이 어디까지 왔는지 재 둔 걸까?')
  ],
  slope:[
    examine('y_slope_rowan',250,'마가목 밑 살펴보기','빨간 열매 밑에 작은 발자국이 모였다.\n눈 속에서도 새들이 이 나무를 찾았구나.'),
    {...examine('y_slope_hole',1100,'얼음 구멍 가장자리 살펴보기',''),get text(){return G.f.yOtterWait?
      '작은 꼬리가 사라진 물길이다.\n구멍보다 호수가 훨씬 크다는 걸 이제 봤다.':
      '얼음 가장자리만 젖어 있다.\n수달이 꼬리로 자꾸 눈을 닦아 낸 자리다.';}},
    {...examine('y_slope_hoof',2100,'가느다란 발 디딤 살펴보기',''),get text(){return G.f.shortcut?
      '살금이 발굽이 닿았던 좁은 돌턱이다.\n내 발도 옆으로 놓으니 꼭 맞는다.':
      '반들반들한 비탈 옆에 마른 돌이 보인다.\n고라니 발자국은 저기로 돌아갔네.';}}
  ],
  shore:[
    {...examine('y_shore_boat',250,'호숫가 작은 배 살펴보기',''),get text(){return G.f.spring?
      '얼음에 붙었던 배가 물 위에 떴다.\n겨울에 걸어간 길로 이젠 노를 저어 가네.':
      '배 밑까지 얼음이 꼭 붙잡고 있다.\n뱃전의 녹은 자국은 봄마다 생긴 걸까?';}},
    examine('y_shore_bowl',1100,'열매 놓였던 돌 살펴보기','돌의 오목한 곳에 마가목 씨가 남았다.\n바람에도 굴러가지 않는 작은 그릇이네.'),
    examine('y_shore_prints',2100,'크기가 같은 발자국 살펴보기','바위 무늬는 닳았고 옆 눈자국은 새것이다.\n같은 발이 아주 먼 날을 건너 다시 왔구나.')
  ],
  island:[
    examine('y_tree_rope',250,'섬 입구의 금줄 살펴보기','섬 입구에 느슨하게 걸린 금줄이 있다.\n눈 밑에서도 하얀 종이술 끝이 보인다.'),
    {...examine('y_tree_root',1100,'신목 뿌리 살펴보기',''),get text(){return G.f.spring?
      '뿌리 사이로 물이 졸졸 흐른다.\n산이 작게 말하는 소리 같다.':
      '얼음 밑으로도 뿌리가 뻗어 있다.\n이 나무는 겨울에도 호수를 붙들고 있었네.';}},
    {...examine('y_tree_bud',2100,'신목 가지 올려다보기',''),get text(){return G.f.spring?
      '금줄 위 가지마다 연둣빛 새잎이 났다.\n느티나무야, 겨울에도 안 죽었구나.':
      '빈 가지 끝에 단단한 겨울눈이 있다.\n나뭇가지도 손을 꼭 쥐고 봄을 기다리네.';}}
  ]
};
const stamp=(id,x,y)=>({id,x,y,note:'stamp:yeongsan:'+id,draw:(sx,sy)=>Rg.expArt.stamp(sx,sy)});
Rg.expContent={
  wanderers:{
    shelter:[{id:'y_bear_lullaby',name:'아기 곰',x:650,draw:draw('drawBear'),talk:talkBear,
      get greeting(){return G.f.spring?'봄이네… 이번엔 정말 깨어도 돼?\n너 말고 물이 먼저 노래해 줬어.':'음냐… 눈은 네가 밟고…\n나는 조금만 더 잘게.';}}],
    snow:[{id:'y_crow_direction',name:'길 잃은 까마귀',x:750,draw:draw('drawCrow'),talk:talkCrow,
      greeting:'집 방향을 알았으니 바람만 좀 잦아들면 돼.\n네가 그린 골짜기는 눈이 덮여도 기억할게.'}],
    slope:[{id:'y_otter_wait',name:'낚시하는 수달',x:1250,draw:draw('drawOtter'),talk:talkOtter,
      get greeting(){return G.f.spring?'구멍이 호수만큼 커졌네.\n이젠 배 위에서 기다려야겠다.':'오늘은 작은 꼬리 하나를 봤으니 됐어.\n다음 큰 물결까지 조금 더 앉아 있을래.';}}],
    shore:[{id:'y_magpie_knot',name:'늙은 까치',x:500,draw:draw('drawMagpie'),talk:talkMagpie,
      greeting:'아가, 고맙다.\n이 끈은 남쪽까지 안 풀리겠구나.'}]
  },
  examines,
  stamps:{shelter:[stamp('hut_post',1040,108)],snow:[stamp('snow_sign',1780,108)],shore:[stamp('shore_rock',2130,192)]}
};
})();
