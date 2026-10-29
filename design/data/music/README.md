# PA-43 · 이름의 노래

새로 작곡한 22곡과 합성 효과음 33개를 위한 원본이다. 악보는 `music.json`, 음색·공통 믹싱은 `instruments.json`, 효과음의 층은 `sfx.json`에서 고친다. 이 작업의 음악·음색·배치안은 **제안**이다. 기존 기획의 확정 상태나 게임 규칙을 바꾸지 않는다. 음악 JSON은 이번 요청에서 정한 악보 형식이며 기존 게임 수치 CSV를 대체하지 않는다.

기존 음악이나 녹음을 가져오지 않았다. 짧은 주제를 지역과 인물에 따라 바꾸는 방식으로 새로 구성했다. C·D·E·G·A의 평조를 중심으로 쓰며, 일부 전투곡에는 계면조의 음정 관계와 꺾는 동기를 쓴다. 평균율 합성으로 시김새를 흉내 낸 편곡이며 정통 국악 연주를 재현한 것은 아니다.

## 듣기와 렌더 명령

레포 루트에서 실행한다. Node 기본 모듈만 쓰며 설치할 패키지는 없다.

```powershell
# 전곡 + 효과음 렌더, 곧바로 WAV를 다시 읽어 검사
node tools/audio/render.js

# 악보 마디 길이·악기 참조·범위 및 효과음 파형 검사
node tools/audio/render.js --check

# 고른 곡만, 또는 효과음만 렌더
node tools/audio/render.js --track=title,market_day,yeongsan
node tools/audio/render.js --sfx
node tools/audio/render.js --sfx=footstep_leaf,battle_part_break

# 이미 만든 파일 검사 / 곡 목록
node tools/audio/render.js --verify
node tools/audio/render.js --list

# 미리 듣기 서버 / headless Chrome 점검
node tools/audio/render.js --serve
node tools/audio/render.js --web-check
```

서버 주소는 `http://127.0.0.1:8765/prototypes/web/music.html`이다. 서버 없이 `prototypes/web/music.html`을 더블클릭해도 된다. 이때 브라우저의 로컬 JSON 접근 제한 때문에 **악보 폴더 고르기**에서 `design/data/music`을 고르거나 JSON 3개를 함께 고른다. 원본을 HTML에 복제하지 않는다. 첫 재생 입력 전에는 AudioContext를 만들거나 소리를 내지 않는다.

`--web-check`는 설치된 Chrome을 임시 프로필로 열어 곡 목록 로드·실제 포인터 입력 재생·다음 곡 준비 중 정지·콘솔 오류를 확인한다. 이어서 `file://` 페이지에서 JSON 파일 선택도 검사한다. 다른 설치 경로는 `CHROME_PATH` 환경변수로 지정한다. 검사 중인 로컬 페이지에만 접근하며 Chrome의 임시 프로필을 지운다.

WAV는 `assets-godot/audio/bgm/`, `assets-godot/audio/sfx/`에 만든다. 새 `assets-godot/audio/.gitignore`로 WAV 폴더와 생성 보고서를 제외했다. 기존 `.gitignore`, `.gitattributes`는 수정하지 않았다. `manifest.json`은 샘플 단위 루프 정보, `validation.json`은 1초 단위 파형 요약·피크·RMS·무음·이음매 검사 결과다. 두 파일은 **마지막 명령에서 선택한 파일**만 담는다. 전체 보고서는 인자 없이 다시 렌더하거나 `--verify`로 만든다.

## 곡 목록

템포는 모두 **4분음표/분(♩ BPM)**이다. 12/8의 큰 박(점4분음표)은 표의 BPM × 2/3이다. 장단 이름만 보고 12/8을 12개의 4분음표로 계산하지 않는다. 길이는 악보 기준이며, 엔딩 WAV에만 잔향 5초가 덧붙는다. 마지막 열은 연결 **제안**이다.

