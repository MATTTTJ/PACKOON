'use strict';
/* 큰 장터 진행: NPC 대화와 교환, 모락의 김 올리기, 엿방울의 엿가위 장단, 숙소 마루(낮/밤), 헌물 도깨비, 홍시 약떡 보내기, 지금 할 일.
   흐름은 design/narrative/jangteo-scenario.md (제안), 교환은 design/data/trades.csv
   교환 연쇄: 솔방울 → 쌀 → (맷돌) 쌀가루 → 모락 → 시루 깨어남 → 팥시루떡 → 부엉 영감 → 신표·아빠의 메모 → 창고 지키기 */
(()=>{
const Rg=REGIONS.jangteo;
const MG=TABLES.MINIGAMES;
const night=()=>G.f.night;

/* ---------- 작은 미니게임 창 만들기 (돌너머 돌 쌓기와 같은 모양) ---------- */
function makePanel(id,title,btn){
  const p=el('div','forge');p.id=id;p.hidden=true;
  p.innerHTML='<h2>'+title+'</h2><canvas id="'+id+'Cv" width="320" height="120" style="display:block;width:min(100%,380px);height:auto;margin:0 auto;image-rendering:pixelated;background:#efe3c8;border:2px solid var(--meok);border-radius:3px;touch-action:none"></canvas><div class="pips" id="'+id+'Pips"></div><div class="fhint" id="'+id+'Hint"></div><button class="btn primary strike" id="'+id+'Btn" type="button">'+btn+' <kbd>Space · J</kbd></button>';
  $('shell').appendChild(p);return p;
}

/* ---------- 모락 (반달가슴곰 떡집): 김 올리기 ---------- */
/* 김 올리기 (제안): 금빛 칸 누적 5초. 위태로워도 3초간 회복할 수 있고 쌓인 시간은 깎이지 않는다.
   후반 외풍은 한 번만. 실패는 같은 키/버튼으로 재시작하며 물건·호감·진행 보상 규칙은 그대로 둔다. */
const steamP=makePanel('steam','떡집 아궁이 · 김 올리기','부채질');
const sm={fire:0,steam:0,prog:0,band:[MG.steam_band_min,MG.steam_band_max],cool:0,t:0,danger:0,close:false,
  state:'playing',wind:0,windDone:false,voice:'',voiceCool:0,lastLine:''};
const scv=$('steamCv'),sx=scv.getContext('2d');
const steamLines={
  start:['자, 부채는 조금씩! 김을 보렴.','급할수록 불은 살살 다루자.','떡은 김이 반이야. 해 보자!'],
  good:['허허, 김이 참 곱게도 오른다!','그래, 그 김으로 떡이 익는다.','좋다! 대목 일손 하나 늘었네.'],
  high:['어이쿠, 뚜껑 뜬다! 부채 쉬어.','김이 넘친다! 잠깐 쉬어라.','그만 부쳐도 돼. 김부터 보자.'],
  low:['불씨 잦아든다! 한 번 부쳐라.','아궁이 식겠다. 살살 부쳐 봐.','불씨만 살리자. 조금씩 부쳐.'],
  wind:['외풍이다! 불씨 좀 살펴다오.','찬바람 드네. 부채질 조금만!'],
  fail:['괜찮다! 다시 불 지피면 되지.','허허, 떡집 불은 다시 살리면 돼.','손해 볼 것 없다. 다시 해 보자.'],
  close:['휴, 불씨 살렸네! 제법인걸.','아슬아슬했지? 그래도 잘 쪘다!'],
  success:['허허, 이 김이면 떡이 잘 익지!','좋다! 떡 찌는 손이 다 됐네.']
};
function steamSay(kind){
  if(sm.voice===kind&&sm.voiceCool>0)return;
  if(sm.voiceCool>0&&kind==='good')return;
  const choices=steamLines[kind].filter(s=>s!==sm.lastLine);
  sm.lastLine=choices[Math.floor(Math.random()*choices.length)];sm.voice=kind;sm.voiceCool=MG.steam_voice_cooldown;
  $('steamHint').textContent='모락: “'+sm.lastLine+'”';
}
function openSteam(){
  Object.assign(sm,{fire:MG.steam_fire_start,steam:0,prog:0,cool:0,t:0,danger:0,close:false,state:'playing',wind:0,windDone:false,voice:'',voiceCool:0});
  $('steamBtn').innerHTML='부채질 <kbd>Space · J</kbd>';
  $('steamPips').textContent='금빛 칸에 모두 '+(MG.steam_target_frames/60)+'초 · 칸 밖에서도 쌓인 시간은 그대로';
  steamP.hidden=false;steamSay('start');drawSteam();
}
function drawSteam(){
  const c=sx,Wc=320,Hc=120;c.fillStyle='#efe3c8';c.fillRect(0,0,Wc,Hc);
  // 아궁이와 불
  c.fillStyle='#6e5b4b';c.fillRect(20,60,90,50);c.fillStyle='#2a1a10';c.fillRect(36,78,58,32);
  const fh=sm.fire*0.3;for(let i=0;i<5;i++){c.fillStyle=['#ff7b2e','#ffb347','#e8551f'][(i+Math.floor(sm.t/5))%3];c.fillRect(40+i*11,110-fh-((i*7)%5),8,fh);}
  // 시루와 김
  c.fillStyle='#9b5b3a';c.fillRect(30,40,70,22);c.fillStyle='#e6b54a';c.fillRect(28,38,74,4);
  const lift=sm.steam>80?Math.abs(Math.sin(sm.t*0.5))*((sm.steam-80)/3):0;
  c.fillStyle='#6e4630';c.fillRect(27,33-lift,76,5);c.fillRect(59,29-lift,12,4);
  const n=Math.floor(sm.steam/10);for(let i=0;i<n;i++){const k=(sm.t*(sm.steam>80?1.6:0.8)+i*14)%40;c.fillStyle='rgba(255,255,255,'+(0.8-k/60).toFixed(2)+')';c.fillRect(32+((i*13)%66)+Math.sin((sm.t+i*30)*0.05)*4+(sm.wind? k*0.5:0),30-k,sm.steam>80?12:8,5);}
  if(sm.wind){c.fillStyle='#839da2';for(let i=0;i<3;i++)c.fillRect((sm.t*3+i*38)%115,50+i*9,18,1);}
  // 김 막대
  const bx=140,bw=160,by=30;c.fillStyle='#3a2a20';c.fillRect(bx,by,bw,16);c.fillStyle='rgba(220,165,69,.7)';c.fillRect(bx+bw*sm.band[0]/100,by,bw*(sm.band[1]-sm.band[0])/100,16);
  c.fillStyle='#f4efe4';c.fillRect(bx+bw*Math.min(100,sm.steam)/100-2,by-4,4,24);
  c.fillStyle='#2a2019';c.font='12px "Gowun Dodum", sans-serif';c.fillText(sm.wind?'김 · 외풍!':'김 · 금빛 칸에 맞추기',bx,by-8);
  // 데워진 정도
  c.fillStyle='#d8c9a6';c.fillRect(bx,60,bw,10);c.fillStyle='#b7852f';c.fillRect(bx,60,bw*sm.prog/MG.steam_max,10);c.fillStyle='#2a2019';c.fillText('고른 김 '+(sm.prog/(MG.steam_max/(MG.steam_target_frames/60))).toFixed(1)+' / '+(MG.steam_target_frames/60)+'초',bx,86);
  c.fillStyle='#d8c9a6';c.fillRect(bx,94,bw,5);c.fillStyle=sm.danger>MG.steam_close_at?'#b4432a':'#71824e';c.fillRect(bx,94,bw*(1-sm.danger/MG.steam_danger_limit),5);
  c.fillStyle='#2a2019';c.fillText(sm.state==='failed'?'다시 해 보자!':sm.danger?'불·김 회복 여유':'불씨 '+Math.round(sm.fire)+' · 남은 '+Math.ceil((MG.steam_time_limit-sm.t)/60)+'초',bx,115);
}
function steamStep(){
  if(steamP.hidden||sm.state!=='playing')return;
  sm.t++;if(sm.voiceCool>0)sm.voiceCool--;
  if(!sm.windDone&&sm.prog>=MG.steam_wind_at){sm.windDone=true;sm.wind=MG.steam_wind_frames;steamSay('wind');}
  sm.fire=Math.max(0,sm.fire-MG.steam_fire_decay-(sm.wind?MG.steam_wind_decay:0));sm.steam+=(sm.fire-sm.steam)*MG.steam_steam_follow;
  if(sm.wind>0)sm.wind--;if(sm.cool>0)sm.cool--;
  const inBand=sm.steam>=sm.band[0]&&sm.steam<=sm.band[1];
  const danger=sm.steam>MG.steam_danger_steam||(sm.t>MG.steam_low_grace&&sm.fire<MG.steam_danger_fire);
  sm.danger=Math.max(0,Math.min(MG.steam_danger_limit,sm.danger+(danger?1:-MG.steam_danger_recovery)));if(sm.danger>MG.steam_close_at)sm.close=true;
  if(inBand)sm.prog=Math.min(MG.steam_max,sm.prog+MG.steam_max/MG.steam_target_frames);
  if(sm.prog>=MG.steam_max){
    sm.state='won';sm.cool=0;steamSay(sm.close?'close':'success');$('steamPips').textContent='금빛 칸 '+(MG.steam_target_frames/60)+'초 완료!';
    // 프레임으로 마무리를 기다려 재시작 뒤에 이전 판 타이머가 남지 않게 한다.
  }else if(sm.danger>=MG.steam_danger_limit||sm.t>=MG.steam_time_limit){
    sm.state='failed';steamSay('fail');$('steamPips').textContent='물건·호감은 그대로 · 부채질 버튼으로 바로 다시 하기';
    $('steamBtn').innerHTML='다시 불 지피기 <kbd>Space · J</kbd>';
  }else if(!sm.wind){
    if(sm.steam>MG.steam_high_steam||sm.fire>MG.steam_high_fire)steamSay('high');
    else if(sm.t>MG.steam_low_hint_after&&sm.fire<MG.steam_low_fire)steamSay('low');
    else if(inBand)steamSay('good');
  }
  if(sm.t%36===0&&sm.steam>40)Sound.steam(sm.steam>MG.steam_high_steam?'lid':'bubble');
  drawSteam();
}
function steamHit(){
  if(steamP.hidden)return;
  if(sm.state==='failed'){openSteam();Sound.steam('fan');return;}
  if(sm.state!=='playing'||sm.cool>0)return;
  sm.cool=MG.steam_fan_cooldown;sm.fire=Math.min(MG.steam_max,sm.fire+MG.steam_fan_power);Sound.steam('fan');
}
$('steamBtn').addEventListener('pointerdown',e=>{e.preventDefault();steamHit();});scv.addEventListener('pointerdown',e=>{e.preventDefault();steamHit();});
defineMinigame({id:'steam',step:()=>{
  if(sm.state==='won'){sm.cool++;if(sm.cool>=MG.steam_finish_wait)finishSteam();return;}steamStep();
},hit:steamHit});
function finishSteam(){
  if(steamP.hidden)return;steamP.hidden=true;const F=G.f;
  F.steamDone=true;awaken('siru');ledgerDone('morak');rel('morak',MG.steam_relation);learn('morak:steam');
  diary('j_siru','모락에게 김 올리는 법을 배웠다. 보따리 속 시루에 처음으로 김이 서렸다. 잔칫날의 시루가 깨어났다.');
  toast('잔칫날의 시루가 깨어났다! 쌀가루 2 + 팥 1 → 팥시루떡');refreshHud();
  const lines=[['모락','그렇지! 떡은 김이 반이야.'],['너구리','(보따리 속 시루가 따뜻해졌다. 이제 시루로 떡을 찔 수 있다.)']];
  if(G.rel.morak.v>=2&&!F.morakTaught){F.morakTaught=true;learn('morak:memiltteok');addItem('memil_powder',1);
    lines.push(['모락','그리고 하나 더. 메밀가루 둘이면 메밀떡도 쪄져. 메밀가루 한 됫박 얹어 줄게.'],
      ['모락','장터 할머니들이 그러는데, 도깨비는 메밀을 좋아한대. 요즘 밤마다 장터 물건이 없어지잖니. 혹시 모르지.']);}
  talk(lines);
}
function talkMorak(){
  const F=G.f;
  if(!F.morakMet){F.morakMet=true;ledger('morak','모락','쌀가루 3','시루를 깨움');
    talk([['모락','어서 와! …아이고 미안, 정신이 없네. 설 대목인데 떡집 맷돌이 쩍 갈라졌지 뭐야.'],
      ['모락','쌀가루가 모자라 떡을 못 쪄. 누가 쌀가루 세 됫박만 갈아다 주면 소원이 없겠다.'],
      ['모락','쌀? 엿방울이 엿 고고 남은 쌀을 쌓아 두고 있을걸.']],()=>{if(has('ssal_powder',3))morakGive();});
    return;
  }
  if(!F.morakPowder){if(has('ssal_powder',3))morakGive();else talk([['모락','쌀가루 세 됫박. 갈 맷돌이 있다면 말이야… 하하.']]);return;}
  if(!F.steamDone){talk([['모락','다시 해 볼래? 불은 조금씩, 김은 고르게.',[{t:'다시 아궁이 앞에 앉는다',go:openSteam},{t:'조금 이따가요',go:null}]]]);return;}
  talk([['모락','떡은 김이 반이야. 시루 잘 쓰고 있지?']]);
}
function morakGive(){
  talk([['모락','쌀가루다! 줄 거니?',[{t:'쌀가루 3을 건넨다',go:()=>{
    const F=G.f;takeItem('ssal_powder',3);F.morakPowder=true;rel('morak',1);
    clue('j1','모락','모락: "네 엄마 떡 솜씨는 장터에서도 유명했지. 근데 네 아빠는 엄마 얘기만 나오면 말을 돌리더라."');
    diary('j_morak','떡집 모락이 우리 엄마를 안다. 엄마 떡 솜씨는 장터에서도 유명했다고. 그런데 아빠는 엄마 얘기만 나오면 말을 돌렸다고 한다.');
    talk([['모락','고맙다, 꼬마야! 그 보따리 속 맷돌로 갈았구나?'],['모락','…잠깐, 그 시루. 금빛 테 두른 그 시루, 어디서 났니?'],
      ['너구리','(보따리에서 시루를 꺼내 보였다.)'],['모락','너희 엄마 시루구나! 네 엄마 떡 솜씨는 장터에서도 유명했지.'],
      ['모락','근데 네 아빠는 엄마 얘기만 나오면 말을 돌리더라. 별일이지.'],
      ['모락','시루는 김을 다룰 줄 알아야 깨어나. 아궁이 불 다루는 거, 내가 가르쳐 주마.']],openSteam);
  }},{t:'아직은 안 줄래',go:null}]]]);
}

/* ---------- 엿방울 (여우 엿장수): 엿가위 장단 ---------- */
/* 엿가위 장단 (제안): 세 박 묶음 반주와 노트가 같은 초 단위 시계를 쓴다.
   8개 중 5개면 엿 덤. 쌀 8개와 재도전에는 판정에 따른 불이익이 없다. */
const rhP=makePanel('rhythm','엿가위 장단','쩔꺽');
const rh={notes:[],hits:0,combo:0,done:true,reward:false,timer:null,bus:null};
const rcv=$('rhythmCv'),rx=rcv.getContext('2d');
const HIT_X=64,NOTES=MG.rhythm_notes,RH_GOOD=MG.rhythm_good,RH_PERFECT=MG.rhythm_perfect,RH_SPEED=MG.rhythm_scroll_speed;
const rhTalk={
  start:['엿 사려! 손보다 귀부터 열어 봐.','쌀은 챙겨 놨지. 흥 좀 내 볼까?','내 가위 따라와 봐, 덤이 달렸어!'],
  good:['얼쑤! 엿보다 장단이 더 찰지네!','이 손맛이면 장사 접고 춤추겠어!','좋다 좋아, 덤 나갈 소리로구나!'],
  danger:['어허, 엿 늘이듯 느긋하게 쳐!','덤이 달랑달랑! 다음 박 잡아 봐.','가위 놓쳐도 쌀은 네 몫이야!'],
  late:['끝 두 박은 살짝 당긴다, 자!','마지막엔 잽싸게! 가위 따라와.'],
  fail:['가위도 쉬어야지. 한 판 더 해!','쌀은 챙기고, 덤은 다시 노려 봐!','오늘 손이 쉬네? 다시 맞춰 보자!'],
  close:['휴, 덤 나갈까 말까 했네! 가져가.','딱 다섯! 엿장수 주머니 열렸네!','아슬아슬했지? 약속한 덤 나간다!']
};
function rhSay(kind){const a=rhTalk[kind];return a[Math.floor(Math.random()*a.length)];}
// WebAudio가 없는 환경에서도 판정/보상은 유지한다. 오디오가 있으면 반드시 그 시계만 쓴다.
function rhNow(){return rh.audio?rh.audio.currentTime:performance.now()/1000;}
function rhStop(){clearInterval(rh.timer);rh.timer=null;if(rh.bus)rh.bus.stop();rh.bus=null;}
function openRhythm(reward){
  rhStop();Object.assign(rh,{hits:0,combo:0,done:false,reward,ready:false,audio:null,
    notes:[],beats:[],cursor:0,cool:-1,flashUntil:0,label:'준비',paused:null,late:false});
  $('rhythmHint').textContent='엿방울: '+rhSay('start');
  rhP.hidden=false;drawRhythm();
  // 대화 완료 콜백이 입력 밖에서 실행돼도 오디오 컨텍스트를 여기서 만들지 않는다.
  if(Sound.context&&Sound.context.state==='running')rhStart();
}
function rhStart(){
  rh.audio=Sound.context;
  if(rh.audio&&rh.audio.state!=='running')return;
  rh.ready=true;rh.origin=rhNow()+MG.rhythm_start_delay;rh.bus=Sound.group();
  // 0.22초 소박 세 개씩. 끝 두 박만 0.66초에서 0.55초로 당긴다.
  const offsets=[MG.rhythm_note_one,MG.rhythm_note_two,MG.rhythm_note_three,MG.rhythm_note_four,MG.rhythm_note_five,MG.rhythm_note_six,MG.rhythm_note_seven,MG.rhythm_note_eight];
  rh.notes=offsets.slice(0,NOTES).map(t=>({time:rh.origin+t,st:0}));
  const beats=[];
  for(let i=0;i<MG.rhythm_intro_beats;i++)beats.push({time:rh.origin+i*MG.rhythm_subbeat,part:i%MG.rhythm_parts,cue:false});
  offsets.forEach((t,i)=>{const gap=i<MG.rhythm_normal_last?MG.rhythm_normal_gap:MG.rhythm_late_gap;
    for(let p=0;p<MG.rhythm_parts;p++)beats.push({time:rh.origin+t+p*gap/MG.rhythm_parts,part:p,cue:p===0});});
  rh.beats=beats;rh.cursor=0;rh.timer=setInterval(rhSchedule,25);rhSchedule();
}
function rhSchedule(){
  if(rh.done||rhP.hidden){rhStop();return;}
  if(rh.paused!==null||!rh.ready)return;
  if(rh.audio&&rh.audio.state!=='running')return;
  const now=rhNow();
  while(rh.cursor<rh.beats.length&&rh.beats[rh.cursor].time<now+0.12){
    const b=rh.beats[rh.cursor++];if(b.time<now)continue; // 밀린 반주를 한꺼번에 재생하지 않는다.
    Sound.drum(b.time,b.part===0?0.24:0.09,rh.bus,b.part===1);
    if(b.cue)Sound.metal(b.time,0.12,rh.bus);
    else Sound.click(b.time,0.045,rh.bus);
    if(rh.combo>=MG.rhythm_combo){Sound.noise(b.time,0.045,rh.bus);
      if(b.part===0)Sound.metal(b.time,0.07,rh.bus,true);}
  }
}
function drawRhythm(){
  const c=rx,now=rh.paused===null?rhNow():rh.paused;
  c.fillStyle='#efe3c8';c.fillRect(0,0,320,120);c.save();
  if(now<rh.flashUntil&&rh.label==='잘 맞음')c.translate(0,-Math.sin((rh.flashUntil-now)*45)*2);
  c.fillStyle='#e3d1ab';c.fillRect(0,46,320,30);
  c.fillStyle='rgba(180,67,42,.15)';c.fillRect(HIT_X-RH_GOOD*RH_SPEED,40,RH_GOOD*RH_SPEED*2,42);
  c.fillStyle='#b4432a';c.fillRect(HIT_X-1,38,3,46);c.strokeStyle='#b4432a';c.lineWidth=2;c.beginPath();c.arc(HIT_X,61,12,0,Math.PI*2);c.stroke();
  rh.notes.forEach(n=>{const x=HIT_X+(n.time-now)*RH_SPEED;
    if(n.st===1||x<-20||x>340)return;
    c.fillStyle=n.st===2?'rgba(42,32,25,.3)':'#2a2019';
    c.fillRect(x-7,54,5,14);c.fillRect(x+2,54,5,14);c.fillRect(x-3,50,6,4);
    c.fillStyle=n.st===2?'rgba(42,32,25,.2)':'#7a7e84';c.fillRect(x-6,52,12,2);});
  c.restore();c.font='12px "Gowun Dodum", sans-serif';c.fillStyle='#2a2019';
  const left=rh.notes.filter(n=>n.st===0).length,need=Math.max(0,MG.rhythm_bonus_hits-rh.hits);
  c.fillText('흥 '+rh.hits+'/'+NOTES+' · '+(need?'덤까지 '+need+'개':'덤 나간다!'),10,17);
  c.fillText(rh.ready?'남은 가위 '+left+' · 연속 '+rh.combo:'버튼을 누르면 준비 장단!',10,34);
  // 5/8의 실제 덤 선. 실패해도 게이지와 보상을 깎지 않는다.
  c.fillStyle='#d2bb8b';c.fillRect(12,92,208,10);
  c.fillStyle=need===1&&left>0?(Math.sin(now*15)>0?'#c36a2c':'#e6b54a'):'#c36a2c';
  c.fillRect(12,92,208*rh.hits/NOTES,10);c.fillStyle='#713b28';c.fillRect(141,88,2,18);
  c.fillText('덤 선',129,118);
  c.fillStyle=rh.label==='빗나감'?'#7a6655':'#b4432a';
  c.fillText(now<rh.flashUntil?rh.label+(rh.combo>=MG.rhythm_combo?' · 얼쑤!':''):'찰칵에 맞춰!',228,99);
  $('rhythmPips').innerHTML=rh.notes.map(n=>'<span class="pip'+(n.st===1?' on':'')+'"'+(n.st===2?' style="opacity:.3"':'')+'></span>').join('');
}
function rhMiss(n,now){if(n)n.st=2;rh.combo=0;rh.label='빗나감';rh.flashUntil=now+0.45;
  $('rhythmHint').textContent='엿방울: '+rhSay('danger');}
function rhythmStep(){
  if(rh.done||rh.paused!==null)return;
  if(!rh.ready){
    if(!Sound.initialized)return;
    if(!Sound.context||Sound.context.state==='running')rhStart();else return;
  }
  const now=rhNow();rhSchedule();
  rh.notes.forEach(n=>{if(n.st===0&&now-n.time>RH_GOOD)rhMiss(n,now);});
  if(!rh.late&&now>=rh.notes[MG.rhythm_normal_last].time+MG.rhythm_late_hint_delay){rh.late=true;$('rhythmHint').textContent='엿방울: '+rhSay('late');}
  if(rh.notes.every(n=>n.st!==0)&&now>=rh.notes[NOTES-1].time+MG.rhythm_finish_delay){rh.done=true;rhStop();finishRhythm();}
  drawRhythm();
}
function rhythmHit(){
  if(rh.done||rhP.hidden||rh.paused!==null)return;
  if(!rh.ready){rhStart();return;}
  if(rh.audio&&rh.audio.state!=='running')return;
  const now=rhNow();if(now-rh.cool<MG.rhythm_cooldown)return;rh.cool=now;
  // 입력 직전에도 지난 노트를 처리해 프레임이 느려도 판정이 같도록 한다.
  rh.notes.forEach(n=>{if(n.st===0&&now-n.time>RH_GOOD)rhMiss(n,now);});
  const n=rh.notes.filter(n=>n.st===0).sort((a,b)=>Math.abs(a.time-now)-Math.abs(b.time-now))[0];
  if(n&&Math.abs(n.time-now)<=RH_GOOD){
    const perfect=Math.abs(n.time-now)<=RH_PERFECT;n.st=1;rh.hits++;rh.combo++;
    rh.label=perfect?'잘 맞음':'맞음';rh.flashUntil=now+0.45;
    Sound.metal(now,perfect?0.25:0.14,rh.bus,perfect);
    $('rhythmHint').textContent='엿방울: '+rhSay(rh.hits===MG.rhythm_bonus_hits-1?'danger':'good');
  }else{rhMiss(null,now);Sound.click(now,0.035,rh.bus);}
  drawRhythm();
}
// 다른 탭을 보는 동안 기회가 사라지지 않게 반주와 노트를 함께 멈춘다.
document.addEventListener('visibilitychange',()=>{
  if(rhP.hidden||rh.done||!rh.ready)return;
  if(document.hidden){rh.paused=rhNow();rhStop();}
  else if(rh.paused!==null){
    const gap=rhNow()-rh.paused+MG.rhythm_resume_delay;rh.origin+=gap;
    rh.notes.forEach(n=>n.time+=gap);rh.beats.forEach(b=>b.time+=gap);
    rh.cool+=gap;rh.flashUntil+=gap;rh.paused=null;rh.bus=Sound.group();
    rh.cursor=rh.beats.findIndex(b=>b.time>=rhNow());if(rh.cursor<0)rh.cursor=rh.beats.length;
    rh.timer=setInterval(rhSchedule,25);rhSchedule();
  }
});
$('rhythmBtn').addEventListener('pointerdown',e=>{e.preventDefault();rhythmHit();});rcv.addEventListener('pointerdown',e=>{e.preventDefault();rhythmHit();});
defineMinigame({id:'rhythm',step:rhythmStep,hit:rhythmHit});
function finishRhythm(){
  if(rhP.hidden)return;rhStop();rhP.hidden=true;const F=G.f;const high=rh.hits>=MG.rhythm_bonus_hits;learn('yeotbang:rhythm');
  const lines=[['엿방울',rhSay(high?(rh.hits===MG.rhythm_bonus_hits?'close':'good'):'fail')]];
  if(rh.reward){F.yeotDone=true;ledgerDone('yeotbang');addItem('ssal',8);
    lines.push(['엿방울',high?'얼씨구, 장단 좀 아네! 흥이 절로 난다.':'흥이 덜 났네. 그래도 엿장수 약속은 약속이지.'],['엿방울','엿 고고 남은 쌀 여덟 되. 가져가.']);}
  rel('yeotbang',high?MG.rhythm_high_relation:MG.rhythm_relation);
  if(high&&!F.yeotHigh){F.yeotHigh=true;addItem('dad_yeot',1);learn('yeotbang:high');
    clue('j2','엿방울','아빠는 아들 주려고 엿을 샀다가, 끝내 못 가져가고 엿방울에게 맡겨 두었다.');
    diary('j_yeot','엿방울이 흥이 나서 숨겨 둔 엿을 내줬다. 아빠가 나 주려고 사 두고 끝내 못 가져간 가락엿이라고 했다.');
    lines.push(['엿방울','흥 난 김에 하나 더. 이건 팔 물건이 아니야.'],['엿방울','그 너구리 아저씨, 아들 준다고 샀는데 끝내 못 가져갔어. 네가 그 아들이구나.']);}
  else if(!high&&!F.yeotHigh)lines.push(['엿방울','흥이 더 나면… 내놓을 게 하나 있긴 한데. 다음에 장단 다시 맞춰 보자.']);
  talk(lines);
}
function talkYeot(){
  const F=G.f;
  if(!F.yeotMet){F.yeotMet=true;ledger('yeotbang','엿방울','솔방울 5','쌀');
    talk([['엿방울','엿 사려, 엿! …라고 하고 싶은데 불이 꺼져 가네.'],
      ['엿방울','엿을 고려면 불을 오래 때야 하는데 솔방울이 떨어졌어. 뒷산 소나무 숲에서 솔방울 다섯만 주워 와.'],
      ['엿방울','엿 고고 남은 쌀을 줄게. 엿장수 마음대로지만, 흥만 나면 더 줄 수도 있고.']],()=>{if(has('solbang',5))yeotTrade();});
    return;
  }
  if(!F.yeotDone){if(has('solbang',5))yeotTrade();else talk([['엿방울','솔방울 다섯! 뒷산 소나무 숲에 굴러다녀.']]);return;}
  if(!F.yeotHigh){talk([['엿방울','장단 한 번 더 맞춰 볼래? 흥이 나면 내놓을 게 있다니까.',[{t:'엿가위 장단을 맞춘다',go:()=>openRhythm(false)},{t:'그만두기',go:null}]]]);return;}
  talk([['엿방울','엿 사려, 엿~ 장단 맞추는 꼬마 보부상이 왔네.']]);
}
function yeotTrade(){
  talk([['엿방울','솔방울이다! 줄 거지?',[{t:'솔방울 5개를 건넨다',go:()=>{
    takeItem('solbang',5);
    talk([['엿방울','좋아, 불 올리자! 엿 고는 동안 장단 한번 맞춰 볼래? 내 가위 소리에 맞춰서!']],()=>openRhythm(true));
  }},{t:'아직은 안 줄래',go:null}]]]);
}

/* ---------- 날쌘 (다시 만남): 설 대목 팥 ---------- */
function talkNal(){
  if(!G.f.nalJTalk){G.f.nalJTalk=true;ledger('nal_jangteo','날쌘','쌀가루 1 (또는 메밀가루 1)','팥');
    talk([['날쌘','또 너냐! 설 대목엔 팥이 금값이야. 고사떡엔 팥이 빠질 수 없거든.']],nalMenu);}
  else nalMenu();
}
function nalMenu(){
  const F=G.f,c=[];
  if(!F.nalJDone){
    if(has('ssal_powder'))c.push({t:'쌀가루를 내민다 (팥 1)',go:()=>nalTrade('ssal_powder')});
    if(has('memil_powder'))c.push({t:'메밀가루를 내민다 (팥 2)',go:()=>nalTrade('memil_powder')});
    if(!F.nalJBluff)c.push({t:'허세 부리기: "팥 한 되에 뭘 그리 비싸게 굴어"',go:nalBluff});
  }
  c.push({t:'그만두기',go:null});
  talk([['날쌘',F.nalJDone?'고사떡 잘 쪄라. 부엉 영감은 팥 빛깔까지 본다.':(has('ssal_powder')||has('memil_powder'))?'뭘 내놓을 건데?':'가루 한 됫박이면 팥 한 되. 쌀가루든 메밀가루든.',c]]);
}
function nalTrade(id){
  const F=G.f;takeItem(id,1);F.nalJDone=true;ledgerDone('nal_jangteo');
  const n=(id==='memil_powder'?2:1)+(F.nalJBluff?1:0);addItem('pat',n);
  if(id==='memil_powder')learn('nal:jangteo-memil');
  talk(id==='memil_powder'?[['날쌘','돌너머 메밀가루? 이야, 장터에선 귀한 거다. 팥 '+n+'되 쳐주지.']]:[['날쌘','거래 성립. 팥 '+n+'되.']]);
}
function nalBluff(){G.f.nalJBluff=true;rel('nal',1);
  talk([['너구리','팥 한 되에 뭘 그리 비싸게 굴어.'],['날쌘','하! 대목 장사를 몰라도 한참 모르는군.'],['날쌘','…좋아, 그 배짱에 한 되 더 얹어 주지.']],nalMenu);}

/* ---------- 숙소 마루: 쉬면 낮과 밤이 바뀐다 ---------- */
function restMaru(){
  const toNight=!night();
  talk([['너구리',toNight?'(숙소 마루에 앉아 해가 지기를 기다렸다. …장터에 하나둘 등불이 켜진다.)':'(마루에서 한숨 자고 나니 날이 밝았다.)']],()=>{
    G.f.night=toNight;learn('maru:rest');toast(toNight?'밤이 되었다':'아침이 되었다');refreshGoal();});
}

/* ---------- 부엉 영감 (보부상단 접장): 밤에만 깨어 있다 ---------- */
function talkBueong(){
  const F=G.f;
  if(!night()){learn('bueong:night');
    talk([['부엉 영감','(처마 밑에서 꾸벅꾸벅 졸고 있다.)'],['너구리','(낮에는 자는 모양이다. 숙소 마루에서 쉬며 해가 지기를 기다리자.)']]);return;}
  if(!F.bueongNight){F.bueongNight=true;F.bueongMet=true;learn('bueong:rule');ledger('bueong','부엉 영감','팥시루떡 1','아빠가 맡긴 짐');
    talk([['부엉 영감','부엉. …그 모자. 보부상단 장부에 이름이 있는 그 너구리 거로구나.'],
      ['부엉 영감','녀석이 짐을 맡겨 놨다. 허나 보부상단 물건은 보부상에게만 내준다. 그게 규칙이다.'],
      ['부엉 영감','정식 보부상이 되고 싶으면 보부상단 설 고사에 팥시루떡을 올려라. 그럼 신표를 주마.']],()=>{if(has('patsirutteok'))bueongGive();});
    return;
  }
  if(!F.bueongDone){if(has('patsirutteok'))bueongGive();else talk([['부엉 영감','팥시루떡. 쌀가루 둘에 팥 하나, 시루에 쪄야 제맛이다.']]);return;}
  if(!G.boss.dead){talk([['부엉 영감','창고다. 그믐 밤엔 헌것들이 들썩인다. 문 앞을 지켜라.']]);return;}
  talk([['부엉 영감','수고했다. 장부에 적어 두마. 진짜 보부상이로구나.']]);
}
function bueongGive(){
  talk([['부엉 영감','…고사떡이로구나.',[{t:'팥시루떡을 고사상에 올린다',go:()=>{
    const F=G.f;takeItem('patsirutteok',1);F.bueongDone=true;F.guard=true;ledgerDone('bueong');rel('bueong',1);learn('bueong:sinpyo');
    addItem('sinpyo',1);addItem('dad_memo',1);
    clue('j3','아빠의 메모','아빠가 숙소에 맡긴 짐 속 메모: "글자는 \'되돌림\'이었다. 값은 이미 치러졌다. 이번엔 내가 치른다. 북쪽 영산."');
    diary('j_memo','보부상 신표를 받았다. 아빠의 짐 속에 메모가 있었다. 아빠가 읽은 글자는 \'되돌림\'. "값은 이미 치러졌다. 이번엔 내가 치른다." 누가, 무슨 값을 치렀다는 걸까.');
    talk([['부엉 영감','붉은 팥이 제대로 들었다.'],['부엉 영감','(부엉 영감이 떡을 고사상에 올리고, 장부에 내 이름을 적는다.)'],
      ['부엉 영감','이제 너도 보부상단 식구다. 신표를 받아라.'],['부엉 영감','그리고 이건 녀석의 짐이다.'],
      ['너구리','(아빠의 짐 속에 접힌 종이가 있다. 아빠의 글씨다.)'],
      ['너구리','"글자는 \'되돌림\'이었다. 값은 이미 치러졌다. 이번엔 내가 치른다. 북쪽 영산."'],
      ['부엉 영감','…보부상에겐 의무가 있다. 오늘이 섣달그믐이다. 밤마다 장터 물건이 사라지니, 숙소 창고를 지켜라.']],()=>{toast('숙소 창고를 지키자');refreshGoal();});
  }},{t:'아직은 안 올릴래',go:null}]]]);
}

/* ---------- 헌물 도깨비 전투 ---------- */
Rg.startDokkaebi=()=>{
  G.px=Rg.STORE_X-30;
  inkTransition('전투',(Rg.STORE_X-G.cam)/W*100,()=>startBattle('dokkaebi',res=>{
    if(res==='win'||res==='calm'){
      if(res==='calm'){
        G.f.dokCalm=true;
        if(!has('dokkaebibul'))addItem('dokkaebibul',1);
        diary('j_calm','헌물 도깨비를 부수지 않고 달랬다. 도깨비는 훔친 것을 돌려놓고 고맙다며 도깨비불씨를 건넨 뒤 춤추듯 사라졌다.');
      }
      Rg.bossDie(res==='calm');
    }else{
      G.px=Rg.STORE_X-70;G.f.faints+=res==='lose'?1:0;
      diary('j_hint','헌물 도깨비는 빗자루로 쓸고, 키로 콩을 뿌리고, 멍석을 말아 온다. 헌물을 하나 부수면 도깨비불이 드러난다. 도깨비는 메밀을 좋아한다는 말이 있다.');
      toast('일기에 공략을 적어 두었다. 준비되면 다시 창고 문 앞으로');
    }
  }));
};

/* ---------- 끝: 홍시 약떡을 까치 편에 보내기 ---------- */
Rg.sendMedicine=()=>{
  G.f.hongsiMade=true;
  diary('j_end','눈홍시와 쌀가루로 홍시 약떡을 쪘다. 엄마가 동네에 떡을 돌리던 시루로, 이번엔 엄마를 위한 떡을 쪘다.');
  talk([['너구리','홍시 약떡이다. 엄마 시루로 쪘어.'],['너구리','(숙소 처마에 앉아 있던 까치가 내려와 떡 보자기를 물었다.)'],['너구리','엄마한테 부탁해. 엄마 시루로 찐 거라고 꼭 전해 줘.']],()=>{
    takeItem('hongsi_tteok',1);endGame();
  });
};

/* ---------- NPC (npcs.csv 의 id). x 는 필드 위치 ---------- */
Rg.npcs=[
  {id:'morak',name:'모락',x:360,talk:talkMorak,draw:Rg.art.bear,props:Rg.props.tteokjip},
  {id:'yeotbang',name:'엿방울',x:640,talk:talkYeot,draw:Rg.art.fox,props:Rg.props.yeotcart},
  {id:'nal',name:'날쌘',x:960,talk:talkNal,draw:COMMON_ART.weasel,props:COMMON_ART.nalProps},
  {id:'maru',name:'숙소 마루',x:1070,prompt:'숙소 마루에서 쉬기',talk:restMaru,draw:()=>{},props:Rg.props.maru},
  {id:'bueong',name:'부엉 영감',x:1190,talk:talkBueong,draw:Rg.art.owl},
];

/* ---------- 지금 할 일 ---------- */
Rg.goal=()=>{
  const F=G.f;
  if(!G.started)return '';
  if(G.ended)return '큰 장터 체험판 완료';
  const toNight=s=>night()?s:'밤이 되면 '+s+' (숙소 마루에서 쉬기)';
  if(!F.bueongNight)return night()?'처마 밑의 부엉 영감에게 말 걸기 (밤에는 깨어 있다)':knows('bueong:night')?'숙소 마루에서 쉬며 해가 지기를 기다리기':'보부상 숙소의 부엉 영감 찾아가기';
  if(!F.bueongDone){
    if(has('patsirutteok'))return toNight('부엉 영감에게 팥시루떡 올리기');
    if(!isAwake('siru')){
      if(!F.morakMet)return '김이 오르는 떡집의 모락 찾아가기';
      if(F.morakPowder)return '모락에게 김 올리기 다시 배우기';
      const sp=G.inv.ssal_powder||0,s=G.inv.ssal||0;
      if(sp>=3)return '모락에게 쌀가루 3 건네기';
      if(sp+s>=3)return '보따리를 열고 맷돌에 쌀을 넣어 쌀가루 갈기 ('+sp+'/3)';
      if(!F.yeotMet)return '엿 수레의 엿방울에게 쌀 구하기';
      const sb=G.inv.solbang||0;
      return sb>=5?'엿방울에게 솔방울 건네기':'뒷산 소나무 숲에서 솔방울 줍기 ('+sb+'/5)';
    }
    if(!has('pat'))return '숙소 앞 날쌘에게 팥 구하기';
    if((G.inv.ssal_powder||0)<2)return '보따리를 열고 맷돌에 쌀을 넣어 쌀가루 갈기';
    return '보따리를 열고 시루에 쌀가루 2와 팥 1 넣어 찌기';
  }
  if(!G.boss.dead)return toNight('숙소 창고 문 앞을 지키기');
  if((G.inv.ssal_powder||0)<1&&!has('hongsi_tteok'))return '보따리를 열고 맷돌에 쌀을 넣어 쌀가루 갈기';
  return '보따리를 열고 시루에 눈홍시와 쌀가루 넣어 홍시 약떡 찌기';
};
})();
