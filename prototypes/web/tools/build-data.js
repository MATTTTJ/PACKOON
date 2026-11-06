// 기획 표(design/data/*.csv)에서 웹 게임용 데이터 파일(js/data/tables.js)을 만든다.
// 표가 유일한 원본이다. 표를 고친 뒤 이 변환기를 한 번 돌리면 게임에 반영된다.
//   node prototypes/web/tools/build-data.js          만들기
//   node prototypes/web/tools/build-data.js --check  만든 파일이 표와 맞는지만 확인 (다르면 실패)
// 외부 패키지 없이 node 만으로 돈다. 더블클릭(file://)으로도 게임이 열리도록, 게임은 CSV 대신 이 파일을 읽는다.
'use strict';
const fs=require('fs'),path=require('path');
const {read}=require('./csv.js');
const ROOT=path.resolve(__dirname,'../../..');
const DATA=path.join(ROOT,'design/data');
const OUT=path.join(ROOT,'prototypes/web/js/data/tables.js');
const fail=msg=>{console.error('변환 실패: '+msg);process.exit(1);};
const t=name=>{
  const file=path.join(DATA,name+'.csv'),source=fs.readFileSync(file,'utf8');
  if(source.charCodeAt(0)!==0xFEFF)fail(name+'.csv: UTF-8 BOM이 필요하다');
  const {head,rows}=read(file);
  if(head.length!==new Set(head).size)fail(name+'.csv: 머리줄 이름이 겹친다');
  if(head.includes('id')){
    const ids=new Set();
    for(const r of rows){
      if(!/^[a-z][a-z0-9_]*$/.test(r.id)||ids.has(r.id))fail(name+'.csv: 잘못되거나 겹치는 id '+r.id);
      ids.add(r.id);
    }
  }
  for(const r of rows)if(r['상태']&&!['확정','제안','미정'].includes(r['상태']))fail(name+'.csv: 상태는 확정/제안/미정이어야 한다');
  return rows;
};

const items=t('items'),bosses=t('bosses'),parts=t('boss_parts'),heirlooms=t('heirlooms'),notebook=t('notebook');
const regions=t('regions'),regionIds=new Set(regions.map(r=>r.id)),ZONES={};
/* 지역·구역 이름 목록은 기존 지역 표에서 읽는다. 이름 안의 가운뎃점을 보존하기 위해 |로 나눈다. */
for(const r of regions){
  if(!r['구역']?.trim())fail('regions.csv '+r.id+': 구역 목록이 비어 있다');
  const names=new Set(),zones={};
  for(const entry of r['구역'].split('|')){
    const match=entry.trim().match(/^([a-z][a-z0-9_]*):([^:|]+)$/);
    if(!match||!match[2].trim())fail('regions.csv '+r.id+': 구역은 id:이름을 |로 나눈 모양이어야 한다');
    const [,id,raw]=match,name=raw.trim();
    if(Object.hasOwn(zones,id)||names.has(name))fail('regions.csv '+r.id+': 구역 id 또는 이름이 겹친다 '+id);
    zones[id]=name;names.add(name);
  }
  ZONES[r.id]=zones;
}
/* 이름 → id (가공법·진정수치 칸은 사람이 읽는 이름으로 적혀 있다) */
const byName=Object.fromEntries(items.map(r=>[r['이름'],r.id]));
const idOf=(name,where)=>{const id=byName[name.trim()];if(!id)fail(where+': 아이템 이름 "'+name.trim()+'"을(를) items.csv 에서 찾지 못했다');return id;};

