#!/bin/bash
# 결정 D-121: batch-v5.sh 후보에서 판마다 하나를 고르고(pick_new.py: 박·조성·이음새), 게임용으로 다듬는다.
#   반복 곡: loop.py로 반복 끝을 반복 시작 직전과 섞는다. 반복은 둘째 마디 시작부터 N마디.
#   반복 없는 곡(경치·엔딩·간주): fade.py로 길이에 맞춰 자르고 페이드만 한다.
# 결과
#   prototypes/web/audio/bgm/new/<id>[_<판>].ogg   게임용 (첫 판은 <id>.ogg)
#   prototypes/web/js/data/new-music.js             곡마다 판 파일·반복 구간(초) 표
#   $OUT/NN_<id>_<판>.wav                             고른 것 (나머지 후보는 $OUT/gen/<id>/<판>/)
#   $OUT/report/<id>_<판>.json                        고른 기준 수치
# 사용: bash tools/audio/ace/finish-v5.sh [곡id ...]   OGG 품질은 Q(기본 3)
set -e
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
OUT="${OUT:-C:/Users/hoon3/Music/packoon-music-test/v5}"
ACE="${ACE:-C:/Users/hoon3/ACE-Step-1.5}"
Q="${Q:-3}"
mkdir -p "$OUT/report" "$ROOT/prototypes/web/audio/bgm/new"
TABLE="$OUT/report/table.tsv"; : > "$TABLE.part"
want=" $* "; n=0
# 표는 3번 입력으로 읽는다(안의 uv·ffmpeg가 표준 입력을 먹지 않게)
while IFS=$'\t' read -r id bpm beats bars len ts allowed variants cap <&3; do
  [ -z "$id" ] && continue
  [ "$want" != "  " ] && [[ "$want" != *" $id "* ]] && continue
  n=$((n+1)); nn=$(printf '%02d' $n)
  if [ "$bars" != "0" ]; then
    ls=$(node -e "console.log((${beats}*60/${bpm}).toFixed(4))"); le=$(node -e "console.log(((${bars}+1)*${beats}*60/${bpm}).toFixed(4))")
  else ls=0; le=0; fi
  IFS=';' read -ra VS <<< "$variants"; first=1; parts=""
  for v in "${VS[@]}"; do
    vname="${v%%=*}"; tag="$id"; [ $first = 0 ] && tag="${id}_${vname}"
    cands=("$OUT/gen/$id/$vname"/*.wav)
    uv run --project "$ACE" python "$ROOT/tools/audio/ace/pick_new.py" "$bpm" "$allowed" "$ls" "$le" "${cands[@]}" > "$OUT/report/${id}_${vname}.pick.json"
    best=$(node -e "console.log(require('$OUT/report/${id}_${vname}.pick.json').chosen)")
    out="$OUT/${nn}_${id}_${vname}.wav"
    if [ "$bars" != "0" ]; then
      uv run --project "$ACE" python "$ROOT/tools/audio/ace/loop.py" "$best" "$ls" "$le" "$out" "$best" > "$OUT/report/${id}_${vname}.fix.json"
    else
      uv run --project "$ACE" python "$ROOT/tools/audio/ace/fade.py" "$best" "$out" --len "$len" "$best" > "$OUT/report/${id}_${vname}.fix.json"
    fi
    ffmpeg -loglevel error -y -i "$out" -c:a libvorbis -q:a "$Q" -ar 44100 "$ROOT/prototypes/web/audio/bgm/new/$tag.ogg"
    parts="$parts${parts:+,}$vname=audio/bgm/new/$tag.ogg"
    echo "$id/$vname $(node -e "const p=require('$OUT/report/${id}_${vname}.pick.json'),f=require('$OUT/report/${id}_${vname}.fix.json');console.log(p.candidates.map(c=>c.file.replace(/^.*_s/,'s').replace('.wav','')+' 박'+c.beat+' 조'+c.scale+' 잇'+c.seam+'='+c.score).join(' | '),f.seam_raw?('· 튐 '+f.seam_raw.edge_jump+'→'+f.seam_fixed.edge_jump):'')") ogg $(stat -c %s "$ROOT/prototypes/web/audio/bgm/new/$tag.ogg")"
    first=0
  done
  printf '%s\t%s\t%s\t%s\n' "$id" "$ls" "$le" "$parts" >> "$TABLE.part"
done 3< <(grep -v '^#' "$ROOT/tools/audio/ace/v5-spec.tsv")
mv "$TABLE.part" "$TABLE"
node "$ROOT/tools/audio/ace/new-table.js" "$TABLE" "$ROOT/prototypes/web/js/data/new-music.js"
