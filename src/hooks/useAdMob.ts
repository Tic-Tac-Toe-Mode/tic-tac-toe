import { useCallback, useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

// AdMob types
interface AdMobRewardItem {
  type: string;
  amount: number;
}

// AdMob Configuration
// App ID: ca-app-pub-6933845365930069~7195590932
// Ad Unit IDs
const AD_UNIT_IDS = {
  android: {
    interstitial: 'ca-app-pub-6933845365930069/1017017786',
    // Add your rewarded ad unit ID here after creating it in AdMob
    rewarded: 'ca-app-pub-6933845365930069/1017017786', // Replace with actual rewarded ad unit ID
  },
  ios: {
    interstitial: 'ca-app-pub-6933845365930069/1017017786',
    rewarded: 'ca-app-pub-6933845365930069/1017017786', // Replace with actual rewarded ad unit ID
  },
};

// Reward amounts
export const AD_REWARD_AMOUNTS = {
  INTERSTITIAL: 10,
  REWARDED_VIDEO: 20, // 2x coins for rewarded video
};

export const useAdMob = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdReady, setIsAdReady] = useState(false);
  const [isRewardedAdReady, setIsRewardedAdReady] = useState(false);
  const [lastReward, setLastReward] = useState<AdMobRewardItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Promise resolvers for ad completion
  const adCompletionResolver = useRef<((value: AdMobRewardItem | null) => void) | null>(null);
  const rewardedAdCompletionResolver = useRef<((value: AdMobRewardItem | null) => void) | null>(null);
  const adWasShown = useRef(false);
  const rewardedAdWasShown = useRef(false);

  const isNative = Capacitor.isNativePlatform();

  // Initialize AdMob
  const initialize = useCallback(async () => {
    if (!isNative) {
      console.log('AdMob: Not running on native platform - NO REWARDS ON WEB');
      return false;
    }

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      
      await AdMob.initialize({
        initializeForTesting: false,
      });
      
      setIsInitialized(true);
      console.log('AdMob initialized successfully with App ID: ca-app-pub-6933845365930069~7195590932');
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

  const getRewardedAdUnitId = useCallback(() => {
    const platform = Capacitor.getPlatform();
    if (platform === 'android') {
      return AD_UNIT_IDS.android.rewarded;
    } else if (platform === 'ios') {
      return AD_UNIT_IDS.ios.rewarded;
    }
    return '';
  }, []);

  // Prepare an interstitial ad
  const prepareInterstitialAd = useCallback(async () => {
    if (!isNative || !isInitialized) {
      console.log('AdMob: Cannot prepare ad - not initialized or not native');
      return false;
    }

    if (isLoading || isAdReady) {
      console.log('AdMob: Ad already loading or ready');
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { AdMob, InterstitialAdPluginEvents } = await import('@capacitor-community/admob');
      
      // Set up event listeners
      AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
        console.log('Interstitial ad loaded successfully');
        setIsAdReady(true);
        setIsLoading(false);
      });

      AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (info: { code: number; message: string }) => {
        console.error('Interstitial ad failed to load:', info.message);
        setError(`Failed to load ad: ${info.message}`);
        setIsLoading(false);
        setIsAdReady(false);
        
        if (adCompletionResolver.current) {
          adCompletionResolver.current(null);
          adCompletionResolver.current = null;
        }
      });

      AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
        console.log('Interstitial ad is now showing');
        adWasShown.current = true;
      });

      AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
        console.log('Interstitial ad dismissed - user completed watching');
        setIsAdReady(false);
        
        if (adWasShown.current) {
          const reward: AdMobRewardItem = { type: 'coins', amount: AD_REWARD_AMOUNTS.INTERSTITIAL };
          setLastReward(reward);
          
          if (adCompletionResolver.current) {
            adCompletionResolver.current(reward);
            adCompletionResolver.current = null;
          }
        } else {
          if (adCompletionResolver.current) {
            adCompletionResolver.current(null);
            adCompletionResolver.current = null;
          }
        }
        
        adWasShown.current = false;
        
        setTimeout(() => {
          prepareInterstitialAd();
        }, 1000);
      });

      AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (info: { code: number; message: string }) => {
        console.error('Interstitial ad failed to show:', info.message);
        setError(`Failed to show ad: ${info.message}`);
        setIsAdReady(false);
        adWasShown.current = false;
        
        if (adCompletionResolver.current) {
          adCompletionResolver.current(null);
          adCompletionResolver.current = null;
        }
      });

      await AdMob.prepareInterstitial({
        adId: getInterstitialAdUnitId(),
        isTesting: false,
      });

      console.log('Interstitial ad preparation started');
      return true;
    } catch (err) {
      console.error('Error preparing interstitial ad:', err);
      setError('Error preparing ad');
      setIsLoading(false);
      return false;
    }
  }, [isNative, isInitialized, isLoading, isAdReady, getInterstitialAdUnitId]);

  // Prepare a rewarded video ad
  const prepareRewardedVideoAd = useCallback(async () => {
    if (!isNative || !isInitialized) {
      console.log('AdMob: Cannot prepare rewarded ad - not initialized or not native');
      return false;
    }

    if (isRewardedAdReady) {
      console.log('AdMob: Rewarded ad already ready');
      return true;
    }

    try {
      const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');
      
      AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        console.log('Rewarded ad loaded successfully');
        setIsRewardedAdReady(true);
      });

      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (info: { code: number; message: string }) => {
        console.error('Rewarded ad failed to load:', info.message);
        setIsRewardedAdReady(false);
        
        if (rewardedAdCompletionResolver.current) {
          rewardedAdCompletionResolver.current(null);
          rewardedAdCompletionResolver.current = null;
        }
      });

      AdMob.addListener(RewardAdPluginEvents.Showed, () => {
        console.log('Rewarded ad is now showing');
        rewardedAdWasShown.current = true;
      });

      AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: { type: string; amount: number }) => {
        console.log('User earned reward:', reward);
        // User watched the full video - give 2x reward
        const doubleReward: AdMobRewardItem = { 
          type: 'coins', 
          amount: AD_REWARD_AMOUNTS.REWARDED_VIDEO 
        };
        setLastReward(doubleReward);
        
        if (rewardedAdCompletionResolver.current) {
          rewardedAdCompletionResolver.current(doubleReward);
          rewardedAdCompletionResolver.current = null;
        }
      });

      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        console.log('Rewarded ad dismissed');
        setIsRewardedAdReady(false);
        rewardedAdWasShown.current = false;
        
        // Prepare next rewarded ad
        setTimeout(() => {
          prepareRewardedVideoAd();
        }, 1000);
      });

      AdMob.addListener(RewardAdPluginEvents.FailedToShow, (info: { code: number; message: string }) => {
        console.error('Rewarded ad failed to show:', info.message);
        setIsRewardedAdReady(false);
        rewardedAdWasShown.current = false;
        
        if (rewardedAdCompletionResolver.current) {
          rewardedAdCompletionResolver.current(null);
          rewardedAdCompletionResolver.current = null;
        }
      });

      await AdMob.prepareRewardVideoAd({
        adId: getRewardedAdUnitId(),
        isTesting: false,
      });

      console.log('Rewarded ad preparation started');
      return true;
    } catch (err) {
      console.error('Error preparing rewarded ad:', err);
      return false;
    }
  }, [isNative, isInitialized, isRewardedAdReady, getRewardedAdUnitId]);

  // Show the interstitial ad and wait for completion
  const showInterstitialAd = useCallback(async (): Promise<AdMobRewardItem | null> => {
    // NO REWARDS ON WEB - Must watch real ads on native
    if (!isNative) {
      console.log('AdMob: Web mode - NO REWARDS (must use native app)');
      toast.error('📱 Ads only work on mobile app. Download the app to earn coins!', { duration: 3000 });
      return null;
    }

    if (!isAdReady) {
      console.log('AdMob: Ad not ready');
      setError('Ad not ready yet. Please wait...');
      toast.warning('⏳ Ad is loading, please wait...', { duration: 2000 });
      prepareInterstitialAd();
      return null;
    }

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      
      const rewardPromise = new Promise<AdMobRewardItem | null>((resolve) => {
        adCompletionResolver.current = resolve;
        
        // Timeout after 2 minutes
        setTimeout(() => {
          if (adCompletionResolver.current) {
            console.log('AdMob: Ad completion timeout');
            adCompletionResolver.current(null);
            adCompletionResolver.current = null;
          }
        }, 120000);
      });
      
      await AdMob.showInterstitial();
      const reward = await rewardPromise;
      
      if (reward) {
        toast.success(`✅ Ad completed! +${reward.amount} coins earned!`, { duration: 3000 });
      }
      
      return reward;
    } catch (err) {
      console.error('Error showing interstitial ad:', err);
      setError('Error showing ad');
      adCompletionResolver.current = null;
      return null;
    }
  }, [isNative, isAdReady, prepareInterstitialAd]);

  // Show rewarded video ad for 2x coins
  const showRewardedVideoAd = useCallback(async (): Promise<AdMobRewardItem | null> => {
    // NO REWARDS ON WEB - Must watch real ads on native
    if (!isNative) {
      console.log('AdMob: Web mode - NO REWARDS (must use native app)');
      toast.error('📱 Ads only work on mobile app. Download the app to earn coins!', { duration: 3000 });
      return null;
    }

    if (!isRewardedAdReady) {
      console.log('AdMob: Rewarded ad not ready');
      setError('Video ad not ready yet. Please wait...');
      toast.warning('⏳ Video ad is loading, please wait...', { duration: 2000 });
      prepareRewardedVideoAd();
      return null;
    }

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      
      const rewardPromise = new Promise<AdMobRewardItem | null>((resolve) => {
        rewardedAdCompletionResolver.current = resolve;
        
        // Timeout after 2 minutes
        setTimeout(() => {
          if (rewardedAdCompletionResolver.current) {
            console.log('AdMob: Rewarded ad completion timeout');
            rewardedAdCompletionResolver.current(null);
            rewardedAdCompletionResolver.current = null;
          }
        }, 120000);
      });
      
      await AdMob.showRewardVideoAd();
      const reward = await rewardPromise;
      
      if (reward) {
        toast.success(`🎬 Video complete! +${reward.amount} coins earned (2x bonus)!`, { duration: 3000 });
      }
      
      return reward;
    } catch (err) {
      console.error('Error showing rewarded ad:', err);
      setError('Error showing video ad');
      rewardedAdCompletionResolver.current = null;
      return null;
    }
  }, [isNative, isRewardedAdReady, prepareRewardedVideoAd]);

  // Initialize on mount
  useEffect(() => {
    if (isNative && !isInitialized) {
      initialize().then((success) => {
        if (success) {
          prepareInterstitialAd();
          prepareRewardedVideoAd();
        }
      });
    }
  }, [isNative, isInitialized, initialize, prepareInterstitialAd, prepareRewardedVideoAd]);

  return {
    isNative,
    isInitialized,
    isLoading,
    isAdReady,
    isRewardedAdReady,
    lastReward,
    error,
    initialize,
    // Interstitial ads
    prepareAd: prepareInterstitialAd,
    showAd: showInterstitialAd,
    // Rewarded video ads (2x coins)
    prepareRewardedVideoAd,
    showRewardedVideoAd,
    // Aliases for backward compatibility
    prepareRewardedAd: prepareInterstitialAd,
    showRewardedAd: showInterstitialAd,
    // Reward amounts
    rewardAmounts: AD_REWARD_AMOUNTS,
  };
};