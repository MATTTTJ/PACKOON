'use strict';
/* 큰 장터의 수첩 쪽 (원본: design/data/notebook.csv, 모두 제안).
   아빠는 젊은 보부상 시절 큰 장터를 자주 드나들었다. 부엉 영감과 보부상단, 장터 도깨비 이야기를 안다 */
defineNotes('jangteo',[
  /* ---------- 동물 ---------- */
  {id:'morak',kind:'animal',lines:[
    {who:'dad',text:'큰 장터 떡집 곰. 손이 커서 떡을 덤으로 얹어 준다.'},
    {who:'me',when:'met:morak',text:'설 대목인데 떡집 맷돌이 깨져 쌀가루가 모자란다.'},
    {who:'me',when:'morak:steam',text:'시루는 김을 다룰 줄 알아야 깨어난다. 불은 조금씩, 김은 고르게.'},
    {who:'me',when:'morak:memiltteok',text:'메밀가루 둘이면 메밀떡을 찔 수 있다고 알려 줬다. 도깨비는 메밀을 좋아한다는 말도.'}]},
  {id:'yeotbang',kind:'animal',lines:[
    {who:'dad',text:'여우 엿장수. 엿장수 마음대로다. 가위 장단을 맞춰 주면 흥이 나서 덤을 준다.'},
    {who:'me',when:'met:yeotbang',text:'엿을 고려면 불을 오래 때야 해서 솔방울을 귀하게 친다.'},
    {who:'me',when:'yeotbang:high',text:'장단이 맞자 흥이 올라, 숨겨 둔 아빠의 엿을 내줬다.'}]},
  {id:'bueong',kind:'animal',lines:[
    {who:'dad',text:'보부상단 접장 수리부엉이. 밤에만 깬다. 장부를 꼼꼼히 적는 어른.'},
    {who:'me',when:'bueong:night',text:'낮에는 처마 밑에서 존다. 숙소 마루에서 해가 지기를 기다리면 된다.'},
    {who:'me',when:'bueong:rule',text:'보부상단 물건은 보부상에게만 내준다. 규칙이 먼저다.'},
    {who:'me',when:'bueong:sinpyo',text:'설 고사에 팥시루떡을 올리자 장부에 내 이름을 적고 신표를 줬다.'}]},
  {id:'nal',kind:'animal',lines:[
    {who:'me',when:'nal:jangteo-memil',text:'큰 장터에선 돌너머 메밀가루를 팥 두 되로 쳐줬다.'}]},
  {id:'dokkaebi',kind:'animal',lines:[
    {who:'dad',text:'장터 도깨비 이야기: 헌것에 깃들어 장난을 친다. 메밀 한 그릇이면 순해진다더라.'},
    {who:'me',when:'fight:dokkaebi',text:'낡은 빗자루·키·멍석에 깃든 도깨비. 빗자루는 쓸고, 키는 콩을 뿌리고, 멍석은 말려 든다.'},
    {who:'me',when:'core:dokkaebi',text:'헌물을 하나 부수면 도깨비불이 드러난다.'},
    {who:'me',when:'like:dokkaebi:memiltteok',text:'메밀떡을 주니 덩실덩실 춤을 췄다. 아빠 수첩에 적힌 대로다.'},
    {who:'me',when:'like:dokkaebi:dad_yeot',text:'아빠의 엿을 주자 꼭 끌어안고 돌려주지 않았다.'},
    {who:'me',when:'calm:dokkaebi',text:'달래면 훔친 것을 제자리에 돌려놓고 눈홍시를 하나 더 준다.'}]},
  /* ---------- 물건 ---------- */
  {id:'solbang',kind:'item',lines:[]},
  {id:'pat',kind:'item',dadDrawing:true,lines:[
    {who:'dad',text:'설 고사떡에는 붉은 팥. 잡귀를 쫓는다.'}]},
  {id:'dokkaebibul',kind:'item',lines:[]},
  {id:'nunhongsi',kind:'item',lines:[]},
]);
