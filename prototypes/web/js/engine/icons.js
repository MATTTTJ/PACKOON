'use strict';
/* 아이콘 (16×16). 그림은 ICON_ART 에 아이템 id로 등록한다. ink=true 면 도감용 먹색 */
function inkify(col){const n=parseInt(col.slice(1),16);const r=n>>16,g=(n>>8)&255,b=n&255;const l=(0.3*r+0.59*g+0.11*b)/255;return 'rgba(38,29,22,'+(Math.min(1,(1-l)*0.95+0.12)).toFixed(2)+')';}
function icon(id,ink){
  const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');
  const P=(a,b,w,h,col)=>{x.fillStyle=ink?inkify(col):col;x.fillRect(a,b,w,h);};
  if(ICON_ART[id])ICON_ART[id](P);
  return c;
}
