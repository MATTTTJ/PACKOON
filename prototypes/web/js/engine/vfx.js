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
  function clear(){while(particles.length)remove(particles.length-1);pending.length=0;popWait=0;prints.length=0;stepIdx=-1;}
  /* 결정 D-174: 눈(영산)·서리(돌너머) 바닥의 발걸음. 지역·구역 데이터의 surface()가 'snow'·'frost'를 준다.
     - 걸을 때: 변신마다 다른 박자로 디딜 때마다 눈을 뒤로 차 올리고(snowkick), 땅바닥이면 그 모양의 발자국을 남긴다.
       발자국 모양: 너구리 볼록살과 발가락 / 다람쥐 작은 두 점 / 산양 갈라진 발굽 / 고라니 좁은 발굽 / 수리부엉이 세 발가락.
     - 구를 때(roll.js): 공 아래에서 눈보라가 흩뿌려지고(snowspray) 고랑 자국이 이어지며, 구르는 박자마다 눈덩이가 튄다(clump).
       눈 아닌 바닥에서 구르면 흙먼지와 흙덩이, 단풍골·장터는 잎 부스러기도 튄다. 걷기는 예전처럼 출발·멈춤 먼지만.
     발자국은 따로 모아 두고(최대 snow_print_max) snow_print_frames 동안 서서히 사라진다. 서리는 옅고 짧다. */
  const prints=[];
  const STEP_FRAMES={'':6,squirrel:5,goat:8,owl:8,deer:6};
  let stepIdx=-1;
  function surface(){const s=fieldCall('surface');return s==='snow'||s==='frost'?s:'';}
  function addPrint(x,y,shape,life){
    const max=TABLES.TUNING.snow_print_max;
    while(prints.length>=max)prints.shift();
    prints.push({x,y,shape,life,max:life});
  }
  function steps(){
    if(!G||!G.started||G.ended||B)return;
    sync();
    const moving=G.onGround&&Math.abs(G.vx)>.2&&!(typeof rolling!=='undefined'&&rolling);
    if(!moving){stepIdx=-1;return;}
    const s=surface();if(!s)return;
    const form=G.form||'',idx=Math.floor(G.anim/(STEP_FRAMES[form]||6));
    if(idx===stepIdx)return;stepIdx=idx;
    const snow=s==='snow',long=form==='goat'||form==='deer',x=G.px-G.face*(idx%2?(long?6:3):(long?-4:-1));
    if(G.py>=fieldGround()-.5)addPrint(x,G.py,form,snow?TABLES.TUNING.snow_print_frames:Math.round(TABLES.TUNING.snow_print_frames/3));
    if(motion.matches)return;
    const n=snow?(form==='squirrel'?2:long?4:3):1;
    for(let i=0;i<n;i++)emit('snowkick',x+(Math.random()-.5)*4,G.py-1,-G.face*(.3+Math.random()*.7)+(Math.random()-.5)*.3,-.45-Math.random()*(snow?.9:.4),snow?28:16,snow?'#f6fafc':'#dde4e8','effect');
  }
  /* 구르는 동안 매 프레임 (roll.js stepRoll) */
  function rollTrail(){
    if(!G||!G.onGround||B)return;
    sync();
    const s=surface();if(!s)return;
    const snow=s==='snow',r=G.form==='squirrel'?6:8;
    if(G.anim%2===0&&G.py>=fieldGround()-.5)addPrint(G.px,G.py,'roll',snow?TABLES.TUNING.snow_print_frames:Math.round(TABLES.TUNING.snow_print_frames/3));
    if(motion.matches||Math.abs(G.vx)<.4)return;
    const n=snow?(r>6?2:1):(G.anim%3?0:1);
    for(let i=0;i<n;i++)emit('snowspray',G.px-Math.sign(G.vx)*r*.7+(Math.random()-.5)*3,G.py-1,-G.vx*(.25+Math.random()*.25)+(Math.random()-.5)*.3,-.35-Math.random()*(snow?1.1:.5),snow?22:14,snow?'#f8fbfd':'#e4eaee','effect');
  }
  /* 구르는 박자마다 (roll.js) */
  function rollStep(){
    if(!G||motion.matches)return;
    sync();
    const s=surface(),reg=G.region,r=G.form==='squirrel'?6:8,bx=G.px-Math.sign(G.vx||G.face)*r*.5;
    if(s){
      for(let i=0;i<(s==='snow'?3:1);i++)emit('clump',bx+(Math.random()-.5)*6,G.py-2,-G.vx*.3+(Math.random()-.5)*.8,-.8-Math.random()*.7,30,s==='snow'?'#ffffff':'#e8eef1','effect');
      return;
    }
    dust();
    const c=DUST_COLORS[reg]||'#bba582';
    for(let i=0;i<2;i++)emit('clod',bx+(Math.random()-.5)*6,G.py-1,-G.vx*.25+(Math.random()-.5)*.7,-.7-Math.random()*.6,22,c,'effect');
    if(reg==='galchamgol'||reg==='jangteo'){const cs=LEAF_COLORS[reg];emit('leafbit',bx,G.py-3,-G.vx*.2+(Math.random()-.5),-1-Math.random()*.6,40,cs[Math.floor(Math.random()*cs.length)],'effect');}
  }
  /* 땅에 남은 발자국. 장면(배경) 뒤, 인물 앞에 그린다 */
  function ground(){
    if(!prints.length)return;
    ctx.save();
    for(const p of prints){
      const x=Math.round(p.x-cam),y=Math.round(p.y);if(x<-6||x>W+6)continue;
      ctx.globalAlpha=Math.min(1,p.life/60)*(p.max>=TABLES.TUNING.snow_print_frames?.6:.35);
      const c='#8b9eac',P=(a,b,w,h)=>R(x+a,y+b,w,h,c);
      if(p.shape==='squirrel'){P(-1,-1,1,1);P(1,-1,1,1);}
      else if(p.shape==='goat'){P(-1,-1,1,1);P(1,-1,1,1);P(-1,0,1,1);P(1,0,1,1);}
      else if(p.shape==='deer'){P(-1,-1,1,2);P(1,-1,1,2);}
      else if(p.shape==='owl'){P(0,-1,1,1);P(-1,-2,1,1);P(1,-2,1,1);P(0,-3,1,1);}
      else if(p.shape==='roll'){P(-2,-1,5,1);}
      else{P(-1,-1,3,1);P(-1,-2,1,1);P(1,-2,1,1);}
    }
    ctx.restore();
  }
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
  /* 바닥 물건을 줍거나 캘 때 흩날리는 것 (피드백 8). 흙·돌·광물은 먼지, 풀·나무·열매·덩굴은 잎.
     물건 종류 규칙은 이 표 한 곳에만 둔다. 표에 없는 물건은 잎으로 친다. */
  const SCATTER_DUST=new Set(['root','ssari','kkoe','coal','seogi','mud','stonedust','mossy_eye','story_stone','kong','gyeolmyeongja']);
  const LEAF_COLORS={galchamgol:['#cd6939','#df983d','#b98a44'],dolneomeo:['#c2a35c','#a88b4a','#d6c08a'],
    jangteo:['#5f7a45','#7e8f52','#a3884e'],yeongsan:['#e8eef2','#cfdbe3','#ffffff']};
  const DUST_COLORS={galchamgol:'#a98256',dolneomeo:'#b8ad98',jangteo:'#a8927a',yeongsan:'#dfe6ea'};
  function scatterKind(id){return SCATTER_DUST.has(id)?'dust':'leaf';}
  function scatter(x,y,id,strong=false){
    if(!G||!G.started||G.ended||motion.matches)return;
    sync();
    const reg=G.region,kind=id==null?'dust':scatterKind(id);
    if(kind==='dust'){
      const c=DUST_COLORS[reg]||'#bba582',n=strong?14:8;
      for(let i=0;i<n;i++)emit('clod',x+(Math.random()-.5)*10,y-1,(Math.random()-.5)*1.4,-.6-Math.random()*1,24+Math.random()*12|0,c,'effect');
    }else{
      const cs=LEAF_COLORS[reg]||LEAF_COLORS.galchamgol,n=strong?9:6;
      for(let i=0;i<n;i++)emit('leafbit',x+(Math.random()-.5)*8,y-3,(Math.random()-.5)*1.6,-.9-Math.random()*.9,40+Math.random()*20|0,cs[i%cs.length],'effect');
    }
  }
  function gather(x,y,id){burst(x,y);scatter(x,y,id,true);}
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
    for(let i=prints.length-1;i>=0;i--)if(--prints[i].life<=0)prints.splice(i,1);
    if(pending.length&&!popWait){
      // 결정 D-202: 얻은 물건은 낮게(약 10px) 떠서 0.5초 만에 사라진다 (사용자 피드백 51. 전에는 36px 위에서 20px 더 떠 0.8초)
      if(emit('item',G.px,G.py-28,0,motion.matches?0:-.55,30,'#fff0bc','effect',false,pending[0])){
        pending.shift();popWait=34;
      }
    }
    for(let i=particles.length-1;i>=0;i--){
      const p=particles[i];p.age++;p.life--;
      if(!p.rest){
        p.x+=p.vx;p.y+=p.vy;
        if(p.kind==='dust')p.vy+=.025;
        else if(p.kind==='clod')p.vy+=.06;
        else if(p.kind==='snowkick'||p.kind==='snowspray'||p.kind==='clump'){   // 결정 D-174: 눈은 떨어져 바닥에 닿으면 사라진다
          p.vy+=p.kind==='clump'?.08:.05;p.vx*=.96;if(p.y>=fieldGround()&&p.vy>0)p.life=0;
        }
        else if(p.kind==='leafbit'){p.vy=Math.min(p.vy+.04,.45);p.vx*=.97;p.x+=Math.sin(p.phase+p.age*.18)*.35;}
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
      }else if(p.kind==='clod'){
        R(x,y,2,2,p.color);
      }else if(p.kind==='snowkick'){
        R(x,y,p.age<6?2:1,1,p.color);
      }else if(p.kind==='snowspray'){
        R(x,y,1,1,p.color);if(p.age<4)R(x+1,y,1,1,p.color);
      }else if(p.kind==='clump'){
        R(x,y,2,2,p.color);R(x,y+2,2,1,'#c9d6de');
      }else if(p.kind==='leafbit'){
        if(Math.sin(p.phase+p.age*.2)>0){R(x,y,2,1,p.color);R(x+1,y-1,1,1,p.color);}else R(x,y,1,2,p.color);
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
  // 결정 D-128: 앞 그림도 자른 구간마다 나눠 그린다. 장면 변환을 푸는 sceneEnd는 나눠 그리기 밖에서 부른다.
  function front(){const f=()=>{if(fieldDef().weather)fieldCall('weatherFront');else fieldCall('drawFront');};
    if(typeof segmentedDraw==='function')segmentedDraw(f);else f();fieldCall('sceneEnd');draw('front');draw('effect');}
  return {MAX,get count(){return particles.length;},get queued(){return pending.length;},get reducedMotion(){return motion.matches;},setWeather,update,draw,front,item,gather,scatter,scatterKind,burst,dust,feet,slash,clear,
    steps,rollTrail,rollStep,ground,surface};   // D-174: 눈·서리 발걸음·구르기·발자국   // dust: 구르기(D-94)도 쓴다
})();
