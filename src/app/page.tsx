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
  'página oficial': [
    "¡Claro que sí! Tengo más páginas web que un libro de historia. Aquí tienes mis cuarteles generales en la red:\n\nPágina Principal: www.tukuypanpaq.com\nCusco Fest: www.cuscofest.com\nQuechua Quick: www.quechuaquick.com\n\n¡Navega con sabiduría, amigo explorador!"
  ],
  'sitio web': [
    "¡Por supuesto! Mi imperio digital se extiende por varios dominios. ¡Apunta!:\n\nPágina Principal: www.tukuypanpaq.com\nCusco Fest: www.cuscofest.com\nQuechua Quick: www.quechuaquick.com\n\n¡Que los Apus guíen tu clic!"
  ],
  'taller textil': [
    "¡Ah, el taller textil! Prepárate para convertirte en un Picasso de los telares. Aprenderás de maestros artesanos que tienen más secretos que un quipu. ¡Saldrás de aquí tejiendo tu propio poncho y con más estilo que una alpaca con gafas de sol!"
  ],
  camping: [
    "¿Camping? ¡Más bien 'glamping' a lo inca! Te ofrecemos una noche bajo un millón de estrellas, con historias junto a la fogata y el sonido de la naturaleza. Es tan increíble que hasta los ovnis se acercan a curiosear. ¡No te preocupes, las alpacas montan guardia!"
  ],
  'desayuno andino': [
    "Nuestro desayuno andino es pura super-comida. Quinua, kiwicha, frutas frescas... ¡Es el desayuno de los campeones! Después de esto, sentirás que puedes subir al Machu Picchu corriendo... bueno, casi. ¡Es delicioso y te dará energía para todo el día!"
  ],
  'pastoreo de ovejas': [
    "¿Siempre soñaste con ser el líder de un rebaño con mucho estilo? ¡Esta es tu oportunidad! En nuestro pastoreo de ovejas, aprenderás a guiar a las ovejas más esponjosas y simpáticas de los Andes. ¡Es como ser un CEO, pero con más lana y menos reuniones aburridas!"
  ],
  'pacha manca': [
    "¡La pacha manca es cocinar a lo grande! Usamos piedras calientes y enterramos la comida bajo tierra. Es como un spa para la comida, ¡y sale tan deliciosa que querrás pedirle matrimonio al chef! Aprenderás los secretos de esta técnica ancestral y sorprenderás a todos en casa."
  ],
  servicios: [
    "¡Por supuesto! Estoy hasta las orejas de servicios geniales. Te ofrezco una experiencia de turismo vivencial inolvidable. ¿Qué te apetece? Tenemos Taller Textil para que tejas tu propio destino, Camping para que cuentes estrellas en lugar de ovejas (aunque también tenemos Pastoreo de Ovejas), un Desayuno Andino para empezar el día con fuerza, y hasta un taller de cocina Pacha Manca para que saques el chef inca que llevas dentro. ¡Dime cuál te interesa y te cuento más!"
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

  return `No entendí tu mensaje. Prueba con palabras como 'hola', 'adios', 'ayuda', 'servicios', etc.`;
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
    return new Promise<void>((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        console.error("Browser doesn't support speech synthesis.");
        reject(new Error("Speech synthesis not supported."));
        return;
      }
      
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
      
      utterance.onerror = (e) => {
        console.error('An error occurred during speech synthesis: ', e);
        setAvatarStatus('idle');
        reject(e); // Reject the promise on error
      };

      const doSpeak = () => {
        // If there's something speaking or pending, cancel it.
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
          // Give a moment for cancel to take effect before speaking again
          setTimeout(() => speechSynthesis.speak(utterance), 100);
        } else {
          speechSynthesis.speak(utterance);
        }
      };

      // Ensure voices are loaded before speaking
      if (speechSynthesis.getVoices().length > 0) {
        doSpeak();
      } else {
        speechSynthesis.onvoiceschanged = () => {
          speechSynthesis.onvoiceschanged = null;
          doSpeak();
        };
        speechSynthesis.getVoices();
      }
    });
  }, []);

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
      setMessages((prev) => [...prev, userMessage]);
      await new Promise((res) => setTimeout(res, 1000));

      const responseText = getResponse(text);

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: responseText,
        sender: 'ai' as const,
      };
      
      await speak(responseText);
      setMessages((prev) => [...prev, aiMessage]);

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
    <div className="h-screen w-screen flex flex-col bg-gradient-to-b from-[#0A0E17] via-[#0F172A] to-[#0A0E17] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <main className="container mx-auto px-4 py-4 md:py-8 relative z-10 flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 flex justify-center items-center relative -mt-4 md:-mt-8">
          <LlamaAvatar 
            status={avatarStatus}
            className="scale-90 md:scale-100"
          />
        </div>

        <div className="flex-shrink-0">
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
