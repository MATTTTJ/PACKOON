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
  if(!['','돌','얼음'].includes(r['재질']||''))fail('boss_parts.csv '+r['보스']+'.'+r['부위id']+': 재질은 빈칸·돌·얼음이어야 한다');
  if(r['재질'])p.material=r['재질']==='돌'?'stone':'ice';
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
  const profile={habit:r['손버릇기록'],habitKey:r['손버릇키'],fail:r['틀린조합반응']};
  if(!profile.habit||profile.habitKey!=='habit:'+r.id||!profile.fail)fail('heirlooms.csv '+r.id+': 손버릇 기록·키·틀린 조합 반응을 확인한다');
  for(const [key,col]of Object.entries({steps:'손맛횟수',intervalMs:'손맛간격ms',windowMs:'손맛여유ms',restMs:'손맛쉼ms',steamMs:'손맛김ms',dragPx:'손맛끌기px',turnDegrees:'손맛회전도'})){
    if(!/^\d+$/.test(r[col])||!Number.isSafeInteger(+r[col]))fail('heirlooms.csv '+r.id+': '+col+'은 0 이상의 정수여야 한다');
    profile[key]=+r[col];
  }
  if(profile.steps<1||profile.steps>8)fail('heirlooms.csv '+r.id+': 손맛횟수는 1~8이어야 한다');
  if(r.id==='jeolgu'&&(!(profile.intervalMs>0)||profile.windowMs>profile.intervalMs||profile.restMs<profile.intervalMs))fail('heirlooms.csv jeolgu: 박자 간격·여유·쉼을 확인한다');
  if(r.id==='siru'&&profile.steamMs<=profile.windowMs)fail('heirlooms.csv siru: 김이 오르는 시각은 판정 여유보다 커야 한다');
  if(r.id==='yakyeon'&&profile.dragPx<=0)fail('heirlooms.csv yakyeon: 손맛끌기px는 0보다 커야 한다');
  if(r.id==='maetdol'&&(profile.turnDegrees<=0||profile.turnDegrees>180))fail('heirlooms.csv maetdol: 손맛회전도는 1~180도여야 한다');
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
  if(!e){e=byId[r['쪽id']]={id:r['쪽id'],region:r['지역'],kind:r['종류']==='물건'?'item':r['종류']==='도장'?'stamp':'animal',lines:[]};if(e.kind==='stamp'||CRAFT[e.id])e.name=r['대상'];NOTES.push(e);}
  // 결정 D-61: '아빠 그림 있음'은 이제 아빠가 이름을 적어 둔 쪽이라는 뜻만 남는다(그림은 아이가 본 뒤에 그린다)
  if(r['비고'].includes('아빠 그림 있음'))e.dadDrawing=true;
  if(r['내용']==='(items.csv 의 설명)')continue;
  const l={who:r['쓴이']==='아빠'?'dad':'me',text:r['내용'],section};if(r['알게되는키'])l.when=r['알게되는키'];e.lines.push(l);
}
for(const e of NOTES)if(e.kind==='item'&&!ITEMS[e.id]&&!CRAFT[e.id])fail('notebook.csv '+e.id+': 물건 쪽인데 items.csv 또는 heirlooms.csv 에 없다');
for(const [tool,c]of Object.entries(CRAFT))if(!NOTES.some(e=>e.id===tool&&e.lines.some(l=>l.when===c.habitKey)))fail('notebook.csv: 손버릇 기록이 없다 '+tool);
for(const recipe of Object.values(RECIPES).flat().filter(r=>r.hidden))if(!NOTES.some(e=>e.id===recipe.out&&e.lines.some(l=>l.when===recipe.discover)))fail('notebook.csv: 숨은 가공법 발견 기록이 없다 '+recipe.out);

