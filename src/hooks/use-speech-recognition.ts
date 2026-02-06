'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type UseSpeechRecognitionProps = {
  onTranscript: (transcript: string) => void;
};

export const useSpeechRecognition = ({ onTranscript }: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);
  
  const startListening = useCallback(() => {
    if (recognitionRef.current || isListening) {
      return;
    }
    
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast({
        variant: 'destructive',
        title: 'Navegador no compatible',
        description: 'El reconocimiento de voz no es compatible con tu navegador.',
      });
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      if (transcript) {
        onTranscriptRef.current(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Error en reconocimiento de voz:', event.error);
      let description = "Ocurrió un error inesperado.";
      if (event.error === 'no-speech') {
        description = "No se detectó voz. Intenta de nuevo.";
      } else if (event.error === 'audio-capture') {
        description = "Problema al capturar audio. Revisa tu micrófono.";
      } else if (event.error === 'not-allowed') {
        description = "Permiso para micrófono denegado.";
      }
      
      toast({
          variant: "destructive",
          title: "Error de Reconocimiento",
          description
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  }, [isListening, toast]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    startListening,
    stopListening,
  };
};
