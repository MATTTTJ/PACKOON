#!/usr/bin/env node
'use strict';
/* 대사를 인물별로 모아 한 문서로 만든다. 인물 한 명의 말투와 인과를 지역을 넘어 이어 읽을 때 쓴다.
   사용법: node prototypes/web/tools/dialogue-by-character.js [출력 파일]  (기본: qa-out/dialogue-by-character.md)
   대사 검사(tools/qa/static.js)와 같은 방법으로 읽는다. 변수로만 만드는 대사는 빠질 수 있다. */
const fs=require('node:fs'),path=require('node:path');
const {parseDialogue,parseCsv}=require('./qa/static');
const root=path.resolve(__dirname,'../../..');
const out=path.resolve(root,process.argv[2]||'qa-out/dialogue-by-character.md');
const order=['galchamgol','dolneomeo','jangteo','yeongsan'];
const regionName={galchamgol:'단풍골',dolneomeo:'돌너머',jangteo:'큰 장터',yeongsan:'영산',engine:'공통'};
const npcs=parseCsv(fs.readFileSync(path.join(root,'design/data/npcs.csv'),'utf8').replace(/^﻿/,''));
const nameAt=npcs.shift().cells.indexOf('이름'),known=npcs.map(r=>r.cells[nameAt]).concat(['아빠','엄마','늙은 까치','산군 할아버지']);
const dir=path.join(root,'prototypes/web/js');
const files=[];
for(const sub of ['engine',...fs.readdirSync(path.join(dir,'regions')).map(r=>'regions/'+r)])
  for(const f of fs.readdirSync(path.join(dir,sub)).filter(f=>f.endsWith('.js')))files.push(sub+'/'+f);
const by=new Map();
for(const f of files){
  const region=f.startsWith('regions/')?f.split('/')[1]:'engine';
  for(const row of parseDialogue(fs.readFileSync(path.join(dir,f),'utf8'),{speakers:known}).rows){
    if(!row.speaker)continue;
    if(!by.has(row.speaker))by.set(row.speaker,[]);
    by.get(row.speaker).push({region,file:'prototypes/web/js/'+f,line:row.line,text:row.text,complete:row.complete});
  }
}
const rank=r=>{const i=order.indexOf(r);return i<0?9:i;};
const speakers=[...by.keys()].sort((a,b)=>by.get(b).length-by.get(a).length);
const md=['# 인물별 대사 (자동 생성)','',
  '`node prototypes/web/tools/dialogue-by-character.js`로 만든다. 고칠 때는 이 문서가 아니라 줄 번호의 코드 파일을 고친다.',
  '같은 함수 안의 갈래(조건에 따라 다른 줄)가 나란히 나온다. 실제 게임에서 한 번에 다 나오지 않는다.','',
  '| 인물 | 줄 수 |','|---|---|',...speakers.map(s=>`| ${s} | ${by.get(s).length} |`),''];
for(const s of speakers){
  md.push('## '+s,'');
  let last='';
  for(const r of by.get(s).sort((a,b)=>rank(a.region)-rank(b.region)||a.file.localeCompare(b.file)||a.line-b.line)){
    if(r.region!==last){md.push('### '+(regionName[r.region]||r.region),'');last=r.region;}
    md.push(`- ${r.text.replace(/\n/g,' / ')}${r.complete?'':' (일부 동적)'}  \`${r.file.replace('prototypes/web/js/','')}:${r.line}\``);
  }
  md.push('');
}
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,md.join('\n'));
console.log(path.relative(root,out)+' · 인물 '+speakers.length+'명, 대사 '+speakers.reduce((n,s)=>n+by.get(s).length,0)+'줄');
