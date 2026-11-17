import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.p932b4d8529674f4b86cbeb63fe170e98',
  appName: 'canvas-game-crafter',
  webDir: 'dist',
  // Release builds load bundled assets, not the development preview website.
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: 'automatic',
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-6933845365930069~7195590932',
    },
  },
};

export default config;
