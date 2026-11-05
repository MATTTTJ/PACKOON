'use strict';
/* 구르기: 좌우로 움직이며 Space를 꾹 누르면(휴대폰은 구르기 단추, 결정 D-381) 몸을 말아 공처럼 굴러 빨리 간다. 떼면 일어선다.
   결정 D-94 (design/data/decisions.csv). 조작감 수치는 tuning.csv 의 roll_* 줄이다.
   - 짧게 누르면 지금처럼 점프한다. 멈춰 있을 때 누르면 바로 점프한다(기다림 없음).
     움직이는 중에 누르면 roll_hold_ms 동안 기다렸다가, 그 전에 떼면 뗄 때 점프하고 계속 누르고 있으면 구른다.
   - C·W·↑ 점프는 늘 바로 뛴다. 구르는 중에 점프하면 공 모양 그대로 뛰고, 내려와서도 Space가 눌려 있으면 계속 구른다.
   - 결정 D-143: ↑(W)을 누른 채 Space를 누르면 기다리지 않고 바로 뛴다(대각선 점프). Space를 기다리는 동안 C·W·↑로 뛰면
     기다림을 거둔다. 그래서 그 점프 뒤에 구르거나, Space를 뗄 때 한 번 더 뛰지 않는다. 기다리는 시간도 늘렸다(roll_hold_ms).
   - 구르는 동안에는 말걸기·줍기·휘두르기·채집을 하지 않는다. 대화·패널·경치·전투·미니게임·구역 전환 중에는 구르지 않는다.
   - 변신마다 되고 안 되고가 다르다(forms.js ROLL_FORMS). 안 되는 모습으로 처음 해 보면 아이 혼잣말을 한 번 띄운다. */
let rollHold=null,rolling=false,rollVel=0,rollAngle=0,rollTick=0;
/* 결정 D-721: 오래 구르면 탄력이 붙어 살짝 빨라지고(roll_boost_*), 너무 오래 구르면 어지러워 멈춰 선다(roll_dizzy_*).
   rollRun 은 쉬지 않고 굴러간 프레임 수(거의 멈추면 다시 센다), rollDizzy 는 남은 어지럼 프레임. 어지러운 동안은 걷지도 뛰지도 않고,
   어지럼이 풀린 뒤에는 구르기 단추·Space 를 한 번 뗐다 눌러야 다시 구른다 (사용자 피드백 2026-11-05) */
let rollRun=0,rollDizzy=0,rollNeedRelease=false;
const rollDizzyNow=()=>rollDizzy>0;
const spaceHeld=()=>!!(keys[' ']||touch.jump||touch.roll);
const rollSpec=()=>ROLL_FORMS[G?.form||'']||ROLL_FORMS[''];
const rollAllowedNow=()=>!!G&&G.started&&!G.ended&&!B&&!paused()&&!pickupPose&&!formClimb&&!inkOn&&!openMinigame()&&!rollDizzy&&!rollNeedRelease;
/* 점프 누름(Space·휴대폰 점프 버튼). 기다리기로 했으면 true(점프는 아직 하지 않는다), 아니면 false(원래대로 점프) */
function rollPress(){
  if(!rollAllowedNow()||!G.onGround||isDown())return false;
  if(rolling)return false;                       // 구르는 중의 점프는 원래 점프로 (공 모양 그대로)
  if(!(isLeft()||isRight()))return false;        // 멈춰 있으면 바로 점프
  if(keys['arrowup']||keys['w']||touch.up)return false;   // 결정 D-143: ↑과 함께 누르면 대각선 점프. 바로 뛴다
  const spec=rollSpec();
  // 못 구르는 모습: 혼잣말을 이미 봤으면 기다리지 않고 바로 점프한다.
  if(!spec.roll&&G.f.rollSaid?.[G.form||''])return false;
  rollHold={t0:performance.now(),form:G.form||''};
  return true;
}
/* 결정 D-381: 휴대폰 구르기 단추. 기다림 없이 바로 구르고, 누르는 동안 계속 구른다. 방향을 안 누르면 바라보는 쪽으로.
   공중에서 눌렀으면 내려서자마자 구른다(stepRoll). 못 구르는 모습이면 그 모습의 혼잣말을 띄운다. */
