# Orbit galaxy and knowledge-star assets

- Created on: 2026-10-01.
- Generation mode: built-in `image_gen.imagegen`; three separate calls.
- Style references inspected before generation: `public/art/orbit-mascot.webp`, `public/art/orbit-planet.webp`, and `public/art/orbit-ship.webp`.
- Orbi, planet and ship were style references, not objects to include. The idle star used the generated earned star as its edit target.
- All assets are newly generated original illustrations. No NASA photography, existing icon set, or third-party galaxy/achievement artwork was used.
- Workspace processing: Pillow WebP format conversion only, quality 92, method 6. No crop, resize, manual recoloring, masking, alpha editing, or other artwork modification.

## Delivered files and validation

| Asset | Source dimensions and mode | Source bytes | Delivered bytes | Alpha |
| --- | --- | ---: | ---: | --- |
| `public/art/orbit-star-earned.webp` | 1254 × 1254 px, RGBA | 928,698 | 99,090 | Extrema 0–255; 845,330 fully transparent pixels; source alpha preserved exactly |
| `public/art/orbit-star-idle.webp` | 1254 × 1254 px, RGBA | 851,791 | 82,372 | Extrema 0–255; 840,181 fully transparent pixels; source alpha preserved exactly |
| `public/art/orbit-galaxy.webp` | 1254 × 1254 px, RGB | 1,891,786 | 164,386 | Fully opaque RGB backdrop |

The saved files were read back after conversion. Source dimensions are unchanged.

Chromium preview confirmed clean transparent contours and readable five-point silhouettes at 14, 24 and 40 px on lavender #f5f3ff, navy #202741 and white. The opaque galaxy was inspected at 420 px alongside the style-reference assets. No progression or user data was accessed or changed.

Star silhouette comparison at alpha ≥128: earned bounds (52, 65) to (1201, 1154); idle bounds (51, 65) to (1203, 1155). Silhouette intersection-over-union: 99.3615%. The edit preserved the visible form and framing within 2 source pixels, under 0.07 display pixels at 40 px. Geometry is visually matched, not pixel-identical. Mean perceived luminance of visible surface pixels: earned 200.46; idle 197.93 (0–255 range). Color clearly separates gold earned state from lavender idle state.

The galaxy contains cloud atmosphere only, with no baked data-star sprites, text, constellation paths or foreground objects. All actual knowledge markers and their state must remain app-controlled.

## Earned star

Generated source: `/Users/solovey/.codex/generated_images/01a0f688-1621-7fd2-b20a-f1e17ced0efb/exec-8ac4b84c-d086-472b-b832-cc879119b90b.png`

Tool arguments: `transparent_background: true`; references were Orbi, planet and ship.

### Exact generation prompt

```text
Use case: stylized-concept
Asset type: transparent earned-knowledge star sprite, displayed at 14–40 px in a child's multiplication adventure world.
Input images: Images 1, 2 and 3 are STYLE REFERENCES ONLY: Orbi astronaut robot, its lavender ringed planet and cream/mint explorer ship. Match their premium satin ceramic/clay softness, dimensional studio lighting and restrained finish. Do not include those objects.
Primary request: ONE polished achievement star with exactly FIVE rounded points. Conventional recognizable five-point star silhouette, upright with a single top point, generous deep valleys between points, smooth gently rounded tips and edges. Front-on symmetrical view, only very slight 3D thickness and softly convex surface. Sunny-gold #ffd166 ceramic material with a subtle warm cream highlight, luminous through light reflecting on satin material, not emitting external glow.
Scene/backdrop: genuine transparent cutout. The star is the only object; every pixel beyond its antialiased contour is transparent. No external halo, cast shadow, rays, glitter, sparkles, ornament or background.
Style/medium: original premium soft 3D ceramic/clay illustration, tactile satin surface, understated beautiful craft, the same world as Orbi. Simple and recognizable at tiny sizes. No metal badge or flat vector icon.
Composition/framing: square canvas, complete centered upright star, same center on both axes. Whole silhouette intact with tight framing, 4–6% transparent margin on all sides, no clipping. No tilt, no rotation in image plane, no skew, no deep extrusion.
Lighting: coherent soft warm studio key from upper-left and gentle cool lilac fill, broad subtle highlight, dimensional but low-detail face. Avoid dramatic contrast.
Constraints: exactly five points, one star only, no face, eyes, embossed symbol, text, numbers, logos, watermark, extra sparkles, spiky rays, hard black outline, realistic metal, planets, astronaut or spaceship. Actual transparency. Preserve a clean simple silhouette suitable for 14 px use.
```

## Idle star

