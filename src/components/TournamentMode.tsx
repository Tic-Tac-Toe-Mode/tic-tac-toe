import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Trophy, Users, Plus, RefreshCw, Crown, Swords, Medal, Gift, TrendingUp } from 'lucide-react';
import { useTournament, Tournament, TournamentMatch } from '@/hooks/useTournament';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TournamentModeProps {
  playerId: string;
  playerName: string;
  onBack: () => void;
}

const TournamentMode: React.FC<TournamentModeProps> = ({ playerId, playerName, onBack }) => {
  const {
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
  } = useTournament(playerId, playerName);

  const [showCreate, setShowCreate] = useState(false);
  const [tournamentName, setTournamentName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<4 | 8>(8);
  const [winnerBonus, setWinnerBonus] = useState(50);
  const [runnerUpBonus, setRunnerUpBonus] = useState(25);
  const [participantBonus, setParticipantBonus] = useState(10);

  const handleCreate = async () => {
    if (!tournamentName.trim()) return;
    await createTournament(tournamentName.trim(), maxPlayers, {
      winner: winnerBonus,
      runnerUp: runnerUpBonus,
      participant: participantBonus
    });
    setShowCreate(false);
    setTournamentName('');
  };

  // Apply tournament prizes
  const applyTournamentPrizes = async (tournament: Tournament, winnerId: string, runnerUpId: string) => {
    // Apply winner bonus
    const { data: winnerRanking } = await supabase
      .from('player_rankings')
      .select('elo_rating')
      .eq('player_id', winnerId)
      .maybeSingle();

    if (winnerRanking) {
      await supabase
        .from('player_rankings')
        .update({ 
          elo_rating: winnerRanking.elo_rating + tournament.winner_elo_bonus,
          highest_elo: Math.max(winnerRanking.elo_rating + tournament.winner_elo_bonus, winnerRanking.elo_rating)
        })
        .eq('player_id', winnerId);
    }

    // Apply runner-up bonus
    const { data: runnerUpRanking } = await supabase
      .from('player_rankings')
      .select('elo_rating')
      .eq('player_id', runnerUpId)
      .maybeSingle();

    if (runnerUpRanking) {
      await supabase
        .from('player_rankings')
        .update({ 
          elo_rating: runnerUpRanking.elo_rating + tournament.runner_up_elo_bonus,
          highest_elo: Math.max(runnerUpRanking.elo_rating + tournament.runner_up_elo_bonus, runnerUpRanking.elo_rating)
        })
        .eq('player_id', runnerUpId);
    }

    // Apply participant bonus to all other participants
    const otherParticipants = participants.filter(
      p => p.player_id !== winnerId && p.player_id !== runnerUpId
    );

    for (const participant of otherParticipants) {
      const { data: participantRanking } = await supabase
        .from('player_rankings')
        .select('elo_rating')
        .eq('player_id', participant.player_id)
        .maybeSingle();

      if (participantRanking) {
        await supabase
          .from('player_rankings')
          .update({ 
            elo_rating: participantRanking.elo_rating + tournament.participant_elo_bonus,
            highest_elo: Math.max(participantRanking.elo_rating + tournament.participant_elo_bonus, participantRanking.elo_rating)
          })
          .eq('player_id', participant.player_id);
      }
    }

    toast.success('Tournament prizes distributed!');
  };

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semi-Final';
    if (round === totalRounds - 2) return 'Quarter-Final';
    return `Round ${round}`;
  };

  // Tournament lobby (waiting for players)
  if (currentTournament && currentTournament.status === 'waiting') {
    const isCreator = currentTournament.created_by === playerId;
    const canStart = participants.length === currentTournament.max_players;

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <Button variant="ghost" onClick={leaveTournament} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave Tournament
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <CardTitle>{currentTournament.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {participants.length}/{currentTournament.max_players} players
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Participants list */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Players</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: currentTournament.max_players }).map((_, i) => {
                    const participant = participants[i];
                    return (
                      <div
                        key={i}
                        className={`p-2 rounded-lg text-sm ${
                          participant 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'bg-muted/30 border border-dashed border-muted-foreground/30'
                        }`}
                      >
                        {participant ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{participant.player_name}</span>
                            {participant.player_id === currentTournament.created_by && (
                              <Crown className="w-3 h-3 text-yellow-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Waiting...</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Start button for creator */}
              {isCreator && (
                <Button
                  onClick={startTournament}
                  disabled={!canStart}
                  className="w-full"
                >
                  <Swords className="w-4 h-4 mr-2" />
                  {canStart ? 'Start Tournament' : `Need ${currentTournament.max_players - participants.length} more players`}
                </Button>
              )}

              {!isCreator && (
                <p className="text-center text-sm text-muted-foreground">
                  Waiting for host to start the tournament...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Tournament in progress
  if (currentTournament && currentTournament.status === 'in_progress') {
    const totalRounds = Math.log2(currentTournament.max_players);
    const myMatch = getMyMatch();
    const eliminated = isEliminated();

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={leaveTournament} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave
          </Button>

          <Card className="mb-4">
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-lg">{currentTournament.name}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Round {currentTournament.current_round} of {totalRounds}
              </p>
            </CardHeader>
            <CardContent>
              {/* My status */}
              {eliminated ? (
                <div className="text-center py-4 bg-destructive/10 rounded-lg mb-4">
                  <p className="text-destructive font-semibold">You have been eliminated</p>
                  <p className="text-sm text-muted-foreground">Watch the remaining matches!</p>
                </div>
              ) : myMatch ? (
                <div className="text-center py-4 bg-primary/10 rounded-lg mb-4">
                  <p className="font-semibold text-primary">Your match is ready!</p>
                  <p className="text-sm">
                    vs {myMatch.player1_id === playerId ? myMatch.player2_name : myMatch.player1_name}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 bg-muted/50 rounded-lg mb-4">
                  <p className="text-muted-foreground">Waiting for next round...</p>
                </div>
              )}

              {/* Bracket display */}
              <div className="space-y-4">
                {Array.from({ length: totalRounds }).map((_, roundIdx) => {
                  const round = roundIdx + 1;
                  const roundMatches = matches.filter(m => m.round === round);
                  
                  return (
                    <div key={round} className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        {getRoundName(round, totalRounds)}
                      </h4>
                      <div className="grid gap-2">
                        {roundMatches.map((match) => (
                          <div
                            key={match.id}
                            className={`p-3 rounded-lg border ${
                              match.status === 'playing' 
                                ? 'border-primary bg-primary/5' 
                                : match.status === 'finished'
                                ? 'border-muted bg-muted/30'
                                : 'border-border'
                            }`}
                          >
                            <div className="flex justify-between items-center text-sm">
                              <div className={`flex-1 ${match.winner_id === match.player1_id ? 'font-bold text-primary' : ''}`}>
                                {match.player1_name || 'TBD'}
                                {match.winner_id === match.player1_id && <Medal className="w-3 h-3 inline ml-1 text-yellow-500" />}
                              </div>
                              <span className="text-muted-foreground mx-2">vs</span>
                              <div className={`flex-1 text-right ${match.winner_id === match.player2_id ? 'font-bold text-primary' : ''}`}>
                                {match.player2_name || 'TBD'}
                                {match.winner_id === match.player2_id && <Medal className="w-3 h-3 inline ml-1 text-yellow-500" />}
                              </div>
                            </div>
                            {match.status === 'playing' && (
                              <p className="text-xs text-center text-primary mt-1">In progress...</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Tournament finished
  if (currentTournament && currentTournament.status === 'finished') {
    const finalMatch = matches.find(m => m.round === Math.log2(currentTournament.max_players));
    const runnerUpId = finalMatch 
      ? (finalMatch.winner_id === finalMatch.player1_id ? finalMatch.player2_id : finalMatch.player1_id)
      : null;

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <Button variant="ghost" onClick={leaveTournament} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="text-center">
            <CardHeader>
              <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-2" />
              <CardTitle>Tournament Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-lg">Winner:</p>
                <p className="text-2xl font-bold text-primary">{currentTournament.winner_name}</p>
              </div>

              {/* Prizes */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold flex items-center justify-center gap-2">
                  <Gift className="w-4 h-4 text-yellow-500" />
                  ELO Prizes
                </h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-yellow-500/10 rounded p-2">
                    <Trophy className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
                    <p className="text-xs text-muted-foreground">Winner</p>
                    <p className="font-bold text-green-500">+{currentTournament.winner_elo_bonus}</p>
                  </div>
                  <div className="bg-gray-500/10 rounded p-2">
                    <Medal className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-muted-foreground">2nd</p>
                    <p className="font-bold text-green-500">+{currentTournament.runner_up_elo_bonus}</p>
                  </div>
                  <div className="bg-amber-500/10 rounded p-2">
                    <Users className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                    <p className="text-xs text-muted-foreground">Others</p>
                    <p className="font-bold text-green-500">+{currentTournament.participant_elo_bonus}</p>
                  </div>
                </div>
              </div>

              <Button onClick={leaveTournament} className="w-full">
                Return to Lobby
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Create tournament form
  if (showCreate) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <Button variant="ghost" onClick={() => setShowCreate(false)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Create Tournament
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tournament Name</label>
                <Input
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder="My Tournament"
                  maxLength={30}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Number of Players</label>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant={maxPlayers === 4 ? 'default' : 'outline'}
                    onClick={() => setMaxPlayers(4)}
                    className="flex-1"
                  >
                    4 Players
                  </Button>
                  <Button
                    variant={maxPlayers === 8 ? 'default' : 'outline'}
                    onClick={() => setMaxPlayers(8)}
                    className="flex-1"
                  >
                    8 Players
                  </Button>
                </div>
              </div>

              {/* Prize configuration */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Gift className="w-4 h-4 text-yellow-500" />
                  ELO Prizes
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Winner</label>
                    <Input
                      type="number"
                      value={winnerBonus}
                      onChange={(e) => setWinnerBonus(Math.max(0, parseInt(e.target.value) || 0))}
                      className="text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">2nd Place</label>
                    <Input
                      type="number"
                      value={runnerUpBonus}
                      onChange={(e) => setRunnerUpBonus(Math.max(0, parseInt(e.target.value) || 0))}
                      className="text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Others</label>
                    <Input
                      type="number"
                      value={participantBonus}
                      onChange={(e) => setParticipantBonus(Math.max(0, parseInt(e.target.value) || 0))}
                      className="text-center"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCreate} 
                className="w-full"
                disabled={!tournamentName.trim() || isLoading}
              >
                Create Tournament
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Tournament lobby
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Tournaments
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={fetchTournaments}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setShowCreate(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Tournament
            </Button>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Available Tournaments</h4>
              {tournaments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tournaments available</p>
                  <p className="text-xs">Create one to get started!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                                    <div>
                                        <p className="font-medium">{tournament.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {tournament.status === 'waiting' 
                                            ? `Waiting • ${tournament.max_players} slots`
                                            : 'In progress'}
                                        </p>
                                        {tournament.status === 'waiting' && (
                                          <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                                            <TrendingUp className="w-3 h-3" />
                                            +{tournament.winner_elo_bonus}/{tournament.runner_up_elo_bonus}/{tournament.participant_elo_bonus} ELO
                                          </p>
                                        )}
                                      </div>
                      {tournament.status === 'waiting' && (
                        <Button
                          size="sm"
                          onClick={() => joinTournament(tournament.id)}
                          disabled={isLoading}
                        >
                          Join
                        </Button>
                      )}
                      {tournament.status === 'in_progress' && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                          Live
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TournamentMode;
