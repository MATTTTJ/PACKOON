'use strict';
/* 사연 장면과 길손 대사의 공용 틀. 예전엔 지역 이야기 파일마다 따로 있어서 동작이 조금씩 달랐다. */

/* 결정 D-352: 받는 줄(gotLine)이 든 대화는 끝까지 넘겼을 때 보따리에 넣는다.
   talkGive(줄, 뒤 할 일)는 줄 안의 gotLine 물건을 대화가 끝날 때 넣고 뒤 할 일을 부른다.
   물건 이름·개수를 대사 줄과 addItem 두 곳에 따로 적지 않게 한다 (두 곳이 어긋나던 일).
   대화가 중간에 닫히면(교환 단추 등) 물건도 들어오지 않는다. 그 대화를 다시 열면 그때 받는다. */
function giveLines(lines){for(const L of lines)if(L&&L.give&&!L.given)for(const [id,n=1] of L.give)addItem(id,n);}
function talkGive(lines,after,options){talk(lines,()=>{giveLines(lines);if(after)after();},options);}

/* 결정 D-350: 사연 장면 arcScene(진행값, 줄, 수첩 글, 뒤 할 일).
   - 사연을 켰을 때(arcsEnabled) 한 번만 연다. 이미 본 장면이면 아무것도 하지 않고 false.
   - 마지막 줄까지 넘겨야 진행값·수첩·받은 물건·뒤 할 일이 붙는다. 끝까지 들어야 기록한다.
   - 중간에 닫히면 아무것도 남지 않고, 다음에 처음부터 다시 연다.
   - 그래서 장면이 주는 물건은 receiveItem(줄을 만들 때 넣음)이 아니라 gotLine(끝날 때 넣음)으로 적는다.
     receiveItem은 교환처럼 장면 밖에서 이미 끝난 주고받기를 장면이 알려 줄 때만 쓴다 (다시 열어도 두 번 받지 않을 때).
   - 줄에 선택지가 있으면 끝이 오지 않으니 오류로 알린다. 선택지는 뒤 할 일의 다음 대화에 둔다.
   - 대화 사이 새 게임을 시작했으면 아무것도 붙이지 않는다. 지역이 바뀌었으면 뒤 할 일은 부르지 않는다. */
function arcScene(flag,lines,record,after){
  if(!arcsEnabled()||G.f[flag])return false;
  if(lines.some(L=>L&&L[2]))console.error('arcScene '+flag+': 장면 줄에 선택지가 있으면 장면이 끝나지 않는다 (D-350)');
  const g=G,region=G.region;
  talk(lines,()=>{
    if(G!==g)return;
    g.f[flag]=true;diary(flag,record);giveLines(lines);
    if(after&&G.region===region)after();
  });
  return true;
}

/* 결정 D-353: 길손(strangers.js)의 한 번만 하는 말. 저장의 G.f.strangerOnce에 남는다. */
function strangerOnce(key){const d=G.f.strangerOnce||(G.f.strangerOnce={});if(d[key])return false;d[key]=true;return true;}
function strangerSay(lines,next){talk(lines,next);return true;}
