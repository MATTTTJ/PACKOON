'use strict';

// 의존 패키지 없이 실행한다. 게임 소스는 읽기만 하고 생성물 검사도 --check로 한다.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {spawnSync} = require('node:child_process');

const slash = value => value.split(path.sep).join('/');
const location = (source, offset) => source.slice(0, offset).split('\n').length;
const finding = (rule, file, line, message, severity = '높음', extra = {}) => ({rule, severity, file, line, message, ...extra});
const result = (name, summary, findings, details = {}) => ({name,
  status: findings.some(f => f.level !== 'warning') ? 'fail' : findings.length ? 'warn' : 'pass', summary, findings, ...details});

function sourceFiles(root) {
  const listed = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', '*.js'], {cwd: root, encoding: 'utf8'});
  if (listed.status !== 0) throw new Error('JS 목록을 읽지 못했다: ' + listed.stderr);
  return [...new Set(listed.stdout.split('\0').filter(Boolean))].sort()
    .filter(file => !file.split('/').some(p => ['qa-out', 'node_modules', '.git'].includes(p)));
}

// 따옴표 안의 쉼표·줄바꿈·두 겹 따옴표를 보존하며 실제 원본 행 번호를 기록한다.
function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const rows = []; let cells = [], value = '', quoted = false, line = 1, rowLine = 1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { value += '"'; i++; }
      else if (ch === '"') quoted = false;
      else { value += ch; if (ch === '\n') line++; }
    } else if (ch === '"') {
      if (value) throw new Error(line + '행: 따옴표 앞에 값이 있다');
      quoted = true;
    } else if (ch === ',') { cells.push(value); value = ''; }
    else if (ch === '\n') {
      cells.push(value.replace(/\r$/, ''));
      if (cells.some(Boolean)) rows.push({cells, line: rowLine});
      cells = []; value = ''; line++; rowLine = line;
    } else value += ch;
  }
  if (quoted) throw new Error(rowLine + '행: 닫히지 않은 CSV 따옴표');
  if (value || cells.length) { cells.push(value.replace(/\r$/, '')); if (cells.some(Boolean)) rows.push({cells, line: rowLine}); }
  return rows;
}

// JS를 실행하지 않는 어휘 분석기. 주석/문자열/정규식 내부의 대괄호는 구문으로 세지 않는다.
function tokenize(source) {
  const tokens = []; let i = 0;
  const add = (type, start, end, value) => tokens.push({type, start, end, raw: source.slice(start, end), value});
  while (i < source.length) {
    const ch = source[i], next = source[i + 1];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === '/' && next === '/') { i = source.indexOf('\n', i + 2); if (i < 0) break; continue; }
    if (ch === '/' && next === '*') { const end = source.indexOf('*/', i + 2); i = end < 0 ? source.length : end + 2; continue; }
    if (ch === "'" || ch === '"' || ch === '`') {
      const start = i++, quote = ch; let dynamic = false;
      while (i < source.length) {
        if (source[i] === '\\') { i += 2; continue; }
        if (quote === '`' && source[i] === '$' && source[i + 1] === '{') dynamic = true;
        if (source[i++] === quote) break;
      }
      const raw = source.slice(start, i); let value;
      if (!dynamic) { try { value = vm.runInNewContext(raw, Object.create(null), {timeout: 25}); } catch (_) { value = undefined; } }
      add(dynamic ? 'template' : 'string', start, i, value); continue;
    }
    if (/[A-Za-z_$가-힣]/.test(ch)) {
      const start = i++; while (i < source.length && /[\w$가-힣]/.test(source[i])) i++;
      add('identifier', start, i, source.slice(start, i)); continue;
    }
    if (/[0-9]/.test(ch)) { const start = i++; while (i < source.length && /[\w.]/.test(source[i])) i++; add('number', start, i); continue; }
    if (ch === '/') {
      const prev = tokens.at(-1);
      if (!prev || ['=', '(', '[', '{', ':', ',', ';', '!', '?', '=>', '&&', '||'].includes(prev.raw) || ['return', 'case', 'throw'].includes(prev.value)) {
        const start = i++; let group = false;
        while (i < source.length) {
          if (source[i] === '\\') { i += 2; continue; }
          if (source[i] === '[') group = true;
          if (source[i] === ']') group = false;
          if (source[i++] === '/' && !group) break;
        }
        while (/[a-z]/i.test(source[i] || '') && i < source.length) i++;
        add('regexp', start, i); continue;
      }
    }
    const op = ['?.', '=>', '&&', '||', '??', '===', '!==', '==', '!=', '...', '**'].find(op => source.startsWith(op, i));
    const start = i; i += op ? op.length : 1; add('punctuation', start, i);
  }
  return tokens;
}

