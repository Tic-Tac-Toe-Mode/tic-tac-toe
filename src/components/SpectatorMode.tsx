import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, RefreshCw, Users } from 'lucide-react';
import { useSpectatorMode, SpectatorGame } from '@/hooks/useSpectatorMode';
import SpectatorChat from './SpectatorChat';

interface SpectatorModeProps {
  onBack: () => void;
  playerId?: string;
  playerName?: string;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const SpectatorMode: React.FC<SpectatorModeProps> = ({ onBack, playerId = '', playerName = 'Spectator' }) => {
  const { activeGames, spectatingGame, isLoading, fetchActiveGames, spectateGame, stopSpectating } = useSpectatorMode();

  const getWinningLine = (board: (string | null)[], winner: string | null): number[] | null => {
    if (!winner || winner === 'draw') return null;
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return [a, b, c];
      }
    }
    return null;
  };

  // Spectating view
  if (spectatingGame) {
    const winningLine = getWinningLine(spectatingGame.board, spectatingGame.winner);
    
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Button variant="ghost" onClick={stopSpectating} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>

          <Card>
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Spectating</span>
              </div>
              <CardTitle className="text-lg">
                {spectatingGame.player_x_name} vs {spectatingGame.player_o_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Game Status */}
              <div className="text-center mb-4">
                {spectatingGame.status === 'finished' ? (
                  <p className="text-lg font-semibold">
                    {spectatingGame.winner === 'draw' 
                      ? "It's a Draw!" 
                      : `${spectatingGame.winner === 'X' ? spectatingGame.player_x_name : spectatingGame.player_o_name} Wins!`
                    }
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    {spectatingGame.current_player === 'X' ? spectatingGame.player_x_name : spectatingGame.player_o_name}'s turn
                  </p>
                )}
              </div>

              {/* Board */}
              <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
                {spectatingGame.board.map((cell, index) => {
                  const isWinningCell = winningLine?.includes(index);
                  return (
                    <div
                      key={index}
                      className={`
                        aspect-square flex items-center justify-center
                        text-4xl font-bold rounded-lg border-2
                        ${isWinningCell 
                          ? 'bg-primary/20 border-primary' 
                          : 'bg-muted/50 border-border'
                        }
                        ${cell === 'X' ? 'text-primary' : 'text-secondary-foreground'}
                      `}
                    >
                      {cell}
                    </div>
                  );
                })}
              </div>

              {/* Player indicators */}
              <div className="flex justify-between mt-4 text-sm">
                <div className={`flex items-center gap-2 ${spectatingGame.current_player === 'X' && spectatingGame.status === 'playing' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  <span className="w-6 h-6 flex items-center justify-center bg-primary/20 rounded text-primary font-bold">X</span>
                  {spectatingGame.player_x_name}
                </div>
                <div className={`flex items-center gap-2 ${spectatingGame.current_player === 'O' && spectatingGame.status === 'playing' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {spectatingGame.player_o_name}
                  <span className="w-6 h-6 flex items-center justify-center bg-secondary rounded font-bold">O</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spectator Chat */}
          {playerId && (
            <SpectatorChat
              gameId={spectatingGame.id}
              playerId={playerId}
              playerName={playerName}
            />
          )}
        </div>
      </div>
    );
  }

  // Games list view
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
                <Eye className="w-5 h-5" />
                Watch Live Games
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={fetchActiveGames} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeGames.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active games right now</p>
                <p className="text-sm mt-1">Check back later or start your own game!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {game.player_x_name} vs {game.player_o_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {game.current_player === 'X' ? game.player_x_name : game.player_o_name}'s turn
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => spectateGame(game.id)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Watch
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpectatorMode;
