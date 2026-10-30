# PACKOON — 너구리 보부상

친구('대장')가 기획한 게임 "너구리 보부상"의 작업 폴더. 엄마의 병을 고칠 전설의 열매를 찾아 아빠의 길을 따라 여행하는 너구리 보부상의 2D 횡스크롤 탐험·수집 게임. 돈 없이 물물교환으로만 성장하고, 보스급 재료를 얻을 때만 수묵화풍 부위 공략 전투가 열린다.

## 먼저 읽을 문서

- `design/gdd/neoguri-concept.md` — 기획 전체. 각 항목이 **확정 / 제안 / 미정**으로 구분되어 있다.
- `design/narrative/galchamgol-scenario.md` — 첫 지역 단풍골 시나리오와 NPC.
- `design/narrative/dolneomeo-scenario.md` — 두 번째 지역 돌너머 마을의 진행 흐름 (제안).
- `design/narrative/jangteo-scenario.md` — 세 번째 지역 큰 장터의 진행 흐름 (제안).
- `design/narrative/yeongsan-scenario.md` — 마지막 지역 북쪽 영산과 엔딩 (제안).
- `design/data/README.md` — 지역·NPC·교환·아이템·가보·보스 표(CSV). 목록형 기획은 이 표가 원본이다.
- `prototypes/web/README.md` — 기획 검증용 웹 프로토타입 설명. 빌드 없이 `index.html`을 브라우저로 연다. 공통 엔진(`js/engine/`)과 지역별 파일(`js/regions/<지역 id>/`)로 나뉘어 있고, 지역을 더하는 법도 여기 있다.
- `design/checklists/review.md` — 검수 점검표. 대사·인과·화자 위치·맵 이동·조작감을 고치거나 Codex 작업을 합치기 전에 이 표로 검수한다.

## 작업 규칙

- 대화와 문서는 한국어로.
- **확정**된 결정은 기획자 동의 없이 바꾸거나 다시 묻지 않는다. **제안**·**미정** 항목은 결정하기 전에 질문한다.
- 엔진은 Godot 4. 지금은 모든 지역을 웹 버전으로 만들어 콘텐츠와 게임 루프를 정하는 단계이고, 그 뒤에 Godot 4로 옮긴다. 웹 버전은 팀이 브라우저에서 가볍게 플레이하며 확인하는 용도.
- Godot 4로 옮길 때 웹 코드를 그대로 옮기지 않는다. 동작과 수치만 참고하고 Godot 코드는 새로 짠다.
- 일본 너구리(타누키) 표식(머리 위 나뭇잎 둔갑, 큰 배와 술병, 삿갓 석상)은 쓰지 않는다. 한국풍으로 간다.
- 기획이 바뀌면 `design/` 아래 문서를 함께 고친다. 목록(지역, NPC, 교환, 아이템, 가보, 보스)은 `design/data/*.csv`에만 적고, 문서에 같은 표를 다시 만들지 않는다.
- CSV는 엑셀에서 열 수 있게 UTF-8(BOM 포함)으로 저장한다. id 칸은 바꾸지 않는다.
- CSV를 고치면 `node prototypes/web/tools/build-data.js`로 웹 게임 데이터(`prototypes/web/js/data/tables.js`)를 다시 만든다. 아이템·보스 부위·진정수치·가공법·수첩·미니게임(`minigames.csv`)·조작감과 시간 수치(`tuning.csv`)는 웹 코드에 따로 적지 않는다.
