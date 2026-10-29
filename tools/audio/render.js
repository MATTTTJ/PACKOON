#!/usr/bin/env node
'use strict';

// PA-43: canonical JSON -> shared synthesis -> 44.1 kHz / 16-bit stereo WAV.
// No third-party modules. The web preview imports exactly the same DSP code.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const { spawn } = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const DATA = path.join(ROOT, 'design/data/music');
const OUTPUT = path.join(ROOT, 'assets-godot/audio');
const RATE = 44100;

function readJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8').replace(/^\uFEFF/, ''));
}
function load() {
  return { score: readJSON('music.json'), bank: readJSON('instruments.json'), sfx: readJSON('sfx.json'),
    DSP: require('../../prototypes/web/js/engine/music.js').DSP };
}
function assert(ok, message) { if (!ok) throw new Error(message); }
function safeId(id) { assert(/^[a-z][a-z0-9_]*$/.test(id), `Unsafe audio id: ${id}`); return id; }
function duration(track) { return track.measures * track.meter[0] * 4 / track.meter[1] * 60 / track.tempo; }
function validate(data) {
  const ids = new Set();
  assert(data.score.beatUnit === 'quarter', 'beatUnit must be quarter');
  assert(data.score.tracks.length >= 22, 'Expected at least 22 BGM tracks');
  for (const track of data.score.tracks) {
    safeId(track.id); assert(!ids.has(track.id), `Duplicate BGM id ${track.id}`); ids.add(track.id);
    assert(Number.isFinite(track.tempo) && track.tempo > 0, `${track.id}: invalid tempo`);
    const seconds = duration(track);
    assert(!track.loop || seconds >= 60 - 1e-6 && seconds <= 120 + 1e-6, `${track.id}: loop must be 60–120 seconds (${seconds})`);
    assert(track.sections && track.sections.length >= 2, `${track.id}: missing contrasting sections`);
    const compiled = data.DSP.compileScore(track, data.bank, RATE);
    assert(compiled.frames > 0, `${track.id}: empty score`);
    if (track.loop) assert(track.loop.start === 0 && track.loop.end === track.measures, `${track.id}: this export uses a full-score loop`);
  }
  assert(!data.score.tracks.find(t => t.id === 'ending').loop, 'Ending must not loop');
  const effectIds = new Set();
  for (const effect of data.sfx.effects) {
    safeId(effect.id); assert(!effectIds.has(effect.id), `Duplicate SFX id ${effect.id}`); effectIds.add(effect.id);
    assert(effect.layers.length >= 2, `${effect.id}: expected layered SFX`);
    for (const layer of effect.layers) assert(data.bank.instruments[layer.instrument], `${effect.id}: unknown instrument ${layer.instrument}`);
    const pcm = data.DSP.renderSfx(effect, data.bank, { sampleRate: RATE });
    assert(pcm.left.length > 0 && pcm.left.length === pcm.right.length, `${effect.id}: invalid PCM`);
    for (const channel of [pcm.left, pcm.right]) for (const sample of channel) assert(Number.isFinite(sample) && Math.abs(sample) <= 1, `${effect.id}: invalid sample`);
  }
  return { tracks: ids.size, effects: effectIds.size };
}
function wavBuffer(pcm, loop) {
  const frames = pcm.left.length;
  assert(frames === pcm.right.length && frames > 0, 'Invalid stereo PCM');
  const smplBytes = loop ? 68 : 0;
  const result = Buffer.alloc(44 + smplBytes + frames * 4);
  result.write('RIFF', 0); result.writeUInt32LE(result.length - 8, 4); result.write('WAVE', 8);
  result.write('fmt ', 12); result.writeUInt32LE(16, 16); result.writeUInt16LE(1, 20);
  result.writeUInt16LE(2, 22); result.writeUInt32LE(RATE, 24); result.writeUInt32LE(RATE * 4, 28);
  result.writeUInt16LE(4, 32); result.writeUInt16LE(16, 34);
  let cursor = 36;
  if (loop) {
    const first = pcm.loopStartFrame ?? 0, end = pcm.loopEndFrame ?? frames;
    assert(first >= 0 && first < end && end <= frames, 'Invalid loop frame range');
    result.write('smpl', cursor); result.writeUInt32LE(60, cursor + 4);
    result.writeUInt32LE(Math.round(1e9 / RATE), cursor + 16);
    result.writeUInt32LE(60, cursor + 20); result.writeUInt32LE(1, cursor + 36);
    result.writeUInt32LE(first, cursor + 52); result.writeUInt32LE(end - 1, cursor + 56);
    cursor += 68;
  }
  result.write('data', cursor); result.writeUInt32LE(frames * 4, cursor + 4); cursor += 8;
  let seed = 0x43a0d10;
  const random = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
  for (let i = 0; i < frames; i++) for (const samples of [pcm.left, pcm.right]) {
    const x = samples[i]; assert(Number.isFinite(x) && Math.abs(x) < 1, `Nonfinite or clipped sample at frame ${i}`);
    // Deterministic triangular dither, one PCM LSB peak-to-peak per random term.
    result.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x * 32767 + random() - random()))), cursor); cursor += 2;
  }
  return result;
}
function inspectWav(filename) {
  const wav = fs.readFileSync(filename);
  assert(wav.toString('ascii', 0, 4) === 'RIFF' && wav.toString('ascii', 8, 12) === 'WAVE', `${filename}: not WAV`);
  let format, audio, loop;
  for (let cursor = 12; cursor + 8 <= wav.length;) {
    const type = wav.toString('ascii', cursor, cursor + 4), size = wav.readUInt32LE(cursor + 4), start = cursor + 8;
    assert(start + size <= wav.length, `${filename}: truncated ${type}`);
    if (type === 'fmt ') format = { pcm: wav.readUInt16LE(start), channels: wav.readUInt16LE(start + 2), rate: wav.readUInt32LE(start + 4), bits: wav.readUInt16LE(start + 14) };
    if (type === 'data') audio = { start, size };
    if (type === 'smpl' && wav.readUInt32LE(start + 28)) loop = { start: wav.readUInt32LE(start + 44), end: wav.readUInt32LE(start + 48) + 1 };
    cursor = start + size + (size & 1);
  }
  assert(format && audio && format.pcm === 1 && format.channels === 2 && format.rate === RATE && format.bits === 16, `${filename}: expected 44.1 kHz 16-bit PCM stereo`);
  assert(audio.size % 4 === 0, `${filename}: incomplete frame`);
  const frames = audio.size / 4, sample = (i, ch) => wav.readInt16LE(audio.start + i * 4 + ch * 2) / 32768;
  let peak = 0, power = 0, clips = 0, quietRun = 0, longestQuiet = 0, blockPower = 0, blockCount = 0, maxStep = 0;
  const block = Math.round(RATE * .05), waveform = [];
  let binPeak = 0, binPower = 0, binCount = 0;
  for (let i = 0; i < frames; i++) {
    for (let ch = 0; ch < 2; ch++) {
      const value = sample(i, ch), abs = Math.abs(value);
      peak = Math.max(peak, abs); power += value * value; blockPower += value * value;
      if (abs >= 32767 / 32768) clips++;
      if (i) maxStep = Math.max(maxStep, Math.abs(value - sample(i - 1, ch)));
      binPeak = Math.max(binPeak, abs); binPower += value * value;
    }
    blockCount++; binCount++;
    if (blockCount === block || i === frames - 1) {
      if (Math.sqrt(blockPower / (blockCount * 2)) < 0.0001) quietRun += blockCount; else quietRun = 0;
      longestQuiet = Math.max(longestQuiet, quietRun); blockPower = 0; blockCount = 0;
    }
    if (binCount === RATE || i === frames - 1) { waveform.push({ second: waveform.length, peak: +binPeak.toFixed(6), rms: +Math.sqrt(binPower / (binCount * 2)).toFixed(6) }); binPeak = 0; binPower = 0; binCount = 0; }
  }
  let jump = null, slopeJump = null, localStep95 = null, seamSlopeChange = null;
  if (loop) {
    assert(loop.start >= 0 && loop.end <= frames && loop.end > loop.start + 2, `${filename}: invalid smpl range`);
    jump = 0; slopeJump = 0; localStep95 = 0; seamSlopeChange = 0;
    for (let ch = 0; ch < 2; ch++) {
      const channelJump = Math.abs(sample(loop.start, ch) - sample(loop.end - 1, ch));
      jump = Math.max(jump, channelJump);
      slopeJump = Math.max(slopeJump, Math.abs((sample(loop.start + 1, ch) - sample(loop.start, ch)) - (sample(loop.end - 1, ch) - sample(loop.end - 2, ch))));
      const steps = [], window = Math.min(220, Math.floor((loop.end - loop.start) / 2));
      for (let i = 1; i < window; i++) {
        steps.push(Math.abs(sample(loop.start + i, ch) - sample(loop.start + i - 1, ch)));
        steps.push(Math.abs(sample(loop.end - i, ch) - sample(loop.end - i - 1, ch)));
      }
      steps.sort((a, b) => a - b);
      const percentile = steps[Math.floor(steps.length * .95)];
      localStep95 = Math.max(localStep95, percentile);
      const signedSeam = sample(loop.start, ch) - sample(loop.end - 1, ch);
      const previousStep = sample(loop.end - 1, ch) - sample(loop.end - 2, ch);
      const nextStep = sample(loop.start + 1, ch) - sample(loop.start, ch);
      const bend = Math.max(Math.abs(signedSeam - previousStep), Math.abs(nextStep - signedSeam));
      seamSlopeChange = Math.max(seamSlopeChange, bend);
      // A continuous waveform can change between adjacent samples. Compare the
      // join against actual surrounding slopes, as well as an absolute limit.
      assert(channelJump < Math.max(.002, percentile * 1.5), `${filename}: join exceeds neighboring waveform slopes`);
      assert(bend < Math.max(.004, percentile * 2), `${filename}: seam slope change exceeds neighboring waveform`);
    }
    assert(jump < .006, `${filename}: loop endpoint jump ${jump} >= .006`);
    assert(slopeJump < .025, `${filename}: loop slope discontinuity ${slopeJump} >= .025`);
  }
  assert(clips === 0 && peak < .999, `${filename}: clipping`);
  assert(peak > .0002, `${filename}: completely silent export`);
  return { file: path.relative(ROOT, filename).replaceAll('\\', '/'), ...format, frames, seconds: +(frames / RATE).toFixed(6), peak: +peak.toFixed(6), rms: +Math.sqrt(power / (frames * 2)).toFixed(6), clips, longestQuietSeconds: +(longestQuiet / RATE).toFixed(3), maxSampleStep: +maxStep.toFixed(6), loop: loop ? { ...loop, endpointJump: +jump.toFixed(8), localStep95: +localStep95.toFixed(8), seamSlopeChange: +seamSlopeChange.toFixed(8), slopeJump: +slopeJump.toFixed(8) } : null, waveform };
}
function selected(args, flag, all) {
  const values = args.filter(a => a.startsWith(flag + '=')).flatMap(a => a.slice(flag.length + 1).split(','));
  if (!values.length) return all;
  for (const id of values) assert(all.some(t => t.id === id), `Unknown ${flag} id: ${id}`);
  return all.filter(t => values.includes(t.id));
}
function serve(port = 8765) {
  const server = http.createServer((req, res) => {
    try {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (urlPath === '/favicon.ico') { res.writeHead(204); res.end(); return; }
      const file = path.resolve(ROOT, '.' + (urlPath === '/' ? '/prototypes/web/music.html' : urlPath));
      if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end(); return; }
      const ext = path.extname(file);
      res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.wav': 'audio/wav' })[ext] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-store');
      const stream = fs.createReadStream(file); stream.on('error', () => { res.writeHead(404); res.end('Not found'); }); stream.pipe(res);
    } catch (_) { res.writeHead(400); res.end('Bad request'); }
  });
  return new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', () => resolve(server)); });
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function webCheck() {
  const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => fs.existsSync(p));
  assert(chrome, 'Chrome missing; set CHROME_PATH');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'packoon-audio-'));
  const server = await serve(0), port = server.address().port;
  const child = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  let debugURL = '', stderr = '', spawnError = null;
  child.on('error', error => { spawnError = error; });
  child.stderr.on('data', b => { stderr += b; const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) debugURL = match[1]; });
  let ws;
  try {
    for (let i = 0; i < 300 && !debugURL && !spawnError; i++) await sleep(50);
    assert(debugURL, spawnError ? spawnError.message : 'Chrome debugging endpoint unavailable');
    ws = new WebSocket(debugURL); await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    let counter = 0; const pending = new Map(), errors = [];
    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id) { const task = pending.get(message.id); if (task) { pending.delete(message.id); message.error ? task.reject(new Error(JSON.stringify(message.error))) : task.resolve(message.result); } }
      else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(a => a.value || a.description).join(' '));
    };
    const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
      const id = ++counter; const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 45000);
      pending.set(id, { resolve: value => { clearTimeout(timeout); resolve(value); }, reject: error => { clearTimeout(timeout); reject(error); } });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const cdp = (method, params) => send(method, params, sessionId);
    await cdp('Runtime.enable'); await cdp('Page.enable');
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false });
    await cdp('Page.navigate', { url: `http://127.0.0.1:${port}/prototypes/web/music.html` });
    await cdp('Page.bringToFront');
    const evaluate = async expression => { const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); assert(!r.exceptionDetails, JSON.stringify(r.exceptionDetails)); return r.result.value; };
    let state;
    for (let i = 0; i < 300; i++) { state = await evaluate('({ready:window.previewReady===true,status:document.querySelector("#status")?.textContent,tracks:window.previewDiagnostics?.tracks})'); if (state.ready) break; await sleep(50); }
    assert(state.ready, `Preview did not load: ${JSON.stringify(state)}`);
    const click = async id => {
      const box = await evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(id)});if(!e)throw Error('Missing button');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
      await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...box });
      await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...box });
    };
    await click('playButton');
    for (let i = 0; i < 600; i++) { const ready = await evaluate('window.previewPlayer?.getState().playing'); if (ready) break; await sleep(50); }
    await sleep(400);
    const playing = await evaluate('window.previewPlayer?.getState()');
    await click('nextButton'); await sleep(100); await click('stopButton'); await sleep(250);
    const stopped = await evaluate('window.previewPlayer?.getState()');
    assert(errors.length === 0, `Browser errors: ${errors.join('\n')}`);
    assert(playing?.playing, `Preview failed to play: ${JSON.stringify(playing)}`);
    assert(!stopped?.playing, `Preview failed to stop: ${JSON.stringify(stopped)}`);
    // Exercise the repository's double-click workflow against the canonical files.
    await cdp('Page.navigate', { url: 'file:///' + path.join(ROOT, 'prototypes/web/music.html').replaceAll('\\', '/') });
    for (let i = 0; i < 200; i++) { if (await evaluate('document.readyState === "complete"')) break; await sleep(50); }
    const { root } = await cdp('DOM.getDocument');
    const { nodeId } = await cdp('DOM.querySelector', { nodeId: root.nodeId, selector: '#filesInput' });
    await cdp('DOM.setFileInputFiles', { nodeId, files: ['music.json', 'instruments.json', 'sfx.json'].map(name => path.join(DATA, name)) });
    let localReady = false;
    for (let i = 0; i < 200; i++) { localReady = await evaluate('window.previewReady === true'); if (localReady) break; await sleep(50); }
    assert(localReady, 'Local-file picker did not load canonical JSON');
    assert(errors.length === 0, `Browser errors: ${errors.join('\n')}`);
    const result = { chrome: chrome.replaceAll('\\', '/'), ready: state.ready, playing, stopped, filePickerReady: localReady, consoleErrors: errors };
    console.log(JSON.stringify(result, null, 2)); return result;
  } finally {
    if (ws) ws.close(); child.kill(); server.close();
    // Restrict recursive cleanup to the exact task-created temp profile.
    const absolute = path.resolve(profile), tempRoot = path.resolve(os.tmpdir()) + path.sep;
    if (absolute.startsWith(tempRoot) && path.basename(absolute).startsWith('packoon-audio-')) {
      await sleep(250); try { fs.rmSync(absolute, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch (_) { /* Chrome may still hold its temporary profile. */ }
    }
  }
}
async function main(args) {
  const allowed = /^(--(?:all|bgm|sfx|track|verify|check|list|serve|web-check|help))(?:=.*)?$/;
  for (const arg of args) assert(allowed.test(arg), `Unknown option ${arg}`);
  if (args.includes('--help')) { console.log('node tools/audio/render.js [--all | --bgm | --track=id,id | --sfx[=id,id]] [--verify]\n  --check  validate scores/SFX without WAV output\n  --list   list BGM catalog\n  --serve[=8765]  preview HTTP server\n  --web-check  headless Chrome smoke test'); return; }
  if (args.some(a => a === '--serve' || a.startsWith('--serve='))) { const p = args.find(a => a.startsWith('--serve=')); const server = await serve(p ? Number(p.split('=')[1]) : 8765); console.log(`http://127.0.0.1:${server.address().port}/prototypes/web/music.html`); return; }
  if (args.includes('--web-check')) { await webCheck(); return; }
  const data = load();
  if (args.includes('--list')) { for (const t of data.score.tracks) console.log(`${t.id}\t${t.name}\t${t.jangdan} ${t.meter.join('/')}\t♩=${t.tempo}\t${duration(t).toFixed(2)}s\t${t.use}`); return; }
  const counts = validate(data);
  if (args.includes('--check')) { console.log(`Score/SFX validation passed: ${counts.tracks} tracks, ${counts.effects} effects`); return; }
  const hasTrack = args.some(a => a.startsWith('--track=')), hasSfx = args.some(a => a === '--sfx' || a.startsWith('--sfx='));
  const tracks = hasSfx && !hasTrack && !args.includes('--bgm') && !args.includes('--all') ? [] : selected(args, '--track', data.score.tracks);
  const effects = (hasTrack || args.includes('--bgm')) && !hasSfx && !args.includes('--all') ? [] : selected(args, '--sfx', data.sfx.effects);
  const manifest = [], report = [];
  for (const [kind, entries] of [['bgm', tracks], ['sfx', effects]]) {
    const folder = path.join(OUTPUT, kind); fs.mkdirSync(folder, { recursive: true });
    for (const entry of entries) {
      const filename = path.join(folder, safeId(entry.id) + '.wav');
      if (!args.includes('--verify')) {
        const start = Date.now();
        const pcm = kind === 'bgm' ? data.DSP.renderSong(entry, data.bank, { sampleRate: RATE }) : data.DSP.renderSfx(entry, data.bank, { sampleRate: RATE });
        fs.writeFileSync(filename, wavBuffer(pcm, kind === 'bgm' && entry.loop));
        console.log(`${kind}/${entry.id}.wav  ${(pcm.left.length / RATE).toFixed(2)}s  ${((Date.now() - start) / 1000).toFixed(2)}s render`);
      }
      const check = inspectWav(filename); report.push(check);
      manifest.push({ id: entry.id, name: entry.name, kind, file: `${kind}/${entry.id}.wav`, sampleRate: RATE, channels: 2, bits: 16, frames: check.frames, loopStartFrame: check.loop?.start ?? null, loopEndFrameExclusive: check.loop?.end ?? null });
      console.log(`  peak ${check.peak} / RMS ${check.rms} / clips ${check.clips} / quiet ${check.longestQuietSeconds}s${check.loop ? ` / loop jump ${check.loop.endpointJump}` : ''}`);
    }
  }
  fs.writeFileSync(path.join(OUTPUT, 'manifest.json'), JSON.stringify({ version: 1, files: manifest }, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(OUTPUT, 'validation.json'), JSON.stringify({ version: 1, checks: report }, null, 2) + '\n', 'utf8');
  console.log(`Verified ${tracks.length} BGM + ${effects.length} SFX. Reports: assets-godot/audio/{manifest,validation}.json`);
}
if (require.main === module) main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { wavBuffer, inspectWav, validate, duration, serve, webCheck };
