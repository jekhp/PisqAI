'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ChatInterface, { type Message } from '@/components/chat-interface';
import ChatSidebar from '@/components/chat-sidebar';
import FloatingControls from '@/components/floating-controls';
import LlamaAvatar from '@/components/llama-avatar';
import ParticleBackground from '@/components/particle-background';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm LlamaIA. How can I assist you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sendMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, sender: 'user' },
    ]);
    setLoading(true);

    // Mock AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: 'This is a mocked response, demonstrating the thinking state of the Llama.',
          sender: 'ai',
        },
      ]);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ParticleBackground />
      <div className="md:hidden absolute top-4 left-4 z-20">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 p-0"
          >
            <ChatSidebar onSelectChat={() => setIsSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      <aside className="hidden md:block fixed top-0 left-0 h-full w-72 z-10">
        <ChatSidebar />
      </aside>

      <main className="h-full flex flex-col md:pl-72">
        <div className="flex-1 flex items-center justify-center -mt-24 md:-mt-16">
          <LlamaAvatar status={loading ? 'thinking' : 'idle'} />
        </div>

        <div className="px-4 pb-4">
          <ChatInterface
            messages={messages}
            loading={loading}
            sendMessage={sendMessage}
          />
        </div>
      </main>

      <FloatingControls />
    </div>
  );
}
