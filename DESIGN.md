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
  help-surface: "#e8f5fa"
  help-ink: "#245c73"
  danger-surface: "#fff0f1"
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
  heading:
    fontFamily: "Nunito, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 900
  heading-compact:
    fontFamily: "Nunito, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 900
  meta:
    fontFamily: "Nunito, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: ".8125rem"
  caption:
    fontFamily: "Nunito, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: ".75rem"
  symbol:
    fontFamily: "Nunito, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
rounded:
  control: "18px"
  card: "28px"
  badge: "999px"
  icon: "12px"
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
    textColor: "{colors.focus}"
    rounded: "{rounded.control}"
    padding: "16px"
  xp-route:
    backgroundColor: "{colors.lilac-soft}"
    textColor: "{colors.on-space}"
    typography: "{typography.label}"
    rounded: "24px"
    width: "100%"
  button-danger:
    backgroundColor: "{colors.danger-surface}"
    textColor: "{colors.error}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
  button-danger-solid:
    backgroundColor: "{colors.error}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
  button-danger-active:
    backgroundColor: "{colors.danger-surface}"
    textColor: "{colors.error}"
  report-tile:
    backgroundColor: "{colors.space-raised}"
    textColor: "{colors.on-space}"
    rounded: "{rounded.card}"
    padding: "16px"
  report-tile-xp:
    backgroundColor: "{colors.lilac-soft}"
  report-tile-stars:
    backgroundColor: "{colors.review-surface}"
  report-tile-reviews:
    backgroundColor: "{colors.mint-soft}"
  report-level:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.focus}"
    rounded: "{rounded.badge}"
    padding: "4px 8px"
  reset-dialog:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  star-backplate:
    backgroundColor: "{colors.cosmos}"
    rounded: "{rounded.icon}"
  mission-step-correct:
    backgroundColor: "{colors.mint}"
    rounded: "{rounded.badge}"
    height: "20px"
    textColor: "{colors.success}"
  mission-step-wrong:
    backgroundColor: "{colors.review-surface}"
    rounded: "{rounded.badge}"
    height: "20px"
    textColor: "{colors.review-ink}"
  mission-step-unknown:
    backgroundColor: "{colors.help-surface}"
    rounded: "{rounded.badge}"
    height: "20px"
    textColor: "{colors.help-ink}"
  mission-step-done:
    backgroundColor: "{colors.lilac-soft}"
    rounded: "{rounded.badge}"
    height: "20px"
  mission-step-current:
    backgroundColor: "{colors.focus}"
    rounded: "{rounded.badge}"
    height: "20px"
  mission-step-future:
    backgroundColor: "{colors.divider}"
    rounded: "{rounded.badge}"
    height: "20px"
  fact-status-earned:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.success}"
    rounded: "{rounded.icon}"
    padding: "4px 8px"
  fact-status-future:
    backgroundColor: "{colors.help-surface}"
    textColor: "{colors.help-ink}"
    rounded: "{rounded.icon}"
    padding: "4px 8px"
  fact-status-review:
    backgroundColor: "{colors.review-surface}"
    textColor: "{colors.review-ink}"
    rounded: "{rounded.icon}"
    padding: "4px 8px"
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
- **Review amber** (`review-surface`, `review-ink`, `review-outline`) supports the explicit answer reverse and «Разберём вместе»: explanation rather than a red failure surface. In mission progress, wrong answers use an amber repeat icon.
- **Help blue** (`help-surface`, `help-ink`) distinguishes «С подсказкой» with a bulb in mission progress and future-status chips in the fact archive. The question-card reverse still gives wrong and unknown answers the same calm amber explanation surface.

### Tertiary

- **Knowledge gold** (`star`) colors the native gauge arc, XP waypoints and finite celebration accents. **Star highlight** colors reveal lines and waypoint highlights; **star edge** borders the newly opened-star notice. **Future-star slate** (`star-idle`) outlines XP route waypoints. These UI tokens do not recolor the generated knowledge-star sprites: their gold and ice-white/mint material states are separate local artwork.
- **Streak gold** (`streak`) keeps an explicit day label. Gold alone never makes a streak, XP and knowledge interchangeable.
- **Validation and adult danger** (`error`) identifies malformed input, explicit storage errors and destructive controls in the adult report. **Soft danger** (`danger-surface`) backgrounds the destructive secondary action. Neither is a wrong-answer palette.

