'use strict';
/* 짧은 합성음. 로드할 때는 무음이며 첫 실제 키/포인터 입력에서만 컨텍스트를 만든다.
   when은 AudioContext.currentTime과 같은 초 단위. group은 한 게임의 소리를 함께 끊는 용도. */
const Sound=(()=>{
  let ctx=null,attempted=false;
  function unlock(e){
    if(!e.isTrusted)return;
    if(!attempted){attempted=true;const AC=window.AudioContext||window.webkitAudioContext;
      if(AC)try{ctx=new AC();}catch(_){} }
    if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});
  }
  addEventListener('pointerdown',unlock,true);addEventListener('keydown',unlock,true);
  function group(){
    if(!ctx)return null;
    const out=ctx.createGain(),voices=new Set();out.gain.value=0.65;out.connect(ctx.destination);
    return {out,voices,stopped:false,stop(){
      if(this.stopped)return;this.stopped=true;
      voices.forEach(s=>{try{s.stop();}catch(_){} });voices.clear();out.disconnect();
    }};
  }
  function play(when,duration,volume,freq,endFreq,type,g,noise=false){
    if(!ctx||ctx.state!=='running'||(g&&g.stopped))return;
    const t=Math.max(when,ctx.currentTime),amp=ctx.createGain();
    amp.gain.setValueAtTime(Math.max(0.0001,volume),t);amp.gain.exponentialRampToValueAtTime(0.0001,t+duration);
    amp.connect(g?g.out:ctx.destination);
    let s;
    if(noise){s=ctx.createBufferSource();const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate);
      const data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;s.buffer=b;
      const filter=ctx.createBiquadFilter();filter.type='highpass';filter.frequency.value=freq;
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
  return {get context(){return ctx;},get initialized(){return attempted;},group,click,drum,metal,noise};
})();
