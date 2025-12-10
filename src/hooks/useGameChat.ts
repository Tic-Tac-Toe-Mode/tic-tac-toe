import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  game_id: string;
  player_id: string;
  player_name: string;
  message: string;
  created_at: string;
}

export const useGameChat = (gameId: string | null, playerId: string, playerName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing messages
  const fetchMessages = useCallback(async () => {
    if (!gameId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('game_chat_messages')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setMessages(data);
    }
    setIsLoading(false);
  }, [gameId]);

  // Send a message
  const sendMessage = async (message: string) => {
    if (!gameId || !message.trim()) return;

    const { error } = await supabase
      .from('game_chat_messages')
      .insert({
        game_id: gameId,
        player_id: playerId,
        player_name: playerName,
        message: message.trim()
      });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!gameId) return;

    fetchMessages();

    const channel = supabase
      .channel(`chat-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_chat_messages',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchMessages]);

  // Clear messages when game changes
  useEffect(() => {
    if (!gameId) {
      setMessages([]);
    }
  }, [gameId]);

  return {
    messages,
    sendMessage,
    isLoading
  };
};