### Neutral

- **Navy ink** (`ink`, `on-space`, `on-action`) and **muted ink** (`ink-muted`) distinguish primary and supporting text on light surfaces.
- **Paper** (`paper`, `white`, `space-raised`) is the white card/control plane. **Divider** is a quiet separator; meaningful input edges use **control outline** instead.
- **Cosmos** and **soft cosmos** form the dark atlas, opaque central gauge disc and gauge track; **on-cosmos** supplies light text. A cosmos veil at opacity .62 subdues the generated galaxy plate so the real knowledge markers remain prominent.
- **Shadow tint** separates surfaces without signaling learning state.

**The Answer Has Words Rule.** Every answer state keeps a visible explanation: «Верно», «Разберём вместе» or «Посмотрим подсказку». Color never carries the result alone.

**The Separate Journeys Rule.** XP shows effort and level travel. Knowledge stars show permanent achievements for individual facts. Never imply that one buys or converts into the other.

## Typography

**Display Font:** Nunito with the system fallback stack in the frontmatter.
**Body Font:** the same Nunito family. Latin and Cyrillic variable WOFF2 files are local, cover weights 400–900 and use `font-display: swap`; retain their license.

Rounded letterforms provide warmth without reducing clarity. Headings and equations use the heavy end of the family; body copy stays comfortably weighted. Use real Russian strings, sentence case and tabular numerals for equations, XP and answers.

### Hierarchy

- **Display:** the responsive `display` role for welcome invitations. Home bounds its greeting with `clamp(var(--font-size-title), 12vw, var(--font-size-display))`, balances short lines and uses normal word wrapping so complete words survive enlarged text.
- **Question:** the responsive `question` role for the centered equation, with tabular figures. Summary prose returns to title scale.
- **Title:** the `title` role for screen/finish headings and large metric values.
- **Heading / compact heading:** semantic `heading` for brand and supporting headings; `heading-compact` for mission headings, welcome invitation, dialog heading and finish counts.
- **Meta:** the semantic `meta` size for the XP badge, route detail, fact-state chips and finish labels. Weight follows the component: 800 for status labels, 600 for route detail.
- **Caption:** the small `caption` step is declared in CSS but currently has no rendered component use; it is not a reason to reduce essential text.
- **Symbol:** the heavy `symbol` role for the multiplication brand motif and decorative orbit tile.
- **Body:** the `body` role for instructions, answers and explanations; the global weight is 600, while strong feedback uses 900.
- **Label:** the `label` role for field labels, streaks and supporting copy. Navigation and supporting headings use heavier weights where implemented.
- **Button:** the `button` role for primary actions; secondary actions keep its size with weight 800.

**The One Lettering Rule.** Use the local Nunito family for display, controls and learning content. Let role, weight and scale provide hierarchy.

Let labels wrap and surfaces grow at 200% text size. Screen titles balance their lines and use automatic hyphenation. The empty answer hint stays inside its input surface: a non-interactive wrapping overlay preserves the native placeholder and accessible description. Do not disable pinch-to-zoom or shrink the 0–100 hint to fit.

## Layout

Screens use one centered column, at most 460px wide. Page padding includes all four safe-area insets: `lg` horizontally and at the top, `xl` at the bottom. Shared screen gaps are `xl`; home and finish use `lg` internally. At 700px and above, top page spacing becomes `xxl`; the column remains compact. The XP route heading stacks at 360px and below. The map review heading uses a wrapping flex row with a `12rem` heading basis; its count badge takes a separate row when enlarged text needs room.

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

Soft rounded rectangles define controls: `control` for fields, feedback and actions, `card` for invitation/question/atlas surfaces, `icon` for star backplates and symbol tiles, and `badge` for short capsules. Circles, rings and the shaded planet define illustration. Keep them distinct from the rectangular touch controls.

