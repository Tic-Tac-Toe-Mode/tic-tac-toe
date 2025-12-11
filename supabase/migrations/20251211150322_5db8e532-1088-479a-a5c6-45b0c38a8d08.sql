-- Add move_history column to online_games to track all moves for replay
ALTER TABLE public.online_games 
ADD COLUMN move_history jsonb DEFAULT '[]'::jsonb;

-- Add prize columns to tournaments table
ALTER TABLE public.tournaments 
ADD COLUMN winner_elo_bonus integer DEFAULT 50,
ADD COLUMN runner_up_elo_bonus integer DEFAULT 25,
ADD COLUMN participant_elo_bonus integer DEFAULT 10;

-- Create index for faster game history queries
CREATE INDEX idx_online_games_status_created ON public.online_games(status, created_at DESC);