'use strict';
/* 결정 D-194·D-232: 변신한 채 말을 걸면 (사용자 피드백 63, 2026-11-01)
   NPC 들은 아이를 너구리 모습으로만 안다. 확정(기획서 §3 변신)대로 변신한 동안은 아이를 몰라보고 낯선 손님으로 대한다(D-232).
   손님 교환·기믹이 있는 인물(REG.strangers)은 손님 첫마디와 교환으로, 없는 인물은 누구냐는 말로 받는다.
   어느 쪽이든 '본모습을 보인다'를 고르면 아이가 잎을 불어 너구리로 돌아와 자기라는 걸 보인 뒤 원래 대화(필드의 말 걸기)로 이어진다.
   - 처음 보는 인물(met: 표시 없음)은 낯선 짐승을 경계하는 말(first)을, 아는 인물은 알 듯 말 듯한 말(ask)을 한다.
   - 같은 지역에서 그 인물에게 두 번째부터는 짧은 물음(again)과 아이의 짧은 대답만 나온다. 묻는 말은 늘 나온다.
   - 표에 없는 것(물레방아 손일 자리·투호 항아리·등불 꾸러미·쉼터 같은 사물)은 묻지 않고 예전처럼 다룬다.
   - 집안 사람(무쇠·아빠)과 산군(knows)은 잎사귀 둔갑을 알아보니 묻고 나서 바로 본모습으로 돌아온다. story.js 의 if(G.form) 갈래는 이제 닿지 않는다(본모습으로 돌아온 뒤 talk).
   - 결정 D-345: 손님 첫마디(strangers 의 line)가 있는 인물은 그 첫마디가 묻는 말을 대신한다(forms.js strangerTalk).
     그래서 그 인물들(날쌘·도담·두꺼비 할멈·돌쇠·뿔영감·꾸벅이·모락·엿방울·부엉 영감·살금이)은 first·ask·again 없이 대답 쪽 줄만 둔다.
   줄 값은 문자열이거나 (변신 id, 인물)→문자열 함수. {f}는 변신 이름, {f이}는 받침에 따라 '이'를 붙인 변신 이름. */
const DISGUISE_ME={low:'나야, 나.',high:'저예요.'},DISGUISE_ME_FIRST={low:'놀랐지? 미안.',high:'놀라게 해서 죄송해요.'};
const DISGUISE_ME_AGAIN={low:'나야.',high:'저예요.'};
const DISGUISE_MAGPIE={tone:'high',
  first:'어디서 온 짐승이냐.\n처음 보는 얼굴이로구나.',ask:'누구냐. …보따리 끈이 낯익은데.',again:'누구냐. …또 너로구나.',
  back:'오냐, 너로구나.\n하마터면 몰라볼 뻔했다.',backFirst:'너구리였구나.'};
const DISGUISE_NAL={tone:'high',
  back:'하, 너였어? 별 재주를 다 부리네.',backFirst:'너구리였어? 별 재주를 다 부리네.'};