Knowledge stars are the original generated `public/art/orbit-star-earned.webp` and `public/art/orbit-star-idle.webp`: upright, rounded five-point ceramic forms sharing the satin material and studio lighting of Orbi, ship and planet. Earned is sunny gold; future is solid ice-white/ivory ceramic with cool mint/cyan edges, preserving the recognizable form and staying distinct from the lilac clouds. It is not an empty outline. Both 1254 × 1254 RGBA sprites retain their original alpha and native aspect ratio inside the stable `StarGlyph.vue` SVG wrapper. The wrapper chooses the correct local sprite from the actual earned state; no Phosphor knowledge-star silhouette or CSS gradient fill remains. Initial prompts, conversion-only processing and provenance are in `public/art/orbit-galaxy-assets.prompt.md`; the current idle revision is in `public/art/orbit-star-contrast.prompt.md`. The replacement has visually matched geometry and untouched generated alpha, without claiming pixel-identical sprites. A later lapse adds a review label without removing or dimming an earned star.

Control icons use inline local `GameIcon` SVGs. The multiplication sign is meaningful math and the brand motif. Decorative artwork is hidden from assistive technology; emoji and icon fonts do not replace these controls.

## Components

### Buttons

Generous, gold and tactile. Ordinary primary actions adapt Inspira `RippleButton`. Pointer ripples start at the press; keyboard ripples start at the center. The default ripple lasts 520ms and is omitted for reduced motion. Pressed gold moves down briefly; disabled primary uses divider and muted ink without shadow. Focus remains explicit. Secondary white controls keep their own quiet edge, pressed/hover surface and focus treatment. Adult destructive actions use `danger` and `danger-solid`: a soft red surface with red text/edge for the report entry, and red with white text for final deletion. Hover/press returns both to the soft danger surface; neither is child answer feedback.

Welcome and home launch use native Inspira `ShimmerButton`: inset gold, conic perimeter shimmer, rocket/arrow SVGs and a minimum 64px target. At widths of 360px and below, the home launch uses 16px inline padding, hides the decorative rocket/arrow and keeps its label span on one line. This adaptation belongs to the home mission action. Home takeoff lasts no more than 240ms before opening the mission; reduced motion opens immediately. Shimmer is decoration, never a loading dependency. The skippable welcome says «Привет! Я Орби.»; «Сразу играть» saves the skip and starts play immediately. Skipping an already started check returns home.

### Cards and feedback

The white question card holds one expression and the answer field. «Проверить» or «Не знаю» explicitly reveals it through Inspira `FlipCard`, never hover, drag or swipe. The flip lasts 420ms; hidden faces are inert and removed from the accessibility tree. Reduced motion removes the spatial transition.

The correct reverse uses the soft green surface, success outline, check and «Верно», with a 460ms confirmation stamp. Wrong/unknown answers use warm amber, typed/correct answers where applicable and a white explanation under «Как вспомнить». Hint language follows the school rules in `PRD.md` without blame. Diagnostics defer solutions until the summary. Results stay until «Продолжить», without timed auto-advance or duplicate attempts.

A newly earned knowledge star appears once near the answer. Individual answers have no confetti or XP animation.

### Inputs and accessibility

The pale lavender native input uses heavy tabular numerals, a visible label, `control-outline` rest border and violet focus/caret. Its valid range is 0–100. The wrapping empty hint stays within the field and is available through `aria-describedby`. Invalid format gets explicit nearby error text and an error border; empty input keeps its hint. Correction clears the error without silently erasing an invalid value.

Feedback uses `aria-live="polite"`. Read equations sensibly, such as «Семь умножить на восемь». Decorative SVGs and Orbi images remain hidden from screen readers. Focus advances predictably and every action is keyboard reachable. Static content and continue actions do not wait for an animation.

### Mission progress and outcomes

The full frozen queue remains visible across reloads. Actual saved outcomes use mint/check for «Верно», amber/repeat for «Разобрали вместе», and blue/bulb for «С подсказкой». Violet marks the current card; divider marks future cards. These 20px indicators are not actions. Each step has an accessible label, the visible counter uses full mission length, and semantic progress counts accepted answers rather than making every completion a green check.

Diagnostic progress stays neutral until its summary so it does not reveal solutions early. Resuming keeps the original queue and outcome history and opens the first unanswered card. Finish reports the three real outcome totals from that same history.

### Chips and navigation

Home gives its due-review count a warm amber number block beside «Примеры ждут повторения», with one clear action. The redundant privacy footnote is removed; storage limitations are explained in the adult report. The golden streak capsule includes the day label; XP is separately labeled. Maintenance replaces daily streak messaging with due reviews or the nearest review date.

