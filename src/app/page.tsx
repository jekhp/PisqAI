'use client';

import { useState, useEffect, useCallback } from 'react';

import ChatInterface, { type Message } from '@/components/chat-interface';
import FloatingControls from '@/components/floating-controls';
import LlamaAvatar from '@/components/llama-avatar';
import ParticleBackground from '@/components/particle-background';
import AudioVisualizer from '@/components/audio-visualizer';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "¡Hola! Soy PisqAI. Presiona el micrófono para hablar conmigo.",
    },
  ]);
  const [avatarStatus, setAvatarStatus] = useState<
    'idle' | 'thinking' | 'speaking' | 'listening'
  >('idle');
  const { toast } = useToast();

  const {
    isListening,
    startListening,
    stopListening,
    analyser,
    getResponse,
  } = useVoiceRecognition(onWordDetected);

  const speak = useCallback(
    (text: string) => {
      return new Promise<void>((resolve) => {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
          setAvatarStatus('speaking');
        };
        utterance.onend = () => {
          setAvatarStatus(isListening ? 'listening' : 'idle');
          resolve();
        };
        utterance.onerror = () => {
          setAvatarStatus(isListening ? 'listening' : 'idle');
          resolve();
        };

        speechSynthesis.speak(utterance);
      });
    },
    [isListening]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function onWordDetected(word: string, confidence: number) {
    stopListening();

    const userMessage = { id: crypto.randomUUID(), text: word, sender: 'user' as const };
    setMessages([userMessage]);

    setAvatarStatus('thinking');
    const responseText = getResponse(word);

    setTimeout(async () => {
      const aiMessage = { id: crypto.randomUUID(), text: responseText, sender: 'ai' as const };
      setMessages([userMessage, aiMessage]);
      await speak(responseText);
    }, 1000);
  }

  useEffect(() => {
    if (avatarStatus !== 'speaking' && avatarStatus !== 'thinking') {
      setAvatarStatus(isListening ? 'listening' : 'idle');
    }
  }, [isListening, avatarStatus]);

  const sendMessage = async (text: string) => {
    const userMessage = { id: crypto.randomUUID(), text, sender: 'user' as const };
    setMessages([userMessage]);
    setAvatarStatus('thinking');

    // Mock AI response
    await new Promise((res) => setTimeout(res, 1000));

    const words = text.toLowerCase().replace(/[.,!?;:]/g, '').split(' ');
    let responseText = `No entendí tu mensaje. Prueba con palabras como 'hola', 'adios', 'ayuda', etc.`;

    for (const word of words) {
      const potentialResponse = getResponse(word);
      if (!potentialResponse.startsWith('Detecté "')) {
        responseText = potentialResponse;
        break;
      }
    }

    const aiMessage = {
      id: crypto.randomUUID(),
      text: responseText,
      sender: 'ai' as const,
    };
    setMessages([userMessage, aiMessage]);
    await speak(responseText);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ParticleBackground />

      <main className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center -mt-24 md:-mt-16">
          <LlamaAvatar status={avatarStatus} />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg pointer-events-none">
          <AudioVisualizer analyser={analyser} isListening={isListening} />
        </div>

        <div className="px-4 pb-4">
          <ChatInterface
            messages={messages}
            loading={avatarStatus === 'thinking'}
            sendMessage={sendMessage}
          />
        </div>
      </main>

      <FloatingControls
        isListening={isListening}
        startListening={startListening}
        stopListening={stopListening}
      />
    </div>
  );
}
