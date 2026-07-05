// Learn more https://docs.expo.dev/guides/customizing/

module.exports = {
  name: "Chill Radio",
  slug: "chill-radio",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "chillradio",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0B1A2E",
  },
  ios: {
    supportsTablet: true,
    infoPlist: {
      UIBackgroundModes: ["audio"],
      ITSAppUsesNonExemptEncryption: false,
    },
    bundleIdentifier: "com.dgray0229.chillradio",
    buildNumber: "1",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#0B1A2E",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.dgray0229.chillradio",
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-localization",
    "expo-audio",
    "expo-asset",
    "./plugins/removeMicPermission",
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "16.4",
          swiftStrictConcurrency: "minimal",
          useFrameworks: "static",
          usePrecompiledModules: false,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "94c861b1-7269-401c-95ee-bc6f7a9b553b",
    },
  },
  doctor: {
    reactNativeDirectoryCheck: {
      exclude: ["expo-av"],
    },
  },
};
