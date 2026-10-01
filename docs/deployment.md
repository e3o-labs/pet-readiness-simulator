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

## Preview, ownership, and Git integration

Create a preview with the [official Vercel CLI](https://vercel.com/docs/cli) authenticated to the maintainer's account. Archive tracked files from the exact public commit only; do not upload a private checkout or local workspace. The preview must not contain `.git`, local environment files, private operating documents, or participant/contact data.

```sh
vercel login
vercel deploy /path/to/public-snapshot --target=preview --yes
```

Use the intended Vercel team/project when linking the snapshot. CLI preview deployment alone does not establish Git integration. After importing the repository, verify the repository connection, access rules, preview visibility, and domain in Vercel. Connecting a repository may trigger its production branch; use a branch containing the reviewed app, rather than the seed-only `main`, until the baseline is merged. Authentication and any ownership/claim links belong in the private maintainer handoff, never in this public repository.

Issue forms and contribution links on GitHub use the default branch. The two alpha intake issues work while baseline PRs are being reviewed; per-topic templates become available after the baseline and community changes reach `main`.

## Release record and rollback

Record the **public SHA**, optional tag, deployment URL/ID, preview/production environment, and verification result in the private operations repository. Publish only non-sensitive release notes and the corresponding public SHA. PR descriptions may include a preview URL and verification limits; omit claim URLs and private evidence.

Before production promotion, verify the core journey, storage reload, feedback links, accessibility, supported browsers, and outstanding dependency advisories. For a regression, redeploy the last reviewed public SHA or restore the prior owned deployment, then record that SHA and the rollback reason. Origin changes between previews, production, and a custom domain do not migrate browser-local progress automatically. Browser storage can also be cleared by the user or platform; do not promise permanent retention.
