import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlayerRanking {
  id: string;
  player_id: string;
  player_name: string;
  elo_rating: number;
  wins: number;
  losses: number;
  draws: number;
  games_played: number;
  highest_elo: number;
  win_streak: number;
  best_streak: number;
  created_at: string;
  updated_at: string;
}

// ELO calculation constants
const K_FACTOR = 32; // How much ratings change per game
const BASE_RATING = 1000;

// Calculate expected score based on ELO difference
const getExpectedScore = (playerRating: number, opponentRating: number): number => {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
};

// Calculate new ELO rating
export const calculateNewElo = (
  playerRating: number,
  opponentRating: number,
  result: 'win' | 'loss' | 'draw'
): { newRating: number; change: number } => {
  const expected = getExpectedScore(playerRating, opponentRating);
  const actual = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
  const change = Math.round(K_FACTOR * (actual - expected));
  const newRating = Math.max(100, playerRating + change); // Minimum ELO of 100
  
  return { newRating, change };
};

export const usePlayerRanking = (playerId: string, playerName: string) => {
  const [myRanking, setMyRanking] = useState<PlayerRanking | null>(null);
  const [leaderboard, setLeaderboard] = useState<PlayerRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastEloChange, setLastEloChange] = useState<number | null>(null);

  // Fetch or create player ranking
  const fetchOrCreateRanking = useCallback(async () => {
    if (!playerId || !playerName) return;

    setIsLoading(true);

    // Try to fetch existing ranking
    const { data: existing, error: fetchError } = await supabase
      .from('player_rankings')
      .select('*')
      .eq('player_id', playerId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching ranking:', fetchError);
      setIsLoading(false);
      return;
    }

    if (existing) {
      // Update name if changed
      if (existing.player_name !== playerName) {
        const { data: updated } = await supabase
          .from('player_rankings')
          .update({ player_name: playerName })
          .eq('player_id', playerId)
          .select()
          .single();
        
        if (updated) {
          setMyRanking(updated as unknown as PlayerRanking);
        } else {
          setMyRanking(existing as unknown as PlayerRanking);
        }
      } else {
        setMyRanking(existing as unknown as PlayerRanking);
      }
    } else {
      // Create new ranking
      const { data: created, error: createError } = await supabase
        .from('player_rankings')
        .insert({
          player_id: playerId,
          player_name: playerName,
          elo_rating: BASE_RATING,
          highest_elo: BASE_RATING
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating ranking:', createError);
      } else if (created) {
        setMyRanking(created as unknown as PlayerRanking);
      }
    }

    setIsLoading(false);
  }, [playerId, playerName]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    const { data, error } = await supabase
      .from('player_rankings')
      .select('*')
      .order('elo_rating', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return;
    }

    setLeaderboard(data as unknown as PlayerRanking[]);
  }, []);

  // Update ELO after a game
  const updateEloAfterGame = async (
    opponentPlayerId: string,
    result: 'win' | 'loss' | 'draw'
  ): Promise<{ myChange: number; opponentChange: number } | null> => {
    if (!myRanking) return null;

    // Fetch opponent's ranking
    const { data: opponentData } = await supabase
      .from('player_rankings')
      .select('*')
      .eq('player_id', opponentPlayerId)
      .maybeSingle();

    const opponentRating = opponentData?.elo_rating || BASE_RATING;
    
    // Calculate new ratings
    const myResult = calculateNewElo(myRanking.elo_rating, opponentRating, result);
    const opponentResult = calculateNewElo(
      opponentRating,
      myRanking.elo_rating,
      result === 'win' ? 'loss' : result === 'loss' ? 'win' : 'draw'
    );

    // Update my ranking
    const newWinStreak = result === 'win' 
      ? myRanking.win_streak + 1 
      : 0;
    const newBestStreak = Math.max(myRanking.best_streak, newWinStreak);
    const newHighestElo = Math.max(myRanking.highest_elo, myResult.newRating);

    const { error: myError } = await supabase
      .from('player_rankings')
      .update({
        elo_rating: myResult.newRating,
        wins: result === 'win' ? myRanking.wins + 1 : myRanking.wins,
        losses: result === 'loss' ? myRanking.losses + 1 : myRanking.losses,
        draws: result === 'draw' ? myRanking.draws + 1 : myRanking.draws,
        games_played: myRanking.games_played + 1,
        highest_elo: newHighestElo,
        win_streak: newWinStreak,
        best_streak: newBestStreak
      })
      .eq('player_id', playerId);

    if (myError) {
      console.error('Error updating my ranking:', myError);
      return null;
    }

    // Update opponent's ranking (or create if doesn't exist)
    if (opponentData) {
      const oppNewWinStreak = result === 'loss' 
        ? opponentData.win_streak + 1 
        : 0;
      const oppNewBestStreak = Math.max(opponentData.best_streak, oppNewWinStreak);
      const oppNewHighestElo = Math.max(opponentData.highest_elo, opponentResult.newRating);

      await supabase
        .from('player_rankings')
        .update({
          elo_rating: opponentResult.newRating,
          wins: result === 'loss' ? opponentData.wins + 1 : opponentData.wins,
          losses: result === 'win' ? opponentData.losses + 1 : opponentData.losses,
          draws: result === 'draw' ? opponentData.draws + 1 : opponentData.draws,
          games_played: opponentData.games_played + 1,
          highest_elo: oppNewHighestElo,
          win_streak: oppNewWinStreak,
          best_streak: oppNewBestStreak
        })
        .eq('player_id', opponentPlayerId);
    }

    // Update local state
    setMyRanking(prev => prev ? {
      ...prev,
      elo_rating: myResult.newRating,
      wins: result === 'win' ? prev.wins + 1 : prev.wins,
      losses: result === 'loss' ? prev.losses + 1 : prev.losses,
      draws: result === 'draw' ? prev.draws + 1 : prev.draws,
      games_played: prev.games_played + 1,
      highest_elo: newHighestElo,
      win_streak: newWinStreak,
      best_streak: newBestStreak
    } : null);

    setLastEloChange(myResult.change);

    return { myChange: myResult.change, opponentChange: opponentResult.change };
  };

  // Get player's rank position
  const getMyRank = useCallback((): number => {
    if (!myRanking) return 0;
    const position = leaderboard.findIndex(r => r.player_id === playerId);
    return position >= 0 ? position + 1 : 0;
  }, [leaderboard, myRanking, playerId]);

  // Initialize
  useEffect(() => {
    if (playerId && playerName) {
      fetchOrCreateRanking();
      fetchLeaderboard();
    }
  }, [playerId, playerName, fetchOrCreateRanking, fetchLeaderboard]);

  // Subscribe to ranking updates
  useEffect(() => {
    const channel = supabase
      .channel('rankings-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_rankings'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard]);

  return {
    myRanking,
    leaderboard,
    isLoading,
    lastEloChange,
    getMyRank,
    updateEloAfterGame,
    fetchLeaderboard,
    clearLastEloChange: () => setLastEloChange(null)
  };
};
