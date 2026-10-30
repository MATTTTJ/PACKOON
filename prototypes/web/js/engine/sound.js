'use strict';
/* JSON의 층을 합성한 버퍼를 재사용한다. 첫 실제 입력 전에는 컨텍스트를 만들지 않는다.
   when은 AudioContext.currentTime과 같은 초 단위. group은 장단 예약음을 함께 끊는다. */
const Sound=(()=>{
  let ctx=null,master=null,attempted=false,enabled=true,volume='low',resuming=null,resumeEffect=null;
  let bgmVolume=.4,sfxVolume=.4,ambientKind=null,ambientVoice=null,pending=null,pendingTimer=null,warmTimer=null;
  const storageKey='packoon-sound-v1',maxVoices=24,maxCacheBytes=12*1024*1024;
  const cache=new Map(),sources=new Set(),groups=new Set(),last=new Map();
  let cacheBytes=0,lastEffect=-Infinity,peakVoices=0,played=0,dropped=0;
  const clamp=value=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
  try{const saved=JSON.parse(localStorage.getItem(storageKey));
    if(saved&&typeof saved.enabled==='boolean')enabled=saved.enabled;
    if(saved&&['low','high'].includes(saved.volume))volume=saved.volume;
    bgmVolume=sfxVolume=volume==='high'?.8:.4;
    if(saved&&Number.isFinite(saved.bgmVolume))bgmVolume=clamp(saved.bgmVolume);
    if(saved&&Number.isFinite(saved.sfxVolume))sfxVolume=clamp(saved.sfxVolume);
  }catch(_){}
  const hidden=()=>typeof document!=='undefined'&&document.hidden;
  const ready=()=>ctx&&enabled&&ctx.state==='running'&&!hidden();
  function stopAmbient(){if(ambientVoice){ambientVoice.stop();ambientVoice=null;}}
  function ambience(kind){
    ambientKind=kind;stopAmbient();
    if(!kind||!ready())return;
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);
    let seed=0x43a0d10;
    for(let i=0;i<data.length;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;data[i]=(seed>>>0)/2147483648-1;}
    source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=kind==='water'?900:320;gain.gain.value=.055;
    source.connect(filter);filter.connect(gain);gain.connect(master);source.start();
    ambientVoice={stop(){try{source.stop();}catch(_){}source.disconnect();filter.disconnect();gain.disconnect();}};
  }
  function releaseVoice(voice){
    if(!sources.has(voice))return;
    sources.delete(voice);if(voice.bus)voice.bus.voices.delete(voice.source);
    voice.source.disconnect();voice.gain.disconnect();
  }
  function stopVoices(){
    for(const voice of Array.from(sources)){try{voice.source.stop();}catch(_){}releaseVoice(voice);}
    for(const bus of Array.from(groups))bus.stop();
    pending=null;resumeEffect=null;
    if(pendingTimer!==null){clearTimeout(pendingTimer);pendingTimer=null;}
    if(warmTimer!==null){clearTimeout(warmTimer);warmTimer=null;}
  }
  function settingsChanged(){
    if(master){master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(enabled?sfxVolume:0,ctx.currentTime,.008);}
    if(!enabled){stopVoices();stopAmbient();}else if(ambientKind&&!ambientVoice)ambience(ambientKind);
    try{localStorage.setItem(storageKey,JSON.stringify({enabled,volume,bgmVolume,sfxVolume}));}catch(_){}
    dispatchEvent(new Event('packoon-sound-change'));
  }
  function toggle(){enabled=!enabled;settingsChanged();}
  function toggleVolume(){volume=volume==='low'?'high':'low';bgmVolume=sfxVolume=volume==='high'?.8:.4;settingsChanged();}
  function setBgmVolume(value){if(!Number.isFinite(value))return;bgmVolume=clamp(value);settingsChanged();}
  function setSfxVolume(value){if(!Number.isFinite(value))return;sfxVolume=clamp(value);settingsChanged();}
  function bufferFor(id){
    if(cache.has(id)){const hit=cache.get(id);cache.delete(id);cache.set(id,hit);return hit.buffer;}
    const data=globalThis.PackoonAudioData,dsp=globalThis.PackoonMusic&&globalThis.PackoonMusic.DSP;
    if(!data||!dsp||!ctx)return null;
    const definition=data.sfx.effects.find(effect=>effect.id===id);if(!definition)return null;
    const pcm=dsp.renderSfx(definition,data.instruments,{sampleRate:44100});
    const buffer=ctx.createBuffer(2,pcm.left.length,pcm.sampleRate);
    buffer.copyToChannel(pcm.left,0);buffer.copyToChannel(pcm.right,1);
    const bytes=pcm.left.byteLength+pcm.right.byteLength;
    while(cache.size&&(cacheBytes+bytes>maxCacheBytes||cache.size>=32)){
      const oldest=cache.keys().next().value;cacheBytes-=cache.get(oldest).bytes;cache.delete(oldest);
    }
    if(bytes<=maxCacheBytes){cache.set(id,{buffer,bytes});cacheBytes+=bytes;}
    return buffer;
  }
  function warmCommon(){
    if(warmTimer!==null||!ready())return;
    // 첫 장단 입력 때 합성 때문에 예약 시계가 밀리지 않도록 한 소리씩 준비한다.
    const ids=['rhythm_drum_low','rhythm_drum_high','rhythm_metal','rhythm_metal_bright','rhythm_click','rhythm_noise',
      'footstep_leaf','jump','land','dialog_next','sickle','pickup'].filter(id=>!cache.has(id));
    if(!ids.length)return;
    function next(){warmTimer=null;if(!ready())return;const id=ids.shift();if(id)bufferFor(id);if(ids.length)warmTimer=setTimeout(next,0);}
    warmTimer=setTimeout(next,0);
  }
  function unlock(e){
    if(!e.isTrusted||hidden())return;
    // 터치의 사용자 활성화는 손을 뗄 때 생긴다. 그 전에 resume()하면 미해결
    // Promise가 남아 다음 입력을 막으므로 활성화된 pointerup/click까지 기다린다.
    const activation=window.navigator&&window.navigator.userActivation;
    if(activation&&!activation.isActive&&(!ctx||ctx.state!=='running'))return;
    if(!attempted){attempted=true;const AC=window.AudioContext||window.webkitAudioContext;
      if(AC)try{ctx=new AC();master=ctx.createGain();master.gain.value=enabled?sfxVolume:0;master.connect(ctx.destination);}catch(_){} }
    if(ctx&&ctx.state==='suspended'&&!resuming){
      resuming=ctx.resume().then(()=>{
        if(ambientKind)ambience(ambientKind);
        const next=resumeEffect;resumeEffect=null;
        if(next&&ready())effect(next.key,next.cool,next.make);
        warmCommon();dispatchEvent(new Event('packoon-sound-change'));
      }).catch(()=>{resumeEffect=null;}).finally(()=>{resuming=null;});
    }else warmCommon();
  }
  addEventListener('pointerdown',unlock,true);addEventListener('pointerup',unlock,true);
  addEventListener('click',unlock,true);addEventListener('keydown',unlock,true);
  function group(){
    if(!ctx)return null;
    const out=ctx.createGain(),voices=new Set();out.gain.value=.65;out.connect(master);
    const bus={out,voices,stopped:false,stop(){
      if(this.stopped)return;this.stopped=true;
      for(const voice of Array.from(sources))if(voice.bus===this){try{voice.source.stop();}catch(_){}releaseVoice(voice);}
      voices.clear();out.disconnect();groups.delete(this);
    }};groups.add(bus);return bus;
  }
  function playSfx(id,settings={}){
    if(!ready()||(settings.group&&settings.group.stopped))return false;
    const buffer=bufferFor(id);if(!buffer)return false;
    // 층은 미리 한 버퍼로 섞으므로 층 수와 관계없이 한 발음만 쓴다.
    if(sources.size>=maxVoices){dropped++;return false;}
    const source=ctx.createBufferSource(),gain=ctx.createGain(),bus=settings.group||null;
    source.buffer=buffer;gain.gain.value=Number.isFinite(settings.gain)?Math.max(0,Math.min(3,settings.gain)):1;
    source.connect(gain);gain.connect(bus?bus.out:master);
    const voice={source,gain,bus};sources.add(voice);if(bus)bus.voices.add(source);
    peakVoices=Math.max(peakVoices,sources.size);source.onended=()=>releaseVoice(voice);
    source.start(Math.max(ctx.currentTime,Number.isFinite(settings.when)?settings.when:ctx.currentTime));played++;return true;
  }
  const noise=(t,v=.08,g)=>playSfx('rhythm_noise',{when:t,group:g,gain:v/.08});
  const drum=(t,v=.2,g,high=false)=>playSfx(high?'rhythm_drum_high':'rhythm_drum_low',{when:t,group:g,gain:v/.2});
  const metal=(t,v=.1,g,bright=false)=>playSfx(bright?'rhythm_metal_bright':'rhythm_metal',{when:t,group:g,gain:v/.1});
  const click=(t,v=.08,g)=>playSfx('rhythm_click',{when:t,group:g,gain:v/.08});
  // 효과음만 짧게 제한한다. 장단의 예약 재생은 이 쿨다운을 거치지 않는다.
  const priority={footstep:0,steam:1,paper:2,panel:3,tab:3,jump:4,land:4,swing:4,gather:5,forge:5,stone:5,yeongsan:5,item:6,exchange:7,craft:8,travel:9};
  function effect(key,cool,make){
    if(!ctx||!enabled||ambientKind||hidden())return;
    if(ctx.state!=='running'){if(resuming)resumeEffect={key,cool,make};return;}
    const now=ctx.currentTime;
    if(now-lastEffect<.018||now-(last.get(key)??-Infinity)<cool)return;
    if(pending){if(priority[key]>priority[pending.key])pending={key,make};return;}
    pending={key,make};pendingTimer=setTimeout(()=>{
      const next=pending;pending=null;pendingTimer=null;
      if(!ready()||ambientKind||!next)return;
      lastEffect=ctx.currentTime;last.set(next.key,lastEffect);next.make(lastEffect);
    },0);
  }
  const emit=(key,cool,id,gain=1)=>effect(key,cool,t=>playSfx(id,{when:t,gain}));
  function footstep(){
    const region=typeof G!=='undefined'&&G?G.region:null;
    const id={dolneomeo:'footstep_frost',jangteo:'footstep_market',yeongsan:'footstep_snow'}[region]||'footstep_leaf';
    emit('footstep',.28,id,.65);
  }
  const jump=()=>emit('jump',.15,'jump');
  const land=()=>emit('land',.15,'land');
  const swing=()=>emit('swing',.16,'sickle');
  const gather=ok=>emit('gather',.12,ok?'gather':'ui_unavailable');
  const item=()=>emit('item',.1,'pickup');
  const exchange=()=>emit('exchange',.1,'exchange');
  const paper=()=>emit('paper',.07,'dialog_next');
  const panel=opening=>emit('panel',.07,opening?'bag_open':'bag_close');
  const tab=()=>emit('tab',.07,'ui_focus');
  const craft=()=>emit('craft',.1,'craft_complete');
  const travel=()=>emit('travel',.3,'region_travel');
  function steam(kind){emit('steam',.08,'steamer',kind==='fan'?.45:kind==='lid'?.65:.5);}
  function forge(kind){emit('forge',.12,kind==='cold'||kind===false?'ui_unavailable':'forge_hit',kind==='edge'?1.15:.8);}
  function stone(kind){
    const id={tap:'mortar',place:'mill',edge:'stone_edge',fall:'stone_fall',sleep:'stone_sleep',wake:'stone_wake'}[kind===true?'tap':kind===false?'fall':kind];
    if(id)emit('stone',.12,id,.75);
  }
  function yeongsan(kind){
    const id={grass:'footstep_snow',cue:'ui_focus',scare:'battle_warn',relief:'battle_soothe',dad:'pickup'}[kind];
    if(id)emit('yeongsan',.04,id,.4);
  }
  /* 잎사귀 풀피리 (변신, forms.js): 짧게 떨며 오르는 소리를 바로 합성한다. 변신마다 높이만 다르다. */
  function leaf(form){
    if(!ready())return;
    const base={'':523,squirrel:784,goat:587,owl:440,deer:659}[form||'']||523,t=ctx.currentTime;
    const osc=ctx.createOscillator(),vib=ctx.createOscillator(),depth=ctx.createGain(),gain=ctx.createGain();
    osc.type='triangle';osc.frequency.setValueAtTime(base*.94,t);osc.frequency.linearRampToValueAtTime(base,t+.06);osc.frequency.linearRampToValueAtTime(base*1.06,t+.32);
    vib.frequency.value=7;depth.gain.value=base*.012;vib.connect(depth);depth.connect(osc.frequency);
    gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.16,t+.03);gain.gain.setValueAtTime(.16,t+.22);gain.gain.exponentialRampToValueAtTime(.001,t+.38);
    osc.connect(gain);gain.connect(master);osc.start(t);vib.start(t);osc.stop(t+.4);vib.stop(t+.4);
    osc.onended=()=>{osc.disconnect();vib.disconnect();depth.disconnect();gain.disconnect();};played++;
  }
  addEventListener('visibilitychange',()=>{
    if(hidden()){stopVoices();stopAmbient();}
    else{if(ambientKind)ambience(ambientKind);warmCommon();}
  });
  function getState(){return {initialized:attempted,enabled,bgmVolume,sfxVolume,contextState:ctx?ctx.state:null,
    voices:sources.size,peakVoices,maxVoices,cached:cache.size,cacheBytes,maxCacheBytes,played,dropped,ambient:!!ambientVoice};}
  return {get enabled(){return enabled;},get volume(){return volume;},get bgmVolume(){return bgmVolume;},get sfxVolume(){return sfxVolume;},
    toggle,toggleVolume,setBgmVolume,setSfxVolume,playSfx,getState,
    steam,footstep,jump,land,swing,gather,item,exchange,paper,panel,tab,craft,travel,forge,stone,yeongsan,leaf,
    ambience,get ambient(){return ambientKind;},get context(){return ctx;},get initialized(){return attempted;},group,click,drum,metal,noise};
})();
