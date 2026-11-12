'use strict';
/* 호감도(정)와 정표 재료.
   결정 D-1463 (사용자 지시 2026-11-12 "조합법 재료에 일정 호감도를 올려야 얻을 수 있는 재료 카테고리가 필요하다.
   호감도 표시는 너무 눈에 크게 띄지 않게, 그치만 확실하게. 맥스 3개, npc 에 따라 모양을 다르게 (다람쥐 계열은 도토리)"):
   - 정은 그 인물이 좋아하는 것을 건넨 일(좋아함 bond_liked · 아주 좋아함 bond_loved)과 부탁을 들어준 일(bond_errand, 한 번)로 오른다.
     따로 저장하지 않고 이미 남는 기록(like:<인물>:<물건>, 장부·떠돌이·진행값)에서 센다. 옛 저장도 그대로 이어진다.
   - 칸은 셋. bond_need_one·two·three 점에서 한 칸씩 찬다. 표식 모양은 인물 계열마다 다르다 (bonds.csv 표식).
   - 보이는 곳: 대화창 이름 꼬리표 옆, 필드 이름표 옆(만난 인물만), 수첩 장부 장.
   결정 D-1464: 두 칸이 차면 그 인물이 정표 재료 하나와 그것으로 만드는 조합법을 일러 주고, 세 칸이면 정표 재료를 하나 더 준다.
   정표 재료는 정으로만 얻는다. 그 인물과 나눈 대화가 끝난 뒤 잠깐 조용할 때 잇는다 (선물 답례 giftLesson 이 먼저다). */
const BOND_MARK_NAMES={acorn:'도토리',coin:'엽전',leaf:'잎사귀',drop:'물방울',fish:'물고기',paw:'발자국',stone:'돌',horn:'뿔',bur:'밤송이',grain:'낟알',shell:'등딱지',tail:'꼬리',moon:'반달',feather:'깃털',hoof:'발굽'};
const BOND_MARK_ART={
  acorn:['..ooo..','.ooooo.','.#####.','.##+##.','.#####.','..###..','...#...'],
  coin:['..###..','.##+##.','###.###','##...##','###.###','.#####.','..###..'],
  leaf:['....##.','...###.','..#+##.','.###...','.##....','o#.....','o......'],
  drop:['...#...','..###..','..#+#..','.##+##.','.#####.','.#####.','..###..'],
  fish:['.......','.###..#','#+###.#','######.','#####.#','.###..#','.......'],
  paw:['.#.#.#.','.#.#.#.','.......','..###..','.##+##.','.#####.','..###..'],
  stone:['.......','..###..','.#+###.','#######','#######','.#####.','.......'],
  horn:['#......','##.....','.#+....','..##...','..###..','...###.','....##.'],
  bur:['#..#..#','.#####.','.#+###.','#######','.#####.','.#####.','#..#..#'],
  grain:['...#...','..###..','..#+#..','.#####.','..###..','..###..','...#...'],
  shell:['.......','.#####.','##o#o##','#o#+#o#','##o#o##','.#####.','.......'],
  tail:['.....##','....###','...#+#.','..###..','.###...','###o...','oo.....'],
  moon:['..###..','.##+...','##.....','##.....','##.....','.##....','..###..'],
  feather:['.....##','....#+#','...###.','..###..','.o##...','o.#....','o......'],
  hoof:['.......','.##.##.','.#+.#+.','.##.##.','.##.##.','..#.#..','.......'],
};
const BOND_MARK_COLOR={acorn:['#b8763a','#5a3a1e'],coin:['#d8b24a','#8a6a1e'],leaf:['#6aa84f','#3f6b2a'],drop:['#6fb3d6','#2f6f96'],fish:['#7fa6c4','#3f6684'],
  paw:['#a8845e','#5a3e26'],stone:['#a3a39b','#5a5a52'],horn:['#e0d0a8','#8a7a52'],bur:['#9a7a3a','#5a4a1e'],grain:['#e2c46e','#9a7a2a'],
  shell:['#7a9a5e','#3f5a32'],tail:['#e08a3a','#fff2dc'],moon:['#f2e6b0','#b8a870'],feather:['#c4ab84','#6a5232'],hoof:['#8a6a48','#4a3420']};
