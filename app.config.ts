import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "U-AUBEN INVENTORY APP",
  slug: "uaubentracker",
  version: "1.0.1",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  assetBundlePatterns: ["**/*"],
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#1A237E"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.uauben.tracker",
    icon: "./assets/icon.png"
  },
  android: {
    package: "com.uauben.tracker",
    versionCode: 3,
    icon: "./assets/icon.png",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptative-icon.png",
      backgroundColor: "#1A237E"
    },
    permissions: [
      "android.permission.INTERNET",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.CAMERA",
      "android.permission.RECEIVE_BOOT_COMPLETED",
      "android.permission.VIBRATE",
      "android.permission.POST_NOTIFICATIONS"
    ]
  },
  web: {
    bundler: "metro",
    favicon: "./assets/icon.png"
  },
  plugins: [
    "expo-router",
    "expo-sqlite",
    "expo-font",
    "expo-asset",
    "expo-file-system",
    "expo-image-picker",
    "expo-document-picker",
    "expo-av",
    "expo-notifications",
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          buildToolsVersion: "35.0.0",
          kotlinVersion: "1.9.25",
          newArchEnabled: false,
          extraProguardRules: "-keep class com.rnllama.** { *; }"
        }
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    geminiApiKey: process.env.GEMINI_API_KEY || "",
  },
});
