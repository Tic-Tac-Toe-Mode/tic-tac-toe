import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOnlineGame, OnlineGame } from '@/hooks/useOnlineGame';
import { usePlayerRanking } from '@/hooks/usePlayerRanking';
import { OnlineRankings } from '@/components/OnlineRankings';
import GameChat from '@/components/GameChat';
import SpectatorMode from '@/components/SpectatorMode';
import TournamentMode from '@/components/TournamentMode';
import { ArrowLeft, Users, Plus, RefreshCw, Wifi, WifiOff, Loader2, RotateCcw, Trophy, TrendingUp, TrendingDown, Minus, Eye, Swords } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface OnlineMultiplayerProps {
  onBack: () => void;
}

const triggerHaptic = async (type: "move" | "win" | "draw") => {
  try {
    if (type === "move") {
      await Haptics.impact({ style: ImpactStyle.Light });
    } else if (type === "win") {
      await Haptics.notification({ type: NotificationType.Success });
    } else {
      await Haptics.notification({ type: NotificationType.Warning });
    }
  } catch {
    // Haptics not available
  }
};

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export const OnlineMultiplayer = ({ onBack }: OnlineMultiplayerProps) => {
  const {
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
  } = useOnlineGame();

  const {
    myRanking,
    leaderboard,
    lastEloChange,
    updateEloAfterGame,
    clearLastEloChange
  } = usePlayerRanking(playerId, playerName);

  const [tempName, setTempName] = useState(playerName);
  const [showNameInput, setShowNameInput] = useState(!playerName);
  const [showRankings, setShowRankings] = useState(false);
  const [showSpectator, setShowSpectator] = useState(false);
  const [showTournament, setShowTournament] = useState(false);
  const [eloUpdated, setEloUpdated] = useState(false);
  const prevGameRef = useRef<OnlineGame | null>(null);
  const { playMoveSound, playWinSound, playDrawSound } = useSoundEffects();

  // Update ELO when game finishes
  useEffect(() => {
    if (!currentGame || !prevGameRef.current) {
      prevGameRef.current = currentGame;
      return;
    }

    const prevStatus = prevGameRef.current.status;
    const currStatus = currentGame.status;

    // Game just finished
    if (prevStatus === 'playing' && currStatus === 'finished' && !eloUpdated) {
      const myRole = getMyRole();
      const opponentId = myRole === 'X' ? currentGame.player_o_id : currentGame.player_x_id;
      
      if (opponentId && currentGame.winner) {
        let result: 'win' | 'loss' | 'draw';
        if (currentGame.winner === 'draw') {
          result = 'draw';
        } else if (currentGame.winner === myRole) {
          result = 'win';
        } else {
          result = 'loss';
        }
        
        updateEloAfterGame(opponentId, result);
        setEloUpdated(true);
      }
    }

    // Reset eloUpdated when starting new game
    if (currStatus === 'playing' && prevStatus !== 'playing') {
      setEloUpdated(false);
      clearLastEloChange();
    }

    prevGameRef.current = currentGame;
  }, [currentGame, getMyRole, updateEloAfterGame, eloUpdated, clearLastEloChange]);

  const handleCreateGame = async () => {
    await createGame();
  };

  const handleJoinGame = async (gameId: string) => {
    await joinGame(gameId);
  };

  const handleCellClick = async (index: number) => {
    if (!currentGame || !isMyTurn()) return;
    if (currentGame.board[index] !== null) return;

    const myRole = getMyRole();
    playMoveSound(myRole === 'X');
    triggerHaptic('move');

    const success = await makeMove(index);
    
    if (success && currentGame) {
      const newBoard = [...currentGame.board];
      newBoard[index] = myRole;
      
      // Check for winner locally for immediate feedback
      for (const [a, b, c] of WINNING_COMBINATIONS) {
        if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
          if (newBoard[a] === myRole) {
            playWinSound();
            triggerHaptic('win');
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: myRole === 'X' ? ['#06b6d4', '#0ea5e9'] : ['#a855f7', '#c084fc'],
            });
          }
          return;
        }
      }
      
      if (newBoard.every(cell => cell !== null)) {
        playDrawSound();
        triggerHaptic('draw');
      }
    }
  };

  const handleLeaveGame = async () => {
    await leaveGame();
  };

  const handleBack = () => {
    if (currentGame) {
      handleLeaveGame();
    }
    onBack();
  };

  const getWinningLine = () => {
    if (!currentGame?.winner || currentGame.winner === 'draw') return [];
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (currentGame.board[a] && 
          currentGame.board[a] === currentGame.board[b] && 
          currentGame.board[a] === currentGame.board[c]) {
        return combo;
      }
    }
    return [];
  };

  const winningLine = getWinningLine();

  // Rankings view
  if (showRankings) {
    return (
      <OnlineRankings
        rankings={leaderboard}
        myPlayerId={playerId}
        onClose={() => setShowRankings(false)}
      />
    );
  }

  // Spectator view
  if (showSpectator) {
    return (
      <SpectatorMode 
        onBack={() => setShowSpectator(false)} 
        playerId={playerId}
        playerName={playerName}
      />
    );
  }

  // Tournament view
  if (showTournament) {
    return (
      <TournamentMode 
        playerId={playerId}
        playerName={playerName}
        onBack={() => setShowTournament(false)}
      />
    );
  }
  if (showNameInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <Wifi className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-2xl font-bold">Online Multiplayer</h2>
            <p className="text-muted-foreground">Enter your display name</p>
          </div>

          <div>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg border-2 border-primary/20 focus:border-primary outline-none bg-background text-center text-lg"
              maxLength={15}
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => {
                if (tempName.trim()) {
                  savePlayerName(tempName.trim());
                  setShowNameInput(false);
                } else {
                  toast.error('Please enter a name');
                }
              }}
              size="lg"
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90"
              disabled={!tempName.trim()}
            >
              Continue
            </Button>
            <Button onClick={handleBack} variant="outline" size="lg" className="w-full h-12">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Game in progress
  if (currentGame) {
    const myRole = getMyRole();
    const opponentName = myRole === 'X' ? currentGame.player_o_name : currentGame.player_x_name;
    const isWaiting = currentGame.status === 'waiting';
    const isFinished = currentGame.status === 'finished';
    const iWon = currentGame.winner === myRole;
    const isDraw = currentGame.winner === 'draw';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="w-full max-w-md space-y-4">
          <Card className="p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={handleLeaveGame}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Leave
              </Button>

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isWaiting ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {isWaiting ? 'Waiting...' : 'Connected'}
                </span>
              </div>
            </div>

            {isWaiting ? (
              <div className="text-center py-8 space-y-4">
                <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                <div>
                  <p className="text-lg font-semibold">Waiting for opponent...</p>
                  <p className="text-sm text-muted-foreground">Share this game with a friend!</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">You are playing as</p>
                  <p className="text-2xl font-bold text-primary">X</p>
                </div>
              </div>
            ) : (
              <>
                {/* Game status */}
                <div className="text-center mb-4">
                  {isFinished ? (
                    <div className="animate-fade-in space-y-2">
                      {isDraw ? (
                        <p className="text-lg font-semibold text-muted-foreground">It's a Draw!</p>
                      ) : (
                        <p className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          {iWon ? 'You Win! 🎉' : `${opponentName} Wins!`}
                        </p>
                      )}
                      
                      {/* ELO Change Display */}
                      {lastEloChange !== null && (
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                          lastEloChange > 0 
                            ? 'bg-green-500/20 text-green-500' 
                            : lastEloChange < 0 
                            ? 'bg-red-500/20 text-red-500'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {lastEloChange > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : lastEloChange < 0 ? (
                            <TrendingDown className="h-4 w-4" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                          {lastEloChange > 0 ? '+' : ''}{lastEloChange} ELO
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <div className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        currentGame.current_player === 'X' 
                          ? 'bg-primary text-primary-foreground animate-pulse' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {currentGame.player_x_name}
                      </div>
                      <span className="text-muted-foreground">vs</span>
                      <div className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        currentGame.current_player === 'O' 
                          ? 'bg-accent text-accent-foreground animate-pulse' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {currentGame.player_o_name}
                      </div>
                    </div>
                  )}
                  
                  {!isFinished && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {isMyTurn() ? "Your turn!" : "Opponent's turn..."}
                    </p>
                  )}
                </div>

                {/* Your role indicator */}
                <div className="flex justify-center mb-4">
                  <div className="px-4 py-2 bg-muted rounded-lg">
                    <span className="text-xs text-muted-foreground">You are </span>
                    <span className={`font-bold ${myRole === 'X' ? 'text-primary' : 'text-accent'}`}>
                      {myRole}
                    </span>
                  </div>
                </div>

                {/* Game board */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {currentGame.board.map((cell, index) => (
                    <button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      disabled={!isMyTurn() || cell !== null || isFinished}
                      className={`game-cell aspect-square text-5xl font-bold ${
                        cell === 'X' ? 'x' : cell === 'O' ? 'o' : ''
                      } ${winningLine.includes(index) ? 'winner' : ''} ${
                        cell ? 'animate-pop-in' : ''
                      } ${isMyTurn() && !cell && !isFinished ? 'hover:bg-primary/10 cursor-pointer' : ''}`}
                    >
                      {cell}
                    </button>
                  ))}
                </div>

                {isFinished && (
                  <div className="space-y-2">
                    {opponentRequestedRematch() ? (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center mb-2">
                        <p className="text-sm text-green-500 font-medium">
                          {currentGame.player_x_id === currentGame.rematch_requested_by 
                            ? currentGame.player_x_name 
                            : currentGame.player_o_name} wants a rematch!
                        </p>
                      </div>
                    ) : hasRequestedRematch() ? (
                      <div className="p-3 bg-muted rounded-lg text-center mb-2">
                        <p className="text-sm text-muted-foreground">
                          Waiting for opponent to accept rematch...
                        </p>
                      </div>
                    ) : null}

                    <Button 
                      onClick={requestRematch} 
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" 
                      size="lg"
                      disabled={hasRequestedRematch()}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {opponentRequestedRematch() ? 'Accept Rematch' : hasRequestedRematch() ? 'Rematch Requested' : 'Request Rematch'}
                    </Button>
                    
                    <Button onClick={handleLeaveGame} variant="outline" className="w-full" size="lg">
                      Back to Lobby
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Chat component - show when game is active and has opponent */}
          {!isWaiting && currentGame.player_o_id && (
            <GameChat
              gameId={currentGame.id}
              playerId={playerId}
              playerName={playerName}
            />
          )}
        </div>
      </div>
    );
  }

  // Lobby - find or create game
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">{playerName}</span>
          </div>
        </div>

        {/* My ELO Card */}
        {myRanking && (
          <div 
            onClick={() => setShowRankings(true)}
            className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Your ELO Rating</div>
                <div className="text-2xl font-bold text-primary">{myRanking.elo_rating}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-green-500">{myRanking.wins}W</span>
                  <span className="text-muted-foreground">{myRanking.draws}D</span>
                  <span className="text-red-500">{myRanking.losses}L</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tap to view rankings
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-2">
          <Users className="h-10 w-10 mx-auto text-primary" />
          <h2 className="text-2xl font-bold">Online Lobby</h2>
          <p className="text-muted-foreground text-sm">Create or join a game</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleCreateGame}
            size="lg"
            className="flex-1 h-14 bg-gradient-to-r from-primary to-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Plus className="mr-2 h-5 w-5" />
            )}
            Create Game
          </Button>
          <Button
            onClick={() => setShowTournament(true)}
            size="lg"
            variant="outline"
            className="h-14"
            title="Tournaments"
          >
            <Swords className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => setShowSpectator(true)}
            size="lg"
            variant="outline"
            className="h-14"
            title="Watch live games"
          >
            <Eye className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => setShowRankings(true)}
            size="lg"
            variant="outline"
            className="h-14"
          >
            <Trophy className="h-5 w-5 text-yellow-500" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Available Games</h3>
            <Button variant="ghost" size="sm" onClick={fetchAvailableGames}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {availableGames.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <WifiOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No games available</p>
              <p className="text-xs">Create one and wait for someone to join!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div>
                    <p className="font-medium">{game.player_x_name}</p>
                    <p className="text-xs text-muted-foreground">Waiting for opponent</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleJoinGame(game.id)}
                    disabled={isLoading}
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNameInput(true)}
          className="w-full"
        >
          Change Name
        </Button>
      </Card>
    </div>
  );
};