/* 아이템: 레어도 단계(1~5)는 게임 안에서 0부터 센다 */
const ITEMS={};
// 같은 지역·완료표시·묶음에 속한 물건은 대체재다. 묶음을 생략하면 각각 필요하다.
const PROGRESS=[],progressByKey={};
for(const r of items){
  const lv=parseInt(r['레어도단계'],10);if(!(lv>=1&&lv<=5))fail('items.csv '+r.id+': 레어도단계가 1~5 가 아니다 ("'+r['레어도단계']+'")');
  if(!r['설명'])fail('items.csv '+r.id+': 설명이 비어 있다');
  if(!['재료','먹을거리','도구','귀한 것'].includes(r['종류']))fail('items.csv '+r.id+': 종류는 재료·먹을거리·도구·귀한 것 중 하나여야 한다');
  if(r['지역']!=='전체'&&!regionIds.has(r['지역']))fail('items.csv '+r.id+': 지역 id를 확인한다');
  ITEMS[r.id]={n:r['이름'],r:lv-1,kind:r['종류'],region:r['지역'],d:r['설명']};
  if(r['세는말'])ITEMS[r.id].u=r['세는말'];   // 결정 D-238: "(쌀 여덟 되를 얻었다.)"의 세는 말. 비면 '개'
  for(const entry of (r['진행보호']||'').split('·').map(x=>x.trim()).filter(Boolean)){
    const m=entry.match(/^([a-z_]+):([A-Za-z_]+):([1-9]\d*)(?::([a-z_]+))?$/);
    if(!m||!regionIds.has(m[1])||!Number.isSafeInteger(+m[3]))fail('items.csv '+r.id+': 진행보호 형식·지역·수량을 확인한다');
    const [,region,done,n,group=r.id]=m,key=region+':'+done+':'+group;
    let goal=progressByKey[key];
    if(!goal){goal={region,done,options:[]};progressByKey[key]=goal;PROGRESS.push(goal);}
    goal.options.push({[r.id]:+n});
  }
}
/* NPC·지역 이름은 대사 안에도 적혀 있어 코드에 둔다 (표만 바꾸면 대사가 따라오지 않는다) */
/* 보스 부위: 표 순서 그대로. 공격 종류와 예고 글은 지역 코드에 있다 */
const BOSS_PARTS={};
for(const r of parts){
  const hp=parseInt(r['내구도'],10);if(!(hp>0))fail('boss_parts.csv '+r['보스']+'.'+r['부위id']+': 내구도가 숫자가 아니다');
  if(r['부수면']&&!ITEMS[r['부수면']])fail('boss_parts.csv '+r['보스']+'.'+r['부위id']+': 부수면 "'+r['부수면']+'"이 items.csv 에 없다');
  const p={id:r['부위id'],name:r['부위'],hp};if(r['부수면'])p.mat=r['부수면'];if(r['핵심']==='O')p.core=true;
  // 결정 D-224: 부위마다 잘 먹는 도구(낫 sickle · 곡괭이 pick). 빈칸은 도구를 가리지 않는다(무쇠 피하기 시험)
  const toolOf={'':null,'낫':'sickle','곡괭이':'pick'};
  if(!Object.hasOwn(toolOf,r['잘먹는도구']||''))fail('boss_parts.csv '+r['보스']+'.'+r['부위id']+': 잘먹는도구는 빈칸·낫·곡괭이여야 한다');
  if(r['잘먹는도구'])p.tool=toolOf[r['잘먹는도구']];
  (BOSS_PARTS[r['보스']]=BOSS_PARTS[r['보스']]||[]).push(p);
}
/* 진정수치: "싸리버섯 50 · 꾀꼬리버섯 50" */
const CALM={};
for(const r of bosses){
  const s=(r['진정수치']||'').trim();if(!s)continue;CALM[r.id]={};
  for(const part of s.split('·')){const m=part.trim().match(/^(.+?)\s+(\d+)$/);if(!m)fail('bosses.csv '+r.id+': 진정수치 "'+part.trim()+'"은 "이름 숫자" 모양이어야 한다');CALM[r.id][idOf(m[1],'bosses.csv '+r.id+' 진정수치')]=+m[2];}
}
/* 가공법: "쌀가루 2 + 팥 1 → 팥시루떡 1 · 메밀가루 2 → 메밀떡 1" */
const RECIPES={},CRAFT={};
for(const r of heirlooms){
  const s=(r['가공법']||'').trim();if(!s)continue;RECIPES[r.id]=[];
  const hidden=(r['숨은가공품']||'').split('·').map(x=>x.trim()).filter(Boolean);
  const optional=(r['선택가공품']||'').split('·').map(x=>x.trim()).filter(Boolean);
  const profile={habit:r['손버릇기록'],habitKey:r['손버릇키'],fail:r['틀린조합반응']};   // 결정 D-344: 손맛 수치 칸은 읽는 코드가 없어 지웠다
  if(!profile.habit||profile.habitKey!=='habit:'+r.id||!profile.fail)fail('heirlooms.csv '+r.id+': 손버릇 기록·키·틀린 조합 반응을 확인한다');
  CRAFT[r.id]=profile;
  const outputs=new Set(),combinations=new Set();
  for(const rec of s.split('·')){
    const sides=rec.split('→'),[lhs,rhs]=sides;if(sides.length!==2||!lhs.trim()||!rhs.trim())fail('heirlooms.csv '+r.id+': 가공법 "'+rec.trim()+'"의 → 양쪽을 확인한다');
    const amt=x=>{const m=x.trim().match(/^(.+?)\s+([1-9]\d*)$/);if(!m||!Number.isSafeInteger(+m[2]))fail('heirlooms.csv '+r.id+': "'+x.trim()+'"은 "이름 양의정수" 모양이어야 한다');return [idOf(m[1],'heirlooms.csv '+r.id+' 가공법'),+m[2]];};
    const need={};for(const x of lhs.split('+')){const [id,n]=amt(x);if(need[id])fail('heirlooms.csv '+r.id+': 한 가공법에 재료가 겹친다 '+id);need[id]=n;}
    if(Object.values(need).reduce((sum,n)=>sum+n,0)>3)fail('heirlooms.csv '+r.id+': 재료가 가공대 세 칸을 넘는다');
    const [out,n]=amt(rhs),signature=Object.keys(need).sort().map(id=>id+':'+need[id]).join(',');
    if(outputs.has(out)||combinations.has(signature))fail('heirlooms.csv '+r.id+': 겹치는 결과 또는 조합 '+out);
    outputs.add(out);combinations.add(signature);
    const recipe={need,out,n};
    if(optional.includes(out)){
      recipe.optional=true;
      if(ITEMS[out].r>Math.max(...Object.keys(need).map(id=>ITEMS[id].r)))fail('heirlooms.csv '+r.id+': 선택 가공은 레어도를 올리지 않는다 '+out);
    }
    if(hidden.includes(out)){recipe.hidden=true;recipe.discover='recipe:'+out;}
    RECIPES[r.id].push(recipe);
  }
  for(const id of hidden)if(!outputs.has(id))fail('heirlooms.csv '+r.id+': 숨은가공품이 가공법에 없다 '+id);
  for(const id of optional)if(!outputs.has(id))fail('heirlooms.csv '+r.id+': 선택가공품이 가공법에 없다 '+id);
  for(const id of hidden)if(!optional.includes(id))fail('heirlooms.csv '+r.id+': 숨은 가공품은 선택 가공품이어야 한다 '+id);
}
/* 아빠의 보부상 수첩: 쪽마다 줄을 표 순서대로. "(items.csv 의 설명)" 줄은 게임이 물건 설명으로 채운다 */
const NOTES=[];const byId={};
for(const r of notebook){
  const section=r['기록갈래'];
  if(!['아빠 수첩','관찰','익힌 솜씨','숨은 가공법'].includes(section)||(r['쓴이']==='아빠')!==(section==='아빠 수첩'))fail('notebook.csv '+r['쪽id']+': 기록갈래와 쓴이가 맞지 않는다');
  let e=byId[r['쪽id']];
  if(!e){e=byId[r['쪽id']]={id:r['쪽id'],region:r['지역'],kind:r['종류']==='물건'?'item':r['종류']==='도장'?'stamp':'animal',lines:[]};if(e.kind==='stamp'||CRAFT[e.id])e.name=r['대상'];else if(e.kind==='animal'&&e.id.includes('_'))e.name=r['대상'];NOTES.push(e);}   // 결정 D-118: 떠돌이 쪽(지역 NPC가 아닌 쪽id)은 표의 대상 이름을 쓴다
  // 결정 D-61: '아빠 그림 있음'은 이제 아빠가 이름을 적어 둔 쪽이라는 뜻만 남는다(그림은 아이가 본 뒤에 그린다)
  if(r['비고'].includes('아빠 그림 있음'))e.dadDrawing=true;
  if(r['내용']==='(items.csv 의 설명)')continue;
  const l={who:r['쓴이']==='아빠'?'dad':'me',text:r['내용'],section};if(r['알게되는키'])l.when=r['알게되는키'];e.lines.push(l);
}
for(const e of NOTES)if(e.kind==='item'&&!ITEMS[e.id]&&!CRAFT[e.id])fail('notebook.csv '+e.id+': 물건 쪽인데 items.csv 또는 heirlooms.csv 에 없다');
for(const [tool,c]of Object.entries(CRAFT))if(!NOTES.some(e=>e.id===tool&&e.lines.some(l=>l.when===c.habitKey)))fail('notebook.csv: 손버릇 기록이 없다 '+tool);
for(const recipe of Object.values(RECIPES).flat().filter(r=>r.hidden))if(!NOTES.some(e=>e.id===recipe.out&&e.lines.some(l=>l.when===recipe.discover)))fail('notebook.csv: 숨은 가공법 발견 기록이 없다 '+recipe.out);
/* 결정 D-171: 아빠 손바닥 도장마다 그 자리에서 묻은 것(무늬)과 눌린 세기. 키는 '지역:도장id' (notebook.csv 알게되는키 stamp:지역:도장id) */
const STAMP_MARKS={},STAMP_MARK_KINDS=['soot','leaf','juice','straw','dust','grip','wind','wet','resin','frost','snow','ice'],STAMP_PRESS={'진하게':'strong','보통':'normal','옅게':'faint'};
const stampKeys=new Set(NOTES.filter(e=>e.kind==='stamp').flatMap(e=>e.lines.map(l=>l.when).filter(w=>w&&w.startsWith('stamp:'))));
for(const r of t('stamps')){
  const key=r['도장키'];
  if(!stampKeys.has(key))fail('stamps.csv '+r.id+': notebook.csv 에 없는 도장키 '+key);
  if(!key.startsWith('stamp:'+r['지역']+':'))fail('stamps.csv '+r.id+': 지역과 도장키가 맞지 않는다');
  if(!STAMP_MARK_KINDS.includes(r['무늬']))fail('stamps.csv '+r.id+': 무늬는 '+STAMP_MARK_KINDS.join('/')+' 중 하나');
  if(!STAMP_PRESS[r['눌림']])fail('stamps.csv '+r.id+': 눌림은 진하게/보통/옅게');
  const k=key.slice(6);if(STAMP_MARKS[k])fail('stamps.csv '+r.id+': 도장키가 겹친다');
  STAMP_MARKS[k]={mark:r['무늬'],press:STAMP_PRESS[r['눌림']]};
}
for(const key of stampKeys)if(!STAMP_MARKS[key.slice(6)])fail('stamps.csv: 도장 무늬가 없다 '+key);

