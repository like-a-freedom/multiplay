# Multiplay

Умножайка is a Russian-language PWA for home multiplication practice, with flashcards, spaced reviews, XP, daily streaks, and a star map. It is designed for the iPhone 12 Pro Max. Once cached, it works offline. Progress stays in `localStorage` for the current browser context. There are no accounts, backend, or third-party analytics. iPhone Screen Time control is not implemented.

The Orbit Club interface introduces Orbi, an original astronaut companion, with a skippable welcome. Fifteen adapted Inspira UI components provide floating orbit scenes, shimmer and ripple buttons, a touch-friendly dock, explicit answer-card flips, a knowledge gauge, and bounded celebrations. Motion honors reduced-motion preferences; ambient scenes pause offscreen and when hidden. The generated astronaut, spacecraft and ringed planet share materials and lighting. The XP ship follows the same curve as its visible track. Nunito's Cyrillic and Latin fonts and all three illustrations are hosted locally and included in the PWA cache.

## Development

Use the Node.js version specified in [.node-version](.node-version) and Bun, as declared by `packageManager`.

```sh
bun install --frozen-lockfile
bun run dev
```

```sh
bun run test                # Vitest: learning rules, rewards, persistence, and UI
bun run build               # type-check + static assets and service worker in dist/
bun x playwright install webkit chromium
bun run test:e2e -- --workers=1
bun run preview             # preview the build locally; not a production server
```

On Linux, install Playwright with `--with-deps`. Do not commit `dist/`, dependencies, or test reports. Commit `bun.lock` and use `--frozen-lockfile`.

## Deploy

Deploy `dist/` to a static HTTPS host. Node.js and Bun are needed for the build, not the host. The default base path is `/`; for a GitHub Pages project site, use `/<repo>/`:

```sh
APP_BASE_PATH=/multiplay/ bun run build
APP_BASE_PATH=/multiplay/ bun run test:e2e -- tests/e2e/deployment.spec.ts --workers=1
APP_BASE_PATH=/multiplay/ bun run preview
```

The local URL is `http://localhost:4173/multiplay/`. Rebuild after changing the base path. See [DEPLOYMENT.md](DEPLOYMENT.md) for host settings and PWA checks.

CI runs unit tests, builds the app, and checks the UI in WebKit. Chromium checks PWA paths and offline reload at `/` and `/multiplay/`. Enable GitHub Pages with **Settings → Pages → GitHub Actions**, then run **Deploy GitHub Pages** once from **Actions**. Later pushes to `main` deploy automatically.

## Documentation

- [PRD.md](PRD.md): learning and game rules.
- [DESIGN.md](DESIGN.md): visual design system.
- [docs/design-review-2026-10-01.md](docs/design-review-2026-10-01.md): design review and Inspira component choices.
- [AGENTS.md](AGENTS.md): development conventions and architecture.
- [tests/device-checklist.md](tests/device-checklist.md): checks on a real iPhone.

## Data and licensing

Clearing browser data or changing the site address or browser context can make progress unavailable. There is no cloud backup or way to transfer progress. Choose a permanent address before family use.

The project uses the MIT License in [LICENSE](LICENSE). Inspira UI components are adapted under MIT; see [public/licenses/inspira-ui.txt](public/licenses/inspira-ui.txt). Orbi, the ship, planet, galaxy and both knowledge-star sprites are original generated illustrations; their exact prompts and provenance are saved in [public/art/](public/art/). The earlier Phosphor star silhouette has been replaced; its historical MIT notice remains in [public/licenses/phosphor-icons.txt](public/licenses/phosphor-icons.txt).

Nunito is distributed under the SIL Open Font License; see [public/licenses/nunito.txt](public/licenses/nunito.txt). The original generated mascot's prompt and provenance are recorded in [public/art/orbit-mascot.prompt.md](public/art/orbit-mascot.prompt.md).

The spacecraft and planet were generated with Orbi as a style reference; their exact prompts, sources and alpha validation are in [public/art/orbit-route-assets.prompt.md](public/art/orbit-route-assets.prompt.md).
