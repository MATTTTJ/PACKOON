# ACE-Step 결과를 게임용 반복 음원으로 다듬는다.
# 1) 후보마다 원곡과 시간별 음높이 분포(크로마) 상관을 재서 선율을 더 지킨 쪽을 고른다.
# 2) 반복 구간 [start,end]에 맞춰 자르고, 끝 X초를 '반복 시작 직전 X초'와 크로스페이드한다.
#    그러면 end에서 start로 넘어갈 때 바로 앞 소리가 start 직전과 같아 이음새가 들리지 않는다.
# 3) 이음새 전후 50ms의 RMS 차이, 경계 샘플 튐, 스펙트럼 거리를 잰다.
# 사용: python ace_loop.py <원곡wav> <loopStart초> <loopEnd초> <출력wav> <후보wav>...
import sys, json
import numpy as np
import soundfile as sf
from scipy.signal import stft, resample_poly

orig_path, ls, le, out_path = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
cands = sys.argv[5:]
XF = 0.35   # 크로스페이드 길이(초)

def mono22(y, s):
    m = y.mean(axis=1) if y.ndim > 1 else y
    g = np.gcd(int(s), 22050)
    return resample_poly(m, 22050 // g, int(s) // g)

def chroma_t(m, sr=22050):
    f, t, Z = stft(m, sr, nperseg=4096, noverlap=4096 - 2205)   # 0.1초 간격
    P = np.abs(Z) ** 2
    C = np.zeros((12, P.shape[1]))
    for i, fi in enumerate(f):
        if 60 <= fi <= 2000: C[int(round(12 * np.log2(fi / 261.6256))) % 12] += P[i]
    C /= (C.sum(axis=0, keepdims=True) + 1e-9)
    return C

oy, osr = sf.read(orig_path, always_2d=True)
oc = chroma_t(mono22(oy, osr))
scores = []
for p in cands:
    y, s = sf.read(p, always_2d=True)
    c = chroma_t(mono22(y, s))
    n = min(c.shape[1], oc.shape[1])
    # 프레임마다 상관의 평균(선율·화음이 시간에 맞춰 같은가)
    a, b = oc[:, :n] - oc[:, :n].mean(axis=0), c[:, :n] - c[:, :n].mean(axis=0)
    r = (a * b).sum(axis=0) / (np.sqrt((a * a).sum(axis=0) * (b * b).sum(axis=0)) + 1e-9)
    scores.append((float(np.nanmean(r)), p))
scores.sort(reverse=True)
best = scores[0][1]

y, sr = sf.read(best, always_2d=True)
y = y.astype(np.float64)
i0, i1, x = int(round(ls * sr)), int(round(le * sr)), int(round(XF * sr))
i1 = min(i1, len(y))
body = y[:i1].copy()
# 끝 x샘플: 원래 끝(점점 작게) + 반복 시작 직전 x샘플(점점 크게). 같은 전력 곡선.
w = np.linspace(0, np.pi / 2, x)[:, None]
body[i1 - x:i1] = y[i1 - x:i1] * np.cos(w) + y[i0 - x:i0] * np.sin(w)
# 최대 음량 맞추기(-1 dBFS 아래)
peak = np.abs(body).max(); body *= min(1.0, 0.89 / peak)
sf.write(out_path, body.astype(np.float32), sr, subtype='PCM_16')

def seam(sig, a_end, b_start):
    k = int(0.05 * sr)
    pre, post = sig[a_end - k:a_end].mean(axis=1), sig[b_start:b_start + k].mean(axis=1)
    rms = lambda v: float(np.sqrt((v ** 2).mean()))
    jump = float(np.abs(sig[a_end - 1] - sig[b_start]).max())
    sp = lambda v: np.abs(np.fft.rfft(v * np.hanning(len(v))))
    A, B = sp(pre), sp(post)
    dist = float(np.linalg.norm(A / (A.sum() + 1e-9) - B / (B.sum() + 1e-9)))
    return {'rms_before': round(rms(pre), 4), 'rms_after': round(rms(post), 4), 'edge_jump': round(jump, 4), 'spec_dist': round(dist, 4)}

# 다듬기 전(원래 생성물에서 end→start로 바로 넘길 때)과 다듬은 뒤를 비교
raw = y[:i1]
print(json.dumps({'chosen': best.replace('\\', '/').split('/')[-1], 'melody_match': [[round(s, 3), p.replace('\\', '/').split('/')[-1][-22:]] for s, p in scores],
                  'seconds': round(i1 / sr, 2), 'sr': sr, 'loop': [ls, le],
                  'seam_raw': seam(raw, i1, i0), 'seam_fixed': seam(body, i1, i0),
                  'tail_rms_last2s': round(float(np.sqrt((y[i1 - 2 * sr:i1] ** 2).mean())), 4),
                  'mid_rms': round(float(np.sqrt((y[i0:i0 + 10 * sr] ** 2).mean())), 4)}, ensure_ascii=False, indent=1))
