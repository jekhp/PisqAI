'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Settings, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const mockConversations = [
  { id: 1, title: 'Exploring Quantum Physics' },
  { id: 2, title: 'History of the Roman Empire' },
  { id: 3, title: 'Creative Writing Prompts' },
  { id: 4, title: 'AI Ethics and Future' },
];

type ChatSidebarProps = {
  onSelectChat?: () => void;
};

export default function ChatSidebar({ onSelectChat }: ChatSidebarProps) {
  const [activeChat, setActiveChat] = useState(1);

  const handleSelect = (id: number) => {
    setActiveChat(id);
    onSelectChat?.();
  };

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-xl border-r border-white/10">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider text-white">LlamaIA</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-white/10"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4">
        <Button className="w-full justify-start gap-2 bg-primary/80 hover:bg-primary text-primary-foreground">
          <Plus className="w-5 h-5" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <p className="text-xs font-semibold text-white/40 mb-2 px-2">
          Recent
        </p>
        <div className="flex flex-col gap-1">
          {mockConversations.map((convo) => (
            <div key={convo.id} className="group relative">
              <Button
                variant="ghost"
                onClick={() => handleSelect(convo.id)}
                className={cn(
                  'w-full justify-start gap-3 truncate pr-8',
                  activeChat === convo.id
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/10 text-white/60 hover:text-white'
                )}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate flex-1 text-left">
                  {convo.title}
                </span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/10">
        <Button variant="outline" className="w-full bg-transparent border-accent text-accent hover:bg-accent/10 hover:text-accent">
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
}
