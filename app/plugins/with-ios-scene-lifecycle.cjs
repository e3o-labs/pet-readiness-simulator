const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');
const { isDeepStrictEqual } = require('node:util');

const marker = '// pet-readiness: scene lifecycle v1';
const legacyWindow = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif`;

const appMethods = `  ${marker}
  private var initialLaunchOptions: [UIApplication.LaunchOptionsKey: Any]?

  func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {
    let configuration = UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    configuration.delegateClass = ReadinessSceneDelegate.self
    return configuration
  }

  func makeSceneWindow(
    _ windowScene: UIWindowScene,
    connectionOptions: UIScene.ConnectionOptions
  ) -> UIWindow {
    let sceneWindow = UIWindow(windowScene: windowScene)
    var options = initialLaunchOptions ?? [:]
    if let context = connectionOptions.urlContexts.first {
      options[.url] = context.url
      options[.sourceApplication] = context.options.sourceApplication
      options[.annotation] = context.options.annotation
    }
    if let activity = connectionOptions.userActivities.first(where: { $0.activityType == NSUserActivityTypeBrowsingWeb }) {
      options[.userActivityDictionary] = [
        "UIApplicationLaunchOptionsUserActivityTypeKey": activity.activityType,
        "UIApplicationLaunchOptionsUserActivityKey": activity
      ]
    }
    window = sceneWindow
    reactNativeFactory!.startReactNative(
      withModuleName: "main",
      in: sceneWindow,
      launchOptions: options)
    initialLaunchOptions = nil
    return sceneWindow
  }

`;

const sceneDelegate = `
// The single scene owns the window; Expo still owns the React Native factory.
class ReadinessSceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  private var appDelegate: AppDelegate {
    UIApplication.shared.delegate as! AppDelegate
  }

  func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    guard let windowScene = scene as? UIWindowScene else { return }
    window = appDelegate.makeSceneWindow(windowScene, connectionOptions: connectionOptions)
  }

  func sceneDidBecomeActive(_ scene: UIScene) {
    appDelegate.applicationDidBecomeActive(UIApplication.shared)
  }

  func sceneWillResignActive(_ scene: UIScene) {
    appDelegate.applicationWillResignActive(UIApplication.shared)
  }

  func sceneWillEnterForeground(_ scene: UIScene) {
    appDelegate.applicationWillEnterForeground(UIApplication.shared)
  }

  func sceneDidEnterBackground(_ scene: UIScene) {
    appDelegate.applicationDidEnterBackground(UIApplication.shared)
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      var options: [UIApplication.OpenURLOptionsKey: Any] = [.openInPlace: context.options.openInPlace]
      options[.sourceApplication] = context.options.sourceApplication
      options[.annotation] = context.options.annotation
      _ = appDelegate.application(UIApplication.shared, open: context.url, options: options)
    }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    _ = appDelegate.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
  }
}
`;

function migrateAppDelegate(contents) {
  if (contents.includes(marker)) return contents;
  const classStart = 'class AppDelegate: ExpoAppDelegate {';
  const launchReturn = '    return super.application(application, didFinishLaunchingWithOptions: launchOptions)';
  // Stop generation when the Expo template changes instead of producing a half migration.
  for (const anchor of [classStart, legacyWindow, launchReturn]) {
    if (contents.split(anchor).length !== 2) {
      throw new Error('Unsupported Expo AppDelegate template: review the iOS scene lifecycle plugin.');
    }
  }
  if (/configurationForConnecting|UIWindowSceneDelegate/.test(contents)) {
    throw new Error('Existing scene integration requires an explicit migration review.');
  }
  return contents
    .replace(classStart, `${classStart}\n${appMethods}`)
    .replace(legacyWindow, '    initialLaunchOptions = launchOptions')
    + sceneDelegate;
}

function configureSceneManifest(infoPlist) {
  const existing = infoPlist.UIApplicationSceneManifest;
  if (existing && !isDeepStrictEqual(existing, sceneManifest())) {
    throw new Error('Existing scene manifest requires an explicit migration review.');
  }
  return { ...infoPlist, UIApplicationSceneManifest: sceneManifest() };
}

function sceneManifest() {
  return {
    UIApplicationSupportsMultipleScenes: false,
    UISceneConfigurations: {
      UIWindowSceneSessionRoleApplication: [{
        UISceneConfigurationName: 'Default Configuration',
        UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).ReadinessSceneDelegate',
      }],
    },
  };
}

function withIOSSceneLifecycle(config) {
  config = withInfoPlist(config, (mod) => {
    mod.modResults = configureSceneManifest(mod.modResults);
    return mod;
  });
  return withAppDelegate(config, (mod) => {
    if (mod.modResults.language !== 'swift') {
      throw new Error('The iOS scene lifecycle plugin requires the Expo Swift AppDelegate.');
    }
    mod.modResults.contents = migrateAppDelegate(mod.modResults.contents);
    return mod;
  });
}

module.exports = withIOSSceneLifecycle;
module.exports.migrateAppDelegate = migrateAppDelegate;
module.exports.configureSceneManifest = configureSceneManifest;
