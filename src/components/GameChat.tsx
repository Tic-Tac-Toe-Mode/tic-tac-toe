import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, X } from 'lucide-react';
import { ChatMessage, useGameChat } from '@/hooks/useGameChat';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface GameChatProps {
  gameId: string;
  playerId: string;
  playerName: string;
}

const GameChat: React.FC<GameChatProps> = ({ gameId, playerId, playerName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const { messages, sendMessage, opponentTyping, setTyping } = useGameChat(gameId, playerId, playerName);
  const { playChatSound } = useSoundEffects();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const prevMessageCountRef = useRef(0);

  // Auto-scroll to bottom on new messages and play sound for incoming messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    // Check if there's a new message from opponent
    if (messages.length > prevMessageCountRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.player_id !== playerId) {
        // Play notification sound for opponent's message
        playChatSound();
        
        // Track unread when chat is closed
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
      }
    }
    
    prevMessageCountRef.current = messages.length;
  }, [messages, isOpen, playerId, playChatSound]);

  // Clear unread when opening chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    
    // Broadcast typing status
    setTyping(true);
    
    // Debounce to stop typing after user stops
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
    typingDebounceRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
      setTyping(false);
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-card border border-border rounded-lg shadow-xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">Game Chat</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              No messages yet. Say hi! 👋
            </p>
          ) : (
            messages.map((msg: ChatMessage) => {
              const isOwn = msg.player_id === playerId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-semibold mb-1 opacity-80">
                        {msg.player_name}
                      </p>
                    )}
                    <p className="text-sm break-words">{msg.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              );
            })
          )}
          
          {/* Typing Indicator */}
          {opponentTyping && (
            <div className="flex items-start">
              <div className="bg-muted rounded-lg px-3 py-2">
                <p className="text-xs font-semibold mb-1 opacity-80">{opponentTyping}</p>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={200}
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameChat;
