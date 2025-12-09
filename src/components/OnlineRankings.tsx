import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, X, Medal, TrendingUp, Crown, Target, Flame } from 'lucide-react';
import { PlayerRanking } from '@/hooks/usePlayerRanking';

interface OnlineRankingsProps {
  rankings: PlayerRanking[];
  myPlayerId: string;
  onClose: () => void;
}

const getRankBadge = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
};

const getEloTier = (elo: number): { name: string; color: string } => {
  if (elo >= 1800) return { name: 'Grandmaster', color: 'text-purple-500' };
  if (elo >= 1600) return { name: 'Master', color: 'text-yellow-500' };
  if (elo >= 1400) return { name: 'Diamond', color: 'text-cyan-400' };
  if (elo >= 1200) return { name: 'Platinum', color: 'text-blue-400' };
  if (elo >= 1000) return { name: 'Gold', color: 'text-yellow-600' };
  if (elo >= 800) return { name: 'Silver', color: 'text-gray-400' };
  return { name: 'Bronze', color: 'text-amber-700' };
};

export const OnlineRankings = ({ rankings, myPlayerId, onClose }: OnlineRankingsProps) => {
  const myRank = rankings.findIndex(r => r.player_id === myPlayerId) + 1;
  const myRanking = rankings.find(r => r.player_id === myPlayerId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            ELO Rankings
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* My Stats Card */}
        {myRanking && (
          <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Your Rank</span>
                {getRankBadge(myRank)}
              </div>
              <div className={`text-sm font-medium ${getEloTier(myRanking.elo_rating).color}`}>
                {getEloTier(myRanking.elo_rating).name}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-primary">{myRanking.elo_rating}</div>
                <div className="text-xs text-muted-foreground">ELO Rating</div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-500">{myRanking.wins}</div>
                  <div className="text-xs text-muted-foreground">Wins</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-muted-foreground">{myRanking.draws}</div>
                  <div className="text-xs text-muted-foreground">Draws</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-500">{myRanking.losses}</div>
                  <div className="text-xs text-muted-foreground">Losses</div>
                </div>
              </div>
            </div>
            {myRanking.win_streak > 0 && (
              <div className="mt-2 flex items-center gap-1 text-sm text-orange-500">
                <Flame className="h-4 w-4" />
                {myRanking.win_streak} game win streak!
              </div>
            )}
          </div>
        )}

        {/* Leaderboard */}
        {rankings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No rankings yet</p>
            <p className="text-sm">Play online games to get ranked!</p>
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-2">
              {rankings.map((ranking, index) => {
                const isMe = ranking.player_id === myPlayerId;
                const tier = getEloTier(ranking.elo_rating);
                const winRate = ranking.games_played > 0 
                  ? Math.round((ranking.wins / ranking.games_played) * 100)
                  : 0;

                return (
                  <div
                    key={ranking.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      isMe 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-muted/50 border-border/50 hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">
                        {getRankBadge(index + 1)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold truncate ${isMe ? 'text-primary' : ''}`}>
                            {ranking.player_name}
                            {isMe && <span className="text-xs ml-1">(You)</span>}
                          </span>
                          {ranking.win_streak >= 3 && (
                            <Flame className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className={tier.color}>{tier.name}</span>
                          <span>•</span>
                          <span>{ranking.games_played} games</span>
                          <span>•</span>
                          <span>{winRate}% WR</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold">{ranking.elo_rating}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <TrendingUp className="h-3 w-3" />
                          {ranking.highest_elo}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <Button onClick={onClose} className="w-full mt-4">
          Close
        </Button>
      </Card>
    </div>
  );
};
