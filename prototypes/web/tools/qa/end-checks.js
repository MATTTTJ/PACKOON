'use strict';

// 결정 D-847: 구역 끝 검사. 화면이 구역 밖(맵이 없는 곳)을 보여 주지 않는지, 막다른 끝에서는 덤불·바위 앞에서 멈추는지 본다.
// 결정 D-845: 돌너머 성황당 비탈은 산양이 아니어도 끝내 꼭대기까지 오를 수 있어야 한다.
const regions=['galchamgol','dolneomeo','jangteo','yeongsan'];
const j=JSON.stringify;
async function runZoneEnds(b,check,records,picture){
  b.scene='map / zone ends';
  const rows=[];
  for(const region of regions){
    await b.navigate(b.url+'?region='+region);
    await b.until("typeof G!=='undefined'&&!!G&&!!REG",{timeout:15000});
    await b.eval("(()=>{try{TitleScreen.close()}catch(_){};G.started=true;G.f.momNoteSeen=true;resetScreens();closePanels();})()");
    const zones=await b.eval('Object.keys(REG.zones||{})');
    for(const zone of zones){
      await b.eval(`changeZone(${j(zone)})`);await b.until('!zoneMotion&&zoneFade===0');
      const info=await b.eval("({w:fieldWidth(),margin:TABLES.TUNING.field_edge_margin,dead:{left:deadEnd(zoneDef(),'left'),right:deadEnd(zoneDef(),'right')},maxX:fieldDef().maxX?fieldCall('maxX'):null})");
      for(const side of ['left','right']){
        // 끝 가까이에 세우고 그쪽으로 걸어 본다. 나가는 길이 있는 쪽은 넘어가기 전 자리에 둔다
        const start=side==='left'?(info.dead.left?info.margin+40:40):(info.dead.right?info.w-info.margin-40:info.w-40);
        await b.eval(`(()=>{closePanels();$('dlg').hidden=true;G.px=${start};G.py=surfaceY(G.px);G.vy=0;G.onGround=true;G.cam=clamp(G.px-W*.42,0,Math.max(0,fieldWidth()-W));})()`);
        if(info.dead[side]&&(side==='left'||info.maxX===null)){
          const key=side==='left'?'ArrowLeft':'ArrowRight';
          await b.key(key,'keyDown');await b.wait(900);await b.key(key,'keyUp');
        }
        await b.wait(450);
        const s=await b.eval('({zone:G.zone,px:Math.round(G.px),cam:G.cam,w:fieldWidth(),dlg:!$("dlg").hidden})');
        const row={region,zone,side,dead:info.dead[side],...s};rows.push(row);
        if(s.zone!==zone)continue;   // 이야기·문 때문에 구역이 바뀌었으면 화면 검사만 건너뛴다
        check(s.cam>=-0.01&&s.cam<=Math.max(0,s.w-400)+0.01,'zone-end-camera',`${region}/${zone} ${side} 끝에서 화면이 구역 밖(맵이 없는 곳)을 보여 준다.`,row);
        if(info.dead[side]&&!s.dlg&&(side==='left'||info.maxX===null)){
          const want=side==='left'?info.margin:info.w-info.margin;
          check(Math.abs(s.px-want)<=1,'zone-end-stop',`${region}/${zone} 막다른 ${side} 끝에서 덤불·바위 앞에 멈추지 않았다.`,{...row,want});
        }
      }
    }
  }
  records.push({stage:'zone-ends',rows});
  // 성황당 비탈 (결정 D-1433): 너구리 모습은 오른쪽을 눌러도 첫 비탈 들머리에서 막히고, 산양 모습은 꼭대기에 닿는다
  await b.navigate(b.url+'?region=dolneomeo');
  await b.until("typeof G!=='undefined'&&!!G&&!!REG",{timeout:15000});
  await b.eval("(()=>{try{TitleScreen.close()}catch(_){};G.started=true;G.f.momNoteSeen=true;G.f.ppuriPassed=true;G.f.dolGolemSeen=true;G.f.dolSlopeSlip=true;if(!G.forms.includes('goat'))G.forms.push('goat');resetScreens();closePanels();changeZone('shrine');})()");
  await b.until('!zoneMotion&&zoneFade===0');
  await b.wait(300);await b.eval("(()=>{closePanels();$('dlg').hidden=true;G.form='';G.px=1300;G.py=surfaceY(1300);G.vy=0;G.onGround=true;G.boss.dead=true;})()");
  await b.key('ArrowRight','keyDown');await b.wait(3000);
  const raccoon=await b.eval('({px:G.px,py:G.py})');
  check(raccoon.px<1360,'shrine-slope-goat-only','성황당 언 비탈을 산양이 아닌 너구리 모습으로 올랐다.',raccoon);
  await b.eval("(()=>{closePanels();G.form='goat';})()");
  let top=null;
  try{await b.until('G.px>=1600&&G.py<=REGIONS.dolneomeo.shrineSummitY()+0.5',{timeout:30000});top=await b.eval('({px:G.px,py:G.py})');}
  catch(_){top=null;}
  await b.key('ArrowRight','keyUp');
  const slope=await b.eval("({px:G.px,py:G.py,surface:surfaceY(G.px)})");
  check(!!top,'shrine-slope-climb','성황당 비탈을 산양 모습으로 걸어 꼭대기에 오르지 못했다.',slope);
  check(Math.abs(slope.py-slope.surface)<1.5,'shrine-slope-surface','성황당 비탈 위에서 발이 땅 높이에 붙어 있지 않다.',slope);
  records.push({stage:'shrine-slope',raccoon,top,slope});
  await picture('shrine-summit');
}
module.exports={runZoneEnds};
