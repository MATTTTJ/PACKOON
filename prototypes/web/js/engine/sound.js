'use strict';
/* 짧은 합성음. 로드할 때는 무음이며 첫 실제 키/포인터 입력에서만 컨텍스트를 만든다.
   when은 AudioContext.currentTime과 같은 초 단위. group은 한 게임의 소리를 함께 끊는 용도. */
const Sound=(()=>{
  let ctx=null,master=null,attempted=false,enabled=true,volume='low';
  const storageKey='packoon-sound-v1';
  try{const saved=JSON.parse(localStorage.getItem(storageKey));
    if(saved&&typeof saved.enabled==='boolean')enabled=saved.enabled;
    if(saved&&['low','high'].includes(saved.volume))volume=saved.volume;
  }catch(_){}
  function settingsChanged(){
    if(master){master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(enabled?(volume==='high'?0.8:0.4):0,ctx.currentTime,0.008);}
    try{localStorage.setItem(storageKey,JSON.stringify({enabled,volume}));}catch(_){}
    dispatchEvent(new Event('packoon-sound-change'));
  }
  function toggle(){enabled=!enabled;settingsChanged();}
  function toggleVolume(){volume=volume==='low'?'high':'low';settingsChanged();}
  function unlock(e){
    if(!e.isTrusted)return;
    if(!attempted){attempted=true;const AC=window.AudioContext||window.webkitAudioContext;
      if(AC)try{ctx=new AC();master=ctx.createGain();master.gain.value=enabled?(volume==='high'?0.8:0.4):0;master.connect(ctx.destination);}catch(_){} }
    if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});
  }
  addEventListener('pointerdown',unlock,true);addEventListener('keydown',unlock,true);
  function group(){
    if(!ctx)return null;
    const out=ctx.createGain(),voices=new Set();out.gain.value=0.65;out.connect(master);
    return {out,voices,stopped:false,stop(){
      if(this.stopped)return;this.stopped=true;
      voices.forEach(s=>{try{s.stop();}catch(_){} });voices.clear();out.disconnect();
    }};
  }
  function play(when,duration,volume,freq,endFreq,type,g,noise=false,filterType='highpass',attack=0.003){
    if(!ctx||!enabled||ctx.state!=='running'||(g&&g.stopped))return;
    const t=Math.max(when,ctx.currentTime),amp=ctx.createGain();
    amp.gain.setValueAtTime(0.0001,t);amp.gain.exponentialRampToValueAtTime(Math.max(0.0001,volume),t+attack);amp.gain.exponentialRampToValueAtTime(0.0001,t+duration);
    amp.connect(g?g.out:master);
    let s;
    if(noise){s=ctx.createBufferSource();const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate);
      const data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;s.buffer=b;
      const filter=ctx.createBiquadFilter();filter.type=filterType;filter.frequency.value=freq;
      s.connect(filter);filter.connect(amp);s.onended=()=>{s.disconnect();filter.disconnect();amp.disconnect();if(g)g.voices.delete(s);};
    }else{s=ctx.createOscillator();s.type=type;s.frequency.setValueAtTime(freq,t);
      s.frequency.exponentialRampToValueAtTime(endFreq,t+duration);s.connect(amp);
      s.onended=()=>{s.disconnect();amp.disconnect();if(g)g.voices.delete(s);};}
    if(g)g.voices.add(s);s.start(t);s.stop(t+duration+0.01);
  }
  const noise=(t,v=0.08,g)=>play(t,0.045,v,1700,1700,'sine',g,true);
  const drum=(t,v=0.2,g,high=false)=>play(t,0.22,v,high?210:135,high?85:48,'sine',g);
  function metal(t,v=0.1,g,bright=false){
    [1,1.47,2.09].forEach((r,i)=>play(t,bright?0.13:0.075,v/(i+2),1850*r,1550*r,'sine',g));
    noise(t,v*0.35,g);
  }
  const click=(t,v=0.08,g)=>play(t,0.025,v,950,380,'triangle',g);
  // 효과음만 짧게 제한한다. 장단의 예약 재생은 이 쿨다운을 거치지 않는다.
  const last=new Map();let lastEffect=-Infinity,pending=null;
  const priority={footstep:0,steam:1,paper:2,panel:3,tab:3,jump:4,land:4,swing:4,gather:5,forge:5,stone:5,yeongsan:5,item:6,exchange:7,craft:8,travel:9};
  function effect(key,cool,make){
    if(!ctx||!enabled||ctx.state!=='running')return;
    const now=ctx.currentTime;
    if(now-lastEffect<0.018||now-(last.get(key)??-Infinity)<cool)return;
    // 대화 선택 직후의 교환처럼 한 입력에서 겹치는 소리는 중요한 것 하나만 낸다.
    if(pending){if(priority[key]>priority[pending.key])pending={key,make};return;}
    pending={key,make};
    setTimeout(()=>{
      const next=pending;pending=null;
      if(!ctx||!enabled||ctx.state!=='running')return;
      lastEffect=ctx.currentTime;last.set(next.key,lastEffect);next.make(lastEffect);
    },0);
  }
  const tone=(t,d,v,f,end=f,type='sine')=>play(t,d,v,f,end,type);
  const softNoise=(t,d,v,f)=>play(t,d,v,f,f,'sine',null,true,'lowpass');
  function steam(kind){effect('steam',0.08,t=>{
    const lid=kind==='lid',fan=kind==='fan',d=fan?0.16:lid?0.08:0.12;
    play(t,d,lid?0.035:0.025,fan?900:lid?420:150,lid?170:65,lid?'triangle':'sine',null,fan,'lowpass',0.01);
  });}
  const footstep=()=>effect('footstep',0.28,t=>{softNoise(t,0.045,0.025,480);tone(t,0.055,0.025,100,65);});
  const jump=()=>effect('jump',0.15,t=>tone(t,0.11,0.05,170,320,'triangle'));
  const land=()=>effect('land',0.15,t=>{tone(t,0.09,0.055,125,55);softNoise(t,0.06,0.025,650);});
  const swing=()=>effect('swing',0.16,t=>softNoise(t,0.09,0.045,1100));
  const gather=ok=>effect('gather',0.12,t=>{tone(t,0.1,0.045,ok?360:170,ok?540:95,'triangle');softNoise(t,0.04,0.02,700);});
  const item=()=>effect('item',0.1,t=>{tone(t,0.09,0.045,330,440);tone(t+0.055,0.12,0.03,550);});
  const exchange=()=>effect('exchange',0.1,t=>{tone(t,0.1,0.045,330);tone(t+0.065,0.13,0.04,495);});
  const paper=()=>effect('paper',0.07,t=>softNoise(t,0.055,0.025,950));
  const panel=opening=>effect('panel',0.07,t=>{softNoise(t,0.07,0.025,650);tone(t,0.08,0.03,opening?210:310,opening?310:180,'triangle');});
  const tab=()=>effect('tab',0.07,t=>tone(t,0.045,0.025,290,370,'triangle'));
  const craft=()=>effect('craft',0.1,t=>[262,330,392].forEach((f,i)=>tone(t+i*0.06,0.17,0.04,f)));
  const travel=()=>effect('travel',0.3,t=>{softNoise(t,0.16,0.025,700);tone(t,0.18,0.045,196,294);tone(t+0.09,0.18,0.025,392);});
  function forge(kind){effect('forge',0.12,t=>{
    const cold=kind==='cold'||kind===false,strong=kind==='edge';
    const duration=cold?.08:strong?.55:.32;
    [1,2.76,5.4].forEach((ratio,i)=>play(t,duration,(cold?.025:strong?.085:.06)/(i+1),(cold?310:730)*ratio,(cold?310:730)*ratio,'sine'));
  });}
  function stone(kind){effect('stone',0.12,t=>{
    const n={tap:[180,72,.12],edge:[135,52,.26],fall:[110,38,.22],sleep:[160,100,.22],wake:[240,360,.16]}[kind===true?'tap':kind===false?'fall':kind];
    if(n)play(t,n[2],.09,n[0],n[1],'sine',null,false,'highpass',.012);
  });}
  function yeongsan(kind){effect('yeongsan',0.04,t=>{
    const n={grass:[180,130,.045],cue:[520,430,.06],scare:[680,330,.13],relief:[290,380,.14],dad:[260,320,.16]}[kind];
    if(n)play(t,n[2],.025,n[0],n[1],'sine',null,false,'highpass',.01);
  });}
  return {get enabled(){return enabled;},get volume(){return volume;},toggle,toggleVolume,
    steam,footstep,jump,land,swing,gather,item,exchange,paper,panel,tab,craft,travel,forge,stone,yeongsan,
    get context(){return ctx;},get initialized(){return attempted;},group,click,drum,metal,noise};
})();
