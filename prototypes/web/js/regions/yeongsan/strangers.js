'use strict';
/* 영산 낯선 손님 (leaf-transform.md 6). 형식은 galchamgol/strangers.js 머리말을 따른다.
   아빠와 산군 할아버지는 알아보므로 여기 없다 (story.js talkDad·talkSangun).
   고라니 변신은 살금이에게 살금살금 다가가 처음 이야기를 들었을 때 열린다 (formCheck). */
(()=>{
const Rg=REGIONS.yeongsan;
const once=(key)=>{const d=G.f.strangerOnce||(G.f.strangerOnce={});if(d[key])return false;d[key]=true;return true;};
const say=(lines,next)=>{talk(lines,next);return true;};
// 결정 D-25: 낯선 손님 (design/data/decisions.csv)
Rg.strangers={
  salgeumi:{
    line:'누, 누구세요…\n가까이 오지 마세요…',
    // 굶주린 살금이는 내줄 먹을거리가 없다. 손님 교환도 열지 않는다.
    trades:[],swapPool:[],
    talk(form){
      if(form==='deer'&&once('ys_salg_kin'))return say([
        ['살금이','고, 고라니다… 반가워.'],
        ['살금이','먹을 게 없어서… 줄 건 없어.\n그래도 같이 있으면 덜 추워.']],
        ()=>diary('ys_salg_kin','고라니 모습으로 살금이 곁에 잠깐 앉아 있었다. 살금이는 줄 게 없다며 미안해했다.'));
      if(form==='owl')return say([['너구리','(살금이가 귀를 세우고 바위 뒤로 뒷걸음질 친다.)']]);
      return false;
    }},
  nal:{
    line:'이 높은 데까지 손님이라니.\n산 위 물건은 값이 비싸.',
    price:2,trades:[{give:{darae_vine:2},get:{jip:1}}],swapPool:['jip','darae_vine','jujube'],
    talk(){
      if(once('ys_nal_price'))diary('ys_nal_price','영산에서도 날쌘은 손님에게 두 배를 불렀다. 네 지역 내내 나한테만은 값을 부풀리지 않았다.');
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