/* 좋아하는 맛: 인물·물건 한 쌍에 반응 하나. 효과는 기존 진정수치와 별도로 새 선물에만 쓴다. */
const TASTES={},npcIds=new Set(t('npcs').map(r=>r.id)),bossIds=new Set(bosses.map(r=>r.id));
for(const r of t('tastes')){
  const who=r['누가'],item=r['무엇'],kind=r['반응종류'],line=r['반응대사'],effect=r['효과'];
  if(!npcIds.has(who)&&!bossIds.has(who))fail('tastes.csv '+r.id+': NPC·보스 id가 아니다 '+who);
  // 결정 D-424: 무엇 칸이 lore:<키> 이면 물건이 아니라 배운 것(learn 키)이 선물이다. 전투 진정에만 쓰고, 선물이름 칸이 단추 글이다
  const lore=/^lore:[a-z_]+$/.test(item);
  if(lore&&(!bossIds.has(who)||!(r['선물이름']||'').trim()||!effect.startsWith('calm:')))fail('tastes.csv '+r.id+': 배운 것 선물은 전투 상대의 진정 맛이고 선물이름이 있어야 한다');
  if(!lore&&!ITEMS[item])fail('tastes.csv '+r.id+': 물건 id가 없다 '+item);
  if(!['아주 좋아함','좋아함','그저 그럼','싫어함'].includes(kind)||!line)fail('tastes.csv '+r.id+': 반응 종류·대사를 확인한다');
  if(!/^(?:none|calm:(?:[1-9]\d?|100))$/.test(effect))fail('tastes.csv '+r.id+': 효과는 none / calm:1~100이어야 한다');
  if(effect.startsWith('calm:')&&(!bossIds.has(who)||!['아주 좋아함','좋아함'].includes(kind)))fail('tastes.csv '+r.id+': 진정 효과는 전투 상대가 좋아하는 맛에만 쓴다');
  if(TASTES[who]&&TASTES[who][item])fail('tastes.csv '+r.id+': 인물·물건 조합이 겹친다');
  // 결정 D-76: 전투 진정 효과가 있는 맛은 그 전투 때 손에 넣을 수 있어야 한다. 물건을 얻는 지역이 상대의 지역보다 뒤면 안 된다.
  if(effect.startsWith('calm:')&&!lore){const ir=ITEMS[item].region,br=bosses.find(b=>b.id===who)?.['지역'],ord=id=>+regions.find(x=>x.id===id)?.['순서'];
    if(ir!=='전체'&&br&&ord(ir)>ord(br))fail('tastes.csv '+r.id+': '+item+'는 '+ir+'에서 얻어 '+who+' 전투('+br+') 때 가질 수 없다');}
  (TASTES[who]||(TASTES[who]={}))[item]=lore?{kind,line,effect,lore:r['선물이름'].trim()}:{kind,line,effect};
}
for(const id of npcIds){const n=Object.keys(TASTES[id]||{}).length;if(n<2||n>3)fail('tastes.csv: NPC마다 맛 반응이 2~3개 필요하다 '+id);}
for(const id of bossIds)if(Object.keys(TASTES[id]||{}).length<2)fail('tastes.csv: 전투 상대마다 맛 반응이 2개 이상 필요하다 '+id);
/* 결정 D-906: 선물(좋아하는 것 건네기)의 답례로 배우는 숨은 가공법 (design/data/gift_recipes.csv).
   대사는 ' / '로 줄을 나누고, '너구리:'로 시작하는 줄은 아이의 말·지문이다. 수첩 칸은 그 가공법 쪽에 아이가 적는 줄(키 gift:<id>)이다. */
