# 반복이 없는 곡(경치·엔딩)의 ACE-Step 결과를 게임용으로 다듬는다 (결정 D-121).
# 1) 후보마다 원곡과 시간별 음높이 분포(크로마) 상관을 재서 선율을 더 지킨 쪽을 고른다 (loop.py와 같은 방식).
# 2) 원곡 길이에 맞춰 자르고, 시작 30ms 페이드인, 끝 FADE초 페이드아웃만 한다. 이음새는 없다.
# 3) --resolve-c 를 주면 끝 4초의 음높이 분포에서 C가 가장 센지 본다. 약하면 원곡 합성의 끝 4초를
#    아래에 깔아(같은 전력 곡선으로 0→0.6) '이름의 노래'의 C 해결이 들리게 한다. 엔딩 전용.
# 사용: python fade.py <원곡wav> <출력wav> [--resolve-c] <후보wav>...
import sys, json
import numpy as np
import soundfile as sf
from scipy.signal import stft, resample_poly

args = sys.argv[1:]
resolve = '--resolve-c' in args
args = [a for a in args if a != '--resolve-c']
# --len <초>: 게임은 녹음을 악보 길이(꼬리 제외)에서 자르므로, 그 길이 안에서 페이드아웃한다
LEN = None
if '--len' in args:
    k = args.index('--len'); LEN = float(args[k + 1]); del args[k:k + 2]
orig_path, out_path, cands = args[0], args[1], args[2:]
FADE = 2.0
NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

def mono22(y, s):
    m = y.mean(axis=1) if y.ndim > 1 else y
    g = np.gcd(int(s), 22050)
    return resample_poly(m, 22050 // g, int(s) // g)

def chroma_t(m, sr=22050):
    f, t, Z = stft(m, sr, nperseg=4096, noverlap=4096 - 2205)
    P = np.abs(Z) ** 2
    C = np.zeros((12, P.shape[1]))
    for i, fi in enumerate(f):
        if 60 <= fi <= 2000: C[int(round(12 * np.log2(fi / 261.6256))) % 12] += P[i]
    C /= (C.sum(axis=0, keepdims=True) + 1e-9)
    return C

def tail_chroma(sig, sr, secs=4.0):
    seg = sig[max(0, len(sig) - int(secs * sr)):]
    c = chroma_t(mono22(seg, sr)).mean(axis=1)
    return c / (c.sum() + 1e-9)

oy, osr = sf.read(orig_path, always_2d=True)
oc = chroma_t(mono22(oy, osr))
scores = []
for p in cands:
    y, s = sf.read(p, always_2d=True)
    c = chroma_t(mono22(y, s))
    n = min(c.shape[1], oc.shape[1])
    a, b = oc[:, :n] - oc[:, :n].mean(axis=0), c[:, :n] - c[:, :n].mean(axis=0)
    r = (a * b).sum(axis=0) / (np.sqrt((a * a).sum(axis=0) * (b * b).sum(axis=0)) + 1e-9)
    scores.append((float(np.nanmean(r)), p))
scores.sort(reverse=True)
best = scores[0][1]

y, sr = sf.read(best, always_2d=True)
y = y.astype(np.float64)
n = min(len(y), int(round((LEN if LEN else len(oy) / osr) * sr)))
body = y[:n].copy()

report = {}
if resolve:
    before = tail_chroma(body, sr)
    report['tail_before'] = {NAMES[i]: round(float(before[i]), 3) for i in np.argsort(-before)[:3]}
    report['c_strongest_before'] = bool(np.argmax(before) == 0)
    if not report['c_strongest_before']:
        # 원곡 합성의 끝 4초를 녹음판 샘플레이트로 옮겨 아래에 깐다
        k = int(4.0 * sr)
        g = np.gcd(int(osr), int(sr))
        oe = int(round((LEN if LEN else len(oy) / osr) * osr))   # 악보 끝(꼬리 침묵 앞)
        syn = np.stack([resample_poly(oy[oe - int(4.0 * osr):oe, ch], int(sr) // g, int(osr) // g) for ch in range(oy.shape[1])], axis=1)
        syn = syn[-k:] if len(syn) >= k else np.pad(syn, ((k - len(syn), 0), (0, 0)))
        if syn.shape[1] != body.shape[1]: syn = np.repeat(syn[:, :1], body.shape[1], axis=1)
        w = np.sin(np.linspace(0, np.pi / 2, k))[:, None] * 0.6
        scale = np.abs(body[-k:]).max() / (np.abs(syn).max() + 1e-9)
        body[-k:] = body[-k:] + syn * w * scale
    after = tail_chroma(body, sr)
    report['tail_after'] = {NAMES[i]: round(float(after[i]), 3) for i in np.argsort(-after)[:3]}
    report['c_strongest_after'] = bool(np.argmax(after) == 0)

fi, fo = int(0.03 * sr), int(FADE * sr)
body[:fi] *= np.linspace(0, 1, fi)[:, None]
body[-fo:] *= np.cos(np.linspace(0, np.pi / 2, fo))[:, None]
peak = np.abs(body).max(); body *= min(1.0, 0.89 / peak)
sf.write(out_path, body.astype(np.float32), sr, subtype='PCM_16')
print(json.dumps({'chosen': best.replace('\\', '/').split('/')[-1],
                  'melody_match': [[round(s, 3), p.replace('\\', '/').split('/')[-1][-22:]] for s, p in scores],
                  'seconds': round(n / sr, 2), 'sr': sr, 'fade_out': FADE, **report}, ensure_ascii=False, indent=1))
