#!/usr/bin/env bash
# Codex 에게 일 하나를 맡긴다 (Git Bash).
#   tools/codex/run.sh <작업폴더> <일.md> [역할 ...]
# 예: tools/codex/run.sh ../PACKOON-wt/pa-40-foo jobs/pa-40.md qa-tester
# 환경 변수: EFFORT (기본 medium), MODEL (기본 gpt-6.1-sol), SANDBOX (기본 workspace-write)
# 지시문 = 역할 머리말들 + 일.md + common.md. 마지막 답변은 <일.md 이름>.out.md, 전체 기록은 .log 로.
set -u
here="$(cd "$(dirname "$0")" && pwd)"
dir=$1; job=$2; shift 2
files=()
for r in "$@"; do files+=("$here/roles/$r.md"); done
files+=("$job" "$here/common.md")
out="${job%.md}.out.md"; log="${job%.md}.log"
cat "${files[@]}" | codex exec --skip-git-repo-check \
  -m "${MODEL:-gpt-6.1-sol}" -c model_reasoning_effort="\"${EFFORT:-medium}\"" \
  --sandbox "${SANDBOX:-workspace-write}" -C "$dir" -o "$out" - > "$log" 2>&1
code=$?
echo "exit $code"; tail -c 2500 "$out" 2>/dev/null
exit $code
