"""그림 생성으로 뽑은 디퓨즈·노말맵을 게임 에셋으로 정리한다.

    py tools/art/process.py <id> --diffuse D.png [--normal N.png] [--state 이름] [--cell 행,열 --grid 행수,열수]
                            [--units 폭,높이] [--kind prop|layer|sky|char] [--key magenta|green|none] [--anchor 0.5,1]

- 크로마키(마젠타·초록) 배경을 투명으로 빼고 가장자리 번짐을 지운다.
- 노말맵은 디퓨즈와 윤곽 겹침(IoU)을 재서 0.9 아래면 경고하고 끝낸다 (--force 로 무시).
  노말맵이 없으면 모양을 부풀린 자동 노말맵을 만든다.
- 원본: D:/PACKOON-art/stage1/<id>/[<state>.]diffuse.png, normal.png (레포 밖, PACKOON_ART 로 바꿀 수 있다)
- 웹용: prototypes/web/art/img/<id>[@<state>].d.webp, .n.webp (게임 1단위 = WEB_PPU px), manifest.json 갱신
"""
import argparse, json, math, os, sys
from PIL import Image, ImageChops, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
# 원본 그림은 레포 밖에 둔다 (나중에 Godot 레포로 옮긴다). 다른 곳이면 PACKOON_ART 환경 변수로 바꾼다.
SRC = os.path.join(os.environ.get('PACKOON_ART', 'D:/PACKOON-art'), 'stage1')
WEB = os.path.join(ROOT, 'prototypes', 'web', 'art', 'img')
WEB_PPU = 6.0          # 웹 확인용: 게임 1단위 = 6px (레티나 화면도 흐리지 않게)
SOURCE_PPU = 7.7       # 원본 기준: 4K 화면
FLAT = (128, 128, 255)


def key_alpha(im, key):
    """크로마키 정도로 알파를 만든다. 255 = 물체."""
    r, g, b = im.split()
    if key == 'none':
        return Image.new('L', im.size, 255)
    if key == 'magenta':
        k = ImageChops.subtract(ImageChops.darker(r, b), g)     # 마젠타일수록 크다
    else:
        k = ImageChops.subtract(g, ImageChops.lighter(r, b))    # 초록일수록 크다
    a = k.point(lambda v: 255 if v < 50 else 0 if v > 120 else int((120 - v) * 255 / 70))
    return a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))


def despill(im, key):
    """반투명 가장자리에 남은 크로마키 색을 누른다."""
    if key == 'none':
        return im
    r, g, b = im.split()
    if key == 'magenta':
        cap = ImageChops.add(g, Image.new('L', im.size, 24))
        return Image.merge('RGB', (ImageChops.darker(r, ImageChops.lighter(cap, ImageChops.subtract(r, b))), g,
                                   ImageChops.darker(b, ImageChops.lighter(cap, ImageChops.subtract(b, r)))))
    cap = ImageChops.add(ImageChops.lighter(r, b), Image.new('L', im.size, 12))
    return Image.merge('RGB', (r, ImageChops.darker(g, cap), b))


def count(mask):
    return sum(mask.histogram()[128:])


def normal_silhouette(n):
    r, g, b = n.split()
    d = ImageChops.add(ImageChops.difference(r, Image.new('L', n.size, 128)),
                       ImageChops.difference(g, Image.new('L', n.size, 128)))
    d = ImageChops.add(d, ImageChops.difference(b, Image.new('L', n.size, 255)))
    return d.point(lambda v: 255 if v > 18 else 0).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))


def iou(a, b, tol=13):
    """윤곽 겹침 점수: 몇 px 어긋남은 봐준다 (노말맵은 가장자리가 부드럽게 번진다).
    디퓨즈가 노말맵에 덮인 비율과 노말맵이 디퓨즈 근처에 있는 비율 가운데 작은 값."""
    a = a.point(lambda v: 255 if v > 128 else 0)
    b = b.point(lambda v: 255 if v > 128 else 0)
    na, nb = count(a), count(b)
    if not na or not nb:
        return 0.0
    covered = count(ImageChops.multiply(a, b.filter(ImageFilter.MaxFilter(tol)))) / na
    near = count(ImageChops.multiply(b, a.filter(ImageFilter.MaxFilter(tol)))) / nb
    return min(covered, near)


