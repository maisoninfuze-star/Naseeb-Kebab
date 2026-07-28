#!/usr/bin/env python3
"""Full-menu dish cards: crop each real-shoot frame to a plate-centred square
and recolour the teal plate to warm STONE — in one pass.

The plate recolour is selective HSV (see recolour.py rationale): the teal plate
is the only cyan-to-blue region, so we remap ONLY its hue+saturation and keep
its value channel, so the ceramic keeps every highlight and shadow. A value
floor stops the near-black backdrop from being recoloured. The menu renders
these in circular slots, which crop away the corners anyway.

No AI, no credits: every output pixel is original camera data, only the plate
colour is shifted.
"""
import os, glob
from PIL import Image, ImageFilter, ImageChops, ImageDraw

SRC = '/Users/inder/Claude/Projects/Naseeb Kebab/drive-download-20260721T021114Z-1-001'
OUT = '/Users/inder/Claude/Projects/Naseeb Kebab/menu-v2/cards'
SQ = 900

# Stone recolour params (PIL hue 0-255).
H_LO, H_HI, S_MIN, V_MIN = 96, 156, 28, 46
STONE = (28, 26, 1.18, 26)   # hue, sat, value-gain, value-bias

# card slug -> exact source frame.
#
# Mapping received from the client (Falak) on 2026-07-27 — every former
# VERIFY- guess is now resolved by her list, including several corrections
# where the shoot-day filename was wrong (09528 'ragout-vert' is Dopiaza,
# 09518 'ragout-rouge' is Chicken Tandoori, 09526 'kofta-pulao' is Qorma
# Pulao, 09539 'kofta-ou-aubergine' is Kofta Pulao). Her word overrides the
# filename. The three combo cards are built by composite-cards.py instead
# (rice / thigh compositing) and must not appear here.
CARDS = {
    # Kababs & grillades
    'kobidah-boeuf':  'kobidah-de-boeuf-DSC09456.jpg',
    'kobidah-mixte':  'kobidah-mixte-DSC09435.jpg',
    'kobidah-poulet': 'kobidah-de-poulet-DSC09459.jpg',
    'sultan':         'VERIFY-barg-kabab-ou-plateau-mixte-DSC09444.jpg',
    'mazar':          'VERIFY-poulet-et-kobidah-sultan-ou-mazar-DSC09448.jpg',
    'bamyan':         'VERIFY-poulet-et-barg-mazar-ou-sultan-DSC09451.jpg',
    'kabab-poulet':   'VERIFY-tikka-kabab-ou-kabab-au-poulet-DSC09466.jpg',
    'tikka-kabab':    'tikka-agneau-DSC09482.jpg',
    'chopan':         'chopan-kabab-DSC09475.jpg',
    'chaplee':        'chaplee-kabab-DSC09473.jpg',
    'cuisses':        'cuisses-de-poulet-4x-DSC09439.jpg',
    'barg':           'barg-kabab-DSC09462.jpg',
    'poisson':        'poisson-bassa-DSC09497.jpg',
    # Plats principaux
    'jarret':         'jarret-agneau-qabuli-DSC09508.jpg',
    'biryani':        'biryani-au-poulet-DSC09494.jpg',
    'qorma-pulao':    'kofta-pulao-DSC09526.jpg',
    'dopiaza':        'VERIFY-ragout-vert-qorma-de-veau-ou-sabzi-DSC09528.jpg',
    'kofta-pulao':    'VERIFY-kofta-ou-aubergine-en-sauce-DSC09539.jpg',
    'sabzi-pulao':    'sabzi-pulao-DSC09542.jpg',
    'banjan-burani':  'banjan-burani-DSC09504.jpg',
    'mantu':          'mantu-DSC09515.jpg',
    'ashak':          'ashak-DSC09521.jpg',
    'tandoori':       'VERIFY-ragout-rouge-dopiaza-ou-qorma-DSC09518.jpg',
    # Dessert
    'firni':          'firni-DSC09547.jpg',
}

# All identities confirmed by the client's 2026-07-27 list.
UNVERIFIED = set()


def _otsu(hist):
    """Threshold that best separates the bright dish from the dark slate.

    A fixed threshold misfired on the wide platters — on combo-dostan it
    reported a bounding box spanning the entire frame, because the backdrop's
    own gradient rose above the constant. Otsu picks the split point per photo.
    """
    total = sum(hist)
    sum_all = sum(i * h for i, h in enumerate(hist))
    sumB = wB = best = thr = 0
    for i, h in enumerate(hist):
        wB += h
        if wB == 0:
            continue
        wF = total - wB
        if wF == 0:
            break
        sumB += i * h
        mB, mF = sumB / wB, (sum_all - sumB) / wF
        var = wB * wF * (mB - mF) ** 2
        if var > best:
            best, thr = var, i
    return thr


