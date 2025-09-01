import 'dotenv/config';

export default {
  expo: {
    name: "AeroKits",
    slug: "aerokits-mvp",
    scheme: "aerokits",
    version: "0.1.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.example.aerokits"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.example.aerokits"
    },
    web: {
      bundler: "metro",
      output: "static"
    },
    plugins: ["expo-router"],
    experiments: {
      typedRoutes: true
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      stripePk: process.env.EXPO_PUBLIC_STRIPE_PK
    }
  }
};