const GIFT_RECIPES=[];
for(const r of t('gift_recipes')){
  const where='gift_recipes.csv '+r.id,out=idOf(r['가공품'],where);
  if(!regionIds.has(r['지역'])||!npcIds.has(r.NPC))fail(where+': 지역·NPC id를 확인한다');
  if(!Object.values(RECIPES).flat().some(x=>x.out===out&&x.hidden))fail(where+': 숨은 가공법의 결과물이 아니다 '+r['가공품']);
  if(!['직접','소문','혼잣말','쪽지'].includes(r['방식']))fail(where+': 방식은 직접·소문·혼잣말·쪽지 중 하나다');
  if(!Object.values(TASTES[r.NPC]||{}).some(x=>['아주 좋아함','좋아함'].includes(x.kind)))fail(where+': 좋아하는 것이 없어 선물을 받을 수 없는 인물이다');
  if(GIFT_RECIPES.some(g=>g.region===r['지역']&&g.npc===r.NPC&&g.out===out))fail(where+': 같은 지역·인물·가공품이 겹친다');
  const lines=r['대사'].split(' / ').map(s=>s.trim()).filter(Boolean).map(s=>s.startsWith('너구리:')?[1,s.slice(4).trim()]:[0,s]);
  if(!lines.length||lines.some(([,s])=>!s))fail(where+': 대사가 비었다');
  if(!r['수첩'].trim()||!byId[out])fail(where+': 수첩 줄이 비었거나 notebook.csv 에 '+out+' 쪽이 없다');
  byId[out].lines.push({who:'me',text:r['수첩'].trim(),section:'숨은 가공법',when:'gift:'+r.id});
  GIFT_RECIPES.push({id:r.id,region:r['지역'],npc:r.NPC,out,way:r['방식'],lines});
}
/* 새 선택 교환은 현재 지역 코드에 연결하지 않고 목록·수량만 검증한다. */
for(const r of t('trades').filter(r=>r.id.startsWith('t_craft_'))){
  if(!regionIds.has(r['지역'])||!npcIds.has(r.NPC))fail('trades.csv '+r.id+': 지역·NPC id를 확인한다');
  for(const col of ['원하는것','주는것'])for(const entry of r[col].split('+')){
    const m=entry.trim().match(/^(.+?)\s+([1-9]\d*)$/);
    if(!m||!Number.isSafeInteger(+m[2]))fail('trades.csv '+r.id+': '+col+'은 이름 양의정수 모양이어야 한다');
    idOf(m[1],'trades.csv '+r.id+' '+col);
  }
}

