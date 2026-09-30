---
name: "Умножайка"
description: "Design system for a short flashcard game that teaches the multiplication table on iPhone"
colors:
  space: "#0B1020"
  space-raised: "#151F36"
  paper: "#F7FAFF"
  white: "#FFFFFF"
  ink: "#15213B"
  ink-muted: "#52617A"
  action: "#175CD3"
  action-pressed: "#114AB0"
  focus: "#175CD3"
  on-space: "#F7FAFF"
  focus-on-space: "#F9BA43"
  streak: "#F9BA43"
  star: "#F9BA43"
  star-highlight: "#FFE3A1"
  star-edge: "#C88024"
  star-idle: "#64748B"
  success: "#0B6B62"
  success-surface: "#E0F4E8"
  error: "#B42335"
  review-surface: "#FFF3DD"
  review-ink: "#704900"
  review-outline: "#946200"
  control-outline: "#64748B"
  divider: "#CAD5E5"
typography:
  question:
    fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.18
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.3
  button:
    fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  control: "12px"
  card: "20px"
  badge: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "16px 24px"
    minHeight: "56px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "14px 20px"
    minHeight: "52px"
  answer-field:
    typography: "{typography.title}"
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    minHeight: "64px"
  question-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  streak-badge:
    backgroundColor: "{colors.streak}"
    textColor: "{colors.ink}"
    rounded: "{rounded.badge}"
    padding: "8px 12px"
---

# Design System: Умножайка

## Overview

**Creative North Star: "Expedition Logbook".** The child explores the multiplication table as a map of unknown points. The lesson screen is a calm workspace: dark space frames one light card with the expression. New knowledge lights up the route; XP and the daily streak live in small indicators and never compete with the question.

This is an **operate-style interface** for a ten-year-old. At any moment there is one task and one primary action. The space theme appears in the constellation map, small orbit graphics, and the warm streak accent. Do not use foreign characters, the Duolingo logo, or its palette. The theme was chosen by the family; the tokens below are a starting system to verify on a real iPhone together with the son.

**One focus rule.** On the card screen the expression is the largest element; XP, the map, and decoration never interfere with solving. **Two progress rule.** XP, permanent achievement stars, and the "due for review" mark carry different labels and visual roles.

## Colors

The normative values live in the YAML above. `space` is the background, `space-raised` the top panel and map, `paper` the question surface, `ink` text on light, `ink-muted` secondary text on a light surface. On the dark background text uses `on-space` and focus uses `focus-on-space`; the blue `focus` is used on light. A blue button on the dark background needs an `on-space` border so its outline stays visible. `action` is used only for the primary action and focus. `streak` marks the streak, its milestones, and the brief golden ripple on the home launch action; `success` and `success-surface` mark a correct answer; `review-surface`, `review-ink`, and `review-outline` style the calm hint after an error or "Don't know". `error` is reserved for input format errors.

