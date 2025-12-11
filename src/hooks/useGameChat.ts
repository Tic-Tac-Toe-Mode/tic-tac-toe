import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  game_id: string;
  player_id: string;
  player_name: string;
  message: string;
  created_at: string;
  reactions: Record<string, string[]>;
  read_at: string | null;
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
      setMessages(data.map(msg => ({
        ...msg,
        reactions: (msg.reactions as Record<string, string[]>) || {}
      })));
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
        message: message.trim(),
        reactions: {}
      });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  // Add or remove a reaction
  const toggleReaction = async (messageId: string, emoji: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const currentReactions = { ...message.reactions };
    const emojiReactions = currentReactions[emoji] || [];
    
    if (emojiReactions.includes(playerId)) {
      // Remove reaction
      currentReactions[emoji] = emojiReactions.filter(id => id !== playerId);
      if (currentReactions[emoji].length === 0) {
        delete currentReactions[emoji];
      }
    } else {
      // Add reaction
      currentReactions[emoji] = [...emojiReactions, playerId];
    }

    const { error } = await supabase
      .from('game_chat_messages')
      .update({ reactions: currentReactions })
      .eq('id', messageId);

    if (error) {
      console.error('Error updating reaction:', error);
    }
  };

  // Mark opponent messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!gameId) return;
    
    // Get unread messages from opponent
    const unreadMessages = messages.filter(
      msg => msg.player_id !== playerId && !msg.read_at
    );
    
    if (unreadMessages.length === 0) return;

    const { error } = await supabase
      .from('game_chat_messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadMessages.map(m => m.id));

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [gameId, messages, playerId]);

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

    // Messages channel - listen for INSERT and UPDATE
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
          const newMsg = payload.new as any;
          setMessages(prev => [...prev, {
            ...newMsg,
            reactions: newMsg.reactions || {},
            read_at: newMsg.read_at || null
          }]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_chat_messages',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          const updatedMsg = payload.new as any;
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMsg.id 
              ? { 
                  ...msg, 
                  reactions: updatedMsg.reactions || {},
                  read_at: updatedMsg.read_at || null
                }
              : msg
          ));
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
    toggleReaction,
    markMessagesAsRead,
    isLoading,
    opponentTyping,
    setTyping
  };
};