const DISGUISE_LINES={
  /* 단풍골 */
  musoe:{tone:'high',knows:true,me:'네, 삼촌.',
    first:'누구냐. …잎 소리.\n삼촌 앞에선 제 모습으로 와라.',ask:'누구냐. …잎 소리.\n삼촌 앞에선 제 모습으로 와라.',again:'누구냐… 또 너구나.',
    back:'그래. 잎은 제법 다루는구나.',backFirst:'그래. 잎은 제법 다루는구나.'},
  nal:DISGUISE_NAL,
  dodam:{tone:'low',
    back:'뭐야, 너였어? 깜짝 놀랐잖아!',backFirst:'우와, 너구리가 됐어!'},
  toad:{tone:'high',
    back:'허허, 너였구나. 재주가 늘었구나.',backFirst:'허허, 너구리였구나.'},
  stream_otter:{tone:'low',
    first:'누구야? 함지박 건드리지 마!',ask:'누구야? 처음 보는 애네.\n이 함지박, 떠내려가면 또 이고 와야 돼!',again:'또 누구야? …너지!',
    back:'뭐야, 너였어? 감쪽같다!',backFirst:'어, 너구리였어?'},
  // 검댕은 연기에 눈이 절어 잘 못 본다 (npcs.csv)
  charcoal_badger:{tone:'high',
    first:'콜록… 거기 누구냐.\n연기에 눈이 절어서 잘 안 보인다.',ask:'콜록… 거기 누구냐.\n몸집이 낯선데.',again:'콜록… 누구냐.',
    back:'…너였냐. 콜록.',backFirst:'…너구리로군. 콜록.'},
  lost_chick:{tone:'low',owl:'히익! 누, 누구야?\n나 잡아먹으면 안 돼!',
    first:'누, 누구야? 엄마 아니지…?',ask:'누구야…? 엄마 아니지…?',again:'누구야? …아, 너지?',
    back:'휴, 너였구나! 깜짝 놀랐어.',backFirst:'휴… 너구리구나.'},
  squirrel_brothers:{tone:'low',who:'다람쥐 형',owl:'히익! 누, 누구야?!',
    first:'누구야? 처음 보는 {f이}네.',ask:'누구야? 처음 보는 얼굴인데.',again:'또 누구야? …너지?',
    back:'뭐야, 너였어?',backFirst:'너구리잖아? 별일이네.'},
  old_magpie:DISGUISE_MAGPIE,
  /* 돌너머 */
  ppuri:{tone:'high',
    back:'…너였군. 다음엔 제 모습으로 와라.',backFirst:'너구리였군. 다음엔 제 모습으로 와라.'},
  // 돌쇠 할배는 눈이 어두워 발소리와 목소리로 안다 (npcs.csv)
  dolsoe:{tone:'high',
    back:'허허, 목소리를 들으니 알겠다.',backFirst:'어린 목소리로구나.'},
  // 꾸벅이는 졸다가 잠깐씩 고개를 든다. 조는 동안엔 잠꼬대처럼 묻는다 (dolneomeo/art.js kkuAwakeNow)
  kkubeogi:{tone:'low',me:'꾸벅아, 나야.',meFirst:'놀랐지? 미안.',
    back:()=>REG.kkuAwakeNow?.()?'…아, 너구나…\n냄새가 바뀌어서 몰랐어어…':'…으음… 너구나… 쿨…',
    backFirst:()=>REG.kkuAwakeNow?.()?'…너구리 냄새다아…':'…으음… 너구리… 쿨…'},
  dol_hare:{tone:'high',owl:'히익, 누구야?!',
    first:'어이쿠, 누구야?\n짐 진 데 부딪치지 마!',ask:'누구야? 처음 보는 얼굴인데.',again:'누구… 또 너지?',
    back:'아이고, 너였구나!',backFirst:'너구리였구나. 놀랐네.'},
  dol_mole:{tone:'low',owl:'히익! 누, 누구야? 할배!',
    first:'누구야…? 처음 맡는 냄새야.',ask:'누구야…? 처음 맡는 냄새야.',again:'또 누구야?',
    back:'너였어? 놀랐잖아.',backFirst:'너구리구나.'},
  dol_magpie:DISGUISE_MAGPIE,
  // 메밀댁은 메밀을 널어 두고 까마귀를 쫓는다 (dolneomeo)
  dol_badger:{tone:'high',owl:'훠이, 훠이! 누구냐,\n메밀 쪼러 왔느냐!',
    first:'훠이! …까마귀가 아니구나. 누구냐.',ask:'훠이! …까마귀가 아니구나. 누구냐.',again:'훠이! …또 누구냐.',
    back:'아이고, 너였구나.',backFirst:'너구리였구나.'},
  dol_frog:{tone:'high',owl:'히익… 누, 누구야…?\n잡아먹지 마…',
    first:'누, 누구야…?\n다리에 힘이 없어서 도망도 못 가.',ask:'누구…야? 처음 보는데.',again:'누, 누구야…?',
    back:'아, 너였구나… 휴.',backFirst:'너구리구나… 휴.'},
  // 남생이 할미는 느리고 짧게 말한다
  dol_turtle:{tone:'high',
    first:'…누구냐.',ask:'…누구냐.',again:'…누구냐.',back:'…너로구나.',backFirst:'…너구리로구나.'},
  /* 큰 장터 */
  morak:{tone:'high',
    back:'어머나, 너였어? 깜박 속았네!',backFirst:'어머, 너구리였어?'},
  yeotbang:{tone:'high',
    back:'역시 너였구나~ 재주 좋네~',backFirst:'너구리였어? 재주 좋네~'},
  // 부엉 영감은 낮엔 존다. 자는 동안엔 묻지 않는다(그대로 원래 대화가 조는 모습을 보인다).
  bueong:{tone:'high',skip:()=>!G.f.night,
    back:'…너로구나. 셈은 제 모습으로 하거라.',backFirst:'…너구리로구나.'},
  j_kite:{tone:'low',
    first:'누구야? 처음 보는 얼굴인데.',ask:'누구야? 처음 보는 얼굴인데.',again:'또 누구야?',
    back:'뭐야, 너였어!',backFirst:'너구리였어?'},
  j_yut:{tone:'high',
    first:'허허, 뉘신가. 처음 보는 얼굴일세.',ask:'허허, 뉘신가. 처음 보는 얼굴일세.',again:'허허, 이번엔 뉘신가.',
    back:'허허, 너였구나. 감쪽같구나.',backFirst:'허허, 너구리였구나.'},
  j_jjandol:{tone:'high',
    first:'누구요. 소금 사러 온 손님이오?',ask:'누구요. 처음 보는 얼굴인데.',again:'누구… 또 너냐.',
    back:'…너였냐. 장사꾼 눈을 속이다니.',backFirst:'너구리였군.'},
  j_deungjan:{tone:'high',owl:'히익! 수, 수리부엉이다!\n누, 누구세요?!',
    first:'어이쿠, 누구야? 처음 보는 얼굴이네!',ask:'누구야? 어디서 본 것도 같고.',again:'또 누구야?',
    back:'휴, 너였구나! 간 떨어질 뻔했네.',backFirst:'너구리였어? 휴.'},
  // 새끼 멧돼지는 냄새로 길을 찾는다
  j_boar:{tone:'low',
    first:'킁킁… 누구야? 처음 맡는 냄새야.',ask:'킁킁… 누구야?\n냄새는 아는 냄새 같은데.',again:'킁킁… 또 누구야?',
    back:'역시 너였구나!',backFirst:'너구리구나!'},
  j_magpie:DISGUISE_MAGPIE,
  /* 북쪽 영산 */
  ongdal:{tone:'high',
    first:'(할미가 코를 킁킁거린다.)\n…낯선 짐승이구먼. 누구여.',ask:'(할미가 코를 킁킁거린다.)\n…누구여. 냄새는 아는 냄샌데.',again:'…누구여.',
    back:'…그 꼬마구먼.',backFirst:'…너구리구먼.'},
  // 살금이는 늘 귀를 세운다. 고라니 변신은 살금이를 보고 익혔다.
  salgeumi:{tone:'low',
    back:'너, 너였어? 귀가 다 쭈뼛했잖아.',backFirst:'너구리구나… 휴.'},
  // 아빠는 말을 잃었다. 몸짓으로만 묻고, 집안 사람이라 잎사귀를 알아본다.
  // 결정 D-436: 이름을 먹혀 넋이 빠진 동안은 누구에게도 돌아보지 않는다. 그동안은 영산 talkDad 가 맡는다
  dad:{tone:'high',knows:true,skip:()=>!REGIONS.yeongsan?.namesBack?.(),me:'아빠, 저예요.',meFirst:'아빠, 저예요.',meAgain:'저예요, 아빠.',
    first:'(아빠가 낯선 짐승을 물끄러미 본다.\n누구냐고 묻는 눈이다.)',ask:'(아빠가 짐짓 고개를 갸웃한다.\n어디서 온 손님이냐는 얼굴이다.)',
    again:'(아빠가 또 짐짓 고개를 갸웃한다.)',
    back:'(아빠가 보따리 끈의 잎사귀를 손가락으로 톡 친다.)\n…다 보인다.',backFirst:null},
  sangun:{tone:'high',knows:true,me:'단풍골 너구리예요.',meFirst:'단풍골 너구리예요.',
    first:'무엇으로 왔느냐. 이름을 대어라.',ask:'무엇으로 왔느냐. 이름을 대어라.',again:'무엇으로 왔느냐.',
    back:'무엇으로 와도 너는 너다.',backFirst:'무엇으로 와도 너는 너다.'},
  y_bear_lullaby:{tone:'low',
    first:'누구야? 쉿, 엄마 자.',ask:'누구야? 쉿, 엄마 자.',again:'누구야? 쉿.',
    back:'너였구나! 쉿.',backFirst:'너구리구나. 쉿.'},
  y_crow_direction:{tone:'low',
    first:'누구야?\n위에서 봐도 처음 보는 얼굴인데.',ask:'누구야? 어디서 본 것 같기도 하고.',again:'또 누구야?',
    back:'아, 너였구나.',backFirst:'너구리였어?'},
  y_otter_wait:{tone:'low',
    first:'쉿, 누구야? 물고기 놀라.',ask:'쉿, 누구야? 물고기 놀라.',again:'쉿, 또 누구야?',
    back:'너였구나. 쉿.',backFirst:'너구리구나. 쉿.'},
  y_magpie_knot:DISGUISE_MAGPIE,
  y_home_parcel:Object.assign({who:'늙은 까치'},DISGUISE_MAGPIE),
};
function disguiseEntry(p){
  const e=p&&DISGUISE_LINES[p.id];
  return e&&!(typeof e.skip==='function'&&e.skip())?e:null;
}
const disguiseApplies=p=>!!(G?.form&&disguiseEntry(p));
function disguiseText(v,form,p){
  if(typeof v==='function')v=v(form,p);
  if(typeof v!=='string')return v;
  const name=formName(form);
  return v.replace(/\{f이\}/g,jo(name,'이','')).replace(/\{f\}/g,name);
}
/* 손님 대접(D-232) → '본모습을 보인다'를 고르면 → 아이의 대답 → 아는 사이면 반응 → next(). */
function disguiseTalk(p,next){
  const e=disguiseEntry(p),form=G.form,who=e.who||p.speakers?.[0]||p.name;
  const seen=G.f.disguiseSeen||(G.f.disguiseSeen={}),key=REG.id+':'+p.id,again=(seen[key]||0)>0;
  const met=knows('met:'+p.id);
  seen[key]=(seen[key]||0)+1;
  // 변신마다 다른 첫마디(수리부엉이를 무서워하는 작은 짐승, 같은 종족을 처음 본 인물)는 처음 물을 때만 쓴다
  const ask=disguiseText((!again&&e[form])||(again?e.again:met?e.ask:e.first),form,p);
  const reveal=()=>{
    setForm('',{force:true});
    const lines=[['너구리',again?(e.meAgain||DISGUISE_ME_AGAIN[e.tone]):met?(e.me||DISGUISE_ME[e.tone]):(e.meFirst||DISGUISE_ME_FIRST[e.tone])]];
    const back=again?null:disguiseText(met?e.back:e.backFirst,'',p);
    if(back)lines.push([who,back]);
    talk(lines,next);
  };
  if(e.knows)talk([[who,ask]],reveal);
  else if(typeof strangerEntry==='function'&&strangerEntry(p.id))strangerTalk(p,{reveal,askLine:ask});
  else talk([[who,ask,[{t:'본모습을 보인다',go:reveal},{t:'그만두기',go:null}]]]);
}
/* 결정 D-197: 지금 대화 상대와 보따리를 펴거나 물건을 건넬 수 없는 때 (사용자 피드백 57).
   변신한 채로는 상대가 아이를 모른다(손님 교환은 손님 대화의 선택지로만). 지역은 REG.tradeClosed(id) 로 더 막는다(꾸벅이가 조는 동안). */
const tradeClosedNow=id=>!!(G?.form||(dlgScene&&open('dlg'))||(id&&typeof REG?.tradeClosed==='function'&&REG.tradeClosed(id)));   // 결정 D-440: 사연 장면 도중도 닫는다
