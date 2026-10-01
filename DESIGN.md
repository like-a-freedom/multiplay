---
name: "Умножайка — Orbit Club"
description: "A lavender multiplication adventure with Orbi, a calm clay astronaut companion."
colors:
  space: "#f5f3ff"
  space-raised: "#ffffff"
  paper: "#ffffff"
  white: "#ffffff"
  ink: "#18213a"
  ink-muted: "#60617a"
  on-space: "#18213a"
  action: "#ffd166"
  action-pressed: "#ffc34a"
  on-action: "#18213a"
  focus: "#6552bd"
  focus-on-space: "#6552bd"
  streak: "#ffd166"
  star: "#ffd166"
  star-highlight: "#fff0ba"
  star-edge: "#a36b0e"
  star-idle: "#727b9b"
  success: "#16745d"
  success-surface: "#e3f6ed"
  review-surface: "#fff3dd"
  review-ink: "#704900"
  review-outline: "#946200"
  error: "#b42335"
  control-outline: "#8a88a1"
  divider: "#e0ddef"
  shadow: "rgb(41 31 88 / .10)"
  cosmos: "#202741"
  cosmos-soft: "#303955"
  on-cosmos: "#faf8ff"
  lilac: "#b9a5fa"
  lilac-soft: "#ede7ff"
  mint: "#8de2ca"
  mint-soft: "#e0f6ee"
  coral: "#ff8e6b"
typography:
  display:
    fontFamily: "Nunito, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 8vw, 3.25rem)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-.04em"
  question:
    fontFamily: "Nunito, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "clamp(2rem, 11vw, 3.5rem)"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-.025em"
  title:
    fontFamily: "Nunito, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-.03em"
  body:
    fontFamily: "Nunito, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "Nunito, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: ".875rem"
    fontWeight: 600
    lineHeight: 1.4
  button:
    fontFamily: "Nunito, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 900
    lineHeight: 1.3
rounded:
  control: "18px"
  card: "28px"
  badge: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "16px 24px"
  button-primary-hover:
    backgroundColor: "{colors.action-pressed}"
  button-primary-active:
    backgroundColor: "{colors.action-pressed}"
  button-primary-disabled:
    backgroundColor: "{colors.divider}"
    textColor: "{colors.ink-muted}"
  button-launch:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "16px 24px"
    width: "100%"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.divider}"
  question-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  question-card-correct:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.ink}"
  question-card-review:
    backgroundColor: "{colors.review-surface}"
    textColor: "{colors.ink}"
  answer-field:
    backgroundColor: "{colors.space}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    width: "100%"
  streak-chip:
    backgroundColor: "{colors.streak}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.badge}"
    padding: "8px 12px"
  navigation:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "8px"
    width: "100%"
  navigation-current:
    backgroundColor: "{colors.lilac-soft}"
    textColor: "{colors.focus}"
    rounded: "{rounded.control}"
  knowledge-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
  galaxy:
    backgroundColor: "{colors.cosmos}"
    textColor: "{colors.on-cosmos}"
    rounded: "{rounded.card}"
    padding: "24px"
  xp-award:
    backgroundColor: "{colors.lilac-soft}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.control}"
    padding: "16px"
  xp-route:
    backgroundColor: "{colors.lilac-soft}"
    textColor: "{colors.on-space}"
    typography: "{typography.label}"
    rounded: "24px"
    width: "100%"
---

# Design System: Умножайка — Orbit Club

## Overview

**Creative North Star: "Orbit Club"**

Orbit Club is a small, welcoming space adventure for one ten-year-old. Lavender daylight, rounded Cyrillic lettering and the original mint-and-cream clay astronaut Orbi make returning feel friendly. The product name remains «Умножайка». Orbi is the companion, not a scorekeeper: uncertainty receives help, and earned knowledge remains the child's achievement.

The world has a deliberate change of pace. Welcome, home and mission completion carry the illustrated planet and playful effects. Recall is quiet: one large equation, one native input and one clear next action. The knowledge atlas opens a darker galaxy, where stars represent actual multiplication facts. XP and permanent knowledge stars keep separate visual explanations.

**Key Characteristics:**

- Lavender daylight with a dark, readable knowledge galaxy.
- Original clay companion and rounded, locally hosted Nunito lettering.
- Generous rounded controls and a single phone-sized column.
- Native Inspira interactions with complete touch, keyboard and static alternatives.
- Encouraging feedback that keeps learning separate from game rewards.