def plate_bbox(im):
    small = im.convert('L').resize((im.width // 16, im.height // 16)).filter(ImageFilter.MedianFilter(5))
    # drop a little below the Otsu split so the darker plate rim is included
    thr = max(8, int(_otsu(small.histogram()) * 0.80))
    bb = small.point(lambda p: 255 if p > thr else 0).getbbox()
    return tuple(v * 16 for v in bb) if bb else (0, 0, im.width, im.height)


def ground_canvas(im):
    """A square backdrop built from the photo's OWN ground.

    A flat fill left a visible rectangle on the sultan/mazar frames, whose
    backdrop vignettes noticeably across the frame — one average tone cannot
    match both the middle and the corners. Blurring a cover-resized copy of the
    source reproduces that falloff and the slate texture, so the pasted dish has
    nothing to seam against. Darkened slightly so it stays behind the food.
    """
    w, h = im.size
    s = max(SQ / w, SQ / h)
    bg = im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    l, t = (bg.width - SQ) // 2, (bg.height - SQ) // 2
    bg = bg.crop((l, t, l + SQ, t + SQ)).filter(ImageFilter.GaussianBlur(SQ / 14))
    return bg.point(lambda p: int(p * 0.72))


def fit_square(path, fit=0.97, margin=1.02):
    """Fit the WHOLE dish inside the card's inscribed circle.

    Cropping a square out of the frame cannot work for the wide platters: the
    dish is up to 1.5x wider than the source is tall, so any square crop is
    narrower than the dish and the circle slices the ends off. Instead the dish
    is scaled so its longest side spans `fit` of the card, then centred on a
    canvas filled with the photo's own ground — the rectangle's edges feathered
    so the join is invisible. Nothing is cut.
    """
    im = Image.open(path).convert('RGB')
    x0, y0, x1, y1 = plate_bbox(im)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    bw, bh = (x1 - x0) * margin, (y1 - y0) * margin
    l, t = max(0, cx - bw / 2), max(0, cy - bh / 2)
    r, b = min(im.width, cx + bw / 2), min(im.height, cy + bh / 2)
    dish = im.crop((int(l), int(t), int(r), int(b)))

    scale = (SQ * fit) / max(dish.width, dish.height)
    nw, nh = max(1, round(dish.width * scale)), max(1, round(dish.height * scale))
    dish = dish.resize((nw, nh), Image.LANCZOS)

    feather = max(4, int(min(nw, nh) * 0.035))
    alpha = Image.new('L', (nw, nh), 0)
    ImageDraw.Draw(alpha).rectangle((feather, feather, nw - 1 - feather, nh - 1 - feather), fill=255)
    alpha = alpha.filter(ImageFilter.GaussianBlur(feather * 0.6))

    canvas = ground_canvas(im)
    canvas.paste(dish, ((SQ - nw) // 2, (SQ - nh) // 2), alpha)
    return canvas


def to_stone(img):
    hue, sat, vgain, vbias = STONE
    h, s, v = img.convert('HSV').split()
    hue_mask = h.point(lambda p: 255 if H_LO <= p <= H_HI else 0)
    sat_mask = s.point(lambda p: 255 if p >= S_MIN else 0)
    val_mask = v.point(lambda p: 255 if p >= V_MIN else 0)
    mask = ImageChops.multiply(ImageChops.multiply(hue_mask, sat_mask), val_mask)
    mask = mask.filter(ImageFilter.GaussianBlur(2.2))
    h2 = Image.composite(Image.new('L', img.size, hue), h, mask)
    s2 = Image.composite(Image.new('L', img.size, sat), s, mask)
    v2 = Image.composite(v.point(lambda p: max(0, min(255, int(p * vgain + vbias)))), v, mask)
    return Image.merge('HSV', (h2, s2, v2)).convert('RGB')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    missing, done = [], 0
    for slug, fname in CARDS.items():
        p = os.path.join(SRC, fname)
        if not os.path.exists(p):
            missing.append((slug, fname)); continue
        fit_square(p).save(os.path.join(OUT, f'{slug}.png'))   # original colours (client, 2026-07-27)
        flag = '  (identity UNVERIFIED)' if slug in UNVERIFIED else ''
        print(f'  {slug:<15} <- {fname}{flag}')
        done += 1
    print(f'\n  {done} stone cards -> {OUT}')
    for slug, fname in missing:
        print(f'  MISSING  {slug}: {fname}')
