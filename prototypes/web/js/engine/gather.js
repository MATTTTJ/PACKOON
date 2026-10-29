'use strict';
/* 채집: 흙더미(G.digs)를 휘두르면 열리는 가벼운 타이밍 미니게임. 아이템별 설정은 defineGather 로 지역이 넣는다.
   {title, hits:성공 횟수, zw:판정 폭(%), speed, hint, ok:[성공할 때 글], miss:빗나갈 때 글}
   처음 캐면 남는 일기는 지역의 gatherDiary:[id, 글] */
const gat={d:null,cfg:null,pos:0,dir:1,hits:0,miss:0,zone:[40,58],cool:0};
function openGather(d){
  const cfg=GATHER[d.item];d.busy=true;
  Object.assign(gat,{d,cfg,pos:0,dir:1,hits:0,miss:0,cool:0});setZone();
  $('gTitle').textContent=cfg.title;$('ghint').textContent=cfg.hint;$('gstrike').textContent=(cfg.hits>1?'파기':'꺾기')+(TOUCH?'':' (Space · J)');
  $('gather').hidden=false;drawGather();
}
function setZone(){const w=gat.cfg.zw+(gat.miss>=2?12:0);const a=10+Math.random()*(80-w);gat.zone=[a,a+w];}
function drawGather(){
  $('gzone').style.left=gat.zone[0]+'%';$('gzone').style.width=(gat.zone[1]-gat.zone[0])+'%';$('gmark').style.left=gat.pos+'%';
  $('gpips').innerHTML=Array.from({length:gat.cfg.hits},(_,i)=>'<span class="pip'+(i<gat.hits?' on':'')+'"></span>').join('');
}
function gatherStep(){
  gat.pos+=gat.dir*(gat.cfg.speed+gat.hits*0.3);
  if(gat.pos>=100){gat.pos=100;gat.dir=-1;}if(gat.pos<=0){gat.pos=0;gat.dir=1;}
  if(gat.cool>0)gat.cool--;drawGather();
}
function gStrike(){
  if(gat.cool>0||!gat.cfg||gat.hits>=gat.cfg.hits)return;gat.cool=12;
  if(gat.pos>=gat.zone[0]&&gat.pos<=gat.zone[1]){
    Sound.gather(true);gat.hits++;
    if(gat.hits>=gat.cfg.hits){drawGather();setTimeout(finishGather,300);return;}
    $('ghint').textContent=gat.cfg.ok[gat.hits-1]||'좋아!';setZone();
  }else{
    Sound.gather(false);gat.miss++;
    $('ghint').innerHTML='<b>'+gat.cfg.miss+'</b>'+(gat.miss===2?' (무른 자리가 넓어졌다)':'');
    if(gat.miss===2)setZone();
  }
  drawGather();
}
function finishGather(){
  const d=gat.d,id=d.item;$('gather').hidden=true;d.done=true;d.busy=false;
  const perfect=gat.miss===0;Vfx.gather(d.x,GROUND-4);
  addItem(id,perfect?2:1);
  if(perfect)setTimeout(()=>toast('흠집 하나 없이 캐냈다! '+ITEMS[id].n+' ×2'),700);
  if(REG.gatherDiary)diary(REG.gatherDiary[0],REG.gatherDiary[1]);
  gat.cfg=null;
}
$('gstrike').addEventListener('pointerdown',e=>{e.preventDefault();gStrike();});
$('gbar').addEventListener('pointerdown',e=>{e.preventDefault();gStrike();});
defineMinigame({id:'gather',step:gatherStep,hit:gStrike});
