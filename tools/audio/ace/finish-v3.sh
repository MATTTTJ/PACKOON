#!/bin/bash
# 결정 D-107: batch-v3.sh 후보에서 원곡 선율을 더 지킨 쪽을 고르고, 반복 이음새를 다듬어 OGG로 줄인다.
# 사용: bash tools/audio/ace/finish-v3.sh [곡id ...]
# 결과
#   prototypes/web/audio/bgm/<id>.ogg            게임용
#   $OUT/NN_<id>_합성_새악보.wav / _ACE녹음.wav   들어 보기용 (보스 곡이 앞)
#   $OUT/report/<id>.json                         고른 후보·선율 상관·이음새 측정
set -e
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"; ROOTW="$(cygpath -m "$ROOT")"
OUT="${OUT:-C:/Users/hoon3/Music/packoon-music-test/v3}"
ACE="${ACE:-C:/Users/hoon3/ACE-Step-1.5}"
IDS=("$@"); [ ${#IDS[@]} -eq 0 ] && IDS=(boss_kudzu boss_golem boss_dokkaebi boss_steel trial_iron danpunggol dolneomeo market_day market_night)
mkdir -p "$OUT/report"
n=0
for id in "${IDS[@]}"; do
  n=$((n+1)); nn=$(printf '%02d' $n)
  secs=$(node -e "const m=JSON.parse(require('fs').readFileSync('$ROOTW/design/data/music/music.json','utf8').replace(/^\uFEFF/,''));const t=m.tracks.find(t=>t.id==='$id');const bar=t.meter[0]*4/t.meter[1]*60/t.tempo;console.log((t.loop.start*bar).toFixed(4),(t.loop.end*bar).toFixed(4))")
  set -- $secs
  src="$ROOT/assets-godot/audio/bgm/$id.wav"
  cands=("$OUT/gen/$id"/*.wav)
  out="$OUT/${nn}_${id}_ACE녹음.wav"
  uv run --project "$ACE" python "$ROOT/tools/audio/ace/loop.py" "$src" "$1" "$2" "$out" "${cands[@]}" > "$OUT/report/$id.json"
  cp "$src" "$OUT/${nn}_${id}_합성_새악보.wav"
  ffmpeg -loglevel error -y -i "$out" -c:a libvorbis -q:a 3 -ar 44100 "$ROOT/prototypes/web/audio/bgm/$id.ogg"
  echo "$id $(node -e "const r=require('$OUT/report/$id.json');console.log('match',r.melody_match.map(x=>x[0]).join('/'),'jump',r.seam_raw.edge_jump,'→',r.seam_fixed.edge_jump)") ogg $(stat -c %s "$ROOT/prototypes/web/audio/bgm/$id.ogg")"
done