function grammar(tokens) {
  const pairs = new Map(), stack = [], contexts = new Map();
  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i].raw;
    if (['[', '(', '{'].includes(raw)) {
      const call = raw === '(' && ['talk', 'arcScene', 'arcMenu'].includes(tokens[i - 1]?.raw);
      const enclosing = stack.findLastIndex(entry => entry.dialogue);
      // talk의 종료 콜백에 있는 일기/통계 배열은 대사가 아니다. 콜백 안의 새 talk는 다시 인식한다.
      contexts.set(i, !!call || (enclosing >= 0 && !stack.slice(enclosing + 1).some(entry => entry.raw === '{')));
      stack.push({i, raw, dialogue: !!call});
    } else if ([']', ')', '}'].includes(raw)) {
      const open = stack.pop(); if (open) { pairs.set(open.i, i); pairs.set(i, open.i); }
    }
  }
  return {pairs, contexts};
}

function fields(tokens, start, end, pairs) {
  const out = []; let part = start;
  for (let i = start; i < end; i++) {
    if (['[', '(', '{'].includes(tokens[i].raw) && pairs.get(i) < end) i = pairs.get(i);
    else if (tokens[i].raw === ',') { out.push([part, i]); part = i + 1; }
  }
  if (part < end) out.push([part, end]);
  return out;
}

function textVariants(tokens, start, end, pairs) {
  while (tokens[start]?.raw === '(' && pairs.get(start) === end - 1) { start++; end--; }
  if (end === start + 1 && tokens[start].type === 'string') return [{text: tokens[start].value, token: tokens[start], complete: true}];
  let question = -1, nested = 0;
  for (let i = start; i < end; i++) {
    if (['[', '(', '{'].includes(tokens[i].raw) && pairs.get(i) < end) { i = pairs.get(i); continue; }
    if (tokens[i].raw === '?') { if (question < 0) question = i; else nested++; }
    else if (tokens[i].raw === ':' && question >= 0) {
      if (nested) nested--;
      else return [...textVariants(tokens, question + 1, i, pairs), ...textVariants(tokens, i + 1, end, pairs)];
    }
  }
  if (start < end && tokens.slice(start, end).every((t, i) => i % 2 ? t.raw === '+' : t.type === 'string')) {
    return [{text: tokens.slice(start, end).filter(t => t.type === 'string').map(t => t.value).join(''), token: tokens[start], complete: true}];
  }
  // 변수 삽입/함수 호출은 평가하지 않는다. 상수 조각의 금지어는 잡되 전체 길이는 단정하지 않는다.
  return tokens.slice(start, end).filter(t => t.type === 'string').map(token => ({text: token.value, token, complete: false}));
}

function parseDialogue(source, {speakers = []} = {}) {
  const tokens = tokenize(source), {pairs, contexts} = grammar(tokens);
  const candidates = [], names = new Set(speakers); let dynamicRows = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].raw === 'name' && tokens[i + 1]?.raw === ':' && tokens[i + 2]?.type === 'string') names.add(tokens[i + 2].value);
    if (tokens[i].raw !== '[' || !pairs.has(i)) continue;
    const parts = fields(tokens, i + 1, pairs.get(i), pairs);
    if (parts.length < 2 || parts[0][1] - parts[0][0] !== 1) continue;
    const who = tokens[parts[0][0]];
    if (who.type !== 'string') { if (contexts.get(i) && who.raw !== '[') dynamicRows++; continue; }
    if (!who.value) continue;
    const variants = textVariants(tokens, ...parts[1], pairs);
    if (!variants.length) { if (contexts.get(i)) dynamicRows++; continue; }
    const entry = {speaker: who.value, line: location(source, who.start), variants, direct: contexts.get(i)};
    candidates.push(entry); if (entry.direct) names.add(entry.speaker);
  }
  // arcMenu(name,say,...)는 talk([[name,say,...]])의 명시된 래퍼다.
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].raw !== 'arcMenu' || tokens[i + 1]?.raw !== '(' || !pairs.has(i + 1)) continue;
    const parts = fields(tokens, i + 2, pairs.get(i + 1), pairs);
    if (parts.length < 2 || parts[0][1] - parts[0][0] !== 1 || tokens[parts[0][0]].type !== 'string') continue;
    const who = tokens[parts[0][0]];
    candidates.push({speaker: who.value, line: location(source, who.start), variants: textVariants(tokens, ...parts[1], pairs), direct: true});
  }
  const rows = [];
  for (const candidate of candidates) if (candidate.direct || names.has(candidate.speaker)) {
    for (const variant of candidate.variants) if (typeof variant.text === 'string') rows.push({speaker: candidate.speaker,
      text: variant.text, line: location(source, variant.token.start), complete: variant.complete});
  }
  return {rows, dynamicRows};
}

