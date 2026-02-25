import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "UAubenTracker",
  slug: "uaubentracker",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.uauben.tracker"
  },
  android: {
    package: "com.uauben.tracker",
    versionCode: 1,
    permissions: [
      "android.permission.INTERNET",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE"
    ]
  },
  plugins: [
    "expo-router",
    "expo-sqlite",
    [
      "expo-font",
      {
        "fonts": [
          "./assets/fonts/Algerian.ttf",
          "./assets/fonts/MonotypeCorsiva.ttf"
        ]
      }
    ],
    [
      "expo-build-properties",
      {
        "android": {
          "kotlinVersion": "1.9.25"
        }
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  }
};

export default config;
