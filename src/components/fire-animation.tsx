'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type FireAnimationProps = {
  isSpeaking: boolean;
  className?: string;
  alwaysVisible?: boolean; // Nueva prop para mantener siempre visible
};

type Fire = {
  element: HTMLDivElement;
  baseWidth: number;
  baseHeight: number;
  baseX: number;
  baseY: number;
  angle: number;
  sizeFactor: number;
  positionRatio: number;
  oscillationSpeed: number;
  oscillationPhase: number;
  isActive: boolean;
};

const FireAnimation = ({ isSpeaking, className, alwaysVisible = true }: FireAnimationProps) => {
  const fireContainerRef = useRef<HTMLDivElement>(null);
  const firesRef = useRef<Fire[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const baseTimeRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar las llamas solo una vez
  const initializeFires = useRef(() => {
    const fireContainer = fireContainerRef.current;
    if (!fireContainer || isInitialized) return;

    let fireCount = 18; // Cantidad reducida para mejor rendimiento
    if (window.innerWidth < 768) {
        fireCount = 12;
    } else if (window.innerWidth < 480) {
        fireCount = 8;
    }

    fireContainer.innerHTML = '';
    firesRef.current = [];

    const centerX = fireContainer.offsetWidth / 2;
    const radius = Math.min(centerX * 1.2, 450);

    for (let i = 0; i < fireCount; i++) {
      const fireElement = document.createElement('div');
      
      const angleRange = Math.PI + 0.2;
      const startAngle = Math.PI - 0.1;
      const angle = startAngle + (i / (fireCount - 1)) * angleRange;

      const x = centerX + Math.cos(angle) * radius;
      const y = fireContainer.offsetHeight - 40;

      const distanceFromCenter = Math.abs(i - (fireCount - 1) / 2) / ((fireCount - 1) / 2);
      const sizeFactor = 0.4 + distanceFromCenter * 0.6;
      const width = 25 + sizeFactor * 60;
      const height = 40 + sizeFactor * 90;

      const positionRatio = i / (fireCount - 1);
      let background, boxShadow;

      if (positionRatio < 0.4) {
        background = 'radial-gradient(circle at 30% 20%, #00a8ff, #0097e6 40%, #0078b3 70%, #005a87)';
        boxShadow = '0 0 20px 8px rgba(0, 168, 255, 0.6)';
      } else if (positionRatio > 0.6) {
        background = 'radial-gradient(circle at 70% 20%, #9c88ff, #8c7ae6 40%, #7d5fff 70%, #6c5ce7)';
        boxShadow = '0 0 20px 8px rgba(156, 136, 255, 0.6)';
      } else {
        background = 'radial-gradient(circle at 50% 20%, rgba(100, 150, 255, 0.9), rgba(120, 100, 220, 0.8) 40%, rgba(140, 80, 200, 0.7) 70%, rgba(160, 60, 180, 0.6))';
        boxShadow = '0 0 25px 10px rgba(120, 100, 255, 0.7)';
      }

      fireElement.style.position = 'absolute';
      fireElement.style.borderRadius = '50% 50% 40% 40%';
      fireElement.style.filter = 'blur(6px)';
      fireElement.style.opacity = alwaysVisible ? '0.5' : '0';
      fireElement.style.transformOrigin = 'bottom center';
      fireElement.style.background = background;
      fireElement.style.boxShadow = boxShadow;
      fireElement.style.width = `${width}px`;
      fireElement.style.height = `${height}px`;
      fireElement.style.left = `${x - width / 2}px`;
      fireElement.style.bottom = '0';
      fireElement.style.transition = 'opacity 1s ease, filter 1s ease, transform 0.5s ease';

      firesRef.current.push({
        element: fireElement,
        baseWidth: width,
        baseHeight: height,
        baseX: x,
        baseY: y,
        angle: angle,
        sizeFactor: sizeFactor,
        positionRatio: positionRatio,
        oscillationSpeed: 0.8 + Math.random() * 0.4,
        oscillationPhase: Math.random() * Math.PI * 2,
        isActive: false,
      });

      fireContainer.appendChild(fireElement);
    }
    
    setIsInitialized(true);
  });

  const animateFires = () => {
    baseTimeRef.current += 0.03;

    firesRef.current.forEach((fire, index) => {
      if (!fire.isActive && !isSpeaking) {
        // Estado estático cuando no está hablando
        fire.element.style.opacity = alwaysVisible ? '0.4' : '0';
        fire.element.style.filter = 'blur(8px)';
        return;
      }

      const time = baseTimeRef.current;
      
      const energy1 = Math.sin(time * (6 + fire.sizeFactor * 2) + fire.oscillationPhase);
      const energy2 = Math.sin(time * 3 + index / 5);
      const randomJitter = (Math.random() - 0.5) * 0.3;

      let voiceEnergy = (energy1 * 0.6 + energy2 * 0.4 + 1) / 2;
      voiceEnergy = voiceEnergy * 0.9 + 0.1;
      voiceEnergy += randomJitter;
      voiceEnergy = Math.max(0.2, Math.min(1.3, voiceEnergy));

      const newHeight = fire.baseHeight * voiceEnergy * (1 + fire.sizeFactor * 0.2);
      const newWidth = fire.baseWidth * (voiceEnergy * 0.7 + 0.3);
      
      const verticalOscillation = (voiceEnergy - 0.5) * 20 * fire.sizeFactor;
      const horizontalOscillation = (Math.random() - 0.5) * 6;

      fire.element.style.height = `${newHeight}px`;
      fire.element.style.width = `${newWidth}px`;
      fire.element.style.left = `${fire.baseX - newWidth / 2 + horizontalOscillation}px`;
      fire.element.style.bottom = `${Math.max(0, verticalOscillation)}px`;

      const opacity = 0.7 + voiceEnergy * 0.3;
      const blur = 5 + (1 - voiceEnergy) * 6;

      fire.element.style.opacity = opacity.toString();
      fire.element.style.filter = `blur(${blur}px)`;
    });

    if (isSpeaking || firesRef.current.some(fire => fire.isActive)) {
      animationIdRef.current = requestAnimationFrame(animateFires);
    }
  };

  // Efecto para manejar el cambio de estado (hablando/no hablando)
  useEffect(() => {
    if (!isInitialized) {
      initializeFires.current();
    }

    // Activar/desactivar animación
    if (isSpeaking) {
      firesRef.current.forEach(fire => {
        fire.isActive = true;
        fire.element.style.opacity = '0.8';
      });
      
      if (!animationIdRef.current) {
        animateFires();
      }
    } else {
      // Transición suave a estado estático
      setTimeout(() => {
        firesRef.current.forEach(fire => {
          fire.isActive = false;
        });
        
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }
      }, 500); // Retraso para transición suave
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isSpeaking, isInitialized]);

  // Efecto para manejar resize (con debounce)
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setIsInitialized(false);
        initializeFires.current();
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Efecto inicial
  useEffect(() => {
    if (!isInitialized) {
      const timer = setTimeout(() => {
        initializeFires.current();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  return (
    <div
      className={cn(
        'absolute w-full transition-all duration-1000 pointer-events-none',
        alwaysVisible ? 'opacity-100' : isSpeaking ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      <div className="absolute bottom-0 w-full h-[120px] bg-gradient-to-t from-[#0A0E17]/60 to-transparent" />
      <div
        ref={fireContainerRef}
        className="absolute bottom-0 w-full h-[180px]"
      />
    </div>
  );
};

export default FireAnimation;
