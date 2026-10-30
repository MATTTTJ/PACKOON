#!/usr/bin/env node
'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {selfTestStatic}=require('./static');
const root=path.resolve(__dirname,'../../../..');
try {
  const result=selfTestStatic({root,rules:JSON.parse(fs.readFileSync(path.join(__dirname,'rules.json'),'utf8'))});
  console.log(result.summary);
  console.log('결과: qa-out/static-self-test.json');
}catch(error){console.error(error.stack||error.message);process.exitCode=1;}
