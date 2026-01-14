import React from 'react';
import { Coins, TrendingUp, Zap } from 'lucide-react';
import { GameCredits, CREDITS_CONFIG } from '@/hooks/useGameCredits';

interface GameCreditsDisplayProps {
  credits: GameCredits;
  showDetails?: boolean;
  className?: string;
}

export const GameCreditsDisplay: React.FC<GameCreditsDisplayProps> = ({
  credits,
  showDetails = false,
  className = '',
}) => {
  return (
    <div className={`${className}`}>
      {/* Main coins display */}
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full border border-yellow-500/30">
        <Coins className="h-5 w-5 text-yellow-500" />
        <span className="font-bold text-lg text-yellow-600 dark:text-yellow-400">
          {credits.coins}
        </span>
        <span className="text-xs text-muted-foreground">coins</span>
      </div>

      {showDetails && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="font-semibold">{credits.gamesPlayed2P}</div>
            <div className="text-muted-foreground">2P Games</div>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="font-semibold">{credits.adsWatched}</div>
            <div className="text-muted-foreground">Ads Watched</div>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <div className="font-semibold">{credits.totalEarned}</div>
            <div className="text-muted-foreground">Total Earned</div>
          </div>
        </div>
      )}
    </div>
  );
};

interface UnlockProgressProps {
  label: string;
  currentProgress: number;
  threshold: number;
  isUnlocked: boolean;
  icon: React.ReactNode;
  cost: number;
  currentCoins: number;
}

export const UnlockProgress: React.FC<UnlockProgressProps> = ({
  label,
  currentProgress,
  threshold,
  isUnlocked,
  icon,
  cost,
  currentCoins,
}) => {
  const progressPercent = Math.min((currentProgress / threshold) * 100, 100);
  const canAfford = currentCoins >= cost;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {isUnlocked ? (
            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Unlocked
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {currentProgress}/{threshold}
            </span>
          )}
        </div>
      </div>
      
      {!isUnlocked && (
        <div className="relative">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {isUnlocked && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Cost per game:</span>
          <span className={`font-semibold flex items-center gap-1 ${canAfford ? 'text-green-500' : 'text-red-500'}`}>
            <Coins className="h-3 w-3 text-yellow-500" />
            {cost} coins
          </span>
        </div>
      )}
    </div>
  );
};

export default GameCreditsDisplay;