| id · 곡명 | 장단·박자 | ♩ BPM | 길이 | 쓰일 곳 |
|---|---|---:|---:|---|
| `theme` 이름의 노래 | 중모리 12/4 | 72 | 80초 | 엄마의 오프닝 주제 |
| `title` 문턱에 남은 이름 | 느린 중모리 12/4 | 60 | 96초 | 타이틀, 가야금 독주 |
| `danpunggol` 단풍 끝의 저녁 | 중모리 12/4 | 96 | 90초 | 단풍골 |
| `dolneomeo` 돌 사이 첫서리 | 세마치 9/8 | 72 | 90초 | 돌너머 |
| `market_day` 엿가위와 설 장날 | 자진모리 12/8 | 132 | 65.45초 | 장터 낮 |
| `market_night` 등불에 접은 장날 | 자진모리 느린 변주 12/8 | 66 | 65.45초 | 장터 밤·숙소 |
| `yeongsan` 아직 오지 않은 봄 | 중모리·긴 쉼 12/4 | 64 | 90초 | 영산 겨울 |
| `yeongsan_spring` 얼음 아래의 이름 | 굿거리 12/8 | 108 | 80초 | 영산 봄 |
| `father` 거꾸로 접힌 수첩 | 중모리 12/4 | 72 | 80초 | 아빠의 흔적·장부·재회 |
| `nalsaen` 날쌘의 한 뼘 덤 | 자진모리 12/8 | 120 | 72초 | 날쌘의 거래·허세 |
| `scenery_danpunggol` 당산나무의 긴 그림자 | 중모리 12/4 | 60 | 96초 | 단풍골 경치 |
| `scenery_dolneomeo` 성황당 너머 흰 하늘 | 세마치 9/8 | 48 | 90초 | 돌너머 경치 |
| `scenery_market` 눈발 위 등불들 | 굿거리 12/8 | 48 | 120초 | 장터 경치 |
| `scenery_yeongsan` 호수가 기억하는 두 음 | 중모리 12/4 | 56 | 102.86초 | 영산 경치 |
| `boss_kudzu` 풀리지 않은 매듭 | 자진모리 12/8 | 112 | 77.14초 | 엉킨 칡 |
| `boss_golem` 돌이 들어 올린 소원 | 중모리 12/4 | 104 | 83.08초 | 돌 골렘 |
| `boss_dokkaebi` 도깨비의 빈 손바닥 | 자진모리 12/8 | 144 | 60초 | 헌물 도깨비 |
| `boss_steel` 호수를 감은 겨울 | 중모리 12/4 | 96 | 90초 | 영산 보스, 새 이름 미정 |
| `trial_iron` 무쇠의 여섯 번 숨 | 중모리 12/4 | 120 | 72초 | 무쇠의 회피 시험 |
| `minigame` 작은 손의 장단 | 자진모리 12/8 | 120 | 72초 | 장단을 제외한 미니게임 |
| `crafting` 손에 남은 온기 | 굿거리 12/8 | 84 | 68.57초 | 가보 가공 |
| `ending` 엄마가 부르기 전 | 중모리 12/4 | 64 | 90초 + 잔향 5초 | 귀향·회복, 반복 없음 |

주제 원형은 4마디다. `motif`와 각 곡의 `notes`에 변주 의도를 적었다. A에서 주제를 들려주고 B에서 응답·음역·밀도를 바꾼다. 주제의 마지막 D는 해결을 미룬다. 아빠는 주제 음순서를 거꾸로 읽고 낮은 해금으로 연주한다. 영산 겨울에는 첫 C·D만 남기고 쉼을 늘렸다. 장터 밤은 낮의 선율 뼈대를 한 옥타브 낮춰 정확히 절반 BPM으로 연주한다. 낮은 24마디, 밤은 12마디여서 루프 총길이는 같다. 엔딩에서만 주제를 C로 닫고 끝에 여백을 둔다.

## 악보 고치기

`music.json`의 `tracks` 한 항목이 한 곡이다. `tempo`, `meter`, `measures`, `loop`, `sections`, `voices`를 갖는다. `loop`와 `sections.from/to`는 **0부터 세는 마디 경계**, `to/end`는 포함하지 않는 끝이다. `loop: null`은 한 번 재생한다. 이번 곡은 모두 전체 구간 루프 또는 비반복이다.

