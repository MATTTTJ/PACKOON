'use strict';
/* 회상 장면 재생기: 무대 전체를 덮는 움직이는 그림과 아래 자막.
   결정 D-1260 (사용자 지시 2026-11-08 33: 두루미의 아빠 이야기를 대화창 대신 크게 따로 보여 준다):
   - Cine.play(def, 끝나면) · def={id, title, sub, who, music, cuts:[{draw(c,s), lines:[{text, who?, cues?:[[초, 소리 id], ...]}]}]}
   - draw(c,s): c 는 240×135 그림판의 2d 문맥(R 도 이 판에 그린다). s={t:컷이 시작된 뒤 초, li:컷 안의 지금 줄, lt:그 줄이 뜬 뒤 초, n:컷 번호}
   - E·Enter·Space·클릭·터치·휴대폰 치기 단추: 다음 줄. 길게 누르기·Esc·건너뛰기 단추: 끝까지 건너뛴다
   - 장면 동안 들판은 멈춘다(미니게임으로 올라가 paused()가 참). 음악은 대화처럼 낮춘다(game.js 의 덕킹)
   - 맨 처음 제목 쪽지(title·sub)가 잠깐 뜨고, 컷이 바뀔 때는 먹빛으로 어두워졌다 밝아진다
   - 수첩에서 다시 볼 장면은 Cine.addReplay(쪽 id, {label, when, play}) 로 올린다(notebook.js 가 단추를 단다) */
