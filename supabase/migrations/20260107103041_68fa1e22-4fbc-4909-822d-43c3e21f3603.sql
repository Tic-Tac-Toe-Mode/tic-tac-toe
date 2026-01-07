-- Create friends table for storing friend relationships
CREATE TABLE public.friends (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  friend_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can read friends" ON public.friends FOR SELECT USING (true);
CREATE POLICY "Anyone can create friends" ON public.friends FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update friends" ON public.friends FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete friends" ON public.friends FOR DELETE USING (true);

-- Create friend challenges table
CREATE TABLE public.friend_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id text NOT NULL,
  challenger_name text NOT NULL,
  challenged_id text NOT NULL,
  challenged_name text NOT NULL,
  game_id uuid REFERENCES public.online_games(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '5 minutes')
);

-- Enable RLS
ALTER TABLE public.friend_challenges ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can read challenges" ON public.friend_challenges FOR SELECT USING (true);
CREATE POLICY "Anyone can create challenges" ON public.friend_challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update challenges" ON public.friend_challenges FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete challenges" ON public.friend_challenges FOR DELETE USING (true);

-- Index for faster lookups
CREATE INDEX idx_friends_user ON public.friends(user_id);
CREATE INDEX idx_friends_friend ON public.friends(friend_id);
CREATE INDEX idx_challenges_challenged ON public.friend_challenges(challenged_id, status);
CREATE INDEX idx_challenges_challenger ON public.friend_challenges(challenger_id, status);

-- Enable realtime for challenges
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_challenges;