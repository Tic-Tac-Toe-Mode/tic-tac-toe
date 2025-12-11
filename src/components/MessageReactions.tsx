import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SmilePlus } from 'lucide-react';

interface MessageReactionsProps {
  reactions: Record<string, string[]>;
  playerId: string;
  onReact: (emoji: string) => void;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const MessageReactions: React.FC<MessageReactionsProps> = ({ reactions, playerId, onReact }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReact = (emoji: string) => {
    onReact(emoji);
    setIsOpen(false);
  };

  const reactionEntries = Object.entries(reactions).filter(([_, ids]) => ids.length > 0);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Show existing reactions */}
      {reactionEntries.map(([emoji, playerIds]) => {
        const hasReacted = playerIds.includes(playerId);
        return (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 transition-colors ${
              hasReacted 
                ? 'bg-primary/20 border border-primary/40' 
                : 'bg-muted hover:bg-muted/80 border border-transparent'
            }`}
          >
            <span>{emoji}</span>
            <span className="text-muted-foreground">{playerIds.length}</span>
          </button>
        );
      })}

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <SmilePlus className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" side="top" align="start">
          <div className="flex gap-1">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-lg hover:bg-muted p-1 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageReactions;
