'use strict';

// Node 내장 WebSocket으로 CDP에 연결한다. npm 패키지와 사용자 Chrome 프로필은 쓰지 않는다.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {spawn, spawnSync} = require('node:child_process');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function chromePath() {
  const candidates = [process.env.CHROME_PATH, process.env.CHROME_BIN,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  for (const candidate of candidates) if (candidate && fs.existsSync(candidate)) return candidate;
  for (const command of ['chrome', 'google-chrome', 'chromium']) {
    const found = spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', [command], {encoding:'utf8', windowsHide:true});
    if (found.status === 0) return found.stdout.trim().split(/\r?\n/)[0];
  }
  throw new Error('Chrome 실행 파일을 찾지 못했다. CHROME_PATH에 실행 파일 경로를 지정한다.');
}

async function startServer(root) {
  const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
    '.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.wav':'audio/wav','.woff2':'font/woff2'};
  const server = http.createServer((req,res) => {
    let filename;
    try {
      filename = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
      const relative = path.relative(root, filename);
      if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('outside root');
    } catch (_) { res.writeHead(403); res.end(); return; }
    fs.readFile(filename, (error, data) => {
      if (error) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, {'Content-Type':types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control':'no-store'});
      res.end(data);
    });
  });
  await new Promise((resolve,reject) => { server.once('error',reject); server.listen(0,'127.0.0.1',resolve); });
  return {url:`http://127.0.0.1:${server.address().port}/prototypes/web/index.html`, close:() => new Promise(resolve => server.close(resolve))};
}

class Browser {
  constructor(proc, socket, session, outDir, url) {
    this.proc=proc; this.socket=socket; this.session=session; this.outDir=outDir; this.url=url;
    this.counter=0; this.pending=new Map(); this.listeners=new Map(); this.errors=[]; this.networkWarnings=[]; this.inputs=[];
    socket.addEventListener('message', e => {
      const m=JSON.parse(e.data);
      if (m.id) {
        const request=this.pending.get(m.id); if (!request) return;
        this.pending.delete(m.id); clearTimeout(request.timer);
        if (m.error) request.reject(new Error(`${request.method}: ${m.error.message}`)); else request.resolve(m.result || {});
      } else if (!m.sessionId || m.sessionId===this.session) {
        for (const listener of this.listeners.get(m.method)||[]) listener(m.params||{});
      }
    });
    socket.addEventListener('close', () => {
      for (const request of this.pending.values()) {clearTimeout(request.timer);request.reject(new Error('Chrome CDP 연결 종료'));}
      this.pending.clear();
    });
    this.on('Runtime.exceptionThrown', e => this.errors.push({kind:'exception',details:e.exceptionDetails,scene:this.scene}));
    this.on('Runtime.consoleAPICalled', e => {
      if(e.type==='error') this.errors.push({kind:'console',message:e.args.map(a=>a.value??a.description??a.type).join(' '),stack:e.stackTrace,scene:this.scene});
    });
    this.on('Network.loadingFailed', e => {
      const url=this.requests?.get(e.requestId)||'';
      const record={kind:'resource',url,message:e.errorText,scene:this.scene};
      if (url.startsWith(new URL(this.url).origin) && !url.endsWith('/favicon.ico')) this.errors.push(record);
      else this.networkWarnings.push(record);
    });
    this.requests=new Map();
    this.on('Network.requestWillBeSent', e=>this.requests.set(e.requestId,e.request.url));
    this.on('Network.responseReceived', e=>{
      const r=e.response;
      if(r.status>=400&&r.url.startsWith(new URL(this.url).origin)&&!r.url.endsWith('/favicon.ico'))
        this.errors.push({kind:'http',url:r.url,message:`HTTP ${r.status} ${r.statusText}`,scene:this.scene});
    });
  }
  on(method,listener) { if(!this.listeners.has(method))this.listeners.set(method,new Set());this.listeners.get(method).add(listener);return()=>this.listeners.get(method).delete(listener); }
  send(method,params={},browserLevel=false) {
    const id=++this.counter;
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error(`${method}: CDP 응답 30초 초과`));},30000);
      this.pending.set(id,{resolve,reject,timer,method});
      this.socket.send(JSON.stringify({id,method,params,...(!browserLevel?{sessionId:this.session}:{})}));
    });
  }
  async eval(expression) {
    const result=await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:false});
    if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
    if(result.result?.subtype==='error')throw new Error(result.result.description);
    return result.result?.value;
  }
  async navigate(url=this.url) {
    this.currentUrl=url;
    const result=await this.send('Page.navigate',{url});
    if(result.errorText)throw new Error(result.errorText);
    const deadline=Date.now()+20000;
    while(Date.now()<deadline) {
      try { if(await this.eval("document.readyState==='complete' && typeof G!=='undefined' && typeof REG!=='undefined'"))return; }catch(_){}
      await sleep(50);
    }
    throw new Error('게임 페이지 로드가 20초 안에 끝나지 않았다: '+url);
  }
  async reload() {return this.navigate(this.currentUrl||this.url);}
  async key(key,type='press') {
    if(key===' ')key='Space';
    const special={Space:[' ','Space',32],ArrowLeft:['ArrowLeft','ArrowLeft',37],ArrowRight:['ArrowRight','ArrowRight',39],ArrowUp:['ArrowUp','ArrowUp',38],ArrowDown:['ArrowDown','ArrowDown',40],Escape:['Escape','Escape',27],Enter:['Enter','Enter',13]};
    const letter=key.startsWith('Key')?key.slice(3).toLowerCase():key;
    const [value,code,keyCode]=special[key]||[letter,letter.length===1&&/[a-z]/i.test(letter)?'Key'+letter.toUpperCase():letter,letter.toUpperCase().charCodeAt(0)];
    if(type==='press'){await this.key(key,'keyDown');await this.key(key,'keyUp');return;}
    const eventType=type==='down'?'keyDown':type==='up'?'keyUp':type;
    this.inputs.push({type:eventType,key:value,scene:this.scene});
    await this.send('Input.dispatchKeyEvent',{type:eventType,key:value,code,windowsVirtualKeyCode:keyCode,nativeVirtualKeyCode:keyCode});
  }
  async point(selector) {
    const point=await this.eval(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('버튼 없음: '+${JSON.stringify(selector)});e.scrollIntoView({block:'center',inline:'center'});const r=e.getBoundingClientRect();if(!r.width||!r.height||e.disabled||getComputedStyle(e).visibility==='hidden'||e.closest('[hidden]'))throw Error('누를 수 없는 버튼: '+${JSON.stringify(selector)});return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    return point;
  }
  async click(selector) {
    const {x,y}=await this.point(selector);this.inputs.push({type:'click',selector,scene:this.scene});
    await this.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
    await this.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
  }
  async touch(selector) {
    const {x,y}=await this.point(selector);this.inputs.push({type:'touch',selector,scene:this.scene});
    await this.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    await this.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }
  wait(ms) {return sleep(ms);}
  async screenshot(filename) { const result=await this.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(filename,Buffer.from(result.data,'base64')); }
  async close() {
    fs.writeFileSync(path.join(this.outDir,'cdp-log.json'),JSON.stringify({errors:this.errors,networkWarnings:this.networkWarnings,inputs:this.inputs},null,2));
    try{await this.send('Browser.close',{},true);}catch(_){}
    this.socket.close();
    if(this.proc.exitCode===null) {
      await Promise.race([new Promise(resolve=>this.proc.once('exit',resolve)),sleep(3000)]);
      if(this.proc.exitCode===null)this.proc.kill();
    }
  }
}

