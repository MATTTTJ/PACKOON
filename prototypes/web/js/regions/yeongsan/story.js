'use strict';
/* 북쪽 영산 진행: 날쌘의 설피, 살금이(살금살금 다가가기), 아빠(몸짓 읽기와 장부 한 장), 산군 할아버지(엄마의 오래된 거래와 마지막 교환),
   강철이, 전설의 열매, 약연이 깨어남, 집으로. 흐름은 design/narrative/yeongsan-scenario.md (제안).
   주인공의 이름은 끝까지 나오지 않는다. 끝 화면에서 엄마가 지어 준 새 이름을 플레이어가 적는다 (제안) */
(()=>{
const Rg=REGIONS.yeongsan;
const MG=TABLES.MINIGAMES;

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
    talk([['날쌘','…꼬마 보부상, 여기까지 왔냐.'],['날쌘','눈이 허리까지 찬다. 그 발로는 어림없어. 설피를 엮어 주지.'],
      ['날쌘','다래 덩굴 둘에 짚 하나. 덩굴 대신 싸리 살 하나, 짚 대신 마른 억새 둘도 받아.']],nalMenu);return;}
  nalMenu();
}
function nalMenu(){
  const F=G.f;
  if(F.nalYDone){talk([['날쌘','설피 끈이나 단단히 매라. 눈길에서 서두르다간 푹 빠진다.']]);return;}
  const c=[];if(vineOK()&&bindOK())c.push({t:'설피 재료를 건넨다',go:nalTrade});c.push({t:'그만두기',go:null});
  talk([['날쌘',vineOK()&&bindOK()?'재료는 다 모았군. 이리 내봐.':!vineOK()?'산막 옆 눈 덮인 덤불을 봐라. 네 낫으로 베면 다래 덩굴이 나와.':'짚 하나만 가져와라. 산막 처마 밑 짚단에서 한 줌 빼면 돼.',c]]);
}
function nalTrade(){
  const F=G.f;
  if(has('darae_vine',2))takeItem('darae_vine',2);else takeItem('broom_sal',1);
  if(has('jip'))takeItem('jip',1);else takeItem('eoksae',2);
  F.nalYDone=true;F.seolpi=true;addItem('seolpi',1);ledgerDone('nal_yeongsan');learn('nal:yeongsan');
  diary('y_nal','날쌘이 설피를 엮으며 아빠와 같은 보부상단이었다고 했다. 다들 날쌘을 얕봤지만, 아빠는 끝까지 그러지 않았단다.');
  const lines=[['날쌘','(날쌘이 말없이 덩굴로 테를 짜고 짚을 엮는다.)'],['날쌘','…나도 네 아빠랑 같은 보부상단에 있었다.'],
    ['날쌘','다들 깍쟁이라고 날 얕봤지. 네 아빠는… 끝까지 그러지 않더군.']];
  if(has('sinpyo')){addItem('fur_tosi',1);learn('nal:tosi');lines.push(['날쌘','(보따리 끈에 매단 신표를 보더니, 날쌘이 말없이 털토시를 얹어 준다.)']);}
  lines.push(['날쌘','가 봐라. 네 아빠, 저 위에 있다.']);
  talk(lines);
}

/* ---------- 살금이 (고라니 산지기): 귀를 세울 때는 멈춘다 (field.js) ---------- */
function talkSalg(){
  const F=G.f;
  if(!F.salgMet){F.salgMet=true;ledger('salgeumi','살금이','마가목 열매 3 (또는 콩 2)','호숫가 지름길');
    talk([['살금이','(고라니가 귀를 쫑긋 세우고 몸을 떤다.)'],['살금이','…너, 무서운 애는 아니지? 겨울 끝이라 먹을 게 없어.'],
      ['살금이','비탈의 빨간 마가목 열매 세 알… 아니면 콩 두 알 줄래? 호숫가 지름길 알려 줄게.']],()=>{if(salgCan())salgTrade();});
    return;
  }
  if(!F.salgDone){if(salgCan())salgTrade();else talk([['살금이','마, 마가목 열매 세 알이면 돼. 비탈 나무에 있어… 콩 두 알도 괜찮아.']]);return;}
  talk([['살금이','봄이 오면 좋겠다… 호숫가 풀이 제일 먼저 나거든.']]);
}
const salgCan=()=>has('magamok',3)||has('kong',2);
function salgTrade(){
  talk([['살금이','그, 그거 나한테 줄래?',[{t:has('magamok',3)?'마가목 열매 3을 건넨다':'콩 2를 건넨다',go:()=>{
    const F=G.f;if(has('magamok',3))takeItem('magamok',3);else takeItem('kong',2);
    F.salgDone=true;F.shortcut=true;rel('salgeumi',1);ledgerDone('salgeumi');learn('salgeumi:shortcut');
    clue('y1','살금이','"봄마다 호숫가에 너구리 하나가 와서 신목만 바라봐. 말은 못 하더라."');
    diary('y_salg','살금이가 얼어붙은 비탈의 지름길을 알려 주었다. 봄마다 호숫가에 말 못 하는 너구리가 와서 신목만 바라본다고 한다.');
    talk([['살금이','고, 고마워…'],['살금이','어, 얼어붙은 비탈 있지? 왼쪽 바위턱을 디디면 호숫가로 올라갈 수 있어.'],
      ['살금이','봄마다 호숫가에 너구리 하나가 와. 신목만 바라보는데… 말은 못 하더라.'],
      ['살금이','지, 지금은 이무기가 호수에 똬리를 틀고 있어. 그 녀석 때문에 봄이 안 와…']],()=>{toast('얼어붙은 비탈을 지날 수 있다');refreshGoal();});
  }},{t:'아직은 안 줄래',go:null}]]]);
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
  if(!F.dadMet){F.dadMet=true;
    talk([['너구리','(호숫가의 너구리가 신목을 바라보고 있다. 저 뒷모습은…)'],['너구리','…아빠?'],
      ['아빠','(아빠가 돌아본다. 입을 열지만 아무 소리도 나오지 않는다.)']],()=>gesture(0));return;}
  if(!F.dadDone){gesture(0);return;}
  if(!F.nameGiven){talk([['아빠','(아빠가 신목 쪽을 가리키고, 내 어깨를 두드린다.)']]);return;}
  talk([['아빠','(아빠가 보따리 속 약연을 가리키며 고개를 끄덕인다.)']]);
}

