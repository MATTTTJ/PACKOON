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
const t=name=>read(path.join(DATA,name+'.csv')).rows;
const fail=msg=>{console.error('변환 실패: '+msg);process.exit(1);};

const items=t('items'),bosses=t('bosses'),parts=t('boss_parts'),heirlooms=t('heirlooms'),notebook=t('notebook');
/* 이름 → id (가공법·진정수치 칸은 사람이 읽는 이름으로 적혀 있다) */
const byName=Object.fromEntries(items.map(r=>[r['이름'],r.id]));
const idOf=(name,where)=>{const id=byName[name.trim()];if(!id)fail(where+': 아이템 이름 "'+name.trim()+'"을(를) items.csv 에서 찾지 못했다');return id;};

/* 아이템: 레어도 단계(1~5)는 게임 안에서 0부터 센다 */
const ITEMS={};
for(const r of items){
  const lv=parseInt(r['레어도단계'],10);if(!(lv>=1&&lv<=5))fail('items.csv '+r.id+': 레어도단계가 1~5 가 아니다 ("'+r['레어도단계']+'")');
  if(!r['설명'])fail('items.csv '+r.id+': 설명이 비어 있다');
  ITEMS[r.id]={n:r['이름'],r:lv-1,d:r['설명']};
}
/* NPC·지역 이름은 대사 안에도 적혀 있어 코드에 둔다 (표만 바꾸면 대사가 따라오지 않는다) */
/* 보스 부위: 표 순서 그대로. 공격 종류와 예고 글은 지역 코드에 있다 */
const BOSS_PARTS={};
for(const r of parts){
  const hp=parseInt(r['내구도'],10);if(!(hp>0))fail('boss_parts.csv '+r['보스']+'.'+r['부위id']+': 내구도가 숫자가 아니다');
  if(r['부수면']&&!ITEMS[r['부수면']])fail('boss_parts.csv '+r['보스']+'.'+r['부위id']+': 부수면 "'+r['부수면']+'"이 items.csv 에 없다');
  const p={id:r['부위id'],name:r['부위'],hp};if(r['부수면'])p.mat=r['부수면'];if(r['핵심']==='O')p.core=true;
  (BOSS_PARTS[r['보스']]=BOSS_PARTS[r['보스']]||[]).push(p);
}
/* 진정수치: "싸리버섯 50 · 꾀꼬리버섯 50" */
const CALM={};
for(const r of bosses){
  const s=(r['진정수치']||'').trim();if(!s)continue;CALM[r.id]={};
  for(const part of s.split('·')){const m=part.trim().match(/^(.+?)\s+(\d+)$/);if(!m)fail('bosses.csv '+r.id+': 진정수치 "'+part.trim()+'"은 "이름 숫자" 모양이어야 한다');CALM[r.id][idOf(m[1],'bosses.csv '+r.id+' 진정수치')]=+m[2];}
}
/* 가공법: "쌀가루 2 + 팥 1 → 팥시루떡 1 · 메밀가루 2 → 메밀떡 1" */
const RECIPES={};
for(const r of heirlooms){
  const s=(r['가공법']||'').trim();if(!s)continue;RECIPES[r.id]=[];
  for(const rec of s.split('·')){
    const [lhs,rhs]=rec.split('→');if(!rhs)fail('heirlooms.csv '+r.id+': 가공법 "'+rec.trim()+'"에 → 가 없다');
    const amt=x=>{const m=x.trim().match(/^(.+?)\s+(\d+)$/);if(!m)fail('heirlooms.csv '+r.id+': "'+x.trim()+'"은 "이름 숫자" 모양이어야 한다');return [idOf(m[1],'heirlooms.csv '+r.id+' 가공법'),+m[2]];};
    const need={};for(const x of lhs.split('+')){const [id,n]=amt(x);need[id]=n;}
    const [out,n]=amt(rhs);RECIPES[r.id].push({need,out,n});
  }
}
/* 아빠의 보부상 수첩: 쪽마다 줄을 표 순서대로. "(items.csv 의 설명)" 줄은 게임이 물건 설명으로 채운다 */
const NOTES=[];const byId={};
for(const r of notebook){
  let e=byId[r['쪽id']];
  if(!e){e=byId[r['쪽id']]={id:r['쪽id'],region:r['지역'],kind:r['종류']==='물건'?'item':'animal',lines:[]};NOTES.push(e);}
  if(r['비고'].includes('아빠 그림 있음'))e.dadDrawing=true;
  if(r['내용']==='(items.csv 의 설명)')continue;
  const l={who:r['쓴이']==='아빠'?'dad':'me',text:r['내용']};if(r['알게되는키'])l.when=r['알게되는키'];e.lines.push(l);
}
for(const e of NOTES)if(e.kind==='item'&&!ITEMS[e.id])fail('notebook.csv '+e.id+': 물건 쪽인데 items.csv 에 없다');

const out="'use strict';\n/* 자동으로 만든 파일이다. 직접 고치지 말고 design/data/*.csv 를 고친 뒤 node prototypes/web/tools/build-data.js 를 돌린다 */\nconst TABLES="+JSON.stringify({ITEMS,BOSS_PARTS,CALM,RECIPES,NOTES},null,1)+";\n";
if(process.argv.includes('--check')){
  const now=fs.existsSync(OUT)?fs.readFileSync(OUT,'utf8').replace(/\r\n/g,'\n'):'';
  if(now!==out){console.error('tables.js 가 표와 다르다. node prototypes/web/tools/build-data.js 를 돌려야 한다');process.exit(1);}
  console.log('tables.js 가 표와 맞는다');
}else{fs.writeFileSync(OUT,out);console.log('만들었다: '+path.relative(ROOT,OUT)+' (아이템 '+Object.keys(ITEMS).length+', 보스 '+Object.keys(BOSS_PARTS).length+', 가공법 '+Object.values(RECIPES).flat().length+', 수첩 '+NOTES.length+'쪽)');}