This document records the implemented replacement world. `PRD.md` owns learning and reward calculations; presentation does not redefine them. The CSS source is `src/presentation/styles/tokens.css`, shared layout is in `base.css`, and native adaptations live under `components/inspira/`. The sidecar adds previews, depth, motion and narrative; its synthesized tonal strips are preview aids, not additional application tokens.

## Colors

Soft, playful accents surround deep navy text. Gold marks invitation and achievements; green and amber provide calm, explicit answer feedback. The frontmatter uses the actual CSS token names and values.

### Primary

- **Lavender daylight** (`space`) is the page background. **Lilac** and **soft lilac** color the planet, orbits, XP summaries and selected navigation.
- **Deep violet focus** (`focus`, `focus-on-space`) identifies keyboard focus and text links independently of decorative lilac.
- **Launch gold** (`action`, `action-pressed`, `on-action`) is the primary action material, with a warmer pressed state and navy text.

### Secondary

- **Companion mint** (`mint`, `mint-soft`) belongs to the friendly world and supporting surfaces. **Success green** and its **soft success surface** belong to confirmed answers with «Верно» and a check.
- **Clay coral** (`coral`) is a small illustration accent, not a wrong-answer signal.
- **Review amber** (`review-surface`, `review-ink`, `review-outline`) supports «Разберём вместе» and «Посмотрим подсказку»: explanation rather than a red failure surface.

### Tertiary

- **Knowledge gold** (`star`) colors the native gauge arc, XP waypoints and finite celebration accents. **Star highlight** colors reveal lines and waypoint highlights; **star edge** borders the newly opened-star notice. **Future-star slate** (`star-idle`) outlines XP route waypoints. These UI tokens do not recolor the generated knowledge-star sprites: their gold and pale-lilac material states are separate local artwork.
- **Streak gold** (`streak`) keeps an explicit day label. Gold alone never makes a streak, XP and knowledge interchangeable.
- **Input error** (`error`) is reserved for malformed input and explicit storage-error treatment.

### Neutral

- **Navy ink** (`ink`, `on-space`, `on-action`) and **muted ink** (`ink-muted`) distinguish primary and supporting text on light surfaces.
- **Paper** (`paper`, `white`, `space-raised`) is the white card/control plane. **Divider** is a quiet separator; meaningful input edges use **control outline** instead.
- **Cosmos** and **soft cosmos** form the dark atlas, opaque central gauge disc and gauge track; **on-cosmos** supplies light text. A cosmos veil at opacity .48 subdues the generated galaxy plate so the real knowledge markers remain prominent.
- **Shadow tint** separates surfaces without signaling learning state.

**The Answer Has Words Rule.** Every answer state keeps a visible explanation: «Верно», «Разберём вместе» or «Посмотрим подсказку». Color never carries the result alone.

**The Separate Journeys Rule.** XP shows effort and level travel. Knowledge stars show permanent achievements for individual facts. Never imply that one buys or converts into the other.

## Typography

**Display Font:** Nunito with the system fallback stack in the frontmatter.
**Body Font:** the same Nunito family. Latin and Cyrillic variable WOFF2 files are local, cover weights 400–900 and use `font-display: swap`; retain their license.

Rounded letterforms provide warmth without reducing clarity. Headings and equations use the heavy end of the family; body copy stays comfortably weighted. Use real Russian strings, sentence case and tabular numerals for equations, XP and answers.

### Hierarchy

- **Display:** the responsive `display` role for welcome and home invitations, with balanced short lines.
- **Question:** the responsive `question` role for the centered equation, with tabular figures. Summary prose returns to title scale.
- **Title:** the `title` role for screen and finish headings. Compact mission/home branding has smaller local headings, not another font system.
- **Body:** the `body` role for instructions, answers and explanations; the global weight is 600, while strong feedback uses 900.
- **Label:** the `label` role for field labels, streaks and supporting copy. Navigation and supporting headings use heavier weights where implemented.
- **Button:** the `button` role for primary actions; secondary actions keep its size with weight 800.

**The One Lettering Rule.** Use the local Nunito family for display, controls and learning content. Let role, weight and scale provide hierarchy.