White text on `action` has a contrast of **5.99:1**; `ink` on `paper` **15.29:1**, `ink-muted` on `paper` **5.99:1**, `ink` on `streak` **9.24:1**. On the green card `ink` has **13.92:1** and `success` **5.55:1**. On the amber card `ink` has **14.56:1**, `review-ink` **7.24:1**, `review-outline` **4.77:1**. `control-outline` separates the input field from the light card; `divider` is only for decorative lines. These pairs meet the [WCAG 2.2 4.5:1 threshold for normal text](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Color never conveys the answer without the words «Верно», «Разберём вместе», or «Посмотрим подсказку»; meaningful component borders must reach a [3:1 contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

**Signal color rule.** A wrong answer never paints the card red: it turns warm amber and shows «Разберём вместе» with the typed and correct answers. After "Don't know" the same card says «Посмотрим подсказку» and does not blame the child. The red `error` color is only for malformed input. A correct answer fills the card with `success-surface`, adds a `success` border, and keeps the word «Верно»; that state persists until «Продолжить» is pressed. Stars and orbits are never tinted with error or success colors.

## Typography

One system font from the iPhone keeps the payload small and supports Cyrillic. Visual character comes from size and weight, not a decorative typeface. Sizes are in rem (at a 16px base: expression 56px, heading 28px, text 17px); text must scale to 200% without clipping.

- **Expression:** role `question`; tabular figures (`font-variant-numeric: tabular-nums`) keep an even rhythm as cards change.
- **Screen heading:** role `title`; short, with no top "badge" or long preamble.
- **Instruction and result:** role `body`; one clear sentence.
- **Streak, XP, card counter:** role `label`; always with a text label, never an icon alone.

Respect the user's text size; when space is tight, wrap labels and grow the height instead of shrinking the type. The web version does not get Dynamic Type automatically the way a native app does, so verify scaling manually. Relying on the system typography follows the [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/foundations/typography).

## Layout

A single column with a max width of **480px**. On the iPhone 12 Pro Max the starting gutters are **16px** on each side and **24–32px** between major blocks. Top: a compact mission status; center: the expression; bottom: the answer and the action. The knowledge map is a separate screen, not the card's background. On wide screens the column stays centered; elements never stretch to full width.

For the fullscreen PWA use `viewport-fit=cover` and account for `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` around controls. Never place the primary action under the home indicator or the system keyboard. For the answer use the system numeric keyboard through `type="text" inputmode="numeric"`; do not build a custom keypad. `inputmode` only selects a keyboard: [it performs no validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode). Validation rules live in the PRD. Safe areas do not compensate for keyboard height: the page must scroll while keeping the field and button reachable. [WebKit: safe areas](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

**Big touch rule.** Every action has a target of at least **48 × 48 CSS px**, and the primary button has a minimum height of **56px**. That is above the [WCAG 2.2 minimum of 24 CSS px](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html); a separate benchmark for native interfaces is [Apple's 44 × 44 pt recommendation](https://developer.apple.com/design/human-interface-guidelines/components/menus-and-actions/buttons). CSS px and native pt are not equated here. Component heights are minimums: they grow with larger text. Children of the son's age handle ordinary gestures, but the task must never require swipes or precise dragging; UX research with children aged 9–12 shows more developed motor skills alongside the continuing need for interface clarity. [NN/g](https://www.nngroup.com/articles/children-ux-physical-development/)

## Elevation & Depth

Depth is built from two planes: the dark sky and the light card. No glass, blur, or glowing "neon" halos. The card shadow may only softly separate the card from the background; never use it to signal state. An overlay layer over a lesson is reserved for actions that genuinely require interruption.

## Shapes

**Achievement stars:** use the rounded `star-fill` silhouette from Phosphor Icons (MIT, vendored in `StarGlyph.vue`; license in `public/licenses/phosphor-icons.txt`). Earned stars have a restrained gold fill from `star-highlight` through `star` to `star-edge`, with a fine edge and no outer glow. Future stars use a quiet `star-idle` outline with a fill matching the surrounding surface. Use the same glyph on the map, counters, mission finish, and new-star feedback. The 66 stars are distributed 12/22/32 across the three orbits, keeping similar spacing on every ring. Orbit lines stay subdued; a text legend and per-fact labels explain the states. The map stays still; new-star feedback receives a short scale/rotation entrance and the finish illustration appears once. Reduced motion shows both immediately. Never recolor an earned star after a later error.

The card has the soft `card` radius; fields and buttons the smaller `control`; the streak indicator the `badge` capsule. Orbits and route dots are drawn as thin SVG lines, while interactive elements remain standard buttons and fields. Control icons use simple 2px-stroke SVGs; achievement stars follow the distinct filled treatment above. Emoji and Unicode symbols do not replace interface icons.

## XP Route

The home screen shows one curved route for the current 100-XP level. Its level label and progress sentence explain the route; `Всего XP` remains a separate cumulative total so crossing a level boundary cannot look like lost progress. Gold route waypoints mean XP earned in this level only; they never represent mastery. Knowledge stars retain their own count and meaning. The ship stays at the saved XP position while idle and after reload. The launch action may tilt and scale it once in place; a zero-XP mission and `prefers-reduced-motion: reduce` leave its position or motion unchanged.

## Components

| Component | Behavior and states |
| --- | --- |
| **Primary button** | One per screen: «Играть», «Проверить», or «Продолжить». Pressing darkens `action` to `action-pressed` and starts a brief golden ripple centered on the pointer or, for keyboard activation, the button center. The mission opens within 240 ms; reduced motion omits the ripple and opens immediately. Focus is a 2px outline with offset, colored for the current background. Synchronous localStorage writes need no artificial loading screen; a failed write shows an explicit error. |
| **Secondary button** | «Не знаю», «Назад», «Позже». A light surface with a visible `control-outline` border; it must not look like the main CTA. |
| **Question card** | One expression; the answer hidden until an attempt. In a normal mission the attempt shows the result, and on a mistake a short hint plus a continue button. A correct answer fills the card with soft green, replaces `?` with the product, and shows «Верно» in a contrasting green block with a restrained stamp entrance. Individual answers have no confetti or particle effects; reserve larger celebrations for meaningful milestones such as a newly earned star or completion of the expedition. On a mistake or "Don't know" the card turns amber: a white feedback block with the correct answer and a one-line hint under «Как вспомнить» — a school rule or technique («На ноль умножать — всегда будет 0», «Три по четыре: 4 + 4 + 4 = 12», «Разбей 8 на 5 и 3: 35 + 21»). No diagrams and no word «группы»: the hint language is school rules and "N по M". In diagnostics, solutions are deferred to the end of the check. Never flip the card with a gesture — an important action must stay explicit. |
| **Answer field** | Numeric input 0–100 with a visible label and the placeholder «Введи целое число от 0 до 100» inside the field: the hint is always visible while the field is empty and disappears under the typed value. There is no separate caption under an empty field; the same rule stays available to screen readers through `aria-describedby`. On a wrong format a visible error appears and disappears as the input is corrected; submitting an empty value shows no error — the hint already sits in the placeholder. After an answer is accepted the wrong value stays on the card next to the correct one and the input field hides. Pressing «Проверить» again after an accepted answer never creates a new attempt. XP is awarded only for mission completion, per the PRD. |
| **Mission indicator and finish** | The text «Карточка 4 из 10» with the actual mission length plus a semantic `<progress>`. On finish — a route summary card with separate «Опыт за практику» and «Звёзды знаний» blocks. The first shows the award, total XP and level; the second shows stars out of 66 and how a star is earned. A zero counter is never framed as a grade. «Карта звёзд» opens right from the finish; the primary action «Продолжить» leads home. `+0 XP` has a reason: the daily cap or a pause caused by the device date. The streak bonus appears separately inside the award breakdown. The first completion of the 66th mastery star replaces the small route illustration with the full shared sky and one brief, decorative confetti burst; both finish actions stay usable throughout. |
| **Streak and XP** | The streak is a golden badge with the number of days; XP is a plain text counter. Permanent achievement stars are shown separately on the map; the need for review is marked by an extra label without dimming the star. |
| **Knowledge map** | The screen is titled «Карта звёзд» in the heading and both entry points. It explains that a star belongs to one specific expression after two independent successes at least 7 days apart, is never bought with XP, and survives a later error. Facts due for review are separate small light cards with the expression and its route number. The list of 66 facts opens with a large button carrying `aria-expanded` and a visible arrow; the content expands in the page flow, with no modal layer. |

**Accessibility:** the visible label is tied to the field; the result is announced with `aria-live="polite"`, the input error with `aria-describedby`. After an answer the result and «Продолжить» are available with no auto-advance. The next card receives a predictable focus; every action is keyboard reachable. The expression has a sensible spoken form «Семь умножить на восемь». Decorative SVGs are hidden from screen readers. Verify VoiceOver, 200% zoom, and a narrow screen with no horizontal scrolling; do not disable pinch-to-zoom.

**Screen states:** before the first stars the map shows «Открыто звёзд: 0 из 66» and explains the path to the first one; overdue or forgotten facts show «Пора повторить» without dimming an opened star or lowering the star count. A new star is marked at the answer result, with no XP animation and no false hint of conversion. When no reviews are scheduled, free practice stays available. Cache readiness is «Готово без интернета»; a storage failure is «Прогресс не сохраняется» with a retry. Data reset lives in the report and requires confirmation. Mastery status and map colors follow the PRD.

Design every interactive component for rest, pressed, focus, disabled, and error states. Feedback appears near the card, matches the importance of the event, and never relies on color alone — as recommended by [Apple HIG Feedback](https://developer.apple.com/design/human-interface-guidelines/patterns/feedback). On a correct answer the card gently confirms the action (~220 ms) and «Верно» appears once as a stamp over 460 ms, with no particles and no delay to the «Продолжить» button. Under `prefers-reduced-motion: reduce` the card motion is disabled while the green background and «Верно» remain. Reserve celebration effects for larger achievements; never animate every answer as a reward. On a mistake or "Don't know" the white feedback block, the answer, and the explanation calmly appear in sequence over a few hundred milliseconds, with no confetti and no delay to continuing; with reduced motion everything is visible at once. The final 66th-star completion may load one optional confetti chunk and fire one burst capped at 48 particles/100 ticks (`useWorker: false`); confine the decorative, `aria-hidden`, non-interactive canvas to the sky illustration so it never obscures the heading, explanation, or controls. With reduced motion it does not load or fire. An unavailable chunk leaves the static sky, text, and buttons intact. Reloading or visiting the map never repeats the celebration. Other mission finishes have no confetti. A short XP animation on mission finish is likewise disabled under reduced motion. The home launch ripple ends with the ≤240 ms transition and is omitted when reduced motion is requested. [Apple HIG Motion](https://developer.apple.com/design/human-interface-guidelines/foundations/motion), [WCAG Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

## Do's and Don'ts

- **Do:** keep the expression and the answer field in one field of view; show a clear next action; congratulate completion and regularity; check real Russian strings and input on the iPhone.
- **Do:** distinguish "mistaken just now" from "still learning"; give hints without an evaluative tone; keep the game accessible without sound and animation.
- **Don't:** copy Duolingo branding, hide the learning result behind XP, add a timer, take progress away for a mistake, show many cards at once, or add random rewards.
- **Don't:** place important text over busy space, use color as the only signal, run endless confetti, or distract with constant background motion.

**Prototype check:** show the son the home screen and a card on the phone. If the space theme feels childish or distracts him, keep the structure and accessibility and reduce the amount of decoration.

**Expedition finish:** after the last mission show «Экспедиция завершена!» and all 66 opened stars. The primary action is «Продолжить», leading into maintenance mode. Never repeat the congratulation on every launch. On the home screen of that mode, show the number of facts due for review instead of the current streak, or «На сегодня повторений нет» with the nearest date; free practice stays available. Do not show a "keep your streak" prompt. Stars, XP, and the best streak are preserved; errors do not cancel the completed expedition.
