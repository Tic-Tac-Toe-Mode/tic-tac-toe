import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.932b4d8529674f4b86cbeb63fe170e98',
  appName: 'Tic-Tac-Toe',
  webDir: 'dist',
  server: {
    // Comment out or remove these for production builds
    // url: 'https://932b4d85-2967-4f4b-86cb-eb63fe170e98.lovableproject.com?forceHideBadge=true',
    // cleartext: true
  },
  android: {
    allowMixedContent: true,
    // AdMob configuration
    // Make sure to add the following to android/app/src/main/AndroidManifest.xml:
    // <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-6933845365930069~7195590932"/>
  },
  ios: {
    // AdMob configuration
    // Make sure to add the following to ios/App/App/Info.plist:
    // <key>GADApplicationIdentifier</key>
    // <string>ca-app-pub-6933845365930069~7195590932</string>
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-6933845365930069~7195590932',
    },
  },
};

export default config;
