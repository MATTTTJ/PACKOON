'use strict';
/* 구르기: 좌우로 움직이며 Space(휴대폰은 점프 버튼)를 꾹 누르면 몸을 말아 공처럼 굴러 빨리 간다. 떼면 일어선다.
   결정 D-94 (design/data/decisions.csv). 조작감 수치는 tuning.csv 의 roll_* 줄이다.
   - 짧게 누르면 지금처럼 점프한다. 멈춰 있을 때 누르면 바로 점프한다(기다림 없음).
     움직이는 중에 누르면 roll_hold_ms 동안 기다렸다가, 그 전에 떼면 뗄 때 점프하고 계속 누르고 있으면 구른다.
   - C·W·↑ 점프는 늘 바로 뛴다. 구르는 중에 점프하면 공 모양 그대로 뛰고, 내려와서도 Space가 눌려 있으면 계속 구른다.
   - 구르는 동안에는 말걸기·줍기·휘두르기·채집을 하지 않는다. 대화·패널·경치·전투·미니게임·구역 전환 중에는 구르지 않는다.
   - 변신마다 되고 안 되고가 다르다(forms.js ROLL_FORMS). 안 되는 모습으로 처음 해 보면 아이 혼잣말을 한 번 띄운다. */
let rollHold=null,rolling=false,rollVel=0,rollAngle=0,rollTick=0;
const spaceHeld=()=>!!(keys[' ']||touch.jump);
const rollSpec=()=>ROLL_FORMS[G?.form||'']||ROLL_FORMS[''];
const rollAllowedNow=()=>!!G&&G.started&&!G.ended&&!B&&!paused()&&!pickupPose&&!formClimb&&!inkOn&&!openMinigame();
/* 점프 누름(Space·휴대폰 점프 버튼). 기다리기로 했으면 true(점프는 아직 하지 않는다), 아니면 false(원래대로 점프) */
function rollPress(){
  if(!rollAllowedNow()||!G.onGround||isDown())return false;
  if(rolling)return false;                       // 구르는 중의 점프는 원래 점프로 (공 모양 그대로)
  if(!(isLeft()||isRight()))return false;        // 멈춰 있으면 바로 점프
  const spec=rollSpec();
  // 못 구르는 모습: 혼잣말을 이미 봤으면 기다리지 않고 바로 점프한다.
  if(!spec.roll&&G.f.rollSaid?.[G.form||''])return false;
  rollHold={t0:performance.now(),form:G.form||''};
  return true;
}
/* 점프 뗌. 문턱 전에 떼면 그때 점프한다. 구르던 중이면 일어선다. */
function rollRelease(){
  if(rollHold){const h=rollHold;rollHold=null;if(!rolling&&!h.done)jumpOrDrop();}
  if(rolling&&!spaceHeld())endRoll();
}
function startRoll(){
  rolling=true;rollVel=G.vx;rollTick=0;
  Sound.playSfx(G.region==='yeongsan'?'footstep_snow':G.region==='jangteo'?'footstep_market':'footstep_leaf',{gain:.7});
  Vfx.dust();
}
function endRoll(){if(!rolling)return;rolling=false;rollVel=0;rollTick=0;}
/* step()에서 G.vx를 정한 뒤 부른다. 구르는 중이면 G.vx를 구르기 빠르기로 바꾼다. ax: 좌우 입력 -1·0·1 */
function stepRoll(ax){
  const T=TABLES.TUNING;
  if(rollHold&&!rollHold.done){
    if(!spaceHeld()||!rollAllowedNow()){rollHold=null;}
    else if(performance.now()-rollHold.t0>=T.roll_hold_ms){
      rollHold.done=true;
      const spec=rollSpec();
      if(spec.roll&&G.onGround)startRoll();
      else if(!spec.roll){
        const said=G.f.rollSaid||(G.f.rollSaid={});
        if(!said[G.form||'']){said[G.form||'']=true;toast(spec.say);}
      }
    }
  }
  if(!rolling)return;
  if(!spaceHeld()||!rollAllowedNow()||!rollSpec().roll){endRoll();return;}
  const target=ax*T.field_move_speed*T[rollSpec().speed];
  rollVel+=(target-rollVel)/Math.max(1,T.roll_accel_frames);
  if(Math.abs(rollVel)<0.05&&!ax)rollVel=0;
  G.vx=rollVel;if(ax)G.face=ax>0?1:-1;
  // 굴러간 거리만큼 공이 돈다. 반지름으로 나누면 미끄러지지 않고 구르는 것처럼 보인다.
  rollAngle+=G.vx/rollSpec().r;rollTick++;
  if(G.onGround&&Math.abs(G.vx)>.4&&rollTick%T.roll_step_frames===0){
    Sound.playSfx(G.region==='yeongsan'?'footstep_snow':G.region==='jangteo'?'footstep_market':'footstep_leaf',{gain:.35});
    if(!Vfx.reducedMotion)Vfx.dust();
  }
}
/* 구르기 공 그리기. (ox,oy)는 발 자리, 공은 그 위에 놓인다 */
function drawRollAt(ox,oy,form,angle){
  const spec=ROLL_FORMS[form]||ROLL_FORMS[''],r=spec.r,cx=Math.round(ox),cy=Math.round(oy-r);
  const disc=(rad,col)=>{for(let y=-rad;y<=rad;y++){const hw=Math.round(Math.sqrt(Math.max(0,rad*rad-y*y)));R(cx-hw,cy+y,hw*2,1,col);}};
  const at=(a,d)=>[Math.round(cx+Math.cos(a)*d),Math.round(cy+Math.sin(a)*d)];
  if(form==='squirrel'){
    // 다람쥐: 큰 꼬리로 몸을 감싼 작은 공. 꼬리 털(밝은 주황)이 반 바퀴를 덮고 함께 돈다.
    disc(r,'#2e1d12');disc(r-1,'#c5672b');
    for(let i=0;i<14;i++){const a=angle+i*Math.PI/14,[x,y]=at(a,r-2);R(x-1,y-1,3,3,i%4===0?'#e9a35a':'#d88a3e');}
    const [ex,ey]=at(angle+Math.PI*1.35,r-3);R(ex,ey,1,1,'#1d120b');           // 눈
    const [nx,ny]=at(angle+Math.PI*1.6,r-2);R(nx,ny,1,1,'#3a2416');            // 코
    return;
  }
  // 너구리: 회색 몸을 말고, 줄무늬 꼬리가 공 둘레를 감는다. 등 보따리와 밀짚모자 챙이 공에 붙어 같이 돈다.
  disc(r,'#2a211b');disc(r-1,'#8c8070');
  for(let i=0;i<9;i++){const [x,y]=at(angle+i*0.3,r-2.5);R(x-1,y-1,2,2,Math.floor(i/2)%2?'#2a211b':'#b3a58f');}   // 꼬리 줄무늬 (공 테두리 안쪽을 감는다)
  const stage=typeof backpackStage==='function'?backpackStage():0;
  const pack=['#d9a441','#99733d','#a37743','#61462d'][stage]||'#d9a441';
  {const [x,y]=at(angle+Math.PI,r-3);R(x-2,y-2,5,5,pack);R(x-2,y-2,5,1,'#6e4f22');}               // 보따리
  {const [x,y]=at(angle+Math.PI*1.55,r-2);R(x-2,y-1,5,2,'#c39b55');}                              // 모자 챙
  {const [x,y]=at(angle+Math.PI*0.45,r-3);R(x,y,2,1,'#2a211b');R(x,y+1,1,1,'#fbf7ee');}             // 눈가 무늬
  if(G?.forms?.length){const [x,y]=at(angle+Math.PI*1.2,r-3);R(x,y,2,2,'#5f9d45');}                 // 잎사귀 끈
}
