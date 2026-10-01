# Cosmic Expedition UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the multiplication PWA feel like a responsive cosmic expedition while keeping recall, XP, and mastery stars truthful and easy to understand.

**Architecture:** Keep the current Vue screen/state flow and domain rules. Add Tailwind v4 as a presentation tool, copy four pinned Inspira UI primitives into focused local adapters, and build an original SVG ship plus one shared 66-fact sky. Ephemeral animation state stays in Vue; persisted learning/reward state remains unchanged.

**Tech Stack:** Vue 3, TypeScript 5.9, Vite 8, Tailwind CSS v4, motion-v, @vueuse/core, @inspira-ui/plugins, canvas-confetti, Vitest, Playwright WebKit, vite-plugin-pwa; bun only.

**Spec:** `docs/superpowers/specs/2026-09-30-cosmic-expedition-ui.md`

## Global Constraints

- Keep `PRD.md` learning and reward rules: 66 unordered facts `0..10`, up to 10 cards per mission, at most two unseen facts, +10 ordinary XP per completed mission and at most 30 ordinary XP/day, level `1 + floor(XP / 100)`.
- Stars mean independent correct recall on separate days at least seven days apart without an intervening error; a later lapse never removes an earned star. XP and stars never substitute for each other.
- Preserve the current `Играть` / `Повторить` / `Свободная практика` selection, maintenance mode, interrupted-mission resume, local-only storage, and offline PWA. No server, Pinia, router, new currency, sound, or changed math rules.
- Keep `DESIGN.md` tokens `#0B1020`, `#F7FAFF`, `#175CD3`, `#F9BA43`, `#E0F4E8`, `#FFF3DD` and ≥48 CSS px targets; text and focus remain usable at 320 px width and 200% text.
- Use Inspira source pinned to `04c57ab62b9713872ebbf68988dff1836ed3d764`, adapt it locally, and retain its MIT notice in `public/licenses/inspira-ui.txt`. Tailwind CSS v4 needs Safari 16.4+; build against WebKit now and verify the actual iPhone before release. If older, update iOS or choose compatible styles before deployment.
- Motion is one-shot and optional. `prefers-reduced-motion: reduce` presents the final static state; no particles over questions, no looping beam/background, no waiting for a finish animation to use buttons.
- Prefix every shell command with `rtk proxy` as required by the repository instructions; use `rtk proxy env APP_BASE_PATH=/multiplay/ bun run ...` for subpath checks.
- Add source imports only where used: `@vueuse/core` for Number Ticker, `motion-v` for the ship, `canvas-confetti` for the final celebration. Do not install `tw-animate-css` or unrelated Inspira components without a use.

## Review Focus

1. A fourth mission awards `+0 XP`: finish explains why, and the ship must not advance. Pin in Task 2 route tests and Task 4 finish tests.
2. A streak bonus can cross an XP-level boundary (e.g. 90→120): the ship must land at 20/100 on level 2, not 120/100. Pin in Task 2 unit and Task 4 finish tests.
3. More than one star can unlock in one mission: each correct fact must illuminate its stable location, while existing stars and map geometry remain unchanged. Pin in Task 5 component tests.
4. A refresh or app interruption during launch, answer, or celebration must not replay a reward, duplicate a mission, or lose a recorded answer. Pin in Tasks 1, 3, and 6 E2E tests.
5. With reduced motion, keyboard activation, 200% text, and offline use, the same labels and actions must stay available. Pin in Tasks 1, 4, 5, and 6 E2E tests.

---

### Task 1: Tailwind foundation and responsive launch action

**Files:**
- Modify: `package.json`, `bun.lock`, `vite.config.ts`, `src/main.ts`, `src/App.vue`, `src/presentation/screens/HomeScreen.vue`, `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`
- Create: `src/presentation/styles/inspira.css`, `src/presentation/components/inspira/RippleButton.vue`, `src/presentation/components/LaunchButton.vue`, `public/licenses/inspira-ui.txt`, `tests/e2e/expedition-ui.spec.ts`
- Test: `tests/e2e/expedition-ui.spec.ts`, `tests/e2e/ui.spec.ts`, `tests/e2e/app.spec.ts`

