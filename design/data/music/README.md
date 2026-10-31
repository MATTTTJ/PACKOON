# PA-43 · 이름의 노래

22곡과 층을 겹친 합성 효과음 48개의 원본이다. 악보는 `music.json`, 음색·공통 믹싱은 `instruments.json`, 효과음은 `sfx.json`에서 고친다. 음악·음색·편곡은 **제안**이며 이번 요청에 따라 도입부·반복부와 게임 장면 연결을 구현했다. 기존 기획의 확정 상태나 게임 규칙은 바꾸지 않는다. 음악 JSON은 이번 요청의 악보 형식이며 게임 수치 CSV를 대체하지 않는다.

기존 음악이나 녹음을 가져오지 않았다. C·D·E·G·A의 평조 주제를 지역과 인물에 따라 바꾸며 일부 보스곡은 C·Eb·F·G·Bb의 계면조 음정 관계를 쓴다. 평균율 합성으로 시김새를 흉내 낸 게임용 편곡이며 정통 국악 연주를 재현한 것은 아니다.

## 듣기와 렌더 명령

레포 루트에서 실행한다. Node 기본 모듈만 쓰며 설치할 패키지는 없다.

```powershell
# 전곡·효과음 렌더 후 WAV를 다시 읽어 검사
node tools/audio/render.js
# 악보·효과음과 웹 생성물의 최신 여부 확인
node tools/audio/render.js --check
# WAV 없이 웹 생성물만 갱신
node tools/audio/render.js --web-data
# 선택 렌더 / 이미 만든 전체 파일 검사 / 목록
node tools/audio/render.js --track=title,market_day,yeongsan
node tools/audio/render.js --sfx
node tools/audio/render.js --sfx=footstep_leaf,battle_part_break
node tools/audio/render.js --verify
node tools/audio/render.js --list
# 음악실 서버 / headless Chrome 점검
node tools/audio/render.js --serve
node tools/audio/render.js --web-check
```

서버 주소는 `http://127.0.0.1:8765/prototypes/web/music.html`이다. 게임과 음악실의 더블클릭 실행은 `js/data/music-data.js` 생성물을 읽는다. 음악실에서 원본 JSON을 바로 듣고 싶으면 **악보 폴더 고르기**로 `design/data/music`을 고르거나 JSON 3개를 함께 고른다. 첫 실제 재생 입력 전에는 AudioContext를 만들거나 소리를 내지 않는다.

`music-data.js`는 `render.js`가 세 JSON에서 만드는 `PackoonAudioData={score,instruments,sfx}`다. 직접 고치지 않는다. 일반 렌더와 `--web-data`가 생성하며 `--check`가 원본과 일치하는지 확인한다. 기존 게임 CSV·저장 키는 바꾸지 않는다.

WAV는 `assets-godot/audio/bgm/`·`sfx/`에 만든다. 반복곡마다 `<id>.wav`와 `<id>_intro.wav`·`<id>_loop.wav`를 모두 만든다. 경치·엔딩은 한 파일만 만든다. `manifest.json`은 파일·구간·샘플 위치, `validation.json`은 파형·클리핑·RMS·이음매 검사 결과다. 보고서는 마지막 명령에서 선택한 파일만 담으므로 전체 보고서는 `--verify`로 다시 만든다. WAV와 보고서는 기존 `assets-godot/audio/.gitignore`의 제외 대상이다.

`--web-check`는 `qa-audio/` 아래 별도 Chrome 프로필에서 HTTP 실제 재생·준비 중 정지·로컬 JSON 선택·콘솔 오류를 검사한다. 다른 Chrome 경로는 `CHROME_PATH`로 지정한다. 사용자의 기본 프로필은 쓰지 않는다.

## 곡과 도입부·반복부

템포는 모두 **4분음표/분(♩ BPM)**이다. 12/8의 큰 박인 점4분음표는 표의 BPM × 2/3이다. 도입부는 첫 재생에만 나오는 별도 악구다. 기존 본문은 반복부로 유지하고 악기 진입·주제 머리·보스 고유 타악을 도입에 따로 편곡했다.

