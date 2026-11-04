"""배경 띠 조각(a, b, c …)을 겹치는 부분에서 섞어 잇고, 끝을 처음으로 이어 반복되는 띠 하나로 만든다.

    py tools/art/stitch.py <나갈 이름> <조각a.png> <조각b.png> [<조각c.png> …] [--overlap 0.25]

노말맵 조각(<이름>_n.png)이 옆에 있으면 같은 방식으로 잇는다 (나갈 이름_n.png).
섞는 구간은 조각 폭의 overlap 비율이고, 부드러운 곡선(smoothstep)으로 섞는다.
"""
import argparse, os
from PIL import Image


def smooth_mask(w, h):
    m = Image.new('L', (w, 1))
    m.putdata([int(255 * (t * t * (3 - 2 * t))) for t in (x / max(1, w - 1) for x in range(w))])
    return m.resize((w, h))


def stitch(parts, o):
    W, H = parts[0].size
    parts = [p.resize((W, H), Image.LANCZOS) if p.size != (W, H) else p for p in parts]
    n = len(parts)
    out = Image.new(parts[0].mode, (n * (W - o), H))
    mask = smooth_mask(o, H)
    x = 0
    for i, p in enumerate(parts):
        nxt = parts[(i + 1) % n]
        body = p.crop((o, 0, W - o, H)); out.paste(body, (x, 0)); x += body.size[0]
        seam = Image.composite(nxt.crop((0, 0, o, H)), p.crop((W - o, 0, W, H)), mask)
        out.paste(seam, (x, 0)); x += o
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out'); ap.add_argument('parts', nargs='+'); ap.add_argument('--overlap', type=float, default=.25)
    a = ap.parse_args()
    imgs = [Image.open(p).convert('RGBA') for p in a.parts]   # 투명 배경을 그대로 잇는다
    o = int(imgs[0].size[0] * a.overlap)
    stitch(imgs, o).save(a.out)
    normals = [os.path.splitext(p)[0] + '_n.png' for p in a.parts]
    if all(os.path.exists(p) for p in normals):
        stitch([Image.open(p).convert('RGBA') for p in normals], o).save(os.path.splitext(a.out)[0] + '_n.png')
        print('노말맵도 이었다')
    print(a.out, '완성')


if __name__ == '__main__':
    main()
