'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { VOICE_MODEL } from '@/ml-models/voice-model.js';
import { useToast } from '@/hooks/use-toast';

const responses: Record<string, string[]> = {
  hola: [
    '¡Hola! ¿Cómo estás?',
    '¡Hola! ¿Qué tal?',
    '¡Hola! Me alegra escucharte',
    '¡Hola amigo! ¿En qué puedo ayudarte?',
    '¡Hola! ¿Cómo te va el día?',
  ],
  adios: [
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
  si: ['Entendido', 'Muy bien', 'Perfecto'],
  no: ['Ok, como prefieras', 'Entiendo', 'Sin problema'],
};

function extractFeatures(dataArray: Uint8Array) {
  let sum = 0,
    max = 0,
    min = 255;
  let peaks = 0;
  let energy = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const value = dataArray[i];
    sum += value;
    energy += value * value;

    if (value > max) max = value;
    if (value < min) min = value;

    if (i > 0 && i < dataArray.length - 1) {
      if (
        value > dataArray[i - 1] &&
        value > dataArray[i + 1] &&
        value > 100
      ) {
        peaks++;
      }
    }
  }

  const mean = sum / dataArray.length;
  const range = max - min;

  const lowBand = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
  const midBand = dataArray.slice(32, 96).reduce((a, b) => a + b, 0) / 64;
  const highBand = dataArray.slice(96, 128).reduce((a, b) => a + b, 0) / 32;

  return {
    mean: parseFloat(mean.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    range: parseFloat(range.toFixed(2)),
    peaks: peaks,
    energy: parseFloat((energy / dataArray.length).toFixed(2)),
    lowBand: parseFloat(lowBand.toFixed(2)),
    midBand: parseFloat(midBand.toFixed(2)),
    highBand: parseFloat(highBand.toFixed(2)),
  };
}

function compareFeatures(
  features: ReturnType<typeof extractFeatures>,
  word: string
) {
  if (!VOICE_MODEL[word] || VOICE_MODEL[word].length === 0) return 0;

  let totalSimilarity = 0;
  const weights = {
    mean: 0.15,
    max: 0.1,
    range: 0.1,
    peaks: 0.15,
    energy: 0.15,
    lowBand: 0.15,
    midBand: 0.1,
    highBand: 0.1,
  };

  for (let trained of VOICE_MODEL[word]) {
    let similarity = 0;

    for (let key in weights) {
      const fKey = key as keyof typeof weights;
      const diff = Math.abs(features[fKey] - trained[fKey]);
      const maxVal = Math.max(features[fKey], trained[fKey], 1);
      const sim = 1 - diff / maxVal;
      similarity += sim * weights[fKey];
    }

    totalSimilarity += Math.max(0, similarity);
  }

  return totalSimilarity / VOICE_MODEL[word].length;
}

function detectWord(features: ReturnType<typeof extractFeatures>) {
  const similarities: Record<string, number> = {};

  Object.keys(VOICE_MODEL).forEach((word) => {
    similarities[word] = compareFeatures(features, word);
  });

  const threshold = 0.55;
  let maxSim = 0;
  let detectedWord = null;

  for (let word in similarities) {
    if (similarities[word] > maxSim && similarities[word] > threshold) {
      maxSim = similarities[word];
      detectedWord = word;
    }
  }

  return { word: detectedWord, confidence: maxSim, similarities };
}

export const useVoiceRecognition = (
  onWordDetected: (word: string, confidence: number) => void
) => {
  const [isListening, setIsListening] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastDetectionTimeRef = useRef(0);
  const { toast } = useToast();

  const stopListening = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsListening(false);
    setAnalyser(null);
    streamRef.current = null;
    microphoneRef.current = null;
    audioContextRef.current = null;
  }, []);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const newAnalyser = audioContext.createAnalyser();
      newAnalyser.fftSize = 256;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphoneRef.current = microphone;

      microphone.connect(newAnalyser);
      setAnalyser(newAnalyser);
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: 'destructive',
        title: 'Acceso al Micrófono Denegado',
        description:
          'Por favor, habilita los permisos de micrófono en tu navegador.',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (!isListening || !analyser) {
      return;
    }

    let animationFrameId: number;

    const detectVoice = () => {
      if (!analyser || !isListening) return;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      const features = extractFeatures(dataArray);

      if (
        features.mean > 25 &&
        Date.now() - lastDetectionTimeRef.current > 2500
      ) {
        const result = detectWord(features);

        if (result.word && result.word !== 'silencio') {
          lastDetectionTimeRef.current = Date.now();
          onWordDetected(result.word, result.confidence);
        }
      }

      if (isListening) {
        animationFrameId = requestAnimationFrame(detectVoice);
      }
    };

    detectVoice();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, analyser, onWordDetected]);

  return {
    isListening,
    startListening,
    stopListening,
    analyser,
    getResponse: (word: string) => {
      if (responses[word]) {
        const responseList = responses[word];
        return responseList[Math.floor(Math.random() * responseList.length)];
      }
      return `Detecté "${word}"`;
    },
  };
};
