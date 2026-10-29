'use strict';
/* 단풍골 전투: 엉킨 칡(보스)과 무쇠의 시험(NPC 전투). 원본 표: design/data/bosses.csv · boss_parts.csv */
(()=>{
function drawKudzu(c){
  const cx=LW/2,cy=EY;const arm=part('arm'),root=part('root'),core=part('core');
  const sway=Math.sin(B.time*0.03)*6;
  // 뿌리
  {const o=shk(root),col=partCol(root);const len=root.broken?0.45:1;
    [[-150,110],[-80,118],[-20,122],[55,118],[140,108]].forEach(([dx,dy],i)=>{brush(c,[[cx+o,cy+28],[cx+dx*0.45+o,cy+40+dy*0.3],[cx+dx*len+o,cy+28+dy*len*0.85]],10-i%2*3,col);
      brush(c,[[cx+dx*len*0.7+o,cy+28+dy*len*0.6],[cx+dx*len*0.8+12+o,cy+34+dy*len*0.75]],3,col);});}
  // 덩굴손
  {const o=shk(arm),col=partCol(arm);const droop=arm.broken?60:0;
    [-1,1].forEach(s=>{const pts=[[cx+s*30+o,cy-6],[cx+s*90+o,cy-50+sway*s+droop],[cx+s*150+o,cy-74+droop*1.4],[cx+s*178+o,cy-40+droop*1.5],[cx+s*160+o,cy-16+droop*1.5]];
      brush(c,pts,13,col);
      [[0.35,-62],[0.62,-80],[0.85,-48]].forEach(([k,dy],i)=>{const lx=cx+s*(40+k*140)+o,ly=cy+dy*0.9+droop*k+sway*s*0.5;c.save();c.translate(lx,ly);c.rotate(s*0.6+i);blob(c,0,0,11,5,col===INK?'#2a2a22':col,arm.broken?1:0.85);c.restore();});});}
  // 심
  {const o=shk(core),col=partCol(core);
    blob(c,cx+o,cy+4,50,44,col===INK?'#231e19':col,core.broken?0.25:1);
    for(let i=0;i<4;i++)brush(c,[[cx-38+o,cy-10+i*12],[cx+o,cy-2+i*14+(i%2?6:-6)],[cx+40+o,cy-8+i*12]],3,'#4a4038',core.broken?0.2:0.7);
    if(core.broken){brush(c,[[cx-10,cy-30],[cx+4,cy],[cx-6,cy+30]],3,'#efe3c8');blob(c,cx-16,cy-8,7,2,'#efe3c8');blob(c,cx+16,cy-8,7,2,'#efe3c8');}
    else{const [ex,ey]=lookAt(cx,cy);blob(c,cx-17+o,cy-8,10,8,'#efe3c8');blob(c,cx+17+o,cy-8,10,8,'#efe3c8');blob(c,cx-17+ex+o,cy-8+ey,4.5,5,INK);blob(c,cx+17+ex+o,cy-8+ey,4.5,5,INK);
      brush(c,[[cx-28+o,cy-22],[cx-10+o,cy-17]],3,INK);brush(c,[[cx+28+o,cy-22],[cx+10+o,cy-17]],3,INK);}
    // 꽃눈
    brush(c,[[cx+o,cy-40],[cx+3+o,cy-56]],4,col,core.broken?0.3:1);blob(c,cx+4+o,cy-62,8,10,col===INK?'#5a3f6a':col,core.broken?0.25:0.9);
    if(coreHidden()){brush(c,[[cx-70,cy-20],[cx,cy+10+sway],[cx+70,cy-26]],9,INK,0.85);brush(c,[[cx-60,cy+30],[cx+10,cy-6-sway],[cx+66,cy+24]],8,INK,0.8);}
  }
}
function drawMusoe(c){
  const cx=LW/2,cy=EY;const ham=part('hammer'),bel=part('bellows'),core=part('core');
  const bob=Math.sin(B.time*0.05)*2;
  // 몸
  c.save();c.fillStyle='rgba(29,24,20,.14)';c.beginPath();c.ellipse(cx,cy+60+bob,92,62,0,0,Math.PI*2);c.fill();c.restore();
  brush(c,[[cx-88,cy+80],[cx-92,cy+40+bob],[cx-50,cy+4+bob],[cx+50,cy+4+bob],[cx+92,cy+40+bob],[cx+88,cy+80]],6,INK);
  brush(c,[[cx-36,cy+20+bob],[cx-40,cy+90],[cx+40,cy+90],[cx+36,cy+20+bob]],4,'#5a3a24',0.9);
  // 풀무 (왼쪽)
  {const o=shk(bel),col=partCol(bel);const flat=bel.broken?0.45:1+Math.sin(B.time*0.08)*0.08;const bx=cx-150+o,by=cy+52;
    c.save();c.fillStyle=bel.broken?'rgba(29,24,20,.12)':'rgba(70,46,30,.35)';c.beginPath();c.moveTo(bx-40,by-30*flat);c.lineTo(bx+26,by-12*flat);c.lineTo(bx+26,by+12*flat);c.lineTo(bx-40,by+30*flat);c.closePath();c.fill();c.restore();
    brush(c,[[bx-40,by-30*flat],[bx+26,by-12*flat],[bx+26,by+12*flat],[bx-40,by+30*flat],[bx-40,by-30*flat]],5,col);
    brush(c,[[bx+26,by],[bx+56,by]],7,col);brush(c,[[bx-40,by-30*flat],[bx-66,by-40*flat]],4,col);brush(c,[[bx-40,by+30*flat],[bx-66,by+40*flat]],4,col);}
  // 망치 팔 (오른쪽)
  {const o=shk(ham),col=partCol(ham);const up=ham.broken?-1:(B.st==='tell'&&B.cur===ham?1.3:1);
    const sx=cx+62,sy=cy+20+bob,hx=cx+150+o,hy=ham.broken?cy+96:cy-58*up+bob;
    brush(c,[[sx,sy],[(sx+hx)/2+10,(sy+hy)/2+10],[hx,hy]],14,col);
    brush(c,[[hx,hy],[hx+12,hy-36]],5,'#5a3a24');
    c.save();c.translate(hx+14,hy-44);c.rotate(-0.25);c.fillStyle=col===INK?'#26211c':col;c.globalAlpha=ham.broken?0.3:1;c.fillRect(-26,-12,52,24);c.restore();}
  // 머리 (고집)
  {const o=shk(core),col=partCol(core);const hx=cx+o,hy=cy-38+bob;
    blob(c,hx,hy,46,38,'#f4ead4');brush(c,[[hx-44,hy+6],[hx-40,hy-26],[hx,hy-40],[hx+40,hy-26],[hx+44,hy+6],[hx+20,hy+34],[hx-20,hy+34],[hx-44,hy+6]],4,col);
    brush(c,[[hx-22,hy-36],[hx-20,hy-6],[hx-26,hy+18]],12,col,core.broken?0.4:1);brush(c,[[hx+22,hy-36],[hx+20,hy-6],[hx+26,hy+18]],12,col,core.broken?0.4:1);
    blob(c,hx,hy+16,7,5,INK);
    if(core.broken||(B.st==='end'&&B.result!=='lose')){brush(c,[[hx-28,hy-2],[hx-16,hy+2]],3,'#f4ead4');brush(c,[[hx+16,hy+2],[hx+28,hy-2]],3,'#f4ead4');brush(c,[[hx-12,hy+26],[hx,hy+29],[hx+12,hy+26]],3,INK);}
    else{const [ex,ey]=lookAt(hx,hy);blob(c,hx-21+ex,hy-2+ey,3.5,3.5,'#f4ead4');blob(c,hx+21+ex,hy-2+ey,3.5,3.5,'#f4ead4');
      brush(c,[[hx-34,hy-18],[hx-12,hy-10]],4,INK);brush(c,[[hx+34,hy-18],[hx+12,hy-10]],4,INK);brush(c,[[hx-10,hy+26],[hx+10,hy+26]],3,INK);}
    if(coreHidden()){c.save();c.strokeStyle=INK;c.globalAlpha=.55;c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.arc(hx,hy,54+i*7,Math.PI*1.1,Math.PI*1.9);c.stroke();}c.restore();}
  }
}

defineEnemies({
  kudzu:{name:'엉킨 칡',calmLabel:'진정',
    intro:'칡덩굴이 당산나무를 놓지 않으려 몸부림친다.',
    howto:true,
    parts:tableParts('kudzu',{arm:{atk:'sweep',tell:'덩굴손이 높이 치켜올라간다…'},root:{atk:'spike',tell:'땅속에서 뿌리가 꿈틀거린다…'},core:{atk:'seed',tell:'심이 씨앗을 머금는다…'}}),
    likes:TABLES.CALM.kudzu,likeText:'버섯 향에 덩굴이 잠시 느슨해진다.',
    coreHidden:'심이 덩굴 뒤에 숨어 있다. 덩굴손이나 뿌리를 먼저 꺾자.',
    coreShown:'심이 드러났다! 이제 심을 노릴 수 있다.',
    calmWin:'엉킨 칡이 스르르 풀리며 당산나무를 놓아준다.',calmGift:'kflower',
    win:'칡의 심이 갈라지며 덩굴이 힘없이 흘러내린다.',
    lose:'덩굴에 밀려 숲 어귀로 물러났다.',
    draw:drawKudzu},
  /* 무쇠는 피하기만 하는 시험이라 핵심 부위를 쓰지 않는다 (표의 '호통' 핵심 표시를 끔. 켜면 그림에 가려짐 표시가 생긴다) */
  musoe:{name:'무쇠',calmLabel:'마음',npc:true,dodge:6,
    forgeTrial:{sequence:['hammer','bellows','core'],repeatText:'"아까 배운 대로!"'},
    intro:'[시험판] "아, 아저씨! 갑자기 왜 이래요!" 먹선이 생기면 작업 자리에서 손을 빼자.',
    bonkText:'"어린 녀석이 어른한테 연장을 들이대?" 딱! 꿀밤이 날아왔다.',
    parts:tableParts('musoe',{hammer:{atk:'forgeHammer',tell:'모루 위 세로 먹줄! 내려치기 전에 그 칸을 비워라.'},bellows:{atk:'forgeWind',tell:'가는 붓선이 바람길을 그린다. 오른쪽 낮은 판 아래 쉼터로!'},core:{atk:'forgeShout',tell:'입 앞 먹선이 부푼다. 부채꼴 양옆으로 손을 빼라.',core:false}}),
    likes:TABLES.CALM.musoe,likeText:'"…출출하던 참이었다." 무쇠의 어깨가 조금 내려간다.',
    coreHidden:'',
    coreShown:'무쇠의 고집이 흔들린다. 이제 고집을 노릴 수 있다!',
    calmWin:'무쇠가 망치를 내려놓는다. "…됐다. 녀석을 꼭 닮았구나."',
    win:'끝까지 버텨 냈다! 무쇠가 망치를 내려놓는다.',
    lose:'무쇠의 기세에 밀려 대장간 밖으로 굴러 나왔다.',
    /* 맞은 횟수에 따라 덤: 0대면 숯, 1~2대면 주먹밥 (bosses.csv 비고) */
    onWin(B){if(B.hits===0){B.loot.push('coal');B.bonus='한 대도 안 맞았다! 무쇠가 숯 한 덩이를 던져 준다.';}else if(B.hits<=2){B.loot.push('rice');B.bonus='무쇠가 주먹밥을 하나 내준다. "잘 버텼다."';}else B.bonus='간신히 버텼다. 무쇠가 피식 웃는다.';},
    draw:drawMusoe},
});
})();
