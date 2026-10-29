'use strict';
/* 북쪽 영산의 수첩 쪽 (원본: design/data/notebook.csv, 모두 제안).
   아빠는 젊은 시절 영산 이야기를 들어 적어 두었다. 전설의 열매 그림 옆 "여기다."는 열매를 딸 때 보인다 (언제 적었는지는 기획서 §14 미정 9) */
defineNotes('yeongsan',[
  /* ---------- 동물 ---------- */
  {id:'nal',kind:'animal',lines:[
    {who:'me',when:'nal:yeongsan',text:'아빠와 같은 보부상단이었다고 털어놓았다. 아빠는 날쌘을 끝까지 얕보지 않았다고.'},
    {who:'me',when:'nal:tosi',text:'신표를 보더니 말없이 털토시를 얹어 줬다.'}]},
  {id:'salgeumi',kind:'animal',lines:[
    {who:'me',when:'met:salgeumi',text:'겁 많은 고라니. 겨울 끝이라 굶주렸다.'},
    {who:'me',when:'salgeumi:alert',text:'귀를 쫑긋 세울 때 움직이면 놀라 달아난다. 그땐 멈춰야 한다.'},
    {who:'me',when:'salgeumi:shortcut',text:'마가목 열매를 좋아한다. 얼어붙은 비탈의 지름길을 안다.'}]},
  {id:'dad',kind:'animal',lines:[
    {who:'me',when:'met:dad',text:'호숫가에서 신목만 바라보고 있었다. 말을 잃었다.'},
    {who:'me',when:'dad:ledger',text:'몸짓으로 말한다. 천천히 보면 알아들을 수 있다.'}]},
  {id:'sangun',kind:'animal',lines:[
    {who:'dad',text:'영산의 주인, 산군 할아버지. 셈이 맞지 않으면 아무것도 내주지 않는다.'},
    {who:'me',when:'sangun:story',text:'엄마의 오래된 거래 상대. 악하지 않다. 셈이 맞아야 할 뿐이다.'},
    {who:'me',when:'sangun:name',text:'내 이름으로 셈을 맞췄다.'}]},
  {id:'gangcheol',kind:'animal',lines:[
    {who:'dad',text:'영산 호수의 이무기 이야기. 지나는 곳마다 추위를 몬다. 따뜻한 것을 그리워한다더라.'},
    {who:'me',when:'fight:gangcheol',text:'호수를 휘감은 이무기. 입은 서리를 뿜고, 몸통은 조여 오고, 꼬리는 고드름을 뿌린다.'},
    {who:'me',when:'core:gangcheol',text:'몸통을 풀어야 머리가 드러난다.'},
    {who:'me',when:'like:gangcheol:dokkaebibul',text:'도깨비불씨의 온기에 눈을 감았다. 아빠 수첩에 적힌 대로다.'},
    {who:'me',when:'like:gangcheol:patsirutteok',text:'붉은 팥을 꺼린다.'},
    {who:'me',when:'calm:gangcheol',text:'달래면 남쪽 바다로 떠나며 서리 수염을 남긴다.'}]},
  /* ---------- 물건 ---------- */
  {id:'darae_vine',kind:'item',lines:[]},
  {id:'magamok',kind:'item',dadDrawing:true,lines:[
    {who:'dad',text:'영산 비탈에 많다. 고라니가 좋아한다.'}]},
  {id:'broken_orb',kind:'item',lines:[]},
  {id:'legend_fruit',kind:'item',dadDrawing:true,lines:[
    {who:'dad',text:'영산 신목의 열매. 봄에만 열린다.'},
    {who:'dad',when:'got:legend_fruit',text:'(그림 옆에 나중에 덧쓴 글씨) 여기다.'}]},
]);