Inspira `Dock` offers «Станция», «Звёзды» and «Взрослым» with permanent labels and `aria-current`. Soft lilac and violet identify the active destination. Keep Dock labels unbroken: buttons have intrinsic label widths and the Dock wraps into additional rows when enlarged text needs them. Mouse proximity and keyboard focus magnify icons, not targets. Reduced motion suppresses scale and its transition.

### Orbit scene and companion

Orbi is the original local `public/art/orbit-mascot.webp`, a mint-and-cream clay astronaut. The matching generated `public/art/orbit-planet.webp` and `public/art/orbit-ship.webp` use the same dimensional clay/ceramic materials, warm cream, mint, lilac and studio lighting. Both route assets are transparent 1536 × 1024 WebP cutouts, with clean contours and no baked external glow. Their provenance is in `public/art/orbit-route-assets.prompt.md`. The same planet appears beside Orbi and behind the XP chart; do not replace either route asset with a flat vector placeholder or an unrelated photographic planet. Native Inspira `Float`, `Orbit`, `Ripple` and `Sparkles` provide three quiet breathing rings, upright counter-rotating objects and sparse canvas twinkles. Home objects orbit over 36s and 46s; this never becomes a response timer.

`useSceneMotion` pauses Float and the scene's orbit/ripple animations when reduced motion is requested, the scene is offscreen or the document is hidden. Sparkles uses the same guards, at most 30fps/48 particles, with DPR capped at 2. Home uses 16 particles and the atlas 12. Hidden-document CSS also pauses other decorative animations. Reduced motion retains a complete static scene and controls.

`CompanionCue` is the smaller, calm encouragement beside learning feedback. The large scene does not sit behind an equation. Native `BorderBeam` adds a masked lilac-to-mint home invitation edge; `CardSpotlight` adds pointer, active or keyboard-focus light to the knowledge preview. Content remains complete without both effects.

### Route, atlas and completion

The XP route describes the current 100-XP level; «Всего XP» stays cumulative. Its SVG stage is 360 × 156 units: the generated planet occupies a 128 × 128 image box at (223, 7), behind the route; the generated ship occupies a 60 × 60 image box centered on its saved data position. SVG image sizing uses the native aspect ratio, so the landscape cutouts are contained rather than stretched. The dashed track is a smooth Catmull–Rom-derived cubic spline, and ship interpolation uses those same segment controls. Keep route and ship aligned across the whole level, with complete contours inside the stage. The ship remains at its saved position after reload. On a rewarded finish, native `AnimatedBeam` and ship travel use the actual award; zero awards fabricate no movement. Route motion and `NumberTicker` last 650ms with reduced-motion alternatives. The award shows its mission/streak breakdown and a reason for `+0 XP`: no entered answer, the daily limit, a device-date pause or an already recorded award. The award uses violet supporting text on soft lilac and explains a positive mission award with «XP за миссию — за попытку ответить самому.» A completed mission needs at least one accepted entered answer to qualify for XP; a wrong entered answer counts as an attempt. Hint-only completion shows zero, does not advance the streak or bonus, and does not consume an eligible daily XP slot. Previously recorded completions and rewards remain intact. The `no-answer` reason invites trying an answer without describing uncertainty as failure; exact reward calculations stay in `PRD.md`.

The atlas uses the original opaque 1254 × 1254 `public/art/orbit-galaxy.webp` plate beneath a cosmos veil at opacity .62. The artwork contains cloud atmosphere only: all 66 knowledge markers and their state come from application data. `ConstellationSky` places them at the canonical positions in a 320 × 320 stage over three rings (12/22/32), with subtle lilac orbit lines and no decorative center beacon. Preview/map stars are 22 stage units; final stars are 24 stage units, so their displayed size scales with the SVG. The actual plate and overlays are clipped by their rounded container. Gold earned stars use `public/art/orbit-star-earned.webp`; future stars use the generated ice-white/ivory and mint sprite in `public/art/orbit-star-idle.webp`. Galaxy/earned-star provenance is in `public/art/orbit-galaxy-assets.prompt.md`; the current future-star prompt is `public/art/orbit-star-contrast.prompt.md`. Its original generated alpha remains intact.

