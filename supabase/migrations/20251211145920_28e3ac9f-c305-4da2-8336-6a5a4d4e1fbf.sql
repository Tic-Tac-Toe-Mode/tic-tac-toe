-- Tournament table
CREATE TABLE public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by text NOT NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'finished')),
  max_players integer DEFAULT 8 CHECK (max_players IN (4, 8)),
  current_round integer DEFAULT 0,
  winner_id text,
  winner_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tournament participants
CREATE TABLE public.tournament_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  player_id text NOT NULL,
  player_name text NOT NULL,
  seed integer,
  eliminated boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(tournament_id, player_id)
);

-- Tournament matches
CREATE TABLE public.tournament_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  round integer NOT NULL,
  match_number integer NOT NULL,
  player1_id text,
  player1_name text,
  player2_id text,
  player2_name text,
  winner_id text,
  game_id uuid REFERENCES public.online_games(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'playing', 'finished')),
  created_at timestamp with time zone DEFAULT now()
);

-- Spectator chat messages
CREATE TABLE public.spectator_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL,
  player_id text NOT NULL,
  player_name text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spectator_chat ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournaments
CREATE POLICY "Anyone can read tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Anyone can create tournaments" ON public.tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tournaments" ON public.tournaments FOR UPDATE USING (true);

-- RLS Policies for participants
CREATE POLICY "Anyone can read participants" ON public.tournament_participants FOR SELECT USING (true);
CREATE POLICY "Anyone can join tournaments" ON public.tournament_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update participants" ON public.tournament_participants FOR UPDATE USING (true);
CREATE POLICY "Anyone can leave tournaments" ON public.tournament_participants FOR DELETE USING (true);

-- RLS Policies for matches
CREATE POLICY "Anyone can read matches" ON public.tournament_matches FOR SELECT USING (true);
CREATE POLICY "Anyone can create matches" ON public.tournament_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update matches" ON public.tournament_matches FOR UPDATE USING (true);

-- RLS Policies for spectator chat
CREATE POLICY "Anyone can read spectator chat" ON public.spectator_chat FOR SELECT USING (true);
CREATE POLICY "Anyone can send spectator messages" ON public.spectator_chat FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournament_participants_tournament ON public.tournament_participants(tournament_id);
CREATE INDEX idx_tournament_matches_tournament ON public.tournament_matches(tournament_id);
CREATE INDEX idx_spectator_chat_game ON public.spectator_chat(game_id);