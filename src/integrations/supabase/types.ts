export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      friend_challenges: {
        Row: {
          challenged_id: string
          challenged_name: string
          challenger_id: string
          challenger_name: string
          created_at: string | null
          expires_at: string | null
          game_id: string | null
          id: string
          status: string
        }
        Insert: {
          challenged_id: string
          challenged_name: string
          challenger_id: string
          challenger_name: string
          created_at?: string | null
          expires_at?: string | null
          game_id?: string | null
          id?: string
          status?: string
        }
        Update: {
          challenged_id?: string
          challenged_name?: string
          challenger_id?: string
          challenger_name?: string
          created_at?: string | null
          expires_at?: string | null
          game_id?: string | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_challenges_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "online_games"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      game_chat_messages: {
        Row: {
          created_at: string
          game_id: string
          id: string
          message: string
          player_id: string
          player_name: string
          reactions: Json | null
          read_at: string | null
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          message: string
          player_id: string
          player_name: string
          reactions?: Json | null
          read_at?: string | null
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          message?: string
          player_id?: string
          player_name?: string
          reactions?: Json | null
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_chat_messages_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "online_games"
            referencedColumns: ["id"]
          },
        ]
      }
      online_games: {
        Row: {
          board: string[] | null
          created_at: string | null
          current_player: string | null
          id: string
          move_history: Json | null
          player_o_id: string | null
          player_o_name: string | null
          player_x_id: string
          player_x_name: string
          rematch_requested_by: string | null
          status: string | null
          updated_at: string | null
          winner: string | null
        }
        Insert: {
          board?: string[] | null
          created_at?: string | null
          current_player?: string | null
          id?: string
          move_history?: Json | null
          player_o_id?: string | null
          player_o_name?: string | null
          player_x_id: string
          player_x_name: string
          rematch_requested_by?: string | null
          status?: string | null
          updated_at?: string | null
          winner?: string | null
        }
        Update: {
          board?: string[] | null
          created_at?: string | null
          current_player?: string | null
          id?: string
          move_history?: Json | null
          player_o_id?: string | null
          player_o_name?: string | null
          player_x_id?: string
          player_x_name?: string
          rematch_requested_by?: string | null
          status?: string | null
          updated_at?: string | null
          winner?: string | null
        }
        Relationships: []
      }
      player_rankings: {
        Row: {
          best_streak: number
          created_at: string | null
          draws: number
          elo_rating: number
          games_played: number
          highest_elo: number
          id: string
          losses: number
          player_id: string
          player_name: string
          updated_at: string | null
          win_streak: number
          wins: number
        }
        Insert: {
          best_streak?: number
          created_at?: string | null
          draws?: number
          elo_rating?: number
          games_played?: number
          highest_elo?: number
          id?: string
          losses?: number
          player_id: string
          player_name: string
          updated_at?: string | null
          win_streak?: number
          wins?: number
        }
        Update: {
          best_streak?: number
          created_at?: string | null
          draws?: number
          elo_rating?: number
          games_played?: number
          highest_elo?: number
          id?: string
          losses?: number
          player_id?: string
          player_name?: string
          updated_at?: string | null
          win_streak?: number
          wins?: number
        }
        Relationships: []
      }
      spectator_chat: {
        Row: {
          created_at: string | null
          game_id: string
          id: string
          message: string
          player_id: string
          player_name: string
        }
        Insert: {
          created_at?: string | null
          game_id: string
          id?: string
          message: string
          player_id: string
          player_name: string
        }
        Update: {
          created_at?: string | null
          game_id?: string
          id?: string
          message?: string
          player_id?: string
          player_name?: string
        }
        Relationships: []
      }
      tournament_matches: {
        Row: {
          created_at: string | null
          game_id: string | null
          id: string
          match_number: number
          player1_id: string | null
          player1_name: string | null
          player2_id: string | null
          player2_name: string | null
          round: number
          status: string | null
          tournament_id: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          game_id?: string | null
          id?: string
          match_number: number
          player1_id?: string | null
          player1_name?: string | null
          player2_id?: string | null
          player2_name?: string | null
          round: number
          status?: string | null
          tournament_id: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          game_id?: string | null
          id?: string
          match_number?: number
          player1_id?: string | null
          player1_name?: string | null
          player2_id?: string | null
          player2_name?: string | null
          round?: number
          status?: string | null
          tournament_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "online_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          created_at: string | null
          eliminated: boolean | null
          id: string
          player_id: string
          player_name: string
          seed: number | null
          tournament_id: string
        }
        Insert: {
          created_at?: string | null
          eliminated?: boolean | null
          id?: string
          player_id: string
          player_name: string
          seed?: number | null
          tournament_id: string
        }
        Update: {
          created_at?: string | null
          eliminated?: boolean | null
          id?: string
          player_id?: string
          player_name?: string
          seed?: number | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string | null
          created_by: string
          current_round: number | null
          id: string
          max_players: number | null
          name: string
          participant_elo_bonus: number | null
          runner_up_elo_bonus: number | null
          status: string | null
          updated_at: string | null
          winner_elo_bonus: number | null
          winner_id: string | null
          winner_name: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_round?: number | null
          id?: string
          max_players?: number | null
          name: string
          participant_elo_bonus?: number | null
          runner_up_elo_bonus?: number | null
          status?: string | null
          updated_at?: string | null
          winner_elo_bonus?: number | null
          winner_id?: string | null
          winner_name?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_round?: number | null
          id?: string
          max_players?: number | null
          name?: string
          participant_elo_bonus?: number | null
          runner_up_elo_bonus?: number | null
          status?: string | null
          updated_at?: string | null
          winner_elo_bonus?: number | null
          winner_id?: string | null
          winner_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
