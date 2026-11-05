'use strict';
/* 단풍골 낯선 손님 (leaf-transform.md 6). 변신한 채 말을 걸면 아이를 몰라보고 그 종족의 손님으로 대한다.
   talk(form)이 true를 돌려주면 그 대사로 끝, 아니면 엔진이 line과 손님 교환(trades·swapPool·외상)을 연다.
   무쇠 삼촌은 집안 사람이라 알아본다 (story.js talkMusoe). */
(()=>{
const Rg=REGIONS.galchamgol;
// 결정 D-25: 낯선 손님 (design/data/decisions.csv)
Rg.strangers={
  dodam:{
    // 결정 D-621: 다람쥐로 가면 같은 종족을 만나 반가워하다가 누구냐고 묻는 데서 끝난다 (사용자 피드백 2026-11-05 단풍골 3).
    //   예전(D-280)엔 묻은 도토리를 같이 찾는 일이 갑자기 벌어졌다. 그 일은 너구리 모습의 사연(도담의 겨울 도토리)에만 둔다.
    get line(){return G.form==='squirrel'?'어? 다람쥐다! 반가워!\n꼬리 털 좋다. 어느 숲에서 왔어?':'어, 처음 보는 얼굴이네!\n도토리 바꿀래?';},
    kin:'squirrel',kinLine:'근데 넌 누구야?\n이 숲 다람쥐는 내가 다 아는데.',
    trades:[{give:{rice:1},get:{acorn:3}}],swapPool:['acorn','powder'],
    talk(form){
      if(form==='owl')return strangerSay([['너구리','(도담이 꼬리를 말고 나무 구멍으로 쏙 숨는다.)']]);
      if(form==='deer'&&strangerOnce('gal_dodam_deer'))return strangerSay([
        ['도담','고라니 손님은 하나도 안 무서워.\n이거 하나 먹어 봐.'],receiveItem('acorn',1)]);
      return false;
    }},
  toad:{
    line:'처음 보는 손님이로구나.\n…풋잎 냄새가 나는구나.',
    trades:[{give:{acorn:3},get:{ssari:1}}],swapPool:['ssari','kkoe','root','vine']},
  nal:{
    line:'어이, 처음 보는 손님이네.\n여기 물건은 값이 좀 나가.',
    price:2,trades:[{give:{acorn:2},get:{salt:1}},{give:{root:1},get:{sesame:1}}],swapPool:['salt','sesame','vine'],
    talk(){
      if(strangerOnce('gal_nal_price'))diary('gal_nal_price','낯선 손님으로 가니 날쌘이 값이 좀 나간다며 세게 불렀다. 처음 보는 손님한테는 저렇구나.');
      return false;
    }},
};
})();
