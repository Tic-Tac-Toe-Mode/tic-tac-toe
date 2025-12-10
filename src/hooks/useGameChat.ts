import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [opponentTyping, setOpponentTyping] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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

  // Broadcast typing status
  const setTyping = useCallback((isTyping: boolean) => {
    if (!presenceChannelRef.current) return;
    
    presenceChannelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { playerId, playerName, isTyping }
    });
  }, [playerId, playerName]);

  // Subscribe to messages and typing presence
  useEffect(() => {
    if (!gameId) return;

    fetchMessages();

    // Messages channel
    const messagesChannel = supabase
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

    // Presence channel for typing indicator
    const presenceChannel = supabase
      .channel(`typing-${gameId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.playerId !== playerId) {
          if (payload.isTyping) {
            setOpponentTyping(payload.playerName);
            // Clear typing after 3 seconds of no updates
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
              setOpponentTyping(null);
            }, 3000);
          } else {
            setOpponentTyping(null);
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
          }
        }
      })
      .subscribe();

    presenceChannelRef.current = presenceChannel;

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [gameId, fetchMessages, playerId]);

  // Clear messages when game changes
  useEffect(() => {
    if (!gameId) {
      setMessages([]);
      setOpponentTyping(null);
    }
  }, [gameId]);

  return {
    messages,
    sendMessage,
    isLoading,
    opponentTyping,
    setTyping
  };
};
