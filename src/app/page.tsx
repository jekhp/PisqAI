'use client';

import { useState, useEffect, useCallback } from 'react';

import ChatInterface, { type Message } from '@/components/chat-interface';
import FloatingControls from '@/components/floating-controls';
import LlamaAvatar from '@/components/llama-avatar';
import ParticleBackground from '@/components/particle-background';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

const responses: Record<string, string[]> = {
  hola: [
    '¡Hola! ¿Cómo estás?',
    '¡Hola! ¿Qué tal?',
    '¡Hola! Me alegra escucharte',
    '¡Hola amigo! ¿En qué puedo ayudarte?',
    '¡Hola! ¿Cómo te va el día?',
  ],
  adiós: [
    '¡Adiós! Que tengas un buen día',
    '¡Adiós! Hasta luego',
    '¡Adiós! Fue un placer hablar contigo',
    '¡Adiós! Nos vemos pronto',
    '¡Adiós! Cuídate mucho',
  ],
  ayuda: [
    'Estoy aquí para ayudarte',
    '¿En qué necesitas ayuda?',
    'Dime, ¿qué necesitas?',
  ],
  gracias: [
    '¡De nada! Para eso estoy',
    'Es un placer ayudarte',
    'No hay de qué',
  ],
  allillanchu: [
    'Si todo bien',
    'si todo bien',
    'si todo bien',
  ],
  si: ['Entendido', 'Muy bien', 'Perfecto'],
  no: ['Ok, como prefieras', 'Entiendo', 'Sin problema'],
};

const getResponse = (text: string) => {
  const cleanText = text.toLowerCase().replace(/[.,!?;:]/g, '');
  const words = cleanText.split(' ');
  
  for (const word of words) {
    if (responses[word]) {
      const responseList = responses[word];
      return responseList[Math.floor(Math.random() * responseList.length)];
    }
  }

  return `No entendí tu mensaje. Prueba con palabras como 'hola', 'adios', 'ayuda', etc.`;
};


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
          setAvatarStatus('idle'); 
          resolve();
        };
        utterance.onerror = () => {
          setAvatarStatus('idle');
          resolve();
        };

        speechSynthesis.speak(utterance);
      });
    },
    []
  );

  const processAndRespond = useCallback(async (text: string) => {
    if (avatarStatus === 'thinking' || avatarStatus === 'speaking') return;

    const userMessage = { id: crypto.randomUUID(), text, sender: 'user' as const };
    setMessages([userMessage]);
    setAvatarStatus('thinking');

    await new Promise((res) => setTimeout(res, 1000));

    const responseText = getResponse(text);

    const aiMessage = {
      id: crypto.randomUUID(),
      text: responseText,
      sender: 'ai' as const,
    };
    setMessages([userMessage, aiMessage]);
    await speak(responseText);
  }, [avatarStatus, speak]);
  
  const {
    isListening,
    startListening,
    stopListening,
  } = useSpeechRecognition({ onTranscript: processAndRespond });

  useEffect(() => {
    if (avatarStatus !== 'speaking' && avatarStatus !== 'thinking') {
      setAvatarStatus(isListening ? 'listening' : 'idle');
    }
  }, [isListening, avatarStatus]);
  

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ParticleBackground />

      <main className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center -mt-24 md:-mt-16">
          <LlamaAvatar status={avatarStatus} />
        </div>

        <div className="px-4 pb-4">
          <ChatInterface
            messages={messages}
            loading={avatarStatus === 'thinking'}
            sendMessage={processAndRespond}
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
