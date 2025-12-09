-- Add rematch field to track rematch requests
ALTER TABLE public.online_games 
ADD COLUMN rematch_requested_by TEXT DEFAULT NULL;