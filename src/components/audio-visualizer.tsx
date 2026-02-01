'use client';

import { useRef, useEffect } from 'react';

type AudioVisualizerProps = {
  analyser: AnalyserNode | null;
  isListening: boolean;
};

export default function AudioVisualizer({
  analyser,
  isListening,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current || !isListening) return;

    const canvas = canvasRef.current;
    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationFrameId: number;

    const visualize = () => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      canvasContext.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const primaryColor = getComputedStyle(
          document.documentElement
        ).getPropertyValue('--primary');
        canvasContext.fillStyle = `hsl(${primaryColor})`;
        canvasContext.fillRect(
          x,
          canvas.height - barHeight,
          barWidth,
          barHeight
        );
        x += barWidth + 1;
      }

      animationFrameId = requestAnimationFrame(visualize);
    };

    visualize();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (canvasContext) {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [analyser, isListening]);

  return (
    <div className="w-full h-24">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