/* 좋아하는 맛: 인물·물건 한 쌍에 반응 하나. 효과는 기존 진정수치와 별도로 새 선물에만 쓴다. */
const TASTES={},npcIds=new Set(t('npcs').map(r=>r.id)),bossIds=new Set(bosses.map(r=>r.id));
for(const r of t('tastes')){
  const who=r['누가'],item=r['무엇'],kind=r['반응종류'],line=r['반응대사'],effect=r['효과'];
  if(!npcIds.has(who)&&!bossIds.has(who))fail('tastes.csv '+r.id+': NPC·보스 id가 아니다 '+who);
  if(!ITEMS[item])fail('tastes.csv '+r.id+': 물건 id가 없다 '+item);
  if(!['아주 좋아함','좋아함','그저 그럼','싫어함'].includes(kind)||!line)fail('tastes.csv '+r.id+': 반응 종류·대사를 확인한다');
  if(!/^(?:none|calm:(?:[1-9]\d?|100))$/.test(effect))fail('tastes.csv '+r.id+': 효과는 none / calm:1~100이어야 한다');
  if(effect.startsWith('calm:')&&(!bossIds.has(who)||!['아주 좋아함','좋아함'].includes(kind)))fail('tastes.csv '+r.id+': 진정 효과는 전투 상대가 좋아하는 맛에만 쓴다');
  if(TASTES[who]&&TASTES[who][item])fail('tastes.csv '+r.id+': 인물·물건 조합이 겹친다');
  (TASTES[who]||(TASTES[who]={}))[item]={kind,line,effect};
}
for(const id of npcIds){const n=Object.keys(TASTES[id]||{}).length;if(n<2||n>3)fail('tastes.csv: NPC마다 맛 반응이 2~3개 필요하다 '+id);}
for(const id of bossIds)if(Object.keys(TASTES[id]||{}).length<2)fail('tastes.csv: 전투 상대마다 맛 반응이 2개 이상 필요하다 '+id);
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
function numericTable(name,label,required){
  const file=path.join(DATA,name+'.csv'),source=fs.readFileSync(file,'utf8');
  if(source.charCodeAt(0)!==0xFEFF)fail(name+'.csv: UTF-8 BOM이 필요하다');
  const {head,rows}=read(file),columns=['id',label,'값이름','값','단위','설명','상태'];
  if(head.join(',')!==columns.join(','))fail(name+'.csv: 머리줄은 '+columns.join(',')+' 이어야 한다');
  const keys=required.split(/\s+/),expected=new Set(keys),values={};
  for(const [i,r] of rows.entries()){
    const where=name+'.csv '+(i+2)+'행 '+r.id;
    if(!/^[a-z][a-z_]*$/.test(r.id)||!expected.has(r.id))fail(where+': 알 수 없는 id');
    if(Object.hasOwn(values,r.id))fail(where+': id 중복');
    for(const key of columns)if(!r[key].trim())fail(where+': '+key+' 칸이 비어 있다');
    if(!['확정','제안','미정'].includes(r['상태']))fail(where+': 상태는 확정/제안/미정이어야 한다');
    const raw=r['값'].trim(),n=Number(raw);
    if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw)||!Number.isFinite(n))fail(where+': 값이 유한한 숫자가 아니다');
    if(r.id==='field_jump_velocity'?n>=0:n<0)fail(where+': 값의 부호가 올바르지 않다');
    if(['회','개','단계','인덱스','프레임','남은 프레임','ms','내구도'].includes(r['단위'])&&!Number.isInteger(n))fail(where+': 이 단위는 정수여야 한다');
    values[r.id]=n;
  }
  for(const id of keys)if(!Object.hasOwn(values,id))fail(name+'.csv: 필수 값 '+id+' 누락');
  return values;
}
const MINIGAMES=numericTable('minigames','미니게임',
  [
    'forge_heat forge_hits forge_help_misses forge_floor forge_help_floor',
    'forge_edge_width forge_cooling forge_help_cooling forge_reheat_wait forge_finish_wait',
    'forge_bonus_edges forge_relation forge_bonus_relation stack_phase stack_hits',
    'stack_zone stack_help_zone stack_help_misses stack_amplitude stack_amplitude_gain',
    'stack_speed stack_speed_gain stack_warning stack_edge_ratio stack_edge_lean',
    'stack_edge_wait stack_hit_wait stack_miss_wait stack_relation stack_perfect_relation',
    'steam_fire_start steam_band_min steam_band_max steam_max steam_target_frames',
    'steam_time_limit steam_wind_at steam_wind_frames steam_fire_decay steam_wind_decay',
    'steam_steam_follow steam_danger_steam steam_low_grace steam_danger_fire steam_danger_limit',
    'steam_danger_recovery steam_close_at steam_fan_cooldown steam_fan_power steam_finish_wait',
    'steam_high_steam steam_high_fire steam_low_hint_after steam_low_fire steam_voice_cooldown',
    'steam_relation rhythm_notes rhythm_good rhythm_perfect rhythm_scroll_speed',
    'rhythm_bonus_hits rhythm_start_delay rhythm_subbeat rhythm_intro_beats rhythm_parts',
    'rhythm_normal_gap rhythm_late_gap rhythm_normal_last rhythm_late_hint_delay rhythm_finish_delay',
    'rhythm_cooldown rhythm_stray_window rhythm_resume_delay rhythm_combo rhythm_relation rhythm_high_relation',
    'rhythm_note_one rhythm_note_two rhythm_note_three rhythm_note_four rhythm_note_five',
    'rhythm_note_six rhythm_note_seven rhythm_note_eight salg_graze salg_return_graze',
    'salg_moving salg_return_speed salg_active_distance salg_arrival_distance salg_grass_interval',
    'salg_risk_distance salg_grace salg_relief_frames salg_recovery salg_risk_limit',
    'salg_startle_frames salg_max_retreat salg_retreat salg_warning_frames salg_alert_frames',
    'salg_near_distance salg_near_graze salg_near_random dad_steps gather_help_misses',
    'gather_help_width gather_zone_start gather_zone_span gather_ring_period gather_ring_radius gather_just_window gather_cooldown',
    'gather_perfect_power gather_yield gather_perfect_bonus gather_root_hits gather_root_width',
    'gather_root_speed gather_ssari_hits gather_kkoe_hits gather_eoksae_hits gather_seogi_hits',
    'gather_darae_vine_hits gather_darae_vine_width gather_darae_vine_speed yut_needle_speed yut_nak_zone'
  ].join(' '));
