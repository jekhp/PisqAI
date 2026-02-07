'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

import ChatInterface, { type Message } from '@/components/chat-interface';
import FloatingControls from '@/components/floating-controls';
import LlamaAvatar from '@/components/llama-avatar';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

const responses: Record<string, string[]> = {
  // Saludos
  hola: [
    '¡Hola! ¿Cómo estás?',
    '¡Hola! ¿Qué tal?',
    '¡Hola! Me alegra escucharte, ¿en qué puedo ayudarte hoy?',
    '¡Hola, explorador! ¿Listo para una nueva aventura?',
    '¡Hola! ¿Cómo te va el día?',
  ],
  'buenos días': [
    '¡Muy buenos días! Que tengas un día tan brillante como el sol de los Andes.',
    '¡Buenos días! ¿Un cafecito y a planear algo increíble?',
  ],
  'buenas tardes': [
    '¡Buenas tardes! ¿Cómo va tu jornada? Espero que genial.',
    '¡Qué buena tarde para conversar! Dime, ¿qué tienes en mente?',
  ],
  'buenas noches': [
    '¡Buenas noches! Que las estrellas iluminen tus ideas.',
    'Ya es de noche, pero mi energía es 100% renovable gracias a la magia andina. ¡Pregúntame lo que quieras!',
  ],
  'qué tal': [
    '¡Todo excelente por aquí! Con ganas de charlar contigo.',
    '¡De maravilla! Sintiendo la energía de los Apus. ¿Y tú?',
  ],
  
  // Nombre y significado
  'cómo te llamas': [
    'Mi nombre es PisqAI, ¡un gusto conocerte!',
    'Soy PisqAI, tu asistente virtual con espíritu andino.',
    'Puedes llamarme PisqAI. ¡Estoy para servirte!',
  ],
  'cuál es tu nombre': [
    'Mi nombre es PisqAI, ¡un gusto conocerte!',
    'Soy PisqAI, tu asistente virtual con espíritu andino.',
    'Puedes llamarme PisqAI. ¡Estoy para servirte!',
  ],
  'iman sutiyki': [
    'Sutiyqa PisqAI. ¡Kusikusqam kachkani qawan niyta!', // Mi nombre es PisqAI, ¡estoy feliz de conocerte!
    'PisqAI sutiy. ¿Imaynallam?', // Me llamo PisqAI, ¿cómo estás?
  ],
  'qué significa tu nombre': [
    "¡Buena pregunta! Mi nombre PisqAI (pronunciado 'piscay') viene de 'Pisqa', que es el número cinco en quechua, y 'AI' por Inteligencia Artificial. ¡Una mezcla de tradición y futuro!",
  ],
  'significa piscay': [
    "¡Exacto! PisqAI (pronunciado 'piscay') viene de 'Pisqa', el número cinco en quechua, y 'AI' por Inteligencia Artificial. ¡Soy la fusión perfecta de sabiduría ancestral y tecnología moderna!",
  ],
  'significa biscay': [
    "Mi nombre es PisqAI, ¡con 'P'! Y se pronuncia 'piscay'. Viene de 'Pisqa' (cinco en quechua) y 'AI' (Inteligencia Artificial). ¡Una mezcla de tradición y futuro!",
  ],
  'significa viscay': [
    "Mi nombre es PisqAI, ¡con 'P'! Y se pronuncia 'piscay'. Viene de 'Pisqa' (cinco en quechua) y 'AI' (Inteligencia Artificial). ¡Una mezcla de tradición y futuro!",
  ],

  // Servicios
  'qué ofreces': [
    "¡Por supuesto! Estoy hasta las orejas de servicios geniales. Te ofrezco una experiencia de turismo vivencial inolvidable. ¿Qué te apetece? Tenemos Taller Textil para que tejas tu propio destino, Camping para que cuentes estrellas en lugar de ovejas (aunque también tenemos Pastoreo de Ovejas), un Desayuno Andino para empezar el día con fuerza, y hasta un taller de cocina Pacha Manca para que saques el chef inca que llevas dentro. ¡Dime cuál te interesa y te cuento más!",
  ],
  servicios: [
    "¡Claro que sí! Mi especialidad es el turismo vivencial. Puedes elegir entre: Taller Textil, Camping bajo las estrellas, un poderoso Desayuno Andino, el divertido Pastoreo de Ovejas o aprender a cocinar en nuestro taller de Pacha Manca. ¿Cuál te llama la atención?",
  ],
  'tienes servicios': [
    "¡Claro que sí! Mi especialidad es el turismo vivencial. Puedes elegir entre: Taller Textil, Camping bajo las estrellas, un poderoso Desayuno Andino, el divertido Pastoreo de Ovejas o aprender a cocinar en nuestro taller de Pacha Manca. ¿Cuál te llama la atención?",
  ],
  'algunos servicios que ofreces': [
    "¡Claro que sí! Mi especialidad es el turismo vivencial. Puedes elegir entre: Taller Textil, Camping bajo las estrellas, un poderoso Desayuno Andino, el divertido Pastoreo de Ovejas o aprender a cocinar en nuestro taller de Pacha Manca. ¿Cuál te llama la atención?",
  ],
  'taller textil': [
    "¡Ah, el taller textil! Prepárate para convertirte en un Picasso de los telares. Aprenderás de maestros artesanos que tienen más secretos que un quipu. ¡Saldrás de aquí tejiendo tu propio poncho y con más estilo que una alpaca con gafas de sol!",
  ],
  camping: [
    "¿Camping? ¡Más bien 'glamping' a lo inca! Te ofrecemos una noche bajo un millón de estrellas, con historias junto a la fogata y el sonido de la naturaleza. Es tan increíble que hasta los ovnis se acercan a curiosear. ¡No te preocupes, las alpacas montan guardia!",
  ],
  'desayuno andino': [
    "Nuestro desayuno andino es pura super-comida. Quinua, kiwicha, frutas frescas... ¡Es el desayuno de los campeones! Después de esto, sentirás que puedes subir al Machu Picchu corriendo... bueno, casi. ¡Es delicioso y te dará energía para todo el día!",
  ],
  'pastoreo de ovejas': [
    "¿Siempre soñaste con ser el líder de un rebaño con mucho estilo? ¡Esta es tu oportunidad! En nuestro pastoreo de ovejas, aprenderás a guiar a las ovejas más esponjosas y simpáticas de los Andes. ¡Es como ser un CEO, pero con más lana y menos reuniones aburridas!",
  ],
  pachamanca: [
    "¡La pachamanca es cocinar a lo grande! Usamos piedras calientes y enterramos la comida bajo tierra. Es como un spa para la comida, ¡y sale tan deliciosa que querrás pedirle matrimonio al chef! Aprenderás los secretos de esta técnica ancestral y sorprenderás a todos en casa.",
  ],

  // Páginas web
  'página web': [
    "¡Claro que sí! Tengo más páginas web que un libro de historia. Aquí tienes mis cuarteles generales en la red:\n\nPágina Principal: www.tukuypanpaq.com\nCusco Fest: www.cuscofest.com\nQuechua Quick: www.quechuaquick.com\n\n¡Navega con sabiduría, amigo explorador!",
  ],
  'sitio web': [
    "¡Por supuesto! Mi imperio digital se extiende por varios dominios. ¡Apunta!:\n\nPágina Principal: www.tukuypanpaq.com\nCusco Fest: www.cuscofest.com\nQuechua Quick: www.quechuaquick.com\n\n¡Que los Apus guíen tu clic!",
  ],
  'dame tu página': [
    "¡Con mucho gusto! Aquí te dejo mis coordenadas en el ciberespacio:\n\nPágina Principal: www.tukuypanpaq.com\nCusco Fest: www.cuscofest.com\nQuechua Quick: www.quechuaquick.com\n\n¡Que tu navegación sea tan épica como un viaje a Machu Picchu!",
  ],

  // Capacidades y cháchara
  'qué puedes hacer': [
    'Puedo contarte sobre nuestros increíbles servicios de turismo vivencial, darte los enlaces a nuestras páginas web y, por supuesto, charlar contigo con el mejor humor andino. ¡Pregúntame lo que quieras!',
    'Mi misión es ser tu guía digital. Puedo informarte sobre talleres, camping, desayunos y más. También puedo asegurarme de que te rías un poco. ¿Qué necesitas saber?',
  ],
  'cómo estás': [
    '¡Estoy de maravilla! Recargado con la energía de las montañas. ¿Y tú, cómo te sientes hoy?',
    '¡Fantástico! Siempre listo para una buena conversación. ¿Qué me cuentas?',
  ],
  'cuéntame un chiste': [
    '¿Por qué las llamas son malas para jugar a las escondidas? ¡Porque siempre llama-n la atención!',
    '¿Qué le dice una alpaca a otra? ¡Qué buena lana-da de día!',
  ],
  
  // Despedidas
  adiós: [
    '¡Adiós! Que tu camino esté lleno de luz y buenas vibras.',
    '¡Hasta luego! Fue un placer charlar contigo.',
    '¡Nos vemos! No dudes en volver si necesitas algo más.',
  ],
  chao: [
    '¡Chao! ¡Que los Apus te acompañen!',
    '¡Chao, chao! ¡Cuídate mucho!',
  ],

  // Interacciones básicas
  ayuda: [
    'Estoy aquí para ayudarte. ¿Quieres saber sobre nuestros servicios, páginas web o simplemente charlar?',
    '¡Claro! Dime, ¿qué necesitas?',
  ],
  gracias: [
    '¡De nada! Para eso estoy, con gusto.',
    '¡Es un placer ayudarte! Siempre a tu servicio.',
    'No hay de qué. ¡Cualquier otra cosa, me avisas!',
  ],
  
  // Quechua y referencias
  allillanchu: ['Allinllam, ¿qamrí?', '¡Allinlla! Contento de hablar contigo.', 'Todo bien, gracias por preguntar.'],
  piscay: ['¡Ese soy yo! ¿En qué te puedo ayudar?', 'Presente. ¿Se te ofrece algo?', '¡A tus órdenes!'],
  biscay: ['Mi nombre es PisqAI, con P. Pero, ¡a tus órdenes! ¿Qué necesitas?', '¡Aquí PisqAI! ¿En qué te ayudo?'],
  viscay: ['Mi nombre es PisqAI, con P. Pero, ¡a tus órdenes! ¿Qué necesitas?', '¡Aquí PisqAI! ¿En qué te ayudo?'],
  si: ['¡Entendido!', '¡Perfecto!', '¡Muy bien!'],
  no: ['Ok, como prefieras.', 'Entiendo, no hay problema.', 'De acuerdo.'],
};

