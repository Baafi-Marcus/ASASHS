import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.asashs.student',
  appName: 'ASASHS Student Portal',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PrivacyScreen: {
      enable: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0F3E2F",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#FBBF24",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
