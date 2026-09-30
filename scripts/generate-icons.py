#!/usr/bin/env python3
"""PWA icons for "Умножайка" (palette and motif from DESIGN.md).

Dark space background, a thin orbit, a golden achievement star.
Run: python3 scripts/generate-icons.py (requires Pillow).
"""

import math
from PIL import Image, ImageDraw

SPACE = (0x0B, 0x10, 0x20)
SPACE_RAISED = (0x15, 0x1F, 0x36)
ORBIT = (0x64, 0x74, 0x8B)
GOLD = (0xF9, 0xBA, 0x43)
DOT = (0xF7, 0xFA, 0xFF)

SUPersample = 3  # antialiasing by downsampling


def lerp(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def star_points(cx, cy, outer, rotation_deg=-90, inner_ratio=0.48):
    points = []
    for i in range(10):
        radius = outer if i % 2 == 0 else outer * inner_ratio
        angle = math.radians(rotation_deg + i * 36)
        points.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    return points


def draw_icon(size, safe_zone=False):
    """safe_zone=True ужимает мотив к центру — для maskable-иконки."""
    scale = 0.66 if safe_zone else 1.0
    s = size * SUPersample
    image = Image.new("RGB", (s, s))
    for y in range(s):
        for_row = lerp(SPACE, SPACE_RAISED, y / s)
        image.paste(Image.new("RGB", (s, 1), for_row), (0, y))

    # Orbit: a ring tilted by -18°.
    orbit = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    od = ImageDraw.Draw(orbit)
    radius = s * 0.34 * scale
    width = max(round(s * 0.012), 3)
    od.ellipse(
        (s / 2 - radius, s / 2 - radius * 0.62, s / 2 + radius, s / 2 + radius * 0.62),
        outline=ORBIT + (255,),
        width=width,
    )
    orbit = orbit.rotate(-18, resample=Image.BICUBIC)
    image.paste(orbit, (0, 0), orbit)

    # Two distant light dots.
    layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    for px, py in ((0.24, 0.28), (0.76, 0.70)):
        dot = s * 0.014
        cx = s / 2 + (px - 0.5) * s * scale
        cy = s / 2 + (py - 0.5) * s * scale
        ld.ellipse((cx - dot, cy - dot, cx + dot, cy + dot), fill=DOT + (255,))

    # The achievement star.
    ld.polygon(star_points(s / 2, s / 2, s * 0.19 * scale), fill=GOLD + (255,))
    image.paste(layer, (0, 0), layer)

    return image.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    targets = [
        ("public/pwa-512x512.png", 512, False),
        ("public/pwa-192x192.png", 192, False),
        ("public/apple-touch-icon.png", 180, False),
    ]
    for path, size, safe in targets:
        draw_icon(size, safe).save(path)
        print("wrote", path)

    draw_icon(512, safe_zone=True).save("public/pwa-512x512-maskable.png")
    print("wrote public/pwa-512x512-maskable.png")
