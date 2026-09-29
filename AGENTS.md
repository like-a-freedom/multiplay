# Repository Guidelines

## Project Structure

This repository defines a multiplication PWA for one 10-year-old using iPhone 12 Pro Max. Use `PRD.md` for behavior, `DESIGN.md` for presentation, `PRODUCT.md` for context, and `CONTEXT.md` for terms; keep summaries consistent. Keep the app client-side: no server, accounts, or remote progress storage. Put code in `src/`, assets in `public/`, and tests near the code or in `tests/`. Store progress locally.

## Technology and Development

Use Vue 3 with TypeScript and Vite, plain CSS, and `vite-plugin-pwa` for offline assets. Use a small Vue composable for shared game state and a versioned `localStorage` record for persistence. Start without Pinia or Vue Router; add them only if real complexity warrants it. Use Vitest for learning and persistence rules. Commands (npm, Node 22): `npm install` — установка зависимостей; `npm run dev` — dev-сервер; `npm run build` — typecheck + production build (включая service worker); `npm run preview` — локальный просмотр сборки; `npm run typecheck` — только проверка типов (`vue-tsc`); `npm test` / `npm run test:watch` — Vitest; `npm run test:e2e` — Playwright (WebKit в эмуляции iPhone 12 Pro Max, см. `tests/device-checklist.md` для проверки на реальном телефоне). Иконки PWA генерируются: `python3 scripts/generate-icons.py`. TypeScript закреплён на 5.9: `vue-tsc` 3.x ещё не поддерживает TypeScript 7.

## Architecture

DDD-слои под `src/`, зависимости только внутрь: `domain/` (чистые функции и типы: `fact/`, `learning/`, `game/`, `mission/`, `progress/` — без Vue и браузерных API), `application/` (use cases `startMission`, `submitCardAnswer`, `completeMission`, `diagnostic` и port `ProgressStore`), `infrastructure/` (адаптер `LocalStorageProgressStore`, версионированный снимок `snapshot.ts`), `presentation/` (Vue: `components/`, `screens/`, `composables/gameSession.ts`, `styles/tokens.css` — токены из `DESIGN.md`). Composition root — `src/main.ts`. Импорты через алиас `@/`; слой не импортирует вышележащие. Тесты лежат рядом с кодом (`*.test.ts`).

## Learning and Screen-Time Behavior

Show one problem at a time, give clear feedback, and persist progress locally. Use short missions, cumulative XP, levels, a daily streak, milestone bonuses, and a simple knowledge map as defined in `PRD.md`. Keep learning mastery separate from game points. After expedition completion, use maintenance reviews without daily streaks. Avoid leaderboards, lives, and penalties for wrong answers. Screen-time accounting is optional and outside the first version. A PWA cannot enforce iPhone-wide Screen Time restrictions; any later allowance feature must clearly require manual parent approval. Keep learning records on-device; do not add tracking or transmit them.

## Code Style and Naming

Use two-space indentation, PascalCase Vue component files and camelCase TypeScript names. No formatter or linter is configured yet. Use descriptive names such as `fact`, `answer`, and `nextReviewDate`. Keep learning and review rules as pure TypeScript functions separate from Vue components. Use design tokens from `DESIGN.md`; avoid one-off visual values and dependencies without a clear need.

## Testing

No test framework is configured yet. Add tests when the app implementation is introduced, especially for question generation, answer checking, review scheduling, and progress persistence. Cover reward idempotency, calendar boundaries, lapses and failed storage writes. No coverage percentage is mandated. Verify that saved progress survives a reload and that the core practice flow works offline on the target iPhone.

## Commits and Pull Requests

There is no Git history yet, so no repository-specific commit convention can be inferred. Use concise, imperative commit subjects, for example `add multiplication practice flow`. Pull requests should describe the user-visible change, include relevant screenshots for interface changes, and list checks that were run. Call out changes to learning or review rules explicitly.
