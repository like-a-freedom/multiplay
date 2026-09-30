# Static hosting and deployment

Verified against official documentation on September 30, 2026. This PWA only needs static HTTPS hosting and the `dist/` directory. It does not need a server process, container, SSR, or Pages Functions. `vite preview` is for local checks only. See the [Vite static deployment guide](https://vite.dev/guide/static-deploy).

## Deployment setup in this repository

- `APP_BASE_PATH` keeps Vite, asset paths, `start_url`, `id`, manifest scope, and service worker scope in sync. Use `/` for a site at the domain root and `/<repo>/` for a project site. [Vite](https://vite.dev/guide/static-deploy), [vite-plugin-pwa requirements](https://vite-pwa-org.netlify.app/guide/pwa-minimal-requirements).
- `.node-version` and `packageManager` pin the Node.js and Bun versions tested locally. `bun.lock` and `bun install --frozen-lockfile` make installs reproducible. [Bun install docs](https://bun.com/docs/pm/cli/install).
- `ci.yml` runs Vitest, builds the app, and checks the UI in Safari/WebKit. Chromium checks the manifest, service worker, and offline reload at the root and under a project path. Playwright documents service worker support for Chromium only. WebKit 1.63.0 also has a reproducible internal error on offline navigation, so the iPhone check remains manual. [Playwright docs](https://playwright.dev/docs/service-workers), [reproduction report](https://github.com/microsoft/playwright/issues/42775).
- `pages.yml` deploys the tested artifact on pushes to the default branch and supports a manual run for first setup. Actions are pinned to commit SHAs, permissions are scoped to each job, and Dependabot updates the Action references. [GitHub Actions security guidance](https://docs.github.com/en/actions/reference/security/secure-use).

## GitHub Pages

1. Create a repository and push the prepared code, including `bun.lock` and `.github/`. Avoid generating another README or license during repository creation unless you plan to merge the histories later.
2. Wait for **CI** to pass. Under **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. For the first deployment, go to **Actions → Deploy GitHub Pages → Run workflow** and select `main`. The workflow reads `base_path` from the Pages settings, builds and tests the app, then publishes `dist/`. Later pushes to `main` deploy automatically; runs from other branches are skipped. If a run started before Pages was enabled, rerun it after changing the Pages source.
4. Open the URL from the `deploy` job. A project site usually uses `https://<owner>.github.io/<repo>/`; a user site or custom domain uses `/`.

The workflow uses the official `configure-pages`, `upload-pages-artifact`, and `deploy-pages` Actions from the [Vite example](https://vite.dev/guide/static-deploy). The `base_path` output is documented in the [configure-pages action](https://github.com/actions/configure-pages/blob/main/action.yml).

## Check the first deployment

1. Confirm that HTML, JS/CSS, PNG files, `manifest.webmanifest`, and `sw.js` load without 404 errors. The manifest should use the `application/manifest+json` MIME type, and the site must use HTTPS.
2. On the iPhone, open the site in Safari and add it to the Home Screen. Wait for the offline-ready message, complete a mission, close the PWA, then reopen it without a network connection. Confirm that progress is still there.
3. After the next deployment, check that the app offers an update between missions. Accepting the update should preserve local learning progress and XP. Do not clear site data to apply an update.
4. Complete the [device checklist](tests/device-checklist.md). WebKit emulation does not verify PWA installation or iOS behavior on the actual phone.

HTTPS and a valid manifest are part of the [PWA requirements](https://vite-pwa-org.netlify.app/guide/pwa-minimal-requirements). The existing service worker handles asset caching and app updates. The host's HTTP cache and the PWA's offline cache are separate layers.

## Public repository checks

- The GitHub repository is public and has an MIT license in `LICENSE`. Keep the license with the source. [GitHub licensing](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).
- Check documentation, source files, images, and Git history for personal information and secrets. `.gitignore` excludes `.env*` and `.aws/`, but it does not remove data already committed. A spot check of the current files does not scan the full history.
- Pick a permanent site address before progress builds up. Changing the origin or PWA browser context does not move `localStorage`. Sites under the same `*.github.io` origin also share `localStorage`; keep one copy of the game on that origin.

The GitHub CI workflow still needs a successful hosted run. Check the live site after the first deployment. Local preparation does not publish it.