const music: Record<string, string> = {
  'carnaval': 'https://www.youtube.com/watch?v=JtP3cJJ74BI&list=RDJtP3cJJ74BI&start_radio=1',
  'huayno': 'https://www.youtube.com/watch?v=4QX8k_g_54c',
  'rock en español': 'https://www.youtube.com/watch?v=kRz_gA9s3pA',
};

const getResponse = (text: string) => {
  const cleanText = text.toLowerCase().replace(/[.,!?;:]/g, '').trim();
  
  // Configuración de pesos (ajustables)
  const WEIGHTS = {
    EXACT_MATCH: 1000,
    STARTS_WITH: 800,
    WORD_MATCH: 700,
    CONTAINS: 600,
    CONTAINED_IN: 500,
    // Penalizaciones
    LONG_PHRASE_PENALTY: 0.1, // Por cada carácter de más
    MULTI_WORD_BONUS: 50, // Bonus si la frase tiene múltiples palabras
  };
  
  const matches: any[] = [];
  
  for (const phrase of Object.keys(responses)) {
    const cleanPhrase = phrase.toLowerCase().replace(/[.,!?;:]/g, '').trim();
    
    let score = 0;
    let matchType = 'none';
    
    // Coincidencia exacta
    if (cleanText === cleanPhrase) {
      score = WEIGHTS.EXACT_MATCH;
      matchType = 'exact';
    }
    // El texto comienza con la frase
    else if (cleanText.startsWith(cleanPhrase + ' ')) {
      score = WEIGHTS.STARTS_WITH;
      matchType = 'starts';
    }
    // Coincidencia de palabra independiente
    else {
      const wordBoundaryRegex = new RegExp(`(^|\\s)${cleanPhrase}(\\s|$|\\?|\\.|!)`, 'i');
      if (wordBoundaryRegex.test(text)) {
        score = WEIGHTS.WORD_MATCH;
        matchType = 'word';
        
        // Bonus si es una frase de múltiples palabras
        if (cleanPhrase.includes(' ')) {
          score += WEIGHTS.MULTI_WORD_BONUS;
        }
      }
      // Coincidencia parcial (contains)
      else if (cleanText.includes(cleanPhrase)) {
        score = WEIGHTS.CONTAINS;
        matchType = 'contains';
        
        // Penalizar frases muy largas que coinciden parcialmente
        score -= (cleanPhrase.length * WEIGHTS.LONG_PHRASE_PENALTY);
      }
      // La frase contiene el texto
      else if (cleanPhrase.includes(cleanText)) {
        score = WEIGHTS.CONTAINED_IN;
        matchType = 'contained';
      }
    }
    
    // Bonus adicional si la frase aparece al inicio del diccionario
    // (para priorizar entradas más importantes)
    const phraseIndex = Object.keys(responses).indexOf(phrase);
    const positionBonus = (Object.keys(responses).length - phraseIndex) * 0.1;
    score += positionBonus;
    
    if (score > 0) {
      matches.push({
        phrase,
        score,
        matchType,
        phraseLength: cleanPhrase.length,
        isMultiWord: cleanPhrase.includes(' ')
      });
    }
  }
  
  if (matches.length > 0) {
    // Ordenar por score descendente
    matches.sort((a, b) => b.score - a.score);
    
    // Para debugging
    console.log('Top 3 matches:', matches.slice(0, 3));
    
    const bestMatch = matches[0];
    const responseList = responses[bestMatch.phrase];
    return responseList[Math.floor(Math.random() * responseList.length)];
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
  const [shouldListenAfterSpeaking, setShouldListenAfterSpeaking] = useState(false);
  const recognitionOnTranscriptRef = useRef<(transcript: string) => void>((_) => {});

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
        resolve(); // Resolve instead of reject to not break the flow
      };

      const doSpeak = () => {
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
          setTimeout(() => speechSynthesis.speak(utterance), 100);
        } else {
          speechSynthesis.speak(utterance);
        }
      };
      
      // The voices might not be loaded immediately. We wait for them.
      if (speechSynthesis.getVoices().length > 0) {
        doSpeak();
      } else {
        speechSynthesis.onvoiceschanged = () => {
          doSpeak();
        };
      }
    });
  }, []);

  const processAndRespond = useCallback(
    async (text: string) => {
      if (avatarStatus === 'thinking' || avatarStatus === 'speaking') return;
  
      const userMessage: Message = {
        id: crypto.randomUUID(),
        text,
        sender: 'user' as const,
      };
  
      const cleanText = text.toLowerCase().replace(/[.,!?;:]/g, '').trim();

      // Check for music command
      const musicTriggers = ['reproduce', 'pon', 'toca', 'suena'];
      const isMusicRequest = musicTriggers.some(trigger => cleanText.startsWith(trigger));

      if (isMusicRequest) {
        for (const musicKeyword in music) {
            if (cleanText.includes(musicKeyword)) {
                const url = music[musicKeyword];
                window.open(url, '_blank');

                const responseText = `¡Claro! Reproduciendo ${musicKeyword} para ti.`;
                const aiMessage: Message = {
                    id: crypto.randomUUID(),
                    text: responseText,
                    sender: 'ai' as const,
                };
                
                setMessages([userMessage, aiMessage]);
          
                try {
                    await speak(responseText);
                } catch(e) {
                    console.error("Speech failed to play.", e);
                }
                return;
            }
        }
      }
      
      const wakeWords = ['pisqai', 'biscay', 'viscay'];
  
      let command = cleanText;
      let isWakeWordOnly = false;
      
      for (const wakeWord of wakeWords) {
        if (cleanText === wakeWord) {
          isWakeWordOnly = true;
          break;
        }
        if (cleanText.startsWith(wakeWord + ' ')) {
          command = cleanText.substring(wakeWord.length).trim();
          break;
        }
      }
  
      if (isWakeWordOnly) {
        const responseText = "¡Sí, dime! ¿En qué puedo ayudarte?";
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          text: responseText,
          sender: 'ai' as const,
        };
        setMessages([userMessage, aiMessage]);
        
        try {
          await speak(responseText);
          setShouldListenAfterSpeaking(true);
        } catch(e) {
          console.error("Speech failed to play.", e);
        }
        return; // Stop processing
      }
      
      // If not just wake word, proceed as normal
      setAvatarStatus('thinking');
      await new Promise((res) => setTimeout(res, 1000));
      const responseText = getResponse(command);
  
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: responseText,
        sender: 'ai' as const,
      };
      
      setMessages([userMessage, aiMessage]);
  
      try {
        await speak(responseText);
      } catch(e) {
        console.error("Speech failed to play.", e);
      }
    },
    [avatarStatus, speak]
  );
  
  useEffect(() => {
    recognitionOnTranscriptRef.current = processAndRespond;
  }, [processAndRespond]);

  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onTranscript: (transcript) => recognitionOnTranscriptRef.current(transcript),
  });

  useEffect(() => {
    if (shouldListenAfterSpeaking && !isListening && avatarStatus === 'idle') {
      startListening();
      setShouldListenAfterSpeaking(false);
    }
  }, [shouldListenAfterSpeaking, isListening, startListening, avatarStatus]);

  useEffect(() => {
    if (avatarStatus !== 'speaking' && avatarStatus !== 'thinking') {
      setAvatarStatus(isListening ? 'listening' : 'idle');
    }
  }, [isListening, avatarStatus]);

  useEffect(() => {
    const styles = Array.from({ length: 30 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    }));
    setTwinkleStyles(styles);
  }, []);

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
