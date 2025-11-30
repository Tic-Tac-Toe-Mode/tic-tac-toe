import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.932b4d8529674f4b86cbeb63fe170e98',
  appName: 'Tic-Tac-Toe',
  webDir: 'dist',
  server: {
    url: 'https://932b4d85-2967-4f4b-86cb-eb63fe170e98.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
