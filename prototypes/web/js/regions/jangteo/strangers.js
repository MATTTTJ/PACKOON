'use strict';
/* 큰 장터 낯선 손님 (leaf-transform.md 6). 형식은 galchamgol/strangers.js 머리말을 따른다.
   수리부엉이 변신은 부엉 영감에게 신표를 받을 때 열린다 (formCheck). 외상은 큰 장터에서는 밤에만. */
(()=>{
const Rg=REGIONS.jangteo;
// 결정 D-25: 낯선 손님 (design/data/decisions.csv)
Rg.strangers={
  yeotbang:{
    line:'어라, 처음 보는 손님이네?\n값은 엿장수 마음대로지~',
    trades:[{give:{solbang:2},get:{honey:1}}],swapPool:['solbang','kong','mung']},
  morak:{
    line:'어서 와, 손님! 설 대목이라 정신없네!\n떡 하나 바꿔 갈래?',
    trades:[{give:{ssal_powder:1},get:{memiltteok:1}}],swapPool:['memiltteok','mung','honey']},
  bueong:{
    line:'보부상단 물건은 보부상에게만 내주오.\n손님은 마루에서 쉬었다 가시오.',   // 결정 D-292: 낯선 어른 손님에게는 한 대화 내내 하오체
    trades:[],
    talk(form){
      if(!G.f.night)return strangerSay([['너구리','(부엉 영감님이 처마 밑에서 졸고 계신다.)']]);
      if(form==='owl'&&strangerOnce('jx_bueong_kin'))return strangerSay([
        ['부엉 영감','같은 밤새로군. 앉으시오.'],
        ['부엉 영감','지난가을 너구리 보부상 하나가\n짐을 맡기고 갔소.'],
        ['부엉 영감','"아들이 오거든" 한마디만 남기고.\n장부에는 그 말을 적을 칸이 없었소.']],
        ()=>diary('jx_bueong_kin','부엉이 모습으로 밤에 찾아가니 부엉 영감님이 푸념처럼 털어놓으셨다. 아빠가 짐을 맡기며 "아들이 오거든"이라고 했단다.'));
      return false;
    }},
  nal:{
    line:'장터 물가 알지? 손님은 값이 좀 세.',
    price:2,trades:[{give:{solbang:2},get:{kong:1}}],swapPool:['kong','mung','honey'],
    talk(){
      if(strangerOnce('jx_nal_price'))diary('jx_nal_price','큰 장터에서도 날쌘은 낯선 손님에게 두 배를 불렀다. 왜 나한테만 값을 안 부풀릴까.');
      return false;
    }},
};
/* 변신이 열리는 때: 부엉 영감에게 팥시루떡을 바치고 신표를 받은 뒤. */
Rg.formCheck=()=>{
  if(!G.f.bueongDone||typeof unlockForm!=='function'||(typeof hasForm==='function'&&hasForm('owl')))return;
  if(open('dlg')||B)return;
  unlockForm('owl');
  diary('form_owl','다들 잠든 밤에 장부를 넘기는 부엉 영감님을 보며 알았다. 밤에 깨어 있는 건 남이 못 보는 걸 적기 위해서다. 잎을 부니 수리부엉이가 됐다.');
  talk([['너구리','(다들 잠든 밤에 장부를 넘기는 부엉 영감님.\n남이 못 보는 걸 적으려고 깨어 계신 거야.)'],['너구리','(잎을 대고 수리부엉이를 떠올리면… 될 것 같아.)']]);
};
})();
