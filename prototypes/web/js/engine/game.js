'use strict';
/* 시작 화면, 끝 화면, 게임 루프, 부팅. 화면 글은 지역의 cover 에서 읽는다 */
function fillCover(){
  const C=REG.cover;
  $('regionTag').textContent=C.tag;$('regionSub').textContent=C.sub;
  cv.setAttribute('aria-label',REG.name+' 게임 화면');
  $('titleKicker').textContent=C.title.kicker;$('titleHead').textContent=C.title.head;
  const tb=$('titleBody');tb.innerHTML='';C.title.body.forEach(t=>tb.appendChild(el('p',null,t)));
  $('btnStart').textContent=C.title.start;
  $('endKicker').textContent=C.end.kicker;$('endHead').textContent=C.end.head;
  const eb=$('endBody');eb.innerHTML='';C.end.body.forEach(t=>eb.appendChild(el('p',null,t)));
}
function startGame(){
  G.started=true;$('titleScreen').hidden=true;
  REG.onStart();
  lastGoal='';refreshHud();
}
/* 지역을 끝낼 때 지역 코드가 부른다 */
function endGame(){
  G.ended=true;
  $('endStats').innerHTML=REG.endStats().map(([k,v])=>'<span>'+k+' <b>'+v+'</b></span>').join('');
  $('endScreen').hidden=false;refreshGoal();
}
$('btnStart').onclick=startGame;
$('btnRestart').onclick=()=>{G=newGame();$('endScreen').hidden=true;closePanels();$('titleScreen').hidden=false;lastGoal='';lastTool='';refreshHud();};
$('btnBookEnd').onclick=()=>{bookTab='clues';renderBook();$('book').hidden=false;$('endScreen').hidden=true;
  $('bookClose').addEventListener('click',()=>{if(G.ended)$('endScreen').hidden=false;},{once:true});};

let last=0,acc=0;
function loop(t){
  if(!last)last=t;acc+=Math.min(100,t-last);last=t;
  while(acc>=1000/60){step();bStep();acc-=1000/60;}
  if(B&&!$('battle').hidden)bDraw();else draw();requestAnimationFrame(loop);
}
/* 주소 뒤 ?region=<id> 로 지역을 고를 수 있다 (없으면 첫 지역) */
function pickRegion(data){
  const q=new URLSearchParams(location.search).get('region');
  const id=(data&&data.G&&data.G.region)||q;
  return REGIONS[id]||Object.values(REGIONS).sort((a,b)=>a.order-b.order)[0];
}
function boot(data){
  REG=pickRegion(data);
  fillCover();
  G=(data&&data.G)?data.G:newGame();
  if(G.started)$('titleScreen').hidden=true;
  if(G.ended)$('endScreen').hidden=false;
  refreshHud();requestAnimationFrame(loop);
}
window.claude?.hot?.snapshot?.(()=>{const g=JSON.parse(JSON.stringify(G));pouch.items.forEach(id=>{g.inv[id]=(g.inv[id]||0)+1;});return {G:g};});
window.claude?.hot?.ready?window.claude.hot.ready(boot):boot(window.claude?.hot?.data??{});
