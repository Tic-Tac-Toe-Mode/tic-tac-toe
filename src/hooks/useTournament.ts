import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Tournament {
  id: string;
  name: string;
  created_by: string;
  status: 'waiting' | 'in_progress' | 'finished';
  max_players: number;
  current_round: number;
  winner_id: string | null;
  winner_name: string | null;
  created_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  player_id: string;
  player_name: string;
  seed: number | null;
  eliminated: boolean;
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player1_name: string | null;
  player2_id: string | null;
  player2_name: string | null;
  winner_id: string | null;
  game_id: string | null;
  status: 'pending' | 'playing' | 'finished';
}

export const useTournament = (playerId: string, playerName: string) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available tournaments
  const fetchTournaments = useCallback(async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .in('status', ['waiting', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setTournaments(data as Tournament[]);
    }
  }, []);

  // Create a tournament
  const createTournament = async (name: string, maxPlayers: 4 | 8) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name,
        created_by: playerId,
        max_players: maxPlayers,
        status: 'waiting'
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create tournament');
      setIsLoading(false);
      return null;
    }

    // Auto-join as first participant
    await supabase.from('tournament_participants').insert({
      tournament_id: data.id,
      player_id: playerId,
      player_name: playerName,
      seed: 1
    });

    setCurrentTournament(data as Tournament);
    toast.success('Tournament created!');
    setIsLoading(false);
    return data;
  };

  // Join a tournament
  const joinTournament = async (tournamentId: string) => {
    setIsLoading(true);
    
    // Get current participant count
    const { count } = await supabase
      .from('tournament_participants')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', tournamentId);

    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (!tournament || (count && count >= tournament.max_players)) {
      toast.error('Tournament is full');
      setIsLoading(false);
      return false;
    }

    const { error } = await supabase.from('tournament_participants').insert({
      tournament_id: tournamentId,
      player_id: playerId,
      player_name: playerName,
      seed: (count || 0) + 1
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('Already in this tournament');
      } else {
        toast.error('Failed to join tournament');
      }
      setIsLoading(false);
      return false;
    }

    setCurrentTournament(tournament as Tournament);
    toast.success('Joined tournament!');
    setIsLoading(false);
    return true;
  };

  // Leave tournament
  const leaveTournament = async () => {
    if (!currentTournament) return;

    await supabase
      .from('tournament_participants')
      .delete()
      .eq('tournament_id', currentTournament.id)
      .eq('player_id', playerId);

    setCurrentTournament(null);
    setParticipants([]);
    setMatches([]);
  };

  // Start tournament (only creator can start)
  const startTournament = async () => {
    if (!currentTournament || currentTournament.created_by !== playerId) return;

    if (participants.length < currentTournament.max_players) {
      toast.error(`Need ${currentTournament.max_players} players to start`);
      return;
    }

    // Generate bracket matches
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const firstRoundMatches = [];
    
    for (let i = 0; i < shuffled.length; i += 2) {
      firstRoundMatches.push({
        tournament_id: currentTournament.id,
        round: 1,
        match_number: Math.floor(i / 2) + 1,
        player1_id: shuffled[i].player_id,
        player1_name: shuffled[i].player_name,
        player2_id: shuffled[i + 1].player_id,
        player2_name: shuffled[i + 1].player_name,
        status: 'pending'
      });
    }

    // Create empty matches for subsequent rounds
    const totalRounds = Math.log2(currentTournament.max_players);
    const allMatches = [...firstRoundMatches];
    
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = currentTournament.max_players / Math.pow(2, round);
      for (let i = 0; i < matchesInRound; i++) {
        allMatches.push({
          tournament_id: currentTournament.id,
          round,
          match_number: i + 1,
          player1_id: null,
          player1_name: null,
          player2_id: null,
          player2_name: null,
          status: 'pending'
        });
      }
    }

    await supabase.from('tournament_matches').insert(allMatches);
    await supabase
      .from('tournaments')
      .update({ status: 'in_progress', current_round: 1 })
      .eq('id', currentTournament.id);

    toast.success('Tournament started!');
  };

  // Get my current match
  const getMyMatch = useCallback(() => {
    if (!currentTournament) return null;
    return matches.find(m => 
      m.status !== 'finished' && 
      (m.player1_id === playerId || m.player2_id === playerId)
    );
  }, [matches, currentTournament, playerId]);

  // Check if I'm eliminated
  const isEliminated = useCallback(() => {
    const participant = participants.find(p => p.player_id === playerId);
    return participant?.eliminated || false;
  }, [participants, playerId]);

  // Subscribe to tournament updates
  useEffect(() => {
    if (!currentTournament) return;

    // Fetch participants
    const fetchParticipants = async () => {
      const { data } = await supabase
        .from('tournament_participants')
        .select('*')
        .eq('tournament_id', currentTournament.id)
        .order('seed');
      if (data) setParticipants(data as TournamentParticipant[]);
    };

    // Fetch matches
    const fetchMatches = async () => {
      const { data } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', currentTournament.id)
        .order('round')
        .order('match_number');
      if (data) setMatches(data as TournamentMatch[]);
    };

    fetchParticipants();
    fetchMatches();

    // Subscribe to changes
    const tournamentsChannel = supabase
      .channel(`tournament-${currentTournament.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournaments',
        filter: `id=eq.${currentTournament.id}`
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setCurrentTournament(null);
          toast.info('Tournament was cancelled');
        } else {
          setCurrentTournament(payload.new as Tournament);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournament_participants',
        filter: `tournament_id=eq.${currentTournament.id}`
      }, () => fetchParticipants())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournament_matches',
        filter: `tournament_id=eq.${currentTournament.id}`
      }, () => fetchMatches())
      .subscribe();

    return () => {
      supabase.removeChannel(tournamentsChannel);
    };
  }, [currentTournament?.id]);

  // Subscribe to tournaments list
  useEffect(() => {
    fetchTournaments();

    const channel = supabase
      .channel('tournaments-list')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournaments'
      }, () => fetchTournaments())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTournaments]);

  return {
    tournaments,
    currentTournament,
    participants,
    matches,
    isLoading,
    createTournament,
    joinTournament,
    leaveTournament,
    startTournament,
    getMyMatch,
    isEliminated,
    fetchTournaments
  };
};
