import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, RotateCcw, User, Users, Trophy, BarChart3, X, Crown, LogOut, History, Palette } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { VolumeControl } from "@/components/VolumeControl";
import { Leaderboard, LeaderboardEntry } from "@/components/Leaderboard";
import { GameHistory, GameRecord } from "@/components/GameHistory";
import { ThemeSwitcher, useThemeInit } from "@/components/ThemeSwitcher";
import logo from "@/assets/logo.jpg";
import { App } from "@capacitor/app";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    // Haptics not available (web/unsupported device)
  }
};

type Player = "X" | "O" | null;
type Winner = Player | "draw";
type Board = Player[];
type GameMode = "2player" | "ai";
type AIDifficulty = "easy" | "medium" | "hard";

interface PlayerNames {
  X: string;
  O: string;
}

interface Statistics {
  totalGames: number;
  xWins: number;
  oWins: number;
  draws: number;
  winStreak: number;
  bestStreak: number;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
];

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [winner, setWinner] = useState<Winner>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>("hard");
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [playerNames, setPlayerNames] = useState<PlayerNames>({ X: "Player 1", O: "Player 2" });
  const [showNameInput, setShowNameInput] = useState(false);
  const [tempNames, setTempNames] = useState({ X: "", O: "" });
  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalGames: 0,
    xWins: 0,
    oWins: 0,
    draws: 0,
    winStreak: 0,
    bestStreak: 0,
  });
  const [sessionPoints, setSessionPoints] = useState({ X: 0, O: 0 });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameRecord[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [showThemes, setShowThemes] = useState(false);
  
  const { volume, setVolume, isMuted, setIsMuted, playMoveSound, playWinSound, playDrawSound } = useSoundEffects();
  
  // Initialize theme on mount
  useThemeInit();

  useEffect(() => {
    const savedScores = localStorage.getItem("tictactoe-scores");
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
    const savedStats = localStorage.getItem("tictactoe-stats");
    if (savedStats) {
      setStatistics(JSON.parse(savedStats));
    }
    const savedLeaderboard = localStorage.getItem("tictactoe-leaderboard");
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard));
    }
    const savedHistory = localStorage.getItem("tictactoe-history");
    if (savedHistory) {
      setGameHistory(JSON.parse(savedHistory));
    }
    
    // Auto-dismiss splash after 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
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

  const getRandomMove = (currentBoard: Board): number => {
    const emptyIndices = currentBoard.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  };

  const getBestMove = (currentBoard: Board): number => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = "O";
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const makeAiMove = () => {
    const newBoard = [...board];
    let move = -1;

    if (aiDifficulty === "easy") {
      move = getRandomMove(newBoard);
    } else if (aiDifficulty === "medium") {
      // 50% chance to play optimally
      move = Math.random() < 0.5 ? getBestMove(newBoard) : getRandomMove(newBoard);
    } else {
      move = getBestMove(newBoard);
    }

    if (move !== -1) {
      handleCellClick(move);
    }
  };

  const updateLeaderboard = (playerName: string, won: boolean) => {
    const existingIndex = leaderboard.findIndex(e => e.name.toLowerCase() === playerName.toLowerCase());
    let newLeaderboard = [...leaderboard];
    
    if (existingIndex >= 0) {
      newLeaderboard[existingIndex] = {
        ...newLeaderboard[existingIndex],
        wins: newLeaderboard[existingIndex].wins + (won ? 1 : 0),
        points: newLeaderboard[existingIndex].points + (won ? 10 : 5),
        gamesPlayed: newLeaderboard[existingIndex].gamesPlayed + 1,
        lastPlayed: new Date().toISOString(),
      };
    } else {
      newLeaderboard.push({
        name: playerName,
        wins: won ? 1 : 0,
        points: won ? 10 : 5,
        gamesPlayed: 1,
        lastPlayed: new Date().toISOString(),
      });
    }
    
    setLeaderboard(newLeaderboard);
    localStorage.setItem("tictactoe-leaderboard", JSON.stringify(newLeaderboard));
  };

  const clearLeaderboard = () => {
    setLeaderboard([]);
    localStorage.removeItem("tictactoe-leaderboard");
    toast.success("Leaderboard cleared!");
  };

  const addGameToHistory = (gameWinner: Winner, totalMoves: number) => {
    if (!gameMode || gameWinner === null) return;
    
    const record: GameRecord = {
      id: Date.now().toString(),
      mode: gameMode,
      aiDifficulty: gameMode === "ai" ? aiDifficulty : undefined,
      playerX: gameMode === "2player" ? playerNames.X : "You",
      playerO: gameMode === "ai" ? `AI (${aiDifficulty})` : playerNames.O,
      winner: gameWinner as "X" | "O" | "draw",
      date: new Date().toISOString(),
      moves: totalMoves,
    };
    
    const newHistory = [...gameHistory, record].slice(-50); // Keep last 50 games
    setGameHistory(newHistory);
    localStorage.setItem("tictactoe-history", JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setGameHistory([]);
    localStorage.removeItem("tictactoe-history");
    toast.success("History cleared!");
  };

  const updateStatistics = (gameWinner: Winner, totalMoves: number) => {
    const newStats = { ...statistics };
    newStats.totalGames += 1;
    
    if (gameWinner === "X") {
      newStats.xWins += 1;
      newStats.winStreak += 1;
      if (newStats.winStreak > newStats.bestStreak) {
        newStats.bestStreak = newStats.winStreak;
      }
      setSessionPoints(prev => ({ ...prev, X: prev.X + 10 }));
      if (gameMode === "2player") {
        updateLeaderboard(playerNames.X, true);
        updateLeaderboard(playerNames.O, false);
      }
    } else if (gameWinner === "O") {
      newStats.oWins += 1;
      newStats.winStreak = 0;
      setSessionPoints(prev => ({ ...prev, O: prev.O + 10 }));
      if (gameMode === "2player") {
        updateLeaderboard(playerNames.O, true);
        updateLeaderboard(playerNames.X, false);
      }
    } else {
      newStats.draws += 1;
      newStats.winStreak = 0;
      setSessionPoints(prev => ({ X: prev.X + 5, O: prev.O + 5 }));
      if (gameMode === "2player") {
        updateLeaderboard(playerNames.X, false);
        updateLeaderboard(playerNames.O, false);
      }
    }
    
    setStatistics(newStats);
    localStorage.setItem("tictactoe-stats", JSON.stringify(newStats));
    addGameToHistory(gameWinner, totalMoves);
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isAiThinking) return;

    const currentPlayer = isXTurn ? "X" : "O";
    playMoveSound(isXTurn);
    triggerHaptic("move");
    
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    const newMoveCount = moveCount + 1;
    setMoveCount(newMoveCount);

    const { winner: gameWinner, line } = checkWinner(newBoard);
    
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
      playWinSound();
      triggerHaptic("win");
      updateStatistics(gameWinner, newMoveCount);
      
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
      toast.success(`${winnerName} Wins! +10 points 🎉`);
    } else if (newBoard.every(cell => cell !== null)) {
      setWinner("draw");
      playDrawSound();
      triggerHaptic("draw");
      updateStatistics("draw", newMoveCount);
      const newScores = { ...scores, draws: scores.draws + 1 };
      setScores(newScores);
      localStorage.setItem("tictactoe-scores", JSON.stringify(newScores));
      toast.info("It's a Draw! +5 points each");
    }

    setIsXTurn(!isXTurn);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
    setWinner(null);
    setWinningLine([]);
    setIsAiThinking(false);
    setMoveCount(0);
  };

  const selectMode = (mode: GameMode) => {
    if (mode === "2player") {
      setShowNameInput(true);
      setTempNames({ X: "", O: "" });
    } else {
      setShowDifficultySelect(true);
    }
  };

  const selectDifficulty = (difficulty: AIDifficulty) => {
    setAiDifficulty(difficulty);
    setShowDifficultySelect(false);
    setGameMode("ai");
    setSessionPoints({ X: 0, O: 0 });
    resetGame();
  };

  const confirmNames = () => {
    setPlayerNames({
      X: tempNames.X.trim() || "Player 1",
      O: tempNames.O.trim() || "Player 2"
    });
    setGameMode("2player");
    setShowNameInput(false);
    setSessionPoints({ X: 0, O: 0 });
    resetGame();
  };

  const resetStatistics = () => {
    const emptyStats = {
      totalGames: 0,
      xWins: 0,
      oWins: 0,
      draws: 0,
      winStreak: 0,
      bestStreak: 0,
    };
    setStatistics(emptyStats);
    setScores({ X: 0, O: 0, draws: 0 });
    localStorage.setItem("tictactoe-stats", JSON.stringify(emptyStats));
    localStorage.setItem("tictactoe-scores", JSON.stringify({ X: 0, O: 0, draws: 0 }));
    toast.success("Statistics reset!");
  };

  // Splash Screen
  if (showSplash) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ background: "linear-gradient(180deg, #f0a6ca 0%, #c8b6ff 50%, #b8c0ff 100%)" }}
      >
        <div className="animate-fade-in flex flex-col items-center">
          <img 
            src={logo} 
            alt="Tic-Tac-Toe" 
            className="w-64 h-64 object-contain rounded-2xl shadow-2xl animate-pop-in"
          />
          <h1 className="mt-6 text-3xl font-bold text-white drop-shadow-lg">Tic-Tac-Toe</h1>
          <p className="mt-2 text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  // Leaderboard
  if (showLeaderboard) {
    return (
      <Leaderboard 
        entries={leaderboard} 
        onClose={() => setShowLeaderboard(false)} 
        onClear={clearLeaderboard}
      />
    );
  }

  // Game History
  if (showHistory) {
    return (
      <GameHistory 
        records={gameHistory} 
        onClose={() => setShowHistory(false)} 
        onClear={clearHistory}
      />
    );
  }

  // Theme Switcher
  if (showThemes) {
    return (
      <ThemeSwitcher 
        isOpen={showThemes} 
        onClose={() => setShowThemes(false)} 
      />
    );
  }

  // Statistics Modal
  if (showStats) {
    const winRate = statistics.totalGames > 0 
      ? Math.round((statistics.xWins / statistics.totalGames) * 100) 
      : 0;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Statistics
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setShowStats(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">{statistics.totalGames}</div>
              <div className="text-sm text-muted-foreground">Total Games</div>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg text-center">
              <div className="text-3xl font-bold text-accent">{winRate}%</div>
              <div className="text-sm text-muted-foreground">X Win Rate</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-primary/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">{statistics.xWins}</div>
              <div className="text-xs text-muted-foreground">X Wins</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold">{statistics.draws}</div>
              <div className="text-xs text-muted-foreground">Draws</div>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-accent">{statistics.oWins}</div>
              <div className="text-xs text-muted-foreground">O Wins</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-xl font-bold">{statistics.winStreak}</div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
            </div>
            <div className="p-3 bg-primary/20 rounded-lg text-center">
              <div className="text-xl font-bold text-primary">{statistics.bestStreak}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button onClick={() => setShowStats(false)} className="w-full">
              Close
            </Button>
            <Button onClick={resetStatistics} variant="destructive" className="w-full">
              Reset All Statistics
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showDifficultySelect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <User className="h-12 w-12 mx-auto text-accent" />
            <h2 className="text-2xl font-bold">Select AI Difficulty</h2>
            <p className="text-muted-foreground">Choose your challenge level</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => selectDifficulty("easy")}
              size="lg"
              variant="outline"
              className="w-full h-14 text-lg border-2 border-green-500/30 hover:border-green-500 hover:bg-green-500/10"
            >
              🌱 Easy
              <span className="ml-2 text-xs text-muted-foreground">(Random moves)</span>
            </Button>
            
            <Button
              onClick={() => selectDifficulty("medium")}
              size="lg"
              variant="outline"
              className="w-full h-14 text-lg border-2 border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10"
            >
              ⚡ Medium
              <span className="ml-2 text-xs text-muted-foreground">(50% smart)</span>
            </Button>
            
            <Button
              onClick={() => selectDifficulty("hard")}
              size="lg"
              variant="outline"
              className="w-full h-14 text-lg border-2 border-red-500/30 hover:border-red-500 hover:bg-red-500/10"
            >
              🔥 Hard
              <span className="ml-2 text-xs text-muted-foreground">(Unbeatable)</span>
            </Button>
          </div>

          <Button
            onClick={() => setShowDifficultySelect(false)}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            Back
          </Button>
        </Card>
      </div>
    );
  }

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
          {/* Exit Button - Inside Card */}
          <div className="flex justify-end -mt-2 -mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExitConfirm(true)}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 hover:border-destructive/40 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Exit
            </Button>
          </div>

          <div className="text-center space-y-2 -mt-2">
            <img src={logo} alt="Tic-Tac-Toe" className="w-24 h-24 mx-auto rounded-xl shadow-lg" />
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
                vs AI
              </Button>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Scores</span>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowLeaderboard(true)}
                    className="gap-1"
                  >
                    <Crown className="h-4 w-4 text-yellow-500" />
                    Top
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowStats(true)}
                    className="gap-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Stats
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowHistory(true)}
                    className="gap-1"
                  >
                    <History className="h-4 w-4" />
                    History
                  </Button>
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
              <div className="flex items-center justify-center gap-4">
                <VolumeControl volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowThemes(true)}
                  className="gap-1"
                >
                  <Palette className="h-4 w-4" />
                  Theme
                </Button>
              </div>
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

        <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Exit Game?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to exit the game? Your current session progress will be saved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => App.exitApp()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Exit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
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

          {/* Session Points */}
          <div className="flex justify-center gap-4 mb-4 p-2 bg-muted/50 rounded-lg">
            <div className="text-center">
              <span className="text-xs text-muted-foreground">X Points</span>
              <div className="text-lg font-bold text-primary">{sessionPoints.X}</div>
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground">O Points</span>
              <div className="text-lg font-bold text-accent">{sessionPoints.O}</div>
            </div>
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
              <div className="text-xs text-muted-foreground">X Wins</div>
            </div>
            <div className="text-center p-2 bg-muted rounded-lg">
              <div className="text-lg font-bold">{scores.draws}</div>
              <div className="text-xs text-muted-foreground">Draws</div>
            </div>
            <div className="text-center p-2 bg-accent/10 rounded-lg">
              <div className="text-lg font-bold text-accent">{scores.O}</div>
              <div className="text-xs text-muted-foreground">O Wins</div>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <VolumeControl volume={volume} setVolume={setVolume} isMuted={isMuted} setIsMuted={setIsMuted} />
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setShowThemes(true)}>
                <Palette className="h-4 w-4 mr-1" />
                Theme
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowLeaderboard(true)}>
                <Crown className="h-4 w-4 mr-1 text-yellow-500" />
                Top
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowStats(true)}>
                <BarChart3 className="h-4 w-4 mr-1" />
                Stats
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)}>
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
            </div>
          </div>
          <Button
            onClick={() => window.open("https://otieu.com/4/7658671", "_blank")}
            variant="outline"
            className="w-full"
          >
            Support Us 💝
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {gameMode === "ai" ? `Playing vs AI (${aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)})` : "Local 2-player mode"}
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