The map chart is at most 320px wide. Its central gauge occupies 25.625% of the chart width (82px at 320px) and sits on an opaque cosmos disc, with a fixed 32px earned or future sprite according to the real count. The native Inspira `AnimatedCircularProgressBar` uses earned stars, not XP; its gold SVG arc transitions over 800ms or updates immediately for reduced motion. A count out of 66 and the two-state «Открыта»/«Впереди» sprite legend explain the map without relying on color. Unopened facts remain solid and visible.

Home keeps the constellation in a 144px rounded preview beside text inside the white knowledge card. At viewport widths of 360px and below, this card stacks and the preview becomes 176px, bounded by available width. The final constellation component permits 360px; the current mission-finish wrapper limits its rendered width to 280px. Due-review cards remain below the galaxy with the fact and list number. The 66-fact archive expands in page flow through a labeled button with `aria-expanded`. Each fact groups its achievement and optional «Пора повторить» as wrapping, distinct status chips. Its 24px sprite sits on a 32px dark backplate so the pale future star stays readable on white. The milestone summary uses a 32px sprite on a 40px dark backplate. Asset replacement does not change saved mastery, earned-state selection or the one-shot new-star reveal.

Finish uses a compact Orbit scene, finite `SparklesText` heading, three truthful counts («Верно», «Разобрали», «С подсказкой»), XP award and separate knowledge explanation. Counts come from accepted outcomes of the full saved mission queue; labels and tabular values align in their columns. At widths of 360px and below, this becomes three label/value rows with the count opposite each label, preserving whole words at enlarged text. Wrong or hint-assisted cards are not independent correct successes. A rewarded ordinary mission fires one Confetti burst. The first expedition finish instead shows the full constellation with its own one-shot celebration and omits the repeated small XP route. Bursts are capped at 48 particles/100 ticks, with `useWorker: false`, in decorative non-interactive canvases. Reduced motion does not load or fire confetti; a missing optional chunk preserves static content and controls. Reload or visiting the map never repeats completion. `SparklesText` has two 1.2s cycles, not a perpetual reward loop.

### Adult report and reset

The report uses a two-column label/value/note grid, stacking at 360px and below. Each metric tile reserves two label lines so value baselines align; the reserve is removed for the wide retention tile and stacked layout. XP, knowledge stars, reviews and best streak remain separate. A large tabular numerator carries the value; «из 66» and retention denominators are subordinate at label size. The XP level is a white badge below its value. Empty retention says «Пока нет данных» rather than implying a measured score.

Reset is isolated in the adult danger zone below routine actions. The application uses a real native `dialog` opened with `showModal()`, with associated heading/description. Cancel receives autofocus and explicit focus with `preventScroll: true`; opening also resets the dialog scroll position to zero so its heading and warning are visible. An explicit Tab/Shift+Tab boundary loop keeps focus between Cancel and final deletion in Safari. The description says «Все ответы, звёзды и XP удалятся навсегда.» Final deletion visibly says «Удалить» and keeps the accessible name «Удалить весь прогресс». Escape and outside-backdrop dismissal close it, and closing restores the trigger when still present. Confirmation closes the dialog and emits reset to the application. Content scrolls within the viewport at large text; final deletion stays distinct from Cancel. Do not replace it with an in-page box lacking modal focus behavior.

The 15 local native Inspira adaptations are `AnimatedBeam`, `AnimatedCircularProgressBar`, `BorderBeam`, `CardSpotlight`, `Confetti`, `Dock`, `FlipCard`, `Float`, `NumberTicker`, `Orbit`, `Ripple`, `RippleButton`, `ShimmerButton`, `Sparkles` and `SparklesText`. Keep their original mechanisms and local MIT notice; only retain used components.

`LazyMotion` keeps motion features local. The offline pipeline includes fonts, mascot, generated ship and planet, galaxy plate, both knowledge-star sprites, icons, application CSS/JS and optional confetti chunk. Fonts/artwork have no remote runtime fetch. Each of the six generated WebP assets has a neighboring `.webp.json` sidecar with its exact prompt and creation time. The provenance helper writes these sidecars, not metadata embedded into the bitmap. «Готово без интернета» describes successful cache readiness, not merely opening the page once.

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