const bondTable=()=>TABLES.BONDS||{};
function bondIdOf(id){if(!id)return null;const B=bondTable();if(B[id])return id;const s=String(id).replace(/^j_/,'');return B[s]?s:null;}
function bondIdByName(name){if(!name)return null;for(const [id,b] of Object.entries(bondTable()))if(b.name===name)return id;return null;}
function bondErrandDone(c){
  const i=c.indexOf(':'),k=c.slice(0,i),v=c.slice(i+1);
  if(k==='ledger')return !!G.ledger?.[v]?.done;
  if(k==='wander')return !!G.f?.wanderersDone?.[v];
  if(k==='flag')return !!G.f?.[v];
  if(k==='learn')return knows(v);
  return false;
}
function bondPoints(id){
  const b=bondTable()[id];if(!b||!G)return 0;const T=TABLES.TUNING;let p=0;
  for(const [item,t] of Object.entries(TABLES.TASTES[id]||{}))
    if(knows('like:'+id+':'+item))p+=t.kind==='아주 좋아함'?T.bond_loved:t.kind==='좋아함'?T.bond_liked:0;
  if(b.errand.some(bondErrandDone))p+=T.bond_errand;
  return p;
}
function bondLevel(id){const p=bondPoints(id),T=TABLES.TUNING;return p>=T.bond_need_three?3:p>=T.bond_need_two?2:p>=T.bond_need_one?1:0;}
/* 표식 셋을 한 줄로 그린 그림 (찬 칸은 제 색, 빈 칸은 옅은 테두리 빛). 그림 주소는 모양·칸마다 한 번만 만든다 */
const bondArtCache=new Map();
function bondMarksCanvas(mark,lv,scale=2){
  const art=BOND_MARK_ART[mark]||BOND_MARK_ART.acorn,[body,dark]=BOND_MARK_COLOR[mark]||BOND_MARK_COLOR.acorn;
  const c=document.createElement('canvas');c.width=(7*3+2*2)*scale;c.height=7*scale;const x=c.getContext('2d');
  for(let i=0;i<3;i++){const full=i<lv,ox=i*9*scale;
    art.forEach((row,y)=>[...row].forEach((ch,xx)=>{if(ch==='.')return;
      x.fillStyle=full?(ch==='o'?dark:ch==='+'?'rgba(255,255,255,.75)':body):'rgba(150,128,104,.5)';
      x.fillRect(ox+xx*scale,y*scale,scale,scale);}));}
  return c;
}
function bondMarksUrl(mark,lv){const k=mark+lv;if(!bondArtCache.has(k))bondArtCache.set(k,bondMarksCanvas(mark,lv).toDataURL());return bondArtCache.get(k);}
function bondTitle(id){const b=bondTable()[id],lv=bondLevel(id);
  return jo(b.name,'과','와')+'의 정 '+lv+'/3 ('+BOND_MARK_NAMES[b.mark]+')'+(lv<2?' · 두 칸이 차면 정표 재료를 나눠 준다':lv<3?' · 세 칸이 차면 정표 재료를 하나 더 준다':' · 정이 가득 찼다');}
function bondMarksEl(id){
  const b=bondTable()[id];if(!b)return null;const lv=bondLevel(id),s=el('span','bond-marks');
  s.style.backgroundImage='url('+bondMarksUrl(b.mark,lv)+')';s.dataset.lv=lv;s.setAttribute('role','img');s.setAttribute('aria-label',bondTitle(id));s.title=bondTitle(id);
  return s;
}
/* 대화창 이름 꼬리표: 이름 글자(textContent)는 그대로 두고 ::after 그림으로 붙인다 (선물·답례가 이름 글자를 읽는다) */
function bondDecorateWho(){
  const w=$('dlgWho');if(!w)return;const id=G&&G.started?bondIdByName(w.textContent):null;
  if(!id){if(w.dataset.bond){delete w.dataset.bond;w.style.removeProperty('--bond');w.removeAttribute('title');}return;}
  const b=bondTable()[id],lv=bondLevel(id);
  w.dataset.bond=String(lv);w.style.setProperty('--bond','url('+bondMarksUrl(b.mark,lv)+')');w.title=bondTitle(id);
}
/* 필드 이름표 (field.js updateNpcTags): 이름을 아는 인물만 표식을 붙인다 */
function bondDecorateTag(e,n,known){
  const id=known?bondIdOf(n.id):null;let s=e.querySelector('.bond-marks');
  if(!id){if(s)s.remove();return;}
  const lv=bondLevel(id);if(s&&s.dataset.lv===String(lv))return;
  if(s)s.remove();e.appendChild(bondMarksEl(id));
}
/* 칸이 찬 순간 짧게 알린다 (같은 칸은 한 번). 게임을 시작하거나 불러온 때 이미 찬 칸은 조용히 맞춰 둔다 */
let bondSeenFor=null;
function bondNotice(){
  if(!G||!G.started)return;const seen=G.f.bondSeen||(G.f.bondSeen={});
  if(bondSeenFor!==G){bondSeenFor=G;for(const id of Object.keys(bondTable()))if(seen[id]===undefined)seen[id]=bondLevel(id);return;}
  for(const id of Object.keys(bondTable())){const lv=bondLevel(id);if(lv>(seen[id]||0)){const up=lv-(seen[id]||0);seen[id]=lv;toast(jo(bondTable()[id].name,'과','와')+' 정이 '+['','한','두','세'][up]+' 칸 깊어졌다 ('+lv+'/3)');}}
}
/* 방금 대화한 인물: 같은 지역에서 bond_heard_ms 안에 말을 나눈 인물에게만 정표 장면을 잇는다.
   대화 끝에 지도로 떠나거나 싸움이 열려 오래 멈춘 뒤, 다른 마을에서 그 인물의 장면이 뜨지 않게 한다 */
