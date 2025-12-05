import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, X, Trash2, Trophy, Minus } from "lucide-react";

export interface GameRecord {
  id: string;
  mode: "2player" | "ai";
  aiDifficulty?: "easy" | "medium" | "hard";
  playerX: string;
  playerO: string;
  winner: "X" | "O" | "draw";
  date: string;
  moves: number;
}

interface GameHistoryProps {
  records: GameRecord[];
  onClose: () => void;
  onClear: () => void;
}

export const GameHistory = ({ records, onClose, onClear }: GameHistoryProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getResultIcon = (winner: string) => {
    if (winner === "draw") {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
    return <Trophy className="h-4 w-4 text-yellow-500" />;
  };

  const getResultText = (record: GameRecord) => {
    if (record.winner === "draw") {
      return "Draw";
    }
    const winnerName = record.winner === "X" ? record.playerX : record.playerO;
    return `${winnerName} won`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Game History
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No games played yet</p>
            <p className="text-sm">Your match history will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {records.slice().reverse().map((record) => (
                <div
                  key={record.id}
                  className="p-3 bg-muted/50 rounded-lg border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getResultIcon(record.winner)}
                      <span className="font-semibold text-sm">
                        {getResultText(record)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(record.date)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        record.winner === "X" 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted"
                      }`}>
                        {record.playerX}
                      </span>
                      <span className="text-muted-foreground">vs</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        record.winner === "O" 
                          ? "bg-accent/20 text-accent" 
                          : "bg-muted"
                      }`}>
                        {record.playerO}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {record.moves} moves
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      record.mode === "ai" 
                        ? "bg-accent/10 text-accent" 
                        : "bg-primary/10 text-primary"
                    }`}>
                      {record.mode === "ai" 
                        ? `vs AI (${record.aiDifficulty})` 
                        : "2 Players"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="mt-4 space-y-2">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
          {records.length > 0 && (
            <Button onClick={onClear} variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
