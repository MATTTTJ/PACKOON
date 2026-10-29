'use strict';
/* 갈참골의 수첩 쪽 (원본: design/data/notebook.csv, 모두 제안).
   아빠 메모(dad)는 젊은 보부상 시절에 적은 짧은 것. 내 기록(me)은 when 의 순간에 적힌다 */
defineNotes('galchamgol',[
  /* ---------- 동물 ---------- */
  {id:'dodam',kind:'animal',lines:[
    {who:'me',when:'met:dodam',text:'갈참골 어귀의 다람쥐. 아빠 모자를 알아봤다. 말이 많아서, 물으면 아는 걸 다 말해 준다.'}]},
  {id:'nal',kind:'animal',lines:[
    {who:'dad',text:'족제비 떠돌이 보부상. 깍쟁이다. 얕보는 소리를 들으면 오기로 덤을 얹는다.'},
    {who:'me',when:'nal:bluff-paid',text:'정말이었다. 촌구석이라고 허세를 부렸더니 숯을 하나 더 줬다.'},
    {who:'me',when:'nal:yakyeon',text:'아빠의 약연은 받지 않는다. 남의 집 가업 물건은 안 받는 게 보부상 법도라고.'},
    {who:'me',when:'nal:dolneomeo',text:'돌너머에서는 갈참골 칡꽃을 귀하게 쳤다. 같은 물건도 마을마다 값이 다르다.'}]},
  {id:'musoe',kind:'animal',lines:[
    {who:'dad',text:'갈참골 대장장이 오소리. 무뚝뚝해도 의리는 있다. 숯이 없으면 불을 안 지핀다.'},
    {who:'me',when:'fight:musoe',text:'말보다 시험이 먼저다. 덤비면 꿀밤으로 연장부터 뺏으니, 피하기만 해야 한다.'},
    {who:'me',when:'like:musoe:rice',text:'출출할 때 주먹밥을 건네면 어깨가 내려간다.'},
    {who:'me',when:'like:musoe:powder',text:'도토리 가루도 반긴다.'},
    {who:'me',when:'musoe:forge',text:'쇠는 가장 빨갛게 달았을 때 쳐야 한다. 박자를 놓치면 쇠가 운다.'}]},
  {id:'toad',kind:'animal',lines:[
    {who:'dad',text:'두꺼비 약재상. 약은 잘 짓는데, 아는 걸 다 말하지는 않는다.'},
    {who:'me',when:'met:toad',text:'엄마의 병을 고치지는 못해도 늦출 수는 있다고 했다. 무언가 알면서 말을 아낀다.'},
    {who:'me',when:'met:toad',text:'보따리 속 약연을 보더니 아직 쓸 때가 아니라고 했다.'}]},
  {id:'kudzu',kind:'animal',lines:[
    {who:'me',when:'fight:kudzu',text:'당산나무를 감은 칡덩굴. 덩굴손은 위에서 휩쓸고, 뿌리는 땅에서 솟는다.'},
    {who:'me',when:'core:kudzu',text:'덩굴손이나 뿌리를 하나 꺾어야 심이 드러난다.'},
    {who:'me',when:'like:kudzu:ssari',text:'싸리버섯 향을 맡으면 덩굴이 느슨해진다.'},
    {who:'me',when:'like:kudzu:kkoe',text:'꾀꼬리버섯 향도 좋아한다.'},
    {who:'me',when:'calm:kudzu',text:'부수지 않고 달래면 보랏빛 칡꽃을 피워 두고 물러난다.'}]},
  /* ---------- 물건 ---------- */
  {id:'acorn',kind:'item',dadDrawing:true,lines:[
    {who:'dad',text:'갈참골에선 도토리 가루가 돈 대신 돈다. 세 알이면 한 줌.'}]},
  {id:'root',kind:'item',lines:[]},
  {id:'ssari',kind:'item',dadDrawing:true,lines:[
    {who:'dad',text:'밑동을 단번에 꺾을 것. 갓이 부서지면 값이 떨어진다.'}]},
  {id:'kkoe',kind:'item',lines:[]},
  {id:'meoru',kind:'item',dadDrawing:true,lines:[
    {who:'dad',text:'당산나무 꼭대기의 머루. 해를 머금은 듯 알이 따뜻하다.'},
    {who:'dad',when:'got:meoru',text:'(그림 옆에 나중에 덧쓴 글씨) 여기도 아니다.'}]},
  {id:'kflower',kind:'item',lines:[]},
]);
