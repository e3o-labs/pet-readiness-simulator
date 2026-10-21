import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { migrateAppDelegate, configureSceneManifest } = require('../plugins/with-ios-scene-lifecycle.cjs');

// The window bootstrap emitted by the supported Expo 57 Swift template.
const bootstrap = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif`;
const source = `import Expo
import React
class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?
  func application(_ app: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
${bootstrap}
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  // existing linking and notification delegates stay in this class
}
`;
const migrated = migrateAppDelegate(source);
assert.equal(migrateAppDelegate(migrated), migrated, 'Repeated prebuild must not duplicate the scene delegate.');
assert.equal((migrated.match(/class ReadinessSceneDelegate:/g) || []).length, 1);
assert.ok(!migrated.includes('UIWindow(frame: UIScreen.main.bounds)'), 'Window creation must use its scene.');
assert.ok(migrated.includes('UIWindow(windowScene: windowScene)'));
assert.ok(migrated.includes('return super.application(application, didFinishLaunchingWithOptions: launchOptions)'));
assert.ok(migrated.includes('// existing linking and notification delegates stay in this class'));
for (const method of ['applicationDidBecomeActive', 'applicationWillResignActive', 'applicationWillEnterForeground', 'applicationDidEnterBackground']) {
  assert.ok(migrated.includes(`appDelegate.${method}(UIApplication.shared)`), `Expo lifecycle forwarding missing: ${method}`);
}
assert.ok(migrated.includes('options[.url] = context.url'), 'Cold-start URL must reach React Native launch options.');
assert.ok(migrated.includes('UIApplicationLaunchOptionsUserActivityKey'), 'Cold universal link activity must be retained.');
assert.ok(migrated.includes('open: context.url, options: options'), 'Warm scene links must reach the existing AppDelegate.');
assert.throws(() => migrateAppDelegate(source.replace('factory.startReactNative(', 'factory.changedBootstrap(')), /Unsupported Expo/);
assert.throws(() => migrateAppDelegate(source + '\n// configurationForConnecting'), /Existing scene/);

const original = { ITSAppUsesNonExemptEncryption: false, NSMicrophoneUsageDescription: 'Existing module setting' };
const plist = configureSceneManifest(original);
assert.equal(original.UIApplicationSceneManifest, undefined, 'Do not mutate the input plist.');
assert.equal(plist.ITSAppUsesNonExemptEncryption, false);
assert.equal(plist.NSMicrophoneUsageDescription, original.NSMicrophoneUsageDescription);
assert.equal(plist.UIApplicationSceneManifest.UIApplicationSupportsMultipleScenes, false);
assert.equal(plist.UIApplicationSceneManifest.UISceneConfigurations.UIWindowSceneSessionRoleApplication[0].UISceneDelegateClassName,
  '$(PRODUCT_MODULE_NAME).ReadinessSceneDelegate');
assert.deepEqual(configureSceneManifest(plist), plist);
const reordered = structuredClone(plist);
const configuration = reordered.UIApplicationSceneManifest.UISceneConfigurations.UIWindowSceneSessionRoleApplication[0];
reordered.UIApplicationSceneManifest.UISceneConfigurations.UIWindowSceneSessionRoleApplication[0] = {
  UISceneDelegateClassName: configuration.UISceneDelegateClassName,
  UISceneConfigurationName: configuration.UISceneConfigurationName,
};
assert.deepEqual(configureSceneManifest(reordered), plist, 'Plist key order must not break repeated prebuild.');
assert.throws(() => configureSceneManifest({ UIApplicationSceneManifest: { UIApplicationSupportsMultipleScenes: true } }), /Existing scene manifest/);
console.log('iOS scene lifecycle: template guards, repeated prebuild, launch options and lifecycle forwarding passed.');