const TUNING=numericTable('tuning','분류',
  [
    'kkubeogi_cycle kkubeogi_awake kkubeogi_cue field_move_speed field_swing_speed',
    'field_jump_velocity field_gravity field_fall_speed field_pickup_x field_pickup_y',
    'field_talk_distance field_dig_ahead field_dig_distance field_swing_frames field_swing_hit_at field_drop_frames',
    'field_crawl_frames',
    'field_hit_front field_hit_back field_hit_width field_dig_padding save_interval toast_frames peek_ms peek_fade_ms hint_range craft_auto_step_ms',
    'field_interact_y zone_transition_frames vista_pan_frames map_flight_ms map_landing_margin',
    'drop_arc_height drop_flight_frames drop_min_spacing drop_spread drop_bounce_height drop_bounce_frames',
    'pickup_range pickup_range_y pickup_motion_frames pickup_pull_frames',
    'battle_bare_speed battle_bare_cooldown battle_bare_radius',
    'battle_iframes battle_squirrel_speed battle_squirrel_cooldown battle_squirrel_radius',
    'battle_goat_speed battle_goat_cooldown battle_goat_radius battle_goat_damage_taken',
    'battle_owl_speed battle_owl_cooldown battle_owl_radius battle_owl_tell_lead',
    'battle_deer_speed battle_deer_cooldown battle_deer_radius battle_deer_iframes',
    'battle_base_damage battle_sharp_damage battle_pickaxe_bonus',
    'form_squirrel_speed form_climb_speed form_climb_reach form_goat_jump form_owl_glide_fall',
    'form_deer_speed form_deer_listen_range form_fx_frames stranger_trade_limit',
    'musoe_bonk_tell_first musoe_bonk_tell_last musoe_bonk_drop musoe_bonk_gap musoe_bonk_radius',
    'musoe_fire_cycle musoe_fire_warn musoe_fire_burn musoe_fire_radius musoe_fire_heat musoe_finale_bonks musoe_finale_gap musoe_finale_hold'
  ].join(' '));
