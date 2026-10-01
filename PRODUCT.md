# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Confirmed: Vue 3, TypeScript, Vite, Tailwind CSS v4 utilities, adapted local Inspira UI components, `motion-v` with `LazyMotion`, `vite-plugin-pwa`, local `localStorage`, and Vitest for learning rules. Presentation uses bounded feedback motion and ambient illustration motion that pauses offscreen and when the document is hidden; reduced motion keeps a static, complete experience. No Pinia or Vue Router in the first version. Static HTTPS hosting; no application server or account system.

## Users

The primary user is the owner's 10-year-old son, a fourth-grade student using an iPhone 12 Pro Max. His parent reviews learning progress. No known vision, motor, reading, sound, or motion accommodations were reported; standard accessible controls remain required.

## Product Purpose

Help this one child learn and retain multiplication facts with both factors from 0 through 10 inclusive through short, playful flashcard missions. Success means he recalls facts without hints after several days and is willing to return to practice. This is a family project, not a product for a market.

## Operating Context

The child practices on his iPhone, often independently. A mission has up to ten cards. The app works offline after the required assets have been successfully cached and stores progress on that device. The child keeps every earned achievement star. The parent can inspect learning status separately; a later lapse marks a fact for review without removing its star. Local data has no backup and may be lost. Future screen-time accounting, if adopted, requires the parent to approve time in Apple's Screen Time controls manually.

## Capabilities and Constraints

- Card shows a multiplication prompt before the answer; the child enters a number or chooses “Не знаю.”
- Missions mix easy and difficult facts and reserve up to two slots for unseen facts. Errors receive a prepared explanatory strategy.
- Difficult facts return across days. Mastery requires independent correct recall on separate days, at least seven days apart with no intervening error, as defined in `PRD.md`.
- Game progress uses XP, levels, a daily streak, milestone bonuses, and a knowledge map. XP rewards completion even when all answers are “Не знаю.” Permanent achievement stars are separate from current recall status. Game points do not define mastery.
- Once all 66 stars are earned, the expedition finishes once and enters maintenance: scheduled reviews and optional practice, with no daily streak or streak bonuses. XP and levels remain; later errors do not undo completion. New math topics are outside scope.
- No login, cloud sync, ads, leaderboard, lives, native iOS app, or automatic phone restrictions.
- The family chose a cosmic expedition as the game's visual theme. It must not alter the learning rules.

## Brand Commitments

The redesigned game world is the Orbit Club: lavender daylight, navy text, mint and coral accents, rounded Nunito lettering, and an original clay astronaut companion called Orbi. A separately generated spacecraft and ringed planet share Orbi's materials, palette and lighting. The XP ship follows the same curve as the visible track; the same planet also appears beside Orbi. The child first meets Orbi through a skippable invitation. Home and mission finish carry the playful scene; solving keeps the equation, input, and next action prominent. The knowledge map is a darker galaxy with permanent stars. Inspira UI supplies native motion and interactive treatments, adapted locally; artwork and Cyrillic fonts are cached for offline use. The product name remains «Умножайка».

## Evidence on Hand

The confirmed requirements and research links are in `PRD.md`. The playable Vue PWA has the Orbit Club presentation, reusable star artwork, and a source-grounded Inspira component review in `docs/design-review-2026-10-01.md`. Its design is recorded in `DESIGN.md`. The child's real-world baseline knowledge and response to the new presentation have not yet been recorded.

## Product Principles

1. Keep one obvious next action on each screen.
2. Make recall and spaced review the learning engine; use rewards to encourage return visits.
3. Reward effort and regularity without punishing wrong answers.
4. Keep the app small, private, offline-capable, and easy to maintain.

## Document Authority

`PRD.md` owns behavior and acceptance criteria, `DESIGN.md` owns visual and interaction rules, and `AGENTS.md` owns implementation conventions. `CONTEXT.md` defines domain terms. This file summarizes those decisions; it does not introduce separate rules.