/* 수치 표는 한 줄에 값 하나. 필수 id는 웹이 쓰는 계약이며 기본 수치를 복사해 두지 않는다. */
function numericTable(name,label){
  const file=path.join(DATA,name+'.csv'),source=fs.readFileSync(file,'utf8');
  if(source.charCodeAt(0)!==0xFEFF)fail(name+'.csv: UTF-8 BOM이 필요하다');
  const {head,rows}=read(file),columns=['id',label,'값이름','값','단위','설명','상태'];
  if(head.join(',')!==columns.join(','))fail(name+'.csv: 머리줄은 '+columns.join(',')+' 이어야 한다');
  const values={};
  for(const [i,r] of rows.entries()){
    const where=name+'.csv '+(i+2)+'행 '+r.id;
    if(!/^[a-z][a-z_]*$/.test(r.id)||Object.hasOwn(values,r.id))fail(where+': 잘못되거나 겹치는 id');
    if(Object.hasOwn(values,r.id))fail(where+': id 중복');
    for(const key of columns)if(!r[key].trim())fail(where+': '+key+' 칸이 비어 있다');
    if(!['확정','제안','미정'].includes(r['상태']))fail(where+': 상태는 확정/제안/미정이어야 한다');
    const raw=r['값'].trim(),n=Number(raw);
    if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw)||!Number.isFinite(n))fail(where+': 값이 유한한 숫자가 아니다');
    if(r.id==='field_jump_velocity'?n>=0:n<0)fail(where+': 값의 부호가 올바르지 않다');
    if(['회','개','단계','인덱스','프레임','남은 프레임','ms','내구도'].includes(r['단위'])&&!Number.isInteger(n))fail(where+': 이 단위는 정수여야 한다');
    values[r.id]=n;
  }
  return values;
}
/* 결정 D-351: 미니게임·조정값 표의 id를 여기 손으로 적지 않는다 (예전 목록은 브랜치를 합칠 때마다 부딪혔다).
   웹 코드(js/)가 읽는 id를 찾아 표와 맞춘다. 코드가 읽는데 표에 없으면 실패, 표에만 있고 코드가 안 읽으면 경고한다.
   읽는 꼴(실패 쪽): TABLES.TUNING.id, TABLES.TUNING['id'], 그 표를 담은 이름(const MG=TABLES.MINIGAMES, const T=()=>TABLES.TUNING, const t=T())의 .id.
   글자를 이어 붙여 읽는 id(TUNING['battle_'+form+'_speed'])는 앞뒤 조각이 맞는 표 id를 읽는 것으로 본다.
   경고 쪽은 너그럽게, 코드 어디에든 그 id 낱말이 있으면 읽는 것으로 본다 (wsFrames('wish_anim_carry_frames') 같은 도우미). */
