#!/usr/bin/env node
'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const {launchBrowser,startServer}=require('./browser');
const root=path.resolve(__dirname,'../../../..');
const names=['syntax','data','versions','csv','dialogue','play-expanded','play-classic','speakers','edges','save','mobile'];
const staticNames=names.slice(0,5);
const args=process.argv.slice(2);
let quick=false,only=null;
for(let i=0;i<args.length;i++) {
  if(args[i]==='--quick')quick=true;
  else if(args[i]==='--only'&&args[i+1])only=args[++i].split(',');
  else if(args[i]==='--help'||args[i]==='-h') {
    console.log('사용법: node prototypes/web/tools/qa/run.js [--quick] [--only 이름]');
    console.log('검사 이름: '+names.join(', ')+' (묶음: static, runtime)');process.exit(0);
  } else {console.error('알 수 없는 인자: '+args[i]);process.exit(1);}
}
if(only)only=only.flatMap(n=>n==='static'?staticNames:n==='runtime'?names.slice(5):[n]);
if(only?.some(n=>!names.includes(n))){console.error('알 수 없는 검사 이름. --help로 목록을 확인한다.');process.exit(1);}
const selected=new Set(only||names);
if(quick)for(const name of names.slice(5))selected.delete(name);
if(!selected.size){console.error('선택한 검사가 없다. --quick은 정적 검사에만 쓴다.');process.exit(1);}

const outBase=path.join(root,'qa-out');fs.mkdirSync(outBase,{recursive:true});
const outDir=fs.mkdtempSync(path.join(outBase,new Date().toISOString().replace(/[:.]/g,'-')+'-'));
const started=Date.now(),results=[];
const relative=p=>path.relative(root,p).split(path.sep).join('/');
let rules,configError;
try { rules=JSON.parse(fs.readFileSync(path.join(__dirname,'rules.json'),'utf8')); }
catch(error){configError=new Error('prototypes/web/tools/qa/rules.json 읽기 실패: '+error.message);}
let server;
let activeBrowser;
function git(...args){try{return execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true}).trim();}catch(_){return '확인 못 함';}}
const metadata={commit:git('rev-parse','HEAD'),mainCommit:git('rev-parse','main'),branch:git('branch','--show-current'),dirty:git('status','--short'),
  qaFiles:Object.fromEntries(fs.readdirSync(__dirname).filter(f=>/\.(js|json)$/.test(f)).sort().map(f=>[f,createHash('sha256').update(fs.readFileSync(path.join(__dirname,f))).digest('hex')])),
  node:process.version,platform:process.platform,startedAt:new Date(started).toISOString(),
  viewport:{width:1280,height:720},mobileViewport:{width:390,height:844},
  input:'CDP 키보드·마우스·터치',storage:'검사마다 qa-out 아래 새 프로필. HTTP 출처 유지.',selected:[...selected]};

function add(result) {
  result.findings ||= [];
  if(!['pass','fail','warn','skip'].includes(result.status))throw Error('검사 결과 status 오류: '+result.name);
  results.push(result);
  console.log(`[${{pass:'통과',fail:'실패',warn:'경고',skip:'미확인'}[result.status]}] ${result.name}: ${result.summary}`);
  for(const f of result.findings)console.log(`  - ${f.file||f.scene||'장면 확인'}${f.line?':'+f.line:''}: ${f.message}`);
}
function failure(name,error) {return {name,status:'fail',summary:error.message,findings:[{rule:'runner',severity:'높음',message:error.stack||String(error),file:relative(path.join(__dirname,name.startsWith('play')?'playthrough.js':'runtime-checks.js'))}]};}
function saveReports() {
  const failures=results.filter(r=>r.status==='fail'),warnings=results.filter(r=>r.status==='warn');
  const report={metadata:{...metadata,durationSeconds:+((Date.now()-started)/1000).toFixed(2),outDir:relative(outDir)},
    status:failures.length?'fail':'pass',results,
    limitations:['실제 휴대폰·소리·조작감·서사 개연성은 사람이 확인해야 한다.',
      '옛 버전 실저장 호환은 검증하지 않는다. 이번 저장 검사는 현재 버전 왕복과 손상 JSON이다.',
      '화자 검사는 실행한 대화 줄의 현재 구역 배치만 증명한다. 선택 분기 전체를 통과했다고 보지 않는다.']};
  const md=[`# 자동 검수 결과: ${failures.length?'실패':'통과'}`,'',
    `- 대상: \`${metadata.commit}\` (${metadata.branch})`,
    `- 환경: Node ${metadata.node}, ${metadata.platform}, ${metadata.chrome||'브라우저 미사용'}`,
    `- 실행 URL: ${metadata.url||'정적 검사'}`,
    `- 화면·입력: 1280×720 키보드/마우스, 휴대폰 검사 390×844 터치 에뮬레이션`,
    `- 시작 저장: 검사마다 새 격리 프로필. 저장 시험만 같은 출처·프로필에서 새로고침.`,
    `- 소요 시간: ${report.metadata.durationSeconds}초`,
    `- 실패 ${failures.length}개 검사, 경고 ${warnings.length}개 검사`,'',
    '| 검사 | 판정 | 결과 |','|---|---|---|',
    ...results.map(r=>`| ${r.name} | ${{pass:'통과',fail:'실패',warn:'경고',skip:'미확인'}[r.status]} | ${r.summary.replace(/\|/g,'\\|').replace(/\n/g,' ')} |`),''];
  for(const r of results)if(r.findings.length) {
    md.push(`## ${r.name}`,'');
    for(const f of r.findings) {
      md.push(`- **${f.severity||'검토'}** ${f.file||f.scene||r.name}${f.line?':'+f.line:''}: ${f.message}`);
      if(f.expected)md.push(`  기대: ${typeof f.expected==='string'?f.expected:JSON.stringify(f.expected)}`);
      if(f.actual)md.push(`  실제: ${typeof f.actual==='string'?f.actual:JSON.stringify(f.actual)}`);
      if(f.steps)md.push(...f.steps.map((s,i)=>`  ${i+1}. ${typeof s==='string'?s:JSON.stringify(s)}`));
      if(f.evidence)md.push(`  증거: ${typeof f.evidence==='string'?f.evidence:JSON.stringify(f.evidence)}`);
      if(f.reproductions)md.push(`  재현 횟수: ${f.reproductions}`);
    }
    md.push('');
  }
  md.push('## 미확인 범위','',...report.limitations.map(s=>'- '+s),'');
  fs.writeFileSync(path.join(outDir,'report.json'),JSON.stringify(report,null,2));
  fs.writeFileSync(path.join(outDir,'report.md'),md.join('\n'));
  fs.writeFileSync(path.join(outBase,'latest.json'),JSON.stringify(report,null,2));
  fs.writeFileSync(path.join(outBase,'latest.md'),md.join('\n'));
  console.log(`결과: ${relative(path.join(outDir,'report.md'))} (${report.metadata.durationSeconds}초)`);
  process.exitCode=failures.length?1:0;
}
async function withBrowser(name,fn) {
  const directory=path.join(outDir,name);fs.mkdirSync(directory,{recursive:true});
  let browser;
  try {
    browser=await launchBrowser({outDir:directory,url:server.url});activeBrowser=browser;browser.scene=name;
    metadata.chrome=browser.version.product;
    const result=await fn(browser,directory);
    if(browser.errors.length) {
      result.status='fail';result.findings||=[];
      result.summary+=`; 콘솔·예외·로컬 로드 오류 ${browser.errors.length}건`;
      result.findings.push(...browser.errors.map(e=>({rule:'console',severity:'높음',scene:e.scene||name,
        message:e.message||e.details?.exception?.description||e.details?.text||JSON.stringify(e),actual:e,evidence:relative(path.join(directory,'cdp-log.json'))})));
    }
    if(browser.networkWarnings.length)result.networkWarnings=browser.networkWarnings;
    return result;
  }catch(error){return failure(name,error);}
  finally {if(browser)await browser.close();activeBrowser=null;}
}

