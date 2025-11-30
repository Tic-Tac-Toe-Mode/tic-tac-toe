import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, RotateCcw, User, Users, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

type Player = "X" | "O" | null;
type Winner = Player | "draw";
type Board = Player[];
type GameMode = "2player" | "ai";

interface PlayerNames {
  X: string;
  O: string;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
];

const Index = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [winner, setWinner] = useState<Winner>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [playerNames, setPlayerNames] = useState<PlayerNames>({ X: "Player 1", O: "Player 2" });
  const [showNameInput, setShowNameInput] = useState(false);
  const [tempNames, setTempNames] = useState({ X: "", O: "" });

  useEffect(() => {
    const savedScores = localStorage.getItem("tictactoe-scores");
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  useEffect(() => {
    if (gameMode === "ai" && !isXTurn && !winner && !board.every(cell => cell !== null)) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        makeAiMove();
        setIsAiThinking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isXTurn, gameMode, winner, board]);

  const checkWinner = (currentBoard: Board): { winner: Player; line: number[] } => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combination };
      }
    }
    return { winner: null, line: [] };
  };

  const minimax = (board: Board, depth: number, isMaximizing: boolean): number => {
    const { winner } = checkWinner(board);
    
    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
    if (board.every(cell => cell !== null)) return 0;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = "O";
          const score = minimax(board, depth + 1, false);
          board[i] = null;
          maxScore = Math.max(score, maxScore);
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = "X";
          const score = minimax(board, depth + 1, true);
          board[i] = null;
          minScore = Math.min(score, minScore);
        }
      }
      return minScore;
    }
  };

  const makeAiMove = () => {
    let bestScore = -Infinity;
    let bestMove = -1;
    const newBoard = [...board];

    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === null) {
        newBoard[i] = "O";
        const score = minimax(newBoard, 0, false);
        newBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    if (bestMove !== -1) {
      handleCellClick(bestMove);
    }
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isAiThinking) return;

    const newBoard = [...board];
    newBoard[index] = isXTurn ? "X" : "O";
    setBoard(newBoard);

    const { winner: gameWinner, line } = checkWinner(newBoard);
    
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: gameWinner === "X" ? ["#06b6d4", "#0ea5e9"] : ["#a855f7", "#c084fc"],
      });

      const newScores = { ...scores, [gameWinner]: scores[gameWinner] + 1 };
      setScores(newScores);
      localStorage.setItem("tictactoe-scores", JSON.stringify(newScores));
      
      const winnerName = gameMode === "2player" ? playerNames[gameWinner] : gameWinner;
      toast.success(`${winnerName} Wins! 🎉`);
    } else if (newBoard.every(cell => cell !== null)) {
      setWinner("draw");
      const newScores = { ...scores, draws: scores.draws + 1 };
      setScores(newScores);
      localStorage.setItem("tictactoe-scores", JSON.stringify(newScores));
      toast.info("It's a Draw!");
    }

    setIsXTurn(!isXTurn);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
    setWinner(null);
    setWinningLine([]);
    setIsAiThinking(false);
  };

  const selectMode = (mode: GameMode) => {
    if (mode === "2player") {
      setShowNameInput(true);
      setTempNames({ X: "", O: "" });
    } else {
      setGameMode(mode);
      resetGame();
    }
  };

  const confirmNames = () => {
    setPlayerNames({
      X: tempNames.X.trim() || "Player 1",
      O: tempNames.O.trim() || "Player 2"
    });
    setGameMode("2player");
    setShowNameInput(false);
    resetGame();
  };

  if (showNameInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Enter Player Names</h2>
            <p className="text-muted-foreground">Customize your game experience</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Player X Name</label>
              <input
                type="text"
                value={tempNames.X}
                onChange={(e) => setTempNames({ ...tempNames, X: e.target.value })}
                placeholder="Enter name for X"
                className="w-full px-4 py-2 rounded-lg border-2 border-primary/20 focus:border-primary outline-none bg-background"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Player O Name</label>
              <input
                type="text"
                value={tempNames.O}
                onChange={(e) => setTempNames({ ...tempNames, O: e.target.value })}
                placeholder="Enter name for O"
                className="w-full px-4 py-2 rounded-lg border-2 border-accent/20 focus:border-accent outline-none bg-background"
                maxLength={20}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={confirmNames}
              size="lg"
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90"
            >
              Start Game
            </Button>
            <Button
              onClick={() => setShowNameInput(false)}
              variant="outline"
              size="lg"
              className="w-full h-12"
            >
              Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!gameMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4">
              <Gamepad2 className="w-12 h-12 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Tic-Tac-Toe
            </h1>
            <p className="text-muted-foreground">Choose your game mode</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => selectMode("2player")}
              size="lg"
              className="w-full h-16 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow)] transition-all"
            >
              <Users className="mr-2 h-5 w-5" />
              2 Players
            </Button>
            
            <Button
              onClick={() => selectMode("ai")}
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg border-2 hover:border-accent hover:bg-accent/10"
            >
              <User className="mr-2 h-5 w-5" />
              vs AI (Unbeatable)
            </Button>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-semibold">Scores</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center p-2 bg-primary/10 rounded-lg">
                <div className="text-xl font-bold text-primary">{scores.X}</div>
                <div className="text-xs text-muted-foreground">X Wins</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-xl font-bold">{scores.draws}</div>
                <div className="text-xs text-muted-foreground">Draws</div>
              </div>
              <div className="text-center p-2 bg-accent/10 rounded-lg">
                <div className="text-xl font-bold text-accent">{scores.O}</div>
                <div className="text-xs text-muted-foreground">O Wins</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <Button
              onClick={() => window.open("https://otieu.com/4/7658671", "_blank")}
              variant="outline"
              className="w-full"
            >
              Support Us 💝
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Developer: Alameen Koko
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGameMode(null)}
              className="gap-2"
            >
              <Gamepad2 className="h-4 w-4" />
              Menu
            </Button>
            
            <div className="text-center">
              {winner ? (
                <div className="animate-fade-in">
                  {winner === "draw" ? (
                    <p className="text-lg font-semibold text-muted-foreground">Draw!</p>
                  ) : (
                    <p className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {winner} Wins! 🎉
                    </p>
                  )}
                </div>
              ) : gameMode === "2player" ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      isXTurn ? "bg-primary text-primary-foreground animate-pulse-glow" : "bg-muted text-muted-foreground"
                    }`}>
                      {playerNames.X}
                    </div>
                    <span className="text-muted-foreground">vs</span>
                    <div className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      !isXTurn ? "bg-accent text-accent-foreground animate-pulse-glow" : "bg-muted text-muted-foreground"
                    }`}>
                      {playerNames.O}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isXTurn ? `${playerNames.X}'s turn` : `${playerNames.O}'s turn`}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all ${
                    isXTurn ? "bg-primary text-primary-foreground animate-pulse-glow" : "bg-muted text-muted-foreground"
                  }`}>
                    X
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all ${
                    !isXTurn ? "bg-accent text-accent-foreground animate-pulse-glow" : "bg-muted text-muted-foreground"
                  }`}>
                    O
                  </div>
                </div>
              )}
              {isAiThinking && (
                <p className="text-xs text-muted-foreground mt-1 animate-pulse">AI thinking...</p>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={resetGame}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || winner !== null || isAiThinking}
                className={`game-cell aspect-square text-5xl font-bold ${
                  cell === "X" ? "x" : cell === "O" ? "o" : ""
                } ${winningLine.includes(index) ? "winner" : ""} ${
                  cell ? "animate-pop-in" : ""
                }`}
              >
                {cell}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-primary/10 rounded-lg">
              <div className="text-lg font-bold text-primary">{scores.X}</div>
              <div className="text-xs text-muted-foreground">X</div>
            </div>
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="text-lg font-bold">{scores.draws}</div>
              <div className="text-xs text-muted-foreground">Draws</div>
            </div>
            <div className="text-center p-2 bg-accent/10 rounded-lg">
              <div className="text-lg font-bold text-accent">{scores.O}</div>
              <div className="text-xs text-muted-foreground">O</div>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <Button
            onClick={() => window.open("https://otieu.com/4/7658671", "_blank")}
            variant="outline"
            className="w-full"
          >
            Support Us 💝
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {gameMode === "ai" ? "Playing against unbeatable AI" : "Local 2-player mode"}
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Developer: Alameen Koko
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