const Cine=(()=>{
  const CW=240,CH=135;
  const tune=k=>TABLES.TUNING[k];
  let root=null,cv=null,g=null,cap=null,who=null,txt=null,card=null,bar=null,S=null,raf=0,registered=false;
  const swallow=new Set();   // 장면을 넘기거나 닫은 키: 손을 뗄 때까지 되풀이 입력을 게임에 넘기지 않는다
  const replays={};
  const STYLE=`
.cine{position:absolute;inset:0;z-index:22;background:#06070b;overflow:hidden;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none}
.cine-cv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;image-rendering:pixelated;image-rendering:crisp-edges}
.cine-cap{position:absolute;left:0;right:0;bottom:0;padding:1.6em 7% .9em;background:linear-gradient(180deg,rgba(6,7,11,0),rgba(6,7,11,.78) 40%);color:#efe6d6;text-align:center;font:clamp(11px,1.75vw,19px)/1.55 var(--display);pointer-events:none;text-shadow:0 1px 0 #000}
.cine-who{display:block;font-size:.68em;letter-spacing:.3em;color:#b9b0a0;margin-bottom:.15em}
.cine-text{margin:0;white-space:pre-line;word-break:keep-all;opacity:0;transform:translateY(3px);transition:opacity .55s ease,transform .55s ease}
.cine-text.on{opacity:1;transform:none}
.cine-card{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4em;color:#efe6d6;font-family:var(--display);opacity:0;transition:opacity .6s ease;pointer-events:none;text-align:center}
.cine-card.on{opacity:1}
.cine-card small{font-size:clamp(10px,1.4vw,14px);letter-spacing:.4em;color:#9d9486}
.cine-card b{font-size:clamp(16px,3vw,30px);font-weight:700;letter-spacing:.12em}
.cine-skip{position:absolute;right:1.6%;top:2.6%;z-index:2;font:clamp(10px,1.2vw,12px) var(--ui);background:rgba(18,16,14,.55);color:#e6dccb;border:1px solid rgba(160,148,130,.5);border-radius:3px;padding:3px 9px;cursor:pointer}
.cine-hint{position:absolute;left:1.6%;top:3.2%;font:clamp(9px,1.1vw,11px) var(--ui);color:rgba(230,220,203,.5);pointer-events:none}
.cine-bar{position:absolute;left:0;top:0;height:2px;width:0;background:#c9b98e;opacity:.85;pointer-events:none}
.note-replay{display:block;margin:6px auto 0;font:12px var(--ui);color:var(--meok);background:transparent;border:1px solid var(--meok);border-radius:3px;padding:2px 9px;cursor:pointer}
.note-replay::before{content:'▸ '}`;
  {const st=document.createElement('style');st.textContent=STYLE;document.head.appendChild(st);}
  function build(){
    if(root)return;
    root=el('div','cine');root.id='cine';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-label','회상 장면');
    cv=document.createElement('canvas');cv.width=CW;cv.height=CH;cv.className='cine-cv';g=cv.getContext('2d');g.imageSmoothingEnabled=false;
    cap=el('div','cine-cap');who=el('span','cine-who');txt=el('p','cine-text');cap.append(who,txt);cap.setAttribute('aria-live','polite');
    card=el('div','cine-card');
    const skip=el('button','cine-skip','건너뛰기');skip.type='button';
    skip.addEventListener('pointerdown',e=>e.stopPropagation());
    skip.addEventListener('click',e=>{e.stopPropagation();skipAll();});
    const hint=el('div','cine-hint',TOUCH?'누르면 다음 · 길게 누르면 건너뛰기':'E 다음 · 길게 누르거나 Esc 건너뛰기');
    bar=el('div','cine-bar');
    root.append(cv,card,cap,skip,hint,bar);
    $('stage').appendChild(root);
    root.addEventListener('pointerdown',e=>{if(!S)return;e.preventDefault();S.hold=performance.now();S.holdBy='pointer';});
    root.addEventListener('pointerup',e=>{if(!S||S.holdBy!=='pointer')return;e.preventDefault();release();});
    root.addEventListener('pointerleave',()=>{if(S&&S.holdBy==='pointer'){S.hold=0;S.holdBy=null;}});
    root.addEventListener('pointercancel',()=>{if(S){S.hold=0;S.holdBy=null;}});
  }
  // 게임 입력(input.js)보다 먼저 받는다. 장면이 떠 있는 동안은 소리 켜고 끄기(V) 말고는 게임에 넘기지 않는다
  const NEXT_KEYS=['e','enter',' ','j','x'];
  addEventListener('keydown',e=>{
    const k=(e.key||'').toLowerCase();
    if(!S){if(swallow.has(k)){e.preventDefault();e.stopPropagation();}return;}
    if(k==='v')return;
    e.preventDefault();e.stopPropagation();
    if(e.repeat)return;
    if(k==='escape'){skipAll();return;}
    if(NEXT_KEYS.includes(k)){swallow.add(k);S.hold=performance.now();S.holdBy=k;}
  },true);
  addEventListener('keyup',e=>{
    const k=(e.key||'').toLowerCase();
    if(S&&S.holdBy===k)release();
    swallow.delete(k);
  },true);
  function release(){const held=performance.now()-S.hold;S.hold=0;S.holdBy=null;bar.style.width='0';if(held<tune('cine_hold_skip_ms'))next();}
  function register(){
    if(registered)return;registered=true;
    // 휴대폰 조작판의 치기·점프 단추(input.js padAction)도 다음 줄로 넘긴다
    defineMinigame({id:'cine',step(){},hit(){if(S)next();},get music(){return S?S.def.music||null:null;}});
  }
  function showLine(){
    const L=S.def.cuts[S.cut].lines[S.li];
    who.textContent=L.who||S.def.who||'';
    txt.classList.remove('on');txt.textContent=L.text;void txt.offsetWidth;txt.classList.add('on');
    S.lineAt=performance.now();S.fired=new Set();
  }
  function play(def,onEnd){
    build();register();
    if(S)stop(false);
    S={def,onEnd:onEnd||null,owner:G,cut:0,li:0,phase:'card',at:performance.now(),cutAt:0,lineAt:0,fade:0,hold:0,holdBy:null,fired:new Set()};
    if(typeof releaseInputs==='function')releaseInputs();
    if(typeof closePanels==='function')closePanels();
    card.innerHTML='';
    if(def.sub)card.appendChild(el('small',null,def.sub));
    if(def.title)card.appendChild(el('b',null,def.title));
    card.classList.add('on');txt.classList.remove('on');txt.textContent='';who.textContent='';
    root.hidden=false;Sound.cue?.('cold_gong',0,.45);
    cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
  }
  function begin(){S.phase='play';S.cutAt=performance.now();card.classList.remove('on');showLine();}
  function next(){
    if(!S)return;
    const now=performance.now();
    if(S.phase==='card'){if(now-S.at>250)begin();return;}
    if(S.phase!=='play'||now-S.lineAt<tune('cine_line_min_ms'))return;
    const cut=S.def.cuts[S.cut];
    if(S.li<cut.lines.length-1){S.li++;showLine();Sound.paper?.();return;}
    S.phase=S.cut<S.def.cuts.length-1?'turn':'out';S.fade=now;txt.classList.remove('on');
  }
  function skipAll(){if(!S)return;S.phase='out';S.fade=performance.now()-tune('cine_fade_ms')*.6;txt.classList.remove('on');card.classList.remove('on');}
  function stop(callEnd){
    const s=S;S=null;cancelAnimationFrame(raf);
    if(root){root.hidden=true;bar.style.width='0';card.classList.remove('on');txt.classList.remove('on');}
    if(callEnd&&s&&s.onEnd&&s.owner===G)s.onEnd();
  }
  function frame(){
    if(!S)return;
    if(S.owner!==G){stop(false);return;}   // 새 게임·불러오기
    const now=performance.now(),fadeMs=Vfx.reducedMotion?1:tune('cine_fade_ms');
    if(S.phase==='card'&&now-S.at>tune('cine_card_ms'))begin();
    if(S.hold&&now-S.hold>tune('cine_hold_skip_ms')){S.hold=0;S.holdBy=null;skipAll();}
    bar.style.width=S.hold&&now-S.hold>150?Math.min(100,(now-S.hold)/tune('cine_hold_skip_ms')*100)+'%':'0';
    let dark=0;
    if(S.phase==='card')dark=1;
    else if(S.phase==='play')dark=Math.max(0,1-(now-S.cutAt)/fadeMs);
    else{
      dark=Math.min(1,(now-S.fade)/fadeMs);
      if(dark>=1){
        if(S.phase==='out'){stop(true);return;}
        S.cut++;S.li=0;S.phase='play';S.cutAt=now;showLine();dark=1;
      }
    }
    if(S.phase!=='card'){
      const cut=S.def.cuts[S.cut],L=cut.lines[S.li],s={t:(now-S.cutAt)/1000,li:S.li,lt:(now-S.lineAt)/1000,n:S.cut};
      for(const [at,id] of L.cues||[])if(s.lt>=at&&!S.fired.has(at+id)){S.fired.add(at+id);Sound.cue?.(id,0,.8);}
      g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,CW,CH);
      const saved=ctx;ctx=g;
      try{cut.draw(g,s);}finally{ctx=saved;}
      g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
    }else{g.fillStyle='#06070b';g.fillRect(0,0,CW,CH);}
    // 위아래 검은 띠
    g.fillStyle='#06070b';g.fillRect(0,0,CW,9);g.fillRect(0,CH-9,CW,9);
    if(dark>0){g.globalAlpha=dark;g.fillStyle='#06070b';g.fillRect(0,0,CW,CH);g.globalAlpha=1;}
    raf=requestAnimationFrame(frame);
  }
  function addReplay(id,r){replays[id]=r;}
  function replayFor(id){const r=replays[id];return r&&(!r.when||r.when())?r:null;}
  return {play,next,skip:skipAll,isOpen:()=>!!S,addReplay,replayFor,W:CW,H:CH,
    get state(){return S&&{id:S.def.id,cut:S.cut,li:S.li,phase:S.phase};}};   // QA 가 어디까지 흘렀는지 읽는다 (읽기만 한다)
})();