function codeReads(){
  const files=[];
  (function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
    if(e.isDirectory())walk(p);else if(e.name.endsWith('.js')&&p!==OUT)files.push(p);}})(path.join(ROOT,'prototypes/web/js'));
  const out={TUNING:{ids:new Map(),glob:[]},MINIGAMES:{ids:new Map(),glob:[]},words:new Set()};
  const esc=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  for(const file of files){
    const src=fs.readFileSync(file,'utf8'),where=path.relative(ROOT,file).replace(/\\/g,'/');
    for(const m of src.matchAll(/\b[a-z][a-z_]*_[a-z_]+\b/g))out.words.add(m[0]);
    const names={TUNING:['TABLES\\.TUNING'],MINIGAMES:['TABLES\\.MINIGAMES']};
    const decl='(?:\\b(?:const|let|var)\\s+|,\\s*)([A-Za-z_$][\\w$]*)\\s*=\\s*';
    for(const table of ['TUNING','MINIGAMES']){
      for(const m of src.matchAll(new RegExp(decl+'\\(\\)\\s*=>\\s*TABLES\\.'+table+'\\b(?!\\s*\\.)','g')))names[table].push(esc(m[1])+'\\(\\)');
      for(const base of names[table].slice())for(const m of src.matchAll(new RegExp(decl+base+'\\s*(?=[;,)\\n])','g')))names[table].push(esc(m[1]));
    }
    for(const table of ['TUNING','MINIGAMES'])for(const n of names[table]){
      const alias=!n.startsWith('TABLES');   // 담은 이름(t, MG…)은 지역 변수와 겹칠 수 있어 표 id 꼴(밑줄 있음)만 센다
      for(const m of src.matchAll(new RegExp('(?<![\\w$.])'+n+'(?:\\??\\.([a-z][a-z_]*)\\b(?!\\s*\\()|\\[\\s*\'([a-z][a-z_]*)\'\\s*\\])','g'))){
        const id=m[1]||m[2];if(alias&&!id.includes('_'))continue;if(!out[table].ids.has(id))out[table].ids.set(id,where);}
      for(const m of src.matchAll(new RegExp('(?<![\\w$.])'+n+'\\[([^\\]]*\\+[^\\]]*)\\]','g')))
        out[table].glob.push(new RegExp('^'+m[1].split('+').map(p=>{p=p.trim();const q=p.match(/^'([a-z_]*)'$/);return q?esc(q[1]):'[a-z_]*';}).join('')+'$'));
    }
  }
  return out;
}
const READS=codeReads();
function checkReads(name,table,values){
  const r=READS[table];
  for(const [id,where] of r.ids)if(!Object.hasOwn(values,id))fail(name+'.csv: 코드('+where+')가 읽는 값 '+id+' 이 표에 없다');
  const unused=Object.keys(values).filter(id=>!r.ids.has(id)&&!r.glob.some(g=>g.test(id))&&!READS.words.has(id));
  if(unused.length)console.warn('경고: '+name+'.csv 에만 있고 웹 코드가 읽지 않는 값 '+unused.length+'개: '+unused.join(' '));
}
const MINIGAMES=numericTable('minigames','미니게임');checkReads('minigames','MINIGAMES',MINIGAMES);
const TUNING=numericTable('tuning','분류');checkReads('tuning','TUNING',TUNING);
/* 나눗셈·주기·배열 길이와 서로 맞물리는 판정은 실행 전에 확인한다. */
const requireValue=(ok,message)=>{if(!ok)fail(message);};
for(const [table,values] of [['minigames',MINIGAMES],['tuning',TUNING]]){
  for(const [id,n] of Object.entries(values)){
    if(/_(hits|frames|wait|cooldown|cycle|cue|steps|notes|parts|interval|target_frames|danger_limit|near_random)$/.test(id))requireValue(n>0,table+'.csv '+id+': 0보다 커야 한다');
  }
}
requireValue(TUNING.kkubeogi_awake<=TUNING.kkubeogi_cycle&&TUNING.kkubeogi_cue<=TUNING.kkubeogi_cycle,'tuning.csv: 꾸벅이 판정과 예고가 주기보다 길다');
requireValue(TUNING.field_drop_hang_frames<=TUNING.field_drop_frames&&TUNING.field_drop_hang_speed>0,'tuning.csv: 가장자리 붙잡기 시간은 발판 통과 시간보다 길 수 없고, 빠르기는 0보다 커야 한다 (D-114)');
requireValue(TUNING.field_swing_hit_at<TUNING.field_swing_frames,'tuning.csv: 휘두르기 판정 시점이 전체 시간보다 짧아야 한다');
requireValue(TUNING.map_flight_ms>0&&TUNING.map_landing_margin>0,'tuning.csv: 까치 이동 시간과 착지 여백은 0보다 커야 한다');
requireValue(TUNING.drop_min_spacing>=16&&TUNING.drop_spread>=TUNING.drop_min_spacing,'tuning.csv: 바닥 아이템 간격은 16px 이상이며 퍼짐 폭 안에 있어야 한다');
requireValue(TUNING.pickup_range>0&&TUNING.pickup_range_y>0,'tuning.csv: 줍기 범위는 0보다 커야 한다');
requireValue(TUNING.pickup_pull_frames<=TUNING.pickup_motion_frames,'tuning.csv: 빨려 드는 시간은 줍기 동작보다 길 수 없다');
for(const form of ['bare','squirrel','goat','owl','deer']){
  requireValue(TUNING['battle_'+form+'_speed']>0&&TUNING['battle_'+form+'_cooldown']>0&&TUNING['battle_'+form+'_radius']>3,'tuning.csv: 전투 변신 속도·대기·되치기 반경을 확인한다');
}
requireValue(TUNING.battle_squirrel_speed>TUNING.battle_bare_speed&&TUNING.battle_squirrel_cooldown<TUNING.battle_bare_cooldown&&TUNING.battle_squirrel_radius<TUNING.battle_bare_radius&&TUNING.battle_owl_radius>TUNING.battle_bare_radius&&TUNING.battle_owl_cooldown>TUNING.battle_bare_cooldown,'tuning.csv: 다람쥐는 빠르고 좁게, 수리부엉이는 넓고 느리게 유지한다');
requireValue(TUNING.battle_goat_damage_taken>0&&TUNING.battle_goat_damage_taken<1&&TUNING.battle_owl_tell_lead>=0&&TUNING.battle_deer_iframes>=TUNING.battle_iframes,'tuning.csv: 산양 피해 배수는 0~1 사이, 고라니 무적 시간은 기본 이상이어야 한다');
requireValue(TUNING.form_squirrel_speed>0&&TUNING.form_deer_speed>0&&TUNING.form_goat_jump>=1&&TUNING.form_owl_glide_fall>0&&TUNING.form_owl_glide_fall<TUNING.field_fall_speed&&TUNING.form_climb_speed>0&&TUNING.form_climb_reach>0&&TUNING.form_deer_listen_range>0&&Number.isInteger(TUNING.stranger_trade_limit)&&TUNING.stranger_trade_limit>0,'tuning.csv: 필드 변신 배수·활공·오르기·손님 교환 수를 확인한다');
requireValue(TUNING.battle_base_damage>0&&TUNING.battle_sharp_damage>=TUNING.battle_base_damage&&TUNING.battle_tool_good_damage>0&&TUNING.battle_tool_bad_mult>0&&TUNING.battle_tool_bad_mult<1&&TUNING.battle_hand_scale>0.5&&TUNING.battle_hand_scale<=2,'tuning.csv: 전투 기본 피해·날 세운 피해·잘 먹는 도구 덤·안 먹는 도구 배수(0~1)·손 그림 크기를 확인한다');
requireValue(TUNING.kudzu_stem_cut_chance>0&&TUNING.kudzu_stem_cut_chance<=1&&TUNING.kudzu_root_dig_chance>0&&TUNING.kudzu_root_dig_chance<=1,'tuning.csv: 칡줄기 끊기·칡뿌리 캐기 확률은 0보다 크고 1 이하여야 한다');
requireValue(TUNING.kudzu_scent_damage>0&&TUNING.kudzu_scent_damage<1&&TUNING.kudzu_scent_slow>0&&TUNING.kudzu_scent_slow<1&&TUNING.kudzu_scent_slow_frames>0&&TUNING.kudzu_scent_linger>0,'tuning.csv: 칡꽃 꽃가루 피해는 0~1칸, 느려짐 배수는 0~1, 시간은 0보다 커야 한다');
requireValue(TUNING.golem_stone_chance>0&&TUNING.golem_stone_chance<=1&&TUNING.golem_stone_step>0&&Number.isInteger(TUNING.golem_stone_cap)&&TUNING.golem_stone_cap>=1&&Number.isInteger(TUNING.golem_barrage_count)&&TUNING.golem_barrage_count>=1,'tuning.csv: 돌 골렘 돌 확률은 0~1, 오름은 0보다 크고, 돌 수·눈폭탄 수는 1 이상 정수여야 한다 (D-184)');
requireValue(MINIGAMES.baduk_steady_win>0&&MINIGAMES.baduk_steady_win<1&&MINIGAMES.baduk_bets_total>=1&&MINIGAMES.baduk_stake>=1&&MINIGAMES.baduk_steady_pay>=1&&MINIGAMES.baduk_bold_pay>=1,'minigames.csv: 바둑 내기 이기는 비율은 0~1 사이, 판 수·판돈·값은 1 이상이어야 한다 (D-562)');

