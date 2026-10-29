'use strict';
/* PA-43: 원본 JSON을 함께 읽는 순수 DSP와 독립 미리 듣기 연주기.
   Node에서는 require(), 브라우저에서는 PackoonMusic. 게임 상태·저장은 건드리지 않는다. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PackoonMusic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const TAU = Math.PI * 2;
  const NOTE = /^([A-G])([#b]?)(-?\d+)$/;
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const finite = (x, name, lo, hi) => {
    if (!Number.isFinite(x) || x < lo || x > hi) throw new Error(name + ': 범위를 벗어난 값 ' + x);
    return x;
  };
  function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
    return h >>> 0 || 1;
  }
  function noteFrequency(note) {
    if (typeof note === 'number') return finite(note, 'frequency', 10, 20000);
    if (note === 'X') return 220;
    const m = NOTE.exec(note);
    if (!m) throw new Error('알 수 없는 음: ' + note);
    const semitone = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const midi = (Number(m[3]) + 1) * 12 + semitone;
    finite(midi, 'MIDI note', 12, 119);
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  function getDefinitions(bank) {
    if (!bank || !bank.instruments || typeof bank.instruments !== 'object') throw new Error('instruments.json의 instruments가 필요합니다.');
    return bank.instruments;
  }
  function compileScore(track, bank, sampleRate = 44100) {
    const definitions = getDefinitions(bank);
    finite(sampleRate, 'sampleRate', 8000, 192000);
    if (!track || !track.id || !Array.isArray(track.voices)) throw new Error('악보 id와 voices가 필요합니다.');
    const tempo = finite(track.tempo, track.id + '.tempo', 10, 400);
    if (!Array.isArray(track.meter) || track.meter.length !== 2) throw new Error(track.id + ': meter는 [분자, 분모]입니다.');
    const beatsPerMeasure = finite(track.meter[0], 'meter numerator', 1, 32) * 4 / finite(track.meter[1], 'meter denominator', 1, 32);
    const measures = finite(track.measures, track.id + '.measures', 1, 512);
    if (!Number.isInteger(measures)) throw new Error(track.id + ': measures는 정수입니다.');
    const secondsPerBeat = 60 / tempo;
    const frames = Math.round(measures * beatsPerMeasure * secondsPerBeat * sampleRate);
    let loopStartFrame = 0, loopEndFrame = 0;
    if (track.loop) {
      const start = finite(track.loop.start, 'loop.start', 0, measures - 1);
      const end = finite(track.loop.end, 'loop.end', start + 1, measures);
      if (!Number.isInteger(start) || !Number.isInteger(end)) throw new Error(track.id + ': 반복 마디는 정수입니다.');
      loopStartFrame = Math.round(start * beatsPerMeasure * secondsPerBeat * sampleRate);
      loopEndFrame = Math.round(end * beatsPerMeasure * secondsPerBeat * sampleRate);
    }
    if (track.intro) {
      if (track.intro.start !== 0 || !Number.isInteger(track.intro.end) || track.intro.end < 2 || track.intro.end > 8 || !track.loop || track.intro.end !== track.loop.start) {
        throw new Error(track.id + ': 도입부는 0에서 시작하는 2~8마디이며 반복 시작과 이어져야 합니다.');
      }
    }
    const events = [];
    const voiceIds = new Set();
    for (const voice of track.voices) {
      if (!voice.id || voiceIds.has(voice.id)) throw new Error(track.id + ': 중복/누락 성부 id');
      voiceIds.add(voice.id);
      if (!definitions[voice.instrument]) throw new Error(track.id + ': 없는 악기 ' + voice.instrument);
      const gain = finite(voice.gain === undefined ? 1 : voice.gain, 'voice.gain', 0, 2);
      const pan = finite(voice.pan === undefined ? 0 : voice.pan, 'voice.pan', -1, 1);
      if (!Array.isArray(voice.sequence) || voice.sequence.length !== measures) throw new Error(track.id + '/' + voice.id + ': sequence 수와 measures가 다릅니다.');
      for (let measure = 0; measure < measures; measure++) {
        const patternId = voice.sequence[measure];
        const pattern = voice.patterns && voice.patterns[patternId];
        if (!Array.isArray(pattern)) throw new Error(track.id + '/' + voice.id + ': 없는 패턴 ' + patternId);
        let beat = 0;
        pattern.forEach((token, index) => {
          if (typeof token !== 'string') throw new Error(track.id + ': 음표는 NOTE:길이[:세기] 문자열입니다.');
          const bits = token.split(':');
          if (bits.length < 2 || bits.length > 3) throw new Error(track.id + ': 잘못된 음표 ' + token);
          const durationBeats = finite(Number(bits[1]), token + ' duration', 0.015625, 128);
          const velocity = finite(bits[2] === undefined ? 0.8 : Number(bits[2]), token + ' velocity', 0, 1);
          if (bits[0] !== 'R') {
            noteFrequency(bits[0]);
            events.push({
              frame: Math.round((measure * beatsPerMeasure + beat) * secondsPerBeat * sampleRate),
              duration: durationBeats * secondsPerBeat, note: bits[0], velocity,
              instrument: voice.instrument, gain, pan,
              seed: hash(track.id + '/' + voice.id + '/' + patternId + '/' + index)
            });
          }
          beat += durationBeats;
        });
        if (Math.abs(beat - beatsPerMeasure) > 0.000001) throw new Error(track.id + '/' + voice.id + '/' + patternId + ': 마디 길이 ' + beat + ' ≠ ' + beatsPerMeasure);
      }
    }
    events.sort((a, b) => a.frame - b.frame);
    return { id: track.id, events, frames, sampleRate, loopStartFrame, loopEndFrame, seconds: frames / sampleRate, beatsPerMeasure };
  }
  function renderVoice(instrument, note, duration, velocity = 0.8, seed = 1, sampleRate = 44100) {
    if (!instrument || typeof instrument !== 'object') throw new Error('악기 정의가 필요합니다.');
    finite(duration, 'note duration', 0.001, 120);
    finite(velocity, 'velocity', 0, 1);
    finite(sampleRate, 'sampleRate', 8000, 192000);
    const kind = instrument.kind || 'pluck';
    const struck = ['pluck', 'drum', 'metal'].includes(kind);
    const gate = instrument.fixedDuration || duration;
    const tail = instrument.tail === undefined ? 0.2 : instrument.tail;
    const length = Math.ceil((gate + tail) * sampleRate);
    if (length > sampleRate * 140) throw new Error('악기 꼬리가 너무 깁니다.');
    const out = new Float32Array(length);
    const frequency = instrument.baseFrequency || noteFrequency(note);
    const attack = Math.max(0.001, instrument.attack || 0.005);
    const decay = Math.max(0.01, instrument.decay || 0.7);
    const release = Math.max(0.003, instrument.release || 0.15);
    const partials = (instrument.partials || [[1, 1, 1]]).filter(p => frequency * p[0] < sampleRate * 0.46);
    const phases = new Float64Array(partials.length);
    const partialEnvelopes = new Float64Array(partials.length);
    const decaySteps = new Float64Array(partials.length);
    let amplitudeSum = 0;
    partials.forEach((p, i) => { partialEnvelopes[i] = p[1]; amplitudeSum += Math.abs(p[1]); decaySteps[i] = struck ? Math.exp(-(p[2] || 1) / (decay * sampleRate)) : 1; });
    const norm = amplitudeSum ? 1 / Math.pow(amplitudeSum, 0.76) : 1;
    const volume = (instrument.gain === undefined ? 0.4 : instrument.gain) * velocity;
    const cutoff = clamp(instrument.noiseCutoff || 1800, 30, sampleRate * 0.43);
    const q = Math.max(0.3, instrument.resonance || 0.7);
    const omega = TAU * cutoff / sampleRate, cosine = Math.cos(omega), alpha = Math.sin(omega) / (2 * q);
    const a0 = 1 + alpha, a1 = -2 * cosine / a0, a2 = (1 - alpha) / a0;
    let b0 = (1 - cosine) / 2 / a0, b1 = (1 - cosine) / a0, b2 = b0;
    if (instrument.filterType === 'highpass') { b0 = (1 + cosine) / 2 / a0; b1 = -(1 + cosine) / a0; b2 = b0; }
    if (instrument.filterType === 'bandpass') { b0 = alpha / a0; b1 = 0; b2 = -b0; }
    let random = seed >>> 0 || 1, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    let noiseEnvelope = instrument.noise === undefined ? 0.02 : instrument.noise;
    const noiseStep = struck ? Math.exp(-1 / ((instrument.noiseDecay || decay) * sampleRate)) : 1;
    const glideStep = Math.exp(-1 / ((instrument.glideSeconds || 0.08) * sampleRate));
    let glide = instrument.glideCents || 0;
    const pitchDrop = instrument.pitchDrop || 0;
    const pitchDropStep = Math.exp(-1 / (0.035 * sampleRate));
    let pitchEnvelope = pitchDrop;
    const vibratoHz = instrument.vibratoHz || 4.5, vibratoCents = instrument.vibratoCents || 0;
    const delay = instrument.vibratoDelay === undefined ? 0.2 : instrument.vibratoDelay;
    const endWobble = instrument.endWobbleCents || 0;
    const flam = instrument.flamSeconds || 0;
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const attackGain = Math.min(1, t / attack);
      const releaseGain = t < gate ? 1 : Math.exp(-(t - gate) * 6 / release);
      const endFade = Math.min(1, (length - 1 - i) / Math.max(1, sampleRate * 0.008));
      let envelope = attackGain * releaseGain * endFade;
      if (!struck) envelope *= (instrument.sustain === undefined ? 0.85 : instrument.sustain) + 0.15 * Math.exp(-t / decay);
      if (kind === 'noise') envelope *= 1 + (instrument.swellDepth || 0) * Math.sin(TAU * (instrument.swellHz || 0.2) * t);
      const vibOn = clamp((t - delay) / 0.2, 0, 1);
      const late = clamp((t - Math.min(gate * 0.45, delay)) / Math.max(0.15, gate * 0.45), 0, 1);
      const cents = glide + vibOn * vibratoCents * Math.sin(TAU * vibratoHz * t) + late * endWobble * Math.sin(TAU * (instrument.endWobbleHz || 4.7) * t);
      const increment = TAU * frequency / sampleRate * (1 + cents * 0.00057762265) * (1 + pitchEnvelope);
      let harmonic = 0;
      for (let j = 0; j < partials.length; j++) {
        phases[j] += increment * partials[j][0];
        if (phases[j] > TAU) phases[j] -= TAU;
        harmonic += Math.sin(phases[j]) * partialEnvelopes[j];
        partialEnvelopes[j] *= decaySteps[j];
      }
      random ^= random << 13; random ^= random >>> 17; random ^= random << 5;
      const x = (random >>> 0) / 2147483648 - 1;
      const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      let value = harmonic * norm + y * noiseEnvelope;
      if (flam && t < flam) value *= 0.45;
      if (flam && t >= flam && t < flam + 0.01) value += y * 0.15 * (1 - (t - flam) / 0.01);
      out[i] = value * volume * envelope;
      noiseEnvelope *= noiseStep; glide *= glideStep; pitchEnvelope *= pitchDropStep;
    }
    return out;
  }
  function effectsConfig(bank) {
    const effects = bank.effects || {};
    return {
      master: bank.masterGain === undefined ? 0.64 : bank.masterGain,
      reverb: Object.assign({ delays: [0.071, 0.089, 0.113, 0.137], feedback: 0.64, damping: 0.34, wet: 0.18, warmupSeconds: 6, tailSeconds: 5 }, effects.reverb),
      limiter: Object.assign({ ceiling: 0.92, drive: 1 }, effects.limiter)
    };
  }
  function createReverb(bank, sampleRate) {
    const settings = effectsConfig(bank);
    const r = settings.reverb;
    if (!Array.isArray(r.delays) || r.delays.length !== 4) throw new Error('리버브 지연은 네 개여야 합니다.');
    const lines = r.delays.map(seconds => new Float32Array(Math.max(1, Math.round(finite(seconds, 'reverb.delay', 0.001, 1) * sampleRate))));
    const cursor = new Int32Array(4), damping = new Float64Array(4), values = new Float64Array(4);
    const feedback = finite(r.feedback, 'reverb.feedback', 0, 0.94);
    const damp = finite(r.damping, 'reverb.damping', 0, 0.99);
    const wet = finite(r.wet, 'reverb.wet', 0, 1);
    let hpL = 0, hpR = 0, prevL = 0, prevR = 0;
    const ceiling = finite(settings.limiter.ceiling, 'limiter.ceiling', 0.1, 0.99);
    const drive = finite(settings.limiter.drive, 'limiter.drive', 0.1, 8);
    const master = finite(settings.master, 'masterGain', 0, 3);
    return function process(left, right, outputL, outputR, start = 0, end = left.length, outputOffset = start) {
      for (let i = start; i < end; i++) {
        for (let j = 0; j < 4; j++) { const x = lines[j][cursor[j]]; damping[j] += (x - damping[j]) * (1 - damp); values[j] = damping[j]; }
        const a = values[0], b = values[1], c = values[2], d = values[3];
        const input = (left[i] + right[i]) * 0.22;
        lines[0][cursor[0]] = input + feedback * (a + b + c + d) * 0.5;
        lines[1][cursor[1]] = input + feedback * (a - b + c - d) * 0.5;
        lines[2][cursor[2]] = input + feedback * (a + b - c - d) * 0.5;
        lines[3][cursor[3]] = input + feedback * (a - b - c + d) * 0.5;
        for (let j = 0; j < 4; j++) cursor[j] = (cursor[j] + 1) % lines[j].length;
        const l = (left[i] + wet * (a + c - b * 0.3)) * master;
        const rr = (right[i] + wet * (b + d - a * 0.3)) * master;
        hpL = l - prevL + 0.999 * hpL; prevL = l;
        hpR = rr - prevR + 0.999 * hpR; prevR = rr;
        if (outputL) {
          const at = outputOffset + i - start;
          outputL[at] = ceiling * Math.tanh(hpL * drive / ceiling);
          outputR[at] = ceiling * Math.tanh(hpR * drive / ceiling);
        }
      }
    };
  }
  function beginSong(track, bank, options) {
    const sampleRate = options.sampleRate || 44100;
    const compiled = compileScore(track, bank, sampleRate);
    const tailFrames = compiled.loopEndFrame ? 0 : Math.ceil(effectsConfig(bank).reverb.tailSeconds * sampleRate);
    return { compiled, bank, track, left: new Float32Array(compiled.frames + tailFrames), right: new Float32Array(compiled.frames + tailFrames), cache: new Map() };
  }
  function mixEvent(state, event) {
    const { compiled, bank, cache, left, right } = state;
    const cacheKey = [event.instrument, event.note, event.duration, event.velocity, event.seed].join('/');
    let pcm = cache.get(cacheKey);
    if (!pcm) {
      pcm = renderVoice(bank.instruments[event.instrument], event.note, event.duration, event.velocity, event.seed, compiled.sampleRate); cache.set(cacheKey, pcm);
      // 음표 캐시가 곡 전체 성부 수만큼 자라지 않게 한다.
      if (cache.size > 32) cache.delete(cache.keys().next().value);
    }
    const angle = (event.pan + 1) * Math.PI / 4;
    const l = Math.cos(angle) * event.gain, r = Math.sin(angle) * event.gain;
    const loopLength = compiled.loopEndFrame - compiled.loopStartFrame;
    for (let i = 0; i < pcm.length; i++) {
      let at = event.frame + i;
      // 한 번만 울리는 도입부 꼬리를 매 반복에 다시 섞지 않는다.
      if (loopLength && event.frame < compiled.loopStartFrame && at >= compiled.loopStartFrame) break;
      if (loopLength && event.frame >= compiled.loopStartFrame && at >= compiled.loopEndFrame) at = compiled.loopStartFrame + (at - compiled.loopStartFrame) % loopLength;
      if (at < left.length) { left[at] += pcm[i] * l; right[at] += pcm[i] * r; }
    }
  }
  function songOutput(state) {
    const { compiled, bank, left, right } = state;
    const outL = new Float32Array(left.length), outR = new Float32Array(right.length);
    const jobs = [];
    if (compiled.loopEndFrame) {
      // 도입부는 무음에서 시작하고, 반복부만 자기 꼬리로 리버브를 준비한다.
      if (compiled.loopStartFrame) jobs.push({ process: createReverb(bank, compiled.sampleRate), start: 0, end: compiled.loopStartFrame, output: true });
      const process = createReverb(bank, compiled.sampleRate);
      const warmFrames = Math.min(compiled.loopEndFrame - compiled.loopStartFrame, Math.ceil(effectsConfig(bank).reverb.warmupSeconds * compiled.sampleRate));
      jobs.push({ process, start: compiled.loopEndFrame - warmFrames, end: compiled.loopEndFrame, output: false });
      jobs.push({ process, start: compiled.loopStartFrame, end: compiled.loopEndFrame, output: true });
    } else jobs.push({ process: createReverb(bank, compiled.sampleRate), start: 0, end: left.length, output: true });
    return { outL, outR, jobs };
  }
  function completeSong(state, outL, outR) {
    const { compiled } = state;
    if (compiled.loopStartFrame) {
      // 마지막 쉼의 40ms만 반복 잔향으로 건너가 두 WAV를 붙여도 연속이다.
      const bridge = Math.min(Math.round(compiled.sampleRate * .04), compiled.loopStartFrame, compiled.loopEndFrame - compiled.loopStartFrame);
      for (let i = 0; i < bridge; i++) {
        const t = i / Math.max(1, bridge - 1), mix = t * t * (3 - 2 * t);
        const at = compiled.loopStartFrame - bridge + i, tail = compiled.loopEndFrame - bridge + i;
        outL[at] += (outL[tail] - outL[at]) * mix; outR[at] += (outR[tail] - outR[at]) * mix;
      }
    }
    if (!compiled.loopEndFrame) {
      const fade = Math.min(Math.floor(compiled.sampleRate * 0.02), outL.length);
      for (let i = 0; i < fade; i++) { const g = i / fade; outL[i] *= g; outR[i] *= g; outL[outL.length - 1 - i] *= g; outR[outR.length - 1 - i] *= g; }
    }
    state.cache.clear();
    return { left: outL, right: outR, sampleRate: compiled.sampleRate, loopStartFrame: compiled.loopStartFrame, loopEndFrame: compiled.loopEndFrame, scoreFrames: compiled.frames };
  }
  function finishSong(state) {
    const { outL, outR, jobs } = songOutput(state);
    for (const job of jobs) job.process(state.left, state.right, job.output ? outL : null, job.output ? outR : null, job.start, job.end);
    return completeSong(state, outL, outR);
  }
  async function finishSongAsync(state, options) {
    const { outL, outR, jobs } = songOutput(state), block = Math.round(state.compiled.sampleRate * .25);
    let lastYield = Date.now();
    for (const job of jobs) for (let start = job.start; start < job.end; start += block) {
      if (options.cancelled && options.cancelled()) return null;
      job.process(state.left, state.right, job.output ? outL : null, job.output ? outR : null, start, Math.min(job.end, start + block));
      if (Date.now() - lastYield > 12) { await new Promise(resolve => setTimeout(resolve, 0)); lastYield = Date.now(); }
    }
    return completeSong(state, outL, outR);
  }
  function renderSong(track, bank, options = {}) {
    const state = beginSong(track, bank, options);
    for (const event of state.compiled.events) mixEvent(state, event);
    return finishSong(state);
  }
  async function renderSongAsync(track, bank, options = {}) {
    const state = beginSong(track, bank, options);
    let lastYield = Date.now();
    for (let i = 0; i < state.compiled.events.length; i++) {
      if (options.cancelled && options.cancelled()) return null;
      mixEvent(state, state.compiled.events[i]);
      if (Date.now() - lastYield > 14) { if (options.onProgress) options.onProgress(i / state.compiled.events.length); await new Promise(resolve => setTimeout(resolve, 0)); lastYield = Date.now(); }
    }
    if (options.cancelled && options.cancelled()) return null;
    return finishSongAsync(state, options);
  }
  function renderSfx(effect, bank, options = {}) {
    const definitions = getDefinitions(bank), sampleRate = options.sampleRate || 44100;
    if (!effect || !Array.isArray(effect.layers)) throw new Error('효과음 layers가 필요합니다.');
    const events = effect.layers.map((layer, index) => {
      if (!definitions[layer.instrument]) throw new Error(effect.id + ': 없는 악기 ' + layer.instrument);
      const definition = Object.assign({}, definitions[layer.instrument], layer.patch || {});
      const start = finite(layer.start || 0, 'sfx.start', 0, 30);
      const duration = finite(layer.duration || 0.1, 'sfx.duration', 0.001, 30);
      const gain = finite(layer.gain === undefined ? 1 : layer.gain, 'sfx.gain', 0, 3);
      const pan = finite(layer.pan || 0, 'sfx.pan', -1, 1);
      const pcm = renderVoice(definition, layer.note || 'X', duration, layer.velocity === undefined ? 0.85 : layer.velocity, layer.seed === undefined ? hash(effect.id + '/' + index) : layer.seed, sampleRate);
      return { pcm, frame: Math.round(start * sampleRate), gain, pan };
    });
    const tail = Math.min(2, effectsConfig(bank).reverb.tailSeconds);
    const frames = Math.max(Math.ceil((effect.duration || 0) * sampleRate), ...events.map(e => e.frame + e.pcm.length)) + Math.ceil(tail * sampleRate);
    const left = new Float32Array(frames), right = new Float32Array(frames);
    const gain = finite(effect.gain === undefined ? 1 : effect.gain, 'effect.gain', 0, 3);
    for (const event of events) {
      const angle = (event.pan + 1) * Math.PI / 4, l = Math.cos(angle) * event.gain * gain, r = Math.sin(angle) * event.gain * gain;
      for (let i = 0; i < event.pcm.length; i++) { left[event.frame + i] += event.pcm[i] * l; right[event.frame + i] += event.pcm[i] * r; }
    }
    const outL = new Float32Array(frames), outR = new Float32Array(frames);
    createReverb(bank, sampleRate)(left, right, outL, outR);
    // 리버브가 실제로 들리는 꼬리는 남기고, 계산용으로 덧붙인 무음만 걷어 낸다.
    // 양 채널이 모두 -100dB 아래인 뒤에 20ms를 더 남겨 마지막 5ms만 닫는다.
    let lastAudible = frames - 1;
    while (lastAudible >= 0 && Math.abs(outL[lastAudible]) < 0.00001 && Math.abs(outR[lastAudible]) < 0.00001) lastAudible--;
    const trimmedFrames = Math.min(frames, lastAudible + 1 + Math.ceil(sampleRate * 0.02));
    const fade = Math.min(Math.ceil(sampleRate * 0.005), trimmedFrames);
    for (let i = 0; i < fade; i++) {
      const g = fade > 1 ? i / (fade - 1) : 0;
      outL[trimmedFrames - 1 - i] *= g; outR[trimmedFrames - 1 - i] *= g;
    }
    return { left: outL.slice(0, trimmedFrames), right: outR.slice(0, trimmedFrames), sampleRate, loopStartFrame: 0, loopEndFrame: 0 };
  }
  function createPlayer(options) {
    if (!options || !options.score || !options.instruments) throw new Error('score와 instruments가 필요합니다.');
    const score = options.score, bank = options.instruments;
    const tracks = new Map(score.tracks.map(t => [t.id, t]));
    let context = options.context || null, ownsContext = false, master = null, unlocked = false;
    let enabled = true, volume = 0.65, ducking = 1, serial = 0, current = null, timer = null, destroyed = false;
    let loading = false, paused = false, pausedAt = 0, visibilityPaused = false, disabledPaused = false;
    const active = new Set(), cache = new Map(), sfxSources = new Set();
    const tickSeconds = 0.025, horizon = 0.3, chunkSeconds = 0.12;
    const sampleRate = finite(options.sampleRate || 22050, 'player.sampleRate', 8000, 48000);
    const clockEvents = [], sfxCache = new Map();
    let peakSources = 0, ended = false;
    const sourceCount = () => [...active].reduce((n, s) => n + s.sources.size, 0);
    function clockEvent(type, details = {}) {
      const item = { type, clock: context ? context.currentTime : 0, ...details };
      clockEvents.push(item); if (clockEvents.length > 96) clockEvents.shift();
      if (typeof options.onClock === 'function') options.onClock(item);
    }
    function state() {
      let seconds = current ? Math.max(0, context.currentTime - current.started + current.from) : pausedAt;
      if (current && current.pcm.loopEndFrame) {
        const start = current.pcm.loopStartFrame / current.pcm.sampleRate, end = current.pcm.loopEndFrame / current.pcm.sampleRate;
        if (seconds >= end) seconds = start + (seconds - start) % (end - start);
      }
      const track = tracks.get(current ? current.id : selectedId), loopStart = track && track.loop ? track.loop.start * track.meter[0] * 4 / track.meter[1] * 60 / track.tempo : 0;
      return { id: current ? current.id : selectedId, playing: !!current && !paused, paused, loading, ended, currentTime: seconds, duration: track ? track.measures * track.meter[0] * 4 / track.meter[1] * 60 / track.tempo : 0, phase: track && track.loop ? seconds < loopStart ? 'intro' : 'loop' : 'once', enabled, volume, ducking, unlocked };
    }
    let selectedId = null;
    function emit() { if (typeof options.onState === 'function') options.onState(state()); }
    function setGain(node, value, seconds = 0.02) {
      const at = context.currentTime;
      if (typeof node.gain.cancelAndHoldAtTime === 'function') node.gain.cancelAndHoldAtTime(at);
      else { node.gain.cancelScheduledValues(at); node.gain.setValueAtTime(node.gain.value, at); }
      node.gain.linearRampToValueAtTime(value, at + Math.max(0.005, seconds));
    }
    function ensureMaster() {
      if (!context || master) return;
      master = context.createGain(); master.gain.value = enabled ? volume * ducking : 0; master.connect(context.destination);
    }
    async function unlock(event) {
      if (destroyed) return false;
      if (event && event.isTrusted === false) return false;
      if (!context) {
        if (typeof window === 'undefined') return false;
        if (window.navigator.userActivation && !window.navigator.userActivation.hasBeenActive) return false;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        context = new AC(); ownsContext = true;
      }
      ensureMaster();
      try { if (context.state === 'suspended') await context.resume(); } catch (_) { return false; }
      unlocked = context.state === 'running'; emit(); return unlocked;
    }
    function cancelSession(session, fade) {
      if (!session) return;
      if (session.cleanup) clearTimeout(session.cleanup);
      const end = context.currentTime + Math.max(0.01, fade) + 0.02;
      // 이전 곡도 페이드가 끝날 때까지 실제 버퍼가 이어져야 한다.
      // 보통의 300ms 예약분만 두면 1.5초 크로스페이드 중간에 잘린다.
      if (!session.stopping && context.state === 'running') queueSession(session, end);
      session.stopping = true; setGain(session.gain, 0, fade);
      session.sources.forEach(source => { try { source.stop(end); } catch (_) {} });
      session.cleanup = setTimeout(() => { session.sources.forEach(source => { try { source.stop(); source.disconnect(); } catch (_) {} }); session.sources.clear(); session.gain.disconnect(); active.delete(session); }, (Math.max(0.01, fade) + 0.05) * 1000);
    }
    function discardSession(session) {
      if (session.cleanup) clearTimeout(session.cleanup);
      session.stopping = true;
      session.sources.forEach(source => { try { source.stop(); source.disconnect(); } catch (_) {} });
      session.sources.clear(); session.gain.disconnect(); active.delete(session);
    }
    function queueSession(session, until) {
      const pcm = session.pcm, rate = pcm.sampleRate;
      const now = context.currentTime;
      if (session.when < now - 0.1) {
        // 절전·백그라운드에서 지난 버퍼를 몰아서 예약하지 않는다.
        const skippedClock = now + 0.025 - session.when;
        session.when += skippedClock;
        session.started += skippedClock;
      }
      while (session.when < until && !session.stopping && !destroyed) {
        if (sourceCount() >= 48) break;
        const endFrame = pcm.loopEndFrame || pcm.left.length;
        if (session.frame >= endFrame) {
          if (pcm.loopEndFrame) {
            clockEvent('loop', { id: session.id, when: session.when, previousBufferEnd: session.lastEnd, fromFrame: endFrame, toFrame: pcm.loopStartFrame, sampleRate: rate, gapSeconds: session.lastEnd === undefined ? null : session.when - session.lastEnd });
            session.frame = pcm.loopStartFrame; session.enteredLoop = true;
          }
          else { session.finishedAt = session.when; break; }
        }
        if (!session.enteredLoop && pcm.loopEndFrame && session.frame === pcm.loopStartFrame) {
          session.enteredLoop = true;
          clockEvent('intro-loop', { id: session.id, when: session.when, previousBufferEnd: session.lastEnd, fromFrame: session.frame, toFrame: session.frame, sampleRate: rate, gapSeconds: session.lastEnd === undefined ? null : session.when - session.lastEnd });
        }
        const segmentEnd = session.frame < pcm.loopStartFrame ? pcm.loopStartFrame : endFrame;
        const length = Math.min(Math.round(chunkSeconds * rate), segmentEnd - session.frame, Math.floor((until - session.when) * rate));
        if (length < 1) break;
        const buffer = context.createBuffer(2, length, rate);
        buffer.copyToChannel(pcm.left.subarray(session.frame, session.frame + length), 0);
        buffer.copyToChannel(pcm.right.subarray(session.frame, session.frame + length), 1);
        const source = context.createBufferSource(); source.buffer = buffer; source.connect(session.gain);
        session.sources.add(source);
        peakSources = Math.max(peakSources, sourceCount());
        source.onended = () => { session.sources.delete(source); source.disconnect(); };
        source.start(session.when);
        session.lastEnd = session.when + buffer.duration;
        session.frame += length; session.when += length / rate;
      }
    }
    function schedule() {
      if (!context || context.state !== 'running' || !current || paused || destroyed) return;
      const session = current, now = context.currentTime;
      queueSession(session, now + horizon);
      if (session.finishedAt && now >= session.finishedAt) {
        pausedAt = session.pcm.left.length / session.pcm.sampleRate; ended = true; current = null; cancelSession(session, 0.02);
        if (timer) { clearInterval(timer); timer = null; }
        clockEvent('ended', { id: session.id, when: session.finishedAt }); emit();
      }
    }
    function startTimer() { if (!timer) timer = setInterval(schedule, tickSeconds * 1000); }
    async function play(id, settings = {}) {
      if (destroyed) throw new Error('연주기가 닫혔습니다.');
      if (!tracks.has(id)) throw new Error('없는 곡: ' + id);
      if (current && current.id === id && settings.fromSeconds === undefined && !paused) {
        // A 재생 중 B를 준비하다 A로 돌아오면 늦게 끝난 B를 버린다.
        if (loading || selectedId !== id) { serial++; selectedId = id; loading = false; emit(); }
        return true;
      }
      if (!unlocked || !context || context.state !== 'running') return false;
      if (!enabled) return false;
      if (typeof document !== 'undefined' && document.hidden) {
        selectedId = id; paused = true; pausedAt = 0; visibilityPaused = true; emit(); return false;
      }
      const request = ++serial;
      selectedId = id; loading = true; ended = false; emit();
      let pcm = cache.get(id);
      if (!pcm) {
        pcm = await renderSongAsync(tracks.get(id), bank, { sampleRate, cancelled: () => request !== serial || destroyed });
        if (!pcm || request !== serial || destroyed) return false;
        cache.set(id, pcm);
        const bytes = () => [...cache.values()].reduce((n, p) => n + p.left.byteLength + p.right.byteLength, 0);
        while (cache.size > 2 || cache.size > 1 && bytes() > 48 * 1024 * 1024) cache.delete(cache.keys().next().value);
      } else {
        cache.delete(id); cache.set(id, pcm);
      }
      if (request !== serial || destroyed) return false;
      const crossfade = clamp(settings.crossfade === undefined ? 1.5 : settings.crossfade, 0.01, 4);
      const from = clamp(settings.fromSeconds || 0, 0, pcm.left.length / pcm.sampleRate - 0.001);
      const previous = current;
      // 잦은 장면 교체에서도 이전 곡 하나만 페이드하며 나머지는 정리한다.
      active.forEach(session => { if (session !== previous) discardSession(session); });
      const gain = context.createGain(); gain.gain.value = 0; gain.connect(master);
      const start = context.currentTime + 0.035;
      const session = { id, pcm, gain, sources: new Set(), frame: Math.floor(from * pcm.sampleRate), when: start, started: start, from, stopping: false, enteredLoop: from * pcm.sampleRate > pcm.loopStartFrame };
      active.add(session); current = session; paused = false; pausedAt = from; loading = false;
      gain.gain.setValueAtTime(0, context.currentTime); gain.gain.linearRampToValueAtTime(1, start + crossfade);
      if (previous) cancelSession(previous, crossfade);
      clockEvent('play', { id, when: start, fromSeconds: from, crossfade, sampleRate: pcm.sampleRate });
      schedule(); startTimer(); emit(); return true;
    }
    function stop(fadeSeconds = 0.08) {
      serial++; loading = false;
      if (context) active.forEach(session => cancelSession(session, Math.max(0.01, fadeSeconds)));
      current = null; paused = false; pausedAt = 0; visibilityPaused = false; disabledPaused = false; ended = false;
      if (timer) { clearInterval(timer); timer = null; }
      sfxSources.forEach(source => { try { source.stop(); } catch (_) {} }); sfxSources.clear(); emit();
      clockEvent('stop');
    }
    function pause() {
      if (!current) return;
      pausedAt = state().currentTime; serial++; loading = false; paused = true;
      active.forEach(session => cancelSession(session, 0.025)); current = null;
      if (timer) { clearInterval(timer); timer = null; } emit();
      clockEvent('pause', { id: selectedId, fromSeconds: pausedAt });
    }
    async function resume() { if (!paused || !selectedId) return false; return play(selectedId, { fromSeconds: pausedAt, crossfade: 0.08 }); }
    function setVolume(value) { volume = finite(value, 'volume', 0, 1); if (master) setGain(master, enabled ? volume * ducking : 0); emit(); }
    function setDucking(value = 1, seconds = .15) { ducking = finite(value, 'ducking', 0, 1); if (master) setGain(master, enabled ? volume * ducking : 0, seconds); emit(); }
    function setEnabled(value) {
      const changed = enabled !== !!value; enabled = !!value;
      if (master) setGain(master, enabled ? volume * ducking : 0);
      if (!enabled) {
        const wasLoading = loading;
        // 숨김 때문에 멈춘 뒤 음소거해도 복귀 의도는 보존한다.
        if (visibilityPaused && paused && selectedId) disabledPaused = true;
        if (current) { disabledPaused = true; pause(); }
        if (wasLoading) { serial++; loading = false; paused = true; pausedAt = 0; disabledPaused = true; }
        sfxSources.forEach(source => { try { source.stop(); } catch (_) {} }); sfxSources.clear();
      } else if (changed && disabledPaused) {
        disabledPaused = false;
        if (typeof document !== 'undefined' && document.hidden) visibilityPaused = true;
        else if (context && context.state === 'running') resume().catch(() => {});
      }
      emit();
    }
    async function playSfx(idOrEffect) {
      if (!unlocked || !enabled || !context || context.state !== 'running' || destroyed) return false;
      const effect = typeof idOrEffect === 'string' ? options.sfx && options.sfx.effects.find(e => e.id === idOrEffect) : idOrEffect;
      if (!effect) throw new Error('없는 효과음: ' + idOrEffect);
      if (sfxSources.size >= 12 || typeof document !== 'undefined' && document.hidden) return false;
      let buffer = sfxCache.get(effect.id);
      if (!buffer) {
        const pcm = renderSfx(effect, bank, { sampleRate });
        buffer = context.createBuffer(2, pcm.left.length, pcm.sampleRate);
        buffer.copyToChannel(pcm.left, 0); buffer.copyToChannel(pcm.right, 1);
        sfxCache.set(effect.id, buffer); if (sfxCache.size > 12) sfxCache.delete(sfxCache.keys().next().value);
      }
      const source = context.createBufferSource(); source.buffer = buffer; source.connect(master); sfxSources.add(source);
      source.onended = () => { source.disconnect(); sfxSources.delete(source); }; source.start(context.currentTime + 0.01); return true;
    }
    function visibility() {
      if (typeof document === 'undefined') return;
      if (document.hidden) {
        const wasLoading = loading;
        visibilityPaused = !!current || wasLoading || disabledPaused;
        if (current) pause();
        if (wasLoading) { serial++; loading = false; paused = true; pausedAt = 0; emit(); }
      } else if (visibilityPaused) {
        visibilityPaused = false;
        if (enabled && context && context.state === 'running') resume().catch(() => {});
      }
    }
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', visibility);
    function useContext(next) {
      if (!next) return;
      if (context && context !== next && (unlocked || active.size)) throw new Error('재생 중 AudioContext를 바꿀 수 없습니다.');
      context = next; ownsContext = false; ensureMaster(); unlocked = next.state === 'running';
    }
    function destroy() {
      stop(0.01); destroyed = true; cache.clear(); sfxCache.clear();
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', visibility);
      if (master) setTimeout(() => master.disconnect(), 80);
      if (ownsContext && context) context.close().catch(() => {});
    }
    function getDiagnostics() { return { clockEvents: clockEvents.slice(), schedulerRunning: !!timer, sources: sourceCount(), peakSources, sessions: active.size, cachedTracks: cache.size, cacheBytes: [...cache.values()].reduce((n, p) => n + p.left.byteLength + p.right.byteLength, 0), sampleRate }; }
    return { unlock, play, stop, pause, resume, setVolume, setDucking, setEnabled, playSfx, getState: state, getDiagnostics, destroy, useContext, get context() { return context; } };
  }
  function attachSound(sound, player) {
    if (!sound || !player) throw new Error('Sound와 player가 필요합니다.');
    function sync() {
      if (sound.context) player.useContext(sound.context);
      player.setVolume(typeof sound.bgmVolume === 'number' ? sound.bgmVolume : sound.volume === 'high' ? 0.8 : 0.4);
      player.setEnabled(sound.enabled);
    }
    function firstInput(event) {
      if (!event.isTrusted) return;
      // 터치는 pointerdown 뒤 pointerup/click에서 사용자 활성화가 생길 수 있다.
      if (window.navigator.userActivation && !window.navigator.userActivation.hasBeenActive) return;
      sync();
      if (sound.initialized && sound.context) player.unlock(event).catch(() => {});
    }
    sync();
    if (typeof window !== 'undefined') {
      window.addEventListener('packoon-sound-change', sync);
      window.addEventListener('pointerdown', firstInput, true);
      window.addEventListener('pointerup', firstInput, true);
      window.addEventListener('click', firstInput, true);
      window.addEventListener('keydown', firstInput, true);
    }
    return function detach() {
      if (typeof window !== 'undefined') {
        window.removeEventListener('packoon-sound-change', sync);
        window.removeEventListener('pointerdown', firstInput, true);
        window.removeEventListener('pointerup', firstInput, true);
        window.removeEventListener('click', firstInput, true);
        window.removeEventListener('keydown', firstInput, true);
      }
    };
  }
  return { DSP: { noteFrequency, compileScore, renderVoice, renderSong, renderSongAsync, renderSfx }, createPlayer, attachSound };
});
