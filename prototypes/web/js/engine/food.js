'use strict';
/* 먹을거리와 기운.
   결정 D-1461 (사용자 지시 2026-11-11 "먹을거리들은 다 먹을 수 있는 기능을 추가하고 종류에 따라 다른 효과 부여.
   효과 중에는 보스 전투 시 능력 강화 조건이 붙어도 좋다"):
   - 먹을거리는 모두 보따리에서 먹을 수 있다. 무엇을 주는지는 design/data/foods.csv (ITEMS[id].eat 체력, ITEMS[id].food 기운).
   - 기운은 다음 보스 싸움 한 판에 쓰인다. 하나만 품고, 다른 것을 먹으면 바뀐다. 이기든 지든 물러나든 그 판이 끝나면 사라진다.
   - 무쇠의 피하기 시험은 보스 싸움이 아니라 기운을 쓰지 않고 남긴다.
   - 진행에 필요한 몫(items.csv 진행보호)은 먹지 못한다. 선물·교환과 같은 셈(progressShortage)이다.
   기운 종류: 든든(guard) 금빛 하트 · 날램(swift) 손 빠르기 · 힘(strong) 깎는 힘 · 밝은 눈(eye) 빈틈 시간 · 다정(kind) 선물 진정 */
const FOOD_BUFFS={
  guard:{n:'든든',what:lv=>'맞아도 '+lv*TABLES.TUNING.food_guard_step+'번은 체력이 줄지 않는다'},
  swift:{n:'날램',what:lv=>'손이 '+foodPct(TABLES.TUNING.food_swift_step*lv)+' 빨라진다'},
  strong:{n:'힘',what:lv=>'부위를 '+foodPct(TABLES.TUNING.food_strong_step*lv)+' 더 깎는다'},
  eye:{n:'밝은 눈',what:lv=>'빈틈이 '+foodPct(TABLES.TUNING.food_eye_step*lv)+' 오래 열려 있다'},
  kind:{n:'다정',what:lv=>'선물로 오르는 진정이 '+foodPct(TABLES.TUNING.food_kind_step*lv)+' 커진다'}
};
function foodPct(x){return Math.round(x*100)+'%';}
function foodBuffName(b){return b?FOOD_BUFFS[b.k].n+' '+b.lv:'';}
function foodBuffText(b){return b?FOOD_BUFFS[b.k].n+' '+b.lv+' · 다음 보스 싸움에서 '+FOOD_BUFFS[b.k].what(b.lv):'';}
function validBuff(b){return !!b&&typeof b==='object'&&Object.hasOwn(FOOD_BUFFS,b.k)&&Number.isInteger(b.lv)&&b.lv>=1&&b.lv<=3;}
/* 먹기 단추의 글과 막는 까닭 */
function foodEatLabel(id){
  const f=ITEMS[id]?.food;if(!f)return '';
  return '먹기'+(ITEMS[id].eat?' · 체력 +'+ITEMS[id].eat:'')+(f.k?' · '+FOOD_BUFFS[f.k].n+' '+f.lv:'');
}
function foodBlock(id){
  const f=ITEMS[id]?.food;if(!f||!has(id))return '먹을 수 없다.';
  if(!f.k&&G.hp>=G.maxhp)return '배가 불러 지금은 안 먹어도 된다.';
  const after={...G.inv,[id]:G.inv[id]-1};
  if(progressShortage(after)>progressShortage(G.inv))return '이건 아직 쓸 데가 있어. 먹지 말고 두자.';
  return '';
}
function eatFood(id){
  const why=foodBlock(id);if(why){toast(why);return false;}
  const f=ITEMS[id].food,hp=ITEMS[id].eat||0,before=G.hp,old=G.buff;
  takeItem(id,1);G.hp=Math.min(G.maxhp,G.hp+hp);
  if(f.k)G.buff={k:f.k,lv:f.lv,from:id};
  refreshHud();
  const parts=[];
  if(G.hp>before)parts.push('체력이 '+(G.hp-before)+' 올랐다.');
  if(f.k){
    if(old&&old.k!==f.k)parts.push(FOOD_BUFFS[old.k].n+' 기운은 사라졌다.');
    parts.push(FOOD_BUFFS[f.k].n+' 기운: 다음 보스 싸움에서 '+FOOD_BUFFS[f.k].what(f.lv)+'.');
  }
  toast((f.line||'('+jo(ITEMS[id].n,'을','를')+' 먹었다.)')+(parts.length?' '+parts.join(' '):''));
  return true;
}
/* 보스 싸움: 시작할 때 품은 기운을 꺼내 쓰고, 끝나면 비운다 */
function foodBattleStart(){
  B.food=null;B.guard=0;
  if(B.E.dodge||!validBuff(G.buff))return;
  B.food={...G.buff};
  if(B.food.k==='guard')B.guard=B.food.lv*TABLES.TUNING.food_guard_step;
}
function foodBattleEnd(){if(B&&B.food){G.buff=null;B.food=null;B.guard=0;}}
function foodMul(k){
  if(!B||!B.food||B.food.k!==k)return 1;
  const step={swift:'food_swift_step',strong:'food_strong_step',eye:'food_eye_step',kind:'food_kind_step'}[k];
  return 1+TABLES.TUNING[step]*B.food.lv;
}
/* 맞을 때: 금빛 하트가 먼저 받는다. 남은 피해를 돌려준다 */
function foodGuardHit(loss){
  if(!B||!(B.guard>0)||loss<=0)return loss;
  const g=Math.min(B.guard,loss);B.guard-=g;B.msg='든든히 먹은 배가 버텼다!'+(B.guard>0?' (금빛 하트 '+B.guard+')':'');
  return loss-g;
}
