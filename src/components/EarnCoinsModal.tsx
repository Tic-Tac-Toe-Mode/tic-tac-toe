import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Coins, Play, Heart, Users, Loader2, Sparkles, ArrowRight, Film, Smartphone } from 'lucide-react';
import { useAdMob, AD_REWARD_AMOUNTS } from '@/hooks/useAdMob';
import { CREDITS_CONFIG } from '@/hooks/useGameCredits';
import { toast } from 'sonner';

interface EarnCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdReward: (amount: number) => void;
  onSupportClick: () => void;
  onPlay2Players: () => void;
  currentCoins: number;
  neededCoins?: number;
  reason?: 'ai' | 'online' | 'general';
}

export const EarnCoinsModal: React.FC<EarnCoinsModalProps> = ({
  isOpen,
  onClose,
  onAdReward,
  onSupportClick,
  onPlay2Players,
  currentCoins,
  neededCoins = 0,
  reason = 'general',
}) => {
  const { 
    isNative, 
    showAd, 
    showRewardedVideoAd, 
    prepareAd, 
    prepareRewardedVideoAd,
    isAdReady,
    isRewardedAdReady,
    rewardAmounts 
  } = useAdMob();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [isWatchingRewardedAd, setIsWatchingRewardedAd] = useState(false);
  const [hasSupportedRecently, setHasSupportedRecently] = useState(false);

  const shortage = Math.max(0, neededCoins - currentCoins);

  const handleWatchAd = async () => {
    if (isWatchingAd) return;
    
    // Check if on native platform
    if (!isNative) {
      toast.error('📱 Ads only work on mobile app. Play 2 Players mode to earn coins!', { duration: 4000 });
      return;
    }
    
    setIsWatchingAd(true);
    
    try {
      const reward = await showAd();
      
      // Only reward if the ad was actually completed on native
      if (reward && reward.amount > 0) {
        onAdReward(reward.amount);
      }
      // If null returned, showAd already shows error toast
    } catch (err) {
      console.error('Ad error:', err);
      toast.error('❌ Ad failed to load. Please try again later.', { duration: 3000 });
    } finally {
      setIsWatchingAd(false);
      prepareAd();
    }
  };

  const handleWatchRewardedVideoAd = async () => {
    if (isWatchingRewardedAd) return;
    
    // Check if on native platform
    if (!isNative) {
      toast.error('📱 Video ads only work on mobile app. Play 2 Players mode to earn coins!', { duration: 4000 });
      return;
    }
    
    setIsWatchingRewardedAd(true);
    
    try {
      const reward = await showRewardedVideoAd();
      
      // Only reward if the video was fully watched
      if (reward && reward.amount > 0) {
        onAdReward(reward.amount);
      }
    } catch (err) {
      console.error('Rewarded video error:', err);
      toast.error('❌ Video ad failed to load. Please try again later.', { duration: 3000 });
    } finally {
      setIsWatchingRewardedAd(false);
      prepareRewardedVideoAd();
    }
  };

  const handleSupport = () => {
    window.open("https://otieu.com/4/7658671", "_blank");
    setTimeout(() => {
      onSupportClick();
      setHasSupportedRecently(true);
      toast.success(`💝 +${CREDITS_CONFIG.SUPPORT_US_REWARD} coins for your support!`, { duration: 3000 });
      setTimeout(() => setHasSupportedRecently(false), 30000);
    }, 1500);
  };

  const getTitle = () => {
    switch (reason) {
      case 'ai': return 'Unlock AI Mode';
      case 'online': return 'Unlock Online Mode';
      default: return 'Earn More Coins';
    }
  };

  const getDescription = () => {
    if (shortage > 0) {
      return `You need ${shortage} more coins to play. Earn coins by:`;
    }
    return 'Earn coins to unlock game modes and keep playing!';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20 p-6 border-b border-yellow-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Coins className="h-6 w-6 text-yellow-500" />
              </div>
              {getTitle()}
            </DialogTitle>
            <DialogDescription className="text-left">
              {getDescription()}
            </DialogDescription>
          </DialogHeader>

          {/* Current coins display */}
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center gap-3 px-4 py-2 bg-background/80 rounded-full shadow-lg">
              <Coins className="h-6 w-6 text-yellow-500" />
              <span className="text-2xl font-bold">{currentCoins}</span>
              {shortage > 0 && (
                <span className="text-sm text-red-500">
                  (need +{shortage})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Earn options */}
        <div className="p-4 space-y-3">
          {/* Rewarded Video Ad - 2x Coins (Best Option) */}
          <Card 
            className={`p-4 border-2 transition-all group relative overflow-hidden ${
              isNative 
                ? 'border-purple-500/30 hover:border-purple-500 cursor-pointer' 
                : 'border-muted opacity-60 cursor-not-allowed'
            }`}
            onClick={isNative ? handleWatchRewardedVideoAd : undefined}
          >
            {/* Best Value Badge */}
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-bl-lg font-semibold">
              2x COINS
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <Film className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold">Watch Video Ad</h4>
                  <p className="text-xs text-muted-foreground">
                    {isNative ? '~30-60 seconds video' : 'Mobile app only'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isWatchingRewardedAd ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span className="font-bold text-purple-500 flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      +{rewardAmounts.REWARDED_VIDEO}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Regular Watch Ad Option */}
          <Card 
            className={`p-4 border-2 transition-all group ${
              isNative 
                ? 'border-green-500/30 hover:border-green-500 cursor-pointer' 
                : 'border-muted opacity-60 cursor-not-allowed'
            }`}
            onClick={isNative ? handleWatchAd : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Play className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold">Watch Short Ad</h4>
                  <p className="text-xs text-muted-foreground">
                    {isNative ? '~15-30 seconds' : 'Mobile app only'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isWatchingAd ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span className="font-bold text-green-500 flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      +{rewardAmounts.INTERSTITIAL}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Web Platform Notice */}
          {!isNative && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Smartphone className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  <strong>Ad rewards require mobile app</strong>
                  <p className="mt-0.5 text-muted-foreground">
                    Download the Android app to watch ads and earn coins. On web, play 2 Players mode or Support Us!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Support Us Option */}
          <Card 
            className={`p-4 border-2 transition-all cursor-pointer group ${
              hasSupportedRecently 
                ? 'border-muted opacity-50 cursor-not-allowed' 
                : 'border-pink-500/30 hover:border-pink-500'
            }`}
            onClick={hasSupportedRecently ? undefined : handleSupport}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/30 transition-colors">
                  <Heart className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-semibold">Support Us</h4>
                  <p className="text-xs text-muted-foreground">
                    {hasSupportedRecently ? 'Thanks! Try again later' : 'Click & support developer'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-pink-500 flex items-center gap-1">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  +{CREDITS_CONFIG.SUPPORT_US_REWARD}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Card>

          {/* Play 2 Players Option */}
          <Card 
            className="p-4 border-2 border-primary/30 hover:border-primary transition-all cursor-pointer group"
            onClick={() => {
              onClose();
              onPlay2Players();
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Play 2 Players</h4>
                  <p className="text-xs text-muted-foreground">Free mode - earn per game</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary flex items-center gap-1">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  +{CREDITS_CONFIG.TWO_PLAYER_WIN_REWARD}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Card>

          {/* Tip box */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <strong className="text-foreground">Tip:</strong> Playing 2 Players mode is free and earns coins! 
                Win = +{CREDITS_CONFIG.TWO_PLAYER_WIN_REWARD}, Draw = +{CREDITS_CONFIG.TWO_PLAYER_DRAW_REWARD}, Loss = +{CREDITS_CONFIG.TWO_PLAYER_LOSS_REWARD} coins.
              </div>
            </div>
          </div>
        </div>

        {/* Close button */}
        <div className="p-4 pt-0">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EarnCoinsModal;