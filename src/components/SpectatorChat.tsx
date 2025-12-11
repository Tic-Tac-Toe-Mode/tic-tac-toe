import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle } from 'lucide-react';
import { useSpectatorChat, SpectatorMessage } from '@/hooks/useSpectatorChat';

interface SpectatorChatProps {
  gameId: string;
  playerId: string;
  playerName: string;
}

const SpectatorChat: React.FC<SpectatorChatProps> = ({ gameId, playerId, playerName }) => {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, sendMessage } = useSpectatorChat(gameId, playerId, playerName);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="flex items-center gap-2 p-2 bg-muted/50 border-b border-border">
        <MessageCircle className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Spectator Chat</span>
        <span className="text-xs text-muted-foreground">({messages.length})</span>
      </div>

      <ScrollArea className="h-40 p-2" ref={scrollRef}>
        <div className="space-y-2">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-xs py-4">
              Be the first to comment!
            </p>
          ) : (
            messages.map((msg: SpectatorMessage) => (
              <div key={msg.id} className="text-sm">
                <span className="font-medium text-primary">{msg.player_name}</span>
                <span className="text-muted-foreground">: </span>
                <span className="break-words">{msg.message}</span>
                <span className="text-xs text-muted-foreground ml-1">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Comment..."
            className="flex-1 h-8 text-sm"
            maxLength={150}
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            size="sm"
            className="h-8"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpectatorChat;
