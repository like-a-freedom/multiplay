# Repository Guidelines

## Project Structure

This repository defines a multiplication PWA for one 10-year-old using iPhone 12 Pro Max. Use `PRD.md` for behavior, `DESIGN.md` for presentation, `PRODUCT.md` for context, and `CONTEXT.md` for terms; keep summaries consistent. Keep the app client-side: no server, accounts, or remote progress storage. Put code in `src/`, assets in `public/`, and tests near the code or in `tests/`. Store progress locally.

## Technology and Development

Use Vue 3 with TypeScript and Vite, CSS design tokens, Tailwind CSS v4 for focused utility styling, and `vite-plugin-pwa` for offline assets. Tailwind Preflight stays disabled to preserve existing controls. Inspira UI is a copy-and-adapt source library: keep only local components used by the product and retain its MIT notice. Use a small Vue composable for shared game state and a versioned `localStorage` record for persistence. Start without Pinia or Vue Router; add them only if real complexity warrants it. Use Vitest for learning and persistence rules. **Package manager: bun only — do not use npm or npx anywhere in this repo.** Commands (bun): `bun install` — install dependencies; `bun run dev` — dev server; `bun run build` — typecheck plus production build including the service worker; `bun run preview` — preview the build locally; `bun run typecheck` — typecheck only (`vue-tsc`); `bun run test` / `bun run test:watch` — Vitest (use `bun run test`: the command `bun test` invokes a different runner); `bun run test:e2e` — Playwright (WebKit emulating an iPhone 12 Pro Max; see `tests/device-checklist.md` for the real-device pass). PWA icons are generated with `python3 scripts/generate-icons.py`. TypeScript is pinned to 5.9: `vue-tsc` 3.x does not support TypeScript 7 yet.

## Architecture

DDD layers under `src/`, dependencies point inward only: `domain/` (pure functions and types: `fact/`, `learning/`, `game/`, `mission/`, `progress/` — no Vue, no browser APIs), `application/` (use cases `startMission`, `submitCardAnswer`, `completeMission`, `diagnostic` and the `ProgressStore` port), `infrastructure/` (the `LocalStorageProgressStore` adapter and the versioned `snapshot.ts`), `presentation/` (Vue: `components/`, `screens/`, `composables/gameSession.ts`, `styles/tokens.css` with the tokens from `DESIGN.md`). The composition root is `src/main.ts`. Imports go through the `@/` alias; a layer never imports anything above it. Tests live next to the code (`*.test.ts`).

## Learning and Screen-Time Behavior

Show one problem at a time, give clear feedback, and persist progress locally. Use short missions, cumulative XP, levels, a daily streak, milestone bonuses, and a simple knowledge map as defined in `PRD.md`. Keep learning mastery separate from game points. After expedition completion, use maintenance reviews without daily streaks. Avoid leaderboards, lives, and penalties for wrong answers. Screen-time accounting is optional and outside the first version. A PWA cannot enforce iPhone-wide Screen Time restrictions; any later allowance feature must clearly require manual parent approval. Keep learning records on-device; do not add tracking or transmit them.

## Code Style and Naming

Use two-space indentation, PascalCase Vue component files and camelCase TypeScript names. No formatter or linter is configured yet. Use descriptive names such as `fact`, `answer`, and `nextReviewDate`. Keep learning and review rules as pure TypeScript functions separate from Vue components. Use design tokens from `DESIGN.md` in both scoped CSS and Tailwind aliases; avoid one-off visual values and dependencies without a clear need. Prefer Tailwind utilities for new isolated presentation pieces and keep existing screen styles in token-based CSS.

## Testing

Deployment checks use Chromium for manifest paths, worker scope and offline reload; UI flows use WebKit. Install both with `bun x playwright install webkit chromium` (add `--with-deps` on Linux). `APP_BASE_PATH` selects the hosting path for both build and tests. CI checks `/` and `/multiplay/`; see `DEPLOYMENT.md` before publishing. Node and Bun versions are pinned in `.node-version` and `packageManager`; use `bun install --frozen-lockfile`.

Vitest covers the domain rules and persistence: question generation, answer checking, review scheduling, progress persistence, reward idempotency, calendar boundaries, lapses, and failed storage writes. Playwright (WebKit, iPhone 12 Pro Max emulation) runs the e2e flows. No coverage percentage is mandated. Verify that saved progress survives a reload and that the core practice flow works offline on the target iPhone (`tests/device-checklist.md`).

## Commits and Pull Requests

Use concise, imperative commit subjects, for example `add multiplication practice flow`. Pull requests should describe the user-visible change, include relevant screenshots for interface changes, and list checks that were run. Call out changes to learning or review rules explicitly.
