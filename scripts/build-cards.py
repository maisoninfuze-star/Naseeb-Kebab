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
from PIL import Image, ImageFilter, ImageChops

SRC = '/Users/inder/Claude/Projects/Naseeb Kebab/drive-download-20260721T021114Z-1-001'
OUT = '/Users/inder/Claude/Projects/Naseeb Kebab/menu-v2/cards'
SQ = 900

# Stone recolour params (PIL hue 0-255).
H_LO, H_HI, S_MIN, V_MIN = 96, 156, 28, 46
STONE = (28, 26, 1.18, 26)   # hue, sat, value-gain, value-bias

# card slug -> exact source frame (chosen for clean framing / confirmed identity)
CARDS = {
    # Starters (small-portion vessels share the main-dish frames)
    'ashak':          'ashak-DSC09520.jpg',
    'mantu':          'mantu-DSC09512.jpg',
    'banjan-burani':  'banjan-burani-DSC09504.jpg',
    'qorma':          'qorma-de-poulet-DSC09532.jpg',
    # Kababs & grillades
    'kobidah-boeuf':  'kobidah-de-boeuf-DSC09454.jpg',
    'kobidah-mixte':  'kobidah-mixte-DSC09435.jpg',
    'kobidah-poulet': 'kobidah-de-poulet-DSC09458.jpg',
    'cuisses':        'cuisses-de-poulet-4x-DSC09437.jpg',
    'jarret':         'jarret-agneau-qabuli-DSC09508.jpg',
    'biryani':        'biryani-au-poulet-DSC09492.jpg',
    'poisson':        'poisson-bassa-DSC09496.jpg',
    'sultan':         'VERIFY-plateau-mixte-sultan-ou-mazar-DSC09430.jpg',
    'mazar':          'VERIFY-plateau-mixte-sultan-ou-mazar-DSC09433.jpg',
    'kabab-poulet':   'VERIFY-tikka-kabab-ou-kabab-au-poulet-DSC09467.jpg',
    'tikka-kabab':    'barg-kabab-DSC09462.jpg',        # filet mignon skewer
    'tikka-agneau':   'tikka-agneau-DSC09480.jpg',
    'chopan':         'chopan-kabab-DSC09475.jpg',
    'chaplee':        'chaplee-kabab-DSC09470.jpg',
    # Currys & ragoûts
    'qorma-pulao':    'qorma-pulao-DSC09534.jpg',
    'dopiaza':        'VERIFY-ragout-rouge-dopiaza-ou-qorma-DSC09516.jpg',
    'kofta-pulao':    'kofta-pulao-DSC09524.jpg',
    'sabzi-pulao':    'sabzi-pulao-DSC09540.jpg',
    # Platters
    'combo-dostan':   'VERIFY-grand-plateau-mixte-sultan-mazar-ou-combo-DSC09485.jpg',
    'combo-naseeb':   'VERIFY-grand-plateau-mixte-avec-riz-DSC09489.jpg',
    'combo-watan':    'VERIFY-grand-plateau-mixte-sultan-mazar-ou-combo-DSC09486.jpg',
    # Dessert
    'firni':          'firni-DSC09544.jpg',
}

# identity not owner-confirmed — safe to show as generic, must not be relabelled
UNVERIFIED = {'sultan', 'mazar', 'kabab-poulet', 'tikka-kabab', 'dopiaza',
              'combo-dostan', 'combo-naseeb', 'combo-watan'}


def plate_bbox(im, thresh=46):
    small = im.convert('L').resize((im.width // 16, im.height // 16)).filter(ImageFilter.MedianFilter(5))
    bb = small.point(lambda p: 255 if p > thresh else 0).getbbox()
    return tuple(v * 16 for v in bb) if bb else (0, 0, im.width, im.height)


def square_crop(path, pad=1.06):
    im = Image.open(path).convert('RGB')
    x0, y0, x1, y1 = plate_bbox(im)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    side = min(max(x1 - x0, y1 - y0) * pad, im.height)
    l = max(0, min(im.width - side, cx - side / 2))
    t = max(0, min(im.height - side, cy - side / 2))
    return im.crop((int(l), int(t), int(l + side), int(t + side))).resize((SQ, SQ), Image.LANCZOS)


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
        to_stone(square_crop(p)).save(os.path.join(OUT, f'{slug}.png'))
        flag = '  (identity UNVERIFIED)' if slug in UNVERIFIED else ''
        print(f'  {slug:<15} <- {fname}{flag}')
        done += 1
    print(f'\n  {done} stone cards -> {OUT}')
    for slug, fname in missing:
        print(f'  MISSING  {slug}: {fname}')