성부는 `instrument`, `gain`(0~2), `pan`(-1 왼쪽~1 오른쪽), `patterns`, `sequence`를 갖는다. `role`은 선율·반주·저음·타악·환경음의 역할을 나타낸다. `sequence` 항목 하나가 한 마디이며 곡의 `measures`와 개수가 같아야 한다. 타이틀 독주와 영산의 여백은 의도적으로 성부를 줄였다.

음표는 `음:길이[:세기]`다.

```json
["C4:1:0.8", "D4:0.5", "E4:0.5", "R:1"]
```

위 예는 C4 1박, D4·E4 각 반박, 쉼 1박으로 총 3개의 4분음표 길이다. `C4`는 가운데 도, `#`·`b`는 반음 변화, `R`은 쉼, `X`는 고정 음정 타악이다. 생략한 세기는 0.8이다. 길이는 양수인 **4분음표 단위**, 세기는 0~1이다. 한 마디의 합은 `분자 × 4 / 분모`여야 한다. 따라서 12/4는 12, 12/8은 6, 9/8은 4.5다. 세마치 타악은 0·1.5·3에 강약을 잡는다. 장단은 전통의 모든 변형을 재현한 것이 아닌 게임용 편곡이다. 중모리의 강약은 [국립국악원 교육 자료](https://academy.gugak.go.kr/dp/pds/HTML5-1-7-3/HTML5-1-7-3-5/index.htm)를 참고했다.

초 변환은 `길이 × 60 / tempo`, 샘플 위치는 `round(누적 박수 × 60 / tempo × sampleRate)`다. 마디마다 반올림한 길이를 더하지 않는다. 예를 들어 ♩=120, 12/8 한 마디는 6×60/120=3초, 44,100Hz에서 132,300샘플이다. 게임의 60fps나 `G.f`와 관계없이 AudioContext의 초 시계를 쓴다. 피치는 A4=440Hz, `440 × 2^((MIDI−69)/12)`다.

## 음색·효과음

`instruments.json`은 가야금·대금·해금·피리, 장구 덩/쿵/덕/기덕, 북·꽹과리·징·풍경, 바람·물, 돌·엿가위·망치를 정의한다. 가야금은 고배음이 먼저 감쇠하며 음 끝의 흔들림이 커진다. 대금은 숨 노이즈와 지연 비브라토, 해금은 마찰 노이즈와 처음 음정 미끄러짐, 피리는 홀수 배음 중심이다. 타악은 비정수 배음·짧은 노이즈·음정 하강을 겹친다.

`attack/decay/release/tail/fixedDuration/glideSeconds`는 초, `baseFrequency/noiseCutoff`는 Hz, `vibratoCents/glideCents/endWobbleCents`는 cent다. `partials` 각 원소는 `[주파수 배수, 진폭, 감쇠 속도 배수]`다. 노이즈는 seed로 재현되며 공명 필터를 거친다. `gain`은 음색별 크기, 성부 gain은 편곡의 균형, `masterGain`은 전체 믹스다. 4개 지연선의 피드백 리버브와 DC 제거 뒤 소프트 리미터를 적용하며 ceiling은 0.92다.

`sfx.json`의 각 효과음은 3~6개 층으로 어택·몸통·꼬리를 만든다. 층은 `instrument`, `note`, `start/duration`(초), `gain/pan`, 선택 `patch`를 갖는다. `patch`는 해당 효과음 층에서만 음색 값을 바꾼다. 악보용 원본 음색은 바뀌지 않는다. `duration`은 의도한 동작 길이이며 실제 WAV는 악기 꼬리와 리버브 때문에 더 길 수 있다. 재료 소비나 게임 판정을 소리에 연결하지 않는다.

| 종류 | 효과음 id |
|---|---|
| 걸음 | `footstep_leaf`, `footstep_frost`, `footstep_snow`, `footstep_market` |
| 이동·채집 | `jump`, `land`, `sickle`, `gather`, `pickup` |
| 교환·기록 | `exchange`, `dialog_next`, `bag_open`, `bag_close`, `book_open`, `book_close` |
| 가공 | `mortar`, `mill`, `steamer`, `medicine_roller`, `craft_complete` |
| 발견·전환 | `scenery_open`, `stamp_found`, `door`, `region_travel` |
| 전투 | `battle_warn`, `battle_hit`, `battle_part_break`, `battle_soothe`, `battle_victory` |
| UI | `ui_focus`, `ui_confirm`, `ui_cancel`, `ui_unavailable` |

## 웹 연주기와 Sound 연결

`prototypes/web/js/engine/music.js`는 브라우저에서 `PackoonMusic`, Node에서 같은 API를 내보낸다. `DSP.compileScore/renderVoice/renderSong/renderSfx`가 두 환경의 공통 구현이다. 웹은 고른 곡을 PCM으로 준비하면서 음표 사이에 실행을 양보하고, 완성된 PCM의 120ms 조각을 AudioContext 시계에 맞춰 25ms마다 300ms 앞까지 예약한다. 즉, 타이머가 음표 시작을 직접 울리는 방식은 아니다. 최근 2곡을 캐시한다. 곡을 처음 고르면 준비 시간이 필요하다.

다음 단계에서 기존 Sound 뒤에 음악 스크립트를 읽고 아래처럼 연결한다. **이번 단계에서는 index.html이나 Sound 파일에 넣지 않았다.** JSON 로드는 별도 데이터 전달 책임이며 기존 저장 키를 추가하지 않는다.

```js
const music = PackoonMusic.createPlayer({score, instruments, sfx});
const detachSound = PackoonMusic.attachSound(Sound, music);
// 기존 첫 실제 입력 이후 구역 담당 코드가 호출한다.
async function requestRegionMusic() {
  return music.play('danpunggol', {crossfade: 1.5});
}
function onActualPickup() {
  return music.playSfx('pickup');
}
// 창 닫기·게임 종료:
music.stop(0.08);
// 연결 해제:
detachSound();
music.destroy();
```

브리지는 `Sound.context/initialized/enabled/volume`을 읽고 `packoon-sound-change`를 구독한다. Sound의 컨텍스트를 빌려 쓰며 작은 음량 0.4·큰 음량 0.8과 켜기/끄기를 따른다. 입력 잠금을 우회하거나 Sound를 덮어쓰지 않는다. 연결한 뒤에는 독립 미리 듣기용 `unlock()`으로 별도 컨텍스트를 만들지 않는다. `play()`가 잠금 때문에 `false`를 돌려주면 다음 실제 입력 뒤 현재 구역 곡을 다시 요청한다. 꺼져 있거나 멈춘 동안 요청한 효과음은 나중에 몰아 재생하지 않는다.

`play(id,{crossfade,fromSeconds})`, `stop(fadeSeconds)`, `pause()`, `resume()`, `setVolume(0~1)`, `setEnabled(bool)`, `playSfx(id)`, `getState()`, `destroy()`를 노출한다. 곡 전환은 기본 1.5초다. 새 요청이나 정지는 이전 준비 요청을 취소한다. 숨긴 탭은 재생 위치를 보존해 멈추고 돌아오면 이어 간다. 정지한 곡이 탭 복귀나 음소거 해제로 되살아나지 않게 한다.

## 다음 단계 전환안

다음은 연결을 위한 **제안**이며 기존 규칙의 확정이 아니다. 음악 전환은 게임 보상·진행·입력 타이밍을 바꾸지 않는다.

| 기존 구역·상태 | 곡 |
|---|---|
| `galchamgol` | `danpunggol` |
| `dolneomeo` | `dolneomeo` |
| `jangteo`, 낮 / 밤 | `market_day` / `market_night` |
| `yeongsan`, 겨울 / 봄 | `yeongsan` / `yeongsan_spring` |
| 기존 보스 `kudzu/golem/dokkaebi/gangcheol` | `boss_kudzu/boss_golem/boss_dokkaebi/boss_steel` |
| 기존 NPC 전투 `musoe` | `trial_iron` |

우선순위는 엔딩 → 전투 → 전용 이야기 장면 → 경치 → 미니게임·가공 → 지역이다. 동시에 창이 열려도 가장 높은 곡 하나만 요청한다. 지역 변경은 닫힌 창의 복귀 요청을 버리고 새 지역 곡으로 간다. 같은 곡을 매 프레임 다시 시작하지 않는다.

- 전투 시작에만 보스곡으로 전환한다. 예고·회피·표식 타격·부위 파괴마다 곡을 재시작하지 않는다. 예고 효과음은 실제 예고 시작 한 번, 부위 파괴 효과음은 실제 파괴 한 번에 맞춘다. 승리·달래기·NPC 회피 통과는 모두 전투곡을 마친 뒤 현재 지역으로 돌아간다. 도깨비 달래기 보상 규칙에는 관여하지 않는다.
- 보통 미니게임은 시작 때 공통곡, 창 닫기·성공·중단 때 지역곡으로 간다. 실패 후 바로 재시도하면 공통곡을 이어 간다. **엿가위 장단은 기존 예약 반주·판정 시계를 그대로 쓰고 공통 BGM을 겹치지 않는다.** 쌀 8개와 엿 보상에는 관여하지 않는다.
- 경치를 여는 동안 해당 지역 경치곡으로 전환한다. 닫으면 현재 지역 상태의 곡으로 돌아간다. 아직 없는 경치 종료·닫기 이벤트를 음악 파일에서 임의로 만들지 않는다.
- 가공 시작 때 가공곡을 요청하고, 취소·연출 완료·창 닫기 때 지역곡으로 돌아간다. 도구 소리는 동작별로, 완료 소리는 완료 확정 이벤트에 한 번만 낸다. 필수 재료·가보 미각성·재료 소비·보상 지급 규칙을 변경하지 않는다. 약연의 마지막 가공 이후 엔딩은 더 높은 우선순위로 처리한다.
- 숙소에서 쉬어 낮밤이 실제 바뀌었을 때만 장터곡을 바꾼다. 시간 경과로 낮밤을 만들지 않는다. 아빠·날쌘 테마는 해당 이야기 장면에만 쓰고 평범한 대화마다 곡을 바꾸지 않는다.
- 엔딩은 반복하지 않는다. 마지막 C 해결과 잔향이 끝난 뒤 엄마가 새 이름을 부르는 장면으로 넘긴다. 실제 대사 속도·연출 종료 이벤트와의 맞춤은 다음 단계에서 확인한다.

## WAV와 검사의 범위

44,100Hz·16bit·스테레오 PCM에 결정적인 TPDF 디더를 넣는다. 반복곡은 음 끝 꼬리를 루프 시작에 감아 더하고, 마지막 6초의 신호로 피드백 리버브 상태를 준비한 뒤 본문을 처리한다. 전체 페이드아웃으로 반복 경계를 숨기지 않는다. 비반복곡만 마지막 잔향과 짧은 끝 페이드를 둔다. 효과음은 리버브 뒤 양쪽 진폭이 모두 0.00001(-100dBFS) 아래로 내려가는 마지막 지점에서 20ms 여유를 남기고, 마지막 5ms만 부드럽게 줄인다. WAV `smpl`에는 시작 샘플·포함하는 끝 샘플을 기록한다. manifest의 끝은 비교하기 편하게 **포함하지 않는 끝**이다.

검사는 출력 WAV를 다시 읽어 포맷·전체 피크·클리핑·RMS·50ms 단위 저레벨 구간과 1초 단위 파형을 계산한다. 무음 기준 RMS는 0.0001(-80dBFS)이며 영산의 긴 쉼과 타이틀 여백은 의도한 것이므로 길다고 실패시키지 않는다. 루프 양끝 샘플 차는 0.006FS 미만이고, 경계 앞뒤 약 5ms의 평상시 샘플 변화 95백분위 × 1.5와 0.002 중 큰 값보다도 작아야 한다. 이음매 자체의 기울기와 바로 앞뒤 기울기의 차는 같은 백분위 × 2와 0.004 중 큰 값 미만이어야 한다. 앞쪽과 뒤쪽 기울기 차도 0.025 미만인지 확인한다. 연속 파형도 샘플마다 진폭이 달라지므로 양끝 차를 무조건 0으로 만들지는 않는다.

파형 검사와 headless 재생 검사는 청음 평가를 대신하지 않는다. 음색의 설득력·성부 균형·반복 피로도·모바일에서의 준비 지연은 팀의 청음과 기기 확인이 남는다. 실제 Godot 실행·게임 장면 연결은 이번 범위 밖이다.

2026-10-30 실행에서는 22곡·33개 효과음 WAV를 모두 다시 읽어 검사했다. 클리핑은 0개, 전체 최대 피크는 0.353210이었다. 반복곡의 최대 이음매 차는 아빠 테마의 0.00274658로, 그 지점의 평상시 샘플 변화보다 작았고 기울기 검사도 통과했다. 영산의 긴 저레벨 구간은 의도한 쉼이다.

| 검사 예 | 피크 | 전체 RMS | 가장 긴 저레벨 구간 | 루프 양끝 차 |
|---|---:|---:|---:|---:|
| 타이틀 | 0.263184 | 0.054806 | 3.9초 | 0.00003052 |
| 장터 낮 | 0.263733 | 0.051906 | 0초 | 0.00094604 |
| 영산 겨울 | 0.082001 | 0.014424 | 10.7초 | 0.00003052 |

두 JS 파일의 `node --check`, headless Chrome의 HTTP 재생·다음 곡 준비 중 정지·로컬 JSON 파일 선택을 통과했으며 콘솔 오류는 없었다. 별도 AudioContext 모의 검사로 첫 입력 전 무재생, 일시정지·재개, 전체 1.5초 크로스페이드, 정지 후 자동 재개 방지, 5초 예약 지연 뒤 몰아 재생하지 않는 동작도 확인했다.

## Godot로 가져가기

웹에서는 렌더된 WAV를 읽지 않는다. Godot에서 생성 폴더를 가져온 뒤 BGM은 WAV의 루프 메타데이터 감지를 사용하고 엔딩·효과음은 비반복으로 둔다. Trim·Normalize를 켜면 루프 샘플 위치나 의도한 음량이 달라질 수 있어 먼저 끈 상태로 확인한다. 상세 옵션은 [Godot 공식 오디오 가져오기 문서](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_audio_samples.html)를 따른다. 리버브가 이미 포함돼 있으므로 Godot 버스에서 추가할 양은 듣고 정한다. 원본 WAV가 크면 배포용 압축은 Godot 단계에서 정한다.

## 나중에 검토할 CC0 녹음 후보

후보 목록만 조사했으며 다운로드하거나 이번 합성음에 섞지 않았다. 확인일은 2026-10-30이다.

| 후보·제작자 | 쓰임 | 출처·라이선스 |
|---|---|---|
| Wind (Gentle Breeze) · mario1298 | 숲·호수의 잔바람 | [Duke Sonic Dictionary 소장 정보](https://sonicdictionary.duke.edu/items/wind-gentle-breeze.html), Creative Commons 0 |
| Water 02 · unfa | 물 붓기·잔물결의 재료. 그릇 사이로 물을 붓고 샤워로 녹음한 소리 | [Freesound 원본](https://freesound.org/people/unfa/sounds/161495/), Creative Commons 0 |
| Footsteps - quiet.wav · jodybruchon | 조용한 발걸음·실내 바닥의 보조층 | [Freesound 원본](https://freesound.org/people/jodybruchon/sounds/433884/), Creative Commons 0 |
| Impact Sounds · Kenney | 나무·금속 타격 보조층 | [제작자 배포 페이지](https://kenney.nl/assets/impact-sounds), Creative Commons CC0 |

