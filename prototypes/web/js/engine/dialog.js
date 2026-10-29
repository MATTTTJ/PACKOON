'use strict';
/* 대화: talk([[말하는이, 대사, 선택지?], ...], 끝나면). 선택지는 [{t:글, go:고르면 할 일}] */
let dlgQ=[],dlgEnd=null,dlgMusic=null;
// 세 번째 인자는 지역의 전용 이야기 장면용이다. 기존 호출·선택지·종료 순서는 유지한다.
function talk(lines,onEnd,options={}){
  dlgMusic=options.music||(lines.some(l=>l[0]==='아빠')?'father':lines.length>1&&lines.some(l=>l[0]==='날쌘')?'nalsaen':null);
  dlgQ=lines.slice();dlgEnd=onEnd||null;showLine();
}
function showLine(){
  const L=dlgQ.shift();
  if(!L){$('dlg').hidden=true;dlgMusic=null;const f=dlgEnd;dlgEnd=null;if(f)f();return;}
  $('dlg').hidden=false;$('dlgWho').textContent=L[0];$('dlgText').textContent=L[1];
  const face=$('dlgFace');face.innerHTML='';face.appendChild(portrait(L[0]));
  const ch=$('dlgChoices');ch.innerHTML='';
  if(L[2]){
    $('dlgNext').hidden=true;
    L[2].forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.textContent=c.t;
      b.onclick=e=>{e.stopPropagation();Sound.paper();$('dlg').hidden=true;dlgQ=[];dlgEnd=null;dlgMusic=null;if(c.go)c.go();};ch.appendChild(b);});
    setTimeout(()=>{const f=ch.querySelector('button');if(f&&matchMedia('(pointer:fine)').matches)f.focus();},0);
  }else $('dlgNext').hidden=false;
}
function advance(){if($('dlgChoices').children.length)return;Sound.paper();showLine();}
$('dlg').addEventListener('click',e=>{if(e.target.tagName!=='BUTTON')advance();});

/* 지역의 NPC: {id, name, x, talk(), draw(x,y,방향), props(npc)?, prompt?(말 걸기 대신 쓸 안내 글, 예: 숙소 마루에서 쉬기)} */
function nearNpc(){let best=null,bd=TABLES.TUNING.field_talk_distance;for(const n of fieldNpcs()){const d=Math.abs(n.x-G.px);if(d<bd){bd=d;best=n;}}return best;}
function tryTalk(){tryInteract();}

/* 대화 초상: 캐릭터 그리기 함수를 작은 캔버스에 재사용. 이름이 NPC와 맞지 않으면 주인공 */
function portrait(name){
  const c=document.createElement('canvas');c.width=30;c.height=24;
  const save=ctx;ctx=c.getContext('2d');
  const n=[...fieldNpcs(),...zoneObjects('wanderers')].find(n=>n.name===name);
  if(n)n.draw(15,30,1);else drawRaccoonAt(16,31,1,0,0,heldTool());
  ctx=save;return c;
}
