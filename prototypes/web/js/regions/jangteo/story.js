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
  start:['자, 부채질은 조금씩! 김부터 보자!','허허, 바빠도 불은 살살 다뤄야지!','떡은 김이 반이지! 자, 부쳐 봐!'],
  good:['허허, 김 한번 곱게 오른다!','그래, 그래! 그 김이면 떡도 잘 익지!','좋다! 대목에 든든한 일손 생겼네!'],
  high:['어이쿠, 뚜껑 뜬다! 부채 내려놓자!','김 넘치겠다! 부채질 잠깐 쉬자!','그만 부쳐도 되겠다! 김 좀 빠지게 두자!'],
  low:['불씨 잦아든다! 한 번만 부쳐 보자!','어이쿠, 아궁이 식겠다! 조금만 부쳐 봐!','불씨부터 살리자! 조금씩 부치면 돼!'],
  wind:['외풍이다! 불씨 꺼지나 잘 보자!','찬바람 드네! 불씨 살리게 조금만 부쳐 봐!'],
  fail:['괜찮아! 불이야 다시 지피면 되지!','허허, 다시 해 보자! 불씨는 내가 챙길게!','쌀가루는 더 안 들어! 마음 놓고 다시 해 보자!'],
  close:['허허, 꺼질 뻔한 불씨를 살렸네! 제법이야!','어이쿠, 아슬아슬했다! 그래도 김은 잘 올렸네!'],
  success:['허허, 이 김이면 떡도 속까지 잘 익지!','좋다! 이제 떡집 일손 다 됐네!']
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
  const lines=[['모락','허허, 바로 그거야! 떡은 김이 반이지!'],['너구리','시루가 따뜻해졌어. 이제 떡을 찔 수 있겠다!']];
  if(G.rel.morak.v>=2&&!F.morakTaught){F.morakTaught=true;learn('morak:memiltteok');addItem('memil_powder',1);
    lines.push(['모락','시루에 메밀가루 두 됫박이면 메밀떡이지! 한 됫박은 내가 얹어 줄게.'],
      ['모락','할머니들 말로는 도깨비가 메밀을 좋아한대. 밤마다 장터 물건이 사라지니, 메밀떡 좀 챙겨 둬 봐!']);}
  talk(lines);
}
function talkMorak(){
  const F=G.f;
  if(!F.morakMet){F.morakMet=true;ledger('morak','모락','쌀가루 3','시루를 깨움');
    talk([['모락','어서 와, 꼬마야! 아이고, 설 대목에 우리 맷돌이 쩍 갈라져서 정신이 없네.'],
      ['모락','쌀가루가 모자라 떡을 못 찌네. 세 됫박만 갈아다 주면 김 올리는 법을 가르쳐 줄게!'],
      ['모락','쌀은 엿방울한테 가 봐! 엿 고고 남은 게 있을 거야. 그걸 맷돌에 갈면 되지!']],()=>{if(has('ssal_powder',3))morakGive();});
    return;
  }
  if(!F.morakPowder){if(has('ssal_powder',3))morakGive();else talk([['모락','쌀가루 세 됫박만 부탁해, 꼬마야! 엿방울한테 쌀을 구해서 맷돌에 갈아 오면 돼!']]);return;}
  if(!F.steamDone){talk([['모락','자, 다시 해 보자! 부채질은 조금씩, 김은 고르게!',[{t:'다시 아궁이 앞에 앉는다',go:openSteam},{t:'조금 이따가요',go:null}]]]);return;}
  talk([['모락','허허, 꼬마야! 시루로 떡 좀 쪄 봤어? 떡은 김이 반인 거 알지?']]);
}
function morakGive(){
  talk([['모락','오, 쌀가루! 세 됫박만 나눠 줄래, 꼬마야?',[{t:'쌀가루 3을 건넨다',go:()=>{
    const F=G.f;takeItem('ssal_powder',3);F.morakPowder=true;rel('morak',1);
    clue('j1','모락','모락: "네 엄마 떡 솜씨야 이 장터에서도 알아줬지! 그런데 네 아빠는 엄마 얘기만 나오면 딴소리를 하더라."');
    diary('j_morak','떡집 모락은 엄마를 알았다. 엄마는 이 장터에서도 떡 잘하기로 유명했단다. 아빠는 왜 엄마 얘기만 나오면 말을 돌렸을까.');
    talk([['모락','고맙다, 꼬마야! 보따리 속 맷돌로 갈아 왔구나?'],['모락','어이쿠, 그 시루! 금빛 테 두른 거 말이야. 어디서 났어?'],
      ['너구리','엄마 시루예요.'],['모락','아하, 너희 엄마 거였구나! 네 엄마 떡 솜씨야 이 장터에서도 알아줬지!'],
      ['모락','그런데 네 아빠는 엄마 얘기만 나오면 딴소리를 하더라. 이상하지?'],
      ['모락','시루를 깨우려면 김부터 다룰 줄 알아야지! 아궁이 앞으로 와. 내가 가르쳐 줄게.']],openSteam);
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
  start:['엿 사려, 엿! 꼬마 보부상, 가위 소리부터 들어 봐.','쌀은 네 몫으로 떼 놨지. 어디, 흥 좀 내 볼까?','내 가위에 장단 맞춰 봐. 덤이 나갈지도 모르잖아?'],
  good:['얼쑤! 엿보다 네 장단이 더 찰진데?','어라, 이러다 엿은 안 팔고 춤만 추겠네!','얼쑤, 내 흥 돋우는 솜씨 좀 봐!'],
  danger:['어허, 엿 늘이듯 느긋하게! 내 가위 소릴 들어 봐.','덤이 나갈까, 말까? 다음 장단 잘 들어 봐.','가위 좀 놓친다고 쌀까지 안 줄까 봐? 쌀은 네 몫이지.'],
  late:['자, 끝 두 박은 살짝 당겨 볼까?','끝 두 박은 좀 빨라! 내 가위 따라와 봐.'],
  fail:['가위도 숨 좀 돌려야지. 쉬었다 다시 맞춰 볼까?','쌀은 네 몫이고! 덤은 다음 장단에 노려 볼까?','내 가위가 좀 빨랐나? 한 번 더 맞춰 봐.'],
  close:['어라, 아슬아슬하게 맞췄네! 흥이 안 날 수 없지.','딱 다섯! 내 흥 돋우는 법을 알았구나?','얼쑤, 턱걸이라도 다섯은 다섯이지!']
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
    lines.push(['엿방울',high?'얼쑤, 장단 좀 아는걸? 내 흥을 다 돋우네!':'흥은 좀 덜 났지만, 쌀 준다는 말은 안 바꾸지!'],['엿방울','자, 엿 고고 남은 쌀 여덟 되! 이건 약속한 네 몫이야.']);}
  rel('yeotbang',high?MG.rhythm_high_relation:MG.rhythm_relation);
  if(high&&!F.yeotHigh){F.yeotHigh=true;addItem('dad_yeot',1);learn('yeotbang:high');
    clue('j2','엿방울','아빠는 아들 주려고 엿을 샀다가, 끝내 못 가져가고 엿방울에게 맡겨 두었다.');
    diary('j_yeot','장단을 맞췄더니 엿방울이 숨겨 둔 가락엿을 꺼냈다. 아빠가 나 주려고 샀다가 끝내 못 가져가고 맡긴 엿이다.');
    lines.push(['엿방울','흥 난 김에 이 엿도 꺼내 볼까? 팔 건 아니고, 맡아 둔 거야.'],['엿방울','너구리 아저씨가 아들 준다고 샀다가 끝내 못 가져가고 내게 맡겼지. 그 아들이 너구나, 꼬마 보부상.']);}
  else if(!high&&!F.yeotHigh)lines.push(['엿방울','내 흥만 좀 더 나면 꺼낼 게 있는데 말이야. 다음에 가위 여덟 번 중 다섯 번만 맞춰 봐.']);
  talk(lines);
}
function talkYeot(){
  const F=G.f;
  if(!F.yeotMet){F.yeotMet=true;ledger('yeotbang','엿방울','솔방울 5','쌀');
    talk([['엿방울','엿 사려, 엿! 어라, 불부터 살려야겠네.'],
      ['엿방울','엿 고느라 불을 오래 땠더니 솔방울이 동났네. 뒷산 소나무 숲에서 다섯 개만 주워 올래?'],
      ['엿방울','대신 남은 쌀 여덟 되를 줄게. 덤? 그야 엿장수 마음이지. 흥만 나면 또 모르고!']],()=>{if(has('solbang',5))yeotTrade();});
    return;
  }
  if(!F.yeotDone){if(has('solbang',5))yeotTrade();else talk([['엿방울','꼬마 보부상, 솔방울 다섯 개면 돼. 뒷산 소나무 숲에 가 봐.']]);return;}
  if(!F.yeotHigh){talk([['엿방울','장단 한 번 더? 여덟 번 중 다섯 번만 맞춰 봐. 흥이 나면 꺼낼 게 있다니까.',[{t:'엿가위 장단을 맞춘다',go:()=>openRhythm(false)},{t:'그만두기',go:null}]]]);return;}
  talk([['엿방울','엿 사려, 엿! 어라, 내 흥 돋우던 꼬마 보부상이네?']]);
}
function yeotTrade(){
  talk([['엿방울','어라, 솔방울 챙겨 왔네? 다섯 개 주면 쌀 여덟 되, 어때?',[{t:'솔방울 5개를 건넨다',go:()=>{
    takeItem('solbang',5);
    talk([['엿방울','좋아, 불부터 올리고! 엿 고는 동안 내 가위 소리에 장단 맞춰 볼래?']],()=>openRhythm(true));
  }},{t:'아직은 안 줄래',go:null}]]]);
}

/* ---------- 날쌘 (다시 만남): 설 대목 팥 ---------- */
function talkNal(){
  if(!G.f.nalJTalk){G.f.nalJTalk=true;ledger('nal_jangteo','날쌘','쌀가루 1 (또는 메밀가루 1)','팥');
    talk([['날쌘','또 왔냐, 꼬마 보부상. 설 고사떡엔 팥이 꼭 들어가니, 이 대목엔 귀한 몸이지.']],nalMenu);}
  else nalMenu();
}
function nalMenu(){
  const F=G.f,c=[];
  if(!F.nalJDone){
    if(has('ssal_powder'))c.push({t:'쌀가루를 내민다 (팥 1)',go:()=>nalTrade('ssal_powder')});
    if(has('memil_powder'))c.push({t:'메밀가루를 내민다 (팥 2)',go:()=>nalTrade('memil_powder')});
    if(!F.nalJBluff)c.push({t:'허세 부리기: "흥, 팥 한 되가 뭐 그리 귀해!"',go:nalBluff});
  }
  c.push({t:'그만두기',go:null});
  talk([['날쌘',F.nalJDone?'팥 아껴 쓰고 고사떡 잘 쪄라. 부엉 영감은 팥 빛깔까지 따지니까.':(has('ssal_powder')||has('memil_powder'))?'빈손은 아니겠지? 뭘 내놓을 테냐?':'쌀가루 한 됫박엔 팥 한 되. 메밀가루면 두 되 쳐주지. 뭘 낼 테냐?',c]]);
}
function nalTrade(id){
  const F=G.f;takeItem(id,1);F.nalJDone=true;ledgerDone('nal_jangteo');
  const n=(id==='memil_powder'?2:1)+(F.nalJBluff?1:0);addItem('pat',n);
  if(id==='memil_powder')learn('nal:jangteo-memil');
  talk(id==='memil_powder'?[['날쌘','돌너머 메밀가루로군. 장터에선 귀하니 팥 '+n+'되 쳐주지. 잘 받은 줄 알아라.']]:[['날쌘','자, 팥 '+n+'되. 거래 끝이다.']]);
}
function nalBluff(){G.f.nalJBluff=true;rel('nal',1);
  talk([['너구리','흥, 팥 한 되가 뭐 그리 귀해!'],['날쌘','하! 대목 장사를 모르는 꼬마가 큰소리는.'],['날쌘','내 팥이 시시하단 말이냐? 좋아, 거래하면 한 되 더 얹어 주지.']],nalMenu);}

/* ---------- 숙소 마루: 쉬면 낮과 밤이 바뀐다 ---------- */
function restMaru(){
  const toNight=!night();
  talk([['너구리',toNight?'(숙소 마루에서 해가 지기를 기다렸다. 장터에 하나둘 등불이 켜진다.)':'(마루에서 한숨 자고 나니 날이 밝았다.)']],()=>{
    G.f.night=toNight;learn('maru:rest');toast(toNight?'밤이 되었다':'아침이 되었다');refreshGoal();});
}

/* ---------- 부엉 영감 (보부상단 접장): 밤에만 깨어 있다 ---------- */
function talkBueong(){
  const F=G.f;
  if(!night()){learn('bueong:night');
    talk([['부엉 영감','(처마 밑에서 꾸벅꾸벅 졸고 있다.)'],['너구리','(낮엔 주무시네. 숙소 마루에서 해 질 때까지 쉬자.)']]);return;}
  if(!F.bueongNight){F.bueongNight=true;F.bueongMet=true;learn('bueong:rule');ledger('bueong','부엉 영감','팥시루떡 1','아빠가 맡긴 짐');
    talk([['부엉 영감','부엉. 그 모자, 장부에 오른 너구리의 것이로구나. 네가 그 녀석 아들이냐.'],
      ['부엉 영감','녀석이 짐을 맡겼다. 보부상단에 맡긴 물건은 보부상에게만 내준다. 규칙이다.'],
      ['부엉 영감','보부상단 설 고사에 팥시루떡을 올려라. 정식 보부상으로 인정하고 신표를 내주마.']],()=>{if(has('patsirutteok'))bueongGive();});
    return;
  }
  if(!F.bueongDone){if(has('patsirutteok'))bueongGive();else talk([['부엉 영감','쌀가루 두 됫박에 팥 한 되다. 시루에 쪄서 팥시루떡을 가져오너라.']]);return;}
  if(!G.boss.dead){talk([['부엉 영감','그믐 밤엔 헌것들이 들썩인다. 밤에 숙소 창고 문 앞을 지켜라.']]);return;}
  talk([['부엉 영감','수고했다. 제 몫을 하는 보부상이로구나. 장부에 적어 두마.']]);
}
function bueongGive(){
  talk([['부엉 영감','고사떡을 가져왔구나.',[{t:'팥시루떡을 고사상에 올린다',go:()=>{
    const F=G.f;takeItem('patsirutteok',1);F.bueongDone=true;F.guard=true;ledgerDone('bueong');rel('bueong',1);learn('bueong:sinpyo');
    addItem('sinpyo',1);addItem('dad_memo',1);
    clue('j3','아빠의 메모','아빠가 숙소에 맡긴 짐 속 메모: "글자는 \'되돌림\'이었다. 값은 이미 치러졌다. 이번엔 내가 치른다. 북쪽 영산."');
    diary('j_memo','보부상 신표를 받았다. 아빠의 짐 속에 메모가 있었다. 아빠가 읽은 글자는 \'되돌림\'. "값은 이미 치러졌다. 이번엔 내가 치른다." 누가, 무슨 값을 치렀다는 걸까.');
    talk([['부엉 영감','붉은 팥이 제대로 들었구나. 고사상에 올릴 만하다.'],['부엉 영감','(부엉 영감이 고사상에 떡을 올리고 장부에 내 이름을 적는다.)'],
      ['부엉 영감','이제 너도 보부상단 식구다. 신표를 받아라.'],['부엉 영감','이건 그 녀석이 맡긴 짐이다. 받아라.'],
      ['너구리','(짐 속에 접힌 종이가 있다. 아빠 글씨다.)'],
      ['너구리','"글자는 \'되돌림\'이었다. 값은 이미 치러졌다. 이번엔 내가 치른다. 북쪽 영산."'],
      ['부엉 영감','오늘은 섣달그믐이다. 밤마다 장터 물건이 사라진다. 보부상의 의무로 오늘 밤 숙소 창고를 지켜라.']],()=>{toast('숙소 창고를 지키자');refreshGoal();});
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
  talk([['너구리','엄마 드릴 홍시 약떡, 다 됐다!'],['너구리','(숙소 처마의 까치가 내려와 떡 보자기를 물었다.)'],['너구리','엄마한테 전해 줘. 엄마 시루로 쪘다고.']],()=>{
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
