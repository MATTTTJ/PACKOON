#!/bin/bash
# 결정 D-121: 모든 곡을 ACE-Step이 선율부터 새로 짓는다(text-to-music, 기준 음원 없음). 표는 v5-spec.tsv.
# 곡마다 판(main / calm·tense / base·climax)마다 시드 셋으로 후보 셋을 만든다.
# 같은 곡의 판끼리는 BPM·조·길이가 같아 게임에서 함께 틀고 긴장도에 따라 섞는다.
# 반복 곡 길이 = (반복 마디 + 2)마디. 반복은 둘째 마디부터. 반복 없는 곡은 표의 길이(초), 10초 미만이면 10초로 만들고 뒤에서 자른다.
# 특정 기존 곡을 지명하거나 흉내 내는 말은 캡션에 넣지 않는다.
# 사용: bash tools/audio/ace/batch-v5.sh [곡id ...]
set -e
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
OUT="${OUT:-C:/Users/hoon3/Music/packoon-music-test/v5}"
ENGINE="$HOME/.claude/skills/claude-music/scripts/music_engine.sh"
COMMON="Korean traditional gugak ensemble, instrumental, no vocals, catchy memorable hook melody"
SEEDS=(21 4242 90210)
want=" $* "
grep -v '^#' "$ROOT/tools/audio/ace/v5-spec.tsv" | while IFS=$'\t' read -r id bpm beats bars len ts allowed variants cap; do
  [ -z "$id" ] && continue
  [ "$want" != "  " ] && [[ "$want" != *" $id "* ]] && continue
  if [ "$bars" != "0" ]; then dur=$(node -e "console.log(((${bars}+2)*${beats}*60/${bpm}).toFixed(2))"); loopcap=", loopable"
  else dur=$(node -e "console.log(Math.max(10,${len}).toFixed(2))"); loopcap=""; fi
  scale="pentatonic scale C D E G A"; key="C major"
  [ "$allowed" = "0,3,5,7,10" ] && { scale="minor pentatonic scale C Eb F G Bb"; key="C minor"; }
  IFS=';' read -ra VS <<< "$variants"
  for v in "${VS[@]}"; do
    vname="${v%%=*}"; vcap="${v#*=}"
    mkdir -p "$OUT/gen/$id/$vname"
    echo "== $id/$vname (${bpm} · ${key} · ${dur}초)"
    for seed in "${SEEDS[@]}"; do
      [ -n "$(ls "$OUT/gen/$id/$vname"/*_s${seed}.wav 2>/dev/null)" ] && continue
      tmp="$OUT/gen/$id/$vname/tmp"; mkdir -p "$tmp"
      bash "$ENGINE" --quality standard --seed "$seed" --batch 1 --format wav --output-dir "$tmp" \
        generate --caption "$COMMON$loopcap, $cap${vcap:+, $vcap}, $scale" --instrumental --bpm "${bpm%.*}" --key "$key" --time-sig "$ts" --duration "$dur" 2>&1 | tail -1 | cut -c1-120
      f=$(ls -t "$tmp"/*.wav 2>/dev/null | head -1); [ -n "$f" ] && mv "$f" "$OUT/gen/$id/$vname/${id}_${vname}_s${seed}.wav"
      rm -rf "$tmp"
    done
  done
done
