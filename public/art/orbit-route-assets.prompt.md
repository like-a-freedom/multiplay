# Orbit route asset provenance

- Created on: 2026-10-01.
- Mode: built-in `image_gen.imagegen` with `transparent_background: true`.
- Style reference for both assets: `public/art/orbit-mascot.webp` (Orbi). The reference was used for materials, palette and lighting; it was not an edit target in initial generations.
- Assets are original generated 3D illustrations. No photographic or existing spacecraft/planet source was used.
- Workspace processing: Pillow format conversion only, WebP quality 92, method 6. No resizing, recoloring, manual masking, alpha modification, or other manual artwork edit.
- Browser validation: Chromium rendered the saved WebP files against the app's lavender background at 90 px ship width, 125 px planet width, and 210 px planet width alongside Orbi. Complete contours, genuine transparency, clean visible edges, no external glow, and consistent materials were confirmed in the rendered preview.

## Spaceship

- Delivered: `public/art/orbit-ship.webp`, 1536 × 1024 px, RGBA, 134,956 bytes.
- Initial generated source: `/Users/solovey/.codex/generated_images/01a0f688-1621-7fd2-b20a-f1e17ced0efb/exec-cb28dc51-f1c5-44ec-ba2f-884502130a19.png`, 1536 × 1024 px, RGBA, 1,607,160 bytes.
- Selected source after targeted built-in extraction edit: `/Users/solovey/.codex/generated_images/01a0f688-1621-7fd2-b20a-f1e17ced0efb/exec-20a74641-6cbf-4294-8037-178a67f1fe0c.png`, 1536 × 1024 px, RGBA, 1,620,872 bytes.
- Validation after saved WebP readback: alpha extrema 0–254; 874,882 fully transparent pixels; alpha channel preserved exactly from selected PNG. Bounds at alpha ≥128: (52, 93) to (1518, 872).
- Important inspection note: tool RGB previews may show a broad glow in hidden RGB values outside the craft. Sampled outside pixels have alpha 0; these colors are invisible when the image is composited normally by a browser.

### Exact initial generation prompt

```text
Use case: stylized-concept
Asset type: transparent 3D spaceship cutout for an XP adventure route in a multiplication game. This craft will be displayed at 70–84 pixels wide; make the silhouette clean, compact and readable.
Input images: Image 1 is a STYLE REFERENCE ONLY, the existing Orbi robot astronaut mascot. Generate a new spacecraft matching its premium satin clay/ceramic materials, warm cream/mint/coral palette and gentle warm studio key plus cool fill light. Do not depict or edit the robot.
Primary request: ONE polished original compact rounded explorer spacecraft, horizontal silhouette pointing clearly RIGHT, seen from a slight three-quarter upper view. Its cream satin ceramic hull flows around a mint/teal cabin with deep navy glass; two restrained coral-orange fins and small sunny-yellow accents. Short subtle sunny-yellow thruster glow at the LEFT rear. Elegant purposeful adventurous design for a 10-year-old, with physically convincing volume and material.
Scene/backdrop: genuine transparent background. Only the complete craft and a short thruster glow. No floor, cast shadow outside silhouette, background, orbit lines, stars, decorative dust, halo, vignette, moon or planet.
Style/medium: beautifully rendered soft 3D illustration consistent with the reference mascot, tactility of premium handmade ceramic/clay with smooth bevels and restrained seams. Physical form and coherent reflection; compact explorer, not a babyish toy rocket.
Composition/framing: wide-ish landscape canvas, full craft wholly inside frame, level horizontal forward direction to RIGHT. Tight readable scale, approximately 92% of the canvas width occupied by the whole silhouette and no more than 8% transparent margins around its bounds. All fins, nose and rear thruster remain intact. Balanced single isolated subject.
Lighting/mood: soft warm studio key light from upper left, gentle cool fill, restrained highlights and shading, same inviting confident mood as Orbi.
Color palette: warm cream hull, mint #8de2ca/teal cabin, navy #18213a glass, coral #ff8e6b fins, sun #ffd166 glow. Keep accents harmonious and sparse.
Constraints: no face, no robot, no character, no text, no logos, no watermark, no cockpit machinery, no landing gear, no long flame, no harsh black outline, no vector styling, no real-world brand or familiar franchise spaceship. Preserve actual transparency and a clean generous contour. Do not bring the reference mascot into the result.
```

### Exact targeted edit prompt