const bondHeard=new Map();
new MutationObserver(()=>{const id=G&&G.started?bondIdByName($('dlgWho').textContent):null;if(id)bondHeard.set(id,{region:G.region,at:performance.now()});bondDecorateWho();})
  .observe($('dlgWho'),{childList:true,characterData:true,subtree:true});
/* 받을 정표: 두 칸 몫을 먼저, 세 칸 몫은 그다음 */
function bondPending(id){const lv=bondLevel(id),got=G.f.bondGot?.[id]||0;return lv>=2&&got<2?2:lv>=3&&got<3?3:0;}
function bondScene(id,lv){
  const b=bondTable()[id];
  return (lv===2?b.two:b.three).map(([k,t])=>{
    if(k==='give')return receiveItem(b.item,1);
    if(k==='kid')return ['너구리',t];
    const L=[b.name,t];if(k==='hint')L.hint='hint:'+b.out;return L;
  });
}
function bondGive(id,lv){
  const b=bondTable()[id];(G.f.bondGot||(G.f.bondGot={}))[id]=lv;   // 물건은 receiveItem 이 곧바로 넣는다. 대화가 중간에 닫혀도 두 번 주지 않는다
  talk(bondScene(id,lv),()=>{
    if(lv===2&&!knows('hint:'+b.out)){const R=G.f.recipeFrom||(G.f.recipeFrom={});if(!R[b.out])R[b.out]=b.name;learn('hint:'+b.out,true);}
  });
}
let bondIdle=0;
setInterval(()=>{
  if(!G||!G.started||G.ended)return;
  bondNotice();
  if(paused()||G.f.giftLessonQ?.length){bondIdle=0;return;}
  if(!bondHeard.size)return;
  if(++bondIdle<3)return;bondIdle=0;
  for(const [id,h] of [...bondHeard]){const lv=bondPending(id);
    if(!lv||h.region!==G.region||performance.now()-h.at>TABLES.TUNING.bond_heard_ms){bondHeard.delete(id);continue;}
    bondGive(id,lv);return;}
},250);
/* 선물을 건네면 꼬리표 표식을 곧바로 고친다 (craft.js giftTaste 를 감싼다) */
{const base=giftTaste;giftTaste=function(who,item){const r=base(who,item);if(r&&r.given){setTimeout(()=>{bondDecorateWho();bondNotice();},0);}return r;};}

