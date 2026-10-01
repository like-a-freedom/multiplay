# Idle-star contrast revision

- Created on: 2026-10-01.
- Requested change: replace the lavender idle sprite with cool ice-white / ivory ceramic and mint/cyan shaded edges, so unopened knowledge stars remain distinct from the lilac galaxy and gold earned stars.
- Provider and mode: built-in `image_gen.imagegen`, one local-image edit call, `transparent_background: true`. No CLI or API fallback was used.
- Edit target at call time: `public/art/orbit-star-idle.webp`, previous lavender sprite, 1254 × 1254 px RGBA, 82,372 bytes.
- Original generation source of previous target: `/Users/solovey/.codex/generated_images/01a0f688-1621-7fd2-b20a-f1e17ced0efb/exec-7d837c1a-18fe-41d0-a747-0d9b41bb6121.png`.
- Style references inspected: `public/art/orbit-star-earned.webp` and `public/art/orbit-mascot.webp`. Both were references only.
- New generated source: `/Users/solovey/.codex/generated_images/01a0f688-1621-7fd2-b20a-f1e17ced0efb/exec-6667de18-338e-43e6-9d25-da8fd10cb817.png`, 1254 × 1254 px RGBA PNG, 848,540 bytes.
- Delivered replacement: `public/art/orbit-star-idle.webp`, 1254 × 1254 px RGBA WebP, 83,576 bytes.
- Workspace processing: Pillow WebP format conversion only, quality 92, method 6. No crop, resize, manual recolor, alpha modification or mask editing.

## Validation

The decoded saved WebP was read back and inspected. Its alpha channel matches the new generated PNG exactly: extrema 0–255, with 834,718 fully transparent pixels. All background pixels remain transparent and the standalone browser rendering shows no emitted halo or external rays.

The new star keeps the same upright rounded five-point form and framing. At alpha ≥128, previous bounds were (51, 65) to (1203, 1155); replacement bounds are (50, 64) to (1204, 1156). Silhouette intersection-over-union is 99.36198%. The edit differs by one source pixel at each bound, under 0.032 display pixels at 40 px. The geometry is visually matched; it is not pixel-identical to the prior generated sprite.

Mean visible surface RGB is approximately (197.89, 230.75, 234.02), confirming the cool cyan/ivory direction. The replacement contains no purple material or warm gold material, and its nonmetallic satin volume remains consistent with Orbi.

A standalone rendering comparison at 14, 24 and 40 px on lavender #f5f3ff, navy #202741 and the actual galaxy clouds confirmed clean contours, distinguishable five-point silhouettes and an immediately distinct cool white/mint state beside the gold earned state. CUA browser inventory was unavailable in this asset-producer session, so this temporary isolated preview used headless Chromium. It did not load the app or access progression/user data. The temporary preview server was stopped after inspection.

Only the requested idle sprite and this provenance document were written in the repository. Product code, other documents and tests were not edited.

## Exact edit prompt

```text
Use case: precise-object-edit
Asset type: transparent idle-knowledge star sprite displayed at 14–40 px in a multiplication adventure map. It must stand apart from a lilac cloud galaxy while remaining visually distinct from the warm gold earned star.
Input images: Image 1 is the EDIT TARGET current lavender idle star. Image 2 is the earned star, a FORM AND MATERIAL STYLE REFERENCE ONLY. Image 3 is Orbi, a SOFT CERAMIC MATERIAL AND LIGHTING REFERENCE ONLY. Do not include the earned star or robot as extra objects.
Primary request: Change ONLY the surface material/color of the current idle star from lavender into quiet cool ivory / ICE WHITE. Body color near #edfaff or #e4faf7 with cool mint/cyan shaded edges near #80bbbd. A softly modeled ice-white satin ceramic star, gently illuminated from the upper left, with enough mint/cyan dimensional edge shading for its five-point silhouette to remain visible on lilac galaxy clouds and deep navy #202741. The center is bright cool ivory, not gray, with calm broad satin reflections. The cool white and mint appearance is immediately distinct from the earned sunny-gold sprite.
Strict invariants: Preserve the EXACT five-point silhouette, rounded contour, valley depths, point lengths, very slight thickness, softly convex form, upright front-on pose, center, camera framing, scale, source canvas dimensions, and all transparent margins. Do not change its geometry, orientation, position, size, cropping or perspective. Preserve empty transparency outside the antialiased contour. One star only.
Material and lighting: Premium tactile nonmetallic satin ceramic/clay, same gentle upper-left studio key and soft cool fill as Orbi. Quiet unopened-state material, no platinum or silver-metal appearance, no mirror reflections, no dramatic gloss. Clear coherent volume at tiny sprite scale.
Scene/backdrop: genuinely transparent alpha cutout. Nothing outside the star silhouette; no halo, rays, emitted light, external shadow, or background.
Color constraints: NO lavender, purple, lilac or violet anywhere on the star. NO warm yellow, orange or gold. Use ice-white ivory body and cool mint/cyan edges only. Do not simply desaturate into gray. No fluorescent neon.
Other constraints: no text, face, eyes, logo, watermark, embossed symbol, inset icon, sparkles, badge rim, decorative outline, additional objects or artifacts. Keep the exact original shape and framing. Change color/material only; preserve actual transparency.
```
