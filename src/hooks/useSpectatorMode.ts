import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SpectatorGame {
  id: string;
  player_x_name: string;
  player_o_name: string | null;
  board: (string | null)[];
  current_player: string;
  winner: string | null;
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
}

export const useSpectatorMode = () => {
  const [activeGames, setActiveGames] = useState<SpectatorGame[]>([]);
  const [spectatingGame, setSpectatingGame] = useState<SpectatorGame | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch active games (playing status)
  const fetchActiveGames = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('online_games')
      .select('id, player_x_name, player_o_name, board, current_player, winner, status, created_at')
      .eq('status', 'playing')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setActiveGames(data as SpectatorGame[]);
    }
    setIsLoading(false);
  }, []);

  // Start spectating a game
  const spectateGame = async (gameId: string) => {
    const { data, error } = await supabase
      .from('online_games')
      .select('id, player_x_name, player_o_name, board, current_player, winner, status, created_at')
      .eq('id', gameId)
      .single();

    if (!error && data) {
      setSpectatingGame(data as SpectatorGame);
    }
  };

  // Stop spectating
  const stopSpectating = () => {
    setSpectatingGame(null);
  };

  // Subscribe to game updates when spectating
  useEffect(() => {
    if (!spectatingGame) return;

    const channel = supabase
      .channel(`spectate-${spectatingGame.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'online_games',
          filter: `id=eq.${spectatingGame.id}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setSpectatingGame(null);
          } else {
            const game = payload.new as SpectatorGame;
            setSpectatingGame(game);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spectatingGame?.id]);

  // Subscribe to active games list updates
  useEffect(() => {
    const channel = supabase
      .channel('active-games-spectator')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'online_games'
        },
        () => {
          fetchActiveGames();
        }
      )
      .subscribe();

    fetchActiveGames();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActiveGames]);

  return {
    activeGames,
    spectatingGame,
    isLoading,
    fetchActiveGames,
    spectateGame,
    stopSpectating
  };
};
