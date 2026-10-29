# Claude Code에 넘기는 방법

## 1. 폴더 넣기

Claude-Code-Game-Studios를 받은 게임 폴더(예: `my-game`)에 이 압축 파일 안의 `design`, `prototypes` 폴더를 그대로 덮어 넣는다. 템플릿에 원래 있는 폴더와 이름이 같아서 제자리에 들어간다.

```
my-game/
  design/gdd/neoguri-concept.md        ← 기획 전체
  design/narrative/galchamgol-scenario.md  ← 첫 지역 시나리오
  prototypes/galchamgol-web/index.html     ← 웹 프로토타입 (브라우저로 열기)
  prototypes/galchamgol-web/README.md
```

## 2. Claude Code 켜고 첫 메시지

`my-game` 폴더에서 `claude`를 실행하고, 아래를 그대로 붙여 넣는다.

```
design/gdd/neoguri-concept.md 와 design/narrative/galchamgol-scenario.md 를 먼저 끝까지 읽어 줘.
prototypes/galchamgol-web/ 은 기획 검증용 웹 프로토타입이야. README.md 도 읽어 줘. 실제 엔진 코드로 쓰지는 않아.

이 게임은 "너구리 보부상"이고, 이미 정해진 내용은 문서에 "확정"으로 적혀 있어.
확정된 건 다시 묻지 말고, "제안"과 "미정" 항목 위주로 질문하면서 /start 를 진행해 줘.
```

## 3. 그다음

- `/start` 에서 현재 단계를 물으면 "기획이 꽤 정리된 상태(clear design)"를 고른다.
- 문서가 정리된 뒤에는 `/map-systems` 로 시스템 구조를 뽑고, `/design-system` 으로 시스템별 기획서(GDD)를 만든다.
- `project.yaml` 의 `modes.rigor` 는 처음엔 기본값 `minimal` 을 추천.