| id · 곡명 | 박자 | ♩ BPM | 도입 마디 | 반복 마디 / 한 번 길이 |
|---|---|---:|---:|---:|
| `theme` 이름의 노래 | 12/4 | 72 | 2 | 8 |
| `title` 문턱에 남은 이름 | 12/4 | 60 | 2 | 8 |
| `danpunggol` 단풍 끝의 저녁 | 12/4 | 96 | 2 | 12 |
| `dolneomeo` 돌 사이 첫서리 | 9/8 | 72 | 4 | 24 |
| `market_day` 엿가위와 설 장날 | 12/8 | 132 | 4 | 24 |
| `market_night` 등불에 접은 장날 | 12/8 | 66 | 2 | 12 |
| `yeongsan` 아직 오지 않은 봄 | 12/4 | 64 | 2 | 8 |
| `yeongsan_spring` 얼음 아래의 이름 | 12/8 | 108 | 4 | 24 |
| `father` 거꾸로 접힌 수첩 | 12/4 | 72 | 2 | 8 |
| `nalsaen` 날쌘의 한 뼘 덤 | 12/8 | 120 | 2 | 24 |
| `scenery_danpunggol` 당산나무의 긴 그림자 | 12/4 | 60 | 없음 | 한 번 8마디 |
| `scenery_dolneomeo` 성황당 너머 흰 하늘 | 9/8 | 48 | 없음 | 한 번 16마디 |
| `scenery_market` 눈발 위 등불들 | 12/8 | 48 | 없음 | 한 번 16마디 |
| `scenery_yeongsan` 호수가 기억하는 두 음 | 12/4 | 56 | 없음 | 한 번 8마디 |
| `boss_kudzu` 풀리지 않은 매듭 | 12/8 | 126 | 4 | 24 |
| `boss_golem` 돌이 들어 올린 소원 | 12/4 | 116 | 2 | 12 |
| `boss_dokkaebi` 도깨비의 빈 손바닥 | 12/8 | 144 | 4 | 24 |
| `boss_steel` 호수를 감은 겨울 | 12/4 | 108 | 2 | 12 |
| `trial_iron` 무쇠의 여섯 번 숨 | 12/4 | 120 | 2 | 12 |
| `minigame` 작은 손의 장단 | 12/8 | 120 | 2 | 24 |
| `crafting` 손에 남은 온기 | 12/8 | 84 | 2 | 16 |
| `ending` 엄마가 부르기 전 | 12/4 | 64 | 없음 | 한 번 8마디 |

주제 원형은 4마디다. `motif`와 각 곡의 `notes`에 변주·도입 의도를 적었다. 아빠는 음순서를 거꾸로 읽는 낮은 해금, 영산 겨울은 C·D 두 음과 긴 쉼, 장터 밤은 낮의 절반 BPM과 한 옥타브 낮은 선율이다. 낮 24마디와 밤 12마디의 반복 시간은 같고 도입 시간도 같다. 보스 도입에는 칡의 기덕·골렘의 돌과 북·도깨비의 가위와 꽹과리·영산 보스의 징·무쇠의 망치와 풀무를 먼저 둔다. 영산 보스의 새 이름은 미정이며 정하지 않았다.