function rollButtonPress(){
  if(!rollAllowedNow()||rolling)return;
  rollHold=null;
  const spec=rollSpec();
  if(!spec.roll){toast(spec.say);return;}
  if(G.onGround)startRoll();
}
/* 결정 D-143: C·W·↑ 점프가 나가면 Space 기다림을 거둔다 (뒤늦게 구르거나, 뗄 때 한 번 더 뛰지 않게) */
function rollCancelHold(){if(rollHold)rollHold.done=true;}
/* 점프 뗌. 문턱 전에 떼면 그때 점프한다. 구르던 중이면 일어선다. */
function rollRelease(){
  if(rollHold){const h=rollHold;rollHold=null;if(!rolling&&!h.done)jumpOrDrop();}
  if(rolling&&!spaceHeld())endRoll();
}
function startRoll(){
  rolling=true;rollVel=G.vx;rollTick=0;
  Sound.playSfx(Sound.stepId(),{gain:.7});
  Vfx.rollStep();   // 결정 D-174: 바닥에 맞는 첫 튐 (눈덩이 / 흙먼지)
}
function endRoll(){if(!rolling)return;rolling=false;rollVel=0;rollTick=0;rollRun=0;}
/* 너무 오래 굴렀다: 공을 풀고 그 자리에 서서 어질어질 흔들린다 */
function startDizzy(){
  const T=TABLES.TUNING;endRoll();rollHold=null;rollDizzy=T.roll_dizzy_frames;rollNeedRelease=true;G.vx=0;
  Sound.land();
  if(!G.f.rollDizzySaid){G.f.rollDizzySaid=true;toast('어질어질… 너무 오래 굴렀다');}
}
/* step()에서 G.vx를 정한 뒤 부른다. 구르는 중이면 G.vx를 구르기 빠르기로 바꾼다. ax: 좌우 입력 -1·0·1 */
function stepRoll(ax){
  const T=TABLES.TUNING;
  if(rollNeedRelease&&!spaceHeld()&&!rollDizzy)rollNeedRelease=false;
  if(rollDizzy>0){if(!paused())rollDizzy--;G.vx=0;jumpQ=false;rollHold=null;if(!spaceHeld()&&rollDizzy<=0)rollNeedRelease=false;return;}
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
  if(touch.roll&&!rolling&&G.onGround&&rollAllowedNow()&&rollSpec().roll)startRoll();   // 결정 D-381
  if(!rolling)return;
  if(!spaceHeld()||!rollAllowedNow()||!rollSpec().roll){endRoll();return;}
  if(!ax&&touch.roll)ax=G.face||1;   // 결정 D-381: 구르기 단추만 누르면 바라보는 쪽으로
  // 결정 D-721: 쉬지 않고 구른 시간이 roll_boost_after 를 넘으면 roll_boost_ramp 동안 roll_boost_mult 배까지 빨라진다
  rollRun=ax&&Math.abs(rollVel)>.4?rollRun+1:Math.max(0,rollRun-3);
  if(rollRun>=T.roll_dizzy_after){startDizzy();return;}
  const boost=1+(T.roll_boost_mult-1)*clamp((rollRun-T.roll_boost_after)/T.roll_boost_ramp,0,1);
  const target=ax*T.field_move_speed*T[rollSpec().speed]*boost;
  rollVel+=(target-rollVel)/Math.max(1,T.roll_accel_frames);
  if(Math.abs(rollVel)<0.05&&!ax)rollVel=0;
  G.vx=rollVel;if(ax)G.face=ax>0?1:-1;
  // 굴러간 거리만큼 공이 돈다. 반지름으로 나누면 미끄러지지 않고 구르는 것처럼 보인다.
  rollAngle+=G.vx/rollSpec().r;rollTick++;
  Vfx.rollTrail();   // 결정 D-174: 눈·서리 위에서는 공 아래 눈보라와 고랑 자국
  if(G.onGround&&Math.abs(G.vx)>.4&&rollTick%T.roll_step_frames===0){
    Sound.playSfx(Sound.stepId(),{gain:.35});
    Vfx.rollStep();   // 눈덩이 튐(눈) / 흙먼지·흙덩이·잎 부스러기(그 밖)
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
  const pack='#d9a441';   // 결정 D-424: 보따리 겉모습은 늘 같다
  {const [x,y]=at(angle+Math.PI,r-3);R(x-2,y-2,5,5,pack);R(x-2,y-2,5,1,'#6e4f22');}               // 보따리
  {const [x,y]=at(angle+Math.PI*1.55,r-2);R(x-2,y-1,5,2,'#c39b55');}                              // 모자 챙
  {const [x,y]=at(angle+Math.PI*0.45,r-3);R(x,y,2,1,'#2a211b');R(x,y+1,1,1,'#fbf7ee');}             // 눈가 무늬
  if(G?.forms?.length){const [x,y]=at(angle+Math.PI*1.2,r-3);R(x,y,2,2,'#5f9d45');}                 // 잎사귀 끈
}
