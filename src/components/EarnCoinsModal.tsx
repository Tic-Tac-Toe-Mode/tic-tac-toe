import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Coins, Play, Heart, Users, Loader2, Gift, Sparkles, X, ArrowRight, Zap } from 'lucide-react';
import { useAdMob } from '@/hooks/useAdMob';
import { CREDITS_CONFIG } from '@/hooks/useGameCredits';
import { toast } from 'sonner';

interface EarnCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdReward: () => void;
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
  const { isNative, isAdReady, isLoading, showAd, prepareAd } = useAdMob();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [hasSupportedRecently, setHasSupportedRecently] = useState(false);

  const shortage = Math.max(0, neededCoins - currentCoins);

  const handleWatchAd = async () => {
    setIsWatchingAd(true);
    try {
      const reward = await showAd();
      if (reward || !isNative) {
        onAdReward();
        toast.success(`🎉 +${CREDITS_CONFIG.AD_WATCH_REWARD} coins earned!`, { duration: 3000 });
      }
    } catch (err) {
      toast.error('Ad not available. Try again later.');
    } finally {
      setIsWatchingAd(false);
      prepareAd();
    }
  };

  const handleSupport = () => {
    window.open("https://otieu.com/4/7658671", "_blank");
    // Delay reward slightly to encourage actual click
    setTimeout(() => {
      onSupportClick();
      setHasSupportedRecently(true);
      toast.success(`💝 +${CREDITS_CONFIG.SUPPORT_US_REWARD} coins for your support!`, { duration: 3000 });
      // Reset after 30 seconds
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
          {/* Watch Ad Option */}
          <Card 
            className="p-4 border-2 border-green-500/30 hover:border-green-500 transition-all cursor-pointer group"
            onClick={handleWatchAd}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Play className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold">Watch Ad</h4>
                  <p className="text-xs text-muted-foreground">~15-30 seconds video</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isWatchingAd ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span className="font-bold text-green-500 flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      +{CREDITS_CONFIG.AD_WATCH_REWARD}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </div>
          </Card>

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
                <strong className="text-foreground">Tip:</strong> Playing 2 Players mode is the best way to earn coins! 
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
