'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import LlamaAvatar from '@/components/llama-avatar';

export type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp?: Date;
};

type ChatInterfaceProps = {
  messages: Message[];
  loading: boolean;
  sendMessage: (text: string) => void;
  aiStatus: 'idle' | 'thinking' | 'speaking' | 'listening'; // Nuevo prop para el estado del AI
};

export default function ChatInterface({
  messages,
  loading,
  sendMessage,
  aiStatus = 'idle', // Valor por defecto
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

  // Determinar si hay mensajes del AI para mostrar avatar especial
  const hasAiMessages = messages.some(msg => msg.sender === 'ai');

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Sección de Avatar de Llama - SIEMPRE VISIBLE */}
      <div className="lg:w-2/5 flex flex-col items-center justify-center">
        <div className="sticky top-8">
          <LlamaAvatar 
            status={aiStatus} 
            className="w-full max-w-[400px] mx-auto"
          />
          
          {/* Indicador de estado */}
          <div className="mt-6 text-center">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
              aiStatus === 'speaking' && "bg-primary/20 text-primary animate-pulse",
              aiStatus === 'thinking' && "bg-yellow-500/20 text-yellow-500",
              aiStatus === 'listening' && "bg-green-500/20 text-green-500",
              aiStatus === 'idle' && "bg-gray-500/20 text-gray-500"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                aiStatus === 'speaking' && "bg-primary animate-pulse",
                aiStatus === 'thinking' && "bg-yellow-500",
                aiStatus === 'listening' && "bg-green-500",
                aiStatus === 'idle' && "bg-gray-500"
              )} />
              <span>
                {aiStatus === 'speaking' && "PisqAI está hablando..."}
                {aiStatus === 'thinking' && "PisqAI está pensando..."}
                {aiStatus === 'listening' && "Escuchando..."}
                {aiStatus === 'idle' && "PisqAI listo"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección del Chat */}
      <div className="lg:w-3/5 flex flex-col gap-6">
        {/* Chat Area */}
        <ScrollArea
          ref={scrollAreaRef}
          className="h-[500px] md:h-[600px] w-full pr-4 rounded-2xl border border-white/10 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-6 p-4">
            {messages.length === 0 ? (
              // Mensaje de bienvenida cuando no hay mensajes
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-3xl">🔥</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">¡Hola! Soy PisqAI</h3>
                <p className="text-white/60 max-w-md">
                  Pregúntame lo que quieras. Estoy aquí para ayudarte con cualquier duda o conversación.
                </p>
              </div>
            ) : (
              // Lista de mensajes
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex items-start gap-4',
                      message.sender === 'user' && 'justify-end'
                    )}
                  >
                    {message.sender === 'ai' && (
                      <Avatar className="w-10 h-10 border-2 border-primary/50 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-bold">
                          AI
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl p-4 text-base transition-all duration-300',
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg'
                          : 'bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg'
                      )}
                    >
                      <p className="leading-relaxed">{message.text}</p>
                      {message.timestamp && (
                        <p className="text-xs opacity-60 mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    {message.sender === 'user' && (
                      <Avatar className="w-10 h-10 border-2 border-accent/50 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-accent/30 to-accent/10 text-accent font-bold">
                          TÚ
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {loading && (
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10 border-2 border-primary/50 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-bold">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/10">
                      <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                        <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]" />
                        <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={scrollEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu mensaje o pregunta a PisqAI..."
            className="h-14 bg-black/30 border-2 border-white/20 rounded-full pl-6 pr-20 text-base focus-visible:ring-2 focus-visible:ring-primary/50 backdrop-blur-sm"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
            disabled={loading || !inputValue.trim()}
          >
            <Send className="w-5 h-5" />
            <span className="sr-only">Enviar mensaje</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
