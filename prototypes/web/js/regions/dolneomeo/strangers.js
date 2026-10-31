'use strict';
/* 돌너머 낯선 손님 (leaf-transform.md 6). 형식은 galchamgol/strangers.js 머리말을 따른다.
   산양 변신은 뿔이가 장승제를 받고 길을 열 때 열린다 (formCheck). */
(()=>{
const Rg=REGIONS.dolneomeo;
const once=(key)=>{const d=G.f.strangerOnce||(G.f.strangerOnce={});if(d[key])return false;d[key]=true;return true;};
const say=(lines,next)=>{talk(lines,next);return true;};
// 결정 D-25: 낯선 손님 (design/data/decisions.csv)
Rg.strangers={
  dolsoe:{
    line:'발소리가 낯설구나.\n어디서 온 손님이냐.',
    trades:[{give:{rice:1},get:{stonedust:1}}],swapPool:['stonedust','mud','memil'],
    talk(form){
      if(form==='owl')return say([['너구리','(깃 소리에 돌쇠 할배가 움찔하더니 흙 속으로 고개를 묻는다.)']]);
      return false;
    }},
  ppuri:{
    line:'장승제를 올리지 않은 자는\n돌산에 오르지 못한다. 손님도 같다.',
    trades:[],
    talk(form){
      if(form==='goat'&&once('dol_ppuri_kin'))return say([
        ['뿔이','고개 넘는 산양이로군.\n산양끼리는 먹을 데를 나눈다.'],
        ['뿔이','절벽 아래 바위에서 뗀 석이다.\n하나 가져가라.']],()=>{addItem('seogi',1);diary('dol_ppuri_kin','산양 모습으로 뿔이에게 가니 산양끼리 먹을 데를 나눈다며 석이버섯을 줬다.');});
      return false;
    }},
  kkubeogi:{
    line:'으음… 누구야…\n처음 맡는 냄새인데…',
    trades:[{give:{acorn:2},get:{eoksae:1}}],swapPool:['eoksae','memil'],
    talk(form){
      if(form==='owl')return say([['너구리','(꾸벅이가 가시를 세우고 동그랗게 몸을 만다.)']]);
      if(form==='deer'&&once('dol_kkubeogi_deer'))return say([
        ['꾸벅이','고라니구나… 너는 안 찌를게…\n둥지 짓다 남은 거 가져가…'],
        ['꾸벅이','근데 그 족제비 있잖아…\n너구리 꼬마보다 하루 먼저 왔더라…'],
        ['꾸벅이','쿨…']],()=>{addItem('eoksae',1);diary('dol_kkubeogi_deer','고라니 모습으로 가니 꾸벅이가 경계를 풀었다. 꾸벅이가 날쌘이 나보다 하루 먼저 마을에 왔다고 했다.');});
      return false;
    }},
  nal:{
    line:'손님, 돌투성이 마을에서 물건 찾기 힘들지?\n값은 좀 세.',
    price:2,trades:[{give:{memil:2},get:{gyeousari:1}}],swapPool:['gyeousari','mud','eoksae'],
    talk(){
      if(once('dol_nal_price'))diary('dol_nal_price','돌너머에서도 날쌘은 낯선 손님에게 두 배를 불렀다.');
      return false;
    }},
};
/* 변신이 열리는 때: 뿔이가 장승제를 받고 돌산 길을 연 뒤. */
Rg.formCheck=()=>{
  if(!G.f.ppuriPassed||typeof unlockForm!=='function'||(typeof hasForm==='function'&&hasForm('goat')))return;
  if(open('dlg')||B)return;
  unlockForm('goat');
  // 결정 D-130: 아이가 방금 본 것(금줄을 걷던 뿔이의 발굽)에서 떠올린다.
  diary('form_goat','금줄을 걷던 뿔이는 비탈 돌을 딛고도 한 번도 미끄러지지 않았다. 산양은 디딜 데를 먼저 살핀다. 잎을 부니 산양이 됐다.');
  talk([['너구리','(금줄을 걷던 뿔이 발굽,\n비탈 돌에서도 안 미끄러졌어.)'],['너구리','(잎을 대고 그 발굽을 떠올리면… 될 것 같아.)']]);
};
})();