const watchdog=setTimeout(async()=>{
  add(failure('timeout',new Error('전체 검사가 19분을 넘었다. 마지막 목표와 CDP 로그를 확인한다.')));
  saveReports();if(activeBrowser)activeBrowser.proc.kill();if(server)server.close();process.exit(1);
},19*60*1000);

(async()=>{
  if(configError)throw configError;
  const {runStatic}=require('./static');
  for(const result of await runStatic({root,rules,only:selected}))add(result);
  if([...selected].some(n=>!staticNames.includes(n))) {
    server=await startServer(root);metadata.url=server.url;
    const {installHooks,collectHookFindings}=require('./hooks');
    const {runEdges,runSave,runMobile}=require('./runtime-checks');
    const hookEvidence=[];
    for(const mode of ['expanded','classic']) {
      const name='play-'+mode;
      if(!selected.has(name)&&!selected.has('speakers')&&!(mode==='expanded'&&selected.has('edges')))continue;
      const result=await withBrowser(name,async(browser,directory)=>{
        const {runPlaythrough}=require('./playthrough');
        await browser.navigate(server.url+(mode==='classic'?'?classic=1':''));
        await installHooks(browser,rules);
        fs.writeFileSync(path.join(directory,'start.html'),await browser.eval('document.documentElement.outerHTML'));
        await browser.screenshot(path.join(directory,'start.png'));
        const result=await runPlaythrough({browser,mode,outDir:directory,rules,report:message=>console.log(`[${name}] ${message}`)});
        const hook=await collectHookFindings(browser);
        hookEvidence.push({mode,...hook});
        fs.writeFileSync(path.join(directory,'hooks.json'),JSON.stringify(hook,null,2));
        if((hook.speakers||[]).length){result.status='fail';result.summary+=`; 화자 위치 위반 ${hook.speakers.length}건`;result.findings.push(...hook.speakers);}
        for(const finding of result.findings) {
          finding.reproductions||='이번 실행 1회';
          finding.evidence||={trace:relative(path.join(directory,mode+'-trace.json')),...(finding.screenshot?{screenshot:relative(path.join(directory,finding.screenshot))}:{})};
        }
        await browser.screenshot(path.join(directory,'final.png'));
        return {...result,name};
      });
      add(result);
    }
    if(selected.has('speakers')) {
      const findings=hookEvidence.flatMap(h=>(h.findings||h.speakers||[]).map(f=>({...f,mode:h.mode})));
      const count=hookEvidence.reduce((sum,h)=>sum+(h.lines?.length||h.lineCount||0),0);
      add({name:'speakers',status:findings.length||!count?'fail':'pass',summary:`실행 대사 ${count}줄, 화자 위치 위반 ${findings.length}건`,findings});
    }
    if(selected.has('edges'))add(await runEdges({outDir,rules,evidence:hookEvidence}));
    if(selected.has('save'))add(await withBrowser('save',(browser,directory)=>runSave({browser,outDir:directory,rules})));
    if(selected.has('mobile'))add(await withBrowser('mobile',(browser,directory)=>runMobile({browser,outDir:directory,rules})));
  }
})().catch(error=>add(failure('runner',error))).finally(async()=>{
  clearTimeout(watchdog);if(server)await server.close();saveReports();
});
