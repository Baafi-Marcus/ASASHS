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
    }
  }
};

export default config;
