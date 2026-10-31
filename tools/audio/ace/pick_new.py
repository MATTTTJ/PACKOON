# 창작판 후보 고르기 (결정 D-121). 원곡이 없으니 선율 상관 대신 세 가지를 잰다.
#  beat  : 박이 분명한가. 소리 세기 변화(onset)의 자기상관에서 지정 BPM 한 박 자리의 값(0~1).
#  scale : 음 집합이 지정 조성 안에 드는가. 크로마 에너지 중 허용 음 다섯의 몫(0~1).
#  seam  : 끝과 시작이 이어지기 쉬운가. 반복 끝 직전 1초와 반복 시작 직전 1초의 스펙트럼 거리·세기 차이로 1-거리(0~1).
#  점수 = 0.35·beat + 0.4·scale + 0.25·seam. 가장 높은 후보를 고른다.
# 사용: python pick_new.py <bpm> <허용음 쉼표목록 예 0,2,4,7,9> <반복시작초> <반복끝초> <후보wav>...
import sys, json
import numpy as np
import soundfile as sf
from scipy.signal import stft, resample_poly

bpm, allowed, ls, le = float(sys.argv[1]), [int(x) for x in sys.argv[2].split(',')], float(sys.argv[3]), float(sys.argv[4])
cands = sys.argv[5:]
SR = 22050

def mono22(y, s):
    m = y.mean(axis=1) if y.ndim > 1 else y
    g = np.gcd(int(s), SR)
    return resample_poly(m, SR // g, int(s) // g)

def beat_score(m):
    hop = 512
    f, t, Z = stft(m, SR, nperseg=2048, noverlap=2048 - hop)
    S = np.log1p(np.abs(Z))
    flux = np.maximum(0, np.diff(S, axis=1)).sum(axis=0)
    flux = (flux - flux.mean()) / (flux.std() + 1e-9)
    ac = np.correlate(flux, flux, 'full')[len(flux) - 1:]; ac /= ac[0] + 1e-9
    lag = 60.0 / bpm * SR / hop
    best = 0.0
    for mul in (0.5, 1, 2):   # 반박·한 박·두 박 중 가장 분명한 것
        L = int(round(lag * mul))
        if 2 < L < len(ac): best = max(best, float(ac[max(1, L - 2):L + 3].max()))
    return max(0.0, min(1.0, best))

def chroma(m):
    f, t, Z = stft(m, SR, nperseg=4096, noverlap=4096 - 2205)
    P = np.abs(Z) ** 2
    C = np.zeros(12)
    for i, fi in enumerate(f):
        if 60 <= fi <= 2000: C[int(round(12 * np.log2(fi / 261.6256))) % 12] += P[i].sum()
    return C / (C.sum() + 1e-9)

def seam_score(m):
    a0, a1 = int((le - 1) * SR), int(le * SR)
    b0, b1 = int((ls - 1) * SR), int(ls * SR)
    if b0 < 0 or a1 > len(m): return 0.0
    sp = lambda v: np.abs(np.fft.rfft(v * np.hanning(len(v))))
    A, B = sp(m[a0:a1]), sp(m[b0:b1])
    dist = float(np.linalg.norm(A / (A.sum() + 1e-9) - B / (B.sum() + 1e-9)))
    ra, rb = np.sqrt((m[a0:a1] ** 2).mean()), np.sqrt((m[b0:b1] ** 2).mean())
    level = abs(ra - rb) / (max(ra, rb) + 1e-9)
    return max(0.0, 1.0 - 8 * dist - 0.5 * level)

rows = []
for p in cands:
    y, s = sf.read(p, always_2d=True)
    m = mono22(y, s)
    c = chroma(m)
    b, sc, se = beat_score(m), float(c[allowed].sum()), seam_score(m)
    rows.append({'file': p.replace('\\', '/').split('/')[-1], 'path': p, 'beat': round(b, 3), 'scale': round(sc, 3), 'seam': round(se, 3),
                 'score': round(0.35 * b + 0.4 * sc + 0.25 * se, 3), 'seconds': round(len(m) / SR, 2)})
rows.sort(key=lambda r: -r['score'])
print(json.dumps({'chosen': rows[0]['path'], 'candidates': rows}, ensure_ascii=False, indent=1))
