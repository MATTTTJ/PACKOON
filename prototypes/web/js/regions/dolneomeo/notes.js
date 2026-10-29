'use strict';
/* 돌너머 마을의 수첩 쪽 (원본: design/data/notebook.csv, 모두 제안).
   아빠는 젊은 시절 돌쇠 할배에게 돌을 배웠고, 성황당은 평범한 돌무더기로만 알았다. 서리다래 쪽은 없다 (아빠 단서) */
defineNotes('dolneomeo',[
  /* ---------- 동물 ---------- */
  {id:'kkubeogi',kind:'animal',lines:[
    {who:'me',when:'kkubeogi:sleep',text:'늘 존다. 졸 때 말을 걸면 잠꼬대만 한다.'},
    {who:'me',when:'kkubeogi:awake',text:'꾸벅꾸벅 졸다가 고개를 드는 잠깐에만 말이 통한다.'},
    {who:'me',when:'kkubeogi:eoksae',text:'겨울잠 둥지에 쓸 마른 억새를 좋아한다.'}]},
  {id:'dolsoe',kind:'animal',lines:[
    {who:'dad',text:'돌너머 석수 두더지. "돌이 마음을 알아야 돈다." 할배한테 배운 말.'},
    {who:'me',when:'met:dolsoe',text:'눈이 침침해져서 이제 돌을 손끝으로만 읽는다.'},
    {who:'me',when:'dolsoe:tea',text:'결명자 차를 드리면 눈이 밝아진다며 마음을 연다.'},
    {who:'me',when:'dolsoe:stack',text:'돌탑은 흔들릴 때 말고, 꼭대기가 가운데 설 때 얹는다.'}]},
  {id:'ppuri',kind:'animal',lines:[
    {who:'dad',text:'돌산 장승지기 산양. 원칙대로다. 장승제를 안 올리면 누구도 못 지나간다.'},
    {who:'me',when:'met:ppuri',text:'장승제에는 메밀전을 부친다. 메밀가루가 있어야 한다.'},
    {who:'me',when:'ppuri:seogi',text:'의리를 보이면 아무한테나 안 알려 주는 자리를 알려 준다.'}]},
  {id:'golem',kind:'animal',name:'성황당 돌무더기',lines:[
    {who:'dad',text:'돌산 어귀 성황당. 지날 때 돌 하나 얹고 소원을 빈다.'},
    {who:'me',when:'fight:golem',text:'돌무더기가 깨어나 일어섰다. 머리가 높아 처음엔 손이 닿지 않는다.'},
    {who:'me',when:'core:golem',text:'다리나 팔을 하나 무너뜨리면 휘청이며 머리가 내려온다.'},
    {who:'me',when:'like:golem:story_stone',text:'아빠가 못 올린 소원 돌을 건네자 조용해졌다.'},
    {who:'me',when:'like:golem:seogi',text:'백 년 바위의 석이버섯도 반긴다.'},
    {who:'me',when:'calm:golem',text:'달래면 다시 성황당으로 내려앉는다.'}]},
  /* ---------- 물건 ---------- */
  {id:'eoksae',kind:'item',lines:[]},
  {id:'memil',kind:'item',dadDrawing:true,lines:[
    {who:'dad',text:'돌너머 장승제 상에는 꼭 메밀전이 오른다.'}]},
  {id:'gyeousari',kind:'item',lines:[]},
  {id:'gyeolmyeongja',kind:'item',dadDrawing:true,lines:[
    {who:'dad',text:'눈이 침침한 어른께 차로 달여 드리면 좋다.'}]},
  {id:'seogi',kind:'item',dadDrawing:true,lines:[
    {who:'dad',text:'아는 이가 아니면 자리를 못 찾는다. 장승지기라면 알지도.'}]},
  {id:'seoridarae',kind:'item',lines:[]},
]);
