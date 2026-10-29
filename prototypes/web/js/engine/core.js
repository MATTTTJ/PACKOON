'use strict';
/* 공통 기본: 화면 크기, 짧은 도우미, 아이템·지역 등록소, 게임 상태와 상태를 바꾸는 함수.
   모든 js 파일은 일반 <script>로 차례대로 읽힌다. 맨 위에 선언한 const/let/function은 파일끼리 공유된다.
   지역 파일은 (()=>{ ... })() 안에 넣어 이름이 다른 지역과 부딪히지 않게 하고, 아래 define* 함수로만 내보낸다. */

const W=400,H=225,GROUND=192;
const cv=document.getElementById('cv');let ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function hash(n){const s=Math.sin(n*127.1)*43758.5453;return s-Math.floor(s);}
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
/* 받침 있는 글자 뒤에는 b, 없으면 a를 붙인다 (을/를, 이/가) */
function jo(w,a,b){const c=w.charCodeAt(w.length-1);if(c<0xAC00||c>0xD7A3)return w+a;return w+(((c-0xAC00)%28)?a:b);}
const TOUCH=matchMedia('(pointer:coarse)').matches;
const HITKEY=TOUCH?'치기 버튼':'J 키';

/* ---------- 등록소 ---------- */
/* 아이템: id는 design/data/items.csv 의 id와 같다.
   {n:이름, r:레어도 단계(0부터), d:설명(수첩에 내가 적는 글), eat:먹으면 오르는 체력(선택)} */
const ITEMS={};
function defineItems(map){Object.assign(ITEMS,map);}
/* 손에 드는 연장 {n:이름, d:설명} */
const TOOLS={};
function defineTools(map){Object.assign(TOOLS,map);}
/* 16×16 아이콘 그림. ICON_ART[id]=P=>{P(x,y,w,h,색);...} */
const ICON_ART={};
function defineIcons(map){Object.assign(ICON_ART,map);}
/* 채집 미니게임 설정 (아이템 id별) */
const GATHER={};
function defineGather(map){Object.assign(GATHER,map);}
/* 전투 상대: id는 design/data/bosses.csv 의 id와 같다 */
const ENEMIES={};
function defineEnemies(map){Object.assign(ENEMIES,map);}
/* 지역: id는 design/data/regions.csv 의 id와 같다. 지역 파일이 이 객체에 필요한 것을 채운다 (README 참고) */
const REGIONS={};
function defineRegion(id,obj){REGIONS[id]=Object.assign(REGIONS[id]||{id},obj);return REGIONS[id];}

const RAR=['흔함','보통','귀함','희귀','전설'];
const RCOL=['#9c8f78','#5f8a3a','#3f84b5','#8e4fc2','#d29a12'];

/* ---------- 상태 ---------- */
let REG=null;   // 지금 지역
let G;          // 게임 상태 (저장·복원되는 것은 여기에만 둔다)
const regionList=()=>Object.values(REGIONS).sort((a,b)=>a.order-b.order);
/* 지금 지역까지 지나온 지역들. 아빠 단서 개수는 이 지역들을 모두 더해 센다 */
const regionsSoFar=()=>regionList().filter(r=>r.order<=REG.order);
const clueTotalSoFar=()=>regionsSoFar().reduce((s,r)=>s+r.clueTotal,0);
function npcName(id){for(const r of regionList()){const n=(r.npcs||[]).find(n=>n.id===id);if(n)return n.name;}return id;}

/* 지역에 상관없이 이어지는 상태 */
function baseState(){return{
  started:false,ended:false,region:null,
  runId:Date.now().toString(36)+Math.floor(Math.random()*1e6).toString(36),   // 게임 하나를 가리키는 번호 (저장 덮어쓰기 확인용)
  px:0,py:GROUND,vx:0,vy:0,face:1,onGround:true,anim:0,
  hp:5,maxhp:5,attackT:0,hurtT:0,cam:0,
  inv:{},tool:'pick',sharp:false,
  awake:Object.keys(HEIR).filter(k=>HEIR[k].awakeAtStart),   // 깨어난 가보
  clues:[],diary:[],learned:[],ledger:{},rel:{},f:{faints:0},   // learned: 수첩에 적힌 것 (notebook.js)
};}
/* 지역에 들어간다. 지역의 newState() 가운데 inv 는 보따리에 더하고, rel 은 처음 만나는 NPC만 넣고,
   f(진행 표시)는 합친다. 나머지(필드에 놓인 것)는 새 지역 것으로 바꾼다 */
function enterRegion(g,r){
  const ns=r.newState();
  for(const k in ns){
    if(k==='inv'){for(const i in ns.inv)g.inv[i]=(g.inv[i]||0)+ns.inv[i];}
    else if(k==='rel'){for(const i in ns.rel)if(!g.rel[i])g.rel[i]=ns.rel[i];}
    else if(k==='f')Object.assign(g.f,ns.f);
    else g[k]=ns[k];
  }
  return Object.assign(g,{region:r.id,started:false,ended:false,hp:g.maxhp,px:r.startX,py:GROUND,vx:0,vy:0,face:1,onGround:true,attackT:0,hurtT:0,cam:0});
}
/* 새 게임. id 지역부터 시작하면 앞 지역들은 그 지역의 finish(g)로 마친 것으로 친다 (확인용 바로가기) */
function newGame(id){
  const list=regionList(),target=REGIONS[id]||list[0];
  const g=baseState();
  for(const r of list){if(r.order>=target.order)break;enterRegion(g,r);if(r.finish)r.finish(g);}
  return enterRegion(g,target);
}
const heldTool=()=>G.tool;

function has(id,n){return (G.inv[id]||0)>=(n||1);}
function addItem(id,n){
  G.inv[id]=(G.inv[id]||0)+n;
  if(learn('got:'+id,true)&&NOTES[id])toast('수첩에 붓으로 그렸다 · '+ITEMS[id].n);
  else toast('+ '+ITEMS[id].n+(n>1?' ×'+n:''));
  refreshHud();
}
function takeItem(id,n){G.inv[id]=(G.inv[id]||0)-n;if(G.inv[id]<=0)delete G.inv[id];refreshHud();}
function diary(id,text){if(G.diary.some(d=>d.id===id))return;G.diary.push({id,text});}
function clue(id,who,text){if(G.clues.some(c=>c.id===id))return;G.clues.push({id,who,text});setTimeout(()=>toast('아빠 단서를 찾았다 ('+G.clues.length+'/'+clueTotalSoFar()+')'),900);}
function ledger(id,npc,want,give){if(!G.ledger[id])G.ledger[id]={npc,want,give,done:false};}
function ledgerDone(id){if(G.ledger[id])G.ledger[id].done=true;}
function rel(id,d){G.rel[id].v+=d;}

let toastT=0;
function toast(msg){const t=$('toast');t.textContent=msg;t.hidden=false;toastT=150;}