def auto_normal(alpha, diffuse):
    """모양을 부풀린 높이에서 노말을 만든다 (둥근 소품에 맞는 바탕값)."""
    W, H = alpha.size
    acc = [0.0] * (W * H)
    for rad, w in ((6, .25), (18, .35), (40, .4)):
        for i, v in enumerate(alpha.filter(ImageFilter.GaussianBlur(rad)).getdata()):
            acc[i] += v * w
    lum = list(diffuse.convert('L').filter(ImageFilter.GaussianBlur(1)).getdata())
    lumb = list(diffuse.convert('L').filter(ImageFilter.GaussianBlur(4)).getdata())
    A = list(alpha.getdata())
    for i in range(W * H):
        acc[i] += (lum[i] - lumb[i]) * .35 * (A[i] / 255)
    S, out = 3.2 / 255, []
    for y in range(H):
        for x in range(W):
            i = y * W + x
            if A[i] < 8:
                out.append(FLAT); continue
            nx = ((acc[i - 1] if x else acc[i]) - (acc[i + 1] if x < W - 1 else acc[i])) * S
            ny = ((acc[i + W] if y < H - 1 else acc[i]) - (acc[i - W] if y else acc[i])) * S
            k = 1 / math.sqrt(nx * nx + ny * ny + 1)
            out.append((int((nx * k * .5 + .5) * 255), int((ny * k * .5 + .5) * 255), int((k * .5 + .5) * 255)))
    n = Image.new('RGB', (W, H)); n.putdata(out)
    return n