**편성 (결정 D-46·D-47, 2026-10-31 사용자 요청: 전우치 OST '궁중악사'의 악기 구성 참고, 선율·리프는 가져오지 않음)**
- 전투곡(`boss_*`, `trial_iron`): 피리나 해금이 선율을 이끈다. 모듬북(`moduk_low`·`moduk_mid`)이 장단을 몰고, 아쟁(`low_string`)이 저음을 끈다. 가야금(`arp`)은 그 마디 선율 음을 8분음으로 뜯어 오르내린다. 칡·돌 골렘·강철이 전투는 빠르기를 올렸다(126·116·108). 도깨비(144)와 무쇠(120)는 반복 길이 60초 하한 때문에 그대로 둔다.
- 지역곡: 분위기는 그대로 두고 아쟁 저음과 낮은 모듬북을 더했다. 돌너머와 큰 장터에는 해금(`bowed`)을 한 옥타브 위에 얹었다. 영산 겨울은 아쟁 지속음과 드문 북만 더했다.
- 경치곡: 지역곡과 겹쳐 들리지 않게 음색을 바꿨다. 선율은 단소, 응답은 가야금 하모닉스, 바탕은 생황 지속음(`reed_drone`)이다. 물·바람 소리는 경치 환경음(`Sound.ambience`)이 맡으므로 곡에서 뺐다.
- 경치 전환(웹 `GameMusic`): 지역곡을 0.4초에 내린 뒤 0.8초를 쉬어 경치 효과음이 끝나게 하고, 경치곡을 들인다. 돌아올 때는 0.35초를 쉬고 지역곡을 반복 처음부터 다시 들인다. 경치곡은 지역곡이 도는 동안 미리 합성해 둔다(`player.preload`).
- 새 합성 음색: `ajaeng` 아쟁, `moduk_low`·`moduk_mid` 모듬북, `danso` 단소, `saenghwang` 생황, `gayageum_harmonic` 가야금 하모닉스.

경치는 마지막 마디의 D·A를 길게 남기고 잔향으로 끝난다. 바라보기를 닫기 전에는 지역곡으로 자동 복귀하지 않는다. 주제의 열린 끝음은 `openEnding:D4`, 엔딩의 마지막 선율만 `resolvedEnding:C4`로 닫힌다. 비반복곡에는 악보 뒤 잔향 5초가 붙는다.

## 악보·음색 고치기

한 곡은 `tempo`, `meter`, `measures`, `intro`, `loop`, `sections`, `voices`를 갖는다. 도입은 `intro:{start:0,end:N}`, 반복은 `loop:{start:N,end:measures}`다. 경계는 **0부터 세는 마디**, 끝은 포함하지 않는다. 도입은 2~8마디이며 반복 시작과 이어져야 한다. `intro:null,loop:null`은 한 번 재생한다.

성부의 `instrument`는 음색 id, `gain`은 0~2, `pan`은 -1(왼쪽)~1(오른쪽)이다. `patterns`에 음표를 두고 `sequence`에 마디별 패턴 id를 적는다. sequence 수는 measures와 같아야 한다. `role`은 선율·반주·저음·타악·환경음이다.

