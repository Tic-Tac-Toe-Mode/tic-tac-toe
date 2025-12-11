-- Add reactions column to game_chat_messages
ALTER TABLE public.game_chat_messages 
ADD COLUMN reactions jsonb DEFAULT '{}';

-- reactions format: { "emoji": ["player_id1", "player_id2"], ... }