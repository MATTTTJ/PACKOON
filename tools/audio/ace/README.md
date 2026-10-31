# ACE-Step 녹음 음원 만들기 (결정 D-105)

합성 원곡을 기준 음원으로 ACE-Step 1.5 cover 모드에 넣는다. 그러면 '이름의 노래' 선율·템포·조·길이를 그대로 두고 실제 악기 소리만 바꿀 수 있다. 결과는 게임용 반복 음원(OGG)으로 다듬는다. 자세한 조건과 측정값은 `design/data/music/README.md`의 "녹음 음원" 절에 있다.

## 순서

1. 합성 원곡을 렌더한다: `node tools/audio/render.js --track=danpunggol,boss_kudzu` → `assets-godot/audio/bgm/<id>.wav`
   - 이 명령은 `prototypes/web/js/data/music-data.js`의 줄바꿈을 바꿀 수 있다. 바뀌면 `git checkout`으로 되돌린다.
2. cover 생성(claude-music 스킬 래퍼):
   ```
   bash ~/.claude/skills/claude-music/scripts/music_engine.sh --quality standard --seed 1031 --batch 2 --format wav \
     --output-dir <폴더> cover --src-audio <원곡.wav> --caption "<캡션>" --instrumental --bpm <원곡 BPM> --key "<조>" --cover-strength 0.6
   ```
3. 분석(BPM·조·음 집합): `uv run --project <ACE-Step 폴더> python tools/audio/ace/analyze.py <원곡.wav> <후보.wav>...`
4. 후보 고르기와 반복 이음새: `uv run --project <ACE-Step 폴더> python tools/audio/ace/loop.py <원곡.wav> <반복 시작 초> <반복 끝 초> <출력.wav> <후보.wav>...`
   - 원곡과 시간별 음높이 분포(크로마) 상관이 가장 높은 후보를 고른다.
   - 반복 끝 0.35초를 반복 시작 직전 0.35초와 같은 전력 곡선으로 섞는다.
   - 이음새 전후 50ms의 RMS, 경계 샘플 튐, 스펙트럼 거리를 출력한다.
5. OGG로 줄인다: `ffmpeg -i <출력.wav> -c:a libvorbis -q:a 3 -ar 44100 prototypes/web/audio/bgm/<id>.ogg`
6. `prototypes/web/js/engine/game.js`의 `RECORDINGS`에 곡 id와 파일을 더한다.

반복 시작·끝 초는 `design/data/music/music.json`의 `loop.start`·`loop.end`(마디)에 마디 길이를 곱해 구한다. 마디 길이는 `박자 분자 × 4 / 박자 분모 × 60 / 템포`초다.

## 새 곡 만들기 (결정 D-121, 지금 쓰는 방식)

D-105~107의 cover 녹음(합성 원곡을 따라 부르기)은 대체됐다. 이제는 기준 음원 없이 ACE-Step이 선율부터 짓는다.

1. 곡 표: `v5-spec.tsv` (BPM, 마디당 박, 반복 마디 수, 반복 없는 곡의 길이, 허용음, 판, 캡션). 판은 `main` 하나이거나, 지역 곡은 `calm`·`tense`, 보스는 `base`·`climax` 둘이다.
2. 생성: `bash tools/audio/ace/batch-v5.sh [곡id …]`. 판마다 시드 21·4242·90210으로 후보 셋을 만든다. 반복 곡 길이는 (반복 마디 + 2)마디다.
3. 마무리: `bash tools/audio/ace/finish-v5.sh [곡id …]` (`Q=2`로 OGG 품질을 낮출 수 있다)
   - `pick_new.py`가 후보마다 박 분명함(onset 자기상관의 한 박 자리 값), 조성 안 음 비율(크로마 에너지 중 허용음 다섯의 몫), 반복 이음새(반복 끝 직전 1초와 반복 시작 직전 1초의 스펙트럼·세기 차이)를 재서 0.35·0.4·0.25로 더한 점수가 가장 높은 것을 고른다.
   - 반복 곡은 `loop.py`로 둘째 마디 시작~(N+1)마디 끝을 반복 구간으로 다듬는다. 반복 없는 곡(경치·엔딩·간주)은 `fade.py`로 페이드만 한다.
   - `new-table.js`가 `prototypes/web/js/data/new-music.js`(판 파일·반복 구간 표)를 만든다.
4. 같은 곡의 두 판은 BPM·조·길이가 같아서 게임이 함께 틀고 긴장도(mix)로 섞는다. 박은 캡션과 BPM 지정으로만 맞추므로 두 판의 박이 정확히 겹치지는 않는다.