음표는 `음:길이[:세기]`다. `["C4:1:0.8","D4:0.5","E4:0.5","R:1"]`은 총 3개의 4분음표 길이다. `R`은 쉼, `X`는 고정 음정 타악, `#`·`b`는 반음 변화다. 길이는 양수인 4분음표 단위, 세기는 0~1이며 생략하면 0.8이다. 한 마디 길이는 `분자 × 4 / 분모`이므로 12/4=12, 12/8=6, 9/8=4.5다. 세마치 타악은 0·1.5·3에 강약을 잡는다. [국립국악원 중모리 교육 자료](https://academy.gugak.go.kr/dp/pds/HTML5-1-7-3/HTML5-1-7-3-5/index.htm)의 강약을 참고했다.

초는 `길이 × 60 / tempo`, 샘플 위치는 `round(누적 박수 × 60 / tempo × sampleRate)`다. 마디마다 반올림한 길이를 더하지 않는다. ♩=120·12/8의 한 마디는 3초이며 44,100Hz에서 132,300프레임이다. 스테레오라도 프레임 수를 두 배로 세지 않는다. 게임의 60fps·`G.f`와 관계없이 AudioContext의 초 시계를 쓴다. 음높이는 A4=440Hz, `440 × 2^((MIDI−69)/12)`다.

`instruments.json`은 가야금·대금·해금·피리, 장구 덩/쿵/덕/기덕·북·꽹과리·징·풍경, 바람·물·돌·엿가위·망치를 정의한다. `attack/decay/release/tail/fixedDuration/glideSeconds`는 초, `baseFrequency/noiseCutoff`는 Hz, `vibratoCents/glideCents/endWobbleCents`는 cent다. `partials`는 `[주파수 배수,진폭,감쇠 속도 배수]`다. seed로 재현하는 노이즈와 공명 필터, 4개 지연선의 리버브·DC 제거·ceiling 0.92의 리미터를 쓴다.

효과음은 3~6개 층의 `instrument`, `note`, `start/duration`(초), `gain/pan`, 선택 `patch`로 만든다. patch는 그 층의 음색만 바꾼다. 동작 길이보다 악기 꼬리·리버브가 길 수 있다. 소리가 재료 소비나 판정을 실행하지 않는다.

## 효과음 id와 기존 호출

`Sound`의 기존 함수명과 호출 지점은 유지하고 안쪽을 JSON의 층 있는 소리로 바꿨다. 장단의 `when`·그룹 취소는 기존 AudioContext 시계를 그대로 쓴다. 일반 호출은 `Sound.playSfx(id,{when,group,gain})`이다. 게임 효과음은 Sound가 맡고 음악실에는 `player.playSfx(id)`도 남긴다.

| 용도 | id |
|---|---|
| 걸음 | `footstep_leaf`, `footstep_frost`, `footstep_snow`, `footstep_market` |
| 이동·채집 | `jump`, `land`, `sickle`, `gather`, `pickup` |
| 교환·기록 | `exchange`, `dialog_next`, `bag_open`, `bag_close`, `book_open`, `book_close` |
| 가공 | `mortar`, `mill`, `steamer`, `medicine_roller`, `craft_complete` |
| 발견·전환 | `scenery_open`, `stamp_found`, `door`, `zone_travel`, `region_travel` |
| 특수 이동 | `drift`(떠내려가기), `memory_layer`(기억 층), `depth_enter`(깊이로 들어가기) |
| 전투 | `battle_warn`, `battle_hit`, `battle_part_break`, `battle_soothe`, `battle_victory` |
| UI | `ui_focus`, `ui_confirm`, `ui_cancel`, `ui_unavailable` |
| 기존 지역 동작 | `forge_hit`, `stone_edge`, `stone_fall`, `stone_sleep`, `stone_wake` |
| 장단 예약용 | `rhythm_drum_low`, `rhythm_drum_high`, `rhythm_metal`, `rhythm_metal_bright`, `rhythm_click`, `rhythm_noise` |

경치·도장·구역 이동·문·지역 이동은 공통 엔진에서 해당 id를 부른다. 특수 이동은 지역에서 `Sound.playSfx('drift')`처럼 호출하거나 `changeZone`의 도착 인자에 `sound:'drift'`를 넣는다. 효과음은 동시 소스 24개와 환경음 1개, 버퍼 캐시는 32개·12MiB로 제한한다.

## 게임 장면 연결과 지역 훅

| 장면·상태 | 곡 |
|---|---|
| 타이틀 / 프롤로그 | `title` / `theme` |
| 단풍골 / 돌너머 | `danpunggol` / `dolneomeo` |
| 큰 장터 낮 / 밤(`G.f.night`) | `market_day` / `market_night` |
| 영산 겨울 / 봄(`G.f.spring`) | `yeongsan` / `yeongsan_spring` |
| 경치 단풍골 / 돌너머 / 장터 / 영산 | `scenery_danpunggol` / `scenery_dolneomeo` / `scenery_market` / `scenery_yeongsan` |
| 칡 / 돌 골렘 / 도깨비 / 영산 보스 | `boss_kudzu` / `boss_golem` / `boss_dokkaebi` / `boss_steel` |
| 무쇠의 회피 시험 | `trial_iron` |
| 일반 미니게임 / 가공 동작 | `minigame` / `crafting` |
| 아빠 / 날쌘 이야기 장면 | `father` / `nalsaen` |
| 마지막 지역 엔딩 | `ending`(한 번) |
| 엿가위 장단 | BGM 정지, 기존 예약 반주만 사용 |

우선순위는 마지막 엔딩 → 전투 → 장단의 BGM 정지 → 전용 이야기 → 경치 → 미니게임·가공 → 타이틀·프롤로그 → 지역이다. 일반 전환은 1.5초, 전투·경치 진입은 0.35초다. 대화·가공·경치에서는 BGM을 72%로 낮춘다. 같은 곡을 매 프레임 다시 시작하지 않으며 실패 후 재도전 중에도 같은 곡을 유지한다. 보상·재료·호감·판정 시계는 바꾸지 않는다. `?classic=1`에서도 작동한다.

지역 파일은 이번 작업에서 수정하지 않았다. 지역 정의의 `Rg.music`(등록 뒤 `REG.music`)과 구역 정의의 `music`은 곡 id 문자열 또는 `(G,zone)=>id` 함수다. 구역 값 → 지역 값 → 위 기본 지역곡 순으로 고른다. 경치 정의·미니게임 정의·전투 상대의 `music`도 선택적으로 곡을 덮어쓴다. 없으면 기존 매핑을 쓴다.

이야기는 `talk(lines,onEnd,{music:'father'})` 또는 `{music:'nalsaen'}`으로 지정한다. 실제 화자가 아빠인 대사, 날쌘이 말하는 여러 줄짜리 이야기에도 테마를 고른다. 날쌘의 한 줄짜리 반복 메뉴는 지역곡을 유지하며 명시한 music으로 덮어쓸 수 있다. 문장에 이름이 나온다는 이유로 바꾸지 않는다. 별도 연출은 `GameMusic.setScene(id)`, 끝나면 `GameMusic.setScene(null)`을 쓴다. `GameMusic.getState()`·`GameMusic.player`로 확인한다. 지역을 바꾸면 임시 장면 지정은 초기화한다.

## 웹 연주기·음량·성능

`PackoonMusic`의 DSP는 웹과 Node가 공유한다. 게임 PCM은 22,050Hz, 오프라인 WAV는 44,100Hz다. 음표·리버브 준비 중 약 12~14ms마다 실행을 양보하고 완성된 PCM을 120ms 조각으로 AudioContext 시계의 300ms 앞까지 예약한다. 25ms 타이머는 예약만 담당한다.

게임은 Sound 다음에 music.js를 읽고 `PackoonMusic.attachSound(Sound,player)`로 같은 AudioContext를 쓴다. 첫 실제 키·포인터 입력 전에는 잠금을 우회하지 않는다. HUD의 켜기·끄기와 작은/큰 음량은 BGM·효과음을 함께 바꾼다. `Sound.setBgmVolume(0~1)`·`Sound.setSfxVolume(0~1)`은 각각 조절하고 기존 `packoon-sound-v1` 값 안에 저장한다. 옛 설정에 별도 값이 없으면 기존 작은/큰 음량에서 시작한다.

연주기는 `play(id,{crossfade,fromSeconds})`, `stop(fadeSeconds)`, `pause()`, `resume()`, `setVolume(0~1)`, `setDucking(factor,seconds)`, `setEnabled(bool)`, `getState()`, `getDiagnostics()`, `destroy()`를 제공한다. 숨긴 탭은 위치를 보존해 멈추고 예약 타이머도 끈다. 돌아오면 이어 가며 정지·음소거 중 지난 소리를 몰아 재생하지 않는다. 준비 중 다른 곡 요청이나 정지가 오면 늦게 끝난 이전 준비를 버린다.

BGM은 동시에 이전·현재 2곡만 페이드한다. 예약 버퍼 소스는 최대 48개, 캐시는 최근 2곡·48MiB 예산이다. 음표를 개별 WebAudio 소스로 만들지 않으므로 성부 수와 실시간 소스 수는 다르다. `getDiagnostics()`는 소스·캐시와 최대 96개의 오디오 시계 기록을 돌려준다. `intro-loop`·`loop`의 `when`은 다음 예약 시작 초, `previousBufferEnd`는 직전 버퍼의 끝 초이며 둘의 차가 `gapSeconds`다. 이 기록은 청음 결과가 아니다.

## WAV·이음매 검사

44,100Hz·16bit·스테레오 PCM에 결정적인 TPDF 디더를 넣는다. 반복부의 음 꼬리는 반복 시작에만 감아 더하고 마지막 6초로 반복 리버브를 준비한다. 도입은 빈 리버브에서 한 번 시작하며 도입 꼬리가 매 반복 되살아나지 않게 분리한다. 도입 마지막 쉼의 40ms만 반복 잔향으로 이어 두 WAV를 붙여도 경계가 연속이게 한다. 전체 페이드아웃으로 루프를 숨기지 않는다.

비반복곡에는 끝 잔향과 짧은 페이드를 둔다. 효과음은 양 채널이 모두 0.00001(-100dBFS) 아래로 내려간 뒤 20ms 여유를 남기고 마지막 5ms만 줄인다. WAV `smpl`의 끝은 포함하며 manifest의 `loopEndFrameExclusive`는 포함하지 않는 끝이다.

검사는 출력 WAV를 다시 읽어 포맷·피크·클리핑·RMS·50ms 단위 저레벨 구간·1초 단위 파형을 계산한다. 무음 기준 RMS는 0.0001(-80dBFS)이며 겨울의 긴 쉼은 실패로 세지 않는다. 반복 경계와 도입→반복 경계 모두 양끝 진폭 차 0.006FS 미만, 주변 5ms의 샘플 변화 95백분위 × 1.5와 0.002 중 큰 값 미만인지 본다. 경계 기울기 변화는 같은 백분위 × 2와 0.004 중 큰 값 미만, 앞뒤 기울기 차는 0.025 미만인지 확인한다. 분리 파일을 붙인 PCM도 한 파일과 대조한다.

2026-10-30 사운드 2단계 렌더 검사: 22곡(full 22개·intro 17개·loop 17개)과 48효과음, 총 104 WAV. 클리핑 0, 최대 피크 0.353241, 반복 양끝 최대 진폭 차 0.00274658, 도입→반복 최대 0.0027771로 두 경계 검사를 통과했다. 분리/전체 PCM의 차이는 독립 디더에 따른 최대 2 LSB다. `--check`·`--verify`·음악실 `--web-check`도 통과했다.

별도 AudioContext mock에서는 도입→반복과 반복 3회의 직전 끝·다음 시작 차이가 0이고 독립 수집한 167개 예약 버퍼의 최대 간격 오차는 3.83e-16초였다. 소스 최대 13개와 숨김 시 스케줄러 정지를 확인했다. 숨김·음소거·복귀 순서를 바꾼 두 경우의 재개도 확인했다. 파형·headless·mock 검사는 음색·성부 균형·반복 피로도·휴대폰 조작감·실제 소리 검증을 대신하지 않는다.

## Godot로 가져가기

웹에서는 렌더된 WAV를 읽지 않는다. Godot용은 다음 두 방식을 모두 만든다.

1. 한 파일: `<id>.wav`를 Import의 Loop Mode **Detect from WAV**로 가져오면 `smpl` 구간을 쓴다. 직접 설정할 때는 `AudioStreamWAV.loop_mode=LOOP_FORWARD`, `loop_begin=manifest.loopStartFrame`, `loop_end=manifest.loopEndFrameExclusive`다. manifest에서 `variant:"full"`인 항목을 고른다. 경치·엔딩은 LOOP_DISABLED로 둔다.
2. 분리 파일: `<id>_intro.wav`는 비반복, `<id>_loop.wav`는 처음부터 끝까지 반복이다. 두 AudioStreamPlayer에 자원을 미리 넣고 intro 뒤 loop로 넘긴다. 단순 `finished` 신호 연결은 프레임·오디오 버퍼 지연이 생길 수 있다. 샘플 단위 무간격이 필요하면 한 파일 방식을 쓰며 두 플레이어의 실제 이음매는 Godot 기기에서 확인한다.

Trim·Normalize·샘플레이트 강제 변경은 먼저 끈다. 샘플 위치와 편곡 음량을 보존하기 위해서다. 리버브는 이미 포함돼 있다. [Godot 공식 가져오기 문서](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_audio_samples.html)와 [AudioStreamWAV의 loop_begin·loop_end](https://docs.godotengine.org/en/stable/classes/class_audiostreamwav.html#class-audiostreamwav-property-loop-begin)를 따른다. Godot 실제 실행과 기기 청음은 이번 웹 검사에 포함하지 않는다.

## 나중에 검토할 CC0 녹음 후보

아래 후보는 1단계에서 조사한 목록이며 다운로드하거나 합성음에 섞지 않았다. 확인일은 2026-10-30이다.

| 후보·제작자 | 쓰임 | 출처·라이선스 |
|---|---|---|
| Wind (Gentle Breeze) · mario1298 | 숲·호수 바람 | [Duke Sonic Dictionary](https://sonicdictionary.duke.edu/items/wind-gentle-breeze.html), CC0 |
| Water 02 · unfa | 물 붓기·물결 | [Freesound 원본](https://freesound.org/people/unfa/sounds/161495/), CC0 |
| Footsteps - quiet.wav · jodybruchon | 조용한 발걸음 보조층 | [Freesound 원본](https://freesound.org/people/jodybruchon/sounds/433884/), CC0 |
| Impact Sounds · Kenney | 나무·금속 타격 보조층 | [제작자 배포 페이지](https://kenney.nl/assets/impact-sounds), CC0 |


## 장면별 곡 (결정 D-72)

대화 곡은 `design/data/scene_music.csv`가 정한다. 한 줄이 장면 하나이고, 칸은 `id,지역,장면,곡,시작줄,까닭,상태`다.

- `곡`은 이 폴더 `music.json`의 곡 id이거나 `지역`이다. `지역`은 이야기 곡을 깔지 않고 지역 곡을 그대로 둔다.
- `시작줄`부터 그 곡이 나온다. 그 전 줄에는 지역 곡이 흐른다. 예를 들어 아빠 재회는 아이가 "…아빠?"라고 알아보는 1번 줄부터 아빠 곡이다.
- 웹에서는 지역 코드가 대화 직전에 `sceneNext('<id>')`를 부른다. 표에 없는 대화는 예전 자동 규칙을 따른다. 아빠가 말하면 아빠 곡, 날쌘과 여러 줄을 나누면 날쌘 곡이다.
- `build-data.js`가 곡 id와 시작줄을 검사하고 `TABLES.SCENE_MUSIC`으로 넘긴다.

## 효과음 연결 (결정 D-74)

- 환경음(바람·물·기억 다리)이 켜져 있어도 효과음은 난다. 효과음을 쉬는 때는 경치를 바라보는 동안뿐이다(`Sound.setQuiet`).
- 쓰는 곳
  - `book_open`·`book_close`: 수첩을 여닫을 때
  - `medicine_roller`: 약연 손놀림과 약연이 깨어날 때
  - `ui_confirm`·`ui_cancel`: 대화 선택지를 고를 때. 그만두기는 `ui_cancel`이다.
  - `drift`: 단풍골 함지박 물길
  - `depth_enter`: 나무 속으로 들어갈 때
  - `memory_layer`: 돌너머 기억 다리

## 마음 상태에 따라 바뀌는 음악 (결정 D-37·D-87)

웹 `engine/game.js`의 GameMusic이 주인공의 긴장·그리움(0~1)을 매 프레임 읽어 곡의 층 볼륨과 템포 단계를 바꾼다.

- 층 나눔과 템포 단계는 `design/data/music_layers.csv`가 원본이다. 성부 id는 이 폴더 `music.json`의 voices id와 같다.
- 층은 셋이다. **바탕**은 늘 들린다. **그리움**은 엄마·아빠 이야기와 경치, 전투의 진정이 차오를 때 올라온다. **북**은 긴장이 오를 때 올라온다.
- 곡의 모든 성부는 꼭 한 층에 있어야 한다. 빠진 성부는 층 재생에서 들리지 않는다. `build-data.js`가 이 규칙을 검사한다. 곡에 성부를 더하면 이 표도 같이 고친다.
- 지역의 긴장 원천은 지역 코드의 `Rg.moodTension()`이 정한다: 단풍골 엉킨 칡, 돌너머 성황당 끝 골렘, 큰 장터 그믐밤 창고, 영산 호숫가 강철이.
- 장면 곡(`scene_music.csv`, D-72)이 나오는 대화와 경치(D-46)에는 끼어들지 않는다.
