# Third-party notices

The root MIT License covers project-authored code and documentation only. It does not change the licenses of dependencies or bundled assets.

## Bundled asset

| Asset | Rights | Source and notes |
| --- | --- | --- |
| `app/assets/audio/dog-bark-george-public-domain.mp3` | Public-domain dedication verified in the source register; attribution is not required and is retained voluntarily | Broadbeer, “George vuf 1996.ogg”, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:George_vuf_1996.ogg). Bundled MP3 SHA-256: `699b691884c647feabf561cba932fdbad820835c6e4b1ce38f2105e60c8fabcf`. |

No other image, screenshot, or third-party media asset is bundled in this baseline.

## JavaScript dependencies

The direct app dependencies declare MIT in the committed `app/package-lock.json` metadata:

| Package | Version | License |
| --- | --- | --- |
| `@expo/metro-runtime` | 57.0.16 | MIT |
| `@react-native-async-storage/async-storage` | 2.2.0 | MIT |
| `expo` | 57.0.25 | MIT |
| `expo-audio` | 57.0.0 | MIT |
| `expo-notifications` | 57.0.3 | MIT |
| `expo-status-bar` | 57.0.0 | MIT |
| `react` | 19.2.3 | MIT |
| `react-dom` | 19.2.3 | MIT |
| `react-native` | 0.86.0 | MIT |
| `react-native-web` | 0.21.2 | MIT |

The generated [dependency license inventory](docs/dependency-license-inventory.md) lists the complete set of locked package/version records, including optional platform packages. The current lockfile contains no packages with missing license metadata. Package licenses remain their own and are not changed by the root MIT License.

Notable transitive notices:

- `caniuse-lite` browser-support data is marked CC-BY-4.0 in its package metadata; see the [upstream package](https://github.com/browserslist/caniuse-lite) and its installed license text.
- `lightningcss` and its platform package are build tooling under MPL-2.0.
- `node-forge` is offered under BSD-3-Clause or GPL-2.0; this project relies on the permissive BSD-3-Clause option.

The inventory is reproducible with `cd app && npm run licenses:scan`; `npm run check` verifies that it matches the clean install. Review all license changes before updating dependencies. Current advisory status and remaining upgrade work are recorded in [dependency review](docs/dependency-review.md).