**Interfaces:**
- Import Tailwind with `@layer theme, base, components, utilities; @import "tailwindcss/theme.css" layer(theme); @import "tailwindcss/utilities.css" layer(utilities);` and deliberately omit `preflight.css`. Define only the project token aliases used by copied components; retain the current base styles.
- Produce `LaunchButton.vue`: props `{ label: string; disabled: boolean }`; emits `click: []`. It remains a native `button` with a 56 px minimum height and visible focus.
- Produce App `launch(kind: MissionKind): void`: ignore repeated calls; set a short `launching` state; enter mission within 240 ms, immediately for reduced motion. The Home screen receives `launching: boolean`; its `play`, `review`, and `practice` events all call `launch`, including the secondary mission-start action.
- Tailwind entry imports theme and utilities, omitting Preflight. `@theme inline` aliases existing CSS tokens under `expedition-*` names; existing scoped CSS stays valid. Copy Ripple Button and adapt pointer/keyboard origin, timer cleanup, disabled behavior, and reduced motion.

- [x] **Step 1: Write the failing E2E tests.** In `expedition-ui.spec.ts`, assert the primary action retains the current label, has ≥56 px height, shows tap feedback, opens one mission without an intermediate loading screen, works with Space, and starts no motion with reduced motion. Use controlled clock advancement for the 240 ms launch delay instead of a wall-clock assertion. Reload immediately after tap and assert the app shows a valid home or resumable mission. Assert the adopted Tailwind token class has the expected computed color in WebKit.
- [x] **Step 2: Verify red.** Run `rtk proxy bun run build`, then `rtk proxy bun run test:e2e tests/e2e/expedition-ui.spec.ts`. Expect the new tap-feedback/launch assertions to fail on the existing button.
- [x] **Step 3: Implement the foundation.** Run `rtk proxy bun add @inspira-ui/plugins` and `rtk proxy bun add -d tailwindcss @tailwindcss/vite`; add the Vite plugin and theme/utilities without Preflight. Replace upstream `bg-background`/`text-primary` classes with project token aliases. Adapt Ripple with unique IDs, one timer per ripple, cleanup on unmount, keyboard-centered origin, disabled and reduced-motion states; keep native button semantics and the existing primary button on lesson screens. Update `AGENTS.md`, `PRODUCT.md`, and the primary-button/motion rules in `DESIGN.md`.
- [x] **Step 4: Verify green and regression.** Run `rtk proxy bun run typecheck`, `rtk proxy bun run build`, `rtk proxy bun run test:e2e tests/e2e/expedition-ui.spec.ts tests/e2e/ui.spec.ts tests/e2e/app.spec.ts`. Compare home/diagnostic/card screenshots and computed control styles before accepting the no-Preflight integration. Expected: all pass; no horizontal overflow, shifted controls, duplicate launch, or lost focus in the answer field.
- [x] **Step 5: Commit.** Stage the files above and commit `feat: add expedition launch interaction`.

### Task 2: Original ship and truthful XP route