function checkDialogue(source, file, rules, knownSpeakers = []) {
  const {rows, dynamicRows} = parseDialogue(source, {speakers: knownSpeakers});
  const findings = [], seen = new Set();
  const allowed = (rule, row) => (rules.dialogue.ruleAllowlist || []).some(a => a.reason && a.rule === rule && a.speaker === row.speaker && a.text === row.text && (!a.file || a.file === file));
  const push = (rule, row, message, warning = false) => {
    if (allowed(rule, row)) return;
    const key = [rule, row.line, row.speaker, row.text].join('|'); if (seen.has(key)) return; seen.add(key);
    findings.push(finding(rule, file, row.line, message, warning ? '낮음' : '보통', {speaker: row.speaker, text: row.text, level: warning ? 'warning' : 'error', complete: row.complete}));
  };
  for (const row of rows) {
    if (row.speaker !== '너구리') {
      const term = rules.dialogue.inputTerms.find(term => row.text.toLowerCase().includes(term.toLowerCase()));
      if (term) push('dialogue-input', row, row.speaker + ' 대사에 조작 안내 «' + term + '»가 있다.');
      const adult = (rules.dialogue.adultDialogueAllowlist || []).some(a => a.reason && a.speaker === row.speaker && a.text === row.text && (!a.file || a.file === file));
      if (!adult && rules.dialogue.childRegisterPatterns.some(p => new RegExp(p.pattern, p.flags || '').test(row.text))) push('dialogue-child-register', row, row.speaker + ' 대사에 아이에게 쓰는 하게체 후보가 있다.');
    }
    const symbol = rules.dialogue.forbiddenSymbols.find(term => row.text.includes(term));
    if (symbol) push('dialogue-symbol', row, '금지한 타누키 표식 «' + symbol + '»가 대사에 있다.');
    if (row.complete) {
      const lines = row.text.split(/\r?\n/);
      if (lines.length > rules.dialogue.maxLines) push('dialogue-lines', row, '대사가 ' + lines.length + '줄이다. 최대 ' + rules.dialogue.maxLines + '줄까지 허용한다.');
      const longest = Math.max(...lines.map(line => [...line].length));
      if (longest > rules.dialogue.maxLineCharacters) push('dialogue-width', row, '대사 한 줄이 ' + longest + '자다. ' + rules.dialogue.maxLineCharacters + '자를 넘으면 실제 대화 상자도 확인해야 한다.', true);
    }
  }
  return {findings, rows: rows.length, dynamicRows, incompleteRows: rows.filter(row => !row.complete).length};
}

