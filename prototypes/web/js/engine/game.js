'use strict';
/* 시작 화면, 끝 화면, 게임 루프, 부팅. 화면 글은 지역의 cover 에서 읽는다 */
function fillCover(){
  const C=REG.cover;
  $('regionTag').textContent=C.tag;$('regionSub').textContent=C.sub;
  cv.setAttribute('aria-label',REG.name+' 게임 화면');
  $('titleKicker').textContent=C.title.kicker;$('titleHead').textContent=C.title.head;
  const tb=$('titleBody');tb.innerHTML='';C.title.body.forEach(t=>tb.appendChild(el('p',null,t)));
  $('btnStart').textContent=C.title.start;
  /* 개발용: 지역마다 버튼. 누르면 그 지역부터 새로 시작하고 주소에도 남겨 새로고침해도 그 지역에서 시작한다 */
  const dp=$('devPick');dp.innerHTML='';
  regionList().forEach(r=>{const b=el('button',null,r.order+' '+r.name);b.type='button';b.setAttribute('aria-pressed',r===REG);
    b.onclick=()=>{G=newGame(r.id);resetScreens();
      try{const u=new URL(location.href);u.searchParams.set('region',r.id);history.replaceState(null,'',u);}catch(_){}};
    dp.appendChild(b);});
  $('endKicker').textContent=C.end.kicker;$('endHead').textContent=C.end.head;
  const eb=$('endBody');eb.innerHTML='';C.end.body.forEach(t=>eb.appendChild(el('p',null,t)));
}
function startGame(){
  G.started=true;$('titleScreen').hidden=true;
  REG.onStart();
  lastGoal='';refreshHud();
}
/* 지역을 끝낼 때 지역 코드가 부른다. REG.next 가 있으면 다음 지역 버튼이 나온다 */
function endGame(){
  G.ended=true;
  showEnd();refreshGoal();
}
function showEnd(){
  $('endStats').innerHTML=REG.endStats().map(([k,v])=>'<span>'+k+' <b>'+v+'</b></span>').join('');
  const nx=REGIONS[REG.next],b=$('btnNext');
  b.hidden=!nx;if(nx)b.textContent=REGIONS[REG.next].cover.go||nx.name+'로';
  $('btnRestart').className=nx?'btn':'btn primary';
  $('endScreen').hidden=false;
}
/* 화면과 상태를 지금 G 에 맞춘다 */
function resetScreens(){
  REG=REGIONS[G.region];fillCover();closePanels();
  $('endScreen').hidden=true;$('titleScreen').hidden=G.started;
  lastGoal='';lastTool='';lastNear=null;refreshHud();
}
$('btnStart').onclick=startGame;
$('btnRestart').onclick=()=>{G=newGame();resetScreens();
  try{const u=new URL(location.href);u.searchParams.delete('region');history.replaceState(null,'',u);}catch(_){}};
/* 다음 지역으로: 보따리·연장·책·호감은 그대로 가지고 간다 */
$('btnNext').onclick=()=>{if(!REGIONS[REG.next])return;enterRegion(G,REGIONS[REG.next]);resetScreens();};
$('btnBookEnd').onclick=()=>{bookTab='clues';renderBook();$('book').hidden=false;$('endScreen').hidden=true;
  $('bookClose').addEventListener('click',()=>{if(G.ended)$('endScreen').hidden=false;},{once:true});};

let last=0,acc=0;
function loop(t){
  if(!last)last=t;acc+=Math.min(100,t-last);last=t;
  while(acc>=1000/60){step();bStep();acc-=1000/60;}
  if(B&&!$('battle').hidden)bDraw();else draw();requestAnimationFrame(loop);
}
/* 주소 뒤 ?region=<id> 로 그 지역부터 시작할 수 있다 (앞 지역은 마친 것으로 친다). 없으면 첫 지역 */
function boot(data){
  G=(data&&data.G&&REGIONS[data.G.region])?data.G:newGame(new URLSearchParams(location.search).get('region'));
  REG=REGIONS[G.region];
  fillCover();
  if(G.started)$('titleScreen').hidden=true;
  if(G.ended)showEnd();
  refreshHud();requestAnimationFrame(loop);
}
window.claude?.hot?.snapshot?.(()=>{const g=JSON.parse(JSON.stringify(G));pouch.items.forEach(id=>{g.inv[id]=(g.inv[id]||0)+1;});return {G:g};});
window.claude?.hot?.ready?window.claude.hot.ready(boot):boot(window.claude?.hot?.data??{});
