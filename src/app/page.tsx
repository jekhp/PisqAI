'use client';

import { useState, useEffect, useCallback } from 'react';

import ChatInterface, { type Message } from '@/components/chat-interface';
import FloatingControls from '@/components/floating-controls';
import LlamaAvatar from '@/components/llama-avatar';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

const responses: Record<string, string[]> = {
  hola: [
    '¡Hola! ¿Cómo estás?',
    '¡Hola! ¿Qué tal?',
    '¡Hola! Me alegra escucharte',
    '¡Hola amigo! ¿En qué puedo ayudarte?',
    '¡Hola! ¿Cómo te va el día?',
  ],
  'cómo te llamas': [
    'Mi nombre es PisqAI, ¡un gusto conocerte!',
    'Soy PisqAI, tu asistente virtual.',
    'Puedes llamarme PisqAI.',
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
  allillanchu: ['Si todo bien', 'si todo bien', 'si todo bien'],
  si: ['Entendido', 'Muy bien', 'Perfecto'],
  no: ['Ok, como prefieras', 'Entiendo', 'Sin problema'],
};

const getResponse = (text: string) => {
  const cleanText = text.toLowerCase().replace(/[.,!?;:]/g, '');

  const sortedPhrases = Object.keys(responses).sort(
    (a, b) => b.length - a.length
  );

  for (const phrase of sortedPhrases) {
    if (cleanText.includes(phrase)) {
      const responseList = responses[phrase];
      return responseList[Math.floor(Math.random() * responseList.length)];
    }
  }

  return `No entendí tu mensaje. Prueba con palabras como 'hola', 'adios', 'ayuda', etc.`;
};

type TwinkleStyle = {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [avatarStatus, setAvatarStatus] = useState<
    'idle' | 'thinking' | 'speaking' | 'listening'
  >('idle');
  const [twinkleStyles, setTwinkleStyles] = useState<TwinkleStyle[]>([]);

  const speak = useCallback((text: string) => {
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
  }, []);
  
  useEffect(() => {
    const hasWelcomed = localStorage.getItem('hasWelcomed');
  
    if (!hasWelcomed) {
      const welcomeMessage = "Bienvenido a Tukuy Yanpaq, mi nombre es PisqAI. Estoy aquí para ayudarte en lo que necesites. ¿En qué puedo asistirte hoy?";
      
      const timer = setTimeout(async () => {
        setAvatarStatus('speaking');
        await speak(welcomeMessage);
        setAvatarStatus('idle');
        
        const welcomeChatMessage: Message = {
          id: crypto.randomUUID(),
          text: welcomeMessage,
          sender: 'ai' as const,
        };
        setMessages([welcomeChatMessage]);
        
        localStorage.setItem('hasWelcomed', 'true');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [speak]);
  
  useEffect(() => {
    const styles = [...Array(30)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    }));
    setTwinkleStyles(styles);
  }, []);


  const processAndRespond = useCallback(
    async (text: string) => {
      if (avatarStatus === 'thinking' || avatarStatus === 'speaking') return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        text,
        sender: 'user' as const,
      };

      setAvatarStatus('thinking');

      await new Promise((res) => setTimeout(res, 1000));

      const responseText = getResponse(text);

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: responseText,
        sender: 'ai' as const,
      };

      setMessages([userMessage, aiMessage]);

      await speak(responseText);
    },
    [avatarStatus, speak]
  );

  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onTranscript: processAndRespond,
  });

  useEffect(() => {
    if (avatarStatus !== 'speaking' && avatarStatus !== 'thinking') {
      setAvatarStatus(isListening ? 'listening' : 'idle');
    }
  }, [isListening, avatarStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E17] via-[#0F172A] to-[#0A0E17] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-center items-center min-h-[60vh] md:min-h-[70vh]">
          <LlamaAvatar 
            status={avatarStatus}
            className="scale-100 md:scale-110"
          />
        </div>

        <div className="mt-8 md:mt-12">
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

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {twinkleStyles.map((style, i) => (
          <div
            key={i}
            className="absolute w-[1px] h-[1px] bg-primary/20 rounded-full animate-twinkle"
            style={style}
          />
        ))}
      </div>
    </div>
  );
}
