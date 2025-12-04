import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award, X, Trash2 } from "lucide-react";

export interface LeaderboardEntry {
  name: string;
  wins: number;
  points: number;
  gamesPlayed: number;
  lastPlayed: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onClose: () => void;
  onClear: () => void;
}

export const Leaderboard = ({ entries, onClose, onClear }: LeaderboardProps) => {
  const sortedEntries = [...entries].sort((a, b) => b.points - a.points).slice(0, 10);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-400/10 border-gray-400/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-600/10 border-amber-600/30";
      default:
        return "bg-muted/50";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Leaderboard
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {sortedEntries.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No players yet!</p>
            <p className="text-sm text-muted-foreground mt-1">Play some games to appear here</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {sortedEntries.map((entry, index) => (
              <div
                key={entry.name}
                className={`flex items-center gap-3 p-3 rounded-lg border ${getRankBackground(index + 1)} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.wins} wins • {entry.gamesPlayed} games
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{entry.points}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t space-y-2">
          <div className="text-xs text-muted-foreground text-center">
            Win: +10 pts • Draw: +5 pts
          </div>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
          {sortedEntries.length > 0 && (
            <Button onClick={onClear} variant="destructive" size="sm" className="w-full gap-2">
              <Trash2 className="h-4 w-4" />
              Clear Leaderboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