/* 결정 D-39: 교환 화면의 흔한 물건. 값은 레어도 단계로만 맞추므로 표에는 내놓는 물건·개수·횟수만 적는다. */
const STOCK=[];
for(const r of t('stock')){
  const where='stock.csv '+r.id;
  if(!regionIds.has(r['지역'])||!npcIds.has(r.NPC))fail(where+': 지역·NPC id를 확인한다');
  const n=+r['개수'],times=+r['횟수'];
  if(!(Number.isSafeInteger(n)&&n>0&&Number.isSafeInteger(times)&&times>0))fail(where+': 개수·횟수는 양의 정수여야 한다');
  const item=idOf(r['물건'],where);
  if(['귀한 것','도구'].includes(ITEMS[item].kind))fail(where+': 귀한 것·도구는 흔한 물건으로 내놓지 않는다');
  STOCK.push({id:r.id,region:r['지역'],npc:r.NPC,item,n,times});
}
/* 결정 D-40: 흥정 반응. 지역 줄이 있으면 그 지역에서는 그 줄이 '전체' 줄보다 먼저다. */
const HAGGLE={};
for(const r of t('haggle')){
  const where='haggle.csv '+r.id,way=r['방식'],kind=r['반응'],region=r['지역']==='전체'?'all':r['지역'];
  if(!npcIds.has(r.NPC))fail(where+': NPC id를 확인한다');
  if(region!=='all'&&!regionIds.has(region))fail(where+': 지역 id를 확인한다');
  if(!['허세','사정','칭찬'].includes(way))fail(where+': 방식은 허세·사정·칭찬 중 하나다');
  if(!['좋아함','그저 그럼','싫어함'].includes(kind))fail(where+': 반응은 좋아함·그저 그럼·싫어함 중 하나다');
  if(!r['아이대사']?.trim()||!r['대답']?.trim()||/\\n/.test(r['아이대사']+r['대답']))fail(where+': 대사는 한 줄로 적는다');
  const slot=((HAGGLE[r.NPC]=HAGGLE[r.NPC]||{})[way]=HAGGLE[r.NPC][way]||{});
  if(slot[region])fail(where+': 같은 NPC·방식·지역 줄이 겹친다');
  slot[region]={kind,kid:r['아이대사'].trim(),line:r['대답'].trim()};
}
for(const [npc,ways] of Object.entries(HAGGLE))for(const way of ['허세','사정','칭찬'])if(!ways[way]?.all)fail('haggle.csv '+npc+': '+way+'의 전체 줄이 필요하다');
/* 결정 D-72: 장면별 곡. 곡은 design/data/music/music.json의 곡 id이거나 '지역'(이야기 곡을 깔지 않고 지역 곡을 둔다).
   시작줄부터 그 곡으로 바꾼다(그 전 줄은 지역 곡). */
const SCENE_MUSIC={};
{
  const music=JSON.parse(fs.readFileSync(path.join(DATA,'music','music.json'),'utf8'));
  const trackIds=new Set((music.tracks||music.score?.tracks||[]).map(t=>t.id));
  for(const r of t('scene_music')){
    const where='scene_music.csv '+r.id,song=r['곡'].trim(),from=+r['시작줄'];
    if(!regionIds.has(r['지역']))fail(where+': 지역 id를 확인한다');
    if(song!=='지역'&&!trackIds.has(song))fail(where+': 곡 id가 music.json에 없다 '+song);
    if(!Number.isSafeInteger(from)||from<0)fail(where+': 시작줄은 0 이상의 정수다');
    SCENE_MUSIC[r.id]={music:song==='지역'?'':song,from};
  }
}
/* 결정 D-87: 마음 상태 음악의 층 나눔(music_layers.csv). 곡의 모든 성부가 꼭 한 층에 들어가야 한다.
   층에 빠진 성부는 층 재생에서 들리지 않으므로, 음악 원본(design/data/music/music.json)의 성부와 정확히 맞춘다. */
