'use strict';

/* 결정 D-1103: 채집물 사이 최소 간격 (사용자 피드백 2026-11-07 "채집물간 상호작용에 무리 없도록 적당한 최소 거리를 항상 가지고 떨어져 있어야 한다").
   모든 지역·구역의 처음 상태에서 캐는 자리(digs: 흙더미·눈 둔덕·다람쥐 몫·얼음 구멍)와 줍는 자리(pickups)를 모은다.
   - 채집물끼리: 가로 차이가 gather_min_gap 보다 작으면 걸린다 (세로가 field_interact_y 안일 때. 다른 발판 위는 서로 가로막지 않는다).
   - 채집물과 말 걸기·문·조사·길손·도장·경치: 가로 차이가 gather_interact_gap 보다 작으면 걸린다.
     그 안이면 채집 자리에 서도 'E · 말 걸기' 안내가 채집 안내를 덮는다(field.js updateOverlay 는 상호작용이 먼저다).
   변신해야 보이는 자리(수리부엉이 숨은 물건, 수달 얼음 구멍)도 땅 위 자리는 같아서 함께 본다. */
const regions=['galchamgol','dolneomeo','jangteo','yeongsan'];
const j=JSON.stringify;
const COLLECT=`(()=>{
  const out={gathers:[],others:[]};
  const yOf=a=>Math.round(a.y??fieldGround());
  for(const d of fieldItems('digs'))out.gathers.push({kind:d.cache?'cache':'dig',id:d.id||d.item,item:d.item,x:Math.round(d.x),y:yOf(d)});
  for(const p of fieldItems('pickups'))out.gathers.push({kind:'pickup',id:p.id||p.item,item:p.item,x:Math.round(p.x),y:yOf(p)});
  for(const n of fieldNpcs())out.others.push({kind:'npc',id:n.id,x:Math.round(n.x),y:yOf(n)});
  for(const k of ['wanderers','doors','examines','vistas','stamps'])for(const p of zoneObjects(k))out.others.push({kind:k,id:p.id||p.label||k,x:Math.round(p.x),y:yOf(p)});
  return out;})()`;
async function collectSpacing(b){
  const rows=[];
  for(const region of regions){
    await b.navigate(b.url+'?region='+region);
    await b.until("typeof G!=='undefined'&&!!G&&!!REG",{timeout:15000});
    await b.eval("(()=>{try{TitleScreen.close()}catch(_){};G.started=true;G.f.momNoteSeen=true;resetScreens();closePanels();})()");
    const zones=await b.eval('Object.keys(REG.zones||{})');
    for(const zone of zones){
      await b.eval(`(()=>{closePanels();$('dlg').hidden=true;dlgQ.length=0;changeZone(${j(zone)});})()`);
      await b.until(`G.zone===${j(zone)}&&!zoneMotion&&zoneFade===0`,{timeout:5000,label:region+'/'+zone+' 도착'});
      rows.push({region,zone,...await b.eval(COLLECT)});
    }
  }
  return rows;
}
function spacingProblems(rows,T){
  const gap=T.gather_min_gap,igap=T.gather_interact_gap,band=T.field_interact_y,out=[];
  for(const r of rows){
    const g=r.gathers;
    for(let i=0;i<g.length;i++){
      for(let k=i+1;k<g.length;k++){
        const a=g[i],c=g[k];
        if(Math.abs(a.y-c.y)<band&&Math.abs(a.x-c.x)<gap)out.push({rule:'gather-gap',region:r.region,zone:r.zone,a,b:c,dx:Math.abs(a.x-c.x),want:gap});
      }
      for(const o of r.others){
        const a=g[i];
        if(Math.abs(a.y-o.y)<band&&Math.abs(a.x-o.x)<igap)out.push({rule:'gather-interact-gap',region:r.region,zone:r.zone,a,b:o,dx:Math.abs(a.x-o.x),want:igap});
      }
    }
  }
  return out;
}
async function runSpacing(b,check,records){
  b.scene='map / gather spacing';
  const rows=await collectSpacing(b);
  const T=await b.eval('({gather_min_gap:TABLES.TUNING.gather_min_gap,gather_interact_gap:TABLES.TUNING.gather_interact_gap,field_interact_y:TABLES.TUNING.field_interact_y})');
  const problems=spacingProblems(rows,T);
  for(const p of problems)
    check(false,p.rule,`${p.region}/${p.zone}: ${p.a.kind} ${p.a.id}(x ${p.a.x})와 ${p.b.kind} ${p.b.id}(x ${p.b.x})가 ${p.dx}px 떨어져 있다. ${p.want}px 이상 떨어져야 한다.`,p);
  records.push({stage:'gather-spacing',zones:rows.length,gathers:rows.reduce((s,r)=>s+r.gathers.length,0),problems:problems.length});
}
module.exports={runSpacing,collectSpacing,spacingProblems};
