# Vercel browser preview

## Repository configuration

The root `vercel.json` installs the locked dependencies in `app`, runs `npm run build:web`, and serves `app/dist`. It follows the [Expo web publishing configuration](https://docs.expo.dev/guides/publishing-websites/) and [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json). The SPA rewrite returns the entry page for browser routes while Vercel serves exported assets.

In an owned Vercel project, import **e3o-labs/pet-readiness-simulator**, set Root Directory to the repository root, Framework to Other, and Node.js to 22.x (the CI baseline). The checked-in commands are the source of truth. Use PR previews first. Promote a reviewed commit to production only after the maintainer's release decision.

No environment variables are required for this preview. Keep `EXPO_PUBLIC_FEEDBACK_*` unset: the public app opens GitHub intake links and does not activate the optional remote feedback backend. Every `EXPO_PUBLIC_*` value is bundled into client code; never put credentials there. Do not configure real user data or production service settings for a preview.

## Local checks

```sh
cd app
npm ci
npm run check
```

Checks include synthetic tests, web export, the publication boundary, and the dependency license inventory. A web export is not an installable/offline PWA. Manifest/icons, service worker lifecycle, and supported-browser checks have separate roadmap issues.

## GitHub-connected deployment

Vercel can build directly from GitHub; a local CLI login is not required for this workflow.

1. Ensure the reviewed code is merged into `main`. That branch must contain `app/package.json`, `app/package-lock.json`, and root `vercel.json`.
2. In Vercel, create a project and import **e3o-labs/pet-readiness-simulator** using the intended owner/team.
3. Set Root Directory to the repository root (leave it blank or use `./`), Framework Preset to **Other**, and Node.js to **22.x**.
4. Use the settings below. The checked-in `vercel.json` supplies the install, build, and output values.
5. For ongoing work, use pull-request previews for review and the `main` branch for maintainer-approved production changes. Repository import can immediately deploy the configured production branch, so complete the release decision before importing it for production.

| Setting | Value |
| --- | --- |
| Root Directory | Repository root: blank/default or `./` |
| Framework Preset | Other |
| Install Command | `npm --prefix app ci` |
| Build Command | `npm --prefix app run build:web` |
| Output Directory | `app/dist` |
| Node.js Version | 22.x |
| Environment variables | None for the public browser preview |

After project creation, change these values under **Settings → Build and Deployment** and save. They apply on the next deployment. To deploy a review branch manually, use **Deployments → Create Deployment** and enter the branch name or public commit SHA as the Git reference. For example, `community/vercel-preview` is a branch name; Root Directory remains the repository root.

If install fails with `npm ci` reporting a missing lockfile, inspect the log's **Branch** and **Commit** first, then Root Directory. A seed-only branch cannot build the app. Confirm the deployed revision contains `app/package-lock.json`; repeating a deployment of the same incomplete revision will not add it.

See [Vercel Git deployment](https://vercel.com/docs/git) and [build settings](https://vercel.com/docs/builds/configure-a-build). After connecting the repository, verify access rules, preview visibility, and domain in Vercel.

## Optional CLI preview

The [official Vercel CLI](https://vercel.com/docs/cli) is an alternative for an authenticated maintainer. Archive tracked files from the exact public commit only; do not upload a private checkout or local workspace. The preview must not contain `.git`, local environment files, private operating documents, or participant/contact data.

```sh
vercel login
vercel deploy /path/to/public-snapshot --target=preview --yes
```

Use the intended Vercel team/project when linking the snapshot. A CLI deployment alone does not establish Git integration. Authentication and ownership/claim links belong in the private maintainer handoff, never in this public repository.

Issue forms and contribution links on GitHub use the default branch. Existing alpha intake issues work while PRs are being reviewed; per-topic templates become available after their changes reach `main`.

## Release record and rollback

Record the **public SHA**, optional tag, deployment URL/ID, preview/production environment, and verification result in the private operations repository. Publish only non-sensitive release notes and the corresponding public SHA. PR descriptions may include a preview URL and verification limits; omit claim URLs and private evidence.

Before production promotion, verify the core journey, storage reload, feedback links, accessibility, supported browsers, and outstanding dependency advisories. For a regression, redeploy the last reviewed public SHA or restore the prior owned deployment, then record that SHA and the rollback reason. Origin changes between previews, production, and a custom domain do not migrate browser-local progress automatically. Browser storage can also be cleared by the user or platform; do not promise permanent retention.
