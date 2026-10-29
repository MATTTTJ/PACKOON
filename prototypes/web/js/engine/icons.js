'use strict';
/* 아이콘 (16×16). 그림은 ICON_ART 에 아이템 id로 등록한다. ink=true 면 수첩 속 아빠 그림처럼 먹색 */
function inkify(col){const n=parseInt(col.slice(1),16);const r=n>>16,g=(n>>8)&255,b=n&255;const l=(0.3*r+0.59*g+0.11*b)/255;return 'rgba(38,29,22,'+(Math.min(1,(1-l)*0.95+0.12)).toFixed(2)+')';}
function icon(id,ink){
  const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');
  const P=(a,b,w,h,col)=>{x.fillStyle=ink?inkify(col):col;x.fillRect(a,b,w,h);};
  if(ICON_ART[id])ICON_ART[id](P);
  return c;
}

/* 레어도도 물건과 같은 16×16 픽셀 그림. 단계는 색과 실루엣으로 함께 구별한다. */
function rarityIcon(r){
  const c=document.createElement('canvas');c.width=c.height=16;
  c.className='rarity-mark'+(r===4?' rarity-gold':'');
  c.setAttribute('aria-hidden','true');
  const x=c.getContext('2d');
  const P=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  const colors=[
    ['#645647','#a3947f','#e1d0ac'],
    ['#164e40','#208966','#8cdec0'],
    ['#153b67','#246eae','#92dafa'],
    ['#4e285e','#9148b4','#e1aff5'],
    ['#704516','#e8ac28','#fff0ab']
  ];
  const [edge,gem,light]=colors[r];
  const leaf=(a,b,flip)=>{
    P(a+(flip?0:2),b,3,1,edge);P(a+1,b+1,4,1,edge);
    P(a,b+2,5,2,edge);P(a+(flip?2:0),b+4,3,1,edge);
    P(a+1,b+2,3,2,gem);P(a+(flip?1:3),b+1,1,2,light);
  };
  const berry=(a,b)=>{
    P(a+1,b,3,1,edge);P(a,b+1,5,3,edge);P(a+1,b+4,3,1,edge);
    P(a+1,b+1,3,3,gem);P(a+1,b+1,1,1,light);
  };
  if(r===0){
    P(8,3,4,1,edge);P(6,4,6,1,edge);P(5,5,7,3,edge);
    P(4,8,7,1,edge);P(4,9,5,1,edge);P(4,10,3,1,edge);
    P(7,5,4,2,gem);P(5,7,5,2,gem);P(9,4,2,2,light);
    P(6,8,2,1,light);P(3,11,2,1,edge);P(2,12,2,1,edge);
  }else if(r<4){
    P(7,5,1,9,edge);leaf(2,3,true);leaf(8,2,false);
    if(r>=2)berry(8,8);
    if(r===3)berry(2,9);
  }else{
    /* 큰 열매와 고정된 별빛은 동작 줄이기 상태에서도 남는다. */
    P(7,2,1,4,edge);leaf(8,1,false);
    P(5,5,5,1,edge);P(4,6,7,1,edge);P(3,7,9,5,edge);
    P(4,12,7,1,edge);P(5,13,5,1,edge);
    P(5,6,5,6,gem);P(4,7,7,4,gem);P(5,12,5,1,gem);
    P(5,7,2,3,light);P(7,7,2,1,light);P(9,10,1,2,'#bd7b19');
    P(1,3,1,3,light);P(0,4,3,1,light);
    P(13,11,1,3,light);P(12,12,3,1,light);
  }
  return c;
}
