# 단풍골 맵 확인 페이지

새 회화풍 아트를 웹 게임과 같은 구조에 놓고 걸어 다니며 보는 페이지다. 배포 주소: https://mattttj.github.io/PACKOON/prototypes/web/art/

- 구역 구조(발판, 출구, 문, 인물·소품 자리)는 `stage1-layout.js` 에 있고, 웹 게임(`js/regions/galchamgol`)의 실제 좌표를 옮긴 것이다. 꾸밈 요소(`dc_*`)만 새로 놓았다.
- 에셋 이름과 게임 크기는 `assets-godot/art/stage1/assets.csv` 에서 읽는다. 그림이 없는 에셋은 이름표 붙은 빈 상자로 그린다.
- 로컬에서 볼 때는 파일을 직접 열지 말고 레포 뿌리에서 `py -m http.server` 를 띄워 `http://127.0.0.1:8000/prototypes/web/art/` 로 연다 (파일로 열면 목록을 못 읽는다).

## 그림 올리는 법

- `img/<id>.d.webp`: 디퓨즈(빛 없는 색, 투명 배경, 여백 자름). `img/<id>.n.webp`: 같은 크기의 노말맵(OpenGL 규약, 초록이 위).
- 갈래(`v`)나 상태가 있으면 `img/<id>@<이름>.d.webp`. 상태 이름은 `stage1-layout.js` 의 `STATES`, 갈래는 배치의 `v`(a·b·c), 통나무 발판은 `short`·`mid`·`long`, 꿩은 `mother`·`chick`.
- `img/manifest.json` 에 한 줄씩 더한다:
  `"<id>": {"w":픽셀폭, "h":픽셀높이, "units":[게임폭, 게임높이], "anchor":[0.5,1], "states":["a","b"], "normal":true, "v":1}`
  - `units` 가 없으면 에셋 목록의 게임 크기를 쓴다. `anchor` 기본은 바닥 가운데.
  - 배경 겹은 `"y": 그림 윗변의 게임 y` 를 더하고, 그림을 가로로 이어 붙인다.
  - `states` 가 있으면 그 이름의 파일만 읽는다. 이름 없는 기본 파일도 있으면 `"base":true`.
  - 그림을 바꾸면 `v` 를 올린다 (브라우저 캐시를 피한다).

## 확인용 주소 옵션

`?overlay=1` 구조 겹쳐 보기 켬, `?preset=day|dusk|night`, `?x=500` 시작 위치, `#forest` 구역, `?st.vine=gone` 상태, `?touch=1` 휴대폰 단추, `?fold=1` 메뉴 접기, `?auto=right` 자동 걷기.
