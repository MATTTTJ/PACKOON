# Codex 역할 머리말

「너구리 보부상」의 일 지시문 앞에 붙이는 역할 모음이다.
각 역할은 점검 관점을 더한다. 실제 작업·수정 파일·실행 위치는 일 지시문과 `common.md`에서 정한다.
역할을 붙이는 것만으로 파일 수정이나 미정 기획 결정 권한이 생기지는 않는다.

## 역할 고르기

- [level-designer.md](level-designer.md): 횡스크롤 경로·접근 조건·시선 유도·플레이 시간 예산을 설계할 때 붙인다.
- [economy-designer.md](economy-designer.md): 교환·가공·선물의 흐름에서 필수 재료 부족과 막다른 교환을 찾을 때 붙인다.
- [systems-designer.md](systems-designer.md): 미니게임·전투·가공 규칙을 바꾸거나 JS 수치를 CSV 원본으로 옮길 때 붙인다.
- [writer.md](writer.md): NPC 대사·미니게임 훈수·수첩과 기록을 쓰거나 말투를 다듬을 때 붙인다.
- [qa-tester.md](qa-tester.md): 웹판의 진행·저장 호환·키와 터치·콘솔 오류를 재현하며 확인할 때 붙인다.
- [ux-accessibility.md](ux-accessibility.md): 다음 행동 안내·휴대폰 터치·움직임·색 구별·읽기 부담을 점검할 때 붙인다.
- [godot-porter.md](godot-porter.md): PA-11 등 Godot 4 재구현을 실제로 시작하는 일에 붙인다.

## 붙여 쓰기

보통 역할 하나 → 일 지시문 → 공통 규칙 순서로 합친다. 다음은 Bash에서 쓰는 모양이다.
아래 상대경로가 존재하는 지시문 폴더에서 실행한다. 역할·일·공통 파일은 각각 마지막에 줄바꿈을 둔다.

```bash
cat roles/<역할>.md 일.md common.md | codex exec -C <프로젝트_경로> -
```

실행 예시는 다음과 같다. `-C`는 코드를 읽고 작업할 프로젝트 루트다.

```bash
cat roles/systems-designer.md pa-38.md common.md | codex exec -C ../PACKOON-wt/<브랜치> -
```

PowerShell에서는 UTF-8을 지정해 읽는다. 로컬 실행 정책이 `codex.ps1`을 막는 경우에도 쓸 수 있도록 `codex.cmd`를 적었다.

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Get-Content -Encoding UTF8 roles/systems-designer.md, pa-38.md, common.md | codex.cmd exec -C ../PACKOON-wt/<브랜치> -
```

`roles/`를 찾지 못하면 이 폴더의 절대경로로 바꾼다. 예시 명령은 사용법이며 이 모음을 만드는 동안 실행한 작업은 아니다.
역할이 둘 필요하면 이번 일에 직접 필요한 둘만 붙이고, 결과물 형식은 일 지시문 하나로 정한다.

## 일 지시문과 함께 지킬 것

- 역할은 점검 기준이다. 작업 범위·고칠 파일·보고 형식은 이번 일 지시문을 따른다.
- 필요한 참조 파일이 없으면 경로와 영향을 적는다. 읽을 수 있는 부분은 진행하되, 누락된 규칙·수치는 추측해서 구현하지 않는다.
- 제안서만 쓰는 일은 코드·파일을 바꾸지 않는다. `prop-common.md`의 제안서 형식을 따른다.
- 미니게임은 `minigame.md`, 보스 시험판은 `trial-common.md` 같은 해당 공통 지침도 함께 붙인다.
- 기획서는 `design/gdd/neoguri-concept.md`, 목록·수치는 `design/data/*.csv`를 다시 읽고 시작한다.
- 확정은 바꾸지 않고 제안·미정은 표시한다. 이미 이번 일에서 결정된 내용을 다시 물으며 멈추지 않는다.
- 2~4지역은 기획서 §12의 확정 결정을 먼저 대조한다. 옛 시나리오의 ‘제안’ 표기를 일괄 확정하거나 모두 미정으로 되돌리지 않는다.
- PA-38의 새 CSV 예시는 아직 없는 표일 수 있다. 현재 파일과 생성기를 확인하고 기존 원본을 먼저 쓴다.
- 한국어 문장·진행 안내는 적용되는 `AGENTS.md`의 윤문 규칙을 따른다. 코드·id·수치·직접 인용은 보존한다.
- CSV 생성과 문법 검사 통과, 실제 플레이 확인, 사용자 관찰은 서로 구분해 보고한다.
- 헤드리스 Chrome 예시는 `qa-tester.md`에 있다. 시작 확인만으로 전체 플레이·휴대폰 실기기 확인을 대신하지 않는다.
- 역할 안의 원칙은 재사용용 요약이다. 기획이 바뀌면 원본과 대조해 해당 문장만 갱신한다.

## 참고

출처: [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios), MIT, Copyright (c) 2026 Donchitos. `.claude/agents`, 관련 rules·docs·설계 템플릿의 점검 관점을 참고해 이 프로젝트에 맞게 다시 썼다.

## 이 레포에서 바로 쓰기

`tools/codex/run.sh <작업폴더> <일.md> [역할 ...]` 가 역할 머리말 + 일 지시문 + `tools/codex/common.md` 를 이어 붙여 Codex 에 넘긴다. 기본 모델 `gpt-6.1-sol`, 생각 수준은 `EFFORT=high` 처럼 바꾼다. 작업폴더는 `git worktree add ../PACKOON-wt/<브랜치> ...` 로 만든 것을 쓴다. Windows 샌드박스에서는 Codex 가 worktree 의 git 기록에 쓸 수 없으니 커밋·병합은 사람(또는 Claude)이 한다.
