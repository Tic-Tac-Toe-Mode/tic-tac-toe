-- Add read_at column for read receipts
ALTER TABLE public.game_chat_messages 
ADD COLUMN read_at timestamp with time zone DEFAULT NULL;

-- Add index for faster queries on active games for spectator mode
CREATE INDEX idx_online_games_status ON public.online_games(status);