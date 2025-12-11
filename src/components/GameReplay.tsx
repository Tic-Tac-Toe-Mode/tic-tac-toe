import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { 
  Play, Pause, SkipBack, SkipForward, 
  ChevronLeft, ChevronRight, X, Film, Trophy, Minus
} from "lucide-react";
import { useGameReplay, ReplayGame } from '@/hooks/useGameReplay';

interface GameReplayProps {
  onClose: () => void;
}

export const GameReplay = ({ onClose }: GameReplayProps) => {
  const {
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
  } = useGameReplay();

  useEffect(() => {
    fetchReplayableGames();
  }, [fetchReplayableGames]);

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || !currentReplay) return;
    
    if (currentMoveIndex >= currentReplay.move_history.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      nextMove();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentMoveIndex, currentReplay, nextMove, setIsPlaying]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getResultText = (game: ReplayGame) => {
    if (game.winner === 'draw') return 'Draw';
    const winnerName = game.winner === 'X' ? game.player_x_name : game.player_o_name;
    return `${winnerName} won`;
  };

  // Game list view
  if (!currentReplay) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Film className="h-6 w-6 text-primary" />
              Game Replays
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p>Loading replays...</p>
            </div>
          ) : replayGames.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Film className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No replays available</p>
              <p className="text-sm">Play online games to create replays</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {replayGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => startReplay(game)}
                    className="w-full p-3 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted/80 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {game.winner === 'draw' ? (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="font-semibold text-sm">
                          {getResultText(game)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(game.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          game.winner === 'X' 
                            ? "bg-primary/20 text-primary" 
                            : "bg-muted"
                        }`}>
                          {game.player_x_name}
                        </span>
                        <span className="text-muted-foreground">vs</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          game.winner === 'O' 
                            ? "bg-accent/20 text-accent" 
                            : "bg-muted"
                        }`}>
                          {game.player_o_name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {game.move_history.length} moves
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          <Button onClick={onClose} className="w-full mt-4">
            Close
          </Button>
        </Card>
      </div>
    );
  }

  // Replay player view
  const board = getBoardAtMove(currentMoveIndex);
  const totalMoves = currentReplay.move_history.length;
  const currentMove = currentMoveIndex >= 0 ? currentReplay.move_history[currentMoveIndex] : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            Replay
          </h2>
          <Button variant="ghost" size="icon" onClick={stopReplay}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Player names */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <div className={`px-3 py-1 rounded ${currentMove?.player === 'X' ? 'bg-primary/20 text-primary font-bold' : 'bg-muted'}`}>
            X: {currentReplay.player_x_name}
          </div>
          <div className={`px-3 py-1 rounded ${currentMove?.player === 'O' ? 'bg-accent/20 text-accent font-bold' : 'bg-muted'}`}>
            O: {currentReplay.player_o_name}
          </div>
        </div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {board.map((cell, index) => (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center text-4xl font-bold rounded-lg border-2 transition-all ${
                currentMove?.position === index
                  ? 'border-primary bg-primary/10 scale-105'
                  : 'border-border bg-muted/30'
              } ${
                cell === 'X' ? 'text-primary' : cell === 'O' ? 'text-accent' : ''
              }`}
            >
              {cell}
            </div>
          ))}
        </div>

        {/* Move indicator */}
        <div className="text-center mb-4 text-sm text-muted-foreground">
          Move {currentMoveIndex + 1} of {totalMoves}
          {currentMove && (
            <span className="ml-2">
              ({currentMove.player} → position {currentMove.position + 1})
            </span>
          )}
        </div>

        {/* Timeline slider */}
        <div className="mb-4 px-2">
          <Slider
            value={[currentMoveIndex + 1]}
            min={0}
            max={totalMoves}
            step={1}
            onValueChange={([value]) => goToMove(value - 1)}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Button variant="outline" size="icon" onClick={goToStart}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={previousMove}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="default" size="icon" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={nextMove}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToEnd}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Result */}
        {currentMoveIndex === totalMoves - 1 && (
          <div className="text-center p-3 bg-muted/50 rounded-lg mb-4">
            <div className="flex items-center justify-center gap-2">
              {currentReplay.winner === 'draw' ? (
                <Minus className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Trophy className="h-5 w-5 text-yellow-500" />
              )}
              <span className="font-bold">{getResultText(currentReplay)}</span>
            </div>
          </div>
        )}

        <Button variant="secondary" onClick={stopReplay} className="w-full">
          Back to List
        </Button>
      </Card>
    </div>
  );
};