```text
Use case: background-extraction
Asset type: clean transparent 3D spaceship cutout for an XP route, displayed at 84–90 px wide.
Input images: Image 1 is the EDIT TARGET spaceship. Image 2 is Orbi, a STYLE REFERENCE ONLY; do not include the robot.
Primary request: Remove ONLY the broad soft colored glow and cloudy background around the spaceship. Make every pixel outside the solid ship silhouette fully transparent, except a VERY SHORT tight sunny-yellow thruster flame immediately behind the left rear nozzle. Do not leave any glow around the hull, wings, nose or cockpit. Clean antialiased cutout contour with genuine alpha transparency.
Invariants: Keep the exact spaceship design, horizontal right-pointing orientation, three-quarter upper view, pose, full contour, cream ceramic hull, mint trim, deep navy glass, coral fins, yellow accents, internal material shading and soft studio highlights. Do not redesign the object or recolor it. Keep all edges intact and the full craft inside frame.
Composition: tight full-object framing with transparent margins of at most 8%. The transparent field must be completely empty.
Constraints: no background, no black rectangle, no halo, no external cast shadow, no vignette, no decorative glow, no scene, no stars, no planet, no robot, no text, no watermark. Preserve the premium soft 3D material and light that match Orbi. Change only the extraction and external glow.
```

## Ringed planet

- Delivered: `public/art/orbit-planet.webp`, 1536 × 1024 px, RGBA, 114,674 bytes.
- Generated and selected source: `/Users/solovey/.codex/generated_images/01a0f688-1621-7fd2-b20a-f1e17ced0efb/exec-1af6c970-b218-4567-a099-62b46d2327bc.png`, 1536 × 1024 px, RGBA, 1,769,858 bytes.
- Validation after saved WebP readback: alpha extrema 0–254; 786,018 fully transparent pixels; alpha channel preserved exactly from source PNG. Bounds at alpha ≥128: (26, 78) to (1518, 941).
- Important inspection note: tool RGB previews may show a soft glow in hidden RGB values beyond the rings. Sampled outside pixels have alpha 0; these colors are invisible when the image is composited normally by a browser.

### Exact generation prompt

```text
Use case: stylized-concept
Asset type: transparent ringed planet cutout for a multiplication adventure UI. Usable at 110–130 pixels behind an XP chart and at 210 pixels behind the Orbi mascot.
Input images: Image 1 is a STYLE REFERENCE ONLY, the existing Orbi robot astronaut mascot. Create a new planet matching its premium soft 3D illustration language, satin tactile materials and gentle warm studio key/cool fill lighting. Do not include or edit the robot.
Primary request: ONE polished lavender/lilac ringed world with physically convincing spherical volume. Subtle naturally flowing cloud and atmospheric strata bands wrap around the sphere and follow its curvature. Sophisticated muted lilac variations and a fine satin surface texture; dimensional and credible, not a flat icon or an unrelated photographic planet.
Scene/backdrop: genuine transparent background. The one planet and its rings are the only objects. No stars, moons, spacecraft, sky, nebula, black space backdrop, floor, halo, glow, vignette or words.
Style/medium: premium softly modeled 3D illustration consistent with Orbi, convincing lighting and material with the tactility and restraint of a beautifully crafted clay/ceramic world. Coherent physical sphere with gentle atmospheric details; never a real NASA photograph.
Composition/framing: full sphere and complete coherent rings, centered, entirely inside a wide-ish landscape canvas. Tight readable scale: whole silhouette occupies about 90–92% of canvas width, with no more than 8% transparent margins. Rings pitch diagonally from upper-left to lower-right around the planet. Show the ring behind the sphere where occluded and in front where visible, credible depth and uninterrupted elliptical geometry. All silhouette edges remain intact.
Lighting/mood: gentle warm studio key from upper left, soft cool fill, believable terminator shading on lower right, subtle ring shadow falls onto sphere, restrained premium finish.
Color palette: refined lilac/lavender world around #b9a5fa, softer pale-lilac rings with subtle cream reflections. Navy #18213a only in very subtle shaded depths. Designed for warm lavender #f5f3ff UI. No neon saturation.
Constraints: actual transparent alpha cutout, clean outline, no external glow or baked shadow. Only the ringed planet. No face, no character, no text, no logos, no watermark, no orbit path lines, no harsh outlines, no flat vector design, no toy embellishments, no extra objects. Use the reference only for consistent material and lighting.
```
