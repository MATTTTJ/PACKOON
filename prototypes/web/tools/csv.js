// CSV 읽고 쓰기 (엑셀용 UTF-8 BOM, 따옴표 칸, CRLF). 외부 패키지 없이 node 만으로 돈다
'use strict';
const fs=require('fs');
function parse(text){
  const s=text.replace(/^﻿/,'');const rows=[];let cur=[],fld='',q=false;
  for(let i=0;i<s.length;i++){const ch=s[i];
    if(q){if(ch==='"'){if(s[i+1]==='"'){fld+='"';i++;}else q=false;}else fld+=ch;}
    else if(ch==='"')q=true;else if(ch===','){cur.push(fld);fld='';}
    else if(ch==='\n'){cur.push(fld.replace(/\r$/,''));rows.push(cur);cur=[];fld='';}
    else fld+=ch;}
  if(fld!==''||cur.length){cur.push(fld.replace(/\r$/,''));rows.push(cur);}
  return rows.filter(r=>r.some(c=>c!==''));
}
/* 머리줄을 이름으로 쓰는 객체 배열 */
function read(file){const [head,...rows]=parse(fs.readFileSync(file,'utf8'));return {head,rows:rows.map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]??''])))};}
function write(file,head,rows){
  const q=v=>{v=String(v??'');return /[",\r\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
  fs.writeFileSync(file,'﻿'+[head,...rows.map(r=>head.map(h=>r[h]))].map(r=>r.map(q).join(',')).join('\r\n')+'\r\n');
}
module.exports={parse,read,write};