/* 나눗셈·주기·배열 길이와 서로 맞물리는 판정은 실행 전에 확인한다. */
const requireValue=(ok,message)=>{if(!ok)fail(message);};
for(const [table,values] of [['minigames',MINIGAMES],['tuning',TUNING]]){
  for(const [id,n] of Object.entries(values)){
    if(/_(hits|frames|wait|cooldown|cycle|cue|steps|notes|parts|interval|target_frames|danger_limit|near_random)$/.test(id))requireValue(n>0,table+'.csv '+id+': 0보다 커야 한다');
  }
}
requireValue(MINIGAMES.steam_max>0&&MINIGAMES.steam_band_min<MINIGAMES.steam_band_max&&MINIGAMES.steam_band_max<=MINIGAMES.steam_max,'minigames.csv: 김 판정 범위와 상한을 확인한다');
requireValue(MINIGAMES.steam_wind_at<=MINIGAMES.steam_max,'minigames.csv: 외풍 시작이 진행 상한보다 크다');
requireValue(MINIGAMES.stack_zone<=1&&MINIGAMES.stack_help_zone<=1&&MINIGAMES.stack_edge_ratio<=1,'minigames.csv: 돌 쌓기 판정 비율은 1 이하여야 한다');
requireValue(MINIGAMES.forge_help_floor<MINIGAMES.forge_heat&&MINIGAMES.forge_floor<MINIGAMES.forge_heat,'minigames.csv: 쇠 식음 경계가 재가열한 열보다 낮아야 한다');
requireValue(MINIGAMES.rhythm_notes<=8&&MINIGAMES.rhythm_normal_last<MINIGAMES.rhythm_notes&&MINIGAMES.rhythm_bonus_hits<=MINIGAMES.rhythm_notes,'minigames.csv: 구현된 노트 수와 덤 기준을 확인한다');
const noteKeys=['one','two','three','four','five','six','seven','eight'];
for(let i=1;i<noteKeys.length;i++)requireValue(MINIGAMES['rhythm_note_'+noteKeys[i]]>MINIGAMES['rhythm_note_'+noteKeys[i-1]],'minigames.csv: 노트 시각은 순서대로 커져야 한다');
requireValue(MINIGAMES.dad_steps<=3,'minigames.csv: 구현된 몸짓은 세 단계까지다');
requireValue(TUNING.kkubeogi_awake<=TUNING.kkubeogi_cycle&&TUNING.kkubeogi_cue<=TUNING.kkubeogi_cycle,'tuning.csv: 꾸벅이 판정과 예고가 주기보다 길다');
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
requireValue(TUNING.battle_base_damage>0&&TUNING.battle_sharp_damage>=TUNING.battle_base_damage&&TUNING.battle_pickaxe_bonus>0,'tuning.csv: 전투 기본 피해·날 세운 피해·곡괭이 덤을 확인한다');
requireValue(MINIGAMES.yut_nak_zone>0&&MINIGAMES.yut_nak_zone<40&&MINIGAMES.yut_needle_speed>0,'minigames.csv: 윷 낙 구간은 0~40%, 바늘 속도는 0보다 커야 한다');
requireValue(MINIGAMES.rhythm_stray_window>=MINIGAMES.rhythm_good,'minigames.csv: 헛가위 범위는 맞음 판정 반폭 이상이어야 한다');
// 폭·속도 줄은 실제로 막대 판정을 쓰는 칡뿌리(낫 일 놀이)와 다래(영산 활동)만 둔다.
for(const id of ['root','darae_vine']){
  const width=MINIGAMES['gather_'+id+'_width'];
  requireValue(width>0&&width+MINIGAMES.gather_help_width<=MINIGAMES.gather_zone_span&&MINIGAMES.gather_zone_start+MINIGAMES.gather_zone_span<=100,'minigames.csv: '+id+' 채집 판정 범위가 막대를 벗어난다');
}

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
const out="'use strict';\n/* 자동으로 만든 파일이다. 직접 고치지 말고 design/data/*.csv 를 고친 뒤 node prototypes/web/tools/build-data.js 를 돌린다 */\nconst TABLES="+JSON.stringify({ITEMS,BOSS_PARTS,CALM,RECIPES,CRAFT,TASTES,NOTES,MINIGAMES,TUNING,PROGRESS,ZONES,STOCK,HAGGLE,SCENE_MUSIC},null,1)+";\n";
if(process.argv.includes('--check')){
  const now=fs.existsSync(OUT)?fs.readFileSync(OUT,'utf8').replace(/\r\n/g,'\n'):'';
  if(now!==out){console.error('tables.js 가 표와 다르다. node prototypes/web/tools/build-data.js 를 돌려야 한다');process.exit(1);}
  console.log('tables.js 가 표와 맞는다');
}else{fs.writeFileSync(OUT,out);console.log('만들었다: '+path.relative(ROOT,OUT)+' (아이템 '+Object.keys(ITEMS).length+', 보스 '+Object.keys(BOSS_PARTS).length+', 가공법 '+Object.values(RECIPES).flat().length+', 수첩 '+NOTES.length+'쪽)');}
