import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SpectatorMessage {
  id: string;
  game_id: string;
  player_id: string;
  player_name: string;
  message: string;
  created_at: string;
}

export const useSpectatorChat = (gameId: string | null, playerId: string, playerName: string) => {
  const [messages, setMessages] = useState<SpectatorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!gameId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('spectator_chat')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true })
      .limit(100);
    
    if (!error && data) {
      setMessages(data as SpectatorMessage[]);
    }
    setIsLoading(false);
  }, [gameId]);

  // Send message
  const sendMessage = async (message: string) => {
    if (!gameId || !message.trim()) return;

    await supabase.from('spectator_chat').insert({
      game_id: gameId,
      player_id: playerId,
      player_name: playerName,
      message: message.trim()
    });
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!gameId) {
      setMessages([]);
      return;
    }

    fetchMessages();

    const channel = supabase
      .channel(`spectator-chat-${gameId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'spectator_chat',
        filter: `game_id=eq.${gameId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as SpectatorMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchMessages]);

  return { messages, sendMessage, isLoading };
};
