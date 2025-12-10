-- Create chat messages table for online games
CREATE TABLE public.game_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.online_games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read messages for games they can see
CREATE POLICY "Anyone can read chat messages"
ON public.game_chat_messages
FOR SELECT
USING (true);

-- Anyone can send messages
CREATE POLICY "Anyone can send chat messages"
ON public.game_chat_messages
FOR INSERT
WITH CHECK (true);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_chat_messages;

-- Index for fast message retrieval by game
CREATE INDEX idx_game_chat_messages_game_id ON public.game_chat_messages(game_id, created_at);