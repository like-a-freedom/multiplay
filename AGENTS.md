# Repository Guidelines

## Project Structure

This repository defines a multiplication PWA for one 10-year-old using iPhone 12 Pro Max. Use `PRD.md` for behavior, `DESIGN.md` for presentation, `PRODUCT.md` for context, and `CONTEXT.md` for terms; keep summaries consistent. Keep the app client-side: no server, accounts, or remote progress storage. Put code in `src/`, assets in `public/`, and tests near the code or in `tests/`. Store progress locally.

## Technology and Development

Use Vue 3 with TypeScript and Vite, plain CSS, and `vite-plugin-pwa` for offline assets. Use a small Vue composable for shared game state and a versioned `localStorage` record for persistence. Start without Pinia or Vue Router; add them only if real complexity warrants it. Use Vitest for learning and persistence rules. No app scaffold or package scripts exist yet; when added, document exact install, dev, build, and test commands here.

## Learning and Screen-Time Behavior

Show one problem at a time, give clear feedback, and persist progress locally. Use short missions, cumulative XP, levels, a daily streak, milestone bonuses, and a simple knowledge map as defined in `PRD.md`. Keep learning mastery separate from game points. After expedition completion, use maintenance reviews without daily streaks. Avoid leaderboards, lives, and penalties for wrong answers. Screen-time accounting is optional and outside the first version. A PWA cannot enforce iPhone-wide Screen Time restrictions; any later allowance feature must clearly require manual parent approval. Keep learning records on-device; do not add tracking or transmit them.

## Code Style and Naming

Use two-space indentation, PascalCase Vue component files and camelCase TypeScript names. No formatter or linter is configured yet. Use descriptive names such as `fact`, `answer`, and `nextReviewDate`. Keep learning and review rules as pure TypeScript functions separate from Vue components. Use design tokens from `DESIGN.md`; avoid one-off visual values and dependencies without a clear need.

## Testing

No test framework is configured yet. Add tests when the app implementation is introduced, especially for question generation, answer checking, review scheduling, and progress persistence. Cover reward idempotency, calendar boundaries, lapses and failed storage writes. No coverage percentage is mandated. Verify that saved progress survives a reload and that the core practice flow works offline on the target iPhone.

## Commits and Pull Requests

There is no Git history yet, so no repository-specific commit convention can be inferred. Use concise, imperative commit subjects, for example `add multiplication practice flow`. Pull requests should describe the user-visible change, include relevant screenshots for interface changes, and list checks that were run. Call out changes to learning or review rules explicitly.
