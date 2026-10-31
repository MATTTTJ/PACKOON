# 오디오 분석(librosa 없이 numpy·scipy): 길이·BPM·조(크룸한슬)·최대 음량. 사용: python ace_analyze.py <파일>...
import sys, json
import numpy as np
import soundfile as sf
from scipy.signal import stft, resample_poly

MAJOR = np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88])
MINOR = np.array([6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
NAMES = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B']

def load(path, sr=22050):
    y, s = sf.read(path, always_2d=True)
    y = y.mean(axis=1)
    g = np.gcd(int(s), sr)
    return resample_poly(y, sr // g, int(s) // g), sr, len(y) / s, float(np.abs(y).max())

def bpm_of(y, sr, lo=60, hi=200):
    f, t, Z = stft(y, sr, nperseg=2048, noverlap=2048 - 512)
    mag = np.log1p(np.abs(Z))
    flux = np.maximum(np.diff(mag, axis=1), 0).sum(axis=0)
    flux = flux - flux.mean()
    ac = np.correlate(flux, flux, 'full')[len(flux) - 1:]
    fps = sr / 512
    lags = np.arange(len(ac))
    bpm = 60 * fps / np.maximum(lags, 1)
    ok = (bpm >= lo) & (bpm <= hi)
    i = lags[ok][np.argmax(ac[ok])]
    return 60 * fps / i

def key_of(y, sr):
    f, t, Z = stft(y, sr, nperseg=8192, noverlap=8192 - 2048)
    P = (np.abs(Z) ** 2).mean(axis=1)
    chroma = np.zeros(12)
    for fi, p in zip(f, P):
        if 60 <= fi <= 2000:
            chroma[int(round(12 * np.log2(fi / 261.6256))) % 12] += p
    chroma /= chroma.max()
    best = None
    for i in range(12):
        for prof, mode in ((MAJOR, 'major'), (MINOR, 'minor')):
            r = np.corrcoef(np.roll(prof, i), chroma)[0, 1]
            if best is None or r > best[0]: best = (r, NAMES[i] + ' ' + mode)
    top = [NAMES[i] for i in np.argsort(chroma)[::-1][:5]]
    return best[1], round(float(best[0]), 3), top

out = []
for path in sys.argv[1:]:
    y, sr, sec, peak = load(path)
    k, r, top = key_of(y, sr)
    out.append({'file': path.replace('\\', '/').split('/')[-1][-40:], 'sec': round(sec, 2), 'bpm': round(bpm_of(y, sr), 1),
                'key': k, 'key_r': r, 'top_pitch': top, 'peak': round(peak, 3)})
print(json.dumps(out, ensure_ascii=False, indent=1))
