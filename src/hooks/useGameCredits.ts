import { useState, useEffect, useCallback } from 'react';

export interface GameCredits {
  coins: number;
  totalEarned: number;
  gamesPlayed2P: number;
  adsWatched: number;
  supportClicks: number;
  lastUpdated: string;
}

// Cost and reward configuration
export const CREDITS_CONFIG = {
  // Costs to play
  AI_GAME_COST: 5,
  ONLINE_GAME_COST: 10,
  
  // Rewards
  TWO_PLAYER_WIN_REWARD: 5,
  TWO_PLAYER_DRAW_REWARD: 3,
  TWO_PLAYER_LOSS_REWARD: 2,
  AD_WATCH_REWARD: 10,
  SUPPORT_US_REWARD: 15,
  
  // Unlock thresholds (first time only, then use coins)
  AI_UNLOCK_THRESHOLD: 10,
  ONLINE_UNLOCK_THRESHOLD: 25,
  
  // Starting coins for new players
  STARTING_COINS: 0,
};

const DEFAULT_CREDITS: GameCredits = {
  coins: CREDITS_CONFIG.STARTING_COINS,
  totalEarned: 0,
  gamesPlayed2P: 0,
  adsWatched: 0,
  supportClicks: 0,
  lastUpdated: new Date().toISOString(),
};

const STORAGE_KEY = 'tictactoe-game-credits';

export const useGameCredits = () => {
  const [credits, setCredits] = useState<GameCredits>(DEFAULT_CREDITS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load credits from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCredits(parsed);
      } catch (e) {
        console.error('Failed to parse credits:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save credits to localStorage
  const saveCredits = useCallback((newCredits: GameCredits) => {
    const updated = { ...newCredits, lastUpdated: new Date().toISOString() };
    setCredits(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  // Add coins
  const addCoins = useCallback((amount: number, source: 'twoplayer' | 'ad' | 'support') => {
    setCredits(prev => {
      const updated: GameCredits = {
        ...prev,
        coins: prev.coins + amount,
        totalEarned: prev.totalEarned + amount,
        gamesPlayed2P: source === 'twoplayer' ? prev.gamesPlayed2P + 1 : prev.gamesPlayed2P,
        adsWatched: source === 'ad' ? prev.adsWatched + 1 : prev.adsWatched,
        supportClicks: source === 'support' ? prev.supportClicks + 1 : prev.supportClicks,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Spend coins
  const spendCoins = useCallback((amount: number): boolean => {
    if (credits.coins < amount) return false;
    
    setCredits(prev => {
      const updated = { ...prev, coins: prev.coins - amount, lastUpdated: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    return true;
  }, [credits.coins]);

  // Check if can afford
  const canAfford = useCallback((amount: number): boolean => {
    return credits.coins >= amount;
  }, [credits.coins]);

  // Check if AI mode is unlocked (either has enough total earned OR has coins to spend)
  const isAIUnlocked = useCallback((): boolean => {
    return credits.totalEarned >= CREDITS_CONFIG.AI_UNLOCK_THRESHOLD;
  }, [credits.totalEarned]);

  // Check if Online mode is unlocked
  const isOnlineUnlocked = useCallback((): boolean => {
    return credits.totalEarned >= CREDITS_CONFIG.ONLINE_UNLOCK_THRESHOLD;
  }, [credits.totalEarned]);

  // Can play AI (unlocked AND has coins)
  const canPlayAI = useCallback((): boolean => {
    return isAIUnlocked() && credits.coins >= CREDITS_CONFIG.AI_GAME_COST;
  }, [isAIUnlocked, credits.coins]);

  // Can play Online (unlocked AND has coins)
  const canPlayOnline = useCallback((): boolean => {
    return isOnlineUnlocked() && credits.coins >= CREDITS_CONFIG.ONLINE_GAME_COST;
  }, [isOnlineUnlocked, credits.coins]);

  // Get progress to unlock AI
  const getAIUnlockProgress = useCallback((): number => {
    return Math.min((credits.totalEarned / CREDITS_CONFIG.AI_UNLOCK_THRESHOLD) * 100, 100);
  }, [credits.totalEarned]);

  // Get progress to unlock Online
  const getOnlineUnlockProgress = useCallback((): number => {
    return Math.min((credits.totalEarned / CREDITS_CONFIG.ONLINE_UNLOCK_THRESHOLD) * 100, 100);
  }, [credits.totalEarned]);

  // Reward for 2 player game
  const rewardTwoPlayerGame = useCallback((result: 'win' | 'draw' | 'loss') => {
    let reward = CREDITS_CONFIG.TWO_PLAYER_LOSS_REWARD;
    if (result === 'win') reward = CREDITS_CONFIG.TWO_PLAYER_WIN_REWARD;
    else if (result === 'draw') reward = CREDITS_CONFIG.TWO_PLAYER_DRAW_REWARD;
    
    addCoins(reward, 'twoplayer');
    return reward;
  }, [addCoins]);

  // Reward for watching ad
  const rewardAdWatch = useCallback(() => {
    addCoins(CREDITS_CONFIG.AD_WATCH_REWARD, 'ad');
    return CREDITS_CONFIG.AD_WATCH_REWARD;
  }, [addCoins]);

  // Reward for support click
  const rewardSupportClick = useCallback(() => {
    addCoins(CREDITS_CONFIG.SUPPORT_US_REWARD, 'support');
    return CREDITS_CONFIG.SUPPORT_US_REWARD;
  }, [addCoins]);

  // Pay for AI game
  const payForAIGame = useCallback((): boolean => {
    return spendCoins(CREDITS_CONFIG.AI_GAME_COST);
  }, [spendCoins]);

  // Pay for Online game
  const payForOnlineGame = useCallback((): boolean => {
    return spendCoins(CREDITS_CONFIG.ONLINE_GAME_COST);
  }, [spendCoins]);

  // Reset credits
  const resetCredits = useCallback(() => {
    saveCredits(DEFAULT_CREDITS);
  }, [saveCredits]);

  return {
    credits,
    isLoaded,
    addCoins,
    spendCoins,
    canAfford,
    isAIUnlocked,
    isOnlineUnlocked,
    canPlayAI,
    canPlayOnline,
    getAIUnlockProgress,
    getOnlineUnlockProgress,
    rewardTwoPlayerGame,
    rewardAdWatch,
    rewardSupportClick,
    payForAIGame,
    payForOnlineGame,
    resetCredits,
    config: CREDITS_CONFIG,
  };
};