Generated source: `/Users/solovey/.codex/generated_images/01a0f688-1621-7fd2-b20a-f1e17ced0efb/exec-7d837c1a-18fe-41d0-a747-0d9b41bb6121.png`

Tool arguments: `transparent_background: true`; edit target was the earned-star source PNG.

### Exact material-variant edit prompt

```text
Use case: precise-object-edit
Asset type: transparent idle-knowledge star material variant, displayed at 14–40 px beside the earned star.
Input image: Image 1 is the EDIT TARGET earned gold ceramic five-point star. Use this exact object, unchanged geometry and framing.
Primary request: Change ONLY its sunny-gold surface material and brightness into softly unlit satin pale-lavender ceramic, with muted lilac edges and gentle cool shading. The idle state has clearly lower brightness and quieter highlights than the earned sunny-gold version, but remains a solid readable pale-lavender volume on both deep navy #202741 and white backgrounds. Keep understated diffuse cream/lilac reflection, no hot golden highlights or bright emission.
Strict invariants: EXACT same five-point silhouette, all contour curves, point lengths, valley depths, slight 3D thickness, convex form, orientation, upright front-on pose, camera perspective, image center, canvas size and transparent margins as the input. Do not reshape, rotate, scale, reposition or re-render a different star. No geometric changes. The material lighting remains soft upper-left studio light with cool lilac fill.
Scene/backdrop: genuine transparent alpha cutout, only the star. Preserve transparency; background outside the contour stays empty.
Constraints: remove all sunny gold, orange and yellow material. No metallic gray, no flat vector, no face, eyes, symbols, embossed icons, text, glitter, additional sparkles, rays, halo, external glow, cast shadow, logos or watermark. Keep the same premium soft 3D ceramic/clay world as the original and Orbi. Change only color/material/brightness.
```

## Galaxy backdrop

Generated source: `/Users/solovey/.codex/generated_images/01a0f688-1621-7fd2-b20a-f1e17ced0efb/exec-944da25d-177c-44f4-8451-7a64c955d0c4.png`

Tool arguments: `transparent_background: false`; references were Orbi, planet and ship.

### Exact generation prompt

```text
Use case: stylized-concept
Asset type: square full-bleed illustrated galaxy backdrop for a child's multiplication adventure knowledge map. The application will overlay all 66 actual knowledge-star markers and constellation paths, so this image must contain NO stars or foreground symbols.
Input images: Images 1, 2 and 3 are STYLE REFERENCES ONLY: Orbi astronaut robot, the lavender ringed planet and the cream/mint explorer ship. Match their premium softly modeled satin 3D illustration language, tactile restrained materials, coherent studio lighting and lilac/mint/cream palette. Do not include any of those objects.
Primary request: ONE original dreamy softly sculpted spiral galaxy, illustrated as broad dimensional satin cloud ribbons and soft dust forming subtle spiral sweeps around the center in a deep navy #202741 square field. A coherent flowing world atmosphere, gently layered cloud volume and depth, refined and calm. Muted lilac, a trace of mint, warm cream reflected light, all subdued against the dark navy world.
Scene/backdrop: square nontransparent full-bleed background; no border, card, frame or baked UI. Even quiet dark center and outer field remain usable for overlaid map markers and small chart labels. The spiral is broad and understated, the ribbons softened and atmospheric; avoid a bright glowing nucleus or hard delineated orbit bands.
Style/medium: premium original soft 3D illustration, physical satin cloud/ribbon forms with the tactile material finish and gentle lighting of Orbi and the ringed world. Sophisticated gameworld backdrop with restrained contrast. Not an astronomical photograph, NASA photo or vector graphic.
Composition/framing: subtle spiral structure fills the square naturally; a broad calm center occupies roughly the central third, with soft cloud ribbons sweeping around it. Leave dispersed quiet navy areas throughout rather than dense busy texture. No focal foreground objects. No cropping border.
Lighting/mood: subdued warm cream light grazing the dimensional lilac ribbons from upper-left, cool mint/lilac fill, deep navy ambient shadows, gentle inviting adventure. All glow broad and low-intensity, no dazzling light. Material and atmosphere feel polished, coherent and calm.
Constraints: ZERO separate star-shaped badges, ZERO glitter dots, ZERO bright pinpoint stars, ZERO luminous speckles. No star field, constellations, symbols, text, numbers, icons, astronaut, robot, spaceship, planet, moon, comet or foreground object. No neon, flashy cosmic explosion, lens flare, luminous nucleus, hard vector rings, metal effects, watermark or logo. The app supplies every data star; the backdrop supplies only quiet sculptural galaxy atmosphere. Entire image opaque.
```