def cell_box(size, cell, grid):
    (r, c), (R, C) = cell, grid
    W, H = size
    return (W * c // C, H * r // R, W * (c + 1) // C, H * (r + 1) // R)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('id'); p.add_argument('--diffuse', required=True); p.add_argument('--normal')
    p.add_argument('--state'); p.add_argument('--cell'); p.add_argument('--grid', default='2,2')
    p.add_argument('--units'); p.add_argument('--kind', default='prop'); p.add_argument('--key', default='magenta')
    p.add_argument('--anchor', default='0.5,1'); p.add_argument('--pad', type=int, default=8)
    p.add_argument('--force', action='store_true')
    p.add_argument('--baked', action='store_true', help='빛까지 칠한 먼 겹: 노말맵 없이 조명을 다시 입히지 않는다')
    p.add_argument('--extra', default='{}', help='manifest 에 더할 JSON (예: {"parallax":0.1,"y":96,"repeatX":true})')
    a = p.parse_args()

    src = Image.open(a.diffuse)
    has_alpha = src.mode in ('RGBA', 'LA') and src.getchannel('A').getextrema()[0] < 250
    d = src.convert('RGB')
    src_alpha = src.getchannel('A') if has_alpha else None   # 투명 배경으로 뽑은 그림은 그 알파를 그대로 쓴다
    nsrc = Image.open(a.normal).resize(d.size, Image.LANCZOS) if a.normal else None
    n = nsrc.convert('RGB') if nsrc else None
    n_alpha = nsrc.getchannel('A') if nsrc and nsrc.mode == 'RGBA' and nsrc.getchannel('A').getextrema()[0] < 250 else None
    if a.cell:
        box = cell_box(d.size, tuple(map(int, a.cell.split(','))), tuple(map(int, a.grid.split(','))))
        d = d.crop(box); n = n.crop(box) if n else None
        src_alpha = src_alpha.crop(box) if src_alpha else None
        n_alpha = n_alpha.crop(box) if n_alpha else None

    if src_alpha:
        alpha = src_alpha
    else:
        alpha = key_alpha(d, a.key)
        d = despill(d, a.key)
    bb = alpha.point(lambda v: 255 if v > 24 else 0).getbbox()
    if not bb:
        sys.exit('물체를 찾지 못했다: ' + a.diffuse)
    if a.kind in ('layer', 'sky'):
        bb = (0, bb[1], d.size[0], d.size[1])   # 띠는 가로와 아래를 자르지 않는다 (반복 이음)
    box = (max(0, bb[0] - a.pad), max(0, bb[1] - a.pad), min(d.size[0], bb[2] + a.pad), min(d.size[1], bb[3] + a.pad))
    d, alpha = d.crop(box), alpha.crop(box)
    if n:
        n = n.crop(box)
        n_alpha = n_alpha.crop(box) if n_alpha else None
        score = iou(alpha, n_alpha if n_alpha else normal_silhouette(n))
        print(f'{a.id}: 노말 윤곽 겹침 {score:.3f}')
        if score < .9 and not a.force:
            sys.exit(f'{a.id}: 노말맵 윤곽이 디퓨즈와 어긋난다 ({score:.3f} < 0.9). 다시 뽑거나 --force')
    elif a.kind != 'sky' and not a.baked:
        print(f'{a.id}: 노말맵이 없어 자동 노말맵을 만든다')
        n = auto_normal(alpha, d)

    name = a.state or 'base'
    out = os.path.join(SRC, a.id); os.makedirs(out, exist_ok=True)
    rgba = d.convert('RGBA'); rgba.putalpha(alpha)
    rgba.save(os.path.join(out, f'{name}.diffuse.png'))
    if n:
        nn = n.convert('RGBA'); nn.putalpha(alpha); nn.save(os.path.join(out, f'{name}.normal.png'))

    units = tuple(map(float, a.units.split(','))) if a.units else None
    w, h = rgba.size
    if not units and a.kind in ('layer', 'sky'):   # 띠는 원본 밀도 그대로 게임 크기를 정한다
        units = (round(w / SOURCE_PPU, 1), round(h / SOURCE_PPU, 1))
    if units:   # 웹용 크기: 게임 높이 × WEB_PPU (원본보다 키우지 않는다)
        s = min(1.0, units[1] * WEB_PPU / h)
        if units[1] * SOURCE_PPU > h * 1.02:
            print(f'{a.id}: 경고 원본 높이 {h}px 가 4K 기준 {units[1] * SOURCE_PPU:.0f}px 보다 작다')
    else:
        s = min(1.0, 1024 / max(w, h))
    ws = (max(1, round(w * s)), max(1, round(h * s)))
    os.makedirs(WEB, exist_ok=True)
    stem = a.id + (f'@{a.state}' if a.state else '')
    rgba.resize(ws, Image.LANCZOS).save(os.path.join(WEB, stem + '.d.webp'), quality=90, method=6)
    if n:
        nn.resize(ws, Image.LANCZOS).save(os.path.join(WEB, stem + '.n.webp'), quality=94, method=6)

    mpath = os.path.join(WEB, 'manifest.json')
    man = json.load(open(mpath, encoding='utf-8')) if os.path.exists(mpath) else {}
    e = man.get(a.id, {})
    e.update({'w': ws[0], 'h': ws[1], 'kind': a.kind, 'normal': bool(n), 'anchor': list(map(float, a.anchor.split(',')))})
    if units:
        e['units'] = [round(units[1] * w / h, 1), units[1]] if units[0] <= 0 else list(units)
    if a.state:
        e['states'] = sorted(set(e.get('states', [])) | {a.state})
        if units:   # 갈래마다 크기가 다르면 갈래별 높이를 남긴다
            e.setdefault('sh', {})[a.state] = units[1]
    if a.baked:
        e['baked'] = True
    e['v'] = e.get('v', 0) + 1   # 그림이 바뀌면 브라우저 캐시를 피한다
    e.update(json.loads(a.extra))
    man[a.id] = e
    json.dump(man, open(mpath, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
    print(f'{stem}: 원본 {w}x{h}, 웹 {ws[0]}x{ws[1]}')


if __name__ == '__main__':
    main()
