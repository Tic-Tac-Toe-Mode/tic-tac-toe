import { useCallback, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

// AdMob types
interface AdMobRewardItem {
  type: string;
  amount: number;
}

// Your AdMob App ID: ca-app-pub-6933845365930069~7195590932
// Ad Unit IDs
const AD_UNIT_IDS = {
  android: {
    interstitial: 'ca-app-pub-6933845365930069/1017017786',
  },
  ios: {
    interstitial: 'ca-app-pub-6933845365930069/1017017786',
  },
};

export const useAdMob = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdReady, setIsAdReady] = useState(false);
  const [lastReward, setLastReward] = useState<AdMobRewardItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();

  // Initialize AdMob
  const initialize = useCallback(async () => {
    if (!isNative) {
      console.log('AdMob: Not running on native platform');
      return false;
    }

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      
      await AdMob.initialize({
        initializeForTesting: false, // Using real ads
      });
      
      setIsInitialized(true);
      console.log('AdMob initialized successfully');
      return true;
    } catch (err) {
      console.error('Failed to initialize AdMob:', err);
      setError('Failed to initialize ads');
      return false;
    }
  }, [isNative]);

  // Get the correct ad unit ID based on platform
  const getInterstitialAdUnitId = useCallback(() => {
    const platform = Capacitor.getPlatform();
    if (platform === 'android') {
      return AD_UNIT_IDS.android.interstitial;
    } else if (platform === 'ios') {
      return AD_UNIT_IDS.ios.interstitial;
    }
    return '';
  }, []);

  // Prepare an interstitial ad
  const prepareInterstitialAd = useCallback(async () => {
    if (!isNative || !isInitialized) {
      console.log('AdMob: Cannot prepare ad - not initialized or not native');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { AdMob, InterstitialAdPluginEvents } = await import('@capacitor-community/admob');
      
      // Set up event listeners
      AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
        console.log('Interstitial ad loaded');
        setIsAdReady(true);
        setIsLoading(false);
      });

      AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (info: { code: number; message: string }) => {
        console.error('Interstitial ad failed to load:', info.message);
        setError('Failed to load ad');
        setIsLoading(false);
        setIsAdReady(false);
      });

      AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
        console.log('Interstitial ad showed');
      });

      AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
        console.log('Interstitial ad dismissed');
        setIsAdReady(false);
        // Give reward after watching
        const reward = { type: 'coins', amount: 10 };
        setLastReward(reward);
        // Prepare next ad
        prepareInterstitialAd();
      });

      // Prepare the interstitial ad
      await AdMob.prepareInterstitial({
        adId: getInterstitialAdUnitId(),
        isTesting: false, // Using real ads
      });

      return true;
    } catch (err) {
      console.error('Error preparing interstitial ad:', err);
      setError('Error preparing ad');
      setIsLoading(false);
      return false;
    }
  }, [isNative, isInitialized, getInterstitialAdUnitId]);

  // Show the interstitial ad
  const showInterstitialAd = useCallback(async (): Promise<AdMobRewardItem | null> => {
    if (!isNative) {
      // Simulate reward for web testing
      console.log('AdMob: Simulating reward for web');
      const simulatedReward = { type: 'coins', amount: 10 };
      setLastReward(simulatedReward);
      return simulatedReward;
    }

    if (!isAdReady) {
      console.log('AdMob: Ad not ready');
      setError('Ad not ready yet');
      return null;
    }

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      
      await AdMob.showInterstitial();
      
      // Return the reward (will be set by the dismissed event listener)
      return { type: 'coins', amount: 10 };
    } catch (err) {
      console.error('Error showing interstitial ad:', err);
      setError('Error showing ad');
      return null;
    }
  }, [isNative, isAdReady]);

  // Initialize on mount
  useEffect(() => {
    if (isNative && !isInitialized) {
      initialize().then((success) => {
        if (success) {
          prepareInterstitialAd();
        }
      });
    }
  }, [isNative, isInitialized, initialize, prepareInterstitialAd]);

  return {
    isNative,
    isInitialized,
    isLoading,
    isAdReady,
    lastReward,
    error,
    initialize,
    prepareAd: prepareInterstitialAd,
    showAd: showInterstitialAd,
    // Aliases for backward compatibility
    prepareRewardedAd: prepareInterstitialAd,
    showRewardedAd: showInterstitialAd,
  };
};