async function launchBrowser({outDir,url}) {
  fs.mkdirSync(outDir,{recursive:true});
  const executable=chromePath(), profile=path.join(outDir,'profile');
  const args=['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking',
    '--disable-component-update','--disable-sync','--disable-dev-shm-usage','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',
    '--window-size=1280,720',`--user-data-dir=${profile}`,'about:blank'];
  // 작업 실행기의 Windows 자식 프로세스 제한과 CI 컨테이너에서 Chrome sandbox가 시작되지 않는다.
  // 새 프로필·루프백 HTTP·로컬 게임만 사용하는 이 시험 프로세스에 한정한다.
  args.unshift('--no-sandbox');
  const proc=spawn(executable,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});
  const log=fs.createWriteStream(path.join(outDir,'chrome.log'));let stderr='';
  const address=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Chrome DevTools 주소를 20초 안에 받지 못했다. chrome.log 확인')),20000);
    proc.once('error',e=>{clearTimeout(timer);reject(e);});
    proc.once('exit',code=>{clearTimeout(timer);reject(new Error('Chrome 시작 실패: '+code));});
    proc.stderr.on('data',chunk=>{log.write(chunk);stderr+=chunk;const match=stderr.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/\S+)/);if(match){clearTimeout(timer);resolve(match[1]);}});
  }).catch(e=>{proc.kill();log.end();throw e;});
  proc.once('exit',()=>log.end());
  const socket=new WebSocket(address);
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Chrome WebSocket 연결 10초 초과')),10000);
    socket.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});
    socket.addEventListener('error',e=>{clearTimeout(timer);reject(new Error('Chrome WebSocket 연결 실패: '+e.message));},{once:true});
    socket.addEventListener('close',()=>{clearTimeout(timer);reject(new Error('Chrome WebSocket 연결이 열리기 전에 종료됨'));},{once:true});
  }).catch(e=>{socket.close();proc.kill();throw e;});
  const browser=new Browser(proc,socket,null,outDir,url);
  try {
    const {targetId}=await browser.send('Target.createTarget',{url:'about:blank'},true);
    const {sessionId}=await browser.send('Target.attachToTarget',{targetId,flatten:true},true);browser.session=sessionId;
    await browser.send('Page.enable');await browser.send('Runtime.enable');await browser.send('Network.enable');
    await browser.send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
    // CI처럼 느린 환경을 흉내 낸다: QA_CPU_THROTTLE=4 면 CPU를 4배 느리게 (가끔 실패하는 검사 재현용)
    const throttle=Number(process.env.QA_CPU_THROTTLE||0);
    if(throttle>1)await browser.send('Emulation.setCPUThrottlingRate',{rate:throttle});
    browser.version=await browser.send('Browser.getVersion',{},true);
    await browser.navigate(url);return browser;
  }catch(e){await browser.close();throw e;}
}
module.exports={launchBrowser,startServer,chromePath};
