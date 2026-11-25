# PACKOON — 너구리 보부상

사용자('대장')가 기획한 게임 "너구리 보부상"의 작업 폴더. 말과 둔갑을 잃어 가는 엄마를 두고, 소식이 끊긴 아빠를 찾아 아빠의 길을 따라 여행하는 너구리 보부상의 2D 횡스크롤 탐험·수집 게임 (사용자 지시 2026-11-08로 전설의 열매는 뺐다. `design/proposals/name-story-v4.md`). 돈 없이 물물교환으로만 성장하고, 보스급 재료를 얻을 때만 부위 공략 전투가 열린다. 필드와 전투 모두 도트로 그린다 (사용자 지시 2026-11-25로 전투 수묵화풍을 도트로 바꿨다). PC 전용 게임이다.

## 먼저 읽을 문서

- `design/gdd/neoguri-concept.md` — 기획 전체. 각 항목이 **확정 / 제안 / 미정**으로 구분되어 있다.
- `design/narrative/galchamgol-scenario.md` — 첫 지역 단풍골 시나리오와 NPC.
- `design/narrative/dolneomeo-scenario.md` — 두 번째 지역 돌너머 마을의 진행 흐름 (제안).
- `design/narrative/jangteo-scenario.md` — 세 번째 지역 큰 장터의 진행 흐름 (제안).
- `design/narrative/yeongsan-scenario.md` — 마지막 지역 북쪽 영산과 엔딩 (제안).
- `design/data/README.md` — 지역·NPC·교환·아이템·가보·보스 표(CSV). 목록형 기획은 이 표가 원본이다.
- `F:\Proto_Games\Packoon\docs\옮기기_계획.md` — Godot 4 옮기기 계획. 단계(S0~S10)와 끝 조건, 웹 코드와 Godot 구조의 대응표. 팀보드 할일 PA-268~278과 같다.
- `prototypes/web/README.md` — 기획 검증용 웹 프로토타입 설명. 이제는 더 고치지 않는 동작 참고본이다. 빌드 없이 `index.html`을 브라우저로 연다. 공통 엔진(`js/engine/`)과 지역별 파일(`js/regions/<지역 id>/`)로 나뉘어 있고, 지역을 더하는 법도 여기 있다.
- `design/data/decisions.csv` — 대장 확인 없이 쓰는 결정 목록(D 번호). 고칠 때는 번호로 코드의 `결정 D-xx` 표시를 찾는다.
- `design/checklists/review.md` — 검수 점검표. 대사·인과·화자 위치·맵 이동·조작감을 고치거나 Codex 작업을 합치기 전에 이 표로 검수한다.

## 작업 규칙

- 대화와 문서는 한국어로.
- **확정**된 결정은 기획자 동의 없이 바꾸거나 다시 묻지 않는다.
- **제안**·**미정** 항목은 대장 확인을 기다리지 않는다 (사용자 지시 2026-10-30: "게임 플레이하면서 수정하는 걸로 하자"). 개발자가 정해 `design/data/decisions.csv`에 `채택`으로 적고, 그 결정을 구현한 코드에 `// 결정 D-xx: …` 표시를 단다. 나중에 대장이나 플레이 결과로 바꿀 때는 그 번호로 코드와 문서를 함께 찾아 고친다. 자동 검사(data)가 목록과 표시가 맞는지 본다.
- 엔진은 Godot 4 (4.7.2 stable, PC 전용). 사용자 지시 2026-11-25로 지금부터 Godot으로 옮긴다. Godot 게임 폴더는 `F:\Proto_Games\Packoon`(이 레포 밖)이고, 할일은 팀보드 라벨 'Godot'으로 관리한다.
- 웹 버전(`prototypes/web/`)은 더 고치지 않는다 (사용자 지시 2026-11-25). 웹판은 Godot판과 동작을 견주는 참고본이다. 대사·수치·목록을 바꿀 때는 `design/data/*.csv`와 `design/` 문서만 고치고, Godot이 CSV를 직접 읽는다.
- Godot 4로 옮길 때 웹 코드를 그대로 옮기지 않는다. 동작과 수치만 참고하고 Godot 코드는 새로 짠다.
- 일본 너구리(타누키) 표식(머리 위 나뭇잎 둔갑, 큰 배와 술병, 삿갓 석상)은 쓰지 않는다. 한국풍으로 간다.
- 기획이 바뀌면 `design/` 아래 문서를 함께 고친다. 목록(지역, NPC, 교환, 아이템, 가보, 보스)은 `design/data/*.csv`에만 적고, 문서에 같은 표를 다시 만들지 않는다.
- CSV는 엑셀에서 열 수 있게 UTF-8(BOM 포함)으로 저장한다. id 칸은 바꾸지 않는다.
- 아이템·보스 부위·진정수치·가공법·수첩·미니게임(`minigames.csv`)·조작감과 시간 수치(`tuning.csv`)는 CSV에만 적고, Godot 코드나 Inspector에 따로 적지 않는다. 웹 게임 데이터(`tables.js`)는 웹판을 고치지 않으므로 다시 만들지 않는다.
