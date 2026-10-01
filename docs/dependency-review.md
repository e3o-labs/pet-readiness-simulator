# Dependency review

## Baseline scan — 2026-09-29

The clean install used the committed npm lockfile after applying non-breaking updates to vulnerable transitive dependencies. The scan reported zero critical and high advisories and ten moderate advisories in the Expo toolchain, including its configuration and Xcode-related dependency chain.

The remaining npm recommendation offers Expo 46.0.21 as a breaking downgrade from the Expo 57 line used by this app. That downgrade was not applied. Resolve the moderate findings through a supported Expo SDK upgrade and repeat clean install, test, web export, and audit before a tagged product release.

The high-severity `image-size` advisory was addressed with a lockfile override to version 2.0.4. The existing Metro call shape remained compatible in the clean web export. The upstream package lists CommonJS support and the current version on its [npm package page](https://www.npmjs.com/package/image-size?activeTab=versions).

This snapshot is not a permanent security guarantee. Re-run `npm audit` against the current registry before each release and review the full advisory details.

## PR review update — 2026-10-01

A fresh registry audit of the original lockfile reported 24 moderate package entries, with zero high or critical entries. The entries followed one underlying [uuid advisory](https://github.com/uuidjs/uuid/security/advisories/GHSA-w5hq-g745-h8pq) through the Expo/Xcode dependency chain; this is not a count of 24 independent vulnerabilities.

The app now pins only `xcode`'s transitive `uuid` dependency to the patched CommonJS-compatible **11.1.1**, using a scoped npm override. The only package version changed is `uuid` from 7.0.3 to 11.1.1; direct Expo and React dependencies remain at their locked versions. The dependency license inventory was regenerated and still contains 498 package/version records.

After the override, clean `npm ci` and `npm audit --json` reported **zero advisories in all severity categories**. Verification includes the existing app tests, web export, public-boundary and license checks, plus a focused smoke check of Xcode tooling's CommonJS `generateUuid()` call. Native iOS/Android builds are outside this browser baseline's verification scope. The registry result describes this lockfile at the review date.
