# Static hosting and deployment

Verified against official documentation on September 30, 2026. This PWA only needs static HTTPS hosting and the `dist/` directory. It does not need a server process, container, SSR, or Pages Functions. `vite preview` is for local checks only. See the [Vite static deployment guide](https://vite.dev/guide/static-deploy).

## Deployment setup in this repository

- `APP_BASE_PATH` keeps Vite, asset paths, `start_url`, `id`, manifest scope, and service worker scope in sync. Use `/` for a site at the domain root and `/<repo>/` for a project site. [Vite](https://vite.dev/guide/static-deploy), [vite-plugin-pwa requirements](https://vite-pwa-org.netlify.app/guide/pwa-minimal-requirements).
- `.node-version` and `packageManager` pin the Node.js and Bun versions tested locally. `bun.lock` and `bun install --frozen-lockfile` make installs reproducible. [Bun install docs](https://bun.com/docs/pm/cli/install).
- `ci.yml` runs Vitest, builds the app, and checks the UI in Safari/WebKit. Chromium checks the manifest, service worker, and offline reload at the root and under a project path. Playwright documents service worker support for Chromium only. WebKit 1.63.0 also has a reproducible internal error on offline navigation, so the iPhone check remains manual. [Playwright docs](https://playwright.dev/docs/service-workers), [reproduction report](https://github.com/microsoft/playwright/issues/42775).
- `pages.yml` manually deploys the tested artifact from the default branch. Actions are pinned to commit SHAs, permissions are scoped to each job, and Dependabot updates the Action references. [GitHub Actions security guidance](https://docs.github.com/en/actions/reference/security/secure-use).
- `public/_headers` configures Cloudflare to revalidate HTML, the manifest, and `sw.js`, cache hashed assets for longer, and set basic security headers. Cloudflare copies these rules to `dist/_headers`; GitHub Pages does not apply them. [Cloudflare headers](https://developers.cloudflare.com/pages/configuration/headers/).

## GitHub Pages

1. Create a repository and push the prepared code, including `bun.lock` and `.github/`. Avoid generating another README or license during repository creation unless you plan to merge the histories later.
2. Wait for **CI** to pass. Under **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. Under **Actions → Deploy GitHub Pages → Run workflow**, select the default branch. The workflow reads `base_path` from the Pages settings, builds and tests the app, then publishes `dist/`. Runs from other branches are skipped.
4. Open the URL from the `deploy` job. A project site usually uses `https://<owner>.github.io/<repo>/`; a user site or custom domain uses `/`.

The workflow uses the official `configure-pages`, `upload-pages-artifact`, and `deploy-pages` Actions from the [Vite example](https://vite.dev/guide/static-deploy). The `base_path` output is documented in the [configure-pages action](https://github.com/actions/configure-pages/blob/main/action.yml). Automatic deployment on push is not enabled yet. Once you choose GitHub Pages, you can add it to the default branch workflow.

## Cloudflare Pages with Git integration

Connect the repository under **Workers & Pages → Pages → Import an existing Git repository**. Choose the Vue/Vite preset and set:

| Setting | Value |
| --- | --- |
| Production branch | Repository's default branch |
| Root directory | Repository root |
| Build command | `bun install --frozen-lockfile && bun run build` |
| Build output directory | `dist` |
| `BUN_VERSION` | `1.4.2` |
| `NODE_VERSION` | `22.22.3` (also set in `.node-version`) |
| `SKIP_DEPENDENCY_INSTALL` | `true`; the build command installs dependencies |
| `APP_BASE_PATH` | `/`, or leave unset |

Set these variables for both production and preview environments. Do not set `NODE_ENV=production` before installing dependencies: Vite and the type checker are in `devDependencies`. Cloudflare documents Bun, Node.js, and `SKIP_DEPENDENCY_INSTALL` in [Build image](https://developers.cloudflare.com/pages/configuration/build-image/), and the output directory in [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/).

With Git integration enabled, pushes create production or preview deployments according to the branch settings. This pipeline does not wait for GitHub CI. For the usual workflow, merge changes into the default branch after CI passes. If needed, make CI a required check. [Cloudflare Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/).

Choose a Pages project rather than a Workers project. This app does not need a Cloudflare API token in the repository, Wrangler, the Cloudflare Vite plugin, or server functions. Use preview URLs for testing and keep the production URL for your child's practice.

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

The GitHub CI workflow and Cloudflare headers still need checks in their hosted environments. Check the live site after deployment. Local preparation does not publish it.