**Files:**
- Modify: `package.json`, `bun.lock`, `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, `src/domain/game/experience.ts`, `src/presentation/screens/HomeScreen.vue`, `src/presentation/components/XpCounter.vue`, `src/App.vue`
- Create: `src/presentation/utils/xpRoute.ts`, `src/presentation/utils/xpRoute.test.ts`, `src/presentation/components/ExpeditionShip.vue`, `src/presentation/components/XpRoute.vue`
- Test: `tests/e2e/expedition-ui.spec.ts`, `tests/e2e/ui.spec.ts`

**Interfaces:**
- Export `XP_PER_LEVEL = 100` from `experience.ts` and `xpRoute(totalXp: number): { level: number; earnedInLevel: number; fraction: number }` from `xpRoute.ts`; `fraction` is in `[0,1)`, so exactly 100 XP starts level 2 at 0/100.
- `XpRoute.vue` receives `totalXp: number` and optional `launching?: boolean`. It draws one curved sector with ten earned waypoints at 10, 20, …, 100 XP and positions `ExpeditionShip.vue` from actual XP; 0 XP is the launch point before the first waypoint. The ship has a one-shot launch transform while `launching` is true; the home route does not replay mission rewards or compute mastery.

- [x] **Step 1: Write failing tests.** Unit assertions: `xpRoute(0)` gives level 1/fraction 0; `xpRoute(90)` level 1/fraction .9; `xpRoute(100)` level 2/fraction 0; `xpRoute(120)` level 2/fraction .2. E2E: after a +10 mission, the home ship is at the new waypoint while `Звёзды знаний: 0 из 66` remains truthful; a seeded fourth `+0` mission leaves the ship at the same position; reload shows the same static position.
- [x] **Step 2: Verify red.** Run `rtk proxy bun run test src/presentation/utils/xpRoute.test.ts`; run `rtk proxy bun run build`, then `rtk proxy bun run test:e2e tests/e2e/expedition-ui.spec.ts`. Expect the route/ship assertions to fail.
- [x] **Step 3: Implement.** Run `rtk proxy bun add motion-v`. Add the pure route helper, semantic XP/level labels, a curved ten-waypoint SVG sector, and the original ship. Use Motion-V with `LazyMotion` only for the launch transform; no idle bobbing. Keep total XP separate from current-level XP in labels, and document the route semantics in `AGENTS.md`, `PRODUCT.md`, and `DESIGN.md`. In reduced motion show the final frame immediately. The ship never moves for a `+0` reward, and a level change starts it at the next sector's correct position.
- [x] **Step 4: Verify green.** Run `rtk proxy bun run test src/domain/game/experience.test.ts src/presentation/utils/xpRoute.test.ts`, `rtk proxy bun run typecheck`, `rtk proxy bun run build`, and `rtk proxy bun run test:e2e tests/e2e/expedition-ui.spec.ts tests/e2e/ui.spec.ts`. Expected: correct level wrap, honest star count, no layout shift or replay on reload.
- [x] **Step 5: Commit.** Stage Task 2 files and commit `feat: show xp as a ship route`.

### Task 3: Quiet question states and uninterrupted focus

**Files:**
- Modify: `src/presentation/components/QuestionCard.vue`, `src/presentation/screens/MissionScreen.vue`, `tests/e2e/success-feedback.spec.ts`, `DESIGN.md`
- Test: `src/presentation/screens/missionScreen.test.ts`, `tests/e2e/review-feedback.spec.ts`, `tests/e2e/success-feedback.spec.ts`

**Interfaces:** Preserve QuestionCard's existing props and answer feedback copy. Remove only the eight card-confetti pieces and their CSS; success green, warm error/unknown, answer explanation, and new-star text remain.

- [x] **Step 1: Rewrite failing feedback tests.** Assert zero particles over a question, the success and review surfaces remain readable, the correct/typed answers are still stated, and focus moves to `Продолжить` after an answer and back to the field on the next card. Add a refresh-after-answer assertion: the accepted attempt persists and cannot be rewarded twice.
- [x] **Step 2: Verify red.** Run `rtk proxy bun run build`, then `rtk proxy bun run test:e2e tests/e2e/success-feedback.spec.ts tests/e2e/review-feedback.spec.ts`. Expect failure because the existing card renders eight confetti pieces.
- [x] **Step 3: Implement and align `DESIGN.md`.** Remove card particles and replace both conflicting statements in `DESIGN.md` (the Question Card row and Motion section): celebration belongs to earned mission/star events, not every answer. Keep the existing signal colors, text, and no-auto-advance behavior.
- [x] **Step 4: Verify green.** Run `rtk proxy bun run test src/presentation/screens/missionScreen.test.ts`, `rtk proxy bun run build`, and `rtk proxy bun run test:e2e tests/e2e/success-feedback.spec.ts tests/e2e/review-feedback.spec.ts`. Expected: all pass in WebKit, including reduced motion and 320 px width.
- [x] **Step 5: Commit.** Stage Task 3 files and commit `refine: keep question feedback focused`.

### Task 4: Mission result with XP, ship flight, and clear narration

**Files:**
- Modify: `package.json`, `bun.lock`, `src/presentation/screens/MissionScreen.vue`, `src/presentation/components/XpRoute.vue`, `tests/e2e/ui.spec.ts`
- Create: `src/presentation/components/inspira/NumberTicker.vue`, `src/presentation/components/inspira/AnimatedBeam.vue`, `src/presentation/components/XpAward.vue`
- Test: `src/presentation/screens/missionScreen.test.ts`, `tests/e2e/app.spec.ts`, `tests/e2e/expedition-ui.spec.ts`

**Interfaces:**
- `XpAward.vue` props `{ awardedXp: number; bonusXp: number; totalXp: number; level: number; xpPausedByClock: boolean }`. Its `role="status"` has one stable accessible label containing the final award and breakdown; the visual Number Ticker is `aria-hidden` and uses `decimalPlaces: 0`. `+0 XP` is static with the existing cap/clock reason.
- Extend `XpRoute.vue` with optional `fromXp?: number | null` and `variant?: 'home' | 'finish'`. Capture `xpBeforeCompletion` in MissionScreen before `completeMission` and render the finish route from that value to the awarded total. Home remains static. A delta of zero has no beam; a streak bonus at the ordinary-XP cap still moves by the bonus amount. A level crossing follows the old sector to its end, then the next sector to the new fraction.
- Adapt Inspira Animated Beam to props `{ containerRef: HTMLElement | null; fromRef: Element | null; toRef: Element | null; active: boolean; durationMs: number }` and emit `finished: []`. Measure only after refs exist, remeasure on resize, disconnect the observer on unmount, and run one 650 ms pass. Do not keep upstream `repeatCount="indefinite"`, random duration, or its immediate `watchEffect`/`stopEffect` initialization.

- [x] **Step 1: Write failing tests.** Test +10, the +20 streak bonus and its breakdown, a bonus crossing 90→120 XP, `+0` from daily cap and from clock rollback, and static final accessible text during the visual count. Assert the ship and beam move only when total XP increases. Continue and Map remain enabled during animation; reduced motion shows the final value and position immediately. Update `ui.spec.ts` to wait for the final visible number before a screenshot rather than finishing only CSS animations.
- [x] **Step 2: Verify red.** Run `rtk proxy bun run test src/presentation/screens/missionScreen.test.ts`, `rtk proxy bun run build`, then `rtk proxy bun run test:e2e tests/e2e/expedition-ui.spec.ts tests/e2e/ui.spec.ts tests/e2e/app.spec.ts`. Expect new ticker/route assertions to fail.
- [x] **Step 3: Implement.** Run `rtk proxy bun add @vueuse/core`. Copy/adapt Inspira Number Ticker and Animated Beam, replacing upstream default text classes with project tokens and importing every Vue API explicitly. Remove the upstream visibility observer: the finish award starts once on mount and is static under reduced motion. Extend XpRoute for the finish and keep star count as a separate block. The beam and ticker complete within about 650 ms without holding navigation or focus.
- [x] **Step 4: Verify green.** Run `rtk proxy bun run test src/presentation/screens/missionScreen.test.ts`, `rtk proxy bun run typecheck`, `rtk proxy bun run build`, and `rtk proxy bun run test:e2e tests/e2e/expedition-ui.spec.ts tests/e2e/ui.spec.ts tests/e2e/app.spec.ts`. Expected: exact XP values, truthful route motion, no duplicate accessible announcement, and no layout shift or hidden wait.
- [x] **Step 5: Commit.** Stage Task 4 files and commit `feat: animate earned xp on mission finish`.

### Task 5: Shared 66-fact sky and actual star reveals

**Files:**
- Modify: `src/presentation/screens/KnowledgeMapScreen.vue`, `src/presentation/screens/knowledgeMapScreen.test.ts`, `src/presentation/screens/HomeScreen.vue`, `src/presentation/screens/MissionScreen.vue`, `src/App.vue`, `tests/e2e/app.spec.ts`
- Create: `src/presentation/components/ConstellationSky.vue`, `src/presentation/components/constellationSky.test.ts`
- Test: `src/presentation/screens/knowledgeMapScreen.test.ts`, `tests/e2e/app.spec.ts`, `tests/e2e/expedition-ui.spec.ts`, `tests/e2e/ui.spec.ts`

**Interfaces:**
- `ConstellationSky.vue` props `{ earnedFactIds: readonly string[]; newlyUnlockedFactIds?: readonly string[]; variant: 'preview' | 'map' | 'final' }`. The component derives its 66 IDs from `allFacts().map(fact => fact.id)` and the existing `constellationPositions(66)` rather than accepting storage object order; a fact never changes its position or star state because another fact opened. App also passes this canonical order to the existing map archive.
- The preview is decorative and text accompanies its count. In the full map, each newly unlocked fact gets one short SVG line from the neutral center beacon to its fixed star position and a restrained star entrance. That line is a transient reveal effect, not a persistent mastery edge; no new progress field or graph algorithm is added. Multiple new IDs each receive their own line.
- `MissionScreen` emits `star-unlocked: [factId: string]` only after the newly earned fact is saved. App accumulates unique IDs until the first map visit, passes them once, then consumes them. On reload or later map visits there is no replay; all earned stars still render from persisted state.

- [x] **Step 1: Write failing tests.** Component tests cover 0/1/66 stars, canonical fact-ID-to-position mapping, two newly unlocked facts in one mission, one correct transient line per new ID, and unchanged positions/colors for old stars. E2E asserts the map says `Открыто звёзд: N из 66`, only earned facts use the gold treatment, due reviews stay separate, and reduced motion shows the final static sky without reveal lines. Reload and revisit the map: no new entrance.
- [x] **Step 2: Verify red.** Run `rtk proxy bun run test src/presentation/components/constellationSky.test.ts`; run `rtk proxy bun run build`, then `rtk proxy bun run test:e2e tests/e2e/expedition-ui.spec.ts tests/e2e/app.spec.ts`. Expect missing shared sky/reveal behavior.
- [x] **Step 3: Implement.** Extract the current orbit/star SVG into ConstellationSky, retaining `StarGlyph` and its earned/idle styling. Use it as a truthful compact home preview and full map; Task 6 will use its final variant. Move the long map explanation below the sky or behind the existing expandable detail so the map appears in the first viewport. Keep the 66 accessible fact labels and review list intact.
- [x] **Step 4: Verify green.** Run `rtk proxy bun run test src/presentation/components/constellationSky.test.ts src/presentation/screens/knowledgeMapScreen.test.ts`, `rtk proxy bun run typecheck`, `rtk proxy bun run build`, and `rtk proxy bun run test:e2e tests/e2e/expedition-ui.spec.ts tests/e2e/app.spec.ts tests/e2e/ui.spec.ts`. Expected: exact star count/order across surfaces, no false earned state, and no overflow at 320 px/200% text.
- [x] **Step 5: Commit.** Stage Task 5 files and commit `feat: reveal earned facts on the star map`.

### Task 6: One-time expedition celebration and release gate

**Files:**
- Modify: `package.json`, `bun.lock`, `src/presentation/screens/MissionScreen.vue`, `DESIGN.md`, `tests/device-checklist.md`, `tests/e2e/expedition-ui.spec.ts`, `tests/e2e/deployment.spec.ts`
- Create: `src/presentation/components/inspira/Confetti.vue`, `src/presentation/components/ExpeditionCelebration.vue`, `src/presentation/components/expeditionCelebration.test.ts`, `tests/support/expeditionFixture.ts`, `public/licenses/canvas-confetti.txt`
- Test: `src/presentation/screens/missionScreen.test.ts`, `tests/e2e/app.spec.ts`, `tests/e2e/expedition-ui.spec.ts`, `tests/e2e/deployment.spec.ts`

**Interfaces:** `ExpeditionCelebration.vue` props `{ active: boolean; reducedMotion: boolean }`. Mount it only when `completeMission` returns `expeditionJustFinished === true`, and fire at most once per mount. Its canvas is `aria-hidden`, non-interactive, confined to the sky illustration, and never covers headings, copy, or actions. A small local Confetti adapter keeps Inspira's `manualstart`/`fire()` interaction while loading `canvas-confetti` asynchronously; queue that one fire until the module and canvas are ready, and discard/cancel it if the screen unmounts or motion is reduced. Import failure leaves the static completion screen usable. Use `useWorker: false` and `disableForReducedMotion: true`; cap a single burst at about 48 particles and 100 ticks.

- [x] **Step 1: Write failing tests.** Seed a resumable one-card mission with `mode: 'expedition'`, `expeditionFinished: false`, completed/skipped diagnostic, 65 earned stars, and an unearned 66th familiar fact whose `mastery.independentSuccessDates` contains one date at least seven calendar days old. Give that fact a future review date, no same-day hint/error attempt, and put it alone in `currentMission.cardFactIds` so the Home `Играть` action resumes this exact queue. Assert the answer announces that fact's star; only after mission completion does the shared 66-star sky and one celebration appear. In component tests, mock the async confetti module and verify one `fire()` after readiness, zero after unmount or reduced motion, active cancellation when reduced motion changes, and a safe static screen on import failure. Reload and revisit map/maintenance: no replay. Seed localStorage **once**, not with an unconditional `addInitScript` that rewrites progress on every reload.
- [x] **Step 2: Verify red.** Ran the new focused unit tests before implementation; they failed because `ExpeditionCelebration.vue` did not exist. The first build also caught the deployment response typing issue; corrected it before implementation review.
- [x] **Step 3: Implement.** Added `canvas-confetti` and its type declarations. Built a small local adapter with Inspira's manual-start/`fire()` interaction, one-shot async guard, reduced-motion cancellation, lazy loading, and static fallback. Replaced the former finish illustration with ConstellationSky, kept confetti clipped to the sky (not copy or controls), preserved the ISC notice, and updated `DESIGN.md` plus the real-device checklist. The existing finish words and actions remain usable if the decorative chunk fails.
- [x] **Step 4: Verify all gates.** Passed `typecheck`, all 103 Vitest tests, and all 29 Playwright tests on both root and `/multiplay/` base paths. Chromium confirms offline precache delivery of the lazy `confetti.module` chunk and no celebration replay after reload; WebKit checks 428 px, 320 px/200%, desktop, map revisit, and reduced motion. Post-review polish adds Russian hyphenation to the completion heading and an E2E assertion at 320 px/200%; the saved zoom screenshot confirms words break at valid hyphenation points. Final root build: main JS 238.35 kB (84.64 kB gzip), CSS 32.87 kB (6.30 kB gzip), plus lazy confetti JS 10.58 kB (4.21 kB gzip). Compared with Task 5 (236.26/32.50 kB), the main JS/CSS grew 2.09/0.37 kB; the confetti stays outside the initial main chunk. Real iPhone verification and two short sessions with the son remain pending in `tests/device-checklist.md`; this is not a release sign-off.
- [x] **Step 5: Commit.** Committed as `feat: celebrate completed expedition once`; the automated gates and outstanding real-iPhone/child validation are recorded above.

### Post-implementation design review — 2026-10-01

- [x] Compared the main flow with DESIGN.md through two independent assessments and rendered mobile/desktop/200% text screenshots. Preserved the navy/paper/gold identity, calm learning cards, and separate XP/mastery meanings.
- [x] Moved the home launch action directly below the ship route; grouped the constellation preview, knowledge-star count, and map entry. Reduced emphasis on the parent report.
- [x] Removed the redundant finish eyebrow and decorative banner, flattened nested reward panels, and made the final 66-star sky the only illustration on expedition completion.
- [x] Kept the full input hint inside the input surface at 200% text, exposed the star-earning explanation on an empty map, and moved the asynchronous offline-ready notice below screen content to avoid shifting controls.
- [x] Updated DESIGN.md and verified the result: 103 unit tests, 29 full E2E tests, then all 14 affected E2E tests after final CSS cleanup; production build/typecheck and `git diff --check` passed. New E2E assertions cover home action order/viewport visibility, hint containment, empty-map guidance, and the single final illustration.
- [x] Ran the Impeccable detector once: zero errors and four shadow-color advisories. The shared soft shadow matches the documented Elevation & Depth rule; no design change is required for those advisories. Browser-detector overlay was not used; evidence comes from rendered browser scenarios and the CLI scan.

Final reviewed root build: main JS 238.52 kB (84.62 kB gzip), CSS 33.12 kB (6.39 kB gzip), lazy confetti 10.58 kB (4.21 kB gzip). This review's changes are uncommitted. Physical-iPhone checks and sessions with the child remain pending in `tests/device-checklist.md`.
