'use client';

import { useState } from 'react';

import ChatInterface, { type Message } from '@/components/chat-interface';
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

      <main className="h-full flex flex-col">
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
