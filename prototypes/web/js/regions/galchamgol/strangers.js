'use strict';
/* 단풍골 낯선 손님 (leaf-transform.md 6). 변신한 채 말을 걸면 아이를 몰라보고 그 종족의 손님으로 대한다.
   talk(form)이 true를 돌려주면 그 대사로 끝, 아니면 엔진이 line과 손님 교환(trades·swapPool·외상)을 연다.
   무쇠 삼촌은 집안 사람이라 알아본다 (story.js talkMusoe). */
(()=>{
const Rg=REGIONS.galchamgol;
const once=(key)=>{const d=G.f.strangerOnce||(G.f.strangerOnce={});if(d[key])return false;d[key]=true;return true;};
const say=(lines,next)=>{talk(lines,next);return true;};
// 결정 D-25: 낯선 손님 (design/data/decisions.csv)
Rg.strangers={
  dodam:{
    line:'어, 처음 보는 얼굴이네!\n도토리 바꿀래?',
    trades:[{give:{rice:1},get:{acorn:3}}],swapPool:['acorn','powder'],
    talk(form){
      if(form==='owl')return say([['너구리','(도담이 꼬리를 말고 나무 구멍으로 쏙 숨는다.)']]);
      if(form==='squirrel'&&once('gal_dodam_kin'))return say([
        ['도담','어? 다람쥐 손님이다!\n나 묻어 둔 데를 또 잊었어.'],
        ['도담','같이 찾아 주면 반 줄게.'],
        ['너구리','(둘이 낙엽을 헤집자 묻어 둔 도토리가 나왔다.)'],
        ['도담','찾았다! 자, 반!']],()=>{addItem('acorn',2);diary('gal_dodam_kin','다람쥐 모습으로 도담과 잊은 도토리를 찾아 반씩 나눴다.');});
      if(form==='deer'&&once('gal_dodam_deer'))return say([
        ['도담','고라니 손님은 하나도 안 무서워.\n이거 하나 먹어 봐.']],()=>addItem('acorn',1));
      return false;
    }},
  toad:{
    line:'처음 보는 손님이로구나.\n…풋잎 냄새가 나는구나.',
    trades:[{give:{acorn:3},get:{ssari:1}}],swapPool:['ssari','kkoe','root','vine']},
  nal:{
    line:'어이, 처음 보는 손님이네.\n여기 물건은 값이 좀 나가.',
    price:2,trades:[{give:{acorn:2},get:{salt:1}},{give:{root:1},get:{sesame:1}}],swapPool:['salt','sesame','vine'],
    talk(){
      if(once('gal_nal_price'))diary('gal_nal_price','낯선 손님으로 가니 날쌘이 값이 좀 나간다며 세게 불렀다. 처음 보는 손님한테는 저렇구나.');
      return false;
    }},
};
})();
