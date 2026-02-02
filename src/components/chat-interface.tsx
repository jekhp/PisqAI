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
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 mt-4">
      <ScrollArea
        ref={scrollAreaRef}
        className="h-72 w-full pr-4"
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
                <Avatar className="w-10 h-10 border-2 border-primary/60">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                    AI
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl p-4 text-base',
                  'backdrop-blur-sm border',
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground border-primary/50'
                    : 'bg-white/10 border-white/20'
                )}
              >
                <p className="leading-relaxed">{message.text}</p>
              </div>
              {message.sender === 'user' && (
                <Avatar className="w-10 h-10 border-2 border-accent/60">
                  <AvatarFallback className="bg-gradient-to-br from-accent/20 to-accent/10 text-accent">
                    U
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10 border-2 border-primary/60 animate-pulse">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]" />
                  <span className="h-2.5 w-2.5 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]" />
                  <span className="h-2.5 w-2.5 bg-primary rounded-full animate-pulse" />
                </div>
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
          className="h-14 bg-black/40 border-2 border-primary/30 rounded-2xl pl-6 pr-20 text-base focus-visible:ring-2 focus-visible:ring-primary/70 backdrop-blur-md transition-all"
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          disabled={loading || !inputValue.trim()}
        >
          <Send className="w-6 h-6 text-primary-foreground" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}