const MUSIC_LAYERS={};
{
  const music=JSON.parse(fs.readFileSync(path.join(DATA,'music/music.json'),'utf8'));
  const voicesOf=new Map(music.tracks.map(t=>[t.id,t.voices.map(v=>v.id)]));
  for(const r of t('music_layers')){
    const where='music_layers.csv '+r.id,track=r['곡'];
    if(!voicesOf.has(track))fail(where+': 음악에 없는 곡 '+track);
    if(MUSIC_LAYERS[track])fail(where+': 같은 곡 줄이 겹친다 '+track);
    const tempos=r['템포단계'].trim().split(/\s+/).map(Number);
    if(!tempos.length||tempos.some(n=>!(n>=0.8&&n<=1.3))||tempos.some((n,i)=>i&&n<tempos[i-1]))fail(where+': 템포단계는 0.8~1.3 사이 수를 오름차순으로 적는다');
    const layers={base:r['바탕'],longing:r['그리움'],pulse:r['북']};
    const seen=new Set();
    for(const [name,cell] of Object.entries(layers)){
      const ids=cell.split('+').map(s=>s.trim()).filter(Boolean);
      if(!ids.length)fail(where+': '+name+' 층이 비어 있다');
      for(const id of ids){
        if(!voicesOf.get(track).includes(id))fail(where+': 곡에 없는 성부 '+id);
        if(seen.has(id))fail(where+': 성부가 두 층에 들어 있다 '+id);
        seen.add(id);
      }
      layers[name]=ids;
    }
    const missing=voicesOf.get(track).filter(id=>!seen.has(id));
    if(missing.length)fail(where+': 층에 빠진 성부(들리지 않게 된다) '+missing.join(', '));
    MUSIC_LAYERS[track]={layers,tempos};
  }
}
/* 결정 D-483: 작은 창(살펴보기·대사 그림)이 뜰 때 나는 소리(popup_sounds.csv). 소리는 design/data/music/sfx.json 의 효과음 id.
   되풀이ms가 있으면 창이 떠 있는 동안 그 간격으로 다시 낸다(풍경·물·불처럼 계속 움직이는 것). */
const POPUP_SOUNDS={};
{
  const sfxIds=new Set(JSON.parse(fs.readFileSync(path.join(DATA,'music','sfx.json'),'utf8')).effects.map(e=>e.id));
  for(const r of t('popup_sounds')){
    const where='popup_sounds.csv '+r.id,sound=r['소리'].trim(),rep=r['되풀이ms'].trim();
    if(!regionIds.has(r['지역']))fail(where+': 지역 id를 확인한다');
    if(!sfxIds.has(sound))fail(where+': sfx.json에 없는 효과음 '+sound);
    if(rep&&!(+rep>=600&&+rep<=6000))fail(where+': 되풀이ms는 600~6000 사이다');
    if(POPUP_SOUNDS[r.id])fail(where+': 같은 id가 겹친다');
    POPUP_SOUNDS[r.id]={sfx:sound,...(rep?{repeat:+rep}:{})};
  }
}
requireValue(TUNING.roll_hold_ms>=80&&TUNING.roll_hold_ms<=400&&TUNING.roll_speed>1&&TUNING.roll_squirrel_speed>1&&TUNING.roll_accel_frames>=1&&TUNING.roll_step_frames>=1,'tuning.csv: 구르기 문턱은 80~400ms, 빠르기는 걷기보다 커야 한다');
const out="'use strict';\n/* 자동으로 만든 파일이다. 직접 고치지 말고 design/data/*.csv 를 고친 뒤 node prototypes/web/tools/build-data.js 를 돌린다 */\nconst TABLES="+JSON.stringify({ITEMS,BOSS_PARTS,CALM,RECIPES,CRAFT,TASTES,NOTES,STAMP_MARKS,MINIGAMES,TUNING,PROGRESS,ZONES,STOCK,HAGGLE,GIFT_RECIPES,SCENE_MUSIC,MUSIC_LAYERS,POPUP_SOUNDS},null,1)+";\n";
if(process.argv.includes('--check')){
  const now=fs.existsSync(OUT)?fs.readFileSync(OUT,'utf8').replace(/\r\n/g,'\n'):'';
  if(now!==out){console.error('tables.js 가 표와 다르다. node prototypes/web/tools/build-data.js 를 돌려야 한다');process.exit(1);}
  console.log('tables.js 가 표와 맞는다');
}else{fs.writeFileSync(OUT,out);console.log('만들었다: '+path.relative(ROOT,OUT)+' (아이템 '+Object.keys(ITEMS).length+', 보스 '+Object.keys(BOSS_PARTS).length+', 가공법 '+Object.values(RECIPES).flat().length+', 수첩 '+NOTES.length+'쪽)');}
