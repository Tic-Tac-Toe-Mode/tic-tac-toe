import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OnlineGame {
  id: string;
  player_x_id: string;
  player_x_name: string;
  player_o_id: string | null;
  player_o_name: string | null;
  board: (string | null)[];
  current_player: string;
  winner: string | null;
  status: 'waiting' | 'playing' | 'finished';
  rematch_requested_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useOnlineGame = () => {
  const [playerId] = useState(() => {
    let id = localStorage.getItem('tictactoe-player-id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('tictactoe-player-id', id);
    }
    return id;
  });
  
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('tictactoe-online-name') || '';
  });
  
  const [currentGame, setCurrentGame] = useState<OnlineGame | null>(null);
  const [availableGames, setAvailableGames] = useState<OnlineGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const savePlayerName = (name: string) => {
    setPlayerName(name);
    localStorage.setItem('tictactoe-online-name', name);
  };

  // Get my role in current game
  const getMyRole = useCallback((): 'X' | 'O' | null => {
    if (!currentGame) return null;
    if (currentGame.player_x_id === playerId) return 'X';
    if (currentGame.player_o_id === playerId) return 'O';
    return null;
  }, [currentGame, playerId]);

  // Check if it's my turn
  const isMyTurn = useCallback(() => {
    const myRole = getMyRole();
    if (!myRole || !currentGame) return false;
    return currentGame.current_player === myRole && currentGame.status === 'playing';
  }, [currentGame, getMyRole]);

  // Fetch available games
  const fetchAvailableGames = useCallback(async () => {
    const { data, error } = await supabase
      .from('online_games')
      .select('*')
      .eq('status', 'waiting')
      .neq('player_x_id', playerId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching games:', error);
      return;
    }

    setAvailableGames(data as unknown as OnlineGame[]);
  }, [playerId]);

  // Create a new game
  const createGame = async () => {
    if (!playerName.trim()) {
      toast.error('Please enter your name first');
      return null;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('online_games')
      .insert({
        player_x_id: playerId,
        player_x_name: playerName.trim(),
        board: Array(9).fill(null),
        current_player: 'X',
        status: 'waiting'
      })
      .select()
      .single();

    setIsLoading(false);

    if (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
      return null;
    }

    setCurrentGame(data as unknown as OnlineGame);
    setIsSearching(true);
    toast.success('Game created! Waiting for opponent...');
    return data;
  };

  // Join an existing game
  const joinGame = async (gameId: string) => {
    if (!playerName.trim()) {
      toast.error('Please enter your name first');
      return false;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('online_games')
      .update({
        player_o_id: playerId,
        player_o_name: playerName.trim(),
        status: 'playing'
      })
      .eq('id', gameId)
      .eq('status', 'waiting')
      .select()
      .single();

    setIsLoading(false);

    if (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game. It may have been taken.');
      fetchAvailableGames();
      return false;
    }

    setCurrentGame(data as unknown as OnlineGame);
    toast.success('Joined game! You are O');
    return true;
  };

  // Make a move
  const makeMove = async (index: number) => {
    if (!currentGame || !isMyTurn()) return false;

    const myRole = getMyRole();
    const newBoard = [...currentGame.board];
    
    if (newBoard[index] !== null) return false;
    
    newBoard[index] = myRole;

    // Check for winner
    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every(cell => cell !== null);

    const { error } = await supabase
      .from('online_games')
      .update({
        board: newBoard,
        current_player: myRole === 'X' ? 'O' : 'X',
        winner: winner || (isDraw ? 'draw' : null),
        status: winner || isDraw ? 'finished' : 'playing'
      })
      .eq('id', currentGame.id);

    if (error) {
      console.error('Error making move:', error);
      toast.error('Failed to make move');
      return false;
    }

    return true;
  };

  // Check for winner
  const checkWinner = (board: (string | null)[]): string | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  // Leave current game
  const leaveGame = async () => {
    if (currentGame && currentGame.status === 'waiting') {
      await supabase
        .from('online_games')
        .delete()
        .eq('id', currentGame.id);
    }
    setCurrentGame(null);
    setIsSearching(false);
  };

  // Request rematch
  const requestRematch = async () => {
    if (!currentGame || currentGame.status !== 'finished') return false;

    const myRole = getMyRole();
    if (!myRole) return false;

    // Check if opponent already requested
    const opponentId = myRole === 'X' ? currentGame.player_o_id : currentGame.player_x_id;
    
    if (currentGame.rematch_requested_by === opponentId) {
      // Both players want rematch - create new game with swapped roles
      const newGame = await createRematchGame();
      return !!newGame;
    }

    // Just mark our request
    const { error } = await supabase
      .from('online_games')
      .update({ rematch_requested_by: playerId })
      .eq('id', currentGame.id);

    if (error) {
      console.error('Error requesting rematch:', error);
      toast.error('Failed to request rematch');
      return false;
    }

    toast.success('Rematch requested! Waiting for opponent...');
    return true;
  };

  // Create rematch game with swapped roles
  const createRematchGame = async () => {
    if (!currentGame) return null;

    const myRole = getMyRole();
    // Swap roles: previous X becomes O, previous O becomes X
    const newPlayerXId = currentGame.player_o_id;
    const newPlayerXName = currentGame.player_o_name;
    const newPlayerOId = currentGame.player_x_id;
    const newPlayerOName = currentGame.player_x_name;

    const { data, error } = await supabase
      .from('online_games')
      .insert({
        player_x_id: newPlayerXId,
        player_x_name: newPlayerXName,
        player_o_id: newPlayerOId,
        player_o_name: newPlayerOName,
        board: Array(9).fill(null),
        current_player: 'X',
        status: 'playing'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating rematch game:', error);
      toast.error('Failed to create rematch');
      return null;
    }

    // Delete old game
    await supabase
      .from('online_games')
      .delete()
      .eq('id', currentGame.id);

    setCurrentGame(data as unknown as OnlineGame);
    toast.success('Rematch started! Roles swapped.');
    return data;
  };

  // Check if I requested rematch
  const hasRequestedRematch = useCallback(() => {
    if (!currentGame) return false;
    return currentGame.rematch_requested_by === playerId;
  }, [currentGame, playerId]);

  // Check if opponent requested rematch
  const opponentRequestedRematch = useCallback(() => {
    if (!currentGame || !currentGame.rematch_requested_by) return false;
    return currentGame.rematch_requested_by !== playerId;
  }, [currentGame, playerId]);

  // Subscribe to game updates
  useEffect(() => {
    if (!currentGame) return;

    const channel = supabase
      .channel(`game-${currentGame.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'online_games',
          filter: `id=eq.${currentGame.id}`
        },
        (payload) => {
          console.log('Game update:', payload);
          if (payload.eventType === 'DELETE') {
            setCurrentGame(null);
            setIsSearching(false);
            toast.info('Game was cancelled');
          } else {
            const newGame = payload.new as unknown as OnlineGame;
            setCurrentGame(newGame);
            
            if (newGame.status === 'playing' && isSearching) {
              setIsSearching(false);
              toast.success(`${newGame.player_o_name} joined the game!`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentGame?.id, isSearching]);

  // Subscribe to available games updates
  useEffect(() => {
    const channel = supabase
      .channel('available-games')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'online_games'
        },
        () => {
          fetchAvailableGames();
        }
      )
      .subscribe();

    fetchAvailableGames();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAvailableGames]);

  return {
    playerId,
    playerName,
    savePlayerName,
    currentGame,
    availableGames,
    isLoading,
    isSearching,
    getMyRole,
    isMyTurn,
    createGame,
    joinGame,
    makeMove,
    leaveGame,
    fetchAvailableGames,
    requestRematch,
    hasRequestedRematch,
    opponentRequestedRematch
  };
};