Let labels wrap and surfaces grow at 200% text size. The empty answer hint stays inside its input surface: a non-interactive wrapping overlay preserves the native placeholder and accessible description. Do not disable pinch-to-zoom or shrink the 0–100 hint to fit.

## Layout

Screens use one centered column, at most 460px wide. Page padding includes all four safe-area insets: `lg` horizontally and at the top, `xl` at the bottom. Shared screen gaps are `xl`; home and finish use `lg` internally. At 700px and above, top page spacing becomes `xxl`; the column remains compact. The XP route heading stacks at 360px and below.

Use the frontmatter spacing scale. Main cards commonly use `xl` padding; supporting surfaces use `lg`, action groups a `md` gap. The full planet scene is 264px high and compact finish scene 190px high. The generated planet is contained in a 210 × 210px image box, or 145 × 145px for compact scenes, preserving its native aspect ratio. The small companion cue has a 54px illustration and copy up to 28ch. The finish composition is open page content, not another rounded container that clips heading text.

Every action keeps at least a 48 × 48 CSS-pixel target. Minimum heights: ordinary primary 60px, launch 64px, secondary 52px, native answer input 72px. These are minimums, not fixed heights. Dock targets stay stable while icons magnify; navigation never requires hover.

The page scrolls with the native keyboard. Use `type="text" inputmode="numeric"`, a visible label and accessible help; keep field and next action reachable above the home indicator. No custom keypad, required swipe or precision drag. Dock stays in normal page flow on home, map and adult report, and is absent during recall and the introductory check.

Cache readiness appears below content and Dock. Updates appear between lessons. Failed saves remain explicit and actionable. Avoid moving practice controls when asynchronous status appears.

## Elevation & Depth

Depth combines clay illustration shading, diffuse shadows, tonal surfaces and tactile inset gold. Decorative rings, pointer spotlight and native conic shimmer belong to this world; their lighting does not extend behind every sentence.

### Shadow Vocabulary

- **Card:** `--shadow-card`, or `0 12px 36px var(--color-shadow)`, separates the white invitation and question plane.
- **Action:** `--shadow-action`, or `0 6px 14px rgb(179 122 22 / .16), inset 0 -3px 5px rgb(170 101 0 / .12)`, gives the primary control material depth. Launch adds its own inset surface.
- **Navigation:** `0 8px 24px var(--color-shadow)` lifts the Dock. Answer-result cards add green or amber inset outlines for state.
- **Galaxy:** `0 12px 32px rgb(32 39 65 / .18)` separates the atlas from daylight.

**The Quiet Recall Rule.** During recall, the equation, input and stable actions receive the attention. Keep the large floating scene and ambient particles on illustrated welcome, home, map and completion regions.

The XP route's brief beam and flare are finite reward feedback, not a resting shadow vocabulary. Hover and motion never hide required content.

## Shapes

Soft rounded rectangles define controls: `control` for fields, feedback and actions, `card` for invitation/question/atlas surfaces, `badge` for short capsules. Circles, rings and the shaded planet define illustration. Keep them distinct from the rectangular touch controls.

Knowledge stars are the original generated `public/art/orbit-star-earned.webp` and `public/art/orbit-star-idle.webp`: upright, rounded five-point ceramic forms sharing the satin material and studio lighting of Orbi, ship and planet. Earned is sunny gold; future is solid pale lilac, not an empty outline. Both 1254 × 1254 RGBA sprites retain their original alpha and native aspect ratio inside the stable `StarGlyph.vue` SVG wrapper. The wrapper chooses the correct local sprite from the actual earned state; no Phosphor knowledge-star silhouette or CSS gradient fill remains. Exact prompts, conversion-only processing and provenance are in `public/art/orbit-galaxy-assets.prompt.md`. A later lapse adds a review label without removing or dimming an earned star.

Control icons use inline local `GameIcon` SVGs. The multiplication sign is meaningful math and the brand motif. Decorative artwork is hidden from assistive technology; emoji and icon fonts do not replace these controls.

## Components

### Buttons

Generous, gold and tactile. Ordinary primary actions adapt Inspira `RippleButton`. Pointer ripples start at the press; keyboard ripples start at the center. The default ripple lasts 520ms and is omitted for reduced motion. Pressed gold moves down briefly; disabled primary uses divider and muted ink without shadow. Focus remains explicit. Secondary white controls keep their own quiet edge, pressed/hover surface and focus treatment.

