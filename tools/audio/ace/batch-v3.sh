#!/bin/bash
# 결정 D-107: 다시 쓴 합성 곡(compose-v3.js)을 기준 음원으로 ACE-Step cover 녹음판을 만든다.
# 사용: bash tools/audio/ace/batch-v3.sh [곡id ...]   (없으면 아래 표 전부)
# 먼저 node tools/audio/render.js --track=<곡id,...> 로 assets-godot/audio/bgm/<id>.wav 를 만들어 둔다.
# 결과: $OUT/gen/<id>/ 에 후보 두 개. 고르기·이음새·OGG는 finish-v3.sh 가 한다.
set -e
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
OUT="${OUT:-C:/Users/hoon3/Music/packoon-music-test/v3}"
ENGINE="$HOME/.claude/skills/claude-music/scripts/music_engine.sh"
COMMON="Korean traditional gugak ensemble, no vocals"
declare -A BPM KEY CAP
BPM[boss_kudzu]=158; KEY[boss_kudzu]="C minor"
CAP[boss_kudzu]="fusion battle music, fast, driving, intense, 16th-note percussion, moduk-buk ensemble drums pounding, piri double-reed lead riff, haegeum fiddle answers, fast plucked gayageum arpeggios, ajaeng low string 16th-note ostinato, dongsalpuri rhythm, tangled and tense, heroic"
BPM[boss_golem]=150; KEY[boss_golem]="C major"
CAP[boss_golem]="fusion battle music, fast, driving, heavy, 16th-note percussion, stone clacks, buk barrel drum and moduk-buk pounding, jing gong crashes, piri double-reed lead riff, haegeum answers, gayageum arpeggios, ajaeng 16th-note low string ostinato, massive, grounded, powerful"
BPM[boss_dokkaebi]=172; KEY[boss_dokkaebi]="C major"
CAP[boss_dokkaebi]="fusion battle music, very fast, driving, mischievous, playful, 16th-note percussion, kkwaenggwari small gong eighth notes, wooden scissors clacks off-beat, janggu, moduk-buk drums, piri lead riff, haegeum answers, gayageum arpeggios, ajaeng ostinato, wild and bouncy"
BPM[boss_steel]=165; KEY[boss_steel]="C minor"
CAP[boss_steel]="epic final boss battle music, fast, driving, intense, 16th-note percussion, haegeum fiddle lead riff, piri double-reed answers, moduk-buk and buk drums pounding, jing gong crashes, cold winter wind, gayageum arpeggios, ajaeng 16th-note low string ostinato, dramatic, heroic"
BPM[trial_iron]=150; KEY[trial_iron]="C major"
CAP[trial_iron]="training duel music, fast, driving, 16th-note percussion, blacksmith forge anvil hammer rhythm, bellows breath, buk and moduk-buk drums, haegeum fiddle lead riff, gayageum arpeggios, ajaeng ostinato, firm but warm, stern teacher"
BPM[danpunggol]=96; KEY[danpunggol]="C major"
CAP[danpunggol]="instrumental, late autumn valley, gayageum zither lead melody, daegeum bamboo flute answer, haegeum, ajaeng low bowed string, soft janggu drum in jungmori rhythm, warm, nostalgic, gentle, catchy melody"
BPM[dolneomeo]=72; KEY[dolneomeo]="C major"
CAP[dolneomeo]="instrumental, stony mountain village, daegeum bamboo flute lead melody, gayageum answer, haegeum, ajaeng bass, stone percussion, semachi rhythm in three, steady, earthy, hopeful, catchy melody"
BPM[market_day]=132; KEY[market_day]="C major"
CAP[market_day]="festival market music, New Year's market, piri double-reed lead melody, gayageum, haegeum, janggu and kkwaenggwari, lively jajinmori rhythm, bustling, cheerful, catchy melody"
BPM[market_night]=66; KEY[market_night]="C major"
CAP[market_night]="instrumental, lantern-lit market at night, haegeum fiddle lead melody, soft gayageum, gentle janggu, calm, mysterious, tender, catchy melody"
IDS=("$@"); [ ${#IDS[@]} -eq 0 ] && IDS=(boss_kudzu boss_golem boss_dokkaebi boss_steel trial_iron danpunggol dolneomeo market_day market_night)
for id in "${IDS[@]}"; do
  src="$ROOT/assets-godot/audio/bgm/$id.wav"; [ -f "$src" ] || { echo "원곡 없음: $src"; exit 2; }
  mkdir -p "$OUT/gen/$id"
  echo "== $id (${BPM[$id]} · ${KEY[$id]})"
  bash "$ENGINE" --quality standard --seed 1031 --batch 2 --format wav --output-dir "$OUT/gen/$id" \
    cover --src-audio "$(cygpath -w "$src")" --caption "$COMMON, ${CAP[$id]}" --instrumental \
    --bpm "${BPM[$id]}" --key "${KEY[$id]}" --cover-strength 0.6 2>&1 | tail -3
done
