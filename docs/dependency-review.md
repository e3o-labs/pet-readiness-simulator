# Dependency review

## Baseline scan — 2026-09-29

The clean install used the committed npm lockfile after applying non-breaking updates to vulnerable transitive dependencies. The scan reported zero critical and high advisories and ten moderate advisories in the Expo toolchain, including its configuration and Xcode-related dependency chain.

The remaining npm recommendation offers Expo 46.0.21 as a breaking downgrade from the Expo 57 line used by this app. That downgrade was not applied. Resolve the moderate findings through a supported Expo SDK upgrade and repeat clean install, test, web export, and audit before a tagged product release.

The high-severity `image-size` advisory was addressed with a lockfile override to version 2.0.4. The existing Metro call shape remained compatible in the clean web export. The upstream package lists CommonJS support and the current version on its [npm package page](https://www.npmjs.com/package/image-size?activeTab=versions).

This snapshot is not a permanent security guarantee. Re-run `npm audit` against the current registry before each release and review the full advisory details.
