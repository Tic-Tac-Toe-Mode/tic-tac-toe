-- Create player rankings table for ELO system
CREATE TABLE public.player_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL UNIQUE,
  player_name TEXT NOT NULL,
  elo_rating INTEGER NOT NULL DEFAULT 1000,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  highest_elo INTEGER NOT NULL DEFAULT 1000,
  win_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.player_rankings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rankings
CREATE POLICY "Anyone can read rankings"
ON public.player_rankings
FOR SELECT
USING (true);

-- Allow anyone to create their own ranking
CREATE POLICY "Anyone can create ranking"
ON public.player_rankings
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update rankings
CREATE POLICY "Anyone can update rankings"
ON public.player_rankings
FOR UPDATE
USING (true);

-- Enable realtime for rankings
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_rankings;

-- Add trigger for updated_at
CREATE TRIGGER update_player_rankings_updated_at
BEFORE UPDATE ON public.player_rankings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create index for faster leaderboard queries
CREATE INDEX idx_player_rankings_elo ON public.player_rankings(elo_rating DESC);