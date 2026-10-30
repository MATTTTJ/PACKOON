'use strict';
/* 영산 낯선 손님 (leaf-transform.md 6). 형식은 galchamgol/strangers.js 머리말을 따른다.
   아빠와 산군 할아버지는 알아보므로 여기 없다 (story.js talkDad·talkSangun).
   고라니 변신은 살금이에게 살금살금 다가가 처음 이야기를 들었을 때 열린다 (formCheck). */
(()=>{
const Rg=REGIONS.yeongsan;
const once=(key)=>{const d=G.f.strangerOnce||(G.f.strangerOnce={});if(d[key])return false;d[key]=true;return true;};
const say=(lines,next)=>{talk(lines,next);return true;};
Rg.strangers={
  salgeumi:{
    line:'누, 누구세요…\n가까이 오지 마세요…',
    trades:[{give:{kong:1},get:{magamok:1}}],swapPool:['magamok','jujube','darae_vine'],
    talk(form){
      if(form==='deer'&&once('ys_salg_kin'))return say([
        ['살금이','고, 고라니다… 반가워.'],
        ['살금이','겨울 나는 풀 자리 알려 줄게.\n바위 밑 눈을 헤치면 마가목이 있어.']],
        ()=>{addItem('magamok',2);diary('ys_salg_kin','고라니 모습으로 살금이에게 가니 겨울 나는 자리를 알려 주며 마가목 열매를 나눠 줬다.');});
      if(form==='owl')return say([['너구리','(살금이가 귀를 세우고 바위 뒤로 뒷걸음질 친다.)']]);
      return false;
    }},
  nal:{
    line:'이 높은 데까지 손님이라니.\n산 위 물건은 값이 비싸.',
    price:2,trades:[{give:{darae_vine:2},get:{jip:1}}],swapPool:['jip','darae_vine','jujube'],
    talk(){
      if(once('ys_nal_price'))diary('ys_nal_price','영산에서도 날쌘은 손님에게 두 배를 불렀다. 네 지역 내내 나한테만 제값이었다.');
      return false;
    }},
};
/* 변신이 열리는 때: 살금이를 처음 만나 이야기를 들은 뒤. */
Rg.formCheck=()=>{
  if(!G.f.salgMet||typeof unlockForm!=='function'||(typeof hasForm==='function'&&hasForm('deer')))return;
  if(open('dlg')||B)return;
  unlockForm('deer');
  diary('form_deer','살금이를 보며 알았다. 고라니는 겁이 많아서 먼저 듣는다. 그래서 살아남는다. 잎을 부니 고라니가 됐다.');
  talk([['너구리','(살금이는 겁이 많아서 먼저 듣는구나.\n그래서 이 산에서 살아남았어.)'],['너구리','(잎을 대고 고라니를 떠올리면… 될 것 같아.)']]);
};
})();
