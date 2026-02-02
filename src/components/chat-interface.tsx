'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
};

type ChatInterfaceProps = {
  messages: Message[];
  loading: boolean;
  sendMessage: (text: string) => void;
};

export default function ChatInterface({
  messages,
  loading,
  sendMessage,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !loading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      <ScrollArea
        ref={scrollAreaRef}
        className="h-64 w-full pr-4"
        // style={{ maskImage: 'linear-gradient(to top, transparent, black 20%)' }}
      >
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3',
                message.sender === 'user' && 'justify-end'
              )}
            >
              {message.sender === 'ai' && (
                <Avatar className="w-8 h-8 border border-primary/50">
                  <AvatarFallback className="bg-transparent text-primary text-xs">
                    P
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[75%] rounded-lg p-3 text-sm',
                  message.sender === 'user'
                    ? 'bg-primary/90 text-primary-foreground'
                    : 'bg-white/5'
                )}
              >
                <p>{message.text}</p>
              </div>
              {message.sender === 'user' && (
                <Avatar className="w-8 h-8 border border-accent/50">
                  <AvatarFallback className="bg-transparent text-accent text-xs">
                    U
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8 border border-primary/50">
                <AvatarFallback className="bg-transparent text-primary text-xs">
                  P
                </AvatarFallback>
              </Avatar>
              <div className="bg-white/5 rounded-lg p-3 flex items-center space-x-2">
                <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]" />
                <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]" />
                <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              </div>
            </div>
          )}
          <div ref={scrollEndRef} />
        </div>
      </ScrollArea>
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center"
      >
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask PisqAI anything..."
          className="h-12 bg-black/20 border-white/10 rounded-full pl-6 pr-16 text-base focus-visible:ring-primary/50 backdrop-blur-sm"
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary hover:bg-primary/90"
          disabled={loading || !inputValue.trim()}
        >
          <Send className="w-5 h-5 text-primary-foreground" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}