/* ---------- 산군 할아버지 (호랑이, 영산의 주인) ---------- */
function talkSangun(){
  const F=G.f;
  if(!F.dadDone){talk([['산군 할아버지','(커다란 호랑이가 눈을 감고 앉아 있다.)'],['산군 할아버지','…어린 보부상이로구나. 먼저 호숫가에서 네 아비를 만나고 오너라.']]);return;}
  if(!F.sangunMet){F.sangunMet=true;rel('sangun',1);learn('sangun:story');ledger('sangun','산군 할아버지','셈이 맞는 값','되돌림');
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
    talk([['산군 할아버지','열매를 땄구나.'],['산군 할아버지','어미가 치른 것은 둔갑과 말, 둘이다. 되돌리려 내놓은 것은 아비의 말 하나.'],
      ['산군 할아버지','어미의 두 가지를 돌려받으려면… 값이 하나 모자라는구나.'],
      ['너구리','(보따리 속 물건으론 안 되겠지.)'],
      ['너구리','(엄마가 날마다 잊어 가던 것. 아침마다 부르다 멈추던 내 이름.)',[{t:'제 이름을 드릴게요',go:giveName},{t:'…조금만 생각할게요',go:null}]]]);
    return;
  }
  talk([['산군 할아버지','셈은 맞았다. 가거라. 봄이다.']]);
}
function giveName(){
  const F=G.f;F.nameGiven=true;ledgerDone('sangun');rel('sangun',1);learn('sangun:name');
  diary('y_name','산군 할아버지에게 내 이름을 내놓았다. 셈이 맞았다. 무언가가 가슴에서 조용히 빠져나갔다.');
  talk([['산군 할아버지','…그 이름이면 셈이 맞는다.'],
    ['너구리','(가슴에서 무언가 빠져나갔다. 내 이름… 뭐였지?)'],
    ['아빠','(아빠가 다가와 내 손 위에 손을 포갠다. 보따리 속 약연이 따뜻하다.)']],()=>{
    awaken('yakyeon');learn('yakyeon:awake');toast('아빠의 약연이 깨어났다! 전설의 열매 → 되돌림 약');refreshHud();});
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
  diary('y_fruit','전설의 열매를 따서 붓으로 그리려고 수첩을 펼쳤다. 아빠의 그림 옆에 덧쓴 글씨가 있었다. "여기다."');
  setTimeout(()=>toast('수첩의 아빠 그림 옆에… "여기다." 산군 할아버지에게 가자'),1600);refreshGoal();
};

/* ---------- 끝: 집으로 ---------- */
Rg.goHome=()=>{
  G.f.yakDone=true;
  diary('y_end','아빠와 함께 약연을 굴려 되돌림 약을 만들었다. 이제 집으로 간다.');
  talk([['너구리','(아빠와 손을 포개 약연을 굴렸다. 연분홍빛 되돌림 약이 나왔다.)'],
    ['아빠','(아빠가 내 어깨를 두드리고 남쪽을 가리킨다. 집이다.)'],
    ['너구리','가자, 아빠. 엄마한테.']],()=>endGame());
};
/* 끝 화면: 엄마가 지어 준 새 이름을 적는다 (제안). 이름은 이 브라우저 화면에서만 쓴다 */
Rg.endExtra=box=>{
  const wrap=el('div','newname');
  /* 받침이 있으면 '아' (예: 봄별아), 없으면 '야' (예: 봄이야) */
  const call=n=>{const p=el('p','newname-call','엄마: "'+jo(n,'아','야')+'."');wrap.innerHTML='';wrap.appendChild(p);};
  if(G.f.newName){call(G.f.newName);box.appendChild(wrap);return;}
  wrap.appendChild(el('label','newname-label','엄마가 지어 준 새 이름'));
  const row=el('div','row');const inp=el('input','newname-input');inp.type='text';inp.maxLength=6;inp.placeholder='이름을 적어 주세요';inp.id='newName';
  const btn=el('button','btn primary','부르기');btn.type='button';
  const go=()=>{const n=(inp.value||'').trim().slice(0,6);if(!n){inp.focus();return;}G.f.newName=n;call(n);};
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
  if(!F.sangunMet)return '호숫가의 산군 할아버지 찾아가기';
  if(!G.boss.dead)return '언 호수의 강철이와 맞서기 (부수거나 달래기)';
  if(!F.fruitGot)return '신목의 전설의 열매 따기';
  if(!F.nameGiven)return '산군 할아버지에게 셈하러 가기';
  return '보따리를 열고 아빠의 약연에 전설의 열매 넣기';
};
})();
