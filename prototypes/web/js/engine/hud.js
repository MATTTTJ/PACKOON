'use strict';
/* HUD: 체력, 손에 든 연장, 지금 할 일 (REG.goal() 이 글을 준다) */
let lastGoal='';
function refreshGoal(){
  const g=REG.goal();if(g===lastGoal)return;lastGoal=g;
  const e=$('goal');e.hidden=!g;e.innerHTML='<b>할 일</b>';e.appendChild(document.createTextNode(g));
  $('goalM').querySelector('span').textContent=g||REG.cover.ready;
}
let lastTool='';
function refreshHud(){
  $('hearts').innerHTML=Array.from({length:G.maxhp},(_,i)=>'<span class="'+(i<G.hp?'':'off')+'">♥</span>').join('');
  const t=heldTool();
  if(t+G.sharp!==lastTool){lastTool=t+G.sharp;const e=$('toolLabel');e.innerHTML='';e.appendChild(icon(t));e.appendChild(document.createTextNode(TOOLS[t].n+(G.sharp?' +':'')));}
  if(G)refreshGoal();
  if(typeof B!=='undefined'&&B)renderBHud();
}