async function runStatic({root, rules, only} = {}) {
  const results = [], wants = name => !only || only.has(name);
  const files = wants('syntax') || wants('dialogue') ? sourceFiles(root) : [];
  if (wants('syntax')) {
    const findings = [];
    for (const file of files) {
      const check = spawnSync(process.execPath, ['--check', path.join(root, file)], {encoding: 'utf8', timeout: 30000});
      if (check.status !== 0) {
        const diagnostic = (check.stderr || check.stdout || String(check.error)).trim();
        const match = diagnostic.match(/:(\d+)\r?\n/);
        findings.push(finding('syntax', file, match ? Number(match[1]) : 1, 'JS 문법 검사 실패: ' + diagnostic));
      }
    }
    results.push(result('syntax', 'JS ' + files.length + '개 node --check', findings));
  }
  if (wants('data')) {
    const check = spawnSync(process.execPath, [path.join(root, 'prototypes/web/tools/build-data.js'), '--check'], {cwd: root, encoding: 'utf8', timeout: 30000});
    results.push(result('data', 'CSV와 tables.js 일치', check.status === 0 ? [] : [finding('data', 'prototypes/web/js/data/tables.js', 1,
      'CSV와 생성물이 다르거나 변환 검사가 실패했다: ' + (check.stderr || check.stdout || String(check.error)).trim())], {output: (check.stdout + check.stderr).trim()}));
  }
  if (wants('versions')) {
    const file = 'prototypes/web/index.html', source = fs.readFileSync(path.join(root, file), 'utf8'), findings = [];
    const versions = [...source.matchAll(/(?:src|href)\s*=\s*["']([^"']+\?v=([^&"']+)[^"']*)["']/g)];
    const values = [...new Set(versions.map(match => match[2]))];
    if (!versions.length) findings.push(finding('versions', file, 1, '자산의 ?v= 버전 표시가 없다.'));
    if (values.length > 1) for (const match of versions) findings.push(finding('versions', file, location(source, match.index), '자산 버전 불일치: ' + match[1] + ' (전체: ' + values.join(', ') + ')'));
    results.push(result('versions', '?v= 자산 ' + versions.length + '개의 버전 일치', findings, {versions: values}));
  }
  if (wants('csv')) {
    const findings = [], csvs = fs.readdirSync(path.join(root, 'design/data')).filter(file => file.endsWith('.csv')).sort();
    for (const name of csvs) {
      const file = 'design/data/' + name, bytes = fs.readFileSync(path.join(root, file));
      if (bytes[0] !== 0xef || bytes[1] !== 0xbb || bytes[2] !== 0xbf) findings.push(finding('csv-bom', file, 1, 'UTF-8 BOM이 없다.'));
      try {
        const source = new TextDecoder('utf-8', {fatal: true, ignoreBOM: true}).decode(bytes), rows = parseCsv(source);
        if (!rows.length) throw new Error('빈 CSV');
        const head = rows.shift().cells, extra = (rules.csv?.compositeKeys || []).find(key => key.file === file);
        const keys = head.includes('id') ? ['id'] : extra?.columns;
        if (keys) {
          const indexes = keys.map(key => head.indexOf(key)), seen = new Map();
          if (indexes.some(i => i < 0)) throw new Error('고유 키 머리칸 누락: ' + keys.join('+'));
          for (const row of rows) {
            const id = indexes.map(i => row.cells[i] || '').join(' + ');
            if (indexes.every(i => !row.cells[i])) continue;
            if (seen.has(id)) findings.push(finding('csv-id', file, row.line, keys.join('+') + ' 중복 «' + id + '». 첫 행: ' + seen.get(id)));
            else seen.set(id, row.line);
          }
        }
      } catch (error) { findings.push(finding('csv-parse', file, 1, 'UTF-8/CSV 읽기 실패: ' + error.message)); }
    }
    results.push(result('csv', 'CSV ' + csvs.length + '개의 UTF-8 BOM·고유 id', findings));
  }
  if (wants('dialogue')) {
    const npcs = parseCsv(fs.readFileSync(path.join(root, 'design/data/npcs.csv'), 'utf8'));
    const nameColumn = npcs.shift().cells.indexOf('이름'), known = npcs.map(row => row.cells[nameColumn]);
    known.push(...(rules.speakers?.global || []).map(row => row.name), '아빠', '엄마', '까치', '아빠의 옛 기록');
    const findings = []; let rows = 0, dynamicRows = 0, incompleteRows = 0;
    for (const file of files.filter(file => /^prototypes\/web\/js\/(engine|regions)\//.test(slash(file)))) {
      const checked = checkDialogue(fs.readFileSync(path.join(root, file), 'utf8'), slash(file), rules, known);
      findings.push(...checked.findings); rows += checked.rows; dynamicRows += checked.dynamicRows; incompleteRows += checked.incompleteRows;
    }
    results.push(result('dialogue', '대사 상수/분기 ' + rows + '개: 조작어·하게체·줄 길이·타누키 표식', findings,
      {rows, dynamicRows, incompleteRows, limitation: '변수로만 만드는 화자·본문과 템플릿 보간은 정적으로 실행하지 않는다. 상수 분기와 문자열 연결을 분석하고 동적 값은 런타임 화자 감시로 보완한다.'}));
  }
  return results;
}

// QA 도구 자체의 음성 대조군. 게임 파일을 건드리지 않고 qa-out의 임시 소스에만 위반을 넣는다.
function selfTestStatic({root, rules, out = path.join(root, 'qa-out')} = {}) {
  fs.mkdirSync(out, {recursive: true});
  const fixture = path.join(fs.mkdtempSync(path.join(out, 'static-negative-')), 'fixture.js');
  const baseline = [
    "// talk([['도담','E로 클릭 누르면 삿갓']]);",
    "const quoted = \"talk([['도담','E로 클릭 누르면 삿갓']]);\";",
    "const pattern = /talk\\(\\[\\['도담'/;",
    "talk([['도담','내가 줄게.'],['도담','여기까지 왔구나?'],['너구리','E로 버튼을 누르면 돼.']]);",
    "arcScene('flag',[['모르는 새 화자',false?'괜찮아.':'고마워.']]);",
  ].join('\n');
  const injected = baseline + '\n' + [
    "talk([['도담','E로 누르면 돼.'],['도담','자네, 쉬게.'],['도담','무엇을 찾나?'],",
    "['너구리','술병과 삿갓'],['도담','하나\\n둘\\n셋'],['도담','" + '가'.repeat(41) + "']]);",
    "const lines=[['도담',false?'J로 해 봐.':'여기야.']]; talk(lines);",
    "talk([['처음 보는 화자','앞'+'벚꽃']]);",
  ].join('\n');
  let evidence;
  try {
    fs.writeFileSync(fixture, baseline, 'utf8');
    const before = checkDialogue(fs.readFileSync(fixture, 'utf8'), slash(path.relative(root, fixture)), rules);
    if (before.findings.length) throw new Error('정상 대조군을 오검출했다: ' + JSON.stringify(before.findings));
    fs.writeFileSync(fixture, injected, 'utf8');
    const broken = checkDialogue(fs.readFileSync(fixture, 'utf8'), slash(path.relative(root, fixture)), rules);
    const found = [...new Set(broken.findings.map(item => item.rule))].sort();
    const expected = ['dialogue-input', 'dialogue-child-register', 'dialogue-symbol', 'dialogue-lines', 'dialogue-width'].sort();
    if (JSON.stringify(found) !== JSON.stringify(expected)) throw new Error('임시 위반 검출 누락: ' + JSON.stringify({expected, found}));
    if (!broken.findings.some(item => item.text === 'J로 해 봐.')) throw new Error('조건부 대사 분기를 놓쳤다.');
    if (!broken.findings.some(item => item.text === '앞벚꽃')) throw new Error('문자열 연결 대사를 놓쳤다.');
    const quotedCsv = parseCsv('﻿id,내용\r\none,"가,나\n다"\r\ntwo,"말 ""인용"""\r\n');
    if (quotedCsv[1].cells[1] !== '가,나\n다' || quotedCsv[2].line !== 4 || quotedCsv[2].cells[1] !== '말 "인용"') throw new Error('CSV 인용/행 번호를 잘못 읽었다.');
    fs.writeFileSync(fixture, baseline, 'utf8');
    const restored = checkDialogue(fs.readFileSync(fixture, 'utf8'), slash(path.relative(root, fixture)), rules);
    if (restored.findings.length || fs.readFileSync(fixture, 'utf8') !== baseline) throw new Error('임시 위반 복원이 실패했다.');
    evidence = {status: 'pass', fixture: slash(path.relative(root, fixture)), expected, found, findings: broken.findings, restored: true,
      summary: 'qa-out 임시 파일의 정상 행 → 고의 위반 삽입 → 5개 규칙 검출 → 원상 복구를 확인했다. 게임 소스는 변경하지 않았다.'};
  } finally {
    if (fs.existsSync(fixture)) fs.unlinkSync(fixture);
    fs.rmdirSync(path.dirname(fixture));
  }
  evidence.fixtureRemoved = true;
  fs.writeFileSync(path.join(out, 'static-self-test.json'), JSON.stringify(evidence, null, 2) + '\n', 'utf8');
  return evidence;
}

module.exports = {runStatic, checkDialogue, parseDialogue, parseCsv, selfTestStatic};
