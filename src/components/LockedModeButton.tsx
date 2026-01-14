import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Coins, Zap, User, Globe } from 'lucide-react';
import { CREDITS_CONFIG } from '@/hooks/useGameCredits';

interface LockedModeButtonProps {
  mode: 'ai' | 'online';
  isUnlocked: boolean;
  canAfford: boolean;
  currentCoins: number;
  unlockProgress: number;
  unlockThreshold: number;
  onClick: () => void;
  onEarnCoins: () => void;
}

export const LockedModeButton: React.FC<LockedModeButtonProps> = ({
  mode,
  isUnlocked,
  canAfford,
  currentCoins,
  unlockProgress,
  unlockThreshold,
  onClick,
  onEarnCoins,
}) => {
  const cost = mode === 'ai' ? CREDITS_CONFIG.AI_GAME_COST : CREDITS_CONFIG.ONLINE_GAME_COST;
  const Icon = mode === 'ai' ? User : Globe;
  const label = mode === 'ai' ? 'vs AI' : 'Online Multiplayer';
  const progressPercent = Math.min((unlockProgress / unlockThreshold) * 100, 100);

  // Fully locked - show progress
  if (!isUnlocked) {
    return (
      <div className="relative">
        <Button
          size="lg"
          variant="outline"
          className={`w-full h-16 text-lg border-2 relative overflow-hidden ${
            mode === 'ai' 
              ? 'border-accent/30 hover:border-accent' 
              : 'border-green-500/30 hover:border-green-500'
          }`}
          onClick={onEarnCoins}
        >
          {/* Progress bar background */}
          <div 
            className={`absolute left-0 top-0 h-full transition-all duration-500 ${
              mode === 'ai' ? 'bg-accent/20' : 'bg-green-500/20'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
          
          <div className="relative flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <Icon className={`h-5 w-5 ${mode === 'ai' ? 'text-accent/50' : 'text-green-500/50'}`} />
              <span className="text-muted-foreground">{label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground text-right">
                <div className="font-semibold">{Math.round(progressPercent)}%</div>
                <div>{unlockProgress}/{unlockThreshold}</div>
              </div>
            </div>
          </div>
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-1">
          Earn {unlockThreshold - unlockProgress} more coins to unlock
        </p>
      </div>
    );
  }

  // Unlocked but can't afford
  if (!canAfford) {
    return (
      <div className="relative">
        <Button
          size="lg"
          variant="outline"
          className={`w-full h-16 text-lg border-2 ${
            mode === 'ai' 
              ? 'border-accent/30 hover:border-accent hover:bg-accent/10' 
              : 'border-green-500/30 hover:border-green-500 hover:bg-green-500/10'
          }`}
          onClick={onEarnCoins}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${mode === 'ai' ? 'text-accent' : 'text-green-500'}`} />
              <span>{label}</span>
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-red-500 font-semibold">{cost}</span>
              <span className="text-xs text-muted-foreground">({currentCoins} available)</span>
            </div>
          </div>
        </Button>
        <p className="text-xs text-center text-red-500 mt-1">
          Need {cost - currentCoins} more coins to play
        </p>
      </div>
    );
  }

  // Unlocked and can afford - ready to play!
  return (
    <Button
      onClick={onClick}
      size="lg"
      variant="outline"
      className={`w-full h-16 text-lg border-2 ${
        mode === 'ai' 
          ? 'border-accent hover:border-accent hover:bg-accent/10' 
          : 'border-green-500 hover:border-green-500 hover:bg-green-500/10'
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${mode === 'ai' ? 'text-accent' : 'text-green-500'}`} />
          <span>{label}</span>
          <Zap className="h-4 w-4 text-green-500" />
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-yellow-500/20 rounded-full">
          <Coins className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-semibold">{cost}</span>
        </div>
      </div>
    </Button>
  );
};

export default LockedModeButton;