Welcome and home launch use native Inspira `ShimmerButton`: inset gold, conic perimeter shimmer, rocket/arrow SVGs and a minimum 64px target. Home takeoff lasts no more than 240ms before opening the mission; reduced motion opens immediately. Shimmer is decoration, never a loading dependency. The skippable welcome says «Привет! Я Орби.»; «Сразу играть» saves the skip and starts play immediately. Skipping an already started check returns home.

### Cards and feedback

The white question card holds one expression and the answer field. «Проверить» or «Не знаю» explicitly reveals it through Inspira `FlipCard`, never hover, drag or swipe. The flip lasts 420ms; hidden faces are inert and removed from the accessibility tree. Reduced motion removes the spatial transition.

The correct reverse uses the soft green surface, success outline, check and «Верно», with a 460ms confirmation stamp. Wrong/unknown answers use warm amber, typed/correct answers where applicable and a white explanation under «Как вспомнить». Hint language follows the school rules in `PRD.md` without blame. Diagnostics defer solutions until the summary. Results stay until «Продолжить», without timed auto-advance or duplicate attempts.

A newly earned knowledge star appears once near the answer. Individual answers have no confetti or XP animation.

### Inputs and accessibility

The pale lavender native input uses heavy tabular numerals, a visible label, `control-outline` rest border and violet focus/caret. Its valid range is 0–100. The wrapping empty hint stays within the field and is available through `aria-describedby`. Invalid format gets explicit nearby error text and an error border; empty input keeps its hint. Correction clears the error without silently erasing an invalid value.

Feedback uses `aria-live="polite"`. Read equations sensibly, such as «Семь умножить на восемь». Decorative SVGs and Orbi images remain hidden from screen readers. Focus advances predictably and every action is keyboard reachable. Static content and continue actions do not wait for an animation.

### Chips and navigation

The golden streak capsule includes the day label; XP is separately labeled. Maintenance replaces daily streak messaging with due reviews or the nearest review date.

Inspira `Dock` offers «Станция», «Звёзды» and «Взрослым» with permanent labels and `aria-current`. Soft lilac and violet identify the active destination. Mouse proximity and keyboard focus magnify icons, not targets. Reduced motion suppresses scale and its transition.

### Orbit scene and companion

Orbi is the original local `public/art/orbit-mascot.webp`, a mint-and-cream clay astronaut. The matching generated `public/art/orbit-planet.webp` and `public/art/orbit-ship.webp` use the same dimensional clay/ceramic materials, warm cream, mint, lilac and studio lighting. Both route assets are transparent 1536 × 1024 WebP cutouts, with clean contours and no baked external glow. Their provenance is in `public/art/orbit-route-assets.prompt.md`. The same planet appears beside Orbi and behind the XP chart; do not replace either route asset with a flat vector placeholder or an unrelated photographic planet. Native Inspira `Float`, `Orbit`, `Ripple` and `Sparkles` provide three quiet breathing rings, upright counter-rotating objects and sparse canvas twinkles. Home objects orbit over 36s and 46s; this never becomes a response timer.

`useSceneMotion` pauses Float and the scene's orbit/ripple animations when reduced motion is requested, the scene is offscreen or the document is hidden. Sparkles uses the same guards, at most 30fps/48 particles, with DPR capped at 2. Home uses 16 particles and the atlas 12. Hidden-document CSS also pauses other decorative animations. Reduced motion retains a complete static scene and controls.

`CompanionCue` is the smaller, calm encouragement beside learning feedback. The large scene does not sit behind an equation. Native `BorderBeam` adds a masked lilac-to-mint home invitation edge; `CardSpotlight` adds pointer, active or keyboard-focus light to the knowledge preview. Content remains complete without both effects.

### Route, atlas and completion

The XP route describes the current 100-XP level; «Всего XP» stays cumulative. Its SVG stage is 360 × 156 units: the generated planet occupies a 128 × 128 image box at (223, 7), behind the route; the generated ship occupies a 90 × 90 image box centered on its saved data position. SVG image sizing uses the native aspect ratio, so the landscape cutouts are contained rather than stretched. The dashed track is a smooth Catmull–Rom-derived cubic spline, and ship interpolation uses those same segment controls. Keep route and ship aligned across the whole level, with complete contours inside the stage. The ship remains at its saved position after reload. On a rewarded finish, native `AnimatedBeam` and ship travel use the actual award; zero awards fabricate no movement. Route motion and `NumberTicker` last 650ms with reduced-motion alternatives. The award shows its mission/streak breakdown and a reason for `+0 XP`.

