# iOS scene lifecycle

Apps linked against the iOS 27 SDK must adopt UIKit's scene-based lifecycle to launch on iOS 27. The Expo 57 Swift template used by this project creates its window in `AppDelegate` and does not declare a scene manifest.

`app/plugins/with-ios-scene-lifecycle.cjs` runs during iOS prebuild. It keeps Expo's React Native factory and app delegate subscribers, creates the window from `UIWindowScene`, declares a single application scene, and forwards scene lifecycle callbacks to Expo. It retains cold-start URL/universal-link information in React Native launch options and forwards warm links through the existing app delegate handlers. It does not change storage, app screens, learning visibility, camera permissions, or web behavior.

The scene delegate lives in the generated `AppDelegate.swift` so it is compiled by the existing Xcode target without an extra source-file registration step. Native output remains generated and is not checked in. The plugin rejects unsupported or already customized templates rather than silently generating a partial migration. Repeated application and plist key reordering are covered by the regression test.

## Local checks

```sh
cd app
npm test
npm run check:public
npm run licenses:check
npm run build:web
# In an isolated native verification checkout with a local bundle identifier:
npx expo prebuild --platform ios --no-install
```

Build and verify the generated Release app on both iOS 26 and 27. Check cold launch, background/foreground, termination/relaunch, progress restoration, and cold/warm URL opening. Do not treat simulator checks as physical-device or TestFlight verification. Release operations must identify the exact reviewed public SHA; keep private logs, signing configuration, deployment identifiers, and device reports in the operations repository.

## References

- [Apple: Transitioning to the UIKit scene-based lifecycle](https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle)
- [Expo: Config plugins and native mods](https://docs.expo.dev/config-plugins/mods/)

The app delegate modification is intentionally limited to the pinned Expo template. Review it before upgrading Expo or introducing another scene integration.