/* 정표 재료와 정표 음식 그림 (16×16) */
(()=>{
  const bowl=(P,c)=>{P(2,8,12,2,'#684b37');P(3,10,10,3,'#a77b52');P(5,13,6,1,'#684b37');P(4,6,8,3,c);};
  const bottle=(P,c)=>{P(6,2,4,2,'#684b37');P(5,4,6,9,c);P(6,7,4,3,'#f4e3bb');};
  const dots=(P,list,c)=>list.forEach(([x,y])=>P(x,y,1,1,c));
  defineIcons({
    gotgan_dotori:P=>{P(6,1,4,2,'#4a2e1a');P(4,3,8,2,'#6b4423');P(3,5,10,2,'#8a5a2b');P(4,7,8,6,'#b8763a');P(5,13,6,1,'#9a5f2c');P(5,8,2,3,'#e2b07a');},
    jocheong:P=>{P(3,9,10,4,'#7a5636');P(4,8,8,2,'#c9832e');P(5,8,3,1,'#f0c070');P(4,13,8,1,'#5a3d26');},
    bokkeun_kong:P=>{for(const [x,y] of [[3,8],[7,6],[10,9],[5,11],[9,12]]){P(x,y,3,3,'#a8743a');P(x,y,1,1,'#d8a868');}},
    gamcho:P=>{P(2,6,12,3,'#c9a36a');P(3,9,10,2,'#a8843e');P(4,7,3,1,'#f0d890');P(9,7,3,1,'#f0d890');P(2,6,1,3,'#8a6a32');P(13,6,1,3,'#8a6a32');},
    pirami:P=>{P(3,7,8,3,'#a8b0a0');P(11,6,2,5,'#8a9080');P(4,8,1,1,'#2b2b2b');P(5,10,6,1,'#7a8070');P(5,7,5,1,'#c8d0c0');},
    pyogo:P=>{P(3,4,10,4,'#6b4a2a');P(4,3,8,1,'#8a6a42');P(5,5,2,1,'#c9a87a');P(9,6,2,1,'#c9a87a');P(7,8,2,5,'#e6d6b8');},
    dolbae:P=>{P(7,2,1,2,'#5a3d26');P(5,4,6,3,'#c9a86a');P(4,7,8,5,'#b8944e');P(5,12,6,1,'#8a6a32');P(6,8,2,2,'#e8d090');},
    deodeok:P=>{P(7,1,2,3,'#5f8a3a');P(6,4,4,3,'#d8c8a8');P(5,7,5,3,'#c8b890');P(6,10,3,3,'#b8a880');P(7,13,1,2,'#a89870');},
    sansa:P=>{for(const [x,y] of [[3,6],[8,5],[6,9]]){P(x,y,4,4,'#c0392b');P(x+1,y,2,1,'#e0604a');P(x+1,y+1,1,1,'#f2a090');}P(7,3,1,2,'#5f8a3a');},
    deulkkae:P=>{bowl(P,'#5a4a3a');dots(P,[[5,7],[8,6],[10,7],[6,8]],'#8a7a62');},
    minari:P=>{P(5,3,2,10,'#5f9a3c');P(8,2,2,11,'#4f8a35');P(4,2,3,2,'#7fb069');P(8,1,3,2,'#7fb069');P(4,12,8,2,'#e6e0d0');},
    gaengyeot:P=>{P(3,6,10,6,'#7a3f1a');P(4,5,8,1,'#9a5a2a');P(5,7,3,1,'#c9803a');P(3,12,10,1,'#5a2a10');},
    chapssal:P=>{bowl(P,'#fbf8ee');dots(P,[[5,6],[8,7],[10,6]],'#d8d0c0');},
    omija:P=>{for(const [x,y] of [[4,6],[7,5],[10,7],[6,9],[9,10]]){P(x,y,3,3,'#b8302a');P(x,y,1,1,'#e86a5a');}},
    jayeom:P=>{bowl(P,'#e6e2d6');dots(P,[[5,7],[9,6],[7,8]],'#b8b0a0');},
    susu:P=>{P(7,10,2,5,'#a8843e');P(5,3,6,7,'#a8402a');dots(P,[[6,4],[9,5],[7,7],[5,8]],'#d86a50');},
    hodu:P=>{P(4,4,8,8,'#a87a4a');P(5,3,6,1,'#c9965a');P(7,4,1,8,'#7a5230');P(5,6,2,1,'#7a5230');P(9,8,2,1,'#7a5230');},
    saeu:P=>{P(4,5,6,2,'#e8907a');P(9,6,3,3,'#e8907a');P(8,9,3,2,'#d87a64');P(5,7,2,1,'#f2b8a8');P(3,4,2,1,'#c86a54');},
    eon_darae:P=>{P(4,4,8,8,'#8aa86a');P(5,3,6,1,'#a8c48a');P(5,5,2,2,'#e8f2fa');P(9,9,2,1,'#e8f2fa');P(7,2,1,2,'#6b4a2a');},
    yeongeun:P=>{P(3,4,10,8,'#e8d8c0');P(4,3,8,1,'#f2e6d4');for(const [x,y] of [[5,6],[9,6],[7,9]])P(x,y,2,2,'#b8a888');},
    siraegi:P=>{P(7,1,2,4,'#8a7a4a');P(4,5,8,8,'#7a8a4a');P(5,6,2,6,'#5a6a32');P(9,6,2,6,'#5a6a32');},
    aldotori_muk:P=>{P(3,7,10,6,'#7a5638');P(3,6,10,1,'#9a7650');P(4,8,2,1,'#b8946a');P(3,13,10,1,'#5a3e26');},
    dotori_dasik:P=>{for(const [x,y] of [[2,5],[8,8]]){P(x,y,6,5,'#9a6a3a');P(x+1,y+1,4,3,'#b8864e');P(x+2,y+2,2,1,'#7a4a24');}},
    misutgaru:P=>{bowl(P,'#d8c08a');dots(P,[[6,6],[9,7]],'#b89a62');},
    gamcho_hwan:P=>{bowl(P,'#d8c7a0');dots(P,[[5,6],[8,5],[10,7],[6,8],[9,8]],'#8a6a32');},
    pirami_jjim:P=>{bowl(P,'#c9a36a');P(5,5,5,2,'#a8b0a0');P(10,5,1,2,'#8a9080');},
    pyogo_bap:P=>{bowl(P,'#f4f0e4');P(6,4,4,2,'#6b4a2a');P(7,6,2,1,'#c9a87a');},
    dolbae_cheong:P=>{bottle(P,'#c9a86a');P(7,10,2,2,'#e8d090');},
    deodeok_muchim:P=>{P(2,10,12,2,'#e8e0d0');P(3,12,10,1,'#b8b0a0');P(4,7,8,3,'#c8b890');P(5,8,2,1,'#a8402a');P(9,7,2,1,'#a8402a');},
    sansa_pyeon:P=>{for(const [x,y] of [[3,5],[8,7]]){P(x,y,5,5,'#b83a2a');P(x,y,5,1,'#d86050');}},
    deulkkae_juk:P=>{bowl(P,'#d8ccb0');dots(P,[[5,7],[8,6],[10,7]],'#5a4a3a');},
    minari_jeup:P=>{bowl(P,'#6aa84f');P(6,6,3,1,'#9ad07a');},
    kkae_yeot:P=>{for(const x of [3,7,11]){P(x,3,2,11,'#c9803a');P(x,3,1,11,'#e0a050');dots(P,[[x,5],[x+1,8],[x,11]],'#f4e3bb');}},
    kkul_chaltteok:P=>{for(const [x,y] of [[3,7],[8,6]]){P(x,y,5,5,'#f6f0e0');P(x,y,5,1,'#e8b84a');}},
    omija_cheong:P=>{bottle(P,'#b8302a');P(7,10,2,2,'#e86a5a');},
    sundubu:P=>{bowl(P,'#f6f2e6');P(5,5,3,2,'#fffdf6');P(9,6,2,2,'#fffdf6');},
    susu_pattteok:P=>{for(const [x,y] of [[3,7],[7,5],[10,8]]){P(x,y,4,4,'#8a3a2a');P(x,y,4,1,'#6a4a32');P(x+1,y+1,1,1,'#b85a40');}},
    hodu_gangjeong:P=>{for(const [x,y] of [[3,6],[8,7]]){P(x,y,5,5,'#8a5a2a');P(x+1,y+1,2,2,'#c9965a');P(x,y,5,1,'#e8b84a');}},
    saeu_juk:P=>{bowl(P,'#efe2c8');dots(P,[[5,6],[9,7],[7,5]],'#e8907a');},
    darae_hwachae:P=>{bowl(P,'#a8c48a');P(5,6,2,2,'#e8f2fa');P(9,7,2,1,'#ffffff');P(7,5,1,1,'#6b8a4a');},
    yeongeun_jeonggwa:P=>{for(const [x,y] of [[2,6],[8,7]]){P(x,y,6,5,'#d8a85a');P(x+1,y+1,1,1,'#f2d8a0');P(x+3,y+2,1,1,'#f2d8a0');P(x+2,y+3,1,1,'#f2d8a0');}},
    siraegi_bap:P=>{bowl(P,'#f4f0e4');P(5,5,6,2,'#6a7a3a');P(6,4,2,1,'#8a9a5a');},
  });
})();
