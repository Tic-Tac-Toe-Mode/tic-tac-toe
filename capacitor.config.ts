import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.932b4d8529674f4b86cbeb63fe170e98',
  appName: 'canvas-game-crafter',
  webDir: 'dist',
  server: {
    url: 'https://932b4d85-2967-4f4b-86cb-eb63fe170e98.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
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
