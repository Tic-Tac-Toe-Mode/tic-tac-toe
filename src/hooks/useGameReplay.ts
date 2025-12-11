import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GameMove {
  player: 'X' | 'O';
  position: number;
  timestamp: string;
}

export interface ReplayGame {
  id: string;
  player_x_name: string;
  player_o_name: string;
  winner: string | null;
  move_history: GameMove[];
  created_at: string;
}

export const useGameReplay = () => {
  const [replayGames, setReplayGames] = useState<ReplayGame[]>([]);
  const [currentReplay, setCurrentReplay] = useState<ReplayGame | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch finished games with move history
  const fetchReplayableGames = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('online_games')
      .select('id, player_x_name, player_o_name, winner, move_history, created_at')
      .eq('status', 'finished')
      .not('move_history', 'eq', '[]')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching replay games:', error);
      setIsLoading(false);
      return;
    }

    const games = (data || []).map(g => ({
      ...g,
      move_history: (g.move_history as unknown as GameMove[]) || []
    })) as ReplayGame[];
    
    setReplayGames(games.filter(g => g.move_history.length > 0));
    setIsLoading(false);
  }, []);

  // Start replay for a game
  const startReplay = (game: ReplayGame) => {
    setCurrentReplay(game);
    setCurrentMoveIndex(0);
    setIsPlaying(false);
  };

  // Stop replay
  const stopReplay = () => {
    setCurrentReplay(null);
    setCurrentMoveIndex(0);
    setIsPlaying(false);
  };

  // Get board state at current move index
  const getBoardAtMove = useCallback((moveIndex: number): (string | null)[] => {
    if (!currentReplay) return Array(9).fill(null);
    
    const board: (string | null)[] = Array(9).fill(null);
    const moves = currentReplay.move_history.slice(0, moveIndex + 1);
    
    moves.forEach(move => {
      board[move.position] = move.player;
    });
    
    return board;
  }, [currentReplay]);

  // Navigation controls
  const goToMove = (index: number) => {
    if (!currentReplay) return;
    const maxIndex = currentReplay.move_history.length - 1;
    setCurrentMoveIndex(Math.max(-1, Math.min(index, maxIndex)));
  };

  const nextMove = () => {
    if (!currentReplay) return;
    if (currentMoveIndex < currentReplay.move_history.length - 1) {
      setCurrentMoveIndex(prev => prev + 1);
    }
  };

  const previousMove = () => {
    if (currentMoveIndex > -1) {
      setCurrentMoveIndex(prev => prev - 1);
    }
  };

  const goToStart = () => {
    setCurrentMoveIndex(-1);
    setIsPlaying(false);
  };

  const goToEnd = () => {
    if (!currentReplay) return;
    setCurrentMoveIndex(currentReplay.move_history.length - 1);
    setIsPlaying(false);
  };

  // Auto-play functionality
  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  return {
    replayGames,
    currentReplay,
    currentMoveIndex,
    isPlaying,
    isLoading,
    fetchReplayableGames,
    startReplay,
    stopReplay,
    getBoardAtMove,
    goToMove,
    nextMove,
    previousMove,
    goToStart,
    goToEnd,
    togglePlay,
    setIsPlaying
  };
};
