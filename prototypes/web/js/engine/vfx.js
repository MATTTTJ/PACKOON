'use strict';
/* 필드 전용 픽셀 입자. 300개 객체를 돌려 쓰며 좌표는 그릴 때만 반올림한다. */
const Vfx=(()=>{
  const MAX=300,particles=[],pool=Array.from({length:MAX},()=>({}));
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const pending=[];
  let weather='',state=null,region=null,zone=null,tick=0,popWait=0,awakeCount=0,reduced=motion.matches;
  let wasGround=true,wasMoving=false,wasFace=1;
  const colors=['#cd6939','#df983d','#b98a44'];
  function remove(i){const p=particles[i];particles[i]=particles[particles.length-1];particles.pop();pool.push(p);}
  function clear(){while(particles.length)remove(particles.length-1);pending.length=0;popWait=0;}
  function sync(){
    if(state===G&&region===REG&&zone===G.zone)return;
    clear();state=G;region=REG;zone=G.zone;weather='';tick=0;
    awakeCount=G.awake.length;wasGround=G.onGround;wasMoving=false;wasFace=G.face;
  }
  function emit(kind,x,y,vx,vy,life,color,layer='front',screen=false,item=null){
    if(!pool.length)return null;
    const p=pool.pop();
    Object.assign(p,{kind,x,y,vx,vy,life,maxLife:life,color,layer,screen,item,age:0,rest:false,phase:Math.random()*Math.PI*2});
    particles.push(p);return p;
  }
  function setWeather(next){
    if(weather===next)return;
    for(let i=particles.length-1;i>=0;i--)if(particles[i].layer!=='effect')remove(i);
    weather=next;
  }
  function burst(x,y,big=false){
    if(!G||!G.started||G.ended)return;
    sync();
    const count=motion.matches?3:big?28:12;
    for(let i=0;i<count;i++){
      const a=i/count*Math.PI*2;
      emit('glow',x,y,Math.cos(a)*(big?1.3:.8),Math.sin(a)*.8-.3,big?62:40,i%2?'#e7b969':'#ffe3a1','effect');
    }
  }
  function item(id,n){
    if(!G||!G.started||G.ended||n<=0)return;
    sync();
    /* 대량 획득도 대기열이 끝없이 늘지 않는다. 화면에는 한 번에 하나씩. */
    const count=Math.min(Math.floor(n),MAX-pending.length);
    for(let i=0;i<count;i++)pending.push(id);
  }
  function gather(x,y){burst(x,y);}
  function dust(){
    if(motion.matches)return;
    for(let i=0;i<4;i++)emit('dust',G.px+(Math.random()-.5)*8,G.py-1,(Math.random()-.5)*.8-G.vx*.12,-.3-Math.random()*.45,20,'#bba582','effect');
  }
  function feet(){
    const moving=Math.abs(G.vx)>.2;
    if(G.onGround&&(!wasGround||moving!==wasMoving||(moving&&G.face!==wasFace)))dust();
    wasGround=G.onGround;wasMoving=moving;wasFace=G.face;
  }
  function slash(){
    if(motion.matches||heldTool()!=='sickle')return;
    for(let i=0;i<12;i++){
      const a=-1.4+i*.19;
      emit('trail',G.px+G.face*(5+Math.cos(a)*15),G.py-10+Math.sin(a)*15,0,0,10+i%3,'#ecdcb4','effect');
    }
  }
  function seedWeather(){
    if(!weather||tick%(motion.matches?100:weather==='snow'?5:12))return;
    const layer=Math.random()<.6?'back':'front',screen=layer==='back';
    const x=Math.random()*(W-6)+3+(screen?0:Math.round(G.cam));
    let kind=weather,y=2,vx=-.15,vy=.55,life=440,color='#e3edf2';
    if(weather==='maple'){kind=Math.random()<.5?'maple':'oak';color=colors[Math.floor(Math.random()*3)];vy=.45+Math.random()*.25;}
    else if(weather==='frost'){
      kind=Math.random()<.12?'snow':'mist';y=kind==='mist'?50+Math.random()*110:2;
      vy=kind==='mist'?-.12:.35;life=kind==='mist'?140:440;
    }else if(weather==='market-day'){
      kind=Math.random()<.5?'smoke':'dust';y=kind==='smoke'?GROUND-65:GROUND-2;vy=-.2;life=140;color='#c3b8a5';
    }else if(weather==='market-night'){
      kind=Math.random()<.5?'ember':'firefly';y=50+Math.random()*125;vy=-.18;life=190;color='#eab56a';
    }else if(weather==='snow'){vx=-.45;vy=.65;}
    else if(weather==='petal'){color='#f1b3c9';vx=-.25;vy=.5;}
    emit(kind,x,y,vx,vy,life,color,layer,screen);
  }
  function update(){
    if(!G||!REG)return;
    sync();fieldCall('weather');
    if(reduced!==motion.matches){
      reduced=motion.matches;
      if(reduced)for(let i=particles.length-1;i>=0;i--)if(particles[i].layer!=='effect'||particles[i].kind==='trail')remove(i);
    }
    if(B)return;
    if(G.awake.length>awakeCount)burst(G.px,G.py-16,true);
    awakeCount=G.awake.length;
    if(G.started&&!G.ended)seedWeather();
    tick++;
    if(popWait>0)popWait--;
    if(pending.length&&!popWait){
      if(emit('item',G.px,G.py-36,0,motion.matches?0:-.9,48,'#fff0bc','effect',false,pending[0])){
        pending.shift();popWait=52;
      }
    }
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];p.age++;p.life--;
      if(!p.rest){
        p.x+=p.vx;p.y+=p.vy;
        if(p.kind==='dust')p.vy+=.025;
        else if(p.kind==='item')p.vy*=.96;
        else if(p.layer!=='effect')p.x+=Math.sin(p.phase+p.age*.035)*.3;
        if((p.kind==='maple'||p.kind==='oak')&&p.y>=GROUND-1){p.y=GROUND-1;p.rest=true;p.life=Math.min(p.life,65);}
      }
      const x=p.x-(p.screen?0:Math.round(G.cam));
      if(p.life<=0||x+16<0||x-16>=W||p.y+16<0||p.y-16>=H)remove(i);
    }
  }
  function draw(layer){
    ctx.save();ctx.imageSmoothingEnabled=false;
    for(const p of particles){
      if(p.layer!==layer)continue;
      const x=Math.round(p.x-(p.screen?0:cam)),y=Math.round(p.y);
      /* 잎은 머리 부근을 비워 둔다. 캐릭터와 충돌하거나 머리에 머물지 않는다. */
      if((p.kind==='maple'||p.kind==='oak')&&Math.abs(x-(G.px-cam))<15&&y>G.py-37&&y<G.py-12)continue;
      ctx.globalAlpha=Math.min(1,p.life/18)*(layer==='back'?.28:layer==='effect'?.85:.48);
      if(p.kind==='item'){
        if(ICON_ART[p.item])ICON_ART[p.item]((a,b,w,h,c)=>R(x-8+a,y-8+b,w,h,c));
        else R(x-2,y-2,4,4,p.color);
      }else if(p.kind==='maple'){
        R(x,y,3,1,p.color);R(x+1,y-1,1,3,p.color);if(!p.rest)R(x-1,y-1,1,1,p.color);
      }else if(p.kind==='oak'){
        R(x,y,Math.sin(p.phase+p.age*.04)>0?4:2,1,p.color);R(x+1,y-1,2,1,p.color);
      }else if(p.kind==='smoke'||p.kind==='mist'){
        ctx.globalAlpha*=.45;R(x,y,4,1,p.color);R(x+1,y-1,2,1,p.color);
      }else{
        R(x,y,p.kind==='petal'?2:1,1,p.color);
        if(!motion.matches&&(p.kind==='glow'||p.kind==='snow')&&p.age<18){R(x-1,y,3,1,p.color);R(x,y-1,1,3,p.color);}
      }
    }
    ctx.restore();
  }
  /* 기존 drawFront에 섞인 이정표·색조는 지역의 weatherFront로 보존한다. */
  function front(){if(fieldDef().weather)fieldCall('weatherFront');else fieldCall('drawFront');draw('front');draw('effect');}
  return {MAX,get count(){return particles.length;},get queued(){return pending.length;},get reducedMotion(){return motion.matches;},setWeather,update,draw,front,item,gather,burst,feet,slash,clear};
})();
