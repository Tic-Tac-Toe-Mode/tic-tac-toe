-- Create online games table for matchmaking and game state
CREATE TABLE public.online_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_x_id TEXT NOT NULL,
  player_x_name TEXT NOT NULL,
  player_o_id TEXT,
  player_o_name TEXT,
  board TEXT[] DEFAULT ARRAY[NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL]::TEXT[],
  current_player TEXT DEFAULT 'X',
  winner TEXT,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.online_games ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read games (for matchmaking)
CREATE POLICY "Anyone can read games"
ON public.online_games
FOR SELECT
USING (true);

-- Allow anyone to create games
CREATE POLICY "Anyone can create games"
ON public.online_games
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update games
CREATE POLICY "Anyone can update games"
ON public.online_games
FOR UPDATE
USING (true);

-- Allow anyone to delete games
CREATE POLICY "Anyone can delete games"
ON public.online_games
FOR DELETE
USING (true);

-- Enable realtime for online_games table
ALTER PUBLICATION supabase_realtime ADD TABLE public.online_games;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_online_games_updated_at
BEFORE UPDATE ON public.online_games
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();