'use strict';
/* 타이틀 장면 렌더러. packoon-layer-studio/src/studio-fragment.html 의 장면 코드를 그대로 옮겼다.
   그대로인 것: specs(그리기 순서·rect·full·kind), sourceRect, getCached(흐림 캐시, 보간 high), drawAsset, drawLayer(시차·구름·안개·낙엽·로고 식),
   낙엽 초기 배치와 updateLeaves, frame(1-exp(-elapsed*6) 보간, 배경색), resize(16:9, 640~1920, dpr 2까지).
   뺀 것: 편집기 UI, 저장 상태 복원, 단독 보기(체크무늬). 설정은 TITLE_DEFAULTS(scene-defaults.json)만 쓴다.
   더한 것: destroy() — 프레임 루프 취소, ResizeObserver 끊기, 이벤트 리스너 제거.
   자동 재생 없음: 만들 때 항상 정지 상태이고 setPlaying(true)를 불러야 움직인다 (움직임 중 눈의 불편함 보고가 있었음) */
function createTitleScene(sceneEl,canvas,loadingEl){
  const APPROVED=TITLE_DEFAULTS,META=TITLE_META,ASSETS=TITLE_ASSETS;
  const specs=[
   {id:'sky',name:'노을 하늘',type:'가장 먼 배경',rect:[-90,-190,2100,1280],full:true},
   {id:'clouds',name:'구름',type:'흐르는 하늘',kind:'cloud'},
   {id:'hills',name:'먼 산',type:'원경',rect:[-80,-20,2080,1170],full:true},
   {id:'sacred-tree',name:'당산나무',type:'중경 · 오른쪽',rect:[1200,5,760,850]},
   {id:'village',name:'초가와 물레방아',type:'중경 · 왼쪽',rect:[-25,340,755,670]},
   {id:'magpie',name:'까치',type:'하늘 위의 까치',rect:[1690,235,130,100]},
   {id:'ground',name:'숲길',type:'가까운 배경',rect:[-90,-15,2100,1185],full:true},
   {id:'fog',name:'안개',type:'흐르는 숲 안개',kind:'fog'},
   {id:'character',name:'팩쿤',type:'주인공',rect:[610,510,495,495]},
   {id:'foreground',name:'전경 나뭇가지',type:'가장 가까운 배경',rect:[-90,-45,2100,1180],full:true},
   {id:'leaf',name:'낙엽',type:'회전하며 떨어지는 낙엽',kind:'leaf'},
   {id:'logo',name:'PACKOON 로고',type:'천천히 떠 있는 타이틀',rect:[455,70,1010,220],kind:'logo'}
  ];
  const config={...APPROVED.config};
  let playing=false,destroyed=false;
  let loaded=false,time=0,last=0,cloudOffset=0,fogOffset=0,raf=0;
  let pointer={x:0,y:0},target={x:0,y:0};
  const ctx=canvas.getContext('2d',{alpha:false});
  const layers=specs.map(s=>({...s,...APPROVED.layers.find(l=>l.id===s.id),image:null,cached:null,cacheKey:''}));
  const leaves=Array.from({length:80},(_,i)=>({x:(Math.sin(i*127.1+2)*43758.5453%1+1)%1*2160-120,y:((i*137.51)%1240)-80,size:13+(i*17%22),phase:i*1.72,rotation:i*.83,speed:25+i*13%38,turn:(i%2?1:-1)*(.25+(i%5)*.08)}));

  /* 마우스·터치: 장면 영역에서만 받는다. 터치 스크롤은 막지 않는다 (CSS touch-action:pan-y) */
  const onMove=e=>{const r=canvas.getBoundingClientRect();target.x=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));target.y=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));};
  const onLeave=()=>{target={x:0,y:0};};
  const onUp=e=>{if(e.pointerType==='touch')target={x:0,y:0};};
  sceneEl.addEventListener('pointermove',onMove);sceneEl.addEventListener('pointerleave',onLeave);sceneEl.addEventListener('pointerup',onUp);

  function sourceRect(l){const m=META[l.id];return l.full?[0,0,l.image.naturalWidth,l.image.naturalHeight]:(m?.bounds||[0,0,l.image.naturalWidth,l.image.naturalHeight]);}
  function getCached(l){const key=l.blur+'|'+l.image.naturalWidth;if(l.cached&&l.cacheKey===key)return l.cached;const [sx,sy,sw,sh]=sourceRect(l);const maxWidth=l.id==='leaf'?128:l.id==='logo'?1200:1600;const scale=Math.min(1,maxWidth/sw);const box=l.rect||[0,0,l.kind==='cloud'?1700:l.kind==='fog'?2500:24,l.kind==='cloud'?195:l.kind==='fog'?260:24];const worldWidth=l.full?box[2]:Math.min(box[2]/sw,box[3]/sh)*sw;const blur=l.blur*sw*scale/worldWidth;const padding=Math.ceil(blur*3+2);const c=document.createElement('canvas');c.width=Math.round(sw*scale)+padding*2;c.height=Math.round(sh*scale)+padding*2;const cc=c.getContext('2d');cc.imageSmoothingEnabled=true;cc.imageSmoothingQuality='high';cc.filter=blur?'blur('+blur+'px)':'none';cc.drawImage(l.image,sx,sy,sw,sh,padding,padding,sw*scale,sh*scale);l.cached={canvas:c,padding,w:sw*scale,h:sh*scale};l.cacheKey=key;return l.cached;}
  function drawAsset(l,x,y,w,h,fit=false){const c=getCached(l);if(fit){const scale=Math.min(w/c.w,h/c.h);x+=(w-c.w*scale)/2;y+=h-c.h*scale;w=c.w*scale;h=c.h*scale;}const px=c.padding/c.w*w,py=c.padding/c.h*h;ctx.drawImage(c.canvas,x-px,y-py,w+2*px,h+2*py);}
  function drawLayer(l,dt){if(!l.visible)return;const dx=-pointer.x*l.depth*config.parallax*.34,dy=-pointer.y*l.depth*config.parallax*.22;ctx.save();ctx.globalAlpha=l.opacity;ctx.translate(dx,dy);
   if(l.kind==='cloud'){const span=2400,x=((cloudOffset%span)+span)%span-1400;for(let i=-1;i<=1;i++){drawAsset(l,x+i*span,195,1700,195,true);drawAsset(l,x+i*span+1200,70,1000,125,true);}}
   else if(l.kind==='fog'){const span=2500,x=((fogOffset%span)+span)%span-1500;for(let i=-1;i<=1;i++)drawAsset(l,x+i*span,680,2500,260,true);}
   else if(l.kind==='leaf'){for(let i=0;i<Math.round(config.leafCount);i++){const a=leaves[i];ctx.save();ctx.translate(a.x+Math.sin(time*1.05+a.phase)*24,a.y);ctx.rotate(a.rotation);ctx.scale(.45+.55*Math.abs(Math.cos(time*.8+a.phase)),1);drawAsset(l,-a.size/2,-a.size/2,a.size,a.size,true);ctx.restore();}}
   else{const r=[...l.rect];if(l.kind==='logo')r[1]+=Math.sin(time/config.floatPeriod*Math.PI*2)*config.floatAmp;drawAsset(l,...r,!l.full);}
   ctx.restore();}
  function updateLeaves(dt){if(!dt)return;for(let i=0;i<leaves.length;i++){const a=leaves[i];a.y+=dt*a.speed*config.leafSpeed;a.x+=dt*(config.wind+Math.sin(time*.6+a.phase)*15)*config.leafSpeed;a.rotation+=dt*a.turn*config.leafSpeed;if(a.y>1150){a.y=-70;a.x=(i*241+time*17)%2040-60;}if(a.x>2050)a.x=-100;if(a.x<-110)a.x=2040;}}
  function frame(now){if(destroyed)return;const elapsed=last?Math.min((now-last)/1000,.05):0;last=now;const dt=playing&&!document.hidden?elapsed:0;if(dt){time+=dt;cloudOffset+=dt*config.cloudSpeed;fogOffset+=dt*config.fogSpeed;updateLeaves(dt);}const ease=1-Math.exp(-elapsed*6);if(playing){pointer.x+=(target.x-pointer.x)*ease;pointer.y+=(target.y-pointer.y)*ease;}ctx.setTransform(canvas.width/1920,0,0,canvas.height/1080,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.fillStyle='#c48555';ctx.fillRect(0,0,1920,1080);if(loaded)for(const l of layers)drawLayer(l,dt);raf=requestAnimationFrame(frame);}
  function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);const w=Math.min(1920,Math.max(640,Math.round(r.width*dpr)));canvas.width=w;canvas.height=Math.round(w*9/16);}
  const ro=new ResizeObserver(resize);ro.observe(canvas);resize();
  if(loadingEl){loadingEl.hidden=false;loadingEl.textContent='가을 숲을 불러오고 있습니다.';loadingEl.removeAttribute('role');}
  const ready=Promise.all(layers.map(l=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{l.image=img;resolve();};img.onerror=()=>reject(new Error(l.name));img.src=ASSETS[l.id];})))
    .then(()=>{if(destroyed)return;loaded=true;if(loadingEl)loadingEl.hidden=true;})
    .catch(e=>{if(destroyed||!loadingEl)return;loadingEl.textContent=e.message+' 소재를 불러오지 못했습니다.';loadingEl.setAttribute('role','alert');});
  raf=requestAnimationFrame(frame);

  return {
    ready,
    isPlaying:()=>playing,
    /* 움직임 켜기·끄기. 끄면 장면 시간과 마우스 반응이 멈춘다 */
    setPlaying(on){playing=!!on;},
    destroy(){
      if(destroyed)return;destroyed=true;playing=false;
      cancelAnimationFrame(raf);ro.disconnect();
      sceneEl.removeEventListener('pointermove',onMove);sceneEl.removeEventListener('pointerleave',onLeave);sceneEl.removeEventListener('pointerup',onUp);
      for(const l of layers){l.image=null;l.cached=null;}   // 큰 그림을 메모리에서 놓는다 (다시 열면 브라우저 캐시에서 빨리 읽힌다)
    },
  };
}