The atlas uses the original opaque 1254 × 1254 `public/art/orbit-galaxy.webp` plate beneath a cosmos veil at opacity .48. The artwork contains cloud atmosphere only: all 66 knowledge markers and their state come from application data. `ConstellationSky` places them at the canonical positions in a 320 × 320 stage over three rings (12/22/32), with subtle lilac orbit lines. Preview/map stars are 22 stage units; final stars are 24 stage units, so their displayed size scales with the SVG. The actual plate and overlays are clipped by their rounded container.

The map chart is at most 320px wide. Its central 82px gauge sits on an opaque cosmos disc, with a 32px earned or future sprite according to the real count. The native Inspira `AnimatedCircularProgressBar` uses earned stars, not XP; its gold SVG arc transitions over 800ms or updates immediately for reduced motion. A count out of 66 and the two-state «Открыта»/«Впереди» sprite legend explain the map without relying on color. Unopened facts remain solid and visible.

Home keeps the constellation in a 144px rounded preview beside text inside the white knowledge card. At viewport widths of 360px and below, this card stacks and the preview becomes 176px, bounded by available width. The final constellation component permits 360px; the current mission-finish wrapper limits its rendered width to 280px. Due-review cards remain below the galaxy with the fact and list number. The 66-fact archive expands in page flow through a labeled button with `aria-expanded`. Asset replacement does not change saved mastery, earned-state selection or the one-shot new-star reveal.

Finish uses a compact Orbit scene, finite `SparklesText` heading, XP award and separate knowledge explanation. A rewarded ordinary mission fires one Confetti burst. The first expedition finish instead shows the full constellation with its own one-shot celebration and omits the repeated small XP route. Bursts are capped at 48 particles/100 ticks, with `useWorker: false`, in decorative non-interactive canvases. Reduced motion does not load or fire confetti; a missing optional chunk preserves static content and controls. Reload or visiting the map never repeats completion. `SparklesText` has two 1.2s cycles, not a perpetual reward loop.

The 15 local native Inspira adaptations are `AnimatedBeam`, `AnimatedCircularProgressBar`, `BorderBeam`, `CardSpotlight`, `Confetti`, `Dock`, `FlipCard`, `Float`, `NumberTicker`, `Orbit`, `Ripple`, `RippleButton`, `ShimmerButton`, `Sparkles` and `SparklesText`. Keep their original mechanisms and local MIT notice; only retain used components.

`LazyMotion` keeps motion features local. The offline pipeline includes fonts, mascot, generated ship and planet, galaxy plate, both knowledge-star sprites, icons, application CSS/JS and optional confetti chunk. Fonts/artwork have no remote runtime fetch. «Готово без интернета» describes successful cache readiness, not merely opening the page once.

## Do's and Don'ts

### Do:

- **Do** use lavender daylight, original Orbi artwork and local Nunito as one coherent world.
- **Do** keep one readable equation, a native numeric input and an obvious next action during recall.
- **Do** explain each answer in words and give the child a way to continue without haste or penalties.
- **Do** keep XP travel, daily regularity and permanent knowledge stars visibly separate.
- **Do** preserve the complete static experience, visibility guards and bounded particle budgets.
- **Do** verify real Russian strings, keyboard reachability, VoiceOver, 200% text and offline reload on the target iPhone.

### Don't:

- **Don't** copy another learning app's identity or replace the original companion with unrelated decorative stock art.
- **Don't** hide answers, help or navigation behind hover, swipes, precision dragging or an animation delay.
- **Don't** paint wrong answers red, remove earned stars, turn XP into mastery or invent achievements for decoration.
- **Don't** add a countdown, lives, leaderboard, random rewards or streak pressure in maintenance.
- **Don't** run confetti for individual answers or let decorative motion compete with the equation and controls.
- **Don't** add runtime font/artwork dependencies or present offline readiness before the required assets are cached.

The source-grounded system records the design, not the child's response. His reaction to Orbit Club and the real-device pass remain product checks, not facts inferred from code.
