'use strict';
/* 영산 낯선 손님 (leaf-transform.md 6). 형식은 galchamgol/strangers.js 머리말을 따른다.
   아빠는 알아보므로 여기 없다 (story.js talkDad). 두루미(결정 D-1081)는 고개를 돌리지 않아 발소리로만 묻는다 (engine/disguise.js).
   결정 D-1073: 영산의 변신은 수달이다. 낚시하는 수달에게 배운다(story.js otterLearn). 살금이는 변신을 가르치지 않는다. */
(()=>{
const Rg=REGIONS.yeongsan;
// 결정 D-25: 낯선 손님 (design/data/decisions.csv)
Rg.strangers={
  salgeumi:{
    line:'누, 누구세요…\n가까이 오지 마세요…',
    // 굶주린 살금이는 내줄 먹을거리가 없다. 손님 교환도 열지 않는다.
    trades:[],swapPool:[],
    talk(form){
      if(form==='otter'&&strangerOnce('ys_salg_otter'))return strangerSay([
        ['살금이','(살금이가 귀를 세우고 한참 본다.)\n…수, 수달이네. 물가에서 자주 봐.'],
        ['살금이','먹을 게 없어서… 줄 건 없어.']]);
      if(form==='owl')return strangerSay([['너구리','(살금이가 귀를 세우고 바위 뒤로 뒷걸음질 친다.)']]);
      return false;
    }},
  nal:{
    line:'이 높은 데까지 손님이라니.\n산 위 물건은 값이 비싸.',
    price:2,trades:[{give:{darae_vine:2},get:{jip:1}}],swapPool:['jip','darae_vine','jujube'],
    talk(){
      if(strangerOnce('ys_nal_price'))diary('ys_nal_price','영산에서도 날쌘은 손님에게 두 배를 불렀다. 단풍골부터 여기까지, 나한테만은 값을 부풀리지 않았다.');
      return false;
    }},
};
})();
